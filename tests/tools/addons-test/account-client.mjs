// SPDX-License-Identifier: Apache-2.0
// Node test for public_html/assets/js/app-addons-account.js (AL.4/5/6/8/9/11 client). No browser, no network: fetch and trust are faked.
import { createHash } from 'node:crypto';
import * as A from '../../public_html/assets/js/app-addons-account.js';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const sha = (u8) => createHash('sha256').update(u8).digest('hex');
const enc = (o) => new TextEncoder().encode(JSON.stringify(o));

// versions
ok(A.satisfies('1.4.2', '^1.2'), 'caret'); ok(!A.satisfies('2.0.0', '^1.2'), 'caret major'); ok(!A.satisfies('1.1.9', '^1.2'), 'below');
ok(A.satisfies('0.3.5', '^0.3.1') && !A.satisfies('0.4.0', '^0.3.1'), '0.x caret'); ok(A.satisfies('1.2.9', '~1.2.1') && !A.satisfies('1.3.0', '~1.2.1'), 'tilde');
ok(A.pickVersion(['1.0.0', '1.3.0', '2.0.0'], ['^1.0', '>=1.2']) === '1.3.0', 'pick'); ok(A.pickVersion(['1.0.0'], ['^2.0']) === null, 'pick none');

// edition policy
ok(!A.editionPolicy('apple_store').downloadCode && A.editionPolicy('apple_store').downloadContent, 'apple: content only');
ok(A.editionPolicy('android_store').downloadCode && A.editionPolicy('android_store').jsWasmOnly, 'play: JS/WASM');
ok(A.editionPolicy('ms_store').downloadCode, 'ms store');
ok(A.deliveryFor({ id: 'x', class: 'code' }, 'apple_store', []).how === 'refused', 'apple refuses unbundled code');
ok(A.deliveryFor({ id: 'x', class: 'code' }, 'apple_store', ['x']).how === 'bundled', 'apple bundled');
ok(A.deliveryFor({ id: 'x', class: 'code', firstParty: false }, 'apple_store', ['x']).how === 'refused', 'apple: outside author never');
ok(A.deliveryFor({ id: 'p', class: 'content' }, 'apple_store', []).how === 'content', 'apple: content downloads');

// fake server
const mkpkg = (id, version, extra = {}) => ({ manifest: { id, version, permissions: [], ...extra }, files: { 'main.js': 'x' }, signature: 'sig' });
const pk = {}; const bodies = {};
function addPkg(id, version, kind, needs = [], cls = 'code', extra = {}) {
  const url = `/addons/package/${id}/${version}`; const body = enc(mkpkg(id, version, extra)); bodies[url] = body;
  return { id, name: id, kind, class: cls, needs, available: true, source: 'you', pin: null, package: { url, version, sha256: sha(body) } };
}
let items = [
  addPkg('engine.network', '1.1.0', 'engine'),
  addPkg('piping', '2.4.0', 'addon'),
  addPkg('fire', '2.0.0', 'addon', [{ id: 'piping', range: '^2.0' }, { id: 'engine.network', range: '^1.0' }]),
];
let calls = 0, tamper = null, offline = false;
const fetchF = async (u) => {
  const s = String(u);
  if (offline) throw new Error('offline');
  if (s.includes('/api/v1/account/addons')) return { ok: true, status: 200, json: async () => ({ data: { items } }) };
  calls++;
  let b = bodies[s.replace(/^https?:\/\/[^/]+/, '')];
  if (!b) return { ok: false, status: 404 };
  if (tamper === s) b = enc({ evil: 1 });
  return { ok: true, status: 200, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) };
};
let sigGood = true;
const trust = { sha256Hex: async (u8) => sha(u8), readPackageJson: (o) => (o && o.manifest ? { ok: true, pkg: { manifest: o.manifest, files: o.files, signature: o.signature } } : { ok: false }), verifyPackage: async () => (sigGood ? { ok: true } : { ok: false, reason: 'signature' }) };
const mem = () => { const m = new Map(); return { list: async () => [...m.values()], get: async (k) => m.get(k) || null, put: async (p) => { m.set(p.id, p); }, del: async (k) => { m.delete(k); } }; };
const packages = mem(), engines = mem();
const acc = new A.AddonsAccount({ app: 'bimcraft', edition: 'web', fetch: fetchF, trust, packages, engines });

