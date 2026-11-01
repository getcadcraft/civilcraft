/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --regs` (0.8 REG.1, owner 2026-10-25): the `regs` add-on's regulation packs in Node — the pack format and its
 * refusals, inheritance (base → city), the two packs in addons/regs/packs, the stair checks following the chosen pack, and the room
 * checks on a model made here (a 4 m × 5 m room, windows placed through the real ops, read back from the IFC).
 * Called by bin/test-bimcraft.mjs with what it has set up (the build's folder, the engine, quiet()).
 */
import path from 'node:path';
import fs from 'node:fs';

export async function regsMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  const R = await import(path.join(APP, 'addons/regs/lib/regs.js'));
  const C = await import(path.join(APP, 'addons/regs/lib/check.js'));
  const A = await import(path.join(APP, 'addons/regs/lib/active.js'));
  const HOOK = await import(path.join(APP, 'rules-hook.js'));
  const ST = await import(path.join(APP, 'res-stair.js'));
  A.setLimitsApplier(ST.useStairLimits);   // the engine has no app imports: the app hands it the way to apply stair limits
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { loopsOf } = OPS;
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const IN = 25.4;
  const read = (f) => JSON.parse(fs.readFileSync(path.join(APP, 'addons/regs/packs', f), 'utf8'));
  const fetchJson = async (url) => read(url.split('/').pop());   // the loader's file reads, from disk

  console.log('== the pack format');
  const us = R.cleanPack(read('us-irc-2021.json')), za = R.cleanPack(read('za-sans10400.json'));
  ok(us.ok && za.ok, 'both packs in addons/regs/packs pass cleanPack' + (us.errors.concat(za.errors).length ? ': ' + us.errors.concat(za.errors).join('; ') : ''));
  ok(za.pack.review.state === 'unchecked' && za.pack.rules.every((r) => /not confirmed/i.test(r.note) || r.id === 'x'), 'the South African pack says it is unchecked, and every rule says "not confirmed"');
  ok(us.pack.review.state === 'draft', 'the United States pack is a draft (entered from the published code, not yet reviewed)');
  const limits = R.stairLimitsFrom(R.resolve(new Map([[us.pack.id, us.pack]]), us.pack.id));
  ok(['riserMax', 'treadMin', 'widthMin', 'headroom', 'railMin', 'railMax'].every((k) => Math.abs(limits[k] - ST.STAIR_LIMITS[k]) < 1e-9), 'the United States pack repeats the built-in stair limits exactly (' + JSON.stringify(limits) + ')');
  const mut = (f) => { const p = JSON.parse(JSON.stringify(read('us-irc-2021.json'))); f(p); return R.cleanPack(p); };
  ok(!R.cleanPack(null).ok && !R.cleanPack([]).ok && !R.cleanPack({ format: 'x' }).ok, 'not a pack: refused');
  ok(!mut((p) => { p.version = 2; }).ok && !mut((p) => { p.id = 'Bad Id'; }).ok && !mut((p) => { p.jurisdiction.country = 'zaf'; }).ok && !mut((p) => { p.jurisdiction.level = 'planet'; }).ok, 'wrong version, id, country code or level: refused');
  ok(!mut((p) => { p.rules[0].op = '>='; }).ok, 'a known rule with the wrong operator is refused (stair.riser.max is a maximum)');
  ok(!mut((p) => { p.rules[0].unit = 'pct'; }).ok && !mut((p) => { p.rules[0].value = -1; }).ok && !mut((p) => { p.rules[0].value = 'ten'; }).ok && !mut((p) => { delete p.rules[0].label; }).ok, 'a wrong unit, a negative or text value, a missing label: refused');
  ok(!mut((p) => { p.rules.push({ ...p.rules[0] }); }).ok && !mut((p) => { p.rules = new Array(201).fill(0).map((_, i) => ({ id: 'a.r' + i, op: '<=', unit: 'mm', value: 1, label: 'x' })); }).ok, 'a rule listed twice, or more than 200 rules: refused');
  ok(!mut((p) => { p.rules[4].min = 1000; p.rules[4].max = 900; }).ok, 'a between rule with min above max: refused');
  const dirty = mut((p) => { p.name = 'Name\u0000 with‮  controls <b>'; p.source.url = 'javascript:alert(1)'; p.extra = { evil: true }; p.rules[0].label = 'A\nB'; });
  ok(dirty.ok && !/[\u0000‮]/.test(dirty.pack.name) && dirty.pack.source.url === '' && !('extra' in dirty.pack) && dirty.pack.rules[0].label === 'A B', 'control characters are removed, a non-https link is dropped, unknown fields are not kept');

  console.log('== inheritance: country → state → city');
  const mk = (id, base, rules, state = 'reviewed') => R.cleanPack({ format: R.FORMAT, version: 1, id, name: id, jurisdiction: { country: 'ZA', level: base ? 'city' : 'country' }, base, edition: '', in_force: null, review: { state, note: '' }, source: {}, rules }).pack;
  const rule = (id, value, extra = {}) => ({ id, op: id.endsWith('.max') ? '<=' : '>=', unit: id.startsWith('room.') && !id.includes('ceiling') ? 'pct' : 'mm', value, label: id, ...extra });
  const country = mk('zz-country', null, [rule('stair.riser.max', 200), rule('stair.tread.min', 250), rule('room.light.min', 10)]);
  const state = mk('zz-state', 'zz-country', [rule('stair.riser.max', 190)], 'draft');
  const city = mk('zz-city', 'zz-state', [rule('room.light.min', 12), { id: 'stair.tread.min', remove: true }, rule('room.ceiling.min', 2600)], 'reviewed');
  const set = new Map([country, state, city].map((p) => [p.id, p]));
  const pc = R.resolve(set, 'zz-city');
  ok(pc && pc.chain.map((p) => p.id).join() === 'zz-country,zz-state,zz-city', 'a city pack resolves with its state and country under it');
  ok(pc.rule('stair.riser.max').value === 190 && pc.rule('stair.riser.max').from === 'zz-state', 'the state changes the country rule, and the profile says where it came from');
  ok(pc.rule('room.light.min').value === 12 && pc.rule('room.light.min').from === 'zz-city', 'the city changes it again');
  ok(pc.rule('stair.tread.min') === null && pc.rule('room.ceiling.min').value === 2600, 'the city removes one inherited rule and adds one');
  ok(pc.review.state === 'draft', 'the pack is only as trusted as the weakest pack under it (a draft state under a reviewed city)');
  ok(R.resolve(set, 'zz-state').rule('stair.tread.min').value === 250 && R.resolve(set, 'nope') === null, 'a lower level is unaffected by the one above it; an unknown id is null');
  const cyc = new Map([['zz-a', { ...country, id: 'zz-a', base: 'zz-b' }], ['zz-b', { ...country, id: 'zz-b', base: 'zz-a' }]]);
  ok(R.resolve(cyc, 'zz-a') === null && R.resolve(new Map([['zz-o', { ...country, id: 'zz-o', base: 'zz-gone' }]]), 'zz-o') === null, 'a cycle, or a missing base pack: null (never a half-built profile)');

  console.log('== the hook core BimCraft asks (no add-on: no rules)');
  const heard = [];
  const offHook = HOOK.onRules((p) => heard.push(p && p.id));
  ok(HOOK.rules() === null, 'without an add-on the hook gives nothing');
  HOOK.setRules({ id: 'x', tag: () => 'tag' });
  ok(HOOK.rules().tag() === 'tag' && heard.join() === 'x', 'an add-on\'s provider is returned and the listeners are told');
  HOOK.setRules(null);
  ok(HOOK.rules() === null && heard.length === 2 && heard[1] === null, 'switched off: back to nothing, listeners told');
  HOOK.setRules('not an object'); ok(HOOK.rules() === null, 'a provider that is not an object is ignored');
  offHook();

  console.log('== the loader and the active pack');
  const seen = [];
  const stop = A.onRegsChange((list) => seen.push(list.map((p) => p.id).join('+')));
  A.setAppliesFilter(['stair', 'room', 'door', 'window', 'building', 'storey', 'foundation', 'wall', 'header', 'floor', 'roof']);   // BimCraft's main.js sets the same: the drawing, zoning, road and connection packs belong to other apps
  await A.loadPacks({ fetchJson, base: 'file:///packs/' });
  ok(A.listPacks().map((p) => p.id).join() === 'us-irc-2021,za-sans10400,us-sample-maker-stairs' && A.activeId() === 'us-irc-2021' && !A.loadProblems().length, 'loaded: the list, the default pack active, no problems');
  ok(Math.abs(ST.stairLimits().riserMax - ST.STAIR_LIMITS.riserMax) < 1e-9, 'the default pack leaves the stair limits as they were');
  const bad1 = await (async () => { A.setActivePack('us-irc-2021'); await A.loadPacks({ fetchJson: async (u) => (u.endsWith('index.json') ? { packs: ['us-irc-2021', 'zz-broken', '../etc'], default: 'us-irc-2021' } : u.endsWith('us-irc-2021.json') ? read('us-irc-2021.json') : { format: 'nope' }), base: 'x/' }); return A.loadProblems(); })();
  ok(bad1.length === 1 && /zz-broken/.test(bad1[0]) && A.listPacks().length === 1, 'a pack that does not validate is left out and reported; an unsafe id in the list is ignored');
  await A.loadPacks({ fetchJson, base: 'file:///packs/' });

  console.log('== stairs follow the chosen pack');
  const spec = (extra = {}) => ({ kind: 'straight', turn: 'left', start: [0, 0], angle: 0, width: 36 * IN, height: 3000, riserMax: 196.85, tread: 254, ...extra });
  A.setActivePack('us-irc-2021');
  ok(ST.stairLayout(spec()).checks.riser && Object.values(ST.stairLayout(spec()).checks).every(Boolean), 'United States: the default stair meets every limit');
  ok(!ST.stairLayout(spec({ tread: 252 })).checks.tread && !ST.stairLayout(spec({ riserMax: 205 })).checks.riser && !ST.stairLayout(spec({ width: 700 })).checks.width, 'United States: a 252 mm tread, a 200 mm riser and a 700 mm width all fail');
  A.setActivePack('za-sans10400');
  ok(ST.stairLimits().riserMax === 200 && ST.stairLimits().treadMin === 250 && ST.stairLimits().widthMin === null && ST.stairLimits().railMin === null, 'South Africa: riser at most 200, tread at least 250; no width or rail rule in this sample pack');
  ok(ST.stairLayout(spec({ tread: 252 })).checks.tread && ST.stairLayout(spec({ riserMax: 205 })).checks.riser && ST.stairLayout(spec({ riserMax: 205 })).riser <= 200 + 1e-6, 'South Africa: the same 252 mm tread passes, and a 200 mm riser passes');
  ok(!ST.stairLayout(spec({ tread: 240 })).checks.tread && !ST.stairLayout(spec({ riserMax: 215 })).checks.riser, 'South Africa: a 240 mm tread and a 215 mm riser fail');
  ok(ST.stairLayout(spec({ width: 700, railHeight: 500 })).checks.width && ST.stairLayout(spec({ width: 700, railHeight: 500 })).checks.rail, 'a rule the pack leaves out is not checked (width and handrail pass in the sample pack)');
  ok(seen.includes('za-sans10400') && seen.filter((x) => x === 'us-irc-2021').length >= 1, 'switching tells the listeners');
  ok(A.setActivePack('no-such-pack').id === 'us-irc-2021', 'an unknown pack id falls back to the default');
  A.setActivePack('us-irc-2021'); stop();

  console.log('== ticked packs (owner 2026-10-26): several at once, how they combine, paid packs, your own packs');
  const ids = (list) => list.map((p) => p.id).join('+');
  ok(ids(A.setActivePacks(['us-irc-2021', 'za-sans10400'])) === 'us-irc-2021+za-sans10400', 'two ticked packs: each checked on its own');
  ok(ST.stairLimits().riserMax === 196.85 && ST.stairLimits().treadMin === 254, 'a new stair starts from the tightest of them (IRC riser 196.85, tread 254)');
  A.setMode('strict');
  const strict = A.profiles();
  ok(strict.length === 1 && strict[0].id === 'strict' && strict[0].rule('room.ceiling.min').value === 2400 && strict[0].rule('room.ceiling.min').from === 'za-sans10400' && strict[0].rule('stair.riser.max').from === 'us-irc-2021', 'strictest: one set of rules, the tighter limit from whichever pack has it');
  const PR = await import(path.join(APP, 'addons/regs/lib/problems.js'));
  const sp = PR.regsProblems([{ kind: 'room', where: 'R1', ref: 'g1', id: 'room.ceiling.min', label: 'Room height', clause: 'Part C', op: '>=', req: 2400, unit: 'mm', found: 2300, ok: false }], strict[0]);
  ok(sp.length === 1 && sp[0].source.pack.id === 'za-sans10400', 'strictest: a problem names the ticked pack its limit came from, never "strict"');
  A.setMode('chain');
  ok(ids(A.setActivePacks(['us-irc-2021', 'us-sample-maker-stairs'])) === 'us-sample-maker-stairs', 'chain: a pack that another ticked pack builds on is left out (the lower one overrides)');
  A.setMode('each');
  ok(ids(A.profiles()) === 'us-irc-2021+us-sample-maker-stairs', 'each: both again');
  ok(A.setActivePacks([]).length === 0 && ST.stairLimits().riserMax === ST.STAIR_LIMITS.riserMax, 'nothing ticked: nothing checked, the built-in stair limits back');
  ok(ids(A.setActivePacks(['gone-pack'])) === 'us-irc-2021', 'a stored choice whose packs are all gone falls back to the default');
  const sample = A.listPacks().find((p) => p.id === 'us-sample-maker-stairs');
  ok(sample.price && sample.price.amount === 5 && sample.price.currency === 'USD' && sample.maker.name && !sample.own, 'the test maker pack is paid (price, currency, the maker\'s page) and is not "your pack"');
  ok(A.packProfile('us-sample-maker-stairs').list().length === A.packProfile('us-irc-2021').list().length, 'an unticked pack resolves with the rules it builds on (its 2 override the IRC 2021 pack\'s, the rest come from it)');
  const priceBad = (price) => R.cleanPack({ ...read('us-irc-2021.json'), price }).errors.join();
  ok(/price.amount/.test(priceBad({ amount: 0, currency: 'USD', url: 'https://x.test/' })) && /price.currency/.test(priceBad({ amount: 5, currency: 'usd', url: 'https://x.test/' })) && /price.url/.test(priceBad({ amount: 5, currency: 'USD', url: 'http://x.test/' })), 'a price needs an amount above 0, an ISO currency and an https shop page');
  const mine = { ...read('za-sans10400.json'), id: 'za-my-office', name: 'My office stairs', review: { state: 'reviewed', note: '' } };
  const up = A.addOwnPack(mine);
  ok(up.ok && A.listPacks().find((p) => p.id === 'za-my-office').own === true && up.pack.review.state === 'draft', 'an uploaded pack is listed as your own and never "reviewed" (a claim of review becomes draft)');
  ok(!A.addOwnPack({ ...read('us-irc-2021.json') }).ok && !A.addOwnPack({ format: 'nope' }).ok, 'an upload with a built-in pack\'s id, or not a pack, is refused');
  A.setActivePacks(['za-my-office']);
  ok(ids(A.profiles()) === 'za-my-office' && A.ownPacks().length === 1, 'your own pack can be ticked; ownPacks() is what the add-on stores');
  ok(A.removeOwnPack('za-my-office') && !A.listPacks().some((p) => p.id === 'za-my-office') && A.activeIds().length === 0, 'removing it unlists and unticks it (it was the only tick: nothing is checked, and Settings says so)');
  A.setOwnPacks([mine, { format: 'nope' }]);
  ok(A.ownPacks().length === 1, 'stored own packs are cleaned again on load; a bad one is dropped');
  A.setOwnPacks([]);
  const sch = C.regsSchedule([{ where: 'R1', pack: 'A', label: 'x', clause: '1', op: '>=', req: 1, unit: 'mm', found: 2, ok: true }], [A.packProfile('us-irc-2021'), A.packProfile('za-sans10400')], { fmtLen: (v) => v + ' mm', t: (k) => k });
  ok(sch.head.length === 7 && sch.head[1] === 'regs.col.pack' && sch.rows[0][1] === 'A' && sch.total.length === 7, 'two packs in the schedule: a Pack column after Where');
  A.setActivePack('us-irc-2021');

  console.log('== regions, Library packs and the drawing\'s own ticks (owner decisions 7 and 8)');
  ok(A.regions() === null && A.listPacks().length === 3, 'no region picked yet: every bundled pack is shown, as before');
  A.setRegions(['ZA']);
  ok(A.listPacks().map((p) => p.id).join() === 'za-sans10400' && A.listedIds().length === 0, 'South Africa picked: only its packs are shown; the listed IRC is not shown, so nothing is listed');
  A.setRegions([]);
  ok(A.listPacks().length === 0 && A.profiles().length === 0, 'no region: no pack shown, nothing checked');
  const libZa = { ...read('za-sans10400.json'), name: 'South Africa from the Library', review: { state: 'draft', note: '' } };
  A.setLibraryPacks([{ pack: libZa, uuid: '906820f4-673e-4d0c-a734-7d39444f1c70', version: 2 }, { pack: { format: 'nope' } }]);
  A.setRegions(['ZA', 'US']);
  const zaLib = A.listPacks().find((p) => p.id === 'za-sans10400');
  ok(zaLib.from === 'library' && zaLib.name === 'South Africa from the Library' && zaLib.version === 2, 'a Library pack wins over the bundled one with its id (and a bad one is dropped)');
  A.setActivePacks(['us-irc-2021', 'za-sans10400']);
  ok(ids(A.profiles()) === 'us-irc-2021+za-sans10400' && A.drawing() === null, 'no drawing ticks: the listed packs are checked');
  A.setDrawing({ packs: ['za-sans10400'], rulesOff: ['za-sans10400:room.vent.min', 'bad key'], mode: 'each' });
  ok(ids(A.profiles()) === 'za-sans10400' && A.profiles()[0].rule('room.vent.min') === null && A.profiles()[0].rule('room.light.min') !== null, 'the drawing\'s ticks win: one pack, its ventilation rule switched off');
  ok(A.drawing().rulesOff.length === 1 && A.listedIds().join() === 'us-irc-2021,za-sans10400', 'a bad rule key is dropped; the listed packs are unchanged');
  A.setDrawing({ packs: ['us-irc-2021', 'za-sans10400'], rulesOff: [], mode: 'strict' });
  ok(A.mode() === 'strict' && A.appMode() === 'each' && A.profiles().length === 1, 'the drawing\'s mode wins over the app\'s (strict: one combined profile)');
  A.setDrawing(null);
  ok(A.mode() === 'each' && ids(A.profiles()) === 'us-irc-2021+za-sans10400', 'Use my defaults: back to the listed packs and the app\'s mode');
  const LB = await import(path.join(APP, 'addons/regs/lib/library.js'));
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const item = (pack) => ({ format: 'cadcraft-library-item', kind: 'regulation', regulation: pack });
  const fake = (over = {}) => async (url) => {
    if (url.endsWith('/api/v1/library/regulations')) return { data: { countries: [{ country: 'ZA', name: 'South Africa', packs: 1, bytes: 3000, paid: 0 }] } };
    if (url.endsWith('/api/v1/library/regulations/ZA')) return { data: { name: 'South Africa', packs: [{ uuid: 'u1', version: 3, pack_id: 'za-sans10400', name: 'SANS', file_url: 'https://getcadcraft.com/api/v1/library/items/u1/3/item.json' }] } };
    if (url.endsWith('/item.json')) return over.item || item(read('za-sans10400.json'));
    throw new Error('HTTP 404');
  };
  ok(LB.regionCodes() === null, 'nothing installed yet: regionCodes() is null (never picked)');
  ok((await LB.countries({ fetchJson: fake() }))[0].country === 'ZA', 'countries(): the Library\'s list');
  const inst = await LB.install('ZA', { fetchJson: fake() });
  ok(inst.ok && inst.packs.length === 1 && LB.regionCodes().join() === 'ZA' && LB.installedPacks()[0].version === 3 && LB.installedPacks()[0].region === 'ZA', 'install(ZA): its pack fetched, checked and kept (version 3)');
  const badInst = await LB.install('ZA', { fetchJson: fake({ item: item({ ...read('us-irc-2021.json') }) }) });
  ok(!badInst.ok && LB.installedPacks()[0].pack.id === 'za-sans10400', 'a pack that is not the one listed refuses the whole region and keeps what was installed');
  const raw = JSON.parse(store.get('cc-regs:library'));
  raw.regions.ZA.packs.push({ pack: { format: 'nope' } }, { pack: read('us-irc-2021.json') });
  store.set('cc-regs:library', JSON.stringify(raw));
  ok(LB.installedPacks().length === 1, 'a broken or misplaced pack in the store is dropped when read');
  LB.remove('ZA');
  ok(LB.regionCodes().length === 0, 'remove(ZA): no region (an empty list, not "never picked")');
  delete globalThis.localStorage;
  A.setLibraryPacks([]); A.setRegions(null); A.setActivePack('us-irc-2021');

  console.log('== the model against the rules (a real model: a 4 m × 5 m room, windows through the real ops)');
  const lv = (n, h) => N.stackLevels(n, h, (i) => 'Level ' + (i + 1));
  const text = N.newBuilding({ name: 'Regs', levels: lv(2, 3000), fileName: 'regs.ifc', now: new Date('2026-10-25T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, eng);
  const levels = OPS.snapshotModel(ed).levels;
  const P = [[0, 0], [4000, 0], [4000, 5000], [0, 5000]];
  ed.modelChange(OPS.drawWalls({ storey: levels[0].guid, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: levels[1].guid, height: 3000, extSide: 'right' }));
  const wallOn = (a, b) => OPS.snapshotModel(ed).walls.find((w) => Math.hypot(w.a[0] - a[0], w.a[1] - a[1]) < 1 && Math.hypot(w.b[0] - b[0], w.b[1] - b[1]) < 1);
  const south = wallOn([0, 0], [4000, 0]), north = wallOn([4000, 5000], [0, 5000]);
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-double-hung', offset: 1000, face: 'right' }));
  const t = (k, v) => (v ? k + ' ' + JSON.stringify(v) : k);
  const fmtLen = (mm) => Math.round(mm) + ' mm';
  const view = () => { const snap = OPS.snapshotModel(ed), loops = new Map(levels.map((l) => [l.id, loopsOf(ed, l.id)])); return { snap, loops }; };
  const rowsFor = (id) => { const { snap, loops } = view(); A.setActivePack(id); return C.roomRows(snap, loops, A.activeProfile()); };
  let v = view();
  ok(v.snap.derived.spaces.length === 1, 'drawing the walls made one room');
  const area = v.loops.get(levels[0].id).rooms[0].area / 1e6;
  const win = v.snap.openings.find((o) => o.kind === 'window');
  const glaze1 = win.width * win.height / (area * 1e6) * 100;
  let rows = rowsFor('us-irc-2021');
  const by = (id) => rows.find((r) => r.id === id);
  ok(rows.filter((r) => ['room.ceiling.min', 'room.light.min', 'room.vent.min'].includes(r.id)).length === 3 && by('room.area.min') && by('room.dim.min'), 'United States: the ceiling, glazing and openable rows, and (tier 2) area and least dimension');
  ok(Math.abs(by('room.light.min').found - glaze1) < 0.01 && by('room.light.min').found < 8 && by('room.light.min').ok === false, 'one double-hung window: ' + by('room.light.min').found.toFixed(2) + ' % glazing: under 8 %, fails');
  ok(Math.abs(by('room.vent.min').found - glaze1 / 2) < 0.01 && by('room.vent.min').ok === false, 'a hung window opens half: ' + by('room.vent.min').found.toFixed(2) + ' % openable: under 4 %, fails');
  ok(Math.abs(by('room.ceiling.min').found - 3000) < 1 && by('room.ceiling.min').ok === true, 'the wall height (3000 mm) meets 2134 mm');
  ed.modelChange(OPS.placeOpening({ wall: north.guid, typeKey: 'win-double-hung', offset: 1000, face: 'right' }));
  rows = rowsFor('us-irc-2021');
  ok(Math.abs(by('room.light.min').found - 2 * glaze1) < 0.01 && by('room.light.min').ok === true && by('room.vent.min').ok === true, 'a second window on the other wall: ' + by('room.light.min').found.toFixed(2) + ' % glazing meets 8 %, ' + by('room.vent.min').found.toFixed(2) + ' % openable meets 4 %');
  ed.modelChange(OPS.placeOpening({ wall: wallOn([4000, 0], [4000, 5000]).guid, typeKey: 'win-fixed', offset: 1000, face: 'right' }));
  rows = rowsFor('us-irc-2021');
  const glaze3 = (2 * win.width * win.height + 48 * IN * 48 * IN) / (area * 1e6) * 100;
  ok(Math.abs(by('room.light.min').found - glaze3) < 0.01 && Math.abs(by('room.vent.min').found - glaze1) < 0.01, 'a fixed window adds glazing but nothing to the openable area (' + by('room.light.min').found.toFixed(2) + ' % / ' + by('room.vent.min').found.toFixed(2) + ' %)');
  rows = rowsFor('za-sans10400');
  ok(by('room.light.min').ok === (glaze3 >= 10) && by('room.light.min').req === 10 && by('room.ceiling.min').req === 2400 && by('room.vent.min').req === 5, 'South Africa: the same room against 10 % / 5 % / 2400 mm (the sample pack\'s numbers)');
  ok(C.roomRows(v.snap, v.loops, null).length === 0 && C.stairRows([{ layout: {} }], null).length === 0, 'no pack: no rows');
  // a window with no room behind it (an exterior-only wall) and a wall with a window on a level with no rooms must not throw
  ok(Array.isArray(C.roomRows(v.snap, new Map(), A.activeProfile())), 'a level with no room loops: no rows, no error');
  // stairs
  const stairs = [{ kind: 'straight', width: 36 * IN, railings: 'both', railHeight: 36 * IN, layout: ST.stairLayout(spec({ tread: 252, width: 700 })) }];
  A.setActivePack('us-irc-2021');
  const su = C.stairRows(stairs, A.activeProfile(), { whereOf: () => 'Stair' });
  A.setActivePack('za-sans10400');
  const sz = C.stairRows(stairs, A.activeProfile(), { whereOf: () => 'Stair' });
  ok(su.length === 4 && su.filter((r) => r.ok === false).length === 1 && su.find((r) => !r.ok).id === 'stair.tread.min', 'United States: four stair rows, the 252 mm tread fails');
  ok(sz.length === 2 && sz.every((r) => r.ok === true), 'South Africa: two stair rows (riser, going), both met; no width or handrail row');
  const sched = C.regsSchedule(sz, A.activeProfile(), { fmtLen, t });
  ok(sched.head.length === 6 && sched.rows.length === 2 && sched.rows[0][3].startsWith('regs.op.max') && /unchecked/.test(sched.note), 'the schedule: six columns, a row each, the pack\'s review state in the note');
  console.log('== tier 2: rooms, halls, bedroom escape openings, the egress door (owner 2026-10-27: "all building regulations")');
  const irc24 = R.cleanPack(JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/library/regulations/us/us-irc-2024.json'), 'utf8'))).pack;
  const p24 = R.resolve(new Map([[irc24.id, irc24]]), irc24.id);
  ok(p24.list().length >= 17 && p24.rule('escape.area.min').unit === 'm2' && p24.rule('escape.area.min').clause === 'R319.2.1' && p24.rule('alarm.smoke.bedroom.min').clause === 'R310.3', 'the IRC 2024 pack carries the tier 2 and 3 rules at their 2024 numbers (escape R319.2.1, smoke alarms R310.3)');
  ok(C.leastWidth([[0, 0], [4000, 0], [4000, 2000], [0, 2000]]) === 2000 && Math.round(C.leastWidth([[0, 0], [3000, 3000], [0, 6000], [-3000, 3000]])) === 4243, 'leastWidth: a 4 × 2 m room is 2 m wide; a diamond is measured across its own edges');
  ok(C.clearOpening({ typeKey: 'win-double-hung', width: 900, height: 1500 }).h === 750 && C.clearOpening({ typeKey: 'win-slider', width: 1500, height: 1200 }).w === 750 && C.clearOpening({ typeKey: 'win-fixed', width: 900, height: 900 }).area === 0, 'clearOpening: a hung window opens half its height, a slider half its width, a fixed window not at all');
  // a real model: the 4 × 5 m room above, named as a bedroom, with its windows (two hung, one fixed); an outside door
  const bed = OPS.snapshotModel(ed).derived.spaces[0];
  const nameOp = (await import(path.join(APP, 'model-ops.js')));
  if (nameOp.renameSpace) ed.modelChange(nameOp.renameSpace({ guid: bed.guid, name: 'Bedroom' }));
  let vv = view();
  const named = vv.snap.derived.spaces[0].name;
  const t2 = C.roomRows({ ...vv.snap, derived: { ...vv.snap.derived, spaces: vv.snap.derived.spaces.map((x) => ({ ...x, name: 'Bedroom' })) } }, vv.loops, p24);
  const g = (id) => t2.find((r) => r.id === id);
  ok(g('room.area.min').ok === true && Math.abs(g('room.area.min').found - 4 * 5 * 0.98) < 1.5 && g('room.dim.min').found > 3500, 'a bedroom of about 4 × 5 m meets the 70 sq ft area and the 7 ft dimension (' + g('room.area.min').found.toFixed(2) + ' m²)');
  ok(g('escape.area.min') && g('escape.area.min').kind === 'window' && g('escape.width.min').found > 0 && g('escape.sill.max').found !== null, 'its best window is checked as the escape opening: area, width, height, sill (' + (g('escape.area.min').found).toFixed(3) + ' m², sill ' + Math.round(g('escape.sill.max').found) + ' mm)');
  const kit = C.roomRows({ ...vv.snap, derived: { ...vv.snap.derived, spaces: vv.snap.derived.spaces.map((x) => ({ ...x, name: 'Kitchen' })) } }, vv.loops, p24);
  ok(!kit.some((r) => r.id === 'room.area.min' || r.id.startsWith('escape')), 'a kitchen is exempt from the room size rules and needs no escape opening');
  const hall = C.roomRows({ ...vv.snap, derived: { ...vv.snap.derived, spaces: vv.snap.derived.spaces.map((x) => ({ ...x, name: 'Hall' })) } }, vv.loops, p24);
  ok(hall.some((r) => r.id === 'hall.width.min') && !hall.some((r) => r.id === 'room.area.min'), 'a hall is checked for its width, not as a habitable room');
  const d0 = C.doorRows(vv.snap, vv.loops, p24);
  ok(d0.length === 2 && d0.every((r) => r.found === null && r.ok === null), 'no exterior door yet: the egress door rows say they could not be worked out');
  ed.modelChange(OPS.placeOpening({ wall: wallOn([0, 0], [4000, 0]).guid, typeKey: 'door-single', offset: 2500, face: 'right' }));
  vv = view();
  const d1 = C.doorRows(vv.snap, vv.loops, p24), dw = d1.find((r) => r.id === 'door.egress.width.min');
  ok(dw && dw.found > 0 && dw.kind === 'door' && (dw.ok === (dw.found >= 812.8 - 1e-6)), 'an exterior door is the egress door: clear width = leaf less 2 in (' + Math.round(dw?.found ?? 0) + ' mm, ' + (dw?.ok ? 'meets' : 'does not meet') + ' 32 in)');
  void named;
  console.log('== escape routes from the model (EG.31, oltl-eg-a_PART_3): the way out of each room against the egress door rule');
  {
    const BK = await import(path.join(APP, 'study/breakit.js'));
    const RT = await import(path.join(APP, 'addons/regs/lib/route.js'));
    const rf = RT.routeFindings(vv.snap, vv.loops, p24, BK);
    ok(rf.graph.rooms.length >= 1 && rf.graph.doors.some((d) => d.b === null), 'the model\'s rooms and doors become a graph with one exit to the outside', rf.graph.rooms.length + ' rooms, ' + rf.graph.doors.length + ' doors');
    ok(rf.findings.length >= 1 && rf.findings[0].kind === 'route' && rf.findings[0].clause === 'R318.2', 'each room gets a finding that names the rule\'s clause');
    ok(rf.findings.every((f) => f.failing === (f.found.value !== null && f.found.value < 812.8 - 1e-6) || f.found.value === null), 'a room fails when its best way out is narrower than the rule (812.8 mm)', rf.findings.map((f) => f.found.value + (f.failing ? ' fails' : ' ok')).join(', '));
    const widePack = R.cleanPack({ ...irc24, id: 'zz-wide', base: undefined, rules: irc24.rules.map((r) => (r.id === 'door.egress.width.min' ? { ...r, value: 5000 } : r)) }).pack;
    const strict = R.resolve(new Map([[widePack.id, widePack]]), widePack.id);
    const rs = RT.routeFindings(vv.snap, vv.loops, strict, BK);
    const probs = BK.findingProblems(rs.findings, { source: 'bimcraft.regs' });
    ok(rs.findings.length >= 1 && rs.findings.every((f) => f.failing) && probs.length >= 1 && probs[0].severity === 'error' && probs[0].msg.key === 'breakit.p.route.fail' && probs[0].source.kind === 'regulation' && probs[0].source.pack.clause === 'R318.2', 'a rule no door can meet: an error Problem naming the pack and clause (' + (probs[0] && probs[0].msg.key) + ')');
    ok(probs[0].about[0].kind === 'space' && probs[0].found.unit === 'mm' && probs[0].req.value === 5000, 'it points at the room and carries the required and found widths');
    const none = RT.routeFindings(vv.snap, vv.loops, R.resolve(new Map([['zz-none', R.cleanPack({ ...read('us-irc-2021.json'), id: 'zz-none', rules: [] }).pack]]), 'zz-none'), BK);
    ok(none.findings.length === 0, 'a pack with no egress door rule gives no route findings');
    const lang = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
    ok(lang['breakit.p.route'] && lang['breakit.p.route.fail'], 'the words are in the language file');
  }
  console.log('== tier 3: outlets along the walls, lights, smoke alarms');
  const sq = [[0, 0], [4000, 0], [4000, 4000], [0, 4000]];   // perimeter 16 m
  ok(C.wallOutletGap(sq, [], []).found === Infinity, 'a room with no outlet: a wall space has none (fails, whatever the limit)');
  ok(Math.abs(C.wallOutletGap(sq, [], [0, 8000]).found - 4000) < 1e-6, 'two outlets opposite each other round a 16 m perimeter: the farthest point is 4 m away');
  ok(Math.abs(C.wallOutletGap(sq, [[1000, 1900]], [500]).found - 14600) < 1e-6, 'one doorway: the rest of the perimeter is one wall space, measured from the doorway round to the outlet (14.6 m)');
  ok(C.wallOutletGap(sq, [[1000, 1900], [9000, 9900]], [500]).found === Infinity, 'two doorways: the wall space between them has no outlet (an outlet beyond a doorway does not count)');
  const dv = [{ kind: 'socket', storey: levels[0].id, at: [100, 2500] }, { kind: 'socket', storey: levels[0].id, at: [3900, 2500] }, { kind: 'luminaire', storey: levels[0].id, at: [2000, 2500] },
    { kind: 'detector.smoke', storey: levels[0].id, at: [2000, 2000] }, { kind: 'socket', storey: levels[0].id, at: [-500, -500] }];
  const elecPack = R.cleanPack({ ...read('us-irc-2021.json'), id: 'zz-elec', rules: [
    { id: 'elec.wall.spacing.max', op: '<=', value: 1828.8, unit: 'mm', clause: 'E3901.2', label: 'Wall outlet spacing' },
    { id: 'elec.light.room.min', op: '>=', value: 1, unit: 'count', clause: 'E3903.2', label: 'Lighting outlet' },
    { id: 'alarm.smoke.bedroom.min', op: '>=', value: 1, unit: 'count', clause: 'R314.3', label: 'Smoke alarm in each sleeping room' },
    { id: 'alarm.smoke.story.min', op: '>=', value: 1, unit: 'count', clause: 'R314.3', label: 'Smoke alarm on each story' },
    { id: 'elec.outdoor.outlet.min', op: '>=', value: 2, unit: 'count', clause: 'E3901.7', label: 'Outdoor outlets' }] }).pack;
  const pe = R.resolve(new Map([[elecPack.id, elecPack]]), elecPack.id);
  const er = C.elecRows({ ...vv.snap, derived: { ...vv.snap.derived, spaces: vv.snap.derived.spaces.map((x) => ({ ...x, name: 'Bedroom' })) } }, vv.loops, dv, pe);
  const ge = (id) => er.find((r) => r.id === id);
  ok(ge('elec.wall.spacing.max') && ge('elec.wall.spacing.max').ok === false, 'two outlets in a bedroom of about 4 × 5 m: some point of the walls is more than 6 ft from them (fails, ' + Math.round(ge('elec.wall.spacing.max').found || 0) + ' mm)');
  ok(ge('elec.light.room.min').ok === true && ge('alarm.smoke.bedroom.min').ok === true && ge('alarm.smoke.story.min').ok === true, 'a light, a smoke alarm in the bedroom and on the story: met');
  ok(ge('elec.outdoor.outlet.min').found === 1 && ge('elec.outdoor.outlet.min').ok === false && ge('elec.outdoor.outlet.min').ref === 'outside', 'one outlet outside: two are needed (front and back)');
  console.log('== tier 3: footings, slabs and wall framing against the IRC3 tables, with the place\'s design criteria');
  const IRC3 = R.cleanPack(read('us-irc-2021.json')).pack;
  ok(IRC3 && ['R403.1(1)', 'R602.3(5)', 'R602.7(1)'].every((k) => IRC3.tables[k]), 'the IRC3 2021 pack carries the footing, stud and header tables');
  const cold3 = R.cleanPack({ ...IRC3, id: 'zz-cold', base: IRC3.id, rules: [], tables: {}, criteria: { frost_depth: { text: '36 in', value: 914.4, unit: 'mm' }, ground_snow_load: { text: '43 psf', value: 43, unit: 'psf' } } }).pack;
  const pk = R.resolve(new Map([[IRC3.id, IRC3], [cold3.id, cold3]]), cold3.id);
  ok(pk.criteria.frost_depth.value === 914.4 && pk.tables['R403.1(1)'] && pk.rule('found.footing.depth.min'), 'a city pack on the IRC3: its criteria, the IRC3\'s tables and rules');
  const ft3 = C.footingFromTable(pk, { stories: 2, snowPsf: 43 });
  ok(ft3 && ft3.load === 50 && Math.round(ft3.width) === 381 && Math.round(ft3.thick) === 152, 'two stories, light frame, slab on grade, 43 psf snow (50 psf row), 1500 psf soil: 15 × 6 in (R403.1(1))');
  const IN3 = 25.4;
  const frw = C.foundRows([{ guid: 'f1', storey: 1, kind: 'stemslab', loads: { stories: 2 }, params: { footW: 12 * IN3, footD: 8 * IN3, bottom: 24 * IN3, slabT: 4 * IN3 } }], pk);
  const gf = (id) => frw.find((r) => r.id === id);
  ok(gf('found.footing.depth.min').ok === false && gf('found.footing.depth.min').req === 914.4 && /frost/.test(gf('found.footing.depth.min').clause), 'a footing 18 in below grade where frost is 36 in: fails, the frost depth asked (not the 12 in minimum)');
  ok(gf('found.footing.width.min').ok === false && Math.round(gf('found.footing.width.min').req) === 381 && /R403\.1\(1\)/.test(gf('found.footing.width.min').clause), 'a 12 in footing under two stories in 43 psf snow: the table asks 15 in');
  ok(gf('found.footing.thick.min').ok === true && gf('found.slab.thick.min').ok === true, 'an 8 in footing and a 4 in slab: met (6 in, 3½ in)');
  const hs3 = C.headerSpanFromTable(pk, { size: '2-2x10', floorsAbove: 0, snowPsf: 43, widthMm: 24 * 304.8 });
  ok(hs3 && Math.round(hs3.span) === 1803 && hs3.snowCol === 50, 'header 2-2x10, roof and ceiling, 24 ft3 wide, 50 psf column: 5 ft3 11 in (R602.7(1))');
  const hi3 = C.headerSpanFromTable(pk, { size: '2-2x10', floorsAbove: 0, snowPsf: 20, widthMm: 18 * 304.8 });
  ok(hi3 && Math.abs(hi3.span - (((9 * 12) + (6 * 12 + 10)) / 2) * IN3) < 0.5, 'between 12 and 24 ft3 the span is interpolated (30 psf column: 9-0 and 6-10 → 7-11)');
  ok(C.headerSpanFromTable(pk, { size: '2-2x10', widthMm: 40 * 304.8 }).beyond === true, 'a building wider than 36 ft3 is outside the table (not judged)');
  const stT = C.studFromTable(pk, { size: '2x4', bearing: true, floorsAbove: 2 });
  ok(stT && stT.spacing === null, '2x4 studs carrying two floors and a roof: not permitted (Table R602.3(5))');
  const lv3 = [{ id: 1, guid: 'L1', elevation: 0 }, { id: 2, guid: 'L2', elevation: 3000 }];
  const box3 = [[0, 0], [24 * 304.8, 0], [24 * 304.8, 10000], [0, 10000]];
  const fsnap = { levels: lv3, walls: [{ guid: 'w1', storey: 1, typeKey: 'ext-2x6', name: 'A', fixedHeight: 2438.4 }, { guid: 'w2', storey: 2, typeKey: 'ext-2x6', name: 'B', fixedHeight: 2438.4 }] };
  const floops = new Map([[1, { outlines: [{ poly: box3 }] }], [2, { outlines: [{ poly: box3 }] }]]);
  const fram = C.framingRows([{ guid: 'fr1', storey: 1, host: 'w1', spacing: 24 * IN3, pieces: [{ role: 'stud', size: '2x6', length: 2300 }, { role: 'header', size: '2x10 × 2', length: 72 * IN3, guid: 'h1' }] }], fsnap, floops, pk);
  const gw = (id) => fram.find((r) => r.id === id);
  ok(gw('frame.stud.spacing.max').ok === true && Math.round(gw('frame.stud.spacing.max').req) === 610, 'ground-floor 2x6 bearing studs at 24 in under one floor and a roof: met (24 in)');
  ok(gw('frame.stud.height.max').ok === true, 'an 8 ft3 wall of 2x6 studs: within 10 ft');
  ok(gw('frame.header.span.max').ok === false && gw('frame.header.span.max').ref === 'h1' && Math.round(gw('frame.header.span.max').found) === Math.round(69 * IN3), 'a 6 ft3 2-2x10 header under one floor, 24 ft3 wide, 50 psf: 5 ft3 9 in clear is over the table\'s span (fails)');
  const jt = C.joistSpanFromTable(pk, { size: '2x10', spacingMm: 16 * IN3 });
  ok(jt && Math.round(jt.span) === Math.round((14 * 12) * IN3) && jt.spacing === 16, '2x10 joists at 16 in: the lowest of the four species (Southern pine 14-0, R502.3.1(2))');
  const jr = C.joistRows([{ guid: 'fl1', storey: 1, spacing: 16 * IN3, pieces: [{ role: 'joist', size: '2x10', length: 15 * 304.8, guid: 'j1' }, { role: 'rim', size: '2x10', length: 9000 }] }], pk);
  ok(jr.length === 1 && jr[0].ok === false && jr[0].ref === 'j1', 'a 15 ft run of 2x10 joists at 16 in: over 14 ft (fails; the rim is not a joist)');
  ok(C.joistRows([{ guid: 'fl2', storey: 1, spacing: 16 * IN3, pieces: [{ role: 'joist', size: 'TJI 11-7/8', length: 6000 }] }], pk).length === 0, 'engineered (TJI) joists are left to the maker\'s tables');

  console.log('== tier 3: rafters, ceiling joists and the energy envelope');
  const warm3 = R.cleanPack({ ...IRC3, id: 'zz-warm', base: IRC3.id, rules: [], tables: {}, criteria: { ground_snow_load: { text: '10 psf', value: 10, unit: 'psf' }, climate_zone: { text: '5A' } } }).pack;
  const pw = R.resolve(new Map([[IRC3.id, IRC3], [warm3.id, warm3]]), warm3.id);
  ok(pw.rule('frame.rafter.span.max') && pw.rule('frame.ceilingjoist.span.max') && pw.rule('energy.wall.r.min') && pw.rule('energy.window.u.max'), 'the IRC pack carries the rafter, ceiling joist and energy rules');
  const rs = C.spanFromTable(pw, 'rafter', { size: '2x8', spacingMm: 16 * IN3 });
  ok(rs && Math.round(rs.span) === Math.round(17 * 12 * IN3 + 1 * IN3), '2x8 rafters at 16 in: the lowest species (Southern pine 17-1, R802.4.1(1))');
  const cos30 = Math.cos(30 * Math.PI / 180);
  const rr = C.rafterRows([{ guid: 'rf1', storey: 2, kind: 'roof', spacing: 16 * IN3, pitch: 30, pieces: [{ role: 'rafter', size: '2x8', length: 19 * 304.8, guid: 'ra1' }, { role: 'hip', size: '2x10', length: 30000 }] }], pw);
  ok(rr.length === 1 && rr[0].ok === true && Math.abs(rr[0].found - 19 * 304.8 * cos30) < 1, '19 ft sloped 2x8 rafter at 30 degrees: 16 ft 6 in horizontal, within the 17-1 span: ' + (rr[0] && Math.round(rr[0].found / 304.8 * 10) / 10 + ' ft'));
  const rr2 = C.rafterRows([{ guid: 'rf2', storey: 2, kind: 'roof', spacing: 16 * IN3, pitch: 30, pieces: [{ role: 'rafter', size: '2x8', length: 22 * 304.8, guid: 'ra2' }] }], pw);
  ok(rr2[0].ok === false && rr2[0].ref === 'ra2', 'a 22 ft sloped 2x8 rafter at 30 degrees (19 ft horizontal) is over the table');
  const rr3 = C.rafterRows([{ guid: 'rf3', storey: 2, kind: 'roof', spacing: 16 * IN3, pitch: 30, pieces: [{ role: 'rafter', size: '2x8', length: 22 * 304.8 }] }], pk);
  ok(rr3[0].ok === null && rr3[0].found === null, 'ground snow of 43 psf: the 20 psf rafter table does not apply (a note, not a verdict)');
  const cj = C.ceilingJoistRows([{ guid: 'rf4', storey: 2, kind: 'roof', spacing: 16 * IN3, pitch: 30, pieces: [{ role: 'ceilingjoist', size: '2x6', length: 17 * 304.8, guid: 'cj1' }] }], pw);
  ok(cj.length === 1 && cj[0].ok === false && cj[0].ref === 'cj1', 'a 17 ft run of 2x6 ceiling joists at 16 in: over 16-6 (Hem-fir), fails');
  ok(C.climateZoneKey('5A') === '5 and marine 4' && C.climateZoneKey('4C') === '5 and marine 4' && C.climateZoneKey('4A') === '4 except marine' && C.climateZoneKey('2B (IECC county list)') === '2' && C.climateZoneKey('8') === '7 and 8' && C.climateZoneKey('') === null, 'climate zone text to the energy table key');
  ok(JSON.stringify(C.wallOptions('20 or 13&5ci or 0&15ci')) === JSON.stringify([{ cavity: 20, cont: 0 }, { cavity: 13, cont: 5 }, { cavity: 0, cont: 15 }]) && C.wallOptions('NR').length === 0, 'wall R options: cavity, cavity & continuous');
  const lam = (n) => (/rigid|xps/i.test(n) ? 0.033 : /insulation|batt/i.test(n) ? 0.035 : null);
  const T = (layers) => ({ key: 'k', exterior: true, layers });
  const insA = C.insulationOf(T([{ mat: 'batt insulation', t: 140, function: 'insulation' }, { mat: 'gypsum', t: 12.5 }]), lam);
  ok(insA && Math.abs(insA.cavity - 140 / 1000 / 0.035 * 5.678263) < 1e-6 && insA.cont === 0, 'a 140 mm batt: R-22.7 cavity');
  ok(C.insulationOf(T([{ mat: 'studs', t: 140 }, { mat: 'gypsum', t: 12.5 }]), lam) === null, 'a wall with no insulation layer has no value');
  const esnap = { walls: [{ guid: 'w1', typeKey: 'good' }, { guid: 'w2', typeKey: 'good' }, { guid: 'w3', typeKey: 'bare' }, { guid: 'w4', typeKey: 'int' }], openings: [{ kind: 'window' }], derived: { roofs: [{ guid: 'ro1' }] } };
  const types = { good: T([{ mat: 'batt insulation', t: 140, function: 'insulation' }, { mat: 'rigid xps board', t: 30, function: 'insulation' }]), bare: T([{ mat: 'studs', t: 140 }]), int: { key: 'int', exterior: false, layers: [] } };
  for (const k of Object.keys(types)) types[k].name = k;
  const enr = C.energyRows(esnap, pw, { typeOf: (k) => types[k] || null, typeName: (t) => t.name, lambdaOf: lam });
  const wf = (re) => enr.filter((r) => re.test(r.where));
  ok(wf(/Wall type good/).length === 1 && /2 walls/.test(wf(/Wall type good/)[0].where) && wf(/Wall type good/)[0].ok === true, 'zone 5: R-22.7 cavity + R-5.1 continuous meets "13&5ci" (and is listed once for its 2 walls)');
  ok(wf(/Wall type bare/)[0].ok === null && wf(/Wall type bare/)[0].found === null && !wf(/Wall type int/).length, 'a bare wall type: a note (no value); interior walls are not in the envelope');
  ok(wf(/^Roof/)[0].ok === null && wf(/^Windows/)[0].ok === null, 'roofs and windows carry no value yet: notes, never a pass');
  const thin = { ...types, good: { ...T([{ mat: 'batt insulation', t: 60, function: 'insulation' }]), name: 'good' } };
  ok(C.energyRows(esnap, pw, { typeOf: (k) => thin[k] || null, typeName: (t) => t.name, lambdaOf: lam }).find((r) => /Wall type good/.test(r.where)).ok === false, 'a 60 mm batt (R-9.7) in climate zone 5 fails');
  ok(C.energyRows(esnap, pk, { typeOf: (k) => types[k], lambdaOf: lam }).every((r) => r.ok === null && /climate zone not given/.test(r.where)), 'no climate zone in the place criteria: notes only, nothing guessed');

  console.log('== REG.1c / REG.1d: pinned versions, the merged chain, the report as PDF');
  const RP = await import(path.join(APP, 'addons/regs/lib/report.js')), PRB = await import(path.join(APP, 'addons/regs/lib/problems.js'));
  const pinSt = RP.pinStatus({ a: 2, b: 3, c: 5 }, [{ id: 'a', version: 3 }, { id: 'b', version: 3 }, { id: 'c', version: 4 }, { id: 'd', version: 1 }, { id: 'e', version: null }]);
  ok(pinSt.map((x) => x.state).join() === 'newer,same,older,unpinned,unversioned', 'pin status: newer, same, older, unpinned, unversioned');
  const pinKp = RP.keepPins({ a: 2, b: 3 }, ['a', 'b', 'd', 'e'], [{ id: 'a', version: 3 }, { id: 'b', version: 3 }, { id: 'd', version: 1 }, { id: 'e', version: null }]);
  ok(pinKp.a === 2 && pinKp.b === 3 && pinKp.d === 1 && !('e' in pinKp), 'a ticked pack keeps its pin (2 stays 2 although 3 is installed); a new one pins at the installed version; unversioned packs have none');
  ok(RP.keepPins({ a: 2 }, ['a'], [{ id: 'a', version: 3 }], { repin: ['a'] }).a === 3, 'accepting the update moves the pin');
  const mkp = (o) => R.cleanPack({ format: 'cadcraft-regulation-pack', version: 1, review: { state: 'draft' }, source: { name: 'x' }, authority: 'government', ...o }).pack;
  const natp = mkp({ id: 'zz-natp', name: 'National code', jurisdiction: { country: 'ZA', level: 'country', name: 'South Africa' }, rules: [{ id: 'stair.riser.max', applies: 'stair', op: '<=', unit: 'mm', value: 200, clause: 'M 4.2', label: 'Riser' }] });
  const metrop = mkp({ id: 'zz-metrop', name: 'City by-law', base: 'zz-natp', jurisdiction: { country: 'ZA', level: 'city', name: 'City' }, rules: [{ id: 'stair.riser.max', applies: 'stair', op: '<=', unit: 'mm', value: 190, clause: 'By-law 7', label: 'Riser' }] });
  const pmm = R.resolve(new Map([[natp.id, natp], [metrop.id, metrop]]), metrop.id);
  const srcc = RP.ruleSource(pmm, 'stair.riser.max', (id) => ({ 'zz-natp': 'National code', 'zz-metrop': 'City by-law' })[id]);
  ok(srcc.from === 'zz-metrop' && srcc.overrides.from === 'zz-natp' && srcc.text === 'City by-law By-law 7, overrides National code M 4.2', 'the merged chain: the city rule says which level it came from and what it replaced: ' + srcc.text);
  ok(RP.ruleSource(R.resolve(new Map([[natp.id, natp]]), natp.id), 'stair.riser.max').overrides === null, 'a rule nobody replaced has no override');
  const refVer = PRB.packRef(pmm, (id) => (id === 'zz-metrop' ? 4 : null));
  ok(refVer.version === '4' && PRB.packRef(pmm).version === undefined, 'a problem\'s source.pack carries the pack version when it has one');
  const t0 = (k, v) => k + (v ? JSON.stringify(v) : '');
  const repMd = RP.reportMarkdown({ title: 'Code summary', file: 'house.ifc', date: '2026-10-27', packs: [{ chain: [{ name: 'National code', edition: '2021', authority: 'government', source: { name: 'Act', url: 'https://example.org/a', date: '2021' } }], review: 'unchecked', version: 3, pinState: 'newer' }],
    criteria: [['Frost', '0 in']], sum: { meets: 1, fails: 1, none: 0 }, rows: [{ where: 'Stair', label: 'Riser', clause: 'M 4.2', required: '<= 200 mm', found: '210 mm', result: 'Not met', source: 'City by-law By-law 7' }],
    accepted: [], }, t0);
  const lastLines = repMd.trim().split('\n').filter(Boolean);
  ok(lastLines[lastLines.length - 1] === 'regs.sheet.norep' && lastLines[lastLines.length - 2] === 'regs.sheet.legal', 'the report ends with the legal line, then "No representation." last');
  ok(/City by-law By-law 7/.test(repMd) && /v3/.test(repMd) && /https:\/\/example.org\/a/.test(repMd), 'the report lists each rule\'s source, the pinned pack version and the pack\'s source link');
  const { parseMarkdown } = await import(path.join(APP, 'doc-template.js')), { docPdf } = await import(path.join(APP, 'doc-pdf.js'));
  const pdfOut = docPdf(parseMarkdown(RP.reportMarkdown({ title: 'Code summary', file: 'house.ifc', date: '2026-10-27', packs: [], criteria: [], sum: { meets: 0, fails: 0, none: 0 }, rows: [], accepted: [] }, (k) => (k === 'regs.sheet.norep' ? 'No representation.' : k))), { title: 'Code summary', paper: 'letter' });
  const pdfHead = Buffer.from(pdfOut.bytes).subarray(0, 8).toString('latin1'), pdfText = Buffer.from(pdfOut.bytes).toString('latin1');
  ok(pdfHead.startsWith('%PDF-1.') && /No representation\./.test(pdfText) && pdfOut.pages >= 1, 'the report is a PDF that carries the "No representation." footnote (' + pdfOut.pages + ' page)');

  console.log('== proof packs: SANS 10400 and a South African metro by-law on it');
  const zaBase = R.cleanPack(read('za-sans10400.json')).pack;
  const capeRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/library/regulations/world/za-wc-cape-town.json'), 'utf8')), cape = R.cleanPack(capeRaw);
  ok(cape.ok && cape.pack.base === 'za-sans10400' && cape.pack.jurisdiction.level === 'city' && cape.pack.authority === 'adopted-law', 'the Cape Town by-law pack is a valid city pack on SANS 10400');
  const pcape = R.resolve(new Map([[zaBase.id, zaBase], [cape.pack.id, cape.pack]]), cape.pack.id);
  ok(pcape && pcape.chain.length === 2 && pcape.rule('stair.riser.max').from === 'za-sans10400' && pcape.review.state === 'unchecked', 'the chain country -> city resolves; the riser rule comes from SANS 10400 and the whole stays "not checked"');
  ok(/openbylaws\.org\.za|lawlibrary\.org\.za/.test(cape.pack.source.url) && cape.pack.source.checked && cape.pack.rules.length === 0, 'the city pack cites the by-law and invents no limit: the research found none that maps to a rule');

  console.log('== tools/regs/sync.mjs: one engine, byte-identical copies');
  {
    const { execFileSync, spawnSync } = await import('node:child_process'), os = await import('node:os');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'regs-sync-'));
    try {
      fs.cpSync(path.join(APP, 'addons/regs'), path.join(tmp, 'bimcraft/dev/addons/regs'), { recursive: true });
      fs.mkdirSync(path.join(tmp, 'cadcraft/dev/addons/regs'), { recursive: true });
      const run = (...a) => spawnSync('node', [path.join(ROOT, 'tools/regs/sync.mjs'), ...a], { env: { ...process.env, REGS_APPS_DIR: tmp }, encoding: 'utf8' });
      ok(run().status === 2 && run('--check', '--to', 'modelcraft').status === 2, 'it refuses to run without a scoped --to of known apps');
      ok(run('--check', '--to', 'cadcraft').status === 1, 'an installed app with no engine files drifts');
      ok(run('--to', 'cadcraft').status === 0 && run('--check', '--to', 'cadcraft', ).status === 0, 'sync copies the engine, then --check is clean');
      const eng = fs.readFileSync(path.join(tmp, 'cadcraft/dev/addons/regs/lib/regs.js'), 'utf8');
      ok(eng === fs.readFileSync(path.join(APP, 'addons/regs/lib/regs.js'), 'utf8') && !fs.existsSync(path.join(tmp, 'cadcraft/dev/addons/regs/lib/check.js')) && !fs.existsSync(path.join(tmp, 'cadcraft/dev/addons/regs/main.js')), 'the copy is byte-identical; check.js and main.js (per app) are not copied');
      fs.appendFileSync(path.join(tmp, 'cadcraft/dev/addons/regs/lib/regs.js'), '// edited in a copy\n');
      ok(run('--check', '--to', 'cadcraft').status === 1, 'an edited copy is drift');
      ok(run('--to', 'cadcraft').status === 0 && run('--check', '--to', 'cadcraft').status === 0, 'sync puts it back');
      ok(run('--check', '--to', 'civilcraft').status === 0 && /not installed/.test(run('--check', '--to', 'civilcraft').stdout), 'an app without the add-on is skipped, not made');
      void execFileSync;
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  }
  A.setActivePack('us-irc-2021');
  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
