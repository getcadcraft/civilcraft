/* SPDX-License-Identifier: Apache-2.0 */
/**
 * reqif.js — ReqIF 1.2 (OMG formal/2016-07-01) in and out (0.8 XE.7), from the published schema and implementation guide.
 *
 *   readReqif(text)  → { spec, problems }   requirements from SPEC-OBJECTs, tree from SPECIFICATIONs, links from SPEC-RELATIONs
 *   writeReqif(spec, { title, author, now }) → text
 * Reading is strict about safety (xml.js refuses DOCTYPE/ENTITY) and forgiving about content: what we cannot map is named as a problem, never guessed.
 * Attributes: ReqIF.Name / ReqIF.ChapterName → title, ReqIF.Text → text, ReqIF.ForeignID → the id shown to people; every other attribute is kept in `attrs`
 * under its long name. Enumeration values are read by their long name. Embedded files (OBJECT in XHTML, attachments) are not read.
 */
import { Spec, problem, clean, LINK_TYPES } from './model.js';
import { parseXml, XmlError, kid, kids, plainText, esc } from './xml.js';

const TITLE_NAMES = new Set(['ReqIF.ChapterName', 'ReqIF.Name', 'Name', 'Title', 'Chapter Name']);
const TEXT_NAMES = new Set(['ReqIF.Text', 'Text', 'Description', 'ReqIF.Description']);
const FOREIGN = new Set(['ReqIF.ForeignID', 'Object Identifier', 'ID']);
const STATUS_NAMES = new Set(['ReqIF.Status', 'Status']);
const KIND_NAMES = new Set(['ReqIF.Kind', 'Kind']);

