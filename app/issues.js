/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes, BCF words and field names; the words people read are the UI's t() keys (iss.*). */
/**
 * issues.js — issues in CivilCraft (0.10 CV.1): a problem pinned to a place on the plan, an alignment station, a surface point or a pipe, with a title,
 * a status, comments and the view it was seen in; BCF 2.1 in and out (read 2.0 and 3.0 as far as lib/navis's reader matches them) so site people and BIM
 * programs exchange them next to the LandXML file. DOM-free; the BCF zip itself is the shared lib/navis (./navis/bcf.js, byte-identical copy:
 * node tools/navis/sync.mjs civilcraft), this file maps CivilCraft's issues to its topic shape and back.
 *
 *   cleanIssues(list, units)                        → the saved list, cleaned (untrusted: the file)
 *   makeIssue({ title, description, author, pin, view, type, status, now, id }) → issue
 *   pinAt(x, y, { kind, z, ref }) · stationPin(alignment, sta, off) → pin
 *   addComment(issue, text, author, now) · setStatus(issue, status) (mutate; call inside project.change)
 *   toTopics(issues, { units, names }) → BCF topics        (project units → metres; the pin is the viewpoint's line, the view an orthogonal plan camera)
 *   fromTopics(topics, { units, existing, nextId }) → { issues, added, updated }   (same guid = the same issue: status and new comments are taken)
 *   issuesFromProblems(list, { units, nextId, existing }) → [issue]   (from Problems entries: { id, severity, text, where: { at: [x, y] } })
 *   sceneItems(issues, { mmPerUnit }) → plan items on C-ISSU-OPEN / C-ISSU-DONE
 *   stats(issues) → { open, active, resolved, closed, total, unplaced }
 *
 * issue = { id 'i<n>', guid (a BCF topic guid), title, description, type, status 'open'|'active'|'resolved'|'closed', author, created (ISO),
 *           comments: [{ date, author, text }], pin: { kind 'plan'|'station'|'surface'|'pipe'|'structure', x, y, z|null, ref? } | null,
 *           view: { cx, cy, h } | null (the centre and the visible height of the plan, project units), from: 'problem:<id>' | 'bcf' | '' }
 * BCF carries metres in the project's own coordinates, not shifted: a viewer must be in the same coordinate system as the LandXML file. The visible height
 * of the plan view goes in the orthogonal camera's ViewToWorldScale (BCF 2.1 does not say whether that is the full or half height: written here as the
 * full height; not checked against another program). The element a pin points at (alignment, station, offset, pipe, structure) is written as labels
 * "cc:<key>=<value>" so CivilCraft reads it back; other programs show them as plain labels.
 */
import { newUuid, isUuid } from './navis/bcf.js';

export const STATES = ['open', 'active', 'resolved', 'closed'];
export const PIN_KINDS = ['plan', 'station', 'surface', 'pipe', 'structure'];
export const LIMITS = { issues: 5000, comments: 200, text: 4000, title: 200 };
const fin = Number.isFinite;
const str = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').trim().slice(0, n);
const mPer = (units) => (units === 'm' ? 1 : 0.3048);
const iso = (v) => { const d = new Date(v); return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString(); };

const cleanPin = (p) => {
  if (!p || typeof p !== 'object' || !fin(p.x) || !fin(p.y) || Math.abs(p.x) > 1e12 || Math.abs(p.y) > 1e12) return null;
  const ref = p.ref && typeof p.ref === 'object' ? { ...(p.ref.alignment ? { alignment: str(p.ref.alignment, 40) } : {}), ...(fin(p.ref.sta) ? { sta: p.ref.sta } : {}), ...(fin(p.ref.off) ? { off: p.ref.off } : {}), ...(p.ref.id ? { id: str(p.ref.id, 40) } : {}), ...(p.ref.name ? { name: str(p.ref.name, 80) } : {}) } : null;
  return { kind: PIN_KINDS.includes(p.kind) ? p.kind : 'plan', x: p.x, y: p.y, z: fin(p.z) ? p.z : null, ...(ref && Object.keys(ref).length ? { ref } : {}) };
};
const cleanView = (v) => (v && typeof v === 'object' && fin(v.cx) && fin(v.cy) && fin(v.h) && v.h > 0 ? { cx: v.cx, cy: v.cy, h: v.h } : null);

export function cleanIssues(list, units = 'ft') {
  void units;
  const seen = new Set(), guids = new Set(), out = [];
  for (const r of (Array.isArray(list) ? list : []).slice(0, LIMITS.issues)) {
    if (!r || typeof r !== 'object') continue;
    const id = /^i\d{1,9}$/.test(String(r.id)) ? String(r.id) : null;
    if (!id || seen.has(id)) continue;
    const guid = isUuid(String(r.guid || '').toLowerCase()) ? String(r.guid).toLowerCase() : newUuid();
    if (guids.has(guid)) continue;
    seen.add(id); guids.add(guid);
    out.push({ id, guid, title: str(r.title, LIMITS.title) || 'Issue', description: str(r.description, LIMITS.text), type: str(r.type, 40) || 'Issue',
      status: STATES.includes(r.status) ? r.status : 'open', author: str(r.author, 120), created: iso(r.created),
      comments: (Array.isArray(r.comments) ? r.comments : []).slice(0, LIMITS.comments).map((c) => ({ date: iso(c?.date), author: str(c?.author, 120), text: str(c?.text, LIMITS.text) })).filter((c) => c.text),
      pin: cleanPin(r.pin), view: cleanView(r.view), from: str(r.from, 120) });
  }
  return out;
}

