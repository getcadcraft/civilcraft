/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the Energy code check panel (0.11 Track T24, T24.5), the same in every host. The only file of lib/energycode that touches a page,
 * and only inside mountPanel(). Text is always set as text, never as HTML.
 *
 * mountPanel(root, host) → { ready, state(), result(), set(patch), refresh(), unmount() }
 * host = { t(key, vars), pack (cleanPack'd), storage: { get, set }, download(name, text, type),
 *          read() → Promise<{ postcode | null, cfa | null (the pack's area unit), walls: [{ key, name, area, guess: { framing, spacing } }],
 *                             windows: [{ name, area, u | null, shgc | null, bearing | null }], doors: [{ name, area, u | null }], north: bool }>,
 *          settings?: { read() → Promise<JSON text | null>, write(json text) → Promise }   the drawing's own copy of what the person stated,
 *          writeWallU?(typeKey, siValue W/m²K) → Promise<number of walls written>   (T24.6) give the wall type's U-factor to the model, where the quick
 *                                                                                    heat loss reads it; absent = the panel offers no such button
 *          writeRoofU?(si), writeFloorU?(si) → Promise<number of elements written>  (T24.6) the same for the roof elements and the lowest floor }
 *
 * What the model cannot say (what is in a wall's cavity, the attic insulation, the windows' rated values) the person states here. Those
 * statements are kept with the drawing when the host can (settings), else in this browser. The result table is check.js's rows in words.
 */
import { check } from './check.js';
import { zoneOf, wallU, wallChoices, wallColumns, atticChoices, need, floorChoices, floorColumns, slabChoices } from './pack.js';
import { cbeccProject } from './cbecc.js';
import { toSI, wallTypeUs, ceilingUOf, floorUOf, slabFOf } from './uvalues.js';

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'className') n.className = v; else if (k.startsWith('on')) n[k] = v; else if (v !== false && v !== null && v !== undefined) n.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
}
const CSS = `
.ec-panel{padding:.5rem .7rem;display:grid;grid-template-columns:minmax(0,1fr);gap:.6rem;font-size:.9em;min-width:0;max-width:100%;overflow-wrap:anywhere}
.ec-panel p{white-space:normal;margin:.2rem 0}
.ec-panel h4{margin:.5rem 0 .2rem;font-size:1.05em}
.ec-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem .6rem;margin:.3rem 0}
.ec-field{display:grid;gap:.1rem;min-width:0;align-content:start}
.ec-field span{font-size:.85em;opacity:.85}
.ec-field input,.ec-field select{width:100%;box-sizing:border-box;background:#fff;color:#111;border:1px solid #9aa5b1;border-radius:3px;padding:.2rem .3rem}
.ec-note{margin:.2rem 0;font-size:.85em;opacity:.9}
.ec-card{border:1px solid rgba(128,128,128,.35);border-radius:4px;padding:.3rem .5rem}
.ec-card strong{display:block}
.ec-table{width:100%;border-collapse:collapse;font-size:.88em}
.ec-table td{padding:.2rem .3rem;border-bottom:1px solid rgba(128,128,128,.25);vertical-align:top}
.ec-table td:first-child{width:1.6rem;font-weight:700;text-align:center}
.ec-ok td:first-child{color:#15803d}.ec-bad td:first-child{color:#b91c1c}.ec-q td:first-child{color:#b45309}
.ec-bad{background:rgba(185,28,28,.07)}
.ec-row{display:flex;flex-wrap:wrap;gap:.4rem;margin:.3rem 0}
.ec-sum{font-weight:600}
`;
export const SETTINGS_FORMAT = 'cc-energy-code';
const FRAMINGS = ['2x4', '2x6', '2x8'], SPACINGS = [16, 24], FLOOR_FRAMINGS = ['2x6', '2x8', '2x10', '2x12'], SLAB_EDGES = ['none', 'h12', 'h24', 'h36', 'h48', 'v12', 'v24', 'v36', 'v48', 'full'];
const num = (v) => { const s = String(v ?? '').trim(); if (s === '') return null; const x = Number(s); return Number.isFinite(x) ? x : null; };
const f3 = (x) => (x === null || x === undefined ? '' : x.toFixed(3)), f1 = (x) => (x === null || x === undefined ? '' : (Math.round(x * 10) / 10).toString());
const whole = (x) => Math.round(x).toLocaleString('en-US');

