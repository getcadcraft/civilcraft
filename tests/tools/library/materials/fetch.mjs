#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fetch.mjs — the CC0 texture sets of LibraryCraft's material library (0.7 MT.3, session `materials`), fetched ONCE from Poly
 * Haven (every asset CC0) into CC_HOME/refs/cc0-materials/<id>/ — outside every repo (KICKOFF rule 13; registered in
 * testfiles/LARGE-FILES.md) — with each file's sha256 pinned in lock.json beside this script. A file already there with its
 * pinned sha256 is not fetched again; a pinned file that changed upstream is refused (never silently replaced).
 * Downloads are data: stored as bytes, never run or unpacked here. What is kept per set: info.json (the API's own record:
 * name, authors, dimensions in mm, categories), the 1k JPEG maps (diffuse, roughness, OpenGL normal, displacement, AO, metal
 * when there is one) and the set's MaterialX (.mtlx: MT.4's test input).
 *
 *   node tools/library/materials/fetch.mjs [--check]     --check: verify what is on disk against lock.json, fetch nothing
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = '/var/www/CADCRAFT/refs/cc0-materials';
const SETS = JSON.parse(fs.readFileSync(path.join(HERE, 'sets.json'), 'utf8'));
const LOCK_PATH = path.join(HERE, 'lock.json');
const lock = fs.existsSync(LOCK_PATH) ? JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8')) : {};
const check = process.argv.includes('--check');
const MAPS = ['Diffuse', 'Rough', 'nor_gl', 'Displacement', 'AO', 'Metal'];
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const get = async (url) => { const r = await fetch(url, { headers: { 'User-Agent': 'CadCraft LibraryCraft materials fetch (getcadcraft.com)' } }); if (!r.ok) throw new Error(r.status + ' ' + url); return Buffer.from(await r.arrayBuffer()); };

let bad = 0, got = 0, had = 0;
for (const { id } of SETS.sets) {
  if (!/^[a-z0-9_]{1,64}$/.test(id)) { console.log('! bad id ' + id); bad++; continue; }
  const dir = path.join(OUT, id);
  const want = lock[id] || {};
  if (check) {
    for (const [name, e] of Object.entries(want)) {
      const p = path.join(dir, name);
      if (!fs.existsSync(p) || sha(fs.readFileSync(p)) !== e.sha256) { console.log('! ' + id + '/' + name + ' missing or changed'); bad++; } else had++;
    }
    if (!Object.keys(want).length) { console.log('! ' + id + ' not fetched'); bad++; }
    continue;
  }
  fs.mkdirSync(dir, { recursive: true });
  const files = [['info.json', 'https://api.polyhaven.com/info/' + id]];
  const list = JSON.parse((await get('https://api.polyhaven.com/files/' + id)).toString('utf8'));
  for (const m of MAPS) { const f = list[m]?.[SETS.resolution]?.jpg; if (f && /^https:\/\/dl\.polyhaven\.org\//.test(f.url)) files.push([path.basename(new URL(f.url).pathname), f.url]); }
  const mx = list.mtlx?.[SETS.resolution]?.mtlx;
  if (mx && /^https:\/\/dl\.polyhaven\.org\//.test(mx.url)) files.push([path.basename(new URL(mx.url).pathname), mx.url]);
  lock[id] = lock[id] || {};
  for (const [name, url] of files) {
    if (!/^[A-Za-z0-9_.-]{1,120}$/.test(name)) { console.log('! odd file name ' + name); bad++; continue; }
    const p = path.join(dir, name), pinned = lock[id][name];
    if (fs.existsSync(p) && pinned && sha(fs.readFileSync(p)) === pinned.sha256) { had++; continue; }
    const bytes = await get(url);
    const h = sha(bytes);
    if (pinned && pinned.sha256 !== h && name !== 'info.json') { console.log('! ' + id + '/' + name + ' changed upstream: left alone'); bad++; continue; }
    fs.writeFileSync(p, bytes);
    lock[id][name] = { url, sha256: h, bytes: bytes.length };
    got++;
  }
  console.log('  ' + id + ': ' + Object.keys(lock[id]).length + ' files');
}
if (!check) fs.writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 1) + '\n');
console.log(`materials: ${got} fetched, ${had} already there, ${bad} problems`);
process.exit(bad ? 1 : 0);
