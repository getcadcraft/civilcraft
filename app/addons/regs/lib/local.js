/* SPDX-License-Identifier: Apache-2.0 */
/**
 * local.js — what the apps read from a pack's local-requirement sections (booklet rows BK.67, BK.156, BK.157; session bk-r3-regs). DOM-free
 * and import-free apart from sections.js: active.js hands it the pack list and the resolver, so node tests can use it with plain packs. The
 * regs add-on's UI publishes the result as `window.ccRegsLocal` (ui.js), the one door the host app's permit package, sheet tools and
 * annotation sizes use; nothing here judges a drawing (the permit checklist and the Problems it raises are in BimCraft's permit files).
 *
 *   makeLocal({ list(), profile(id), active() }) → api
 *     list()              every pack that has any section: [{ id, name, country, level, region, review, authority, has: ['process', …] }]
 *     sections(id)        the resolved sections of a pack and the packs under it (regs.js resolve → profile.sections), or null
 *     checklist(id)       the submission section as permit-checklist.js's list shape (sections.js checklistFromSections), or null
 *     process(id)         the approval steps, or null
 *     format(id)          the submission format (sheet sizes, file formats, copies …), or null
 *     notes(id, { discipline, region })   standard notes, each with `pack` (id), `packName`, `clause` and its source, for the sheet picker
 *     textHeights(ids?)   [{ id, use, mm, pt, min, from, packName, clause, estimated }] across the ticked packs (or ids): the paper text heights
 *                         the office standard (BK.10) may take; `mm` is the height on paper, a size given in points is a FONT size and is turned into a
 *                         capital height (pt x 25.4/72 x cap), flagged `estimated`; `kind` = the annotation kind it sizes ('' = none named)
 *   standard(ids?)      { heights: { kind: capital height mm }, from: { kind: pack id }, conflicts: [{ kind, kept, other }] } for annoscale.js's office
 *                         standard (anno-standard.js saveAnnoStandard); only items that name a kind; the first ticked pack wins a kind
 *     conventions(ids?)   the merged marks / lines / pen table of those packs, each tagged with its pack
 */
import { SECTION_KEYS, checklistFromSections } from './sections.js';

export const PT_MM = 25.4 / 72;
/** Capital height / font size of the sheet font (annoscale.js CAP, Helvetica). A pack that gives a FONT size in points is turned into a capital height with it. */
export const CAP = 0.718;

export function makeLocal({ list, profile, active, cap = CAP }) {
  const sectionsOf = (id) => { const p = profile(id); return p && p.sections ? p : null; };
  const ticked = (ids) => (Array.isArray(ids) && ids.length ? ids : (active ? active() : []));
  return {
    list() {
      return list().map((info) => { const p = sectionsOf(info.id); const has = p ? SECTION_KEYS.filter((k) => p.sections[k]) : []; return { ...info, has }; }).filter((x) => x.has.length);
    },
    sections: (id) => sectionsOf(id)?.sections || null,
    checklist: (id) => { const p = sectionsOf(id); return p ? checklistFromSections(p) : null; },
    process: (id) => sectionsOf(id)?.sections.process || null,
    format: (id) => sectionsOf(id)?.sections.submission?.format || null,
    notes(id, { discipline = '', region = '' } = {}) {
      const p = sectionsOf(id), n = p?.sections.notes;
      if (!n) return [];
      return n.items.filter((x) => (!discipline || x.discipline === discipline) && (!region || !x.region || x.region === region))
        .map((x) => ({ ...x, pack: id, packName: p.name, review: p.review.state }));
    },
    textHeights(ids) {
      const out = [];
      for (const id of ticked(ids)) {
        const p = sectionsOf(id);
        for (const t of p?.sections.conventions?.text || []) out.push({ id: t.id, use: t.use, kind: t.kind || '', mm: t.mm ?? Math.round(t.pt * PT_MM * cap * 100) / 100, pt: t.pt ?? null, min: !!t.min, from: t.from, pack: id, packName: p.name, clause: t.clause, estimated: t.mm === undefined, review: p.review.state });
      }
      return out;
    },
    standard(ids) {
      const heights = {}, from = {}, conflicts = [];
      for (const t of this.textHeights(ids)) {
        if (!t.kind) continue;
        if (heights[t.kind] === undefined) { heights[t.kind] = t.mm; from[t.kind] = t.pack; } else if (heights[t.kind] !== t.mm) conflicts.push({ kind: t.kind, kept: from[t.kind], other: t.pack });
      }
      return { heights, from, conflicts };
    },
    conventions(ids) {
      const out = { marks: [], lines: [], penTables: [] };
      for (const id of ticked(ids)) {
        const p = sectionsOf(id), c = p?.sections.conventions;
        if (!c) continue;
        out.marks.push(...c.marks.map((m) => ({ ...m, pack: id, packName: p.name })));
        out.lines.push(...c.lines.map((l) => ({ ...l, pack: id, packName: p.name })));
        if (c.penTable) out.penTables.push({ ...c.penTable, pack: id, packName: p.name });
      }
      return out;
    },
  };
}