export function makeIssue({ id, title, description = '', author = '', pin = null, view = null, type = 'Issue', status = 'open', now = new Date(), from = '' }) {
  return { id, guid: newUuid(), title: str(title, LIMITS.title) || 'Issue', description: str(description, LIMITS.text), type: str(type, 40) || 'Issue',
    status: STATES.includes(status) ? status : 'open', author: str(author, 120), created: iso(now), comments: [], pin: cleanPin(pin), view: cleanView(view), from: str(from, 120) };
}

export const pinAt = (x, y, { kind = 'plan', z = null, ref = null } = {}) => cleanPin({ kind, x, y, z, ref });

/** A pin on an alignment at a station and offset (positive = right). `al` is the alignment object (pointAt(sta) → { x, y, dir }), `name` its name. */
export function stationPin(al, sta, off = 0, { name = '', id = '', z = null } = {}) {
  const p = al?.pointAt?.(sta);
  if (!p || !fin(p.x) || !fin(p.y)) return null;
  const dir = fin(p.dir) ? p.dir : fin(p.az) ? p.az : 0;
  const x = p.x + Math.cos(dir - Math.PI / 2) * off, y = p.y + Math.sin(dir - Math.PI / 2) * off;   // offset to the right of the direction of travel
  return cleanPin({ kind: 'station', x, y, z, ref: { alignment: id || name, name, sta, off } });
}

export function addComment(issue, text, author = '', now = new Date()) {
  const s = str(text, LIMITS.text);
  if (!s || issue.comments.length >= LIMITS.comments) return false;
  issue.comments.push({ date: iso(now), author: str(author, 120), text: s });
  return true;
}
export function setStatus(issue, status) { if (!STATES.includes(status) || issue.status === status) return false; issue.status = status; return true; }

// ---------------------------------------------------------------------------- BCF
const bcfStatus = (s) => ({ open: 'Open', active: 'Active', resolved: 'Resolved', closed: 'Closed' }[s] || 'Open');
const NAV_DONE = /^(approved|resolved|done|fixed)$/i, NAV_CLOSED = /^(closed|rejected|duplicate|wontfix)$/i, NAV_ACTIVE = /^(active|assigned|reviewed|in progress|in_progress)$/i;
export const stateFromBcf = (s) => (NAV_CLOSED.test(String(s || '').trim()) ? 'closed' : NAV_DONE.test(String(s || '').trim()) ? 'resolved' : NAV_ACTIVE.test(String(s || '').trim()) ? 'active' : 'open');

const refLabels = (pin) => {
  const out = ['cc:pin=' + pin.kind];
  const r = pin.ref || {};
  if (r.alignment) out.push('cc:alignment=' + String(r.alignment).slice(0, 80));
  if (r.name && r.name !== r.alignment) out.push('cc:name=' + String(r.name).slice(0, 80));
  if (fin(r.sta)) out.push('cc:station=' + r.sta);
  if (fin(r.off)) out.push('cc:offset=' + r.off);
  if (r.id) out.push('cc:id=' + String(r.id).slice(0, 80));
  return out;
};
const refFrom = (labels) => {
  const get = (k) => { const l = (labels || []).find((x) => x.startsWith('cc:' + k + '=')); return l ? l.slice(4 + k.length) : null; };
  const kind = get('pin'), ref = {};
  if (get('alignment')) ref.alignment = get('alignment');
  if (get('name')) ref.name = get('name');
  if (get('station') !== null && fin(Number(get('station')))) ref.sta = Number(get('station'));
  if (get('offset') !== null && fin(Number(get('offset')))) ref.off = Number(get('offset'));
  if (get('id')) ref.id = get('id');
  return { kind: PIN_KINDS.includes(kind) ? kind : null, ref: Object.keys(ref).length ? ref : null };
};

export function toTopics(issues, { units = 'ft' } = {}) {
  const k = mPer(units);
  return issues.map((r) => {
    const topic = { guid: r.guid, title: r.title, status: bcfStatus(r.status), type: r.type || 'Issue', author: r.author, created: r.created, description: r.description,
      labels: ['CivilCraft', ...(r.pin ? refLabels(r.pin) : [])].slice(0, 20), comments: r.comments.map((c) => ({ guid: newUuid(), date: c.date, author: c.author, text: c.text })), viewpoints: [] };
    if (r.pin) {
      const z = (fin(r.pin.z) ? r.pin.z : 0) * k, c = r.view || { cx: r.pin.x, cy: r.pin.y, h: 60 / k };
      topic.viewpoints.push({ guid: newUuid(), camera: { kind: 'orthogonal', pos: [c.cx * k, c.cy * k, z + 100], dir: [0, 0, -1], up: [0, 1, 0], scale: c.h * k }, selection: [], line: [r.pin.x * k, r.pin.y * k, z] });
    }
    return topic;
  });
}

