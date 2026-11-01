/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — geometry and file-format code; the words are the host's (pic.* keys). */
/**
 * picture.js — pictures as backgrounds (0.8 D8.8, session d88_PART_3; canonical in lib/picture, rule 39: a host carries a byte copy, nobody edits a copy).
 * A PNG, JPEG or WebP placed under a 2D drawing: sized by two picked points and a distance, moved, turned, faded and locked. DOM-free, no
 * imports. Plan millimetres, anticlockwise angles in degrees, the picture's position is its CENTRE (so turning and fading stay in place).
 * The host owns drawing it (canvas), saving it (BimCraft: IfcAnnotation + CadCraft_Picture) and the words; the keys are neutral (pic.*).
 *
 *   sniff(bytes) → { kind: 'png'|'jpeg'|'webp', mime, w, h } | null        the type and pixel size from the header alone
 *   makePicture({ name, mime, w, h, x, y, mmPerPx, angle, opacity, locked, scaled, hidden }) → picture (clean numbers; defaults: 20 m wide at (0, 0))
 *   corners(pic) → [[x, y] ×4]           lower-left, lower-right, upper-right, upper-left of the picture as placed
 *   matrix(pic) → [a, b, c, d, e, f]     canvas transform: picture pixels (x right, y DOWN) → plan mm (y up)
 *   hit(pic, p) → boolean · toPicture(pic, p) → [px, py]
 *   scaleByPoints(pic, a, b, mm) → patch   a and b are two points of the picture (plan mm) that are `mm` apart in the world: scales about a
 *   moveBy(pic, dx, dy) · moveByPoints(pic, from, to) · turn(pic, deg) · fade(pic, 0..1) · lock(pic, bool) → patch   (each refuses when locked)
 *   fitTo(pic, [x0, y0, x1, y1]) → patch   centred in a box (the plan's view), unscaled
 *   toBase64(bytes) · fromBase64(text) · chunks(text, n) · join(parts)   the picture's bytes as text properties of 30 000 characters
 *   shrink(w, h, maxSide) → { w, h, k }    the size a picture is brought down to when it is too big to keep (the host draws it again)
 *   pictureProblems(pics, { t }) → [problem]   shared Problems (docs/0.8-PROBLEMS-SPEC.md): missing / unreadable bytes, not scaled yet
 *   LIMITS = { keepBytes, maxSide, minOpacity, perLevel, embedBytes }
 *
 * Round 3 (d88b_PART_3): a picture is on a plane. plane 'level' (default): the level's plan, x/y/angle in plan mm. plane 'vertical': a section
 * line a → b (plan points of the level, mm) standing up from the level; x is the distance along the line from a, y the height above the level
 * (the picture's CENTRE), angle turns it in its own plane. The same maths (matrix, scale, move, turn) works in the plane's own (u, v) mm.
 *   frame(pic) → { o: [x, y, z], u: [x, y, z], v: [x, y, z] }   the plane's origin and axes in level-local mm (Z up)
 *   corners3d(pic) → [[x, y, z] ×4]       the four corners in level-local mm (same order as corners)
 *   makePicture also keeps `section` (the GlobalId of the host's section line the vertical picture was placed on; '' when two points were picked)
 *   onLine(pic, a, b) → patch             put the picture on the vertical plane over the line a → b: as wide as the line, standing on the level
 *   setWidth(pic, mm) · setPlace(pic, along, height) → patch    the vertical plane's size and place, typed
 */
export const LIMITS = { keepBytes: 6 * 1024 * 1024, maxSide: 4096, minOpacity: 0.05, chunk: 30000, perLevel: 8, embedBytes: 512 * 1024 };

const refuse = (key) => { throw Object.assign(new Error(key), { key }); };
const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const r6 = (v) => Math.round(v * 1e6) / 1e6;

