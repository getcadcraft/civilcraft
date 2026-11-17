// SPDX-License-Identifier: Apache-2.0
// Super: the Issue and record page (plug-in `issue`) and the export map in a real browser (lab build, headless Chromium): issue a set and see it frozen (BK.139), log a site
// instruction (BK.112), bring a BCF file in and send topics out (BK.164), make the client's link against a stand-in for the website and get the comments back as topics (BK.71:
// the endpoint is intercepted, nothing reaches the site and nothing is mailed), send a copy out and merge it back by choice (BK.53), the team part (BK.52) and the export
// dialog's map (BK.41). Screenshots go to tmp/super-test/.
//   node tools/super-test/issue.mjs
import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
import { start, launch, OUT, ROOT } from './serve.mjs';
const DEV = path.join(ROOT, 'public_html/assets/apps/supercadcraft/dev');
const P = await import(pathToFileURL(path.join(DEV, 'super-project.js')).href), BCF = await import(pathToFileURL(path.join(DEV, 'super-bcf.js')).href);
const { fixtureIfc } = await import(pathToFileURL(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs')).href);
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const page = await ctx.newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });

/* the stand-in website: signed in, and /api/v1/team/review answered here (never the real site) */
const KEY = 'ccu_' + 's'.repeat(40), server = { links: new Map(), hits: [] };
await page.route('**/api/account/super-connect', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: { signedIn: true, token: KEY, expires_at: 'x' } }) }));
await page.route('**/api/v1/**', async route => {
  const req = route.request(), u = new URL(req.url()); server.hits.push(req.method() + ' ' + u.pathname);
  const reply = (d, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ status: status < 400 ? 'success' : 'error', message: '', data: d }) });
  if (u.pathname === '/api/v1/account/database') return reply({ account: { email: 'lab@example.com' }, db: { id: 'a1'.repeat(32), folder: 'a1/x', file: 'teams.sqlite', schema_version: 1, tables: [] }, datasets: [], server_time: Date.now() });
  if (u.pathname !== '/api/v1/team/review') return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  if (req.method() === 'GET') { const L = server.links.get(u.searchParams.get('link')); return L ? reply({ comments: L.comments, link: {} }) : reply({}, 404); }
  const b = JSON.parse(req.postData());
  if (b.op === 'create') { const id = '00000001-aaaa-4bbb-8ccc-dddddddddddd'; server.links.set(id, { pack: b.pack, files: [], comments: [], stage: b.stage }); return reply({ link: { id, label: b.label, stage: b.stage, token_hint: 'wxyz', created_at: Date.now(), expires_at: Date.now() + b.days * 864e5 }, token: 'T'.repeat(39) + 'wxyz', url: 'https://getcadcraft.com/review?t=' + 'T'.repeat(39) + 'wxyz' }, 201); }
  const L = server.links.get(b.link); if (!L) return reply({}, 404);
  if (b.op === 'file') { L.files.push(b.sha256); return reply({ sha256: b.sha256, bytes: 1 }); }
  if (b.op === 'publish') { L.pack = b.pack; return reply({ link: { stage: L.stage } }); }
  if (b.op === 'revoke') { L.revoked = true; return reply({ link: {} }); }
  return reply({}, 400);
});

const quiet = pg => pg.addStyleTag({ content: '.nh-offer{display:none!important}' });   // the "I'm new" offer sits over the corner of the window
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await quiet(page); await page.waitForTimeout(800);
const PG = '[data-home-view="page"]:not([hidden])', MSG = PG + ' [data-iss-msg]';
const msg = async () => (await page.textContent(MSG)).trim();
const tab = async k => { await page.click(`${PG} [data-iss-tab="${k}"]`); await page.waitForSelector(`${PG} [data-iss-body="${k}"]`); };
await page.evaluate(() => window.superWindow.home.show('home')); await page.waitForTimeout(300);
await page.evaluate(() => window.superWindow.home.show('project-options'));
ok(await page.$('[data-home-project-pages] [data-hvpage="issue:issue"]') !== null, 'the welcome menu has an Issue and record entry');
await page.evaluate(() => window.superWindow.home.show('project-options'));
await page.click('[data-home-project-pages] [data-hvpage="issue:issue"]'); await page.waitForSelector(PG + ' [data-iss-tabs]');
ok((await page.textContent(PG + ' h1')).trim() === 'Issue and record' && await page.$$eval('dialog[open]', n => n.length) === 0, 'it is a page with its heading, no dialog');
ok((await page.$$eval(PG + ' [data-iss-tab]', n => n.map(x => x.textContent.trim()))).join('|') === 'Issued sets|Site instructions|Topics|Client link|Other firms|Team', 'six parts, named in plain words');
ok(await page.$(PG + ' [data-iss-empty="issues"]') !== null, 'nothing issued yet: it says so');

