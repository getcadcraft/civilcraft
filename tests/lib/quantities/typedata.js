// SPDX-License-Identifier: Apache-2.0
/**
 * typedata.js — the takeoff data a saved type carries (booklet row BK.40, session bk-quantities-10): the unit it is built of
 * (a brick, a block: name and size), its mortar, and a rate. Entered once on the type, stored with the type in the file, and
 * reported for every element of that type by the schedules and by what TakeoffCraft reads. Host-free: no imports, no DOM.
 * Canonical copy: lib/quantities/ (node tools/quantities/sync.mjs copies it to the apps).
 *
 * The data:  { unit?: { name, length, height, width },      sizes in mm
 *              mortar?: { name, joint },                    joint thickness in mm (0 = not given)
 *              rate?: { amount, currency, basis } }         amount per `basis`; currency a three-letter code (ISO 4217 style)
 *
 *   cleanTypeData(input) → { data: object | null, errors: [code] }   null = nothing entered; a wrong field is an error, never dropped silently
 *   RATE_BASES            'm2' | 'ft2' (net wall area) · 'm' | 'ft' (length) · 'each' (per wall)
 *   rateQuantity(basis, { netArea (mm²), length (mm), count }) → the quantity the rate multiplies, in the basis' unit
 *   rateAmount(rate, measured) → amount rounded to 2 decimals, or null with no rate
 *   unitText(data, fmtLen) · mortarText(data, fmtLen) · rateText(rate)   one-line readings for a table cell
 *
 * BK.42 (bk-measure-10): the unit may carry `waste` (percent added to the count, 0 to 100) and the mortar `extra` (percent added
 * to the mortar volume for frogs or perforations, 0 to 300); both absent unless the person enters them. A rate may also be per
 * unit ('unit'), per 1000 units ('k') or per m³ of mortar ('m3'): MASONRY_BASES; ALL_BASES = RATE_BASES + MASONRY_BASES. The
 * counting itself is masonry.js; rateQuantity takes its result as `units` (to order) and `mortar` (mm³).
 */

export const RATE_BASES = Object.freeze(['m2', 'ft2', 'm', 'ft', 'each']);
export const MASONRY_BASES = Object.freeze(['unit', 'k', 'm3']);                 // BK.42: per unit, per 1000 units, per m³ of mortar
export const ALL_BASES = Object.freeze([...RATE_BASES, ...MASONRY_BASES]);
export const BASIS_LABEL = Object.freeze({ m2: 'm²', ft2: 'ft²', m: 'm', ft: 'ft', each: 'each', unit: 'unit', k: '1000 units', m3: 'm³ mortar' });
export const LIMITS = Object.freeze({ name: 100, size: 5000, joint: 100, amount: 1e9, waste: 100, extra: 300 });
const FT = 304.8;

const text = (v) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
const blank = (v) => v === undefined || v === null || v === '';
const finite = (v) => typeof v === 'number' && Number.isFinite(v);

export function cleanTypeData(input) {
  const errors = [], data = {};
  if (input === undefined || input === null) return { data: null, errors };
  if (typeof input !== 'object' || Array.isArray(input)) return { data: null, errors: ['format'] };
  const u = input.unit, m = input.mortar, r = input.rate;
  if (u !== undefined && u !== null) {
    if (typeof u !== 'object') errors.push('unit');
    else {
      const name = text(u.name), sizes = ['length', 'height', 'width'].map((k) => u[k]);
      const any = name || sizes.some((v) => !blank(v)) || !blank(u.waste);
      if (any) {
        if (!name || name.length > LIMITS.name) errors.push('unit_name');
        const o = { name };
        ['length', 'height', 'width'].forEach((k, i) => {
          const v = sizes[i];
          if (blank(v)) return;
          if (!finite(v) || v <= 0 || v > LIMITS.size) { errors.push('unit_size'); return; }
          o[k] = v;
        });
        if (!blank(u.waste)) { if (!finite(u.waste) || u.waste < 0 || u.waste > LIMITS.waste) errors.push('unit_waste'); else o.waste = u.waste; }   // BK.42: 0 is a value (no waste, whatever the method says)
        data.unit = o;
      }
    }
  }
  if (m !== undefined && m !== null) {
    if (typeof m !== 'object') errors.push('mortar');
    else {
      const name = text(m.name);
      if (name || !blank(m.joint) || !blank(m.extra)) {
        if (!name || name.length > LIMITS.name) errors.push('mortar_name');
        const o = { name };
        if (!blank(m.joint)) { if (!finite(m.joint) || m.joint < 0 || m.joint > LIMITS.joint) errors.push('mortar_joint'); else if (m.joint > 0) o.joint = m.joint; }
        if (!blank(m.extra)) { if (!finite(m.extra) || m.extra < 0 || m.extra > LIMITS.extra) errors.push('mortar_extra'); else if (m.extra > 0) o.extra = m.extra; }   // BK.42
        data.mortar = o;
      }
    }
  }
  if (r !== undefined && r !== null) {
    if (typeof r !== 'object') errors.push('rate');
    else if (!blank(r.amount) || text(r.currency)) {
      const currency = text(r.currency).toUpperCase();
      if (!finite(r.amount) || r.amount < 0 || r.amount > LIMITS.amount) errors.push('rate_amount');
      if (!/^[A-Z]{3}$/.test(currency)) errors.push('rate_currency');
      if (!ALL_BASES.includes(r.basis)) errors.push('rate_basis');
      data.rate = { amount: r.amount, currency, basis: r.basis };
    }
  }
  const uniq = [...new Set(errors)];
  if (uniq.length) return { data: null, errors: uniq };
  return { data: Object.keys(data).length ? data : null, errors: [] };
}

/** The quantity a rate multiplies, in the unit of its basis. `measured` in mm² / mm / a count. */
export function rateQuantity(basis, { netArea = 0, length = 0, count = 0, units = 0, mortar = 0 } = {}) {
  if (basis === 'unit') return units;                    // BK.42: the units to order (masonry.js unitsOrder)
  if (basis === 'k') return units / 1000;
  if (basis === 'm3') return mortar / 1e9;               // the mortar volume, mm³ → m³
  if (basis === 'm2') return netArea / 1e6;
  if (basis === 'ft2') return netArea / (FT * FT);
  if (basis === 'm') return length / 1000;
  if (basis === 'ft') return length / FT;
  if (basis === 'each') return count;
  return 0;
}

export const money = (v) => Math.round((v + Number.EPSILON * Math.sign(v)) * 100) / 100;

/** rate × the measured quantity, to the cent. null without a rate. */
export function rateAmount(rate, measured) {
  if (!rate || !finite(rate.amount) || !ALL_BASES.includes(rate.basis)) return null;
  return money(rate.amount * rateQuantity(rate.basis, measured));
}

const fix2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
export function unitText(data, fmtLen = (mm) => mm + ' mm') {
  const u = data?.unit;
  if (!u) return '';
  const size = ['length', 'height', 'width'].filter((k) => u[k] > 0).map((k) => fmtLen(u[k])).join(' x ');
  return size ? u.name + ', ' + size : u.name;
}
export function mortarText(data, fmtLen = (mm) => mm + ' mm') {
  const m = data?.mortar;
  if (!m) return '';
  return m.joint > 0 ? m.name + ', ' + fmtLen(m.joint) : m.name;
}
export function rateText(rate) { return rate ? fix2(rate.amount) + ' ' + rate.currency + ' / ' + BASIS_LABEL[rate.basis] : ''; }
export function amountText(amount, currency) { return amount === null || amount === undefined ? '' : fix2(amount) + ' ' + currency; }
