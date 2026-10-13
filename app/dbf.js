/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dbf.js — the dBASE III table of a shapefile (.dbf), read and written (docs/GIS-SPEC.md §2). No DOM.
 *
 *   readDbf(bytes, { cpg, max }) → { fields: [{name, type, dbfType, length, decimals}], records: [props], encoding, notes }
 *     props are null-prototype objects (a field named "__proto__" is just a field); types: C → 'text', N/F → 'number',
 *     L → 'bool', D → 'date' ("YYYY-MM-DD"), others → 'text'. Deleted records are skipped (counted in notes).
 *     Encoding: the .cpg text when it names one (UTF-8, 1252, ISO-8859-x, …), else the LDID byte as a hint
 *     (0x57 / 0x03 = Windows-1252), else UTF-8 when the text is valid UTF-8, else Windows-1252.
 *   writeDbf(fields, records) → { bytes, names }   fields [{name, type}], records [props]; UTF-8 text (write a .cpg
 *     "UTF-8" beside it); names = the field names as written (≤ 10 ASCII characters, unique) in field order
 *   dbfNames(names) → names ≤ 10 characters, A–Z a–z 0–9 _, unique (NAME, NAME_1 …)
 */

import { t } from "./i18n.js";

export class DbfError extends Error {}

const CPG = [
  [/^(utf-?8|65001)$/i, 'utf-8'],
  [/^(ansi\s*)?(cp|windows-?)?1252$/i, 'windows-1252'], [/^(ansi\s*)?(cp|windows-?)?(125[0-8])$/i, null],
  [/^(iso-?)?8859-?(\d{1,2})$/i, null], [/^8859(\d{1,2})$/i, null], [/^(cp)?866$/i, 'ibm866'], [/^(koi8-?r)$/i, 'koi8-r'],
  [/^(cp)?936$|^gbk$|^gb2312$/i, 'gbk'], [/^(cp)?950$|^big5$/i, 'big5'], [/^(cp)?932$|^shift_?jis$/i, 'shift_jis'], [/^(cp)?949$|^euc-?kr$/i, 'euc-kr'],
];
function cpgLabel(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  for (const [re, label] of CPG) {
    const m = t.match(re);
    if (!m) continue;
    if (label) return label;
    if (/125/.test(m[0])) return 'windows-' + m[0].match(/125\d/)[0];
    const n = m[2] || m[1];
    return 'iso-8859-' + n;
  }
  return null;
}
const LDID = { 0x57: 'windows-1252', 0x03: 'windows-1252', 0xc8: 'windows-1250', 0xc9: 'windows-1251', 0xcb: 'windows-1253', 0xca: 'windows-1254', 0x7d: 'windows-1255', 0x7e: 'windows-1256', 0x4d: 'gbk', 0x4e: 'euc-kr', 0x4f: 'big5', 0x13: 'shift_jis', 0x26: 'ibm866' };

const blank = (b, s, e) => { for (let i = s; i < e; i++) if (b[i] !== 32 && b[i] !== 0) return false; return true; };

