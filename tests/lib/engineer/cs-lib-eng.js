/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cs-lib-eng.js — CraftScript builtins under the engineering library (0.8 CE.4; DOM-free; script worker and Node).
 * The formulas are scripts (craftlib/eng/*.craft, readable and checkable); these builtins hold what a script cannot: the unit
 * table and the property data, each with its source.
 *
 *   to_si(v, unit, kind) · from_si(v, unit, kind) · unit_convert(v, from, to) · unit_kind(unit)     units with dimensions (eng-units.js)
 *   temp_k(v, 'C'|'F'|'K'|'R') · temp_from_k(K, scale)                                               temperature points (they have an offset)
 *   fluid('water'|'air', T, p) · material(id) · q(value, unit, ref)                                   a quantity is struct(value, unit, ref)
 * `kind` is a unit that names the dimension expected: to_si(p, 'bar', 'Pa') refuses a unit that is not a pressure.
 */
import * as U from './eng-units.js';
import * as D from './eng-data.js';
import { t, SH, hasCheck } from './host.js';
import { CHECK_KINDS } from './contract.js';
import { installPack, materialAtAny, installedPacks } from './material-pack.js';
import { PACK as NIST_CRYO, HASH as NIST_CRYO_HASH } from './nist-cryo-pack.js';

try { installPack(NIST_CRYO, NIST_CRYO_HASH); } catch { /* a pack that does not validate is simply not installed */ }

const asTensor = (...a) => SH.asTensor(...a), scalarOf = (...a) => SH.scalarOf(...a);
const err = (msg) => new SH.CsError(msg);
const struct = (o) => ({ t: 'struct', fields: o });
const quantity = (x) => struct({ value: x.value, unit: x.unit, ref: x.ref });
const str = (v, what) => { if (typeof v !== 'string') throw err(t('script.eng.not_text', { what })); return v; };
/** Words for the errors the unit and data modules raise. */
function words(e) {
  if (e instanceof U.UnitError) return err(e.code === 'kind' ? t('script.eng.unit_kind', e.vars) : t('script.eng.unit_unknown', e.vars));
  if (e instanceof D.EngError) {
    const v = e.vars;
    if (e.code === 'range') return err(t(v.lo !== undefined ? 'script.eng.range' : 'script.eng.range_pos', { what: v.what, value: String(+(+v.value).toPrecision(6)), lo: v.lo, hi: v.hi }));
    if (e.code === 'fluid') return err(t('script.eng.fluid', v));
    if (e.code === 'material' && v.prop) return err(t('script.eng.property', { id: v.id, prop: v.prop }));
    if (e.code === 'material') return err(t('script.eng.material', v.name !== undefined ? v : { name: v.id || v.what, known: v.known || '' }));
    if (e.code === 'pack') return err(t('script.eng.pack', v));
  }
  return e;
}
const wrap = (fn) => (a, ctx) => { try { return fn(a, ctx); } catch (e) { throw words(e); } };
const num = (v, what) => scalarOf(v, what);

/** Elementwise over a tensor argument, scalar in → scalar out. */
const each = (v, f, what) => {
  if (typeof v === 'number') return f(v);
  const T = asTensor(v, what), d = new Float64Array(T.data.length);
  for (let i = 0; i < d.length; i++) d[i] = f(T.data[i]);
  return { t: 'tensor', shape: T.shape.slice(), data: d };
};
const kindArg = (a) => (a === undefined ? undefined : str(a, 'kind'));

const BUILTINS = {
  to_si: [wrap((a) => each(a[0], (x) => U.toSI(x, str(a[1], 'unit'), kindArg(a[2])), 'value')), 'x = to_si(v, unit, kind)'],
  from_si: [wrap((a) => each(a[0], (x) => U.fromSI(x, str(a[1], 'unit'), kindArg(a[2])), 'value')), 'v = from_si(x, unit, kind)'],
  unit_convert: [wrap((a) => each(a[0], (x) => U.convert(x, str(a[1], 'from'), str(a[2], 'to')), 'value')), 'y = unit_convert(v, from, to)'],
  unit_kind: [wrap((a) => U.kindName(U.dimOf(str(a[0], 'unit')))), 'k = unit_kind(unit)'],
  temp_k: [wrap((a) => {
    const s = str(a[1], 'scale');
    const f = { K: (x) => x, C: U.cToK, F: U.fToK, R: (x) => x * 5 / 9 }[s];
    if (!f) throw err(t('script.eng.temp_scale'));
    return each(a[0], f, 'temperature');
  }), 'T = temp_k(v, scale)'],
  temp_from_k: [wrap((a) => {
    const s = str(a[1], 'scale');
    const f = { K: (x) => x, C: U.kToC, F: U.kToF, R: (x) => x * 9 / 5 }[s];
    if (!f) throw err(t('script.eng.temp_scale'));
    return each(a[0], f, 'temperature');
  }), 'v = temp_from_k(T, scale)'],
  fluid: [wrap((a) => {
    const r = D.fluidProps(str(a[0], 'fluid'), num(a[1], 'T'), a[2] === undefined ? 101325 : num(a[2], 'p'));
    return struct(Object.fromEntries(Object.entries(r).map(([k, x]) => [k, quantity(x)])));
  }), 'f = fluid(name, T, p)'],
  material: [wrap((a) => {
    const r = D.materialProps(str(a[0], 'material'));
    return struct(Object.fromEntries(Object.entries(r).map(([k, x]) => [k, typeof x === 'string' ? x : quantity(x)])));
  }), 'm = material(id)'],
  // 0.8 CE.13: a property of a material from an installed pack (NIST cryogenic curves) at a temperature in kelvin: a quantity with its source on it
  // and the pack's id, version and hash in `note`, so the data sheet names exactly what it used. Outside the curve's range it refuses (never extrapolates).
  material_at: [wrap((a) => {
    const r = materialAtAny(str(a[0], 'material'), str(a[1], 'property'), num(a[2], 'T'));
    return struct({ value: r.value, unit: r.unit, ref: r.ref, note: t('script.eng.pack_note', { id: r.pack.id, version: r.pack.version, hash: r.hash ? r.hash.slice(0, 16) : 'n/a', fit: +(r.fitError * 100).toPrecision(3), lo: r.range[0], hi: r.range[1] }), fit_error: r.fitError, lo: r.range[0], hi: r.range[1] });
  }), 'x = material_at(id, property, T_kelvin)'],
  material_list: [wrap(() => installedPacks().flatMap(({ pack }) => Object.entries(pack.materials).map(([id, m]) => id + ' (' + Object.keys(m.properties).join(', ') + ')')).join('; ')), 's = material_list()'],
  solver_available: [wrap((a) => {
    const kind = str(a[0], 'kind');
    if (!CHECK_KINDS.includes(kind)) throw err(t('script.eng.solver_kind', { known: CHECK_KINDS.join(', ') }));
    return hasCheck(kind);
  }), 'ok = solver_available(kind)'],
  solver_none: [wrap((a) => t('eng.check.none', { kind: str(a[0], 'kind') })), 's = solver_none(kind)'],
  q: [wrap((a) => {
    const v = a[0];
    if (typeof v !== 'number' && typeof v !== 'string' && typeof v !== 'boolean') throw err(t('script.eng.q_value'));
    return struct({ value: v, unit: a[1] === undefined ? '' : str(a[1], 'unit'), ref: a[2] === undefined ? '' : str(a[2], 'ref') });
  }), 'x = q(value, unit, ref)'],
};

export const skipped = [];
let registered = false;
export function register(registerBuiltin = SH.registerBuiltin) {
  if (typeof registerBuiltin !== 'function') return skipped;     // no host yet: the host's shim registers once it has called setHost
  const own = registerBuiltin === SH.registerBuiltin;
  if (own && registered) return skipped;
  for (const [name, [fn, args]] of Object.entries(BUILTINS)) {
    try { registerBuiltin(name, fn, { args, module: 'eng' }); } catch { if (own) skipped.push(name); }   // doc: script.doc.<name> in the language file
  }
  if (own) registered = true;
  return skipped;
}
register();
export { BUILTINS };
