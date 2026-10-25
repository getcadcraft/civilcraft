/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/don.js — a study file another line program reads (`.DON`, XML text; 0.7 PL.7, decision D5). No DOM.
 * UNTESTED WITH THE PROGRAM THAT READS IT: the layout is built from a list of one file's field names (an AI-written summary a
 * user shared, kept outside git), not from a real file. Every guess about the layout is listed under Assumptions below; the
 * export dialog, the help and the release notes say "untested" until a real file round-trips.
 *
 *   writeDon(study)          → XML text (a string; the declaration names ISO-8859-1 — pass it through donBytes to save it)
 *       study = { state, line, analysis, lib, units, meta: { description, project, version, step } }
 *         state     project.state.powerlines (model.js)        line  one overhead line of it
 *         analysis  checks.js analyzeLine(state, line, …)       lib   Map key → library item
 *         units     'ft' | 'm' (plan coordinates and heights); the file is in metres
 *   donBytes(xml)            → Uint8Array in ISO-8859-1 (decision: the program is old and the summary shows no encoding, so the file
 *                              is Latin-1 like the French Windows programs of its time); a character above U+00FF becomes '?'
 *   readDon(text)            untrusted text → { ok, meta, supports: [...], cantons: [...], notes: [{ why, … }] }; never throws
 *       meta     { version, description, project, step, groups: [names], temps: [°C], cases: [names], grades, ccw }
 *       support  { name, fullName, x_m, y_m, ground_m, height_m, above_m, angle_deg, fonction, role ('deadend'|'suspension'), existing,
 *                  crossarm, span_m, canton, classe, nature, chosen, chosenNominal_daN, foundation { a_m, b_m, h_m } | null,
 *                  results: [{ caseName, V_daN, H_daN, L_daN }] }
 *       canton   { name, wires, voltage_V, conductor, zone, temp, tension_daN, parameter_m, supportCount, first, last, rulingSpan_m,
 *                  spans_m: [], cases: [{ name, tenMax_daN }], stringing: [{ temp, length_m, H_daN, left_daN, right_daN, sags_m: [], lengths_m: [] }] }
 *       Lenient: the first <Etude> up to four levels down is the study; a field is a child element OR an attribute (names compared without case); unknown fields are ignored; numbers may
 *       use a decimal comma; a list is repeated elements or one value split on ";" / spaces (or "," when nothing else separates).
 *       Hostile input: text over 20 MB → ok:false; at most 200 000 elements (then partial, a note); no DTD, no entity beyond the
 *       five XML ones and numeric references (others are dropped with a note); control characters stripped; nesting over 100 ignored.
 *   donToState(read, units)  → { line, conductor (name from the first canton, for the UI to match a library item), hints: [{ crossarm,
 *                              chosen, nature }] per support, notes }
 *       line = model.js's overhead line: supports { id: null, x, y (project units), name, support: null, equip: [], role 'deadend' for DA
 *       else 'auto', ground (Altitude), h (HSol, else Hauteur; project units), existing }; ids are null placeholders — the UI gives e<n>
 *
 * Layout written (fixed element names only; text a person typed is only ever element TEXT, escaped):
 *   <?xml version="1.0" encoding="ISO-8859-1"?>  CRLF line ends, two-space indent
 *   <Etude> Version, Description, NumeroAffaire, EtapeCalcul, GroupeHypo (case names joined by ","), UniteAngleGrade 0 (degrees),
 *     SensAngleTrigo -1 (counter-clockwise positive), TemperatureReglage ×N (one element per stringing temperature), Hypothese ×N
 *     (one element per load case name), then
 *   <Support> ×N: Nom, NomComplet, X, Y, Altitude (ground), Hauteur (pole length), HSol (height above ground), AngleDeriv (signed
 *     turn, degrees), Fonction ('DA' dead-end, else 'AS' — the summary lists only those two, so an ANGLE support is written 'AS' with
 *     its AngleDeriv), Existant -1/0, Armement (crossarm name), Portee (span to the next support, horizontal; none on the last),
 *     NumCanton (1-based; a dead-end between two cantons gets the one that starts there), Nature (from the support's material) and
 *     Classe (only when the item has a `class` text), SupportChoisi + FNomSupChoisi (daN; the support kept when it carries the load,
 *     else the library's suggestion), <ResultatHypo> per case (NomHypo, VR vertical, HR transverse, LR longitudinal; daN, all
 *     conductors), DimFouilleChoisi_a / _b (the foundation's diameter) / _h (depth)
 *   <Canton> ×N: Nom 'Canton no N', NbFils (phases × circuits), TensionElec (V), Conducteur (name), Zone (the rule set's name),
 *     TempInitiale (the reference case's temperature), TensionIni (daN, horizontal, reference case), Parametre (a = H / w, m),
 *     NbSupports, IdPremierSupport / IdDernierSupport (1-based support numbers along the line), Porteq (ruling span),
 *     <Portees><Portee>…, <Hypothese> per case (NomHypo, TenMax daN = the largest support tension), <TabPose> per stringing
 *     temperature in the order of TemperatureReglage (LongCable m, TenHor, TenGauche (first support), TenDroite (last support) daN,
 *     <Fleches> with every <Fleche> (m, from the chord) then every <LongueurChainette> (m))
 *   Numbers always carry a decimal point (coordinates/lengths 3 places, forces 2, angles 4); counts, ids and booleans are integers.
 *
 * Assumptions (for the release notes, all untested): one element per field with the value as text; lists as repeated elements;
 * TemperatureReglage and Hypothese repeated at the top level; Fleche and LongueurChainette inside one Fleches, all sags first;
 * TabPose rows carry no temperature of their own (they follow TemperatureReglage); X, Y, Altitude in metres in the project's own
 * coordinate system; HSol = height above ground; HR = transverse, LR = longitudinal; NomHypo = our case names (not A1/B1/G1);
 * NomBD, DAC, FOP, H61 and the clearance/swing result fields are not written; Nature codes BA (concrete), BOIS, ACIER, COMPOSITE,
 * TREILLIS are our guess; IdPremierSupport/IdDernierSupport as support numbers, not internal ids.
 */

import { unitM, N_PER_DAN, fin } from './units.js';

const LIM = { bytes: 20 * 1024 * 1024, elements: 200000, depth: 100, tag: 65536, text: 4096, supports: 2000, cantons: 500, list: 5000 };
const NL = '\r\n';
const NATURE = { concrete: 'BA', wood: 'BOIS', steel: 'ACIER', composite: 'COMPOSITE', lattice: 'TREILLIS' };
const NATURE_BACK = { BA: 'concrete', BETON: 'concrete', BOIS: 'wood', WOOD: 'wood', ACIER: 'steel', METAL: 'steel', COMPOSITE: 'composite', TREILLIS: 'lattice' };

// ---------------------------------------------------------------------------------------------------------------- writing
const CTRL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const esc = (s) => String(s).replace(CTRL, ' ').replace(/[\r\n\t]+/g, ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const fx = (v, d) => { if (!fin(v)) return null; const s = v.toFixed(d); return /^-0\.0*$/.test(s) ? s.slice(1) : s; };
const daN = (N) => fx(fin(N) ? N / N_PER_DAN : NaN, 2);
const boolv = (b) => (b ? '-1' : '0');
const listName = (s) => String(s ?? '').replace(/,/g, ' ').trim();

/** Signed turn at each support in degrees, counter-clockwise positive (0 at the ends). */
function signedTurns(line) {
  const P = line.supports;
  return P.map((p, i) => {
    if (i === 0 || i === P.length - 1) return 0;
    let d = Math.atan2(P[i + 1].y - p.y, P[i + 1].x - p.x) - Math.atan2(p.y - P[i - 1].y, p.x - P[i - 1].x);
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d * 180 / Math.PI;
  });
}

export function writeDon(study) {
  const { state, line, analysis: A, lib, units, meta = {} } = study || {};
  const um = unitM(units);
  const get = (k) => (k && lib?.get ? lib.get(k) || null : null);
  const R = state?.rules || { cases: [], name: '' };
  const cases = R.cases || [];
  const out = [];
  let depth = 0;
  const pad = () => '  '.repeat(depth);
  const el = (name, v, empty = false) => { if (v == null || (v === '' && !empty)) return; out.push(pad() + '<' + name + '>' + esc(v) + '</' + name + '>'); };
  const open = (name) => { out.push(pad() + '<' + name + '>'); depth++; };
  const close = (name) => { depth--; out.push(pad() + '</' + name + '>'); };

  out.push('<?xml version="1.0" encoding="ISO-8859-1"?>');
  open('Etude');
  el('Version', meta.version ?? '', true);
  el('Description', meta.description ?? line?.name ?? '', true);
  el('NumeroAffaire', meta.project ?? '', true);
  el('EtapeCalcul', String(Number.isInteger(meta.step) ? meta.step : 1));
  el('GroupeHypo', cases.map((c) => listName(c.name || c.id)).join(','), true);
  el('UniteAngleGrade', '0');
  el('SensAngleTrigo', '-1');
  const temps = A?.sections?.find((S) => S.stringing?.length)?.stringing.map((r) => r.temp) ?? [];
  for (const t of temps) el('TemperatureReglage', fx(t, 1));
  for (const c of cases) el('Hypothese', c.name || c.id);

  const P = line?.supports || [];
  const turns = signedTurns(line || { supports: [] });
  const secOf = (i) => { const sp = A?.spans?.[i] ?? A?.spans?.[i - 1]; return sp && sp.section >= 0 ? sp.section + 1 : null; };
  const caseName = (id) => cases.find((c) => c.id === id)?.name || id;
  P.forEach((p, i) => {
    const r = A?.supports?.[i] || {};
    const item = get(p.support);
    const role = A?.roles?.[i] ?? p.role;
    const eq = [...(line.equip || []), ...(p.equip || [])].map(get).filter(Boolean);
    const arm = eq.find((e) => e.type === 'crossarm');
    open('Support');
    el('Nom', p.name || String(i + 1));
    el('NomComplet', [p.name || String(i + 1), item?.name].filter(Boolean).join(' '));
    el('X', fx(p.x * um, 3));
    el('Y', fx(p.y * um, 3));
    const g = r.groundZ ?? p.ground;
    if (fin(g)) el('Altitude', fx(g * um, 3));
    const total = p.h != null ? p.h * um + (item?.embed_m ?? 0) : item?.height_m;
    el('Hauteur', fx(total, 3));
    el('HSol', fx(r.aboveGround_m ?? (p.h != null ? p.h * um : null), 3));
    el('AngleDeriv', fx(turns[i], 4));
    el('Fonction', role === 'deadend' ? 'DA' : 'AS');
    el('Existant', boolv(p.existing));
    if (arm) el('Armement', arm.name);
    if (i < P.length - 1) el('Portee', fx(A?.spans?.[i]?.L_m ?? Math.hypot(P[i + 1].x - p.x, P[i + 1].y - p.y) * um, 3));
    const nc = secOf(i);
    if (nc != null) el('NumCanton', String(nc));
    if (item?.material && NATURE[item.material]) el('Nature', NATURE[item.material]);
    if (typeof item?.class === 'string' && item.class) el('Classe', item.class);
    const chosen = r.sizeOk === false ? get(r.suggest) : item;
    if (chosen) { el('SupportChoisi', chosen.name); el('FNomSupChoisi', daN(chosen.nominal_N)); }
    for (const c of cases) {
      const ld = r.loads?.[c.id];
      if (!ld) continue;
      open('ResultatHypo');
      el('NomHypo', caseName(c.id));
      el('VR', daN(ld.V)); el('HR', daN(ld.T)); el('LR', daN(ld.L));
      close('ResultatHypo');
    }
    if (r.foundation) {
      el('DimFouilleChoisi_a', fx(r.foundation.dia_m, 3));
      el('DimFouilleChoisi_b', fx(r.foundation.dia_m, 3));
      el('DimFouilleChoisi_h', fx(r.foundation.depth_m, 3));
    }
    close('Support');
  });

  const cond = get(line?.conductor);
  (A?.sections || []).forEach((S, si) => {
    const sv = S.solve?.ok ? S.solve : null;
    open('Canton');
    el('Nom', 'Canton no ' + (si + 1));   // i18n-ignore: the file format's own words
    el('NbFils', String(Math.max(1, (line.phases || 1) * (line.circuits || 1))));
    el('TensionElec', fx((line.voltage_kV || 0) * 1000, 3));
    el('Conducteur', cond?.name || line.conductor || '', true);
    el('Zone', R.name || '', true);
    if (sv) {
      el('TempInitiale', fx(sv.ref.temp, 1));
      el('TensionIni', daN(sv.ref.H));
      el('Parametre', fx(sv.ref.H / sv.ref.w, 3));
    }
    el('NbSupports', String(S.to - S.from + 1));
    el('IdPremierSupport', String(S.from + 1));
    el('IdDernierSupport', String(S.to + 1));
    el('Porteq', fx(S.Lr, 3));
    open('Portees');
    for (const sp of S.spans || []) el('Portee', fx(sp.L, 3));
    close('Portees');
    if (sv) for (const c of cases) {
      const rc = sv.cases[c.id];
      if (!rc) continue;
      open('Hypothese');
      el('NomHypo', caseName(c.id));
      el('TenMax', daN(rc.Tmax));
      close('Hypothese');
    }
    for (const row of S.stringing || []) {
      open('TabPose');
      el('LongCable', fx(row.length, 3));
      el('TenHor', daN(row.H));
      el('TenGauche', daN(row.spans[0]?.Tleft));
      el('TenDroite', daN(row.spans[row.spans.length - 1]?.Tright));
      open('Fleches');
      for (const s of row.spans) el('Fleche', fx(s.sag, 3));
      for (const s of row.spans) el('LongueurChainette', fx(s.length, 3));
      close('Fleches');
      close('TabPose');
    }
    close('Canton');
  });
  close('Etude');
  return out.join(NL) + NL;
}

export function donBytes(xml) {
  const s = String(xml ?? '');
  const out = new Uint8Array(s.length);
  let n = 0;
  for (const ch of s) { const c = ch.codePointAt(0); out[n++] = c <= 0xff ? c : 0x3f; }
  return out.slice(0, n);
}

// ---------------------------------------------------------------------------------------------------------------- a tolerant XML reader
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const NAME0 = /[A-Za-z_]/;

function decode(s, notes) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#[xX][0-9a-fA-F]{1,6}|#[0-9]{1,7}|[A-Za-z_][\w.-]{0,31});/g, (m, e) => {
    if (e[0] === '#') {
      const c = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return c > 0 && c <= 0x10ffff && !(c >= 0xd800 && c <= 0xdfff) ? String.fromCodePoint(c) : '';
    }
    if (NAMED[e]) return NAMED[e];
    notes.entity = true;
    return '';
  });
}

const node = (name) => ({ name, l: name.toLowerCase(), attrs: Object.create(null), kids: [], text: '' });

function parseXml(text, notes) {
  const doc = node('#doc'), stack = [doc], n = text.length;
  let i = 0, count = 0, skip = 0;
  const addText = (s) => { if (skip) return; const top = stack[stack.length - 1]; if (top.text.length < LIM.text) top.text += s.slice(0, LIM.text - top.text.length); };
  while (i < n) {
    const lt = text.indexOf('<', i);
    if (lt < 0) { addText(decode(text.slice(i, i + LIM.text), notes)); break; }
    if (lt > i) addText(decode(text.slice(i, Math.min(lt, i + LIM.text)), notes));
    if (text.startsWith('<!--', lt)) { const e = text.indexOf('-->', lt + 4); i = e < 0 ? n : e + 3; continue; }
    if (text.startsWith('<![CDATA[', lt)) { const e = text.indexOf(']]>', lt + 9); addText(text.slice(lt + 9, e < 0 ? n : e)); i = e < 0 ? n : e + 3; continue; }
    if (text.startsWith('<?', lt)) { const e = text.indexOf('?>', lt + 2); i = e < 0 ? n : e + 2; continue; }
    if (text.startsWith('<!', lt)) {   // DOCTYPE and declarations: skipped, never read (no entity of theirs is expanded)
      notes.doctype = true;
      let g = text.indexOf('>', lt);
      const b = text.indexOf('[', lt);
      if (b >= 0 && (g < 0 || b < g)) { const c = text.indexOf(']', b); g = c < 0 ? -1 : text.indexOf('>', c); }
      i = g < 0 ? n : g + 1;
      continue;
    }
    // a tag: find its end, refusing a '<' inside (malformed → the '<' is text) and a tag longer than LIM.tag
    let j = lt + 1, q = '';
    const isEnd = text[j] === '/';
    if (isEnd) j++;
    if (!NAME0.test(text[j] || '')) { addText('<'); i = lt + 1; continue; }
    const stop = Math.min(n, lt + LIM.tag);
    for (; j < stop; j++) {
      const c = text[j];
      if (c === '<') break;
      if (q) { if (c === q) q = ''; } else if (c === '"' || c === "'") q = c; else if (c === '>') break;
    }
    if (text[j] !== '>') { notes.malformed = true; addText('<'); i = lt + 1; continue; }
    const inner = text.slice(lt + (isEnd ? 2 : 1), j);
    i = j + 1;
    const name = /^[^\s/>]+/.exec(inner)[0];
    if (isEnd) {
      if (skip) { skip--; continue; }
      const l = name.toLowerCase();
      let k = stack.length - 1;
      while (k > 0 && stack[k].l !== l) k--;
      if (k > 0) { if (k < stack.length - 1) notes.unclosed = true; stack.length = k; } else notes.stray = true;
      continue;
    }
    const self = inner.endsWith('/');
    if (skip || stack.length > LIM.depth) { notes.deep = true; if (!self) skip++; continue; }
    if (++count > LIM.elements) { notes.toolarge = true; break; }
    const el = node(name);
    const re = /([^\s=/>"']+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>/]+)))?/g;
    re.lastIndex = name.length;
    let m;
    while ((m = re.exec(inner))) {
      const v = m[2] ?? m[3] ?? m[4];
      const k = m[1].toLowerCase();
      if (v != null && !(k in el.attrs)) el.attrs[k] = decode(v, notes);
    }
    stack[stack.length - 1].kids.push(el);
    if (!self) stack.push(el);
  }
  if (stack.length > 1) notes.unclosed = true;
  return doc;
}

// ---------------------------------------------------------------------------------------------------------------- reading the study
const clean = (s) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
const kid = (nd, name) => { const l = name.toLowerCase(); return nd.kids.find((k) => k.l === l) || null; };
const kidsOf = (nd, name) => { const l = name.toLowerCase(); return nd.kids.filter((k) => k.l === l); };
/** A field: a child element's text, else an attribute; null when absent. */
const field = (nd, name) => { const k = kid(nd, name); if (k) return clean(k.text); const a = nd.attrs[name.toLowerCase()]; return a != null ? clean(a) : null; };
function numOf(s) {
  if (s == null) return null;
  let t = String(s).replace(/\s+/g, '');
  if (/^[+-]?\d*,\d+$/.test(t)) t = t.replace(',', '.');
  if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d{1,3})?$/.test(t)) return null;
  const v = +t;
  return Number.isFinite(v) && Math.abs(v) < 1e12 ? v : null;
}
const numF = (nd, name) => numOf(field(nd, name));
const intF = (nd, name) => { const v = numF(nd, name); return v != null && Number.isInteger(v) ? v : v != null ? Math.round(v) : null; };
function boolOf(s) {
  if (s == null) return null;
  const t = s.toLowerCase();
  if (t === '-1' || t === '1' || t === 'true' || t === 'vrai' || t === 'yes' || t === 'oui') return true;
  if (t === '0' || t === 'false' || t === 'faux' || t === 'no' || t === 'non') return false;
  return null;
}
/** A list: repeated elements `item` (inside `nd`), else one value (the element, an attribute `item` or `alt`, or nd's own text)
 *  split — numbers on ";" or spaces (or "," when nothing else separates), names on ";" (or ","). */
function listOf(nd, item, conv = null, alt = null) {
  if (!nd) return [];
  const els = kidsOf(nd, item);
  const sep = conv ? /[;\s]/ : /;/;
  let raw;
  if (els.length > 1 || (els.length === 1 && !sep.test(clean(els[0].text)))) raw = els.map((e) => clean(e.text));
  else {
    const s = els.length ? els[0].text : nd.attrs[item.toLowerCase()] ?? (alt ? nd.attrs[alt.toLowerCase()] : null) ?? (nd.kids.length ? '' : nd.text);
    const t = clean(s);
    raw = !t ? [] : sep.test(t) ? t.split(conv ? /[;\s]+/ : /\s*;\s*/) : t.split(/\s*,\s*/);
  }
  return raw.slice(0, LIM.list).map(conv || ((x) => x)).filter((v) => v != null && v !== '');
}

function readSupport(nd, grades) {
  const ang = numF(nd, 'AngleDeriv');
  const fon = (field(nd, 'Fonction') || '').toUpperCase();
  const f = (k) => numF(nd, k);
  const fa = f('DimFouilleChoisi_a'), fb = f('DimFouilleChoisi_b'), fh = f('DimFouilleChoisi_h');
  return {
    name: field(nd, 'Nom') || '', fullName: field(nd, 'NomComplet') || '',
    x_m: f('X'), y_m: f('Y'), ground_m: f('Altitude'), height_m: f('Hauteur'), above_m: f('HSol'),
    angle_deg: ang != null ? (grades ? ang * 0.9 : ang) : null,
    fonction: fon, role: fon === 'DA' ? 'deadend' : 'suspension', existing: boolOf(field(nd, 'Existant')) === true,
    crossarm: field(nd, 'Armement') || '', span_m: f('Portee'), canton: intF(nd, 'NumCanton'),
    classe: field(nd, 'Classe') || '', nature: field(nd, 'Nature') || '',
    chosen: field(nd, 'SupportChoisi') || '', chosenNominal_daN: f('FNomSupChoisi'),
    foundation: fa != null || fh != null ? { a_m: fa, b_m: fb ?? fa, h_m: fh } : null,
    results: kidsOf(nd, 'ResultatHypo').slice(0, 100).map((r) => ({ caseName: field(r, 'NomHypo') || '', V_daN: numF(r, 'VR'), H_daN: numF(r, 'HR'), L_daN: numF(r, 'LR') })),
  };
}

function readCanton(nd) {
  const pose = kidsOf(nd, 'TabPose').slice(0, 200).map((t) => {
    const fl = kid(t, 'Fleches') || t;
    return { temp: numF(t, 'Temperature'), length_m: numF(t, 'LongCable'), H_daN: numF(t, 'TenHor'), left_daN: numF(t, 'TenGauche'), right_daN: numF(t, 'TenDroite'),
      sags_m: listOf(fl, 'Fleche', numOf), lengths_m: listOf(fl, 'LongueurChainette', numOf) };
  });
  return {
    name: field(nd, 'Nom') || '', wires: intF(nd, 'NbFils'), voltage_V: numF(nd, 'TensionElec'), conductor: field(nd, 'Conducteur') || '',
    zone: field(nd, 'Zone') || '', temp: numF(nd, 'TempInitiale'), tension_daN: numF(nd, 'TensionIni'), parameter_m: numF(nd, 'Parametre'),
    supportCount: intF(nd, 'NbSupports'), first: intF(nd, 'IdPremierSupport'), last: intF(nd, 'IdDernierSupport'), rulingSpan_m: numF(nd, 'Porteq'),
    spans_m: kid(nd, 'Portees') ? listOf(kid(nd, 'Portees'), 'Portee', numOf) : listOf({ kids: [], attrs: nd.attrs, text: '' }, 'Portees', numOf, 'Portee'),
    cases: kidsOf(nd, 'Hypothese').slice(0, 100).map((h) => ({ name: field(h, 'NomHypo') || clean(h.text), tenMax_daN: numF(h, 'TenMax') })),
    stringing: pose,
  };
}

export function readDon(text) {
  const res = { ok: false, meta: null, supports: [], cantons: [], notes: [] };
  try {
    if (typeof text !== 'string') { res.notes.push({ why: 'input' }); return res; }
    if (text.length > LIM.bytes) { res.notes.push({ why: 'toolarge', max: LIM.bytes }); return res; }
    const flags = {};
    const doc = parseXml(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text, flags);
    for (const k of Object.keys(flags)) res.notes.push({ why: k });
    // the first <Etude> breadth-first, at most four levels down (a file wrapped in another element still reads)
    let root = null;
    for (let lv = 0, q = [doc]; lv < 4 && q.length && !root; lv++) {
      root = q.flatMap((x) => x.kids).find((k) => k.l === 'etude') || null;
      q = q.flatMap((x) => x.kids).slice(0, 10000);
    }
    if (!root) { res.notes.push({ why: 'noroot' }); return res; }
    const grades = boolOf(field(root, 'UniteAngleGrade')) === true;
    const cases = kidsOf(root, 'Hypothese');
    res.meta = {
      version: field(root, 'Version') || '', description: field(root, 'Description') || '', project: field(root, 'NumeroAffaire') || '',
      step: intF(root, 'EtapeCalcul'),
      groups: (field(root, 'GroupeHypo') || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 100),
      temps: listOf(root, 'TemperatureReglage', numOf),
      cases: cases.length ? cases.slice(0, 100).map((h) => clean(h.text)).filter(Boolean) : listOf(root, 'Hypothese'),
      grades, ccw: boolOf(field(root, 'SensAngleTrigo')) !== false,
    };
    const S = kidsOf(root, 'Support'), C = kidsOf(root, 'Canton');
    if (S.length > LIM.supports) res.notes.push({ why: 'supports', max: LIM.supports, have: S.length });
    if (C.length > LIM.cantons) res.notes.push({ why: 'cantons', max: LIM.cantons, have: C.length });
    res.supports = S.slice(0, LIM.supports).map((nd) => readSupport(nd, grades));
    res.cantons = C.slice(0, LIM.cantons).map(readCanton);
    res.ok = true;
  } catch (e) {
    res.ok = false;
    res.notes.push({ why: 'error' });
  }
  return res;
}

// ---------------------------------------------------------------------------------------------------------------- into the project
export function donToState(read, units) {
  const um = unitM(units);
  const notes = [];
  const sups = Array.isArray(read?.supports) ? read.supports : [];
  const c0 = read?.cantons?.[0] || null;
  const okXY = (v) => fin(v) && Math.abs(v) < 1e9;
  const hints = [];
  const supports = [];
  sups.forEach((s, i) => {
    if (!okXY(s.x_m) || !okXY(s.y_m)) { notes.push({ why: 'nocoords', support: i + 1, name: s.name }); return; }
    const hm = fin(s.above_m) && s.above_m > 0 ? s.above_m : fin(s.height_m) && s.height_m > 0 ? s.height_m : null;
    supports.push({ id: null, x: s.x_m / um, y: s.y_m / um, name: clean(s.name || s.fullName).slice(0, 40), support: null, equip: [],
      role: s.role === 'deadend' ? 'deadend' : 'auto', ground: fin(s.ground_m) && Math.abs(s.ground_m) < 1e6 ? s.ground_m / um : null,
      h: hm != null && hm <= 1000 ? hm / um : null, existing: s.existing === true });
    hints.push({ crossarm: s.crossarm || '', chosen: s.chosen || '', nature: NATURE_BACK[(s.nature || '').toUpperCase()] || '' });
  });
  if (supports.length < 2) notes.push({ why: 'few', have: supports.length });
  const wires = c0?.wires;
  const line = {
    id: null, name: clean(read?.meta?.description || '').slice(0, 120) || '', conductor: null,   // the UI names an unnamed line after the file
    phases: fin(wires) && wires >= 1 && wires <= 12 ? wires : 3, circuits: 1,
    voltage_kV: fin(c0?.voltage_V) && c0.voltage_V >= 0 && c0.voltage_V <= 1.2e6 ? c0.voltage_V / 1000 : 0.4,
    equip: [], clearance: 'ground', supports,
  };
  if (!c0) notes.push({ why: 'nocanton' });
  return { line, conductor: c0?.conductor || '', hints, notes };
}
