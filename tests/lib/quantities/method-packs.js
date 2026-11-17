// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: data. Names of published documents, clause references and notes on them; shown as the source wrote them. */
/**
 * method-packs.js: the measurement methods shipped with the apps (booklet row BK.42, session bk-measure-10). DATA ONLY: the
 * format and what each field means are in methods.js; nothing here is code.
 *
 * How these were made (2026-11-11): each source below was fetched from the link given and its text read on that date. A value is
 * 'stated' only where the clause named beside it was read in that text. The standards are copyrighted: only the numbers and the
 * clause references are recorded here, as facts, never the wording. Where a rule could not be read it is 'not-confirmed'; where
 * the source has a rule the format cannot hold it is 'not-encoded'; both use the CadCraft default and the apps say so.
 * NO PACK HAS BEEN CHECKED BY A QUANTITY SURVEYOR (review state 'unchecked'; docs/community-tests/BK.42-HAND.md asks for it).
 *
 * Read but NOT shipped, and why (session log docs/0.9-sessions/bk-measure-10.md has the detail):
 *   - South Africa, ASAQS "Standard System of Measuring Building Work" (6th edition 1999, 7th edition 2015): the text could not be
 *     read from any reliable source, so there is no pack for it. The Africa 2015 method below says it was built on the ASAQS 1991
 *     system; it is not the ASAQS system and is not named as such.
 *   - New Zealand, NZS 4202:1995: read, but it has one opening size for brickwork (0.2 m²) and another for blockwork (0.4 m²),
 *     and a pack has one size for walls.
 *   - SMM7, POMI, CESMM4, ANZSMM: not read from a primary source.
 */
