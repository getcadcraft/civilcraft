#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cadcraft — the CadCraft apps from the command line (docs/AGENTS-SPEC.md §1; 0.4 part 2 item X.3). Runs the apps' own
 * modules (headless/), no screen, no dependencies. Node 20.19+.
 *
 *   cadcraft info <file…>                        a drawing (.dwg .dxf), an IFC model, a takeoff (.takeoff.json) or a PDF
 *   cadcraft run <script.scr|.lsp> <drawing> (-o <out.dwg|.dxf> | --in-place) [--version 2018]
 *   cadcraft convert <in.dwg|.dxf> <out.dwg|.dxf> [--version 2018] [--format dwg|dxf2000|dxf]
 *   cadcraft convert <in…> <folder> --to dwg|dxf  (several at once; 0.7 MCP-HEADLESS)
 *   cadcraft plot <drawing> <out.pdf|.svg> [--layout <name> | --all] [--paper iso-a3] [--portrait] [--scale 1:50|fit] [--color] [--pen 0.25]
 *   cadcraft plot <drawing…> <folder> [--to pdf|svg]
 *   cadcraft check <drawing…> --rules <rules.json>
 *   cadcraft convert <manual.partcraft-manual.json> <out.pdf|.svg|.html> [--instructions] [--view <name>] [--paper a4] [--layout sheet]
 *   cadcraft count <drawing> (--block <name> | --text <text> | --layer <layer> [--type CIRCLE]) [--sheet <name>] [--drawing]
 *                                                (0.7 AS.6: a PartCraft manual exported; TakeoffCraft's exact counts on a DWG / DXF)
 *   cadcraft tools                               the tools the MCP server offers (cadcraft-mcp)
 *
 * Every command takes --json (one JSON object on stdout). Exit codes: 0 ok · 1 problems (unreadable file, a script or
 * command error, check findings) · 2 bad usage.
 */
import fs from 'node:fs';
import path from 'node:path';
import { CadSession, extOf } from './headless/cad.mjs';
import { writeFileAtomic } from './headless/paths.mjs';
import { PACKAGE_VERSION } from './headless/apps.mjs';

const USAGE = `cadcraft ${PACKAGE_VERSION} — the CadCraft apps from the command line

  cadcraft info <file…>                      .dwg .dxf · .ifc · .takeoff.json · .civilcraft.json · .partcraft.json · .pdf
  cadcraft run <script.scr|.lsp> <drawing> (-o <out.dwg|.dxf> | --in-place) [--version 2018]
  cadcraft convert <in> <out.dwg|.dxf> [--version 2000|2004|2007|2010|2013|2018] [--format dwg|dxf2000|dxf]
  cadcraft convert <site.civilcraft.json|points.csv> <out.xml>   LandXML 1.2 (CivilCraft)
  cadcraft convert <part.partcraft.json> <out.stl|.3mf|.step|.usdz|.usda|.usdc>   a PartCraft part, built (STEP faceted)
  cadcraft convert <manual.partcraft-manual.json> <out.pdf|.svg|.html> [--instructions] [--view <name>] [--paper a4|a3|letter|tabloid] [--layout sheet]
                                             a PartCraft manual: its views as line art, the interactive 3D file, or its instructions
  cadcraft count <drawing> (--block <name> | --text <text> | --layer <layer> [--type CIRCLE]) [--sheet <name>] [--drawing]
                                             TakeoffCraft's exact count on a DWG / DXF (a sheet: what it shows; --drawing: every object once)
  cadcraft plot <drawing> <out.pdf|.svg> [--layout <sheet> | --all] [--paper iso-a3] [--portrait] [--scale 1:50|fit] [--color] [--pen 0.25]
  cadcraft check <drawing…> --rules <rules.json>

  Several files: cadcraft convert <in…> <folder> --to dwg|dxf · cadcraft plot <in…> <folder> [--to pdf|svg]
  cadcraft tools                             the tools the MCP server (cadcraft-mcp) offers

  --json    one JSON object on stdout          Exit codes: 0 ok, 1 problems, 2 bad usage.
`;

class Usage extends Error {}
const FLAGS_WITH_VALUE = new Set(['-o', '--out', '--version', '--format', '--layout', '--paper', '--scale', '--pen', '--rules', '--to', '--view', '--block', '--text', '--layer', '--type', '--sheet']);

function parse(argv) {
  const pos = [], f = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--') && a.includes('=')) { const [k, v] = a.split(/=(.*)/s); f[k] = v; continue; }
    if (FLAGS_WITH_VALUE.has(a)) { if (i + 1 >= argv.length) throw new Usage(a + ' needs a value.'); f[a] = argv[++i]; continue; }
    if (a.startsWith('-') && a !== '-') { f[a] = true; continue; }
    pos.push(a);
  }
  if (f['--out'] !== undefined) f['-o'] = f['--out'];
  return { pos, f };
}

