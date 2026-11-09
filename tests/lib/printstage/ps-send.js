/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ps-send.js — getting G-code to a printer (roadmap PS.3): over the network to Moonraker (Klipper), OctoPrint or PrusaLink, or down
 * USB with Web Serial to Marlin-style firmware. Imports nothing; `fetch` and `navigator.serial` are passed in, so Node tests drive it
 * against stand-ins. Nothing runs by itself: every call here follows a person's click in the panel, which asks first.
 *
 *   KINDS                                     ['usb', 'moonraker', 'octoprint', 'prusalink']
 *   cleanPrinterLink(any) → { kind, url, key }   url: http(s) with no path, query or credentials ('' = not usable)
 *   uploadRequest(link, name, text, { start }) → { url, init }    the one HTTP request a network printer takes
 *   sendNetwork(link, name, text, { fetchFn, start, signal }) → Promise<{ ok, started, status?, why? }>
 *     why: 'address' · 'unreachable' (blocked or no answer: the printer may need this site allowed) · 'key' (401/403) · 'busy' (409) · 'refused'
 *   testLink(link, { fetchFn }) → Promise<{ ok, why? }>     a read that changes nothing
 *   checksumLine(n, cmd) → 'N5 G28*18'         Marlin's line number and checksum
 *   new MarlinLink({ serial, baud, onLine, onState })
 *     connect() → Promise<{ ok }>              asks for a port (from a click) and opens it
 *     send(lines, { onProgress }) → Promise<{ ok, sent, why? }>    one line at a time, the next after `ok`; `Resend:` repeats; `Error:` stops
 *     stop() → halts the stream and sends heaters off, fan off, motors off.   disconnect()
 *     state → { connected, running }
 *
 * What the browser allows: an https page reaching http://192.168.x.x needs Chrome's local-network permission and the printer's CORS
 * setting to allow this site. A printer on a bare hostname needs `targetAddressSpace` (below). None of this is a way around the
 * printer's own key.
 */
export const KINDS = ['usb', 'moonraker', 'octoprint', 'prusalink'];

export function cleanPrinterLink(l) {
  const o = l && typeof l === 'object' ? l : {};
  const kind = KINDS.includes(o.kind) ? o.kind : 'usb';
  let url = '';
  try {
    const raw = String(o.url || '').trim();
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : 'http://' + raw);
    if (raw && (u.protocol === 'http:' || u.protocol === 'https:') && !u.username && !u.password) url = u.origin;
  } catch { url = ''; }
  return { kind, url, key: typeof o.key === 'string' ? o.key.replace(/[^\x21-\x7e]/g, '').slice(0, 200) : '' };
}

export function uploadRequest(link, name, text, { start = true } = {}) {
  const file = String(name).replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^[._]+/, '').slice(0, 80) || 'plate.gcode';
  const headers = {};
  if (link.key) headers['X-Api-Key'] = link.key;
  const base = { method: 'POST', headers, targetAddressSpace: 'local' };
  if (link.kind === 'prusalink') {
    return {
      url: link.url + '/api/v1/files/usb/' + encodeURIComponent(file),
      init: { ...base, method: 'PUT', headers: { ...headers, 'Content-Type': 'application/octet-stream', 'Print-After-Upload': start ? '?1' : '?0', Overwrite: '?1' }, body: text },
    };
  }
  const form = new FormData();
  form.append('file', new Blob([text], { type: 'text/plain' }), file);
  if (link.kind === 'moonraker') {
    form.append('root', 'gcodes');
    form.append('print', start ? 'true' : 'false');
    return { url: link.url + '/server/files/upload', init: { ...base, body: form } };
  }
  form.append('select', 'true');
  form.append('print', start ? 'true' : 'false');
  return { url: link.url + '/api/files/local', init: { ...base, body: form } };
}

export async function sendNetwork(link, name, text, { fetchFn, start = true, signal = null } = {}) {
  if (!link.url || link.kind === 'usb') return { ok: false, started: false, why: 'address' };
  const { url, init } = uploadRequest(link, name, text, { start });
  let res;
  try { res = await fetchFn(url, signal ? { ...init, signal } : init); }
  catch (e) { if (e?.name === 'AbortError') throw e; return { ok: false, started: false, why: 'unreachable' }; }
  if (res.ok) return { ok: true, started: start, status: res.status };
  const why = res.status === 401 || res.status === 403 ? 'key' : res.status === 409 ? 'busy' : 'refused';
  return { ok: false, started: false, status: res.status, why };
}

const TEST_PATH = { moonraker: '/server/info', octoprint: '/api/version', prusalink: '/api/version' };
export async function testLink(link, { fetchFn }) {
  if (!link.url || link.kind === 'usb') return { ok: false, why: 'address' };
  try {
    const res = await fetchFn(link.url + TEST_PATH[link.kind], { headers: link.key ? { 'X-Api-Key': link.key } : {}, targetAddressSpace: 'local' });
    if (res.ok) return { ok: true };
    return { ok: false, why: res.status === 401 || res.status === 403 ? 'key' : 'refused' };
  } catch { return { ok: false, why: 'unreachable' }; }
}

