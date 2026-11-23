#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-zeman.mjs — the Zeman export add-on's DOM-free module (detailcraft/dev/addons/zeman/lib/zeman.js; roadmap DC.133).
 *
 *   node tools/detailcraft-test/test-zeman.mjs [--sample <dir>] [--verbose]
 *
 * The format's only source is one customer sample set (default /var/www/CADCRAFT/testfiles/zeman-sample-1972: it is a customer
 * file and is NEVER copied into the repo; without it sections 1 to 3 are skipped and the run says so and exits 2).
 *  1. The XML, byte for byte: the sample's file read and written back gives the same bytes (order, names, numbers, BOM, CRLF, tail).
 *  2. The frame convention, from the sample alone (no DetailCraft code): each NC file's contour, laid out by its FRAME, is the solid
 *     the sample's reference IFC has for that part, for all 8 parts; the holes are where the IFC's bolts go through.
 *  3. The module's frame maths: DetailCraft-shaped parts made from the IFC solids give the sample's BASE / RX / RY for all 8 parts,
 *     and its Length / Width / Height.
 *  4. A DetailCraft model (the sample frame's column with a base plate and stiffeners) through the real nc1.js: the file set,
 *     shared NC files, every frame laid back onto the part it came from.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SAMPLE = opt('--sample', '/var/www/CADCRAFT/testfiles/zeman-sample-1972');
const VERBOSE = args.includes('--verbose');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);

const Z = await load('addons/zeman/lib/zeman.js');
let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? '\n       ' + extra : '')); } };
const section = (s) => console.log('\n' + s);
const add = (a, b) => a.map((v, i) => v + b[i]), sub = (a, b) => a.map((v, i) => v - b[i]), mul = (a, s) => a.map((v) => v * s);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = Z.cross;
const dist = (a, b) => Math.hypot(...sub(a, b));
const same3 = (a, b, tol = 0.011) => dist(a, b) <= tol;

// ------------------------------------------------------------------ the number and text rules (no sample needed)
section('Numbers and text');
ok(Z.num(4000) === '4000' && Z.num(559.6) === '559.6' && Z.num(98.65) === '98.65' && Z.num(-20) === '-20' && Z.num(-0) === '0' && Z.num(-0.001) === '0' && Z.num(16.8000000001) === '16.8' && Z.num(2.5500000000001) === '2.55',
  'numbers are the shortest decimal text, two decimals at most, never -0');
ok(Z.attr('A & B "x" <y>') === 'A &amp; B &quot;x&quot; &lt;y&gt;', 'attribute text is escaped');
ok(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(Z.uuidFor('job|m1')) && Z.uuidFor('job|m1') === Z.uuidFor('job|m1') && Z.uuidFor('job|m1') !== Z.uuidFor('job|m2'), 'ids have the sample\'s UUID shape, the same for the same part, different for another');
ok(Z.fileSafe('C1') === 'C1' && Z.fileSafe('2-B1') === '2-B1' && Z.fileSafe('a/b:c') === 'a_b_c' && Z.fileSafe('..') === '_', 'file names keep marks and drop path characters');