const s = await acc.sync(); ok(s.ok && acc.items.length === 3, 'sync');
const c = acc.closure('fire'); ok(c.ok && c.order.map((i) => i.id).join() === 'engine.network,piping,fire', 'closure order engines first');
ok(!acc.closure('nope').ok, 'unknown'); 
// all-or-nothing
tamper = '/addons/package/piping/2.4.0';
let r = await acc.ensure('fire'); ok(!r.ok && r.reason === 'hash', 'tampered bytes refused'); ok((await packages.list()).length === 0 && (await engines.list()).length === 0, 'nothing written on failure');
tamper = null; sigGood = false;
r = await acc.ensure('fire'); ok(!r.ok && r.reason.startsWith('signature'), 'bad signature refused'); ok((await packages.list()).length === 0, 'nothing written (sig)');
sigGood = true;
r = await acc.ensure('fire'); ok(r.ok && r.installed.length === 3, 'ensure installs closure'); ok((await engines.get('engine.network@1.1.0')) && (await packages.get('piping')), 'stored');
const before = calls; r = await acc.ensure('fire'); ok(r.ok && calls === before && r.installed.length === 0, 'cached: no refetch');
// shared engine: second add-on needing it fetches nothing for the engine
items.push(addPkg('sprink', '1.0.0', 'addon', [{ id: 'engine.network', range: '^1.0' }]));
await acc.sync(); const b2 = calls; r = await acc.ensure('sprink'); ok(r.ok && calls === b2 + 1, 'engine shared, one copy');
// conflict
items.push(addPkg('late', '1.0.0', 'addon', [{ id: 'engine.network', range: '^2.0' }])); await acc.sync();
const cf = acc.closure('late'); ok(!cf.ok && cf.reason === 'conflict', 'conflict found'); ok(/not what late asked/.test(acc.explain(cf)), 'conflict in words');
// cycle
items.push({ ...addPkg('a', '1.0.0', 'addon', [{ id: 'b', range: '*' }]) }, addPkg('b', '1.0.0', 'addon', [{ id: 'a', range: '*' }])); await acc.sync();
ok(acc.closure('a').reason === 'cycle', 'cycle');
// offline
offline = true; const so = await acc.sync(); ok(!so.ok && so.offline && acc.items.length > 0, 'offline keeps last list');
const uo = await acc.usableOffline(); ok(uo.includes('fire') && !uo.includes('late'), 'usable offline = what the cache holds'); offline = false;
// apple refuses download, no write
const apple = new A.AddonsAccount({ app: 'bimcraft', edition: 'apple_store', fetch: fetchF, trust, packages: mem(), engines: mem(), bundledIds: ['piping', 'engine.network'] });
apple.items = items; const cb = calls; r = await apple.ensure('fire'); ok(!r.ok && calls === cb, 'apple: fire (not bundled) refused with no fetch');
r = await apple.ensure('piping'); ok(r.ok && calls === cb, 'apple: bundled needs no download');
// updates
items = items.filter((i) => !['late', 'a', 'b'].includes(i.id));
items.find((i) => i.id === 'piping').package = (() => { const p = addPkg('piping', '2.5.0', 'addon').package; return p; })();
await acc.sync(); let up = await acc.checkUpdates(); ok(up.auto.some((u) => u.id === 'piping') && !up.confirm.length, 'minor update automatic');
const itp = items.find((i) => i.id === 'piping'); itp.package = addPkg('piping', '3.0.0', 'addon').package; await acc.sync();
up = await acc.checkUpdates(); ok(up.confirm.some((u) => u.id === 'piping' && u.why === 'major'), 'major asks');
itp.package = addPkg('piping', '2.6.0', 'addon', [], 'code', { permissions: ['files'] }).package; itp.package.permissions = ['files']; await acc.sync();
up = await acc.checkUpdates(); ok(up.confirm.some((u) => u.why === 'permissions'), 'permission change asks');
itp.package = addPkg('piping', '2.5.0', 'addon').package; await acc.sync();
r = await acc.applyUpdates(['piping']); ok(r.ok && (await packages.get('piping')).manifest.version === '2.5.0', 'applied');
const rb = await acc.rollBack(['piping']); ok(rb.ok && (await packages.get('piping')).manifest.version === '2.4.0', 'roll back');
// gc: remove from list, 30 days
let t = 1000; const acc2 = new A.AddonsAccount({ app: 'x', fetch: fetchF, trust, packages: mem(), engines: mem(), now: () => t });
acc2.items = items.filter((i) => ['engine.network', 'sprink'].includes(i.id)); await acc2.ensure('sprink');
ok((await acc2.gc()).freed.length === 0, 'gc keeps needed'); 
acc2.items = []; let g = await acc2.gc(); ok(!g.freed.includes('engine.network@1.1.0'), 'engine kept while a held add-on needs it'); ok((await acc2.packages.get('sprink')), 'add-on kept within grace');
t += A.GRACE_MS + 1; g = await acc2.gc(); ok(g.freed.includes('sprink'), 'gc frees removed add-on after 30 days'); ok(g.freed.includes('engine.network@1.1.0'), 'and the engine nothing needs any more');
// file records
const doc = {}; A.recordUsed(doc, 'acoustics', '1.2'); ok(A.usedBy(doc)[0].id === 'acoustics', 'recorded');
ok(A.missingFor(doc, []).length === 1 && A.missingFor(doc, ['acoustics']).length === 0, 'missing');
ok(/This file uses acoustics 1.2/.test(A.offerText(A.missingFor(doc, []))), 'offer text'); ok(A.usedBy({ addons: { '../x': '1' } }).length === 0, 'bad id dropped');
// migration
ok(A.migrateBundled(['electrical', 'hvac', 'piping'], { on: { hvac: true }, off: { piping: 'user' } }, ['electrical'], []).join() === 'electrical,hvac', 'migration keeps what was on');
// signed out
acc.addLocal('hvac'); ok(acc.localList().length === 1, 'local list');
// FL.0 / D-FL2: the account list's field packs go to ccFields.apply
{
  const seen = []; const F = { apply: async (ids) => { seen.push(ids); return { installed: ids, removed: [], failed: [] }; } };
  items = [{ id: 'field.structural', name: 'Structural', kind: 'field', class: 'content', needs: [], available: true, source: 'you' },
    { id: 'field.../x', name: 'bad', kind: 'field', class: 'content', needs: [], available: true }, { id: 'piping', name: 'p', kind: 'addon', class: 'code', needs: [], available: true }];
  const fa = new A.AddonsAccount({ app: 'detailcraft', edition: 'web', fetch: fetchF, trust, packages: mem(), engines: mem(), fields: () => F });
  const r = await fa.sync();
  ok(r.ok && seen.length === 1 && seen[0].join() === 'field.structural', 'sync hands only valid field.* ids to ccFields.apply');
  items = [{ id: 'piping', name: 'p', kind: 'addon', class: 'code', needs: [], available: true }];
  await fa.sync(); ok(seen.length === 2 && seen[1].length === 0, 'a pack gone from the list: apply([]) so the account-installed one is removed');
  offline = true; const ro = await fa.sync(); offline = false; ok(!ro.ok && seen.length === 2, 'offline: nothing applied, nothing removed');
  const none = new A.AddonsAccount({ app: 'x', fetch: fetchF, trust, packages: mem(), engines: mem(), fields: null });
  ok((await none.sync()).fields === null, 'no Field packs panel in this app: sync still fine');
  const bad = new A.AddonsAccount({ app: 'x', fetch: fetchF, trust, packages: mem(), engines: mem(), fields: () => ({ apply: async () => { throw new Error('x'); } }) });
  ok((await bad.sync()).ok, 'apply failing never breaks sync');
}

