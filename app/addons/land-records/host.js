/* SPDX-License-Identifier: Apache-2.0 */
/**
 * host.js — the Land records add-on's adapter for CivilCraft (copied from tools/landrecords/src/land-records/hosts/civilcraft.js by
 * tools/landrecords/sync.mjs; 0.11 LR.1). The one file that knows CivilCraft: everything else is lib/ (lib/landrecords) and the same in any host.
 *
 * It hands the library CivilCraft's own parcels (parcels.js: areas with curves exact), survey points, coordinate system (crs.js), GIS polygon
 * layers and the street line a lot's zoning names (zoning.js frontCourse), and it writes back through the project's own undo steps. The land
 * book is the project's `land` key (project.js reads and writes it through landbook.js, so a file keeps it with the add-on switched off).
 * 0.11 LR.11: the buildings are CivilCraft's own building masses (massing.js) and a note on the plan is one of CivilCraft's own issues
 * (issues.js: it shows on the plan, in the Issues list and in a BCF file like any other). Neither is kept a second time.
 */
import { parcelArea } from '../../parcels.js';
import { massGfa, massHeight, cleanMass, MAX_MASSES } from '../../massing.js';
import { makeIssue, pinAt, setStatus, addComment, toTopics, stateFromBcf, STATES, LIMITS as ISSUE_LIMITS } from '../../issues.js';
import { flatten, localPlane } from './lib/geo.js';
import { cleanBook, bookEmpty } from './lib/clean.js';

const METRES_PER = { m: 1, ft: 0.3048, ftUS: 1200 / 3937 };

