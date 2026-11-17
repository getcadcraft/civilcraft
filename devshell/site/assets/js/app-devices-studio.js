/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-devices-studio.js — the two missing browser doors for 3D mice and MIDI controllers inside CadCraft Studio's own window
 * (0.8 ID.8, session `render_PART_4`; plan docs/spikes/studio-devices.md § 3). DOM-free: everything it touches comes in `win`.
 *
 * Studio's web views on Linux (WebKitGTK) and macOS (WKWebView) have no WebHID and no Web MIDI, so the page layer
 * (app-devices-ui.js, the ONE copy of the 3D mouse and MIDI logic) says "not available here". This shim makes the two doors exist,
 * backed by Studio's native side, so the page layer runs unchanged:
 *   navigator.hid                 requestDevice({filters}) · getDevices() · 'disconnect' events; each device open() / close() and
 *                                 'inputreport' events {reportId, data: DataView, device}; collections carry usagePage / usage
 *   navigator.requestMIDIAccess   input only, never sysex: {inputs: Map, outputs: empty Map, sysexEnabled: false, onstatechange};
 *                                 each input's onmidimessage gets {data: Uint8Array, timeStamp, target}
 * Nothing is installed unless Studio offers the bridge `window.cadcraftDesktop.devices`; the web edition has none, so nothing changes
 * there. With the bridge:
 *   - a web view WITHOUT the door (WebKitGTK, WKWebView) gets Studio's;
 *   - a web view WITH the door (WebView2) keeps it and gets Studio's behind it: the real door is asked first, and Studio's only when
 *     the real one gave nothing (a host window may show no device chooser, or refuse MIDI). See hidWithFallback / midiWithFallback.
 *
 * The bridge (desktop-shell `src-tauri/src/devices.rs`; Linux reads hidraw and ALSA raw MIDI nodes itself, macOS and Windows use hidapi
 * and midir). Bytes only, input only; the shell lists only multi-axis controllers (HID usage page 1, usage 8), so nothing else on the
 * computer is reachable:
 *   hidList()  → [{ id, vendorId, productId, productName, usagePage, usage }]
 *   hidBlocked() → how many 3D mice are plugged in that this computer does not let the person read yet (Linux without the udev rule)
 *   hidRule()    → that udev rule file's text ('' where none is needed)
 *   hidOpen(id) · hidClose(id)
 *   hidRecv(id) → [{ reportId, bytes: number[] }]       the reports since the last call (throws 'gone: …' when it was unplugged)
 *   midiList() → [{ id, name, manufacturer }]            inputs only
 *   midiOpen(id) · midiClose(id)
 *   midiRecv(id) → [{ bytes: number[], t }]               messages since the last call (sysex never passed on)
 *
 *   installStudioDevices(win, { pollMs, listMs, storage }) → { hid: bool, midi: bool }    what was installed
 *   studioHid(bridge, opts) · studioMidi(bridge, opts)                                   the two doors on their own (tests)
 *   hidWithFallback(real, studio) · midiWithFallback(real, studio)                       the real door first, Studio's behind it
 * getDevices() answers only devices this person connected before (their ids are kept in storage key `cc-devices:studio-hid`), as
 * WebHID's own permission would: a 3D mouse is never opened before the person has clicked "Connect a 3D mouse" once.
 */

export const HID_KEY = 'cc-devices:studio-hid';

/** The WebHID filter rules (vendorId, productId, usagePage, usage; any field left out matches). */
export function matchesFilters(d, filters) {
  if (!Array.isArray(filters) || !filters.length) return true;
  return filters.some((f) => (f.vendorId === undefined || f.vendorId === d.vendorId) && (f.productId === undefined || f.productId === d.productId)
    && (f.usagePage === undefined || f.usagePage === d.usagePage) && (f.usage === undefined || f.usage === d.usage));
}

function emitter() {
  const map = new Map();
  return {
    addEventListener(type, fn) { if (typeof fn !== 'function') return; if (!map.has(type)) map.set(type, new Set()); map.get(type).add(fn); },
    removeEventListener(type, fn) { map.get(type)?.delete(fn); },
    emit(type, ev) { for (const fn of [...(map.get(type) || [])]) { try { fn(ev); } catch (e) { /* a listener's error is its own */ } } },
  };
}

const gone = (e) => /^gone\b/.test(String((e && e.message) || e || ''));
const toBytes = (a) => Uint8Array.from(Array.isArray(a) ? a.map((x) => x & 255) : []);

