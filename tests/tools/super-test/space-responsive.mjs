// SPDX-License-Identifier: Apache-2.0
// Super: the drawing space on a phone, an upright tablet and a tablet held sideways (owner 2026-11-12: "this page/app needs work"; "in front of clients on a tablet").
// 75rem and under the side zones (tools, Properties) are strips that open over the view as drawers, so the view keeps the width; the bars stay on the screen;
// the window is pinned to the screen (no page scroll); the mounted apps keep a real drawing area.
//   node tools/super-test/space-responsive.mjs [--shots <dir>]
import { start, launch } from './serve.mjs';
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : '';
const SIZES = { phone: { width: 390, height: 844 }, 'tablet-upright': { width: 768, height: 1024 }, 'tablet-sideways': { width: 1024, height: 768 } };
const { url, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
for (const [size, viewport] of Object.entries(SIZES)) {
  const ctx = await browser.newContext({ viewport, hasTouch: true, isMobile: size === 'phone' });
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-super-compact', 'off'); } catch { /* no storage */ } });   // Full view on a small screen: what is left when the person turns Compact view off (the mode itself: compact.mjs)
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
  await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(500);
  const W = viewport.width, H = viewport.height;
  const geo = () => page.evaluate(() => { const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height, r: b.right, b: b.bottom }; };
    return { doc: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight, bar: r('.sc-bar'), appbar: r('.app-bar'), work: r('.sc-work'), center: r('.sc-center'), left: r('.sc-left'), right: r('.sc-right'), status: r('.sc-status'), strip: r('.scpage-strip'),
      leftFolded: document.querySelector('.sc-left')?.classList.contains('is-folded'), rightFolded: document.querySelector('.sc-right')?.classList.contains('is-folded') }; });
  let g = await geo();
  ok(g.doc <= W, `${size}: nothing wider than the screen (${g.doc})`);
  ok(g.docH <= H + 1 && g.status.b <= H + 1, `${size}: the window is pinned to the screen, the status line is on it (${g.docH})`);
  ok(g.appbar.r <= W + 1 && g.bar.r <= W + 1 && g.bar.h <= 110, `${size}: both bars are on the screen and no taller than two rows (${Math.round(g.bar.h)})`);
  ok(g.leftFolded && g.rightFolded, `${size}: tools and Properties start put away`);
  ok(g.center.w >= W - 100, `${size}: the view has the width (${Math.round(g.center.w)} of ${W})`);
  ok(g.center.h >= H * 0.5, `${size}: and at least half the height (${Math.round(g.center.h)} of ${H})`);
  ok(g.status.h <= 48, `${size}: the status line is one row (${Math.round(g.status.h)})`);
  // the drawers
  for (const z of ['left', 'right']) {
    await page.click(`[data-act="fold-${z}"]`); await page.waitForTimeout(250);
    const o = await geo(), zr = o[z];
    ok(!o[z + 'Folded'] && zr.w >= 240 && zr.l >= 0 && zr.r <= W + 1, `${size}: ${z} opens as a drawer on the screen (${Math.round(zr.w)} wide)`);
    ok(Math.abs(o.center.w - g.center.w) < 2, `${size}: ${z} lies over the view, it takes no width from it`);
    ok(await page.evaluate(z => document.querySelector(`.sc-${z} .sc-frame`).offsetParent !== null, z), `${size}: ${z} shows its panel`);
    if (z === 'left') { await page.click('[data-act="fold-right"]', { force: true }).catch(() => {}); await page.waitForTimeout(250); const p = await geo();
      ok(size === 'phone' ? true : p.leftFolded, `${size}: a tap on the other side's strip (it is under the shade) puts this drawer away: one drawer at a time`);
      if (!p.rightFolded) { await page.click('[data-act="fold-right"]'); await page.waitForTimeout(200); } if (!(await geo()).leftFolded) { await page.click('[data-act="fold-left"]'); await page.waitForTimeout(200); }
      continue; }
    if (size !== 'phone') { await page.click('[data-act="fold-close"]', { position: { x: 5, y: 5 } }); await page.waitForTimeout(250); ok((await geo())[z + 'Folded'], `${size}: a tap beside the drawer puts it away`); }
    else { await page.click(`[data-act="fold-${z}"]`); await page.waitForTimeout(250); ok((await geo())[z + 'Folded'], `${size}: its heading puts it away`); }
  }
  // a tool picked in the tools drawer goes back to the drawing
  await page.click('[data-act="fold-left"]'); await page.waitForTimeout(250);
  const tool = await page.$('.sc-left .sc-tool:not([disabled])');
  if (tool) { await tool.click({ timeout: 5000 }).catch(e => ok(false, `${size}: a tool in the open drawer can be tapped`)); await page.waitForTimeout(300); ok((await geo()).leftFolded, `${size}: picking a tool puts the tools away`); }
  else { await page.click('[data-act="fold-left"]'); await page.waitForTimeout(200); }
  // the pages along the bottom: each app keeps a real drawing area
  for (const pg of ['takeoff', 'markup']) {
    await page.evaluate(k => document.querySelector('[data-scpage="' + k + '"]').click(), pg); await page.waitForTimeout(2500);
    const a = await page.evaluate(() => { const c = document.querySelector('.sc-center'); const s = [...c.querySelectorAll('.mc-stage, .tc-stage')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect())[0]; return { w: s ? s.width : 0, h: s ? s.height : 0, doc: document.documentElement.scrollWidth }; });
    ok(a.w >= Math.min(W - 10, 320) && a.h >= 200, `${size} ${pg}: the sheet area is ${Math.round(a.w)}x${Math.round(a.h)}`);
    ok(a.doc <= W, `${size} ${pg}: nothing wider than the screen`);
    if (shots) await page.screenshot({ path: `${shots}/space-${size}-${pg}.png` });
  }
  ok(errors.length === 0, `${size}: no page error: ` + errors.join('; '));
  await ctx.close();
}
console.log(`space-responsive: ${pass} passed, ${fail} failed`); await browser.close(); await close(); process.exit(fail ? 1 : 0);
