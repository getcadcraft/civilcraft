#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-round4.mjs — checks the round-4 family files (tools/library/detail/r4-*.mjs) and writes their CSV rows (tools/library/blocks/<group>-5.csv).
 *
 *   node tools/library/detail/make-round4.mjs [--check] [--write] [--groups foodservice,people] [--final]
 *
 *   --files r4-foodservice.mjs,r4-people.mjs   only load these family files (use it while others are still writing theirs)
 *   --check   (default) validates every variant: name rules, duplicates (against each other and every existing block CSV), the library's privacy
 *             patterns, sizes, a builder that runs and draws something, and counts per group
 *   --write   writes <group>-5.csv for the groups named by --groups (default: all)
 *   --expect foodservice,people   requires exactly 150 variants in each named group
 *   --final   also requires exactly 150 variants in every one of the ten groups
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expand, GROUP_OF, KIND_OF, REMARK_OF } from './fam.mjs';
import { Acc } from './com-core.mjs';
const LI = await import(pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../public_html/assets/apps/bimcraft/dev/libitem.js')).href);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOCKS = path.join(HERE, '..', 'blocks');
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const gi = args.indexOf('--groups');
const only = gi >= 0 ? new Set(args[gi + 1].split(',')) : null;
const ri = args.indexOf('--round');
const ROUND = ri >= 0 ? Number(args[ri + 1]) : 4;          // 4: r4-*.mjs → <group>-5.csv, 150 each; 5: r5-*.mjs → <group>-6.csv, 250 each
const GROUPS6 = ["printing", "aerospace", "agriculture", "architecture", "automotive", "computer", "educational", "energy", "fixtures", "hobby", "household", "industrial", "interior", "jewellery", "fun", "machine", "marine", "military", "nature", "piping", "robotics", "speedrun", "sport", "tech", "tools", "toys"];
const GROUPS = ROUND >= 6 ? GROUPS6 : ['foodservice', 'casework', 'furniture', 'plumbing', 'electrical', 'mechanical', 'appliances', 'site', 'people', 'other',
  ...(ROUND >= 5 ? ['medical', 'construction', 'earthmoving', 'mining', 'aviation'] : [])];
const TARGET = ROUND >= 7 ? 150 : ROUND >= 6 ? 100 : ROUND >= 5 ? 250 : 150;   // 6: r6-*.mjs → <group>-7.csv, 100 each in the 26 groups from the owner's category list

export const LOAD_ERRORS = [];
export async function loadFamilies() {
  const out = [];
  const fi = args.indexOf('--files');
  const want = fi >= 0 ? new Set(args[fi + 1].split(',')) : null;
  for (const f of fs.readdirSync(HERE).filter((x) => new RegExp(`^r${ROUND}-.+\\.mjs$`).test(x) && !/^r\d-(kit|preview)\.mjs$/.test(x)).sort()) {
    if (want && !want.has(f)) continue;
    try {
      const m = await import(pathToFileURL(path.join(HERE, f)).href);
      for (const fam of m.default || []) out.push({ ...fam, file: f });
    } catch (e) { LOAD_ERRORS.push(`${f}: could not load: ${String(e.message).split('\n')[0]}`); }
  }
  return out;
}

// the library's privacy patterns (LibraryPrivacy::scanText), for names and descriptions
const STREET = 'street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|court|ct|way|place|pl|circle|cir|terrace|parkway|pkwy|highway|hwy|calle|avenida|strasse|straße|rue';
const PROJECT = 'residence|house|home|project|job|remodel|addition|renovation|estate|ranch|cabin|villa|lot|property';
const OKWORD = /^(the|this|that|tiny|guest|main|pool|green|club|town|row|farm|tree|dog|boat|light|ware|court|ranch|custom|model|show|open|lake|beach|country|modern|small|large|new|old|my|our|your)$/i;
function privacy(text) {
  const bad = [];
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) bad.push('email');
  if (/(?<![\w.])(\+?\d{1,3}[ .-]?)?(\(\d{2,4}\)[ .-]?|\d{2,4}[ .-])\d{3,4}[ .-]\d{3,4}(?![\w.])/.test(text)) bad.push('phone-like number');
  if (new RegExp(`\\b\\d{1,6}\\s+(?:[NSEW]\\.?\\s+)?[A-Za-zÀ-ÿ][\\wÀ-ÿ'-]*(?:\\s+[A-Za-zÀ-ÿ][\\wÀ-ÿ'-]*){0,3}\\s+(?:${STREET})\\.?\\b`, 'iu').test(text)) bad.push('street-address pattern');
  if (/\b([A-Z][a-zà-ÿ]{2,})['’]s\s+[a-z]/u.test(text)) bad.push("Capitalised possessive");
  for (const m of text.matchAll(new RegExp(`\\b([A-Z][a-zà-ÿ]{2,})\\s+(?:${PROJECT})\\b`, 'giu'))) if (!OKWORD.test(m[1])) bad.push(`"${m[0]}" reads as a name`);
  return bad;
}
const TM = /\b(starbucks|mcdonald|boeing|airbus|ikea|apple|samsung|lg|whirlpool|ge|hobart|vulcan|rational|true|traulsen|delfield|manitowoc|scotsman|hoshizaki|taylor|bunn|nespresso|schindler|otis|kone|thyssen|tsa|iata|faa|ada)\b/i;

export async function check({ quiet = false } = {}) {
  const fams = await loadFamilies();
  const errors = [...LOAD_ERRORS], warn = [];
  const existing = new Map();
  for (const f of fs.readdirSync(BLOCKS)) if (f.endsWith('.csv') && !f.endsWith(`-${ROUND + 1}.csv`)) for (const line of fs.readFileSync(path.join(BLOCKS, f), 'utf8').split('\n').slice(1)) { const m = line.match(/^"([^"]+)"/); if (m) existing.set(m[1].toLowerCase(), f); }
  const seen = new Map(), perGroup = Object.fromEntries(GROUPS.map((g) => [g, 0])), rows = [];
  for (const f of fams) {
    const where = `${f.file}: ${f.title}`;
    if (!f.title || !/^Generic /.test(f.title)) errors.push(`${where}: the title must start with "Generic "`);
    if (!f.cat || !/^[a-z]+\/[a-z]+$/.test(f.cat) || !GROUPS.includes(GROUP_OF(f.cat))) errors.push(`${where}: bad cat ${f.cat}`);
    else if (!Object.prototype.hasOwnProperty.call(LI.CATEGORIES, f.cat)) errors.push(`${where}: ${f.cat} is not a library category (see LibraryCatalog::CATEGORIES)`);
    if (typeof f.build !== 'function') { errors.push(`${where}: no build()`); continue; }
    if (!Array.isArray(f.vs) || !f.vs.length) { errors.push(`${where}: no variants`); continue; }
    const descs = new Set();
    for (const r of expand(f)) {
      const id = r.name.toLowerCase();
      if (r.name.length > 120) errors.push(`${r.name}: name longer than 120`);
      if (existing.has(id)) errors.push(`${r.name}: already in ${existing.get(id)}`);
      if (seen.has(id)) errors.push(`${r.name}: duplicate of ${seen.get(id)}`); else seen.set(id, where);
      if (![r.w, r.d, r.h].every((n) => Number.isFinite(n) && n > 0) || !Number.isFinite(r.z)) errors.push(`${r.name}: bad size ${r.w} x ${r.d} x ${r.h} z ${r.z}`);
      if (!r.desc || r.desc.length < 25 || r.desc.length > 300) errors.push(`${r.name}: description must be 25 to 300 characters (is ${r.desc ? r.desc.length : 0})`);
      if (/[",]/.test(r.desc.replace(/,/g, '')) ) errors.push(`${r.name}: description has a double quote`);
      for (const t of [r.name, r.desc]) { for (const b of privacy(t)) errors.push(`${r.name}: privacy check: ${b}`); const m = t.match(TM); if (m) errors.push(`${r.name}: "${m[0]}" is a maker, a standard or a trademark`); }
      descs.add(r.desc);
      // the builder must run and draw something inside the body box
      try {
        const body = { x: -r.w * 25.4 / 2, y: -r.d * 25.4, z: r.z * 25.4, w: r.w * 25.4, d: r.d * 25.4, h: r.h * 25.4 };
        const a = new Acc(body); f.build(a, r.v);
        if (a.t.length < 12) errors.push(`${r.name}: the builder drew ${a.t.length} triangles`);
        if (a.t.length > 40000) errors.push(`${r.name}: ${a.t.length} triangles is too many (limit 40000)`);
        if (!a.p.length) errors.push(`${r.name}: no plan shapes`);
        if (!a.msg) errors.push(`${r.name}: build() must call a.log('Added …')`);
        let x0 = 1e18, x1 = -1e18, y0 = 1e18, y1 = -1e18, z0 = 1e18, z1 = -1e18;
        for (const t of a.t) for (const p of t) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); }
        const tol = Math.max(body.w, body.d, body.h) * 0.06 + 40;
        if (x0 < body.x - tol || x1 > body.x + body.w + tol || y0 < body.y - tol || y1 > tol || z0 < body.z - tol || z1 > body.z + body.h + tol)
          warn.push(`${r.name}: geometry leaves the body box (x ${Math.round(x0)}..${Math.round(x1)} of ${Math.round(body.x)}..${Math.round(body.x + body.w)}, y ${Math.round(y0)}..${Math.round(y1)} of ${Math.round(body.y)}..0, z ${Math.round(z0)}..${Math.round(z1)} of ${Math.round(body.z)}..${Math.round(body.z + body.h)})`);
        if (!a.t.every((t) => t.every((p) => p.every(Number.isFinite)))) errors.push(`${r.name}: a coordinate is not a number`);
      } catch (e) { errors.push(`${r.name}: build() threw: ${e.message.split('\n')[0]}`); }
      perGroup[GROUP_OF(r.cat)]++;
      rows.push(r);
    }
  }
  const ei = args.indexOf('--expect');
  if (ei >= 0) for (const g of args[ei + 1].split(',')) if (perGroup[g] !== TARGET) errors.push(`group ${g}: ${perGroup[g]} variants, need ${TARGET}`);
  if (flag('--final')) for (const g of GROUPS) if (perGroup[g] !== TARGET) errors.push(`group ${g}: ${perGroup[g]} variants, need ${TARGET}`);
  if (!quiet) {
    console.log('variants per group:', Object.entries(perGroup).map(([g, n]) => `${g}=${n}`).join(' '));
    for (const w of warn.slice(0, 40)) console.log('warn:', w);
    if (warn.length > 40) console.log(`warn: … ${warn.length - 40} more`);
    for (const e of errors.slice(0, 80)) console.error('ERROR:', e);
    if (errors.length > 80) console.error(`ERROR: … ${errors.length - 80} more`);
    console.log(errors.length ? `${errors.length} error(s)` : `ok: ${rows.length} variants in ${fams.length} families`);
  }
  return { rows, errors, perGroup };
}

if (process.argv[1] && process.argv[1].endsWith('make-round4.mjs')) {
  const { rows, errors } = await check();
  if (flag('--write')) {
    if (errors.length) { console.error('not writing: fix the errors first'); process.exit(1); }
    const q = (s) => '"' + String(s).replace(/"/g, '""') + '"';
    for (const g of GROUPS) {
      if (only && !only.has(g)) continue;
      const mine = rows.filter((r) => GROUP_OF(r.cat) === g);
      if (!mine.length) continue;
      const lines = ['"name","category","kind","description","width (in)","depth (in)","height (in)","z (in)","remarks"'];
      for (const r of mine) lines.push([r.name, r.cat, KIND_OF[g], r.desc, r.w, r.d, r.h, r.z, REMARK_OF(g, r.cat)].map(q).join(','));
      fs.writeFileSync(path.join(BLOCKS, `${g}-${ROUND + 1}.csv`), lines.join('\n') + '\n');
      console.log(`wrote ${g}-${ROUND + 1}.csv (${mine.length})`);
    }
  }
  process.exit(errors.length ? 1 : 0);
}
