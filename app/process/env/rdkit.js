/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rdkit.js — RDKit MinimalLib (BSD-3-Clause, WebAssembly) as an ON-DEMAND add-on for structures (0.8 Track CH, CH.24; owner 2026-10-29: "RDKit in wasm as an add-on", rule 44).
 * Nothing loads at page start: `loadRDKit()` fetches the ~6 MB module the first time a person asks for the full chemistry. Without it, cheminfo.js (our own SMILES reader and
 * Joback estimates) still works; with it, a structure is validated and canonicalised by RDKit, drawn by RDKit, and described by its descriptors.
 *
 *   loadRDKit({ url?, importer? })     → rd (the RDKit module)
 *   describe(rd, smiles)              → { valid, canonical, molblock, svg, descriptors{ exactMass, mass, tpsa, logP, hbd, hba, rotatable, rings, heavy }, inchi? }
 *   fromMolblock(rd, molblock)        → { valid, smiles } (a drawn structure to a canonical SMILES)
 *   substructure(rd, smiles, smarts)  → { count, matches[] }
 * Molecule objects RDKit makes live in WebAssembly memory: every function here deletes what it creates.
 */
export const DEFAULT_URL = '/assets/vendor/rdkit/current/RDKit_minimal.js';
let loading = null;

async function nodeUrl() {
  if (typeof document !== 'undefined' || typeof process === 'undefined' || !process.versions?.node) return null;
  const { existsSync } = await import(/* @vite-ignore */ 'node:fs'), { fileURLToPath, pathToFileURL } = await import(/* @vite-ignore */ 'node:url'), path = await import(/* @vite-ignore */ 'node:path');
  let d = path.dirname(fileURLToPath(import.meta.url));
  for (let k = 0; k < 9; k++, d = path.dirname(d)) for (const base of ['public_html', '']) { const f = path.join(d, base, 'assets/vendor/rdkit/current/RDKit_minimal.js'); if (existsSync(f)) return { href: pathToFileURL(f).href, file: f }; }
  return null;
}
export function loadRDKit({ url, importer = (u) => import(/* @vite-ignore */ u) } = {}) {
  loading ||= (async () => {
    const found = url ? null : await nodeUrl(), href = url || (found && found.href) || DEFAULT_URL;
    const wasm = found ? found.file.replace(/\.js$/, '.wasm') : href.replace(/\.js(\?.*)?$/, '.wasm$1');
    const m = await importer(href); let init = m && (typeof m.default === 'function' ? m.default : typeof m === 'function' ? m : null);
    if (!init && typeof document !== 'undefined') {                     // in a page the file is a classic script (it sets initRDKitModule): load it with a script tag
      await new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = href; sc.onload = ok; sc.onerror = () => no(new Error('the script did not load')); document.head.append(sc); });
      init = typeof globalThis.initRDKitModule === 'function' ? globalThis.initRDKitModule : null;
    }
    return init({ locateFile: () => wasm });
  })().catch((e) => { loading = null; throw new Error('RDKit could not be loaded (' + (e && e.message ? e.message : e) + '). It is an add-on that loads the first time the full chemistry is asked for.'); });
  return loading;
}
export const forget = () => { loading = null; };

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? +v.toPrecision(7) : null);
function withMol(rd, text, fn) {
  if (typeof text !== 'string' || !text.trim() || text.length > 20000) return null;
  let m = null; try { m = rd.get_mol(text); } catch { m = null; }
  if (!m || (m.is_valid && !m.is_valid())) { if (m) m.delete(); return null; }
  try { return fn(m); } finally { m.delete(); }
}
export function describe(rd, smiles, { svgSize = 240 } = {}) {
  const out = withMol(rd, smiles, (m) => {
    const d = JSON.parse(m.get_descriptors().replace(/([:\[,]\s*)(-?\d+\.?\d*)E(-?\d+)/g, '$1$2e$3'));
    let svg = ''; try { svg = m.get_svg(svgSize, svgSize); } catch { /* drawing is optional */ }
    let inchi = ''; try { inchi = m.get_inchi ? m.get_inchi() : ''; } catch { /* the InChI part is not always built in */ }
    return { valid: true, canonical: m.get_smiles(), molblock: m.get_molblock(), svg,
      descriptors: { exactMass: num(d.exactmw), mass: num(d.amw), tpsa: num(d.tpsa), logP: num(d.CrippenClogP), hbd: num(d.NumHBD), hba: num(d.NumHBA), rotatable: num(d.NumRotatableBonds), rings: num(d.NumRings), heavy: num(d.NumHeavyAtoms), aromaticRings: num(d.NumAromaticRings) },
      inchi: inchi || undefined };
  });
  return out || { valid: false, canonical: '', molblock: '', svg: '', descriptors: {} };
}
export function fromMolblock(rd, molblock) {
  const out = withMol(rd, molblock, (m) => ({ valid: true, smiles: m.get_smiles() }));
  return out || { valid: false, smiles: '' };
}
export function substructure(rd, smiles, smarts) {
  if (typeof smarts !== 'string' || !smarts.trim() || smarts.length > 500) return { count: 0, matches: [], valid: false };
  let q = null; try { q = rd.get_qmol(smarts); } catch { q = null; }
  if (!q || (q.is_valid && !q.is_valid())) { if (q) q.delete(); return { count: 0, matches: [], valid: false }; }
  try {
    const r = withMol(rd, smiles, (m) => { const j = JSON.parse(m.get_substruct_matches(q)); return Array.isArray(j) ? j.map((x) => x.atoms) : []; });
    return r ? { count: r.length, matches: r, valid: true } : { count: 0, matches: [], valid: false };
  } finally { q.delete(); }
}
