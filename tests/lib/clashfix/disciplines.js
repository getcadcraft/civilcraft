/* SPDX-License-Identifier: Apache-2.0 */
/**
 * disciplines.js — what each discipline may change and how far (cc-clashfix, 0.9 EG.42). DOM-free, no imports. Data first (rule 44):
 * the limits, rule numbers and cost proxies are plain objects a host or a pack can override (coordinate(…, { limits })).
 *
 *   DISCIPLINES        structure, mechanical, plumbing, electrical, architecture: the element kinds each one owns and its tools
 *   LIMITS             each tool's limits (mm, ratios) and each check's numbers
 *   COSTS              a cost proxy per metre of run added and per fitting, and a fixed cost per kind of change — a way to rank
 *                      proposals against each other, never a price
 *   IFC_CLASSES        the IFC classes of each discipline (a host maps its elements; Studio Live scopes use them as tags, EG.41)
 *   disciplineOfIfc(cls, { system }) → discipline | null         kindOfIfc(cls) → kind
 *   disciplineOfRun(kind, system)  → 'mechanical' | 'plumbing' | 'electrical'
 *   ownerOf(element) → its discipline    toolsOf(discipline) → [op]    scopeTags(discipline) → IFC classes
 *   isDrain(element)
 */

export const DISCIPLINE_IDS = ['structure', 'mechanical', 'plumbing', 'electrical', 'architecture'];

/** Kinds each discipline owns, and the ops its assistant may propose (only on elements it owns). */
export const DISCIPLINES = {
  structure: { kinds: ['beam', 'column', 'slab', 'brace', 'footing'], tools: ['move_column', 'opening'], checks: ['span', 'web_opening', 'signoff'] },
  mechanical: { kinds: ['duct', 'hvac_pipe'], tools: ['shift', 'crossover', 'resize'], checks: ['clearance', 'headroom', 'fittings'] },
  plumbing: { kinds: ['pipe'], tools: ['shift', 'crossover'], checks: ['clearance', 'headroom', 'drain_slope'] },
  electrical: { kinds: ['tray', 'conduit'], tools: ['shift', 'crossover'], checks: ['clearance', 'headroom', 'access_above'] },
  architecture: { kinds: ['wall', 'ceiling', 'door', 'window', 'covering'], tools: ['move_wall', 'opening'], checks: ['load_bearing', 'fire_rating'] },
};

export const LIMITS = {
  tolerance: 10,                       // mm of overlap ignored (the sandbox check)
  gap: 25,                             // mm kept clear round a run (plus its insulation)
  shift: { dz: 600, dxy: 600 },        // mm a whole run may move up/down and sideways
  crossover: { rise: 600, minLeg: 150, perRun: 2 },   // mm a detour may climb or drop; the shortest leg beside the obstacle; detours per run
  resize: { aspect: 4, minSide: 100 }, // a rectangular duct made flatter: largest width : height, smallest side (mm); the area is kept
  move_column: { dxy: 300, spanGrow: 0.10 },          // mm a column may move in plan; a beam framing into it may grow by this share of its span
  move_wall: { dxy: 200 },             // mm a wall known not to carry load may move across its length
  opening: { depthRatio: 0.4, endRatio: 1.0, centreRatio: 0.1 },   // a web opening: at most 40 % of the beam's depth, at least one depth from its ends, near mid-depth
  headroom: 2100,                      // mm: a run's underside never goes below the lower of where it was and level + this (host gives the level)
  access_above: 150,                   // mm clear above a cable tray to lay cable
};

export const COSTS = {
  perMetre: { duct: 120, hvac_pipe: 70, pipe: 60, tray: 50, conduit: 25 },
  perFitting: { duct: 90, hvac_pipe: 40, pipe: 30, tray: 35, conduit: 10 },
  fixed: { shift: 40, crossover: 0, resize: 150, move_column: 2500, move_wall: 600, opening: 400 },
  perMetreMoved: { duct: 20, hvac_pipe: 15, pipe: 15, tray: 10, conduit: 5, column: 0, wall: 300 },
};

