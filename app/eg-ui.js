/* SPDX-License-Identifier: Apache-2.0 */
/**
 * eg-ui.js — the round-2 CivilCraft site tools' windows (0.8, session `civil_PART_2`): Make it rain (rain-ui.js), the earthwork balancer (EG.70), the best
 * route (EG.71), address to site (EG.63), detention ponds (EG.12) and progress from surveys (EG.39). Surface › More opens each. The numbers are
 * earthwork.js, route.js, site-sources.js, detention.js and progress.js (all DOM-free, each with a Node test). Calculation aids: an engineer checks.
 *
 *   createEg(ctx) → { command(c) → handled, ownsTool(t), hints, finish(tool, pts) → done, problems() → [problem] }
 *   ctx = { el, root, project, units, say, download(name, blob), fileStem(), ground() → existing surface, graded() → { surface, regions }, setTool, refresh(), redraw() }
 */
import { t } from './i18n.js';
import { createRain } from './rain-ui.js';
import { openWin, field, table, csv, saved, save } from './eg-win.js';
import { cellsInside, balanceLevel, bestPlane, planeOf, haulPlan, volumes } from './earthwork.js';
import { findRoute, routeProfile } from './route.js';
import { siteAt, siteRows, guessKind, KINDS, SOURCES, contextItems } from './site-sources.js';
import { buildContext, buildSite, siteContext } from './site-context.js';   // 0.8 EG.63 (civil_PART_4): the file BimCraft and ModelCraft take as suggestions
import { sendHandoff } from './handoff.js';
import { sources as siteSources, onChange as onSiteSources, runSource } from './site-fetch.js';
import { pondDefaults, cleanPond, runPond, sizeOrifice, POND_KINDS } from './detention.js';
import { progressGrid, cleanProgress } from './progress.js';
import { catchmentArea } from './hydro.js';
import { fixed, unitOf } from './units.js';
import { siteClimate } from './climate-mount.js';   // 0.9 EG.46 (climate-futures-09): flood level, wildfire and heat in a future climate

export const EG_COMMANDS = ['eg-rain', 'eg-earthwork', 'eg-route', 'eg-site', 'eg-pond', 'eg-progress'];

