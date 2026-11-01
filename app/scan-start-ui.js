/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scan-start-ui.js — CivilCraft's adapter for cc-scanstart (Super 0.1: "Start from a scan" in Layout; the engine and the dialog are
 * lib/scanstart, copied to ./scanstart/ by tools/scanstart/sync.mjs — never edit the copy). gis-ui.js installs it.
 *
 *   install(host): command 'scan-start' (Surface › More, the start card, Layout's tools in SuperCad Studio) · an opener that takes a PDF,
 *   or one PNG / JPEG with no world file (a picture WITH a world file stays a map layer, gis-map-ui.js) · window.civilcraft.gis.scan
 *   (host.scan) = { open(file), last } for tests.
 *
 * What it makes, as two undo steps at most: the sheet as an image map layer in project coordinates (reg.addPicture, gis-map-ui.js;
 * the layer record keeps where the sheet came from: scanFile, scanPage, scanSha256, scanPlaced, scanRms, …) and, when traced, one GIS
 * line layer (addLayers) that "Use for the surface" turns into a boundary or breaklines. PDF pages are drawn by pdf.js (manifest
 * "pdfjs-dist", worker from <main data-pdf-worker>), opened with eval and scripting off.
 */
import { t } from './i18n.js';
import { scanStart } from './scanstart/scanstart-ui.js';
import { convertImage } from './scanstart/convert.js';
import { renderScans } from './scanstart/scans-ui.js';
import { addLayers, featuresOf } from './gis-layers.js';

const PIC = /\.(png|jpe?g)$/i, WORLD = /\.(pgw|pngw|jgw|jpgw|jpegw|tfw|tifw|wld|prj)$/i;
const MAX_PDF_PIXELS = 60e6;

export async function install(host) {
  const { reg, el } = host;
  const P = () => host.project;
  const api = { last: null };

  let pdfLib = null;
  const pdfjs = () => (pdfLib ||= import('pdfjs-dist').then((m) => {
    const w = host.root.closest?.('[data-pdf-worker]')?.dataset.pdfWorker || host.root.querySelector?.('[data-pdf-worker]')?.dataset.pdfWorker || document.querySelector('[data-civilcraft][data-pdf-worker]')?.dataset.pdfWorker;
    if (w && m.GlobalWorkerOptions) m.GlobalWorkerOptions.workerSrc = w;
    return m;
  }));
  // → { task, doc }: the loading task is what closes the document (pdf.js 6)
  const openPdf = async (bytes) => { const task = (await pdfjs()).getDocument({ data: bytes.slice(), isEvalSupported: false, enableScripting: false, enableXfa: false }); return { task, doc: await task.promise }; };
  const pdf = {
    pages: async (bytes) => { const { task, doc } = await openPdf(bytes); const n = doc.numPages; task.destroy(); return n; },
    render: async (bytes, i, dpi) => {
      const { task, doc } = await openPdf(bytes);
      try {
        const page = await doc.getPage(i + 1);
        let vp = page.getViewport({ scale: dpi / 72 });
        if (vp.width * vp.height > MAX_PDF_PIXELS) vp = page.getViewport({ scale: (dpi / 72) * Math.sqrt(MAX_PDF_PIXELS / (vp.width * vp.height)) });
        const cv = document.createElement('canvas');
        cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
        await page.render({ canvasContext: ctx, viewport: vp, annotationMode: 0 }).promise;
        const id = ctx.getImageData(0, 0, cv.width, cv.height);
        const at = 72 * vp.scale;   // the dpi the page was drawn at (lower than asked for a very big sheet)
        return { w: cv.width, h: cv.height, channels: 4, data: new Uint8Array(id.data.buffer), dpi: { x: at, y: at } };
      } finally { task.destroy(); }
    },
  };
  const decodeJpeg = async (bytes) => {
    const bmp = await createImageBitmap(new Blob([bytes], { type: 'image/jpeg' }));
    const cv = new OffscreenCanvas(bmp.width, bmp.height), c = cv.getContext('2d');
    c.drawImage(bmp, 0, 0); bmp.close?.();
    return { w: cv.width, h: cv.height, channels: 4, data: new Uint8Array(c.getImageData(0, 0, cv.width, cv.height).data.buffer) };
  };
  const sha256 = async (bytes) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map((b) => b.toString(16).padStart(2, '0')).join('');

  const scanHost = {
    el, t, root: host.root, say: host.say, busy: host.busy, pdf, decodeJpeg, sha256,
    get units() { return P().state.units === 'm' ? 'm' : 'ft'; },
    points: () => P().points || [],
    // the Scan button's scanners: Studio on a computer (desktop-shell scanner.rs through its bridge); none in a browser
    get scanners() { return globalThis.cadcraftDesktop?.scanners || null; },
  };

  async function open(file = null) {
    const r = await scanStart(scanHost, file);
    if (!r) return null;
    const label = t('scanin.undo', { name: r.name });
    const mapId = await reg.addPicture({ name: r.name, blob: r.blob, width: r.w, height: r.h, gt: r.gt, crs: null, extra: { ...r.record, scanLayers: '' }, label });
    const msgs = [t('scanin.done', { name: r.name, how: t('scanin.how.' + r.placed) })];
    if (r.layers.length) {
      addLayers(P(), r.layers, { label, also: (st, ids) => { const m = mapOf(st, mapId); if (m) { m.scanLayers = ids.join(','); m.scanState = 'drawn'; } } });
      msgs.push(t('scanin.done.traced', { n: r.layers[0].features.length, layer: r.layers[0].name }));
    }
    api.last = { name: r.name, gt: r.gt, w: r.w, h: r.h, placed: r.placed, rms: r.fit?.rms ?? null, traced: r.layers[0]?.features.length || 0, record: r.record };
    host.fitAll();
    host.refresh();
    host.say(msgs.join(' '));
    return api.last;
  }

  // ---- the Scans list: each scan is a workflow item until the drafter keeps or removes it (lib/scanstart/scans-ui.js) ----
  const mapOf = (st, id) => (st.gis?.maps || []).find((m) => m.id === id) || null;
  const scans = () => (P().state.gis?.maps || []).filter((m) => m.kind === 'image' && m.scanFile);
  const drawingOf = (m) => String(m.scanLayers || '').split(',').filter((id) => (P().state.gis?.layers || []).some((l) => l.id === id));
  const items = () => scans().map((m) => {
    const ids = drawingOf(m), lines = ids.reduce((n, id) => n + featuresOf(P(), id).length, 0);
    return { id: m.id, name: m.name, state: m.scanState === 'kept' ? 'kept' : lines ? 'drawn' : 'new', visible: m.visible !== false, lines,
      source: m.scanSource || 'file', placed: m.scanPlaced || '', when: m.scanWhen || '', page: m.scanPage || 1, pages: m.scanPages || 1 };
  });
  const nameOf = (id) => mapOf(P().state, id)?.name || '';
  /** The stored picture of a scan → { w, h, channels: 4, data } (decoded here; the project keeps it as a data: URL). */
  async function pictureOf(m) {
    const url = P().gisImages?.get(m.image);
    if (!url) throw new Error(t('scanin.err.read', { file: m.name, why: '—' }));
    const [head, b64] = url.split(',');
    const bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const bmp = await createImageBitmap(new Blob([bytes], { type: /png/.test(head) ? 'image/png' : 'image/jpeg' }));
    const cv = new OffscreenCanvas(bmp.width, bmp.height), c = cv.getContext('2d');
    c.drawImage(bmp, 0, 0); bmp.close?.();
    return { w: cv.width, h: cv.height, channels: 4, data: new Uint8Array(c.getImageData(0, 0, cv.width, cv.height).data.buffer) };
  }
  const act = {
    show(id, on) { P().change(t(on ? 'mapl.undo.show' : 'mapl.undo.hide'), (st) => { const m = mapOf(st, id); if (m) m.visible = !!on; }); host.view.invalidate(true); },
    zoom(id) {
      const m = mapOf(P().state, id); if (!m) return;
      const xs = [], ys = [];
      for (const [u, v] of [[0, 0], [m.width, 0], [m.width, m.height], [0, m.height]]) { xs.push(m.a0 + m.a1 * u + m.a2 * v); ys.push(m.a3 + m.a4 * u + m.a5 * v); }
      host.view.fit({ minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) });
    },
    async convert(id) {
      const m = mapOf(P().state, id); if (!m) return null;
      host.busy(t('scanin.working'));
      let c;
      try { c = convertImage(await pictureOf(m), [m.a0, m.a1, m.a2, m.a3, m.a4, m.a5], { name: t('scanin.layer', { file: String(m.scanFile).replace(/\.[^.]+$/, '') }).slice(0, 120), source: { file: m.scanFile, format: 'scan', crs: null } }); }
      catch (e) { host.busy(''); host.say(e?.key ? t('scanin.err.read', { file: m.name, why: t('scanin.why.' + e.key) }) : String(e?.message || e)); return null; }
      host.busy('');
      if (!c.layers.length) { host.say(t('scanin.converted.none', { name: m.name })); return 0; }
      const old = drawingOf(m);
      // one step: the earlier drawing (Convert again) out, the new one in, the scan's record pointing at it
      addLayers(P(), c.layers, { label: t('scanin.undo.convert', { name: m.name }), also: (st, ids, map) => {
        st.gis.layers = st.gis.layers.filter((l) => !old.includes(l.id)); for (const o of old) map.delete(o);
        const r = mapOf(st, id); if (r) { r.scanLayers = ids.join(','); if (r.scanState !== 'kept') r.scanState = 'drawn'; }
      } });
      host.refresh();
      host.say(t('scanin.converted', { name: m.name, n: c.layers[0].features.length, layer: c.layers[0].name }));
      return c.layers[0].features.length;
    },
    keep(id) { const n = nameOf(id); P().change(t('scanin.undo.keep', { name: n }), (st) => { const m = mapOf(st, id); if (m) m.scanState = 'kept'; }); host.say(t('scanin.kept', { name: n })); },
    remove(id, { drawing = false } = {}) {
      const m = mapOf(P().state, id); if (!m) return;
      const ids = drawing ? drawingOf(m) : [], n = m.name;
      P().editGis(t(drawing ? 'scanin.undo.remove.both' : 'scanin.undo.remove', { name: n }), (map, st) => {
        st.gis.maps = st.gis.maps.filter((x) => x.id !== id);
        if (ids.length) { st.gis.layers = st.gis.layers.filter((l) => !ids.includes(l.id)); for (const o of ids) map.delete(o); }
        return map;
      });
      host.view.invalidate(true); host.refresh();
      host.say(t(drawing ? 'scanin.removed.both' : 'scanin.removed', { name: n }));
    },
  };
  const panel = host.root.querySelector('[data-scans]');
  const renderPanel = () => { if (panel) renderScans(scanHost, panel, items(), act); };
  let unsub = null;
  const watch = () => { unsub?.(); unsub = P().on(() => renderPanel()); renderPanel(); };
  reg.onProject.push(watch);
  watch();
  api.items = items; api.act = act;

  reg.commands.set('scan-start', () => open());
  // first in line: a PDF, or one picture with no world file — the map layer opener would refuse it ("no world file")
  reg.openers.unshift({
    accepts: (files) => files.length === 1 && (/\.pdf$/i.test(files[0].name) || PIC.test(files[0].name)) && !files.some((f) => WORLD.test(f.name)),
    open: (files) => open(files[0]),
  });
  api.open = open;
  host.scan = api;
}
