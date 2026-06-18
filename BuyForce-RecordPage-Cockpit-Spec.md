# BuyForce — Opportunity Record Page "Deal Cockpit" Spec

Locked design for the opportunity record page. Goal: a process-driven cockpit that reuses the
opportunity-card design language (fonts, pills, deal-progress, valuation) with the extra room a
record page affords.

## Locked decisions
- **Sidebar (sticky, right column):** Deal summary + Next action + Comments. (No quick-input pad —
  each process section already holds its own fields; a separate pad would duplicate and drift.)
- **Process sections (main column):** Completed steps collapse to their title; the current step and
  all upcoming steps stay expanded. (Shows what's left, hides what's done.)
- **Valuation must be always visible:** price/valuation + competition + equity live in both the
  header strip (top) and the sticky sidebar summary.

## Page anatomy (top -> bottom)
1. **Header band** (full width) — card-style top: vehicle title, VIN + copy, flame score, mileage,
   color, drive time / distance, seller, listed-ago, location, stage chip, Visit Listing + stage CTA.
2. **Valuation strip** (full width, under header) — Price & Valuation (Asking / ACV / Offer),
   Competition (CarMax / Carvana + Beats pill), Equity (amount + status), Accident pill.
3. **Big deal-progress bar** (full width) — the 9 milestones as a large stepper:
   Obtain VIN, Competing values, Create Appraisal, Finalize appraisal, Generate offer,
   Send offer, Follow up, Schedule Appt, Buy. Clicking a step jumps to its section.
4. **Two columns:**
   - **Main** — process-step sections (below).
   - **Sidebar (sticky)** — Summary + Next action + Comments.

## Process-step sections (main column) + their fields
1. **VIN & Vehicle** — VIN, Year, Make, Model, Trim, Drivetrain, Body Style, Mileage, Exterior Color.
   (Decode / Re-decode / Confirm — our code.)
2. **Competing Values** — CarMax Offer, Carvana Offer. (Get CarMax / Get Carvana — our code.)
3. **Condition & Appraisal Notes** — Condition Notes, Listing Link, Notes for Appraisal (computed).
   (Copy Notes for Appraisal — our code.)
4. **Offer Sheet** — Accident History, Number of Competing Vehicles, Est Dealer Days to Sale,
   Est Private Party Retail Value, Offer Sheet Status, Offer Sheet Image URL, Offer Sheet Generated
   Date. (Generate / View / Copy / Share — our code.)
5. **Send Offer & Follow-up** — Offer Status, Last Follow Up At.
   (Send offer, AI objection/reply assistant from FB Marketplace transcripts, Request appraisal
   review — our code + n8n.)
6. **Schedule & Confirm Appt** — Appointment date/time, Vehicle Location Address.
   (Schedule, Appt-in countdown, day-before confirmation — our code.)
7. **Outcome & Payoff** — Title in Hand, Actual Payoff Amount, Payoff Good Thru Date, Payoff Daily
   Per Diem, Payoff Lender, Payoff address fields. (Appt shown? / Did-not-buy follow-up — our code.)

## Sidebar (sticky)
- **Summary:** Offer (large), Equity, CarMax / Carvana, Beats pill, Accident pill.
- **Next action:** stage-driven prompt + primary CTA.
- **Comments:** Noloco native comments component placed in this column.

## Build split + phases
- **P1 — Builder (Michael):** create the 7 sections with the fields above; create the right column;
  drop Noloco Comments into it; remove the orphaned empty "Equity" highlight (top-left); fix the
  "Model" card that shows the year; rename or remove the "Action #1" placeholder button; collapse
  "Complete Opportunity Info" by default (catch-all).
- **P2 — Code (Claude):** header band + valuation strip (reuses card data via the matching board card).
- **P3 — Code:** big deal-progress bar.
- **P4 — Code/CSS:** section collapse-by-stage (completed collapsed, current + upcoming open) +
  step-status dots + card-matching styling.
- **P5 — Code:** sticky sidebar Summary + Next action.
- **P6 — Code + n8n:** AI follow-up / objection assistant trained on FB Marketplace transcripts
  (ties to backlog task #34).

## Notes / gotchas
- Do NOT reflow `record-view-body` into flex columns via JS — React tears it out (the rail flashed
  then dropped). Use Noloco native columns for layout; our code only adds robust, additive blocks
  (header band, progress bar) and styles native structure.
- Record-page field values are read from the matching board card (`[data-testid="collection-record"]`
  with the record uuid in its href) via `bfReadF()` — reliable as long as the board has loaded.