/* a project with two sheets and a model */
const ifcA = fixtureIfc({}), ifcB = fixtureIfc({ rev: 'b' });
await page.evaluate(({ ifcA }) => { const { P, project } = window.superWindow, enc = s => new TextEncoder().encode(s); project.name = 'Tower';
  P.addMember(project, { app: 'markupcraft', name: 'A-101 Ground floor.pdf', bytes: enc('%PDF-1.4\n% A-101 v1\n%%EOF\n'), role: 'saved' }); P.addMember(project, { app: 'markupcraft', name: 'A-102 First floor.pdf', bytes: enc('%PDF-1.4\n% A-102 v1\n%%EOF\n'), role: 'saved' });
  P.addMember(project, { app: 'bimcraft', name: 'Tower.ifc', bytes: enc(ifcA), role: 'saved' }); }, { ifcA });

/* ---- BK.139: issue a set ---- */
await tab('records'); await tab('issues');
ok(await page.$$eval(PG + ' [data-iss-source]', n => n.length) === 3, 'the project\'s three files can be ticked');
await page.click(PG + ' [data-act="iss-freeze"]'); ok(/Tick at least one file/.test(await msg()), 'nothing ticked: it says so: ' + await msg());
await page.check(PG + ' [data-iss-source="A-101 Ground floor.pdf"]'); await page.check(PG + ' [data-iss-source="A-102 First floor.pdf"]');
ok(/revision A with 2 files/.test(await page.textContent(PG + ' [data-iss-preview]')) && await page.$$eval(PG + ' [data-iss-plan="first"]', n => n.length) === 2, 'the preview: revision A, both sheets first issued');
await page.selectOption(PG + ' [data-iss-purpose]', 'construction'); await page.fill(PG + ' [data-iss-name]', 'For construction'); await page.fill(PG + ' [data-iss-by]', '');
await page.click(PG + ' [data-act="iss-freeze"]'); ok(/name of the person who signs/.test(await msg()), 'no name: nothing is issued unsigned: ' + await msg());
await page.fill(PG + ' [data-iss-by]', 'Olive Architect'); await page.fill(PG + ' [data-iss-role]', 'Principal architect'); await page.click(PG + ' [data-act="iss-freeze"]'); await page.waitForSelector(PG + ' [data-iss-issue]');
ok(/Revision A is issued: 2 files frozen/.test(await msg()), 'issued: ' + await msg());
const rowA = await page.textContent(PG + ' [data-iss-issue]'); ok(/A/.test(rowA) && rowA.includes('For construction') && rowA.includes('Olive Architect, Principal architect') && rowA.includes('Current') && rowA.includes('as issued (2)'), 'the row: revision, purpose, who signed, current, verified: ' + rowA.replace(/\s+/g, ' ').slice(0, 200));
const tamper = await page.evaluate(() => { const { P, project } = window.superWindow; const k = [...project.ext.keys()].find(x => /^issue\/sets\/.+\/files\//.test(x)); const before = P.sha256(project.ext.get(k)); let code = '';
  try { P.extSet(project, 'issue', k.slice(6), new TextEncoder().encode('tampered')); } catch (e) { code = e.code; } let code2 = ''; try { P.extSet(project, 'issue', k.slice(6), null); } catch (e) { code2 = e.code; } return { code, code2, same: P.sha256(project.ext.get(k)) === before }; });
ok(tamper.code === 'frozen' && tamper.code2 === 'frozen' && tamper.same, 'in the page: replacing or removing an issued file is refused and the bytes are unchanged ' + JSON.stringify(tamper));
await page.click(PG + ' [data-act="iss-verify"]'); ok(/all 2 files are exactly as issued/.test(await msg()), 'Check says the set is exactly as issued');
const [dlSet] = await Promise.all([page.waitForEvent('download'), page.click(PG + ' [data-act="iss-download"]')]); ok(dlSet.suggestedFilename() === 'Tower issue A.zip' && fs.readFileSync(await dlSet.path()).subarray(0, 2).toString() === 'PK', 'the set downloads as a zip: ' + dlSet.suggestedFilename());
await page.screenshot({ path: `${OUT}/issue-1-issued.png` });
// the model moves on: a new issue is B, A stays
await page.evaluate(() => { const { P, project } = window.superWindow; P.addMember(project, { app: 'markupcraft', name: 'A-101 Ground floor.pdf', bytes: new TextEncoder().encode('%PDF-1.4\n% A-101 v2\n%%EOF\n'), role: 'saved' }); });
await tab('records'); await tab('issues'); await page.check(PG + ' [data-iss-source="A-101 Ground floor.pdf"]'); await page.check(PG + ' [data-iss-source="A-102 First floor.pdf"]');
ok(await page.$$eval(PG + ' [data-iss-plan="revised"]', n => n.length) === 1 && await page.$$eval(PG + ' [data-iss-plan="unchanged"]', n => n.length) === 1, 'the next preview: one sheet revised, one unchanged');
await page.fill(PG + ' [data-iss-by]', 'Olive Architect'); await page.click(PG + ' [data-act="iss-freeze"]'); await page.waitForFunction(sel => document.querySelectorAll(sel).length === 2, PG + ' [data-iss-issue]');
ok((await page.$$eval(PG + ' [data-iss-issue]', n => n.map(x => x.getAttribute('data-iss-state')))).join() === 'current,superseded', 'B is current, A is superseded and still listed');
ok((await page.$$eval(PG + ' [data-iss-verify]', n => n.map(x => x.textContent))).every(x => /as issued/.test(x)), 'both sets still verify');

/* ---- BK.112: a site instruction against the model ---- */
await tab('records'); ok(await page.$(PG + ' [data-iss-empty="records"]') !== null, 'no records yet');
await page.click(PG + ' [data-act="iss-rec-add"]'); ok(/Say what was instructed/.test(await msg()), 'a record needs words');
const doorGuid = await page.evaluate(() => { const r = window.superRegistry; r.REG.reindex(window.superWindow.project); return r.REG.list(window.superWindow.project).find(x => /^D-101/.test(x.label)).ifc_guid; });
await page.fill(PG + ' [data-iss-rtitle]', 'Move door D-101 300 mm east'); await page.fill(PG + ' [data-iss-rcause]', 'Clash with the riser found on site'); await page.fill(PG + ' [data-iss-rguids]', doorGuid); await page.fill(PG + ' [data-iss-rsheets]', 'A-101');
await page.click(PG + ' [data-act="iss-rec-add"]'); await page.waitForSelector(PG + ' [data-iss-record="SI-001"]');
ok(/SI-001 logged against 1 objects/.test(await msg()), 'logged: ' + await msg());
const rec = await page.textContent(PG + ' [data-iss-record="SI-001"]'); ok(rec.includes('Site instruction') && rec.includes('Clash with the riser') && rec.includes('D-101'), 'the row: kind, cause, the door by its name (through the registry): ' + rec.replace(/\s+/g, ' ').slice(0, 220));
await page.selectOption(PG + ' [data-iss-rstate]', 'closed'); ok(/Saved/.test(await msg()), 'its status is changed in place');
const [dlCsv] = await Promise.all([page.waitForEvent('download'), page.click(PG + ' [data-act="iss-rec-csv"]')]); const csv = fs.readFileSync(await dlCsv.path(), 'utf8'); ok(/SI-001/.test(csv) && /Clash with the riser/.test(csv) && /Closed/.test(csv), 'the log downloads as CSV');
ok(await page.evaluate(() => [...window.superWindow.project.ext.keys()].includes('issue/rows/work_record.json')), 'the record is a row of work_record in the project file');

/* ---- BK.164: BCF in and out ---- */
const bcfFile = path.join(OUT, 'from-engineer.bcf');
fs.writeFileSync(bcfFile, await BCF.writeTopics([{ guid: '11111111-2222-4333-8444-555555555555', title: 'Door clashes <img src=x onerror="window.__pwn=1">', status: 'Open', type: 'Clash', author: 'eng@structure.example', created: '2026-11-10T08:00:00.000Z', modified: null, description: 'Move it east.',
  comments: [{ guid: 'aaaaaaaa-2222-4333-8444-555555555555', date: '2026-11-10T09:00:00.000Z', author: 'eng@structure.example', text: 'See the viewpoint.', viewpoint: null }],
  viewpoints: [{ guid: 'bbbbbbbb-2222-4333-8444-555555555555', camera: { kind: 'perspective', viewPoint: [1, 2, 3], direction: [0, 1, 0], up: [0, 0, 1], fov: 60 }, selection: [doorGuid], visibility: { defaultVisible: true, exceptions: [] }, clipping: [], snapshot: null }] }], { name: 'Tower.ifc' }));
await tab('topics'); ok(/keeps: title, status/.test(await page.textContent(PG + ' [data-iss-bcfmap]')) && /redline shapes/.test(await page.textContent(PG + ' [data-iss-bcfmap]')), 'the page says which parts of a topic a BCF file keeps and which stay');
await page.setInputFiles(PG + ' [data-iss-file="bcf"]', bcfFile); await page.waitForSelector(PG + ' [data-iss-topic]');
ok(/1 topics added, 0 updated, 1 comments/.test(await msg()), 'the BCF file came in: ' + await msg());
const topic = await page.textContent(PG + ' [data-iss-topic]'); ok(topic.includes('From BCF') && topic.includes('See the viewpoint.') && topic.includes('1 objects') && topic.includes('1 viewpoints'), 'the topic: where it came from, its comment, the door, the viewpoint');
ok(await page.evaluate(() => window.__pwn === undefined) && await page.$(PG + ' img[src="x"]') === null, 'a title that looks like markup is shown as text');
await page.fill(PG + ' [data-iss-treply]', 'Moved in revision B.'); await page.click(PG + ' [data-act="iss-top-reply"]'); await page.waitForFunction(sel => document.querySelector(sel).textContent.includes('Moved in revision B.'), PG + ' [data-iss-topic]'); ok(true, 'a reply is added to the topic');
await page.fill(PG + ' [data-iss-ttitle]', 'Stair headroom'); await page.click(PG + ' [data-act="iss-top-add"]'); await page.waitForFunction(sel => document.querySelectorAll(sel).length === 2, PG + ' [data-iss-topic]');
const [dlBcf] = await Promise.all([page.waitForEvent('download'), page.click(PG + ' [data-act="iss-bcf-out"]')]);
const back = await BCF.readTopics(new Uint8Array(fs.readFileSync(await dlBcf.path()))); ok(dlBcf.suggestedFilename() === 'Tower topics.bcf' && back.topics.length === 2 && back.topics.some(t => t.comments.some(c => c.text === 'Moved in revision B.')), 'the topics go out as a .bcf the BCF reader opens: 2 topics, the reply in it');
ok(/who it came from/.test(await page.textContent(PG + ' [data-iss-stayed]')), 'after the export the page lists what stayed in the project file');
await page.screenshot({ path: `${OUT}/issue-2-topics.png` });

/* ---- BK.71: the client's link ---- */
await tab('link'); ok(await page.$(PG + ' [data-iss-signin]') === null, 'signed in: no sign-in line');
await page.fill(PG + ' [data-iss-llabel]', 'For Mr Client'); await page.selectOption(PG + ' [data-iss-lstage]', 'design-development'); await page.click(PG + ' [data-act="iss-link-make"]'); await page.waitForSelector(PG + ' [data-iss-link]');
ok(/Link made. 2 sheets attached, 0 listed by name only/.test(await msg()), 'made: ' + await msg());
ok((await page.inputValue(PG + ' [data-iss-url]')).startsWith('https://getcadcraft.com/review?t='), 'the link is shown to copy');
const srv = server.links.get('00000001-aaaa-4bbb-8ccc-dddddddddddd'); ok(srv && srv.pack.issue.code === 'B' && srv.pack.sheets.length === 2 && srv.files.length === 2 && srv.stage === 'design-development', 'the website got the ISSUED set B: its words, its sheet list, the two PDFs');
ok(!(await page.evaluate(() => new TextDecoder().decode(window.superWindow.P.toBytes(window.superWindow.project, {})))).includes('TTTTTTTT'), 'the token is not in the project file');
srv.comments.push({ id: 'c0000001-aaaa-4bbb-8ccc-dddddddddddd', author: 'Mr Client', body: 'Can the door move?', sheet: 'A-101 Ground floor.pdf', stage: 'design-development', issue: 'B', at: Date.now() });
await page.click(PG + ' [data-act="iss-link-pull"]'); await page.waitForFunction(sel => /1 new comments are now topics/.test(document.querySelector(sel).textContent), MSG); ok(true, 'the client\'s comment came back: ' + await msg());
await tab('topics'); ok(await page.$(PG + ' [data-iss-origin="client"]') !== null && (await page.textContent(PG + ' [data-iss-origin="client"]')).includes('Can the door move?'), 'and is a topic on the project, marked From the client');
await tab('link'); await page.click(PG + ' [data-act="iss-link-revoke"]'); await page.waitForSelector(PG + ' [data-iss-link][data-iss-live="0"]'); ok(srv.revoked === true && /no longer opens/.test(await msg()), 'closing the link tells the website and says so');
ok(server.hits.filter(h => h.includes('/team/') && !h.endsWith('/team/teams')).every(h => h.endsWith('/api/v1/team/review')) && server.hits.some(h => h === 'POST /api/v1/team/review'), 'the link used only the review endpoint (the teams plug-in has its own): ' + [...new Set(server.hits)].join(', '));
await page.screenshot({ path: `${OUT}/issue-3-link.png` });

/* ---- BK.53: a copy out, merged back by choice ---- */
await tab('firms'); ok(/Not legal advice/.test(await page.textContent(PG + ' [data-iss-wording]')), 'the cross-firm part says it is record-keeping, not legal advice');
await page.click(PG + ' [data-act="iss-sendout"]'); ok(/Name the firm/.test(await msg()), 'a copy needs a firm');
await page.fill(PG + ' [data-iss-firm]', 'Bolt Engineers'); await page.check(PG + ' [data-iss-layer="building"]');
const [dlCopy] = await Promise.all([page.waitForEvent('download'), page.click(PG + ' [data-act="iss-sendout"]')]);
ok(dlCopy.suggestedFilename() === 'Tower copy for Bolt Engineers.ccproject', 'the copy downloads: ' + dlCopy.suggestedFilename());
ok((await page.textContent(PG + ' [data-iss-sendouts]')).includes('A copy is out'), 'the page lists the copy as out');
const copy = (await P.fromBytes(new Uint8Array(fs.readFileSync(await dlCopy.path())))).project;
ok(copy.members.every(m => m.app !== 'markupcraft' || /\.pdf$/.test(m.name)) && ![...copy.ext.keys()].some(k => /^(notes-tasks|communications|timer|calendar|teams|office)\//.test(k)), 'the copy carries no notes, tasks, time, mail log or office records');
P.addMember(copy, { app: 'bimcraft', name: 'Tower.ifc', bytes: new TextEncoder().encode(ifcB), role: 'saved' });
const retFile = path.join(OUT, 'returned.ccproject'); fs.writeFileSync(retFile, P.toBytes(copy, {}));
await page.setInputFiles(PG + ' [data-iss-file="return"]', retFile); await page.waitForSelector(PG + ' [data-iss-retlayer="building"]');
const cmp = await page.textContent(PG + ' [data-iss-retlayer="building"]'); ok(/1 added, 1 changed, 1 removed, 16 the same, 0 changed on both sides/.test(cmp) && /Removed by them \(still here\): W-104/.test(cmp), 'compared: ' + cmp.replace(/\s+/g, ' ').slice(0, 160));
await page.selectOption(PG + ' [data-iss-take="building"]', 'some'); await page.check(PG + ' [data-iss-obj="building"] >> nth=0');
await page.fill(PG + ' [data-iss-mby]', ''); await page.click(PG + ' [data-act="iss-merge"]'); ok(/signs the merge off/.test(await msg()), 'an unsigned merge changes nothing');
await page.fill(PG + ' [data-iss-mby]', 'Olive Architect'); await page.click(PG + ' [data-act="iss-merge"]'); await page.waitForSelector(PG + ' [data-iss-merges]');
ok(/Merged: 1 taken, 1 left/.test(await msg()), 'merged by choice: ' + await msg());
const after = await page.evaluate(({ ifcA }) => { const { P, project } = window.superWindow; const mine = project.members.find(m => m.name === 'Tower.ifc'); return { same: new TextDecoder().decode(mine.bytes) === ifcA, theirs: project.members.filter(m => /^Tower \(from Bolt Engineers/.test(m.name)).length }; }, { ifcA });
ok(after.same && after.theirs === 1, 'this project\'s model is untouched; theirs came in beside it');
ok((await page.textContent(PG + ' [data-iss-sendouts]')).includes('Merged back') && (await page.textContent(PG + ' [data-iss-merges]')).includes('Olive Architect'), 'the copy reads Merged back, and the merge is listed with who signed it');
await page.screenshot({ path: `${OUT}/issue-4-firms.png`, fullPage: false });

/* ---- BK.52: the team part ---- */
await tab('team'); const team = await page.textContent(PG + ' [data-iss-team]');
ok(/Writing/.test(team) && /\(you\)/.test(team), 'this window writes, and is in the list as you: ' + team.replace(/\s+/g, ' ').slice(0, 140));
ok(await page.$$eval(PG + ' [data-iss-live] li', n => n.length) === 4 && await page.$$eval(PG + ' [data-iss-waits] li', n => n.length) === 4 && /waits on the sync service/.test(await page.textContent(PG + ' [data-iss-waits]')), 'it says what is live today (4) and what waits on the sync service (4)');
// a second window of the same browser on the same project: the first one sees it
const page2 = await ctx.newPage(); await page2.route('**/api/account/super-connect', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: { signedIn: false } }) }));
await page2.goto(url); await page2.waitForSelector('[data-sc-ready]'); await page2.evaluate(() => window.superWindow.ready); await quiet(page2);
const created = await page.evaluate(() => window.superWindow.project.created);
await page2.evaluate(({ created }) => { const p = window.superWindow.project; p.name = 'Tower'; p.created = created; window.superWindow.home.show('home'); }, { created });
await page2.evaluate(() => window.superWindow.home.show('project-options'));
await page2.click('[data-home-project-pages] [data-hvpage="issue:issue"]'); await page2.click(PG + ' [data-iss-tab="team"]'); await page2.waitForSelector(PG + ' [data-iss-people]'); await page2.waitForTimeout(400);
await page.click(PG + ' [data-act="iss-team-check"]'); await page.waitForTimeout(300);
ok(await page.$$eval(PG + ' [data-iss-people] li', n => n.length) >= 2, 'two windows on the same project see each other: ' + (await page.textContent(PG + ' [data-iss-people]')).replace(/\s+/g, ' ').slice(0, 160));
await page2.close();
await page.screenshot({ path: `${OUT}/issue-5-team.png` });

