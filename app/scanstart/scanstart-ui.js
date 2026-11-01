/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scanstart-ui.js — cc-scanstart's dialog: "Start from a scan" (Super 0.1, Layout). A sheet that came in on paper — a recorded plat,
 * an old survey, a grading plan, a deed sketch, a marked-up print — becomes the project's starting point: placed to scale or on
 * known coordinates under the plan, and (if asked) traced into linework. Host-neutral: a host passes what it has (below) and
 * gets back a picture, where it goes and the traced layer; the host decides what those become. Canonical in lib/scanstart
 * (tools/scanstart/sync.mjs copies it, with place.js, beside the host's raster/ and photosketch/ copies).
 *
 * The firm's way in: the office scanner's scan-to-folder or scan-to-email file (PDF, TIFF — Group 4 too — PNG, JPEG), or a phone
 * photo of the sheet (the sheet is found and seen straight on). Several pages: pick one. Nothing leaves the computer; no trained
 * model, no network (the scan rule).
 *
 *   await scanStart(host, input?) → result | null
 *     input = a File (a photo, PDF or scan someone saved), or { name, blobs: [Blob], source } (pages from a scanner), or nothing:
 *     then the Scan chooser asks where the sheet comes from — a scanner (Studio on a computer: host.scanners), a photo (the
 *     device's camera), or a file
 *     host = { el(tag, props, ...kids), t(key, vars), root, say(text), busy(text), units ('ft'|'m'|…), points?() → [{ n, x, y }],
 *              decodeJpeg?(bytes) → img, pdf?: { pages(bytes) → n, render(bytes, pageIndex, dpi) → img(RGBA) }, sha256?(bytes) → hex,
 *              scanners?: { browse(ms) → [{ id, name, rs, … }], request(id, method, path, body) → { status, headers, body } } }
 *     result = { name, blob (PNG or JPEG of the sheet as placed), w, h, gt, layers ([] or the drawing: a line layer), record, placed, fit }
 *     Converting into a drawing is on by default; a host can also convert later (convert.js) — a scan is a workflow item the
 *     drafter keeps as a reference or removes once the drawing is made (scans-ui.js).
 *
 * Words are host keys `scanin.*` (tools/scanstart/lang.mjs writes them into each host's lang/en.json).
 */
import { readScan, scanPages, sniffScan, toGrey, threshold, findSkew, rotateImage, MAX_TRACE_PIXELS } from '../raster/index.js';
import { findSheet, unwarpSheet } from '../photosketch/photosketch.js';
import { scaleFromTwo, scaleFromStated, gtFromScale, fitPoints, record } from './place.js';
import { convertImage } from './convert.js';
import { scan as esclScan } from './escl.js';

export const MAX_SIDE = 7000;          // the sheet is worked at no more than this many pixels a side (≈ 23 in at 300 dpi)
export const MAX_BLOB = 24 * 1048576;  // what a host keeps with the project (CivilCraft: 25 MB a picture)
const PDF_DPI = 200;
const FILE_ACCEPT = '.pdf,.tif,.tiff,.png,.jpg,.jpeg';

const isPdf = (b) => b.length > 8 && new TextDecoder('latin1').decode(b.subarray(0, 1024)).includes('%PDF-');

/** RGBA or grey or RGB → RGB or grey (cc-raster's toGrey reads 1 or 3 channels). */
function noAlpha(img) {
  if (img.channels !== 4) return img;
  const n = img.w * img.h, out = new Uint8Array(n * 3);
  for (let i = 0; i < n; i++) { const a = img.data[i * 4 + 3] / 255; for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(img.data[i * 4 + c] * a + 255 * (1 - a)); }
  return { ...img, channels: 3, data: out };
}
/** Box-shrink so the long side is ≤ max. → { img, k } (k = old pixels per new pixel). */
export function shrink(img, max = MAX_SIDE) {
  const k = Math.ceil(Math.max(img.w, img.h) / max);
  if (k <= 1) return { img, k: 1 };
  const ch = img.channels, w = Math.floor(img.w / k), h = Math.floor(img.h / k), out = new Uint8Array(w * h * ch);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let c = 0; c < ch; c++) {
    let s = 0;
    for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) s += img.data[((y * k + j) * img.w + x * k + i) * ch + c];
    out[(y * w + x) * ch + c] = Math.round(s / (k * k));
  }
  return { img: { ...img, w, h, data: out, dpi: img.dpi ? { x: img.dpi.x / k, y: img.dpi.y / k } : img.dpi }, k };
}
function toRgba(img) {
  const n = img.w * img.h, out = new Uint8ClampedArray(n * 4), ch = img.channels;
  for (let i = 0; i < n; i++) {
    if (ch === 1) { const v = img.data[i]; out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = v; }
    else { out[i * 4] = img.data[i * ch]; out[i * 4 + 1] = img.data[i * ch + 1]; out[i * 4 + 2] = img.data[i * ch + 2]; }
    out[i * 4 + 3] = 255;
  }
  return out;
}
async function encode(img, png) {
  const cv = new OffscreenCanvas(img.w, img.h);
  cv.getContext('2d').putImageData(new ImageData(toRgba(img), img.w, img.h), 0, 0);
  return cv.convertToBlob(png ? { type: 'image/png' } : { type: 'image/jpeg', quality: 0.88 });
}

export async function scanStart(host, input = null) {
  const { el, t } = host;
  if (!input) input = await chooseSource(host);
  if (!input) return null;
  const source = input instanceof Blob ? (input.ccSource || 'file') : input.source || 'scanner';
  const file = input instanceof Blob ? input : { name: input.name };
  const blobs = input instanceof Blob ? [input] : input.blobs || [];
  // every page of every blob, in order: a PDF's pages, a TIFF's pages, one for a PNG or JPEG
  const parts = [];
  for (const b of blobs) {
    const bytes = new Uint8Array(await b.arrayBuffer());
    const pdf = isPdf(bytes);
    if (!pdf && !sniffScan(bytes)) { host.say(t('scanin.err.kind', { file: file.name })); return null; }
    if (pdf && !host.pdf) { host.say(t('scanin.err.pdf', { file: file.name })); return null; }
    let n = 1;
    try { n = pdf ? await host.pdf.pages(bytes) : scanPages(bytes); } catch (e) { host.say(t('scanin.err.read', { file: file.name, why: e.message })); return null; }
    for (let i = 0; i < n && parts.length < 200; i++) parts.push({ bytes, pdf, index: i });
  }
  if (!parts.length) return null;
  const pages = parts.length;

  // ---- the sheet, as read and as straightened ----------------------------------------------------------------
  let raw = null, rawK = 1, page = 0, readErr = '';
  async function readPage(n) {
    host.busy(t('scanin.reading', { file: file.name }));
    try {
      const { bytes, pdf, index } = parts[n];
      let img = pdf ? await host.pdf.render(bytes, index, PDF_DPI) : await readScan(bytes, index, { decodeJpeg: host.decodeJpeg });
      if (pdf) img = { ...img, dpi: img.dpi?.x ? img.dpi : { x: PDF_DPI, y: PDF_DPI } };   // the host says when it drew a big sheet at less
      const s = shrink(noAlpha(img));
      raw = { ...s.img, format: pdf ? 'pdf' : img.format };
      rawK = s.k; readErr = '';
    } catch (e) { raw = null; readErr = t('scanin.err.read', { file: file.name, why: e?.key ? t('scanin.why.' + e.key) : String(e?.message || e) }); }
    finally { host.busy(''); }
  }
  await readPage(0);
  if (!raw) { host.say(readErr); return null; }

  return new Promise((done) => {
    let kind = source === 'camera' || (source === 'file' && raw.format === 'jpeg' && !raw.dpi) ? 'photo' : 'scan';
    let straighten = true, skew = null, corners = null, sheet = raw, mode = 'two';
    const clicks = { two: [], pts: [] };   // pixel points on `sheet`
    let result = null;

    // ---- controls ----
    const uid = Math.random().toString(36).slice(2, 8);
    const pageSel = el('select', { className: 'cv-select', id: 'ss-page-' + uid, 'data-scanin-page': '' }, ...Array.from({ length: Math.min(pages, 200) }, (_, i) => el('option', { value: String(i) }, t('scanin.page.n', { n: i + 1, of: pages }))));
    const kindSel = el('select', { className: 'cv-select', id: 'ss-kind-' + uid, 'data-scanin-kind': '' },
      el('option', { value: 'scan' }, t('scanin.kind.scan')), el('option', { value: 'photo' }, t('scanin.kind.photo')));
    const straightBox = el('input', { type: 'checkbox', checked: true, 'data-scanin-straight': '' });
    const straightNote = el('span', { 'data-scanin-straight-note': '' });
    const modeBox = el('div', { className: 'cv-seg', role: 'radiogroup', 'aria-label': t('scanin.place.head'), 'data-scanin-mode': '' });
    const MODES = [['two', t('scanin.mode.two')], ['stated', t('scanin.mode.stated')], ['pts', t('scanin.mode.points')]];
    const modeBtns = MODES.map(([k, label]) => { const b = el('button', { type: 'button', className: 'btn-line btn-sm-cc', role: 'radio', 'data-scanin-mode-btn': k }, label); b.onclick = () => { mode = k; render(); }; return b; });
    modeBox.append(...modeBtns);
    const unit = host.units || 'ft';
    const num = (props) => el('input', { type: 'number', step: 'any', className: 'cv-input', ...props });
    const distIn = num({ id: 'ss-dist-' + uid, min: '0', 'data-scanin-dist': '' });
    const oxIn = num({ id: 'ss-ox-' + uid, value: '0', 'data-scanin-ox': '' }), oyIn = num({ id: 'ss-oy-' + uid, value: '0', 'data-scanin-oy': '' });
    const dpiIn = num({ id: 'ss-dpi-' + uid, min: '1', 'data-scanin-dpi': '' });
    const statedKind = el('select', { className: 'cv-select', id: 'ss-sk-' + uid, 'data-scanin-stated-kind': '' },
      el('option', { value: 'per' }, t('scanin.stated.per', { unit })), el('option', { value: 'ratio' }, t('scanin.stated.ratio')));
    const statedIn = num({ id: 'ss-sv-' + uid, min: '0', 'data-scanin-stated': '' });
    const stretchBox = el('input', { type: 'checkbox', 'data-scanin-stretch': '' });
    const ptsBody = el('tbody', {});
    const traceBox = el('input', { type: 'checkbox', checked: true, 'data-scanin-trace': '' });
    const tolIn = num({ id: 'ss-tol-' + uid, min: '0.5', value: '1.5', 'data-scanin-tol': '' });
    const what = el('p', { className: 'cv-note', 'data-scanin-what': '', 'aria-live': 'polite' });
    const help = el('p', { className: 'cv-note', 'data-scanin-help': '' });
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-scanin-go': '' }, t('scanin.go'));

    // ---- preview: wheel zooms about the pointer, drag pans, a click without a drag picks ----
    const cv = el('canvas', { className: 'cv-scanin-view', width: 720, height: 460, tabIndex: 0, 'aria-label': t('scanin.view.label'), 'data-scanin-view': '' });
    cv.style.cssText = 'width:100%;max-width:720px;aspect-ratio:720/460;border:1px solid var(--cc-line,#999);touch-action:none;cursor:crosshair;background:#fff';
    let bmp = null, view = { s: 1, x: 0, y: 0 };
    async function makeBitmap() {
      bmp?.close?.();
      const oc = new OffscreenCanvas(sheet.w, sheet.h);
      oc.getContext('2d').putImageData(new ImageData(toRgba(sheet), sheet.w, sheet.h), 0, 0);
      bmp = oc.transferToImageBitmap();
      const s = Math.min(cv.width / sheet.w, cv.height / sheet.h);
      view = { s, x: (cv.width - sheet.w * s) / 2, y: (cv.height - sheet.h * s) / 2 };
    }
    const toPx = (e) => { const r = cv.getBoundingClientRect(), cx = (e.clientX - r.left) * cv.width / r.width, cy = (e.clientY - r.top) * cv.height / r.height; return { x: (cx - view.x) / view.s, y: (cy - view.y) / view.s, cx, cy }; };
    function paint() {
      const c = cv.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#e8e8e8'; c.fillRect(0, 0, cv.width, cv.height);
      if (bmp) { c.imageSmoothingEnabled = view.s < 2; c.drawImage(bmp, view.x, view.y, sheet.w * view.s, sheet.h * view.s); }
      const list = mode === 'two' ? clicks.two : mode === 'pts' ? clicks.pts : [];
      list.forEach((p, i) => {
        const x = view.x + p.x * view.s, y = view.y + p.y * view.s;
        c.strokeStyle = '#d0021b'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x + 9, y); c.moveTo(x, y - 9); c.lineTo(x, y + 9); c.stroke();
        c.fillStyle = '#d0021b'; c.font = '13px sans-serif'; c.fillText(String(i + 1), x + 6, y - 6);
      });
      if (mode === 'two' && clicks.two.length === 2) {
        const [a, b] = clicks.two; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(view.x + a.x * view.s, view.y + a.y * view.s); c.lineTo(view.x + b.x * view.s, view.y + b.y * view.s); c.stroke(); c.setLineDash([]);
      }
    }
    let drag = null;
    cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const r = cv.getBoundingClientRect(), dx = (e.clientX - drag.x) * cv.width / r.width, dy = (e.clientY - drag.y) * cv.height / r.height;
      if (Math.hypot(dx, dy) > 4) drag.moved = true;
      if (drag.moved) { view.x = drag.vx + dx; view.y = drag.vy + dy; paint(); }
    });
    cv.addEventListener('pointerup', (e) => {
      const d = drag; drag = null;
      if (!d || d.moved) return;
      const p = toPx(e);
      if (p.x < 0 || p.y < 0 || p.x > sheet.w || p.y > sheet.h) return;
      if (mode === 'two') { if (clicks.two.length >= 2) clicks.two = []; clicks.two.push({ x: p.x, y: p.y }); }
      else if (mode === 'pts') { if (clicks.pts.length < 12) clicks.pts.push({ x: p.x, y: p.y, X: '', Y: '', n: '' }); }
      else return;
      render();
    });
    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      const p = toPx(e), f = e.deltaY < 0 ? 1.25 : 0.8, s = Math.min(Math.max(view.s * f, 0.02), 16);
      view.x = p.cx - p.x * s; view.y = p.cy - p.y * s; view.s = s; paint();
    }, { passive: false });

    // ---- straightening ----
    async function prepare() {
      host.busy(t('scanin.working'));
      try {
        clicks.two = []; clicks.pts = []; skew = null; corners = null; sheet = raw;
        if (kind === 'photo') {
          const f = findSheet(raw);
          corners = f?.corners || null;
          if (corners && straighten) { const u = unwarpSheet(raw, corners, { maxSide: Math.min(MAX_SIDE, Math.max(raw.w, raw.h)) }); if (u) sheet = { ...u.img, dpi: null, format: raw.format }; }
        } else if (straighten) {
          const bm = threshold(toGrey(raw), { mode: 'auto' });
          skew = findSkew(bm);
          if (skew && Math.abs(skew.deg) >= 0.05 && skew.confidence > 0.2) sheet = { ...rotateImage(raw, -skew.deg), dpi: raw.dpi, format: raw.format };
        }
      } catch (e) { host.say(String(e?.message || e)); sheet = raw; }
      finally { host.busy(''); }
      if (!dpiIn.value) dpiIn.value = sheet.dpi?.x ? String(Math.round(sheet.dpi.x)) : '';
      await makeBitmap();
      render();
    }

    // ---- placement from what is filled in ----
    function placement() {
      if (mode === 'two') {
        if (clicks.two.length < 2) return { why: t('scanin.need.two') };
        const upp = scaleFromTwo(clicks.two[0], clicks.two[1], Number(distIn.value));
        if (!upp) return { why: t('scanin.need.dist', { unit }) };
        return { gt: gtFromScale({ upp, h: sheet.h, origin: { x: Number(oxIn.value) || 0, y: Number(oyIn.value) || 0 } }), placed: 'two-points' };
      }
      if (mode === 'stated') {
        const dpi = Number(dpiIn.value), v = Number(statedIn.value);
        const upp = statedKind.value === 'per' ? scaleFromStated({ dpi, per: v }) : scaleFromStated({ dpi, ratio: v, unit });
        if (!upp) return { why: t('scanin.need.stated') };
        return { gt: gtFromScale({ upp, h: sheet.h, origin: { x: Number(oxIn.value) || 0, y: Number(oyIn.value) || 0 } }), placed: 'stated' };
      }
      const survey = host.points?.() || [];
      const pairs = clicks.pts.map((c) => {
        if (c.n !== '') { const sp = survey.find((q) => String(q.n) === String(c.n)); return sp ? { px: c.x, py: c.y, x: sp.x, y: sp.y } : null; }
        return c.X !== '' && c.Y !== '' ? { px: c.x, py: c.y, x: Number(c.X), y: Number(c.Y) } : null;
      });
      const ok = pairs.filter(Boolean), affine = stretchBox.checked;
      if (ok.length < (affine ? 3 : 2)) return { why: t(affine ? 'scanin.need.pts3' : 'scanin.need.pts2') };
      const fit = fitPoints(ok, { mode: affine ? 'affine' : 'similarity' });
      if (!fit) return { why: t('scanin.need.spread') };
      let k = 0; const res = pairs.map((p) => (p ? fit.residuals[k++] : null));
      return { gt: fit.gt, placed: affine ? 'points-stretch' : 'points', fit, res };
    }

    function renderPoints(pl) {
      const survey = host.points?.() || [];
      ptsBody.replaceChildren(...clicks.pts.map((c, i) => {
        const X = num({ value: c.X, 'aria-label': t('scanin.pts.e', { n: i + 1 }), 'data-scanin-pt-e': String(i) });
        const Y = num({ value: c.Y, 'aria-label': t('scanin.pts.n', { n: i + 1 }), 'data-scanin-pt-n': String(i) });
        const P = el('input', { type: 'text', className: 'cv-input', value: c.n, size: 6, 'aria-label': t('scanin.pts.point', { n: i + 1 }), 'data-scanin-pt-num': String(i), list: survey.length ? 'ss-survey-' + uid : null });
        X.oninput = () => { c.X = X.value; summary(); }; Y.oninput = () => { c.Y = Y.value; summary(); }; P.oninput = () => { c.n = P.value.trim(); summary(); };
        const rm = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'aria-label': t('scanin.pts.remove', { n: i + 1 }) }, '×');
        rm.onclick = () => { clicks.pts.splice(i, 1); render(); };
        const r = pl?.res?.[i];
        return el('tr', { 'data-scanin-pt': String(i) }, el('td', {}, String(i + 1)), el('td', {}, P), el('td', {}, X), el('td', {}, Y),
          el('td', { 'data-scanin-pt-res': String(i) }, r == null ? '—' : r.toFixed(3)), el('td', {}, rm));
      }));
    }
    function summary() {
      const pl = placement();
      if (mode === 'pts') ptsBody.querySelectorAll('[data-scanin-pt-res]').forEach((td) => { const r = pl.res?.[Number(td.dataset.scaninPtRes)]; td.textContent = r == null ? '—' : r.toFixed(3); });
      if (pl.why) { what.textContent = pl.why; go.disabled = true; return; }
      const upp = Math.sqrt(Math.abs(pl.gt[1] * pl.gt[5] - pl.gt[2] * pl.gt[4]));
      const parts = [t('scanin.what.size', { w: (sheet.w * upp).toFixed(1), h: (sheet.h * upp).toFixed(1), unit, px: (upp).toPrecision(3) })];
      if (pl.fit) parts.push(!pl.fit.checked ? t('scanin.what.unchecked') : pl.fit.worst === null ? t('scanin.what.rms', { rms: pl.fit.rms.toFixed(3), unit }) + ' ' + t('scanin.what.which')
        : t('scanin.what.rms', { rms: pl.fit.rms.toFixed(3), unit }) + ' ' + t('scanin.what.worst', { worst: pl.fit.worst + 1, off: pl.fit.residuals[pl.fit.worst].toFixed(3), unit }));
      if (sheet.dpi?.x && upp) parts.push(t('scanin.what.scale', { per: (upp * sheet.dpi.x).toFixed(2), unit }));
      what.textContent = parts.join(' ');
      go.disabled = false;
    }
    function render() {
      modeBtns.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.scaninModeBtn === mode)));
      secTwo.hidden = mode !== 'two'; secStated.hidden = mode !== 'stated'; secPts.hidden = mode !== 'pts'; secOrigin.hidden = mode === 'pts';
      help.textContent = t('scanin.help.' + mode);
      straightNote.textContent = kind === 'photo'
        ? (corners ? t('scanin.straight.photo') : t('scanin.straight.nosheet'))
        : skew ? (Math.abs(skew.deg) < 0.05 ? t('scanin.straight.square') : t(skew.confidence > 0.2 ? 'scanin.straight.found' : 'scanin.straight.weak', { deg: skew.deg.toFixed(2) })) : '';
      const pl = placement();
      renderPoints(pl);
      summary();
      paint();
    }

    const lab = (forId, key, vars) => el('label', { for: forId }, t(key, vars));
    const secTwo = el('div', { className: 'cv-props', 'data-scanin-sec': 'two' }, lab(distIn.id, 'scanin.two.dist', { unit }), distIn);
    const secStated = el('div', { className: 'cv-props', 'data-scanin-sec': 'stated' }, lab(dpiIn.id, 'scanin.stated.dpi'), dpiIn, lab(statedKind.id, 'scanin.stated.kind'), statedKind, lab(statedIn.id, 'scanin.stated.value'), statedIn);
    const secOrigin = el('div', { className: 'cv-props', 'data-scanin-sec': 'origin' }, lab(oxIn.id, 'scanin.origin.e', { unit }), oxIn, lab(oyIn.id, 'scanin.origin.n', { unit }), oyIn);
    const survey = host.points?.() || [];
    const secPts = el('div', { 'data-scanin-sec': 'pts' },
      el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table' },
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, '#'), el('th', { scope: 'col' }, t('scanin.pts.col.point')), el('th', { scope: 'col' }, t('scanin.pts.col.e', { unit })),
          el('th', { scope: 'col' }, t('scanin.pts.col.n', { unit })), el('th', { scope: 'col' }, t('scanin.pts.col.res', { unit })), el('th', {}, el('span', { className: 'visually-hidden' }, t('scanin.pts.col.remove'))))), ptsBody)),
      survey.length ? el('datalist', { id: 'ss-survey-' + uid }, ...survey.slice(0, 2000).map((q) => el('option', { value: String(q.n) }))) : '',
      el('label', { className: 'cv-check' }, stretchBox, ' ', t('scanin.pts.stretch')));
    [distIn, oxIn, oyIn, dpiIn, statedIn].forEach((i) => { i.oninput = summary; });
    statedKind.onchange = summary; stretchBox.onchange = summary;
    pageSel.onchange = async () => { page = Number(pageSel.value); await readPage(page); if (!raw) { host.say(readErr); return; } await prepare(); };
    kindSel.value = kind;
    kindSel.onchange = () => { kind = kindSel.value; prepare(); };
    straightBox.onchange = () => { straighten = straightBox.checked; prepare(); };

    // ---- the dialog ----
    const hid = 'ss-h-' + uid;
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('scanin.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const dlg = el('dialog', { className: 'cv-dialog cv-scanin', 'aria-labelledby': hid, 'data-scanin-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: hid }, t('scanin.title', { file: file.name })), close),
        el('div', { className: 'cv-dlg-body' },
          el('p', { className: 'cv-note' }, t('scanin.lede')),
          el('div', { className: 'cv-props' }, ...(pages > 1 ? [lab(pageSel.id, 'scanin.page'), pageSel] : []), lab(kindSel.id, 'scanin.kind'), kindSel),
          el('label', { className: 'cv-check' }, straightBox, ' ', t('scanin.straight'), ' ', straightNote),
          cv,
          el('h3', { className: 'cv-h3' }, t('scanin.place.head')), modeBox, help, secTwo, secStated, secOrigin, secPts,
          el('h3', { className: 'cv-h3' }, t('scanin.then.head')),
          el('label', { className: 'cv-check' }, traceBox, ' ', t('scanin.trace')),
          el('div', { className: 'cv-props' }, lab(tolIn.id, 'scanin.trace.tol'), tolIn),
          el('p', { className: 'cv-note' }, t('scanin.trace.note')),
          el('h3', { className: 'cv-h3' }, t('scanin.what.head')), what),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('scanin.cancel')), go)));
    close.onclick = () => dlg.close();
    dlg.addEventListener('keydown', (e) => e.stopPropagation());
    dlg.addEventListener('close', () => { bmp?.close?.(); dlg.remove(); done(result); });

    go.onclick = async () => {
      const pl = placement();
      if (pl.why) return;
      go.disabled = true;
      host.busy(t('scanin.working'));
      try {
        let layers = [];
        const steps = [kind === 'photo' ? (corners && straighten ? 'photo straightened' : 'photo') : (skew && sheet !== raw ? `straightened ${(-skew.deg).toFixed(2)}°` : 'as scanned')];   // i18n-ignore: provenance codes kept in the record, not words shown
        if (rawK > 1) steps.push(`shrunk 1/${rawK}`);   // i18n-ignore: provenance codes kept in the record, not words shown
        if (traceBox.checked) {
          if (sheet.w * sheet.h > MAX_TRACE_PIXELS) host.say(t('scanin.trace.big'));
          else {
            const c = convertImage(sheet, pl.gt, { tol: tolIn.value, name: t('scanin.layer', { file: file.name.replace(/\.[^.]+$/, '') }).slice(0, 120), source: { file: file.name, format: 'scan', crs: null } });
            layers = c.layers;
            steps.push(`traced ${c.lines} lines, ${c.arcs} arcs`);   // i18n-ignore: provenance codes kept in the record, not words shown
          }
        }
        // the picture kept with the project: PNG for black-and-white sheets, else JPEG; halved until it fits
        const sha = host.sha256 ? await host.sha256(parts[page].bytes).catch(() => '') : '';
        let img = sheet, gt = pl.gt, blob = await encode(img, !!raw.bilevel);
        while (blob.size > MAX_BLOB && img.w > 1000) {
          const s = shrink(img, Math.floor(Math.max(img.w, img.h) / 2));
          img = s.img; gt = [gt[0], gt[1] * s.k, gt[2] * s.k, gt[3], gt[4] * s.k, gt[5] * s.k];
          blob = await encode(img, !!raw.bilevel);
          steps.push(`kept at 1/${s.k}`);   // i18n-ignore: provenance codes kept in the record, not words shown
        }
        const dpi = sheet.dpi?.x ? sheet.dpi.x * sheet.w / img.w : null;
        result = {
          name: file.name.replace(/\.[^.]+$/, ''), blob, w: img.w, h: img.h, gt, layers, placed: pl.placed, fit: pl.fit || null,
          record: { ...record({ file: file.name, page, pages, format: raw.format, dpi, sha256: sha, placed: pl.placed, rms: pl.fit?.checked ? pl.fit.rms : null, when: new Date().toISOString().slice(0, 10), steps }),
            scanSource: source, scanState: layers.length ? 'drawn' : 'new' },
        };
      } catch (e) { host.say(String(e?.message || e)); go.disabled = false; return; }
      finally { host.busy(''); }
      dlg.close();
    };

    host.root.append(dlg);
    dlg.showModal();
    prepare();
  });
}

