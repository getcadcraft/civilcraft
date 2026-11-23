/* SPDX-License-Identifier: Apache-2.0 */
/**
 * open-async.js — opening a big project off the page (0.11 PERF.33: session civil-11, then perf-finish-11 lane civil).
 *
 * One module Worker does the heavy parts of an open, so the page keeps answering:
 *   - the project file: read (the File itself is handed over) and JSON.parse'd in the Worker; the survey points come back as columns
 *     (project-rows.js pointColumns: typed arrays by transfer + two joined strings), the rest of the file as a plain object; the page
 *     makes the point objects in slices (a yield between slices), then Project.fromJSON(rest, { pts, total }) reads the rest as before;
 *   - the existing-ground surface: the points' own TIN (buildSurface) or a TIN read from the file (surfaceFromFaces), the same tin.js;
 *   - what the first scene asks of that surface: stats(), outline() and the contours at the display interval (contour-smooth.js, the
 *     display's smoothing), packed as typed arrays. The page rebuilds `new Surface(...)`, gives it the stats and the outline it would have
 *     worked out itself, and puts surface and contours into the project's memo ('eg', 'contours:eg'), so p.eg() and p.contours() build nothing.
 *
 *   await parseProjectAsync(fileOrText, { max, onStage })  → { obj, pts, total } | null (no Worker: the caller parses as before)
 *   await primeSurface(project, { onStage })             → true when the surface (and its contours) were built off the page
 *   buildSurfaceAsync(input, { extras })                  → { surface, report } as buildSurface(input); here when there is no Worker
 *   openWorkerState()                                     → 'idle' | 'worker' | 'main'
 *
 * The Worker is built from the files as served (fetched through import.meta.resolve, so the app's import map and offline copy apply), its
 * imports pointed at absolute or blob: URLs (a Worker has no import map). Its messages are the strings tin.js would have said, tagged, so the
 * page says them in the person's language (decode()). Any failure falls back to the page, with a console warning.
 */
import { buildSurface, surfaceFromFaces, Surface } from './tin.js';
import { t } from './i18n.js';
import { PointTable } from './point-table.js';   // 0.11: the points stay typed arrays from the Worker to the project
import { cleanBlk } from './block-points.js';

export const ASYNC_FROM = 20000;   // fewer points than this are triangulated in well under a frame budget; no Worker round trip
export const PARSE_ASYNC_FROM = 2 * 1048576;   // project files smaller than this parse in well under a frame budget
const SLICE = 50000;   // LandXML point objects made per slice on the page

let worker = null;   // Promise<Worker | null>
let state = 'idle';
let seq = 0;
const pending = new Map();
export const openWorkerState = () => state;

const TAG = '\u0001';
/** A string the Worker's stand-in t() made → the person's own wording; any other string stays as it is. */
function decode(s) {
  if (typeof s !== 'string' || s[0] !== TAG) return s;
  try { const [k, p] = JSON.parse(s.slice(1)); return p ? t(k, p) : t(k); } catch { return s; }
}

async function text(url) { const r = await fetch(url); if (!r.ok) throw new Error('could not load ' + url + ' (' + r.status + ')'); return r.text(); }
const blob = (src) => URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
const yieldNow = () => new Promise((r) => setTimeout(r, 0));

// lines [{ z?, pts:[{x,y}], closed? }] ↔ typed arrays (the Worker packs, the page unpacks: the same objects as tin.js / contour-smooth.js make)
const PACK = `function packLines(lines) {
  let n = 0; for (const l of lines) n += l.pts.length;
  const offs = new Int32Array(lines.length + 1), xy = new Float64Array(2 * n), z = new Float64Array(lines.length), closed = new Uint8Array(lines.length);
  let k = 0;
  lines.forEach((l, i) => { offs[i] = k; z[i] = l.z === undefined ? NaN : l.z; closed[i] = l.closed ? 1 : 0; for (const p of l.pts) { xy[2 * k] = p.x; xy[2 * k + 1] = p.y; k++; } });
  offs[lines.length] = k;
  return { offs, xy, z, closed };
}`;
function unpackLines(pk, asContours) {
  const out = new Array(pk.z.length);
  for (let i = 0; i < out.length; i++) {
    const pts = new Array(pk.offs[i + 1] - pk.offs[i]);
    for (let k = pk.offs[i], j = 0; k < pk.offs[i + 1]; k++, j++) pts[j] = { x: pk.xy[2 * k], y: pk.xy[2 * k + 1] };
    out[i] = asContours ? { z: pk.z[i], pts, closed: pk.closed[i] === 1 } : pts;
  }
  return out;
}
const bufs = (pk) => (pk ? [pk.offs.buffer, pk.xy.buffer, pk.z.buffer, pk.closed.buffer] : []);

