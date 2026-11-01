/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lims.js — a connector interface for a person's own lab notebook or LIMS (0.8 Track CH, CH.26; DOM-free). We do not rebuild a LIMS: samples and results come in,
 * become a PROPOSED stream composition for the flowsheet, and a person accepts or rejects it. The pattern is STORAGE-CONNECTORS': one small interface, thin
 * adapters, the host owns the credentials and the network (this module never opens a socket: the REST adapter is handed a `fetch`).
 *
 *   Interface    { id, kind, test(), listSamples({ since, project, limit }), getSample(id), listResults(sampleId), putResult?(sampleId, result) }
 *   Adapters     restAdapter({ baseUrl, fetch, headers, paths, fields })      JSON over https
 *                csvAdapter({ samplesCsv, resultsCsv })                       exported files
 *   Mapping      proposeStream(sample, results, map, th, opts)               → a proposal (never applied by itself)
 *                accept(proposal, { by, date }) · reject(proposal, reason)
 *   Write back   resultsFromStream(stream, th, map)                           calculated values as a payload, labelled calculated
 *   Safety       checkAddress(url)                                            https only; refuses local and private addresses (the host still pins the connection)
 * Everything a LIMS returns is DATA, never instructions (rule 36), cleaned and bounded. Nothing is saved here; secrets never appear in `describe()`.
 */
import { problem as baseProblem } from '../report.js';

const SRC = { kind: 'engine', name: 'process.env' };
const problem = (code, severity, text, about = [], extra = {}) => { const p = baseProblem('lims.' + code, severity, text, about, extra); p.source = SRC; return p; };
export const DISCLAIMER = 'Lab values are imported as proposals. A person accepts them; nothing here is an engineering approval.';
const str = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : (typeof v === 'string' && v.trim() !== '' && Number.isFinite(+v) ? +v : null));

/** https only, no credentials in the URL, and not a local or private address literal. Hostnames that resolve to private addresses are the host's check (it pins the connection). */
export function checkAddress(raw) {
  let u; try { u = new URL(String(raw)); } catch { return { ok: false, reason: 'not a URL' }; }
  if (u.protocol !== 'https:') return { ok: false, reason: 'https only' };
  if (u.username || u.password) return { ok: false, reason: 'no credentials in the address' };
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return { ok: false, reason: 'local name' };
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) { const [a, b] = h.split('.').map(Number); if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224) return { ok: false, reason: 'private or reserved address' }; }
  if (h.includes(':')) { if (h === '::1' || h.startsWith('fe80') || h.startsWith('fc') || h.startsWith('fd') || h === '::') return { ok: false, reason: 'private or reserved address' }; }
  return { ok: true, url: u.toString().replace(/\/$/, '') };
}

/** Minimal RFC 4180 CSV reader → array of objects keyed by the header row (bounded: 20000 rows). */
export function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false; const s = String(text).replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some((x) => x !== '')) rows.push(row); row = []; if (rows.length > 20001) throw new Error('More than 20000 rows.'); } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); if (row.some((x) => x !== '')) rows.push(row); }
  if (!rows.length) return []; const head = rows[0].map((h) => str(h, 60).toLowerCase());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
