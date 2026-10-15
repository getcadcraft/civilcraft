/* SPDX-License-Identifier: Apache-2.0 */
// General contractor (0.5 TK.3): a starter estimate organized by CSI MasterFormat division — general requirements, demolition,
// concrete, masonry, metals, wood, thermal and moisture, openings, finishes, specialties, plumbing, HVAC, electrical,
// earthwork, exterior improvements and utilities. Trade assemblies are taken from the trade packs (same formulas, keys
// prefixed gc-) so the two never drift; the rest are written here. CC0-1.0 data.
import { pack, twin, one } from './common.mjs';
import concrete from './concrete.mjs';
import masonry from './masonry.mjs';
import drywall from './drywall-framing.mjs';
import carpentry from './finish-carpentry.mjs';
import insulation from './insulation.mjs';
import roofingC from './roofing-commercial.mjs';
import painting from './painting.mjs';
import flooring from './flooring.mjs';
import plumbing from './plumbing.mjs';
import hvac from './hvac.mjs';
import electrical from './electrical.mjs';
import landscape from './landscape.mjs';

/** Items `keys` of a trade pack (with their metric twins), keys prefixed gc- so they live side by side with the trade pack's. */
function from(p, keys) {
  const out = [];
  for (const k of keys) {
    for (const it of p.items.filter((i) => i.key === k || i.key === k + '-m')) {
      out.push({ ...it, key: 'gc-' + it.key, ...(it.twin ? { twin: 'gc-' + it.twin } : {}), group: 'Division ' + it.csi.slice(0, 2) });
    }
    if (!p.items.some((i) => i.key === k)) throw new Error(p.id + ': no item ' + k);
  }
  return out;
}
const div = (csi) => 'Division ' + csi.slice(0, 2);

