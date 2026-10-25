/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline-ui.js — CivilCraft's Power lines workspace on the page (0.7 Track PL, docs/0.7-PART8.md). civilcraft.js calls
 * createPowerlines(ctx) once and asks it at the same hooks as the Landscape workspace (tool clicks, finishing a drawn line,
 * picking, grips, Properties, delete, the plan scene, the overlay, commands); everything power-line lives here and in the
 * DOM-free modules beside it. A design aid: every result says so; an engineer checks it.
 *
 *   ctx = the Landscape workspace's ctx (landscape-ui.js header) + selection(), network(), landscape() (the Landscape workspace: index() for
 *         PL.11's plant sizes)
 *   → { active(), setActive(on), command(c) → handled, ownsTool(t), hints, click(tool, w, s) → handled, finish(tool, pts) → done,
 *       closedTool(t), isMine(sel), props(sel, box, head) → shown, remove(sel) → removed, pick(w, tol) → sel | null, grip(sel),
 *       sceneItems(unitPerMm), overlay(ctx2d, toScreen, colors, sel), updateTools(), analyses(), issues(), lib(), profile }
 *
 * The workspace: Surface › More › Power lines workspace (or the Workspace select) hides the Design and GIS groups, shows Workspace +
 * Power lines, and puts the Power lines and Library sections at the top of the left panel; remembered in this browser
 * (localStorage civilcraft.workspace = 'powerlines'). Lowest tier (rule 19): lines are plan symbols and a 2D profile; no 3D.
 */

import { emptyPowerlines, exampleRules, supportRoles, ROLES } from './model.js';
import { analyzeLine } from './checks.js';
import { buildNetwork, voltageDrop, liveChecks } from './network.js';
import { routeLength, routeProfile, routeCrossings, lineUnderground } from './underground.js';
import { landscapeObstacles } from './landscape-obstacles.js';
import { wallLayout } from '../landscape/hardscape.js';
import { displayName } from '../landscape/plants.js';
import { createLibUi } from './lib-ui.js';
import { createProfileUi } from './profile-ui.js';
import { unitM, toForce, forceUnit } from './units.js';
import './layers.js';
import { t } from '../i18n.js';
import { fixed } from '../units.js';

const WS_KEY = 'civilcraft.workspace';
const DEF_KEY = 'civilcraft.powerline.defaults';
const TOOLS = ['pl-line', 'pl-support', 'pl-route', 'pl-equip', 'pl-obstacle'];
const HIDE_IN_PL = ['Design', 'GIS'];   // i18n-ignore: group keys (their aria-labels)
const STARTER_DEFAULTS = { conductor: 's-aluminium-alloy-19-3-15-mm', support: 's-pole-concrete-12-6500', equip: ['s-crossarm-1-5-m-3-phases'], cable: 's-aluminium-4-150-mm-lv', trench: 's-trench-footway-direct-burial', equipItem: 's-street-cabinet' };