export function fromTopics(topics, { units = 'ft', existing = [], nextId, now = new Date() } = {}) {
  const k = mPer(units), byGuid = new Map(existing.map((r) => [r.guid, r]));
  const out = existing.map((r) => ({ ...r, comments: r.comments.map((c) => ({ ...c })) }));
  const index = new Map(out.map((r) => [r.guid, r]));
  let added = 0, updated = 0;
  for (const t of topics || []) {
    if (!t || !isUuid(String(t.guid))) continue;
    const have = index.get(t.guid), vp = (t.viewpoints || [])[0] || null;
    const { kind, ref } = refFrom(t.labels);
    let pin = null, view = null;
    if (vp?.line) pin = cleanPin({ kind: kind || 'plan', x: vp.line[0] / k, y: vp.line[1] / k, z: vp.line[2] / k, ref });
    if (vp?.camera?.kind === 'orthogonal' && Math.abs(vp.camera.dir[2]) > 0.9) view = cleanView({ cx: vp.camera.pos[0] / k, cy: vp.camera.pos[1] / k, h: (vp.camera.scale || 0) / k });
    else if (!pin && vp?.camera) pin = cleanPin({ kind: 'plan', x: vp.camera.pos[0] / k, y: vp.camera.pos[1] / k, z: null });
    const status = stateFromBcf(t.status);
    if (have) {
      let changed = false;
      if (have.status !== status) { have.status = status; changed = true; }
      const seen = new Set(have.comments.map((c) => c.text + '|' + String(c.date).slice(0, 16)));
      for (const c of t.comments || []) { const key = c.text + '|' + String(iso(c.date)).slice(0, 16); if (!seen.has(key) && have.comments.length < LIMITS.comments) { have.comments.push({ date: iso(c.date), author: str(c.author, 120), text: str(c.text, LIMITS.text) }); seen.add(key); changed = true; } }
      if (!have.pin && pin) { have.pin = pin; changed = true; }
      if (changed) updated++;
      continue;
    }
    if (out.length >= LIMITS.issues) break;
    const id = nextId ? nextId('i') : 'i' + (out.length + 1);
    out.push({ id, guid: t.guid, title: str(t.title, LIMITS.title) || 'Issue', description: str(t.description, LIMITS.text), type: str(t.type, 40) || 'Issue', status, author: str(t.author, 120), created: iso(t.created || now),
      comments: (t.comments || []).slice(0, LIMITS.comments).map((c) => ({ date: iso(c.date), author: str(c.author, 120), text: str(c.text, LIMITS.text) })).filter((c) => c.text), pin, view, from: 'bcf' });
    added++;
  }
  void byGuid;
  return { issues: out, added, updated };
}

/** Issues from Problems entries: only those that say where ({ where: { at: [x, y] } }) and are not already an issue (same `from`). */
export function issuesFromProblems(list, { nextId, existing = [], now = new Date(), author = '' } = {}) {
  const have = new Set(existing.map((r) => r.from).filter(Boolean)), out = [];
  for (const p of list || []) {
    const from = 'problem:' + str(p.id, 100);
    if (have.has(from) || !p.where?.at || !fin(p.where.at[0]) || !fin(p.where.at[1])) continue;
    out.push(makeIssue({ id: nextId('i'), title: str(p.text, LIMITS.title) || 'Problem', description: str(p.text, LIMITS.text), author, type: 'Problem',
      pin: pinAt(p.where.at[0], p.where.at[1], { kind: 'plan', z: fin(p.where.at[2]) ? p.where.at[2] : null }), now, from }));
    have.add(from);
  }
  return out;
}

export function stats(issues) {
  const s = { open: 0, active: 0, resolved: 0, closed: 0, total: issues.length, unplaced: 0 };
  for (const r of issues) { s[r.status]++; if (!r.pin) s.unplaced++; }
  return s;
}

export const LAYER_DEFS = [['C-ISSU-OPEN', 'iss.layer.open', 1], ['C-ISSU-DONE', 'iss.layer.done', 8]];

/** A diamond with the issue's number beside it, at the pin (size in paper mm, so it reads at any zoom bucket). */
export function sceneItems(issues, { mmPerUnit = 1 } = {}) {
  const u = 1 / mmPerUnit, items = [];
  issues.forEach((r, i) => {
    if (!r.pin) return;
    const layer = r.status === 'open' || r.status === 'active' ? 'C-ISSU-OPEN' : 'C-ISSU-DONE', s = 2.2 * u, { x, y } = r.pin;
    items.push({ layer, kind: 'poly', pts: [{ x, y: y - s }, { x: x + s, y }, { x, y: y + s }, { x: x - s, y }], closed: true });
    items.push({ layer, kind: 'text', x: x + 3 * u, y: y + 0.6 * u, rot: 0, mm: 2, align: 'left', text: String(i + 1) });
  });
  return items;
}