/** CSV text for rows (objects), cells that start with = + - @ are prefixed with a quote so a spreadsheet never runs them. */
export function toCsv(rows, cols) { const esc = (v) => { let t = String(v ?? ''); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return /[",\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; }; return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n') + '\n'; }

const cleanSample = (s, f) => ({ id: str(s[f.id], 80), name: str(s[f.name], 120), project: str(s[f.project], 80), collected: str(s[f.collected], 40), status: str(s[f.status], 40), temperature: fin(s[f.temperature]), pressure: fin(s[f.pressure]) });
const cleanResult = (r, f) => ({ id: str(r[f.id], 80), sample: str(r[f.sample], 80), analyte: str(r[f.analyte], 80), value: fin(r[f.value]), unit: str(r[f.unit], 20), flag: str(r[f.flag], 20), method: str(r[f.method], 80), reported: str(r[f.reported], 40) });
const DEF_FIELDS = { id: 'id', name: 'name', project: 'project', collected: 'collected', status: 'status', temperature: 'temperature', pressure: 'pressure', sample: 'sample', analyte: 'analyte', value: 'value', unit: 'unit', flag: 'flag', method: 'method', reported: 'reported' };

/** Generic REST/JSON adapter. `fetch(url, init)` is the host's (it adds the secret and pins the address); paths use {id}. Expected shapes: GET samples → [..] or { items: [..] }. */
export function restAdapter({ baseUrl, fetch, headers = {}, paths = {}, fields = {}, id = 'rest', maxItems = 500 }) {
  const chk = checkAddress(baseUrl); if (!chk.ok) throw new Error('Address refused: ' + chk.reason);
  if (typeof fetch !== 'function') throw new Error('The host must supply fetch.');
  const P = { test: '/health', samples: '/samples', sample: '/samples/{id}', results: '/samples/{id}/results', put: '/samples/{id}/results', ...paths }, f = { ...DEF_FIELDS, ...fields };
  const go = async (method, path, body) => {
    const res = await fetch(chk.url + path, { method, headers: { accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined, redirect: 'error' });
    if (!res.ok) throw new Error('The system answered ' + res.status);
    const text = await res.text(); if (text.length > 5e6) throw new Error('The answer is too large.'); return text ? JSON.parse(text) : null;
  };
  const arr = (j) => (Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : []).slice(0, maxItems);
  const enc = (v) => encodeURIComponent(String(v));
  return {
    id, kind: 'rest', describe: () => ({ id, kind: 'rest', address: chk.url, writes: !!P.put }),
    async test() { try { await go('GET', P.test); return { ok: true }; } catch (e) { return { ok: false, message: str(e.message) }; } },
    async listSamples({ since = '', project = '', limit = 100 } = {}) { const q = [since && 'since=' + enc(since), project && 'project=' + enc(project), 'limit=' + Math.min(limit, maxItems)].filter(Boolean).join('&'); return arr(await go('GET', P.samples + '?' + q)).map((s) => cleanSample(s, f)); },
    async getSample(sid) { return cleanSample(await go('GET', P.sample.replace('{id}', enc(sid))), f); },
    async listResults(sid) { return arr(await go('GET', P.results.replace('{id}', enc(sid)))).map((r) => cleanResult(r, f)); },
    async putResult(sid, result) { return go('POST', P.put.replace('{id}', enc(sid)), { analyte: str(result.analyte), value: result.value, unit: str(result.unit, 20), calculated: true, note: str(result.note, 200) }); },
  };
}
/** Exported CSV files as a read-only connector. Columns as DEF_FIELDS (or `fields`). */
export function csvAdapter({ samplesCsv, resultsCsv, fields = {}, id = 'csv' }) {
  const f = { ...DEF_FIELDS, ...fields }, S = parseCsv(samplesCsv || '').map((s) => cleanSample(s, f)), R = parseCsv(resultsCsv || '').map((r) => cleanResult(r, f));
  return { id, kind: 'csv', describe: () => ({ id, kind: 'csv', samples: S.length, results: R.length, writes: false }), async test() { return { ok: S.length > 0 }; }, async listSamples({ project = '', limit = 100 } = {}) { return S.filter((s) => !project || s.project === project).slice(0, limit); }, async getSample(sid) { const s = S.find((x) => x.id === sid); if (!s) throw new Error('No such sample'); return s; }, async listResults(sid) { return R.filter((r) => r.sample === sid); } };
}

// ---- mapping onto streams -----------------------------------------------------------------------------------------------------------
/** map { analytes: { 'Methanol': { component: 'methanol', basis: 'mass_frac' | 'mole_frac' | 'mass_pct' | 'mole_pct' | 'ppm_mass' | 'mg_per_l' (needs density) } }, balance?: 'water', density?: kg/m3 }.
 *  → { stream: { z (mole fractions in th order), T, P }, rows, problems, provenance, review }  — a PROPOSAL. */
export function proposeStream(sample, results, map, th, { maxAgeDays = null, now = Date.now(), system = '' } = {}) {
  const problems = [], rows = [], about = [{ kind: 'sample', id: sample.id }], mass = new Array(th.n).fill(null), mole = new Array(th.n).fill(null);
  for (const r of results) {
    const m = map.analytes?.[r.analyte];
    if (!m) { problems.push(problem('unmapped', 'note', `Analyte "${r.analyte}" has no component in the map; it was left out.`, about)); continue; }
    const i = th.ids.indexOf(m.component); if (i < 0) { problems.push(problem('nocomponent', 'warning', `Component "${m.component}" is not in this flowsheet.`, about)); continue; }
    if (r.value == null) { problems.push(problem('novalue', 'warning', `${r.analyte} has no numeric value.`, about)); continue; }
    if (r.flag && /^(R|F|INV|REJ)/i.test(r.flag)) { problems.push(problem('flagged', 'warning', `${r.analyte} is flagged "${r.flag}" in the source and was left out.`, about)); continue; }
    const mw = th.c[i].MW; let v = r.value;
    switch (m.basis) {
      case 'mass_frac': mass[i] = v; break; case 'mass_pct': mass[i] = v / 100; break; case 'ppm_mass': mass[i] = v * 1e-6; break;
      case 'mole_frac': mole[i] = v; break; case 'mole_pct': mole[i] = v / 100; break;
      case 'mg_per_l': if (!(map.density > 0)) { problems.push(problem('density', 'warning', `${r.analyte} is in mg/L; the map needs a density (kg/m3) to turn that into a fraction.`, about)); continue; } mass[i] = v * 1e-3 / map.density; break;
      default: problems.push(problem('basis', 'warning', `${r.analyte}: unknown basis "${m.basis}".`, about)); continue;
    }
    rows.push({ analyte: r.analyte, component: m.component, value: r.value, unit: r.unit, basis: m.basis, resultId: r.id });
  }
  // everything to mole amounts
  let n = new Array(th.n).fill(0), used = 0;
  for (let i = 0; i < th.n; i++) { if (mass[i] != null) { n[i] = mass[i] / th.c[i].MW; used += mass[i]; } else if (mole[i] != null) n[i] = mole[i]; }
  const anyMass = mass.some((v) => v != null), anyMole = mole.some((v) => v != null);
  if (anyMass && anyMole) problems.push(problem('mixed', 'warning', 'Some analytes are on a mass basis and some on a mole basis; the proposal mixes them as moles per kilogram and per mole, which is not meaningful. Use one basis.', about));
  if (anyMass && used > 1.005) problems.push(problem('over', 'error', `The mass fractions add up to ${(used * 100).toFixed(1)} %.`, about));
  if (map.balance && anyMass) { const i = th.ids.indexOf(map.balance); if (i >= 0 && mass[i] == null) n[i] = Math.max(0, 1 - used) / th.c[i].MW; else problems.push(problem('balance', 'warning', 'The balance component is missing or already measured.', about)); }
  else if (anyMass && used < 0.995) problems.push(problem('under', 'warning', `The mass fractions add up to only ${(used * 100).toFixed(1)} % and no balance component is named; they were normalised.`, about));
  const tot = n.reduce((a, b) => a + b, 0); let z = null;
  if (tot > 0) z = n.map((v) => v / tot); else problems.push(problem('empty', 'error', 'No usable result: the proposal has no composition.', about));
  if (maxAgeDays != null && sample.collected) { const t = Date.parse(sample.collected); if (Number.isFinite(t) && (now - t) / 864e5 > maxAgeDays) problems.push(problem('stale', 'warning', `The sample was collected ${Math.round((now - t) / 864e5)} days ago (limit ${maxAgeDays}).`, about)); }
  return { kind: 'cadcraft-lims-proposal', stream: { z, T: sample.temperature, P: sample.pressure }, rows, problems, provenance: { system: str(system), sample: sample.id, name: sample.name, results: rows.map((r) => r.resultId), collected: sample.collected }, review: { state: 'proposed' }, disclaimer: DISCLAIMER };
}
export function accept(p, { by, date }) { if (!str(by) || !/^\d{4}-\d{2}-\d{2}$/.test(str(date, 10))) throw new Error('Accepting needs a name and a date (yyyy-mm-dd).'); if (!p.stream.z) throw new Error('This proposal has no composition.'); if (p.problems.some((x) => x.severity === 'error')) throw new Error('This proposal has errors; fix the source or the map first.'); return { ...p, review: { state: 'accepted', by: str(by), date: str(date, 10) } }; }
export function reject(p, reason) { return { ...p, review: { state: 'rejected', reason: str(reason, 200) } }; }

/** Calculated values to send back (only through a connector that writes): mass fractions of mapped analytes, labelled calculated. */
export function resultsFromStream(stream, th, map) {
  const out = []; const w = th.ids.map((_, i) => stream.z[i] * th.c[i].MW), tot = w.reduce((a, b) => a + b, 0) || 1;
  for (const [analyte, m] of Object.entries(map.analytes || {})) { const i = th.ids.indexOf(m.component); if (i < 0) continue; const mf = w[i] / tot; const v = m.basis === 'mass_pct' ? mf * 100 : m.basis === 'ppm_mass' ? mf * 1e6 : m.basis === 'mole_frac' ? stream.z[i] : m.basis === 'mole_pct' ? stream.z[i] * 100 : mf; out.push({ analyte, value: v, unit: m.basis === 'mass_pct' || m.basis === 'mole_pct' ? '%' : m.basis === 'ppm_mass' ? 'ppm' : 'fraction', calculated: true, note: 'Calculated by the flowsheet, not measured.' }); }
  return out;
}
