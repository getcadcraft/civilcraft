/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-dwg is a standalone library; it has no UI strings. */
/**
 * object-store.js — the encoded objects of a DWG being written, packed into a few big byte chunks (cc-dwg, Apache-2.0).
 *
 * writeDwg used to keep one Uint8Array per object ({ handle, data }): 1.3 million of them for a 75 MB drawing, which is what
 * made its garbage collector, not its own work, the larger half of the write time (PERF.5). The store keeps the bytes in
 * 4 MB chunks and the handle / chunk / offset / length of each object in four typed arrays. It iterates as the
 * { handle, data } list the layouts (container-write.js, r2007-write.js) always read, in handle order.
 */
const CHUNK = 1 << 22;

export class ObjectStore {
  constructor() {
    this.chunks = [];
    this.cur = new Uint8Array(CHUNK); this.chunks.push(this.cur); this.pos = 0;
    this.n = 0;
    this.handle = new Float64Array(1024); this.chunk = new Uint32Array(1024); this.off = new Uint32Array(1024); this.len = new Uint32Array(1024);
    this.order = null;   // entry numbers in written order, set by seal()
  }
  /** Copy `data` in; returns the entry number. */
  add(handle, data) {
    const k = data.length;
    if (this.n === this.handle.length) this._grow();
    if (this.pos + k > this.cur.length) {
      this.cur = new Uint8Array(Math.max(CHUNK, k)); this.chunks.push(this.cur); this.pos = 0;
    }
    this.cur.set(data, this.pos);
    const i = this.n++;
    this.handle[i] = handle; this.chunk[i] = this.chunks.length - 1; this.off[i] = this.pos; this.len[i] = k;
    this.pos += k;
    return i;
  }
  _grow() {
    const m = this.handle.length * 2;
    const g = (a, T) => { const b = new T(m); b.set(a); return b; };
    this.handle = g(this.handle, Float64Array); this.chunk = g(this.chunk, Uint32Array); this.off = g(this.off, Uint32Array); this.len = g(this.len, Uint32Array);
  }
  /**
   * Fix the order: `seq` lists entry numbers in the order the objects were produced; they are put in handle order, equal
   * handles keeping that order (what Array.prototype.sort on the old list did).
   */
  seal(seq) {
    const h = this.handle;
    let sorted = true;
    for (let i = 1; i < seq.length; i++) if (h[seq[i]] < h[seq[i - 1]]) { sorted = false; break; }
    this.order = sorted ? seq : Array.from(seq).sort((a, b) => h[a] - h[b]);
    return this;
  }
  get length() { return this.order ? this.order.length : this.n; }
  *[Symbol.iterator]() {
    const ord = this.order;
    const count = ord ? ord.length : this.n;
    for (let k = 0; k < count; k++) {
      const i = ord ? ord[k] : k, o = this.off[i];
      yield { handle: this.handle[i], data: this.chunks[this.chunk[i]].subarray(o, o + this.len[i]) };
    }
  }
}
