/* SPDX-License-Identifier: Apache-2.0 */
// The catalog, the job's cleaning of untrusted files, the room/run layout (positions, fillers, end panels, corners, countertops).
const { ok, section, near, mine } = globalThis.__ccTest;
const C = await mine('lib/catalog.js');
const P = await mine('lib/project.js');
const M = await mine('lib/model.js');

section('Catalog');
{
  ok(C.TEMPLATES.length === 20 && new Set(C.TEMPLATES.map((x) => x.id)).size === 20, 'twenty templates (fourteen, five corner cabinets and the made-to-order curved-front one), ids unique');
  ok(['base', 'wall', 'tall'].every((g) => C.listTemplates(g).length > 0), 'every group has templates');
  const r = C.resolveEntry({ kind: 'cab', tpl: 'base-drawers3', w: 450 }, 'mm');
  ok(r.cab.type === 'drawers' && r.cab.drawers === 3 && r.cab.w === 450 && r.cab.h === 870 && r.cab.d === 560, 'a drawer base: type, three drawers, the width asked, the model default height and depth');
  const w = C.resolveEntry({ kind: 'cab', tpl: 'wall-over' }, 'mm');
  ok(w.cab.h === 360 && w.cab.elev === 1760, 'a wall cabinet over the fridge: 360 high, its top level with the other wall cabinets (1400 + 720)', JSON.stringify(w.cab));
  const bl = C.resolveEntry({ kind: 'cab', tpl: 'base-blind' }, 'mm');
  ok(bl.blind === 300 && bl.cab.w === 1050, 'a blind corner: 300 mm closed part in 1050');
  ok(C.resolveEntry({ kind: 'cab', tpl: 'base-door' }, 'mm').blind === 0, 'no blind part on an ordinary cabinet');
  const i = C.resolveEntry({ kind: 'cab', tpl: 'base-door' }, 'in');
  ok(i.cab.w === 23.625 && i.cab.h === 34.5, 'inches: the 600 mm default becomes 23 5/8 in, the model height 34.5', JSON.stringify(i.cab));
  ok(C.resolveEntry({ kind: 'cab', tpl: 'nope' }, 'mm') === null, 'an unknown template resolves to nothing');
  ok(C.widthsFor(C.templateById('base-door'), 'mm').join() === '300,350,400,450,500,550,600', 'widths in mm by 50');
  ok(C.widthsFor(C.templateById('base-door'), 'in').join() === '12,15,18,21,24', 'widths in inches by 3 within the range');
  ok(C.rowOf({ tpl: 'wall-door' }) === 'upper' && C.rowOf({ tpl: 'tall-pantry' }) === 'base', 'a wall cabinet is in the upper row, a tall one on the floor');
  ok(C.valid({ kind: 'cab', tpl: 'base-door', w: 600 }, 'mm') && !C.valid({ kind: 'cab', tpl: 'x' }, 'mm'), 'valid()');
}

section('A job read from a file is cleaned');
{
  const raw = { cabinetcraft: 1, name: '<b>x</b>\u0000' + 'y'.repeat(200), unit: 'furlongs', room: { w: 4000, d: 'abc', h: 1e9 }, construction: 'wood',
    rules: { t: 20, nope: 5, back: 'applied', reveal: -4 }, picks: { carcass: 'bogus', back: 'hdf-3', fronts: 'hdf-8' }, rates: { labour: { perHour: 60, evil: 1 }, markup: 'x', currency: 'eur' },
    runs: [{ id: 'A<', wall: 'Q', from: -10, to: 99999, base: [{ kind: 'cab', tpl: 'base-door', w: 600 }, { kind: 'cab', tpl: 'wall-door', w: 600 }, { kind: 'bogus' }, null, { kind: 'filler', w: 40 }, { kind: 'cab', tpl: '__proto__' }], upper: [{ kind: 'cab', tpl: 'wall-door', w: 600, shelves: 99, doors: 7, note: '<i>' }] }, 'junk', null] };
  const p = P.cleanProject(raw);
  ok(p.unit === 'mm' && p.name.length <= 60 && !/[<>\u0000]/.test(p.name), 'unit falls back to mm; the name is bounded and has no markup or control characters', p.name);
  ok(p.room.w === 4000 && p.room.d === 3000 && p.room.h === 1e5, 'room numbers are bounded and fall back to the defaults', JSON.stringify(p.room));
  ok(p.construction === 'frameless', 'an unknown construction is the default');
  ok(p.rules.t === 20 && p.rules.back === 'applied' && !('nope' in p.rules) && !('reveal' in p.rules), 'shop rules: known ones kept, unknown and negative dropped', JSON.stringify(p.rules));
  ok(p.picks.carcass === 'melamine-18' && p.picks.back === 'hdf-3' && p.picks.fronts === 'mdf-painted-18', 'material picks: unknown id and a board used for the wrong role are refused', JSON.stringify(p.picks));
  ok(p.rates.labour.perHour === 60 && !('evil' in p.rates.labour) && !('markup' in p.rates) && p.rates.currency === 'EUR', 'rates: only known numeric keys', JSON.stringify(p.rates));
  ok(p.runs.length === 1 && p.runs[0].wall === 'S' && p.runs[0].from === 0 && p.runs[0].to === 4000 && /^[A-Za-z0-9-]+$/.test(p.runs[0].id), 'one run survives; a bad wall is S, from and to are held inside the wall', JSON.stringify(p.runs[0]));
  ok(p.runs[0].base.length === 2 && p.runs[0].base[1].kind === 'filler', 'floor row: a wall cabinet, a bogus item, null and an unknown template are dropped', JSON.stringify(p.runs[0].base));
  const u = p.runs[0].upper[0];
  ok(u.shelves === 12 && u.doors === undefined && !/[<>]/.test(u.note || ''), 'an item: shelves capped at 12, doors 7 dropped, markup out of the note', JSON.stringify(u));
  ok(JSON.stringify(P.cleanProject(P.cleanProject(raw))) === JSON.stringify(p), 'cleaning twice changes nothing');
  ok(P.cleanProject(null).runs.length === 0 && P.cleanProject('x').unit === 'mm' && P.cleanProject([]).room.w === 3600, 'null, a string and an array give an empty job');
  const many = P.cleanProject({ runs: Array.from({ length: 50 }, (_, k) => ({ id: 'A', wall: 'S', base: Array.from({ length: 200 }, () => ({ kind: 'gap', w: 10 })) })) });
  ok(many.runs.length === 12 && many.runs.every((r) => r.base.length === 60) && new Set(many.runs.map((r) => r.id)).size === 12, 'at most 12 runs of 60 items; duplicate ids are made unique');
}

