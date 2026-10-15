/* SPDX-License-Identifier: Apache-2.0 */
/**
 * mleader-read.js — MULTILEADER (MLEADER) and MLEADERSTYLE into the model, every field (cc-dwg, Apache-2.0).
 * Written from the ODA "Open Design Specification for .dwg files" v5.4.1: 20.4.48 (MLEADER), 20.4.86
 * (MLeaderAnnotContext), 20.4.87 (MLEADERSTYLE), 20.1 (the R2007+ string stream), 2.13 (handles).
 *
 *   readMleader(rec, ctx, hx, nameOf) → model fields     read.js, for a decoded MULTILEADER record
 *   readMleaderStyle(rec, ctx, hx)    → model fields     read.js, for MLEADERSTYLE
 * The record is decoded again from its own bits (objects-read.js leaves _dataStart/_endbit/_hPos/_buf), so every
 * field — including the ones objects-read.js skips — reaches the model, with handle references as hex strings.
 *
 * Model (MULTILEADER; DXF group codes of the spec in brackets):
 *   version [270, R2010+], style (name) + styleHandle [340], overrideFlags [90], leaderType [170], leaderColor [91],
 *   leaderLinetypeHandle [341], leaderLineweight [171], landingEnabled [290], doglegEnabled [291], landingDistance [41],
 *   arrowheadHandle [342], arrowSize [42], contentType [172], styleTextStyleHandle [343], textLeftAttach [173],
 *   textRightAttach [95], textAngleType [174], unknown175 [175], textColor [92], textFrame [292],
 *   styleBlockHandle [344], blockColor [93], blockScale [10], blockRotation [43], blockAttach [176], annotative [293],
 *   arrowheads [{isDefault [94], handle [345]}] (up to R2007), blockLabels [{attdefHandle [330], text [302] — the
 *   attribute value —, index [177], width [44]}], textDirectionNegative [294], ipeAlign [178], justification [179],
 *   scale [45], attachDirection [271], textTopAttach [273], textBottomAttach [272] (R2010+), extendToText [295, R2013+],
 *   contentBlock (name), textStyle (name of the content text's style),
 *   context: { roots: [{ contentValid, unknown, connection, direction, breaks: [[start, end]], index, landingDistance,
 *              lines: [{ points, breakInfoCount, segmentIndex?, breaks?, index, leaderType?, color?, linetypeHandle?,
 *              lineweight?, arrowSize?, arrowheadHandle?, overrideFlags? }], attachDirection? }],
 *              scale, contentBase, textHeight, arrowSize, landingGap, leftAttach, rightAttach, textAlign, attachType,
 *              hasText, text?: { label, normal, styleHandle, location, direction, rotation, width, height, lineSpacing,
 *              lineSpacingStyle, color, alignment, flow, bgColor, bgScale, bgTransparency, bgFill, bgMask, columnType,
 *              autoHeight, columnWidth, columnGutter, columnFlowReversed, columnSizes, wordBreak, unknown },
 *              hasBlock, block?: { blockHandle, name, normal, location, scale, rotation, color, matrix[16] },
 *              basePoint, baseDirection, baseVertical, normalReversed, topAttach?, bottomAttach? }
 * Spec gap: the spec puts the "Common AcDbAnnotScaleObjectContextData data" (20.4.71) before the leader roots;
 * inside MLEADER the context starts directly with the root count — found by builder R's reader on AutoCAD/ODA
 * files (objects-read.js) and confirmed here against the ODA File Converter's DXF of every corpus multileader.
 * Spec gap: the arrowhead list is present up to R2007 only, the block labels in every version (as 20.4.48's
 * indentation suggests) — the corpus multileaders of all six versions decode to the end of their data that way.
 */
import { msg } from './messages.js';
import { BitReader } from './bits-read.js';
import { stringStreamStart } from './objects-read.js';
import { b64, sliceBits } from './passthrough.js';

/** A data reader and a handle reader positioned at the record's own data (after its common part). */
function readers(rec, ctx) {
  const buf = rec._buf, ver = ctx.ver;
  const r = new BitReader(buf, { version: ver, decode: ctx.decode, startBit: rec._dataStart, endBit: rec._endbit });
  if (ver >= 21) {
    const objStart = rec._dataStart;   // the string stream lies inside [dataStart, endbit)
    const s = new BitReader(buf, { version: ver, decode: ctx.decode, startBit: objStart, endBit: rec._endbit });
    const ss = stringStreamStart(buf, rec._endbit, objStart);
    if (ss !== -1) { s.pos = ss.start; s.end = ss.end; r.end = ss.start; } else { s.pos = s.end = rec._endbit; }
    r.str = s;
  }
  const h = new BitReader(buf, { version: ver, decode: ctx.decode, startBit: rec._hPos, endBit: rec._objEnd });
  return { r, h };
}