/** The type and pixel size of a PNG, JPEG or WebP from its first bytes; null for anything else (or a header that is cut). */
export function sniff(b) {
  if (!b || b.length < 12) return null;
  const u32 = (o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b.length >= 24 && u32(12) === 0x49484452) {
    const w = u32(16), h = u32(20);
    return w && h ? { kind: 'png', mime: 'image/png', w, h } : null;
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let o = 2;
    while (o + 9 < b.length) {
      if (b[o] !== 0xff) { o++; continue; }
      const m = b[o + 1];
      if (m === 0xff) { o++; continue; }
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { o += 2; continue; }
      const len = (b[o + 2] << 8) | b[o + 3];
      if ((m >= 0xc0 && m <= 0xcf) && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {   // a start-of-frame marker
        const h = (b[o + 5] << 8) | b[o + 6], w = (b[o + 7] << 8) | b[o + 8];
        return w && h ? { kind: 'jpeg', mime: 'image/jpeg', w, h } : null;
      }
      if (len < 2) return null;
      o += 2 + len;
    }
    return null;
  }
  const tag = (o) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
  if (tag(0) === 'RIFF' && tag(8) === 'WEBP' && b.length >= 30) {
    const k = tag(12);
    if (k === 'VP8X') { const w = 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), h = 1 + (b[27] | (b[28] << 8) | (b[29] << 16)); return { kind: 'webp', mime: 'image/webp', w, h }; }
    if (k === 'VP8 ' && b[23] === 0x9d && b[24] === 0x01 && b[25] === 0x2a) return { kind: 'webp', mime: 'image/webp', w: (b[26] | (b[27] << 8)) & 0x3fff, h: (b[28] | (b[29] << 8)) & 0x3fff };
    if (k === 'VP8L' && b[20] === 0x2f) { const v = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24); return { kind: 'webp', mime: 'image/webp', w: 1 + (v & 0x3fff), h: 1 + ((v >>> 14) & 0x3fff) }; }
  }
  return null;
}

/** A picture record with clean numbers. Defaults: 20 m wide, centred on (0, 0), not scaled yet, fully opaque, unlocked. */
export function makePicture(o = {}) {
  const w = Math.max(1, Math.round(num(o.w, 1))), h = Math.max(1, Math.round(num(o.h, 1)));
  const mm = num(o.mmPerPx, 0);
  return {
    name: String(o.name || 'picture').slice(0, 120), mime: String(o.mime || 'image/png'), w, h,
    x: r6(num(o.x, 0)), y: r6(num(o.y, 0)), mmPerPx: mm > 0 ? r6(mm) : r6(20000 / w),
    angle: r6(((num(o.angle, 0) % 360) + 360) % 360), opacity: Math.min(1, Math.max(LIMITS.minOpacity, num(o.opacity, 1))),
    locked: !!o.locked, scaled: !!o.scaled, hidden: !!o.hidden,
    ...(o.section ? { section: String(o.section).slice(0, 64) } : {}),   // the section line (a GlobalId) a vertical-plane picture was put on, if it was put on one
    ...(o.plane === 'vertical' && Array.isArray(o.a) && Array.isArray(o.b) ? { plane: 'vertical', a: [r6(num(o.a[0], 0)), r6(num(o.a[1], 0))], b: [r6(num(o.b[0], 0)), r6(num(o.b[1], 0))] } : { plane: 'level' }),
  };
}