// AL.13: updates are all-or-nothing, the tab signs in through /library/connect, and the Settings screen drives them
{
  const mk2 = () => { const pk = mem(), en = mem(); return { pk, en }; };
  const base = () => [addPkg('engine.network', '1.1.0', 'engine'), addPkg('piping', '2.4.0', 'addon'), addPkg('fire', '2.0.0', 'addon', [{ id: 'piping', range: '^2.0' }, { id: 'engine.network', range: '^1.0' }])];
  items = base();
  const { pk, en } = mk2();
  const au = new A.AddonsAccount({ app: 'bimcraft', edition: 'web', fetch: fetchF, trust, packages: pk, engines: en });
  await au.sync(); ok((await au.ensure('fire')).ok, 'AL.13: the set is installed');
  // new versions of two add-ons; the second one's bytes are wrong
  items = base();
  items.find((i) => i.id === 'piping').package = addPkg('piping', '2.5.0', 'addon').package;
  items.find((i) => i.id === 'fire').package = addPkg('fire', '2.1.0', 'addon', [{ id: 'piping', range: '^2.0' }, { id: 'engine.network', range: '^1.0' }]).package;
  await au.sync(); tamper = '/addons/package/fire/2.1.0';
  let ar = await au.applyUpdates(['piping', 'fire']);
  ok(!ar.ok && ar.id === 'fire' && ar.reason === 'hash' && ar.done.length === 0, 'AL.13: one bad file in the set refuses the whole update', JSON.stringify(ar));
  ok((await pk.get('piping')).manifest.version === '2.4.0' && (await pk.get('fire')).manifest.version === '2.0.0', 'AL.13: and nothing was changed (piping is still 2.4.0)');
  tamper = null;
  ar = await au.applyUpdates(['piping', 'fire']);
  ok(ar.ok && (await pk.get('piping')).manifest.version === '2.5.0' && (await pk.get('fire')).manifest.version === '2.1.0', 'AL.13: the whole set moves together');
  const rb2 = await au.rollBack(['piping', 'fire']); ok(rb2.ok && (await pk.get('fire')).manifest.version === '2.0.0', 'AL.13: roll back returns the whole set');
  // a write that fails halfway puts the stores back
  items = base(); items.find((i) => i.id === 'piping').package = addPkg('piping', '2.6.0', 'addon').package; items.find((i) => i.id === 'fire').package = addPkg('fire', '2.2.0', 'addon', [{ id: 'piping', range: '^2.0' }, { id: 'engine.network', range: '^1.0' }]).package;
  await au.sync();
  const real = pk.put; let puts = 0; pk.put = async (x) => { if (++puts === 2) throw new Error('quota'); return real(x); };
  ar = await au.applyUpdates(['piping', 'fire']); pk.put = real;
  ok(!ar.ok && ar.reason === 'write' && (await pk.get('piping')).manifest.version === '2.5.0' || (await pk.get('piping')).manifest.version === '2.4.0', 'AL.13: a write failing halfway restores what it had changed', JSON.stringify(ar));
  ok(!(await au.ensureMany(['nope'])).ok, 'AL.13: an unknown id refuses');

  // the tab signs in through /library/connect (same origin, this app, a real-looking token)
  const asked = []; items = base();
  const fetchH = async (u, o) => { asked.push([String(u), o && o.headers && o.headers.Authorization]); return fetchF(u, o); };
  const store = new Map(), sess = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) };
  const listeners = new Set(); const opened = [];
  const win = { location: { origin: 'https://getcadcraft.com' }, addEventListener: (_, f) => listeners.add(f), removeEventListener: (_, f) => listeners.delete(f), open: (u) => { opened.push(u); return {}; } };
  const sa = new A.AddonsAccount({ app: 'bimcraft', edition: 'web', fetch: fetchH, trust, packages: mem(), engines: mem(), session: sess, base: 'https://getcadcraft.com' });
  ok(!sa.signedIn(), 'AL.13: a tab with no token is signed out');
  const done = sa.connect(win);
  ok(opened.length === 1 && opened[0] === 'https://getcadcraft.com/library/connect?app=bimcraft', 'AL.13: Sign in opens /library/connect for this app', opened[0]);
  const tok = 'ccu_' + 'a'.repeat(40);
  for (const f of listeners) f({ origin: 'https://evil.example', data: { type: 'cadcraft-library-token', app: 'bimcraft', token: tok } });
  for (const f of listeners) f({ origin: 'https://getcadcraft.com', data: { type: 'cadcraft-library-token', app: 'cadcraft', token: tok } });
  for (const f of listeners) f({ origin: 'https://getcadcraft.com', data: { type: 'cadcraft-library-token', app: 'bimcraft', token: 'not-a-token' } });
  ok(!sa.signedIn(), 'AL.13: a message from another origin, for another app or with a malformed token is ignored');
  for (const f of listeners) f({ origin: 'https://getcadcraft.com', data: { type: 'cadcraft-library-token', app: 'bimcraft', token: tok } });
  const cr = await done;
  ok(cr.ok && sa.signedIn() && store.get('cc-addons-account:bimcraft:token') === tok && listeners.size === 0, 'AL.13: the token is kept for the tab, the listener is gone', JSON.stringify(cr));
  ok(asked.some(([u, a]) => /account\/addons/.test(u) && a === 'Bearer ' + tok), 'AL.13: and the sync that follows carries it as a Bearer token');
  const again = new A.AddonsAccount({ app: 'bimcraft', edition: 'web', fetch: fetchH, trust, session: sess });
  ok(again.signedIn(), 'AL.13: a reload of the tab finds the token again');
  const late = new A.AddonsAccount({ app: 'bimcraft', edition: 'web', fetch: fetchH, trust }); const pkgs = mem();
  late.attach({ packages: pkgs, trust: null, session: sess });
  ok(late.packages === pkgs && late.signedIn() && late.trust === trust, 'AL.13: an account made early takes the add-on host\'s store, trust check and the tab\'s token');
  ok(!(await new A.AddonsAccount({ app: 'x', fetch: null }).connect(null)).ok, 'AL.13: no window, no sign-in');

