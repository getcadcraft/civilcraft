/* SPDX-License-Identifier: Apache-2.0 */
/**
 * open.js — one door for every format: kindOf(name, bytes) guesses the kind from the content first, then the name; openFile(name, data)
 * reads it and returns { kind, model, problems } (model = what the panels show). data = Uint8Array or string.
 */
import { prob } from './problem.js';
import { readLiberty, libertyModel, checkLiberty } from './liberty.js';
import { readLef, lefModel, checkLef } from './lef.js';
import { readDef } from './def.js';
import { readSdc, checkSdc } from './sdc.js';
import { readGds } from './gds.js';
import { readOasis } from './oasis.js';
import { readSpef } from './spef.js';
import { readSdf } from './sdf.js';
import { readLayerMap } from './layermap.js';

const EXT = { lib: 'liberty', lef: 'lef', tlef: 'lef', def: 'def', sdc: 'sdc', gds: 'gds', gds2: 'gds', gdsii: 'gds', oas: 'oasis', oasis: 'oasis', spef: 'spef', sdf: 'sdf', lyrmap: 'layermap', layermap: 'layermap', map: 'layermap' };
const text = (d) => (typeof d === 'string' ? d : new TextDecoder('utf-8', { fatal: false }).decode(d));

export function kindOf(name = '', data) {
  const b = typeof data === 'string' ? null : data;
  if (b && b.length > 13 && String.fromCharCode(...b.subarray(0, 13)) === '%SEMI-OASIS\r\n') return 'oasis';
  if (b && b.length >= 6 && b[2] === 0x00 && b[3] === 0x02 && b[0] === 0 && b[1] === 6) return 'gds'; // HEADER record: length 6, type 0, int16
  const head = text(b ? b.subarray(0, 4096) : String(data).slice(0, 4096));
  if (/^\s*\*SPEF\b/m.test(head)) return 'spef';
  if (/\(\s*DELAYFILE\b/i.test(head)) return 'sdf';
  if (/^\s*library\s*\(/m.test(head.replace(/\/\*[\s\S]*?\*\//g, ''))) return 'liberty';
  if (/^\s*DESIGN\s+\S+\s*;/m.test(head) || /^\s*DIEAREA\b/m.test(head)) return 'def';
  if (/^\s*(MACRO|LAYER|SITE)\s+\S+\s*$/m.test(head) || /^\s*UNITS\s*$/m.test(head)) return 'lef';
  if (/^\s*(create_clock|set_input_delay|set_output_delay|create_generated_clock|set_false_path)\b/m.test(head)) return 'sdc';
  if (/^\s*\{\s*"format"\s*:\s*"cc-layer-map"/.test(head)) return 'layermap';
  const e = /\.([a-z0-9]+)$/i.exec(name); return e ? EXT[e[1].toLowerCase()] || null : null;
}

export function openFile(name, data, { kind } = {}) {
  const k = kind || kindOf(name, data); const file = String(name).replace(/^.*[\\/]/, '');
  const tag = (ps) => ps.map((p) => ({ ...p, id: p.id + ':' + file, file }));
  try {
    switch (k) {
      case 'liberty': { const r = readLiberty(text(data)), m = libertyModel(r.tree); return { kind: k, model: m, tree: r.tree, problems: tag([...r.problems, ...(m ? checkLiberty(m) : [])]) }; }
      case 'lef': { const r = readLef(text(data)), m = lefModel(r.tree); return { kind: k, model: m, tree: r.tree, problems: tag([...r.problems, ...checkLef(m)]) }; }
      case 'def': { const r = readDef(text(data)); return { kind: k, model: r.def, problems: tag(r.problems) }; }
      case 'sdc': { const r = readSdc(text(data)); return { kind: k, model: r.commands, vars: r.vars, problems: tag([...r.problems, ...checkSdc(r.commands)]) }; }
      case 'gds': { const b = typeof data === 'string' ? new TextEncoder().encode(data) : data; const r = readGds(b); return { kind: k, model: r.lib, problems: tag(r.problems) }; }
      case 'oasis': { const b = typeof data === 'string' ? new TextEncoder().encode(data) : data; const r = readOasis(b); return { kind: k, model: r.lib, problems: tag(r.problems) }; }
      case 'spef': { const r = readSpef(text(data)); return { kind: k, model: r.spef, problems: tag(r.problems) }; }
      case 'sdf': { const r = readSdf(text(data)); return { kind: k, model: r.sdf, problems: tag(r.problems) }; }
      case 'layermap': { const r = readLayerMap(text(data)); return { kind: k, model: r.map, problems: tag(r.problems) }; }
      default: return { kind: null, model: null, problems: tag([prob('open.kind', 'This file is not one of the chip formats (Liberty, LEF, DEF, SDC, GDSII, OASIS, SPEF, SDF, layer map).', { severity: 'note' })]) };
    }
  } catch (e) { return { kind: k, model: null, problems: tag([prob('open.failed', 'The file could not be read: ' + e.message)]) }; }
}
