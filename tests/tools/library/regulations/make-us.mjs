#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-us.mjs — the United States regulation packs for LibraryCraft (0.8 REG.1; owner 2026-10-27: "go big on pulling the USA regulations into
 * the library … source date too when possible"), made from the cited research in research/ (never typed by hand, never guessed):
 *
 *   research/irc-editions.json   the IRC editions 2015, 2018, 2021, 2024: the eight limits the checker uses, their sections (2024 renumbered
 *                                them), each edition's first-printing date, ICC's free viewer page
 *   research/states-*.json       per state (and DC): statewide or home rule, the IRC edition (or the state's own code) in force, the effective
 *                                date, the adopting authority and citation, the official source, the source document's date, amendments to the
 *                                eight limits, confidence
 *
 *   node tools/library/regulations/make-us.mjs [--check]     writes us/<pack-id>.json (+ us/REPORT.md); --check compares only
 *
 * Packs: us-irc-<year> (authority model-code, the base) and us-<st> (authority adopted-law, base = the IRC edition the state adopted, only the
 * rules the state changed). A state with no statewide residential code, or whose edition could not be confirmed, gets NO pack — it is listed
 * in REPORT.md with why. Review state: draft (entered from the cited source, not reviewed by a professional); low confidence → unchecked.
 * Numbers, units and section numbers only — never the codes' text. bin/library-import-regulations.php publishes the files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'us');
const IN = 25.4;
const CHECKED = '2026-10-27';
const check = process.argv.includes('--check');
const R = await import(path.join(HERE, '../../../public_html/assets/apps/bimcraft/dev/addons/regs/lib/regs.js'));

const eds = JSON.parse(fs.readFileSync(path.join(HERE, 'research/irc-editions.json'), 'utf8'));
const states = fs.readdirSync(path.join(HERE, 'research')).filter((f) => /^states-.*\.json$/.test(f)).sort()
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(HERE, 'research', f), 'utf8')));

