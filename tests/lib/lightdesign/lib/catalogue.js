/* SPDX-License-Identifier: Apache-2.0 */
/**
 * catalogue.js — the person's own luminaire catalogues (0.11 IL.7, session `light-finish-11`). DOM-free.
 *
 * Makers publish one photometry file per product (EULUMDAT .ldt or IES LM-63 .ies). Nothing here ships, copies or invents a maker's data: a catalogue is the files
 * the PERSON adds (any number, or a whole folder), kept as their text in the add-on's own storage, read with photometry.js, and listed with what each file says.
 *
 *   entryOf(text, fileName)          → { ok, entry } | { ok:false, key }   entry = { file, name, maker, format, lumens, watts, efficacy, beam, beamC0, beamC90, photo }
 *   beamAngle(photo, c)              → the full angle (degrees) in the plane C = c (and c + 180) between the directions where the intensity falls to half the plane's peak,
 *                                      or null when it never does (a bare lamp). The 50 %-of-peak rule is the usual beam-angle definition; it is computed, not read from the file.
 *   searchEntries(entries, { q, sort, minLm, maxW })   → the entries that match every word of q (name, maker, file name), sorted (name | lumens | watts | beam | efficacy)
 *   addFiles(cat, files)             files [{ name, text, tooBig? }] → { added, replaced, refused: [{ file, key }] }   a file with the same name replaces the older one
 *   storedSize(cat)                  characters the catalogue takes in storage (its file texts)
 *   cleanCatalogue(raw)              a stored catalogue { id, name, files: [{ name, text }] } read back (bad parts dropped) → { id, name, files, entries }
 * Limits: MAX_FILES per catalogue, MAX_FILE characters a file, STORE_MAX characters of all catalogues kept in storage (localStorage is a few MB per site).
 */
import { parsePhotometry, candela } from './photometry.js';

export const MAX_FILES = 500;
export const MAX_FILE = 400000;
export const STORE_MAX = 1500000;
export const SORTS = ['name', 'lumens', 'watts', 'beam', 'efficacy'];

/** The maker named in the file: IES [MANUFAC], EULUMDAT line 1 (company identification); '' when the file names none. */
export function makerOf(text, format, photo) {
  if (format === 'ies') return String((photo.keywords && (photo.keywords.MANUFAC || photo.keywords.MANUFACTURER)) || '').trim().slice(0, 80);
  const first = String(text || '').replace(/\r/g, '').split('\n')[0] || '';
  return first.trim().slice(0, 80);
}

export function beamAngle(photo, c = 0) {
  const step = 0.5, prof = [];
  for (let th = -180; th <= 180 + 1e-9; th += step) prof.push(th >= 0 ? candela(photo, th, c) : candela(photo, -th, (c + 180) % 360));
  let k = 0;
  for (let i = 1; i < prof.length; i++) if (prof[i] > prof[k]) k = i;
  const peak = prof[k];
  if (!(peak > 0)) return null;
  const half = peak / 2;
  let lo = null, hi = null;
  for (let i = k; i > 0; i--) if (prof[i - 1] < half) { const t = (prof[i] - half) / (prof[i] - prof[i - 1]); lo = -180 + (i - t) * step; break; }
  for (let i = k; i < prof.length - 1; i++) if (prof[i + 1] < half) { const t = (prof[i] - half) / (prof[i] - prof[i + 1]); hi = -180 + (i + t) * step; break; }
  if (lo === null || hi === null) return null;
  return hi - lo;
}

export function entryOf(text, fileName = '') {
  const s = String(text || '');
  if (s.length > MAX_FILE) return { ok: false, key: 'cat.toobig' };
  const r = parsePhotometry(s, fileName);
  if (!r.ok) return { ok: false, key: 'photo.' + r.key };
  const p = r.photo, b0 = beamAngle(p, 0), b90 = beamAngle(p, 90);
  const beam = b0 === null || b90 === null ? null : (b0 + b90) / 2;
  const name = String(p.name || '').trim() || String(fileName).replace(/\.[a-z0-9]+$/i, '');
  return { ok: true, entry: { file: String(fileName).slice(0, 160), name: name.slice(0, 120), maker: makerOf(s, p.format, p), format: p.format, lumens: p.lumens || 0, watts: p.watts || 0,
    efficacy: p.lumens > 0 && p.watts > 0 ? p.lumens / p.watts : 0, beam, beamC0: b0, beamC90: b90, photo: p } };
}

export function searchEntries(entries, { q = '', sort = 'name', minLm = 0, maxW = 0 } = {}) {
  const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  const out = entries.filter((e) => {
    const hay = (e.name + ' ' + e.maker + ' ' + e.file).toLowerCase();
    return words.every((w) => hay.includes(w)) && (!(minLm > 0) || e.lumens >= minLm) && (!(maxW > 0) || (e.watts > 0 && e.watts <= maxW));
  });
  const key = SORTS.includes(sort) ? sort : 'name';
  const val = (e) => (key === 'beam' ? (e.beam === null ? Infinity : e.beam) : e[key]);
  out.sort((a, b) => (key === 'name' ? a.name.localeCompare(b.name) || a.file.localeCompare(b.file) : key === 'beam' ? val(a) - val(b) : val(b) - val(a)));
  return out;
}

export function addFiles(cat, files) {
  let added = 0, replaced = 0;
  const refused = [];
  for (const f of files || []) {
    const name = String((f && f.name) || '').split(/[\\/]/).pop();
    if (!/\.(ldt|ies)$/i.test(name)) { refused.push({ file: name, key: 'cat.notphoto' }); continue; }
    if (f.tooBig) { refused.push({ file: name, key: 'cat.toobig' }); continue; }
    const r = entryOf(f.text, name);
    if (!r.ok) { refused.push({ file: name, key: r.key }); continue; }
    const at = cat.files.findIndex((x) => x.name === name);
    if (at >= 0) { cat.files[at] = { name, text: String(f.text) }; cat.entries[at] = r.entry; replaced++; continue; }
    if (cat.files.length >= MAX_FILES) { refused.push({ file: name, key: 'cat.full' }); continue; }
    cat.files.push({ name, text: String(f.text) }); cat.entries.push(r.entry); added++;
  }
  return { added, replaced, refused };
}

export const storedSize = (cat) => cat.files.reduce((s, f) => s + f.name.length + f.text.length + 16, 0);

export function cleanCatalogue(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
  if (!id) return null;
  const cat = { id, name: String(raw.name || '').trim().slice(0, 60) || id, files: [], entries: [] };
  addFiles(cat, (Array.isArray(raw.files) ? raw.files : []).filter((f) => f && typeof f.text === 'string'));
  return cat;
}
