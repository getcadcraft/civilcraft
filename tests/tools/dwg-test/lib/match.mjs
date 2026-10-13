/* SPDX-License-Identifier: Apache-2.0 */
/**
 * match.mjs — compare two entity lists in the common form (truth vs a reader).
 *
 *   compareSets(truth, got, { by: 'handle'|'content', maxDetails }) →
 *     { truth, got, paired, matched, pct, missing, extra, mismatched, byField{TYPE.key: n},
 *       typeCounts{TYPE: [truth, got]}, details: [{ h, gh?, t, field, want, got }], samplesMissing, samplesExtra }
 *
 * by 'handle' pairs entities with the same handle (reader tests). by 'content' pairs them by type,
 * layer, owner and geometry (writer round trips, where handles may be renumbered): exact geometry
 * first, then whatever is left in the same type/layer/owner bucket in file order.
 * Numbers: |a − b| ≤ 1e-9 · max(1, |a|, |b|); angles (a0 a1 rot p0 p1) modulo 2π; text exact
 * (both sides already decoded, \U+XXXX → character); owner names case-insensitive.
 * `renamed` (writer round trips: the writer's report.renamed) — truth entities are paired through the names the
 * writer wrote (normalize.mjs renamedAs); a pair equal only that way is "explained" (RENAMED), never matched.
 */
import { renamedAs } from './normalize.mjs';

export const TOL = 1e-9;
export const RENAMED = 'the writer renamed a layer or block to fit DWG naming rules (its report.renamed)';
const ANGLES = new Set(['a0', 'a1', 'rot', 'p0', 'p1']);
const TAU = 2 * Math.PI;

export function closeNum(a, b, tol = TOL) {
  if (a === b) return true;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
}
function closeAngle(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b;
  let d = Math.abs(a - b) % TAU; d = Math.min(d, TAU - d);
  return d <= TOL * Math.max(1, Math.abs(a), Math.abs(b));
}

/** First difference between two values → path string or null. */
function diff(a, b, key, pathS) {
  if (typeof a === 'number' || typeof b === 'number') {
    if (typeof a !== 'number' || typeof b !== 'number') return pathS;
    return (ANGLES.has(key) ? closeAngle(a, b) : closeNum(a, b)) ? null : pathS;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return pathS;
    if (a.length !== b.length) return pathS + '.length';
    for (let i = 0; i < a.length; i++) { const d = diff(a[i], b[i], key, pathS); if (d) return d + (d === pathS ? `[${i}]` : ''); }
    return null;
  }
  if (a && typeof a === 'object' && b && typeof b === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (k === 'insert' || k === 'error') continue;   // handle link / reader error: reported elsewhere
      const d = diff(a[k], b[k], k, pathS ? pathS + '.' + k : k);
      if (d) return d;
    }
    return null;
  }
  return a === b || (a == null && b == null) ? null : pathS;
}

const getPath = (o, p) => p.replace(/\.length$|\[\d+\]$/, '').split('.').reduce((x, k) => (x == null ? x : x[k]), o);
const short = (v) => { const s = JSON.stringify(v); return s && s.length > 160 ? s.slice(0, 157) + '…' : s; };

/** All field differences of a pair (t, layer, owner, g.*) → [field…] */
export function pairDiffs(w, g, { ignoreOwner = false } = {}) {
  const out = [];
  if (w.t !== g.t) out.push('type');
  if (w.layer !== g.layer) out.push('layer');
  if (!ignoreOwner && String(w.owner).toLowerCase() !== String(g.owner).toLowerCase()) out.push('owner');
  if (w.t === g.t) {
    // a fit-point spline stores no control points in the DWG; ODA's DXF adds computed ones → compare fit only
    const fitOnly = w.t === 'SPLINE' && (w.g?.fit?.length || g.g?.fit?.length) && (!w.g?.ctrl?.length || !g.g?.ctrl?.length);
    for (const k of new Set([...Object.keys(w.g || {}), ...Object.keys(g.g || {})])) {
      if (k === 'insert' || k === 'error') continue;
      if (fitOnly && (k === 'ctrl' || k === 'knots')) continue;
      if (k === 'className') continue;   // a proxy's class: truth (DXF) can't carry it
      const d = diff(w.g?.[k], g.g?.[k], k, k);
      if (d) out.push(d);
    }
    if (g.g?.error) out.push('error');
  }
  return out;
}

