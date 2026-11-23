#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ui-util-core.mjs — PERF.74 (written by perf-finish-11 code, run by round 2 lane util, 2026-11-22): every app's dev/ui-util.js built on assets/js/ui-util-core.js
 * must give what its own old file gave. In a real Chromium page, the OLD text of each app's ui-util.js (from a before-copy folder) and
 * the NEW one (the dev file, its './ui-util-core.js' import pointed at the canonical copy) are loaded side by side as modules, and every
 * export the old file had is compared: el() over a battery of tags, props and children (outerHTML, value, htmlFor, style, dataset,
 * which listeners fire, or the error it throws), fillDl, bytes, num, fmt, frame and each app's own helpers (called the same way).
 *   node tools/shell-test/browser-ui-util-core.mjs <before-dir> [app …]     before-dir holds <app>/ui-util.js (the old files)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [BEFORE, ...want] = process.argv.slice(2);
if (!BEFORE) { console.error('usage: browser-ui-util-core.mjs <before-dir> [app …]'); process.exit(2); }
const APPS = want.length ? want : fs.readdirSync(BEFORE).filter((a) => fs.existsSync(path.join(BEFORE, a, 'ui-util.js')));
const CORE = fs.readFileSync(path.join(ROOT, 'public_html/assets/js/ui-util-core.js'), 'utf8');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
await page.setContent('<!doctype html><body></body>');
let pass = 0, fail = 0;
for (const app of APPS) {
  const oldSrc = fs.readFileSync(path.join(BEFORE, app, 'ui-util.js'), 'utf8');
  const newSrc = fs.readFileSync(path.join(ROOT, 'public_html/assets/apps', app, 'dev/ui-util.js'), 'utf8');
  const res = await page.evaluate(async ({ oldSrc, newSrc, CORE }) => {
    const url = (s) => URL.createObjectURL(new Blob([s], { type: 'text/javascript' }));
    const coreUrl = url(CORE);
    const O = await import(url(oldSrc)), N = await import(url(newSrc.replace(/(['"])\.\/ui-util-core\.js\1/g, JSON.stringify(coreUrl))));
    const out = [];
    const same = (what, a, b) => out.push({ what, ok: JSON.stringify(a) === JSON.stringify(b), a: JSON.stringify(a)?.slice(0, 200), b: JSON.stringify(b)?.slice(0, 200) });
    const missing = Object.keys(O).filter((k) => !(k in N));
    out.push({ what: 'every old export is still exported', ok: !missing.length, a: missing.join(','), b: '' });
    // el()
    const fired = [];
    const fn = (tag) => () => fired.push(tag);
    const cases = [
      ['div', {}, ['a', 1, null, false, undefined, ['b', ['c']]]],
      ['div', { className: 'x y', id: 'q', title: 3, hidden: true, 'data-k': '', 'aria-label': 'L' }, []],
      ['input', { type: 'number', value: 5, disabled: true, checked: false, min: 0 }, []],
      ['input', { type: 'text', value: 'abc', readOnly: true }, []],
      ['textarea', { value: 'some text', rows: 3 }, []],
      ['label', { htmlFor: 'f1', for: 'f2' }, ['L']],
      ['span', { style: 'color:red' }, []],
      ['span', { style: { color: 'red', fontWeight: '700' } }, []],
      ['div', { dataset: { a: '1', bC: 'two' } }, []],
      ['button', { onClick: fn('onClick'), onclick: fn('onclick'), onChange: fn('onChange'), onInput: fn('onInput'), onpointerdown: fn('pd') }, ['B']],
      ['button', { onClick: 'alert(1)' }, []],
      ['a', { href: '#x', download: 'f.txt', textContent: 'T' }, []],
      ['select', { value: 'b' }, [['option', 'a'], ['option', 'b']]],
    ];
    const run = (M, c) => {
      fired.length = 0;
      try {
        const kids = c[2].map((k) => (Array.isArray(k) && typeof k[0] === 'string' && k.length === 2 && ['option'].includes(k[0]) ? M.el(k[0], { value: k[1] }, k[1]) : k));
        const n = M.el(c[0], c[1], ...kids);
        document.body.append(n);
        for (const ev of ['click', 'change', 'input', 'pointerdown']) n.dispatchEvent(new Event(ev));
        const r = { html: n.outerHTML, value: n.value, htmlFor: n.htmlFor, style: n.style.cssText, ds: { ...n.dataset }, fired: [...fired], checked: n.checked, disabled: n.disabled, readOnly: n.readOnly };
        n.remove();
        return r;
      } catch (e) { return { threw: e.constructor.name + ': ' + e.message }; }
    };
    if (O.el) for (const [i, c] of cases.entries()) same('el case ' + i + ' <' + c[0] + '> ' + Object.keys(c[1]).join(','), run(O, c), run(N, c));
    if (O.fillDl) { const go = (M) => { const dl = document.createElement('dl'); try { M.fillDl(dl, [['a', 1], ['b', ''], ['c', null], ['d', 'x'], ['', 0], ['e', undefined]]); return dl.outerHTML; } catch (e) { return 'threw ' + e.message; } }; same('fillDl', go(O), go(N)); }
    for (const k of ['bytes', 'num', 'fmt']) if (O[k]) same(k, [0, 1, 1023, 1024, 1536, 1048575, 1048576, 5e8, 2e9, 1e-11, -3.14159265, 12345.678, NaN, Infinity].map((v) => { try { return String(O[k](v)); } catch (e) { return 'threw'; } }), [0, 1, 1023, 1024, 1536, 1048575, 1048576, 5e8, 2e9, 1e-11, -3.14159265, 12345.678, NaN, Infinity].map((v) => { try { return String(N[k](v)); } catch (e) { return 'threw'; } }));
    if (O.frame) { await O.frame(); await N.frame(); same('frame resolves', true, true); }
    const own = Object.keys(O).filter((k) => !['el', 'fillDl', 'bytes', 'num', 'fmt', 'frame'].includes(k));
    for (const k of own) same(k + ' is the same function text', String(O[k]), String(N[k]));
    return out;
  }, { oldSrc, newSrc, CORE });
  for (const r of res) { if (r.ok) pass++; else { fail++; console.log(`  FAIL ${app}: ${r.what}\n       old ${r.a}\n       new ${r.b}`); } }
  console.log(`${app}: ${res.filter((r) => r.ok).length}/${res.length} the same`);
}
if (errors.length) { fail++; console.log('  FAIL page errors: ' + errors.join(' | ')); }
await browser.close();
console.log(`\nbrowser-ui-util-core: ${pass} same, ${fail} different`);
process.exit(fail ? 1 : 0);
