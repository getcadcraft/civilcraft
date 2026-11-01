/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — the quoted words are internal state names and defaults; every sentence a person hears goes through t() */
/**
 * access-mount.js — CivilCraft without sight (0.8 round 3, session access_PART_3, EG.52; plan docs/spikes/access_PART_2.md, shared part assets/js/app-access.js).
 * The adapter: what the plan is made of, said in words, for the shell's keyboard cursor (arrows, Enter, Tab, D, W, N, S, R, ?) and for the status line, which is
 * read aloud as it changes. Station and offset: `[` and `]` walk the cursor along the selected (or nearest) alignment by a whole step of stations, so a person can
 * follow a road without a mouse. Off until the person turns Access on (Settings › Global › Drafting without sight); then nothing here is read twice: the
 * shell speaks, CivilCraft only supplies sentences. The sentence builders are pure (a project and a `t`) so Node tests them (bin/test-civil-access.mjs).
 */
import { t as tr } from './i18n.js';
import { formatStation, fixed } from './units.js';

const num = (v, d = 2) => fixed(Number(v), d);
const nm = (o, fallback) => String(o?.name || fallback || o?.id || '').slice(0, 80);

/** Everything on the plan that has a place: [{id, label, x, y, kind, sel?}] (sel = the selection that picks it). */
export function planItems(project, t = tr) {
  const s = project.state, out = [];
  const u = s.units;
  for (const p of (project.points || []).slice(0, 5000)) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    out.push({ id: 'pt:' + p.n, kind: 'point', x: p.x, y: p.y, label: t('cv.access.point', { n: p.n, z: Number.isFinite(p.z) ? num(p.z) : '-', d: p.d || '' }).replace(/,\s*$/, '') });
  }
  for (const a of s.alignments || []) {
    const al = project.alignment(a), p0 = a.pis?.[0];
    if (!al?.ok || !p0) continue;
    out.push({ id: 'al:' + a.id, kind: 'alignment', x: p0.x, y: p0.y, sel: { kind: 'alignment', id: a.id },
      label: t('cv.access.alignment', { name: nm(a, 'alignment'), from: formatStation(al.start, u), to: formatStation(al.end, u), len: num(al.length, 1), n: Math.max(0, a.pis.length - 2) }) });
  }
  for (const p of s.pads || []) {
    const c = centroid(p.pts);
    if (c) out.push({ id: 'pad:' + p.id, kind: 'pad', x: c.x, y: c.y, sel: { kind: 'pad', id: p.id }, label: t('cv.access.pad', { name: nm(p, 'pad'), z: num(p.z, 1), n: p.pts.length }) });
  }
  for (const f of s.features || []) {
    const c = f.pts?.[0];
    if (c && Number.isFinite(c.x)) out.push({ id: 'ft:' + f.id, kind: 'feature', x: c.x, y: c.y, sel: { kind: 'feature', id: f.id }, label: t('cv.access.feature', { name: nm(f, 'feature line'), n: f.pts.length }) });
  }
  for (const m of s.masses || []) {
    const c = centroid(m.pts || m.footprint || []);
    if (c) out.push({ id: 'ms:' + m.id, kind: 'mass', x: c.x, y: c.y, sel: { kind: 'mass', id: m.id }, label: t('cv.access.mass', { name: nm(m, 'mass') }) });
  }
  const N = s.network;
  for (const st of N?.structures || []) if (Number.isFinite(st.x)) out.push({ id: 'st:' + st.id, kind: 'structure', x: st.x, y: st.y, sel: { kind: 'structure', id: st.id }, label: t('cv.access.structure', { name: nm(st, 'structure'), rim: Number.isFinite(st.rim) ? num(st.rim) : '-' }) });
  const byId = new Map((N?.structures || []).map((x) => [x.id, x]));
  for (const pp of N?.pipes || []) {
    const a = byId.get(pp.from), b = byId.get(pp.to);
    if (a && b) out.push({ id: 'pp:' + pp.id, kind: 'pipe', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, sel: { kind: 'pipe', id: pp.id }, label: t('cv.access.pipe', { name: nm(pp, 'pipe'), from: nm(a), to: nm(b), dia: pp.dia ?? '-' }) });
  }
  return out;
}
function centroid(pts) {
  if (!Array.isArray(pts) || !pts.length) return null;
  let x = 0, y = 0, n = 0;
  for (const p of pts) if (Number.isFinite(p?.x) && Number.isFinite(p?.y)) { x += p.x; y += p.y; n++; }
  return n ? { x: x / n, y: y / n } : null;
}

