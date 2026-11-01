/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol and developer messages. */
/**
 * bridge.mjs — `cadcraft-mcp connect`: MCP over stdio on one side, CadCraft Studio's local hub on the other
 * (docs/AI-CONNECT-SPEC.md § 1.4, § 6). It is what an AI app's settings launch, so the settings hold no secret:
 *
 *   { "mcpServers": { "cadcraft": { "command": "npx", "args": ["-y", "@getcadcraft/mcp", "connect"] } } }
 *
 * Studio writes {url, token, pid, startedAt} to a file only the person can read (connectFile()); the bridge reads it again on
 * every request, so "New token" and a restarted Studio need no new set-up. Each stdio message becomes one POST to the hub:
 * a 2026-07-28 request (params._meta carries the protocol version) with the MCP-Protocol-Version / Mcp-Method / Mcp-Name headers,
 * a legacy request with the Mcp-Session-Id Studio issued at `initialize` (and a transparent re-initialize when Studio restarted).
 * While Studio is not running the bridge still answers `initialize`, `server/discover` and `tools/list` (one tool, studio_status,
 * which says so) and sends tools/list_changed when Studio appears, so the AI app shows CadCraft as connected and starts working
 * when Studio is opened.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const BRIDGE_VERSION = '0.8.0';
const META_V = 'io.modelcontextprotocol/protocolVersion';
const LEGACY_DEFAULT = '2025-11-25';

/** Where Studio writes the address and token (CADCRAFT_CONNECT_FILE overrides; the AI app's settings never hold the token). */
export function connectFile(env = process.env, platform = process.platform, home = os.homedir()) {
  if (env.CADCRAFT_CONNECT_FILE) return env.CADCRAFT_CONNECT_FILE;
  if (platform === 'win32') return path.win32.join(env.APPDATA || path.win32.join(home, 'AppData', 'Roaming'), 'CadCraft Studio', 'connect.json');
  if (platform === 'darwin') return path.posix.join(home, 'Library', 'Application Support', 'CadCraft Studio', 'connect.json');
  return path.posix.join(env.XDG_CONFIG_HOME || path.posix.join(home, '.config'), 'cadcraft-studio', 'connect.json');
}

export function readConnect(file) {
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (typeof j.url !== 'string' || typeof j.token !== 'string' || !/^http:\/\/(127\.0\.0\.1|localhost):\d+\/mcp$/.test(j.url)) return null;   // local hub only
    return { url: j.url, token: j.token };
  } catch { return null; }
}

const ascii = (v) => (/^[\x21-\x7e]([\x20-\x7e]*[\x21-\x7e])?$/.test(v) && !/^=\?base64\?.*\?=$/.test(v) ? v : '=?base64?' + Buffer.from(v, 'utf8').toString('base64') + '?=');