const KNOWN = { info: [], run: ['-o', '--in-place', '--version', '--format'], convert: ['--version', '--format', '--to', '--instructions', '--view', '--paper', '--layout'], count: ['--block', '--text', '--layer', '--type', '--sheet', '--drawing', '--include-hidden'], plot: ['--layout', '--all', '--paper', '--portrait', '--scale', '--color', '--pen', '--to'], check: ['--rules'], tools: [] };

function readIn(p) {
  if (!fs.existsSync(p)) throw new Problem('There is no file ' + p + '.');
  if (!fs.statSync(p).isFile()) throw new Problem(p + ' is not a file.');
  return new Uint8Array(fs.readFileSync(p));
}
class Problem extends Error {}

async function openDrawing(p) {
  const ext = extOf(p);
  if (ext !== 'dwg' && ext !== 'dxf') throw new Usage('Drawings are .dwg or .dxf: ' + p);
  try { return await CadSession.open(readIn(p), p); } catch (e) { if (e instanceof Problem) throw e; throw new Problem('Could not open ' + p + ': ' + e.message); }
}

function targetFormat(out, f) {
  const ext = extOf(out);
  if (!['dwg', 'dxf'].includes(ext)) throw new Usage('The output must end in .dwg or .dxf: ' + out);
  const format = f['--format'] || (ext === 'dxf' ? 'dxf2000' : 'dwg');
  if (!['dwg', 'dxf2000', 'dxf'].includes(format)) throw new Usage('--format is dwg, dxf2000 or dxf (R12).');
  if ((format === 'dwg') !== (ext === 'dwg')) throw new Usage('--format ' + format + ' writes a .' + (format === 'dwg' ? 'dwg' : 'dxf') + ' file.');
  const version = f['--version'] || '2018';
  if (!['2000', '2004', '2007', '2010', '2013', '2018'].includes(String(version).replace(/^R/i, ''))) throw new Usage('--version is 2000, 2004, 2007, 2010, 2013 or 2018.');
  return { format, version: String(version).replace(/^R/i, '') };
}

