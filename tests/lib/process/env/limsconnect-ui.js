/* SPDX-License-Identifier: Apache-2.0 */
/**
 * limsconnect-ui.js — the "Connect your lab system" panel (0.9, CH.26): draws limsconnect.SCREEN as a form for the P&ID add-on. The person picks web service or exported files,
 * names the connection, types the https address, the header NAME and which saved key to use, then checks the settings (works anywhere) or tests the connection step by step (only
 * inside CadCraft Studio, whose bridge.hostFetch(url, init, secretRef) adds the secret and pins the address; a browser tab sends nothing). What is saved is `redact(profile)`:
 * never a secret. Nothing is written back to the lab system unless the person ticks "Send calculated values back". Not an engineering approval. DOM text goes in through textContent.
 *
 *   mountLims(el, { load(), save(profile), bridge?(), publish?(problems) }) → { check(), test(), profile(), refresh() }
 */
import { SCREEN, validate, redact, trial } from './limsconnect.js';

export const WORDS = {
  lede: 'Connect your own lab system so its samples and results can become proposed streams. You accept or reject each proposal; nothing is applied by itself.',
  check: 'Check the settings', test: 'Test the connection', save: 'Save',
  ok: 'The settings are complete.', needStudio: 'Testing the connection needs CadCraft Studio, which adds your key and pins the address. A browser tab cannot; nothing was sent. The settings check works anywhere.',
  saved: 'Saved. Only the name of the key is kept, never the key.', note: 'Read only unless you tick "Send calculated values back". Values sent back are labelled calculated. A drafting and study aid, not an engineering approval.',
  mapHelp: 'One per line, name=value',
};
const mapToText = (m) => Object.entries(m || {}).map(([k, v]) => k + '=' + v).join('\n');
const textToMap = (s) => { const o = {}; for (const line of String(s || '').split('\n')) { const i = line.indexOf('='); if (i > 0) { const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim(); if (k && v) o[k] = v; } } return o; };

export function mountLims(el, { load = () => null, save = () => {}, bridge = () => globalThis.ccStudioBridge || null, publish = () => {} } = {}) {
  const d = el.ownerDocument, mk = (tag, cls, text) => { const n = d.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const saved = load() || {}, inputs = {}, rows = {};
  const out = mk('div', 'meta-items'); out.setAttribute('data-lims-out', '');
  const form = mk('div');
  for (const f of SCREEN) {
    let inp;
    if (f.type === 'choice') { inp = mk('select'); inp.append(mk('option', '', '')); for (const c of f.choices) { const o = mk('option', '', c.label); o.value = c.id; inp.append(o); } inp.value = saved[f.key] || ''; }
    else if (f.type === 'bool') { inp = mk('input'); inp.type = 'checkbox'; inp.checked = saved[f.key] === true; }
    else if (f.type === 'map') { inp = mk('textarea'); inp.rows = 3; inp.value = mapToText(saved[f.key]); inp.placeholder = WORDS.mapHelp + (f.keys ? ' (' + f.keys.join(', ') + ')' : ''); }
    else { inp = mk('input'); inp.type = 'text'; inp.value = saved[f.key] || ''; if (f.max) inp.maxLength = f.max; }
    inp.setAttribute('data-lims-field', f.key); inputs[f.key] = inp;
    const row = mk('label'); row.setAttribute('data-lims-row', f.key); row.append(mk('span', '', f.label + (f.required ? ' *' : '') + ' '), inp); if (f.help) row.append(mk('small', 'text-ink-2', ' ' + f.help));
    rows[f.key] = { row, f }; form.append(row);
  }
  const profile = () => {
    const p = {};
    for (const f of SCREEN) { const i = inputs[f.key]; p[f.key] = f.type === 'bool' ? i.checked : f.type === 'map' ? textToMap(i.value) : i.value; }
    return p;
  };
  const sync = () => { const k = inputs.kind.value; for (const { row, f } of Object.values(rows)) row.hidden = !!(f.when && f.when.kind !== k); };
  inputs.kind.addEventListener('change', sync);
  const show = (lines, bad) => { out.replaceChildren(...lines.map((l) => { const p = mk('p', bad ? 'text-danger' : '', l); return p; })); };
  function check() {
    const v = validate(profile());
    if (v.ok) { show([WORDS.ok]); publish([]); } else { const msgs = Object.entries(v.errors).map(([k, m]) => k + ': ' + m); show(msgs, true); publish(msgs.map((m, i) => ({ code: 'limsconnect.field', severity: 'error', text: m, about: [{ kind: 'calc', id: 'lims2:' + (i + 1), label: 'Lab system' }] }))); }
    return v;
  }
  async function test() {
    const v = check(); if (!v.ok) return null;
    const b = bridge();
    if (v.profile.kind === 'csv') { show(['Exported files are read from the lab-system calculator; there is no connection to test.']); return null; }
    if (!b || typeof b.hostFetch !== 'function') { show([WORDS.needStudio], true); return null; }
    const r = await trial(profile(), { hostFetch: b.hostFetch.bind(b) });
    show(r.steps.map((s) => (s.ok ? 'OK  ' : 'FAILED  ') + s.step + ': ' + s.message), !r.ok); publish(r.problems);
    return r;
  }
  const btn = (label, fn) => { const b = mk('button', 'btn btn-sm btn-outline-secondary me-1', label); b.type = 'button'; b.addEventListener('click', () => { Promise.resolve(fn()).catch((e) => show([String(e && e.message || e)], true)); }); return b; };
  const bar = mk('div'); bar.append(btn(WORDS.check, check), btn(WORDS.test, test), btn(WORDS.save, () => { const v = check(); if (v.ok) { save(redact(profile())); show([WORDS.saved]); } }));
  el.replaceChildren(mk('p', 'text-ink-2', WORDS.lede), form, bar, out, mk('p', 'text-ink-2', WORDS.note));
  sync();
  return { check, test, profile, refresh: sync };
}
