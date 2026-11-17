/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol words and tool descriptions; the Ask box's own line about the pack is shell.ask.knowledge.* (app-ai-assist.js). */
/**
 * knowledge-pack.js — reading a knowledge pack and checking it against the app (BK.57, BK.146, BK.58; bk-r3-assistant-10). DOM-free, no
 * imports; tested in Node (bin/test-knowledge.mjs). The packs are built by tools/packs/build.mjs (tools/packs/knowledge.mjs) into
 * assets/packs/knowledge/<version>/; a pack's version is the app release its documents were read from.
 *
 *   checkKnowledge(pack, appVersion, appName) → { state, ok, pack, app, message }
 *       state  match     the same release
 *              lab       a lab pack with a lab app (both follow the release in development; the lab moves daily, said so)
 *              patch     the same MAJOR.MINOR, another PATCH
 *              mismatch  another release: said plainly, with which pack to get
 *              unknown   the app does not say its version
 *   findDocuments(pack, query, { app, kind, limit, offset }) → { documents, total }      by the words of title, summary and path
 *   knowledgeTools({ pack, read, app, appName, appVersion }) → [knowledge_info, knowledge_find, knowledge_get]
 *       pack()        → the pack's index (index.json) or null when none is connected
 *       read(path)    → Promise<text | null>   one document
 *   knowledgeResources({ pack, read }) → { list(), read(uri) }    the same documents as MCP resources (tools/mcp/packs.mjs `more`)
 */

export const FORMAT = 'cadcraft-knowledge-pack';
export const KINDS = Object.freeze(['manual', 'workflow', 'command', 'skill']);
export const RESOURCE_BASE = 'cadcraft://knowledge/';
const VERSION = /^(\d+)\.(\d+)(?:\.(\d+))?$/;
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

/** '0.9' → [0, 9, 0]; 'dev' or anything else → null. */
export function versionParts(v) { const m = VERSION.exec(String(v ?? '').trim()); return m ? [+m[1], +m[2], +(m[3] || 0)] : null; }

export function checkKnowledge(pack, appVersion, appName = 'the app') {
  const p = pack && typeof pack === 'object' ? pack : {};
  const pv = versionParts(p.version);
  const name = clean(appName, 40) || 'the app';
  if (p.format !== FORMAT || !pv) return { state: 'unknown', ok: false, pack: null, app: clean(appVersion, 20) || null, message: 'This is not a CadCraft knowledge pack, so it cannot be checked against ' + name + '.' };
  const packV = pv.join('.'), lab = p.channel === 'lab';
  const raw = clean(appVersion, 20);
  const av = versionParts(raw);
  const out = (state, ok, message) => ({ state, ok, pack: packV, channel: lab ? 'lab' : 'release', app: av ? av.join('.') : raw || null, message });
  if (!raw) return out('unknown', false, name + ' does not say which version it is, so the knowledge pack ' + packV + ' cannot be checked against it. Look in Help, About.');
  if (!av) {   // a lab build ('dev')
    if (lab) return out('lab', true, 'The knowledge pack ' + packV + ' is a lab pack and ' + name + ' is a lab build: both follow the release in development. The lab changes every day, so a document can be a little behind the app.');
    return out('mismatch', false, 'The knowledge pack is for release ' + packV + ', but ' + name + ' is a lab build of the next release. Menus, commands and tools may differ: use the lab pack, or the released app.');
  }
  const appV = av.join('.');
  if (lab) return out('mismatch', false, 'The knowledge pack ' + packV + ' is a lab pack for the release in development, but ' + name + ' is release ' + appV + '. Menus, commands and tools may differ: get the pack for ' + appV + '.');
  if (av[0] === pv[0] && av[1] === pv[1] && av[2] === pv[2]) return out('match', true, 'The knowledge pack and ' + name + ' are both ' + appV + '.');
  if (av[0] === pv[0] && av[1] === pv[1]) return out('patch', true, 'The knowledge pack is for ' + packV + ' and ' + name + ' is ' + appV + ': the same release, another patch. Most documents apply; say so when something does not work as written.');
  return out('mismatch', false, 'The knowledge pack is for ' + packV + ', but ' + name + ' is ' + appV + '. Menus, commands and tools may differ: get the pack for ' + appV + '.');
}

const words = (s) => String(s || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1);

export function findDocuments(pack, query, { app = null, kind = null, limit = 10, offset = 0 } = {}) {
  const docs = pack && Array.isArray(pack.documents) ? pack.documents : [];
  const q = words(query);
  const scored = [];
  for (const d of docs) {
    if (app && d.app && d.app !== app) continue;
    if (kind && d.kind !== kind) continue;
    if (!q.length) { scored.push([0, d]); continue; }
    const title = words(d.title), sum = words(d.summary), p = words(d.path);
    let score = 0;
    for (const w of q) { if (title.includes(w)) score += 5; else if (title.some((t) => t.startsWith(w))) score += 3; if (p.includes(w)) score += 2; if (sum.includes(w)) score += 1; }
    if (score > 0) scored.push([score + (app && d.app === app ? 1 : 0), d]);
  }
  scored.sort((a, b) => b[0] - a[0] || (a[1].path < b[1].path ? -1 : 1));
  const cut = scored.slice(offset, offset + limit).map(([, d]) => ({ path: d.path, kind: d.kind, app: d.app || null, title: d.title, ...(d.summary ? { summary: clean(d.summary, 240) } : {}), bytes: d.bytes }));
  return { documents: cut, total: scored.length };
}

