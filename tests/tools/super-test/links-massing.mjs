// SPDX-License-Identifier: Apache-2.0
// Super 0.1 BK.133 in a real browser (session bk-r4-links-10): the small house as ONE push/pull solid (10 x 7 m pulled 3 m) made with ModelCraft's own kernel in the
// Model view; "Send the massing to the model" hands it to the BIM view as a mass linked to its solid; BimCraft's own Develop turns the mass into 4 walls and a
// floor slab; Super links each back to the solid, the Massing tab says Developed with 5 elements, and picking the solid's row relates the walls.
//   node tools/super-test/links-massing.mjs
import { start, launch, OUT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(800);
await page.evaluate(() => window.superWindow.home.leave()); await page.waitForTimeout(300);
const D = '[data-sclink-dialog]';
// the Model view (ModelCraft, in its own frame): one solid made with its kernel
await page.evaluate(() => { const sw = window.superWindow; sw.M.showPanel(sw.state, 'model'); sw.M.setActiveTab(sw.state, 'model'); sw.render(); });
const frameOf = async () => { for (const f of page.frames()) { if (await f.evaluate(() => !!(window.modelcraft && window.modelcraft.model)).catch(() => false)) return f; } return null; };
let mf = null; for (let i = 0; i < 120 && !mf; i++) { mf = await frameOf(); if (!mf) await page.waitForTimeout(500); }
ok(!!mf, 'the Model view is up (ModelCraft in its frame)');
const iid = mf ? await mf.evaluate(async () => {
  const M = await import('/assets/apps/modelcraft/dev/model.js'), model = window.modelcraft.model;
  const id = model.change('Small house', mm => {
    const d = mm.root, b = new Set(d.faces.keys());
    M.addPolygon(d, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 10, 7)); M.pushPull(d, [...d.faces.keys()].find(x => !b.has(x)), 3);
    const mine = [...d.faces.keys()].filter(x => !b.has(x));
    return mm.makeGroup(d, M.connected(d, [{ t: 'f', id: mine[0] }]), 'group', 'Small house');
  });
  try { window.modelcraft.afterHistory(); } catch { /* the view redraws on its own */ }
  return String(id);
}) : null;
ok(!!iid, 'a 10 x 7 m solid pulled 3 m, grouped as "Small house" (' + iid + ')');
await page.click('[data-act="links"]'); await page.waitForSelector(D + '[open]'); await page.click(D + ' [data-sclink-tab="massing"]');
await page.click(D + ' [data-sclink-massing]');
await page.waitForFunction(() => Object.values(window.superWindow.links.store().all('sc_massing')).length === 1, null, { timeout: 120000 }).catch(() => {});
const row0 = await page.evaluate(() => Object.values(window.superWindow.links.store().all('sc_massing'))[0] || null);
ok(row0 && row0.state === 'mass' && row0.solid_id === iid && row0.floors === 1 && row0.footprint === 70 && row0.gross === 70 && row0.volume === 210 && /^[0-9A-Za-z_$]{22}$/.test(row0.mass_guid), 'sc_massing: the solid as a mass, 1 floor, 70 m2, 70 m2 gross, 210 m3, with the mass\'s GlobalId: ' + JSON.stringify(row0 && [row0.state, row0.floors, row0.footprint, row0.gross, row0.volume]));
const l0 = await page.evaluate(() => window.superWindow.project.links.filter(l => l.kind === 'massing').map(l => [l.role, l.from.app, l.from.id, l.to.app, l.to.id]));
ok(l0.length === 1 && l0[0][0] === 'massing-of' && l0[0][1] === 'modelcraft' && l0[0][2] === iid && l0[0][4] === (row0 && row0.mass_guid), 'the link: the solid is the massing-of the mass in the BIM view: ' + JSON.stringify(l0));
ok(await page.evaluate(() => window.superWindow.project.members.map(m => m.app + ':' + m.name).join()).then(s => /bimcraft:.*-massing\.ifc/.test(s)), 'the massing file is a member of the project');
const cells = await page.$$eval(D + ' [data-sclink-masses] tr[data-sclink-mass] td', n => n.map(x => x.textContent.trim()));
ok(cells.join('|') === 'Small house|Mass|1|70|70|210|0', 'the Massing tab lists it: Small house, Mass, 1 floor, 70, 70, 210, 0 elements: ' + cells.join('|'));
// wait for the baseline reading of the model that holds the mass, then Develop with BimCraft's own op (what its Develop button runs)
await page.waitForFunction(g => { try { return [...window.bimcraftColor.index().values('guid').values()].includes(g); } catch { return false; } }, row0.mass_guid, { timeout: 60000 });
await page.evaluate(() => window.superWindow.syncQuantities(true)); await page.waitForTimeout(2500);
const dev = await page.evaluate(async g => {
  const MO = await import('/assets/apps/bimcraft/dev/mass-options.js'), A = window.bimcraftRes.api, run = MO.developOption(g, { typeKey: 'ext-2x6' });
  try { if (typeof A.commit === 'function') A.commit(run, { label: 'Mass', verb: 'developed' }); else A.ed().modelChange(run); return 'ok'; } catch (e) { return 'err ' + (e.key || e.message); }
}, row0.mass_guid);
ok(dev === 'ok', 'BimCraft develops the mass (its own op): ' + dev);
await page.waitForFunction(() => { const r = Object.values(window.superWindow.links.store().all('sc_massing'))[0]; return r && r.state !== 'mass'; }, null, { timeout: 90000 }).catch(() => {});
const row1 = await page.evaluate(() => Object.values(window.superWindow.links.store().all('sc_massing'))[0]);
const cls = await page.evaluate(els => { const ix = window.bimcraftColor.index(), by = new Map(); for (const [id, g] of ix.values('guid')) by.set(g, ix.values('cls').get(id)); return els.map(g => by.get(g)).sort(); }, row1.elements || []);
ok(row1.state === 'developed' && cls.join() === 'IfcSlab,IfcWall,IfcWall,IfcWall,IfcWall', 'sc_massing says developed, with 4 walls and 1 slab as its elements: ' + JSON.stringify([row1.state, cls]));
const l1 = await page.evaluate(() => window.superWindow.project.links.map(l => [l.kind, l.role, l.to.id]));
ok(l1.filter(l => l[0] === 'developed' && l[1] === 'derives-from' && l[2] === iid).length === 5 && !l1.some(l => l[0] === 'massing'), 'five links back (each element derives-from the solid); the massing-of link has ended: ' + l1.length + ' links');
await page.waitForSelector(D + ' [data-sclink-masses] tr[data-sclink-mass="developed"]');
ok((await page.textContent(D + ' [data-sclink-masses] tr[data-sclink-mass="developed"]')).replace(/\s+/g, ' ').includes('Developed') && (await page.$eval(D + ' [data-sclink-masses] tr[data-sclink-mass="developed"] td:last-child', x => x.textContent.trim())) === '5', 'the Massing tab: Developed, 5 elements');
// pick a wall in the BIM view: the hub relates the solid in the Model view, and the Links tab says "is made from"
const wk = await page.evaluate(g => { const ix = window.bimcraftColor.index(); for (const [id, gv] of ix.values('guid')) if (gv === g) return ix.keyBase + id; return null; }, row1.elements[0]);
await page.evaluate(k => window.bimcraftVis.pick([k]), wk); await page.waitForTimeout(500);
const rel = await page.evaluate(() => window.superWindow.hub.related());
ok(rel.some(r => r.app === 'modelcraft' && r.id === iid && r.why === 'derives-from'), 'picking a developed wall relates its solid in the Model view: ' + JSON.stringify(rel));
await page.click(D + ' [data-sclink-tab="links"]');
const at = await page.$$eval(D + ' [data-sclink-at] li', n => n.map(x => x.dataset.sclinkRole + '|' + x.textContent.replace(/\s+/g, ' ').trim()));
ok(at.length === 1 && at[0].startsWith('derives-from|is made from'), 'the Links tab, with the wall picked: "is made from" the solid: ' + JSON.stringify(at));
await page.screenshot({ path: `${OUT}/links-massing.png` });
ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); await close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
