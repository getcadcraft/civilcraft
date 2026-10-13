/* SPDX-License-Identifier: Apache-2.0 */
/**
 * objects-fixture.mjs — builds builder M's multileader/object fixture in all six versions:
 * objects-fixture.py (ezdxf) → DXF → ODA File Converter → testfiles/dwg-corpus/_fixtures/objects/<AC10xx>/mleaders.dwg
 * (outside git, like the rest of the corpus). Then check them with
 *   node tools/dwg-test/objects-check.mjs --sources testfiles/dwg-corpus/_fixtures/objects/AC1015,…
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = '/var/www/CADCRAFT/testfiles/dwg-corpus/_fixtures/objects';
const PY = path.join(ROOT, 'tools/civilcraft-test/venv/bin/python');
const ODA = path.join(ROOT, 'tools/civilcraft-test/venv/dwg-readers/oda/AppRun');
const V = { AC1015: 'ACAD2000', AC1018: 'ACAD2004', AC1021: 'ACAD2007', AC1024: 'ACAD2010', AC1027: 'ACAD2013', AC1032: 'ACAD2018' };
const work = fs.mkdtempSync(path.join(ROOT, 'tmp', 'objfx-'));
const inDir = path.join(work, 'in');
fs.mkdirSync(inDir);
const r = spawnSync(PY, [path.join(ROOT, 'tools/dwg-test/objects-fixture.py'), path.join(inDir, 'mleaders.dxf')], { encoding: 'utf8' });
if (r.status) { console.error(r.stderr); process.exit(1); }
const xvfb = execFileSync('sh', ['-c', 'command -v xvfb-run'], { encoding: 'utf8' }).trim();
for (const [v, oda] of Object.entries(V)) {
  const out = path.join(OUT, v);
  fs.mkdirSync(out, { recursive: true });
  spawnSync(xvfb, ['-a', ODA, inDir, out, oda, 'DWG', '0', '1', '*.dxf'], { encoding: 'utf8', timeout: 300000 });
  const f = path.join(out, 'mleaders.dwg');
  console.log(v, fs.existsSync(f) ? fs.statSync(f).size + ' bytes' : 'NOT WRITTEN', fs.existsSync(f + '.err') ? fs.readFileSync(f + '.err', 'utf8').trim() : '');
}
fs.rmSync(work, { recursive: true, force: true });