export function studioHid(bridge, { pollMs = 8, listMs = 1500, storage = null, setInterval: si = setInterval, clearInterval: ci = clearInterval } = {}) {
  const ev = emitter(), devices = new Map();   // id → device object
  const store = {
    read() { try { return new Set(JSON.parse((storage && storage.getItem(HID_KEY)) || '[]').filter((x) => typeof x === 'string')); } catch (e) { return new Set(); } },
    add(id) { try { const s = this.read(); s.add(id); storage && storage.setItem(HID_KEY, JSON.stringify([...s].slice(-8))); } catch (e) { /* this session keeps it */ } },
  };
  const granted = store.read();
  let listTimer = null;
  function deviceFor(row) {
    if (devices.has(row.id)) return devices.get(row.id);
    const dev = emitter();
    let timer = null;
    Object.assign(dev, {
      opened: false, vendorId: row.vendorId | 0, productId: row.productId | 0, productName: String(row.productName || '').slice(0, 120),
      collections: [{ usagePage: row.usagePage | 0, usage: row.usage | 0 }],
      async open() {
        if (dev.opened) return;
        await bridge.hidOpen(row.id);
        dev.opened = true;
        timer = si(async () => {
          let reports;
          try { reports = await bridge.hidRecv(row.id); } catch (e) { if (gone(e)) lost(); return; }
          for (const r of reports || []) {
            const b = toBytes(r.bytes);
            dev.emit('inputreport', { type: 'inputreport', reportId: r.reportId | 0, data: new DataView(b.buffer), device: dev });
          }
        }, pollMs);
      },
      async close() { if (timer) ci(timer); timer = null; if (dev.opened) { dev.opened = false; try { await bridge.hidClose(row.id); } catch (e) { /* already gone */ } } },
      async forget() { await dev.close(); },
    });
    function lost() { dev.close(); devices.delete(row.id); ev.emit('disconnect', { type: 'disconnect', device: dev }); }
    dev._lost = lost;
    devices.set(row.id, dev);
    return dev;
  }
  async function list() { const rows = await bridge.hidList(); return Array.isArray(rows) ? rows.filter((r) => r && typeof r.id === 'string') : []; }
  function watch() {
    if (listTimer) return;
    listTimer = si(async () => {
      let ids;
      try { ids = new Set((await list()).map((r) => r.id)); } catch (e) { return; }
      for (const [id, dev] of [...devices]) if (!ids.has(id)) dev._lost();
    }, listMs);
  }
  return Object.assign(ev, {
    studio: true,
    async requestDevice({ filters = [] } = {}) {
      const rows = (await list()).filter((r) => matchesFilters(r, filters));
      for (const r of rows) { granted.add(r.id); store.add(r.id); }
      watch();
      return rows.map(deviceFor);
    },
    async getDevices() {
      const rows = (await list()).filter((r) => granted.has(r.id));
      if (rows.length) watch();
      return rows.map(deviceFor);
    },
    /** 3D mice that are plugged in but that this computer does not let the person read (Linux without the udev rule). */
    async blocked() { try { return typeof bridge.hidBlocked === 'function' ? Number(await bridge.hidBlocked()) || 0 : 0; } catch (e) { return 0; } },
    /** The udev rule file's text that lets the person read their 3D mouse (Linux), or ''. */
    async rule() { try { return typeof bridge.hidRule === 'function' ? String((await bridge.hidRule()) || '') : ''; } catch (e) { return ''; } },
    stop() { if (listTimer) ci(listTimer); listTimer = null; for (const d of devices.values()) d.close(); },
  });
}

/** How long a real door may take to answer "nothing" and still count as "it showed no chooser": a person needs longer to cancel one. */
export const NO_CHOOSER_MS = 700;

/**
 * The web view's own WebHID door first, Studio's when the real one gives nothing. For WebView2 inside Studio's window: the engine
 * has WebHID, but a host window may show no device chooser, and then requestDevice answers an empty list (or throws) at once.
 * A person who cancelled a real chooser took longer than NO_CHOOSER_MS: their "no" stands and Studio's door is not asked.
 */
export function hidWithFallback(real, studio, { now = () => Date.now() } = {}) {
  const ev = emitter();
  for (const door of [real, studio]) { try { door.addEventListener && door.addEventListener('disconnect', (e) => ev.emit('disconnect', e)); } catch (e) { /* no events from this door */ } }
  return Object.assign(ev, {
    studio: true, fallback: true,
    async requestDevice(o = {}) {
      const t0 = now();
      let got = [], threw = false;
      try { got = await real.requestDevice(o); } catch (e) { threw = true; }
      if (Array.isArray(got) && got.length) return got;
      if (!threw && now() - t0 > NO_CHOOSER_MS) return [];
      return studio.requestDevice(o);
    },
    async getDevices() {
      let got = [];
      try { got = await real.getDevices(); } catch (e) { got = []; }
      return Array.isArray(got) && got.length ? got : studio.getDevices();
    },
    blocked: () => studio.blocked(),
    rule: () => studio.rule(),
    stop() { studio.stop(); },
  });
}

