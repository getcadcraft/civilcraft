/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ui.js — the CabinetCraft panel (0.8 DC.117, session `cabinetcraft_addon`): the DOM side. Everything it shows comes from the pure
 * modules; every edit goes through edit.js and comes back as a new, cleaned job. It makes elements with createElement/textContent
 * only (a person's text is never parsed as HTML); the drawings are SVG text the drawings module wrote and escaped.
 *
 *   mountPanel(pane, app) — app = { get() → state, change(project), setView(v), run(fn), t, download(name, data, mime), pickFile(accept) → text | null,
 *                                  nest(), gcode(opts) → files, analysis() → analyze result, say, word, problemsOn }
 *   state = { project, view, run, edit, drawing, isoView, nest, post, tool, template, msg }
 */
import { TEMPLATES, widthsFor, listTemplates, templateById, rowOf, resolveEntry } from './catalog.js';
import { MATERIALS, BANDS, DEFAULT_PICKS } from './materials.js';
import { RULES, rulesFor } from './model.js';
import { WALLS, wallLength, wallIds, newProject } from './project.js';
import { walls as roomWalls, roomPts, roomOutline, outlineOf } from './room.js';
import { hwOf } from './cornerdrill.js';
import { rateSheetCsv } from './estimate.js';
import * as E from './edit.js';
import { ratesOf, changedPaths } from './estimate.js';
import { sheetSet, sheetSetHtml } from './drawings.js';
import * as X from './export.js';
import { fmtLen, conv } from './core.js';
import { TEMPLATES as LABELS } from './cutlist/labels.js';

export const VIEWS = ['job', 'room', 'layout', 'materials', 'checks', 'cost', 'drawings', 'export'];
export const NOTCH_AT = { L: ['NE', 'NW', 'SE', 'SW'], U: ['N', 'S', 'E', 'W'] };

export function mountPanel(pane, app) {
  const doc = pane.ownerDocument;
  const t = app.t;
  const st = () => app.get();
  const h = (tag, attrs = {}, ...kids) => {
    const n = doc.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') n.className = v; else if (k === 'on') for (const [ev, fn] of Object.entries(v)) n.addEventListener(ev, fn);
      else if (k === 'value') n.value = v; else if (k === 'checked') n.checked = !!v; else if (k === 'text') n.textContent = v;
      else n.setAttribute(k, v === true ? '' : String(v));
    }
    for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) n.append(kid.nodeType ? kid : doc.createTextNode(String(kid)));
    return n;
  };
  const P = () => st().project;
  const wallLabel = (id) => (/^[SENW]$/.test(id) ? t('wall.' + id) : t('wall.n', { n: String(id).slice(1) }));
  const U = () => (P().unit === 'in' ? 'in' : 'mm');
  const F = (v) => fmtLen(v, P().unit);
  const btn = (label, fn, extra = {}) => h('button', { type: 'button', class: 'pc-btn', on: { click: fn }, ...extra }, label);
  const field = (label, input, cls = '') => h('label', { class: 'cc-field ' + cls, style: 'display:grid;gap:2px;font-size:0.8rem;margin:4px 0' }, h('span', {}, label), input);
  const numIn = (value, on, { min = 0, step = 'any', attrs = {} } = {}) => { const i = h('input', { type: 'number', class: 'pc-input', value: value ?? '', min, step, ...attrs }); i.addEventListener('change', () => on(i.value === '' ? null : Number(i.value))); return i; };
  const textIn = (value, on, attrs = {}) => { const i = h('input', { type: 'text', class: 'pc-input', value: value ?? '', maxlength: 60, ...attrs }); i.addEventListener('change', () => on(i.value)); return i; };
  const sel = (opts, cur, on, attrs = {}) => { const s = h('select', { class: 'pc-select', ...attrs }, ...opts.map(([v, l]) => h('option', { value: v, ...(String(v) === String(cur) ? { selected: true } : {}) }, l))); s.addEventListener('change', () => on(s.value)); return s; };
  const row2 = (...x) => h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:6px' }, ...x);
  const set = (fn) => app.change(fn(P()));

  const body = h('div', { class: 'cc-body', style: 'padding:8px', 'data-cabinetcraft': '' });
  const add = (...x) => body.append(...x.flat().filter((n) => n !== null && n !== undefined && n !== false));   // never append(null): a browser would write the word "null"
  const tabs = h('div', { role: 'tablist', style: 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px' }, ...VIEWS.map((v) => h('button', { type: 'button', role: 'tab', class: 'pc-btn' + (st().view === v ? ' is-primary' : ''), 'aria-selected': st().view === v ? 'true' : 'false', 'data-cc-view': v, on: { click: () => app.setView(v) } }, t('view.' + v))));
  const msg = st().msg ? h('p', { class: 'cc-msg', 'aria-live': 'polite', style: 'font-size:0.8rem;margin:6px 0', 'data-cc-msg': '' }, st().msg) : null;
  pane.append(h('div', {}, tabs, msg, body));
  const V = { job, room, layout, materials, checks, cost, drawings, export: exportView };
  (V[st().view] || layout)();

  // ---------------------------------------------------------------------------------------------- job
  function job() {
    const p = P();
    add(
      h('p', { style: 'font-size:0.8rem' }, t('job.intro')),
      field(t('job.name'), textIn(p.name, (v) => set((q) => E.setProject(q, { name: v })))),
      row2(field(t('job.unit'), sel([['mm', t('unit.mm')], ['in', t('unit.in')]], p.unit, (v) => set((q) => E.setUnit(q, v)))),
        field(t('job.construction'), sel([['frameless', t('con.frameless')], ['faceframe', t('con.faceframe')]], p.construction, (v) => set((q) => E.setProject(q, { construction: v }))))),
      h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:6px 0' }, h('legend', { style: 'font-size:0.8rem' }, t('job.room', { unit: U() })),
        field(t('job.room.h'), numIn(p.room.h, (v) => set((q) => E.setProject(q, { room: { h: v } })), { min: 1 })), h('p', { style: 'font-size:0.75rem;opacity:0.8' }, t('job.room.note')),
        btn(t('job.room.edit'), () => app.setView('room'), { 'data-cc-to-room': '' })),
      h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' },
        btn(t('job.new'), () => app.change(newProject(p.unit), { reset: true }), { 'data-cc-new': '' }),
        btn(t('job.sample'), () => app.change(app.sample(p.unit), { reset: true }), { 'data-cc-sample': '' }),
        btn(t('job.open'), async () => { const x = await app.pickFile('.json,application/json'); if (x) app.load(x); }, { 'data-cc-open': '' }),
        btn(t('job.save'), () => app.download((p.name || 'job') + '.cabinetcraft.json', X.jobJson(p), 'application/json'), { 'data-cc-save': '' })),
      h('p', { style: 'font-size:0.75rem;opacity:0.8;margin-top:8px' }, t('job.kept')));
  }

  // ---------------------------------------------------------------------------------------------- room
  function room() {
    const p = P(), rm = p.room, s = st();
    const an = app.analysis();
    const sr = (patch) => set((q) => E.setProject(q, { room: patch }));
    const fs = (title, ...kids) => h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:6px 0' }, h('legend', { style: 'font-size:0.8rem' }, title), ...kids);
    const hr = app.hostRoomInfo();
    const fromModel = hr ? [fs(hr.label, h('p', { style: 'font-size:0.75rem' }, hr.note || ''),
      btn(t('hostroom.find'), () => app.hostRooms(), { 'data-cc-hostroom-find': '' }),
      s.hostRooms ? (s.hostRooms.length ? h('div', { 'data-cc-hostroom-list': String(s.hostRooms.length), style: 'display:grid;gap:4px;margin:4px 0' }, ...s.hostRooms.map((r) => h('div', { style: 'display:flex;gap:6px;align-items:center;font-size:0.8rem' }, h('span', { style: 'flex:1' }, r.label), btn(t('hostroom.use'), () => app.useHostRoom(r.id), { 'data-cc-hostroom-use': String(r.id) }))))
        : h('p', { style: 'font-size:0.75rem', 'data-cc-hostroom-none': '' }, s.hostRoomsErr || t('hostroom.none'))) : null)] : [];
    const dims = [row2(field(t('job.room.w'), numIn(rm.w, (v) => sr({ w: v }), { min: 1, attrs: { 'data-cc-room': 'w' } })), field(t('job.room.d'), numIn(rm.d, (v) => sr({ d: v }), { min: 1, attrs: { 'data-cc-room': 'd' } })))];
    const nt = rm.notch;
    const sn = (patch) => set((q) => E.setRoomNotch(q, patch));
    const shapeFields = rm.shape === 'L' || rm.shape === 'U' ? [
      h('p', { style: 'font-size:0.75rem;opacity:0.8' }, t(rm.shape === 'L' ? 'room.l.note' : 'room.u.note')),
      row2(field(t('room.notch.w'), numIn(nt.w, (v) => sn({ w: v }), { min: 1, attrs: { 'data-cc-notch': 'w' } })), field(t('room.notch.d'), numIn(nt.d, (v) => sn({ d: v }), { min: 1, attrs: { 'data-cc-notch': 'd' } }))),
      field(t('room.notch.at'), sel(NOTCH_AT[rm.shape].map((v) => [v, t('room.at.' + v.toLowerCase())]), nt.at, (v) => sn({ at: v }), { 'data-cc-notch': 'at' }))] : [];
    const pts = roomPts(rm);
    const free = rm.shape === 'free' ? [h('p', { style: 'font-size:0.75rem;opacity:0.8' }, t('room.free.note', { unit: U() })),
      (() => { const ta = h('textarea', { class: 'pc-input', rows: 5, 'data-cc-outline': '', style: 'width:100%;font-family:monospace;font-size:0.75rem' }); ta.value = pts.map((q) => q.join(', ')).join('\n'); return ta; })(),
      btn(t('room.free.apply'), (e) => { const ta = e.target.parentElement.querySelector('[data-cc-outline]'); const next = E.setOutline(P(), ta.value); if (next === P()) app.say2(t('room.free.bad')); else app.change(next); }, { 'data-cc-outline-apply': '' })] : [];
    // the plan the outline can be picked on
    const pick = s.pick || [];
    const box = Math.max(rm.w, rm.d) * 1.3, ox = -box * 0.1, oy = -box * 0.1;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = doc.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', [ox, -(oy + box), box, box].join(' ')); svg.setAttribute('width', '100%'); svg.setAttribute('data-cc-pickplan', ''); svg.setAttribute('style', 'max-height:260px;background:#fff;border:1px solid var(--line,#ccc);touch-action:none'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', t('room.pick.label'));
    const line = (list, closed, stroke, w) => { const e = doc.createElementNS(svgNS, closed ? 'polygon' : 'polyline'); e.setAttribute('points', list.map((q) => q[0] + ',' + (-q[1])).join(' ')); e.setAttribute('fill', closed ? '#f6f3ea' : 'none'); e.setAttribute('stroke', stroke); e.setAttribute('stroke-width', String(box / 300 * w)); return e; };
    svg.append(line(roomOutline(rm), true, '#1b1b1b', 1.5));
    if (pick.length) { svg.append(line(outlineOf(pick, s.pickArcs || [], false), false, '#d9822b', 2)); for (const q of pick) { const c = doc.createElementNS(svgNS, 'circle'); c.setAttribute('cx', String(q[0])); c.setAttribute('cy', String(-q[1])); c.setAttribute('r', String(box / 150)); c.setAttribute('fill', '#d9822b'); svg.append(c); } }
    svg.addEventListener('click', (e) => {
      const m = svg.getScreenCTM && svg.getScreenCTM();
      if (!m) return;
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const q = pt.matrixTransform(m.inverse());
      app.pickPoint(q.x, -q.y);
    });
    const picker = fs(t('room.pick'),
      h('p', { style: 'font-size:0.75rem;opacity:0.8' }, t('room.pick.note', { grid: U() === 'in' ? '2 in' : '50 mm' })),
      h('div', { style: 'display:flex;gap:10px;flex-wrap:wrap;font-size:0.78rem' },
        h('label', { style: 'display:flex;gap:4px' }, h('input', { type: 'checkbox', checked: !!s.pickAny, 'data-cc-pick-any': '', on: { change: (e) => app.pickAny(e.target.checked) } }), t('room.pick.any')),
        h('label', { style: 'display:flex;gap:4px' }, h('input', { type: 'checkbox', checked: !!s.pickArc, 'data-cc-pick-arc': '', on: { change: (e) => app.pickArc(e.target.checked) } }), t('room.pick.arc'))),
      s.pickArc ? h('p', { style: 'font-size:0.75rem', 'data-cc-pick-arc-note': s.pickMid ? 'end' : 'mid' }, t(s.pickMid ? 'room.pick.arc.end' : 'room.pick.arc.mid')) : null, svg,
      h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:4px' },
        btn(t('room.pick.close'), () => app.pickClose(), { 'data-cc-pick-close': '', ...(pick.length >= 3 ? {} : { disabled: true }) }),
        btn(t('room.pick.undo'), () => app.pickUndo(), { 'data-cc-pick-undo': '', ...(pick.length ? {} : { disabled: true }) }),
        btn(t('room.pick.clear'), () => app.pickClear(), { 'data-cc-pick-clear': '', ...(pick.length ? {} : { disabled: true }) })),
      h('p', { style: 'font-size:0.75rem', 'data-cc-pick-count': String(pick.length) }, t('room.pick.count', { n: pick.length })));
    // walls
    const wl = roomWalls(rm);
    const wallsList = h('ul', { style: 'list-style:none;padding:0;margin:4px 0;font-size:0.78rem', 'data-cc-walls': '' }, ...wl.map((w) => h('li', { 'data-cc-wall': w.id },
      wallLabel(w.id) + ' — ' + F(w.len) + ' ' + U() + (w.arc ? ' · ' + t('room.wall.arc', { r: F(w.arc.r), sweep: String(Math.abs(w.arc.sweep)), chord: F(w.chord), kind: t(w.arc.bay ? 'rev.bay' : 'rev.bow') }) : '') + (Math.abs(w.angle % 90) > 0.01 && !w.arc ? ' · ' + t('room.wall.angle', { a: String(Math.round(w.angle * 100) / 100) }) : '') + (w.convexStart ? (Math.abs(w.turnStart - 90) > 0.01 ? ' · ' + t('room.wall.turn', { a: String(Math.round(w.turnStart * 100) / 100) }) : '') : ' · ' + t('room.reflex')))));
    const segText = s.segText ?? '';
    const segExample = '4000 0\n2000 90\n1414.21 135\n2000 180\n1414.21 225';
    const angled = fs(t('room.angled'),
      h('p', { style: 'font-size:0.75rem;opacity:0.8' }, t('room.seg.note')),
      (() => { const ta = h('textarea', { class: 'pc-input', rows: 6, 'data-cc-segments': '', placeholder: segExample, style: 'width:100%;font-family:monospace;font-size:0.75rem' }); ta.value = segText; ta.addEventListener('input', () => { s.segText = ta.value; }); return ta; })(),
      h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:4px' },
        btn(t('room.seg.apply'), (e) => { const ta = e.target.parentElement.parentElement.querySelector('[data-cc-segments]'); app.setSegments(ta.value); }, { 'data-cc-seg-apply': '' }),
        btn(t('room.seg.example'), () => { s.segText = segExample; app.setView('room'); }, { 'data-cc-seg-example': '' })),
      h('p', { style: 'font-size:0.75rem;margin-top:6px' }, t('room.arcwall.note')),
      row2(field(t('room.arcwall.wall'), sel(wl.map((w) => [w.id, wallLabel(w.id)]), s.arcWall || wl[0]?.id, (v) => { s.arcWall = v; }, { 'data-cc-arc-wall': '' })),
        field(t('room.arcwall.sweep'), numIn(s.arcSweep ?? 60, (v) => { s.arcSweep = v ?? 0; }, { min: -170, attrs: { max: 170, 'data-cc-arc-sweep': '' } }))),
      h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' },
        btn(t('room.arcwall.make'), () => { const w = s.arcWall || wl[0]?.id; const next = E.setWallArc(P(), w, s.arcSweep ?? 60); if (next === P()) app.say2(t('room.free.bad')); else app.change(next); }, { 'data-cc-arc-make': '' }),
        btn(t('room.arcwall.straight'), () => { const w = s.arcWall || wl[0]?.id; const next = E.setWallArc(P(), w, 0); if (next !== P()) app.change(next); }, { 'data-cc-arc-straight': '' })));
    // openings
    const ops = p.openings;
    const opRows = ops.map((o) => {
      const so = (patch) => set((q) => E.setOpening(q, o.id, patch));
      const runsOn = p.runs.filter((r) => r.wall === o.wall);
      return h('li', { style: 'border-bottom:1px solid var(--line,#ddd);padding:4px 0', 'data-cc-opening': o.id },
        h('div', { style: 'display:flex;gap:4px;align-items:center;flex-wrap:wrap' }, h('b', { style: 'min-width:2.4em' }, o.id),
          sel([['door', t('open.door')], ['window', t('open.window')]], o.kind, (v) => so({ kind: v }), { 'data-cc-op': 'kind' }), sel(wallIds(rm).map((w) => [w, wallLabel(w)]), o.wall, (v) => so({ wall: v }), { 'data-cc-op': 'wall' }),
          btn('✕', () => set((q) => E.removeOpening(q, o.id)), { title: t('item.remove'), 'aria-label': t('item.remove') })),
        row2(field(t('open.at'), numIn(o.at, (v) => so({ at: v ?? 0 }), { attrs: { 'data-cc-op': 'at' } })), field(t('open.w'), numIn(o.w, (v) => so({ w: v }), { min: 1, attrs: { 'data-cc-op': 'w' } }))),
        row2(field(t('open.h'), numIn(o.h, (v) => so({ h: v }), { min: 1, attrs: { 'data-cc-op': 'h' } })), o.kind === 'window' ? field(t('open.sill'), numIn(o.sill, (v) => so({ sill: v ?? 0 }), { attrs: { 'data-cc-op': 'sill' } })) : field(t('open.swing'), sel([['in', t('open.swing.in')], ['out', t('open.swing.out')]], o.swing, (v) => so({ swing: v })))),
        o.kind === 'door' || o.kind === 'window' ? h('div', { style: 'display:flex;gap:4px;flex-wrap:wrap' }, ...runsOn.map((r) => btn(t('open.gap', { run: r.id }), () => set((q) => E.openGap(q, r.id, o.id)), { 'data-cc-opgap': o.id + '.' + r.id, title: t('open.gap.title') }))) : null);
    });
    // islands
    const isl = p.islands.map((i) => {
      const si = (patch) => set((q) => E.setIsland(q, i.id, patch));
      return h('li', { style: 'border-bottom:1px solid var(--line,#ddd);padding:4px 0', 'data-cc-island': i.id },
        h('div', { style: 'display:flex;gap:4px;align-items:center;flex-wrap:wrap' }, h('b', {}, i.id), sel([['island', t('island.kind.island')], ['peninsula', t('island.kind.peninsula')]], i.kind, (v) => si({ kind: v })),
          btn(t('island.cabinets'), () => { app.select(i.id); app.setView('layout'); }, { 'data-cc-island-edit': i.id }), btn('✕', () => set((q) => E.removeIsland(q, i.id)), { title: t('item.remove'), 'aria-label': t('item.remove') })),
        row2(field(t('island.x'), numIn(i.x, (v) => si({ x: v ?? 0 }), { attrs: { 'data-cc-isl': 'x' } })), field(t('island.y'), numIn(i.y, (v) => si({ y: v ?? 0 }), { attrs: { 'data-cc-isl': 'y' } }))),
        row2(field(t('island.len'), numIn(i.len, (v) => si({ len: v }), { min: 1, attrs: { 'data-cc-isl': 'len' } })), field(t('island.rot'), sel([0, 90, 180, 270].map((v) => [v, t('island.rot.' + v)]), i.rot, (v) => si({ rot: Number(v) }), { 'data-cc-isl': 'rot' }))),
        row2(field(t('island.seat'), numIn(i.seat, (v) => si({ seat: v ?? 0 }), { attrs: { 'data-cc-isl': 'seat' } })), h('div', {},
          h('label', { style: 'font-size:0.78rem;display:flex;gap:4px' }, h('input', { type: 'checkbox', checked: i.attach.start, on: { change: (e) => si({ attach: { ...i.attach, start: e.target.checked } }) } }), t('island.attach.start')),
          h('label', { style: 'font-size:0.78rem;display:flex;gap:4px' }, h('input', { type: 'checkbox', checked: i.attach.end, on: { change: (e) => si({ attach: { ...i.attach, end: e.target.checked } }) } }), t('island.attach.end')))));
    });
    add(
      h('p', { style: 'font-size:0.8rem' }, t('room.intro')),
      ...fromModel,
      fs(t('room.shape'), field(t('room.shape'), sel(['rect', 'L', 'U', 'free'].map((v) => [v, t('room.shape.' + v.toLowerCase())]), rm.shape, (v) => set((q) => E.setRoomShape(q, v)), { 'data-cc-shape': '' })),
        ...(rm.shape === 'free' ? [] : dims), ...shapeFields, ...free, h('p', { style: 'font-size:0.75rem' }, t('room.size', { w: F(rm.w), d: F(rm.d), unit: U() }))),
      picker, angled, fs(t('room.walls'), wallsList),
      fs(t('room.openings', { n: ops.length }), h('ul', { style: 'list-style:none;padding:0;margin:0', 'data-cc-openings': '' }, ...opRows),
        h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:4px' }, btn(t('open.add.door'), () => set((q) => E.addOpening(q, st().run && p.runs.find((r) => r.id === st().run)?.wall, 'door')), { 'data-cc-add-door': '' }), btn(t('open.add.window'), () => set((q) => E.addOpening(q, st().run && p.runs.find((r) => r.id === st().run)?.wall, 'window')), { 'data-cc-add-window': '' })),
        h('p', { style: 'font-size:0.75rem;opacity:0.8' }, t('open.note'))),
      fs(t('room.islands', { n: p.islands.length }), h('ul', { style: 'list-style:none;padding:0;margin:0', 'data-cc-islands': '' }, ...isl),
        h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:4px' }, btn(t('island.add'), () => set((q) => E.addIsland(q, 'island')), { 'data-cc-add-island': '' }), btn(t('island.add.peninsula'), () => set((q) => E.addIsland(q, 'peninsula')), { 'data-cc-add-peninsula': '' })),
        h('p', { style: 'font-size:0.75rem;opacity:0.8' }, t('island.note'))));
    void an;
  }

  // ---------------------------------------------------------------------------------------------- layout
  function layout() {
    const p = P();
    const s = st();
    const an = app.analysis();
    const L = an.build.layout;
    const bar = h('div', { style: 'display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px' }, ...[...p.runs, ...p.islands].map((r) => h('button', { type: 'button', class: 'pc-btn' + (s.run === r.id ? ' is-primary' : ''), 'data-cc-run': r.id, on: { click: () => app.select(r.id) } }, r.id + (r.name ? ' ' + r.name : ''))),
      btn('+ ' + t('run.add'), () => { app.change(E.addRun(p, 'S')); app.select(P().runs.at(-1).id); }, { 'data-cc-addrun': '' }));
    add(bar);
    const run = p.runs.find((r) => r.id === s.run) || p.islands.find((r) => r.id === s.run) || p.runs[0] || p.islands[0];
    if (!run) { add(h('p', {}, t('run.none'))); return; }
    const isIsland = !!p.islands.find((i) => i.id === run.id);
    const sr = (patch) => set((q) => E.setRun(q, run.id, patch));
    if (isIsland) add(h('p', { style: 'font-size:0.8rem', 'data-cc-island-note': '' }, t('island.layout.note', { id: run.id })));
    else add(h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:6px 0' }, h('legend', { style: 'font-size:0.8rem' }, t('run.title', { id: run.id })),
      row2(field(t('run.name'), textIn(run.name, (v) => sr({ name: v }))), field(t('run.wall'), sel(wallIds(p.room).map((w) => [w, wallLabel(w)]), run.wall, (v) => sr({ wall: v }), { 'data-cc-run-wall': '' }))),
      row2(field(t('run.from'), numIn(run.from, (v) => sr({ from: v ?? 0 }))), field(t('run.to'), numIn(run.to, (v) => sr({ to: v ?? wallLength(run.wall, p.room) })))),
      row2(field(t('run.endstart'), sel([['auto', t('ep.auto')], ['true', t('ep.yes')], ['false', t('ep.no')]], String(run.endPanels.start), (v) => sr({ endPanels: { ...run.endPanels, start: v === 'auto' ? 'auto' : v === 'true' } }))),
        field(t('run.endend'), sel([['auto', t('ep.auto')], ['true', t('ep.yes')], ['false', t('ep.no')]], String(run.endPanels.end), (v) => sr({ endPanels: { ...run.endPanels, end: v === 'auto' ? 'auto' : v === 'true' } })))),
      h('label', { style: 'font-size:0.8rem;display:flex;gap:6px;align-items:center' }, h('input', { type: 'checkbox', checked: run.autoFiller, on: { change: (e) => sr({ autoFiller: e.target.checked }) } }), t('run.autofill')),
      btn(t('run.remove'), () => { app.change(E.removeRun(p, run.id)); app.select(null); }, { 'data-cc-removerun': '' })));
    for (const row of (isIsland ? ['base', 'back'] : ['base', 'upper'])) {
      const lay = L.runs.find((x) => x.run.id === (row === 'back' ? run.id + 'b' : run.id));
      if (!lay) { add(h('section', { style: 'margin:8px 0', 'data-cc-row': row }, h('h4', { style: 'font-size:0.85rem;margin:0' }, t('row.' + row)), h('p', { style: 'font-size:0.75rem;margin:2px 0' }, t('island.back.empty')), addControls(run, row, [], []))); continue; }   // i18n-ignore: a style
      const rw = lay.rows[row === 'back' ? 'base' : row];
      const cells = rw.cells.filter((c) => c.kind !== 'endpanel' && !c.auto);
      const items = run[row];
      const status = rw.rest < -1e-6 ? t('row.over', { n: F(-rw.rest), unit: U() }) : t('row.used', { used: F(rw.used), span: F(rw.end - rw.start), rest: F(rw.rest), unit: U() });
      const list = h('ol', { style: 'list-style:none;padding:0;margin:4px 0', 'data-cc-items': row },
        ...items.map((it, i) => {
          const c = cells[i];
          const name = it.kind === 'cab' ? t(templateById(it.tpl).name) : t('item.' + it.kind);
          const editing = s.edit === run.id + '.' + row + '.' + i;
          const w = it.w ?? c?.w;
          return h('li', { style: 'border-bottom:1px solid var(--line,#ddd);padding:3px 0', 'data-cc-item': i },
            h('div', { style: 'display:flex;gap:4px;align-items:center' },
              h('b', { style: 'min-width:2.6em;font-size:0.8rem' }, c?.no || '·'), h('span', { style: 'flex:1;font-size:0.8rem' }, name),
              numIn(w, (v) => set((q) => E.setItem(q, run.id, row, i, { w: v })), { min: 1, attrs: { style: 'width:5em', 'aria-label': t('item.w') } }),
              btn('↑', () => set((q) => E.moveItem(q, run.id, row, i, -1)), { title: t('item.up'), 'aria-label': t('item.up') }), btn('↓', () => set((q) => E.moveItem(q, run.id, row, i, 1)), { title: t('item.down'), 'aria-label': t('item.down') }),
              it.kind === 'cab' ? btn('⚙', () => app.edit(editing ? null : run.id + '.' + row + '.' + i), { title: t('item.edit'), 'aria-label': t('item.edit') }) : null,
              btn('✕', () => set((q) => E.removeItem(q, run.id, row, i)), { title: t('item.remove'), 'aria-label': t('item.remove') })),
            editing ? itemEditor(run, row, i, it) : null);
        }));
      add(h('section', { style: 'margin:8px 0', 'data-cc-row': row },   // i18n-ignore
        h('h4', { style: 'font-size:0.85rem;margin:0' }, t('row.' + row)), h('p', { style: 'font-size:0.75rem;margin:2px 0', 'data-cc-status': row }, status), list, addControls(run, row)));
    }
    // the placed cabinets, numbered
    const rows = an.build.cells.filter((c) => c.run === run.id || c.run === run.id + 'b');
    add(h('details', {}, h('summary', {}, t('layout.table', { n: rows.length })),
      h('table', { style: 'font-size:0.75rem;width:100%' }, h('tbody', {}, ...rows.map((c) => h('tr', {}, h('td', {}, c.no), h('td', {}, c.kind === 'cab' ? t(c.cell.tpl.name) : t('item.' + c.kind)), h('td', {}, F(c.cell.x)), h('td', {}, F(c.cell.w)), h('td', {}, c.kind === 'cab' ? String(c.parts.length) : '')))))));
  }
  function addControls(run, row) {
    const p = P();
    const groupOf = row === 'upper' ? ['wall'] : ['base', 'tall'];
    const tpls = TEMPLATES.filter((x) => groupOf.includes(x.group));
    const pick = h('select', { class: 'pc-select', 'data-cc-tpl': row, 'aria-label': t('add.tpl') }, ...['base', 'tall', 'wall'].filter((g) => groupOf.includes(g)).map((g) => h('optgroup', { label: t('group.' + g) }, ...tpls.filter((x) => x.group === g).map((x) => h('option', { value: x.id }, t(x.name))))));
    const wIn = numIn(conv(600, U()), () => {}, { min: 1, attrs: { style: 'width:5em', 'data-cc-addw': row, 'aria-label': t('item.w') } });
    const curTpl = () => pick.value || tpls[0].id;
    pick.addEventListener('change', () => { wIn.value = String(resolveEntry({ tpl: curTpl() }, p.unit).cab.w); });
    wIn.value = String(resolveEntry({ tpl: curTpl() }, p.unit).cab.w);
    const addIt = (item) => set((q) => E.addItem(q, run.id, row, item));
    return h('div', { style: 'display:flex;gap:4px;flex-wrap:wrap;align-items:center' }, pick, wIn,
      btn(t('add.cab'), () => addIt({ kind: 'cab', tpl: curTpl(), w: Number(wIn.value) }), { 'data-cc-add': row }),
      btn(t('add.gap'), () => addIt({ kind: 'gap', w: Number(wIn.value) })), btn(t('add.filler'), () => addIt({ kind: 'filler', w: Number(wIn.value) })),
      btn(t('add.fill'), () => set((q) => E.fillRun(q, run.id, row === 'back' ? 'base' : row)), { title: t('add.fill.title') }));
  }
  function itemEditor(run, row, i, it) {
    const r = resolveEntry(it, P().unit);
    const sv = (patch) => set((q) => E.setItem(q, run.id, row, i, patch));
    const tpl = r.tpl;
    return h('div', { style: 'padding:4px 0 4px 8px', 'data-cc-editor': '' },
      row2(field(t('cab.h'), numIn(it.h ?? r.cab.h, (v) => sv({ h: v }), { min: 1 })), field(t('cab.d'), numIn(it.d ?? r.cab.d, (v) => sv({ d: v }), { min: 1 }))),
      row2(field(t('cab.hinge'), sel([['left', t('hinge.left')], ['right', t('hinge.right')]], it.hinge || 'left', (v) => sv({ hinge: v }))),
        field(t('cab.construction'), sel([['', t('con.job')], ['frameless', t('con.frameless')], ['faceframe', t('con.faceframe')]], it.construction || '', (v) => sv({ construction: v })))),
      tpl.type !== 'drawers' ? row2(field(t('cab.shelves'), numIn(it.shelves ?? r.cab.shelves ?? '', (v) => sv({ shelves: v }), { step: 1 })), field(t('cab.doors'), sel([['auto', t('doors.auto')], ['0', t('doors.0')], ['1', t('doors.1')], ['2', t('doors.2')]], String(it.doors ?? r.cab.doors), (v) => sv({ doors: v === 'auto' ? 'auto' : Number(v) })))) : field(t('cab.drawers'), numIn(it.drawers ?? r.cab.drawers, (v) => sv({ drawers: v }), { min: 1, step: 1 })),
      tpl.corner ? field(t('cab.blind'), numIn(it.blind ?? r.blind, (v) => sv({ blind: v }))) : null,
      tpl.group === 'wall' ? field(t('cab.elev'), numIn(it.elev ?? r.cab.elev, (v) => sv({ elev: v }))) : null,
      field(t('cab.note'), textIn(it.note || '', (v) => sv({ note: v }), { maxlength: 160 })));
  }

  // ---------------------------------------------------------------------------------------------- materials
  function materials() {
    const p = P();
    const libOpts = (role) => MATERIALS.filter((m) => m.role === role).map((m) => [m.id, t('lib.mat.' + m.id, { t: p.unit === 'in' ? m.inch : m.thickness, unit: U() })])
      .concat(p.custom.filter((m) => m.role === role).map((m) => [m.id, m.name]));
    const bandOpts = BANDS.map((b) => [b.id, t(b.name, { t: p.unit === 'in' ? b.inch : b.thickness, unit: U() })]);
    const pk = (key, opts) => field(t('pick.' + key), sel(opts, p.picks[key], (v) => set((q) => E.setPick(q, key, v)), { 'data-cc-pick': key }));
    const R0 = rulesFor(p.unit), R1 = rulesFor(p.unit, p.rules);
    const rule = (key, lab) => field(t(lab, { unit: U() }), numIn(p.rules[key] ?? R1[key], (v) => set((q) => E.setRule(q, key, v ?? R0[key])), { attrs: { 'data-cc-rule': key, title: t('rule.default', { v: R0[key] }) } }));
    const cu = { name: '', role: 'carcass', thickness: p.unit === 'in' ? 0.75 : 18, w: 0, h: 0 };
    add(
      h('p', { style: 'font-size:0.8rem' }, t('mat.intro')),
      pk('carcass', libOpts('carcass')), pk('back', libOpts('back')), pk('fronts', libOpts('fronts')), pk('drawer', libOpts('drawer')), pk('drawerBottom', libOpts('drawer-bottom')), pk('frame', libOpts('frame')),
      row2(pk('bandCarcass', bandOpts), pk('bandFront', bandOpts)), pk('bandDrawer', bandOpts),
      h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:6px 0' }, h('legend', { style: 'font-size:0.8rem' }, t('mat.sheet', { unit: U() })),
        row2(field(t('mat.sheet.w'), numIn(p.sheet.w, (v) => set((q) => E.setProject(q, { sheet: { w: v } })), { min: 1 })), field(t('mat.sheet.h'), numIn(p.sheet.h, (v) => set((q) => E.setProject(q, { sheet: { h: v } })), { min: 1 }))),
        row2(field(t('mat.sheet.margin'), numIn(p.sheet.margin, (v) => set((q) => E.setProject(q, { sheet: { margin: v } })))), field(t('mat.sheet.spacing'), numIn(p.sheet.spacing, (v) => set((q) => E.setProject(q, { sheet: { spacing: v } })))))),
      h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:6px 0' }, h('legend', { style: 'font-size:0.8rem' }, t('mat.counter', { unit: U() })),
        row2(field(t('mat.counter.t'), numIn(p.counter.t, (v) => set((q) => E.setProject(q, { counter: { t: v } })))), field(t('mat.counter.front'), numIn(p.counter.front, (v) => set((q) => E.setProject(q, { counter: { front: v } }))))),
        field(t('mat.counter.end'), numIn(p.counter.end, (v) => set((q) => E.setProject(q, { counter: { end: v } }))))),
      h('details', {}, h('summary', {}, t('mat.rules')), h('p', { style: 'font-size:0.75rem' }, t('mat.rules.note')),
        row2(rule('kickH', 'rule.kickH'), rule('kickSetback', 'rule.kickSetback')), row2(rule('reveal', 'rule.reveal'), rule('wallElev', 'rule.wallElev')),
        row2(rule('shelfFront', 'rule.shelfFront'), rule('railDepth', 'rule.railDepth')), row2(rule('maxDoorW', 'rule.maxDoorW'), rule('maxDoorH', 'rule.maxDoorH')), rule('slideGap', 'rule.slideGap'),
        field(t('rule.back'), sel(['groove', 'between', 'applied'].map((v) => [v, t('back.' + v)]), R1.back, (v) => set((q) => E.setRule(q, 'back', v)))),
        field(t('rule.kick'), sel(['legs', 'notch', 'none'].map((v) => [v, t('kick.' + v)]), R1.kick, (v) => set((q) => E.setRule(q, 'kick', v)))),
        h('h5', { style: 'font-size:0.8rem;margin:6px 0 0' }, t('mat.ff')),
        ...['stile', 'rail', 'overlay', 'gap'].map((k) => field(t('ff.' + k, { unit: U() }), numIn(p.ff[k] ?? ({ stile: conv(38, p.unit), rail: conv(38, p.unit), overlay: conv(12, p.unit), gap: conv(3, p.unit) })[k], (v) => set((q) => E.setFrame(q, k, v ?? 0)), { attrs: { 'data-cc-ff': k } })))),
      h('details', {}, h('summary', {}, t('mat.custom', { n: p.custom.length })),
        h('p', { style: 'font-size:0.75rem' }, t('mat.custom.note', { unit: U() })),
        ...p.custom.map((m) => h('div', { style: 'display:flex;gap:4px;align-items:center;font-size:0.8rem' }, h('span', { style: 'flex:1' }, m.name + ' · ' + t('pick.' + (m.role === 'drawer-bottom' ? 'drawerBottom' : m.role)) + ' · ' + m.thickness), btn('✕', () => set((q) => ({ ...q, custom: q.custom.filter((x) => x.id !== m.id) })), { 'aria-label': t('item.remove') }))),
        row2(field(t('mat.custom.name'), textIn('', (v) => { cu.name = v; }, { 'data-cc-custom': 'name' })), field(t('mat.custom.role'), sel(['carcass', 'back', 'fronts', 'drawer', 'drawer-bottom', 'frame'].map((r) => [r, t('pick.' + (r === 'drawer-bottom' ? 'drawerBottom' : r))]), cu.role, (v) => { cu.role = v; }, { 'data-cc-custom': 'role' }))),
        row2(field(t('mat.custom.t'), numIn(cu.thickness, (v) => { cu.thickness = v; }, { min: 0.01, attrs: { 'data-cc-custom': 'thickness' } })), field(t('mat.custom.w'), numIn('', (v) => { cu.w = v || 0; }))),
        field(t('mat.custom.h'), numIn('', (v) => { cu.h = v || 0; })),
        btn(t('mat.custom.add'), () => { if (!cu.name) return; set((q) => ({ ...q, custom: [...q.custom, { id: 'my-' + (cu.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24) || 'x') + '-' + (q.custom.length + 1), role: cu.role, name: cu.name, thickness: cu.thickness, sheet: cu.w > 0 && cu.h > 0 ? { w: cu.w, h: cu.h } : undefined }] })); }, { 'data-cc-custom-add': '' })));
  }

  // ---------------------------------------------------------------------------------------------- checks
  function checks() {
    const an = app.analysis();
    const list = an.problems;
    const mark = { error: '✖', warning: '⚠', note: 'ℹ' };
    add(h('p', { style: 'font-size:0.8rem' }, list.length ? t('checks.count', { n: list.length, e: list.filter((x) => x.severity === 'error').length }) : t('checks.none')),
      app.problemsOn ? h('p', { style: 'font-size:0.75rem;opacity:0.8' }, t('checks.shared')) : null,
      h('ul', { style: 'list-style:none;padding:0', 'data-cc-problems': '' }, ...list.map((x) => h('li', { style: 'margin:4px 0;font-size:0.8rem', 'data-cc-problem': x.code, class: 'cc-' + x.severity }, h('b', {}, mark[x.severity] + ' '), x.text))));
  }

  // ---------------------------------------------------------------------------------------------- cost
  function cost() {
    const p = P();
    const an = app.analysis();
    const e = an.est;
    const R = ratesOf(p.rates);
    const changed = new Set(changedPaths(p.rates));
    const paths = [];
    for (const r of e.rows) if (r.path && !paths.find((x) => x.path === r.path)) paths.push(r);
    const lint = e.lint;
    const nothingTyped = !changed.size && !(p.ratesOk || []).length;
    const CAT = { sheet: 'sheet', sheetOther: 'sheet-other', bandPerM: 'band', bandOther: 'band-other', hardware: 'hardware', hardwoodPerM: 'hardwood', counterPerM: 'counter', labour: 'labour', machine: 'machine', madeToOrder: 'made-to-order', markup: 'markup', tax: 'tax', currency: 'currency' };
    const catName = (k) => t('cost.cat.' + (CAT[k] || k));
    const quote = h('p', { style: 'font-size:0.85rem;font-weight:700;margin:6px 0;padding:4px 6px;border:1px solid var(--line,#999)', 'data-cc-quote': lint.final ? 'final' : 'draft' }, lint.final ? t('cost.quote.final') : t('cost.quote.draft'));
    const prompt = nothingTyped ? h('div', { 'data-cc-rates-prompt': '', style: 'border:2px solid var(--accent,#d9822b);padding:8px;margin:6px 0' },
      h('p', { style: 'font-weight:700;margin:0 0 4px' }, t('cost.first.title')),
      h('p', { style: 'font-size:0.8rem;margin:0 0 6px' }, t('cost.first.body')),
      h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' },
        btn(t('cost.first.type'), (ev) => { const root = ev.target.closest ? ev.target.closest('[data-cabinetcraft]') : null; const d = root && root.querySelector('details'); if (d) { d.open = true; const i = d.querySelector('input'); if (i && i.focus) i.focus(); } }, { 'data-cc-first-type': '' }),
        btn(t('cost.import.sheet'), () => app.download((P().name || 'job') + '-rates.csv', rateSheetCsv(P().rates, { head: { path: t('csv.rates.path'), value: t('csv.rates.value'), placeholder: t('csv.rates.placeholder') }, yes: t('yes'), no: t('no') }), 'text/csv')),
        btn(t('cost.import.file'), async () => { const x = await app.pickFile('.csv,.json,.txt,text/csv,application/json'); if (x) app.importRates(x); }))) : null;
    const lintBox = h('div', { 'data-cc-lint': lint.open.join(','), style: 'font-size:0.78rem;margin:4px 0' },
      h('p', { style: 'margin:2px 0;font-weight:600' }, lint.open.length ? t('cost.lint.open', { n: lint.open.length }) : t('cost.lint.none')),
      h('ul', { style: 'margin:0;padding-left:1rem' }, ...lint.categories.map((c) => h('li', { 'data-cc-lint-cat': c.key, 'data-cc-lint-state': c.placeholder ? 'placeholder' : 'own' }, catName(c.key) + ' — ' + (c.placeholder ? t('cost.lint.ph', { n: c.open.length, of: c.paths.length }) : t('cost.lint.own'))))),
      h('p', { style: 'margin:2px 0;opacity:0.8' }, t('cost.lint.note')));
    add(
      prompt, quote, lintBox,
      h('p', { style: 'font-size:0.8rem;font-weight:600;color:var(--danger,#900)', 'data-cc-placeholder': '' }, e.allPlaceholder ? t('cost.allplaceholder') : t('cost.someplaceholder', { n: e.placeholders, of: e.rows.length })),
      h('p', { style: 'font-size:0.75rem' }, st().nest ? t('cost.nested') : t('cost.area')),
      h('label', { style: 'font-size:0.8rem;display:flex;gap:6px;align-items:center' }, h('input', { type: 'checkbox', checked: st().install, on: { change: (ev) => app.install(ev.target.checked) } }), t('cost.install')),
      h('table', { style: 'font-size:0.75rem;width:100%;margin:6px 0', 'data-cc-cost': '' }, h('thead', {}, h('tr', {}, ...['what', 'qty', 'rate', 'amount'].map((c) => h('th', { style: 'text-align:left' }, t('cost.col.' + c))))),
        h('tbody', {}, ...e.rows.map((r) => h('tr', { 'data-cc-ph': r.placeholder ? '1' : '0' }, h('td', {}, t(r.what) + (r.detail ? ' ' + r.detail : '')), h('td', {}, String(r.qty) + ' ' + t(r.unit)), h('td', {}, String(r.rate) + (r.placeholder ? ' *' : '')), h('td', {}, r.amount.toFixed(2)))),
          h('tr', {}, h('td', {}, t('est.subtotal')), h('td'), h('td'), h('td', {}, e.subtotal.toFixed(2))),
          h('tr', {}, h('td', {}, t('est.markup') + ' ' + Math.round(e.markupRate * 100) + '%' + (e.markupPlaceholder ? ' *' : '')), h('td'), h('td'), h('td', {}, e.markup.toFixed(2))),
          e.tax ? h('tr', {}, h('td', {}, t('est.tax')), h('td'), h('td'), h('td', {}, e.tax.toFixed(2))) : null,
          h('tr', { style: 'font-weight:700' }, h('td', {}, t('est.total') + ' (' + e.currency + ')'), h('td'), h('td'), h('td', { 'data-cc-total': '' }, e.total.toFixed(2))))),
      h('p', { style: 'font-size:0.75rem' }, t('cost.star'), ' ', e.cabinets ? t('cost.percab', { v: e.perCabinet.toFixed(2), cur: e.currency }) : ''),
      h('details', {}, h('summary', {}, t('cost.rates')),
        field(t('cost.currency'), textIn(R.currency, (v) => set((q) => E.setRate(q, 'currency', v)), { maxlength: 3, 'data-cc-rate': 'currency' })),
        field(t('cost.markup'), numIn(R.markup, (v) => set((q) => E.setRate(q, 'markup', v ?? 0)), { attrs: { 'data-cc-rate': 'markup' } })),
        field(t('cost.tax'), numIn(R.tax, (v) => set((q) => E.setRate(q, 'tax', v ?? 0)), { attrs: { 'data-cc-rate': 'tax' } })),
        ...paths.map((r) => field(t(r.what) + (r.detail ? ' ' + r.detail : '') + (changed.has(r.path) ? '' : ' *'), numIn(r.base, (v) => set((q) => E.setRate(q, r.path, v ?? 0)), { attrs: { 'data-cc-rate': r.path } }))),
        btn(t('cost.reset'), () => set((q) => ({ ...q, rates: {}, ratesOk: [] })), { 'data-cc-rates-reset': '' })),
        h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:6px 0' }, h('legend', { style: 'font-size:0.8rem' }, t('cost.import')),
          h('p', { style: 'font-size:0.75rem' }, t('cost.import.note')),
          h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' },
            btn(t('cost.import.sheet'), () => app.download((P().name || 'job') + '-rates.csv', rateSheetCsv(P().rates, { head: { path: t('csv.rates.path'), value: t('csv.rates.value'), placeholder: t('csv.rates.placeholder') }, yes: t('yes'), no: t('no') }), 'text/csv'), { 'data-cc-rates-sheet': '' }),
            btn(t('cost.import.file'), async () => { const x = await app.pickFile('.csv,.json,.txt,text/csv,application/json'); if (x) app.importRates(x); }, { 'data-cc-rates-import': '' })),
          h('p', { style: 'font-size:0.75rem', 'data-cc-rates-result': '' }, st().ratesNote || '')));
  }

  // ---------------------------------------------------------------------------------------------- drawings
  function drawings() {
    const s = st();
    const an = app.analysis();
    const sheets = app.sheets();
    const cur = sheets.find((x) => x.id === s.drawing) || sheets[0];
    const box = h('div', { 'data-cc-drawing': cur?.id || '', style: 'overflow:auto;max-width:100%;background:#fff;border:1px solid var(--line,#ccc)' });
    if (cur) box.innerHTML = cur.svg;   // the drawings module wrote this SVG and escaped every string in it
    void an;
    add(
      field(t('draw.pick'), sel(sheets.map((x) => [x.id, x.title]), cur?.id, (v) => app.drawing(v), { 'data-cc-draw-pick': '' })),
      cur && cur.id === 'iso' ? h('div', { style: 'display:flex;gap:4px;margin:4px 0' }, btn('⟲', () => app.rotate(-1), { 'aria-label': t('draw.rotate.l'), title: t('draw.rotate.l') }), btn('⟳', () => app.rotate(1), { 'aria-label': t('draw.rotate.r'), title: t('draw.rotate.r') })) : null,
      box,
      h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px' },
        btn(t('draw.save.svg'), () => cur && app.download((cur.id || 'drawing') + '.svg', cur.svg, 'image/svg+xml'), { 'data-cc-save-svg': '' }),
        btn(t('draw.save.set'), () => app.download((P().name || 'job') + '-drawings.html', sheetSetHtml(sheets, { title: P().name, unit: U(), date: new Date().toISOString().slice(0, 10) }), 'text/html'), { 'data-cc-save-set': '' })),
      h('p', { style: 'font-size:0.75rem;opacity:0.8' }, t('draw.note')),
      app.showViewport() ? viewport3d() : null,
      hostSections('drawings'));
  }
  // the host adapter's sections (hosts/<slug>.js): a fieldset of actions, each one a button; the adapter says what it does and what it cannot
  function hostSections(where) {
    return app.hostSections(where).map((sec) => h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:8px 0', 'data-cc-host': sec.id },
      h('legend', { style: 'font-size:0.8rem' }, sec.title),
      sec.note ? h('p', { style: 'font-size:0.75rem' }, sec.note) : null,
      ...(sec.fields || []),
      h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin:4px 0' }, ...(sec.actions || []).map((a) => btn(a.label, () => app.hostRun(a.id), { 'data-cc-host-action': a.id, ...(a.disabled ? { disabled: true } : {}), ...(a.title ? { title: a.title } : {}) }))),
      sec.status ? h('p', { style: 'font-size:0.75rem', 'data-cc-host-status': sec.id }, sec.status) : null));
  }
  function viewport3d() {
    const s = st();
    const have = app.has3d();
    const n = app.count3d();
    return h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:8px 0', 'data-cc-3d': '' }, h('legend', { style: 'font-size:0.8rem' }, t('v3d.title')),
      h('p', { style: 'font-size:0.75rem' }, have ? t('v3d.note') : t('v3d.unavailable')),
      have ? h('label', { style: 'font-size:0.8rem;display:flex;gap:6px;align-items:center' }, h('input', { type: 'checkbox', checked: s.shell3d !== false, 'data-cc-3d-room': '', on: { change: (e) => app.shell3d(e.target.checked) } }), t('v3d.room')) : null,
      have ? h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin:4px 0' },
        btn(n ? t('v3d.replace') : t('v3d.place'), () => app.place3d(), { 'data-cc-3d-place': '' }),
        btn(t('v3d.remove'), () => app.remove3d(), { 'data-cc-3d-remove': '', ...(n ? {} : { disabled: true }) })) : null,
      h('p', { style: 'font-size:0.75rem', 'data-cc-3d-status': String(n) }, n ? t('v3d.placed', { n }) : t('v3d.none')));
  }

  // ---------------------------------------------------------------------------------------------- export
  function exportView() {
    const s = st();
    const an = app.analysis();
    const nest = s.nest;
    const mats = nest ? nest.efficiency : [];
    const has = an.build.parts.length > 0;
    const files = s.files || [];
    add(
      h('p', { style: 'font-size:0.8rem' }, t('exp.summary', { cabs: an.build.cells.filter((c) => c.kind === 'cab').length, pieces: an.list.pieces })),
      h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' }, btn(t('exp.nest'), () => app.nest(), { 'data-cc-nest': '', ...(has && !s.nesting ? {} : { disabled: true }) })),
      s.nesting ? h('div', { 'data-cc-progress': String(Math.round((s.progress?.fraction || 0) * 100)), style: 'margin:4px 0' },   // i18n-ignore: a style
        h('progress', { max: 100, value: Math.round((s.progress?.fraction || 0) * 100), style: 'width:100%' }),
        h('p', { style: 'font-size:0.75rem;margin:2px 0', 'aria-live': 'polite' }, s.progress?.text || t('exp.nest.start'))) : null,
      nest ? h('div', { 'data-cc-nested': '', style: 'font-size:0.78rem;margin:4px 0' },   // i18n-ignore
        h('p', { style: 'margin:2px 0' }, t('exp.nested', { n: nest.sheets, u: nest.unplaced.length })),   // i18n-ignore
        h('ul', { style: 'padding-left:1rem;margin:0' }, ...mats.map((m) => h('li', {}, t('exp.nested.row', { material: m.material, n: m.sheets, eff: Math.round(m.efficiency * 100), w: F(m.sheet.w), h: F(m.sheet.h), unit: U() }))))) : h('p', { style: 'font-size:0.75rem' }, t('exp.nonest')),
      h('div', { style: 'display:grid;gap:6px;margin:8px 0' },
        btn(t('exp.cutlist'), () => app.save('cutlist'), { 'data-cc-exp': 'cutlist' }), btn(t('exp.drill'), () => app.save('drill'), { 'data-cc-exp': 'drill' }), btn(t('exp.drillxml'), () => app.save('drillxml'), { 'data-cc-exp': 'drillxml', title: t('exp.drillxml.note') }), btn(t('exp.hardware'), () => app.save('hardware'), { 'data-cc-exp': 'hardware' }),
        btn(t('exp.estimate'), () => app.save('estimate'), { 'data-cc-exp': 'estimate' }), btn(t('exp.dxf'), () => app.save('dxf'), { 'data-cc-exp': 'dxf', ...(nest ? {} : { disabled: true, title: t('exp.needsnest') }) })),
      h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:6px 0' }, h('legend', { style: 'font-size:0.8rem' }, t('exp.labels')),
        field(t('exp.labels.tpl'), sel(Object.keys(LABELS).map((k) => [k, t('label.' + k)]), s.template, (v) => app.template(v))),
        btn(t('exp.labels.save'), () => app.save('labels'), { 'data-cc-exp': 'labels' })),
      hostSections('export'),
      !app.hasGcode() ? h('p', { style: 'font-size:0.75rem', 'data-cc-nogcode': '' }, t('exp.gcode.none')) : null,
      !app.hasGcode() ? null : h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:6px 0' }, h('legend', { style: 'font-size:0.8rem' }, t('exp.gcode')),
        h('p', { style: 'font-size:0.75rem' }, t('exp.gcode.note')),
        row2(field(t('exp.gcode.post'), sel([['grbl', 'GRBL'], ['fanuc', 'Fanuc'], ['linuxcnc', 'LinuxCNC']], s.post, (v) => app.post(v))), field(t('exp.gcode.tool', { unit: 'mm' }), numIn(s.tool, (v) => app.tool(v), { min: 0.5 }))),
        btn(t('exp.gcode.make'), () => app.run(() => app.gcode()), { 'data-cc-gcode': '', ...(nest ? {} : { disabled: true, title: t('exp.needsnest') }) }),
        h('ul', { style: 'list-style:none;padding:0;margin:4px 0', 'data-cc-gfiles': '' }, ...files.map((f) => h('li', {}, btn(t('exp.gcode.file', { name: f.name, ext: f.ext, material: f.material }), () => app.download(f.name + '.' + f.ext, f.text, 'text/plain'), { 'data-cc-gfile': f.name }))))),
      drilling(),
      dryrun(),
      h('p', { style: 'font-size:0.75rem;opacity:0.8' }, t('exp.verify')));
  }
  // sizes the person types from the hardware they chose (cornerdrill.js): blank until typed, never a made-up number
  function drilling() {
    const hw = hwOf(P().hw);
    const HWK = { fastenDia: 'fixing-dia', fastenDepth: 'fixing-depth', shaftDia: 'shaft-dia', shaftDepth: 'shaft-depth', pivotDia: 'pivot-dia', pivotDepth: 'pivot-depth' };
    const fld = (k) => field(t('hw.size.' + HWK[k]), numIn(hw[k] === '' ? '' : hw[k], (v) => set((q) => E.setHw(q, k, v ?? '')), { min: 0, attrs: { 'data-cc-hw': k, placeholder: t('hw.blank') } }));
    return h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:6px 0', 'data-cc-hwsizes': '' }, h('legend', { style: 'font-size:0.8rem' }, t('hw.title')),
      h('p', { style: 'font-size:0.75rem' }, t('hw.note')),
      row2(fld('fastenDia'), fld('fastenDepth')), row2(fld('shaftDia'), fld('shaftDepth')), row2(fld('pivotDia'), fld('pivotDepth')));
  }
  // the dry run: the programs and the hole list read by a very small simulator; plus the two printable sheets. Nothing here runs a machine.
  function dryrun() {
    const s = st();
    const a = app.analysis();
    const files = s.files || [];
    const issueText = (i) => t('dry.' + i.code, i.vars || {}) + (i.line ? ' (' + t('dry.line', { n: i.line }) + ')' : '');
    const sevMark = (i) => (i.severity === 'error' ? '✗ ' : i.severity === 'warning' ? '! ' : '· ');
    const dry = s.dry || [];
    const holes = s.holes;
    return h('fieldset', { style: 'border:1px solid var(--line,#ccc);padding:6px;margin:6px 0', 'data-cc-dryrun': '' }, h('legend', { style: 'font-size:0.8rem' }, t('dry.title')),
      h('p', { style: 'font-size:0.75rem;font-weight:600' }, t('dry.honest')),
      field(t('dry.rapid'), numIn(s.rapid, (v) => app.setRapid(v ?? ''), { min: 0, attrs: { 'data-cc-rapid': '', placeholder: t('dry.rapid.blank') } })),
      h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' }, btn(t('dry.run'), () => app.dryRun(), { 'data-cc-dry-run': '' }),
        btn(t('dry.checklist'), () => app.save('runcheck'), { 'data-cc-exp': 'runcheck' }), btn(t('dry.review'), () => app.save('review'), { 'data-cc-exp': 'review' })),
      !files.length ? h('p', { style: 'font-size:0.75rem' }, t('dry.nofiles')) : null,
      ...dry.map((d) => h('div', { 'data-cc-dry-file': d.name, 'data-cc-dry-ok': d.ok ? '1' : '0', style: 'font-size:0.75rem;margin:4px 0' },
        h('b', {}, d.name),
        h('div', {}, t('dry.summary', { moves: d.moves, cuts: d.cuts, arcs: d.arcs, len: Math.round(d.cutLen), tools: d.tools.join(', ') || '-', changes: d.toolChanges })),
        d.bbox ? h('div', {}, t('dry.bbox', { x0: d.bbox[0], y0: d.bbox[1], z0: d.bbox[2], x1: d.bbox[3], y1: d.bbox[4], z1: d.bbox[5] })) : null,
        h('div', {}, t('dry.feeds', { min: Math.round(d.minFeed), max: Math.round(d.maxFeed) })),
        h('div', {}, d.minutes === null ? t('dry.time.partial', { cut: Math.round(d.minutesCut * 10) / 10, rapid: Math.round(d.rapidLen) }) : t('dry.time', { min: Math.round(d.minutes * 10) / 10 })),
        ...d.issues.map((i) => h('div', { 'data-cc-dry-issue': i.code }, sevMark(i) + issueText(i))))),
      holes ? h('div', { 'data-cc-holes-ok': holes.ok ? '1' : '0', style: 'font-size:0.75rem;margin:4px 0' }, h('b', {}, t('dry.holes.title')),
        h('div', {}, t('dry.holes.summary', { holes: holes.holes, parts: holes.parts, rule: holes.minEdge, tight: holes.tightest === null ? '-' : holes.tightest })),
        ...holes.issues.slice(0, 12).map((i) => h('div', { 'data-cc-hole-issue': i.code }, sevMark(i) + t('dry.' + i.code, i.vars || {}))),
        holes.issues.length > 12 ? h('div', {}, t('dry.more', { n: holes.issues.length - 12 })) : null) : null,
      a.build.cells.some((c) => c.madeToOrder) ? h('p', { style: 'font-size:0.75rem' }, t('dry.mto')) : null);
  }
}
