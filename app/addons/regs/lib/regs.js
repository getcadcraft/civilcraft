/* SPDX-License-Identifier: Apache-2.0 */
/**
 * regs.js — regulation packs (0.8 REG.1, owner 2026-10-25; the `regs` add-on): building regulations as DATA, by jurisdiction, so a rule is
 * changed by a new pack version and not by a new release of the app. DOM-free and import-free: bin/test-regs.mjs runs it in
 * Node; main.js, check.js and active.js use it. docs/0.8-ZA-STANDARDS.md § 1a is the design.
 *
 *   FORMAT · FORMAT_VERSION · LEVELS · REVIEW_STATES · RULES (the rule ids the apps understand)
 *   cleanPack(raw) → { ok, pack, errors[] }      a pack read from a file or the library is untrusted: only known fields, bounded
 *   resolve(packs, id) → profile | null          follows `base` (country → state → county → city), later packs add, change or
 *                                                remove (`"remove": true`) a rule; a cycle or a missing base → null
 *   profile = { id, name, chain: [pack…], review: { state, note }, edition, rules: Map(id → rule + from), rule(id), list() }
 *   stairLimitsFrom(profile) → { riserMax, treadMin, widthMin, headroom, railMin, railMax }   mm; null where the pack is silent
 *   ruleBounds(rule) → { min, max }              the rule as limits (a value with <= is a max, with >= a min)
 *   strictest(profiles) → profile                several profiles as one, the tightest limit of each rule winning (id 'strict')
 *
 * Optional pack fields: authority (AUTHORITIES: adopted-law = the rules in force in a place, sourced to the act or rule that adopts them;
 * government; model-code = e.g. the IRC before a place adopts it; professional; community), source.date (when the source document was
 * issued: 2021, 2021-03 or 2021-03-15) and source.checked (when we last checked it, YYYY-MM-DD), maker { name } (who made it, when not
 * the standard's body) and price { amount, currency, url } — a paid pack;
 * the app shows the price and links to the maker's page (no checkout yet, owner 2026-10-26).
 *
 * A pack holds numbers, units, clause numbers and short labels of our own: never the standard's text (SABS, ICC and others sell
 * it) and never code. review.state says how far the numbers can be trusted: 'unchecked' (not confirmed against the standard),
 * 'draft' (entered from the published code, awaiting a professional's review), 'reviewed'.
 */
export const FORMAT = 'cadcraft-regulation-pack';
export const FORMAT_VERSION = 1;
export const LEVELS = ['country', 'state', 'county', 'city'];
export const REVIEW_STATES = ['unchecked', 'draft', 'reviewed'];   // weakest first
export const UNITS = ['mm', 'pct', 'm2', 'count', 'r', 'u', 'ratio'];        // pct = percent of the room's floor area; m2 = square metres; count = how many; r = R-value (h·ft²·°F/Btu); u = U-factor (Btu/h·ft²·°F); ratio = a plain multiple (a bolt edge distance in hole diameters, a road's K value)
export const OPS = ['<=', '>=', 'between'];
/** How authoritative a pack is (owner 2026-10-26: every level allowed, each tracked; people choose which levels apply), highest first. */
export const AUTHORITIES = ['adopted-law', 'government', 'model-code', 'professional', 'community'];
const DATE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;   // 2021, 2021-03 or 2021-03-15
/** The jurisdiction's climatic and geographic design criteria (IRC Table R301.2(1), set by each building department; owner 2026-10-27: the
 *  drawing should get through plan review): published text, plus a number where a check uses one. Inherited down the chain like rules. */
export const CRITERIA = ['ground_snow_load', 'wind_speed', 'wind_topographic', 'special_wind_region', 'windborne_debris', 'seismic_category', 'weathering',
  'frost_depth', 'termite', 'winter_design_temp', 'ice_barrier', 'flood_hazards', 'air_freezing_index', 'mean_annual_temp', 'climate_zone'];
export const CRITERIA_UNITS = ['mm', 'psf', 'mph', 'F'];
/** Lookup tables a check reads (footing sizes, stud spacing, header and joist spans, energy by climate zone): cited, numbers only. */
export const TABLE_KINDS = ['footing', 'soil', 'stud', 'header', 'joist', 'rafter', 'ceiling-joist', 'energy', 'bracing', 'drawing', 'sight'];
export const TABLE_LIMIT = 65536;   // bytes of JSON per table

