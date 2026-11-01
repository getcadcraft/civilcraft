/* SPDX-License-Identifier: Apache-2.0 */
/**
 * problems.js — the truss check as shared Problems (rule 29; docs/0.8-PROBLEMS-SPEC.md § 1–2), in the shape mep/problems-mep.js builds.
 *   trussProblems(design, spec) → [problem]    layoutProblems(layout) → [problem]
 * Source `bimcraft.addon.trusscraft`. Words are English; `msg.key` is for the language files later. The first problem of any result is the
 * label that this is not truss design.
 */
import { DISCLAIMER, TABLE_LABEL, LOAD_CASE_LABEL, PLATE_LABEL, BENDING_LABEL, DEFLECTION_LABEL, COMBO_LABEL } from './tables.js';

let SRC = 'bimcraft.addon.trusscraft';
/** The source name carries the host app (`partcraft.addon.trusscraft`): set once by the panel. */
export const sourceName = () => SRC;
export function setSourceName(n) { SRC = String(n || SRC); }
const f1 = (x) => Math.round(x * 10) / 10, f2 = (x) => Math.round(x * 100) / 100;
function P(code, severity, text, extra = {}) {
  return { code, severity, part: extra.part || '', msg: { key: 'truss.' + code, vars: extra.vars || {} }, text, about: extra.about || [], source: { name: SRC }, ...(extra.req ? { req: extra.req } : {}), ...(extra.found ? { found: extra.found } : {}), ...(extra.fixes ? { fixes: extra.fixes } : {}) };
}

