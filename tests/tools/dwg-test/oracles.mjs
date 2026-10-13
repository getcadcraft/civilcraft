/* SPDX-License-Identifier: Apache-2.0 */
/**
 * oracles.mjs — every DWG reader the harness knows, run as a black box on one file.
 *
 *   READERS = [{ id, name, available() }]
 *   runReader(id, file, { work, keep }) → { id, opened, problems[], errors, warnings, set|null, ms, peakMB, note?, built? }
 *     set = entities in the common form (lib/dump.py on the reader's DXF, or normalize.mjs)
 *     ms  = the reader's own time: LibreDWG = dwgread -v2, libdxfrw = dwg2dxf, ODA = DWG → DXF 2018,
 *           libredwg-web = dwg_read_data + convert (module load excluded), ours = readDwg
 *     peakMB = max RSS of the reader's process (/usr/bin/time -v; for JS: the whole node process)
 *
 * Readers: ours (lib/dwg readDwg via ours-run.mjs; "not built yet" until it exists), LibreDWG 0.14 CLI
 * (dwgread -v2: ERROR lines = errors, Warning lines = warnings; dwg2dxf → DXF), libredwg-web 0.7.17
 * (lwweb-run.mjs), libdxfrw (LibreCAD's dwg2dxf -v2000; "Success" or not; its DXF text is UTF-8),
 * ODA File Converter (DWG → DXF 2018, audit on, under Xvfb; a .err = it had to repair or could not read).
 */
import fs from 'node:fs';
import path from 'node:path';
import { READERS as RDIR, HERE, PYTHON, readJson, runTimed, odaConvert, dumpDxf, mkdirp } from './lib/util.mjs';

const LR = path.join(RDIR, 'libredwg/bin');
const DXFRW = path.join(RDIR, 'libdxfrw/dwg2dxf');

export const READERS = [
  { id: 'ours', name: 'Ours (cc-dwg)', short: 'Ours', available: () => true },
  { id: 'libredwg', name: 'LibreDWG 0.14 CLI', short: 'LibreDWG', available: () => fs.existsSync(path.join(LR, 'dwgread')) },
  { id: 'lwweb', name: 'libredwg-web 0.7.17', short: 'libredwg-web', available: () => fs.existsSync(path.join(HERE, '../../public_html/assets/vendor/libredwg-web/current/dist/libredwg-web.js')) },
  { id: 'libdxfrw', name: 'libdxfrw (LibreCAD dwg2dxf)', short: 'libdxfrw', available: () => fs.existsSync(DXFRW) },
  { id: 'oda', name: 'ODA File Converter (truth)', short: 'ODA', available: () => fs.existsSync(path.join(RDIR, 'oda/AppRun')) },
];
export const READER = Object.fromEntries(READERS.map((r) => [r.id, r]));

const lines = (s) => String(s || '').split('\n').map((l) => l.trim()).filter(Boolean);
function tally(ls) {   // unique problem lines with counts, most frequent first
  const m = new Map();
  for (const l of ls) { const k = l.replace(/\b\d+\/[0-9A-F]+\b|@\d+|\b0x[0-9a-f]+\b|\b\d{2,}\b/gi, '#'); m.set(k, (m.get(k) || 0) + 1); }
  return [...m].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, n]) => (n > 1 ? `${n}× ${k}` : k));
}

async function dumpInto(res, dxf, json, opts = {}) {
  const d = await dumpDxf(dxf, json, opts);
  if (d.ok) { res.set = readJson(json); res.dumpMs = Math.round(d.ms); } else { res.problems.push('ezdxf could not read its DXF: ' + d.error); res.opened = false; }
}

