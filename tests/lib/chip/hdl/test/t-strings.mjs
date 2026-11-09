/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
const { ok, eq, section, mine, LIB } = globalThis.__chipTest;
const P = await mine('problems.js');
const EN_JS = (await mine('strings.en.js')).default;
const en = JSON.parse(fs.readFileSync(path.join(LIB, 'strings.en.json'), 'utf8'));
const es = JSON.parse(fs.readFileSync(path.join(LIB, 'strings.es-MX.json'), 'utf8'));
const vars = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

section('Strings');
{
  eq(EN_JS, en, 'strings.en.js and strings.en.json agree');
  const missing = Object.keys(P.TEMPLATES).filter((c) => en['chip.src.e.' + c] !== P.TEMPLATES[c]);
  eq(missing, [], 'every Problems template is in the strings file with the same words');
  eq(Object.keys(es).sort(), Object.keys(en).sort(), 'es-MX has every key');
  eq(Object.keys(en).filter((k) => vars(en[k]) !== vars(es[k])), [], 'es-MX keeps every placeholder');
  ok(Object.keys(en).filter((k) => k !== '@note').every((k) => /^chip\.(src|net)\./.test(k)), 'only chip.src.* and chip.net.* keys');
  const used = new Set();
  for (const f of ['ui-source.js', 'ui-netlist.js']) for (const m of fs.readFileSync(path.join(LIB, f), 'utf8').matchAll(/['"](chip\.(?:src|net)\.[A-Za-z.]+)['"]/g)) used.add(m[1]);
  for (const sev of ['error', 'warning', 'note']) used.add('chip.src.sev.' + sev);
  for (const fl of ['top', 'testbench', 'unused', 'missing', 'cycle', 'builtin', 'cut']) used.add('chip.src.flag.' + fl);
  eq([...used].filter((k) => !k.endsWith('.') && !(k in en)), [], 'every key the panels use exists');
  const r = P.row('net.width', 'warning', { pin: 'A', inst: 'u1', want: 3, got: 2 }, { file: 'f.v', line: 4, col: 2 });
  eq([r.id, r.text, r.msg.key], ['chip.hdl:net.width:f.v:4:2', 'Pin A of u1 is 3 bits wide but is connected to 2 bits', 'chip.src.e.net.width'], 'row id, text and message key');
  eq(P.rowText(r, (k) => es[k]), 'El pin A de u1 tiene 3 bits pero se conecta a 2 bits', 'rowText in Spanish');
  eq(P.rowText(r, (k) => k), r.text, 'rowText falls back to English');
  const files = fs.readdirSync(LIB).filter((f) => f.endsWith('.js'));
  ok(files.every((f) => fs.readFileSync(path.join(LIB, f), 'utf8').startsWith('/* SPDX-License-Identifier: Apache-2.0 */')), 'every file carries the Apache-2.0 line');
  const imports = files.flatMap((f) => [...fs.readFileSync(path.join(LIB, f), 'utf8').matchAll(/^import .* from '([^']+)'/gm)].map((m) => m[1]));
  eq(imports.filter((i) => !i.startsWith('./')), [], 'no imports outside this folder (lib/schematic is passed in)');
  const noDom = ['verilog.js', 'vhdl.js', 'hier.js', 'netlist.js', 'schem.js', 'session.js', 'problems.js'];
  ok(noDom.every((f) => !/\bdocument\b|\bwindow\b/.test(fs.readFileSync(path.join(LIB, f), 'utf8'))), 'engine files do not touch the DOM');
}
