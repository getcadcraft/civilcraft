/* SPDX-License-Identifier: Apache-2.0 */
/**
 * report.js — a dome's figures as a CSV file (0.11 DOME.1). Host-free. Every figure a spec governs says where it came from (your own figure, the
 * spec, or a starting figure that is not from any standard) and, when from a spec, the standard, the clause and how we read it.
 * t(key, vars) = the host's translator (lang keys dome.*); with none, the keys print.
 */
import { citation } from './spec.js';
import { shown, toShown, fieldUnit } from './units.js';

const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s; return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const line = (...c) => c.map(cell).join(',');
const n = (v, dp = 2) => (Number.isFinite(v) ? String(Number(v.toFixed(dp))) : '');

export function reportCsv(result, t = (k) => k, system = result.design.units) {
  const d = result.design, q = result.quantities, f = result.forces, B = result.bending, out = [];
  const V = (v, unit, dp = 2) => { const x = shown(v, unit, system); return [n(x.value, dp), x.unit]; };
  const fieldRow = (k, v) => line(t('dome.f.' + k), n(toShown(k, v, system), 4), fieldUnit(k, system, t('dome.unit.' + k)));
  const facts = (c) => Object.entries(c.label).filter(([, v]) => v).map(([k, v]) => n(v) + ' x ' + t('dome.w.' + (k === 'deadMin' ? 'deadmin' : k))).join(' + ');
  out.push(line(t('dome.report.title'), d.name));
  out.push(line(t('dome.notice')));
  out.push(line(t('dome.report.spec'), result.spec ? result.spec.name : t('dome.spec.none')));
  out.push('');
  out.push(line(t('dome.f.shape'), t('dome.opt.shape.' + d.shape)));
  for (const k of ['diameter', 'height', 'stem', 'thicken', 'foam', 'membrane', 'footingWidth', 'footingDepth', 'slab', 'frameWidth', 'frameExtra', 'barDia', 'barSpacing']) out.push(fieldRow(k, d[k]));
  out.push(line(t('dome.f.baseFix'), t('dome.opt.baseFix.' + d.baseFix)));
  for (const k of ['density', 'finishLoad', 'snow', 'wind', 'seismic', 'modulus', 'poisson', 'knockdown', 'steelStress']) out.push(fieldRow(k, d[k]));
  out.push('');
  out.push(line(t('dome.report.figure'), t('dome.report.value'), t('dome.report.unit'), t('dome.report.from'), t('dome.report.source'), t('dome.report.read')));
  for (const [k, b] of Object.entries(result.basis)) {
    const src = b.from === 'spec' && b.source ? citation(result.spec, b.source) : '';
    out.push(line(t('dome.f.' + k), n(toShown(k, b.value, system), 4), fieldUnit(k, system, t('dome.unit.' + k)), t('dome.from.' + b.from), src, b.from === 'spec' && b.source ? t('dome.read.' + b.source.read) : ''));
  }
  out.push('');
  out.push(line(t('dome.report.openings')));
  for (const o of result.built.layout.kept) out.push(line(t('dome.opt.kind.' + o.kind) + ' ' + o.n, n(toShown('width', o.width, system)) + ' x ' + n(toShown('height', o.height, system)), fieldUnit('width', system, 'mm'), t('dome.o.az') + ' ' + n(o.az) + '°', t('dome.o.sill') + ' ' + n(toShown('sill', o.sill, system))));
  out.push('');
  out.push(line(t('dome.report.quantities')));
  for (const r of q.rows) out.push(line(t('dome.q.' + r.id), ...V(r.value, r.unit), r.note ? t('dome.q.' + r.note) : ''));
  if (q.bars) out.push(line(t('dome.bars.ratio', { crown: n(q.bars.ratioCrown, 5), base: n(q.bars.ratioBase, 5), want: n(d.rebarRatio, 5) })));
  out.push('');
  out.push(line(t('dome.report.forces')));
  out.push(line(t('dome.forces.notice')));
  out.push(line(t('dome.forces.legend')));
  out.push(line(t(f.unfactored ? 'dome.forces.unfactored' : 'dome.forces.factored', { dead: n(f.factors.dead), alone: n(f.factors.deadAlone), min: n(f.factors.deadMin), snow: n(f.factors.snow), wind: n(f.factors.wind), seismic: n(f.factors.seismic) })));
  const uF = shown(1, 'kN/m', system).unit, uS = shown(1, 'MPa', system).unit, uL = shown(1, 'm', system).unit, uM = shown(1, 'kN·m/m', system).unit;
  for (const id of ['dead', 'snow']) {
    const c = f.cases[id]; if (!c) continue;
    out.push(line(t('dome.case.' + id), facts(c)));
    out.push(line(t('dome.fc.angle'), t('dome.fc.thickness', { u: shown(1, 'mm', system).unit }), t('dome.fc.nphi', { u: uF }), t('dome.fc.ntheta', { u: uF }), t('dome.fc.sphi', { u: uS }), t('dome.fc.stheta', { u: uS })));
    for (const s of c.stations) out.push(line(n(s.phiDeg, 1), V(s.t, 'mm')[0], V(s.nPhi, 'kN/m', 3)[0], V(s.nTheta, 'kN/m', 3)[0], V(s.sPhi, 'MPa', 3)[0], V(s.sTheta, 'MPa', 3)[0]));
    out.push(line(t('dome.fc.load'), ...V(c.domeLoad, 'kN', 1)));
    out.push(line(t('dome.fc.maxc'), ...V(c.maxCompression.stress, 'MPa', 3)));
    out.push(line(t('dome.fc.hoop'), ...V(c.maxHoopTension ? c.maxHoopTension.n : 0, 'kN/m'), c.hoopZeroDeg !== null ? t('dome.fc.hoopfrom', { deg: n(c.hoopZeroDeg, 1) }) : ''));
    out.push(line(t('dome.fc.thrust'), ...V(c.base.thrust, 'kN/m')));
    out.push(line(t('dome.fc.ring'), ...V(c.base.ringTension, 'kN', 1)));
    out.push(line(t('dome.fc.vertical'), ...V(c.floor.vertical, 'kN/m')));
    out.push(line(t('dome.fc.bearing'), ...V(c.bearing, 'kPa', 1)));
    const st = V(d.steelStress, 'MPa', 0).join(' ');
    if (c.ringSteel !== null) out.push(line(t('dome.fc.ringsteel'), ...V(c.ringSteel, 'mm2', 2), t('dome.fc.atstress', { stress: st })));
    if (c.hoopSteel !== null) out.push(line(t('dome.fc.hoopsteel'), ...V(c.hoopSteel, 'mm2/m', 3), t('dome.fc.atstress', { stress: st })));
  }
  for (const id of ['wind', 'seismic']) {
    const c = f.cases[id]; if (!c) continue;
    out.push(line(t('dome.case.' + id), facts(c)));
    out.push(line(t('dome.lat.' + id)));
    out.push(line(t('dome.lat.z', { u: uL }), t('dome.lat.n', { u: uF }), t('dome.lat.s', { u: uF }), t('dome.lat.nt', { u: uF })));
    for (const s of c.stations) out.push(line(V(s.z / 1000, 'm')[0], V(s.n, 'kN/m', 3)[0], V(s.s, 'kN/m', 3)[0], V(s.nTheta, 'kN/m', 3)[0]));
    out.push(line(t('dome.lat.shear'), ...V(c.baseShear, 'kN', 1)));
    out.push(line(t('dome.lat.turn'), ...V(c.overturning, 'kN·m', 1)));
    out.push(line(t('dome.lat.floor'), ...V(c.floor.n, 'kN/m')));
    out.push(line(t('dome.lat.floormax'), ...V(c.floor.withDead.max, 'kN/m'), t(c.floor.withDead.max > 0 ? 'dome.lat.uplift' : 'dome.lat.nouplift')));
    out.push(line(t('dome.lat.floormin'), ...V(c.floor.withDead.min, 'kN/m')));
    out.push(line(t('dome.lat.along'), V(c.maxAlong.tension, 'kN/m')[0] + ' / ' + V(c.maxAlong.compression, 'kN/m')[0], uF));
    out.push(line(t('dome.lat.round'), V(c.maxRound.tension, 'kN/m')[0] + ' / ' + V(c.maxRound.compression, 'kN/m')[0], uF));
    out.push(line(t('dome.lat.maxshear'), ...V(c.maxShear, 'kN/m')));
    if (c.upliftSteel !== null) out.push(line(t('dome.lat.upsteel'), ...V(c.upliftSteel, 'mm2/m', 3)));
  }
  out.push('');
  out.push(line(t('dome.report.bending')));
  out.push(line(t('dome.b.notice', { base: t('dome.opt.baseFix.' + B.base) })));
  const where = (x) => t('dome.b.at', { z: V(x.z / 1000, 'm').join(' '), dir: t('dome.b.dir.' + x.dir), face: x.face ? t('dome.b.face.' + x.face) : '' });
  for (const [id, c] of Object.entries(B.cases)) {
    out.push(line(t('dome.case.' + id), facts(f.cases[id])));
    out.push(line(t('dome.lat.z', { u: uL }), t('dome.fc.nphi', { u: uF }), t('dome.fc.ntheta', { u: uF }), t('dome.b.malong', { u: uM }), t('dome.b.mround', { u: uM })));
    for (const s of c.stations) out.push(line(V(s.z / 1000, 'm')[0], V(s.nAlong, 'kN/m', 3)[0], V(s.nRound, 'kN/m', 3)[0], V(s.mAlong, 'kN·m/m', 4)[0], V(s.mRound, 'kN·m/m', 4)[0]));
    out.push(line(t('dome.b.basem'), ...V(c.baseMoment, 'kN·m/m', 4)));
    out.push(line(t('dome.b.maxm'), ...V(c.maxMoment.m, 'kN·m/m', 4), where(c.maxMoment)));
    out.push(line(t('dome.b.push'), ...V(c.basePush, 'kN/m')));
    out.push(line(t('dome.b.ring'), ...V(c.ringTension, 'kN', 1)));
    out.push(c.maxTension ? line(t('dome.b.maxt'), ...V(c.maxTension.stress, 'MPa', 3), where(c.maxTension)) : line(t('dome.b.maxt'), t('dome.b.notension')));
    out.push(line(t('dome.b.maxc'), ...V(c.maxCompression.stress, 'MPa', 3), where(c.maxCompression)));
    out.push(line(t('dome.b.crown'), ...V(c.crownDrop, 'mm', 3)));
    out.push(line(t('dome.b.spread'), ...V(c.baseSpread, 'mm', 3)));
  }
  out.push('');
  out.push(line(t('dome.report.buckling')));
  out.push(line(t('dome.bk.notice')));
  if (f.buckling) {
    out.push(line(t('dome.bk.classical'), ...V(f.buckling.classical, 'kPa', 1)));
    out.push(line(t('dome.bk.pressure'), ...V(f.buckling.pressure, 'kPa', 3), t('dome.bk.where', { deg: n(f.buckling.phiDeg, 1) })));
    out.push(line(t('dome.bk.ratio'), n(f.buckling.ratio, 1)));
    out.push(line(t('dome.bk.reduced'), f.buckling.reduced === null ? t('dome.bk.noreduce') : n(f.buckling.reduced, 2), f.buckling.reduced === null ? '' : t('dome.bk.with', { k: n(d.knockdown, 3) })));
  }
  if (f.openings.length) {
    out.push('');
    out.push(line(t('dome.report.openforces')));
    out.push(line(t('dome.of.notice')));
    const uK = shown(1, 'kN', system).unit;
    out.push(line(t('dome.o.kind'), t('dome.of.along', { u: uK }), t('dome.of.side', { u: uK }), t('dome.of.round', { u: uK })));
    for (const o of f.openings) out.push(line(t('dome.opt.kind.' + o.kind) + ' ' + o.n, V(o.along, 'kN', 1)[0], V(o.alongEachSide, 'kN', 1)[0], V(o.round, 'kN', 1)[0]));
  }
  out.push('');
  out.push(line(t('dome.report.checks')));
  if (!result.spec) out.push(line(t('dome.spec.nonecheck')));
  else if (!result.checks.length) out.push(line(t('dome.check.none')));
  for (const r of result.checks) out.push(line(t('dome.sev.' + r.severity), r.key === 'dome.issue.read' ? t('dome.rule.' + r.vars.rule) + ': ' + r.vars.text : t(r.key, { ...r.vars, what: r.vars.what ? t('dome.f.' + r.vars.what) : '' }), r.cite, r.read ? t('dome.read.' + r.read) : ''));
  for (const p of result.problems) out.push(line(t('dome.sev.warning'), t('dome.problem.' + p.code, p.vars || {})));
  if (result.spec) {
    out.push('');
    out.push(line(t('dome.report.rules'), result.spec.name));
    for (const v of Object.values(result.spec.values)) out.push(line(t('dome.rule.' + v.rule), v.read === 'none' ? t('dome.read.none') : v.label, v.read === 'none' ? '' : citation(result.spec, v), v.read === 'none' ? '' : t('dome.read.' + v.read)));
  }
  return out.join('\n') + '\n';
}
