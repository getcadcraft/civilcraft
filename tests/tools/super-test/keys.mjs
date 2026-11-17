// SPDX-License-Identifier: Apache-2.0
// SC.8: the words of SuperCad Studio's lab build, checked as files (no browser).
//   1. every language key written out in the build's code exists in lang/en.json (fragments built in code, 'sc.x.' + id, are matched by prefix);
//   2. no en.json key is unused (a key is "used" when its text, or a prefix ending in . or -, appears in the code); a doubtful one is listed, not an error;
//   3. every other locale file has every en.json key (English stands in until the translation lane), with the same {fills} and plural shape rules the checker lints;
//   4. the bare-string scan finds nothing new (tools/lang/scan.mjs supercadcraft --check).
//   node tools/super-test/keys.mjs [--verbose]
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const D = path.join(ROOT, 'public_html/assets/apps/supercadcraft/dev');
const verbose = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, m, more = '') => { if (c) pass++; else { fail++; console.log('FAIL', m, more); } };
const keysOf = f => Object.keys(JSON.parse(fs.readFileSync(f, 'utf8'))).filter(k => !k.startsWith('@'));
const en = new Set(keysOf(path.join(D, 'lang/en.json')));

const lit = new Set(), pref = new Set();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'lang' || e.name === 'help' || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!/\.(js|mjs|inc|json|php)$/.test(e.name)) continue;
    const s = fs.readFileSync(p, 'utf8');
    for (const m of s.matchAll(/['"`]((?:sc|nurbs|nodes)\.[A-Za-z0-9._${}-]*)/g)) {
      const k = m[1];
      if (k.includes('${')) pref.add(k.split('${')[0]);
      else if (/[.-]$/.test(k)) pref.add(k);
      else lit.add(k);
    }
  }
})(D);
// names that look like keys but are code (a module name, an action id)
const NOT_KEYS = new Set(['nurbs.continuity', 'nurbs.match', 'nurbs.ui.need.more_']);
const missing = [...lit].filter(k => !en.has(k) && !NOT_KEYS.has(k) && ![...en].some(e => e.startsWith(k + '.')));
ok(missing.length === 0, 'every key used in code exists in en.json', missing.slice(0, 8).join(', '));
const unused = [...en].filter(k => !lit.has(k) && ![...pref].some(p => k.startsWith(p)));
ok(unused.length === 0, 'no en.json key is unused', unused.length + ' unused, e.g. ' + unused.slice(0, 6).join(', '));
if (verbose) console.log('literal keys', lit.size, 'prefixes', pref.size, 'en keys', en.size);

const FILL = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
const fills = v => { const o = new Set(); for (const s of typeof v === 'string' ? [v] : Object.values(v || {})) for (const m of String(s).matchAll(FILL)) o.add(m[1]); return [...o].sort().join(','); };
const enJson = JSON.parse(fs.readFileSync(path.join(D, 'lang/en.json'), 'utf8'));
let files = 0, short = 0, badFill = [];
for (const f of fs.readdirSync(path.join(D, 'lang')).filter(x => x.endsWith('.json') && x !== 'en.json')) {
  files++;
  const j = JSON.parse(fs.readFileSync(path.join(D, 'lang', f), 'utf8'));
  const gone = [...en].filter(k => !(k in j));
  if (gone.length) { short++; if (short <= 3) console.log('  ' + f + ': ' + gone.length + ' missing, e.g. ' + gone.slice(0, 3).join(', ')); }
  for (const k of en) if (k in j && fills(j[k]) !== fills(enJson[k])) badFill.push(f + ':' + k);
}
ok(files >= 75 && short === 0, `all ${files} other language files have every key`, short + ' files are short (node tools/lang/carry-english.mjs supercadcraft fills them)');
ok(badFill.length === 0, 'every placeholder survives in every language', badFill.slice(0, 5).join(', '));
let scan = '';
try { scan = execFileSync('node', [path.join(ROOT, 'tools/lang/scan.mjs'), 'supercadcraft', '--check'], { encoding: 'utf8' }); } catch (e) { scan = String(e.stdout || e); }
ok(/no new bare strings/.test(scan), 'the scan finds no new bare string in the build', scan.split('\n').filter(l => /^public_html/.test(l)).slice(0, 5).join(' | '));
console.log(`keys.mjs: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
