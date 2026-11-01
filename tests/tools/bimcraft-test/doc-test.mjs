/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Documents from the model (0.8 SU.889, session sx-tags) — called by tags-test.mjs (`node bin/test-bimcraft.mjs --sx-tags`) with its drawn
 * model: the template language on known answers, Markdown → blocks, the built-in trade templates, PDF (read back by pdftotext when
 * installed) and DOCX (unzipped with bcf.js, document.xml parsed). Temp files go to the repo's tmp/ and are removed.
 */
export async function docChecks({ APP, ROOT, WebIFC, IfcModel, quiet, ed, wallGuids, door, win, ok, spawnSync, fs, path }) {
  const T = await import(path.join(APP, 'tags.js'));
  const D = await import(path.join(APP, 'doc-template.js'));
  const { docPdf } = await import(path.join(APP, 'doc-pdf.js'));
  const { docDocx } = await import(path.join(APP, 'doc-docx.js'));
  const { TEMPLATES, missingTags } = await import(path.join(APP, 'doc-templates.js'));
  const { unzip, parseXml } = await import(path.join(APP, 'bcf.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { propertyIndex } = await import(path.join(APP, 'ifc-props.js'));
  const W = () => new ModelWriter(ed.W, ed.api, ed.mid);

  console.log('== Markdown → blocks');
  const md = D.parseMarkdown('# Title\n\nSome **bold** and *it* and `code` and \\*not\\*.\nSecond line.\n\n- one\n- two\n\n1. a\n2. b\n\n| A | B |\n|---|---:|\n| x \\| y | 2 |\n\n---\n> quoted');
  ok(md.map((b) => b.t).join() === 'h,p,ul,ol,table,hr,quote', 'blocks: heading, paragraph, bullets, numbers, table, rule, quote');
  ok(md[1].runs.some((r) => r.b && r.s === 'bold') && md[1].runs.some((r) => r.i && r.s === 'it') && md[1].runs.some((r) => r.code) && D.plainText(md[1].runs).includes('*not*. Second line.'), 'inline bold / italic / code, escapes, lines joined');
  ok(md[4].align.join() === 'l,r' && D.plainText(md[4].rows[0][0]) === 'x | y', 'table alignment and an escaped pipe in a cell');

  console.log('== The template tags on the model (SU.915 definitions)');
  const have = T.readProjectDefs(W());
  const add = [...missingTags(TEMPLATES[0], have), ...missingTags(TEMPLATES[1], [...have, ...missingTags(TEMPLATES[0], have)])];
  ok(add.map((d) => d.name).join() === 'Door finish,Fire rating,Hardware set,Wall finish,Lining', 'missing template tags: ' + add.map((d) => d.name).join());
  ed.modelChange(T.saveDefsOp([...have, ...add]), { label: 'Tags' });
  const ext = wallGuids.slice(0, 4), part = wallGuids[4];
  ed.modelChange(T.tagOp(ext, { 'Wall finish': 'Paint', Lining: '12.5 mm board', 'Fire rating': 30 }));
  ed.modelChange(T.tagOp([door.guid], { 'Door finish': 'Oak veneer', 'Fire rating': 30, 'Hardware set': 'HW-1' }));
  ok(true, 'tagged: four outside walls Paint / 12.5 mm board / 30, the door Oak veneer / 30 / HW-1, the partition nothing');

  // the app rebuilds the model after an edit; here the saved IFC is reopened to get the loaded model the index reads
  const bytes = ed.save();
  const e2 = await quiet(IfcModel.create)(WebIFC, null);
  const m2 = await quiet((x) => e2.load(x))(bytes);
  const ed2 = new IfcEditor(WebIFC, e2);
  const w2 = new ModelWriter(ed2.W, ed2.api, ed2.mid);
  const ix = propertyIndex(WebIFC, ed2.api, ed2.mid, m2);
  const defs = T.readProjectDefs(w2);
  const units = D.projectUnits(ed2.api, ed2.mid);
  ok(units.area === 'm²' && units.volume === 'm³' && /^(mm|m)$/.test(units.length), 'units from IfcUnitAssignment: ' + JSON.stringify(units));
  const src = D.docSource({ ixs: [ix], defs, units, unitMm: w2.unitMm, project: { name: 'Tags house', description: 'Test' }, file: 't.ifc', date: '2026-10-27' });
  const r = (t) => D.render(t, src);
  const wallIds = ix.ids.filter((id) => /^IfcWall/.test(ix.value('cls', id)));
  const nsa = (id) => ix.value('p:Qto_WallBaseQuantities.NetSideArea', id);
  const sumNsa = wallIds.reduce((s, id) => s + nsa(id), 0);
  ok(wallIds.length === 5 && wallIds.every((id) => typeof nsa(id) === 'number'), 'five walls in the index, each with Qto_WallBaseQuantities.NetSideArea');

  console.log('== Fields');
  ok(r('{{project}} / {{project description}} / {{file}} / {{date}}').markdown.trim() === 'Tags house / Test / t.ifc / 2026-10-27', 'project, description, file, date');
  ok(r('{{count IfcWall}} {{count IfcDoor}} {{count IfcWindow}} {{count *}}').markdown.trim() === '5 1 1 7', 'counts: 5 walls, 1 door, 1 window, 7 in all');
  ok(r('{{count IfcWall where Wall finish = paint}}|{{count IfcWall where Wall finish hasnot}}|{{count IfcDoor|IfcWindow}}').markdown.trim() === '4|1|2', 'where on a tag (case-blind), hasnot, two classes');
  const s1 = r('{{sum IfcWall NetSideArea}}').markdown.trim();
  ok(s1 === sumNsa.toFixed(2) + ' m²', 'sum of NetSideArea with its unit: ' + s1 + ' (index says ' + sumNsa.toFixed(2) + ')');
  console.log('== Calculations');
  const c1 = r('{{calc [sum IfcWall NetSideArea] * 1.1 round 2 unit m²}}').markdown.trim();
  ok(c1 === (sumNsa * 1.1).toFixed(2) + ' m²', 'calc: a sum times 1.1, rounded, with a unit: ' + c1);
  ok(r('{{calc ([count IfcWall] + [count IfcDoor]) * 2 - 1}}').markdown.trim() === '11.00', 'calc: counts, parentheses and precedence ((5 + 1) * 2 - 1 = 11)');
  ok(r('{{calc [sum IfcWall NetSideArea] / [count IfcWall] round 3}}').markdown.trim() === (sumNsa / 5).toFixed(3), 'calc: the mean wall area (a sum over a count)');
  ok(r('{{calc [count IfcWall where Wall finish = paint] / [count IfcWall] * 100 round 0 unit %}}').markdown.trim() === '80 %', 'calc: a share with where inside a term (4 of 5 walls = 80 %)');
  ok(r('{{#each IfcWall}}{{calc [qty NetSideArea] * 2 round 1}};{{/each}}').markdown.split(';').filter((x) => x.trim()).length === 5, 'calc inside an each reads the element\'s own quantity');
  const cb = r('{{calc 1 / 0}} {{calc [count IfcWall] +}} {{calc [sum IfcWall Nothing]}} {{calc 2 ** 3}} {{calc system(1)}}');
  ok((cb.markdown.match(/\[\?/g) || []).length >= 5 && cb.warnings.length >= 3, 'calc: division by zero, a missing operand, an unknown quantity, ** and a function call all print [?…] and warn, never evaluate', cb.markdown);
  const q = r('{{qty IfcWall NetSideArea by Type}}');
  const tb = q.blocks.find((b) => b.t === 'table');
  ok(tb && tb.rows.length === 3 && D.plainText(tb.head[2]) === 'NetSideArea (m²)', 'qty by Type: a table, two types + a total row, the unit in the header');
  const byType = new Map();
  for (const id of wallIds) { const k = ix.value('type', id); byType.set(k, (byType.get(k) || 0) + nsa(id)); }
  ok(tb && tb.rows.slice(0, 2).every((row) => Number(D.plainText(row[2])) === Number(byType.get(D.plainText(row[0])).toFixed(2))) && D.plainText(tb.rows[2][2]) === sumNsa.toFixed(2) && D.plainText(tb.rows[2][1]) === '5', 'each type\'s total = the index\'s sum for that type; total row 5 walls, ' + sumNsa.toFixed(2));
  const byFin = r('{{qty IfcWall NetSideArea by tag:Wall finish}}').blocks.find((b) => b.t === 'table');
  ok(byFin && D.plainText(byFin.rows[0][0]) === 'Paint' && D.plainText(byFin.rows[0][1]) === '4' && D.plainText(byFin.rows[1][0]) === '—' && D.plainText(byFin.rows[1][1]) === '1', 'qty grouped by a tag: Paint 4 walls, no finish 1');
  ok(r('{{tag Wall finish}} / {{tag Fire rating}}').markdown.trim() === 'Paint / 30', 'tag outside a loop: the distinct values');
  const each = r('{{#each IfcDoor}}{{n}}. {{name}}: {{tag Door finish}}, {{tag Hardware set}}, {{qty Width}}{{/each}}').markdown.trim();
  ok(/^1\. .+: Oak veneer, HW-1, \d+(\.\d+)? (mm|m)$/.test(each), 'each door: n, name, tags, its own Width with unit — "' + each + '"');
  const none = r('{{#each IfcWindow where Fire rating > 0}}x{{else}}none{{/each}}').markdown.trim();
  ok(none === 'none', 'else when nothing matches (the window has no fire rating)');
  const grp = r('{{#group IfcWall by Type}}[{{value}}: {{count}}, {{tag Wall finish}}]{{/group}}').markdown.trim();
  ok(/^\[.+: \d, (Paint|—)\]\[.+: \d, (Paint|—)\]$/.test(grp) && (grp.match(/Paint/g) || []).length === 1, 'groups by Type with count and the group\'s tag values — ' + grp);
  const nested = r('{{#group IfcWall by Wall finish}}<{{value}}:{{#each}}#{{/each}}>{{/group}}').markdown.trim();
  ok(nested === '<Paint:####><—:#>', 'each inside a group runs over the group\'s elements; no value last, shown as —: ' + nested);
  const tbl = r('{{table IfcDoor|IfcWindow cols Name, Class, Width, tag:Fire rating}}').blocks.find((b) => b.t === 'table');
  ok(tbl && tbl.rows.length === 2 && tbl.align[2] === 'r' && /\((mm|m)\)$/.test(D.plainText(tbl.head[2])) && tbl.rows.some((row) => D.plainText(row[3]) === '30'), 'table: two rows, a length column right-aligned with its unit, the door\'s fire rating');
  const dw = ix.ids.find((id) => ix.value('cls', id) === 'IfcDoor');
  ok(tbl && tbl.rows.every((row) => /^\d/.test(D.plainText(row[2]))) && ix.value('p:Qto_WallBaseQuantities.Width', wallIds[0]) !== undefined
    && tbl.rows.some((row) => Number(D.plainText(row[2])) === ix.value('p:Qto_DoorBaseQuantities.Width', dw)), 'a bare name (Width) reads each element\'s own set: the door\'s and the window\'s quantity sets, never the walls\' (Qto_WallBaseQuantities.Width is the wall thickness)');
  ok(r('{{#each IfcWall where Wall finish hasnot}}[{{tag Wall finish}}]{{/each}}').markdown.trim() === '[—]', 'an empty tag prints —');
  const tags = r('{{tags}}').blocks.find((b) => b.t === 'table');
  ok(tags && tags.rows.length === defs.length, 'tags: the definitions as a table (' + defs.length + ')');

  console.log('== Warnings, escapes, limits');
  const bad = r('{{tag Nope}} {{frobnicate}} {{sum IfcWall Nothing}} {{#each IfcWall}}x \\{{literal}}');
  ok(bad.markdown.includes('[?tag Nope]') && bad.markdown.includes('{{literal}}'), 'a field that cannot be read prints [?…]; \\{{ prints {{');
  ok(['sx.su889.warn.tag', 'sx.su889.warn.unknown', 'sx.su889.warn.field', 'sx.su889.warn.unclosed'].every((k) => bad.warnings.some((x) => x.key === k)), 'warnings: undefined tag, unknown field, unknown quantity, unclosed each');
  ok(D.esc('a*b|c_d#') === 'a\\*b\\|c\\_d\\#' && D.parseMarkdown(D.esc('**x** | y')).length === 1 && D.plainText(D.parseMarkdown(D.esc('**x** | y'))[0].runs) === '**x** | y', 'model text is escaped: it never becomes Markdown');

  console.log('== The trade templates');
  const out = [];
  for (const tpl of TEMPLATES) {
    const res = r(tpl.text);
    out.push({ tpl, res });
    ok(res.warnings.length === 0, tpl.id + ': renders with no warnings' + (res.warnings.length ? ' — ' + JSON.stringify(res.warnings) : ''));
  }
  const doors = out[0].res, walls = out[1].res;
  ok(doors.markdown.includes('The project has 1 doors.') && doors.markdown.includes('HW-1') && /1\. .+ on .+: 30 minutes, Oak veneer\./.test(doors.markdown), 'doors: count, hardware set, the fire-rated door listed');
  ok(walls.markdown.includes('### ') && walls.markdown.includes('- Lining: 12.5 mm board') && /Walls with no finish tagged\n\n- .+\(/.test(walls.markdown), 'walls: a section per type, lining tag, the untagged partition listed');

  console.log('== PDF');
  const tmp = path.join(ROOT, 'tmp', 'sx-tags-test');
  fs.mkdirSync(tmp, { recursive: true });
  try {
    const big = D.parseMarkdown(walls.markdown + '\n\n' + Array.from({ length: 80 }, (_, i) => '| Row ' + i + ' | ' + 'word '.repeat(i % 9 + 1) + '| ' + i + ' |').reduce((s, l, i) => s + (i === 0 ? '| A | B | C |\n|---|---|---:|\n' : '') + l + '\n', '') + '\n\nCafé — “quotes” ≤ 5 ✓');
    const p = docPdf(big, { title: 'Walls', footer: 'Tags house', page: (n, of) => 'Page ' + n + ' of ' + of });
    const head = new TextDecoder().decode(p.bytes.slice(0, 8));
    ok(head === '%PDF-1.4' && p.pages >= 2, 'a PDF of ' + p.pages + ' pages (the long table carries over)');
    ok(p.missing === 1, 'one character outside Windows-1252 (✓) counted as missing; é, — and quotes kept (' + p.missing + ')');
    const file = path.join(tmp, 'walls.pdf');
    fs.writeFileSync(file, p.bytes);
    const info = spawnSync('pdfinfo', [file], { encoding: 'utf8' });
    if (info.status === 0 || info.stdout) {
      ok(new RegExp('Pages:\\s+' + p.pages).test(info.stdout) && /Title:\s+Walls/.test(info.stdout), 'pdfinfo reads it: ' + p.pages + ' pages, title Walls');
      const txt = spawnSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' }).stdout || '';
      ok(txt.includes('Walls, linings and finishes') && txt.includes('Lining: 12.5 mm board') && txt.includes('Page 1 of ' + p.pages) && txt.includes('Café — “quotes” <= 5 ?'), 'pdftotext finds the heading, a list line, the footer and the accented text');
      ok((txt.match(/\bA\s+B\s+C\b/g) || []).length >= 2, 'the table header is repeated on the next page');
    } else console.log('  skip  poppler not installed: PDF not read back');
    const dpdf = docPdf(doors.blocks, { title: 'Doors', paper: 'letter' });
    ok(new TextDecoder().decode(dpdf.bytes.slice(-6)).includes('%%EOF') && dpdf.pages >= 1, 'the doors template as a Letter PDF');

    console.log('== DOCX');
    const dx = docDocx(walls.blocks, { title: 'Walls & finishes', created: new Date('2026-10-27T12:00:00Z') });
    const files = await unzip(dx);
    ok(['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/styles.xml', 'word/_rels/document.xml.rels', 'docProps/core.xml'].every((n) => files.has(n)), 'the six parts are in the zip');
    const docXml = new TextDecoder().decode(files.get('word/document.xml'));
    let parsed = null;
    try { parsed = parseXml(docXml); } catch (e) { parsed = null; }
    ok(!!parsed, 'document.xml is well-formed XML (bcf.js parseXml)');
    ok(docXml.includes('<w:pStyle w:val="Heading1"/>') && docXml.includes('Walls, linings and finishes') && docXml.includes('<w:tbl>') && docXml.includes('<w:tblHeader/>'), 'Heading1, the title text, tables with a repeated header row');
    ok(new TextDecoder().decode(files.get('docProps/core.xml')).includes('<dc:title>Walls &amp; finishes</dc:title>'), 'the title escaped in core.xml');
    for (const [n, b] of files) if (n.endsWith('.xml') || n.endsWith('.rels')) { try { parseXml(new TextDecoder().decode(b)); } catch (e) { ok(false, n + ' is not well-formed: ' + e.message); } }
    fs.writeFileSync(path.join(tmp, 'walls.docx'), dx);
    const py = spawnSync('python3', ['-I', '-c', 'import sys,zipfile;z=zipfile.ZipFile(sys.argv[1]);print(z.testzip() is None)', path.join(tmp, 'walls.docx')], { encoding: 'utf8' });
    if (py.status === 0) ok(py.stdout.trim() === 'True', 'python zipfile checks every entry\'s CRC');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return true;
}
