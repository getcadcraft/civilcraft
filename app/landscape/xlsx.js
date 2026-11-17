/* SPDX-License-Identifier: Apache-2.0 */
/**
 * xlsx.js — CivilCraft's door to the one workbook writer (../tables/xlsx.js; canonical lib/tables/xlsx.js, synced by
 * `node tools/tables/sync.mjs civilcraft`). Until 0.10 this file was its own copy of TakeoffCraft's writer; the copy is gone and
 * the exports and their behaviour are the ones it always had.
 *
 *   const bytes = await writeXlsx([{ name, cols: [widths], rows: [[cell, …], …], freeze: 1 }], { title })
 *   cell = null | 'text' | 12.5 | { v, f (formula, no "="), s (style key) }
 */
import { writeXlsx as write } from '../tables/xlsx.js';

export { zip, crc32, STYLE, xmlText, colName, ref, sheetName } from '../tables/xlsx.js';

/** sheets: [{ name, rows, cols?, freeze? }] → .xlsx bytes. */
export const writeXlsx = (sheets, { title = '', compress = true } = {}) => write(sheets, { title, compress, creator: 'CivilCraft', stamp: new Date() });
