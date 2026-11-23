/* SPDX-License-Identifier: Apache-2.0 */
/**
 * keys-ui.js: civilcraft.js's 4 bindings for this topic, moved out of init() unchanged (0.11 PERF.71 round two, perf-finish-11 r2 civil-detail; no behaviour change).
 * mountKeys(ctx) is called once by init(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables init() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { t } from './i18n.js';
import { nextMode } from './lasso-core.js';

export function mountKeys(ctx) {
  const { ST, ui, view, toggleFlArc, settingsDlg, refresh, showProfile, setPviAdd, setTool, command, closeMenus, selectAll, copyPoints, pasteFromButton, paste, duplicatePoints, commitPaste, finishDraft, endPick, say, root } = ctx;

  // ------------------------------------------------------------------ keyboard
  const typing = (t) => t && (t.matches?.('select, textarea, input:not([type=checkbox]):not([type=radio]):not([type=button])') || t.isContentEditable);
  window.addEventListener('keydown', (e) => {
    if ((ST.drag?.kind === 'box' || ST.drag?.kind === 'lasso') && (e.key === ' ' || e.key === 'Escape')) {   // 0.4 W2.7
      e.preventDefault();
      if (e.key === 'Escape') { ST.drag = null; view.invalidate(); say(t('cv.cancelled')); return; }
      if (ST.drag.kind === 'box') { ST.drag.kind = 'lasso'; ST.drag.mode = 'window'; } else ST.drag.mode = nextMode(ST.drag.mode || 'window');
      ST.drag.spaced = true; ST.drag.said = ST.drag.mode; say(t('cv.lasso.' + ST.drag.mode)); view.invalidate();
      return;
    }
    if (e.key === ' ' && !typing(e.target)) ST.spaceDown = true;
    if (root.querySelector('dialog[open]:not([data-gisa]):not([data-gist])')) return;   // the GIS analysis panel is not modal (0.9 SU.1080): keys still work beside it
    const k = e.key, ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && !e.altKey && !typing(e.target) && k.toLowerCase() === 'v') { armClip('paste', e.shiftKey); return; }   // the paste event does the rest
    if (ctrl && !e.shiftKey && !e.altKey) {
      const m = { z: 'undo', y: 'redo', s: 'save', o: 'open', p: 'pdf' }[k.toLowerCase()];
      if (m && !(typing(e.target) && (k === 'z' || k === 'y'))) { e.preventDefault(); command(m); return; }
      if (typing(e.target)) return;
      const lk = k.toLowerCase();
      if (lk === 'a') { e.preventDefault(); selectAll(); }
      else if (lk === 'd') { e.preventDefault(); duplicatePoints(); }
      else if ((lk === 'c' || lk === 'x') && !hasTextSelection()) armClip(lk === 'c' ? 'copy' : 'cut');   // the copy/cut event does the rest
      return;
    }
    if (typing(e.target) || e.altKey) return;
    if (k === 'Escape') {
      if (ST.pickJob) { endPick(); say(t('cv.pick.cancelled')); return; }   // 0.9 WB.15
      if (ST.drag?.kind === 'point') { ST.drag.cancelled = true; view.invalidate(); say(t('pt.drag.cancel')); return; }   // 0.4 V2
      if (root.querySelector('details.cv-menu[open]')) { closeMenus(); return; }
      if (ST.tool === 'paste') { setTool('select'); say(t('cv.paste.cancelled')); return; }
      if (ST.draft.length) { ST.draft = []; ST.flMid = null; view.invalidate(); say(t('cv.cancelled')); } else { setTool('select'); if (ST.sel || ST.picked.size || ST.selPvi >= 0) { ST.sel = null; ST.selPvi = -1; ST.picked.clear(); refresh(); } }
      return;
    }
    if (k === 'Enter' && ST.tool === 'paste' && ST.pasteJob) { e.preventDefault(); const j = ST.pasteJob; commitPaste(j.pts, 0, 0, j.label === 'Paste' ? 'Paste in place' : j.label, j.from, j.note); return; }   // i18n-ignore: internal labels
    if (k === 'Enter' && ST.draft.length) { e.preventDefault(); finishDraft(); return; }
    if (k === 'Backspace' && ST.flMid) { e.preventDefault(); ST.flMid = null; view.invalidate(); return; }   // 0.6 WL.24: the curve point first
    if (k === 'Backspace' && ST.draft.length) { e.preventDefault(); ST.draft.pop(); if (ST.draft.length) delete ST.draft[ST.draft.length - 1].b; view.invalidate(); return; }
    if (k.toLowerCase() === 'c' && ST.tool === 'feature' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); toggleFlArc(); return; }   // 0.6 WL.24
    if (k === 'Delete' || (k === 'Backspace' && e.target === ui.prof)) { e.preventDefault(); command('delete'); return; }
    const keyCmd = { m: 'measure', v: 'select', a: 'alignment', g: 'pad', p: 'pipe', b: 'breakline', o: 'boundary', r: 'profile', f: 'fit', d: 'view3d', x: 'sections', l: 'feature', e: 'grades' }[k.toLowerCase()];
    if (keyCmd && !e.shiftKey) { e.preventDefault(); command(keyCmd); return; }
    if (k.toLowerCase() === 'i') { if (ui.profPanel.hidden) showProfile(true); setPviAdd(ui.pviAdd.getAttribute('aria-pressed') !== 'true'); return; }
    if (e.target === ui.over) {
      const step = 60;
      const pan = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[k];
      if (pan) { e.preventDefault(); view.panBy(...pan); return; }
      if (k === '+' || k === '=') { e.preventDefault(); view.zoomAt(view.w / 2, view.h / 2, 1.25); return; }
      if (k === '-' || k === '_') { e.preventDefault(); view.zoomAt(view.w / 2, view.h / 2, 0.8); return; }
    }
  });
  window.addEventListener('keyup', (e) => { if (e.key === ' ') ST.spaceDown = false; });

  // Ctrl+C / Ctrl+X / Ctrl+V reach us as the browser's copy, cut and paste events, which can put text on (and read
  // text from) the system clipboard without asking. The key arms the operation (Ctrl+Shift+V = in place); if no event
  // follows, it runs as the toolbar button does (the async clipboard API, else CivilCraft's own copy).
  ST.pendingClip = null;
  const hasTextSelection = () => { const t = window.getSelection?.(); return !!t && !t.isCollapsed && t.toString().trim() !== ''; };
  function armClip(op, inPlace = false) {
    clearTimeout(ST.pendingClip?.timer);
    const job = { op, inPlace };
    job.timer = setTimeout(() => { if (ST.pendingClip !== job) return; ST.pendingClip = null; if (op === 'paste') pasteFromButton(inPlace); else copyPoints(op === 'cut'); }, 150);
    ST.pendingClip = job;
  }
  function clipEvent(e, op) {
    const p = ST.pendingClip;
    if (p) { clearTimeout(p.timer); ST.pendingClip = null; }
    if (typing(e.target) || root.querySelector('dialog[open]:not([data-gisa]):not([data-gist])') || settingsDlg?.open || document.querySelector('[data-help-panel]')?.contains(e.target)) return;
    if (op === 'paste') {
      e.preventDefault();
      paste(p?.op === 'paste' ? p.inPlace : false, e.clipboardData ? e.clipboardData.getData('text/plain') : null);
      return;
    }
    if (hasTextSelection()) return;                // text selected on the page: the browser copies it
    if (!p && !ST.picked.size) return;                // the browser's own Copy menu with no points selected
    const csv = copyPoints(op === 'cut', { quiet: true });
    if (csv && e.clipboardData) { e.clipboardData.setData('text/plain', csv); e.preventDefault(); }
    else if (csv) navigator.clipboard?.writeText?.(csv).catch(() => {});
  }
  document.addEventListener('copy', (e) => clipEvent(e, 'copy'));
  document.addEventListener('cut', (e) => clipEvent(e, 'cut'));
  document.addEventListener('paste', (e) => clipEvent(e, 'paste'));
}
