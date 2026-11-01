/* SPDX-License-Identifier: Apache-2.0 */
/**
 * adapter.js — what an app's `regs` add-on does besides reading its own model (0.8 REG.1 step 4, session `regs_PART_3`; rule 39: one library,
 * a thin adapter per app). CadCraft, CivilCraft and DetailCraft start the add-on with this; BimCraft keeps its own main.js because its model
 * is an IFC file and its stairs, schedules and Properties row ask the add-on directly (rules-hook.js). BimCraft's add-on is canonical;
 * `node tools/regs/sync.mjs --to …` copies this file byte-identical.
 *
 *   startRegs(api, opts) → Promise<{ rows(), problems(), stop() }>
 *
 *   opts = {
 *     applies: ['drawing']          the kinds of rule (a rule's `applies`) this app can check: only packs that have some are listed
 *     rows(prof) → [row]            the app's check.js on its own model, read through api.model.read (lib/rows.js row shape; ref = what a
 *                                   Problems marker is anchored to). Called with each ticked pack's profile; may throw, then there are no rows
 *     about(row) → { kind, id, label? }   optional: what a row is about in the shell's Problems (default { kind: row.kind, id: row.ref })
 *     trades: ['drawing']           optional: the trade buttons of the filter (regs.trade.<key>); default the building trades
 *     host                          what lib/ui.js asks of the app: { lenText(mm), areaText(m2), drawing: { read(), write(label, json) },
 *                                   pdf?(markdown, opts) }
 *   }
 *
 * It does, for every app alike:
 *   - lists only the packs with a rule this app understands (active.js setAppliesFilter), loads the packs and mounts the screens (ui.js:
 *     Settings, the Regulations panel, the code summary sheet);
 *   - sends every ticked pack's failed rules to the shell's Problems as a `regulation` source (problems.js), re-checked a moment after
 *     the model changes or the ticks change, each problem carrying the pack, edition and clause;
 *   - says which rules are in force through api.rules.provide: { packs(), profiles(), limit(ruleId) → { min, max, pack } | null (the
 *     tightest of the ticked packs), changed }, which the app's own tools may ask (CivilCraft's zoning and road tools).
 * A guide only: the registered professional and the local authority decide.
 */
import { setAppliesFilter, profiles, onRegsChange, packVersion } from './active.js';
import { ruleBounds } from './regs.js';
import { setupRegs, mountRegsUi, pct } from './ui.js';
import { regsProblems, packRef } from './problems.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function startRegs(api, opts = {}) {
  const t = api.t;
  setAppliesFilter(opts.applies || null);
  await setupRegs(api);
  const host = opts.host || {};
  const lenText = host.lenText || ((mm) => (Math.round(mm * 10) / 10) + ' mm');
  const areaText = host.areaText || ((m2) => (Math.round(m2 * 100) / 100) + ' m²');
  const fmt = (v, unit) => (unit === 'pct' ? pct(v) : unit === 'm2' ? areaText(v) : unit === 'count' ? String(Math.round(v)) : unit === 'ratio' ? String(Math.round(v * 100) / 100)
    : unit === 'r' ? 'R-' + (Math.round(v * 10) / 10) : unit === 'u' ? 'U-' + (Math.round(v * 100) / 100) : lenText(v));

  const rowsOf = (prof) => { try { return opts.rows(prof) || []; } catch (e) { api.log('regs rows failed', e); return []; } };
  const source = api.problems.source({ id: 'regs', kind: 'regulation', label: t('regs.legend') });
  const problems = () => profiles().flatMap((prof) => regsProblems(rowsOf(prof), prof, { t, versionOf: packVersion, fmt }).map((p) => {
    if (!opts.about) return p;
    const row = rowsOf(prof).find((r) => r.id === p.code && String(r.ref) === String(p.about?.[0]?.id));
    return row ? { ...p, about: [opts.about(row)] } : p;
  }));
  let timer = 0;
  const recheck = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { try { source.set(api.model.current() ? problems() : []); } catch (e) { api.log('regs problems failed', e); } }, 250);
  };
  const stops = [api.model.onChange(recheck), onRegsChange(() => { recheck(); api.rules.changed(); })];

  api.rules.provide({
    packs: () => profiles().flatMap((p) => (p.parts || [p]).map((x) => packRef(x, packVersion))).filter(Boolean),
    profiles: () => profiles(),
    /** The tightest limit of a rule across the ticked packs: { min, max, pack } or null when none of them has the rule. */
    limit(id) {
      let out = null;
      for (const prof of profiles()) {
        const r = prof.rule(id);
        if (!r) continue;
        const b = ruleBounds(r);
        out = out ? { min: b.min === null ? out.min : Math.max(out.min ?? -Infinity, b.min), max: b.max === null ? out.max : Math.min(out.max ?? Infinity, b.max), pack: out.pack } : { min: b.min, max: b.max, pack: prof.name };
      }
      return out;
    },
    changed: () => recheck(),
  });

  mountRegsUi(api, {
    allRows: (prof) => rowsOf(prof),
    ctx: () => ({}),
    hasModel: () => !!api.model.current(),
    modelName: () => api.model.current()?.name || '',
    onModelChange: (fn) => api.model.onChange(fn),
    drawing: host.drawing || { read: () => null, write: async () => false },
    lenText, areaText,
    pdf: host.pdf,
    trades: opts.trades,
  });

  api.onDeactivate(() => { clearTimeout(timer); for (const s of stops) { try { s && s(); } catch { /* gone */ } } source.dispose(); setAppliesFilter(null); });
  recheck();
  return { rows: (prof) => rowsOf(prof), problems, stop: () => source.dispose(), settle: () => wait(300) };
}
