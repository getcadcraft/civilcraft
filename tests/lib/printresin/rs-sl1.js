/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-sl1.js — writes a sliced resin job as an SL1-style archive: a zip of config.ini and one grayscale PNG a layer (roadmap RSN.*). No DOM.
 * HONESTY: nothing here has been loaded on a Prusa SL1 or SL1S, NanoDLP or any resin printer; the files are read back by our own reader only
 * (tools/printresin/sl1-read.mjs). Prusa publishes no spec of the archive; the key list and the layer file naming below come from forum and
 * source-commit snippets seen in search results and from memory, so each is marked UNVERIFIED where it is not confirmed by a Prusa page.
 * No NanoDLP flavour: NanoDLP documents its own zip (meta.json, layers named 1.png, 2.png ... with no leading zeros, plate.json whose keys are not documented),
 * which is a different archive, not this one.
 *
 *   SL1 = { id: 'sl1', name, ext: 'sl1', mime: 'application/zip' }
 *   writeSl1(sliced, meta) → Promise<Uint8Array>
 *     sliced: { w, h, layerHeight, count, layer(i) → Uint8Array(w * h), mm: [x, y] }       (see rs-rle.js)
 *     meta:   { name, printer: { id, name, ... }, resin: { name, exposure, bottomExposure, bottomLayers, liftHeight, liftSpeed, retractSpeed, lightOff },
 *               layerHeight, volumeMl, seconds }
 *   The archive: config.ini (key = value lines) and <jobDir>00000.png, <jobDir>00001.png ... bottom layer first. Throws on a job with no layers.
 *   Lift and retract values are not part of the keys written here, so a printer that wants them has to take them from its own profile.
 */
import { encodePng8 } from './rs-png.js';
import { zipStored } from './rs-zip.js';

export const SL1 = { id: 'sl1', name: 'SL1 (.sl1, layered PNG zip)', ext: 'sl1', mime: 'application/zip' };

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const round = (v, p) => String(Math.round(v * 10 ** p) / 10 ** p);
// a job directory that is safe as a file-name prefix
const jobDirOf = (name) => String(name || 'job').replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'job';

export async function writeSl1(sliced, meta) {
  const { w, h, count } = sliced;
  if (!(count >= 1) || !Number.isInteger(count)) throw new Error('no layers');
  if (!(w >= 1) || !(h >= 1)) throw new Error('layer size');
  const resin = meta.resin || {}, printer = meta.printer || {};
  const layerHeight = num(meta.layerHeight, sliced.layerHeight);
  const jobDir = jobDirOf(meta.name);
  const bottom = Math.min(count, Math.max(0, Math.floor(num(resin.bottomLayers, 0))));
  const config = [
    ['action', 'print'],                                         // UNVERIFIED: the value "print"
    ['jobDir', jobDir],                                          // names the PNG prefix; seen in a source-commit snippet
    ['expTime', round(num(resin.exposure), 3)],                  // seconds a normal layer is lit; seen in a snippet
    ['expTimeFirst', round(num(resin.bottomExposure), 3)],       // seconds the first layers are lit; seen in a snippet
    ['layerHeight', round(layerHeight, 4)],                      // UNVERIFIED: millimetres
    ['materialName', String(resin.name || 'resin')],             // UNVERIFIED
    ['numFade', String(bottom)],                                 // seen in a snippet; UNVERIFIED that it means the bottom layers lit for expTimeFirst
    ['numFast', String(count)],                                  // seen in a snippet; UNVERIFIED meaning (a forum post says it matched the layer total)
    ['numSlow', '0'],                                            // seen in a snippet; UNVERIFIED meaning
    ['printTime', round(num(meta.seconds), 1)],                  // UNVERIFIED: seconds
    ['usedMaterial', round(num(meta.volumeMl), 3)],              // UNVERIFIED: millilitres
    ['fileCreationTimestamp', new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC'], // UNVERIFIED format
    ['printerModel', String(printer.id || printer.name || 'generic')],       // UNVERIFIED
    ['printerVariant', String(printer.variant || 'default')],                // UNVERIFIED
  ].map(([k, v]) => `${k} = ${v}`).join('\n') + '\n';
  const files = [{ name: 'config.ini', data: config }];
  for (let i = 0; i < count; i++) {
    const gray = sliced.layer(i);
    files.push({ name: `${jobDir}${String(i).padStart(5, '0')}.png`, data: await encodePng8(gray, w, h) });   // UNVERIFIED: 5-digit zero padding, no separator
  }
  return zipStored(files);
}
