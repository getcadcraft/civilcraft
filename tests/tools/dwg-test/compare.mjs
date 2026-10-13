#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * compare.mjs — the cc-dwg side-by-side comparison (docs/DWG-LIB-SPEC.md "Done means" 3).
 *
 *   node tools/dwg-test/compare.mjs [--quick] [--files a,b] [--versions AC1015,orig] [--readers ours,libredwg,lwweb,libdxfrw]
 *                                   [--targets AC1015,AC1032] [--no-reader] [--no-writer] [--writer-from orig|all]
 *                                   [--jobs 8] [--fresh] [--keep]
 *   → dwg-comparison-report.html + .json at the repo root (partial runs → tmp/dwg-compare/)
 *
 * READER: every corpus file (testfiles/dwg-corpus, see README) × each reader: opened?, entity count,
 *   matched % vs the truth (ODA → DXF 2018 → ezdxf; by handle — libdxfrw by content, it renumbers
 *   handles), mismatches, unknown types, ms, peak MB. Totals per version and overall.
 * WRITER: inputs = CivilCraft's three test drawings (civil-cases.mjs) and every selected corpus file
 *   read by our reader; for each target AC1015…AC1032: written?, then ODA (.err?), LibreDWG (errors?),
 *   libdxfrw (Success?) and our reader, each with its entity match vs the source model (by content).
 *   Baseline rows: CivilCraft's own R2000 dwg-write.js (the seed) on the three drawings.
 * Our reader/writer plug in automatically once lib/dwg/index.js exports readDwg / writeDwg; until then
 * their cells say "not built yet". Results are cached per (input sha256, reader version, harness
 * version, truth) in tmp/dwg-compare/cache; --fresh ignores the cache. ≤ 8 jobs, ≤ 6 ODA at once.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { HERE, REPO, CORPUS, TMP, TAGS, RELEASE, readJson, writeJson, mkdirp, pool, arg, flag, list, sha256File, runTimed, log } from './lib/util.mjs';
import { loadManifest, selectFiles, truthPaths } from './corpus.mjs';
import { READERS, READER, runReader } from './oracles.mjs';
import { compareSets, countsBySpace } from './lib/match.mjs';
import { fromCivilList } from './lib/normalize.mjs';
import { renderHtml } from './lib/report-html.mjs';

const T0 = Date.now();
const QUICK = flag('--quick');
const FILES = list(arg('--files'));
const DIRS = list(arg('--versions'));
const ONLY = list(arg('--readers'));
const TARGETS = list(arg('--targets')) || TAGS;
const JOBS = Number(arg('--jobs', 8)) || 8;
const FRESH = flag('--fresh');
const KEEP = flag('--keep');
const WRITER_FROM = arg('--writer-from', 'all');
const CACHE = mkdirp(path.join(TMP, 'cache'));
const WORK = mkdirp(path.join(TMP, 'work'));

// ---------------------------------------------------------------- versions (cache keys)
const hashFiles = (files) => { const h = crypto.createHash('sha256'); for (const f of files) if (fs.existsSync(f)) h.update(f).update(fs.readFileSync(f)); return h.digest('hex').slice(0, 16); };
const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []).sort();
const HARNESS = hashFiles(['lib/normalize.mjs', 'lib/match.mjs', 'lib/dump.py', 'oracles.mjs', 'ours-run.mjs', 'lwweb-run.mjs'].map((f) => path.join(HERE, f)));
const LIBFILES = walk(path.join(REPO, 'lib/dwg')).filter((f) => /\.(m?js|json)$/.test(f));
const OURS = LIBFILES.length ? hashFiles(LIBFILES) : 'none';                       // writer runs: all of lib/dwg
// reader runs: only the files a read touches (the spec's ownership list, minus the writer's own files)
const WRITER_ONLY = /(^|\/)(bits-write|lz-r2004-write|r2007-write|container-write|objects-write|write|civil)\.js$/;
const OURS_R = LIBFILES.length ? hashFiles(LIBFILES.filter((f) => !WRITER_ONLY.test(f))) : 'none';
const VERSION = { ours: OURS_R, libredwg: '0.14', lwweb: '0.7.17', libdxfrw: 'dwg2dxf', oda: 'oda' };
const MATCH_BY = { libdxfrw: 'content' };

