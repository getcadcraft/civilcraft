/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dwg-readers.mjs — run the independent DWG readers on files CivilCraft wrote, for bin/test-civilcraft.mjs.
 *
 *   availableReaders(toolsDir) → [{ name, run(dwgFiles, outDir) → Map(dwgFile → { dxf, problems: [..], encoding? }) }]
 *
 * Readers (installed by setup-dwg-readers.sh into tools/civilcraft-test/venv/dwg-readers/; each is
 * skipped when missing):
 *   LibreDWG 0.14 CLI  dwgread -v2 (every ERROR / Warning line is a problem), then dwg2dxf → DXF
 *   libdxfrw           dwg2dxf -v2000 (LibreCAD's reader; it prints "Success" or "Conversion failed")
 *   ODA File Converter DWG → DXF 2018 with audit on, headless under xvfb-run; it writes a .err file
 *                      next to the output when it had to recover or could not read the drawing
 * Each reader's DXF is then read with ezdxf (check.py dxfdump) by the test.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

export function availableReaders(tools) {
  const base = path.join(tools, 'venv/dwg-readers');
  const out = [];
  const dwgread = path.join(base, 'libredwg/bin/dwgread'), lr2dxf = path.join(base, 'libredwg/bin/dwg2dxf');
  if (fs.existsSync(dwgread) && fs.existsSync(lr2dxf)) {
    out.push({
      name: 'LibreDWG 0.14 (dwgread/dwg2dxf)',
      run(files, dir) {
        const res = new Map();
        for (const f of files) {
          const r = spawnSync(dwgread, ['-v2', f], { encoding: 'latin1', maxBuffer: 1 << 30 });
          const problems = (r.stderr || '').split('\n').filter((l) => /error|warn/i.test(l)).slice(0, 20);
          if (r.status !== 0) problems.unshift('dwgread exit ' + r.status);
          const dxf = path.join(dir, 'libredwg-' + path.basename(f, '.dwg') + '.dxf');
          const c = spawnSync(lr2dxf, ['-y', '-o', dxf, f], { encoding: 'latin1', maxBuffer: 1 << 30 });
          if (c.status !== 0 || !fs.existsSync(dxf)) problems.push('dwg2dxf failed: ' + String(c.stderr).slice(-300));
          res.set(f, { dxf, problems });
        }
        return res;
      },
    });
  }
  const dxfrw = path.join(base, 'libdxfrw/dwg2dxf');
  if (fs.existsSync(dxfrw)) {
    out.push({
      name: 'libdxfrw (LibreCAD dwg2dxf)',
      run(files, dir) {
        const res = new Map();
        for (const f of files) {
          const dxf = path.join(dir, 'libdxfrw-' + path.basename(f, '.dwg') + '.dxf');
          const r = spawnSync(dxfrw, [f, '-y', '-v2000', dxf], { encoding: 'latin1', maxBuffer: 1 << 30 });
          const problems = /Success/.test(r.stdout) && fs.existsSync(dxf) ? [] : ['dwg2dxf: ' + (r.stdout + r.stderr).trim().slice(-300)];
          res.set(f, { dxf, problems, encoding: 'utf8' });   // libdxfrw writes UTF-8 text into its R2000 DXF
        }
        return res;
      },
    });
  }
  const oda = path.join(base, 'oda/AppRun');
  let xvfb = null;
  try { xvfb = execFileSync('sh', ['-c', 'command -v xvfb-run'], { encoding: 'utf8' }).trim(); } catch { /* none */ }
  if (fs.existsSync(oda) && xvfb) {
    out.push({
      name: 'ODA File Converter (audit on)',
      run(files, dir) {
        const inDir = path.join(dir, 'oda-in'), outDir = path.join(dir, 'oda-out');
        fs.rmSync(inDir, { recursive: true, force: true }); fs.rmSync(outDir, { recursive: true, force: true });
        fs.mkdirSync(inDir, { recursive: true }); fs.mkdirSync(outDir, { recursive: true });
        for (const f of files) fs.copyFileSync(f, path.join(inDir, path.basename(f)));
        spawnSync(xvfb, ['-a', oda, inDir, outDir, 'ACAD2018', 'DXF', '0', '1', '*.dwg'], { encoding: 'utf8', timeout: 600000 });
        const res = new Map();
        for (const f of files) {
          const stem = path.basename(f, '.dwg');
          const dxf = path.join(outDir, stem + '.dxf'), err = dxf + '.err';
          const problems = [];
          if (fs.existsSync(err)) problems.push(...fs.readFileSync(err, 'utf8').trim().split('\n').slice(0, 10));
          if (!fs.existsSync(dxf)) problems.push('no DXF written');
          res.set(f, { dxf, problems });
        }
        return res;
      },
    });
  }
  return out;
}
