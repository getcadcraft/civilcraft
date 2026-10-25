/* SPDX-License-Identifier: Apache-2.0 */
/**
 * massing-ui.js — masses in the app (0.7 LC.1 M1): the Masses block in Properties, the Mass tool's finish, a mass's
 * Properties (name, use, floors, floor height, height, base on sloping ground, ground, parcel; the read-outs: footprint,
 * gross floor area, ground under it, the ground floor level, cut and fill), picking, the selected outline and the plan
 * labels (scene items on A-MASS / A-MASS-TEXT, so the PDF plot and DWG/DXF get them). The numbers are massing.js's
 * (bin/test-civilcraft-massing.mjs). Every change is one undo step.
 *
 *   createMassing(ctx) → { block(), props(m), finish(pts), pick(w), overlay(c2d, S, C, sel), sceneItems(mm), remove(id), find(id),
 *                          list(), measure(m), command(c) }
 *   ctx = { el, project: () => Project, bimUrl() → '' | the URL of BimCraft when it takes a mass, bimApp() → its name, units, numInput, row, say, select(sel), tool(name), refresh(), redraw(), download(name, blob), ground(which) → elevationAt(x, y) | null }
 */

import { t } from './i18n.js';
import { pointInPoly } from './tin.js';
import { cleanMass, massArea, massGfa, massHeight, measureMass, setHeight, planItems, BASES, GROUNDS, centroid, MAX_MASSES } from './massing.js';
import { cleanZone, envelope, checkMasses } from './zoning.js';
import { createSunHours } from './sunhours-ui.js';
import { terrainRaster } from './sunhours.js';
import { writeMassingIfc, defaultOrigin } from './ifc-massing.js';
import { sendHandoff } from './handoff.js';
import { courses } from './parcels.js';
import { fixed, grouped, unitOf, volumeText, bearing } from './units.js';

