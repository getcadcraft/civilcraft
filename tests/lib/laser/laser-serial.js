/* SPDX-License-Identifier: Apache-2.0 */
/**
 * laser-serial.js — sending a program to a GRBL laser over Web Serial (0.7 SU.772, session `make-07`). Imports nothing. The
 * browser API is passed in (`serial` = navigator.serial or a stand-in), so Node tests drive it against a fake controller.
 *
 * The rules this file keeps:
 *   - nothing touches a port until the person clicks: `connect()` is the only thing that asks for one (requestPort needs a click),
 *     the constructor and everything else never do, and nothing connects on load or sends on its own;
 *   - a program starts only with `{ confirmed: true }` (the panel asks the person to check the machine first), and only when a
 *     port is open;
 *   - the stream is GRBL's character-counting protocol: a line goes out only when it fits in the controller's 127 free bytes
 *     alongside the lines it has not yet acknowledged (`ok` / `error:n`); the first error or ALARM stops the stream;
 *   - "stop" holds the head (!) then soft-resets the controller (Ctrl-X), which switches the laser off, and then sends M5;
 *     closing a port during a program does the same first.
 *
 *   GrblLink.supported(serial) → bool
 *   new GrblLink({ serial, baud = 115200, onLine(text), onState(state), onProgress({ sent, done, total }) })
 *   link.connect() → Promise<{ ok }>        asks for a port (call it from a click handler) and opens it
 *   link.sendLines(lines, { confirmed, onProgress }) → Promise<{ ok, sent, error?, line?, alarm? }>
 *   link.hold() · link.resume() · link.stop() · link.unlock() ($X) · link.home() ($H) · link.status() (?) · link.disconnect()
 *   link.state → { connected, running, hold, state ('Idle', 'Run', 'Hold', 'Alarm', …), x, y, error }
 *   parseStatus('<Idle|MPos:1.000,2.000,0.000|FS:0,0>') → { state, x, y, feed, s }
 *   prepare(lines) → the lines GRBL gets: comments and blank lines removed, upper case, spaces kept out of numbers
 */
export const RX_BYTES = 127;

export function prepare(lines) {
  const out = [];
  for (const raw of lines) {
    const t = String(raw).replace(/\([^)]*\)/g, '').replace(/;.*$/, '').trim();
    if (t) out.push(t.toUpperCase());
  }
  return out;
}

export function parseStatus(line) {
  const m = /^<([A-Za-z]+)(?::\d+)?\|(.*)>$/.exec(String(line).trim());
  if (!m) return null;
  const out = { state: m[1], x: null, y: null, feed: null, s: null };
  for (const part of m[2].split('|')) {
    const [k, v] = part.split(':');
    if ((k === 'MPos' || k === 'WPos') && v) { const n = v.split(',').map(Number); out.x = n[0]; out.y = n[1]; }
    else if (k === 'FS' && v) { const n = v.split(',').map(Number); out.feed = n[0]; out.s = n[1]; }
  }
  return out;
}

export class GrblLink {
  static supported(serial = globalThis.navigator?.serial) { return !!serial && typeof serial.requestPort === 'function'; }

  constructor({ serial = globalThis.navigator?.serial, baud = 115200, onLine, onState, onProgress } = {}) {
    this.serial = serial; this.baud = baud; this.onLine = onLine || (() => {}); this.onState = onState || (() => {}); this.onProgress = onProgress || (() => {});
    this.port = null; this.writer = null; this.reader = null; this.enc = new TextEncoder(); this.dec = new TextDecoder();
    this.state = { connected: false, running: false, hold: false, state: '', x: null, y: null, error: '' };
    this.job = null; this.buf = '';
  }

  _set(p) { Object.assign(this.state, p); this.onState({ ...this.state }); }

  async connect() {
    if (!GrblLink.supported(this.serial)) { this._set({ error: 'unsupported' }); return { ok: false, error: 'unsupported' }; }
    let port;
    try { port = await this.serial.requestPort(); } catch (e) { this._set({ error: e?.name === 'NotFoundError' ? 'cancelled' : 'denied' }); return { ok: false, error: this.state.error }; }
    try { await port.open({ baudRate: this.baud }); } catch (e) { this._set({ error: 'open' }); return { ok: false, error: 'open' }; }
    this.port = port;
    this.writer = port.writable.getWriter();
    this.reader = port.readable.getReader();
    this._set({ connected: true, error: '' });
    this._readLoop();
    return { ok: true };
  }

