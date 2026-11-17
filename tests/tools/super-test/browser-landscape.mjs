// SPDX-License-Identifier: Apache-2.0
// 0.8 LA.1 (session landscape-finish_PART_4): SuperCad Studio's Landscape links against CivilCraft's REAL engine (landscape.links(),
// linkSource(), fromSource(), syncLinks()), not a stand-in. One .ccproject with a CivilCraft site and a CadCraft drawing: the person picks a
// closed polyline and a line in the drawing, makes paving and a feature line from them (CivilCraft's own chooser), moves the lines in the
// drawing, runs "Update the landscape from the drawing" from Ctrl+K, and saves: links.json and the site file carry the links.
// Focused on its own because tools/super-test/browser.mjs stalls at the ModelCraft tear-off on this machine (not this test's part).
//   node tools/super-test/browser-landscape.mjs [--shots <dir>]
import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
import { ROOT, OUT, start, launch } from './serve.mjs';
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
if (shots) fs.mkdirSync(shots, { recursive: true });
const P = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/apps/supercadcraft/dev/super-project.js')).href);

// the drawing: a closed 6 x 4 polyline (a terrace) and a 10 m line (an edge), in metres
const DXF = path.join(OUT, 'la-garden.dxf');
const g = (c, v) => `${c}\n${v}\n`;
fs.writeFileSync(DXF, g(0, 'SECTION') + g(2, 'HEADER') + g(9, '$INSUNITS') + g(70, 6) + g(0, 'ENDSEC') + g(0, 'SECTION') + g(2, 'ENTITIES')
  + g(0, 'LWPOLYLINE') + g(8, 'L-PAVE') + g(90, 4) + g(70, 1) + g(10, 0) + g(20, 0) + g(10, 6) + g(20, 0) + g(10, 6) + g(20, 4) + g(10, 0) + g(20, 4)
  + g(0, 'LINE') + g(8, 'L-EDGE') + g(10, 0) + g(20, 8) + g(30, 0) + g(11, 10) + g(21, 8) + g(31, 0) + g(0, 'ENDSEC') + g(0, 'EOF'));
const SITE = path.join(ROOT, 'fixtures/showcase/civilcraft-staircase.civilcraft.json');

const { url: URL0, close } = await start({ langs: [''] });
let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) pass++; else { fail++; console.log('FAIL', m, extra === undefined ? '' : JSON.stringify(extra).slice(0, 400)); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e.message)));
page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|bad HTTP response code/.test(m.text())) errors.push(m.text()); });
const shot = async n => { if (shots) await page.screenshot({ path: path.join(shots, n + '.png') }); };
const give = async file => { await page.setInputFiles('[data-sc-open-input]', file); };
const discard = async () => {   // CivilCraft asks before replacing its project (confirmDiscard) and may offer an autosave
  for (let i = 0; i < 20; i++) {
    const b = await page.$('.cv-ask[open] button[data-key="discard"], [data-autosave-dialog][open] [data-autosave-discard]');
    if (!b) { await page.waitForTimeout(250); if (i > 6) break; continue; }
    await b.click().catch(() => {}); await page.waitForTimeout(250);
  }
};
const status = () => page.textContent('.sc-status');
const civil = (fn, arg) => page.evaluate(fn, arg);