// AL.6 (stamp, note, add for a file) + AL.11 (pin, channel, automatic updates)
let a6, d1;
{
  const sent = [];
  const rec = (u, o) => { if (o && o.method === 'POST') { sent.push(JSON.parse(o.body)); return { ok: true, status: 200, json: async () => ({ data: { added: [] } }) }; } return fetchF(u, o); };
  items = base(); items.find((i) => i.id === 'piping').package = addPkg('piping', '2.5.0', 'addon').package;
  a6 = new A.AddonsAccount({ app: 'cadcraft', edition: 'web', fetch: rec, token: 'ccu_' + 'a'.repeat(24), trust, packages: mem(), engines: mem() });
  await a6.sync();
  const known = a6.items.find((i) => i.package && i.package.version);
  d1 = { entities: [{ xd: { [known.id]: { kind: '', v: 1, data: {} } } }], addons: { stale: '9' } };
  A.stampFile(d1, a6.items);
  ok(d1.addons[known.id] === known.package.version && d1.addons.stale === '9', 'AL.6: stamp records the add-ons whose data the file carries, with the listed version');
  const d2 = { entities: [{ id: 1 }] }; A.stampFile(d2, a6.items); ok(!('addons' in d2), 'AL.6: a file that uses none stays as it was');
  const d3 = { entities: [{ xd: { '../bad': { kind: '', v: 1, data: 1 } } }] }; A.stampFile(d3, a6.items); ok(!d3.addons || !d3.addons['../bad'], 'AL.6: a bad id is not recorded');
  let n = a6.noteFile(d1, []); ok(n.missing.some((m) => m.id === known.id && m.listed) && n.missing.some((m) => m.id === 'stale' && !m.listed), 'AL.6: the offer separates listed from not-on-the-list');
  ok(/This file uses .*stale 9/.test(n.text) && /nothing is lost/.test(n.text), 'AL.6: the offer says what and that nothing is lost');
  ok(a6.noteFile(d1, [known.id, 'stale']).missing.length === 0 && a6.noteFile({}, []).text === '', 'AL.6: nothing missing = no offer');
  const keep = JSON.stringify(d1.entities); a6.noteFile(d1, []); ok(JSON.stringify(d1.entities) === keep, 'AL.6: pass-through, the data is never touched');
  const r6 = await a6.addForFile([{ id: 'stale', version: '9', listed: false }]);
  ok(sent.some((b) => b.action === 'add' && b.id === 'stale') && !r6.ok && r6.failed[0].id === 'stale', 'AL.6: Add asks the account and reports what could not come');
  sent.length = 0;
  await a6.pin('piping', '2.4.0'); await a6.pin('piping', null); await a6.setChannel('piping', 'lab'); await a6.setChannel('piping', 'x');
  ok(sent[0].action === 'pin' && sent[0].version === '2.4.0' && sent[1].action === 'pin' && !('version' in sent[1]) && sent[2].channel === 'lab' && sent[3].channel === 'stable', 'AL.11: pin, unpin, channel go to the account (unknown channel = stable)');
  const noTok = new A.AddonsAccount({ app: 'cadcraft', fetch: (u, o) => ({ ok: false, status: 401, text: async () => '', json: async () => ({}) }), trust, packages: mem(), engines: mem() });
  ok((await noTok.pin('piping', '1.0.0')).signedOut === true, 'AL.11: a pin signed out says so');
}

  // the Settings screen, on a stand-in DOM
  class N { constructor(tag, d) { this.tagName = tag.toUpperCase(); this.ownerDocument = d; this.children = []; this._t = ''; this.className = ''; this.h = {}; this.attrs = {}; }
    set textContent(v) { this._t = String(v); this.children = []; } get textContent() { return this._t + this.children.map((c) => c.textContent).join(''); }
    appendChild(c) { this.children.push(c); return c; } addEventListener(e, f) { (this.h[e] ||= []).push(f); } setAttribute(k, v) { this.attrs[k] = v; }
    async click() { for (const f of this.h.click || []) await f(); } all() { return this.children.flatMap((c) => (c.all ? [c, ...c.all()] : [c])); } }
  const D = { createElement: (t) => new N(t, D), createTextNode: (x) => { const n = new N('#text', D); n._t = x; return n; } };
  const root = new N('fieldset', D);
  { const el = new N('div', D); el.hidden = true;   // AL.6 banner
    const nn = A.renderFileOffer(el, a6, d1, { have: [] }); ok(!el.hidden && /This file uses/.test(el.textContent) && nn.missing.length === 2, 'AL.6: the banner shows');
    await el.all().find((c) => c.tagName === 'BUTTON' && c._t === 'Not now').click(); ok(el.hidden, 'AL.6: Not now hides it');
    A.renderFileOffer(el, a6, {}, {}); ok(el.hidden, 'AL.6: no banner for a file that needs nothing'); }
  items = base(); items.find((i) => i.id === 'piping').package = addPkg('piping', '2.5.0', 'addon').package;
  items.find((i) => i.id === 'fire').package = addPkg('fire', '2.1.0', 'addon', [{ id: 'piping', range: '^2.0' }, { id: 'engine.network', range: '^1.0' }]).package;
  const ui = new A.AddonsAccount({ app: 'bimcraft', edition: 'web', fetch: (u, o) => (o && o.method === 'POST' ? { ok: false, status: 422, json: async () => ({ data: { dependents: ['fire'] } }) } : fetchF(u, o)), trust, packages: mem(), engines: mem() });
  await ui.sync();
  // the cache holds the old versions
  items = base(); await ui.sync(); await ui.ensure('fire');
  items = base(); items.find((i) => i.id === 'piping').package = addPkg('piping', '2.5.0', 'addon').package;
  items.find((i) => i.id === 'fire').package = addPkg('fire', '2.1.0', 'addon', [{ id: 'piping', range: '^2.0' }, { id: 'engine.network', range: '^1.0' }]).package;
  await ui.sync();
  A.renderYourAddons(root, ui, { win: null });
  const btns = () => root.all().filter((n) => n.tagName === 'BUTTON');
  const byText = (re) => btns().find((b) => re.test(b.textContent));
  ok(root.children[0].tagName === 'LEGEND' && /Your add-ons/.test(root.children[0].textContent), 'AL.13: the screen has its title');
  ok(/Sign in/.test(root.textContent), 'AL.13: a signed-out tab is offered Sign in');
  ok(root.textContent.includes('fire') && root.textContent.includes('piping') && root.textContent.includes('engine.network'), 'AL.13: the whole list is shown, engines too');
  await byText(/Check for updates/).click();
  ok(/piping: 2\.4\.0 to 2\.5\.0/.test(root.textContent) && /fire: 2\.0\.0 to 2\.1\.0/.test(root.textContent), 'AL.13: the update check lists the whole set', root.textContent.slice(0, 200));
  tamper = '/addons/package/fire/2.1.0';
  await byText(/Update all together \(2\)/).click();
  ok(/Nothing was changed: fire failed \(a file did not match its checksum\)/.test(root.textContent), 'AL.13: a failed update says nothing changed and why');
  tamper = null;
  await byText(/Update all together \(2\)/).click();
  ok(/Updated 2 together|Everything is up to date/.test(root.textContent), 'AL.13: the update goes through together', root.textContent.slice(-160));
  await byText(/Remove/).click();   // piping is the first row with a Remove? the first row is engine.network: needed by others
  ok(/is used by/.test(root.textContent), 'AL.13: Remove names what still needs an item');
}

