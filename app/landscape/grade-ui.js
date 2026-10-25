/* SPDX-License-Identifier: Apache-2.0 */
/**
 * grade-ui.js — the Landscape workspace's grading on the page (0.7 LD.3, session `landscape`): the Grade menu, drawing
 * platforms / berms / swales / grading areas, spot elevations and edited contours (dragged on the plan like any grip, one undo
 * step each), Properties with the item's cut and fill live, and the grading checks (slope analysis, flow arrows and ponding).
 * landscape-ui.js composes it; the maths is grade.js.
 *
 *   createGradeUi(ctx, { edit, LS, U }) → { menu, tools, closed (Set), hints, command(c), click(tool, w), finish(tool, pts), isMine(sel),
 *     pick(w, tol), props(sel, box, head), grip(sel), remove(sel), sceneItems(unitPerMm), overlay(c2d, toScreen, C), section, renderSection() }
 */

import { defaults, meanGround, slopeClasses, ponding, gradeSceneItems } from './grade.js';
import { inside, edgeDist } from './planting.js';
import { t } from '../i18n.js';
import { fixed } from '../units.js';

const VIEW_KEY = 'civilcraft.landscape.checks';
const TOOLS = ['ls-platform', 'ls-berm', 'ls-swale', 'ls-area', 'ls-spot', 'ls-contour'];
const SLOPE_TOKENS = ['green', 'ochre', 'red'];   // the theme's layer colours (paper / model)

