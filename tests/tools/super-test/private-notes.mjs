// SPDX-License-Identifier: Apache-2.0
// Super: MarkupCraft's private notes kept in the project (0.9 NOTES.1), in headless Chromium: a private note saved from the mounted app leaves the PDF with
// no sealed notes at all and files them in Documentation/Private notes; the project round trips as a zip and as a folder; the binder, document exports and
// hand-offs leave them out; the writer gets them back; somebody else opening the project reads nothing and their save keeps them.
//   node tools/super-test/private-notes.mjs
import fs from 'node:fs'; import path from 'node:path';
import { start, launch, ROOT } from './serve.mjs';
const { url, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m, d) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); } };
const PDF = fs.readFileSync(path.resolve(ROOT, '../testfiles/generated/markup/link-set.pdf')).toString('base64');
const PASS = 'correct horse battery', SECRET = 'SECRETPRIVATEWORDS', NOTE = 'PLAINNOTEWORDS';
const browser = await launch();
const errors = [];

async function session(ctx) {
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e.message)));
  await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  return page;
}
const openPdf = (page) => page.evaluate(async (b64) => {
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const w = window.superWindow, st = JSON.parse(JSON.stringify(w.state)); st.active = 'report'; w.state = st;   // in Report and price a PDF is a sheet set to mark up
  await w.openFiles([new File([bytes], 'set.pdf', { type: 'application/pdf' })]);
}, PDF);
const mcReady = (page, n = 5) => page.waitForFunction((k) => window.markupcraft?.sheets?.length >= k && window.markupcraft.view.page && window.markupcraft.notes, n, { timeout: 90000 }).catch(async (e) => { console.log('not ready:', errors, await page.evaluate(() => ({ mc: !!window.markupcraft, sheets: window.markupcraft?.sheets?.length, notes: !!window.markupcraft?.notes, active: window.superWindow.state.active, msg: document.querySelector('[data-sc-msg]')?.textContent, body: document.body.innerText.slice(-300) }))); await page.screenshot({ path: path.join(ROOT, 'tmp/super-test/notes-fail.png') }); throw e; });
const secretsIn = (s) => s.includes(SECRET);

