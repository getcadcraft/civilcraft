#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geodata-check.mjs — a drawing's geographic location (GEODATA, 0.6 GEO-DWG) as other programs read it. Black boxes only:
 * the ODA File Converter (run, its output read; never its source) and ezdxf (a DXF library run as a program; its source
 * never read). Spike: docs/spikes/geo-dwg_PART_2.md.
 *
 *   node tools/dwg-test/geodata-check.mjs [--keep] [--pack]   (--pack: also the owner's pack in /var/www/CADCRAFT/handoff/geo-dwg-check/)
 *
 * CadCraft (dev) saves a drawing with a coordinate system as DWG 2010 / 2013 / 2018 and DXF 2000, then:
 *   1. ODA reads each DWG with its audit on (no .err) and writes DXF 2018; ezdxf reads that DXF's GEODATA: the EPSG code and
 *      the axis order (get_crs), design point, reference point, north, units — all as CadCraft wrote them
 *   2. ezdxf reads CadCraft's DXF 2000 the same way
 *   3. ODA turns CadCraft's DXF 2000 into DWG 2018; cc-dwg reads the GEODATA ODA wrote (same fields)
 *   4. ODA re-saves CadCraft's DWG 2018 as DWG 2018 (another program's save); CadCraft opens it: the same system and place
 *   5. a GEODATA ODA wrote, with no CADCRAFT_GEO block (another program's drawing): CadCraft places the drawing from it
 * Files in tmp/geo-dwg/check/ (small; removed unless --keep). Skips with a note when ODA or ezdxf is not set up
 * (tools/civilcraft-test/setup-dwg-readers.sh, tools/cadcraft-test/venv).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev');
const ODA = path.join(ROOT, 'tools/civilcraft-test/venv/dwg-readers/oda/AppRun');
const PY = path.join(ROOT, 'tools/cadcraft-test/venv/bin/python3');
const DIR = path.join(ROOT, 'tmp/geo-dwg/check');
const KEEP = process.argv.includes('--keep');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);

let pass = 0, fail = 0;
const ok = (c, label, info = '') => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + label + (c || !info ? '' : '  — ' + info)); };
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;

const I18n = await load('i18n.js');
I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Doc } = await load('doc.js');
const { saveDwg } = await load('dwg-save.js');
const { writeDxf2000 } = await load('dxf2000.js');
const { importDwg } = await load('dwg-import.js');
const { readDwg } = await load('dwg/read.js');
const Gd = await load('geodwg.js');

const xvfb = (() => { try { return execFileSync('sh', ['-c', 'command -v xvfb-run'], { encoding: 'utf8' }).trim(); } catch { return ''; } })();
const haveOda = fs.existsSync(ODA) && !!xvfb, havePy = fs.existsSync(PY);
if (!haveOda) console.log('  note: the ODA File Converter is not set up — its checks are skipped');
if (!havePy) console.log('  note: ezdxf is not set up — its checks are skipped');

fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });
/** One converter run over a folder: files of `ext` → `format` (audit on); → Map(input → { out, err }). */
function oda(files, ext, format) {
  const inD = path.join(DIR, 'in-' + ext + '-' + format), outD = path.join(DIR, 'out-' + ext + '-' + format);
  fs.mkdirSync(inD, { recursive: true }); fs.mkdirSync(outD, { recursive: true });
  for (const f of files) fs.copyFileSync(f, path.join(inD, path.basename(f)));
  spawnSync(xvfb, ['-a', ODA, inD, outD, 'ACAD2018', format, '0', '1', '*.' + ext], { encoding: 'utf8', timeout: 600000 });
  const res = new Map();
  for (const f of files) {
    const out = path.join(outD, path.basename(f).replace(/\.\w+$/, '.' + format.toLowerCase()));
    res.set(f, { out: fs.existsSync(out) ? out : null, err: fs.existsSync(out + '.err') ? fs.readFileSync(out + '.err', 'utf8').trim() : null });
  }
  return res;
}
const EZ = `
import ezdxf, json, sys
d = ezdxf.readfile(sys.argv[1]); g = d.modelspace().get_geodata()
if g is None: print(json.dumps(None)); sys.exit(0)
try: crs = list(g.get_crs())
except Exception as e: crs = str(e)
x = g.dxf
print(json.dumps({'crs': crs, 'kind': x.coordinate_type, 'design': list(x.design_point), 'reference': list(x.reference_point),
  'north': list(x.north_direction), 'units': x.horizontal_units}))
`;
const ezdxf = (file) => JSON.parse(execFileSync(PY, ['-I', '-c', EZ, file], { encoding: 'utf8' }).trim());

