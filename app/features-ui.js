/* SPDX-License-Identifier: Apache-2.0 */
/**
 * features-ui.js — feature lines in the page (0.4 V14): drawing them, Properties, plan linework and the selection labels.
 * Everything it changes goes through featureline.js and project.change (one undo step each). civilcraft.js creates one:
 *
 *   createFeatures(ctx)   ctx = { el, project: () => Project, units: () => 'ft'|'m', say, numInput, row, select(sel),
 *                                 command(c), eg: () => surface | null }
 *   → { finish(draftPts, closed) (the Feature line tool ended: make it), props(f) → nodes, sceneItems() (layer
 *       C-GRAD-FEAT, z kept: 3D polylines in DXF/DWG), pick(w, tol) → { kind: 'feature', id } | null, find(id),
 *       grip(sel) → { list, label, get } for the selected line's vertices, overlay(ctx2d, toScreen, colors, sel)
 *       (elevations at the vertices, grades along the segments), remove(id),
 *       gradeLayer(ctx2d, toScreen, colors, sel, font) — 0.5 WL.21: every other line's grades (a downhill arrow under each)
 *       and elevations, on screen only (display.gradeOverlay) }
 *
 * Drawing: the Feature line tool (L, Surface › More) takes a click per vertex; a click on a survey point takes its
 * place and elevation, otherwise the elevation is the existing ground's there (else the previous vertex's, said);
 * clicking the first vertex again closes the line; Enter finishes.
 */

import { t } from './i18n.js';
import { FEATURE_DEFAULTS, USES, stations, segments, setElevation, setGrade, evenGrade, raise, fromSurface, offsetFeature, gradeLabel, gradeOverlay, flatten, setArc, arcText, parseArc, pointOnSeg, cadPolyline, moveVertex, insertVertex, removeVertex, nearestOnFeature } from './featureline.js';
import { fixed, unitOf } from './units.js';
import { createTeamLines } from './team-lines.js';   // 0.8 WL.26
import { slopeToSurface, slopePolygon, longOffset, planLength } from './feature-grade.js';   // 0.10.1 #1970
import { parseSlope } from './sides.js';

const okB = (b) => Number.isFinite(b) && b !== 0 && Math.abs(b) < 100;

