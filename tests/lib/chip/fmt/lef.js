/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lef.js — LEF (Library Exchange Format) reader and writer: units, layers, vias, sites, macros with pins, ports and obstructions.
 * Written from the public LEF/DEF language description. Statements end with ";", blocks end with "END [name]", "#" starts a comment.
 *
 *   readLef(text)   → { tree, problems }   tree = [{ kind: 'stmt', w: [words] } | { kind: 'block', key, name, head: [words], body }]
 *   writeLef(tree)  → text                 (word for word, so a read → write → read keeps every statement, known or not)
 *   lefModel(tree)  → { version, units, manufacturingGrid, layers, vias, sites, macros }
 *   buildLef(model) → tree
 */
import { prob } from './problem.js';

function lex(text) { // words with line numbers; quoted strings kept with their quotes; ";" is its own word
  const out = []; let i = 0, line = 1; const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '\n') { line++; i++; continue; }
    if (c <= ' ') { i++; continue; }
    if (c === '#') { while (i < n && text[i] !== '\n') i++; continue; }
    if (c === '"') { let j = i + 1; while (j < n && text[j] !== '"') { if (text[j] === '\n') line++; j++; } out.push({ v: text.slice(i, j + 1), line }); i = j + 1; continue; }
    if (c === ';') { out.push({ v: ';', line }); i++; continue; }
    let j = i; while (j < n && text[j] > ' ' && text[j] !== ';' && text[j] !== '"') j++;
    out.push({ v: text.slice(i, j), line }); i = j;
  }
  return out;
}

// which keywords open a block, by the block they sit in; 'named' blocks end with "END <name>", the rest with "END [KEY]"
const BLOCKS = {
  '': { LAYER: 'named', VIA: 'named', VIARULE: 'named', SITE: 'named', MACRO: 'named', NONDEFAULTRULE: 'named', UNITS: 'key', PROPERTYDEFINITIONS: 'key', SPACING: 'key', NOISETABLE: 'key', CORRECTIONTABLE: 'key', ARRAY: 'named', IRDROP: 'key' },
  MACRO: { PIN: 'named', OBS: 'bare' }, PIN: { PORT: 'bare' }, NONDEFAULTRULE: { LAYER: 'named', VIA: 'named', SPACING: 'key' },
};

const HEAD_WORDS = new Set(['DEFAULT', 'GENERATE']); // words that may follow a block's name on its first line (VIA v DEFAULT, VIARULE r GENERATE)

/** Parse LEF text into statements and blocks. Unknown statements are kept as words. */
export function readLef(text) {
  const t = lex(String(text)), problems = []; let p = 0;
  const parse = (ctx, endName) => {
    const body = [];
    while (p < t.length) {
      const a = t[p];
      if (a.v === 'END') {
        const nx = t[p + 1];
        if (ctx === '' && nx && nx.v === 'LIBRARY') { p += 2; return { body, ended: 'LIBRARY' }; }
        if (endName === null) { p++; return { body, ended: true }; }
        if (nx && nx.v === endName) { p += 2; return { body, ended: true }; }
        problems.push(prob('lef.end', 'END ' + (nx ? nx.v : '') + ' does not close ' + (endName || ctx) + '.', { line: a.line, severity: 'warning' })); p += nx && nx.line === a.line ? 2 : 1; return { body, ended: true };
      }
      const kind = (BLOCKS[ctx] || {})[a.v];
      // In a block that lists the keyword, "LAYER m1 ;" is still a statement when ";" follows the name at once (VIARULE does not list LAYER, so it is a statement there anyway).
      if (kind && !(kind === 'named' && t[p + 2] && t[p + 2].v === ';' && ctx !== '')) {
        const key = a.v, line = a.line; p++;
        let name = null; if (kind === 'named' && p < t.length) name = t[p++].v;
        const head = []; while (p < t.length && t[p].line === line && HEAD_WORDS.has(t[p].v)) head.push(t[p++].v);
        const r = parse(key, kind === 'named' ? name : kind === 'key' ? key : null);
        if (!r.ended) problems.push(prob('lef.unclosed', key + (name ? ' ' + name : '') + ' is never closed.', { line }));
        body.push({ kind: 'block', key, name, head, body: r.body, line });
        if (r.ended === 'LIBRARY') return r;
        continue;
      }
      const w = [], line = a.line; while (p < t.length && t[p].v !== ';') w.push(t[p++].v);
      if (p < t.length) p++; else problems.push(prob('lef.semicolon', 'A statement starting "' + w.slice(0, 3).join(' ') + '" has no closing ";".', { line, severity: 'warning' }));
      body.push({ kind: 'stmt', w, line });
    }
    return { body, ended: false };
  };
  const r = parse('', undefined);
  return { tree: r.body, problems, endLibrary: r.ended === 'LIBRARY' };
}