// the drawing: metres, a UTM system, one drawing point placed on the grid and the drawing turned 30°
const place = { x: 10, y: 20, e: 500000, n: 3300000, rot: 30 };
const geo = { crs: { code: 32614, name: 'WGS 84 / UTM zone 14N', unit: 'm', place }, layers: [{ id: 'm1', name: 'Tiles', kind: 'xyz', template: 'https://tile.example.org/{z}/{x}/{y}.png', opacity: 1, visible: true }] };
const d = new Doc();
d.change('t', () => { d.add({ type: 'line', x1: 0, y1: 0, x2: 100, y2: 50 }); d.setMeta({ units: 'meters', geo }); });
const wantNorth = [Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)];
const dwgs = ['2010', '2013', '2018'].map((v) => { const f = path.join(DIR, 'cc-' + v + '.dwg'); fs.writeFileSync(f, saveDwg(d, { version: v }).bytes); return f; });
const dxf = path.join(DIR, 'cc-2000.dxf');
fs.writeFileSync(dxf, writeDxf2000(d).text);
const sameAsOurs = (z, label) => ok(z && Array.isArray(z.crs) && z.crs[0] === 32614 && z.crs[1] === true && z.kind === 2 && near(z.design[0], 10) && near(z.design[1], 20)
  && near(z.reference[0], 500000) && near(z.reference[1], 3300000) && near(z.north[0], wantNorth[0], 1e-8) && near(z.north[1], wantNorth[1], 1e-8) && z.units === 6, label, JSON.stringify(z));

console.log('== 1. ODA reads our DWG (audit), ezdxf reads ODA\'s DXF');
if (haveOda) {
  const r = oda(dwgs, 'dwg', 'DXF');
  for (const f of dwgs) {
    const { out, err } = r.get(f);
    ok(out && !err, path.basename(f) + ': ODA opens it with its audit on, no errors', err || 'no output');
    if (out && havePy) sameAsOurs(ezdxf(out), path.basename(f) + ' → ODA DXF → ezdxf: EPSG:32614, east-north axes, design and reference points, north 30°, metres');
  }
}
console.log('== 2. ezdxf reads our DXF 2000');
if (havePy) sameAsOurs(ezdxf(dxf), 'cc-2000.dxf → ezdxf: the same location');
console.log('== 3. ODA turns our DXF 2000 into DWG; cc-dwg reads its GEODATA');
if (haveOda) {
  const { out, err } = oda([dxf], 'dxf', 'DWG').get(dxf);
  ok(out && !err, 'ODA reads cc-2000.dxf and writes DWG 2018, no errors', err || 'no output');
  if (out) {
    const m = readDwg(new Uint8Array(fs.readFileSync(out)));
    const ms = m.tables.blockRecords.find((x) => /^\*model_space$/i.test(x.name));
    const g = m.objects.find((o) => o.type === 'GEODATA');
    ok(g && !g.undecoded && g.host === ms.handle && Gd.epsgOf(g.csDef) === 32614 && near(g.designPoint.x, 10) && near(g.referencePoint.y, 3300000) && near(g.north.x, wantNorth[0], 1e-8),
      'the DWG ODA wrote holds the GEODATA on the model space, with our code and place', JSON.stringify(g && { host: g.host, ms: ms.handle, dp: g.designPoint, cs: g.csDef?.slice(0, 80) }));
  }
}
console.log('== 4. ODA re-saves our DWG 2018; CadCraft opens it');
if (haveOda) {
  const f = dwgs[2];
  const { out } = oda([f], 'dwg', 'DWG').get(f);
  ok(!!out, 'ODA saves it again');
  if (out) {
    const b = new Doc(); b.load(importDwg(readDwg(new Uint8Array(fs.readFileSync(out))), { versionTag: 'x' }));
    ok(b.meta.geo?.crs?.code === 32614 && JSON.stringify(b.meta.geo.crs.place) === JSON.stringify(Gd.cleanGeo(geo).crs.place) && b.meta.geo.layers.length === 1, 'the system, the place and the map layer come back', JSON.stringify(b.meta.geo));
    // 5. the same file without CadCraft's block: only the GEODATA ODA wrote (as another program's drawing would be)
    const m = readDwg(new Uint8Array(fs.readFileSync(out)));
    m.blocks = m.blocks.filter((x) => !Gd.isGeoBlock(x.name));
    const c = new Doc(); c.load(importDwg(m, { versionTag: 'x' }));
    const p = c.meta.geo?.crs?.place;
    ok(c.meta.geo?.crs?.code === 32614 && p && near(p.x, 10) && near(p.y, 20) && near(p.e, 500000) && near(p.n, 3300000) && near(p.rot, 30, 1e-6) && !c.meta.geo.layers.length,
      '5. from ODA\'s GEODATA alone: the system and the place (no map layers: they are CadCraft\'s only)', JSON.stringify(c.meta.geo));
  }
}

