#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-za-metro.mjs — the South African metro by-law proof pack (0.8 REG.1, ZA standards decision 4): a city pack on SANS 10400, made from
 * the cited research in research/za-metro.json (an agent's findings, never typed by hand). A pack carries only the limits the research
 * tied to a by-law clause; the City of Cape Town Municipal Planning By-law 2015 is a zoning instrument and sets none of the room, stair, light or
 * ventilation limits the checker knows, so the pack has no rules of its own: it proves the chain (country → city) and the provenance, and
 * says what the by-law regulates instead. (Like the Phoenix pack: a city that changes none of the checked rules.)
 *
 *   node tools/library/regulations/make-za-metro.mjs [--check]   writes world/<pack-id>.json (bin/library-import-regulations.php publishes it)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const check = process.argv.includes('--check');
const R = await import(path.join(HERE, '../../../public_html/assets/apps/bimcraft/dev/addons/regs/lib/regs.js'));
const r = JSON.parse(fs.readFileSync(path.join(HERE, 'research/za-metro.json'), 'utf8'));
const web = r.by_laws.find((b) => /^https:\/\/openbylaws\.org\.za\//.test(b.url)) || r.by_laws[0];
const cut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };
const limits = Array.isArray(r.limits) ? r.limits : [];
const pack = {
  format: 'cadcraft-regulation-pack', version: 1, id: r.id_suggestion, name: cut(r.municipality + ': Municipal Planning By-law 2015 (on SANS 10400)', 120),
  jurisdiction: { country: 'ZA', level: 'city', region: r.province, name: r.municipality }, base: 'za-sans10400',
  edition: 'Municipal Planning By-law 2015', in_force: r.by_laws[0].in_force,
  review: { state: 'unchecked', note: cut('Read from the by-law text on ' + r.checked + ' (consolidation as at 2020-02-03; the 2022 and 2025 amendments were not read). It is a zoning and land-use by-law: it sets no room, stair, light or ventilation limit the checker knows, so this pack changes none of SANS 10400\'s rules and carries none of its own. Room, stair and ventilation rules stay those of SANS 10400, which is itself not confirmed.', 400) },
  authority: 'adopted-law',
  source: { name: cut(web.authority_body + ', Municipal Planning By-law, 2015', 120), url: web.url, date: '2020-02-03', checked: r.checked },
  rules: limits.map((l) => ({ id: l.rule, applies: R.RULES[l.rule]?.applies, op: l.op, ...(l.op === 'between' ? { min: l.min, max: l.max } : { value: l.value }), unit: l.unit, clause: l.clause, label: l.rule, note: cut(l.note, 300) })),
};
const c = R.cleanPack(pack);
if (!c.ok) { console.error('  ! ' + pack.id + ': ' + c.errors.join('; ')); process.exit(1); }
const file = path.join(HERE, 'world', pack.id + '.json'), text = JSON.stringify(c.pack, null, 2) + '\n';
const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
if (old !== text) { if (check) { console.log('  ~ ' + pack.id + (old ? ' differs' : ' missing')); process.exit(1); } fs.writeFileSync(file, text); }
console.log((check ? 'checked ' : 'wrote ') + pack.id + ' (' + c.pack.rules.length + ' rules)');