export function createGradeUi(ctx, { edit, LS, U }) {
  const { el } = ctx;
  const P = () => ctx.project();
  let view = { slope: false, limits: [5, 33.3], flow: false };
  try { const v = JSON.parse(localStorage.getItem(VIEW_KEY) || 'null'); if (v && typeof v === 'object') view = { slope: !!v.slope, flow: !!v.flow, limits: Array.isArray(v.limits) && v.limits.length === 2 && v.limits.every((x) => Number.isFinite(x) && x > 0 && x < 1000) ? v.limits : view.limits }; } catch { /* private window */ }
  const saveView = () => { try { localStorage.setItem(VIEW_KEY, JSON.stringify(view)); } catch { /* private window */ } };
  const list = () => LS().grading || [];
  const find = (id) => list().find((g) => g.id === id) || null;
  const uLen = () => (U() === 'm' ? 'm' : 'ft');
  const surface = () => ctx.surface();
  const volUnit = () => (U() === 'm' ? { per: 1, u: 'm³' } : { per: 27, u: 'CY' });   // i18n-ignore: unit symbols

  // ---- the Grade menu ----
  const item = (cmd, label, title, role = 'menuitemcheckbox') => el('button', { type: 'button', role, dataset: { cmd }, title }, label);
  const menu = el('details', { className: 'cv-menu', dataset: { groupMenu: 'Grade' } },   // i18n-ignore: the menu's key
    el('summary', { className: 'cv-tool', title: t('ls.gr.menu.title') }, el('i', { className: 'bi bi-triangle', 'aria-hidden': 'true' }), el('span', {}, t('ls.gr.menu'))),
    el('div', { className: 'cv-menu-list', role: 'menu' },
      item('ls-platform', t('ls.gr.platform'), t('ls.gr.platform.title')),
      item('ls-berm', t('ls.gr.berm'), t('ls.gr.berm.title')),
      item('ls-swale', t('ls.gr.swale'), t('ls.gr.swale.title')),
      item('ls-area', t('ls.gr.area'), t('ls.gr.area.title')),
      item('ls-spot', t('ls.gr.spot'), t('ls.gr.spot.title')),
      item('ls-contour', t('ls.gr.contour'), t('ls.gr.contour.title')),
      el('hr'),
      item('ls-slope', t('ls.gr.slope'), t('ls.gr.slope.title')),
      item('ls-flow', t('ls.gr.flow'), t('ls.gr.flow.title'))));

  function updateTools(tool) {
    for (const b of menu.querySelectorAll('[data-cmd]')) {
      const c = b.dataset.cmd;
      if (TOOLS.includes(c)) b.setAttribute('aria-checked', String(tool === c));
      if (c === 'ls-slope') b.setAttribute('aria-checked', String(view.slope));
      if (c === 'ls-flow') b.setAttribute('aria-checked', String(view.flow));
    }
  }

  function command(c) {
    if (TOOLS.includes(c)) {
      if (!surface()) { ctx.say(t('ls.gr.need.surface')); return true; }
      if ((c === 'ls-spot' || c === 'ls-contour') && !list().some((g) => g.kind === 'area')) { ctx.say(t('ls.gr.need.area')); return true; }
      ctx.setTool(ctx.tool() === c ? 'select' : c);
      if (ctx.tool() === c) ctx.say(t('ls.gr.hint.' + c.slice(3)));
      return true;
    }
    if (c === 'ls-slope' || c === 'ls-flow') {
      view[c === 'ls-slope' ? 'slope' : 'flow'] = !view[c === 'ls-slope' ? 'slope' : 'flow'];
      saveView(); renderSection(); ctx.redraw();
      return true;
    }
    return false;
  }

  // ---- drawing ----
  function finish(tool, pts) {
    const xy = pts.map((p) => ({ x: p.x, y: p.y })), d = defaults(U());
    const kind = tool.slice(3);
    if (kind === 'swale' ? xy.length < 2 : xy.length < 3) { ctx.say(t(kind === 'swale' ? 'ls.hedge.need2' : 'ls.bed.need3')); return false; }
    const id = P().nextId('l'), n = list().filter((g) => g.kind === kind).length + 1;
    const name = t('ls.gr.name.' + kind, { n });
    const rec = kind === 'platform' ? { id, kind, name, pts: xy, z: null, fall: null, cut: d.cut, fill: d.fill }
      : kind === 'berm' ? { id, kind, name, pts: xy, height: d.height, cut: d.cut, fill: d.fill }
        : kind === 'swale' ? { id, kind, name, pts: xy, depth: d.depth, bottom: d.bottom, side: d.side, fall: null }
          : { id, kind, name, pts: xy, spots: [], contours: [] };
    if (kind === 'platform') { const mg = meanGround(surface(), xy); if (mg !== null) rec.z = Number(mg.toFixed(2)); }
    edit(t('ls.gr.undo.draw', { name }), (l) => { l.grading = [...(l.grading || []), rec]; });
    ctx.select({ kind: 'ls-grade', id });
    const v = itemVolume(id);
    ctx.say(v ? t('ls.gr.done', { name, cut: fixed(v.cut, 1), fill: fixed(v.fill, 1), u: volUnit().u }) : t('ls.gr.done.nov', { name }));
    return true;
  }
  function click(tool, w) {
    if (tool !== 'ls-spot' && tool !== 'ls-contour') return false;
    const area = [...list()].reverse().find((g) => g.kind === 'area' && inside(w.x, w.y, g.pts));
    if (!area) { ctx.say(t('ls.gr.need.inside')); return true; }
    const sf = surface();
    if (tool === 'ls-spot') {
      const z = sf?.elevationAt(w.x, w.y, 1e-6);
      const sid = 's' + nextSub(area.spots);
      edit(t('ls.gr.undo.spot'), () => { find(area.id).spots.push({ id: sid, x: w.x, y: w.y, z: Number((z ?? 0).toFixed(2)) }); });
      ctx.select({ kind: 'ls-grade', id: area.id, sub: sid });
      ctx.say(t('ls.gr.spot.done', { z: fixed(z ?? 0, 2) }));
      return true;
    }
    // edit a contour: the shown surface's contour nearest the click, at the display interval, cut to the area
    const interval = Number(P().state.display.interval) || 1;
    const z0 = sf?.elevationAt(w.x, w.y, 1e-6);
    if (z0 == null) { ctx.say(t('ls.g.err.off')); return true; }
    const level = Math.round(z0 / interval) * interval;
    let best = null, bd = Infinity;
    for (const c of sf.contours(interval)) {
      if (Math.abs(c.z - level) > 1e-9) continue;
      const d = edgeDist(w.x, w.y, c.pts, false);
      if (d < bd) { bd = d; best = c; }
    }
    if (!best) { ctx.say(t('ls.gr.contour.none', { z: fixed(level, 2) })); return true; }
    const pts = best.pts.filter((p) => inside(p.x, p.y, area.pts)).map((p) => ({ x: p.x, y: p.y }));
    const keep = thin(pts, Math.max(interval, Math.sqrt(Math.abs(polyArea(area.pts))) / 40));
    if (keep.length < 2) { ctx.say(t('ls.gr.contour.none', { z: fixed(level, 2) })); return true; }
    const cid = 'c' + nextSub(area.contours);
    edit(t('ls.gr.undo.contour'), () => { find(area.id).contours.push({ id: cid, z: level, pts: keep }); });
    ctx.select({ kind: 'ls-grade', id: area.id, sub: cid });
    ctx.say(t('ls.gr.contour.done', { z: fixed(level, 2), n: keep.length }));
    return true;
  }
  const nextSub = (arr) => arr.reduce((m, x) => Math.max(m, Number(String(x.id).slice(1)) || 0), 0) + 1;
  function thin(pts, tol) { const out = []; for (const p of pts) if (!out.length || Math.hypot(p.x - out.at(-1).x, p.y - out.at(-1).y) >= tol) out.push(p); if (pts.length && out.at(-1) !== pts.at(-1)) out.push(pts.at(-1)); return out.slice(0, 400); }
  function polyArea(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p.x * q.y - q.x * p.y; } return a / 2; }

  // ---- selection ----
  const isMine = (sel) => sel?.kind === 'ls-grade';
  function pick(w, tol) {
    for (const g of [...list()].reverse()) {
      if (g.kind === 'area') {
        for (const s of g.spots) if (Math.hypot(s.x - w.x, s.y - w.y) <= tol * 1.5) return { kind: 'ls-grade', id: g.id, sub: s.id };
        for (const c of g.contours) if (edgeDist(w.x, w.y, c.pts, false) <= tol) return { kind: 'ls-grade', id: g.id, sub: c.id };
      }
      if (g.kind === 'swale' ? edgeDist(w.x, w.y, g.pts, false) <= tol * 2 : inside(w.x, w.y, g.pts) || edgeDist(w.x, w.y, g.pts) <= tol) return { kind: 'ls-grade', id: g.id };
    }
    return null;
  }
  /** Grips: a spot or an edited contour's vertices when one is selected, else the item's own corners. */
  function grip(sel) {
    if (!isMine(sel)) return null;
    const g = find(sel.id);
    if (!g) return null;
    if (g.kind === 'area' && sel.sub?.startsWith('s')) return { list: g.spots, label: t('ls.gr.undo.spotmove'), get: () => find(sel.id)?.spots };
    if (g.kind === 'area' && sel.sub?.startsWith('c')) { const c = g.contours.find((x) => x.id === sel.sub); if (c) return { list: c.pts, label: t('ls.gr.undo.contourmove'), get: () => find(sel.id)?.contours.find((x) => x.id === sel.sub)?.pts }; }
    return { list: g.pts, label: t('ls.gr.undo.corner'), get: () => find(sel.id)?.pts };
  }
  function remove(sel) {
    if (!isMine(sel)) return false;
    const g = find(sel.id);
    if (!g) return false;
    if (sel.sub) {
      const k = sel.sub.startsWith('s') ? 'spots' : 'contours';
      edit(t('ls.gr.undo.subdel'), () => { const a = find(sel.id); a[k] = a[k].filter((x) => x.id !== sel.sub); });
      return true;
    }
    edit(t('ls.undo.delete'), (l) => { l.grading = l.grading.filter((x) => x.id !== sel.id); });
    ctx.say(t('ls.deleted', { name: g.name }));
    return true;
  }
  function itemVolume(id) {
    const v = P().volumes();
    const it = v?.items?.find((x) => x.id === id);
    if (!it) return null;
    const { per } = volUnit();
    return { cut: it.cut / per, fill: it.fill / per, totalCut: v.cut / per, totalFill: v.fill / per };
  }
  function problemsOf(id) {
    const g = P().graded();
    const it = g.items?.find((x) => x.id === id);
    return it ? it.problems || [] : [];
  }

  function props(sel, box, head) {
    if (!isMine(sel)) return false;
    const g = find(sel.id);
    if (!g) return false;
    const fields = [];
    const num = (label, id, value, set, { calc = true, blankOk = false } = {}) => {
      const inp = ctx.numInput(value ?? '', (v) => {
        const n = v.trim() === '' ? null : Number(v);
        if (n === null ? !blankOk : !Number.isFinite(n)) return false;
        if (set(n) === false) return false;
        return true;
      }, { label, id, calc });
      fields.push(el('label', { for: id }, label), inp);
    };
    const put = (label, fn) => edit(label, () => fn(find(g.id)));
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-gr-name', value: g.name, maxLength: 120 });
    nm.addEventListener('change', () => put(t('ls.undo.rename'), (x) => { x.name = nm.value.trim().slice(0, 120) || g.name; }));
    fields.push(el('label', { for: 'cv-gr-name' }, t('ls.b.name')), nm);
    const notes = [];
    if (g.kind === 'platform') {
      num(t('ls.gr.f.z', { u: uLen() }), 'cv-gr-z', g.z, (n) => put(t('ls.gr.undo.z'), (x) => { x.z = n; }), { blankOk: true });
      num(t('ls.gr.f.fall'), 'cv-gr-fall', g.fall?.pct, (n) => { if (n !== null && !(n > 0 && n <= 100)) return false; put(t('ls.gr.undo.fall'), (x) => { x.fall = n === null ? null : { pct: n, dir: x.fall?.dir ?? 0 }; }); }, { calc: false, blankOk: true });
      num(t('ls.gr.f.dir'), 'cv-gr-dir', g.fall?.dir, (n) => { if (n === null || !g.fall) return false; put(t('ls.gr.undo.fall'), (x) => { x.fall = { pct: x.fall.pct, dir: ((n % 360) + 360) % 360 }; }); }, { calc: false });
      notes.push(g.z == null ? t('ls.gr.z.ground') : '', g.fall ? t('ls.gr.fall.note', { pct: g.fall.pct, dir: g.fall.dir }) : '');
    }
    if (g.kind === 'berm') num(t('ls.gr.f.height', { u: uLen() }), 'cv-gr-h', g.height, (n) => { if (!(n > 0)) return false; put(t('ls.gr.undo.height'), (x) => { x.height = n; }); });
    if (g.kind === 'platform' || g.kind === 'berm') {
      num(t('ls.gr.f.cut'), 'cv-gr-cut', g.cut, (n) => { if (!(n > 0 && n <= 100)) return false; put(t('ls.gr.undo.slopes'), (x) => { x.cut = n; }); }, { calc: false });
      num(t('ls.gr.f.fill'), 'cv-gr-fill', g.fill, (n) => { if (!(n > 0 && n <= 100)) return false; put(t('ls.gr.undo.slopes'), (x) => { x.fill = n; }); }, { calc: false });
    }
    if (g.kind === 'swale') {
      num(t('ls.gr.f.depth', { u: uLen() }), 'cv-gr-depth', g.depth, (n) => { if (!(n > 0)) return false; put(t('ls.gr.undo.swale'), (x) => { x.depth = n; }); });
      num(t('ls.gr.f.bottom', { u: uLen() }), 'cv-gr-bottom', g.bottom, (n) => { if (!(n >= 0)) return false; put(t('ls.gr.undo.swale'), (x) => { x.bottom = n; }); });
      num(t('ls.gr.f.side'), 'cv-gr-side', g.side, (n) => { if (!(n > 0 && n <= 100)) return false; put(t('ls.gr.undo.swale'), (x) => { x.side = n; }); }, { calc: false });
      num(t('ls.gr.f.sfall'), 'cv-gr-sfall', g.fall, (n) => { if (n !== null && !(n > 0 && n <= 100)) return false; put(t('ls.gr.undo.swale'), (x) => { x.fall = n; }); }, { calc: false, blankOk: true });
      const info = P().graded().items?.find((x) => x.id === g.id);
      if (info?.length) notes.push(t('ls.gr.swale.facts', { len: fixed(info.length, 1), u: uLen(), fall: fixed((info.fallAt || 0) * 100, 2) }));
      if (!g.fall) notes.push(t('ls.gr.swale.follow'));
    }
    const out = [el('div', { className: 'cv-props' }, ...fields), ...notes.filter(Boolean).map((n) => el('p', { className: 'cv-note' }, n))];
    if (g.kind === 'area') {
      const spotRows = g.spots.map((s) => el('tr', { className: sel.sub === s.id ? 'is-sel' : '', dataset: { lsSpot: s.id } },
        el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: 'ls-grade', id: g.id, sub: s.id }) }, s.id)),
        el('td', {}, ctx.numInput(fixed(s.z, 2), (v) => { const n = Number(v); if (!Number.isFinite(n)) return false; put(t('ls.gr.undo.spotz'), (x) => { x.spots.find((q) => q.id === s.id).z = n; }); return true; }, { label: t('ls.gr.f.spotz', { id: s.id }), id: 'cv-gr-spot-' + s.id, width: '5.5rem' })),
        // i18n-ignore: an icon class name (the next line)
        el('td', {}, ...[1, -1].map((dir) => el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t(dir > 0 ? 'ls.gr.raise' : 'ls.gr.lower'), dataset: { lsSpotStep: s.id + ':' + dir }, onclick: () => put(t('ls.gr.undo.spotz'), (x) => { const q = x.spots.find((r) => r.id === s.id); q.z = Number((q.z + dir * (U() === 'm' ? 0.05 : 0.1)).toFixed(3)); }) }, el('i', { className: 'bi bi-caret-' + (dir > 0 ? 'up' : 'down') + '-fill', 'aria-hidden': 'true' }))))));
      const conRows = g.contours.map((c) => el('tr', { className: sel.sub === c.id ? 'is-sel' : '', dataset: { lsContour: c.id } },
        el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: 'ls-grade', id: g.id, sub: c.id }) }, c.id)),
        el('td', {}, ctx.numInput(fixed(c.z, 2), (v) => { const n = Number(v); if (!Number.isFinite(n)) return false; put(t('ls.gr.undo.contourz'), (x) => { x.contours.find((q) => q.id === c.id).z = n; }); return true; }, { label: t('ls.gr.f.contourz', { id: c.id }), id: 'cv-gr-con-' + c.id, width: '5.5rem' })),
        el('td', { className: 'num' }, String(c.pts.length))));
      out.push(
        el('table', { className: 'cv-groups', 'data-ls-spots': '' }, el('caption', { className: 'cv-note' }, t('ls.gr.spots', { n: g.spots.length })),
          el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('ls.gr.col.spot')), el('th', { scope: 'col' }, t('ls.gr.col.z', { u: uLen() })), el('th', {}))), el('tbody', {}, ...spotRows)),
        el('table', { className: 'cv-groups', 'data-ls-contours': '' }, el('caption', { className: 'cv-note' }, t('ls.gr.contours', { n: g.contours.length })),
          el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('ls.gr.col.contour')), el('th', { scope: 'col' }, t('ls.gr.col.z', { u: uLen() })), el('th', { scope: 'col', className: 'num' }, t('ls.gr.col.pts')))), el('tbody', {}, ...conRows)),
        el('p', { className: 'cv-note' }, t('ls.gr.area.note')));
      if (sel.sub) out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-sub-del': '', onclick: () => ctx.command('delete') }, t(sel.sub.startsWith('s') ? 'ls.gr.spot.del' : 'ls.gr.contour.del'))));
    }
    const probs = problemsOf(g.id);
    if (probs.length) out.push(el('p', { className: 'cv-report is-error', 'data-ls-gr-problems': '' }, probs.join(' ')));
    const v = itemVolume(g.id), vu = volUnit().u;
    out.push(el('div', { className: 'cv-props', 'data-ls-gr-volumes': '' },
      el('span', { className: 'k' }, t('ls.gr.cut')), el('span', { className: 'v' }, v ? fixed(v.cut, 1) + ' ' + vu : '—'),
      el('span', { className: 'k' }, t('ls.gr.fill')), el('span', { className: 'v' }, v ? fixed(v.fill, 1) + ' ' + vu : '—'),
      el('span', { className: 'k' }, t('ls.gr.total')), el('span', { className: 'v' }, v ? t('ls.gr.total.v', { cut: fixed(v.totalCut, 1), fill: fixed(v.totalFill, 1), u: vu }) : '—')));
    out.push(el('p', { className: 'cv-note' }, t('ls.gr.vol.note')));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => { ctx.select({ kind: 'ls-grade', id: g.id }); ctx.command('delete'); } }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    head.textContent = t('ls.gr.head.' + g.kind);
    box.replaceChildren(...out);
    return true;
  }

  // ---- the grading checks (left panel, under Plants) ----
  const section = el('section', { className: 'cv-sec cv-ls-checks', dataset: { lsChecks: '' }, hidden: true, 'aria-labelledby': 'cv-ls-checks-h' });
  let pondCache = { s: null, r: null };
  function renderSection() {
    const sf = surface();
    const sl = el('input', { type: 'checkbox', id: 'cv-ls-slope', checked: view.slope, 'data-ls-slope': '' });
    sl.addEventListener('change', () => command('ls-slope'));
    const fl = el('input', { type: 'checkbox', id: 'cv-ls-flow', checked: view.flow, 'data-ls-flow': '' });
    fl.addEventListener('change', () => command('ls-flow'));
    const lim = (i) => ctx.numInput(view.limits[i], (v) => { const n = Number(v); if (!(n > 0 && n < 1000)) return false; const l = view.limits.slice(); l[i] = n; l.sort((a, b) => a - b); view.limits = l; saveView(); renderSection(); ctx.redraw(); return true; }, { label: t(i ? 'ls.gr.lim.steep' : 'ls.gr.lim.gentle'), id: 'cv-ls-lim' + i, calc: false, width: '4.5rem' });
    const parts = [el('h2', { className: 'cv-h', id: 'cv-ls-checks-h' }, t('ls.gr.checks')),
      el('p', { className: 'cv-note' }, t(P().graded().surface ? 'ls.gr.checks.fg' : 'ls.gr.checks.eg')),
      el('div', { className: 'cv-checks' }, el('label', { for: 'cv-ls-slope' }, sl, ' ', t('ls.gr.slope'))),
      el('div', { className: 'cv-props' }, el('label', { for: 'cv-ls-lim0' }, t('ls.gr.lim.gentle')), lim(0), el('label', { for: 'cv-ls-lim1' }, t('ls.gr.lim.steep')), lim(1))];
    if (view.slope && sf) {
      const lims = view.limits.map((x) => x / 100), sc = slopeClasses(sf, lims), tot = sc.area.reduce((a, b) => a + b, 0) || 1;
      const names = [t('ls.gr.cls.0', { a: view.limits[0] }), t('ls.gr.cls.1', { a: view.limits[0], b: view.limits[1] }), t('ls.gr.cls.2', { b: view.limits[1] })];
      parts.push(el('ul', { className: 'cv-legend', 'data-ls-slope-legend': '' }, ...names.map((nm, i) => el('li', {}, el('span', { className: 'cv-swatch', style: 'background:var(--layer-' + SLOPE_TOKENS[i] + ')' }), ' ', t('ls.gr.cls.share', { name: nm, pct: fixed((100 * sc.area[i]) / tot, 1) })))));
    }
    parts.push(el('div', { className: 'cv-checks' }, el('label', { for: 'cv-ls-flow' }, fl, ' ', t('ls.gr.flow'))));
    if (view.flow && sf) {
      if (pondCache.s !== sf) pondCache = { s: sf, r: ponding(sf) };
      const ps = pondCache.r.ponds.filter((p) => p.depth >= (U() === 'm' ? 0.01 : 0.03));
      parts.push(el('p', { className: 'cv-note', 'data-ls-ponds': '' }, ps.length ? t('ls.gr.ponds', { n: ps.length, d: fixed(ps[0].depth, 2), u: uLen(), v: fixed(ps.reduce((a, p) => a + p.volume, 0) / volUnit().per, 1), vu: volUnit().u }) : t('ls.gr.ponds.none')));
    }
    section.replaceChildren(...parts);
  }

  // ---- plan and overlay ----
  function sceneItems(unitPerMm) {
    const sf = surface();
    return gradeSceneItems(LS(), sf, U(), { unitPerMm, slope: view.slope ? { limits: view.limits.map((x) => x / 100) } : null, flow: view.flow, fixed: (v) => fixed(v, 2) });
  }
  let slopeCache = { s: null, key: '', paths: null, o: null };
  function overlay(c2d, toScreen, C, sel) {
    const sf = surface();
    if (view.slope && sf) {   // coloured by gradient, cached as paths in world units about an origin, drawn through one transform
      const key = view.limits.join();
      if (slopeCache.s !== sf || slopeCache.key !== key) {
        const sc = slopeClasses(sf, view.limits.map((x) => x / 100)), o = { x: sf.ox, y: sf.oy };
        const paths = [new Path2D(), new Path2D(), new Path2D()];
        for (const tr of sc.tris) { const p = paths[Math.min(2, tr.cls)]; p.moveTo(tr.pts[0].x - o.x, tr.pts[0].y - o.y); p.lineTo(tr.pts[1].x - o.x, tr.pts[1].y - o.y); p.lineTo(tr.pts[2].x - o.x, tr.pts[2].y - o.y); p.closePath(); }
        slopeCache = { s: sf, key, paths, o };
      }
      const a = toScreen(slopeCache.o.x, slopeCache.o.y), b = toScreen(slopeCache.o.x + 1, slopeCache.o.y), c = toScreen(slopeCache.o.x, slopeCache.o.y + 1);
      c2d.save();
      c2d.setTransform(b.x - a.x, b.y - a.y, c.x - a.x, c.y - a.y, a.x, a.y);
      c2d.globalAlpha = 0.22;
      slopeCache.paths.forEach((p, i) => { c2d.fillStyle = C[SLOPE_TOKENS[i]] || C.action; c2d.fill(p); });
      c2d.restore();
    }
    if (!isMine(sel)) return;
    const g = find(sel.id);
    if (!g) return;
    c2d.save();
    c2d.strokeStyle = C.action; c2d.lineWidth = 2.5;
    c2d.beginPath();
    g.pts.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
    if (g.kind !== 'swale') c2d.closePath();
    c2d.stroke();
    if (g.kind === 'area') {
      for (const s of g.spots) { const q = toScreen(s.x, s.y); c2d.beginPath(); c2d.arc(q.x, q.y, sel.sub === s.id ? 7 : 4, 0, 2 * Math.PI); c2d.stroke(); }
      const c = g.contours.find((x) => x.id === sel.sub);
      if (c) { c2d.beginPath(); c.pts.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); }); c2d.lineWidth = 3.5; c2d.stroke(); }
    }
    c2d.restore();
  }

  return {
    menu, tools: TOOLS, closed: new Set(['ls-platform', 'ls-berm', 'ls-area']), hints: Object.fromEntries(TOOLS.map((x) => [x, 'ls.gr.hint.' + x.slice(3)])),
    command, click, finish, isMine, pick, props, grip, remove, sceneItems, overlay, section, renderSection, updateTools, get view() { return view; },
  };
}
