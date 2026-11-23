#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-option-catalog.mjs — option-catalog.js (OPT.3): every CadCraft command that asks for options, with each option's built-in letters
 * and its English word, read from the command code itself, so the Option letters editor can offer the whole list (pick a command, pick
 * an option, add letters of your own) and the list cannot name an option that does not exist.
 *
 *   node tools/cadcraft-test/make-option-catalog.mjs [--check] [--report]
 *
 * How it reads the code: a file is cut at each `def('NAME', …)` and at each function beside the commands; a command owns its own text
 * plus the functions it names (three calls deep), and in that text every `opt('KEY', 'Word')` and `opt('KEY', t('lang.key'))` is one
 * option (the word from lang/en.json). So commands that share a function list the same options (ARRAYRECT also lists the polar ones):
 * the list may name an option a command does not ask for in every case, never one that does not exist. Hidden options and options
 * whose letters are computed are left out. The `*` (every command) list is every distinct option found anywhere.
 * bin/test-cadcraft.mjs fails when the file is out of date.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/');
const OUT = APP + 'option-catalog.js';
const CHECK = process.argv.includes('--check'), REPORT = process.argv.includes('--report');
const EN = JSON.parse(fs.readFileSync(APP + 'lang/en.json', 'utf8'));
const en = (k) => (typeof EN[k] === 'string' ? EN[k] : null);

const files = fs.readdirSync(APP).filter((f) => f.endsWith('.js') && f !== 'option-catalog.js').map((f) => APP + f)
  .concat(fs.existsSync(APP + 'lisp') ? fs.readdirSync(APP + 'lisp').filter((f) => f.endsWith('.js')).map((f) => APP + 'lisp/' + f) : []);

