/* SPDX-License-Identifier: Apache-2.0 */
/**
 * surface-ui.js — from the cloud to ground, checks and numbers (spec § 10, PC.7 / PC.8 / PC.9):
 *   Build ground   class-2 points → engine groundSurface → residuals → the project's Existing ground. The points reach the project
 *                  through project.editPoints(), the SAME call the LAS import dialog (gis-terrain-ui.js applyPoints) makes: one undo
 *                  step, described GROUND, and the project's own surface code builds the TIN. There is no second TIN path.
 *   Residuals      numbers (n, mean, RMS, 95th percentile, share within tolerance), the ten worst places (click to fly), a heat map
 *                  in the plan and a colour mode on the cloud. They are numbers on THIS data, not a certificate.
 *   Breaklines     picked on the cloud (snaps to the nearest drawn point), used by the next build.
 *   Contours       the project's contour interval, how many lines the ground gives.
 *   Volumes        stockpile above a base inside a drawn boundary; flight A to flight B. Tables and CSV.
 *   Export         the cleaned, classified cloud as LAS 1.4, or as LAZ (our own compressor, PC.14).
 */
import { el, field, select, numInput, dialog, progressRow, download, csv } from './ui.js';
import { drawRing, activeHost } from './overlay.js';
import { fmtN, fmt, bytesText } from './ctx.js';
import { nextNumber } from '../../terrain.js';