export function createPowerlines(ctx) {
  const { el, root } = ctx;
  const P = () => ctx.project();
  const U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const S = () => P().state.powerlines || emptyPowerlines();
  const edit = (label, fn) => P().change(label, (s) => { if (!s.powerlines) s.powerlines = emptyPowerlines(); fn(s.powerlines); });
  let on = false;
  const libUi = createLibUi(ctx, { P, edit, U });
  const lib = () => libUi.lib();
  const um = () => unitM(U());
  const lenText = (v) => fixed(v, 2) + ' ' + (U() === 'm' ? 'm' : 'ft');   // i18n-ignore: units
  const forceText = (N) => fixed(toForce(N, U()), 0) + ' ' + forceUnit(U());

  // ---- defaults for new lines, routes and equipment (this browser) ----
  function defaults() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(DEF_KEY) || '{}') || {}; } catch { /* private window */ }
    const m = lib(), ok = (k) => (typeof k === 'string' && m.has(k) ? k : null);
    return { conductor: ok(d.conductor) || STARTER_DEFAULTS.conductor, support: ok(d.support) || STARTER_DEFAULTS.support,
      equip: Array.isArray(d.equip) ? d.equip.filter(ok) : STARTER_DEFAULTS.equip, cable: ok(d.cable) || STARTER_DEFAULTS.cable,
      trench: ok(d.trench) || STARTER_DEFAULTS.trench, equipItem: ok(d.equipItem) || STARTER_DEFAULTS.equipItem };
  }
  function remember(k, v) {
    try { const d = JSON.parse(localStorage.getItem(DEF_KEY) || '{}') || {}; d[k] = v; localStorage.setItem(DEF_KEY, JSON.stringify(d)); } catch { /* private window */ }
  }

  // ---- analyses: recomputed when the power lines or the ground change ----
  let surfIds = new WeakMap(), surfSeq = 0, memo = { key: '', analyses: new Map(), issues: [], net: null, drop: null };
  const surfKey = () => { const s = ctx.surface?.(); if (!s) return 0; if (!surfIds.has(s)) surfIds.set(s, ++surfSeq); return surfIds.get(s); };
  function compute() {
    const st = S();
    const ls = P().state.landscape, lsIdx = ctx.landscape?.()?.index?.() || null;
    const lsKey = ls && (st.rules.lsTrees || st.rules.lsWalls) ? JSON.stringify([ls.plants, ls.hedges, ls.beds, (ls.hardscape || []).filter((h) => h.kind === 'wall'), lsIdx?.size || 0]) : '';
    const key = JSON.stringify(st) + '|' + surfKey() + '|' + U() + '|' + libUi.own().length + '|' + lsKey;
    if (memo.key === key) return memo;
    const m = lib(), analyses = new Map();
    // 0.7 PL.11: what the Landscape puts above the ground counts as obstacles too (worked out again here, never saved)
    let lsObs = [];
    if (lsKey) {
      const surf = ctx.surface?.();
      try { lsObs = landscapeObstacles(ls, { index: lsIdx, units: U(), rules: st.rules, groundAt: ctx.groundAt, wallLayout: surf ? (w) => wallLayout(w, surf, U()) : null, nameOf: (sp) => displayName(sp, document.documentElement.lang || 'en') }); } catch { lsObs = []; }
    }
    const withLs = lsObs.length ? { ...st, obstacles: [...st.obstacles, ...lsObs] } : st;
    for (const l of st.lines) {
      try { analyses.set(l.id, analyzeLine(withLs, l, { lib: m, groundAt: ctx.groundAt, units: U() })); } catch (e) { analyses.set(l.id, { ok: false, issues: [{ code: 'crash', sev: 'error', vals: { why: String(e.message || e) } }], supports: [], spans: [], sections: [], ch: [] }); }
    }
    let net = null, drop = null, issues = [];
    try { net = buildNetwork(st, { units: U() }); drop = voltageDrop(net, st, m, { units: U() }); } catch { net = null; drop = null; }
    try { issues = liveChecks(st, m, { analyses, net, drop, units: U() }); } catch (e) { issues = [{ code: 'crash', sev: 'error', ref: null, vals: { why: String(e.message || e) } }]; }
    // underground: cover along each route against the ground, and crossings with pipes and other cables
    for (const r of st.routes) {
      try {
        const pr = routeProfile(r, { groundAt: ctx.groundAt, lib: m, units: U(), rules: st.rules });
        if (pr.ok === false) issues.push({ code: 'cover', sev: 'error', ref: { kind: 'route', id: r.id }, vals: { name: r.name, have: pr.minCover_m, need: pr.need_m } });
        if (pr.noGround) issues.push({ code: 'routeground', sev: 'warn', ref: { kind: 'route', id: r.id }, vals: { name: r.name } });
        for (const x of routeCrossings(r, st, ctx.network?.() || null, { groundAt: ctx.groundAt, lib: m, units: U() })) {
          if (x.ok === false) issues.push({ code: 'crossing', sev: 'error', ref: { kind: 'route', id: r.id }, vals: { name: r.name, with: t('pl.cross.' + x.kind), have: x.sep_m, need: x.need_m } });
        }
      } catch { /* a route with odd data: liveChecks already names what is missing */ }
    }
    memo = { key, analyses, issues, net, drop, lsObs };
    return memo;
  }
  const analysis = (id) => compute().analyses.get(id) || null;
  /** The cable routes and pipes under an overhead line (0.7 PL.12: shown in its profile). */
  const under = (id) => { const l = findLine(id); return l ? lineUnderground(l, S(), ctx.network?.() || null, { groundAt: ctx.groundAt, lib: lib(), units: U() }) : []; };

  // ---- toolbar ----
  const toolbar = root.querySelector('.cv-tools');
  // i18n-ignore: an icon class name (the next line)
  const btn = (cmd, icon, label, title) => el('button', { type: 'button', className: 'cv-tool', dataset: { cmd }, title }, el('i', { className: 'bi bi-' + icon, 'aria-hidden': 'true' }), el('span', {}, label));
  const menuItem = (cmd, label, title) => el('button', { type: 'button', role: 'menuitem', dataset: { cmd }, title }, label);
  const more = el('details', { className: 'cv-menu', dataset: { groupMenu: 'Power lines' } },   // i18n-ignore: the group's key
    el('summary', { className: 'cv-tool', title: t('pl.more.title') }, el('i', { className: 'bi bi-three-dots', 'aria-hidden': 'true' }), el('span', {}, t('toolbar.more'))),
    el('div', { className: 'cv-menu-list', role: 'menu' },
      menuItem('pl-rules', t('pl.tb.rules'), t('pl.tb.rules.title')),
      (() => { const b = menuItem('measure', t('ui.tb.measure'), t('ui.tb.measure.title')); b.setAttribute('role', 'menuitemcheckbox'); return b; })(),   // 0.7 PL.10: the plan's Measure tool (civilcraft.js)
      menuItem('pl-stringing', t('pl.tb.stringing'), t('pl.tb.stringing.title')),
      menuItem('pl-quantities', t('pl.tb.quantities'), t('pl.tb.quantities.title')),
      menuItem('pl-sheets', t('pl.tb.sheets'), t('pl.tb.sheets.title')),
      menuItem('pl-gis', t('pl.tb.gis'), t('pl.tb.gis.title')),
      menuItem('pl-don-out', t('pl.tb.donout'), t('pl.tb.donout.title')),
      menuItem('pl-don-in', t('pl.tb.donin'), t('pl.tb.donin.title'))));
  more.addEventListener('toggle', () => { if (more.open) updateTools(); });
  const plGroup = el('div', { className: 'cv-tool-group', role: 'group', 'aria-label': 'Power lines', dataset: { plGroup: '' }, hidden: true },   // i18n-ignore: the group's key
    el('span', { className: 'cv-tool-label', 'aria-hidden': 'true' }, t('pl.tb.group')),
    el('div', { className: 'cv-tool-row', dataset: { plRow: '' } },
      btn('pl-line', 'lightning-charge', t('pl.tb.line'), t('pl.tb.line.title')),
      btn('pl-support', 'plus-circle', t('pl.tb.support'), t('pl.tb.support.title')),
      btn('pl-route', 'bezier2', t('pl.tb.route'), t('pl.tb.route.title')),
      btn('pl-equip', 'box', t('pl.tb.equip'), t('pl.tb.equip.title')),
      btn('pl-obstacle', 'exclamation-diamond', t('pl.tb.obstacle'), t('pl.tb.obstacle.title')),
      btn('pl-profile', 'graph-down', t('pl.tb.profile'), t('pl.tb.profile.title')),
      more));
  const lsGroup = toolbar?.querySelector('[data-ls-group]:not(.cv-ls-wsgroup)');
  if (lsGroup) lsGroup.after(plGroup); else toolbar?.append(plGroup);
  // the Workspace select is the Landscape workspace's: Power lines adds its choice
  const wsSel = root.querySelector('[data-ls-workspace]');
  const wsGroup = root.querySelector('.cv-ls-wsgroup');
  if (wsSel && !wsSel.querySelector('option[value="powerlines"]')) wsSel.append(el('option', { value: 'powerlines' }, t('pl.ws.name')));
  wsSel?.addEventListener('change', () => setActive(wsSel.value === 'powerlines'));

  // ---- left panel: Power lines (lists, rules, checks) and the Library ----
  const left = root.querySelector('.cv-left');
  const plSec = el('section', { className: 'cv-sec cv-pl', dataset: { plSec: '' }, hidden: true, 'aria-labelledby': 'cv-pl-h' });
  if (left) left.prepend(plSec, libUi.section);
  const profile = createProfileUi(ctx, { P, edit, U, analysis, selectSupport: (lid, i) => { const l = S().lines.find((x) => x.id === lid); if (l?.supports[i]) ctx.select({ kind: 'pl-support', id: l.supports[i].id, line: lid }); },
    onLine: (lid) => ctx.select({ kind: 'pl-line', id: lid }), under });

  function renderSection() {
    const st = S(), memo0 = compute();
    const R = st.rules;
    const item = (sel, label, sub, bad) => {
      const li = el('li', { tabIndex: 0, className: 'cv-pl-item' + (bad ? ' is-bad' : ''), dataset: { plPick: sel.kind + ':' + sel.id } }, el('span', {}, label), sub ? el('span', { className: 'cv-pl-src' }, ' ' + sub) : '');
      const go = () => ctx.select(sel);
      li.addEventListener('click', go);
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      return li;
    };
    const lineErr = (id) => (memo0.analyses.get(id)?.issues || []).filter((x) => x.sev === 'error').length;
    const errs = memo0.issues.filter((x) => x.sev === 'error'), warns = memo0.issues.filter((x) => x.sev !== 'error');
    const checks = el('ul', { className: 'cv-pl-checks', 'data-pl-checks': '' }, ...memo0.issues.slice(0, 200).map((x) => {
    // i18n-ignore: an icon class name (the next line)
      const li = el('li', { tabIndex: 0, className: x.sev === 'error' ? 'is-bad' : 'is-warn', dataset: { plIssue: x.code } }, el('i', { className: 'bi bi-' + (x.sev === 'error' ? 'x-octagon' : 'exclamation-triangle'), 'aria-hidden': 'true' }), ' ', issueText(x));
      const go = () => { const s = selOfRef(x.ref); if (s) ctx.select(s); };
      li.addEventListener('click', go);
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      return li;
    }));
    plSec.replaceChildren(
      el('h2', { className: 'cv-h', id: 'cv-pl-h' }, t('pl.sec.head')),
      el('p', { className: 'cv-note' }, t('pl.sec.lede')),
      el('div', { className: 'cv-props' },
        el('span', { className: 'k' }, t('pl.sec.rules')), el('span', { className: 'v' }, R.name + (R.example ? ' ' + t('pl.rules.example.tag') : ''))),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pl-rules': '', onclick: () => command('pl-rules') }, t('pl.tb.rules'))),
      el('h3', { className: 'cv-h3' }, t('pl.sec.lines', { n: st.lines.length })),
      st.lines.length ? el('ul', { className: 'cv-pl-list', 'data-pl-lines': '' }, ...st.lines.map((l) => item({ kind: 'pl-line', id: l.id }, l.name, t('pl.sec.line.sub', { n: l.supports.length, err: lineErr(l.id) }), lineErr(l.id) > 0))) : el('p', { className: 'cv-note' }, t('pl.sec.lines.none')),
      el('h3', { className: 'cv-h3' }, t('pl.sec.routes', { n: st.routes.length })),
      st.routes.length ? el('ul', { className: 'cv-pl-list', 'data-pl-routes': '' }, ...st.routes.map((r) => item({ kind: 'pl-route', id: r.id }, r.name, lenText(routeLength(r)), false))) : el('p', { className: 'cv-note' }, t('pl.sec.routes.none')),
      el('p', { className: 'cv-note' }, t('pl.sec.more', { e: st.equipment.length, o: st.obstacles.length })),
      el('h3', { className: 'cv-h3', 'data-pl-checks-h': '' }, t('pl.sec.checks', { e: errs.length, w: warns.length })),
      memo0.issues.length ? checks : el('p', { className: 'cv-note', 'data-pl-checks-none': '' }, st.lines.length + st.routes.length ? t('pl.sec.checks.none') : t('pl.sec.checks.empty')));
  }
  function selOfRef(r) {
    if (!r) return null;
    const st = S();
    if (r.kind === 'support') { const l = st.lines.find((x) => x.supports.some((p) => p.id === r.id)); return l ? { kind: 'pl-support', id: r.id, line: l.id } : null; }
    if (r.kind === 'line') return { kind: 'pl-line', id: r.id };
    if (r.kind === 'span') return { kind: 'pl-line', id: r.line || r.id };
    return { kind: 'pl-' + (r.kind === 'equipment' ? 'equip' : r.kind), id: r.id };
  }
  function refName(r) {
    if (!r) return '';
    const st = S();
    if (r.kind === 'support') { for (const l of st.lines) { const p = l.supports.find((q) => q.id === r.id); if (p) return `${l.name} › ${p.name || ''}`; } return ''; }
    const list = r.kind === 'line' || r.kind === 'span' ? st.lines : r.kind === 'route' ? st.routes : r.kind === 'equipment' ? st.equipment : r.kind === 'obstacle' ? st.obstacles : [];
    return list.find((x) => x.id === (r.line || r.id))?.name || '';
  }
  const caseName = (id) => S().rules.cases.find((c) => c.id === id)?.name || id;
  /** An issue (checks.js or network.js) in words. Lengths are in metres inside: shown in the project's unit. */
  function issueText(x) {
    const v = x.vals || {}, m = (n) => (Number.isFinite(n) ? lenText(n / um()) : '');
    const where = [v.name || refName(x.ref), v.span ? t('pl.issue.span', { n: v.span }) : v.section ? t('pl.issue.section', { n: v.section }) : ''].filter(Boolean).join(', ');
    const args = { ...v, where, case: v.caseId ? caseName(v.caseId) : '', have: Number.isFinite(v.have) ? (x.code === 'swing' ? fixed(v.have, 1) + '°' : m(v.have)) : '', need: Number.isFinite(v.need) ? (x.code === 'strength' || x.code === 'fitting' ? forceText(v.need) : m(v.need)) : '',
      nominal: Number.isFinite(v.nominal) ? forceText(v.nominal) : '', rated: Number.isFinite(v.rated) ? forceText(v.rated) : '', value: Number.isFinite(v.value) ? forceText(v.value) : '', limit: Number.isFinite(v.limit) ? forceText(v.limit) : '',
      max: Number.isFinite(v.max) ? fixed(v.max, 1) + (x.code === 'swing' ? '°' : '') : '', I: Number.isFinite(v.I) ? fixed(v.I, 1) : '', ampacity: Number.isFinite(v.ampacity) ? fixed(v.ampacity, 0) : '',
      end: v.end === 'from' ? t('pl.issue.end.from') : v.end === 'to' ? t('pl.issue.end.to') : '', fields: Array.isArray(v.fields) ? v.fields.map((k) => t('pl.f.' + k.toLowerCase())).join(', ') : '', item: v.item || '', key: v.key || '',
      pct: Number.isFinite(v.pct) ? fixed(v.pct, 1) : '', why: v.why || '' };
    const k = 'pl.issue.' + x.code;
    const s = t(k, args);
    if (s === k) return t('pl.issue.other', { code: x.code, where });
    return where ? t('pl.issue.at', { where, what: s }) : s;
  }

  // ---- the workspace ----
  function setActive(v) {
    on = !!v;
    try { if (on) localStorage.setItem(WS_KEY, 'powerlines'); else if (localStorage.getItem(WS_KEY) === 'powerlines') localStorage.setItem(WS_KEY, 'civil'); } catch { /* private window */ }
    if (wsSel) { if (on) wsSel.value = 'powerlines'; else if (wsSel.value === 'powerlines') wsSel.value = 'civil'; }
    for (const g of toolbar?.querySelectorAll('.cv-tool-group') || []) {
      if (g.dataset.plGroup !== undefined) g.hidden = !on;
      else if (on && g.dataset.lsGroup !== undefined) g.hidden = !g.classList.contains('cv-ls-wsgroup');
      else if (HIDE_IN_PL.includes(g.getAttribute('aria-label'))) g.hidden = on || root.hasAttribute('data-landscape');
    }
    if (wsGroup && on) wsGroup.hidden = false;
    plSec.hidden = !on; libUi.section.hidden = !on;
    if (on) { renderSection(); libUi.render(); }
    if (!on && TOOLS.includes(ctx.tool())) ctx.setTool('select');
    if (!on) profile.hide();
    root.toggleAttribute('data-powerlines', on);
    updateTools();
    ctx.redraw();
  }
  try { if (localStorage.getItem(WS_KEY) === 'powerlines') queueMicrotask(() => setActive(true)); } catch { /* private window */ }

  function updateTools() {
    for (const b of root.querySelectorAll('[data-cmd^="pl-"], [data-cmd="powerlines"]')) {
      const c = b.dataset.cmd, mi = b.getAttribute('role') === 'menuitemcheckbox';
      if (TOOLS.includes(c)) b.setAttribute('aria-pressed', String(ctx.tool() === c));
      if (c === 'powerlines') b.setAttribute(mi ? 'aria-checked' : 'aria-pressed', String(on));
      if (c === 'pl-profile') b.setAttribute('aria-pressed', String(profile.shown()));
      if (c === 'pl-stringing' || c === 'pl-don-out') b.disabled = !S().lines.length;
      if (c === 'pl-quantities' || c === 'pl-gis' || c === 'pl-sheets') b.disabled = !(S().lines.length + S().routes.length + S().equipment.length);
    }
  }

  async function dialogs() { return (await import('./out-ui.js')).createOutUi(ctx, { P, edit, U, S, lib, compute, libUi, issueText, renderSection }); }
  let outUi = null;
  const out = async () => (outUi ??= await dialogs());

  function command(c) {
    switch (c) {
      case 'powerlines': setActive(!on); ctx.say(t(on ? 'pl.ws.on' : 'pl.ws.off')); return true;
      case 'pl-line': case 'pl-support': case 'pl-route': case 'pl-equip': case 'pl-obstacle':
        if (!on) setActive(true);
        if (c === 'pl-support' && !S().lines.length) { ctx.say(t('pl.support.needline')); return true; }
        ctx.setTool(ctx.tool() === c ? 'select' : c);
        if (ctx.tool() === c) ctx.say(t('pl.tool.' + c.slice(3)));
        updateTools();
        return true;
      case 'pl-profile': {
        if (!on) setActive(true);
        if (profile.shown()) { profile.hide(); updateTools(); return true; }
        const sel = ctx.selection?.() || null;
        const id = sel?.kind === 'pl-line' ? sel.id : sel?.kind === 'pl-support' ? sel.line : S().lines[0]?.id;
        if (!id) { ctx.say(t('pl.prof.need')); return true; }
        profile.show(id); updateTools();
        return true;
      }
      case 'pl-rules': case 'pl-rules-clear': case 'pl-stringing': case 'pl-quantities': case 'pl-sheets': case 'pl-gis': case 'pl-don-out': case 'pl-don-in':
        if (!on) setActive(true);
        out().then((o) => o.command(c, ctx.selection?.() || null)).catch((e) => ctx.say(t('pl.out.failed', { why: String(e.message || e) })));
        return true;
      default: return false;
    }
  }

  // ---- drawing ----
  const snapTol = () => (U() === 'm' ? 2 : 6);
  function nearestSupport(w, tol) {
    let best = null, bd = tol;
    for (const l of S().lines) l.supports.forEach((p, i) => { const d = Math.hypot(p.x - w.x, p.y - w.y); if (d < bd) { bd = d; best = { line: l, i, p }; } });
    return best;
  }
  function nearestEquip(w, tol) {
    let best = null, bd = tol;
    for (const e of S().equipment) { const d = Math.hypot(e.x - w.x, e.y - w.y); if (d < bd) { bd = d; best = e; } }
    return best;
  }
  function nearestSpan(w, tol) {
    let best = null, bd = tol;
    for (const l of S().lines) for (let i = 0; i < l.supports.length - 1; i++) {
      const a = l.supports[i], b = l.supports[i + 1], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
      if (!(L2 > 0)) continue;
      const tt = Math.max(0, Math.min(1, ((w.x - a.x) * dx + (w.y - a.y) * dy) / L2)), x = a.x + dx * tt, y = a.y + dy * tt, d = Math.hypot(w.x - x, w.y - y);
      if (d < bd) { bd = d; best = { line: l, i, x, y, t: tt }; }
    }
    return best;
  }
  function click(tool, w, s) {
    void s;
    if (tool === 'pl-equip') {
      const d = defaults(), id = P().nextId('e'), n = S().equipment.length + 1;
      edit(t('pl.undo.equip'), (st) => { st.equipment.push({ id, x: w.x, y: w.y, name: t('pl.equip.name', { n }), item: d.equipItem, load_kW: 0, pf: 0.95, source: false }); libUi.ensureInProject([d.equipItem], st); });
      ctx.select({ kind: 'pl-equip', id });
      ctx.say(t('pl.equip.done', { name: libUi.nameOf(d.equipItem) }));
      return true;
    }
    if (tool === 'pl-support') {
      const hit = nearestSpan(w, Infinity);
      if (!hit) { ctx.say(t('pl.support.needline')); return true; }
      const id = P().nextId('e'), d = defaults();
      edit(t('pl.undo.support'), (st) => {
        const l = st.lines.find((x) => x.id === hit.line.id);
        const prev = l.supports[hit.i];
        l.supports.splice(hit.i + 1, 0, { id, x: hit.x, y: hit.y, name: t('pl.support.name', { n: l.supports.length + 1 }), support: prev.support || d.support, equip: [...prev.equip], role: 'auto', ground: null, h: null, existing: false });
      });
      ctx.select({ kind: 'pl-support', id, line: hit.line.id });
      ctx.say(t('pl.support.done', { line: hit.line.name }));
      return true;
    }
    return false;   // lines, routes and obstacles collect points like any drawn line (civilcraft.js)
  }
  function finish(tool, pts) {
    const xy = pts.map((p) => ({ x: p.x, y: p.y }));
    if (tool === 'pl-line') {
      if (xy.length < 2) { ctx.say(t('pl.line.need2')); return false; }
      const d = defaults(), id = P().nextId('e'), n = S().lines.length + 1;
      const supports = xy.map((p, i) => ({ id: P().nextId('e'), ...p, name: t('pl.support.name', { n: i + 1 }), support: d.support, equip: [], role: 'auto', ground: null, h: null, existing: false }));
      edit(t('pl.undo.line'), (st) => {
        st.lines.push({ id, name: t('pl.line.name', { n }), conductor: d.conductor, phases: 3, circuits: 1, voltage_kV: 20, equip: [...d.equip], clearance: 'ground', supports });
        libUi.ensureInProject([d.conductor, d.support, ...d.equip], st);
      });
      ctx.select({ kind: 'pl-line', id });
      const r = analysis(id);
      ctx.say(t('pl.line.done', { n: supports.length, err: (r?.issues || []).filter((x) => x.sev === 'error').length }));
      return true;
    }
    if (tool === 'pl-route') {
      if (xy.length < 2) { ctx.say(t('pl.route.need2')); return false; }
      const d = defaults(), id = P().nextId('e'), n = S().routes.length + 1;
      const end = (q) => {
        const sp = nearestSupport(q, snapTol()), eq = nearestEquip(q, snapTol());
        if (eq && (!sp || Math.hypot(eq.x - q.x, eq.y - q.y) <= Math.hypot(sp.p.x - q.x, sp.p.y - q.y))) { q.x = eq.x; q.y = eq.y; return { equipment: eq.id }; }
        if (sp) { q.x = sp.p.x; q.y = sp.p.y; return { line: sp.line.id, support: sp.p.id }; }
        return null;
      };
      const from = end(xy[0]), to = end(xy[xy.length - 1]);
      edit(t('pl.undo.route'), (st) => { st.routes.push({ id, name: t('pl.route.name', { n }), pts: xy, cable: d.cable, trench: d.trench, count: 1, slack_pct: 3, from, to }); libUi.ensureInProject([d.cable, d.trench], st); });
      ctx.select({ kind: 'pl-route', id });
      ctx.say(t('pl.route.done', { len: lenText(routeLength({ pts: xy })), ends: (from ? 1 : 0) + (to ? 1 : 0) }));
      return true;
    }
    if (tool === 'pl-obstacle') {
      if (!xy.length) return false;
      const id = P().nextId('e'), n = S().obstacles.length + 1, rules = S().rules;
      edit(t('pl.undo.obstacle'), (st) => st.obstacles.push({ id, name: t('pl.obstacle.name', { n }), pts: xy, h: U() === 'm' ? 0 : 0, clearance: rules.clearances.some((c) => c.id === 'road') ? 'road' : rules.clearances[0].id }));
      ctx.select({ kind: 'pl-obstacle', id });
      ctx.say(t('pl.obstacle.done'));
      return true;
    }
    return false;
  }

  // ---- selection ----
  const isMine = (sel) => !!sel && /^pl-(line|support|route|equip|obstacle)$/.test(sel.kind);
  const findLine = (id) => S().lines.find((l) => l.id === id) || null;
  const findSupport = (sel) => { const l = findLine(sel.line); const i = l ? l.supports.findIndex((p) => p.id === sel.id) : -1; return i < 0 ? null : { l, i, p: l.supports[i] }; };
  const find = (kind, id) => (kind === 'pl-route' ? S().routes : kind === 'pl-equip' ? S().equipment : kind === 'pl-obstacle' ? S().obstacles : S().lines).find((x) => x.id === id) || null;
  function pick(w, tol) {
    if (!P().state.powerlines) return null;
    const sp = nearestSupport(w, tol * 1.5);
    if (sp) return { kind: 'pl-support', id: sp.p.id, line: sp.line.id };
    const eq = nearestEquip(w, tol * 1.5);
    if (eq) return { kind: 'pl-equip', id: eq.id };
    const sn = nearestSpan(w, tol);
    if (sn) return { kind: 'pl-line', id: sn.line.id };
    for (const r of S().routes) for (let i = 0; i < r.pts.length - 1; i++) if (segDist(w, r.pts[i], r.pts[i + 1]) < tol) return { kind: 'pl-route', id: r.id };
    for (const o of S().obstacles) {
      if (o.pts.length === 1 && Math.hypot(o.pts[0].x - w.x, o.pts[0].y - w.y) < tol * 1.5) return { kind: 'pl-obstacle', id: o.id };
      for (let i = 0; i < o.pts.length - 1; i++) if (segDist(w, o.pts[i], o.pts[i + 1]) < tol) return { kind: 'pl-obstacle', id: o.id };
    }
    return null;
  }
  const segDist = (w, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy, tt = L2 > 0 ? Math.max(0, Math.min(1, ((w.x - a.x) * dx + (w.y - a.y) * dy) / L2)) : 0; return Math.hypot(w.x - a.x - dx * tt, w.y - a.y - dy * tt); };
  function grip(sel) {
    if (!isMine(sel)) return null;
    if (sel.kind === 'pl-line') { const l = findLine(sel.id); return l ? { list: l.supports, label: t('pl.undo.move'), get: () => findLine(sel.id)?.supports } : null; }
    if (sel.kind === 'pl-support') { const f = findSupport(sel); return f ? { list: f.l.supports, only: f.i, label: t('pl.undo.move'), get: () => findLine(sel.line)?.supports } : null; }
    if (sel.kind === 'pl-equip') { const list = S().equipment, i = list.findIndex((x) => x.id === sel.id); return i < 0 ? null : { list, only: i, label: t('pl.undo.move'), get: () => P().state.powerlines?.equipment }; }
    const it = find(sel.kind, sel.id);
    return it ? { list: it.pts, label: t('pl.undo.move'), get: () => find(sel.kind, sel.id)?.pts } : null;
  }
  function remove(sel) {
    if (!isMine(sel)) return false;
    if (sel.kind === 'pl-support') {
      const f = findSupport(sel);
      if (!f) return false;
      if (f.l.supports.length <= 2) { ctx.say(t('pl.support.last2')); return true; }
      edit(t('pl.undo.delete'), (st) => { const l = st.lines.find((x) => x.id === sel.line); l.supports = l.supports.filter((p) => p.id !== sel.id); for (const r of st.routes) for (const k of ['from', 'to']) if (r[k]?.support === sel.id) r[k] = null; });
      ctx.say(t('pl.deleted', { name: f.p.name || '' }));
      return true;
    }
    const it = find(sel.kind, sel.id);
    if (!it) return false;
    const list = sel.kind === 'pl-route' ? 'routes' : sel.kind === 'pl-equip' ? 'equipment' : sel.kind === 'pl-obstacle' ? 'obstacles' : 'lines';
    edit(t('pl.undo.delete'), (st) => {
      st[list] = st[list].filter((x) => x.id !== sel.id);
      for (const r of st.routes) for (const k of ['from', 'to']) if (r[k] && (r[k].line === sel.id || r[k].equipment === sel.id)) r[k] = null;
    });
    if (sel.kind === 'pl-line' && profile.lineId === sel.id) profile.hide();
    ctx.say(t('pl.deleted', { name: it.name || '' }));
    return true;
  }

  // ---- Properties ----
  const facts = (rows) => el('div', { className: 'cv-props', 'data-pl-facts': '' }, ...rows.filter((r) => r && r[1] !== '' && r[1] != null).flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, String(v))]));
  const delBtn = () => el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => ctx.command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete')));
  const textIn = (id, value, onSet, max = 120) => { const i = el('input', { type: 'text', className: 'cv-input', id, value: value || '', maxLength: max }); i.addEventListener('change', () => onSet(i.value.trim().slice(0, max))); return i; };
  const numIn = (id, value, label, ok, onSet) => ctx.numInput(value ?? '', (v) => { const n = v.trim() === '' ? null : Number(v); if (!ok(n)) return false; onSet(n); return true; }, { label, id, calc: false });
  const issueList = (list) => (list.length ? el('ul', { className: 'cv-pl-checks', 'data-pl-issues': '' }, ...list.map((x) => el('li', { className: x.sev === 'error' ? 'is-bad' : 'is-warn' }, issueText(x)))) : el('p', { className: 'cv-note' }, t('pl.p.noissues')));
  /** A Clearance rule select with the button that opens the rules (0.7 PL.13); `none` = the label of a first "not set" choice. */
  const clearSel = (id, value, onSet, none = null) => {
    const R = S().rules, s2 = el('select', { className: 'cv-select', id }, ...(none ? [el('option', { value: '' }, none)] : []), ...R.clearances.map((c) => el('option', { value: c.id }, `${c.name} (${lenText(c.min_m / um())})`)));
    s2.value = value || '';
    s2.addEventListener('change', () => onSet(s2.value || null));
    return el('span', { className: 'cv-pl-clr' }, s2, el('button', { type: 'button', className: 'cv-linkbtn', 'data-pl-clr-rules': '', title: t('pl.p.clr.rules.title'), onclick: () => command('pl-rules-clear') }, t('pl.p.clr.rules')));
  };
  const designAid = () => el('p', { className: 'cv-note cv-pl-aid' }, t('pl.aid'));

  function props(sel, box, head) {
    if (!isMine(sel)) return false;
    const st = S(), R = st.rules;
    // the open profile follows the selection: picking another line (or one of its supports) on the plan shows that line
    const selLine = sel.kind === 'pl-line' ? sel.id : sel.kind === 'pl-support' ? sel.line : null;
    if (selLine && profile.shown() && profile.lineId !== selLine && findLine(selLine)) profile.show(selLine);
    if (sel.kind === 'pl-line') {
      const l = findLine(sel.id);
      if (!l) return false;
      const r = analysis(l.id);
      head.textContent = t('pl.p.line.head');
      const setL = (label, fn) => edit(label, (s) => { const x = s.lines.find((y) => y.id === l.id); fn(x, s); });
      const clr = clearSel('cv-pl-lclr', l.clearance || 'ground', (v) => setL(t('pl.undo.edit'), (x) => { x.clearance = v; }));
      const equipBox = el('div', { className: 'cv-pl-equip', 'data-pl-lequip': '' }, ...l.equip.map((k, i) => el('span', { className: 'cv-pl-chip' }, libUi.nameOf(k), ' ', el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t('pl.p.equip.remove'), onclick: () => setL(t('pl.undo.edit'), (x) => { x.equip.splice(i, 1); }) }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' })))),
        libUi.pickSelect('equipment', null, (k) => { if (k) { remember('equip', [...l.equip, k]); setL(t('pl.undo.edit'), (x, s) => { if (!x.equip.includes(k)) x.equip.push(k); libUi.ensureInProject([k], s); }); } }, { id: 'cv-pl-lequip-add', none: true }));
      const secRows = (r?.sections || []).map((S2, si) => {
        const gv = S2.solve?.ok ? caseName(S2.solve.governing) : t('pl.p.notsolved');
        const ed = S2.solve?.ok ? S2.solve.cases[R.cases[0].id] : null;
        return el('tr', {}, el('td', {}, String(si + 1)), el('td', { className: 'num' }, `${S2.from + 1}–${S2.to + 1}`), el('td', { className: 'num' }, S2.Lr != null ? lenText(S2.Lr / um()) : ''),
          el('td', { className: 'num' }, ed ? forceText(ed.H) : ''), el('td', {}, gv));
      });
      box.replaceChildren(el('div', { className: 'cv-props' },
        el('label', { for: 'cv-pl-lname' }, t('pl.p.name')), textIn('cv-pl-lname', l.name, (v) => setL(t('pl.undo.rename'), (x) => { x.name = v || x.name; })),
        el('label', { for: 'cv-pl-lcond' }, t('pl.p.conductor')), libUi.pickSelect('conductor', l.conductor, (k) => { remember('conductor', k); setL(t('pl.undo.edit'), (x, s) => { x.conductor = k; libUi.ensureInProject([k], s); }); }, { id: 'cv-pl-lcond' }),
        el('label', { for: 'cv-pl-lph' }, t('pl.p.phases')), numIn('cv-pl-lph', l.phases, t('pl.p.phases'), (n) => Number.isInteger(n) && n >= 1 && n <= 12, (n) => setL(t('pl.undo.edit'), (x) => { x.phases = n; })),
        el('label', { for: 'cv-pl-lci' }, t('pl.p.circuits')), numIn('cv-pl-lci', l.circuits, t('pl.p.circuits'), (n) => Number.isInteger(n) && n >= 1 && n <= 4, (n) => setL(t('pl.undo.edit'), (x) => { x.circuits = n; })),
        el('label', { for: 'cv-pl-lkv' }, t('pl.p.kv')), numIn('cv-pl-lkv', l.voltage_kV, t('pl.p.kv'), (n) => n !== null && n >= 0 && n <= 1200, (n) => setL(t('pl.undo.edit'), (x) => { x.voltage_kV = n; })),
        el('label', { for: 'cv-pl-lclr' }, t('pl.p.clearance')), clr,
        el('span', { className: 'k' }, t('pl.p.lequip')), equipBox),
        el('div', { className: 'cv-actions' },
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pl-prof-open': '', onclick: () => { profile.show(l.id); updateTools(); } }, t('pl.tb.profile')),
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pl-string-open': '', onclick: () => command('pl-stringing') }, t('pl.tb.stringing'))),
        facts([[t('pl.p.supports'), String(l.supports.length)], [t('pl.p.length'), lenText((r?.ch || [0]).slice(-1)[0] || 0)], [t('pl.p.sections'), String(r?.sections.length || 0)]]),
        (r?.sections || []).length ? el('table', { className: 'cv-groups', 'data-pl-sections': '' }, el('caption', { className: 'cv-note' }, t('pl.p.sec.caption')),
          el('thead', {}, el('tr', {}, ...['pl.p.sec.n', 'pl.p.sec.supports', 'pl.p.sec.lr', 'pl.p.sec.h', 'pl.p.sec.gov'].map((k) => el('th', { scope: 'col' }, t(k))))), el('tbody', {}, ...secRows)) : '',
        el('h3', { className: 'cv-h3' }, t('pl.p.issues')), issueList(r?.issues || []), designAid(), delBtn());
      return true;
    }
    if (sel.kind === 'pl-support') {
      const f = findSupport(sel);
      if (!f) return false;
      const { l, i, p } = f, r = analysis(l.id), sr = r?.supports[i];
      head.textContent = t('pl.p.support.head', { line: l.name });
      const setP = (label, fn) => edit(label, (s) => { const x = s.lines.find((y) => y.id === l.id).supports.find((q) => q.id === p.id); fn(x, s); });
      const role = el('select', { className: 'cv-select', id: 'cv-pl-srole' }, ...ROLES.map((x) => el('option', { value: x }, t('pl.role.' + x))));
      role.value = p.role;
      role.addEventListener('change', () => setP(t('pl.undo.edit'), (x) => { x.role = role.value; }));
      const ex = el('input', { type: 'checkbox', id: 'cv-pl-sex', checked: p.existing });
      ex.addEventListener('change', () => setP(t('pl.undo.edit'), (x) => { x.existing = ex.checked; }));
      const equipBox = el('div', { className: 'cv-pl-equip' }, ...p.equip.map((k, j) => el('span', { className: 'cv-pl-chip' }, libUi.nameOf(k), ' ', el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t('pl.p.equip.remove'), onclick: () => setP(t('pl.undo.edit'), (x) => { x.equip.splice(j, 1); }) }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' })))),
        libUi.pickSelect('equipment', null, (k) => { if (k) setP(t('pl.undo.edit'), (x, s) => { if (!x.equip.includes(k)) x.equip.push(k); libUi.ensureInProject([k], s); }); }, { id: 'cv-pl-sequip-add' }));
      const loadRows = sr ? R.cases.filter((c) => sr.loads[c.id]).map((c) => { const L0 = sr.loads[c.id]; return el('tr', { className: c.id === sr.worstCase ? 'is-cur' : '' }, el('td', {}, c.name), el('td', { className: 'num' }, forceText(L0.T)), el('td', { className: 'num' }, forceText(L0.L)), el('td', { className: 'num' }, forceText(L0.V)), el('td', { className: 'num' }, forceText(L0.Feq))); }) : [];
      const sug = sr?.suggest && sr.suggest !== p.support ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pl-suggest': '', onclick: () => setP(t('pl.undo.size'), (x, s) => { x.support = sr.suggest; libUi.ensureInProject([sr.suggest], s); }) }, t('pl.p.use', { name: libUi.nameOf(sr.suggest) })) : '';
      box.replaceChildren(el('div', { className: 'cv-props' },
        el('label', { for: 'cv-pl-sname' }, t('pl.p.name')), textIn('cv-pl-sname', p.name, (v) => setP(t('pl.undo.rename'), (x) => { x.name = v; }), 40),
        el('label', { for: 'cv-pl-sitem' }, t('pl.p.support')), libUi.pickSelect('support', p.support, (k) => { remember('support', k); setP(t('pl.undo.edit'), (x, s) => { x.support = k; libUi.ensureInProject([k], s); }); }, { id: 'cv-pl-sitem' }),
        el('label', { for: 'cv-pl-srole' }, t('pl.p.role')), role,
        el('label', { for: 'cv-pl-sh' }, t('pl.p.h')), numIn('cv-pl-sh', p.h, t('pl.p.h'), (n) => n === null || (n > 0 && n < 1000), (n) => setP(t('pl.undo.height'), (x) => { x.h = n; })),
        el('label', { for: 'cv-pl-sg' }, t('pl.p.ground')), numIn('cv-pl-sg', p.ground, t('pl.p.ground'), (n) => n === null || Math.abs(n) < 1e6, (n) => setP(t('pl.undo.edit'), (x) => { x.ground = n; })),
        el('label', { for: 'cv-pl-sx' }, t('pl.p.x')), numIn('cv-pl-sx', fixed(p.x, 3), t('pl.p.x'), (n) => n !== null && Number.isFinite(n), (n) => setP(t('pl.undo.move'), (x) => { x.x = n; })),
        el('label', { for: 'cv-pl-sy' }, t('pl.p.y')), numIn('cv-pl-sy', fixed(p.y, 3), t('pl.p.y'), (n) => n !== null && Number.isFinite(n), (n) => setP(t('pl.undo.move'), (x) => { x.y = n; })),
        el('span', { className: 'k' }, t('pl.p.sequip')), equipBox,
        el('label', { for: 'cv-pl-sex', className: 'cv-check' }, ex, ' ', t('pl.p.existing'))),
        el('p', { className: 'cv-note' }, p.h == null ? t('pl.p.h.note') : t('pl.p.h.own')),
        sr ? facts([[t('pl.p.roleis'), t('pl.role.' + sr.role)], [t('pl.p.turn'), fixed(r.angles[i] || 0, 1) + '°'], [t('pl.p.groundis'), sr.groundZ != null ? lenText(sr.groundZ) : t('pl.p.noground')],
          [t('pl.p.attach'), sr.attachZ != null ? lenText(sr.attachZ) : ''], [t('pl.p.worst'), sr.worstCase ? `${forceText(sr.worstFeq * (R.sizeFactor || 1))} (${caseName(sr.worstCase)})` : ''],
          [t('pl.p.nominal'), lib().get(p.support)?.nominal_N ? forceText(lib().get(p.support).nominal_N) : ''], [t('pl.p.swing'), sr.swing_deg != null ? fixed(sr.swing_deg, 1) + '°' : ''],
          [t('pl.p.found'), sr.foundation ? t('pl.p.found.v', { d: lenText(sr.foundation.depth_m / um()), dia: lenText(sr.foundation.dia_m / um()), v: U() === 'm' ? fixed(sr.foundation.volume_m3, 2) + ' m³' : fixed(sr.foundation.volume_m3 * 1.307951, 2) + ' yd³' }) : '']]) : '',
        sug ? el('div', { className: 'cv-actions' }, sug) : '',
        loadRows.length ? el('table', { className: 'cv-groups', 'data-pl-loads': '' }, el('caption', { className: 'cv-note' }, t('pl.p.loads.caption', { u: forceUnit(U()) })),
          el('thead', {}, el('tr', {}, ...['pl.p.loads.case', 'pl.p.loads.t', 'pl.p.loads.l', 'pl.p.loads.v', 'pl.p.loads.eq'].map((k) => el('th', { scope: 'col' }, t(k))))), el('tbody', {}, ...loadRows)) : '',
        el('h3', { className: 'cv-h3' }, t('pl.p.issues')), issueList((r?.issues || []).filter((x) => x.support === i || (x.span != null && (x.span === i || x.span === i - 1)))), designAid(), delBtn());
      return true;
    }
    if (sel.kind === 'pl-route') {
      const r = find('pl-route', sel.id);
      if (!r) return false;
      head.textContent = t('pl.p.route.head');
      const setR = (label, fn) => edit(label, (s) => { const x = s.routes.find((y) => y.id === r.id); fn(x, s); });
      const m = compute(), mine = m.issues.filter((x) => x.ref?.kind === 'route' && x.ref.id === r.id);
      box.replaceChildren(el('div', { className: 'cv-props' },
        el('label', { for: 'cv-pl-rname' }, t('pl.p.name')), textIn('cv-pl-rname', r.name, (v) => setR(t('pl.undo.rename'), (x) => { x.name = v || x.name; })),
        el('label', { for: 'cv-pl-rcable' }, t('pl.p.cable')), libUi.pickSelect('cable', r.cable, (k) => { remember('cable', k); setR(t('pl.undo.edit'), (x, s) => { x.cable = k; libUi.ensureInProject([k], s); }); }, { id: 'cv-pl-rcable' }),
        el('label', { for: 'cv-pl-rtrench' }, t('pl.p.trench')), libUi.pickSelect('trench', r.trench, (k) => { remember('trench', k); setR(t('pl.undo.edit'), (x, s) => { x.trench = k; libUi.ensureInProject([k], s); }); }, { id: 'cv-pl-rtrench' }),
        el('label', { for: 'cv-pl-rcount' }, t('pl.p.count')), numIn('cv-pl-rcount', r.count, t('pl.p.count'), (n) => Number.isInteger(n) && n >= 1 && n <= 64, (n) => setR(t('pl.undo.edit'), (x) => { x.count = n; })),
        el('label', { for: 'cv-pl-rslack' }, t('pl.p.slack')), numIn('cv-pl-rslack', r.slack_pct, t('pl.p.slack'), (n) => n !== null && n >= 0 && n <= 50, (n) => setR(t('pl.undo.edit'), (x) => { x.slack_pct = n; })),
        el('label', { for: 'cv-pl-rclr' }, t('pl.p.rclr')), clearSel('cv-pl-rclr', r.clearance, (v) => setR(t('pl.undo.edit'), (x) => { x.clearance = v; }), S().rules.ugCross ? t('pl.p.rclr.set') : t('pl.p.rclr.trench'))),
        facts([[t('pl.p.length'), lenText(routeLength(r))], [t('pl.p.from'), endText(r.from)], [t('pl.p.to'), endText(r.to)],
          [t('pl.p.current'), m.drop?.edges?.[r.id] ? t('pl.p.current.v', { i: fixed(m.drop.edges[r.id].I_A, 1), pct: m.drop.edges[r.id].load_pct != null ? fixed(m.drop.edges[r.id].load_pct, 0) : '—' }) : '']]),
        el('h3', { className: 'cv-h3' }, t('pl.p.issues')), issueList(mine), designAid(), delBtn());
      return true;
    }
    if (sel.kind === 'pl-equip') {
      const e = find('pl-equip', sel.id);
      if (!e) return false;
      head.textContent = t('pl.p.equip.head');
      const setE = (label, fn) => edit(label, (s) => { const x = s.equipment.find((y) => y.id === e.id); fn(x, s); });
      const src = el('input', { type: 'checkbox', id: 'cv-pl-esrc', checked: e.source });
      src.addEventListener('change', () => setE(t('pl.undo.edit'), (x) => { x.source = src.checked; }));
      const m = compute(), node = m.drop?.nodes?.[e.id];
      box.replaceChildren(el('div', { className: 'cv-props' },
        el('label', { for: 'cv-pl-ename' }, t('pl.p.name')), textIn('cv-pl-ename', e.name, (v) => setE(t('pl.undo.rename'), (x) => { x.name = v; }), 60),
        el('label', { for: 'cv-pl-eitem' }, t('pl.p.item')), libUi.pickSelect('equipment', e.item, (k) => { remember('equipItem', k); setE(t('pl.undo.edit'), (x, s) => { x.item = k; libUi.ensureInProject([k], s); }); }, { id: 'cv-pl-eitem' }),
        el('label', { for: 'cv-pl-ekw' }, t('pl.p.kw')), numIn('cv-pl-ekw', e.load_kW, t('pl.p.kw'), (n) => n !== null && n >= 0 && n <= 1e6, (n) => setE(t('pl.undo.edit'), (x) => { x.load_kW = n; })),
        el('label', { for: 'cv-pl-epf' }, t('pl.p.pf')), numIn('cv-pl-epf', e.pf, t('pl.p.pf'), (n) => n !== null && n >= 0.1 && n <= 1, (n) => setE(t('pl.undo.edit'), (x) => { x.pf = n; })),
        el('label', { for: 'cv-pl-esrc', className: 'cv-check' }, src, ' ', t('pl.p.source'))),
        facts([[t('pl.p.drop'), node ? t('pl.p.drop.v', { pct: fixed(node.drop_pct, 2), u: fixed(node.U_kV * 1000, 0) }) : '']]),
        el('h3', { className: 'cv-h3' }, t('pl.p.issues')), issueList(m.issues.filter((x) => x.ref?.kind === 'equipment' && x.ref.id === e.id)), delBtn());
      return true;
    }
    const o = find('pl-obstacle', sel.id);
    if (!o) return false;
    head.textContent = t('pl.p.obstacle.head');
    const setO = (label, fn) => edit(label, (s) => { const x = s.obstacles.find((y) => y.id === o.id); fn(x, s); });
    const clr = clearSel('cv-pl-oclr', o.clearance, (v) => setO(t('pl.undo.edit'), (x) => { x.clearance = v; }));
    box.replaceChildren(el('div', { className: 'cv-props' },
      el('label', { for: 'cv-pl-oname' }, t('pl.p.name')), textIn('cv-pl-oname', o.name, (v) => setO(t('pl.undo.rename'), (x) => { x.name = v; }), 60),
      el('label', { for: 'cv-pl-oh' }, t('pl.p.oh')), numIn('cv-pl-oh', o.h, t('pl.p.oh'), (n) => n !== null && n >= 0 && n < 1000, (n) => setO(t('pl.undo.edit'), (x) => { x.h = n; })),
      el('label', { for: 'cv-pl-oclr' }, t('pl.p.clearance')), clr),
      el('p', { className: 'cv-note' }, t('pl.p.obstacle.note')), delBtn());
    return true;
  }
  function endText(ref) {
    if (!ref) return t('pl.p.end.none');
    if (ref.equipment) return S().equipment.find((x) => x.id === ref.equipment)?.name || ref.equipment;
    const l = findLine(ref.line), p = l?.supports.find((x) => x.id === ref.support);
    return p ? `${l.name} › ${p.name}` : t('pl.p.end.none');
  }

  // ---- plan (scene) and overlay ----
  function sceneItems(unitPerMm) {
    const st = P().state.powerlines;
    if (!st) return [];
    const items = [], r = 1.1 * unitPerMm, txt = 1.8;
    for (const l of st.lines) {
      if (l.supports.length > 1) items.push({ layer: 'C-POWR-OVHD', kind: 'poly', pts: l.supports.map((p) => ({ x: p.x, y: p.y })) });
      const roles = supportRoles(l, st.rules);
      l.supports.forEach((p, i) => {
        if (roles[i] === 'deadend') items.push({ layer: 'C-POWR-POLE', kind: 'poly', pts: [{ x: p.x - r, y: p.y - r }, { x: p.x + r, y: p.y - r }, { x: p.x + r, y: p.y + r }, { x: p.x - r, y: p.y + r }], closed: true });
        else items.push({ layer: 'C-POWR-POLE', kind: 'arc', c: { x: p.x, y: p.y }, r, a0: 0, a1: 2 * Math.PI });
        if (roles[i] === 'angle') items.push({ layer: 'C-POWR-POLE', kind: 'arc', c: { x: p.x, y: p.y }, r: r * 0.45, a0: 0, a1: 2 * Math.PI });
        if (p.existing) items.push({ layer: 'C-POWR-POLE', kind: 'poly', pts: [{ x: p.x - r, y: p.y - r }, { x: p.x + r, y: p.y + r }] });
        if (p.name) items.push({ layer: 'C-POWR-TEXT', kind: 'text', x: p.x + r * 1.4, y: p.y + r * 1.4, mm: txt, rot: 0, text: p.name, align: 'left' });
      });
      const m = l.supports[Math.floor((l.supports.length - 1) / 2)], n2 = l.supports[Math.floor((l.supports.length - 1) / 2) + 1];
      if (m && n2) items.push({ layer: 'C-POWR-TEXT', kind: 'text', x: (m.x + n2.x) / 2, y: (m.y + n2.y) / 2 + r * 2, mm: txt, rot: 0, text: `${l.name} — ${libUi.nameOf(l.conductor)}`, align: 'center' });
    }
    for (const rt of st.routes) {
      items.push({ layer: 'C-POWR-UNDG', kind: 'poly', pts: rt.pts, dashed: true });
      const a = rt.pts[Math.floor((rt.pts.length - 1) / 2)], b = rt.pts[Math.floor((rt.pts.length - 1) / 2) + 1] || a;
      items.push({ layer: 'C-POWR-TEXT', kind: 'text', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + r * 1.5, mm: txt, rot: 0, text: rt.name, align: 'center' });
    }
    for (const e of st.equipment) {
      const s = r * 1.3;
      items.push({ layer: 'C-POWR-EQPM', kind: 'poly', pts: [{ x: e.x - s, y: e.y - s }, { x: e.x + s, y: e.y - s }, { x: e.x + s, y: e.y + s }, { x: e.x - s, y: e.y + s }], closed: true });
      if (e.source) items.push({ layer: 'C-POWR-EQPM', kind: 'poly', pts: [{ x: e.x - s, y: e.y - s }, { x: e.x + s, y: e.y + s }] }, { layer: 'C-POWR-EQPM', kind: 'poly', pts: [{ x: e.x - s, y: e.y + s }, { x: e.x + s, y: e.y - s }] });
      if (e.name) items.push({ layer: 'C-POWR-TEXT', kind: 'text', x: e.x + s * 1.3, y: e.y, mm: txt, rot: 0, text: e.name, align: 'left' });
    }
    for (const o of st.obstacles) {
      if (o.pts.length === 1) { const p = o.pts[0]; items.push({ layer: 'C-POWR-OBST', kind: 'poly', pts: [{ x: p.x - r, y: p.y }, { x: p.x, y: p.y + r }, { x: p.x + r, y: p.y }, { x: p.x, y: p.y - r }], closed: true }); }
      else items.push({ layer: 'C-POWR-OBST', kind: 'poly', pts: o.pts, dashed: true });
      if (o.name) items.push({ layer: 'C-POWR-TEXT', kind: 'text', x: o.pts[0].x + r, y: o.pts[0].y - r * 2, mm: txt, rot: 0, text: o.name, align: 'left' });
    }
    return items;
  }
  function overlay(c2d, toScreen, C, sel) {
    if (!P().state.powerlines) return;
    const m = compute();
    c2d.save();
    // what fails, in red, while the workspace is open
    if (on) {
      c2d.strokeStyle = C.red || '#c00'; c2d.lineWidth = 3;
      for (const l of S().lines) {
        const r = m.analyses.get(l.id);
        for (const x of r?.issues || []) {
          if (x.sev !== 'error') continue;
          if (x.support != null && l.supports[x.support]) { const q = toScreen(l.supports[x.support].x, l.supports[x.support].y); c2d.beginPath(); c2d.arc(q.x, q.y, 11, 0, 2 * Math.PI); c2d.stroke(); }
          if (x.span != null && l.supports[x.span + 1]) { const a = toScreen(l.supports[x.span].x, l.supports[x.span].y), b = toScreen(l.supports[x.span + 1].x, l.supports[x.span + 1].y); c2d.beginPath(); c2d.moveTo(a.x, a.y); c2d.lineTo(b.x, b.y); c2d.stroke(); }
        }
      }
    }
    const gp = ctx.tool() === 'select' ? grip(sel) : null;
    if (gp) {
      c2d.fillStyle = C.bg; c2d.strokeStyle = C.action; c2d.lineWidth = 1.5;
      for (const [i, p] of gp.list.entries()) { if (gp.only >= 0 && i !== gp.only) continue; const q = toScreen(p.x, p.y); c2d.fillRect(q.x - 4.5, q.y - 4.5, 9, 9); c2d.strokeRect(q.x - 4.5, q.y - 4.5, 9, 9); }
    }
    if (isMine(sel)) {
      c2d.strokeStyle = C.action; c2d.lineWidth = 2.5;
      const path = (pts) => { c2d.beginPath(); pts.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); }); c2d.stroke(); };
      if (sel.kind === 'pl-line') { const l = findLine(sel.id); if (l) path(l.supports); }
      else if (sel.kind === 'pl-support') { const f = findSupport(sel); if (f) { const q = toScreen(f.p.x, f.p.y); c2d.beginPath(); c2d.arc(q.x, q.y, 9, 0, 2 * Math.PI); c2d.stroke(); } }
      else if (sel.kind === 'pl-equip') { const e = find('pl-equip', sel.id); if (e) { const q = toScreen(e.x, e.y); c2d.strokeRect(q.x - 9, q.y - 9, 18, 18); } }
      else { const it = find(sel.kind, sel.id); if (it) path(it.pts); }
    }
    c2d.restore();
  }
  function refreshAfterChange() { if (on) renderSection(); if (profile.shown()) profile.redraw(); }

  return {
    active: () => on, setActive, command, ownsTool: (tl) => TOOLS.includes(tl), click, finish, closedTool: () => false,
    hints: { 'pl-line': 'pl.hint.line', 'pl-support': 'pl.hint.support', 'pl-route': 'pl.hint.route', 'pl-equip': 'pl.hint.equip', 'pl-obstacle': 'pl.hint.obstacle' },
    isMine, props, remove, pick, grip, sceneItems, overlay, updateTools, refreshAfterChange,
    analyses: () => compute().analyses, issues: () => compute().issues, lib, libUi, profile, issueText, state: S, exampleRules,
  };
}
