#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Node test for offline add-ons (0.9 OF.1–OF.5; docs/0.9-OFFLINE-ADDONS.md): assets/js/addons-offline.js (the readiness check, Make available offline,
// Remove, the visitor's browser plan, paid entitlements offline), app-addons-account.js installFromFile (OF.4 Add from a file / drop) and gc keeping what
// was kept on purpose, app-addon-license.js setPaid. Packages and entitlement tokens are signed here with Node's Ed25519 in the formats the site writes
// (AddonSigning / AddonEntitlements). No browser, no network.   node tools/addons-test/offline-client.mjs
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const JS = path.join(ROOT, 'public_html/assets/js');
const imp = (f) => import(pathToFileURL(path.join(JS, f)).href);
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const T = await imp('addons-trust.js');
const O = await imp('addons-offline.js');
const A = await imp('app-addons-account.js');
const L = await imp('app-addon-license.js');

// ---- signing, like the site
const pk = crypto.generateKeyPairSync('ed25519');
const PUB = pk.publicKey.export({ format: 'der', type: 'spki' }).subarray(-32).toString('base64');
const evil = crypto.generateKeyPairSync('ed25519');
const KEYS = { 't-1': PUB };
const trust = { readPackageJson: T.readPackageJson, sha256Hex: T.sha256Hex, verifyPackage: (p) => T.verifyPackage(p, { keys: KEYS }) };
const te = new TextEncoder();
async function makePackage(id, version, { apps = ['cadcraft'], key = pk.privateKey, extra = {} } = {}) {
  const manifest = { id, name: id.toUpperCase(), version, apps, api: '1.0', license: 'Apache-2.0', entry: './main.js', permissions: [], ...extra };
  const files = { 'addon.json': te.encode(JSON.stringify(manifest)), 'main.js': te.encode('export function activate() {}\n') };
  const text = await T.packageDigest({ manifest, files });
  const sig = crypto.sign(null, Buffer.from(text), key).toString('base64');
  const obj = { format: 'cadcraft-addon-package', version: 1, manifest, files: Object.fromEntries(Object.entries(files).map(([p, b]) => [p, Buffer.from(b).toString('base64')])), signature: { alg: 'Ed25519', key: 't-1', sig } };
  const bytes = te.encode(JSON.stringify(obj));
  return { obj, bytes, sha: await T.sha256Hex(bytes) };
}
const NOW = Date.UTC(2026, 10, 2, 12);
const b64u = (b) => Buffer.from(b).toString('base64url');
function token(item, { ttl = 30 * 86400, kid = 'e-1', key = pk.privateKey } = {}) {
  const payload = JSON.stringify({ v: 1, kid, acct: 7, item, major: null, features: [], src: 'order', iat: Math.floor(NOW / 1000), exp: Math.floor(NOW / 1000) + ttl });
  return b64u(payload) + '.' + b64u(crypto.sign(null, Buffer.from('cc-entitlement-v1\n' + payload), key));
}
const ENT_KEYS = { 'e-1': PUB };

// ---- fakes
const memStore = () => { const m = new Map(); return { m, list: async () => [...m.values()], get: async (id) => m.get(id) || null, put: async (p) => { m.set(p.id, structuredClone(p)); }, del: async (id) => { m.delete(id); } }; };
const memStorage = () => { const m = new Map(); return { m, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } }; };
function fakeSw() {
  const caches = new Map(); const saved = new Set();
  return { available: true, caches, saved, removed: [],
    status: async (key) => ({ saved: saved.has(key) || caches.has(key) }),
    check: async (key, urls) => { const c = caches.get(key) || new Set(); return { have: urls.filter((u) => c.has(u)), missing: urls.filter((u) => !c.has(u)) }; },
    save: async (key, urls, onP) => { caches.set(key, new Set(urls)); onP && onP({ done: urls.length, total: urls.length }); return { ok: true }; },
    remove: async (key) => { caches.delete(key); return { ok: true }; } };
}

