#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * r4-preview.mjs — look at a family file before it is published (a published version is never rewritten).
 *
 *   node tools/library/detail/r4-preview.mjs <r4-file.mjs> <out-dir> [--all]
 *
 * Renders the FRONT elevation of one variant per family (the first, the middle and the last with --all) into <out-dir>/front/*.png and contact
 * sheets <out-dir>/sheet_NN.png (30 per sheet, labelled). View the sheets with the Read tool; they are PNGs.
 * Also writes <out-dir>/plan/*.svg-less plan summaries? No: the plan is checked by detail.mjs --check; this tool is for the 3D body.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expand } from './fam.mjs';
import { Acc } from './com-core.mjs';
import { frontPng } from './front.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [file, out] = process.argv.slice(2);
const all = process.argv.includes('--all');
fs.mkdirSync(path.join(out, 'front'), { recursive: true });
const m = await import(pathToFileURL(path.resolve(file)).href);
const labels = [];
for (const f of m.default) {
  const rows = expand(f);
  const pick = all ? [0, Math.floor((rows.length - 1) / 2), rows.length - 1].filter((x, i, a) => a.indexOf(x) === i) : [Math.floor((rows.length - 1) / 2)];
  for (const i of pick) {
    const r = rows[i], body = { x: -r.w * 25.4 / 2, y: -r.d * 25.4, z: r.z * 25.4, w: r.w * 25.4, d: r.d * 25.4, h: r.h * 25.4 };
    const a = new Acc(body); f.build(a, r.v);
    const pos = [], idx = []; for (const t of a.t) for (const p of t) { idx.push(pos.length / 3); pos.push(...p); }
    const png = frontPng({ body: { type: 'mesh', positions: pos, indices: idx } });
    const slug = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    fs.writeFileSync(path.join(out, 'front', slug + '.png'), png); labels.push([slug, r.name, a.t.length]);
  }
}
fs.writeFileSync(path.join(out, 'labels.json'), JSON.stringify(labels));
const py = `
import json,sys
from PIL import Image, ImageDraw
out=sys.argv[1]; L=json.load(open(out+'/labels.json'))
cols,rows,cw,ch=6,5,320,250; per=cols*rows
for p in range(0,len(L),per):
    sh=Image.new('RGB',(cols*cw,rows*ch),'white'); d=ImageDraw.Draw(sh)
    for i,(slug,name,tris) in enumerate(L[p:p+per]):
        im=Image.open(f'{out}/front/{slug}.png').convert('LA'); a=Image.eval(im.split()[1],lambda v:255-v).resize((cw,int(cw*0.75)))
        x,y=(i%cols)*cw,(i//cols)*ch; sh.paste(a.convert('RGB'),(x,y)); d.text((x+4,y+ch-16),name[8:56],fill='black')
    sh.save(f'{out}/sheet_{p//per:02d}.png')
print(len(L),'previews')
`;
const r = spawnSync('python3', ['-c', py, out], { encoding: 'utf8' });
console.log(r.stdout.trim() || r.stderr.trim());