/**
 * Differences that come from how ODA's converter writes its DXF (the truth), not from reading the DWG:
 * the DWG holds what we read (LibreDWG and libredwg-web read the same), ODA rewrites it on the way out.
 * Each rule names the convention; a pair is "explained" only when EVERY differing field is covered.
 * They stay visible (count + reason) in the report; they are never added to `matched`.
 */
const ANNO_LAYER = /^(.*) @ [^@]+$/;
// Autodesk's hidden system layers: the DWG stores one name, ODA's DXF another (hidden = leading "*").
const SYS_LAYERS = { ADSK_CONSTRAINTS: 'constraints', LAYERNAMEFORDYNAMICCONSTRAINT: 'constraints', ADSK_SYSTEM_LIGHTS: 'lights' };
const sysLayer = (n) => SYS_LAYERS[String(n ?? '').replace(/^\*/, '').toUpperCase()] || null;
const annoBase = (n) => String(n ?? '').replace(ANNO_LAYER, '$1');
/** The layer as ODA's DXF conventions leave it (content pairing: entities ODA moved between such layers still pair). */
const convLayer = (e) => (e.t === 'ACAD_TABLE' ? '' : sysLayer(e.layer) ? '*' + sysLayer(e.layer) : annoBase(e.layer));
const stripPara =(s) => String(s ?? '').replace(/^(\\p[^;]*;)+/, '');
export function explain(w, g, fields) {
  const reasons = new Set();
  for (const f of fields) {
    // either way round: ODA's DXF of a source shows the "@" layer, ODA's DXF of a written file may show it recomposed
    if (f === 'layer' && annoBase(w.layer) === annoBase(g.layer)) { reasons.add('ODA folds annotative "<layer> @ <scale>" layers'); continue; }
    if (f === 'layer' && sysLayer(w.layer) && sysLayer(w.layer) === sysLayer(g.layer)) { reasons.add('ODA renames hidden Autodesk system layers in its DXF'); continue; }
    // Every example_20xx file, AutoCAD's originals included: the DWG's layer handle says "Tavolo 3"
    // (LibreDWG and libredwg-web read the same), ODA's DXF writes the table on "0".
    if (f === 'layer' && w.t === 'ACAD_TABLE' && (w.layer === '0' || g.layer === '0')) { reasons.add('ODA writes ACAD_TABLE on layer 0 in its DXF'); continue; }
    if (f === 'text' && w.t === 'MTEXT' && stripPara(w.g?.text) === stripPara(g.g?.text)) { reasons.add('ODA rewrites a leading MTEXT \\p paragraph code'); continue; }
    return null;
  }
  return [...reasons].join('; ');
}

