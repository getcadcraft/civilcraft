/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — every word a person reads comes from `t` in features-ui.js; the `code`s here are the server's. */
/**
 * team-lines.js — feature lines shared between the drawings of one team (0.8 WL.26, app side; the site's service is SharedLines,
 * /api/v1/team/lines). DOM-free: the Node test (bin/test-civilcraft-teamlines.mjs) drives it with a stand-in `request` and again over
 * real HTTP; features-ui.js is the panel.
 *
 *   const tl = createTeamLines({ request, drawing, units })     request({method, path, body, contentType}) → { status, json() }  — in Studio
 *       cadcraftDesktop.cloud.request (the sign-in stays in the shell); drawing = the cloud file's uuid ('' = not a cloud file)
 *   await tl.context()          → { ok, project, projectName, canEdit }      which project this file is in (GET /api/v1/sync/versions)
 *   await tl.list()             → { ok, lines [{ uuid, name, revision, points, updated_at, following, behind }] }   the project's shared lines
 *                                  and every team line this drawing follows (behind = a newer revision exists)
 *   await tl.share(feature)     → { ok, shared: { uuid, revision }, chords }   publish one feature line; this drawing follows it
 *   await tl.push(feature)      → { ok, shared, chords }                       send a changed line (revision + 1; followers are told)
 *   await tl.place(uuid)        → { ok, feature (pts, closed, name), shared }   follow a team line and take its geometry
 *   await tl.pull(feature)      → { ok, feature, shared }                      take the newest geometry of a followed line
 *   await tl.stop(feature)      → { ok }                                       stop following (the line stays in the drawing, unlinked)
 *   toGeometry(f, units) · fromGeometry(geo, units, base?) · cleanShared(obj)
 * A feature line that came from or went to the team keeps `shared: { uuid, revision }` (featureline.js cleanFeature keeps it in the
 * project file). Arcs are sent as chords (the format is points only; `chords` says so) and units travel as geometry.style "units=ft|m".
 * Results are { ok, code, message }; `code` is the server's (teamwork_closed, not_found, forbidden, invalid, throttled …) or 'offline' / 'no_file'.
 */
import { flatten } from './featureline.js';

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FT = 0.3048;

/** { uuid, revision } from untrusted data, or null. */
export function cleanShared(o) {
  if (!o || typeof o !== 'object' || !UUID_RE.test(String(o.uuid || ''))) return null;
  const rev = Number.parseInt(o.revision, 10);
  return { uuid: String(o.uuid).toLowerCase(), revision: Number.isInteger(rev) && rev >= 1 && rev < 1e9 ? rev : 1 };
}

/** The feature line as the site's `cc-feature-line` geometry. Arcs become chords (within 0.01). → { geometry, chords } */
export function toGeometry(f, units = 'ft') {
  const arcs = f.pts.some((p) => p.b);
  const pts = arcs ? flatten(f) : f.pts;
  return { geometry: { points: pts.map((p) => [p.x, p.y, p.z]), closed: !!f.closed, style: 'units=' + (units === 'm' ? 'm' : 'ft') }, chords: arcs };
}

/** Geometry from the site → { pts, closed }, in `units` (a line made in the other unit is scaled). null when it is not usable. */
export function fromGeometry(geo, units = 'ft') {
  if (!geo || !Array.isArray(geo.points) || geo.points.length < 2) return null;
  const from = /units=(ft|m)\b/.exec(String(geo.style || ''))?.[1] || units;
  const k = from === units ? 1 : from === 'm' ? 1 / FT : FT;
  const pts = [];
  for (const p of geo.points) {
    if (!Array.isArray(p) || p.length < 2 || !p.every((v) => Number.isFinite(v))) return null;
    pts.push({ x: p[0] * k, y: p[1] * k, z: (p[2] || 0) * k });
  }
  return { pts, closed: !!geo.closed && pts.length >= 3 };
}

const qs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');

