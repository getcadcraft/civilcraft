/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words a person reads; the reasons are codes the loader turns into shell strings. */
/**
 * addons-trust.js — add-on packages and their signatures (0.4 part 2, A.8 / A.12; docs/ADDONS-SPEC.md §8–9). No DOM, no
 * imports. Canonical here (the directory's install button uses it); every app build carries a byte-identical copy as
 * dev/addons/trust.js — `node tools/addons-test/sync.mjs [--check]` (owner: session addons; never edit a copy).
 *
 *   import { installTrust } from "./addons/trust.js";   installTrust(AddonLoader)   → AddonLoader.verify = verifyPackage
 *   await packageDigest({ manifest, files })              → the text the directory signs (below)
 *   await verifyPackage(pkg, { keys })                    → { ok, reason }  (reason: unsigned | key | files | manifest | signature)
 *   readPackageJson(obj)                                  → { ok, pkg: { manifest, files: { path: Uint8Array }, signature }, reason }
 *
 * The package digest (UTF-8):
 *   cadcraft-addon-package 1
 *   <id> <version>
 *   <sha256 hex of the file>  <path>          one line per file, sorted by path (UTF-16 code units = byte order for ASCII paths)
 * signed with Ed25519 by getcadcraft.com when staff approve a version (core/classes/AddonSigning.php). TRUSTED_KEYS holds the
 * public keys (32 bytes, base64) by key id; the private keys never leave /var/www/CADCRAFT/secrets/.
 *
 * Ed25519 verification uses WebCrypto where the browser has it, else verifyEd25519() below: RFC 8032 §5.1.7 with BigInt
 * (written from the RFC; no library).
 */

export const PACKAGE_FORMAT = 'cadcraft-addon-package';
export const PACKAGE_VERSION = 1;
export const LIMITS = { files: 200, bytes: 5 * 1024 * 1024 };
export const PATH_RE = /^[A-Za-z0-9_][A-Za-z0-9_./-]{0,200}$/;

/** getcadcraft.com's add-on signing keys (public). A key id is never reused; a retired key is removed here. */
export const TRUSTED_KEYS = {
  'cc-addons-2026-1': 'osQRAZ6eDOd+PTxSKjDJ7eInmbEqm6pLGfkek4D+yX8=',
};

