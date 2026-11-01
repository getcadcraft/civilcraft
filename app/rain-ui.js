/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rain-ui.js — "Make it rain" (0.8 EG.69, session `civil_PART_2`): Surface › More › Make it rain… opens a window. Pick the storm (rain, how long,
 * how long to watch after), the ground's roughness and soak, press Run: the water runs down the graded ground, collects in low spots and spills over
 * their rims, and the result plays as an animation (a slider, play and pause; with reduced motion it starts paused). Beside it: the water balance, the
 * outflow hydrograph, and a list of the places that overtopped. The numbers are rain.js (DOM-free, bin/test-civilcraft-rain.mjs). A calculation aid.
 *
 *   createRain(ctx) → { open(), last(), problems() }
 *   ctx = { el, root, project, units, ground() → surface | null, say, download(name, blob), fileStem() }
 */
import { t } from './i18n.js';
import { demFromSurface, RainSim, runSliced } from './rain.js';
import { openWin, field, table, csv, saved, save } from './eg-win.js';
import { fixed } from './units.js';

const MAX_CELLS = 160000;
const DEFAULTS = { rain: 0, duration: 30, after: 30, n: 0.05, loss: 0, abst: 0, cell: 0, view: 'play' };
let memo = null;   // { project, version, result, dem, ground } — the last run, for Problems and the window

