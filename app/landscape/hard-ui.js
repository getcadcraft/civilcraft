/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hard-ui.js — the Landscape workspace's hardscape on the page (0.7 LD.4, session `landscape`): the Hardscape menu, drawing
 * paving / paths / walls / kerbs / ramps / steps, the drain of a paving, Properties with each object's checks (steps that do not
 * fit, a ramp steeper than its limit, a path steeper than its limit, a retaining wall an engineer must design), grips.
 * landscape-ui.js composes it; the maths is hardscape.js.
 *
 *   createHardUi(ctx, { edit, LS, U }) → { menu, tools, closed, hints, command, click, finish, isMine, pick, props, grip, remove,
 *     sceneItems(unitPerMm), overlay(c2d, toScreen, C, sel), elements(), quantities(), updateTools(tool) }
 */

import { cleanHardscape, hardDefaults, pavingSurface, pathStrip, wallLayout, rampLayout, stepsLayout, hardSceneItems, hardElements, hardQuantities, PATTERNS } from './hardscape.js';
import { inside, edgeDist } from './planting.js';
import { t } from '../i18n.js';
import { fixed } from '../units.js';

const DRAW = ['ls-paving', 'ls-path', 'ls-wall', 'ls-kerb', 'ls-ramp', 'ls-steps'];
const TOOLS = [...DRAW, 'ls-drain'];

