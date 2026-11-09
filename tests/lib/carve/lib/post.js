/* SPDX-License-Identifier: Apache-2.0 */
/**
 * post.js — the toolpaths as G-code, through a post-processor you can edit (lib/carve). DOM-free.
 *   POSTS                     the built-in posts: grbl, linuxcnc, mach3, fanuc (generic dialects: check the first run on your machine)
 *   cleanPost(o)              an untrusted post (a file, the panel) → a safe one
 *   gcode(ops, job, post)     → { text, lines, stats }
 *     job  = { unit: 'mm' | 'in', safeZ (10), clearZ (2), feed (XY, mm/min), plunge (mm/min), rpm, name }, each op may carry its own feed / plunge / rpm / number / name
 *     post = { id, name, header[], toolChange[], spindleOn, spindleOff, footer[], comment: 'paren' | 'semi' | 'none', decimals, lineNumbers, modal }
 *   The text lines of a post are templates with {rpm} {tool} {name} {safe} {feed} {unit}; {safe} is the safe Z in the job's unit.
 *   parseGcode(text) → [{ line, g, x, y, z, f, s, raw }]  the moves back out of a program (modal words filled in): what the checker and the tests read.
 */
export const POSTS = {
  grbl: { id: 'grbl', name: 'GRBL (hobby routers and lasers)', header: ['G21', 'G90', 'G17', 'G94'], toolChange: ['M5', 'M0 (Change to {name}, then press resume)'], spindleOn: 'M3 S{rpm}', spindleOff: 'M5', footer: ['M5', 'G0 Z{safe}', 'G0 X0 Y0', 'M2'], comment: 'paren', decimals: 3, lineNumbers: false, modal: true },
  linuxcnc: { id: 'linuxcnc', name: 'LinuxCNC', header: ['G21', 'G90', 'G17', 'G94', 'G54'], toolChange: ['M5', 'T{tool} M6', 'G43 H{tool}'], spindleOn: 'M3 S{rpm}', spindleOff: 'M5', footer: ['M5', 'G0 Z{safe}', 'M2'], comment: 'paren', decimals: 4, lineNumbers: false, modal: true },
  mach3: { id: 'mach3', name: 'Mach3', header: ['G21', 'G90', 'G17', 'G94', 'G54'], toolChange: ['M5', 'T{tool} M6'], spindleOn: 'M3 S{rpm}', spindleOff: 'M5', footer: ['M5', 'G0 Z{safe}', 'M30'], comment: 'paren', decimals: 4, lineNumbers: false, modal: true },
  fanuc: { id: 'fanuc', name: 'Fanuc style', header: ['G21 G90 G17 G94 G80 G40 G49', 'G54'], toolChange: ['M5', 'T{tool} M6', 'G43 H{tool} Z{safe}'], spindleOn: 'M3 S{rpm}', spindleOff: 'M5', footer: ['M5', 'G91 G28 Z0', 'G90', 'M30'], comment: 'paren', decimals: 3, lineNumbers: true, modal: true },
};
const line = (s, n = 200) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
export function cleanPost(o) {
  const base = POSTS[o && o.id] || POSTS.grbl;
  const arr = (v, d) => (Array.isArray(v) ? v.slice(0, 40).map((x) => line(x)) : d.slice());
  return {
    id: /^[a-z0-9_-]{1,24}$/i.test(String(o && o.id)) ? String(o.id) : base.id, name: line((o && o.name) || base.name, 60),
    header: arr(o && o.header, base.header), toolChange: arr(o && o.toolChange, base.toolChange), footer: arr(o && o.footer, base.footer),
    spindleOn: line((o && o.spindleOn) ?? base.spindleOn), spindleOff: line((o && o.spindleOff) ?? base.spindleOff),
    comment: ['paren', 'semi', 'none'].includes(o && o.comment) ? o.comment : base.comment,
    decimals: Number.isInteger(o && o.decimals) && o.decimals >= 1 && o.decimals <= 6 ? o.decimals : base.decimals,
    lineNumbers: !!(o && o.lineNumbers !== undefined ? o.lineNumbers : base.lineNumbers), modal: o && o.modal !== undefined ? !!o.modal : base.modal,
  };
}

