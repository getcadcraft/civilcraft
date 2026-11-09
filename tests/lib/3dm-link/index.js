/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — tool names, descriptions and results are read by the other program's script, not shown to the person. */
/**
 * index.js — cc-3dm-link (0.9 SU.810b; docs/spikes/SU.810.md): a live link from a program that saves .3dm files into a CadCraft app.
 * DOM-free, no imports; byte-identical copies in the hosts (`node tools/3dm-link/sync.mjs [--check]`). Nobody edits a copy.
 * The other side is lib/3dm-link/rhino/cadcraft_link.py, which pushes .3dm bytes through Studio's local server (127.0.0.1, token).
 *
 *   createLinkStore() → store
 *     store.take({ link, data, part, of, transfer }) → Uint8Array when the whole file is here, else null (more parts to come)
 *     store.merge(link, scene, { replace, deleted, sourceIds }) → { scene } | { needFull: 'why' }
 *     store.note(link, facts) · store.facts(link) · store.holds(link)
 *   linkTools({ app, store, open, apply, find }) → the definitions for host.control.tool()
 *     open(bytes) → a cc-3dm scene · emptyScene() when a push only deletes
 *     apply(scene, { link, name, fold }) → what the app did (the adapter: ModelCraft link-mc.js, PartCraft link-pc.js)
 *     find(link) → what the open document holds of this link, or null
 *
 * The app is never the owner of linked objects: each push replaces what the link brought last time. What the person put beside it stays.
 * A push of only the changed objects (replace: 'objects') is merged into the scene held in memory for this link; after a reload nothing is
 * held, so the answer is needFull and the script sends the whole model once. Pushes of one link within FOLD_MS fold into one undo step.
 */

export const FOLD_MS = 2000;
const MAX_PARTS = 512;
const MAX_TOTAL = 300 * 1024 * 1024;   // the same limit as a .3dm import
const LINK_ID = '^[A-Za-z0-9_.:{}-]{1,200}$';

