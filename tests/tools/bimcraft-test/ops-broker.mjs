/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-broker.mjs — a tiny MQTT 3.1.1 broker over WebSockets and a JSON endpoint, for BimCraft's live-feed tests only
 * (0.7 LC.12 item 4, session bim-ops). No dependency: the WebSocket handshake and frames (RFC 6455) are written here.
 * Listens on 127.0.0.1 only. Never part of the app.
 *
 *   const b = await startBroker({ user, pass, token })   → { port, url (ws://127.0.0.1:port/mqtt), http (…/readings),
 *       publish(topic, text, qos), log: { connects, subscribes, pubacks, pings, disconnects, polls, auth, cookies },
 *       readings (the JSON the endpoint returns; change it freely), close() }
 */
import http from 'node:http';
import crypto from 'node:crypto';

export async function startBroker({ user = '', pass = '', token = '', port = 0 } = {}) {
  const clients = new Set();
  const log = { connects: [], subscribes: [], pubacks: [], pings: 0, disconnects: 0, polls: 0, auth: [], cookies: 0, origins: [] };
  const state = { readings: {}, status: 200 };
  let nextId = 1;
  const server = http.createServer((req, res) => {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization', 'Access-Control-Allow-Methods': 'GET' };
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
    if (req.url.startsWith('/readings')) {
      log.polls++;
      log.auth.push(req.headers.authorization || '');
      if (req.headers.cookie) log.cookies++;
      log.origins.push(req.headers.origin || '');
      if (token && req.headers.authorization !== 'Bearer ' + token) { res.writeHead(401, cors); res.end(); return; }
      if (state.status !== 200) { res.writeHead(state.status, cors); res.end(); return; }
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
      res.end(JSON.stringify(state.readings));
      return;
    }
    res.writeHead(404); res.end();
  });
  server.on('upgrade', (req, socket) => {
    const key = req.headers['sec-websocket-key'];
    const protos = String(req.headers['sec-websocket-protocol'] || '').split(',').map((s) => s.trim());
    if (!key || !protos.includes('mqtt')) { socket.destroy(); return; }
    const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\nSec-WebSocket-Protocol: mqtt\r\n\r\n');
    const c = { socket, subs: [], buf: Buffer.alloc(0), mq: Buffer.alloc(0) };
    clients.add(c);
    const send = (bytes) => {
      const b = Buffer.from(bytes), n = b.length;
      const head = n < 126 ? Buffer.from([0x82, n]) : n < 65536 ? Buffer.from([0x82, 126, n >> 8, n & 255]) : (() => { const h = Buffer.alloc(10); h[0] = 0x82; h[1] = 127; h.writeBigUInt64BE(BigInt(n), 2); return h; })();
      if (!socket.destroyed) socket.write(Buffer.concat([head, b]));
    };
    c.send = send;
    const mqtt = (h, body) => {
      const type = h >> 4;
      if (type === 1) {   // CONNECT
        let at = 0;
        const s = () => { const n = body.readUInt16BE(at); const v = body.subarray(at + 2, at + 2 + n).toString('utf8'); at += 2 + n; return v; };
        const proto = s(), level = body[at++], flags = body[at++], keep = body.readUInt16BE(at); at += 2;
        const clientId = s(), u = flags & 0x80 ? s() : '', p = flags & 0x40 ? s() : '';
        log.connects.push({ proto, level, flags, keep, clientId, user: u, pass: p });
        const ok = (!user || u === user) && (!pass || p === pass);
        send([0x20, 2, 0, ok ? 0 : 5]);
        if (!ok) socket.end();
      } else if (type === 8) {   // SUBSCRIBE
        const id = body.readUInt16BE(0), filters = [];
        let at = 2;
        while (at < body.length) { const n = body.readUInt16BE(at); filters.push(body.subarray(at + 2, at + 2 + n).toString('utf8')); at += 2 + n + 1; }
        c.subs.push(...filters);
        log.subscribes.push({ id, filters, flags: h & 15 });
        send([0x90, 2 + filters.length, id >> 8, id & 255, ...filters.map(() => 1)]);
      } else if (type === 4) log.pubacks.push(body.readUInt16BE(0));
      else if (type === 12) { log.pings++; send([0xd0, 0]); }
      else if (type === 14) { log.disconnects++; socket.end(); }
    };
    const readMqtt = () => {
      for (;;) {
        if (c.mq.length < 2) return;
        let n = 0, mul = 1, i = 1;
        for (;;) { if (i >= c.mq.length) return; const x = c.mq[i++]; n += (x & 127) * mul; if (!(x & 128)) break; mul *= 128; }
        if (c.mq.length < i + n) return;
        mqtt(c.mq[0], c.mq.subarray(i, i + n));
        c.mq = c.mq.subarray(i + n);
      }
    };
    socket.on('data', (d) => {
      c.buf = Buffer.concat([c.buf, d]);
      for (;;) {
        if (c.buf.length < 2) return;
        const op = c.buf[0] & 15, masked = c.buf[1] & 128;
        let len = c.buf[1] & 127, at = 2;
        if (len === 126) { if (c.buf.length < 4) return; len = c.buf.readUInt16BE(2); at = 4; }
        else if (len === 127) { if (c.buf.length < 10) return; len = Number(c.buf.readBigUInt64BE(2)); at = 10; }
        const mask = masked ? c.buf.subarray(at, at + 4) : null;
        if (masked) at += 4;
        if (c.buf.length < at + len) return;
        const payload = Buffer.from(c.buf.subarray(at, at + len));
        if (mask) for (let k = 0; k < payload.length; k++) payload[k] ^= mask[k & 3];
        c.buf = c.buf.subarray(at + len);
        if (op === 8) { socket.end(Buffer.from([0x88, 0])); return; }
        if (op === 9) { socket.write(Buffer.concat([Buffer.from([0x8a, payload.length]), payload])); continue; }
        if (op === 2 || op === 0) { c.mq = Buffer.concat([c.mq, payload]); readMqtt(); }
      }
    });
    socket.on('close', () => clients.delete(c));
    socket.on('error', () => clients.delete(c));
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  port = server.address().port;
  const match = (f, t) => { const F = f.split('/'), T = t.split('/'); for (let i = 0; i < F.length; i++) { if (F[i] === '#') return true; if (i >= T.length || (F[i] !== '+' && F[i] !== T[i])) return false; } return F.length === T.length; };
  return {
    port, url: 'ws://127.0.0.1:' + port + '/mqtt', http: 'http://127.0.0.1:' + port + '/readings', log,
    get readings() { return state.readings; }, set readings(v) { state.readings = v; }, set status(v) { state.status = v; },
    get clients() { return clients.size; },
    publish(topic, text, qos = 1) {
      const t = Buffer.from(topic, 'utf8'), p = Buffer.from(String(text), 'utf8');
      for (const c of clients) {
        if (!c.subs.some((f) => match(f, topic))) continue;
        const id = nextId++;
        const body = Buffer.concat([Buffer.from([t.length >> 8, t.length & 255]), t, qos ? Buffer.from([id >> 8, id & 255]) : Buffer.alloc(0), p]);
        const len = []; let n = body.length; do { let b = n % 128; n = Math.floor(n / 128); if (n) b |= 128; len.push(b); } while (n);
        c.send(Buffer.concat([Buffer.from([0x30 | (qos << 1), ...len]), body]));
      }
    },
    close: () => new Promise((r) => { for (const c of clients) c.socket.destroy(); server.close(() => r()); }),
  };
}

// node tools/bimcraft-test/ops-broker.mjs [--port 9001] [--tags W1,W2,W5] → runs one on 127.0.0.1 for a hand check or a video:
// every 2 s it publishes site/<tag>/temperature for each tag (a slow wave around 22 °C) and serves the same at /readings
if (process.argv[1] && import.meta.url === 'file://' + process.argv[1]) {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const b = await startBroker({ port: Number(arg('--port', 0)) || 0 });
  const tags = String(arg('--tags', 'W1')).split(',').filter(Boolean);
  console.log(JSON.stringify({ mqtt: b.url, http: b.http, tags }));
  let k = 0;
  setInterval(() => { k++; const r = {}; tags.forEach((t, i) => { const v = (22 + 6 * Math.sin(k / 8 + i)).toFixed(2); r[t] = Number(v); b.publish('site/' + t + '/temperature', v); }); b.readings = r; }, 2000);
}
