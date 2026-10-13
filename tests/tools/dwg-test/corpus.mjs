#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * corpus.mjs — build the cc-dwg test corpus and its ground truth (outside the repo, in testfiles/dwg-corpus: it is
 * large and made by the ODA File Converter). Public sources only since 0.4 — no client drawings.
 *
 *   node tools/dwg-test/corpus.mjs [--force] [--no-truth] [--quick] [--files a,b] [--versions AC1015,orig]
 *
 * Sources: every .dwg under testfiles/dwg-samples (Autodesk's public sample drawings) and the repo's fixtures/dwg and
 * fixtures/folder (recursive; fixtures/README.md). Corpus files whose source is gone are removed.
 * Identical files (same sha256) are kept once; the rest get readable unique names (slug of the file
 * name, "-<sha6>" on a clash).
 *   testfiles/dwg-corpus/orig/<name>.dwg              the source as it came (its own version)
 *   testfiles/dwg-corpus/<AC10xx>/<name>.dwg          saved by the ODA File Converter (ACAD2000 … ACAD2018, audit on)
 *   testfiles/dwg-corpus/_truth/<dir>/<name>.dxf      ODA → DXF 2018 of each corpus file (audit on; .err beside it when ODA repaired)
 *   testfiles/dwg-corpus/_truth/<dir>/<name>.json     ezdxf dump of that DXF in the common entity form (lib/dump.py)
 *   testfiles/dwg-corpus/_truth/<dir>/<name>.meta.json   corpus sha256 it was made from, ODA time/peak MB, problems
 *   testfiles/dwg-corpus/manifest.json                sources + files: source, version, size, sha256, ODA notes
 * Cached: a corpus file is re-made only when its source's sha256 changed (or --force); truth only when
 * the corpus file's sha256 changed. ODA runs ≤ 6 at once (one Xvfb display each).
 */
import fs from 'node:fs';
import path from 'node:path';
import { CORPUS, TRUTH, TESTFILES, REPO, ODA_VERSIONS, TAG_TO_ODA, RELEASE, sha256File, readJson, writeJson, mkdirp, slug, pool, odaConvert, dumpDxf, arg, flag, list, log, ODA_SLOTS } from './lib/util.mjs';

export const SOURCE_DIRS = [path.join(TESTFILES, 'dwg-samples'), path.join(REPO, 'fixtures/dwg'), path.join(REPO, 'fixtures/folder')];
export const MANIFEST = path.join(CORPUS, 'manifest.json');
export const DIRS = ['orig', ...Object.values(ODA_VERSIONS)];
export const QUICK = /^example-20\d\d$/;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (/\.dwg$/i.test(e.name)) out.push(p);
  }
  return out;
}

export function loadManifest() { return readJson(MANIFEST, null); }

/** The corpus files to test, after --quick / --files / --versions filters. */
export function selectFiles(manifest, { quick = false, files = null, versions = null } = {}) {
  return manifest.files.filter((f) => f.ok
    && (!quick || QUICK.test(f.name))
    && (!files || files.some((x) => f.name === x || f.name.includes(x)))
    && (!versions || versions.includes(f.dir) || versions.includes(f.version)));
}

export const truthPaths = (f) => {
  const b = path.join(TRUTH, f.dir, f.name);
  return { dxf: b + '.dxf', json: b + '.json', meta: b + '.meta.json' };
};

