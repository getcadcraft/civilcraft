// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: the sentences here are the English fallback for a host with no catalog (keys audit.*, iface.*, verify.* in the host language file say the same) and file-format values */
/**
 * audit.js: ready audit rule sets over a model, as advisory Problems, host-free (0.10 booklet row BK.65, session bk-r3-checks-10).
 * No DOM. A host gathers plain data from its model (a thin adapter) and hands the result to the shared Problems store
 * (assets/js/problems.js): nothing here blocks anything, every finding can be accepted with a reason like any other problem.
 *
 *   RULE_SETS                         ['rooms', 'tags', 'lod', 'clashes', 'interfaces', 'verification']
 *   unnamedRooms(rooms, { isAutoName })           rooms = [{ id, number, name, level }] → those with no name, or a name the program gave
 *   missingTags(items)                            items = [{ id, kind: 'door' | 'window' | 'room' | 'device', tag, label, level }] → those with no tag
 *   clashPairs(clashes)                           clashes = [{ a: { id, label, discipline }, b: {…}, depth (mm) }] → Map 'a|b' (sorted) → [clash]
 *   auditProblems(input, { t, sets, cap }) → { problems, summary }
 *       input = { rooms, isAutoName, tagged, elements, stage, stageName, table, clashes, findings (interfaces.js), unverified: [{ id, label, source }] }
 *       summary = [{ set, checked, found }] for the sets that ran (the report's rule-set table)
 *   words(key, vars)                              the English sentences (a host with its own catalog passes t; keys are 'audit.*')
 */
import { lodGaps, requiredLod } from './stagelod.js';
import { interfaceProblems } from './interfaces.js';

export const RULE_SETS = ['rooms', 'tags', 'lod', 'clashes', 'interfaces', 'verification'];
export const AUDIT_CAP = 400;

const EN = {
  'audit.room.unnamed': 'Room {number} has no name of its own.',
  'audit.tag.door': 'Door {label} has no mark.',
  'audit.tag.window': 'Window {label} has no mark.',
  'audit.tag.room': 'Room {label} has no number.',
  'audit.tag.device': 'Device {label} has no tag.',
  'audit.lod.below': '{label} is at LOD {found}; the {stage} stage asks for LOD {required}.',
  'audit.lod.untagged': '{n} elements have no LOD tag, so they cannot be checked against LOD {required} for the {stage} stage.',
  'audit.clash': '{a} ({da}) runs into {b} ({db}).',
  'audit.unverified': '{label} was recognised from a {source} and has not been checked by a person.',
};
export function words(key, vars = {}) { return String(EN[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m)); }

export function unnamedRooms(rooms, { isAutoName = () => false } = {}) {
  return (rooms || []).filter((r) => { const n = String(r.name ?? '').trim(); return !n || isAutoName(n, r); });
}
export function missingTags(items) { return (items || []).filter((x) => !String(x.tag ?? '').trim()); }

export const pairKey = (a, b) => [a || 'other', b || 'other'].sort().join('|');
export function clashPairs(clashes) {
  const by = new Map();
  for (const c of clashes || []) { const k = pairKey(c.a?.discipline, c.b?.discipline); if (!by.has(k)) by.set(k, []); by.get(k).push(c); }
  return by;
}

export function auditProblems(input = {}, { t = null, sets = RULE_SETS, cap = AUDIT_CAP } = {}) {
  const say = (key, vars) => { if (t) { const s = t(key, vars); if (s && s !== key) return s; } return words(key, vars); };
  const out = [], summary = [];
  const ref = (x) => ({ kind: 'element', id: String(x.id), label: String(x.label || x.id) });
  const push = (p) => { if (out.length < cap) out.push(p); };
  const mk = (code, severity, key, vars, about, extra = {}) => ({ code, severity, msg: { key, vars }, text: say(key, vars), about, source: { name: 'audit' }, ...extra });

  if (sets.includes('rooms')) {
    const bad = unnamedRooms(input.rooms, { isAutoName: input.isAutoName });
    for (const r of bad) push(mk('audit.room.unnamed', 'warning', 'audit.room.unnamed', { number: r.number || '?' }, [ref({ id: r.id, label: [r.number, r.name].filter(Boolean).join(' ') || 'Room' })]));
    summary.push({ set: 'rooms', checked: (input.rooms || []).length, found: bad.length });
  }
  if (sets.includes('tags')) {
    const bad = missingTags(input.tagged);
    for (const x of bad) push(mk('audit.tag.' + x.kind, 'warning', 'audit.tag.' + x.kind, { label: x.label || '' }, [ref(x)]));
    summary.push({ set: 'tags', checked: (input.tagged || []).length, found: bad.length });
  }
  if (sets.includes('lod')) {
    const required = requiredLod(input.stage, input.table);
    const stage = input.stageName || input.stage || '';
    if (required !== null) {
      const g = lodGaps(input.elements, required);
      for (const e of g.below) push(mk('audit.lod.below', 'warning', 'audit.lod.below', { label: e.label || '', found: e.lod, required, stage }, [ref(e)],
        { req: { op: '>=', value: required, unit: 'LOD' }, found: { value: e.lod, unit: 'LOD' } }));
      if (g.untagged.length) push(mk('audit.lod.untagged', 'note', 'audit.lod.untagged', { n: g.untagged.length, required, stage }, g.untagged.slice(0, 50).map(ref), { part: 'untagged' }));
      summary.push({ set: 'lod', checked: (input.elements || []).length, found: g.below.length + (g.untagged.length ? 1 : 0), required, stage: input.stage, below: g.below.length, untagged: g.untagged.length });
    } else summary.push({ set: 'lod', checked: 0, found: 0, required: null, stage: input.stage || '' });
  }
  if (sets.includes('clashes')) {
    const list = input.clashes || [];
    for (const c of list) push(mk('audit.clash', 'warning', 'audit.clash', { a: c.a.label, b: c.b.label, da: c.a.discipline || 'other', db: c.b.discipline || 'other' }, [ref(c.a), ref(c.b)],
      { part: pairKey(c.a.discipline, c.b.discipline), found: Number.isFinite(c.depth) ? { value: Math.round(c.depth), unit: 'mm' } : undefined }));
    summary.push({ set: 'clashes', checked: input.clashChecked || 0, found: list.length, pairs: [...clashPairs(list)].map(([k, v]) => ({ pair: k, n: v.length })), stopped: !!input.clashStopped });
  }
  if (sets.includes('interfaces')) {
    const ps = interfaceProblems(input.findings || [], { t });
    for (const p of ps) push(p);
    summary.push({ set: 'interfaces', checked: input.interfaceChecked || 0, found: ps.length });
  }
  if (sets.includes('verification')) {
    const list = input.unverified || [];
    for (const u of list) push(mk('audit.unverified', 'note', 'audit.unverified', { label: u.label || '', source: u.source || 'drawing' }, [ref(u)]));
    summary.push({ set: 'verification', checked: input.verifyChecked || list.length, found: list.length });
  }
  return { problems: out, summary };
}
