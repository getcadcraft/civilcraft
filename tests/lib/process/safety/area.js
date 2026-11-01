/* SPDX-License-Identifier: Apache-2.0 */
/**
 * area.js — hazardous area classification (0.8 Track CH, CH.17; DOM-free). Release sources come from P&ID equipment and fittings; a grade of release and a ventilation
 * description give a zone through a CLASSIFICATION PACK (data); the extent comes from the dilution volume method or from the person. Concepts and vocabulary follow
 * IEC 60079-10-1 / API RP 505 (grade of release: continuous, primary, secondary; zone 0, 1, 2; degree and availability of ventilation).
 *
 * The standards' tables are NOT reproduced here: they were not at hand, and a number from a standard I do not have must not be presented as the standard's.
 * The bundled pack `screening` is a simplified rule that says so on every sheet; the person's reviewer replaces it with a pack typed from their copy of the standard
 * (same format `cadcraft-area-pack`), and a pack declares its own `review` state. A drafting and study aid, not an engineering approval.
 *
 *   pack   { format: 'cadcraft-area-pack', version: 1, id, name, standard, edition, review: { state }, zones: { <grade>: { <degree>: { <availability>: 'Zone 0'|'Zone 1'|'Zone 2'|'NE' } } },
 *            k: { continuous, primary, secondary } (the dilution safety factor), notes }
 *   source { id, tag, kind, grade, substance: { name, lfl (volume fraction), M (kg/mol), heavy? }, rate (kg/s) | hole: { d, P0, T, k? }, at: { x, y, z },
 *            ventilation: { degree, availability, C (air changes per second), f (efficiency factor), indoor }, extent?: { manual: m }, gasGroup, tempClass }
 *
 *   SCREENING_PACK · cleanPack · zoneFor(pack, source) · releaseRate(source) · dilution(source, pack) · classify(sources, pack) → { zones, problems }
 *   planShapes(zones) · sectionShapes(zones, plane) · volumes(zones) · checkEquipment(zones, items)
 */
import { str, num, pos, oneOf, problem, DISCLAIMER } from './common.js';
import { R } from '../data.js';
import { gasRelease } from './consequence.js';

export const SOURCES = {
  vocabulary: 'Grades of release continuous / primary / secondary and Zones 0 / 1 / 2 (IEC 60079-10-1, API RP 505): names only, not the tables',
  dilution: 'Minimum ventilation flow (dV/dt)min = (dG/dt)max / (k LFL_m) x T/293 (the dilution method of IEC 60079-10-1 Annex B, typed from memory); hypothetical volume V_z = f (dV/dt)min / C',
  lflmass: 'LFL in kg/m3 = LFL(vol fraction) x M x P/(R T)',
};
export const REVIEW = { state: 'not confirmed', note: 'The zone rule is a simplified screening rule; the dilution equation and k factors were typed without IEC 60079-10-1 open. Replace the pack with one typed from the standard and have an engineer check the result.' };
export const GRADES = ['continuous', 'primary', 'secondary'];
export const DEGREES = ['high', 'medium', 'low'];
export const AVAIL = ['good', 'fair', 'poor'];
export const ZONES = ['Zone 0', 'Zone 1', 'Zone 2', 'NE'];

/**
 * The bundled screening rule: continuous gives Zone 0, primary Zone 1, secondary Zone 2; high ventilation with good availability steps the zone one down (Zone 2 becomes
 * non-hazardous 'NE'); low ventilation or poor availability steps it one up (never above Zone 0). It is NOT a table of any standard.
 */
function screeningTable() {
  const base = { continuous: 0, primary: 1, secondary: 2 }, t = {};
  for (const g of GRADES) { t[g] = {}; for (const d of DEGREES) { t[g][d] = {}; for (const a of AVAIL) {
    let z = base[g]; if (d === 'high' && a === 'good') z += 1; else if (d === 'low' || a === 'poor') z -= 1;
    z = Math.max(0, Math.min(3, z)); t[g][d][a] = ZONES[z];
  } } }
  return t;
}
export const SCREENING_PACK = Object.freeze({ format: 'cadcraft-area-pack', version: 1, id: 'screening', name: 'Screening rule (simplified, not the standard\'s table)', standard: 'none: a simplified rule', edition: '', review: { state: 'not confirmed' },
  zones: screeningTable(), k: { continuous: 0.25, primary: 0.25, secondary: 0.5 }, notes: ['A simplified rule for early drawings. Replace it with a pack typed from the standard.'] });

