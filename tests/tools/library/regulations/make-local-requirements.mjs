#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-local-requirements.mjs — the optional local-requirement sections of regulation packs (booklet rows BK.67, BK.156, BK.157, session
 * bk-r3-regs): approval process, submission format, drawing conventions and standard notes, from research/local-requirements.json
 * ({ <pack id>: { meta?, process?, submission?, conventions?, notes? } }; the facts were read from the cited pages, never typed from memory;
 * a pack with `meta` is created (no rules), any other is an existing pack file that gets the sections). Every pack goes through the add-on's
 * own cleanPack, so a section that does not pass is refused here, before the Library sees it. Bundled packs are listed in
 * addons/regs/packs/index.json; Library-only packs (tools/library/regulations/world) are updated in place.
 *
 *   node tools/library/regulations/make-local-requirements.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const check = process.argv.includes('--check');
const BUNDLED = path.join(HERE, '../../../public_html/assets/apps/bimcraft/dev/addons/regs/packs');
const R = await import(path.join(BUNDLED, '../lib/regs.js'));
const { SECTION_KEYS } = await import(path.join(BUNDLED, '../lib/sections.js'));
R.setReleaseCheck((await import(path.join(BUNDLED, '../../../packver.js'))).validatePackVersion);   // BK.153/154: the shared version + changelog rule
const research = JSON.parse(fs.readFileSync(path.join(HERE, 'research/local-requirements.json'), 'utf8'));
const WORLD = path.join(HERE, 'world');
const index = JSON.parse(fs.readFileSync(path.join(BUNDLED, 'index.json'), 'utf8'));
let bad = 0;
for (const [id, r] of Object.entries(research)) {
  const files = [path.join(BUNDLED, id + '.json'), path.join(WORLD, id + '.json')];
  const file = files.find((f) => fs.existsSync(f)) || (r.meta ? files[0] : null);
  if (!file) { console.error('  ! ' + id + ': no pack file and no meta'); bad++; continue; }
  const have = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { format: R.FORMAT, version: R.FORMAT_VERSION, id, base: null, rules: [], ...r.meta };
  const raw = { ...have, ...Object.fromEntries([...SECTION_KEYS, 'release'].filter((k) => r[k]).map((k) => [k, r[k]])) };
  const c = R.cleanPack(raw);
  if (!c.ok) { console.error('  ! ' + id + ': ' + c.errors.join('; ')); bad++; continue; }
  const text = JSON.stringify(c.pack, null, 2) + '\n', old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (old !== text) { if (check) { console.log('  ~ ' + id + (old ? ' differs' : ' missing')); bad++; } else fs.writeFileSync(file, text); }
  if (file.startsWith(BUNDLED) && !index.packs.includes(id)) { if (check) { console.log('  ~ index.json lacks ' + id); bad++; } else index.packs.push(id); }
  console.log((check ? 'checked ' : 'wrote ') + id);
}
if (!check) fs.writeFileSync(path.join(BUNDLED, 'index.json'), JSON.stringify(index, null, 2) + '\n');
process.exit(bad ? 1 : 0);
