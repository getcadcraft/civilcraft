/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-concrete-panel.js — the "Concrete (ACI 318-19)" and "Seismic (ASCE 7-22)" blocks of the frame analysis panel (0.8 SU.1056,
 * session concrete-08). Shown when the host says `concrete: true` (DetailCraft). Imports only lib/frame; the page's DOM helper,
 * words and undo come from frame-panel.js through `ui`. An aid until an engineer has reviewed it — the blocks say so first.
 *
 *   concretePanel(ui) → { blocks() → [nodes], check(), makeSeismic(), makeCombos(), clear(), tables() → [report tables], problems() }
 *   ui = { el, t, C, host, sel, btn, link, head, field, note, table, td, current(), change(label, fn), rerender(), result(), stale(), run(), version() }
 *   host (added to frame-panel.js's): concrete: true · sections() → [{ name, A, Iy, Iz }] (the sections the drawn members use)
 *     · problems(list) → the checks' problems for the app's shared ⚠ panel · showUtil(frame, Map|null)
 */
import { cleanConcrete, rcOf, suggestFloors, floorWeights, seismicCases, rayleighPeriods, driftRows, problemsOf, concreteTables, SYSTEMS, RISKS, ROLES, GEN } from './frame-concrete.js';
import { checkRcFrame } from './rc-design.js';
import { cleanSlab, slabDesign, slabProblems } from './slab-design.js';
import { utilRamp } from './frame-design.js';
import { generateCombos } from './frame-combos.js';

const pct = (v) => (v === null || v === undefined || !Number.isFinite(v) ? '' : (Math.round(v * 1000) / 10).toFixed(1) + ' %');
const f1 = (v, d = 1) => (Number.isFinite(v) ? (Math.round(v * 10 ** d) / 10 ** d).toFixed(d) : '');

export function concretePanel(ui) {
  const { el, t, C, host } = ui;
  let rc = null;           // { version, res } — the last concrete check, valid while the model is unchanged
  const rcNow = () => (rc && rc.version === ui.version() && rc.res.ok ? rc.res : null);
  let slabRes = null;      // { version, res } — the last slab design (plates), valid while the model is unchanged
  const slabNow = () => (slabRes && slabRes.version === ui.version() && slabRes.res.ok ? slabRes.res : null);
  const conc = () => cleanConcrete(ui.current().concrete) || cleanConcrete({});
  const edit = (label, fn) => ui.change(label, (x) => { const c = cleanConcrete(x.concrete) || cleanConcrete({}); fn(c); x.concrete = c; });
  const num = (value, onchange, attrs = {}) => el('input', { type: 'text', inputMode: 'decimal', className: C.input + ' fa-factor', value: String(value), onchange: (e) => { const v = Number(String(e.target.value).replace(',', '.')); if (Number.isFinite(v)) onchange(v); else ui.rerender(); }, ...attrs });
  const undo = () => t('frame.rc.undo');
  // 0.9 GH.3-A: floor heights and drifts in the app's display unit when it passes host.len (frame-panel.js); otherwise mm as before
  const L = host.len || null;
  const zHead = () => 'z (' + (L ? L.mark() : 'mm') + ')';   // i18n-ignore: symbol and unit
  const smallHead = (sym) => sym + ' (' + (L ? L.smallMark() : 'mm') + ')';   // i18n-ignore: symbol and unit
  const lenIn = (mm, onchange, attrs = {}) => (L ? el('input', { type: 'text', className: C.input + ' fa-factor', value: L.num(mm), onchange: (e) => { const v = L.parse(e.target.value); if (Number.isFinite(v)) onchange(v); else ui.rerender(); }, ...attrs }) : num(mm, onchange, attrs));

  // ---- problems for the shell's ⚠ panel (rule 29: failed checks go there, never a panel of their own) ----
  const drawnOf = () => {
    const out = new Map();
    const r = ui.result();
    if (r?.frame) for (const [id, list] of r.frame.parts) for (const q of list) out.set(r.frame.model.members[q.k].id, id);
    return out;
  };
  function driftNow() { const r = ui.result(); return r && !r.error && !ui.stale() ? driftRows(r.frame, r.sol, conc()) : []; }
  function problems() {
    const map = drawnOf();
    return [...problemsOf({ rc: rcNow(), drift: driftNow(), drawn: (id) => map.get(id) || id, label: (id) => host.member(id)?.label || '', t }), ...slabProblems(slabNow(), { t })];
  }
  const publish = () => host.problems?.(problems());

  // ---- the concrete check ----
  function check() {
    const a = ui.current(), c = conc();
    if (!Object.keys(c.forms).length) { host.print(t('frame.rc.err.no-forms')); return; }
    if (!ui.result() || ui.result().error || ui.stale()) ui.run();
    const r = ui.result();
    if (!r || r.error) return;
    const res = checkRcFrame(r.frame.model, r.sol, rcOf(c, r.frame.model));
    rc = { version: ui.version(), res };
    if (!res.ok) { host.print(t('frame.rc.err.' + res.error)); host.showUtil?.(r.frame, null); publish(); ui.rerender(); return; }
    host.print(t('frame.rc.checked', { n: res.counts.checked, bad: res.counts.failed, skip: res.counts.notChecked }));
    const m = utilMap(res);
    if (m) host.showUtil?.(r.frame, m);
    publish();
    ui.rerender();
    void a;
  }
  function utilMap(res) {
    const r = ui.result();
    if (!res || !r?.frame) return null;
    const out = new Map();
    for (const [id, list] of r.frame.parts) {
      let u = null;
      for (const q of list) { const v = res.members[q.k]?.util; if (v !== null && v !== undefined) u = Math.max(u ?? 0, v); }
      out.set(id, u);
    }
    return out;
  }

  // ---- combinations (ACI 318-19 5.3.1 takes the load combinations of ASCE 7) ----
  function makeCombos() {
    const a = ui.current();
    const gen = generateCombos('asce-aisc', a.cases.map((q) => ({ id: q.id, name: q.name, kind: q.kind })), {});
    if (!gen.combos.length) { host.print(t('frame.des.err.no-made')); return; }
    ui.change(t('frame.des.undo-gen'), (x) => { x.combos = [...x.combos.filter((q) => !q.limit), ...gen.combos]; });
    host.print(t('frame.des.made', { n: gen.combos.length, clause: 'ASCE 7' }) + (gen.warnings.some((w) => w.code === 'other-skipped') ? ' ' + t('frame.des.other-skipped') : ''));
  }

  // ---- seismic cases ----
  function makeSeismic() {
    const c = conc();
    if (!ui.result() || ui.result().error || ui.stale()) ui.run();      // the frame the floors make is needed (its diaphragms and nodes)
    const r = ui.result();
    if (!r || r.error) return;
    if (!r.frame.model.diaphragms?.length) { host.print(t('frame.eq.err.no-floors')); return; }
    const made = seismicCases(r.frame, c, { name: (dir, sign) => t('frame.eq.case', { dir, sign: sign > 0 ? '+' : '−' }) });
    if (!made.ok) { host.print(t('frame.eq.err.' + made.error)); return; }
    const hadCombos = ui.current().combos.some((q) => q.limit);
    ui.change(t('frame.eq.undo-make'), (x) => {
      const gone = new Set(x.cases.filter((q) => q.gen === GEN).map((q) => q.id));
      x.cases = [...x.cases.filter((q) => q.gen !== GEN), ...made.cases];
      x.combos = x.combos.map((q) => ({ ...q, factors: q.factors.filter((f) => !gone.has(f.case)) })).filter((q) => q.limit || q.factors.length);
      if (hadCombos) {
        const gen = generateCombos('asce-aisc', x.cases.map((q) => ({ id: q.id, name: q.name, kind: q.kind })), {});
        x.combos = [...x.combos.filter((q) => !q.limit), ...gen.combos];
      }
    });
    host.print(t('frame.eq.made', { n: made.cases.length, V: f1(made.elf.V / 1000, 0) }) + (made.skipped.length ? ' ' + t('frame.eq.skipped', { ids: made.skipped.join(', ') }) : ''));
  }

  // ---- the period from the analysis (Rayleigh; 0.8 round 3) ----
  function takePeriod() {
    const c = conc();
    if (!ui.result() || ui.result().error || ui.stale()) ui.run();
    const r = ui.result();
    if (!r || r.error) return;
    const rp = rayleighPeriods(r.frame, r.sol, c);
    if (!rp.ok) { host.print(t('frame.eq.period-err.' + rp.error)); return; }
    const Tx = rp.X ? rp.X.T : null, Ty = rp.Y ? rp.Y.T : null;
    edit(t('frame.eq.period-undo'), (q) => { q.seismic.useT = true; if (Tx) q.seismic.Tx = Math.round(Tx * 1000) / 1000; if (Ty) q.seismic.Ty = Math.round(Ty * 1000) / 1000; });
    makeSeismic();
    const made = seismicCases(ui.result()?.frame || r.frame, conc());
    host.print(t('frame.eq.period-done', { Tx: Tx ? f1(Tx, 3) : '–', Ty: Ty ? f1(Ty, 3) : '–', cap: made.ok ? f1(made.elf.Cu * made.elf.Ta, 3) : '' }));
  }

  // ---- storey weights from cases (the helper) ----
  const seismicIds = (a) => new Set(a.cases.filter((q) => q.kind === 'seismic').map((q) => q.id));
  function takeWeights() {
    const a = ui.current(), c = conc();
    if (!ui.result() || ui.result().error || ui.stale()) ui.run();
    const r = ui.result();
    if (!r || r.error) return;
    const have = new Set((r.frame.model.diaphragms || []).map((d) => d.id));
    const floors = c.floors.filter((f) => have.has(f.id));
    if (!floors.length) { host.print(t('frame.eq.err.no-floors')); return; }
    const entries = a.cases.filter((q) => !seismicIds(a).has(q.id)).map((q) => ({ id: q.id, f: c.wcases[q.id] ?? (q.kind === 'dead' ? 1 : 0) })).filter((e) => e.f);
    if (!entries.length) { host.print(t('frame.eq.weights-none')); return; }
    const w = floorWeights(r.frame.model, entries, floors);
    if (!w.ok) { host.print(t('frame.eq.weights-err')); return; }
    edit(t('frame.eq.undo-floors'), (q) => { for (const f of q.floors) if (f.id in w.weights) f.w = Math.round(w.weights[f.id] / 100) / 10; });
    host.print(t('frame.eq.weights-done', { n: floors.length, total: f1(Object.values(w.weights).reduce((s, v) => s + v, 0) / 1000, 1), ground: f1(w.ground / 1000, 1) }));
  }

  // ---- blocks ----
  function formRow(sec, f) {
    const key = sec.name.toUpperCase();
    const set = (fn) => edit(undo(), (c) => fn(c.forms[key]));
    const bars = f.cage ? 2 * (f.cage.ny + f.cage.nz) - 4 : f.top.n + f.bottom.n + 2 * f.side.n;
    const barField = (label, row, put, attr) => ui.field(label, el('span', { className: 'fa-inline' }, num(row.n, (v) => set((q) => put(q).n = Math.round(v)), { 'data-fa-rc': key + ':' + attr + '-n', 'aria-label': label + ' n' }), ' ⌀ ', num(row.d, (v) => set((q) => { put(q).d = v; }), { 'data-fa-rc': key + ':' + attr + '-d', 'aria-label': label + ' ⌀' })));
    return el('details', { className: 'fa-rcform', 'data-fa-rc-form': key, open: true },
      el('summary', {}, `${sec.name} · ${f.b} × ${f.h} mm · ${t('frame.rc.bars', { n: bars })}`),      // i18n-ignore: symbols and units
      el('div', { className: 'fa-row' },
        ui.field('b (mm)', num(f.b, (v) => set((q) => { q.b = v; }), { 'data-fa-rc': key + ':b' })), ui.field('h (mm)', num(f.h, (v) => set((q) => { q.h = v; }), { 'data-fa-rc': key + ':h' })),
        ui.field(t('frame.rc.f-cover'), num(f.cover, (v) => set((q) => { q.cover = v; }), { 'data-fa-rc': key + ':cover' })),
        ui.field(t('frame.rc.f-role'), ui.sel(f.role, ROLES.map((v) => [v, t('frame.rc.role-' + v)]), (v) => set((q) => { q.role = v; }), { 'data-fa-rc': key + ':role' })),
        ui.field(t('frame.rc.f-cage'), el('input', { type: 'checkbox', checked: !!f.cage, 'data-fa-rc': key + ':cage', onchange: (e) => set((q) => { q.cage = e.target.checked ? { ny: 3, nz: 3, d: 25 } : null; }) }))),
      f.cage
        ? el('div', { className: 'fa-row' },
          ui.field(t('frame.rc.f-ny'), num(f.cage.ny, (v) => set((q) => { q.cage.ny = Math.round(v); }), { 'data-fa-rc': key + ':ny' })), ui.field(t('frame.rc.f-nz'), num(f.cage.nz, (v) => set((q) => { q.cage.nz = Math.round(v); }), { 'data-fa-rc': key + ':nz' })),
          ui.field(t('frame.rc.f-bar'), num(f.cage.d, (v) => set((q) => { q.cage.d = v; }), { 'data-fa-rc': key + ':cage-d' })),
          ui.field(t('frame.rc.f-spiral'), el('input', { type: 'checkbox', checked: f.spiral, onchange: (e) => set((q) => { q.spiral = e.target.checked; }) })))
        : el('div', { className: 'fa-row' }, barField(t('frame.rc.f-top'), f.top, (q) => q.top, 'top'), barField(t('frame.rc.f-bottom'), f.bottom, (q) => q.bottom, 'bottom'), barField(t('frame.rc.f-side'), f.side, (q) => q.side, 'side')),
      el('div', { className: 'fa-row' },
        ui.field(t('frame.rc.f-legs'), num(f.tie.legs, (v) => set((q) => { q.tie.legs = Math.round(v); }), { 'data-fa-rc': key + ':legs' })),
        ui.field(t('frame.rc.f-tie'), num(f.tie.d, (v) => set((q) => { q.tie.d = v; }), { 'data-fa-rc': key + ':tie-d' })),
        ui.field(t('frame.rc.f-s'), num(f.tie.s, (v) => set((q) => { q.tie.s = v; }), { 'data-fa-rc': key + ':tie-s' })),
        ui.link(t('frame.ui.remove'), () => edit(undo(), (c) => { delete c.forms[key]; }), { 'data-fa-rc-remove': key })));
  }

  function concreteBlock() {
    const c = conc();
    const secs = host.sections?.() || [];
    const out = [ui.head(t('frame.rc.h'), ui.btn(t('frame.des.make'), makeCombos, { 'data-fa-rc-make': '' }), ui.btn(t('frame.rc.check'), check, { 'data-fa-rc-run': '' })),
      el('p', { className: 'fa-aid', 'data-fa-rc-aid': '' }, t('frame.rc.aid')),
      el('div', { className: 'fa-row' },
        ui.field("f'c (MPa)", num(c.mat.fc, (v) => edit(undo(), (q) => { q.mat.fc = v; }), { 'data-fa-rc-mat': 'fc' })), ui.field('fy (MPa)', num(c.mat.fy, (v) => edit(undo(), (q) => { q.mat.fy = v; }), { 'data-fa-rc-mat': 'fy' })),   // i18n-ignore: symbols and units
        ui.field('fyt (MPa)', num(c.mat.fyt, (v) => edit(undo(), (q) => { q.mat.fyt = v; }), { 'data-fa-rc-mat': 'fyt' })), ui.field('K', num(c.mat.k, (v) => edit(undo(), (q) => { q.mat.k = v; }), { 'data-fa-rc-mat': 'k' })), ui.field(t('frame.rc.f-beta'), num(c.mat.betaDns, (v) => edit(undo(), (q) => { q.mat.betaDns = Math.min(1, Math.max(0, v)); }), { 'data-fa-rc-mat': 'betaDns' })),   // i18n-ignore: symbols and units
        ui.field(t('frame.rc.f-stiff'), ui.sel(c.mat.cracked ? 'cracked' : 'gross', [['cracked', t('frame.rc.stiff-cracked')], ['gross', t('frame.rc.stiff-gross')]], (v) => edit(undo(), (q) => { q.mat.cracked = v === 'cracked'; }), { 'data-fa-rc-mat': 'stiff' })),
        ui.field(t('frame.rc.f-frame'), ui.sel(c.mat.sway ? 'sway' : 'nonsway', [['sway', t('frame.rc.sway')], ['nonsway', t('frame.rc.nonsway')]], (v) => edit(undo(), (q) => { q.mat.sway = v === 'sway'; }), { 'data-fa-rc-mat': 'sway' })))];
    if (!secs.length) out.push(ui.note(t('frame.rc.no-sections')));
    for (const s of secs) {
      const f = c.forms[s.name.toUpperCase()];
      if (f) { out.push(formRow(s, f)); continue; }
      // a rectangle: depth h along local z from Iy = b h³ / 12, so h = √(12 Iy / A), b = A / h
      const h = Math.sqrt(12 * s.Iy / s.A), b = s.A / h;
      out.push(el('div', { className: 'fa-row' }, el('span', { className: 'fa-lead' }, s.name),
        ui.link(t('frame.rc.setup'), () => edit(undo(), (q) => { q.forms[s.name.toUpperCase()] = { b: Math.round(b), h: Math.round(h), cover: 50, top: { n: 2, d: 20 }, bottom: { n: 3, d: 20 }, side: { n: 0, d: 12 }, cage: null, tie: { legs: 2, d: 10, s: 150 }, role: 'auto', spiral: false }; }), { 'data-fa-rc-setup': s.name })));
    }
    out.push(ui.note(t('frame.rc.assume-note')));
    const a = ui.current(), res = rcNow();
    const nStrength = a.combos.filter((q) => q.limit === 'strength').length;
    out.push(ui.note(nStrength ? t('frame.des.have-combos', { n: nStrength, m: a.combos.filter((q) => q.limit === 'service').length }) : t('frame.des.no-combos'), { 'data-fa-rc-combos': '' }));
    if (!res) { out.push(ui.note(rc && rc.version !== ui.version() ? t('frame.des.stale') : t('frame.des.none-yet'), { 'data-fa-rc-state': '' })); return el('div', { className: C.block + ' fa-concrete', 'data-fa-concrete': '' }, ...out); }
    out.push(ui.note(t('frame.des.counts-text', { n: res.counts.checked, partial: res.counts.partial, bad: res.counts.failed, skip: res.counts.notChecked, combos: res.combos }), { 'data-fa-rc-summary': '' }));
    const r = ui.result(), map = drawnOf();
    const rows = [...res.members].sort((x, y) => (y.util ?? -1) - (x.util ?? -1));
    out.push(ui.table([t('frame.rep.member'), t('frame.rep.section'), t('frame.des.util'), t('frame.des.state'), t('frame.des.governs'), t('frame.des.set')], [2], rows.map((m) => {
      const id = map.get(m.id) || null, lab = id ? host.member(id)?.label || id : m.id;
      const rgb = m.util === null ? null : utilRamp(m.util).map((v) => Math.round(v * 255)).join(',');
      return el('tr', { 'data-fa-rc-row': m.status },
        el('td', {}, id ? el('button', { type: 'button', className: C.link, onclick: () => host.select(id) }, lab) : lab), ui.td(m.section),
        el('td', { className: 'n' }, rgb ? el('span', { className: 'fa-util', style: '--fa-util:rgb(' + rgb + ')' }, pct(m.util)) : ''),
        ui.td(t('frame.des.st.' + m.status)),
        ui.td(m.status === 'not-checked' ? t('frame.rc.why.' + m.why) : t('frame.rc.check.' + m.check.id) + ' · ' + m.check.clause + (m.partial?.length ? ' · ' + t('frame.des.partial', { why: t('frame.rc.why.' + m.partial[0]) }) : '')),
        ui.td(m.status === 'not-checked' ? '' : (m.sets.find((q) => q.set === m.set)?.name || '')));
    }), { 'data-fa-rc-table': '' }));
    void r;
    out.push(ui.note(t('frame.des.signs')));
    return el('div', { className: C.block + ' fa-concrete', 'data-fa-concrete': '' }, ...out);
  }

  function seismicBlock() {
    const c = conc(), s = c.seismic;
    const sv = (key, v) => edit(t('frame.eq.undo'), (q) => { q.seismic[key] = v; });
    const par = (key, label) => ui.field(label, num(s[key], (v) => sv(key, v), { 'data-fa-eq': key }));
    const out = [ui.head(t('frame.eq.h'), ui.btn(t('frame.eq.find'), () => {
        const r = ui.result();
        if (!r || r.error || ui.stale()) ui.run();
        const rr = ui.result();
        if (!rr || rr.error) return;
        const found = suggestFloors(rr.frame.model);
        if (!found.length) { host.print(t('frame.eq.none-found')); return; }
        edit(t('frame.eq.undo-floors'), (q) => { q.floors = found.map((f) => ({ ...f, w: q.floors.find((o) => Math.abs(o.z - f.z) < 1)?.w || 0 })); });
      }, { 'data-fa-eq-find': '' }), ui.btn(t('frame.eq.make'), makeSeismic, { 'data-fa-eq-make': '' })),
      el('p', { className: 'fa-aid', 'data-fa-eq-aid': '' }, t('frame.eq.aid'))];
    const floorRows = c.floors.map((f, i) => el('tr', {},
      el('td', {}, el('input', { type: 'text', className: C.input, value: f.name, 'aria-label': t('frame.eq.floor'), onchange: (e) => edit(t('frame.eq.undo-floors'), (q) => { q.floors[i].name = e.target.value; }) })),
      el('td', {}, lenIn(f.z, (v) => edit(t('frame.eq.undo-floors'), (q) => { q.floors[i].z = v; }), { 'data-fa-eq-floor': f.id + ':z', 'aria-label': zHead() })),
      el('td', {}, num(f.w, (v) => edit(t('frame.eq.undo-floors'), (q) => { q.floors[i].w = v; }), { 'data-fa-eq-floor': f.id + ':w', 'aria-label': 'w (kN)' })),
      el('td', {}, ui.link(t('frame.ui.remove'), () => edit(t('frame.eq.undo-floors'), (q) => { q.floors.splice(i, 1); })))));
    out.push(c.floors.length ? ui.table([t('frame.eq.floor'), zHead(), t('frame.eq.weight'), ''], [1, 2], floorRows, { 'data-fa-eq-floors': '' }) : ui.note(t('frame.eq.no-floors')));
    out.push(ui.btn(t('frame.eq.add-floor'), () => edit(t('frame.eq.undo-floors'), (q) => { let k = q.floors.length + 1; while (q.floors.some((f) => f.id === 'F' + k)) k++; q.floors.push({ id: 'F' + k, name: 'F' + k, z: (q.floors.at(-1)?.z || 0) + 3500, w: 0 }); }), { 'data-fa-eq-add': '' }));
    const a0 = ui.current();
    out.push(el('div', { className: 'fa-row', 'data-fa-eq-wcases': '' }, el('span', { className: 'fa-lead' }, t('frame.eq.weights-from')),
      ...a0.cases.filter((q) => q.kind !== 'seismic').map((q) => ui.field(q.name, num(c.wcases[q.id] ?? (q.kind === 'dead' ? 1 : 0), (v) => edit(t('frame.eq.undo-floors'), (x) => { x.wcases[q.id] = v; }), { 'data-fa-eq-wcase': q.id }))),
      ui.btn(t('frame.eq.weights-take'), takeWeights, { 'data-fa-eq-weights': '' })));
    out.push(ui.note(t('frame.eq.floors-note')));
    out.push(el('div', { className: 'fa-row' }, par('SDS', 'SDS (g)'), par('SD1', 'SD1 (g)'), par('S1', 'S1 (g)'), par('R', 'R'), par('Ie', 'Ie'), par('Cd', 'Cd'), par('TL', 'TL (s)')));
    out.push(el('div', { className: 'fa-row' },
      ui.field(t('frame.eq.system'), ui.sel(s.system, SYSTEMS.map((v) => [v, t('frame.eq.sys-' + v)]), (v) => sv('system', v), { 'data-fa-eq': 'system' })),
      ui.field(t('frame.eq.f-risk'), ui.sel(s.risk, RISKS.map((v) => [v, v]), (v) => sv('risk', v), { 'data-fa-eq': 'risk' })),
      ui.field(t('frame.eq.f-dir'), ui.sel(s.dir, [['both', t('frame.eq.dir-both')], ['X', 'X'], ['Y', 'Y']], (v) => sv('dir', v), { 'data-fa-eq': 'dir' }))));
    out.push(el('div', { className: 'fa-row', 'data-fa-eq-period': '' },
      ui.field(t('frame.eq.period-use'), el('input', { type: 'checkbox', checked: !!s.useT, 'data-fa-eq': 'useT', onchange: (e) => sv('useT', e.target.checked) })),
      ui.btn(t('frame.eq.period-take'), takePeriod, { 'data-fa-eq-period-take': '' }),
      s.Tx || s.Ty ? el('span', { className: 'fa-lead', 'data-fa-eq-period-read': '' }, t('frame.eq.period-readout', { Tx: s.Tx ? f1(s.Tx, 3) : '–', Ty: s.Ty ? f1(s.Ty, 3) : '–', when: s.useT ? t('frame.eq.period-on') : t('frame.eq.period-off') })) : null));
    const r = ui.result();
    if (r && !r.error && !ui.stale() && r.frame.model.diaphragms?.length) {
      const made = seismicCases(r.frame, c);
      if (made.ok) {
        const E = made.elf;
        out.push(ui.note(t('frame.eq.summary', { Ta: f1(E.Ta, 3), T: f1(E.T, 3), Cs: f1(E.Cs, 4), eq: E.csEq, W: f1(E.W / 1000, 0), V: f1(E.V / 1000, 1), k: f1(E.k, 2) }), { 'data-fa-eq-summary': '' }));
        out.push(ui.table([t('frame.eq.floor'), zHead(), 'w (kN)', 'Fx (kN)', 'Vx (kN)'], [1, 2, 3, 4], E.levels.map((l) => el('tr', {}, ui.td(l.id), ui.td(L ? L.num(l.hx) : f1(l.hx, 0), 1), ui.td(f1(l.w / 1000), 1), ui.td(f1(l.Fx / 1000), 1), ui.td(f1(l.Vx / 1000), 1))), { 'data-fa-eq-forces': '' }));
      } else if (made.error !== 'no-floors') out.push(ui.note(t('frame.eq.err.' + made.error)));
      const dr = driftNow();
      // i18n-ignore: symbols and units
      if (dr.length) out.push(ui.table([t('frame.eq.floor'), t('frame.des.set'), smallHead('δxe'), smallHead('Cd δxe/Ie'), L ? t('frame.eq.allowed-u', { u: L.smallMark() }) : t('frame.eq.allowed'), t('frame.des.util')], [2, 3, 4, 5], dr.map((d) => {
        const rgb = utilRamp(d.ratio).map((v) => Math.round(v * 255)).join(',');
        return el('tr', { 'data-fa-eq-drift': d.ratio > 1 ? 'fail' : 'ok' }, ui.td(d.name), ui.td(d.setName), ui.td(L ? L.small(d.elastic) : f1(d.elastic, 2), 1), ui.td(L ? L.small(d.design) : f1(d.design, 2), 1), ui.td(L ? L.small(d.allowed) : f1(d.allowed, 1), 1), el('td', { className: 'n' }, el('span', { className: 'fa-util', style: '--fa-util:rgb(' + rgb + ')' }, pct(d.ratio))));
      }), { 'data-fa-eq-drift-table': '' }));
    }
    out.push(ui.note(t('frame.eq.assume-note')));
    return el('div', { className: C.block + ' fa-seismic', 'data-fa-seismic': '' }, ...out);
  }

  // ---- slab design from the plates' moments (0.8 round 3) ----
  function designSlab() {
    const c = conc();
    if (!ui.result() || ui.result().error || ui.stale()) ui.run();
    const r = ui.result();
    if (!r || r.error) return;
    const res = slabDesign(r.frame.model, r.sol, c.slab || cleanSlab({}));
    slabRes = { version: ui.version(), res };
    if (!res.ok) host.print(t('frame.slab.err.' + res.error)); else host.print(t('frame.slab.done', { n: res.plates, combos: res.combos, util: pct(res.util) }));
    publish();
    ui.rerender();
  }
  function slabBlock() {
    const r = ui.result();
    if (!r || r.error || !r.frame.model.plates?.length) return null;
    const c = conc(), sl = c.slab || cleanSlab({}), res = slabNow();
    const set = (fn) => edit(t('frame.slab.undo'), (q) => { q.slab = cleanSlab(q.slab) || cleanSlab({}); fn(q.slab); });
    const barRow = (key, label) => ui.field(label, el('span', { className: 'fa-inline' }, num(sl[key].d, (v) => set((q) => { q[key].d = v; }), { 'data-fa-slab': key + ':d', 'aria-label': label + ' ⌀' }), el('span', {}, ' @ '), num(sl[key].s, (v) => set((q) => { q[key].s = v; }), { 'data-fa-slab': key + ':s', 'aria-label': label + ' s' })));
    const out = [ui.head(t('frame.slab.title'), ui.btn(t('frame.slab.design'), designSlab, { 'data-fa-slab-design': '' })), el('p', { className: 'fa-aid' }, t('frame.slab.aid'))];
    out.push(el('div', { className: 'fa-row' }, ui.field('h (mm)', num(sl.h || Math.max(...r.frame.model.plates.map((p) => p.t)), (v) => set((q) => { q.h = v; }), { 'data-fa-slab': 'h' })), ui.field(t('frame.slab.cover'), num(sl.cover, (v) => set((q) => { q.cover = v; }), { 'data-fa-slab': 'cover' }))));
    out.push(el('div', { className: 'fa-row' }, barRow('bottomX', t('frame.slab.l.bx')), barRow('bottomY', t('frame.slab.l.by')), barRow('topX', t('frame.slab.l.tx')), barRow('topY', t('frame.slab.l.ty'))));
    if (res) {
      out.push(ui.table([t('frame.slab.layer'), 'Mu (kN·m/m)', t('frame.slab.need'), t('frame.slab.prov'), t('frame.des.util'), t('frame.slab.where')], [1, 2, 3, 4], res.rows.map((x) => el('tr', { 'data-fa-slab-row': x.key + ':' + (x.ratio > 1 ? 'fail' : 'ok') }, ui.td(t('frame.slab.l.' + x.key)), ui.td(f1(x.Mu, 1), 1), ui.td(f1(x.need, 0), 1), ui.td(f1(x.prov, 0), 1), ui.td(pct(x.ratio), 1), ui.td(x.plate + ' · ' + x.set)))
        .concat(res.checks.map((x) => el('tr', { 'data-fa-slab-row': 'shear:' + (x.ratio > 1 ? 'fail' : 'ok') }, ui.td(t('frame.slab.shear')), ui.td(''), ui.td(f1(x.demand / 1000, 1) + ' kN/m', 1), ui.td(f1(x.capacity / 1000, 1) + ' kN/m', 1), ui.td(pct(x.ratio), 1), ui.td(x.plate + ' · ' + x.set)))), { 'data-fa-slab-table': '' }));
    }
    out.push(ui.note(t('frame.slab.limits')));
    return el('div', { className: C.block + ' fa-slab', 'data-fa-slab-block': '' }, ...out);
  }

  return {
    blocks: () => [concreteBlock(), seismicBlock(), slabBlock()].filter(Boolean),
    check, makeSeismic, makeCombos,
    get rc() { return rcNow(); },
    clear() { rc = null; slabRes = null; publish(); },
    problems, publish,
    tables() {
      const r = ui.result();
      if (!r || r.error || ui.stale()) return [];
      const c = conc();
      const made = r.frame.model.diaphragms?.length ? seismicCases(r.frame, c) : null;
      return concreteTables({ rc: rcNow(), elf: made?.ok ? made.elf : null, drift: driftNow(), concrete: c, slab: slabNow() }, t);
    },
  };
}
