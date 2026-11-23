/* SPDX-License-Identifier: Apache-2.0 */
/**
 * check.js — a house against an energy code pack's prescriptive package and mandatory minimums (0.11 Track T24, T24.4). Host-free.
 *
 *   check(pack, building) → { zone, rows, counts: { ok, bad, note }, cfa, glazing: { total, west, pct, westPct } }
 *   building (the pack's units; a California pack is inch-pound: ft², h·ft²·°F/Btu, Btu/h·ft²·°F) = {
 *     postcode, zone? (a zone typed by the person wins over the postcode), cfa (conditioned floor area) | null,
 *     walls:   [{ key, name, area, framing: '2x4' | '2x6' | '2x8' | null, spacing: 16 | 24, cavity: R | null (not said), continuous: R }],
 *     ceiling: { kind: 'attic-c' | 'attic-b' | 'cathedral' | null, r: R | null, radiant: true | false | null },
 *     floor:   { kind: 'raised' | 'slab' | null, r: R | null },
 *     windows: [{ name, area, u | null, shgc | null, bearing: degrees clockwise from true north the glass faces | null }],
 *     doors:   [{ name, area, u | null }] }
 *   row = { id, group, ok: true (meets) | false (does not) | null (could not be checked, with `why`), have, need, unit, ref, vars }
 *
 * Rules of the engine: a value the building does not state is a NOTE, never a pass; a requirement the pack does not hold is not checked and
 * not mentioned as met; nothing here says "complies" — the rows say what was compared with what. Area-weighted averages are over the areas
 * given. An assembly's U-factor is looked up in the code's own table (pack.js wallU), never worked out by the engine.
 */
import { zoneOf, need, wallU } from './pack.js';

const fin = (x) => typeof x === 'number' && Number.isFinite(x);
const EPS = 1e-9;

export function westFacing(pack, bearing) {
  const d = pack.definitions.west_facing;
  if (!d || !fin(bearing)) return null;
  const b = ((bearing % 360) + 360) % 360;
  return b > d.from_excl + EPS && b <= d.to_incl + EPS;
}

function weighted(list, key) {
  let a = 0, s = 0, missing = 0;
  for (const x of list) { if (!(x.area > 0)) continue; if (!fin(x[key])) { missing += x.area; continue; } a += x.area; s += x.area * x[key]; }
  return { value: a > 0 ? s / a : null, area: a, missing };
}

