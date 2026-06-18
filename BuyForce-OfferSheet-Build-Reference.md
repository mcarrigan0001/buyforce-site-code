# BuyForce — Offer Sheet Build Reference

Source-of-truth notes for rebuilding the offer-sheet generator in **n8n** (Noloco-driven), replacing the old HighLevel → APITemplate flow.

## Noloco fields to add / verify (full spec)

### DEALERSHIP collection — ADD (new)
| Field | Type | Format / settings | API name | Used for |
|---|---|---|---|---|
| Sales Tax Rate | Number | whole percent, e.g. `7` (means 7%), NOT 0.07; decimals allowed | `salesTaxRate` | trade-in value calc + `tax_rate_display` "7%" |
| Dealer Logo | URL (Text) **or** File(Image) | pick ONE approach for all 3 images (below) | `dealerLogoUrl` / `dealerLogo` | APITemplate element `dealerLogoURL` |
| Dealer Rep Image | URL (Text) **or** File(Image) | same approach | `dealerRepImageUrl` / `dealerRepImage` | APITemplate rep image element (name TBD) |
| Dealer Why Sell Image | URL (Text) **or** File(Image) | same approach | `dealerWhySellImageUrl` / `dealerWhySellImage` | APITemplate why-sell element (name TBD) |

Image approach — choose one for all three:
- **Recommended: URL (Text)** — paste a public link (host on GitHub Pages `/dealers/`, Cloudinary, or HighLevel media). Always fetchable by APITemplate.
- **File (Image, single file)** — only if the incognito test showed Noloco file URLs are public/permanent.

### OPPORTUNITY collection — VERIFY exist (card already writes them); create if missing
| Field | Type | API name |
|---|---|---|
| Offer Amount | Number/Currency | `offerAmount` |
| CarMax Offer | Number | `carMaxOffer` |
| Carvana Offer | Number | `carvanaOffer` |
| Est Private Party Retail Value | Number | `estPrivatePartyRetailValue` |
| # Competing Vehicles | Number | `numberOfCompetingVehicles` |
| Est Dealer Days to Sale | Number | `estDealerDaysToSale` |
| Accident History | Single Option (Clean / Accident(s)) | `accidentHistory` |
| Mileage, Year, Make, Model, Trim, First Name, Last Name | (exist) | mileage/year/make/model/trim/firstName/lastName |
| Offer Sheet Image URL | Text/URL (write-back target) | `offerSheetImageUrl` |
| Offer Sheet Status | Single Option (Generating/Generated/Sent) — optional | `offerSheetStatus` |
These must be FILLED on the deal (Appraisal Complete stage) before generating, or they render blank/0.

### RELATIONSHIPS
- **Opportunity → Dealership** (Many-to-One): ALREADY EXISTS. The workflow reads `dealership.salesTaxRate` + dealer images through this link automatically. No new relationship needed. (Settings already set: Link to another record = Dealership; "Allow linking to multiple records?" OFF on the opportunity side.)
- No new relationships required.
- OPTIONAL: Lookup fields on Opportunity (pull tax rate/images through the link) only if you want them visible on the opportunity record/card — not needed for generation.

## Trigger / flow (new)
Noloco card "Generate Offer Sheet" → existing webhook `…/ee9245fa` → n8n:
1. Fetch the opportunity by `uuid` (+ follow the **Dealership** relationship for dealer name + image URLs).
2. **Code node** = the transform below (ported from HighLevel), fed by Noloco fields instead of HighLevel mapped properties.
3. Decide variation (CarMax / Carvana / Both / None) → pick the matching **APITemplate template_id** (4 separate templates; 1 ready).
4. POST to `https://rest.apitemplate.io/v2/create-image?template_id=…` (header auth `X-API-KEY`, body = transform output + dealer fields).
5. Write returned image URL back to Noloco (`Offer Sheet Image URL`, status).

## APITemplate header (Jinja, in template)
`FAST CASH - {{ fast_cash_dealerName | upper }} OFFER`
→ n8n sends `fast_cash_dealerName` in **normal casing** (e.g. "Ferman Chevrolet"); the template's `| upper` filter uppercases it. It's a top-level `{{ }}` merge field, not an element override.