/** Write a tree back as LEF (one statement per line, blocks indented). */
export function writeLef(tree, { endLibrary = true } = {}) {
  const L = [];
  const w = (st, ind) => {
    const pad = '  '.repeat(ind);
    for (const s of st) {
      if (s.kind === 'stmt') { L.push(pad + s.w.join(' ') + ' ;'); continue; }
      L.push(pad + [s.key, s.name, ...s.head].filter((x) => x !== null && x !== undefined).join(' '));
      w(s.body, ind + 1);
      L.push(pad + 'END' + (s.name !== null && s.name !== undefined ? ' ' + s.name : s.key === 'PORT' || s.key === 'OBS' ? '' : ' ' + s.key));
    }
  };
  w(tree, 0); if (endLibrary) L.push('END LIBRARY'); return L.join('\n') + '\n';
}

/** Tree without line numbers. */
export function plainLef(tree) { return tree.map((s) => (s.kind === 'stmt' ? { kind: 'stmt', w: s.w } : { kind: 'block', key: s.key, name: s.name, head: s.head, body: plainLef(s.body) })); }

// ---------------------------------------------------------------- model
const N = Number;
function geometry(body) { // LAYER / RECT / POLYGON / VIA statements inside PORT or OBS
  const out = []; let cur = null;
  for (const s of body) {
    if (s.kind !== 'stmt') continue; const w = s.w;
    if (w[0] === 'LAYER') { cur = { layer: w[1], rects: [], polygons: [], vias: [] }; out.push(cur); continue; }
    if (!cur) { cur = { layer: null, rects: [], polygons: [], vias: [] }; out.push(cur); }
    let k = 1; if (w[k] === 'MASK') k += 2;
    if (w[0] === 'RECT') cur.rects.push(w.slice(k, k + 4).map(N));
    else if (w[0] === 'POLYGON') cur.polygons.push(w.slice(k).map(N));
    else if (w[0] === 'VIA') cur.vias.push({ at: [N(w[k]), N(w[k + 1])], name: w[k + 2] });
  }
  return out;
}
const stmt = (body, key) => body.find((s) => s.kind === 'stmt' && s.w[0] === key);
const val = (body, key, i = 1) => stmt(body, key)?.w[i];
const nval = (body, key, i = 1) => { const v = val(body, key, i); return v === undefined ? undefined : N(v); };
const unq = (s) => (s && s[0] === '"' ? s.slice(1, -1) : s);

/** A plain model of the library: what the floorplan and cell views read. Sizes in microns. */
export function lefModel(tree) {
  const m = { version: val(tree, 'VERSION'), busBitChars: unq(val(tree, 'BUSBITCHARS')), dividerChar: unq(val(tree, 'DIVIDERCHAR')), manufacturingGrid: nval(tree, 'MANUFACTURINGGRID'), units: {}, layers: [], vias: [], sites: [], macros: [] };
  for (const b of tree) {
    if (b.kind !== 'block') continue;
    if (b.key === 'UNITS') for (const s of b.body) if (s.kind === 'stmt') m.units[s.w[0].toLowerCase()] = { unit: s.w[1], value: N(s.w[2]) };
    if (b.key === 'LAYER') {
      const L = { name: b.name, type: val(b.body, 'TYPE') };
      for (const [k, key] of [['direction', 'DIRECTION']]) { const v = val(b.body, key); if (v) L[k] = v; }
      for (const [k, key] of [['pitch', 'PITCH'], ['width', 'WIDTH'], ['spacing', 'SPACING'], ['offset', 'OFFSET'], ['minArea', 'AREA'], ['thickness', 'THICKNESS'], ['resistancePerSq', 'RESISTANCE'], ['minWidth', 'MINWIDTH']]) {
        const s = stmt(b.body, key); if (!s) continue; if (key === 'RESISTANCE' && s.w[1] === 'RPERSQ') L[k] = N(s.w[2]); else if (key !== 'RESISTANCE') L[k] = N(s.w[1]);
      }
      m.layers.push(L);
    }
    if (b.key === 'VIA') m.vias.push({ name: b.name, default: b.head.includes('DEFAULT'), layers: geometry(b.body) });
    if (b.key === 'SITE') { const sz = stmt(b.body, 'SIZE'); m.sites.push({ name: b.name, class: val(b.body, 'CLASS'), symmetry: stmt(b.body, 'SYMMETRY')?.w.slice(1), size: sz ? [N(sz.w[1]), N(sz.w[3])] : undefined }); }
    if (b.key === 'MACRO') {
      const sz = stmt(b.body, 'SIZE'), or = stmt(b.body, 'ORIGIN'), fo = stmt(b.body, 'FOREIGN');
      const mc = { name: b.name, class: stmt(b.body, 'CLASS')?.w.slice(1).join(' '), origin: or ? [N(or.w[1]), N(or.w[2])] : undefined, foreign: fo ? { name: fo.w[1], at: fo.w[2] !== undefined ? [N(fo.w[2]), N(fo.w[3])] : undefined } : undefined,
        size: sz ? [N(sz.w[1]), N(sz.w[3])] : undefined, symmetry: stmt(b.body, 'SYMMETRY')?.w.slice(1), site: val(b.body, 'SITE'), pins: [], obs: [] };
      for (const k of b.body) {
        if (k.kind !== 'block') continue;
        if (k.key === 'PIN') mc.pins.push({ name: k.name, direction: val(k.body, 'DIRECTION'), use: val(k.body, 'USE'), shape: val(k.body, 'SHAPE'), ports: k.body.filter((x) => x.kind === 'block' && x.key === 'PORT').map((x) => geometry(x.body)) });
        if (k.key === 'OBS') mc.obs = geometry(k.body);
      }
      m.macros.push(mc);
    }
  }
  return m;
}

