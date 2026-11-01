/* SPDX-License-Identifier: Apache-2.0 */
/**
 * build.js — from a laid-out job to everything the shop needs: the parts of every cabinet, filler and end panel, the fronts as
 * they are drawn, the drilling, the hardware (0.8 DC.117, session `cabinetcraft_addon`). DOM-free. It adds to the shared cabinet
 * model (model.js, hardware.js: the CadCraft Cabinets add-on's, frameless 32 mm) three things the designer workflow needs:
 *
 *   FACE FRAME   the carcass is made with a shallower depth (the frame takes `ff.t` of it); a frame of stiles and rails goes on the
 *                front; doors and drawer fronts are overlay (`ff.overlay` over the frame opening, `ff.gap` between doors, and half the
 *                rail less the gap between fronts that meet on a rail). Frame stock is hardwood cut by length, not nested on sheets
 *                (parts carry meta.linear). The drilling plan has no hinge-plate holes in the sides (the plates go on the frame).
 *   BLIND CORNER a base or wall cabinet with a closed blind part (`blind` wide) on the side away from its hinge; one door on the open
 *                part, a blind panel in front of the blind part.
 *   FILLERS AND END PANELS   flat strips and finished ends, from layout.js's cells.
 *
 *   frameRules(project, say) → { stile, rail, t, overlay, gap, mat }   (the unit of the job)
 *   buildCell(cell, ctx) → { parts, fronts, frame?, drill, kind }   ctx = { R, F, unit, construction, say }
 *   buildJob(project, { say, word }) → { project, R, F, layout, cells: [built cells], parts (every part, names written), counters,
 *       hardware (rows), drill (plans), fronts: Map(no → fronts) }
 *   word keys: part names are 'part.*' keys of model.js plus part.filler, part.end-panel, part.frame-stile, part.frame-rail,
 *   part.frame-mid-rail, part.blind-panel (the add-on's lang file has them all).
 */
import { cabinetParts, cleanCabinet, frontsOf, boxOf, slideFor, isWordKey } from './model.js';
import { drillPlan, hardwareList } from './hardware.js';
import { layoutProject } from './project.js';
import { rulesFromPicks, frameFromPicks, namesOf } from './materials.js';
import { conv, r6 } from './core.js';
import { cornerBuild, mergeHardware } from './corner.js';
import { cornerDrill } from './cornerdrill.js';

export function frameRules(project, say = (k) => k) {
  const u = project.unit;
  const st = frameFromPicks(u, project.picks, { say, custom: project.custom });
  const d = { stile: conv(38, u), rail: conv(38, u), overlay: conv(12, u), gap: conv(3, u) };
  const o = project.ff || {};
  return { stile: o.stile ?? d.stile, rail: o.rail ?? d.rail, overlay: o.overlay ?? d.overlay, gap: o.gap ?? d.gap, t: o.t ?? st.t, mat: st.mat };
}

const modelCab = (cell, construction, F) => {
  const c = { ...cell.cab, no: cell.no };
  if (construction === 'faceframe') c.d = Math.max(1, c.d - F.t);
  return c;
};

/** The frame, its openings and the overlay fronts of a face-frame cabinet (front view: x from the left side, y from the bottom incl. the plinth). */
export function frameLayout(cab, R, F, blind = 0, hinge = 'left') {
  const { kick, boxH, iw } = boxOf(cab, R);
  const blindLeft = blind > 0 && hinge === 'right';
  const x0 = F.stile + (blindLeft ? blind : 0), openW = cab.w - 2 * F.stile - blind;
  const rv = R.reveal;
  const n = cab.type === 'drawers' ? (cab.fronts ? cab.fronts.length : cab.drawers) : (cab.doors === 0 ? 0 : (boxH - rv > R.maxDoorH ? 2 : 1));
  const rails = [];                                  // y of each rail from the plinth top, bottom up
  const stack = cab.type === 'drawers' ? n : n;      // openings stacked
  const mids = Math.max(0, (cab.type === 'drawers' ? n : n) - 1);
  const openH = (boxH - (2 + mids) * F.rail) / Math.max(1, mids + 1);
  rails.push({ y: kick, h: F.rail, kind: 'rail' });
  const openings = [];
  let y = kick + F.rail;
  for (let i = 0; i < Math.max(1, stack); i++) {
    openings.push({ x: x0, y: r6(y), w: r6(openW), h: r6(openH) });
    y += openH;
    if (i < Math.max(1, stack) - 1) { rails.push({ y: r6(y), h: F.rail, kind: 'mid' }); y += F.rail; }
  }
  rails.push({ y: r6(kick + boxH - F.rail), h: F.rail, kind: 'rail' });
  const fronts = [];
  if (n > 0) {
    const edge = F.overlay, inner = (F.rail - F.gap) / 2;
    const pair = cab.type !== 'drawers' && (cab.doors === 2 || (cab.doors === 'auto' && openW + 2 * edge > R.maxDoorW));
    openings.forEach((o, i) => {
      const bottom = i === 0 ? edge : inner, top = i === openings.length - 1 ? edge : inner;
      const fy = o.y - bottom, fh = o.h + bottom + top;
      if (cab.type === 'drawers') fronts.push({ kind: 'drawer', x: r6(o.x - edge), y: r6(fy), w: r6(o.w + 2 * edge), h: r6(fh), opening: o });
      else if (pair) {
        const dw = (o.w + 2 * edge - F.gap) / 2;
        fronts.push({ kind: 'door', x: r6(o.x - edge), y: r6(fy), w: r6(dw), h: r6(fh), hinge: 'left', opening: o });
        fronts.push({ kind: 'door', x: r6(o.x - edge + dw + F.gap), y: r6(fy), w: r6(dw), h: r6(fh), hinge: 'right', opening: o });
      } else fronts.push({ kind: 'door', x: r6(o.x - edge), y: r6(fy), w: r6(o.w + 2 * edge), h: r6(fh), hinge, opening: o });
    });
  }
  return { stile: F.stile, rails, openings, fronts, boxH, kick, iw };
}

