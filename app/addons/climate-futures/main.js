/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the "Climate futures" DATA add-on (0.9 EG.46; owner decision: CMIP6 downscaled data as a data add-on, content first). Off until switched
 * on in Settings › Add-ons. It holds no code of its own beyond this: it reads pack.json (made by tools/climate/build-pack.mjs, copied here by
 * tools/climate/sync.mjs) and hands it to the shared climate registry (../../climate/registry.js), where the "Climate future" picker finds it.
 * Switching it off takes the pack away again. Sources and licences: DATA-SOURCES.md.
 */
let id = null;
export async function activate() {
  const [{ readPack }, { addPack }] = await Promise.all([import('../../climate/pack.js'), import('../../climate/registry.js')]);
  const text = await fetch(new URL('./pack.json', import.meta.url)).then((r) => { if (!r.ok) throw new Error('pack.json ' + r.status); return r.text(); });
  const r = readPack(text);
  if (!r.ok) throw new Error('climate pack: ' + r.errors.slice(0, 3).join('; '));
  id = addPack(r.pack, { origin: 'addon' });
  return { places: r.pack.locations.length, sample: r.pack.sample, source: r.pack.source };
}
export async function deactivate() {
  if (!id) return;
  const { removePack } = await import('../../climate/registry.js');
  removePack(id); id = null;
}
