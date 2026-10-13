/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-map-ui.js — map layers under the plan (GIS › Map; docs/GIS-SPEC.md §4.2). Builder C. Parsing, URLs, tile plans and
 * warping are in basemap.js (DOM-free); this file owns the dialog, the fetching, the in-memory cache and the painting.
 *
 *   install(host): commands 'basemap' · underlay (paints every visible layer, first at the bottom) · an opener for a
 *   picture + world file (+ .prj) and for an RGB GeoTIFF (through builder B's raster.js readGeoImage, when it is there) ·
 *   extents (picture layers count for Fit) · onProject · crsChange.
 *
 * Network: nothing is ever requested while Settings › CivilCraft › "Map layers from the internet" is Off (the default) —
 *   internet layers are listed, greyed, with the reason; a picture from a file works either way. On: tiles for the view's
 *   extent and zoom (≤ 64 per view, ≤ 6 at a time, the ones no longer wanted are cancelled when the view moves on, ~200 kept
 *   in memory), one picture per view for WMS and ArcGIS export (after the view has settled), fetched with mode 'cors',
 *   no credentials, no referrer. Errors are shown once per layer, on its row and in the status line.
 * Warping: pictures in another system than the project's are drawn as affine pieces split until they are within a quarter
 *   pixel of the exact reprojection (basemap.js planWarp), in project coordinates, so panning reuses the plan.
 */

import { el } from './ui-util.js';
import * as B from './basemap.js';
import { byCode, crsFromEntry, crsFromPrj, frame, crsProblem, gridInfo } from './crs.js';
import { t } from "./i18n.js";

const MAX_ACTIVE = 6, MAX_CACHE = 200, MAX_TILES = 64;
const FETCH_OPTS = { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'default' };
let uid = 0;

export function install(host) {
  const { reg } = host;
  const project = () => host.project;
  const maps = () => project().state.gis?.maps || [];
  const internetOn = () => host.settings.internet === true;

  // ---------------------------------------------------------------- runtime (never saved)
  const runtime = new Map();            // layer id → { note, said, picture: {img, w, h, gt|bbox…}, pending, plans }
  const rt = (id) => { let r = runtime.get(id); if (!r) runtime.set(id, (r = { note: '', said: false, plans: new Map(), view: null, viewKey: '', timer: 0 })); return r; };
  const cache = new Map();              // url → { status: 'queued'|'loading'|'ok'|'error', img, ctrl, layer, plans: Map }
  let queue = [], active = 0, wanted = new Set(), repaintTimer = 0;
  // 0.4 V3: the 3D view drapes the map layers on the surface. Its picture paints with its own wanted set and per-layer state
  // (`mode` 'drape'), so the plan and the drape never cancel each other's requests or fight over a WMS picture's view.
  let mode = 'plan', wantedDrape = new Set();
  const runtimeDrape = new Map();
  const drapeListeners = new Set();
  let drapeTimer = 0;
  const isWanted = (u) => wanted.has(u) || wantedDrape.has(u);
  const wantSet = () => (mode === 'drape' ? wantedDrape : wanted);
  const rtv = (id) => { if (mode !== 'drape') return rt(id); let r = runtimeDrape.get(id); if (!r) runtimeDrape.set(id, (r = { plans: new Map(), viewKey: '', timer: 0 })); return r; };
  const repaint = () => {
    if (!repaintTimer) repaintTimer = setTimeout(() => { repaintTimer = 0; host.view.invalidate(true); }, 80);
    if (drapeListeners.size && !drapeTimer) drapeTimer = setTimeout(() => { drapeTimer = 0; for (const f of drapeListeners) { try { f(); } catch { /* a listener's own problem */ } } }, 250);
  };

  function note(id, text) {
    const r = rt(id);
    if (r.note === text) return;
    r.note = text;
    if (text && !r.said) { r.said = true; const m = maps().find((x) => x.id === id); host.say((m ? m.name + ': ' : '') + text); }
    if (dialogApi) dialogApi.renderRows();
  }

  // ---------------------------------------------------------------- fetching
  function want(url, layerId) {
    wantSet().add(url);
    const c = cache.get(url);
    if (c) { c.used = performance.now(); return c; }
    if (!internetOn() || rt(layerId).blocked) return null;
    const e = { status: 'queued', img: null, ctrl: null, layer: layerId, plans: new Map(), used: performance.now() };
    cache.set(url, e);
    queue.push(url);
    pump();
    return e;
  }
  function pump() {
    while (active < MAX_ACTIVE && queue.length) {
      const url = queue.shift(), e = cache.get(url);
      if (!e || e.status !== 'queued') continue;
      if (!isWanted(url) || !internetOn() || rt(e.layer).blocked) { cache.delete(url); continue; }
      e.status = 'loading'; e.ctrl = new AbortController(); active++;
      load(url, e).finally(() => { active--; pump(); });
    }
  }
  async function load(url, e) {
    try {
      const r = await fetch(url, { ...FETCH_OPTS, signal: e.ctrl.signal });
      if (!r.ok) throw new Error(r.status === 404 ? t('mapl.err.404') : t('mapl.http.status', { status: r.status + (r.statusText ? ' ' + r.statusText.slice(0, 60) : '') }));
      const type = (r.headers.get('content-type') || '').toLowerCase();
      const blob = await r.blob();
      if (!type.startsWith('image/')) {
        let why = '';
        if (/xml|text|json/.test(type) && blob.size < 20000) why = B.clean((await blob.text()).replace(/<[^>]*>/g, ' '), 160);
        throw new Error(type ? (why ? t('mapl.err.sent_why', { type: type.split(';')[0], why }) : t('mapl.err.sent', { type: type.split(';')[0] })) : (why ? t('mapl.err.sent_some_why', { why }) : t('mapl.err.sent_some')));
      }
      e.img = await createImageBitmap(blob);
      e.status = 'ok';
      rt(e.layer).loaded = (rt(e.layer).loaded || 0) + 1;
      if (cache.size > MAX_CACHE) evict();
      repaint();
    } catch (err) {
      if (err?.name === 'AbortError') { cache.delete(url); return; }
      e.status = 'error';
      const msg = err instanceof TypeError || /Failed to fetch|NetworkError|Load failed/i.test(String(err?.message))
        ? (navigator.onLine === false ? t('mapl.err.offline') : t('mapl.err.cors_img'))
        : /decode|InvalidState|source image/i.test(String(err?.message)) ? t('mapl.err.decode') : String(err?.message || err).slice(0, 200);
      // a server that refuses every picture is not asked again and again: after 4 refusals and no picture, stop
      const r = rt(e.layer);
      r.fails = (r.fails || 0) + 1;
      if (!r.loaded && r.fails >= 4 && !/404/.test(msg)) { r.blocked = true; note(e.layer, msg + ' ' + t('mapl.err.stopped')); return; }
      note(e.layer, msg);
    }
  }
  function evict() {
    const old = [...cache.entries()].filter(([u, c]) => c.status !== 'loading' && !isWanted(u)).sort((a, b) => a[1].used - b[1].used);
    for (const [u, c] of old.slice(0, cache.size - MAX_CACHE)) { c.img?.close?.(); cache.delete(u); }
  }
  /** After a paint: requests nobody wants any more are dropped (queued) or cancelled (in flight). */
  function settleWanted() {
    queue = queue.filter((u) => { if (isWanted(u)) return true; cache.delete(u); return false; });
    for (const [u, c] of cache) if (c.status === 'loading' && !isWanted(u)) c.ctrl?.abort();
  }
  function stopAll() {
    queue = [];
    for (const [u, c] of cache) if (c.status === 'loading' || c.status === 'queued') { c.ctrl?.abort(); cache.delete(u); }
  }

  // ---------------------------------------------------------------- systems
  const pcrs = () => { const c = project().state.crs; return c && !crsProblem(c, project().state.units) ? c : null; };
  let fcache = { key: '~', f: null, conv: new Map(), gen: 0 };
  // 0.4 V11: the key changes once the project's grid shift file loads
  const pframe = () => { const c = pcrs(), k = c ? JSON.stringify(c) + (c.grid && gridInfo(c.grid) ? '+grid' : '') : ''; if (k !== fcache.key) { fcache = { key: k, f: c ? frame(c) : null, conv: new Map(), gen: fcache.gen + 1 }; } return fcache.f; };
  /** source system (crs-shaped) of a layer, or null = the project's own coordinates. */
  function layerCrs(m) {
    if (m.crsProj4) return { code: m.crsCode, name: m.crsName, proj4: m.crsProj4, unit: m.crsUnit };
    if (m.kind === 'xyz') return crsFromEntry(byCode(3857));
    return null;
  }
  /** project ↔ layer system functions (cached per project system). */
  function conv(m) {
    const f = pframe(), src = layerCrs(m);
    if (!src) return { toSrc: (x, y) => [x, y], fromSrc: (x, y) => [x, y], same: true };
    if (!f) return null;
    const k = src.proj4;
    let c = fcache.conv.get(k);
    if (!c) {
      const same = src.proj4 === f.crs.proj4;
      c = same ? { toSrc: (x, y) => f.toGrid(x, y), fromSrc: (x, y) => f.fromGrid(x, y), same: true } : { toSrc: f.to(src), fromSrc: f.from(src), same: false };
      fcache.conv.set(k, c);
    }
    return c;
  }

  // ---------------------------------------------------------------- painting
  /** The warp of a picture (pixel corners → source system by gt) into project coordinates, planned to `tol` project units. */
  function planFor(store, key, w, h, pixToSrc, cv, zoom) {
    const tolProj = 0.25 / zoom, bucket = Math.round(Math.log2(tolProj) * 2) / 2;
    const k = key + '|' + bucket + '|' + fcache.gen;
    let plan = store.get(k);
    if (!plan) {
      plan = B.planWarp((u, v) => { const s = pixToSrc(u, v); try { return cv.fromSrc(s[0], s[1]); } catch { return null; } }, w, h, { tol: 2 ** bucket, maxDepth: cv.same ? 0 : 7 });
      if (store.size > 8) store.clear();
      store.set(k, plan);
    }
    return plan;
  }
  function drawPlan(ctx, view, img, plan, sw, sh) {
    const z = view.zoom, cx = view.cx, cy = view.cy, hw = view.w / 2, hh = view.h / 2;
    const S = (x, y) => [(x - cx) * z + hw, hh - (y - cy) * z];
    const single = plan.length === 1;
    for (const c of plan) {
      const m = c.m; // image px → project
      const a = z * m[0], b = -z * m[1], cc = z * m[2], d = -z * m[3], e = z * (m[4] - cx) + hw, f = hh - z * (m[5] - cy);
      ctx.save();
      if (!single) {
        // clipped to the cell's exact corners, grown half a pixel so neighbouring cells meet without a hairline
        const q = c.dst.map(([x, y]) => S(x, y)), mx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, my = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4;
        ctx.beginPath();
        q.forEach(([x, y], i) => { const dx = x - mx, dy = y - my, L = Math.hypot(dx, dy) || 1, gx = x + dx / L * 0.6, gy = y + dy / L * 0.6; if (i) ctx.lineTo(gx, gy); else ctx.moveTo(gx, gy); });
        ctx.closePath(); ctx.clip();
      }
      ctx.transform(a, b, cc, d, e, f);
      if (single) {
        // a whole tile or picture in one piece: half a screen pixel bigger all round, so neighbouring tiles meet without
        // a hairline of background between them
        const W = Math.hypot(a, b) * sw, H = Math.hypot(cc, d) * sh;
        if (W > 2 && H > 2) { ctx.translate(sw / 2, sh / 2); ctx.scale((W + 1) / W, (H + 1) / H); ctx.translate(-sw / 2, -sh / 2); }
      }
      const u0 = Math.max(0, Math.floor(c.src[0][0]) - 1), v0 = Math.max(0, Math.floor(c.src[0][1]) - 1), u1 = Math.min(sw, Math.ceil(c.src[2][0]) + 1), v1 = Math.min(sh, Math.ceil(c.src[2][1]) + 1);
      if (u1 > u0 && v1 > v0) ctx.drawImage(img, u0, v0, u1 - u0, v1 - v0, u0, v0, u1 - u0, v1 - v0);
      ctx.restore();
    }
  }

  function paint(ctx, view) {
    const list = maps();
    if (mode === 'drape') wantedDrape = new Set(); else wanted = new Set();
    const shown = [];
    if (list.length) {
      const vb = view.viewBounds();
      for (const m of list) {
        if (!m.visible) continue;
        if (B.isInternet(m) && !internetOn()) continue;
        const cv = conv(m);
        if (!cv) continue; // needs a project system (the dialog says so)
        ctx.save();
        const op = runtime.get(m.id)?.opacity ?? m.opacity ?? 1;   // a slider being dragged wins until it is let go
        ctx.globalAlpha = Math.max(0, Math.min(1, op));
        try {
          if (m.kind === 'image') paintImage(ctx, view, m, cv);
          else if (m.kind === 'xyz' || (m.kind === 'wmts') || (m.kind === 'arcgis' && m.grid)) paintTiles(ctx, view, m, cv, vb);
          else paintOne(ctx, view, m, cv, vb);
          if (m.attribution) shown.push(m.attribution);
        } catch (e) { note(m.id, t('mapl.err.draw', { error: String(e?.message || e).slice(0, 160) })); }
        ctx.restore();
      }
    }
    settleWanted();
    if (mode !== 'drape') showAttribution(shown);
    return shown;
  }

  // a picture from a file
  const bitmaps = new Map();              // image id → { status, img }
  function bitmapFor(m) {
    let b = bitmaps.get(m.image);
    if (b) return b;
    const data = project().gisImages?.get(m.image);
    b = { status: data ? 'loading' : 'missing', img: null };
    bitmaps.set(m.image, b);
    if (data) {
      fetch(data).then((r) => r.blob()).then((bl) => createImageBitmap(bl)).then((img) => { b.img = img; b.status = 'ok'; repaint(); })
        .catch(() => { b.status = 'error'; note(m.id, t('mapl.pic.unreadable')); });
    } else note(m.id, t('mapl.pic.missing'));
    return b;
  }
  function paintImage(ctx, view, m, cv) {
    const b = bitmapFor(m);
    if (b.status !== 'ok') return;
    // the geotransform is for m.width × m.height pixels; the stored picture has that size (scaled if it ever differs)
    const kx = m.width / b.img.width, ky = m.height / b.img.height;
    const gt = [m.a0, m.a1 * kx, m.a2 * ky, m.a3, m.a4 * kx, m.a5 * ky];
    const plan = planFor(rtv(m.id).plans, 'img', b.img.width, b.img.height, (u, v) => B.pixelToSystem(gt, u, v), cv, view.zoom);
    drawPlan(ctx, view, b.img, plan, b.img.width, b.img.height);
  }

  // tiled layers
  function gridOf(m) {
    if (m.kind === 'xyz') return B.XYZ_GRID;
    const r = rt(m.id);
    if (!r.grid || r.gridText !== m.grid) { r.grid = B.readGrid(m.grid); r.gridText = m.grid; }
    return r.grid;
  }
  function tileUrl(m, mat, col, row) {
    if (m.kind === 'xyz') return B.xyzUrl(m.url, Number(mat.id), col, row, m.subdomains || 'abc');
    if (m.kind === 'wmts') return B.wmtsTileUrl({ template: m.template, kvp: m.url, layer: m.layer, style: m.style || 'default', format: m.format, set: m.set, matrix: mat.id, row, col });
    return B.arcgisTileUrl(m.url, mat.id, row, col);
  }
  function paintTiles(ctx, view, m, cv, vb) {
    const grid = gridOf(m);
    const box = B.viewSourceBox(vb, (x, y) => cv.toSrc(x, y), 8);
    if (!box) return;
    const res = Math.max((box[2] - box[0]) / view.w, (box[3] - box[1]) / view.h);
    const { matrix, tiles } = B.gridTilesAny(grid, box, res, { cap: MAX_TILES });
    for (const t of tiles) {
      const url = tileUrl(m, matrix, t.col, t.row);
      const e = want(url, m.id);
      if (!e || e.status !== 'ok') continue;
      const [x0, , , y1] = t.bounds, rx = (t.bounds[2] - x0) / e.img.width, ry = (y1 - t.bounds[1]) / e.img.height;
      const plan = planFor(e.plans, 't', e.img.width, e.img.height, (u, v) => [x0 + u * rx, y1 - v * ry], cv, view.zoom);
      drawPlan(ctx, view, e.img, plan, e.img.width, e.img.height);
    }
  }

  // one picture per view (WMS GetMap, ArcGIS export)
  function paintOne(ctx, view, m, cv, vb) {
    const r = rtv(m.id);
    const box = B.viewSourceBox(vb, (x, y) => cv.toSrc(x, y), 8);
    if (!box) return;
    const k = Math.min(2, window.devicePixelRatio || 1);
    let W = Math.round(view.w * k), H = Math.round(view.h * k);
    const s = Math.min(1, 2048 / W, 2048 / H); W = Math.max(16, Math.round(W * s)); H = Math.max(16, Math.round(H * s));
    // the box keeps the view's shape in the source system, so the picture is not stretched
    const url = m.kind === 'wms'
      ? B.wmsGetMapUrl({ url: m.url, version: m.version, layer: m.layer, style: m.style, format: m.format || 'image/png', code: m.crsCode, bbox: box, width: W, height: H })
      : B.arcgisExportUrl({ base: m.url, kind: m.layer === 'ImageServer' ? 'ImageServer' : 'MapServer', bbox: box, code: m.crsCode, width: W, height: H });
    // ask for a new picture only once the view has settled; until then the last one is drawn where it belongs
    if (r.viewKey !== url) {
      r.viewKey = url;
      clearTimeout(r.timer);
      r.timer = setTimeout(() => { r.wantUrl = url; r.wantBox = box; r.wantSize = [W, H]; repaint(); }, 350);
    }
    if (r.wantUrl) {
      const e = want(r.wantUrl, m.id);
      if (e?.status === 'ok') { r.picture = { e, box: r.wantBox, url: r.wantUrl }; }
    }
    if (r.picture?.e?.img) {
      wantSet().add(r.picture.url);
      const { e, box: b } = r.picture, img = e.img;
      const rx = (b[2] - b[0]) / img.width, ry = (b[3] - b[1]) / img.height;
      const plan = planFor(e.plans, 'v', img.width, img.height, (u, v) => [b[0] + u * rx, b[3] - v * ry], cv, view.zoom);
      drawPlan(ctx, view, img, plan, img.width, img.height);
    }
  }

  // attribution, bottom right of the plan, while a layer that has one is drawn
  const attribEl = el('div', { className: 'cv-attrib', hidden: true, dataset: { mapAttribution: '' } });
  host.ui.plan.append(attribEl);
  function showAttribution(list) {
    const t = [...new Set(list)].join('; ');
    if (attribEl.textContent !== t) attribEl.textContent = t;
    attribEl.hidden = !t;
  }

  // ---------------------------------------------------------------- registry
  reg.underlay.push(paint);
  // 0.4 V3: the drape for the 3D view — the visible map layers painted over a box (project coordinates) into a canvas
  // of at most maxPx on its longer side; null when no layer would draw. Pictures still loading fill in later: onChange
  // listeners hear about it (render again then). clear() lets the drape's requests go.
  let drapeCanvas = null;
  reg.drape = {
    render(box, maxPx = 2048, { canvas = null } = {}) {
      const list = maps().filter((m) => m.visible && !(B.isInternet(m) && !internetOn()) && conv(m));
      if (!list.length || !box) return null;
      const w = Math.max(box.maxX - box.minX, 1e-9), h = Math.max(box.maxY - box.minY, 1e-9), k = maxPx / Math.max(w, h);
      const W = Math.max(16, Math.round(w * k)), H = Math.max(16, Math.round(h * k));
      const cv = canvas || (drapeCanvas ||= document.createElement('canvas'));
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      const ctx = cv.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);   // no picture there: white
      const view = { zoom: k, cx: (box.minX + box.maxX) / 2, cy: (box.minY + box.maxY) / 2, w: W, h: H, viewBounds: () => box };
      mode = 'drape';
      let shown = [];
      try { shown = paint(ctx, view); } finally { mode = 'plan'; }
      return { canvas: cv, layers: list.length, attribution: [...new Set(shown)].join('; ') };
    },
    /** 0.4 V8: how many of the drape's pictures are still on their way (tiles, map service pictures, picture files). */
    pending() {
      let n = 0;
      for (const u of wantedDrape) { const c = cache.get(u); if (!c || c.status === 'queued' || c.status === 'loading') n++; }
      for (const r of runtimeDrape.values()) if (r.timer && !r.wantUrl) n++;
      for (const b of bitmaps.values()) if (b.status === 'loading') n++;
      return n;
    },
    /** 0.4 V8: render, then render again as pictures arrive, until nothing is pending or `timeout` ms pass (for the PDF
     *  and the DWG's picture, which are made once). → render()'s result + { complete } */
    async renderSettled(box, maxPx = 2048, { canvas = null, timeout = 8000 } = {}) {
      const end = performance.now() + timeout;
      let r = this.render(box, maxPx, { canvas });
      while (r && this.pending() && performance.now() < end) {
        await new Promise((ok) => setTimeout(ok, 250));
        r = this.render(box, maxPx, { canvas: r.canvas });
      }
      if (r) r.complete = !this.pending();
      return r;
    },
    onChange(f) { drapeListeners.add(f); return () => drapeListeners.delete(f); },
    clear() { wantedDrape = new Set(); runtimeDrape.clear(); settleWanted(); },
  };
  reg.commands.set('basemap', () => openDialog());
  reg.extents.push(() => {
    let b = null;
    for (const m of maps()) {
      if (m.kind !== 'image' || !m.visible) continue;
      const cv = conv(m); if (!cv) continue;
      for (const [u, v] of [[0, 0], [m.width, 0], [m.width, m.height], [0, m.height]]) {
        try { const [x, y] = cv.fromSrc(...B.pixelToSystem([m.a0, m.a1, m.a2, m.a3, m.a4, m.a5], u, v)); if (!Number.isFinite(x)) continue; b ||= { minX: x, minY: y, maxX: x, maxY: y }; b.minX = Math.min(b.minX, x); b.maxX = Math.max(b.maxX, x); b.minY = Math.min(b.minY, y); b.maxY = Math.max(b.maxY, y); } catch { /* off the system */ }
      }
    }
    return b;
  });
  reg.onProject.push(projectOpened);
  function projectOpened() {
    stopAll();
    for (const b of bitmaps.values()) b.img?.close?.();
    bitmaps.clear(); runtime.clear();
    // the file's records are re-checked here; a bad one is dropped (state stays as read)
    const s = project().state;
    if (s.gis?.maps?.length) {
      const notes = [];
      const clean = B.readMaps(s.gis.maps, notes, project().gisImages);
      if (clean.length !== s.gis.maps.length || JSON.stringify(clean) !== JSON.stringify(s.gis.maps)) s.gis.maps = clean;
      if (notes.length) host.say(notes.join(' '));
      if (!internetOn() && clean.some(B.isInternet)) host.say(t('mapl.internet_off'));
    }
    host.view.invalidate(true);
  }
  projectOpened();   // the project open when the GIS tools loaded
  reg.crsChange.push(() => { fcache = { ...fcache, key: '~' }; host.view.invalidate(true); dialogApi?.render(); });
  reg.hasWork.push(() => maps().length > 0);
  const settingsDlg = document.querySelector('[data-app-settings]');
  const onSetting = () => { if (!internetOn()) stopAll(); for (const r of runtime.values()) { r.blocked = false; r.fails = 0; } host.view.invalidate(true); dialogApi?.render(); };
  settingsDlg?.addEventListener('change', (e) => { if (e.target.name === 'cvInternet') onSetting(); });
  settingsDlg?.addEventListener('cc-settings-reset', onSetting);
  window.addEventListener('storage', (e) => { if (e.key === 'civilcraft.settings') setTimeout(onSetting, 0); });

  // ---------------------------------------------------------------- files: picture + world file (+ .prj), RGB GeoTIFF
  const IMG = /\.(png|jpe?g)$/i, WORLD = /\.(pgw|pngw|jgw|jpgw|jpegw|tfw|tifw|wld)$/i;
  reg.openers.push({
    accepts: (files) => files.some((f) => IMG.test(f.name) || /\.tiff?$/i.test(f.name)) || (files.some((f) => WORLD.test(f.name)) && !files.some((f) => /\.(shp|las|laz|asc)$/i.test(f.name))),
    open: (files) => addImageFiles(files),
  });
  let nextImg = 1;
  const newImageId = () => { const used = new Set([...(project().gisImages?.keys() || []), ...maps().map((m) => m.image)]); while (used.has('img' + nextImg)) nextImg++; return 'img' + nextImg++; };
  const newMapId = () => { const used = new Set(maps().map((m) => m.id)); let i = 1; while (used.has('m' + i)) i++; return 'm' + i; };
  function addMap(rec, label) {
    project().change(label || t('mapl.undo.add', { name: rec.name }), (s) => { s.gis ||= { layers: [], maps: [] }; s.gis.maps ||= []; s.gis.maps.push(rec); });
    host.view.invalidate(true);
    dialogApi?.renderRows();
  }
  async function addImageFiles(files) {
    const img = files.find((f) => IMG.test(f.name)), tif = files.find((f) => /\.tiff?$/i.test(f.name));
    const prj = files.find((f) => /\.prj$/i.test(f.name));
    try {
      if (tif && !img) return await addGeoTiff(tif, files.find((f) => /\.(tfw|tifw|wld)$/i.test(f.name)), prj);
      if (!img) { host.say(t('mapl.world.alone')); return; }
      const stem = img.name.toLowerCase();
      const names = B.worldFileFor(stem);
      const wf = files.find((f) => names.includes(f.name.toLowerCase())) || files.find((f) => WORLD.test(f.name));
      if (!wf) { host.say(t('mapl.world.none', { name: img.name, a: names[0], b: names[1] })); return; }
      if (img.size > B.MAX_IMAGE_BYTES) { host.say(t('mapl.pic.big', { name: img.name, mb: (img.size / 1048576).toFixed(1) })); return; }
      const gt = B.parseWorldFile(await wf.text());
      host.busy(t('tui.reading', { name: img.name }));
      let bmp;
      try { bmp = await createImageBitmap(img); } catch { throw new Error(t('mapl.pic.not_picture', { name: img.name })); } finally { host.busy(''); }
      const w = bmp.width, h = bmp.height; bmp.close?.();
      const crs = await crsForFile(prj, img.name);
      if (crs === undefined) return;
      const data = await fileToDataUrl(img);
      const id = newImageId();
      project().gisImages ||= new Map();
      project().gisImages.set(id, data);
      const rec = record({ kind: 'image', name: img.name.replace(/\.[^.]+$/, ''), image: id, width: w, height: h, gt, crs });
      addMap(rec, t('mapl.undo.picture', { name: img.name }));
      host.say(crs ? t('mapl.added.pic_crs', { name: img.name, w, h, crs: crs.name }) : t('mapl.added.pic_proj', { name: img.name, w, h }));
      if (!pframe() && crs) host.say(t('mapl.added.pic_wait', { name: img.name, crs: crs.name }));
      host.fitAll();
    } catch (e) { host.busy(''); host.say(e.message); }
  }
  async function addGeoTiff(tif, wf = null, prj = null) {
    let rd = null;
    try { rd = await import('./raster.js'); } catch { rd = null; }
    if (!rd?.readGeoImage) { host.say(t('mapl.tif.unavailable')); return; }
    host.busy(t('tui.reading', { name: tif.name }));
    let g;
    try { g = await rd.readGeoImage(tif); } finally { host.busy(''); }
    // a world file (and .prj) given with it win over what the TIFF says about itself
    if (wf) g.affine = B.parseWorldFile(await wf.text());
    const crs = prj || !g.crs ? await crsForFile(prj, tif.name) : g.crs;
    if (crs === undefined) return;
    // the pixels as a PNG (any transparency) or a JPEG, kept in the project file
    const cvs = new OffscreenCanvas(g.width, g.height), c2 = cvs.getContext('2d');
    c2.putImageData(new ImageData(g.rgba, g.width, g.height), 0, 0);
    let alpha = false; for (let i = 3; i < g.rgba.length; i += 4) if (g.rgba[i] < 255) { alpha = true; break; }
    const blob = await cvs.convertToBlob(alpha ? { type: 'image/png' } : { type: 'image/jpeg', quality: 0.9 });
    if (blob.size > B.MAX_IMAGE_BYTES) { host.say(t('mapl.tif.big', { name: tif.name, mb: (blob.size / 1048576).toFixed(1) })); return; }
    const data = await fileToDataUrl(blob);
    const id = newImageId();
    project().gisImages ||= new Map();
    project().gisImages.set(id, data);
    addMap(record({ kind: 'image', name: tif.name.replace(/\.[^.]+$/, ''), image: id, width: g.width, height: g.height, gt: g.affine, crs }), t('mapl.undo.picture', { name: tif.name }));
    host.say((crs ? t('mapl.added.tif_crs', { name: tif.name, w: g.width, h: g.height, crs: crs.name }) : t('mapl.added.tif', { name: tif.name, w: g.width, h: g.height })) + (g.notes?.length ? ' ' + g.notes.join(' ') : ''));
    host.fitAll();
  }
  /** The picture's system: its .prj, else ask (the project's system / pick one / the project's own coordinates).
   *  → crs | null (project coordinates) | undefined (cancelled). */
  async function crsForFile(prj, name) {
    if (prj) {
      try { return crsFromPrj(await prj.text()).crs; } catch (e) { host.say(t('mapl.prj.bad', { name: prj.name, error: e.message })); }
    }
    const pc = pcrs();
    const ans = await host.ask({
      title: t('mapl.where.title', { name }),
      text: pc ? t('mapl.where.text_pc', { crs: pc.name }) : t('mapl.where.text_nopc'),
      buttons: [['cancel', t('cad.ui.cancel'), 'btn-line'], ['pick', t('mapl.where.pick'), 'btn-line'], ['same', pc ? t('mapl.where.project_sys') : t('mapl.where.project_coords'), 'btn-plot']],
    });
    if (ans === 'cancel') return undefined;
    if (ans === 'same') return pc ? { ...pc, local: null } : null;
    const c = await reg.pickCrs?.({ reason: t('mapl.where.reason', { name }), purpose: 'source' });
    return c || undefined;
  }
  const fileToDataUrl = (blob) => new Promise((ok, bad) => { const r = new FileReader(); r.onload = () => ok(String(r.result).replace(/^data:image\/jpg;/, 'data:image/jpeg;')); r.onerror = () => bad(new Error(t('mapl.pic.unreadable'))); r.readAsDataURL(blob.type ? blob : new Blob([blob], { type: /\.png$/i.test(blob.name || '') ? 'image/png' : 'image/jpeg' })); });
  /** A flat record for state.gis.maps. */
  function record({ kind, name, url = '', layer = '', style = '', format = 'image/png', version = '1.3.0', crs = null, attribution = '', image = '', width = 0, height = 0, gt = null, grid = '', set = '', template = '', subdomains = '' }) {
    const r = { id: newMapId(), name: B.clean(name, 120) || t('mapl.default_name'), kind, url, layer, style, format, version,
      crsCode: crs?.code ?? null, crsName: crs?.name || '', crsProj4: crs?.proj4 || '', crsUnit: crs?.unit || 'm',
      opacity: 1, visible: true, attribution: B.clean(attribution, 300), image, width, height,
      a0: gt?.[0] ?? 0, a1: gt?.[1] ?? 1, a2: gt?.[2] ?? 0, a3: gt?.[3] ?? 0, a4: gt?.[4] ?? 0, a5: gt?.[5] ?? -1, grid, set, template, subdomains };
    return r;
  }

  // ---------------------------------------------------------------- the Map dialog
  let dialogApi = null;
  async function fetchText(url, signal) {
    const r = await fetch(url, { ...FETCH_OPTS, signal });
    if (!r.ok) throw new Error(r.status === 404 ? t('mapl.http.404') : t('mapl.http.status', { status: r.status }));
    const len = Number(r.headers.get('content-length') || 0);
    if (len > 8 * 1024 * 1024) throw new Error(t('mapl.answer.big', { mb: Math.round(len / 1048576) }));
    const txt = await r.text();
    if (txt.length > 8 * 1024 * 1024) throw new Error(t('mapl.answer.too_big'));
    return txt;
  }
  const netError = (e) => (e?.name === 'AbortError' ? t('mapl.stopped') : e instanceof TypeError ? (navigator.onLine === false ? t('mapl.err.offline') : t('mapl.err.cors_read')) : e.message);

  function openDialog() {
    if (dialogApi) return;
    const id = 'cv-map-' + (++uid);
    const rows = el('ul', { className: 'cv-map-rows', 'aria-label': t('mapl.rows.aria') });
    const top = el('div', { className: 'cv-map-top' });
    const kindSel = el('select', { className: 'cv-select select-cc', id: id + '-kind', dataset: { mapKind: '' } },
      el('option', { value: 'image' }, t('mapl.kind.image')),
      el('option', { value: 'xyz' }, t('mapl.kind.xyz')),
      el('option', { value: 'wms' }, t('mapl.kind.wms_server')),
      el('option', { value: 'wmts' }, t('mapl.kind.wmts_server')),
      el('option', { value: 'arcgis' }, t('mapl.kind.arcgis')));
    const addBox = el('div', { className: 'cv-map-add' });
    const status = el('p', { className: 'cv-note cv-map-status', role: 'status', 'aria-live': 'polite' });
    let ctrl = null;
    const dlg = el('dialog', { className: 'cv-dialog cv-map', 'aria-labelledby': id + '-h', dataset: { mapDialog: '' } },
      el('form', { method: 'dialog', className: 'cv-dlg', onsubmit: (e) => e.preventDefault() },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('mapl.title')),
          el('button', { type: 'button', className: 'cv-x', 'aria-label': t('cad.ui.close'), dataset: { close: '' } }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }))),
        el('div', { className: 'cv-dlg-body' },
          top,
          el('section', { className: 'cv-crs-sec' }, el('h3', { className: 'cv-h3' }, t('mapl.layers')), rows),
          el('section', { className: 'cv-crs-sec' }, el('h3', { className: 'cv-h3' }, t('mapl.add_layer')),
            el('div', { className: 'cv-props' }, el('label', { htmlFor: kindSel.id }, t('mapl.from')), kindSel),
            addBox, status),
          el('p', { className: 'cv-note' }, t('mapl.screen_only'))),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', dataset: { close: '' } }, t('cad.ui.close')))));

    function render() {
      const kids = [];
      if (!internetOn()) kids.push(el('div', { className: 'cv-map-off', dataset: { mapOff: '' } },
        el('p', {}, el('strong', {}, t('mapl.off.head')), ' ' + t('mapl.off.body')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { mapSettings: '' } }, t('mapl.open_settings'))));
      if (!pcrs()) kids.push(el('p', { className: 'cv-crs-problem', dataset: { mapNoCrs: '' } }, t('mapl.no_crs')));
      top.replaceChildren(...kids);
      renderRows();
      renderAdd();
    }
    function renderRows() {
      const list = maps();
      if (!list.length) { rows.replaceChildren(el('li', { className: 'cv-note' }, t('mapl.none'))); return; }
      rows.replaceChildren(...list.map((m, i) => {
        const r = runtime.get(m.id), off = B.isInternet(m) && !internetOn(), needs = !conv(m);
        const why = off ? t('mapl.why.off') : needs ? t('mapl.why.crs') : r?.note || '';
        return el('li', { className: 'cv-map-row' + (off || needs ? ' is-off' : ''), dataset: { mapRow: m.id } },
          el('div', { className: 'cv-map-line' },
            el('label', { className: 'cv-map-name' }, el('input', { type: 'checkbox', checked: m.visible, dataset: { mapVisible: m.id } }), ' ', m.name),
            el('span', { className: 'cv-note' }, kindName(m.kind) + (m.crsName ? ' · ' + m.crsName : m.kind === 'image' ? ' · ' + t('mapl.row.proj_coords') : ''))),
          el('div', { className: 'cv-map-line' },
            el('label', { className: 'cv-map-op' }, t('mapl.opacity') + ' ', el('input', { type: 'range', min: '0', max: '100', step: '5', value: String(Math.round((m.opacity ?? 1) * 100)), dataset: { mapOpacity: m.id }, 'aria-label': t('mapl.opacity.aria', { name: m.name }) })),
            el('button', { type: 'button', className: 'cv-x', title: t('mapl.down.title'), 'aria-label': t('mapl.down.aria', { name: m.name }), disabled: i === 0, dataset: { mapMove: m.id, d: '-1' } }, el('i', { className: 'bi bi-arrow-down', 'aria-hidden': 'true' })),
            el('button', { type: 'button', className: 'cv-x', title: t('mapl.up.title'), 'aria-label': t('mapl.up.aria', { name: m.name }), disabled: i === list.length - 1, dataset: { mapMove: m.id, d: '1' } }, el('i', { className: 'bi bi-arrow-up', 'aria-hidden': 'true' })),
            m.kind === 'image' ? el('button', { type: 'button', className: 'cv-x', title: t('mapl.zoom.title'), 'aria-label': t('mapl.zoom.aria', { name: m.name }), dataset: { mapZoom: m.id } }, el('i', { className: 'bi bi-zoom-in', 'aria-hidden': 'true' })) : null,
            el('button', { type: 'button', className: 'cv-x', title: t('mapl.remove.title'), 'aria-label': t('mapl.remove.aria', { name: m.name }), dataset: { mapRemove: m.id } }, el('i', { className: 'bi bi-trash', 'aria-hidden': 'true' }))),
          why ? el('p', { className: 'cv-note cv-map-why', dataset: { mapNote: m.id } }, why) : null,
          m.attribution ? el('p', { className: 'cv-note' }, t('mapl.attribution', { text: m.attribution })) : null);
      }));
    }
    const kindName = (k) => ({ image: t('mapl.kind.picture'), xyz: t('mapl.kind.tiles'), wms: 'WMS', wmts: 'WMTS', arcgis: t('mapl.kind.arcgis_short') })[k] || k;

    // the "add" panels
    let found = null; // capabilities / service read for the panel
    function field(label, input) { return [el('label', { htmlFor: input.id }, label), input]; }
    function renderAdd() {
      const k = kindSel.value;
      found = null; status.textContent = '';
      const needNet = k !== 'image' && !internetOn();
      if (k === 'image') {
        const f = el('input', { type: 'file', multiple: true, accept: '.png,.jpg,.jpeg,.pgw,.pngw,.jgw,.jpgw,.wld,.prj,.tif,.tiff,.tfw', className: 'cv-input', id: id + '-file', dataset: { mapFile: '' } });
        addBox.replaceChildren(
          el('p', { className: 'cv-note' }, t('mapl.files.help')),
          el('div', { className: 'cv-props' }, ...field(t('mapl.files'), f)));
        return;
      }
      const url = el('input', { type: 'url', className: 'cv-input', id: id + '-url', autocomplete: 'off', spellcheck: 'false', dataset: { mapUrl: '' },
        placeholder: k === 'xyz' ? 'https://tile.example.org/{z}/{x}/{y}.png' : k === 'wms' ? 'https://example.org/geoserver/wms' : k === 'wmts' ? 'https://example.org/wmts/1.0.0/WMTSCapabilities.xml' : 'https://example.org/arcgis/rest/services/Name/MapServer' });
      const help = {
        xyz: t('mapl.help.xyz'),
        wms: t('mapl.help.wms'),
        wmts: t('mapl.help.wmts'),
        arcgis: t('mapl.help.arcgis'),
      }[k];
      const kids = [el('p', { className: 'cv-note' }, help), el('div', { className: 'cv-props' }, ...field(t('mapl.f.url'), url))];
      if (k === 'xyz') {
        const name = el('input', { type: 'text', className: 'cv-input', id: id + '-name', placeholder: t('mapl.f.name'), dataset: { mapName: '' } });
        const att = el('input', { type: 'text', className: 'cv-input', id: id + '-att', placeholder: t('mapl.att.placeholder'), dataset: { mapAtt: '' } });
        kids.push(el('div', { className: 'cv-props' }, ...field(t('mapl.f.name'), name), ...field(t('mapl.f.att'), att)),
          el('div', { className: 'cv-links' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', dataset: { mapAddXyz: '' } }, t('mapl.add'))));
      } else {
        kids.push(el('div', { className: 'cv-links' },
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { mapRead: '' }, disabled: needNet, title: needNet ? t('mapl.net_first') : '' }, k === 'arcgis' ? t('mapl.read_service') : t('mapl.get_layers')),
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { mapStop: '' }, hidden: true }, t('mapl.stop'))),
        el('div', { className: 'cv-map-found', dataset: { mapFound: '' } }));
      }
      if (needNet) kids.push(el('p', { className: 'cv-note' }, k === 'xyz' ? t('mapl.xyz.later') : t('mapl.read.needs_net')));
      addBox.replaceChildren(...kids);
    }
    function foundBox() { return addBox.querySelector('[data-map-found]'); }
    async function readServer() {
      const k = kindSel.value, raw = addBox.querySelector('[data-map-url]').value.trim();
      if (!internetOn()) { status.textContent = t('mapl.net_first'); return; }
      ctrl?.abort(); ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      const stop = addBox.querySelector('[data-map-stop]'); if (stop) stop.hidden = false;
      status.textContent = t('mapl.asking');
      try {
        if (k === 'wms') {
          const cap = B.parseWmsCapabilities(await fetchText(B.capabilitiesUrl(raw, 'WMS'), ctrl.signal));
          found = { kind: 'wms', cap, base: cap.getMap || raw };
          showWms(cap);
        } else if (k === 'wmts') {
          const cap = B.parseWmtsCapabilities(await fetchText(B.capabilitiesUrl(raw, 'WMTS'), ctrl.signal));
          found = { kind: 'wmts', cap, base: raw };
          showWmts(cap);
        } else {
          const { base } = B.arcgisBase(raw);
          const svc = B.parseArcgisService(await fetchText(base + '?f=json', ctrl.signal), base);
          found = { kind: 'arcgis', svc, base };
          showArcgis(svc);
        }
        status.textContent = '';
      } catch (e) { status.textContent = netError(e); foundBox()?.replaceChildren(); } finally { clearTimeout(timer); if (stop) stop.hidden = true; }
    }
    const pcode = () => pcrs()?.code ?? null;
    function showWms(cap) {
      const sel = el('select', { className: 'cv-select select-cc', id: id + '-layer', dataset: { mapLayer: '' } }, ...cap.layers.slice(0, 2000).map((l, i) => el('option', { value: String(i) }, l.title + (l.title !== l.name ? ' (' + l.name + ')' : ''))));
      const info = el('p', { className: 'cv-note', dataset: { mapInfo: '' } });
      const upd = () => {
        const l = cap.layers[Number(sel.value)], code = B.wmsPickCode(l.codes, pcode());
        info.textContent = code == null ? t('mapl.wms.no_place') : t(code === pcode() ? 'mapl.wms.code_same' : 'mapl.wms.code_warp', { code }) + (l.attribution ? ' ' + t('mapl.attribution', { text: l.attribution }) : '');
      };
      sel.addEventListener('change', upd); upd();
      foundBox().replaceChildren(el('p', { className: 'cv-note' }, t('mapl.wms.found', { title: cap.title || t('mapl.kind.wms_server'), version: cap.version, n: cap.layers.length })),
        el('div', { className: 'cv-props' }, ...field(t('mapl.f.layer'), sel)), info,
        el('div', { className: 'cv-links' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', dataset: { mapAddFound: '' } }, t('mapl.add'))));
    }
    function showWmts(cap) {
      const sel = el('select', { className: 'cv-select select-cc', id: id + '-layer', dataset: { mapLayer: '' } }, ...cap.layers.slice(0, 2000).map((l, i) => el('option', { value: String(i) }, l.title)));
      const setSel = el('select', { className: 'cv-select select-cc', id: id + '-set', dataset: { mapSet: '' } });
      const upd = () => {
        const l = cap.layers[Number(sel.value)];
        const sets = l.sets.map((s) => cap.sets[s]).filter((s) => s && s.code);
        const best = sets.find((s) => s.code === pcode()) || sets.find((s) => s.code === 3857) || sets.find((s) => byCodeSafe(s.code));
        setSel.replaceChildren(...sets.map((s) => el('option', { value: s.id, selected: s === best }, t(byCodeSafe(s.code) ? 'mapl.set.opt' : 'mapl.set.opt_missing', { id: s.id, code: s.code }))));
      };
      sel.addEventListener('change', upd); upd();
      foundBox().replaceChildren(el('p', { className: 'cv-note' }, t('mapl.wmts.found', { title: cap.title || t('mapl.kind.wmts_server'), n: cap.layers.length })),
        el('div', { className: 'cv-props' }, ...field(t('mapl.f.layer'), sel), ...field(t('mapl.f.set'), setSel)),
        el('div', { className: 'cv-links' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', dataset: { mapAddFound: '' } }, t('mapl.add'))));
    }
    function showArcgis(svc) {
      const ok = svc.tiled || (svc.code && byCodeSafe(svc.code)) || pcode();
      foundBox().replaceChildren(el('p', { className: 'cv-note', dataset: { mapInfo: '' } }, t(svc.tiled ? 'mapl.arc.tiled' : pcode() ? 'mapl.arc.one_code' : 'mapl.arc.one_own', { name: svc.name || t('mapl.arc.service'), kind: svc.kind, code: pcode() }) + (svc.attribution ? ' ' + t('mapl.attribution', { text: svc.attribution }) : '')),
        ok ? el('div', { className: 'cv-links' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', dataset: { mapAddFound: '' } }, t('mapl.add'))) : el('p', { className: 'cv-crs-problem' }, t('mapl.arc.no_place')));
    }
    function addFound() {
      if (!found) return;
      try {
        if (found.kind === 'wms') {
          const l = found.cap.layers[Number(addBox.querySelector('[data-map-layer]').value)];
          const code = B.wmsPickCode(l.codes, pcode());
          if (code == null) { status.textContent = t('mapl.wms.no_system'); return; }
          const crs = code === pcode() ? { ...pcrs(), local: null } : crsFromEntry(byCode(code));
          const fmt = found.cap.formats.find((f) => /png/i.test(f)) || found.cap.formats.find((f) => /jpe?g/i.test(f)) || 'image/png';
          addMap(record({ kind: 'wms', name: l.title, url: B.checkUrl(found.base).href, layer: l.name, style: '', format: fmt, version: found.cap.version, crs, attribution: l.attribution }));
        } else if (found.kind === 'wmts') {
          const l = found.cap.layers[Number(addBox.querySelector('[data-map-layer]').value)], set = found.cap.sets[addBox.querySelector('[data-map-set]').value];
          const e = set && byCodeSafe(set.code);
          if (!e) { status.textContent = t('mapl.wmts.no_set'); return; }
          const crs = crsFromEntry(e);
          let toSet = null; try { toSet = frame(crs).fromLonLat ? (lon, lat) => frame(crs).fromLonLat(lon, lat) : null; } catch { toSet = null; }
          const grid = B.wmtsGrid(set, e.unit, { toSet, bbox84: l.bbox84 });
          const fmt = l.formats.find((f) => /png/i.test(f)) || l.formats[0] || 'image/png';
          const tpl = l.templates.find((t) => t.format === fmt) || l.templates[0];
          const style = (l.styles.find((s) => s.isDefault) || l.styles[0])?.id || 'default';
          if (!tpl && !found.cap.kvp) { status.textContent = t('mapl.wmts.no_tile'); return; }
          addMap(record({ kind: 'wmts', name: l.title, url: B.checkUrl(found.cap.kvp || found.base).href, layer: l.id, style, format: fmt, crs, attribution: l.attribution, grid: B.gridJson(grid), set: set.id, template: tpl?.template || '' }));
        } else {
          const svc = found.svc;
          if (svc.tiled) addMap(record({ kind: 'arcgis', name: svc.name || t('mapl.arc.default_name'), url: found.base, layer: svc.kind, crs: crsFromEntry(byCode(3857)), attribution: svc.attribution, grid: B.gridJson(svc.grid) }));
          else {
            const code = pcode() || svc.code;
            const crs = code === pcode() ? { ...pcrs(), local: null } : crsFromEntry(byCode(code));
            addMap(record({ kind: 'arcgis', name: svc.name || t('mapl.arc.default_name'), url: found.base, layer: svc.kind, crs, attribution: svc.attribution }));
          }
        }
        status.textContent = internetOn() ? t('mapl.added') : t('mapl.added_off');
      } catch (e) { status.textContent = e.message; }
    }
    function addXyz() {
      try {
        const tpl = B.checkTemplate(addBox.querySelector('[data-map-url]').value);
        const name = addBox.querySelector('[data-map-name]').value.trim() || new URL(tpl.replace(/\{-?\w+\}/g, '0')).hostname;
        addMap(record({ kind: 'xyz', name, url: tpl, crs: crsFromEntry(byCode(3857)), attribution: addBox.querySelector('[data-map-att]').value }));
        status.textContent = internetOn() ? t('mapl.added') : t('mapl.added_off');
      } catch (e) { status.textContent = e.message; }
    }
    const edit = (label, fn) => { project().change(label, (s) => fn(s.gis.maps)); host.view.invalidate(true); renderRows(); };

    dlg.addEventListener('click', (e) => {
      const btn = e.target.closest('button'); if (!btn) return;
      const d = btn.dataset;
      if (d.close !== undefined) { dlg.close(); return; }
      if (d.mapSettings !== undefined) { dlg.close(); document.querySelector('[data-settings-open]')?.click(); return; }
      if (d.mapRead !== undefined) { readServer(); return; }
      if (d.mapStop !== undefined) { ctrl?.abort(); return; }
      if (d.mapAddFound !== undefined) { addFound(); return; }
      if (d.mapAddXyz !== undefined) { addXyz(); return; }
      if (d.mapRemove) { const m = maps().find((x) => x.id === d.mapRemove); edit(t('mapl.undo.remove', { name: m?.name || '' }), (l) => { const i = l.findIndex((x) => x.id === d.mapRemove); if (i >= 0) l.splice(i, 1); }); runtime.delete(d.mapRemove); return; }
      if (d.mapMove) { edit(t('mapl.undo.reorder'), (l) => { const i = l.findIndex((x) => x.id === d.mapMove), j = i + Number(d.d); if (i >= 0 && j >= 0 && j < l.length) [l[i], l[j]] = [l[j], l[i]]; }); return; }
      if (d.mapZoom) { const m = maps().find((x) => x.id === d.mapZoom), cv = m && conv(m); if (!cv) return; const xs = [], ys = []; for (const [u, v] of [[0, 0], [m.width, 0], [m.width, m.height], [0, m.height]]) { const [x, y] = cv.fromSrc(...B.pixelToSystem([m.a0, m.a1, m.a2, m.a3, m.a4, m.a5], u, v)); xs.push(x); ys.push(y); } host.view.fit({ minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) }); }
    });
    dlg.addEventListener('change', (e) => {
      const tg = e.target, d = tg.dataset || {};
      if (tg === kindSel) { renderAdd(); return; }
      if (d.mapVisible) { const r = rt(d.mapVisible); r.blocked = false; r.fails = 0; r.said = false; r.note = ''; edit(tg.checked ? t('mapl.undo.show') : t('mapl.undo.hide'), (l) => { const m = l.find((x) => x.id === d.mapVisible); if (m) m.visible = tg.checked; }); return; }
      if (d.mapOpacity) { const v = Math.max(0, Math.min(100, Number(tg.value))) / 100; delete rt(d.mapOpacity).opacity; edit(t('mapl.undo.opacity'), (l) => { const m = l.find((x) => x.id === d.mapOpacity); if (m) m.opacity = v; }); return; }
      if (d.mapFile !== undefined && tg.files?.length) { const fs = [...tg.files]; tg.value = ''; addImageFiles(fs).then(() => renderRows()); }
    });
    dlg.addEventListener('input', (e) => {
      const d = e.target.dataset || {};
      if (d.mapOpacity) { rt(d.mapOpacity).opacity = Number(e.target.value) / 100; host.view.invalidate(true); }
    });
    dlg.addEventListener('keydown', (e) => e.stopPropagation());
    dlg.addEventListener('close', () => { ctrl?.abort(); dialogApi = null; dlg.remove(); host.refocus(); });
    host.root.append(dlg);
    dialogApi = { render, renderRows };
    render();
    dlg.showModal();
    kindSel.focus();
  }
  function byCodeSafe(c) { try { return byCode(c); } catch { return null; } }
}