try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await session(ctx);
  await openPdf(page); await mcReady(page);
  ok(await page.evaluate(() => typeof window.ccPrivateNotesStore?.write === 'function'), 'Super gives MarkupCraft a place for private notes');
  await page.evaluate(async (p) => { await window.markupcraft.notes.ready; const r = await window.markupcraft.notes.keychain.unlock(p, { remember: true }); if (!r.ok) throw new Error('unlock'); window.markupcraft.notes.sync(); }, PASS);
  await page.evaluate(([s, n]) => { const mc = window.markupcraft, k = mc.sheets[0].page.key; mc.store.change('t', (tx) => { tx.add({ sheet: k, type: 'text', rect: [100, 100, 400, 140], text: s, scope: 'private', author: 'Ann' }); tx.add({ sheet: k, type: 'text', rect: [100, 200, 400, 240], text: n, scope: 'note', author: 'Ann' }); }); }, [SECRET, NOTE]);
  const panelText = await page.evaluate(() => document.querySelector('[data-pnotes]')?.textContent || '');
  ok(/Documentation folder/.test(panelText), 'the panel says where private notes are kept');

  // a save from the mounted app
  const [dl] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => window.markupcraft.saveFiles())]);
  const pdfPath = await dl.path(); const pdfBytes = fs.readFileSync(pdfPath);
  const read = await page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const mod = await import('/assets/vendor/pdf-lib/current/pdf-lib.esm.js');
    const d = await mod.PDFDocument.load(bytes, { updateMetadata: false });
    const st = d.context.lookup(d.catalog.get(mod.PDFName.of('MarkupCraftNotes')));
    return JSON.parse(new TextDecoder().decode(mod.decodePDFRawStream(st).decode()));
  }, pdfBytes.toString('base64'));
  ok(Array.isArray(read.sealed) && read.sealed.length === 0, 'the PDF holds no private notes, not even sealed', read.sealed?.length);
  ok(/^[0-9a-f]{32}$/.test(read.uid), 'only a random id naming them', read.uid);
  ok(read.notes.some(n => n.text === NOTE) && !JSON.stringify(read).includes(SECRET), 'plain notes are there, private words are not');
  ok(/Save the project/.test(await page.evaluate(() => document.querySelector('[data-status]')?.textContent || '')), 'the status line says to save the project');

  const fileInfo = await page.evaluate(() => { const { P, project } = window.superWindow; const m = project.members.find(P.isPrivateNotes); return m && { name: m.name, dir: P.classify(m).dir, text: new TextDecoder().decode(m.bytes) }; });
  ok(fileInfo?.dir === 'Documentation/Private notes' && fileInfo.name === read.uid + '.ccnotes', 'filed in Documentation/Private notes', fileInfo?.dir);
  ok(fileInfo && !fileInfo.text.includes(SECRET) && !fileInfo.text.includes('Ann') && fileInfo.text.includes('cc-private-notes'), 'the file is sealed and names nobody');

  // what leaves the project
  const leave = await page.evaluate(async () => {
    const { P, project, plugins } = window.superWindow, enc = (s) => new TextEncoder().encode(s);
    const zip = P.toBytes(project, { leaveOutVersions: true });
    const back = await P.fromBytes(zip);
    const hand = await P.fromBytes(P.toBytes(project, { leaveOutVersions: true, leaveOutPrivate: true }));
    const paths = P.projectFiles(project, { leaveOutVersions: true }).files.map(f => f.path);
    const root = await navigator.storage.getDirectory(); try { await root.removeEntry('sctest-notes', { recursive: true }); } catch { /* none */ }
    const parent = await root.getDirectoryHandle('sctest-notes', { create: true });
    await P.writeFolder(project, parent, {});
    const fromDir = await P.fromFolder(parent);
    void enc;
    return { paths, inZip: back.project.members.some(P.isPrivateNotes), skipped: back.skipped, handoff: hand.project.members.some(P.isPrivateNotes), handoffPdf: hand.project.members.length, inDir: fromDir.project.members.some(P.isPrivateNotes), dirSkipped: fromDir.skipped };
  });
  ok(leave.paths.some(p => /^Documentation\/Private notes\/[0-9a-f]{32}\.ccnotes$/.test(p)), 'the project tree has it', leave.paths);
  ok(leave.inZip && !leave.skipped.length, 'a .ccproject carries it', leave.skipped);
  ok(leave.inDir && !leave.dirSkipped.length, 'a project folder carries it', leave.dirSkipped);
  ok(!leave.handoff && leave.handoffPdf >= 1, 'a hand-off (Finalize and export, Email this) leaves it out');
  const binder = await page.evaluate(() => {
    const { P, project } = window.superWindow;
    const docs = project.members.filter(m => P.classify(m).folder === 'Documentation' && !P.isPrivateNotes(m));
    return { docs: docs.map(d => d.name), api: !!window.superWindow.plugins };
  });
  ok(binder.docs.length >= 1 && !binder.docs.some(n => n.endsWith('.ccnotes')), 'the report binder and document exports do not see it', binder.docs);

  // keep the project, then open it as a new session
  const saveProj = async (pg) => { const [d] = await Promise.all([pg.waitForEvent('download', { timeout: 60000 }), pg.evaluate(() => window.superWindow.saveProject())]); return fs.readFileSync(await d.path()).toString('base64'); };
  await page.evaluate(() => { const mc = window.markupcraft; mc.store.change('t', (tx) => tx.add({ sheet: mc.sheets[0].page.key, type: 'text', rect: [100, 500, 400, 540], text: 'REGULAR', author: 'Ann' })); });
  const zipB64 = await saveProj(page);
  const openProj = (pg, b64) => pg.evaluate(async (z) => { const bytes = Uint8Array.from(atob(z), c => c.charCodeAt(0)); await window.superWindow.openProject(new File([bytes], 'plant.ccproject')); }, b64);

  // the writer, same device
  const again = await session(ctx);
  await openProj(again, zipB64); await mcReady(again);
  await again.waitForFunction((s) => window.markupcraft.store.everything().some(m => m.text === s && m.scope === 'private'), SECRET, { timeout: 30000 });
  ok(true, 'the writer opens the project and has the private note back');
  ok(await again.evaluate(() => window.markupcraft.files.length === 1 && /marked up/.test(window.markupcraft.files[0].name)), 'only the marked-up copy opens; the original stays in the project');
  ok(await again.evaluate(() => window.superWindow.project.members.some(m => m.name === 'set.pdf')), 'the original is still there');
  ok(await again.evaluate((n) => window.markupcraft.store.everything().some(m => m.text === n && m.scope === 'note'), NOTE), 'and the plain note');
  await again.close();

  // somebody else
  const other = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const bob = await session(other);
  await openProj(bob, zipB64); await mcReady(bob);
  await bob.waitForTimeout(800);
  const seen = await bob.evaluate(() => JSON.stringify(window.markupcraft.store.everything()));
  ok(!secretsIn(seen) && seen.includes(NOTE), 'somebody else sees the plain note and not the private one');
  ok(!/SECRET/.test(await bob.evaluate(() => document.body.innerText)), 'nothing on their screen');
  await bob.evaluate(() => { const mc = window.markupcraft; mc.store.change('t', (tx) => tx.add({ sheet: mc.sheets[0].page.key, type: 'text', rect: [100, 300, 400, 340], text: 'BOBWORDS', author: 'Bob' })); });
  const zip2 = await saveProj(bob);
  const kept = await bob.evaluate(() => { const { P, project } = window.superWindow; const ms = project.members.filter(P.isPrivateNotes); return ms.flatMap(m => JSON.parse(new TextDecoder().decode(m.bytes)).sealed).length; });
  ok(kept === 1, 'their save keeps the sealed notes', kept);
  await other.close();

  // the writer on another device, through the colleague's save
  const third = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const ann2 = await session(third);
  await openProj(ann2, zip2); await mcReady(ann2);
  ok(!secretsIn(await ann2.evaluate(() => JSON.stringify(window.markupcraft.store.everything()))), 'another device, before the passphrase: nothing');
  const opened = await ann2.evaluate(async (p) => { const n = window.markupcraft.notes; const blobs = window.markupcraft.files.flatMap(f => [...(f.sealed || []), ...(f.storeBlobs || [])]); await n.ready; const r = await n.keychain.unlock(p, { remember: false, blobs }); for (const f of window.markupcraft.files) await n.adopt(f); return r; }, PASS);
  ok(opened.ok && opened.added === 1, 'the passphrase opens it', opened);
  ok(await ann2.evaluate((s) => window.markupcraft.store.everything().some(m => m.text === s && m.scope === 'private'), SECRET), 'and the note is back, with the colleague\'s work');
  ok(await ann2.evaluate(() => window.markupcraft.store.all().some(m => m.text === 'BOBWORDS')), 'their markup is there too');
  // lock keeps it in the project form, removing the last note removes the file
  await ann2.evaluate(() => window.markupcraft.notes.lock());
  ok(await ann2.evaluate(() => { return window.markupcraft.files.some(f => f.storeBlobs?.length === 1 && !(f.sealed || []).length); }), 'locked: sealed for the project, not for the PDF');
  await ann2.evaluate(async (p) => { const n = window.markupcraft.notes; await n.keychain.unlock(p, { remember: false }); for (const f of window.markupcraft.files) await n.adopt(f); }, PASS);
  await ann2.evaluate(() => { const mc = window.markupcraft; mc.store.change('t', (tx) => { for (const m of mc.store.everything()) if (m.scope === 'private') tx.remove(m.id); }); });
  await ann2.evaluate(async () => { for (const f of window.markupcraft.files) await window.markupcraft.notes.packFor(f); });
  ok(await ann2.evaluate(() => { const { P, project } = window.superWindow; return !project.members.some(P.isPrivateNotes); }), 'no private notes left: the file goes');
  await third.close();
  ok(!errors.length, 'no page errors', errors);
  await ctx.close();
} finally {
  await browser.close(); await close();
}
console.log('\n' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail ? 1 : 0);
