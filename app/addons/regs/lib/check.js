/* SPDX-License-Identifier: Apache-2.0 */
/**
 * check.js — CivilCraft's checks against a regulation pack (0.8 REG.1 step 4, session `regs_PART_3`): zoning and sight distance. The app's own file
 * of the `regs` add-on (the engine files beside it are BimCraft's, byte-identical). No DOM.
 *
 *   zoneRows(project, profile, t) → [row]   each lot that has building masses (massing.js), judged against the pack's limits through zoning.js
 *                                           checkMasses: a derived zone (front, side and rear setbacks, height, floor area ratio, coverage) is built from
 *                                           the pack's rules zone.*; the lot's front and rear lines are the ones the person already chose in a typed
 *                                           zone, else course 0 and the course most opposite it. CivilCraft ships no code library: the limits are the
 *                                           pack's, shown as the pack's, and the typed zone stays the person's own.
 *   roadRows(project, profile, t) → [row]   each crest vertical curve of an alignment that has a design speed (project.js cleanDesign), its K
 *                                           (length per percent of grade change, in metres) against the pack's `sight` table (road.crestk.min)
 *
 * Setbacks are judged as one row per mass: the area of its footprint outside the buildable envelope (m²; the rule's value is the pack's smallest
 * setback, shown in the clause). A guide only: the registered professional and the local authority decide.
 */
import { row } from './rows.js';
import { cleanZone, checkMasses } from '../../../zoning.js';

const SQ = 1e6;
const mmPer = (units) => (units === 'm' ? 1000 : 304.8);

export function zoneRows(project, profile, t = (k) => k) {
  if (!profile || !project) return [];
  const st = project.state, units = st.units === 'm' ? 'm' : 'ft', k = mmPer(units);
  const sb = ['zone.setback.front.min', 'zone.setback.side.min', 'zone.setback.rear.min'].map((id) => profile.rule(id));
  const rh = profile.rule('zone.height.max'), rf = profile.rule('zone.far.max'), rc = profile.rule('zone.coverage.max');
  if (!sb.some(Boolean) && !rh && !rf && !rc) return [];
  const out = [];
  for (const par of st.parcels || []) {
    const masses = (st.masses || []).filter((m) => m.parcel === par.id);
    if (!masses.length) continue;
    const typed = (st.zoning || []).find((z) => z.parcel === par.id);
    const zone = cleanZone({ parcel: par.id, front: sb[0] ? sb[0].value / k : 0, side: sb[1] ? sb[1].value / k : 0, rear: sb[2] ? sb[2].value / k : 0,
      frontCourse: typed ? typed.frontCourse : 0, rearCourse: typed ? typed.rearCourse : null, heightCap: rh ? rh.value / k : 0, far: rf ? rf.value : 0, coverage: rc ? rc.value / 100 : 0 }, units);
    if (!zone) continue;
    const res = checkMasses(par, zone, masses);
    const where = par.name || par.id;
    const setRule = sb.find(Boolean);
    for (const it of res.items) {
      if (it.key === 'setback' && setRule) {
        const mass = masses.find((m) => m.id === it.mass);
        const synth = { ...setRule, op: '<=', value: 0, unit: 'm2', label: t('regs.zone.outside') };
        const r = row('mass', where + ' · ' + (mass ? mass.name : it.mass), synth, it.problem ? null : it.value * (k / 1000) ** 2, String(it.mass));
        out.push({ ...r, id: setRule.id });
      } else if (it.key === 'height' && rh) {
        const mass = masses.find((m) => m.id === it.mass);
        out.push(row('mass', where + ' · ' + (mass ? mass.name : it.mass), rh, it.value * k, String(it.mass)));
      } else if (it.key === 'far' && rf) out.push(row('parcel', where, rf, it.value, par.id));
      else if (it.key === 'coverage' && rc) out.push(row('parcel', where, rc, it.value * 100, par.id));
    }
  }
  return out;
}

/** The minimum crest K the sight table gives for a design speed (km/h): the next speed up in the table, the last for a faster road. */
export function crestKFor(table, kmh) {
  const d = table && table.data;
  if (!d || !Array.isArray(d.speeds) || !Array.isArray(d.crestK) || d.speeds.length !== d.crestK.length || !d.speeds.length) return null;
  const i = d.speeds.findIndex((s) => s >= kmh - 1e-9);
  return d.crestK[i < 0 ? d.crestK.length - 1 : i];
}

export function roadRows(project, profile, t = (k) => k) {
  if (!profile || !project) return [];
  const rule = profile.rule('road.crestk.min');
  if (!rule) return [];
  const table = profile.table ? profile.table('sight') : null;
  const units = project.state.units === 'm' ? 'm' : 'ft', toM = units === 'm' ? 1 : 0.3048;
  const out = [];
  for (const a of project.state.alignments || []) {
    let prof;
    try { prof = project.designProfile(a); } catch (e) { continue; }
    const crests = (prof.curves || []).filter((c) => c.kind === 'crest');
    if (!crests.length) continue;
    const where = a.name || a.id, d = a.design;
    const kmh = d && d.speed ? (d.unit === 'mph' ? d.speed * 1.609344 : d.speed) : null;
    const need = kmh && table ? crestKFor(table, kmh) : null;
    for (const c of crests) {
      const label = where + ' · ' + t('regs.road.pvi', { n: c.i + 1 });
      if (need === null) { out.push({ ...row('alignment', label, rule, null, a.id), ok: null }); continue; }
      out.push(row('alignment', label, { ...rule, value: need }, c.K * toM, a.id));
      out[out.length - 1].id = rule.id;
    }
  }
  return out;
}
