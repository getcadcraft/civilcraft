/* SPDX-License-Identifier: Apache-2.0 */
/**
 * report.js — pinned pack versions and the regulation check report (0.8 REG.1c / REG.1d, Problems P.7; docs/0.8-ZA-STANDARDS.md § 1a decision
 * "a project pins its pack versions"). No DOM, no imports: bin/test-bimcraft.mjs --regs runs it in Node.
 *
 *   pinStatus(pinned, packs) → [{ id, pinned, current, state }]   pinned = the drawing's { packId: version }; packs = [{ id, version }] as
 *       installed now. state: 'same' | 'newer' (the installed pack is newer than the drawing was checked against: offer, never apply
 *       silently) | 'older' | 'unpinned' (a Library pack the drawing has no pin for yet) | 'unversioned' (bundled or own: no item version)
 *   keepPins(pinned, ids, packs, { repin }) → the drawing's next pins: a pack that stays keeps its pin, a new one is pinned at the installed
 *       version; `repin` ids move to the installed version (the person accepted the update)
 *   ruleSource(profile, ruleId, nameOf) → { from, overrides, clause, text }   the merged chain for one rule: which level it came from and
 *       what it replaced ("City of Tshwane by-law, overrides SANS 10400 Part M 4.2")
 *   reportMarkdown(data, t) → markdown   the report for doc-pdf.js (parseMarkdown → docPdf): the packs with their pinned versions and sources,
 *       the checks with the pack and clause each came from, the accepted items, then the not-legal-advice line and "No representation."
 */
const num = (v) => Number(v);

export function pinStatus(pinned, packs) {
  const pins = pinned && typeof pinned === 'object' ? pinned : {};
  return (packs || []).map((p) => {
    const cur = p.version === null || p.version === undefined ? null : num(p.version);
    const was = pins[p.id] === undefined ? null : num(pins[p.id]);
    let state = 'same';
    if (cur === null) state = 'unversioned';
    else if (was === null) state = 'unpinned';
    else if (cur > was) state = 'newer';
    else if (cur < was) state = 'older';
    return { id: p.id, pinned: was, current: cur, state };
  });
}

export function keepPins(pinned, ids, packs, { repin = [] } = {}) {
  const pins = pinned && typeof pinned === 'object' ? pinned : {};
  const out = {};
  for (const id of ids || []) {
    const cur = (packs || []).find((p) => p.id === id)?.version;
    const have = pins[id];
    if (cur === null || cur === undefined) { if (have !== undefined) out[id] = have; continue; }
    out[id] = have !== undefined && !repin.includes(id) ? have : cur;
  }
  return out;
}

export function ruleSource(profile, ruleId, nameOf = (id) => id) {
  const r = profile && profile.rule ? profile.rule(ruleId) : null;
  if (!r) return { from: '', overrides: null, clause: '', text: '' };
  const from = r.from || profile.id, ov = r.overrides || null;
  let text = nameOf(from) + (r.clause ? ' ' + r.clause : '');
  if (ov) text += ', overrides ' + nameOf(ov.from) + (ov.clause ? ' ' + ov.clause : '');
  return { from, overrides: ov, clause: r.clause || '', text };
}

const cell = (v) => String(v ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
/**
 * data = { title, file, date, app, packs: [{ name, chain: [{ name, edition, in_force, authority, source }], review, version, pinState }],
 *          criteria: [[label, text]], rows: [{ where, label, clause, required, found, result, source, fail }], accepted: [{ about, message, pack, reason, by, on }],
 *          sum: { meets, fails, none } }
 * t(key, vars) writes the add-on's strings; the shell's legal line and "No representation." come in as t('regs.sheet.legal') / t('regs.sheet.norep').
 */
export function reportMarkdown(data, t) {
  const out = [];
  out.push('# ' + cell(data.title), '', cell(t('regs.sheet.meta', { file: data.file || '–', date: data.date })), '');
  out.push('## ' + t('regs.sheet.codes'), '');
  if (!data.packs.length) out.push(t('regs.sheet.nopacks'), '');
  else {
    out.push('| ' + [t('regs.sheet.col.place'), t('regs.meta.edition'), t('regs.meta.inforce'), t('regs.meta.authority'), t('regs.rep.version'), t('regs.meta.source')].join(' | ') + ' |', '|---|---|---|---|---|---|');
    for (const p of data.packs) {
      out.push('| ' + [p.chain.map((c) => c.name).join(' > '), p.chain.map((c) => c.edition).filter(Boolean).join(' / '), p.chain.map((c) => c.in_force).filter(Boolean).pop() || '',
        p.chain.map((c) => c.authority).filter(Boolean).join(' / '), p.version ? 'v' + p.version + (p.pinState === 'newer' ? ' (' + t('regs.rep.newer') + ')' : '') : t('regs.rep.nover'),
        p.chain.map((c) => [c.source?.name || '', c.source?.url || '', c.source?.date ? '(' + c.source.date + ')' : ''].filter(Boolean).join(' ')).join('; ')].map(cell).join(' | ') + ' |');
    }
    out.push('', ...data.packs.map((p) => '- ' + cell(p.chain[p.chain.length - 1].name) + ': ' + cell(t('regs.state.' + p.review)) ), '');
  }
  if (data.criteria.length) { out.push('## ' + t('regs.sheet.criteria'), '', '| | |', '|---|---|', ...data.criteria.map(([k, v]) => '| ' + cell(k) + ' | ' + cell(v) + ' |'), ''); }
  out.push('## ' + t('regs.sheet.checks'), '');
  if (!data.rows.length) out.push(t('regs.sheet.nodraw'), '');
  else {
    out.push(cell(t('regs.sheet.sum', data.sum)), '', '| ' + [t('regs.col.where'), t('regs.col.rule'), t('regs.col.clause'), t('regs.col.required'), t('regs.col.found'), t('regs.col.result'), t('regs.rep.from')].join(' | ') + ' |', '|---|---|---|---|---|---|---|');
    for (const r of data.rows) out.push('| ' + [r.where, r.label, r.clause, r.required, r.found, r.result, r.source].map(cell).join(' | ') + ' |');
    out.push('');
  }
  out.push('## ' + t('regs.sheet.accepted'), '');
  if (!data.accepted.length) out.push(t('regs.sheet.noaccepted'), '');
  else out.push('| ' + [t('regs.col.where'), t('regs.sheet.col.problem'), t('regs.col.pack'), t('regs.sheet.col.reason'), t('regs.sheet.col.by')].join(' | ') + ' |', '|---|---|---|---|---|', ...data.accepted.map((a) => '| ' + [a.about, a.message, a.pack, a.reason, [a.by, a.on].filter(Boolean).join(' ')].map(cell).join(' | ') + ' |'), '');
  out.push('---', '', cell(t('regs.sheet.legal')), '', cell(t('regs.sheet.norep')));
  return out.join('\n');
}