/** The rules the apps know how to use. A pack may carry others (listed, not used). */
export const RULES = {
  'stair.riser.max':    { applies: 'stair', op: '<=',      unit: 'mm' },
  'stair.tread.min':    { applies: 'stair', op: '>=',      unit: 'mm' },
  'stair.width.min':    { applies: 'stair', op: '>=',      unit: 'mm' },
  'stair.headroom.min': { applies: 'stair', op: '>=',      unit: 'mm' },
  'stair.rail.height':  { applies: 'stair', op: 'between', unit: 'mm' },
  'room.ceiling.min':   { applies: 'room',  op: '>=',      unit: 'mm' },
  'room.light.min':     { applies: 'room',  op: '>=',      unit: 'pct' },
  'room.vent.min':      { applies: 'room',  op: '>=',      unit: 'pct' },
  // tier 2 (owner 2026-10-27: "we want all building regulations"): rooms, halls, the egress door, bedroom escape openings
  'room.area.min':          { applies: 'room',   op: '>=', unit: 'm2' },   // habitable room floor area
  'room.dim.min':           { applies: 'room',   op: '>=', unit: 'mm' },   // habitable room least horizontal dimension
  'hall.width.min':         { applies: 'room',   op: '>=', unit: 'mm' },   // hallway width (rooms named hall / corridor)
  'door.egress.width.min':  { applies: 'door',   op: '>=', unit: 'mm' },   // the egress door's clear width
  'door.egress.height.min': { applies: 'door',   op: '>=', unit: 'mm' },   // the egress door's clear height
  'escape.area.min':        { applies: 'window', op: '>=', unit: 'm2' },   // a sleeping room's escape opening: net clear area
  'escape.width.min':       { applies: 'window', op: '>=', unit: 'mm' },   //   net clear width
  'escape.height.min':      { applies: 'window', op: '>=', unit: 'mm' },   //   net clear height
  'escape.sill.max':        { applies: 'window', op: '<=', unit: 'mm' },   //   sill height above the floor
  // tier 3 — electrical and alarms (check.js elecRows; devices from res-elec.js)
  'elec.wall.spacing.max':   { applies: 'room',     op: '<=', unit: 'mm' },    // farthest point of a wall space from an outlet
  'elec.light.room.min':     { applies: 'room',     op: '>=', unit: 'count' }, // lighting outlets in a room
  'elec.bath.outlet.min':    { applies: 'room',     op: '>=', unit: 'count' },
  'elec.laundry.outlet.min': { applies: 'room',     op: '>=', unit: 'count' },
  'elec.garage.outlet.min':  { applies: 'room',     op: '>=', unit: 'count' },
  'elec.hall.outlet.min':    { applies: 'room',     op: '>=', unit: 'count' },  // halls 10 ft or longer
  'elec.outdoor.outlet.min': { applies: 'building', op: '>=', unit: 'count' },
  'alarm.smoke.bedroom.min': { applies: 'room',     op: '>=', unit: 'count' },
  'alarm.smoke.story.min':   { applies: 'storey',   op: '>=', unit: 'count' },
  // tier 3 — foundations (check.js foundRows; foundations from res-foundation.js). Width and thickness also read the pack's footing tables.
  'found.footing.depth.min': { applies: 'foundation', op: '>=', unit: 'mm' },   // underside below grade; at least the frost depth (criteria)
  'found.footing.width.min': { applies: 'foundation', op: '>=', unit: 'mm' },
  'found.footing.thick.min': { applies: 'foundation', op: '>=', unit: 'mm' },
  'found.slab.thick.min':    { applies: 'foundation', op: '>=', unit: 'mm' },
  // tier 3 — wood wall framing (check.js framingRows; framing from res-framing.js; the pack's stud and header tables give the limits)
  'frame.stud.spacing.max':  { applies: 'wall',   op: '<=', unit: 'mm' },
  'frame.stud.height.max':   { applies: 'wall',   op: '<=', unit: 'mm' },
  'frame.header.span.max':   { applies: 'header', op: '<=', unit: 'mm' },
  'frame.joist.span.max':    { applies: 'floor',  op: '<=', unit: 'mm' },
  'frame.rafter.span.max':   { applies: 'roof',   op: '<=', unit: 'mm' },   // horizontal projection of the longest rafter (Table R802.4.1)
  'frame.ceilingjoist.span.max': { applies: 'roof', op: '<=', unit: 'mm' },  // Table R802.5.1
  // tier 3 — energy envelope (check.js energyRows; the pack's energy table by climate zone)
  'energy.wall.r.min':       { applies: 'wall',   op: '>=', unit: 'r' },
  'energy.roof.r.min':       { applies: 'roof',   op: '>=', unit: 'r' },
  'energy.window.u.max':     { applies: 'window', op: '<=', unit: 'u' },
  // 0.8 REG.1 step 4 (regs_PART_3) — drawing practice, CadCraft (check.js drawingRows; the pack's `drawing` table lists the sheet series, the title block fields)
  'draw.dim.suffix':         { applies: 'drawing', op: '<=', unit: 'count' },   // dimensions that write a unit after the number (mm is understood)
  'draw.dim.unit':           { applies: 'drawing', op: '<=', unit: 'count' },   // dimensions written in a unit other than millimetres
  'draw.dim.decimals':       { applies: 'drawing', op: '<=', unit: 'count' },   // dimensions written with decimals
  'draw.level.decimals':     { applies: 'drawing', op: '<=', unit: 'count' },   // levels (+1.250) not written in metres to three decimals
  'draw.sheet.series':       { applies: 'drawing', op: '<=', unit: 'count' },   // sheets that are not an A-series size
  'draw.scale.listed':       { applies: 'drawing', op: '<=', unit: 'count' },   // viewports at a scale outside the pack's list
  'draw.titleblock.fields':  { applies: 'drawing', op: '>=', unit: 'count' },   // title block fields found on each sheet
  'draw.hatch.metric':       { applies: 'drawing', op: '<=', unit: 'count' },   // hatches whose pattern is drawn in inches
  // zoning (CivilCraft, check.js zoneRows: setbacks, height, floor area ratio, coverage — against the building masses on a lot)
  'zone.setback.front.min':  { applies: 'zone', op: '>=', unit: 'mm' },
  'zone.setback.side.min':   { applies: 'zone', op: '>=', unit: 'mm' },
  'zone.setback.rear.min':   { applies: 'zone', op: '>=', unit: 'mm' },
  'zone.height.max':         { applies: 'zone', op: '<=', unit: 'mm' },
  'zone.far.max':            { applies: 'zone', op: '<=', unit: 'ratio' },
  'zone.coverage.max':       { applies: 'zone', op: '<=', unit: 'pct' },
  // roads (CivilCraft, check.js roadRows): a crest curve's K value against the pack's `sight` table by design speed
  'road.crestk.min':         { applies: 'road', op: '>=', unit: 'ratio' },
  // connections (DetailCraft, check.js connRows): bolt edge distance and spacing as multiples of the hole diameter
  'conn.bolt.edge.min':      { applies: 'connection', op: '>=', unit: 'ratio' },
  'conn.bolt.pitch.min':     { applies: 'connection', op: '>=', unit: 'ratio' },
  'conn.bolt.gauge.min':     { applies: 'connection', op: '>=', unit: 'ratio' },
};
export const LIMITS = { rules: 200, label: 120, note: 300, clause: 40, name: 120, packNote: 400 };

