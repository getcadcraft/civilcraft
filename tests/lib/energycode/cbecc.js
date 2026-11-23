/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cbecc.js — a house as a CBECC single-family project file (.ribd25): the envelope, for the energy consultant to finish (0.11 T24.10). Host-free.
 *
 * California's performance approach is worked out only by software the Energy Commission has approved; its own program is CBECC. This writes
 * what a drawing knows into that program's project file, so the consultant starts from the model and not from a blank form: the place and
 * climate zone, the conditioned zone, each exterior wall by the direction it faces with its windows and doors, the ceiling below the attic,
 * the attic, the floor over the crawl space or the slab, and their constructions. It writes NO heating, cooling, ducts, water heating,
 * ventilation, solar or battery: the consultant adds those in the program. It is not a compliance result and produces none.
 *
 *   cbeccProject(building, opts) → { ok: true, doc, text, assumed: [key…], left: [key…] } | { ok: false, missing: [key…] }
 *       building = panel.js buildingOf() plus the model's `faces`, `height`, `stories`, `perimeter`, window `w` / `h` / `wallKey`
 *       opts = { name, zone (number), words: the pack's CBECC word lists (packs/<id>.cbecc.json) }
 *       assumed = what the file states that nobody said (each named, so the panel can list it); left = what the consultant must add
 * Every class, property and word written is checked against the program's own data model by bin/test-energy-code.mjs (ribd.js checkRibd).
 * Nothing is written unless everything the envelope needs has been stated: a missing value is listed, never filled in.
 */
import { writeRibd } from './ribd.js';

const r2 = (x) => Math.round(x * 100) / 100;
const DIRS = [[0, 'Front', 'North'], [90, 'Left', 'East'], [180, 'Back', 'South'], [270, 'Right', 'West']];
const dirOf = (bearing) => DIRS.find(([b]) => Math.abs(((bearing - b + 540) % 360) - 180) < 0.5) || null;
const clean = (s) => String(s || '').replace(/["\r\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);

export function cbeccProject(building, { name = 'House', zone = null, words } = {}) {
  const B = building || {}, W = words || {}, missing = [], assumed = [], left = ['systems', 'pv', 'bedrooms', 'garage', 'shading', 'run'];
  const cavityWord = (r) => (r === 0 ? W.noCavity : W.cavity?.[String(r)] || null), sheathWord = (r) => (r === 0 ? W.noSheath : W.sheath?.[String(r)] || null);
  if (!zone || !W.zones?.[String(zone)]) missing.push('zone');
  if (!(B.cfa > 0)) missing.push('cfa');
  if (!(B.height > 0)) missing.push('height');
  const faces = (B.faces || []).filter((f) => f.gross > 0);
  if (!faces.length) missing.push('walls');
  if (faces.some((f) => typeof f.bearing !== 'number')) missing.push('north');
  const types = new Map((B.walls || []).map((w) => [w.key, w]));
  for (const f of faces) {
    const t = types.get(f.key);
    if (!t || !t.framing || t.cavity === null || t.cavity === undefined) { if (!missing.includes('wall-insulation')) missing.push('wall-insulation'); continue; }
    if (!W.frame?.[t.framing + '@' + t.spacing] || !cavityWord(t.cavity) || !sheathWord(t.continuous || 0)) if (!missing.includes('wall-words')) missing.push('wall-words');
  }
  const C = B.ceiling || {}, F = B.floor || {};
  if (C.kind !== 'attic-c') missing.push(C.kind ? 'ceiling-kind' : 'ceiling');
  else if (!(C.r > 0) || !cavityWord(C.r)) missing.push('ceiling-r');
  if (F.kind === 'raised') { if (!(F.r > 0) || !cavityWord(F.r)) missing.push('floor-r'); } else if (F.kind !== 'slab') missing.push('floor');
  const wins = (B.windows || []).filter((w) => w.area > 0);
  if (wins.some((w) => !(w.u > 0) || !(w.shgc > 0))) missing.push('window-values');
  if (wins.some((w) => !(w.w > 0) || !(w.h > 0) || !w.wallKey || typeof w.bearing !== 'number')) missing.push('window-sizes');
  if (!(B.perimeter > 0)) missing.push('perimeter');
  if (missing.length) return { ok: false, missing };

  const objects = [], add = (cls, nm, props) => objects.push({ cls, name: nm, props: props.filter((p) => p[1] !== null && p[1] !== undefined).map(([key, value]) => ({ key, index: null, value })) });
  const stories = B.stories >= 1 ? Math.round(B.stories) : 1, footprint = r2(B.cfa / stories);
  if (stories > 1) assumed.push('footprint');
  const zip = /^\d{5}/.test(String(B.postcode || '')) ? Number(String(B.postcode).slice(0, 5)) : null;
  add('Proj', clean(name) || 'House', [['RunTitle', clean(name) || 'House'], ['AnalysisType', 'Proposed and Standard'], ['StandardsVersion', 'Compliance 2026'], ['ClimateZone', W.zones[String(zone)]], ['ZipCode', zip],
    ['RunScope', 'Newly Constructed'], ['IsMultiFamily', 0], ['SFamDwellingType', 'Single Family Detached'], ['Status', 'New'], ['FrontOrientation', 0], ['HasGarage', 0]]);
  add('Zone', 'Conditioned', [['Type', 'Conditioned'], ['Status', 'New'], ['FloorArea', r2(B.cfa)], ['CeilingHeight', r2(B.height)], ['NumStories', stories]]);
  add('CeilingBelowAttic', 'Ceiling below attic', [['Status', 'New'], ['IsVerified', 0], ['Area', footprint], ['Construction', 'Ceiling R-' + C.r], ['AtticZone', 'Attic']]);

  // one wall per wall type and direction, front (north, bearing 0) first and clockwise; its windows and doors follow it
  const consOf = (t) => 'Wall ' + clean(t.name).slice(0, 30) + ' R-' + t.cavity + (t.continuous ? ' + R-' + t.continuous : '');
  const groups = new Map();
  for (const f of faces) { const k = f.key + '|' + (Math.round(f.bearing * 10) / 10); const g = groups.get(k) || { key: f.key, bearing: Math.round(f.bearing * 10) / 10, gross: 0 }; g.gross += f.gross; groups.set(k, g); }
  const used = new Set(), unique = (base) => { let n = base, i = 2; while (used.has(n)) n = base + ' ' + i++; used.add(n); return n; };
  for (const g of [...groups.values()].sort((a, b) => a.bearing - b.bearing || a.key.localeCompare(b.key))) {
    const d = dirOf(g.bearing), t = types.get(g.key), wallName = unique((d ? d[2] : Math.round(g.bearing) + ' deg') + ' wall');
    add('ExtWall', wallName, [['Status', 'New'], ['IsVerified', 0], ['Orientation', d ? d[1] : '- specify -'], ['OrientationValue', g.bearing], ['Area', r2(g.gross)], ['Construction', consOf(t)], ['Exception', '- none -'], ['Tilt', 90]]);
    const here = (x) => x.wallKey === g.key && Math.abs(x.bearing - g.bearing) < 0.06;
    for (const w of wins.filter(here)) add('Win', unique(clean(w.name) || 'Window'), [['Status', 'New'], ['IsVerified', 0], ['SpecMethod', 'Window Dimensions (required for fins/overhangs)'], ['Area', r2(w.w * w.h)], ['Height', r2(w.h)], ['Width', r2(w.w)], ['Multiplier', 1],
      ['NFRCUfactor', w.u], ['NFRCSHGC', w.shgc], ['UfactorSHGCSource', 'NFRC'], ['ExteriorShade', 'Insect Screen (default)'], ['ModelFinsOverhang', 0]]);
    for (const dr of (B.doors || []).filter((x) => x.area > 0 && here(x))) add('Door', unique(clean(dr.name) || 'Door'), [['Status', 'New'], ['IsVerified', 0], ['Area', r2(dr.area)], ['Ufactor', dr.u > 0 ? dr.u : null]]);
  }
  if ((B.doors || []).some((d) => d.area > 0 && !(d.u > 0))) left.push('door-u');

  if (F.kind === 'raised') {
    add('FloorOverCrawl', 'Floor over crawl space', [['Status', 'New'], ['IsVerified', 0], ['Area', footprint], ['FloorZ', 2], ['Construction', 'Floor R-' + F.r]]);
    add('CrawlSpace', 'Crawl space', [['Type', 'Normal (vented)'], ['Perimeter', r2(B.perimeter)], ['AvgWallHeight', 2]]);
    assumed.push('crawl-height', 'floor-joists', 'floor-surface');
  } else {
    add('SlabFloor', 'Slab', [['Status', 'New'], ['IsVerified', 0], ['Area', footprint], ['FloorZ', 0], ['Surface', 'Default (80% carpeted/covered, 20% exposed)'], ['Perimeter', r2(B.perimeter)], ['HeatedSlab', 0], ['EdgeInsulation', 0]]);
    assumed.push('slab-surface');
  }
  add('Attic', 'Attic', [['Type', 'Ventilated'], ['Status', 'New'], ['IsVerified', 0], ['RoofRise', 5], ['Construction', 'Attic roof']]);
  assumed.push('roof-pitch', 'roofing');

  const seen = new Set();
  for (const g of groups.values()) {
    const t = types.get(g.key), nm = consOf(t);
    if (seen.has(nm)) continue;
    seen.add(nm);
    const stucco = /stucco|render/i.test(String(t.name));
    if (!stucco && !assumed.includes('wall-finish')) assumed.push('wall-finish');
    add('Cons', nm, [['CanAssignTo', 'Exterior Walls'], ['Type', 'Wood Framed Wall'], ['InsideFinishLayer', 'Gypsum Board'], ['CavityLayer', cavityWord(t.cavity)], ['FrameLayer', W.frame[t.framing + '@' + t.spacing]],
      ['SheathInsulLayer', sheathWord(t.continuous || 0)], ['WallExtFinishLayer', stucco ? '3 Coat Stucco' : 'All Other Siding']]);
  }
  add('Cons', 'Ceiling R-' + C.r, [['CanAssignTo', 'Ceilings (below attic)'], ['Type', 'Wood Framed Ceiling'], ['InsideFinishLayer', 'Gypsum Board'], ['CavityLayer', cavityWord(C.r)], ['FrameLayer', '2x4 Bottom Chord of Truss @ 24 in. O.C.']]);
  add('Cons', 'Attic roof', [['CanAssignTo', 'Attic Roofs'], ['Type', 'Wood Framed Ceiling'], ['RoofingLayer', 'Light Roof (Asphalt Shingle)'], ['RoofDeckLayer', 'Wood Siding/sheathing/decking'], ['CavityLayer', W.noCavity],
    ['FrameLayer', '2x4 Top Chord of Roof Truss @ 24 in. O.C.'], ['RadiantBarrier', C.radiant === true ? 1 : 0], ['RoofingType', 'all others']]);
  if (C.radiant !== true && C.radiant !== false) assumed.push('radiant');
  if (F.kind === 'raised') add('Cons', 'Floor R-' + F.r, [['CanAssignTo', 'Floors Over Crawlspace'], ['Type', 'Wood Framed Floor'], ['FloorSurfaceLayer', 'Carpeted'], ['FloorDeckLayer', 'Wood Siding/sheathing/decking'], ['CavityLayer', cavityWord(F.r)], ['FrameLayer', '2x6 @ 16 in. O.C.']]);

  const doc = { ruleset: W.ruleset, objects };
  return { ok: true, doc, text: writeRibd(doc), assumed, left };
}