const LABEL = {
  'stair.riser.max': 'Riser height', 'stair.tread.min': 'Tread depth', 'stair.width.min': 'Stair width', 'stair.headroom.min': 'Stair headroom',
  'stair.rail.height': 'Handrail height', 'room.ceiling.min': 'Ceiling height', 'room.light.min': 'Glazing, share of floor area',
  'room.vent.min': 'Openable area, share of floor area',
  'room.area.min': 'Habitable room floor area', 'room.dim.min': 'Habitable room least dimension', 'hall.width.min': 'Hallway width',
  'door.egress.width.min': 'Egress door clear width', 'door.egress.height.min': 'Egress door clear height',
  'escape.area.min': 'Escape opening net clear area', 'escape.width.min': 'Escape opening clear width', 'escape.height.min': 'Escape opening clear height',
  'escape.sill.max': 'Escape opening sill height',
  'elec.wall.spacing.max': 'Wall outlets: farthest point from an outlet', 'elec.light.room.min': 'Switched lighting outlet', 'elec.bath.outlet.min': 'Bathroom outlet',
  'elec.laundry.outlet.min': 'Laundry outlet', 'elec.garage.outlet.min': 'Garage outlet', 'elec.hall.outlet.min': 'Hallway outlet (halls 10 ft or longer)',
  'elec.outdoor.outlet.min': 'Outdoor outlets (front and back)', 'alarm.smoke.bedroom.min': 'Smoke alarm in each sleeping room', 'alarm.smoke.story.min': 'Smoke alarm on each story',
  'found.footing.depth.min': 'Footing depth below grade', 'found.footing.width.min': 'Footing width', 'found.footing.thick.min': 'Footing thickness', 'found.slab.thick.min': 'Slab thickness',
  'frame.stud.spacing.max': 'Wall stud spacing', 'frame.stud.height.max': 'Wall stud height', 'frame.header.span.max': 'Header span', 'frame.joist.span.max': 'Floor joist span',
  'frame.rafter.span.max': 'Rafter span', 'frame.ceilingjoist.span.max': 'Ceiling joist span',
  'energy.wall.r.min': 'Exterior wall insulation R-value', 'energy.roof.r.min': 'Roof or ceiling insulation R-value', 'energy.window.u.max': 'Window U-factor',
};
const NOTE = {
  'room.ceiling.min': 'Simplified: the code has exceptions for beams, sloped ceilings and basements.',
  'room.light.min': 'Simplified: lighting by artificial means is allowed in some rooms.',
  'room.vent.min': 'Simplified: mechanical ventilation is allowed instead.',
  'room.area.min': 'Every habitable room; kitchens are exempt. Floor under ceilings lower than 5 ft (sloped) or 7 ft (furred) does not count.',
  'room.dim.min': 'In any horizontal direction; kitchens are exempt.',
  'door.egress.width.min': 'One side-hinged egress door per dwelling unit; clear width with the door open 90 degrees (the checker estimates it as the leaf width less 2 in).',
  'door.egress.height.min': 'Clear height from the top of the threshold to the bottom of the stop.',
  'escape.area.min': 'Every sleeping room (and basements, habitable attics). Grade-floor openings may be 5.0 sq ft. The checker estimates the clear opening from the window type.',
  'escape.width.min': 'Net clear opening width.', 'escape.height.min': 'Net clear opening height.',
  'escape.sill.max': 'Measured from the floor to the bottom of the clear opening.',
  'elec.wall.spacing.max': 'Measured along the floor line in each wall space 2 ft or wider, unbroken by doorways; kitchens, living, dining, family rooms, bedrooms and similar rooms.',
  'elec.bath.outlet.min': 'The code asks for one within 36 in of each basin; the checker counts outlets in the bathroom.',
  'elec.outdoor.outlet.min': 'One at the front and one at the back, no higher than 6 ft 6 in above grade; the checker counts outlets outside the rooms.',
  'elec.garage.outlet.min': 'One per vehicle bay.',
  'alarm.smoke.story.min': 'Each story including basements; also outside each sleeping area.',
  'found.footing.depth.min': 'Exterior footings, below undisturbed ground; at least the frost depth where the place gives one (R403.1.4.1). The checker takes the footing bottom less 6 in for the floor above grade.',
  'found.footing.width.min': 'At least 12 in; the size table for the loads, stories and soil (1500 psf presumed) can ask for more.',
  'found.footing.thick.min': 'At least 6 in; the size table can ask for more.',
  'found.slab.thick.min': 'Concrete floor slabs on ground.',
  'frame.stud.spacing.max': 'From Table R602.3(5) by stud size and what the wall carries; the checker takes exterior walls as bearing.',
  'frame.joist.span.max': 'From Table R502.3.1(2) (40 psf live load, living areas; sleeping areas may use the 30 psf table) by joist size and spacing, No. 2 lumber; the species is not recorded, so the lowest span of the four species is asked; the value shown is the table\'s largest span. Engineered (TJI) joists follow the maker\'s tables and are not checked.',
  'frame.stud.height.max': 'Height between lateral supports, from Table R602.3(5) by stud size.',
  'frame.rafter.span.max': 'Table R802.4.1(1), 20 psf roof live, ceiling not attached, lowest species. Span = horizontal projection (sloped length x cos pitch). Not judged where ground snow is over 20 psf or the roof is trusses.',
  'frame.ceilingjoist.span.max': 'From Table R802.5.1(1) (uninhabitable attic without storage, 10 psf live) by joist size and spacing, No. 2 lumber, lowest of the species; the value shown is the table\'s largest span.',
  'energy.wall.r.min': 'By climate zone (from the place criteria). Compares the insulation layers of each exterior wall type (nominal R) with the cavity and continuous options; no insulation layer is a note, not a pass.',
  'energy.roof.r.min': 'Ceiling R-value by climate zone. The model records no roof insulation yet: shown as a note where the building has a roof.',
  'energy.window.u.max': 'Fenestration U-factor by climate zone. Windows carry no U-factor in the model yet: shown as a note where the building has windows.',
  'frame.header.span.max': 'From Table R602.7(1) (exterior bearing walls) by header plies and size, building width, floors above and ground snow load (30 psf column at least); the value shown is the table\'s largest span. The checker takes the clear span as the header length less 3 in.',
};
const mm = (inch) => Math.round(inch * IN * 100) / 100;
const firstDate = (s) => { const m = /\b(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?\b/.exec(String(s || '')); return m ? [m[1], m[2], m[3]].filter(Boolean).join('-') : ''; };
const fullDate = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(String(s || '').trim().slice(0, 10)) ? String(s).trim().slice(0, 10) : null);
const cut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };

// ---- the IRC base packs ----
const packs = [];
// tier 3: footing size tables and wall framing tables (research/irc-foundations.json, irc-wall-framing.json; 2021 and 2024 are identical)
const fnd = JSON.parse(fs.readFileSync(path.join(HERE, 'research/irc-foundations.json'), 'utf8')).editions;
const wf = JSON.parse(fs.readFileSync(path.join(HERE, 'research/irc-wall-framing.json'), 'utf8')).editions;
const se = JSON.parse(fs.readFileSync(path.join(HERE, 'research/irc-spans-energy.json'), 'utf8'));
const maxSpan = (t) => (t ? Math.max(0, ...t.rows.flatMap((r) => Object.values(r.spans)).map((x) => { const m = /^(\d+)-(\d+)/.exec(x); return m ? +m[1] * 12 + +m[2] : 0; })) : 0);
// energy rules: the value is the strictest the table asks anywhere (R for walls and roofs, U for windows); the checker reads the zone's own cell
const energyRules = (en) => {
  if (!en) return [];
  const z = Object.values(en.zones || {}), clause = en.irc_id.replace(/^IRC \d+ /, 'Table ');
  const maxR = (k) => Math.max(0, ...z.map((c) => Math.max(0, ...String(c[k] || '').split(/\s+or\s+/i).map((o) => { const m = /^(\d+(?:\.\d+)?)(?:&(\d+(?:\.\d+)?)ci)?$/i.exec(o.trim()); return m ? +m[1] + (m[2] ? +m[2] : 0) : 0; }))));
  const minU = Math.min(...z.map((c) => parseFloat(c.fenestration_u)).filter((x) => x > 0));
  const mk = (id, applies, op, value, unit) => ({ id, applies, op, value, unit, clause: 'N1102.1.3', label: LABEL[id], note: NOTE[id] });
  return [mk('energy.wall.r.min', 'wall', '>=', maxR('wood_wall_r'), 'r'), mk('energy.roof.r.min', 'roof', '>=', maxR('ceiling_r'), 'r'), ...(Number.isFinite(minU) ? [mk('energy.window.u.max', 'window', '<=', minU, 'u')] : [])];
};
const tier3 = (edition) => {
  const f = fnd[edition], w = wf[edition];
  if (!f || !w) return null;
  const w21 = wf['IRC 2021'], pick = (k) => (w[k]?.identical_to ? w21[k] : w[k]);
  const tables = {};
  for (const t of f.footing_tables) tables[t.id.replace(/^Table /, '')] = { kind: 'footing', clause: t.id, label: 'Footing width x thickness (in), ' + t.construction, note: 'Rows: load (20 = 20 psf roof live or 25 psf ground snow), stories, foundation; columns: soil bearing psf.', data: { construction: t.construction, columns_psf: t.columns_psf, rows: t.rows } };
  const st = pick('stud_table'), he = pick('header_ext_table');
  tables['R602.3(5)'] = { kind: 'stud', clause: 'Table R602.3(5)', label: 'Wood stud size, height and spacing', note: 'Rows: ' + st.columns.join(', ') + ' (feet / inches; null = not permitted).', data: { columns: st.columns, rows: st.rows } };
  tables['R602.7(1)'] = { kind: 'header', clause: 'Table R602.7(1)', label: 'Header spans, exterior bearing walls', note: 'Cells: span ft-in / jack studs, by ground snow load column and building width (ft).', data: { species: he.species, rows: he.rows } };
  const sp = se.spans[edition], en = se.energy[edition.replace('IRC', 'IECC')];
  const spanTable = (kind, t, label) => { tables[t.id.replace(/^Table /, '')] = { kind, clause: t.id, label, note: 'Spans ft-in by spacing (in), No. 2 lumber; ">26-0" = over 26 ft. ' + [t.live_psf && t.live_psf + ' psf live', t.roof_live_psf && t.roof_live_psf + ' psf roof live', t.dead_psf + ' psf dead', t.deflection].filter(Boolean).join(', ') + '.', data: { live_psf: t.live_psf ?? t.roof_live_psf, dead_psf: t.dead_psf, deflection: t.deflection, rows: t.rows } }; };
  if (sp) { spanTable('joist', sp.floor_40psf, 'Floor joist spans, 40 psf living areas'); spanTable('ceiling-joist', sp.ceiling, 'Ceiling joist spans, uninhabitable attic without storage'); spanTable('rafter', sp.rafter, 'Rafter spans, 20 psf roof live load, ceiling not attached'); }
  if (en) tables['N1102.1.3'] = { kind: 'energy', clause: en.irc_id.replace(/^IRC \d+ /, ''), label: 'Insulation and fenestration by climate zone (prescriptive)', note: 'Same values as ' + en.id.replace('Table', 'IECC Table') + '. R-values as printed (cavity & continuous); local adoptions often amend this table.', data: { zones: en.zones } };
  const js = sp ? sp.floor_40psf.rows.flatMap((r) => Object.values(r.spans)).map((x) => { const m = /^(\d+)-(\d+)/.exec(x); return m ? +m[1] * 12 + +m[2] : 0; }) : [];
  const spans = he.rows.flatMap((r) => Object.values(r.cells).flatMap((c) => Object.values(c))).map((x) => { const m = /^(\d+)-(\d+)/.exec(x); return m ? +m[1] * 12 + +m[2] : 0; });
  const r = (id, op, inch, clause) => ({ id, applies: id.startsWith('frame.header') ? 'header' : id.startsWith('frame.joist') ? 'floor' : /^frame\.(rafter|ceilingjoist)/.test(id) ? 'roof' : id.startsWith('frame') ? 'wall' : 'foundation', op, value: mm(inch), unit: 'mm', clause, label: LABEL[id], note: NOTE[id] });
  return { tables, rules: [r('found.footing.depth.min', '>=', 12, 'R403.1.4'), r('found.footing.width.min', '>=', 12, 'R403.1.1'), r('found.footing.thick.min', '>=', 6, 'R403.1.1'), r('found.slab.thick.min', '>=', 3.5, 'R506.1'),
    r('frame.stud.spacing.max', '<=', 24, 'Table R602.3(5)'), r('frame.stud.height.max', '<=', 120, 'Table R602.3(5)'), r('frame.header.span.max', '<=', Math.max(...spans), 'Table R602.7(1)'), ...(js.length ? [r('frame.joist.span.max', '<=', Math.max(...js), 'Table R502.3.1(2)')] : []),
    ...(maxSpan(sp?.rafter) ? [r('frame.rafter.span.max', '<=', maxSpan(sp.rafter), 'Table R802.4.1(1)')] : []), ...(maxSpan(sp?.ceiling) ? [r('frame.ceilingjoist.span.max', '<=', maxSpan(sp.ceiling), 'Table R802.5.1(1)')] : []),
    ...energyRules(en)] };
};
for (const e of eds.editions) {
  const v = eds.values, c = e.clauses;
  const rule = (id) => {
    const x = v[id], base = { id, applies: id.startsWith('stair') ? 'stair' : 'room', clause: c[id], label: LABEL[id], ...(NOTE[id] ? { note: NOTE[id] } : {}) };
    if (id === 'stair.rail.height') return { ...base, op: 'between', min: mm(x.min_in), max: mm(x.max_in), unit: 'mm' };
    if (x.pct !== undefined) return { ...base, op: '>=', value: x.pct, unit: 'pct' };
    if (x.sqft !== undefined) return { ...base, op: '>=', value: Math.round(x.sqft * 0.09290304 * 10000) / 10000, unit: 'm2' };
    if (x.count !== undefined) return { ...base, op: '>=', value: x.count, unit: 'count' };
    return { ...base, op: id.endsWith('.max') ? '<=' : '>=', value: mm(x.in), unit: 'mm' };
  };
  packs.push({
    format: 'cadcraft-regulation-pack', version: 1, id: e.id, name: 'United States: International Residential Code ' + e.edition.slice(4),
    jurisdiction: { country: 'US', level: 'country', name: 'United States' }, base: null, edition: e.edition, in_force: null,
    authority: 'model-code',
    review: { state: 'draft', note: cut('The model code: numbers and section numbers entered from the ' + e.edition + ' text in ICC\'s free viewer, checked ' + CHECKED + '. A model code is not law until a state or city adopts it; pick your state\'s pack to check against what applies there.' + (e.note ? ' ' + e.note : ''), 400) },
    source: { name: 'International Code Council, ' + e.edition.replace('IRC', 'International Residential Code'), url: e.viewer_url, date: e.published, checked: CHECKED },
    rules: Object.keys(LABEL).filter((id) => c[id]).map(rule),   // an edition only carries the rules researched for it
  });
  const t3 = tier3(e.edition);
  if (t3) { const p = packs[packs.length - 1]; p.tables = t3.tables; p.rules.push(...t3.rules.filter((x) => !p.rules.some((y) => y.id === x.id))); }
}

