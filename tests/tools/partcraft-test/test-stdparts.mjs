#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-stdparts.mjs — PartCraft's standard part templates (stdparts.js; 0.5 MQ.4): every template builds, every
 * configuration (one per size of the standard's table) solves its sketches and rebuilds on the mesh kernel with the
 * volume the dimensions give (hexagon s²·√3/2, circles as the kernel's polygons, the key's round ends), the file round
 * trip keeps the parameters and rows, and the shared table copy is byte-identical to lib/shapes/parts.js.
 *   node tools/partcraft-test/test-stdparts.mjs [--verbose]    (or runStdPartsTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runStdPartsTests({ ok, section, M }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const SP = await import(DEV + 'stdparts.js');
  const P = await import(DEV + 'part.js');
  const K = await import(DEV + 'kernel.js');
  const CF = await import(DEV + 'configs.js');
  const PP = await import(DEV + 'params-part.js');
  const Pt = await import(DEV + 'shapes/parts.js');

  section('standard part templates (stdparts.js, shapes/parts.js; 0.5 MQ.4)');
  ok(fs.readFileSync(DEV + 'shapes/parts.js', 'utf8') === fs.readFileSync(path.join(REPO, 'lib/shapes/parts.js'), 'utf8'), 'shapes/parts.js is a byte-identical copy of lib/shapes/parts.js');
  ok(SP.TEMPLATES.length === 9 && !SP.findTemplate('spur-gear'), '9 templates (bolts and screws, nuts, washers, pins, bearings, keys); no gear template');

  const n = (part) => part.resolution || 64;
  const disc = (d, part) => n(part) / 2 * (d / 2) ** 2 * Math.sin(2 * Math.PI / n(part));   // the kernel's circle
  const hex = (s) => Math.sqrt(3) / 2 * s * s;
  const expect = (id, v, part) => {
    switch (id) {
      case 'iso4017': case 'iso4014': case 'asme-hex-bolt': return hex(v.s) * v.k + disc(v.d, part) * v.l;
      case 'iso4032': case 'asme-hex-nut': return (hex(v.s) - disc(v.d, part)) * v.height;
      case 'iso7089': return (disc(v.d2, part) - disc(v.d1, part)) * v.h;
      case 'iso2338': return disc(v.d, part) * v.l;
      case 'iso15': return (disc(v.D, part) - disc(v.d, part)) * v.B;
      case 'din6885': return (v.b * (v.l - v.b) + Math.PI / 4 * v.b * v.b) * v.h;
      default: return NaN;
    }
  };
  let built = 0;
  const bad = [];
  for (const tpl of SP.TEMPLATES) {
    const part = SP.makeTemplate(tpl.id);
    const back = P.readPart(P.toJSON(part));
    if (back.configs.rows.length !== Pt.partSizes(tpl.id).length || back.params.vars.length !== tpl.params.length) bad.push(tpl.id + ': file round trip');
    for (const row of back.configs.rows) {
      CF.applyRow(back.params, row);
      const res = PP.applyPartParams(back);
      if (res && res.ok === false) { bad.push(tpl.id + ' ' + row.name + ': ' + JSON.stringify(res.errors)); continue; }
      const r = K.regenerate(back, M);
      const failed = [...r.results.values()].filter((x) => x.status !== 'ok');
      const want = expect(tpl.id, row.values, back);
      const tol = tpl.id === 'din6885' ? 0.01 : 0.002;   // the key's round ends are polygons too
      if (failed.length || !(Math.abs(r.stats.volume / want - 1) < tol)) bad.push(tpl.id + ' ' + row.name + ': volume ' + r.stats?.volume?.toFixed(2) + ' vs ' + want.toFixed(2) + (failed.length ? ' (' + failed.map((x) => x.message).join('; ') + ')' : ''));
      built++;
    }
  }
  ok(!bad.length && built === SP.TEMPLATES.reduce((s, t) => s + Pt.partSizes(t.id).length, 0), built + ' sizes: each configuration solves and rebuilds with the volume its dimensions give', bad.slice(0, 6).join(' | '));

  const m10 = SP.makeTemplate('iso4017', 'M10');
  ok(m10.configs.active === 'M10 × 40' && m10.params.vars.find((v) => v.name === 's').expr === '16' && m10.material.density === 7.85, 'ISO 4017 opened at M10: the M10 × 40 row active, s = 16, steel');
  const r = K.regenerate(m10, M);
  const bb = r.stats.bbox || null;
  ok(r.stats.volume > 0 && bb && Math.abs(bb.max[1] - 6.4) < 1e-6 && Math.abs(bb.min[1] + 40) < 1e-6 && Math.abs(bb.max[0] - 16 / Math.sqrt(3)) < 1e-6, 'the head stands 6.4 mm up from the top plane, the shank 40 mm down', JSON.stringify(bb));
  let threw = '';
  try { SP.makeTemplate('spur-gear'); } catch (e) { threw = e.message; }
  ok(/No template/.test(threw), 'a family without a template says so');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const VERBOSE = process.argv.includes('--verbose');
  const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
  const section = (s) => console.log('\n' + s);
  const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
  const M = await Module(); M.setup();
  await runStdPartsTests({ ok, section, M });
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
