// SPDX-License-Identifier: Apache-2.0
// CadCraft: a side-panel section's links (New layer, Tools, Library…, the sheet set menu, Open a sample) and its title (owner 2026-11-12: "the links should be under
// the title - it causes truncation to have them the same line … just an icon on the same line … on open move the icon to the (icon label) link, on close restore the icon").
// Open: the title on its own line, the links under it with icon and label, nothing cut. Closed: only the icons, on the title's line. In every layout.
//   node tools/cadcraft-test/browser-sec-links.mjs [--shots <dir>]      (root: signs a staff test account in, like the other browser tests here)
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots'), SHOTS = si >= 0 ? process.argv[si + 1] : null; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map(s => path.join(cacheDir, build, s)).find(p => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.tour', 'skipped'); } catch {} });
const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
const heads = () => page.evaluate(() => [...document.querySelectorAll('.cc-sec-head')].filter(h => h.offsetParent && h.querySelector('.cc-linkbtn')).map(h => { const t = h.querySelector('.cc-h'), tr = t.getBoundingClientRect(), hr = h.getBoundingClientRect();
  return { title: t.textContent.trim(), state: h.dataset.af || 'none', titleCut: t.scrollWidth > t.clientWidth + 1, links: [...h.querySelectorAll('.cc-linkbtn')].filter(x => x.offsetParent).map(l => { const r = l.getBoundingClientRect(); return { name: l.textContent.trim() || l.getAttribute('aria-label'), under: r.top >= tr.bottom - 3, label: parseFloat(getComputedStyle(l).fontSize) > 0, icon: !!l.querySelector('.bi'), cut: l.scrollWidth > l.clientWidth + 1, inside: r.right <= hr.right + 1, tip: !!(l.title || l.getAttribute('aria-label')) }; }) }; }));
const shot = async file => { const r = await page.evaluate(() => { const hs = [...document.querySelectorAll('.cc-sec-head')].filter(h => h.offsetParent && h.querySelector('.cc-linkbtn')); if (!hs.length) return null; hs[0].scrollIntoView({ block: 'start' }); const a = hs[0].getBoundingClientRect(), b = hs[hs.length - 1].getBoundingClientRect(); return { x: Math.max(0, a.left - 12), y: Math.max(0, a.top - 12), width: Math.min(460, a.width + 24), height: Math.min(700, Math.max(120, b.bottom - a.top + 60)) }; }); await page.screenshot(r ? { path: file, clip: r } : { path: file }); };
try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email); await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  const layouts = ['', ...(await (async () => { await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' }); await page.waitForFunction(() => !!window.cadcraft); return page.evaluate(() => { try { return (JSON.parse(document.getElementById('cc-workspace').textContent).layouts || []).map(l => l.id || l); } catch { return []; } }); })())].slice(0, 6);
  for (const id of layouts) {
    await page.goto(BASE + '/lab/cadcraft' + (id ? '?workspace=' + id : ''), { waitUntil: 'networkidle' }); await page.waitForFunction(() => !!window.cadcraft); await page.waitForTimeout(1200);
    const name = id || 'standard';
    let hs = await heads();
    if (!hs.length) { console.log('  (' + name + ': the section links are not on screen in this layout)'); continue; }
    // open every section that folds, then check the open form
    await page.evaluate(() => [...document.querySelectorAll('.cc-sec-head[data-af="closed"]')].forEach(h => h.querySelector('.cc-h').click())); await page.waitForTimeout(300); hs = await heads();
    for (const h of hs.filter(h => h.state !== 'closed')) ok(!h.titleCut && h.links.every(l => l.under && !l.cut && l.inside && (l.label || !l.name)), `${name} / ${h.title} (open): the title is whole and every link is under it, with its label, not cut: ` + JSON.stringify(h.links));
    if (SHOTS) await shot(path.join(SHOTS, `sec-${name}-open.png`));
    const n = await page.evaluate(() => { const hs = [...document.querySelectorAll('.cc-sec-head[data-af="open"]')].filter(h => h.offsetParent); hs.forEach(h => h.querySelector('.cc-h').click()); return hs.length; });
    await page.waitForTimeout(300);
    if (!n) { console.log('  (' + name + ': sections do not fold in this layout)'); continue; }
    hs = (await heads()).filter(h => h.state === 'closed');
    ok(hs.length > 0, `${name}: sections fold (${hs.length})`);
    for (const h of hs) ok(!h.titleCut && h.links.every(l => !l.under && !l.label && l.icon && l.tip && l.inside), `${name} / ${h.title} (closed): only icons, on the title's line, each with a tooltip, the title whole: ` + JSON.stringify(h.links));
    if (SHOTS) await shot(path.join(SHOTS, `sec-${name}-closed.png`));
    // a closed section's icon still works without opening it
    const lib = await page.evaluate(() => { const b = document.querySelector('.cc-sec-head[data-af="closed"] [data-library]'); if (!b) return null; b.click(); return document.querySelector('.cc-sec-head:has([data-library])').dataset.af; });
    if (lib) ok(lib === 'closed', `${name}: pressing a closed section's icon does not fold or unfold it: ` + lib);
    await page.keyboard.press('Escape');
    await page.evaluate(() => [...document.querySelectorAll('.cc-sec-head[data-af="closed"]')].forEach(h => h.querySelector('.cc-h').click()));   // leave the layout as it was found
  }
  ok(errors.length === 0, 'no page error: ' + errors.slice(0, 3).join('; '));
} finally { await browser.close(); try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { encoding: 'utf8' }); } catch { /* the fixture account stays disabled-on-next-run */ } }
console.log(`${fail ? 'FAILED' : 'ok'}: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
