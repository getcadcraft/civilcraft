/* SPDX-License-Identifier: Apache-2.0 */
/**
 * help.js — help topics for the CH.19 to CH.27 areas (0.8 Track CH, CH.32), as data a host's help system can show. Plain text paragraphs; every topic says what it
 * does NOT do and ends with the not-an-approval line. No claim goes beyond what the tests prove (see the session log's Results).
 */
import { text, EN } from './words.js';
const END = EN['proc.env.disclaimer'];
export const TOPICS = [
  { id: 'air', title: 'Air dispersion', body: [
    'Works out how a stack release spreads downwind: the worst one-hour concentration over a grid of weather conditions (a screening run), or hour by hour at the receptors you place (an hourly run).',
    'Stacks come from the flowsheet: the stream, the stack height and diameter give the exit speed and temperature, and the rate of each species in grams per second. Plume rise, the weather class and the Briggs spread are the usual published ones.',
    'It is a stability-class Gaussian model. It is not AERMOD: there is no terrain, no building downwash, no boundary-layer scaling. The AERMOD spike found no way to ship that program today and says why.',
    'Limits come from a pack a person typed with the regulation open. Without a pack nothing is compared. A pack nobody has confirmed says so on every result.', END] },
  { id: 'water', title: 'Water and wastewater', body: [
    'Tanks in series with an internal recycle, a sludge return and a clarifier, using the published activated sludge model number 1 (13 components, 8 processes). The result is a steady state with a COD and nitrogen balance that must close.',
    'The clarifier takes the fraction of solids you say it captures; there is no settling model. Temperature correction, other models and membranes are not built.',
    'Screens, an ideal settling basin, a granular filter and Chick-Watson disinfection are separate calculators. Basin footprints go to the site plan as areas.', END] },
  { id: 'structures', title: 'Structures and estimates', body: [
    'Type a SMILES string and get the formula, molar mass, a drawing and a MOL file. Group-contribution (Joback) estimates give boiling point, critical constants, formation values and a heat capacity for the simple groups the table holds.',
    'A molecule with a group outside the table gets no estimate and the message names the group. An estimate is a stand-in until a measured value is typed, and the component says it is estimated.', END] },
  { id: 'md', title: 'Molecular dynamics', body: [
    'Our own engine: Lennard-Jones, bonded terms, Ewald sums for charges, velocity Verlet with a Langevin or Berendsen thermostat and a Berendsen barostat. It reports energy, temperature, pressure, the radial distribution and diffusion.',
    'Short runs on small boxes. The force field is yours (argon is included as a typed example). Results sent to a component are marked simulated and not confirmed. Quantum chemistry is not part of this release.', END] },
  { id: 'lims', title: 'Lab notebook and LIMS', body: [
    'Connect your own system by its web address (https only) or load exported files. A sample and its results become a proposed stream composition. You accept or reject it; nothing is applied by itself.',
    'The map from analyte names to components is yours. Unmapped analytes, flagged results and sums over 100 percent show up as problems.', END] },
  { id: 'plant', title: 'Plant data', body: [
    'Live values from a historian (web service or exported file) or from OPC UA through CadCraft Studio, laid on the drawing and compared with the flowsheet. Stale, bad-quality and out-of-limit values are flagged.',
    'Read only. Nothing is written to the plant. The browser alone cannot speak OPC UA: that needs Studio and a yes for access to the plant network.', END] },
];
export const topic = (id) => TOPICS.find((t) => t.id === id) || null;
export const titleOf = (id, lang = 'en') => text(lang, 'proc.env.' + ({ air: 'air', water: 'water', structures: 'chem', md: 'md', lims: 'lims', plant: 'plant' }[id]) + '.title');
