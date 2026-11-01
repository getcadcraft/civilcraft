// SPDX-License-Identifier: Apache-2.0
/**
 * cc-opcua protocol (0.8 IND.12 / CH.27, session ind-cape-opc_PART_3). DOM-free, no imports.
 *
 * One small, neutral message set between a page (any host: Studio's hub, Super, an app) and an OPC UA connector. The page never
 * builds a network call; it asks for "connect to this endpoint, read these nodes, tell me when they change" and gets plain data back.
 * The connector can be any process that speaks it (today `tools/opcua/connector.mjs` on node-opcua, MIT; Studio's Rust side is
 * built to the same messages). One JSON object per line, in both directions.
 *
 *   page → connector   { id, op, … }          ops: hello connect browse read subscribe unsubscribe history disconnect
 *   connector → page   { id, ok:true, … } | { id, ok:false, code, message }     answers
 *                      { event:'values', sub, items:[{node, value, quality, at}] }  a subscription's changes
 *                      { event:'state', state:'connected'|'reconnecting'|'closed', message? }
 *
 * READ ONLY by design: there is no write op. A plant historian view must never be able to move a valve; a later write op needs the
 * owner's written approval (see the log). Everything an untrusted line can carry is bounded by `clean*`.
 */
export const VERSION = 1;
export const OPS = ['hello', 'connect', 'browse', 'read', 'subscribe', 'unsubscribe', 'history', 'disconnect'];
export const LIMITS = { line: 1 << 20, nodes: 500, endpoint: 512, interval: [100, 3600000], queue: [1, 100], history: 10000, browse: 1000, text: 256 };
export const SECURITY_MODES = ['None', 'Sign', 'SignAndEncrypt'];
export const POLICIES = ['None', 'Basic256Sha256', 'Aes128_Sha256_RsaOaep', 'Aes256_Sha256_RsaPss'];
/** OPC UA status code classes → the three words a person sees. Bits 30-31 of the StatusCode: 00 good, 01 uncertain, 10/11 bad. */
export function qualityOf(statusCode) {
  const c = Number(statusCode) >>> 0;
  const top = c >>> 30;
  return top === 0 ? 'good' : top === 1 ? 'uncertain' : 'bad';
}

const str = (v, max = LIMITS.text) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, '').slice(0, max) : '');
const num = (v, lo, hi, d) => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Math.min(hi, Math.max(lo, Math.trunc(Number(v)))) : d);

/** NodeId text forms: `ns=2;s=Tank1.Level`, `ns=2;i=1001`, `i=85`, `ns=1;g=<uuid>`. Returns the canonical text or null. */
export function cleanNodeId(s) {
  if (typeof s !== 'string' || s.length > 300) return null;
  const t = s.trim();
  const m = /^(?:ns=(\d{1,5});)?(i=\d{1,10}|s=[^\u0000-\u001f]{1,250}|g=[0-9a-fA-F-]{36}|b=[A-Za-z0-9+/=]{1,200})$/.exec(t);
  if (!m) return null;
  const ns = m[1] === undefined ? 0 : Number(m[1]);
  if (ns > 65535) return null;
  return (ns ? 'ns=' + ns + ';' : '') + m[2];
}

/**
 * The endpoint the person typed. Only `opc.tcp://host[:port][/path]`; no credentials in the address (they go in `auth`); host is a name or
 * IP. Whether the host may be reached is the HOST's decision (`addressPolicy`), because Studio asks the person once per server (D5).
 */
export function cleanEndpoint(s) {
  if (typeof s !== 'string' || s.length > LIMITS.endpoint) return { ok: false, code: 'endpoint', message: 'The address is missing or too long.' };
  const m = /^opc\.tcp:\/\/([A-Za-z0-9.\-]{1,253}|\[[0-9a-fA-F:.]{2,45}\])(?::(\d{1,5}))?(\/[A-Za-z0-9._~\-\/%]{0,200})?$/.exec(s.trim());
  if (!m) return { ok: false, code: 'endpoint', message: 'An OPC UA address looks like opc.tcp://host:4840/path (no user name or password in it).' };
  const port = m[2] === undefined ? 4840 : Number(m[2]);
  if (port < 1 || port > 65535) return { ok: false, code: 'endpoint', message: 'The port must be between 1 and 65535.' };
  return { ok: true, host: m[1].replace(/^\[|\]$/g, ''), port, path: m[3] || '', url: 'opc.tcp://' + m[1] + ':' + port + (m[3] || '') };
}

/** Private / loopback / link-local test for a literal address; names are resolved and re-checked by the host (never trusted here). */
export function isPrivateAddress(host) {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const [a, b] = host.split('.').map(Number);
    return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254);
  }
  const h = host.toLowerCase();
  return h === '::1' || h.startsWith('fe80:') || /^f[cd][0-9a-f]{2}:/.test(h) || h === 'localhost';
}
/** Default policy: plants are on private networks. `allow` lists hosts the person approved (public ones included); `loopback` is for tests. */
export function addressPolicy(host, { allow = [], loopback = false } = {}) {
  const h = String(host).toLowerCase();
  if (allow.map((x) => String(x).toLowerCase()).includes(h)) return { ok: true };
  if (/^127\.|^::1$|^localhost$/.test(h)) return loopback ? { ok: true } : { ok: false, code: 'loopback', message: 'This computer itself is not offered as a plant server unless the person turns that on.' };
  return isPrivateAddress(h) ? { ok: true } : { ok: false, code: 'public', message: 'The server is not on a private network. Approve this host once to connect to it.' };
}

