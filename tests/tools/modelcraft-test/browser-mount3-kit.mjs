/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-mount3-kit.mjs — the shell's seven modules in ModelCraft (0.8 round 3, model_PART_3; docs/apps/shell-modules.md § Mounting),
 * run by browser-mount3.mjs --kit on its open page: every module attached, their assistant tools on host.control, a calc sheet and a
 * design reason saved in the .modelcraft file and back after reopening, the first-model lesson following the model, Suggest and the
 * activity log, and the Ask box: a question waits, the connected assistant reads it (ask_list) and answers (ask_reply), the box shows it.
 *   export async function kit(page, ok, OUT)
 */
import fs from 'node:fs';
import path from 'node:path';

export async function kit(page, ok, OUT) {
  console.log('== shell kit: calc, reasons, totals, lessons, Suggest, activity, Ask');
  await page.waitForFunction(() => window.ccCalc && window.ccReasons && window.ccLessons && window.ccAsk && window.ccSuggest && window.ccActivity && window.ccTotals, null, { timeout: 30000 });
  const st = await page.evaluate(() => ({ calc: window.ccCalc.state?.(), reasons: window.ccReasons.state?.(), ask: window.ccAsk.state?.() }));
  ok(st.calc && st.calc.attached !== false, 'calc sheets attached', JSON.stringify(st.calc)?.slice(0, 120));
  ok(st.reasons && st.reasons.attached !== false, 'design reasons attached');
  ok(st.ask && st.ask.attached === true, 'the Ask box is attached', JSON.stringify(st.ask)?.slice(0, 160));
  const C = 'window.modelcraft.shell.host.control';
  await page.evaluate(`${C}.configure({ enabled: true, groups: ['read', 'edit'] })`);
  const tools = await page.evaluate(`${C}.list().map((x) => x.name)`);
  for (const n of ['calcs_list', 'calcs_set', 'reasons_list', 'reasons_set', 'totals_get', 'lessons_status', 'ask_list', 'ask_reply', 'suggestions_list', 'look_set', 'model_describe']) ok(tools.includes(n), 'assistant tool ' + n + ' on ModelCraft\'s control');

  // a calc sheet and a design reason in the file
  const gid = await page.evaluate(() => { const mc = window.modelcraft; const i = [...mc.model.root.insts.keys()][0]; return i ?? null; });
  const wrote = await page.evaluate(async ({ C, gid }) => {
    const c = eval(C);
    const a = await c.call('calcs_set', { sheet: 'shade', name: 'span', expr: '3 m + 450 mm' });
    const b = gid != null ? await c.call('reasons_set', { kind: 'group', id: 'i:' + gid, label: 'Shade', decision: 'Wide enough for two benches.' }) : null;
    await new Promise((r) => setTimeout(r, 300));
    const f = window.modelcraft.file();
    return { a: !a.isError, b: b ? !b.isError : null, calcs: !!f.calcs, reasons: !!f.reasons, rows: JSON.stringify(f.calcs || {}).includes('span') };
  }, { C, gid });
  ok(wrote.a && wrote.calcs && wrote.rows, 'calcs_set: the sheet is in the .modelcraft file (calcs)', JSON.stringify(wrote));
  ok(gid == null || (wrote.b && wrote.reasons), 'reasons_set on a group: in the file (reasons)', JSON.stringify(wrote));
  const tmp = path.join(OUT, 'kit.modelcraft');
  fs.writeFileSync(tmp, JSON.stringify(await page.evaluate(() => window.modelcraft.file())));
  await page.evaluate(() => document.querySelector('[data-act="new"]').click());
  const b = await page.waitForSelector('dialog[open] button[data-key="discard"]', { timeout: 1500 }).catch(() => null);
  if (b) await b.click();
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => !window.modelcraft.file().calcs && !window.modelcraft.file().reasons), 'New: no sheets, no reasons');
  await page.setInputFiles('[data-file-open]', tmp);
  await page.waitForFunction(() => !!window.modelcraft.file().calcs, null, { timeout: 20000 }).catch(() => {});
  const back = await page.evaluate(async (C) => { const r = await eval(C).call('calcs_list', {}); return JSON.stringify(r.structuredContent || r); }, C);
  ok(/span/.test(back), 'reopened: calcs_list has the row again', back.slice(0, 200));
  ok(await page.evaluate(() => !!window.modelcraft.file().reasons) || gid == null, 'and the reasons');

  // the selection reaches the reasons panel
  if (gid != null) {
    const sel = await page.evaluate((g) => { const mc = window.modelcraft; mc.host.setSel([{ t: 'i', id: g }]); return new Promise((r) => requestAnimationFrame(() => setTimeout(() => r(mc.shell.host.selection()), 50))); }, gid);
    ok(sel && sel.kind === 'group' && sel.id === 'i:' + gid && sel.label, 'the selection as the reasons see it: ' + JSON.stringify(sel));
  }

  // the first-model lesson answers from the model
  await page.evaluate(() => window.ccLessons.start('modelcraft.first-model'));
  await page.evaluate(() => window.ccLessons.emit('model', {}));
  await page.waitForTimeout(300);
  const ls = await page.evaluate(() => JSON.stringify(window.ccLessons.state()));
  ok(/modelcraft\.first-model/.test(ls), 'the first-model lesson runs: ' + ls.slice(0, 200));

  // the Ask box: question → ask_list → ask_reply → shown
  const asked = await page.evaluate(async (C) => {
    const c = eval(C);
    await c.handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'Test AI', version: '1' } } }, 'ask-test');
    window.ccAsk.open();
    const q = await window.ccAsk.ask('How many groups are in this model?', { route: 'queue' }).catch((e) => ({ error: String(e) }));
    const list = await c.call('ask_list', {});
    const id = list.structuredContent?.questions?.[0]?.id ?? list.structuredContent?.items?.[0]?.id ?? q?.id;
    const n = window.modelcraft.model.root.insts.size;
    const r = await c.call('ask_reply', { id, text: 'There are ' + n + ' groups and components in this model.', done: true });
    await new Promise((res) => setTimeout(res, 500));
    return { id, isError: !!r.isError || !!r.structuredContent?.isError, n, text: document.body.innerText.includes('groups and components in this model'), state: JSON.stringify(window.ccAsk.state()).slice(0, 300) };
  }, C);
  ok(!asked.isError && !!asked.id, 'the Ask box takes a question and the assistant answers it (ask_list → ask_reply)', JSON.stringify(asked));
  ok(asked.text, 'and the answer shows on the page');
  await page.screenshot({ path: path.join(OUT, '5-ask.png') });

  // EG.61 ★ from the Ask box: the sentence is asked in the box; the connected assistant turns it into ONE look_set call on the open
  // demo file, then answers. The app does the work (rule 35): the assistant only names time, weather, season, trees and people.
  const SHOW = path.join(path.dirname(new URL(import.meta.url).pathname), '../../fixtures/showcase/modelcraft-say-the-scene.modelcraft');
  await page.evaluate(() => document.querySelector('[data-act="new"]').click());
  const d2 = await page.waitForSelector('dialog[open] button[data-key="discard"]', { timeout: 1500 }).catch(() => null);
  if (d2) await d2.click();
  await page.setInputFiles('[data-file-open]', SHOW);
  await page.waitForFunction(() => window.modelcraft.model.root.insts.size > 0, null, { timeout: 20000 });
  const say = await page.evaluate(async (C) => {
    const c = eval(C);
    window.ccAsk.open();
    const q = await window.ccAsk.ask('Make it dusk with light rain, autumn trees and people on the plaza.', { route: 'queue' }).catch((e) => ({ error: String(e) }));
    const list = await c.call('ask_list', {}, 'ask-test');
    const item = (list.structuredContent?.questions || list.structuredContent?.items || [])[0];
    const places = await c.call('places_list', {}, 'ask-test');
    const plaza = (places.structuredContent?.places || []).find((p) => /plaza/i.test(p.name || ''));
    await c.call('look_set', { time: 'noon', weather: 'clear', season: 'summer', replace: true }, 'ask-test');   // start from a clear summer noon (the demo file is saved at dusk)
    const before = (await c.call('look_describe', {}, 'ask-test')).structuredContent || {};
    const undo0 = window.modelcraft.model.undoStack.length;
    const r = await c.call('look_set', { time: 'dusk', weather: 'light-rain', season: 'autumn', replace: true, trees: { kind: 'tree-deciduous-6m', count: 8, where: plaza ? { instance: plaza.instance } : undefined, seed: 4 }, people: { count: 12, where: plaza ? { instance: plaza.instance } : undefined, seed: 5 } }, 'ask-test');
    const look = await c.call('look_describe', {}, 'ask-test');
    const reply = await c.call('ask_reply', { id: item?.id ?? q?.id, text: 'Done: dusk, light rain, autumn trees and people on the plaza (one change, one undo step).', done: true }, 'ask-test');
    if (!window.ccAsk.state().open) window.ccAsk.open();   // the box shows its questions and answers when open
    for (let i = 0; i < 20 && !document.body.innerText.includes('Done: dusk, light rain'); i++) await new Promise((res) => setTimeout(res, 150));   // the box draws the answer when it comes
    const sc = look.structuredContent || {};
    return { question: item?.text || item?.question || '', plaza: !!plaza, set: !r.isError, err: r.isError ? JSON.stringify(r.content || r.structuredContent).slice(0, 300) : '', was: before.weather + '/' + before.season, steps: window.modelcraft.model.undoStack.length - undo0, weather: sc.weather, season: sc.season, sky: sc.sky, replied: !reply.isError, rerr: reply.isError ? JSON.stringify(reply.content).slice(0, 200) : '', nq: (list.structuredContent?.questions || list.structuredContent?.items || []).length, shown: document.body.innerText.includes('Done: dusk, light rain'), st: JSON.stringify(window.ccAsk.state()).slice(0, 300) };
  }, C);
  ok(/dusk/.test(say.question), 'the sentence waits for the assistant in ask_list', JSON.stringify(say));
  ok(say.was === 'clear/summer' && say.plaza && say.set && say.weather === 'light-rain' && say.season === 'autumn' && say.sky === 'overcast', 'one look_set call from the Ask box: light rain, autumn, overcast sky', JSON.stringify(say));
  ok(say.steps === 1, 'trees and people are one undo step', say.steps);
  ok(say.replied && say.shown, 'the assistant\'s answer shows in the box', JSON.stringify({ r: say.rerr, nq: say.nq, st: say.st }));
  await page.screenshot({ path: path.join(OUT, '6-say-the-scene-ask.png') });
}