  async _readLoop() {
    try {
      for (;;) {
        const { value, done } = await this.reader.read();
        if (done) break;
        this.buf += this.dec.decode(value, { stream: true });
        let i;
        while ((i = this.buf.indexOf('\n')) >= 0) { const line = this.buf.slice(0, i).replace(/\r$/, '').trim(); this.buf = this.buf.slice(i + 1); if (line) this._line(line); }
      }
    } catch { /* the port went away */ }
    if (this.state.connected) this._set({ connected: false, running: false });
    if (this.job) this._finish({ ok: false, error: 'disconnected' });
  }

  _line(line) {
    this.onLine(line);
    const st = parseStatus(line);
    if (st) { this._set({ state: st.state, x: st.x, y: st.y, hold: /^Hold/.test(st.state) }); return; }
    const j = this.job;
    if (/^ok$/i.test(line)) { if (j && j.inflight.length) { j.inflight.shift(); j.done++; this.onProgress({ sent: j.next, done: j.done, total: j.lines.length }); j.onProgress?.({ sent: j.next, done: j.done, total: j.lines.length }); this._pump(); } return; }
    const err = /^error:(\d+)/i.exec(line);
    if (err) { if (j) this._finish({ ok: false, error: 'error:' + err[1], line: j.lines[j.done] ?? '', sent: j.next }); return; }
    const al = /^ALARM:(\d+)/i.exec(line);
    if (al) { this._set({ state: 'Alarm' }); if (j) this._finish({ ok: false, error: 'alarm', alarm: Number(al[1]), sent: j.next }); }
  }

  async _write(text) { await this.writer.write(typeof text === 'string' ? this.enc.encode(text) : text); }

  _pump() {
    const j = this.job;
    if (!j) return;
    if (j.paused) return;
    let used = j.inflight.reduce((s, n) => s + n, 0);
    const out = [];
    while (j.next < j.lines.length) {
      const n = j.lines[j.next].length + 1;
      if (used + n > RX_BYTES) break;
      out.push(j.lines[j.next] + '\n'); j.inflight.push(n); used += n; j.next++;
    }
    if (out.length) j.chain = j.chain.then(() => this._write(out.join(''))).catch(() => {});
    if (j.next >= j.lines.length && !j.inflight.length) this._finish({ ok: true, sent: j.next });
  }

  _finish(result) {
    const j = this.job;
    if (!j) return;
    this.job = null;
    this._set({ running: false });
    j.resolve({ sent: j.next, ...result });
  }

  /** Stream a program (see the header). Resolves when GRBL has acknowledged every line, or at the first error. */
  sendLines(lines, { confirmed = false, onProgress } = {}) {
    if (!this.state.connected) return Promise.resolve({ ok: false, error: 'not-connected', sent: 0 });
    if (confirmed !== true) return Promise.resolve({ ok: false, error: 'not-confirmed', sent: 0 });
    if (this.job) return Promise.resolve({ ok: false, error: 'busy', sent: 0 });
    const prepared = prepare(lines);
    if (prepared.some((l) => l.length > 80)) return Promise.resolve({ ok: false, error: 'line-too-long', sent: 0 });
    return new Promise((resolve) => {
      this.job = { lines: prepared, next: 0, done: 0, inflight: [], resolve, onProgress, chain: Promise.resolve(), paused: false };
      this._set({ running: true });
      if (!prepared.length) { this._finish({ ok: true, sent: 0 }); return; }
      this._pump();
    });
  }

  async hold() { if (this.writer) { await this._write('!'); this._set({ hold: true }); } }
  async resume() { if (this.writer) { await this._write('~'); this._set({ hold: false }); } }
  async status() { if (this.writer) await this._write('?'); }
  async unlock() { if (this.writer) await this._write('$X\n'); }
  async home() { if (this.writer) await this._write('$H\n'); }

  /** Hold, soft-reset (the laser goes off), M5, and drop the rest of the program. */
  async stop() {
    if (!this.writer) return;
    const j = this.job;
    if (j) j.paused = true;
    await this._write('!');
    await this._write(Uint8Array.of(0x18));
    if (j) this._finish({ ok: false, error: 'stopped', sent: j.next });
    await this._write('M5\n');
    this._set({ hold: false });
  }

  async disconnect() {
    if (!this.port) return;
    try { if (this.job) await this.stop(); } catch { /* going away */ }
    try { await this.reader?.cancel(); } catch { /* already closed */ }
    try { this.reader?.releaseLock(); this.writer?.releaseLock(); } catch { /* ignore */ }
    try { await this.port.close(); } catch { /* ignore */ }
    this.port = this.writer = this.reader = null;
    this._set({ connected: false, running: false, hold: false, state: '' });
  }
}
