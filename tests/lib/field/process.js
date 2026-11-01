/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: process names and sources (data) */
/**
 * process.js — manufacturing process profiles for generators (0.8 CE.6; DOM-free). A profile says what a process can make: the
 * thinnest wall and narrowest gap it holds, the steepest overhang it prints without support, whether loose powder or resin has to
 * be able to leave, and how wide the way out must be. A generator reads the profile and sizes its parts to it; mfg.js checks
 * the result against it.
 *
 * THE NUMBERS ARE TYPICAL DESIGN-GUIDE VALUES, NOT A MACHINE'S SPECIFICATION. They are the round figures that public design guides give for the
 * process in general (Protolabs additive design guidelines, Formlabs and Xometry design guides, EOS and Renishaw metal powder bed
 * fusion design guides, Gibson/Rosen/Stucker "Additive Manufacturing Technologies" 2nd ed.). A given machine, material and orientation
 * can do better or worse: replace them with the shop's own figures (`custom`, or edit the profile) before relying on a check.
 * All lengths in millimetres, angles in degrees from vertical (an overhang of 45° or less prints without support).
 *
 *   PROCESSES  { fdm, sla, sls, metal }     profileOf(name) → a copy with `name`; customProfile({...}) → a checked custom profile
 */
export const PROCESSES = {
  fdm: {
    label: 'FDM / FFF (extruded plastic)', short: 'FDM', minWall: 0.8, minGap: 0.5, minHole: 1.0, overhang: 45, needsDrain: false, drain: 0, supportsIslands: false, layer: 0.2,
    ref: 'Typical design-guide values (Protolabs / Xometry FDM guides): two 0.4 mm perimeters, 45° overhang, closed cavities allowed',
  },
  sla: {
    label: 'SLA / DLP (resin)', short: 'SLA', minWall: 0.6, minGap: 0.5, minHole: 0.5, overhang: 30, needsDrain: true, drain: 3.5, supportsIslands: false, layer: 0.05,
    ref: 'Typical design-guide values (Formlabs resin design guide): 0.4-0.8 mm walls, 3.5 mm drain holes so uncured resin can leave, supports under overhangs',
  },
  sls: {
    label: 'SLS (nylon powder bed)', short: 'SLS', minWall: 0.8, minGap: 0.8, minHole: 1.5, overhang: null, needsDrain: true, drain: 5, supportsIslands: false, layer: 0.1,
    ref: 'Typical design-guide values (Protolabs SLS design guide): walls 0.7-1 mm, gaps 0.8 mm, at least 5 mm holes to clear loose powder, no supports needed',
  },
  metal: {
    label: 'Metal powder bed fusion (SLM / DMLS)', short: 'Metal powder bed', minWall: 0.4, minGap: 0.5, minHole: 0.5, overhang: 45, needsDrain: true, drain: 3, supportsIslands: false, layer: 0.04,
    ref: 'Typical design-guide values (EOS / Renishaw / Protolabs metal AM guides): walls 0.4-0.5 mm, 45° overhang without support, powder escape holes 2-5 mm',
  },
};
export const PROCESS_NAMES = Object.keys(PROCESSES);
export function profileOf(name) {
  const p = PROCESSES[name];
  if (!p) throw Object.assign(new Error('process: unknown process ' + name), { code: 'process', vars: { name, known: PROCESS_NAMES.join(', ') } });
  return { name, ...p };
}
/** A profile from numbers (untrusted): every length positive and sane, unknown keys dropped. */
export function customProfile(o, base = 'fdm') {
  const p = { ...profileOf(base), name: 'custom', label: 'Custom', short: 'the custom process', ref: 'The shop\'s own figures' };
  const lens = ['minWall', 'minGap', 'minHole', 'drain', 'layer'];
  for (const k of lens) if (o[k] !== undefined) { if (!(typeof o[k] === 'number' && o[k] >= 0 && o[k] <= 1000)) throw Object.assign(new Error('process: ' + k), { code: 'value', vars: { what: k } }); p[k] = o[k]; }
  if (o.overhang !== undefined) { if (o.overhang !== null && !(typeof o.overhang === 'number' && o.overhang >= 0 && o.overhang <= 90)) throw Object.assign(new Error('process: overhang'), { code: 'value', vars: { what: 'overhang' } }); p.overhang = o.overhang; }
  if (o.needsDrain !== undefined) p.needsDrain = !!o.needsDrain;
  if (p.needsDrain && !(p.drain > 0)) p.drain = 3;
  return p;
}