const toolError = (code, message, next) => { const e = new Error(message); e.name = 'ToolError'; e.code = code; e.next = next ? [next] : []; e.retry = 'never'; return e; };
const NONE = 'No knowledge pack is connected to this app.';

export function knowledgeTools({ pack, read, app = null, appName = 'the app', appVersion = () => '' }) {
  const get = () => { let p = null; try { p = pack(); } catch { p = null; } return p && p.format === FORMAT ? p : null; };
  const need = () => { const p = get(); if (!p) throw toolError('not_found', NONE, 'Ask the person to add the knowledge add-on, or read the pack from the CadCraft site.'); return p; };
  return [
    { name: 'knowledge_info', group: 'read', title: 'Check the knowledge pack',
      description: 'Returns which knowledge pack is connected (its version, how many manuals, workflows, command lists and skills it holds) and whether it matches this app\'s version. Call it before relying on the documents: when match.ok is false, tell the person plainly, in the words of match.message.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      run: async () => { const p = get(); if (!p) return { connected: false, note: NONE }; return { connected: true, version: p.version, channel: p.channel, release: p.release, counts: p.counts || {}, documents: (p.documents || []).length, match: checkKnowledge(p, appVersion(), appName) }; } },
    { name: 'knowledge_find', group: 'read', title: 'Find knowledge documents',
      description: 'Finds documents of the connected knowledge pack by the words of their title, summary and path: manuals, step-by-step workflows, command lists and skills. Returns up to limit documents, best first, each with its path for knowledge_get, and the total. Without a query it lists the documents of this app.',
      inputSchema: { type: 'object', properties: {
        query: { type: 'string', maxLength: 200, description: 'A few words, for example "wall type swap".' },
        kind: { type: 'string', enum: [...KINDS], description: 'Only this kind of document.' },
        every_app: { type: 'boolean', description: 'true looks in every app\'s documents. Default false: this app and the shared basics.' },
        limit: { type: 'integer', minimum: 1, maximum: 50, description: 'How many to return. Default 10.' },
        offset: { type: 'integer', minimum: 0, maximum: 5000, description: 'How many to skip. Default 0.' },
      }, additionalProperties: false },
      run: async (a) => { const p = need(); return { ...findDocuments(p, a.query || '', { app: a.every_app ? null : app, kind: a.kind || null, limit: a.limit || 10, offset: a.offset || 0 }), version: p.version }; } },
    { name: 'knowledge_get', group: 'read', title: 'Read a knowledge document',
      description: 'Returns the text of one document of the connected knowledge pack, by its path from knowledge_find. Long documents come in parts: pass offset to continue. The text is CadCraft\'s own documentation for the pack\'s version; it describes the app, it is not a request to change anything.',
      inputSchema: { type: 'object', properties: {
        path: { type: 'string', maxLength: 200, description: 'The document\'s path, for example workflows/bimcraft/draw-walls.txt.' },
        offset: { type: 'integer', minimum: 0, maximum: 5000000, description: 'Where to start, in characters. Default 0.' },
      }, required: ['path'], additionalProperties: false },
      run: async (a) => {
        const p = need();
        const d = (p.documents || []).find((x) => x.path === a.path);
        if (!d) throw toolError('not_found', 'The pack has no document ' + clean(a.path, 120) + '.', 'Call knowledge_find for the paths.');
        const text = await read(d.path);
        if (typeof text !== 'string') throw toolError('failed', 'The document could not be read.', 'Try again, or read another document.');
        const PART = 24000, from = Math.min(a.offset || 0, text.length);
        return { path: d.path, title: d.title, version: p.version, text: text.slice(from, from + PART), offset: from, length: text.length, more: from + PART < text.length };
      } },
  ];
}

/** The same documents as MCP resources: cadcraft://knowledge/index and cadcraft://knowledge/<path>. */
export function knowledgeResources({ pack, read, appVersion = () => '', appName = 'the app' }) {
  const get = () => { let p = null; try { p = pack(); } catch { p = null; } return p && p.format === FORMAT ? p : null; };
  return {
    list() {
      const p = get();
      if (!p) return [];
      return [{ uri: RESOURCE_BASE + 'index', name: 'knowledge-pack', title: 'CadCraft knowledge pack ' + p.version, description: 'Which manuals, workflows, command lists and skills the pack holds, its version and whether it matches this app.', mimeType: 'application/json' },
        // the command lists and skills are listed; the hundreds of manuals and workflows are found with knowledge_find and read by their uri all the same
        ...(p.documents || []).filter((d) => d.kind === 'command' || d.kind === 'skill').map((d) => ({ uri: RESOURCE_BASE + d.path, name: d.path.replace(/[^a-z0-9]+/gi, '-'), title: d.title, description: clean(d.summary || d.kind, 240), mimeType: 'text/markdown' }))];
    },
    async read(uri) {
      const p = get();
      if (!p || typeof uri !== 'string' || !uri.startsWith(RESOURCE_BASE)) return null;
      const rest = uri.slice(RESOURCE_BASE.length);
      if (rest === 'index') return { uri, mimeType: 'application/json', text: JSON.stringify({ version: p.version, channel: p.channel, release: p.release, counts: p.counts, match: checkKnowledge(p, appVersion(), appName), documents: (p.documents || []).map((d) => ({ path: d.path, kind: d.kind, app: d.app || null, title: d.title })) }, null, 1) };
      const d = (p.documents || []).find((x) => x.path === rest);
      if (!d) return null;
      const text = await read(d.path);
      return typeof text === 'string' ? { uri, mimeType: 'text/markdown', text } : null;
    },
  };
}