/** A blind corner's fronts (frameless): one door over the open part, a blind panel over the blind part. */
function blindFronts(cab, R, blind, hinge) {
  const { kick, boxH } = boxOf(cab, R);
  const rv = R.reveal, openW = cab.w - blind;
  const blindLeft = hinge === 'right';
  const dx = (blindLeft ? blind : 0) + rv / 2;
  const out = [{ kind: 'door', x: r6(dx), y: r6(kick + rv / 2), w: r6(openW - rv), h: r6(boxH - rv), hinge }];
  out.push({ kind: 'blind', x: r6(blindLeft ? rv / 2 : openW + rv / 2), y: r6(kick + rv / 2), w: r6(blind - rv), h: r6(boxH - rv) });
  return out;
}

const addPart = (list, no, role, name, length, width, thickness, material, extra = {}) => {
  if (!(length > 0 && width > 0)) return;
  list.push({ role, name, group: no, length: r6(length), width: r6(width), thickness, material, grain: 'length', qty: 1, band: {}, ...extra });
};
const number = (no, parts) => parts.map((p, i) => ({ ...p, id: no + '-' + String(i + 1).padStart(2, '0') }));

export function buildCell(cell, ctx) {
  const { R, F, construction: project_c } = ctx;
  if (cell.kind === 'filler') {
    const parts = [];
    addPart(parts, cell.no, 'filler', 'part.filler', cell.height, cell.w, R.frontT, R.frontMat, { band: { l1: R.bandFront } });
    return { kind: 'filler', parts: number(cell.no, parts), fronts: [], drill: [] };
  }
  if (cell.kind === 'endpanel') {
    const parts = [];
    addPart(parts, cell.no, 'end-panel', 'part.end-panel', cell.height, cell.depth, R.frontT, R.frontMat, { band: { l1: R.bandFront, w1: R.bandFront } });
    return { kind: 'endpanel', parts: number(cell.no, parts), fronts: [], drill: [] };
  }
  if (cell.kind !== 'cab') return null;
  if (cell.turn) {   // a corner cabinet that turns the corner: its own parts, no drilling plan
    const cb = cornerBuild(cell, ctx);
    const drill = cornerDrill(cb, ctx.R, ctx.hw);
    const dow = drill.reduce((q, pl) => q + pl.holes.filter((h) => h.kind === 'dowel').length, 0) / 2;
    if (dow > 0) cb.hardware = [...cb.hardware, { key: 'dowel', item: 'hw.dowel', spec: '', qty: dow }];
    return { kind: 'cab', parts: cb.parts, fronts: cb.fronts, frame: null, drill, cab: cell.cab, construction: 'frameless', blind: 0, hinge: cb.fronts[0].hinge, iw: cell.cab.w, boxH: cb.boxH, mm: R.unit === 'in' ? 25.4 : 1, items: null, corner: cb };
  }
  if (cell.tpl && cell.tpl.curved) {   // made to order: no cut list, no drilling; a segmented display body and one estimate line (flagged in checks.js)
    const cu = cell.curved;
    const f = cell.pf;
    const loc = (q) => (f ? [r6((q[0] - f.o.x) * f.u.x + (q[1] - f.o.y) * f.u.y), r6((q[0] - f.o.x) * f.n.x + (q[1] - f.o.y) * f.n.y)] : q);
    const mto = cu ? { no: cell.no, rBack: cu.rBack, rFront: cu.rFront, arcLen: cell.cab.w, d: cell.cab.d, h: cell.cab.h, psi: cu.psi, slices: cu.slices.map((sl) => sl.map(loc)) } : { no: cell.no, rBack: 0, rFront: 0, arcLen: cell.cab.w, d: cell.cab.d, h: cell.cab.h, psi: 0, slices: [] };
    return { kind: 'cab', parts: [], fronts: [], frame: null, drill: [], cab: cell.cab, construction: 'frameless', blind: 0, hinge: 'left', iw: cell.cab.w, boxH: cell.cab.h, mm: R.unit === 'in' ? 25.4 : 1, items: null, madeToOrder: mto };
  }
  const construction = cell.entry.construction || project_c;
  const ff = construction === 'faceframe';
  const cab = cleanCabinet(modelCab(cell, construction, F), R);
  if (!cab) return { kind: 'cab', parts: [], fronts: [], drill: [], bad: true };
  let parts = cabinetParts(cab, R);
  let fronts = frontsOf(cab, R);
  let frame = null;
  const blind = cell.blind || 0, hinge = cell.entry.hinge === 'right' ? 'right' : 'left';
  const mm = R.unit === 'in' ? 25.4 : 1;
  const { boxH, iw } = boxOf(cab, R);
  if (ff) {
    frame = frameLayout(cab, R, F, blind, hinge);
    fronts = frame.fronts;
    parts = parts.filter((p) => !['door', 'drawer-front', 'drawer-side', 'drawer-end', 'drawer-bottom'].includes(p.role));
    const L = [];
    const lin = { meta: { linear: true } };
    const fb = { grain: 'length' };
    addPart(L, cab.no, 'frame-stile', 'part.frame-stile', frame.boxH, F.stile, F.t, F.mat, { qty: 2, ...fb, ...lin });
    if (blind > 0) addPart(L, cab.no, 'frame-stile', 'part.frame-stile', frame.boxH, blind, F.t, F.mat, { qty: 1, ...fb, ...lin });
    const railLen = cab.w - 2 * F.stile - blind;
    const rails = frame.rails.filter((r) => r.kind === 'rail').length, mids = frame.rails.filter((r) => r.kind === 'mid').length;
    addPart(L, cab.no, 'frame-rail', 'part.frame-rail', railLen, F.rail, F.t, F.mat, { qty: rails, ...fb, ...lin });
    if (mids) addPart(L, cab.no, 'frame-mid-rail', 'part.frame-mid-rail', railLen, F.rail, F.t, F.mat, { qty: mids, ...fb, ...lin });
    const doors = fronts.filter((f) => f.kind === 'door');
    const group = (list) => { const m = new Map(); for (const f of list) { const k = f.h + 'x' + f.w; m.set(k, { f, n: (m.get(k)?.n || 0) + 1 }); } return [...m.values()]; };
    for (const { f, n } of group(doors)) addPart(L, cab.no, 'door', 'part.door', f.h, f.w, R.frontT, R.frontMat, { qty: n, band: { l1: R.bandFront, l2: R.bandFront, w1: R.bandFront, w2: R.bandFront } });
    const dr = fronts.filter((f) => f.kind === 'drawer');
    for (const { f, n } of group(dr)) addPart(L, cab.no, 'drawer-front', 'part.drawer-front', f.w, f.h, R.frontT, R.frontMat, { qty: n, band: { l1: R.bandFront, l2: R.bandFront, w1: R.bandFront, w2: R.bandFront } });
    const slide = cab.type === 'drawers' ? slideFor(cab, R) : 0;
    if (slide > 0 && dr.length) {
      const bw = frame.openings[0].w - 2 * R.slideGap, dt = R.drawerT, g = R.drawerGroove;
      const boxes = new Map();
      for (const f of dr) { const bh = r6(Math.min(f.h - R.drawerHClear, f.opening.h - conv(20, R.unit))); if (bh >= R.drawerMinH) boxes.set(bh, (boxes.get(bh) || 0) + 1); }
      for (const [bh, n] of boxes) {
        addPart(L, cab.no, 'drawer-side', 'part.drawer-side', slide, bh, dt, R.drawerMat, { qty: 2 * n, band: { l1: R.bandDrawer }, meta: { slide } });
        addPart(L, cab.no, 'drawer-end', 'part.drawer-end', bw - 2 * dt, bh, dt, R.drawerMat, { qty: 2 * n, band: { l1: R.bandDrawer } });
        addPart(L, cab.no, 'drawer-bottom', 'part.drawer-bottom', bw - 2 * dt + 2 * g, slide - 2 * dt + 2 * g, R.drawerBottomT, R.drawerBottomMat, { qty: n, grain: 'none' });
      }
    }
    parts = parts.concat(L);
    // the sides' front edge is covered by the frame: no banding there
    parts = parts.map((p) => (['side', 'bottom', 'top', 'shelf', 'shelf-fixed', 'rail'].includes(p.role) && p.band?.l1 ? { ...p, band: { ...p.band, l1: null } } : p));
  } else if (blind > 0) {
    fronts = blindFronts(cab, R, blind, hinge);
    parts = parts.filter((p) => p.role !== 'door');
    const L = [];
    const d = fronts.find((f) => f.kind === 'door'), bp = fronts.find((f) => f.kind === 'blind');
    addPart(L, cab.no, 'door', 'part.door', d.h, d.w, R.frontT, R.frontMat, { band: { l1: R.bandFront, l2: R.bandFront, w1: R.bandFront, w2: R.bandFront } });
    addPart(L, cab.no, 'blind-panel', 'part.blind-panel', bp.h, bp.w, R.frontT, R.frontMat, { band: { l1: R.bandFront, l2: R.bandFront, w1: R.bandFront, w2: R.bandFront } });
    parts = parts.concat(L);
  }
  // numbering: the model numbered its parts for this cabinet; renumber after the changes so ids run 01.. with no gaps
  const numbered = number(cab.no, parts.map((p) => ({ ...p, group: cab.no })));
  // drilling: the frameless plan; with a face frame the hinge plates go on the frame, not in the sides
  let drill = [];
  if (!ff && !blind) drill = drillPlan(cab, R);
  else {
    drill = drillPlan(cab, R).map((pl) => ({ ...pl, holes: pl.holes.filter((h) => h.kind !== 'plate') })).filter((pl) => pl.holes.length);
    const ids = new Map(numbered.map((p) => [p.role, p.id]));
    drill = drill.map((pl) => ({ ...pl, id: ids.get(pl.role) || pl.id }));
  }
  if (!ff && !blind) { const ids = new Map(numbered.map((p) => [p.role, p.id])); drill = drill.map((pl) => ({ ...pl, id: ids.get(pl.role) || pl.id })); }
  return { kind: 'cab', parts: numbered, fronts, frame, drill, cab, construction, blind, hinge, iw, boxH, mm, items: { cab, R } };
}

