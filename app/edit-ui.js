/* SPDX-License-Identifier: Apache-2.0 */
/**
 * edit-ui.js: civilcraft.js's 15 bindings for this topic, moved out of init() unchanged (0.11 PERF.71 round two, perf-finish-11 r2 civil-detail; no behaviour change).
 * mountEdit(ctx) is called once by init(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables init() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { t } from './i18n.js';
import { num } from './ui-util.js';
import { readClip, makeClip, choosePaste, centre, moveBy, renumber, renumberText } from './clip.js';

export function mountEdit(ctx) {
  const { ST, view, units, refresh, updateTools, setTool, say } = ctx;

  function deleteSelected() {
    const a = ctx.selAl();
    if (a && ST.selPvi >= 0 && ST.selPvi < a.pvis.length) { const i = ST.selPvi; ST.project.change(t('cv.undo.pvi.delete'), () => { ctx.findAl(a.id).pvis.splice(i, 1); }, { keys: ST.project.keysOf('alignments', a.id) }); ST.selPvi = -1; say(t('cv.pvi.deleted')); return; }
    if (a) { ST.project.change(t('cv.undo.al.delete'), (s) => { s.alignments = s.alignments.filter((x) => x.id !== a.id); }); ST.sel = null; refresh(); say(t('fl.deleted', { name: a.name })); return; }
    const d = ctx.selPad();
    if (d) { ST.project.change(t('cv.undo.pad.delete'), (s) => { s.pads = s.pads.filter((x) => x.id !== d.id); }); ST.sel = null; refresh(); say(t('fl.deleted', { name: d.name })); return; }
    const st = ctx.selStruct();
    if (st) { ST.project.change(t('cv.undo.st.delete'), (s) => { s.network.structures = s.network.structures.filter((x) => x.id !== st.id); s.network.pipes = s.network.pipes.filter((p) => p.from !== st.id && p.to !== st.id); }); ST.sel = null; refresh(); say(t('cv.st.deleted', { name: st.name })); return; }
    if (ST.sel?.kind === 'feature' && ctx.flUi.remove(ST.sel.id)) { ST.sel = null; refresh(); return; }   // 0.4 V14
    if (ST.sel?.kind === 'catchment' && ctx.drUi.remove(ST.sel.id)) { ST.sel = null; refresh(); return; }   // 0.4 V19
    if (ST.sel?.kind === 'parcel' && ctx.pcUi.remove(ST.sel.id)) { ST.sel = null; refresh(); return; }   // 0.4 V21
    if (ST.sel?.kind === 'mass' && ctx.msUi.remove(ST.sel.id)) { ST.sel = null; refresh(); return; }   // 0.7 LC.1
    if (ST.sel?.kind === 'swept' && ctx.swUi.remove(ST.sel.id)) { ST.sel = null; refresh(); return; }   // 0.6 WL.28
    if (ctx.lsUi.remove(ST.sel)) { ST.sel = null; refresh(); return; }   // 0.7 LD
    if (ctx.plUi.remove(ST.sel)) { ST.sel = null; refresh(); return; }   // 0.7 PL
    if (ctx.rvUi.remove(ST.sel)) { ST.sel = null; refresh(); return; }   // 0.8 SU.957
    if (ctx.wmUi.remove(ST.sel)) { ST.sel = null; refresh(); return; }   // 0.8 LC.16
    const pp = ctx.selPipe();
    if (pp) { ST.project.change(t('cv.undo.pp.delete'), (s) => { s.network.pipes = s.network.pipes.filter((p) => p.id !== pp.id); }); ST.sel = null; refresh(); say(t('fl.deleted', { name: pp.name })); return; }
    if (ST.picked.size) { const n = ST.picked.size; removePoints(t('cv.undo.pts.delete', { n, count: num(n) })); say(t('cv.pts.deleted', { n, count: num(n), surface: rebuilt() })); return; }
    say(t('cv.delete.none'));
  }

  // ------------------------------------------------------------------ survey points: select, copy, paste
  const rebuilt = () => (ST.project.state.surface.tin ? t('cv.surface.tin.kept') : t('cv.surface.rebuilt'));   // a sentence, without a leading space
  const pickedPoints = () => ST.project.pointTable.whereName((n) => ST.picked.has(n));   // 0.11: by name, no object for the points not picked
  function selectAll() {
    if (!ST.project.points.length) { say(t('cv.pts.none')); return; }
    if (ST.tool !== 'select') setTool('select');
    ST.picked = ST.project.pointTable.nameSet(); ST.sel = null; ST.selPvi = -1;
    refresh(); say(t('cv.pts.selected', { n: ST.picked.size, count: num(ST.picked.size) }));
  }
  function selectNone() {
    if (ST.tool === 'paste') setTool('select');
    ST.picked.clear(); ST.sel = null; ST.selPvi = -1; refresh();
  }
  function removePoints(label) {
    const gone = new Set(ST.picked);
    ST.project.editPointTable(label, (ed) => { ed.removeWhereName((n) => gone.has(n)); });   // 0.11: the undo step keeps the removed rows only
    ST.picked.clear();
  }

  // The copy: in memory, and in localStorage so another tab of CivilCraft can paste it (read back as untrusted).
  const TAB = Math.random().toString(36).slice(2, 10);
  function storedClip() {
    try { return readClip(JSON.parse(localStorage.getItem('civilcraft.clipboard') || 'null')); } catch { return null; }
  }
  /** The newest of this tab's copy and the one another tab stored. */
  function ownClip() {
    const st = storedClip();
    if (!ST.clip) return st;
    return st && st.at > ST.clip.at ? st : ST.clip;
  }
  /** Copy (or cut) the selected points; returns the text for the system clipboard, or null. */
  function copyPoints(cut, { quiet = false } = {}) {
    const pts = pickedPoints();
    if (!pts.length) { say(ST.project.points.length ? t(cut ? 'cv.cut.need' : 'cv.copy.need') : t(cut ? 'cv.cut.none' : 'cv.copy.none')); return null; }
    const c = makeClip(pts, { units: units(), order: ctx.settings.order, source: TAB });
    ST.clip = readClip(c);
    let shared = true;
    try { localStorage.setItem('civilcraft.clipboard', JSON.stringify(c)); } catch { shared = false; }
    if (!quiet) navigator.clipboard?.writeText?.(c.csv).catch(() => {});
    if (cut) removePoints(t('cv.undo.pts.cut', { n: pts.length, count: num(pts.length) }));
    const msg = [t(cut ? 'cv.pts.cut.done' : 'cv.pts.copied', { n: pts.length, count: num(pts.length), order: ctx.settings.order.split('').join(',') })];
    if (cut) msg.push(rebuilt());
    msg.push(t('cv.pts.paste.how'));
    if (!shared) msg.push(t('cv.pts.noshare'));
    say(msg.join(' '));
    updateTools();
    return c.csv;
  }
  async function pasteFromButton(inPlace) {
    // a toolbar click has no paste event: ask the system clipboard (the browser may ask permission), else use our copy
    let text = null;
    if (navigator.clipboard?.readText) {
      try { text = await Promise.race([navigator.clipboard.readText(), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 4000))]); } catch { text = null; }
    }
    paste(inPlace, text);
  }
  /** Paste what choosePaste picks: CivilCraft's copy, or point rows copied elsewhere since. */
  function paste(inPlace, systemText) {
    const pick = choosePaste(ownClip(), systemText, ctx.settings.order);
    if (pick.kind === 'none') { say(pick.why); return; }
    const from = pick.kind === 'text' ? t('cv.paste.from.text') : t('cv.paste.from.clip');
    const note = pick.kind === 'clip' && pick.units !== units() ? ' ' + t(pick.units === 'm' ? 'cv.paste.units.m' : 'cv.paste.units.ft') : '';
    if (inPlace) { commitPaste(pick.points, 0, 0, 'Paste in place', from, note); return; }   // i18n-ignore: internal label (named through t() in commitPaste)
    startPlacing(pick.points, 'Paste', from, note);   // i18n-ignore: internal label
  }
  function duplicatePoints() {
    const pts = pickedPoints();
    if (!pts.length) { say(ST.project.points.length ? t('cv.dup.need') : t('cv.dup.none')); return; }
    startPlacing(pts, 'Duplicate', t('cv.paste.from.dup'), '');   // i18n-ignore: internal label
  }
  function startPlacing(pts, label, from, note) {
    setTool('paste');
    ST.pasteJob = { pts, anchor: centre(pts), label, from, note };
    say(t('cv.paste.follow', { n: pts.length, count: num(pts.length), from }) + note);
    view.invalidate();
  }
  function commitPaste(pts, dx, dy, label, from, note) {
    const moved = dx || dy ? moveBy(pts, dx, dy) : pts.map((p) => ({ ...p }));
    const r = renumber(moved, ST.project.pointTable.names(), { mode: ctx.settings.renumber, start: ctx.settings.start });
    const kind = label === 'Duplicate' ? 'dup' : label === 'Paste in place' ? 'place' : 'paste';   // i18n-ignore: internal labels
    const counts = { n: pts.length, count: num(pts.length) };
    ST.project.editPointTable(t({ dup: 'cv.undo.duplicate', place: 'cv.undo.paste.place', paste: 'cv.undo.paste' }[kind], counts), (ed) => { ed.add(r.points); });   // 0.11: the step keeps the added rows only
    setTool('select');
    ST.picked = new Set(r.points.map((p) => p.n)); ST.sel = null; ST.selPvi = -1;
    refresh();
    say(t({ dup: 'cv.dup.done', place: 'cv.paste.done.place', paste: 'cv.paste.done' }[kind], { ...counts, renumber: renumberText(r.changed, r.kept) }) + ' ' + rebuilt() + note);
  }

  return { deleteSelected, pickedPoints, selectAll, selectNone, storedClip, copyPoints, pasteFromButton, paste, duplicatePoints, commitPaste };
}