// ---- words
ok(O.sizeLabel(38 * 1048576) === '38 MB' && O.sizeLabel(1.5 * 1048576) === '1.5 MB' && O.sizeLabel(2000) === '2 KB', 'sizes read like the spec ("38 MB")');
ok(O.whenLabel(NOW, NOW) === 'today' && O.whenLabel(NOW - 86400000, NOW) === 'yesterday' && O.whenLabel(NOW - 3 * 86400000, NOW) === '3 days ago', 'when: today, yesterday, n days ago');
ok(O.readinessLine({ ready: 14, total: 14, bytes: 38 * 1048576, at: NOW }, NOW) === '14 of 14 ready · 38 MB · prepared today', 'the readiness line is the spec\'s "14 of 14 ready · 38 MB · prepared today"');
ok(/not prepared/.test(O.readinessLine({ ready: 0, total: 3, bytes: 0, at: null }, NOW)), 'not prepared yet says so');

// ---- the plan
const pA = await makePackage('alpha', '1.2.0');
const pE = await makePackage('engine.calc', '2.0.0');
const pP = await makePackage('acme.paid', '1.0.0');
const pT = await makePackage('tampered', '1.0.0');
const tamperedBytes = te.encode(JSON.stringify({ ...pT.obj, files: { ...pT.obj.files, 'main.js': Buffer.from('export function activate(){ steal() }').toString('base64') } }));
const pEvil = await makePackage('forged', '1.0.0', { key: evil.privateKey });
const entry = (id, how, o = {}) => ({ id, name: id.toUpperCase(), kind: o.kind || 'addon', cls: 'code', how, v: o.v || null, pkg: o.pkg || null, apps: o.apps || [], files: o.files || [], bytes: o.bytes || 0, why: o.why || '', paid: !!o.paid, ent: o.ent || null, needs: o.needs || [], url: '/library/addons/' + id });
const plan = {
  who: 'a123', edition: 'web', key: O.KEY, apps: [{ slug: 'cadcraft', name: 'CadCraft' }, { slug: 'bimcraft', name: 'BimCraft' }],
  items: [
    entry('engine.calc', 'package', { kind: 'engine', v: '2.0.0', pkg: { url: '/addons/package/engine.calc/2.0.0', sha256: pE.sha, size: pE.bytes.length, version: '2.0.0' } }),
    entry('alpha', 'package', { v: '1.2.0', needs: ['engine.calc'], pkg: { url: '/addons/package/alpha/1.2.0', sha256: pA.sha, size: pA.bytes.length, version: '1.2.0' }, apps: [{ slug: 'cadcraft', name: 'CadCraft' }] }),
    entry('electrical', 'app', { apps: [{ slug: 'cadcraft', name: 'CadCraft' }, { slug: 'bimcraft', name: 'BimCraft' }] }),
    entry('field.arch', 'files', { files: ['/assets/fields/index.json', '/assets/fields/arch/pack.json'], bytes: 5000 }),
    entry('nofile.one', 'nofile', { why: 'The Library has no file for version 0.1.1 yet.' }),
    entry('acme.paid', 'package', { v: '1.0.0', paid: true, pkg: { url: '/addons/package/acme.paid/1.0.0', sha256: pP.sha, size: pP.bytes.length, version: '1.0.0' } }),
    entry('later.one', 'planned', { why: 'Still being built.' }),
    entry('closed.one', 'closed', { why: 'Paid add-ons open later.', paid: true }),
  ],
  list: [{ id: 'alpha', paid: false }, { id: 'acme.paid', paid: true, entitlement: token('acme.paid') }],
};
const served = { '/addons/package/alpha/1.2.0': pA.bytes, '/addons/package/engine.calc/2.0.0': pE.bytes, '/addons/package/acme.paid/1.0.0': pP.bytes };
const asked = [];
const fakeFetch = async (url) => { asked.push(url); const b = served[url]; return b ? { ok: true, status: 200, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), text: async () => '' } : { ok: false, status: 404, text: async () => '' }; };
const mk = (o = {}) => {
  const st = { packages: memStore(), engines: memStore(), storage: memStorage(), sw: fakeSw(), ...o };
  st.off = new O.OfflineAddons({ plan: o.plan || plan, fetch: o.fetch || fakeFetch, packages: st.packages, engines: st.engines, trust, storage: st.storage, sw: st.sw, keys: ENT_KEYS, now: () => o.now || NOW, persist: async () => true });
  return st;
};