function startWorker() {
  if (worker) return worker;
  worker = (async () => {
    if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL?.createObjectURL !== 'function' || typeof import.meta.resolve !== 'function') return null;
    try {
      const rpUrl = new URL(import.meta.resolve('robust-predicates'), location.href).href, dUrl = import.meta.resolve('delaunator');
      const [tin, del, cs, rows, dk, lists, tx, ptab, pstream] = await Promise.all([text(import.meta.resolve('./tin.js')), text(dUrl), text(import.meta.resolve('./contour-smooth.js')), text(import.meta.resolve('./project-rows.js')), text(import.meta.resolve('./desckeys.js')), text(import.meta.resolve('./landxml-lists.js')), text(import.meta.resolve('./textin.js')), text(import.meta.resolve('./point-table.js')), text(import.meta.resolve('./project-stream.js'))]);
      const stub = blob(`export const t = (k, p) => '${TAG}' + JSON.stringify([k, p || null]);`);
      const delBlob = blob(del.split(`from 'robust-predicates'`).join(`from '${rpUrl}'`));
      const src = tin.split('from "./i18n.js"').join(`from '${stub}'`).split(`from 'delaunator'`).join(`from '${delBlob}'`).split(`from 'robust-predicates'`).join(`from '${rpUrl}'`);
      const reach = /from\s+["']\.{0,2}\/|from\s+["'][a-z]/;
      if (reach.test(src.replace(/from '(?:blob:|https?:)[^']*'/g, '')) || reach.test(cs) || reach.test(rows) || reach.test(dk) || reach.test(lists) || reach.test(tx) || reach.test(ptab) || reach.test(pstream)) throw new Error('a file of the open worker has an import the worker cannot reach');
      const body = `import { buildSurface, surfaceFromFaces } from '${blob(src)}';
import { smoothContours } from '${blob(cs)}';
import { pointColumns, writeRow } from '${blob(rows)}';
import { figures, cleanDescKeys, cleanLineCodes, parseDesc } from '${blob(dk)}';
import { cutLists } from '${blob(lists)}';
import { decodePartsAsync, parseJsonParts } from '${blob(tx)}';
import { BlockWriter, pointBlocks, transferList } from '${blob(ptab)}';
import { ProjectStream } from '${blob(pstream)}';
/** A list of strings → one '\\u0000'-joined string when none holds that character (cheap to send), else the list itself. */
const joinIds = (a) => { for (const x of a) if (x === undefined || x.indexOf('\\u0000') >= 0) return null; return a.join('\\u0000'); };
/** The blocks of cutLists for the page: numbers as typed arrays (moved), ids and face words as one string each. A Faces block that follows
 *  a Pnts block is also given as indexes into that block (what readLandXml makes when its Definition has just that one list of points). */
function packBlocks(blocks) {
  const out = [], tr = [];
  let lastPnts = -1;
  blocks.forEach((b, k) => {
    if (b.kind === 'Pnts') {
      const n = b.pts.length, xyz = new Float64Array(3 * n);
      for (let i = 0; i < n; i++) { const p = b.pts[i]; xyz[3 * i] = p.x; xyz[3 * i + 1] = p.y; xyz[3 * i + 2] = p.z; }
      const j = joinIds(b.ids);
      out.push({ kind: 'Pnts', n, xyz, ids: j === null ? b.ids : null, idsJoined: j }); tr.push(xyz.buffer);
      lastPnts = k;
    } else {
      let resolved = null;
      if (lastPnts === k - 1) {
        const p = blocks[k - 1], at = new Map();
        for (let i = 0; i < p.ids.length; i++) at.set(p.ids[i], i);
        resolved = new Int32Array(b.faces.length);
        for (let i = 0; i < b.faces.length; i++) { const v = at.get(b.faces[i]); resolved[i] = v === undefined ? -1 : v; }
        tr.push(resolved.buffer);
      }
      const j = joinIds(b.faces);
      out.push({ kind: 'Faces', hidden: b.hidden, n: b.faces.length, words: j === null ? b.faces : null, wordsJoined: j, resolved, against: resolved ? k - 1 : -1 });
    }
  });
  return { out, tr };
}
${PACK}
/** The survey lines a line code shapes (desckeys.js figures over the points with an elevation, only the codes with a line code: what
 *  Project.figures(null, { coded: true }) gives), as indexes into the kept rows. Only the points of those codes are made into objects. */
function figuresOf(obj, parts) {
  const sf = obj && typeof obj.surface === 'object' && obj.surface ? obj.surface : {};
  const keys = cleanDescKeys(sf.descKeys), lineCodes = cleanLineCodes(sf.lineCodes), info = parts.dict.map((d) => parseDesc(d, lineCodes));
  const coded = new Set();
  for (const b of parts.blocks) for (let k = 0; k < b.n; k++) if (b.z[k] === b.z[k]) { const q = info[b.d[k]]; if (q.code && q.ctrl) coded.add(q.code); }
  const out = [];
  if (coded.size) {
    const pts = [];
    let i = 0;
    for (const b of parts.blocks) for (let k = 0; k < b.n; k++, i++) if (b.z[k] === b.z[k] && coded.has(info[b.d[k]].code)) pts.push({ n: b.nj.slice(b.no[k], b.no[k + 1]), d: parts.dict[b.d[k]], i });
    for (const f of figures(pts, { keys, lineCodes })) if (f.coded) out.push({ code: f.code, group: f.group, closed: f.closed, coded: f.coded, idx: Int32Array.from(f.pts, (p) => p.i) });
  }
  return { keys: JSON.stringify([keys, lineCodes]), list: out };
}
/** The project file read as it streams in (project-stream.js): the points into blocks, the rest JSON.parse'd. → { obj, parts, total } */
async function readProject(m) {
  const w = new BlockWriter(), st = new ProjectStream({ max: m.max, rowOf: writeRow, writer: w });
  const size = m.file ? m.file.size : m.text.length;
  let got = 0, last = 0;
  const tick = () => { const now = Date.now(); if (now - last > 250) { last = now; self.postMessage({ id: m.id, progress: { stage: 'read', done: got, of: size, points: w.count } }); } };
  if (m.file) {
    const r = m.file.stream().pipeThrough(new TextDecoderStream()).getReader();
    for (;;) { const { done, value } = await r.read(); if (done) break; st.push(value); got += value.length; tick(); }
  } else {
    for (let i = 0; i < m.text.length; i += 4194304) { st.push(m.text.slice(i, i + 4194304)); got = Math.min(m.text.length, i + 4194304); tick(); }
  }
  const r = st.end();
  const obj = r.rest.length === 1 ? JSON.parse(r.rest[0]) : parseJsonParts(r.rest);
  let parts, total = r.total;
  if (r.found === 'one' && obj && typeof obj === 'object' && !Array.isArray(obj)) parts = w.done();
  else { const cols = pointColumns(obj && typeof obj === 'object' ? obj.points : null, m.max); total = cols.total; parts = pointBlocks(cols); }
  if (obj && typeof obj === 'object') delete obj.points;
  return { obj, parts, total };
}
function finish(id, r, ex) {
  const s = r.surface;
  if (!s) { self.postMessage({ id, surface: null, report: r.report }); return; }
  const out = { X: s.X, Y: s.Y, Z: s.Z, tris: s.tris, ox: s.ox, oy: s.oy, constrainedEdges: s.constrainedEdges };
  let extras = null;
  if (ex) {
    const stats = s.stats(), outline = packLines(s.outline().map((pts) => ({ pts })));
    const c = ex.contours ? smoothContours(s, ex.interval, { level: ex.smooth }) || [] : null;
    extras = { stats, outline, contours: c ? packLines(c) : null };
  }
  const tr = [out.X.buffer, out.Y.buffer, out.Z.buffer, out.tris.buffer];
  if (extras) for (const pk of [extras.outline, extras.contours]) if (pk) tr.push(pk.offs.buffer, pk.xy.buffer, pk.z.buffer, pk.closed.buffer);
  self.postMessage({ id, surface: out, report: r.report, extras }, tr);
}
self.onmessage = async (e) => {
  const m = e.data, id = m.id;
  try {
    if (m.op === 'parse') {
      const { obj, parts, total } = await readProject(m);
      const figs = m.figures && parts.count ? figuresOf(obj, parts) : null;
      self.postMessage({ id, obj, parts, total, figs }, [...transferList(parts), ...(figs ? figs.list.map((f) => f.idx.buffer) : [])]);
    } else if (m.op === 'landxml') {
      const text = await decodePartsAsync(m.file);
      const cut = cutLists(text);
      if (!cut) { self.postMessage({ id, none: true }); return; }
      const { out, tr } = packBlocks(cut.blocks);
      self.postMessage({ id, rest: cut.rest, tag: cut.tag, blocks: out }, tr);
    } else if (m.op === 'faces') {
      const n = m.px.length, pts = new Array(n), faces = new Array(m.faces.length / 3);
      for (let i = 0; i < n; i++) pts[i] = Number.isNaN(m.px[i]) ? null : { x: m.px[i], y: m.py[i], z: m.pz[i] };
      for (let f = 0; f < faces.length; f++) faces[f] = [m.faces[3 * f], m.faces[3 * f + 1], m.faces[3 * f + 2]];
      finish(id, surfaceFromFaces({ pts, faces }), m.extras);
    } else {
      const { xs, ys, zs, breaklines, boundary, maxEdge } = m;
      self.postMessage({ id, progress: { stage: 'surface', points: xs.length } });
      // 0.11 (the cap lifted): buildSurface only walks the points (tin.js triangulate reads x, y, z in order and keeps none of them), so they are
      // handed over as one object read again for each point, not 10 million objects: the page and its Workers share one 4 GB heap in Chrome
      const points = { length: xs.length, *[Symbol.iterator]() { const o = { x: 0, y: 0, z: 0 }; for (let i = 0; i < xs.length; i++) { o.x = xs[i]; o.y = ys[i]; o.z = zs[i]; yield o; } } };
      finish(id, buildSurface({ points, breaklines, boundary, maxEdge }), m.extras);
    }
  } catch (err) { self.postMessage({ id, error: String(err && err.message || err) }); }
};
self.postMessage({ ready: true });`;
      const w = new Worker(blob(body), { type: 'module' });
      await new Promise((ok, fail) => {
        const to = setTimeout(() => fail(new Error('the open worker did not start')), 15000);
        w.addEventListener('message', function ready(e) { if (e.data?.ready) { clearTimeout(to); w.removeEventListener('message', ready); ok(); } });
        w.addEventListener('error', (e) => { clearTimeout(to); fail(new Error(e.message || 'the open worker failed to load')); }, { once: true });
      });
      w.addEventListener('message', (e) => {
        const p = pending.get(e.data?.id);
        if (!p) return;
        if (e.data.progress) { try { p.onProgress?.(e.data.progress); } catch { /* a status line only */ } return; }   // 0.11: how far a big open has got
        pending.delete(e.data.id);
        if (e.data.error) p.reject(Object.assign(new Error(e.data.error), { fromWorker: true }));
        else { state = 'worker'; p.resolve(e.data); }
      });
      w.addEventListener('error', () => {
        worker = Promise.resolve(null);
        for (const [id, p] of pending) { pending.delete(id); p.reject(new Error('the open worker failed')); }
      });
      return w;
    } catch (err) {
      if (typeof console !== 'undefined') console.warn('civilcraft: opening on the page instead of in a worker:', err?.message || err);
      return null;
    }
  })();
  return worker;
}

function ask(w, msg, transfer = [], onProgress = null) {
  return new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject, onProgress }); w.postMessage({ ...msg, id }, transfer); });
}