async function probeOurs() {
  const o = path.join(WORK, 'probe-ours.json');
  const ex = path.join(CORPUS, 'orig/example-2000.dwg');
  await runTimed(process.execPath, [path.join(HERE, 'ours-run.mjs'), 'read', ex, o], { timeout: 120000 });
  const r = readJson(o, {}); fs.rmSync(o, { force: true });
  const w = path.join(WORK, 'probe-ours-w.json');
  await runTimed(process.execPath, [path.join(HERE, 'ours-run.mjs'), 'write', path.join(TMP, 'civil/every-kind.json').replace(/^/, 'civil:'), 'AC1015', path.join(WORK, 'probe.dwg'), w], { timeout: 120000 });
  const ww = readJson(w, {}); fs.rmSync(w, { force: true });
  return { reader: r.built !== false, readerWhy: r.why, writer: ww.built !== false, writerWhy: ww.why };
}

const slim = (r) => {   // what the report keeps of a reader run
  const o = { opened: r.opened, built: r.built, note: r.note, errors: r.errors, warnings: r.warnings, problems: (r.problems || []).slice(0, 25), ms: r.ms == null ? null : Math.round(r.ms), peakMB: r.peakMB == null ? null : +r.peakMB.toFixed(1) };
  if (r.set) { o.count = r.set.entities.length; o.total = r.set.total; o.bySpace = countsBySpace(r.set); }
  if (r.unknown && Object.keys(r.unknown).length) o.unknown = r.unknown;
  if (r.notes?.length) o.notes = r.notes.slice(0, 40);
  if (r.version) o.version = r.version;
  return o;
};
const slimMatch = (m) => (m ? { pct: m.pct, matched: m.matched, explained: m.explained || 0, explainedBy: m.explainedBy || {}, mismatched: m.mismatched, missing: m.missing, extra: m.extra, truth: m.truth, got: m.got, byField: m.byField, typeCounts: m.typeCounts, details: m.details.slice(0, 150), samplesMissing: m.samplesMissing, samplesExtra: m.samplesExtra } : null);

let progress = { done: 0, total: 0, label: '' };
const tick = () => { progress.done++; if (!flag('--quiet') && process.stdout.isTTY) process.stdout.write(`\r  ${progress.label} ${progress.done}/${progress.total}   `); };