## Old HighLevel pre-webhook custom code (verbatim — port to n8n Code node)
```javascript
// INPUTS — from mapped properties
var offer      = Number(inputData.offer_amount) || 0;
var retail     = Number(inputData.retail_market_value) || 0;
var taxRate    = Number(inputData.local_sales_tax_rate) || 0;   // percent, e.g. 7
var miles      = Number(inputData.vehicle_mileage) || 0;
var carmax     = Number(inputData.carmax_offer) || 0;
var carvana    = Number(inputData.carvana_offer) || 0;
var year       = inputData.vehicle_year || "";
var make       = inputData.vehicle_make || "";
var model      = inputData.vehicle_model || "";
var trim       = inputData.vehicle_trim || "";
var accident   = inputData.accident_history || "";
var competing  = inputData.competing_vehicles || "";
var daysToSale = inputData.dealer_days_to_sale || "";
var firstName  = inputData.first_name || "";
var lastName   = inputData.last_name || "";
var voucherNo  = inputData.voucher_number || "";
// CARFAX ICONS
var CLEAN_URL    = "https://assets.cdn.filesafe.space/MNFULEQNWAlu025pP1VI/media/6a275256f607d4002bd7cf8c.png";
var ACCIDENT_URL = "https://assets.cdn.filesafe.space/MNFULEQNWAlu025pP1VI/media/6a275256fc95b24549cd39e1.png";
// HELPERS
function usd(n){ return "$" + Math.round(n).toLocaleString("en-US"); }
function usd2(n){ return "$" + Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function eDate(d){ return d.toLocaleDateString("en-US",{timeZone:"America/New_York",month:"numeric",day:"numeric",year:"2-digit"}); }
function amountToCheckWords(amount){
  amount = Math.round(amount*100)/100;
  var dollars = Math.floor(amount), cents = Math.round((amount-dollars)*100);
  var ones=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  var tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  function u(n){var w='';if(n>=100){w+=ones[Math.floor(n/100)]+' hundred';n%=100;if(n)w+=' ';}
    if(n>=20){w+=tens[Math.floor(n/10)];n%=10;if(n)w+='-'+ones[n];}else if(n>0){w+=ones[n];}return w;}
  var d='',t=Math.floor(dollars/1000),r=dollars%1000;
  if(t>0){d+=u(t)+' thousand';if(r)d+=' ';}
  if(r>0){d+=u(r);}
  if(dollars===0)d='zero';
  d=d.charAt(0).toUpperCase()+d.slice(1);
  return d+' and '+(cents<10?'0':'')+cents+'/100 Dollars';
}
// COMPUTE
var now = new Date();
var exp = new Date(now.getTime() + 5*24*60*60*1000);
var low = Math.round(retail * 0.9);
return {
  vehicle_title:       [year, make, model, trim].filter(Boolean).join(" "),
  mileage_display:     miles.toLocaleString("en-US") + " MILES",
  mileage_limit:       (miles + 150).toLocaleString("en-US"),
  offer_amount:        usd2(offer),
  offer_amount_raw:    offer,
  trade_in_value:      usd(Math.round(offer * (1 + taxRate/100))),
  tax_rate_display:    String(taxRate),
  carmax_offer:        usd(carmax),
  carvana_offer:       usd(carvana),
  sell_yourself_range: usd(low) + " - " + usd(retail),
  check_amount_words:  amountToCheckWords(offer),
  offer_date:          eDate(now),
  expire_date:         eDate(exp),
  accident_history:    accident,
  accident_icon_url:   (accident === "Clean") ? CLEAN_URL : ACCIDENT_URL,
  competing_vehicles:  competing,
  dealer_days_to_sale: daysToSale,
  seller_name:         (firstName + " " + lastName).trim(),
  voucher_number:      voucherNo
};
```

## Input mapping: HighLevel `inputData` → Noloco field (for the n8n build)
| transform input | Noloco source (opportunity unless noted) |
|---|---|
| offer_amount | Offer Amount |
| retail_market_value | Est Private Party Retail Value |
| local_sales_tax_rate | **Dealership** field — name it "Sales Tax Rate" → API `salesTaxRate`; read via the dealership relationship (`dealership.salesTaxRate`) |
| vehicle_mileage | mileage (confirm field name) |
| carmax_offer | CarMax Offer |
| carvana_offer | Carvana Offer |
| vehicle_year / make / model / trim | decoded YMMT fields (confirm names) |
| accident_history | Accident History (values "Clean" / "Accident(s)") |
| competing_vehicles | # Competing Vehicles |
| dealer_days_to_sale | Est Dealer Days to Sale |
| first_name / last_name | seller first/last (Seller Name split, or firstName/lastName) |
| voucher_number | DROPPED — not used (per Michael) |
| fast_cash_dealerName | **Dealership** name (normal case) — NEW |
| dealer image URLs (logo/banner/etc.) | **Dealership** URL fields — NEW (image overrides) |

## Output merge fields produced (→ APITemplate)
vehicle_title, mileage_display, mileage_limit, offer_amount, offer_amount_raw, trade_in_value, tax_rate_display, carmax_offer, carvana_offer, sell_yourself_range, check_amount_words, offer_date, expire_date, accident_history, accident_icon_url, competing_vehicles, dealer_days_to_sale, seller_name, voucher_number — **plus** `fast_cash_dealerName` and the dealer image URLs.

## Business logic captured (don't lose these)
- Offer **expires 5 days** after generation (`exp = now + 5 days`).
- `mileage_limit` = current miles **+ 150** (offer void if driven past this).
- `trade_in_value` = offer × (1 + taxRate/100), rounded — the "trade-in tax-savings equivalent."
- `sell_yourself_range` = **90%–100% of retail** (retail × 0.9 to retail).
- `check_amount_words` = offer written out as a check amount ("… and xx/100 Dollars").
- Dates formatted America/New_York, M/D/YY.
- CarFax icon swaps on `accident === "Clean"` (HighLevel media URLs above are public — reusable).