export function createHardUi(ctx, { edit, LS, U }) {
  const { el } = ctx;
  const P = () => ctx.project();
  const list = () => LS().hardscape || [];
  const find = (id) => list().find((h) => h.id === id) || null;
  const uLen = () => (U() === 'm' ? 'm' : 'ft');
  const surface = () => ctx.surface();
  let drainFor = null;

  const item = (cmd, label, title) => el('button', { type: 'button', role: 'menuitemcheckbox', dataset: { cmd }, title }, label);
  const menu = el('details', { className: 'cv-menu', dataset: { groupMenu: 'Hardscape' } },   // i18n-ignore: the menu's key
    el('summary', { className: 'cv-tool', title: t('ls.h.menu.title') }, el('i', { className: 'bi bi-bricks', 'aria-hidden': 'true' }), el('span', {}, t('ls.h.menu'))),
    el('div', { className: 'cv-menu-list', role: 'menu' }, ...DRAW.map((c) => item(c, t('ls.h.k.' + c.slice(3)), t('ls.h.k.' + c.slice(3) + '.title')))));
  function updateTools(tool) { for (const b of menu.querySelectorAll('[data-cmd]')) b.setAttribute('aria-checked', String(tool === b.dataset.cmd)); }

  function command(c) {
    if (!TOOLS.includes(c)) return false;
    ctx.setTool(ctx.tool() === c ? 'select' : c);
    if (ctx.tool() === c) ctx.say(t('ls.h.hint.' + c.slice(3)));
    return true;
  }
  function finish(tool, pts) {
    const kind = tool.slice(3), xy = pts.map((p) => ({ x: p.x, y: p.y }));
    if (kind === 'paving' ? xy.length < 3 : xy.length < 2) { ctx.say(t(kind === 'paving' ? 'ls.bed.need3' : 'ls.hedge.need2')); return false; }
    const id = P().nextId('l'), n = list().filter((h) => h.kind === kind).length + 1, name = t('ls.h.name.' + kind, { n });
    const raw = { id, kind, name, pts: kind === 'steps' ? [xy[0], xy[xy.length - 1]] : xy };
    if (kind === 'paving') raw.falls = { mode: 'none' };
    const rec = cleanHardscape([raw], U())[0];
    edit(t('ls.gr.undo.draw', { name }), (l) => { l.hardscape = [...(l.hardscape || []), rec]; });
    ctx.select({ kind: 'ls-hard', id });
    ctx.say(summary(rec) || t('ls.gr.done.nov', { name }));
    return true;
  }
  /** Drain: a click inside the selected paving places its drain (every other tool collects points like a drawn line). */
  function click(tool, w) {
    if (tool === 'ls-drain') {
      const pv = find(drainFor);
      if (!pv || !inside(w.x, w.y, pv.pts)) { ctx.say(t('ls.h.drain.inside')); return true; }
      edit(t('ls.h.undo.drain'), () => { const p = find(pv.id); p.falls = { ...p.falls, mode: 'drain', drain: { x: w.x, y: w.y } }; });
      ctx.setTool('select'); ctx.select({ kind: 'ls-hard', id: pv.id });
      ctx.say(t('ls.h.drain.done'));
      return true;
    }
    return false;
  }
  function summary(h) {
    const sf = surface();
    if (h.kind === 'steps') { const s = stepsLayout(h, sf, U()); return s.n ? t(s.fits ? 'ls.h.steps.sum' : 'ls.h.steps.sum.short', { n: s.n, r: fixed(s.riser, 3), g: fixed(s.going, 3), u: uLen(), need: fixed(s.need, 2) }) : t('ls.h.steps.flat'); }
    if (h.kind === 'ramp') { const r = rampLayout(h, sf, U()); return t(r.ok ? 'ls.h.ramp.sum' : 'ls.h.ramp.sum.bad', { g: fixed(r.grade, 2), max: h.maxGrade, need: fixed(r.need, 2), u: uLen() }); }
    if (h.kind === 'wall') { const w = wallLayout(h, sf, U()); return t(w.engineer ? 'ls.h.wall.sum.eng' : 'ls.h.wall.sum', { min: fixed(w.minHeight, 2), max: fixed(w.maxHeight, 2), u: uLen() }); }
    if (h.kind === 'path') { const p = pathStrip(h, sf); return t(p.steep.length ? 'ls.h.path.sum.steep' : 'ls.h.path.sum', { g: fixed(p.steepest, 1), max: h.maxGrade }); }
    return '';
  }

  const isMine = (sel) => sel?.kind === 'ls-hard';
  function pick(w, tol) {
    for (const h of [...list()].reverse()) {
      if (h.kind === 'paving' ? inside(w.x, w.y, h.pts) || edgeDist(w.x, w.y, h.pts) <= tol : edgeDist(w.x, w.y, h.pts, false) <= Math.max(tol, (h.width || h.thickness || 0) / 2)) return { kind: 'ls-hard', id: h.id };
    }
    return null;
  }
  function grip(sel) { const h = isMine(sel) && find(sel.id); return h ? { list: h.pts, label: t('ls.undo.corner'), get: () => find(sel.id)?.pts } : null; }
  function remove(sel) {
    const h = isMine(sel) && find(sel.id);
    if (!h) return false;
    edit(t('ls.undo.delete'), (l) => { l.hardscape = l.hardscape.filter((x) => x.id !== h.id); });
    ctx.say(t('ls.deleted', { name: h.name }));
    return true;
  }

  function props(sel, box, head) {
    const h = isMine(sel) && find(sel.id);
    if (!h) return false;
    const sf = surface(), fields = [], put = (label, fn) => edit(label, () => fn(find(h.id)));
    const num = (label, id, value, set, { calc = true, blankOk = false, min = 0, max = 1e6, strict = false } = {}) => {
      fields.push(el('label', { for: id }, label), ctx.numInput(value ?? '', (v) => {
        const n = v.trim() === '' ? null : Number(v);
        if (n === null ? !blankOk : !(Number.isFinite(n) && (strict ? n > min : n >= min) && n <= max)) return false;
        put(t('ls.h.undo.edit', { name: h.name }), (x) => set(x, n));
        return true;
      }, { label, id, calc }));
    };
    const sel1 = (label, id, value, opts, set) => {
      const s = el('select', { className: 'cv-select', id }, ...opts.map(([v, txt]) => el('option', { value: v }, txt)));
      s.value = value;
      s.addEventListener('change', () => put(t('ls.h.undo.edit', { name: h.name }), (x) => set(x, s.value)));
      fields.push(el('label', { for: id }, label), s);
    };
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-hd-name', value: h.name, maxLength: 120 });
    nm.addEventListener('change', () => put(t('ls.undo.rename'), (x) => { x.name = nm.value.trim().slice(0, 120) || h.name; }));
    fields.push(el('label', { for: 'cv-hd-name' }, t('ls.b.name')), nm);
    const L = (k) => t(k, { u: uLen() });
    const facts = [], checks = [];
    if (h.kind === 'paving') {
      const ps = pavingSurface(h, sf);
      num(L('ls.gr.f.z'), 'cv-hd-level', h.level, (x, n) => { x.level = n; }, { blankOk: true, min: -1e6 });
      sel1(t('ls.h.f.falls'), 'cv-hd-falls', h.falls.mode, [['none', t('ls.h.falls.none')], ['cross', t('ls.h.falls.cross')], ['drain', t('ls.h.falls.drain')]], (x, v) => { if (v === 'drain' && !x.falls.drain) { x.falls = { ...x.falls, mode: 'none' }; queueMicrotask(() => { drainFor = h.id; ctx.setTool('ls-drain'); ctx.say(t('ls.h.hint.drain')); }); } else x.falls = { ...x.falls, mode: v }; });
      if (h.falls.mode !== 'none') num(t('ls.gr.f.fall'), 'cv-hd-fall', h.falls.pct, (x, n) => { x.falls = { ...x.falls, pct: n }; }, { calc: false, strict: true, max: 50 });
      if (h.falls.mode === 'cross') num(t('ls.gr.f.dir'), 'cv-hd-dir', h.falls.dir, (x, n) => { x.falls = { ...x.falls, dir: ((n % 360) + 360) % 360 }; }, { calc: false, min: -1e6 });
      sel1(t('ls.h.f.pattern'), 'cv-hd-pattern', h.pattern.kind, PATTERNS.map((p) => [p, t('ls.h.pat.' + p)]), (x, v) => { x.pattern = { ...x.pattern, kind: v }; });
      if (h.pattern.kind !== 'none') {
        num(L('ls.h.f.unitw'), 'cv-hd-uw', h.pattern.w, (x, n) => { x.pattern = { ...x.pattern, w: n }; }, { strict: true, max: 100 });
        num(L('ls.h.f.unitl'), 'cv-hd-ul', h.pattern.l, (x, n) => { x.pattern = { ...x.pattern, l: n }; }, { strict: true, max: 100 });
        num(L('ls.h.f.joint'), 'cv-hd-joint', h.pattern.joint, (x, n) => { x.pattern = { ...x.pattern, joint: n }; }, { max: 10 });
        num(t('ls.h.f.angle'), 'cv-hd-pangle', h.pattern.angle, (x, n) => { x.pattern = { ...x.pattern, angle: n % 360 }; }, { calc: false, min: -1e6 });
      }
      num(L('ls.h.f.edge'), 'cv-hd-edge', h.edge, (x, n) => { x.edge = n; }, { max: 100 });
      facts.push([t('ls.b.area'), t(U() === 'm' ? 'ls.area.m' : 'ls.area.ft', { a: fixed(Math.abs(areaOf(h.pts)), 1) })], [t('ls.h.f.level'), fixed(ps.z0, 2)]);
      if (h.falls.mode === 'drain') facts.push([t('ls.h.f.high'), fixed(Math.max(...ps.corners.map((c) => c.z)), 3)]);
    } else if (h.kind === 'path') {
      num(L('ls.h.f.width'), 'cv-hd-w', h.width, (x, n) => { x.width = n; }, { strict: true, max: 1000 });
      num(t('ls.h.f.crossfall'), 'cv-hd-xf', h.crossfall, (x, n) => { x.crossfall = n; }, { calc: false, max: 50 });
      num(t('ls.h.f.maxgrade'), 'cv-hd-mg', h.maxGrade, (x, n) => { x.maxGrade = n; }, { calc: false, strict: true, max: 100 });
      num(L('ls.h.f.edge'), 'cv-hd-edge', h.edge, (x, n) => { x.edge = n; }, { max: 100 });
      const st = pathStrip(h, sf);
      facts.push([t('ls.h.length'), fixed(st.length, 2) + ' ' + uLen()], [t('ls.h.f.steepest'), fixed(st.steepest, 1) + ' %']);   // i18n-ignore: a unit
      checks.push({ ok: !st.steep.length, text: t(st.steep.length ? 'ls.h.chk.path.bad' : 'ls.h.chk.path.ok', { g: fixed(st.steepest, 1), max: h.maxGrade, n: st.steep.length }) });
    } else if (h.kind === 'wall') {
      sel1(t('ls.h.f.walltype'), 'cv-hd-wt', h.wall, [['retaining', t('ls.h.wall.retaining')], ['freestanding', t('ls.h.wall.freestanding')]], (x, v) => { x.wall = v; });
      num(L('ls.h.f.top'), 'cv-hd-top', h.top, (x, n) => { x.top = n; }, { blankOk: true, min: -1e6 });
      num(L('ls.h.f.height'), 'cv-hd-h', h.height, (x, n) => { x.height = n; }, { strict: true, max: 1000 });
      num(L('ls.h.f.thick'), 'cv-hd-th', h.thickness, (x, n) => { x.thickness = n; }, { strict: true, max: 100 });
      num(t('ls.h.f.batter'), 'cv-hd-bat', h.batter, (x, n) => { x.batter = n; }, { calc: false, max: 44 });
      num(L('ls.h.f.fw'), 'cv-hd-fw', h.footing.width, (x, n) => { x.footing = { ...x.footing, width: n }; }, { strict: true, max: 100 });
      num(L('ls.h.f.fd'), 'cv-hd-fd', h.footing.depth, (x, n) => { x.footing = { ...x.footing, depth: n }; }, { strict: true, max: 100 });
      num(L('ls.h.f.fs'), 'cv-hd-fs', h.footing.step, (x, n) => { x.footing = { ...x.footing, step: n }; }, { strict: true, max: 100 });
      num(L('ls.h.f.coping'), 'cv-hd-co', h.coping.overhang, (x, n) => { x.coping = { ...x.coping, overhang: n }; }, { max: 10 });
      if (h.wall === 'retaining') num(L('ls.h.f.drain'), 'cv-hd-dr', h.drain, (x, n) => { x.drain = n; }, { max: 100 });
      const w = wallLayout(h, sf, U());
      facts.push([t('ls.h.length'), fixed(w.length, 2) + ' ' + uLen()], [t('ls.h.f.heights'), t('ls.h.range', { a: fixed(w.minHeight, 2), b: fixed(w.maxHeight, 2), u: uLen() })], [t('ls.h.f.face'), t(U() === 'm' ? 'ls.area.m' : 'ls.area.ft', { a: fixed(w.faceArea, 1) })], [t('ls.h.f.steps'), String(w.steps)]);
      if (w.engineer) checks.push({ ok: false, text: t('ls.h.chk.engineer', { h: fixed(hardDefaults(U()).wall.engineerFrom, 1), u: uLen() }) });
      if (w.off) checks.push({ ok: false, text: t('ls.h.chk.off', { n: w.off }) });
    } else if (h.kind === 'kerb') {
      num(L('ls.h.f.width'), 'cv-hd-w', h.width, (x, n) => { x.width = n; }, { strict: true, max: 10 });
      num(L('ls.h.f.upstand'), 'cv-hd-up', h.upstand, (x, n) => { x.upstand = n; }, { max: 10 });
    } else if (h.kind === 'ramp') {
      num(L('ls.h.f.width'), 'cv-hd-w', h.width, (x, n) => { x.width = n; }, { strict: true, max: 100 });
      num(L('ls.h.f.zs'), 'cv-hd-zs', h.zStart, (x, n) => { x.zStart = n; }, { blankOk: true, min: -1e6 });
      num(L('ls.h.f.ze'), 'cv-hd-ze', h.zEnd, (x, n) => { x.zEnd = n; }, { blankOk: true, min: -1e6 });
      num(t('ls.h.f.maxgrade'), 'cv-hd-mg', h.maxGrade, (x, n) => { x.maxGrade = n; }, { calc: false, strict: true, max: 100 });
      num(L('ls.h.f.landevery'), 'cv-hd-le', h.landingEvery, (x, n) => { x.landingEvery = n; }, { strict: true, max: 100 });
      num(L('ls.h.f.landing'), 'cv-hd-ll', h.landing, (x, n) => { x.landing = n; }, { strict: true, max: 100 });
      const r = rampLayout(h, sf, U());
      facts.push([t('ls.h.f.rise'), fixed(r.rise, 3) + ' ' + uLen()], [t('ls.h.length'), fixed(r.length, 2) + ' ' + uLen()], [t('ls.h.f.grade'), fixed(r.grade, 2) + ' %'], [t('ls.h.f.landings'), String(r.landings)]);   // i18n-ignore: a unit
      for (const c of r.checks) checks.push({ ok: c.ok, text: t('ls.h.chk.ramp.' + c.key + (c.ok ? '.ok' : '.bad'), { v: fixed(c.value, 2), max: fixed(c.limit, 2), need: fixed(r.need, 2), u: uLen() }) });
    } else if (h.kind === 'steps') {
      num(L('ls.h.f.width'), 'cv-hd-w', h.width, (x, n) => { x.width = n; }, { strict: true, max: 100 });
      num(L('ls.h.f.zb'), 'cv-hd-zb', h.zBottom, (x, n) => { x.zBottom = n; }, { blankOk: true, min: -1e6 });
      num(L('ls.h.f.zt'), 'cv-hd-zt', h.zTop, (x, n) => { x.zTop = n; }, { blankOk: true, min: -1e6 });
      num(L('ls.h.f.riser'), 'cv-hd-rm', h.riserMax, (x, n) => { x.riserMax = n; }, { strict: true, max: 10 });
      num(L('ls.h.f.going'), 'cv-hd-gm', h.goingMin, (x, n) => { x.goingMin = n; }, { strict: true, max: 10 });
      num(t('ls.h.f.maxrisers'), 'cv-hd-mr', h.maxRisers, (x, n) => { x.maxRisers = Math.max(2, Math.min(50, Math.round(n))); }, { calc: false, strict: true, max: 50 });
      const s = stepsLayout(h, sf, U());
      facts.push([t('ls.h.f.rise'), fixed(s.H, 3) + ' ' + uLen()], [t('ls.h.f.risers'), s.n ? t('ls.h.risers.v', { n: s.n, r: fixed(s.riser, 3), u: uLen() }) : '—'], [t('ls.h.f.treads'), s.n ? t('ls.h.treads.v', { n: s.treads, g: fixed(s.going, 3), u: uLen() }) : '—'], [t('ls.h.f.flights'), String(s.flights || 0)], [t('ls.h.f.run'), fixed(s.run, 2) + ' ' + uLen()]);
      checks.push({ ok: s.n > 0 && s.fits, text: s.n ? t(s.fits ? 'ls.h.chk.steps.ok' : 'ls.h.chk.steps.short', { need: fixed(s.need, 2), u: uLen() }) : t('ls.h.steps.flat') });
    }
    head.textContent = t('ls.h.head.' + h.kind);
    box.replaceChildren(el('div', { className: 'cv-props' }, ...fields),
      el('div', { className: 'cv-props', 'data-ls-hd-facts': '' }, ...facts.flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, v)])),
      ...checks.map((c) => el('p', { className: c.ok ? 'cv-note' : 'cv-report is-error', dataset: { lsHdCheck: c.ok ? 'ok' : 'bad' } }, c.text)),
      el('p', { className: 'cv-note' }, t('ls.h.note.' + h.kind)),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => ctx.command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    return true;
  }
  const areaOf = (pts) => pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p.x * q.y - q.x * p.y; }, 0) / 2;

  function overlay(c2d, toScreen, C, sel) {
    const h = isMine(sel) && find(sel.id);
    if (!h) return;
    c2d.save(); c2d.strokeStyle = C.action; c2d.lineWidth = 2.5;
    c2d.beginPath(); h.pts.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
    if (h.kind === 'paving') c2d.closePath();
    c2d.stroke(); c2d.restore();
  }

  return {
    menu, tools: TOOLS, closed: new Set(['ls-paving']), hints: Object.fromEntries(TOOLS.map((x) => [x, 'ls.h.hint.' + x.slice(3)])),
    command, click, finish, isMine, pick, props, grip, remove, overlay, updateTools,
    sceneItems: (unitPerMm) => hardSceneItems(LS(), surface(), U(), { unitPerMm, fixed: (v) => fixed(v, 2) }),
    elements: () => hardElements(LS(), surface(), U()),
    quantities: () => hardQuantities(LS(), surface(), U()),
  };
}