export const IFC_CLASSES = {
  structure: ['IfcBeam', 'IfcBeamStandardCase', 'IfcColumn', 'IfcColumnStandardCase', 'IfcMember', 'IfcMemberStandardCase', 'IfcSlab', 'IfcSlabStandardCase', 'IfcFooting', 'IfcPile', 'IfcPlate'],
  mechanical: ['IfcDuctSegment', 'IfcDuctFitting', 'IfcAirTerminal', 'IfcFlowSegment', 'IfcFlowFitting'],
  plumbing: ['IfcPipeSegment', 'IfcPipeFitting', 'IfcValve', 'IfcSanitaryTerminal', 'IfcFlowController'],
  electrical: ['IfcCableCarrierSegment', 'IfcCableCarrierFitting', 'IfcCableSegment', 'IfcLightFixture', 'IfcElectricAppliance'],
  architecture: ['IfcWall', 'IfcWallStandardCase', 'IfcCovering', 'IfcDoor', 'IfcWindow', 'IfcCurtainWall', 'IfcRailing', 'IfcStair', 'IfcRamp'],
};
const KIND_OF = {
  IfcBeam: 'beam', IfcBeamStandardCase: 'beam', IfcMember: 'brace', IfcMemberStandardCase: 'brace', IfcColumn: 'column', IfcColumnStandardCase: 'column',
  IfcSlab: 'slab', IfcSlabStandardCase: 'slab', IfcFooting: 'footing', IfcPile: 'footing', IfcPlate: 'slab',
  IfcDuctSegment: 'duct', IfcDuctFitting: 'duct', IfcPipeSegment: 'pipe', IfcPipeFitting: 'pipe', IfcValve: 'pipe', IfcFlowSegment: 'duct', IfcFlowFitting: 'duct',
  IfcCableCarrierSegment: 'tray', IfcCableCarrierFitting: 'tray', IfcCableSegment: 'conduit',
  IfcWall: 'wall', IfcWallStandardCase: 'wall', IfcCurtainWall: 'wall', IfcCovering: 'ceiling', IfcDoor: 'door', IfcWindow: 'window',
};
export const kindOfIfc = (cls) => KIND_OF[cls] || 'other';
export function disciplineOfIfc(cls) {
  for (const d of DISCIPLINE_IDS) if (IFC_CLASSES[d].includes(cls)) return d;
  return null;
}

/** Pipe systems that serve heating and cooling belong to mechanical; water, drains, gas and fire to plumbing. */
const HVAC_PIPE = new Set(['chw', 'hhw', 'refl', 'refg']);
export function disciplineOfRun(kind, system) {
  if (kind === 'tray' || kind === 'conduit') return 'electrical';
  if (kind === 'duct' || kind === 'hvac_pipe') return 'mechanical';
  return HVAC_PIPE.has(system) ? 'mechanical' : 'plumbing';
}
export const runKind = (kind, system) => (kind === 'pipe' && HVAC_PIPE.has(system) ? 'hvac_pipe' : kind);

export const ownerOf = (e) => e.discipline || (e.path ? disciplineOfRun(e.kind, e.system) : DISCIPLINE_IDS.find((d) => DISCIPLINES[d].kinds.includes(e.kind)) || null);
export const toolsOf = (d) => (DISCIPLINES[d] ? DISCIPLINES[d].tools.slice() : []);
export const scopeTags = (d) => (IFC_CLASSES[d] ? IFC_CLASSES[d].slice() : []);
export const isDrain = (e) => !!(e.drain || (e.slope && e.slope > 0));

/** Limits with a host's or a pack's numbers laid over (one level deep). */
export function mergeLimits(over) {
  const out = JSON.parse(JSON.stringify(LIMITS));
  for (const [k, v] of Object.entries(over || {})) out[k] = v && typeof v === 'object' && !Array.isArray(v) ? { ...(out[k] || {}), ...v } : v;
  return out;
}
