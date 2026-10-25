/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-dwg is a standalone library; its errors and report notes are English (an app translates what it shows). */
/**
 * mleader-write.js — MULTILEADER and MLEADERSTYLE encoders (cc-dwg, Apache-2.0). Written from the ODA "Open Design
 * Specification for .dwg files" v5.4.1: 20.4.48 (MLEADER), 20.4.86 (MLeaderAnnotContext), 20.4.87 (MLEADERSTYLE),
 * 20.4.1/20.4.2 (common entity data), ch. 10 (classes), ch. 28 (EED). The model is the one mleader-read.js makes
 * (see its header); every field has a default so a program can build a multileader from a few points and a text.
 *
 *   convertMleader(e, env, c)         → [record]   (nongraphic-write.js X.convert, for write.js)
 *   encodeMleaderStyle(rec, ctx)      → bytes      (a copied MLEADERSTYLE, nongraphic-write.js)
 *   ensureMleaderStyle({ recs, H, next, defaults })  a Standard style (or the style a multileader brings) + ACAD_MLEADERSTYLE when multileaders have none
 *
 * Versions: the entity is a class (MULTILEADER / AcDbMLeader / ACDB_MLEADER_CLASS) in every version from R2000 on,
 * as the ODA File Converter writes it when it saves a drawing down. Up to R2007 the per-line overrides and the
 * attachment-direction fields do not exist and the style's new fields need ACAD_MLEADERVER extended data
 * ([1070 2], 20.4.87 "IsNewFormat"); the R2010+ style has no such data.
 * Spec gap: R2013+ MLEADERSTYLE has one more bit at the end (DXF 298), see mleader-read.js.
 */
import { ObjWriter, begin, finish, entityCommon, objectCommon, CLASSED, HARD_PTR, SOFT_PTR, SOFT_OWN } from './objects-write.js';
import { VERSION_NUM } from './header-vars.js';
import { encode1252 } from './bits-write.js';
import { rawEntityCommon } from './passthrough.js';

CLASSED.MULTILEADER = CLASSED.MULTILEADER || { dxf: 'MULTILEADER', cpp: 'AcDbMLeader', app: 'ACDB_MLEADER_CLASS', entity: true, proxy: 1025 };
CLASSED.MLEADERSTYLE = CLASSED.MLEADERSTYLE || { dxf: 'MLEADERSTYLE', cpp: 'AcDbMLeaderStyle', app: 'ACDB_MLEADERSTYLE_CLASS', entity: false, proxy: 4095 };

const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const P = (p, d = { x: 0, y: 0, z: 0 }) => (p ? { x: num(p.x), y: num(p.y), z: num(p.z) } : d);
const Z = { x: 0, y: 0, z: 1 }, X1 = { x: 1, y: 0, z: 0 }, Y1 = { x: 0, y: 1, z: 0 };
const pt = (w, p, d) => { const q = P(p, d); w.BD3(q.x, q.y, q.z); };
/**
 * Text of a multileader. Spec gap: up to R2004 the multileader's strings carry no closing NUL (the length is the
 * character count), unlike other objects' T — found by comparing re-encoded corpus multileaders with the originals.
 */
const TXT = (w, s) => {
  if (w.r2007) { w.TV(s); return; }
  const b = encode1252(s);
  w.BS(b.length);
  for (const c of b) w.RC(c);
};
const col = (c, d = { index: 256 }) => (c === undefined || c === null ? d : typeof c === 'number' ? { index: c } : c);

