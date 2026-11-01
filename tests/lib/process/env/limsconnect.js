/* SPDX-License-Identifier: Apache-2.0 */
/**
 * limsconnect.js — the connection screen for a person's own lab system (0.8 Track CH, CH.26; DOM-free). The screen is data: `SCREEN` lists the fields a host
 * draws; `validate(profile)` checks what the person typed; `build(profile, hostFetch)` makes the adapter of lims.js; `trial(profile, hostFetch)` walks the
 * connection step by step (reach, list, one sample, its results, the field map) and says which step failed in words; `redact(profile)` is what may be stored
 * in the drawing. The module never opens a socket and never stores a secret: the secret is a NAME the host resolves (`secretRef`), kept in the host's own
 * credential store; the profile carries the header NAME ("Authorization") but never its value.
 */
import { checkAddress, restAdapter, csvAdapter } from './lims.js';
import { problem as baseProblem } from '../report.js';

const problem = (code, severity, text, about = []) => { const p = baseProblem('limsconnect.' + code, severity, text, about); p.source = { kind: 'engine', name: 'process.env' }; return p; };
const str = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
export const SCREEN = Object.freeze([
  { key: 'kind', label: 'How do the samples reach us', type: 'choice', choices: [{ id: 'rest', label: 'A web service (REST, JSON)' }, { id: 'csv', label: 'Exported files (CSV)' }], required: true },
  { key: 'name', label: 'Name for this connection', type: 'text', required: true, max: 60 },
  { key: 'baseUrl', label: 'Address (https only)', type: 'url', required: true, when: { kind: 'rest' }, help: 'Local and private addresses are refused.' },
  { key: 'authHeader', label: 'Header that carries your key', type: 'text', when: { kind: 'rest' }, help: 'For example Authorization. Only the header name is saved.' },
  { key: 'secretRef', label: 'Which saved key to use', type: 'secret', when: { kind: 'rest' }, help: 'The key stays in this computer\'s credential store; it is never put in the drawing.' },
  { key: 'paths', label: 'Paths (if your system differs)', type: 'map', when: { kind: 'rest' }, keys: ['test', 'samples', 'sample', 'results', 'put'], help: 'Use {id} for the sample id.' },
  { key: 'fields', label: 'Field names (if your system differs)', type: 'map', keys: ['id', 'name', 'project', 'collected', 'status', 'temperature', 'pressure', 'sample', 'analyte', 'value', 'unit', 'flag', 'method', 'reported'] },
  { key: 'writeBack', label: 'Send calculated values back', type: 'bool', default: false, help: 'Off by default. Values sent back are labelled calculated.' },
]);
export function validate(raw) {
  const p = raw && typeof raw === 'object' ? raw : {}, errors = {}, out = { kind: p.kind === 'csv' ? 'csv' : p.kind === 'rest' ? 'rest' : '', name: str(p.name, 60), fields: {}, paths: {}, writeBack: p.writeBack === true };
  if (!out.kind) errors.kind = 'Choose how the samples reach us.';
  if (!out.name) errors.name = 'Give the connection a name.';
  if (out.kind === 'rest') {
    const c = checkAddress(p.baseUrl); if (!c.ok) errors.baseUrl = 'Address refused: ' + c.reason + '.'; else out.baseUrl = c.url;
    out.authHeader = str(p.authHeader, 40); if (out.authHeader && !/^[A-Za-z][A-Za-z0-9-]*$/.test(out.authHeader)) errors.authHeader = 'A header name has letters, digits and dashes only.';
    out.secretRef = str(p.secretRef, 60); if (out.authHeader && !out.secretRef) errors.secretRef = 'Choose the saved key to send in that header.';
    for (const k of ['test', 'samples', 'sample', 'results', 'put']) if (p.paths && p.paths[k] != null) { const v = str(p.paths[k], 120); if (!v.startsWith('/') || v.includes('..') || /[\s?#]/.test(v)) errors['paths.' + k] = 'A path starts with / and has no spaces, ? or #.'; else out.paths[k] = v; }
  }
  for (const [k, v] of Object.entries(p.fields || {})) if (SCREEN.find((f) => f.key === 'fields').keys.includes(k)) out.fields[k] = str(v, 60);
  if (out.writeBack && out.kind !== 'rest') errors.writeBack = 'Only a web service can take values back.';
  return { ok: Object.keys(errors).length === 0, errors, profile: out };
}
/** What is saved in the drawing: never a secret, only its name. */
export const redact = (profile) => { const v = validate(profile); const { secretRef, ...rest } = v.profile; return { ...rest, secretRef: secretRef || '' }; };
/** makes the adapter. hostFetch(url, init, secretRef) is the host's: it adds the secret to the named header and pins the address. csv: { samplesCsv, resultsCsv }. */
export function build(profile, { hostFetch, csv } = {}) {
  const v = validate(profile); if (!v.ok) throw new Error('The connection is not complete: ' + Object.values(v.errors).join(' '));
  const pr = v.profile;
  if (pr.kind === 'csv') return csvAdapter({ samplesCsv: csv?.samplesCsv, resultsCsv: csv?.resultsCsv, fields: pr.fields, id: pr.name });
  if (typeof hostFetch !== 'function') throw new Error('The host must supply hostFetch.');
  const fetch = (url, init) => hostFetch(url, { ...init, headers: { ...(init.headers || {}) } }, pr.secretRef || null);
  const a = restAdapter({ baseUrl: pr.baseUrl, fetch, headers: {}, paths: pr.paths, fields: pr.fields, id: pr.name });
  if (!pr.writeBack) delete a.putResult;
  return a;
}
/** Walk the connection and say which step failed. → { ok, steps: [{ step, ok, message }], problems }. */
export async function trial(profile, opts) {
  const steps = [], problems = [], add = (step, ok, message) => { steps.push({ step, ok, message: str(message, 200) }); if (!ok) problems.push(problem('step', 'error', `${step}: ${message}`, [{ id: step }])); return ok; };
  let a; try { a = build(profile, opts); add('Settings', true, 'The settings are complete.'); } catch (e) { add('Settings', false, e.message); return { ok: false, steps, problems }; }
  const t = await a.test(); if (!add('Reach the system', !!t.ok, t.ok ? 'It answered.' : t.message || 'No answer.')) return { ok: false, steps, problems };
  let list; try { list = await a.listSamples({ limit: 3 }); add('List samples', true, list.length + ' sample(s) came back.'); } catch (e) { add('List samples', false, e.message); return { ok: false, steps, problems }; }
  if (!list.length) { add('Read one sample', false, 'No sample to read: check the project or the Samples path.'); return { ok: false, steps, problems }; }
  try { const s = await a.getSample(list[0].id); add('Read one sample', !!s && !!s.id, s && s.id ? 'Sample ' + s.id + ' was read.' : 'The sample has no id: check the field names.'); } catch (e) { add('Read one sample', false, e.message); return { ok: false, steps, problems }; }
  try { const r = await a.listResults(list[0].id); add('Read its results', true, r.length + ' result(s); ' + (r.filter((x) => x.analyte && x.value != null).length) + ' have an analyte and a number.'); } catch (e) { add('Read its results', false, e.message); }
  return { ok: steps.every((s) => s.ok), steps, problems, writes: !!a.putResult };
}
