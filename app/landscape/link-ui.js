/* SPDX-License-Identifier: Apache-2.0 */
/**
 * link-ui.js — objects from linework, kept linked (0.8 LA.2, session `landscape-arch_PART_4`). "From a line": pick a CivilCraft feature line,
 * a line or polygon of an imported DWG/DXF layer (a GIS layer), or — in SuperCad Studio — a CadCraft member's entity (pushed in through
 * linkSource), then pick what to make: paving, a planted area, a bed, a hedge, a path, a wall, a kerb, steps, a ramp, a platform or a
 * swale. The object keeps a link to its line (lib/landscape/links.js); moving the line regenerates the object (and, through the stack,
 * the proposed ground) inside the same undo step; "Break link" makes it free. Refused or missing lines become Problems rows.
 *
 *   createLinkUi(ctx, { edit, LS, U, index, current, makers }) → { tools, command, click, sync(project), notes(), linkBlock(sel), objects(),
 *     linkSource({ member, handle }, pts), fromSource({ member, handle, name }, pts), links() }
 *   linkedObjects(ls, features) → [{ list, id, link, name, obj }]   ·   resolveWith(project, members) → resolve(link) for followLinks
 *
 * 0.8 LA.2 outputs (session `landscape-finish_PART_4`): a line can also become a **feature line** (list 'features', the project's own
 * feature list). It is made with use 'off' (it shapes no ground until the person picks a use) and its levels draped on the existing ground;
 * when its source moves, each vertex keeps its level if the number of vertices is the same, else the new vertices are draped again.
 * A feature line is never made from a feature line (that is a copy, not a link).
 * fromSource: SuperCad Studio hands in a CadCraft member's entity (the person picked it in the drawing) and the same chooser opens.
 */
import { fingerprint, checkLine, followLinks, cleanLink, LINK_LISTS } from './links.js';
import { pickFeature, featuresOf } from '../gis-layers.js';
import { edgeDist } from './planting.js';
import { cleanFeature } from '../featureline.js';   // LA.2 outputs: feature lines
import { t } from '../i18n.js';

/** What a line can become: closed lines make areas, open lines make strips and lines. */
export const FROM_CLOSED = ['paving', 'pa-lawn', 'pa-bed', 'pa-meadow', 'pa-groundcover', 'bed', 'platform', 'feature'];
export const FROM_OPEN = ['path', 'wall', 'kerb', 'steps', 'ramp', 'hedge', 'swale', 'feature'];
export const LIST_OF = { paving: 'hardscape', path: 'hardscape', wall: 'hardscape', kerb: 'hardscape', steps: 'hardscape', ramp: 'hardscape', 'pa-lawn': 'areas', 'pa-bed': 'areas',
  'pa-meadow': 'areas', 'pa-groundcover': 'areas', bed: 'beds', hedge: 'hedges', platform: 'grading', swale: 'grading', feature: 'features' };