// ---------------------------------------------------------------- model → tree
const st = (...w) => ({ kind: 'stmt', w: w.filter((x) => x !== undefined && x !== null).map(String) });
const blk = (key, name, body, head = []) => ({ kind: 'block', key, name, head, body });
const geoTree = (gs) => { const out = []; for (const g of gs) { if (g.layer) out.push(st('LAYER', g.layer)); for (const r of g.rects) out.push(st('RECT', ...r)); for (const p of g.polygons) out.push(st('POLYGON', ...p)); for (const v of g.vias || []) out.push(st('VIA', v.at[0], v.at[1], v.name)); } return out; };
/** Build a tree from a model (as lefModel returns, or made by hand). */
export function buildLef(m) {
  const t = [];
  if (m.version) t.push(st('VERSION', m.version)); if (m.busBitChars) t.push(st('BUSBITCHARS', '"' + m.busBitChars + '"')); if (m.dividerChar) t.push(st('DIVIDERCHAR', '"' + m.dividerChar + '"'));
  const U = Object.entries(m.units || {}); if (U.length) t.push(blk('UNITS', null, U.map(([k, u]) => st(k.toUpperCase(), u.unit, u.value))));
  if (m.manufacturingGrid !== undefined) t.push(st('MANUFACTURINGGRID', m.manufacturingGrid));
  for (const L of m.layers) {
    const b = [st('TYPE', L.type)]; if (L.direction) b.push(st('DIRECTION', L.direction));
    for (const [k, key] of [['pitch', 'PITCH'], ['width', 'WIDTH'], ['spacing', 'SPACING'], ['offset', 'OFFSET'], ['minArea', 'AREA'], ['thickness', 'THICKNESS'], ['minWidth', 'MINWIDTH']]) if (L[k] !== undefined) b.push(st(key, L[k]));
    if (L.resistancePerSq !== undefined) b.push(st('RESISTANCE', 'RPERSQ', L.resistancePerSq));
    t.push(blk('LAYER', L.name, b));
  }
  for (const v of m.vias) t.push(blk('VIA', v.name, geoTree(v.layers), v.default ? ['DEFAULT'] : []));
  for (const s of m.sites) { const b = []; if (s.class) b.push(st('CLASS', s.class)); if (s.symmetry) b.push(st('SYMMETRY', ...s.symmetry)); if (s.size) b.push(st('SIZE', s.size[0], 'BY', s.size[1])); t.push(blk('SITE', s.name, b)); }
  for (const mc of m.macros) {
    const b = []; if (mc.class) b.push(st('CLASS', ...mc.class.split(' '))); if (mc.origin) b.push(st('ORIGIN', ...mc.origin)); if (mc.foreign) b.push(st('FOREIGN', mc.foreign.name, ...(mc.foreign.at || [])));
    if (mc.size) b.push(st('SIZE', mc.size[0], 'BY', mc.size[1])); if (mc.symmetry) b.push(st('SYMMETRY', ...mc.symmetry)); if (mc.site) b.push(st('SITE', mc.site));
    for (const p of mc.pins) { const pb = []; if (p.direction) pb.push(st('DIRECTION', p.direction)); if (p.use) pb.push(st('USE', p.use)); if (p.shape) pb.push(st('SHAPE', p.shape)); for (const port of p.ports) pb.push(blk('PORT', null, geoTree(port))); b.push(blk('PIN', p.name, pb)); }
    if (mc.obs && mc.obs.length) b.push(blk('OBS', null, geoTree(mc.obs)));
    t.push(blk('MACRO', mc.name, b));
  }
  return t;
}

/** Findings: macros without size, pins without ports, port layers the library does not define. */
export function checkLef(m) {
  const out = [], layers = new Set(m.layers.map((l) => l.name));
  for (const mc of m.macros) {
    if (!mc.size) out.push(prob('lef.no-size', 'Macro ' + mc.name + ' has no SIZE.', { about: [{ kind: 'macro', id: mc.name }] }));
    for (const p of mc.pins) {
      if (!p.ports.length) out.push(prob('lef.no-port', 'Pin ' + mc.name + '/' + p.name + ' has no PORT.', { severity: 'warning', about: [{ kind: 'pin', id: mc.name + '/' + p.name }] }));
      for (const port of p.ports) for (const g of port) if (g.layer && layers.size && !layers.has(g.layer)) out.push(prob('lef.layer', 'Pin ' + mc.name + '/' + p.name + ' uses layer ' + g.layer + ', which this LEF does not define (it may be in the technology LEF).', { severity: 'note' }));
    }
  }
  return out;
}