async function main() {
  const force = flag('--force');
  const quick = flag('--quick');
  const onlyFiles = list(arg('--files'));
  const onlyDirs = list(arg('--versions'));
  const old = loadManifest() || { sources: [], files: [] };
  const oldFile = new Map(old.files.map((f) => [f.dir + '/' + f.name, f]));

  // ---- sources
  const paths = SOURCE_DIRS.flatMap((d) => walk(d)).sort();
  const bySha = new Map();
  const sources = [];
  const used = new Set();
  for (const p of paths) {
    const sha = sha256File(p);
    const size = fs.statSync(p).size;
    const head = Buffer.alloc(6); const fd = fs.openSync(p, 'r'); fs.readSync(fd, head, 0, 6, 0); fs.closeSync(fd);
    const tag = /^AC\d{4}$/.test(head.toString('latin1')) ? head.toString('latin1') : null;
    const rel = p.startsWith(REPO + path.sep) ? path.relative(REPO, p) : path.relative(TESTFILES, p);
    if (bySha.has(sha)) { sources.push({ source: rel, sha256: sha, size, version: tag, duplicateOf: bySha.get(sha).name }); continue; }
    let name = slug(path.basename(p, path.extname(p)));
    if (used.has(name)) name += '-' + sha.slice(0, 6);
    used.add(name);
    const s = { source: rel, abs: p, sha256: sha, size, version: tag, name };
    bySha.set(sha, s); sources.push(s);
  }
  const uniq = sources.filter((s) => !s.duplicateOf);
  log(`${paths.length} source DWGs, ${uniq.length} distinct (${paths.length - uniq.length} duplicate by content)`);

  // ---- corpus files: orig + six ODA saves
  for (const d of DIRS) mkdirp(path.join(CORPUS, d));
  const jobs = [];
  for (const s of uniq) {
    const want = (d) => (!quick || QUICK.test(s.name)) && (!onlyFiles || onlyFiles.some((x) => s.name.includes(x))) && (!onlyDirs || onlyDirs.includes(d));
    for (const d of DIRS) {
      const key = d + '/' + s.name;
      const prev = oldFile.get(key);
      const target = path.join(CORPUS, d, s.name + '.dwg');
      if (!want(d)) { if (prev) jobs.push({ keep: prev }); continue; }
      if (!force && prev && prev.sourceSha256 === s.sha256 && (prev.ok ? fs.existsSync(target) : true)) { jobs.push({ keep: prev }); continue; }
      jobs.push({ s, d, target });
    }
  }
  const todo = jobs.filter((j) => !j.keep);
  log(`corpus: ${todo.length} file(s) to make, ${jobs.length - todo.length} cached`);
  let done = 0;
  const made = await pool(jobs, ODA_SLOTS, async (j) => {
    if (j.keep) return j.keep;
    const { s, d, target } = j;
    const rec = { name: s.name, dir: d, source: s.source, sourceSha256: s.sha256, sourceVersion: s.version, path: path.relative(CORPUS, target) };
    if (d === 'orig') {
      fs.copyFileSync(s.abs, target);
      Object.assign(rec, { version: s.version, made: 'copy of the source', ok: !!s.version, odaErr: [] });
      if (!s.version) rec.note = 'not a DWG file (no ACxxxx tag)';
    } else {
      fs.rmSync(target, { force: true }); fs.rmSync(target + '.err', { force: true });
      const r = await odaConvert(s.abs, TAG_TO_ODA[d], 'DWG', path.dirname(target), { stem: s.name });
      Object.assign(rec, { version: d, made: `ODA File Converter ${TAG_TO_ODA[d]} DWG, audit on`, ok: !!r.out, odaErr: r.err, odaMs: Math.round(r.ms), odaPeakMB: r.peakMB && +r.peakMB.toFixed(1) });
      if (!r.out) rec.note = 'ODA could not save it: ' + (r.err.join(' ').replace(/\S*\/in\//g, '') || 'no output');
    }
    if (rec.ok) {
      rec.size = fs.statSync(target).size;
      rec.sha256 = sha256File(target);
      const h = Buffer.alloc(6); const fd = fs.openSync(target, 'r'); fs.readSync(fd, h, 0, 6, 0); fs.closeSync(fd);
      rec.version = h.toString('latin1');
    }
    done++; if (!flag('--quiet')) process.stdout.write(`\r  made ${done}/${todo.length}   `);
    return rec;
  });
  if (todo.length) log('');

  // drop corpus files whose source is gone
  const live = new Set(made.map((f) => f.dir + '/' + f.name));
  for (const f of old.files) if (!live.has(f.dir + '/' + f.name)) for (const p of [path.join(CORPUS, f.path), ...Object.values(truthPaths(f))]) fs.rmSync(p, { force: true });

  const manifest = {
    generated: new Date().toISOString(),
    note: 'Public sources only (testfiles/dwg-samples, the repo fixtures). Made by tools/dwg-test/corpus.mjs.',
    sources: sources.map(({ abs, ...r }) => r),
    files: made.sort((a, b) => a.name.localeCompare(b.name) || DIRS.indexOf(a.dir) - DIRS.indexOf(b.dir)),
  };
  writeJson(MANIFEST, manifest);

  // ---- ground truth: ODA → DXF 2018 → ezdxf dump
  if (!flag('--no-truth')) await makeTruth(manifest, { force, quick, files: onlyFiles, versions: onlyDirs });
  writeJson(MANIFEST, manifest);

  const ok = manifest.files.filter((f) => f.ok);
  const bytes = ok.reduce((n, f) => n + f.size, 0);
  log(`corpus ready: ${ok.length} files (${(bytes / 1048576).toFixed(1)} MB) from ${uniq.length} drawings × ${DIRS.length} (orig + ${Object.keys(ODA_VERSIONS).length} versions); ${manifest.files.length - ok.length} could not be made`);
  for (const f of manifest.files.filter((x) => !x.ok)) log(`  - ${f.dir}/${f.name}: ${f.note}`);
  const truthy = ok.filter((f) => f.truth?.ok).length;
  log(`truth: ${truthy}/${ok.length} dumped${ok.some((f) => f.truth?.odaErr?.length) ? `, ${ok.filter((f) => f.truth?.odaErr?.length).length} with an ODA .err` : ''}`);
}

export async function makeTruth(manifest, { force = false, quick = false, files = null, versions = null } = {}) {
  const sel = selectFiles(manifest, { quick, files, versions });
  const jobs = sel.map((f) => {
    const t = truthPaths(f);
    const meta = readJson(t.meta);
    const fresh = !force && meta && meta.sha256 === f.sha256 && meta.reader === 'dump.py/5' && (meta.ok ? fs.existsSync(t.json) : true);
    return { f, t, meta, fresh };
  });
  const todo = jobs.filter((j) => !j.fresh);
  log(`truth: ${todo.length} to make, ${jobs.length - todo.length} cached`);
  let done = 0;
  await pool(jobs, ODA_SLOTS, async (j) => {
    if (j.fresh) { j.f.truth = summary(j.meta); return; }
    const { f, t } = j;
    mkdirp(path.dirname(t.dxf));
    let r;
    if (!force && j.meta && j.meta.sha256 === f.sha256 && j.meta.ok && fs.existsSync(t.dxf)) {   // only the dump changed: keep ODA's DXF
      r = { out: t.dxf, err: j.meta.odaErr || [], ms: j.meta.odaMs, peakMB: j.meta.odaPeakMB };
    } else {
      for (const p of [t.dxf, t.dxf + '.err', t.json]) fs.rmSync(p, { force: true });
      r = await odaConvert(path.join(CORPUS, f.path), 'ACAD2018', 'DXF', path.dirname(t.dxf), { stem: f.name });
    }
    const meta = { sha256: f.sha256, reader: 'dump.py/5', ok: false, odaErr: r.err, odaMs: Math.round(r.ms), odaPeakMB: r.peakMB && +r.peakMB.toFixed(1), made: new Date().toISOString() };
    if (r.out) {
      const d = await dumpDxf(r.out, t.json);
      meta.dumpMs = Math.round(d.ms);
      if (d.ok) {
        const dump = readJson(t.json);
        Object.assign(meta, { ok: true, entities: dump.entities.length, total: dump.total, audit: dump.audit, dxfSize: fs.statSync(r.out).size });
      } else meta.error = 'ezdxf: ' + d.error;
    } else meta.error = 'ODA wrote no DXF' + (r.err.length ? ': ' + r.err.join(' ') : '');
    writeJson(t.meta, meta);
    f.truth = summary(meta);
    done++; if (!flag('--quiet')) process.stdout.write(`\r  truth ${done}/${todo.length}   `);
  });
  if (todo.length) log('');
}

const summary = (m) => ({ ok: m.ok, entities: m.entities, odaErr: m.odaErr, odaMs: m.odaMs, odaPeakMB: m.odaPeakMB, error: m.error });

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(1); });
