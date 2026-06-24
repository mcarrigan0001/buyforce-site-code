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

  function preprocess(dataUrl) {
    return new Promise(function (resolve) {
      try {
        var img = new Image();
        img.onload = function () {
          try {
            var scale = Math.max(1, Math.min(4, 1000 / Math.max(1, img.width)));
            var w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
            var c = document.createElement('canvas'); c.width = w; c.height = h;
            var ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
            var id = ctx.getImageData(0, 0, w, h), px = id.data;
            for (var i = 0; i < px.length; i += 4) { var g = 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2]; g = (g - 128) * 1.5 + 140; g = g < 0 ? 0 : (g > 255 ? 255 : g); px[i] = px[i + 1] = px[i + 2] = g; }
            ctx.putImageData(id, 0, 0);
            resolve(c);
          } catch (e) { resolve(dataUrl); }
        };
        img.onerror = function () { resolve(dataUrl); };
        img.src = dataUrl;
      } catch (e) { resolve(dataUrl); }
    });
  }

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (!msg || msg.type !== 'BF_OCR_RUN' || !msg.image) return;
    (async function () {
      try {
        var w = await getWorker();
        await w.setParameters({ tessedit_char_whitelist: msg.hint === 'plate' ? PLATE_WL : (msg.hint === 'vin' ? VIN_WL : ''), tessedit_pageseg_mode: '7' });
        var src = await preprocess(msg.image);
        var res = await w.recognize(src);
        sendResponse({ ok: true, text: (res && res.data && res.data.text) || '' });
      } catch (e) {
        sendResponse({ ok: false, reason: String((e && e.message) || e) });
      }
    })();
    return true;
  });
})();