function pick(host, { accept = FILE_ACCEPT, capture = null, source = 'file' } = {}) {
  return new Promise((ok) => {
    const inp = host.el('input', { type: 'file', accept, capture, className: 'visually-hidden', 'data-scanin-pick': source });
    inp.addEventListener('change', () => { const f = inp.files?.[0] || null; inp.remove(); if (f) f.ccSource = source; ok(f); });
    inp.addEventListener('cancel', () => { inp.remove(); ok(null); });
    host.root.append(inp);
    inp.click();
  });
}

const stamp = () => { const d = new Date(), z = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}.${z(d.getMinutes())}`; };

/**
 * The Scan chooser: where the sheet comes from. → a File (a photo or a file), { name, blobs, source: 'scanner' } (pages a scanner
 * sent), or null. The scanner choice is there only with host.scanners (Studio on a computer); elsewhere it is greyed with the reason.
 */
export function chooseSource(host) {
  const { el, t } = host;
  return new Promise((done) => {
    let out = null;
    const uid = Math.random().toString(36).slice(2, 8), hid = 'ss-src-' + uid;
    const big = (key, icon, src, disabled = false) => el('button', { type: 'button', className: 'btn-line cv-scanin-src', disabled, 'data-scanin-src': src },
      el('i', { className: 'bi ' + icon, 'aria-hidden': 'true' }), ' ', t(key));
    const bScanner = big('scanin.src.scanner', 'bi-printer', 'scanner', !host.scanners);
    const bPhoto = big('scanin.src.photo', 'bi-camera', 'photo');
    const bFile = big('scanin.src.file', 'bi-folder2-open', 'file');
    const why = el('p', { className: 'cv-note', 'data-scanin-src-why': '' }, host.scanners ? '' : t('scanin.src.noscanner'));
    // ---- the scanner part (Studio): look for scanners, settings, Scan ----
    const list = el('select', { className: 'cv-select', id: 'ss-sc-' + uid, 'data-scanin-scanner': '' });
    const srcSel = el('select', { className: 'cv-select', id: 'ss-sc-src-' + uid, 'data-scanin-scanner-source': '' },
      el('option', { value: 'Platen' }, t('scanin.sc.platen')), el('option', { value: 'Feeder' }, t('scanin.sc.feeder')));
    const colSel = el('select', { className: 'cv-select', id: 'ss-sc-col-' + uid, 'data-scanin-scanner-color': '' },
      el('option', { value: 'BlackAndWhite1' }, t('scanin.sc.bw')), el('option', { value: 'Grayscale8', selected: true }, t('scanin.sc.grey')), el('option', { value: 'RGB24' }, t('scanin.sc.colour')));
    const dpiSel = el('select', { className: 'cv-select', id: 'ss-sc-dpi-' + uid, 'data-scanin-scanner-dpi': '' },
      ...[150, 200, 300, 400, 600].map((d) => el('option', { value: String(d), selected: d === 300 }, t('scanin.sc.dpi', { dpi: d }))));
    const look = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-scanin-scanner-look': '' }, t('scanin.sc.look'));
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', disabled: true, 'data-scanin-scanner-go': '' }, t('scanin.sc.go'));
    const state = el('p', { className: 'cv-note', 'aria-live': 'polite', 'data-scanin-scanner-state': '' });
    let found = [], ctrl = null;
    const lab = (forId, key) => el('label', { for: forId }, t(key));
    const scPart = el('div', { hidden: true, 'data-scanin-scanner-part': '' },
      el('div', { className: 'cv-props' }, lab(list.id, 'scanin.sc.which'), list, lab(srcSel.id, 'scanin.sc.source'), srcSel, lab(colSel.id, 'scanin.sc.color'), colSel, lab(dpiSel.id, 'scanin.sc.res'), dpiSel),
      el('div', { className: 'cv-actions' }, look, go), state);
    async function lookForScanners() {
      look.disabled = true; go.disabled = true; state.textContent = t('scanin.sc.looking');
      try { found = await host.scanners.browse(2500); } catch (e) { found = []; state.textContent = t('scanin.sc.err', { why: String(e?.message || e) }); look.disabled = false; return; }
      list.replaceChildren(...found.map((s, i) => el('option', { value: String(i) }, s.name || s.id)));
      state.textContent = found.length ? t('scanin.sc.found', { n: found.length }) : t('scanin.sc.none');
      go.disabled = !found.length; look.disabled = false;
    }
    look.onclick = lookForScanners;
    go.onclick = async () => {
      const s = found[Number(list.value)];
      if (!s) return;
      go.disabled = true; look.disabled = true; ctrl = new AbortController();
      try {
        const r = await esclScan((m, p, b) => host.scanners.request(s.id, m, p, b), {
          rs: s.rs || 'eSCL', signal: ctrl.signal, want: { source: srcSel.value, color: colSel.value, dpi: Number(dpiSel.value) },
          onState: (k) => { state.textContent = t('scanin.sc.state.' + k, { name: s.name || s.id }); },
        });
        out = { name: t('scanin.sc.name', { when: stamp() }), source: 'scanner', blobs: r.pages.map((p) => new Blob([p.bytes], { type: p.type })) };
        dlg.close();
      } catch (e) {
        state.textContent = e?.key ? t('scanin.sc.err.' + e.key, { name: s.name || s.id }) : t('scanin.sc.err', { why: String(e?.message || e) });
        go.disabled = false; look.disabled = false;
      }
    };
    bScanner.onclick = () => { scPart.hidden = false; lookForScanners(); };
    bPhoto.onclick = async () => { const f = await pick(host, { accept: 'image/*', capture: 'environment', source: 'camera' }); if (f) { out = f; dlg.close(); } };
    bFile.onclick = async () => { const f = await pick(host); if (f) { out = f; dlg.close(); } };
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('scanin.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const dlg = el('dialog', { className: 'cv-dialog cv-scanin cv-scanin-pick', 'aria-labelledby': hid, 'data-scanin-source-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: hid }, t('scanin.src.title')), close),
        el('div', { className: 'cv-dlg-body' },
          el('p', { className: 'cv-note' }, t('scanin.src.lede')),
          el('div', { className: 'cv-scanin-srcs' }, bScanner, bPhoto, bFile), why, scPart),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('scanin.cancel')))));
    close.onclick = () => dlg.close();
    dlg.addEventListener('keydown', (e) => e.stopPropagation());
    dlg.addEventListener('close', () => { ctrl?.abort(); dlg.remove(); done(out); });
    host.root.append(dlg);
    dlg.showModal();
  });
}
