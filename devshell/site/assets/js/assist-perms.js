/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol and developer messages. */
/**
 * assist-perms.js — what an assistant may do in an app, and in one project (0.8 round 2, ai-trust_PART_2, AC.12; docs/AI-CONNECT-SPEC.md § 3).
 * DOM-free, no imports; tested in Node (bin/test-suggest.mjs).
 *
 * The record kept per app (localStorage cadcraft.assistants.<app>, beside what host.js keeps):
 *   { enabled, groups: ['read','suggest',…], folders: [...],
 *     projects: { '<project key>': { groups: [...], folders: [...], note: '' } } }
 *
 * The app's level is the CEILING. A project entry can only narrow it: the effective groups are the intersection, the effective folders
 * those inside both lists. A project never grants more than the app. Edit implies Suggest implies Read (the spec's ladder), so asking for
 * "edit" in a project that allows only "suggest" gives suggest.
 *
 * A project is the document's stable key: the cc-doc id where the file has one, else a hash of its path relative to the granted folder, so
 * a renamed file keeps its rules and a copy does not inherit them (projectKey).
 */

export const LEVELS = Object.freeze(['read', 'suggest', 'edit', 'save', 'export']);
const LADDER = { edit: ['suggest', 'read'], suggest: ['read'] };

const levels = (v) => (Array.isArray(v) ? v : []).filter((x) => LEVELS.includes(x));
const stripSlash = (p) => String(p || '').replace(/\\/g, '/').replace(/\/+$/, '');
const folders = (v) => [...new Set((Array.isArray(v) ? v : []).map(stripSlash).filter(Boolean))].slice(0, 50);

/** Add what each level implies: ['edit'] → ['read','suggest','edit']. Save and export imply nothing (the spec keeps them independent). */
export function expand(groups) {
  const out = new Set(levels(groups));
  for (const g of [...out]) for (const i of LADDER[g] || []) out.add(i);
  return LEVELS.filter((x) => out.has(x));
}

/** The groups and folders the person gave the app, with the project's narrowing applied. */
export function effective(record, project = null) {
  const r = record && typeof record === 'object' ? record : {};
  if (!r.enabled) return { enabled: false, groups: [], folders: [], project: null, narrowed: false };
  const app = expand(r.groups);
  const p = project && r.projects && typeof r.projects === 'object' && Object.prototype.hasOwnProperty.call(r.projects, project) ? r.projects[project] : null;
  if (!p) return { enabled: true, groups: app, folders: folders(r.folders), project: project || null, narrowed: false };
  const pg = expand(p.groups);
  const groups = app.filter((g) => pg.includes(g));
  const af = folders(r.folders), pf = folders(p.folders);
  const inside = (f, roots) => roots.some((root) => f === root || f.startsWith(root + '/'));
  const fl = pf.length ? pf.filter((f) => inside(f, af)) : af;
  return { enabled: true, groups, folders: fl, project, narrowed: groups.length < app.length || fl.length !== af.length || fl.some((f, i) => f !== af[i]) };
}

/** True when `level` is allowed (Edit allows Suggest, Suggest allows Read — expand() already folded that in). */
export const allows = (eff, level) => !!(eff && eff.enabled && eff.groups.includes(level));

/** The mode an edit tool runs in: 'edit' (applied), 'suggest' (recorded as a change set) or null (not allowed). */
export const editMode = (eff) => (allows(eff, 'edit') ? 'edit' : allows(eff, 'suggest') ? 'suggest' : null);

/**
 * Set one project's rule (or clear it with null). Never widens: the groups and folders are cut to the app's own before they are kept, so a
 * later change to the app's ceiling can only narrow the project further, never reveal what it once held.
 */
export function setProject(record, project, rule) {
  const r = { enabled: !!(record && record.enabled), groups: levels(record && record.groups), folders: folders(record && record.folders), projects: { ...((record && record.projects) || {}) } };
  const key = String(project || '').slice(0, 120);
  if (!key) throw Object.assign(new Error('A project needs a key.'), { code: 'bad_project' });
  if (rule === null || rule === undefined) { delete r.projects[key]; return r; }
  const app = expand(r.groups);
  const g = expand(rule.groups).filter((x) => app.includes(x));
  const inside = (f) => !r.folders.length || r.folders.some((root) => f === root || f.startsWith(root + '/'));
  r.projects[key] = { groups: g, folders: folders(rule.folders).filter(inside), note: String(rule.note || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, 300) };
  if (Object.keys(r.projects).length > 200) throw Object.assign(new Error('Too many project rules.'), { code: 'too_many' });
  return r;
}

/** Keep only what a stored record may hold (the file is the person's, but an old version or a hand edit must not break the app). */
export function clean(record) {
  const r = record && typeof record === 'object' ? record : {};
  const projects = {};
  if (r.projects && typeof r.projects === 'object') {
    for (const [k, v] of Object.entries(r.projects).slice(0, 200)) {
      if (!k || k.length > 120 || !v || typeof v !== 'object') continue;
      projects[k] = { groups: levels(v.groups), folders: folders(v.folders), note: String(v.note || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, 300) };
    }
  }
  return { enabled: !!r.enabled, groups: levels(r.groups), folders: folders(r.folders), projects };
}

/** FNV-1a, 32 bit, hex: a short stable hash of a relative path (a key, not a secret). */
function hash(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }

/**
 * The stable key of the open document. `docId` is the cc-doc id when the file has one; else `path` relative to the first granted folder
 * that holds it (so the same drawing under a renamed parent folder keeps its key only if the granted folder is the same), else the file
 * name alone. Windows and POSIX separators give the same key, and case is folded on drive-style paths.
 */
export function projectKey(doc = {}, grantedFolders = []) {
  if (doc.docId) return 'doc:' + String(doc.docId).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 60);
  const p = stripSlash(doc.path);
  if (!p) return doc.name ? 'name:' + hash(String(doc.name)) : null;
  const drive = /^[A-Za-z]:\//.test(p);
  const norm = drive ? p.toLowerCase() : p;
  for (const f of folders(grantedFolders)) {
    const root = drive ? f.toLowerCase() : f;
    if (norm.startsWith(root + '/')) return 'path:' + hash(norm.slice(root.length + 1));
  }
  return 'path:' + hash(norm.split('/').pop());
}
