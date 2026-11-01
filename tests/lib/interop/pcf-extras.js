/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pcf-extras.js — what a PCF file holds that a pipe run cannot draw: supports, olets, flanges, gaskets, blind flanges and caps (0.8 IND.4, ifc_PART_4).
 * DOM-free, import-free. importPcf (BimCraft mep/pcf-bim.js) turns straight chains into runs; this lists the rest as data with positions and says in the
 * Problems shape exactly what was NOT drawn, so nothing disappears silently.
 *
 *   extrasOf(model) → { supports: [{ pipeline, at, tag, attrs }], olets: [{ pipeline, centre, branch: {x,y,z,bore}, bore }],
 *                       flanges: [{ pipeline, at, bore, skey, blind }], gaskets: [{ pipeline, at, bore }], caps: [{ pipeline, at, bore }], problems }
 * Positions are millimetres (the model from readPcf already is). A host that has a marker or accessory object can place one per entry; until it does,
 * the problems carry the counts: the file's information is shown as "not drawn", never claimed.
 */
const mid = (c) => (c.ends.length >= 2 ? [(c.ends[0].x + c.ends[1].x) / 2, (c.ends[0].y + c.ends[1].y) / 2, (c.ends[0].z + c.ends[1].z) / 2] : c.ends.length ? [c.ends[0].x, c.ends[0].y, c.ends[0].z] : null);
const tagOf = (c) => (c.attrs.find(([k]) => /^(TAG|NAME|ITEM-CODE|SUPPORT-NAME|DESCRIPTION)$/.test(k)) || [null, ''])[1];

export function extrasOf(model) {
  const out = { supports: [], olets: [], flanges: [], gaskets: [], caps: [], problems: [] };
  for (const pl of model.pipelines) {
    for (const c of pl.components) {
      const ref = pl.ref;
      if (c.type === 'SUPPORT') {
        // a support is a point (CO-ORDS) with a tag and an optional direction/type in its attributes
        if (c.at) out.supports.push({ pipeline: ref, at: c.at.slice(), tag: tagOf(c), attrs: c.attrs.slice() });
      } else if (c.type === 'OLET') {
        if (c.centre && c.branch) out.olets.push({ pipeline: ref, centre: c.centre.slice(), branch: { ...c.branch }, bore: c.ends[0]?.bore || 0 });
      } else if (c.type === 'FLANGE' || c.type === 'FLANGE-BLIND') {
        const at = mid(c);
        if (at) out.flanges.push({ pipeline: ref, at, bore: c.ends[0]?.bore || 0, skey: c.skey || '', blind: c.type === 'FLANGE-BLIND' });
      } else if (c.type === 'GASKET') {
        const at = mid(c);
        if (at) out.gaskets.push({ pipeline: ref, at, bore: c.ends[0]?.bore || 0 });
      } else if (c.type === 'CAP') {
        const at = mid(c);
        if (at) out.caps.push({ pipeline: ref, at, bore: c.ends[0]?.bore || 0 });
      }
    }
  }
  const P = (code, n, text) => n && out.problems.push({ code, severity: 'note', vars: { n }, text: n + ' ' + text });
  P('pcf.import.support', out.supports.length, 'pipe support(s) in the file are not drawn: this model has no support object. Their positions and tags are kept as data (extrasOf).');
  P('pcf.import.olet', out.olets.length, 'olet(s) became the start of a branch run from the olet centre; the olet fitting itself is not drawn.');
  P('pcf.import.flange', out.flanges.length, 'flange(s) (blind flanges included) are not drawn as parts: the run passes through them and the model lays its own joints.');
  P('pcf.import.gasket', out.gaskets.length, 'gasket(s) are not drawn.');
  P('pcf.import.cap', out.caps.length, 'cap(s) are not drawn: the run simply ends there.');
  return out;
}