/** The plane's origin and axes in level-local mm, Z up. A level picture lies in the plan (u = X, v = Y); a vertical one stands on its line (u along it, v up). */
export function frame(p) {
  if (p.plane !== 'vertical') return { o: [0, 0, 0], u: [1, 0, 0], v: [0, 1, 0] };
  const dx = p.b[0] - p.a[0], dy = p.b[1] - p.a[1], L = Math.hypot(dx, dy) || 1;
  return { o: [p.a[0], p.a[1], 0], u: [dx / L, dy / L, 0], v: [0, 0, 1] };
}
export function corners3d(p) {
  const f = frame(p);
  return corners(p).map(([u, v]) => [0, 1, 2].map((i) => r6(f.o[i] + u * f.u[i] + v * f.v[i])));
}
export function lineLength(a, b) { return Math.hypot(b[0] - a[0], b[1] - a[1]); }
export function onLine(p, a, b) {
  unlocked(p);
  const L = lineLength(a, b);
  if (!(L > 1)) refuse('pic.err.samepoint');
  const k = L / p.w;
  return { plane: 'vertical', a: [r6(a[0]), r6(a[1])], b: [r6(b[0]), r6(b[1])], x: r6(L / 2), y: r6(p.h * k / 2), mmPerPx: r6(k), angle: 0, scaled: true };
}
export function setWidth(p, mm) {
  unlocked(p);
  if (!(mm > 0) || !Number.isFinite(mm)) refuse('pic.err.distance');
  return { mmPerPx: r6(mm / p.w), scaled: true };
}
export function setPlace(p, along, height) { unlocked(p); return { x: r6(num(along, p.x)), y: r6(num(height, p.y)) }; }

/** Lower-left, lower-right, upper-right, upper-left in plan mm. */
export function corners(p) {
  const hw = p.w * p.mmPerPx / 2, hh = p.h * p.mmPerPx / 2, a = p.angle * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [r6(p.x + x * c - y * s), r6(p.y + x * s + y * c)]);
}

/** Canvas transform [a, b, c, d, e, f]: a picture pixel (x right, y down, origin at its top-left) → plan mm. */
export function matrix(p) {
  const k = p.mmPerPx, a = p.angle * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), hw = p.w / 2, hh = p.h / 2;
  // pixel (u, v) → centred (u - hw, hh - v) → scaled → turned → moved
  return [k * c, k * s, k * s, -k * c, p.x + k * (-hw * c - hh * s), p.y + k * (-hw * s + hh * c)].map(r6);
}

/** A plan point in picture pixels (x right, y down). */
export function toPicture(p, q) {
  const a = p.angle * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), dx = q[0] - p.x, dy = q[1] - p.y;
  const lx = (dx * c + dy * s) / p.mmPerPx, ly = (-dx * s + dy * c) / p.mmPerPx;
  return [lx + p.w / 2, p.h / 2 - ly];
}
export function hit(p, q) { const [u, v] = toPicture(p, q); return u >= 0 && v >= 0 && u <= p.w && v <= p.h; }

const unlocked = (p) => { if (p.locked) refuse('pic.err.locked'); };

/** The change that makes two points of the picture `mm` apart: it grows or shrinks about the first, which stays where it is. */
export function scaleByPoints(p, a, b, mm) {
  unlocked(p);
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (!(d > 1e-6)) refuse('pic.err.samepoint');
  if (!(mm > 0) || !Number.isFinite(mm)) refuse('pic.err.distance');
  const k = mm / d;
  return { mmPerPx: r6(p.mmPerPx * k), x: r6(a[0] + (p.x - a[0]) * k), y: r6(a[1] + (p.y - a[1]) * k), scaled: true };
}
export function moveBy(p, dx, dy) { unlocked(p); return { x: r6(p.x + num(dx, 0)), y: r6(p.y + num(dy, 0)) }; }
export function moveByPoints(p, from, to) { return moveBy(p, to[0] - from[0], to[1] - from[1]); }
/** Turn by `deg` about the picture's centre (use setAngle for an absolute angle). */
export function turn(p, deg) { unlocked(p); return { angle: r6((((p.angle + num(deg, 0)) % 360) + 360) % 360) }; }
export function setAngle(p, deg) { unlocked(p); return { angle: r6((((num(deg, 0)) % 360) + 360) % 360) }; }
export function fade(p, v) { return { opacity: Math.min(1, Math.max(LIMITS.minOpacity, num(v, 1))) }; }   // fading is allowed on a locked picture: it changes how it looks, not where it is
export function lock(p, on = true) { return { locked: !!on }; }
export function show(p, on = true) { return { hidden: !on }; }
export function fitTo(p, box) {
  const [x0, y0, x1, y1] = box, bw = Math.abs(x1 - x0), bh = Math.abs(y1 - y0);
  const k = Math.min(bw / p.w, bh / p.h) * 0.9;
  return { x: r6((x0 + x1) / 2), y: r6((y0 + y1) / 2), mmPerPx: r6(k > 0 ? k : p.mmPerPx), scaled: false };
}

