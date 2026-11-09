/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: English fallback words of the Connect panel; a host's own language file wins (same shape as the Plant add-on's engineering words) */
export const WORDS = {
  'live.lede': 'Show readings from a plant or a building on the drawing. Read only: nothing here writes to a device or raises an alarm. A device on a public address needs your yes for that host.',
  'live.h.devices': 'Devices', 'live.h.map': 'Tag map (table)', 'live.h.readings': 'Try it with readings (CSV: tag,time,value,quality)',
  'live.dev.id': 'Device name', 'live.dev.protocol': 'Protocol', 'live.dev.host': 'Host or address', 'live.dev.port': 'Port', 'live.dev.unit': 'Unit id', 'live.dev.approve': 'I approve this host',
  'live.dev.add': 'Add the device', 'live.dev.remove': 'Remove', 'live.dev.none': 'No device yet.', 'live.dev.approved': 'approved', 'live.dev.added': 'Device {id} added.',
  'live.proto.modbus': 'Modbus TCP', 'live.proto.mqtt': 'MQTT', 'live.proto.bacnet': 'BACnet/IP', 'live.proto.opcua': 'OPC UA',
  'live.map.csv': 'Tag map table', 'live.read.csv': 'Readings',
  'live.act.check': 'Check the map', 'live.act.read': 'Show these readings', 'live.act.device': 'Read the devices (Studio)', 'live.act.export': 'Save the map (CSV)', 'live.act.template': 'Start again from the example',
  'live.check.done': '{tags} tags on {devices} devices checked: {problems} things to look at.',
  'live.read.done': '{n} readings placed.', 'live.read.device': '{n} readings read from the devices.', 'live.read.unknown': 'Not in the map: {tags}.',
  'live.bridge.none': 'Reading a device needs CadCraft Studio: a browser page cannot open a plant network connection. Use a CSV of readings meanwhile.',
  'live.bridge.noproto': 'This Studio does not read {protocol} yet.',
  'live.state.waiting': 'waiting', 'live.state.ok': 'ok', 'live.state.uncertain': 'uncertain', 'live.state.bad': 'bad quality', 'live.state.stale': 'stale', 'live.state.high': 'high', 'live.state.low': 'low',
  'live.note': 'Read-only plant and building data, for viewing and comparison. Not an alarm system or a safety function.',
};
export const wordsOf = (t) => (k, v) => { const r = t ? t(k, v) : k; if (r && r !== k) return r; return (WORDS[k] || k).replace(/\{(\w+)\}/g, (m, a) => (v && v[a] !== undefined ? v[a] : m)); };