/** The Worker's answer → { surface, report } with the extras put on the surface (stats, outline) and `contours` (unpacked) beside it. */
function adopt(d) {
  const { surface: s, report } = d;
  report.notes = (report.notes || []).map(decode); report.errors = (report.errors || []).map(decode);
  let surface = null, contours = null;
  if (s) {
    surface = new Surface(s.X, s.Y, s.Z, s.tris, s.ox, s.oy); surface.constrainedEdges = s.constrainedEdges;
    if (d.extras) {
      surface._stats = d.extras.stats;
      surface._outline = unpackLines(d.extras.outline, false);
      if (d.extras.contours) contours = unpackLines(d.extras.contours, true);
    }
  }
  return { surface, report, contours };
}

/** Same result as buildSurface(input). `points` are { x, y, z } with a z; they are copied into the Worker as typed arrays. */
export async function buildSurfaceAsync(input, opts = {}) {
  const w = opts.worker === false ? null : await startWorker();
  if (!w) { state = 'main'; return buildSurface(input.cols ? opts.rebuild() : input); }
  let xs, ys, zs;
  if (input.cols) ({ xs, ys, zs } = input.cols);   // 0.11: Project.egColumns(), no point object made (moved to the Worker: the caller lets them go)
  else {
    const n = input.points.length; xs = new Float64Array(n); ys = new Float64Array(n); zs = new Float64Array(n);
    for (let i = 0; i < n; i++) { const p = input.points[i]; xs[i] = p.x; ys[i] = p.y; zs[i] = p.z; }
  }
  const back = input.cols ? null : input;   // the page's fallback needs the points
  try {
    const d = await ask(w, { op: 'surface', xs, ys, zs, breaklines: input.breaklines || [], boundary: input.boundary || null, maxEdge: input.maxEdge || 0, extras: opts.extras || null }, [xs.buffer, ys.buffer, zs.buffer], opts.onProgress || null);
    if (opts.beforeAdopt) opts.beforeAdopt();   // 0.11: let go of what the new surface replaces before its contours are made (same task: nothing draws in between)
    const r = adopt(d);
    return opts.extras ? r : { surface: r.surface, report: r.report };
  } catch (err) {
    state = 'main'; if (typeof console !== 'undefined') console.warn('civilcraft: the surface worker failed, building here:', err?.message || err);
    if (back) return buildSurface(back);
    if (opts.rebuild) return buildSurface(opts.rebuild());   // the points again, as objects (the columns went to the Worker)
    throw err;
  }
}