const SEL_OF = { hardscape: 'ls-hard', areas: 'ls-pa', beds: 'ls-bed', hedges: 'ls-hedge', grading: 'ls-grade', features: 'feature' };
/** What a picked line can become (a feature line is not made from a feature line). */
export const kindsFor = (closed, src) => (closed ? FROM_CLOSED : FROM_OPEN).filter((k) => k !== 'feature' || src !== 'feature');
/** SuperCad Studio rereads links() on this event (landscape-project_PART_4): after a link is made, followed or broken. */
export const announce = () => { try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cc-landscape-links')); } catch { /* no window */ } };

export function linkedObjects(ls, features = []) {
  const out = [];
  for (const list of LINK_LISTS) for (const o of (list === 'features' ? features : ls?.[list]) || []) if (o.link) out.push({ list, id: o.id, link: o.link, name: o.name || o.id, obj: o });
  return out;
}
/** A feature line's new vertices with levels: each keeps its old level when the count is the same, else the ground's (or 0). */
export function withLevels(pts, old, zAt) {
  const keep = Array.isArray(old) && old.length === pts.length;
  return pts.map((p, i) => { const z = keep ? old[i].z : zAt ? zAt(p.x, p.y) : null; return { x: p.x, y: p.y, z: Number.isFinite(z) ? z : 0 }; });
}
/** Apply followLinks' changes to a state (the landscape lists and the feature lines); → how many objects took new points. */
export function applyChanges(s, changes, zAt) {
  let n = 0;
  for (const c of changes) {
    const arr = c.list === 'features' ? s.features : s.landscape?.[c.list];
    const o = (arr || []).find((x) => x.id === c.id);
    if (!o) continue;
    o.pts = c.list === 'features' ? withLevels(c.pts, o.pts, zAt) : o.kind === 'steps' ? [c.pts[0], c.pts[c.pts.length - 1]] : c.pts;
    o.link = { ...o.link, at: c.at };
    n++;
  }
  return n;
}

/** The points a GIS feature carries: a line's first part, a polygon's outer ring (closed). */
function gisPts(f) {
  const g = f?.g;
  if (!g) return null;
  if (g.t === 'ln') { const c = g.c?.[0]; if (!c) return null; const a = c.map((p) => ({ x: p[0], y: p[1] })); return a; }
  if (g.t === 'pg') { const r = g.c?.[0]?.[0]; if (!r) return null; const a = r.map((p) => ({ x: p[0], y: p[1] })); a.closed = true; return a; }
  return null;
}
export function resolveWith(project, members = new Map()) {
  return (link) => {
    if (link.src === 'feature') {
      const f = (project.state.features || []).find((x) => String(x.id) === link.feature);
      if (!f) return null;
      const a = f.pts.map((p) => ({ x: p.x, y: p.y }));
      if (f.closed) a.closed = true;
      return a;
    }
    if (link.src === 'gis') {
      const fs = featuresOf(project, link.gis.layer);
      const f = (link.gis.handle && fs.find((x) => String(x.p?.HANDLE || '').toUpperCase() === link.gis.handle)) || fs[link.gis.i];
      return f ? gisPts(f) : null;
    }
    if (link.src === 'member') return members.get(link.member + '|' + link.handle) || null;
    return null;
  };
}

/** Points handed in by another app (untrusted): numbers only, ≤ 5001 (checkLine refuses more), a closed polyline says so. */
function memberPts(pts) {
  const a = pts.slice(0, 5001).map((p) => ({ x: Number(p?.x), y: Number(p?.y) }));
  if (pts.closed === true) a.closed = true;
  return a;
}

export function createLinkUi(ctx, { edit, LS, U, makers }) {
  const { el, root } = ctx;
  const P = () => ctx.project();
  const members = new Map();   // Super: member|handle → pts (session only; the .ccproject's links.json says which objects follow which entity)
  let bound = null, notes = [], busy = false;

  const zAt = () => { const s = ctx.existing?.(); return s?.elevationAt ? (x, y) => s.elevationAt(x, y) : null; };
  /** Follow every link whose line moved, inside the change that moved it (no undo step of its own). */
  function sync(project = P()) {
    if (busy || !project?.state) { notes = []; return 0; }
    const objs = linkedObjects(project.state.landscape, project.state.features);
    if (!objs.length) { notes = []; return 0; }
    const r = followLinks(objs, resolveWith(project, members));
    notes = r.notes.map((n) => ({ ...n, kind: SEL_OF[n.list] }));
    if (!r.changes.length) return 0;
    applyChanges(project.state, r.changes, zAt());
    busy = true;
    try { project.cache?.clear?.(); project.touch('links'); } finally { busy = false; }
    announce();
    return r.changes.length;
  }
  /** Bind to the project in use (a New / Open replaces it): follow on every change. */
  function watch() {
    const p = P();
    if (p === bound || !p?.on) return;
    bound = p;
    p.on((kind) => { if (kind === 'change' && p === P()) sync(p); });
    sync(p);
  }

  // ---- From a line: pick, then choose what to make ----
  let picked = null;
  function command(c) {
    if (c !== 'ls-fromline') return false;
    ctx.setTool(ctx.tool() === c ? 'select' : c);
    if (ctx.tool() === c) ctx.say(t('ls.link.hint'));
    return true;
  }
  function pickSource(w, tol) {
    const p = P();
    for (const f of p.state.features || []) if (f.pts?.length >= 2 && edgeDist(w.x, w.y, f.pts, !!f.closed) <= tol) return { link: { src: 'feature', feature: String(f.id) }, name: f.name || String(f.id) };
    const h = pickFeature(p, w.x, w.y, tol);
    if (h) {
      const f = featuresOf(p, h.layer)[h.i], pts = gisPts(f);
      if (pts) { const handle = String(f.p?.HANDLE || '').toUpperCase(); return { link: { src: 'gis', gis: { layer: h.layer, i: h.i, ...(/^[0-9A-F]{1,16}$/.test(handle) ? { handle } : {}), fp: fingerprint(pts) } }, name: f.p?.LAYER || h.layer }; }
    }
    return null;
  }
  function click(tool, w) {
    if (tool !== 'ls-fromline') return false;
    const s = pickSource(w, ctx.tol ? ctx.tol() : 0.5);
    if (!s) { ctx.say(t('ls.link.none')); return true; }
    const pts = resolveWith(P(), members)(s.link);
    picked = { ...s, closed: !!pts?.closed || (pts && pts.length >= 3 && Math.hypot(pts[0].x - pts.at(-1).x, pts[0].y - pts.at(-1).y) < 1e-6) };
    chooser();
    return true;
  }
  function make(kind) {
    const as = kind === 'feature' ? (picked.closed ? 'outline' : 'line') : FROM_CLOSED.includes(kind) ? 'outline' : 'line';
    const src = resolveWith(P(), members)(picked.link);
    const c = checkLine(src, { as });
    if (!c.ok) { ctx.say(t('ls.link.bad.say', { why: t('ls.link.why.' + c.why) })); return; }
    const link = cleanLink({ ...picked.link, as, at: fingerprint(src) });
    const made = kind === 'feature' ? makeFeature(c.pts, link, as === 'outline') : makers.make(kind, c.pts, link);
    if (made) { ctx.setTool('select'); ctx.select(made); ctx.say(t(kind === 'feature' ? 'ls.link.made.fl' : 'ls.link.made', { name: picked.name })); announce(); }
  }
  /** LA.2 output: a feature line on the line's points, use 'off', levels on the existing ground; one undo step. → the selection */
  function makeFeature(pts, link, closed) {
    const p = P(), id = p.nextId('f'), n = (p.state.features || []).filter((f) => f.link).length + 1;
    const f = cleanFeature({ name: t('ls.link.fl.name', { name: picked.name, n }), pts: withLevels(pts, null, zAt()), closed, use: 'off' }, p.state.units);
    if (!f) return null;
    p.change(t('ls.link.undo.fl'), (s) => { s.features = [...(s.features || []), { ...f, id, link }]; });
    return { kind: 'feature', id };
  }
  function chooser() {
    const kinds = kindsFor(picked.closed, picked.link.src);
    const dlg = el('dialog', { className: 'cv-dialog', 'aria-labelledby': 'cv-lk-h', 'data-ls-fromline': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-lk-h' }, t('ls.link.head', { name: picked.name }))),
        el('div', { className: 'cv-dlg-body' }, el('p', { className: 'cv-note' }, t(picked.closed ? 'ls.link.closed' : 'ls.link.open')),
          el('div', { className: 'cv-actions cv-lk-kinds' }, ...kinds.map((k) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { lkKind: k }, onclick: () => { dlg.close(); make(k); } }, t('ls.link.k.' + k))))),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', onclick: () => dlg.close() }, t('ls.close')))));
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    root.append(dlg);
    dlg.showModal();
  }

  /** Properties: "Linked to <line>" with Break link, for any linked landscape object. */
  function linkBlock(sel) {
    const list = Object.entries(SEL_OF).find(([, k]) => k === sel?.kind)?.[0];
    const o = list && ((list === 'features' ? P().state.features : LS()[list]) || []).find((x) => x.id === sel.id);
    if (!o?.link) return null;
    const src = o.link.src === 'feature' ? t('ls.link.src.feature', { id: o.link.feature }) : o.link.src === 'gis' ? t('ls.link.src.gis', { layer: o.link.gis.layer }) : t('ls.link.src.member', { member: o.link.member, handle: o.link.handle });
    const bad = notes.find((n) => n.id === o.id);
    return el('div', { className: 'cv-report', 'data-ls-link': o.id },
      el('p', {}, el('i', { className: 'bi bi-link-45deg', 'aria-hidden': 'true' }), ' ', t('ls.link.on', { src })),
      bad ? el('p', { className: 'cv-note' }, t(bad.code === 'ls.link.bad' ? 'ls.link.bad' : 'ls.link.gone', { name: o.name, why: t('ls.link.why.' + bad.why) })) : '',
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-unlink': o.id, onclick: () => { P().change(t('ls.link.undo.break'), (s) => { const x = ((list === 'features' ? s.features : s.landscape?.[list]) || []).find((q) => q.id === o.id); if (x) delete x.link; }); announce(); ctx.refresh(); } }, t('ls.link.break')));
  }

  /** SuperCad Studio: the geometry of a member's entity (project units); every object linked to it follows, as one undo step. */
  function linkSource(ref, pts) {
    const handle = String(ref?.handle || '').toUpperCase(), member = String(ref?.member || '');
    if (!member || !/^[0-9A-F]{1,16}$/.test(handle) || !Array.isArray(pts)) return false;   // refused (Super counts false as refused)
    members.set(member + '|' + handle, memberPts(pts));
    const mine = (o) => o.link.src === 'member' && o.link.member === member && o.link.handle === handle;
    if (!linkedObjects(LS(), P().state.features).some(mine)) return 0;
    let n = 0, refused = false;
    const z = zAt();
    busy = true;   // the change below is this step; the project's change event must not follow it a second time
    try {
      P().change(t('ls.link.undo.follow'), (s) => {
        const r = followLinks(linkedObjects(s.landscape, s.features).filter(mine), resolveWith(P(), members));
        refused = r.notes.some((x) => x.code === 'ls.link.bad');
        n = applyChanges(s, r.changes, z);
      });
    } finally { busy = false; }
    sync();   // notes (a refused line) for the Problems panel
    if (n) announce();
    return refused && !n ? false : n;   // false = the line was refused (Super counts it); else how many objects took new points
  }
  /** SuperCad Studio: the person picked an entity in the drawing: open the chooser for it (what to make, kept linked to that entity). */
  function fromSource(ref, pts) {
    const handle = String(ref?.handle || '').toUpperCase(), member = String(ref?.member || '');
    if (!member || !/^[A-Za-z0-9_.:-]{1,64}$/.test(member) || !/^[0-9A-F]{1,16}$/.test(handle) || !Array.isArray(pts)) return false;
    const a = memberPts(pts);
    members.set(member + '|' + handle, a);
    const closed = !!a.closed || (a.length >= 3 && Math.hypot(a[0].x - a.at(-1).x, a[0].y - a.at(-1).y) < 1e-6);
    picked = { link: { src: 'member', member, handle }, name: String(ref?.name || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80) || t('ls.link.src.member', { member, handle }), closed };
    chooser();
    return true;
  }
  /** Every link, for the .ccproject's links.json. */
  const links = () => linkedObjects(LS(), P().state.features).map((o) => ({ list: o.list, id: o.id, link: o.link }));

  return { tools: ['ls-fromline'], hints: { 'ls-fromline': 'ls.link.hint' }, command, click, sync, watch, notes: () => notes, linkBlock, linkSource, fromSource, links, members };
}
