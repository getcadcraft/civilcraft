// SPDX-License-Identifier: Apache-2.0
// cc-bundle plan.js: what each app can take out of a project bundle (0.8 BIM-BUNDLE-OPEN, session ifc_PART_3, rule 39: one table, every host).
// Canonical copy: lib/bundle/; apps carry byte-identical copies in dev/bundle/ (tools/bundle/sync.mjs). No DOM, no app imports.
/* i18n-ignore-file: data shapes. */

/** What an app opens from a bundle: 'model' (the IFC), 'dwg' (layout and view drawings), 'pdf' (layout sheets), 'standards' (layers, line types). */
export const TAKES = Object.freeze({
  bimcraft: ['model', 'dwg', 'pdf', 'standards'],
  cadcraft: ['dwg', 'standards'],
  markupcraft: ['pdf'],
  takeoffcraft: ['pdf', 'dwg'],
  civilcraft: ['model'],
  detailcraft: ['model'],
  modelcraft: ['dwg'],   // no IFC reader there; the layouts' / views' drawings import through its DWG import (one at a time)
  partcraft: [],
  supercadcraft: ['model', 'dwg', 'pdf', 'standards'],
});

const extOf = (p) => (String(p).match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();

/** Every file of an opened bundle (`openBundle` result) an app could take: [{ kind: 'model' | 'dwg' | 'pdf', role: 'model' | 'layout' | 'view', name, path, number? }]. */
export function filesIn(opened) {
  const m = opened.manifest, out = [{ kind: 'model', role: 'model', name: m.project?.name || m.model.file, path: m.model.file }];
  const have = (p) => p && opened.index.has(p);
  const seen = new Set();
  const add = (kind, role, name, path, number) => { if (have(path) && !seen.has(path)) { seen.add(path); out.push({ kind, role, name: name || path, path, ...(number ? { number } : {}) }); } };
  for (const l of m.layouts || []) { add('pdf', 'layout', l.name, l.pdf, l.number); add('dwg', 'layout', l.name, l.dwg, l.number); }
  for (const v of m.views || []) { const k = extOf(v.file) === 'pdf' ? 'pdf' : 'dwg'; add(k, 'view', v.name, v.file); }
  return out;
}

/** What `app` can take from the bundle, in the bundle's order. An app that takes nothing gets []. */
export function takesFor(app, opened) {
  const t = TAKES[app] || [];
  const files = filesIn(opened).filter((f) => t.includes(f.kind));
  return { files, standards: t.includes('standards') ? Object.keys(opened.manifest.standards || {}).length > 0 : false };
}

/**
 * Replace each project bundle in a list of Files by the files `app` takes from it (the shared way every app opens a bundle: the app's own
 * open path then sees ordinary PDFs or drawings). A layout that has several forms gives one: the first of `prefer` (default pdf, then dwg).
 * A file that is not a bundle stays as it was. → { files: [File], notes: [{ code, file, n? }] }   codes: bundle (n = files taken), empty, failed
 * `limit` caps the files taken from one bundle (default 40).
 */
export async function expandBundles(list, app, { prefer = ['pdf', 'dwg'], limit = 40, readerModule = null } = {}) {
  const { openBundle } = readerModule || (await import('./read.js'));
  const out = [], notes = [];
  for (const f of list) {
    if (!/\.ccbundle$|ccbundle\.zip$/i.test(f.name || '')) { out.push(f); continue; }
    let opened;
    try { opened = await openBundle(f); }
    catch (e) { notes.push({ code: 'failed', file: f.name, why: e && e.code || 'broken' }); continue; }
    const take = takesFor(app, opened).files.filter((x) => prefer.includes(x.kind));
    const byName = new Map();
    for (const x of take) {
      const key = x.role + '|' + x.name;
      const cur = byName.get(key);
      if (!cur || prefer.indexOf(x.kind) < prefer.indexOf(cur.kind)) byName.set(key, x);
    }
    const picked = [...byName.values()].slice(0, limit);
    if (!picked.length) { notes.push({ code: 'empty', file: f.name }); continue; }
    for (const x of picked) {
      const bytes = await opened.index.read(x.path, { max: 200 * 1024 * 1024 });
      const ext = x.path.split('.').pop().toLowerCase();
      const base = String(x.name || x.path).replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 120) || 'sheet';
      out.push(new File([bytes], base.replace(new RegExp('\\.' + ext + '$', 'i'), '') + '.' + ext, { type: ext === 'pdf' ? 'application/pdf' : ext === 'ifc' ? 'application/x-step' : 'application/acad' }));
    }
    notes.push({ code: 'bundle', file: f.name, n: picked.length });
  }
  return { files: out, notes };
}
