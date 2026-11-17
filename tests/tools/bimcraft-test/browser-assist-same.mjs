#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-assist-same.mjs — BK.83 in the real page (/lab/bimcraft, headless), session `bk-instep-10`: the connected
 * assistant runs the same commands as the person, each one undo step, and the page talks to nobody about it.
 *   node tools/bimcraft-test/browser-assist-same.mjs [--shots <dir>]      (run as root)
 *
 * Two new buildings, one after the other, each in its own fresh browser profile:
 *   the person      draws with the page's own tools: the Wall tool (two clicks), the Door tool (a click on the wall), Properties ›
 *                   Wall type, Properties › Length, the Delete key
 *   the assistant   is given the same building and makes the same changes through the page's control channel
 *                   (window.bimcraftControl, what a connected assistant's calls arrive on; Settings › Assistants: Read + Edit):
 *                   walls_add, opening_add, wall_change (type), wall_change (end), elements_delete
 * After each change the two models are compared (walls, the door, rooms, the count of every IFC class in the saved file).
 * On the assistant's side each call is ONE undo step labelled "Assistant: …" in the page's own undo list; the person's Undo
 * button takes exactly that step back; the assistant's own `undo` tool refuses to undo a step the person made.
 * Every address either page asked for while this ran is listed: only this site.
 */
import { openLab, M } from './bk-page.mjs';

const near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;
/** The model in the page with no GlobalId in it, and the saved file's count of every IFC class. */
const STATE = async ([uU]) => {
  const { val } = await import(uU);
  const A = window.bimcraftRes.api, S = window.bimcraftPlan.state, ed = A.ed();
  const r1 = (v) => Math.round(v * 10) / 10, pt = (p) => p.map(r1).join(',');
  const wk = new Map(S.data.walls.map((w) => [w.id, pt(w.a) + '>' + pt(w.b)]));
  const name = (id) => { try { return String(val(ed.api.GetLine(ed.mid, id, false).Name) ?? ''); } catch (e) { return '?'; } };
  const txt = new TextDecoder().decode(ed.save()), hist = {};
  for (const m of txt.slice(txt.indexOf('DATA;')).matchAll(/^#\d+\s*=\s*(IFC[A-Z0-9]+)\(/gm)) hist[m[1]] = (hist[m[1]] || 0) + 1;
  return {
    model: JSON.stringify({
      levels: S.data.levels.map((l) => [l.name, r1(l.elevation), r1(l.height)]),
      walls: S.data.walls.map((w) => [wk.get(w.id), w.typeKey, r1(w.t), r1(w.len), r1(w.height), w.extSide, w.justification, r1(w.baseOffset || 0), name(w.id)]).sort(),
      openings: S.data.openings.map((o) => [o.kind, o.typeKey, wk.get(o.wall), r1(o.offset), r1(o.width), r1(o.height), r1(o.sill), o.mark, o.hand, o.face, o.family || '', o.sizeName || '', name(o.id)]).sort(),
      rooms: (S.data.derived?.spaces || []).length,
    }),
    hist: JSON.stringify(Object.entries(hist).sort()),
    changes: ed.changes.map((c) => String(c.label || c.kind)),
    door: (() => { const o = S.data.openings.find((x) => x.kind === 'door'); return o ? { guid: o.guid, offset: o.offset, face: o.face, hand: o.hand, key: A.kb() + o.id } : null; })(),
    wall: (() => { const w = S.data.walls[0]; return w ? { guid: w.guid, key: A.kb() + w.id, a: w.a, b: w.b } : null; })(),
  };
};
const diff = (a, b) => { const x = JSON.parse(a), y = JSON.parse(b); return Object.keys(x).filter((k) => JSON.stringify(x[k]) !== JSON.stringify(y[k])).map((k) => k + ': ' + JSON.stringify(x[k]) + ' vs ' + JSON.stringify(y[k])).join(' | ').slice(0, 600); };
const histDiff = (a, b) => { const x = new Map(JSON.parse(a)), y = new Map(JSON.parse(b)); return [...new Set([...x.keys(), ...y.keys()])].filter((k) => x.get(k) !== y.get(k)).map((k) => k + ' ' + x.get(k) + '/' + y.get(k)).join(', '); };
const hostsSeen = new Map();
let failed = 0;

// ============================================================================================ the person
const person = [];
{
  const L = await openLab({ tag: 'bkassist', units: 'mm' });
  const { page, ok, inPage } = L;
  try {
    console.log('== BK.83 the person, with the page\'s own tools');
    await L.newBuilding({ name: 'Same', levels: 2, height: '3000 mm' });
    await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
    await L.frame(-1000, -2000, 8000, 3000);
    const st = async () => { await L.settled(); await page.waitForTimeout(300); await L.settled(); return inPage(STATE, [M('ifc-util.js')]); };
    const planClick = async (x, y) => { await inPage(([x, y]) => { window.bimcraftPlan.move([x, y]); window.bimcraftPlan.click([x, y]); }, [x, y]); await page.waitForTimeout(200); await L.settled(); };
    // 1. the Wall tool: two clicks
    await page.mouse.move(5, 5); await page.waitForTimeout(400);
    await L.tool('wall'); await planClick(0, 0); await planClick(6000, 0); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    person.push(await st());
    ok(JSON.parse(person[0].model).walls.length === 1 && person[0].changes.length === 1, 'Wall tool: one wall, one undo step "' + person[0].changes[0] + '"', person[0].model);
    // 2. the Door tool: a click on the wall
    await L.tool('door'); await planClick(2000, 0); await page.keyboard.press('Escape');
    person.push(await st());
    ok(person[1].door && person[1].changes.length === 2, 'Door tool: a door ' + Math.round(person[1].door?.offset) + ' mm along the wall, one more step', JSON.stringify(person[1].changes));
    // 3. Properties › Wall type
    await inPage((k) => window.bimcraftVis.pick([k]), person[1].wall.key); await L.settled();
    await page.waitForSelector('[data-mp-type]');
    await page.selectOption('[data-mp-type]', 'int-2x6');
    person.push(await st());
    ok(JSON.parse(person[2].model).walls[0][1] === 'int-2x6' && person[2].changes.length === 3, 'Properties › Wall type: Interior 2×6, one more step');
    // 4. Properties › Length: 7000 (the end moves out)
    await inPage((k) => window.bimcraftVis.pick([k]), person[2].wall.key); await L.settled();
    await page.waitForSelector('[data-mp-len]');
    await page.fill('[data-mp-len]', '7000'); await page.press('[data-mp-len]', 'Enter');
    person.push(await st());
    ok(near(JSON.parse(person[3].model).walls[0][3], 7000) && person[3].changes.length === 4, 'Properties › Length 7000: one more step', person[3].model);
    // 5. Delete: the door
    await inPage((k) => window.bimcraftVis.pick([k]), person[3].door.key); await L.settled();
    await page.mouse.move(10, 10); await page.keyboard.press('Delete');
    person.push(await st());
    ok(!person[4].door && person[4].changes.length === 5, 'Delete: the door is gone, one more step', JSON.stringify(person[4].changes));
    await L.shot('assist-1-person');
    failed += L.done();
  } catch (e) { ok(false, 'stopped: ' + (e.stack || e.message || e)); await L.shot('assist-person-stopped'); L.done(); failed++; } finally { for (const [h, n] of L.hosts) hostsSeen.set(h, (hostsSeen.get(h) || 0) + n); await L.close(); }
}

// ============================================================================================ the assistant
if (person.length === 5) {
  const L = await openLab({ tag: 'bkassist', units: 'mm', settings: { assistants: { enabled: true, groups: ['read', 'edit'] } } });
  const { page, ok, inPage } = L;
  try {
    console.log('== BK.83 the connected assistant, through the page\'s control channel');
    await L.newBuilding({ name: 'Same', levels: 2, height: '3000 mm' });
    await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
    let id = 0;
    const rpc = (method, params) => inPage(([m, p, i]) => window.bimcraftControl.handle({ jsonrpc: '2.0', id: i, method: m, params: p }, 'bk83'), [method, params, ++id]);
    const call = async (name, args = {}) => (await rpc('tools/call', { name, arguments: args })).result;
    const st = async () => { await L.settled(); await page.waitForTimeout(300); await L.settled(); return inPage(STATE, [M('ifc-util.js')]); };
    const names = (await rpc('tools/list', {})).result.tools.map((t) => t.name);
    ok(['walls_add', 'opening_add', 'wall_change', 'elements_delete', 'undo', 'model_describe'].every((n) => names.includes(n)), 'the assistant is offered the tools (' + names.length + ' with Read and Edit allowed)');
    const A = [];
    const step = async (i, what, name, args) => {
      const before = A.length ? A[A.length - 1] : await st();
      const r = await call(name, args);
      const now = await st(); A.push(now);
      const fine = ok(!r.isError, what + ': ' + name + ' ran', r.content?.[0]?.text);
      ok(fine && now.model === person[i].model, '  … the model equals the person\'s', fine ? diff(now.model, person[i].model) : '');
      ok(fine && now.hist === person[i].hist, '  … the saved file holds the same count of every IFC class', fine ? histDiff(now.hist, person[i].hist) : '');
      ok(now.changes.length === before.changes.length + 1 && /^Assistant: \S/.test(now.changes[now.changes.length - 1] || ''), '  … one undo step in the page\'s list: "' + now.changes[now.changes.length - 1] + '"', JSON.stringify(now.changes));
      return r;
    };
    const s0 = await st();
    await step(0, 'the wall', 'walls_add', { points: [[0, 0], [6000, 0]] });
    await step(1, 'the door', 'opening_add', { wall: A[0].wall.guid, kind: 'door', offset: person[1].door.offset });
    await step(2, 'the type', 'wall_change', { guid: A[1].wall.guid, type: 'int-2x6' });
    await step(3, 'the length', 'wall_change', { guid: A[2].wall.guid, b: JSON.parse('[' + JSON.parse(person[3].model).walls[0][0].split('>')[1] + ']') });
    await step(4, 'the delete', 'elements_delete', { guids: [A[3].door.guid] });
    await L.shot('assist-2-assistant');

    console.log('== BK.83 undo: the person\'s Undo button and the assistant\'s undo tool');
    await page.click('[data-act="undo"]'); await page.waitForTimeout(400);
    let u = await st();
    ok(u.model === A[3].model && u.hist === A[3].hist && u.changes.length === 4, 'the person\'s Undo takes back exactly the assistant\'s last call: the door is back, the model as before it');
    let r = await call('undo', {});
    u = await st();
    ok(!r.isError && r.structuredContent?.undone?.[0] === A[3].changes[3] && u.model === A[2].model && u.hist === A[2].hist && u.changes.length === 3, 'the assistant\'s undo tool takes back its own last step ("' + (r.structuredContent?.undone?.[0] || '') + '"): the wall is 6000 long again', r.content?.[0]?.text);
    r = await call('undo', { steps: 3 });
    u = await st();
    ok(!r.isError && r.structuredContent?.undone?.length === 3 && u.model === s0.model && u.hist === s0.hist && u.changes.length === 0, 'three more: the new building as it was made, the same count of every IFC class');
    // a step of the person's is not the assistant's to undo
    const planClick = async (x, y) => { await inPage(([x, y]) => { window.bimcraftPlan.move([x, y]); window.bimcraftPlan.click([x, y]); }, [x, y]); await page.waitForTimeout(200); await L.settled(); };
    await L.frame(-1000, -2000, 8000, 3000);
    await page.mouse.move(5, 5); await page.waitForTimeout(400);
    await L.tool('wall'); await planClick(0, 0); await planClick(6000, 0); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    const mine = await st();
    r = await call('undo', {});
    u = await st();
    ok(mine.changes.length === 1 && r.isError && /person/.test(r.content?.[0]?.text || '') && u.changes.length === 1 && u.model === mine.model, 'a wall the person drew: the assistant\'s undo refuses it ("' + String(r.content?.[0]?.text || '').slice(0, 90) + '")');
    ok(u.model === person[0].model, 'and that wall equals the one the assistant\'s walls_add made');
    failed += L.done();
  } catch (e) { ok(false, 'stopped: ' + (e.stack || e.message || e)); await L.shot('assist-stopped'); L.done(); failed++; } finally { for (const [h, n] of L.hosts) hostsSeen.set(h, (hostsSeen.get(h) || 0) + n); await L.close(); }
} else { console.log('  FAIL the person\'s side did not finish: the assistant\'s side was not run'); failed++; }

console.log('== BK.83 who the page talked to while all of this ran');
const others = [...hostsSeen.keys()].filter((h) => h !== 'getcadcraft.com');
console.log((others.length ? '  FAIL ' : '  ok   ') + 'every request went to this site: ' + [...hostsSeen].map(([h, n]) => h + ' (' + n + ')').join(', '));
if (others.length) failed++;
process.exit(failed ? 1 : 0);
