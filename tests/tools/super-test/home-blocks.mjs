// SPDX-License-Identifier: Apache-2.0
// SuperCad Studio Home: the person's own order of the Home blocks in a real browser. The grip shows on hover only; the arrow keys on the grip, a
// mouse drag and a touch drag by the grip, Reset, and the order following the account to a second "device" (two browser contexts sharing one fake /api/v1/prefs that merges per
// section like Prefs.php). Unit part: bin/test-super-home.mjs.   node tools/super-test/home-blocks.mjs
import { start, launch } from './serve.mjs';
import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const PR = await import(pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public_html/assets/apps/supercadcraft/dev/super-prefs.js')));
const { url: URL0, close } = await start({ langs: [''] });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const errors = [];
let stored = null; const puts = [];   // the account's preferences document
const TOKEN = 'ccu_' + 'T'.repeat(40);
async function device(signedIn = true, width = 1440) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('t-seen')) { localStorage.setItem('cc-super-home', 'on'); sessionStorage.setItem('t-seen', '1'); } } catch { /* none */ } });
  await ctx.route('**/api/account/super-connect', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: signedIn ? { signedIn: true, token: TOKEN } : { signedIn: false } }) }));
  await ctx.route('**/api/v1/prefs', async r => {
    if (r.request().headers().authorization !== 'Bearer ' + TOKEN) return r.fulfill({ status: 401, body: '{}' });
    if (r.request().method() === 'GET') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: { prefs: stored } }) });
    const b = JSON.parse(r.request().postData()); puts.push(b); stored = PR.merge(b, stored).prefs;
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: { prefs: stored } }) });
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e.message)));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|bad HTTP response code/.test(m.text())) errors.push(m.text()); });
  await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  return { ctx, page };
}
const order = page => page.evaluate(() => [...document.querySelectorAll('[data-home-blocks] > [data-home-block]')].map(b => b.dataset.homeBlock));
const DEF = ['quick', 'start', 'workflow', 'kits', 'office', 'recent'];

