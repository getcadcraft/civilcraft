/* SPDX-License-Identifier: Apache-2.0 */
/**
 * swept-ui.js — vehicle swept paths in the page (0.6 WL.28; swept.js does the work, docs/spikes/swept-paths.md the method).
 * A swept path drives a vehicle along a feature line or an alignment, forward (its front axle on the line) or reversing
 * (its last axle on the line, drawn in the direction of travel). Everything it changes is one undo step.
 *
 *   createSwept(ctx)   ctx = { root, el, project: () => Project, units: () => 'ft'|'m', say, refocus, select(sel), command(c) }
 *   → { button(kind, id) → a "Swept path…" button for a feature line's or an alignment's Properties,
 *       props(rec) → nodes, find(id), pick(w) → { kind: 'swept', id } | null (inside a swept outline), remove(id),
 *       sceneItems(unitPerMm) (layer C-ROAD-SWPT), overlay(ctx2d, toScreen, colors, sel) (the selected one filled, its
 *       vehicle drawn where the slider puts it), open(from, rec?) (the vehicle dialog), at: Map id → station on show }
 */

import { t } from './i18n.js';
import { VEHICLES, cleanVehicle, bodyOutline, sweptItems, MAX_TRAILERS } from './swept.js';
import { fixed } from './units.js';

