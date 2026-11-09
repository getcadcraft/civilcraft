/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-chip hdl — HDL source tools of the Chip design add-on (0.9 HD.1 + HD.2). Our own Verilog and VHDL readers, the module hierarchy,
 * structural Verilog → netlist graph, and its schematic view on lib/schematic. Logic is DOM-free; ui-*.js are thin panels.
 * Engine (no DOM): verilog.js, vhdl.js, hier.js, netlist.js, schem.js, session.js, problems.js. Panels: ui-source.js, ui-netlist.js.
 */
export { parseVerilog, tokenize as tokenizeVerilog, evalConst, paramEnv, rangeBits, GATES } from './verilog.js';
export { parseVhdl, tokenize as tokenizeVhdl, vhdlWidth } from './vhdl.js';
export { analyzeProject, buildHierarchy, parseSource, langOf, flattenTree, isBuiltin, VERILOG_EXT, VHDL_EXT } from './hier.js';
export { buildNetlist, checkNetlist, netlistStats, pinDir, exprLabel, FORMAT as NETLIST_FORMAT } from './netlist.js';
export { toSchematic, checkWithEngine, layoutNetlist, renderSvg } from './schem.js';
export { sessionFor, Session, gutterMarks, offsetOf, lineColOf, SOURCE } from './session.js';
export { TEMPLATES, row, rowText, sortRows, fill } from './problems.js';
export { panels as sourcePanels, hierarchyRows, starter } from './ui-source.js';
export { panels as netlistPanels, netlistView, NET_SOURCE } from './ui-netlist.js';
import { panels as sp } from './ui-source.js';
import { panels as np } from './ui-netlist.js';
/** Every panel of this folder, in menu order: Source, Hierarchy, Netlist. (Not named `panels`: the add-on host mounts each module that
 *  exports panels(ctx) — ui-source.js and ui-netlist.js — and would mount these twice.) */
export const allPanels = (ctx) => [...sp(ctx), ...np(ctx)];
export const HDL_VERSION = 1;
