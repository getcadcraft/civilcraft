/* SPDX-License-Identifier: Apache-2.0 */
/**
 * objects-lib.mjs — builder M's helpers for the non-graphical objects / multileader / passthrough checks
 * (tools/dwg-test/objects-*.mjs). Oracles are black boxes: the ODA File Converter is run, its DXF is read by a
 * small DXF tag reader here (group codes per the public DXF reference) — no DWG library source is involved.
 *
 *   oda(files, dir, { format: 'DXF'|'DWG', version: 'ACAD2018' }) → Map(file → { out, err: string|null })
 *   odaEach(files, dir, { conc }) → Promise<same Map>   one converter run per file (a file the converter cannot
 *                                    read stops its whole batch), `conc` at a time
 *   dxfTags(text) → [[code, value]…]
 *   dxfSummary(path) → { objects: {TYPE: n}, entities: {TYPE: n}, handles: Set, dicts: {path: [names]}, byHandle: Map }
 *   libredwg(file) → { errors: [lines], typed: [{ type, line }], warnings: [lines] }   (dwgread -v2; type = the object
 *                    dwgread was decoding when it printed the error)
 *   libdxfrw(file, dir) → { ok, text }
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RD = path.join(ROOT, 'tools/civilcraft-test/venv/dwg-readers');
const ODA = path.join(RD, 'oda/AppRun');

export function oda(files, dir, { format = 'DXF', version = 'ACAD2018' } = {}) {
  const inDir = path.join(dir, 'oda-in'), outDir = path.join(dir, 'oda-out');
  fs.rmSync(inDir, { recursive: true, force: true }); fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(inDir, { recursive: true }); fs.mkdirSync(outDir, { recursive: true });
  for (const f of files) fs.copyFileSync(f, path.join(inDir, path.basename(f)));
  const xvfb = execFileSync('sh', ['-c', 'command -v xvfb-run'], { encoding: 'utf8' }).trim();
  spawnSync(xvfb, ['-a', ODA, inDir, outDir, version, format, '0', '1', '*.dwg'], { encoding: 'utf8', timeout: 900000 });
  const res = new Map();
  for (const f of files) {
    const stem = path.basename(f, '.dwg');
    const out = path.join(outDir, stem + (format === 'DXF' ? '.dxf' : '.dwg'));
    const errF = out + '.err';
    const final = path.join(dir, path.basename(out).replace(/(\.\w+)$/, '.oda$1'));
    if (fs.existsSync(out)) fs.renameSync(out, final); else fs.rmSync(final, { force: true });
    res.set(f, { out: fs.existsSync(final) ? final : null, err: fs.existsSync(errF) ? fs.readFileSync(errF, 'utf8').trim() : null });
  }
  return res;
}

export async function odaEach(files, dir, { format = 'DXF', version = 'ACAD2018', conc = 4 } = {}) {
  const xvfb = execFileSync('sh', ['-c', 'command -v xvfb-run'], { encoding: 'utf8' }).trim();
  const res = new Map();
  let next = 0;
  const one = (f, i) => new Promise((resolve) => {
    const work = path.join(dir, 'oda-' + i);
    const inDir = path.join(work, 'in'), outDir = path.join(work, 'out');
    fs.rmSync(work, { recursive: true, force: true });
    fs.mkdirSync(inDir, { recursive: true }); fs.mkdirSync(outDir, { recursive: true });
    fs.copyFileSync(f, path.join(inDir, path.basename(f)));
    const p = spawn(xvfb, ['-a', ODA, inDir, outDir, version, format, '0', '1', '*.dwg'], { stdio: 'ignore' });
    const t = setTimeout(() => p.kill('SIGKILL'), 600000);
    p.on('exit', () => {
      clearTimeout(t);
      const stem = path.basename(f, '.dwg');
      const out = path.join(outDir, stem + (format === 'DXF' ? '.dxf' : '.dwg'));
      const errF = out + '.err';
      const final = path.join(path.dirname(f), stem + '.oda' + (format === 'DXF' ? '.dxf' : '.dwg'));
      if (fs.existsSync(out)) fs.renameSync(out, final); else fs.rmSync(final, { force: true });
      res.set(f, { out: fs.existsSync(final) ? final : null, err: fs.existsSync(errF) ? fs.readFileSync(errF, 'utf8').trim() : null });
      fs.rmSync(work, { recursive: true, force: true });
      resolve();
    });
  });
  const worker = async () => { while (next < files.length) { const i = next++; await one(files[i], i); } };
  await Promise.all(Array.from({ length: Math.min(conc, files.length) }, worker));
  return res;
}

export function dxfTags(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  for (let i = 0; i + 1 < lines.length; i += 2) out.push([parseInt(lines[i], 10), lines[i + 1]]);
  return out;
}

/** OBJECTS and ENTITIES (+ BLOCKS) summary of a DXF file. */
export function dxfSummary(file) {
  const tags = dxfTags(fs.readFileSync(file, 'latin1'));
  const objects = {}, entities = {}, byHandle = new Map();
  let section = null, cur = null;
  const recs = [];
  for (let i = 0; i < tags.length; i++) {
    const [c, v] = tags[i];
    if (c === 0) {
      if (v === 'SECTION') { section = tags[i + 1][1]; cur = null; continue; }
      if (v === 'ENDSEC') { section = null; cur = null; continue; }
      cur = { type: v, section, tags: [] };
      recs.push(cur);
      continue;
    }
    if (cur) cur.tags.push([c, v]);
  }
  for (const r of recs) {
    const h = r.tags.find((t) => t[0] === 5 || t[0] === 105);
    r.handle = h ? h[1].toUpperCase() : null;
    r.owner = (r.tags.find((t) => t[0] === 330) || [])[1];
    if (r.handle) byHandle.set(r.handle, r);
    if (r.section === 'OBJECTS') objects[r.type] = (objects[r.type] || 0) + 1;
    else if ((r.section === 'ENTITIES' || r.section === 'BLOCKS') && !['BLOCK', 'ENDBLK', 'SEQEND', 'VERTEX', 'ATTRIB'].includes(r.type)) entities[r.type] = (entities[r.type] || 0) + 1;
  }
  // dictionary tree from the named-object dictionary (the first OBJECTS record)
  const dicts = {};
  const firstObj = recs.find((r) => r.section === 'OBJECTS');
  const walk = (r, p, depth) => {
    if (!r || depth > 8 || !/DICTIONARY/.test(r.type)) return;
    const names = [];
    for (let k = 0; k < r.tags.length; k++) {
      if (r.tags[k][0] === 3) {
        const name = r.tags[k][1], ref = (r.tags[k + 1] || [])[1];
        const child = ref && byHandle.get(ref.toUpperCase());
        names.push(name + ':' + (child ? child.type : '?'));
        walk(child, p + '/' + name, depth + 1);
      }
    }
    dicts[p || '/'] = names.sort();
  };
  walk(firstObj, '', 0);
  return { objects, entities, byHandle, dicts, recs };
}

