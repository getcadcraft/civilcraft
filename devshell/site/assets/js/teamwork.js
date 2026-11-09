/* SPDX-License-Identifier: Apache-2.0 */
/**
 * teamwork.js — comments and issues on a cloud file, the DOM-free core (0.8 LC.2, session oltl2-b_PART_3; map docs/apps/shell-modules.md § Team comments).
 * The page side is app-teamwork.js. Talks to the site's /api/v1/team/* (comments, notifications) with whatever `request` it is given — in Studio that is
 * cadcraftDesktop.cloud.request (the sign-in stays in the shell, the page never sees a token); a test passes a stand-in.
 *
 *   const tw = createTeamwork({ request, drawing })      request({method, path, body}) → Promise<{status, json()}> ; drawing = the cloud file's uuid or ''
 *   await tw.load()            → { ok, code, message }   fills tw.threads (comments with replies), tw.open, tw.resolved
 *   await tw.add({ body, kind: 'comment'|'issue', anchor?, parent?, version?, mentions? })
 *   await tw.resolve(uuid) · tw.reopen(uuid) · tw.edit(uuid, body) · tw.remove(uuid)
 *   await tw.notifications({ unread: true }) → { ok, unread, items }     await tw.markRead(ids | 'all')
 *   tw.on(fn) → off            fn(why) after every change
 * Results are { ok, code, message, … }; `code` is the server's (teamwork_closed, not_found, forbidden, invalid, throttled …) or 'offline' / 'no_file'.
 * Nothing here decides who may see a file: the server does (CloudAccess), and a closed switch answers teamwork_closed.
 */
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const MAX_BODY = 4000;
export const ANCHOR_KINDS = ['point', 'element', 'view', 'page', 'region', 'range'];

/** The cloud file this page was opened from: ?cloud=<uuid>[&cv=<version>] (Studio's hub puts it there). */
export function cloudRefFromSearch(search) {
  const q = new URLSearchParams(search || '');
  const id = q.get('cloud') || '';
  return UUID_RE.test(id) ? { drawing: id.toLowerCase(), version: Number.parseInt(q.get('cv') || '', 10) || null } : null;
}

const qs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');

/** A small anchor the server accepts (kind from ANCHOR_KINDS; ref text, xyz three finite numbers, page a whole number). null = nothing usable. */
export function cleanAnchor(a) {
  if (!a || typeof a !== 'object' || !ANCHOR_KINDS.includes(a.kind)) return null;
  const out = { kind: a.kind };
  if (typeof a.ref === 'string' && a.ref) out.ref = a.ref.slice(0, 200);
  if (Array.isArray(a.xyz) && a.xyz.length === 3 && a.xyz.every((n) => Number.isFinite(n))) out.xyz = a.xyz.slice();
  if (Number.isInteger(a.page) && a.page >= 0) out.page = a.page;
  return out;
}

/** "3 open · 1 resolved" style counts for the panel summary. */
export function counts(comments) {
  let open = 0, resolved = 0;
  for (const c of comments || []) { if (c.state === 'resolved') resolved++; else if (c.state !== 'removed') open++; }
  return { open, resolved };
}

