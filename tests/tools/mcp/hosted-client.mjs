/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol and developer messages. */
/**
 * hosted-client.mjs — Studio's side of the hosted connector (0.8 AC.3, session ai-remote_PART_2; docs/AI-CONNECT-HOSTED-SPEC.md § 6).
 *
 * Studio opens ONE outbound WebSocket to the relay (nothing listens on the person's computer), and answers each `req` frame by calling its
 * own local hub (the same POST the stdio bridge makes), after narrowing what it was asked to the person's own hosted cap:
 *
 *     effective levels = relay's levels  ∩  Studio's cap (cadcraft.assistants.hosted)  ∩  (save, export: only with a yes for this session)
 *
 * The relay is semi-trusted, so this module treats every frame as a request from an untrusted party: a higher level than the cap is cut, a
 * tool whose group it does not know is refused (fail closed), an absolute path never leaves in a result, a result over 64 KB (previews
 * 700 KB) is refused with advice, a request id seen before is dropped, and a per-session call ceiling stops a looping AI.
 *
 *   const hc = createHostedClient({ site, deviceToken: () => …, hub: () => ({url, token}), cap: () => ({on, levels, perSessionCalls, askForSaveExport}),
 *                                   confirm: async ({level, client, tool}) => bool, roots: () => [granted folders], WebSocket, relayUrl? (tests rewrite the address) });
 *   hc.start();  hc.stop();  hc.status();  hc.handleReq(frame) → the `res` frame's msg (also the unit under test)
 *
 * DOM-free. Studio's native side runs it in the hub page (mount lines in the spec § 9); a stand-in hub + relay run it in tests.
 */
import os from 'node:os';

const META_V = 'io.modelcontextprotocol/protocolVersion', META_C = 'io.modelcontextprotocol/clientCapabilities', META_I = 'io.modelcontextprotocol/clientInfo';
export const HOSTED_LEVELS = ['read', 'suggest', 'edit', 'save', 'export'];
export const RESULT_MAX = 64 * 1024, PREVIEW_MAX = 700 * 1024;
const GROUP_NEEDS = { read: ['read'], edit: ['edit', 'suggest'], save: ['save'], export: ['export'] };
const ascii = (v) => (/^[\x21-\x7e]([\x20-\x7e]*[\x21-\x7e])?$/.test(v) && !/^=\?base64\?.*\?=$/.test(v) ? v : '=?base64?' + Buffer.from(v, 'utf8').toString('base64') + '?=');

/** Edit implies Suggest implies Read (docs/AI-CONNECT-SPEC.md § 3.1); unknown names dropped. */
export function expandLevels(levels) {
  const l = new Set((Array.isArray(levels) ? levels : []).map(String).filter((x) => HOSTED_LEVELS.includes(x)));
  if (l.has('edit')) l.add('suggest');
  if (l.has('suggest') || l.has('save') || l.has('export')) l.add('read');
  return HOSTED_LEVELS.filter((x) => l.has(x));
}

/** relay ∩ cap, and save/export only with a yes: the levels Studio will act on for this call. */
export function effectiveLevels(relayLevels, cap, yes = new Set()) {
  const c = new Set(expandLevels(cap && cap.on ? cap.levels : []));
  const r = new Set(expandLevels(relayLevels));
  return HOSTED_LEVELS.filter((l) => c.has(l) && r.has(l) && (!['save', 'export'].includes(l) || !cap.askForSaveExport || yes.has(l)));
}
/** Levels that could be acted on after a yes (used to decide whether to ask). */
export const allowedWithYes = (relayLevels, cap) => effectiveLevels(relayLevels, { ...cap, askForSaveExport: false });

export function groupOfTool(t) {
  const m = /\(Permission: (read|edit|save|export)\.\)/.exec(String(t && t.description || ''));
  if (m) return m[1];
  const a = (t && t.annotations) || {};
  if (a.readOnlyHint === true) return 'read';
  if (a.destructiveHint === true) return 'save';
  if (a.idempotentHint === true) return 'export';
  if (a.readOnlyHint === false) return 'edit';
  return null;
}
const groupAllowed = (group, levels) => !!group && GROUP_NEEDS[group].some((l) => levels.includes(l));

/**
 * Take absolute paths out of anything a result carries (spec T8). Granted folders become `<folder name>` (so `C:\Drawings\A\plan.dwg` →
 * `<Drawings>/A/plan.dwg`), the home folder becomes `~`, and any other absolute path becomes `<path removed>`.
 */
