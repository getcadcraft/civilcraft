/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bring.js — "bring a job over" (IND.8): look at a file another tool wrote, say what it is, read it and report what came over and what
 * did not. DOM-free; one entry point for every host. Nothing is written anywhere: the host decides what to do with the result.
 *
 *   sniff(bytes, name) → 'dexpi' | 'pcf' | 'ifc' | 'xlsx' | 'csv' | 'unknown'
 *   bringOver(bytes, name) → Promise<{ kind, ok, name, summary: [text], problems: [problem], data }>
 *       kind 'dexpi' → data = the dexpi model (dexpi.js)   · 'pcf' → data = the pcf model (pcf.js)
 *       kind 'stream-table' → data = readStreamTable's result  · 'ifc' → data = { schema, application, counts, piping }
 *   Every `problem` is plain data for the Problems store: { code, severity, text, vars, about: [{ kind: 'file', id: name }] }, kind 'import'.
 */
import { readDexpi, summary as dexpiSummary, flatItems, SYMBOL_OF_CLASS, ACTUATOR_OF_CLASS, isJunction, XmlError } from './dexpi.js';
import { readPcf, lengthOf } from './pcf.js';
import { readTable } from './tabular.js';
import { readStreamTable } from './streamtable.js';
import { guideFor } from './guides.js';

const dec = (b, n = 4096) => new TextDecoder('utf-8', { fatal: false }).decode(b.subarray(0, n));
const asBytes = (x) => (typeof x === 'string' ? new TextEncoder().encode(x) : x instanceof Uint8Array ? x : new Uint8Array(x));

export function sniff(input, name = '') {
  const b = asBytes(input);
  const ext = (/\.([a-z0-9]+)$/i.exec(name) || [])[1]?.toLowerCase() || '';
  if (b[0] === 0x50 && b[1] === 0x4b) return ext === 'xlsx' || ext === 'xlsm' || !ext ? 'xlsx' : 'unknown';
  const head = dec(b).replace(/^﻿/, '');
  if (/^ISO-10303-21\s*;/.test(head.trimStart())) return 'ifc';
  if (/^\s*<\?xml|^\s*<PlantModel\b/.test(head) && /<PlantModel\b/.test(dec(b, 8192))) return 'dexpi';
  if (/^\s*<\?xml/.test(head) && /ProteusXML|PlantModel/.test(dec(b, 16384))) return 'dexpi';
  if (/^\s*(ISOGEN-FILES|UNITS-BORE|UNITS-CO-ORDS|PIPELINE-REFERENCE)\b/m.test(head)) return 'pcf';
  if (ext === 'pcf') return 'pcf';
  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') return 'csv';
  return 'unknown';
}

const about = (name) => [{ kind: 'file', id: name }];
const tag = (name, ps) => ps.map((p) => ({ ...p, about: about(name), source: { kind: 'import', name: 'bring-over' } }));
const plural = (n, a, b) => n + ' ' + (n === 1 ? a : b);