// ---- the state packs ----
const parseLen = (s) => {   // "8 1/4 in", "8.25 in", "6 ft 8 in", "36 inches", "2032 mm" → mm
  const t = String(s || '').toLowerCase().replace(/inches|inch|"/g, ' in').replace(/feet|foot|'/g, ' ft');
  let m, inch = 0, any = false;   // the codes are written in inches: read them first; mm only when no inches are given
  m = /(\d+(?:\.\d+)?)\s*ft/.exec(t); if (m) { inch += +m[1] * 12; any = true; }
  m = /(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+))?\s*in/.exec(t); if (m) { inch += +m[1] + (m[2] ? +m[2] / +m[3] : 0); any = true; }
  if (any) return mm(inch);
  m = /([\d.]+)\s*mm/.exec(t);
  return m ? +m[1] : null;
};
const report = [], skipped = [];
const ED = new Map(eds.editions.map((e) => [e.edition.slice(4), e]));
for (const st of states) {
  const code = String(st.code || '').toUpperCase(), cc = code.split('-')[1];
  const m = st.own_code ? ['', null] : /\bIRC (2015|2018|2021|2024)\b/.exec(String(st.base_code || ''));
  const why = !st.statewide ? 'no statewide residential code (cities and counties adopt their own)' : !m || (!st.own_code && /not confirmed/i.test(st.base_code)) ? 'the edition in force could not be confirmed: ' + cut(st.base_code, 160) : !/^https:\/\//.test(String(st.source_url || '')) ? 'no official https source found' : '';
  if (why) { skipped.push({ st, why }); continue; }
  const e = st.own_code ? { id: null, edition: cut(st.state_code_name, 40), clauses: {} } : ED.get(m[1]);
  const rules = [], amendNotes = [];
  for (const a of st.amendments || []) {
    const id = a.rule;
    if (!LABEL[id]) { amendNotes.push('not used by the checker: ' + cut(JSON.stringify(a), 80)); continue; }
    if (a.skip) { amendNotes.push(LABEL[id].toLowerCase() + ' left out: ' + cut(a.skip, 160)); continue; }
    if (a.remove) { rules.push({ id, remove: true, note: cut(a.note || 'Not required in this state.', 300) }); continue; }
    const clause = cut(a.section || e.clauses[id], 40);
    if (id === 'stair.rail.height') {
      const nums = String(a.value).match(/(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?)/g) || [];
      const [lo, hi] = nums.map((n) => parseLen(n + ' in'));
      if (lo && hi) rules.push({ id, applies: 'stair', op: 'between', min: lo, max: hi, unit: 'mm', clause, label: LABEL[id], note: st.own_code ? cut(a.note || '', 300) : 'State amendment.' });
      else amendNotes.push('could not read the amended handrail height "' + cut(a.value, 40) + '"');
      continue;
    }
    if (id === 'room.light.min' || id === 'room.vent.min') {
      const p = /([\d.]+)\s*%/.exec(String(a.value));
      if (p) rules.push({ id, applies: 'room', op: '>=', value: +p[1], unit: 'pct', clause, label: LABEL[id], note: st.own_code ? cut(a.note || '', 300) : 'State amendment.' });
      else amendNotes.push('could not read "' + cut(a.value, 40) + '"');
      continue;
    }
    const v = parseLen(a.value);
    if (v) rules.push({ id, applies: id.startsWith('stair') ? 'stair' : 'room', op: id.endsWith('.max') ? '<=' : '>=', value: v, unit: 'mm', clause, label: LABEL[id], note: st.own_code ? cut(a.note || '', 300) : 'State amendment.' });
    else amendNotes.push('could not read "' + cut(a.value, 40) + '"');
  }
  // an "amendment" that restates the IRC's own number is not a state change: leave it out (the base already has it)
  for (let i = rules.length - 1; i >= 0; i--) {
    const r = rules[i], v = eds.values[r.id];
    if (st.own_code || r.remove) continue;   // a code of its own has every number itself; a removal is always a change
    const same = r.op === 'between' ? Math.abs(r.min - mm(v.min_in)) < 0.6 && Math.abs(r.max - mm(v.max_in)) < 0.6 : v.pct !== undefined ? r.value === v.pct : Math.abs(r.value - mm(v.in)) < 0.6;
    if (same) { amendNotes.push(LABEL[r.id].toLowerCase() + ': the state text restates the IRC value; not a change'); rules.splice(i, 1); }
  }
  const name = st.state + ': ' + cut(st.state_code_name && !/not applicable/i.test(st.state_code_name) ? st.state_code_name : 'residential code (' + e.edition + ')', 100);
  const amendText = st.own_code ? '' : st.amendments_unconfirmed ? 'State amendments to the checked rules could not be checked: the pack has only the base code\'s numbers.' : rules.length ? 'State amendments to the checked rules: ' + rules.map((r) => LABEL[r.id].toLowerCase()).join(', ') + '.' : 'No state amendment to the eight checked rules was found in the sources read (the full state text was not reviewed).';
  const pack = {
    format: 'cadcraft-regulation-pack', version: 1, id: 'us-' + cc.toLowerCase(), name: cut(name, 120),
    jurisdiction: { country: 'US', level: 'state', region: code, name: st.state }, base: e.id,
    edition: cut(st.own_code ? st.state_code_name : e.edition + ' as adopted' + (st.effective_date && firstDate(st.effective_date) ? ', ' + firstDate(st.effective_date) : ''), 40),
    in_force: fullDate(st.effective_date), authority: 'adopted-law',
    review: { state: st.confidence === 'low' ? 'unchecked' : 'draft', note: cut((st.own_code ? 'The state\'s own code, not based on the IRC: every number is its own' : 'Adopts ' + e.edition) + (st.scope_note ? ' ' + st.scope_note : '') + ' (' + cut(st.adopting_authority, 120) + '; ' + cut(st.citation, 100) + '). ' + amendText + (st.own_code ? '' : ' Amendments were researched for stairs, ceiling height, light and ventilation only; every other rule (room size, egress, escape openings, electrical, alarms) is the base code\'s.') + ' Entered ' + CHECKED + ' (research confidence: ' + (st.confidence || 'not stated') + '); not yet reviewed by a professional.', 400) },
    source: { name: cut((st.adopting_authority || st.state) + (st.citation && !/not confirmed/i.test(st.citation) ? ', ' + st.citation : ''), 120), url: st.source_url, date: /checked|accessed|retrieved/i.test(String(st.source_date || '').split(/[;,]/)[0]) ? '' : firstDate(st.source_date), checked: CHECKED },
    rules,
  };
  packs.push(pack);
  report.push({ st, pack, amendNotes });
}