/** Model MULTILEADER → record. Handle fields resolve at encode time (every handle of the file is known then). */
export function convertMleader(e, env, c) {
  const ctx = e.context;
  if (!ctx || !Array.isArray(ctx.roots)) return 'MULTILEADER without its leaders and content';
  const { srcMap, hexKey, blockByName } = env;
  const h = (hex) => (hex ? srcMap.get(hexKey(hex)) || 0 : 0);
  const blockH = (hex, name) => {   // lazy: block records get their handles block by block
    const B = name ? blockByName.get(String(name).toUpperCase()) : null;
    return () => h(hex) || (B ? B.hdr : 0);
  };
  const styleText = (hex, name) => h(hex) || (name ? env.styleRef(name) : 0) || 0;
  const ltype = (hex, name) => h(hex) || (name ? env.ltypeRef(name).h || 0 : 0);
  const rec = { ...c('MULTILEADER'), src: e, encode: encodeMleader };
  rec.R = {
    style: () => h(e.styleHandle) || env.mleaderStyleFallback?.() || 0,
    leaderLtype: () => ltype(e.leaderLinetypeHandle, e.leaderLinetype),
    arrowhead: blockH(e.arrowheadHandle, e.arrowheadName),
    styleText: () => styleText(e.styleTextStyleHandle),
    styleBlock: blockH(e.styleBlockHandle),
    textStyle: () => styleText(ctx.text?.styleHandle, e.textStyle),
    contentBlock: blockH(ctx.block?.blockHandle, ctx.block?.name ?? e.contentBlock),
    h,
  };
  rec.mleaderStyleSrc = e.styleHandle;
  return [rec];
}

function encodeMleader(rec, ctx) {
  const e = rec.src, R = rec.R, v = VERSION_NUM[ctx.version];
  const w = new ObjWriter(ctx.version);
  begin(w, ctx.classNum('MULTILEADER'), rec);
  rawEntityCommon(w, rec, e.proxyGraphics ? { gfx: e.proxyGraphics } : null);   // entityCommon + the proxy graphics
  if (v >= 24) w.BS(e.version ?? 2);
  writeContext(w, e.context, R, v);
  w.H(HARD_PTR, R.style());
  w.BL(e.overrideFlags ?? 0); w.BS(e.leaderType ?? 1); w.CMC(col(e.leaderColor, { index: 0 })); w.H(HARD_PTR, R.leaderLtype());
  w.BL(e.leaderLineweight ?? -2); w.B(e.landingEnabled === false ? 0 : 1); w.B(e.doglegEnabled === false ? 0 : 1); w.BD(num(e.landingDistance, 0.36));
  w.H(HARD_PTR, R.arrowhead()); w.BD(num(e.arrowSize, 0.18)); w.BS(e.contentType ?? (e.context.hasText ? 2 : e.context.hasBlock ? 1 : 0)); w.H(HARD_PTR, R.styleText());
  w.BS(e.textLeftAttach ?? 1); w.BS(e.textRightAttach ?? 1); w.BS(e.textAngleType ?? 1); w.BS(e.unknown175 ?? 0);
  w.CMC(col(e.textColor, { index: 0 })); w.B(e.textFrame ? 1 : 0); w.H(HARD_PTR, R.styleBlock()); w.CMC(col(e.blockColor, { index: 0 }));
  pt(w, e.blockScale, { x: 1, y: 1, z: 1 }); w.BD(num(e.blockRotation)); w.BS(e.blockAttach ?? 0); w.B(e.annotative ? 1 : 0);
  if (v < 24) {
    const ah = e.arrowheads || [];
    w.BL(ah.length);
    for (const a of ah) { w.B(a.isDefault ? 1 : 0); w.H(HARD_PTR, R.h(a.handle)); }
  }
  const bl = (e.blockLabels || []).filter((l) => R.h(l.attdefHandle));
  w.BL(bl.length);
  for (const l of bl) { w.H(SOFT_PTR, R.h(l.attdefHandle)); TXT(w, String(l.text ?? '')); w.BS(l.index | 0); w.BD(num(l.width)); }
  w.B(e.textDirectionNegative ? 1 : 0); w.BS(e.ipeAlign ?? 0); w.BS(e.justification ?? 1); w.BD(num(e.scale, 1));
  if (v >= 24) { w.BS(e.attachDirection ?? 0); w.BS(e.textTopAttach ?? 9); w.BS(e.textBottomAttach ?? 9); }
  if (v >= 27) w.B(e.extendToText ? 1 : 0);
  return finish(w);
}

