#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * run.mjs — Doc's feature suites (drsurfbum/bimcraft-SDH tests/features, pulled 2026-10-24; map docs/apps/bimcraft-workspace.md):
 * F02 precision contract, F04 layered plan graphics, F05 wall sections and elevations, F06 assembly schedules, F28 workspace
 * commands / integrity / walls. node:test files against the site's dev build. His F01 / F03 harnesses and browser scripts are
 * tied to his repo layout and are not carried.
 *   node tools/bimcraft-test/doc-features/run.mjs
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUITES = ['f02/contract', 'f04/graphics', 'f05/sections', 'f06/schedules', 'f28/commands', 'f28/integrity', 'f28/walls'];
let pass = 0, fail = 0;
for (const s of SUITES) {
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', path.join(HERE, s + '.test.mjs')], { encoding: 'utf8', cwd: path.resolve(HERE, '../../..'), maxBuffer: 1 << 26 });
  const out = (r.stdout || '') + (r.stderr || '');
  const p = Number(out.match(/^# pass (\d+)/m)?.[1] || 0), f = Number(out.match(/^# fail (\d+)/m)?.[1] || 0) + (r.status && !/^# fail/m.test(out) ? 1 : 0);
  pass += p; fail += f;
  console.log((f ? 'FAIL ' : 'ok   ') + s + '  ' + p + ' passed, ' + f + ' failed');
  if (f) console.log(out.split('\n').filter((l) => /^not ok|^\s+(error|expected|actual):/.test(l)).slice(0, 12).join('\n'));
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