// ---- city packs (research/cities-*.json): a city on the IRC (base = the edition, only its changes) or with a code of its own ----
const cities = fs.readdirSync(path.join(HERE, 'research')).filter((f) => /^cities-.*\.json$/.test(f)).sort()
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(HERE, 'research', f), 'utf8')));
for (const c of cities) {
  const m = c.irc_based ? /\bIRC (2015|2018|2021|2024)\b/.exec(String(c.base_code || '')) : null;
  if (c.base_pack && !packs.some((x) => x.id === c.base_pack)) { skipped.push({ st: { state: c.city + ', ' + c.state }, why: 'its state pack ' + c.base_pack + ' does not exist' }); continue; }
  if (c.irc_based && !m) { skipped.push({ st: { state: c.city + ', ' + c.state }, why: 'the edition in force could not be confirmed' }); continue; }
  const e = m ? ED.get(m[1]) : null;
  const rules = [];
  for (const a of c.amendments || []) {
    const id = a.rule;
    if (id === 'stair.rail.height') { const n = String(a.value).match(/\d+(?:\.\d+)?/g) || []; if (n.length >= 2) rules.push({ id, applies: 'stair', op: 'between', min: mm(+n[0]), max: mm(+n[1]), unit: 'mm', clause: cut(a.section, 40), label: LABEL[id], note: cut(a.note || '', 300) }); continue; }
    if (id === 'room.light.min' || id === 'room.vent.min') { const p = /([\d.]+)\s*%/.exec(String(a.value)); if (p) rules.push({ id, applies: 'room', op: '>=', value: +p[1], unit: 'pct', clause: cut(a.section, 40), label: LABEL[id], note: cut(a.note || '', 300) }); continue; }
    const v = parseLen(a.value);
    if (v) rules.push({ id, applies: id.startsWith('stair') ? 'stair' : 'room', op: id.endsWith('.max') ? '<=' : '>=', value: v, unit: 'mm', clause: cut(a.section, 40), label: LABEL[id], note: cut(a.note || '', 300) });
  }
  packs.push({
    format: 'cadcraft-regulation-pack', version: 1, id: c.id, name: cut(c.city + ': ' + c.code_name, 120),
    jurisdiction: { country: 'US', level: 'city', region: c.code, name: c.city }, base: c.base_pack || (e ? e.id : null),
    edition: cut(c.base_pack ? c.code_name : e ? e.edition + ' as adopted' + (firstDate(c.effective_date) ? ', ' + firstDate(c.effective_date) : '') : c.base_code, 40), in_force: fullDate(c.effective_date), authority: 'adopted-law',
    review: { state: c.confidence === 'low' ? 'unchecked' : 'draft', note: cut((c.base_pack ? 'The ' + c.state + ' state pack for this city' : e ? 'Adopts ' + e.edition : 'The city\'s own code, not based on the IRC') + (c.scope_note ? ' ' + c.scope_note : '') + ' (' + cut(c.adopting_authority, 100) + '; ' + cut(c.citation, 80) + '). ' + (e && !rules.length && !c.base_pack && !/not researched/.test(c.scope_note || '') ? 'No city change to the eight checked rules in the text read. ' : '') + 'Entered from the cited source on ' + CHECKED + ' (research confidence: ' + c.confidence + '); not yet reviewed by a professional.', 400) },
    source: { name: cut(c.adopting_authority + ', ' + c.citation, 120), url: c.source_url, date: firstDate(c.source_date), checked: CHECKED },
    rules,
  });
}