/* ---- BK.41: the export dialog's map ---- */
await page.evaluate(() => window.superWindow.home.leave()); await page.waitForTimeout(300);
await page.evaluate(() => window.superWindow.exporter.open()); await page.waitForSelector('[data-sc-export]');
const fids = await page.$$eval('[data-sc-export] .sc-export-row[data-format]', n => n.map(r => [r.getAttribute('data-format'), r.querySelector('[data-scx-fid]')?.getAttribute('data-scx-fid'), r.querySelector('[data-scx-stays]')?.textContent || '']));
ok(fids.length === 12 /* SC.7 round 5: LandXML, DSTV and three more outputs joined the seven */ && fids.every(f => f[1] === 'full' || f[1] === 'result') && fids.every(f => f[2].includes('Stays in the project file')), 'every format of the dialog says Full or Result only and what stays behind: ' + fids.map(f => f[0] + '=' + f[1]).join(' '));
const bcfRow = fids.find(f => f[0] === 'bcf'), ifcRow = fids.find(f => f[0] === 'ifc'), pdfRow = fids.find(f => f[0] === 'pdf');
ok(bcfRow[1] === 'result' && /flatten into the viewpoint picture/.test(bcfRow[2]), 'BCF: result only, redlines flatten into the viewpoint picture');
ok(/Full when saved from/.test(ifcRow[2]) && pdfRow[1] === 'result' && /everything except the printed sheet/.test(pdfRow[2]), 'IFC says where full is proven; PDF is result only');
ok(await page.$$eval('[data-scx-all] li', n => n.length) === 11 && /\.stl \.3mf/.test(await page.textContent('[data-scx-all]')) && /\.nc1/.test(await page.textContent('[data-scx-all]')), 'the dialog lists every output, the ones it does not write too (11 rows)');
await page.screenshot({ path: `${OUT}/issue-6-exportmap.png` });
await page.click('[data-sc-export] [data-act="export-close"]');

/* ---- the docked workspace layout loads the page too ---- */
await page.goto(url + (url.includes('?') ? '&' : '?') + 'workspace=docked'); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await quiet(page); await page.waitForTimeout(600);
await page.evaluate(() => window.superWindow.home.show('home')); await page.evaluate(() => window.superWindow.home.show('project-options')); await page.click('[data-home-project-pages] [data-hvpage="issue:issue"]'); await page.waitForSelector(PG + ' [data-iss-tabs]');
ok(await page.$$eval(PG + ' [data-iss-tab]', n => n.length) === 6, 'workspace=docked: the page opens with its six parts');
ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); await close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
