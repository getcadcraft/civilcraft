/* SPDX-License-Identifier: Apache-2.0 */
/**
 * live-server.mjs — Studio's local MCP server, the reference (docs/AGENTS-SPEC.md §6.2; 0.4 part 2 item X.5).
 *
 * The desktop shell implements these same rules natively (it cannot run Node); this file is the reference it is checked
 * against, and what bin/test-agents.mjs runs. It decides nothing about tools or permissions: it checks the request, then
 * hands the JSON-RPC message to `forward(message, session)` — in Studio that is the hub page's createControlRelay()
 * (host.js), which routes it to an app window over the window channel; the window's Settings › Assistants decide.
 *
 *   const srv = createLiveServer({ forward: (msg, session) => relay.handle(msg, session), port: 47615 });
 *   const { url, port, token } = await srv.start();     // url = http://127.0.0.1:<port>/mcp
 *   srv.dropSession(id)   (the person pressed Disconnect)   srv.newToken()   srv.close()
 *
 * Rules: binds 127.0.0.1 only · `Authorization: Bearer <token>` on every request (32 random bytes, base64url, made at start
 * and by newToken(); compared in constant time; never in a URL) else 401 · a Host other than 127.0.0.1:<port> or
 * localhost:<port> → 403 (DNS rebinding) · any Origin header → 403 (browsers send one; MCP clients do not) · POST /mcp
 * (Streamable HTTP, JSON responses, no SSE): `initialize` issues `Mcp-Session-Id`; every later request needs it (missing →
 * 400, unknown or ended → 404); a notification or response → 202; GET → 405; DELETE with the session id ends it (204) ·
 * POST /control: the JSON control channel, same token, optional `X-CadCraft-Session` · bodies ≤ 4 MB (413), JSON only
 * (415) · anything else 404.
 *
 * 0.8 (docs/AI-CONNECT-SPEC.md § 0, § 1.4): dual-era. A request whose params._meta carries io.modelcontextprotocol/protocolVersion
 * is MCP 2026-07-28: stateless, no session (the client is named by its clientInfo and the token), and it must carry the headers
 * `MCP-Protocol-Version`, `Mcp-Method` and (tools/call) `Mcp-Name`, equal to the body, else 400 with code -32020
 * (HeaderMismatch). Protocol errors (-32602, -32020…-32022) answer HTTP 400. `initialize` keeps the legacy behaviour above.
 * dropSession(name) on a stateless client blocks it (401, with the sentence) until `allow(name)`; newToken() ends all.
 */
import http from 'node:http';
import crypto from 'node:crypto';

export const DEFAULT_PORT = 47615;
const MAX_BODY = 4 * 1024 * 1024;

const META_V = 'io.modelcontextprotocol/protocolVersion', META_I = 'io.modelcontextprotocol/clientInfo';
const b64 = (v) => { const m = /^=\?base64\?(.*)\?=$/.exec(String(v)); return m ? Buffer.from(m[1], 'base64').toString('utf8') : String(v); };

export const randomToken = () => crypto.randomBytes(32).toString('base64url');

export function tokenMatches(given, token) {
  const a = Buffer.from(String(given || '')), b = Buffer.from(String(token || ''));
  if (!b.length || a.length !== b.length) { crypto.timingSafeEqual(b, b); return false; }   // same work either way
  return crypto.timingSafeEqual(a, b);
}

