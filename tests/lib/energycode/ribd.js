/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ribd.js — CBECC's single-family project file (.ribd25), read, written and checked (0.11 Track T24, T24.10). Host-free.
 *
 * The file is plain text. Its first line names the ruleset; then come objects, each `Class   "name"`, its properties one per line as
 * `Name = value` (a number, a quoted word, or a list in brackets that may run over several lines; `Name[3] = value` sets one place of a list),
 * and a line of two dots; the last line is END_OF_FILE. An object belongs to the nearest object before it whose class may hold it. This layout was read in the Energy
 * Commission's own published example files; nothing here comes from the program's source.
 *
 *   readRibd(text)  → { ok, errors, ruleset, objects: [{ cls, name, props: [{ key, index | null, value }] }] }      value: number | string | array
 *   writeRibd(doc)  → text (CRLF line ends, as the program writes them)
 *   checkRibd(doc, model) → { problems: [{ at, why, … }], checked: { objects, props, words, refs }, unlisted }
 *       model = the program's input data model as JSON (tools/energy-ca/cbecc-model.py makes it from the Commission's data model files).
 *       Checks every object's class, that some object before it may hold it, every property's name, kind (number / word / reference) and
 *       list size, every word against the word lists of that property, and every reference against the objects in the file.
 *       `unlisted` counts words whose property has no list in the model (they cannot be checked, and are not called right).
 */
const num = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

function parseValue(raw) {
  const s = raw.trim();
  if (s.startsWith('(')) {
    const inner = s.replace(/^\(\s*/, '').replace(/\s*\)$/, ''), out = [];
    let cur = '', q = false;
    for (const ch of inner) { if (ch === '"') { q = !q; cur += ch; } else if (ch === ',' && !q) { out.push(cur); cur = ''; } else cur += ch; }
    if (cur.trim() !== '') out.push(cur);
    return out.map((x) => parseValue(x));
  }
  if (s.startsWith('"')) return s.endsWith('"') && s.length >= 2 ? s.slice(1, -1) : null;
  return num.test(s) ? Number(s) : null;
}

export function readRibd(text) {
  const errors = [], objects = [];
  if (typeof text !== 'string' || !text.length) return { ok: false, errors: ['empty'], ruleset: null, objects };
  const lines = text.replace(/^﻿/, '').split(/\r\n|\n|\r/);
  let ruleset = null, cur = null, i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.trim() === 'END_OF_FILE' && !cur) break;   // the program's own last line
    if (line.trim() === '..') { if (!cur) errors.push('line ' + (i + 1) + ': an end with no object'); cur = null; continue; }
    const head = /^([A-Za-z_][A-Za-z0-9_]*)\s+"([^"]*)"\s*$/.exec(line);
    if (head && !cur) {
      if (head[1] === 'RulesetFilename') { ruleset = head[2]; continue; }
      cur = { cls: head[1], name: head[2], props: [] }; objects.push(cur); continue;
    }
    const m = /^\s+([A-Za-z_][A-Za-z0-9_]*)(?:\[(\d+)\])?\s*=\s*(.*)$/.exec(line);
    if (!m || !cur) { errors.push('line ' + (i + 1) + ': not understood'); if (errors.length > 20) break; continue; }
    let raw = m[3];
    if (raw.trim().startsWith('(')) while (!/\)\s*$/.test(raw) && i + 1 < lines.length) raw += ' ' + lines[++i].trim();
    const value = parseValue(raw);
    if (value === null || (Array.isArray(value) && value.some((x) => x === null))) { errors.push('line ' + (i + 1) + ': value not understood'); continue; }
    cur.props.push({ key: m[1], index: m[2] ? Number(m[2]) : null, value });
  }
  if (cur) errors.push('the last object is not closed');
  if (!ruleset) errors.push('no ruleset line');
  return { ok: !errors.length, errors, ruleset, objects };
}

const one = (v) => (typeof v === 'number' ? String(Number.isInteger(v) ? v : Number(v.toPrecision(12))) : '"' + String(v).replace(/"/g, "'") + '"');
export function writeRibd(doc) {
  const out = ['RulesetFilename   "' + doc.ruleset + '"  ', ''];
  for (const o of doc.objects) {
    out.push(o.cls + '   "' + String(o.name).replace(/"/g, "'") + '"  ');
    for (const p of o.props) out.push('   ' + p.key + (p.index ? '[' + p.index + ']' : '') + ' = ' + (Array.isArray(p.value) ? '( ' + p.value.map(one).join(', ') + ' )' : one(p.value)));
    out.push('   ..', '');
  }
  out.push('', 'END_OF_FILE');
  return out.join('\r\n') + '\r\n';
}

export function checkRibd(doc, model) {
  const problems = [], checked = { objects: 0, props: 0, words: 0, refs: 0 };
  let unlisted = 0;
  const names = new Map();   // object name → classes that carry it
  for (const o of doc.objects) { if (!names.has(o.name)) names.set(o.name, new Set()); names.get(o.name).add(o.cls); }
  const before = [];
  for (const o of doc.objects) {
    const at = o.cls + ' "' + o.name + '"', C = model.classes[o.cls];
    checked.objects++;
    if (!C) { problems.push({ at, why: 'class' }); before.push(o.cls); continue; }
    if (C.parents.length && !C.parents.some((p) => before.includes(p))) problems.push({ at, why: 'parent', needs: C.parents });
    before.push(o.cls);
    for (const p of o.props) {
      const P = C.props[p.key];
      checked.props++;
      if (!P) { problems.push({ at, why: 'property', key: p.key }); continue; }
      const vals = Array.isArray(p.value) ? p.value : [p.value];
      if (p.index !== null && (p.index < 1 || p.index > P.n)) problems.push({ at, why: 'index', key: p.key, index: p.index, size: P.n });
      if (Array.isArray(p.value) && p.value.length > P.n) problems.push({ at, why: 'size', key: p.key, size: P.n });
      for (const v of vals) {
        if (P.type === 'Int' || P.type === 'Flt') { if (typeof v !== 'number') problems.push({ at, why: 'number', key: p.key, value: v }); else if (P.type === 'Int' && !Number.isInteger(v)) problems.push({ at, why: 'whole', key: p.key, value: v }); continue; }
        if (typeof v !== 'string') { problems.push({ at, why: 'word', key: p.key, value: v }); continue; }
        if (P.type === 'Sym') {
          const list = model.enums[o.cls + ':' + p.key];
          if (!list) { unlisted++; continue; }
          checked.words++;
          if (!list.includes(v)) problems.push({ at, why: 'not-in-list', key: p.key, value: v });
        } else if (P.type === 'Obj') {
          checked.refs++;
          if (!names.has(v) && !/^- .* -$/.test(v)) problems.push({ at, why: 'reference', key: p.key, value: v });
        }
      }
    }
  }
  return { problems, checked, unlisted };
}
