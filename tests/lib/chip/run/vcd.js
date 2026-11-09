/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vcd.js — our own reader for value change dump files (IEEE 1364 § 18, the four-state VCD every simulator writes) (0.9 HD.4). DOM-free,
 * no imports, written from the standard's description; no simulator code was read.
 *
 *   readVcd(text, { maxChanges = 5e6 }) → { ok, timescale: { n, unit, seconds }, date, version, scopes: tree, signals: [sig], end, truncated, problems[] }
 *       sig = { code, name, path ('tb.dut.count'), width, kind ('wire'|'reg'|'real'|…), msb, lsb, t: number[], v: string[] }
 *       values: '0' '1' 'x' 'z' for one bit; a binary string ('0101', may hold x/z) for vectors, left-padded to the width; a number string for reals.
 *   valueAt(sig, time) → the value in force at `time` ('' before the first change)
 *   formatValue(v, width, radix 'bin'|'hex'|'dec') → text
 *   FST (the compressed format GTKWave and Verilator can write) is NOT read: `isFst(bytes)` spots one so the page can say so.
 */

const UNIT = { s: 1, ms: 1e-3, us: 1e-6, ns: 1e-9, ps: 1e-12, fs: 1e-15 };

export function readVcd(text, { maxChanges = 5e6 } = {}) {
  const s = String(text);
  const out = { ok: false, timescale: { n: 1, unit: 'ns', seconds: 1e-9 }, date: '', version: '', scopes: { name: '', kind: 'root', children: [], signals: [] }, signals: [], end: 0, truncated: false, problems: [] };
  const byCode = new Map();
  let i = 0, n = s.length, changes = 0, time = 0;
  const word = () => { while (i < n && s.charCodeAt(i) <= 32) i++; const a = i; while (i < n && s.charCodeAt(i) > 32) i++; return s.slice(a, i); };
  const untilEnd = () => { const parts = []; for (;;) { const w = word(); if (!w || w === '$end') return parts; parts.push(w); } };
  const stack = [out.scopes];
  let defsDone = false;
  const set = (code, v) => {
    const list = byCode.get(code);
    if (!list) { if (out.problems.length < 20) out.problems.push({ code: 'vcd.unknown', id: code }); return; }
    if (changes >= maxChanges) { out.truncated = true; return; }
    for (const g of list) {
      const last = g.v.length - 1;
      if (last >= 0 && g.t[last] === time) { g.v[last] = v; continue; }   // same time: the last value wins
      if (last >= 0 && g.v[last] === v) continue;
      g.t.push(time); g.v.push(v);
    }
    changes++;
  };
  const pad = (bits, width) => {
    if (bits.length >= width) return bits.slice(bits.length - width);
    const f = bits[0] === 'x' || bits[0] === 'z' ? bits[0] : '0';   // the standard's left-extension: 0 for 0/1, else the same letter
    return f.repeat(width - bits.length) + bits;
  };
  while (i < n) {
    const w = word();
    if (!w) break;
    if (w[0] === '$') {
      switch (w) {
        case '$timescale': {
          const t = untilEnd().join('');
          const m = /^(1|10|100)\s*(s|ms|us|ns|ps|fs)$/.exec(t);
          if (m) out.timescale = { n: Number(m[1]), unit: m[2], seconds: Number(m[1]) * UNIT[m[2]] }; else out.problems.push({ code: 'vcd.timescale', id: t });
          break;
        }
        case '$date': out.date = untilEnd().join(' '); break;
        case '$version': out.version = untilEnd().join(' '); break;
        case '$comment': untilEnd(); break;
        case '$scope': { const [kind, name] = untilEnd(); const sc = { name: name || '', kind: kind || 'module', children: [], signals: [] }; stack[stack.length - 1].children.push(sc); stack.push(sc); break; }
        case '$upscope': untilEnd(); if (stack.length > 1) stack.pop(); break;
        case '$var': {
          const p = untilEnd();
          if (p.length < 4) { out.problems.push({ code: 'vcd.var' }); break; }
          const [kind, size, code, ...rest] = p;
          let name = rest.join(''), msb = null, lsb = null;
          const r = /^(.*?)\[(-?\d+)(?::(-?\d+))?\]$/.exec(name);
          if (r) { name = r[1]; msb = Number(r[2]); lsb = r[3] === undefined ? msb : Number(r[3]); }
          const path = stack.slice(1).map((x) => x.name).concat(name).join('.');
          const sig = { code, name, path, width: Math.max(1, Number(size) || 1), kind, msb, lsb, t: [], v: [] };
          stack[stack.length - 1].signals.push(sig);
          out.signals.push(sig);
          if (!byCode.has(code)) byCode.set(code, []);
          byCode.get(code).push(sig);
          break;
        }
        case '$enddefinitions': untilEnd(); defsDone = true; break;
        case '$dumpvars': case '$dumpall': case '$dumpon': case '$dumpoff': case '$end': break;   // their value changes follow as usual
        default: out.problems.push({ code: 'vcd.keyword', id: w }); untilEnd();
      }
      continue;
    }
    if (!defsDone) { out.problems.push({ code: 'vcd.before_defs', id: w.slice(0, 20) }); continue; }
    const c = w[0];
    if (c === '#') { const t = Number(w.slice(1)); if (Number.isFinite(t)) { if (t < time) out.problems.push({ code: 'vcd.time_back', id: w }); time = t; out.end = Math.max(out.end, t); } continue; }
    if (c === 'b' || c === 'B') { const code = word(); const g = byCode.get(code); set(code, pad(w.slice(1).toLowerCase(), g ? g[0].width : 1)); continue; }
    if (c === 'r' || c === 'R') { const code = word(); set(code, String(Number(w.slice(1)))); continue; }
    if ('01xXzZ'.includes(c)) { set(w.slice(1), c.toLowerCase()); continue; }
    if (out.problems.length < 20) out.problems.push({ code: 'vcd.token', id: w.slice(0, 20) });
  }
  out.ok = defsDone;
  if (!defsDone) out.problems.push({ code: 'vcd.no_defs' });
  return out;
}

export function valueAt(sig, time) {
  const t = sig.t;
  let lo = 0, hi = t.length - 1, k = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (t[m] <= time) { k = m; lo = m + 1; } else hi = m - 1; }
  return k < 0 ? '' : sig.v[k];
}

export function formatValue(v, width = 1, radix = 'hex') {
  if (v === '' || width === 1 || /[^01]/.test(v) && !/[xz]/.test(v)) return v;
  if (/[xz]/.test(v)) return /^x+$/.test(v) ? 'x' : /^z+$/.test(v) ? 'z' : v;
  if (radix === 'bin') return v;
  const b = BigInt('0b' + v);
  return radix === 'dec' ? b.toString(10) : b.toString(16);
}

/** FST files start with a block of type 0 (header) whose section length is 329: we only spot them, to say plainly they are not read. */
export function isFst(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  return b.length > 9 && b[0] === 0 && b[1] === 0 && b[2] === 0 && b[3] === 0 && b[4] === 0 && b[5] === 0 && b[6] === 0 && b[7] === 1 && b[8] === 0x49;
}