let s = mk();
let r = await s.off.check();
ok(r.total === 6 && r.ready === 0 && r.at === null, 'before: 6 items to keep (planned and closed ones are not counted), none ready, not prepared', JSON.stringify([r.total, r.ready]));
ok(r.skipped.length === 2 && r.skipped.some((x) => x.id === 'later.one') && r.skipped.some((x) => x.id === 'closed.one'), 'what is not included is listed with its reason');
ok(r.items.find((i) => i.id === 'electrical').note.includes('save'), 'an add-on inside the app names the apps to save for offline');
ok(asked.length === 0, 'the check never downloads anything');

const prog = [];
const pr = await s.off.prepare((p) => prog.push(p));
ok(!pr.ok && pr.failed.length === 0 || pr.ok, 'prepare finishes', JSON.stringify(pr.failed));
ok(pr.stored.length === 3 && s.packages.m.has('alpha') && s.packages.m.has('acme.paid') && s.engines.m.has('engine.calc@2.0.0'), 'add-ons go to the loader\'s store, the engine to the engine store as id@version');
ok([...s.packages.m.values(), ...s.engines.m.values()].every((x) => x.keep === 'offline' && x.signature && x.manifest), 'every stored record carries its signature and keep:offline');
ok(s.sw.caches.get(O.KEY) && s.sw.caches.get(O.KEY).has('/assets/fields/arch/pack.json'), 'the data files are saved by the service worker under addons/offline');
ok(JSON.parse(s.storage.getItem(O.LIST_KEY)).length === 2, 'signed in, the resolved list is written where the apps read their last list');
ok(prog.length >= 3 && prog[prog.length - 1].done === prog[prog.length - 1].total, 'progress is reported to the end');
r = pr.check;
ok(r.ready === 4 && r.total === 6, 'after: 4 of 6 ready (the app item waits for the app, the no-file item never)', JSON.stringify(r.items.map((i) => i.id + ':' + i.state)));
ok(r.items.find((i) => i.id === 'nofile.one').state === 'missing' && /no file/.test(r.items.find((i) => i.id === 'nofile.one').note), 'an item the Library cannot hand out is named with the reason');
ok(/works offline until/.test(r.items.find((i) => i.id === 'acme.paid').note) && r.items.find((i) => i.id === 'acme.paid').state === 'ready', 'OF.5: a paid item with a live entitlement is ready and says until when');
ok(/^4 of 6 ready · \d/.test(r.line) && /prepared today$/.test(r.line), 'the line: "4 of 6 ready · … · prepared today"', r.line);
ok(r.persisted === true, 'the browser was asked to keep the files');
s.sw.saved.add('try/cadcraft');
r = await s.off.check();
ok(r.items.find((i) => i.id === 'electrical').state === 'ready' && r.apps.find((a) => a.slug === 'cadcraft').saved && !r.apps.find((a) => a.slug === 'bimcraft').saved, 'once CadCraft is saved for offline, what comes inside it is ready; BimCraft is named as not saved');
asked.length = 0;
await s.off.prepare();
ok(asked.length === 0, 'preparing again downloads nothing that is already kept and checks out');