export function decodeBase64(s) {
  const t = String(s).replace(/\s+/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(t) || t.length % 4 !== 0) throw new Error('data is not base64.');
  const bin = atob(t), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** A scene with nothing in it, for a push that only deletes. */
export function emptyScene() {
  return { units: null, layers: [], items: [], blocks: new Map(), report: { surfaces: { cached: 0, ours: {} }, curves: 0 }, notes: [] };
}

const idOf = (v) => String(v ?? '').toLowerCase();

export function createLinkStore({ now = () => Date.now() } = {}) {
  const transfers = new Map();   // link → { id, of, parts [], size }
  const held = new Map();        // link → { units, layers [], order [source id], items Map(source id → [item]), blocks Map }
  const facts = new Map();       // link → { at, objects, notes }

  const hold = (link, scene, sourceIds) => {
    const h = { units: scene.units, layers: scene.layers.slice(), items: new Map(), blocks: new Map(scene.blocks) };
    held.set(link, h);
    put(h, scene.items, sourceIds, new Set());
    return h;
  };
  // items of one push under their source ids; an id this push has not seen yet loses what it held before
  function put(h, items, sourceIds, seen) {
    let n = 0;
    for (const it of items) {
      const own = idOf(it.id);
      const sid = (own && sourceIds && sourceIds[own] !== undefined ? idOf(sourceIds[own]) : own) || '#' + (h.items.size + n++);
      if (!seen.has(sid)) { seen.add(sid); h.items.set(sid, []); }
      h.items.get(sid).push(it);
    }
  }
  const sceneOf = (h, from) => ({ units: h.units, layers: h.layers, items: [...h.items.values()].flat(), blocks: h.blocks, report: from.report, notes: from.notes });

  return {
    take({ link, data, part, of, transfer }) {
      const bytes = data === undefined ? new Uint8Array(0) : decodeBase64(data);
      if (of === undefined || of === 1) { transfers.delete(link); return bytes; }
      if (of > MAX_PARTS || !(part >= 1 && part <= of)) throw new Error('part must be from 1 to of (at most ' + MAX_PARTS + ').');
      if (!transfer) throw new Error('A file in several parts needs a transfer id.');
      let x = transfers.get(link);
      if (!x || x.id !== transfer || x.of !== of) { x = { id: transfer, of, parts: [], size: 0 }; transfers.set(link, x); }   // a newer file replaces one not finished
      if (!x.parts[part - 1]) x.size += bytes.length;
      if (x.size > MAX_TOTAL) { transfers.delete(link); throw new Error('The file is over the 300 MB limit.'); }
      x.parts[part - 1] = bytes;
      for (let i = 0; i < of; i++) if (!x.parts[i]) return null;
      transfers.delete(link);
      const out = new Uint8Array(x.size);
      let at = 0;
      for (const p of x.parts) { out.set(p, at); at += p.length; }
      return out;
    },
    /** How many parts of a transfer have come. */
    waiting(link) { const x = transfers.get(link); return x ? x.parts.filter(Boolean).length : 0; },

    merge(link, scene, { replace = 'all', deleted = [], sourceIds = null } = {}) {
      if (replace === 'all') {
        if (!scene.units) return { needFull: 'A whole model needs a file.' };
        return { scene: sceneOf(hold(link, scene, sourceIds), scene) };
      }
      const h = held.get(link);
      if (!h) return { needFull: 'This window holds no copy of the model yet (it was opened or reloaded since the last push).' };
      if (scene.units && h.units && scene.units.name !== h.units.name) return { needFull: 'The units changed.' };
      // layers are positions in each file: this push's items move to the held table, by name
      const at = new Map(h.layers.map((L, i) => [L.name, i]));
      const remap = scene.layers.map((L) => {
        if (at.has(L.name)) { h.layers[at.get(L.name)] = L; return at.get(L.name); }
        h.layers.push(L); at.set(L.name, h.layers.length - 1); return h.layers.length - 1;
      });
      const fix = (it) => ({ ...it, layer: it.layer >= 0 && it.layer < remap.length ? remap[it.layer] : it.layer });
      for (const id of deleted) h.items.delete(idOf(id));
      put(h, scene.items.map(fix), sourceIds, new Set());
      for (const [id, b] of scene.blocks) h.blocks.set(id, { ...b, items: b.items.map(fix) });
      return { scene: sceneOf(h, scene) };
    },
    holds: (link) => held.has(link),
    /** The last push: when, how many objects, what was left out; `fold` when it is close enough to the one before to share its undo step. */
    note(link, f) {
      const was = facts.get(link), at = now();
      facts.set(link, { at, ...f });
      return !!was && at - was.at < FOLD_MS;
    },
    facts: (link) => facts.get(link) || null,
  };
}

/** The tool definitions; the host registers them with host.control.tool(). */
export function linkTools({ app, store, open, apply, find }) {
  const linkProp = { type: 'string', pattern: LINK_ID, description: 'The other program\'s stable id for this document: the same id replaces what it brought last time.' };
  return [
    { name: 'link_push', group: 'edit', dryRun: true, title: 'Update a linked model',
      description: 'A live link from a program that saves .3dm files: put a .3dm file (base64) in ' + app + ' as a linked object, or replace what this link brought last time. replace "all" (default) sends the whole model; "objects" sends only changed objects plus the ids in `deleted`, and may answer needFull: then send the whole model. A file over about 3 MB goes in parts (part, of, transfer). Pushes of one link within two seconds share one undo step.',
      inputSchema: { type: 'object', additionalProperties: false, required: ['link'], properties: {
        link: linkProp,
        name: { type: 'string', minLength: 1, maxLength: 120, description: 'The name to show for it, usually the document\'s.' },
        data: { type: 'string', maxLength: 5000000, description: 'The .3dm file, or this part of it, as base64. May be left out when a push only deletes.' },
        replace: { type: 'string', enum: ['all', 'objects'], default: 'all', description: 'all: this file is the whole model. objects: only these objects changed.' },
        deleted: { type: 'array', maxItems: 100000, items: { type: 'string', maxLength: 200 }, description: 'With replace "objects": source ids of objects gone from the model.' },
        source_ids: { type: 'object', additionalProperties: { type: 'string', maxLength: 200 }, description: 'Object id in this file → the id it has in the other program, when they differ. Send on the last part.' },
        part: { type: 'integer', minimum: 1, maximum: MAX_PARTS, description: 'This part\'s number, from 1, for a file in several parts.' },
        of: { type: 'integer', minimum: 1, maximum: MAX_PARTS, description: 'How many parts the file has.' },
        transfer: { type: 'string', maxLength: 64, description: 'An id shared by the parts of one file.' },
      } },
      run: async (a, ctx) => {
        if (ctx && ctx.preview) return { link: a.link, exists: !!find(a.link), wouldReplace: a.replace || 'all', parts: a.of || 1 };
        const bytes = store.take(a);
        if (!bytes) return { applied: false, received: store.waiting(a.link), of: a.of };
        const scene = bytes.length ? open(bytes) : emptyScene();
        const m = store.merge(a.link, scene, { replace: a.replace || 'all', deleted: a.deleted || [], sourceIds: a.source_ids ? Object.fromEntries(Object.entries(a.source_ids).map(([k, v]) => [idOf(k), v])) : null });
        if (m.needFull) return { applied: false, needFull: true, reason: m.needFull };
        const name = (a.name || a.link).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 120) || a.link;
        const fold = store.note(a.link, { objects: m.scene.items.length });
        return { link: a.link, ...(await apply(m.scene, { link: a.link, name, fold })) };
      } },
    { name: 'link_status', group: 'read', untrusted: true, title: 'Status of a linked model',
      description: 'Whether what this link brought is still in ' + app + ', when it was last pushed, how many objects, and whether a push of only the changed objects would be taken (holdsCopy).',
      inputSchema: { type: 'object', additionalProperties: false, required: ['link'], properties: { link: linkProp } },
      run: async (a) => {
        const f = store.facts(a.link);
        return { link: a.link, app, found: find(a.link), holdsCopy: store.holds(a.link), lastPush: f ? new Date(f.at).toISOString() : null, objects: f ? f.objects : null };
      } },
  ];
}
