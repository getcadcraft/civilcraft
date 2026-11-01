// SPDX-License-Identifier: Apache-2.0
// Writes the Library items (kind template) for BimCraft's example trade templates (0.8 SU.889): node tools/library/templates/make.mjs [--check]
// The template text stays in public_html/assets/apps/bimcraft/dev/doc-templates.js; this makes tools/library/templates/<id>.template.json from it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const dev = path.resolve(here, '../../../public_html/assets/apps/bimcraft/dev');
const { TEMPLATES } = await import(path.join(dev, 'doc-templates.js'));
const lang = JSON.parse(fs.readFileSync(path.join(dev, 'lang/en.json'), 'utf8'));
const check = process.argv.includes('--check');
let bad = 0;
for (const t of TEMPLATES) {
  const name = lang[t.name], trade = lang[t.trade];
  const out = {
    name: 'Specification: ' + name,
    description: 'A specification for ' + trade + ', filled from the open IFC model: quantities by type, tag values and schedules. Edit the text, then save the document as PDF or Word. Reads the model’s tags (the definitions are listed with the template).',
    template: { format: 'cadcraft-doc-template', version: 1, key: 'spec-' + t.id, trade, title: name,
      tags: t.tags.map((d) => ({ name: d.name, kind: d.kind, values: d.values, classes: d.classes, ...(d.note ? { note: d.note } : {}) })), text: t.text },
  };
  const file = path.join(here, t.id + '.template.json');
  const json = JSON.stringify(out, null, 2) + '\n';
  if (check) { if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== json) { console.log('differs: ' + file); bad++; } }
  else fs.writeFileSync(file, json);
}
process.exit(bad ? 1 : 0);