const ID_PACK = /^[a-z0-9][a-z0-9-]{1,47}$/;
const ID_RULE = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){1,3}$/;
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const CTRL = new RegExp('[\\u0000-\\u001f\\u007f\\u2028\\u2029\\u202a-\\u202e\\u2066-\\u2069]', 'g');
const str = (v, max) => (typeof v === 'string' ? v.replace(CTRL, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');

/* i18n-ignore-start: the reasons a pack is refused are for whoever writes the pack (a developer or a maker), in English like the format itself */
/** Untrusted pack → the clean pack, or the reasons it is refused. */
export function cleanPack(raw) {
  const errors = [];
  const bad = (m) => errors.push(m);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, pack: null, errors: ['not a regulation pack'] };
  if (raw.format !== FORMAT) bad('format is not ' + FORMAT);
  if (raw.version !== FORMAT_VERSION) bad('version is not ' + FORMAT_VERSION);
  const id = typeof raw.id === 'string' && ID_PACK.test(raw.id) ? raw.id : (bad('id is 2–48 lowercase letters, digits and dashes'), '');
  const name = str(raw.name, LIMITS.name) || (bad('name is missing'), '');
  const j = raw.jurisdiction && typeof raw.jurisdiction === 'object' ? raw.jurisdiction : {};
  const jurisdiction = {
    country: typeof j.country === 'string' && /^[A-Z]{2}$/.test(j.country) ? j.country : (bad('jurisdiction.country is an ISO 3166-1 code such as ZA'), ''),
    level: LEVELS.includes(j.level) ? j.level : (bad('jurisdiction.level is one of ' + LEVELS.join(', ')), ''),
    region: str(j.region, 40), name: str(j.name, 80),
  };
  const base = raw.base === null || raw.base === undefined || raw.base === '' ? null : (typeof raw.base === 'string' && ID_PACK.test(raw.base) ? raw.base : (bad('base is a pack id or null'), null));
  const rv = raw.review && typeof raw.review === 'object' ? raw.review : {};
  const review = { state: REVIEW_STATES.includes(rv.state) ? rv.state : (bad('review.state is one of ' + REVIEW_STATES.join(', ')), 'unchecked'), note: str(rv.note, LIMITS.packNote) };
  const src = raw.source && typeof raw.source === 'object' ? raw.source : {};
  const source = { name: str(src.name, LIMITS.name), url: typeof src.url === 'string' && /^https:\/\/[^\s"<>]{1,300}$/.test(src.url) ? src.url : '',
    date: typeof src.date === 'string' && DATE.test(src.date) ? src.date : '', checked: typeof src.checked === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(src.checked) ? src.checked : '' };
  const authority = raw.authority === undefined || raw.authority === null || raw.authority === '' ? null : (AUTHORITIES.includes(raw.authority) ? raw.authority : (bad('authority is one of ' + AUTHORITIES.join(', ')), null));
  const mk = raw.maker && typeof raw.maker === 'object' ? raw.maker : null;
  const maker = mk && str(mk.name, LIMITS.name) ? { name: str(mk.name, LIMITS.name) } : null;
  // A paid pack (owner 2026-10-26): the price and where the maker sells it. No checkout yet: the app shows the price and links to the maker.
  let price = null;
  if (raw.price !== null && raw.price !== undefined) {
    const pr = raw.price && typeof raw.price === 'object' ? raw.price : {};
    if (!num(pr.amount) || pr.amount <= 0 || pr.amount > 1e6) bad('price.amount is a number above 0');
    else if (typeof pr.currency !== 'string' || !/^[A-Z]{3}$/.test(pr.currency)) bad('price.currency is an ISO 4217 code such as USD');
    else if (typeof pr.url !== 'string' || !/^https:\/\/[^\s"<>]{1,300}$/.test(pr.url)) bad('price.url is the https page where the maker sells it');
    else price = { amount: pr.amount, currency: pr.currency, url: pr.url };
  }
  const edition = str(raw.edition, 40);
  const inForce = typeof raw.in_force === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.in_force) ? raw.in_force : null;
  const rules = [], seen = new Set();
  if (!Array.isArray(raw.rules)) bad('rules is a list');
  else if (raw.rules.length > LIMITS.rules) bad('more than ' + LIMITS.rules + ' rules');
  else raw.rules.forEach((r, i) => {
    const at = 'rule ' + (i + 1) + (r && typeof r.id === 'string' ? ' (' + r.id.slice(0, 40) + ')' : '');
    if (!r || typeof r !== 'object') return bad(at + ' is not an object');
    if (typeof r.id !== 'string' || !ID_RULE.test(r.id)) return bad(at + ': id is like stair.riser.max');
    if (seen.has(r.id)) return bad(at + ': listed twice');
    seen.add(r.id);
    if (r.remove === true) { rules.push({ id: r.id, remove: true, note: str(r.note, LIMITS.note) }); return; }
    const known = RULES[r.id];
    const op = OPS.includes(r.op) ? r.op : (bad(at + ': op is one of ' + OPS.join(', ')), '');
    const unit = UNITS.includes(r.unit) ? r.unit : (bad(at + ': unit is one of ' + UNITS.join(', ')), '');
    if (known && op && op !== known.op) bad(at + ': this rule uses ' + known.op);
    if (known && unit && unit !== known.unit) bad(at + ': this rule is in ' + known.unit);
    const out = { id: r.id, applies: known ? known.applies : str(r.applies, 20), op, unit, clause: str(r.clause, LIMITS.clause), label: str(r.label, LIMITS.label), note: str(r.note, LIMITS.note) };
    if (op === 'between') {
      if (!num(r.min) || !num(r.max) || r.min < 0 || r.max < r.min) bad(at + ': min and max are numbers, min not above max');
      else { out.min = r.min; out.max = r.max; }
    } else if (op) {
      if (!num(r.value) || r.value < 0 || r.value > 1e6) bad(at + ': value is a number');
      else out.value = r.value;
    }
    if (!out.label) bad(at + ': label is missing');
    rules.push(out);
  });
  const criteria = {};
  const emptyList = (v) => Array.isArray(v) && !v.length;   // an empty {} that went through PHP's json_encode comes back as []
  const cr = emptyList(raw.criteria) ? {} : raw.criteria && typeof raw.criteria === 'object' && !Array.isArray(raw.criteria) ? raw.criteria : null;
  if (raw.criteria !== undefined && raw.criteria !== null && !cr) bad('criteria is an object');
  for (const [k, v] of Object.entries(cr || {})) {
    if (!CRITERIA.includes(k)) { bad('criteria.' + k.slice(0, 30) + ' is not one of ' + CRITERIA.join(', ')); continue; }
    if (!v || typeof v !== 'object' || Array.isArray(v)) { bad('criteria.' + k + ' is { text, value?, unit? }'); continue; }
    const c = { text: str(v.text, 100) };
    if (!c.text) { bad('criteria.' + k + '.text is missing'); continue; }
    if (v.value !== undefined && v.value !== null) {
      if (!num(v.value) || !CRITERIA_UNITS.includes(v.unit)) { bad('criteria.' + k + ': value is a number with a unit, one of ' + CRITERIA_UNITS.join(', ')); continue; }
      c.value = v.value; c.unit = v.unit;
    }
    criteria[k] = c;
  }
  const tables = {};
  const tb = emptyList(raw.tables) ? {} : raw.tables && typeof raw.tables === 'object' && !Array.isArray(raw.tables) ? raw.tables : null;
  if (raw.tables !== undefined && raw.tables !== null && !tb) bad('tables is an object');
  for (const [k, v] of Object.entries(tb || {})) {
    if (!/^[A-Za-z0-9.()_-]{1,40}$/.test(k)) { bad('tables: a table id is 1-40 letters, digits and . ( ) _ -'); continue; }
    if (!v || typeof v !== 'object' || Array.isArray(v) || !TABLE_KINDS.includes(v.kind)) { bad('tables.' + k + '.kind is one of ' + TABLE_KINDS.join(', ')); continue; }
    let text = '';
    try { text = JSON.stringify(v.data ?? null); } catch (e) { text = ''; }
    if (!text || text === 'null' || text.length > TABLE_LIMIT) { bad('tables.' + k + '.data is JSON of at most ' + TABLE_LIMIT + ' bytes'); continue; }
    tables[k] = { kind: v.kind, clause: str(v.clause, LIMITS.clause), label: str(v.label, LIMITS.label), note: str(v.note, LIMITS.note), data: JSON.parse(text) };
  }
  if (errors.length) return { ok: false, pack: null, errors };
  return { ok: true, pack: { format: FORMAT, version: FORMAT_VERSION, id, name, jurisdiction, base, edition, in_force: inForce, review, authority, source, maker, price, criteria, tables, rules }, errors: [] };
}

/* i18n-ignore-end */

const weakest = (states) => REVIEW_STATES[Math.min(...states.map((s) => REVIEW_STATES.indexOf(s)))];

/** A pack (and the packs under it) as one set of rules. `packs`: Map or object of clean packs by id. */
export function resolve(packs, id) {
  const get = (k) => (packs instanceof Map ? packs.get(k) : packs?.[k]);
  const chain = [];
  for (let p = get(id), guard = 0; p; p = p.base ? get(p.base) : null, guard++) {
    if (guard > 6 || chain.includes(p)) return null;   // a cycle, or a chain longer than country → state → county → city
    chain.unshift(p);
    if (p.base && !get(p.base)) return null;           // the pack it builds on is missing
  }
  if (!chain.length) return null;
  const rules = new Map(), criteria = {}, tables = {};
  for (const p of chain) {
    for (const r of p.rules) {
      if (r.remove) rules.delete(r.id);
      else { const prev = rules.get(r.id); rules.set(r.id, { ...r, from: p.id, ...(prev ? { overrides: { from: prev.from, clause: prev.clause || '' } } : {}) }); }   // a lower level's rule replaces the one above, which is remembered for the report
    }
    for (const [k, v] of Object.entries(p.criteria || {})) criteria[k] = { ...v, from: p.id };
    for (const [k, v] of Object.entries(p.tables || {})) tables[k] = { ...v, id: k, from: p.id };
  }
  const leaf = chain[chain.length - 1];
  return {
    id: leaf.id, name: leaf.name, chain, edition: leaf.edition, in_force: leaf.in_force, jurisdiction: leaf.jurisdiction, source: leaf.source,
    review: { state: weakest(chain.map((p) => p.review.state)), note: leaf.review.note },
    rules, criteria, tables,
    rule(rid) { return rules.get(rid) || null; },
    list() { return [...rules.values()]; },
    table(kind) { return Object.values(tables).find((t) => t.kind === kind) || null; },
  };
}

/**
 * Several profiles as one (the 'strict' way of handling packs that disagree, owner 2026-10-26): for each rule the tightest limit wins —
 * the lowest max, the highest min, the narrowest range — and keeps the clause and `from` of the pack it came from. id 'strict'.
 */
export function strictest(profiles) {
  const list = (profiles || []).filter(Boolean);
  if (list.length < 2) return list[0] || null;
  const rules = new Map();
  for (const p of list) for (const r of p.list()) {
    const have = rules.get(r.id);
    if (!have) { rules.set(r.id, { ...r }); continue; }
    if (r.op !== have.op) continue;   // a pack that writes the rule another way is not mixed in
    if (r.op === '<=' && r.value < have.value) rules.set(r.id, { ...r });
    else if (r.op === '>=' && r.value > have.value) rules.set(r.id, { ...r });
    else if (r.op === 'between') {
      const tighter = r.min > have.min || r.max < have.max;
      if (tighter) rules.set(r.id, { ...have, min: Math.max(have.min, r.min), max: Math.min(have.max, r.max), clause: r.min > have.min && r.max < have.max ? r.clause : have.clause + ' / ' + r.clause, from: r.min > have.min && r.max < have.max ? r.from : have.from });
    }
  }
  const last = list[list.length - 1];
  return {
    id: 'strict', name: list.map((p) => p.name).join(' + '), parts: list, chain: list.flatMap((p) => p.chain), edition: list.map((p) => p.edition).filter(Boolean).join(' + '),
    in_force: null, jurisdiction: last.jurisdiction, source: last.source,
    review: { state: weakest(list.map((p) => p.review.state)), note: '' },
    rules, criteria: Object.assign({}, ...list.map((p) => p.criteria || {})), tables: Object.assign({}, ...list.map((p) => p.tables || {})),
    rule(rid) { return rules.get(rid) || null; },
    list() { return [...rules.values()]; },
    table(kind) { return Object.values(this.tables).find((t) => t.kind === kind) || null; },
  };
}

/** A rule as limits: <= is a max, >= a min, between both. */
export function ruleBounds(r) {
  if (!r) return { min: null, max: null };
  if (r.op === 'between') return { min: r.min, max: r.max };
  return r.op === '<=' ? { min: null, max: r.value } : { min: r.value, max: null };
}

export function stairLimitsFrom(profile) {
  const v = (id) => { const r = profile && profile.rule(id); return r && r.op !== 'between' ? r.value : null; };
  const rail = ruleBounds(profile && profile.rule('stair.rail.height'));
  return { riserMax: v('stair.riser.max'), treadMin: v('stair.tread.min'), widthMin: v('stair.width.min'), headroom: v('stair.headroom.min'), railMin: rail.min, railMax: rail.max };
}
