#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-erection-showcase.mjs — the saved demo for the erection movie (0.8 round 2, EG.72, rule 37): the sample frame with one example
 * crane and its chart (made-up numbers, not a real crane's), as a DetailCraft file plus the movie file. Built ONCE; screenshots open them.
 *   node tools/detailcraft-test/make-erection-showcase.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Model } = await load('model.js'), { build } = await load('build.js'), Mk = await load('marks.js'), { sampleModel } = await load('sample.js'), E = await load('erection.js'), { erectionHtml } = await load('erection-html.js');
const out = path.join(ROOT, 'fixtures/showcase');
const m = new Model(sampleModel().state);
m.change('Example crane', (tx) => { tx.s.erection = E.cleanSetup({ cranes: [{ id: 'c1', name: 'Example crane (made-up chart)', at: [3000, -6000], hookHeight: 20000, chart: [{ radius: 6, kg: 8000 }, { radius: 10, kg: 5000 }, { radius: 14, kg: 3000 }, { radius: 20, kg: 1500 }] }] }); });
fs.writeFileSync(path.join(out, 'detailcraft-erection.detailcraft.json'), m.toJSON());
const b = build(m.state), pl = E.plan(m.state, b, Mk.markParts(b, {}), m.state.erection);
fs.writeFileSync(path.join(out, 'detailcraft-erection-movie.html'), erectionHtml({ title: m.state.name || 'Sample frame', data: E.movieData(pl, { title: m.state.name || 'Sample frame' }) }));
console.log(pl.picks.length + ' lifts, ' + Math.round(pl.summary.minutes) + ' minutes; over ' + pl.summary.over + ', high ' + pl.summary.high);