// --pack: drawings for the owner to open in other drafting programs (handoff/geo-dwg-check/ + .zip; never in the repo)
if (process.argv.includes('--pack')) {
  const OUT = '/var/www/CADCRAFT/handoff/geo-dwg-check';
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  // the Texas State Capitol (lon −97.74035, lat 30.27467) on each grid, by PROJ (pyproj 2026-10-18)
  const sets = [
    { stem: 'geo-utm14n-metres', units: 'meters', crs: { code: 32614, name: 'WGS 84 / UTM zone 14N', unit: 'm', place: { x: 0, y: 0, e: 621159.203, n: 3349893.163, rot: 0 } }, size: 100 },
    { stem: 'geo-texas-central-feet-turned15', units: 'feet', crs: { code: 2277, name: 'NAD83 / Texas Central (ftUS)', unit: 'ftUS', place: { x: 0, y: 0, e: 3115030.812, n: 10073172.379, rot: 15 } }, size: 300 },
  ];
  const rows = [];
  for (const s of sets) {
    const p = new Doc(), h = s.size / 2;
    p.change('pack', () => {
      p.add({ type: 'poly', closed: true, pts: [[-h, -h], [h, -h], [h, h], [-h, h]].map(([x, y]) => ({ x, y, b: 0 })) });
      p.add({ type: 'line', x1: 0, y1: 0, x2: 0, y2: h * 1.6 });   // drawing +Y (north only when the turn is 0)
      p.add({ type: 'circle', cx: 0, cy: 0, r: h / 10 });
      p.add({ type: 'text', x: h / 8, y: h / 8, h: h / 12, s: 'Capitol 0,0' });
      p.setMeta({ units: s.units, name: s.stem, geo: { crs: s.crs, layers: [] } });
    });
    for (const v of ['2018', '2013', '2010', '2000']) { const f = s.stem + '-dwg' + v + '.dwg'; fs.writeFileSync(path.join(OUT, f), saveDwg(p, { version: v }).bytes); rows.push([f, s.crs.code, v === '2000' ? 'no (CadCraft only)' : 'yes']); }
    const f = s.stem + '-dxf2000.dxf'; fs.writeFileSync(path.join(OUT, f), writeDxf2000(p).text); rows.push([f, s.crs.code, 'yes']);
  }
  fs.writeFileSync(path.join(OUT, 'checklist.csv'), 'file,epsg,location written,opens (y/n),location shown (system name),marker at the Capitol (y/n),online map lines up (y/n),notes\r\n' + rows.map((r) => r.join(',') + ',,,,,').join('\r\n') + '\r\n');
  fs.writeFileSync(path.join(OUT, 'README.txt'), [
    'GEO-DWG check: a drawing\'s geographic location written by CadCraft (0.6 round 2, session cad-extra_PART_2).',
    'Spike: docs/spikes/geo-dwg_PART_2.md. Made by: node tools/dwg-test/geodata-check.mjs --pack',
    '',
    'Each drawing is a square with a circle at 0,0, a line along the drawing\'s +Y axis and the text "Capitol 0,0".',
    'Drawing 0,0 is placed on the Texas State Capitol, Austin (longitude -97.74035, latitude 30.27467):',
    '  geo-utm14n-metres-*        EPSG:32614 (WGS 84 / UTM zone 14N), metres, 100 m square, not turned',
    '  geo-texas-central-feet-*   EPSG:2277 (NAD83 / Texas Central, US survey feet), drawn in feet, 300 ft square,',
    '                             the drawing turned 15 degrees: grid north is 15 degrees clockwise (to the right) of the line',
    'The -dwg2000 files carry the location for CadCraft only (no GEODATA in DWG 2000-2007): they should show none.',
    '',
    'In a program that reads a drawing\'s geographic location (for example AutoCAD with GEOGRAPHICLOCATION, Map 3D or Civil 3D):',
    '  1. Open each file. Note any message.',
    '  2. Does it show a geographic location? Which coordinate system does it name?',
    '  3. With its online map on: is the circle on the Capitol, and is the square the right size?',
    '  4. Fill in checklist.csv. If the system is not recognised, please save a copy of a drawing where you set the',
    '     location yourself in that program (Texas Central or UTM 14N) and send it: the system\'s own name is in it.',
    '',
  ].join('\r\n'));
  execFileSync('sh', ['-c', `cd ${JSON.stringify(path.dirname(OUT))} && rm -f geo-dwg-check.zip && zip -qr geo-dwg-check.zip geo-dwg-check`]);
  console.log('  pack: ' + OUT + ' (+ .zip), ' + rows.length + ' drawings');
}

if (!KEEP) fs.rmSync(DIR, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
