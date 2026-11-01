/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plates.js — read a person's own connector plate table and species table (CSV or JSON), DOM-free. Nothing here carries a capacity of its own:
 * a table comes from the person (the manufacturer's evaluated values) or the labelled placeholder series is used.
 *   parsePlateTable(text) → { ok, label, plates: [{ id, w, h, kN }], error? }      CSV header: id,w,h,kN (aliases: width, height, capacity)  · JSON: [...] or { label, plates }
 *   parseSpeciesTable(text) → { ok, species: [...], error? }                          CSV header: id,label,Ft,Fc,E,Emin[,Fb][,Fcp]  · JSON: [...] or { species }
 * A line "# label: <name>" at the top of a CSV names the table.
 */
import { cleanSpecies } from './tables.js';

function rowsOfCsv(text) {
  const lines = String(text).replace(/^﻿/, '').split(/\r?\n/);
  let label = '';
  const body = [];
  for (const l of lines) {
    const m = /^\s*#\s*label\s*:\s*(.*)$/i.exec(l);
    if (m) { label = m[1].trim(); continue; }
    if (!l.trim() || /^\s*#/.test(l)) continue;
    const cells = []; let cur = '', q = false;
    for (let i = 0; i < l.length; i++) { const ch = l[i]; if (q) { if (ch === '"' && l[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; } else if (ch === '"') q = true; else if (ch === ',' || ch === ';') { cells.push(cur.trim()); cur = ''; } else cur += ch; }
    cells.push(cur.trim()); body.push(cells);
  }
  if (!body.length) return { label, rows: [] };
  const head = body[0].map((h) => h.toLowerCase());
  return { label, rows: body.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]]))) };
}
const parse = (text) => { const t = String(text || '').trim(); if (!t) return { error: 'empty' }; if (t[0] === '[' || t[0] === '{') { try { return { json: JSON.parse(t) }; } catch { return { error: 'json' }; } } return { csv: rowsOfCsv(t) }; };
const pos = (v) => (Number.isFinite(Number(v)) && v !== '' && v !== null && Number(v) > 0 && Number(v) < 1e6 ? Number(v) : null);

export function parsePlateTable(text) {
  const p = parse(text);
  if (p.error) return { ok: false, error: p.error === 'json' ? 'The file is not valid JSON.' : 'The file is empty.', plates: [] };
  let label = '', rows;
  if (p.json) { rows = Array.isArray(p.json) ? p.json : p.json.plates; label = Array.isArray(p.json) ? '' : String(p.json.label || ''); } else { rows = p.csv.rows; label = p.csv.label; }
  if (!Array.isArray(rows)) return { ok: false, error: 'No plate rows found.', plates: [] };
  const out = [], bad = [];
  rows.forEach((r, i) => {
    const w = pos(r.w ?? r.width), h = pos(r.h ?? r.height), kN = pos(r.kN ?? r.kn ?? r.capacity);
    if (w === null || h === null || kN === null) { bad.push(i + 1); return; }
    out.push({ id: String(r.id || w + 'x' + h).slice(0, 40), w, h, kN });
  });
  if (!out.length) return { ok: false, error: 'No usable plate rows (each needs w, h and kN above zero).', plates: [] };
  out.sort((a, b) => a.kN - b.kN || a.w * a.h - b.w * b.h);
  return { ok: true, label: label.slice(0, 80) || 'Your plate table', plates: out, skipped: bad };
}

export function parseSpeciesTable(text) {
  const p = parse(text);
  if (p.error) return { ok: false, error: p.error === 'json' ? 'The file is not valid JSON.' : 'The file is empty.', species: [] };
  const rows = p.json ? (Array.isArray(p.json) ? p.json : p.json.species) : p.csv.rows;
  const sp = cleanSpecies((rows || []).map((r) => ({ ...r, Ft: r.Ft ?? r.ft, Fc: r.Fc ?? r.fc, E: r.E ?? r.e, Emin: r.Emin ?? r.emin, Fb: r.Fb ?? r.fb, Fcp: r.Fcp ?? r.fcp })));
  return sp.length ? { ok: true, species: sp } : { ok: false, error: 'No usable species rows (id, Ft, Fc, E and Emin above zero).', species: [] };
}