export function runBridge({ input, output, log = () => {}, read = () => readConnect(connectFile()), doFetch = globalThis.fetch, pollMs = 3000, version = BRIDGE_VERSION } = {}) {
  let sessionId = null, initParams = null, wasUp = null, closed = false;
  const write = (msg) => { if (msg && !closed) output.write(JSON.stringify(msg) + '\n'); };
  const err = (id, code, message, data) => (id === undefined ? null : { jsonrpc: '2.0', id, error: { code, message, ...(data !== undefined ? { data } : {}) } });
  const isModern = (m) => m && m.params && m.params._meta && m.params._meta[META_V];
  const wrapModern = (m, result) => (isModern(m) ? { resultType: 'complete', ...result, _meta: { 'io.modelcontextprotocol/serverInfo': { name: 'cadcraft-bridge', version } } } : result);
  const reply = (m, result) => (m.id === undefined ? null : { jsonrpc: '2.0', id: m.id, result: wrapModern(m, result) });

  const DOWN = 'CadCraft Studio is not running. Open CadCraft Studio (it starts the connection), then ask again.';
  const downTool = { name: 'studio_status', title: 'Is CadCraft Studio running?', description: 'Says whether CadCraft Studio is running. The CadCraft tools appear here when it is open.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true } };
  function offline(m) {
    switch (m.method) {
      case 'initialize': return reply(m, { protocolVersion: m.params && typeof m.params.protocolVersion === 'string' && m.params.protocolVersion !== '2026-07-28' ? m.params.protocolVersion : LEGACY_DEFAULT, capabilities: { tools: { listChanged: true } }, serverInfo: { name: 'cadcraft-bridge', title: 'CadCraft', version }, instructions: DOWN });
      case 'server/discover': return reply(m, { supportedVersions: ['2026-07-28', '2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'], capabilities: { tools: { listChanged: false } }, instructions: DOWN, ttlMs: 2000, cacheScope: 'private' });
      case 'ping': return reply(m, {});
      case 'tools/list': return reply(m, { tools: [downTool], ...(isModern(m) ? { ttlMs: 2000, cacheScope: 'private' } : {}) });
      case 'tools/call': {
        const text = DOWN;
        return reply(m, { content: [{ type: 'text', text }], ...(m.params && m.params.name === 'studio_status' ? { structuredContent: { running: false } } : { structuredContent: { isError: true, error: { code: 'not_open', message: DOWN, next: ['Open CadCraft Studio, then call tools/list again.'], retry: 'after_change' } }, isError: true }) });
      }
      default: return m.id === undefined ? null : err(m.id, -32601, 'Method not found: ' + m.method);
    }
  }

  async function post(c, m, retried = false) {
    const headers = { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
    const meta = isModern(m);
    if (meta) {
      headers['MCP-Protocol-Version'] = String(m.params._meta[META_V]);
      headers['Mcp-Method'] = ascii(String(m.method));
      if (['tools/call', 'prompts/get'].includes(m.method) && m.params && typeof m.params.name === 'string') headers['Mcp-Name'] = ascii(m.params.name);
      if (m.method === 'resources/read' && m.params && typeof m.params.uri === 'string') headers['Mcp-Name'] = ascii(m.params.uri);
    } else if (sessionId && m.method !== 'initialize') headers['Mcp-Session-Id'] = sessionId;
    const res = await doFetch(c.url, { method: 'POST', headers, body: JSON.stringify(m) });
    const sid = res.headers.get('mcp-session-id');
    if (m.method === 'initialize' && sid) { sessionId = sid; initParams = m.params; }
    if (res.status === 202) return null;
    if (res.status === 404 && !meta && sessionId && m.method !== 'initialize' && !retried && initParams) {   // Studio restarted: a new session, silently
      sessionId = null;
      const re = await post(c, { jsonrpc: '2.0', id: 'bridge-reinit', method: 'initialize', params: initParams });
      if (re && re.result) { await post(c, { jsonrpc: '2.0', method: 'notifications/initialized' }); return post(c, m, true); }
    }
    const type = String(res.headers.get('content-type') || '');
    const text = await res.text();
    if (/text\/event-stream/.test(type)) {   // never expected from Studio, but valid: the last JSON message with an id is the answer
      let last = null;
      for (const line of text.split(/\r?\n/)) if (line.startsWith('data:')) { try { const j = JSON.parse(line.slice(5)); if (j && (j.result !== undefined || j.error)) last = j; } catch { /* a comment */ } }
      return last;
    }
    try { return JSON.parse(text); } catch { return m.id === undefined ? null : err(m.id, -32603, 'Studio answered with something that is not JSON (HTTP ' + res.status + ').'); }
  }

  async function handle(m) {
    if (!m || typeof m !== 'object' || Array.isArray(m)) return err(null, -32600, 'Invalid request');
    const c = read();
    if (!c) { if (wasUp !== false) { wasUp = false; poll(); } return offline(m); }
    try {
      const a = await post(c, m);
      if (wasUp === false) { wasUp = true; write({ jsonrpc: '2.0', method: 'notifications/tools/list_changed' }); } else wasUp = true;
      return a;
    } catch (e) {
      log('hub unreachable: ' + (e && e.message));
      if (wasUp !== false) { wasUp = false; poll(); }
      return offline(m);
    }
  }

  let timer = null;
  function poll() {
    if (timer || closed) return;
    timer = setInterval(async () => {
      const c = read();
      if (!c) return;
      try {
        const res = await doFetch(c.url, { method: 'POST', headers: { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'MCP-Protocol-Version': '2026-07-28', 'Mcp-Method': 'server/discover' }, body: JSON.stringify({ jsonrpc: '2.0', id: 'bridge-poll', method: 'server/discover', params: { _meta: { [META_V]: '2026-07-28', 'io.modelcontextprotocol/clientCapabilities': {} } } }) });
        if (res.status === 200 || res.status === 400) { wasUp = true; clearInterval(timer); timer = null; sessionId = null; write({ jsonrpc: '2.0', method: 'notifications/tools/list_changed' }); }
      } catch { /* still down */ }
    }, pollMs);
    timer.unref?.();
  }

  let buf = '';
  let gate = null;
  const pending = new Set();
  const onLine = (line) => {
    if (!line.trim()) return;
    let m;
    try { m = JSON.parse(line); } catch { write(err(null, -32700, 'Parse error')); return; }
    // `initialize` goes first: the messages behind it wait for its answer (they need the session id it brings)
    const run = Promise.resolve(gate).then(() => handle(m));
    if (m && m.method === 'initialize') gate = run.catch(() => {});
    const p = run.then((a) => (m && m.id === undefined ? null : a)).then(write, (e) => write(m && m.id !== undefined ? err(m.id, -32603, 'Internal error: ' + (e && e.message)) : null)).finally(() => pending.delete(p));
    pending.add(p);
  };
  input.setEncoding?.('utf8');
  input.on('data', (chunk) => { buf += chunk; let i; while ((i = buf.indexOf('\n')) >= 0) { onLine(buf.slice(0, i)); buf = buf.slice(i + 1); } });
  return new Promise((resolve) => input.on('end', async () => { if (buf.trim()) onLine(buf); await Promise.allSettled([...pending]); closed = true; if (timer) clearInterval(timer); resolve(); }));
}
