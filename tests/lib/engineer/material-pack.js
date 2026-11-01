/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer errors; the script layer words them for the user */
/**
 * material-pack.js — reads a `cadcraft-material-pack` (0.8 CE.13; docs/ADDONS-SPEC.md, Library kind `materials`). Data, not code: a pack holds curves
 * (equation form from a fixed list, coefficients, valid range, fit error, source); this file evaluates them. DOM-free.
 *
 *   validatePack(pack)                  → [problem strings]; [] means the pack is well formed (every curve has its source, range and fit error)
 *   packHash(pack)                      → SHA-256 hex of the pack's canonical JSON (async; the data sheet prints id, version and hash)
 *   materialAt(pack, id, prop, T [K])   → { value, unit, ref, fitError, range, pack:{id,version} }; throws EngError('range') outside the curve's range,
 *                                          EngError('material') for an unknown material or property. Never extrapolates.
 *   listMaterials(pack)                 → [{ id, name, props:[{ prop, name, unit, range }] }]
 * Forms: log10poly  y = 10^(a + b L + c L^2 + ... + i L^8), L = log10 T      poly4  y = a + bT + cT^2 + dT^3 + eT^4 (constant `below` under `tlow`)
 * The value returned is y * scale, in `unit` (linear expansion: scale 1e-5, so the value is the dimensionless (L - L293)/L293).
 */
import { EngError } from './eng-data.js';
import { F } from './host.js';

export const FORMS = ['log10poly', 'poly4'];
const NEED = { log10poly: 9, poly4: 5 };
const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
const pow10 = (x) => (F.dpow ? F.dpow(10, x) : Math.pow(10, x));
const log10 = (x) => (F.dlog10 ? F.dlog10(x) : Math.log10(x));