export async function runReader(id, file, { work, keep = false } = {}) {
  mkdirp(work);
  const stem = path.join(work, id);
  const res = { id, opened: false, problems: [], errors: 0, warnings: 0, set: null, ms: null, peakMB: null };
  try {
    if (id === 'ours' || id === 'lwweb') {
      const script = path.join(HERE, id === 'ours' ? 'ours-run.mjs' : 'lwweb-run.mjs');
      const out = stem + '.out.json';
      const args = id === 'ours' ? [script, 'read', file, out] : [script, file, out];
      const r = await runTimed(process.execPath, ['--max-old-space-size=8192', ...args], { timeout: 300000, encoding: 'utf8' });
      res.peakMB = r.peakMB;
      const o = readJson(out);
      if (!o) {
        res.problems.push(r.timedOut ? 'timed out after 300 s' : `crashed (exit ${r.status}${r.signal ? ' ' + r.signal : ''}): ` + lines(r.stderr).slice(-3).join(' | '));
        res.errors = 1;
        return res;
      }
      if (o.built === false) { res.built = false; res.note = o.why; return res; }
      res.opened = !!o.opened; res.ms = o.ms;
      if (o.error) { res.problems.push(o.error); res.errors++; }
      const errLines = lines(r.stderr).filter((l) => /error/i.test(l)), warnLines = lines(r.stderr).filter((l) => /warn/i.test(l));
      if (id === 'lwweb') { res.errors += errLines.length; res.warnings = warnLines.length; res.problems.push(...tally(errLines)); }
      if (id === 'ours') { res.notes = o.notes || []; res.unknown = o.unknown || {}; res.version = o.version; }
      res.set = o.set || null;
      if (res.set && id === 'lwweb') res.unknown = {};
      if (!keep) fs.rmSync(out, { force: true });
      return res;
    }
    if (id === 'libredwg') {
      const r = await runTimed(path.join(LR, 'dwgread'), ['-v2', file], { timeout: 300000 });
      res.ms = r.ms; res.peakMB = r.peakMB;
      const ls = lines(r.stderr);
      const errs = ls.filter((l) => /^ERROR/i.test(l)), warns = ls.filter((l) => /^Warning/i.test(l));
      res.errors = errs.length; res.warnings = warns.length;
      if (r.status !== 0) res.problems.push(`dwgread exit ${r.status}${r.timedOut ? ' (timed out)' : ''}`);
      res.problems.push(...tally(errs));
      const dxf = stem + '.dxf';
      const c = await runTimed(path.join(LR, 'dwg2dxf'), ['-y', '-o', dxf, file], { timeout: 300000 });
      res.dxfMs = c.ms; res.dxfPeakMB = c.peakMB;
      if (c.status !== 0 || !fs.existsSync(dxf)) { res.problems.push(`dwg2dxf failed (exit ${c.status}): ` + lines(c.stderr).filter((l) => /error/i.test(l)).slice(-2).join(' | ')); }
      if (fs.existsSync(dxf)) { res.opened = true; await dumpInto(res, dxf, stem + '.json'); }
      if (!keep) for (const p of [dxf, stem + '.json']) fs.rmSync(p, { force: true });
      return res;
    }
    if (id === 'libdxfrw') {
      const dxf = stem + '.dxf';
      const r = await runTimed(DXFRW, [file, '-y', '-v2000', dxf], { timeout: 300000 });
      res.ms = r.ms; res.peakMB = r.peakMB;
      const ok = /Success/.test(r.stdout) && fs.existsSync(dxf);
      if (!ok) { res.problems.push('dwg2dxf: ' + (lines(r.stdout + '\n' + r.stderr).slice(-2).join(' | ') || `exit ${r.status}`)); res.errors = 1; }
      if (ok) { res.opened = true; await dumpInto(res, dxf, stem + '.json', { encoding: 'utf8' }); }
      if (!keep) for (const p of [dxf, stem + '.json']) fs.rmSync(p, { force: true });
      return res;
    }
    if (id === 'oda') {
      const o = await odaConvert(file, 'ACAD2018', 'DXF', work, { stem: 'oda' });
      res.ms = o.ms; res.peakMB = o.peakMB;
      res.problems.push(...o.err.filter((l) => !/^OdError thrown during readFile of drawing/.test(l) || o.err.length === 1));
      res.errors = o.err.length ? 1 : 0;
      if (o.out) { res.opened = true; await dumpInto(res, o.out, stem + '.json'); }
      if (!keep && o.out) for (const p of [o.out, o.out + '.err', stem + '.json']) fs.rmSync(p, { force: true });
      return res;
    }
    throw new Error('unknown reader ' + id);
  } catch (e) {
    res.problems.push('harness: ' + String(e.message || e));
    return res;
  }
}

export { PYTHON };
