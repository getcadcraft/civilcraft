#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test.mjs — Node tests of lib/chip/hdl (0.9 HD.1 + HD.2, session chip-source-09): Verilog and VHDL readers, hierarchy, netlist,
 * schematic on lib/schematic, the shared session, the panels on a stand-in DOM, and the strings files.
 *   node lib/chip/hdl/test/test.mjs [--verbose] [--only verilog,vhdl,hier,netlist,schem,session,ui,strings]
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.resolve(HERE, '..');
const ROOT = path.resolve(LIB, '../../..');
const VERBOSE = process.argv.includes('--verbose');
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; if (VERBOSE) console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const eq = (a, b, name) => { const x = JSON.stringify(a), y = JSON.stringify(b); ok(x === y, name, x === y ? '' : 'got ' + x + ', want ' + y); };
const section = (s) => console.log('\n' + s);
const fixture = (n) => fs.readFileSync(path.join(HERE, 'fixtures', n), 'utf8');
const mine = (f) => import(pathToFileURL(path.join(LIB, f)).href);
globalThis.__chipTest = { ok, eq, section, fixture, mine, LIB, ROOT, HERE, VERBOSE };

const t0 = Date.now();
for (const part of ['verilog', 'vhdl', 'hier', 'netlist', 'schem', 'session', 'ui', 'strings']) {
  if (ONLY && !ONLY.includes(part)) continue;
  try { await import(pathToFileURL(path.join(HERE, `t-${part}.mjs`)).href); }
  catch (e) { fail++; console.log(`  FAIL t-${part}.mjs threw — ${e.stack}`); }
}
console.log(`\nchip hdl: ${pass} passed, ${fail} failed (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
process.exit(fail ? 1 : 0);