/** surfaceFromFaces(tin) in the Worker (a TIN read from a file); null when the faces are not plain integer triples (the page then builds it). */
async function facesSurfaceAsync(tin, extras) {
  const w = await startWorker();
  if (!w) return null;
  const n = tin.pts.length, px = new Float64Array(n), py = new Float64Array(n), pz = new Float64Array(n), faces = new Int32Array(3 * tin.faces.length);
  for (let i = 0; i < n; i++) { const p = tin.pts[i]; if (p) { px[i] = p.x; py[i] = p.y; pz[i] = p.z; } else px[i] = NaN; }
  for (let f = 0; f < tin.faces.length; f++) {
    const q = tin.faces[f];
    if (!Array.isArray(q) || q.length !== 3) return null;
    for (let k = 0; k < 3; k++) { const v = q[k]; if (!Number.isInteger(v) || v < -2147483648 || v > 2147483647) return null; faces[3 * f + k] = v; }
  }
  try { return adopt(await ask(w, { op: 'faces', px, py, pz, faces, extras }, [px.buffer, py.buffer, pz.buffer, faces.buffer])); }
  catch (err) { state = 'main'; if (typeof console !== 'undefined') console.warn('civilcraft: the surface worker failed, building here:', err?.message || err); return null; }
}

/**
 * Read and parse a project file in the Worker. `src` is a File (handed over, read there) or a string. → { obj (the file without its points),
 * pts (fromJSON's point rows, made here in slices), total (the file's row count) } or null when there is no Worker. A file that is not JSON
 * throws the parser's message, as JSON.parse would have.
 */
