#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** browser-default-addons.mjs — /account/default-addons end to end in Chromium: the test account leaves WaterCraft out of CivilCraft and Electrical out
 *  of CadCraft; /use and /lab must not list or load them; signed out they are still there. Choices are set back to "include all". Run as root. */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { launch, BASE, REPO, counter } from '../pointcloud-engine/browser-common.mjs';
const C = counter(), L = await launch('dfa-browser');
const php = (code) => execFileSync('sudo', ['-u', 'www-data', 'php', '-r', `require '${REPO}/public_html/core/bootstrap.php'; ${code}`], { encoding: 'utf8' });
const email = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'dfa-browser'], { encoding: 'utf8' })).email;
const set = (keepAll) => php(`$u = Auth::byEmail('${email}'); foreach (['civilcraft' => 'watercraft', 'cadcraft' => 'electrical'] as $a => $x) { $ids = array_column(DefaultAddons::forApp($a), 'id'); DefaultAddons::save($u, $a, ${keepAll} ? $ids : array_values(array_diff($ids, [$x]))); } echo 'ok';`);
set('false');
const look = async (url, signed, id) => {
  const ctx = await L.browser.newContext({ viewport: { width: 1440, height: 900 } });
  if (signed) await ctx.addCookies([{ name: L.sess.name, value: L.sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage(), errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  const r = await page.evaluate((id) => {
    const l = (window.ccAddons && window.ccAddons.list && window.ccAddons.list()) || (window.cadcraft && window.cadcraft.addons && window.cadcraft.addons.list && window.cadcraft.addons.list()) || null;
    const ids = l ? l.map((a) => (a.manifest && a.manifest.id) || a.id) : null;
    return { known: !!l, has: ids ? ids.includes(id) : null, n: ids ? ids.length : 0, toggle: !!document.querySelector('[data-addon-toggle="' + id + '"]') };
  }, id);
  if (!r.known) { await page.click('[data-settings-open]').catch(() => {}); await page.waitForTimeout(800); r.toggle = await page.evaluate((id) => !!document.querySelector('[data-addon-toggle="' + id + '"]'), id); r.has = r.toggle; }
  r.errors = errs; await ctx.close(); return r;
};
try {
  for (const [area, id] of [['/use/civilcraft', 'watercraft'], ['/lab/civilcraft', 'watercraft'], ['/use/cadcraft', 'electrical'], ['/lab/cadcraft', 'electrical']]) {
    const a = await look(area, true, id);
    C.ok(a.has === false, `${area} signed in: ${id} left out`, a);
    C.ok(a.errors.length === 0, `${area} signed in: no page errors`, a.errors);
  }
  const s = await look('/use/civilcraft', false, 'watercraft');
  C.ok(s.has === true, '/use/civilcraft signed out: WaterCraft still offered', s);
  set('true');
  const back = await look('/use/civilcraft', true, 'watercraft');
  C.ok(back.has === true, 'after "Include all": WaterCraft is offered again', back);
} catch (e) { C.ok(false, 'run failed: ' + e.message); } finally { set('true'); L.down(); await L.browser.close(); }
console.log(`\n${C.pass} passed, ${C.fail} failed`);
process.exit(C.fail ? 1 : 0);
