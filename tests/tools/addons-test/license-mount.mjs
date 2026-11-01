#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Node test for api.license in the add-on host (0.8 AL.15): app-addon-license.js + addons.js (licenseFor, the gate) + app-addons-account.js (hands the list over).
// Tokens are signed here with Node's Ed25519 in the format AddonEntitlements.php writes. No browser, no network.
//   node tools/addons-test/license-mount.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const JS = path.join(ROOT, 'public_html/assets/js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
const PUB = publicKey.export({ format: 'der', type: 'spki' }).subarray(-32).toString('base64');
const other = crypto.generateKeyPairSync('ed25519');
const b64u = (b) => Buffer.from(b).toString('base64url');
const NOW = Date.now();
function token(item, o = {}, key = privateKey) {
  const payload = JSON.stringify({ v: 1, kid: o.kid || 'k1', acct: 1, item, major: o.major ?? null, features: o.features || [], src: 'order', iat: Math.floor(NOW / 1000), exp: Math.floor(NOW / 1000) + (o.ttl ?? 30 * 86400) });
  return b64u(payload) + '.' + b64u(crypto.sign(null, Buffer.from('cc-entitlement-v1\n' + payload), key));
}

const L = await import(pathToFileURL(path.join(JS, 'app-addon-license.js')).href);
const KEYS = { k1: PUB };
const now = () => NOW;
const O = { keys: KEYS, now };

L.setItems([{ id: 'acme.pipes', paid: true, entitlement: token('acme.pipes', { features: ['export-dxf'] }) }, { id: 'free.one', paid: false }]);
let lic = L.licenseFor('acme.pipes', { keys: KEYS, now });
await lic.ready;
ok(lic.active() && lic.has('export-dxf') && !lic.has('other-feature'), 'a verified token: active, has only the features it lists');
ok(L.licenseFor('free.one', { keys: KEYS, now }) === null && await L.gate('free.one', { keys: KEYS, now }) === null, 'a free add-on: no license object, the gate lets it load');
ok(await L.gate('acme.pipes', { keys: KEYS, now }) === null, 'a paid add-on with a live entitlement loads');
ok(await L.gate('acme.pipes', { keys: {}, now }) === 'paid:no-entitlement', 'no trusted key (the owner has not pasted one): a paid add-on stays locked (fail closed)');
L.setItems([{ id: 'acme.pipes', paid: true, entitlement: token('acme.pipes', {}, other.privateKey) }]);
ok(await L.gate('acme.pipes', { keys: KEYS, now }) === 'paid:bad-signature', 'a token signed with another key: locked');
L.setItems([{ id: 'acme.pipes', paid: true, entitlement: token('someone.else') }]);
ok(await L.gate('acme.pipes', { keys: KEYS, now }) === 'paid:other-item', 'another item\'s token: locked');
L.setItems([{ id: 'acme.pipes', paid: true, entitlement: token('acme.pipes', { ttl: -10 }) }]);
ok(await L.gate('acme.pipes', { keys: KEYS, now }) === 'paid:expired', 'an expired token (past 30 days offline): locked');
L.setItems([{ id: 'acme.pipes', paid: true }]);
ok(await L.gate('acme.pipes', { keys: KEYS, now }) === 'paid:no-entitlement', 'a paid item with no token (not bought): locked');
const good = token('acme.pipes', { features: [] });
L.setItems([{ id: 'acme.pipes', paid: true, entitlement: good }]);
const parts = good.split('.'); const bad = parts[0] + '.' + b64u(Buffer.alloc(64));
L.setItems([{ id: 'acme.pipes', paid: true, entitlement: bad }]);
ok(await L.gate('acme.pipes', { keys: KEYS, now }) === 'paid:bad-signature', 'a tampered signature: locked');
L.setItems([{ id: 'acme.pipes', paid: true, entitlement: good }]);
lic = L.licenseFor('acme.pipes', { keys: KEYS, now });
await lic.ready;
ok(lic.has('anything') && lic.state().days_left >= 29, 'a token that lists no features = the whole item was bought; ~30 days left');

