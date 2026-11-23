/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pnr.js — HD.6 place and route with the person's own OpenROAD (BSD-3): the TCL from the project's stage options, the command line, and
 * the log read into numbers and Problems. DOM-free; imports only ./rows.js. The DEF it writes is read back by chip-formats' reader
 * (lib/chip/fmt/def.js readDef + defShapes) and drawn by pnr-view.js.
 *
 *   pnrTcl({ lefs, libs, netlist, top, sdc, site, utilization, aspect, coreSpace, dieArea, coreArea, hLayers, vLayers, density,
 *            cts: { buffers: [..], root? }, route: 'global'|'detailed'|'none', rcx, script,
 *            layers: 'met1-met5' (set_routing_layers), wireRc: 'met2' (set_wire_rc before CTS/timing),
 *            tapcell: { cell, distance }, supply: { power: 'VDD', ground: 'VSS', powerPins: [..], groundPins: [..] },
 *            pdn: { rails: 'met1', railWidth, stripes: 'met4', stripeWidth, pitch, offset, pins }, fill: [cells] }) → text
 *     OpenROAD names a library after its LEF file's name stem, so two LEFs with the same stem (x.tlef + x.lef) clash ("library (x)
 *     already exists", real run 2026-11-21) and the second file's cells are lost: lefStemClash() finds that before the run.
 *     Also writes out/final_pwr.v (the netlist with the power pins, for LVS) when a supply is set.
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
  const lefs = o.lefs || [];
  for (const f of lefs) L.push('read_lef ' + q(f));
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
    if (o.layers) L.push('set_routing_layers -signal ' + String(o.layers).replace(/[^\w-]/g, ''));
    if (o.wireRc) L.push('set_wire_rc -layer ' + String(o.wireRc).replace(/[^\w]/g, ''));
    if (o.tapcell?.cell) L.push(`tapcell -distance ${Number(o.tapcell.distance) || 14} -tapcell_master ${String(o.tapcell.cell).replace(/[^\w]/g, '')}`);
    if (o.supply) {
      const sp = o.supply, id = (x) => String(x).replace(/[^\w]/g, '');
      const P = id(sp.power || 'VDD'), G = id(sp.ground || 'VSS');
      L.push(...supplyLines(o));
      L.push(`set_voltage_domain -name CORE -power ${P} -ground ${G}`);
      if (o.pdn) {
        const d = o.pdn, n = (x, def) => Number(x) || def;
        L.push(`define_pdn_grid -name cc_grid${d.pins ? ' -pins ' + id(d.stripes || 'met4') : ''}`);
        L.push(`add_pdn_stripe -grid cc_grid -layer ${id(d.rails || 'met1')} -width ${n(d.railWidth, 0.48)} -followpins`);
        L.push(`add_pdn_stripe -grid cc_grid -layer ${id(d.stripes || 'met4')} -width ${n(d.stripeWidth, 1.6)} -pitch ${n(d.pitch, 27.14)} -offset ${n(d.offset, 13.57)}`);
        L.push(`add_pdn_connect -grid cc_grid -layers {${id(d.rails || 'met1')} ${id(d.stripes || 'met4')}}`, 'pdngen');
      }
    }
    if (o.hLayers && o.vLayers) L.push(`place_pins -hor_layers ${String(o.hLayers).replace(/[^\w ]/g, '')} -ver_layers ${String(o.vLayers).replace(/[^\w ]/g, '')}`);
    L.push(`global_placement -density ${Number(o.density) || 0.6}`, 'detailed_placement', 'check_placement -verbose');
  }
  if (o.cts && (o.cts.buffers || []).length) {
    L.push(`clock_tree_synthesis -buf_list "${o.cts.buffers.map((b) => String(b).replace(/[^\w]/g, '')).join(' ')}"${o.cts.root ? ' -root_buf ' + String(o.cts.root).replace(/[^\w]/g, '') : ''}`, 'detailed_placement');
    // the clock buffers CTS adds need their power pins too: the 2024 build connects only the cells there when add_global_connection runs
    // (LVS on the real run: every new clkbuf's VPWR/VGND/VPB/VNB was "_noconnect_" in the powered netlist)
    if (o.supply) L.push(...supplyLines(o));
  }
  const route = o.route || 'global';
  if (route !== 'none') L.push('global_route');
  // fill BEFORE detailed routing, so the router sees the fill cells' li1/met1: filled afterwards, sky130's fill cells landed on wires the
  // router had run through the empty gaps and shorted power to ground (Magic + Netgen LVS, real run 2026-11-21); OpenLane fills here too
  if ((o.fill || []).length) L.push('filler_placement {' + o.fill.map((c) => String(c).replace(/[^\w*]/g, '')).join(' ') + '}');
  if (route === 'detailed') L.push('detailed_route -output_drc out/route_drc.rpt');
  if (o.rcx) L.push('define_process_corner -ext_model_index 0 X', 'extract_parasitics -ext_model_file ' + q(o.rcx), 'write_spef out/final.spef', 'read_spef out/final.spef');
  else L.push(route !== 'none' ? 'estimate_parasitics -global_routing' : 'estimate_parasitics -placement');
  L.push('report_checks -path_delay min_max -fields {slew cap input_pins} -digits 3 > out/timing.rpt', 'report_wns', 'report_tns', 'report_worst_slack', 'report_design_area');
  L.push('write_def out/final.def', 'write_verilog out/final.v');
  if (o.supply) L.push('write_verilog -include_pwr_gnd out/final_pwr.v');
  L.push('write_sdf out/final.sdf', 'exit');
  return L.join('\n') + '\n';
}