/** The whole site in one paragraph (key D). */
export function describeSite(project, t = tr) {
  const s = project.state, N = s.network;
  const items = planItems(project, t);
  if (!items.length) return t('cv.access.empty', { site: nm(s, 'site') });
  let box = null;
  for (const i of items) box = box ? { x0: Math.min(box.x0, i.x), y0: Math.min(box.y0, i.y), x1: Math.max(box.x1, i.x), y1: Math.max(box.y1, i.y) } : { x0: i.x, y0: i.y, x1: i.x, y1: i.y };
  const parts = [t('cv.access.site', { site: nm(s, 'site'), points: (project.points || []).length, alignments: (s.alignments || []).length, pads: (s.pads || []).length, structures: N?.structures?.length || 0, pipes: N?.pipes?.length || 0 })];
  parts.push(t('cv.access.extent', { w: num(box.x1 - box.x0, 1), h: num(box.y1 - box.y0, 1), unit: s.units }));
  const tin = project.state.surface?.tin;
  if (tin) parts.push(t('cv.access.surface'));
  return parts.join(' ');
}

/** Where the cursor is: "East 100, north 200. Ground 12.30. Station 1+50.00, 4.00 right of Main Street." */
export function sayHere(project, p, groundAt, t = tr) {
  let s = t('cv.access.en', { e: num(p.x), n: num(p.y) });
  const z = groundAt ? groundAt(p.x, p.y) : null;
  s += Number.isFinite(z) ? ' ' + t('cv.access.ground', { z: num(z) }) : ' ' + t('cv.access.off');
  let best = null;
  for (const a of project.state.alignments || []) {
    const al = project.alignment(a);
    if (!al?.ok) continue;
    const so = al.stationOffset(p.x, p.y);
    if (so && (!best || so.dist < best.so.dist)) best = { a, so };
  }
  if (best) s += ' ' + t(best.so.outside ? 'cv.access.staoff.out' : 'cv.access.staoff', { sta: formatStation(best.so.sta, project.state.units), off: num(Math.abs(best.so.off)), side: t(best.so.off >= 0 ? 'cv.access.right' : 'cv.access.left'), name: nm(best.a, 'alignment') });
  return s;
}

/** A step along an alignment: the place `step` stations on from p (or back), or null. */
export function alongStep(project, p, dir, step, selId, t = tr) {
  const list = (project.state.alignments || []).filter((a) => selId == null || a.id === selId);
  let best = null;
  for (const a of list) { const al = project.alignment(a); const so = al?.ok ? al.stationOffset(p.x, p.y) : null; if (so && (!best || so.dist < best.so.dist)) best = { a, al, so }; }
  if (!best) return null;
  const sta = Math.max(best.al.start, Math.min(best.al.end, best.so.sta + dir * step));
  const q = best.al.pointAt(sta);
  return q ? { x: q.x, y: q.y, text: t('cv.access.along', { name: nm(best.a, 'alignment'), sta: formatStation(sta, project.state.units) }) } : null;
}

/** Hand CivilCraft's plan to the shell's keyboard explorer. Returns { update } or null when the build has no shell Access. */
export function mountCivilAccess({ project, view, stage, status, selection, select, groundAt, setCursor }) {
  const go = () => {
    const A = window.ccAccess;
    if (!A) return;
    const cache = { v: -1, items: [] };
    const items = () => { const v = project().version + ':' + project().pointsVersion; if (cache.v !== v) { cache.v = v; cache.items = planItems(project()); } return cache.items; };
    const fmt = (v) => num(v, Math.abs(v) >= 100 ? 1 : 2);
    const k = A.mount({
      stage, label: () => tr('cv.access.stage'), yUp: true, fmt,
      span: () => (stage.clientWidth || 800) / view.zoom,
      items, describe: () => describeSite(project()), selection: () => { const s = selection(); const it = s && items().find((i) => i.sel && i.sel.kind === s.kind && i.sel.id === s.id); return it ? tr('cv.access.selected', { what: it.label }) : tr('cv.access.nosel'); },
      cursor: () => view.toWorld((stage.clientWidth || 0) / 2, (stage.clientHeight || 0) / 2),
      onCursor: (p) => setCursor(p),
      here: (p) => sayHere(project(), p, groundAt),
      pick: (p, item) => { if (item?.sel) { select(item.sel); A.say(tr('cv.access.selected', { what: item.label })); } else A.say(item ? item.label : sayHere(project(), p, groundAt)); },
      keys: {
        '[': (e) => along(-1, e), ']': (e) => along(1, e),
      },
      keysHelp: () => tr('cv.access.keys'),
    });
    function along(dir, e) {
      const s = selection(), step = (e.shift ? 10 : 1) * stationStep(project());
      const r = alongStep(project(), e.cursor, dir, step, s?.kind === 'alignment' ? s.id : null);
      if (!r) return tr('cv.access.noalign');
      e.put({ x: r.x, y: r.y });
      return r.text;
    }
    A.follow(status, { max: 240 });
    return k;
  };
  if (window.ccAccess) return go();
  document.addEventListener('cc-access-ready', go, { once: true });
  return null;
}
/** One station step: 10 for feet or metres (a "full station" of 100 for shift). */
const stationStep = (project) => 10;