export function makeScrubber(roots = [], home = os.homedir()) {
  const rs = [...new Set((roots || []).filter((r) => typeof r === 'string' && r.length > 2))].sort((a, b) => b.length - a.length);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const variants = (p) => { const n = p.replace(/[\\/]+$/, ''); return [...new Set([n, n.replace(/\\/g, '/'), n.replace(/\//g, '\\'), n.replace(/\//g, '\\').replace(/\\/g, '\\\\')])]; };
  const rules = [];
  for (const r of rs) {
    const name = r.replace(/[\\/]+$/, '').split(/[\\/]/).pop() || 'folder';
    for (const v of variants(r)) rules.push([new RegExp(esc(v) + '(?=$|[\\\\/\\s"\'<>,;)\\]}]|\\\\\\\\)', 'gi'), '<' + name + '>']);
  }
  if (home && home.length > 2) for (const v of variants(home)) rules.push([new RegExp(esc(v) + '(?=$|[\\\\/\\s"\'<>,;)\\]}]|\\\\\\\\)', 'gi'), '~']);
  const win = /(?<![\w])[A-Za-z]:(?:\\\\|\\|\/)[^\s"'<>|*?,;]*/g;
  const nix = /(?<![\w:/.~<])\/(?:home|Users|root|mnt|media|var|tmp|opt|srv|etc|private|Volumes|usr|proc|sys)\/[^\s"'<>|*?,;]*/g;
  const tidy = (s) => s.replace(/(<[^<>\\/]{1,80}>)([\\/]+)/g, (m, a) => a + '/').replace(/(?<=[^\\<])\\(?=[A-Za-z0-9_.-])/g, (m, off, str) => (str.slice(Math.max(0, off - 40), off).includes('<') ? '/' : m));
  function str(s) {
    let o = s;
    for (const [re, rep] of rules) o = o.replace(re, rep);
    o = o.replace(win, '<path removed>').replace(nix, '<path removed>');
    return o === s ? s : tidy(o);
  }
  function deep(v, depth = 0) {
    if (depth > 40) return v;
    if (typeof v === 'string') return str(v);
    if (Array.isArray(v)) return v.map((x) => deep(x, depth + 1));
    if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = deep(v[k], depth + 1); return o; }
    return v;
  }
  return { str, deep };
}

export function createHostedClient({
  site, deviceToken, hub, cap, confirm = async () => false, roots = () => [], home = os.homedir(), WebSocket: WS = globalThis.WebSocket, doFetch = globalThis.fetch,
  log = () => {}, onState = () => {}, now = () => Date.now(), random = Math.random, relayUrl = (u) => u,
} = {}) {
  let stopped = true, ws = null, retry = 0, timer = null, state = 'off', address = null, lastError = '';
  const seenIds = new Map();                  // request ids already answered (replay guard)
  const sessions = new Map();                 // client name → { calls, yes: Set, firstAt }
  const groups = new Map();                   // tool name → group (from the hub's own tools/list)
  let groupsAt = 0;
  const callsLog = [];                        // for status(): the last calls (tool, group, outcome) — no arguments, no results

  const setState = (s, extra = {}) => { state = s; lastError = extra.error || ''; try { onState({ state, address, error: lastError }); } catch { /* the listener */ } };
  const sessionOf = (name) => { let s = sessions.get(name); if (!s) { s = { calls: 0, yes: new Set(), firstAt: now() }; sessions.set(name, s); } return s; };

  const err = (msg, code, message, next = [], retry = 'never') => ({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: message }], structuredContent: { isError: true, error: { code, message, next, retry } }, isError: true } });
  const rpcErr = (id, code, message) => ({ jsonrpc: '2.0', id: id === undefined ? null : id, error: { code, message } });

  // -------------------------------------------------------------- the local hub (same POST as the stdio bridge)
  async function hubPost(msg, clientName) {
    const c = hub();
    if (!c || !c.url || !c.token) return { down: true };
    const params = { ...(msg.params || {}) };
    params._meta = { ...(params._meta || {}), [META_V]: '2026-07-28', [META_C]: {}, [META_I]: { name: ('hosted:' + clientName).slice(0, 100), version: '1' } };
    const m = { jsonrpc: '2.0', id: msg.id, method: msg.method, params };
    const headers = { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json', Accept: 'application/json', 'MCP-Protocol-Version': '2026-07-28', 'Mcp-Method': ascii(m.method) };
    if (m.method === 'tools/call' && typeof params.name === 'string') headers['Mcp-Name'] = ascii(params.name);
    let res;
    try { res = await doFetch(c.url, { method: 'POST', headers, body: JSON.stringify(m) }); } catch (e) { log('hub unreachable'); return { down: true }; }
    let j = null;
    try { j = await res.json(); } catch { return { bad: true }; }
    return { json: j };
  }
  async function refreshGroups() {
    const r = await hubPost({ jsonrpc: '2.0', id: 'groups', method: 'tools/list', params: {} }, 'studio');
    const list = r.json && r.json.result && Array.isArray(r.json.result.tools) ? r.json.result.tools : null;
    if (!list) return false;
    groups.clear();
    for (const t of list) if (t && typeof t.name === 'string') groups.set(t.name, groupOfTool(t));
    groupsAt = now();
    return true;
  }

  // -------------------------------------------------------------- one request from the relay
  /**
   * @param frame {id, client:{name}, levels, msg} from the relay (untrusted)
   * @returns the JSON-RPC answer to put in the `res` frame (null = say nothing)
   */
  async function handleReq(frame) {
    const msg = frame && frame.msg;
    if (!msg || typeof msg !== 'object' || Array.isArray(msg) || typeof frame.id !== 'string') return null;
    if (seenIds.has(frame.id)) return null;                                           // a replayed request id is dropped
    seenIds.set(frame.id, now());
    if (seenIds.size > 2000) for (const k of [...seenIds.keys()].slice(0, 500)) seenIds.delete(k);
    const clientName = String(frame.client && frame.client.name || 'unknown').slice(0, 100);
    const c = cap() || {};
    if (!c.on) return msg.method === 'tools/call' ? err(msg, 'permission_needed', 'The hosted connector is turned off in CadCraft Studio.', ['Ask the person to turn it on in Studio › Connect your AI.']) : rpcErr(msg.id, -32000, 'The hosted connector is off.');
    const s = sessionOf(clientName);
    const relayLevels = expandLevels(frame.levels);
    const legacy = !(msg.params && msg.params._meta && msg.params._meta[META_V]);
    const strip = (a) => { if (legacy && a && a.result && typeof a.result === 'object') { const { resultType, ttlMs, cacheScope, ...rest } = a.result; return { ...a, result: rest }; } return a; };
    const scrub = makeScrubber(roots(), home);

    if (msg.method === 'ping') return { jsonrpc: '2.0', id: msg.id, result: {} };
    if (msg.method !== 'tools/list' && msg.method !== 'tools/call') return rpcErr(msg.id, -32601, 'Method not found: ' + String(msg.method).slice(0, 60));

    const levels = effectiveLevels(relayLevels, c, s.yes);
    const reach = allowedWithYes(relayLevels, c);                                      // levels that could apply after a yes

    if (msg.method === 'tools/list') {
      const r = await hubPost(msg, clientName);
      if (r.down) return rpcErr(msg.id, -32603, 'CadCraft Studio\'s local connection is not running.');
      if (r.bad || !r.json) return rpcErr(msg.id, -32603, 'Studio answered with something that is not JSON.');
      const a = r.json;
      if (a.result && Array.isArray(a.result.tools)) {
        groups.clear(); for (const t of a.result.tools) groups.set(t.name, groupOfTool(t)); groupsAt = now();
        a.result = { ...a.result, tools: a.result.tools.filter((t) => groupAllowed(groupOfTool(t), reach)).map((t) => scrub.deep(t)) };   // a tool above the cap is not even listed
      }
      return strip({ ...a, id: msg.id });
    }

    // tools/call
    const name = String(msg.params && msg.params.name || '');
    if (!name || name.length > 120) return err(msg, 'invalid_argument', 'The tool name is missing.', ['Call tools/list to see the tool names.']);
    let group = groups.get(name);
    if (group === undefined && now() - groupsAt > 5000) { await refreshGroups(); group = groups.get(name); }
    callsLog.push({ at: now(), tool: name, group: group || null, client: clientName });
    if (callsLog.length > 100) callsLog.shift();
    if (!group) return err(msg, 'not_found', `There is no tool called ${name} that the hosted connector may use.`, ['Call tools/list to see the tool names.']);       // fail closed
    if (!groupAllowed(group, reach)) {
      return err(msg, 'permission_needed', `${name} needs the ${group} permission, which the hosted connector does not have.`, [`Ask the person to allow ${group} for the hosted connector in CadCraft Studio › Connect your AI.`]);
    }
    if (s.calls >= (c.perSessionCalls || 2000)) return err(msg, 'busy', 'This AI has used all the calls allowed for one session.', ['Ask the person to start a new session in CadCraft Studio.'], 'later');
    if ((group === 'save' || group === 'export') && c.askForSaveExport !== false && !s.yes.has(group)) {
      let yes = false;
      try { yes = (await confirm({ level: group, client: clientName, tool: name })) === true; } catch { yes = false; }
      if (!yes) return err(msg, 'needs_person', `The person did not allow ${group} for this AI.`, ['Ask the person to say yes in CadCraft Studio when it asks.'], 'never');
      s.yes.add(group);
    }
    s.calls++;
    const r = await hubPost(msg, clientName);
    if (r.down) return err(msg, 'not_open', 'CadCraft Studio\'s local connection is not running.', ['Open CadCraft Studio.'], 'after_change');
    if (r.bad || !r.json) return err(msg, 'failed', 'Studio answered with something that is not JSON.');
    let a = r.json;
    if (a.result) a = { ...a, result: scrub.deep(a.result) };
    if (a.error) a = { ...a, error: scrub.deep(a.error) };
    a = strip({ ...a, id: msg.id });
    const size = Buffer.byteLength(JSON.stringify(a));
    const max = msg.params && msg.params.arguments && msg.params.arguments.preview === true ? PREVIEW_MAX : RESULT_MAX;
    if (size > max) return err(msg, 'result_too_large', `The result was larger than ${Math.round(max / 1024)} KB, which is the most the hosted connector carries.`, ['Ask for less: use limit and offset, or a narrower filter.']);
    return a;
  }

  // -------------------------------------------------------------- the socket
  async function ticket() {
    const r = await doFetch(site.replace(/\/$/, '') + '/api/v1/connect/studio/session', { method: 'POST', headers: { Authorization: 'Bearer ' + deviceToken(), 'Content-Type': 'application/json' }, body: '{}' });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j || j.status !== 'success') return { ok: false, status: r.status, code: j && j.code, message: j && j.error };
    return { ok: true, ...j.data };
  }
  async function connect() {
    if (stopped) return;
    if (!(cap() || {}).on) { setState('off'); return; }
    setState('connecting');
    let t;
    try { t = await ticket(); } catch (e) { t = { ok: false, message: 'The website could not be reached.' }; }
    if (stopped) return;
    if (!t.ok) {
      const fatal = ['disabled', 'not_allowed', 'closed', 'invalid_token', 'token_revoked', 'account_inactive'].includes(t.code);
      setState(fatal ? 'refused' : 'retrying', { error: t.message || ('HTTP ' + t.status) });
      if (!fatal) schedule();
      return;
    }
    address = t.address;
    const sock = new WS(relayUrl(t.relay_url));
    ws = sock;
    let opened = false;
    sock.onopen = () => { opened = true; sock.send(JSON.stringify({ t: 'studio', ticket: t.ticket })); };
    sock.onmessage = async (ev) => {
      let m = null;
      try { m = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data)); } catch { return; }
      if (!m) return;
      if (m.t === 'ready') { retry = 0; sessions.clear(); setState('on'); return; }
      if (m.t === 'closed') { setState('refused', { error: 'The relay closed the connection (' + String(m.reason || '').slice(0, 40) + ').' }); return; }
      if (m.t === 'req') {
        let out = null;
        try { out = await handleReq(m); } catch (e) { log('request failed'); out = m.msg && m.msg.id !== undefined ? rpcErr(m.msg.id, -32603, 'Internal error') : null; }
        if (sock.readyState === 1) sock.send(JSON.stringify({ t: 'res', id: m.id, msg: out }));
      }
    };
    sock.onclose = (ev) => {
      if (ws === sock) ws = null;
      if (stopped) { setState('off'); return; }
      const code = ev && ev.code;
      if (code === 4002) { setState('refused', { error: 'CadCraft Studio is open on another computer, which took over the hosted connector.' }); return; }   // never fight for it
      if (state === 'refused' || code === 4005 || code === 4401) { setState('refused', { error: lastError || 'The relay refused the connection.' }); if (code === 4401) schedule(); return; }
      setState('retrying', { error: opened ? 'The connection to the relay dropped.' : 'The relay could not be reached.' });
      schedule();
    };
    sock.onerror = () => { /* onclose follows */ };
  }
  function schedule() {
    if (stopped || timer) return;
    const wait = Math.min(60000, 1000 * 2 ** Math.min(retry++, 6)) * (0.7 + random() * 0.6);
    timer = setTimeout(() => { timer = null; connect(); }, wait);
    timer.unref?.();
  }

  return {
    /** Start, or start again after the relay refused (Studio › Turn on). */
    start() { if (!stopped && state !== 'refused') return; if (timer) { clearTimeout(timer); timer = null; } stopped = false; retry = 0; try { ws && ws.close(1000, 'restart'); } catch { /* gone */ } ws = null; connect(); },
    stop() { stopped = true; if (timer) { clearTimeout(timer); timer = null; } try { ws && ws.close(1000, 'off'); } catch { /* gone */ } ws = null; sessions.clear(); setState('off'); },
    /** Studio › Connect your AI shows this. */
    status() { return { state, address, error: lastError, sessions: [...sessions].map(([name, s]) => ({ client: name, calls: s.calls, allowed: [...s.yes] })), recent: callsLog.slice(-20) }; },
    /** The person said "disconnect" for one AI platform: its session ends here (the site revokes its tokens). */
    endSession(name) { sessions.delete(name); },
    handleReq,
    sessions,
  };
}