const kb = (n) => (n < 1024 ? n + ' bytes' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB');

const commands = {
  async info([file], f, out) {
    if (!file) throw new Usage('cadcraft info <file>');
    const ext = extOf(file), lower = file.toLowerCase();
    if (ext === 'dwg' || ext === 'dxf') {
      const s = await openDrawing(file);
      const d = s.describe();
      out.json = d;
      out.text.push(d.name + ': ' + d.format, d.objects + ' objects on ' + d.layers.length + ' layers; units ' + d.units.insunits + ', ' + d.units.lengthFormat.toLowerCase() + ' lengths');
      if (d.extents) out.text.push('Extents ' + [d.extents.minX, d.extents.minY].join(', ') + ' to ' + [d.extents.maxX, d.extents.maxY].join(', '));
      out.text.push('By type: ' + Object.entries(d.byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join(', '));
      if (d.layouts.length) out.text.push('Sheets: ' + d.layouts.map((l) => l.name + (l.paper ? ' (' + l.paper.w + ' × ' + l.paper.h + ' ' + l.paper.unit + ')' : '')).join(', '));
      const used = d.blocks.filter((b) => b.uses);
      if (d.blocks.length) out.text.push('Blocks: ' + d.blocks.length + ' (' + used.length + ' used)');
      for (const n of d.notes) out.text.push('  ' + n);
      return 0;
    }
    if (/\.partcraft\.json$/.test(lower)) {   // 0.7 AS.4: a PartCraft part, built by its mesh kernel
      const PT = await import('./headless/part.mjs');
      let s;
      try { s = await PT.PartSession.open(readIn(file), file); } catch (e) { throw new Problem(e.message); }
      const d = (await PT.partModules()).A.describePart(s.part, s.regen());
      out.json = d;
      out.text.push(d.name + ': PartCraft part, ' + d.features + ' features (' + Object.entries(d.byType).map(([k, v]) => k + ' ' + v).join(', ') + ')' + (d.material ? ', ' + d.material.name : ''));
      if (d.solid) out.text.push('Solid: ' + d.solid.volume + ' mm³, ' + d.solid.bodies + ' bod' + (d.solid.bodies === 1 ? 'y' : 'ies') + ', ' + d.solid.triangles + ' triangles (mesh kernel)');
      if (d.parameters) out.text.push(d.parameters + ' parameters, ' + d.equations + ' equations' + (d.configurations ? '; configurations ' + d.configurations.names.join(', ') : ''));
      for (const f of d.failing) out.text.push('  failing: ' + f.name + (f.message ? ': ' + f.message : ''));
      return d.failing.length ? 1 : 0;
    }
    if (/\.civilcraft\.json$/.test(lower)) {   // 0.7 AS.3: a CivilCraft project
      const C = await import('./headless/civil.mjs');
      let s;
      try { s = await C.CivilSession.open(readIn(file), file); } catch (e) { throw new Problem(e.message); }
      const tools = (await C.civilModules()).civilTools({ project: () => s.project });
      const d = tools.find((t) => t.name === 'site_describe').run({});
      out.json = { ...d, notes: s.notes };
      out.text.push(d.name + ': CivilCraft project, units ' + d.units + (d.crs && d.crs.name ? ', ' + d.crs.name : ''));
      out.text.push(d.points.count + ' points (' + d.points.groups.map((g) => g.group + ' ' + g.count).join(', ') + ')');
      if (d.surfaces.existingGround) out.text.push('Existing ground: ' + d.surfaces.existingGround.triangles + ' triangles, z ' + d.surfaces.existingGround.minZ + ' to ' + d.surfaces.existingGround.maxZ);
      if (d.alignments.length) out.text.push('Alignments: ' + d.alignments.map((a) => a.name + (a.ok ? ' (' + a.length + ')' : ' (cannot be built)')).join(', '));
      out.text.push('Pads ' + d.pads + ', parcels ' + d.parcels + (d.network ? ', network ' + d.network.name + ': ' + d.network.structures + ' structures, ' + d.network.pipes + ' pipes' : ''));
      return 0;
    }
    if (ext === 'ifc') {
      const { IfcSession } = await import('./headless/ifc.mjs');
      let s;
      try { s = await IfcSession.open(readIn(file), file); } catch (e) { throw new Problem(e.message); }
      const d = s.summary();
      out.json = d;
      out.text.push(path.basename(file) + ': ' + d.schema + (d.application ? ', from ' + d.application : '') + (d.project ? ', project "' + d.project.name + '"' : ''));
      out.text.push(d.elements + ' elements; storeys: ' + (d.storeys.map((x) => x.name + ' (' + x.elements + ')').join(', ') || 'none'));
      out.text.push('Classes: ' + Object.entries(d.classes).map(([k, v]) => k + ' ' + v).join(', '));
      return 0;
    }
    if (lower.endsWith('.takeoff.json')) {
      const { TakeoffSession } = await import('./headless/takeoff.mjs');
      let s;
      try { s = await TakeoffSession.open(readIn(file), file); } catch (e) { throw new Problem(e.message); }
      const sum = s.summary(), q = s.quantities(), e = s.estimate();
      out.json = { ...sum, quantities: q.items, estimate: e };
      out.text.push(sum.name + ': ' + sum.items + ' items, ' + sum.marks + ' marks on ' + sum.files.map((x) => x.name).join(', '));
      for (const it of q.items) out.text.push('  ' + it.name + ': ' + it.quantity + ' ' + it.unit + (it.unscaledMarks ? ' (+ ' + it.unscaledMarks + ' unscaled mark' + (it.unscaledMarks === 1 ? '' : 's') + ' not counted)' : ''));
      out.text.push('Estimate: ' + e.total + (e.incomplete ? ' (incomplete)' : ''));
      return 0;
    }
    if (ext === 'pdf') {
      const { MarkupSession } = await import('./headless/markup.mjs');
      let s;
      try { s = await MarkupSession.open(readIn(file), file); } catch (e) { throw new Problem(e.message); }
      const sh = s.sheets(), m = s.markups({ limit: 100000 });
      out.json = { sheets: sh, markups: m.markups, total: m.total };
      out.text.push(path.basename(file) + ': ' + sh.length + ' sheet' + (sh.length === 1 ? '' : 's') + ', ' + m.total + ' markup' + (m.total === 1 ? '' : 's'));
      for (const x of sh) out.text.push('  ' + x.sheet + ': ' + x.markups + ' markup' + (x.markups === 1 ? '' : 's'));
      return 0;
    }
    throw new Usage('cadcraft info reads .dwg, .dxf, .ifc, .takeoff.json, .civilcraft.json, .partcraft.json and .pdf files.');
  },

  async run([script, file], f, out) {
    if (!script || !file) throw new Usage('cadcraft run <script.scr|.lsp> <drawing> (-o <out> | --in-place)');
    const target = f['-o'] || (f['--in-place'] ? file : null);
    if (!target) throw new Usage('Say where to write the result: -o <out.dwg|.dxf>, or --in-place.');
    const tf = targetFormat(target, f);
    const text = new TextDecoder().decode(readIn(script));
    const s = await openDrawing(file);
    const lisp = /\.(lsp|lisp)$/i.test(script);
    const r = lisp ? await s.runLisp(text, { name: path.basename(script) }) : await s.run(text, { label: 'SCRIPT' });   // a .scr reads as typed: a space is Enter
    const saved = s.save(tf.format, { version: tf.version });
    const failed = !!r.error;
    if (!failed) writeFileAtomic(path.resolve(target), saved.bytes);
    out.json = { ok: !failed, script, drawing: file, out: failed ? null : path.resolve(target), printed: r.printed, added: r.added.length, changed: r.changed.length, removed: r.removed.length, waiting: r.waiting, error: r.error, notes: saved.notes };
    out.text.push(...r.printed);
    if (r.waiting) out.text.push('(ended with Esc while ' + r.waiting.command + ' was waiting: ' + r.waiting.prompt + ')');
    if (failed) { out.err.push('error: ' + r.error, 'Nothing was written.'); return 1; }
    out.text.push('Wrote ' + target + ' (' + saved.format + ', ' + kb(saved.bytes.length) + '): ' + r.added.length + ' added, ' + r.changed.length + ' changed, ' + r.removed.length + ' removed.');
    for (const n of saved.notes) out.text.push('  ' + n);
    return 0;
  },

  async convert([file, target], f, out) {
    if (!file || !target) throw new Usage('cadcraft convert <in> <out.dwg|.dxf>');
    if (/\.partcraft\.json$/i.test(file)) {   // 0.7 AS.4: a part → STL, 3MF or (faceted) STEP; AS.6: OpenUSD
      const fmt = { stl: 'stl', '3mf': '3mf', step: 'step', stp: 'step', usdz: 'usdz', usda: 'usda', usdc: 'usdc' }[extOf(target)];
      if (!fmt) throw new Usage('A part is converted to .stl, .3mf, .step, .usdz, .usda or .usdc.');
      const PT = await import('./headless/part.mjs');
      let s;
      try { s = await PT.PartSession.open(readIn(file), file); } catch (e) { throw new Problem(e.message); }
      const x = await (await PT.partModules()).A.exportBytes(s.regen(), fmt, s.part.name || 'part', s.part);
      writeFileAtomic(path.resolve(target), x.bytes);
      out.json = { ok: true, from: file, out: path.resolve(target), format: fmt, bytes: x.bytes.length, ...(x.note ? { note: x.note } : {}) };
      out.text.push('Wrote ' + target + ' (' + fmt.toUpperCase() + ', ' + kb(x.bytes.length) + ').' + (x.note ? ' ' + x.note : ''));
      return 0;
    }
    if (/\.partcraft-manual\.json$/i.test(file)) {   // 0.7 AS.6: a PartCraft manual (Illustrate) → PDF, SVG, the interactive file or its instructions
      const as = { pdf: 'pdf', svg: 'svg', html: 'html', htm: 'html' }[extOf(target)];
      if (!as) throw new Usage('A manual is converted to .pdf, .svg or .html.');
      const paper = f['--paper'] || 'a4';
      if (!['a4', 'a3', 'letter', 'tabloid'].includes(paper)) throw new Usage('A manual\'s --paper is a4, a3, letter or tabloid.');
      if (f['--layout'] && !['pages', 'sheet'].includes(f['--layout'])) throw new Usage('A manual\'s --layout is pages or sheet.');
      const { load } = await import('./headless/apps.mjs');
      const { manualSources } = await import('./headless/tools.mjs');
      const [MN, A] = await Promise.all([load('partcraft', 'illustrate/all.js'), load('partcraft', 'agents.js')]);
      let doc;
      try { doc = MN.readManual(readIn(file)); } catch (e) { if (e instanceof Problem) throw e; throw new Problem(file + ': ' + e.message); }
      const view = f['--view'] === undefined ? null : /^\d+$/.test(f['--view']) ? +f['--view'] : f['--view'];
      let r;
      try { r = await A.illustrateFiles(doc.m, doc.meshes, { as, what: f['--instructions'] ? 'instructions' : 'views', view, paper, layout: f['--layout'] || 'pages', ...manualSources() }); } catch (e) { throw new Problem(e.message); }
      const outs = r.files.length === 1 ? [[path.resolve(target), r.files[0]]] : r.files.map((x) => [path.join(path.dirname(path.resolve(target)), x.name), x]);
      for (const [p, x] of outs) writeFileAtomic(p, x.bytes);
      out.json = { ok: true, from: file, manual: doc.m.name, as, files: outs.map(([p, x]) => ({ out: p, bytes: x.bytes.length })), ...(r.pages ? { pages: r.pages } : {}), notes: r.notes };
      out.text.push('Wrote ' + outs.map(([p, x]) => path.basename(p) + ' (' + kb(x.bytes.length) + ')').join(', ') + (r.pages ? ': ' + r.pages + ' page' + (r.pages === 1 ? '' : 's') : '') + '.', ...r.notes);
      return 0;
    }
    if (extOf(target) === 'xml') {   // 0.7 AS.3: a CivilCraft project or points file → LandXML
      const C = await import('./headless/civil.mjs');
      if (!/\.civilcraft\.json$/i.test(file) && !C.POINT_EXTS.includes(extOf(file))) throw new Usage('LandXML is written from a CivilCraft project (.civilcraft.json) or a points file.');
      let s;
      try { s = await C.CivilSession.open(readIn(file), file); } catch (e) { throw new Problem(e.message); }
      const xml = new TextEncoder().encode((await C.civilModules()).landXmlOf(s.project));
      writeFileAtomic(path.resolve(target), xml);
      out.json = { ok: true, from: file, out: path.resolve(target), format: 'LandXML 1.2', bytes: xml.length, points: s.project.points.length, notes: s.notes };
      out.text.push('Wrote ' + target + ' (LandXML 1.2, ' + kb(xml.length) + ', ' + s.project.points.length + ' points).');
      return 0;
    }
    const tf = targetFormat(target, f);
    const s = await openDrawing(file);
    const saved = s.save(tf.format, { version: tf.version });
    writeFileAtomic(path.resolve(target), saved.bytes);
    out.json = { ok: true, from: file, out: path.resolve(target), format: saved.format, bytes: saved.bytes.length, objects: s.doc.count(), notes: saved.notes };
    out.text.push('Wrote ' + target + ' (' + saved.format + ', ' + kb(saved.bytes.length) + ', ' + s.doc.count() + ' objects).');
    for (const n of saved.notes) out.text.push('  ' + n);
    return 0;
  },

  async plot([file, target], f, out) {
    if (!file || !target) throw new Usage('cadcraft plot <drawing> <out.pdf|.svg>');
    const svg = extOf(target) === 'svg';
    if (extOf(target) !== 'pdf' && !svg) throw new Usage('The plot is written to a .pdf or .svg file' + (extOf(target) === 'png' ? ' (PNG is not made: convert the SVG or PDF).' : '.'));
    if (svg && f['--all']) throw new Usage('--all writes one PDF with every sheet; for SVG plot one sheet at a time with --layout.');
    const s = await openDrawing(file);
    const o = { paper: f['--paper'] || 'iso-a3', portrait: !!f['--portrait'], scale: f['--scale'] || 'fit', mono: !f['--color'], pen: f['--pen'] ? +f['--pen'] : 0.25 };
    if (!Number.isFinite(o.pen) || o.pen <= 0) throw new Usage('--pen is a width in mm, e.g. 0.25.');
    let bytes, sheets;
    try {
      if (f['--all']) {
        if (!s.doc.layouts.length) throw new Problem('This drawing has no sheets; plot the model without --all.');
        const P = (await import('./headless/cad.mjs')).cadModules;
        const m = await P();
        const lists = s.doc.layouts.map((l) => m.P.displayList(s.doc, m.P.layoutSheet(s.doc, l), m.A.plotStyleOptions(s.doc, l, o.mono)));
        ({ bytes } = await m.P.toPdfPages(lists, { pen: o.pen, title: s.doc.meta.name, names: s.doc.layouts.map((l) => l.name) }));
        sheets = s.doc.layouts.map((l, i) => ({ sheet: l.name, w: lists[i].w, h: lists[i].h }));
      } else {
        const r = await s.plot({ layout: f['--layout'] || null, ...o, svg });
        bytes = r.bytes;
        sheets = [{ sheet: f['--layout'] || 'Model', w: r.sheet.w, h: r.sheet.h, scale: r.sheet.scale, fits: r.sheet.fits }];
        if (r.sheet.fits === false) out.err.push('note: at ' + r.sheet.scale + ' the drawing is bigger than the paper; its edges are cut off.');
      }
    } catch (e) { if (e instanceof Problem || e instanceof Usage) throw e; throw new Problem(e.message); }
    writeFileAtomic(path.resolve(target), bytes);
    out.json = { ok: true, out: path.resolve(target), bytes: bytes.length, sheets };
    out.text.push('Wrote ' + target + ' (' + kb(bytes.length) + '): ' + sheets.map((x) => x.sheet + ' ' + Math.round(x.w) + ' × ' + Math.round(x.h) + ' mm' + (x.scale ? ' at ' + x.scale : '')).join('; ') + '.');
    return 0;
  },

  async check([file], f, out) {
    if (!file || !f['--rules']) throw new Usage('cadcraft check <drawing> --rules <rules.json>');
    let rules;
    try { rules = JSON.parse(new TextDecoder().decode(readIn(f['--rules']))); } catch (e) { if (e instanceof Problem) throw e; throw new Usage('The rules file is not JSON: ' + e.message); }
    const { checkSchema } = await import('../mcp/core.mjs');
    const { headlessTools, createEnv } = await import('./headless/tools.mjs');
    const schema = headlessTools(createEnv()).find((t) => t.name === 'drawing_check').inputSchema.properties.rules;
    const bad = checkSchema(schema, rules, 'rules');
    if (bad.length) throw new Usage(bad.join(' '));
    const s = await openDrawing(file);
    const r = s.check(rules);
    out.json = r;
    if (!r.findings.length) out.text.push(path.basename(file) + ': no findings.');
    for (const x of r.findings) out.text.push(x.severity + ' ' + x.rule + ': ' + x.message + (x.ids.length ? ' (ids ' + x.ids.slice(0, 12).join(', ') + (x.count > 12 ? ', …' : '') + ')' : ''));
    return r.ok ? 0 : 1;
  },

  async count([file], f, out) {   // 0.7 AS.6: TakeoffCraft's exact counting on a DWG / DXF (cadcount.js through agents.js)
    if (!file) throw new Usage('cadcraft count <drawing> (--block <name> | --text <text> | --layer <layer> [--type CIRCLE]) [--sheet <name>]');
    if (!['dwg', 'dxf'].includes(extOf(file))) throw new Usage('cadcraft count reads a .dwg or .dxf drawing.');
    if (!f['--block'] && !f['--text'] && !f['--layer'] && !f['--type']) throw new Usage('Say what to count: --block <name>, --text <text>, or --layer / --type (shapes).');
    const { TakeoffSession } = await import('./headless/takeoff.mjs');
    let s;
    try { s = await TakeoffSession.openDrawing(readIn(file), path.basename(file)); } catch (e) { if (e instanceof Problem) throw e; throw new Problem(e.message); }
    let x;
    try { x = s.cad(f['--sheet'] === undefined ? undefined : /^\d+$/.test(f['--sheet']) ? +f['--sheet'] : f['--sheet']); } catch (e) { throw new Usage(e.message); }
    const q = { block: f['--block'], text: f['--text'], layer: f['--layer'], type: f['--type'], scope: f['--drawing'] ? 'drawing' : 'sheet', hidden: f['--include-hidden'] ? 'include' : 'skip' };
    const r = await s.m.agents.cadCount(x.set, x.i, q);
    out.json = { file, sheet: x.name, ...r };
    out.text.push(path.basename(file) + (q.scope === 'drawing' ? ' (whole drawing)' : ', sheet ' + x.name) + ': ' + r.total + ' ' + (q.block || q.text || [q.layer, q.type].filter(Boolean).join(' ')) + (r.hiddenSkipped ? ' (+ ' + r.hiddenSkipped + ' on hidden layers, not counted; --include-hidden counts them)' : ''));
    for (const [st, n] of r.byState || []) out.text.push('  state ' + (st || '(unknown)') + ': ' + n);
    return 0;
  },

  async tools(_, f, out) {
    const { headlessTools, createEnv, WINDOW_ONLY } = await import('./headless/tools.mjs');
    const list = headlessTools(createEnv()).map((t) => ({ name: t.name, group: t.group, title: t.title, description: t.description }));
    // what only the app windows (Studio) offer, so nobody looks for it here (0.7 AS.1)
    const windowOnly = Object.entries(WINDOW_ONLY).map(([app, w]) => ({ app, tools: w.only === '*' ? 'all' : w.only, why: w.why }));
    out.json = { tools: list, windowOnly };
    for (const t of list) out.text.push(t.name.padEnd(20) + t.group.padEnd(8) + t.title);
    out.text.push('', 'Only with the app open in Studio (Settings › Assistants):');
    for (const w of windowOnly) out.text.push('  ' + w.app.padEnd(14) + (w.tools === 'all' ? 'every tool' : w.tools.join(', ')) + ' — ' + w.why + '.');
    return 0;
  },
};

/**
 * Several files in one run (0.7 MCP-HEADLESS): info and check take any number; convert and plot take inputs then a
 * folder (made if missing) and --to; each output is named after its input. → the per-file arguments, or null (one file).
 */
function batchJobs(cmd, pos, f) {
  if (cmd === 'info' || cmd === 'check') return pos.length > 1 ? pos.map((p) => [p]) : null;
  if (cmd !== 'convert' && cmd !== 'plot') return null;
  const last = pos[pos.length - 1];
  const isDir = !!last && (/[\\/]$/.test(last) || (fs.existsSync(last) && fs.statSync(last).isDirectory()));
  if (!(pos.length > 2 || (pos.length === 2 && isDir))) return null;
  if (!isDir && /\.(dwg|dxf|pdf|svg)$/i.test(last)) throw new Usage('With several drawings, the last argument is the folder for the results, not ' + last + '.');
  const to = String(f['--to'] || (cmd === 'plot' ? 'pdf' : '')).replace(/^\./, '').toLowerCase();
  if (cmd === 'convert' && !['dwg', 'dxf'].includes(to)) throw new Usage('cadcraft convert <in…> <folder> --to dwg|dxf');
  if (cmd === 'plot' && !['pdf', 'svg'].includes(to)) throw new Usage('--to is pdf or svg.');
  fs.mkdirSync(last, { recursive: true });
  const jobs = pos.slice(0, -1).map((p) => [p, path.join(last, path.basename(p).replace(/\.[^.]+$/, '') + '.' + to)]);
  const seen = new Map();
  for (const [p, o] of jobs) { if (seen.has(o)) throw new Usage(p + ' and ' + seen.get(o) + ' would both write ' + o + '.'); seen.set(o, p); }
  return jobs;
}

async function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const out = { text: [], err: [], json: null };
  let code;
  try {
    if (!argv.length || argv[0] === '--help' || argv[0] === '-h' || argv[0] === 'help') { process.stdout.write(USAGE); return 0; }
    if (argv[0] === '--version') { process.stdout.write(PACKAGE_VERSION + '\n'); return 0; }
    const cmd = argv[0];
    if (!commands[cmd]) throw new Usage('Unknown command "' + cmd + '".');
    const { pos, f } = parse(argv.slice(1).filter((a) => a !== '--json'));
    for (const k of Object.keys(f)) if (!KNOWN[cmd].includes(k) && !(k === '--out' && KNOWN[cmd].includes('-o'))) throw new Usage('cadcraft ' + cmd + ' has no option ' + k + '.');
    // what the app's modules print goes to stderr, never into --json output
    const log = console.log; console.log = (...a) => process.stderr.write(a.join(' ') + '\n'); console.warn = console.log; console.info = console.log;
    try {
      const jobs = batchJobs(cmd, pos, f);
      if (!jobs) code = await commands[cmd](pos, f, out);
      else {   // several files (0.7 MCP-HEADLESS): each on its own; one that fails does not stop the others
        code = 0;
        const files = [];
        for (const job of jobs) {
          const one = { text: [], err: [], json: null };
          let c;
          try { c = await commands[cmd](job, f, one); } catch (e) { if (e instanceof Usage) throw e; c = 1; one.json = { ok: false, error: e.message }; one.err.push(job[0] + ': ' + e.message); }
          code = Math.max(code, c);
          files.push({ file: job[0], ...(job[1] ? { out: path.resolve(job[1]) } : {}), ...(one.json && typeof one.json === 'object' ? ('ok' in one.json ? one.json : { ok: c === 0, ...one.json }) : { ok: c === 0 }) });
          if (one.text.length) out.text.push('== ' + job[0], ...one.text);
          out.err.push(...one.err);
        }
        out.json = { ok: code === 0, files, failed: files.filter((x) => !x.ok).length };
        out.text.push(jobs.length + ' file' + (jobs.length === 1 ? '' : 's') + ', ' + out.json.failed + ' with problems.');
      }
    } finally { console.log = log; }
  } catch (e) {
    if (e instanceof Usage) {
      if (json) process.stdout.write(JSON.stringify({ ok: false, error: e.message, usage: true }) + '\n');
      else process.stderr.write('cadcraft: ' + e.message + '\n\n' + USAGE);
      return 2;
    }
    if (json) process.stdout.write(JSON.stringify({ ok: false, error: e.message }) + '\n');
    else process.stderr.write('cadcraft: ' + e.message + '\n');
    return 1;
  }
  if (json) process.stdout.write(JSON.stringify(out.json && typeof out.json === 'object' && !('ok' in out.json) ? { ok: code === 0, ...out.json } : out.json) + '\n');
  else { if (out.text.length) process.stdout.write(out.text.join('\n') + '\n'); }
  if (out.err.length) process.stderr.write(out.err.join('\n') + '\n');
  return code;
}

main().then((c) => { process.exitCode = c; }, (e) => { process.stderr.write('cadcraft: ' + (e && e.stack || e) + '\n'); process.exitCode = 1; });
