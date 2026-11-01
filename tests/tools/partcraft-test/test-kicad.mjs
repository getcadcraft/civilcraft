#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-kicad.mjs — PartCraft's KiCad board reader (kicad.js; 0.8 SU.897) on boards we made ourselves (no real KiCad file yet):
 * tokenizer, outline chaining (lines, a three-point arc, a rect), holes, courtyard / pad boxes, the Y flip and rotation, the old
 * `module` spelling, refusals, and the part it builds on the mesh kernel (volume = board − holes + boxes, an edited height moves it).
 *   node tools/partcraft-test/test-kicad.mjs [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
let pass = 0, fail = 0;
const VERBOSE = process.argv.includes('--verbose');
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const I18N = await import(DEV + 'i18n.js');
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
const K = await import(DEV + 'kicad.js');
const P = await import(DEV + 'part.js');
const KR = await import(DEV + 'kernel.js');
const PP = await import(DEV + 'params-part.js');
const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await Module(); M.setup();

const board = `(kicad_pcb (version 20221018) (generator "pcbnew")
  (general (thickness 1.6))
  (gr_line (start 0 0) (end 50 0) (layer "Edge.Cuts") (width 0.1))
  (gr_line (start 50 0) (end 50 30) (layer "Edge.Cuts"))
  (gr_line (start 50 30) (end 0 30) (layer "Edge.Cuts"))
  (gr_line (start 0 30) (end 0 0) (layer "Edge.Cuts"))
  (gr_line (start 5 5) (end 6 5) (layer "F.Cu"))
  (footprint "MountingHole:MountingHole_3.2mm" (layer "F.Cu") (at 4 4)
    (property "Reference" "H1" (at 0 0))
    (pad "" np_thru_hole circle (at 0 0) (size 3.2 3.2) (drill 3.2) (layers "*.Cu")))
  (footprint "Resistor_SMD:R_0805" (layer "F.Cu") (at 20 10 90)
    (property "Reference" "R1" (at 0 0))
    (fp_rect (start -2 -1) (end 2 1) (layer "F.CrtYd"))
    (pad "1" smd rect (at -1 0) (size 1 1.2) (layers "F.Cu")))
  (footprint "Package_SO:SOIC-8" (layer "F.Cu") (at 35 20)
    (property "Reference" "U1" (at 0 0))
    (pad "1" smd rect (at -3 -2) (size 1 0.6)) (pad "8" smd rect (at 3 2) (size 1 0.6))
    (model "\${KICAD6_3DMODEL_DIR}/soic8.step" (offset (xyz 0 0 0))))
  (footprint "Connector:USB" (layer "B.Cu") (at 40 5)
    (property "Reference" "J1" (at 0 0))
    (fp_line (start -3 -2) (end 3 -2) (layer "B.CrtYd")) (fp_line (start 3 2) (end -3 2) (layer "B.CrtYd"))
    (pad "1" thru_hole circle (at 0 0) (size 1.6 1.6) (drill 1.0) (layers "*.Cu"))))`;

const tk = K.parseSexp('(a "b c" (d 1 2) "e\\"f")');
ok(tk.length === 1 && tk[0].length === 4 && tk[0][1].s === 'b c' && tk[0][3].s === 'e"f' && tk[0][2][2] === '2', 'tokenizer: atoms, quoted strings with escapes, nesting');
for (const bad of ['(a (b)', 'a)', '(a "x']) { let m = ''; try { K.parseSexp(bad); } catch (e) { m = e.message; } ok(m !== '', 'refuses ' + JSON.stringify(bad)); }

const b = K.readBoard(board);
ok(b.thickness === 1.6 && b.loops.length === 1 && b.loops[0].length === 4, 'thickness and one closed 4-corner outline from loose Edge.Cuts lines (the F.Cu line is ignored)');
ok(b.holes.length === 2 && b.holes[0].d === 3.2 && !b.holes[0].plated && b.holes[1].plated, 'two holes: the mounting hole unplated, the connector pin plated');
ok(Math.abs(b.holes[0].x - 4) < 1e-9 && Math.abs(b.holes[0].y + 4) < 1e-9, 'the Y flip: KiCad (4, 4) is board (4, -4)');
const byRef = Object.fromEntries(b.parts.map((p) => [p.ref, p]));
ok(Object.keys(byRef).join() === 'R1,U1,J1', 'a box for each footprint except the mounting hole (no pad stands up)', Object.keys(byRef).join());

const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;
const cen = (p) => [p.box.reduce((s, q) => s + q[0], 0) / 4, p.box.reduce((s, q) => s + q[1], 0) / 4];
ok(near(cen(byRef.R1)[0], 20) && near(cen(byRef.R1)[1], -10), 'R1 sits at (20, -10) after the flip');
ok(near(byRef.R1.size[0], 4) && near(byRef.R1.size[1], 2) && byRef.R1.fromCourtyard, 'R1: the courtyard 4 × 2 is the box');
const xs = byRef.R1.box.map((q) => q[0]), ys = byRef.R1.box.map((q) => q[1]);
ok(near(Math.max(...xs) - Math.min(...xs), 2) && near(Math.max(...ys) - Math.min(...ys), 4), 'R1 turned 90°: the box is 2 wide and 4 deep on the board');
// asymmetric check of the rotation sign: a pad at local +X on a 90° footprint ends up above (+Y after the flip) the origin
const rot = K.readBoard(`(kicad_pcb (general (thickness 1)) (gr_rect (start 0 0) (end 20 20) (layer "Edge.Cuts"))
  (footprint "x" (layer "F.Cu") (at 10 10 90) (property "Reference" "Q1") (pad "1" thru_hole circle (at 3 0) (size 1 1) (drill 0.5))))`);
ok(near(rot.holes[0].x, 10) && near(rot.holes[0].y, -7), 'rotation 90°: a pad at local +X lands at +Y on the board (counter-clockwise after the flip)', JSON.stringify(rot.holes[0]));
ok(near(byRef.U1.size[0], 7) && near(byRef.U1.size[1], 4.6) && !byRef.U1.fromCourtyard && byRef.U1.model.includes('soic8'), 'U1: no courtyard, so the pads\' bounding box; its 3-D model name is kept', JSON.stringify(byRef.U1.size));
ok(byRef.J1.side === 'B' && byRef.U1.height === 2 && byRef.J1.height === 8 && byRef.R1.height === 1, 'back side noted; heights guessed from the reference letter');

// arcs and the older spelling
const arc = K.readBoard(`(kicad_pcb (general (thickness 1.6))
  (gr_line (start 0 0) (end 10 0) (layer "Edge.Cuts")) (gr_arc (start 10 0) (mid 15 5) (end 10 10) (layer "Edge.Cuts"))
  (gr_line (start 10 10) (end 0 10) (layer "Edge.Cuts")) (gr_line (start 0 10) (end 0 0) (layer "Edge.Cuts"))
  (module R_0603 (layer F.Cu) (at 3 3) (fp_text reference R9 (at 0 0)) (pad 1 smd rect (at 0 0) (size 1 1))))`);
const area = (l) => Math.abs(l.reduce((s, p, i) => { const q = l[(i + 1) % l.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
ok(arc.loops.length === 1 && near(area(arc.loops[0]), 100 + Math.PI * 25 / 2, 0.5), 'a three-point arc chains with lines into one loop (area of a square + half disc)', String(arc.loops[0] && area(arc.loops[0])));
ok(arc.parts.length === 1 && arc.parts[0].ref === 'R9', 'the older "module" / fp_text reference spelling reads');
const open = K.readBoard(`(kicad_pcb (gr_line (start 0 0) (end 10 0) (layer "Edge.Cuts")) (gr_line (start 10 0) (end 10 10) (layer "Edge.Cuts")))`);
ok(open.loops.length === 0 && open.notes.length === 2, 'an outline that does not close is reported, never guessed');
let msg = ''; try { K.importKicad('(kicad_pcb (general (thickness 1)))'); } catch (e) { msg = e.message; }
ok(/no closed outline/.test(msg), 'a board with no outline says so');
msg = ''; try { K.readBoard('(footprint)'); } catch (e) { msg = e.message; }
ok(/not a KiCad board/.test(msg), 'a file that is not a board says so');

// the part
const made = K.importKicad(board, 'demo.kicad_pcb');
const part = P.readPart(P.toJSON(made.part));
const res = PP.applyPartParams(part);
ok(!res || res.ok !== false, 'the part solves its sketches and parameters', JSON.stringify(res && res.errors));
ok(part.params.vars.some((v) => v.name === 'h_U1' && v.expr === '2') && part.params.vars.some((v) => v.name === 'board_t'), 'a height parameter per component, and the board thickness');
const r = KR.regenerate(part, M);
const failed = [...r.results.values()].filter((x) => x.status !== 'ok');
ok(!failed.length, 'every feature rebuilds on the mesh kernel', JSON.stringify(failed.map((f) => f.message || f.status)).slice(0, 300));
const holeVol = (d) => (part.resolution || 64) / 2 * (d / 2) ** 2 * Math.sin(2 * Math.PI / (part.resolution || 64)) * 1.6;
const boxes = 4 * 2 * 1 + 7 * 4.6 * 2 + 6 * 4 * 8;
const want = 50 * 30 * 1.6 - holeVol(3.2) - holeVol(1.0) + boxes;
ok(Math.abs(r.stats.volume / want - 1) < 0.01, 'volume = board − holes + the component boxes', r.stats.volume.toFixed(2) + ' vs ' + want.toFixed(2));
const bb = r.stats.bbox;
ok(bb && near(bb.max[1], 2, 1e-6) && near(bb.min[1], -1.6 - 8, 1e-6), 'U1 (2 mm) stands up from the top plane; the back-side connector (8 mm) hangs below the board', JSON.stringify(bb));
const U = part.params.vars.find((v) => v.name === 'h_U1'); U.expr = '12';
PP.applyPartParams(part);
const r2 = KR.regenerate(part, M);
ok(Math.abs((r2.stats.volume - r.stats.volume) - 7 * 4.6 * 10) < 1, 'editing h_U1 to 12 mm grows the volume by its box', (r2.stats.volume - r.stats.volume).toFixed(2));
ok(made.report.length >= 2 && /placeholders/.test(made.report[1]) && made.report.some((l) => /3-D models/.test(l)), 'the report says heights are placeholders and models were not loaded');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
