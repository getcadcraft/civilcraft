/* SPDX-License-Identifier: Apache-2.0 */
/**
 * common.mjs — helpers for writing TakeoffCraft trade packs (0.5 TK.2/TK.3). Each `<trade>.mjs` beside this file exports
 * a pack built with `pack()` and `twin()`; `../build-packs.mjs` writes them to public_html/assets/apps/takeoffcraft/dev/packs/
 * as `<id>.ccpack.json` + `index.json` (format: docs/ADDONS-SPEC.md § 13; reader: dev/packs.js).
 *
 * The packs are CC0-1.0 data. Rules (owner, 2026-10-14): no prices (rates start empty); every assembly names the public
 * references it was written from (`src`), and every number that is a choice rather than a rule is listed in `assume` so the
 * estimator checks it; imperial and metric twins; every pack is a "starter — not reviewed by an estimator yet".
 *
 *   twin({ key, csi, group, type, src, assume, note, waste, name: [imp, met], unit: [imp, met], h: [ft, m], c: [...] })
 *     → [imperial item, metric item]. A component is [name | [imp, met], unit | [imp, met], impFormula, metFormula, waste bp, k?]
 *       where k = metric quantity ÷ imperial quantity for the same work (inferred from the units when left out; the tests
 *       compare every twin with it).
 *   one({ … same, but one name/unit/formula: a count item whose parts do not depend on the unit system })
 */

export const M_PER_FT = 0.3048;

/** Metric quantity ÷ imperial quantity for the same amount, by unit pair. */
const UNIT_K = {
  'LF>m': M_PER_FT, 'SF>m²': M_PER_FT ** 2, 'CY>m³': 0.764554857984, 'CF>m³': 0.028316846592, 'gal>L': 3.785411784, 'lb>kg': 0.45359237,
  'SQ>m²': 100 * M_PER_FT ** 2, 'SY>m²': 9 * M_PER_FT ** 2, 'BF>m³': 0.028316846592 / 12, 'ton>t': 0.90718474,
};
export const unitK = (u1, u2) => (u1 === u2 ? 1 : UNIT_K[u1 + '>' + u2] ?? null);

const pair = (v) => (Array.isArray(v) ? v : [v, v]);

function comp(c, side) {
  const [name, unit, fi, fm, waste = 0] = c;
  const n = pair(name)[side], u = pair(unit)[side];
  return { name: n, unit: u, formula: side ? fm : fi, waste };
}

export function twin(s) {
  const [ni, nm0] = s.name, [ui, um] = s.unit;
  const nm = nm0 === ni ? nm0 + ' (metric)' : nm0;        // the library tells entries apart by name and type
  const base = { type: s.type, csi: s.csi, group: s.group, sources: s.src, assume: s.assume, note: s.note, waste: s.waste || 0 };
  const imp = { key: s.key, ...base, name: ni, unit: ui, twin: s.key + '-m', components: s.c.map((c) => comp(c, 0)) };
  const met = { key: s.key + '-m', ...base, name: nm, unit: um, twin: s.key, components: s.c.map((c) => comp(c, 1)) };
  if (s.h) { imp.heightFt = s.h[0]; met.heightFt = s.h[1] / M_PER_FT; }
  // what the tests compare: k per component
  imp._k = s.c.map((c) => c[5] ?? unitK(pair(c[1])[0], pair(c[1])[1]));
  return [clean(imp), clean(met)];
}

export function one(s) {
  return [clean({
    key: s.key, type: s.type, csi: s.csi, group: s.group, sources: s.src, assume: s.assume, note: s.note, waste: s.waste || 0,
    name: s.name, unit: s.unit, ...(s.h ? { heightFt: s.h } : {}),
    components: s.c.map(([name, unit, formula, waste = 0]) => ({ name, unit, formula, waste })),
  })];
}

function clean(o) {
  for (const k of Object.keys(o)) if (o[k] === undefined || (Array.isArray(o[k]) && !o[k].length && k !== 'components')) delete o[k];
  return o;
}