/** The web view's own Web MIDI first; Studio's when it refuses (a host window with no permission prompt answers NotAllowedError). */
export function midiWithFallback(real, studio) {
  return async function requestMIDIAccess(opts = {}) {
    if (opts && opts.sysex) return real(opts);   // Studio's door never passes system exclusive messages; the real one decides
    try { return await real(opts); } catch (e) { return studio(opts); }
  };
}

export function studioMidi(bridge, { pollMs = 8, listMs = 1500, setInterval: si = setInterval, clearInterval: ci = clearInterval, now = () => Date.now() } = {}) {
  // One access per window, handed out again on later calls: Studio keeps one queue per window and device, so two accesses
  // polling the same input would each get only some of its messages (and every Connect click would add a list timer).
  let shared = null;
  return async function requestMIDIAccess(opts = {}) {
    if (opts && opts.sysex) { const e = new Error('Studio passes MIDI input only, never system exclusive messages'); e.name = 'NotSupportedError'; throw e; }   // i18n-ignore: a DOMException's text
    if (shared) return shared;
    const inputs = new Map(), timers = new Map();
    const access = { inputs, outputs: new Map(), sysexEnabled: false, onstatechange: null };
    const input = (row) => {
      let handler = null;
      const port = {
        id: row.id, name: String(row.name || row.id).slice(0, 120), manufacturer: String(row.manufacturer || '').slice(0, 120), type: 'input', state: 'connected', connection: 'closed',
        get onmidimessage() { return handler; },
        set onmidimessage(fn) {
          handler = typeof fn === 'function' ? fn : null;
          if (handler && !timers.has(row.id)) {
            port.connection = 'open';
            Promise.resolve(bridge.midiOpen(row.id)).catch(() => {});
            timers.set(row.id, si(async () => {
              let msgs;
              try { msgs = await bridge.midiRecv(row.id); } catch (e) { if (gone(e)) drop(row.id); return; }
              for (const m of msgs || []) {
                const data = toBytes(m.bytes);
                if (!data.length || data[0] === 0xf0) continue;   // never sysex
                handler && handler({ type: 'midimessage', data, timeStamp: Number(m.t) || now(), target: port });
              }
            }, pollMs));
          } else if (!handler && timers.has(row.id)) { ci(timers.get(row.id)); timers.delete(row.id); port.connection = 'closed'; Promise.resolve(bridge.midiClose(row.id)).catch(() => {}); }
        },
      };
      return port;
    };
    function drop(id) {
      const p = inputs.get(id);
      if (!p) return;
      if (timers.has(id)) { ci(timers.get(id)); timers.delete(id); }
      p.state = 'disconnected';
      inputs.delete(id);
      access.onstatechange && access.onstatechange({ type: 'statechange', port: p });
    }
    const rows = await bridge.midiList();
    for (const r of Array.isArray(rows) ? rows : []) if (r && typeof r.id === 'string') inputs.set(r.id, input(r));
    si(async () => {
      let now2;
      try { now2 = await bridge.midiList(); } catch (e) { return; }
      const ids = new Set((now2 || []).map((r) => r && r.id));
      for (const id of [...inputs.keys()]) if (!ids.has(id)) drop(id);
      for (const r of now2 || []) if (r && typeof r.id === 'string' && !inputs.has(r.id)) { const p = input(r); inputs.set(r.id, p); access.onstatechange && access.onstatechange({ type: 'statechange', port: p }); }
    }, listMs);
    shared = access;
    return access;
  };
}

/** Install the missing doors when Studio's bridge is there. Safe to call more than once. */
export function installStudioDevices(win = globalThis, opts = {}) {
  const out = { hid: false, midi: false };
  const bridge = win && win.cadcraftDesktop && win.cadcraftDesktop.devices;
  const nav = win && win.navigator;
  if (!bridge || !nav) return out;
  let storage = null;
  try { storage = win.localStorage || null; } catch (e) { storage = null; }
  const def = (k, v) => { try { Object.defineProperty(nav, k, { value: v, configurable: true }); return true; } catch (e) { return false; } };
  if (nav.hid && nav.hid.studio) return { hid: true, midi: true, again: true };   // already installed in this window
  if (typeof bridge.hidList === 'function') {
    const mine = studioHid(bridge, { storage, ...opts });
    out.hid = def('hid', nav.hid ? hidWithFallback(nav.hid, mine, opts) : mine);
  }
  if (typeof bridge.midiList === 'function') {
    const mine = studioMidi(bridge, opts), real = nav.requestMIDIAccess;
    out.midi = def('requestMIDIAccess', typeof real === 'function' ? midiWithFallback((o) => real.call(nav, o), mine) : mine);
  }
  return out;
}