export function readMleader(rec, ctx, hx, nameOf) {
  if (!rec._buf || rec._dataStart === undefined) return null;
  const { r, h } = readers(rec, ctx);
  const ver = ctx.ver;
  const H = () => hx(h.H(rec.handle));
  const P = () => r.BD3();
  const f = {};
  if (ver >= 24) f.version = r.BS();
  f.context = context(r, H, ver);
  f.styleHandle = H();
  f.overrideFlags = r.BL(); f.leaderType = r.BS(); f.leaderColor = r.CMC(); f.leaderLinetypeHandle = H();
  f.leaderLineweight = r.BL(); f.landingEnabled = !!r.B(); f.doglegEnabled = !!r.B(); f.landingDistance = r.BD();
  f.arrowheadHandle = H(); f.arrowSize = r.BD(); f.contentType = r.BS(); f.styleTextStyleHandle = H();
  f.textLeftAttach = r.BS(); f.textRightAttach = r.BS(); f.textAngleType = r.BS(); f.unknown175 = r.BS();
  f.textColor = r.CMC(); f.textFrame = !!r.B(); f.styleBlockHandle = H(); f.blockColor = r.CMC();
  f.blockScale = P(); f.blockRotation = r.BD(); f.blockAttach = r.BS(); f.annotative = !!r.B();
  if (ver < 24) {
    const na = count(r, r.BL(), 2);
    f.arrowheads = [];
    for (let i = 0; i < na; i++) f.arrowheads.push({ isDefault: !!r.B(), handle: H() });
  }
  const nl = count(r, r.BL(), 4);
  f.blockLabels = [];
  for (let i = 0; i < nl; i++) f.blockLabels.push({ attdefHandle: H(), text: r.TV(), index: r.BS(), width: r.BD() });
  f.textDirectionNegative = !!r.B(); f.ipeAlign = r.BS(); f.justification = r.BS(); f.scale = r.BD();
  if (ver >= 24) { f.attachDirection = r.BS(); f.textTopAttach = r.BS(); f.textBottomAttach = r.BS(); }
  if (ver >= 27) f.extendToText = !!r.B();
  // names, for programs that look things up by name (nameOf takes the numeric handle)
  const nm = nameOf;
  nameOf = (hex) => (hex ? nm(parseInt(hex, 16)) : undefined);
  f.style = nameOf(f.styleHandle) ?? f.styleHandle;
  if (f.context.block) { f.context.block.name = nameOf(f.context.block.blockHandle); f.contentBlock = f.context.block.name ?? f.context.block.blockHandle; }
  if (f.context.text) f.textStyle = nameOf(f.context.text.styleHandle);
  f.leaderLinetype = nameOf(f.leaderLinetypeHandle);
  f.arrowheadName = nameOf(f.arrowheadHandle);
  // the proxy graphics (ch. 29) programs without multileaders draw; kept for the writer
  if (rec._gfxPos !== undefined && rec._graphics > 0) f.proxyGraphics = b64(sliceBits(rec._buf, rec._gfxPos, rec._gfxPos + rec._graphics * 8));
  Object.defineProperty(f, '_left', { value: [r.end - r.pos, h.end - h.pos], enumerable: false });   // checks: bits left unread
  return f;
}

const count = (r, n, minBits) => { if (n < 0 || n * minBits > r.end - r.pos) throw new Error(msg('ccdwg.err.count_large', { n })); return n; };