export async function parseProjectAsync(src, { max = Infinity, onStage = null } = {}) {
  const w = await startWorker();
  if (!w) return null;
  let d;
  const prog = onStage ? (q) => onStage(q.stage, q) : null;
  try { d = await ask(w, typeof src === 'string' ? { op: 'parse', text: src, max, figures: true } : { op: 'parse', file: src, max, figures: true }, [], prog); }
  catch (err) { if (err.fromWorker) throw new Error(err.message); state = 'main'; console.warn('civilcraft: the open worker failed, parsing here:', err?.message || err); return null; }
  // 0.11 (the cap lifted): the Worker's blocks become the project's point table as they are (no point object is made); block references
  // are cleaned here, as fromJSON cleans them (cleanBlk)
  const table = PointTable.fromParts(d.parts);
  for (const b of table.blocks) if (b.bk) { for (const [k, raw] of b.bk) { const c = cleanBlk(raw); if (c) b.bk.set(k, c); else b.bk.delete(k); } if (!b.bk.size) b.bk = null; }
  return { obj: d.obj, table, total: d.total, figs: d.figs };
}

/**
 * After Project.fromJSON(obj, pre): the line-code figures the Worker found go into the project's memo ('fig:*', what p.figures() reads),
 * made of the project's own point objects, when the description keys and line codes it read are the ones the project holds.
 */
