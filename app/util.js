/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words for people here. */
/**
 * util.js — text, ids and downloads the apps each typed again (0.11 PERF.74; docs/0.9-sessions/perf-wave3/code-quality.md Q8: escapeHtml 198
 * implementations, csv cell 431, uid 188, download 163 and none of them in the shell). Canonical copy here; each app's dev/ carries a
 * byte-identical copy (node tools/shell/sync.mjs) and imports it relatively ("./util.js"), so a build stays self-contained.
 *
 * Each function is the text of the copies it replaced (tools/perf/util-copies.mjs replaces only a copy whose syntax tree is one of the
 * accepted forms; tools/perf/test-util-copies.mjs runs every replaced old text against the function here):
 *   esc(v)          HTML text and attributes: & < > " ' (' as &#39;); null and undefined are '' (the shell's own esc in app-problems.js and calc.js)
 *   escXml(v)       XML / SVG / older HTML writers: & < > " (no apostrophe); String(v), so null is "null" as those copies had it
 *   escXmlClean(v)  escXml after dropping the C0 control characters XML 1.0 refuses (tab, LF and CR kept)
 *   csvCell(v)      one RFC 4180 cell; a cell starting with = + - @ tab or CR gets a leading ' so a spreadsheet never runs it (problems.js)
 *   uid(prefix)     a random id: crypto.randomUUID when there is one (host.js newId), with an optional prefix
 *   download(data, name, type)  hand the browser a file to save (Blob, or text / bytes made into one); nothing is uploaded
 */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const escXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const escXmlClean = (s) => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

export function uid(prefix = '') {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return prefix + c.randomUUID();
  return prefix + 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function download(data, name, type) {
  const blob = typeof Blob !== 'undefined' && data instanceof Blob ? data : new Blob([data], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}