export function createTeamwork({ request, drawing = '' } = {}) {
  const subs = new Set();
  let send = request;
  const tw = {
    drawing: UUID_RE.test(drawing) ? drawing.toLowerCase() : '', threads: [], open: 0, resolved: 0, loaded: false, lastError: null,
    on(fn) { subs.add(fn); return () => subs.delete(fn); },
    setDrawing(id) { tw.drawing = UUID_RE.test(id || '') ? id.toLowerCase() : ''; ctx = null; tw.threads = []; tw.open = tw.resolved = 0; tw.loaded = false; emit('drawing'); },
    available() { return typeof send === 'function'; },
    setRequest(fn) { send = fn; emit('request'); },
  };
  const emit = (why) => { for (const f of [...subs]) { try { f(why); } catch (e) { /* a listener's own trouble */ } } };

  async function call(method, path, body) {
    if (typeof send !== 'function') return { ok: false, code: 'offline', message: 'Not signed in here.' };
    let res;
    try { res = await send({ method, path, body: body === undefined ? undefined : new TextEncoder().encode(JSON.stringify(body)), contentType: body === undefined ? undefined : 'application/json' }); }
    catch (e) { return { ok: false, code: e && e.code === 'not_allowed' ? 'not_allowed' : 'offline', message: String((e && e.message) || e) }; }
    let json = null;
    try { json = typeof res.json === 'function' ? res.json() : res.json; } catch (e) { json = null; }
    if (res.status >= 200 && res.status < 300) return { ok: true, status: res.status, data: (json && json.data) || {} };
    return { ok: false, status: res.status, code: String((json && (json.code || json.error)) || (res.status === 429 ? 'throttled' : res.status >= 500 ? 'server' : 'error')),
      message: (json && json.message) || '', errors: (json && json.errors) || null };
  }
  const fail = (r) => { tw.lastError = r.code; return { ok: false, code: r.code, message: r.message, errors: r.errors || null }; };
  const needFile = () => (tw.drawing ? null : { ok: false, code: 'no_file', message: 'This file is not in the cloud.' });

  tw.load = async (state = '') => {
    const n = needFile(); if (n) return n;
    const r = await call('GET', '/api/v1/team/comments?' + qs({ drawing: tw.drawing, state }));
    if (!r.ok) return fail(r);
    tw.threads = Array.isArray(r.data.comments) ? r.data.comments : [];
    tw.open = Number(r.data.open) || 0; tw.resolved = Number(r.data.resolved) || 0; tw.loaded = true; tw.lastError = null;
    emit('load');
    return { ok: true };
  };
  tw.add = async ({ body, kind = 'comment', anchor = null, parent = null, version = null, mentions = [] } = {}) => {
    const n = needFile(); if (n) return n;
    const text = String(body || '').trim();
    if (!text) return { ok: false, code: 'invalid', message: 'Write something first.' };
    if (text.length > MAX_BODY) return { ok: false, code: 'invalid', message: 'That is too long.' };
    const a = cleanAnchor(anchor);
    if (kind === 'issue' && !a) return { ok: false, code: 'invalid', message: 'An issue needs a place on the file.' };
    const payload = { drawing: tw.drawing, body: text, kind: parent ? 'comment' : kind };
    if (a && !parent) payload.anchor = a;
    if (parent) payload.parent = parent;
    if (version) payload.version = version;
    if (mentions.length) payload.mentions = mentions.slice(0, 20);
    const r = await call('POST', '/api/v1/team/comments', payload);
    if (!r.ok) return fail(r);
    await tw.load();
    return { ok: true, comment: r.data.comment, notified: r.data.notified };
  };
  const act = (action) => async (comment, extra = {}) => {
    const r = await call('POST', '/api/v1/team/comments', { action, comment, ...extra });
    if (!r.ok) return fail(r);
    await tw.load();
    return { ok: true };
  };
  tw.resolve = act('resolve'); tw.reopen = act('reopen'); tw.remove = act('remove');
  tw.edit = (comment, body) => act('edit')(comment, { body: String(body || '').trim() });
  // ---- BCF (0.8 LC.2): the file's issues as a .bcfzip, out and in (the site's /api/v1/team/bcf; BcfIssues)
  tw.exportBcf = async () => {
    const n = needFile(); if (n) return n;
    if (typeof send !== 'function') return { ok: false, code: 'offline', message: 'Not signed in here.' };
    let res;
    try { res = await send({ method: 'GET', path: '/api/v1/team/bcf?' + qs({ drawing: tw.drawing }) }); }
    catch (e) { return { ok: false, code: e && e.code === 'not_allowed' ? 'not_allowed' : 'offline', message: String((e && e.message) || e) }; }
    if (res.status >= 200 && res.status < 300) {
      const bytes = res.body instanceof Uint8Array ? res.body : typeof res.bytes === 'function' ? new Uint8Array(await res.bytes()) : null;
      return bytes && bytes.length ? { ok: true, bytes, name: 'issues.bcfzip' } : { ok: false, code: 'error', message: '' };
    }
    let json = null; try { json = typeof res.json === 'function' ? res.json() : null; } catch (e) { json = null; }
    return fail({ code: String((json && (json.code || json.error)) || (res.status >= 500 ? 'server' : 'error')), message: (json && json.message) || '' });
  };
  tw.importBcf = async (bytes) => {
    const n = needFile(); if (n) return n;
    if (!(bytes instanceof Uint8Array) || !bytes.length) return { ok: false, code: 'invalid', message: 'Choose a BCF file.' };
    if (bytes.length > 10 * 1024 * 1024) return { ok: false, code: 'invalid', message: 'That file is over 10 MB.' };
    if (typeof send !== 'function') return { ok: false, code: 'offline', message: 'Not signed in here.' };
    let res;
    try { res = await send({ method: 'POST', path: '/api/v1/team/bcf?' + qs({ drawing: tw.drawing }), body: bytes, contentType: 'application/zip' }); }
    catch (e) { return { ok: false, code: e && e.code === 'not_allowed' ? 'not_allowed' : 'offline', message: String((e && e.message) || e) }; }
    let json = null; try { json = typeof res.json === 'function' ? res.json() : res.json; } catch (e) { json = null; }
    if (res.status >= 200 && res.status < 300) { const d = (json && json.data) || {}; await tw.load(); return { ok: true, imported: d.imported | 0, skipped: d.skipped | 0, comments: d.comments | 0, problems: d.problems || [] }; }
    return fail({ code: String((json && (json.code || json.error)) || (res.status >= 500 ? 'server' : 'error')), message: (json && json.message) || '' });
  };
  // ---- the project's team model (BimCraft "Several models"): which files sit together, with discipline and placement
  tw.projectModel = async (project) => {
    if (!UUID_RE.test(project || '')) return { ok: false, code: 'invalid', message: 'No project.' };
    const r = await call('GET', '/api/v1/team/model?' + qs({ project }));
    return r.ok ? { ok: true, models: r.data.models || [], hidden: Number(r.data.hidden) || 0, project: r.data.project || null } : fail(r);
  };
  // the project this file sits in (GET /api/v1/sync/versions), then its model: add / change / remove THIS file in it
  let ctx = null;
  tw.context = async () => {
    const n = needFile(); if (n) return n;
    if (ctx && ctx.drawing === tw.drawing) return { ok: true, ...ctx };
    const r = await call('GET', '/api/v1/sync/versions?' + qs({ drawing: tw.drawing }));
    if (!r.ok) return fail(r);
    const d = r.data.drawing || {};
    if (!UUID_RE.test(String(d.project || ''))) return { ok: false, code: 'not_found', message: 'This file has no project.' };
    ctx = { drawing: tw.drawing, project: String(d.project), projectName: String(d.project_name || ''), canEdit: d.can_edit === true };
    return { ok: true, ...ctx };
  };
  tw.model = async () => { const c = await tw.context(); return c.ok ? { ...(await tw.projectModel(c.project)), canEdit: c.canEdit, drawing: tw.drawing } : c; };
  tw.modelSet = async ({ discipline = '', offset = undefined, visible = undefined } = {}) => {
    const c = await tw.context(); if (!c.ok) return c;
    const body = { project: c.project, drawing: tw.drawing, discipline };
    if (offset) body.offset = offset; if (visible !== undefined) body.visible = !!visible;
    const r = await call('POST', '/api/v1/team/model', body);
    return r.ok ? { ok: true } : fail(r);
  };
  tw.modelRemove = async () => {
    const c = await tw.context(); if (!c.ok) return c;
    const r = await call('POST', '/api/v1/team/model', { action: 'remove', project: c.project, drawing: tw.drawing });
    return r.ok ? { ok: true } : fail(r);
  };
  tw.notifications = async ({ unread = false, limit = 50 } = {}) => {
    const r = await call('GET', '/api/v1/team/notifications?' + qs({ unread: unread ? 1 : '', limit }));
    return r.ok ? { ok: true, unread: Number(r.data.unread) || 0, items: r.data.items || [] } : fail(r);
  };
  tw.markRead = async (ids) => {
    const r = await call('POST', '/api/v1/team/notifications', ids === 'all' ? { all: true } : { ids });
    return r.ok ? { ok: true, marked: Number(r.data.marked) || 0 } : fail(r);
  };
  return tw;
}

/**
 * Hand the signed-in transport to the Documents panel (0.8 SU.1058): the panel reads window.ccVaultCloud = { request(method, url, {body, headers}) → { status, bytes() }, available() }
 * (lib/vault/vault-cloud.js). `cloud` is Studio's cadcraftDesktop.cloud ({ request({method, path, body, contentType}) → { status, body: Uint8Array } }); the sign-in stays in the shell.
 * null when there is no cloud (a plain browser tab): the panel then keeps its cloud button hidden.
 */
export function vaultCloudFrom(cloud) {
  if (!cloud || typeof cloud.request !== 'function') return null;
  return {
    available: () => typeof cloud.request === 'function',
    async request(method, url, o = {}) {
      const headers = o.headers || {};
      const res = await cloud.request({ method, path: url, body: o.body, contentType: headers['Content-Type'] || headers['content-type'] });
      return { status: res.status, headers: res.headers, bytes: async () => (res.body instanceof Uint8Array ? res.body : typeof res.bytes === 'function' ? res.bytes() : new Uint8Array(0)) };
    },
  };
}
