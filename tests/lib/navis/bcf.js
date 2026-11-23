// SPDX-License-Identifier: Apache-2.0
/**
 * bcf.js — BCF 2.1 issues in and out (buildingSMART BCF zip; 2.0 and 3.0 files are read as far as they match). DOM-free.
 * Layout written = what getcadcraft.com's BcfIssues reads: bcf.version, <topic-guid>/markup.bcf, <topic-guid>/viewpoint.bcfv. Topic guids are lower-case UUIDs.
 *   const { topics, notes } = await readBcf(bytes)
 *   topic = { guid, title, status, type, author, created, description, labels[], comments: [{ guid, date, author, text }],
 *             viewpoints: [{ guid, camera: { kind, pos, dir, up, fov|scale } | null, selection: [ifcGuid], line: [x,y,z] | null }] }
 *   const bytes = writeBcf({ topics, file })     (same topic shape; `viewpoints[0]` is written)
 * Coordinates are the model's own: metres, Z up (BCF's rule).
 */
import { unzip, zipStore } from './zip.js';
import { parseXml, find, all, textOf, esc } from './xml.js';

export const BCF_LIMITS = { topics: 5000, comments: 500, entry: 4 * 1024 * 1024, text: 20000, title: 300, selection: 5000 };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const clip = (s, n) => String(s ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, n);
export const isUuid = s => UUID.test(String(s));
export function newUuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16); (globalThis.crypto?.getRandomValues ? crypto.getRandomValues(b) : b.forEach((_, i) => { b[i] = Math.floor(Math.random() * 256); }));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map(x => x.toString(16).padStart(2, '0')).join(''); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const num = n => { const v = parseFloat(n && n.text); return Number.isFinite(v) && Math.abs(v) < 1e9 ? v : null; };
function vec(n) { if (!n) return null; const v = [num(find(n, 'X')), num(find(n, 'Y')), num(find(n, 'Z'))]; return v.every(x => x !== null) ? v : null; }

function readViewpoint(text) {
  const x = parseXml(text); const out = { guid: String(x.attrs.Guid || '').toLowerCase(), camera: null, selection: [], line: null };
  const cam = find(x, 'PerspectiveCamera') || find(x, 'OrthogonalCamera');
  if (cam) {
    const pos = vec(find(cam, 'CameraViewPoint')), dir = vec(find(cam, 'CameraDirection')), up = vec(find(cam, 'CameraUpVector')) || [0, 0, 1];
    if (pos && dir) out.camera = cam.tag === 'PerspectiveCamera' ? { kind: 'perspective', pos, dir, up, fov: num(find(cam, 'FieldOfView')) ?? 60 } : { kind: 'orthogonal', pos, dir, up, scale: num(find(cam, 'ViewToWorldScale')) ?? 1 };
  }
  const sel = find(find(x, 'Components'), 'Selection');
  for (const c of all(sel, 'Component').slice(0, BCF_LIMITS.selection)) if (c.attrs.IfcGuid) out.selection.push(clip(c.attrs.IfcGuid, 64));
  const ln = find(find(x, 'Lines'), 'Line');
  if (ln) { const a = vec(find(ln, 'StartPoint')), b = vec(find(ln, 'EndPoint')); if (a && (!b || b.every((v, i) => v === a[i]))) out.line = a; }
  return out;
}

export async function readBcf(bytes) {
  const notes = []; const z = await unzip(bytes, { maxEntry: BCF_LIMITS.entry, maxTotal: 200 * 1024 * 1024, maxEntries: 50000 });
  const markups = {}, views = {}; let version = false;
  for (const n of z.names()) {
    if (n.toLowerCase() === 'bcf.version') version = true;
    let m;
    if ((m = /^([^/]+)\/markup\.bcf$/i.exec(n))) markups[m[1]] = n;
    else if ((m = /^([^/]+)\/([^/]+\.bcfv)$/i.exec(n))) (views[m[1]] ||= {})[m[2].toLowerCase()] = n;
  }
  if (!version && !Object.keys(markups).length) throw Object.assign(new Error('navis.bcf.notbcf'), { code: 'notbcf' });
  const topics = [];
  for (const [folder, name] of Object.entries(markups)) {
    if (topics.length >= BCF_LIMITS.topics) { notes.push('toomany'); break; }
    try {
      const mx = parseXml(await z.text(name)); const t = find(mx, 'Topic'); if (!t) { notes.push('notopic:' + folder.slice(0, 40)); continue; }
      const guid = String(t.attrs.Guid || '').toLowerCase(); if (!isUuid(guid)) { notes.push('badguid:' + folder.slice(0, 40)); continue; }
      const topic = { guid, title: clip(textOf(t, 'Title'), BCF_LIMITS.title) || 'Issue', status: clip(t.attrs.TopicStatus, 40), type: clip(t.attrs.TopicType, 40),
        author: clip(textOf(t, 'CreationAuthor'), 120), created: clip(textOf(t, 'CreationDate'), 40), description: clip(textOf(t, 'Description'), BCF_LIMITS.text),
        labels: all(t, 'Labels').map(l => clip(l.text.trim(), 120)).filter(Boolean).slice(0, 20), comments: [], viewpoints: [] };
      for (const c of [...all(find(t, 'Comments'), 'Comment'), ...all(mx, 'Comment')].slice(0, BCF_LIMITS.comments)) { const text = clip(textOf(c, 'Comment'), BCF_LIMITS.text); if (text) topic.comments.push({ guid: String(c.attrs.Guid || '').toLowerCase(), date: clip(textOf(c, 'Date'), 40), author: clip(textOf(c, 'Author'), 120), text }); }
      const wanted = [...all(mx, 'Viewpoints').map(v => textOf(v, 'Viewpoint')), ...all(find(t, 'Viewpoints'), 'ViewPoint').map(v => textOf(v, 'Viewpoint'))].map(v => v.toLowerCase()).filter(Boolean);   // BCF 2.1 beside <Topic>, BCF 3.0 inside it (CV.4)
      const files = views[folder] || {}; const pick = (wanted.length ? wanted : Object.keys(files)).filter(f => files[f]);
      for (const f of pick.slice(0, 5)) { try { topic.viewpoints.push(readViewpoint(await z.text(files[f]))); } catch { notes.push('badviewpoint:' + folder.slice(0, 40)); } }
      topics.push(topic);
    } catch (e) { notes.push('unreadable:' + folder.slice(0, 40)); }
  }
  return { topics, notes };
}