export function mountSurface(ctx) {
  const t = ctx.t;
  const spacing = numInput(2, { min: 0.1, step: 0.5, 'data-pc-s-spacing': '' });
  const mode = select([['nearest', t('pc.s.mode.nearest')], ['lowest', t('pc.s.mode.lowest')], ['average', t('pc.s.mode.average')]], 'nearest', { 'data-pc-s-mode': '' });
  const maxEdge = numInput(0, { min: 0, step: 5, 'data-pc-s-maxedge': '' });
  const build = el('button', { type: 'button', className: 'btn-plot', disabled: true, 'data-pc-build-ground': '' }, t('pc.s.build'));
  const report = el('div', { className: 'pc-note', 'data-pc-s-report': '', role: 'status' });
  const resBox = el('div', { 'data-pc-resid': '' });
  let ctl = null;
  const prog = progressRow(t('pc.cancel'), () => ctl && ctl.abort());
  prog.row.setAttribute('data-pc-s-progress', '');

  const sync = () => { build.disabled = !ctx.cloud || !!ctl; };
  ctx.on('cloud', () => { ctx.surface = null; ctx.resid = null; ctx.breaklines = []; preview.hidden = true; report.replaceChildren(); resBox.replaceChildren(); blList(); sync(); });

  // ---- build
  build.addEventListener('click', async () => {
    ctl = new AbortController(); sync(); report.replaceChildren(); resBox.replaceChildren();
    try {
      const progress = (f, phase) => prog.set(f * 0.8, (t('pc.progress.' + phase) !== 'pc.progress.' + phase ? t('pc.progress.' + phase) : phase || '') + ' ' + Math.round(f * 100) + ' %');
      const g = await ctx.PC.groundSurface(ctx.cloud, { spacing: Number(spacing.value), mode: mode.value, maxEdge: Number(maxEdge.value) || 0,
        breaklines: ctx.breaklines.map((b) => ({ name: b.name, pts: b.pts.map((p) => ({ x: p[0], y: p[1], z: p[2] })) })), signal: ctl.signal, progress });
      ctx.surface = g.surface; ctx.surfaceReport = g.report;
      const tol = ctx.classTolerance || 0.15;
      const r = await ctx.PC.residuals(ctx.cloud, g.surface, { cell: 1, tolerance: tol, signal: ctl.signal, progress: (f) => prog.set(0.8 + f * 0.2, Math.round(f * 100) + ' %') });
      ctx.resid = r;
      prog.hide();
      const n = addToProject(g.surface);
      report.append(el('div', { 'data-pc-s-done': n }, t('pc.s.done', { kept: fmtN(g.report.kept), seen: fmtN(g.report.seen), points: fmtN(n), tris: fmtN((g.surface.tris || []).length / 3) })));
      if (g.report.capped) report.append(el('div', {}, t('pc.s.capped')));
      showResiduals(r, tol);
      ctx.view.setResidual(r.grid, tol);
      ctx.emit('surface');
    } catch (e) { prog.hide(); report.append(el('div', {}, ctx.isAbort(e) ? t('pc.stopped') : ctx.err(e))); }
    ctl = null; sync();
  });

  /** The project's existing ground, the way the LAS import does it (gis-terrain-ui.js applyPoints): editPoints, described GROUND. */
  function addToProject(S) {
    const proj = ctx.project();
    if (!proj) return 0;
    const pts = [];
    for (let i = 0; i < S.X.length; i++) pts.push({ x: S.X[i] + S.ox, y: S.Y[i] + S.oy, z: S.Z[i], d: 'GROUND' });
    const before = ctx.addedNums;
    proj.editPoints(t('pc.s.undo'), (old, s) => {
      const keep = old.filter((p) => !before.has(p.n));
      let n = nextNumber(keep);
      const add = pts.map((p) => ({ n: String(n++), x: p.x, y: p.y, z: p.z, d: 'GROUND' }));
      ctx.addedNums = new Set(add.map((p) => p.n));
      return keep.concat(add);
    });
    if (ctx.breaklines.length) {
      proj.change(t('pc.s.undo.bl'), (s) => {
        s.surface.breaklines = s.surface.breaklines.filter((b) => !(b.name || '').startsWith('PC '));
        ctx.breaklines.forEach((b, i) => s.surface.breaklines.push({ name: 'PC ' + (i + 1), pts: b.pts.map((p) => ({ x: p[0], y: p[1], z: p[2] })) }));
      });
    }
    const a = ctx.app();
    if (a && a.view) { const b = ctx.cloud.bounds; a.view.fit({ minX: b.min[0], minY: b.min[1], maxX: b.max[0], maxY: b.max[1] }); }
    return pts.length;
  }

  function showResiduals(r, tol) {
    const s = r.stats;
    const rows = [[t('pc.r.n'), fmtN(s.n)], [t('pc.r.mean'), fmt(s.mean, 3)], [t('pc.r.rms'), fmt(s.rms, 3)], [t('pc.r.p95'), fmt(s.p95, 3)],
      [t('pc.r.within', { tol: fmt(tol, 2) }), fmt(s.within * 100, 1) + ' %'], [t('pc.r.outside'), fmtN(s.outside)]];
    const worst = el('ol', { className: 'pc-list', 'data-pc-worst': '' }, ...s.worst.map((w) => el('li', {},
      el('span', {}, t('pc.r.worst.row', { x: fmt(w.x, 1), y: fmt(w.y, 1), res: fmt(w.res, 3), n: fmtN(w.n) })),
      el('button', { type: 'button', className: 'btn-line', 'data-pc-fly': '', onclick: () => fly(w.x, w.y) }, t('pc.r.fly')))));
    resBox.replaceChildren(el('div', { className: 'pc-note' }, t('pc.r.honest')),
      el('table', { className: 'pc-table', 'data-pc-r-table': '' }, ...rows.map(([k, v]) => el('tr', {}, el('th', {}, k), el('td', { className: 'num' }, v)))),
      el('div', { className: 'pc-note' }, t('pc.r.worst')), worst);
  }
  function fly(x, y) {
    const z = ctx.surface ? ctx.surface.elevationAt(x, y, 1e-6) : null, zz = z == null ? (ctx.cloud.bounds.min[2] + ctx.cloud.bounds.max[2]) / 2 : z;
    const a = ctx.app();
    if (a && a.view) { a.view.cx = x; a.view.cy = y; a.view.invalidate(true); }
    if (ctx.view.attached) ctx.view.flyTo(x, y, zz, 40);
  }

  // ---- breaklines picked on the cloud
  const blBtn = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pc-bl-pick': '' }, t('pc.bl.pick'));
  const blDone = el('button', { type: 'button', className: 'btn-line', hidden: true, 'data-pc-bl-done': '' }, t('pc.bl.done'));
  const blUl = el('ul', { className: 'pc-list', 'data-pc-bl-list': '' });
  let picking = null;
  function blList() {
    blUl.replaceChildren(...ctx.breaklines.map((b, i) => el('li', {}, el('span', {}, t('pc.bl.row', { n: i + 1, pts: b.pts.length })),
      el('button', { type: 'button', className: 'btn-line', onclick: () => { ctx.breaklines.splice(i, 1); blList(); } }, t('pc.list.remove')))));
  }
  blBtn.addEventListener('click', async () => {
    await ctx.view.attach();
    picking = []; blDone.hidden = false; blBtn.disabled = true;
    ctx.status(t('pc.bl.hint'));
    const cv = ctx.view.canvas();
    let down = null;
    const onDown = (e) => { down = [e.clientX, e.clientY]; };
    const onUp = (e) => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4 || e.button !== 0) return;
      const r = cv.getBoundingClientRect(), p = ctx.view.pickPoint(e.clientX - r.left, e.clientY - r.top, 12);
      if (p) { picking.push(p); ctx.status(t('pc.bl.picked', { n: picking.length })); }
    };
    cv.addEventListener('pointerdown', onDown, true); cv.addEventListener('pointerup', onUp, true);
    picking.stop = () => { cv.removeEventListener('pointerdown', onDown, true); cv.removeEventListener('pointerup', onUp, true); };
  });
  // the same breaklines picked in the plan: click vertices (double-click or Enter ends); each takes the nearest cloud point (ground first)
  const blPlan = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pc-bl-plan': '' }, t('pc.bl.plan'));
  blPlan.addEventListener('click', async () => {
    const app = ctx.app();
    if (!app || !ctx.cloud) return;
    if (picking) { picking.stop(); picking = null; blDone.hidden = true; }
    if (activeHost().kind === '3d') await app.show3D(false);
    ctx.status(t('pc.bl.planhint'));
    const ring = await drawRing(ctx, 'polyline', { message: t('pc.bl.planhint') });
    blBtn.disabled = !ctx.cloud;
    if (!ring) { ctx.status(t('pc.stopped')); return; }
    const v = app.view, w0 = v.toWorld(0, 0), w1 = v.toWorld(10, 0), rad = Math.abs(w1.x - w0.x) || 1;   // 10 screen pixels in ground units
    const pts = []; let skipped = 0;
    for (const [x, y] of ring) {
      let q = await ctx.PC.nearestPoint(ctx.cloud, x, y, rad);
      if (!q && ctx.surface) { const z = ctx.surface.elevationAt(x, y, 1e-6); if (z !== null) q = [x, y, z]; }
      if (!q) { skipped++; continue; }
      const last = pts[pts.length - 1];
      if (!last || last[0] !== q[0] || last[1] !== q[1]) pts.push(q);
    }
    if (pts.length < 2) { ctx.status(t('pc.bl.planfew')); return; }
    ctx.breaklines.push({ name: 'PC', pts }); blList();
    ctx.status(t('pc.bl.plansaved', { n: pts.length, skipped }));
  });
  blDone.addEventListener('click', () => {
    if (picking) { picking.stop(); if (picking.length >= 2) ctx.breaklines.push({ name: 'PC', pts: picking.slice() }); }
    picking = null; blDone.hidden = true; blBtn.disabled = !ctx.cloud; blList(); ctx.status(t('pc.bl.saved'));
  });
  ctx.on('cloud', () => { blBtn.disabled = !ctx.cloud; blPlan.disabled = !ctx.cloud; });

  // ---- contours
  const interval = numInput(1, { min: 0.05, step: 0.5, 'data-pc-c-interval': '' });
  const contourOut = el('div', { className: 'pc-note', 'data-pc-contours': '', role: 'status' });
  // a small plan picture: the cloud's plan raster with the contour lines over it (the lines come from the ground this add-on built,
  // else the project's own); every 5th line heavier
  const preview = el('canvas', { width: 360, height: 270, className: 'pc-strip', hidden: true, 'data-pc-contour-canvas': '', role: 'img', 'aria-label': t('pc.c.preview') });
  function drawContourPreview(lines, step) {
    preview.hidden = false;
    const g = preview.getContext('2d'), W = preview.width, H = preview.height, b = ctx.cloud && ctx.cloud.bounds;
    const css = getComputedStyle(document.documentElement);
    g.clearRect(0, 0, W, H); g.fillStyle = css.getPropertyValue('--sheet').trim() || '#fff'; g.fillRect(0, 0, W, H);
    if (!b) return;
    const bw = b.max[0] - b.min[0] || 1, bh = b.max[1] - b.min[1] || 1, k = Math.min((W - 8) / bw, (H - 8) / bh);
    const ox = (W - bw * k) / 2, oy = (H - bh * k) / 2, X = (x) => ox + (x - b.min[0]) * k, Y = (y) => H - oy - (y - b.min[1]) * k;
    const snap = ctx.plan && ctx.plan.snapshot();
    if (snap) { g.save(); g.imageSmoothingEnabled = false; g.globalAlpha = 0.55; g.drawImage(snap.img, X(snap.box.x0), Y(snap.box.y1), (snap.box.x1 - snap.box.x0) * k, (snap.box.y1 - snap.box.y0) * k); g.restore(); }
    const ink = css.getPropertyValue('--action').trim() || '#1e48c8';
    g.strokeStyle = ink; g.lineJoin = 'round';
    let drawn = 0;
    for (const l of lines) {
      if (!l.pts || l.pts.length < 2) continue;
      const major = Math.abs(Math.round(l.z / step) % 5) === 0;
      g.lineWidth = major ? 1.6 : 0.7; g.globalAlpha = major ? 1 : 0.8;
      g.beginPath(); g.moveTo(X(l.pts[0].x), Y(l.pts[0].y));
      for (let i = 1; i < l.pts.length; i++) g.lineTo(X(l.pts[i].x), Y(l.pts[i].y));
      if (l.closed) g.closePath();
      g.stroke(); drawn++;
    }
    g.globalAlpha = 1;
    preview.dataset.lines = String(drawn);
  }
  const contourBtn = el('button', { type: 'button', className: 'btn-line', 'data-pc-contours-btn': '', onclick: () => {
    const proj = ctx.project();
    if (!proj) return;
    const v = Number(interval.value) || 1;
    if (proj.state.display.interval !== v) proj.change(t('pc.c.undo'), (s) => { s.display.interval = v; });
    const lines = ctx.surface ? (ctx.surface.contours(v) || []) : proj.contours();
    const zs = lines.map((l) => l.z);
    drawContourPreview(lines, v);
    contourOut.textContent = lines.length ? t('pc.c.out', { n: fmtN(lines.length), lo: fmt(Math.min(...zs), 2), hi: fmt(Math.max(...zs), 2), step: fmt(v, 2) }) : t('pc.c.none');
    const a = ctx.app(); if (a && a.view) a.view.invalidate(true);
  } }, t('pc.c.show'));

  // ---- stockpile
  async function stockDialog() {
    let ring = null;
    const base = select([['lowest', t('pc.v.base.lowest')], ['plane', t('pc.v.base.plane')], ['tin', t('pc.v.base.tin')], ['quadric', t('pc.v.base.quadric')], ['z', t('pc.v.base.z')]], 'lowest', { 'data-pc-v-base': '' });
    const zIn = numInput(0, { 'data-pc-v-z': '' }), cellIn = numInput(0.5, { min: 0.1, step: 0.1, 'data-pc-v-cell': '' });
    const out = el('div', { 'data-pc-v-out': '', role: 'status' }), ringNote = el('div', { className: 'pc-note', 'data-pc-v-ring': '' }, t('pc.v.noring'));
    let last = null;
    const d = dialog({ title: t('pc.v.title'), attr: 'data-pc-stock', body: el('div', {}, el('p', { className: 'pc-note' }, t('pc.v.what')),
      el('div', { className: 'pc-row' }, el('button', { type: 'button', className: 'btn-line', 'data-pc-v-draw': '', onclick: async () => {
        d.dlg.close(); ring = await drawRing(ctx, 'polygon', { message: t('pc.v.draw') }); d.dlg.showModal();
        ringNote.textContent = ring ? t('pc.v.ring', { n: ring.length }) : t('pc.v.noring');
      } }, t('pc.v.drawbtn')), ringNote), field(t('pc.v.base'), base), field(t('pc.v.z'), zIn), field(t('pc.v.cell'), cellIn), out), buttons: [
      { label: t('pc.close'), onClick: (close) => close() },
      { label: t('pc.v.csv'), attr: 'data-pc-v-csv', onClick: () => { if (last) download('stockpile.csv', csv(last), 'text/csv'); } },
      { label: t('pc.v.run'), kind: 'plot', attr: 'data-pc-v-run', onClick: async () => {
        if (!ring) { out.textContent = t('pc.v.noring'); return; }
        out.textContent = t('pc.v.working');
        try {
          const b = base.value === 'z' ? Number(zIn.value) : base.value;
          const r = await ctx.PC.stockpile(ctx.cloud, ring, { base: b, cell: Number(cellIn.value) });
          const baseTxt = r.base.kind === 'plane' ? t('pc.v.base.plane') : r.base.kind === 'tin' ? t('pc.v.base.tin') : r.base.kind === 'quadric' ? t('pc.v.base.quadric') : fmt(r.base.z, 3);
          last = [[t('pc.v.col.what'), t('pc.v.col.value')], [t('pc.v.volume'), r.volume.toFixed(3)], [t('pc.v.area'), r.area.toFixed(3)], [t('pc.v.basecol'), baseTxt], [t('pc.v.outside'), r.outsideArea.toFixed(3)]];
          out.replaceChildren(el('table', { className: 'pc-table' }, ...last.slice(1).map(([k, v]) => el('tr', {}, el('th', {}, k), el('td', { className: 'num' }, v)))),
            r.outsideArea > 0 ? el('div', { className: 'pc-warn', 'data-pc-v-warn': '' }, t('pc.v.leaves', { area: fmt(r.outsideArea, 1) })) : null);
        } catch (e) { out.textContent = ctx.err(e); }
      } }] });
  }

  // ---- flight to flight
  async function flightDialog() {
    const ids = [];
    for (const k of await ctx.getStore().list('cct/')) { const id = k.split('/')[1]; if (id && id !== ctx.cloud.id && !ids.includes(id) && k.endsWith('/cloud.json')) ids.push(id); }
    const opts = [];
    for (const id of ids) { try { const m = JSON.parse(new TextDecoder().decode(await ctx.getStore().get('cct/' + id + '/cloud.json'))); if (!m.building) opts.push([id, m.name || id]); } catch { /* skip */ } }
    const body = el('div', {});
    if (!opts.length) body.append(el('p', { className: 'pc-note' }, t('pc.f.none')));
    const other = select(opts.length ? opts : [['', '–']], opts.length ? opts[0][0] : '', { 'data-pc-f-other': '' });
    const cellIn = numInput(1, { min: 0.1, step: 0.5, 'data-pc-f-cell': '' }), out = el('div', { 'data-pc-f-out': '', role: 'status' });
    let last = null;
    body.append(el('p', { className: 'pc-note' }, t('pc.f.what', { a: ctx.cloud.meta.name || ctx.cloud.id })), field(t('pc.f.other'), other), field(t('pc.v.cell'), cellIn), out);
    dialog({ title: t('pc.f.title'), attr: 'data-pc-flight', body, buttons: [
      { label: t('pc.close'), onClick: (close) => close() },
      { label: t('pc.v.csv'), attr: 'data-pc-f-csv', onClick: () => { if (last) download('flight-volume.csv', csv(last), 'text/csv'); } },
      { label: t('pc.v.run'), kind: 'plot', attr: 'data-pc-f-run', onClick: async () => {
        if (!opts.length) return;
        out.textContent = t('pc.v.working');
        try {
          const cb = await ctx.PC.openCloud(ctx.getStore(), other.value);
          const A = (await ctx.PC.groundSurface(ctx.cloud, { spacing: Number(spacing.value) })).surface, B = (await ctx.PC.groundSurface(cb, { spacing: Number(spacing.value) })).surface;
          const r = await ctx.PC.volumeBetween(A, B, { cell: Number(cellIn.value) });
          last = [[t('pc.v.col.what'), t('pc.v.col.value')], [t('pc.f.cut'), r.cut.toFixed(3)], [t('pc.f.fill'), r.fill.toFixed(3)], [t('pc.f.net'), r.net.toFixed(3)], [t('pc.v.area'), r.area.toFixed(3)], [t('pc.v.outside'), r.outsideArea.toFixed(3)]];
          out.replaceChildren(el('table', { className: 'pc-table' }, ...last.slice(1).map(([k, v]) => el('tr', {}, el('th', {}, k), el('td', { className: 'num' }, v)))));
        } catch (e) { out.textContent = ctx.err(e); }
      } }] });
  }

  // ---- export
  /** A file the browser writes as we go: null when it cannot (then the export is gathered and downloaded); throws when the person cancels the picker. */
  async function pickFile(name, laz) {
    if (typeof window.showSaveFilePicker !== 'function') return null;
    let h;
    try { h = await window.showSaveFilePicker({ suggestedName: name, types: [laz ? { description: 'LAZ', accept: { 'application/octet-stream': ['.laz'] } } : { description: 'LAS', accept: { 'application/octet-stream': ['.las'] } }] }); }   // i18n-ignore: file type names
    catch (e) { if (e && e.name === 'AbortError') throw e; return null; }
    const w = await h.createWritable();
    // writeAt: LAZ writes the chunk table's position at the start of the points once they are written (the browser's file can seek)
    return { write: (b) => w.write(b), writeAt: (pos, b) => w.write({ type: 'write', position: pos, data: b }), close: () => w.close(), abort: () => w.abort() };
  }
  /** Bytes already gathered, rewritten in place (the LAZ chunk table position when the file is downloaded at the end). */
  function patchChunks(chunks, pos, b) {
    let o = 0;
    for (const c of chunks) { for (let i = 0; i < b.length; i++) { const at = pos + i - o; if (at >= 0 && at < c.length) c[at] = b[i]; } o += c.length; if (o >= pos + b.length) break; }
  }

  async function exportDialog() {
    const which = select([['all', t('pc.x.all')], ['clean', t('pc.x.clean')], ['ground', t('pc.x.ground')]], 'all', { 'data-pc-x-which': '' });
    const rgb = !!(ctx.cloud.meta.attrs && ctx.cloud.meta.attrs.rgb);
    // PC.14: LAZ is written by our own compressor (lib/pointcloud/laz.js) as point format 0, or 2 with colour, in a LAS 1.4 header
    const kind = select([['las', t('pc.x.kind.las')], ['laz', t('pc.x.kind.laz')]], 'las', { 'data-pc-x-kind': '' });
    const fmtSel = select([[6, t('pc.x.f6')], [7, t('pc.x.f7')]], rgb ? 7 : 6, { 'data-pc-x-format': '' });
    const lazNote = el('p', { className: 'pc-note', 'data-pc-x-laznote': '', hidden: true }, t('pc.x.laz.what'));
    kind.onchange = () => {
      const laz = kind.value === 'laz';
      const opts = laz ? [[0, t('pc.x.f0')], [2, t('pc.x.f2')]] : [[6, t('pc.x.f6')], [7, t('pc.x.f7')]];
      fmtSel.replaceChildren(...opts.map(([v, l]) => el('option', { value: String(v) }, l)));
      fmtSel.value = String(laz ? (rgb ? 2 : 0) : (rgb ? 7 : 6));
      lazNote.hidden = !laz;
    };
    const out = el('div', { 'data-pc-x-out': '', role: 'status' });
    let ctl = null;
    const prog = progressRow(t('pc.cancel'), () => ctl && ctl.abort());
    dialog({ title: t('pc.x.title'), attr: 'data-pc-export', body: el('div', {}, el('p', { className: 'pc-note' }, t('pc.x.what')), typeof window.showSaveFilePicker === 'function' ? el('p', { className: 'pc-note', 'data-pc-x-stream': '' }, t('pc.x.stream')) : (ctx.cloud.meta.count * 36 > 5e8 ? el('p', { className: 'pc-warn', 'data-pc-x-big': '' }, t('pc.x.big', { size: bytesText(ctx.cloud.meta.count * 36) })) : null), field(t('pc.x.kind'), kind), lazNote, field(t('pc.x.which'), which), field(t('pc.x.format'), fmtSel), prog.row, out), buttons: [
      { label: t('pc.close'), onClick: (close) => { if (ctl) ctl.abort(); close(); } },
      { label: t('pc.x.run'), kind: 'plot', attr: 'data-pc-x-run', onClick: async () => {
        out.textContent = '';
        // PC.9: where the browser can write a file as it goes (Chromium, the Studio window) the points never pile up in memory: each
        // node's bytes go straight to the file the person picked. Elsewhere the file is gathered and downloaded (fine to a few hundred MB).
        const laz = kind.value === 'laz', name = (ctx.cloud.meta.name || 'cloud') + '-clean' + (laz ? '.laz' : '.las');
        let file = null;
        try { file = await pickFile(name, laz); } catch (e) { out.textContent = t('pc.stopped'); return; }
        ctl = new AbortController();
        const chunks = [];
        try {
          const sink = file ? { write: (b) => file.write(b), writeAt: (p, b) => file.writeAt(p, b), close: () => file.close() }
            : { write: (b) => { chunks.push(new Uint8Array(b).slice()); }, writeAt: (p, b) => { patchChunks(chunks, p, b); }, close: () => {} };
          const classes = which.value === 'ground' ? [2] : which.value === 'clean' ? [1, 2, 3, 4, 5, 6, 9] : null;
          const r = await ctx.PC.exportLas(ctx.cloud, sink, { laz, classes, format: Number(fmtSel.value), signal: ctl.signal, progress: (f) => prog.set(f, Math.round(f * 100) + ' %') });
          prog.hide();
          const ratio = laz && r.lasBytes ? t('pc.x.ratio', { pct: Math.round(100 * r.bytes / r.lasBytes) }) : '';
          if (file) {
            ctx.lastExport = { points: r.points, bytes: r.bytes, bounds: r.bounds, classCounts: r.classCounts, streamed: true, laz, format: r.format, lasBytes: r.lasBytes };
            out.textContent = t('pc.x.done.file', { n: fmtN(r.points), size: bytesText(r.bytes) }) + ratio;
          } else {
            const blob = new Blob(chunks, { type: 'application/octet-stream' });
            download(name, blob);
            ctx.lastExport = { points: r.points, bytes: blob.size, bounds: r.bounds, classCounts: r.classCounts, streamed: false, laz, format: r.format, lasBytes: r.lasBytes };
            out.textContent = t('pc.x.done', { n: fmtN(r.points), size: bytesText(blob.size) }) + ratio;
          }
        } catch (e) { if (file) { try { await file.abort(); } catch { /* the file is left as the browser keeps it */ } } prog.hide(); out.textContent = ctx.isAbort(e) ? t('pc.stopped') : ctx.err(e); }
        ctl = null;
      } }] });
  }

  const mk = (key, attr, fn) => el('button', { type: 'button', className: 'btn-line', disabled: true, [attr]: '', onclick: fn }, t(key));
  const stockBtn = mk('pc.v.open', 'data-pc-stock-open', stockDialog), flightBtn = mk('pc.f.open', 'data-pc-flight-open', flightDialog), exportBtn = mk('pc.x.open', 'data-pc-export-open', exportDialog);
  ctx.on('cloud', () => { for (const b of [stockBtn, flightBtn, exportBtn]) b.disabled = !ctx.cloud; });

  return el('details', { open: true, 'data-pc-sec': 'surface' }, el('summary', {}, t('pc.sec.surface')),
    el('p', { className: 'pc-note' }, t('pc.s.what')),
    field(t('pc.s.spacing'), spacing, t('pc.s.spacing.hint')), field(t('pc.s.mode'), mode), field(t('pc.s.maxedge'), maxEdge, t('pc.s.maxedge.hint')),
    el('div', { className: 'pc-row' }, build), prog.row, report, resBox,
    el('div', { className: 'pc-note' }, t('pc.bl.title')), el('div', { className: 'pc-row' }, blBtn, blPlan, blDone), blUl,
    field(t('pc.c.interval'), interval), el('div', { className: 'pc-row' }, contourBtn), contourOut, preview,
    el('div', { className: 'pc-row' }, stockBtn, flightBtn, exportBtn));
}