/** Everything for a job. `say(key, vars)` writes a library word in the person's language; `word(key)` writes a part name. */
export function buildJob(project, { say = (k) => k, word = (k) => k } = {}) {
  const R = rulesFromPicks(project.unit, project.picks, { say, custom: project.custom, over: project.rules });
  const F = frameRules(project, say);
  const depthOf = (c) => c.cab.d;
  const layout = layoutProject({ ...project, rules: project.rules }, { depthOf });
  const ctx = { R, F, construction: project.construction, say, hw: project.hw };
  const cells = [];
  const parts = [];
  for (const L of layout.runs) for (const row of ['base', 'upper']) for (const cell of L.rows[row].cells) {
    if (cell.kind === 'gap') continue;
    const b = buildCell(cell, ctx);
    if (!b) continue;
    const built = { ...b, cell, no: cell.no, run: L.run.id, row };
    cells.push(built);
    for (const p of b.parts) parts.push({ ...p, nameKey: p.name, name: isWordKey(p.name) ? word(p.name) : p.name });
  }
  // the closing panels of corners that are not right angles (project.js layout.wedges): a panel across the end of the run that stopped short
  const wedges = layout.wedges.map((wd) => {
    const host = wd.hostCab;
    const kick = host && host.cab.type !== 'wall' && R.kick !== 'none' ? R.kickH : 0;
    const height = host ? r6(host.cab.h - kick) : 0;
    const list = [];
    addPart(list, wd.no, 'filler', 'part.corner-wedge', height, wd.depth, R.frontT, R.frontMat, { band: { l1: R.bandFront }, note: say('note.corner.wedge', { tau: String(wd.tau), leg1: String(wd.leg1), leg2: String(wd.leg2) }) });
    const ps = number(wd.no, list);
    for (const p of ps) parts.push({ ...p, nameKey: p.name, name: isWordKey(p.name) ? word(p.name) : p.name });
    return { ...wd, height, parts: ps, z0: wd.row === 'upper' && host ? host.cab.elev : 0 };
  });
  const hw = mergeHardware(hardwareList(cells.filter((c) => c.kind === 'cab' && !c.bad && c.items).map((c) => c.items)), cells.flatMap((c) => (c.corner ? c.corner.hardware : [])));
  // face-frame and blind cabinets: the plates are on the frame — the counts stay (a hinge needs one plate), so the list is the same
  const { materialNames, bandNames } = namesOf(project.unit, project.picks, { say, custom: project.custom });
  return { project, R, F, layout, cells, parts, wedges, materialNames, bandNames, counters: layout.counters, hardware: hw, drill: cells.flatMap((c) => c.drill.map((pl) => ({ ...pl, no: c.no }))), fronts: new Map(cells.map((c) => [c.no, c.fronts])) };
}