export function validatePack(pack) {
  const bad = [];
  if (!pack || typeof pack !== 'object') return ['not an object'];
  if (pack.format !== 'cadcraft-material-pack') bad.push('format must be cadcraft-material-pack');
  if (pack.version !== 1) bad.push('version must be 1');
  for (const k of ['id', 'name', 'packVersion', 'license', 'author', 'changeNotice']) if (typeof pack[k] !== 'string' || !pack[k]) bad.push('missing ' + k);
  if (!pack.source || !/^https:\/\//.test(pack.source.index || '') || !pack.source.accessed) bad.push('pack source needs an https index URL and an accessed date');
  if (!pack.materials || typeof pack.materials !== 'object' || !Object.keys(pack.materials).length) bad.push('no materials');
  for (const [mid, m] of Object.entries(pack.materials || {})) {
    if (!m.name) bad.push(mid + ': missing name');
    if (!/^https:\/\//.test(m.page || '')) bad.push(mid + ': every material carries its source page URL');
    for (const [pid, p] of Object.entries(m.properties || {})) {
      const w = mid + '.' + pid;
      if (!p.unit || !p.name) bad.push(w + ': name and unit');
      if (!isNum(p.scale) || p.scale <= 0) bad.push(w + ': scale');
      if (!isNum(p.fitError) || p.fitError <= 0 || p.fitError >= 1) bad.push(w + ': fit error is a fraction between 0 and 1');
      if (!Array.isArray(p.segments) || !p.segments.length) { bad.push(w + ': no segments'); continue; }
      let prevHi = null;
      p.segments.forEach((s, i) => {
        const x = w + '[' + i + ']';
        if (!FORMS.includes(s.form)) { bad.push(x + ': form not in ' + FORMS.join('/')); return; }
        if (!Array.isArray(s.coeffs) || s.coeffs.length !== NEED[s.form] || !s.coeffs.every(isNum)) bad.push(x + ': ' + NEED[s.form] + ' numeric coefficients');
        for (const r of ['range', 'dataRange', 'equationRange']) if (!Array.isArray(s[r]) || s[r].length !== 2 || !isNum(s[r][0]) || !isNum(s[r][1]) || !(s[r][0] >= 0) || !(s[r][0] < s[r][1]) || (r !== 'dataRange' && !(s[r][0] > 0))) bad.push(x + ': ' + r + ' [lo, hi] in K, 0 < lo < hi (dataRange may start at 0)');
        if (Array.isArray(s.range) && Array.isArray(s.equationRange) && (s.range[0] < s.equationRange[0] || s.range[1] > s.equationRange[1])) bad.push(x + ': range lies outside the equation range');
        if (s.form === 'poly4' && (s.tlow != null || s.below != null) && !(isNum(s.tlow) && isNum(s.below))) bad.push(x + ': tlow and below go together');
        if (prevHi !== null && Array.isArray(s.range) && s.range[0] !== prevHi) bad.push(x + ': segments must meet (no gap, no overlap)');
        if (Array.isArray(s.range)) prevHi = s.range[1];
      });
    }
  }
  return bad;
}

export async function packHash(pack) {
  const canon = (v) => (Array.isArray(v) ? '[' + v.map(canon).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}' : JSON.stringify(v));
  const buf = new TextEncoder().encode(canon(pack));
  const d = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', buf));
  return Array.from(d, (b) => b.toString(16).padStart(2, '0')).join('');
}

function evalSeg(s, T) {
  const c = s.coeffs;
  if (s.form === 'log10poly') { const L = log10(T); let a = 0; for (let i = c.length - 1; i >= 0; i--) a = a * L + c[i]; return pow10(a); }
  if (s.tlow != null && T < s.tlow) return s.below;
  return c[0] + T * (c[1] + T * (c[2] + T * (c[3] + T * c[4])));
}

export function materialAt(pack, id, prop, T) {
  const m = pack && pack.materials && pack.materials[id];
  if (!m) throw new EngError('material', { what: 'material', id });
  const p = m.properties[prop];
  if (!p) throw new EngError('material', { what: 'property ' + prop + ' of ' + id, id, prop });
  const lo = p.segments[0].range[0], hi = p.segments[p.segments.length - 1].range[1];
  if (!isNum(T) || T < lo || T > hi) throw new EngError('range', { what: m.name + ' ' + p.name + ' temperature (K)', value: T, lo, hi });
  const s = p.segments.find((g) => T >= g.range[0] && T <= g.range[1]);
  return {
    value: evalSeg(s, T) * p.scale, unit: p.unit, T,
    fitError: p.fitError, range: [lo, hi],
    ref: 'NIST Cryogenics Technologies Group, ' + m.page + ' (' + p.name + ', ' + s.form + ' fit, ' + (p.fitError * 100) + '% vs data, accessed ' + pack.source.accessed + ')',
    pack: { id: pack.id, version: pack.packVersion },
  };
}

export function listMaterials(pack) {
  return Object.entries(pack.materials).map(([id, m]) => ({ id, name: m.name,
    props: Object.entries(m.properties).map(([prop, p]) => ({ prop, name: p.name, unit: p.unit, range: [p.segments[0].range[0], p.segments[p.segments.length - 1].range[1]] })) }));
}

// ---- the packs a host has installed (0.8 CE.13): CraftScript's material_at reads these -------------------------------------------------------------

const INSTALLED = new Map();   // pack id → { pack, hash }
/** Install a validated pack (refuses a pack that does not validate). `hash` = its packHash, printed on the data sheet. */
export function installPack(pack, hash = '') {
  const bad = validatePack(pack);
  if (bad.length) throw new EngError('pack', { id: pack && pack.id, bad: bad.join('; ') });
  INSTALLED.set(pack.id, { pack, hash: String(hash || '') });
  return pack.id;
}
export const installedPacks = () => [...INSTALLED.values()];
/** → { ...materialAt result, hash } from the first installed pack that has the material; EngError('material') when none does. */
export function materialAtAny(id, prop, T) {
  for (const { pack, hash } of INSTALLED.values()) if (pack.materials && pack.materials[id]) return { ...materialAt(pack, id, prop, T), hash };
  throw new EngError('material', { what: 'material', id, name: id, known: installedPacks().flatMap(({ pack }) => Object.keys(pack.materials)).join(', ') });
}