export function createFeatures(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const find = (id) => (P().state.features || []).find((f) => f.id === id) || null;
  const U = () => ctx.units();

  /** Replace a feature line by fn(f) → f' as one undo step. */
  function edit(id, label, fn) {
    const f = find(id);
    if (!f) return false;
    const next = fn(f);
    if (!next || next === f) return false;
    return P().change(label, (s) => { const i = s.features.findIndex((x) => x.id === id); if (i >= 0) s.features[i] = { ...next, id }; }, { keys: P().keysOf('features', id) });   // 0.11 PERF.21: hinted
  }

  // 0.10.1 #1970: "Draw a feature line in this pad" (the pad's Properties) makes the next line drawn a design line, with its
  // elevations read from the proposed surface (the pad) instead of the existing ground
  let nextUse = null;
  const drawAs = (use) => { nextUse = USES.includes(use) ? use : null; };
  function finish(pts, closed) {
    const min = closed ? 3 : 2;
    if (pts.length < min) { ctx.say(t(closed ? 'fl.need3' : 'fl.need2')); return null; }
    const asUse = nextUse; nextUse = null;
    const sf = (asUse === 'design' && ctx.graded?.()) || ctx.eg();
    let guessed = 0, prev = null;
    const out = pts.map((p) => {
      let z = Number.isFinite(p.z) ? p.z : sf?.elevationAt(p.x, p.y, 1e-6);
      if (z === null || z === undefined) { z = prev ?? 0; guessed++; }
      prev = z;
      return okB(p.b) ? { x: p.x, y: p.y, z, b: p.b } : { x: p.x, y: p.y, z };   // 0.6 WL.24: an arc drawn with C
    });
    out.forEach((q, i) => { if (q.b && !closed && i === out.length - 1) delete q.b; });
    const p = P(), id = p.nextId('f'), n = (p.state.features || []).length + 1, d = FEATURE_DEFAULTS(U());
    const name = t('fl.name', { n });
    p.change(t('fl.undo.draw'), (s) => { (s.features ||= []).push({ id, name, pts: out, closed: !!closed, use: asUse || d.use, daylight: false, cut: d.cut, fill: d.fill }); });
    ctx.select({ kind: 'feature', id });
    ctx.say(t('fl.drawn', { name, n: out.length }) + (guessed ? ' ' + t('fl.drawn.guessed', { n: guessed }) : ''));
    return id;
  }


  // ---- 0.8 WL.26: feature lines shared between the drawings of a team (team-lines.js; the site's /api/v1/team/lines) ----
  // Needs a drawing opened from the cloud files (?cloud=<uuid>) and the shell's request to the site (Studio: cadcraftDesktop.cloud.request; a test sets
  // globalThis.ccTeamRequest). Nothing is fetched until a button is pressed.
  const cloudId = () => { try { return new URLSearchParams(globalThis.location?.search || '').get('cloud') || ''; } catch { return ''; } };
  const teamReq = () => globalThis.ccTeamRequest || globalThis.cadcraftDesktop?.cloud?.request || null;
  let tl = null;
  const teamLines = () => {
    const id = cloudId();
    if (!tl || tl.drawing !== id.toLowerCase()) tl = createTeamLines({ request: (a) => teamReq()(a), drawing: id, units: () => U() });
    return tl;
  };
  const teamWords = (r) => {
    const k = 'fl.team.err.' + r.code;
    const w = t(k, { why: r.message || '' });
    return w === k ? t('fl.team.err.other', { why: r.message || r.code || '' }) : w;
  };
  const sharedOf = (f) => (f && f.shared && typeof f.shared.uuid === 'string' ? f.shared : null);

  const teamListShow = (list, btn, say) => async () => {
    list.replaceChildren(el('p', { className: 'cv-note' }, t('fl.team.loading')));
    const r = await teamLines().list();
    if (!r.ok) { list.replaceChildren(el('p', { className: 'cv-note' }, teamWords(r))); return; }
    if (!r.lines.length) { list.replaceChildren(el('p', { className: 'cv-note' }, t('fl.team.none'))); return; }
    const here = new Set((P().state.features || []).map((x) => x.shared?.uuid).filter(Boolean));
    list.replaceChildren(...r.lines.map((l) => el('div', { className: 'cv-row', 'data-fl-team-row': l.uuid },
      el('span', { className: 'cv-grow' }, l.name + ' · ' + t('fl.team.rev', { rev: l.revision, n: l.points }) + (l.behind ? ' · ' + t('fl.team.behind') : '')),
      here.has(l.uuid) ? el('span', { className: 'cv-unit' }, t('fl.team.here')) : btn('data-fl-place', t('fl.team.place'), async () => {
        const q = await teamLines().place(l.uuid);
        if (!q.ok) { say(teamWords(q)); return; }
        const p = P(), nid = p.nextId('f'), d = FEATURE_DEFAULTS(U());
        p.change(t('fl.undo.place'), (s) => { (s.features ||= []).push({ id: nid, name: q.feature.name || l.name, pts: q.feature.pts, closed: q.feature.closed, use: d.use, daylight: false, cut: d.cut, fill: d.fill, shared: q.shared }); });
        ctx.select({ kind: 'feature', id: nid });
        say(t('fl.team.placed', { name: q.feature.name || l.name }));
      }))));
  };
  /** The "Team" section of a feature line's Properties: share, send, get the team's version, stop, and the team's lines to place. */
  function teamBlock(f) {
    const id = f.id, out = [el('h3', { className: 'cv-h3' }, t('fl.team.head'))];
    const live = !!teamReq() && !!cloudId();
    if (!live) { out.push(el('p', { className: 'cv-note', 'data-fl-team-off': '' }, t('fl.team.off'))); return out; }
    const sh = sharedOf(f);
    const status = el('p', { className: 'cv-note', 'data-fl-team-status': '' }, sh ? t('fl.team.is', { rev: sh.revision }) : t('fl.team.not'));
    const list = el('div', { className: 'cv-team-list', 'data-fl-team-list': '' });
    const say = (m) => ctx.say(m);
    const run = async (fn) => { try { await fn(); } catch (e) { say(t('fl.team.err.offline')); } };
    const setShared = (label, shared, extra = {}) => edit(id, label, (x) => ({ ...x, ...extra, shared }));
    const btn = (attr, label, fn) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', [attr]: '', onclick: () => run(fn) }, label);
    const buttons = [];
    if (!sh) {
      buttons.push(btn('data-fl-share', t('fl.team.share'), async () => {
        const r = await teamLines().share(find(id));
        if (!r.ok) { say(teamWords(r)); return; }
        setShared(t('fl.undo.share'), r.shared);
        say(t('fl.team.shared', { name: f.name }) + (r.chords ? ' ' + t('fl.team.chords') : ''));
      }));
    } else {
      buttons.push(btn('data-fl-push', t('fl.team.push'), async () => {
        const r = await teamLines().push(find(id));
        if (!r.ok) { say(teamWords(r)); return; }
        setShared(t('fl.undo.push'), r.shared);
        say(t('fl.team.pushed', { rev: r.shared.revision, n: r.notified || 0 }) + (r.chords ? ' ' + t('fl.team.chords') : ''));
      }));
      buttons.push(btn('data-fl-pull', t('fl.team.pull'), async () => {
        const r = await teamLines().pull(find(id));
        if (!r.ok) { say(teamWords(r)); return; }
        setShared(t('fl.undo.pull'), r.shared, { name: r.feature.name || f.name, pts: r.feature.pts, closed: r.feature.closed });
        say(t('fl.team.pulled', { rev: r.shared.revision }));
      }));
      buttons.push(btn('data-fl-stop', t('fl.team.stop'), async () => {
        const r = await teamLines().stop(find(id));
        if (!r.ok) { say(teamWords(r)); return; }
        edit(id, t('fl.undo.unshare'), (x) => { const { shared, ...rest } = x; return rest; });
        say(t('fl.team.stopped', { name: f.name }));
      }));
    }
    const show = teamListShow(list, btn, say);
    buttons.push(btn('data-fl-team-show', t('fl.team.show'), show));
    out.push(status, el('div', { className: 'cv-actions' }, ...buttons), list);
    return out;
  }

  /** The project-level entry (0.8 WL.26): the team's lines without a feature line selected, shown under the project's Properties. */
  function teamProject() {
    const out = [el('h3', { className: 'cv-h3' }, t('fl.team.head'))];
    if (!(!!teamReq() && !!cloudId())) { out.push(el('p', { className: 'cv-note', 'data-fl-team-off': '' }, t('fl.team.off'))); return out; }
    const say = (m) => ctx.say(m);
    const btn = (attr, label, fn) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', [attr]: '', onclick: async () => { try { await fn(); } catch (e) { say(t('fl.team.err.offline')); } } }, label);
    const list = el('div', { className: 'cv-team-list', 'data-fl-team-list': '' });
    out.push(el('div', { className: 'cv-actions' }, btn('data-fl-team-show', t('fl.team.show'), teamListShow(list, btn, say))), list);
    return out;
  }

  // ---- 0.10.1 #1970: two grading tools that make a new feature line from this one (feature-grade.js) ----
  const box = (id, value) => el('input', { type: 'text', className: 'cv-input', id, value: String(value), inputMode: 'decimal' });
  const choose = (id, opts) => el('select', { className: 'cv-select', id }, ...opts.map(([v, label]) => el('option', { value: v }, label)));
  const numOf = (inp) => { const x = Number(String(inp.value).replace('%', '').trim()); return String(inp.value).trim() !== '' && Number.isFinite(x) ? x : null; };
  const addLine = (label, obj, done) => {
    const p = P(), nid = p.nextId('f'), d = FEATURE_DEFAULTS(U());
    p.change(label, (st) => { (st.features ||= []).push({ daylight: false, cut: d.cut, fill: d.fill, ...obj, id: nid, name: String(obj.name).slice(0, 120) }); });
    ctx.select({ kind: 'feature', id: nid });
    ctx.say(done);
  };
  /** Slope to a surface: a daylight line from this line at a slope (start and stop slope, start and stop distance). */
  function slopeBlock(f) {
    const u = unitOf(U()), id = f.id, L = planLength(f);
    const side = choose('cv-fl-sl-side', [['1', t('fl.side.right')], ['-1', t('fl.side.left')]]);
    const surf = choose('cv-fl-sl-surf', [['eg', t('fl.sl.surf.eg')], ['fg', t('fl.sl.surf.fg')]]);
    const from = box('cv-fl-sl-from', 0), to = box('cv-fl-sl-to', Number(L.toFixed(3))), s0 = box('cv-fl-sl-s0', '3:1'), s1 = box('cv-fl-sl-s1', '3:1');
    const make = choose('cv-fl-sl-make', [['line', t('fl.sl.make.line')], ['area', t('fl.sl.make.area')]]);
    const unit = (inp) => el('div', { className: 'cv-row' }, inp, el('span', { className: 'cv-unit' }, u.short));
    const go = () => {
      const cur = find(id); if (!cur) return;
      const a = numOf(from), b = numOf(to), H0 = parseSlope(s0.value), H1 = String(s1.value).trim() === '' ? H0 : parseSlope(s1.value);
      if (a === null || b === null || !(H0 > 0) || !(H1 > 0)) { ctx.say(t('fl.sl.bad')); return; }
      const sf = surf.value === 'fg' ? ctx.graded?.() : ctx.eg();
      if (!sf) { ctx.say(t(surf.value === 'fg' ? 'fl.sl.nofg' : 'fl.sl.noeg')); return; }
      const r = slopeToSurface(cur, sf, { side: Number(side.value), from: a, to: b, slope0: H0, slope1: H1 });
      if (r.problem) { ctx.say(t('fl.sl.err.' + r.problem)); return; }
      const missed = r.missed ? ' ' + t('fl.sl.missed', { n: r.missed }) : '';
      if (make.value === 'area') {
        const poly = slopePolygon(r);
        if (!poly) { ctx.say(t('fl.sl.err.cross')); return; }
        const name = t('fl.sl.name.area', { name: cur.name });
        addLine(t('fl.undo.slope'), { name, pts: poly, closed: true, use: 'design' }, t('fl.sl.done.area', { name }) + missed);
      } else {
        const name = t('fl.sl.name.line', { name: cur.name });
        addLine(t('fl.undo.slope'), { name, pts: r.pts, closed: false, use: 'off' }, t('fl.sl.done.line', { name, n: r.pts.length }) + missed);
      }
    };
    return [el('h3', { className: 'cv-h3' }, t('fl.sl.head')),
      el('div', { className: 'cv-props', 'data-fl-slope': '' }, ...ctx.row(t('fl.side'), side, 'cv-fl-sl-side'), ...ctx.row(t('fl.sl.surf'), surf, 'cv-fl-sl-surf'),
        ...ctx.row(t('fl.range.from'), unit(from), 'cv-fl-sl-from'), ...ctx.row(t('fl.range.to'), unit(to), 'cv-fl-sl-to'),
        ...ctx.row(t('fl.sl.s0'), s0, 'cv-fl-sl-s0'), ...ctx.row(t('fl.sl.s1'), s1, 'cv-fl-sl-s1'), ...ctx.row(t('fl.sl.make'), make, 'cv-fl-sl-make')),
      el('p', { className: 'cv-note' }, t('fl.sl.note')),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fl-slope-go': '', onclick: go }, t('fl.sl.go')))];
  }
  /** Longitudinal feature: an offset whose distance and elevations change along the line. */
  function longBlock(f) {
    const u = unitOf(U()), id = f.id, L = planLength(f), d0 = FEATURE_DEFAULTS(U());
    const side = choose('cv-fl-lo-side', [['1', t('fl.side.right')], ['-1', t('fl.side.left')]]);
    const from = box('cv-fl-lo-from', 0), to = box('cv-fl-lo-to', Number(L.toFixed(3))), o0 = box('cv-fl-lo-o0', d0.offset), o1 = box('cv-fl-lo-o1', d0.offset);
    const mode = choose('cv-fl-lo-mode', [['slope', t('fl.lo.mode.slope')], ['elev', t('fl.lo.mode.elev')], ['grade', t('fl.lo.mode.grade')], ['toelev', t('fl.lo.mode.toelev')]]);
    const a = box('cv-fl-lo-a', '-2'), b = box('cv-fl-lo-b', '-2'), c = box('cv-fl-lo-c', '');
    const la = el('label', { className: 'k', for: 'cv-fl-lo-a' }), lb = el('label', { className: 'k', for: 'cv-fl-lo-b' }), lc = el('label', { className: 'k', for: 'cv-fl-lo-c' });
    const rowO0 = [el('label', { className: 'k', for: 'cv-fl-lo-o0' }, t('fl.lo.o0')), el('div', { className: 'cv-row' }, o0, el('span', { className: 'cv-unit' }, u.short))];
    const rowO1 = [el('label', { className: 'k', for: 'cv-fl-lo-o1' }, t('fl.lo.o1')), el('div', { className: 'cv-row' }, o1, el('span', { className: 'cv-unit' }, u.short))];
    const show = () => {
      const m = mode.value;
      la.textContent = t('fl.lo.a.' + m); lb.textContent = t('fl.lo.b.' + m); lc.textContent = t('fl.lo.c.toelev');
      for (const n of [...rowO0, ...rowO1]) n.hidden = m === 'toelev';   // the offset is worked out from the slope
      lc.hidden = c.hidden = m !== 'toelev';
    };
    mode.addEventListener('change', () => {
      const z = find(id)?.pts[0]?.z ?? 0;
      if (mode.value === 'slope' || mode.value === 'toelev') { a.value = mode.value === 'toelev' ? '25' : '-2'; b.value = a.value; c.value = mode.value === 'toelev' ? String(Number((z - 1).toFixed(3))) : ''; }
      else if (mode.value === 'elev') { a.value = String(Number(z.toFixed(3))); b.value = a.value; }
      else { a.value = String(Number(z.toFixed(3))); b.value = '1'; }
      show();
    });
    show();
    const go = () => {
      const cur = find(id); if (!cur) return;
      const m = mode.value, A = numOf(a), B = numOf(b), C = numOf(c), F0 = numOf(from), F1 = numOf(to), O0 = numOf(o0), O1 = numOf(o1);
      if (F0 === null || F1 === null || A === null || B === null || (m === 'toelev' ? C === null : O0 === null || O1 === null)) { ctx.say(t('fl.lo.err.numbers')); return; }
      const opts = { side: Number(side.value), from: F0, to: F1, off0: O0 ?? 0, off1: O1 ?? 0, mode: m };
      if (m === 'slope') { opts.s0 = A / 100; opts.s1 = B / 100; }
      else if (m === 'elev') { opts.z0 = A; opts.z1 = B; }
      else if (m === 'grade') { opts.z0 = A; opts.grade = B / 100; }
      else { opts.s0 = A / 100; opts.s1 = B / 100; opts.target = C; }
      const r = longOffset(cur, opts);
      if (r.problem) { ctx.say(t('fl.lo.err.' + r.problem)); return; }
      const name = t('fl.lo.name', { name: cur.name });
      addLine(t('fl.undo.long'), { name, pts: r.pts, closed: false, use: cur.use === 'design' ? 'design' : 'off' }, t('fl.lo.done', { name, n: r.pts.length }));
    };
    return [el('h3', { className: 'cv-h3' }, t('fl.lo.head')),
      el('div', { className: 'cv-props', 'data-fl-long': '' }, ...ctx.row(t('fl.side'), side, 'cv-fl-lo-side'),
        ...ctx.row(t('fl.range.from'), el('div', { className: 'cv-row' }, from, el('span', { className: 'cv-unit' }, u.short)), 'cv-fl-lo-from'),
        ...ctx.row(t('fl.range.to'), el('div', { className: 'cv-row' }, to, el('span', { className: 'cv-unit' }, u.short)), 'cv-fl-lo-to'),
        ...rowO0, ...rowO1, ...ctx.row(t('fl.lo.mode'), mode, 'cv-fl-lo-mode'), la, a, lb, b, lc, c),
      el('p', { className: 'cv-note' }, t('fl.lo.note')),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fl-long-go': '', onclick: go }, t('fl.lo.go')))];
  }

  function props(f) {
    const out = [], u = unitOf(U()), id = f.id;
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-fl-name', value: f.name, maxLength: 120 });
    nm.addEventListener('change', () => edit(id, t('fl.undo.rename'), (x) => ({ ...x, name: nm.value.trim().slice(0, 120) || x.name })));
    const use = el('select', { className: 'cv-select', id: 'cv-fl-use', 'data-fl-use': '' }, ...USES.map((k) => el('option', { value: k }, t('fl.use.' + k))));
    use.value = f.use;
    use.addEventListener('change', () => edit(id, t('fl.undo.use'), (x) => ({ ...x, use: use.value })));
    const closed = el('input', { type: 'checkbox', id: 'cv-fl-closed', checked: f.closed, disabled: f.pts.length < 3 });
    closed.addEventListener('change', () => edit(id, t(closed.checked ? 'fl.undo.close' : 'fl.undo.open'), (x) => ({ ...x, closed: closed.checked })));
    const st = stations(f), sg = segments(f);
    out.push(el('div', { className: 'cv-props' }, ...ctx.row(t('fl.props.name'), nm, 'cv-fl-name'), ...ctx.row(t('fl.props.use'), use, 'cv-fl-use'),
      ...ctx.row(t('fl.props.length'), fixed(st[st.length - 1], 2) + ' ' + u.short),
      ...ctx.row(t('fl.props.length3d'), fixed(sg.reduce((a, s) => a + s.len3d, 0), 2) + ' ' + u.short)));
    out.push(el('label', { className: 'cv-check', for: 'cv-fl-closed' }, closed, ' ', t('fl.props.closed')));
    out.push(el('p', { className: 'cv-note', 'data-fl-use-note': '' }, t(f.use === 'design' && !f.closed ? 'fl.use.note.design.breakline' : 'fl.use.note.' + f.use)));   // 0.10.1 #1970: an open design line is a breakline of the proposed surface
    if (f.use === 'design' && !f.closed) {
      const it = (P().graded().items || []).find((x) => x.kind === 'breakline' && x.id === id);
      if (it?.problems?.length) out.push(el('div', { className: 'cv-report is-error', 'data-fl-bl-problem': '' }, el('ul', {}, ...it.problems.map((x) => el('li', {}, x)))));
      else if (it?.off) out.push(el('p', { className: 'cv-note', 'data-fl-bl-off': '' }, t('fl.bl.part', { n: it.off })));
    }
    if (f.use === 'design' && f.closed) {
      const day = el('input', { type: 'checkbox', id: 'cv-fl-day', checked: f.daylight });
      day.addEventListener('change', () => edit(id, t('fl.undo.daylight'), (x) => ({ ...x, daylight: day.checked })));
      out.push(el('label', { className: 'cv-check', for: 'cv-fl-day' }, day, ' ', t('fl.props.daylight')));
      if (f.daylight) {
        const slope = (k) => ctx.numInput(fixed(f[k], 2), (v) => { const x = Number(v); if (!(x > 0) || v === '') return false; edit(id, t('fl.undo.' + k), (q) => ({ ...q, [k]: x })); return true; }, { id: 'cv-fl-' + k, min: 0 });
        out.push(el('div', { className: 'cv-props' }, ...ctx.row(t('fl.props.cut'), el('div', { className: 'cv-row' }, slope('cut'), el('span', { className: 'cv-unit' }, ': 1')), 'cv-fl-cut'),
          ...ctx.row(t('fl.props.fill'), el('div', { className: 'cv-row' }, slope('fill'), el('span', { className: 'cv-unit' }, ': 1')), 'cv-fl-fill')));
      }
    }
    // vertices: station, elevation (editable), grade to the next (editable)
    out.push(el('h3', { className: 'cv-h3' }, t('fl.props.vertices')));
    const tbody = el('tbody');
    f.pts.forEach((p, i) => {
      const s = sg[i];
      const zIn = ctx.numInput(fixed(p.z, 3).replace(/,/g, ''), (v) => { const z = Number(v); if (!Number.isFinite(z) || v === '') return false; edit(id, t('fl.undo.elev', { n: i + 1 }), (x) => setElevation(x, i, z)); return true; }, { label: t('fl.props.elev.of', { n: i + 1 }), width: '5.25rem' });
      const gIn = s ? ctx.numInput(s.grade === null ? '' : (s.grade * 100).toFixed(2), (v) => { const g = Number(String(v).replace('%', '')) / 100; if (!Number.isFinite(g) || v === '') return false; edit(id, t('fl.undo.grade', { n: i + 1 }), (x) => setGrade(x, i, g)); return true; }, { label: t('fl.props.grade.of', { n: i + 1 }), text: true, calc: false, width: '3.75rem' }) : '—';
      // 0.6 WL.24: the segment from this vertex as an arc — "50 L" / "50 R", empty = straight
      const rIn = s ? ctx.numInput(arcText(f, i), (v) => {
        const r = parseArc(v, !(s.arc && s.arc.sweep < 0));
        if (!r) return false;
        if (!r.r && !s.arc) return true;   // straight already
        const next = setArc(find(id), i, r.r, r.left);
        if (next === find(id)) { if (r.r) ctx.say(t('fl.arc.short', { n: i + 1, min: fixed(s.chord / 2, 2) })); return !r.r; }
        edit(id, t(r.r ? 'fl.undo.arc' : 'fl.undo.straight', { n: i + 1 }), () => next);
        return true;
      }, { label: t('fl.props.radius.of', { n: i + 1 }), text: true, calc: false, width: '4.25rem' }) : '—';
      // 0.10.1 #1970: a Pick at the start of the row (its easting and northing from a plan click, snapped; the elevation stays), a vertex
      // added after it or taken out at its end, and the row under the pointer or with the focus ringed on the plan
      const pick = ctx.pickBtn(t('fl.pick.vertex', { n: i + 1 }), (pt) => edit(id, t('fl.undo.vmove', { n: i + 1 }), (x) => moveVertex(x, i, pt.x, pt.y)), { 'data-fl-pick': String(i) });
      const add = s ? el('button', { type: 'button', className: 'cv-x', 'data-fl-vadd': String(i), title: t('fl.v.add.after', { n: i + 1 }), 'aria-label': t('fl.v.add.after', { n: i + 1 }), onclick: () => { if (edit(id, t('fl.undo.vadd'), (x) => insertVertex(x, i, 0.5))) ctx.say(t('fl.v.added', { n: i + 2 })); } }, el('i', { className: 'bi bi-plus-lg', 'aria-hidden': 'true' })) : null;
      const del = el('button', { type: 'button', className: 'cv-x', 'data-fl-vdel': String(i), title: t('fl.v.remove', { n: i + 1 }), 'aria-label': t('fl.v.remove', { n: i + 1 }), disabled: f.pts.length <= (f.closed ? 3 : 2), onclick: () => { ctx.hot(null); if (edit(id, t('fl.undo.vremove', { n: i + 1 }), (x) => removeVertex(x, i))) ctx.say(t('fl.v.removed', { n: i + 1 })); else ctx.say(t('fl.v.few')); } }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
      const tr = el('tr', { 'data-fl-row': String(i) }, el('td', { className: 'cv-pickcell' }, pick), el('td', {}, String(i + 1)), el('td', { className: 'num' }, fixed(st[i], 2)), el('td', {}, zIn), el('td', {}, gIn), el('td', { 'data-fl-arc': String(i) }, rIn), el('td', { className: 'cv-rowbtns' }, add, del));
      const on = () => ctx.hot(() => find(id)?.pts[i] || null), off = () => ctx.hot(null);
      tr.addEventListener('mouseenter', on); tr.addEventListener('mouseleave', off); tr.addEventListener('focusin', on); tr.addEventListener('focusout', off);
      tbody.append(tr);
    });
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-fl-table': '' },
      el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, el('span', { className: 'visually-hidden' }, t('fl.v.pick.head'))), el('th', { scope: 'col' }, '#'), el('th', { scope: 'col', className: 'num' }, t('fl.props.station')), el('th', { scope: 'col' }, t('fl.props.elev')), el('th', { scope: 'col' }, t('fl.props.grade')), el('th', { scope: 'col' }, t('fl.props.radius')), el('th', { scope: 'col' }, el('span', { className: 'visually-hidden' }, t('fl.v.edit.head'))))), tbody)));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fl-vadd-pick': '', onclick: () => ctx.armPick(t('fl.v.add.pick'), (pt) => {
      const cur = find(id), h = cur && nearestOnFeature(cur, pt.x, pt.y);
      if (!h) return;
      if (h.u < 1e-6 || h.u > 1 - 1e-6) { ctx.say(t('fl.v.add.online')); return; }
      if (edit(id, t('fl.undo.vadd'), (x) => insertVertex(x, h.i, h.u))) ctx.say(t('fl.v.added', { n: h.i + 2 }));
    }) }, el('i', { className: 'bi bi-crosshair', 'aria-hidden': 'true' }), ' ', t('fl.v.add'))));
    out.push(el('p', { className: 'cv-note' }, t('fl.v.note')));
    out.push(el('p', { className: 'cv-note' }, t('fl.props.grade.note')));
    out.push(el('p', { className: 'cv-note' }, t('fl.props.radius.note')));
    // whole-line actions
    const dz = ctx.numInput('', (v) => { const x = Number(v); if (!Number.isFinite(x) || v === '' || x === 0) return false; edit(id, t('fl.undo.raise'), (q) => raise(q, x)); return true; }, { id: 'cv-fl-raise' });
    out.push(el('div', { className: 'cv-props' }, ...ctx.row(t('fl.props.raise'), el('div', { className: 'cv-row' }, dz, el('span', { className: 'cv-unit' }, u.short)), 'cv-fl-raise')));
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fl-surface': '', onclick: () => {
        const r = fromSurface(find(id), ctx.eg());
        if (r.missing.length === f.pts.length) { ctx.say(t('fl.surface.none')); return; }
        edit(id, t('fl.undo.surface'), () => r.f);
        ctx.say(t('fl.surface.done') + (r.missing.length ? ' ' + t('fl.surface.missing', { list: r.missing.map((k) => k + 1).join(', ') }) : ''));
      } }, t('fl.props.surface')),
      f.pts.length > 2 ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fl-even': '', onclick: () => { edit(id, t('fl.undo.even'), (x) => evenGrade(x, 0, x.pts.length - 1)); ctx.say(t('fl.even.done')); } }, t('fl.props.even')) : null));
    // stepped offset
    out.push(el('h3', { className: 'cv-h3' }, t('fl.props.offset')));
    const d0 = FEATURE_DEFAULTS(U());
    const dist = el('input', { type: 'text', className: 'cv-input', id: 'cv-fl-odist', value: String(d0.offset), inputMode: 'decimal' });
    const how = el('select', { className: 'cv-select', id: 'cv-fl-ohow' }, el('option', { value: 'dz' }, t('fl.offset.by.dz')), el('option', { value: 'slope' }, t('fl.offset.by.slope')));
    const amt = el('input', { type: 'text', className: 'cv-input', id: 'cv-fl-oamt', value: '0', inputMode: 'decimal' });
    out.push(el('div', { className: 'cv-props', 'data-fl-offset': '' }, ...ctx.row(t('fl.offset.dist'), el('div', { className: 'cv-row' }, dist, el('span', { className: 'cv-unit' }, u.short)), 'cv-fl-odist'),
      ...ctx.row(t('fl.offset.how'), how, 'cv-fl-ohow'), ...ctx.row(t('fl.offset.amount'), amt, 'cv-fl-oamt')));
    out.push(el('p', { className: 'cv-note' }, t('fl.offset.note')));
    out.push(el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fl-offset-go': '', onclick: () => {
      const D = Number(dist.value), A = Number(String(amt.value).replace('%', ''));
      if (!Number.isFinite(D) || !Number.isFinite(A)) { ctx.say(t('fl.offset.numbers')); return; }
      const r = offsetFeature(find(id), D, how.value === 'dz' ? { dz: A } : { slope: A / 100 });
      if (!r.f) { ctx.say(r.problem); return; }
      const p = P(), nid = p.nextId('f'), name = t('fl.offset.name', { name: f.name, d: (D > 0 ? '+' : '') + D });
      p.change(t('fl.undo.offset'), (s) => { s.features.push({ ...r.f, id: nid, name: name.slice(0, 120) }); });
      ctx.select({ kind: 'feature', id: nid });
      ctx.say(t('fl.offset.done', { name }));
    } }, t('fl.offset.go')));
    out.push(...slopeBlock(f), ...longBlock(f));   // 0.10.1 #1970
    out.push(...teamBlock(f));   // 0.8 WL.26
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => ctx.command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    return out;
  }

  function sceneItems() {
    // 0.6 WL.24: arcs in pieces; the extended data lets CivilCraft read the arcs back from a DXF or DWG
    return (P().state.features || []).map((f) => { const c = cadPolyline(f); return { layer: 'C-GRAD-FEAT', kind: 'poly', pts: c.pts, closed: c.closed, z: true, xdata: c.xdata }; });
  }
  function pick(w, tol) {
    let best = null, bd = tol;
    for (const f of P().state.features || []) {
      const pts = flatten(f);   // 0.6 WL.24: arcs as pieces
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
        const u = L ? Math.max(0, Math.min(1, ((w.x - a.x) * dx + (w.y - a.y) * dy) / L)) : 0;
        const d = Math.hypot(w.x - a.x - dx * u, w.y - a.y - dy * u);
        if (d < bd) { bd = d; best = { kind: 'feature', id: f.id }; }
      }
    }
    return best;
  }
  function grip(sel) {
    const f = sel?.kind === 'feature' ? find(sel.id) : null;
    return f ? { list: f.pts, label: t('fl.undo.move'), get: () => find(sel.id)?.pts, keys: P().keysOf('features', sel.id) } : null;
  }
  function overlay(c2d, toScreen, C, sel, font) {
    const f = sel?.kind === 'feature' ? find(sel.id) : null;
    if (!f) return;
    const pts = flatten(f);   // 0.6 WL.24: arcs as pieces
    c2d.strokeStyle = C.action; c2d.lineWidth = 3; c2d.setLineDash([]); c2d.beginPath();
    pts.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
    c2d.stroke();
    c2d.font = '600 11px ' + font; c2d.textBaseline = 'bottom';
    const sg = segments(f);
    for (const s of sg) {
      const A = f.pts[s.i], B = f.pts[s.j], a = toScreen(A.x, A.y), b = toScreen(B.x, B.y);
      // 0.6 WL.24: on an arc the label sits at its middle along its tangent, with its radius
      const mid = pointOnSeg(A, B, A.b, 0.5), m = toScreen(mid.x, mid.y), ah = toScreen(mid.x + Math.cos(mid.dir), mid.y + Math.sin(mid.dir));
      if (Math.max(Math.hypot(b.x - a.x, b.y - a.y), 2 * Math.hypot(m.x - a.x, m.y - a.y)) < 70) continue;
      let ang = Math.atan2(ah.y - m.y, ah.x - m.x);
      if (Math.abs(ang) > Math.PI / 2) ang += Math.PI;   // upright; the grade is always in the line's own direction
      c2d.save(); c2d.translate(m.x, m.y); c2d.rotate(ang);
      c2d.fillStyle = C.bg; const txt = gradeLabel(s.grade) + (s.arc ? '  R ' + fixed(s.arc.r, 2) : ''), w = c2d.measureText(txt).width;
      c2d.fillRect(-w / 2 - 2, -16, w + 4, 13); c2d.fillStyle = C.action; c2d.textAlign = 'center'; c2d.fillText(txt, 0, -4); c2d.restore();
    }
    c2d.textAlign = 'left';
    for (const p of f.pts) {
      const q = toScreen(p.x, p.y), txt = fixed(p.z, 2), w = c2d.measureText(txt).width;
      c2d.fillStyle = C.bg; c2d.fillRect(q.x + 6, q.y - 15, w + 4, 13); c2d.fillStyle = C.ink; c2d.fillText(txt, q.x + 8, q.y - 3);
    }
  }
  function remove(id) {
    const f = find(id);
    if (!f) return false;
    P().change(t('fl.undo.delete'), (s) => { s.features = s.features.filter((x) => x.id !== id); }, { keys: P().listKeys('features', id) });
    ctx.say(t('fl.deleted', { name: f.name }));
    return true;
  }
  /** 0.5 WL.21: grades and elevations along every feature line, screen only (the selected line keeps its own labels). */
  function gradeLayer(c2d, toScreen, C, sel, font) {
    const items = gradeOverlay(P().state.features || [], toScreen, { skip: sel?.kind === 'feature' ? sel.id : null });
    if (!items.length) return 0;
    c2d.save();
    c2d.font = '600 10.5px ' + font;
    for (const it of items) {
      if (it.kind === 'grade') {
        c2d.save(); c2d.translate(it.x, it.y); c2d.rotate(it.ang);
        const w = c2d.measureText(it.text).width;
        c2d.fillStyle = C.bg; c2d.globalAlpha = 0.85; c2d.fillRect(-w / 2 - 2, -15, w + 4, 12); c2d.globalAlpha = 1;
        c2d.fillStyle = C.green || C.ink; c2d.textAlign = 'center'; c2d.textBaseline = 'bottom'; c2d.fillText(it.text, 0, -4);
        c2d.restore();
        if (it.down !== null) {   // a small arrow on the line, pointing downhill
          const L = 9, ux = Math.cos(it.down), uy = Math.sin(it.down), x = it.x + ux * 4, y = it.y + uy * 4;
          c2d.strokeStyle = C.green || C.ink; c2d.lineWidth = 1.4; c2d.beginPath();
          c2d.moveTo(x - ux * L, y - uy * L); c2d.lineTo(x, y);
          c2d.moveTo(x - ux * 4 - uy * 3, y - uy * 4 + ux * 3); c2d.lineTo(x, y); c2d.lineTo(x - ux * 4 + uy * 3, y - uy * 4 - ux * 3);
          c2d.stroke();
        }
      } else {
        const w = c2d.measureText(it.text).width;
        c2d.fillStyle = C.bg; c2d.globalAlpha = 0.85; c2d.fillRect(it.x + 5, it.y - 14, w + 4, 12); c2d.globalAlpha = 1;
        c2d.fillStyle = C.ink; c2d.textAlign = 'left'; c2d.textBaseline = 'bottom'; c2d.fillText(it.text, it.x + 7, it.y - 3);
      }
    }
    c2d.restore();
    return items.length;
  }
  return { drawAs, finish, props, teamBlock, teamProject, sceneItems, pick, grip, overlay, remove, find, gradeLayer };
}