const DEF = /\bdef\(\s*'([A-Z0-9_+\-]+)'\s*,/g;
// opt('KEY', 'Word')  |  opt('KEY', t('lang.key'))  |  opt('KEY', "Word")
const OPT = /\bopt\(\s*'([^']+)'\s*,\s*(?:t\(\s*'([^']+)'\s*\)|'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
const KEY_OK = /^[\p{L}\p{N}?]{1,32}$/u;

const KNOWN = new Set([...fs.readFileSync(APP + 'help/command-map.md', 'utf8').matchAll(/^\| `([^`]+)` \|/gm)].map((m) => m[1]));
const commands = new Map();   // NAME → Map(KEY → word)
const every = new Map();      // KEY → Map(word → count)
let loose = 0, computed = 0;
const take = (text, into) => {
  for (const m of text.matchAll(OPT)) {
    const key = m[1].toUpperCase();
    if (!KEY_OK.test(key)) continue;
    const raw = m[2] ? en(m[2]) : (m[3] ?? m[4] ?? '').replace(/\\(.)/g, '$1');
    if (!raw) continue;
    // the prompt shows opt.<word> from the language file when it has one (commands.js opt()); English is the same word
    const word = raw.trim();
    if (into && !into.has(key)) into.set(key, word);
    if (!every.has(key)) every.set(key, new Map());
    every.get(key).set(word, (every.get(key).get(word) || 0) + 1);
  }
};
// A command's prompts are often in a function it calls (ARRAY, ARRAYRECT and ARRAYPOLAR share one), so each file is cut at its commands
// AND at its functions that sit at the commands' own depth or above; a command then owns its text plus the text of the functions it
// names, three calls deep. A function nested inside a command stays part of that command.
const FN = /^([ \t]*)(?:export\s+)?(?:(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(|const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)\n]*\)|[A-Za-z_$][\w$]*)\s*=>)/gm;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  computed += (src.match(/\bopt\(\s*[^'"\s)]/g) || []).length;
  const defs = [...src.matchAll(DEF)].map((m) => { const ls = src.lastIndexOf('\n', m.index) + 1; return { kind: 'def', name: m[1], at: ls, indent: (src.slice(ls, m.index).match(/^[ \t]*/) || [''])[0].length }; });
  if (!defs.length) { loose += [...src.matchAll(OPT)].length; take(src, null); continue; }
  const depth = Math.max(...defs.map((d) => d.indent));
  const fns = [...src.matchAll(FN)].filter((m) => m[1].length <= depth).map((m) => ({ kind: 'fn', name: m[2] || m[3], at: m.index, indent: m[1].length }));
  const marks = [...defs, ...fns].sort((x, y) => x.at - y.at);
  const body = (i) => src.slice(marks[i].at, i + 1 < marks.length ? marks[i + 1].at : src.length);
  const fnText = new Map();
  marks.forEach((mk, i) => { if (mk.kind === 'fn') fnText.set(mk.name, (fnText.get(mk.name) || '') + body(i)); });
  const names = [...fnText.keys()];
  const reach = (text, seen, left) => {
    let all = text;
    if (!left) return all;
    for (const n of names) {
      if (seen.has(n) || !new RegExp('(?<![\\w$.])' + n.replace(/\$/g, '\\$') + '(?![\\w$])').test(text)) continue;
      seen.add(n);
      all += '\n' + reach(fnText.get(n), seen, left - 1);
    }
    return all;
  };
  const used = new Set();
  marks.forEach((mk, i) => {
    if (mk.kind !== 'def') return;
    const seen = new Set();
    const text = reach(body(i), seen, 3);
    for (const n of seen) used.add(n);
    if (!commands.has(mk.name)) commands.set(mk.name, new Map());
    take(text, commands.get(mk.name));
  });
  loose += [...src.slice(0, marks[0].at).matchAll(OPT)].length;
  take(src.slice(0, marks[0].at), null);
  for (const [n, t0] of fnText) if (!used.has(n)) { loose += [...t0.matchAll(OPT)].length; take(t0, null); }
}
const out = { format: 'cadcraft-option-catalog', version: 1, commands: {}, every: {} };
for (const name of [...commands.keys()].sort()) {
  const m = commands.get(name);
  if (name.startsWith('_') || !m.size || !KNOWN.has(name)) continue;   // only commands a person can type (the command map lists the registry, hidden ones left out)
  out.commands[name] = [...m].map(([key, word]) => [key, word]);
}
for (const key of [...every.keys()].sort()) {
  const words = [...every.get(key)].sort((a, b) => b[1] - a[1]);
  out.every[key] = words.slice(0, 3).map((w) => w[0]);   // the same letters can mean different words in different commands: the commonest three
}
const text = '/* SPDX-License-Identifier: Apache-2.0 */\n'
  + '// option-catalog.js — made by tools/cadcraft-test/make-option-catalog.mjs from the command code. Do not edit: run the tool. i18n-ignore-file (the English option words are data the letters map from; the words shown come from opt.* keys)\n'
  + '// commands: NAME → [[built-in letters, English word], …] (the options that command asks for); every: letters → the words they stand for.\n'
  + 'export default ' + JSON.stringify(out, null, 0).replace(/\],\[/g, '], [').replace(/"commands":\{/, '"commands": {\n').replace(/\]\],"/g, ']],\n"').replace(/\},"every":\{/, '},\n"every": {\n').replace(/\],"(?=[^"]+":\[")/g, '],\n"') + ';\n';
const nC = Object.keys(out.commands).length, nO = Object.values(out.commands).reduce((a, l) => a + l.length, 0);
if (REPORT) console.log(`${nC} commands with options, ${nO} options, ${Object.keys(out.every).length} distinct letters; ${loose} option uses outside any command (shared helpers); ${computed} with computed letters (left out)`);
if (CHECK) {
  const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (have !== text) { console.log('option-catalog.js is out of date: run node tools/cadcraft-test/make-option-catalog.mjs'); process.exit(1); }
  console.log('option-catalog.js is up to date');
} else { fs.writeFileSync(OUT, text); console.log(`wrote option-catalog.js: ${nC} commands, ${nO} options`); }