export function createRain(ctx) {
  const { el } = ctx;
  const U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const M = () => U() === 'm';
  const depthUnit = () => (M() ? 'mm' : 'in');   // i18n-ignore: unit symbols
  const dFromM = (d) => (M() ? d * 1000 : d * 39.3700787);
  const cuOf = (m3) => (M() ? m3 : m3 / 0.028316846592 / 27), cuU = () => (M() ? 'm³' : 'yd³');   // i18n-ignore: unit symbols
  const flowOf = (q) => (M() ? q : q / 0.028316846592), flowU = () => (M() ? 'm³/s' : 'ft³/s');   // i18n-ignore: unit symbols
  const S = saved('eg69', DEFAULTS);
  const ROUGH = () => [['0.015', t('eg.rain.n.pave')], ['0.05', t('eg.rain.n.bare')], ['0.15', t('eg.rain.n.grass')], ['0.24', t('eg.rain.n.dense')]];
  let job = null, frames = null, playing = null;

  function last() { return memo && memo.project === ctx.project() && memo.version === ctx.project().version ? memo : null; }

  function problems() {
    const m = last();
    if (!m) return [];
    const out = [];
    for (const p of m.result.problems) {
      if (p.code === 'overtop') out.push({ code: 'rain.overtop', part: 'overtop:' + p.pond, severity: 'warning', msg: { key: 'eg.prob.overtop', vars: { min: fixed(p.at / 60, 0) } }, text: t('eg.prob.overtop', { min: fixed(p.at / 60, 0) }), about: [], at: { x: p.x, y: p.y } });
      else if (p.code === 'balance') out.push({ code: 'rain.balance', part: 'balance', severity: 'warning', msg: { key: 'eg.prob.balance', vars: { pct: fixed(p.error * 100, 1) } }, text: t('eg.prob.balance', { pct: fixed(p.error * 100, 1) }), about: [] });
    }
    return out;
  }

  function shade(dem, ground) {   // a quiet relief picture of the ground, once
    const { nx, ny, z } = dem, out = new Uint8ClampedArray(nx * ny * 4);
    let lo = Infinity, hi = -Infinity;
    for (let k = 0; k < z.length; k++) if (!Number.isNaN(z[k])) { lo = Math.min(lo, z[k]); hi = Math.max(hi, z[k]); }
    const span = hi - lo || 1;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const k = j * nx + i, o = ((ny - 1 - j) * nx + i) * 4;
      if (Number.isNaN(z[k])) { out[o + 3] = 0; continue; }
      const zx = (z[j * nx + Math.min(nx - 1, i + 1)] - z[j * nx + Math.max(0, i - 1)]) / (2 * dem.cellM), zy = (z[Math.min(ny - 1, j + 1) * nx + i] - z[Math.max(0, j - 1) * nx + i]) / (2 * dem.cellM);
      const lit = Math.max(-0.5, Math.min(0.5, (-zx * 0.7 + zy * 0.7) * 0.8)), base = 205 + ((z[k] - lo) / span) * 25 + lit * 60;
      out[o] = out[o + 1] = base; out[o + 2] = base - 8; out[o + 3] = 255;
      if (dem.block[k]) { out[o] = 120; out[o + 1] = 120; out[o + 2] = 126; }
    }
    return out;
  }

  function paintFrame(cv, dem, base, depth, top) {
    const { nx, ny } = dem, off = cv._off || (cv._off = Object.assign(document.createElement('canvas'), { width: nx, height: ny })), c2 = off.getContext('2d'), img = c2.createImageData(nx, ny);
    img.data.set(base);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const d = depth[j * nx + i];
      if (d > 0.0005) {
        const o = ((ny - 1 - j) * nx + i) * 4, a = Math.min(0.92, 0.3 + (d / top) * 0.62);
        img.data[o] = img.data[o] * (1 - a) + 20 * a; img.data[o + 1] = img.data[o + 1] * (1 - a) + 110 * a; img.data[o + 2] = img.data[o + 2] * (1 - a) + 190 * a;
      }
    }
    c2.putImageData(img, 0, 0);
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height);
    const sc = Math.min(cv.width / nx, cv.height / ny); g.drawImage(off, 0, 0, nx * sc, ny * sc);
  }

  function drawHydro(cv, res) {
    const g = cv.getContext('2d'), W = cv.width, H = cv.height, pad = 28;
    g.clearRect(0, 0, W, H);
    const h = res.hydrograph; if (h.length < 2) return;
    const tMax = h[h.length - 1].t, qMax = Math.max(1e-9, ...h.map((r) => Math.max(r.out, 0))), rMax = Math.max(1e-9, ...h.map((r) => r.rain));
    const X = (tt) => pad + (tt / tMax) * (W - pad - 6), Y = (q, m) => H - pad - (q / m) * (H - pad - 8);
    const css = getComputedStyle(cv), ink = css.color || '#222';
    g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 1; g.font = '11px sans-serif';   // i18n-ignore: canvas font
    g.beginPath(); g.moveTo(pad, 6); g.lineTo(pad, H - pad); g.lineTo(W - 4, H - pad); g.stroke();
    g.globalAlpha = 0.25; g.fillStyle = '#1f77b4';
    for (let k = 1; k < h.length; k++) { const x0 = X(h[k - 1].t), x1 = X(h[k].t), y = Y(h[k].rain, rMax); g.fillRect(x0, y, Math.max(1, x1 - x0), H - pad - y); }
    g.globalAlpha = 1; g.strokeStyle = '#d6572a'; g.lineWidth = 2; g.beginPath();
    h.forEach((r, k) => (k ? g.lineTo(X(r.t), Y(r.out, qMax)) : g.moveTo(X(r.t), Y(r.out, qMax)))); g.stroke();
    g.fillStyle = ink; g.fillText(fixed(flowOf(qMax), M() ? 2 : 1) + ' ' + flowU(), 4, 12); g.fillText(fixed(tMax / 60, 0) + ' min', W - 52, H - 10);
  }

  function open() {
    if (!S.rain) S.rain = M() ? 50 : 2;   // the default storm in the project's unit (read when the window opens: the app's units are not set up yet when this is created)
    const ground = ctx.ground();
    openWin(ctx, 'cv-eg-rain', 'eg.rain.title', (body, win) => {
      const kids = [el('p', { className: 'cv-note' }, el('strong', {}, t('eg.review'))), el('p', { className: 'cv-note' }, t('eg.rain.lead'))];
      if (!ground) { kids.push(el('p', { className: 'cv-note', 'data-eg-none': '' }, t('eg.rain.noground'))); body.replaceChildren(...kids); return; }
      const form = el('div', { className: 'cv-props', 'data-eg-rain-form': '' },
        ...field(ctx, t('eg.rain.intensity'), S, 'rain', { unit: depthUnit() + '/h', min: 0.01, max: 1000, id: 'eg-rain-i' }),
        ...field(ctx, t('eg.rain.duration'), S, 'duration', { unit: 'min', min: 1, max: 1440, id: 'eg-rain-d' }),
        ...field(ctx, t('eg.rain.after'), S, 'after', { unit: 'min', min: 0, max: 1440, id: 'eg-rain-a' }),
        ...field(ctx, t('eg.rain.n'), S, 'n', { min: 0.005, max: 1, id: 'eg-rain-n' }),
        ...field(ctx, t('eg.rain.loss'), S, 'loss', { unit: depthUnit() + '/h', min: 0, max: 1000, id: 'eg-rain-l' }),
        ...field(ctx, t('eg.rain.abst'), S, 'abst', { unit: depthUnit(), min: 0, max: 1000, id: 'eg-rain-s' }),
        ...field(ctx, t('eg.rain.cell'), S, 'cell', { unit: M() ? 'm' : 'ft', min: 0, max: 1e5, id: 'eg-rain-c' }));
      const presets = el('p', { className: 'cv-note' }, t('eg.rain.n.help'), ' ', ...ROUGH().flatMap(([v, l]) => [el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { S.n = Number(v); win.redraw(); } }, l + ' ' + v), ' · ']));
      const prog = el('progress', { max: 1, value: 0, hidden: true, 'aria-label': t('eg.rain.progress'), 'data-eg-rain-progress': '' });
      const status = el('p', { className: 'cv-note', 'aria-live': 'polite', 'data-eg-rain-status': '' });
      const runBtn = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-eg-rain-run': '', onclick: () => run() }, el('i', { className: 'bi bi-cloud-rain-heavy', 'aria-hidden': 'true' }), ' ', t('eg.rain.run'));
      const stopBtn = el('button', { type: 'button', className: 'btn-line btn-sm-cc', hidden: true, onclick: () => job?.abort() }, t('eg.rain.stop'));
      const out = el('div', { 'data-eg-rain-out': '' });
      kids.push(form, presets, el('div', { className: 'cv-actions' }, runBtn, stopBtn, prog), status, out);
      body.replaceChildren(...kids);
      const m = last();
      if (m && m.result) show(m.result, m.dem, m.base, out, win);

      async function run() {
        if (job) return;
        save('eg69', S);
        const dem = demFromSurface(ground, { cell: S.cell > 0 ? S.cell : null, units: U(), maxCells: MAX_CELLS });
        if (!dem) { status.textContent = t('eg.rain.noground'); return; }
        const mmh = M() ? S.rain : S.rain * 25.4, toMM = (v) => (M() ? v : v * 25.4);
        const sim = new RainSim(dem, { rain: mmh, duration: S.duration, tEnd: S.duration + S.after, n: S.n, lossRate: toMM(S.loss), abstraction: toMM(S.abst), edge: 'open', frames: 48, frameBytes: 40e6, dtMax: 5 });
        job = new AbortController(); runBtn.disabled = true; stopBtn.hidden = false; prog.hidden = false; out.replaceChildren();
        status.textContent = t('eg.rain.running', { cells: fixed(sim.activeCells, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), cell: fixed(dem.cell, 1), u: M() ? 'm' : 'ft' });
        const t0 = performance.now();
        const res = await runSliced(sim, { slice: 25, signal: job.signal, onProgress: (s) => { prog.value = s.t / (S.duration + S.after) / 60; } });
        job = null; runBtn.disabled = false; stopBtn.hidden = true; prog.hidden = true;
        if (!res) { status.textContent = t('eg.rain.stopped'); return; }
        status.textContent = t('eg.rain.done', { steps: res.steps, sec: fixed((performance.now() - t0) / 1000, 1) });
        const base = shade(dem, ground);
        memo = { project: ctx.project(), version: ctx.project().version, result: res, dem, base };
        show(res, dem, base, out, win);
        ctx.problemsChanged?.();
      }
    });
  }

  function show(res, dem, base, out, win) {
    if (playing) { clearInterval(playing); playing = null; }
    const v = res.volumes, topD = Math.max(0.02, ...[...res.maxDepth].filter(Number.isFinite).slice(0, 0), percentile(res.maxDepth, 0.995));
    const cv = el('canvas', { width: 560, height: Math.round(560 * dem.ny / dem.nx) > 520 ? 520 : Math.round(560 * dem.ny / dem.nx), className: 'cv-eg-canvas', role: 'img', 'aria-label': t('eg.rain.canvas'), 'data-eg-rain-canvas': '' });
    const frameList = res.frames.length ? res.frames : [{ t: res.t, depth: res.endDepth }];
    let cur = 0, mode = S.view || 'play';
    const lab = el('span', { 'aria-live': 'off', 'data-eg-rain-time': '' });
    const slider = el('input', { type: 'range', min: 0, max: frameList.length - 1, value: 0, 'aria-label': t('eg.rain.time'), 'data-eg-rain-slider': '' });
    const draw = () => {
      const d = mode === 'max' ? res.maxDepth : mode === 'end' ? res.endDepth : frameList[cur].depth;
      paintFrame(cv, dem, base, d, topD);
      lab.textContent = mode === 'play' ? t('eg.rain.at', { min: fixed(frameList[cur].t / 60, 0) }) : t(mode === 'max' ? 'eg.rain.maxmap' : 'eg.rain.endmap');
    };
    slider.addEventListener('input', () => { cur = Number(slider.value); mode = 'play'; viewSel.value = 'play'; draw(); });
    const viewSel = el('select', { className: 'select-cc cv-input', 'aria-label': t('eg.rain.view') }, el('option', { value: 'play' }, t('eg.rain.v.play')), el('option', { value: 'max' }, t('eg.rain.v.max')), el('option', { value: 'end' }, t('eg.rain.v.end')));
    viewSel.value = mode; viewSel.addEventListener('change', () => { mode = viewSel.value; S.view = mode; save('eg69', S); draw(); });
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;   // i18n-ignore: media query
    const playBtn = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-eg-rain-play': '' });
    const setPlay = (on) => {
      if (playing) { clearInterval(playing); playing = null; }
      playBtn.replaceChildren(el('i', { className: 'bi bi-' + (on ? 'pause-fill' : 'play-fill'), 'aria-hidden': 'true' })/* i18n-ignore: icon class */, ' ', t(on ? 'eg.rain.pause' : 'eg.rain.play'));
      if (on) playing = setInterval(() => { if (!cv.isConnected) { clearInterval(playing); playing = null; return; } mode = 'play'; viewSel.value = 'play'; cur = (cur + 1) % frameList.length; slider.value = cur; draw(); if (cur === frameList.length - 1) setPlay(false); }, 160);
    };
    playBtn.onclick = () => { if (playing) setPlay(false); else { if (cur >= frameList.length - 1) { cur = 0; slider.value = 0; } setPlay(true); } };
    setPlay(false);
    win.onClose = () => { if (playing) { clearInterval(playing); playing = null; } job?.abort(); };
    cur = reduce ? frameList.length - 1 : 0; slider.value = cur; draw();
    if (!reduce && frameList.length > 1) setPlay(true);

    const cvH = el('canvas', { width: 560, height: 160, className: 'cv-eg-canvas', role: 'img', 'aria-label': t('eg.rain.hydro') });
    const facts = el('div', { className: 'cv-props', 'data-eg-rain-facts': '' },
      ...[[t('eg.rain.f.rain'), fixed(cuOf(v.rain), 0) + ' ' + cuU() + ' (' + fixed(dFromM(v.rain / (res.cells * dem.cellM * dem.cellM)), 1) + ' ' + depthUnit() + ')'],
        [t('eg.rain.f.loss'), fixed(cuOf(v.loss), 0) + ' ' + cuU()], [t('eg.rain.f.out'), fixed(cuOf(v.out), 0) + ' ' + cuU()], [t('eg.rain.f.stored'), fixed(cuOf(v.stored), 0) + ' ' + cuU()],
        [t('eg.rain.f.error'), fixed(v.error * 100, 3) + ' %'], [t('eg.rain.f.peak'), fixed(flowOf(res.peak.q), M() ? 2 : 1) + ' ' + flowU() + ' · ' + fixed(res.peak.t / 60, 0) + ' min'],
        [t('eg.rain.f.deep'), fixed(dFromM(Math.max(...res.maxDepth)), 1) + ' ' + depthUnit()]].flatMap(([k, val]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, val)]));
    const ponds = res.ponds.filter((p) => p.volume > 0).sort((a, b) => b.volume - a.volume).slice(0, 12);
    const pondTab = ponds.length ? table(ctx, [t('eg.rain.p.where'), t('eg.rain.p.cap', { u: cuU() }), t('eg.rain.p.deep', { u: depthUnit() }), t('eg.rain.p.held', { u: cuU() }), t('eg.rain.p.over')],
      ponds.map((p) => [fixed(p.x, 0) + ', ' + fixed(p.y, 0), fixed(cuOf(p.volume), 1), fixed(dFromM(p.maxDepth), 1), fixed(cuOf(p.peakVolume), 1), p.overtopped ? t('eg.rain.p.yes', { min: fixed(p.overtopAt / 60, 0), v: fixed(cuOf(p.spilled), 1), u: cuU() }) : t('eg.rain.p.no')]), 'data-eg-rain-ponds') : el('p', { className: 'cv-note' }, t('eg.rain.p.none'));
    const stem = () => (ctx.fileStem() || 'civilcraft') + '-rain';
    const csvBtn = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-eg-rain-csv': '', onclick: () => {
      ctx.download(stem() + '.csv', new Blob(['﻿' + csv([t('eg.rain.c.min'), t('eg.rain.c.out', { u: flowU() }), t('eg.rain.c.rain', { u: flowU() }), t('eg.rain.c.stored', { u: cuU() })], res.hydrograph.map((r) => [fixed(r.t / 60, 2), fixed(flowOf(r.out), 4), fixed(flowOf(r.rain), 4), fixed(cuOf(r.stored), 2)]))], { type: 'text/csv' }));
      ctx.say(t('eg.saved'));
    } }, el('i', { className: 'bi bi-download', 'aria-hidden': 'true' }), ' CSV');   // i18n-ignore: file type
    out.replaceChildren(el('div', { className: 'cv-row' }, playBtn, slider, lab, viewSel), cv, el('p', { className: 'cv-note' }, t('eg.rain.legend', { d: fixed(dFromM(topD), 1), u: depthUnit() })),
      el('h3', { className: 'cv-h3' }, t('eg.rain.h.balance')), facts, el('h3', { className: 'cv-h3' }, t('eg.rain.h.hydro')), cvH, el('h3', { className: 'cv-h3' }, t('eg.rain.h.ponds')), pondTab, el('div', { className: 'cv-actions' }, csvBtn));
    drawHydro(cvH, res);
  }

  return { open, last, problems };
}

function percentile(arr, q) {
  const a = []; for (let k = 0; k < arr.length; k += Math.max(1, Math.floor(arr.length / 20000))) if (arr[k] > 0) a.push(arr[k]);
  if (!a.length) return 0.02;
  a.sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(q * a.length))];
}
