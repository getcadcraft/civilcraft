#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * check-server.mjs — check any Studio local MCP server against the rules of docs/AGENTS-SPEC.md §6.2 (the reference is
 * tools/mcp/live-server.mjs; the desktop shell's native server must pass the same checks).
 *
 *   node tools/mcp/test/check-server.mjs http://127.0.0.1:47615/mcp <token> [--verbose]
 *   (also imported by bin/test-agents.mjs: checkServer(url, token) → {pass, fail, lines})
 *
 * Checks: wrong / missing token → 401 with WWW-Authenticate; a token in the URL does not count; an Origin header → 403; a
 * foreign Host → 403; GET → 405; not JSON → 415; no session before initialize → 400; unknown session → 404; initialize →
 * 200 + a session id; a notification → 202; DELETE ends the session; /control answers tools.list; and the port is not
 * reachable on the machine's other addresses. It never calls a tool.
 */
import http from 'node:http';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

export async function checkServer(url, token, { verbose = false } = {}) {
  const u = new URL(url);
  const port = +u.port, host = u.hostname;
  let pass = 0, fail = 0;
  const lines = [];
  const ok = (c, m, extra = '') => { if (c) { pass++; if (verbose) lines.push('  ok   ' + m); } else { fail++; lines.push('  FAIL ' + m + (extra ? ' — ' + String(extra).slice(0, 300) : '')); } };
  const raw = (opts, body) => new Promise((resolve) => {
    const req = http.request({ host, port, path: u.pathname, method: 'POST', ...opts, headers: { 'Content-Type': 'application/json', Host: host + ':' + port, Authorization: 'Bearer ' + token, ...(opts.headers || {}) } }, (res) => {
      let t = ''; res.on('data', (c) => { t += c; }); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: t }));
    });
    req.on('error', (e) => resolve({ status: 0, error: e.code }));
    if (body !== undefined) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
  const init = { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'check-server', version: '1' } } };
  ok(host === '127.0.0.1', 'the address is 127.0.0.1', host);
  ok((await raw({ headers: { Authorization: 'Bearer nope' } }, init)).status === 401, 'a wrong token → 401');
  const noTok = await raw({ headers: { Authorization: '' } }, init);
  ok(noTok.status === 401 && /Bearer/.test(noTok.headers['www-authenticate'] || ''), 'no token → 401 with WWW-Authenticate', noTok.status);
  ok((await raw({ path: u.pathname + '?token=' + encodeURIComponent(token), headers: { Authorization: '' } }, init)).status === 401, 'a token in the URL does not count');
  ok((await raw({ headers: { Origin: 'https://evil.example' } }, init)).status === 403, 'a request carrying an Origin → 403');
  ok((await raw({ headers: { Host: 'evil.example:' + port } }, init)).status === 403, 'a foreign Host → 403');
  ok((await raw({ method: 'GET' })).status === 405, 'GET → 405');
  ok((await raw({ headers: { 'Content-Type': 'text/plain' } }, init)).status === 415, 'not JSON → 415');
  ok((await raw({}, { jsonrpc: '2.0', id: 2, method: 'tools/list' })).status === 400, 'no Mcp-Session-Id before initialize → 400');
  ok((await raw({ headers: { 'Mcp-Session-Id': 'deadbeef' } }, { jsonrpc: '2.0', id: 2, method: 'tools/list' })).status === 404, 'an unknown session → 404');
  const ri = await raw({}, init);
  const sid = ri.headers['mcp-session-id'];
  let initBody = null;
  try { initBody = JSON.parse(ri.body); } catch { /* below */ }
  ok(ri.status === 200 && /^[0-9A-Za-z-]{16,}$/.test(sid || '') && initBody && initBody.result && initBody.result.protocolVersion, 'initialize → 200, a session id, an MCP answer', ri.status + ' ' + ri.body);
  ok((await raw({ headers: { 'Mcp-Session-Id': sid } }, { jsonrpc: '2.0', method: 'notifications/initialized' })).status === 202, 'a notification → 202');
  const pl = await raw({ headers: { 'Mcp-Session-Id': sid } }, { jsonrpc: '2.0', id: 3, method: 'ping' });
  ok(pl.status === 200 && JSON.parse(pl.body).result !== undefined, 'ping in the session → 200');
  ok((await raw({ method: 'DELETE', headers: { 'Mcp-Session-Id': sid } })).status === 204 && (await raw({ headers: { 'Mcp-Session-Id': sid } }, { jsonrpc: '2.0', id: 4, method: 'ping' })).status === 404, 'DELETE ends a session');
  const ctl = await raw({ path: '/control' }, { jsonrpc: '2.0', id: 9, method: 'tools.list' });
  let ctlBody = null;
  try { ctlBody = JSON.parse(ctl.body); } catch { /* below */ }
  ok(ctl.status === 200 && ctlBody && ctlBody.result && Array.isArray(ctlBody.result.tools), '/control answers tools.list', ctl.status);
  const other = Object.values(os.networkInterfaces()).flat().find((a) => a && a.family === 'IPv4' && !a.internal);
  if (other) {
    const r = await new Promise((resolve) => { const q = http.request({ host: other.address, port, path: u.pathname, method: 'POST' }, (res) => resolve(res.statusCode)); q.on('error', (e) => resolve(e.code)); q.setTimeout(3000, () => { q.destroy(); resolve('timeout'); }); q.end(); });
    ok(r === 'ECONNREFUSED' || r === 'timeout', 'not reachable on ' + other.address + ' (bound to 127.0.0.1 only)', r);
  }
  return { pass, fail, lines };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [url, token] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!url || !token) { console.error('usage: check-server.mjs <url> <token> [--verbose]'); process.exit(2); }
  const r = await checkServer(url, token, { verbose: process.argv.includes('--verbose') });
  for (const l of r.lines) console.log(l);
  console.log(r.pass + ' passed, ' + r.fail + ' failed');
  process.exit(r.fail ? 1 : 0);
}
