// SPDX-License-Identifier: Apache-2.0
// Super: the office package in the real page (bk-r4-office-10): Quick Kits and the help entries on Home, Office standards (edit, update from the office, save back, apply), the Brief page
// (rooms, accommodation schedule), Personal information (stays out of the project), and the new-project page's Quick Kit. Standard window and ?workspace=docked.
//   node tools/super-test/office.mjs
import { start, launch, OUT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const posts = [];

async function run(layout) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }), page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
  await page.route('**/api/**', route => { const r = route.request(); if (r.method() !== 'GET' && !/super-connect/.test(r.url())) posts.push(r.method() + ' ' + r.url()); route.continue(); });   // nothing here may post to the site
  await page.goto(layout ? url + '?workspace=docked' : url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(800);
  const tag = layout ? '[docked] ' : '[standard] ';
  const PG = '[data-home-view="page"]:not([hidden])';
  const dialogs = () => page.$$eval('dialog[open]', n => n.length);
  await page.evaluate(() => window.superWindow.home.show('home')); await page.waitForTimeout(500);

  // Home: Quick Kits, the office entries, the way into the assistant
  await page.waitForSelector('[data-sco-kit]', { timeout: 8000 });
  ok((await page.$$eval('[data-sco-kit]', n => n.map(x => x.dataset.scoKit))).join() === 'field.architecture,field.interior,field.landscape,field.electrical-building', tag + 'Home lists the four Quick Kits');
  ok((await page.$$eval('[data-sco-help]', n => n.map(x => x.dataset.scoHelp))).filter(x => ['ask', 'find', 'report'].includes(x)).join() === 'ask,find,report', tag + 'Home has Ask, Find a tool and Report a problem');
  await page.evaluate(() => window.superWindow.home.show('project-options'));
  ok(await page.$('[data-home-options] [data-hvpage="office:standards"]') !== null && await page.$('[data-home-project-pages] [data-hvpage="office:brief"]') !== null && await page.$('[data-home-options] [data-hvpage="office:private"]') !== null, tag + 'the menu has Office standards, Brief and Personal information');
  await page.click('[data-sco-help="ask"]'); await page.waitForTimeout(200); ok((await page.textContent('[data-sc-status], body')).length > 0 && await dialogs() === 0, tag + 'Ask how to do something opens no dialog by itself (the Ask box is the assistant package\'s)');
  await page.click('[data-sco-help="find"]'); await page.waitForTimeout(300); ok(await dialogs() === 1, tag + 'Find a tool opens the tool search'); await page.keyboard.press('Escape'); await page.waitForTimeout(200);

  // Office standards: save the office record, then the project's copy follows when asked
  await page.click('.sc-hnav [data-hv="options"]');
  await page.click('[data-home-options] [data-hvpage="office:standards"]'); await page.waitForSelector(PG + ' [data-sco-sec="office"]');
  ok(await page.textContent(PG + ' h1') === 'Office standards' && await dialogs() === 0, tag + 'Office standards is a page of the welcome area');
  await page.fill(PG + ' [data-sco-f="office.name"]', 'Acme Architects'); await page.fill(PG + ' [data-sco-f="office.h.text"]', '2.5'); await page.fill(PG + ' [data-sco-f="office.h.dimension"]', '2');
  await page.fill(PG + ' [data-sco-f="office.layers"]', 'A-WALL | #ff0000 | walls'); await page.selectOption(PG + ' [data-sco-f="office.p.group"]', 'level');
  await page.click(PG + ' [data-sco-act="save-office"]'); await page.waitForSelector(PG + ' [data-sco-msg]:not(:empty)');
  ok(/saved as version 1/.test(await page.textContent(PG + ' [data-sco-msg]')), tag + 'saving says version 1: ' + await page.textContent(PG + ' [data-sco-msg]'));
  ok(await page.$eval(PG + ' [data-sco-f="office.h.text"]', n => n.value) === '2.5', tag + 'the record comes back as saved');
  // the account file holds it, the project does not yet
  ok(await page.evaluate(() => (localStorage.getItem('cc-super-acct:rows/acct_office_standard.json') || '').includes('Acme Architects')), tag + 'the office record is in the account file on this device');
  await page.click(PG + ' [data-sco-act="update"]'); await page.waitForSelector(PG + ' .sco-confirm');
  const lines = await page.$$eval(PG + ' .sco-confirm li', n => n.map(x => x.textContent)); ok(lines.length >= 3 && lines.some(l => /Paper heights/.test(l) && /2\.5/.test(l)), tag + 'update asks first and lists what changes (' + lines.length + ' lines)');
  ok(await page.evaluate(async () => { const m = await import('/assets/apps/supercadcraft/dev/plugins/office/ops.js'); return true; }) && !(await page.evaluate(() => window.superWindow.project.ext && [...window.superWindow.project.ext.keys()].some(k => /proj_office_standard/.test(k)))), tag + 'nothing was written to the project before the answer');
  await page.click(PG + ' [data-sco-act="confirm-do"]'); await page.waitForTimeout(400);
  ok(/Copied from Acme Architects, version 1/.test(await page.textContent(PG + ' [data-sco-sec="project"]')), tag + 'the project now says where its copy came from');
  await page.fill(PG + ' [data-sco-f="project.h.text"]', '3'); await page.click(PG + ' [data-sco-act="save-project"]'); await page.waitForTimeout(300);
  await page.click(PG + ' [data-sco-act="back"]'); await page.waitForSelector(PG + ' .sco-confirm'); ok(/version 2/.test(await page.textContent(PG + ' .sco-confirm b')), tag + 'save back asks and names version 2');
  await page.click(PG + ' [data-sco-act="confirm-no"]'); await page.waitForTimeout(150); ok(await page.$(PG + ' .sco-confirm') === null && /version 1/.test(await page.textContent(PG + ' [data-sco-sec="office"] .sco-note')), tag + '"Not now" changes nothing');
  await page.click(PG + ' [data-sco-act="back"]'); await page.click(PG + ' [data-sco-act="confirm-do"]'); await page.waitForTimeout(300); ok(/version 2/.test(await page.textContent(PG + ' [data-sco-sec="office"] .sco-note')), tag + 'saved back: the office is at version 2');
  await page.click(PG + ' [data-sco-act="apply"]'); await page.waitForSelector(PG + ' .sco-confirm'); ok((await page.$$eval(PG + ' .sco-confirm li', n => n.length)) >= 2, tag + 'Apply to the apps asks and lists the policy values');
  ok(await page.evaluate(() => localStorage.getItem('cc-default-policies')) === null, tag + 'nothing is applied before the answer');
  await page.click(PG + ' [data-sco-act="confirm-do"]'); await page.waitForTimeout(500);
  const pol = await page.evaluate(() => JSON.parse(localStorage.getItem('cc-default-policies') || '{}').policies || {}); ok(pol['all.anno.text'] === 3 && pol['all.anno.dimension'] === 2 && pol['all.schedule.group'] === 'level', tag + 'the apps\' Default Policies now hold the project\'s values ' + JSON.stringify(pol));
  await page.screenshot({ path: `${OUT}/office-1-standards${layout ? '-docked' : ''}.png` });

  // Brief
  await page.evaluate(() => window.superWindow.home.show('project-options'));
  await page.click('[data-home-project-pages] [data-hvpage="office:brief"]'); await page.waitForSelector(PG + ' [data-sco-sec="rooms"]');
  await page.fill(PG + ' [data-sco-b="client_brief"]', 'A house for two.'); await page.dispatchEvent(PG + ' [data-sco-b="client_brief"]', 'change'); await page.waitForTimeout(300);
  await page.fill(PG + ' [data-sco-paste]', 'Bedroom, 3, 12\nKitchen, 1, 15\nLiving, 1, 30'); await page.click(PG + ' [data-sco-act="room-paste"]'); await page.waitForSelector(PG + ' [data-sco-roomrow]');
  ok((await page.$$(PG + ' [data-sco-roomrow]')).length === 3, tag + 'three rooms from the pasted list');
  ok(/5 rooms, 81 m² net, about 101\.25 m² gross at 80% usable/.test(await page.textContent(PG + ' [data-sco-totals]')), tag + 'totals by hand: 81 net, 101.25 gross: ' + await page.textContent(PG + ' [data-sco-totals]'));
  ok((await page.$$eval(PG + ' [data-sco-accrow]', n => n.map(x => x.dataset.status))).join() === 'not-drawn,not-drawn,not-drawn' && await page.$(PG + ' [data-sco-nodrawn]') !== null, tag + 'before any wall every room reads Not drawn yet');
  await page.fill(PG + ' [data-sco-new="name"]', 'Hall'); await page.fill(PG + ' [data-sco-new="area"]', '9'); await page.click(PG + ' [data-sco-act="room-add"]'); await page.waitForTimeout(300); ok((await page.$$(PG + ' [data-sco-roomrow]')).length === 4, tag + 'a room added by hand');
  await page.fill(PG + ' [data-sco-b="site_address"]', '1 Long Road'); await page.dispatchEvent(PG + ' [data-sco-b="site_address"]', 'change'); await page.waitForTimeout(300);
  // the schedule reads the drawn areas of BimCraft: a stand-in for the mounted app's space schedule
  await page.evaluate(() => { window.bimcraftQto = { spaces: () => ({ rows: [{ name: 'Bedroom 1', area: 11.5 }, { name: 'Bedroom 2', area: 12.5 }, { name: 'Bedroom 3', area: 12 }, { name: 'Kitchen', area: 13 }, { name: 'Study', area: 8 }] }) }; });
  await page.click(PG + ' [data-sco-act="schedule-refresh"]'); await page.waitForTimeout(400);
  const st = await page.$$eval(PG + ' [data-sco-accrow]', n => n.map(x => x.dataset.status)); ok(st.join() === 'within,under,not-drawn,not-drawn', tag + 'accommodation schedule as the drawn areas arrive: ' + st.join());
  ok(/Study/.test(await page.textContent(PG + ' [data-sco-extra]')), tag + 'a drawn room the brief lacks is named'); await page.screenshot({ path: `${OUT}/office-2-brief${layout ? '-docked' : ''}.png` });
  // Home shows the client and the site
  await page.click('.sc-hnav [data-hv="home"]'); await page.waitForTimeout(500);

  // Personal information: out of the project
  await page.click('.sc-hnav [data-hv="options"]');
  await page.click('[data-home-options] [data-hvpage="office:private"]'); await page.waitForSelector(PG + ' [data-sco-sec="add"]');
  ok(/Privacy law differs by country/.test(await page.textContent(PG + ' [data-sco-law]')), tag + 'the page says privacy law differs by country');
  await page.selectOption(PG + ' [data-sco-a="kind"]', 'title-deed'); await page.fill(PG + ' [data-sco-a="label"]', 'Deed erf 12'); await page.fill(PG + ' [data-sco-a="value"]', 'SECRETVALUE-9931'); await page.fill(PG + ' [data-sco-a="fileref"]', 'Firm system folder 12');
  await page.click(PG + ' [data-sco-act="add"]'); await page.waitForSelector(PG + ' [data-sco-rec]'); await page.click(PG + ' [data-sco-act="link"]'); await page.waitForTimeout(300);
  ok(/1 Title deed is kept in your account/.test(await page.textContent(PG + ' [data-sco-kept]')), tag + 'the project says one title deed is kept in the account');
  const where = await page.evaluate(async () => {
    const P = await import('/assets/apps/supercadcraft/dev/super-project.js'), pr = window.superWindow.project;
    const proj = P.extList(pr, 'office').map(f => new TextDecoder().decode(P.extGet(pr, 'office', f.path || f))).join('\n');
    const pf = P.projectFiles(pr, {}), files = (Array.isArray(pf) ? pf : pf.files).map(f => (f.bytes ? new TextDecoder().decode(f.bytes.slice(0, 400000)) : '')).join('\n');
    const acct = Object.keys(localStorage).filter(k => k.startsWith('cc-super-acct:')).map(k => localStorage.getItem(k)).join('\n');
    return { proj: proj.includes('SECRETVALUE-9931') || proj.includes('Deed erf'), files: files.includes('SECRETVALUE-9931'), acct: acct.includes('SECRETVALUE-9931'), ref: proj.includes('"admin_id"') };
  });
  ok(where.acct && !where.proj && !where.files && where.ref, tag + 'the value is in the account file only; the project (and its save) holds a reference id: ' + JSON.stringify(where));
  await page.screenshot({ path: `${OUT}/office-3-private${layout ? '-docked' : ''}.png` });

  // New project: the Quick Kit pick
  await page.click('.sc-hnav [data-hv="home"]'); await page.click('[data-home-act="new"]'); await page.waitForSelector('[data-np-kit]', { timeout: 8000 });
  ok((await page.$$eval('[data-np-kit] option', n => n.length)) === 5, tag + 'the new-project page offers No kit and the four kits');
  await page.fill('[data-np-name]', 'Kit test house'); await page.selectOption('[data-np-kit]', 'field.architecture'); await page.click('[data-act="np-create"]'); await page.waitForTimeout(1500);
  const kit = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cc-fields:super') || '{}').installed || []; } catch { return []; } });
  ok(kit.some(k => k.id === 'field.architecture'), tag + 'creating the project with Architecture installed the kit: ' + JSON.stringify(kit));
  const std = await page.evaluate(async () => { const P = await import('/assets/apps/supercadcraft/dev/super-project.js'), pr = window.superWindow.project; return P.extList(pr, 'office').map(f => f.path || f).join(); });
  ok(/proj_office_standard/.test(std), tag + 'the new project took the office standard (' + std + ')');
  ok(errors.length === 0, tag + 'no page errors: ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}
await run(false); await run(true);
ok(posts.length === 0, 'nothing was posted to the site: ' + posts.join(', '));
await browser.close(); close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
