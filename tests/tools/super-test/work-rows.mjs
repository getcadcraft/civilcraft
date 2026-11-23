// SPDX-License-Identifier: Apache-2.0
// SCF.6 and SCF.7 in the real page (headless Chromium): the notes plug-in's entries are ROWS through the file director (and the old file is kept current beside them),
// a project saved today (only the old file) migrates on first use, the rows travel through the .ccproject and the .supercad and come back, and the SQLite writer (a per-computer
// opt-in) keeps the same rows in rows.sqlite.   node tools/super-test/work-rows.mjs
import { start, launch } from './serve.mjs';
const { url: URL0, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const errors = [];
async function boot(init) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(String(e.message)));
  await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  return { ctx, page };
}
const WF = '.sc-barbtn[data-act="workflow"]', DLG = 'dialog[data-sc-plugin="notes-tasks"][open]';
const runCmd = async (page, key) => { if (!await page.$('.sc-wf-menu')) await page.click(WF); await page.waitForSelector('.sc-wf-menu'); await page.click(`.sc-wf-menu [data-act="plugin:${key}"]`); };
const ext = (page, name) => page.evaluate(n => { const b = window.superWindow.P.extGet(window.superWindow.project, 'notes-tasks', n); return b ? Array.from(b) : null; }, name);
const text = a => (a ? new TextDecoder().decode(new Uint8Array(a)) : '');
const closeDlg = page => page.evaluate(() => document.querySelectorAll('dialog[data-sc-plugin="notes-tasks"][open]').forEach(d => d.close()));
const addNote = async (page, s) => { await runCmd(page, 'notes-tasks:new-note'); await page.waitForSelector(DLG); await page.fill('[data-note-text]', s); await page.click('[data-note-new-save]'); await page.waitForTimeout(200); };
const listText = page => page.evaluate(() => document.querySelector('[data-note-list]')?.textContent || '');

