/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-feeds.mjs — LC.12 item 4 (session bim-ops): live feeds from the browser (assets-bim-live.js). MQTT 3.1.1 packets
 * checked against the standard's own numbers; then the client and the poller against a real local broker and endpoint
 * (ops-broker.mjs, 127.0.0.1 only) through Node's own WebSocket and fetch. Part of ops-test.mjs (`--ops --only feeds`).
 */
import path from 'node:path';
import { startBroker } from './ops-broker.mjs';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(f, ms = 4000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (f()) return true; await wait(20); } return f(); }

export default async function feedsPart({ APP, ROOT, ok, saved, open }) {
  console.log('== LC.12 live feeds (MQTT over WebSockets, HTTP polling)');
  const L = await import(path.join(APP, 'assets-bim-live.js'));
  const hex = (b) => [...b].map((x) => x.toString(16).padStart(2, '0')).join(' ');

  // ---- settings kept in the IFC on the person's say-so (never a secret)
  {
    const { fixtureIfc } = await import(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs'));
    const ed = await open(fixtureIfc());
    ok(L.readFeedSettings(ed.api, ed.mid) === null, 'no feed settings in a fresh file');
    ed.modelChange(L.feedSettingsOp({ kind: 'mqtt', url: 'wss://broker.example.com:8884/mqtt', topics: ['site/{tag}/temperature', 'site/{tag}/humidity'], valueKey: 'v', every: 30 }));
    ed.modelChange(L.feedSettingsOp({ kind: 'mqtt', url: 'wss://broker.example.com:8884/mqtt', topics: ['site/{tag}/temperature'], valueKey: 'v' }));
    const s = L.readFeedSettings(ed.api, ed.mid), txt = new TextDecoder().decode(ed.save());
    ok(s.kind === 'mqtt' && s.url === 'wss://broker.example.com:8884/mqtt' && s.topics.join() === 'site/{tag}/temperature' && s.valueKey === 'v' && (txt.match(/'CadCraft_Feed'/g) || []).length === 1 && !/Topic2/.test(txt),
      'CadCraft_Feed on the project: kind, address, one property per topic, value key; saved again → one set, no topic left over', JSON.stringify(s));
    ok(!/password|token|secret/i.test(txt.split('\n').filter((l) => /CadCraft_Feed|IFCPROPERTYSINGLEVALUE/.test(l)).join()), 'no password, token or secret field exists in the set');
    ok((() => { try { L.feedSettingsOp({ kind: 'mqtt', url: 'wss://fm:pw@broker.example.com' }); return false; } catch (e) { return e.key === 'assets.live.err.userinfo'; } })(), 'an address with a password in it is refused before anything is written');
    saved['feeds-ifc4'] = ed.save();
  }

  // ---- remaining length: the table in MQTT 3.1.1 § 2.2.3
  const table = [[0, '00'], [127, '7f'], [128, '80 01'], [16383, 'ff 7f'], [16384, '80 80 01'], [2097151, 'ff ff 7f'], [2097152, '80 80 80 01'], [268435455, 'ff ff ff 7f']];
  ok(table.every(([n, h]) => hex(L.encodeLength(n)) === h && L.decodeLength(Uint8Array.from(h.split(' ').map((x) => parseInt(x, 16))), 0).n === n), 'remaining length: every row of the standard\'s table both ways (0, 127, 128 … 268 435 455)');
  const tooLong = (() => { try { L.decodeLength(Uint8Array.from([0xff, 0xff, 0xff, 0xff, 0x01]), 0); return false; } catch { return true; } })();
  ok(tooLong && L.decodeLength(Uint8Array.from([0x80]), 0) === null, 'a fifth length byte is refused; a cut-off length waits for more bytes');
  // CONNECT: § 3.1 — protocol name "MQTT", level 4, flags (user 0x80, password 0x40, clean session 0x02), keep alive
  const cp = L.connectPacket({ clientId: 'c1', username: 'u', password: 'p', keepAlive: 30 });
  ok(hex(cp) === '10 14 00 04 4d 51 54 54 04 c2 00 1e 00 02 63 31 00 01 75 00 01 70', 'CONNECT, byte for byte: 10 14 · 00 04 "MQTT" · level 4 · flags C2 (user, password, clean) · keep alive 30 · "c1" · "u" · "p"', hex(cp));
  ok(hex(L.subscribePacket(1, ['site/+/temp'])) === '82 10 00 01 00 0b 73 69 74 65 2f 2b 2f 74 65 6d 70 01' && hex(L.pubackPacket(258)) === '40 02 01 02' && hex(L.PINGREQ) === 'c0 00' && hex(L.DISCONNECT) === 'e0 00',
    'SUBSCRIBE (fixed flags 0010, QoS 1 asked), PUBACK, PINGREQ, DISCONNECT byte for byte');
  // the reader: a PUBLISH QoS 1 split across three chunks, then CONNACK + SUBACK in one
  const pub = Uint8Array.from([0x32, 0x0f, 0x00, 0x07, ...new TextEncoder().encode('a/AHU-1'), 0x00, 0x2a, ...new TextEncoder().encode('21.5')]);
  const R = new L.PacketReader();
  const got = [...R.push(pub.subarray(0, 1)), ...R.push(pub.subarray(1, 6)), ...R.push(pub.subarray(6))];
  ok(got.length === 1 && got[0].type === 'PUBLISH' && got[0].topic === 'a/AHU-1' && got[0].qos === 1 && got[0].id === 42 && new TextDecoder().decode(got[0].payload) === '21.5', 'a PUBLISH (QoS 1, id 42) arriving in three pieces is read once, whole');
  const two = new L.PacketReader().push(Uint8Array.from([0x20, 2, 0, 0, 0x90, 3, 0, 1, 1]));
  ok(two.length === 2 && two[0].type === 'CONNACK' && two[0].code === 0 && two[1].type === 'SUBACK' && two[1].codes[0] === 1, 'CONNACK and SUBACK in one message: both read');
  ok((() => { try { new L.PacketReader({ max: 1000 }).push(Uint8Array.from([0x30, ...L.encodeLength(5000)])); return false; } catch (e) { return e.key === 'assets.live.err.too-big'; } })(), 'a packet announcing more than the limit is refused before anything is buffered');

  // ---- topics: the examples of § 4.7
  const M = [['sport/tennis/player1/#', 'sport/tennis/player1', true], ['sport/tennis/player1/#', 'sport/tennis/player1/ranking', true], ['sport/tennis/player1/#', 'sport/tennis/player1/score/wimbledon', true],
    ['sport/#', 'sport', true], ['sport/tennis/+', 'sport/tennis/player1', true], ['sport/tennis/+', 'sport/tennis/player1/ranking', false], ['sport/+', 'sport', false], ['+/+', '/finance', true], ['+', '/finance', false]];
  ok(M.every(([f, t, want]) => L.topicMatches(f, t) === want), 'topic filters: every example of the standard (# takes the parent level too; + one level)', M.filter(([f, t, w]) => L.topicMatches(f, t) !== w).map((x) => x.join(' ')).join(' | '));
  ok(L.templateFilter('site/{tag}/temp') === 'site/+/temp' && L.templateTag('site/{tag}/temp', 'site/AHU-1/temp') === 'AHU-1' && L.templateTag('site/{tag}/temp', 'site/AHU-1/hum') === null && L.templateTag('plant/boiler-1', 'plant/boiler-1') === 'plant/boiler-1', 'a topic template: {tag} subscribes as + and names the asset; no {tag} → the topic names it');

  // ---- payloads and polled bodies
  ok(L.readPayload('21.5').v === 21.5 && L.readPayload('{"value":19,"time":"2026-10-23T10:00:00Z"}').t === Date.UTC(2026, 9, 23, 10) && L.readPayload('{"temp":"22.1","ts":1761213600}', { valueKey: 'temp' }).t === 1761213600000 && L.readPayload('{"value":"hot"}') === null && L.readPayload('<html>') === null,
    'payloads: a bare number; JSON with value + time; another value key and Unix seconds; words and HTML refused');
  const p1 = L.readPoll('{"AHU-1":21.5,"P-2":{"value":3.2,"time":"2026-10-23T10:00:00Z"},"bad":"x"}', 'application/json');
  const p2 = L.readPoll('[{"tag":"AHU-1","value":21},{"id":"P-2","value":"3.5"},{"value":1}]', '');
  const p3 = L.readPoll('time,AHU-1\n2026-10-23T10:00:00Z,20\n2026-10-23T11:00:00Z,21\n', 'text/csv');
  ok(p1.length === 2 && p1[1].t === Date.UTC(2026, 9, 23, 10) && p2.map((x) => x.key + '=' + x.v).join() === 'AHU-1=21,P-2=3.5' && p3.length === 2 && p3[1].v === 21, 'polled bodies: a JSON object by tag, a JSON list (tag / id), a CSV of readings; unreadable values and rows with no name left out');
  ok((() => { try { L.readPoll('{oops', 'application/json'); return false; } catch (e) { return e.key === 'assets.live.err.body'; } })(), 'broken JSON: said, not guessed');

  // ---- addresses
  ok(L.feedUrl('wss://broker.example.com:8884/mqtt', 'mqtt') === '' && L.feedUrl('ws://127.0.0.1:9001', 'mqtt') === '' && L.feedUrl('ws://localhost:9001', 'mqtt') === '' && L.feedUrl('https://bms.example.com/api/readings', 'http') === '',
    'allowed: wss anywhere, ws on this computer, https for polling');
  ok(L.feedUrl('ws://broker.example.com/mqtt', 'mqtt') === 'assets.live.err.insecure' && L.feedUrl('http://bms.example.com/x', 'http') === 'assets.live.err.insecure' && L.feedUrl('ws://broker.example.com/mqtt', 'mqtt', 'http:') === ''
    && L.feedUrl('wss://u:p@broker.example.com', 'mqtt') === 'assets.live.err.userinfo' && L.feedUrl('https://x', 'mqtt') === 'assets.live.err.ws' && L.feedUrl('javascript:alert(1)', 'http') === 'assets.live.err.http' && L.feedUrl('not a url', 'http') === 'assets.live.err.url',
    'refused: plain ws / http to another computer from an https page (the browser would block it), a password in the address, the wrong scheme, javascript:, no address');

  // ---- the client against a real broker on 127.0.0.1
  if (typeof WebSocket !== 'function') { console.log('  --   this Node has no WebSocket: broker checks skipped'); return; }
  const b = await startBroker({ user: 'fm', pass: 'example-pw', token: 'tok-123' });
  try {
    const c = new L.MqttClient();
    const states = [], readings = [];
    c.onState = (s, d) => states.push(s + (d ? ':' + d : ''));
    c.onReading = (r) => readings.push(r);
    c.connect({ url: b.url, topics: ['site/{tag}/temp'], username: 'fm', password: 'example-pw', keepAlive: 1 });
    ok(!JSON.stringify(Object.entries(c).filter(([k]) => k !== 'ws').map(([k, v]) => [k, typeof v === 'function' ? '' : v])).includes('example-pw'), 'after connect the client object holds no password (only the CONNECT bytes did, until sent)');
    ok(await until(() => states.includes('connected') && b.log.subscribes.length === 1), 'connected: CONNECT with user and password accepted, then SUBSCRIBE', states.join());
    ok(b.log.connects[0].user === 'fm' && b.log.connects[0].pass === 'example-pw' && b.log.connects[0].proto === 'MQTT' && b.log.connects[0].level === 4 && b.log.subscribes[0].filters.join() === 'site/+/temp', 'the broker saw MQTT level 4, the login, and the filter site/+/temp');
    b.publish('site/AHU-1/temp', '21.5', 1);
    b.publish('site/AHU-1/hum', '55', 1);
    b.publish('site/P-2/temp', '{"value":18.25,"time":"2026-10-23T10:00:00Z"}', 0);
    ok(await until(() => readings.length === 2 && b.log.pubacks.length >= 1), 'two readings arrive (the humidity topic is not subscribed)', JSON.stringify(readings));
    ok(readings[0].key === 'AHU-1' && readings[0].v === 21.5 && readings[1].key === 'P-2' && readings[1].t === Date.UTC(2026, 9, 23, 10) && b.log.pubacks.length === 1, 'AHU-1 = 21.5 (QoS 1, acknowledged), P-2 = 18.25 with its own time (QoS 0, no acknowledgement owed)');
    ok(await until(() => b.log.pings >= 1, 2500), 'keep alive: a PINGREQ before the keep-alive time runs out');
    c.close();
    ok(await until(() => b.log.disconnects === 1 && c.state === 'closed'), 'Disconnect: DISCONNECT sent, closed');
    // a wrong password is refused, said
    const c2 = new L.MqttClient(), st2 = [];
    c2.onState = (s, d) => st2.push(s + (d ? ':' + d : ''));
    c2.connect({ url: b.url, topics: ['site/{tag}/temp'], username: 'fm', password: 'wrong' });
    ok(await until(() => st2.some((s) => /^error:refused-5/.test(s))), 'a wrong password: the broker says "not authorised" (5), the client says so and closes', st2.join());
    c2.close();
    // ---- HTTP polling: a token, no cookies, the backoff
    const pr = [], ps = [], waits = [];
    const poll = new L.HttpPoller({ setTimeout: (f, ms) => { waits.push(ms); return 0; }, clearTimeout: () => {} });
    poll.onState = (s, d) => ps.push(s + (d ? ':' + d : ''));
    poll.onReading = (r) => pr.push(r);
    b.readings = { 'AHU-1': 22.75, 'P-2': { value: 3, time: '2026-10-23T09:00:00Z' } };
    poll.start({ url: b.http, every: 2, token: 'tok-123' });
    ok(await until(() => pr.length === 2), 'polling: both readings from the JSON', JSON.stringify(pr));
    ok(b.log.auth[0] === 'Bearer tok-123' && b.log.cookies === 0 && waits[0] === 5000, 'the token went as "Authorization: Bearer"; no cookies; a 2 s interval raised to the 5 s floor', JSON.stringify({ auth: b.log.auth, waits }));
    poll.stop();
    const pf = new L.HttpPoller({ setTimeout: (f, ms) => { waits.push(ms); return 0; }, clearTimeout: () => {} }), fs2 = [];
    pf.onState = (s, d) => fs2.push(s + (d ? ':' + d : ''));
    pf.start({ url: b.http, every: 30, token: 'wrong' });
    ok(await until(() => fs2.some((s) => /error:http-401/.test(s))) && waits[waits.length - 1] === 60000, 'a refused token: said (401), and the next try waits twice as long (60 s)', JSON.stringify({ fs2, last: waits[waits.length - 1] }));
    pf.stop();
  } finally { await b.close(); }
}