export function compareSets(truth, got, { by = 'handle', maxDetails = 400, ignoreOwner = false, renamed = null } = {}) {
  const T = truth.entities || [], G = got.entities || [];
  const RN = renamed ? new Map(T.map((w) => [w, renamedAs(w, renamed)])) : null;
  const as = (w) => (RN ? RN.get(w) : w);   // the truth entity under the names the writer wrote
  const pairs = [];
  const usedG = new Set();
  const unpairedT = [];
  if (by === 'handle') {
    const gm = new Map();
    for (const e of G) if (!gm.has(e.h)) gm.set(e.h, e);
    for (const w of T) { const g = gm.get(w.h); if (g && !usedG.has(g)) { usedG.add(g); pairs.push([w, g]); } else unpairedT.push(w); }
  } else {
    const bucket = (e) => `${e.t}|${e.layer}|${ignoreOwner ? '' : String(e.owner).toLowerCase()}`;
    // fingerprint: bucket + geometry with numbers rounded to 7 significant digits (angles mod 2π)
    const ang = (v) => { let a = ((v % TAU) + TAU) % TAU; if (TAU - a < 1e-6) a = 0; return +a.toPrecision(7); };
    const fp = (e) => bucket(e) + '|' + JSON.stringify(e.g, (k, v) => (typeof v === 'number' ? (ANGLES.has(k) ? ang(v) : Math.abs(v) < 1e-9 ? 0 : +v.toPrecision(7)) : k === 'insert' ? undefined : v));
    const gb = new Map(), gf = new Map();
    for (const e of G) {
      const k = bucket(e); if (!gb.has(k)) gb.set(k, []); gb.get(k).push(e);
      const f = fp(e); if (!gf.has(f)) gf.set(f, []); gf.get(f).push(e);
    }
    const left = [];
    for (const w of T) {
      const list = gf.get(fp(as(w))) || [];
      const i = list.findIndex((g) => !usedG.has(g) && pairDiffs(as(w), g, { ignoreOwner }).length === 0);
      if (i >= 0) { usedG.add(list[i]); pairs.push([w, list[i]]); } else left.push(w);
    }
    for (let j = left.length - 1; j >= 0; j--) {   // rounding edge cases: exact search in the bucket (bounded)
      const w = left[j], list = gb.get(bucket(as(w))) || [];
      if (list.length > 2000) continue;
      const g = list.find((x) => !usedG.has(x) && pairDiffs(as(w), x, { ignoreOwner }).length === 0);
      if (g) { usedG.add(g); pairs.push([w, g]); left.splice(j, 1); }
    }
    const cursor = new Map();   // what is left in a bucket, paired in file order
    for (const w of left) {
      const k = bucket(as(w)), list = gb.get(k) || [];
      let i = cursor.get(k) || 0;
      while (i < list.length && usedG.has(list[i])) i++;
      cursor.set(k, i + 1);
      if (i < list.length) { usedG.add(list[i]); pairs.push([w, list[i]]); } else unpairedT.push(w);
    }
    // last: what is still unpaired, by type/owner and the layer as ODA's conventions leave it (explain() then
    // decides: explained only when every difference is such a convention, else mismatched)
    const cb = (e) => `${e.t}|${convLayer(e)}|${ignoreOwner ? '' : String(e.owner).toLowerCase()}`;
    const gc = new Map();
    for (const e of G) if (!usedG.has(e)) { const k = cb(e); if (!gc.has(k)) gc.set(k, []); gc.get(k).push(e); }
    for (let j = 0; j < unpairedT.length; j++) {
      const w = unpairedT[j], list = gc.get(cb(as(w)));
      const g = list && list.find((x) => !usedG.has(x));
      if (g) { usedG.add(g); pairs.push([w, g]); unpairedT.splice(j--, 1); }
    }
  }
  let matched = 0, mismatched = 0, explained = 0;
  const byField = {}, details = [], explainedBy = {};
  for (const [w0, g] of pairs) {
    const d0 = pairDiffs(w0, g, { ignoreOwner });
    if (!d0.length) { matched++; continue; }
    // through the writer's renames: explained when that (with ODA's conventions) accounts for every difference
    const w = as(w0), d = w === w0 ? d0 : pairDiffs(w, g, { ignoreOwner });
    const conv = d.length ? explain(w, g, d) : '';
    const why = w === w0 ? conv : conv === null ? null : [RENAMED, conv].filter(Boolean).join('; ');
    if (why) { explained++; explainedBy[why] = (explainedBy[why] || 0) + 1; continue; }
    mismatched++;
    for (const f of d) {
      const key = `${w.t}.${f.replace(/\[\d+\]/g, '').replace(/\.length$/, '')}`;
      byField[key] = (byField[key] || 0) + 1;
    }
    if (details.length < maxDetails) {
      const f = d[0];
      const want = f === 'type' ? w.t : f === 'layer' ? w.layer : f === 'owner' ? w.owner : getPath(w.g, f);
      const gotV = f === 'type' ? g.t + (g.g?.className ? ` (${g.g.className})` : '') : f === 'layer' ? g.layer : f === 'owner' ? g.owner : f === 'error' ? g.g.error : getPath(g.g, f);
      details.push({ h: w.h, ...(g.h !== w.h ? { gh: g.h } : {}), t: w.t, owner: w.owner, fields: d.slice(0, 6), field: f, want: short(want), got: short(gotV) });
    }
  }
  const extra = G.filter((g) => !usedG.has(g));
  const typeCounts = {};
  for (const e of T) (typeCounts[e.t] ||= [0, 0])[0]++;
  for (const e of G) (typeCounts[e.t] ||= [0, 0])[1]++;
  return {
    truth: T.length, got: G.length, paired: pairs.length, matched, mismatched, explained, explainedBy,
    pctExplained: T.length ? (matched + explained) / T.length : (G.length ? 0 : 1),
    missing: unpairedT.length, extra: extra.length,
    pct: T.length ? matched / T.length : (G.length ? 0 : 1),
    byField, typeCounts, details,
    samplesMissing: unpairedT.slice(0, 30).map((e) => `${e.t} ${e.h} on ${e.layer} in ${e.owner}`),
    samplesExtra: extra.slice(0, 30).map((e) => `${e.t} ${e.h} on ${e.layer} in ${e.owner}`),
  };
}

/** Counts per type per space ("model"/"paper"/"block") — the spec's "entity counts per type and per space". */
export function countsBySpace(set) {
  const out = {};
  for (const e of set.entities || []) { const s = (out[e.space] ||= {}); s[e.t] = (s[e.t] || 0) + 1; }
  return out;
}
