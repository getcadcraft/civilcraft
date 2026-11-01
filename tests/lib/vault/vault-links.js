/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — DOM-free library: its literals are file data and errors for developers; every word a person reads comes from the app (t()), e.g. bomCsv's labels. */
/**
 * vault-links.js — what a file uses and what uses it, BOMs, and the fields a title block reads (0.8 SU.1058 steps 4 and 6,
 * with LC.8's where-used and BOM asks; session `sx-vault`). DOM-free, import-free.
 *
 * A Link (kept on a file's record at check-in, `uses`):
 *   { kind: 'xref', ref (as the file names it), path (resolved against the file's folder; null when it points outside) }
 *   { kind: 'doc', ref, path }                              an IFC document reference (IfcDocumentReference location)
 *   { kind: 'part', number?, name, qty }                    a part of a PartCraft assembly (parts are embedded: matched by number)
 *
 *   indexLinks(path, bytes) → { uses: [Link], number? }    DXF xrefs (BLOCK with flag 4, group 1 = its path), IFC document
 *       references, PartCraft assemblies (parts with instance counts) and parts (their number). A DWG is binary: the app that
 *       read it hands its xrefs in (CadCraft: xrefs(doc) → linksFromXrefs).
 *   linksFromXrefs(path, list)  [{ name, path }] (xref.js xrefs(doc)) → [Link]
 *   resolveRef(fromPath, ref)   → the project-relative path, or null (absolute paths and ones that climb out of the folder)
 *   linkTarget(files, link)     → the FileRec a link points to, or null
 *   usesOf(files, id) → [{ link, file }]       whereUsed(files, id) → [{ file, link }]
 *   bom(files, id, { depth = 20 }) → rows [{ level, item ('1', '1.2'), id?, path?, name, number, rev, state, kind, qty, total,
 *       missing (a link to nothing in the vault), cycle }]   bomCsv(rows, { head, missing, cycle, state }) → CSV text (CRLF, quotes,
 *       formula guard, UTF-8 BOM; the app passes its translated column names, notes and state names)
 *   titleBlockValues(file, { stateLabel, date }) → { 'VAULT.REV', 'VAULT.STATE', 'VAULT.DATE', 'VAULT.APPROVER', 'VAULT.ID',
 *       with the aliases VAULT_REV, REV, REVISION, REV_NO, VAULT_STATE, VAULT_DATE, REV_DATE, REVDATE, VAULT_APPROVER, APPROVED_BY }
 *       — keys are what sheetset.js fieldTag() makes of an attribute tag, so fillTitleBlocks() fills them as they are
 *   revisionTable(file) → [{ rev, date, by, approver, note }]   the released revisions, oldest first (a revision block's rows)
 */

const dec = (b) => (typeof b === 'string' ? b : new TextDecoder().decode(b));
const same = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();
const baseName = (p) => String(p || '').replace(/\\/g, '/').split('/').pop();

export function resolveRef(fromPath, ref) {
  let r = String(ref || '').trim().replace(/\\/g, '/');
  if (!r || /^[A-Za-z]:/.test(r) || r.startsWith('/') || /^[a-z]+:\/\//i.test(r)) return null;
  const parts = String(fromPath || '').split('/').slice(0, -1);
  for (const p of r.split('/')) {
    if (p === '' || p === '.') continue;
    if (p === '..') { if (!parts.length) return null; parts.pop(); } else parts.push(p);
  }
  return parts.length ? parts.join('/') : null;
}

// ---------------------------------------------------------------------------- readers

/** DXF text → the xref paths (BLOCK entities in the BLOCKS section whose 70 flags have bit 4). */
export function dxfXrefs(text) {
  const lines = dec(text).split(/\r?\n/);
  const out = [];
  let inBlocks = false;
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const code = lines[i].trim(), val = lines[i + 1];
    if (code === '2' && i >= 2 && lines[i - 2].trim() === '0' && lines[i - 1].trim() === 'SECTION') inBlocks = val.trim() === 'BLOCKS';
    if (code === '0' && val.trim() === 'ENDSEC') inBlocks = false;
    if (!inBlocks || code !== '0' || val.trim() !== 'BLOCK') continue;
    let flags = 0, path = '', name = '';
    for (let j = i + 2; j + 1 < lines.length; j += 2) {
      const c = lines[j].trim(), v = lines[j + 1];
      if (c === '0') break;
      if (c === '70') flags = parseInt(v, 10) || 0;
      else if (c === '1') path = v.trim();
      else if (c === '2') name = v.trim();
    }
    if (flags & 4 && path) out.push({ name, path });
  }
  return out;
}

/** IFC (STEP text) → document reference locations. */
export function ifcDocRefs(text) {
  const s = dec(text);
  const out = [];
  const re = /IFCDOCUMENTREFERENCE\s*\(\s*(?:IFC[A-Z]+\s*\(\s*)?'((?:[^']|'')*)'/gi;
  let m;
  while ((m = re.exec(s))) out.push(m[1].replace(/''/g, "'"));
  return [...new Set(out)];
}

export function linksFromXrefs(path, list) {
  return (list || []).filter((x) => x && x.path).map((x) => ({ kind: 'xref', ref: String(x.path), path: resolveRef(path, x.path) }));
}

