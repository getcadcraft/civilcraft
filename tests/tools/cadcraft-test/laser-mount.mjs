#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * laser-mount.mjs — CadCraft's Laser panel mount (0.7 SU.772, session laser-cad), in Node (no browser): laser-cad.js
 * `drawingInput` reads a drawing the way the panel does (layers, blocks with layer 0, a mirrored block, arcs kept as bulges,
 * hatches, a picture, units → mm, what is not sent), lib/laser plans it inside-first and writes GRBL G-code; and the mount
 * lines are all there (LASER command, View › More button, input-cadcraft.js entry in both ribbon styles and the File menu,
 * manifest css, words in en / es-MX / id, help topic).
 *
 *   node tools/cadcraft-test/laser-mount.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/');
const imp = (f) => import(pathToFileURL(APP + f).href);
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const en = JSON.parse(fs.readFileSync(APP + 'lang/en.json', 'utf8'));
const I18n = await imp('i18n.js');
I18n.init({ strings: en });
const { Doc } = await imp('doc.js');
const { pictureBlock } = await imp('pictures.js');
const L = await imp('laser-cad.js');
const C = await imp('commands.js');
const { plan } = await imp('laser/laser-plan.js');
const { gcode } = await imp('laser/laser-gcode.js');
const { cleanJob, jobFor } = await imp('laser/laser-model.js');

