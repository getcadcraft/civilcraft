/* SPDX-License-Identifier: Apache-2.0 */
/**
 * profile-ui.js: civilcraft.js's 13 bindings for this topic, moved out of init() unchanged (0.11 PERF.71 round two, perf-finish-11 r2 civil-detail; no behaviour change).
 * mountProfile(ctx) is called once by init(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables init() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { el } from './ui-util.js';
import { featureProfile } from './featureline.js';
import { t } from './i18n.js';
import { snapProfile, slopeOut, setSlope } from './profile-snap.js';
import { pct, formatStation, fixed } from './units.js';
import { PadDetector } from './wheel-pad.js';
import { buildProfile } from './profile.js';

export function mountProfile(ctx) {
  const { ST, ui, view, pview, secUi, units, refresh, updateTools, renderProps, numInput, say } = ctx;

  // ------------------------------------------------------------------ profile view
  function showProfile(on, alId) {
    if (on) secUi?.show(false);   // 0.4 V13: one bottom panel at a time
    ui.profPanel.hidden = !on;
    if (alId) ui.profAl.dataset.want = alId;
    updateTools();
    renderProfile();
    view.resize();
  }
  function profileAlignment() {
    const s = ST.project.state;
    const want = ST.sel?.kind === 'alignment' ? ST.sel.id : ui.profAl.dataset.want || ui.profAl.value;
    return s.alignments.find((a) => a.id === want) || s.alignments[0] || null;
  }
  function renderProfile() {
    if (ui.profPanel.hidden) return;
    const s = ST.project.state, a = profileAlignment();
    ui.profAl.replaceChildren(...s.alignments.map((x) => el('option', { value: x.id }, x.name)));
    ui.profAl.disabled = s.alignments.length < 2;
    if (!a) { pview.set(null); return; }
    ui.profAl.value = a.id;
    const al = ST.project.alignment(a);
    if (!al.ok) { pview.set(null); return; }
    const pvis = ST.pvDrag ? ST.pvDrag.pvis : a.pvis;
    const prof = ST.pvDrag ? ST.pvDrag.prof : ST.project.designProfile(a);
    // 0.5 WL.20: feature lines crossing it (and, within the set distance, running alongside), worked out again after every
    // edit — the labels follow the lines
    const ds = ST.project.state.display;
    const features = ds.profFeatures ? ST.project.memo('flprof:' + a.id, ST.project.version + '|' + ds.profWithin, () => featureProfile(al, ST.project.state.features || [], { within: ds.profWithin })) : [];
    // 0.11 SU.1810: utility runs that cross the alignment, as bars at their station (the ground under each crossing gives the pipe its height)
    const utilities = ST.project.state.utilities?.runs?.length ? ST.project.memo('utprof:' + a.id, ST.project.version + '|' + ST.project.gisVersion, () => ctx.utUi.crossingsAlong(al.polyline(1))) : [];
    ui.profFl.setAttribute('aria-pressed', String(!!ds.profFeatures));
    if (document.activeElement !== ui.profWithin) ui.profWithin.value = ds.profWithin ? String(ds.profWithin) : '';
    ui.profWithin.disabled = !ds.profFeatures;
    pview.set({ key: a.id + '|' + ST.project.version, align: a.id, snap: ST.profSnap && ST.profSnap.kind !== 'free' ? ST.profSnap : null, eg: ST.project.egProfile(a), profile: prof, pvis, start: al.start, end: al.end, units: units(), sel: ST.selPvi, hover: ST.pvHover, cursor: ST.profCursor,
      features, utilities, featSel: ST.sel?.kind === 'feature' ? ST.sel.id : null, cant: ST.project.railPlan(a) });   // cant: 0.7.1 71.26
  }
  ui.profFl.addEventListener('click', () => { ST.project.setDisplay('profFeatures', !ST.project.state.display.profFeatures); renderProfile(); });
  ui.profWithin.addEventListener('change', () => {
    const v = Number(String(ui.profWithin.value).replace(',', '.'));
    if (ui.profWithin.value.trim() !== '' && (!Number.isFinite(v) || v < 0)) { say(t('pv.fl.within.bad')); ui.profWithin.value = ST.project.state.display.profWithin || ''; return; }
    ST.project.setDisplay('profWithin', ui.profWithin.value.trim() === '' ? 0 : v);
    renderProfile();
  });
  ST.pvHover = -1;
  ST.pvPick = null;
  ST.profSnap = null;
  ST.profSnapOn = true;
  ST.profPan = null;   // CV.3: pvPick = { id, i, field: 'sta' | 'z' } while a table pick button waits for a click in the profile
  const parseSlope = (x) => { const v = Number(String(x).replace('%', '').replace(',', '.').trim()); return String(x).trim() === '' || !Number.isFinite(v) ? null : v / 100; };
  /** The pick button beside a PVI's station or elevation: the next click in the profile (snapped) fills that value. */
  function pviPickBtn(i, field) {
    const on = ST.pvPick && ST.pvPick.i === i && ST.pvPick.field === field;
    return el('button', { type: 'button', className: 'cv-x cv-pvipick' + (on ? ' is-on' : ''), 'data-pvi-pick': field + ':' + i, 'aria-pressed': String(!!on),
      'aria-label': t(field === 'sta' ? 'cv.pvi.pick.sta.of' : 'cv.pvi.pick.z.of', { n: i + 1 }), title: t('cv.pvi.pick.title'), onclick: () => startPviPick(i, field) }, el('i', { className: 'bi bi-crosshair', 'aria-hidden': 'true' }));
  }
  function startPviPick(i, field) {
    const a = profileAlignment(); if (!a) return;
    if (ST.pvPick && ST.pvPick.i === i && ST.pvPick.field === field) { endPviPick(); renderProps(); return; }
    if (ui.profPanel.hidden) showProfile(true, a.id);
    ST.pvPick = { id: a.id, i, field };
    ui.prof.classList.add('is-picking'); ui.prof.focus({ preventScroll: true });
    say(t('cv.pvi.pick.hint', { n: i + 1, what: t(field === 'sta' ? 'cv.pvi.pick.what.sta' : 'cv.pvi.pick.what.z') }));
    renderProps();
  }
  function endPviPick() { ST.pvPick = null; ST.profSnap = null; ui.prof.classList.remove('is-picking'); renderProfile(); }
  /** What a point in the profile means for PVI `skip` (or a new one): the snapped point, or the raw one when snapping is off or Alt is held. */
  function profPoint(sx, sy, a, skip, alt) {
    const d = pview.toData(sx, sy);
    const snap = ST.profSnapOn && !alt ? snapProfile(sx, sy, { toScreen: (q, z) => pview.toScreen(q, z), toData: (x, y) => pview.toData(x, y), eg: ST.project.egProfile(a), pvis: a.pvis, skip, px: 10, labels: { pvi: t('cv.snap.pvi'), ground: t('cv.snap.ground'), station: t('cv.snap.station'), groundline: t('cv.snap.groundline') } }) : null;
    return snap || { sta: d.sta, z: d.z, kind: 'free', label: '' };
  }
  /** The slope cell: the grade (%) of the tangent from this PVI to the next, typed to move the next PVI's elevation (the last row has none). */
  function slopeCell(a, i) {
    const last = i === a.pvis.length - 1, g = slopeOut(a.pvis, i);
    if (last || g === null) return el('td', { className: 'cv-dash' }, '—');
    return el('td', {}, numInput(String(Number((g * 100).toFixed(3))), (x) => {
      const q = parseSlope(x); if (q === null) return false;
      const trial = a.pvis.map((v) => ({ ...v })), r = setSlope(trial, i, q);
      if (!r.ok) { say(t('cv.pvi.slope.locked', { a: i + 1, b: i + 2 })); return false; }
      ST.project.change(t('cv.undo.pvi.slope'), () => { const p = ctx.findAl(a.id).pvis; p[r.moved].z = trial[r.moved].z; }, { keys: ST.project.keysOf('alignments', a.id) });
      say(t('cv.pvi.slope.set', { a: i + 1, b: i + 2, g: pct(q), n: r.moved + 1 }));
      return true;
    }, { label: t('cv.pvi.slope.of', { a: i + 1, b: i + 2 }), calc: false }));
  }
  ui.profAl.addEventListener('change', () => { ui.profAl.dataset.want = ui.profAl.value; ST.sel = { kind: 'alignment', id: ui.profAl.value }; ST.selPvi = -1; refresh(); });
  ui.profClose.addEventListener('click', () => showProfile(false));
  ui.pviAdd.addEventListener('click', () => setPviAdd(ui.pviAdd.getAttribute('aria-pressed') !== 'true'));
  function setPviAdd(on) { ui.pviAdd.setAttribute('aria-pressed', String(on)); if (on) say(t('cv.pvi.add.hint')); }

  ui.prof.addEventListener('pointerdown', (e) => {
    const a = profileAlignment(); if (!a || !pview.data) return;
    ui.prof.focus({ preventScroll: true });
    const r = ui.prof.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    if (e.button === 1 || e.button === 2) { ST.profPan = { x: e.clientX, y: e.clientY }; ui.prof.setPointerCapture(e.pointerId); e.preventDefault(); return; }   // CV.3: middle or right button drags the view
    if (ST.pvPick) {   // CV.3 (#1534): a pick button in the PVI table is waiting for this click
      const pk = ST.pvPick, pa = ctx.findAl(pk.id), al0 = ST.project.alignment(pa), q = profPoint(sx, sy, pa, pk.i, e.altKey);
      if (pa && pa.pvis[pk.i]) {
        const prev = pa.pvis[pk.i - 1], next = pa.pvis[pk.i + 1];
        const sta = Math.max(prev ? prev.sta + 0.01 : al0.start, Math.min(next ? next.sta - 0.01 : al0.end, Number(q.sta.toFixed(2)))), z = Number(q.z.toFixed(2));
        ST.project.change(t(pk.field === 'sta' ? 'cv.undo.pvi.sta' : 'cv.undo.pvi.z'), () => { const v = ctx.findAl(pk.id).pvis[pk.i]; if (pk.field === 'sta') v.sta = sta; else v.z = z; }, { keys: ST.project.keysOf('alignments', pk.id) });
        say(t(pk.field === 'sta' ? 'cv.pvi.picked.sta' : 'cv.pvi.picked.z', { n: pk.i + 1, v: pk.field === 'sta' ? formatStation(sta, units()) : fixed(z, 2) }));
      }
      endPviPick(); renderProps();
      return;
    }
    const hit = pview.hitPvi(sx, sy);
    const fl = hit < 0 ? pview.hitFeature(sx, sy) : null;   // 0.5 WL.20: a feature line's crossing mark selects it
    if (fl) { ctx.flUi.find(fl) && (ST.sel = { kind: 'feature', id: fl }, ST.selPvi = -1, ST.picked.clear(), refresh()); return; }
    if (hit >= 0) {
      ST.selPvi = hit; ST.sel = { kind: 'alignment', id: a.id };
      if (a.pvis[hit].locked) { say(t('cv.pvi.locked.drag', { n: hit + 1 })); renderProps(); renderProfile(); return; }   // CV.3: a locked PVI is not dragged
      ST.pvDrag = { id: a.id, i: hit, pvis: a.pvis.map((v) => ({ ...v })), prof: ST.project.designProfile(a), moved: false, x0: sx, y0: sy };
      ui.prof.setPointerCapture(e.pointerId);
      renderProps(); renderProfile();
      return;
    }
    if (ui.pviAdd.getAttribute('aria-pressed') === 'true') {
      const al = ST.project.alignment(a); const d = profPoint(sx, sy, a, -1, e.altKey);   // CV.3: snaps (Alt = free)
      const sta = Math.max(al.start, Math.min(al.end, Number(d.sta.toFixed(2)))), z = Number(d.z.toFixed(2));
      if (a.pvis.some((v) => Math.abs(v.sta - sta) < 0.01)) { say(t('cv.pvi.exists', { sta: formatStation(sta, units()) })); return; }
      ST.project.change(t('cv.undo.pvi.add'), () => { const p = ctx.findAl(a.id).pvis; p.push({ sta, z, L: 0 }); p.sort((m, n) => m.sta - n.sta); }, { keys: ST.project.keysOf('alignments', a.id) });
      ST.selPvi = ctx.findAl(a.id).pvis.findIndex((v) => v.sta === sta);
      renderProps(); renderProfile();
      say(t('cv.pvi.added', { sta: formatStation(sta, units()), z: fixed(z, 2) }));
    } else { ST.selPvi = -1; renderProps(); renderProfile(); }
  });
  ui.prof.addEventListener('pointermove', (e) => {
    const a = profileAlignment(); if (!a || !pview.data) return;
    const r = ui.prof.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    if (ST.profPan) { pview.panBy(e.clientX - ST.profPan.x, e.clientY - ST.profPan.y); ST.profPan = { x: e.clientX, y: e.clientY }; return; }
    const d = pview.toData(sx, sy), al = ST.project.alignment(a);
    if (ST.pvDrag) {
      if (Math.hypot(sx - ST.pvDrag.x0, sy - ST.pvDrag.y0) > 2) ST.pvDrag.moved = true;
      if (!ST.pvDrag.moved) return;
      const v = ST.pvDrag.pvis[ST.pvDrag.i], prev = ST.pvDrag.pvis[ST.pvDrag.i - 1], next = ST.pvDrag.pvis[ST.pvDrag.i + 1];
      const q = profPoint(sx, sy, { ...a, pvis: ST.pvDrag.pvis }, ST.pvDrag.i, e.altKey);   // CV.3: the dragged PVI snaps to the others, to ground points and ground
      ST.profSnap = q;
      v.sta = Math.max(prev ? prev.sta + 0.01 : al.start, Math.min(next ? next.sta - 0.01 : al.end, Number(q.sta.toFixed(2))));
      v.z = Number(q.z.toFixed(2));
      ST.pvDrag.prof = buildProfileLive(ST.pvDrag.pvis);
      renderProfile();
      ui.profRead.textContent = t('cv.prof.read.pvi', { sta: formatStation(v.sta, units()), z: fixed(v.z, 2) });
      return;
    }
    const h = pview.hitPvi(sx, sy);
    const wantSnap = ST.pvPick || ui.pviAdd.getAttribute('aria-pressed') === 'true';
    const ns = wantSnap && h < 0 ? profPoint(sx, sy, a, ST.pvPick ? ST.pvPick.i : -1, e.altKey) : null;
    const snapChanged = (ns && ns.kind !== 'free' ? ns.sta + '|' + ns.z : '') !== (ST.profSnap && ST.profSnap.kind !== 'free' ? ST.profSnap.sta + '|' + ST.profSnap.z : '');
    ST.profSnap = ns;
    if (h !== ST.pvHover || snapChanged) { ST.pvHover = h; renderProfile(); }
    const sta = Math.max(al.start, Math.min(al.end, d.sta));
    const egz = interpEg(ST.project.egProfile(a), sta), prof = ST.project.designProfile(a), fg = prof.ok ? prof.elevationAt(sta) : null;
    const read = [t('cv.read.sta', { sta: formatStation(sta, units()) })];
    if (egz !== null) read.push(t('cv.read.ground', { z: fixed(egz, 2) }));
    if (fg !== null) read.push(t('cv.read.design', { z: fixed(fg, 2) }), t('cv.read.grade', { g: pct(prof.gradeAt(sta)) }), t(fg - egz >= 0 ? 'cv.read.fill' : 'cv.read.cut', { d: fixed(Math.abs(fg - egz), 2) }));
    ui.profRead.textContent = read.join(' · ');
    ST.profCursor = { id: a.id, sta };
    view.invalidate();
  });
  ui.prof.addEventListener('pointerleave', () => { ST.profCursor = null; if (ST.profSnap) { ST.profSnap = null; renderProfile(); } view.invalidate(); });
  ui.prof.addEventListener('contextmenu', (e) => e.preventDefault());
  // CV.3 (#1534): the wheel zooms the profile about the pointer (Shift = stations only, Alt = elevations only); double click fits; + − F keys
  const profPad = new PadDetector();
  ui.prof.addEventListener('wheel', (e) => {
    if (!pview.data) return;
    e.preventDefault();
    if (!e.shiftKey && !e.altKey && profPad.isSwipe(e)) { pview.panBy(-e.deltaX, -e.deltaY); renderProfile(); return; }   // D7.56: two fingers pan; a pinch and a mouse wheel zoom (Shift / Alt keep their one-axis zoom)
    const r = ui.prof.getBoundingClientRect();
    pview.zoomAt(e.clientX - r.left, e.clientY - r.top, Math.pow(1.0015, -e.deltaY * (e.deltaMode === 1 ? 16 : 1)), e.shiftKey ? 'x' : e.altKey ? 'y' : 'xy');
    renderProfile();
  }, { passive: false });
  ui.prof.addEventListener('dblclick', () => { pview.fit(); renderProfile(); });
  ui.prof.addEventListener('pointerup', () => {
    if (ST.profPan) { ST.profPan = null; return; }
    if (!ST.pvDrag) return;
    ST.profSnap = null;
    const d = ST.pvDrag; ST.pvDrag = null;
    if (d.moved) { ST.project.change(t('cv.undo.pvi.move'), () => { ctx.findAl(d.id).pvis = d.pvis; }, { keys: ST.project.keysOf('alignments', d.id) }); ST.selPvi = d.i; }
    renderProfile(); renderProps();
  });
  ui.prof.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && ST.selPvi >= 0) { e.preventDefault(); ctx.command('delete'); }
    if (e.key === 'Escape' && ST.pvPick) { e.preventDefault(); e.stopPropagation(); endPviPick(); renderProps(); }   // the pick ends; the selection stays
    const c = pview.plot, cx = (c.x0 + c.x1) / 2, cy = (c.y0 + c.y1) / 2;
    if (e.key === '+' || e.key === '=') { e.preventDefault(); pview.zoomAt(cx, cy, 1.25); renderProfile(); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); pview.zoomAt(cx, cy, 0.8); renderProfile(); }
    else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); pview.fit(); renderProfile(); }
  });
  ui.profSnapBtn?.addEventListener('click', () => { ST.profSnapOn = !ST.profSnapOn; ui.profSnapBtn.setAttribute('aria-pressed', String(ST.profSnapOn)); if (!ST.profSnapOn) { ST.profSnap = null; renderProfile(); } });
  const buildProfileLive = (p) => buildProfile(p);
  function interpEg(eg, sta) {
    for (let i = 1; i < eg.length; i++) if (sta <= eg[i].sta) { const a = eg[i - 1], b = eg[i]; if (a.z === null || b.z === null) return null; return a.z + (b.z - a.z) * (sta - a.sta) / Math.max(b.sta - a.sta, 1e-12); }
    return null;
  }

  return { showProfile, renderProfile, pviPickBtn, slopeCell, setPviAdd };
}
