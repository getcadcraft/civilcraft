/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — a place's rules for the Land records add-on (0.11 LR.9). It is data: pack.json (format cadcraft-land-rules v1, made from the cited
 * research by `node tools/landrecords/make-packs.mjs`; never edit the copy). Switched on, it puts the pack on the page for the Land records
 * panel to offer (globalThis.ccLandRules); switched off, it takes it away. No code of its own beyond that, and no network call but its own file.
 */
export async function activate(api) {
  const pack = await (await fetch(api.url('pack.json'))).json();
  (globalThis.ccLandRules ||= []).push(pack);
  dispatchEvent(new Event('cc-land-rules'));
  api.onDeactivate(() => {
    const at = (globalThis.ccLandRules || []).indexOf(pack);
    if (at >= 0) globalThis.ccLandRules.splice(at, 1);
    dispatchEvent(new Event('cc-land-rules'));
  });
}