export function checksumLine(n, cmd) {
  const s = 'N' + n + ' ' + cmd;
  let c = 0;
  for (let i = 0; i < s.length; i++) c ^= s.charCodeAt(i);
  return s + '*' + (c & 255);
}

const STOP_LINES = ['M108', 'M104 S0', 'M140 S0', 'M107', 'M84'];

export class MarlinLink {
  static supported(serial) { return !!serial && typeof serial.requestPort === 'function'; }
  constructor({ serial, baud = 115200, onLine = null, onState = null } = {}) {
    Object.assign(this, { serial, baud, onLine, onState });
    this.port = null; this.writer = null; this.running = false; this.halt = false; this.waiting = null; this.buf = ''; this.stopping = null;
  }
  get state() { return { connected: !!this.port, running: this.running }; }
  async connect() {
    if (!MarlinLink.supported(this.serial)) return { ok: false, why: 'unsupported' };
    let port;
    try { port = await this.serial.requestPort(); await port.open({ baudRate: this.baud }); }
    catch { return { ok: false, why: 'cancelled' }; }
    this.port = port;
    this.writer = port.writable.getWriter();
    this.reader = port.readable.getReader();
    this.readLoop();
    this.onState?.(this.state);
    return { ok: true };
  }
  async readLoop() {
    const dec = new TextDecoder();
    try {
      for (;;) {
        const { value, done } = await this.reader.read();
        if (done) break;
        this.buf += dec.decode(value);
        let i;
        while ((i = this.buf.indexOf('\n')) >= 0) { const l = this.buf.slice(0, i).trim(); this.buf = this.buf.slice(i + 1); if (l) this.heard(l); }
      }
    } catch { /* the port went away: the waiter below is told */ }
    const w = this.waiting; this.waiting = null; if (w) w({ gone: true });
  }
  heard(l) {
    this.onLine?.(l);
    const w = this.waiting;
    if (!w) return;
    const resend = /^(?:Resend|rs)[: ]\s*N?:?(\d+)/i.exec(l);
    if (resend) { this.waiting = null; w({ resend: Number(resend[1]) }); return; }
    if (/^Error:/i.test(l)) { if (/checksum|line number|No Line/i.test(l)) return; this.waiting = null; w({ error: l }); return; }   // a Resend follows those
    if (/^ok\b/i.test(l)) { this.waiting = null; w({ ok: true }); }
  }
  async write(text) { await this.writer.write(new TextEncoder().encode(text + '\n')); }
  ask(text) { return new Promise((res) => { this.waiting = res; this.write(text).catch(() => { this.waiting = null; res({ gone: true }); }); }); }
  async send(lines, { onProgress = null } = {}) {
    if (!this.port) return { ok: false, sent: 0, why: 'notconnected' };
    if (this.running) return { ok: false, sent: 0, why: 'busy' };
    const cmds = [];
    for (const l of lines) { const c = String(l).replace(/;.*$/, '').trim(); if (c) cmds.push(c); }
    this.running = true; this.halt = false; this.onState?.(this.state);
    let at = 0, why = null;
    try {
      const reset = await this.ask(checksumLine(0, 'M110 N0'));
      if (!reset.ok) return { ok: false, sent: 0, why: reset.error ? 'error' : 'gone', error: reset.error };
      while (at < cmds.length) {
        if (this.halt) { why = 'stopped'; break; }
        const r = await this.ask(checksumLine(at + 1, cmds[at]));
        if (r.resend != null) { at = Math.max(0, r.resend - 1); continue; }
        if (r.error) { why = 'error'; this.lastError = r.error; break; }
        if (r.gone) { why = 'gone'; break; }
        at++;
        if (at % 25 === 0 || at === cmds.length) { onProgress?.({ sent: at, total: cmds.length }); await new Promise((go) => setTimeout(go, 0)); }   // so Stop can always be clicked
      }
    } finally { await this.stopping; this.running = false; this.onState?.(this.state); }
    return why ? { ok: false, sent: at, why, error: this.lastError } : { ok: true, sent: at };
  }
  /** The stream ends after the line in hand, then the machine is made safe. Sent without waiting: the firmware may be mid-heat. */
  stop() {
    this.halt = true;
    const w = this.waiting; this.waiting = null; if (w) w({ ok: true });
    this.stopping = (async () => { if (this.writer) for (const l of STOP_LINES) await this.write(l).catch(() => {}); })();
    return this.stopping;
  }
  async disconnect() {
    if (this.running) await this.stop();
    try { await this.reader?.cancel(); this.reader?.releaseLock(); this.writer?.releaseLock(); await this.port?.close(); } catch { /* already gone */ }
    this.port = null; this.onState?.(this.state);
  }
}
