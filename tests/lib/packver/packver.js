// SPDX-License-Identifier: Apache-2.0
/**
 * packver.js: the version and changelog rule for packs and documents (BK.153 versioning, BK.154 changelog; bk-r3-library-10).
 * Host-free ES module, no DOM, no imports. The PHP twin is core/classes/PackVersioning.php; both give the same errors word for word
 * (bin/test-packver.php runs both on the same documents). Rule: MAJOR.MINOR.PATCH; 0.x = for discussion; 1.0.0 and up only when the owner
 * adopts (`adopted {by: "owner", date}`); `changelog` = [{version, date, added[], changed[], fixed[]}] newest first, first = the current version.
 *   validatePackVersion(doc, path = 'pack') -> { ok, errors[] }     isVersion · parseVersion · compareVersions · versionStatus · versionLabel
 *   changelogNewestFirst(list) · parseChangelogMarkdown(md) -> { changelog, errors } · changelogToMarkdown(list)
 */
export const CHANGE_KINDS = { added: 'Added', changed: 'Changed', fixed: 'Fixed' };
export const MAX_ENTRIES = 200, MAX_LINES = 100, MAX_TEXT = 500;
const VERSION_RE = /^(0|[1-9][0-9]{0,5})\.(0|[1-9][0-9]{0,5})\.(0|[1-9][0-9]{0,5})$/;
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export const isVersion = (v) => typeof v === 'string' && VERSION_RE.test(v);
export function parseVersion(v) { const m = typeof v === 'string' ? VERSION_RE.exec(v) : null; return m ? [+m[1], +m[2], +m[3]] : null; }
export function compareVersions(a, b) {
  const x = parseVersion(a) || [0, 0, 0], y = parseVersion(b) || [0, 0, 0];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
}
export const versionStatus = (v) => ((parseVersion(v) || [0])[0] >= 1 ? 'adopted' : 'discussion');
export function versionLabel(v, adopted = false) {
  const p = parseVersion(v);
  if (!p) return v;
  return v + ', ' + (p[0] >= 1 ? (adopted ? 'adopted by the owner' : 'adopted') : 'for discussion');
}
export const changelogNewestFirst = (list) => (Array.isArray(list) ? list : []).filter((e) => isObj(e) && isVersion(e.version)).sort((a, b) => compareVersions(b.version, a.version));

function validDate(d) {
  const m = typeof d === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(d) : null;
  if (!m) return false;
  const y = +m[1], mo = +m[2], da = +m[3], t = new Date(Date.UTC(y, mo - 1, da));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === da;
}
const strlen = (s) => [...s].length;

