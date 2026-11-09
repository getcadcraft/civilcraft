/* SPDX-License-Identifier: Apache-2.0 */
/**
 * errors.js — CAPE-OPEN errors as JavaScript errors (0.9 IND.3). Every adapter method that fails throws a CapeError; the COM shim turns
 * it into the HRESULT of its ECape name and answers ECapeUser (code, description, scope, interfaceName, operation, moreInfo) and ECapeRoot
 * (name) from its fields. Over the pipe it travels as `toWire()` (protocol.js) and comes back as the same error (`fromWire`).
 */
import { ECAPE_HR } from './names.js';

export class CapeError extends Error {
  /** name: an ECape* name from names.js ECAPE_HR; opts: { interface, operation, scope, moreInfo } */
  constructor(ecape, description, opts = {}) {
    super(description);
    this.ecape = ECAPE_HR[ecape] ? ecape : 'ECapeUnknown';
    this.hr = ECAPE_HR[this.ecape];
    this.interfaceName = opts.interface || '';
    this.operation = opts.operation || '';
    this.scope = opts.scope || 'CadCraft process engine';
    this.moreInfo = opts.moreInfo || '';
  }
  get code() { return this.hr; }
  toWire() { return { ecape: this.ecape, hr: '0x' + this.hr.toString(16).toUpperCase(), description: this.message, interface: this.interfaceName, operation: this.operation, scope: this.scope, moreInfo: this.moreInfo }; }
}
export const fromWire = (d) => new CapeError(d?.ecape || 'ECapeUnknown', d?.description || 'unknown error', { interface: d?.interface, operation: d?.operation, scope: d?.scope, moreInfo: d?.moreInfo });

/** Wrap any error thrown by our engine as a CapeError of `ecape` (a CapeError passes through unchanged). */
export function asCape(e, ecape, iface, operation) {
  if (e instanceof CapeError) return e;
  return new CapeError(ecape, String(e && e.message ? e.message : e), { interface: iface, operation });
}
/** A small helper: throw unless cond. */
export function need(cond, ecape, description, iface, operation) { if (!cond) throw new CapeError(ecape, description, { interface: iface, operation }); }