console.log('\n== drawingInput: what the panel reads from a drawing');
const doc = new Doc();
for (const n of ['CUT', 'SCORE', 'FILL', 'PIC', 'HIDDEN', 'NOTES']) doc.addLayer({ name: n, color: 1 });
doc.change('seed', () => {
  doc.add({ type: 'poly', layer: 'CUT', closed: true, pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 60 }, { x: 0, y: 60 }] });   // the plate
  doc.add({ type: 'circle', layer: 'CUT', cx: 30, cy: 30, r: 8 });                                                                     // a hole in it
  doc.add({ type: 'line', layer: 'SCORE', x1: 10, y1: 50, x2: 90, y2: 50 });
  doc.add({ type: 'arc', layer: 'SCORE', cx: 70, cy: 20, r: 10, a0: 0, a1: Math.PI / 2 });
  doc.add({ type: 'hatch', layer: 'FILL', solid: true, loops: [[60, 30, 80, 30, 80, 40, 60, 40]] });
  doc.add({ type: 'line', layer: 'HIDDEN', x1: 0, y1: 0, x2: 5, y2: 5 });
  doc.add({ type: 'text', layer: 'NOTES', x: 0, y: -10, h: 2.5, s: 'Plate A' });
  // a block: its layer-0 arc follows the reference's layer; placed mirrored (sx −1)
  doc.defineBlock({ name: 'TAB', base: { x: 0, y: 0 }, entities: [{ type: 'arc', layer: '0', cx: 0, cy: 0, r: 5, a0: 0, a1: Math.PI }, { type: 'line', layer: 'SCORE', x1: -5, y1: 0, x2: 5, y2: 0 }] });
  doc.add({ type: 'insert', layer: 'CUT', block: 'TAB', x: 150, y: 10, sx: -1, sy: 1, rot: 0 });
  doc.defineBlock(pictureBlock('*I1', { file: 'logo.png', x: 0, y: 0, ux: 0.5, uy: 0, vx: 0, vy: 0.5, w: 4, h: 2 }));
  doc.add({ type: 'insert', layer: 'PIC', block: '*I1', x: 200, y: 0, sx: 1, sy: 1, rot: 0 });
  doc.defineBlock(pictureBlock('*I2', { file: 'logo.png', x: 0, y: 0, ux: 0.5, uy: 0, vx: 0, vy: 0.5, w: 4, h: 2 }));
  doc.add({ type: 'insert', layer: 'PIC', block: '*I2', x: 300, y: 0, sx: 1, sy: 1, rot: 0.5 });   // turned: not sent
});
doc.layers.get('HIDDEN').on = false;
doc.pictures = new Map([['logo.png', { name: 'logo.png', bytes: new Uint8Array(4), mime: 'image/png', w: 4, h: 2 }]]);
const gray = () => ({ pw: 4, ph: 2, gray: Uint8Array.from([0, 64, 128, 255, 255, 128, 64, 0]) });
const inp = L.drawingInput(doc, { gray });
const byLayer = (n, closed) => inp.shapes.find((s) => s.layer === n && s.closed === closed);
ok(JSON.stringify(inp.layers) === JSON.stringify(['CUT', 'SCORE', 'FILL', 'PIC']), 'layers with something to send, in the drawing\'s order; a layer turned off is left out', JSON.stringify(inp.layers));
const cut = byLayer('CUT', true);
ok(cut && cut.loops.length === 2, 'CUT: the plate and the hole as closed loops', JSON.stringify(cut?.loops.length));
const hole = cut?.loops.find((l) => l.length === 2);
ok(hole && hole.every((p) => p.b === 1), 'a circle is two half arcs (bulge 1), not chords');
const tab = byLayer('CUT', false);
ok(tab && tab.loops.length === 1 && Math.abs(Math.abs(tab.loops[0][0].b) - 1) < 1e-9 && tab.loops[0][0].b < 0, 'the block\'s layer-0 arc takes the reference\'s layer (CUT); mirrored, its bulge turns round', JSON.stringify(tab?.loops));
const score = byLayer('SCORE', false);
ok(score && score.loops.length === 3, 'SCORE: the line, the arc and the block\'s own SCORE line', JSON.stringify(score?.loops.length));
const arc = score?.loops.find((l) => l[0].b);
ok(arc && Math.abs(arc[0].b - Math.tan(Math.PI / 8)) < 1e-9 && Math.abs(arc[1].x - 70) < 1e-9 && Math.abs(arc[1].y - 30) < 1e-9, 'an arc keeps its bulge (quarter circle = tan 22.5°)');
ok(byLayer('FILL', true)?.loops[0].length === 4, 'a hatch comes as its closed boundary');
ok(inp.pictures.length === 1 && inp.pictures[0].layer === 'PIC' && inp.pictures[0].x === 200 && inp.pictures[0].w === 2 && inp.pictures[0].h === 1 && inp.pictures[0].pw === 4, 'a square picture: its place and size in mm and its grey pixels', JSON.stringify(inp.pictures.map(({ gray: _g, ...p }) => p)));
ok(inp.skipped.text === 1 && inp.skipped['picture-turned'] === 1, 'what is not sent is counted: the text, the turned picture', JSON.stringify(inp.skipped));
ok(inp.mmPer === null, 'a unitless drawing: one unit is one millimetre');
const only = L.drawingInput(doc, { gray, only: new Set([[...doc.model.values()].find((e) => e.type === 'circle').id]) });
ok(only.layers.length === 1 && only.shapes[0].loops.length === 1, 'only the selection: just the hole');
doc.meta.units = 'inches';
const inch = L.drawingInput(doc, { gray });
ok(inch.mmPer === 25.4 && Math.abs(inch.shapes.find((s) => s.layer === 'CUT' && s.closed).loops[0][1].x - 2540) < 1e-6, 'an inch drawing is sent in mm (× 25.4)');
doc.meta.units = '';
const none = L.drawingInput(doc, { gray: () => null });
ok(none.pictures.length === 0 && none.skipped['picture-loading'] === 1, 'a picture whose file is not decoded yet is counted as loading');

console.log('\n== the job: settings in doc.meta (one undo step), plan inside-first, GRBL G-code');
const job = cleanJob({ layers: [{ name: 'CUT', mode: 'cut' }, { name: 'SCORE', mode: 'score' }, { name: 'FILL', mode: 'fill' }, { name: 'PIC', mode: 'image' }] });
doc.change('Change laser layer', () => doc.setMeta({ laser: job }));
ok(doc.meta.laser?.layers.length === 4, 'setJob keeps the job in doc.meta.laser');
doc.undo();
ok(!doc.meta.laser, 'undo takes it back');
doc.redo();
const j = jobFor(cleanJob(doc.meta.laser), inp.layers);
const p = plan(j, inp);
ok(p.ops.map((o) => o.mode).join() === 'image,fill,score,cut', 'order: picture, fill, score, cut', p.ops.map((o) => o.mode).join());
const cutOp = p.ops.find((o) => o.mode === 'cut');
// the hole's path lies within 8 mm of (30, 30); the plate's has a corner at (0, 0) (machine coordinates = drawing − origin)
const pathAt = (test) => { let n = -1; for (const m of cutOp.moves) { if (m.start) n++; if (test(m.x + p.origin.x, m.y + p.origin.y)) return n; } return -1; };
const holeAt = pathAt((x, y) => Math.abs(Math.hypot(x - 30, y - 30) - 8) < 1e-6), plateAt = pathAt((x, y) => Math.hypot(x - 100, y - 60) < 1e-6);
ok(holeAt >= 0 && plateAt >= 0 && holeAt < plateAt, 'inside-first: the hole is cut before the plate it is in', holeAt + ' / ' + plateAt);
const g = gcode(j, p);
ok(/\$32=1/.test(g) && /\bM4\b/.test(g) && /\bM5\b/.test(g), 'GRBL laser mode G-code ($32=1, M4, M5)');

