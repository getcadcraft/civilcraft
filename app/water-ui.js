/* SPDX-License-Identifier: Apache-2.0 */
/**
 * water-ui.js — water mains in CivilCraft (0.8 LC.16 W1 + W2, session `civil-extra-08`): the Water mains window (Surface › More ›
 * Water mains…), the tools that put junctions, reservoirs, tanks, pipes, pumps and pressure reducing valves on the plan, a node's
 * and a link's Properties, pressures drawn on the plan, fire flow, an extended-period run, and EPANET-format text in and out.
 * The numbers are water.js (DOM-free, bin/test-civilcraft-water.mjs). Every change is one undo step (state.water). A calculation
 * aid: every result window says an engineer checks it.
 *
 *   createWater(ctx) → { ownsTool(t), hints, command(c) → handled, click(tool, w, s) → handled, block(), isMine(sel),
 *                        props(sel, box, head) → shown, remove(sel) → removed, pick(w, tol) → sel | null, overlay(c2d, S, C, sel),
 *                        results(), issues(), model() }
 *   ctx = { root, el, project, units, numInput, row, say, select(sel), selection(), setTool(name), refresh(), redraw(), download(name, blob),
 *           fileStem(), groundAt(x, y) → z | null, tol() → world units for a click }
 */

import { t } from './i18n.js';
import { cleanWater, emptyWater, solve, fireFlow, extended, writeInp, readInp, defaults } from './water.js';
import { fixed } from './units.js';
import { LAYERS } from './scene.js';
import { layout, schedule, scheduleCsv, sceneItems as objectItems, LAYER_DEFS, FITTING_KINDS } from './water-objects.js';   // 0.8 CV.2 (civil_PART_3): hydrants, valves, fittings, the plan layers

for (const [name, key, aci] of LAYER_DEFS) { if (!LAYERS.some((l) => l.name === name)) LAYERS.push({ name, token: 'blue', aci, get label() { return t(key); } }); }   // 0.8 CV.2

const TOOLS = ['wm-junction', 'wm-reservoir', 'wm-tank', 'wm-pipe', 'wm-pump', 'wm-prv'];
const NODE_TOOLS = { 'wm-junction': 'junction', 'wm-reservoir': 'reservoir', 'wm-tank': 'tank' };
const LINK_TOOLS = { 'wm-pipe': 'pipe', 'wm-pump': 'pump', 'wm-prv': 'prv' };