export function validatePackVersion(doc, path = 'pack') {
  const errors = [];
  const err = (p, m) => { if (errors.length < 50) errors.push(p + ': ' + m); };
  if (!isObj(doc)) return { ok: false, errors: [path + ': is not an object with a version and a changelog'] };
  const has = (k) => Object.prototype.hasOwnProperty.call(doc, k);
  const version = doc.version;
  if (!has('version')) err(path + '.version', 'is required: write it as MAJOR.MINOR.PATCH, for example 0.1.0');
  else if (!isVersion(version)) err(path + '.version', 'must be MAJOR.MINOR.PATCH, three whole numbers like 0.3.1 (no "v", no words after it)');
  const p = isVersion(version) ? parseVersion(version) : null;

  if (has('adopted')) {
    const a = doc.adopted;
    if (!isObj(a)) err(path + '.adopted', 'must be {"by": "owner", "date": "YYYY-MM-DD"}');
    else {
      for (const k of Object.keys(a)) if (!['by', 'date'].includes(k)) err(path + '.adopted.' + k, 'is not a field of an adoption (by, date)');
      if (a.by !== 'owner') err(path + '.adopted.by', 'must be "owner": only the owner adopts a version');
      if (!validDate(a.date)) err(path + '.adopted.date', 'must be a date written YYYY-MM-DD');
    }
  }
  if (p) {
    if (p[0] >= 1 && !has('adopted')) err(path + '.adopted', 'is required from version 1.0.0 on: 1.0.0 is only for what the owner has adopted (adopted {"by": "owner", "date": "YYYY-MM-DD"}); until then stay on 0.x, for discussion');
    if (p[0] === 0 && has('adopted')) err(path + '.adopted', 'must be left out on a 0.x version: 0.x means for discussion, not adopted');
  }

  if (!has('changelog')) err(path + '.changelog', 'is required: every version records what was added, changed and fixed, newest first');
  else if (!Array.isArray(doc.changelog)) err(path + '.changelog', 'must be a list of versions, newest first');
  else if (!doc.changelog.length) err(path + '.changelog', 'is empty: record what the current version added, changed or fixed');
  else {
    const log = doc.changelog;
    if (log.length > MAX_ENTRIES) err(path + '.changelog', 'has more than ' + MAX_ENTRIES + ' versions');
    let prev = null, prevDate = null;
    log.slice(0, MAX_ENTRIES).forEach((e, i) => {
      const q = path + '.changelog[' + i + ']';
      if (!isObj(e)) { err(q, 'must be {"version", "date", "added", "changed", "fixed"}'); prev = null; return; }
      for (const k of Object.keys(e)) if (!['version', 'date', 'added', 'changed', 'fixed'].includes(k)) err(q + '.' + k, 'is not a field of a changelog entry (version, date, added, changed, fixed)');
      const ev = e.version;
      if (!isVersion(ev)) { err(q + '.version', 'must be MAJOR.MINOR.PATCH, like 0.3.1'); prev = null; }
      else {
        if (prev !== null && compareVersions(ev, prev) === 0) err(q + '.version', 'is listed twice (' + ev + ')');
        else if (prev !== null && compareVersions(ev, prev) > 0) err(q + '.version', ev + ' is newer than the entry above it (' + prev + '): write the newest version first');
        prev = ev;
      }
      if (!validDate(e.date)) err(q + '.date', 'must be a date written YYYY-MM-DD');
      else {
        if (prevDate !== null && e.date > prevDate) err(q + '.date', 'is later than the entry above it: newest first');
        prevDate = e.date;
      }
      let said = 0;
      for (const k of Object.keys(CHANGE_KINDS)) {
        if (!Object.prototype.hasOwnProperty.call(e, k)) continue;
        if (!Array.isArray(e[k])) { err(q + '.' + k, 'must be a list of short sentences'); continue; }
        if (e[k].length > MAX_LINES) err(q + '.' + k, 'has more than ' + MAX_LINES + ' lines');
        e[k].slice(0, MAX_LINES).forEach((line, j) => {
          if (typeof line !== 'string' || line.trim() === '') err(q + '.' + k + '[' + j + ']', 'must be a sentence');
          else if (strlen(line) > MAX_TEXT) err(q + '.' + k + '[' + j + ']', 'is longer than ' + MAX_TEXT + ' characters');
          else said++;
        });
      }
      if (said === 0) err(q, 'says nothing: list what this version added, changed or fixed');
    });
    if (isVersion(version) && isObj(log[0]) && isVersion(log[0].version) && log[0].version !== version)
      err(path + '.changelog[0].version', 'must be the current version (' + version + '): the newest entry comes first');
  }
  return { ok: errors.length === 0, errors };
}

export function parseChangelogMarkdown(md) {
  const log = [], errors = [];
  let cur = null, kind = null;
  String(md).split(/\r\n|\n|\r/).forEach((line, n) => {
    let m;
    if ((m = /^##\s+\[?v?([^\]\s]+)\]?\s*(?:[-–—]\s*(\S+))?\s*$/u.exec(line))) {
      if (cur) log.push(cur);
      cur = { version: m[1], date: m[2] || '' }; kind = null;
      if (!isVersion(m[1])) errors.push('line ' + (n + 1) + ': "' + m[1] + '" is not MAJOR.MINOR.PATCH');
    } else if ((m = /^###\s+(Added|Changed|Fixed)\s*$/i.exec(line))) {
      kind = m[1].toLowerCase();
      if (cur === null) errors.push('line ' + (n + 1) + ': "### ' + m[1] + '" comes before any "## version - date" heading');
    } else if (cur !== null && kind !== null && (m = /^\s*[-*]\s+(.+?)\s*$/.exec(line))) {
      (cur[kind] ||= []).push(m[1]);
    }
  });
  if (cur) log.push(cur);
  if (!log.length) errors.push('no "## 1.2.0 - 2026-11-11" headings found');
  return { changelog: log, errors };
}

export function changelogToMarkdown(list) {
  let out = '# Changelog\n';
  for (const e of changelogNewestFirst(list)) {
    out += '\n## ' + e.version + ' - ' + (e.date || '') + '\n';
    for (const [k, label] of Object.entries(CHANGE_KINDS)) if (e[k] && e[k].length) { out += '\n### ' + label + '\n'; for (const l of e[k]) out += '- ' + l + '\n'; }
  }
  return out;
}