/* ---- 1. rows by default, the old file kept current ---- */
{
  const { ctx, page } = await boot(); await addNote(page, 'First note');
  const rows = JSON.parse(text(await ext(page, 'rows/work_note.json')) || 'null');
  ok(rows && rows.format === 'supercadcraft-rows' && Object.keys(rows.rows).length === 1, 'the note is a row in rows/work_note.json');
  const r = Object.values(rows.rows)[0]; ok(/^[0-9a-f-]{36}$/.test(r.uuid) && r.id === 'n1' && r.entry.text === 'First note' && r.updated_at > 0 && r.deleted_at === null, 'row: uuid, plug-in id n1, entry, updated_at');
  const legacy = JSON.parse(text(await ext(page, 'notes.json')) || 'null');
  ok(legacy && legacy.notes.length === 1 && legacy.notes[0].text === 'First note', 'the old notes.json is kept current beside the rows');
  await closeDlg(page); await addNote(page, 'Second note');
  { const t = await listText(page); ok(/Second note/.test(t) && /First note/.test(t), 'the dialog lists both from the rows'); }
  // the project file carries the rows; reopening shows the notes
  const back = await page.evaluate(async () => { const { P, project } = window.superWindow; const bytes = P.toBytes(project, {}); const r = await P.fromBytes(bytes); const g = n => { const b = P.extGet(r.project, 'notes-tasks', n); return b ? new TextDecoder().decode(b) : null; }; return { rows: g('rows/work_note.json'), meta: g('notes.json.meta.json'), legacy: g('notes.json') }; });
  const br = JSON.parse(back.rows || 'null'); ok(br && Object.keys(br.rows).length === 2 && JSON.parse(back.meta).seq === 2 && JSON.parse(back.legacy).notes.length === 2, 'the .ccproject carries rows, meta and the old file, and gives them back');
  const sc = await page.evaluate(async () => {   // the .supercad (SQLite): the same files as proj_ext blobs, read back
    const { P, project } = window.superWindow; const set = P.projectFiles(project, { mode: 'zip' }); const mod = await import('/assets/apps/supercadcraft/dev/super-supercad.js');
    const w = await mod.writeBoth(set, { want: 'supercad', project: 'x', rev: 0 }); if (!w.supercad || !w.supercad.bytes) return { err: JSON.stringify(w.supercad) };
    const r = await mod.fromSupercad(w.supercad.bytes, await mod.sqlite()); const b = P.extGet(r.project, 'notes-tasks', 'rows/work_note.json'); return { rows: b ? new TextDecoder().decode(b) : null, unplaced: w.supercad.stats.unplaced.length };
  });
  ok(sc.rows && Object.keys(JSON.parse(sc.rows).rows).length === 2 && sc.unplaced === 0, 'the .supercad holds the rows and reads them back: ' + (sc.err || ''));
  await closeDlg(page); await ctx.close();
}
/* ---- 2. a project saved today (old file only) migrates on first use ---- */
{
  const { ctx, page } = await boot();
  await page.evaluate(() => { const { P, project } = window.superWindow; const doc = { format: 'supercadcraft-notes', version: 1, seq: 2, notes: [{ id: 'n1', time: '2026-11-19T09:00:00.000Z', text: 'Saved yesterday' }, { id: 'n2', time: '2026-11-19T10:00:00.000Z', text: 'Also yesterday', pinned: true }] }; P.extSet(project, 'notes-tasks', 'notes.json', new TextEncoder().encode(JSON.stringify(doc))); });
  const before = text(await ext(page, 'notes.json'));
  await runCmd(page, 'notes-tasks:notes'); await page.waitForSelector(DLG);
  ok(await page.evaluate(() => /Saved yesterday/.test(document.querySelector('[data-note-list]')?.textContent || '') && /Also yesterday/.test(document.querySelector('[data-note-list]')?.textContent || '')), 'the older file opens: both notes are there');
  const rows = JSON.parse(text(await ext(page, 'rows/work_note.json')) || 'null');
  ok(rows && Object.keys(rows.rows).length === 2 && Object.values(rows.rows).map(r => r.id).sort().join() === 'n1,n2', 'opening migrated its two notes to rows');
  ok(text(await ext(page, 'notes.json')) === before, 'and the file itself was not touched by the migration');
  await closeDlg(page); await addNote(page, 'Third');
  const rows2 = JSON.parse(text(await ext(page, 'rows/work_note.json')));
  ok(Object.keys(rows2.rows).length === 3 && Object.values(rows2.rows).some(r => r.id === 'n3'), 'a new note continues the numbering (n3)');
  await ctx.close();
}
/* ---- 3. the SQLite writer (opt-in on this computer) ---- */
{
  const { ctx, page } = await boot(() => { try { localStorage.setItem('cc-super-sqlite-rows', '1'); } catch { /* blocked */ } });
  await addNote(page, 'In SQLite');
  const f = await ext(page, 'rows.sqlite');
  ok(f && f.length > 4096 && text(f.slice(0, 15)) === 'SQLite format 3', 'rows.sqlite is a SQLite file in the plug-in folder');
  ok(await ext(page, 'rows/work_note.json') === null, 'the note is not in the JSON rows (the database is the primary writer)');
  ok(JSON.parse(text(await ext(page, 'notes.json'))).notes.length === 1, 'the old file is still kept current');
  const n = await page.evaluate(async () => { const { P, project } = window.superWindow; const b = P.extGet(project, 'notes-tasks', 'rows.sqlite'); const m = await import('/assets/apps/supercadcraft/dev/super-supercad.js'); const SQL = await m.sqlite(); const d = new SQL.Database(b); const r = d.exec('SELECT id, updated_at, body FROM work_note'); const out = r[0].values.map(v => ({ id: v[0], t: JSON.parse(v[2]).entry.text })); const app = d.exec('PRAGMA application_id')[0].values[0][0]; d.close(); return { out, app }; });
  ok(n.app === 1396916548 && n.out.length === 1 && n.out[0].t === 'In SQLite', 'the file reads back with the schema: ' + JSON.stringify(n));
  await closeDlg(page); await addNote(page, 'And another');
  { const t = await listText(page); ok(/And another/.test(t) && /In SQLite/.test(t), 'both notes show from the database'); }
  await ctx.close();
}
const mine = errors.filter(e => !/favicon|Failed to load resource/.test(e));
ok(mine.length === 0, 'no page error: ' + mine.slice(0, 3).join(' | '));
console.log(`work rows page: ${pass} passed, ${fail} failed`);
await browser.close(); close(); process.exit(fail ? 1 : 0);