{
  const { ctx, page } = await device(true);
  ok(JSON.stringify(await order(page)) === JSON.stringify(DEF), 'the blocks start in the usual order: ' + await order(page));
  ok(await page.locator('[data-home-move]').count() === 0, 'no Up/Down arrows: the grip is the one handle');
  const op = id => page.evaluate(i => getComputedStyle(document.querySelector(`[data-home-block="${i}"] .sc-hblock-bar`)).opacity, id);
  await page.mouse.move(5, 5); await page.waitForTimeout(200);
  ok(await op('start') === '0', 'the grip is hidden until the block is hovered');
  // owner 2026-11-11: only after one second of hover, and only over the block's eyebrow (its heading), never the whole block
  await page.hover('[data-home-block="start"] [data-door="model"]'); await page.waitForTimeout(1300);
  ok(await op('start') === '0', 'a second and more over the block body (a door) does not show the grip');
  await page.hover('[data-home-block="start"] .sc-hh2'); await page.waitForTimeout(500);
  ok(await op('start') === '0', 'half a second on the eyebrow: still hidden');
  await page.waitForTimeout(700);
  ok(await op('start') === '1' && await op('workflow') === '0', 'after a second on the eyebrow its own grip shows, no other');
  { const g = await page.locator('[data-home-grip="start"]').boundingBox(); await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2, { steps: 6 }); await page.waitForTimeout(150); }
  ok(await op('start') === '1', 'it stays while the pointer goes from the heading to the grip');
  await page.mouse.move(5, 5); await page.waitForTimeout(700);
  ok(await op('start') === '0', 'and hides again once the pointer leaves');
  await page.hover('[data-home-block="workflow"] .sc-hh2'); await page.waitForTimeout(400); await page.mouse.move(5, 5); await page.waitForTimeout(200);
  await page.hover('[data-home-block="workflow"] .sc-hh2'); await page.waitForTimeout(700);
  ok(await op('workflow') === '0', 'leaving before the second is up starts the count again');
  await page.mouse.move(5, 5);

  // owner 2026-11-11: the workflow tool groups do not all show always: a long group shows its first three, then "Show all n" (caret right, closed = up)
  {
    const groups = await page.evaluate(() => [...document.querySelectorAll('[data-home-workflow] .sc-home-group')].map(g => ({ n: g.querySelectorAll('.sc-home-cmd').length, fold: g.querySelector('[data-home-tools-fold]')?.dataset.homeToolsFold || null, label: g.querySelector('[data-home-tools-fold] span')?.textContent || '', caret: g.querySelector('[data-home-tools-fold] i')?.className || '' })));
    const folded = groups.filter(g => g.fold);
    ok(groups.length > 0 && groups.every(g => g.fold ? g.n === 3 : g.n <= 4), 'every long group shows three tools, a short one all of its own: ' + JSON.stringify(groups.map(g => g.n)));
    if (folded.length) {
      const f = folded[0];
      ok(/^Show all \d+$/.test(f.label) && /chevron-up/.test(f.caret), 'a folded group says Show all n with the caret up: ' + f.label);
      await page.click(`[data-home-tools-fold="${f.fold}"]`);
      const n = await page.locator(`[data-home-tools-fold="${f.fold}"]`).evaluate(b => [b.closest('.sc-home-group').querySelectorAll('.sc-home-cmd').length, b.getAttribute('aria-expanded'), b.querySelector('i').className, b.textContent]);
      ok(n[0] > 3 && n[1] === 'true' && /chevron-down/.test(n[2]) && /Show fewer/.test(n[3]), 'Show all opens it: every tool, caret down, Show fewer: ' + JSON.stringify(n));
      ok(await page.evaluate(id => JSON.parse(localStorage.getItem('cc-super-home-tools')).includes(id), f.fold), 'the open group is remembered on this computer');
      await page.click(`[data-home-tools-fold="${f.fold}"]`);
      ok(await page.locator(`[data-home-tools-fold="${f.fold}"]`).evaluate(b => b.closest('.sc-home-group').querySelectorAll('.sc-home-cmd').length) === 3, 'Show fewer folds it back');
    } else ok(true, 'no workflow group is long enough to fold in this build');
    const more = await page.locator('[data-home-tools-fold]').first().evaluate(b => parseFloat(getComputedStyle(b).fontSize)).catch(() => 0);
    ok(more > 0 && more <= 12, '"Show all n" is tiny (owner): ' + more + 'px');
  }

  // owner 2026-11-11: every block folds to its heading, Quick actions has a heading too, caret on the right (open = down, closed = up)
  {
    await page.waitForSelector('[data-home-block="kits"] [data-home-fold]'); await page.waitForSelector('[data-home-block="office"] [data-home-fold]');
    ok((await page.textContent('[data-home-block="quick"] .sc-hh2')).trim().startsWith('Quick actions'), 'Quick actions has a heading');
    ok(await page.evaluate(() => [...document.querySelectorAll('[data-home-blocks] > [data-home-block]')].every(b => { const f = b.querySelector('.sc-hh2 > [data-home-fold]'); return f && f.getAttribute('aria-expanded') === 'true' && /chevron-down/.test(f.firstChild.className); })), 'every block has a fold caret on its heading, open (caret down)');
    const vis = (id, sel) => page.locator(`[data-home-block="${id}"] ${sel}`).first().isVisible();
    await page.click('[data-home-block="quick"] .sc-hh2');
    ok(!(await vis('quick', '.sc-quick')) && await vis('quick', '.sc-hh2'), 'a click on the heading folds the block to its heading');
    ok(await page.evaluate(() => { const f = document.querySelector('[data-home-fold="quick"]'); return f.getAttribute('aria-expanded') === 'false' && /chevron-up/.test(f.firstChild.className); }), 'folded: caret up');
    await page.click('[data-home-fold="recent"]');
    ok(!(await vis('recent', '[data-home-recent]')) && !(await vis('recent', '[data-home-project]')) && await vis('recent', '.sc-hh2'), 'Recent projects (heading inside a grid) folds too, This project with it');
    await page.click('[data-home-fold="recent"]');
    ok(await vis('recent', '[data-home-recent]') && await vis('recent', '[data-home-project]'), 'and opens again by its caret');
    await page.click('[data-home-block="recent"] .sc-home-link').catch(() => {});
    ok(await page.evaluate(() => !document.querySelector('[data-home-block="recent"]').classList.contains('is-folded')), 'All projects inside the heading keeps its own job (no fold)');
    await page.click('[data-hv="home"]').catch(() => {});
    ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cc-super-home-folded'))).then(v => JSON.stringify(v) === '["quick"]'), 'the folded block is remembered on this computer');
    await page.click('[data-home-block="quick"] .sc-hh2');
    ok(await vis('quick', '.sc-quick'), 'and opens again from its heading');
    ok(await page.evaluate(() => getComputedStyle(document.querySelector('.sc-hmain')).overflowY === 'scroll'), 'Home always shows its scroll bar (owner)');
    ok(await page.evaluate(() => { const bl = document.querySelector('[data-home-block="start"]'), i = bl.querySelector('.sc-hblock-grip i').getBoundingClientRect(), r = document.createRange(); r.selectNodeContents(bl.querySelector('.sc-hh2').firstChild); const t = r.getBoundingClientRect(); return Math.abs(i.top + i.height / 2 - (t.top + t.height / 2)) <= 1.5; }), 'the grip sits on the middle of its heading (owner: it sat low)');
  }
  ok(await page.locator('[data-home-layout-reset]').isHidden(), 'no Reset while the order is the usual one');
  await page.waitForFunction(() => /account/.test(document.querySelector('[data-home-layout-where]').textContent));
  ok(true, 'signed in: the note says the order is kept with the account');
  await page.waitForSelector('[data-home-office="kits"] .sc-hh2'); await page.waitForSelector('[data-home-office="help"] .sc-hh2');
  ok(await page.locator('[data-home-office="help"] [data-sco-help="ask"]').count() === 1 && await page.locator('[data-home-office="kits"] [data-sco-help]').count() === 0, 'Quick Kits and Office and help are two blocks');

  // the arrow keys on the grip (the grip shows while it has the keyboard focus)
  await page.focus('[data-home-grip="recent"]'); await page.waitForTimeout(200);
  ok(await op('recent') === '1', 'a grip with the keyboard focus is shown');
  await page.keyboard.press('ArrowUp');
  ok(JSON.stringify(await order(page)) === JSON.stringify(['quick', 'start', 'workflow', 'kits', 'recent', 'office']), 'ArrowUp moves a block up one');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cc-super-home-layout')).order[4]) === 'recent', 'and the order is kept in this browser');
  await page.waitForFunction(() => true); await page.waitForTimeout(150);
  ok(puts.length >= 1 && Object.keys(puts.at(-1).sections).join() === 'home', 'and sent to the account, the home section alone');

  // arrow keys on the grip
  await page.focus('[data-home-grip="kits"]'); await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp');
  ok(JSON.stringify(await order(page)) === JSON.stringify(['quick', 'kits', 'start', 'workflow', 'recent', 'office']), 'ArrowUp on the grip moves it: ' + await order(page));
  ok(await page.evaluate(() => document.activeElement && document.activeElement.dataset.homeGrip === 'kits'), 'the focus stays on the grip it moved');
  await page.keyboard.press('Home');
  ok((await order(page))[0] === 'kits', 'Home moves it to the top');
  await page.keyboard.press('End');
  ok((await order(page)).at(-1) === 'kits', 'End moves it to the bottom');

  // drag by the grip: the second block (both it and the top are on screen) to the top
  await page.evaluate(() => document.querySelector('.sc-hmain').scrollTo(0, 0));
  const second = (await order(page))[1];
  const grip = await page.locator(`[data-home-grip="${second}"]`).boundingBox(), top = await page.locator(`[data-home-block="${(await order(page))[0]}"]`).boundingBox();
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2); await page.mouse.down();
  await page.mouse.move(grip.x + 40, top.y + 8, { steps: 12 }); await page.mouse.move(grip.x + 42, top.y + 6, { steps: 3 }); await page.mouse.up();
  await page.waitForTimeout(150);
  ok((await order(page))[0] === second, 'a block dragged by its grip drops where it is let go: ' + second + ' → ' + await order(page));
  ok(await page.evaluate(() => !document.querySelector('.is-dragging, .is-drop-before, .is-drop-after') && !document.body.classList.contains('sc-hblock-dragging')), 'nothing stays marked after the drop');
  // dragging the block body (not the grip) does nothing
  const body = await page.locator('[data-home-block="recent"] .sc-hh2').first().boundingBox(), before = await order(page);
  await page.mouse.move(body.x + 30, body.y + 5); await page.mouse.down(); await page.mouse.move(body.x + 30, top.y + 5, { steps: 10 }); await page.mouse.up();
  ok(JSON.stringify(await order(page)) === JSON.stringify(before), 'pressing anywhere but the grip does not drag');
  ok(await page.locator('[data-home-layout-reset]').isVisible(), 'Reset shows once the order is not the usual one');
  const mine = await order(page);

  // a second device signed in to the same account gets the order
  const two = await device(true);
  await two.page.waitForFunction(o => [...document.querySelectorAll('[data-home-blocks] > [data-home-block]')].map(b => b.dataset.homeBlock).join() === o, mine.join(), { timeout: 8000 }).catch(() => {});
  ok(JSON.stringify(await order(two.page)) === JSON.stringify(mine), 'a second device signed in to the same account shows the same order: ' + await order(two.page));
  // it changes it; the first device sees that when Home is shown again
  await two.page.click('[data-home-layout-reset]');
  ok(JSON.stringify(await order(two.page)) === JSON.stringify(DEF), 'Reset puts the usual order back');
  await two.page.waitForTimeout(200);
  await page.evaluate(() => window.superWindow.home.api.layout.pull());
  ok(JSON.stringify(await order(page)) === JSON.stringify(DEF), 'the first device takes the newer order from the account');
  await two.ctx.close();

  // the order survives a reload and does not block the rest of Home
  await page.focus('[data-home-grip="start"]'); await page.keyboard.press('ArrowDown');
  await page.reload(); await page.waitForSelector('[data-sc-ready]');
  ok((await order(page))[2] === 'start', 'the order survives a reload');
  await page.click('[data-door="build"]');
  ok(await page.evaluate(() => document.querySelector('[data-sc-home]').hidden), 'the doors still lead into the drawing space');
  await ctx.close();
}
{
  const n = puts.length;
  const { ctx, page } = await device(false, 420);
  ok(/browser/.test(await page.textContent('[data-home-layout-where]')), 'signed out: the note says the order stays in this browser');
  const vw = await page.evaluate(() => [document.querySelector('.sc-hmain').scrollWidth, document.querySelector('.sc-hmain').clientWidth]);
  ok(vw[0] <= vw[1] + 1, 'nothing scrolls sideways on a phone: ' + vw);
  // a finger drag: the second block's grip up past the first (touch pointer events through CDP)
  await page.evaluate(() => document.querySelector('.sc-hmain').scrollTo(0, 0));
  const o0 = await order(page);
  await page.evaluate(([id, to]) => {   // pointer events of type touch, as a finger sends them
    const g = document.querySelector(`[data-home-grip="${id}"]`), r = g.getBoundingClientRect(), x = r.x + r.width / 2, y0 = r.y + r.height / 2, top = document.querySelector(`[data-home-block="${to}"]`).getBoundingClientRect().top + 4;
    const fire = (t, y, tgt = g) => tgt.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, button: 0, buttons: t === 'pointerup' ? 0 : 1 }));
    fire('pointerdown', y0); for (let i = 1; i <= 10; i++) fire('pointermove', y0 + (top - y0) * i / 10); fire('pointerup', top);
  }, [o0[1], o0[0]]);
  ok((await order(page))[0] === o0[1], 'a touch drag by the grip moves the block: ' + await order(page));
  await page.waitForTimeout(150);
  ok(puts.length === n, 'and nothing is sent');
  await ctx.close();
}
ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
await browser.close(); await close();
console.log(`home-blocks: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
