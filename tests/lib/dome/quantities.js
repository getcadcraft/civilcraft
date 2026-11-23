/* SPDX-License-Identifier: Apache-2.0 */
/**
 * quantities.js — what a dome takes to build and what you get inside it (0.11 DOME.1), from the elements build.js made. Host-free.
 * Results in m, m², m³, kg. These are take-off quantities for a first estimate. The steel is an ESTIMATE from a ratio (ratio × concrete volume
 * × 7850 kg/m³ × two directions), not a bar schedule. With a bar size and a spacing, the bars are counted as one mat at that spacing both ways
 * over the shell's mid-surface (length each way = surface ÷ spacing; laps, the ring beam cage and bars round openings are not in it). The concrete to order adds the person's own allowance for rebound and waste.
 */
const STEEL = 7850;   // kg/m³, the density of steel

/** → { rows: [{ id, group, value, unit, note? }], bars: { length (m), mass (kg), area (mm² a bar), ratioCrown, ratioBase } | null, byId } */
export function quantities(d, built) {
  const { elements, metrics: M } = built;
  const vol = (key) => { const e = elements.find((x) => x.key === key); return e ? e.qty.volume / 1e9 : 0; };
  const shell = vol('shell'), stem = vol('stem'), footing = vol('footing'), slab = vol('slab'), sprayed = shell + stem;
  // a mat of bars at one spacing both ways over the shell's mid-surface: each way the total length is the surface ÷ the spacing
  const surface = ((M.formArea - M.openForm + M.innerArea - M.openInner) / 2) / 1e6;
  const bars = d.barDia > 0 && d.barSpacing > 0 ? (() => {
    const each = surface / (d.barSpacing / 1000), area = (Math.PI * d.barDia * d.barDia) / 4;
    return { length: 2 * each, mass: 2 * each * (area / 1e6) * STEEL, area, ratioCrown: area / (d.barSpacing * d.shell), ratioBase: area / (d.barSpacing * (d.shell + d.thicken)), surface };
  })() : null;
  const rows = [
    { id: 'form.area', group: 'form', value: M.formArea / 1e6, unit: 'm2' },
    { id: 'form.circumference', group: 'form', value: M.baseCircumference / 1000, unit: 'm' },
    { id: 'form.radius', group: 'form', value: M.sphereRadius ? M.sphereRadius / 1000 : 0, unit: 'm' },
    { id: 'openings.area', group: 'form', value: M.openForm / 1e6, unit: 'm2' },
    { id: 'foam.volume', group: 'skin', value: vol('foam'), unit: 'm3' },
    { id: 'foam.area', group: 'skin', value: d.foam > 0 ? (M.formArea - M.openForm) / 1e6 : 0, unit: 'm2' },
    { id: 'concrete.shell', group: 'shell', value: shell, unit: 'm3' },
    { id: 'concrete.stem', group: 'shell', value: stem, unit: 'm3' },
    { id: 'concrete.sprayed', group: 'shell', value: sprayed * (1 + d.waste), unit: 'm3', note: 'allowance' },
    { id: 'concrete.footing', group: 'base', value: footing, unit: 'm3' },
    { id: 'concrete.slab', group: 'base', value: slab, unit: 'm3' },
    { id: 'concrete.frames', group: 'shell', value: (M.frameVolume || 0) / 1e9, unit: 'm3', note: 'included' },
    { id: 'steel', group: 'shell', value: 2 * d.rebarRatio * (sprayed + footing) * STEEL, unit: 'kg', note: 'estimate' },
    ...(bars ? [{ id: 'bars.length', group: 'shell', value: bars.length, unit: 'm', note: 'nolaps' }, { id: 'bars.mass', group: 'shell', value: bars.mass, unit: 'kg', note: 'nolaps' }] : []),
    { id: 'trench', group: 'base', value: M.trench / 1e9, unit: 'm3', note: 'estimate' },
    { id: 'inside.area', group: 'inside', value: (M.innerArea - M.openInner) / 1e6, unit: 'm2' },
    { id: 'inside.floor', group: 'inside', value: M.floorArea / 1e6, unit: 'm2' },
    { id: 'inside.headroom', group: 'inside', value: M.headroomArea / 1e6, unit: 'm2' },
    { id: 'inside.diameter', group: 'inside', value: (2 * M.floorRadius) / 1000, unit: 'm' },
    { id: 'inside.height', group: 'inside', value: M.clearHeight / 1000, unit: 'm' },
    { id: 'inside.volume', group: 'inside', value: M.insideVolume / 1e9, unit: 'm3' },
  ].filter((r) => r.value > 0);
  return { rows, bars, byId: Object.fromEntries(rows.map((r) => [r.id, r.value])) };
}
