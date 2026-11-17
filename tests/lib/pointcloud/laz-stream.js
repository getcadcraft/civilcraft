/* SPDX-License-Identifier: Apache-2.0 */
/**
 * laz-stream.js — a LAZ file read one chunk at a time (0.10 PERF.25). DOM-free, no app imports.
 *
 * The app's reader (las.js scanLaz) copies the WHOLE file into the WebAssembly heap before the first point: a 2 GB LAZ needs a
 * 2 GB heap (wasm32 holds 4 GB at most, a browser tab less) and a 600 MB one already fails on a phone. A LAZ file is a row of
 * independent chunks (LAZ specification 1.4 clause 11: every chunk starts its models again), and the chunk table says where each
 * one is. This reads the table, then for each chunk: slice it from the file, copy it into ONE reusable buffer in the heap (the size
 * of the biggest chunk, a few MB), decode its points with laz-perf's ChunkDecoder, hand them on. The heap never holds more than
 * one chunk.
 *
 *   await scanLazChunks(file, h, onPoint, { signal, progress, lazPerf }) → { read, chunks }
 *       file     a Blob-like (slice(a, b).arrayBuffer())
 *       h        las.js's readLasHeader result (vlrs with offset + length, offsetToPoints, format, recordLength, count, scale, offset)
 *       onPoint  (x, y, z, class) — the same call las.js scanPoints makes
 *       lazPerf  () → the started laz-perf module (the app's las.js lazPerf)
 *   await lazChunkTable(file, h) → { chunkSize, sizes: number[], tablePos }
 *   Throws PcError `laz_stream_unsupported` for what the chunk path cannot read (variable chunk size, no table): the caller reads the
 *   whole file the old way, which still works below the heap limit.
 *
 * The chunk table is read with our own decoder (laz.js: arithmetic coder + Integer Compressor, clause 11.5, 11.6). Source of the
 * format: "LAZ Specification 1.4", Revision R1 (LAStools / rapidlasso GmbH); laz-perf (Apache-2.0, vendored) does the decoding.
 */
import { fail, throwIfAborted, tick } from './util.js';
import { ArithDecoder, IntegerCoder, LAZ_VLR } from './laz.js';

const rd = async (file, a, b) => new Uint8Array(await file.slice(a, b).arrayBuffer());

/** The laszip VLR's chunk size and the chunk table: version, count, then each chunk's byte size by the Integer Compressor (instance 2). */
export async function lazChunkTable(file, h) {
  const v = (h.vlrs || []).find((x) => x.user === LAZ_VLR.user && x.id === LAZ_VLR.recordId);
  if (!v || v.length < 34) fail('laz_stream_unsupported', { why: 'no_vlr' });
  const vb = await rd(file, v.offset, v.offset + 34), vdv = new DataView(vb.buffer);
  if (vdv.getUint16(0, true) !== 2) fail('laz_stream_unsupported', { why: 'compressor' });
  const chunkSize = vdv.getUint32(12, true);
  if (chunkSize === 0 || chunkSize === 0xFFFFFFFF) fail('laz_stream_unsupported', { why: 'variable_chunks' });   // clause 11.6: counts as well as sizes then
  const top = new DataView((await rd(file, h.offsetToPoints, h.offsetToPoints + 8)).buffer);
  let tablePos = Number(top.getBigInt64(0, true));
  if (tablePos === -1) tablePos = Number(new DataView((await rd(file, file.size - 8, file.size)).buffer).getBigInt64(0, true));
  if (!(tablePos >= h.offsetToPoints + 8 && tablePos + 8 <= file.size)) fail('laz_stream_unsupported', { why: 'bad_table' });
  const head = new DataView((await rd(file, tablePos, tablePos + 8)).buffer), n = head.getUint32(4, true);
  const sizes = [];
  if (n) {
    // a size takes at most 5 bytes in the compressed table; read that much (or to the end of the file)
    const body = await rd(file, tablePos + 8, Math.min(file.size, tablePos + 8 + n * 5 + 16));
    const dec = new ArithDecoder(body, 0), ic = new IntegerCoder(32, 2);
    let prev = 0;
    for (let i = 0; i < n; i++) { prev = ic.decompress(dec, prev, 1); sizes.push(prev >>> 0); }
  }
  return { chunkSize, sizes, tablePos };
}

export async function scanLazChunks(file, h, onPoint, { signal = null, progress = null, lazPerf } = {}) {
  if (typeof lazPerf !== 'function') fail('laz_stream_unsupported', { why: 'no_lazperf' });
  const M = await lazPerf();
  if (!M.ChunkDecoder) fail('laz_stream_unsupported', { why: 'no_chunk_decoder' });
  const { chunkSize, sizes, tablePos } = await lazChunkTable(file, h);
  let total = 0;
  for (const s of sizes) total += s;
  if (h.offsetToPoints + 8 + total > tablePos || sizes.some((s) => s < h.recordLength)) fail('laz_stream_unsupported', { why: 'bad_sizes' });
  const L = h.recordLength, ext = h.format >= 6, [sx, sy, sz] = h.scale, [ox, oy, oz] = h.offset;
  const maxChunk = sizes.reduce((m, s) => Math.max(m, s), 0);
  const inPtr = M._malloc(maxChunk), buf = M._malloc(L);
  if (!inPtr || !buf) { if (inPtr) M._free(inPtr); if (buf) M._free(buf); fail('laz_stream_unsupported', { why: 'memory' }); }
  let pos = h.offsetToPoints + 8, read = 0;
  const count = h.available != null ? h.available : h.count;
  try {
    for (let c = 0; c < sizes.length && read < count; c++) {
      throwIfAborted(signal);
      const bytes = await rd(file, pos, pos + sizes[c]);
      pos += sizes[c];
      if (bytes.length < sizes[c]) fail('laz_truncated', { chunk: c });
      M.HEAPU8.set(bytes, inPtr);
      const dec = new M.ChunkDecoder();
      try {
        dec.open(h.format, L, inPtr);
        const m = Math.min(chunkSize, count - read);
        let heap = M.HEAPU8.buffer, dv = new DataView(heap, buf, L);
        for (let i = 0; i < m; i++) {
          dec.getPoint(buf);
          if (M.HEAPU8.buffer !== heap) { heap = M.HEAPU8.buffer; dv = new DataView(heap, buf, L); }
          onPoint(dv.getInt32(0, true) * sx + ox, dv.getInt32(4, true) * sy + oy, dv.getInt32(8, true) * sz + oz, ext ? dv.getUint8(16) : dv.getUint8(15) & 31);
        }
        read += m;
      } finally { dec.delete(); }
      if (progress) { progress(read / count); await tick(); }
    }
  } finally { M._free(buf); M._free(inPtr); }
  return { read, chunks: sizes.length };
}