export function primeFigures(project, pre) {
  const f = pre?.figs, s = project.state.surface;
  if (!f || project.pointTable !== pre.table) return false;
  const keys = JSON.stringify([s.descKeys, s.lineCodes]);
  if (keys !== f.keys) return false;
  const t = project.pointTable;
  const list = f.list.map((x) => ({ code: x.code, group: x.group, pts: Array.from(x.idx, (i) => t.get(i)), closed: x.closed, coded: x.coded }));
  project.memo('fig:*:coded', project.pointsVersion + '|' + keys, () => list);   // what p.figures(null, { coded: true }) reads
  return true;
}

/**
 * A LandXML file's big lists (<Pnts>, <Faces>) read in the Worker (landxml-lists.js, the file decoded as the page decodes it), for
 * readLandXml(rest, { cut }). → { rest, cut } | null (no Worker, or no plain list in the file: the caller reads it as before). The point
 * objects are made here in slices; the faces are made by readLandXml (from the Worker's indexes when its Definition holds just that list).
 */
export async function readLandXmlListsAsync(file, { onStage = null } = {}) {
  const w = await startWorker();
  if (!w) return null;
  let d;
  try { d = await ask(w, { op: 'landxml', file }); } catch (err) { console.warn('civilcraft: the open worker could not read the LandXML lists, reading here:', err?.message || err); return null; }
  if (d.none) return null;
  const blocks = [];
  for (const b of d.blocks) {
    if (b.kind === 'Pnts') {
      const pts = new Array(b.n);
      for (let i = 0; i < b.n; i += SLICE) {
        for (let k = i, e = Math.min(b.n, i + SLICE); k < e; k++) pts[k] = { x: b.xyz[3 * k], y: b.xyz[3 * k + 1], z: b.xyz[3 * k + 2] };
        if (onStage) onStage('points', Math.min(b.n, i + SLICE), b.n);
        if (i + SLICE < b.n) await yieldNow();
      }
      blocks.push({ kind: 'Pnts', pts, ids: b.ids || (b.n ? b.idsJoined.split('\u0000') : []) });
    } else {
      let faces = b.words;
      blocks.push({ kind: 'Faces', hidden: b.hidden, get faces() { return faces || (faces = b.n ? b.wordsJoined.split('\u0000') : []); }, resolved: b.resolved, against: b.against });
    }
  }
  return { rest: d.rest, cut: { rest: d.rest, blocks, tag: d.tag } };
}

/** What the first scene asks of the existing ground, to be worked out in the Worker with the surface: the display's interval and smoothing. */
function extrasFor(project) {
  const d = project.state.display;
  return { contours: true, interval: Number(d.interval) || 1, smooth: d.smooth || 'none' };
}
const contourKey = (project) => { const d = project.state.display; return project.surfaceDeps() + '|' + project.padsDeps('eg') + '|' + d.interval + '|' + (d.smooth || ''); };

/**
 * Build a project's existing-ground surface off the page and hand it to the project (its memo 'eg', the key p.eg() reads, and the
 * contours at the display interval, 'contours:eg'), so the first p.eg() and p.contours() after an open build nothing. Takes the points'
 * own TIN (no gridding method, no flat fix) with at least `minPoints` points, and a TIN read from the file with at least that many
 * vertices. Returns false (and does nothing) otherwise.
 */
