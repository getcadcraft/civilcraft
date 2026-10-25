/* SPDX-License-Identifier: Apache-2.0 */
/**
 * irr-ui.js — the Landscape workspace's irrigation on the page (0.7 LD.5, session `landscape`): the Irrigation menu, placing heads,
 * drawing laterals, mains and drip lines (their ends snap to heads, valves and other pipe ends so the network joins), valves (one
 * zone each), the point of connection, coverage, Properties, the Irrigation section (what to place, the supply, the settings)
 * and the check: zones, the worst-case head, pressure and flow against the supply, a run time and the bill of materials.
 * A calculation aid, not a stamped design: every panel says an irrigation designer checks it. The maths is irrigation.js.
 *
 *   createIrrUi(ctx, { edit, LS, U }) → { menu, tools, closed, hints, command, click, finish, isMine, pick, props, grip, remove,
 *     sceneItems(unitPerMm), overlay(c2d, toScreen, C, sel), section, renderSection(), updateTools(tool), quantities() }
 */

import { GENERIC_HEADS, PIPE_SIZES, sizeOf, catalogOf, cleanIrrigation, analyse, coverage, headFlow, headRadius, dripFlow, KPA_PER_PSI, LMIN_PER_GPM, readHeads } from './irrigation.js';
import { unitM, edgeDist } from './planting.js';
import { t } from '../i18n.js';
import { fixed } from '../units.js';

const DRAW = ['ls-head', 'ls-lateral', 'ls-main', 'ls-valve', 'ls-drip', 'ls-poc'];