const items = [
  // 01 General requirements
  one({ key: 'gc-temp-toilet', csi: '01 51 00', group: div('01'), type: 'count', src: ['osha-1926'], assume: ['Count unit-months: one portable toilet for a month = 1 (OSHA 1926.51 sets how many for the crew size).', 'Service weekly: 4.33 visits a month.'], note: 'Count one mark per toilet per month on site (or type the count in a typical group).', name: 'Temporary toilet, per unit-month', unit: 'EA', c: [['Portable toilet rental (month)', 'EA', 'N'], ['Service visits', 'EA', 'ceil(N*4.33)']] }),
  one({ key: 'gc-dumpster', csi: '01 74 19', group: div('01'), type: 'count', src: ['osha-1926'], assume: ['A 30 CY roll-off of mixed construction debris weighs about 4 tons (a starting figure: dense loads weigh more; disposal is billed by weight).'], note: 'Count the dumpster hauls you expect.', name: 'Dumpster haul, 30 CY roll-off', unit: 'EA', c: [['Roll-off haul', 'EA', 'N'], ['Disposal weight (tons)', 'EA', 'N*4']] }),
  twin({ key: 'gc-temp-fence', csi: '01 56 00', group: div('01'), type: 'linear', src: ['osha-1926', 'geometry'], assume: ['Chain-link panels 10 ft long on stands, one extra stand per run; two sandbags per stand.'], note: 'Draw the fence line.', name: ['Temporary chain-link fence 6 ft, panels on stands', 'Temporary chain-link fence 1.83 m, panels on stands'], unit: ['LF', 'm'], c: [[['Fence panel 6 x 10 ft', 'Fence panel 1.83 x 3.05 m'], 'EA', 'ceil(L/10)', 'ceil(L/3.048)', 0], ['Panel stands', 'EA', 'ceil(L/10)+N', 'ceil(L/3.048)+N', 0], ['Sandbags', 'EA', '(ceil(L/10)+N)*2', '(ceil(L/3.048)+N)*2', 0]] }),
  twin({ key: 'gc-final-clean', csi: '01 74 23', group: div('01'), type: 'area', src: ['csi-mf', 'geometry'], assume: ['Final cleaning by floor area; windows and exterior wash are their own items.'], note: 'Measure the floor area to clean.', name: ['Final cleaning, by floor area', 'Final cleaning, by floor area'], unit: ['SF', 'm²'], c: [['Final cleaning', ['SF', 'm²'], 'A', 'A', 0]] }),
  // 02 Existing conditions
  twin({ key: 'gc-demo-partition', csi: '02 41 19', group: div('02'), type: 'linear', h: [9, 2.74], src: ['osha-1926', 'geometry'], assume: ['Gypsum board on studs: about 1 CY of loose debris per 25 SF of wall (both faces and framing; a starting figure).'], note: 'Draw the partitions to remove; the item height is the wall height.', name: ['Selective demolition: gypsum partition, 9 ft', 'Selective demolition: gypsum partition, 2.74 m'], unit: ['LF', 'm'], c: [['Debris (loose)', ['CY', 'm³'], 'A/25', 'A*0.3292', 0]] }),
  twin({ key: 'gc-demo-floor', csi: '02 41 19', group: div('02'), type: 'area', src: ['osha-1926', 'geometry'], assume: ['Resilient or carpet flooring: about 1 CY of loose debris per 200 SF (a starting figure; tile and mortar beds weigh far more).'], note: 'Measure the floor finish to remove.', name: ['Selective demolition: remove floor finish', 'Selective demolition: remove floor finish'], unit: ['SF', 'm²'], c: [['Debris (loose)', ['CY', 'm³'], 'A/200', 'A*0.04115', 0]] }),
  // 03 – 07 from the trade packs
  ...from(concrete, ['sog-4-wwr', 'ftg-20x10', 'wall-8-8', 'flatwork-4']),
  ...from(masonry, ['cmu-8', 'brick-veneer', 'lintel-4']),
  twin({ key: 'gc-handrail', csi: '05 52 13', group: div('05'), type: 'linear', src: ['ibc-1014', 'geometry'], assume: ['Handrail 1-1/2 in steel pipe (IBC 1014.3 graspability); wall brackets at 4 ft at most plus one per run; two returns per run (IBC 1014.6 extensions are part of the run).'], note: 'Draw each handrail run.', name: ['Steel pipe handrail, wall mounted', 'Steel pipe handrail, wall mounted'], unit: ['LF', 'm'], c: [['Steel pipe rail 1-1/2 in', ['LF', 'm'], 'L', 'L', 1000], ['Wall brackets', 'EA', 'ceil(L/4)+N', 'ceil(L/1.2192)+N', 0], ['Rail returns', 'EA', 'N*2', 'N*2', 0]] }),
  ...from(drywall, ['ext-wall-2x6-9']),
  ...from(carpentry, ['base']),
  ...from(insulation, ['batt-r13-9']),
  ...from(roofingC, ['tpo-ma', 'edge-metal']),
  ...from(painting, ['caulk']),
  // 08 Openings
  one({ key: 'gc-hm-door', csi: '08 11 13', group: div('08'), type: 'count', src: ['sdi'], assume: ['A single 3 x 7 ft hollow metal door in a hollow metal frame: 3 hinges (1-1/2 pair), a lockset, a closer, a stop and 3 silencers (hardware sets come from the door schedule).'], note: 'Count each door opening.', name: 'Hollow metal door and frame with hardware', unit: 'EA', c: [['Hollow metal frame', 'EA', 'N'], ['Hollow metal door', 'EA', 'N'], ['Hinges', 'EA', 'N*3'], ['Lockset', 'EA', 'N'], ['Door closer', 'EA', 'N'], ['Door stop', 'EA', 'N'], ['Silencers', 'EA', 'N*3']] }),
  twin({ key: 'gc-window', csi: '08 51 13', group: div('08'), type: 'count', src: ['astm-e2112'], assume: ['Window about 3 x 5 ft: 16 LF of perimeter flashed with tape (ASTM E2112) and sealed (one 10.1 oz cartridge per 25 LF, a starting figure).'], note: 'Count each window.', name: ['Window 3 x 5 ft with flashing tape and sealant', 'Window 0.91 x 1.52 m with flashing tape and sealant'], unit: ['EA', 'EA'], c: [['Window unit', 'EA', 'N', 'N', 0], ['Flashing tape', ['LF', 'm'], 'N*16', 'N*4.8768', 1000], ['Sealant cartridges', 'EA', 'ceil(N*16/25)', 'ceil(N*4.8768/7.62)', 0]] }),
  // 09 Finishes
  ...from(drywall, ['part-steel-12-1x1-9']),
  ...from(painting, ['walls-new-9']),
  twin({ key: 'gc-act-2x4', csi: '09 51 13', group: div('09'), type: 'area', src: ['astm-c636', 'geometry'], assume: ['Lay-in panels 2 x 4 ft (8 SF), 5% waste.', 'Main runners 4 ft o.c. (A / 4 LF); 4 ft cross tees every 2 ft between them (A / 2 LF).', 'Wall angle on the room outline P.', 'Hanger wires 4 ft o.c. along the mains (ASTM C636): one per 16 SF.'], note: 'Measure each ceiling area.', name: ['Acoustical ceiling 2 x 4 ft lay-in, exposed grid', 'Acoustical ceiling 610 x 1220 mm lay-in, exposed grid'], unit: ['SF', 'm²'], c: [['Ceiling panels', 'EA', 'ceil(A/8)', 'ceil(A/0.74322)', 500], ['Main runners', ['LF', 'm'], 'A/4', 'A/1.2192', 500], ['Cross tees 4 ft', ['LF', 'm'], 'A/2', 'A/0.6096', 500], ['Wall angle', ['LF', 'm'], 'P', 'P', 1000], ['Hanger wires', 'EA', 'ceil(A/16)', 'ceil(A/1.48645)', 0]] }),
  ...from(flooring, ['vct', 'carpet-tile', 'rubber-base']),
  // 10 Specialties
  one({ key: 'gc-toilet-acc', csi: '10 28 00', group: div('10'), type: 'count', src: ['ada-2010'], assume: ['An accessible toilet room: grab bars 36 in and 42 in (2010 ADA Standards 604.5), paper holder, mirror, soap and towel dispensers.'], note: 'Count each toilet room.', name: 'Toilet room accessories, accessible single-user room', unit: 'EA', c: [['Grab bar 36 in', 'EA', 'N'], ['Grab bar 42 in', 'EA', 'N'], ['Toilet paper holder', 'EA', 'N'], ['Mirror', 'EA', 'N'], ['Soap dispenser', 'EA', 'N'], ['Paper towel dispenser', 'EA', 'N']] }),
  // 22, 23, 26
  ...from(plumbing, ['wc', 'lav', 'pvc-dwv-4', 'copper-l-34']),
  ...from(hvac, ['rect-20x10', 'diffuser-2x2']),
  ...from(electrical, ['emt-12-3', 'recep-duplex-20', 'lt-troffer-2x4']),
  // 31 Earthwork
  twin({ key: 'gc-excavation', csi: '31 23 16', group: div('31'), type: 'area', h: [3, 0.9144], src: ['osha-1926', 'geometry'], assume: ['Bank volume = area x depth (the item depth); side slopes or benching (OSHA 1926 Subpart P) are not included: widen the area for them.', 'Swell 25% from bank to loose (a starting figure: it depends on the soil).', 'Trucks of 12 CY loose.'], note: 'Measure the excavated area; the item depth is the average cut depth. For cut and fill over a surface, use CivilCraft.', name: ['Bulk excavation to depth, haul off', 'Bulk excavation to depth, haul off'], unit: ['SF', 'm²'], c: [['Excavation (bank)', ['CY', 'm³'], 'A*H/27', 'A*H', 0], ['Haul (loose)', ['CY', 'm³'], 'A*H/27*1.25', 'A*H*1.25', 0], ['Truck loads, 12 CY', 'EA', 'ceil(A*H/27*1.25/12)', 'ceil(A*H*1.25/9.1747)', 0]] }),
  twin({ key: 'gc-trench', csi: '31 23 33', group: div('31'), type: 'linear', h: [4, 1.2192], src: ['osha-1926', 'geometry'], assume: ['Trench 2 ft wide (the item height is its depth); deeper than 5 ft needs protection (OSHA 1926.652), not included.', 'Bedding 6 in under the pipe; backfill = excavation minus bedding (the pipe’s own volume is left in the backfill).'], note: 'Draw the trench line.', name: ['Utility trench 2 ft wide, bedding and backfill', 'Utility trench 0.61 m wide, bedding and backfill'], unit: ['LF', 'm'], c: [['Trench excavation', ['CY', 'm³'], 'L*2*H/27', 'L*0.6096*H', 0], ['Bedding 6 in', ['CY', 'm³'], 'L*2*0.5/27', 'L*0.6096*0.1524', 1000], ['Backfill', ['CY', 'm³'], 'L*2*(H-0.5)/27', 'L*0.6096*(H-0.1524)', 0]] }),
  // 32 Exterior improvements
  twin({ key: 'gc-asphalt', csi: '32 12 16', group: div('32'), type: 'area', src: ['ai-ms4', 'geometry'], assume: ['Hot-mix asphalt 2 in compacted at about 145 lb per cubic foot (a starting figure: use the mix design’s density): tons = A x 2 / 12 x 145 / 2000.', 'Aggregate base 6 in compacted, 15% for compaction.'], note: 'Measure the paved area.', name: ['Asphalt paving 2 in on 6 in aggregate base', 'Asphalt paving 50 mm on 150 mm aggregate base'], unit: ['SF', 'm²'], c: [['Hot-mix asphalt', ['ton', 't'], 'A*2/12*145/2000', 'A*0.0508*2.3227', 500], ['Aggregate base 6 in', ['CY', 'm³'], 'A*6/12/27', 'A*0.1524', 1500]] }),
  ...from(landscape, ['sod']),
  // 33 Utilities
  twin({ key: 'gc-sewer', csi: '33 31 00', group: div('33'), type: 'linear', src: ['astm-d3034', 'geometry'], assume: ['PVC sewer pipe SDR 35 in 14 ft lengths (gasketed bell joints); cleanouts and manholes are counted on their own. Trench and bedding: the trench item.'], note: 'Draw the sewer line.', name: ['Sanitary sewer pipe, PVC SDR 35, 6 in', 'Sanitary sewer pipe, PVC SDR 35, 150 mm'], unit: ['LF', 'm'], c: [['PVC sewer pipe 6 in', ['LF', 'm'], 'L', 'L', 500], [['Pipe lengths, 14 ft', 'Pipe lengths, 4.27 m'], 'EA', 'ceil(L/14)+N', 'ceil(L/4.2672)+N', 0]] }),
].flat();