// AL.7 (al_PART_4): sign-in without a popup (Studio, portable, SuperCad Studio) through the site's device flow
{
  const seq = [{ s: 400, j: { code: 'authorization_pending' } }, { s: 400, j: { code: 'slow_down' } }, { s: 200, j: { data: { access_token: 'ccu_' + 'a'.repeat(40), token_type: 'Bearer' } } }];
  const calls = []; let shown = null; let clock = 0;
  const f = async (url, o) => {
    calls.push(url);
    if (url.endsWith('/api/v1/device/code')) return { status: 200, json: async () => ({ data: { device_code: 'dc', user_code: 'ABCD-EFGH', verification_uri_complete: 'https://x/device?code=ABCD-EFGH', interval: 1, expires_in: 600 } }) };
    if (url.endsWith('/api/v1/device/token')) { const n = seq.shift(); return { status: n.s, json: async () => (n.s === 200 ? { data: n.j.data } : { code: n.j.code }) }; }
    if (url.includes('/api/v1/account/addons')) return { status: 200, ok: true, json: async () => ({ data: { items: [] } }) };
    return { status: 404, json: async () => ({}) };
  };
  const d = new A.AddonsAccount({ app: 'cadcraft', edition: 'desktop', base: 'https://x', fetch: f, trust, packages: mem(), engines: mem(), now: () => clock });
  const r = await d.deviceSignIn({ show: (x) => { shown = x; }, wait: async (ms) => { clock += ms; } });
  ok(r.ok && d.signedIn(), 'AL.7: device sign-in keeps the token and syncs', JSON.stringify(r));
  ok(shown && shown.code === 'ABCD-EFGH' && /device\?code=/.test(shown.url), 'AL.7: the person is told where to approve');
  ok(calls.filter((u) => u.endsWith('/token')).length === 3 && clock >= 1000 + 1000 + 6000, 'AL.7: pending is polled again, slow_down slows the polling');
  const denied = new A.AddonsAccount({ app: 'cadcraft', base: 'https://x', trust, packages: mem(), engines: mem(), now: () => 0,
    fetch: async (u) => (u.endsWith('/code') ? { status: 200, json: async () => ({ data: { device_code: 'z', user_code: 'Q', interval: 1, expires_in: 60 } }) } : { status: 400, json: async () => ({ code: 'access_denied' }) }) });
  const rd = await denied.deviceSignIn({ wait: async () => {} });
  ok(!rd.ok && rd.reason === 'denied' && !denied.signedIn(), 'AL.7: a refusal ends it with no token');
}