export function createIrrUi(ctx, { edit, LS, U }) {
  const { el } = ctx;
  const P = () => ctx.project();
  const irr = () => LS().irrigation || cleanIrrigation(null);
  const k = () => unitM(U());
  const ft = () => U() !== 'm';
  const pTxt = (kpa) => (ft() ? fixed(kpa / KPA_PER_PSI, 1) + ' psi' : fixed(kpa, 0) + ' kPa');   // i18n-ignore: units
  const qTxt = (lmin) => (ft() ? fixed(lmin / LMIN_PER_GPM, 2) + ' gpm' : fixed(lmin, 1) + ' L/min');   // i18n-ignore: units
  const lTxt = (m) => (ft() ? fixed(m / 0.3048, 1) + ' ft' : fixed(m, 1) + ' m');   // i18n-ignore: units
  const prTxt = (mmh) => (ft() ? fixed(mmh / 25.4, 2) + ' in/h' : fixed(mmh, 1) + ' mm/h');   // i18n-ignore: units
  let cur = { type: 'spray-4.5', arc: 360, rot: 0, lateral: null, main: null, coverage: false };
  /** A head kind's name: the generic ones by their own key (translated), the project's own as they were typed. */
  const headName = (h) => (h.source?.kind === 'generic' ? t('ls.i.h.' + h.key) : h.name);
  const typeName = (key) => { const ty = catalogOf(irr()).get(key); return ty ? headName(ty) : key; };
  const sizesFor = () => PIPE_SIZES.filter((s) => s.system === (ft() ? 'ft' : 'm'));
  const lateralSize = () => cur.lateral || (ft() ? 'ips-3/4' : 'pe-25');
  const mainSize = () => cur.main || (ft() ? 'ips-1-1/4' : 'pe-40');
  const put = (label, fn) => edit(label, (l) => { l.irrigation = cleanIrrigation(l.irrigation); fn(l.irrigation); });
  let memo = { key: '', r: null };
  function result() {
    const key = JSON.stringify(irr()) + U() + (ctx.surface()?.nT || 0);
    if (memo.key !== key) memo = { key, r: analyse(irr(), U(), ctx.groundAt) };
    return memo.r;
  }

  const item = (cmd, role = 'menuitemcheckbox') => el('button', { type: 'button', role, dataset: { cmd }, title: t('ls.i.k.' + cmd.slice(3) + '.title') }, t('ls.i.k.' + cmd.slice(3)));
  const menu = el('details', { className: 'cv-menu', dataset: { groupMenu: 'Irrigation' } },   // i18n-ignore: the menu's key
    el('summary', { className: 'cv-tool', title: t('ls.i.menu.title') }, el('i', { className: 'bi bi-droplet', 'aria-hidden': 'true' }), el('span', {}, t('ls.i.menu'))),
    el('div', { className: 'cv-menu-list', role: 'menu' }, ...DRAW.map((c) => item(c)), el('hr'), item('ls-coverage'), item('ls-check', 'menuitem')));
  function updateTools(tool) {
    for (const b of menu.querySelectorAll('[data-cmd]')) {
      if (DRAW.includes(b.dataset.cmd)) b.setAttribute('aria-checked', String(tool === b.dataset.cmd));
      if (b.dataset.cmd === 'ls-coverage') b.setAttribute('aria-checked', String(cur.coverage));
    }
  }
  function command(c) {
    if (DRAW.includes(c)) { ctx.setTool(ctx.tool() === c ? 'select' : c); if (ctx.tool() === c) ctx.say(t('ls.i.hint.' + c.slice(3))); return true; }
    if (c === 'ls-coverage') { cur.coverage = !cur.coverage; ctx.redraw(); renderSection(); return true; }
    if (c === 'ls-check') { checkDialog(); return true; }
    return false;
  }

  // ---- snapping: a clicked point near a head, a valve, the supply or a pipe end takes its exact place ----
  function snap(p) {
    const tol = Math.max(irr().settings.joinTol, 0.6) / k();
    let best = null, bd = tol;
    const s = irr();
    for (const q of [...s.heads, ...s.valves, ...(s.supply ? [s.supply] : []), ...s.pipes.flatMap((x) => [x.a, x.b]), ...s.drips.map((d) => d.pts[0])]) {
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < bd) { bd = d; best = q; }
    }
    return best ? { x: best.x, y: best.y } : { x: p.x, y: p.y };
  }
  const nextId = () => P().nextId('i');
  function click(tool, w) {
    if (tool === 'ls-head') {
      const at = snap(w), id = nextId();
      put(t('ls.i.undo.head'), (s) => s.heads.push({ id, ...at, type: cur.type, arc: cur.arc, rot: cur.rot, radius: null }));
      ctx.say(t('ls.i.head.done', { n: irr().heads.length }));
      return true;
    }
    if (tool === 'ls-valve') {
      const at = snap(w), id = nextId(), n = irr().valves.length + 1;
      put(t('ls.i.undo.valve'), (s) => s.valves.push({ id, ...at, name: t('ls.i.zone.name', { n }) }));
      ctx.setTool('select'); ctx.select({ kind: 'ls-irr', id });
      ctx.say(t('ls.i.valve.done'));
      return true;
    }
    if (tool === 'ls-poc') {
      const at = snap(w), had = irr().supply;
      put(t('ls.i.undo.poc'), (s) => { s.supply = { ...at, pressure: had?.pressure ?? (ft() ? 60 * KPA_PER_PSI : 400), flow: had?.flow ?? (ft() ? 20 * LMIN_PER_GPM : 75), loss: had?.loss ?? 0 }; });
      ctx.setTool('select'); ctx.select({ kind: 'ls-irr', id: 'supply' });
      ctx.say(t('ls.i.poc.done'));
      return true;
    }
    return false;
  }
  function finish(tool, pts) {
    if (pts.length < 2) { ctx.say(t('ls.hedge.need2')); return false; }
    const xy = pts.map(snap);
    if (tool === 'ls-drip') {
      const id = nextId();
      put(t('ls.i.undo.drip'), (s) => s.drips.push({ id, pts: xy, q: 2, spacing: 0.3, size: ft() ? 'ips-1/2' : 'pe-16' }));
      ctx.select({ kind: 'ls-irr', id });
      return true;
    }
    const kind = tool === 'ls-main' ? 'main' : 'lateral', size = kind === 'main' ? mainSize() : lateralSize();
    put(t('ls.i.undo.pipe'), (s) => { for (let i = 0; i + 1 < xy.length; i++) if (Math.hypot(xy[i + 1].x - xy[i].x, xy[i + 1].y - xy[i].y) > 1e-9) s.pipes.push({ id: nextId(), kind, a: xy[i], b: xy[i + 1], size }); });
    const z = result().zones;
    ctx.say(z.length ? t('ls.i.pipe.done.zones', { n: z.length, flow: qTxt(z.reduce((a, x) => Math.max(a, x.flow), 0)) }) : t('ls.i.pipe.done'));
    return true;
  }

  // ---- selection ----
  const isMine = (sel) => sel?.kind === 'ls-irr';
  const findAny = (id) => { const s = irr(); if (id === 'supply') return s.supply ? { what: 'supply', it: s.supply } : null; for (const w of ['heads', 'pipes', 'valves', 'drips']) { const it = s[w].find((x) => x.id === id); if (it) return { what: w, it }; } return null; };
  function pick(w, tol) {
    const s = irr();
    const near = (p) => Math.hypot(p.x - w.x, p.y - w.y) <= tol * 1.6;
    if (s.supply && near(s.supply)) return { kind: 'ls-irr', id: 'supply' };
    for (const v of s.valves) if (near(v)) return { kind: 'ls-irr', id: v.id };
    for (const h of s.heads) if (near(h)) return { kind: 'ls-irr', id: h.id };
    for (const p of s.pipes) if (edgeDist(w.x, w.y, [p.a, p.b], false) <= tol) return { kind: 'ls-irr', id: p.id };
    for (const d of s.drips) if (edgeDist(w.x, w.y, d.pts, false) <= tol) return { kind: 'ls-irr', id: d.id };
    return null;
  }
  function grip(sel) {
    const f = isMine(sel) && findAny(sel.id);
    if (!f) return null;
    const list = (w) => () => P().state.landscape?.irrigation?.[w];
    if (f.what === 'heads' || f.what === 'valves') return { list: irr()[f.what], only: irr()[f.what].indexOf(f.it), label: t('ls.i.undo.move'), get: list(f.what) };
    if (f.what === 'drips') return { list: f.it.pts, label: t('ls.i.undo.move'), get: () => P().state.landscape?.irrigation?.drips.find((d) => d.id === sel.id)?.pts };
    return null;
  }
  function remove(sel) {
    const f = isMine(sel) && findAny(sel.id);
    if (!f) return false;
    put(t('ls.undo.delete'), (s) => { if (f.what === 'supply') s.supply = null; else s[f.what] = s[f.what].filter((x) => x.id !== sel.id); });
    return true;
  }

  const zoneOf = (id) => result().zones.find((z) => z.id === id || z.heads.some((h) => h.id === id) || z.pipes.some((p) => p.id === id) || z.drips.some((d) => d.id === id)) || null;
  const probText = (p) => t('ls.i.p.' + p.key, { v: p.v ? fixed(p.v, 2) : '', max: p.max ? fixed(p.max, 2) : '', need: p.need ? (p.key === 'flow' ? qTxt(p.need) : pTxt(p.need)) : '', have: p.have ? (p.key === 'flow' ? qTxt(p.have) : pTxt(p.have)) : '', p: p.p ? pTxt(p.p) : '', id: p.id || '' });
  function props(sel, box, head) {
    const f = isMine(sel) && findAny(sel.id);
    if (!f) return false;
    const fields = [], facts = [], it = f.it, cat = catalogOf(irr());
    const set = (label, fn) => put(label, (s) => { const x = f.what === 'supply' ? s.supply : s[f.what].find((y) => y.id === it.id); if (x) fn(x); });
    const num = (label, id, value, fn, { calc = false } = {}) => fields.push(el('label', { for: id }, label), ctx.numInput(value ?? '', (v) => { const n = Number(v); if (!Number.isFinite(n)) return false; if (fn(n) === false) return false; return true; }, { label, id, calc }));
    const select = (label, id, value, opts, fn) => { const s = el('select', { className: 'cv-select', id }, ...opts.map(([v, txt]) => el('option', { value: v }, txt))); s.value = value; s.addEventListener('change', () => fn(s.value)); fields.push(el('label', { for: id }, label), s); };
    const z = f.what === 'supply' ? null : zoneOf(it.id);
    if (f.what === 'heads') {
      head.textContent = t('ls.i.head.head');
      select(t('ls.i.f.type'), 'cv-ir-type', it.type, [...cat.values()].map((h) => [h.key, headName(h)]), (v) => set(t('ls.i.undo.head'), (x) => { x.type = v; }));
      num(t('ls.i.f.arc'), 'cv-ir-arc', it.arc, (n) => { if (!(n > 0 && n <= 360)) return false; set(t('ls.i.undo.head'), (x) => { x.arc = n; }); });
      num(t('ls.i.f.rot'), 'cv-ir-rot', it.rot, (n) => set(t('ls.i.undo.head'), (x) => { x.rot = ((n % 360) + 360) % 360; }));
      num(t('ls.i.f.radius', { u: ft() ? 'ft' : 'm' }), 'cv-ir-r', it.radius == null ? '' : fixed(it.radius / (ft() ? 0.3048 : 1), 2), (n) => { if (!(n > 0)) return false; set(t('ls.i.undo.head'), (x) => { x.radius = n * (ft() ? 0.3048 : 1); }); });
      const ty = cat.get(it.type);
      facts.push([t('ls.i.f.flow'), qTxt(headFlow(it, ty))], [t('ls.i.f.throw'), lTxt(headRadius(it, ty))], [t('ls.i.f.range'), ty ? pTxt(ty.pressure.min) + ' – ' + pTxt(ty.pressure.max) : '—'], [t('ls.i.f.zone'), z ? z.name : t('ls.i.nozone')]);   // i18n-ignore: a range dash
      if (ty?.source?.kind === 'maker') facts.push([t('ls.i.f.source'), ty.source.attribution || ty.source.maker]);
    } else if (f.what === 'pipes') {
      head.textContent = t('ls.i.pipe.head');
      select(t('ls.i.f.size'), 'cv-ir-size', it.size, PIPE_SIZES.map((s) => [s.key, s.label]), (v) => set(t('ls.i.undo.pipe'), (x) => { x.size = v; }));
      select(t('ls.i.f.kind'), 'cv-ir-kind', it.kind, [['lateral', t('ls.i.lateral')], ['main', t('ls.i.main')]], (v) => set(t('ls.i.undo.pipe'), (x) => { x.kind = v; }));
      const row = z?.pipes.find((p) => p.id === it.id);
      facts.push([t('ls.i.f.length'), lTxt(Math.hypot(it.b.x - it.a.x, it.b.y - it.a.y) * k())], [t('ls.i.f.inside'), ft() ? fixed(sizeOf(it.size).id / 0.0254, 3) + ' in' : fixed(sizeOf(it.size).id * 1000, 1) + ' mm']);   // i18n-ignore: units
      if (row) facts.push([t('ls.i.f.flow'), qTxt(row.Q)], [t('ls.i.f.velocity'), fixed(row.v, 2) + ' m/s'], [t('ls.i.f.loss'), pTxt(row.kPa)]);   // i18n-ignore: a unit
    } else if (f.what === 'valves') {
      head.textContent = t('ls.i.valve.head');
      const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-ir-name', value: it.name, maxLength: 120 });
      nm.addEventListener('change', () => set(t('ls.undo.rename'), (x) => { x.name = nm.value.trim().slice(0, 120) || it.name; }));
      fields.push(el('label', { for: 'cv-ir-name' }, t('ls.b.name')), nm);
      if (z) facts.push([t('ls.i.f.heads'), String(z.heads.length)], [t('ls.i.f.flow'), qTxt(z.flow)], [t('ls.i.f.need'), pTxt(z.pressureNeed)], [t('ls.i.f.worst'), z.worst ? (z.worst.head || z.worst.drip) : '—'], [t('ls.i.f.pr'), prTxt(z.pr)], [t('ls.i.f.minutes'), t('ls.i.minutes', { m: fixed(z.minutes, 0), mm: irr().settings.weekly })]);
      if (z?.atSupply) facts.push([t('ls.i.f.atsupply'), pTxt(z.atSupply)]);
    } else if (f.what === 'drips') {
      head.textContent = t('ls.i.drip.head');
      num(t('ls.i.f.q'), 'cv-ir-q', it.q, (n) => { if (!(n > 0 && n < 100)) return false; set(t('ls.i.undo.drip'), (x) => { x.q = n; }); });
      num(t('ls.i.f.spacing'), 'cv-ir-sp', it.spacing, (n) => { if (!(n >= 0.05 && n <= 5)) return false; set(t('ls.i.undo.drip'), (x) => { x.spacing = n; }); });
      facts.push([t('ls.i.f.flow'), qTxt(dripFlow(it, k()))], [t('ls.i.f.zone'), z ? z.name : t('ls.i.nozone')]);
    } else {
      head.textContent = t('ls.i.poc.head');
      num(t(ft() ? 'ls.i.f.psi' : 'ls.i.f.kpa'), 'cv-ir-press', fixed(ft() ? it.pressure / KPA_PER_PSI : it.pressure, 1), (n) => { if (!(n > 0)) return false; set(t('ls.i.undo.poc'), (x) => { x.pressure = ft() ? n * KPA_PER_PSI : n; }); });
      num(t(ft() ? 'ls.i.f.gpm' : 'ls.i.f.lmin'), 'cv-ir-flow', fixed(ft() ? it.flow / LMIN_PER_GPM : it.flow, 1), (n) => { if (!(n >= 0)) return false; set(t('ls.i.undo.poc'), (x) => { x.flow = ft() ? n * LMIN_PER_GPM : n; }); });
      num(t(ft() ? 'ls.i.f.losspsi' : 'ls.i.f.losskpa'), 'cv-ir-ploss', fixed(ft() ? it.loss / KPA_PER_PSI : it.loss, 1), (n) => { if (!(n >= 0)) return false; set(t('ls.i.undo.poc'), (x) => { x.loss = ft() ? n * KPA_PER_PSI : n; }); });
      const m = result().main;
      if (m.worstZone) facts.push([t('ls.i.f.governs'), result().zones.find((x) => x.id === m.worstZone)?.name || ''], [t('ls.i.f.needsupply'), pTxt(m.need)]);
    }
    const probs = f.what === 'supply' ? result().zones.flatMap((x) => x.problems.filter((p) => p.key === 'pressure' || p.key === 'flow')) : (z?.problems || []).filter((p) => !p.id || p.id === it.id || f.what === 'valves');
    box.replaceChildren(el('div', { className: 'cv-props' }, ...fields),
      el('div', { className: 'cv-props', 'data-ls-ir-facts': '' }, ...facts.flatMap(([a, b]) => [el('span', { className: 'k' }, a), el('span', { className: 'v' }, b)])),
      ...probs.map((p) => el('p', { className: 'cv-report is-error', dataset: { lsIrProblem: p.key } }, probText(p))),
      el('p', { className: 'cv-note' }, t('ls.i.aid')),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => ctx.command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    return true;
  }

  // ---- the Irrigation section (left panel) ----
  const section = el('section', { className: 'cv-sec cv-ls-irr', dataset: { lsIrr: '' }, hidden: true, 'aria-labelledby': 'cv-ls-irr-h' });
  function renderSection() {
    const cat = catalogOf(irr()), S = irr().settings;
    const ty = el('select', { className: 'cv-select', id: 'cv-ls-htype', 'data-ls-htype': '' }, ...[...cat.values()].map((h) => el('option', { value: h.key }, headName(h))));
    ty.value = cur.type; ty.addEventListener('change', () => { cur.type = ty.value; });
    const arc = el('select', { className: 'cv-select', id: 'cv-ls-harc', 'data-ls-harc': '' }, ...[90, 180, 270, 360].map((a) => el('option', { value: String(a) }, a + '°')));
    arc.value = String(cur.arc); arc.addEventListener('change', () => { cur.arc = Number(arc.value); });
    const rot = ctx.numInput(cur.rot, (v) => { const n = Number(v); if (!Number.isFinite(n)) return false; cur.rot = ((n % 360) + 360) % 360; return true; }, { label: t('ls.i.f.rot'), id: 'cv-ls-hrot', calc: false });
    const sz = (id, get, setv) => { const s = el('select', { className: 'cv-select', id }, ...sizesFor().map((x) => el('option', { value: x.key }, x.label))); s.value = get(); s.addEventListener('change', () => setv(s.value)); return s; };
    const setting = (key, label, id) => ctx.numInput(S[key], (v) => { const n = Number(v); if (!(n > 0)) return false; put(t('ls.i.undo.settings'), (s) => { s.settings[key] = n; }); return true; }, { label, id, calc: false });
    const own = el('input', { type: 'file', accept: '.json,.csv', className: 'visually-hidden', tabIndex: -1, 'aria-hidden': 'true', 'data-ls-heads-file': '' });
    own.addEventListener('change', async () => {
      const file = own.files?.[0]; own.value = '';
      if (!file || file.size > 2e6) return;
      let rows = [];
      try { rows = JSON.parse(await file.text()); } catch { ctx.say(t('ls.i.heads.bad')); return; }
      const r = readHeads(Array.isArray(rows) ? rows : rows.heads);
      if (!r.heads.length) { ctx.say(t('ls.i.heads.none', { why: r.notes.join(', ') })); return; }
      put(t('ls.i.undo.heads'), (s) => { const keys = new Set(r.heads.map((h) => h.key)); s.catalog = [...s.catalog.filter((h) => !keys.has(h.key)), ...r.heads]; });
      ctx.say(t('ls.i.heads.done', { n: r.heads.length, refused: r.notes.filter((x) => x === 'no-grant').length }));
      renderSection();
    });
    const parts = [el('h2', { className: 'cv-h', id: 'cv-ls-irr-h' }, t('ls.i.sec')), el('p', { className: 'cv-note' }, t('ls.i.aid')),
      el('div', { className: 'cv-props' },
        el('label', { for: 'cv-ls-htype' }, t('ls.i.f.type')), ty, el('label', { for: 'cv-ls-harc' }, t('ls.i.f.arc')), arc, el('label', { for: 'cv-ls-hrot' }, t('ls.i.f.rot')), rot,
        el('label', { for: 'cv-ls-lsize' }, t('ls.i.f.lsize')), sz('cv-ls-lsize', lateralSize, (v) => { cur.lateral = v; }),
        el('label', { for: 'cv-ls-msize' }, t('ls.i.f.msize')), sz('cv-ls-msize', mainSize, (v) => { cur.main = v; }),
        el('label', { for: 'cv-ls-c' }, t('ls.i.f.c')), setting('C', t('ls.i.f.c'), 'cv-ls-c'),
        el('label', { for: 'cv-ls-vmax' }, t('ls.i.f.vmax')), setting('vMax', t('ls.i.f.vmax'), 'cv-ls-vmax'),
        el('label', { for: 'cv-ls-vloss' }, t('ls.i.f.vloss')), setting('valveLoss', t('ls.i.f.vloss'), 'cv-ls-vloss'),
        el('label', { for: 'cv-ls-weekly' }, t('ls.i.f.weekly')), setting('weekly', t('ls.i.f.weekly'), 'cv-ls-weekly')),
      el('p', { className: 'cv-note' }, t('ls.i.generic')),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-heads-add': '', onclick: () => own.click() }, t('ls.i.heads.add')), el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-check': '', onclick: () => checkDialog() }, t('ls.i.k.check'))), own];
    if (cur.coverage && irr().heads.length) {
      const c = coverage(irr(), U());
      parts.push(el('p', { className: 'cv-note', 'data-ls-coverage': '' }, t('ls.i.cov', { dry: fixed((100 * c.dry) / Math.max(1, c.cells), 1), two: fixed((100 * c.double) / Math.max(1, c.cells), 0), far: c.far.length })));
    }
    section.replaceChildren(...parts);
  }

  function checkDialog() {
    const r = result();
    const zrow = (z) => el('tr', { dataset: { lsZone: z.id } }, el('td', {}, z.name), el('td', { className: 'num' }, String(z.heads.length)), el('td', { className: 'num' }, qTxt(z.flow)), el('td', { className: 'num' }, pTxt(z.pressureNeed)), el('td', { className: 'num' }, z.atSupply ? pTxt(z.atSupply) : '—'), el('td', { className: 'num' }, prTxt(z.pr)), el('td', { className: 'num' }, fixed(z.minutes, 0)), el('td', {}, z.problems.length ? z.problems.map(probText).join(' ') : t('ls.i.ok')));
    const bom = r.bom;
    const csv = () => {
      const rows = [[t('ls.i.c.zone'), t('ls.i.c.heads'), t('ls.i.c.flow'), t('ls.i.c.need'), t('ls.i.c.supply'), t('ls.i.c.pr'), t('ls.i.c.minutes'), t('ls.i.c.problems')], ...r.zones.map((z) => [z.name, z.heads.length, qTxt(z.flow), pTxt(z.pressureNeed), z.atSupply ? pTxt(z.atSupply) : '', prTxt(z.pr), fixed(z.minutes, 0), z.problems.map(probText).join(' ')]),
        [], [t('ls.i.c.item'), t('ls.i.c.qty')], ...bom.heads.map((h) => [typeName(h.type) + ' ' + h.arc + '°', h.n]), ...bom.pipes.map((p) => [p.label, lTxt(p.m)]), [t('ls.i.c.valves'), bom.valves], [t('ls.i.c.drip'), lTxt(bom.drip)], [t('ls.i.c.emitters'), bom.emitters], [t('ls.i.c.controller'), t('ls.i.stations', { n: bom.stations })], [], [t('ls.i.aid')]];
      const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s) && !/^-?\d/.test(s)) s = "'" + s; return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
      ctx.download(new TextEncoder().encode('﻿' + rows.map((x) => x.map(cell).join(',')).join('\r\n') + '\r\n'), ctx.fileStem() + '-irrigation.csv', 'text/csv');   // i18n-ignore: a file name ending
    };
    const dlg = el('dialog', { className: 'cv-dialog cv-ls-schdlg', 'aria-labelledby': 'cv-ls-irc-h', 'data-ls-irr-check': '' },
      el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-ls-irc-h' }, t('ls.i.check.head'))),
      el('div', { className: 'cv-dlg-body' },
      el('p', { className: 'cv-report' }, t('ls.i.aid')),
      el('div', { className: 'cv-ls-schwrap' }, el('table', { className: 'cv-groups', 'data-ls-zones': '' },
        el('thead', {}, el('tr', {}, ...['zone', 'heads', 'flow', 'need', 'supply', 'pr', 'minutes', 'problems'].map((c) => el('th', { scope: 'col' }, t('ls.i.c.' + c))))),
        el('tbody', {}, ...r.zones.map(zrow))),
      el('h3', { className: 'cv-h3' }, t('ls.i.bom')),
      el('table', { className: 'cv-groups', 'data-ls-bom': '' }, el('tbody', {},
        ...bom.heads.map((h) => el('tr', {}, el('td', {}, typeName(h.type) + ' ' + h.arc + '°'), el('td', { className: 'num' }, String(h.n)))),
        ...bom.pipes.map((p) => el('tr', {}, el('td', {}, p.label), el('td', { className: 'num' }, lTxt(p.m)))),
        el('tr', {}, el('td', {}, t('ls.i.c.valves')), el('td', { className: 'num' }, String(bom.valves))),
        bom.drip ? el('tr', {}, el('td', {}, t('ls.i.c.drip')), el('td', { className: 'num' }, lTxt(bom.drip) + ' · ' + t('ls.i.emitters', { n: bom.emitters }))) : '',   // i18n-ignore: a separator
        el('tr', {}, el('td', {}, t('ls.i.c.controller')), el('td', { className: 'num' }, t('ls.i.stations', { n: bom.stations })))))),
      ...r.problems.map((p) => el('p', { className: 'cv-report is-error' }, probText(p)))),
      el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-irr-csv': '', onclick: csv }, t('ls.sch.csv')), el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-ls-irr-close': '', onclick: () => dlg.close() }, t('ls.close')))));
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    ctx.root.append(dlg);
    dlg.showModal();
  }

  // ---- the plan ----
  function sceneItems(unitPerMm) {
    const s = irr(), cat = catalogOf(s), items = [], kk = k(), lab = 2;
    if (!s.heads.length && !s.pipes.length && !s.valves.length && !s.supply && !s.drips.length) return items;
    for (const p of s.pipes) items.push({ layer: 'L-IRRG-PIPE', kind: 'poly', pts: [p.a, p.b], dashed: p.kind === 'lateral' });
    for (const d of s.drips) items.push({ layer: 'L-IRRG-PIPE', kind: 'poly', pts: d.pts, dashed: true });
    for (const h of s.heads) {
      const ty = cat.get(h.type), r = headRadius(h, ty) / kk, a0 = (h.rot * Math.PI) / 180, a1 = ((h.rot + h.arc) * Math.PI) / 180;
      items.push({ layer: 'L-IRRG-HEAD', kind: 'arc', c: { x: h.x, y: h.y }, r: 0.8 * unitPerMm, a0: 0, a1: 2 * Math.PI });
      if (h.arc >= 360) items.push({ layer: 'L-IRRG-COVR', kind: 'arc', c: { x: h.x, y: h.y }, r, a0: 0, a1: 2 * Math.PI });
      else items.push({ layer: 'L-IRRG-COVR', kind: 'arc', c: { x: h.x, y: h.y }, r, a0, a1 }, { layer: 'L-IRRG-COVR', kind: 'poly', pts: [{ x: h.x + r * Math.cos(a0), y: h.y + r * Math.sin(a0) }, { x: h.x, y: h.y }, { x: h.x + r * Math.cos(a1), y: h.y + r * Math.sin(a1) }] });
    }
    for (const v of s.valves) {
      const q = 1.2 * unitPerMm;
      items.push({ layer: 'L-IRRG-VALV', kind: 'poly', pts: [{ x: v.x - q, y: v.y - q }, { x: v.x + q, y: v.y - q }, { x: v.x + q, y: v.y + q }, { x: v.x - q, y: v.y + q }], closed: true });
      const z = result().zones.find((x) => x.id === v.id);
      items.push({ layer: 'L-IRRG-TEXT', kind: 'text', x: v.x + 2 * unitPerMm, y: v.y, mm: lab, rot: 0, text: z ? t('ls.i.label.zone', { name: v.name, q: qTxt(z.flow), p: pTxt(z.pressureNeed) }) : v.name, align: 'left', middle: true });
    }
    if (s.supply) { const q = 1.6 * unitPerMm, p = s.supply; items.push({ layer: 'L-IRRG-VALV', kind: 'poly', pts: [{ x: p.x, y: p.y + q }, { x: p.x - q, y: p.y - q }, { x: p.x + q, y: p.y - q }], closed: true }, { layer: 'L-IRRG-TEXT', kind: 'text', x: p.x + 2 * unitPerMm, y: p.y, mm: lab, rot: 0, text: t('ls.i.label.poc', { p: pTxt(p.pressure), q: qTxt(p.flow) }), align: 'left', middle: true }); }
    return items;
  }
  function overlay(c2d, toScreen, C, sel) {
    const f = isMine(sel) && findAny(sel.id);
    if (!f) return;
    c2d.save(); c2d.strokeStyle = C.action; c2d.lineWidth = 2.5;
    const ring = (p, r = 8) => { const q = toScreen(p.x, p.y); c2d.beginPath(); c2d.arc(q.x, q.y, r, 0, 2 * Math.PI); c2d.stroke(); };
    if (f.what === 'pipes') { const a = toScreen(f.it.a.x, f.it.a.y), b = toScreen(f.it.b.x, f.it.b.y); c2d.beginPath(); c2d.moveTo(a.x, a.y); c2d.lineTo(b.x, b.y); c2d.stroke(); }
    else if (f.what === 'drips') { c2d.beginPath(); f.it.pts.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); }); c2d.stroke(); }
    else ring(f.it);
    if (f.what === 'valves') {   // the zone's worst-case head
      const z = result().zones.find((x) => x.id === f.it.id);
      if (z?.worst) { c2d.strokeStyle = C.red || C.action; c2d.setLineDash([4, 3]); ring(z.worst, 12); }
    }
    c2d.restore();
  }

  return {
    menu, tools: DRAW, closed: new Set(), hints: Object.fromEntries(DRAW.map((x) => [x, 'ls.i.hint.' + x.slice(3)])),
    command, click, finish, isMine, pick, props, grip, remove, sceneItems, overlay, section, renderSection, updateTools, result,
    quantities() {
      const r = result().bom, m = !ft(), out = [];
      for (const h of r.heads) out.push({ key: 'irr:' + h.type + ':' + h.arc, name: typeName(h.type) + ' ' + h.arc + '°', unit: 'EA', qty: h.n });   // i18n-ignore: a unit symbol
      for (const p of r.pipes) out.push({ key: 'irr:' + p.size, name: p.label, unit: m ? 'm' : 'LF', qty: Math.round((m ? p.m : p.m / 0.3048) * 100) / 100 });   // i18n-ignore: unit symbols
      if (r.valves) out.push({ key: 'irr:valves', name: t('ls.i.c.valves'), unit: 'EA', qty: r.valves });   // i18n-ignore: a unit symbol
      if (r.drip) out.push({ key: 'irr:drip', name: t('ls.i.c.drip'), unit: m ? 'm' : 'LF', qty: Math.round((m ? r.drip : r.drip / 0.3048) * 100) / 100 });   // i18n-ignore: unit symbols
      return out;
    },
  };
}
export { GENERIC_HEADS };