## ✅ Confirmed Noloco API field names (from a live opportunity record, exec 402)
Top-level on the opportunity: `acv`, `askingPrice`, `carMaxOffer`, `carvanaOffer`, `mileage`, `year`, `make`, `model`, `trim`, `vin`, `firstName`, `lastName`, `sellerName` (formula), `vehicleTitle`, `exteriorColor`, `listingLocation`, `status` (enum e.g. `FRESH_LEADS`), `distanceToListing`, `driveTimeToListing`, `estEquityPosition`, `equityStatus`, `equityDisplay`, `dealershipName` (lookup), `dealershipAddress` (lookup), and `dealership` (nested linked record: `dealership.id`, `dealership.dealershipName`, `dealership.dealershipAddress`, `dealership.market`, `dealership.dealerGroupId`, …).
Empty-on-test-record but confirmed via our card write-keys: `offerAmount`, `accidentHistory` (values `Clean` / `ACCIDENTS`), `numberOfCompetingVehicles`, `estDealerDaysToSale`, `estPrivatePartyRetailValue`, `conditionNotes`, `sellerWillTake`.
Note: Noloco omits empty fields from the API response, so the Code node must null-coalesce every input (the `Number(x)||0` / `x||""` pattern already does this).

## n8n-ready Code node (converted from the HighLevel code — real Noloco field names)
Place AFTER the Noloco "Get Opportunity" node (one opportunity at `$json`, its linked dealership at `$json.dealership`). Run mode: "Run Once for Each Item" (or all-items; reads `$input.first()`).
```javascript
// Offer-sheet data transform — Noloco -> APITemplate merge fields
const o = $input.first().json;          // opportunity record
const d = o.dealership || {};           // linked dealership (nested)

// INPUTS (Noloco API field names)
const offer      = Number(o.offerAmount) || 0;
const retail     = Number(o.estPrivatePartyRetailValue) || 0;
const taxRate    = Number(d.salesTaxRate) || 0;            // NEW Dealership field "Sales Tax Rate"
const miles      = Number(o.mileage) || 0;
const carmax     = Number(o.carMaxOffer) || 0;
const carvana    = Number(o.carvanaOffer) || 0;
const year       = o.year || "";
const make       = o.make || "";
const model      = o.model || "";
const trim       = o.trim || "";
const accident   = o.accidentHistory || "";
const competing  = o.numberOfCompetingVehicles || "";
const daysToSale = o.estDealerDaysToSale || "";
const firstName  = o.firstName || "";
const lastName   = o.lastName || "";
const dealerName = o.dealershipName || d.dealershipName || "";   // -> fast_cash_dealerName (normal case)
const logoUrl    = d.logoUrl || "";                              // NEW Dealership URL field(s); add more as needed

// CARFAX ICONS (public HighLevel media URLs — still reachable by APITemplate)
const CLEAN_URL    = "https://assets.cdn.filesafe.space/MNFULEQNWAlu025pP1VI/media/6a275256f607d4002bd7cf8c.png";
const ACCIDENT_URL = "https://assets.cdn.filesafe.space/MNFULEQNWAlu025pP1VI/media/6a275256fc95b24549cd39e1.png";

// HELPERS (unchanged)
function usd(n){ return "$" + Math.round(n).toLocaleString("en-US"); }
function usd2(n){ return "$" + Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function eDate(dt){ return dt.toLocaleDateString("en-US",{timeZone:"America/New_York",month:"numeric",day:"numeric",year:"2-digit"}); }
function amountToCheckWords(amount){
  amount = Math.round(amount*100)/100;
  let dollars = Math.floor(amount), cents = Math.round((amount-dollars)*100);
  const ones=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  function u(n){let w='';if(n>=100){w+=ones[Math.floor(n/100)]+' hundred';n%=100;if(n)w+=' ';}
    if(n>=20){w+=tens[Math.floor(n/10)];n%=10;if(n)w+='-'+ones[n];}else if(n>0){w+=ones[n];}return w;}
  let str='',t=Math.floor(dollars/1000),r=dollars%1000;
  if(t>0){str+=u(t)+' thousand';if(r)str+=' ';}
  if(r>0){str+=u(r);}
  if(dollars===0)str='zero';
  str=str.charAt(0).toUpperCase()+str.slice(1);
  return str+' and '+(cents<10?'0':'')+cents+'/100 Dollars';
}

// COMPUTE
const now = new Date();
const exp = new Date(now.getTime() + 5*24*60*60*1000);
const low = Math.round(retail * 0.9);
const isClean = String(accident).toLowerCase().includes("clean");

return [{ json: {
  fast_cash_dealerName: dealerName,                                  // template uppercases via | upper
  vehicle_title:       [year, make, model, trim].filter(Boolean).join(" "),
  mileage_display:     miles.toLocaleString("en-US"