const te = new TextEncoder();
const subtle = () => (globalThis.crypto && globalThis.crypto.subtle) || null;
const b64 = (s) => { const bin = atob(String(s)); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');

/** The bytes of a stored file (Blob, string = UTF-8, ArrayBuffer, typed array). */
export async function bytesOf(v) {
  if (v instanceof Uint8Array) return v;
  if (typeof v === 'string') return te.encode(v);
  if (v instanceof ArrayBuffer) return new Uint8Array(v);
  if (ArrayBuffer.isView(v)) return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
  if (v && typeof v.arrayBuffer === 'function') return new Uint8Array(await v.arrayBuffer());
  throw new Error('not a file');
}

export async function sha256Hex(bytes) { return hex(await subtle().digest('SHA-256', bytes)); }

/** JSON with keys sorted at every level (manifest equality). */
export function canonical(v) {
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
  return JSON.stringify(v);
}

/** The text a package's signature covers. Throws on a bad path or too many / too big files. */
export async function packageDigest({ manifest, files }) {
  const paths = Object.keys(files || {}).sort();
  if (!paths.length || paths.length > LIMITS.files) throw Object.assign(new Error('files'), { code: 'files' });
  let total = 0;
  const lines = [PACKAGE_FORMAT + ' ' + PACKAGE_VERSION, String(manifest.id) + ' ' + String(manifest.version)];
  for (const p of paths) {
    if (!PATH_RE.test(p) || p.split('/').some((s) => s === '..' || s === '.' || s === '')) throw Object.assign(new Error('path ' + p), { code: 'files' });
    const b = await bytesOf(files[p]);
    total += b.length;
    if (total > LIMITS.bytes) throw Object.assign(new Error('too big'), { code: 'files' });
    lines.push((await sha256Hex(b)) + '  ' + p);
  }
  return lines.join('\n') + '\n';
}

/**
 * Is this package signed by a key we trust, for exactly these files and this manifest? → { ok, reason }.
 * pkg = { manifest, files: { path: bytes }, signature: { alg: 'Ed25519', key, sig (base64) } }.
 */
export async function verifyPackage(pkg, { keys = TRUSTED_KEYS } = {}) {
  try {
    const sig = pkg && pkg.signature;
    if (!sig || sig.alg !== 'Ed25519' || typeof sig.sig !== 'string') return { ok: false, reason: 'unsigned' };
    const pub = typeof sig.key === 'string' && Object.prototype.hasOwnProperty.call(keys, sig.key) ? keys[sig.key] : null;
    if (!pub) return { ok: false, reason: 'key' };
    if (!pkg.files || !('addon.json' in pkg.files)) return { ok: false, reason: 'manifest' };
    let inFile;
    try { inFile = JSON.parse(new TextDecoder().decode(await bytesOf(pkg.files['addon.json']))); } catch { return { ok: false, reason: 'manifest' }; }
    if (canonical(inFile) !== canonical(pkg.manifest)) return { ok: false, reason: 'manifest' };
    let text;
    try { text = await packageDigest(pkg); } catch { return { ok: false, reason: 'files' }; }
    const good = await ed25519Verify(b64(pub), b64(sig.sig), te.encode(text));
    return good ? { ok: true, reason: '' } : { ok: false, reason: 'signature' };
  } catch {
    return { ok: false, reason: 'signature' };
  }
}

/** A package as the directory serves it (files base64) → { ok, pkg, reason }. Checks shape and limits only. */
export function readPackageJson(obj) {
  if (!obj || typeof obj !== 'object' || obj.format !== PACKAGE_FORMAT) return { ok: false, reason: 'format' };
  if (obj.version !== PACKAGE_VERSION) return { ok: false, reason: 'format' };
  if (!obj.manifest || typeof obj.manifest !== 'object' || !obj.files || typeof obj.files !== 'object') return { ok: false, reason: 'format' };
  const entries = Object.entries(obj.files);
  if (!entries.length || entries.length > LIMITS.files) return { ok: false, reason: 'files' };
  const files = {};
  let total = 0;
  for (const [p, v] of entries) {
    if (!PATH_RE.test(p) || p.split('/').some((s) => s === '..' || s === '.' || s === '') || typeof v !== 'string') return { ok: false, reason: 'files' };
    let u;
    try { u = b64(v); } catch { return { ok: false, reason: 'files' }; }
    total += u.length;
    if (total > LIMITS.bytes) return { ok: false, reason: 'files' };
    files[p] = u;
  }
  const signature = obj.signature && typeof obj.signature === 'object' ? { alg: String(obj.signature.alg || ''), key: String(obj.signature.key || ''), sig: String(obj.signature.sig || '') } : null;
  return { ok: true, pkg: { manifest: obj.manifest, files, signature } };
}

/**
 * Store builds (A.11; docs/ADDONS-SPEC.md §8): the page's #cc-edition JSON says "addons": "bundled" → the apps take only the
 * add-ons shipped inside the build (no installed packages, no developer mode, no directory), as Apple 2.5.2 and Google Play
 * require. `doc` for tests.
 */
export function bundledOnly(doc = typeof document !== 'undefined' ? document : null) {
  try { const ed = JSON.parse((doc && doc.getElementById('cc-edition') && doc.getElementById('cc-edition').textContent) || 'null'); return !!ed && ed.addons === 'bundled'; }
  catch { return false; }
}

/** The package store a store build uses: always empty, and installing into it is refused. */
export const NO_PACKAGES = Object.freeze({
  kind: 'none', list: async () => [], get: async () => null, del: async () => {},
  put: async () => { throw Object.assign(new Error('This build takes only the add-ons it ships with.'), { code: 'bundled-only' }); },
});

/** Make the loader trust signed packages: AddonLoader.verify(pkg) → true only for a good signature. */
export function installTrust(Loader, opts = {}) {
  Loader.verify = async (pkg) => (await verifyPackage(pkg, opts)).ok;
  return Loader;
}

// ------------------------------------------------------------------------------------------- Ed25519 (RFC 8032 §5.1)

let webEd = null;   // null = not tried, true / false
/** Verify an Ed25519 signature: WebCrypto when it can, else the BigInt code below. */
export async function ed25519Verify(pub, sig, msg) {
  if (!(pub instanceof Uint8Array) || pub.length !== 32 || !(sig instanceof Uint8Array) || sig.length !== 64) return false;
  if (webEd !== false && subtle()) {
    try {
      const key = await subtle().importKey('raw', pub, { name: 'Ed25519' }, false, ['verify']);
      const r = await subtle().verify({ name: 'Ed25519' }, key, sig, msg);
      webEd = true;
      return r;
    } catch (e) {
      if (webEd === true) return false;   // WebCrypto works: this key or signature is bad
      webEd = false;
    }
  }
  return verifyEd25519(pub, sig, msg);
}

const P = 2n ** 255n - 19n;
const L = 2n ** 252n + 27742317777372353535851937790883648493n;
const mod = (a, m = P) => { const r = a % m; return r >= 0n ? r : r + m; };
function pow(b, e, m = P) { let r = 1n; b = mod(b, m); while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r; }
const inv = (x) => pow(x, P - 2n);
const D = mod(-121665n * inv(121666n));
const SQRT_M1 = pow(2n, (P - 1n) / 4n);
const leInt = (bytes) => { let n = 0n; for (let i = bytes.length - 1; i >= 0; i--) n = (n << 8n) + BigInt(bytes[i]); return n; };
const intLe = (n, len = 32) => { const out = new Uint8Array(len); for (let i = 0; i < len; i++) { out[i] = Number(n & 255n); n >>= 8n; } return out; };

// extended coordinates (X, Y, Z, T), x = X/Z, y = Y/Z, xy = T/Z
const ZERO = [0n, 1n, 1n, 0n];
function add([X1, Y1, Z1, T1], [X2, Y2, Z2, T2]) {
  const A = mod((Y1 - X1) * (Y2 - X2)), B = mod((Y1 + X1) * (Y2 + X2)), C = mod(2n * T1 * T2 * D), Dd = mod(2n * Z1 * Z2);
  const E = B - A, F = Dd - C, G = Dd + C, H = B + A;
  return [mod(E * F), mod(G * H), mod(F * G), mod(E * H)];
}
function mul(s, pt) { let q = ZERO; while (s > 0n) { if (s & 1n) q = add(q, pt); pt = add(pt, pt); s >>= 1n; } return q; }
function encode([X, Y, Z]) { const zi = inv(Z), x = mod(X * zi), y = mod(Y * zi); const b = intLe(y); b[31] |= Number(x & 1n) << 7; return b; }
function decode(bytes) {
  const b = Uint8Array.from(bytes);
  const sign = b[31] >> 7; b[31] &= 0x7f;
  const y = leInt(b);
  if (y >= P) return null;
  const u = mod(y * y - 1n), v = mod(D * y * y + 1n);
  let x = mod(u * pow(v, 3n) * pow(u * pow(v, 7n), (P - 5n) / 8n));
  const vx2 = mod(v * x * x);
  if (vx2 === mod(-u)) x = mod(x * SQRT_M1);
  else if (vx2 !== u) return null;
  if (x === 0n && sign) return null;
  if (Number(x & 1n) !== sign) x = P - x;
  return [x, y, 1n, mod(x * y)];
}
const G = decode(intLe(4n * inv(5n)));   // the base point: y = 4/5, x even

/** RFC 8032 §5.1.7 (cofactorless: [S]B = R + [k]A, compared as encodings). */
export async function verifyEd25519(pub, sig, msg) {
  if (pub.length !== 32 || sig.length !== 64) return false;
  const A = decode(pub), Rb = sig.slice(0, 32), R = decode(Rb), S = leInt(sig.slice(32));
  if (!A || !R || S >= L) return false;
  const h = new Uint8Array(await subtle().digest('SHA-512', concat(Rb, pub, msg)));
  const k = mod(leInt(h), L);
  const lhs = encode(mul(S, G)), rhs = encode(add(R, mul(k, A)));
  return lhs.every((x, i) => x === rhs[i]);
}
function concat(...parts) { const n = parts.reduce((s, p) => s + p.length, 0); const out = new Uint8Array(n); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; }