function writeContext(w, c, R, v) {
  const roots = c.roots || [];
  w.BL(roots.length);
  roots.forEach((root, ri) => {
    w.B(root.contentValid === false ? 0 : 1); w.B(root.unknown === false ? 0 : 1);
    pt(w, root.connection); pt(w, root.direction, X1);
    const br = root.breaks || [];
    w.BL(br.length); for (const [s, t] of br) { pt(w, s); pt(w, t); }
    w.BL(root.index ?? ri); w.BD(num(root.landingDistance, 0.36));
    const lines = root.lines || [];
    w.BL(lines.length);
    lines.forEach((ln, li) => {
      const ps = ln.points || [];
      w.BL(ps.length); for (const p of ps) pt(w, p);
      const bc = ln.breakInfoCount | 0;
      w.BL(bc);
      if (bc) {
        w.BL(ln.segmentIndex | 0);
        const b = ln.breaks || [];
        w.BL(b.length); for (const [s, t] of b) { pt(w, s); pt(w, t); }
      }
      w.BL(ln.index ?? li);
      if (v >= 24) {
        w.BS(ln.leaderType ?? 1); w.CMC(col(ln.color, { index: 0 })); w.H(HARD_PTR, R.h(ln.linetypeHandle)); w.BL(ln.lineweight ?? -2);
        w.BD(num(ln.arrowSize, 0)); w.H(HARD_PTR, R.h(ln.arrowheadHandle)); w.BL(ln.overrideFlags | 0);   // arrow size 0 = the style's (as the ODA converter writes lines saved up from R2007-)
      }
    });
    if (v >= 24) w.BS(root.attachDirection | 0);
  });
  w.BD(num(c.scale, 1)); pt(w, c.contentBase); w.BD(num(c.textHeight, 0.18)); w.BD(num(c.arrowSize, 0.18)); w.BD(num(c.landingGap, 0.09));
  w.BS(c.leftAttach ?? 1); w.BS(c.rightAttach ?? 1); w.BS(c.textAlign | 0); w.BS(c.attachType | 0);
  const t = c.hasText !== false && c.text ? c.text : null;
  w.B(t ? 1 : 0);
  if (t) {
    TXT(w, String(t.label ?? '')); pt(w, t.normal, Z); w.H(HARD_PTR, R.textStyle()); pt(w, t.location); pt(w, t.direction, X1);
    w.BD(num(t.rotation)); w.BD(num(t.width)); w.BD(num(t.height)); w.BD(num(t.lineSpacing, 1)); w.BS(t.lineSpacingStyle ?? 1);
    w.CMC(col(t.color, { index: 256 })); w.BS(t.alignment ?? 1); w.BS(t.flow ?? 1); w.CMC(col(t.bgColor, { index: 7 })); w.BD(num(t.bgScale, 1.5)); w.BL(t.bgTransparency | 0);
    w.B(t.bgFill ? 1 : 0); w.B(t.bgMask ? 1 : 0); w.BS(t.columnType | 0); w.B(t.autoHeight ? 1 : 0); w.BD(num(t.columnWidth));
    w.BD(num(t.columnGutter)); w.B(t.columnFlowReversed ? 1 : 0);
    const cs = t.columnSizes || []; w.BL(cs.length); for (const x of cs) w.BD(num(x));
    w.B(t.wordBreak ? 1 : 0); w.B(t.unknown ? 1 : 0);
  } else {
    const b = c.hasBlock !== false && c.block ? c.block : null;
    w.B(b ? 1 : 0);
    if (b) {
      w.H(SOFT_PTR, R.contentBlock()); pt(w, b.normal, Z); pt(w, b.location); pt(w, b.scale, { x: 1, y: 1, z: 1 }); w.BD(num(b.rotation));
      w.CMC(col(b.color, { index: 0 }));
      const m = b.matrix && b.matrix.length === 16 ? b.matrix : blockMatrix(b);
      for (let i = 0; i < 16; i++) w.BD(num(m[i]));
    }
  }
  pt(w, c.basePoint); pt(w, c.baseDirection, X1); pt(w, c.baseVertical, Y1); w.B(c.normalReversed ? 1 : 0);
  if (v >= 24) { w.BS(c.topAttach ?? 9); w.BS(c.bottomAttach ?? 9); }
}

