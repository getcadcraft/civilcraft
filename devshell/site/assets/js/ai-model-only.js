/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol words; what a person reads about it is worded by ai-activity.js sentWords() and the panel's shell.activity.* strings. */
/**
 * ai-model-only.js — model data only (BK.145, bk-r3-assistant-10): the one filter on everything an app hands to an assistant. DOM-free, no
 * imports; tested in Node (bin/test-model-only.mjs).
 *
 * What an assistant gets is what is in the model: elements, geometry, quantities, layers, properties, sheet and view names, numbers. What it
 * never gets: who a person is (author, owner, "drawn by", "last saved by", user names), how to reach them (email, phone, postal address),
 * the account and the licence (account, company, organization, licence keys, tokens, passwords), the computer (host name, addresses), and
 * the user's name inside a folder path. The filter takes those values out and says which fields it held back; it never guesses a
 * replacement and never changes anything else.
 *
 *   scrub(value)            → { value: a deep copy without the held values, held: [{ path, why }] }
 *   modelOnly(value, info)  → { value, sent }     the dispatcher's `outgoing` hook (tools/mcp/core.mjs): `sent` is the short record the
 *                             activity log keeps (ai-activity.js): size, the field names, and what was held back. A result is never kept.
 *   createModelOnly()       → { outgoing, incoming, known() }   the pair a dispatcher takes. A path the assistant was given with "~" in place of
 *                             the user's folder must still work when it hands the path back to a tool (files_list → drawing_open), so this
 *                             instance remembers which name each "~" stood for and `incoming(args)` puts it back before the tool runs. The name
 *                             itself never leaves; a second user's folder under the same root becomes "~2", and so on.
 *   contextOnly(ctx)        → what the Ask box sends with a question: the same filter, and a file is named without its folder
 *   WHY                     the reasons, in plain words
 *
 * Rules, in order:
 *   1. a field whose NAME says person / contact / account / licence / computer is removed with whatever it holds (`author`, `Owner`,
 *      `last_saved_by`, `OwnerHistory`, `email`, `licenseKey` …); names are compared without case, spaces, - and _
 *   2. a row that names such a property and carries its value ({ name: 'Author', value: … }, the way property lists come back) loses the value
 *   3. in any text that stays: an email address becomes "[email held back]", and the user's folder in a path becomes "~"
 * `license` on its own stays when it is a licence NAME such as Apache-2.0 (a library item's terms are model data); anything else under it goes.
 */

export const WHY = Object.freeze({
  person: "a person's name",
  contact: 'contact details',
  account: 'account or company details',
  licence: 'a licence, key or password',
  computer: "the computer's identity",
  email: 'an email address',
  folder: "a folder with a user's name",
  deep: 'nested too deep to check',
});