const F = n => String(Number(n));
const V = (tag, v) => `<${tag}><X>${F(v[0])}</X><Y>${F(v[1])}</Y><Z>${F(v[2])}</Z></${tag}>`;
const iso = s => { const d = new Date(s); return Number.isNaN(d.getTime()) ? new Date().toISOString().replace(/\.\d+Z$/, 'Z') : d.toISOString().replace(/\.\d+Z$/, 'Z'); };

export function writeBcf({ topics, file = '' }) {
  const entries = [{ name: 'bcf.version', bytes: '<?xml version="1.0" encoding="UTF-8"?>\n<Version VersionId="2.1"><DetailedVersion>2.1</DetailedVersion></Version>\n' }];
  for (const t of topics.slice(0, BCF_LIMITS.topics)) {
    if (!isUuid(t.guid)) continue;
    const vp = (t.viewpoints || [])[0]; const vpGuid = vp && isUuid(vp.guid) ? vp.guid : newUuid();
    let m = `<?xml version="1.0" encoding="UTF-8"?>\n<Markup>\n  <Header><File IsExternal="true"><Filename>${esc(file)}</Filename><Date>${iso()}</Date></File></Header>\n`;
    m += `  <Topic Guid="${t.guid}" TopicType="${esc(t.type || 'Issue')}" TopicStatus="${esc(t.status || 'Open')}">\n    <Title>${esc(clip(t.title, BCF_LIMITS.title))}</Title>\n`;
    for (const l of t.labels || []) m += `    <Labels>${esc(clip(l, 120))}</Labels>\n`;
    m += `    <CreationDate>${iso(t.created)}</CreationDate>\n    <CreationAuthor>${esc(clip(t.author || 'SuperCad', 120))}</CreationAuthor>\n    <Description>${esc(clip(t.description, BCF_LIMITS.text))}</Description>\n  </Topic>\n`;
    for (const c of (t.comments || []).slice(0, BCF_LIMITS.comments)) m += `  <Comment Guid="${isUuid(c.guid) ? c.guid : newUuid()}"><Date>${iso(c.date)}</Date><Author>${esc(clip(c.author || 'SuperCad', 120))}</Author><Comment>${esc(clip(c.text, BCF_LIMITS.text))}</Comment></Comment>\n`;
    if (vp) m += `  <Viewpoints Guid="${vpGuid}"><Viewpoint>viewpoint.bcfv</Viewpoint></Viewpoints>\n`;
    entries.push({ name: `${t.guid}/markup.bcf`, bytes: m + '</Markup>\n' });
    if (vp) {
      let v = `<?xml version="1.0" encoding="UTF-8"?>\n<VisualizationInfo Guid="${vpGuid}">\n`;
      if (vp.selection && vp.selection.length) v += '  <Components><Selection>' + vp.selection.slice(0, BCF_LIMITS.selection).map(g => `<Component IfcGuid="${esc(g)}"/>`).join('') + '</Selection></Components>\n';
      const c = vp.camera;
      if (c) v += `  <${c.kind === 'orthogonal' ? 'OrthogonalCamera' : 'PerspectiveCamera'}>${V('CameraViewPoint', c.pos)}${V('CameraDirection', c.dir)}${V('CameraUpVector', c.up || [0, 0, 1])}${c.kind === 'orthogonal' ? `<ViewToWorldScale>${F(c.scale ?? 1)}</ViewToWorldScale>` : `<FieldOfView>${F(c.fov ?? 60)}</FieldOfView>`}</${c.kind === 'orthogonal' ? 'OrthogonalCamera' : 'PerspectiveCamera'}>\n`;
      if (vp.line) v += `  <Lines><Line>${V('StartPoint', vp.line)}${V('EndPoint', vp.line)}</Line></Lines>\n`;
      entries.push({ name: `${t.guid}/viewpoint.bcfv`, bytes: v + '</VisualizationInfo>\n' });
    }
  }
  return zipStore(entries);
}