// ------------------------------------------------------------------ the sample
const have = fs.existsSync(path.join(SAMPLE, 'C1/C1.Xml'));
if (!have) console.log('\nThe sample set is not at ' + SAMPLE + ': sections 1 to 3 (everything that checks the format against the sample) were SKIPPED.');
let sampleWia = null;
if (have) {
  const xmlBytes = fs.readFileSync(path.join(SAMPLE, 'C1/C1.Xml'));
  const xmlText = xmlBytes.toString('utf8');
  const wia = sampleWia = Z.readWia(xmlText);

  section('1. The XML, byte for byte against the sample');
  {
    ok(xmlBytes[0] === 0xef && xmlBytes[1] === 0xbb && xmlBytes[2] === 0xbf, 'the sample starts with a UTF-8 byte order mark');
    const lines = xmlText.slice(1).split('\r\n');
    ok(lines[0] === '<?xml version="1.0" encoding="utf-8"?>' && lines[1] === '<>' && lines[2] === '<WIA VERSION="1.0">', 'its first three lines: the declaration, the "<>" line, <WIA VERSION="1.0">');
    ok(!/[^\r]\n/.test(xmlText) && !xmlText.endsWith('\n') && xmlText.endsWith('</WIA>'), 'CRLF line ends throughout, none after </WIA>');
    ok(wia.parts.length === 8 && wia.parts[0].leading && wia.parts.slice(1).every((p) => !p.leading && p.type === 'ATTACHED_PART') && wia.parts.every((p) => p.representation === 'REFERENCE' && p.dataType === 'DSTV-NC'),
      '8 parts, the leading part first, every one REFERENCE / DSTV-NC');
    const out = Buffer.from(Z.wiaXml(wia), 'utf8');
    const firstDiff = (() => { for (let i = 0; i < Math.max(out.length, xmlBytes.length); i++) if (out[i] !== xmlBytes[i]) return i; return -1; })();
    ok(out.equals(xmlBytes), 'written back from its values the file is the sample\'s ' + xmlBytes.length + ' bytes exactly', firstDiff >= 0 ? 'first difference at byte ' + firstDiff + ': ' + JSON.stringify(out.subarray(Math.max(0, firstDiff - 30), firstDiff + 30).toString()) + ' vs ' + JSON.stringify(xmlBytes.subarray(Math.max(0, firstDiff - 30), firstDiff + 30).toString()) : '');
    ok(wia.camber === '0.000' && wia.revision === '' && wia.quantity === 1, 'Camber "0.000", REVISION "", Quantity 1 (what the sample has)');
    const files = [...new Set(wia.parts.map((p) => p.file))];
    ok(files.join() === 'C1.nc,1.nc,2.nc,3.nc,4.nc' && files.every((f) => fs.existsSync(path.join(SAMPLE, 'C1', f))), 'the 8 parts name 5 NC files, all in the folder: identical parts share one');
    ok(files.every((f) => { const t = fs.readFileSync(path.join(SAMPLE, 'C1', f), 'latin1').split('\r\n'); return t[1] === '** ' + f && t[3].trim() === f.replace(/\.nc$/, '') && t[5].trim() === f.replace(/\.nc$/, ''); }), 'each NC file\'s comment line names the file, and its drawing and piece lines are the file name');
  }

  // ---- the NC files and the IFC, read here with nothing from DetailCraft
  const readNc = (file) => {
    const L = fs.readFileSync(path.join(SAMPLE, 'C1', file), 'latin1').split('\r\n');
    const h = L.slice(2, 26).map((s) => s.trim());
    const nc = { code: h[7], length: +h[8], height: +h[9], flange: +h[10], tw: +h[12], ak: [], bo: [] };
    let cur = null;
    for (const l of L.slice(26)) {
      if (/^[A-Z]{2}$/.test(l)) { cur = l; if (l === 'AK') nc.ak.push([]); continue; }
      const m = l.match(/^\s+([vohu])\s+(.*)$/);
      if (!m) continue;
      const tok = m[2].trim().split(/\s+/);
      const n = tok.map((s) => parseFloat(s));
      if (cur === 'AK') nc.ak[nc.ak.length - 1].push({ face: m[1], x: n[0], y: n[1] });
      if (cur === 'BO') { const slot = /l$/.test(tok[3]); nc.bo.push({ face: m[1], x: n[0] + (slot ? n[4] / 2 : 0), y: n[1] + (slot ? n[5] / 2 : 0), d: n[2], slot }); }   // a slot: its middle
    }
    return nc;
  };
  const ifc = (() => {
    const text = fs.readFileSync(path.join(SAMPLE, 'C1.ifc'), 'latin1');
    const E = new Map();
    for (const m of text.matchAll(/#(\d+)= ([A-Z0-9]+)\(([\s\S]*?)\);\s*\n/g)) E.set(+m[1], { type: m[2], a: parseArgs(m[3]) });
    function parseArgs(s) {
      const out = []; let i = 0;
      const list = () => { const a = []; while (i < s.length) { const c = s[i]; if (c === ')') { i++; return a; } if (c === ',' || c === ' ' || c === '\n' || c === '\r') { i++; continue; } a.push(value()); } return a; };
      const value = () => {
        const c = s[i];
        if (c === '(') { i++; return list(); }
        if (c === "'") { let j = i + 1; while (j < s.length && !(s[j] === "'" && s[j + 1] !== "'")) j += s[j] === "'" ? 2 : 1; const v = s.slice(i + 1, j); i = j + 1; return v; }
        let j = i; let depth = 0;
        while (j < s.length && (depth > 0 || (s[j] !== ',' && s[j] !== ')'))) { if (s[j] === '(') depth++; if (s[j] === ')') depth--; j++; }
        const tok = s.slice(i, j).trim(); i = j;
        if (tok[0] === '#') return { ref: +tok.slice(1) };
        if (tok === '$' || tok === '*') return null;
        return /^[-+0-9.]/.test(tok) ? parseFloat(tok) : tok;
      };
      while (i < s.length) { if (s[i] === ',' || /\s/.test(s[i])) { i++; continue; } out.push(value()); }
      return out;
    }
    const get = (r) => E.get(r.ref);
    const vec = (r) => get(r).a[0];
    const I = { o: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
    const norm = (v) => mul(v, 1 / Math.hypot(...v));
    const a2p = (r) => { if (!r) return I; const e = get(r), z = e.a[1] ? norm(vec(e.a[1])) : [0, 0, 1]; let x = e.a[2] ? vec(e.a[2]) : [1, 0, 0]; x = norm(sub(x, mul(z, dot(x, z)))); return { o: vec(e.a[0]), x, y: cross(z, x), z }; };
    const pt = (f, p) => add(add(add(f.o, mul(f.x, p[0])), mul(f.y, p[1])), mul(f.z, p[2] || 0));
    const dirOf = (f, d) => add(add(mul(f.x, d[0]), mul(f.y, d[1])), mul(f.z, d[2] || 0));
    const compose = (f, g) => ({ o: pt(f, g.o), x: dirOf(f, g.x), y: dirOf(f, g.y), z: dirOf(f, g.z) });
    const placement = (r) => { if (!r) return I; const e = get(r); return compose(placement(e.a[0]), a2p(e.a[1])); };
    const items = (prod) => get(get(get(prod.a[6]).a[2][0]).a[3][0] ? get(prod.a[6]).a[2][0] : null).a[3];
    return { E, get, vec, a2p, pt, dirOf, compose, placement, items };
  })();

  /** The IFC's solids, as world corner points, by the id the XML uses (the IFC tag is "ID<uuid>"; the column's tag is its mark). */
  const solids = new Map();
  let columnSolid = null;
  for (const [, e] of ifc.E) {
    if (e.type !== 'IFCPLATE' && e.type !== 'IFCCOLUMN') continue;
    const P = ifc.placement(e.a[5]);
    let item = ifc.get(ifc.items(e)[0]), clip = null;
    if (item.type === 'IFCBOOLEANCLIPPINGRESULT') { clip = ifc.get(item.a[2]); item = ifc.get(item.a[1]); }
    const prof = ifc.get(item.a[0]), F = ifc.compose(P, ifc.a2p(item.a[1])), depth = item.a[3], ext = ifc.dirOf(F, ifc.vec(item.a[2]));
    let poly;
    if (prof.type === 'IFCISHAPEPROFILEDEF') { const w = prof.a[3] / 2, d = prof.a[4] / 2; poly = [[-w, -d], [w, -d], [w, d], [-w, d]]; }
    else { poly = ifc.get(prof.a[2]).a[0].map((r) => ifc.vec(r)); poly.pop(); }
    let pts = [];
    for (const k of [0, depth]) for (const p of poly) pts.push(add(ifc.pt(F, [p[0], p[1], 0]), mul(ext, k)));
    if (clip) {   // IfcHalfSpaceSolid, agreement .T.: what lies on the side the plane's normal points away from is cut off
      const pl = ifc.compose(P, ifc.a2p(ifc.get(clip.a[0]).a[0]));
      pts = pts.map((q) => { const s = dot(sub(q, pl.o), pl.z); return s < 0 ? add(q, mul(ext, -s / dot(ext, pl.z))) : q; });
    }
    const rec = { type: e.type, name: e.a[2], pts, axes: { o: F.o, x: F.x, y: F.y, z: ext }, depth, poly };
    if (e.type === 'IFCCOLUMN') columnSolid = rec; else solids.set(String(e.a[7]).replace(/^ID/, ''), rec);
  }
  /** Every bolt of the IFC as a line: a point and a direction (the fastener's own y axis, as its solids are extruded). */
  const boltLines = [];
  for (const [, e] of ifc.E) {
    if (e.type !== 'IFCMECHANICALFASTENER') continue;
    const P = ifc.placement(e.a[5]);
    for (const r of ifc.items(e)) { const op = ifc.get(ifc.get(r).a[1]); boltLines.push({ p: ifc.pt(P, ifc.vec(op.a[2])), d: P.y }); }
  }
  const boxOf = (pts) => { const lo = [0, 1, 2].map((i) => Math.min(...pts.map((p) => p[i]))), hi = [0, 1, 2].map((i) => Math.max(...pts.map((p) => p[i]))); return { lo, hi, c: mul(add(lo, hi), 0.5) }; };
  const sameSet = (A, B, tol = 0.02) => A.length === B.length && A.every((a) => B.some((b) => dist(a, b) <= tol));

  section('2. The frame convention, from the sample alone: NC contour + FRAME = the IFC solid, 8 parts');
  let leadWorld = null;
  {
    ok(solids.size === 7 && !!columnSolid && wia.parts.slice(1).every((p) => solids.has(p.id)), 'the IFC has the column and the 7 attached parts, found by the ids the XML carries');
    ok(boltLines.length === 4 + 3 + 3 + 3 + 4, 'and ' + boltLines.length + ' bolts (they are not in the XML)');
    const nc = new Map([...new Set(wia.parts.map((p) => p.file))].map((f) => [f, readNc(f)]));
    // the leading part's own system in the world: one of the 4 right-handed systems on a corner of the column's box with x along the column
    const cb = columnSolid, ex = cb.axes.z, ey = cb.axes.y, ez = cb.axes.x;   // extrusion, the profile's depth axis, its width axis
    const ext = (v) => { const s = cb.pts.map((p) => dot(p, v)); return [Math.min(...s), Math.max(...s)]; };
    const cands = [];
    for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) {
      const x = mul(ex, sx), y = mul(ey, sy), z = mul(ez, sz);
      if (dot(cross(x, y), z) < 0.5) continue;
      const ox = sx > 0 ? ext(ex)[0] : ext(ex)[1], oy = sy > 0 ? ext(ey)[0] : ext(ey)[1], oz = sz > 0 ? ext(ez)[0] : ext(ez)[1];
      cands.push({ o: add(add(mul(ex, ox), mul(ey, oy)), mul(ez, oz)), x, y, z });
    }
    ok(cands.length === 4, '4 right-handed systems can sit on the column\'s box with x along it');
    const lay = (L, part, n) => {   // the NC contour of a part, both faces, laid out by its FRAME in the leading system L
      const rz = cross(part.rx, part.ry), out = [];
      for (const k of [0, n.tw]) for (const q of n.ak[0].slice(0, -1)) {
        const inLead = add(add(add(part.base, mul(part.rx, q.x)), mul(part.ry, q.y)), mul(rz, k));
        out.push(add(add(add(L.o, mul(L.x, inLead[0])), mul(L.y, inLead[1])), mul(L.z, inLead[2])));
      }
      return out;
    };
    const fits = cands.filter((L) => wia.parts.slice(1).every((p) => sameSet(lay(L, p, nc.get(p.file)), solids.get(p.id).pts)));
    ok(fits.length === 1, 'exactly one of them lays all 7 attached parts\' NC contours, by their FRAMEs, onto their IFC solids (' + fits.length + ')');
    leadWorld = fits[0] || cands[0];
    const c1 = nc.get('C1.nc');
    const cs = [0, 1].flatMap((i) => [0, 1].flatMap((j) => [0, 1].map((k) => add(add(add(leadWorld.o, mul(leadWorld.x, i * c1.length)), mul(leadWorld.y, j * c1.height)), mul(leadWorld.z, k * c1.flange)))));
    ok(sameSet(cs, cb.pts), 'in that system the leading part\'s own NC box (3980 x 354 x 205 from 0 0 0, RX = x, RY = y) is the IFC column: y is the depth, z the flange width');
    ok(same3(leadWorld.x, [0, 0, 1], 1e-9) && same3(leadWorld.o, [6102.5, -177, 20], 1e-6), 'x runs up the column from its cut (lower) end; the zero point is the corner at world 6102.5, -177, 20');
    for (const p of wia.parts.slice(1)) {
      const n = nc.get(p.file), rz = cross(p.rx, p.ry);
      ok(sameSet(lay(leadWorld, p, n), solids.get(p.id).pts), p.name + ' ' + p.id.slice(0, 8) + ' (' + p.file + '): contour at BASE along RX, RY, thickness ' + n.tw + ' along RX x RY = its IFC solid');
      for (const h of n.bo) {
        const inLead = add(add(p.base, mul(p.rx, h.x)), mul(p.ry, h.y));
        const w = add(add(add(leadWorld.o, mul(leadWorld.x, inLead[0])), mul(leadWorld.y, inLead[1])), mul(leadWorld.z, inLead[2]));
        const nrm = add(add(mul(leadWorld.x, rz[0]), mul(leadWorld.y, rz[1])), mul(leadWorld.z, rz[2]));
        const hit = boltLines.some((b) => Math.abs(Math.abs(dot(b.d, nrm)) - 1) < 1e-9 && Math.hypot(...cross(sub(w, b.p), b.d)) < 0.05);
        ok(hit, '  its hole at ' + h.x + ', ' + h.y + (h.slot ? ' (a slot\'s middle)' : '') + ' has an IFC bolt going through it');
      }
    }
    const stiff = wia.parts.filter((p) => p.file === '4.nc');
    ok(stiff.length === 2 && same3(stiff[0].rx, mul(stiff[1].rx, -1)) && same3(stiff[0].ry, mul(stiff[1].ry, -1)), 'the two stiffeners share 4.nc with opposite RX and RY: one NC file, the piece turned over');
  }

  section('3. The module\'s frame maths: parts made from the IFC solids give the sample\'s BASE, RX, RY');
  {
    const nc = new Map([...new Set(wia.parts.map((p) => p.file))].map((f) => [f, readNc(f)]));
    // DetailCraft's shape of a part: frame { o (the cut start, on the section's centre), x, u, v }, (u, v, x) right-handed, length, profile
    const candidates = (solid, n, kind) => {
      const b = boxOf(solid.pts), out = [];
      const A = [solid.axes.x, solid.axes.y, solid.axes.z];
      const extent = (v) => { const s = solid.pts.map((p) => dot(p, v)); return Math.max(...s) - Math.min(...s); };
      for (const x0 of A) for (const u0 of A) for (const sx of [1, -1]) for (const su of [1, -1]) {
        if (Math.abs(dot(x0, u0)) > 1e-9) continue;
        const x = mul(x0, sx), u = mul(u0, su), v = cross(x, u);
        const L = extent(x), eu = extent(u), ev = extent(v);
        const profile = kind === 'I' ? { kind: 'I', d: ev, bf: eu } : { kind: 'PL', b: eu, t: ev };
        const want = kind === 'I' ? [n.length, n.flange, n.height] : [n.length, n.height, n.tw];
        if (Math.abs(L - want[0]) > 0.011 || Math.abs(eu - want[1]) > 0.011 || Math.abs(ev - want[2]) > 0.011) continue;
        out.push({ id: 'x', frame: { o: sub(b.c, mul(x, L / 2)), x, u, v, len: L }, voff: 0, length: L, profile, holes: [] });
      }
      return out;
    };
    const leads = candidates(columnSolid, nc.get('C1.nc'), 'I');
    ok(leads.length === 4, 'the IFC column can be a DetailCraft I-shape 4 ways (up or down, turned about its axis)');
    const leadPart = leads.find((p) => { const f = Z.ncFrame(p); return same3(f.o, leadWorld.o, 1e-6) && same3(f.x, leadWorld.x, 1e-9) && same3(f.y, leadWorld.y, 1e-9) && same3(f.z, leadWorld.z, 1e-9); });
    ok(!!leadPart, 'for one of them ncFrame() is exactly the leading system section 2 found: zero point at (0, u = +bf/2, v = -d/2), axes x, v, -u');
    const lead = Z.ncFrame(leadPart || leads[0]);
    const placed = [{ part: leadPart || leads[0], frame: lead }];
    for (const p of wia.parts.slice(1)) {
      const cs = candidates(solids.get(p.id), nc.get(p.file), 'PL');
      const rels = cs.map((c) => ({ c, r: Z.relFrame(lead, Z.ncFrame(c)) }));
      const hit = rels.find(({ r }) => same3(r.base, p.base) && same3(r.rx, p.rx, 1e-9) && same3(r.ry, p.ry, 1e-9));
      ok(!!hit, p.name + ' ' + p.id.slice(0, 8) + ': BASE ' + p.base.join(' ') + ', RX ' + p.rx.join(' ') + ', RY ' + p.ry.join(' ') + ' comes out of relFrame(ncFrame()) (' + cs.length + ' ways to lay the plate, one is the sample\'s)',
        'got ' + rels.map(({ r }) => r.base.map((v) => Z.num(v)).join(' ') + ' / ' + r.rx.map((v) => Z.num(v)).join(' ') + ' / ' + r.ry.map((v) => Z.num(v)).join(' ')).join(' | '));
      if (hit) placed.push({ part: hit.c, frame: Z.ncFrame(hit.c) });
    }
    const box = Z.assemblyBox(lead, placed);
    ok(Z.num(box.length) === '4000' && Z.num(box.width) === '550' && Z.num(box.height) === '559.6', 'assemblyBox(): Length 4000, Width 550, Height 559.6, the sample\'s HEAD (got ' + [box.length, box.width, box.height].map((v) => Z.num(v)).join(', ') + ')');
    // the turned stiffener: the same NC piece laid on the second one by a turn gives the sample's second frame
    const [s1, s2] = wia.parts.filter((p) => p.file === '4.nc');
    const c1 = candidates(solids.get(s1.id), nc.get('4.nc'), 'PL'), c2 = candidates(solids.get(s2.id), nc.get('4.nc'), 'PL');
    const asSample = (c, p) => { const r = Z.relFrame(lead, Z.ncFrame(c)); return same3(r.base, p.base) && same3(r.rx, p.rx, 1e-9) && same3(r.ry, p.ry, 1e-9); };
    const a = c1.find((c) => asSample(c, s1));
    const viaTurn = a && c2.some((c) => Object.keys(Z.TURNS).some((t) => { const r = Z.relFrame(lead, Z.ncFrame(c, t)); return t !== 'id' && same3(r.base, s2.base) && same3(r.rx, s2.rx, 1e-9) && same3(r.ry, s2.ry, 1e-9); }));
    ok(!!viaTurn, 'ncFrame(part, turn) reaches the second stiffener\'s frame from a part that stands the other way');
    // and the whole XML again, this time from the module's own numbers
    const again = Z.wiaXml({ ...wia, length: box.length, width: box.width, height: box.height,
      parts: wia.parts.map((p, i) => (i === 0 ? { ...p, base: [0, 0, 0], rx: [1, 0, 0], ry: [0, 1, 0] } : { ...p, ...Z.relFrame(lead, placed[i].frame) })) });
    ok(placed.length === 8 && Buffer.from(again, 'utf8').equals(fs.readFileSync(path.join(SAMPLE, 'C1/C1.Xml'))), 'the XML written from the computed frames and box is the sample\'s file, byte for byte');
  }
}

// ------------------------------------------------------------------ a DetailCraft model through the real NC writer
section('4. A DetailCraft column with a base plate and stiffeners');
{
  (await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const { sampleModel } = await load('sample.js');
  const { build } = await load('build.js');
  const { markParts } = await load('marks.js');
  const Nc = await load('nc1.js');
  const m = sampleModel();
  const bp = m.state.connections.find((c) => c.type === 'baseplate');
  m.change('Base', (tx) => tx.updateConnection(bp.id, { stiffeners: 4, stiffT: 12, stiffH: 150, washers: 1 }));
  const built = build(m.state), marks = markParts(built);
  const col = built.byId.get(bp.column);
  const doc = { order: m.state.name, built, marks, selection: [col.id], ncRefusal: Nc.ncRefusal, writeNc: Nc.writeNc1 };
  const r = Z.zemanExport(doc);
  const mark = marks.asmMark.get(col.id);
  ok(r.done.length === 1 && r.done[0].mark === mark && r.skipped.length === 0, 'the selected column gives one assembly: ' + mark);
  const names = r.files.map((f) => f.name);
  ok(names[0] === mark + '/' + mark + '.Xml' && names.every((n) => n.startsWith(mark + '/')) && names.slice(1).every((n) => /\.nc$/.test(n)), 'a folder named after the mark with ' + mark + '.Xml and the NC files: ' + names.join(', '));
  const wia = Z.readWia(r.files[0].data);
  const xml = r.files[0].data;
  ok(xml.charCodeAt(0) === 0xfeff && xml.endsWith('</WIA>') && !/[^\r]\n/.test(xml), 'the XML has the sample\'s start, line ends and tail');
  // FX.397 (lab pass 133, 2026-11-20): ProFit3D 24.1 refuses a "<>" line 2 and reads the file with the Zeman tool's comment there
  ok(/^<!--File written \d{4}-\d\d-\d\d \d\d:\d\d:\d\d by Zeman Export Tool-->$/.test(xml.split('\r\n')[1]), 'line 2 is "<!--File written <time> by Zeman Export Tool-->" (never "<>"): ' + xml.split('\r\n')[1]);
  {
    const fixed = Z.zemanExport({ ...doc, written: new Date(2026, 10, 19, 15, 19, 22) }).files[0].data.split('\r\n')[1];
    ok(fixed === '<!--File written 2026-11-19 15:19:22 by Zeman Export Tool-->', 'doc.written sets the time on line 2 exactly as the tester\'s working file had it: ' + fixed);
    const parsed = Z.readWia(xml);
    ok(parsed.line2 === xml.split('\r\n')[1] && Z.wiaXml(parsed) === xml, 'read back and written again, the file keeps its own line 2 byte for byte');
  }
  if (sampleWia) {
    const shape = (s) => s.replace(/"[^"]*"/g, '""');
    const mine = xml.split('\r\n'), hers = Z.wiaXml({ ...sampleWia, line2: mine[1] }).split('\r\n');   // line 2 is checked above (the sample's own is "<>")
    ok(mine.slice(0, 14).map(shape).join('\n') === hers.slice(0, 14).map(shape).join('\n') && mine.slice(14, 22).map(shape).join('\n') === hers.slice(14, 22).map(shape).join('\n') && mine.slice(-10).map(shape).join('\n') === hers.slice(-10).map(shape).join('\n'),
      'line for line the same elements and attribute names as the sample (values aside)');
  }
  const subs = built.parts.filter((p) => p.id !== col.id && marks.asmOf.get(p.id) === col.id);
  const welded = subs.filter((p) => !p.loose);
  ok(subs.length - welded.length === 4 && r.loose === 4, 'the 4 plate washers are set on loose: left out, and counted (' + r.loose + ')');
  ok(wia.parts.length === 1 + welded.length && wia.parts[0].leading && wia.parts[0].file === Z.fileSafe(marks.partMark.get(col.id)) + '.nc', '1 leading part + ' + welded.length + ' attached; the leading part\'s NC file is its piece mark');
  ok(new Set(wia.parts.map((p) => p.id)).size === wia.parts.length, 'every part has its own id');
  const ncNames = names.slice(1).map((n) => n.split('/')[1]);
  ok(wia.parts.every((p) => ncNames.includes(p.file)) && ncNames.every((n) => wia.parts.some((p) => p.file === n)) && ncNames.length < wia.parts.length, 'every NC file named is written and every file written is named; identical parts share one (' + ncNames.length + ' files for ' + wia.parts.length + ' parts)');
  ok(r.files.slice(1).every((f) => { const L = f.data.split('\r\n'); return L[0] === 'ST' && L[1] === '** ' + f.name.split('/')[1] && Nc.readNc1(f.data).blocks.at(-1).type === 'EN'; }), 'each is nc1.js\'s DSTV text with the file\'s own name in the comment line, read back by readNc1');
  ok(wia.name === mark && wia.jobNr === m.state.name && wia.mainProfile === col.profileName && wia.mainMaterial === col.material && wia.quantity === marks.assemblies.find((a) => a.mark === mark).count, 'HEAD: the mark, the order, the column\'s profile and material, the assembly\'s quantity');
  ok(Nc.readNc1(r.files[1].data).header.order === wia.jobNr, 'JOB_NR is the order line of the NC files');
  // every frame laid back on the model: the NC box of each part, by its FRAME, is the part's own box in the world
  const lead = Z.ncFrame(col);
  const worldBox = (p) => { const hb = (p.profile.kind === 'I' ? p.profile.bf : p.profile.b) / 2, hv = (p.profile.kind === 'I' ? p.profile.d : p.profile.t) / 2; const out = []; for (const x of [0, p.length]) for (const u of [-hb, hb]) for (const v of [-hv, hv]) out.push(add(add(add(p.frame.o, mul(p.frame.x, x)), mul(p.frame.u, u)), mul(p.frame.v, v + (p.voff || 0)))); return out; };
  const order = [col, ...welded];
  let allFit = true;
  wia.parts.forEach((wp, i) => {
    const p = order[i], n = Nc.readNc1(r.files.find((f) => f.name.endsWith('/' + wp.file)).data).header;
    const size = p.profile.kind === 'I' ? [n.length, n.height, n.flangeWidth] : [n.length, n.height, n.webThickness];
    const rz = cross(wp.rx, wp.ry), pts = [];
    for (const a of [0, size[0]]) for (const b of [0, size[1]]) for (const c of [0, size[2]]) {
      const q = add(add(add(wp.base, mul(wp.rx, a)), mul(wp.ry, b)), mul(rz, c));
      pts.push(add(add(add(lead.o, mul(lead.x, q[0])), mul(lead.y, q[1])), mul(lead.z, q[2])));
    }
    const wb = worldBox(p);
    if (!(pts.length === wb.length && pts.every((a) => wb.some((b) => dist(a, b) <= 0.02)))) { allFit = false; if (VERBOSE) console.log('       misfit: ' + p.id); }
  });
  ok(allFit, 'each part\'s NC box (length x height x thickness from its NC header), laid out by its FRAME, is that part\'s box in the model');
  // the base plate's holes through the FRAME are where the model's anchor rods are
  const plate = built.byId.get(bp.id + '.plate'), wpl = wia.parts[order.indexOf(plate)];
  const ncPl = Nc.readNc1(r.files.find((f) => f.name.endsWith('/' + wpl.file)).data);
  const holes = ncPl.blocks.find((b) => b.type === 'BO').rows.map((h) => { const q = add(add(wpl.base, mul(wpl.rx, h.nums[0])), mul(wpl.ry, h.nums[1])); return add(add(add(lead.o, mul(lead.x, q[0])), mul(lead.y, q[1])), mul(lead.z, q[2])); });
  const rods = built.bolts.filter((b) => b.conn === bp.id);
  ok(holes.length === 4 && holes.every((h) => rods.some((b) => Math.hypot(h[0] - b.head[0], h[1] - b.head[1]) < 0.02)), 'the base plate\'s 4 NC holes, through its FRAME, are on the model\'s 4 anchor rods');
  ok(wpl.base[0] < 0 && Math.abs(wpl.base[0] + plate.profile.t) < 0.011 && same3(cross(wpl.rx, wpl.ry), [1, 0, 0], 1e-9), 'the base plate sits below the column\'s cut end: BASE X = -' + plate.profile.t + ', its thickness along the column (as the sample\'s BASE plate)');
  const box = { length: wia.length, width: wia.width, height: wia.height };
  ok(Math.abs(box.length - (col.length + plate.profile.t)) < 0.011 && box.width >= col.profile.bf - 0.011 && box.height >= col.profile.d - 0.011, 'Length = the column + the base plate (' + box.length + '); Width and Height cover the plates (' + box.width + ', ' + box.height + ')');

  // turned pieces: a plate with off-centre holes and its copy turned end for end share one NC file with different frames
  const mk = (id, o, x, u, holesAt) => ({ id, type: 'plate', role: 'plate', name: 'plate', profile: { kind: 'PL', b: 100, t: 10, perimeter: 220, mass: 7.85 }, profileName: 'PL10x100', material: 'A36', frame: { o, x, u, v: cross(x, u), len: 200 }, voff: 0, length: 200, holes: holesAt.map(([hx, hy]) => ({ face: 'plate', x: hx, y: hy, d: 22 })), cuts: [], phase: 1 });
  const a = mk('a', [0, 0, 0], [1, 0, 0], [0, 1, 0], [[30, 20]]), b = mk('b', [500, 0, 0], [1, 0, 0], [0, 1, 0], [[170, -20]]), c = mk('c', [900, 0, 0], [1, 0, 0], [0, 1, 0], [[30, 20]]);
  ok(Z.bestTurn(a, c).turn === 'id' && Z.bestTurn(a, b).turn === 'rv' && Z.bestTurn(a, b).misfit < 1e-9 && Z.turnMisfit(a, b, 'id') > 100, 'bestTurn: a copy as it stands is "id"; one turned end for end is found (rv)');
  const fa = Z.ncFrame(a), fb = Z.ncFrame(b, 'rv');
  const holeW = (f, hx, hy) => add(add(f.o, mul(f.x, hx)), mul(f.y, hy));
  ok(same3(holeW(fb, 30, 70), [670, -20, -5], 1e-9) && same3(holeW(fa, 30, 70), [30, 20, -5], 1e-9) && same3(cross(fb.x, fb.y), fb.z, 1e-9), 'the turned frame puts the NC file\'s hole (30, 70) on the turned plate\'s real hole, right-handed');
  const main = { ...col };
  const asm = Z.zemanAssembly({ mark: 'T1', quantity: 2, order: 'job', main, attached: [a, b, c], partMark: (p) => (p === main ? 'c9' : 'p7'), name: (p) => p.name || p.type, writeNc: Nc.writeNc1 });
  const tw = Z.readWia(asm.files[0].data);
  ok(asm.files.length === 3 && asm.turned === 1 && tw.parts.slice(1).every((p) => p.file === 'p7.nc') && same3(tw.parts[1].rx, mul(tw.parts[2].rx, -1), 1e-9) && same3(tw.parts[1].rx, tw.parts[3].rx, 1e-9), 'three plates of one mark: one NC file, the turned one with RX opposite');
  ok(tw.quantity === 2 && Nc.readNc1(asm.files[2].data).header.quantity === 6 && Nc.readNc1(asm.files[1].data).header.quantity === 2, 'Quantity 2 in the XML; the NC files count pieces x assemblies (3 x 2, 1 x 2)');

  // refusals: what the sample does not show is not written
  const all = Z.zemanExport({ ...doc, selection: [] });
  ok(all.done.length + all.skipped.length === marks.assemblies.length && all.done.length >= 2, 'nothing selected = every assembly (' + all.done.length + ' written, ' + all.skipped.length + ' not)');
  ok(Z.zemanRefusal({ profile: { kind: 'RHS' }, profileName: 'HSS6x4' }, [], null).code === 'lead' && Z.zemanRefusal(col, [{ profile: { kind: 'L' }, profileName: 'L4x4' }], null).code === 'attached' && Z.zemanRefusal(col, [], () => 'no').code === 'nc' && Z.zemanRefusal(col, welded, Nc.ncRefusal) === null,
    'a leading part that is not an I-shape, an attached part that is not a plate, or a part with no NC file: refused with the reason');
  ok(all.skipped.every((s) => ['lead', 'attached', 'nc'].includes(s.code)) && new Set(all.files.map((f) => f.name)).size === all.files.length, 'skipped assemblies say why; no two files share a path');
}

console.log(`\n${pass} passed, ${fail} failed` + (have ? '' : ' (sample set missing: the format checks did not run)'));
process.exit(fail ? 1 : have ? 0 : 2);