// ---- design criteria (research/criteria-*.json): the building department's IRC Table R301.2(1) values, attached to the place's pack ----
const crit = fs.readdirSync(path.join(HERE, 'research')).filter((f) => /^criteria-.*\.json$/.test(f)).sort()
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(HERE, 'research', f), 'utf8')));
for (const c of crit) {
  const p = packs.find((x) => x.id === c.pack);
  if (!p) { console.error('  ? criteria for ' + c.pack + ': no such pack'); continue; }
  p.criteria = c.criteria;
  p.review.note = cut(p.review.note.replace(/ Entered /, ' Design criteria from ' + c.source_url.replace(/^https:\/\//, '').split('/')[0] + ' (' + c.source_date + '). Entered '), 400);
}

// ---- write (each pack checked by the add-on's own validator first) ----
fs.mkdirSync(OUT, { recursive: true });
let bad = 0, changed = 0;
const want = new Set();
for (const p of packs) {
  const r = R.cleanPack(p);
  if (!r.ok) { bad++; console.error('  ! ' + p.id + ': ' + r.errors.join('; ')); continue; }
  const file = path.join(OUT, p.id + '.json'), text = JSON.stringify(r.pack, null, 2) + '\n';
  want.add(path.basename(file));
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (old === text) continue;
  changed++;
  if (check) console.log('  ~ ' + p.id + (old ? ' differs' : ' missing'));
  else fs.writeFileSync(file, text);
}
const md = ['# United States regulation packs — report', '', 'Made by `make-us.mjs` from `research/` on ' + CHECKED + '. Numbers and section numbers only, never the codes\' text. Every state pack is **draft** (entered from the cited source, not reviewed by a professional) or **not checked** (low research confidence).', '',
  '## Packs (' + packs.length + ')', '', '| Pack | Base | In force | Source date | Authority | Amended rules | Review |', '|---|---|---|---|---|---|---|',
  ...packs.map((p) => '| `' + p.id + '` ' + p.name + ' | ' + (p.base || '—') + ' | ' + (p.in_force || '—') + ' | ' + (p.source.date || '—') + ' | ' + p.authority + ' | ' + (p.base ? p.rules.length : '—') + ' | ' + p.review.state + ' |'),
  '', '## No pack (' + skipped.length + ')', '', '| State | Why |', '|---|---|', ...skipped.map(({ st, why }) => '| ' + st.state + ' | ' + why + ' |'),
  '', '## Amendments the checker could not use', '', ...(() => { const l = report.flatMap(({ pack, amendNotes }) => amendNotes.map((n) => '- `' + pack.id + '`: ' + n)); return l.length ? l : ['(none)']; })(), ''].join('\n');
const mdFile = path.join(OUT, 'REPORT.md');
if (!check) fs.writeFileSync(mdFile, md);
console.log((check ? 'checked ' : 'wrote ') + packs.length + ' packs (' + changed + ' changed), ' + skipped.length + ' states without a pack, ' + bad + ' refused');
process.exit(bad || (check && changed) ? 1 : 0);
