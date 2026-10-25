#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-cheat-sheet.mjs — the one-page cheat sheet (0.7 D7.06 b): help/cheat-sheet.md and cheat-sheet.pdf / cheat-sheet.es-MX.pdf in the
 * app's dev folder, all from cheatsheet.js (the 40 commands) and the language files (cheat.*). pdf-lib (MIT, assets/vendor/pdf-lib).
 *
 *   node tools/cadcraft-test/make-cheat-sheet.mjs [--check]     --check: write nothing, exit 1 when the help page is out of date
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/');
const CHECK = process.argv.includes('--check');
const { CHEAT, CHEAT_GROUPS, cheatKey } = await import(pathToFileURL(APP + 'cheatsheet.js').href);
const lang = (loc) => JSON.parse(fs.readFileSync(APP + 'lang/' + loc + '.json', 'utf8'));
const EN = lang('en');

/** The help page (English), from the list. */
export function helpPage() {
  const rows = (g) => CHEAT.filter((c) => c.group === g).map((c) => `| \`${c.alias}\` | {{cmd:${c.cmd}}} | ${EN[cheatKey(c.cmd)]} |`).join('\n');
  const body = CHEAT_GROUPS.map((g) => `## ${EN['cheat.group.' + g]}\n\n| ${EN['cheat.col.type']} | ${EN['cheat.col.cmd']} | ${EN['cheat.col.what']} |\n|---|---|---|\n${rows(g)}\n`).join('\n');
  return `---
title: Cheat sheet: the 40 everyday commands
summary: One page with the 40 commands you will use most, their short names, and the keys that save time. Download it as a PDF to print.
section: start
order: 12
keywords: cheat sheet, quick reference, commands, aliases, short names, beginner, erase, trim, print, pdf, shortcuts
---

${EN['cheat.how']}

**Print it:** [cheat-sheet.pdf](https://getcadcraft.com/assets/apps/cadcraft/current/cheat-sheet.pdf) (one A4 page; on Letter paper print it with "fit to page").

${body}
## Keys

${EN['cheat.keys']}

New to drafting? Type \`TOUR\` for a guided first drawing, read [Getting started](topic:getting-started), or see every command in [Commands](topic:commands). Coming from other drafting software: [Coming from other drafting software](topic:coming-from) and the [command map](topic:command-map).
`;
}

async function pdf(loc) {
  const { PDFDocument, StandardFonts, rgb } = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.min.js')).href);
  const L = { ...EN, ...(loc === 'en' ? {} : lang(loc)) };
  const doc = await PDFDocument.create();
  doc.setTitle(L['cheat.title']); doc.setCreator('CadCraft'); doc.setProducer('CadCraft (pdf-lib)');
  const page = doc.addPage([595.28, 841.89]);
  const F = await doc.embedFont(StandardFonts.Helvetica), B = await doc.embedFont(StandardFonts.HelveticaBold), M = await doc.embedFont(StandardFonts.CourierBold);
  const ink = rgb(0.1, 0.12, 0.18), blue = rgb(0.1, 0.25, 0.6), grey = rgb(0.4, 0.42, 0.48), line = rgb(0.8, 0.82, 0.86);
  const W = 595.28, margin = 34;
  const text = (s, x, y, f, size, color = ink) => page.drawText(String(s), { x, y, font: f, size, color });
  const wrap = (s, f, size, width) => { const out = []; let cur = ''; for (const w of String(s).split(' ')) { const t = cur ? cur + ' ' + w : w; if (f.widthOfTextAtSize(t, size) > width && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; };
  text(L['cheat.title'], margin, 800, B, 17, blue);
  wrap(L['cheat.how'], F, 8.6, W - 2 * margin).forEach((ln, i) => text(ln, margin, 782 - i * 11, F, 8.6, grey));
  const colW = (W - 2 * margin - 18) / 2, xs = [margin, margin + colW + 18];
  const order = [['draw', 'dim', 'blocks', 'file'], ['modify', 'view']];   // two columns of groups
  const ys = [748, 748];
  const rowH = 13.2;
  order.forEach((groups, ci) => {
    for (const g of groups) {
      let y = ys[ci];
      page.drawRectangle({ x: xs[ci], y: y - 3.5, width: colW, height: 14, color: rgb(0.93, 0.95, 0.99) });
      text(L['cheat.group.' + g], xs[ci] + 4, y, B, 9.6, blue);
      y -= 15;
      for (const c of CHEAT.filter((x) => x.group === g)) {
        text(c.alias, xs[ci] + 4, y, M, 8.6);
        text(c.cmd, xs[ci] + 44, y, B, 7.8, grey);
        const desc = wrap(L[cheatKey(c.cmd)], F, 7.9, colW - 128);
        desc.forEach((ln, k) => text(ln, xs[ci] + 112, y - k * 9, F, 7.9));
        y -= Math.max(rowH, 9 * desc.length + 4);
        page.drawLine({ start: { x: xs[ci], y: y + 8.4 }, end: { x: xs[ci] + colW, y: y + 8.4 }, thickness: 0.4, color: line });
      }
      ys[ci] = y - 10;
    }
  });
  const base = Math.min(...ys) - 6;
  wrap(L['cheat.keys'], F, 8.2, W - 2 * margin).forEach((ln, i) => text(ln, margin, base - i * 10.5, F, 8.2));
  wrap(L['cheat.more'], F, 8, W - 2 * margin).forEach((ln, i) => text(ln, margin, 40 - i * 10, F, 8, grey));
  return doc.save();
}

const help = helpPage();
const helpPath = APP + 'help/cheat-sheet.md';
if (CHECK) {
  const have = fs.existsSync(helpPath) ? fs.readFileSync(helpPath, 'utf8') : '';
  if (have !== help) { console.log('help/cheat-sheet.md is out of date: run node tools/cadcraft-test/make-cheat-sheet.mjs'); process.exit(1); }
  console.log('help/cheat-sheet.md is up to date');
} else {
  fs.writeFileSync(helpPath, help);
  for (const [loc, name] of [['en', 'cheat-sheet.pdf'], ['es-MX', 'cheat-sheet.es-MX.pdf']]) {
    const bytes = await pdf(loc);
    fs.writeFileSync(APP + name, bytes);
    console.log('wrote', name, bytes.length, 'bytes');
  }
  console.log('wrote help/cheat-sheet.md');
}
