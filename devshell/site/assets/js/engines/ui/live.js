/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ui/live.js — the Engines panel's descriptor for lib/live (0.8 XE.9). Codecs and a tag store only: nothing here opens a network connection,
 * and the engine can only read. Input: one JSON object with any of the sections
 *   modbus { request { unit, fc, address, quantity }, responseHex, decode { type, scale, offset } }
 *   mqtt   { connect { clientId }, subscribe [filters], packetsHex (bytes of a broker's reply), payload { mode, path } }
 *   bacnet { whoIs { low, high }, readProperty { object { type, instance }, property } }
 *   store  { now, staleS, tags [...], samples [{ source, node, value, quality, at }], compare { tagId: modelValue } }
 */
const EXAMPLE = {
  modbus: { request: { tid: 1, unit: 17, fc: 3, address: 107, quantity: 3 }, responseHex: '00 01 00 00 00 09 11 03 06 ae 41 56 52 43 40', decode: { type: 'u16' } },
  mqtt: { connect: { clientId: 'a' }, subscribe: ['plant/+/temp'], packetsHex: '20 02 00 00 90 03 00 01 00 30 13 00 0d 70 6c 61 6e 74 2f 70 31 2f 74 65 6d 70 32 31 2e 35', payload: { mode: 'number' } },
  store: {
    now: 1000000, staleS: 30,
    tags: [{ id: 'T1', source: 'plc', node: 'hr:100', label: 'Tank temperature', unit: 'C', scale: 0.1, offset: -5, target: { kind: '3d', id: 'tank-1', prop: 'temperature' }, high: 80, low: 10, deadband: 5, range: [0, 100] },
      { id: 'P1', source: 'mq', node: 'plant/p1', unit: 'bar', target: { kind: 'pid', id: 'PI-101' } }],
    samples: [{ source: 'plc', node: 'hr:100', value: 900, quality: 'good', at: 1000000 }, { source: 'mq', node: 'plant/p1', value: 4.25, quality: 'good', at: 1000000 }],
    compare: { T1: 80, P1: 4 },
  },
};

const hexOf = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join(' ');
const bytesOf = (s) => Uint8Array.from(String(s).trim().split(/\s+/).filter(Boolean).map((x) => { const v = parseInt(x, 16); if (!Number.isInteger(v) || v < 0 || v > 255) throw new Error('"' + x + '" is not a hex byte.'); return v; }));

export default {
  inputLabel: 'Live data (JSON)',
  examples: [{ id: 'codecs', name: 'Modbus, MQTT and a tag store', text: JSON.stringify(EXAMPLE, null, 1) }],
  load: () => import('../live/index.js'),
  run(L, text) {
    const o = JSON.parse(text);
    if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('The input must be a JSON object with sections such as modbus, mqtt, bacnet or store.');
    const tables = [], problems = [], notes = [];
    const guard = (label, f) => { try { f(); } catch (e) { problems.push({ code: 'live.' + (e.code || 'input'), severity: 'error', text: label + ': ' + e.message }); } };
    if (o.modbus) guard('Modbus', () => {
      const m = o.modbus, rows = [];
      if (m.request) rows.push(['Read request (hex)', hexOf(L.modbus.readRequest(m.request))]);
      if (m.responseHex) {
        const r = L.modbus.parseResponse(bytesOf(m.responseHex), { fc: m.request?.fc, quantity: m.request?.quantity });
        if (r.exception) problems.push({ code: 'live.modbus-exception', severity: 'warning', text: 'The device answered with exception ' + r.code + ': ' + r.text });
        else if (r.words) {
          rows.push(['Registers (hex)', r.words.map((w) => w.toString(16).padStart(4, '0')).join(' ')]);
          if (m.decode) rows.push(['Decoded value', L.modbus.decodeWords(r.words.slice(0, L.modbus.TYPES[m.decode.type || 'u16'] || 1), m.decode)]);
        } else if (r.bits) rows.push(['Bits', r.bits.map((b) => (b ? 1 : 0)).join('')]);
      }
      tables.push({ title: 'Modbus TCP (read only)', head: ['Item', 'Value'], rows });
    });
    if (o.mqtt) guard('MQTT', () => {
      const m = o.mqtt, rows = [];
      if (m.connect) rows.push(['CONNECT (hex)', hexOf(L.mqtt.connect(m.connect))]);
      if (Array.isArray(m.subscribe)) rows.push(['SUBSCRIBE (hex)', hexOf(L.mqtt.subscribe(1, m.subscribe))]);
      tables.push({ title: 'MQTT 3.1.1 (subscribe only)', head: ['Item', 'Value'], rows });
      if (m.packetsHex) {
        const rd = new L.mqtt.PacketReader(), pk = rd.push(bytesOf(m.packetsHex));
        tables.push({ title: 'MQTT packets received', head: ['Type', 'Topic', 'Payload', 'Value', 'Matches filter'], rows: pk.map((p) => {
          const pay = p.payload ? new TextDecoder().decode(p.payload) : '';
          return [p.type, p.topic || '', pay, p.payload ? L.mqtt.readPayload(p.payload, m.payload || {}) : '', p.topic && Array.isArray(m.subscribe) ? m.subscribe.some((f) => L.mqtt.topicMatches(f, p.topic)) : ''];
        }) });
      }
    });
    if (o.bacnet) guard('BACnet', () => {
      const b = o.bacnet, rows = [];
      if (b.whoIs) rows.push(['Who-Is (hex)', hexOf(L.bacnet.whoIs(b.whoIs))]);
      if (b.readProperty) rows.push(['ReadProperty (hex)', hexOf(L.bacnet.readProperty({ invoke: 1, ...b.readProperty, object: b.readProperty.object }))]);
      tables.push({ title: 'BACnet/IP (read only)', head: ['Item', 'Value'], rows });
    });
    if (o.store) guard('Tag store', () => {
      const s = o.store; let now = Number.isFinite(s.now) ? s.now : Date.now();
      const st = new L.LiveStore({ now: () => now, staleS: s.staleS || 60 });
      const d = st.define(s.tags || []);
      for (const p of d.problems) problems.push(p);
      for (const sm of s.samples || []) st.apply(sm.source, [sm]);
      tables.push({ title: 'Tags', head: ['Tag', 'Label', 'Value', 'Unit', 'Quality', 'State'], rows: st.rows().map((r) => [r.id, r.label, r.value ?? r.raw, r.unit, r.quality, r.state]) });
      const mk = st.markers();
      if (mk.length) tables.push({ title: 'Markers for drawings and 3D', head: ['Tag', 'Target', 'Text', 'State', 'Level 0..1'], rows: mk.map((m) => [m.id, m.target.kind + ':' + m.target.id, m.text, m.state, m.level]) });
      for (const p of st.problems()) problems.push(p);
      if (s.compare) { const c = st.compare(s.compare); tables.push({ title: 'Plant against model', head: ['Tag', 'Plant', 'Model', 'Deviation'], rows: c.rows.map((r) => [r.id, r.plant ?? r.value, r.model, r.deviation ?? r.dev]) }); for (const p of c.problems) problems.push(p); }
      notes.push(L.LiveStore ? 'Read-only plant and building data, for viewing and comparison. Nothing here controls equipment, and nothing here is an alarm system or a safety function.' : '');
    });
    if (!tables.length && !problems.length) problems.push({ code: 'empty', severity: 'warning', text: 'No known section found: use modbus, mqtt, bacnet or store.' });
    return { tables, problems, notes };
  },
};