export default pack({
  id: 'trade.general-contractor', name: 'General contractor, by CSI division', trade: 'General contracting',
  description: 'A starter estimate by CSI MasterFormat division: general requirements, demolition, concrete, masonry, metals, wood, thermal and moisture, openings, finishes, specialties, plumbing, HVAC, electrical, earthwork, exterior improvements and utilities. With the workbook’s material list, quote request, takeoff summary, by-division sheet and markups for labor burden, tax, overhead, profit and bond. Assemblies only: set your own rates.',
  csi: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '22', '23', '26', '31', '32', '33'],
  sources: {
    'ibc-1014': { title: 'International Building Code, Section 1014 Handrails', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
    'sdi': { title: 'ANSI/SDI A250.8, Specifications for Standard Steel Doors and Frames (SDI-100)', publisher: 'Steel Door Institute', url: 'https://www.steeldoor.org/' },
    'astm-e2112': { title: 'ASTM E2112, Standard Practice for Installation of Exterior Windows, Doors and Skylights', publisher: 'ASTM International', url: 'https://www.astm.org/' },
    'ada-2010': { title: '2010 ADA Standards for Accessible Design (604 water closets and toilet compartments)', publisher: 'U.S. Department of Justice', url: 'https://www.ada.gov/' },
    'ai-ms4': { title: 'MS-4, The Asphalt Handbook', publisher: 'Asphalt Institute', url: 'https://www.asphaltinstitute.org/' },
    'astm-d3034': { title: 'ASTM D3034, Standard Specification for Type PSM Poly(Vinyl Chloride) (PVC) Sewer Pipe and Fittings', publisher: 'ASTM International', url: 'https://www.astm.org/' },
  },
  items,
});
