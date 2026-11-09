/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ctx.js — the one shared object of the point cloud add-on (0.9 PC.2 / PC.10): the open cloud, the surface built from it, a tiny
 * event bus, and the helpers every part of the UI needs (words for engine error codes, the status line, the open project).
 * Events: 'cloud' (a cloud was opened or closed), 'edited' (the edit log changed: redraw), 'surface' (a ground surface / residuals exist),
 * 'clouds' (the list changed).
 */
export function createCtx(api, PC) {
  const bus = new Map();
  const ctx = {
    api, PC, t: api.t, store: null, cloud: null, info: null, surface: null, resid: null, surfaceReport: null, breaklines: [], addedNums: new Set(),
    classTolerance: 0.15, view: null, statusEl: null,
    on(ev, fn) { if (!bus.has(ev)) bus.set(ev, new Set()); bus.get(ev).add(fn); return () => bus.get(ev).delete(fn); },
    emit(ev, ...a) { for (const fn of [...(bus.get(ev) || [])]) { try { fn(...a); } catch (e) { api.log('listener failed', ev, e); } } },   // i18n-ignore: developer log
    /** The status line of the add-on's panel (and the app's own status bar). */
    status(msg) {
      if (ctx.statusEl) ctx.statusEl.textContent = msg || '';
      const bar = document.querySelector('[data-status]');
      if (bar && msg) bar.textContent = msg;
    },
    project() { return window.civilcraft && window.civilcraft.project; },
    app() { return window.civilcraft || null; },
    getStore() { return ctx.store || (ctx.store = PC.openStore('opfs', { name: 'cadcraft-clouds' })); },
    /** Where the tiles live: this browser's own storage (default) or a folder the person picked (PC.10; the same engine code on a directory handle). */
    useFolder(handle) { ctx.store = handle ? PC.openStore('folder', { handle }) : PC.openStore('opfs', { name: 'cadcraft-clouds' }); ctx.folderName = handle ? handle.name : ''; },
    folderName: '',
    /** Words for an engine error: its code is a key, never a sentence. */
    err(e) {
      const code = e && e.code ? String(e.code) : '';
      const k = 'pc.err.' + code;
      const w = code ? ctx.t(k) : k;
      return w !== k ? w : ctx.t('pc.err.other', { why: code || String((e && e.message) || e) });
    },
    isAbort(e) { return !!e && (e.code === 'aborted' || e.name === 'AbortError'); },
    unitWord() { return ctx.t('pc.unit.m'); },
  };
  return ctx;
}

export const fmtN = (n) => Number(n).toLocaleString('en-US');
export const fmt = (n, d = 2) => (Number.isFinite(n) ? Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: d }) : '–');
export function bytesText(n) {
  if (n < 1048576) return Math.round(n / 1024) + ' KB';
  if (n < 1073741824) return (n / 1048576).toFixed(1) + ' MB';
  return (n / 1073741824).toFixed(2) + ' GB';
}

/** The picked folder's handle is kept in this browser (IndexedDB takes handles) so the choice survives a restart; the browser asks again for permission. */
const DB = 'cadcraft-pointcloud-prefs';
function prefs(mode, f) {
  return new Promise((res, rej) => {
    if (typeof indexedDB === 'undefined') return res(null);
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onerror = () => rej(r.error);
    r.onsuccess = () => { const t = r.result.transaction('kv', mode), q = f(t.objectStore('kv')); let out = null; if (q) q.onsuccess = () => { out = q.result; }; t.oncomplete = () => { r.result.close(); res(out); }; t.onerror = () => rej(t.error); };
  });
}
export const saveFolderHandle = (h) => prefs('readwrite', (s) => (h ? s.put(h, 'folder') : s.delete('folder'))).catch(() => null);
export const loadFolderHandle = () => prefs('readonly', (s) => s.get('folder')).catch(() => null);
