/* SPDX-License-Identifier: Apache-2.0 */
/**
 * read.js — reading devices through Studio's gated pipe (0.11 XE.9, JavaScript side). Studio (desktop-shell `live_net.rs`) offers `cadcraftDesktop.liveNet`:
 *
 *   open({ protocol: 'modbus'|'mqtt'|'bacnet', host, port? }) → id        (no port = 502 / 1883 / 47808; host 'broadcast' with bacnet = Who-Is discovery)
 *   send(id, Uint8Array) → ...     Studio checks every byte: Modbus one frame fc 1-4, MQTT CONNECT without a will / SUBSCRIBE / UNSUBSCRIBE / PUBACK / PINGREQ / DISCONNECT,
 *                                  BACnet Who-Is or an unsegmented ReadProperty. Anything else is refused there, whatever this file does.
 *   recv(id, waitMs ≤ 5000) → Uint8Array   (empty = nothing yet; TCP = whatever arrived; UDP = one datagram)
 *   close(id)
 *
 * The protocols are this library's own codecs: this file only builds the read requests, feeds the answers to the stream readers and turns them into samples. There is no write
 * function in any codec, so there is nothing here that could write to a device.
 *
 *   makeReader(liveNet, { timeoutMs = 3000, now }) → { read({ protocol, host, port, unit, nodes, tags? }) → Promise<[{ node, value, quality, at }]>, discover({ low?, high?, waitMs? }) → Promise<[{ device, address? }]> }
 *   nodes  the addresses of the tag map ("40001", "plant/t1#json.value", "analog-input,1"); tags (optional) carries the modbus type / wordOrder / byteOrder of each node (planReads gives it)
 *   A node that got no answer in time is left out (the tag stays "waiting"); a device's refusal (Modbus exception, BACnet error) is a sample with quality 'bad'.
 */
import * as modbus from './modbus.js';
import * as mqtt from './mqtt.js';
import * as bacnet from './bacnet.js';
import { ProtocolError } from './bytes.js';
import { checkAddress } from './tagmap.js';
import { PROTOCOLS } from './policy.js';

const MAX_WAIT = 5000;