/** 20.4.86: rotation, then scale, then translation (normal Z) — for a block content given without its matrix. */
function blockMatrix(b) {
  const s = P(b.scale, { x: 1, y: 1, z: 1 }), r = num(b.rotation), l = P(b.location);
  const cs = Math.cos(r), sn = Math.sin(r);
  return [cs * s.x, -sn * s.y, 0, l.x, sn * s.x, cs * s.y, 0, l.y, 0, 0, s.z, l.z, 0, 0, 0, 1];
}

/** MLEADERSTYLE from the model (mleader-read.js fields); rec = { src, M: { ref(hex) }, h, owner, reactors, eed }. */
export function encodeMleaderStyle(rec, ctx) {
  const o = rec.src, ref = rec.M.ref, v = VERSION_NUM[ctx.version];
  const w = new ObjWriter(ctx.version);
  begin(w, ctx.classNum('MLEADERSTYLE'), rec);
  objectCommon(w, rec);
  const newFormat = v >= 24 || rec.newFormat;
  if (v >= 24) w.BS(o.styleVersion ?? 2);
  w.BS(o.contentType ?? 2); w.BS(o.drawMLeaderOrder ?? 1); w.BS(o.drawLeaderOrder | 0); w.BL(o.maxPoints ?? 2);
  w.BD(num(o.firstAngle)); w.BD(num(o.secondAngle)); w.BS(o.leaderType ?? 1); w.CMC(col(o.leaderColor, { index: 0 }));
  w.H(HARD_PTR, ref(o.leaderLinetype)); w.BL(o.leaderLineweight ?? -2); w.B(o.landingEnabled === false ? 0 : 1); w.BD(num(o.landingGap, 0.09));
  w.B(o.doglegEnabled === false ? 0 : 1); w.BD(num(o.landingDistance, 0.36)); w.TV(o.description ?? ''); w.H(HARD_PTR, ref(o.arrowhead));
  w.BD(num(o.arrowSize, 0.18)); w.TV(o.textDefault ?? ''); w.H(HARD_PTR, ref(o.textStyle));
  w.BS(o.leftAttach ?? 1); w.BS(o.rightAttach ?? 1);
  if (newFormat) w.BS(o.textAngleType ?? 1);
  w.BS(o.textAlign | 0); w.CMC(col(o.textColor, { index: 0 })); w.BD(num(o.textHeight, 0.18)); w.B(o.textFrame ? 1 : 0);
  if (newFormat) w.B(o.alwaysAlignLeft ? 1 : 0);
  w.BD(num(o.alignSpace, 4)); w.H(HARD_PTR, ref(o.block)); w.CMC(col(o.blockColor, { index: 0 })); pt(w, o.blockScale, { x: 1, y: 1, z: 1 });
  w.B(o.blockScaleEnabled === false ? 0 : 1); w.BD(num(o.blockRotation)); w.B(o.blockRotationEnabled === false ? 0 : 1); w.BS(o.blockConnection | 0);
  w.BD(num(o.scale, 1)); w.B(o.changed ? 1 : 0); w.B(o.annotative ? 1 : 0); w.BD(num(o.breakSize, 0.125));
  if (v >= 24) { w.BS(o.attachDirection | 0); w.BS(o.topAttach ?? 9); w.BS(o.bottomAttach ?? 9); }
  if (v >= 27) w.B(o.unknown298 ? 1 : 0);
  return finish(w);
}