export function trussProblems(d, spec = {}) {
  const out = [P('notdesign', 'warning', DISCLAIMER, { part: 'label' })];
  if (!d || !d.ok) return out;
  const { g, res } = d;
  if (res.status === 'mechanism') out.push(P('mechanism', 'error', g.type === 'attic'
    ? `The attic truss is a mechanism with pinned room corners (${res.dof} degree of freedom: the room's floor, knee walls and ceiling tie make a rectangle, and a rectangle with pinned corners folds flat). No forces are given. Set the room corners to rigid (a stated idealisation) to get a stable frame, or add a diagonal inside the room.`
    : `The ${g.type} truss is a mechanism as a pin-jointed frame (${res.dof} degree${res.dof > 1 ? 's' : ''} of freedom): its forces cannot be found by the method of joints. It stands only if its joints resist bending, which needs the truss designer's analysis.`, { part: 'mechanism', vars: { dof: res.dof } }));
  if (d.frame) out.push(P('atticfixity', 'warning', `Attic truss: the room corners (${d.frame.room.join(', ')}) are treated as ${d.frame.fixity} so that the room is a stable frame; every force in this truss depends on that statement. Plates are not rigid: the manufacturer's rotational stiffness for the plates at those corners decides whether the idealisation holds. The room members are checked for bending only if you gave an Fb.`, { part: 'room' }));
  else if (res.status === 'indeterminate') out.push(P('indeterminate', 'error', `The ${g.type} truss has ${res.extra} more members than a pin-jointed frame needs, so the method of joints cannot give its forces.`, { part: 'indeterminate' }));
  else if (res.status === 'unstable') out.push(P('unstable', 'error', 'The members do not form a stable frame between the bearings.', { part: 'unstable' }));
  for (const r of d.rows) {
    if (r.util > 1) out.push(P('overstress', 'error', `${r.mark} (${r.size}) is at ${f2(r.util)} of its ${r.kind === 'T' ? 'tension' : 'compression'} capacity under ${f1(Math.abs(r.force))} kN${r.combo ? ' (' + r.combo + ')' : ''}.`, { part: r.mark, vars: { mark: r.mark }, req: { op: '<=', value: 1, unit: 'ratio' }, found: { value: f2(r.util), unit: 'ratio' } }));
    else if (r.util > 0.9) out.push(P('nearlimit', 'warning', `${r.mark} (${r.size}) is at ${f2(r.util)} of its capacity.`, { part: r.mark, vars: { mark: r.mark }, req: { op: '<=', value: 1, unit: 'ratio' }, found: { value: f2(r.util), unit: 'ratio' } }));
    if (r.slender) out.push(P('slender', 'warning', `${r.mark} (${r.size}) has a slenderness of ${Math.round(r.slend)}; over 50 it needs a lateral brace or a deeper section.`, { part: r.mark, vars: { mark: r.mark } }));
  }
  if (d.heel.short) out.push(P('heel', 'warning', `The stated heel height of ${d.heel.stated} mm is less than the ${d.heel.needed} mm the chords need at the outer face (plumb cut of the top chord over half the bottom chord).`, { part: 'heel', req: { op: '>=', value: d.heel.needed, unit: 'mm' }, found: { value: d.heel.stated, unit: 'mm' } }));
  if (g.bearings && g.bearings.length) out.push(P('stub', 'note', `Raised heel: a ${Math.round(g.raise)} mm bearing stub stands under each heel joint (ST). It carries the vertical reaction in compression; the horizontal reaction at the heel is shear in the stub and its anchorage, which a pin-jointed frame cannot size.`, { part: 'stub' }));
  for (const c of d.cut) if (c.splice) out.push(P('splice', 'warning', `${c.mark} is ${Math.round(c.cutLen)} mm long: longer than the stock length, so it is spliced or ordered longer.`, { part: c.mark }));
  if (g.span > 12000) out.push(P('longspan', 'warning', `A span of ${Math.round(g.span)} mm is long for a single truss: transport, handling and bracing need the manufacturer.`, { part: 'span' }));
  if (spec.spacing > 1200) out.push(P('spacing', 'warning', `A spacing of ${spec.spacing} mm is wide for sawn roof trusses with ordinary sheathing.`, { part: 'spacing', req: { op: '<=', value: 1200, unit: 'mm' }, found: { value: spec.spacing, unit: 'mm' } }));
  const unb = d.rows.filter((r) => r.moment > 0 && !r.bendChecked);
  if (unb.length) out.push(P('bendunchecked', 'note', `Chord bending between panel points: ${unb.map((r) => r.mark + ' ' + f1(r.fb) + ' MPa').join(', ')}. NOT checked: no Fb for this species in the table (add your own species table with an Fb). ${BENDING_LABEL}`, { part: 'bending' }));
  else if (d.rows.some((r) => r.moment > 0)) out.push(P('bending', 'note', `Chord bending is checked with your Fb (${f1(d.fb)} MPa) as a simple span (divisor ${d.momentDiv}). Largest bending stress ${f1(Math.max(...d.rows.map((r) => r.fb || 0)))} MPa.`, { part: 'bending' }));
  if (d.defl) {
    const lim = d.deflLimit > 0 ? g.span / d.deflLimit : 0, txt = `Estimated deflection under dead + snow (unfactored): ${f1(d.defl.max)} mm at x = ${Math.round(d.defl.x)} mm, span / ${d.defl.ratio === Infinity ? '∞' : Math.round(d.defl.ratio)}. ${DEFLECTION_LABEL}`;
    if (lim && d.defl.max > lim) out.push(P('deflection', 'error', `${txt} Over your limit of span / ${d.deflLimit} (${f1(lim)} mm).`, { part: 'deflection', req: { op: '<=', value: f1(lim), unit: 'mm' }, found: { value: f1(d.defl.max), unit: 'mm' } }));
    else out.push(P('deflection', 'note', lim ? `${txt} Within your limit of span / ${d.deflLimit}.` : `${txt} No limit entered, so none is checked.`, { part: 'deflection' }));
  }
  if (d.bearing) {
    const b = d.bearing, R = Math.max(b.maxLeft, b.maxRight), Fcp = b.Fcp;
    out.push(P('bearing', 'note', `Bearings: largest reaction ${f1(R)} kN at a heel` + (Fcp ? `; at your Fc⊥ of ${Fcp} MPa on the 38 mm thick bottom chord it needs ${Math.round((R * 1000) / (Fcp * 38))} mm of bearing length.` : '. Bearing length needs the wall plate\'s Fc⊥ (not in the species table unless you add an Fcp): check the plate and the wall below.') + (b.thrust > 0.01 ? ` Horizontal heel reaction ${f1(b.thrust)} kN: anchorage / shear at the bearing.` : ''), { part: 'bearing' }));
    const up = Math.min(b.minLeft, b.minRight);
    if (up < -1e-6) out.push(P('uplift', 'warning', `Net uplift at a bearing: ${f1(-up)} kN upward in one of your combinations. Hold-down / anchorage to the wall is for the designer; a bottom chord that goes into compression in that combination is checked above as a compression member.`, { part: 'uplift', req: { op: '>=', value: 0, unit: 'kN' }, found: { value: f1(up), unit: 'kN' } }));
  }
  if (d.comboDefs && !d.comboDefs.some((c) => c.fW || c.fU)) out.push(P('nowind', 'note', 'Wind and uplift are not checked: no combination has a wind or uplift factor. Enter the pressures and factors from your standard under Loads to run them.', { part: 'loads' }));
  else if (d.comboDefs && d.comboDefs.some((c) => c.fW || c.fU) && !(d.loads.windward || d.loads.leeward || d.loads.uplift)) out.push(P('nowind', 'warning', 'A combination has a wind or uplift factor but every wind and uplift pressure is zero: nothing was run for it.', { part: 'loads' }));
  out.push(P('bracing', 'note', `Bracing checklist (the truss designer's to design): top chord lateral restraint at no more than ${d.opts.braceLen} mm (assumed in the checks); bottom chord lateral bracing; diagonal bracing in the roof plane and in the vertical plane between trusses; temporary bracing while erecting; ${(d.rows.filter((r) => r.kind === 'C' && r.role !== 'top' && r.role !== 'bottom' && r.slender).map((r) => r.mark).join(', ')) || 'no web'} slender in compression (T-brace or a deeper section).`, { part: 'bracing' }));
  if (g.type === 'scissor') out.push(P('scissor', 'note', 'A scissor truss pushes its bearings apart under load. One bearing is treated as a roller; the wall must tolerate the movement, or be designed for the thrust.', { part: 'scissor' }));
  out.push(P('defaults', 'note', TABLE_LABEL + ' ' + LOAD_CASE_LABEL + ' ' + COMBO_LABEL + ' ' + (d.plates ? 'Joint plates are from your table "' + d.plates.label + '": capacities are as you gave them, not checked here for teeth, net section or direction.' : PLATE_LABEL), { part: 'defaults' }));
  return out;
}

