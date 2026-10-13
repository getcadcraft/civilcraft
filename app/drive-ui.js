/* SPDX-License-Identifier: Apache-2.0 */
/**
 * drive-ui.js — the 3D view's Drive panel and Sun menu (0.4 V10). site-view3d.js mounts it; the numbers are drive.js's
 * (bin/test-civilcraft-drive.mjs).
 *
 * Drive: pick an alignment; the camera sits a driver's eye above the road (the design profile, else the existing ground
 * on the centerline) and looks ahead along it. Play / pause (Space), a station slider, speed (mph or km/h), step with
 * ←/→, Stop (Esc) puts the camera back where it was. Dragging in the view while driving pauses and lets you look round.
 * Sun: light the site from where the sun is on a date and time at the site's latitude and longitude (from the project's
 * coordinate system, else typed), with shadows. Remembered in this browser (localStorage civilcraft.sun).
 *
 *   mountDrive({ bar, stage, view, project, getData, rebuild, say }) → { driving, keydown(e) → bool, userMoved(), refresh() }
 */

import { t } from './i18n.js';
import { el } from './ui-util.js';
import { formatStation, fixed } from './units.js';
import { EYE_HEIGHT, DRIVE_SPEEDS, elevationAlong, driveFrame, sunPosition, sunVector } from './drive.js';

const SUN_STORE = 'civilcraft.sun';