export function check(pack, building) {
  const B = building || {}, rows = [];
  const typed = Number.isInteger(B.zone) && B.zone >= 1 && B.zone <= pack.zones.count ? B.zone : null;
  const zone = typed ?? zoneOf(pack, B.postcode);
  const P = pack.prescriptive, M = pack.mandatory, tableRef = 'Table ' + P.table;
  const add = (id, group, ok, o = {}) => rows.push({ id, group, ok, have: o.have ?? null, need: o.need ?? null, unit: o.unit || '', ref: o.ref || '', why: o.why || '', vars: o.vars || {} });
  const cfa = fin(B.cfa) && B.cfa > 0 ? B.cfa : null;
  const win = (B.windows || []).filter((w) => w.area > 0), total = win.reduce((s, w) => s + w.area, 0);
  const facing = win.map((w) => westFacing(pack, w.bearing)), west = win.reduce((s, w, i) => s + (facing[i] ? w.area : 0), 0);
  const out = { zone, zoneFrom: typed ? 'typed' : zone ? 'postcode' : null, rows, cfa, glazing: { total, west, pct: cfa ? 100 * total / cfa : null, westPct: cfa ? 100 * west / cfa : null } };
  if (!zone) { add('zone', 'zone', null, { why: 'zone' }); out.counts = { ok: 0, bad: 0, note: 1 }; return out; }
  add('zone', 'zone', true, { have: zone, vars: { zone, name: pack.zones.names[String(zone)] || '', from: out.zoneFrom } });

  // ---- walls: the code's table U-factor of each exterior framed wall type against the package and the mandatory minimum
  const wallNeed = need(pack, 'wall.framed.u', zone);
  for (const w of B.walls || []) {
    const vars = { name: w.name || w.key || '', framing: w.framing || '', spacing: w.spacing, cavity: w.cavity, continuous: w.continuous || 0 };
    if (!w.framing || !fin(w.cavity)) { add('wall.u', 'walls', null, { need: wallNeed, unit: 'u', ref: tableRef, why: !w.framing ? 'framing' : 'cavity', vars }); continue; }
    const u = wallU(pack, w);
    if (!u.ok) { add('wall.u', 'walls', null, { need: wallNeed, unit: 'u', ref: tableRef, why: 'table-' + u.why, vars }); continue; }
    const v2 = { ...vars, column: u.column, table: u.table, page: u.page, dense: u.dense };
    if (fin(wallNeed)) add('wall.u', 'walls', u.u <= wallNeed + EPS, { have: u.u, need: wallNeed, unit: 'u', ref: tableRef, vars: v2 });
    const m = M[w.framing === '2x4' ? 'wall.2x4.u' : 'wall.2x6.u'];
    if (m) add('wall.u.mandatory', 'walls', u.u <= m.value + EPS, { have: u.u, need: m.value, unit: 'u', ref: 'Section ' + m.section, vars: v2 });
  }
  if (!(B.walls || []).length) add('wall.u', 'walls', null, { need: wallNeed, unit: 'u', ref: tableRef, why: 'none', vars: {} });

  // ---- ceiling or roof
  const C = B.ceiling || {};
  const cRow = { 'attic-c': 'roof.c.ceiling.r', 'attic-b': 'roof.b.ceiling.r', cathedral: 'roof.c.cathedral.r' }[C.kind];
  if (!cRow) add('ceiling.r', 'ceiling', null, { unit: 'r', ref: tableRef, why: 'kind' });
  else {
    const n = need(pack, cRow, zone);
    if (!fin(C.r)) add('ceiling.r', 'ceiling', null, { need: n, unit: 'r', ref: tableRef, why: 'r', vars: { kind: C.kind } });
    else {
      if (fin(n)) add('ceiling.r', 'ceiling', C.r >= n - EPS, { have: C.r, need: n, unit: 'r', ref: tableRef, vars: { kind: C.kind } });
      if (M['ceiling.r']) add('ceiling.r.mandatory', 'ceiling', C.r >= M['ceiling.r'].value - EPS, { have: C.r, need: M['ceiling.r'].value, unit: 'r', ref: 'Section ' + M['ceiling.r'].section, vars: { kind: C.kind } });
    }
    const rb = C.kind === 'attic-c' ? need(pack, 'roof.c.radiant', zone) : C.kind === 'attic-b' ? need(pack, 'roof.b.radiant', zone) : null;
    if (rb === true) add('ceiling.radiant', 'ceiling', C.radiant === true ? true : C.radiant === false ? false : null, { ref: tableRef, why: C.radiant === null || C.radiant === undefined ? 'radiant' : '', vars: { kind: C.kind } });
    const deck = C.kind === 'attic-b' ? need(pack, 'roof.b.below_deck.r', zone) : null;
    if (fin(deck)) add('ceiling.below_deck', 'ceiling', null, { need: deck, unit: 'r', ref: tableRef, why: 'not-checked', vars: {} });
  }

  // ---- floor
  const F = B.floor || {};
  if (F.kind === 'raised') {
    const n = need(pack, 'floor.raised.r', zone);
    if (!fin(F.r)) add('floor.r', 'floor', null, { need: n, unit: 'r', ref: tableRef, why: 'r' });
    else if (fin(n)) add('floor.r', 'floor', F.r >= n - EPS, { have: F.r, need: n, unit: 'r', ref: tableRef });
  } else if (F.kind === 'slab') {
    const n = need(pack, 'floor.slab.r', zone);
    if (n === null) add('floor.slab', 'floor', true, { ref: tableRef, vars: { none: true } });
    else if (fin(n)) add('floor.slab', 'floor', fin(F.r) ? F.r >= n - EPS : null, { have: fin(F.r) ? F.r : null, need: n, unit: 'r', ref: tableRef, why: fin(F.r) ? '' : 'r' });
  } else add('floor.r', 'floor', null, { unit: 'r', ref: tableRef, why: 'kind' });

  // ---- windows and glazed doors (area-weighted averages, and areas against the conditioned floor area)
  if (win.length) {
    const u = weighted(win, 'u'), s = weighted(win, 'shgc'), nu = need(pack, 'fen.u', zone), ns = need(pack, 'fen.shgc', zone);
    if (fin(nu)) add('fen.u', 'windows', u.missing > 0 || u.value === null ? null : u.value <= nu + EPS, { have: u.value, need: nu, unit: 'u', ref: tableRef, why: u.missing > 0 || u.value === null ? 'u' : '', vars: { n: win.length } });
    if (M['fen.u.weighted'] && u.value !== null && !u.missing) add('fen.u.mandatory', 'windows', u.value <= M['fen.u.weighted'].value + EPS, { have: u.value, need: M['fen.u.weighted'].value, unit: 'u', ref: 'Section ' + M['fen.u.weighted'].section });
    if (ns === null) add('fen.shgc', 'windows', true, { ref: tableRef, vars: { none: true } });
    else if (fin(ns)) add('fen.shgc', 'windows', s.missing > 0 || s.value === null ? null : s.value <= ns + EPS, { have: s.value, need: ns, unit: 'shgc', ref: tableRef, why: s.missing > 0 || s.value === null ? 'shgc' : '' });
    const na = need(pack, 'fen.area.pct', zone), nw = need(pack, 'fen.west.pct', zone);
    if (fin(na)) add('fen.area', 'windows', cfa ? out.glazing.pct <= na + EPS : null, { have: out.glazing.pct, need: na, unit: 'pct', ref: tableRef, why: cfa ? '' : 'cfa', vars: { area: total, cfa } });
    if (nw === null) add('fen.west', 'windows', true, { ref: tableRef, vars: { none: true } });
    else if (fin(nw)) {
      const unknown = facing.some((f) => f === null);
      add('fen.west', 'windows', !cfa || unknown ? null : out.glazing.westPct <= nw + EPS, { have: cfa && !unknown ? out.glazing.westPct : null, need: nw, unit: 'pct', ref: tableRef, why: !cfa ? 'cfa' : unknown ? 'bearing' : '', vars: { area: west, cfa } });
    }
  } else add('fen.u', 'windows', null, { unit: 'u', ref: tableRef, why: 'none' });

  // ---- swinging doors that are not glazed doors
  const doors = (B.doors || []).filter((d) => d.area > 0), nd = need(pack, 'door.u', zone);
  if (doors.length && fin(nd)) { const d = weighted(doors, 'u'); add('door.u', 'doors', d.missing > 0 || d.value === null ? null : d.value <= nd + EPS, { have: d.value, need: nd, unit: 'u', ref: tableRef, why: d.missing > 0 || d.value === null ? 'u' : '', vars: { n: doors.length } }); }

  // ---- what the package also asks for in this zone that this add-on does not check: said, so nobody takes silence for a pass
  for (const [id, row] of [['other.qii', 'qii'], ['other.fan', 'whole_house_fan']]) if (need(pack, row, zone) === true) add(id, 'other', null, { ref: tableRef, why: 'not-checked' });
  const refl = need(pack, 'roofing.steep.reflectance', zone);
  if (fin(refl)) add('other.roofing', 'other', null, { need: refl, ref: tableRef, why: 'not-checked', vars: { emittance: need(pack, 'roofing.steep.emittance', zone) } });
  add('other.systems', 'other', null, { ref: tableRef, why: 'not-checked' });

  out.counts = { ok: rows.filter((r) => r.ok === true && r.id !== 'zone').length, bad: rows.filter((r) => r.ok === false).length, note: rows.filter((r) => r.ok === null).length };
  return out;
}