section('Layout: positions, fillers, end panels');
{
  const mk = (base, over = {}) => P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs: [{ id: 'A', wall: 'S', base, ...over }] });
  const cab = (tpl, w) => ({ kind: 'cab', tpl, w });
  let p = mk([cab('base-door', 600), cab('base-pair', 900), cab('base-drawers3', 600)]);
  let L = P.layoutProject(p).runs[0];
  let rw = L.rows.base;
  ok(rw.cells.map((c) => c.kind).join() === 'cab,cab,cab,endpanel' && rw.cells.map((c) => c.x).join() === '0,600,1500,2100' && rw.used === 2118 && rw.rest === 1482, 'three cabinets from the wall start and an end panel at the open end; 1482 left', JSON.stringify(rw.cells.map((c) => [c.no, c.x, c.w])));
  ok(rw.cells.map((c) => c.no).join() === 'B01,B02,D01,E01', 'numbered by kind in order: B01 B02 D01, then the end panel E01');
  p = mk([cab('base-door', 600), cab('base-pair', 900), cab('base-drawers3', 600), cab('base-door', 600), cab('base-pair', 880)]);
  rw = P.layoutProject(p).runs[0].rows.base;
  ok(rw.rest === 0 && rw.cells.at(-1).kind === 'filler' && rw.cells.at(-1).w === 20 && rw.cells.at(-1).auto, 'a 20 mm leftover becomes an automatic filler of 20 and the run is full', JSON.stringify(rw.cells.at(-1)));
  p = mk([cab('base-door', 600), cab('base-pair', 900), cab('base-drawers3', 600), cab('base-door', 600), cab('base-pair', 880)], { autoFiller: false });
  ok(!P.layoutProject(p).runs[0].rows.base.cells.some((c) => c.kind === 'filler'), 'no automatic filler when it is off');
  p = mk([cab('base-door', 600), cab('base-pair', 900), cab('base-drawers3', 600), cab('base-door', 600), cab('base-pair', 1000)]);
  ok(P.layoutProject(p).runs[0].rows.base.rest === -100, 'a run too long reports a negative rest: -100');
  // end panels: a run that stops in the middle of a wall shows its finished ends
  p = mk([cab('base-door', 600)], { from: 500, to: 3000 });
  rw = P.layoutProject(p).runs[0].rows.base;
  ok(rw.cells.map((c) => c.kind).join() === 'endpanel,cab,endpanel' && rw.cells[0].x === 500 && rw.cells[1].x === 518 && rw.cells[2].x === 1118, 'a run in the middle of a wall: an end panel each side (18 mm), the cabinet between', JSON.stringify(rw.cells.map((c) => [c.kind, c.x])));
  p = mk([cab('base-door', 600)], { from: 500, to: 3000, endPanels: { start: false, end: false } });
  ok(!P.layoutProject(p).runs[0].rows.base.cells.some((c) => c.kind === 'endpanel'), 'end panels can be turned off');
  p = mk([cab('base-door', 600)]);
  ok(P.layoutProject(p).runs[0].rows.base.cells.map((c) => c.kind).join() === 'cab,endpanel', 'from the start corner: no panel at the corner, one at the open end');
  ok(P.layoutProject(p).runs[0].rows.base.cells.at(-1).depth === 578 && P.layoutProject(p).runs[0].rows.base.cells.at(-1).height === 720, 'the end panel covers the depth and the front thickness (560 + 18) and the box height (720)');
}

