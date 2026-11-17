// SPDX-License-Identifier: Apache-2.0
/**
 * rows.js — what SuperCad keeps from a Navisworks package, and what it gives back. Pure functions over plain data. DOM-free.
 *   keep(model)               → { items (guid,name,cls,parent), sets, viewpoints, clashes } as stored in the project (properties are not kept; the package is)
 *   merge(prev, next)         → next's clashes/viewpoints with this team's own fields (state, task, note, decided) carried over by guid; { clashes, viewpoints, added, changed, gone }
 *   clashTopics(rows, opts)   → BCF topics for the clashes (state → TopicStatus; the team's note → a comment)
 *   issueTopics(items)        → BCF topics for other items (viewpoints, tasks) given as { guid, title, description, status, author, created, camera, selection, line }
 *   topicsToRows(topics, items) → what a BCF from Navisworks (or anyone) adds: clash rows when TopicType is Clash, else viewpoint rows
 *   taskFor(clash, names)     → { title, origin, link }  for the notes-tasks plugin
 *   stats(rows)               → counts by status
 * Local states: 'open' | 'review' | 'resolved' | 'ignored'. Navisworks' own word is kept as `navStatus`.
 */
import { isUuid, newUuid } from './bcf.js';

export const STATES = ['open', 'review', 'resolved', 'ignored'];
const NAV_DONE = /^(approved|resolved|closed|done)$/i;
const NAV_REVIEW = /^(reviewed|assigned|active|in progress)$/i;
export const stateFromNav = st => (NAV_DONE.test(st || '') ? 'resolved' : NAV_REVIEW.test(st || '') ? 'review' : 'open');
const bcfStatus = state => (state === 'resolved' || state === 'ignored' ? 'Closed' : state === 'review' ? 'Active' : 'Open');

export function keep(model) {
  return {
    items: model.items.map(i => ({ id: i.id, parent: i.parent, guid: i.guid, name: i.name, cls: i.cls, geometry: i.geometry })),
    sets: model.sets.map(x => ({ name: x.name, folder: x.folder, search: x.search, guids: x.guids })),
    viewpoints: model.viewpoints.map(v => ({ guid: v.guid, name: v.name, folder: v.folder, position: v.position, direction: v.direction, up: v.up, fov: v.fov, perspective: v.perspective, comments: v.comments })),
    clashes: model.clashes.map(c => ({ ...c, navStatus: c.status, state: stateFromNav(c.status), note: '', task: '', decided: '' })),
  };
}

export function merge(prev, next) {
  const was = new Map((prev.clashes || []).map(c => [c.guid, c]));
  let added = 0, changed = 0;
  const clashes = next.clashes.map(c => {
    const p = was.get(c.guid);
    if (!p) { added++; return c; }
    was.delete(c.guid);
    // the team's own decision wins over a fresh read, unless Navisworks moved to a different word since last time
    const moved = p.navStatus !== c.navStatus;
    if (moved) changed++;
    return { ...c, state: moved ? c.state : p.state, note: p.note, task: p.task, decided: p.decided };
  });
  const vp = new Map((prev.viewpoints || []).map(v => [v.guid, v]));
  const viewpoints = next.viewpoints.map(v => { if (!vp.delete(v.guid)) added++; return v; });
  return { clashes, viewpoints, added, changed, gone: was.size };
}

export function clashTopics(rows, { author = 'SuperCad', itemName = () => '' } = {}) {
  return rows.map(c => {
    const g = isUuid(c.guid) ? c.guid : null; if (!g) return null;
    const names = [itemName(c.item1), itemName(c.item2)].filter(Boolean).join(' / ');
    const desc = [c.test + (c.group ? ' / ' + c.group : '') + ': ' + c.name, c.description, names ? 'Items: ' + names : '', c.item2 ? 'Clashes with ' + c.item2 : ''].filter(Boolean).join('\n');
    return { guid: g, title: 'Clash: ' + c.name, type: 'Clash', status: bcfStatus(c.state), author, created: c.created, description: desc, labels: ['cc-kind:' + (c.item1 ? 'element' : 'view')],
      comments: c.note ? [{ author, date: c.decided || new Date().toISOString(), text: c.note }] : [],
      viewpoints: [{ guid: newUuid(), camera: null, selection: [c.item1].filter(Boolean), line: c.center }] };
  }).filter(Boolean);
}

export function issueTopics(list, { author = 'SuperCad' } = {}) {
  return list.map(x => ({ guid: isUuid(x.guid) ? x.guid : newUuid(), title: x.title || 'Issue', type: 'Issue', status: x.status || 'Open', author: x.author || author, created: x.created || new Date().toISOString(),
    description: x.description || '', labels: [], comments: x.comments || [], viewpoints: [{ guid: newUuid(), camera: x.camera || null, selection: x.selection || [], line: x.line || null }] }));
}

export function topicsToRows(topics, itemGuids = new Set()) {
  const clashes = [], viewpoints = [];
  for (const t of topics) {
    const v = t.viewpoints[0] || null;
    if (/^clash$/i.test(t.type)) {
      const first = v && v.selection.find(g => !itemGuids.size || itemGuids.has(g)) || '';
      clashes.push({ guid: t.guid, test: 'BCF', group: '', name: t.title.replace(/^Clash:\s*/i, ''), status: t.status, description: t.description, assignedTo: '', created: t.created, item1: first, item2: '', center: v && v.line || null, distance: null,
        navStatus: t.status, state: stateFromNav(t.status), note: '', task: '', decided: '' });
    } else {
      viewpoints.push({ guid: t.guid, name: t.title, folder: 'BCF', position: v && v.camera ? v.camera.pos : null, direction: v && v.camera ? v.camera.dir : null, up: v && v.camera ? v.camera.up : [0, 0, 1],
        fov: v && v.camera && v.camera.fov || 60, perspective: !v || !v.camera || v.camera.kind !== 'orthogonal', comments: [{ author: t.author, text: t.description || t.title, status: t.status, date: t.created }, ...t.comments.map(c => ({ author: c.author, text: c.text, status: '', date: c.date }))] });
    }
  }
  return { clashes, viewpoints };
}

export function taskFor(c, names = () => '') {
  const who = [names(c.item1), names(c.item2)].filter(Boolean).join(' and ');
  return { title: ('Clash: ' + (who || c.name)).slice(0, 200), origin: 'navisworks', link: { app: 'navisworks', id: c.guid } };
}

export function stats(clashes) {
  const out = { total: clashes.length, open: 0, review: 0, resolved: 0, ignored: 0, tasks: 0 };
  for (const c of clashes) { out[c.state] = (out[c.state] || 0) + 1; if (c.task) out.tasks++; }
  return out;
}
