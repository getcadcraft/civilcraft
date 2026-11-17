#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * browser-no-roadblocks.mjs: BK.73 in the real pages. With EVERY Problems source firing errors (a flood from a test check source, a
 * test regulation source, an engine and an import source), the app's own checks armed, and the Building regulations add-on switched
 * on where the build has it, a person can still DRAW and still SAVE, in BimCraft and in CadCraft:
 *
 *   BimCraft   a new two-level building; the flood; four walls drawn with the Wall tool by clicks on the plan; Save as IFC
 *              downloads a file that holds those walls; the drawing advice (draw-advice.js) arrives in Problems as a warning.
 *   CadCraft   a drawing; the flood; a LINE and a CIRCLE typed at the command line; SAVEAS downloads a DXF that holds them.
 * The Problems list still shows its errors before and after: nothing was accepted, cleared or waived to get there.
 *
 *   node tools/shell-test/browser-no-roadblocks.mjs [--apps bimcraft,cadcraft]
 * Run as root. One browser, one page at a time. The static half is node bin/test-no-roadblocks.mjs.
 */
import fs from 'node:fs';
import { openLab } from './lab-page.mjs';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APPS = (arg('--apps') || 'bimcraft,cadcraft').split(',');
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };

/** Every kind of source the registry knows, each full of errors (and a warning, and a note). */
const flood = (page) => page.evaluate(() => {
  const P = window.ccProblems; if (!P) return null;
  const many = (kind, code, extra = {}) => Array.from({ length: 12 }, (_, i) => ({ code, severity: i < 8 ? 'error' : i < 11 ? 'warning' : 'note', text: 'BK.73 test: ' + code + ' ' + (i + 1), about: [{ kind: 'element', id: 'bk73-' + kind + '-' + i, label: 'Thing ' + (i + 1) }], ...extra }));
  window.__bk73 = ['check', 'regulation', 'engine', 'import'].map((kind) => { const h = P.source({ id: 'bk73.' + kind, kind, label: 'BK.73 ' + kind }); h.set(many(kind, kind === 'regulation' ? 'stair.riser.max' : 'bk73.' + kind + '.fail', kind === 'regulation' ? { source: { pack: { id: 'bk73-pack', name: 'BK.73 test pack', clause: '1.1' } } } : {})); return h; });
  return P.store.counts();
});
const counts = (page) => page.evaluate(() => window.ccProblems.store.counts());
const regsOn = async (page) => {
  const has = await page.evaluate(() => !!window.ccAddons?.list?.().find((x) => x.id === 'regs'));
  if (!has) return 'not in this build';
  await page.evaluate(() => window.ccAddons.loader.setEnabled('regs', true));
  await page.waitForFunction(() => window.ccAddons.list().find((x) => x.id === 'regs')?.state === 'active', null, { timeout: 15000 }).catch(() => {});
  return page.evaluate(() => window.ccAddons.list().find((x) => x.id === 'regs')?.state || 'unknown');
};