function scanIfc(bytes) {
  // header + a bounded count of entity classes; the model's own reader does the real parse
  const text = new TextDecoder('latin1').decode(bytes.subarray(0, Math.min(bytes.length, 256 * 1024 * 1024)));
  const schema = (/FILE_SCHEMA\s*\(\s*\(\s*'([^']+)'/i.exec(text) || [])[1] || '';
  const application = (/FILE_NAME\s*\([^;]*?'([^']*)'\s*,\s*'([^']*)'\s*\)\s*;/is.exec(text.slice(0, 20000)) || [])[0] ? '' : '';
  const counts = {};
  const re = /^#\d+\s*=\s*(IFC[A-Z0-9]+)\s*\(/gim;
  let m, n = 0;
  while ((m = re.exec(text)) && n < 5_000_000) { counts[m[1].toUpperCase()] = (counts[m[1].toUpperCase()] || 0) + 1; n++; }
  const keep = ['IFCPIPESEGMENT', 'IFCPIPEFITTING', 'IFCVALVE', 'IFCPUMP', 'IFCTANK', 'IFCHEATEXCHANGER', 'IFCBOILER', 'IFCCOMPRESSOR', 'IFCDUCTSEGMENT', 'IFCFLOWTERMINAL', 'IFCDISTRIBUTIONPORT', 'IFCBUILDINGELEMENTPROXY', 'IFCWALL', 'IFCSLAB', 'IFCSPACE', 'IFCBUILDINGSTOREY'];
  const piping = (counts.IFCPIPESEGMENT || 0) + (counts.IFCPIPEFITTING || 0) + (counts.IFCVALVE || 0);
  return { schema, application, counts: Object.fromEntries(keep.filter((k) => counts[k]).map((k) => [k, counts[k]])), entities: n, piping };
}

export async function bringOver(input, name = '') {
  const bytes = asBytes(input);
  let kind = sniff(bytes, name);
  const out = { kind, ok: false, name, summary: [], problems: [], data: null };
  try {
    if (kind === 'dexpi') {
      const m = readDexpi(bytes);
      const flat = flatItems(m), s = dexpiSummary(m);
      const eq = flat.filter((i) => i.kind === 'Equipment'), nz = flat.filter((i) => i.kind === 'Nozzle'), sys = flat.filter((i) => i.kind === 'PipingNetworkSystem');
      const comps = flat.filter((i) => i.kind === 'PipingComponent'), inst = flat.filter((i) => /Instrumentation|Signal/i.test(i.kind));
      const nested = new Set(); for (const i of flat) for (const c of i.items) nested.add(c);   // equipment inside a tank or a valve is a part or an actuator
      const unmapped = new Set(flat.filter((i) => ['Equipment', 'PipingComponent', 'ProcessInstrumentationFunction'].includes(i.kind) && i.cls && !SYMBOL_OF_CLASS(i.cls) && !isJunction(i.cls) && !(nested.has(i) && (ACTUATOR_OF_CLASS(i.cls) || i.kind === 'Equipment'))).map((i) => i.cls));
      out.summary.push('DEXPI plant model' + (m.info.origin ? ' from ' + m.info.origin : '') + (m.info.schema ? ', schema ' + m.info.schema : '') + '.');
      out.summary.push(plural(eq.length, 'equipment item', 'equipment items') + ', ' + plural(nz.length, 'nozzle', 'nozzles') + ', ' + plural(sys.length, 'piping network system', 'piping network systems') + ', ' + plural(comps.length, 'in-line component', 'in-line components') + ', ' + plural(inst.length, 'instrumentation item', 'instrumentation items') + '.');
      if (unmapped.size) {
        out.summary.push('Classes with no symbol here: ' + [...unmapped].sort().join(', ') + '.');
        m.problems.push({ code: 'dexpi.class.unmapped', severity: 'note', vars: { n: unmapped.size }, text: unmapped.size + ' DEXPI class(es) have no symbol in the P&ID library and are placed as generic items: ' + [...unmapped].sort().slice(0, 12).join(', ') + '.' });
      }
      if (!flat.length) m.problems.push({ code: 'dexpi.empty', severity: 'error', vars: {}, text: 'The file holds a plant model with no items.' });
      out.data = m; out.problems = tag(name, m.problems); out.ok = flat.length > 0; out.counts = s.kinds;
    } else if (kind === 'pcf') {
      const m = readPcf(bytes);
      for (const p of m.pipelines) {
        const L = p.components.filter((c) => c.type === 'PIPE').reduce((a, c) => a + lengthOf(c), 0);
        const by = {}; for (const c of p.components) by[c.type] = (by[c.type] || 0) + 1;
        out.summary.push((p.ref || '(unnamed line)') + ': ' + Object.entries(by).map(([k, v]) => v + ' ' + k.toLowerCase()).join(', ') + '; straight pipe ' + Math.round(L) + ' mm.');
      }
      out.data = m; out.problems = tag(name, m.problems); out.ok = !m.problems.some((p) => p.severity === 'error');
    } else if (kind === 'xlsx' || kind === 'csv') {
      const t = await readTable(bytes, name);
      let best = null;
      for (const sh of t.sheets) { const r = readStreamTable(sh.rows); if (r.ok && (!best || r.streams.length > best.r.streams.length)) best = { sh, r }; }
      if (best) {
        kind = 'stream-table'; out.kind = kind;
        out.summary.push('Stream table' + (t.kind === 'xlsx' ? ' on sheet "' + best.sh.name + '"' : '') + ': ' + plural(best.r.streams.length, 'stream', 'streams') + ' running ' + (best.r.orientation === 'columns' ? 'across' : 'down') + ', ' + plural(best.r.components.length, 'component', 'components') + '.');
        out.data = best.r; out.problems = tag(name, best.r.problems); out.ok = true;
      } else {
        out.summary.push('The file is a ' + t.kind.toUpperCase() + ' with ' + t.sheets.length + ' sheet(s), but no stream table was found in it.');
        out.problems = tag(name, [{ code: 'streams.notfound', severity: 'error', vars: {}, text: 'No stream table was found: at least two property names (temperature, pressure, flow …) are needed.' }]);
        out.data = { sheets: t.sheets.map((s) => ({ name: s.name, rows: s.rows.length })) };
      }
    } else if (kind === 'ifc') {
      const d = scanIfc(bytes);
      out.summary.push('IFC file' + (d.schema ? ', ' + d.schema : '') + ': ' + Object.entries(d.counts).map(([k, v]) => v + ' ' + k.replace(/^IFC/, '').toLowerCase()).join(', ') + '.');
      if (!d.piping) out.problems = tag(name, [{ code: 'ifc.piping.none', severity: 'note', vars: {}, text: 'The file has no pipe segments, fittings or valves; it opens as a building model.' }]);
      out.data = d; out.ok = d.entities > 0;
    } else {
      out.summary.push('The file type is not one this step reads (DEXPI .xml, PCF, IFC, CSV or Excel stream tables).');
      out.problems = tag(name, [{ code: 'bring.unknown', severity: 'error', vars: {}, text: 'The file type was not recognised.' }]);
    }
  } catch (e) {
    const code = e instanceof XmlError || e.code ? 'bring.' + (e.code || 'read') : 'bring.read';
    out.problems = tag(name, [{ code, severity: 'error', vars: {}, text: 'The file could not be read: ' + e.message }]);
    out.summary.push('The file could not be read: ' + e.message);
  }
  out.guides = guideFor(out.kind).map((g) => g.id);
  return out;
}