try {
  await page.goto(URL0);
  await page.waitForSelector('[data-sc-ready]');
  await page.evaluate(() => window.superWindow.ready);
  ok(true, 'page opens');

  // the drawing into the 2D drawing (Build), the site into CivilCraft (Landscape)
  await page.click('.sc-wstab[data-ws="build"]');
  await give(DXF);
  await page.waitForFunction(() => document.querySelector('[data-panel="cad"]')?.dataset.mount === 'ready' && window.cadcraft?.doc?.all().length >= 2, null, { timeout: 60000 });
  ok(await page.evaluate(() => window.cadcraft.doc.all().some(e => e.type === 'poly' && e.closed) && window.cadcraft.doc.all().some(e => e.type === 'line')), 'the drawing opened in CadCraft: a closed polyline and a line');
  await page.click('.sc-wstab[data-ws="landscape"]');
  await give(SITE);
  await page.waitForFunction(() => document.querySelector('[data-panel="civil"]')?.dataset.mount === 'ready', null, { timeout: 60000 });
  await discard();
  await page.waitForFunction(() => (window.civilcraft?.project?.state?.landscape?.hardscape || []).length >= 4, null, { timeout: 30000 });
  const mem = await page.evaluate(() => window.superWindow.project.members.map(m => [m.id, m.app]));
  ok(mem.some(m => m[1] === 'cadcraft') && mem.some(m => m[1] === 'civilcraft'), 'one project: the site and the drawing are members', mem);
  ok(await civil(() => typeof window.civilcraft.landscape.links === 'function' && typeof window.civilcraft.landscape.linkSource === 'function' && typeof window.civilcraft.landscape.fromSource === 'function' && typeof window.civilcraft.landscape.syncLinks === 'function'), 'CivilCraft\'s real engine is there: links, linkSource, fromSource, syncLinks');
  const before = await civil(() => ({ hard: window.civilcraft.project.state.landscape.hardscape.length, feats: (window.civilcraft.project.state.features || []).length }));
  await shot('la1-01-project');

  // pick the closed polyline in the drawing → Ctrl+K "Landscape object from the picked drawing line" → CivilCraft's chooser → Paving
  const pick = (type) => page.evaluate(t => { const c = window.cadcraft, e = c.doc.all().find(x => x.type === t); c.host.setSelection(new Set([e.id])); return e.id; }, type);
  const palette = async (words) => {
    await page.keyboard.press('Control+k');
    await page.waitForSelector('dialog[open] input', { timeout: 5000 });
    await page.keyboard.type(words);
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
  };
  ok(await page.evaluate(() => window.ccPalette.items().some(i => i.id === 'app:super:landscape-make') && window.ccPalette.items().some(i => i.id === 'app:super:landscape-update')), 'Ctrl+K lists "Landscape object from the picked drawing line" and "Update the landscape from the drawing"');
  await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));
  await page.evaluate(() => window.superWindow.landscape.make());
  ok(/Pick one line or polyline/.test(await status()), 'nothing picked: the status line says what to do', await status());
  const polyId = await pick('poly');
  await palette('Landscape object from the picked');
  await page.waitForSelector('[data-ls-fromline][open]', { timeout: 10000 });
  const kinds = await page.$$eval('[data-ls-fromline][open] [data-lk-kind]', b => b.map(x => x.dataset.lkKind));
  ok(kinds.includes('paving') && kinds.includes('feature') && !kinds.includes('path'), 'CivilCraft asks what to make from a closed line (an area, or a feature line)', kinds);
  await shot('la1-02-chooser');
  await page.click('[data-ls-fromline][open] [data-lk-kind="paving"]');
  await page.waitForTimeout(400);
  const pav = await civil(() => window.civilcraft.project.state.landscape.hardscape.at(-1));
  const cadMember = mem.find(m => m[1] === 'cadcraft')[0];
  ok(pav && pav.kind === 'paving' && pav.link?.src === 'member' && pav.link.member === cadMember && pav.link.handle === Number(polyId).toString(16).toUpperCase() && pav.pts.length === 4, 'paving made from the polyline, linked to that entity of the drawing member', pav?.link);

  // the line → a feature line
  const lineId = await pick('line');
  await palette('Landscape object from the picked');
  await page.waitForSelector('[data-ls-fromline][open]', { timeout: 10000 });
  ok((await page.$$eval('[data-ls-fromline][open] [data-lk-kind]', b => b.map(x => x.dataset.lkKind))).includes('path'), 'an open line offers strips and lines');
  await page.click('[data-ls-fromline][open] [data-lk-kind="feature"]');
  await page.waitForTimeout(400);
  const fl = await civil(() => (window.civilcraft.project.state.features || []).at(-1));
  ok(fl && fl.link?.src === 'member' && fl.link.handle === Number(lineId).toString(16).toUpperCase() && fl.use === 'off' && fl.pts.length === 2 && fl.pts.every(q => Number.isFinite(q.z)), 'LA.2 output: a feature line made from the drawing line, use off, levels on the ground', fl);
  ok(await page.$eval('[data-ls-link]', e => /Linked to/.test(e.textContent)).catch(() => false), 'its Properties say what it is linked to, with Break link');
  const after = await civil(() => ({ hard: window.civilcraft.project.state.landscape.hardscape.length, feats: (window.civilcraft.project.state.features || []).length }));
  ok(after.hard === before.hard + 1 && after.feats === before.feats + 1, 'one paving and one feature line more', [before, after]);

  // links.json follows (CivilCraft announces cc-landscape-links)
  const links = () => page.evaluate(() => window.superWindow.project.links.filter(l => l.kind === 'landscape-source').map(l => [l.from.member, l.from.id, l.to.id]));
  const L1 = await links();
  ok(L1.length === 2 && L1.some(l => /^hardscape:/.test(l[2])) && L1.some(l => /^features:/.test(l[2])), 'the project\'s links.json has both, without a command', L1);

  // move the lines in the drawing (the person edits them in CadCraft), then Ctrl+K "Update the landscape from the drawing"
  await page.evaluate(([pid, lid]) => {
    const d = window.cadcraft.doc, p = d.get(pid), l = d.get(lid);
    d.change('widen', () => { d.update(pid, { ...p, pts: p.pts.map(q => ({ ...q, x: q.x > 1 ? 9 : q.x })) }); d.update(lid, { ...l, y1: 9, y2: 9 }); });
  }, [polyId, lineId]);
  const undo0 = await civil(() => window.civilcraft.project.undoStack.length);
  await palette('Update the landscape from');
  await page.waitForTimeout(600);
  const moved = await civil(() => ({ pav: window.civilcraft.project.state.landscape.hardscape.at(-1).pts, fl: window.civilcraft.project.state.features.at(-1).pts }));
  ok(moved.pav.some(q => q.x === 9) && !moved.pav.some(q => q.x === 6), 'the paving follows the widened polyline', moved.pav);
  ok(moved.fl.every(q => q.y === 9) && moved.fl.every(q => q.z === fl.pts[0].z || Number.isFinite(q.z)), 'the feature line follows the moved line', moved.fl);
  ok(/Lines read: 2; not found: 0; refused: 0/.test(await status()), 'the status line counts the lines read', await status());
  ok((await civil(() => window.civilcraft.project.undoStack.length)) - undo0 === 2, 'each source line is one undo step in CivilCraft');
  await shot('la1-03-followed');

  // a self-crossing polyline is refused: the paving stays, Problems knows
  await page.evaluate(pid => { const d = window.cadcraft.doc, p = d.get(pid); d.change('cross', () => d.update(pid, { ...p, pts: [{ x: 0, y: 0, b: 0 }, { x: 4, y: 4, b: 0 }, { x: 4, y: 0, b: 0 }, { x: 0, y: 4, b: 0 }] })); }, polyId);
  await page.evaluate(() => window.superWindow.landscape.run());
  ok(/refused: 1/.test(await status()) && (await civil(() => window.civilcraft.project.state.landscape.hardscape.at(-1).pts.some(q => q.x === 9))), 'a self-crossing polyline is refused and the paving stays', await status());
  ok(await civil(() => window.civilcraft.landscape.linkNotes().some(n => n.code === 'ls.link.bad')), 'the refusal is a Problems note in CivilCraft');
  await page.evaluate(() => window.cadcraft.doc.undo());

  // the save hook: Save writes links.json, and the site member carries the objects' links
  const dl = page.waitForEvent('download', { timeout: 90000 });
  await page.evaluate(() => window.superWindow.saveProject());
  const file = await (await dl).path();
  const saved = await P.fromBytes(new Uint8Array(fs.readFileSync(file)));
  const sl = saved.project.links.filter(l => l.kind === 'landscape-source');
  ok(sl.length === 2 && sl.every(l => l.from.member === cadMember), 'Save: the .ccproject\'s links.json has the two landscape links from the drawing member', sl);
  const json = t => { try { return JSON.parse(t); } catch { return null; } };
  const site = saved.project.members.filter(m => m.app === 'civilcraft' && m.role === 'saved').map(m => json(new TextDecoder().decode(m.bytes))).find(j => j && j.format === 'civilcraft-project');
  const memberLinks = site ? [...(site.landscape?.hardscape || []), ...(site.features || [])].filter(o => o.link?.src === 'member' && o.link.member === cadMember) : [];
  ok(memberLinks.length === 2, 'and the site file CivilCraft saved inside it carries the paving\'s and the feature line\'s links', memberLinks.map(o => o.link));
  ok(saved.workspace === 'landscape', 'the Landscape workspace is remembered');

  // Break link on the feature line: links.json drops it
  await civil(() => { const f = window.civilcraft.project.state.features.at(-1); window.civilcraft.select({ kind: 'feature', id: f.id }); });
  await page.waitForSelector('[data-ls-unlink]', { timeout: 5000 });
  await page.click('[data-ls-unlink]');
  await page.waitForTimeout(300);
  ok((await links()).length === 1, 'Break link on the feature line: links.json keeps only the paving');
} catch (e) {
  fail++; console.log('FAIL (stopped)', e.message.split('\n')[0]);
}
ok(errors.length === 0, 'no page errors', errors.slice(0, 5));
await browser.close(); close();
fs.rmSync(DXF, { force: true });
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