/** The power connections: every cell pin named like the supply's pins joins the power or ground net. Newer OpenROAD keeps the rules and
 *  applies them with global_connect; older builds (2.0-12381, 2024) have no global_connect and connect when add_global_connection runs,
 *  so pnrTcl writes this again after anything that adds cells. */
function supplyLines(o) {
  const sp = o.supply || {}, id = (x) => String(x).replace(/[^\w]/g, '');
  const P = id(sp.power || 'VDD'), G = id(sp.ground || 'VSS'), L = [];
  for (const pin of sp.powerPins || ['VPWR', 'VPB']) L.push(`add_global_connection -net ${P} -pin_pattern {^${id(pin)}$} -power`);
  for (const pin of sp.groundPins || ['VGND', 'VNB']) L.push(`add_global_connection -net ${G} -pin_pattern {^${id(pin)}$} -ground`);
  L.push('if {[info commands global_connect] ne ""} { global_connect }');
  return L;
}

/** LEF files whose name stems are the same (OpenROAD makes one library per stem) → [[a, b], …] */
export function lefStemClash(lefs = []) {
  const seen = new Map(), out = [];
  for (const f of lefs) { const stem = String(f).split('/').pop().replace(/\.[^.]*$/, ''); if (seen.has(stem)) out.push([seen.get(stem), f]); else seen.set(stem, f); }
  return out;
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
  const rows = [], seen = new Set(), perId = new Map();
  const PER_ID = 5;   // a real OpenROAD log repeats one message per cell (ORD-1012 for 30 cells): show 5, then count the rest
  for (const msg of p.messages) {
    const key = msg.id + ':' + msg.text.replace(/\d+(\.\d+)?/g, '#').slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    const k = (perId.get(msg.id) || 0) + 1; perId.set(msg.id, k);
    if (k > PER_ID) continue;
    rows.push(row({ source: 'pnr', code: msg.level === 'WARNING' ? 'warning' : 'error', severity: msg.level === 'WARNING' ? 'warning' : 'error', vars: { id: msg.id, what: msg.text }, text: '[' + msg.id + '] ' + msg.text, key }));
  }
  for (const [id, n] of perId) if (n > PER_ID) { const lvl = p.messages.find((m) => m.id === id).level; rows.push(row({ source: 'pnr', code: 'more', severity: lvl === 'WARNING' ? 'warning' : 'error', vars: { id, n: n - PER_ID }, text: `[${id}] ${n - PER_ID} more like these (out/openroad.log)`, key: 'more:' + id })); }
  const slack = p.wns !== null ? p.wns : p.worst;
  if (slack !== null && slack < 0) rows.push(row({ source: 'pnr', code: 'timing.slack', severity: 'error', vars: { slack, tns: p.tns ?? '' }, text: `Timing is not met after placement and routing: worst negative slack ${slack}${p.tns !== null ? ', total ' + p.tns : ''}`, key: 'slack', req: { op: '>=', value: 0, unit: 'ns' }, found: { value: slack, unit: 'ns' } }));
  if (p.drcCount) rows.push(row({ source: 'pnr', code: 'route.drc', severity: 'error', vars: { n: p.drcCount }, text: `The detailed router left ${p.drcCount} rule violations (out/route_drc.rpt)`, key: 'route.drc' }));
  return rows;
}