/** What a person stated, cleaned: anything else is dropped. */
export function cleanSettings(raw) {
  const o = raw && typeof raw === 'object' ? raw : {}, out = { format: SETTINGS_FORMAT, pack: typeof o.pack === 'string' ? o.pack.slice(0, 80) : '', postcode: typeof o.postcode === 'string' ? o.postcode.trim().slice(0, 10) : '', zone: Number.isInteger(o.zone) ? o.zone : null,
    cfa: o.cfa > 0 && o.cfa < 1e7 ? Number(o.cfa) : null, walls: {}, ceiling: { kind: ['attic-c', 'attic-b', 'cathedral'].includes(o.ceiling?.kind) ? o.ceiling.kind : null, r: o.ceiling?.r >= 0 && o.ceiling?.r <= 200 ? Number(o.ceiling.r) : null, radiant: o.ceiling?.radiant === true ? true : o.ceiling?.radiant === false ? false : null,
      spacing: SPACINGS.includes(o.ceiling?.spacing) ? o.ceiling.spacing : 24, continuous: o.ceiling?.continuous >= 0 && o.ceiling?.continuous <= 100 ? Number(o.ceiling.continuous) : 0 },
    floor: { kind: ['raised', 'slab'].includes(o.floor?.kind) ? o.floor.kind : null, r: o.floor?.r >= 0 && o.floor?.r <= 200 ? Number(o.floor.r) : null,
      crawl: o.floor?.crawl !== false, framing: FLOOR_FRAMINGS.includes(o.floor?.framing) ? o.floor.framing : null, spacing: SPACINGS.includes(o.floor?.spacing) ? o.floor.spacing : 16,
      continuous: o.floor?.continuous >= 0 && o.floor?.continuous <= 100 ? Number(o.floor.continuous) : 0, heated: o.floor?.heated === true, edge: SLAB_EDGES.includes(o.floor?.edge) ? o.floor.edge : 'none' },
    windowU: o.windowU > 0 && o.windowU < 5 ? Number(o.windowU) : null, windowShgc: o.windowShgc > 0 && o.windowShgc <= 1 ? Number(o.windowShgc) : null, doorU: o.doorU > 0 && o.doorU < 5 ? Number(o.doorU) : null };
  for (const [k, w] of Object.entries(o.walls && typeof o.walls === 'object' ? o.walls : {}).slice(0, 60)) {
    if (k.length > 120 || !w || typeof w !== 'object') continue;
    out.walls[k] = { framing: FRAMINGS.includes(w.framing) ? w.framing : null, spacing: SPACINGS.includes(w.spacing) ? w.spacing : 16, cavity: w.cavity >= 0 && w.cavity <= 100 ? Number(w.cavity) : null, continuous: w.continuous >= 0 && w.continuous <= 100 ? Number(w.continuous) : 0 };
  }
  return out;
}

/** The building check.js wants, from what the model says and what the person stated. */
export function buildingOf(model, S) {
  const M = model || { walls: [], windows: [], doors: [] };
  return {
    postcode: S.postcode || M.postcode || '', zone: S.zone, cfa: S.cfa ?? M.cfa ?? null, faces: M.faces || [], height: M.height ?? null, stories: M.stories ?? 1, perimeter: M.perimeter ?? null,
    walls: (M.walls || []).map((w) => { const s = S.walls[w.key] || {}; return { key: w.key, name: w.name, area: w.area, framing: s.framing ?? w.guess?.framing ?? null, spacing: s.spacing ?? w.guess?.spacing ?? 16, cavity: s.cavity ?? null, continuous: s.continuous ?? 0 }; }),
    ceiling: S.ceiling, floor: S.floor,
    windows: (M.windows || []).map((w) => ({ ...w, u: w.u ?? S.windowU, shgc: w.shgc ?? S.windowShgc })),
    doors: (M.doors || []).map((d) => ({ ...d, u: d.u ?? S.doorU })),
  };
}

/** One result row in words. */
export function rowText(t, r) {
  const v = { ...r.vars, have: r.unit === 'u' || r.unit === 'shgc' ? f3(r.have) : r.unit === 'pct' ? f1(r.have) : r.have === null ? '' : String(r.have), need: r.unit === 'u' || r.unit === 'shgc' ? f3(r.need) : r.need === null ? '' : String(r.need), ref: r.ref };
  if (r.vars && r.vars.none) return t('ec.row.none.' + r.id, v);
  if (r.ok === null) return t('ec.row.' + r.id + '.q', v) + ' ' + t('ec.why.' + r.why, v);
  return t('ec.row.' + r.id + (r.ok ? '.ok' : '.bad'), v);
}

