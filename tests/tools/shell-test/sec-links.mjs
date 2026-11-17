// SPDX-License-Identifier: Apache-2.0
// Every app: a side-panel section's links and its title (owner 2026-11-12, CadCraft first, then "do the same for the other seven apps"). Open: the title on its own
// line, the links under it with icon and label, nothing cut. Closed: only the icons, on the title's line, each with a tooltip. Checked on whatever section headers
// with links are on screen when the app opens empty (some sections only appear with a file open: those are named, not checked).
// BimCraft, CivilCraft, DetailCraft and PartCraft have no links on a section's title line (PartCraft's are icon buttons already): the test only confirms that.
//   node tools/shell-test/sec-links.mjs [app …] [--shots <dir>]      (root: signs a staff test account in)
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots'), SHOTS = si >= 0 ? process.argv[si + 1] : null; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const APPS = { cadcraft: 'cc', modelcraft: 'mc', markupcraft: 'mc', takeoffcraft: 'tc', bimcraft: 'bc', civilcraft: 'cv', detailcraft: 'dc', partcraft: 'pc' };
const want = process.argv.slice(2).filter(a => a in APPS); const RUN = want.length ? want : Object.keys(APPS);
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
const LINKS = x => `.${x}-linkbtn, .${x}-links, .${x}-sec-tools, .${x}-sec-acts`;
const heads = x => page.evaluate(([x, LINKS]) => [...document.querySelectorAll(`.${x}-sec-head`)].filter(h => h.offsetParent).map(h => { const t = h.querySelector(`.${x}-h`) || h.firstElementChild, tr = t.getBoundingClientRect(), hr = h.getBoundingClientRect();
  return { title: t.textContent.trim().slice(0, 30), state: h.dataset.af || 'none', titleCut: t.scrollWidth > t.clientWidth + 1, onLine: [...h.children].filter(c => c.matches(LINKS) && c.offsetParent).length, links: [...h.querySelectorAll(`.${x}-linkbtn`)].filter(l => l.offsetParent).map(l => { const r = l.getBoundingClientRect(); return { name: (l.textContent.trim() || l.getAttribute('aria-label') || '').slice(0, 24), under: r.top >= tr.bottom - 3, label: parseFloat(getComputedStyle(l).fontSize) > 0, icon: !!l.querySelector('.bi'), cut: l.scrollWidth > l.clientWidth + 1, inside: r.right <= hr.right + 1, tip: !!(l.title || l.getAttribute('aria-label')) }; }) }; }), [x, LINKS(x)]);
const fold = (x, from) => page.evaluate(([x, from]) => { const hs = [...document.querySelectorAll(`.${x}-sec-head[data-af="${from}"]`)].filter(h => h.offsetParent); hs.forEach(h => (h.querySelector(`.${x}-h`) || h).click()); return hs.length; }, [x, from]);
const shot = async (x, file) => { const r = await page.evaluate(x => { const hs = [...document.querySelectorAll(`.${x}-sec-head`)].filter(h => h.offsetParent && h.querySelector(`.${x}-linkbtn`)); if (!hs.length) return null; hs[0].scrollIntoView({ block: 'start' }); const a = hs[0].getBoundingClientRect(), b = hs[hs.length - 1].getBoundingClientRect(); return { x: Math.max(0, a.left - 12), y: Math.max(0, a.top - 12), width: Math.min(460, a.width + 24), height: Math.min(700, Math.max(120, b.bottom - a.top + 60)) }; }, x); await page.screenshot(r ? { path: file, clip: r } : { path: file }); };
try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email); await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  for (const app of RUN) {
    const x = APPS[app];
    for (const id of ['', 'docked']) {
      const name = `${app} ${id || 'standard'}`; errors.length = 0;
      await page.goto(BASE + '/lab/' + app + (id ? '?workspace=' + id : ''), { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {}); await page.waitForTimeout(2500);
      await fold(x, 'closed'); await page.waitForTimeout(300);
      let hs = await heads(x); const withLinks = hs.filter(h => h.links.length);
      const hiddenHeads = await page.evaluate(x => [...document.querySelectorAll(`.${x}-sec-head`)].filter(h => !h.offsetParent && h.querySelector(`.${x}-linkbtn`)).map(h => (h.querySelector(`.${x}-h`) || h).textContent.trim().slice(0, 24)), x);
      if (hiddenHeads.length) console.log(`  (${name}: not on screen with the app empty, so not checked: ${hiddenHeads.join(', ')})`);
      if (!withLinks.length) { console.log(`  (${name}: no section title has links beside it: ${hs.length} headers seen)`); ok(errors.length === 0, `${name}: no page error: ` + errors.slice(0, 2).join('; ')); continue; }
      for (const h of withLinks.filter(h => h.state !== 'closed')) ok(!h.titleCut && h.links.every(l => l.under && !l.cut && l.inside && l.label), `${name} / ${h.title} (open): the title is whole and every link is under it, with its label, not cut: ` + JSON.stringify(h.links));
      if (SHOTS) await shot(x, path.join(SHOTS, `${app}-${id || 'standard'}-open.png`));
      const n = await fold(x, 'open'); await page.waitForTimeout(300);
      if (!n) { console.log(`  (${name}: sections do not fold in this layout)`); }
      else {
        const closed = (await heads(x)).filter(h => h.state === 'closed' && h.links.length);
        for (const h of closed) ok(!h.titleCut && h.links.every(l => !l.under && !l.label && l.icon && l.tip && l.inside), `${name} / ${h.title} (closed): only icons, on the title's line, each with a tooltip, the title whole: ` + JSON.stringify(h.links));
        if (SHOTS) await shot(x, path.join(SHOTS, `${app}-${id || 'standard'}-closed.png`));
        await fold(x, 'closed');
      }
      ok(errors.length === 0, `${name}: no page error: ` + errors.slice(0, 2).join('; '));
    }
  }
} finally { await browser.close(); try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch { /* next run disables it */ } }
console.log(`${fail ? 'FAILED' : 'ok'}: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