// out of date, tampered, forged
s.packages.m.set('alpha', { ...s.packages.m.get('alpha'), manifest: { ...s.packages.m.get('alpha').manifest, version: '1.1.0' } });
r = await s.off.check();
ok(r.items.find((i) => i.id === 'alpha').state === 'old' && /1\.1\.0/.test(r.items.find((i) => i.id === 'alpha').note), 'an older version kept is named "out of date" with both versions');
const st2 = s.packages.m.get('acme.paid'); s.packages.m.set('acme.paid', { ...st2, files: { ...st2.files, 'main.js': te.encode('changed') } });
r = await s.off.check();
ok(r.items.find((i) => i.id === 'acme.paid').state === 'missing' && /did not pass/.test(r.items.find((i) => i.id === 'acme.paid').note), 'a stored copy that was changed fails the check and is named');
const planBad = { ...plan, items: [entry('tampered', 'package', { v: '1.0.0', pkg: { url: '/t', sha256: await T.sha256Hex(tamperedBytes), size: 1, version: '1.0.0' } }), entry('forged', 'package', { v: '1.0.0', pkg: { url: '/f', sha256: pEvil.sha, size: 1, version: '1.0.0' } }), entry('hashy', 'package', { v: '1.2.0', pkg: { url: '/addons/package/alpha/1.2.0', sha256: 'ab'.repeat(32), size: 1, version: '1.2.0' } })], list: null };
const badFetch = async (u) => { const b = u === '/t' ? tamperedBytes : u === '/f' ? pEvil.bytes : pA.bytes; return { ok: true, status: 200, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) }; };
const sb = mk({ plan: planBad, fetch: badFetch });
const rb = await sb.off.prepare();
const why = Object.fromEntries(rb.failed.map((f) => [f.id, f.reason]));
ok(why.tampered === 'signature' && why.forged === 'signature' && why.hashy === 'hash' && sb.packages.m.size === 0, 'a changed file, a file signed by another key and a checksum mismatch are all refused and nothing of them is stored', JSON.stringify(why));
const s404 = mk({ fetch: async () => ({ ok: false, status: 402, text: async () => '' }) });
const r404 = await s404.off.prepare();
ok(r404.failed.every((f) => f.reason === 'not-held') && r404.failed.length === 3, 'a 402 from the package endpoint reads "you do not hold it"');

// paid entitlements offline (OF.5)
const sp = mk({ plan: { ...plan, list: [{ id: 'acme.paid', paid: true, entitlement: token('acme.paid', { ttl: 3 * 86400 }) }] } });
await sp.off.prepare();
r = await sp.off.check();
ok(/renew/.test(r.items.find((i) => i.id === 'acme.paid').note) && r.items.find((i) => i.id === 'acme.paid').state === 'ready', 'three days left: still ready, and it says go online to renew');
const later = mk({ plan: { ...plan, list: [{ id: 'acme.paid', paid: true, entitlement: token('acme.paid', { ttl: 3 * 86400 }) }] } });
await later.off.prepare();
const lateOff = new O.OfflineAddons({ plan, fetch: fakeFetch, packages: later.packages, engines: later.engines, trust, storage: later.storage, sw: later.sw, keys: ENT_KEYS, now: () => NOW + 4 * 86400000 });
r = await lateOff.check();
ok(r.items.find((i) => i.id === 'acme.paid').state === 'missing' && /ran out/.test(r.items.find((i) => i.id === 'acme.paid').note), 'offline past the token\'s end: not ready, "its licence ran out"');
const nokey = new O.OfflineAddons({ plan, fetch: fakeFetch, packages: sp.packages, engines: sp.engines, trust, storage: sp.storage, sw: sp.sw, keys: {}, now: () => NOW });
r = await nokey.check();
ok(/no entitlement key/.test(r.items.find((i) => i.id === 'acme.paid').note), 'a build without the entitlement public key says so (paid stays locked: the owner pastes the key)');
const forgedEnt = mk({ plan: { ...plan, list: [{ id: 'acme.paid', paid: true, entitlement: token('acme.paid', { key: evil.privateKey }) }] } });
await forgedEnt.off.prepare();
r = await forgedEnt.off.check();
ok(r.items.find((i) => i.id === 'acme.paid').state === 'missing', 'an entitlement signed by another key is not accepted');
// refresh: a later visit online writes the fresh list (fresh tokens), downloads nothing
const fresh = token('acme.paid', { ttl: 30 * 86400 });
const s3 = mk({ plan: { ...plan, list: [{ id: 'acme.paid', paid: true, entitlement: token('acme.paid', { ttl: 86400 }) }] } });
await s3.off.prepare();
asked.length = 0;
const s3b = new O.OfflineAddons({ plan: { ...plan, list: [{ id: 'acme.paid', paid: true, entitlement: fresh }] }, fetch: fakeFetch, packages: s3.packages, engines: s3.engines, trust, storage: s3.storage, sw: s3.sw, keys: ENT_KEYS, now: () => NOW + 3600000 });
ok(s3b.refresh() && JSON.parse(s3.storage.getItem(O.LIST_KEY))[0].entitlement === fresh && asked.length === 0, 'refresh while online: the fresh entitlement replaces the old one, nothing is downloaded');
const s3c = new O.OfflineAddons({ plan: { ...plan, who: 'someone-else' }, packages: s3.packages, engines: s3.engines, trust, storage: s3.storage, sw: s3.sw });
ok(!s3c.refresh() && (await s3c.check()).other === true, 'another account in the same browser does not refresh someone else\'s copy and is told there is one');

