/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dwg-write.js — CivilCraft's DWG export: a thin wrapper over cc-dwg, our own Apache-2.0 DWG library
 * (lib/dwg in the repository; written from the ODA "Open Design Specification for .dwg files" v5.4.1, no code
 * from any other DWG library). Apps cannot import outside their build folder, so ./dwg/ holds byte-identical
 * copies of the library files (bin/test-civilcraft.mjs checks them; refresh with
 * `node tools/dwg-test/writer-sync.mjs`).
 *
 *   writeDwg({ units, layers: [{name, color}], entities, created?, version?, images? }) → { bytes: Uint8Array, report }
 *     images (0.4 V8): [{ fileName, pxW, pxH, box, layer }] → IMAGE + IMAGEDEF referring to the picture file beside the drawing
 *     version   'AC1015' (AutoCAD 2000, the default) · 'AC1018' (2004) · 'AC1021' (2007) · 'AC1024' (2010) ·
 *               'AC1027' (2013) · 'AC1032' (2018)
 *     entities  the list dxf.js takes (see dwg/civil.js): poly → LWPOLYLINE at its elevation (contours),
 *               poly3d → 3D POLYLINE (breaklines, daylight), line, arc, circle, point, text (left/center/right)
 *   report: { version, counts: {lwpolyline, polyline3d, line, arc, circle, point, text, …}, notes[], layers[{name, color}],
 *             objects, entities }
 *
 * BitWriter, ByteWriter, crc16 and encode1252 are re-exported for the bit-code tests in bin/test-civilcraft.mjs.
 */
import { writeDwg as writeModel, VERSIONS } from './dwg/write.js';
import { fromCivilList } from './dwg/civil.js';

export { BitWriter, ByteWriter, encode1252 } from './dwg/bits-write.js';
export { crc16 } from './dwg/container-write.js';
export { VERSIONS };

/** The formats offered in the export dialog, newest last; labels name the program generation that opens them. */
export const DWG_FORMATS = [
  ['AC1015', 'AutoCAD 2000 format'], ['AC1018', 'AutoCAD 2004 format'], ['AC1021', 'AutoCAD 2007 format'],
  ['AC1024', 'AutoCAD 2010 format'], ['AC1027', 'AutoCAD 2013 format'], ['AC1032', 'AutoCAD 2018 format'],
];

const KIND = { LWPOLYLINE: 'lwpolyline', POLYLINE_3D: 'polyline3d', LINE: 'line', ARC: 'arc', CIRCLE: 'circle', POINT: 'point', TEXT: 'text',
  MTEXT: 'mtext', ELLIPSE: 'ellipse', SOLID: 'solid', HATCH: 'hatch', INSERT: 'insert', ATTDEF: 'attdef', ATTRIB: 'attrib' };

export function writeDwg({ units, layers = [], entities = [], created = new Date(), version = 'AC1015', images = [] } = {}) {
  const model = fromCivilList({ units, layers, entities, created });
  // 0.6 WL.24: extended data on the list's items (feature lines name their arcs); fromCivilList keeps model space 1:1 with
  // the list (an item it cannot draw becomes an empty LINE the writer leaves out), so item i is model-space entity i
  const msEnts = model.blocks.find((b) => b.name === '*Model_Space')?.entities || [];
  entities.forEach((e, i) => { if (e?.xdata && msEnts[i] && msEnts[i].type !== 'LINE') msEnts[i].xdata = e.xdata; });
  // 0.4 V8: map pictures as IMAGE entities pointing at a file beside the drawing (a DWG cannot hold the picture itself):
  // images [{ fileName, pxW, pxH, box: {minX, minY, maxX, maxY}, layer }] — the picture's lower-left pixel corner at
  // (minX, minY), one pixel = u (east) × v (north)
  const ms = model.blocks.find((b) => b.name === '*Model_Space');
  images.forEach((im, i) => {
    if (!ms || !(im.pxW > 0 && im.pxH > 0) || !im.box) return;
    const handle = 'C1A0' + (i + 1).toString(16).toUpperCase();   // a source handle for the writer to map (never written as is)
    const du = (im.box.maxX - im.box.minX) / im.pxW, dv = (im.box.maxY - im.box.minY) / im.pxH;
    (model.objects ||= []).push({ type: 'IMAGEDEF', handle, fileName: im.fileName, size: { x: im.pxW, y: im.pxH }, pixelSize: { x: du, y: dv }, resUnits: 0, loaded: true, classVersion: 0 });
    const layer = String(im.layer || 'G-MAP-IMAG');
    if (!model.tables.layers.some((l) => l.name === layer)) model.tables.layers.push({ name: layer, color: { index: 8 }, off: false, frozen: false, locked: false, plot: true });
    ms.entities.unshift({ type: 'IMAGE', layer, color: { index: 256 }, linetype: 'ByLayer', lineweight: -1, insert: { x: im.box.minX, y: im.box.minY, z: 0 }, u: { x: du, y: 0, z: 0 }, v: { x: 0, y: dv, z: 0 }, size: { x: im.pxW, y: im.pxH }, def: handle, displayFlags: 7, brightness: 50, contrast: 50, fade: 0, clipping: false, clip: [], classVersion: 0 });
  });
  const { bytes, report } = writeModel(model, { version, created });
  const counts = {};
  for (const [k, n] of Object.entries(report.counts)) counts[KIND[k] || k.toLowerCase()] = n;
  return { bytes, report: { version, counts, notes: report.notes, layers: report.layers, objects: report.objects, entities: report.entities } };
}