// ---------------------------------------------------------------- READER
async function readerSection(manifest, probe) {
  const files = selectFiles(manifest, { quick: QUICK, files: FILES, versions: DIRS });
  const readers = READERS.filter((r) => r.id !== 'oda' && r.available() && (!ONLY || ONLY.includes(r.id)));
  const jobs = [];
  for (const f of files) for (const r of readers) jobs.push({ f, r });
  progress = { done: 0, total: jobs.length, label: 'reader runs' };
  log(`READER: ${files.length} corpus files × ${readers.length} readers (+ ODA truth) = ${jobs.length} runs`);
  const truthCache = new Map();
  const truthOf = (f) => {   // loaded per job, never kept for the whole run (the biggest drawings are large)
    const t = truthPaths(f);
    const meta = readJson(t.meta);
    return { meta, set: meta?.ok ? readJson(t.json) : null };
  };
  const results = await pool(jobs, JOBS, async ({ f, r }) => {
    const t = truthPaths(f);
    const meta = readJson(t.meta) || {};
    if (r.id === 'ours' && !probe.reader) { tick(); return { key: f.dir + '/' + f.name, id: r.id, res: { built: false, note: probe.readerWhy || 'not built yet' } }; }
    const ck = path.join(CACHE, 'reader', r.id, `${f.sha256.slice(0, 24)}-${VERSION[r.id]}-${HARNESS}-${(meta.made || '').replace(/\W/g, '')}.json`);
    let res = !FRESH && readJson(ck);
    if (!res) {
      const work = fs.mkdtempSync(path.join(WORK, r.id + '-'));
      const run = await runReader(r.id, path.join(CORPUS, f.path), { work, keep: KEEP });
      let match = null;
      if (run.set) {
        const truth = truthOf(f).set;
        if (truth) match = compareSets(truth, run.set, { by: MATCH_BY[r.id] || 'handle' });
      }
      res = { ...slim(run), match: slimMatch(match) };
      if (run.built !== false) writeJson(ck, res);
      if (!KEEP) fs.rmSync(work, { recursive: true, force: true });
    }
    tick();
    return { key: f.dir + '/' + f.name, id: r.id, res };
  });
  if (process.stdout.isTTY) log('');
  void truthCache;
  const rows = files.map((f) => {
    const meta = readJson(truthPaths(f).meta) || {};
    const res = {};
    for (const x of results) if (x.key === f.dir + '/' + f.name) res[x.id] = x.res;
    res.oda = { opened: !!meta.ok, errors: meta.odaErr?.length ? 1 : 0, problems: (meta.odaErr || []).filter((l) => !/^OdError thrown during readFile of drawing/.test(l) || meta.odaErr.length === 1).map((l) => l.replace(/"\/[^"]*\//, '"')), ms: meta.odaMs, peakMB: meta.odaPeakMB, count: meta.entities ?? null, total: meta.total, truth: true, match: meta.ok ? { pct: 1, matched: meta.entities, truth: meta.entities, got: meta.entities, mismatched: 0, missing: 0, extra: 0 } : null, note: meta.error };
    // consensus: a mismatch vs ODA where another DWG reader read exactly the same value is probably how
    // ODA writes its DXF (or how the drawing really is), not a reader bug → marked, so nobody chases it
    const DWG_READERS = ['ours', 'libredwg', 'lwweb'];
    for (const id of DWG_READERS) {
      const m = res[id]?.match; if (!m?.details?.length) continue;
      let agreed = 0;
      for (const d of m.details) {
        d.agree = DWG_READERS.filter((o) => o !== id && res[o]?.match?.details?.some((x) => x.h === d.h && x.field === d.field && x.got === d.got)).map((o) => READER[o].short);
        if (d.agree.length) agreed++; else delete d.agree;
      }
      m.agreed = agreed;
    }
    return { name: f.name, dir: f.dir, version: f.version, release: RELEASE[f.version] || f.version, size: f.size, sha256: f.sha256, source: f.source, truth: { ok: !!meta.ok, entities: meta.entities ?? null, total: meta.total || {}, error: meta.error }, results: res };
  });
  return { readers: [...readers.map((r) => r.id), 'oda'], rows, totals: totals(rows, [...readers.map((r) => r.id), 'oda']) };
}

function totals(rows, ids) {
  const add = (acc, row) => {
    for (const id of ids) {
      const r = row.results[id]; if (!r) continue;
      const a = (acc[id] ||= { files: 0, built: 0, opened: 0, clean: 0, full: 0, matched: 0, explained: 0, explainedBy: {}, truth: 0, ms: 0, msN: 0, peakMB: 0, unknown: 0, failedTruth: 0 });
      a.files++;
      if (r.built === false) continue;
      a.built++;
      if (r.opened) a.opened++;
      if (r.opened && !r.errors) a.clean++;
      if (row.truth.ok) {
        a.truth += row.truth.entities || 0;
        if (r.match) { a.matched += r.match.matched; a.explained += r.match.explained || 0; for (const [k, n] of Object.entries(r.match.explainedBy || {})) a.explainedBy[k] = (a.explainedBy[k] || 0) + n; if ((r.match.pct === 1 || (r.match.mismatched === 0 && !r.match.missing)) && !r.match.extra) a.full++; }
      } else a.failedTruth++;
      if (r.ms != null) { a.ms += r.ms; a.msN++; }
      if (r.peakMB != null) a.peakMB = Math.max(a.peakMB, r.peakMB);
      if (r.unknown) a.unknown += Object.values(r.unknown).reduce((s, n) => s + n, 0);
    }
    return acc;
  };
  const per = {};
  for (const row of rows) add((per[row.dir] ||= {}), row);
  const overall = rows.reduce((acc, row) => add(acc, row), {});
  return { perDir: per, overall };
}

// ---------------------------------------------------------------- WRITER
async function writerSection(manifest, probe) {
  const civilDir = path.join(TMP, 'civil');
  const civil = ['fixture', 'every-kind', 'big'];
  const rows = [];
  const verifyIds = ['oda', 'libredwg', 'libdxfrw', 'ours'].filter((id) => READER[id].available() && (!ONLY || ONLY.includes(id) || id === 'oda'));

  // renamed: the writer's report.renamed (ours-run.mjs) — matched through it, counted as explained (match.mjs)
  async function verify(dwg, source, key, label, renamed = null) {
    const out = {};
    for (const id of verifyIds) {
      if (id === 'ours' && !probe.reader) { out.ours = { built: false, note: probe.readerWhy || 'not built yet' }; continue; }
      const sha = sha256File(dwg);
      const ck = path.join(CACHE, 'writer', id, `${sha.slice(0, 24)}-${VERSION[id]}-${HARNESS}-${key}.json`);
      let res = !FRESH && readJson(ck);
      if (!res) {
        const work = fs.mkdtempSync(path.join(WORK, 'w-' + id + '-'));
        const run = await runReader(id, dwg, { work, keep: KEEP });
        const src = typeof source === 'function' ? (source = source()) : source;   // lazy: loaded only on a cache miss
        const match = run.set && src ? compareSets(src, run.set, { by: 'content', renamed }) : null;
        res = { ...slim(run), match: slimMatch(match) };
        if (run.built !== false) writeJson(ck, res);
        if (!KEEP) fs.rmSync(work, { recursive: true, force: true });
      }
      out[id] = res;
    }
    void label;
    return out;
  }

  // the seed baseline: CivilCraft's own R2000 writer on its three drawings
  const seedRows = await pool(civil, 3, async (name) => {
    const list = readJson(path.join(civilDir, name + '.json'));
    const rep = readJson(path.join(civilDir, name + '.seed.report.json')) || {};
    const dwg = path.join(civilDir, name + '.seed.dwg');
    if (!list || !fs.existsSync(dwg)) return null;
    const source = fromCivilList(list, (rep.layers || []).map((l) => l.name));
    const hash = crypto.createHash('sha256').update(JSON.stringify(source.entities)).digest('hex').slice(0, 12);
    return { input: 'civil:' + name, kind: 'civil', writer: 'seed', target: 'AC1015', written: true, ms: Math.round(rep.ms), bytes: fs.statSync(dwg).size, notes: rep.notes || [], sourceCount: source.entities.length, readers: await verify(dwg, source, 'seed-' + hash, name) };
  });
  rows.push(...seedRows.filter(Boolean));
  log(`WRITER: seed baseline on ${seedRows.filter(Boolean).length} CivilCraft drawings verified`);

  if (!probe.writer) return { built: false, why: probe.writerWhy || 'not built yet', verifyIds, targets: TARGETS, rows, totals: writerTotals(rows) };

  const files = selectFiles(manifest, { quick: QUICK, files: FILES, versions: DIRS }).filter((f) => WRITER_FROM === 'all' || f.dir === WRITER_FROM);
  const inputs = [...civil.map((n) => ({ input: 'civil:' + n, kind: 'civil', src: 'civil:' + path.join(civilDir, n + '.json'), id: 'civil-' + n })),
    ...files.map((f) => ({ input: f.dir + '/' + f.name, kind: 'corpus', src: path.join(CORPUS, f.path), id: f.dir + '-' + f.name, sha: f.sha256 }))];
  const jobs = inputs.flatMap((i) => TARGETS.map((t) => ({ ...i, target: t })));
  progress = { done: 0, total: jobs.length, label: 'writer jobs' };
  log(`WRITER: ${inputs.length} inputs × ${TARGETS.length} versions = ${jobs.length} writes, each checked by ${verifyIds.length} readers`);
  const outDir = mkdirp(path.join(TMP, 'written'));
  const more = await pool(jobs, Math.max(2, Math.floor(JOBS / 2)), async (j) => {
    const dwg = path.join(mkdirp(path.join(outDir, j.id)), j.target + '.dwg');
    const oj = dwg + '.json';
    const ck = path.join(CACHE, 'write', `${(j.sha || j.id).slice(0, 24)}-${j.target}-${OURS}-${HARNESS}.json`);
    let w = !FRESH && fs.existsSync(dwg) && readJson(ck);
    if (w && !w.source && fs.existsSync(ck + '.src.gz')) w.source = () => JSON.parse(zlib.gunzipSync(fs.readFileSync(ck + '.src.gz')));
    if (!w) {
      const r = await runTimed(process.execPath, ['--max-old-space-size=8192', path.join(HERE, 'ours-run.mjs'), 'write', j.src, j.target, dwg, oj], { timeout: 300000, encoding: 'utf8' });
      w = readJson(oj) || { built: true, written: false, error: r.timedOut ? 'timed out after 300 s' : `crashed (exit ${r.status}): ` + String(r.stderr).trim().split('\n').slice(-3).join(' | ') };
      w.peakMB = r.peakMB && +r.peakMB.toFixed(1);
      if (w.built !== false) {   // the source model's entities go gzipped beside the entry (they can be 10+ MB)
        mkdirp(path.dirname(ck));
        if (w.source) fs.writeFileSync(ck + '.src.gz', zlib.gzipSync(JSON.stringify(w.source)));
        const { source, ...rest } = w; writeJson(ck, { ...rest, sourceCount: source?.entities?.length ?? null });
      }
      fs.rmSync(oj, { force: true });
    }
    const row = { input: j.input, kind: j.kind, writer: 'ours', target: j.target, written: !!w.written, error: w.error, ms: w.ms == null ? null : Math.round(w.ms), peakMB: w.peakMB, bytes: w.bytes, notes: (w.notes || []).slice(0, 30), sourceCount: w.sourceCount ?? w.source?.entities?.length ?? null };
    if (w.written && fs.existsSync(dwg)) {
      const head = fs.readFileSync(dwg).subarray(0, 6).toString('latin1');
      row.tag = head;
      row.readers = await verify(dwg, w.source, `${OURS}-${j.id}`, j.input, w.renamed);
    }
    tick();
    return row;
  });
  if (process.stdout.isTTY) log('');
  rows.push(...more);
  return { built: true, verifyIds, targets: TARGETS, rows, totals: writerTotals(rows) };
}

function writerTotals(rows) {
  const per = {};
  for (const r of rows) {
    const k = r.writer + ' ' + r.target;
    const a = (per[k] ||= { writer: r.writer, target: r.target, jobs: 0, written: 0, readers: {} });
    a.jobs++; if (r.written) a.written++;
    for (const [id, v] of Object.entries(r.readers || {})) {
      const b = (a.readers[id] ||= { runs: 0, opened: 0, clean: 0, full: 0, matched: 0, explained: 0, source: 0 });
      if (v.built === false) continue;
      b.runs++; if (v.opened) b.opened++; if (v.opened && !v.errors) b.clean++;
      if (v.match) { b.matched += v.match.matched; b.explained += v.match.explained || 0; b.source += v.match.truth; if ((v.match.pct === 1 || (v.match.mismatched === 0 && !v.match.missing)) && !v.match.extra) b.full++; }
    }
  }
  return per;
}

// ---------------------------------------------------------------- main
async function main() {
  const manifest = loadManifest();
  if (!manifest) { console.error('No corpus yet: node tools/dwg-test/corpus.mjs'); process.exit(1); }
  if (!fs.existsSync(path.join(TMP, 'civil/fixture.json'))) await runTimed(process.execPath, [path.join(HERE, 'civil-cases.mjs'), path.join(TMP, 'civil')], { timeout: 300000 });
  const probe = await probeOurs();
  log(`ours: reader ${probe.reader ? 'built' : 'not built yet'}, writer ${probe.writer ? 'built' : 'not built yet'} (lib/dwg ${OURS})`);
  const report = {
    generated: new Date().toISOString(), args: process.argv.slice(2), harness: HARNESS, libdwg: OURS, probe,
    corpus: { files: manifest.files.filter((f) => f.ok).length, drawings: new Set(manifest.files.map((f) => f.name)).size, generated: manifest.generated, sources: manifest.sources.length },
    readerNames: Object.fromEntries(READERS.map((r) => [r.id, r.name])),
  };
  if (!flag('--no-reader')) report.reader = await readerSection(manifest, probe);
  if (!flag('--no-writer')) report.writer = await writerSection(manifest, probe);
  report.seconds = Math.round((Date.now() - T0) / 1000);
  // The report lives at the repo root (owner, 2026-10-11): dwg-comparison-report.html + .json.
  // A partial run (--quick, --files, --versions, --no-reader/--no-writer) stays in tmp so it never
  // replaces the full report.
  const partial = ['--quick', '--files', '--versions', '--readers', '--targets', '--no-reader', '--no-writer'].some((f) => process.argv.includes(f));
  const out = partial ? mkdirp(TMP) : path.resolve(TMP, '../..');
  const base = path.join(out, 'dwg-comparison-report');
  writeJson(base + '.json', report);
  fs.writeFileSync(base + '.html', renderHtml(report));
  printSummary(report);
  log(`\nreport: ${base}.html (+ .json), ${report.seconds} s`);
}

function printSummary(rep) {
  const pct = (a, b) => (b ? (a === b ? '100%' : (Math.floor(1000 * a / b) / 10).toFixed(1) + '%') : '—');
  if (rep.reader) {
    const o = rep.reader.totals.overall;
    log('\nREADER (overall)        opened      no errors   matched     + explained   files 100%   mean ms   peak MB');
    for (const id of rep.reader.readers) {
      const a = o[id]; if (!a) continue;
      if (!a.built) { log(`  ${rep.readerNames[id].padEnd(22)} not built yet`); continue; }
      log(`  ${rep.readerNames[id].padEnd(22)} ${String(a.opened + '/' + a.built).padEnd(11)} ${String(a.clean + '/' + a.built).padEnd(11)} ${pct(a.matched, a.truth).padEnd(11)} ${pct(a.matched + a.explained, a.truth).padEnd(13)} ${String(a.full).padEnd(12)} ${String(a.msN ? Math.round(a.ms / a.msN) : '—').padEnd(9)} ${a.peakMB.toFixed(0)}`);
    }
  }
  if (rep.writer) {
    log(`\nWRITER: ${rep.writer.built ? 'ours built' : 'ours not built yet (' + rep.writer.why + ')'}`);
    for (const t of Object.values(rep.writer.totals)) {
      log(`  ${t.writer} ${t.target}: written ${t.written}/${t.jobs}; ` + Object.entries(t.readers).map(([id, b]) => `${id} opened ${b.opened}/${b.runs} clean ${b.clean} match ${pct(b.matched, b.source)} (+explained ${pct(b.matched + b.explained, b.source)})`).join('; '));
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