export function readDbf(bytes, { cpg = null, max = 2e6 } = {}) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const notes = [];
  if (b.length < 33) throw new DbfError(t('dbf.short'));
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const n = dv.getUint32(4, true), hlen = dv.getUint16(8, true), rlen = dv.getUint16(10, true);
  if (hlen < 33 || hlen > b.length || rlen < 1) throw new DbfError(t('dbf.header'));
  let enc = cpgLabel(cpg), from = enc ? 'cpg' : '';
  if (cpg && !enc) notes.push(t('dbf.cpg.unknown', { cpg: String(cpg).trim().slice(0, 30) }));
  if (!enc && LDID[b[29]]) { enc = LDID[b[29]]; from = 'ldid'; }
  // field descriptors
  const fields = [];
  const rawNames = [];
  let off = 1;
  for (let p = 32; p + 32 <= hlen && b[p] !== 0x0d; p += 32) {
    let e = p; while (e < p + 11 && b[e]) e++;
    rawNames.push(b.subarray(p, e));
    const ft = String.fromCharCode(b[p + 11]), len = b[p + 16], dec = b[p + 17];
    fields.push({ dbfType: ft, length: len, decimals: dec, off, type: ft === 'N' || ft === 'F' ? 'number' : ft === 'L' ? 'bool' : ft === 'D' ? 'date' : 'text' });
    off += len;
    if (fields.length > 2046) throw new DbfError(t('dbf.fields.many'));
  }
  if (off > rlen) throw new DbfError(t('dbf.fields.fit'));
  const avail = Math.floor((b.length - hlen) / rlen);
  let count = n;
  if (n > avail) { count = avail; notes.push(t('dbf.cut', { n, avail })); }
  if (count > max) { count = max; notes.push(t('dbf.max', { n: max })); }
  // encoding: valid UTF-8 everywhere → UTF-8, else Windows-1252
  if (!enc) {
    const sample = b.subarray(hlen, hlen + Math.min(count * rlen, 4e6));
    let utf = true;
    try { new TextDecoder('utf-8', { fatal: true }).decode(sample); new TextDecoder('utf-8', { fatal: true }).decode(b.subarray(32, hlen)); } catch { utf = false; }
    enc = utf ? 'utf-8' : 'windows-1252'; from = 'guess';
    if (!utf) notes.push(t('dbf.noenc'));
  }
  let dec;
  try { dec = new TextDecoder(enc); } catch { dec = new TextDecoder('windows-1252'); enc = 'windows-1252'; }
  const seen = new Set();
  rawNames.forEach((r, i) => {
    let nm = dec.decode(r).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 64) || 'FIELD' + (i + 1);
    let k = nm, j = 1; while (seen.has(k)) k = nm + '_' + j++;
    seen.add(k); fields[i].name = k;
  });
  const records = [];
  let deleted = 0, memo = false;
  for (let r = 0; r < count; r++) {
    const p = hlen + r * rlen;
    if (b[p] === 0x2a) { deleted++; continue; }
    if (b[p] === 0x1a) break;
    const o = Object.create(null);
    for (const f of fields) {
      const s = p + f.off, e = s + f.length;
      if (f.dbfType === 'M') { memo = true; o[f.name] = null; continue; }
      if (blank(b, s, e)) { o[f.name] = null; continue; }
      if (f.type === 'number') { const v = Number(latinTrim(b, s, e).replace(/,/, '.')); o[f.name] = latinTrim(b, s, e) === '' || !Number.isFinite(v) ? null : v; }
      else if (f.type === 'bool') { const c = String.fromCharCode(b[s]); o[f.name] = /[TtYy]/.test(c) ? true : /[FfNn]/.test(c) ? false : null; }
      else if (f.type === 'date') { const t = latinTrim(b, s, e); o[f.name] = /^\d{8}$/.test(t) ? t.slice(0, 4) + '-' + t.slice(4, 6) + '-' + t.slice(6) : null; }
      else o[f.name] = dec.decode(b.subarray(s, e)).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+$/, '').replace(/^\s+/, '');
    }
    records.push(o);
  }
  if (deleted) notes.push(t('dbf.deleted', { n: deleted }));
  if (memo) notes.push(t('dbf.memo'));
  return { fields: fields.map(({ name, type, dbfType, length, decimals }) => ({ name, type, dbfType, length, decimals })), records, encoding: enc, encodingFrom: from, notes };
}
function latinTrim(b, s, e) { let t = ''; for (let i = s; i < e; i++) t += String.fromCharCode(b[i]); return t.trim(); }

export function dbfNames(names) {
  const used = new Set(), out = [];
  for (const n of names) {
    let base = String(n).normalize('NFKD').replace(/[^A-Za-z0-9_]/g, '_').slice(0, 10) || 'FIELD';
    let k = base, j = 1;
    while (used.has(k.toUpperCase())) { const s = '_' + j++; k = base.slice(0, 10 - s.length) + s; }
    used.add(k.toUpperCase()); out.push(k);
  }
  return out;
}