export function makeReader(net, { timeoutMs = 3000, now = () => Date.now() } = {}) {
  if (!net || typeof net.open !== 'function' || typeof net.send !== 'function' || typeof net.recv !== 'function' || typeof net.close !== 'function') throw new ProtocolError('bridge', 'The device pipe needs open, send, recv and close.');
  const sleepless = async (id, until) => { const left = until - Date.now(); if (left <= 0) return null; const got = await net.recv(id, Math.max(1, Math.min(MAX_WAIT, left))); return got && got.length ? got : new Uint8Array(0); };
  const bad = (node) => ({ node, value: null, quality: 'bad', at: now() });
  const tagOf = (tags, node) => (Array.isArray(tags) ? tags.find((g) => g.node === node) : null) || {};

  async function readModbus({ host, port, unit = 1, nodes, tags }) {
    const id = await net.open({ protocol: 'modbus', host, ...(port ? { port } : {}) }), out = [], fr = new modbus.FrameReader();
    try {
      let tid = 0;
      for (const node of nodes) {
        const meta = tagOf(tags, node), a = checkAddress('modbus', node, meta.type);
        if (!a.ok) { out.push(bad(node)); continue; }
        const type = meta.type || (a.parsed.fc <= 2 ? 'bool' : 'u16');
        const quantity = a.parsed.fc <= 2 ? 1 : modbus.TYPES[type] || 1; tid = (tid % 0xffff) + 1;
        await net.send(id, modbus.readRequest({ tid, unit, fc: a.parsed.fc, address: a.parsed.address, quantity }));
        const until = Date.now() + timeoutMs; let res = null;
        while (!res) {
          const got = await sleepless(id, until); if (got === null) break;
          let frames; try { frames = fr.push(got); } catch { break; }
          for (const f of frames) { try { const r = modbus.parseResponse(f, r0(f)); if (r.tid === tid) res = r; } catch { /* a frame that is not ours or not whole is skipped */ } }
        }
        if (!res) continue;
        if (res.exception) { out.push(bad(node)); continue; }
        try { out.push({ node, value: res.bits ? res.bits[0] : modbus.decodeWords(res.words, { type, wordOrder: meta.wordOrder, byteOrder: meta.byteOrder }), quality: 'good', at: now() }); } catch { out.push(bad(node)); }
      }
    } finally { await net.close(id); }
    return out;
  }
  // parseResponse wants the function and quantity only to cross-check; a frame of another request is told apart by its transaction id instead
  const r0 = () => ({});

  async function readMqtt({ host, port, nodes }) {
    const id = await net.open({ protocol: 'mqtt', host, ...(port ? { port } : {}) }), out = [], pr = new mqtt.PacketReader();
    const filters = [...new Set(nodes.map((n) => String(n).split('#json.')[0]))];
    try {
      await net.send(id, mqtt.connect({ clientId: 'cadcraft-' + Math.random().toString(36).slice(2, 10), keepAlive: 30 }));
      const until = Date.now() + timeoutMs; let acked = false, subbed = false; const seen = new Set();
      while (Date.now() < until && seen.size < nodes.length) {
        const got = await sleepless(id, until); if (got === null) break;
        let pk; try { pk = pr.push(got); } catch { break; }
        for (const p of pk) {
          if (p.type === 'connack') { if (!p.ok) throw new ProtocolError('refused', 'The broker refused the connection: ' + p.text + '.'); acked = true; await net.send(id, mqtt.subscribe(1, filters)); }
          else if (p.type === 'suback') subbed = true;
          else if (p.type === 'publish') {
            if (p.qos === 1 && p.packetId != null) await net.send(id, mqtt.puback(p.packetId));
            for (const node of nodes) {
              const [flt, path] = String(node).split('#json.'); if (seen.has(node) || !mqtt.topicMatches(flt, p.topic)) continue;
              const v = mqtt.readPayload(p.payload, path ? { mode: 'json', path } : { mode: 'number' }), t = v === null ? mqtt.readPayload(p.payload, { mode: 'bool' }) : v;
              out.push(t === null ? bad(node) : { node, value: t, quality: 'good', at: now() }); seen.add(node);
            }
          }
        }
      }
      if (!acked) throw new ProtocolError('timeout', 'The broker did not answer.');
      void subbed;
      try { await net.send(id, mqtt.disconnect()); } catch { /* closing anyway */ }
    } finally { await net.close(id); }
    return out;
  }

  async function readBacnet({ host, port, nodes }) {
    const id = await net.open({ protocol: 'bacnet', host, ...(port ? { port } : {}) }), out = [];
    try {
      let invoke = 0;
      for (const node of nodes) {
        const a = checkAddress('bacnet', node); if (!a.ok) { out.push(bad(node)); continue; }
        invoke = (invoke + 1) & 255;
        await net.send(id, bacnet.readProperty({ invoke, object: a.parsed, property: 'present-value' }));
        const until = Date.now() + timeoutMs; let res = null;
        while (!res) {
          const got = await sleepless(id, until); if (got === null) break;
          if (!got.length) continue;
          try { const r = bacnet.parseReadAck(got); if (r.invoke === invoke) res = r; } catch { /* another datagram, or one we do not read */ }
        }
        if (!res) continue;
        if (res.error || res.reject !== undefined || res.abort !== undefined || !res.values || !res.values.length) { out.push(bad(node)); continue; }
        const v = res.values[0].value; out.push({ node, value: typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string' ? v : null, quality: v === null || typeof v === 'object' ? 'bad' : 'good', at: now() });
      }
    } finally { await net.close(id); }
    return out;
  }

  const readers = { modbus: readModbus, mqtt: readMqtt, bacnet: readBacnet };
  async function read(plan) {
    const fn = readers[plan?.protocol]; if (!fn) throw new ProtocolError('protocol', 'This pipe reads Modbus TCP, MQTT and BACnet/IP.');
    const nodes = Array.isArray(plan.nodes) ? plan.nodes.map(String) : [];
    if (!nodes.length) return [];
    if (plan.port != null && !(Number.isInteger(plan.port) && plan.port >= 1 && plan.port <= 65535)) throw new ProtocolError('port', 'The port must be 1 to 65535.');
    return fn({ ...plan, nodes });
  }

  /** BACnet Who-Is: every device that answers inside waitMs. */
  async function discover({ low, high, waitMs = 3000 } = {}) {
    const id = await net.open({ protocol: 'bacnet', host: 'broadcast', port: PROTOCOLS.bacnet }), found = new Map();
    try {
      await net.send(id, bacnet.whoIs(low != null ? { low, high } : {}));
      const until = Date.now() + Math.min(waitMs, 15000);
      for (;;) { const got = await sleepless(id, until); if (got === null) break; if (!got.length) continue; try { const d = bacnet.parseIAm(got); if (!found.has(d.device)) found.set(d.device, d); } catch { /* not an I-Am */ } }
    } finally { await net.close(id); }
    return [...found.values()];
  }
  return { read, discover };
}

/** The adapter connect-ui uses: bridge().live.read(...) over Studio's liveNet. */
export function studioBridge(g = globalThis) {
  const net = g && g.cadcraftDesktop && g.cadcraftDesktop.liveNet; if (!net) return null;
  let rd; try { rd = makeReader(net); } catch { return null; }
  return { live: { read: (plan) => rd.read(plan), discover: (o) => rd.discover(o) } };
}
