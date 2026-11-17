/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tiler.js — builds the tiled octree ("CCT 1", spec § 5) from a stream of points. No DOM.
 *
 *   await buildCloud(source, store, { id, name, nodeCap, progress(f, phase), signal, resume, spillBytes, now }) → cloud
 *   await inspect(source) → info                      the header only: count, bounds, crs, units, attrs, estimates, notes
 *
 *   source  a File/Blob-like (las.js reads it: LAS 1.0–1.4, LAZ), or
 *           { points, count, min, max, scale?, crs?, unit?, zUnit?, name? }   points = () => (async) iterable, or an iterable;
 *           each item { x, y, z, cls?, inten?, rgb?:[r,g,b], flags? } or an array of them. The function form is re-run on resume
 *           (the first `read` points are skipped), so a source must give the same points in the same order each time.
 *
 * How it works (memory bounded by one bin, not by the cloud):
 *   1. read   the stream is cut into BINS (the octree cells of depth d0, chosen so a bin holds about 4 × nodeCap points); points are
 *             spilled to build/c/<seq>/<bin>.bin chunks (20 bytes a point) whenever spillBytes (default 64 MB) are buffered.
 *             A checkpoint (build/state.json) follows every spill: a closed tab resumes after the last spill.
 *   2. tile   per bin, top-down and additive: at each level the points nearest a regular grid (G × G × G cells per node, G a power of
 *             two) stay in the node, the rest go to the eight children, until a node holds ≤ nodeCap. The levels ABOVE the bins are
 *             sampled from every bin in turn: a grid cell of those levels never reaches over a bin edge, so each bin decides its
 *             own cells and the result equals one global top-down build. Upper nodes get a per-bin quota (nodeCap / bins under
 *             them) so they stay within the cap. Each bin writes its node files once; build/meta/<bin>.json is its checkpoint.
 *   3. merge  the per-bin parts of the upper nodes are joined, nodes.bin and cloud.json are written, build/ is removed.
 * Everything is deterministic: a resumed build is byte-identical to an uninterrupted one (except cloud.json `built`).
 *
 * Depth is limited to 14: a node at that depth keeps ALL its points even above nodeCap (only identical points get there).
 * LAS gives positions + class only (las.js scanPoints), so file clouds carry no rgb/intensity yet; iterator sources may.
 */
import { fail, PcError, dep, jsonBytes, parseJson, throwIfAborted, reporter, MAX_DEPTH } from './util.js';
import { encodeNode, decodeNode, encodeTable, openCloud } from './octree.js';
import { scanLazChunks } from './laz-stream.js';
import { createTilePool } from './tile-pool.js';
import { binPath, makeBinBuilder, loadBin, REC_BYTES } from './tile-bin.js';

export const TILER_VERSION = 1;