export function layoutProblems(L, rule = {}) {
  const out = [];
  if (!L || !L.ok) return out;
  for (const i of L.issues || []) {
    if (i.code === 'notrect') out.push(P('notrect', 'warning', `The roof outline is not a rectangle: each station was cut by the roof's own surface and ${i.vars.spans} truss span${i.vars.spans > 1 ? 's were' : ' was'} found. Hip and valley kinks in the roof are joints of the section trusses; check each one.`, { part: 'layout' }));
    else if (i.code === 'hip') out.push(P('hip', 'warning', 'The roof has hipped ends: the trusses are laid out as for a gable roof over the outline.', { part: 'layout' }));
    else if (i.code === 'longspan') out.push(P('longspan', 'warning', `A span of ${Math.round(i.vars.span)} mm is long for a single truss: transport, handling and bracing need the manufacturer.`, { part: 'span' }));
    else if (i.code === 'endzone') out.push(P('endzone', 'warning', `Hip end (${i.vars.end}): ${i.vars.n} station${i.vars.n > 1 ? 's' : ''} within ${i.vars.within} mm of the end wall are lower than the smallest truss height of ${i.vars.minHeight} mm and are NOT made. The hip end there is framed on the wall plate (ladder or jack rafters): the truss designer provides it.`, { part: 'layout' }));
    else if (i.code === 'smalljacks') out.push(P('smalljacks', 'warning', `Hip end (${i.vars.end}): ${i.vars.n} jack${i.vars.n > 1 ? 's' : ''} near the side walls are lower than ${i.vars.minHeight} mm and are NOT made; they are framed by hand over the wall plate.`, { part: 'layout' }));
    else if (i.code === 'nogirder') out.push(P('nogirder', 'warning', `Hip end (${i.vars.end}): no station was tall enough to be the girder, so no jack set was made there.`, { part: 'layout' }));
    else if (i.code === 'valleycross') out.push(P('valleycross', 'note', `Station at ${i.vars.u} mm crosses a valley: the truss spans through it with the valley as a kink in its top chord. For a long crossing, a valley set over a main roof is the usual framing (turn on Valley set).`, { part: 'valley' }));
    else if (i.code === 'valleyskew') out.push(P('valleyskew', 'warning', `A valley at (${i.vars.x}, ${i.vars.y}) is not square to a ridge: a valley set is not made for it. The sections that cross it are made as they are.`, { part: 'valley' }));
    else if (i.code === 'valleysetskip') out.push(P('valleysetskip', 'warning', 'Valley set asked for, but no pair of valleys square to the main ridge was found in this roof: the roof was laid out by sections instead.', { part: 'valley' }));
    else if (i.code === 'valleylow') out.push(P('valleylow', 'note', `The valley set stops ${i.vars.from} mm from the ridge junction: the next truss would be only ${i.vars.rise} mm high. The last stretch is framed by hand.`, { part: 'valley' }));
    else if (i.code === 'mouth') out.push(P('mouth', 'warning', `Valley set: ${i.vars.n} main truss${i.vars.n === 1 ? '' : 'es'} end at the wing's mouth. They need a girder truss or a bearing wall along the mouth, which is NOT generated.`, { part: 'valley' }));
    else if (i.code === 'valleyload') out.push(P('valleyload', 'note', 'The valley trusses stand on the main trusses\' top chords; their end reactions are listed with the valley trusses. They are NOT added to the main trusses\' loads here.', { part: 'valley' }));
  }
  for (const f of L.failures || []) out.push(P('failed', 'error', f.error === 'valleyparams' ? 'Valley set: the wing width and both pitches are needed.' : `Station at ${f.u} mm could not be generated (${f.error}) and is not in the set.`, { part: 'layout' }));
  if (L.valley && L.valley.ok) out.push(P('valleyload', 'note', `Valley set: ${L.valley.trusses.length} valley trusses stand on the main roof (the wing ridge is ${Math.round(L.valley.ridgeZ)} mm above the plate). Their end reactions load the main trusses' top chords: they are NOT added to the main trusses' loads here.`, { part: 'valley' }));
  return out;
}