export function libredwg(file) {
  const r = spawnSync(path.join(RD, 'libredwg/bin/dwgread'), ['-v2', file], { encoding: 'latin1', maxBuffer: 1 << 30, timeout: 600000 });
  const ls = (r.stderr || '').split('\n');
  // each error line with the type of the object dwgread was decoding ("Add entity REGION [..]" before it)
  const typed = [];
  let cur = '';
  for (const l of ls) { const m = /^Add (?:entity|object) (\S+)/.exec(l); if (m) cur = m[1]; if (/error/i.test(l)) typed.push({ type: cur, line: l.trim() }); }
  return { status: r.status, errors: ls.filter((l) => /error/i.test(l)), typed, warnings: ls.filter((l) => /warn/i.test(l)) };
}

export function libdxfrw(file, dir) {
  const dxf = path.join(dir, 'libdxfrw-' + path.basename(file, '.dwg') + '.dxf');
  const r = spawnSync(path.join(RD, 'libdxfrw/dwg2dxf'), [file, '-y', '-v2000', dxf], { encoding: 'latin1', maxBuffer: 1 << 30, timeout: 600000 });
  return { ok: /Success/.test(r.stdout) && fs.existsSync(dxf), text: (r.stdout + r.stderr).trim().slice(-300) };
}
