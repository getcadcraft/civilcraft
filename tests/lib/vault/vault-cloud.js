/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — DOM-free library: its literals are file data and errors for developers. */
/**
 * vault-cloud.js — a vault in a cloud folder (0.8 SU.1058 step 8, session `vault-08`): the same VaultFs interface as vault-fs.js, over
 * a small HTTP contract, so the vault's rules (locks, revisions, states, log) run unchanged and the SERVER supplies the one thing a
 * folder cannot: an exclusive create that is strict across people (a unique key per folder + path in the database; B2 itself has no
 * create-if-absent). Canonical here (lib/vault); the apps' copies are written by tools/vault/sync.mjs when an app takes cloud mode.
 *
 *   cloudFs(request, base) → VaultFs  { kind: 'cloud', exclusive: true, read, write, create, append?, remove, list, stat }
 *     request(method, url, { body, headers }) → { status, bytes() }   the app's transport (the signed-in session or the device token;
 *                                                                     fetch + Authorization, or Studio's bridge.cloud)
 *     base                the folder's API root, e.g. "/api/v1/vault/<folder-uuid>"
 *
 * The contract the server answers (not built yet — docs/0.8-sessions/vault-08.md § Cloud mode; every call is CloudAccess-checked,
 * `.ccvault/…` paths are ordinary paths, a path is the same clean relative form as cleanRel):
 *   GET    {base}/f/<path>             200 bytes | 404
 *   PUT    {base}/f/<path>             body = bytes, replaces the file (makes folders)            → 204 | 507 over quota
 *   POST   {base}/f/<path>?create=1    body = bytes; 201 when this call made the file, 409 when it exists (atomic: unique key) | 507
 *   DELETE {base}/f/<path>             204 | 404
 *   GET    {base}/list?dir=<path>      200 [{ "name": "a.dwg", "dir": false }, …] (one folder, no recursion)
 *   GET    {base}/stat/<path>          200 { "size": n, "mtime": ms } | 404
 * Every other status is an error (the adapter throws { code: 'cloud', status }); 401/403 carry the app's sign-in or access message.
 * There is no append: the vault falls back to read + write under its mutex, which is exclusive here too.
 */
import { cleanRel, toU8 } from './vault-fs.js';

const enc = (rel) => cleanRel(rel).split('/').map(encodeURIComponent).join('/');
const err = (status, what) => Object.assign(new Error('vault cloud: ' + what + ' → ' + status), { code: 'cloud', status });

export function cloudFs(request, base) {
  const root = String(base).replace(/\/+$/, '');
  const call = (method, url, body) => request(method, url, body === undefined ? {} : { body: toU8(body), headers: { 'Content-Type': 'application/octet-stream' } });
  return {
    kind: 'cloud', exclusive: true,
    async read(rel) {
      const r = await call('GET', root + '/f/' + enc(rel));
      if (r.status === 404) return null;
      if (r.status !== 200) throw err(r.status, 'read ' + rel);
      const b = new Uint8Array(await r.bytes());
      return b.length ? b : null;   // a zero-byte file reads as missing, as everywhere else in the vault
    },
    async write(rel, b) {
      const r = await call('PUT', root + '/f/' + enc(rel), b);
      if (r.status !== 204 && r.status !== 200 && r.status !== 201) throw err(r.status, 'write ' + rel);
    },
    async create(rel, b) {
      const r = await call('POST', root + '/f/' + enc(rel) + '?create=1', b);
      if (r.status === 201) return true;
      if (r.status === 409) return false;
      throw err(r.status, 'create ' + rel);
    },
    async remove(rel) {
      const r = await call('DELETE', root + '/f/' + enc(rel));
      if (r.status === 404) return false;
      if (r.status !== 204 && r.status !== 200) throw err(r.status, 'remove ' + rel);
      return true;
    },
    async list(dir) {
      const r = await call('GET', root + '/list?dir=' + encodeURIComponent(dir ? cleanRel(dir) : ''));
      if (r.status === 404) return [];
      if (r.status !== 200) throw err(r.status, 'list ' + (dir || '/'));
      const out = JSON.parse(new TextDecoder().decode(new Uint8Array(await r.bytes())));
      return (Array.isArray(out) ? out : []).map((e) => ({ name: String(e.name), dir: !!e.dir })).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    },
    async stat(rel) {
      const r = await call('GET', root + '/stat/' + enc(rel));
      if (r.status === 404) return null;
      if (r.status !== 200) throw err(r.status, 'stat ' + rel);
      const o = JSON.parse(new TextDecoder().decode(new Uint8Array(await r.bytes())));
      return { size: Number(o.size) || 0, mtime: Number(o.mtime) || 0 };
    },
  };
}