// ---- the loader: api.license on every add-on, the gate before a paid one's code runs
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-lic-'));
for (const id of ['paidone', 'freeone']) {
  fs.mkdirSync(path.join(dir, id), { recursive: true });
  fs.writeFileSync(path.join(dir, id, 'addon.json'), JSON.stringify({ id, name: id, version: '1.0.0', apps: ['cadcraft'], api: '1.0', license: 'MIT', entry: './main.js' }));
  fs.writeFileSync(path.join(dir, id, 'main.js'), `export function activate(api) { (globalThis.__lic ||= {})['${id}'] = { has: api.license.has('x'), active: api.license.active(), reason: api.license.state().reason }; }\n`);
}
fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify({ addons: ['paidone', 'freeone'] }));
const A = await import(pathToFileURL(path.join(JS, 'addons.js')).href);
const mk = (licenseFor) => new A.AddonLoader({ app: 'cadcraft', apiVersion: '1.0', appName: 'CadCraft', base: pathToFileURL(dir + '/').href, packages: A.packageStore(null), timeout: 500,
  storage: { getItem: () => null, setItem() {}, removeItem() {} }, licenseFor,
  fetchJson: async (u) => { try { return JSON.parse(fs.readFileSync(fileURLToPath(u), 'utf8')); } catch { return null; } },
  importer: (u) => import(u + '?t=' + Math.random()) });
globalThis.__lic = {};
L.setItems([{ id: 'paidone', paid: true, entitlement: token('paidone') }, { id: 'freeone', paid: false }]);
globalThis.ccAddonLicenseGate = (id) => L.gate(id, O);
let list = await mk((id) => L.licenseFor(id, O)).start();
let by = Object.fromEntries(list.map((a) => [a.id, a]));
ok(by.freeone.state === 'active' && globalThis.__lic.freeone.active === false && globalThis.__lic.freeone.reason === 'none', 'a free add-on gets an inert api.license (never needed)');
ok(by.paidone.state === 'active' && globalThis.__lic.paidone.active === true && globalThis.__lic.paidone.has === true, 'a paid add-on with a live entitlement: api.license.active() and has()');
globalThis.__lic = {};
L.setItems([{ id: 'paidone', paid: true }, { id: 'freeone', paid: false }]);
list = await mk(null).start();
by = Object.fromEntries(list.map((a) => [a.id, a]));
ok(by.paidone.state === 'failed' && by.paidone.reason === 'license' && !globalThis.__lic.paidone, 'a paid add-on without an entitlement does not load (its code never ran)');
ok(by.freeone.state === 'active', 'the free one still runs without paying');
delete globalThis.ccAddonLicenseGate;
fs.rmSync(dir, { recursive: true, force: true });

// ---- the account module hands the list over (cached list at start, every sync)
globalThis.ccAddonLicenseSet = L.setItems;
const AC = await import(pathToFileURL(path.join(JS, 'app-addons-account.js')).href);
const store = new Map([['cc-account-addons:web:list', '[]']]);
const items = [{ id: 'acme.pipes', paid: true, entitlement: good, kind: 'addon' }];
const acc = new AC.AddonsAccount({ app: 'cadcraft', edition: 'web', base: 'https://x.test', token: 't', storage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) }, fields: null,
  fetch: async () => ({ ok: true, status: 200, json: async () => ({ data: { items } }) }) });
const r = await acc.sync();
ok(r.ok && L.licenseFor('acme.pipes', { keys: KEYS, now }) !== null, 'a good sync hands the resolved list (with tokens) to api.license');

console.log(`\n${fail ? fail + ' FAILED, ' : ''}${pass} passed${fail ? '' : ', 0 failed'}`);
process.exit(fail ? 1 : 0);