/** A pack. `items` is a list of twin()/one() results (flattened). Sources: ids from SOURCES (shared) or the pack's own. */
export function pack(p) {
  const items = p.items.flat();
  const used = new Set(items.flatMap((i) => i.sources || []));
  const sources = [...used].map((id) => {
    const s = (p.sources || {})[id] || SOURCES[id];
    if (!s) throw new Error(p.id + ': unknown source ' + id);
    return { id, ...s };
  });
  return {
    format: 'takeoffcraft-pack', version: 1, id: p.id, name: p.name, packVersion: p.version || '0.1.0',
    trade: p.trade, description: p.description, author: 'CadCraft', license: 'CC0-1.0', status: 'starter',
    homepage: 'https://getcadcraft.com/addons?kind=pack',
    csi: p.csi, sources, items,
  };
}

/**
 * Public references the packs cite. Section-level citations only: the clause an assembly leans on is named in the item's
 * own note when it matters. Codes are read free (read-only) at the publishers' sites.
 */
export const SOURCES = {
  'irc-r602': { title: 'International Residential Code, Section R602 Wood Wall Framing', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'irc-r702': { title: 'International Residential Code, Section R702 Interior Covering (gypsum board application, Table R702.3.5)', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'irc-r703': { title: 'International Residential Code, Section R703 Exterior Covering (water-resistive barrier, siding attachment, anchored veneer ties)', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'irc-r905': { title: 'International Residential Code, Section R905 Requirements for Roof Coverings (asphalt shingles, underlayment, drip edge)', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'irc-r506': { title: 'International Residential Code, Section R506 Concrete Floors (on Ground): slab thickness, vapor retarder', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'irc-r403': { title: 'International Residential Code, Section R403 Footings', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'irc-r404': { title: 'International Residential Code, Section R404 Foundation and Retaining Walls', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'irc-r507': { title: 'International Residential Code, Section R507 Exterior Decks', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'irc-r312': { title: 'International Residential Code, Section R312 Guards and Window Fall Protection', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'irc-n1102': { title: 'International Residential Code, Section N1102 Building Thermal Envelope (insulation R-values by climate zone)', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'ibc-1507': { title: 'International Building Code, Chapter 15 Roof Assemblies and Rooftop Structures, Section 1507 Requirements for Roof Coverings', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'ipc-308': { title: 'International Plumbing Code, Section 308 Piping Support (Table 308.5 Hanger Spacing)', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'nec-334': { title: 'NFPA 70, National Electrical Code, Article 334 Nonmetallic-Sheathed Cable (334.30 securing and supporting)', edition: '2023', publisher: 'National Fire Protection Association', url: 'https://www.nfpa.org/' },
  'nec-358': { title: 'NFPA 70, National Electrical Code, Article 358 Electrical Metallic Tubing (358.30 securing and supporting)', edition: '2023', publisher: 'National Fire Protection Association', url: 'https://www.nfpa.org/' },
  'nec-300': { title: 'NFPA 70, National Electrical Code, Article 300 General Requirements for Wiring Methods (300.14 free conductor at outlets)', edition: '2023', publisher: 'National Fire Protection Association', url: 'https://www.nfpa.org/' },
  'nec-314': { title: 'NFPA 70, National Electrical Code, Article 314 Outlet, Device, Pull, and Junction Boxes', edition: '2023', publisher: 'National Fire Protection Association', url: 'https://www.nfpa.org/' },
  'ga-216': { title: 'GA-216, Application and Finishing of Gypsum Panel Products', publisher: 'Gypsum Association', url: 'https://www.gypsum.org/' },
  'astm-c754': { title: 'ASTM C754, Standard Specification for Installation of Steel Framing Members to Receive Screw-Attached Gypsum Panel Products', publisher: 'ASTM International', url: 'https://www.astm.org/' },
  'astm-a615': { title: 'ASTM A615/A615M, Standard Specification for Deformed and Plain Carbon-Steel Bars for Concrete Reinforcement (nominal bar weights)', publisher: 'ASTM International', url: 'https://www.astm.org/' },
  'aci-318': { title: 'ACI CODE-318, Building Code Requirements for Structural Concrete', publisher: 'American Concrete Institute', url: 'https://www.concrete.org/' },
  'aci-302': { title: 'ACI PRC-302.1, Guide to Concrete Floor and Slab Construction', publisher: 'American Concrete Institute', url: 'https://www.concrete.org/' },
  'aci-347': { title: 'ACI PRC-347, Guide to Formwork for Concrete', publisher: 'American Concrete Institute', url: 'https://www.concrete.org/' },
  'bia-tn10': { title: 'Technical Note 10, Dimensioning and Estimating Brick Masonry', publisher: 'Brick Industry Association', url: 'https://www.gobrick.com/' },
  'ncma-tek': { title: 'TEK notes: concrete masonry unit sizes (nominal 8 x 8 x 16 in, actual 7-5/8 x 7-5/8 x 15-5/8 in)', publisher: 'National Concrete Masonry Association', url: 'https://ncma.org/' },
  'tms-402': { title: 'TMS 402/602, Building Code Requirements and Specification for Masonry Structures', publisher: 'The Masonry Society', url: 'https://masonrysociety.org/' },
  'mpi': { title: 'MPI Architectural Painting Specification Manual (paint systems by substrate)', publisher: 'Master Painters Institute', url: 'https://www.mpi.net/' },
  'pds': { title: 'The product data sheet of the coating, adhesive or product you specify (spread rate, coverage, coats)', publisher: 'its manufacturer' },
  'tcna': { title: 'TCNA Handbook for Ceramic, Glass, and Stone Tile Installation', publisher: 'Tile Council of North America', url: 'https://www.tcnatile.com/' },
  'cri-105': { title: 'CRI 105, Standard for Installation of Residential Carpet (and CRI 104 for commercial)', publisher: 'The Carpet and Rug Institute', url: 'https://carpet-rug.org/' },
  'nwfa': { title: 'NWFA Installation Guidelines', publisher: 'National Wood Flooring Association', url: 'https://www.nwfa.org/' },
  'astm-f710': { title: 'ASTM F710, Standard Practice for Preparing Concrete Floors to Receive Resilient Flooring', publisher: 'ASTM International', url: 'https://www.astm.org/' },
  'nrca': { title: 'The NRCA Roofing Manual (Membrane Roof Systems; Steep-slope Roof Systems)', publisher: 'National Roofing Contractors Association', url: 'https://www.nrca.net/' },
  'fm-1-29': { title: 'FM Global Property Loss Prevention Data Sheet 1-29, Roof Deck Securement and Above-Deck Roof Components', publisher: 'FM Global', url: 'https://www.fm.com/' },
  'vsi': { title: 'Vinyl Siding Installation Manual', publisher: 'Vinyl Siding Institute', url: 'https://www.vinylsiding.org/' },
  'awi': { title: 'Architectural Woodwork Standards', publisher: 'Architectural Woodwork Institute (AWI, AWMAC, WI)', url: 'https://www.awinet.org/' },
  'smacna': { title: 'HVAC Duct Construction Standards: Metal and Flexible', publisher: 'SMACNA', url: 'https://www.smacna.org/' },
  'adc': { title: 'Flexible Duct Performance and Installation Standards', publisher: 'Air Diffusion Council', url: 'https://flexibleduct.org/' },
  'awc-dca6': { title: 'DCA 6, Prescriptive Residential Wood Deck Construction Guide', publisher: 'American Wood Council', url: 'https://awc.org/' },
  'ansi-z60': { title: 'ANSI Z60.1, American Standard for Nursery Stock', publisher: 'AmericanHort', url: 'https://www.americanhort.org/' },
  'icpi': { title: 'Tech Spec 2, Construction of Interlocking Concrete Pavements', publisher: 'Interlocking Concrete Pavement Institute', url: 'https://icpi.org/' },
  'astm-c636': { title: 'ASTM C636, Standard Practice for Installation of Metal Ceiling Suspension Systems for Acoustical Tile and Lay-in Panels', publisher: 'ASTM International', url: 'https://www.astm.org/' },
  'irc-r806': { title: 'International Residential Code, Section R806 Roof Ventilation', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'ipc-4': { title: 'International Plumbing Code, Chapter 4 Fixtures, Faucets and Fixture Fittings', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'imc-6': { title: 'International Mechanical Code, Chapter 6 Duct Systems', edition: '2021', publisher: 'International Code Council', url: 'https://codes.iccsafe.org/' },
  'osha-1926': { title: 'OSHA 29 CFR 1926, Safety and Health Regulations for Construction (Subpart P Excavations)', publisher: 'U.S. Occupational Safety and Health Administration', url: 'https://www.osha.gov/' },
  'csi-mf': { title: 'MasterFormat (division and section numbers and titles)', publisher: 'Construction Specifications Institute', url: 'https://www.csiresources.org/' },
  'geometry': { title: 'Plain geometry: the quantity follows from the measured length, height or area and the stated module (no outside source needed)' },
};