export function indexLinks(path, bytes) {
  const n = String(path).toLowerCase();
  if (n.endsWith('.dxf')) {
    const head = dec(bytes.slice(0, 22));
    if (head.startsWith('AutoCAD Binary DXF')) return { uses: [] };
    return { uses: linksFromXrefs(path, dxfXrefs(bytes)) };
  }
  if (n.endsWith('.ifc')) return { uses: ifcDocRefs(bytes).map((ref) => ({ kind: 'doc', ref, path: resolveRef(path, ref) })) };
  if (n.endsWith('.json')) {
    let j;
    try { j = JSON.parse(dec(bytes)); } catch { return { uses: [] }; }
    if (j && j.format === 'partcraft-assembly' && j.parts && typeof j.parts === 'object') {
      const count = new Map();
      for (const i of Array.isArray(j.instances) ? j.instances : []) if (i && typeof i.part === 'string') count.set(i.part, (count.get(i.part) || 0) + 1);
      const uses = Object.entries(j.parts).slice(0, 500).map(([pid, p]) => ({ kind: 'part', ...(p && p.number ? { number: String(p.number).slice(0, 60) } : {}),
        name: String((p && p.name) || pid).slice(0, 120), qty: count.get(pid) || 0 }));
      return { uses, ...(j.number ? { number: String(j.number).slice(0, 60) } : {}) };
    }
    const num = j && (j.number ?? j.properties?.number ?? j.props?.number);
    return { uses: [], ...(num ? { number: String(num).slice(0, 60) } : {}) };
  }
  return { uses: [] };
}

// ---------------------------------------------------------------------------- the graph

const list = (files) => (Array.isArray(files) ? files : Object.values(files || {}));

export function linkTarget(files, link) {
  const all = list(files);
  if (link.kind === 'part') return link.number ? all.find((f) => f.number && same(f.number, link.number) && f.kind !== 'assembly') || all.find((f) => f.number && same(f.number, link.number)) || null : null;
  if (link.path) { const hit = all.find((f) => same(f.path, link.path)); if (hit) return hit; }
  // an absolute path from another computer: the same file name, when only one file has it
  const b = baseName(link.ref);
  const byName = all.filter((f) => same(baseName(f.path), b));
  return byName.length === 1 ? byName[0] : null;
}

export function usesOf(files, id) {
  const f = list(files).find((x) => x.id === id);
  return f ? (f.uses || []).map((link) => ({ link, file: linkTarget(files, link) })) : [];
}

export function whereUsed(files, id) {
  const out = [];
  for (const f of list(files)) for (const link of f.uses || []) { const t = linkTarget(files, link); if (t && t.id === id && f.id !== id) out.push({ file: f, link }); }
  return out;
}

export function bom(files, id, { depth = 20 } = {}) {
  const rows = [];
  const walk = (f, level, prefix, mult, chain) => {
    let k = 0;
    for (const link of f.uses || []) {
      const qty = link.kind === 'part' ? Math.max(0, link.qty | 0) : 1;
      if (link.kind === 'part' && !qty) continue;
      const t = linkTarget(files, link);
      const item = (prefix ? prefix + '.' : '') + (++k);
      const cycle = !!(t && chain.includes(t.id));
      rows.push({ level, item, id: t?.id || null, path: t?.path || link.path || null, name: link.name || (t ? baseName(t.path) : baseName(link.ref)),
        number: t?.number || link.number || '', rev: t?.rev || '', state: t?.state || '', kind: link.kind, qty, total: qty * mult, missing: !t, cycle });
      if (t && !cycle && level < depth) walk(t, level + 1, item, qty * mult, [...chain, t.id]);
    }
  };
  const root = list(files).find((x) => x.id === id);
  if (root) walk(root, 1, '', 1, [root.id]);
  return rows;
}

export const CSV_HEAD = ['Item', 'Level', 'Number', 'Name', 'Path', 'Revision', 'State', 'Qty', 'Total qty', 'Note'];
export function bomCsv(rows, { head = CSV_HEAD, missing = 'not in the vault', cycle = 'uses itself', state = (s) => s } = {}) {
  const cell = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]|^\s|\s$/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [head.map(cell).join(',')];
  for (const r of rows) lines.push([r.item, r.level, r.number, r.name, r.path || '', r.rev, r.state ? state(r.state) : '', r.qty, r.total, r.missing ? missing : r.cycle ? cycle : ''].map(cell).join(','));
  return '﻿' + lines.join('\r\n') + '\r\n';
}

// ---------------------------------------------------------------------------- title blocks

export function revisionTable(file) {
  return (file?.revs || []).filter((r) => r.released).map((r) => ({ rev: r.rev, date: String(r.at || '').slice(0, 10), by: r.by || '', approver: r.approver || '', note: r.note || '' }));
}

export function titleBlockValues(file, { stateLabel = (s) => s, date = (iso) => String(iso || '').slice(0, 10) } = {}) {
  if (!file) return {};
  const last = file.revs?.[file.revs.length - 1];
  const rel = [...(file.revs || [])].reverse().find((r) => r.released);
  const v = {
    'VAULT.REV': file.rev || '', 'VAULT.STATE': stateLabel(file.state), 'VAULT.DATE': date(last?.at), 'VAULT.APPROVER': rel?.approver || '', 'VAULT.ID': file.id || '',
  };
  const alias = { 'VAULT.REV': ['VAULT_REV', 'REV', 'REVISION', 'REV_NO'], 'VAULT.STATE': ['VAULT_STATE'], 'VAULT.DATE': ['VAULT_DATE', 'REV_DATE', 'REVDATE'],
    'VAULT.APPROVER': ['VAULT_APPROVER', 'APPROVED_BY'], 'VAULT.ID': ['VAULT_ID'] };
  for (const [k, list] of Object.entries(alias)) for (const a of list) v[a] = v[k];
  return v;
}