/** 20.4.86 MLeaderAnnotContext as embedded in MLEADER. */
function context(r, H, ver) {
  const c = { roots: [] };
  const nr = count(r, r.BL(), 8);
  for (let i = 0; i < nr; i++) {
    const root = { contentValid: !!r.B(), unknown: !!r.B(), connection: r.BD3(), direction: r.BD3(), breaks: [], lines: [] };
    const nb = count(r, r.BL(), 12);
    for (let k = 0; k < nb; k++) root.breaks.push([r.BD3(), r.BD3()]);
    root.index = r.BL(); root.landingDistance = r.BD();
    const nl = count(r, r.BL(), 4);
    for (let k = 0; k < nl; k++) {
      const line = { points: [] };
      const np = count(r, r.BL(), 6);
      for (let j = 0; j < np; j++) line.points.push(r.BD3());
      line.breakInfoCount = r.BL();
      if (line.breakInfoCount) {
        line.segmentIndex = r.BL();
        const ns = count(r, r.BL(), 12);
        line.breaks = [];
        for (let j = 0; j < ns; j++) line.breaks.push([r.BD3(), r.BD3()]);
      }
      line.index = r.BL();
      if (ver >= 24) {
        line.leaderType = r.BS(); line.color = r.CMC(); line.linetypeHandle = H(); line.lineweight = r.BL();
        line.arrowSize = r.BD(); line.arrowheadHandle = H(); line.overrideFlags = r.BL();
      }
      root.lines.push(line);
    }
    if (ver >= 24) root.attachDirection = r.BS();
    c.roots.push(root);
  }
  c.scale = r.BD(); c.contentBase = r.BD3(); c.textHeight = r.BD(); c.arrowSize = r.BD(); c.landingGap = r.BD();
  c.leftAttach = r.BS(); c.rightAttach = r.BS(); c.textAlign = r.BS(); c.attachType = r.BS();
  c.hasText = !!r.B();
  if (c.hasText) {
    const t = c.text = {};
    t.label = r.TV(); t.normal = r.BD3(); t.styleHandle = H(); t.location = r.BD3(); t.direction = r.BD3();
    t.rotation = r.BD(); t.width = r.BD(); t.height = r.BD(); t.lineSpacing = r.BD(); t.lineSpacingStyle = r.BS();
    t.color = r.CMC(); t.alignment = r.BS(); t.flow = r.BS(); t.bgColor = r.CMC(); t.bgScale = r.BD(); t.bgTransparency = r.BL();
    t.bgFill = !!r.B(); t.bgMask = !!r.B(); t.columnType = r.BS(); t.autoHeight = !!r.B(); t.columnWidth = r.BD();
    t.columnGutter = r.BD(); t.columnFlowReversed = !!r.B();
    const ncs = count(r, r.BL(), 2); t.columnSizes = []; for (let i = 0; i < ncs; i++) t.columnSizes.push(r.BD());
    t.wordBreak = !!r.B(); t.unknown = !!r.B();
    c.hasBlock = false;
  } else {
    c.hasBlock = !!r.B();
    if (c.hasBlock) {
      const b = c.block = {};
      b.blockHandle = H(); b.normal = r.BD3(); b.location = r.BD3(); b.scale = r.BD3(); b.rotation = r.BD();
      b.color = r.CMC(); b.matrix = []; for (let i = 0; i < 16; i++) b.matrix.push(r.BD());
    }
  }
  c.basePoint = r.BD3(); c.baseDirection = r.BD3(); c.baseVertical = r.BD3(); c.normalReversed = !!r.B();
  if (ver >= 24) { c.topAttach = r.BS(); c.bottomAttach = r.BS(); }
  return c;
}

/** 20.4.87 MLEADERSTYLE. IsNewFormat: R2010+, or the ACAD_MLEADERVER extended data (the only EED it carries). */
export function readMleaderStyle(rec, ctx, hx) {
  if (!rec._buf || rec._dataStart === undefined) return null;
  const { r, h } = readers(rec, ctx);
  const ver = ctx.ver;
  const H = () => hx(h.H(rec.handle));
  const f = {};
  if (ver >= 24) f.styleVersion = r.BS();
  f.contentType = r.BS(); f.drawMLeaderOrder = r.BS(); f.drawLeaderOrder = r.BS(); f.maxPoints = r.BL();
  f.firstAngle = r.BD(); f.secondAngle = r.BD(); f.leaderType = r.BS(); f.leaderColor = r.CMC();
  f.leaderLinetype = H(); f.leaderLineweight = r.BL(); f.landingEnabled = !!r.B(); f.landingGap = r.BD();
  f.doglegEnabled = !!r.B(); f.landingDistance = r.BD(); f.description = r.TV(); f.arrowhead = H();
  f.arrowSize = r.BD(); f.textDefault = r.TV(); f.textStyle = H();
  f.leftAttach = r.BS(); f.rightAttach = r.BS();
  const newFormat = ver >= 24 || !!rec._eed;
  if (newFormat) f.textAngleType = r.BS();
  f.textAlign = r.BS(); f.textColor = r.CMC(); f.textHeight = r.BD(); f.textFrame = !!r.B();
  if (newFormat) f.alwaysAlignLeft = !!r.B();
  f.alignSpace = r.BD(); f.block = H(); f.blockColor = r.CMC(); f.blockScale = r.BD3();
  f.blockScaleEnabled = !!r.B(); f.blockRotation = r.BD(); f.blockRotationEnabled = !!r.B(); f.blockConnection = r.BS();
  f.scale = r.BD(); f.changed = !!r.B(); f.annotative = !!r.B(); f.breakSize = r.BD();
  if (ver >= 24) { f.attachDirection = r.BS(); f.topAttach = r.BS(); f.bottomAttach = r.BS(); }
  // Spec gap: R2013+ styles have one more bit after the bottom attachment — the ODA File Converter writes it as DXF
  // 298 (0 in every corpus style); found by the one bit left over in the R2013/R2018 corpus styles.
  if (ver >= 27) f.unknown298 = !!r.B();
  Object.defineProperty(f, '_left', { value: [r.end - r.pos, h.end - h.pos], enumerable: false });
  return f;
}