export function createWater(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const M = () => U() === 'm';
  const W = () => P().state.water || emptyWater(U());
  const edit = (label, fn) => P().change(label, (st) => { if (!st.water) st.water = emptyWater(U()); fn(st.water, st); });
  const findNode = (id) => W().nodes.find((n) => n.id === id);
  const findLink = (id) => W().pipes.find((p) => p.id === id);
  const unit = { len: () => (M() ? 'm' : 'ft'), dia: () => (M() ? 'mm' : 'in'), q: () => (M() ? 'L/s' : 'gpm'), p: () => (M() ? 'kPa' : 'psi') };   // i18n-ignore: unit symbols
  const fx = (v, d = 1) => (Number.isFinite(v) ? fixed(v, d) : '–');
  let showP = true, pending = null, dlg = null;   // show pressures on the plan; the first node of a link being drawn

  // ---- results (cached by the project's version)
  let memo = null;
  function results() {
    const w = W();
    if (!w.nodes.length || !w.pipes.length) return null;
    if (memo && memo.project === P() && memo.v === P().version && memo.u === U()) return memo.r;
    const r = solve(w, U());
    memo = { project: P(), v: P().version, u: U(), r };
    return r;
  }
  const issues = () => {
    const r = results();
    return r ? r.problems.map((p) => ({ ...p, text: t('wm.issue.' + p.code, { id: nodeName(p.id), value: fx(p.value, 1), limit: fx(p.limit, 1), n: p.iterations ?? '', u: p.code === 'fast' ? (M() ? 'm/s' : 'ft/s') : unit.p() }) })) : [];
  };
  const nodeName = (id) => { const n = findNode(id) || findLink(id); return n ? (n.name || n.id) : id; };

  // ---- tools
  const TOOL_LIST = [['wm-junction', 'circle', 'wm.tool.junction'], ['wm-reservoir', 'water', 'wm.tool.reservoir'], ['wm-tank', 'box', 'wm.tool.tank'],
    ['wm-pipe', 'slash-lg', 'wm.tool.pipe'], ['wm-pump', 'arrow-repeat', 'wm.tool.pump'], ['wm-prv', 'funnel', 'wm.tool.prv']];
  const nearestNode = (w) => {
    const tol = ctx.tol();
    let best = null, bd = tol;
    for (const n of W().nodes) { const d = Math.hypot(n.x - w.x, n.y - w.y); if (d <= bd) { bd = d; best = n; } }
    return best;
  };
  function click(tool, w) {
    if (NODE_TOOLS[tool]) {
      const kind = NODE_TOOLS[tool];
      if (nearestNode(w)) { ctx.say(t('wm.node.there')); return true; }
      const id = P().nextId('wm'), z = ctx.groundAt(w.x, w.y);
      edit(t('wm.undo.add.' + kind), (wm) => {
        const n = { id, name: '', x: w.x, y: w.y, z: z == null ? null : Math.round(z * 100) / 100, demand: 0, kind };
        if (kind === 'reservoir') n.head = z == null ? null : Math.round(z * 100) / 100 + (M() ? 30 : 100);
        if (kind === 'tank') Object.assign(n, { level: M() ? 3 : 10, minLevel: 0, maxLevel: M() ? 6 : 20, diameter: M() ? 10 : 30 });
        wm.nodes.push(n);
      });
      ctx.select({ kind: 'wnode', id });
      return true;
    }
    if (LINK_TOOLS[tool]) {
      const n = nearestNode(w);
      if (!n) { ctx.say(t('wm.link.pick')); return true; }
      if (!pending) { pending = n.id; ctx.say(t('wm.link.second', { name: n.name || n.id })); ctx.redraw(); return true; }
      if (pending === n.id) { pending = null; ctx.redraw(); return true; }
      const kind = LINK_TOOLS[tool], a = pending, b = n.id;
      pending = null;
      const id = P().nextId('wm');
      edit(t('wm.undo.add.' + kind), (wm) => {
        const p = { id, name: '', a, b, kind, status: 'open' };
        if (kind === 'pipe') Object.assign(p, { length: null, d: M() ? 200 : 8, c: null, minor: 0, check: false });
        if (kind === 'pump') Object.assign(p, { curve: [[M() ? 10 : 150, M() ? 30 : 100]], pattern: [] });
        if (kind === 'prv') Object.assign(p, { d: M() ? 150 : 6, setting: M() ? 300 : 50, minor: 0 });
        wm.pipes.push(p);
      });
      ctx.select({ kind: 'wpipe', id });
      return true;
    }
    return false;
  }

  // ---- Properties
  const isMine = (sel) => sel?.kind === 'wnode' || sel?.kind === 'wpipe';
  function numRow(label, value, set, id, u, { blank = false, min = null } = {}) {
    const inp = ctx.numInput(value == null ? '' : String(value), (s) => {
      s = String(s).trim();
      if (s === '') { if (!blank) return false; set(null); return true; }
      const x = Number(s);
      if (!Number.isFinite(x) || (min != null && x < min)) return false;
      set(x); return true;
    }, { label, id, width: '6rem', calc: true });
    return ctx.row(label + (u ? ` (${u})` : ''), inp, id);
  }
  const txtRow = (label, value, set, id) => {
    const i = el('input', { type: 'text', className: 'cv-input', id, value: value || '', maxLength: 80 });
    i.addEventListener('change', () => set(i.value.slice(0, 80)));
    return ctx.row(label, i, id);
  };

  function props(sel, box, head) {
    const r = results();
    const out = [el('p', { className: 'cv-note', 'data-wm-review': '' }, t('wm.review'))];
    if (sel.kind === 'wnode') {
      const n = findNode(sel.id);
      if (!n) return false;
      head.textContent = t('wm.props.node.' + n.kind);
      const id = n.id, set = (k, label) => (x) => edit(label || t('wm.undo.set'), (wm) => { const q = wm.nodes.find((o) => o.id === id); if (q) q[k] = x; });
      const rows = [...txtRow(t('wm.name'), n.name, (v) => set('name')(v), 'cv-wm-name'),
        ...numRow(t('wm.x'), n.x, (v) => set('x', t('wm.undo.move'))(v), 'cv-wm-x', unit.len(), {}),
        ...numRow(t('wm.y'), n.y, (v) => set('y', t('wm.undo.move'))(v), 'cv-wm-y', unit.len(), {}),
        ...numRow(t('wm.elev'), n.z, set('z'), 'cv-wm-z', unit.len(), { blank: true })];
      if (n.kind === 'junction') rows.push(...numRow(t('wm.demand'), n.demand, set('demand'), 'cv-wm-demand', unit.q(), { min: 0 }), ...hydrantRow(n));
      if (n.kind === 'reservoir') rows.push(...numRow(t('wm.headfield'), n.head, set('head'), 'cv-wm-head', unit.len(), { blank: true }));
      if (n.kind === 'tank') rows.push(...numRow(t('wm.level'), n.level, set('level'), 'cv-wm-level', unit.len(), { min: 0 }), ...numRow(t('wm.minlevel'), n.minLevel, set('minLevel'), 'cv-wm-minl', unit.len(), { min: 0 }),
        ...numRow(t('wm.maxlevel'), n.maxLevel, set('maxLevel'), 'cv-wm-maxl', unit.len(), { min: 0 }), ...numRow(t('wm.tankdia'), n.diameter, set('diameter'), 'cv-wm-tdia', unit.len(), { min: 0.01 }));
      out.push(el('div', { className: 'cv-props', 'data-wm-props': '' }, ...rows));
      const res = r?.nodes.get(id);
      if (res) out.push(el('div', { className: 'cv-props', 'data-wm-node-results': '' },
        ...ctx.row(t('wm.r.head', { u: unit.len() }), fx(res.head, 1)), ...(res.pressure != null ? ctx.row(t('wm.r.pressure', { u: unit.p() }), fx(res.pressure, 1)) : []),
        ...(res.inflow != null ? ctx.row(t('wm.r.inflow', { u: unit.q() }), fx(res.inflow, 1)) : [])));
      out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => { if (remove(sel)) { ctx.select(null); } } }, t('wm.delete'))));
    } else {
      const p = findLink(sel.id);
      if (!p) return false;
      head.textContent = t('wm.props.link.' + p.kind);
      const id = p.id, set = (k, label) => (x) => edit(label || t('wm.undo.set'), (wm) => { const q = wm.pipes.find((o) => o.id === id); if (q) q[k] = x; });
      const a = findNode(p.a), b = findNode(p.b);
      const rows = [...txtRow(t('wm.name'), p.name, (v) => set('name')(v), 'cv-wm-name'), ...ctx.row(t('wm.from'), a?.name || p.a), ...ctx.row(t('wm.to'), b?.name || p.b)];
      const planLen = a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
      if (p.kind !== 'pump') rows.push(...numRow(t('wm.diameter'), p.d, set('d'), 'cv-wm-d', unit.dia(), { min: 0.001 }));
      if (p.kind === 'pipe') {
        rows.push(...numRow(t('wm.length'), p.length, set('length'), 'cv-wm-len', unit.len(), { blank: true, min: 0.001 }), ...ctx.row(t('wm.planlen'), fx(planLen, 1)),
          ...numRow(t('wm.c'), p.c, set('c'), 'cv-wm-c', '', { blank: true, min: 1 }));
      }
      if (p.kind !== 'pump') rows.push(...numRow(t('wm.minor'), p.minor, set('minor'), 'cv-wm-minor', 'K', { min: 0 }));
      if (p.kind === 'prv') rows.push(...numRow(t('wm.setting'), p.setting, set('setting'), 'cv-wm-set', unit.p(), { min: 0 }));
      if (p.kind === 'pump') {
        const c = p.curve?.[0];
        rows.push(...numRow(t('wm.pump.q'), c?.[0], (v) => edit(t('wm.undo.set'), (wm) => { const q = wm.pipes.find((o) => o.id === id); if (q) q.curve = [[v, q.curve?.[0]?.[1] ?? 1]]; }), 'cv-wm-pq', unit.q(), { min: 0.0001 }),
          ...numRow(t('wm.pump.h'), c?.[1], (v) => edit(t('wm.undo.set'), (wm) => { const q = wm.pipes.find((o) => o.id === id); if (q) q.curve = [[q.curve?.[0]?.[0] ?? 1, v]]; }), 'cv-wm-ph', unit.len(), { min: 0.0001 }));
        out.push(el('p', { className: 'cv-note' }, t('wm.pump.note')));
      }
      const status = el('select', { className: 'cv-select', id: 'cv-wm-status' }, el('option', { value: 'open' }, t('wm.status.open')), el('option', { value: 'closed' }, t('wm.status.closed')));
      status.value = p.status === 'closed' ? 'closed' : 'open';
      status.addEventListener('change', () => set('status')(status.value));
      rows.push(...ctx.row(t('wm.status'), status, 'cv-wm-status'));
      if (p.kind === 'pipe') {
        const ck = el('input', { type: 'checkbox', id: 'cv-wm-check', checked: p.check === true });
        ck.addEventListener('change', () => set('check')(ck.checked));
        rows.push(...ctx.row(t('wm.check'), ck, 'cv-wm-check'));
      }
      out.push(el('div', { className: 'cv-props', 'data-wm-props': '' }, ...rows));
      if (p.kind === 'pipe') out.push(valveBlock(p));
      const res = r?.pipes.get(id);
      if (res) out.push(el('div', { className: 'cv-props', 'data-wm-link-results': '' }, ...ctx.row(t('wm.r.flow', { u: unit.q() }), fx(res.q, 1)),
        ...(res.v != null ? ctx.row(t('wm.r.vel', { u: M() ? 'm/s' : 'ft/s' }), fx(res.v, 2)) : []), ...(res.hl1000 != null ? ctx.row(t('wm.r.hl', { u: M() ? 'm/km' : 'ft/1000 ft' }), fx(res.hl1000, 2)) : []),
        ...ctx.row(t('wm.status'), t('wm.state.' + res.status))));
      out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => { if (remove(sel)) ctx.select(null); } }, t('wm.delete'))));
    }
    box.replaceChildren(...out);
    return true;
  }

  /** Fittings whose node or pipe is gone go with it. */
  const dropFittings = (wm) => { if (!wm.fittings) return; const n = new Set(wm.nodes.map((x) => x.id)), p = new Set(wm.pipes.map((x) => x.id)); wm.fittings = wm.fittings.filter((f) => (f.host.node ? n.has(f.host.node) : p.has(f.host.pipe))); if (!wm.fittings.length) delete wm.fittings; };
  // ---- 0.8 CV.2: hydrants and valves as objects (water-objects.js)
  const fittingsOn = (host) => (W().fittings || []).filter((f) => (host.node ? f.host.node === host.node : f.host.pipe === host.pipe));
  const addFitting = (kind, host, label) => edit(label, (wm) => { (wm.fittings ||= []).push({ id: P().nextId('wf'), kind, host, name: '', note: '' }); });
  const delFitting = (id) => edit(t('wm.fit.undo.del'), (wm) => { wm.fittings = (wm.fittings || []).filter((f) => f.id !== id); if (!wm.fittings.length) delete wm.fittings; });
  function hydrantRow(n) {
    const have = fittingsOn({ node: n.id }).find((f) => f.kind === 'hydrant');
    const ck = el('input', { type: 'checkbox', id: 'cv-wm-hydrant', checked: !!have, 'data-wm-hydrant': '' });
    ck.addEventListener('change', () => { if (ck.checked && !have) addFitting('hydrant', { node: n.id }, t('wm.fit.undo.add', { what: t('wm.fit.hydrant') })); else if (!ck.checked && have) delFitting(have.id); });
    return ctx.row(t('wm.fit.hydrant'), ck, 'cv-wm-hydrant');
  }
  function valveBlock(p) {
    const here = fittingsOn({ pipe: p.id }), kind = el('select', { className: 'cv-select', 'data-wm-fit-kind': '' }, ...FITTING_KINDS.filter((k) => k !== 'hydrant').map((k) => el('option', { value: k }, t('wm.fit.' + k))));
    return el('div', { className: 'cv-props', 'data-wm-valves': '' }, el('span', { className: 'k' }, t('wm.fit.on')),
      el('span', { className: 'v' }, ...here.map((f) => el('span', { className: 'cv-chip', 'data-wm-fit': f.id }, t('wm.fit.' + f.kind) + ' ', el('button', { type: 'button', className: 'cv-x', 'aria-label': t('wm.delete'), onclick: () => delFitting(f.id) }, '×'))), here.length ? ' ' : '', kind, ' ',
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-wm-fit-add': '', onclick: () => addFitting(kind.value, { pipe: p.id, t: 0.5 }, t('wm.fit.undo.add', { what: t('wm.fit.' + kind.value) })) }, t('wm.fit.add'))));
  }
  const groundFn = () => (x, y) => { const z = ctx.groundAt?.(x, y); return Number.isFinite(z) ? z : null; };
  /** The plan's own layers for the PDF and the DWG/DXF (pipes with their sizes, hydrants, valves, fittings). */
  const sceneItems = (mmPerUnit = 1) => objectItems(W(), U(), { mmPerUnit, zAt: groundFn(), words: (k) => t(k) });
  const objects = () => layout(W(), U(), { zAt: groundFn() });
  const scheduleOf = () => { const o = objects(); return schedule(o.fixtures, o.pipes, U()); };

  function remove(sel) {
    if (!isMine(sel)) return false;
    if (sel.kind === 'wnode') { if (!findNode(sel.id)) return false; edit(t('wm.undo.del'), (wm) => { wm.nodes = wm.nodes.filter((n) => n.id !== sel.id); wm.pipes = wm.pipes.filter((p) => p.a !== sel.id && p.b !== sel.id); dropFittings(wm); }); return true; }
    if (!findLink(sel.id)) return false;
    edit(t('wm.undo.del'), (wm) => { wm.pipes = wm.pipes.filter((p) => p.id !== sel.id); dropFittings(wm); });
    return true;
  }

  function pick(w, tol) {
    const wm = W();
    let best = null, bd = tol;
    for (const n of wm.nodes) { const d = Math.hypot(n.x - w.x, n.y - w.y); if (d <= bd) { bd = d; best = { kind: 'wnode', id: n.id }; } }
    if (best) return best;
    const byId = new Map(wm.nodes.map((n) => [n.id, n]));
    for (const p of wm.pipes) {
      const a = byId.get(p.a), b = byId.get(p.b);
      if (!a || !b) continue;
      const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
      const u = L2 ? Math.max(0, Math.min(1, ((w.x - a.x) * dx + (w.y - a.y) * dy) / L2)) : 0;
      const d = Math.hypot(a.x + u * dx - w.x, a.y + u * dy - w.y);
      if (d <= bd) { bd = d; best = { kind: 'wpipe', id: p.id }; }
    }
    return best;
  }

  function overlay(c2d, S, C, sel) {
    const wm = W();
    if (!wm.nodes.length) return;
    const r = results(), s = wm.settings;
    const byId = new Map(wm.nodes.map((n) => [n.id, n]));
    c2d.save();
    c2d.font = '11px sans-serif';
    for (const p of wm.pipes) {
      const a = byId.get(p.a), b = byId.get(p.b);
      if (!a || !b) continue;
      const on = sel?.kind === 'wpipe' && sel.id === p.id, q = S(a.x, a.y), z = S(b.x, b.y);
      const res = r?.pipes.get(p.id);
      c2d.strokeStyle = on ? C.action : (res && res.v != null && res.v > s.vMax ? '#c0392b' : (C.blue || C.action));
      c2d.lineWidth = on ? 3.5 : p.kind === 'pipe' ? 2 : 3;
      c2d.setLineDash(p.status === 'closed' || res?.status === 'closed' ? [6, 4] : p.kind === 'prv' ? [2, 3] : []);
      c2d.beginPath(); c2d.moveTo(q.x, q.y); c2d.lineTo(z.x, z.y); c2d.stroke();
      c2d.setLineDash([]);
      const mx = (q.x + z.x) / 2, my = (q.y + z.y) / 2;
      if (p.kind !== 'pipe') { c2d.fillStyle = on ? C.action : (C.blue || C.action); c2d.beginPath(); c2d.arc(mx, my, 5, 0, 6.2832); c2d.fill(); c2d.fillStyle = C.sheet || '#fff'; c2d.fillText(p.kind === 'pump' ? 'P' : 'V', mx - 3.5, my + 4); }
      if (res && res.q != null && Math.abs(res.q) > 1e-9) {   // flow arrow at the middle
        const f = res.q > 0 ? 1 : -1, ang = Math.atan2(z.y - q.y, z.x - q.x) + (f < 0 ? Math.PI : 0), ox = mx + 9 * Math.cos(ang), oy = my + 9 * Math.sin(ang);
        c2d.fillStyle = c2d.strokeStyle; c2d.beginPath(); c2d.moveTo(ox + 6 * Math.cos(ang), oy + 6 * Math.sin(ang)); c2d.lineTo(ox + 6 * Math.cos(ang + 2.5), oy + 6 * Math.sin(ang + 2.5)); c2d.lineTo(ox + 6 * Math.cos(ang - 2.5), oy + 6 * Math.sin(ang - 2.5)); c2d.closePath(); c2d.fill();
      }
    }
    for (const n of wm.nodes) {
      const q = S(n.x, n.y), on = sel?.kind === 'wnode' && sel.id === n.id, res = r?.nodes.get(n.id);
      let col = C.blue || C.action;
      if (showP && n.kind === 'junction' && res?.pressure != null) col = res.pressure < s.minP ? '#c0392b' : res.pressure > s.maxP ? '#d98a00' : '#2e8b57';
      if (showP && n.kind === 'junction' && res && res.head == null) col = '#7f8c8d';
      c2d.fillStyle = col; c2d.strokeStyle = on ? C.action : (C.ink || '#000'); c2d.lineWidth = on ? 2.5 : 1;
      c2d.beginPath();
      if (n.kind === 'reservoir') c2d.rect(q.x - 7, q.y - 7, 14, 14);
      else if (n.kind === 'tank') { c2d.moveTo(q.x, q.y - 8); c2d.lineTo(q.x + 8, q.y + 6); c2d.lineTo(q.x - 8, q.y + 6); c2d.closePath(); }
      else c2d.arc(q.x, q.y, on ? 6 : 5, 0, 6.2832);
      c2d.fill(); c2d.stroke();
      c2d.fillStyle = C.ink2 || C.ink || '#000';
      const label = (n.name || n.id) + (showP && res?.pressure != null ? '  ' + fx(res.pressure, 0) : '');
      if (wm.nodes.length <= 400 || on) c2d.fillText(label, q.x + 8, q.y - 7);
    }
    if (pending) { const a = byId.get(pending); if (a) { const q = S(a.x, a.y); c2d.strokeStyle = C.action; c2d.lineWidth = 2; c2d.beginPath(); c2d.arc(q.x, q.y, 10, 0, 6.2832); c2d.stroke(); } }
    c2d.restore();
  }

  // ---- Properties block
  function block() {
    const wm = W();
    if (!wm.nodes.length) return [];
    const r = results(), bad = r ? r.problems.length : 0;
    return [el('h3', { className: 'cv-h3', 'data-wm-head': '' }, t('wm.head')),
      el('p', { className: 'cv-note' }, t('wm.summary', { nodes: wm.nodes.length, pipes: wm.pipes.length, problems: bad })),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-wm-open': '', onclick: () => openWindow() }, t('wm.open'))];
  }

  // ---- the window
  function table(head, rows, attr) {
    return el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', [attr]: '' },
      el('thead', {}, el('tr', {}, ...head.map((h) => el('th', { scope: 'col' }, h)))),
      el('tbody', {}, ...rows.map((row) => el('tr', {}, ...row.map((v, i) => el(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row' } : { className: 'num' }, v)))))));
  }
  const csvOf = (head, rows) => [head, ...rows].map((r) => r.map((v) => { const s = String(v ?? ''); const f = /^[=+\-@]/.test(s) ? "'" + s : s; return /[",\n;]/.test(f) ? '"' + f.replace(/"/g, '""') + '"' : f; }).join(',')).join('\r\n');
  const nodeRows = (r) => W().nodes.map((n) => { const x = r?.nodes.get(n.id); return [n.name || n.id, t('wm.kind.' + n.kind), fx(n.z, 1), n.kind === 'junction' ? fx(n.demand, 1) : '', fx(x?.head, 1), x?.pressure != null ? fx(x.pressure, 1) : '']; });
  const linkRows = (r) => W().pipes.map((p) => { const x = r?.pipes.get(p.id); return [p.name || p.id, t('wm.kind.' + p.kind), nodeName(p.a) + ' → ' + nodeName(p.b), p.d != null ? fx(p.d, 1) : '', fx(x?.q, 1), x?.v != null ? fx(x.v, 2) : '', x?.hl1000 != null ? fx(x.hl1000, 2) : '', t('wm.state.' + (x?.status || p.status))]; });
  const nodeHead = () => [t('wm.col.name'), t('wm.col.kind'), t('wm.col.elev', { u: unit.len() }), t('wm.col.demand', { u: unit.q() }), t('wm.col.head', { u: unit.len() }), t('wm.col.pressure', { u: unit.p() })];
  const linkHead = () => [t('wm.col.name'), t('wm.col.kind'), t('wm.col.route'), t('wm.col.dia', { u: unit.dia() }), t('wm.col.flow', { u: unit.q() }), t('wm.col.vel', { u: M() ? 'm/s' : 'ft/s' }), t('wm.col.hl', { u: M() ? 'm/km' : 'ft/1000 ft' }), t('wm.col.status')];

  function openWindow() {
    document.getElementById('cv-wm')?.remove();
    const body = el('div', { className: 'cv-dlg-body', 'data-wm-body': '' });
    const did = 'cv-wm';
    function draw() {
      const wm = W(), r = results(), s = wm.settings, d = defaults(U());
      const kids = [el('p', { className: 'cv-note' }, el('strong', {}, t('wm.review'))), el('p', { className: 'cv-note' }, t('wm.lead'))];
      kids.push(el('div', { className: 'cv-actions', 'data-wm-tools': '' }, ...TOOL_LIST.map(([tool, icon, key]) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-wm-tool': tool, onclick: () => { pending = null; ctx.setTool(tool); } }, el('i', { className: 'bi bi-' + icon, 'aria-hidden': 'true' }), ' ', t(key)))));   // i18n-ignore: icon class
      const set = (k, label) => (x) => edit(label || t('wm.undo.set'), (w2) => { w2.settings[k] = x; });
      kids.push(el('div', { className: 'cv-props', 'data-wm-settings': '' },
        ...numRow(t('wm.set.minp'), s.minP, set('minP'), 'cv-wm-minp', unit.p(), { min: 0.001 }), ...numRow(t('wm.set.maxp'), s.maxP, set('maxP'), 'cv-wm-maxp', unit.p(), { min: 0.001 }),
        ...numRow(t('wm.set.vmax'), s.vMax, set('vMax'), 'cv-wm-vmax', M() ? 'm/s' : 'ft/s', { min: 0.001 }), ...numRow(t('wm.set.c'), s.c, set('c'), 'cv-wm-defc', '', { min: 1 })));
      void d;
      if (!r) {
        kids.push(el('p', { className: 'cv-note', 'data-wm-none': '' }, t('wm.none')));
      } else {
        const probs = issues();
        kids.push(el('p', { className: 'cv-note', 'data-wm-state': '' }, r.ok ? t('wm.solved', { n: r.iterations, d: fx(r.totals.demand, 1), u: unit.q() }) : t('wm.notsolved')));
        if (probs.length) kids.push(el('ul', { className: 'cv-plainlist', 'data-wm-issues': '' }, ...probs.slice(0, 60).map((p) => el('li', {}, p.text))), probs.length > 60 ? el('p', { className: 'cv-note' }, t('wm.more', { n: probs.length - 60 })) : '');
        const showCk = el('input', { type: 'checkbox', id: did + '-show', checked: showP });
        showCk.addEventListener('change', () => { showP = showCk.checked; ctx.redraw(); });
        kids.push(el('div', { className: 'cv-row' }, showCk, el('label', { for: did + '-show' }, ' ' + t('wm.showp'))));
        kids.push(el('h3', { className: 'cv-h3' }, t('wm.h.nodes')), table(nodeHead(), nodeRows(r), 'data-wm-nodes'), el('h3', { className: 'cv-h3' }, t('wm.h.links')), table(linkHead(), linkRows(r), 'data-wm-links'));
      }
      const btn = (label, icon, fn, data) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', [data]: '', onclick: fn }, el('i', { className: 'bi bi-' + icon, 'aria-hidden': 'true' }), ' ', label);   // i18n-ignore: icon class
      const stem = () => (ctx.fileStem() || 'civilcraft') + '-water';
      kids.push(el('div', { className: 'cv-actions' },
        btn(t('wm.fire'), 'fire', () => fireWindow(), 'data-wm-fire'),
        btn(t('wm.eps'), 'clock-history', () => epsWindow(), 'data-wm-eps'),
        btn(t('wm.csv'), 'download', () => { if (!r) return; ctx.download(stem() + '-results.csv', new Blob(['﻿' + csvOf(nodeHead(), nodeRows(r)) + '\r\n\r\n' + csvOf(linkHead(), linkRows(r))], { type: 'text/csv' })); ctx.say(t('wm.saved')); }, 'data-wm-csv'),
        btn(t('wm.sch'), 'list-check', () => { ctx.download(stem() + '-schedule.csv', new Blob(['﻿' + scheduleCsv(scheduleOf(), U(), (k) => t(k))], { type: 'text/csv' })); ctx.say(t('wm.saved')); }, 'data-wm-schedule'),
        btn(t('wm.inp.out'), 'file-earmark-arrow-down', () => { ctx.download(stem() + '.inp', new Blob([writeInp(W(), U())], { type: 'text/plain' })); ctx.say(t('wm.saved')); }, 'data-wm-inp-out'),
        btn(t('wm.inp.in'), 'file-earmark-arrow-up', () => importInp(), 'data-wm-inp-in')));
      body.replaceChildren(...kids);
    }
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('wm.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    dlg = el('dialog', { className: 'cv-dialog cv-pcdlg cv-wmdlg', id: did, 'aria-labelledby': did + '-h', 'data-wm-dialog': '' },
      el('div', { className: 'cv-dlg' }, el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: did + '-h' }, t('wm.title')), close), body));
    close.onclick = () => dlg.close();
    dlg.addEventListener('close', () => { dlg.remove(); dlg = null; });
    ctx.root.append(dlg);
    dlg.redraw = draw;
    draw();
    dlg.show();   // not modal: the plan stays clickable for the tools
  }
  const refreshWindow = () => { if (dlg?.isConnected && dlg.redraw) dlg.redraw(); };

  function importInp() {
    const f = el('input', { type: 'file', accept: '.inp,.txt', className: 'visually-hidden', tabIndex: -1 });
    f.addEventListener('change', async () => {
      const file = f.files?.[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) { ctx.say(t('wm.inp.big')); return; }
      const r = readInp(await file.text(), U());
      if (!r.water) { ctx.say(t('wm.inp.bad', { why: r.notes.join(', ') })); return; }
      let w = r.water;
      if (r.units !== U()) { ctx.say(t('wm.inp.units', { have: r.units, want: U() })); return; }
      edit(t('wm.undo.import'), (cur) => { cur.nodes = w.nodes; cur.pipes = w.pipes; cur.settings = w.settings; });
      ctx.say(t('wm.inp.done', { nodes: w.nodes.length, pipes: w.pipes.length, notes: r.notes.length }));
      ctx.redraw();
    });
    f.click();
  }

  function fireWindow() {
    const wm = W(), js = wm.nodes.filter((n) => n.kind === 'junction');
    if (!js.length || !results()) { ctx.say(t('wm.none')); return; }
    document.getElementById('cv-wm-fire')?.remove();
    const sel = el('select', { className: 'cv-select', id: 'cv-wm-fire-node' }, ...js.map((n) => el('option', { value: n.id }, n.name || n.id)));
    const cur = ctx.selection();
    if (cur?.kind === 'wnode' && js.some((n) => n.id === cur.id)) sel.value = cur.id;
    const resid = el('input', { type: 'text', className: 'cv-input', id: 'cv-wm-fire-res', value: String(M() ? 140 : 20), size: 6 });
    const flow = el('input', { type: 'text', className: 'cv-input', id: 'cv-wm-fire-flow', value: String(M() ? 63 : 1000), size: 6 });
    const out = el('div', { 'data-wm-fire-out': '' });
    const run = () => {
      const rs = Number(resid.value), fl = Number(flow.value);
      if (!(rs > 0) || !(fl >= 0)) { out.replaceChildren(el('p', { className: 'cv-note' }, t('wm.fire.bad'))); return; }
      const f = fireFlow(wm, U(), sel.value, { flow: fl, residual: rs });
      if (f.error) { out.replaceChildren(el('p', { className: 'cv-note' }, t('wm.fire.bad'))); return; }
      out.replaceChildren(
        el('p', {}, t('wm.fire.atflow', { flow: fx(fl, 0), uq: unit.q(), p: fx(f.atFlow.nodePressure, 1), up: unit.p(), min: fx(f.atFlow.minPressure, 1), at: nodeName(f.atFlow.at) })),
        el('p', { className: 'cv-note', 'data-wm-fire-avail': '' }, f.available == null ? t('wm.fire.none', { p: fx(f.base, 1), up: unit.p(), r: fx(rs, 0) }) : t('wm.fire.avail', { flow: fx(f.available, 0), uq: unit.q(), r: fx(rs, 0), up: unit.p() })),
        el('p', { className: 'cv-note' }, t('wm.fire.note')));
    };
    const dlg2 = el('dialog', { className: 'cv-dialog cv-pcdlg', id: 'cv-wm-fire', 'data-wm-fire-dialog': '' }, el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h' }, t('wm.fire.title'))),
      el('div', { className: 'cv-dlg-body' }, el('p', { className: 'cv-note' }, t('wm.review')),
        ...ctx.row(t('wm.fire.node'), sel, 'cv-wm-fire-node'), ...ctx.row(t('wm.fire.res', { u: unit.p() }), resid, 'cv-wm-fire-res'), ...ctx.row(t('wm.fire.flow', { u: unit.q() }), flow, 'cv-wm-fire-flow'), out),
      el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-wm-fire-run': '', onclick: run }, t('wm.fire.run')), el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg2.close() }, t('wm.close')))));
    dlg2.addEventListener('close', () => dlg2.remove());
    ctx.root.append(dlg2); dlg2.showModal();
  }

  function epsWindow() {
    const wm = W();
    if (!results()) { ctx.say(t('wm.none')); return; }
    document.getElementById('cv-wm-eps')?.remove();
    const s = wm.settings, e = extended(wm, U(), {});
    const tanks = wm.nodes.filter((n) => n.kind === 'tank');
    const head = [t('wm.eps.time'), t('wm.eps.mult'), t('wm.eps.minp', { u: unit.p() }), ...tanks.map((n) => t('wm.eps.tank', { name: n.name || n.id, u: unit.len() }))];
    const rows = e.steps.map((st) => {
      let m = Infinity; for (const n of st.nodes.values()) if (n.pressure != null && n.pressure < m) m = n.pressure;
      return [fx(st.t / 3600, 1) + ' h', fx(st.mult, 2), Number.isFinite(m) ? fx(m, 1) : '–', ...tanks.map((n) => fx(st.tanks[n.id].level, 2))];
    });
    const dlg3 = el('dialog', { className: 'cv-dialog cv-pcdlg', id: 'cv-wm-eps', 'data-wm-eps-dialog': '' }, el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h' }, t('wm.eps.title'))),
      el('div', { className: 'cv-dlg-body' }, el('p', { className: 'cv-note' }, t('wm.review')), el('p', { className: 'cv-note' }, t('wm.eps.lead', { h: fx(s.duration, 0), step: fx(s.step / 3600, 2), n: s.pattern.length })),
        e.problems.length ? el('ul', { className: 'cv-plainlist', 'data-wm-eps-issues': '' }, ...e.problems.map((p) => el('li', {}, t('wm.issue.' + p.code, { id: nodeName(p.id), n: fx(p.t / 3600, 1) })))) : '', table(head, rows, 'data-wm-eps-table')),
      el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg3.close() }, t('wm.close')))));
    dlg3.addEventListener('close', () => dlg3.remove());
    ctx.root.append(dlg3); dlg3.showModal();
  }

  function command(c) {
    if (c === 'water') { openWindow(); return true; }
    return false;
  }

  return {
    ownsTool: (tl) => TOOLS.includes(tl),
    hints: Object.fromEntries(TOOLS.map((k) => [k, 'wm.hint.' + k.slice(3)])),
    command, click, block, isMine, props, remove, pick, overlay, results, issues, refreshWindow, openWindow, sceneItems, objects, scheduleOf,
    model: () => W(),
    cancel: () => { pending = null; },
  };
}