const enc = new TextEncoder();
/** Cut UTF-8 bytes to ≤ max without splitting a character. */
function cut(u, max) { if (u.length <= max) return u; let e = max; while (e > 0 && (u[e] & 0xc0) === 0x80) e--; return u.subarray(0, e); }
function numText(v, dec) { return dec ? v.toFixed(dec) : String(Math.round(v)); }

export function writeDbf(fields, records) {
  const names = dbfNames(fields.map((f) => f.name));
  const defs = fields.map((f, i) => {
    const vals = records.map((r) => r[f.name]);
    if (f.type === 'number') {
      const nums = vals.filter((v) => typeof v === 'number' && Number.isFinite(v));
      const ints = nums.every((v) => Number.isInteger(v) && Math.abs(v) < 1e15);
      let decimals = 0;
      if (!ints) {
        // as many decimals as the values need, up to 8 (coordinates to 0.00000001), within 24 characters
        decimals = 1;
        for (const v of nums) { let d = 0; while (d < 8 && Math.abs(Number(v.toFixed(d)) - v) > Math.abs(v) * 1e-14) d++; if (d > decimals) decimals = d; }
      }
      const w = Math.max(1, ...nums.map((v) => numText(v, decimals).length));
      const length = Math.min(24, Math.max(w, decimals ? decimals + 3 : 1));
      return { name: names[i], key: f.name, t: 'N', length, decimals, kind: 'number' };
    }
    if (f.type === 'bool') return { name: names[i], key: f.name, t: 'L', length: 1, decimals: 0, kind: 'bool' };
    if (f.type === 'date') return { name: names[i], key: f.name, t: 'D', length: 8, decimals: 0, kind: 'date' };
    const len = Math.max(1, ...vals.map((v) => (v == null ? 0 : cut(enc.encode(String(v)), 254).length)));
    return { name: names[i], key: f.name, t: 'C', length: Math.min(254, len), decimals: 0, kind: 'text' };
  });
  const rlen = 1 + defs.reduce((s, d) => s + d.length, 0);
  const hlen = 32 + 32 * defs.length + 1;
  const out = new Uint8Array(hlen + rlen * records.length + 1);
  const dv = new DataView(out.buffer);
  const now = new Date();
  out[0] = 0x03; out[1] = now.getFullYear() - 1900; out[2] = now.getMonth() + 1; out[3] = now.getDate();
  dv.setUint32(4, records.length, true); dv.setUint16(8, hlen, true); dv.setUint16(10, rlen, true);
  defs.forEach((d, i) => {
    const p = 32 + i * 32;
    for (let k = 0; k < d.name.length; k++) out[p + k] = d.name.charCodeAt(k);
    out[p + 11] = d.t.charCodeAt(0); out[p + 16] = d.length; out[p + 17] = d.decimals;
  });
  out[hlen - 1] = 0x0d;
  out.fill(0x20, hlen, hlen + rlen * records.length);
  records.forEach((r, ri) => {
    let p = hlen + ri * rlen + 1;
    for (const d of defs) {
      const v = r[d.key];
      let s = null;
      if (v != null && v !== '') {
        if (d.kind === 'number') { if (typeof v === 'number' && Number.isFinite(v)) { s = numText(v, d.decimals); if (s.length > d.length) s = v.toExponential(Math.max(0, d.length - 7)); } }
        else if (d.kind === 'bool') s = v === true ? 'T' : v === false ? 'F' : '?';
        else if (d.kind === 'date') { const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) s = m[1] + m[2] + m[3]; }
        else { const u = cut(enc.encode(String(v)), d.length); out.set(u, p); }
      }
      if (s != null) { const pad = d.kind === 'number' ? s.padStart(d.length, ' ') : s; for (let k = 0; k < Math.min(pad.length, d.length); k++) out[p + k] = pad.charCodeAt(k); }
      p += d.length;
    }
  });
  out[out.length - 1] = 0x1a;
  return { bytes: out, names };
}