export function cleanAuth(a) {
  if (!a || a.type === 'anonymous' || a.type === undefined) return { ok: true, auth: { type: 'anonymous' } };
  if (a.type === 'user' && typeof a.user === 'string' && a.user && typeof a.password === 'string' && a.user.length <= 128 && a.password.length <= 256) return { ok: true, auth: { type: 'user', user: a.user, password: String(a.password) } };
  return { ok: false, code: 'auth', message: 'Sign-in must be anonymous, or a user name and password.' };
}

export function cleanSecurity(s) {
  const mode = s && s.mode !== undefined ? s.mode : 'None';
  const policy = s && s.policy !== undefined ? s.policy : mode === 'None' ? 'None' : 'Basic256Sha256';
  if (!SECURITY_MODES.includes(mode) || !POLICIES.includes(policy) || (mode === 'None') !== (policy === 'None')) return { ok: false, code: 'security', message: 'Security needs a mode (None, Sign, SignAndEncrypt) and a matching policy.' };
  return { ok: true, security: { mode, policy, trustUnknown: s && s.trustUnknown === true } };
}

/** Validate one line from the page. Returns { ok, req } with only known fields, or { ok:false, id, code, message }. */
export function cleanRequest(raw) {
  let o = raw;
  if (typeof raw === 'string') {
    if (raw.length > LIMITS.line) return { ok: false, id: null, code: 'too_big', message: 'The message is too large.' };
    try { o = JSON.parse(raw); } catch { return { ok: false, id: null, code: 'bad_json', message: 'The message is not JSON.' }; }
  }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return { ok: false, id: null, code: 'bad_request', message: 'The message must be an object.' };
  const id = typeof o.id === 'number' || typeof o.id === 'string' ? (typeof o.id === 'string' ? str(o.id, 64) : o.id) : null;
  const bad = (code, message) => ({ ok: false, id, code, message });
  if (!OPS.includes(o.op)) return bad('unknown_op', 'Unknown request "' + str(String(o.op), 40) + '". There is no write request: this connection is read only.');
  const req = { id, op: o.op };
  const nodesOf = () => {
    if (!Array.isArray(o.nodes) || !o.nodes.length || o.nodes.length > LIMITS.nodes) return null;
    const out = o.nodes.map(cleanNodeId);
    return out.includes(null) ? null : out;
  };
  switch (o.op) {
    case 'connect': {
      const e = cleanEndpoint(o.endpoint); if (!e.ok) return bad(e.code, e.message);
      const a = cleanAuth(o.auth); if (!a.ok) return bad(a.code, a.message);
      const s = cleanSecurity(o.security); if (!s.ok) return bad(s.code, s.message);
      Object.assign(req, { endpoint: e.url, host: e.host, port: e.port, auth: a.auth, security: s.security });
      break;
    }
    case 'browse': {
      const n = cleanNodeId(o.node === undefined ? 'i=85' : o.node); if (!n) return bad('node', 'That node id is not valid.');
      req.node = n; req.max = num(o.max, 1, LIMITS.browse, 200);
      break;
    }
    case 'read': { const n = nodesOf(); if (!n) return bad('nodes', 'Give between 1 and ' + LIMITS.nodes + ' valid node ids.'); req.nodes = n; break; }
    case 'subscribe': {
      const n = nodesOf(); if (!n) return bad('nodes', 'Give between 1 and ' + LIMITS.nodes + ' valid node ids.');
      req.nodes = n; req.interval = num(o.interval, LIMITS.interval[0], LIMITS.interval[1], 1000); req.queue = num(o.queue, LIMITS.queue[0], LIMITS.queue[1], 1);
      break;
    }
    case 'unsubscribe': { const s = str(o.sub, 64); if (!s) return bad('sub', 'Name the subscription.'); req.sub = s; break; }
    case 'history': {
      const n = cleanNodeId(o.node); if (!n) return bad('node', 'That node id is not valid.');
      const from = Date.parse(o.from), to = Date.parse(o.to);
      if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return bad('range', 'Give a start and an end time, the end after the start.');
      req.node = n; req.from = new Date(from).toISOString(); req.to = new Date(to).toISOString(); req.max = num(o.max, 1, LIMITS.history, 1000);
      break;
    }
    default: break;
  }
  return { ok: true, req };
}

/** One value as it goes to the page: plain data, no class instances, finite numbers, bounded text. */
export function cleanValue(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v.slice(0, 2000);
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v) || ArrayBuffer.isView(v)) return Array.from(v).slice(0, 256).map(cleanValue);
  return str(String(v), 200);
}
export const ok = (id, extra) => ({ id, ok: true, ...extra });
export const fail = (id, code, message) => ({ id, ok: false, code, message });