export function createTeamLines({ request, drawing = '', units = 'ft' } = {}) {
  let send = request;
  let ctx = null;
  const id = UUID_RE.test(drawing || '') ? drawing.toLowerCase() : '';
  const u = () => (typeof units === 'function' ? units() : units);
  async function call(method, path, body) {
    if (typeof send !== 'function') return { ok: false, code: 'offline', message: 'Not signed in here.' };
    let res;
    try { res = await send({ method, path, body: body === undefined ? undefined : new TextEncoder().encode(JSON.stringify(body)), contentType: body === undefined ? undefined : 'application/json' }); }
    catch (e) { return { ok: false, code: e && e.code === 'not_allowed' ? 'not_allowed' : 'offline', message: String((e && e.message) || e) }; }
    let json = null;
    try { json = typeof res.json === 'function' ? res.json() : res.json; } catch (e) { json = null; }
    if (res.status >= 200 && res.status < 300) return { ok: true, data: (json && json.data) || {} };
    return { ok: false, code: String((json && (json.code || json.error)) || (res.status === 429 ? 'throttled' : res.status >= 500 ? 'server' : 'error')), message: (json && json.message) || '' };
  }
  const bad = (r) => ({ ok: false, code: r.code, message: r.message || '' });
  const noFile = () => (id ? null : { ok: false, code: 'no_file', message: 'This file is not in the cloud.' });
  const tl = {
    drawing: id,
    available: () => typeof send === 'function',
    setRequest(fn) { send = fn; ctx = null; },

    async context() {
      const n = noFile(); if (n) return n;
      if (ctx) return { ok: true, ...ctx };
      const r = await call('GET', '/api/v1/sync/versions?' + qs({ drawing: id }));
      if (!r.ok) return bad(r);
      const d = r.data.drawing || {};
      if (!UUID_RE.test(String(d.project || ''))) return { ok: false, code: 'not_found', message: 'This file has no project.' };
      ctx = { project: String(d.project), projectName: String(d.project_name || ''), canEdit: d.can_edit === true };
      return { ok: true, ...ctx };
    },

    async list() {
      const c = await tl.context(); if (!c.ok) return c;
      const [a, b] = await Promise.all([call('GET', '/api/v1/team/lines?' + qs({ project: c.project })), call('GET', '/api/v1/team/lines?' + qs({ drawing: id }))]);
      if (!a.ok) return bad(a);
      if (!b.ok) return bad(b);
      const following = new Map((b.data.following || []).map((x) => [x.uuid, x]));
      const seen = new Set();
      const lines = [];
      for (const l of a.data.lines || []) { seen.add(l.uuid); const f = following.get(l.uuid); lines.push({ ...l, following: !!f, behind: !!(f && f.behind) }); }
      for (const f of following.values()) if (!seen.has(f.uuid)) lines.push({ ...f, following: true, behind: !!f.behind });   // a line of another project of the team
      return { ok: true, lines };
    },

    async share(f) {
      const c = await tl.context(); if (!c.ok) return c;
      if (!c.canEdit) return { ok: false, code: 'forbidden', message: 'You can only view this file.' };
      const g = toGeometry(f, u());
      const r = await call('POST', '/api/v1/team/lines', { action: 'create', project: c.project, name: f.name, geometry: g.geometry });
      if (!r.ok) return bad(r);
      const line = r.data.line;
      const fo = await call('POST', '/api/v1/team/lines', { action: 'follow', drawing: id, line: line.uuid });
      if (!fo.ok) return { ...bad(fo), shared: cleanShared({ uuid: line.uuid, revision: line.revision }) };
      return { ok: true, shared: cleanShared({ uuid: line.uuid, revision: line.revision }), chords: g.chords };
    },

    async push(f) {
      const s = cleanShared(f.shared);
      if (!s) return { ok: false, code: 'invalid', message: 'This line is not shared yet.' };
      const n = noFile(); if (n) return n;
      const g = toGeometry(f, u());
      const r = await call('POST', '/api/v1/team/lines', { action: 'update', line: s.uuid, geometry: g.geometry, name: f.name });
      if (!r.ok) return bad(r);
      await call('POST', '/api/v1/team/lines', { action: 'pull', drawing: id, line: s.uuid });   // this drawing is up to date with what it just sent
      return { ok: true, shared: cleanShared({ uuid: s.uuid, revision: r.data.line.revision }), chords: g.chords, notified: r.data.notified ?? 0 };
    },

    async place(lineUuid) {
      const n = noFile(); if (n) return n;
      if (!UUID_RE.test(lineUuid || '')) return { ok: false, code: 'invalid', message: 'No such line.' };
      const fo = await call('POST', '/api/v1/team/lines', { action: 'follow', drawing: id, line: lineUuid });
      if (!fo.ok) return bad(fo);
      const r = await call('POST', '/api/v1/team/lines', { action: 'pull', drawing: id, line: lineUuid });
      if (!r.ok) return bad(r);
      const geo = fromGeometry(r.data.line.geometry, u());
      if (!geo) return { ok: false, code: 'invalid', message: 'The line has no usable geometry.' };
      return { ok: true, feature: { name: String(r.data.line.name || '').slice(0, 120), ...geo }, shared: cleanShared({ uuid: lineUuid, revision: r.data.line.revision }) };
    },

    async pull(f) {
      const s = cleanShared(f.shared);
      if (!s) return { ok: false, code: 'invalid', message: 'This line is not shared.' };
      const n = noFile(); if (n) return n;
      const r = await call('POST', '/api/v1/team/lines', { action: 'pull', drawing: id, line: s.uuid });
      if (!r.ok) return bad(r);
      const geo = fromGeometry(r.data.line.geometry, u());
      if (!geo) return { ok: false, code: 'invalid', message: 'The line has no usable geometry.' };
      return { ok: true, feature: { name: String(r.data.line.name || f.name).slice(0, 120), ...geo }, shared: cleanShared({ uuid: s.uuid, revision: r.data.line.revision }) };
    },

    async stop(f) {
      const s = cleanShared(f.shared);
      if (!s) return { ok: true };
      const n = noFile(); if (n) return n;
      const r = await call('POST', '/api/v1/team/lines', { action: 'unfollow', drawing: id, line: s.uuid });
      return r.ok ? { ok: true } : bad(r);
    },
  };
  return tl;
}
