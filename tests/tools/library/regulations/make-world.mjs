#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-world.mjs — country regulation packs for LibraryCraft beyond the United States (0.8 REG.1; owner 2026-10-27: pull regulations "just in
 * time" for where the site's visitors are — bin/regs-demand.php ranks the places), made from the cited research in research/countries-*.json:
 * per country the regulation, its authority level, in-force date, official source and source date, confidence, and only the limits the
 * research could tie to a clause ({value|min,max, unit mm|pct, clause, note}). A limit the regulation does not set, or that could not be
 * confirmed, is left out — the pack's note says so.
 *
 *   node tools/library/regulations/make-world.mjs [--check]   writes world/<pack-id>.json (bin/library-import-regulations.php publishes them)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'world');
const CHECKED = '2026-10-27';
const check = process.argv.includes('--check');
const R = await import(path.join(HERE, '../../../public_html/assets/apps/bimcraft/dev/addons/regs/lib/regs.js'));
const LABEL = {
  'stair.riser.max': 'Riser height', 'stair.tread.min': 'Tread depth (going)', 'stair.width.min': 'Stair width', 'stair.headroom.min': 'Stair headroom',
  'stair.rail.height': 'Handrail height', 'room.ceiling.min': 'Ceiling height', 'room.light.min': 'Glazing, share of floor area',
  'room.vent.min': 'Openable area, share of floor area',
};
const cut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };
const firstDate = (s) => { const m = /\b(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?\b/.exec(String(s || '')); return m ? [m[1], m[2], m[3]].filter(Boolean).join('-') : ''; };
const rows = fs.readdirSync(path.join(HERE, 'research')).filter((f) => /^countries-.*\.json$/.test(f)).sort()
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(HERE, 'research', f), 'utf8')));

fs.mkdirSync(OUT, { recursive: true });
let bad = 0, changed = 0, n = 0;
for (const c of rows) {
  const rules = Object.entries(c.limits || {}).filter(([id]) => LABEL[id]).map(([id, l]) => {
    const base = { id, applies: id.startsWith('stair') ? 'stair' : 'room', unit: l.unit === 'pct' || l.unit === '%' ? 'pct' : 'mm', clause: cut(l.clause, 40), label: LABEL[id], note: cut(l.note || '', 300) };
    if (id === 'stair.rail.height') return { ...base, op: 'between', min: l.min, max: l.max };
    return { ...base, op: id.endsWith('.max') ? '<=' : '>=', value: l.value };
  });
  const missing = Object.keys(LABEL).filter((id) => !rules.some((r) => r.id === id)).map((id) => LABEL[id].toLowerCase());
  const pack = {
    format: 'cadcraft-regulation-pack', version: 1, id: c.id, name: cut(c.name + ': ' + c.regulation, 120),
    jurisdiction: { country: c.country, level: 'country', name: c.name }, base: null, edition: cut(c.regulation, 40),
    in_force: /^\d{4}-\d{2}-\d{2}$/.test(String(c.in_force || '')) ? c.in_force : null, authority: c.authority_level,
    review: { state: c.review || (c.confidence === 'low' ? 'unchecked' : 'draft'), note: cut((c.scope_note ? c.scope_note + ' ' : '') + (missing.length ? 'Not checked by this pack: ' + missing.join(', ') + '. ' : '') + 'Room size, hallway, egress door and escape-opening rules have not been researched for this country yet. Entered from the cited sources on ' + CHECKED + ' (research confidence: ' + c.confidence + '); not yet reviewed by a professional.', 400) },
    source: { name: cut(c.authority + ', ' + c.regulation, 120), url: c.source_url, date: firstDate(c.source_date), checked: CHECKED },
    rules,
  };
  const r = R.cleanPack(pack);
  if (!r.ok) { bad++; console.error('  ! ' + c.id + ': ' + r.errors.join('; ')); continue; }
  n++;
  const file = path.join(OUT, c.id + '.json'), text = JSON.stringify(r.pack, null, 2) + '\n';
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (old === text) continue;
  changed++;
  if (check) console.log('  ~ ' + c.id); else fs.writeFileSync(file, text);
}
console.log((check ? 'checked ' : 'wrote ') + n + ' country packs (' + changed + ' changed), ' + bad + ' refused');
process.exit(bad || (check && changed) ? 1 : 0);