section('Layout: a corner between two runs');
{
  const cab = (tpl, w) => ({ kind: 'cab', tpl, w });
  // south wall run to the east corner; east wall run from its start: the later run stops short by the earlier one's depth
  const p = P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs: [
    { id: 'A', wall: 'S', base: [cab('base-door', 600), cab('base-pair', 1200), cab('base-door', 600), cab('base-pair', 1200)] },
    { id: 'B', wall: 'E', base: [cab('base-door', 600), cab('base-door', 600)] }] });
  const L = P.layoutProject(p);
  const A = L.runs[0].rows.base, B = L.runs[1].rows.base;
  ok(A.rest === 0 && A.blocked.end === 0 && B.blocked.start === 560, 'both reach the corner: the second run is blocked 560 at its start (the first one\'s depth)', JSON.stringify([A.blocked, B.blocked]));
  ok(B.cells[0].x === 560 && B.start === 560, 'its first cabinet starts 560 along its wall');
  // when the first run does not reach the corner nothing is blocked
  const q = P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs: [
    { id: 'A', wall: 'S', base: [cab('base-door', 600)] }, { id: 'B', wall: 'E', base: [cab('base-door', 600)] }] });
  ok(P.layoutProject(q).runs[1].rows.base.blocked.start === 0, 'a run that stops short of the corner blocks nothing');
  // the earlier run in the list is the one that reaches the corner by its end: the later run is the one that starts there
  const r = P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs: [
    { id: 'B', wall: 'E', base: [cab('base-door', 600)] },
    { id: 'A', wall: 'S', base: [cab('base-door', 600), cab('base-pair', 1200), cab('base-door', 600), cab('base-pair', 1200)] }] });
  const R2 = P.layoutProject(r);
  ok(R2.runs[1].rows.base.blocked.end === 560 && R2.runs[0].rows.base.blocked.start === 0 && R2.runs[1].rows.base.rest === -560, 'list order decides: the first-listed run keeps the corner; the other is cut short and goes over by 560');
  // upper row blocked separately by wall cabinet depth
  const s = P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs: [
    { id: 'A', wall: 'S', upper: [cab('wall-pair', 1200), cab('wall-pair', 1200), cab('wall-pair', 1200)] },
    { id: 'B', wall: 'E', upper: [cab('wall-door', 600)] }] });
  ok(P.layoutProject(s).runs[1].rows.upper.blocked.start === 320, 'wall cabinets block by their own depth (320)');
}

section('Countertops');
{
  const cab = (tpl, w) => ({ kind: 'cab', tpl, w });
  const p = P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs: [{ id: 'A', wall: 'S', base: [cab('tall-pantry', 600), cab('base-door', 600), { kind: 'gap', w: 600, counter: true }, cab('base-pair', 900), { kind: 'gap', w: 300 }, cab('base-door', 600)] }] });
  const L = P.layoutProject(p);
  ok(L.counters.length === 2 && L.counters[0].no === 'C01', 'a tall cabinet and a gap with no counter break the counter: two pieces', String(L.counters.length));
  const c = L.counters[0];
  ok(c.x0 === 600 && c.x1 === 2700 && c.length === 2100 && c.width === 585 && c.ends.start === 'butt' && c.ends.end === 'butt', 'first piece: from the tall cabinet to the loose gap, over the appliance space, no overhang at either butt', JSON.stringify(c));
  ok(L.counters[1].ids.join() === 'B03' && L.counters[1].ends.start === 'butt' && L.counters[1].ends.end === 'wall' && L.counters[1].length === 600, 'second piece over the last cabinet, against the wall at its end');
  ok(L.counters.every((x) => x.depth === 560), 'depth = the deepest cabinet; width adds the front overhang');
  const q = P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs: [{ id: 'A', wall: 'S', from: 500, to: 2000, base: [cab('base-door', 600)], endPanels: { start: false, end: false } }] });
  const o = P.layoutProject(q).counters[0];
  ok(o.ends.start === 'open' && o.ends.end === 'open' && o.length === 650 && o.x0 === 475, 'open ends take the 25 mm overhang', JSON.stringify(o));
  const r = P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs: [{ id: 'A', wall: 'S', from: 500, to: 2000, base: [cab('base-door', 600)] }] });
  const pe = P.layoutProject(r).counters[0];
  ok(pe.ends.start === 'panel' && pe.ends.end === 'panel' && pe.length === 636, 'next to an end panel the counter covers the panel and has no overhang', JSON.stringify(pe));
}