export async function primeSurface(project, { onStage = null, minPoints = ASYNC_FROM, beforeAdopt = null } = {}) {
  const s = project.state.surface;
  if ((s.method && s.method !== 'tin') || s.flatFix > 0) return false;
  const deps = project.surfaceDeps(), ex = extrasFor(project), cKey = contourKey(project);
  let r;
  if (s.tin) {
    if (!Array.isArray(s.tin.pts) || s.tin.pts.length < minPoints) return false;
    if (onStage) onStage('surface', s.tin.pts.length);
    r = await facesSurfaceAsync(s.tin, ex);
    if (!r) return false;
  } else {
    const cols = project.egColumns();   // 0.11: typed arrays straight from the point table
    if (cols.n < minPoints) return false;
    if (onStage) onStage('surface', cols.n);
    r = await buildSurfaceAsync({ cols, breaklines: project.egBreaklines(), boundary: s.boundary, maxEdge: Number(s.maxEdge) || 0 }, { extras: ex, beforeAdopt, rebuild: () => ({ points: project.egPoints(), breaklines: project.egBreaklines(), boundary: s.boundary, maxEdge: Number(s.maxEdge) || 0 }) });
  }
  if (project.surfaceDeps() !== deps) return false;   // the project changed while the Worker worked: p.eg() builds it as usual
  const eg = { surface: r.surface, report: r.report };
  project.memo('eg', deps, () => eg);
  if (r.contours && r.surface && contourKey(project) === cKey) project.memo('contours:eg', cKey, () => r.contours);
  return true;
}

/**
 * 0.11 (the cap lifted): Project.bigEg — after an edit of a project with at least BIG_EG points, p.eg() asks this instead of triangulating on
 * the page: the new surface (and its first-scene contours) is built in the Worker, and until it is in, p.eg() keeps answering with the
 * surface it had (`stale`, with `rebuilding: true` on the result); the project then says 'surface' so the views draw again. One job at a time;
 * an edit while it runs starts the next one when it ends. null = build it on the page (no Worker).
 */
const jobs = new WeakMap();
export function rebuildOffPage(project, deps, stale) {
  if (typeof Worker === 'undefined') return null;
  let j = jobs.get(project);
  if (!j) {
    j = { deps, run: null, t0: performance.now() };
    j.done = new Promise((res) => { j.resolve = res; });
    jobs.set(project, j);
    const go = () => {
      j.deps = project.surfaceDeps();
      const t1 = performance.now();
      // the surface on screen and its contours are let go when the new one arrives (before its contours are unpacked), and the app's hook drops
      // what the views hold of them: at 10 M points two surfaces with their contours do not fit the tab's heap beside the Worker's
      // (the 'eg' entry stays, with its old deps and no surface, so p.eg() never builds on the page meanwhile)
      const beforeAdopt = () => {
        const c = project.cache.get('eg'); if (c) c.value = { surface: null, report: { notes: [], errors: [] } };
        project.cache.delete('contours:eg'); project._staleSurface = undefined;
        try { rebuildOffPage.onHandover?.(project); } catch { /* the views' copy only */ }
      };
      j.run = primeSurface(project, { minPoints: 0, beforeAdopt }).catch((err) => { console.warn('civilcraft: the surface rebuild off the page failed:', err?.message || err); return false; }).then((ok) => {
        console.info('civilcraft: surface rebuilt off the page: ' + (ok ? 'taken' : 'not taken') + ' after ' + Math.round(performance.now() - t1) + ' ms');
        if (!ok && project.surfaceDeps() === j.deps) { jobs.delete(project); j.resolve(); project._noOffPage = j.deps; project.emit('surface'); return; }   // not taken (or failed): p.eg() builds it on the page
        if (project.surfaceDeps() !== j.deps) { go(); return; }   // edited meanwhile: once more
        jobs.delete(project); j.resolve();
        project.lastRebuildMs = performance.now() - j.t0;
        project.emit('surface');
      });
    };
    go();
  }
  return stale ? { ...stale, rebuilding: true } : { surface: null, report: { notes: [], errors: [] }, rebuilding: true };
}
export const rebuilding = (project) => jobs.has(project);
/** The running rebuild of this project (a Promise), or null. The autosave waits for it (Project.idle) before it writes a first copy. */
export const rebuildDone = (project) => jobs.get(project)?.done || null;
