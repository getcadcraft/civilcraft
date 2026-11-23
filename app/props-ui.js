/* SPDX-License-Identifier: Apache-2.0 */
/**
 * props-ui.js: civilcraft.js's 20 bindings for this topic, moved out of init() unchanged (0.10 PERF.71, code-mains-10; no behaviour change).
 * mountProps(ctx) is called once by init(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables init() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { t } from './i18n.js';
import { el, num, fillDl } from './ui-util.js';
import { fixed, volumeText, grouped, parseStation, formatStation, dms, bearing, pct, areaText } from './units.js';
import { earthworkFile, QTY_EXT } from './qtyout.js';
import { cleanDesign, SPEED_UNITS } from './project.js';
import { curveWhy, verticalWhy } from './solve-why.js';
import { railProps } from './rail-ui.js';
import { elementsBlock } from './alignment-table-ui.js';   // 0.11 FX.369
import { defaultAssembly } from './corridor.js';
import { assemblyProps } from './assembly-ui.js';
import { targetProps } from './targets-ui.js';
import { superProps } from './super-ui.js';
import { bearingBetween, setTangent, copyOf, translate, rotate } from './snap.js';
import { slopeInput, sidesBlock } from './sides-ui.js';
import { polyArea, pointInPoly } from './tin.js';
import { cleanSides } from './sides.js';
import { autoInverts } from './pipes.js';
import { editPoint } from './point-edit.js';
import { cornerZ, hasCornerZ, setCornerZ, levelPad, edgeGrades, insertCorner, removeCorner, nearestSide } from './pad-edit.js';   // 0.10.1 #1970

export function mountProps(ctx) {
  const { ui, secUi, flUi, drUi, seUi, pcUi, msUi, tvUi, skUi, stUi, swUi, rvUi, wmUi, tpUi, codesUi, ppUi, pprUi, fileStem, download, units, u, eg, graded, findAl, findPad, net, findStruct, findPipe, diaU, refresh, renderProps, numInput, row, gridRow, roRow, propGrid, numberSpan, showProfile, renderProfile, pviPickBtn, slopeCell, command, armPick, say } = ctx;   // ctx.hot(pt | null) rings a vertex on the plan (0.10.1 #1970)

  function projectProps() {
    ui.propsH.textContent = t('cv.props.project');
    const s = ctx.project.state, out = [];
    out.push(el('p', { className: 'cv-note' }, t('cv.props.project.note')));
    if (s.alignments.length) {
      out.push(el('h3', { className: 'cv-h3' }, t('cv.props.alignments')));
      out.push(el('ul', { className: 'cv-plainlist' }, ...s.alignments.map((a) => { const al = ctx.project.alignment(a); return el('li', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { ctx.sel = { kind: 'alignment', id: a.id }; ctx.selPvi = -1; refresh(); } }, a.name), ' · ', al.ok ? fixed(al.length, 2) + ' ' + u().short : t('cv.al.needsfix')); })));
    }
    if (s.pads.length) {
      out.push(el('h3', { className: 'cv-h3' }, t('cv.props.pads')));
      out.push(el('ul', { className: 'cv-plainlist' }, ...s.pads.map((d) => el('li', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { ctx.sel = { kind: 'pad', id: d.id }; refresh(); } }, d.name), ' · ', t('cv.pad.el', { z: fixed(Number(d.z), 2) })))));
    }
    if (s.pads.length || s.alignments.some((a) => a.corridor?.on || (a.corridors || []).some((c) => c.on)) || (s.terrainTemplates || []).length) out.push(volumeBlock());
    out.push(...tpUi.terrainBlock());   // 0.9 WB.6: terrain templates
    out.push(...pcUi.block());   // 0.4 V21
    out.push(...msUi.block());   // 0.7 LC.1
    out.push(...rvUi.block());   // 0.8 SU.957
    out.push(...wmUi.block());   // 0.8 LC.16
    out.push(...flUi.teamProject());   // 0.8 WL.26 the team's lines without a selected feature line
    out.push(...tvUi.block());   // 0.4 V22
    if (s.network) out.push(...networkBlock());
    if (!s.alignments.length && !s.pads.length && !s.network) out.push(el('p', { className: 'cv-note' }, t('cv.props.empty')));
    ui.props.replaceChildren(...out);
  }

  function volumeBlock() {
    const v = ctx.project.volumes(), g = graded(), s = ctx.project.state;
    const wrap = el('div', {}, el('h3', { className: 'cv-h3' }, t('cv.ew.head')));
    const probs = (g.report?.items || []).flatMap((p) => p.problems.map((x) => t('cv.ew.problem', { name: p.name || t('cv.pad'), problem: x })));
    if (probs.length) wrap.append(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...probs.map((x) => el('li', {}, x)))));
    if (!v) { wrap.append(el('p', { className: 'cv-note' }, t('cv.ew.none')), ...tpUi.materialsBlock()); if (ctx.project.materials().length) wrap.append(qtyButton()); return wrap; }
    const net = v.fill - v.cut;
    wrap.append(el('dl', { className: 'cv-vol' },
      el('dt', {}, t('cv.ew.cut')), el('dd', { 'data-vol-cut': '' }, volumeText(v.cut, s.units)),
      el('dt', {}, t('cv.ew.fill')), el('dd', { 'data-vol-fill': '' }, volumeText(v.fill, s.units)),
      el('dt', {}, t('cv.ew.net')), el('dd', {}, Math.abs(net) < 1e-9 ? volumeText(Math.abs(net), s.units) : t(net > 0 ? 'cv.ew.net.fill' : 'cv.ew.net.cut', { v: volumeText(Math.abs(net), s.units) }))));
    if (v.items?.length > 1) wrap.append(el('ul', { className: 'cv-plainlist cv-note' }, ...v.items.map((it) => el('li', {}, t('cv.ew.item', { name: it.name, cut: volumeText(it.cut, s.units), fill: volumeText(it.fill, s.units) })))));
    wrap.append(el('p', { className: 'cv-note' }, t('cv.ew.grid', { n: v.cells, cells: num(v.cells), cell: fixed(v.cell, 3).replace(/\.?0+$/, ''), u: u().short })));
    wrap.append(...tpUi.materialsBlock());   // 0.9 SU.1110 + WB.6: what the templates place
    wrap.append(qtyButton());
    return wrap;
  }
  function qtyButton() { return el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'cv-linkbtn', dataset: { qtySend: '' }, title: t('cv.qty.send.title'), onclick: sendEarthwork }, el('i', { className: 'bi bi-box-arrow-up-right', 'aria-hidden': 'true' }), ' ', t('cv.qty.send'))); }
  /** TK.5+: cut and fill as a quantities file TakeoffCraft opens (File › Open takeoff, or a drop) as typed quantities. */
  function sendEarthwork() {
    const r = earthworkFile({ name: ctx.project.state.name, units: ctx.project.state.units, volumes: ctx.project.volumes(), materials: ctx.project.materials().map((m) => ({ ...m, name: tpUi.label(m.name), material: tpUi.label(m.material) })) });   // materials: 0.9 SU.1110 + WB.6
    if (!r.ok) { say(r.why); return; }
    const name = fileStem() + QTY_EXT;
    download(JSON.stringify(r.json, null, 1), name, 'application/json');
    say(t('cv.qty.saved', { name, cut: grouped(r.cut, 2), fill: grouped(r.fill, 2), unit: r.unit }));
  }

  /** 0.7.1 71.24 (owner): the alignment's design speed (with its unit) and design class, one undo step each; stored and written to
   *  IFC (Pset_RoadDesignCriteriaCommon), not checked: CivilCraft has no table that ties a speed to a radius (al.speed.note). */
  function designRows(a) {
    const d = a.design || {}, unitDefault = units() === 'm' ? 'km/h' : 'mph';
    const setD = (label, fn) => ctx.project.change(label, () => { const x = findAl(a.id); const nd = { ...(x.design || { unit: unitDefault }) }; fn(nd); x.design = cleanDesign(nd) || undefined; if (!x.design) delete x.design; }, { keys: ctx.project.keysOf('alignments', a.id) });
    const sp = numInput(Number.isFinite(d.speed) ? String(d.speed) : '', (v) => { const x = v.trim() === '' ? null : Number(v); if (x !== null && !(x > 0 && x < 1000)) return false; setD(t('al.speed.undo'), (nd) => { if (x === null) delete nd.speed; else nd.speed = x; }); }, { text: true, id: 'cv-al-speed', width: '5rem' });
    sp.placeholder = t('al.speed.none');
    const un = el('select', { className: 'cv-select', 'aria-label': t('al.speed.unit'), 'data-al-speed-unit': '' }, ...SPEED_UNITS.map((x) => el('option', { value: x, selected: x === (d.unit || unitDefault) }, x)));
    un.addEventListener('change', () => setD(t('al.speed.undo'), (nd) => { nd.unit = un.value; }));
    const cl = el('input', { type: 'text', className: 'cv-input', id: 'cv-al-class', value: d.cls || '', maxLength: 60, placeholder: t('al.class.none') });
    cl.addEventListener('change', () => setD(t('al.class.undo'), (nd) => { nd.cls = cl.value; }));
    return [...row(t('al.speed'), el('div', { className: 'cv-row' }, sp, un), 'cv-al-speed'), ...row(t('al.class'), cl, 'cv-al-class'),
      el('p', { className: 'cv-note cv-span', 'data-al-speed-note': '' }, t('al.speed.note'))];
  }

  function alignmentProps(a) {
    ui.propsH.textContent = t('sec.alignment');
    const al = ctx.project.alignment(a), U = u(), out = [];
    const alName = (v) => { ctx.project.change(t('cv.undo.al.rename'), () => { findAl(a.id).name = v.trim().slice(0, 120) || t('sec.alignment'); }, { keys: ctx.project.keysOf('alignments', a.id) }); };
    const alStart = (v) => { const x = parseStation(v, units()); if (x === null) return false; ctx.project.change(t('cv.al.start'), () => { findAl(a.id).start = x; }, { keys: ctx.project.keysOf('alignments', a.id) }); };
    // 0.5 WL.23: a design minimum radius (empty = none): curves under it are said, with the smallest radius that fits
    const alMinR = (v) => { const x = v.trim() === '' ? 0 : Number(v); if (!(x >= 0)) return false; ctx.project.change(t('why.undo.minr'), () => { findAl(a.id).minR = x; }, { keys: ctx.project.keysOf('alignments', a.id) }); };
    if (window.ccPropGrid) {   // 0.8 PANEL-COMPACT: name, start station, minimum radius and the read-only length/end in the shared grid; design speed/class rows stay below
      const C = t('sec.alignment');
      const rows = [gridRow('name', C, t('fl.props.name'), a.name, { maxLength: 120 }), gridRow('start', C, t('cv.al.start'), formatStation(Number(a.start) || 0, units())),
        gridRow('minR', C, t('why.minr') + ' (' + U.short + ')', a.minR > 0 ? String(a.minR) : '', { hint: t('why.minr.none') })];
      if (al.ok) rows.push(roRow('length', C, t('fl.props.length'), fixed(al.length, 2) + ' ' + U.short), roRow('end', C, t('cv.al.end'), formatStation(al.end, units())));
      out.push(propGrid('alignment', C, rows, { name: { fn: alName }, start: { fn: alStart, station: true }, minR: { fn: alMinR } }), el('div', { className: 'cv-props' }, ...designRows(a)));   // 0.7.1 71.24
    } else {
      const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-al-name', value: a.name, maxLength: 120 });
      nm.addEventListener('change', () => alName(nm.value));
      const st = numInput(formatStation(Number(a.start) || 0, units()), alStart, { text: true, station: true, id: 'cv-al-start' });
      const minR = numInput(a.minR > 0 ? String(a.minR) : '', alMinR, { text: true, id: 'cv-al-minr', width: '7rem' });
      minR.placeholder = t('why.minr.none');
      out.push(el('div', { className: 'cv-props' }, ...row(t('fl.props.name'), nm, 'cv-al-name'), ...row(t('cv.al.start'), st, 'cv-al-start'),
        ...row(t('why.minr'), el('div', { className: 'cv-row' }, minR, el('span', { className: 'cv-unit' }, U.short)), 'cv-al-minr'),
        ...designRows(a),   // 0.7.1 71.24: design speed and class
        ...(al.ok ? [...row(t('fl.props.length'), fixed(al.length, 2) + ' ' + U.short), ...row(t('cv.al.end'), formatStation(al.end, units()))] : [])));
    }
    const why = curveWhy(a.pis, { minR: a.minR || 0 });
    if (why.length) out.push(whyBlock(a, why));
    else if (al.errors.length) out.push(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...al.errors.map((e) => el('li', {}, e)))));
    // PIs
    out.push(el('h3', { className: 'cv-h3' }, t('cv.al.pis')));
    const tbody = el('tbody');
    a.pis.forEach((p, i) => {
      const end = i === 0 || i === a.pis.length - 1;
      const setXY = (k) => (v) => { const x = Number(v); if (!Number.isFinite(x) || v === '') return false; ctx.project.change(t('cv.undo.pi.move.n', { n: i + 1 }), () => { findAl(a.id).pis[i][k] = x; }, { keys: ctx.project.keysOf('alignments', a.id) }); };
      tbody.append(el('tr', {},
        el('td', {}, String(i + 1)),
        el('td', {}, numInput(fixed(p.x, 2), setXY('x'), { label: t('cv.al.pi.e', { n: i + 1 }) })),
        el('td', {}, el('div', { className: 'cv-row' }, numInput(fixed(p.y, 2), setXY('y'), { label: t('cv.al.pi.n', { n: i + 1 }) }),   // 0.9 WB.15: pick the place in the plan
          ctx.pickBtn(t('cv.pick.pi', { n: i + 1 }), (pt) => ctx.project.change(t('cv.undo.pi.move.n', { n: i + 1 }), () => { const q = findAl(a.id).pis[i]; q.x = pt.x; q.y = pt.y; }, { keys: ctx.project.keysOf('alignments', a.id) })))),
        el('td', end ? { className: 'cv-dash' } : {}, end ? '—' : numInput(p.r || 0, (v) => { const r = Number(v); if (!(r >= 0)) return false; ctx.project.change(t('cv.al.pi.r', { n: i + 1 }), () => { findAl(a.id).pis[i].r = r; }, { keys: ctx.project.keysOf('alignments', a.id) }); }, { label: t('cv.al.pi.r', { n: i + 1 }), min: 0 })),
        ...[['ls1', 'cv.al.pi.ls1'], ['ls2', 'cv.al.pi.ls2']].map(([k, key]) => el('td', end || !(p.r > 0) ? { className: 'cv-dash' } : {}, end || !(p.r > 0) ? '—' : numInput(p[k] || 0, (v) => { const x = Number(v); if (!(x >= 0)) return false; ctx.project.change(t('cv.undo.pi.ls'), () => { const q = findAl(a.id).pis[i]; if (x > 0) q[k] = x; else delete q[k]; }, { keys: ctx.project.keysOf('alignments', a.id) }); }, { label: t(key, { n: i + 1 }), min: 0, id: 'cv-pi' + (i + 1) + '-' + k }))),   // 0.7 D7.35
        (() => { const can = !end && p.r > 0 && i + 1 < a.pis.length - 1 && a.pis[i + 1].r > 0; return el('td', can ? {} : { className: 'cv-dash' }, can ? numInput(p.lsc || 0, (v) => { const x = Number(v); if (!(x >= 0)) return false; ctx.project.change(t('cv.undo.pi.lsc'), () => { const q = findAl(a.id).pis[i]; if (x > 0) q.lsc = x; else delete q.lsc; }, { keys: ctx.project.keysOf('alignments', a.id) }); }, { label: t('cv.al.pi.lsc', { n: i + 1 }), min: 0, id: 'cv-pi' + (i + 1) + '-lsc' }) : '—'); })(),   // 0.11 SU.1944
        el('td', {}, a.pis.length > 2 ? el('button', { type: 'button', className: 'cv-x', 'aria-label': t('cv.al.pi.remove', { n: i + 1 }), title: t('cv.al.pi.remove.title'), onclick: () => ctx.project.change(t('cv.undo.pi.remove'), () => { findAl(a.id).pis.splice(i, 1); }, { keys: ctx.project.keysOf('alignments', a.id) }) }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' })) : '')));
    });
    // 0.10.1 #1970: the PI whose row is under the pointer or has the focus is ringed on the plan
    [...tbody.children].forEach((tr, i) => { const on = () => ctx.hot(() => findAl(a.id)?.pis[i] || null), off = () => ctx.hot(null); tr.addEventListener('mouseenter', on); tr.addEventListener('mouseleave', off); tr.addEventListener('focusin', on); tr.addEventListener('focusout', off); });
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table' },
      el('thead', {},
        el('tr', {}, ...[['#', '#'], [t('pt.props.easting')], [t('pt.props.northing')], [t('se.c.r')]].map(([x]) => el('th', { scope: 'col', rowSpan: 2 }, x)), el('th', { scope: 'colgroup', colSpan: 3, className: 'cv-th-group' }, t('cv.al.col.spiral')), el('th', { rowSpan: 2 }, el('span', { className: 'visually-hidden' }, t('sec.props.remove')))),
        el('tr', {}, el('th', { scope: 'col' }, t('cv.al.col.in')), el('th', { scope: 'col' }, t('cv.al.col.out')), el('th', { scope: 'col' }, t('cv.al.col.next')))), tbody)));
    if (a.pis.some((q) => q.lsc > 0)) out.push(el('p', { className: 'cv-note', 'data-al-comp-note': '' }, t('cv.al.comp.note')));
    out.push(tangentBlock(a), transformBlock('alignment', a.id));   // 0.9 WB.15 / WB.10
    // curves
    const cvs = al.ok ? al.curves : [];
    if (cvs.length) {
      out.push(el('h3', { className: 'cv-h3' }, t('cv.al.curves')));
      const st = (v) => formatStation(v, units());
      out.push(el('ol', { className: 'cv-curves' }, ...cvs.map((c) => {
        const sp = c.ls1 > 0 || c.ls2 > 0, dg = (v) => dms(v * 180 / Math.PI);
        return el('li', {},
          el('span', { className: 'cv-curve-sta' }, sp ? t('cv.al.curve.sta.sp', { ts: st(c.ts), sc: st(c.sc), cs: st(c.cs), st: st(c.st) }) : t('cv.al.curve.sta', { pc: st(c.ts), pt: st(c.st) })),
          el('span', {}, t(c.ccw ? 'cv.al.curve.left' : 'cv.al.curve.right', { r: fixed(c.r, 2), delta: dms(Math.abs(c.d) * 180 / Math.PI) })),
          sp ? el('span', { 'data-spiral-facts': '' }, t('cv.al.curve.sp', { ls1: fixed(c.ls1, 2), ls2: fixed(c.ls2, 2), th1: dg(c.theta1), th2: dg(c.theta2), t1: fixed(c.T1, 2), t2: fixed(c.T2, 2), es: fixed(c.Es, 2) })) : null,
          c.lsc > 0 && al.curves.find((q) => q.compoundWith === c.piIndex) ? el('span', { 'data-comp-spiral': '' }, (() => { const n2 = al.curves.find((q) => q.compoundWith === c.piIndex), rev = c.ccw !== n2.ccw; return t('cv.al.curve.comp', { ls: fixed(c.lsc, 2), kind: t(rev ? 'cv.al.comp.reverse' : 'cv.al.comp.compound'), r1: fixed(c.r, 2), r2: fixed(n2.r, 2), sign: rev ? '−' : '' }); })()) : null,   // 0.11 SU.1944
          el('span', {}, t('cv.al.curve.parts', { len: fixed(c.Lc, 2), tan: fixed(c.T1, 2), ext: fixed(c.Es, 2), chord: fixed(2 * c.r * Math.sin(Math.max(0, Math.abs(c.d) - c.theta1 - c.theta2) / 2), 2) })));
      })));
      out.push(el('p', { className: 'cv-note' }, t('cv.al.curves.note')));
    }
    if (al.ok) out.push(el('p', { className: 'cv-note' }, t('cv.al.tangent', { b: bearing(al.elements[0].dir ?? al.elements[0].dirIn) })));
    if (al.ok) out.push(...elementsBlock(a, al, { units, download, fileStem, say }));   // 0.11 FX.369
    // 0.7.1 71.26: railway — track, gauge, transitions, cant per curve, limits, warnings, the cant diagram, quantities
    if (al.ok) out.push(...railProps({ el, project: () => ctx.project, units: () => units(), numInput: (...x) => numInput(...x), row: (...x) => row(...x), say: (m) => say(m) }, a, ctx.project.railPlan(a), (eg().surface ? graded().items?.find((x) => x.id === a.id && x.kind === 'corridor') : ctx.project.standInCorridors().find((x) => x.id === a.id)) || null));
    // profile. FX.350 (civil-11): the action buttons sit BEFORE the first fold heading; after the last heading (Sample lines) they were
    // folded away with it, so Swept path... was hidden until that block was opened.
    out.push(el('h3', { className: 'cv-h3' }, t('cv.prof.head')));
    if (al.ok) out.push(...profileProps(a, al));
    if (al.ok) out.push(...corridorProps(a));
    if (al.ok && !a.rail?.on) out.push(...tpUi.moreCorridors(a, eg().surface ? graded() : { items: ctx.project.standInCorridors() }));   // 0.9 SU.1110: more corridors on this alignment
    if (al.ok) out.push(...secUi.props(a));   // 0.4 V13 sample lines
    const firstH3 = out.findIndex((n) => n && n.tagName === 'H3');   // the folds start at the first h3; before it nothing folds
    out.splice(firstH3 < 0 ? out.length : firstH3, 0, el('div', { className: 'cv-actions', 'data-al-actions': '' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => showProfile(true, a.id) }, el('i', { className: 'bi bi-graph-up', 'aria-hidden': 'true' }), ' ', t('cv.prof.view')),
      al.ok ? skUi.button(a) : null,   // 0.4 V23
      al.ok ? swUi.button('alignment', a.id) : null,   // 0.6 WL.28
      al.ok ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pp-open': '', onclick: () => ppUi.open(a.id) }, el('i', { className: 'bi bi-file-earmark-pdf', 'aria-hidden': 'true' }), ' ', t('pp.ui.open')) : null,   // 0.4 V15
      el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    ui.props.replaceChildren(...out);
  }

  /**
   * 0.5 WL.23: why the curves have no solution, in numbers, each with the radius that would fit as a button (one undo
   * step). Overlaps offer either PI's largest fitting radius or both scaled together; a radius under the design minimum
   * offers the smallest that meets it, or says why none fits.
   */
  function whyBlock(a, why) {
    const U = u().short, n = (v) => fixed(v, 2).replace(/,/g, '');
    const setR = (pairs, label) => () => { ctx.project.change(label, () => { const al = findAl(a.id); for (const [i, r] of pairs) al.pis[i].r = r; }, { keys: ctx.project.keysOf('alignments', a.id) }); say(label); };
    const shown = new Set();   // one button per fix: two overlaps round one PI often offer the same radius
    const btn = (text, attr, fn) => { if (shown.has(attr)) return null; shown.add(attr); return el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-why-fix': attr, onclick: fn }, text); };
    const items = why.map((w) => {
      if (w.kind === 'overlap') {
        const fixes = [];
        if (w.fixA !== null) fixes.push(btn(t('why.fix.r', { pi: w.a + 1, r: n(w.fixA), u: U }), w.a + ':' + w.fixA, setR([[w.a, w.fixA]], t('why.undo.r', { pi: w.a + 1, r: n(w.fixA) }))));
        if (w.fixB !== null) fixes.push(btn(t('why.fix.r', { pi: w.b + 1, r: n(w.fixB), u: U }), w.b + ':' + w.fixB, setR([[w.b, w.fixB]], t('why.undo.r', { pi: w.b + 1, r: n(w.fixB) }))));
        if (w.both.ra > 0 && w.both.rb > 0) fixes.push(btn(t('why.fix.both', { a: w.a + 1, b: w.b + 1, ra: n(w.both.ra), rb: n(w.both.rb), u: U }), 'both', setR([[w.a, w.both.ra], [w.b, w.both.rb]], t('why.undo.both', { a: w.a + 1, b: w.b + 1 }))));
        const none = [w.fixA === null && w.a > 0 ? t('why.none.at', { pi: w.a + 1, other: w.b + 1 }) : '', w.fixB === null && w.b < a.pis.length - 1 ? t('why.none.at', { pi: w.b + 1, other: w.a + 1 }) : ''].filter(Boolean);
        const one = !(w.Ta > 0 && w.Tb > 0), [pi, other] = w.Ta > 0 ? [w.a, w.b] : [w.b, w.a];
        const said = one ? t('why.overlap.one', { pi: pi + 1, other: other + 1, need: n(w.need), dist: n(w.dist), u: U }) : t('why.overlap', { a: w.a + 1, b: w.b + 1, need: n(w.need), ta: n(w.Ta), tb: n(w.Tb), dist: n(w.dist), u: U });
        const kept = fixes.filter(Boolean);
        return el('li', { 'data-why': 'overlap' }, el('p', {}, said),
          ...none.map((x) => el('p', { className: 'cv-note' }, x)), kept.length ? el('div', { className: 'cv-actions' }, ...kept) : null);
      }
      if (w.kind === 'back') return el('li', { 'data-why': 'back' }, el('p', {}, t('why.back', { pi: w.pi + 1 })),
        el('div', { className: 'cv-actions' }, btn(t('why.fix.nocurve', { pi: w.pi + 1 }), w.pi + ':0', setR([[w.pi, 0]], t('why.undo.r', { pi: w.pi + 1, r: '0' })))));
      return el('li', { 'data-why': 'min' }, el('p', {}, t('why.min', { pi: w.pi + 1, r: n(w.r), min: n(w.minR), u: U })),
        w.fix !== null ? el('div', { className: 'cv-actions' }, btn(t('why.fix.min', { pi: w.pi + 1, r: n(w.fix), u: U }), w.pi + ':' + w.fix, setR([[w.pi, w.fix]], t('why.undo.r', { pi: w.pi + 1, r: n(w.fix) }))))
          : el('p', { className: 'cv-note' }, t('why.min.none', { pi: w.pi + 1, max: n(w.maxR), min: n(w.minR), u: U })));
    });
    const errs = why.some((w) => w.kind !== 'min');
    return el('div', { className: 'cv-report cv-why' + (errs ? ' is-error' : ''), 'data-why-block': '' },
      el('p', { className: 'cv-why-h' }, t(errs ? 'why.head.error' : 'why.head.min')), el('ul', {}, ...items));
  }

  function profileProps(a, al) {
    const out = [], prof = ctx.project.designProfile(a);
    if (!a.pvis.length) {
      out.push(el('p', { className: 'cv-note' }, t('cv.prof.none')));
      out.push(el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-start-profile': '', onclick: () => startProfile(a) }, t('cv.prof.start')));
      return out;
    }
    // 0.5 WL.23: vertical curves that do not fit say why, with the longest length that does (one undo step)
    const vwhy = verticalWhy(a.pvis);
    if (vwhy.length) {
      const n = (v) => fixed(v, 2).replace(/,/g, '');
      out.push(el('div', { className: 'cv-report cv-why is-error', 'data-vwhy-block': '' }, el('p', { className: 'cv-why-h' }, t('why.head.error')), el('ul', {}, ...vwhy.map((w) => el('li', { 'data-why': 'vc' },
        el('p', {}, t(w.side === 'before' ? 'why.vc.before' : 'why.vc.past', { pvi: w.pvi + 1, l: n(w.L), room: n(w.room / 2), u: u().short })),
        w.fix ? el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-why-fix': 'L' + w.index + ':' + w.fix,
          onclick: () => { const lbl = t('why.undo.l', { pvi: w.pvi + 1, l: n(w.fix) }); ctx.project.change(lbl, () => { const v = findAl(a.id).pvis[w.index]; v.L = w.fix; delete v.K; }, { keys: ctx.project.keysOf('alignments', a.id) }); say(lbl); } }, t('why.fix.l', { pvi: w.pvi + 1, l: n(w.fix), k: fixed(w.K, 1), u: u().short }))) : null)))));
    } else if (prof.errors.length) out.push(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...prof.errors.map((e) => el('li', {}, e)))));
    const tbody = el('tbody');
    a.pvis.forEach((v, i) => {
      const interior = i > 0 && i < a.pvis.length - 1;
      tbody.append(el('tr', { className: ctx.selPvi === i ? 'is-sel' : '' },
        el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { ctx.selPvi = i; renderProfile(); renderProps(); } }, String(i + 1))),
        el('td', { className: 'cv-pickcell' }, numInput(formatStation(v.sta, units()), (x) => { const s = parseStation(x, units()); if (s === null) return false; ctx.project.change(t('cv.undo.pvi.sta'), () => { const p = findAl(a.id).pvis; p[i].sta = s; p.sort((m, n) => m.sta - n.sta); }, { keys: ctx.project.keysOf('alignments', a.id) }); }, { text: true, station: true, label: t('cv.pvi.sta.of', { n: i + 1 }) }), pviPickBtn(i, 'sta')),
        el('td', { className: 'cv-pickcell' }, numInput(fixed(v.z, 2), (x) => { const z = Number(x); if (!Number.isFinite(z) || x === '') return false; ctx.project.change(t('cv.undo.pvi.z'), () => { findAl(a.id).pvis[i].z = z; }, { keys: ctx.project.keysOf('alignments', a.id) }); }, { label: t('cv.pvi.z.of', { n: i + 1 }) }), pviPickBtn(i, 'z')),
        el('td', interior ? {} : { className: 'cv-dash' }, interior ? numInput(v.L || 0, (x) => { const L = Number(x); if (!(L >= 0)) return false; ctx.project.change(t('cv.undo.pvi.l'), () => { findAl(a.id).pvis[i].L = L; }, { keys: ctx.project.keysOf('alignments', a.id) }); }, { label: t('cv.pvi.l.of', { n: i + 1 }), min: 0 }) : '—'),
        el('td', interior ? {} : { className: 'cv-dash' }, interior ? numInput(v.R || 0, (x) => { const Rv = Number(x); if (!(Rv >= 0)) return false; ctx.project.change(t('cv.undo.pvi.r'), () => { const q = findAl(a.id).pvis[i]; if (Rv > 0) q.R = Rv; else delete q.R; }, { keys: ctx.project.keysOf('alignments', a.id) }); }, { label: t('cv.pvi.r.of', { n: i + 1 }), min: 0, id: 'cv-pvi' + (i + 1) + '-r' }) : '—'),   // 0.11 FX.366: a circular vertical curve by its radius
        slopeCell(a, i),
        el('td', {}, el('button', { type: 'button', className: 'cv-x cv-lock' + (v.locked ? ' is-on' : ''), 'data-pvi-lock': String(i), 'aria-pressed': String(!!v.locked), 'aria-label': t('cv.pvi.lock.of', { n: i + 1 }), title: t(v.locked ? 'cv.pvi.lock.on' : 'cv.pvi.lock.off'),
          onclick: () => { ctx.project.change(t(v.locked ? 'cv.undo.pvi.unlock' : 'cv.undo.pvi.lock'), () => { const q = findAl(a.id).pvis[i]; if (q.locked) delete q.locked; else q.locked = true; }, { keys: ctx.project.keysOf('alignments', a.id) }); } }, el('i', { className: 'bi ' + (v.locked ? 'bi-lock-fill' : 'bi-unlock'), 'aria-hidden': 'true' }))),
        el('td', {}, el('button', { type: 'button', className: 'cv-x', 'aria-label': t('cv.pvi.remove.of', { n: i + 1 }), onclick: () => { ctx.project.change(t('cv.undo.pvi.remove'), () => { findAl(a.id).pvis.splice(i, 1); }, { keys: ctx.project.keysOf('alignments', a.id) }); ctx.selPvi = -1; } }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' })))));
    });
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-pvi-table': '' },
      el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('cv.pvi.col')), el('th', { scope: 'col' }, t('sec.station.label')), el('th', { scope: 'col' }, t('pt.props.elev')), el('th', { scope: 'col' }, t('cv.pvi.col.l')), el('th', { scope: 'col' }, t('cv.pvi.col.r')), el('th', { scope: 'col' }, t('cv.pvi.col.slope')), el('th', {}, el('span', { className: 'visually-hidden' }, t('cv.pvi.col.lock'))), el('th', {}, el('span', { className: 'visually-hidden' }, t('sec.props.remove'))))), tbody)));
    if (prof.ok) {
      const lines = prof.grades.map((g, i) => t('cv.prof.grade', { n: i + 1, g: pct(g.g) }));
      for (const c of prof.curves) {
        lines.push(t(c.kind === 'crest' ? 'cv.prof.crest' : 'cv.prof.sag', { sta: formatStation(c.pvi, units()), l: fixed(c.L, 2), k: fixed(c.K, 1), bvc: formatStation(c.bvc, units()), zbvc: fixed(c.zBvc, 2), evc: formatStation(c.evc, units()), zevc: fixed(c.zEvc, 2) }));
        if (c.circ) lines.push(t('cv.prof.circ', { r: fixed(c.R, 2), tan: fixed(c.T, 2), arc: fixed(c.R * Math.abs(Math.atan(c.g2) - Math.atan(c.g1)), 2) }));   // 0.11 FX.366
        const hp = c.high || c.low;
        if (hp) lines.push(t(c.high ? 'cv.prof.high' : 'cv.prof.low', { sta: formatStation(hp.sta, units()), z: fixed(hp.z, 2) }));
      }
      out.push(el('ul', { className: 'cv-note cv-plainlist', 'data-profile-facts': '' }, ...lines.map((l) => el('li', {}, l))));
    }
    if (a.pvis.length && (a.pvis[0].sta > al.start + 1e-6 || a.pvis[a.pvis.length - 1].sta < al.end - 1e-6)) out.push(el('p', { className: 'cv-note' }, t('cv.prof.partial', { from: formatStation(al.start, units()), to: formatStation(al.end, units()) })));
    return out;
  }

  function corridorProps(a) {
    const out = [el('h3', { className: 'cv-h3' }, t('cv.co.head'))], U = u();
    const c = { ...defaultAssembly(units()), ...(a.corridor || {}) };
    const on = el('input', { type: 'checkbox', id: 'cv-co-on', checked: !!a.corridor?.on });
    on.addEventListener('change', () => ctx.project.change(on.checked ? t('cv.undo.co.on') : t('cv.undo.co.off'), () => { const x = findAl(a.id); x.corridor = { ...defaultAssembly(units()), ...(x.corridor || {}), on: on.checked }; }, { keys: ctx.project.keysOf('alignments', a.id) }));
    out.push(el('label', { className: 'cv-check', for: 'cv-co-on' }, on, ' ', t('cv.co.on')));
    if (!a.corridor?.on) { out.push(el('p', { className: 'cv-note' }, t('cv.co.off.note'))); return out; }
    const field = (k, label, undo, scale, unit, id) => [el('label', { for: id }, label), el('div', { className: 'cv-row' }, numInput(fixed(c[k] * scale, 2), (v) => { const x = Number(v); if (!(x >= 0) || v === '' || ((k === 'cut' || k === 'fill' || k === 'step') && !(x > 0))) return false; ctx.project.change(undo, () => { findAl(a.id).corridor[k] = x / scale; }, { keys: ctx.project.keysOf('alignments', a.id) }); }, { id, min: 0 }), el('span', { className: 'cv-unit' }, unit))];
    const railTrack = !!a.rail?.on;   // 0.7.1 71.26: a track (Railway block above): only the side slopes and the section step here
    const tplMode = !railTrack && !!a.corridor?.regions;   // 0.9 SU.1110: built from templates by station (the side slopes = the daylight when no end condition meets the ground)
    const custom = !!a.corridor?.parts || railTrack || tplMode;   // 0.7 D7.35: built from parts, left and right
    out.push(el('div', { className: 'cv-props' },
      ...(railTrack || tplMode ? [...field('cut', t('fl.props.cut'), t('cv.undo.co.cut'), 1, ': 1', 'cv-co-cut'), ...field('fill', t('fl.props.fill'), t('cv.undo.co.fill'), 1, ': 1', 'cv-co-fill')] : []),
      ...(custom ? [] : [...field('lane', t('cv.co.lane'), t('cv.undo.co.lane'), 1, U.short, 'cv-co-lane'), ...field('laneSlope', t('cv.co.ls'), t('cv.undo.co.ls'), 100, '%', 'cv-co-ls'),
        ...field('shoulder', t('cv.co.sh'), t('cv.undo.co.sh'), 1, U.short, 'cv-co-sh'), ...field('shoulderSlope', t('cv.co.ss'), t('cv.undo.co.ss'), 100, '%', 'cv-co-ss')]),
      ...(custom ? [] : [...field('cut', t('fl.props.cut'), t('cv.undo.co.cut'), 1, ': 1', 'cv-co-cut'), ...field('fill', t('fl.props.fill'), t('cv.undo.co.fill'), 1, ': 1', 'cv-co-fill')]),
      ...field('step', t('cv.co.step'), t('cv.undo.co.step'), 1, U.short, 'cv-co-step')));
    if (railTrack) out.push(el('p', { className: 'cv-note', 'data-rail-co-note': '' }, t('rail.co.note')));
    else if (tplMode) { /* 0.9 SU.1110: the templates block below replaces the assembly editor */ }
    else out.push(...assemblyProps({ el, project: () => ctx.project, units: () => units(), numInput: (...x) => numInput(...x), say: (m) => say(m) }, a));   // 0.7 D7.35
    if (!railTrack && !tplMode) out.push(el('p', { className: 'cv-note' }, t('co.note')));   // 0.4 V18: superelevation is available now
    // 0.7.1 71.19: no existing ground → the corridor built on flat stand-in ground, with its warning (project.standInCorridors)
    const standIn = eg().surface ? null : ctx.project.standInCorridors().find((x) => x.id === a.id);
    for (const w of standIn?.warnings || []) out.push(el('div', { className: 'cv-report', 'data-corridor-warning': w.code }, el('p', {}, w.text)));
    const it = standIn || graded().items?.find((x) => x.id === a.id && x.kind === 'corridor');
    const seProblems = new Set(it?.super?.problems || []);   // 0.4 V18: said in the Superelevation block instead
    const others = (it?.problems || []).filter((p) => !seProblems.has(p));
    if (others.length) out.push(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...others.map((p) => el('li', {}, p)))));
    else if (it?.sections) {
      const vi = ctx.project.volumes()?.items?.find((x) => x.id === a.id);
      out.push(el('p', { className: 'cv-note', 'data-corridor-facts': '' }, vi ? t('cv.co.facts.vol', { n: it.sections.length, from: formatStation(it.from, units()), to: formatStation(it.to, units()), cut: volumeText(vi.cut, units()), fill: volumeText(vi.fill, units()) }) : t('cv.co.facts', { n: it.sections.length, from: formatStation(it.from, units()), to: formatStation(it.to, units()) })));
    }
    if (railTrack) return out;   // 0.7.1 71.26: no targets or superelevation on a track (its cant is in the Railway block)
    // 0.10.1 #1977: the corridor joins the roads and pads it meets (junction.js); the switch, and what it joined this time
    {
      const join = el('input', { type: 'checkbox', id: 'cv-co-join', checked: a.corridor.join !== false });
      join.addEventListener('change', () => ctx.project.change(join.checked ? t('cv.undo.co.join.on') : t('cv.undo.co.join.off'), () => { const x = findAl(a.id); if (join.checked) delete x.corridor.join; else x.corridor.join = false; }, { keys: ctx.project.keysOf('alignments', a.id) }));
      out.push(el('label', { className: 'cv-check', for: 'cv-co-join' }, join, ' ', t('cv.co.join')));
      const U2 = u();
      for (const g of it?.ties || []) {
        const d = Math.abs(g.dz), key = d < 0.005 ? 'cv.co.tie.level' : g.dz > 0 ? 'cv.co.tie.up' : 'cv.co.tie.down';
        const name = g.name || (g.kind === 'pad' ? t('scene.pad.default') : t('scene.al.default'));
        out.push(el('p', { className: 'cv-note', 'data-corridor-tie': g.kind + ':' + g.id }, t(key, { name, sta: formatStation(g.end === 'start' ? g.to : g.from, units()), dz: fixed(d, 2), len: fixed(g.len, 1), unit: U2.short })));
      }
      if (a.corridor.join !== false && !(it?.ties || []).length) out.push(el('p', { className: 'cv-note', 'data-corridor-join-note': '' }, t('cv.co.join.note')));
    }
    out.push(...tpUi.corridorBlock(a, a.corridor, a.id, it));   // 0.9 SU.1110: templates by station, left and right apart
    if (tplMode) { out.push(el('p', { className: 'cv-note', 'data-tpl-mode-note': '' }, t('tpl.co.mode.note'))); return out; }
    out.push(...targetProps({ el, project: () => ctx.project, say: (m) => say(m) }, a, it));   // 0.6 WL.25
    out.push(...superProps({ el, project: () => ctx.project, units: () => units(), numInput: (...x) => numInput(...x), row: (...x) => row(...x), say: (m) => say(m) }, a, it));   // 0.4 V18
    return out;
  }

  function startProfile(a) {
    const al = ctx.project.alignment(a);
    const egp = ctx.project.egProfile(a).filter((p) => p.z !== null);
    if (!al.ok || egp.length < 2) { say(t('cv.prof.noground')); return; }
    const z0 = egp[0], z1 = egp[egp.length - 1];
    ctx.project.change(t('cv.undo.prof.start'), () => { findAl(a.id).pvis = [{ sta: z0.sta, z: Number(z0.z.toFixed(2)), L: 0 }, { sta: z1.sta, z: Number(z1.z.toFixed(2)), L: 0 }]; }, { keys: ctx.project.keysOf('alignments', a.id) });
    showProfile(true, a.id);
    say(t('cv.prof.started'));
  }

  // ---- 0.9 WB.10 + WB.15 (a visitor's CivilCraft request): typed and picked coordinates, a tangent from two points, move / copy / rotate ----
  /** Easting / northing boxes for each vertex of a pad, parcel or feature line, each with a Pick button (snaps like the drawing tools). */
  function cornersBlock(kind, id) {
    const get = () => (kind === 'pad' ? ctx.project.state.pads : kind === 'parcel' ? ctx.project.state.parcels || [] : ctx.project.state.features || []).find((x) => x.id === id);
    const o = get();
    if (!o) return el('span');
    const move = (i, x, y) => ctx.project.change(t('cv.undo.corner.move', { n: i + 1 }), () => { const q = get()?.pts[i]; if (q) { q.x = x; q.y = y; } });
    const num = (v) => { const x = Number(v); return v !== '' && Number.isFinite(x) ? x : null; };
    // 0.10.1 #1970: a pad's corners carry an elevation (Z), corners are added and taken out here, and the row in use is ringed on the plan
    const pad = kind === 'pad';
    const swap = (label, fn) => { const cur = get(); const next = cur && fn(cur); if (!next || next === cur) return false; return ctx.project.change(label, (st) => { const i = st.pads.findIndex((x) => x.id === id); if (i >= 0) st.pads[i] = { ...next, id }; }); };
    const hotRow = (tr, i) => { const on = () => ctx.hot(() => get()?.pts[i] || null), off = () => ctx.hot(null); tr.addEventListener('mouseenter', on); tr.addEventListener('mouseleave', off); tr.addEventListener('focusin', on); tr.addEventListener('focusout', off); return tr; };
    const zCell = (q, i) => {
      const own = Number.isFinite(q.z);
      const inp = numInput(fixed(cornerZ(o, i), 2).replace(/,/g, ''), (v) => {
        if (String(v).trim() === '') { if (!Number.isFinite(get()?.pts[i]?.z)) return true; swap(t('cv.undo.corner.zclear', { n: i + 1 }), (d) => setCornerZ(d, i, null)); return true; }
        const z = num(v); if (z === null || Math.abs(z) >= 1e6) return false;
        if (get()?.pts[i]?.z === z) return true;
        swap(t('cv.undo.corner.z', { n: i + 1 }), (d) => setCornerZ(d, i, z));
      }, { label: t('cv.corner.z', { n: i + 1 }), width: '5rem' });
      inp.dataset.cvCornerZ = String(i);
      if (!own) { inp.classList.add('cv-inherit'); inp.title = t('cv.corner.z.pad'); }
      return el('td', {}, inp);
    };
    const rowBtns = (i) => el('td', { className: 'cv-rowbtns' },
      el('button', { type: 'button', className: 'cv-x', 'data-cv-corner-add': String(i), title: t('cv.corner.add.after', { n: i + 1 }), 'aria-label': t('cv.corner.add.after', { n: i + 1 }), onclick: () => { if (swap(t('cv.undo.corner.add'), (d) => insertCorner(d, i, 0.5))) say(t('cv.corner.added', { n: i + 2 })); } }, el('i', { className: 'bi bi-plus-lg', 'aria-hidden': 'true' })),
      el('button', { type: 'button', className: 'cv-x', 'data-cv-corner-del': String(i), title: t('cv.corner.remove', { n: i + 1 }), 'aria-label': t('cv.corner.remove', { n: i + 1 }), disabled: o.pts.length <= 3, onclick: () => { ctx.hot(null); if (swap(t('cv.undo.corner.remove', { n: i + 1 }), (d) => removeCorner(d, i))) say(t('cv.corner.removed', { n: i + 1 })); else say(t('cv.corner.three')); } }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' })));
    const head = ['#', t('pt.props.easting'), t('pt.props.northing'), ...(pad ? [t('cv.corner.zhead') + ' (' + u().short + ')', ''] : [])];
    const out = [el('h3', { className: 'cv-h3' }, t('cv.corners.head')),
      el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table' + (pad ? ' cv-corner-table' : '') },
        el('thead', {}, el('tr', {}, ...head.map((h) => el('th', { scope: 'col' }, h)))),
        el('tbody', {}, ...o.pts.map((q, i) => hotRow(el('tr', { 'data-cv-corner-row': String(i) },
          el('td', {}, String(i + 1)),
          el('td', {}, numInput(fixed(q.x, 2), (v) => { const x = num(v); if (x === null) return false; move(i, x, get().pts[i].y); }, { label: t('cv.corner.e', { n: i + 1 }) })),
          el('td', {}, el('div', { className: 'cv-row' },
            numInput(fixed(q.y, 2), (v) => { const y = num(v); if (y === null) return false; move(i, get().pts[i].x, y); }, { label: t('cv.corner.n', { n: i + 1 }) }),
            ctx.pickBtn(t('cv.pick.corner', { n: i + 1 }), (pt) => move(i, pt.x, pt.y)))),
          ...(pad ? [zCell(q, i), rowBtns(i)] : [])), i))))),
      el('p', { className: 'cv-note' }, t('cv.corners.note'))];
    if (pad) {
      out.push(el('div', { className: 'cv-actions' },
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-cv-corner-pick-add': '', onclick: () => armPick(t('cv.corner.add.pick'), (pt) => {
          const d = get(), s = d && nearestSide(d, pt.x, pt.y);
          if (!s) return;
          if (s.u < 1e-6 || s.u > 1 - 1e-6) { say(t('cv.corner.add.onside')); return; }
          if (swap(t('cv.undo.corner.add'), (x) => insertCorner(x, s.k, s.u))) say(t('cv.corner.added', { n: s.k + 2 }));
        }) }, el('i', { className: 'bi bi-crosshair', 'aria-hidden': 'true' }), ' ', t('cv.corner.add')),
        hasCornerZ(o) ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-cv-corner-level': '', onclick: () => { if (swap(t('cv.undo.corner.level'), (d) => levelPad(d))) say(t('cv.corner.levelled')); } }, t('cv.corner.level')) : null));
      const g = edgeGrades(o);
      out.push(el('p', { className: 'cv-note', 'data-cv-corner-grades': '' }, hasCornerZ(o)
        ? t('cv.corner.grades', { list: g.map((x, k) => (k + 1) + '→' + (((k + 1) % o.pts.length) + 1) + ' ' + (x === null ? '—' : (Math.abs(x) < 5e-5 ? '0.00' : (x > 0 ? '+' : '−') + (Math.abs(x) * 100).toFixed(2)) + '%')).join(' · ') })
        : t('cv.corner.z.note')));
    }
    return el('div', { 'data-cv-corners': kind }, ...out);
  }

  /** A tangent's direction from two picked points: PI k+1 turns about PI k to that direction, the tangent keeps its length. */
  function tangentBlock(a) {
    if (a.pis.length < 2) return el('span');
    const which = el('select', { className: 'cv-select', id: 'cv-tan-k', 'aria-label': t('cv.tan.which'), style: 'width:auto' }, ...a.pis.slice(1).map((_, k) => el('option', { value: String(k) }, t('cv.tan.n', { n: k + 1 }))));
    const status = el('p', { className: 'cv-note', 'data-cv-tan-status': '' }, t('cv.tan.note'));
    let A = null, B = null;
    const show = () => { status.textContent = A && B ? t('cv.tan.ready', { b: bearing(bearingBetween(A, B)) }) : A ? t('cv.tan.have.a') : t('cv.tan.note'); };
    const apply = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-cv-tan-apply': '', onclick: () => {
      if (!A || !B || !(Math.hypot(B.x - A.x, B.y - A.y) > 1e-9)) { say(t('cv.tan.need')); return; }
      const k = Number(which.value), cur = findAl(a.id)?.pis;
      if (!cur || !(Math.hypot(cur[k + 1].x - cur[k].x, cur[k + 1].y - cur[k].y) > 1e-9)) { say(t('cv.tan.fail')); return; }
      const dir = bearingBetween(A, B);
      ctx.project.change(t('cv.undo.tan', { n: k + 1 }), () => setTangent(findAl(a.id).pis, k, dir));
      say(t('cv.tan.done', { n: k + 1, b: bearing(dir) }));
    } }, t('cv.tan.apply'));
    return el('div', { 'data-cv-tangent': '' }, el('h3', { className: 'cv-h3' }, t('cv.tan.head')),
      el('div', { className: 'cv-row' }, which,
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-cv-tan-a': '', onclick: () => armPick(t('cv.tan.first'), (pt) => { A = pt; show(); }) }, el('i', { className: 'bi bi-crosshair', 'aria-hidden': 'true' }), ' ', t('cv.tan.first')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-cv-tan-b': '', onclick: () => armPick(t('cv.tan.second'), (pt) => { B = pt; show(); }) }, el('i', { className: 'bi bi-crosshair', 'aria-hidden': 'true' }), ' ', t('cv.tan.second')),
        apply), status);
  }

  /** Move, copy and rotate the selected alignment, pad, parcel or feature line (a typed distance, or two picked points). */
  function transformBlock(kind, id) {
    const LIST = { alignment: 'alignments', pad: 'pads', parcel: 'parcels', feature: 'features' }[kind], PFX = { alignment: 'a', pad: 'p', parcel: 'r', feature: 'f' }[kind];
    const get = () => (ctx.project.state[LIST] || []).find((x) => x.id === id);
    const verts = (o) => o.pis || o.pts;
    if (!get()) return el('span');
    const dx = numInput('0', () => true, { label: t('cv.tx.dx'), id: 'cv-tx-dx', width: '6rem' }), dy = numInput('0', () => true, { label: t('cv.tx.dy'), id: 'cv-tx-dy', width: '6rem' });
    const ang = numInput('0', () => true, { label: t('cv.tx.angle'), id: 'cv-tx-ang', width: '6rem', calc: false });
    let from = null, about = null;
    const aboutTxt = el('span', { className: 'cv-note', 'data-cv-tx-about': '' }, t('cv.tx.about.centre'));
    const val = (inp) => { const x = Number(inp.value); return Number.isFinite(x) ? x : null; };
    const centre = (o) => { const v = verts(o); return { x: v.reduce((m, q) => m + q.x, 0) / v.length, y: v.reduce((m, q) => m + q.y, 0) / v.length }; };
    const apply = (copy, how) => {
      const o = get(); if (!o) return;
      let mx = 0, my = 0, a = 0, c = null;
      if (how === 'move') { const x = val(dx), y = val(dy); if (x === null || y === null) { say(t('cv.tx.bad')); return; } mx = x; my = y; }
      else { const d = val(ang); if (d === null) { say(t('cv.tx.bad')); return; } a = (d * Math.PI) / 180; c = about || centre(o); }
      const run = (list) => { const t0 = list.find((x) => x.id === id); const tgt = copy ? copyOf(t0, ctx.project.nextId(PFX), t('cv.tx.copy.name', { name: t0.name }).slice(0, 120), 0, 0) : t0; if (how === 'move') translate(verts(tgt), mx, my); else rotate(verts(tgt), c.x, c.y, a); if (copy) { list.push(tgt); return tgt.id; } return null; };
      let nid = null;
      ctx.project.change(t(copy ? 'cv.undo.tx.copy' : how === 'move' ? 'cv.undo.tx.move' : 'cv.undo.tx.rotate', { name: o.name }), (st) => { nid = run(st[LIST]); });
      if (nid) { ctx.picked.clear(); ctx.sel = { kind, id: nid }; ctx.selPvi = -1; refresh(); }
      say(t(copy ? 'cv.tx.copied' : how === 'move' ? 'cv.tx.moved' : 'cv.tx.rotated', { name: o.name }));
    };
    const btn = (key, fn, attr) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', ...attr, onclick: fn }, t(key));
    return el('div', { 'data-cv-transform': kind }, el('h3', { className: 'cv-h3' }, t('cv.tx.head')),
      el('div', { className: 'cv-props' },
        ...row(t('cv.tx.dx') + ' (' + u().short + ')', dx, 'cv-tx-dx'), ...row(t('cv.tx.dy') + ' (' + u().short + ')', dy, 'cv-tx-dy')),
      el('div', { className: 'cv-row' },
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-cv-tx-from': '', onclick: () => armPick(t('cv.tx.from'), (pt) => { from = pt; say(t('cv.tx.from.done')); armPick(t('cv.tx.to'), (to) => { dx.value = String(Number((to.x - from.x).toFixed(6))); dy.value = String(Number((to.y - from.y).toFixed(6))); say(t('cv.tx.to.done')); }); }) }, el('i', { className: 'bi bi-crosshair', 'aria-hidden': 'true' }), ' ', t('cv.tx.pick.move')),
        btn('cv.tx.move', () => apply(false, 'move'), { 'data-cv-tx-move': '' }), btn('cv.tx.copy', () => apply(true, 'move'), { 'data-cv-tx-copy': '' })),
      el('div', { className: 'cv-props' }, ...row(t('cv.tx.angle') + ' (°)', ang, 'cv-tx-ang')),
      el('div', { className: 'cv-row' },
        ctx.pickBtn(t('cv.tx.about'), (pt) => { about = pt; aboutTxt.textContent = t('cv.tx.about.at', { e: fixed(pt.x, 2), n: fixed(pt.y, 2) }); }), aboutTxt),
      el('div', { className: 'cv-row' }, btn('cv.tx.rotate', () => apply(false, 'rotate'), { 'data-cv-tx-rotate': '' }), btn('cv.tx.rotcopy', () => apply(true, 'rotate'), { 'data-cv-tx-rotcopy': '' })),
      el('p', { className: 'cv-note' }, t('cv.tx.note')));
  }

  /** 0.10.1 #1970: the feature lines that shape a pad's interior (open design lines lying in it: swales, ridges, ramps), the
   *  lines in it that could, and a button to draw one. */
  function padLinesBlock(d) {
    const fs = (ctx.project.state.features || []).filter((f) => f.pts.length >= 2 && f.pts.some((p) => pointInPoly(p.x, p.y, d.pts)));
    const inUse = fs.filter((f) => f.use === 'design' && !f.closed), can = fs.filter((f) => !f.closed && f.use !== 'design' && f.pts.every((p) => pointInPoly(p.x, p.y, d.pts)));
    const pickLine = (f) => el('button', { type: 'button', className: 'cv-linkbtn', 'data-pad-line': f.id, onclick: () => { ctx.picked.clear(); ctx.sel = { kind: 'feature', id: f.id }; ctx.selPvi = -1; refresh(); } }, f.name);
    const setUse = (f, use, label, done) => { ctx.project.change(label, (st) => { const x = (st.features || []).find((q) => q.id === f.id); if (x) x.use = use; }); say(done); };
    const rows = [
      ...inUse.map((f) => el('li', { 'data-pad-line-row': f.id }, pickLine(f), ' ', el('span', { className: 'cv-unit' }, t('cv.pad.lines.shapes')), ' ',
        el('button', { type: 'button', className: 'cv-x', 'data-pad-line-out': f.id, title: t('cv.pad.lines.out', { name: f.name }), 'aria-label': t('cv.pad.lines.out', { name: f.name }), onclick: () => setUse(f, 'off', t('cv.undo.pad.line.out'), t('cv.pad.lines.out.done', { name: f.name })) }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' })))),
      ...can.map((f) => el('li', { 'data-pad-line-row': f.id }, pickLine(f), ' ',
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pad-line-add': f.id, onclick: () => setUse(f, 'design', t('cv.undo.pad.line.add'), t('cv.pad.lines.add.done', { name: f.name })) }, t('cv.pad.lines.add'))))];
    return el('div', { 'data-pad-lines': '' }, el('h3', { className: 'cv-h3' }, t('cv.pad.lines.head')),
      rows.length ? el('ul', { className: 'cv-plainlist' }, ...rows) : el('p', { className: 'cv-note', 'data-pad-lines-none': '' }, t('cv.pad.lines.none')),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pad-line-draw': '', onclick: () => { command('feature'); flUi.drawAs('design'); say(t('cv.pad.lines.draw.hint')); } }, el('i', { className: 'bi bi-bezier2', 'aria-hidden': 'true' }), ' ', t('cv.pad.lines.draw'))),
      el('p', { className: 'cv-note' }, t('cv.pad.lines.note')));
  }

  function padProps(d) {
    ui.propsH.textContent = t('cv.pad');
    const out = [], U = u();
    const padName = (v) => { ctx.project.change(t('cv.undo.pad.rename'), () => { findPad(d.id).name = v.trim().slice(0, 120) || t('cv.pad'); }, { keys: ctx.project.keysOf('pads', d.id) }); };
    const padZ = (v) => { const x = Number(v); if (!Number.isFinite(x) || v === '') return false; ctx.project.change(t('cv.undo.pad.z'), () => { findPad(d.id).z = x; }, { keys: ctx.project.keysOf('pads', d.id) }); };
    // 0.7.1 71.22: slopes typed as 3, 3:1, 33% or 18.4° (sides-ui.js slopeInput)
    const cut = slopeInput(numInput, d.cut, (x) => { ctx.project.change(t('fl.props.cut'), () => { findPad(d.id).cut = x; }, { keys: ctx.project.keysOf('pads', d.id) }); }, { id: 'cv-pad-cut', label: t('fl.props.cut') });
    const fill = slopeInput(numInput, d.fill, (x) => { ctx.project.change(t('fl.props.fill'), () => { findPad(d.id).fill = x; }, { keys: ctx.project.keysOf('pads', d.id) }); }, { id: 'cv-pad-fill', label: t('fl.props.fill') });
    if (window.ccPropGrid) {
      const C = t('cv.pad');
      out.push(propGrid('pad', C, [gridRow('name', C, t('fl.props.name'), d.name, { maxLength: 120 }), gridRow('z', C, t('pt.props.elev') + ' (' + U.short + ')', fixed(Number(d.z), 2)),
        roRow('area', C, t('cv.pad.area'), areaText(Math.abs(polyArea(d.pts)), units())), roRow('corners', C, t('dr.c.corners'), d.pts.length)],
      { name: { fn: padName }, z: { fn: padZ, calc: true } }),
      el('div', { className: 'cv-props' },   // the slopes keep slopeInput's own reader (3, 3:1, 33%, 18.4°)
        ...row(t('fl.props.cut'), el('div', { className: 'cv-row' }, cut, el('span', { className: 'cv-unit' }, ': 1 (H:V)')), 'cv-pad-cut'),
        ...row(t('fl.props.fill'), el('div', { className: 'cv-row' }, fill, el('span', { className: 'cv-unit' }, ': 1 (H:V)')), 'cv-pad-fill')));
    } else {
      const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-pad-name', value: d.name, maxLength: 120 });
      nm.addEventListener('change', () => padName(nm.value));
      const z = numInput(fixed(Number(d.z), 2), padZ, { id: 'cv-pad-z' });
      out.push(el('div', { className: 'cv-props' },
        ...row(t('fl.props.name'), nm, 'cv-pad-name'),
        ...row(t('pt.props.elev'), el('div', { className: 'cv-row' }, z, el('span', { className: 'cv-unit' }, U.short)), 'cv-pad-z'),
        ...row(t('fl.props.cut'), el('div', { className: 'cv-row' }, cut, el('span', { className: 'cv-unit' }, ': 1 (H:V)')), 'cv-pad-cut'),
        ...row(t('fl.props.fill'), el('div', { className: 'cv-row' }, fill, el('span', { className: 'cv-unit' }, ': 1 (H:V)')), 'cv-pad-fill'),
        ...row(t('cv.pad.area'), areaText(Math.abs(polyArea(d.pts)), units())),
        ...row(t('dr.c.corners'), String(d.pts.length))));
    }
    const gp = graded().items?.find((x) => x.id === d.id);
    if (gp && !gp.problems.length) {
      const cutN = gp.rays.filter((r) => r.kind === 'cut').length, fillN = gp.rays.filter((r) => r.kind === 'fill').length;
      out.push(el('p', { className: 'cv-note' }, t('cv.pad.daylight', { n: gp.rays.length, cut: cutN, fill: fillN, d: fixed(Math.max(...gp.rays.map((r) => r.d)), 2), u: U.short })));
    }
    // 0.7.1 71.22: each side its own slopes or a retaining wall, the walls' quantities and warnings
    out.push(...sidesBlock({ el, numInput: (...x) => numInput(...x), units: units(), n: d.pts.length, sides: d.sides, cut: Number(d.cut), fill: Number(d.fill), info: gp,
      change: (label, sides) => ctx.project.change(label, () => { const p = findPad(d.id); const c = cleanSides(sides, units(), p.pts.length); if (c) p.sides = c; else delete p.sides; }, { keys: ctx.project.keysOf('pads', d.id) }), idp: 'cv-pad-sd' }));
    out.push(cornersBlock('pad', d.id), padLinesBlock(d), transformBlock('pad', d.id));   // 0.9 WB.10 / WB.15 · 0.10.1 #1970
    out.push(volumeBlock());
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    ui.props.replaceChildren(...out);
  }

  // ---- pipe network
  function networkBlock() {
    const n = net(), chk = ctx.project.networkCheck(), U = u(), out = [];
    out.push(el('h3', { className: 'cv-h3' }, t('cv.net.head')));
    const type = el('select', { className: 'cv-select', id: 'cv-net-type' }, el('option', { value: 'storm' }, t('cv.net.storm')), el('option', { value: 'sanitary' }, t('cv.net.sanitary')));
    type.value = n.type;
    type.addEventListener('change', () => ctx.project.change(t('cv.undo.net.type'), (st) => { st.network.type = type.value; }));
    const rule = (k, label, id, scale, unit) => numInput(fixed(n.rules[k] * scale, scale === 100 ? 2 : 2), (v) => { const x = Number(v); if (!(x >= 0) || v === '') return false; ctx.project.change(label, (st) => { st.network.rules[k] = x / scale; }); }, { id, min: 0 });
    out.push(el('div', { className: 'cv-props' },
      ...row(t('cv.net.type'), type, 'cv-net-type'),
      ...row(t('cv.net.minslope'), el('div', { className: 'cv-row' }, rule('minSlope', t('cv.net.minslope'), 'cv-net-slope', 100), el('span', { className: 'cv-unit' }, '%')), 'cv-net-slope'),
      ...row(t('cv.net.mincover'), el('div', { className: 'cv-row' }, rule('minCover', t('cv.net.mincover'), 'cv-net-cover', 1), el('span', { className: 'cv-unit' }, U.short)), 'cv-net-cover'),
      ...row(t('cv.net.mindrop'), el('div', { className: 'cv-row' }, rule('minDrop', t('cv.net.mindrop'), 'cv-net-drop', 1), el('span', { className: 'cv-unit' }, U.short)), 'cv-net-drop')));
    out.push(el('p', { className: 'cv-note' }, t('cv.net.note')));
    out.push(el('p', { className: 'cv-note' }, t('cv.net.count', { structures: t('cv.net.structures', { n: n.structures.length }), pipes: t('cv.net.pipes', { n: n.pipes.length }) })));
    const probs = chk?.problems || [];
    out.push(probs.length ? el('div', { className: 'cv-report is-error', 'data-net-problems': '' }, el('ul', {}, ...probs.slice(0, 40).map((p) => el('li', {}, p.id ? el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { ctx.sel = { kind: p.kind === 'pipe' ? 'pipe' : 'structure', id: p.id }; refresh(); } }, p.msg) : p.msg)))) : el('p', { className: 'cv-note', 'data-net-ok': '' }, t('cv.net.ok')));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-auto-inverts': '', onclick: () => setInverts(null) }, t('cv.net.auto'))));
    out.push(...(n.type === 'sanitary' ? seUi.block() : drUi.block()));   // 0.4 V19/V20 storm; 0.6 LC.16 S1 sanitary design flows
    out.push(...stUi.block());   // 0.6 WL.27: structure types
    return out;
  }
  function setInverts(only) {
    const r = autoInverts(net(), ctx.project.pipeSurface(), units(), { only });
    ctx.project.change(t('cv.undo.net.inverts'), (st) => { st.network.pipes = r.pipes; });
    say(r.problems.length ? r.problems.join(' ') : t('cv.net.inverts.done'));
  }

  function structureProps(x) {
    ui.propsH.textContent = t('cv.st');
    const chk = ctx.project.networkCheck(), info = chk?.structs.get(x.id), U = u(), out = [];
    const stNameBox = () => { const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-st-name', value: x.name, maxLength: 60 }); nm.addEventListener('change', () => stName(nm.value)); return nm; };
    const stRimBox = () => { const rim = numInput(Number.isFinite(x.rim) ? fixed(x.rim, 2) : '', stRim, { id: 'cv-st-rim' }); rim.placeholder = rimHint; return rim; };
    const stSumpBox = () => numInput(x.sumpDepth || 0, stSump, { id: 'cv-st-sump', min: 0 });
    const stDiaBox = () => { const dia = numInput(x.dia, stDia, { id: 'cv-st-dia', min: 1 }); if (x.type) { dia.disabled = true; dia.title = t('st.dia.typed'); } return dia; };
    const stName = (v) => { ctx.project.change(t('cv.undo.st.rename'), () => { findStruct(x.id).name = v.trim().slice(0, 60) || t('cv.st'); }); };
    const stRim = (v) => { if (v === '') { ctx.project.change(t('cv.undo.st.rim.surface'), () => { findStruct(x.id).rim = null; }, { keys: ['k:network'] }); return; } const z = Number(v); if (!Number.isFinite(z)) return false; ctx.project.change(t('cv.undo.st.rim'), () => { findStruct(x.id).rim = z; }, { keys: ['k:network'] }); };
    const stSump = (v) => { const z = Number(v); if (!(z >= 0)) return false; ctx.project.change(t('cv.st.sump'), () => { findStruct(x.id).sumpDepth = z; }, { keys: ['k:network'] }); };
    const stDia = (v) => { const z = Number(v); if (!(z > 0)) return false; ctx.project.change(t('cv.undo.st.size'), () => { findStruct(x.id).dia = z; }, { keys: ['k:network'] }); };
    const rimHint = info?.rim !== null && info?.rim !== undefined ? t('cv.st.rim.ph', { z: fixed(info.rim, 2) }) : t('cv.st.rim.off');
    const rimUsed = info?.rim !== null && info?.rim !== undefined ? (info.rimFrom === 'surface' ? t('cv.st.rim.from', { z: fixed(info.rim, 2) }) : fixed(info.rim, 2)) : '—';
    if (window.ccPropGrid) {
      const C = t('cv.st');
      out.push(propGrid('structure', C, [gridRow('name', C, t('fl.props.name'), x.name, { maxLength: 60 }),
        gridRow('rim', C, t('cv.st.rim') + ' (' + U.short + ')', Number.isFinite(x.rim) ? fixed(x.rim, 2) : '', { hint: rimHint }),
        gridRow('sumpDepth', C, t('cv.st.sump') + ' (' + U.short + ')', x.sumpDepth || 0),
        gridRow('dia', C, t('cv.diameter') + ' (' + diaU().name + ')', x.dia, { readonly: !!x.type, hint: x.type ? t('st.dia.typed') : '' }),   // 0.6 WL.27: a type sets the size
        roRow('rimUsed', C, t('cv.st.rim.used'), rimUsed), roRow('sumpZ', C, t('cv.st.sump.z'), info?.sump !== null && info?.sump !== undefined ? fixed(info.sump, 2) : '—'),
        roRow('easting', C, t('pt.props.easting'), fixed(x.x, 2)), roRow('northing', C, t('pt.props.northing'), fixed(x.y, 2))],
      { name: { fn: stName }, rim: { fn: stRim, calc: true }, sumpDepth: { fn: stSump, calc: true }, dia: { fn: stDia, calc: true } }));
    } else out.push(el('div', { className: 'cv-props' },
      ...row(t('fl.props.name'), stNameBox(), 'cv-st-name'),
      ...row(t('cv.st.rim'), el('div', { className: 'cv-row' }, stRimBox(), el('span', { className: 'cv-unit' }, U.short)), 'cv-st-rim'),
      ...row(t('cv.st.sump'), el('div', { className: 'cv-row' }, stSumpBox(), el('span', { className: 'cv-unit' }, U.short)), 'cv-st-sump'),
      ...row(t('cv.diameter'), el('div', { className: 'cv-row' }, stDiaBox(), el('span', { className: 'cv-unit' }, diaU().name)), 'cv-st-dia'),
      ...row(t('cv.st.rim.used'), rimUsed),
      ...row(t('cv.st.sump.z'), info?.sump !== null && info?.sump !== undefined ? fixed(info.sump, 2) : '—'),
      ...row(t('pt.props.easting'), fixed(x.x, 2)), ...row(t('pt.props.northing'), fixed(x.y, 2))));
    out.push(el('p', { className: 'cv-note' }, t('cv.st.rim.note')));
    out.push(...stUi.structureRow(x));   // 0.6 WL.27
    const lines = [];
    for (const p of net().pipes) { if (p.to === x.id) lines.push(t('cv.st.in', { pipe: p.name, z: Number.isFinite(p.invDn) ? fixed(p.invDn, 2) : '—' })); if (p.from === x.id) lines.push(t('cv.st.out', { pipe: p.name, z: Number.isFinite(p.invUp) ? fixed(p.invUp, 2) : '—' })); }
    if (lines.length) out.push(el('ul', { className: 'cv-plainlist' }, ...lines.map((l) => el('li', {}, l))));
    const probs = (chk?.problems || []).filter((p) => p.id === x.id);
    if (probs.length) out.push(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...probs.map((p) => el('li', {}, p.msg)))));
    out.push(...(net().type === 'sanitary' ? seUi.structureRows(x) : drUi.structureRows(x)));   // 0.4 V19/V20; 0.6 LC.16 S1
    out.push(el('div', { className: 'cv-actions' }, pprUi.button(x.id)));   // 0.11 SU.1937
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    ui.props.replaceChildren(...out);
  }

  function pipeProps(p) {
    ui.propsH.textContent = t('dr.r.pipe');
    const chk = ctx.project.networkCheck(), info = chk?.pipes.get(p.id), U = u(), out = [];
    const ppName = (v) => { ctx.project.change(t('cv.undo.pp.rename'), () => { findPipe(p.id).name = v.trim().slice(0, 60) || t('dr.r.pipe'); }, { keys: ['k:network'] }); };
    const ppDia = (v) => { const z = Number(v); if (!(z > 0)) return false; ctx.project.change(t('cv.undo.pp.size'), () => { findPipe(p.id).dia = z; }, { keys: ['k:network'] }); };
    const ppInv = (k, label) => (v) => { const z = Number(v); if (!Number.isFinite(z) || v === '') return false; ctx.project.change(label, () => { findPipe(p.id)[k] = z; }, { keys: ['k:network'] }); };
    const a = findStruct(p.from), b = findStruct(p.to);
    const fromTo = (a?.name || '?') + ' → ' + (b?.name || '?'), lenT = info ? fixed(info.len, 2) + ' ' + U.short : '—';
    const slopeT = info?.slope !== null && info?.slope !== undefined ? pct(info.slope) : '—', coverT = info?.cover !== null && info?.cover !== undefined ? fixed(info.cover, 2) + ' ' + U.short : '—';
    if (window.ccPropGrid) {
      const C = t('dr.r.pipe');
      out.push(propGrid('pipe', C, [gridRow('name', C, t('fl.props.name'), p.name, { maxLength: 60 }), roRow('fromto', C, t('cv.pp.fromto'), fromTo),
        gridRow('dia', C, t('cv.diameter') + ' (' + diaU().name + ')', p.dia),
        gridRow('invUp', C, t('cv.pp.up') + ' (' + U.short + ')', Number.isFinite(p.invUp) ? fixed(p.invUp, 2) : ''), gridRow('invDn', C, t('cv.pp.dn') + ' (' + U.short + ')', Number.isFinite(p.invDn) ? fixed(p.invDn, 2) : ''),
        roRow('length', C, t('fl.props.length'), lenT), roRow('slope', C, t('cv.pp.slope'), slopeT), roRow('cover', C, t('cv.net.mincover'), coverT)],
      { name: { fn: ppName }, dia: { fn: ppDia, calc: true }, invUp: { fn: ppInv('invUp', t('cv.pp.up')), calc: true }, invDn: { fn: ppInv('invDn', t('cv.pp.dn')), calc: true } }));
    } else {
      const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-pp-name', value: p.name, maxLength: 60 });
      nm.addEventListener('change', () => ppName(nm.value));
      const inv = (k, label, id) => numInput(Number.isFinite(p[k]) ? fixed(p[k], 2) : '', ppInv(k, label), { id });
      out.push(el('div', { className: 'cv-props' },
        ...row(t('fl.props.name'), nm, 'cv-pp-name'),
        ...row(t('cv.pp.fromto'), fromTo),
        ...row(t('cv.diameter'), el('div', { className: 'cv-row' }, numInput(p.dia, ppDia, { id: 'cv-pp-dia', min: 1 }), el('span', { className: 'cv-unit' }, diaU().name)), 'cv-pp-dia'),
        ...row(t('cv.pp.up'), el('div', { className: 'cv-row' }, inv('invUp', t('cv.pp.up'), 'cv-pp-up'), el('span', { className: 'cv-unit' }, U.short)), 'cv-pp-up'),
        ...row(t('cv.pp.dn'), el('div', { className: 'cv-row' }, inv('invDn', t('cv.pp.dn'), 'cv-pp-dn'), el('span', { className: 'cv-unit' }, U.short)), 'cv-pp-dn'),
        ...row(t('fl.props.length'), lenT), ...row(t('cv.pp.slope'), slopeT), ...row(t('cv.net.mincover'), coverT)));
    }
    const probs = (chk?.problems || []).filter((x) => x.id === p.id);
    out.push(probs.length ? el('div', { className: 'cv-report is-error' }, el('ul', {}, ...probs.map((x) => el('li', {}, x.msg)))) : el('p', { className: 'cv-note' }, t('cv.pp.ok')));
    { const mat = drUi.rulesets.pipeMaterial(p, net(), (v) => ctx.project.change(t('rs.undo.mat'), () => { const q = findPipe(p.id); if (v) q.mat = v; else delete q.mat; }, { keys: ['k:network'] })); if (mat.length) out.push(el('div', { className: 'cv-props' }, ...mat)); }   // 0.11 SU.1937b
    out.push(...(net().type === 'sanitary' ? seUi.pipeRows(p) : drUi.pipeRows(p)));   // 0.4 V19/V20; 0.6 LC.16 S1
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => setInverts(new Set([p.id])) }, t('cv.pp.auto')),
      pprUi.button(p.from),   // 0.11 SU.1937: the run from this pipe's upper structure
      el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    ui.props.replaceChildren(...out);
  }

  /** 0.4 V2: one point, every field editable (point-edit.js); each change is one undo step. */
  function pointProps(p) {
    ui.propsH.textContent = t('cv.pt.head', { n: p.n });
    const commit = (field) => (v) => {
      const r = editPoint(ctx.project, p.n, { [field]: v });
      if (!r.ok) { if (r.message) say(r.message); return r.message ? false : undefined; }
      if (r.point.n !== p.n) ctx.picked = new Set([r.point.n]);
      say(r.message);
      return true;
    };
    if (window.ccPropGrid) {   // 0.8 PANEL-COMPACT: the same fields in the shared grid; each box still goes through editPoint (one undo step)
      const C = t('cv.pt.head', { n: p.n }), calc = { calc: true };
      const hs = { n: { fn: commit('n') }, x: { fn: commit('x'), ...calc }, y: { fn: commit('y'), ...calc }, z: { fn: commit('z'), ...calc }, d: { fn: commit('d') } };
      const rows = [gridRow('n', C, t('pt.props.number'), p.n), gridRow('x', C, t('pt.props.easting'), fixed(p.x, 3).replace(/,/g, '')), gridRow('y', C, t('pt.props.northing'), fixed(p.y, 3).replace(/,/g, '')),
        gridRow('z', C, t('pt.props.elev'), p.z === null ? '' : fixed(p.z, 3).replace(/,/g, ''), { hint: t('pt.props.elev.none') }), gridRow('d', C, t('pt.props.desc'), p.d || ''),
        roRow('group', C, t('pt.props.group'), ctx.project.keyOf()(p))];
      if (codesUi.keyFor(p)?.label) rows.push(roRow('key', C, t('pt.props.key'), codesUi.keyFor(p).label));
      if (p.blk) rows.push(roRow('block', C, t('pt.props.block'), t('pt.props.block.v', { block: p.blk.name, layer: p.blk.layer, handle: p.blk.handle })));
      const host = propGrid('point', C, rows, hs, { 'data-point-edit': '' });
      if (p.blk) host.setAttribute('data-has-block', '');
      ui.props.replaceChildren(host, el('p', { className: 'cv-note' }, t('pt.props.note')), ctx.pickNote());
      return;
    }
    const f = (field, value, opts) => numInput(value, commit(field), { ...opts, id: 'cv-pt-' + field, label: t('pt.props.' + opts.key), text: true, calc: ['x', 'y', 'z'].includes(field) });   // 0.6 DF.3: the number and description are words
    const grid = el('div', { className: 'cv-props', 'data-point-edit': '' },
      ...row(t('pt.props.number'), f('n', p.n, { key: 'number', width: '8rem' }), 'cv-pt-n'),
      ...row(t('pt.props.easting'), f('x', fixed(p.x, 3).replace(/,/g, ''), { key: 'easting' }), 'cv-pt-x'),
      ...row(t('pt.props.northing'), f('y', fixed(p.y, 3).replace(/,/g, ''), { key: 'northing' }), 'cv-pt-y'),
      ...row(t('pt.props.elev'), f('z', p.z === null ? '' : fixed(p.z, 3).replace(/,/g, ''), { key: 'elev' }), 'cv-pt-z'),
      ...row(t('pt.props.desc'), f('d', p.d || '', { key: 'desc' }), 'cv-pt-d'),
      ...row(t('pt.props.group'), ctx.project.keyOf()(p)), ...(codesUi.keyFor(p)?.label ? row(t('pt.props.key'), codesUi.keyFor(p).label) : []),
      // 0.5 WL.19: a point made from a block reference remembers it
      ...(p.blk ? row(t('pt.props.block'), el('span', { 'data-pt-block': '' }, t('pt.props.block.v', { block: p.blk.name, layer: p.blk.layer, handle: p.blk.handle }))) : []));
    for (const inp of grid.querySelectorAll('#cv-pt-z')) inp.placeholder = t('pt.props.elev.none');
    ui.props.replaceChildren(grid, el('p', { className: 'cv-note' }, t('pt.props.note')), ctx.pickNote());
  }
  function pickedProps() {
    const pts = ctx.pickedPoints(), zs = pts.filter((p) => p.z !== null).map((p) => p.z);
    ui.propsH.textContent = t('cv.pts.n', { n: pts.length, count: num(pts.length) });
    const dl = el('dl', { className: 'cv-dl', 'data-picked-info': '' });
    const keyOf = ctx.project.keyOf(), groups = [...new Set(pts.map(keyOf))];   // 0.4 V16: through the description keys
    fillDl(dl, [[t('cv.pk.selected'), num(pts.length)], [t('cv.pk.numbers'), numberSpan(pts)], [t('cv.sf.elevations'), zs.length ? t('cv.range', { a: fixed(Math.min(...zs), 2), b: fixed(Math.max(...zs), 2) }) : t('pt.props.elev.none')],
      [t('cv.pk.groups'), groups.slice(0, 6).join(', ') + (groups.length > 6 ? ' …' : '')]]);
    ui.props.replaceChildren(dl, ctx.pickNote());
  }

  return { projectProps, alignmentProps, cornersBlock, transformBlock, padProps, structureProps, pipeProps, pointProps, pickedProps };
}