// remove
s.packages.m.set('own', { id: 'own', manifest: { id: 'own', version: '1.0.0' }, files: {}, keep: undefined });
const rm = await s.off.remove();
ok(rm.removed === 3 && s.packages.m.has('own') && !s.packages.m.has('alpha') && s.engines.m.size === 0, 'Remove takes what the button stored and leaves a copy an app fetched itself');
ok(!s.sw.caches.has(O.KEY) && s.storage.getItem(O.LIST_KEY) === null && s.storage.getItem(O.MARK) === null, 'and the data files, the list it wrote and its marker');

// visitor plan (OF.2 / OF.3)
const cat = { a: { ...entry('a', 'package', { needs: ['engine.x'] }) }, 'engine.x': entry('engine.x', 'app', { kind: 'engine', apps: [{ slug: 'bimcraft', name: 'BimCraft' }] }), b: entry('b', 'app', { apps: [{ slug: 'cadcraft', name: 'CadCraft' }] }) };
const bp = O.browserPlan(cat, ['a', 'missing', 'b', 'a']);
ok(bp.who === 'browser' && bp.list === null && bp.items.map((e) => e.id).join(',') === 'engine.x,a,b', 'a visitor\'s plan is the closure of the browser list, needs first, unknown ids dropped');
ok(bp.apps.map((a) => a.slug).sort().join(',') === 'bimcraft,cadcraft', 'and names the apps those run in');
const ls = memStorage();
ok(O.addLocal(ls, 'a') && O.addLocal(ls, 'a') && O.readLocal(ls).join() === 'a', '"Use offline" adds the id to this browser\'s list once (cc-addons:local, the list Add to this browser uses)');
const vis = new O.OfflineAddons({ plan: bp, fetch: fakeFetch, packages: memStore(), engines: memStore(), trust, storage: ls, sw: fakeSw(), keys: ENT_KEYS, now: () => NOW });
await vis.prepare();
ok(ls.getItem(O.LIST_KEY) === null && JSON.parse(ls.getItem(O.MARK)).who === 'browser', 'a visitor\'s copy writes no account list; its marker says "browser"');