console.log('\n== the mount lines');
ok(C.lookup('LASER')?.name === 'LASER' && C.lookup('LASERCUT')?.name === 'LASER', 'LASER (alias LASERCUT) is a command');
const ui = fs.readFileSync(APP + 'ui.inc', 'utf8');
ok(/\['LASER', Lang::t\('toolbar\.laser'\), 'LASER'\]/.test(ui), 'ui.inc: View › More › Laser…');
const In = await imp('input-cadcraft.js');
const cmd = In.COMMANDS.find((c) => c.id === 'file.laser');
ok(cmd && cmd.sel === '[data-tb-key="View"] [data-cmd="LASER"]', 'input-cadcraft.js: file.laser clicks the View › More button');
const inMenus = (st) => JSON.stringify(st.menus || []).includes('file.laser') && JSON.stringify(st.tabs || []).includes('file.laser');
ok(inMenus(In.STYLES.drafting) && inMenus(In.STYLES.ribbon), 'both ribbon styles: File menu and the Plot panel');
const man = JSON.parse(fs.readFileSync(APP + 'manifest.json', 'utf8'));
ok(man.css.includes('laser/laser-panel.css') && fs.existsSync(APP + 'laser/laser-panel.css'), 'manifest css carries laser/laser-panel.css');
const src = fs.readFileSync(APP + 'laser-cad.js', 'utf8');
const keys = new Set([...src.matchAll(/t\('(cclaser\.[\w.-]+)'/g)].map((m) => m[1]).filter((k) => !k.endsWith('.')));
for (const k of ['picture-turned', 'picture-missing', 'picture-loading', 'text', 'dimension', 'leader', 'point', 'xline']) keys.add('cclaser.skipped.' + k);
for (const k of ['toolbar.laser', 'input.cmd.file.laser', 'cmd.laser.help', 'cmd.laser.none']) keys.add(k);
const laserKeys = Object.keys(en).filter((k) => k.startsWith('laser.'));
for (const loc of ['en', 'es-MX', 'id']) {
  const o = JSON.parse(fs.readFileSync(APP + 'lang/' + loc + '.json', 'utf8'));
  const miss = [...keys, ...laserKeys].filter((k) => !o[k]);
  ok(!miss.length && laserKeys.length >= 88, loc + ': every Laser word is there (' + (keys.size + laserKeys.length) + ')', miss.join());
}
const help = fs.readFileSync(APP + 'help/laser-cutting.md', 'utf8');
ok(/^title: /m.test(help) && /LASER/.test(help), 'help topic laser-cutting.md');

console.log('\n== the settings in the file: block CADCRAFT_LASER (DWG every version, DXF R12 and 2000)');
{
  const { saveDwg, DWG_VERSIONS } = await imp('dwg-save.js');
  const { importDwg } = await imp('dwg-import.js');
  const { readDwg } = await imp('dwg/read.js');
  const { readDxf, writeDxf } = await imp('dxf.js');
  const { writeDxf2000 } = await imp('dxf2000.js');
  const LF = await imp('laser-file.js');
  const d = new Doc();
  // enough layers that the settings take several POINTs (230 characters each), names in another language included
  const names = ['CORTE', 'Grabado é ñ', 'Šrafura', '彫刻', ...Array.from({ length: 26 }, (_, i) => 'L' + (i + 1))];
  for (const n of names) d.addLayer({ name: n, color: 3 });
  d.change('seed', () => { for (const [i, n] of names.entries()) d.add({ type: 'line', layer: n, x1: 0, y1: i * 5, x2: 50, y2: i * 5 }); d.add({ type: 'circle', layer: 'CORTE', cx: 20, cy: 20, r: 6 }); });
  const plain = { dxf12: writeDxf(d).text, dxf2000: writeDxf2000(d).text, dwg: Object.fromEntries(DWG_VERSIONS.map(({ key }) => [key, saveDwg(d, { version: key }).bytes])) };
  const job = cleanJob({
    layers: names.map((n, i) => ({ name: n, mode: ['cut', 'score', 'engrave', 'fill', 'image', 'off'][i % 6], power: 10 + i, speed: 500 + 10 * i, passes: 1 + (i % 3), interval: 0.12, angle: 15, crosshatch: i % 2 === 0, dither: 'atkinson' })),
    machine: { sMax: 255, rapid: 4000, bedW: 400, bedH: 300, dynamic: false, air: true, setLaserMode: false, framePower: 1.5 }, origin: 'drawing',
  });
  d.change('Change laser layer', () => d.setMeta({ laser: job }));
  const want = JSON.stringify(job);
  ok(LF.laserPayload(d).length > 3, 'the settings take ' + LF.laserPayload(d).length + ' POINTs of 230 characters', String(LF.laserPayload(d).length));
  ok(LF.laserPayload(d).every(([s]) => /^[\x20-\x7e]*$/.test(s) && s.length <= 255), 'every xdata string is ASCII and at most 255 characters');
  const files = [['DXF R12', () => readDxf(writeDxf(d).text)], ['DXF 2000', () => readDxf(writeDxf2000(d).text)],
    ...DWG_VERSIONS.map(({ key }) => ['DWG ' + key, () => importDwg(readDwg(saveDwg(d, { version: key }).bytes), { versionTag: 'x' })])];
  for (const [label, read] of files) {
    const b = new Doc(); b.load(read());
    ok(JSON.stringify(b.meta.laser) === want && ![...b.blocks.keys()].some(LF.isLaserBlock), label + ': save → reopen gives the same laser settings (and no block shows)', JSON.stringify(b.meta.laser)?.slice(0, 120));
  }
  ok(DWG_VERSIONS.length >= 6, 'every DWG version the writer has: ' + DWG_VERSIONS.map((v) => v.key).join(', '));
  // a file without the block opens with the panel's defaults
  for (const [label, read] of [['DXF R12', () => readDxf(plain.dxf12)], ['DXF 2000', () => readDxf(plain.dxf2000)], ['DWG 2018', () => importDwg(readDwg(plain.dwg['2018']), { versionTag: 'x' })]]) {
    const b = new Doc(); b.load(read());
    ok(b.meta.laser === undefined, label + ' with no laser block: no settings, the panel starts from its defaults');
  }
  const blank = new Doc(); blank.load(readDxf(writeDxf2000(d).text));
  blank.load({ meta: { name: 'Drawing2' } });
  ok(blank.meta.laser === undefined, 'a new drawing does not keep the last drawing\'s settings');
  // damaged or foreign data is refused, never thrown
  ok(LF.laserFromPayload([{ cc: ['CCLASER:1:{"format":"cadcraft-laser","version":2,"job":{}}'] }]) === null && LF.laserFromPayload([{ cc: ['CCLASER:1:{not json'] }]) === null && LF.laserFromPayload([{ cc: ['other'] }]) === null, 'a wrong version, broken JSON or other strings give no settings');
  const odd = LF.laserFromPayload([{ cc: ['CCLASER:1:' + JSON.stringify({ format: 'cadcraft-laser', version: 1, job: { layers: [{ name: 'A', mode: 'cut', power: 9999, speed: -5 }], machine: { sMax: 'x' } } })] }]);
  ok(odd && odd.layers[0].power <= 100 && odd.layers[0].speed > 0 && Number.isFinite(odd.machine.sMax), 'values from a file are cleaned (cleanJob): power ≤ 100 %, speed > 0', JSON.stringify(odd));

  console.log('\n== readers that do not know the block: the drawing is otherwise unchanged');
  const strip = (t) => t.split(/\r?\n/);
  const norm12 = (t) => t.replace(/\n {0,2}5\n[0-9A-F]+\n/g, '\n');
  // the DXF text with the block is the text without it plus the block (and its BLOCK_RECORD/handles in 2000)
  const lz12 = writeDxf(d).text, lz2000 = writeDxf2000(d).text;
  ok(lz12.includes('CADCRAFT_LASER') && !plain.dxf12.includes('CADCRAFT_LASER'), 'DXF R12: the block is written only when there are settings');
  const lines12 = strip(lz12).length - strip(plain.dxf12).length;
  ok(lines12 > 0 && lines12 < 40 + 20 * LF.laserPayload(d).length, 'DXF R12: only the block\'s lines are added (' + lines12 + ')');
  // what lib/dwg's reader (the other apps' reader: BimCraft, ModelCraft, …) sees: the same entities, layers and blocks + one unused block
  for (const key of DWG_VERSIONS.map((v) => v.key)) {
    const a = readDwg(plain.dwg[key]), b = readDwg(saveDwg(d, { version: key }).bytes);
    const msp = (m) => (m.blocks || []).find((x) => /^\*model_space$/i.test(x.name))?.entities || [];
    const ents = (m) => JSON.stringify(msp(m).map((e) => [e.type, e.layer, e.start?.x ?? e.center?.x ?? 0, e.end?.y ?? e.radius ?? 0]));
    const blocks = (m) => (m.blocks || []).map((x) => x.name).filter((n) => !/^\*(model|paper)_space/i.test(n)).sort();
    const extra = blocks(b).filter((n) => !blocks(a).includes(n));
    const refs = (m) => (m.blocks || []).flatMap((x) => x.entities || []).filter((e) => e.type === 'INSERT').map((e) => e.name || e.block);
    ok(msp(a).length === names.length + 1 && ents(a) === ents(b) && JSON.stringify((a.tables?.layers || a.layers || []).map((l) => l.name)) === JSON.stringify((b.tables?.layers || b.layers || []).map((l) => l.name)) && extra.join() === 'CADCRAFT_LASER' && !refs(b).includes('CADCRAFT_LASER'),
      'DWG ' + key + ' read by cc-dwg: same objects and layers, one extra block nobody inserts', JSON.stringify({ extra, same: ents(a) === ents(b) }));
  }
  // an older CadCraft (or any reader that ignores the name) sees an ordinary block and nothing else changes
  const renamed = new Doc(); renamed.load(readDxf(lz2000.replace(/CADCRAFT_LASER/g, 'XX_IGNORED_BLOCK')));
  const ref = new Doc(); ref.load(readDxf(plain.dxf2000));
  ok(renamed.meta.laser === undefined && renamed.model.size === ref.model.size && renamed.layers.size === ref.layers.size && renamed.blocks.has('XX_IGNORED_BLOCK'), 'a reader that does not know the name: no settings, the same objects and layers, the block unused');
  // ezdxf (an independent reader) audits both DXF versions clean
  const py = path.join(ROOT, 'tools/cadcraft-test/venv/bin/python');
  if (fs.existsSync(py)) {
    const { execFileSync } = await import('node:child_process');
    const os = await import('node:os');
    for (const [label, text, base] of [['DXF R12', lz12, plain.dxf12], ['DXF 2000', lz2000, plain.dxf2000]]) {
      const audit = (t) => { const f = path.join(os.tmpdir(), 'laser-mount-' + process.pid + '.dxf'); fs.writeFileSync(f, t); try { return JSON.parse(execFileSync(py, ['-I', path.join(ROOT, 'tools/cadcraft-test/audit.py'), f], { encoding: 'utf8' })); } finally { fs.unlinkSync(f); } };
      const r = audit(text), r0 = audit(base);
      ok(r.errors === r0.errors && r.fixes === r0.fixes && JSON.stringify(r.model ?? r.counts ?? null) === JSON.stringify(r0.model ?? r0.counts ?? null), label + ': ezdxf audits it as it audits the file without the block (errors ' + r.errors + ', fixes ' + r.fixes + ')', JSON.stringify([r.messages, r0.messages]));
    }
  } else console.log('  note: tools/cadcraft-test/venv not set up: ezdxf audit skipped');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
