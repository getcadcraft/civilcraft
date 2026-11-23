// SPDX-License-Identifier: Apache-2.0
// Super (0.11 XE.3, sound-11): the Building app mounted in SuperCad Studio carries Room acoustics with the traced section's engine (acoustics-ui.js,
// simplify.js, geo.js resolve from the mounted build).   node tools/super-test/acoustics-mount.mjs
import { start, launch } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const page = await browser.newPage(), errors = [];
page.on('pageerror', (e) => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
try {
  await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  await page.waitForSelector('[data-eg49]', { state: 'attached', timeout: 60000 });
  ok(true, 'the mounted Building app has the Room acoustics section ([data-eg49])');
  const r = await page.evaluate(async () => {
    const s = [...document.querySelectorAll('script[type="importmap"]')].map((x) => x.textContent).join('\n');
    const m = s.match(/"([^"]*bimcraft\/[^"]*\/)acoustics-ui\.js"/) || s.match(/"([^"]*bimcraft\/[^"/]+\/)/);
    const base = m ? new URL(m[1], location.href).href : null;
    if (!base) return { base: null };
    const ui = await import(base + 'acoustics-ui.js'), sm = await import(base + 'simplify.js');
    const g = sm.roomModel({ poly: [[0, 0], [6, 0], [6, 3], [3, 3], [3, 6], [0, 6]], height: 2.7, floor: 'carpet', ceiling: 'ceiling-tile', wall: 'gypsum' });
    return { base, mount: typeof ui.mountAcoustics, ok: g.ok, v: g.volume_m3 };
  });
  ok(r.base && r.mount === 'function', 'acoustics-ui.js loads from the mounted build: ' + r.base);
  ok(r.ok && Math.abs(r.v - 72.9) < 1e-9, 'simplify.js runs in the Super page (an L-shaped room, 72.9 m³)');
} catch (e) { fail++; console.log('  FAIL ' + (e.stack || e)); }
for (const e of errors) { fail++; console.log('  FAIL page error: ' + e); }
await browser.close(); await close();
console.log(`\nsuper acoustics-mount: ${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
