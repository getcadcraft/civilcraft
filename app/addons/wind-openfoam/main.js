/* SPDX-License-Identifier: GPL-3.0-or-later */
/**
 * Pedestrian wind (OpenFOAM) — 0.9 SU.1119 add-on. Registers an engine with CivilCraft's Environment block (globalThis.ccEnvirWindEngines, read by envir-mount.js).
 * OpenFOAM is GPL; this add-on is GPL-3.0-or-later and only talks to OpenFOAM through files, in a separate program the person installs (never bundled, never linked).
 * The Apache-2.0 core never imports anything from this folder. Off until switched on in Settings > Add-ons.
 */
import { runOpenFoamStudy } from './lib/pipeline.js';
import { makeHttpRunner } from './lib/http-runner.js';
import { OPENFOAM_VALIDATION } from './lib/validation.js';

export function activate(api) {
  const g = globalThis, reg = (g.ccEnvirWindEngines ||= {});
  const st = { url: api.storage.get('url') || 'http://127.0.0.1:8765', token: api.storage.get('token') || '' };
  const engine = {
    id: 'openfoam',
    label: api.t('wind.of.label'),
    note: api.t('wind.of.note'),
    fields: [{ key: 'url', label: api.t('wind.of.url') }, { key: 'token', label: api.t('wind.of.token') }],
    get: (k) => st[k],
    set: (k, v) => { st[k] = String(v); api.storage.set(k, st[k]); },
    validation: OPENFOAM_VALIDATION,
    async check() {
      try {
        const h = await makeHttpRunner(st).health();
        return h.ok ? { ok: true, text: api.t('wind.of.ok', { foam: h.foam || 'OpenFOAM' }) } : { ok: false, text: api.t('wind.of.nofoam', { why: h.detail || '' }) + ' ' + api.t('wind.of.install') };
      } catch (e) { return { ok: false, text: api.t('wind.of.down', { why: String(e.message || e) }) + ' ' + api.t('wind.of.install') }; }
    },
    run: (args) => runOpenFoamStudy({ ...args, runner: args.runner || makeHttpRunner(st) }),
  };
  reg.openfoam = engine;
  api.onDeactivate(() => { if (reg.openfoam === engine) delete reg.openfoam; });
}
