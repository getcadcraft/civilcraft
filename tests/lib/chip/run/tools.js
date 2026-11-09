/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools.js — the outside programs the Chip design add-on can run (0.9 HD.4–HD.9). DOM-free, no imports.
 * Owner 2026-11-03 (O2): run only tools the person installed; nothing is bundled. Each is a separate program, started without a shell
 * by the add-on's run script inside Studio (engine/cc-chip-run.mjs through Studio's engines.rs, ADDONS-SPEC § 16) — GPL tools
 * (Icarus Verilog, KLayout, Netgen) included, because they are never linked, imported or shipped.
 *
 *   TOOLS[id] = { id, ranByUs, label, programs: [file names], version: [args], licence, stage kinds }
 *     ranByUs: we ran it for real on our sample (Icarus Verilog 11, Yosys 0.9, 2026-11-03); false = "not run by us yet" (the honesty card says so)
 *   ALLOWED_PROGRAMS — the names the run script may start (the same list is in the script; test/run.test.mjs checks they agree)
 *   parseVersion(id, text) → '' | 'Yosys 0.9 (git sha1 …)'
 *   probeSteps() → steps that ask every tool its version (a run with no inputs)
 */

export const TOOLS = Object.freeze({
  iverilog: { id: 'iverilog', ranByUs: true, label: 'Icarus Verilog', programs: ['iverilog'], version: ['-V'], licence: 'GPL-2.0-or-later', kinds: ['sim', 'gls', 'stil'] },
  vvp: { id: 'vvp', ranByUs: true, label: 'Icarus Verilog runtime', programs: ['vvp'], version: ['-V'], licence: 'GPL-2.0-or-later', kinds: ['sim', 'gls', 'stil'] },
  verilator: { id: 'verilator', ranByUs: false, label: 'Verilator', programs: ['verilator'], version: ['--version'], licence: 'LGPL-3.0 or Artistic-2.0', kinds: ['sim'] },
  yosys: { id: 'yosys', ranByUs: true, label: 'Yosys', programs: ['yosys'], version: ['-V'], licence: 'ISC', kinds: ['synth'] },
  openroad: { id: 'openroad', ranByUs: false, label: 'OpenROAD', programs: ['openroad'], version: ['-version'], licence: 'BSD-3-Clause', kinds: ['pnr', 'gls'] },
  klayout: { id: 'klayout', ranByUs: false, label: 'KLayout', programs: ['klayout'], version: ['-v'], licence: 'GPL-2.0-or-later', kinds: ['drc'] },
  netgen: { id: 'netgen', ranByUs: false, label: 'Netgen', programs: ['netgen', 'netgen-lvs'], version: ['-batch', 'quit'], licence: 'GPL (see its own licence file)', kinds: ['lvs'] },
});

/** Program names the run script starts (plus `obj_dir/V<top>`, a program a Verilator step built inside the job folder). */
export const ALLOWED_PROGRAMS = Object.freeze(['iverilog', 'vvp', 'verilator', 'yosys', 'yosys-abc', 'openroad', 'sta', 'klayout', 'netgen', 'netgen-lvs']);

export function parseVersion(id, text) {
  const s = String(text || '');
  const pats = {
    iverilog: /Icarus Verilog version [^\n]+/, vvp: /Icarus Verilog runtime version [^\n]+/, verilator: /Verilator \d[^\n]*/,
    yosys: /Yosys \d[^\n]*/, openroad: /^v?\d+\.\d+[^\s]*|OpenROAD [^\n]+/m, klayout: /KLayout \d[^\n]*/, netgen: /Netgen [^\n]*\d[^\n]*/,
  };
  const m = (pats[id] || /\S[^\n]*/).exec(s);
  return m ? m[0].trim().slice(0, 200) : '';
}

export function probeSteps() {
  const out = [];
  for (const t of Object.values(TOOLS)) out.push({ tool: t.programs[0], args: t.version.slice(), optional: true, label: 'version ' + t.id, stdout: 'out/version-' + t.id + '.txt' });
  return out;
}