// AL.5 (al-loader_PART_5): the loader's engineResolver — newest cached engine that satisfies the range; none where code may not be downloaded
{
  const eng = mem();
  await eng.put({ id: 'engine.process@1.1.0', manifest: { version: '1.1.0' }, files: { 'a.js': 'x' } });
  await eng.put({ id: 'engine.process@1.3.0', manifest: { version: '1.3.0' }, files: { 'a.js': 'y' } });
  await eng.put({ id: 'engine.process@2.0.0', manifest: { version: '2.0.0' }, files: { 'a.js': 'z' } });
  const web = new A.AddonsAccount({ app: 'cadcraft', edition: 'web', trust, packages: mem(), engines: eng });
  const r = await web.engineResolver('process', '^1.0');
  ok(r && r.version === '1.3.0' && r.files['a.js'] === 'y', 'AL.5: the newest engine that satisfies ^1.0 (not 2.0.0)');
  ok((await web.engineResolver('process', '^3.0')) === null && (await web.engineResolver('mep', '*')) === null, 'AL.5: no match → null (the app’s own copy is used)');
  const apple = new A.AddonsAccount({ app: 'cadcraft', edition: 'apple_store', trust, packages: mem(), engines: eng });
  ok((await apple.engineResolver('process', '*')) === null, 'AL.9: the Apple build never hands out a downloaded engine (code is bundled, not downloaded)');
  ok(A.deliveryFor({ id: 'pid', class: 'code', firstParty: true }, 'apple_store', ['pid']).how === 'bundled' && !A.deliveryFor({ id: 'pid', class: 'code', firstParty: true }, 'apple_store', []).ok, 'AL.9: Apple runs a first-party add-on only when it is in the binary');
}

console.log(`account-client: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