export function mountDrive({ bar, stage, view, project, getData, rebuild, say }) {
  const P = () => project(), U = () => (P().state.units === 'm' ? 'm' : 'ft');
  // ---------------------------------------------------------------- drive
  const driveBtn = el('button', { type: 'button', className: 'cv-toggle', 'data-3d-drive': '', 'aria-pressed': 'false', title: t('dv.title') }, t('dv.btn'));
  const alSel = el('select', { className: 'cv-select cv3-sel', 'data-dv-al': '', 'aria-label': t('dv.al') });
  const play = el('button', { type: 'button', className: 'cv-toggle', 'data-dv-play': '', 'aria-pressed': 'false' }, t('dv.play'));
  const slider = el('input', { type: 'range', className: 'cv3-range', 'data-dv-sta': '', min: '0', max: '1', step: 'any', value: '0', 'aria-label': t('dv.sta') });
  const staOut = el('output', { className: 'cv3-sta', 'data-dv-out': '' });
  const speed = el('select', { className: 'cv-select cv3-sel', 'data-dv-speed': '', 'aria-label': t('dv.speed') });
  const stop = el('button', { type: 'button', className: 'cv-toggle', 'data-dv-stop': '' }, t('dv.stop'));
  const panel = el('div', { className: 'cv3-drive', 'data-dv-panel': '', hidden: true, role: 'group', 'aria-label': t('dv.panel') }, alSel, play, slider, staOut, speed, stop);
  stage.append(panel);
  let drive = null;   // { a, al, elev, sta, playing, saved, last }
  function fillAlignments() {
    const list = P().state.alignments.filter((a) => P().alignment(a).ok);
    alSel.replaceChildren(...list.map((a) => el('option', { value: a.id }, a.name)));
    return list;
  }
  function fillSpeeds() {
    const cur = speed.value;
    speed.replaceChildren(...DRIVE_SPEEDS[U()].map((s, i) => el('option', { value: String(i) }, s.label)));
    speed.value = cur && speed.options[Number(cur)] ? cur : '1';
  }
  function place() {
    const d = getData();
    if (!drive || !d) return;
    const f = driveFrame(drive.al, drive.elev, drive.sta, { eye: EYE_HEIGHT[U()], ahead: U() === 'm' ? 30 : 100, origin: d.origin, exag: d.exag });
    drive.sta = f.sta;
    view.cam.eye = f.eye; view.cam.target = f.target; view.cam.persp = true;
    slider.value = String(drive.sta);
    staOut.textContent = formatStation(drive.sta, U()) + (f.z !== null && Number.isFinite(f.z) ? '  EL ' + fixed(f.z, 2) : '');
    view.invalidate();
  }
  function begin(id) {
    const a = P().state.alignments.find((x) => x.id === id);
    if (!a) return;
    const al = P().alignment(a), eg = P().eg().surface;
    rebuild();
    const saved = drive?.saved || view.cam.toJSON();
    drive = { a, al, elev: elevationAlong(al, P().designProfile(a), eg ? (x, y) => eg.elevationAt(x, y, 1e-6) : null), sta: al.start, playing: false, saved, last: 0 };
    slider.min = String(al.start); slider.max = String(al.end);
    view.cam.fov = 50;
    place();
    setPlaying(false);
    say(t((P().designProfile(a)?.ok) ? 'dv.on.prof' : 'dv.on.eg', { name: a.name }));
  }
  function start() {
    const list = fillAlignments();
    if (!list.length) { say(t('dv.none')); return; }
    fillSpeeds();
    panel.hidden = false; driveBtn.setAttribute('aria-pressed', 'true');
    begin(alSel.value || list[0].id);
    play.focus();
  }
  function end() {
    if (!drive) return;
    setPlaying(false);
    view.cam.set(drive.saved); view.cam.fov = drive.saved.fov || 35;
    drive = null;
    panel.hidden = true; driveBtn.setAttribute('aria-pressed', 'false');
    view.invalidate();
    say(t('dv.off'));
  }
  function setPlaying(on) {
    if (!drive) return;
    if (on && drive.sta >= drive.al.end - 1e-6) drive.sta = drive.al.start;   // at the end: from the start again
    drive.playing = on; drive.last = 0;
    play.setAttribute('aria-pressed', String(on)); play.textContent = t(on ? 'dv.pause' : 'dv.play');
    if (on) requestAnimationFrame(tick);
  }
  function tick(ts) {
    if (!drive?.playing) return;
    if (drive.last) {
      const dt = Math.min(0.1, (ts - drive.last) / 1000);
      drive.sta += DRIVE_SPEEDS[U()][Number(speed.value) || 0].perSec * dt;
      if (drive.sta >= drive.al.end) { drive.sta = drive.al.end; place(); setPlaying(false); return; }
      place();
    }
    drive.last = ts;
    requestAnimationFrame(tick);
  }
  driveBtn.addEventListener('click', () => (drive ? end() : start()));
  alSel.addEventListener('change', () => begin(alSel.value));
  play.addEventListener('click', () => setPlaying(!drive?.playing));
  stop.addEventListener('click', end);
  slider.addEventListener('input', () => { if (!drive) return; setPlaying(false); drive.sta = Number(slider.value); place(); });

  // ---------------------------------------------------------------- sun
  const sun = readSun();
  const sunOn = el('input', { type: 'checkbox', 'data-sun-on': '', checked: sun.on });
  const shadows = el('input', { type: 'checkbox', 'data-sun-shadows': '', checked: sun.shadows });
  const date = el('input', { type: 'date', className: 'cv-input', 'data-sun-date': '', value: sun.date, 'aria-label': t('sun.date') });
  const time = el('input', { type: 'time', className: 'cv-input', 'data-sun-time': '', value: sun.time, 'aria-label': t('sun.time') });
  const utc = el('select', { className: 'cv-select', 'data-sun-utc': '', 'aria-label': t('sun.utc') }, ...Array.from({ length: 53 }, (_, i) => { const h = -12 + i / 2; return el('option', { value: String(h) }, 'UTC' + (h < 0 ? '−' : '+') + String(Math.floor(Math.abs(h))).padStart(2, '0') + ':' + (Math.abs(h) % 1 ? '30' : '00')); }));
  utc.value = String(sun.utc);
  const lat = el('input', { type: 'text', className: 'cv-input', 'data-sun-lat': '', inputMode: 'decimal', value: sun.lat ?? '', 'aria-label': t('sun.lat'), style: 'width:6rem' });
  const lon = el('input', { type: 'text', className: 'cv-input', 'data-sun-lon': '', inputMode: 'decimal', value: sun.lon ?? '', 'aria-label': t('sun.lon'), style: 'width:6rem' });
  const readout = el('p', { className: 'cv3-sunout', 'data-sun-out': '', 'aria-live': 'polite' });
  const lbl = (x, text) => el('label', {}, text, ' ', x);
  const sunMenu = el('details', { className: 'cv-menu cv3-menu', 'data-sun-menu': '' },
    el('summary', { className: 'cv-toggle', title: t('sun.title') }, t('sun.btn')),
    el('div', { className: 'cv-menu-list cv3-sun' },
      el('label', {}, sunOn, ' ', t('sun.on')), el('label', {}, shadows, ' ', t('sun.shadows')),
      lbl(date, t('sun.date')), el('div', { className: 'cv-row' }, lbl(time, t('sun.time')), utc),
      el('div', { className: 'cv-row' }, lbl(lat, t('sun.lat')), lbl(lon, t('sun.lon'))),
      readout, el('p', { className: 'cv-note' }, t('sun.note'))));
  const sep = bar.querySelector('.cv3-sep');
  if (sep) sep.before(driveBtn, sunMenu); else bar.append(driveBtn, sunMenu);
  document.addEventListener('click', (e) => { if (sunMenu.open && !sunMenu.contains(e.target)) sunMenu.open = false; });
  let fromCrs = false;
  async function crsLatLon() {
    const crs = P().state.crs, d = getData();
    if (!crs || !d) return null;
    try { const { transformer } = await import('./crs.js'); const [lo, la] = transformer(crs, null)(d.origin.x, d.origin.y); return Number.isFinite(la) && Number.isFinite(lo) ? [la, lo] : null; } catch { return null; }
  }
  async function applySun() {
    const s = { on: sunOn.checked, shadows: shadows.checked, date: date.value, time: time.value, utc: Number(utc.value), lat: lat.value.trim(), lon: lon.value.trim() };
    if (s.on && !s.lat && !s.lon) { const ll = await crsLatLon(); if (ll) { lat.value = s.lat = ll[0].toFixed(5); lon.value = s.lon = ll[1].toFixed(5); fromCrs = true; } }
    try { localStorage.setItem(SUN_STORE, JSON.stringify(s)); } catch { /* storage blocked: this visit only */ }
    if (!s.on) { view.setSun(null); readout.textContent = ''; return; }
    const la = Number(s.lat), lo = Number(s.lon);
    const when = Date.parse(s.date + 'T' + (s.time || '12:00') + ':00Z') - s.utc * 3600000;
    if (!(Math.abs(la) <= 90) || !(Math.abs(lo) <= 180) || s.lat === '' || s.lon === '' || !Number.isFinite(when)) { view.setSun(null); readout.textContent = t(P().state.crs ? 'sun.need' : 'sun.need.crs'); return; }
    const pos = sunPosition(new Date(when), la, lo), d = getData();
    const v = sunVector(pos), ex = d?.exag || 1;   // in the exaggerated view the same shadow needs the light ex times steeper
    view.setSun({ dir: [v[0], v[1], v[2] * ex], up: pos.altitude > 0, shadows: s.shadows });
    readout.textContent = pos.altitude > 0 ? t('sun.at', { az: fixed(pos.azimuth, 1), alt: fixed(pos.altitude, 1) }) + (fromCrs ? ' ' + t('sun.fromcrs') : '') : t('sun.below', { az: fixed(pos.azimuth, 1) });
  }
  for (const x of [sunOn, shadows, date, time, utc]) x.addEventListener('change', applySun);
  for (const x of [lat, lon]) x.addEventListener('change', () => { fromCrs = false; applySun(); });

  return {
    get driving() { return !!drive; }, get drive() { return drive; },
    /** Keys while driving: Space plays/pauses, ←/→ step, Esc stops. true = handled. */
    keydown(e) {
      if (!drive) return false;
      if (e.key === 'Escape') { end(); return true; }
      if (e.key === ' ') { setPlaying(!drive.playing); return true; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { setPlaying(false); drive.sta += (e.key === 'ArrowLeft' ? -1 : 1) * (U() === 'm' ? 5 : 10); place(); return true; }
      return false;
    },
    userMoved() { if (drive?.playing) setPlaying(false); },
    refresh() { if (drive) place(); applySun(); },
    start, end, applySun,
  };
}

function readSun() {
  const now = new Date();
  const s = { on: false, shadows: true, date: now.toISOString().slice(0, 10), time: '12:00', utc: -now.getTimezoneOffset() / 60, lat: '', lon: '' };
  try {
    const v = JSON.parse(localStorage.getItem(SUN_STORE) || '{}');
    if (typeof v.on === 'boolean') s.on = v.on;
    if (typeof v.shadows === 'boolean') s.shadows = v.shadows;
    if (/^\d{4}-\d\d-\d\d$/.test(v.date)) s.date = v.date;
    if (/^\d\d:\d\d$/.test(v.time)) s.time = v.time;
    if (Number.isFinite(v.utc) && Math.abs(v.utc) <= 14) s.utc = v.utc;
    if (typeof v.lat === 'string' && v.lat.length < 20) s.lat = v.lat;
    if (typeof v.lon === 'string' && v.lon.length < 20) s.lon = v.lon;
  } catch { /* defaults */ }
  if (!Number.isInteger(s.utc * 2)) s.utc = Math.round(s.utc * 2) / 2;
  return s;
}