const norm = (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
const SETS = {
  person: ['author', 'authors', 'authorname', 'owner', 'ownername', 'owners', 'creator', 'createdby', 'modifiedby', 'lastmodifiedby', 'lastsavedby', 'savedby', 'editedby', 'changedby',
    'checkedby', 'approvedby', 'drawnby', 'designedby', 'signedby', 'reviewedby', 'issuedby', 'user', 'username', 'userid', 'users', 'login', 'loginname', 'person', 'persons', 'theperson',
    'givenname', 'familyname', 'firstname', 'lastname', 'middlenames', 'fullname', 'displayname', 'nickname', 'owninguser', 'lastmodifyinguser', 'ownerhistory', 'personandorganization',
    'reviewer', 'requester', 'contactname', 'contactperson', 'clientname'],
  contact: ['email', 'emails', 'emailaddress', 'mail', 'mailaddress', 'phone', 'phonenumber', 'telephone', 'telephonenumbers', 'mobile', 'fax', 'facsimilenumbers', 'postaladdress',
    'streetaddress', 'addresslines', 'homeaddress', 'electronicmailaddresses', 'messagingids', 'wwwhomepageurl',
    'adminlabel', 'adminvalue', 'adminnote', 'adminfileref', 'idnumber', 'nationalid', 'taxnumber', 'titledeed', 'titledeeds', 'signedform', 'signedforms', 'clientcontact', 'clientcontacts'],
  account: ['account', 'accountid', 'accountname', 'accountemail', 'company', 'companyname', 'organization', 'organisation', 'organizationname', 'theorganization', 'owningorganization',
    'teamid', 'teamname', 'customer', 'customerid', 'customername', 'subscription', 'subscriptionid', 'billing', 'billingemail', 'invoice', 'seatid', 'memberof'],
  licence: ['licencekey', 'licensekey', 'licenceid', 'licenseid', 'licenceno', 'licenseno', 'licencenumber', 'licensenumber', 'licencetoken', 'licensetoken', 'licensee', 'licencee',
    'entitlement', 'entitlements', 'activation', 'activationcode', 'token', 'tokens', 'accesstoken', 'refreshtoken', 'apikey', 'apitoken', 'password', 'passwd', 'secret', 'secrets',
    'credential', 'credentials', 'authorization', 'cookie', 'cookies', 'sessionid'],
  computer: ['hostname', 'computername', 'machinename', 'machineid', 'deviceid', 'devicename', 'ipaddress', 'ip', 'macaddress', 'useragent'],
};
const KEY_WHY = new Map();
for (const [why, list] of Object.entries(SETS)) for (const k of list) KEY_WHY.set(k, why);
const LICENCE_NAME = /^(apache-2\.0|mit|isc|unlicense|0bsd|bsd-[0-9]-clause|cc0-1\.0|cc-by(-(sa|nc|nd))*-[0-9.]+|ofl-1\.1|mpl-2\.0|public domain|proprietary)$/i;
const NAME_FIELDS = ['name', 'Name', 'key', 'label', 'property', 'field', 'title'];
const VALUE_FIELDS = ['value', 'Value', 'values', 'text', 'NominalValue', 'nominalValue', 'val', 'display'];
const MAX_DEPTH = 24, MAX_HELD = 50;

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
const UNIX_HOME = /(\/(?:home|Users|users)\/)([^/\s"'<>|]+)/g;
const WIN_HOME = /([A-Za-z]:[\\/]+(?:Users|Documents and Settings)[\\/]+)([^\\/"'<>|\r\n]+)/g;   // a Windows user folder may hold spaces ("Ana Lopez"): everything up to the next separator

/** Why a field of this name is held, or null. `value` decides the one name that can be model data (a licence name). */
export function heldKey(key, value) {
  const k = norm(key);
  if (k === 'licence' || k === 'license') return typeof value === 'string' && LICENCE_NAME.test(value.trim()) ? null : 'licence';
  return KEY_WHY.get(k) || null;
}

/** A text with email addresses and user folders taken out. → { text, why: [] }. alias(root, name) → what stands for the name ("~" by default). */
export function scrubText(s, alias = null) {
  const why = [];
  let text = String(s);
  if (text.includes('@')) text = text.replace(EMAIL, () => { why.push('email'); return '[email held back]'; });
  if (/[\\/]/.test(text)) {
    const swap = (m, a, name) => { if (/^~\d*$/.test(name)) return m; why.push('folder'); return a + (alias ? alias(a, name) : '~'); };
    text = text.replace(UNIX_HOME, swap).replace(WIN_HOME, swap);
  }
  return { text, why };
}

export function scrub(input, { alias = null } = {}) {
  const held = [];
  let more = 0;
  const hold = (path, why) => { if (held.length < MAX_HELD) held.push({ path: path.slice(0, 120), why }); else more++; };
  const walk = (v, path, depth) => {
    if (v === null || v === undefined || typeof v === 'number' || typeof v === 'boolean') return v;
    if (typeof v === 'string') { const r = scrubText(v, alias); for (const w of new Set(r.why)) hold(path || '(text)', w); return r.text; }
    if (typeof v !== 'object') return undefined;   // functions, symbols: never sent
    if (depth >= MAX_DEPTH) { hold(path, 'deep'); return undefined; }
    if (Array.isArray(v)) return v.map((x, i) => { const y = walk(x, path + '[' + i + ']', depth + 1); return y === undefined ? null : y; });
    const out = {};
    // rule 2: a property row that names a held field
    const nameField = NAME_FIELDS.find((f) => typeof v[f] === 'string');
    const rowWhy = nameField && VALUE_FIELDS.some((f) => f in v) ? heldKey(v[nameField]) : null;
    for (const [k, x] of Object.entries(v)) {
      const p = path ? path + '.' + k : k;
      const why = heldKey(k, x);
      if (why) { if (x !== null && x !== undefined && x !== '') hold(p, why); continue; }
      if (rowWhy && VALUE_FIELDS.includes(k)) { if (x !== null && x !== undefined && x !== '') hold(p + ' (' + v[nameField].slice(0, 40) + ')', rowWhy); continue; }
      const y = walk(x, p, depth + 1);
      if (y !== undefined) out[k] = y;
    }
    return out;
  };
  const value = walk(input, '', 0);
  return { value, held, heldCount: held.length + more };
}

const kindOf = (v) => (Array.isArray(v) ? 'list' : v === null ? 'empty' : typeof v === 'object' ? 'group' : typeof v === 'string' ? 'text' : typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'yes/no' : 'other');

/** The record of one answer: how big it was, which fields it had, what was held back. Never the values. */
export function sentRecord(value, held = [], heldCount = held.length) {
  let bytes = 0;
  try { bytes = typeof value === 'string' ? value.length : JSON.stringify(value ?? null).length; } catch { bytes = 0; }
  const fields = [];
  let more = 0;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) {
      if (fields.length >= 16) { more++; continue; }
      fields.push({ name: String(k).slice(0, 40), kind: kindOf(v), ...(Array.isArray(v) ? { n: v.length } : {}) });
    }
  } else fields.push({ name: '', kind: kindOf(value), ...(Array.isArray(value) ? { n: value.length } : {}) });
  return { bytes, fields, ...(more ? { more } : {}), held: held.slice(0, 20).map((h) => ({ path: h.path, why: h.why })), heldCount };
}

/** The dispatcher's hook: every tool result (and every error text) goes through here before it leaves the app. */
export function modelOnly(value) {
  const r = scrub(value);
  return { value: r.value, sent: sentRecord(r.value, r.held, r.heldCount) };
}

/**
 * The filter as a dispatcher takes it: `outgoing` for what leaves, `incoming` for the arguments that come back. Paths keep working although the
 * user's folder name never left: "~" (then "~2", "~3" …) stands for it on the way out and is put back on the way in.
 */
export function createModelOnly() {
  const byRoot = new Map();   // root as written ('/home/', 'C:\\Users\\') → [names in the order met]
  const alias = (root, name) => { const key = root.toLowerCase().replace(/\\/g, '/'); let names = byRoot.get(key); if (!names) byRoot.set(key, names = []); let i = names.indexOf(name); if (i < 0) { names.push(name); i = names.length - 1; } return i === 0 ? '~' : '~' + (i + 1); };
  const back = (text) => String(text).replace(/(\/(?:home|Users|users)\/|[A-Za-z]:[\\/]+(?:Users|Documents and Settings)[\\/]+)~(\d*)(?=$|[\\/])/g, (m, root, n) => {
    const names = byRoot.get(root.toLowerCase().replace(/\\/g, '/')); const name = names && names[(n ? +n : 1) - 1];
    return name ? root + name : m;
  });
  const restore = (v, depth = 0) => {
    if (typeof v === 'string') return v.includes('~') ? back(v) : v;
    if (!v || typeof v !== 'object' || depth > MAX_DEPTH) return v;
    if (Array.isArray(v)) return v.map((x) => restore(x, depth + 1));
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, restore(x, depth + 1)]));
  };
  return {
    outgoing(value) { const r = scrub(value, { alias }); return { value: r.value, sent: sentRecord(r.value, r.held, r.heldCount) }; },
    incoming(args) { return byRoot.size ? restore(args) : args; },
    text(s) { return scrubText(s, alias).text; },
    known: () => [...byRoot.values()].reduce((n, l) => n + l.length, 0),
  };
}

/** What goes with a question in the Ask box: the app's small description of what is open, filtered, the file named without its folder. */
export function contextOnly(ctx) {
  const c = ctx && typeof ctx === 'object' ? { ...ctx } : {};
  for (const k of ['file', 'document']) if (typeof c[k] === 'string') c[k] = c[k].split(/[\\/]/).pop();
  return scrub(c).value;
}
