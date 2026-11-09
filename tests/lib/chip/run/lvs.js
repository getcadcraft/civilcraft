/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lvs.js — HD.8 layout versus schematic with the person's own Netgen (a separate program, batch mode), its report read by our own code
 * into Problems tied to the cells (subcircuits) it compared. DOM-free; imports ./rows.js. The setup file is the PDK's (we ship none).
 *
 *   lvsSteps({ layout, layoutCell, schematic, schematicCell, setup, out = 'out/lvs.out' })
 *       → netgen -batch lvs "<layout> <cell>" "<schematic> <cell>" <setup> out/lvs.out -json   (writes out/lvs.out and out/lvs.json)
 *   parseLvsText(text) → { match: true|false|null, unique, circuits: [{ left, right, match, devices: [l, r], nets: [l, r], pins, notes[] }] }
 *       reads the comparison report's "Subcircuit summary", "Number of devices/nets: a | b", "Circuits match uniquely.",
 *       "Netlists do not match.", pin-list lines and the final result
 *   parseLvsJson(text) → the same shape from Netgen's -json file (an array of circuit records: name, devices, nets, badnets, badelements, pins)
 *   lvsRows(result) → rows   (a mismatched circuit = error on that cell; device/net count differences with req/found; property errors = warning)
 */
import { row } from './rows.js';

export function lvsSteps({ layout, layoutCell, schematic, schematicCell, setup, out = 'out/lvs.out' } = {}) {
  if (!layout || !schematic || !setup) throw new Error('lvsSteps: layout, schematic and setup');
  const cell = (f, c) => (c ? f + ' ' + String(c).replace(/[^\w$.-]/g, '') : f);
  return { steps: [{ tool: 'netgen', label: 'netgen lvs', args: ['-batch', 'lvs', cell(layout, layoutCell), cell(schematic, schematicCell || layoutCell), setup, out, '-json'] }], extra: {}, collect: ['out/'] };
}

export function parseLvsText(text) {
  const res = { match: null, unique: false, circuits: [] };
  let cur = null;
  const open = (l, r) => { cur = { left: l, right: r, match: null, devices: [null, null], nets: [null, null], pins: null, notes: [] }; res.circuits.push(cur); };
  for (const raw of String(text).split(/\r?\n/)) {
    const l = raw.trim();
    let m;
    if ((m = /^Subcircuit summary:?$/i.exec(l))) { if (!cur || cur.match !== null) open('', ''); continue; }
    if ((m = /^Circuit 1:\s*(\S+)\s*\|\s*Circuit 2:\s*(\S+)/.exec(l))) { if (!cur || cur.left || cur.match !== null) open(m[1], m[2]); else { cur.left = m[1]; cur.right = m[2]; } continue; }
    if ((m = /^Contents of circuit 1:\s*Circuit:\s*'([^']+)'/.exec(l))) { open(m[1], ''); continue; }
    if ((m = /^Contents of circuit 2:\s*Circuit:\s*'([^']+)'/.exec(l)) && cur) { cur.right = m[1]; continue; }
    if ((m = /^Number of devices:\s*(\d+)\s*(?:\*\*Mismatch\*\*)?\s*(?:\|\s*Number of devices:\s*(\d+))?/.exec(l)) && cur) { cur.devices = [Number(m[1]), m[2] !== undefined ? Number(m[2]) : null]; continue; }
    if ((m = /^Number of nets:\s*(\d+)\s*(?:\*\*Mismatch\*\*)?\s*(?:\|\s*Number of nets:\s*(\d+))?/.exec(l)) && cur) { cur.nets = [Number(m[1]), m[2] !== undefined ? Number(m[2]) : null]; continue; }
    if (/^Circuits match uniquely\./i.test(l) || /^Netlists match uniquely\./i.test(l)) { if (cur) cur.match = true; res.unique = true; continue; }
    if (/^Circuits match correctly\./i.test(l) || /^Netlists match with symmetries\./i.test(l)) { if (cur) cur.match = true; continue; }
    if (/^Netlists do not match\./i.test(l) || /^Circuits do not match\./i.test(l)) { if (cur) cur.match = false; continue; }
    if (/^Cell pin lists are equivalent\./i.test(l) && cur) { cur.pins = 'equal'; continue; }
    if (/^Cell pin lists for .* altered to match\./i.test(l) && cur) { cur.pins = 'altered'; continue; }
    if (/failed pin matching|pin mismatch/i.test(l) && cur) { cur.pins = 'mismatch'; cur.notes.push(l); continue; }
    if (/^There were property errors\./i.test(l) && cur) { cur.notes.push('property errors'); continue; }
    if ((m = /^Final result:\s*(.*)$/i.exec(l))) { res.match = /match/i.test(m[1]) && !/not match|do not|mismatch/i.test(m[1]); if (/uniquely/i.test(m[1])) res.unique = true; continue; }
    if (cur && /\*\*Mismatch\*\*/.test(l)) cur.notes.push(l.replace(/\s+/g, ' ').slice(0, 200));
  }
  if (res.match === null && res.circuits.length) res.match = res.circuits.every((c) => c.match !== false);
  return res;
}