/** The picture's size when it must be brought down to `maxSide` pixels on its long side (k = 1 and the same size when it already fits). */
export function shrink(w, h, maxSide = LIMITS.maxSide) {
  const m = Math.max(w, h);
  if (m <= maxSide) return { w, h, k: 1 };
  const k = maxSide / m;
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)), k };
}

// ---- bytes as text (a property of an IFC file is text) ----
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function toBase64(b) {
  let s = '';
  for (let i = 0; i < b.length; i += 3) {
    const n = (b[i] << 16) | ((b[i + 1] || 0) << 8) | (b[i + 2] || 0);
    s += ALPHA[(n >> 18) & 63] + ALPHA[(n >> 12) & 63] + (i + 1 < b.length ? ALPHA[(n >> 6) & 63] : '=') + (i + 2 < b.length ? ALPHA[n & 63] : '=');
  }
  return s;
}
export function fromBase64(text) {
  const t = String(text || '').replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor(t.length * 3 / 4));
  let o = 0;
  for (let i = 0; i < t.length; i += 4) {
    const a = ALPHA.indexOf(t[i]), b = ALPHA.indexOf(t[i + 1]), hasC = i + 2 < t.length, hasD = i + 3 < t.length;
    const c = hasC ? ALPHA.indexOf(t[i + 2]) : 0, d = hasD ? ALPHA.indexOf(t[i + 3]) : 0;
    const n = (a << 18) | (b << 12) | (c << 6) | d;
    if (o < out.length) out[o++] = (n >> 16) & 255;
    if (hasC && o < out.length) out[o++] = (n >> 8) & 255;
    if (hasD && o < out.length) out[o++] = n & 255;
  }
  return out;
}
export function chunks(text, n = LIMITS.chunk) { const out = []; for (let i = 0; i < text.length; i += n) out.push(text.slice(i, i + n)); return out; }
export const join = (parts) => parts.join('');

/** Shared Problems for these pictures (each `pics` entry: a picture plus guid and either `state` ('ok' | 'missing' | 'lost' | 'unreadable') or `bytes` (Uint8Array | null), judged here). */
export function pictureProblems(pics, { t = (k) => k } = {}) {
  const out = [];
  for (const p of pics || []) {
    const about = [{ kind: 'element', id: p.guid, label: p.name }];
    const base = { part: p.guid, about, source: { name: 'picture' } };
    const st = p.state || (!p.bytes || !p.bytes.length ? 'missing' : sniff(p.bytes) ? 'ok' : 'unreadable');
    if (st === 'missing') {
      out.push({ ...base, code: 'pic.missing', severity: 'warning', msg: { key: 'pic.prob.missing', vars: { name: p.name } }, text: t('pic.prob.missing', { name: p.name }) });
      continue;
    }
    if (st === 'lost') {
      out.push({ ...base, code: 'pic.lost', severity: 'warning', msg: { key: 'pic.prob.lost', vars: { name: p.name } }, text: t('pic.prob.lost', { name: p.name }) });
      continue;
    }
    if (st === 'unreadable') { out.push({ ...base, code: 'pic.unreadable', severity: 'warning', msg: { key: 'pic.prob.unreadable', vars: { name: p.name } }, text: t('pic.prob.unreadable', { name: p.name }) }); continue; }
    if (!p.scaled) out.push({ ...base, code: 'pic.unscaled', severity: 'note', msg: { key: 'pic.prob.unscaled', vars: { name: p.name } }, text: t('pic.prob.unscaled', { name: p.name }) });
  }
  return out;
}