export function makeHost(api) {
  const P = () => (window.civilcraft && window.civilcraft.project) || null;
  const st = () => P()?.state || null;
  const units = () => (st()?.units === 'm' ? 'm' : 'ft');
  const unitM = () => { const c = st()?.crs; return (c && METRES_PER[c.unit]) || (units() === 'm' ? 1 : 0.3048); };
  const source = api.problems.source({ id: 'reconcile', label: api.t('lr.name') });
  return {
    id: 'civilcraft',
    ready: () => !!P(),
    name: () => st()?.name || '',
    units, unitM,
    hasCrs: () => !!st()?.crs,
    crsName: () => st()?.crs?.name || '',
    parcels() {
      return (st()?.parcels || []).filter((p) => Array.isArray(p.pts) && p.pts.length >= 3).map((p) => ({ id: p.id, name: p.name, ring: flatten(p.pts, 0.01), area: parcelArea(p.pts), curved: p.pts.some((q) => q.b) }));
    },
    book: () => cleanBook(st()?.land),
    /** The building model on the site: CivilCraft's masses (footprint, floors, height and gross floor area in project units). */
    buildings: () => (st()?.masses || []).filter((m) => Array.isArray(m.pts) && m.pts.length >= 3).map((m) => ({ id: m.id, name: m.name || '', use: m.use || '', ring: m.pts.map((q) => ({ x: q.x, y: q.y })), floors: m.floors, height: massHeight(m), gfa: massGfa(m) })),
    /** The notes on the plan: CivilCraft's issues that have a place. `parcel` is set when the note was pinned to one. */
    notes: () => (st()?.issues || []).filter((i) => i.pin).map((i) => ({ id: i.id, title: i.title, text: i.description, status: i.status, created: i.created, x: i.pin.x, y: i.pin.y, parcel: /^r\d{1,16}$/.test(String(i.pin.ref?.id)) ? i.pin.ref.id : null, said: i.comments.map((c) => c.text), mine: i.from === 'land-records' })),
    noteStates: STATES,
    /** cc-ifc, the IFC reader CivilCraft already carries (loaded only when an IFC file is read). */
    async ifcDeps() { const [a, b, c] = await Promise.all([import('../../ifc/model.js'), import('../../ifc/geo-ctx.js'), import('../../ifc/geometry.js')]); return { IfcFile: a.IfcFile, GeoCtx: b.GeoCtx, Geometry: c.Geometry }; },
    /** The notes as a BCF file whose topics name `file` (the plan sheet) and sit at place(x, y) → [metres of paper]: what MarkupCraft reads. */
    async notesBcf(ids, { file, place }) {
      const want = new Set(ids), list = (st()?.issues || []).filter((i) => want.has(i.id) && i.pin);
      const topics = toTopics(list, { units: units() });
      topics.forEach((tp, n) => { const [mx, my] = place(list[n].pin.x, list[n].pin.y); tp.labels = [...tp.labels, String(file).replace(/\.pdf$/i, '')].slice(0, 20); tp.viewpoints = [{ guid: tp.viewpoints[0]?.guid, camera: { kind: 'orthogonal', pos: [mx, my, 10], dir: [0, 0, -1], up: [0, 1, 0], scale: 0.05 }, selection: [] }]; });
      const { writeBcf } = await import('../../navis/bcf.js');
      return writeBcf({ topics, file });
    },
    /** A BCF file read back (MarkupCraft's or any program's): each topic's words, status in CivilCraft's own states, comments and its camera's spot. */
    async readBcf(bytes) {
      const { readBcf } = await import('../../navis/bcf.js');
      const r = await readBcf(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
      return r.topics.map((tp) => { const cam = (tp.viewpoints || [])[0]?.camera; return { title: tp.title, description: tp.description, status: stateFromBcf(tp.status), comments: (tp.comments || []).map((c) => ({ date: c.date, author: c.author, text: c.text })), paper: cam && Array.isArray(cam.pos) ? { x: cam.pos[0], y: cam.pos[1] } : null }; });
    },
    /** Another app of the lineup at the same place as this one (/lab/civilcraft → /lab/markupcraft), or '' where that cannot be told. */
    appUrl(app) { const p = location.pathname; return /\/civilcraft(\/|$)/.test(p) ? location.origin + p.replace(/\/civilcraft(\/|$)/, '/' + app + '$1') : ''; },
    async send(url, file) { const { sendHandoff } = await import('../../handoff.js'); return sendHandoff(url, file, 'civilcraft'); },
    /** One undo step. fn gets { book (a fresh clean copy to change), addParcel(name, ring) → id, removeParcel(id), addPoints([{ x, y, z, d }]) → [numbers], addNote({ title, text, x, y, parcel, parcelName }) → id | null, setNote(id, status) }.
     *  `points: true` when the step may add survey points (they live outside the state's snapshots, so the step goes through editPoints). */
    change(label, fn, { points = false } = {}) {
      const p = P(); if (!p) return false;
      const newPts = [];
      const run = (s) => {
        const book = cleanBook(s.land);
        fn({
          book,
          addParcel(name, ring) { const id = 'r' + s.seq++; (s.parcels = s.parcels || []).push({ id, name: String(name).slice(0, 120) || 'Parcel', pts: ring.map((q) => ({ x: q.x, y: q.y })) }); return id; },
          addNote({ title, text = '', x, y, parcel = null, parcelName = '', status = 'open', comments = [] }) {
            if ((s.issues || []).length >= ISSUE_LIMITS.issues) return null;
            const it = makeIssue({ id: 'i' + s.seq++, title, description: text, type: 'Note', from: 'land-records', pin: pinAt(x, y, { ref: parcel ? { id: parcel, name: parcelName } : null }) });
            if (!it.pin) return null;
            setStatus(it, status); for (const c of comments.slice(0, 50)) addComment(it, c.text, c.author || '', c.date ? new Date(c.date) : new Date());
            (s.issues = s.issues || []).push(it); return it.id;
          },
          setNote(id, status) { const it = (s.issues || []).find((q) => q.id === id); return it ? setStatus(it, status) : false; },
          noteComments(id, comments) { const it = (s.issues || []).find((q) => q.id === id); if (!it) return 0; for (const c of comments.slice(0, 50)) addComment(it, c.text, c.author || '', c.date ? new Date(c.date) : new Date()); return comments.length; },
          /** A footprint read from a model, as one of CivilCraft's own building masses (so it shows on the plan and in 3D). */
          addMass({ name, ring, floors, height }) {
            if ((s.masses || []).length >= MAX_MASSES) return null;
            const fl = Math.max(1, Math.round(floors) || 1), m = cleanMass({ name, pts: ring, floors: fl, floorHeight: height > 0 ? height / fl : undefined, base: 'stepped', ground: 'eg' }, s.units);
            if (!m) return null; m.id = 'm' + s.seq++; (s.masses = s.masses || []).push(m); return m.id;
          },
          removeParcel(id) { s.parcels = (s.parcels || []).filter((q) => q.id !== id); if (s.zoning) s.zoning = s.zoning.filter((z) => z.parcel !== id); },
          addPoints(list) {
            if (!points) throw new Error('this step was not opened for points');
            const all = [...p.points, ...newPts], taken = new Set(all.map((q) => q.n));
            let next = all.reduce((m, q) => (/^\d+$/.test(q.n) ? Math.max(m, Number(q.n)) : m), 0) + 1;
            const out = [];
            for (const q of list) { while (taken.has(String(next))) next++; const n = String(next++); taken.add(n); newPts.push({ n, x: q.x, y: q.y, z: Number.isFinite(q.z) ? q.z : null, d: String(q.d || '').slice(0, 200) }); out.push(n); }
            return out;
          },
        });
        if (bookEmpty(book)) delete s.land; else s.land = book;
      };
      try {
        if (!points) { p.change(label, run); return true; }
        let failed = null;
        p.editPointTable(label, (ed, s) => { try { run(s); } catch (err) { failed = err; return null; } if (newPts.length) ed.add(newPts); });   // 0.11: the step keeps the added rows only
        if (failed) throw failed;
        return true;
      } catch (err) { api.log('change failed', err); return false; }
    },
    /** Where a position goes on the drawing. With a coordinate system: through it. Without: a site plane with its first point at `anchor`. */
    async placer(first, anchor = { x: 0, y: 0 }) {
      const s = st(), k = 1 / unitM();
      if (s?.crs) {
        const { frame } = await import('../../crs.js');
        const f = frame(s.crs);
        return { kind: 'crs', name: s.crs.name, toXY: (lat, lon) => { const [x, y] = f.fromLonLat(lon, lat); return { x, y }; }, zOf: (m) => (m === null ? null : m * k) };
      }
      const pl = localPlane(first);
      return { kind: 'local', name: '', toXY: (lat, lon) => { const q = pl.toXY(lat, lon); return { x: anchor.x + q.x * k, y: anchor.y + q.y * k }; }, zOf: (m) => (m === null ? null : m * k) };
    },
    /** The middle of what is drawn, for a walk placed on a drawing with no coordinate system. */
    anchor() {
      const ps = (st()?.parcels || []).flatMap((p) => p.pts);
      const all = ps.length ? ps : (P()?.points || []).slice(0, 5000);
      if (!all.length) return { x: 0, y: 0 };
      let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
      for (const q of all) { a = Math.min(a, q.x); b = Math.min(b, q.y); c = Math.max(c, q.x); d = Math.max(d, q.y); }
      return { x: c + (c - a) * 0.1 + 10, y: b };   // beside what is there, never on top of it
    },
    gisLayers: () => (st()?.gis?.layers || []).filter((l) => l.geom === 'pg').map((l) => ({ id: l.id, name: l.name, fields: (l.fields || []).map((f) => f.name), count: (P().gisFeatures.get(l.id) || []).length })),
    gisPolygons(id) {
      const out = [];
      for (const f of P()?.gisFeatures.get(id) || []) for (const poly of f.g?.c || []) { const r = poly[0]; if (Array.isArray(r) && r.length >= 4) out.push({ ring: r.slice(0, -1).map((q) => ({ x: q[0], y: q[1] })), props: f.p || {} }); }
      return out;
    },
    /** The street line of a lot, when its zoning names one: the ends of that course. */
    frontLine(parcelId) {
      const s = st(), z = (s?.zoning || []).find((x) => x.parcel === parcelId), p = (s?.parcels || []).find((x) => x.id === parcelId);
      if (!z || !p) return null;
      const i = Math.min(Math.max(0, z.frontCourse | 0), p.pts.length - 1), a = p.pts[i], b = p.pts[(i + 1) % p.pts.length];
      return a.b ? null : [{ x: a.x, y: a.y }, { x: b.x, y: b.y }];   // a curved street line is not measured
    },
    select(parcelId) { try { window.civilcraft.select({ kind: 'parcel', id: parcelId }); } catch { /* not on the plan */ } },
    problems: source,
    /** fn() whenever the project changes or another project is opened → stop(). */
    watch(fn) {
      let off = null, cur = null;
      const hook = () => { const p = P(); if (p === cur) return; if (off) off(); cur = p; off = p ? p.on(() => fn()) : null; fn(); };
      window.addEventListener('cc-addon-model-changed', hook); hook();
      return () => { window.removeEventListener('cc-addon-model-changed', hook); if (off) off(); };
    },
  };
}