export function gcode(ops, job = {}, postIn = POSTS.grbl) {
  const post = cleanPost(postIn);
  const inch = job.unit === 'in', k = inch ? 1 / 25.4 : 1;
  const safe = Number(job.safeZ) > 0 ? Number(job.safeZ) : 10, clear = Number(job.clearZ) >= 0 ? Number(job.clearZ) : 2;
  const feedDef = Number(job.feed) > 0 ? Number(job.feed) : 1000, plungeDef = Number(job.plunge) > 0 ? Number(job.plunge) : 300, rpmDef = Number(job.rpm) > 0 ? Number(job.rpm) : 12000;
  const out = [];
  let no = 10;
  const fmt = (v) => { const t = (v * k).toFixed(post.decimals); return t.replace(/\.?0+$/, '') || '0'; };
  const emit = (s) => { if (!s) return; out.push(post.lineNumbers ? 'N' + (no += 10) + ' ' + s : s); };
  const note = (s) => { const t = line(s, 120).replace(/[()]/g, ''); if (post.comment === 'paren') emit('(' + t + ')'); else if (post.comment === 'semi') emit('; ' + t); };
  const sub = (tpl, v) => line(tpl).replace(/\{(rpm|tool|name|safe|feed|unit)\}/g, (_, key) => (key === 'safe' ? fmt(safe) : key === 'unit' ? (inch ? 'in' : 'mm') : String(v[key] ?? '')));
  if (post.lineNumbers) out.push('%', 'O0001');
  note(job.name || 'Carving');
  for (const l of post.header) emit(sub(l, {}).replace(/\bG2[01]\b/g, inch ? 'G20' : 'G21'));
  let last = { g: null, x: null, y: null, z: null, f: null };
  const move = (g, x, y, z, f) => {
    const w = [];
    if (!post.modal || last.g !== g) w.push('G' + g);
    if (x !== null && (!post.modal || last.x !== fmt(x))) w.push('X' + fmt(x));
    if (y !== null && (!post.modal || last.y !== fmt(y))) w.push('Y' + fmt(y));
    if (z !== null && (!post.modal || last.z !== fmt(z))) w.push('Z' + fmt(z));
    if (g === 1 && f !== null && (!post.modal || last.f !== String(Math.round(f * k)))) w.push('F' + Math.round(f * k));
    if (w.length === (w[0] === 'G' + g ? 1 : 0)) return;
    emit(w.join(' '));
    last = { g, x: x !== null ? fmt(x) : last.x, y: y !== null ? fmt(y) : last.y, z: z !== null ? fmt(z) : last.z, f: g === 1 && f !== null ? String(Math.round(f * k)) : last.f };
  };
  let length = 0, rapidLen = 0, cutLen = 0, time = 0, toolNo = 0, moves = 0;
  let pos = [0, 0, safe];
  const goto = (g, x, y, z, f) => { const d = Math.hypot(x - pos[0], y - pos[1], z - pos[2]); if (g === 0) { rapidLen += d; time += d / 5000; } else { cutLen += d; time += d / Math.max(1, f); } length += d; pos = [x, y, z]; moves++; move(g, x, y, z, f); };
  for (const op of ops) {
    if (!op.paths || !op.paths.length) continue;
    toolNo = Number.isInteger(op.number) && op.number > 0 ? op.number : toolNo + 1;
    const v = { rpm: op.rpm || rpmDef, tool: toolNo, name: line(op.name || (op.tool.type + ' ' + (op.tool.dia ? op.tool.dia + ' mm' : op.tool.angle + ' deg')), 60), feed: op.feed || feedDef };
    const feed = Number(op.feed) > 0 ? Number(op.feed) : feedDef, plunge = Number(op.plunge) > 0 ? Number(op.plunge) : plungeDef;
    note('Operation ' + op.id + ': ' + v.name);
    for (const l of post.toolChange) emit(sub(l, v));
    last = { g: null, x: null, y: null, z: null, f: null };
    emit(sub(post.spindleOn, v));
    goto(0, pos[0], pos[1], safe);
    for (const p of op.paths) {
      const a = p[0];
      goto(0, a[0], a[1], pos[2] < clear ? clear : pos[2] > safe ? safe : Math.max(pos[2], clear));   // across at the clearance height
      if (a[2] < clear) { goto(1, a[0], a[1], Math.min(0, clear), plunge); goto(1, a[0], a[1], a[2], plunge); }
      for (let i = 1; i < p.length; i++) goto(1, p[i][0], p[i][1], p[i][2], feed);
      goto(0, p[p.length - 1][0], p[p.length - 1][1], clear);
    }
    goto(0, pos[0], pos[1], safe);
    emit(sub(post.spindleOff, v));
  }
  for (const l of post.footer) emit(sub(l, {}));
  if (post.lineNumbers) out.push('%');
  return { text: out.join('\n') + '\n', lines: out.length, stats: { length, rapid: rapidLen, cut: cutLen, minutes: time, moves, tools: toolNo } };
}

const WORD = /([A-Za-z])\s*(-?\d*\.?\d+)/g;
export function parseGcode(text) {
  const moves = [];
  let g = null, x = null, y = null, z = null, f = null, s = null, mm = true;
  String(text).split(/\r?\n/).forEach((raw, idx) => {
    const code = raw.replace(/\([^)]*\)/g, '').replace(/;.*$/, '').replace(/^N\d+\s*/i, '').trim();
    if (!code || code === '%') return;
    let moved = false, mg = null;
    for (const m of code.matchAll(WORD)) {
      const c = m[1].toUpperCase(), v = parseFloat(m[2]);
      if (c === 'G') { if (v === 20) mm = false; else if (v === 21) mm = true; else if (v === 0 || v === 1) { g = v; mg = v; } }
      else if (c === 'X') { x = v; moved = true; } else if (c === 'Y') { y = v; moved = true; } else if (c === 'Z') { z = v; moved = true; }
      else if (c === 'F') f = v; else if (c === 'S') s = v;
    }
    if (moved && g !== null) moves.push({ line: idx + 1, g, x, y, z, f, s, mm, raw: raw.trim(), explicit: mg !== null });
  });
  return moves;
}
