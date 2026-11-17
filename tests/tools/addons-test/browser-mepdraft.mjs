#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-mepdraft.mjs — the MEP drafting add-on in /lab/cadcraft (0.9.1, suggestion 1493), headless: bundled and off, added,
 * then a small heating plan drawn by typing at the real command line — two radiators, a flow and a return run that snap onto
 * their connection points, ball valves cut into the flow run, a size tag, a flow arrow, the legend and the schedule — one
 * valve erased with ERASE (the run heals), DXFOUT, and the layers and blocks read back from the downloaded DXF. A second
 * drawing shows double-line pipes and ducts. Run as root (session minted by tools/addons-test/admin.php).
 *
 *   node tools/addons-test/browser-mepdraft.mjs [--shots dir]     (shots default: tmp/shots/mepdraft)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/mepdraft'));
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript(() => { try { localStorage.setItem('cc-newhere', 'skipped'); } catch { /* */ } });   // the "I'm new" offer would cover the command box
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s, wait = 200) => { await page.click('[data-cmd-input]'); if (s) await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(wait); };
const typeAll = async (...list) => { for (const s of list) await typeCmd(s); };
const history = () => page.$$eval('.cc-history li', (ls) => ls.map((l) => l.textContent));
/** What the drawing holds, by this add-on's record (read through the add-on API's own decoder). */
const snap = () => page.evaluate(() => {
  const d = window.cadcraft.doc, k = window.ccAddons.kinds, rec = (e) => { try { return e.xd ? k.getData('mepdraft', e) : null; } catch { return null; } };
  const all = d.all().map((e) => ({ e, r: rec(e) })).filter((x) => x.r);
  return {
    n: d.all().length,
    cl: all.filter((x) => x.r.role === 'cl').map((x) => ({ layer: x.e.layer, pts: x.e.pts.map((p) => [p.x, p.y]), size: x.r.size, svc: x.r.svc })),
    edges: all.filter((x) => x.r.role === 'edge').map((x) => ({ layer: x.e.layer, w: x.r.w })),
    syms: all.filter((x) => x.r.role === 'sym').map((x) => ({ id: x.e.id, block: x.e.block, x: x.e.x, y: x.e.y, rot: x.e.rot, sx: x.e.sx, layer: x.e.layer, attrs: x.e.attrs, sym: x.r.sym })),
    equip: all.filter((x) => x.r.role === 'equip').map((x) => ({ block: x.e.block, x: x.e.x, y: x.e.y, layer: x.e.layer, attrs: x.e.attrs })),
    tags: all.filter((x) => x.r.role === 'tag').map((x) => ({ s: x.e.s, layer: x.e.layer })),
    flows: all.filter((x) => x.r.role === 'flow').length,
    blocks: [...d.blocks.keys()], layers: [...d.layers.values()].map((l) => ({ name: l.name, color: l.color, linetype: l.linetype })),
    undo: d.undoStack.length,
  };
});
const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;
const fresh = async () => {
  await page.evaluate(() => { localStorage.setItem('cadcraft.tour', 'skipped'); });
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'mepdraft' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
};

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:mepdraft:')) localStorage.removeItem(k);
    const k = 'cc-addons:cadcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); delete s.mepdraft; if (s.on) delete s.on.mepdraft; if (s.off) delete s.off.mepdraft; localStorage.setItem(k, JSON.stringify(s));
    const st = JSON.parse(localStorage.getItem('cadcraft.settings') || '{}'); st.typedCoords = 'absolute'; localStorage.setItem('cadcraft.settings', JSON.stringify(st));
  });
  await fresh();
  console.log('\n== the add-on');
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'mepdraft'));
  ok(me && me.state === 'off' && me.source === 'bundled' && me.name === 'MEP drafting', 'MEP drafting is in the add-on list, bundled, and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason, detail: me.detail }));
  await typeCmd('MEPPIPE');
  ok((await history()).some((l) => /Unknown command/i.test(l)), 'before it is added MEPPIPE is not a command');
  await page.evaluate(() => window.ccAddons.loader.setEnabled('mepdraft', true));
  await page.waitForTimeout(700);
  me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'mepdraft'));
  ok(me?.state === 'active', 'added: active', JSON.stringify(me && [me.state, me.reason, me.detail]));
  const ui = await page.evaluate(() => { const s = document.querySelector('[data-addon-section="mepdraft:mepdraft"]'); return { cmds: s ? s.querySelectorAll('[data-mep-cmd]').length : -1, syms: s ? s.querySelectorAll('[data-mep-sym]').length : -1, eq: s ? s.querySelectorAll('[data-mep-eq]').length : -1 }; });
  ok(ui.cmds === 12 && ui.syms === 26 && ui.eq === 10, 'its panel section has the 12 commands, 26 symbols and 10 kinds of equipment as buttons', JSON.stringify(ui));

  console.log('\n== a small heating plan');
  await typeAll('MEPSCALE', '50');
  ok((await history()).some((l) => /Scale 1:50: symbols are 300 long and tag text 125 high/.test(l)), 'MEPSCALE 50: symbols 300 long, text 125 high');
  await typeAll('MEPEQUIP', 'radiator', 'Z', '1400', '2000,4000', '7000,4000', '');
  let s = await snap();
  ok(s.equip.length === 2 && s.equip.every((e) => e.block === 'MEP_EQ_RADIATOR_1400X100' && e.layer === 'M-EQPM') && s.equip.map((e) => e.attrs.TAG).join() === 'RAD-01,RAD-02', 'two 1400 radiators, RAD-01 and RAD-02, on M-EQPM', JSON.stringify(s.equip));
  // flow main, then a branch up to each radiator's left connection point (x − 760, y + 50)
  await typeAll('MEPSERVICE', 'HF');
  await typeAll('MEPPIPE', 'Z', 'DN20', '0,2500', '9000,2500', '');
  await typeAll('MEPPIPE', '1240,2500', '1250,4040');            // ends near the port → snaps and finishes
  await typeAll('MEPPIPE', '6240,2500', '6230,4060');
  // return main and branches to the right connection points (x + 760)
  await typeAll('MEPPIPE', 'S', 'HR', '0,2000', '9000,2000', '');
  await typeAll('MEPPIPE', '2760,2000', '2760,4050');
  await typeAll('MEPPIPE', '7760,2000', '7770,4045');
  s = await snap();
  const flow = s.cl.filter((r) => r.layer === 'M-HEAT-FLOW'), ret = s.cl.filter((r) => r.layer === 'M-HEAT-RETN');
  ok(flow.length === 3 && ret.length === 3 && flow.every((r) => r.size === 'DN20' && r.svc === 'HF'), 'a flow main with two branches on M-HEAT-FLOW and the same on M-HEAT-RETN', JSON.stringify(s.cl.map((r) => r.layer)));
  ok(flow.some((r) => near(r.pts[0][0], 1240) && near(r.pts[0][1], 2500) && near(r.pts[1][0], 1240) && near(r.pts[1][1], 4050)) && ret.some((r) => near(r.pts[1][0], 7760) && near(r.pts[1][1], 4050)), 'the branches start on the main and end exactly on the radiators\' connection points', JSON.stringify(flow.map((r) => r.pts)));
  const lay = (n) => s.layers.find((l) => l.name === n);
  ok(lay('M-HEAT-FLOW')?.color === 1 && lay('M-HEAT-FLOW')?.linetype === 'Continuous' && lay('M-HEAT-RETN')?.color === 5 && lay('M-HEAT-RETN')?.linetype === 'DASHED', 'the service layers were made with their colours and linetypes');

  await typeAll('MEPSYM', 'ball', '1240,3300', '6240,3300', '4000,2500', 'S', 'balancing', '2760,3300', '7760,3300', 'S', 'pump', '500,2500', '');
  s = await snap();
  const balls = s.syms.filter((x) => x.sym === 'ball');
  ok(balls.length === 3 && balls.map((x) => x.attrs.TAG).join() === 'V-01,V-02,V-03' && balls.every((x) => x.block === 'MEP_SYM_BALL' && x.layer === 'M-HEAT-FLOW' && near(x.sx, 300) && x.attrs.SIZE === 'DN20' && x.attrs.SERVICE === 'HF'), 'three ball valves V-01 to V-03 on the flow layer, with size and service', JSON.stringify(balls.map((x) => x.attrs)));
  ok(balls.filter((x) => near(Math.abs(Math.sin(x.rot)), 1)).length === 2 && balls.filter((x) => near(Math.sin(x.rot), 0)).length === 1, 'the two on the risers are turned 90°, the one on the main lies along it');
  ok(s.cl.filter((r) => r.layer === 'M-HEAT-FLOW').length === 3 + 4 && s.syms.filter((x) => x.sym === 'balancing' && x.layer === 'M-HEAT-RETN').length === 2 && s.syms.some((x) => x.sym === 'pump' && x.attrs.TAG === 'P-01'), 'each cut the line it sits on (3 runs became 7 pieces); balancing valves on the return, a pump P-01 on the flow');
  const cutAt = s.cl.filter((r) => r.layer === 'M-HEAT-FLOW').flatMap((r) => [r.pts[0], r.pts[r.pts.length - 1]]).filter((p) => near(p[1], 2500) && (near(p[0], 3850) || near(p[0], 4150)));
  ok(cutAt.length === 2, 'the main is broken from 3850 to 4150 around the valve at 4000');

  await typeAll('MEPSIZETAG', '2000,2500', '5000,2000', '');
  await typeAll('MEPFLOW', '3000,2500', 'F', '3000,2000', '');
  s = await snap();
  ok(s.tags.map((x) => x.s).sort().join() === 'DN20 HF,DN20 HR' && s.flows === 2 && s.blocks.includes('MEP_FLOW_ARROW'), 'size tags "DN20 HF" and "DN20 HR", and two flow arrows');
  await typeAll('MEPSCHED', '10500,4500');
  await typeAll('MEPLEGEND', '10500,2600');
  const tb = await page.evaluate(() => { const d = window.cadcraft.doc, t = (n) => (d.blocks.get(n)?.entities || []).filter((e) => e.type === 'text').map((e) => e.s); return { sched: t('MEP_SCHEDULE'), legend: t('MEP_LEGEND'), refs: d.all().filter((e) => e.block === 'MEP_SCHEDULE' || e.block === 'MEP_LEGEND').map((e) => e.layer) }; });
  const row = (name) => { const i = tb.sched.indexOf(name); return tb.sched.slice(i, i + 4).join('|'); };
  ok(row('Ball valve') === 'Ball valve|DN20|HF|3' && row('Balancing valve') === 'Balancing valve|DN20|HR|2' && row('Radiator') === 'Radiator|1400x100|HF|2' && row('Pump') === 'Pump|DN20|HF|1', 'MEPSCHED: Ball valve DN20 HF 3, Balancing valve DN20 HR 2, Radiator 1400x100 HF 2, Pump DN20 HF 1', tb.sched.join(' | '));
  ok(tb.legend[0] === 'Legend' && ['HF  Heating flow', 'HR  Heating return', 'Ball valve', 'Balancing valve', 'Pump', 'Radiator'].every((x) => tb.legend.includes(x)) && tb.legend.length === 7 && tb.refs.join() === 'M-ANNO,M-ANNO', 'MEPLEGEND: the two services, three symbols and the radiator, nothing else', tb.legend.join(' | '));
  await typeAll('ZOOM', 'E');
  await page.waitForTimeout(500);
  await shot('mepdraft-01-heating-plan');
  const box = await page.evaluate(() => { const c = document.querySelector('[data-cadcraft] canvas'); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  await page.screenshot({ path: path.join(SHOTS, 'mepdraft-01-heating-plan-canvas.png'), clip: box });
  // close-up of a riser valve and a radiator
  await typeAll('ZOOM', 'W', '500,2200', '3600,4600');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, 'mepdraft-02-close-up.png'), clip: box });

  console.log('\n== erase a valve with ERASE: the run heals; undo');
  const before = (await snap()).cl.filter((r) => r.layer === 'M-HEAT-FLOW').length;
  const v3 = (await snap()).syms.find((x) => x.attrs?.TAG === 'V-03');
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), v3.id);
  await typeCmd('ERASE', 400);
  s = await snap();
  ok(!s.syms.some((x) => x.attrs?.TAG === 'V-03') && s.cl.filter((r) => r.layer === 'M-HEAT-FLOW').length === before - 1, 'ERASE on V-03: the valve is gone and the two pieces of the main are one again', String(s.cl.filter((r) => r.layer === 'M-HEAT-FLOW').length) + ' vs ' + before);
  await typeCmd('U', 400);
  s = await snap();
  ok(s.syms.some((x) => x.attrs?.TAG === 'V-03') && s.cl.filter((r) => r.layer === 'M-HEAT-FLOW').length === before, 'one undo brings the valve and its break back');

  console.log('\n== DXF');
  await page.keyboard.press('Escape');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), typeCmd('DXFOUT', 600)]);
  const file = path.join(SHOTS, 'mepdraft-heating-plan.dxf');
  await dl.saveAs(file);
  const dxf = fs.readFileSync(file, 'latin1').split(/\r?\n/).map((l) => l.trim());
  const sectionOf = (name) => { const i = dxf.findIndex((l, k) => l === name && dxf[k - 1] === '2' && dxf[k - 2] === 'SECTION'); const j = dxf.indexOf('ENDSEC', i); return dxf.slice(i, j); };
  const pairs = (lines) => { const out = []; for (let i = 0; i + 1 < lines.length; i += 2) out.push([lines[i], lines[i + 1]]); return out; };
  const tables = sectionOf('TABLES'), blocksSec = sectionOf('BLOCKS'), ents = sectionOf('ENTITIES');
  const layerNames = [], ltOf = {}, colOf = {};
  { const p = pairs(tables.slice(1)); for (let i = 0; i < p.length; i++) if (p[i][0] === '0' && p[i][1] === 'LAYER') { let n = null; for (let j = i + 1; j < p.length && p[j][0] !== '0'; j++) { if (p[j][0] === '2') { n = p[j][1]; layerNames.push(n); } if (p[j][0] === '6') ltOf[n] = p[j][1]; if (p[j][0] === '62') colOf[n] = Number(p[j][1]); } } }
  ok(/\.dxf$/i.test(dl.suggestedFilename()) && ['M-HEAT-FLOW', 'M-HEAT-RETN', 'M-EQPM', 'M-ANNO'].every((n) => layerNames.includes(n)), 'DXFOUT downloads a DXF with the layers M-HEAT-FLOW, M-HEAT-RETN, M-EQPM and M-ANNO', layerNames.join(' '));
  ok(ltOf['M-HEAT-RETN'] === 'DASHED' && colOf['M-HEAT-FLOW'] === 1 && colOf['M-HEAT-RETN'] === 5, 'the return layer is DASHED, colours 1 and 5', JSON.stringify([ltOf['M-HEAT-RETN'], colOf['M-HEAT-FLOW'], colOf['M-HEAT-RETN']]));
  const blockNames = []; { const p = pairs(blocksSec.slice(1)); for (let i = 0; i < p.length; i++) if (p[i][0] === '0' && p[i][1] === 'BLOCK') for (let j = i + 1; j < p.length && p[j][0] !== '0'; j++) if (p[j][0] === '2') blockNames.push(p[j][1]); }
  ok(['MEP_SYM_BALL', 'MEP_SYM_BALANCING', 'MEP_SYM_PUMP', 'MEP_EQ_RADIATOR_1400X100', 'MEP_FLOW_ARROW', 'MEP_LEGEND', 'MEP_SCHEDULE'].every((n) => blockNames.includes(n)), 'the BLOCKS section holds the symbol, radiator, arrow, legend and schedule blocks', blockNames.join(' '));
  const recs = []; { const p = pairs(ents.slice(1)); let cur = null; for (const [c, v] of p) { if (c === '0') { cur = { type: v }; recs.push(cur); } else if (cur) { if (c === '8') cur.layer = v; if (c === '2' && cur.type === 'INSERT') cur.block = v; if (c === '2' && cur.type === 'ATTRIB') cur.tag = v; if (c === '1') cur.text = v; } } }
  const ins = recs.filter((r) => r.type === 'INSERT');
  ok(ins.filter((r) => r.block === 'MEP_SYM_BALL' && r.layer === 'M-HEAT-FLOW').length === 3 && ins.filter((r) => r.block === 'MEP_SYM_BALANCING' && r.layer === 'M-HEAT-RETN').length === 2 && ins.filter((r) => r.block === 'MEP_EQ_RADIATOR_1400X100' && r.layer === 'M-EQPM').length === 2, 'the references are on the service layers: 3 ball valves on flow, 2 balancing valves on return, 2 radiators');
  ok(recs.filter((r) => r.type === 'POLYLINE' && r.layer === 'M-HEAT-FLOW').length === 7 && recs.filter((r) => r.type === 'POLYLINE' && r.layer === 'M-HEAT-RETN').length === 5, 'the runs are plain polylines: 7 pieces on flow (3 runs, 4 cuts), 5 on return (3 runs, 2 cuts)', JSON.stringify([recs.filter((r) => r.type === 'POLYLINE' && r.layer === 'M-HEAT-FLOW').length, recs.filter((r) => r.type === 'POLYLINE' && r.layer === 'M-HEAT-RETN').length]));
  const att = recs.filter((r) => r.type === 'ATTRIB');
  ok(['V-01', 'V-02', 'V-03', 'BV-01', 'BV-02', 'P-01', 'RAD-01', 'RAD-02'].every((x) => att.some((a) => a.tag === 'TAG' && a.text === x)) && att.some((a) => a.tag === 'SIZE' && a.text === 'DN20') && att.some((a) => a.tag === 'SERVICE' && a.text === 'HR'), 'the tags are real attributes in the file: V-01…V-03, BV-01, BV-02, P-01, RAD-01, RAD-02, with SIZE and SERVICE');

  console.log('\n== double-line pipes and ducts');
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('CLEAR', () => { for (const e of d.all()) d.remove(e.id); }); });
  await typeAll('MEPSERVICE', 'CHF');
  await typeAll('MEPPIPE', 'L', 'D', 'Z', 'DN100', '0,0', '4000,0', '4000,2500', '');
  await typeAll('MEPSYM', 'butterfly', '1500,0', 'S', 'strainer', '2800,0', 'S', 'gauge', '600,0', '');
  await typeAll('MEPDUCT', 'K', 'R', 'E', 'R', 'Z', '500x300', '0,5000', '5000,5000', '5000,8000', '');
  await typeAll('MEPDUCT', 'Z', '300x200', '2500,7000', '2500,5000');
  await typeAll('MEPDUCT', 'E', 'M', 'Z', '400x300', '7000,8000', '7000,5000', '9500,5000', '');
  await typeAll('MEPSYM', 'damper', '1200,5000', 'S', 'firedamper', '3800,5000', 'S', 'attenuator', '7000,6600', 'S', 'flexconn', '8300,5000', 'S', 'accessdoor', '500,5000', '');
  await typeAll('MEPDUCT', 'K', 'F', 'Z', '250', '5000,8000', '5000,9500', '');
  await typeAll('MEPDUCT', 'K', 'R', 'E', 'R', '');
  await typeAll('MEPEQUIP', 'diffuser', '5000,10000', 'K', 'ahu', '-2500,5000', 'K', 'fancoil', '11500,5000', 'K', 'boiler', '7000,1000', 'K', 'tank', '9000,1000', 'K', 'exchanger', '10500,1000', 'K', 'grille', '9500,8000', '');
  await typeAll('MEPSIZETAG', '2000,5000', '500,0', '');
  await typeAll('MEPPIPE', 'L', 'S', '');
  s = await snap();
  ok(s.edges.filter((e) => e.layer === 'M-CHW-FLOW').length >= 4 && near(s.edges.find((e) => e.layer === 'M-CHW-FLOW').w * 2, 114.3) && s.syms.find((x) => x.sym === 'butterfly') && near(s.syms.find((x) => x.sym === 'butterfly').sx, 342.9, 1e-6), 'a double-line DN100 pipe 114.3 wide; the butterfly valve on it is 3 × 114.3 long');
  ok(s.syms.find((x) => x.sym === 'firedamper')?.attrs.TAG === 'FD-01' && near(s.syms.find((x) => x.sym === 'firedamper').sx, 500) && near(s.syms.find((x) => x.sym === 'attenuator').sx, 400) && s.equip.length === 7, 'duct symbols take the duct\'s width (500, 400); seven kinds of equipment placed', JSON.stringify(s.syms.map((x) => [x.sym, x.sx])));
  await typeAll('ZOOM', 'E');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, 'mepdraft-03-double-line.png'), clip: box });
  await typeAll('ZOOM', 'W', '-500,4200', '5800,8600');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, 'mepdraft-04-duct-close-up.png'), clip: box });
  await typeAll('ZOOM', 'W', '-300,-700', '4600,1000');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, 'mepdraft-05-pipe-close-up.png'), clip: box });

  console.log('\n== every symbol and equipment, for looking at');
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('CLEAR', () => { for (const e of d.all()) d.remove(e.id); }); });
  await typeAll('MEPSERVICE', 'HF');
  const pipeSyms = ['gate', 'globe', 'ball', 'butterfly', 'check', 'balancing', 'control', 'safety', 'prv', 'strainer', 'pump', 'flowmeter', 'thermometer', 'gauge', 'expansion', 'airvent', 'drain', 'union', 'flange', 'reducer', 'cap'];
  for (let r = 0; r < 3; r++) {
    await typeAll('MEPPIPE', 'Z', 'DN25', `0,${-r * 1400}`, `7200,${-r * 1400}`, '');
    await typeCmd('MEPSYM'); await typeCmd(pipeSyms[r * 7]); await typeCmd(`${600},${-r * 1400}`);
    for (let i = 1; i < 7; i++) { await typeCmd('S'); await typeCmd(pipeSyms[r * 7 + i]); await typeCmd(`${600 + i * 1000},${-r * 1400}`); }
    await typeCmd('');
  }
  s = await snap();
  ok(s.syms.length === 21 && new Set(s.syms.map((x) => x.sym)).size === 21, 'all 21 pipe symbols placed on single-line runs', String(s.syms.length));
  await typeAll('ZOOM', 'E');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, 'mepdraft-06-pipe-symbols.png'), clip: box });
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot('mepdraft-error').catch(() => {});
}
const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
