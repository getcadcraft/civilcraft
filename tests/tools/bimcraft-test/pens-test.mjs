/* SPDX-License-Identifier: Apache-2.0 */
/** pens-test.mjs — pen overrides per view (0.8 SU.1055, session bim-08):  node bin/test-bimcraft.mjs --pens */
import path from 'node:path';

export async function pensMode({ APP }) {
  let bad = 0;
  const ok = (c, m, d = '') => { if (!c) bad++; console.log((c ? '  ok   ' : '  FAIL ') + m + (!c && d ? ' (' + d + ')' : '')); };
  const P = await import(path.join(APP, 'pens.js'));
  const o = (by, value, extra = {}) => P.cleanOverride({ id: by + value, scope: { by, value }, weight: 2.5, dash: 'solid', color: '', ...extra });
  const wall = { kind: 'wall', typeKey: 'ext-2x6', guid: 'G1' };
  ok(P.penFor([], wall) === null, 'no overrides: no pen');
  ok(P.penFor([o('category', 'wall')], wall)?.w === 2.5, 'a category reaches its walls');
  ok(P.penFor([o('category', 'door')], wall) === null, '…and not other categories');
  ok(P.penFor([o('category', 'wall', { weight: 1 }), o('type', 'ext-2x6', { weight: 4 })], wall).w === 4, 'a type beats the category');
  ok(P.penFor([o('type', 'ext-2x6', { weight: 4 }), o('element', 'G1', { weight: 6 })], wall).w === 6, 'an element beats the type');
  ok(P.penFor([o('element', 'G1', { weight: 6 }), o('category', 'wall', { weight: 1 })], wall).w === 6, 'order of the list does not matter');
  ok(P.penFor([o('element', 'G1', { dash: 'dash', color: '--layer-red', weight: 0 })], wall).dash === 'dash', 'dash and colour without a weight');
  ok(P.cleanOverride({ scope: { by: 'category', value: 'roof' }, weight: 2 }) === null, 'an unknown category is dropped');
  ok(P.cleanOverride({ scope: { by: 'bogus', value: 'x' }, weight: 2 }) === null, 'an unknown scope is dropped');
  ok(P.cleanOverride({ scope: { by: 'category', value: 'wall' }, weight: 99 }).weight === 8, 'weight is clamped to 8');
  ok(P.cleanOverride({ scope: { by: 'category', value: 'wall' }, weight: 2, color: 'javascript:1' }).color === '', 'an unknown colour is dropped');
  ok(P.cleanOverride({ scope: { by: 'category', value: 'wall' } }) === null, 'an override that changes nothing is dropped');
  // on the printed plan (model-pdf.js): the wall's override outline and a door's weight and colour reach the PDF
  const PDF = await import(path.join(APP, 'model-pdf.js'));
  const text = (sc) => new TextDecoder('latin1').decode(PDF.planPdf(sc, { title: 'Pens', units: 'mm', paper: 'a4' }).bytes);
  const poly = [[0, 0], [4000, 0], [4000, 200], [0, 200]];
  const plain = text({ walls: [{ key: 'w1', poly, pieces: [poly] }], symbols: [], cut: [], below: [] });
  const penned = text({ walls: [{ key: 'w1', poly, pieces: [poly], pen: { w: 4, dash: 'dash', color: '--layer-red' } }], symbols: [], cut: [], below: [] });
  ok(!plain.includes('0.702 0.071 0.18 RG') && penned.includes('0.702 0.071 0.18 RG'), 'the PDF draws a wall\'s override outline in its colour (and not without one)');
  const mm = PDF.penMm(4);
  ok(Math.abs(mm - 4 * 0.5 / 1.75) < 1e-9 && PDF.penMm(0.01) === 0.1 && PDF.penMm(100) === 2 && PDF.penMm(1.75) === 0.5, 'a pen\'s screen weight on paper: the default 1.75 px is 0.5 mm, clamped to 0.1–2 mm');
  ok(/\[[0-9. ]+\] 0 d\n?[^]*0\.702 0\.071 0\.18 RG/.test(penned) || penned.split('\n').some((l) => /^\S+ w 0 G \[/.test(l)), 'a dashed pen prints as a dash pattern');
  const dsym = { lines: [[0, 0, 900, 0]], lw: 6, color: '--layer-blue' };
  const sym = text({ walls: [], symbols: [dsym], cut: [], below: [] });
  const sym0 = text({ walls: [], symbols: [{ lines: [[0, 0, 900, 0]] }], cut: [], below: [] });
  ok(sym.includes('0.118 0.282 0.784 RG') && !sym0.includes('0.118 0.282 0.784 RG') && sym.includes('0 G'), 'a door or window keeps its pen weight and colour on paper; the next one is black again');
  console.log(bad ? `\n${bad} failed` : '\nall ok');
  return bad ? 1 : 0;
}
