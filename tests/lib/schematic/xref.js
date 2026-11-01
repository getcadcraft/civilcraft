/* SPDX-License-Identifier: Apache-2.0 */
/** Cross-references between a device's coil and its contacts (IEC 81346 style tags): "sheet.column" locations. */
import { problem } from './model.js';

export const where = (sch, s) => sch.sheetIndex(s.sheet) + '.' + s.col;

/** → Map(deviceTag → {coil: {id, at}|null, contacts: [{id, at, kind:'NO'|'NC'}]}) and problems (contact with no coil, coil with no contact). */
export function crossRefs(sch) {
  const dev = new Map(), problems = [];
  const get = (t) => { if (!dev.has(t)) dev.set(t, { coil: null, contacts: [] }); return dev.get(t); };
  for (const s of sch.symbols) {
    const t = s.device || s.tag;
    if (s.role === 'coil') {
      const d = get(t);
      if (d.coil) problems.push(problem('coil-twice', 'error', 'Device ' + t + ' has two coils (' + d.coil.at + ' and ' + where(sch, s) + ')', { symbol: s.id }));
      else d.coil = { id: s.id, at: where(sch, s) };
    } else if (s.role === 'contact-no' || s.role === 'contact-nc') get(t).contacts.push({ id: s.id, at: where(sch, s), kind: s.role === 'contact-no' ? 'NO' : 'NC' });
  }
  for (const [t, d] of dev) {
    if (!d.coil && d.contacts.length) problems.push(problem('contact-no-coil', 'error', 'Contact(s) of ' + t + ' at ' + d.contacts.map((c) => c.at).join(', ') + ' have no coil', { device: t }));
    if (d.coil && !d.contacts.length) problems.push(problem('coil-no-contact', 'warning', 'Coil ' + t + ' at ' + d.coil.at + ' has no contacts anywhere', { device: t }));
  }
  return { devices: dev, problems };
}

/** The text printed under a coil: "1.4 NO · 2.1 NC" is the plain form (no middle dots in site copy; this is drawing text, joined by spaces). */
export function xrefText(d) {
  return d.contacts.slice().sort((a, b) => a.kind === b.kind ? (a.at < b.at ? -1 : 1) : a.kind === 'NO' ? -1 : 1).map((c) => c.kind + ':' + c.at).join(' ');
}