export function cleanPack(raw) {
  if (!raw || typeof raw !== 'object' || raw.format !== 'cadcraft-area-pack' || raw.version !== 1) return null;
  const zones = {};
  for (const g of GRADES) { zones[g] = {}; for (const d of DEGREES) { zones[g][d] = {}; for (const a of AVAIL) { const z = raw.zones?.[g]?.[d]?.[a]; if (!ZONES.includes(z)) return null; zones[g][d][a] = z; } } }
  const k = {}; for (const g of GRADES) k[g] = pos(raw.k?.[g]) ?? SCREENING_PACK.k[g];
  return { format: 'cadcraft-area-pack', version: 1, id: str(raw.id, 40), name: str(raw.name, 120), standard: str(raw.standard, 120), edition: str(raw.edition, 40), review: { state: raw.review?.state === 'confirmed' && str(raw.review?.by, 80) ? 'confirmed' : 'not confirmed', by: str(raw.review?.by, 80) }, zones, k, notes: (Array.isArray(raw.notes) ? raw.notes : []).slice(0, 10).map((x) => str(x, 240)) };
}
export const zoneFor = (pack, s) => pack.zones?.[s.grade]?.[s.ventilation?.degree]?.[s.ventilation?.availability] || null;

export function cleanSources(raw) {
  return (Array.isArray(raw) ? raw : []).slice(0, 2000).filter((s) => s && typeof s === 'object').map((s, i) => {
    const o = { id: str(s.id, 16) || 'RS' + (i + 1), tag: str(s.tag, 24), kind: str(s.kind, 30), grade: oneOf(s.grade, GRADES, 'secondary'), gasGroup: str(s.gasGroup, 8), tempClass: str(s.tempClass, 4), pid: str(s.pid, 40),
      substance: { name: str(s.substance?.name, 80), lfl: pos(s.substance?.lfl), M: pos(s.substance?.M), heavy: !!s.substance?.heavy },
      at: { x: num(s.at?.x) ?? 0, y: num(s.at?.y) ?? 0, z: num(s.at?.z) ?? 0 },
      ventilation: { degree: oneOf(s.ventilation?.degree, DEGREES, 'medium'), availability: oneOf(s.ventilation?.availability, AVAIL, 'fair'), C: pos(s.ventilation?.C), f: pos(s.ventilation?.f), indoor: !!s.ventilation?.indoor, T: pos(s.ventilation?.T) } };
    if (pos(s.rate)) o.rate = s.rate;
    if (s.hole && typeof s.hole === 'object') o.hole = { d: pos(s.hole.d), P0: pos(s.hole.P0), T: pos(s.hole.T), k: pos(s.hole.k), Cd: pos(s.hole.Cd) };
    if (pos(s.extent?.manual)) o.extent = { manual: s.extent.manual };
    return o;
  });
}
/** Release rate kg/s (gas): the person's rate, else a hole in a pressurised gas system. */
export function releaseRate(s) {
  if (s.rate > 0) return { rate: s.rate, from: 'given' };
  if (s.hole?.d > 0 && s.hole.P0 > 0 && s.hole.T > 0 && s.substance.M > 0) { const g = gasRelease({ d: s.hole.d, P0: s.hole.P0, T: s.hole.T, M: s.substance.M, k: s.hole.k || 1.4, Cd: s.hole.Cd || 1 }); return { rate: g.mdot, from: 'hole', choked: g.choked }; }
  return null;
}
/** Dilution method: minimum ventilation flow (m³/s) and the hypothetical volume (m³) and the sphere radius that volume fills. */
export function dilution(s, pack = SCREENING_PACK, { Pa = 101325 } = {}) {
  const rr = releaseRate(s), v = s.ventilation; if (!rr || !(s.substance.lfl > 0) || !(s.substance.M > 0)) return null;
  const T = v.T || 293.15, lflm = s.substance.lfl * s.substance.M * Pa / (R * T), k = pack.k[s.grade] || 0.5, Qmin = rr.rate / (k * lflm) * (T / 293);
  const out = { rate: rr.rate, lflMass: lflm, k, Qmin };
  if (v.C > 0) { out.Vz = (v.f || 1) * Qmin / v.C; out.radius = Math.cbrt(3 * out.Vz / (4 * Math.PI)); }
  return out;
}
/** Classify every source. → { zones: [{ id, source, tag, zone, grade, extent (m), extentFrom, shape }], problems, notes } */
export function classify(sources, pack = SCREENING_PACK) {
  const zones = [], problems = [], notes = [DISCLAIMER, 'Classification pack: ' + pack.name + ' (review ' + pack.review.state + ').', REVIEW.note];
  for (const s of sources) {
    const about = [{ kind: 'release-source', id: s.id, label: s.tag }], z = zoneFor(pack, s);
    if (!z) { problems.push(problem('area.zone', 'warning', `Source ${s.id}: the pack gives no zone for ${s.grade} / ${s.ventilation.degree} / ${s.ventilation.availability}.`, about)); continue; }
    if (!(s.substance.lfl > 0)) problems.push(problem('area.lfl', 'warning', `Source ${s.id} has no lower flammable limit; the extent cannot be worked out.`, about));
    if (z === 'NE') { zones.push({ id: s.id, source: s.id, tag: s.tag, zone: 'NE', grade: s.grade, extent: 0, extentFrom: 'none', shape: null }); continue; }
    let r = 0, from = '';
    if (s.extent?.manual > 0) { r = s.extent.manual; from = 'given by the person'; }
    else { const d = dilution(s, pack); if (d && d.radius > 0) { r = d.radius; from = 'dilution volume (' + d.Vz.toPrecision(3) + ' m³)'; } else problems.push(problem('area.extent', 'warning', `Source ${s.id}: no extent. Give the release rate (or a hole), the lower flammable limit and the air changes per second, or enter the distance from the standard's chart.`, about)); }
    if (!r) continue;
    if (!s.ventilation.indoor && !s.extent?.manual) problems.push(problem('area.outdoor', 'note', `Source ${s.id} is outdoors: the dilution volume method is for ventilated spaces; take the distance from the standard's outdoor chart and enter it as the extent.`, about));
    if (s.substance.heavy) problems.push(problem('area.heavy', 'warning', `Source ${s.id} releases a vapour heavier than air: the zone extends low, into pits and trenches. The shape below is a ground-to-release-height bounding cylinder.`, about));
    const shape = s.substance.heavy ? { type: 'cylinder', cx: s.at.x, cy: s.at.y, r, z0: 0, z1: s.at.z + r } : { type: 'sphere', cx: s.at.x, cy: s.at.y, cz: s.at.z, r };
    zones.push({ id: s.id, source: s.id, tag: s.tag, zone: z, grade: s.grade, extent: r, extentFrom: from, shape, gasGroup: s.gasGroup, tempClass: s.tempClass });
  }
  return { zones, problems, notes };
}
const LAYER = { 'Zone 0': 'AREA-ZONE0', 'Zone 1': 'AREA-ZONE1', 'Zone 2': 'AREA-ZONE2' };
/** Plan view (CadCraft): circles at the release height cut by the ground. */
export function planShapes(zones) {
  return zones.filter((z) => z.shape).map((z) => ({ id: z.id, layer: LAYER[z.zone], label: z.zone + (z.tag ? ' ' + z.tag : ''), type: 'circle', cx: z.shape.cx, cy: z.shape.cy, r: z.shape.r }));
}
/** Section through the vertical plane x = const or y = const (axis 'x' | 'y', at): the chord of each shape in (s, z) with s along the other axis. */
export function sectionShapes(zones, { axis = 'x', at = 0 } = {}) {
  const out = [];
  for (const z of zones) if (z.shape) {
    const c = axis === 'x' ? z.shape.cx : z.shape.cy, o = axis === 'x' ? z.shape.cy : z.shape.cx, d = Math.abs(at - c); if (d >= z.shape.r) continue;
    const half = Math.sqrt(z.shape.r ** 2 - d ** 2);
    if (z.shape.type === 'cylinder') out.push({ id: z.id, layer: LAYER[z.zone], label: z.zone, type: 'rect', s0: o - half, s1: o + half, z0: z.shape.z0, z1: z.shape.z1 });
    else out.push({ id: z.id, layer: LAYER[z.zone], label: z.zone, type: 'circle-chord', s: o, z: z.shape.cz, r: half });
  }
  return out;
}
export const volumes = (zones) => zones.filter((z) => z.shape).map((z) => ({ id: z.id, zone: z.zone, ...z.shape, label: z.zone + (z.tag ? ' ' + z.tag : '') }));
const inside = (sh, p) => (sh.type === 'sphere' ? Math.hypot(p.x - sh.cx, p.y - sh.cy, p.z - sh.cz) <= sh.r : Math.hypot(p.x - sh.cx, p.y - sh.cy) <= sh.r && p.z >= sh.z0 && p.z <= sh.z1);
/** Electrical items { tag, at: {x, y, z}, protection } inside a zone with no protection recorded, and ignition sources in Zone 0 → Problems. */
export function checkEquipment(zones, items) {
  const out = [], rank = { 'Zone 0': 0, 'Zone 1': 1, 'Zone 2': 2 };
  for (const it of items) {
    const hit = zones.filter((z) => z.shape && inside(z.shape, it.at)).sort((a, b) => rank[a.zone] - rank[b.zone])[0]; if (!hit) continue;
    const about = [{ kind: 'equipment', id: it.tag }, { kind: 'release-source', id: hit.id }];
    if (!str(it.protection)) out.push(problem('area.protection', hit.zone === 'Zone 0' ? 'error' : 'warning', `${it.tag} is inside ${hit.zone} (source ${hit.id}) and has no protection recorded.`, about));
    else out.push(problem('area.check', 'note', `${it.tag} is inside ${hit.zone}; protection "${str(it.protection, 40)}" must be checked against the zone by an engineer.`, about));
  }
  return out;
}