export function createLiveServer({ forward, port = DEFAULT_PORT, host = '127.0.0.1', token = randomToken(), log = null, maxSessions = 32 } = {}) {
  if (typeof forward !== 'function') throw new Error('createLiveServer needs forward(message, session).');
  if (host !== '127.0.0.1') throw new Error('Studio\'s server listens on 127.0.0.1 only.');
  let tok = token, srv = null, actualPort = port;
  const sessions = new Map();   // id → {id, client, createdAt, lastAt}
  const blocked = new Set();    // stateless clients the person disconnected (by clientInfo name)
  const seenClients = new Map();   // stateless clients: name → {name, version, lastAt, calls}
  const note = (e) => { try { log && log(e); } catch { /* the log */ } };

  const send = (res, code, body, headers = {}) => {
    const h = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers };
    if (body === undefined || body === null) { res.writeHead(code, h); res.end(); return; }
    const text = typeof body === 'string' ? body : JSON.stringify(body);
    res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(text), ...h });
    res.end(text);
  };
  const rpcErr = (id, code, message) => ({ jsonrpc: '2.0', id: id === undefined ? null : id, error: { code, message } });

  async function onRequest(req, res) {
    const url = new URL(req.url, 'http://127.0.0.1');
    const hostHeader = String(req.headers.host || '').toLowerCase();
    if (hostHeader !== '127.0.0.1:' + actualPort && hostHeader !== 'localhost:' + actualPort) { note({ refused: 'host', host: hostHeader }); return send(res, 403, rpcErr(null, -32000, 'Forbidden host')); }
    if (req.headers.origin !== undefined) { note({ refused: 'origin', origin: req.headers.origin }); return send(res, 403, rpcErr(null, -32000, 'Requests from web pages are refused')); }
    if (url.pathname !== '/mcp' && url.pathname !== '/control') return send(res, 404, rpcErr(null, -32000, 'Not found'));
    const auth = String(req.headers.authorization || '');
    const m = /^Bearer (.+)$/.exec(auth);
    if (!m || !tokenMatches(m[1], tok)) { note({ refused: 'token' }); return send(res, 401, rpcErr(null, -32000, 'A valid token is needed (Authorization: Bearer …)'), { 'WWW-Authenticate': 'Bearer realm="CadCraft Studio"' }); }
    if (url.search) return send(res, 400, rpcErr(null, -32000, 'No query strings'));
    const mcp = url.pathname === '/mcp';
    const sidHeader = req.headers['mcp-session-id'];
    if (req.method === 'GET') return send(res, 405, rpcErr(null, -32000, 'No event stream here: POST JSON-RPC messages'), { Allow: 'POST, DELETE' });
    if (req.method === 'DELETE' && mcp) {
      if (!sidHeader || !sessions.has(sidHeader)) return send(res, 404, rpcErr(null, -32000, 'No such session'));
      sessions.delete(sidHeader);
      return send(res, 204, null);
    }
    if (req.method !== 'POST') return send(res, 405, rpcErr(null, -32000, 'POST only'), { Allow: 'POST' + (mcp ? ', DELETE' : '') });
    if (!/^application\/json\b/i.test(String(req.headers['content-type'] || ''))) return send(res, 415, rpcErr(null, -32000, 'Content-Type must be application/json'));
    let size = 0;
    const chunks = [];
    try {
      for await (const c of req) { size += c.length; if (size > MAX_BODY) return send(res, 413, rpcErr(null, -32000, 'Too large')); chunks.push(c); }
    } catch { return; }
    let msg;
    try { msg = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(res, 400, rpcErr(null, -32700, 'Parse error')); }
    if (Array.isArray(msg)) return send(res, 400, rpcErr(null, -32600, 'Batches are not supported'));
    if (!msg || typeof msg !== 'object') return send(res, 400, rpcErr(null, -32600, 'Invalid request'));

    let session;
    const meta = msg.params && typeof msg.params === 'object' && msg.params._meta && typeof msg.params._meta === 'object' ? msg.params._meta : null;
    const modernReq = mcp && msg.method !== 'initialize' && meta && meta[META_V] !== undefined;
    if (modernReq) {
      // MCP 2026-07-28: no session; headers are checked against the body (Streamable HTTP § Request Metadata)
      const bad = (m) => send(res, 400, rpcErr(msg.id, -32020, 'Header mismatch: ' + m));
      if (String(req.headers['mcp-protocol-version'] || '') !== String(meta[META_V])) return bad('MCP-Protocol-Version must equal the protocol version in _meta.');
      if (msg.method !== undefined && b64(req.headers['mcp-method'] || '') !== String(msg.method)) return bad('Mcp-Method must equal the method.');
      if (['tools/call', 'resources/read', 'prompts/get'].includes(msg.method)) {
        const want = msg.method === 'resources/read' ? msg.params.uri : msg.params.name;
        if (b64(req.headers['mcp-name'] || '') !== String(want)) return bad('Mcp-Name must equal the name in the request.');
      }
      const ci = meta[META_I] && typeof meta[META_I] === 'object' ? meta[META_I] : {};
      const name = String(ci.name || 'unknown').slice(0, 100) || 'unknown';
      if (blocked.has(name)) return send(res, 401, rpcErr(msg.id, -32000, name + ' was disconnected in CadCraft Studio. Connect it again in Studio › Connect your AI.'), { 'WWW-Authenticate': 'Bearer realm="CadCraft Studio"' });
      const seen = seenClients.get(name) || { name, version: String(ci.version || '').slice(0, 40), calls: 0, lastAt: 0 };
      seen.lastAt = Date.now(); seen.calls++; seenClients.set(name, seen);
      session = { id: 'client:' + name, client: { name, version: seen.version }, createdAt: seen.lastAt, lastAt: seen.lastAt, stateless: true };
    } else if (mcp) {
      if (msg.method === 'initialize') {
        if (sessions.size >= maxSessions) { const oldest = [...sessions.values()].sort((a, b) => a.lastAt - b.lastAt)[0]; sessions.delete(oldest.id); }
        session = { id: crypto.randomBytes(16).toString('hex'), client: null, createdAt: Date.now(), lastAt: Date.now() };
        sessions.set(session.id, session);
      } else {
        if (!sidHeader) return send(res, 400, rpcErr(msg.id, -32000, 'Mcp-Session-Id is required (initialize first)'));
        session = sessions.get(String(sidHeader));
        if (!session) return send(res, 404, rpcErr(msg.id, -32000, 'This session has ended; initialize again'));
      }
    } else {
      const cid = String(req.headers['x-cadcraft-session'] || 'control').slice(0, 64).replace(/[^A-Za-z0-9_-]/g, '') || 'control';
      session = sessions.get('control:' + cid) || { id: 'control:' + cid, client: null, createdAt: Date.now(), lastAt: Date.now() };
      sessions.set(session.id, session);
    }
    session.lastAt = Date.now();
    let answer;
    try { answer = await forward(msg, session); } catch (e) { answer = rpcErr(msg.id, -32603, 'Internal error'); }
    if (mcp && msg.method === 'initialize' && answer && answer.error) sessions.delete(session.id);
    if (answer && answer.error && answer.error.code === -32002) sessions.delete(session.id);   // the person disconnected it in the window
    const hdr = mcp && !modernReq ? { 'Mcp-Session-Id': session.id } : {};
    if (msg.id === undefined || msg.method === undefined) return send(res, 202, null, hdr);
    const modernErr = modernReq && answer && answer.error && [-32602, -32020, -32021, -32022].includes(answer.error.code);
    return send(res, modernErr ? 400 : 200, answer || rpcErr(msg.id, -32603, 'No answer'), hdr);
  }

  return {
    get token() { return tok; },
    get port() { return actualPort; },
    get url() { return 'http://127.0.0.1:' + actualPort + '/mcp'; },
    sessions: () => [...sessions.values()].map((s) => ({ ...s })),
    newToken() { tok = randomToken(); sessions.clear(); seenClients.clear(); return tok; },
    dropSession(id) { if (id && String(id).startsWith('client:')) { blocked.add(String(id).slice(7)); return true; } return sessions.delete(id); },
    /** The person connects a disconnected stateless client again. */
    allow(name) { return blocked.delete(name); },
    /** Stateless clients seen since start (Studio › Connect your AI lists them): name, version, calls, last call. */
    clients: () => [...seenClients.values()].map((c) => ({ ...c, blocked: blocked.has(c.name) })),
    start() {
      return new Promise((resolve, reject) => {
        srv = http.createServer((req, res) => { onRequest(req, res).catch(() => { try { send(res, 500, rpcErr(null, -32603, 'Internal error')); } catch { /* gone */ } }); });
        srv.on('error', reject);
        srv.listen(port, host, () => { actualPort = srv.address().port; resolve({ url: 'http://127.0.0.1:' + actualPort + '/mcp', port: actualPort, token: tok }); });
      });
    },
    close() { return new Promise((r) => { if (!srv) return r(); srv.close(() => r()); srv.closeAllConnections?.(); }); },
  };
}
