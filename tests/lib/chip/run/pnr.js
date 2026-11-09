/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pnr.js — HD.6 place and route with the person's own OpenROAD (BSD-3): the TCL from the project's stage options, the command line, and
 * the log read into numbers and Problems. DOM-free; imports only ./rows.js. The DEF it writes is read back by chip-formats' reader
 * (lib/chip/fmt/def.js readDef + defShapes) and drawn by pnr-view.js.
 *
 *   pnrTcl({ lefs, libs, netlist, top, sdc, site, utilization, aspect, coreSpace, dieArea, coreArea, hLayers, vLayers, density,
 *            cts: { buffers: [..], root? }, route: 'global'|'detailed'|'none', rcx, script }) → text
 *   pnrSteps(opts) → { steps: [openroad -no_splash -exit -log out/openroad.log cc_pnr.tcl], extra, collect }
 *       writes out/final.def, out/final.v, out/final.sdf, out/timing.rpt, out/area.rpt (+ out/final.spef with RCX rules, out/route_drc.rpt)
 *   parseOpenroadLog(text) → { area, util, wns, tns, worst, drcCount, messages: [{level, tool, id, text}] }
 *   pnrRows(parsed) → rows   (ERROR → error, WARNING → warning, negative slack → error with req/found, route violations → error)
 */
import { row } from './rows.js';

const q = (s) => '{' + String(s).replace(/[{}\\]/g, '') + '}';

export function pnrTcl(o = {}) {
  if (o.script) return null;
  const L = [];
  L.push('# made by the Chip design add-on from the project (change the stage options, or point the stage at your own .tcl)');
  for (const f of o.lefs || []) L.push('read_lef ' + q(f));
  for (const f of o.libs || []) L.push('read_liberty ' + q(f));
  if (o.def) L.push('read_def ' + q(o.def));
  else {
    if (!o.netlist || !o.top) throw new Error('pnrTcl: netlist and top');
    L.push('read_verilog ' + q(o.netlist), 'link_design ' + o.top.replace(/[^\w$]/g, ''));
  }
  if (o.sdc) L.push('read_sdc ' + q(o.sdc));
  if (!o.def) {
    const site = o.site ? ' -site ' + String(o.site).replace(/[^\w]/g, '') : '';
    if (o.dieArea && o.coreArea) L.push(`initialize_floorplan -die_area "${o.dieArea.join(' ')}" -core_area "${o.coreArea.join(' ')}"${site}`);
    else L.push(`initialize_floorplan -utilization ${Number(o.utilization) || 40} -aspect_ratio ${Number(o.aspect) || 1} -core_space ${Number(o.coreSpace) || 2}${site}`);
    L.push('make_tracks');
    if (o.hLayers && o.vLayers) L.push(`place_pins -hor_layers ${String(o.hLayers).replace(/[^\w ]/g, '')} -ver_layers ${String(o.vLayers).replace(/[^\w ]/g, '')}`);
    L.push(`global_placement -density ${Number(o.density) || 0.6}`, 'detailed_placement', 'check_placement -verbose');
  }
  if (o.cts && (o.cts.buffers || []).length) L.push(`clock_tree_synthesis -buf_list "${o.cts.buffers.map((b) => String(b).replace(/[^\w]/g, '')).join(' ')}"${o.cts.root ? ' -root_buf ' + String(o.cts.root).replace(/[^\w]/g, '') : ''}`, 'detailed_placement');
  const route = o.route || 'global';
  if (route !== 'none') L.push('global_route');
  if (route === 'detailed') L.push('detailed_route -output_drc out/route_drc.rpt');
  if (o.rcx) L.push('define_process_corner -ext_model_index 0 X', 'extract_parasitics -ext_model_file ' + q(o.rcx), 'write_spef out/final.spef', 'read_spef out/final.spef');
  else L.push(route !== 'none' ? 'estimate_parasitics -global_routing' : 'estimate_parasitics -placement');
  L.push('report_checks -path_delay min_max -fields {slew cap input_pins} -digits 3 > out/timing.rpt', 'report_wns', 'report_tns', 'report_worst_slack', 'report_design_area');
  L.push('write_def out/final.def', 'write_verilog out/final.v', 'write_sdf out/final.sdf', 'exit');
  return L.join('\n') + '\n';
}

export function pnrSteps(o = {}) {
  const extra = {};
  let script = o.script;
  if (!script) { script = 'cc_pnr.tcl'; extra[script] = pnrTcl(o); }
  return { steps: [{ tool: 'openroad', label: 'openroad', args: ['-no_splash', '-exit', '-log', 'out/openroad.log', script] }], extra, collect: ['out/'] };
}

export function parseOpenroadLog(text) {
  const s = String(text);
  const out = { area: null, util: null, wns: null, tns: null, worst: null, drcCount: null, messages: [] };
  let m;
  if ((m = /Design area\s+([\d.]+)\s*u\^2\s+([\d.]+)%\s*utilization/i.exec(s))) { out.area = Number(m[1]); out.util = Number(m[2]); }
  const last = (re) => { let r = null, x; const g = new RegExp(re.source, 'gim'); while ((x = g.exec(s))) r = Number(x[1]); return r; };
  out.wns = last(/^\s*wns\s+(?:max\s+)?(-?[\d.]+)/);
  out.tns = last(/^\s*tns\s+(?:max\s+)?(-?[\d.]+)/);
  out.worst = last(/^\s*worst slack\s+(?:max\s+)?(-?[\d.]+)/);
  out.drcCount = last(/Number of violations\s*=\s*(\d+)/);
  for (const l of s.split(/\r?\n/)) {
    if ((m = /^\[(ERROR|WARNING|CRITICAL)\s+([A-Z]{2,4})-(\d{4})\]\s*(.*)$/.exec(l.trim()))) out.messages.push({ level: m[1], tool: m[2], id: m[2] + '-' + m[3], text: m[4] });
    else if ((m = /^Error:\s*(.*)$/.exec(l.trim()))) out.messages.push({ level: 'ERROR', tool: 'TCL', id: 'TCL', text: m[1] });
  }
  return out;
}

export function pnrRows(p) {
  const rows = [], seen = new Set();
  for (const msg of p.messages) {
    const key = msg.id + ':' + msg.text.replace(/\d+(\.\d+)?/g, '#').slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row({ source: 'pnr', code: msg.level === 'WARNING' ? 'warning' : 'error', severity: msg.level === 'WARNING' ? 'warning' : 'error', vars: { id: msg.id, what: msg.text }, text: '[' + msg.id + '] ' + msg.text, key }));
  }
  const slack = p.wns !== null ? p.wns : p.worst;
  if (slack !== null && slack < 0) rows.push(row({ source: 'pnr', code: 'timing.slack', severity: 'error', vars: { slack, tns: p.tns ?? '' }, text: `Timing is not met after placement and routing: worst negative slack ${slack}${p.tns !== null ? ', total ' + p.tns : ''}`, key: 'slack', req: { op: '>=', value: 0, unit: 'ns' }, found: { value: slack, unit: 'ns' } }));
  if (p.drcCount) rows.push(row({ source: 'pnr', code: 'route.drc', severity: 'error', vars: { n: p.drcCount }, text: `The detailed router left ${p.drcCount} rule violations (out/route_drc.rpt)`, key: 'route.drc' }));
  return rows;
}