const DEF = 'CadCraft rule 1';
export const PACKS = [
  {
    format: 'cadcraft-measurement-method', version: 1, id: 'cadcraft-default', name: 'CadCraft default (every opening deducted)', region: '',
    source: { title: 'CadCraft measuring rule', publisher: 'CadCraft', edition: 'rule version 1', url: '', read: '2026-11-11', note: 'Our own plain rule, not a published standard.' },
    review: { state: 'unchecked' },
    quantities: {
      'wall.side': { openings: { state: 'stated', clause: DEF, minArea: 0, unit: 'm2', inclusive: true }, junctions: { state: 'stated', clause: DEF, mode: 'centre' } },
      'floor': { openings: { state: 'stated', clause: DEF, minArea: 0, unit: 'm2', inclusive: true } },
      'finish.wall': { openings: { state: 'stated', clause: DEF, minArea: 0, unit: 'm2', inclusive: true }, junctions: { state: 'stated', clause: DEF, mode: 'centre' }, reveals: { state: 'stated', clause: DEF, measured: false } },
      'finish.ceiling': { openings: { state: 'stated', clause: DEF, minArea: 0, unit: 'm2', inclusive: true } },
    },
    masonry: {},
  },
  {
    format: 'cadcraft-measurement-method', version: 1, id: 'rics-nrm2-2021', name: 'RICS NRM 2 (United Kingdom)', region: 'United Kingdom',
    source: {
      title: 'NRM 2: Detailed measurement for building works', publisher: 'Royal Institution of Chartered Surveyors (RICS)', edition: '2nd edition, October 2021',
      url: 'https://www.rics.org/content/dam/ricsglobal/documents/standards/october_2021_nrm_2.pdf', read: '2026-11-11',
      note: 'Work section 14 gives the masonry size twice: note 5 of its opening notes says voids "less than" 0.50 m2, note 6 of items 1 to 3 says "equal to or less than" 0.50 m2. The second is used here (an opening of exactly 0.50 m2 is not deducted). The standard speaks of voids by cross-sectional area; it has no separate wording for doors and windows. Paragraph 3.2.1 says openings at the boundary of a measured area are always deducted whatever their size: that is not encoded. No rule on adding or deducting at wall corners and intersections was found beyond the centre line. Work section 28 item 7 splits wall finishes at 600 mm wide (metres up to 600 mm, square metres above); whether the reveals of openings are measured under it was not confirmed, so reveals are not measured. No waste percentage: 3.2.1 says the net quantity is taken to include waste.',
    },
    review: { state: 'unchecked' },
    quantities: {
      'wall.side': {
        openings: { state: 'stated', clause: 'NRM 2, Work section 14 Masonry, items 1 to 3, note 6', minArea: 0.5, unit: 'm2', inclusive: true },
        junctions: { state: 'stated', clause: 'NRM 2, Work section 14 Masonry, note 1', mode: 'centre' },
      },
      'floor': { openings: { state: 'not-confirmed', clause: 'Floor construction is measured under other work sections that were not read for this.' } },
      'finish.wall': {
        openings: { state: 'stated', clause: 'NRM 2, Work section 28 Floor, wall, ceiling and roof finishings, note 3', minArea: 1, unit: 'm2', inclusive: true },
        junctions: { state: 'not-confirmed', clause: '' },
        reveals: { state: 'not-confirmed', clause: 'Work section 28 item 7 and note 2 (widths up to 600 mm in metres) may apply; not confirmed for reveals.' },
      },
      'finish.ceiling': { openings: { state: 'stated', clause: 'NRM 2, Work section 28 Floor, wall, ceiling and roof finishings, note 3', minArea: 1, unit: 'm2', inclusive: true } },
    },
    masonry: {
      measure: { state: 'stated', clause: 'NRM 2, Work section 14, item 1: walls in m2, overall thickness stated', unit: 'm2' },
      waste: { state: 'not-stated', clause: '' },
      mortar: { state: 'not-stated', clause: '' },
    },
  },
  {
    format: 'cadcraft-measurement-method', version: 1, id: 'aaqs-africa-2015', name: 'AAQS Standard Method for Africa 2015', region: 'Africa',
    source: {
      title: 'Standard Method of Measuring Building Work for Africa 2015', publisher: 'Africa Association of Quantity Surveyors (AAQS)', edition: 'First edition, 2015, ISBN 978-0-86886-839-4',
      url: 'https://aaqs.org/wp-content/uploads/2020/05/StandardMethodsAAQS.pdf', read: '2026-11-11',
      note: 'This is NOT the South African "Standard System of Measuring Building Work" of the ASAQS: that text could not be read, so it has no pack. The preface of this method says it used the ASAQS Standard System of 1991 as its base document. No rule on how wall lengths are measured at corners and junctions was found in its masonry section. Plastering item 2.2 gives narrow widths up to 300 mm as a separate item, except those in the flush face caused by openings; how reveals follow from that was not confirmed, so reveals are not measured. Mass brickwork and piers are measured in m3 with no deduction for voids up to 0.1 m3: not encoded. General instruction 6 says work is measured net with no allowance for waste, so waste is 0% unless the wall type has its own.',
    },
    review: { state: 'unchecked' },
    quantities: {
      'wall.side': {
        openings: { state: 'stated', clause: 'AAQS 2015, Masonry, Walls and linings rule 14 and Hollow walls rule 17', minArea: 0.5, unit: 'm2', inclusive: true },
        junctions: { state: 'not-confirmed', clause: '' },
      },
      'floor': { openings: { state: 'not-confirmed', clause: '' } },
      'finish.wall': {
        openings: { state: 'stated', clause: 'AAQS 2015, Plastering item 2, rules 4 and 5; Paintwork item 3, rule 7', minArea: 0.5, unit: 'm2', inclusive: true },
        junctions: { state: 'not-confirmed', clause: '' },
        reveals: { state: 'not-confirmed', clause: 'Plastering item 2.2, rule 7 (narrow widths up to 300 mm) read; its effect on reveals not confirmed.' },
      },
      'finish.ceiling': { openings: { state: 'stated', clause: 'AAQS 2015, Plastering item 2, rule 5', minArea: 0.5, unit: 'm2', inclusive: true } },
    },
    masonry: {
      measure: { state: 'stated', clause: 'AAQS 2015, Masonry items 4 and 5: walls and hollow walls in m2', unit: 'm2' },
      waste: { state: 'stated', clause: 'AAQS 2015, General instructions 6: measured net, no allowance for waste', pct: 0 },
      mortar: { state: 'not-stated', clause: '' },
    },
  },
  {
    format: 'cadcraft-measurement-method', version: 1, id: 'is-1200-1976', name: 'IS 1200 (India), brickwork', region: 'India',
    source: {
      title: 'IS 1200: Method of measurement of building and civil engineering works, Part III Brickwork and Part XII Plastering and pointing', publisher: 'Indian Standards Institution (now Bureau of Indian Standards)', edition: 'Third revision, 1976',
      url: 'https://law.resource.org/pub/in/bis/S03/is.1200.3.1976.pdf', read: '2026-11-11',
      note: 'Whether a later revision has replaced the 1976 text was not confirmed. Part XII (https://law.resource.org/pub/in/bis/S03/is.1200.12.1976.pdf) deducts openings in plaster in three bands (clauses 3.8.1 and 3.8.2): none up to 0.5 m2; above 0.5 and up to 3 m2 on one face only, with further cases by reveal width; above 3 m2 on each face with jambs, soffits and sills measured. This method file cannot hold bands, so wall finishes use the CadCraft default here. Part III clause 4.1.4 note says a separate lintel or sill counts with the size of the opening: not encoded. Part III has no rule on corners and junctions that we found. Brickwork is generally in m3; walls one brick thick and less are in m2 stating the thickness (4.1, 4.1.1).',
    },
    review: { state: 'unchecked' },
    quantities: {
      'wall.side': {
        openings: { state: 'stated', clause: 'IS 1200 (Part III)-1976, clause 4.1.4 (b)', minArea: 0.1, unit: 'm2', inclusive: true },
        junctions: { state: 'not-confirmed', clause: '' },
      },
      'floor': { openings: { state: 'not-confirmed', clause: '' } },
      'finish.wall': {
        openings: { state: 'not-encoded', clause: 'IS 1200 (Part XII)-1976, clauses 3.8.1 and 3.8.2: three bands' },
        junctions: { state: 'not-confirmed', clause: '' },
        reveals: { state: 'not-encoded', clause: 'IS 1200 (Part XII)-1976, clauses 3.8.1 and 3.8.2: measured only for openings above 3 m2' },
      },
      'finish.ceiling': { openings: { state: 'not-confirmed', clause: '' } },
    },
    masonry: {
      measure: { state: 'stated', clause: 'IS 1200 (Part III)-1976, clauses 4.1 and 4.1.1: generally m3; walls one brick thick and less in m2', unit: 'm3' },
      waste: { state: 'not-stated', clause: '' },
      mortar: { state: 'not-stated', clause: '' },
    },
  },
  {
    format: 'cadcraft-measurement-method', version: 1, id: 'us-bia-tn10-2009', name: 'BIA Technical Note 10 (United States, brick estimating)', region: 'United States',
    source: {
      title: 'Technical Note 10: Dimensioning and Estimating Brick Masonry', publisher: 'Brick Industry Association (BIA)', edition: 'February 2009',
      url: 'https://www.gobrick.com/media/file/10-dimensioning-and-estimating-brick-masonry.pdf', read: '2026-11-11',
      note: 'An industry estimating note, not a standard method of measurement: we could not confirm that the United States has a single national one. Its wall-area method takes the net wall area, the gross area less the areas of openings, with no smallest opening. It says to add at least 5 percent to the brick for breakage and waste, and 15 to 25 percent to the mortar: the 15 used here is the low end of that range. Its Table 4 gives 675 modular brick per 100 square feet and 5.5 cubic feet of mortar per 100 square feet at a 3/8 inch joint, before waste; CadCraft works its own numbers out from the unit size and joint, and they can differ a little from the table. Wall finishes are not covered by this note.',
    },
    review: { state: 'unchecked' },
    quantities: {
      'wall.side': {
        openings: { state: 'stated', clause: 'BIA Technical Note 10 (2009), estimating by the wall-area method: net wall area', minArea: 0, unit: 'ft2', inclusive: true },
        junctions: { state: 'not-confirmed', clause: '' },
      },
      'floor': { openings: { state: 'not-confirmed', clause: '' } },
      'finish.wall': { openings: { state: 'not-confirmed', clause: '' }, junctions: { state: 'not-confirmed', clause: '' }, reveals: { state: 'not-confirmed', clause: '' } },
      'finish.ceiling': { openings: { state: 'not-confirmed', clause: '' } },
    },
    masonry: {
      measure: { state: 'stated', clause: 'BIA Technical Note 10 (2009), Table 4: units per area of wall', unit: 'number' },
      waste: { state: 'stated', clause: 'BIA Technical Note 10 (2009), Brick breakage and waste: at least 5 percent', pct: 5 },
      mortar: { state: 'stated', clause: 'BIA Technical Note 10 (2009), Mortar waste: 15 to 25 percent, low end used', allowancePct: 15 },
    },
  },
];