export function createMassing(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => ctx.units(), L = () => (U() === 'm' ? 'm' : 'ft');
  const list = () => P().state.masses || [];
  const find = (id) => list().find((m) => m.id === id);
  const edit = (id, label, fn) => P().change(label, (st) => { const m = (st.masses || []).find((x) => x.id === id); if (m) fn(m, st); });
  const sunUi = createSunHours({ el, project: ctx.project, units: ctx.units, row: ctx.row, redraw: () => ctx.redraw(), refresh: () => ctx.refresh(), download: (n, b) => ctx.download(n, b),
    masses: () => list().map((m) => { const me = measure(m); return { mass: m, z0: me.z0, zBottom: me.zBottom }; }),
    terrain: (bounds, cell) => { const elev = ctx.ground(list().some((m) => m.ground === 'fg') ? 'fg' : 'eg') || ctx.ground('eg'); return elev ? terrainRaster(elev, bounds, cell) : null; } });
  const zones = () => P().state.zoning || [];
  const zoneOf = (parcelId) => zones().find((z) => z.parcel === parcelId) || null;
  const parcelOf = (id) => (P().state.parcels || []).find((p) => p.id === id) || null;
  const area = (v) => grouped(v, 0) + ' ' + unitOf(U()).area;

  /** Everything the read-outs and the 3D mesh need about one mass: its ground, ground floor level, cut and fill. */
  function measure(m) {
    return measureMass(m, ctx.ground(m.ground) || ctx.ground('eg'));
  }

  // ---- zoning (zoning.js): the limits are the ones the person types; nothing here comes from any city's code
  const editZone = (parcelId, label, fn) => P().change(label, (st) => {
    if (!st.zoning) st.zoning = [];
    let z = st.zoning.find((q) => q.parcel === parcelId);
    if (!z) { z = cleanZone({ parcel: parcelId }, st.units); st.zoning.push(z); }
    fn(z);
  });
  const parcelMasses = (parcelId) => list().filter((m) => m.parcel === parcelId);
  function zoningForm(parcelId) {
    const par = parcelOf(parcelId);
    if (!par) return [];
    const z = zoneOf(parcelId) || cleanZone({ parcel: parcelId }, U());
    const num = (key, label, id, fn, { calc = true } = {}) => ctx.row(label, ctx.numInput(z[key] ? fixed(z[key], 2).replace(/,/g, '') : '', (v) => {
      const s = String(v).trim(), n = s === '' ? 0 : Number(s);
      if (!Number.isFinite(n) || n < 0) return false;
      editZone(parcelId, t('zn.undo.set'), (q) => { fn(q, n); });
      return true;
    }, { label, id, width: '6rem', calc }), id);
    const cs = courses(par.pts);
    const front = el('select', { className: 'cv-select', id: 'cv-zn-front', 'data-zn-front': '' }, ...cs.map((c, i) => el('option', { value: String(i) }, t('zn.line', { n: i + 1, what: c.kind === 'line' ? bearing(c.dir) + ' ' + fixed(c.dist, 2) : t('zn.curve') }))));
    front.value = String(Math.min(z.frontCourse, cs.length - 1));
    front.addEventListener('change', () => editZone(parcelId, t('zn.undo.set'), (q) => { q.frontCourse = Number(front.value); q.rearCourse = null; }));
    const skyFrom = el('select', { className: 'cv-select', id: 'cv-zn-skyfrom' }, el('option', { value: 'front' }, t('zn.sky.front')), el('option', { value: 'all' }, t('zn.sky.all')));
    skyFrom.value = z.sky?.from || 'front';
    skyFrom.addEventListener('change', () => editZone(parcelId, t('zn.undo.set'), (q) => { if (q.sky) q.sky.from = skyFrom.value === 'all' ? 'all' : 'front'; }));
    const showEnv = el('input', { type: 'checkbox', id: 'cv-zn-show', 'data-zn-show': '', checked: !!z.show });
    showEnv.addEventListener('change', () => editZone(parcelId, t('zn.undo.show'), (q) => { q.show = showEnv.checked; }));
    const L1 = L();
    const rows = [
      ...ctx.row(t('zn.front.line'), front, 'cv-zn-front'),
      ...num('front', t('zn.front', { u: L1 }), 'cv-zn-sb-front', (q, n) => { q.front = n; }),
      ...num('side', t('zn.side', { u: L1 }), 'cv-zn-sb-side', (q, n) => { q.side = n; }),
      ...num('rear', t('zn.rear', { u: L1 }), 'cv-zn-sb-rear', (q, n) => { q.rear = n; }),
      ...num('heightCap', t('zn.cap', { u: L1 }), 'cv-zn-cap', (q, n) => { q.heightCap = n; }),
      ...ctx.row(t('zn.sky.h0', { u: L1 }), ctx.numInput(z.sky ? fixed(z.sky.h0, 2).replace(/,/g, '') : '', (v) => { const n = Number(String(v).trim() || 0); if (!(n >= 0)) return false; editZone(parcelId, t('zn.undo.set'), (q) => { q.sky = { h0: n, rise: q.sky?.rise || 2, from: q.sky?.from || 'front' }; if (!(n > 0) && !q.sky.rise) q.sky = null; }); return true; }, { label: t('zn.sky.h0', { u: L1 }), id: 'cv-zn-sky-h0', width: '6rem' }), 'cv-zn-sky-h0'),
      ...ctx.row(t('zn.sky.rise'), ctx.numInput(z.sky ? fixed(z.sky.rise, 2).replace(/,/g, '') : '', (v) => { const s = String(v).trim(), n = s === '' ? 0 : Number(s); if (!(n >= 0)) return false; editZone(parcelId, t('zn.undo.set'), (q) => { q.sky = n > 0 ? { h0: q.sky?.h0 || 0, rise: n, from: q.sky?.from || 'front' } : null; }); return true; }, { label: t('zn.sky.rise'), id: 'cv-zn-sky-rise', width: '6rem', calc: false }), 'cv-zn-sky-rise'),
      ...ctx.row(t('zn.sky.from'), skyFrom, 'cv-zn-skyfrom'),
      ...num('far', t('zn.far'), 'cv-zn-far', (q, n) => { q.far = n; }, { calc: false }),
      ...ctx.row(t('zn.coverage'), ctx.numInput(z.coverage ? fixed(z.coverage * 100, 1).replace(/,/g, '') : '', (v) => { const s = String(v).trim(), n = s === '' ? 0 : Number(s); if (!(n >= 0 && n <= 100)) return false; editZone(parcelId, t('zn.undo.set'), (q) => { q.coverage = n / 100; }); return true; }, { label: t('zn.coverage'), id: 'cv-zn-cov', width: '6rem', calc: false }), 'cv-zn-cov'),
      ...ctx.row(t('zn.show'), showEnv, 'cv-zn-show')];
    const out = [el('h3', { className: 'cv-h3', 'data-zn-head': '' }, t('zn.head', { parcel: par.name })), el('p', { className: 'cv-note' }, t('zn.note')), el('div', { className: 'cv-props', 'data-zn-props': '' }, ...rows)];
    const res = checkMasses(par, z, parcelMasses(parcelId)), env = res.envelope;
    const lis = [];
    if (env.problem) lis.push(el('li', { className: 'is-bad' }, t('zn.res.fold')));
    else if (z.front || z.side || z.rear || Object.keys(z.setbacks || {}).length) lis.push(el('li', { 'data-zn-env': '' }, t('zn.res.env', { area: area(env.area), lot: area(env.lotArea) })));
    for (const it of res.items) {
      const m = it.mass ? list().find((q) => q.id === it.mass) : null, nm = m ? m.name : '';
      const txt = it.key === 'setback' ? (it.problem ? t('zn.res.setback.none', { name: nm }) : it.ok ? t('zn.res.setback.ok', { name: nm }) : t('zn.res.setback.bad', { name: nm, area: area(it.value) }))
        : it.key === 'height' ? t(it.ok ? 'zn.res.height.ok' : 'zn.res.height.bad', { name: nm, h: fixed(it.value, 2) + ' ' + L1, limit: fixed(it.limit, 2) + ' ' + L1, by: it.by === 'sky' ? t('zn.by.sky') : t('zn.by.cap') })
        : it.key === 'far' ? t(it.ok ? 'zn.res.far.ok' : 'zn.res.far.bad', { v: fixed(it.value, 2), limit: fixed(it.limit, 2) })
        : t(it.ok ? 'zn.res.cov.ok' : 'zn.res.cov.bad', { v: fixed(it.value * 100, 1) + '%', limit: fixed(it.limit * 100, 1) + '%' });
      lis.push(el('li', { className: it.ok ? '' : 'is-bad', 'data-zn-res': it.key, 'data-ok': String(it.ok) }, (it.ok ? '✓ ' : '✗ ') + txt));   // i18n-ignore: check marks
    }
    if (lis.length) out.push(el('div', { className: 'cv-report' + (res.ok ? '' : ' is-error'), 'data-zn-result': '' }, el('ul', {}, ...lis)));
    if (!parcelMasses(parcelId).length) out.push(el('p', { className: 'cv-note' }, t('zn.nomass')));
    return out;
  }
  let zoneParcel = null;

  /** The masses (all, or the one with this id) as an IFC4 file: a site, a building and storeys per mass, the mass as a proxy, placed on the map when the project has a coordinate system. */
  async function buildIfc(only = null) {
    const ms = list().filter((m) => !only || m.id === only);
    if (!ms.length) return null;
    const masses = ms.map((m) => { const me = measure(m); return { id: m.id, name: m.name, use: m.use, pts: m.pts, floors: m.floors, floorHeight: m.floorHeight, z0: me.z0, base: m.base, ground: m.ground, parcel: parcelOf(m.parcel)?.name || '' }; });
    const crs = P().state.crs, origin = defaultOrigin(masses);
    let lat = null, lon = null;
    if (crs) { try { const { transformer } = await import('./crs.js'); [lon, lat] = transformer(crs, null)(origin.x, origin.y); } catch { lat = lon = null; } }
    const r = writeMassingIfc({ name: P().state.name || 'Site', units: U(), crs, lat, lon, origin, masses });
    const name = ((P().state.name || 'site').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').trim().slice(0, 80) || 'site') + '-masses.ifc';
    return { text: r.text, name, counts: r.counts, crs: !!crs };
  }
  async function exportIfc() {
    const r = await buildIfc();
    if (!r) { ctx.say(t('ms.ifc.none')); return; }
    ctx.download(r.name, new Blob([r.text], { type: 'application/x-step' }));
    ctx.say(t(r.crs ? 'ms.ifc.done' : 'ms.ifc.done.nocrs', { n: r.counts.masses, file: r.name }));
  }
  /** "Develop in BimCraft": the masses as an IFC, handed to BimCraft in a new tab (handoff.js; nothing is uploaded). */
  async function developInBim(only = null) {
    const url = ctx.bimUrl?.() || '';
    if (!url) { await exportIfc(); return; }
    const r = await buildIfc(only);
    if (!r) { ctx.say(t('ms.ifc.none')); return; }
    try {
      await sendHandoff(url, new File([r.text], r.name, { type: 'application/x-step' }), 'civilcraft', { kind: 'mass', n: r.counts.masses });
      ctx.say(t('ms.bim.done', { n: r.counts.masses, app: ctx.bimApp?.() || 'BimCraft' }));
    } catch (e) { ctx.say(t(e?.code === 'blocked' ? 'ms.bim.blocked' : 'ms.bim.failed')); }
  }

  function block() {
    const out = [el('h3', { className: 'cv-h3', 'data-ms-head': '' }, t('ms.head'))];
    const ms = list();
    if (ms.length) out.push(el('ul', { className: 'cv-plainlist', 'data-ms-list': '' }, ...ms.map((m) => el('li', {},
      el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: 'mass', id: m.id }) }, m.name), ' ', t('ms.row', { floors: m.floors, gfa: area(massGfa(m)) })))));
    else out.push(el('p', { className: 'cv-note' }, t('ms.none')));
    const ps = P().state.parcels || [];
    if (ps.length) {
      if (!ps.some((p) => p.id === zoneParcel)) zoneParcel = ps[0].id;
      const sp = el('select', { className: 'cv-select', id: 'cv-zn-parcel', 'data-zn-parcel': '', 'aria-label': t('zn.parcel') }, ...ps.map((p) => el('option', { value: p.id }, p.name)));
      sp.value = zoneParcel;
      sp.addEventListener('change', () => { zoneParcel = sp.value; ctx.refresh(); });
      out.push(el('div', { className: 'cv-props' }, ...ctx.row(t('zn.parcel'), sp, 'cv-zn-parcel')), ...zoningForm(zoneParcel));
    }
    if (ms.length) out.push(...sunUi.block());
    out.push(el('div', { className: 'cv-actions' },
      ...(ms.length ? [el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ms-ifc': '', title: t('ms.ifc.title'), onclick: () => exportIfc() }, el('i', { className: 'bi bi-box-arrow-up', 'aria-hidden': 'true' }), ' ', t('ms.ifc'))] : []),
      ...(ms.length && ctx.bimUrl?.() ? [el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ms-bim': '', title: t('ms.bim.title', { app: ctx.bimApp?.() || 'BimCraft' }), onclick: () => developInBim() }, el('i', { className: 'bi bi-building-up', 'aria-hidden': 'true' }), ' ', t('ms.bim.all'))] : []),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ms-draw': '', onclick: () => ctx.tool('mass') }, el('i', { className: 'bi bi-building', 'aria-hidden': 'true' }), ' ', t('ms.draw'))));
    return out;
  }

  const sel = (m, key, values, label, id, apply) => {
    const s = el('select', { className: 'cv-select', id }, ...values.map(([v, text]) => el('option', { value: v }, text)));
    s.value = m[key] ?? '';
    s.addEventListener('change', () => edit(m.id, label, (q) => apply(q, s.value)));
    return s;
  };

  function props(m) {
    const out = [];
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-ms-name', value: m.name, maxLength: 120 });
    nm.addEventListener('change', () => edit(m.id, t('ms.undo.rename'), (q) => { q.name = nm.value.trim().slice(0, 120) || t('ms.default'); }));
    const use = el('input', { type: 'text', className: 'cv-input', id: 'cv-ms-use', value: m.use, maxLength: 60, placeholder: t('ms.use.ph') });
    use.addEventListener('change', () => edit(m.id, t('ms.undo.use'), (q) => { q.use = use.value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 60); }));
    const floors = ctx.numInput(String(m.floors), (v) => { const n = Math.round(Number(v)); if (!(n >= 1 && n <= 200)) return false; edit(m.id, t('ms.undo.floors'), (q) => { q.floors = n; }); return true; }, { label: t('ms.floors'), id: 'cv-ms-floors', calc: false, width: '5rem' });
    const fh = ctx.numInput(fixed(m.floorHeight, 2).replace(/,/g, ''), (v) => { const n = Number(v); if (!(n > 0 && n < 1000)) return false; edit(m.id, t('ms.undo.fh'), (q) => { q.floorHeight = n; }); return true; }, { label: t('ms.fh', { u: L() }), id: 'cv-ms-fh', width: '6rem' });
    // push/pull: the height as a number; the floor count is the nearest whole number of floors
    const hgt = ctx.numInput(fixed(massHeight(m), 2).replace(/,/g, ''), (v) => { const n = Number(v); if (!(n > 0)) return false; edit(m.id, t('ms.undo.height'), (q) => { q.floors = setHeight(q, n); }); return true; }, { label: t('ms.height', { u: L() }), id: 'cv-ms-height', width: '6rem' });
    const base = sel(m, 'base', BASES.map((b) => [b, t('ms.base.' + b)]), t('ms.undo.base'), 'cv-ms-base', (q, v) => { if (BASES.includes(v)) q.base = v; });
    const gnd = sel(m, 'ground', GROUNDS.map((g) => [g, t('ms.ground.' + g)]), t('ms.undo.ground'), 'cv-ms-ground', (q, v) => { if (GROUNDS.includes(v)) q.ground = v; });
    const par = el('select', { className: 'cv-select', id: 'cv-ms-parcel' }, el('option', { value: '' }, t('ms.parcel.none')), ...(P().state.parcels || []).map((p) => el('option', { value: p.id }, p.name)));
    par.value = m.parcel || '';
    par.addEventListener('change', () => edit(m.id, t('ms.undo.parcel'), (q) => { q.parcel = par.value || null; }));
    const me = measure(m), g = me.ground;
    const facts = [
      ...ctx.row(t('ms.name'), nm, 'cv-ms-name'),
      ...ctx.row(t('ms.use'), use, 'cv-ms-use'),
      ...ctx.row(t('ms.floors'), floors, 'cv-ms-floors'),
      ...ctx.row(t('ms.fh', { u: L() }), fh, 'cv-ms-fh'),
      ...ctx.row(t('ms.height', { u: L() }), hgt, 'cv-ms-height'),
      ...ctx.row(t('ms.parcel'), par, 'cv-ms-parcel'),
      ...ctx.row(t('ms.base'), base, 'cv-ms-base'),
      ...ctx.row(t('ms.ground'), gnd, 'cv-ms-ground'),
      ...ctx.row(t('ms.footprint'), el('span', { 'data-ms-footprint': '' }, area(massArea(m)))),
      ...ctx.row(t('ms.gfa'), el('span', { 'data-ms-gfa': '' }, area(massGfa(m))))];
    if (g) {
      facts.push(
        ...ctx.row(t('ms.ground.range'), el('span', { 'data-ms-range': '' }, fixed(g.min, 2) + ' – ' + fixed(g.max, 2) + ' ' + L())),
        ...ctx.row(t('ms.z0'), el('span', { 'data-ms-z0': '' }, fixed(me.z0, 2) + ' ' + L())),
        ...ctx.row(t('ms.fill'), el('span', { 'data-ms-fill': '' }, volumeText(me.fill, U(), 1))),
        ...ctx.row(t('ms.cut'), el('span', { 'data-ms-cut': '' }, volumeText(me.cut, U(), 1))));
    }
    out.push(el('div', { className: 'cv-props', 'data-ms-props': '' }, ...facts));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ms-ifc': '', title: t('ms.ifc.title'), onclick: () => exportIfc() }, el('i', { className: 'bi bi-box-arrow-up', 'aria-hidden': 'true' }), ' ', t('ms.ifc'))));
    if (ctx.bimUrl?.()) out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ms-develop': '', title: t('ms.bim.title', { app: ctx.bimApp?.() || 'BimCraft' }), onclick: () => developInBim(m.id) }, el('i', { className: 'bi bi-building-up', 'aria-hidden': 'true' }), ' ', t('ms.bim.this'))));
    if (m.parcel) out.push(...zoningForm(m.parcel));
    out.push(...sunUi.block());   // sun hours for every mass, from a mass's own Properties too
    if (!g) out.push(el('p', { className: 'cv-note' }, t('ms.noground')));
    else if (g.missing) out.push(el('p', { className: 'cv-note' }, t('ms.partground', { n: g.missing })));
    return out;
  }

  /** The Mass tool's finish: a mass of three floors on the parcel it stands in (by its centre). */
  function finish(pts) {
    if (pts.length < 3) { ctx.say(t('ms.few')); return false; }
    const probe = cleanMass({ pts: pts.map((p) => ({ x: p.x, y: p.y })) }, U());
    if (!probe) { ctx.say(t('ms.flat')); return false; }
    if (list().length >= MAX_MASSES) { ctx.say(t('ms.toomany', { n: MAX_MASSES })); return false; }
    const c = centroid(probe.pts), par = (P().state.parcels || []).find((p) => pointInPoly(c.x, c.y, p.pts));
    const name = t('ms.default') + ' ' + (list().length + 1), id = P().nextId('m');
    P().change(t('ms.undo.draw'), (st) => { if (!st.masses) st.masses = []; st.masses.push({ ...probe, id, name, parcel: par ? par.id : null }); });
    ctx.select({ kind: 'mass', id });
    ctx.say(t('ms.drawn', { name, gfa: area(massGfa(probe)), floors: probe.floors }));
    return true;
  }

  function pick(w) {
    let best = null, bd = Infinity;
    for (const m of list()) {
      const inside = pointInPoly(w.x, w.y, m.pts);
      if (!inside) continue;
      const a = massArea(m);
      if (a < bd) { bd = a; best = { kind: 'mass', id: m.id }; }   // the smallest one under the pointer: a tower on a podium
    }
    return best;
  }

  function overlay(c2d, S, C, sel) {
    sunUi.overlay(c2d, S, C);
    if (sel?.kind !== 'mass') return;
    const m = find(sel.id);
    if (!m) return;
    c2d.save();
    c2d.strokeStyle = C.action; c2d.lineWidth = 2.5; c2d.beginPath();
    m.pts.forEach((p, i) => { const q = S(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
    c2d.closePath(); c2d.stroke(); c2d.restore();
  }

  const sceneItems = (mm) => [...list().flatMap((m) => planItems(m, { units: U(), unitPerMm: 1 / mm })),
    ...zones().filter((z) => z.show && parcelOf(z.parcel)).flatMap((z) => { const e = envelope(parcelOf(z.parcel), z); return e.poly && e.area < e.lotArea ? [{ layer: 'A-MASS-ENVL', kind: 'poly', pts: e.poly, closed: true }] : []; })];   // the setback envelope (zoning.js)

  function remove(id) {
    const m = find(id);
    if (!m) return false;
    P().change(t('ms.undo.delete'), (st) => { st.masses = st.masses.filter((x) => x.id !== id); });
    ctx.say(t('fl.deleted', { name: m.name }));
    return true;
  }

  function command(c) { if (c === 'mass') { ctx.tool('mass'); return true; } return false; }

  return { block, props, finish, pick, overlay, sceneItems, remove, find, list, measure, command, exportIfc, buildIfc, developInBim };
}