export function reportCsv(t, pack, res) {
  const q = (s) => { const x = String(s ?? ''); return /^[=+\-@\t\r]/.test(x) ? '"\'' + x.replace(/"/g, '""') + '"' : /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
  const lines = [[t('ec.csv.result'), t('ec.csv.what'), t('ec.csv.have'), t('ec.csv.need'), t('ec.csv.ref')].map(q).join(',')];
  for (const r of res.rows) lines.push([r.ok === true ? t('ec.csv.ok') : r.ok === false ? t('ec.csv.bad') : t('ec.csv.note'), rowText(t, r), r.have ?? '', r.need ?? '', r.ref].map(q).join(','));
  lines.push('', q(pack.name), q(t('ec.notice')));
  return lines.join('\r\n') + '\r\n';
}

export function mountPanel(root, host) {
  const t = host.t, pack = host.pack;
  const X = { S: cleanSettings(null), model: null, res: null, said: '', bad: false, loading: true, inDrawing: false };
  if (!document.getElementById('ec-panel-css')) document.head.append(el('style', { id: 'ec-panel-css' }, CSS));
  const wrap = el('div', { className: 'ec-panel' });
  root.append(wrap);

  // Writes into the drawing go one after another; `pending` says one is still on its way, `last` is the text the drawing holds from us.
  // Changes made within a moment of each other go in as ONE write (one undo step), not one per box.
  let pending = 0, last = null, chain = Promise.resolve(), queued = false, timer = null;
  const flush = () => {
    if (timer === null) return;
    clearTimeout(timer); timer = null;
    const text = JSON.stringify(X.S);
    chain = chain.then(async () => { try { if (text !== last) { await host.settings.write(text); last = text; } X.inDrawing = true; } catch { X.inDrawing = false; } pending--; if (!pending) later(); });
  };
  const keep = () => {
    X.S.pack = pack.id;
    host.storage?.set?.('settings', X.S);
    if (!host.settings) return;
    if (timer === null) pending++; else clearTimeout(timer);
    timer = setTimeout(flush, host.keepDelay ?? 1200);
  };
  const work = () => { X.res = check(pack, buildingOf(X.model, X.S)); if (host.problems) try { host.problems(X.res); } catch { /* the Problems panel is not there */ } };
  /** Draw after the event that asked for it is over: a box that is still being left must not be taken away under the browser's feet. */
  const later = () => { if (queued) return; queued = true; setTimeout(() => { queued = false; if (wrap.isConnected) draw(); }, 0); };
  const change = (fn) => { fn(X.S); work(); later(); keep(); };
  async function load() {
    X.loading = true; draw();
    let own = null;
    if (host.settings) { try { const j = await host.settings.read(); if (j) { own = JSON.parse(j); X.inDrawing = true; last = j; } } catch { own = null; } }
    if (!own || own.format !== SETTINGS_FORMAT) { own = host.storage?.get?.('settings') || null; X.inDrawing = false; }
    X.S = cleanSettings(own);
    try { X.model = await host.read(); } catch (e) { X.model = null; X.said = String(e.message || e); X.bad = true; }
    X.loading = false; work(); draw();
  }
  /** The model changed (an edit, Undo, Redo): read its facts again. What the person stated stays, unless the drawing now holds another
   *  statement than the one this panel wrote (an Undo or Redo of it): then the drawing's is taken. Our own writes in flight are left alone. */
  async function modelChanged() {
    if (pending || X.loading) return;
    let j = null;
    try { j = host.settings ? await host.settings.read() : null; } catch { j = null; }
    if (pending) return;
    if (j && j !== last) { try { const own = JSON.parse(j); if (own.format === SETTINGS_FORMAT) { X.S = cleanSettings(own); last = j; X.inDrawing = true; } } catch { /* not ours */ } }
    try { X.model = await host.read(); } catch { /* keep what was read before */ }
    work(); later();
  }

  const field = (label, control, hint) => el('label', { className: 'ec-field' }, el('span', {}, label), control, hint ? el('small', { className: 'ec-note' }, hint) : null);
  const select = (attrs, options, value, onpick) => el('select', { ...attrs, onchange: (ev) => { if (ev.target.isConnected) onpick(ev.target.value); } }, ...options.map(([v, label]) => el('option', { value: String(v), selected: String(v) === String(value ?? '') }, label)));
  const box = (attrs, value, onset) => el('input', { type: 'number', step: 'any', min: '0', value: value ?? '', ...attrs, onchange: (ev) => { if (ev.target.isConnected) onset(num(ev.target.value)); } });

  function placeBlock() {
    const B = buildingOf(X.model, X.S), z = X.res?.zone;
    return el('section', { 'data-ec-place': '' }, el('h4', {}, t('ec.sec.place')),
      el('div', { className: 'ec-grid' },
        field(t('ec.f.postcode'), el('input', { type: 'text', inputmode: 'numeric', maxlength: '10', value: B.postcode, 'data-ec-in': 'postcode', onchange: (ev) => { if (ev.target.isConnected) change((S) => { S.postcode = ev.target.value.trim(); S.zone = null; }); } })),
        field(t('ec.f.cfa'), box({ 'data-ec-in': 'cfa' }, X.S.cfa ?? (X.model?.cfa ? Math.round(X.model.cfa) : ''), (v) => change((S) => { S.cfa = v; })), X.S.cfa === null && X.model?.cfa ? t('ec.cfa.model') : null)),
      z ? el('p', { 'data-ec-zone': String(z) }, t('ec.zone', { zone: z, name: pack.zones.names[String(z)] || '' })) : el('p', { className: 'ec-note', 'data-ec-zone': '' }, B.postcode ? t('ec.zone.unknown', { code: B.postcode }) : t('ec.zone.ask')));
  }
  function wallsBlock() {
    const B = buildingOf(X.model, X.S);
    const out = el('section', { 'data-ec-walls': '' }, el('h4', {}, t('ec.sec.walls')), el('p', { className: 'ec-note' }, t('ec.walls.intro')));
    if (!B.walls.length) out.append(el('p', { className: 'ec-note' }, t('ec.walls.none')));
    for (const w of B.walls) {
      const put = (patch) => change((S) => { S.walls[w.key] = { framing: w.framing, spacing: w.spacing, cavity: w.cavity, continuous: w.continuous, ...patch }; });
      const u = w.framing && w.cavity !== null ? wallU(pack, w) : null;
      const cav = wallChoices(pack, w.spacing, w.framing);
      out.append(el('div', { className: 'ec-card', 'data-ec-wall': w.key },
        el('strong', {}, w.name), el('span', { className: 'ec-note' }, t('ec.area', { ft: whole(w.area), m: f1(w.area * 0.09290304) })),
        el('div', { className: 'ec-grid' },
          field(t('ec.f.framing'), select({ 'data-ec-in': 'framing' }, [['', t('ec.pick')], ...FRAMINGS.map((x) => [x, x])], w.framing, (v) => put({ framing: v || null, cavity: null }))),
          field(t('ec.f.spacing'), select({ 'data-ec-in': 'spacing' }, SPACINGS.map((x) => [x, t('ec.spacing', { n: x })]), w.spacing, (v) => put({ spacing: Number(v), cavity: null }))),
          field(t('ec.f.cavity'), select({ 'data-ec-in': 'cavity' }, [['', t('ec.pick')], ...cav.map((c) => [c.cavity, c.cavity === 0 ? t('ec.cavity.none') : 'R-' + c.cavity + (c.dense ? ' ' + t('ec.cavity.dense') : '')])], w.cavity, (v) => put({ cavity: v === '' ? null : Number(v) }))),
          field(t('ec.f.continuous'), select({ 'data-ec-in': 'continuous' }, wallColumns(pack, w.spacing).map((c) => [c, c === 0 ? t('ec.cavity.none') : 'R-' + c]), w.continuous, (v) => put({ continuous: Number(v) })))),
        u && u.ok ? el('p', { 'data-ec-wall-u': f3(u.u) }, t('ec.wall.u', { u: f3(u.u), table: u.table, page: u.page })) : null,
        u && u.ok && host.writeWallU ? el('div', { className: 'ec-row' }, el('button', { type: 'button', className: 'btn-line', 'data-ec-act': 'write-u', onclick: () => giveU([{ key: w.key, name: w.name, si: toSI(u.u), u: u.u }]) }, t('ec.u.give', { si: toSI(u.u).toFixed(3) }))) : null));
    }
    const all = host.writeWallU ? wallTypeUs(pack, B) : [];
    if (all.length > 1) out.append(el('div', { className: 'ec-row' }, el('button', { type: 'button', className: 'btn-line', 'data-ec-act': 'write-u-all', onclick: () => giveU(all) }, t('ec.u.give.all', { n: all.length }))));
    if (host.writeWallU && B.walls.length) out.append(el('p', { className: 'ec-note', 'data-ec-u-note': '' }, t('ec.u.note')));
    return out;
  }
  /** T24.6: put the code table's U-factor of each stated wall type into the model (Pset_WallCommon.ThermalTransmittance, one undo step per type),
   *  where Heating and cooling loads read it first. Said in words afterwards; nothing is written for a wall whose U-factor the table cannot give. */
  async function giveU(list) {
    const done = [];
    try {
      for (const w of list) { const n = await host.writeWallU(w.key, w.si); done.push(t('ec.u.done.one', { name: w.name, si: w.si.toFixed(3), u: f3(w.u), n })); }
      X.said = done.join(' '); X.bad = false;
    } catch (e) { X.said = t('ec.u.failed', { why: String(e && e.message || e) }); X.bad = true; }
    draw();
  }
  function envelopeBlock() {
    const C = X.S.ceiling, F = X.S.floor, attic = atticChoices(pack, C.spacing || 24).filter((r) => r > 0);
    const cU = ceilingUOf(pack, C), fU = floorUOf(pack, F), sF = slabFOf(pack, F, X.model?.perimeter ?? null);
    const putC = (p) => change((S) => { Object.assign(S.ceiling, p); }), putF = (p) => change((S) => { Object.assign(S.floor, p); });
    const give = (u, fn, what, n) => (u.ok && fn ? el('div', { className: 'ec-row' }, el('button', { type: 'button', className: 'btn-line', 'data-ec-act': 'write-u-' + what, disabled: !n,
      onclick: () => giveOne(fn, u, what) }, t('ec.u.give.' + what, { si: u.si.toFixed(3), n: n || 0 }))) : null);
    const out = el('section', { 'data-ec-envelope': '' }, el('h4', {}, t('ec.sec.ceiling')),
      el('div', { className: 'ec-grid' },
        field(t('ec.f.ceiling.kind'), select({ 'data-ec-in': 'ceiling.kind' }, [['', t('ec.pick')], ['attic-c', t('ec.ceiling.attic-c')], ['attic-b', t('ec.ceiling.attic-b')], ['cathedral', t('ec.ceiling.cathedral')]], C.kind, (v) => putC({ kind: v || null }))),
        field(t('ec.f.ceiling.r'), select({ 'data-ec-in': 'ceiling.r' }, [['', t('ec.pick')], ...attic.map((r) => [r, 'R-' + r])], C.r, (v) => putC({ r: v === '' ? null : Number(v) }))),
        field(t('ec.f.ceiling.radiant'), select({ 'data-ec-in': 'ceiling.radiant' }, [['', t('ec.notsaid')], ['yes', t('ec.yes')], ['no', t('ec.no')]], C.radiant === true ? 'yes' : C.radiant === false ? 'no' : '', (v) => putC({ radiant: v === 'yes' ? true : v === 'no' ? false : null }))),
        C.kind && C.kind !== 'cathedral' ? field(t('ec.f.spacing'), select({ 'data-ec-in': 'ceiling.spacing' }, SPACINGS.map((x) => [x, t('ec.spacing', { n: x })]), C.spacing, (v) => putC({ spacing: Number(v) }))) : null,
        C.kind && C.kind !== 'cathedral' ? field(t('ec.f.continuous'), select({ 'data-ec-in': 'ceiling.continuous' }, (pack.assemblies.attic?.spacing[String(C.spacing || 24)]?.continuous || [0]).map((c) => [c, c === 0 ? t('ec.cavity.none') : 'R-' + c]), C.continuous, (v) => putC({ continuous: Number(v) }))) : null),
      cU.ok ? el('p', { 'data-ec-ceiling-u': f3(cU.u) }, t('ec.ceiling.u', { u: f3(cU.u), si: cU.si.toFixed(3), table: cU.table, page: cU.page })) : C.kind === 'cathedral' ? el('p', { className: 'ec-note' }, t('ec.ceiling.u.cathedral')) : null,
      give(cU, host.writeRoofU, 'roof', X.model?.roofs),
      el('h4', {}, t('ec.sec.floor')),
      el('div', { className: 'ec-grid' },
        field(t('ec.f.floor.kind'), select({ 'data-ec-in': 'floor.kind' }, [['', t('ec.pick')], ['raised', t('ec.floor.raised')], ['slab', t('ec.floor.slab')]], F.kind, (v) => putF({ kind: v || null }))),
        F.kind === 'raised' ? field(t('ec.f.floor.under'), select({ 'data-ec-in': 'floor.crawl' }, [['yes', t('ec.floor.under.crawl')], ['no', t('ec.floor.under.air')]], F.crawl === false ? 'no' : 'yes', (v) => putF({ crawl: v !== 'no' }))) : null,
        F.kind === 'raised' ? field(t('ec.f.framing'), select({ 'data-ec-in': 'floor.framing' }, [['', t('ec.pick')], ...FLOOR_FRAMINGS.map((x) => [x, x])], F.framing, (v) => putF({ framing: v || null, r: null }))) : null,
        F.kind === 'raised' ? field(t('ec.f.spacing'), select({ 'data-ec-in': 'floor.spacing' }, SPACINGS.map((x) => [x, t('ec.spacing', { n: x })]), F.spacing, (v) => putF({ spacing: Number(v) }))) : null,
        F.kind === 'raised' ? field(t('ec.f.floor.r'), select({ 'data-ec-in': 'floor.r' }, [['', t('ec.pick')], ...floorChoices(pack, F.crawl !== false, F.spacing).filter((c) => c.cavity === 0 || c.framing === F.framing).map((c) => [c.cavity, c.cavity === 0 ? t('ec.cavity.none') : 'R-' + c.cavity])], F.r, (v) => putF({ r: v === '' ? null : Number(v) }))) : null,
        F.kind === 'raised' ? field(t('ec.f.continuous'), select({ 'data-ec-in': 'floor.continuous' }, floorColumns(pack, F.crawl !== false, F.spacing).map((c) => [c, c === 0 ? t('ec.cavity.none') : 'R-' + c]), F.continuous, (v) => putF({ continuous: Number(v) }))) : null,
        F.kind === 'slab' ? field(t('ec.f.floor.heated'), select({ 'data-ec-in': 'floor.heated' }, [['no', t('ec.no')], ['yes', t('ec.yes')]], F.heated ? 'yes' : 'no', (v) => putF({ heated: v === 'yes' }))) : null,
        F.kind === 'slab' ? field(t('ec.f.floor.edge'), select({ 'data-ec-in': 'floor.edge' }, SLAB_EDGES.map((x) => [x, t('ec.edge.' + x)]), F.edge, (v) => putF({ edge: v, r: v === 'none' ? 0 : null }))) : null,
        F.kind === 'slab' && F.edge !== 'none' ? field(t('ec.f.floor.r'), select({ 'data-ec-in': 'floor.r' }, [['', t('ec.pick')], ...slabChoices(pack, F.heated, F.edge).map((r) => [r, 'R-' + r])], F.r, (v) => putF({ r: v === '' ? null : Number(v) }))) : null,
        F.kind === 'slab' && F.edge === 'none' && need(pack, 'floor.slab.r', X.res?.zone) !== null ? field(t('ec.f.floor.r'), box({ 'data-ec-in': 'floor.r' }, F.r, (v) => putF({ r: v }))) : null),
      fU.ok ? el('p', { 'data-ec-floor-u': f3(fU.u) }, t('ec.floor.u', { u: f3(fU.u), si: fU.si.toFixed(3), table: fU.table, page: fU.page })) : null,
      give(fU, host.writeFloorU, 'floor', X.model?.floors),
      sF.ok ? el('p', { 'data-ec-slab-f': String(sF.f) }, t('ec.slab.f', { f: String(sF.f), si: sF.siF.toFixed(3), table: sF.table, page: sF.page }) + (sF.fp !== null ? ' ' + t('ec.slab.fp', { fp: whole(sF.fp), si: f1(sF.siFP) }) : '')) : null,
      F.kind === 'slab' ? el('p', { className: 'ec-note', 'data-ec-slab-note': '' }, t('ec.slab.note')) : null,
      (cU.ok && host.writeRoofU) || (fU.ok && host.writeFloorU) ? el('p', { className: 'ec-note', 'data-ec-u-env-note': '' }, t('ec.u.env.note')) : null);
    return out;
  }
  /** T24.6: the ceiling's or the raised floor's table U-factor into the model's roof elements / lowest floor slabs (one undo step). */
  async function giveOne(fn, u, what) {
    try { const n = await fn(u.si); X.said = t('ec.u.done.' + what, { si: u.si.toFixed(3), u: f3(u.u), n }); X.bad = false; }
    catch (e) { X.said = t('ec.u.failed', { why: String(e && e.message || e) }); X.bad = true; }
    draw();
  }
  function openingsBlock() {
    const g = X.res?.glazing, n = (X.model?.windows || []).length, d = (X.model?.doors || []).length;
    return el('section', { 'data-ec-openings': '' }, el('h4', {}, t('ec.sec.windows')),
      el('p', { className: 'ec-note', 'data-ec-glazing': '' }, n ? t('ec.windows.sum', { n, ft: whole(g?.total || 0), m: f1((g?.total || 0) * 0.09290304), west: whole(g?.west || 0) }) : t('ec.windows.none')),
      X.model && !X.model.north && n ? el('p', { className: 'ec-note' }, t('ec.windows.nonorth')) : null,
      el('div', { className: 'ec-grid' },
        field(t('ec.f.window.u'), box({ 'data-ec-in': 'windowU', step: '0.01' }, X.S.windowU, (v) => change((S) => { S.windowU = v; })), t('ec.windows.rated')),
        field(t('ec.f.window.shgc'), box({ 'data-ec-in': 'windowShgc', step: '0.01' }, X.S.windowShgc, (v) => change((S) => { S.windowShgc = v; }))),
        d ? field(t('ec.f.door.u', { n: d }), box({ 'data-ec-in': 'doorU', step: '0.01' }, X.S.doorU, (v) => change((S) => { S.doorU = v; }))) : null));
  }
  function resultBlock() {
    const r = X.res;
    if (!r) return null;
    const mark = (ok) => (ok === true ? '✓' : ok === false ? '✗' : '?');
    return el('section', { 'data-ec-result': '' }, el('h4', {}, t('ec.sec.result')),
      el('p', { className: 'ec-sum', 'data-ec-counts': r.counts.ok + '/' + r.counts.bad + '/' + r.counts.note }, t('ec.counts', r.counts)),
      el('table', { className: 'ec-table' }, el('tbody', {}, ...r.rows.filter((x) => x.id !== 'zone').map((x) => el('tr', { className: x.ok === true ? 'ec-ok' : x.ok === false ? 'ec-bad' : 'ec-q', 'data-ec-row': x.id, 'data-ec-ok': String(x.ok) },
        el('td', { 'aria-label': t(x.ok === true ? 'ec.csv.ok' : x.ok === false ? 'ec.csv.bad' : 'ec.csv.note') }, mark(x.ok)), el('td', {}, rowText(t, x), el('div', { className: 'ec-note' }, x.ref)))))),
      el('div', { className: 'ec-row' }, el('button', { type: 'button', className: 'btn-line', 'data-ec-act': 'csv', onclick: () => { host.download('energy-code-check.csv', reportCsv(t, pack, r), 'text/csv'); X.said = t('ec.saved'); X.bad = false; later(); } }, t('ec.btn.csv'))));
  }
  function performanceBlock() {
    const p = pack.performance;
    if (!p) return null;
    return el('section', { 'data-ec-performance': '' }, el('h4', {}, t('ec.sec.performance')),
      el('p', {}, t('ec.perf.what', { section: p.section, budgets: p.budgets.join(', ') })),
      el('p', {}, t('ec.perf.software', { software: p.software.map((s) => s.name).join(', '), section: p.software_section }), p.list ? [' ', el('a', { href: p.list, target: '_blank', rel: 'noopener' }, t('ec.perf.list'))] : null),
      el('p', { className: 'ec-note' }, t('ec.perf.not')),
      host.words ? projectFileBlock() : null);
  }
  /** The envelope as the approved program's own project file, for the energy consultant to finish. Nothing is written while something is missing. */
  function projectFile() {
    const stem = String(host.modelName?.() || 'house').replace(/\.[A-Za-z0-9]+$/, '').replace(/[^A-Za-z0-9 _-]+/g, ' ').trim().slice(0, 50) || 'house';
    return { stem, made: cbeccProject(buildingOf(X.model, X.S), { name: stem, zone: X.res?.zone ?? null, words: host.words }) };
  }
  function projectFileBlock() {
    const { stem, made } = projectFile();
    const list = (keys, prefix) => el('ul', {}, ...keys.map((k) => el('li', {}, t(prefix + k))));
    return el('div', { className: 'ec-card', 'data-ec-cbecc': made.ok ? 'ready' : 'missing' },
      el('strong', {}, t('ec.cbecc.h')),
      el('p', {}, t('ec.cbecc.what', { program: host.words.program })),
      made.ok ? null : [el('p', { className: 'ec-note' }, t('ec.cbecc.missing')), list(made.missing, 'ec.cbecc.miss.')],
      made.ok ? [el('p', { className: 'ec-note' }, t('ec.cbecc.assumed')), list(made.assumed, 'ec.cbecc.as.'), el('p', { className: 'ec-note' }, t('ec.cbecc.left')), list(made.left, 'ec.cbecc.left.')] : null,
      el('p', { className: 'ec-note', 'data-ec-cbecc-proof': '' }, t('ec.cbecc.proof')),
      el('p', { className: 'ec-note', 'data-ec-cbecc-view': '' }, t('ec.cbecc.view')),
      el('div', { className: 'ec-row' }, el('button', { type: 'button', className: 'btn-line', 'data-ec-act': 'cbecc', disabled: !made.ok, onclick: () => { const m = projectFile(); if (!m.made.ok) return; host.download(m.stem + '.ribd25', m.made.text, 'text/plain'); X.said = t('ec.cbecc.saved', { name: m.stem + '.ribd25' }); X.bad = false; later(); } }, t('ec.cbecc.btn'))));
  }
  /** Which box the person is in, so a redraw can put them back there: its name, and its wall card when it is in one. */
  const where = () => { const a = document.activeElement; if (!a || !wrap.contains(a) || !a.getAttribute('data-ec-in')) return null; return { name: a.getAttribute('data-ec-in'), wall: a.closest('[data-ec-wall]')?.getAttribute('data-ec-wall') ?? null }; };
  function draw() {
    if (X.loading) { wrap.replaceChildren(el('p', { className: 'ec-note' }, t('ec.loading'))); return; }
    const at = where();
    paint();
    if (at) { const scope = at.wall !== null ? [...wrap.querySelectorAll('[data-ec-wall]')].find((n) => n.getAttribute('data-ec-wall') === at.wall) : wrap; const n = scope && [...scope.querySelectorAll('[data-ec-in]')].find((x) => x.getAttribute('data-ec-in') === at.name); if (n) n.focus({ preventScroll: true }); }
  }
  function paint() {
    wrap.replaceChildren(
      el('p', { className: 'ec-note', 'data-ec-notice': '' }, t('ec.notice')),
      el('p', { className: 'ec-note', 'data-ec-pack': pack.id }, t('ec.pack', { name: pack.name, checked: pack.source.checked }), ' ', pack.review.note),
      placeBlock(), wallsBlock(), envelopeBlock(), openingsBlock(), resultBlock(), performanceBlock(),
      el('p', { className: 'ec-note', 'data-ec-kept': X.inDrawing ? 'drawing' : 'browser' }, t(X.inDrawing ? 'ec.kept.drawing' : 'ec.kept.browser')),
      X.said ? el('p', { className: 'ec-note', 'data-ec-said': '', role: 'status', style: X.bad ? 'color:#b91c1c' : '' }, X.said) : null);
  }

  draw();
  const ready = load();
  return {
    ready, state: () => ({ settings: X.S, model: X.model, inDrawing: X.inDrawing, pending }), result: () => X.res, refresh: load, modelChanged,
    projectFile: () => (host.words ? projectFile().made : null),
    set(patch) { change((S) => { const c = cleanSettings({ ...S, ...patch, walls: { ...S.walls, ...(patch.walls || {}) }, ceiling: { ...S.ceiling, ...(patch.ceiling || {}) }, floor: { ...S.floor, ...(patch.floor || {}) } }); Object.assign(S, c); }); return X.res; },
    flush, unmount() { flush(); wrap.remove(); },
  };
}