export function parseLvsJson(text) {
  const j = JSON.parse(text);
  const list = Array.isArray(j) ? j : [j];
  const res = { match: true, unique: false, circuits: [] };
  for (const c of list) {
    if (!c || typeof c !== 'object') continue;
    const name = Array.isArray(c.name) ? c.name : [c.name, c.name];
    const devCount = (d) => (Array.isArray(d) ? d.reduce((s, x) => s + (Array.isArray(x) ? Number(x[1]) || 0 : 0), 0) : null);
    const devices = Array.isArray(c.devices) ? [devCount(c.devices[0]), devCount(c.devices[1])] : [null, null];
    const nets = Array.isArray(c.nets) ? [Number(c.nets[0]), Number(c.nets[1])] : [null, null];
    const bad = (c.badnets && c.badnets.length) || (c.badelements && c.badelements.length);
    const pinsBad = Array.isArray(c.pins) && Array.isArray(c.pins[0]) && Array.isArray(c.pins[1]) && c.pins[0].length !== c.pins[1].length;
    const match = !bad && !pinsBad && devices[0] === devices[1] && nets[0] === nets[1];
    const notes = [];
    if (c.badnets && c.badnets.length) notes.push(c.badnets.length + ' nets differ');
    if (c.badelements && c.badelements.length) notes.push(c.badelements.length + ' devices differ');
    if (c.properties && c.properties.length) notes.push('property errors');
    res.circuits.push({ left: String(name[0] || ''), right: String(name[1] || ''), match, devices, nets, pins: pinsBad ? 'mismatch' : 'equal', notes });
    if (!match) res.match = false;
  }
  return res;
}

export function lvsRows(res) {
  const rows = [];
  for (const c of res.circuits) {
    const cell = c.left || c.right || 'top';
    if (c.match === false) rows.push(row({ source: 'lvs', code: 'mismatch', severity: 'error', cell, key: 'mismatch:' + cell, vars: { cell, other: c.right }, text: `Layout and schematic do not match for ${cell}${c.right && c.right !== cell ? ' (schematic ' + c.right + ')' : ''}${c.notes.length ? ': ' + c.notes.slice(0, 3).join('; ') : ''}` }));
    if (c.devices[0] !== null && c.devices[1] !== null && c.devices[0] !== c.devices[1]) rows.push(row({ source: 'lvs', code: 'devices', severity: 'error', cell, key: 'devices:' + cell, vars: { cell, layout: c.devices[0], schematic: c.devices[1] }, text: `${cell}: ${c.devices[0]} devices in the layout, ${c.devices[1]} in the schematic`, req: { op: '=', value: c.devices[1], unit: '' }, found: { value: c.devices[0], unit: '' } }));
    if (c.nets[0] !== null && c.nets[1] !== null && c.nets[0] !== c.nets[1]) rows.push(row({ source: 'lvs', code: 'nets', severity: 'error', cell, key: 'nets:' + cell, vars: { cell, layout: c.nets[0], schematic: c.nets[1] }, text: `${cell}: ${c.nets[0]} nets in the layout, ${c.nets[1]} in the schematic`, req: { op: '=', value: c.nets[1], unit: '' }, found: { value: c.nets[0], unit: '' } }));
    if (c.pins === 'mismatch') rows.push(row({ source: 'lvs', code: 'pins', severity: 'error', cell, key: 'pins:' + cell, vars: { cell }, text: `${cell}: the pin lists of layout and schematic differ` }));
    if (c.notes.includes('property errors')) rows.push(row({ source: 'lvs', code: 'properties', severity: 'warning', cell, key: 'props:' + cell, vars: { cell }, text: `${cell}: devices match but some of their properties (sizes) differ` }));
  }
  if (res.match === false && !rows.some((r) => r.severity === 'error')) rows.push(row({ source: 'lvs', code: 'mismatch', severity: 'error', key: 'final', vars: { cell: '' }, text: 'Layout and schematic do not match (see out/lvs.out)' }));
  return rows;
}