export function createSwept(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const list = () => P().state.swept || [];
  const find = (id) => list().find((x) => x.id === id) || null;
  const at = new Map();
  const uS = () => (U() === 'm' ? 'm' : 'ft');

  function save(rec, label) {
    const p = P();
    if (!rec.id) rec.id = p.nextId('w');
    p.change(label, (s) => { s.swept = s.swept || []; const i = s.swept.findIndex((x) => x.id === rec.id); if (i >= 0) s.swept[i] = rec; else s.swept.push(rec); });
    return rec.id;
  }

  function button(kind, id) {
    return el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-sw-new': kind + ':' + id, onclick: () => open({ kind, id }) }, el('i', { className: 'bi bi-truck', 'aria-hidden': 'true' }), ' ', t('sw.new'));
  }

  /** The vehicle dialog: a placeholder vehicle to start from, every size editable, up to three trailers, forward or reversing. */
  function open(from, was = null) {
    const presets = VEHICLES(U());
    let v = JSON.parse(JSON.stringify(was?.vehicle || presets[3]));
    let mode = was?.mode || 'forward';
    const id = 'cv-sw-dlg';
    const name = el('input', { type: 'text', className: 'cv-input', id: id + '-name', value: was?.name || '', maxLength: 80, placeholder: t('sw.f.name.ph') });
    const preset = el('select', { className: 'cv-select', id: id + '-preset', 'data-sw-preset': '' }, el('option', { value: '' }, t('sw.f.preset.keep')), ...presets.map((q) => el('option', { value: q.key }, q.name)));
    const modeSel = el('select', { className: 'cv-select', id: id + '-mode', 'data-sw-mode': '' }, el('option', { value: 'forward' }, t('sw.mode.forward')), el('option', { value: 'reverse' }, t('sw.mode.reverse')));
    modeSel.value = mode;
    const body = el('div', { 'data-sw-sizes': '' }), note = el('p', { className: 'cv-note', 'aria-live': 'polite', 'data-sw-check': '' });
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-sw-go': '' }, t(was ? 'sw.save' : 'sw.add'));
    const closeBtn = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('sw.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const num = (obj, key, label, unit, idk) => {
      const inp = el('input', { type: 'text', className: 'cv-input', id: id + '-' + idk, inputMode: 'decimal', value: String(obj[key]), style: 'width:6rem' });
      inp.addEventListener('input', () => { const x = Number(inp.value); if (inp.value.trim() !== '' && Number.isFinite(x)) { obj[key] = x; inp.removeAttribute('aria-invalid'); } else inp.setAttribute('aria-invalid', 'true'); check(); });
      return [el('label', { for: inp.id }, label), el('div', { className: 'cv-row' }, inp, el('span', { className: 'cv-unit' }, unit))];
    };
    function build() {
      const parts = [el('h3', { className: 'cv-h3' }, t('sw.f.tractor')), el('div', { className: 'cv-props' },
        ...num(v, 'width', t('sw.f.width'), uS(), 'width'), ...num(v, 'front', t('sw.f.front'), uS(), 'front'), ...num(v, 'wheelbase', t('sw.f.wheelbase'), uS(), 'wheelbase'),
        ...num(v, 'rear', t('sw.f.rear'), uS(), 'rear'), ...num(v, 'track', t('sw.f.track'), uS(), 'track'), ...num(v, 'maxSteer', t('sw.f.steer'), '°', 'steer'))];
      v.trailers.forEach((tr, i) => {
        parts.push(el('h3', { className: 'cv-h3' }, t('sw.f.trailer', { n: i + 1 }), ' ',
          el('button', { type: 'button', className: 'cv-linkbtn', 'data-sw-trailer-remove': String(i), onclick: () => { v.trailers.splice(i, 1); build(); } }, t('sw.f.trailer.remove'))));
        parts.push(el('div', { className: 'cv-props' },
          ...num(tr, 'hitch', t('sw.f.hitch'), uS(), 'hitch' + i), ...num(tr, 'wheelbase', t('sw.f.twheelbase'), uS(), 'twb' + i), ...num(tr, 'front', t('sw.f.tfront'), uS(), 'tfront' + i),
          ...num(tr, 'rear', t('sw.f.rear'), uS(), 'trear' + i), ...num(tr, 'width', t('sw.f.width'), uS(), 'twidth' + i), ...num(tr, 'track', t('sw.f.track'), uS(), 'ttrack' + i),
          ...num(tr, 'maxArticulation', t('sw.f.art'), '°', 'tart' + i)));
      });
      if (v.trailers.length < MAX_TRAILERS) parts.push(el('button', { type: 'button', className: 'cv-linkbtn', 'data-sw-trailer-add': '', onclick: () => { v.trailers.push({ hitch: U() === 'm' ? 1.5 : 5, wheelbase: U() === 'm' ? 4 : 12, front: U() === 'm' ? 1 : 3, rear: U() === 'm' ? 1 : 3, width: v.width, track: v.track, maxArticulation: 80 }); build(); } }, t('sw.f.trailer.add')));
      body.replaceChildren(...parts);
      check();
    }
    function check() {
      const c = cleanVehicle(v, U());
      go.disabled = !c;
      note.textContent = c ? '' : t('sw.f.bad');
    }
    preset.addEventListener('change', () => { const q = presets.find((x) => x.key === preset.value); if (q) { v = JSON.parse(JSON.stringify(q)); if (!name.value.trim()) name.placeholder = q.name; build(); } });
    modeSel.addEventListener('change', () => { mode = modeSel.value; });
    const dlg = el('dialog', { className: 'cv-dialog cv-swdlg', 'aria-labelledby': id + '-h', 'data-sw-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t(was ? 'sw.title.edit' : 'sw.title.new')), closeBtn),
        el('div', { className: 'cv-dlg-body' },
          el('div', { className: 'cv-props' }, el('label', { for: name.id }, t('sw.f.name')), name, el('label', { for: preset.id }, t('sw.f.preset')), preset, el('label', { for: modeSel.id }, t('sw.f.mode')), modeSel),
          el('p', { className: 'cv-note' }, t('sw.mode.note')),
          body, note,
          el('p', { className: 'cv-note' }, t('sw.placeholders'))),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('sw.cancel')), go)));
    closeBtn.onclick = () => dlg.close();
    go.onclick = () => {
      const c = cleanVehicle(v, U());
      if (!c) return;
      c.key = v.key;
      const rec = { id: was?.id || null, name: name.value.trim().slice(0, 80) || c.name, vehicle: c, mode, from: was?.from || from };
      const nid = save(rec, t(was ? 'sw.undo.edit' : 'sw.undo.add', { name: rec.name }));
      dlg.close();
      ctx.select({ kind: 'swept', id: nid });
      const r = P().sweptOf(find(nid));
      ctx.say(r ? t(r.sim.problems.length ? 'sw.done.problems' : 'sw.done', { name: rec.name, n: r.sim.problems.length }) : t('sw.noline'));
    };
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    ctx.root.append(dlg);
    build();
    dlg.showModal();
    name.focus();
  }

  function lineName(rec) {
    const s = P().state;
    const x = rec.from.kind === 'feature' ? (s.features || []).find((f) => f.id === rec.from.id) : s.alignments.find((a) => a.id === rec.from.id);
    return x?.name || null;
  }

  function props(rec) {
    const out = [], r = P().sweptOf(rec), id = rec.id;
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-sw-name', value: rec.name, maxLength: 80 });
    nm.addEventListener('change', () => save({ ...rec, name: nm.value.trim().slice(0, 80) || rec.name }, t('sw.undo.rename')));
    const mode = el('select', { className: 'cv-select', id: 'cv-sw-mode', 'data-sw-props-mode': '' }, el('option', { value: 'forward' }, t('sw.mode.forward')), el('option', { value: 'reverse' }, t('sw.mode.reverse')));
    mode.value = rec.mode;
    mode.addEventListener('change', () => {
      save({ ...rec, mode: mode.value }, t('sw.undo.mode'));
      const r2 = P().sweptOf(find(id));
      if (r2) ctx.say(t(r2.sim.problems.length ? 'sw.done.problems' : 'sw.done', { name: rec.name, n: r2.sim.problems.length }));
    });
    const ln = lineName(rec);
    out.push(el('div', { className: 'cv-props' },
      el('label', { for: 'cv-sw-name' }, t('sw.f.name')), nm,
      el('label', { for: 'cv-sw-mode' }, t('sw.f.mode')), mode,
      el('span', { className: 'k' }, t('sw.p.line')), ln ? el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: rec.from.kind, id: rec.from.id }) }, ln) : el('span', { className: 'v' }, t('sw.noline.short')),
      el('span', { className: 'k' }, t('sw.p.vehicle')), el('span', { className: 'v' }, rec.vehicle.name + (rec.vehicle.trailers.length ? ' ' + t('sw.p.trailers', { n: rec.vehicle.trailers.length }) : ''))));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-sw-edit': '', onclick: () => open(rec.from, rec) }, t('sw.edit'))));
    if (!r) { out.push(el('p', { className: 'cv-report is-error' }, t('sw.noline'))); return out; }
    const { sim, env } = r, area = U() === 'm' ? t('sw.area.m', { a: fixed(env.area, 1) }) : t('sw.area.ft', { a: fixed(env.area, 0) });
    const facts = [
      [t('sw.p.length'), fixed(sim.length, 2) + ' ' + uS()],
      [t('sw.p.steer'), t('sw.p.of', { v: fixed(sim.maxSteer, 1), max: fixed(rec.vehicle.maxSteer, 1) })],
      ...sim.maxArt.map((a, i) => [t('sw.p.art', { n: i + 1 }), t('sw.p.of', { v: fixed(a, 1), max: fixed(rec.vehicle.trailers[i].maxArticulation, 1) })]),
      [t('sw.p.area'), area],
    ];
    out.push(el('div', { className: 'cv-props', 'data-sw-facts': '' }, ...facts.flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, v)])));
    const probs = sim.problems.map((p) => t('sw.prob.' + p.kind, { s: fixed(p.s, 1), v: fixed(Math.abs(p.value), 1), max: fixed(p.limit, 1), n: p.unit || 0, u: uS() }));
    out.push(probs.length ? el('div', { className: 'cv-report is-error', 'data-sw-problems': '' }, el('ul', {}, ...probs.map((x) => el('li', {}, x)))) : el('p', { className: 'cv-note', 'data-sw-ok': '' }, t('sw.ok')));
    // the vehicle anywhere along the path
    const slider = el('input', { type: 'range', id: 'cv-sw-at', min: 0, max: String(sim.length), step: 'any', value: String(Math.min(at.get(id) ?? sim.length, sim.length)), 'data-sw-at': '', 'aria-label': t('sw.at') });
    const readout = el('output', { for: 'cv-sw-at', 'data-sw-at-out': '' });
    const show = () => {
      const s = Number(slider.value); at.set(id, s);
      const f = frameAt(sim, s);
      readout.textContent = f ? t('sw.at.out', { s: fixed(f.s, 1), u: uS(), steer: fixed(Math.abs(f.steer), 1), art: f.art.length ? f.art.map((a) => fixed(Math.abs(a), 1) + '°').join(', ') : '—' }) : '';
      ctx.redraw();
    };
    slider.addEventListener('input', show);
    out.push(el('label', { className: 'cv-block-label', for: 'cv-sw-at' }, t('sw.at')), slider, readout);
    show();
    out.push(el('p', { className: 'cv-note' }, t('sw.p.note')));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => ctx.command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    return out;
  }

  function frameAt(sim, s) {
    const F = sim.frames;
    if (!F.length) return null;
    let lo = 0, hi = F.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (F[m].s <= s) lo = m; else hi = m; }
    return Math.abs(F[hi].s - s) < Math.abs(F[lo].s - s) ? F[hi] : F[lo];
  }

  function pick(w) {
    for (const rec of list().slice().reverse()) {
      const r = P().sweptOf(rec);
      if (!r) continue;
      let inside = false;
      for (const L of r.env.loops) {   // even-odd over every loop: holes count out
        for (let i = 0, j = L.length - 1; i < L.length; j = i++) if ((L[i].y > w.y) !== (L[j].y > w.y) && w.x < ((L[j].x - L[i].x) * (w.y - L[i].y)) / (L[j].y - L[i].y) + L[i].x) inside = !inside;
      }
      if (inside) return { kind: 'swept', id: rec.id };
    }
    return null;
  }

  function sceneItems(unitPerMm) {
    const out = [];
    for (const rec of list()) { const r = P().sweptOf(rec); if (r) out.push(...sweptItems(rec.name, r.sim, r.env, unitPerMm)); }
    return out;
  }

  function overlay(c2d, toScreen, C, sel) {
    const rec = sel?.kind === 'swept' ? find(sel.id) : null, r = rec && P().sweptOf(rec);
    if (!r) return;
    c2d.save();
    c2d.fillStyle = C.orange || C.action; c2d.globalAlpha = 0.16; c2d.beginPath();
    for (const L of r.env.loops) L.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
    c2d.fill('evenodd'); c2d.globalAlpha = 1;
    // the vehicle where the slider is
    const f = frameAt(r.sim, at.get(rec.id) ?? r.sim.length);
    if (f) {
      for (let i = 0; i < f.units.length; i++) {
        const b = bodyOutline(rec.vehicle, f, i);
        c2d.strokeStyle = C.action; c2d.lineWidth = 2; c2d.fillStyle = C.bg; c2d.beginPath();
        b.forEach((p, k) => { const q = toScreen(p.x, p.y); k ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
        c2d.closePath(); c2d.globalAlpha = 0.35; c2d.fill(); c2d.globalAlpha = 1; c2d.stroke();
      }
    }
    c2d.restore();
  }

  function remove(id) {
    const rec = find(id);
    if (!rec) return false;
    P().change(t('sw.undo.delete', { name: rec.name }), (s) => { s.swept = s.swept.filter((x) => x.id !== id); });
    ctx.say(t('sw.deleted', { name: rec.name }));
    return true;
  }

  return { button, props, find, pick, remove, sceneItems, overlay, open, at };
}
