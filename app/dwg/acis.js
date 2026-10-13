/* SPDX-License-Identifier: Apache-2.0 */
/**
 * acis.js — the ACIS data of REGION / 3DSOLID / BODY entities (cc-dwg, Apache-2.0): SAT text and SAB bytes as a DWG
 * stores them. Written from the ODA "Open Design Specification for .dwg files" v5.4.1, 20.4.41 (version 1: SAT text in
 * blocks with the character substitution 0x9F − c; version 2: a SAB or SAT file with no length, read up to its end mark)
 * and ch. 24 (SAB streams in the data storage section, their "ACIS BinaryFile" prefix and "End-of-ASM-data" suffix).
 * The inside of SAT/SAB (bodies, faces, curves …) is not interpreted: the data is kept and written back as it is.
 * Where the document is silent the facts were found by experiment (AutoCAD's example_2000…2018.dwg and files the ODA
 * File Converter saved from ezdxf-made ACIS) and are marked "Spec gap:".
 *
 *   satDecrypt(bytes) → string            satEncrypt(string) → Uint8Array      (version-1 substitution)
 *   findAcisEnd(bytes) → length | -1      the end of a version-2 SAB/SAT file (its end mark included)
 *   acisInfo(fmt, data) → { version }     the ACIS release number from the SAT header line / SAB header
 *   toAcis({ format, data }) → { format, version, bytes }   model value → bytes (SAB) or text (SAT)
 *   satToBytes(text) / bytesToB64 / b64ToBytes
 */

const latin1 = (s) => { const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xFF; return b; };

/**
 * 20.4.41 version 1: "if value is between 0x20 and 0x7E, calculate 0x9F − the value to get the real character. If
 * it's a tab, we convert to a space." Spec gap: a space is stored as 0x20 − nothing maps onto it (0x9F − 0x20 = 0x7F)
 * — AutoCAD and the ODA File Converter store a space as itself... ; the substitution is its own inverse on 0x21–0x7E.
 */
export function satDecrypt(b) {
  const o = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) {
    const c = b[i];
    o[i] = c >= 0x21 && c <= 0x7E ? 0x9F - c : c === 9 ? 32 : c;
  }
  return latin1String(o);
}
/** bytes → a string of the same char codes (big arrays in slices: no argument-count limit) */
export function latin1String(b) {
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return s;
}
export function satEncrypt(s) {
  const b = latin1(s);
  for (let i = 0; i < b.length; i++) if (b[i] >= 0x21 && b[i] <= 0x7E) b[i] = 0x9F - b[i];
  return b;
}

const MARKS = ['End\x0E\x02of\x0E\x04ACIS\x0D\x04data', 'End\x0E\x02of\x0E\x03ASM\x0D\x04data', 'End-of-ACIS-data', 'End-of-ASM-data'].map(latin1);
/**
 * Version 2 has no length: 20.4.41 "SAB files will end with End\x0E\x02of\x0E\x04ACIS\x0D\x04data". Spec gap: ASM
 * (ACIS ≥ 21800) writes "…\x0E\x03ASM\x0D\x04data", and the ODA File Converter ends its SAB with the identifier
 * "\x0D\x10End-of-ACIS-data" (found in the converter's own R2004–R2010 files). SAT text ends with "End-of-ACIS-data"
 * / "End-of-ASM-data". Returns the length up to and including the first end mark, or -1.
 */
export function findAcisEnd(b, from = 0) {
  let best = -1;
  for (const m of MARKS) {
    const at = indexOf(b, m, from);
    if (at >= 0 && (best < 0 || at + m.length < best)) best = at + m.length;
  }
  return best;
}
function indexOf(b, m, from) {
  const n = b.length - m.length, f = m[0];
  for (let i = from; i <= n; i++) {
    if (b[i] !== f) continue;
    let k = 1;
    while (k < m.length && b[i + k] === m[k]) k++;
    if (k === m.length) return i;
  }
  return -1;
}

/** "ACIS BinaryFile" + Int32 version, or (ASM ≥ 223) "ASM BinaryFile4" + Int64 version — spec gap, found by experiment. */
export function sabVersion(b) {
  const head = latin1String(b.subarray(0, 15));
  if (head === 'ACIS BinaryFile' && b.length >= 19) return (b[15] | (b[16] << 8) | (b[17] << 16) | (b[18] << 24)) >>> 0;
  if (head === 'ASM BinaryFile4' && b.length >= 23) return (b[15] | (b[16] << 8) | (b[17] << 16) | (b[18] << 24)) >>> 0;
  return undefined;
}
export const isSab = (b) => { const h = latin1String(b.subarray(0, 15)); return h === 'ACIS BinaryFile' || h === 'ASM BinaryFile4'; };

/** The ACIS release number: the first number of a SAT header, or the SAB header's. */
export function acisInfo(format, data) {
  if (format === 'sab') return { version: sabVersion(typeof data === 'string' ? b64ToBytes(data) : data) };
  const m = /^\s*(\d+)/.exec(String(data || ''));
  return { version: m ? +m[1] : undefined };
}

export function bytesToB64(u8) {
  if (typeof Buffer !== 'undefined') return Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength).toString('base64');
  return btoa(latin1String(u8));
}
export function b64ToBytes(s) {
  if (s instanceof Uint8Array) return s;
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(String(s), 'base64'));
  const t = atob(String(s)); return latin1(t);
}
export const satToBytes = latin1;

/** Model `acis` value → { format, text?|bytes? }, or null when it holds nothing usable. */
export function normAcis(a) {
  if (!a) return null;
  if (typeof a === 'string') return a.trim() ? { format: 'sat', text: a } : null;
  if (a.format === 'sab') { const bytes = b64ToBytes(a.data || ''); return bytes.length ? { format: 'sab', bytes } : null; }
  const text = String(a.data ?? '');
  return text.trim() ? { format: 'sat', text } : null;
}