// ---- OF.4: Add from a file (app-addons-account.js)
const loaderPkgs = memStore();
const fakeLoader = { app: 'cadcraft', packages: loaderPkgs, async installPackage(pkg) { if (!pkg.manifest.apps.includes('cadcraft')) return { ok: false, reason: 'app' }; await loaderPkgs.put({ id: pkg.manifest.id, manifest: pkg.manifest, files: pkg.files, signature: pkg.signature, source: pkg.source }); return { ok: true }; } };
const acc = { items: [{ id: 'acme.paid', paid: true }], engines: memStore(), trust };
let f = await A.installFromFile({ acc, loader: fakeLoader, trust, name: 'alpha-1.2.0.ccaddon.json', bytes: pA.bytes });
ok(f.ok && f.id === 'alpha' && loaderPkgs.m.get('alpha').keep === 'file' && /^file:alpha/.test(loaderPkgs.m.get('alpha').source), 'a signed package file is checked and handed to the loader, marked keep:file');
ok(/checked and added/.test(A.fileResultText(f)), 'it says it was checked and added, and to reload');
f = await A.installFromFile({ acc, loader: fakeLoader, trust, name: 't.ccaddon.json', bytes: tamperedBytes });
ok(!f.ok && f.reason.startsWith('signature') && !loaderPkgs.m.has('tampered'), 'a changed file is refused (signature)');
f = await A.installFromFile({ acc, loader: fakeLoader, trust, name: 'f.ccaddon.json', bytes: pEvil.bytes });
ok(!f.ok && f.reason.startsWith('signature'), 'a file signed by someone else is refused');
const unsigned = te.encode(JSON.stringify({ ...pA.obj, signature: null }));
f = await A.installFromFile({ acc, loader: fakeLoader, trust, name: 'u.ccaddon.json', bytes: unsigned });
ok(!f.ok && f.reason === 'unsigned' && /not signed by getcadcraft\.com/.test(A.fileResultText(f)), 'an unsigned file is refused and said so');
f = await A.installFromFile({ acc, loader: fakeLoader, trust, name: 'x.ccaddon.json', bytes: (await makePackage('bimonly', '1.0.0', { apps: ['bimcraft'] })).bytes });
ok(!f.ok && f.reason === 'other-app' && /another app/.test(A.fileResultText(f)), 'a package for another app is refused with that reason');
f = await A.installFromFile({ acc, loader: fakeLoader, trust, name: 'p.ccaddon.json', bytes: pP.bytes, gate: async () => 'paid:no-entitlement' });
ok(!f.ok && f.reason === 'paid' && !loaderPkgs.m.has('acme.paid'), 'OF.5: a paid package with no live licence on this device is refused');
f = await A.installFromFile({ acc, loader: fakeLoader, trust, name: 'p.ccaddon.json', bytes: pP.bytes, gate: async () => null });
ok(f.ok && loaderPkgs.m.has('acme.paid'), 'with a live licence it installs');
f = await A.installFromFile({ acc: { items: [], engines: memStore(), trust }, loader: fakeLoader, trust, name: 'p.ccaddon.json', bytes: pP.bytes, gate: null, paidIds: new Set(['acme.paid']) });
ok(!f.ok && f.reason === 'paid', 'a paid id the page knows is gated even when this device\'s list does not name it');
const eng = { items: [], engines: memStore(), trust };
f = await A.installFromFile({ acc: eng, loader: fakeLoader, trust, name: 'e.ccaddon.json', bytes: pE.bytes });
ok(f.ok && f.kind === 'engine' && eng.engines.m.get('engine.calc@2.0.0').keep === 'file', 'an engine package goes to the engine store as id@version');
ok(!(await A.installFromFile({ acc, loader: fakeLoader, trust, name: 'big.ccaddon.json', bytes: new Uint8Array(A.FILE_MAX_BYTES + 1) })).ok, 'a file over the size limit is refused');
ok((await A.installFromFile({ acc, loader: fakeLoader, trust, name: 'drawing.dwg', bytes: pA.bytes })).reason === 'name', 'a file that is not a package is not taken');
ok((await A.installFromFile({ acc, loader: fakeLoader, trust, name: 'junk.ccaddon.json', bytes: te.encode('{nope') })).reason === 'unreadable', 'an unreadable file is refused');

// gc keeps what was kept on purpose
const gcAcc = new A.AddonsAccount({ app: 'cadcraft', storage: memStorage(), packages: memStore(), engines: memStore(), history: memStore(), now: () => NOW + 60 * 86400000 });
await gcAcc.packages.put({ id: 'kept.offline', manifest: { id: 'kept.offline', version: '1.0.0' }, keep: 'offline' });
await gcAcc.packages.put({ id: 'kept.file', manifest: { id: 'kept.file', version: '1.0.0' }, keep: 'file' });
await gcAcc.engines.put({ id: 'engine.k@1.0.0', manifest: { version: '1.0.0' }, keep: 'file' });
await gcAcc.gc(); await gcAcc.gc();
ok(await gcAcc.packages.get('kept.offline') && await gcAcc.packages.get('kept.file') && await gcAcc.engines.get('engine.k@1.0.0'), 'the account client\'s gc never frees a copy kept for offline or added from a file');

// app-addon-license: paid ids the list does not name
L.setItems([]);
L.setPaid(['acme.paid']);
ok(await L.gate('acme.paid') === 'paid:no-entitlement' && await L.gate('alpha') === null, 'the licence gate refuses a known paid id that is not on the list, and lets free ones through');
L.setPaid([]);

console.log(fail ? `FAILED ${fail} (passed ${pass})` : `passed ${pass}`);
process.exit(fail ? 1 : 0);
