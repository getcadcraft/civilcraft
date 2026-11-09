/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Scan to BIM add-on (0.9 SU.1132, session `scan-bim-09`): floors, walls, doors and windows PROPOSED from a point cloud already open in BimCraft (the Point clouds
 * add-on's), each with its measured distance from the scanned points. Nothing changes the model until the person accepts; Accept draws the ticked proposals as ONE undo step.
 * The engine is lib/engine.js (DOM-free, tested in Node on synthetic clouds); the host adapter (host.js) reads the cloud and writes the model.
 * Panel: Cloud → Find floors → pick a floor (floor and ceiling heights can be typed) → Propose → table of proposals (tick, edit, reject) → Show on plan / Accept / Reject.
 */
import { ZHistogram, storeysFromPlanes, proposeStorey, DEFAULTS } from './lib/engine.js';
import * as hostMod from './host.js';

export function activate(api) {
  const t = (k, v) => api.t(k, v);
  const host = typeof hostMod.detect === 'function' ? hostMod.detect(api, { t }) : null;
  const R = { storeys: null, pick: 0, S: null, error: '', message: '', busy: '', info: null, planes: null, thickness: DEFAULTS.thickness, previewed: false };
  let pane = null, styleEl = null;
  const failure = (e) => (e && e.key ? t(e.key, e.vars || {}) : String((e && e.message) || e));
  const fmt = (x, d = 0) => (Number.isFinite(x) ? x.toFixed(d) : '-');
  const say = (m) => { try { api.print(m); } catch { /* no history */ } };
  const tick = () => new Promise((r) => setTimeout(r, 20));

  // ------------------------------------------------------------------------------------------------ the work
  async function findFloors() {
    R.error = ''; R.message = ''; R.S = null; R.busy = t('busy.floors'); render(); await tick();
    try {
      const d = await host.histogram((f) => { R.busy = t('busy.floors') + ' ' + Math.round(f * 100) + ' %'; });
      const planes = ZHistogram.fromData(d).planes();
      R.planes = planes; R.storeys = storeysFromPlanes(planes).map((s) => ({ ...s, on: true }));
      R.pick = 0;
      if (!R.storeys.length) R.error = t('err.noplanes');
    } catch (e) { R.error = failure(e); }
    R.busy = ''; render();
  }
  function levelFor(s) {
    return host.levels().then((ls) => {
      const near = (ls || []).find((l) => Math.abs(l.elevation - s.floor) <= 150);
      return near ? { guid: near.guid, name: near.name, elevation: near.elevation, height: near.height, exists: true } : { guid: null, name: t('level.new', { n: (R.pick || 0) + 1 }), elevation: Math.round(s.floor), height: Math.round(s.height || 2700), exists: false };
    });
  }
  async function propose() {
    const s = R.storeys && R.storeys[R.pick];
    if (!s) return;
    R.error = ''; R.message = ''; R.busy = t('busy.propose'); R.S = null; await host.clearPreview(); R.previewed = false; render(); await tick();
    try {
      const P = await host.points(s.floor, s.ceiling);
      if (P.n < 1000) throw Object.assign(new Error('err.fewpoints'), { key: 'err.fewpoints', vars: { n: P.n } });
      const S = proposeStorey(P, { floor: s.floor, ceiling: s.ceiling }, { thickness: Number(R.thickness) || DEFAULTS.thickness });
      S.level = await levelFor(s); S.points = P.n; S.total = P.total;
      for (const w of S.walls) w.on = true;
      for (const o of S.openings) o.on = true;
      for (const f of S.floors) f.on = true;
      R.S = S;
      R.message = t('done.propose', { w: S.walls.length, o: S.openings.length, f: S.floors.length });
      say(R.message);
    } catch (e) { R.error = failure(e); }
    R.busy = ''; render();
  }
  const chosen = () => {
    const S = R.S, on = S.walls.filter((w) => w.on);
    return { level: S.level, walls: on, openings: S.openings.filter((o) => o.on && on.some((w) => w.id === o.wall)), floors: S.floors.filter((f) => f.on) };
  };
  async function preview() {
    try { await host.preview(R.S.level.guid || (await host.levels())[0]?.guid, { walls: R.S.walls, openings: R.S.openings }); R.previewed = true; R.message = t('done.preview'); } catch (e) { R.error = failure(e); }
    render();
  }
  async function accept() {
    R.error = ''; R.message = '';
    try {
      const spec = chosen();
      if (!spec.walls.length && !spec.floors.length) throw Object.assign(new Error('err.nothing'), { key: 'err.nothing' });
      await host.clearPreview();
      const r = await host.accept(spec);
      R.message = t('done.accept', { w: r.walls, o: r.openings, f: r.floors });
      say(R.message); R.S = null; R.previewed = false;
    } catch (e) { R.error = failure(e); }
    render();
  }
  async function reject() { await host.clearPreview(); R.S = null; R.previewed = false; R.message = t('done.reject'); render(); }

  // ------------------------------------------------------------------------------------------------ the panel
  const CSS = `.sb { font-size: .85rem; padding: .25rem .1rem; } .sb h4 { font-size: .8rem; margin: .8rem 0 .3rem; font-weight: 600; text-transform: none; }
.sb .sb-row { display: flex; flex-wrap: wrap; gap: .4rem .8rem; align-items: center; margin: .25rem 0; } .sb label { display: inline-flex; flex-wrap: wrap; gap: .3rem; align-items: center; max-width: 100%; }
.sb input[type=number] { width: 5rem; } .sb .sb-note { opacity: .75; } .sb .sb-err { color: #b91c1c; font-weight: 600; } .sb .sb-warn { color: #92400e; } .sb .sb-ok { color: #166534; }
.sb table { border-collapse: collapse; width: 100%; } .sb td, .sb th { padding: .1rem .5rem .1rem 0; text-align: left; font-weight: normal; vertical-align: middle; } .sb th { opacity: .75; font-size: .75rem; }
.sb tr.sb-off td { opacity: .45; }`;
  const h = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v === null || v === undefined) continue;
      if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else if (k === 'value') n.value = v; else if (k === 'checked' || k === 'selected' || k === 'disabled') n[k] = !!v; else n.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
    return n;
  };
  const num = (obj, key, o = {}) => h('input', { type: 'number', value: obj[key], step: o.step ?? 1, min: o.min, 'aria-label': o.label, 'data-sb-edit': o.id, onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v)) { obj[key] = v; if (o.after) o.after(); } else e.target.value = obj[key]; } });
  const dev = (d) => (d && d.rms != null ? fmt(d.rms, 1) + ' mm' : '-');

  let rendering = false, again = false;
  function render() {
    if (!pane) return;
    if (rendering) { again = true; return; }   // replacing the panel blurs the field being edited, which can fire change: draw once more afterwards
    rendering = true;
    try { draw(); } finally { rendering = false; }
    if (again) { again = false; render(); }
  }
  function draw() {
    const kids = [];
    kids.push(h('p', { class: 'sb-note' }, t('intro')));
    const info = host ? host.cloudInfo() : null;
    R.info = info;
    kids.push(h('h4', {}, t('sec.cloud')));
    if (!host) kids.push(h('p', { class: 'sb-err' }, t('host.none')));
    else if (!info) kids.push(h('p', { class: 'sb-warn', 'data-sb-nocloud': '' }, t('cloud.none')));
    else kids.push(h('p', { 'data-sb-cloud': '' }, t('cloud.open', { n: info.count.toLocaleString(), how: t('cloud.how.' + info.how) })));
    kids.push(h('div', { class: 'sb-row' }, h('button', { type: 'button', class: 'btn-plot btn-sm-cc', 'data-sb': 'floors', disabled: !info || !!R.busy, onclick: findFloors }, t('act.floors'))));
    if (R.busy) kids.push(h('p', { class: 'sb-note', 'data-sb-busy': '', role: 'status' }, R.busy));
    if (R.error) kids.push(h('p', { class: 'sb-err', role: 'alert', 'data-sb-error': '' }, R.error));
    if (R.message) kids.push(h('p', { class: 'sb-ok', 'data-sb-message': '', role: 'status' }, R.message));

    if (R.storeys && R.storeys.length) {
      kids.push(h('h4', {}, t('sec.floors')));
      kids.push(h('p', { class: 'sb-note' }, t('floors.note')));
      kids.push(h('table', { 'data-sb-storeys': '' }, h('tr', {}, h('th', {}, ''), h('th', {}, t('f.floor')), h('th', {}, t('f.ceiling')), h('th', {}, t('f.height')), h('th', {}, t('f.seen'))),
        R.storeys.map((s, i) => h('tr', {}, h('td', {}, h('input', { type: 'radio', name: 'sb-pick', checked: R.pick === i, 'aria-label': t('f.pick', { n: i + 1 }), onchange: () => { R.pick = i; R.S = null; render(); } })),
          h('td', {}, num(s, 'floor', { label: t('f.floor'), id: 'floor' + i, after: () => { s.height = s.ceiling != null ? s.ceiling - s.floor : null; } }), ' mm'),
          h('td', {}, s.ceiling != null ? num(s, 'ceiling', { label: t('f.ceiling'), id: 'ceiling' + i, after: () => { s.height = s.ceiling - s.floor; render(); } }) : '-', s.ceiling != null ? ' mm' : ''),
          h('td', {}, s.height != null ? fmt(s.height) + ' mm' : '-'), h('td', { class: 'sb-note' }, s.note)))));
      kids.push(h('div', { class: 'sb-row' }, h('label', {}, t('f.thickness'), h('input', { type: 'number', value: R.thickness, min: 50, max: 600, 'data-sb': 'thickness', onchange: (e) => { R.thickness = Number(e.target.value) || DEFAULTS.thickness; } }), h('span', { class: 'sb-note' }, 'mm')),
        h('button', { type: 'button', class: 'btn-plot btn-sm-cc', 'data-sb': 'propose', disabled: !!R.busy, onclick: propose }, t('act.propose'))));
    }

    const S = R.S;
    if (S) {
      kids.push(h('h4', {}, t('sec.proposals')));
      kids.push(h('p', { class: 'sb-note', 'data-sb-level': '' }, S.level.exists ? t('level.exists', { name: S.level.name }) : t('level.create', { name: S.level.name, z: fmt(S.level.elevation) })));
      kids.push(h('p', { class: 'sb-note' }, t('proposals.note', { n: S.points.toLocaleString(), slice: S.slice.n.toLocaleString() })));
      if (S.walls.length) {
        kids.push(h('table', { 'data-sb-walls': '' }, h('tr', {}, h('th', {}, ''), h('th', {}, t('col.wall')), h('th', {}, t('col.length')), h('th', {}, t('col.thickness')), h('th', {}, t('col.height')), h('th', {}, t('col.dev'))),
          S.walls.map((w) => h('tr', { class: w.on ? '' : 'sb-off', 'data-sb-wall': w.id },
            h('td', {}, h('input', { type: 'checkbox', checked: w.on, 'aria-label': t('col.accept', { id: w.id }), onchange: (e) => { w.on = e.target.checked; render(); } })), h('td', {}, w.id),
            h('td', {}, fmt(Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1])) + ' mm'),
            h('td', {}, num(w, 'thickness', { min: 50, label: t('col.thickness'), id: 'th-' + w.id, after: () => { w.thicknessFrom = 'edited'; render(); } }), ' ', h('span', { class: 'sb-note', title: t('from.' + w.thicknessFrom + '.tip') }, t('from.' + w.thicknessFrom))),
            h('td', {}, num(w, 'height', { min: 300, label: t('col.height'), id: 'h-' + w.id, after: () => { w.heightFrom = 'edited'; render(); } }), ' ', h('span', { class: 'sb-note', title: t('hfrom.' + w.heightFrom + '.tip') }, t('hfrom.' + w.heightFrom))),
            h('td', {}, dev(w.deviation), h('span', { class: 'sb-note' }, ' (' + w.deviation.n + ')'))))));
      } else kids.push(h('p', { class: 'sb-warn', 'data-sb-nowalls': '' }, t('walls.none')));
      if (S.openings.length) {
        kids.push(h('h4', {}, t('sec.openings')));
        kids.push(h('table', { 'data-sb-openings': '' }, h('tr', {}, h('th', {}, ''), h('th', {}, t('col.kind')), h('th', {}, t('col.on')), h('th', {}, t('col.offset')), h('th', {}, t('col.width')), h('th', {}, t('col.sill')), h('th', {}, t('col.height')), h('th', {}, t('col.dev'))),
          S.openings.map((o) => h('tr', { class: o.on ? '' : 'sb-off', 'data-sb-opening': o.id },
            h('td', {}, h('input', { type: 'checkbox', checked: o.on, 'aria-label': t('col.accept', { id: o.id }), onchange: (e) => { o.on = e.target.checked; render(); } })), h('td', {}, t('kind.' + o.kind)), h('td', {}, o.wall),
            h('td', {}, num(o, 'offset', { min: 0, label: t('col.offset'), id: 'of-' + o.id })), h('td', {}, num(o, 'width', { min: 300, label: t('col.width'), id: 'wi-' + o.id })),
            h('td', {}, o.kind === 'door' ? '0' : num(o, 'sill', { min: 0, label: t('col.sill'), id: 'si-' + o.id })), h('td', {}, num(o, 'height', { min: 300, label: t('col.height'), id: 'oh-' + o.id })),
            h('td', {}, dev(o.deviation), o.deviation.inside ? h('span', { class: 'sb-warn' }, ' ' + t('col.inside', { n: o.deviation.inside })) : null)))));
      }
      if (S.floors.length) {
        kids.push(h('h4', {}, t('sec.floorslabs')));
        kids.push(h('table', { 'data-sb-floors': '' }, h('tr', {}, h('th', {}, ''), h('th', {}, t('col.floor')), h('th', {}, t('col.area')), h('th', {}, t('col.z')), h('th', {}, t('col.dev'))),
          S.floors.map((f) => h('tr', { class: f.on ? '' : 'sb-off', 'data-sb-floor': f.id },
            h('td', {}, h('input', { type: 'checkbox', checked: f.on, 'aria-label': t('col.accept', { id: f.id }), onchange: (e) => { f.on = e.target.checked; render(); } })), h('td', {}, f.id), h('td', {}, fmt(f.area, 2) + ' m²'), h('td', {}, fmt(f.z) + ' mm'), h('td', {}, dev(f.deviation), h('span', { class: 'sb-note' }, ' (' + f.deviation.n + ')'))))));
      }
      kids.push(h('ul', { class: 'sb-note' }, [...S.problems.map((p) => p.text), ...S.notes].map((x) => h('li', {}, x))));
      kids.push(h('div', { class: 'sb-row', style: 'margin-top:.6rem' },
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-sb': 'preview', onclick: preview }, t('act.preview')),
        h('button', { type: 'button', class: 'btn-plot btn-sm-cc', 'data-sb': 'accept', onclick: accept }, t('act.accept')),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-sb': 'reject', onclick: reject }, t('act.reject'))));
    }
    kids.push(h('p', { class: 'sb-note' }, t('disclaimer')));
    pane.replaceChildren(h('div', { class: 'sb', 'data-sb-root': '' }, kids));
  }

  styleEl = document.createElement('style'); styleEl.textContent = CSS; document.head.append(styleEl);
  api.ui.panelTab({ id: 'scanbim', title: t('tab'), render: (el) => { pane = el; render(); } });
  api.onDeactivate(() => { pane = null; try { styleEl.remove(); } catch { /* no page */ } if (host) host.clearPreview(); });
  window.ccScanBim = { state: R, propose, findFloors, accept, reject, preview, render, host, api };   // for the tests and the console
  api.log('Scan to BIM ready');   // i18n-ignore (developer log)
}
