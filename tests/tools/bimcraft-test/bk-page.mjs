/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bk-page.mjs — the lab page for the booklet (BK) browser checks of session `bk-instep-10` (browser-instep.mjs,
 * browser-dayone.mjs, browser-assist-same.mjs): Chromium headless on /lab/bimcraft with a session minted for the test's own
 * admin (tools/cadcraft-test/admin.php session <tag>; disabled again by close()), console errors collected, every request's
 * host recorded. Run as root.
 *
 *   const L = await openLab({ tag, units: 'mm', settings })   → { page, ok, done(), close(), hosts, problems, … helpers }
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const BASE = 'https://getcadcraft.com';
export const M = (name) => `/assets/apps/bimcraft/dev/${name}`;

export async function openLab({ tag, units = 'mm', settings = null, viewport = { width: 1600, height: 1000 }, url = '/lab/bimcraft?space=paper' }) {
  const si = process.argv.indexOf('--shots');
  const SHOTS = si > 0 ? process.argv[si + 1] : null;
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  let pass = 0, fail = 0;
  const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } return !!c; };
  const { chromium } = await import('playwright-core');
  const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
  const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
  const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
  const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
  const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', tag], { encoding: 'utf8' }));
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const problems = [], hosts = new Map();
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') { const u = m.location()?.url || ''; problems.push('console: ' + m.text() + (u ? ' [' + u + ']' : '')); } });   // the address a failed request went to (browser-house.mjs tells the test machine's own throttles from the build's errors)
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('request', (r) => { try { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol)) hosts.set(u.host, (hosts.get(u.host) || 0) + 1); } catch (e) { /* data: and blob: */ } });
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.evaluate(([u, s]) => { try { if (u) localStorage.setItem('bimcraft.model.units', u); else localStorage.removeItem('bimcraft.model.units'); localStorage.removeItem('bimcraft.workstyle'); if (s) localStorage.setItem('bimcraft.settings', JSON.stringify(s)); } catch (e) { /* none */ } }, [units, settings]);
  await page.reload({ waitUntil: 'networkidle' });

  const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
  const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
  const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
  /** A real mouse click on the plan at a plan point (mm). */
  const mouseClick = async (x, y, o) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 3 }); await page.mouse.click(px, py, o); };
  /** The plan shows the box (mm) in the middle of its canvas, clear of the floating Draw bar. */
  const frame = (x0, y0, x1, y1) => page.evaluate(([x0, y0, x1, y1]) => { const st = document.querySelector('.bc-stage'); if (st) st.scrollTop = 0; const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(); pv.scale = Math.min(r.width / (x1 - x0), r.height / 2 / (y1 - y0)) * 0.6; pv.cx = (x0 + x1) / 2; pv.cy = (y0 + y1) / 2 - r.height * 0.15 / pv.scale; pv.userMoved = true; pv.render(); }, [x0, y0, x1, y1]);
  /** A Draw tool from its button (inside its menu when it has one), as a person opens the menu and picks it. */
  const tool = (name) => page.evaluate((n) => { const b = document.querySelector(`[data-mtool="${n}"]`); b.closest('details')?.setAttribute('open', ''); b.click(); b.closest('details')?.removeAttribute('open'); }, name);
  const inPage = (fn, arg) => page.evaluate(fn, arg);
  const walls = () => page.evaluate(() => { const S = window.bimcraftPlan.state, kb = window.bimcraftRes.api.kb(); return S.data.walls.map((w) => ({ guid: w.guid, id: w.id, key: kb + w.id, a: w.a, b: w.b, t: w.t, len: w.len, height: w.height, type: w.typeKey, storey: w.storey, name: w.name })); });
  const changes = () => page.evaluate(() => { const e = window.bimcraftRes.api.ed(); return e ? e.changes.map((c) => String(c.label || c.kind)) : []; });
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
  async function newBuilding({ name = null, levels = null, height = null, accept = true } = {}) {
    await page.click('[data-empty] [data-new]');
    await page.waitForSelector('dialog.bc-new');
    if (name !== null) await page.fill('[data-new-name]', name);
    if (levels !== null) await page.fill('[data-new-levels]', String(levels));
    if (height !== null) await page.fill('[data-new-height]', height);
    if (!accept) return;
    await page.click('[data-new-ok]');
    await waitStatus(/^New building /);
    await page.waitForSelector('[data-plan-wrap]:not([hidden])');
    await settled();
  }
  const done = () => {
    const real = problems.filter((p) => !/favicon|ERR_ABORTED|net::ERR_FAILED.*hardware/.test(p));
    ok(!real.length, 'no console errors' + (real.length ? ': ' + real.slice(0, 4).join(' | ') : ''));
    console.log(`\n${pass} passed, ${fail} failed`);
    return fail ? 1 : 0;
  };
  const close = async () => { try { await browser.close(); } catch (e) { /* gone */ } try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', tag], { encoding: 'utf8' }); } catch (e) { /* stays for the next run */ } };
  return { page, ctx, ok, done, close, hosts, problems, waitStatus, settled, at, mouseClick, frame, tool, inPage, walls, changes, shot, newBuilding };
}
