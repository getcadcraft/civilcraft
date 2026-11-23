// SPDX-License-Identifier: Apache-2.0
// lib/fence tests: numbers worked by hand. node lib/fence/test/fence.test.mjs
import * as F from '../index.js';
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('FAIL ' + m, x !== '' ? JSON.stringify(x).slice(0, 300) : ''); } };
const near = (a, b, t, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= t, `${m} (${a} vs ${b})`);
const rec = (o) => ({ id: 'fc1', pts: [{ x: 0, y: 0 }, { x: 24, y: 0 }], ...o });

// 24 m straight, spacing 2.4: 10 bays, 11 posts, 2 end, 9 line
let L = F.build(rec({ postSpacing: 2.4 }), { units: 'm' });
ok(L.posts.length === 11 && L.panels.length === 10, 'ten bays, eleven posts', [L.posts.length, L.panels.length]);
ok(L.posts.filter((p) => p.kind === 'end').length === 2 && L.posts.filter((p) => p.kind === 'line').length === 9, 'two end posts, nine line posts');
near(L.stats.length, 24, 1e-9, 'length'); near(L.panels[0].plan, 2.4, 1e-9, 'bay 2.4');
// 25 m: ceil(25/2.4)=11 bays of 2.2727
L = F.build(rec({ pts: [{ x: 0, y: 0 }, { x: 25, y: 0 }], postSpacing: 2.4 }), { units: 'm' });
ok(L.panels.length === 11, 'eleven bays for 25 m'); near(L.panels[0].plan, 25 / 11, 1e-9, 'equal bays'); ok(L.panels.every((p) => p.plan <= 2.4 + 1e-9), 'none over the spacing');
// corner
L = F.build(rec({ pts: [{ x: 0, y: 0 }, { x: 4.8, y: 0 }, { x: 4.8, y: 4.8 }], postSpacing: 2.4 }), { units: 'm' });
ok(L.posts.filter((p) => p.kind === 'corner').length === 1 && L.posts.length === 5, 'one corner post, five posts', L.posts.map((p) => p.kind));
// slight bend is a line post
L = F.build(rec({ pts: [{ x: 0, y: 0 }, { x: 4.8, y: 0 }, { x: 9.6, y: 0.5 }], postSpacing: 2.4 }), { units: 'm' });
ok(L.posts.filter((p) => p.kind === 'corner').length === 0, 'a 6 degree bend is not a corner');
// closed square 4x4, spacing 2: 8 posts, 4 corners, no end
L = F.build({ id: 'fc2', closed: true, pts: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }], postSpacing: 2 }, { units: 'm' });
ok(L.posts.length === 8 && L.panels.length === 8 && L.posts.filter((p) => p.kind === 'corner').length === 4 && !L.posts.some((p) => p.kind === 'end'), 'closed square: 8 posts, 4 corners', [L.posts.length, L.panels.length]);
near(L.stats.length, 16, 1e-9, 'closed length');
// gate 1 m at s=10 on 24 m: posts at 10 and 11 gate; spans 0-10 (5 bays of 2), 11-24 (13 / 2.4 -> 6 bays)
L = F.build(rec({ postSpacing: 2.4, gates: [{ s: 10, width: 1 }] }), { units: 'm' });
ok(L.gates.length === 1 && L.gates[0].leaves === 1, 'one single gate');
ok(L.posts.filter((p) => p.kind === 'gate').length === 2, 'two gate posts');
ok(L.panels.length === 5 + 6 && L.posts.length === 5 + 1 + 6 + 1, 'panels and posts around the gate', [L.panels.length, L.posts.length]);
L = F.build(rec({ gates: [{ s: 10, width: 3 }] }), { units: 'm' }); ok(L.gates[0].leaves === 2, 'a 3 m gate has two leaves');
// gate across a corner is refused
L = F.build(rec({ pts: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }], gates: [{ s: 4.5, width: 1 }] }), { units: 'm' }); ok(L.gates.length === 0 && L.problems.some((p) => p.code === 'gate.span'), 'gate over a vertex refused');
// raked on a 10 percent slope: ground z = 0.1 x. panel bottom parallel, gap 0.05
const slope = (x) => 0.1 * x;
L = F.build(rec({ postSpacing: 2.4, terrain: 'raked', height: 1.8, gap: 0.05 }), { zAt: slope, units: 'm' });
near(L.panels[0].a.z, 0.05, 1e-9, 'raked bottom at post 1'); near(L.panels[0].b.z, 0.24 + 0.05, 1e-9, 'raked bottom at post 2');
near(L.panels[0].len, Math.hypot(2.4, 0.24), 1e-9, 'slope length'); near(L.panels[0].gapMax, 0.05, 1e-9, 'gap stays 0.05'); ok(L.problems.length === 0, 'no problems');
near(L.posts[1].top, 0.24 + 0.05 + 1.8, 1e-9, 'post top'); near(L.posts[1].base, 0.24 - 0.6, 1e-9, 'post base is 0.6 m below ground');
// stepped: level, bottom = highest ground + gap; widest gap 0.24 + 0.05 at the low end, above maxGap 0.15 -> problem
L = F.build(rec({ postSpacing: 2.4, terrain: 'stepped', gap: 0.05 }), { zAt: slope, units: 'm' });
near(L.panels[0].a.z, 0.24 + 0.05, 1e-9, 'stepped bottom at the highest ground'); near(L.panels[0].b.z, L.panels[0].a.z, 1e-12, 'level');
near(L.panels[0].gapMax, 0.29, 1e-9, 'widest gap 0.29'); ok(L.problems.some((p) => p.code === 'gap.wide'), 'wide gap reported');
ok(L.stats.steps === 9, 'nine steps between ten level panels', L.stats.steps); near(L.panels[1].a.z - L.panels[0].a.z, 0.24, 1e-9, 'each step is 0.24');
// ground above the panel bottom (a hump)
L = F.build(rec({ pts: [{ x: 0, y: 0 }, { x: 2, y: 0 }], terrain: 'raked' }), { zAt: (x) => 0.5 * Math.sin(Math.PI * x / 2), units: 'm' }); ok(L.problems.some((p) => p.code === 'gap.ground'), 'ground through the panel reported');
// styles
L = F.build(rec({ style: 'rails', rails: 3, height: 1.2, railSize: 0.1 }), { units: 'm' }); ok(L.rails.length === 30, '3 rails x 10 bays'); near(L.rails[0].a.z, 0.05 + 0.05, 1e-9, 'lowest rail centre'); near(L.rails[2].a.z, 0.05 + 1.2 - 0.05, 1e-9, 'top rail centre');
L = F.build(rec({ style: 'pickets', postSpacing: 2.4, picketW: 0.09, picketGap: 0.01 }), { units: 'm' }); ok(L.stats.pickets === 10 * 24, 'pickets: floor((2.4+0.01)/0.10)=24 a bay', L.stats.pickets);
// off the ground: reported, still built
L = F.build(rec({}), { zAt: () => null, units: 'm' }); ok(L.problems.some((p) => p.code === 'ground.off') && L.posts.length === 11, 'unknown ground reported, fence still built');
// schedule + csv + plan items + ifc
const S = F.schedule(F.build(rec({ gates: [{ s: 10, width: 1, name: 'Side' }] }), { units: 'm' }), 'm'); ok(S.rows.some((r) => r.item === 'gate' && r.name === 'Side') && S.totals.posts === 13, 'schedule', S.totals);
ok(F.scheduleCsv(F.build(rec({}), { units: 'm' }), 'm').split('\n')[0].startsWith('"item"'), 'csv header');
ok(F.planItems(F.build(rec({ gates: [{ s: 10, width: 1 }] }), { units: 'm' })).some((i) => i.layer === 'C-FENC-GATE'), 'gate swing on the plan');
ok(F.ifcModel(F.build(rec({}), { units: 'm' }), 'm').posts.length === 11, 'ifc model');
// untrusted
ok(F.clean({ id: 'x', pts: [] }, 'm') === null && F.clean({ id: 'fc3', pts: [{ x: 0, y: 0 }, { x: 'a', y: 1 }] }, 'm') === null, 'clean refuses junk');
ok(F.clean({ id: 'fc3', pts: [{ x: 0, y: 0 }, { x: 1, y: 1 }], height: -4, style: 'x', rails: 99 }, 'm').height === 1.8, 'bad numbers take defaults');
// SU.1814b (0.11): one element per part, pickets, Library types, gates and the ground
{
  const rk = { id: 'fc7', pts: [{ x: 0, y: 0 }, { x: 4.8, y: 0 }], style: 'pickets', postSpacing: 2.4, picketW: 0.1, picketGap: 0.05, gap: 0.05, units: 'm', gates: [{ s: 2.4, width: 1.2, name: 'Side' }] };
  const lay = F.build(rk, { units: 'm', zAt: (x) => x * 0.1 });
  const pk = F.pickets(lay, rk), ps = F.parts(lay, rk);
  // bays: 2.4 m with posts at 0 / 1.2? gate edges at 1.8 and 3.0 -> count by the layout, not by assumption
  const perBay = lay.panels.map((p) => Math.floor((Math.hypot(p.b.x - p.a.x, p.b.y - p.a.y) + 0.05) / 0.15 + 1e-9));
  ok(pk.length === perBay.reduce((a, b) => a + b, 0) && pk.length === lay.stats.pickets, 'one element per picket, as many as the schedule counts', [pk.length, lay.stats.pickets]);
  ok(new Set(pk.map((k) => k.id)).size === pk.length, 'every picket has its own id');
  const k0 = pk[0], pan = lay.panels.find((p) => p.id === k0.panel), t = Math.hypot(k0.x - pan.a.x, k0.y - pan.a.y) / Math.hypot(pan.b.x - pan.a.x, pan.b.y - pan.a.y);
  near(k0.z, pan.a.z + (pan.b.z - pan.a.z) * t, 1e-6, 'a picket stands on the panel bottom line (follows the ground)');
  ok(pk.every((k) => { const p = lay.panels.find((q) => q.id === k.panel); const s = Math.hypot(k.x - p.a.x, k.y - p.a.y), L = Math.hypot(p.b.x - p.a.x, p.b.y - p.a.y); return s - k.w / 2 >= -1e-6 && s + k.w / 2 <= L + 1e-6; }), 'every picket lies inside its bay');
  const kinds = ps.reduce((m, p) => (m[p.part] = (m[p.part] || 0) + 1, m), {});
  ok(kinds.post === lay.posts.length && kinds.gate === 1 && kinds.picket === pk.length && kinds.panel === lay.panels.length, 'parts: a post, a gate and a picket each its own element', kinds);
  ok(ps.filter((p) => p.part === 'panel').every((p) => p.virtual === true), 'on a pickets fence the panel rows are virtual (the pickets are the elements)');
  ok(ps.find((p) => p.part === 'gate').ifc === 'IfcDoor' && ps.find((p) => p.part === 'post').ifc === 'IfcMember', 'IFC classes per part');
  ok(F.pickets(F.build({ ...rk, style: 'panel' }, { units: 'm' }), { ...rk, style: 'panel' }).length === 0, 'a panel fence has no pickets');
  const types = F.typeFromItem({ kind: 'fence-type', name: 'Picket 1.2 m', uuid: 'abcd1234-ef', params: { style: 'pickets', height: 1.2, postSpacing: 2, picketW: 0.09, rails: 3, bad: 5, gap: -1 } }, 'ft');
  near(types.height, 1.2 / 0.3048, 1e-4, 'a Library type is converted to the project units'); ok(types.style === 'pickets' && types.rails === 3 && types.type === 'Picket 1.2 m' && types.typeRef === 'abcd1234-ef' && !('gap' in types) && !('bad' in types), 'known fields only, a negative value dropped', types);
  ok(F.typeFromItem({ kind: 'other', params: {} }) === null && F.typeFromItem(null) === null && F.typeFromItem({ kind: 'fence-type' }) === null, 'not a fence type: null');
  ok(F.clean({ id: 'fc8', pts: [{ x: 0, y: 0 }, { x: 5, y: 0 }], typeRef: 'zz zz' }, 'm').typeRef === '' && F.clean({ id: 'fc8', pts: [{ x: 0, y: 0 }, { x: 5, y: 0 }], typeRef: 'abcd1234-ef' }, 'm').typeRef === 'abcd1234-ef', 'typeRef kept only when it looks like an id');
}
{ // 0.11 SU.1814b (su-finish-11 barriers): the Library picker's data, with a stand-in fetch. Fence types are Types in the category Barriers, sub-type fence (mm).
  const bar = (name, uuid, b, ifc = 'FENCE') => ({ format: 'cadcraft-library-item', format_version: 1, kind: 'type', category: 'types/barriers', name, uuid, ifc: { class: 'IfcRailingType', predefined: ifc }, type: { element: 'barrier', lod: 200, barrier: b }, plan: { layers: [], entities: [] }, body: null, params: {} });
  const item = bar('Rail 1.2 m', 'abcd1234-ef', { subtype: 'fence', height: 1200, style: 'rails', rails: 3, postSpacing: 2500 });
  const guard = bar('Glass guard', 'abcd1234-aa', { subtype: 'guard', height: 1070, infill: 'panel' }, 'GUARDRAIL');
  const p = F.typeFromItem(item, 'm');
  ok(p && Math.abs(p.height - 1.2) < 1e-9 && Math.abs(p.postSpacing - 2.5) < 1e-9 && p.rails === 3 && p.style === 'rails' && p.type === 'Rail 1.2 m', 'a Barriers fence type (mm) is read in metres', p);
  near(F.typeFromItem(item, 'ft').height, 1.2 / 0.3048, 1e-6, 'and in feet');
  ok(F.typeFromItem(guard, 'm') === null, 'a Barriers type of another sub-type (guard) is not a fence type');
  ok(F.typeFromItem({ ...item, type: { element: 'wall' } }) === null && F.typeFromItem({ ...item, type: null }) === null, 'a wall type or a type with no block: null');
  const asked = [];
  const items = { 'https://x.test/item.json?view=1': item, 'https://x.test/guard.json?view=1': guard };
  const fake = async (url) => { asked.push(url); if (url.includes('/items?')) return { ok: true, json: async () => ({ status: 'success', data: { items: [{ uuid: 'abcd1234-ef', name: 'Rail 1.2 m', kind: 'type', category: 'types/barriers', version: 2, item_url: 'https://x.test/item.json' }, { uuid: 'abcd1234-aa', name: 'Glass guard', kind: 'type', category: 'types/barriers', version: 1, item_url: 'https://x.test/guard.json' }, { uuid: 'zz', name: 'a wall', kind: 'type', category: 'types/walls', item_url: 'https://x.test/w.json' }] } }) }; if (items[url]) return { ok: true, json: async () => items[url] }; if (url === 'https://x.test/item.json') return { ok: true, json: async () => item }; return { ok: false }; };
  const rows = await F.libraryTypes({ fetch: fake, base: '/api/v1/library' });
  ok(asked[0] === '/api/v1/library/items?kind=type&category=types%2Fbarriers&per=100', 'libraryTypes asks for the Barriers Types', asked[0]);
  ok(rows.length === 1 && rows[0].name === 'Rail 1.2 m' && rows[0].version === 2 && rows[0].item?.uuid === 'abcd1234-ef', 'and keeps only sub-type fence (the guard and the wall left out)', rows.map((r) => r.name));
  ok(asked.includes('https://x.test/item.json?view=1') && !asked.includes('https://x.test/w.json?view=1'), 'the sub-type is read from each Barriers item with ?view=1 (not counted as an install)', asked);
  ok((await F.libraryTypes({ fetch: async () => ({ ok: false }) })).length === 0 && (await F.libraryTypes({ fetch: async () => { throw new Error('offline'); } })).length === 0, 'no Library (an error or offline): an empty list, never a made-up type');
  const got = await F.loadLibraryType(rows[0], { fetch: fake });
  ok(got && got.name === 'Rail 1.2 m' && F.typeFromItem(got, 'm').rails === 3, 'loadLibraryType gives the item read for the list');
  ok((await F.loadLibraryType({ itemUrl: 'https://x.test/item.json' }, { fetch: fake }))?.name === 'Rail 1.2 m', 'or fetches it from itemUrl');
  ok((await F.loadLibraryType({ itemUrl: 'https://x.test/missing.json' }, { fetch: fake })) === null && (await F.loadLibraryType({ item: guard })) === null, 'a missing item or a guard: null');
  ok(F.typeFromFile(JSON.stringify(item))?.name === 'Rail 1.2 m' && F.typeFromFile('﻿' + JSON.stringify(item)) !== null, 'typeFromFile reads a Library item file (with or without a BOM)');
  const old = { format: 'cadcraft-library-item', kind: 'fence-type', name: 'Old rail 1.2 m', params: { style: 'rails', height: 1.2, rails: 3 } };
  ok(F.typeFromFile(JSON.stringify(old))?.name === 'Old rail 1.2 m' && Math.abs(F.typeFromItem(old, 'm').height - 1.2) < 1e-9, 'the older item-file shape (kind fence-type, metres) is still read');
  ok(F.typeFromFile('{"kind":"door","params":{}}') === null && F.typeFromFile('not json') === null && F.typeFromFile(JSON.stringify({ ...item, format: 'other' })) === null && F.typeFromFile(JSON.stringify(guard)) === null, 'typeFromFile refuses what is not a fence type');
}
console.log(`fence: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
