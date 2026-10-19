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
 */
import http from 'node:http';
import crypto from 'node:crypto';

export const DEFAULT_PORT = 47615;
const MAX_BODY = 4 * 1024 * 1024;

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
    if (mcp) {
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
    const hdr = mcp ? { 'Mcp-Session-Id': session.id } : {};
    if (msg.id === undefined || msg.method === undefined) return send(res, 202, null, hdr);
    return send(res, 200, answer || rpcErr(msg.id, -32603, 'No answer'), hdr);
  }

  return {
    get token() { return tok; },
    get port() { return actualPort; },
    get url() { return 'http://127.0.0.1:' + actualPort + '/mcp'; },
    sessions: () => [...sessions.values()].map((s) => ({ ...s })),
    newToken() { tok = randomToken(); sessions.clear(); return tok; },
    dropSession(id) { return sessions.delete(id); },
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
