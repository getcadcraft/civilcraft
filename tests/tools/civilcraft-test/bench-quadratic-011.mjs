#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-quadratic-011.mjs — PERF.76 (0.11 `code-shared-11`): CivilCraft's LandXML writer looked every structure up in the pipe list and every pipe's
 * two ends up in the structure list (structures x pipes), and every profile point in the curve list. Now one index each.
 *   nice -n 10 node tools/civilcraft-test/bench-quadratic-011.mjs [--n 6000] [--pvi 20000]
 * One RESULT line per case (JSON): milliseconds, and a hash of the file text, so a run before and a run after can be compared for equal output.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/civilcraft/dev');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const N = +arg('--n', 6000), PVI = +arg('--pvi', 20000);
const I18N = await import(pathToFileURL(path.join(APP, 'i18n.js')));
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { writeLandXml } = await import(pathToFileURL(path.join(APP, 'landxml.js')));
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const out = (o) => console.log('RESULT ' + JSON.stringify({ ...o, load: os.loadavg()[0].toFixed(2) }));
const date = new Date(2026, 0, 1, 12, 0, 0);

// a chain of N structures and N-1 pipes (ids shuffled, so find() cannot stop early)
const structures = [], pipes = [];
for (let i = 0; i < N; i++) structures.push({ id: 's' + ((i * 7919) % N), name: 'MH-' + i, x: i * 10, y: (i % 7) * 3, dia: 4, rimShown: 100 + i % 5, sump: 90 });
const idAt = (i) => 's' + ((i * 7919) % N);
for (let i = 0; i < N - 1; i++) pipes.push({ id: 'p' + i, name: 'P-' + i, from: idAt(i), to: idAt(i + 1), invUp: 95 - i * 0.001, invDn: 95 - (i + 1) * 0.001, dia: 18 });
let t0 = performance.now();
const a = writeLandXml({ units: 'ft', networks: [{ name: 'Storm', type: 'storm', structures, pipes, types: [] }], date });
out({ case: 'pipe-network', structures: N, pipes: N - 1, ms: Math.round(performance.now() - t0), bytes: a.length, hash: hash(a) });

// a profile with PVI points and a true-circle curve at every fifth
const pvis = [], curves = [];
for (let i = 0; i < PVI; i++) { pvis.push({ sta: i * 20, z: 100 + (i % 9), L: i % 5 === 2 ? 40 : 0, R: i % 5 === 2 ? 800 : 0 }); if (i % 5 === 2) curves.push({ circ: true, i, R: 800, g1: 0.01, g2: -0.01 }); }
const al = { ok: true, length: PVI * 20, start: 0, elements: [{ type: 'line', sta: 0, len: PVI * 20, p0: { x: 0, y: 0 }, p1: { x: PVI * 20, y: 0 } }] };
t0 = performance.now();
const b = writeLandXml({ units: 'ft', alignments: [{ name: 'A', alignment: al, profile: { name: 'FG', profile: { pvis, curves } } }], date });
out({ case: 'profile-curves', pvis: PVI, curves: curves.length, ms: Math.round(performance.now() - t0), bytes: b.length, hash: hash(b) });