const hardwareThreads = () => (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || (typeof process !== 'undefined' && process.availableParallelism && process.availableParallelism()) || 2;
const isBlob = (s) => s && typeof s.slice === 'function' && typeof s.size === 'number';

export async function inspect(source) {
  if (isBlob(source)) {
    const h = await dep('las').readLasHeader(source);
    return {
      kind: h.compressed ? 'laz' : 'las', name: h.name || source.name || '', size: h.size, count: h.count, available: h.available, min: h.min, max: h.max, scale: h.scale, offset: h.offset,
      version: h.version, format: h.format, crs: h.crs, wkt: h.wkt, code: h.code, zUnit: h.zUnit, crsNote: h.crsNote, notes: h.notes || [],
      attrs: { rgb: false, intensity: false, class: true },
      estimate: estimate(h.available, h.min, h.max),
    };
  }
  if (source && source.count != null && source.min && source.max) {
    return { kind: 'points', name: source.name || '', size: 0, count: source.count, available: source.count, min: source.min, max: source.max, scale: source.scale || null, crs: source.crs || null, wkt: source.wkt || null, zUnit: source.zUnit || null, notes: [], attrs: { rgb: !!source.rgb, intensity: !!source.intensity, class: true }, estimate: estimate(source.count, source.min, source.max) };
  }
  return fail('bad_source');
}

/** What a build will need (bytes in the store, nodes) — positions are int32 (12 bytes) + class + flags per point. */
function estimate(count, min, max) {
  const bytes = Math.round(count * 14 * 1.04);
  return { storeBytes: bytes, nodes: Math.ceil(count / 30000), spillBytes: count * REC_BYTES };
}

async function openSource(source) {
  if (isBlob(source)) {
    const las = dep('las'), info = await inspect(source), h = await las.readLasHeader(source);
    return {
      info, count: h.available,
      // LAZ: chunk by chunk (laz-stream.js, PERF.25) so the heap holds one chunk, not the file; what that cannot read (variable chunks,
      // layered formats, no ChunkDecoder) fails BEFORE the first point and falls back to the app's whole-file reader.
      run: async (onPoint, o) => {
        const cb = (x, y, z, c) => onPoint(x, y, z, c, null);
        if (h.compressed && typeof las.lazPerf === 'function' && !(o && o.wholeFile)) {
          try { return await scanLazChunks(source, h, cb, { ...o, lazPerf: () => las.lazPerf() }); }
          catch (e) { if (e.code !== 'laz_stream_unsupported') throw e; }
        }
        return las.scanPoints(source, h, cb, o);
      },
      srcDesc: { name: info.name, size: info.size, kind: info.kind, mtime: source.lastModified || null },
    };
  }
  const info = await inspect(source), pts = source.points;
  if (!pts) fail('bad_source');
  return {
    info, count: info.count,
    run: async (onPoint, { signal, progress } = {}) => {
      const it = typeof pts === 'function' ? pts() : pts;
      let read = 0;
      const one = (p) => {
        onPoint(p.x, p.y, p.z, p.cls == null ? 0 : p.cls, p); read++;
        if ((read & 4095) === 0) { throwIfAborted(signal); if (progress) progress(Math.min(1, read / info.count)); }
      };
      if (it[Symbol.asyncIterator]) { for await (const item of it) { throwIfAborted(signal); if (Array.isArray(item)) item.forEach(one); else one(item); } }
      else for (const item of it) { if (Array.isArray(item)) item.forEach(one); else one(item); }
      return { read };
    },
    srcDesc: { name: info.name, size: 0, kind: 'points', mtime: null },
  };
}

// ------------------------------------------------------------------ bins

class BinBuf {
  constructor() { this.cap = 128; this.n = 0; this.ab = new ArrayBuffer(this.cap * REC_BYTES); this.i32 = new Int32Array(this.ab); this.u16 = new Uint16Array(this.ab); this.u8 = new Uint8Array(this.ab); }
  grow() { const ab = new ArrayBuffer(this.cap * 2 * REC_BYTES); new Uint8Array(ab).set(this.u8); this.cap *= 2; this.ab = ab; this.i32 = new Int32Array(ab); this.u16 = new Uint16Array(ab); this.u8 = new Uint8Array(ab); }
}

const pow2floor = (v) => 2 ** Math.floor(Math.log2(Math.max(1, v)));

function plan(info, nodeCap) {
  const min = info.min, max = info.max;
  let G = Math.max(4, Math.min(128, pow2floor(Math.sqrt(nodeCap / 4))));
  const scale = [0, 0, 0], origin = min.map((v) => Math.floor(v));
  let ext = 0;
  for (let a = 0; a < 3; a++) ext = Math.max(ext, max[a] - origin[a]);
  for (let a = 0; a < 3; a++) {
    const s = info.scale && info.scale[a] > 0 && info.scale[a] < 0.001 ? info.scale[a] : 0.001;
    scale[a] = Math.max(s, ext / 2.0e9);
  }
  const size = Math.max(1, ext * (1 + 1e-9) + 2 * Math.max(...scale));
  const logG = Math.log2(G);
  let d0 = info.count <= nodeCap ? 0 : Math.ceil(Math.log(info.count / (nodeCap * 4)) / Math.log(4));
  d0 = Math.max(0, Math.min(d0, logG, 7));
  return { G, scale, origin, size, d0 };
}

// ------------------------------------------------------------------ one bin

// ------------------------------------------------------------------ the build

export async function buildCloud(source, store, opts = {}) {
  const nodeCap = opts.nodeCap ?? 65536, signal = opts.signal || null, rep = reporter(opts.progress), spillBytes = opts.spillBytes ?? 64 * 1048576;
  if (!(nodeCap >= 16)) fail('bad_option', { nodeCap });
  const src = await openSource(source), info = src.info;
  if (!(src.count > 0)) fail('empty');
  const id = opts.id || String(info.name || 'cloud').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + src.count;
  const P = 'cct/' + id + '/';
  const putJson = (k, o) => store.put(P + k, jsonBytes(o));

  let st = null;
  const sb = await store.get(P + 'build/state.json');
  if (sb && opts.resume) {
    st = parseJson(sb);
    if (st.count !== src.count || st.nodeCap !== nodeCap) fail('resume_mismatch', { id });
  } else {
    for (const k of await store.list(P)) await store.delete(k);
    const pl = plan(info, nodeCap);
    st = {
      v: 1, phase: 'read', read: 0, seq: 0, count: src.count, nodeCap, G: pl.G, scale: pl.scale, origin: pl.origin, size: pl.size, d0: pl.d0,
      min: [1e300, 1e300, 1e300], max: [-1e300, -1e300, -1e300], classCounts: {}, hasRgb: !!info.attrs.rgb, hasInt: !!info.attrs.intensity, clamped: 0, binsDone: 0,
    };
  }
  const stateBytes = () => jsonBytes(st);
  const building = () => ({ phase: st.phase, read: st.read, binsDone: st.binsDone, count: st.count });
  const writeShell = () => putJson('cloud.json', { format: 'cct', version: 1, id, name: opts.name || info.name || id, source: src.srcDesc, count: st.count, building: building() });
  await writeShell();

  // ---------------------------------------------------------------- pass 1: read
  if (st.phase === 'read') {
    // chunks written after the last checkpoint belong to a lost run
    for (const k of await store.list(P + 'build/c/')) { const seq = Number(k.slice((P + 'build/c/').length).split('/')[0]); if (seq >= st.seq) await store.delete(k); }
    const { G, scale, origin, size, d0 } = st, B = 2 ** d0, skip = st.read;
    const binW = [size / B / scale[0], size / B / scale[1], size / B / scale[2]], ox = origin[0], oy = origin[1], oz = origin[2];
    const iw0 = 1 / binW[0], iw1 = 1 / binW[1], iw2 = 1 / binW[2], sx = 1 / scale[0], sy = 1 / scale[1], sz = 1 / scale[2], b1 = B - 1;
    let bins = new Map(), buffered = 0, seen = 0, chain = Promise.resolve(), chainErr = null;
    const mn = st.min.slice(), mx = st.max.slice(), cc = new Array(256).fill(0);
    for (const k of Object.keys(st.classCounts)) cc[k] = st.classCounts[k];
    let hasRgb = st.hasRgb, hasInt = st.hasInt, clamped = st.clamped;
    const checkpoint = (readAt, seq, list) => {
      const snap = { read: readAt, seq: seq + 1, min: mn.slice(), max: mx.slice(), cc: cc.slice(), hasRgb, hasInt, clamped };
      chain = chain.then(async () => {
        if (chainErr) return;
        try {
          for (const [bi, bytes] of list) await store.put(P + 'build/c/' + seq + '/' + bi + '.bin', bytes);
          st.read = snap.read; st.seq = snap.seq; st.min = snap.min; st.max = snap.max; st.hasRgb = snap.hasRgb; st.hasInt = snap.hasInt; st.clamped = snap.clamped;
          st.classCounts = {}; snap.cc.forEach((v, c) => { if (v) st.classCounts[c] = v; });
          await store.put(P + 'build/state.json', stateBytes());
          await writeShell();
        } catch (e) { chainErr = e; }
      });
    };
    let nextSeq = st.seq;
    const detach = () => {
      const list = [];
      for (const [bi, b] of bins) if (b.n) list.push([bi, new Uint8Array(b.ab, 0, b.n * REC_BYTES)]);
      bins = new Map(); buffered = 0;
      checkpoint(seen, nextSeq++, list);
    };
    const onPoint = (x, y, z, cls, p) => {
      seen++;
      if (seen <= skip) return;
      const qx = Math.round((x - ox) * sx), qy = Math.round((y - oy) * sy), qz = Math.round((z - oz) * sz);
      if (x < mn[0]) mn[0] = x; if (x > mx[0]) mx[0] = x; if (y < mn[1]) mn[1] = y; if (y > mx[1]) mx[1] = y; if (z < mn[2]) mn[2] = z; if (z > mx[2]) mx[2] = z;
      let bx = Math.floor(qx * iw0), by = Math.floor(qy * iw1), bz = Math.floor(qz * iw2);
      if (bx < 0 || bx > b1 || by < 0 || by > b1 || bz < 0 || bz > b1) { clamped++; bx = bx < 0 ? 0 : bx > b1 ? b1 : bx; by = by < 0 ? 0 : by > b1 ? b1 : by; bz = bz < 0 ? 0 : bz > b1 ? b1 : bz; }
      const bi = bx + B * (by + B * bz);
      let b = bins.get(bi);
      if (!b) { b = new BinBuf(); bins.set(bi, b); }
      if (b.n === b.cap) b.grow();
      const o = b.n * 5, o8 = b.n * REC_BYTES;
      b.i32[o] = qx; b.i32[o + 1] = qy; b.i32[o + 2] = qz;
      b.u8[o8 + 12] = cls; b.u8[o8 + 13] = p && p.flags ? p.flags & 255 : 0;
      b.u16[b.n * 10 + 7] = p && p.inten ? p.inten : 0;
      if (p && p.rgb) { b.u8[o8 + 16] = p.rgb[0]; b.u8[o8 + 17] = p.rgb[1]; b.u8[o8 + 18] = p.rgb[2]; hasRgb = true; }
      if (p && p.inten) hasInt = true;
      b.n++; cc[cls & 255]++;
      if ((buffered += REC_BYTES) >= spillBytes) detach();
    };
    let err = null;
    try {
      await src.run(onPoint, { signal, wholeFile: !!opts.wholeFile, progress: (f) => { rep(f * 0.4, 'read'); if (opts.onSlice) opts.onSlice(seen); } });
    } catch (e) { err = e; }
    if (!err) { try { throwIfAborted(signal); } catch (e) { err = e; } }
    if (!err && seen !== st.count) st.count = seen;   // a file cut short, or a header that is wrong: the points read are the truth
    if (!err) detach();
    await chain;
    if (chainErr) throw chainErr;
    if (err) { if (err.name === 'AbortError' && err.code !== 'aborted') throw new PcError('aborted'); throw err; }
    st.read = seen; st.phase = 'tile'; st.binsDone = 0;
    if (!st.clamped) st.clamped = clamped;
    await store.put(P + 'build/state.json', stateBytes());
    await writeShell();
  }

  // ---------------------------------------------------------------- pass 2: tile every bin
  const { G, scale, origin, size, d0 } = st;
  const chunkKeys = (await store.list(P + 'build/c/')).map((k) => { const r = k.slice((P + 'build/c/').length).split('/'); return { seq: Number(r[0]), bin: Number(r[1].replace('.bin', '')), key: k }; });
  const byBin = new Map();
  for (const c of chunkKeys) { if (!byBin.has(c.bin)) byBin.set(c.bin, []); byBin.get(c.bin).push(c); }
  const binList = [...byBin.keys()].sort((a, b) => a - b);
  if (st.phase === 'tile') {
    // quotas of the upper levels: nodeCap shared by the occupied bins under each ancestor
    const under = new Map();
    for (const b of binList) { const p = binPath(b, d0); for (let e = 0; e < d0; e++) { const a = p.slice(0, 1 + e); under.set(a, (under.get(a) || 0) + 1); } }
    const hasRgb = st.hasRgb, hasInt = st.hasInt, PT = { G, scale, origin, size, d0, nodeCap, hasRgb, hasInt };
    // 0.10 PERF.25: the bins are independent, so they are tiled by a pool of workers (opts.workers; by default 1 to 4 for 4 M points or
    // more, none below). Results are the same bytes either way; only the order they finish in differs, so binsDone (the resume point) only
    // moves over a finished PREFIX of the list.
    let pool = null, nWorkers = opts.workers != null ? opts.workers : (st.count >= 4e6 ? Math.min(4, Math.max(0, hardwareThreads() - 1)) : 0);
    if (nWorkers >= 1 && binList.length - st.binsDone > 1) pool = await createTilePool(Math.min(nWorkers, binList.length - st.binsDone), opts.spawnWorker || null);
    const build = pool ? null : makeBinBuilder(PT);
    let writeChain = Promise.resolve();
    const finished = new Set(); let prefix = st.binsDone, failed = null, lastShell = 0;
    const doBin = async (bi) => {
      const b = binList[bi], path = binPath(b, d0);
      const chunks = [];
      for (const c of byBin.get(b).sort((p, q) => p.seq - q.seq)) chunks.push(await store.get(c.key));
      const quotas = []; for (let e = 0; e < d0; e++) quotas.push(Math.max(1, Math.floor(nodeCap / under.get(path.slice(0, 1 + e)))));
      const out = pool ? await pool.run({ P: PT, b, path, chunks, quotas }) : build(b, loadBin(chunks, hasRgb, hasInt), quotas);
      const meta = [];
      for (const nd of out.nodes) { await store.put(P + 'n/' + nd.id + '.bin', nd.bytes); meta.push([nd.id, nd.count, nd.minZ, nd.maxZ, nd.cellSize, nd.bytes.length]); }
      for (const u of out.ups) await store.put(P + 'build/up/' + u.anc + '/' + b + '.bin', u.bytes);
      await store.put(P + 'build/meta/' + b + '.json', jsonBytes(meta));
      finished.add(bi);
      let moved = false;
      while (finished.has(prefix)) { finished.delete(prefix); prefix++; moved = true; }
      if (moved) {
        st.binsDone = prefix;
        // one writer at a time: a folder store writes to <key>.part and renames, so two puts of the same key at once would collide
        const shell = prefix - lastShell >= 4 || prefix === binList.length;
        if (shell) lastShell = prefix;
        writeChain = writeChain.then(async () => { await store.put(P + 'build/state.json', stateBytes()); if (shell) { await writeShell(); rep(0.4 + 0.55 * prefix / binList.length, 'tile'); } });
        await writeChain;
      }
    };
    try {
      let nextBin = st.binsDone;
      const lanes = Math.max(1, pool ? pool.size : 1);
      await Promise.all(Array.from({ length: lanes }, async () => {
        while (!failed && nextBin < binList.length) {
          throwIfAborted(signal);
          const bi = nextBin++;
          try { await doBin(bi); } catch (e) { failed = failed || e; }
        }
      }));
    } finally { if (pool) pool.close(); }
    if (failed) throw failed;
    throwIfAborted(signal);
    st.phase = 'merge';
    await store.put(P + 'build/state.json', stateBytes());
  }

  // ---------------------------------------------------------------- pass 3: merge the upper levels, write the table
  throwIfAborted(signal);
  const rows = new Map();   // id → { count, minZ, maxZ, cellSize, byteLength }
  for (const b of binList) {
    const m = parseJson(await store.get(P + 'build/meta/' + b + '.json'));
    for (const [nid, count, minZ, maxZ, cellSize, byteLength] of m) rows.set(nid, { count, minZ, maxZ, cellSize, byteLength });
  }
  const upKeys = await store.list(P + 'build/up/'), byAnc = new Map();
  for (const k of upKeys) { const r = k.slice((P + 'build/up/').length).split('/'); if (!byAnc.has(r[0])) byAnc.set(r[0], []); byAnc.get(r[0]).push({ bin: Number(r[1].replace('.bin', '')), key: k }); }
  for (const [anc, list] of [...byAnc].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    list.sort((p, q) => p.bin - q.bin);
    const parts = []; let total = 0;
    for (const e of list) { const d = decodeNode(await store.get(e.key)); parts.push(d); total += d.n; }
    const hasRgb = st.hasRgb, hasInt = st.hasInt;
    const a = { n: total, x: new Int32Array(total), y: new Int32Array(total), z: new Int32Array(total), cls: new Uint8Array(total), flags: new Uint8Array(total), inten: hasInt ? new Uint16Array(total) : null, rgb: hasRgb ? new Uint8Array(3 * total) : null };
    let o = 0, minZ = Infinity, maxZ = -Infinity;
    for (const d of parts) {
      a.x.set(d.x, o); a.y.set(d.y, o); a.z.set(d.z, o); a.cls.set(d.cls, o); a.flags.set(d.flags, o);
      if (hasInt) a.inten.set(d.inten, o); if (hasRgb) a.rgb.set(d.rgb, 3 * o);
      for (let k = 0; k < d.n; k++) { if (d.z[k] < minZ) minZ = d.z[k]; if (d.z[k] > maxZ) maxZ = d.z[k]; }
      o += d.n;
    }
    const bytes = encodeNode(a, hasRgb, hasInt);
    await store.put(P + 'n/' + anc + '.bin', bytes);
    rows.set(anc, { count: total, minZ: total ? minZ * scale[2] : 0, maxZ: total ? maxZ * scale[2] : 0, cellSize: size / 2 ** (anc.length - 1) / G, byteLength: bytes.length });
  }
  // every ancestor of a node is in the table
  for (const nid of [...rows.keys()]) for (let l = nid.length - 1; l >= 1; l--) { const a = nid.slice(0, l); if (!rows.has(a)) rows.set(a, { count: 0, minZ: 0, maxZ: 0, cellSize: size / 2 ** (a.length - 1) / G, byteLength: 0 }); }
  if (!rows.has('r')) rows.set('r', { count: 0, minZ: 0, maxZ: 0, cellSize: size / G, byteLength: 0 });
  const order = [...rows.keys()].sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0));
  const index = new Map(order.map((k, i) => [k, i]));
  const table = order.map((k) => {
    const r = rows.get(k);
    return { parent: k === 'r' ? -1 : index.get(k.slice(0, -1)), octant: k === 'r' ? 0 : k.charCodeAt(k.length - 1) - 48, depth: k.length - 1, count: r.count, byteLength: r.byteLength, byteOffset: 0, minZ: r.minZ, maxZ: r.maxZ, cellSize: r.cellSize };
  });
  let points = 0, depth = 0;
  for (const r of table) { points += r.count; if (r.depth > depth && r.count) depth = r.depth; }
  if (points !== st.count) fail('count_mismatch', { points, count: st.count });
  await store.put(P + 'nodes.bin', encodeTable(table));
  rep(0.98, 'merge');
  const cm = {};
  for (const [k, v] of Object.entries(st.classCounts)) cm[k] = v;
  const meta = {
    format: 'cct', version: 1, id, name: opts.name || info.name || id,
    source: src.srcDesc, crs: info.crs || null, wkt: info.wkt || null, unit: opts.unit || info.unit || (info.crs && info.crs.unit && info.crs.unit !== 'deg' ? info.crs.unit : null) || null, zUnit: info.zUnit || null,   // opts.unit (0.10 BK.8): what the person answered for a file that states none
    count: st.count, bounds: { min: st.min, max: st.max }, origin, scale, spacing: size / G, nodeCap, depth, gridCells: G, binDepth: d0,
    cube: { min: origin, size },
    attrs: { rgb: st.hasRgb, intensity: st.hasInt, class: true, returns: false, gpstime: false },
    classCounts: cm, clamped: st.clamped || 0, built: opts.now ? opts.now() : new Date().toISOString(), tilerVersion: TILER_VERSION,
  };
  await putJson('cloud.json', meta);
  for (const k of await store.list(P + 'build/')) await store.delete(k);
  rep(1, 'merge');
  return openCloud(store, id, opts);
}