export function readReqif(text) {
  const problems = []; let root;
  try { root = parseXml(text); } catch (e) { return { spec: new Spec(), problems: [problem('reqif-xml', 'error', e instanceof XmlError ? e.message : 'The file could not be read.', [{ kind: 'file', id: 'reqif' }])] }; }
  if (root.name !== 'REQ-IF') return { spec: new Spec(), problems: [problem('reqif-root', 'error', 'This is not a ReqIF file (the first element is ' + clean(root.name, 40) + ').', [{ kind: 'file', id: 'reqif' }])] };
  const header = kid(kid(kid(root, 'THE-HEADER'), 'REQ-IF-HEADER'), 'TITLE');
  const spec = new Spec(header ? header.text.trim() : '');
  const content = kid(kid(root, 'CORE-CONTENT'), 'REQ-IF-CONTENT');
  if (!content) { problems.push(problem('reqif-empty', 'error', 'The file has no content.', [{ kind: 'file', id: 'reqif' }])); return { spec, problems }; }

  // attribute definitions: id → long name; enum values: id → long name (or key)
  const defName = new Map(), enumVal = new Map();
  for (const dt of kids(kid(content, 'DATATYPES'), 'DATATYPE-DEFINITION-ENUMERATION')) for (const ev of kids(kid(dt, 'SPECIFIED-VALUES'), 'ENUM-VALUE')) enumVal.set(ev.attrs.IDENTIFIER, ev.attrs['LONG-NAME'] || ev.attrs.IDENTIFIER);
  const typeName = new Map(), relTypeName = new Map();
  for (const t of kids(kid(content, 'SPEC-TYPES'), 'SPEC-OBJECT-TYPE')) {
    typeName.set(t.attrs.IDENTIFIER, t.attrs['LONG-NAME'] || '');
    for (const d of kid(t, 'SPEC-ATTRIBUTES')?.children || []) defName.set(d.attrs.IDENTIFIER, d.attrs['LONG-NAME'] || d.attrs.IDENTIFIER);
  }
  for (const t of kids(kid(content, 'SPEC-TYPES'), 'SPEC-RELATION-TYPE')) relTypeName.set(t.attrs.IDENTIFIER, t.attrs['LONG-NAME'] || '');

  const idOf = new Map(); // ReqIF identifier → our id
  for (const so of kids(kid(content, 'SPEC-OBJECTS'), 'SPEC-OBJECT')) {
    const rid = so.attrs.IDENTIFIER; if (!rid) { problems.push(problem('reqif-noid', 'warning', 'A SPEC-OBJECT has no IDENTIFIER and was skipped.', [{ kind: 'file', id: 'reqif' }])); continue; }
    const it = { id: rid, title: so.attrs['LONG-NAME'] || '', text: '', attrs: {}, kind: 'requirement', status: 'draft' };
    const tref = kid(kid(so, 'TYPE'), 'SPEC-OBJECT-TYPE-REF'); if (tref && typeName.get(tref.text.trim())) it.attrs['ReqIF.Type'] = typeName.get(tref.text.trim());
    for (const v of kid(so, 'VALUES')?.children || []) {
      const dref = kid(kid(v, 'DEFINITION'), v.name.replace('ATTRIBUTE-VALUE-', 'ATTRIBUTE-DEFINITION-') + '-REF'); const dn = dref ? defName.get(dref.text.trim()) || dref.text.trim() : '';
      let val;
      if (v.name === 'ATTRIBUTE-VALUE-XHTML') { const tv = kid(v, 'THE-VALUE'); val = tv ? plainText(tv) : ''; }
      else if (v.name === 'ATTRIBUTE-VALUE-ENUMERATION') val = kids(kid(v, 'VALUES'), 'ENUM-VALUE-REF').map((r) => enumVal.get(r.text.trim()) || r.text.trim()).join(', ');
      else if (v.name.startsWith('ATTRIBUTE-VALUE-')) val = v.attrs['THE-VALUE'] ?? '';
      else continue;
      if (TITLE_NAMES.has(dn) && !it.title) it.title = val; else if (TEXT_NAMES.has(dn) && !it.text) it.text = val;
      else if (FOREIGN.has(dn) && val) { it.attrs['ReqIF.ForeignID'] = val; }
      else if (STATUS_NAMES.has(dn)) it.status = val.toLowerCase(); else if (KIND_NAMES.has(dn)) it.kind = val.toLowerCase();
      else if (dn) it.attrs[dn] = val;
    }
    const keyId = it.attrs['ReqIF.ForeignID'] || rid;
    it.id = keyId; if (idOf.has(rid)) problems.push(problem('reqif-dup', 'warning', `IDENTIFIER ${clean(rid, 60)} appears twice; the later one replaced the earlier.`, [{ kind: 'requirement', id: keyId }]));
    idOf.set(rid, keyId);
    if (spec.get(keyId)) problems.push(problem('reqif-dupforeign', 'warning', `Two objects share the id ${clean(keyId, 60)}; the later one replaced the earlier.`, [{ kind: 'requirement', id: keyId }]));
    spec.add(it);
  }
  // hierarchy → parent
  const walk = (h, parent) => {
    for (const sh of kids(kid(h, 'CHILDREN'), 'SPEC-HIERARCHY')) {
      const ref = kid(kid(sh, 'OBJECT'), 'SPEC-OBJECT-REF'); const id = ref ? idOf.get(ref.text.trim()) : null;
      if (id) { const it = spec.get(id); if (it && parent && !it.parent) it.parent = parent; }
      else problems.push(problem('reqif-hier', 'warning', 'A hierarchy entry points at an object that is not in the file.', [{ kind: 'file', id: 'reqif' }]));
      walk(sh, id || parent);
    }
  };
  for (const sp of kids(kid(content, 'SPECIFICATIONS'), 'SPECIFICATION')) walk(sp, null);
  // relations
  for (const rel of kids(kid(content, 'SPEC-RELATIONS'), 'SPEC-RELATION')) {
    const s = idOf.get(kid(kid(rel, 'SOURCE'), 'SPEC-OBJECT-REF')?.text.trim()), t = idOf.get(kid(kid(rel, 'TARGET'), 'SPEC-OBJECT-REF')?.text.trim());
    if (!s || !t) { problems.push(problem('reqif-rel', 'warning', 'A relation points at an object that is not in the file and was skipped.', [{ kind: 'file', id: 'reqif' }])); continue; }
    const rn = relTypeName.get(kid(kid(rel, 'TYPE'), 'SPEC-RELATION-TYPE-REF')?.text.trim()) || rel.attrs['LONG-NAME'] || '';
    const ty = LINK_TYPES.find((x) => x === rn.toLowerCase().trim());
    if (!ty && rn) problems.push(problem('reqif-reltype', 'info', `Relation type "${clean(rn, 60)}" is not one we know; it is kept as "references".`, [{ kind: 'link', id: s }]));
    spec.link(s, t, ty || 'references');
  }
  for (const e of spec.errors) problems.push(problem('reqif-item', 'warning', e, [{ kind: 'file', id: 'reqif' }]));
  return { spec, problems };
}

