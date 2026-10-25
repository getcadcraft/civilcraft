/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dxf.js — where a DXF keeps a solid's ACIS data (cc-acis, docs/ACIS-READER.md § 1; spec gap: found in the ODA File
 * Converter's DXF of the corpus files), and base64 for SAB bytes. No DOM, no imports: small enough for a DXF reader to
 * load with it, while the rest of cc-acis loads when a solid is first drawn.
 *
 *   acisFromDxf(groups) → { format: 'sat', data } | null      a 3DSOLID / REGION / BODY's own [code, value] pairs (DXF ≤ 2010)
 *   acisFromDxfDataStorage(pairs) → Map(HANDLE → Uint8Array)  the ACDSDATA section's pairs (DXF 2013+)
 *   b64ToBytes(s) · bytesToB64(bytes)
 */

const MAX_BYTES = 64 * 1024 * 1024;   // tokens.js LIMITS.bytes

/**
 * DXF R2000–R2010: the entity's group 1 lines (each a new line of SAT text, group 3 continuing the line before) under the
 * 0x9F − c substitution (space and tab stay). Version (group 70) 1 only. → { format: 'sat', data } or null.
 */
export function acisFromDxf(groups) {
  if (!Array.isArray(groups)) return null;
  let ver = 1;
  for (const [c, v] of groups) if (c === 70) { ver = parseInt(v, 10); break; }
  const lines = [];
  let total = 0;
  for (const [c, v] of groups) {
    if (c !== 1 && c !== 3) continue;
    const s = String(v ?? '');
    total += s.length;
    if (total > MAX_BYTES) return null;
    if (c === 1 || !lines.length) lines.push(s); else lines[lines.length - 1] += s;
  }
  if (!lines.length) return null;
  if (ver !== 1 && ver !== 2) return null;
  const text = lines.map(decrypt).join('\n');
  return text.trim() ? { format: 'sat', data: text } : null;
}
function decrypt(s) {
  // first the DXF string's own caret escapes (DXF Reference, control characters): "^ " is a caret, "^@" … "^_" the
  // control characters 0–31 — the substitution turns 'A' into '^', so every A of the text comes as "^ "
  if (s.includes('^')) s = s.replace(/\^([ @-_])/g, (m, c) => (c === ' ' ? '^' : String.fromCharCode(c.charCodeAt(0) - 64)));
  let o = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    o += c >= 0x21 && c <= 0x7E ? String.fromCharCode(0x9F - c) : c === 9 ? ' ' : s[i];
  }
  return o;
}

/**
 * DXF 2013+: the ACDSDATA section's [code, value] pairs → Map(handle in upper case → bytes). A record whose group 2
 * names `ASM_Data` holds group 94 (the byte count) and group 310 lines of hex; its entity's handle is the group 320 before.
 */
export function acisFromDxfDataStorage(pairs) {
  const out = new Map();
  if (!Array.isArray(pairs)) return out;
  let handle = null, field = '', want = 0, parts = null, got = 0;
  const flush = () => {
    if (handle && parts && got) {
      const b = new Uint8Array(got);
      let at = 0;
      for (const p of parts) { b.set(p, at); at += p.length; }
      out.set(handle, want && want <= got ? b.subarray(0, want) : b);
    }
    parts = null; got = 0; want = 0;
  };
  for (const [c, v] of pairs) {
    if (c === 0) { flush(); handle = null; field = ''; continue; }
    if (c === 320) { flush(); handle = String(v).trim().toUpperCase().replace(/^0+(?=.)/, ''); continue; }
    if (c === 2) { flush(); field = String(v).trim(); continue; }
    if (field !== 'ASM_Data') continue;
    if (c === 94) { want = parseInt(v, 10) || 0; if (want > MAX_BYTES) { want = 0; field = ''; continue; } parts = []; continue; }
    if (c === 310 && parts) {
      const h = String(v).trim();
      if (!/^[0-9A-Fa-f]*$/.test(h) || h.length % 2) { parts = null; field = ''; continue; }
      if (got + h.length / 2 > MAX_BYTES) { parts = null; field = ''; continue; }
      const b = new Uint8Array(h.length / 2);
      for (let i = 0; i < b.length; i++) b[i] = parseInt(h.substr(i * 2, 2), 16);
      parts.push(b); got += b.length;
    }
  }
  flush();
  return out;
}

export function b64ToBytes(s) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(String(s), 'base64'));
  const t = atob(String(s).replace(/\s+/g, ''));
  const b = new Uint8Array(t.length);
  for (let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i);
  return b;
}

export function bytesToB64(b) {
  if (typeof Buffer !== 'undefined') return Buffer.from(b.buffer, b.byteOffset, b.byteLength).toString('base64');
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
}
