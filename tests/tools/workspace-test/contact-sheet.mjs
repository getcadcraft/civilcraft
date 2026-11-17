#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * contact-sheet.mjs — UI.17: every app x every layout x both themes x three widths (plus the six screen sizes of UI.29) on one contact sheet,
 * with the checks that say what is wrong with each picture. Re-run before every release; the sheet and results.json go in docs/results/0.10/ui-check/.
 *
 *   node tools/workspace-test/contact-sheet.mjs [--apps a,b] [--layouts classic,docked,...] [--themes paper,model] [--widths 1920,1280,760]
 *        [--sizes 1280x800,...|none] [--out dir] [--full dir] [--resume] [--no-sheet]
 *   node tools/workspace-test/contact-sheet.mjs --sheet-only          rebuild index.html from results.jsonl
 *
 * One page load per app, layout and theme; the window is then resized to each width and size (a person resizing, not reloading). Checks per view:
 *   mounted   the layout that mounted is the one asked for           hscroll   the page scrolls sideways
 *   brand     the app name shows once in the chrome (pattern 11)       ribbons   more than one visible ribbon
 *   clipped   a bar wider than its box with no way to reach the rest   stage     the drawing area is under a fifth of the window
 *   errors    console or page errors (once per load)                   cmdline   more than one visible command line
  * --layouts a,b   only those layouts ("classic" is the standard one)
 * Run as root (Playwright; signs in with the bimres test admin's session). nice -n 10; one browser at a time.
 */
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes(k);
const ALL = ['cadcraft', 'bimcraft', 'modelcraft', 'markupcraft', 'takeoffcraft', 'civilcraft', 'detailcraft', 'partcraft', 'supercadcraft'];
const APPS = arg('--apps', ALL.join(',')).split(',');
const ONLY = arg('--layouts') ? arg('--layouts').split(',') : null;
const THEMES = arg('--themes', 'paper,model').split(',');
const WIDTHS = arg('--widths', '1920,1280,760').split(',').map(Number);
const SIZES = arg('--sizes', '1280x800,1440x900,1920x1080,2560x1440,3440x1440,5120x1440') === 'none' ? [] : arg('--sizes', '1280x800,1440x900,1920x1080,2560x1440,3440x1440,5120x1440').split(',').map((s) => s.split('x').map(Number));
const OUT = arg('--out', path.join(REPO, 'docs/results/0.10/ui-check')), FULL = arg('--full', path.join(REPO, 'tmp/ui-check'));
const RESULTS = path.join(OUT, 'results.jsonl');
fs.mkdirSync(path.join(OUT, 'thumbs'), { recursive: true }); fs.mkdirSync(FULL, { recursive: true });

const manifestLayouts = (slug) => { try { const m = JSON.parse(fs.readFileSync(path.join(REPO, 'public_html/assets/apps', slug, 'dev/manifest.json'), 'utf8')); const w = m.workspaces; return Array.isArray(w) ? w : w?.layouts || []; } catch (e) { return []; } };
const jpg = (f) => f.replace(/\.png$/, '.jpg');

function sheet() {
  const rows = fs.existsSync(RESULTS) ? fs.readFileSync(RESULTS, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
  const last = new Map(); for (const r of rows) last.set([r.app, r.layout, r.theme, r.view].join('|'), r);   // a later run replaces an earlier one
  const list = [...last.values()];
  const bad = list.filter((r) => r.problems.length);
  const apps = [...new Set(list.map((r) => r.app))];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let h = `<!doctype html><meta charset="utf-8"><title>UI.17 contact sheet</title><style>body{font:14px/1.4 system-ui,sans-serif;margin:1rem;background:#fff;color:#111}h2{margin:1.5rem 0 .3rem}h3{margin:1rem 0 .2rem;font-size:15px}
  .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:.5rem}.c{border:1px solid #bbb;padding:.2rem;font-size:11px}.c.bad{border:2px solid #c00}.c img{width:100%;display:block;background:#eee}.c b{display:block}.p{color:#c00}
  table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:.15rem .5rem;font-size:12px}@media(prefers-color-scheme:dark){body{background:#111;color:#eee}.c{border-color:#555}}</style>`;
  h += `<h1>UI.17 contact sheet</h1><p>${list.length} views, ${bad.length} with a problem. Generated ${new Date().toISOString().slice(0, 16)}Z by tools/workspace-test/contact-sheet.mjs.</p>`;
  const kinds = {}; for (const r of bad) for (const p of r.problems) { const k = p.split(':')[0]; kinds[k] = (kinds[k] || 0) + 1; }
  h += '<table><tr><th>problem</th><th>views</th></tr>' + Object.entries(kinds).map(([k, n]) => `<tr><td>${esc(k)}</td><td>${n}</td></tr>`).join('') + '</table>';
  for (const app of apps) {
    h += `<h2>${esc(app)}</h2>`;
    const layouts = [...new Set(list.filter((r) => r.app === app).map((r) => r.layout))];
    for (const l of layouts) {
      h += `<h3>${esc(l)}</h3><div class="g">`;
      for (const r of list.filter((x) => x.app === app && x.layout === l)) h += `<div class="c${r.problems.length ? ' bad' : ''}"><a href="${esc(path.relative(OUT, path.join(FULL, r.file)))}"><img loading="lazy" src="thumbs/${esc(r.thumb)}"></a><b>${esc(r.theme)} ${esc(r.view)}</b>${r.problems.map((p) => `<span class="p">${esc(p)}</span><br>`).join('')}</div>`;
      h += '</div>';
    }
  }
  fs.writeFileSync(path.join(OUT, 'index.html'), h); console.log('sheet: ' + path.join(OUT, 'index.html') + ' (' + list.length + ' views, ' + bad.length + ' with a problem)');
}
if (has('--sheet-only')) { sheet(); process.exit(0); }

const done = new Set(); if (has('--resume') && fs.existsSync(RESULTS)) for (const l of fs.readFileSync(RESULTS, 'utf8').split('\n').filter(Boolean)) { const r = JSON.parse(l); done.add([r.app, r.layout, r.theme].join('|')); }
const { chromium } = await import('playwright-core');
const { patchIdle } = await import(pathToFileURL(path.join(REPO, 'tools/super-test/idle.mjs')).href);
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimres'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

/** What is measured in the page: the part of the contact sheet that is not a picture. */
const MEASURE = () => {
  const vis = (n) => { const r = n.getBoundingClientRect(); const s = getComputedStyle(n); return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none' && r.bottom > 0 && r.right > 0 && r.left < innerWidth && r.top < innerHeight; };
  const main = document.querySelector('main');
  const names = [...document.querySelectorAll('.app-bar-name,.ws-brand')].filter(vis);
  const switches = [...document.querySelectorAll('.ws-switch')].filter(vis);
  const ribbons = [...document.querySelectorAll('.ws-ribbon')].filter(vis);
  const cmd = [...document.querySelectorAll('[data-cmd-input],.blk-cmd input,input[data-ws-cmd]')].filter(vis);
  const clipped = [...document.querySelectorAll('.ws-ribbon,.ws-top .tr-row,.ws-top .vw-menus,.ws-bottom .ws-bar,.ws-stage-top')].filter(vis).filter((n) => {
    if (n.scrollWidth <= n.clientWidth + 3) return false;
    const ov = getComputedStyle(n).overflowX; if (ov === 'auto' || ov === 'scroll') return false;                // scrolls: reachable
    return !n.querySelector('[data-ws-more],.ws-more,.vw-more,[aria-label*="More"]');                         // a ⋯ control: reachable
  }).map((n) => (n.className || n.tagName).toString().split(' ')[0] + ' ' + n.scrollWidth + '>' + n.clientWidth);
  // the drawing area = the largest visible canvas (an app that draws its sheet some other way is not measured)
  let frac = null; for (const c of document.querySelectorAll('main canvas')) { if (!vis(c)) continue; const r = c.getBoundingClientRect(); const f = Math.round((Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / (innerWidth * innerHeight) * 100) / 100; if (frac === null || f > frac) frac = f; }
  return { layout: main?.dataset.wsLayout || '', hscroll: document.documentElement.scrollWidth - innerWidth, names: names.length, switches: switches.length, ribbons: ribbons.length, cmd: cmd.length, clipped, frac,
    step: document.documentElement.dataset.wsDensity || document.body.dataset.wsDensity || '' };
};

const expectLayout = (l) => (l === 'classic' ? '' : l);
for (const slug of APPS) {
  const layouts = (['classic', ...manifestLayouts(slug)]).filter((l) => !ONLY || ONLY.includes(l));
  for (const layout of layouts) for (const theme of THEMES) {
    if (done.has([slug, layout, theme].join('|'))) continue;
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
    const page = patchIdle(await ctx.newPage()); const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror ' + e.message.slice(0, 120))); page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push('console ' + m.text().slice(0, 120)); });
    await page.addInitScript(([l]) => { try { localStorage.setItem('cc-fit', 'never'); localStorage.setItem('cc-autofocus', 'off'); localStorage.setItem('cc-tours', 'off'); localStorage.setItem('cc-newhere', 'done'); if (l === 'classic') localStorage.removeItem('cc-workspace'); else localStorage.setItem('cc-workspace', l); } catch (e) { /* */ } }, [layout]);
    const t0 = Date.now();
    try {
      await page.goto('https://getcadcraft.com/lab/' + slug + '?space=' + theme, { waitUntil: 'networkidle', timeout: 60000 });
      for (let i = 0; i < 10; i++) { const d = await page.$('dialog[data-autosave-dialog][open] [data-autosave-discard]'); if (!d) break; await d.click().catch(() => {}); await page.waitForTimeout(150); }
      if (layout !== 'classic') await page.waitForSelector('main.ws-on', { timeout: 15000 }).catch(() => {});
      const hooks = await import(pathToFileURL(path.join(REPO, 'tools/workspace-test/apps', slug + '.mjs')).href).catch(() => ({}));
      if (hooks.prepare) await hooks.prepare(page).catch((e) => errors.push('prepare ' + e.message.slice(0, 100)));
      await page.addStyleTag({ content: '.staff-panel,[data-staff-panel],#staff-panel{display:none!important}' });
      await page.waitForTimeout(1500);
    } catch (e) { errors.push('load ' + e.message.slice(0, 120)); }
    const views = [...WIDTHS.map((w) => [w, 900, w + 'w']), ...SIZES.map(([w, h]) => [w, h, w + 'x' + h])];
    const loadErrors = errors.slice(0, 3);
    for (const [w, h, name] of views) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(w > 3000 ? 900 : 500);
      const m = await page.evaluate(MEASURE).catch(() => null);
      const problems = [];
      if (!m) problems.push('measure: page did not answer');
      else {
        if (m.layout !== expectLayout(layout) && !(w <= 768 && m.layout === '') && !(slug === 'supercadcraft' && m.layout.startsWith('file:')))   // (SuperCad: the signed-in account's synced layout wins over the one asked for)
             // at phone widths the chosen layout waits and the phone layout runs (D3)
           problems.push('mounted: asked ' + layout + ', got ' + (m.layout || 'classic'));
        if (m.hscroll > 1) problems.push('hscroll: ' + m.hscroll + ' px');
        if (m.names > 1) problems.push('brand: the app name shows ' + m.names + ' times');
        if (m.switches > 1) problems.push('switcher: ' + m.switches + ' visible');
        if (m.ribbons > 1) problems.push('ribbons: ' + m.ribbons + ' visible');
        if (m.cmd > 1) problems.push('cmdline: ' + m.cmd + ' visible');
        if (m.clipped.length) problems.push('clipped: ' + m.clipped.join(', '));
        if (m.frac !== null && m.frac < 0.2 && w >= 1280) problems.push('stage: drawing area ' + Math.round(m.frac * 100) + '% of the window');
      }
      if (name === views[0][2] && loadErrors.length) problems.push('errors: ' + loadErrors.join(' | '));
      const base = [slug, layout, theme, name].join('_') + '.png';
      await page.screenshot({ path: path.join(FULL, base.replace(/\.png$/, '.jpg')), type: 'jpeg', quality: 55 }).catch(() => {});
      const thumb = jpg(base); try { execFileSync('convert', [path.join(FULL, thumb), '-resize', '420x', '-quality', '60', path.join(OUT, 'thumbs', thumb)]); } catch (e) { /* no thumb */ }
      fs.appendFileSync(RESULTS, JSON.stringify({ app: slug, layout, theme, view: name, w, h, file: thumb, thumb, step: m?.step || '', frac: m?.frac, problems }) + '\n');
    }
    console.log(slug + ' ' + layout + ' ' + theme + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)' + (loadErrors.length ? ' errors: ' + loadErrors[0] : ''));
    await ctx.close();
  }
}
await browser.close();
if (!has('--no-sheet')) sheet();