const nc = (s) => { const t = String(s).replace(/[^A-Za-z0-9_.-]/g, '_'); return /^[A-Za-z_]/.test(t) ? t : '_' + t; };
/** Write a ReqIF 1.2 file. Requirements, elements, tests and documents are all SPEC-OBJECTs of one type with a Kind attribute. */
export function writeReqif(spec, { title = spec.name || 'Requirements', author = '', now = new Date().toISOString(), tool = 'CadCraft' } = {}) {
  const items = [...spec.items.values()], ids = new Map(items.map((i, n) => [i.id, 'o' + (n + 1) + '-' + nc(i.id).slice(0, 80)]));
  const extra = [...new Set(items.flatMap((i) => Object.keys(i.attrs).filter((k) => k !== 'ReqIF.ForeignID' && k !== 'ReqIF.Type')))].sort();
  const defs = [['Name', 'ReqIF.Name'], ['Text', 'ReqIF.Text'], ['Status', 'ReqIF.Status'], ['Kind', 'ReqIF.Kind'], ['Id', 'ReqIF.ForeignID'], ['Retired', 'CadCraft.Retired'], ...extra.map((k, n) => ['X' + n, k])];
  const D = (k) => 'ad-' + k;
  const o = [];
  o.push('<?xml version="1.0" encoding="UTF-8"?>', '<REQ-IF xmlns="http://www.omg.org/spec/ReqIF/20110401/reqif.xsd" xmlns:xhtml="http://www.w3.org/1999/xhtml">', ' <THE-HEADER>', '  <REQ-IF-HEADER IDENTIFIER="header-1">',
    `   <CREATION-TIME>${esc(now)}</CREATION-TIME>`, '   <REQ-IF-TOOL-ID>' + esc(tool) + '</REQ-IF-TOOL-ID>', '   <REQ-IF-VERSION>1.2</REQ-IF-VERSION>', '   <SOURCE-TOOL-ID>' + esc(tool) + '</SOURCE-TOOL-ID>', `   <TITLE>${esc(title)}</TITLE>`, author ? `   <COMMENT>${esc('Author: ' + author)}</COMMENT>` : '', '  </REQ-IF-HEADER>', ' </THE-HEADER>',
    ' <CORE-CONTENT>', '  <REQ-IF-CONTENT>', '   <DATATYPES>', `    <DATATYPE-DEFINITION-STRING IDENTIFIER="dt-string" LAST-CHANGE="${esc(now)}" LONG-NAME="String" MAX-LENGTH="32000"/>`, '   </DATATYPES>', '   <SPEC-TYPES>',
    `    <SPEC-OBJECT-TYPE IDENTIFIER="sot-1" LAST-CHANGE="${esc(now)}" LONG-NAME="Requirement">`, '     <SPEC-ATTRIBUTES>');
  for (const [k, ln] of defs) o.push(`      <ATTRIBUTE-DEFINITION-STRING IDENTIFIER="${D(k)}" LAST-CHANGE="${esc(now)}" LONG-NAME="${esc(ln)}"><TYPE><DATATYPE-DEFINITION-STRING-REF>dt-string</DATATYPE-DEFINITION-STRING-REF></TYPE></ATTRIBUTE-DEFINITION-STRING>`);
  o.push('     </SPEC-ATTRIBUTES>', '    </SPEC-OBJECT-TYPE>');
  for (const t of LINK_TYPES) o.push(`    <SPEC-RELATION-TYPE IDENTIFIER="srt-${t}" LAST-CHANGE="${esc(now)}" LONG-NAME="${t}"/>`);
  o.push(`    <SPECIFICATION-TYPE IDENTIFIER="st-1" LAST-CHANGE="${esc(now)}" LONG-NAME="Specification"/>`, '   </SPEC-TYPES>', '   <SPEC-OBJECTS>');
  for (const i of items) {
    const vals = [['Name', i.title], ['Text', i.text], ['Status', i.status], ['Kind', i.kind], ['Id', i.id], ['Retired', i.retired ? 'true' : ''], ...extra.map((k, n) => ['X' + n, i.attrs[k] ?? ''])].filter(([, v]) => v !== '');
    o.push(`    <SPEC-OBJECT IDENTIFIER="${esc(ids.get(i.id))}" LAST-CHANGE="${esc(now)}" LONG-NAME="${esc(i.title.slice(0, 200))}">`, '     <TYPE><SPEC-OBJECT-TYPE-REF>sot-1</SPEC-OBJECT-TYPE-REF></TYPE>', '     <VALUES>');
    for (const [k, v] of vals) o.push(`      <ATTRIBUTE-VALUE-STRING THE-VALUE="${esc(String(v).slice(0, 32000))}"><DEFINITION><ATTRIBUTE-DEFINITION-STRING-REF>${D(k)}</ATTRIBUTE-DEFINITION-STRING-REF></DEFINITION></ATTRIBUTE-VALUE-STRING>`);
    o.push('     </VALUES>', '    </SPEC-OBJECT>');
  }
  o.push('   </SPEC-OBJECTS>', '   <SPEC-RELATIONS>');
  spec.links.forEach((l, n) => { if (ids.has(l.from) && ids.has(l.to)) o.push(`    <SPEC-RELATION IDENTIFIER="rel-${n + 1}" LAST-CHANGE="${esc(now)}"><TYPE><SPEC-RELATION-TYPE-REF>srt-${l.type}</SPEC-RELATION-TYPE-REF></TYPE><SOURCE><SPEC-OBJECT-REF>${esc(ids.get(l.from))}</SPEC-OBJECT-REF></SOURCE><TARGET><SPEC-OBJECT-REF>${esc(ids.get(l.to))}</SPEC-OBJECT-REF></TARGET></SPEC-RELATION>`); });
  o.push('   </SPEC-RELATIONS>', '   <SPECIFICATIONS>', `    <SPECIFICATION IDENTIFIER="spec-1" LAST-CHANGE="${esc(now)}" LONG-NAME="${esc(title)}">`, '     <TYPE><SPECIFICATION-TYPE-REF>st-1</SPECIFICATION-TYPE-REF></TYPE>');
  const kidsOf = new Map(); for (const i of items) { const p = i.parent && ids.has(i.parent) ? i.parent : null; if (!kidsOf.has(p)) kidsOf.set(p, []); kidsOf.get(p).push(i); }
  let hn = 0; const emit = (list, pad, seen) => { if (!list || !list.length) return; o.push(pad + '<CHILDREN>'); for (const i of list) { if (seen.has(i.id)) continue; seen.add(i.id); o.push(`${pad} <SPEC-HIERARCHY IDENTIFIER="h-${++hn}" LAST-CHANGE="${esc(now)}"><OBJECT><SPEC-OBJECT-REF>${esc(ids.get(i.id))}</SPEC-OBJECT-REF></OBJECT>`); emit(kidsOf.get(i.id), pad + '  ', seen); o.push(pad + ' </SPEC-HIERARCHY>'); } o.push(pad + '</CHILDREN>'); };
  emit(kidsOf.get(null), '     ', new Set());
  o.push('    </SPECIFICATION>', '   </SPECIFICATIONS>', '  </REQ-IF-CONTENT>', ' </CORE-CONTENT>', '</REQ-IF>');
  return o.filter((x) => x !== '').join('\n') + '\n';
}