/**
 * Multileaders whose style is not in the written file (a model built by a program, or a style left out) get a
 * Standard style, in an ACAD_MLEADERSTYLE dictionary of the named-object dictionary. 0.6.1: a multileader that brings
 * its style along (`styleObject`, a MLEADERSTYLE model object, + `styleName`: CadCraft keeps them on multileaders it
 * opened, dwg-keep.js) gets that style instead, one per name; its text style, linetype, arrowhead and block are found by
 * name (`textStyleName`, `leaderLinetypeName`, `arrowheadName`, `blockName` on the style object) through
 * `defaults.styleRef` / `defaults.blockRef`, else the Standard text style, ByBlock and none.
 */
export function ensureMleaderStyle({ recs, H, next, mleaderEed, defaults = {} }) {
  const mls = recs.filter((r) => r.t === 'MULTILEADER' && r.R && !r.R.style());
  if (!mls.length) return null;
  const nod = recs.find((r) => r.h === H.nod && r.t === 'DICTIONARY');
  let dict = null;
  const have = nod && nod.items.find((x) => x[0] === 'ACAD_MLEADERSTYLE');
  if (have) dict = recs.find((r) => r.h === have[1]);
  if (!dict) {
    dict = { t: 'DICTIONARY', h: next(), owner: H.nod, reactors: [H.nod], items: [], cloning: 1 };
    recs.push(dict);
    if (nod) { nod.items.push(['ACAD_MLEADERSTYLE', dict.h]); nod.items.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)); }
  }
  const byRef = (name, fn) => (name && fn ? fn(name) || 0 : 0);
  const own = new Map();   // style name (upper case) → handle
  const plain = [];
  for (const r of mls) {
    const so = r.src && r.src.styleObject, nm = r.src && typeof r.src.styleName === 'string' ? r.src.styleName.trim() : '';
    if (!so || typeof so !== 'object' || !nm || nm.length > 255) { plain.push(r); continue; }
    const k = nm.toUpperCase();
    if (!own.has(k)) {
      const there = dict.items.find((x) => String(x[0]).toUpperCase() === k);
      if (there) own.set(k, there[1]);
      else {
        const h = next();
        dict.items.push([nm, h]);
        const refs = { '*TS': byRef(so.textStyleName, defaults.styleRef) || defaults.textStyle || 0, '*LT': defaults.ltByBlock || 0,
          '*AH': byRef(so.arrowheadName, defaults.blockRef), '*BL': byRef(so.blockName, defaults.blockRef) };
        recs.push({ t: 'MLEADERSTYLE', h, owner: dict.h, reactors: [dict.h], eed: mleaderEed, newFormat: true,
          src: { ...so, textStyle: '*TS', leaderLinetype: '*LT', arrowhead: '*AH', block: '*BL' },
          M: { ref: (x) => refs[x] || 0 }, encode: encodeMleaderStyle });
        own.set(k, h);
      }
    }
    const h = own.get(k);
    r.R.style = () => h;
  }
  if (!plain.length) return own.values().next().value;
  const styleH = next();
  let name = 'Standard', k = 2;
  while (dict.items.some((x) => x[0] === name)) name = 'Standard_' + k++;
  dict.items.push([name, styleH]);
  recs.push({ t: 'MLEADERSTYLE', h: styleH, owner: dict.h, reactors: [dict.h], eed: mleaderEed, newFormat: true,
    src: { description: name, textStyle: '*TS', leaderLinetype: '*LT' },
    M: { ref: (k) => (k === '*TS' ? defaults.textStyle || 0 : k === '*LT' ? defaults.ltByBlock || 0 : 0) }, encode: encodeMleaderStyle });
  for (const r of plain) r.R.style = () => styleH;
  return styleH;
}
