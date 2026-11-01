#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/** check.mjs — judge a task's `check` list on a folder an assistant worked in (the manual live run, evals/live.md). */
import fs from 'node:fs';
import path from 'node:path';
import { factsOf, at, judge } from './checkers.mjs';
const [file, id, dir] = process.argv.slice(2);
if (!file || !id || !dir) { console.log('usage: check.mjs <evals/app.json> <task id> <folder>'); process.exit(2); }
const task = JSON.parse(fs.readFileSync(file, 'utf8')).find((t) => t.id === id);
if (!task) { console.log('no task ' + id); process.exit(2); }
let bad = 0;
for (const c of task.check) {
  const f = path.join(dir, c.file);
  if (!fs.existsSync(f)) { console.log('FAIL ' + c.file + ' was not written'); bad++; continue; }
  const v = c.path ? at(await factsOf(c.kind, f), c.path) : null;
  const okc = judge(v, c);
  if (!okc) bad++;
  console.log((okc ? 'ok   ' : 'FAIL ') + c.file + (c.path ? ' ' + c.path + ' = ' + JSON.stringify(v) : ''));
}
process.exit(bad ? 1 : 0);