export function createEg(ctx) {
  const { el } = ctx;
  const U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const M = () => U() === 'm';
  const uo = () => unitOf(U());
  const vol = (v) => fixed(v / uo().volPer, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ' + uo().vol;
  const rain = createRain(ctx);
  const climate = siteClimate(ctx);
  const btn = (label, icon, fn, data) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', [data || 'data-eg-btn']: '', onclick: fn }, el('i', { className: 'bi bi-' + icon, 'aria-hidden': 'true' }), ' ', label);   // i18n-ignore: icon class
  const kv = (rows) => el('div', { className: 'cv-props' }, ...rows.flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, v)]));
  const review = () => [el('p', { className: 'cv-note' }, el('strong', {}, t('eg.review')))];
  const dl = (name, text, type = 'text/csv') => { ctx.download(name, new Blob(['﻿' + text], { type })); ctx.say(t('eg.saved')); };
  const stem = (s) => (ctx.fileStem() || 'civilcraft') + '-' + s;

  // ------------------------------------------------------------------ EG.70 earthwork balancer
  function earthwork() {
    const P = ctx.project(), S = saved('eg70', { pad: '', factor: 0, tilt: 0, fall: 0, blocks: 60 });
    openWin(ctx, 'cv-eg-earth', 'eg.ew.title', (body, win) => {
      const pads = P.state.pads.filter((p) => p.pts?.length >= 3), ground = ctx.ground();
      const kids = [...review(), el('p', { className: 'cv-note' }, t('eg.ew.lead'))];
      if (!ground || !pads.length) { kids.push(el('p', { className: 'cv-note', 'data-eg-none': '' }, t(!ground ? 'eg.ew.noground' : 'eg.ew.nopads'))); body.replaceChildren(...kids); return; }
      if (!pads.some((p) => p.id === S.pad)) S.pad = pads[0].id;
      const form = el('div', { className: 'cv-props' },
        ...field(ctx, t('eg.ew.pad'), S, 'pad', { kind: 'select', options: pads.map((p) => [p.id, p.name]), id: 'eg-ew-pad' }),
        ...field(ctx, t('eg.ew.factor'), S, 'factor', { unit: '%', min: -60, max: 100, id: 'eg-ew-f' }),
        ...field(ctx, t('eg.ew.tilt'), S, 'tilt', { unit: '%', min: 0, max: 30, id: 'eg-ew-t' }),
        ...field(ctx, t('eg.ew.fall'), S, 'fall', { unit: '%', min: 0, max: 30, id: 'eg-ew-m' }));
      const out = el('div', { 'data-eg-ew-out': '' }), status = el('p', { className: 'cv-note', 'aria-live': 'polite' });
      kids.push(form, el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-eg-ew-run': '', onclick: run }, t('eg.ew.run'))), status, out);
      body.replaceChildren(...kids);

      function run() {
        save('eg70', S);
        const pad = pads.find((p) => p.id === S.pad), factor = 1 + S.factor / 100;
        const cells = cellsInside(ground, pad.pts), A = (cells.cell || 1) ** 2;
        if (!cells.length) { status.textContent = t('eg.ew.nocells'); return; }
        const now = volumes(cells, planeOf({}), Number(pad.z), { area: A, factor });
        const flat = balanceLevel(cells, planeOf({}), { area: A, factor });
        const plane = S.tilt > 0 || S.fall > 0 ? bestPlane(cells, { area: A, factor, maxGrade: Math.max(S.tilt, S.fall) / 100, minGrade: S.fall / 100 }) : null;
        const pick = plane || { ...flat, gx: 0, gy: 0, cx: 0, cy: 0 };
        const design = planeOf({ cx: pick.cx, cy: pick.cy, gx: pick.gx, gy: pick.gy });
        const hp = haulPlan(cells, design, pick.z0, { area: A, factor, blocks: S.blocks });
        status.textContent = t('eg.ew.done', { n: cells.length });
        const lines = [[t('eg.ew.now'), t('eg.ew.nowv', { z: fixed(pad.z, 2), cut: vol(now.cut), fill: vol(now.fill), net: (now.net >= 0 ? '+' : '−') + vol(Math.abs(now.net)) })],
          [t('eg.ew.bal'), t('eg.ew.balv', { z: fixed(flat.z0, 2), cut: vol(flat.cut), fill: vol(flat.fill) })]];
        if (plane) lines.push([t('eg.ew.tiltd'), t('eg.ew.tiltv', { z: fixed(plane.z0, 2), g: fixed(plane.grade * 100, 2), dir: fixed(((Math.atan2(plane.gy, plane.gx) * 180) / Math.PI + 360) % 360, 0) })]);
        lines.push([t('eg.ew.haul'), t('eg.ew.haulv', { moved: vol(hp.moved), avg: fixed(hp.avg, 0), u: M() ? 'm' : 'ft' })]);
        if (hp.spare > 1e-6) lines.push([t('eg.ew.spare'), vol(hp.spare)]);
        if (hp.short > 1e-6) lines.push([t('eg.ew.short'), vol(hp.short)]);
        const top = hp.flows.slice(0, 10);
        const apply = btn(t('eg.ew.apply'), 'check2-circle', () => {
          P.change(t('eg.ew.undo'), (st) => { const q = st.pads.find((x) => x.id === pad.id); if (!q) return; q.z = Number(fixed(pick.z0, 3)); if (plane) q.pts = q.pts.map((c) => ({ x: c.x, y: c.y, z: Number(fixed(design(c.x, c.y, pick.z0), 3)) })); else q.pts = q.pts.map((c) => ({ x: c.x, y: c.y })); });
          ctx.say(t('eg.ew.applied', { z: fixed(pick.z0, 2) })); ctx.refresh(); run();
        }, 'data-eg-ew-apply');
        out.replaceChildren(kv(lines), top.length ? table(ctx, [t('eg.ew.c.from'), t('eg.ew.c.to'), t('eg.ew.c.vol', { u: uo().vol }), t('eg.ew.c.dist', { u: M() ? 'm' : 'ft' })], top.map((f) => [fixed(f.from.x, 0) + ', ' + fixed(f.from.y, 0), fixed(f.to.x, 0) + ', ' + fixed(f.to.y, 0), fixed(f.vol / uo().volPer, 1), fixed(f.dist, 0)]), 'data-eg-ew-flows') : '',
          el('div', { className: 'cv-actions' }, apply, btn('CSV', 'download', () => dl(stem('earthwork') + '.csv', csv(['from_x', 'from_y', 'to_x', 'to_y', 'volume_' + uo().vol, 'distance'], hp.flows.map((f) => [fixed(f.from.x, 2), fixed(f.from.y, 2), fixed(f.to.x, 2), fixed(f.to.y, 2), fixed(f.vol / uo().volPer, 3), fixed(f.dist, 2)]))), 'data-eg-ew-csv')));   // i18n-ignore: file type, csv headers
      }
    });
  }

  // ------------------------------------------------------------------ EG.71 best route
  let routeState = saved('eg71', { fx: '', fy: '', tx: '', ty: '', grade: 8, radius: 0, width: 0, side: 3, earth: 0, cell: 0 });
  function route(run = false) {
    const S = routeState;
    openWin(ctx, 'cv-eg-route', 'eg.rt.title', (body, win) => {
      const ground = ctx.graded().surface || ctx.ground();
      const kids = [...review(), el('p', { className: 'cv-note' }, t('eg.rt.lead'))];
      if (!ground) { kids.push(el('p', { className: 'cv-note' }, t('eg.rt.noground'))); body.replaceChildren(...kids); return; }
      const u = M() ? 'm' : 'ft';
      kids.push(el('div', { className: 'cv-props', 'data-eg-rt-form': '' },
        ...field(ctx, t('eg.rt.fx'), S, 'fx', { unit: u, id: 'eg-rt-fx' }), ...field(ctx, t('eg.rt.fy'), S, 'fy', { unit: u, id: 'eg-rt-fy' }),
        ...field(ctx, t('eg.rt.tx'), S, 'tx', { unit: u, id: 'eg-rt-tx' }), ...field(ctx, t('eg.rt.ty'), S, 'ty', { unit: u, id: 'eg-rt-ty' }),
        ...field(ctx, t('eg.rt.grade'), S, 'grade', { unit: '%', min: 0.1, max: 100, id: 'eg-rt-g' }), ...field(ctx, t('eg.rt.radius'), S, 'radius', { unit: u, min: 0, max: 1e5, id: 'eg-rt-r' }),
        ...field(ctx, t('eg.rt.width'), S, 'width', { unit: u, min: 0, max: 1000, id: 'eg-rt-w' }), ...field(ctx, t('eg.rt.side'), S, 'side', { unit: 'H:1V', min: 0, max: 20, id: 'eg-rt-s' }),
        ...field(ctx, t('eg.rt.earth'), S, 'earth', { unit: t('eg.rt.earth.u', { u: uo().vol }), min: 0, max: 1e6, id: 'eg-rt-e' }), ...field(ctx, t('eg.rt.cell'), S, 'cell', { unit: u, min: 0, max: 1e5, id: 'eg-rt-c' })));
      const out = el('div', { 'data-eg-rt-out': '' }), status = el('p', { className: 'cv-note', 'aria-live': 'polite' });
      kids.push(el('div', { className: 'cv-actions' }, btn(t('eg.rt.pick'), 'cursor', () => { win.dlg.close(); ctx.setTool('eg-route'); }, 'data-eg-rt-pick'),
        el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-eg-rt-run': '', onclick: go }, t('eg.rt.run'))), status, out);
      body.replaceChildren(...kids);
      if (run) go();
      function go() {
        save('eg71', S);
        const p0 = { x: Number(S.fx), y: Number(S.fy) }, p1 = { x: Number(S.tx), y: Number(S.ty) };
        if (![p0.x, p0.y, p1.x, p1.y].every(Number.isFinite) || S.fx === '' || S.tx === '') { status.textContent = t('eg.rt.needpts'); return; }
        status.textContent = t('eg.rt.running');
        setTimeout(() => {
          const earthCost = S.earth > 0 ? S.earth / uo().volPer : 0;
          const r = findRoute(ground, p0, p1, { cell: S.cell > 0 ? S.cell : null, maxGrade: S.grade / 100, minRadius: S.radius, width: S.width, sideSlope: S.side, earthCost });
          if (!r.found) { status.textContent = t('eg.rt.fail.' + (['off-ground', 'forbidden-end', 'unreachable-curve', 'same'].includes(r.reason) ? r.reason : 'unreachable')); out.replaceChildren(); return; }
          status.textContent = t('eg.rt.done', { n: r.expanded, cell: fixed(r.cell, 1), u });
          const prof = routeProfile(r.path);
          const cv = el('canvas', { width: 560, height: 150, className: 'cv-eg-canvas', role: 'img', 'aria-label': t('eg.rt.profile') });
          out.replaceChildren(kv([[t('eg.rt.len'), fixed(r.length, 0) + ' ' + u + (r.snapped > r.cell * 0.5 ? ' (' + t('eg.rt.snap', { d: fixed(r.snapped, 1), u }) + ')' : '')], [t('eg.rt.maxg'), fixed(r.maxGrade * 100, 1) + ' %'],
            [t('eg.rt.minr'), Number.isFinite(r.minRadius) ? fixed(r.minRadius, 0) + ' ' + u : t('eg.rt.straight')],
            ...(S.width > 0 ? [[t('eg.rt.cut'), vol(r.cut)], [t('eg.rt.fill'), vol(r.fill)]] : [])]),
          cv, table(ctx, [t('eg.rt.c.pt'), 'x', 'y', t('eg.rt.c.z', { u }), t('eg.rt.c.sta', { u })], r.path.map((q, i) => [String(i + 1), fixed(q.x, 1), fixed(q.y, 1), fixed(q.z, 2), fixed(prof[i].d, 0)]), 'data-eg-rt-points'),
          el('div', { className: 'cv-actions' }, btn(t('eg.rt.make'), 'bezier2', () => makeAlignment(r), 'data-eg-rt-make'), btn('CSV', 'download', () => dl(stem('route') + '.csv', csv(['point', 'x', 'y', 'z', 'station'], r.path.map((q, i) => [i + 1, fixed(q.x, 3), fixed(q.y, 3), fixed(q.z, 3), fixed(prof[i].d, 3)]))), 'data-eg-rt-csv')));   // i18n-ignore: file type, csv headers
          drawProfile(cv, prof);
        }, 20);
      }
      function makeAlignment(r) {
        const P = ctx.project(), id = P.nextId('a'), n = P.state.alignments.length + 1, R = S.radius;
        const pis = r.path.map((q, i, a) => {
          let rad = 0;
          if (i > 0 && i < a.length - 1 && R > 0) {
            const l1 = Math.hypot(q.x - a[i - 1].x, q.y - a[i - 1].y), l2 = Math.hypot(a[i + 1].x - q.x, a[i + 1].y - q.y), t1 = Math.atan2(q.y - a[i - 1].y, q.x - a[i - 1].x), t2 = Math.atan2(a[i + 1].y - q.y, a[i + 1].x - q.x);
            let d = Math.abs(t2 - t1); if (d > Math.PI) d = 2 * Math.PI - d;
            rad = d > 1e-6 ? Math.min(R, Math.min(l1, l2) / (2 * Math.tan(d / 2))) : 0;
          }
          return { x: q.x, y: q.y, r: Number(fixed(rad, 2)) };
        });
        P.change(t('eg.rt.undo'), (st) => st.alignments.push({ id, name: t('eg.rt.name', { n }), start: 0, pis, pvis: [] }));
        ctx.say(t('eg.rt.made')); ctx.refresh();
      }
    });
  }
  function drawProfile(cv, prof) {
    const g = cv.getContext('2d'), W = cv.width, H = cv.height, pad = 30;
    g.clearRect(0, 0, W, H); if (prof.length < 2) return;
    const dMax = prof[prof.length - 1].d || 1, zs = prof.map((p) => p.z), lo = Math.min(...zs), hi = Math.max(...zs), span = hi - lo || 1;
    const X = (d) => pad + (d / dMax) * (W - pad - 6), Y = (z) => H - 18 - ((z - lo) / span) * (H - 30);
    g.strokeStyle = getComputedStyle(cv).color || '#222'; g.fillStyle = g.strokeStyle; g.lineWidth = 2; g.beginPath();
    prof.forEach((p, k) => (k ? g.lineTo(X(p.d), Y(p.z)) : g.moveTo(X(p.d), Y(p.z)))); g.stroke();
    g.font = '11px sans-serif'; g.fillText(fixed(hi, 1), 2, 12); g.fillText(fixed(lo, 1), 2, H - 6);   // i18n-ignore: canvas font and numbers
  }

  // ------------------------------------------------------------------ EG.63 address to site
  let siteLayers = [];   // [{ name, kind, layer }] from files read this visit
  let siteInfo = [];     // [{ key, value }] single answers (ground elevation, soil at the point) from the sources you pressed
  let siteRuns = [];     // [{ id, name, licence, where, via, fetched, kinds }] where this visit's layers and answers came from, with the day (kept in the file with them)
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const noteRun = (r) => { siteRuns = siteRuns.filter((x) => x.id !== r.id).concat({ ...r, fetched: todayStr() }); };
  function site() {
    const P = ctx.project(), S = saved('eg63', { lat: '', lon: '', radius: 150, address: '', url: '' });
    if (P.state.site && S.lat === '' && S.lon === '') { S.lat = String(P.state.site.origin.lat); S.lon = String(P.state.site.origin.lon); S.radius = P.state.site.radius; S.address = P.state.site.address || S.address; }   // the file's own site, no new fetch
    openWin(ctx, 'cv-eg-site', 'eg.st.title', (body, win) => {
      const kids = [...review(), el('p', { className: 'cv-note' }, t('eg.st.lead'))];
      kids.push(el('div', { className: 'cv-props' }, ...field(ctx, t('eg.st.lat'), S, 'lat', { id: 'eg-st-lat', min: -90, max: 90 }), ...field(ctx, t('eg.st.lon'), S, 'lon', { id: 'eg-st-lon', min: -180, max: 180 }), ...field(ctx, t('eg.st.radius'), S, 'radius', { unit: 'm', min: 10, max: 5000, id: 'eg-st-rad' })));
      const list = el('div', { 'data-eg-st-layers': '' });
      const drawList = () => list.replaceChildren(siteLayers.length ? table(ctx, [t('eg.st.l.name'), t('eg.st.l.feat'), t('eg.st.l.kind')], siteLayers.map((L) => {
        const sel = el('select', { className: 'select-cc cv-input', 'aria-label': t('eg.st.l.kind') }, el('option', { value: '' }, t('eg.st.l.skip')), ...KINDS.filter((k) => k !== 'terrain').map((k) => el('option', { value: k, selected: L.kind === k }, t('eg.st.k.' + k))));
        sel.addEventListener('change', () => { L.kind = sel.value; });
        return [L.name, String(L.layer.features.length), sel];
      }), 'data-eg-st-table') : el('p', { className: 'cv-note' }, t('eg.st.nofiles')));
      drawList();
      const out = el('div', { 'data-eg-st-out': '' }), status = el('p', { className: 'cv-note', 'aria-live': 'polite' });
      // 0.8 EG.63: the site kept in the project file (address, sources with day + licence, results): shown again on open, saved/sent without asking any service
      const keptBox = el('div', { 'data-eg-st-kept': '' });
      const sendCtx = async (c, bim) => {
        const f = { c, text: JSON.stringify(c), name: stem('site') + '.ccsite.json' };   // i18n-ignore: file type
        const url = bim ? (ctx.bimUrl?.() || '') : '';
        if (!url) { dl(f.name, f.text, 'application/json'); status.textContent = t('eg.st.ctx.saved', { n: c.items.length }); return; }
        try { await sendHandoff(url, new File([f.text], f.name, { type: 'application/json' }), 'civilcraft', { kind: 'site', n: c.items.length }); status.textContent = t('eg.st.ctx.sent', { n: c.items.length, app: ctx.bimApp?.() || 'BimCraft' }); }
        catch (e) { status.textContent = t(e?.code === 'blocked' ? 'eg.st.ctx.blocked' : 'eg.st.ctx.failed'); }
      };
      const drawKept = () => {
        const k = P.state.site;
        if (!k) { keptBox.replaceChildren(); return; }
        keptBox.replaceChildren(el('h3', { className: 'cv-h3' }, t('eg.st.kept.h')),
          el('p', { className: 'cv-note', 'data-eg-st-kept-lead': '' }, t('eg.st.kept.lead', { address: k.address || t('eg.st.kept.noaddr'), lat: k.origin.lat.toFixed(5), lon: k.origin.lon.toFixed(5), radius: k.radius, n: k.items.length, i: k.info.length, day: k.fetched || '—' })),
          el('ul', { className: 'cv-plainlist', 'data-eg-st-kept-src': '' }, ...k.sources.map((x) => el('li', {}, t('eg.st.kept.src', { name: x.name, licence: x.licence || '—', via: t('eg.st.kept.via.' + x.via), day: x.fetched || '—' })))),
          k.attribution.length ? el('p', { className: 'cv-note' }, t('eg.st.kept.attr', { a: k.attribution.join('; ') })) : '',
          el('div', { className: 'cv-actions' }, btn(t('eg.st.ctx.save'), 'file-earmark-arrow-down', () => sendCtx(siteContext(k), false), 'data-eg-st-kept-save'),
            btn(t('eg.st.ctx.send', { app: ctx.bimApp?.() || 'BimCraft' }), 'box-arrow-up-right', () => sendCtx(siteContext(k), true), 'data-eg-st-kept-send'),
            btn(t('eg.st.forget'), 'x-circle', () => { P.change(t('eg.st.forget.undo'), (st) => { delete st.site; }); drawKept(); }, 'data-eg-st-forget')));
      };
      drawKept();
      const keep = (used, lat, lon) => {
        const items = contextItems(used);
        if (!items.length && !siteInfo.length) { status.textContent = t('eg.st.keep.none'); return; }
        const c = buildContext({ origin: { lat, lon }, radius: Number(S.radius) || 150, items, attribution: attrOf(used) });
        const srcs = siteRuns.filter((r) => used.some((u) => r.kinds?.includes(u.kind)) || siteInfo.some((i) => i.src === r.id) || r.via === 'file');
        const site = buildSite({ address: S.address, origin: { lat, lon }, radius: Number(S.radius) || 150, items: c.items, attribution: c.attribution, sources: srcs,
          info: siteInfo.map((i) => ({ id: i.src + '-' + i.key, key: i.key, value: i.value, src: i.src })) });
        P.change(t('eg.st.keep.undo'), (st) => { st.site = site; });
        drawKept();
        status.textContent = t('eg.st.keep.done', { n: site.items.length, s: site.sources.length, day: site.fetched });
      };
      // open-data sources (one add-on each, off until switched on): a service is asked only when its button is pressed
      const srcBox = el('div', { 'data-eg-st-fetch': '' });
      const drawSrc = () => {
        const list = siteSources();
        if (!list.length) { srcBox.replaceChildren(el('p', { className: 'cv-note' }, t('eg.st.nosrc'))); return; }
        const kids2 = [el('p', { className: 'cv-note' }, t('eg.st.fetchlead'))];
        if (list.some((x) => x.needs === 'address')) kids2.push(el('div', { className: 'cv-props' }, ...field(ctx, t('eg.st.address'), S, 'address', { kind: 'text', id: 'eg-st-addr' })));
        if (list.some((x) => x.needs === 'url')) kids2.push(el('div', { className: 'cv-props' }, ...field(ctx, t('eg.st.url'), S, 'url', { kind: 'text', id: 'eg-st-url' })));
        kids2.push(el('div', { className: 'cv-actions' }, ...list.map((x) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-eg-st-src': x.id, title: x.licence, onclick: () => pressSource(x) }, t('eg.st.ask', { name: x.name })))));
        srcBox.replaceChildren(...kids2);
      };
      const pressSource = async (x) => {
        save('eg63', S);
        status.textContent = t('eg.st.asking', { name: x.name });
        const r = await runSource(x, { lat: Number(S.lat), lon: Number(S.lon), radius: Number(S.radius) || 150, address: S.address, url: S.url });
        if (!r.ok) { status.textContent = t('eg.st.why.' + r.why, { name: x.name, status: r.status ?? '' }); return; }
        const res = r.result, tail = r.cached ? ' ' + t('eg.st.cached') : '';
        if (res.point) {
          S.lat = String(res.point.lat); S.lon = String(res.point.lon);
          const a = body.querySelector('#eg-st-lat'), o = body.querySelector('#eg-st-lon'); if (a) a.value = S.lat; if (o) o.value = S.lon;
          status.textContent = t('eg.st.found', { label: res.point.label }) + tail; return;
        }
        if (res.geojson) {
          const { readGeoJSON } = await import('./geojson.js');
          const layer = readGeoJSON(res.geojson, res.name).layers[0];
          siteLayers = siteLayers.filter((L) => L.name !== res.name);
          if (layer) siteLayers.push({ name: res.name, kind: res.kind, layer });
          noteRun({ id: x.id, name: x.name, licence: x.licence, where: x.where, via: 'fetch', kinds: x.kinds });
          drawList(); status.textContent = t('eg.st.got', { name: res.name, n: layer ? layer.features.length : 0 }) + tail; return;
        }
        siteInfo = siteInfo.filter((i) => i.src !== x.id).concat((res.info || []).map((i) => ({ ...i, src: x.id })));
        noteRun({ id: x.id, name: x.name, licence: x.licence, where: x.where, via: 'fetch', kinds: x.kinds });
        status.textContent = t('eg.st.gotinfo', { name: x.name }) + tail;
      };
      drawSrc(); onSiteSources(drawSrc);
      const pick = el('input', { type: 'file', multiple: true, accept: '.geojson,.json,.kml,.kmz,.shp,.shx,.dbf,.prj,.cpg,.zip,.gpkg', className: 'visually-hidden', tabIndex: -1 });
      pick.addEventListener('change', async () => {
        const files = [...pick.files].map((f) => ({ name: f.name, data: f })); if (!files.length) return;
        status.textContent = t('eg.st.reading');
        try {
          const { readGisFiles } = await import('./gis-read.js');
          const r = await readGisFiles(files);
          let skipped = 0;
          for (const s of r.sources) for (const layer of s.layers) {
            if (s.src.kind !== 'wgs84') { skipped++; continue; }   // longitude/latitude files only: an address is a point on the globe
            siteLayers.push({ name: layer.name, kind: guessKind(layer)?.kind || '', layer });
            noteRun({ id: 'file-' + layer.name.replace(/[^A-Za-z0-9]+/g, '-').slice(0, 30), name: layer.name, licence: '', where: '', via: 'file', kinds: [] });
          }
          status.textContent = t('eg.st.read', { n: r.sources.length, skipped }) + (r.notes.length ? ' ' + r.notes.slice(0, 2).join(' ') : '');
        } catch (e) { status.textContent = t('eg.st.fail', { why: e.message }); }
        drawList();
      });
      const attrOf = (used) => [...new Set(used.map((u) => SOURCES.find((x) => x.kinds.includes(u.kind === 'parcels' ? 'parcels' : u.kind))?.name).filter(Boolean))].concat('© OpenStreetMap contributors, ODbL (address search)');
      const run = () => {
        save('eg63', S);
        const lat = Number(S.lat), lon = Number(S.lon);
        if (S.lat === '' || S.lon === '' || !Number.isFinite(lat) || !Number.isFinite(lon)) { status.textContent = t('eg.st.needpt'); return; }
        const used = siteLayers.filter((L) => L.kind).map((L) => ({ kind: L.kind, layer: L.layer }));
        if (!used.length && !siteInfo.length) { status.textContent = t('eg.st.nolayers'); return; }
        const res = siteAt(used, { x: lon, y: lat, radius: Number(S.radius) || 150, geographic: true });
        status.textContent = '';
        const rows = siteRows(res).concat(siteInfo.map((i) => ({ key: 'info-' + i.key, value: i.value }))), sq = M() ? ['m²', 1] : ['ft²', 10.7639104167];
        const words = rows.map((r) => {
          switch (r.key) {
            case 'parcel': return [t('eg.st.r.parcel'), [r.id, r.address, r.owner].filter(Boolean).join(' · ') + ' — ' + fixed(r.area * sq[1], 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ' + sq[0]];
            case 'use': return [t('eg.st.r.use'), r.value];
            case 'no-parcel': return [t('eg.st.r.parcel'), t('eg.st.r.noparcel')];
            case 'neighbours': return [t('eg.st.r.neigh'), String(r.n)];
            case 'buildings': return [t('eg.st.r.bldg'), t('eg.st.r.bldgv', { n: r.n, h: fixed(r.tallest * (M() ? 1 : 3.28084), 0), u: M() ? 'm' : 'ft', d: fixed(r.nearest * (M() ? 1 : 3.28084), 0) })];
            case 'zoning': return [t('eg.st.r.zone'), r.code + (r.desc ? ' (' + r.desc + ')' : '') + ' — ' + fixed(r.share * 100, 0) + ' %'];
            case 'soil': return [t('eg.st.r.soil'), [r.symbol, r.name, r.mukey && 'MUKEY ' + r.mukey].filter(Boolean).join(' · ') + ' — ' + fixed(r.share * 100, 0) + ' %'];
            case 'flood': return [t('eg.st.r.flood'), (r.sfha ? t('eg.st.r.sfha', { pct: fixed(r.share * 100, 0) }) : t('eg.st.r.nosfha')) + (r.atPoint ? ' · ' + t('eg.st.r.atpt', { z: r.atPoint }) : '') + (r.bfe ? ' · ' + t('eg.st.r.bfe', { v: fixed(r.bfe, 1) }) : '')];
            case 'missing': return [t('eg.st.r.missing'), t('eg.st.k.' + r.kind)];
            case 'info-elevation': return [t('eg.st.r.elev'), fixed(r.value * (M() ? 1 : 3.28084), 1) + ' ' + (M() ? 'm' : 'ft')];
            case 'info-noelev': return [t('eg.st.r.elev'), t('eg.st.r.nodata')];
            case 'info-soil': return [t('eg.st.r.soilpt'), [r.value.symbol, r.value.name, 'MUKEY ' + r.value.mukey].join(' · ')];
            case 'info-nosoil': return [t('eg.st.r.soilpt'), t('eg.st.r.nodata')];
            default: return null;
          }
        }).filter(Boolean);
        const ctxFile = () => {
          const items = contextItems(used);
          if (!items.length) { status.textContent = t('eg.st.ctx.none'); return null; }
          const c = buildContext({ origin: { lat, lon }, radius: Number(S.radius) || 150, items, attribution: attrOf(used) });
          return { c, text: JSON.stringify(c), name: stem('site') + '.ccsite.json' };
        };
        const sendTo = async (bim) => {
          const f = ctxFile(); if (!f) return;
          const url = bim ? (ctx.bimUrl?.() || '') : '';
          if (!url) { dl(f.name, f.text); status.textContent = t('eg.st.ctx.saved', { n: f.c.items.length }); return; }
          try { await sendHandoff(url, new File([f.text], f.name, { type: 'application/json' }), 'civilcraft', { kind: 'site', n: f.c.items.length }); status.textContent = t('eg.st.ctx.sent', { n: f.c.items.length, app: ctx.bimApp?.() || 'BimCraft' }); }
          catch (e) { status.textContent = t(e?.code === 'blocked' ? 'eg.st.ctx.blocked' : 'eg.st.ctx.failed'); }
        };
        out.replaceChildren(kv(words), el('div', { className: 'cv-actions' }, btn('CSV', 'download', () => dl(stem('site') + '.csv', csv(['item', 'value'], words)), 'data-eg-st-csv'),
          btn(t('eg.st.ctx.save'), 'file-earmark-arrow-down', () => sendTo(false), 'data-eg-st-ctx-save'), btn(t('eg.st.ctx.send', { app: ctx.bimApp?.() || 'BimCraft' }), 'box-arrow-up-right', () => sendTo(true), 'data-eg-st-ctx-send'), btn(t('eg.st.keep'), 'journal-check', () => keep(used, lat, lon), 'data-eg-st-keep')), el('p', { className: 'cv-note' }, t('eg.st.ctx.note')));   // i18n-ignore: file type, csv headers
        const fl = rows.find((x) => x.key === 'flood');   // FEMA's STATIC_BFE is in feet (NAVD 88)
        out.append(el('div', { 'data-eg-st-climate': '' }, climate.block({ lat, lon, flood: Number.isFinite(fl?.bfe) ? { level: fl.bfe, unit: 'ft', source: 'FEMA NFHL base flood elevation, feet NAVD 88' } : null })));   // i18n-ignore: source name
      };
      kids.push(el('div', { className: 'cv-actions' }, btn(t('eg.st.add'), 'file-earmark-plus', () => pick.click(), 'data-eg-st-add'), btn(t('eg.st.clear'), 'x-circle', () => { siteLayers = []; drawList(); }, 'data-eg-st-clear'),
        el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-eg-st-run': '', onclick: run }, t('eg.st.run'))), list, srcBox, status, out, keptBox,
      el('details', { className: 'cv-note' }, el('summary', {}, t('eg.st.sources')), el('ul', { className: 'cv-plainlist', 'data-eg-st-sources': '' }, ...SOURCES.map((s) => el('li', {}, el('strong', {}, s.name), ' — ' + s.region + ' · ' + s.licence + ' · ' + s.formats.join(', ') + ' · ' + s.where + (s.checked ? '' : ' · ' + t('eg.st.unchecked')))))));
      body.replaceChildren(...kids);
    }, { wide: true });
  }

  // ------------------------------------------------------------------ EG.12 detention ponds
  let pondDraft = null;
  function pond() {
    const P = ctx.project();
    openWin(ctx, 'cv-eg-pond', 'eg.pd.title', (body, win) => {
      const ponds = P.state.ponds || [], hydro = P.state.network?.hydro || null;
      const kids = [...review(), el('p', { className: 'cv-note' }, t('eg.pd.lead'))];
      const sel = el('select', { className: 'select-cc cv-input', 'aria-label': t('eg.pd.pick'), 'data-eg-pd-pick': '' }, ...ponds.map((p) => el('option', { value: p.id, selected: pondDraft?.id === p.id }, p.name)), el('option', { value: '', selected: !pondDraft?.id }, t('eg.pd.new')));
      sel.addEventListener('change', () => { pondDraft = sel.value ? structuredClone(ponds.find((p) => p.id === sel.value)) : { ...pondDefaults(U()), name: t('eg.pd.name', { n: ponds.length + 1 }) }; win.redraw(); });
      if (!pondDraft) pondDraft = ponds[0] ? structuredClone(ponds[0]) : { ...pondDefaults(U()), name: t('eg.pd.name', { n: 1 }) };
      const D = pondDraft, u = M() ? 'm' : 'ft', au = M() ? 'm²' : 'ac', a2 = M() ? 'm²' : 'ft²', du = M() ? 'mm' : 'in', fu = M() ? 'm³/s' : 'ft³/s';   // i18n-ignore: unit symbols
      const cats = (P.state.network?.catchments || []);
      const catSel = cats.length ? el('select', { className: 'select-cc cv-input', 'aria-label': t('eg.pd.cat'), 'data-eg-pd-cat': '' }, el('option', { value: '' }, t('eg.pd.cat.none')), ...cats.map((c) => el('option', { value: c.id, selected: D.catchment === c.id }, c.name))) : null;
      catSel?.addEventListener('change', () => { const c = cats.find((x) => x.id === catSel.value); D.catchment = c ? c.id : null; if (c) { const a = catchmentArea(c.pts, U()); D.area = M() ? a * 10000 : a; D.tc = c.tc; } win.redraw(); });
      const out = el('div', { 'data-eg-pd-out': '' });
      const upd = () => results();
      kids.push(el('div', { className: 'cv-row' }, el('label', { className: 'k', for: 'eg-pd-sel' }, t('eg.pd.pick')), sel), el('div', { className: 'cv-props', 'data-eg-pd-form': '' },
        ...field(ctx, t('eg.pd.nm'), D, 'name', { kind: 'text', id: 'eg-pd-name' }), ...(catSel ? [el('label', { className: 'k' }, t('eg.pd.cat')), catSel] : []),
        ...field(ctx, t('eg.pd.area'), D, 'area', { unit: au, min: 1e-6, onChange: upd, id: 'eg-pd-area' }), ...field(ctx, t('eg.pd.cn'), D, 'cn', { min: 1, max: 100, onChange: upd, id: 'eg-pd-cn' }), ...field(ctx, t('eg.pd.tc'), D, 'tc', { unit: 'min', min: 1, max: 5000, onChange: upd, id: 'eg-pd-tc' }),
        ...field(ctx, t('eg.pd.storm'), D.storm, 'mode', { kind: 'select', options: [['uniform', t('eg.pd.s.uniform')], ...(hydro ? [['idf', t('eg.pd.s.idf')]] : [])], onChange: upd, id: 'eg-pd-storm' }),
        ...field(ctx, t('eg.pd.depth'), D.storm, 'depth', { unit: du, min: 0.001, onChange: upd, id: 'eg-pd-depth' }), ...field(ctx, t('eg.pd.dur'), D.storm, 'duration', { unit: 'min', min: 1, max: 4320, onChange: upd, id: 'eg-pd-dur' }),
        ...field(ctx, t('eg.pd.bottom'), D.storage, 'bottom', { unit: u, onChange: upd, id: 'eg-pd-bot' }), ...field(ctx, t('eg.pd.a0'), D.storage, 'area0', { unit: a2, min: 0, onChange: upd, id: 'eg-pd-a0' }), ...field(ctx, t('eg.pd.p0'), D.storage, 'perimeter0', { unit: u, min: 0, onChange: upd, id: 'eg-pd-p0' }),
        ...field(ctx, t('eg.pd.side'), D.storage, 'side', { unit: 'H:1V', min: 0, max: 20, onChange: upd, id: 'eg-pd-side' }), ...field(ctx, t('eg.pd.top'), D.storage, 'top', { unit: u, onChange: upd, id: 'eg-pd-top' }),
        ...field(ctx, t('eg.pd.target'), D, 'target', { unit: fu, min: 0, onChange: (v) => { D.target = v > 0 ? v : null; upd(); }, id: 'eg-pd-tg' })));
      // outlet devices
      const dev = el('div', { 'data-eg-pd-devices': '' });
      const drawDev = () => dev.replaceChildren(el('h3', { className: 'cv-h3' }, t('eg.pd.h.dev')), ...D.devices.map((d, i) => el('div', { className: 'cv-props', 'data-eg-pd-dev': String(i) },
        ...field(ctx, t('eg.pd.d.kind'), d, 'kind', { kind: 'select', options: POND_KINDS.map((k) => [k, t('eg.pd.k.' + k)]), onChange: () => { Object.assign(d, defaultDev(d.kind)); drawDev(); upd(); } }),
        ...(d.kind === 'orifice' ? [...field(ctx, t('eg.pd.d.inv'), d, 'invert', { unit: u, onChange: upd }), ...field(ctx, t('eg.pd.d.dia'), d, 'diameter', { unit: u, min: 0.001, onChange: upd })]
          : d.kind === 'vnotch' ? [...field(ctx, t('eg.pd.d.inv'), d, 'invert', { unit: u, onChange: upd }), ...field(ctx, t('eg.pd.d.ang'), d, 'angle', { unit: '°', min: 5, max: 170, onChange: upd })]
            : [...field(ctx, t('eg.pd.d.crest'), d, 'crest', { unit: u, onChange: upd }), ...field(ctx, t('eg.pd.d.len'), d, 'length', { unit: u, min: 0.01, onChange: upd })]),
        btn(t('eg.pd.d.del'), 'trash', () => { D.devices.splice(i, 1); drawDev(); upd(); }, 'data-eg-pd-deldev'))),
      btn(t('eg.pd.d.add'), 'plus-lg', () => { D.devices.push(defaultDev('orifice')); drawDev(); upd(); }, 'data-eg-pd-adddev'));
      const defaultDev = (k) => (k === 'orifice' ? { kind: 'orifice', invert: D.storage.bottom, diameter: M() ? 0.15 : 0.5, cd: 0.6 } : k === 'vnotch' ? { kind: 'vnotch', invert: D.storage.bottom, angle: 90 } : { kind: k, crest: D.storage.bottom + (D.storage.top - D.storage.bottom) * 0.75, length: M() ? 3 : 10 });
      drawDev();
      const saveBtn = btn(t('eg.pd.save'), 'floppy', () => {
        const clean = cleanPond(D, U());
        P.change(t('eg.pd.undo'), (st) => { st.ponds ||= []; if (D.id && st.ponds.some((x) => x.id === D.id)) st.ponds = st.ponds.map((x) => (x.id === D.id ? { ...clean, id: D.id } : x)); else { clean.id = P.nextId('q'); D.id = clean.id; st.ponds.push(clean); } });
        ctx.say(t('eg.pd.saved', { name: D.name })); win.redraw(); ctx.problemsChanged?.();
      }, 'data-eg-pd-save');
      const delBtn = D.id ? btn(t('eg.pd.delete'), 'trash', () => { P.change(t('eg.pd.undo.del'), (st) => { st.ponds = (st.ponds || []).filter((x) => x.id !== D.id); }); pondDraft = null; win.redraw(); ctx.problemsChanged?.(); }, 'data-eg-pd-delete') : '';
      const sizeBtn = btn(t('eg.pd.size'), 'rulers', () => {
        if (!D.target) { ctx.say(t('eg.pd.size.need')); return; }
        const r0 = runPond({ ...D, devices: D.devices.filter((d) => d.kind !== 'orifice') }, U(), { hydro });
        const L = r0.conv.len, Q = r0.conv.flow, z0 = (D.start ?? D.storage.bottom) * L;
        const s = sizeOrifice(r0.hydro.q, r0.hydro.dt, r0.rows, { target: D.target * Q, z0, base: D.storage.bottom * L, devices: r0.devices });
        if (!s.met) { ctx.say(t('eg.pd.size.no')); return; }
        D.devices = [{ kind: 'orifice', invert: D.storage.bottom, diameter: Number(fixed(s.diameter / L, 3)), cd: 0.6 }, ...D.devices.filter((d) => d.kind !== 'orifice')];
        ctx.say(t('eg.pd.size.done', { d: fixed(s.diameter / L * (M() ? 1000 : 12), 1), u: du })); drawDev(); upd();
      }, 'data-eg-pd-size');
      kids.push(dev, el('div', { className: 'cv-actions' }, sizeBtn, saveBtn, delBtn), out);
      body.replaceChildren(...kids);
      function results() {
        const r = runPond(D, U(), { hydro });
        if (!r) { out.replaceChildren(); return; }
        const s = r.show, cv = el('canvas', { width: 560, height: 170, className: 'cv-eg-canvas', role: 'img', 'aria-label': t('eg.pd.chart') });
        const flagged = r.checks.map((c) => el('li', {}, t('eg.pd.chk.' + c.code, { z: fixed((c.zMax ?? 0) / r.conv.len, 2), by: fixed((c.by ?? 0) / r.conv.len, 2), q: fixed((c.peakOut ?? 0) / r.conv.flow, 2), tg: fixed((c.target ?? 0) / r.conv.flow, 2), h: c.drawdown ? fixed(c.drawdown / 60, 0) : '–', max: fixed((c.max ?? 0) / 60, 0), a: fixed((c.attenuation ?? 0) * 100, 0), u: u, fu })));
        out.replaceChildren(kv([[t('eg.pd.r.peakin'), fixed(s.peakIn, 2) + ' ' + fu], [t('eg.pd.r.peakout'), fixed(s.peakOut, 2) + ' ' + fu + ' (−' + fixed(r.route.attenuation * 100, 0) + ' %)'],
          [t('eg.pd.r.stage'), fixed(s.zMax, 2) + ' ' + u + ' / ' + fixed(D.storage.top, 2) + ' ' + u], [t('eg.pd.r.stor'), fixed(s.storageMax, 0) + ' / ' + fixed(s.capacity, 0) + ' ' + (M() ? 'm³' : 'ft³')],   // i18n-ignore: unit symbols
          [t('eg.pd.r.run'), fixed(s.runoff, 0) + ' ' + (M() ? 'm³' : 'ft³') + ' (' + fixed(r.hydro.depth / (M() ? 1 : 25.4), 2) + ' ' + du + ')'],
          [t('eg.pd.r.draw'), r.route.drawdown === null ? t('eg.pd.r.nodraw') : fixed(r.route.drawdown / 60, 1) + ' h']]),
        cv, flagged.length ? el('ul', { className: 'cv-plainlist', 'data-eg-pd-checks': '' }, ...flagged) : el('p', { className: 'cv-note', 'data-eg-pd-ok': '' }, t('eg.pd.chk.ok')),
        el('div', { className: 'cv-actions' }, btn('CSV', 'download', () => dl(stem('pond') + '.csv', csv(['minutes', 'inflow_' + fu, 'outflow_' + fu, 'stage_' + u], r.route.q.map((q, i) => [i * r.hydro.dt, fixed((r.hydro.q[i] || 0) / r.conv.flow, 4), fixed(q / r.conv.flow, 4), fixed(r.route.z[i] / r.conv.len, 3)]))), 'data-eg-pd-csv')));   // i18n-ignore: file type, csv headers
        const g = cv.getContext('2d'), W = cv.width, H = cv.height, pad = 30, n = r.route.q.length, qm = Math.max(1e-9, ...r.hydro.q.slice(0, n), ...r.route.q);
        const X = (i) => pad + (i / (n - 1)) * (W - pad - 6), Y = (q) => H - 18 - (q / qm) * (H - 30);
        g.strokeStyle = getComputedStyle(cv).color || '#222'; g.fillStyle = g.strokeStyle; g.lineWidth = 1; g.beginPath(); g.moveTo(pad, 4); g.lineTo(pad, H - 18); g.lineTo(W - 4, H - 18); g.stroke();
        for (const [arr, col] of [[r.hydro.q, '#1f77b4'], [r.route.q, '#d6572a']]) { g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < n; i++) (i ? g.lineTo : g.moveTo).call(g, X(i), Y(arr[i] || 0)); g.stroke(); }
        g.fillStyle = g.fillStyle; g.font = '11px sans-serif'; g.fillText(fixed(qm / r.conv.flow, 1) + ' ' + fu, 2, 12); g.fillText(fixed((n - 1) * r.hydro.dt, 0) + ' min', W - 56, H - 4);   // i18n-ignore: canvas font
      }
      results();
    }, { wide: true });
  }

  // ------------------------------------------------------------------ EG.39 progress from surveys
  let surveys = [];   // [{ date, label, surface, n }] this visit
  function progress() {
    const P = ctx.project(), S = saved('eg39', { tol: 0.1, spacing: 0, sched: '' });
    openWin(ctx, 'cv-eg-progress', 'eg.pg.title', (body, win) => {
      const ex = ctx.ground(), design = ctx.graded().surface, regions = ctx.graded().regions?.filter(Boolean);
      const kids = [...review(), el('p', { className: 'cv-note' }, t('eg.pg.lead'))];
      if (!ex || !design) { kids.push(el('p', { className: 'cv-note' }, t(!ex ? 'eg.pg.noground' : 'eg.pg.nodesign'))); }
      const newS = { date: new Date().toISOString().slice(0, 10), label: '' };
      const list = surveys.length ? table(ctx, [t('eg.pg.c.date'), t('eg.pg.c.label'), t('eg.pg.c.pts')], surveys.map((s) => [s.date, s.label, String(s.n)]), 'data-eg-pg-surveys') : el('p', { className: 'cv-note' }, t('eg.pg.nosurveys'));
      const status = el('p', { className: 'cv-note', 'aria-live': 'polite' }), out = el('div', { 'data-eg-pg-out': '' });
      const pick = el('input', { type: 'file', accept: '.las,.laz,.csv,.txt,.xyz', className: 'visually-hidden', tabIndex: -1 });
      pick.addEventListener('change', async () => {
        const f = pick.files?.[0]; if (!f) return;
        status.textContent = t('eg.pg.reading', { name: f.name });
        try {
          const surf = await loadSurvey(f, S);
          surveys.push({ date: newS.date, label: newS.label || f.name, surface: surf.surface, n: surf.n });
          status.textContent = t('eg.pg.added', { n: surf.n }); win.redraw();
        } catch (e) { status.textContent = t('eg.pg.fail', { why: e.message }); }
      });
      kids.push(el('div', { className: 'cv-props' }, ...field(ctx, t('eg.pg.date'), newS, 'date', { kind: 'text', id: 'eg-pg-date' }), ...field(ctx, t('eg.pg.label'), newS, 'label', { kind: 'text', id: 'eg-pg-label' }),
        ...field(ctx, t('eg.pg.tol'), S, 'tol', { unit: M() ? 'm' : 'ft', min: 0.001, max: 100, id: 'eg-pg-tol' }), ...field(ctx, t('eg.pg.spacing'), S, 'spacing', { unit: M() ? 'm' : 'ft', min: 0, max: 1000, id: 'eg-pg-sp' }),
        ...field(ctx, t('eg.pg.sched'), S, 'sched', { kind: 'text', id: 'eg-pg-sched' })),
      el('div', { className: 'cv-actions' }, btn(t('eg.pg.add'), 'file-earmark-plus', () => pick.click(), 'data-eg-pg-add'), btn(t('eg.pg.clear'), 'x-circle', () => { surveys = []; win.redraw(); }, 'data-eg-pg-clear'),
        el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-eg-pg-run': '', onclick: run }, t('eg.pg.run'))), list, status, out);
      const kept = cleanProgress(P.state.progress);
      if (kept.length) kids.push(el('h3', { className: 'cv-h3' }, t('eg.pg.h.kept')), progressTable(kept));
      body.replaceChildren(...kids);
      function progressTable(rows) {
        return table(ctx, [t('eg.pg.c.date'), t('eg.pg.c.label'), t('eg.pg.c.pct'), t('eg.pg.c.cut', { u: uo().vol }), t('eg.pg.c.fill', { u: uo().vol }), t('eg.pg.c.over', { u: uo().vol }), t('eg.pg.c.stock', { u: uo().vol }), t('eg.pg.c.within')],
          rows.map((r) => [r.date, r.label, fixed(r.pct, 1) + ' %', fixed(r.cutDone / uo().volPer, 0), fixed(r.fillDone / uo().volPer, 0), fixed((r.overCut + r.overFill) / uo().volPer, 0), fixed((r.stockpile + r.dig) / uo().volPer, 0), fixed(r.within * 100, 0) + ' %']), 'data-eg-pg-series');
      }
      function run() {
        save('eg39', S);
        if (!ex || !design || !surveys.length) { status.textContent = t('eg.pg.need'); return; }
        const sched = S.sched ? S.sched.split(';').map((p) => { const [d, v] = p.split(':'); return { date: (d || '').trim(), pct: Number(v) }; }).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.date) && Number.isFinite(x.pct)) : null;
        const res = progressGrid({ existing: ex, design, surveys, region: regions?.length ? regions : null, tol: Number(S.tol) || 0.1, schedule: sched?.length ? sched : null });
        if (!res.series.length) { status.textContent = t('eg.pg.nodata'); return; }
        status.textContent = '';
        const last = res.series[res.series.length - 1];
        P.change(t('eg.pg.undo'), (st) => { const by = new Map((st.progress || []).map((r) => [r.date + '|' + r.label, r])); for (const r of res.series) by.set(r.date + '|' + r.label, r); st.progress = cleanProgress([...by.values()]); });
        const cv = el('canvas', { width: 520, height: 300, className: 'cv-eg-canvas', role: 'img', 'aria-label': t('eg.pg.map') });
        out.replaceChildren(kv([[t('eg.pg.r.planned'), t('eg.pg.r.plannedv', { cut: vol(res.planned.cut), fill: vol(res.planned.fill) })], [t('eg.pg.r.pct'), fixed(last.pct, 1) + ' %' + (last.ahead !== undefined ? ' · ' + t(last.ahead >= 0 ? 'eg.pg.r.ahead' : 'eg.pg.r.behind', { pct: fixed(Math.abs(last.ahead), 1) }) : '')],
          [t('eg.pg.r.rem'), t('eg.pg.r.remv', { cut: vol(last.remainingCut), fill: vol(last.remainingFill) })], [t('eg.pg.r.cov'), fixed(last.covered * 100, 0) + ' %'],
          ...(res.forecast ? [[t('eg.pg.r.fore'), t('eg.pg.r.forev', { date: res.forecast.date, pct: fixed(res.forecast.perDay, 1) })]] : [])]),
        progressTable(res.series), cv, el('p', { className: 'cv-note' }, t('eg.pg.legend')),
        el('div', { className: 'cv-actions' }, btn('CSV', 'download', () => dl(stem('progress') + '.csv', csv(['date', 'label', 'percent', 'cut_done', 'fill_done', 'remaining_cut', 'remaining_fill', 'over_cut', 'over_fill', 'stockpile', 'dig', 'within_tolerance'], res.series.map((r) => [r.date, r.label, fixed(r.pct, 2), fixed(r.cutDone, 1), fixed(r.fillDone, 1), fixed(r.remainingCut, 1), fixed(r.remainingFill, 1), fixed(r.overCut, 1), fixed(r.overFill, 1), fixed(r.stockpile, 1), fixed(r.dig, 1), fixed(r.within, 3)]))), 'data-eg-pg-csv')));   // i18n-ignore: file type, csv headers
        drawMap(cv, res);
      }
    }, { wide: true });
  }
  function drawMap(cv, res) {
    const g = cv.getContext('2d'), cells = res.map.cells; g.clearRect(0, 0, cv.width, cv.height); if (!cells.length) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const c of cells) { x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y); x1 = Math.max(x1, c.x); y1 = Math.max(y1, c.y); }
    const sc = Math.min(cv.width / (x1 - x0 + res.cell), cv.height / (y1 - y0 + res.cell)), tol = 0.1;
    for (const c of cells) {
      const d = c.now, a = Math.min(0.9, 0.25 + Math.abs(d) / 1.5);
      g.fillStyle = Math.abs(d) <= (Number(saved('eg39', { tol: 0.1 }).tol) || tol) ? 'rgba(80,160,90,0.55)' : d > 0 ? `rgba(210,120,40,${a})` : `rgba(40,100,200,${a})`;
      g.fillRect((c.x - x0) * sc, cv.height - (c.y - y0 + res.cell) * sc, Math.max(1, res.cell * sc + 0.5), Math.max(1, res.cell * sc + 0.5));
    }
  }
  async function loadSurvey(file, S) {
    const { buildGround } = await import('./ground-surface.js');
    const { Thinner } = await import('./thin.js');
    let pts = [];
    const spacing = Number(S.spacing) > 0 ? Number(S.spacing) : 0;
    if (/\.la[sz]$/i.test(file.name)) {
      const { readLasHeader, scanPoints } = await import('./las.js');
      const h = await readLasHeader(file), cell = spacing || Math.max(0.5, Math.sqrt(((h.max?.[0] - h.min?.[0]) * (h.max?.[1] - h.min?.[1])) / 400000) || 1);
      const th = new Thinner({ cell, mode: 'lowest', max: 2e6 });
      await scanPoints(file, h, (x, y, z, c) => { if (c !== 7 && c !== 18) th.add(x, y, z, c); });
      pts = th.points();
      if (!pts.some((p) => p.cls === 2)) { const { classifyGround } = await import('./ground-classify.js'); pts = classifyGround(pts, { cell, maxObject: cell * 20, slope: 0.3 }).ground; }
      else pts = pts.filter((p) => p.cls === 2);
    } else {
      const text = await file.text();
      for (const line of text.split(/\r?\n/)) { const m = line.trim().split(/[\s,;]+/).map(Number); if (m.length >= 3 && m.slice(-3).every(Number.isFinite)) { const [x, y, z] = m.slice(-3); pts.push({ x, y, z }); } if (pts.length > 2e6) break; }
    }
    if (pts.length < 3) throw new Error(t('eg.pg.few'));
    const r = buildGround({ points: pts, spacing: 0 });
    if (!r.surface) throw new Error(t('eg.pg.nosurface'));
    return { surface: r.surface, n: pts.length };
  }

  // ------------------------------------------------------------------ the host's hooks
  const COMMANDS = { 'eg-rain': () => rain.open(), 'eg-earthwork': earthwork, 'eg-route': () => route(false), 'eg-site': site, 'eg-pond': pond, 'eg-progress': progress };
  function command(c) { if (COMMANDS[c]) { COMMANDS[c](); return true; } return false; }
  function finish(tool, pts) {
    if (tool !== 'eg-route') return false;
    if (pts.length < 2) { ctx.say(t('eg.rt.need2')); return false; }
    routeState.fx = Number(fixed(pts[0].x, 3)); routeState.fy = Number(fixed(pts[0].y, 3)); routeState.tx = Number(fixed(pts[pts.length - 1].x, 3)); routeState.ty = Number(fixed(pts[pts.length - 1].y, 3));
    route(true); return true;
  }
  function problems() {
    const out = [...rain.problems()];
    const ponds = ctx.project().state.ponds || [], hydro = ctx.project().state.network?.hydro || null;
    for (const p of ponds) {
      let r; try { r = runPond(p, U(), { hydro }); } catch { r = null; }
      if (!r) continue;
      for (const c of r.checks) {
        const vars = { name: p.name, z: fixed((c.zMax ?? 0) / r.conv.len, 2), by: fixed((c.by ?? 0) / r.conv.len, 2), q: fixed((c.peakOut ?? 0) / r.conv.flow, 2), tg: fixed((c.target ?? 0) / r.conv.flow, 2), h: c.drawdown ? fixed(c.drawdown / 60, 0) : '–', max: fixed((c.max ?? 0) / 60, 0), a: fixed((c.attenuation ?? 0) * 100, 0), u: M() ? 'm' : 'ft', fu: M() ? 'm³/s' : 'ft³/s' };   // i18n-ignore: unit symbols
        out.push({ code: 'pond.' + c.code, part: c.code + ':' + p.id, severity: c.code === 'overtop' || c.code === 'over-target' ? 'error' : 'warning', msg: { key: 'eg.prob.pond.' + c.code, vars }, text: t('eg.prob.pond.' + c.code, vars), about: [] });
      }
    }
    return out;
  }
  return { command, ownsTool: (tl) => tl === 'eg-route', hints: { 'eg-route': 'eg.rt.hint' }, finish, problems, rain };
}
