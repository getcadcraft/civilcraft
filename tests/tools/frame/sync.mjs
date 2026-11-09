#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs — copies the frame analysis library (lib/frame/*.js + frame-panel.css; 0.6 LC.4) byte for byte into each app that analyses
 * frames: detailcraft/dev/frame/ and bimcraft/dev/frame/. Run it after every change to lib/frame (nobody edits a copy);
 * bin/test-frame.mjs fails while a copy differs. Same shape as tools/shapes/sync.mjs.
 *
 *   node tools/frame/sync.mjs [--check] [target …]     targets: detailcraft, bimcraft
 *   --check   change nothing; exit 1 and list what differs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LIB = path.join(ROOT, 'lib/frame');
const APPS = path.join(ROOT, 'public_html/assets/apps');
export const FILES = ['frame-model.js', 'frame-solve.js', 'plate.js', 'plate-model.js', 'plate-solve.js', 'plate-mesh.js', 'plate-bim.js', 'plate-draw.js', 'rc-section.js', 'slab-design.js', 'rc-aci318.js', 'rc-design.js', 'loads-asce7.js', 'loads-sources.js', 'wind-asce7.js', 'seismic-asce7.js', 'spectrum-asce7.js', 'combos-asce7.js', 'frame-loads-panel.js', 'frame-concrete.js', 'frame-concrete-panel.js', 'frame-dynamics-panel.js', 'frame-chart.js', 'frame-report.js', 'frame-pdf.js', 'frame-combos.js', 'frame-design.js', 'frame-design-aisc.js', 'frame-design-en.js', 'frame-breakit.js', 'frame-craft.js', 'frame-panel.js', 'frame-draw.js', 'frame-panel.css'];
export const TARGETS = {
  detailcraft: path.join(APPS, 'detailcraft/dev/frame'),
  bimcraft: path.join(APPS, 'bimcraft/dev/frame'),
  cadcraft: path.join(APPS, 'cadcraft/dev/frame'),   // 0.8 CH.11: the P&ID add-on's pipe stress calculator (process/equip/pipestress.js imports ../../frame/)
};

/** [{ target, file, state: 'ok' | 'differs' | 'missing' | 'stale' }] */
export function compare(names = Object.keys(TARGETS)) {
  const out = [];
  for (const name of names) {
    const dir = TARGETS[name];
    for (const f of FILES) {
      const dst = path.join(dir, f);
      if (!fs.existsSync(dst)) { out.push({ target: name, file: f, state: 'missing' }); continue; }
      out.push({ target: name, file: f, state: Buffer.compare(fs.readFileSync(path.join(LIB, f)), fs.readFileSync(dst)) === 0 ? 'ok' : 'differs' });
    }
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (/\.(js|css)$/.test(f) && !FILES.includes(f)) out.push({ target: name, file: f, state: 'stale' });
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const names = args.filter((a) => !a.startsWith('--'));
  for (const n of names) if (!TARGETS[n]) { console.error(n + ': not a target (' + Object.keys(TARGETS).join(', ') + ')'); process.exit(2); }
  const rows = compare(names.length ? names : undefined);
  let diff = 0;
  // the words: frame.* keys of tools/frame/lang.mjs in each app's en.json and es-MX.json (others left to `closing`)
  const { EN, ES } = await import('./lang.mjs');
  for (const name of names.length ? names : Object.keys(TARGETS)) {
    for (const [loc, table] of [['en', EN], ['es-MX', ES]]) {
      const file = path.join(TARGETS[name], '..', 'lang', loc + '.json');
      // other sessions edit these files too: write only when a frame.* value differs, replacing values in place, adding
      // missing keys at the end and dropping ones the table no longer has (no reordering of anyone else's keys)
      const text = fs.readFileSync(file, 'utf8');
      const obj = JSON.parse(text);
      const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const stale = Object.keys(obj).filter((k) => k.startsWith('frame.') && !(k in table));
      if (!stale.length && Object.entries(table).every(([k, v]) => same(obj[k], v))) continue;
      const out = {};
      for (const [k, v] of Object.entries(obj)) if (!stale.includes(k)) out[k] = k in table ? table[k] : v;
      for (const [k, v] of Object.entries(table)) if (!(k in out)) out[k] = v;
      const next = JSON.stringify(out, null, 2) + '\n';
      diff++;
      if (!check) fs.writeFileSync(file, next);
      console.log(name + ' ' + loc + '.json: ' + (check ? 'frame.* words differ' : 'frame.* words written'));
    }
  }
  for (const name of names.length ? names : Object.keys(TARGETS)) {
    const mine = rows.filter((r) => r.target === name && r.state !== 'ok');
    if (!mine.length) { console.log(name + ': ok (' + FILES.length + ' files)'); continue; }
    diff++;
    if (!check) {
      fs.mkdirSync(TARGETS[name], { recursive: true });
      for (const r of mine) {
        if (r.state === 'stale') fs.unlinkSync(path.join(TARGETS[name], r.file));
        else fs.copyFileSync(path.join(LIB, r.file), path.join(TARGETS[name], r.file));
      }
    }
    console.log(name + ': ' + (check ? 'differs — ' : 'updated — ') + mine.map((r) => r.file + (r.state === 'ok' ? '' : ' (' + r.state + ')')).join(', '));
  }
  process.exit(check && diff ? 1 : 0);
}