const lab = await openLab('bkroadblocks');
try {
  if (APPS.includes('bimcraft')) {
    console.log('\n== bimcraft: every check failing, then draw and save');
    const { ctx, page, errors } = await lab.page('bimcraft', { layout: 'standard', storage: { 'bimcraft.model.units': 'mm' } });
    await page.waitForFunction(() => !!window.bimcraftPlan?.state?.data, null, { timeout: 30000 }).catch(() => {});
    const regs = await regsOn(page);
    ok(regs === 'active', 'the Building regulations add-on is on (' + regs + ')');
    await page.waitForTimeout(800);
    const before = await flood(page);
    ok(before && before.error >= 32, `Problems holds ${before?.error} errors, ${before?.warning} warnings from check, regulation, engine and import sources`);
    const badge = await page.evaluate(() => document.querySelector('[data-problems-open]')?.getAttribute('data-worst') || document.querySelector('[data-problems-count]')?.textContent || '');
    ok(/error|\d/.test(badge), 'the Problems button shows it (' + badge + ')');
    // draw: a room of four walls with the Wall tool
    await page.click('[data-model-layout="plan"]').catch(() => {});
    await page.waitForTimeout(400);
    const at = (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
    const click = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py); await page.waitForTimeout(120); };
    const nWalls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.length);
    const w0 = await nWalls();
    await page.evaluate(() => document.querySelector('[data-mtool="wall"]').click());
    for (const [x, y] of [[1000, 1000], [6000, 1000], [6000, 5000], [1000, 5000], [1000, 1000]]) await click(x, y);
    await page.keyboard.press('Escape');
    await page.waitForFunction((n) => window.bimcraftPlan.state.data.walls.length >= n + 4, w0, { timeout: 15000 }).catch(() => {});
    const w1 = await nWalls();
    ok(w1 - w0 === 4, `DRAW: four walls drawn with the Wall tool while the list is full of errors (${w0} to ${w1})`, await page.evaluate(() => document.querySelector('[data-status]')?.textContent || ''));
    const mid = await counts(page);
    ok(mid.error >= before.error, `the errors are all still there (${mid.error}): nothing had to be accepted or cleared to draw`);
    // an unusual size is made, not refused, and Problems says so as a warning (the page's own modules: the ones the tools import)
    const adv = await page.evaluate(async () => {
      const url = (re) => performance.getEntriesByType('resource').map((e) => e.name).find((n) => re.test(n));
      const du = url(/\/draw-advice\.js(\?|$)/), D = await import(du), S = await import(url(/\/model-site\.js(\?|$)/) || du.replace('draw-advice.js', 'model-site.js'));
      let refused = '';
      try { window.bimcraftLive.editor.modelChange(S.splitLevels({ total: 1500, count: 2 }), { label: 'Levels', verb: 'Split' }); } catch (e) { refused = e.key || String(e); }
      D.advise('level', [['height', { is: 750, lo: 1000, hi: 100000 }]]);   // what a tool does after its commit: the source reads the model again
      await new Promise((r) => setTimeout(r, 1200));
      const l = window.ccProblems.store.list({}).filter((p) => p.code === 'advice.level.height');
      return { refused, n: l.length, severity: l[0]?.severity, text: l[0]?.text || '', about: l[0]?.about?.[0]?.id || '' };
    });
    ok(adv.refused === '' && adv.n >= 1 && adv.severity === 'warning' && /750/.test(adv.text) && !/^advice\./.test(adv.text) && adv.about, 'two levels of 750 mm (refused before today): made, and Problems holds a WARNING about each, in words: "' + (adv.text || '').slice(0, 60) + '"', JSON.stringify(adv));
    // save
    const dlp = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
    await page.evaluate(() => document.querySelector('[data-save]').click());
    const dl = await dlp;
    const text = dl ? fs.readFileSync(await dl.path(), 'utf8') : '';
    const walls = (text.match(/IFCWALL(STANDARDCASE)?\(/g) || []).length;
    ok(!!dl && /^ISO-10303-21;/.test(text) && walls >= 4, `SAVE: Save as IFC downloads ${dl?.suggestedFilename()} with ${walls} walls in it`, text.slice(0, 60));
    const after = await counts(page);
    ok(after.error >= before.error, `after the save the list still holds its ${after.error} errors (saved with them, not past them)`);
    // reopen the saved file: the advice is worked out from the model again (it does not vanish on reopen)
    if (dl) {
      await page.evaluate(() => { for (const h of window.__bk73 || []) h.clear(); });
      await page.setInputFiles('[data-file]', await dl.path());
      const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 3000 }).catch(() => null);
      if (asked) await asked.click();
      await page.waitForFunction(() => window.ccProblems.store.list({}).some((p) => p.code === 'advice.level.height'), null, { timeout: 60000 }).catch(() => {});
      const re = await page.evaluate(() => { const l = window.ccProblems.store.list({}).filter((p) => p.code === 'advice.level.height'); return { n: l.length, severity: l[0]?.severity, src: l[0]?.source?.name || '' }; });
      ok(re.n >= 1 && re.severity === 'warning', `REOPEN: the saved file opened again shows the same Drawing advice (${re.n} warnings) without anything being drawn`, JSON.stringify(re));
    }
    ok(!errors.length, 'no page error', errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
  if (APPS.includes('cadcraft')) {
    console.log('\n== cadcraft: every check failing, then draw and save');
    const { ctx, page, errors } = await lab.page('cadcraft', { layout: 'standard' });
    const regs = await regsOn(page);
    ok(regs === 'active', 'the Building regulations add-on is on (' + regs + ')');
    const before = await flood(page);
    ok(before && before.error >= 32, `Problems holds ${before?.error} errors, ${before?.warning} warnings from check, regulation, engine and import sources`);
    const typed = async (t) => { await page.fill('[data-cmd-input]', t); await page.press('[data-cmd-input]', 'Enter'); await page.waitForTimeout(140); };
    const n0 = await page.evaluate(() => window.cadcraft.doc.count());
    await page.evaluate(() => { if (window.cadcraft?.engine?.busy) window.cadcraft.engine.escape(); });
    await typed('LINE'); await typed('200,200'); await typed('400,300'); await typed('');
    await typed('CIRCLE'); await typed('300,100'); await typed('40');
    await typed('AUDIT').catch(() => {}); await page.waitForTimeout(300);
    await page.evaluate(() => { if (window.cadcraft?.engine?.busy) window.cadcraft.engine.escape(); });
    const n1 = await page.evaluate(() => window.cadcraft.doc.count());
    ok(n1 - n0 === 2, `DRAW: a line and a circle typed at the command line while the list is full of errors (${n0} to ${n1} objects)`);
    const mid = await counts(page);
    ok(mid.error >= before.error, `the errors are all still there (${mid.error})`);
    await typed('SAVEAS');
    await page.waitForSelector('dialog[open] input[name="cc-format"][value="dxf2000"]', { timeout: 10000 });
    await page.check('dialog[open] input[value="dxf2000"]');
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }).catch(() => null), page.click('dialog[open] button[data-key="ok"]')]);
    const text = dl ? fs.readFileSync(await dl.path(), 'latin1') : '';
    ok(!!dl && /\r\nLINE\r\n/.test(text) && /\r\nCIRCLE\r\n/.test(text), `SAVE: Save as downloads ${dl?.suggestedFilename()} with the line and the circle in it`);
    const after = await counts(page);
    ok(after.error >= before.error, `after the save the list still holds its ${after.error} errors`);
    ok(!errors.length, 'no page error', errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
} finally { await lab.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
