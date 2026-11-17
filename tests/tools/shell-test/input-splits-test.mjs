#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * input-splits-test.mjs — every built-in menu style of every app passes the shell's profile sanitiser (assets/js/app-input.js) whole:
 * nothing is dropped, and no ribbon split button is longer than the engine allows (0.9.1: the Arc split lists 12 tools and the engine
 * silently kept 6). Runs on the lab build, or the one named.
 *   node tools/shell-test/input-splits-test.mjs [--build dev|x.y]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const i = process.argv.indexOf('--build');
const build = i > 0 ? process.argv[i + 1] : 'dev';
const IP = await import(path.join(ROOT, 'public_html/assets/js/app-input.js'));
let good = 0, bad = 0;
const ok = (c, m) => { if (c) good++; else { bad++; console.log('  FAIL ' + m); } };
const splitsOf = (style) => [style.bar, style.quick, ...(style.menus || []).map((m) => m.items),
  ...(style.tabs || []).flatMap((t) => (t.panels || []).flatMap((p) => [p.items, p.more]))].flat().filter((x) => x && typeof x === 'object' && Array.isArray(x.split));

for (const app of fs.readdirSync(path.join(ROOT, 'public_html/assets/apps'))) {
  const dir = path.join(ROOT, 'public_html/assets/apps', app, build);
  const file = path.join(dir, `input-${app}.js`);
  if (!fs.existsSync(file)) continue;
  const { COMMANDS, STYLES } = await import(file);
  for (const [id, style] of Object.entries(STYLES)) {
    const v = IP.validateProfile(style, COMMANDS, STYLES);
    ok(v.ok && !v.problems.length, `${app} ${build}: style "${id}" is accepted whole` + (v.problems.length ? ' — ' + v.problems.join(', ') : ''));
    for (const s of splitsOf(style)) ok(s.split.length <= IP.LIMITS.split, `${app} ${build}: "${id}" split ${s.split[0]} has ${s.split.length} tools, the engine keeps ${IP.LIMITS.split}`);
  }
}
// The sanitiser says so when a split is cut (a person's own layout)
const reg = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
const long = { format: IP.FORMAT, version: IP.VERSION, name: 'x', layout: 'ribbon', tabs: [{ label: 't', panels: [{ label: 'p', items: [{ split: Array.from({ length: IP.LIMITS.split + 1 }, () => 'a') }] }] }] };
ok(IP.validateProfile(long, reg, {}).problems.some((p) => p.startsWith('split-too-long')), 'a split over the limit is reported, not dropped silently');
console.log(`input-splits: ${good} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
