/* BuyForce OCR offscreen runner. Lazily spins up a Tesseract worker (all assets
 * bundled in /vendor) and recognizes VIN/plate crops. The image never leaves the
 * device - this document is part of the extension, not any web page. */
(function () {
  var worker = null, initing = null;

  function getWorker() {
    if (worker) return Promise.resolve(worker);
    if (initing) return initing;
    initing = Tesseract.createWorker('eng', 1, {
      workerPath: chrome.runtime.getURL('vendor/worker.min.js'),
      corePath: chrome.runtime.getURL('vendor/'),
      langPath: chrome.runtime.getURL('vendor/'),
      workerBlobURL: false,
      gzip: true
    }).then(function (w) { worker = w; return w; });
    return initing;
  }

  var VIN_WL = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  var PLATE_WL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ';

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (!msg || msg.type !== 'BF_OCR_RUN' || !msg.image) return;
    (async function () {
      try {
        var w = await getWorker();
        await w.setParameters({ tessedit_char_whitelist: msg.hint === 'plate' ? PLATE_WL : (msg.hint === 'vin' ? VIN_WL : '') });
        var res = await w.recognize(msg.image);
        sendResponse({ ok: true, text: (res && res.data && res.data.text) || '' });
      } catch (e) {
        sendResponse({ ok: false, reason: String((e && e.message) || e) });
      }
    })();
    return true;
  });
})();
