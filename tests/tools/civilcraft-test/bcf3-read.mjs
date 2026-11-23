#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bcf3-read.mjs — civil-11, CV.4: CivilCraft's BCF reader (civilcraft/dev/navis/bcf.js, via issues.js fromTopics) on the REAL BCF 3.0 files of buildingSMART's
 * BCF-XML test cases (/var/www/CADCRAFT/testfiles/bcf3/, source in its README; the files are CC BY-ND, so they stay outside the repository), and our own
 * export opened again by the same reader. Prints one line per file: topics, titles, status, comments, camera, selection; then exits 1 on any unreadable file.
 *   node tools/civilcraft-test/bcf3-read.mjs [--dir path]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const DIR = arg('--dir') || '/var/www/CADCRAFT/testfiles/bcf3';
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { readBcf, writeBcf } = await import(pathToFileURL(path.join(APP, 'navis/bcf.js')).href);
const I = await import(pathToFileURL(path.join(APP, 'issues.js')).href);
let bad = 0;
// comments WITH text in each file, counted from the XML by hand (grep '<Comment>' in markup.bcf, 2026-11-20); the others hold comments that only point at a viewpoint
const COMMENTS_WITH_TEXT = { 'labels.bcf': 1, 'document-reference-internal.bcf': 1, 'related-topics-with-both-topics-in-the-same-file.bcf': 1 };
const say = (...a) => console.log(...a);
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.bcf')).sort()) {
  try {
    const r = await readBcf(new Uint8Array(fs.readFileSync(path.join(DIR, f))));
    const cams = r.topics.flatMap((t) => t.viewpoints.map((v) => v.camera?.kind || 'none'));
    const sel = r.topics.reduce((n, t) => n + t.viewpoints.reduce((m, v) => m + v.selection.length, 0), 0);
    const iss = I.fromTopics(r.topics, { units: 'm', nextId: (() => { let n = 0; return () => 'i' + ++n; })() });
    say(`${f.padEnd(58)} topics ${r.topics.length}  issues ${iss.issues?.length ?? iss.length ?? '?'}  comments ${r.topics.reduce((n, t) => n + t.comments.length, 0)}  cameras [${[...new Set(cams)].join(',')}]  selected ${sel}  notes [${r.notes.join(' ')}]  status [${[...new Set(r.topics.map((t) => t.status))].join('|')}]`);
    if (!r.topics.length) { bad++; say('   NO TOPICS'); }
    const nc = r.topics.reduce((n, t) => n + t.comments.length, 0);
    if (nc !== (COMMENTS_WITH_TEXT[f] || 0)) { bad++; say(`   FAIL comments: read ${nc}, the file has ${COMMENTS_WITH_TEXT[f] || 0} (BCF 3.0 puts <Comments> inside <Topic>; lib/navis/bcf.js reads them beside it, as 2.1 has them)`); }
  } catch (e) { bad++; say(`${f.padEnd(58)} FAILED ${e.message}`); }
}
// ours opened again
const mine = I.makeIssue({ id: 'i1', title: 'Pothole', description: 'Edge drop at the start', author: 'a@b.c', pin: I.pinAt(10, 20), status: 'open' });
const out = writeBcf({ topics: I.toTopics([mine], { units: 'm' }), file: 'site.civilcraft.json' });
const back = await readBcf(out instanceof Uint8Array ? out : new Uint8Array(out));
const again = I.fromTopics(back.topics, { units: 'm', nextId: () => 'i9' });
const rows = again.issues ?? again;
say(`our export read again: ${back.topics.length} topic, title "${back.topics[0]?.title}", ${rows.length ? 'issue kept' : 'no issue'}`);
if (back.topics.length !== 1 || back.topics[0].title !== 'Pothole') bad++;
process.exit(bad ? 1 : 0);
