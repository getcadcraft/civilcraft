/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solid-panel.js — the Solid FEM add-on's panel and its logic, shared by every host (0.9 SU.908c). The host is a thin adapter:
 *
 *   host = {
 *     t(key, vars) → string                              words (the add-on's lang file)
 *     setup: { get() → setup | null, set(setup, label) }  the settings in the document (one undo step per set where the host has undo)
 *     faces: { pick(fn) → stop(), mark(refs), resolve(refs) → { indices, gone }, label(ref) → string, available() → bool }
 *            pick: while active a click on a face in the host's 3D view calls fn(ref)
 *     solve?(job) → Promise<result>                        optional: run solveSolid off the page's thread (a Worker); without it the panel solves in place
 *     mesh({ h, onProgress }) → Promise<{ mesh, info: { h, volume, quality… } }>    the host's own mesher, in the solver's mesh form (solid-study.js)
 *     bodies: { show(bodies, name) → count, clear() → bool, shown() → bool }          results drawn in the host's view
 *     problems?: (list) → void                            the host's Problems store (list of { code, severity, text })
 *     onChange(fn) → off                                  the document changed (the part was rebuilt): the mesh is stale
 *     onRefresh?(fn) → off                                any change at all (undo, redo): the panel draws the settings again
 *     status?(text)
 *   }
 *   createSolidFem(host) → { app, S, mount(pane), render() }. `app` holds every action (Node tests drive it without a DOM).
 * No mention of a particular program anywhere: results are this library's numbers, not any other program's.
 */
import { newSetup, readSetup, PRESETS } from './solid-setup.js';
import { solveSolid, bandBodies, NOTE, LIMITS } from './solid-study.js';

const clone = (v) => JSON.parse(JSON.stringify(v));
export const sig = (v, n = 4) => (Number.isFinite(v) ? +v.toPrecision(n) : v);
const sameRef = (a, b) => a.name === b.name && Math.hypot(a.at[0] - b.at[0], a.at[1] - b.at[1], a.at[2] - b.at[2]) < 1e-6;
const CSS = '[data-sfem].sfem{padding:.5rem .75rem;font-size:.85em;box-sizing:border-box}.sfem h4{margin:.9rem 0 .3rem;font-size:1em}.sfem .sfem-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:.25rem .6rem;align-items:center;margin:.3rem 0}'
  + '.sfem .sfem-grid .k{opacity:.75}.sfem input,.sfem select{max-width:100%;box-sizing:border-box}.sfem .sfem-row{display:flex;flex-wrap:wrap;gap:.3rem;margin:.3rem 0;align-items:center}.sfem .sfem-item{border:1px solid var(--pc-line,#8884);border-radius:3px;padding:.3rem .45rem;margin:.3rem 0}'
  + '.sfem .sfem-item.is-sel{border-color:#2a8bd0;box-shadow:0 0 0 1px #2a8bd0}.sfem .sfem-legend{display:flex;height:.8rem;margin:.4rem 0;border-radius:2px;overflow:hidden}.sfem .sfem-swatch{flex:1 1 0;min-width:.5rem}'
  + '.sfem table{width:100%;border-collapse:collapse;font-size:.9em;margin:.3rem 0}.sfem td,.sfem th{text-align:right;padding:.1rem .3rem;border-bottom:1px solid var(--pc-line,#8884)}.sfem td:first-child,.sfem th:first-child{text-align:left}'
  + '.sfem ul.sfem-warn{margin:.3rem 0;padding-left:1.1rem}.sfem li.is-error{color:var(--pc-danger,#c0392b)}.sfem li.is-warn{border-left:3px solid #d9a21b;padding-left:.4rem;list-style:none;margin-left:-1rem}.sfem .sfem-note{opacity:.8;margin:.5rem 0}';

export function createSolidFem(host) {
  const t = (k, v) => host.t(k, v);
  const S = { busy: false, msg: '', mesh: null, meshInfo: null, result: null, legend: null, picking: null, sel: null, warnings: [], stale: false };
  let pane = null, stopPick = null;
  const tell = (m) => { S.msg = m; try { host.status?.(m); } catch { /* no status line */ } render(); };
  const get = () => host.setup.get() || newSetup();
  /** Change the settings through a function on a copy: checked by the reader, then one undo step. */
  const put = (fn, label, keep = false) => {
    const s = clone(get()); fn(s);
    host.setup.set(readSetup(s), label);
    if (!keep) { S.result = null; S.legend = null; S.stale = host.bodies.shown(); }
  };
  const guard = (fn) => { try { return fn(); } catch (e) { tell(String((e && e.message) || e)); return null; } };
  const nextId = (list, p) => { let n = 1; while (list.some((x) => x.id === p + n)) n++; return p + n; };

  const app = {
    t, S, get, sig,
    setMaterial(id, patch = {}) {
      return guard(() => put((s) => { s.material = id === 'custom' ? { ...s.material, id: 'custom', ...patch } : { id, ...PRESETS[id], ...patch }; if (id !== 'custom' && Object.keys(patch).length) s.material.id = 'custom'; }, t('undo.material')));
    },
    setField(key, v) { return guard(() => { put((s) => { if (key === 'h') s.h = v; else if (key === 'modes') s.modes = v; else if (key === 'kind') s.kind = v; }, t('undo.settings')); if (key === 'h') { S.mesh = null; S.meshInfo = null; } render(); }); },
    addSupport() { let id; guard(() => put((s) => { id = nextId(s.supports, 's'); s.supports.push({ id, faces: [] }); }, t('undo.support_add'))); if (id) app.startPick(id); return id; },
    addLoad(type) {
      let id;
      guard(() => put((s) => { id = nextId(s.loads, 'l'); s.loads.push(type === 'force' ? { id, type, faces: [], F: [0, -100, 0] } : type === 'pressure' ? { id, type, faces: [], p: 1 } : { id, type: 'gravity', g: [0, -9.81, 0] }); }, t('undo.load_add')));
      if (id && type !== 'gravity') app.startPick(id); else render();
      return id;
    },
    editLoad(id, patch) { return guard(() => put((s) => { Object.assign(s.loads.find((l) => l.id === id), patch); }, t('undo.load_edit'))); },
    remove(id) { guard(() => { put((s) => { s.supports = s.supports.filter((x) => x.id !== id); s.loads = s.loads.filter((x) => x.id !== id); }, t('undo.remove')); if (S.sel === id) { app.stopPick(); S.sel = null; } marks(); render(); }); },
    /** Face picking in the host's 3D view for support or load `id`. */
    startPick(id) {
      app.stopPick();
      if (!host.faces.available()) { tell(t('msg.no_faces')); return; }
      S.sel = id; S.picking = id;
      stopPick = host.faces.pick((ref) => app.toggleFace(id, ref));
      marks(); tell(t('msg.pick', { id })); 
    },
    stopPick() { if (stopPick) { try { stopPick(); } catch { /* gone */ } } stopPick = null; S.picking = null; render(); },
    toggleFace(id, ref) {
      return guard(() => {
        put((s) => {
          const it = s.supports.find((x) => x.id === id) || s.loads.find((x) => x.id === id);
          if (!it || !it.faces) return;
          const k = it.faces.findIndex((f) => sameRef(f, ref));
          if (k >= 0) it.faces.splice(k, 1); else { if (it.faces.length >= 64) throw new Error(t('msg.max_faces')); it.faces.push({ name: ref.name, at: ref.at.slice() }); }
        }, t('undo.pick', { id }));
        marks(); render();
      });
    },
    async mesh() {
      if (S.busy) return null;
      S.busy = true; S.msg = t('msg.meshing'); render();
      try {
        await tick();
        const r = await host.mesh({ h: get().h, onProgress: () => {} });
        S.mesh = r.mesh; S.meshInfo = r.info; S.result = null; S.legend = null;
        const ne = r.mesh.tets10.length / 10;
        S.msg = ne > LIMITS.elements ? t('msg.mesh_big', { n: ne, max: LIMITS.elements }) : t('msg.meshed', { n: ne, nodes: r.mesh.nodes.length / 3 });
        return r;
      } catch (e) { S.msg = t('msg.failed', { msg: String((e && e.message) || e) }); return null; } finally { S.busy = false; render(); }
    },
    /** The job from the settings: faces resolved against the host's current faces. */
    job() {
      const s = get(), gone = [];
      const res = (faces, id) => { const r = host.faces.resolve(faces); if (r.gone) gone.push(id); return r.indices; };
      const supports = s.supports.map((x) => ({ id: x.id, faces: res(x.faces, x.id) }));
      const loads = s.loads.map((l) => (l.type === 'gravity' ? { ...l } : { ...l, faces: res(l.faces, l.id) }));
      return { job: { mesh: S.mesh, material: { E: s.material.E, nu: s.material.nu, rho: s.material.rho, yield: s.material.yield }, kind: s.kind, modes: s.modes, supports, loads, tol: 1e-10 }, gone };
    },
    async solve() {
      if (S.busy) return null;
      if (!S.mesh) { const m = await app.mesh(); if (!m) return null; }
      S.busy = true; S.msg = t('msg.solving'); render();
      try {
        await tick();
        const { job, gone } = app.job();
        const r = host.solve ? await host.solve(job) : solveSolid(job);
        S.warnings = r.warnings.slice();
        for (const id of gone) S.warnings.push({ code: 'faces_gone', severity: 'warn', vars: { id } });
        S.result = r.ok ? r : null; S.legend = null;
        const bad = r.warnings.find((w) => w.severity === 'error');
        S.msg = r.ok ? (r.kind === 'modal' ? t('msg.done_modal', { f: sig(r.freqHz[0]) }) : t('msg.done', { d: sig(r.maxDisp), s: sig(r.maxVm) })) : t('msg.not_solved', { why: bad ? wording(bad) : '' });
        pushProblems();
        return r;
      } catch (e) { S.msg = t('msg.failed', { msg: String((e && e.message) || e) }); return null; } finally { S.busy = false; render(); }
    },
    setPlot(patch) { return guard(() => { put((s) => { Object.assign(s.plot, patch); }, t('undo.plot'), true); render(); }); },
    plotValues() {
      const r = S.result, p = get().plot;
      if (!r) return null;
      if (r.kind === 'modal' || p.field === 'mode') {
        const sh = r.modeShapes && r.modeShapes[Math.min(p.mode, r.modeShapes.length) - 1];
        if (!sh) return null;
        const v = new Float64Array(sh.length / 3); for (let i = 0; i < v.length; i++) v[i] = Math.hypot(sh[3 * i], sh[3 * i + 1], sh[3 * i + 2]);
        return { values: v, disp: sh, umax: 1, unit: '', name: t('plot.mode', { k: Math.min(p.mode, r.modeShapes.length), f: sig(r.freqHz[Math.min(p.mode, r.modeShapes.length) - 1]) }) };
      }
      return p.field === 'disp' ? { values: r.dispMag, disp: r.disp, umax: r.maxDisp, unit: 'mm', name: t('plot.disp') } : { values: r.vm, disp: r.disp, umax: r.maxDisp, unit: 'MPa', name: t('plot.vm') };
    },
    show() {
      return guard(() => {
        const pv = app.plotValues(), p = get().plot;
        if (!pv) { tell(t('plot.none')); return 0; }
        const b = bandBodies(S.mesh, pv.values, pv.disp, { n: 8, scale: p.scale, beside: p.beside, umax: pv.umax, size: S.result.size });
        if (!b || !b.bodies.length) { tell(t('plot.none')); return 0; }
        if (b.triangles > 60000) { tell(t('plot.too_big', { n: b.triangles })); return 0; }
        const n = host.bodies.show(b.bodies, pv.name);
        S.legend = { ...b, unit: pv.unit, name: pv.name }; S.stale = false;
        tell(t('plot.shown', { n, scale: sig(b.scale, 3) }));
        return n;
      });
    },
    clear() { return guard(() => { const ok = host.bodies.clear(); S.legend = null; S.stale = false; tell(ok ? t('plot.removed') : t('plot.none_shown')); return ok; }); },
  };
  const tick = () => new Promise((r) => setTimeout(r, 20));
  const wording = (w) => t('w.' + w.code, w.vars || {});
  const marks = () => { try { const s = get(), it = s.supports.find((x) => x.id === S.sel) || s.loads.find((x) => x.id === S.sel); host.faces.mark(it && it.faces ? it.faces : []); } catch { /* no marks */ } };
  const pushProblems = () => { try { host.problems?.(S.warnings.filter((w) => w.severity !== 'info').map((w) => ({ code: 'solidfem.' + w.code, severity: w.severity, text: wording(w) }))); } catch { /* no store */ } };
  host.onRefresh?.(() => render());   // the settings changed from outside (undo, redo, another panel): draw them
  host.onChange?.(() => { if (S.mesh) { S.mesh = null; S.meshInfo = null; S.result = null; S.legend = null; S.msg = t('msg.stale'); render(); } });
  app.wording = wording;

  // ------------------------------------------------------------------------------------------ DOM
  function render() { if (!pane) return; try { draw(); } catch (e) { pane.textContent = String((e && e.message) || e); } }
  function mount(el) { pane = el; if (pane.ownerDocument && !pane.ownerDocument.querySelector('style[data-sfem-style]')) { const st = pane.ownerDocument.createElement('style'); st.setAttribute('data-sfem-style', ''); st.textContent = CSS; pane.ownerDocument.head.append(st); } render(); }
  function draw() {
    const d = pane.ownerDocument, s = get();
    const el = (tag, props = {}, ...kids) => { const n = d.createElement(tag); for (const [k, v] of Object.entries(props)) { if (k === 'data') for (const [a, b] of Object.entries(v)) n.dataset[a] = b; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else if (k.startsWith('data-')) n.setAttribute(k, v); else if (k === 'class') n.className = v; else if (v !== undefined && v !== false) n[k] = v; } for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : d.createTextNode(String(c))); return n; };
    const btn = (label, act, fn, extra = {}) => el('button', { type: 'button', class: 'pc-btn', textContent: label, data: { sfemAct: act }, disabled: S.busy || extra.disabled, onclick: fn });
    const num = (value, on, attrs = {}) => { const i = el('input', { type: 'number', value: value === null ? '' : String(value), step: 'any', ...attrs }); i.addEventListener('change', () => { const v = i.value === '' ? null : Number(i.value); on(Number.isFinite(v) ? v : null); }); return i; };
    const row = (k, ...v) => [el('span', { class: 'k', textContent: k }), el('span', {}, ...v)];
    const sel = (opts, value, on, attrs = {}) => { const x = el('select', attrs); for (const [v, label] of opts) x.append(el('option', { value: v, textContent: label, selected: v === value })); x.addEventListener('change', () => on(x.value)); return x; };
    const kids = [];
    kids.push(el('p', { class: 'sfem-note', textContent: t('panel.honest') }));

    // material
    const m = s.material;
    kids.push(el('h4', { textContent: t('h.material') }));
    kids.push(el('div', { class: 'sfem-grid' },
      ...row(t('mat.label'), sel(['steel', 'stainless', 'aluminium', 'titanium', 'abs', 'custom'].map((i) => [i, t('mat.' + i)]), m.id, (v) => app.setMaterial(v), { 'data-sfem-material': '' })),
      ...row('E (MPa)', num(m.E, (v) => v > 0 && app.setMaterial('custom', { E: v }), { min: 0 })),
      ...row(t('mat.nu'), num(m.nu, (v) => v !== null && app.setMaterial('custom', { nu: v }), { min: 0, max: 0.49 })),
      ...row(t('mat.rho'), num(m.rho, (v) => v !== null && app.setMaterial('custom', { rho: v }), { min: 0 })),
      ...row(t('mat.yield'), num(m.yield, (v) => app.setMaterial('custom', { yield: v }), { min: 0 }))));

    // supports
    kids.push(el('h4', { textContent: t('h.supports') }));
    for (const x of s.supports) kids.push(item(x, el('span', { textContent: t('support.fixed') })));
    kids.push(el('div', { class: 'sfem-row' }, btn(t('act.add_support'), 'add-support', () => app.addSupport())));

    // loads
    kids.push(el('h4', { textContent: t('h.loads') }));
    for (const l of s.loads) {
      let body;
      if (l.type === 'force') body = el('div', { class: 'sfem-grid' }, ...['X', 'Y', 'Z'].map((a, i) => row('F' + a + ' (N)', num(l.F[i], (v) => v !== null && app.editLoad(l.id, { F: l.F.map((q, j) => (j === i ? v : q)) })))).flat());
      else if (l.type === 'pressure') body = el('div', { class: 'sfem-grid' }, ...row(t('load.pressure_mpa'), num(l.p, (v) => v !== null && app.editLoad(l.id, { p: v }))));
      else body = el('div', { class: 'sfem-grid' }, ...['X', 'Y', 'Z'].map((a, i) => row('g' + a + ' (m/s²)', num(l.g[i], (v) => v !== null && app.editLoad(l.id, { g: l.g.map((q, j) => (j === i ? v : q)) })))).flat());
      kids.push(item(l, el('span', { textContent: t('load.' + l.type) }), body));
    }
    kids.push(el('div', { class: 'sfem-row' }, btn(t('act.add_force'), 'add-force', () => app.addLoad('force')), btn(t('act.add_pressure'), 'add-pressure', () => app.addLoad('pressure')), btn(t('act.add_gravity'), 'add-gravity', () => app.addLoad('gravity'))));

    // mesh + analysis
    kids.push(el('h4', { textContent: t('h.mesh') }));
    kids.push(el('div', { class: 'sfem-grid' },
      ...row(t('mesh.h'), num(s.h, (v) => app.setField('h', v), { min: 0, placeholder: t('mesh.auto') })),
      ...row(t('kind.label'), sel([['static', t('kind.static')], ['modal', t('kind.modal')]], s.kind, (v) => app.setField('kind', v), { 'data-sfem-kind': '' })),
      ...(s.kind === 'modal' ? row(t('kind.modes'), num(s.modes, (v) => v >= 1 && app.setField('modes', Math.round(v)), { min: 1, max: 12 })) : [])));
    kids.push(el('div', { class: 'sfem-row' }, btn(t('act.mesh'), 'mesh', () => app.mesh()), btn(t('act.solve'), 'solve', () => app.solve())));
    if (S.meshInfo) kids.push(el('p', { data: { sfemMesh: '1' }, textContent: t('mesh.info', { n: S.mesh.tets10.length / 10, nodes: S.mesh.nodes.length / 3, dofs: S.mesh.nodes.length, h: sig(S.meshInfo.h, 3) }) }));
    if (S.msg) kids.push(el('p', { data: { sfemMsg: '1' }, role: 'status', textContent: S.msg }));

    // results
    const r = S.result;
    if (r) {
      kids.push(el('h4', { textContent: t('h.results') }));
      const g = [];
      if (r.kind === 'static') {
        g.push(...row(t('res.maxdisp'), sig(r.maxDisp) + ' mm'), ...row(t('res.maxvm'), sig(r.maxVm) + ' MPa'), ...row(t('res.maxvm_raw'), sig(r.maxVmRaw) + ' MPa'));
        if (s.material.yield) g.push(...row(t('res.yield_ratio'), sig(r.maxVm / s.material.yield, 3)));
        g.push(...row(t('res.mass'), sig(r.summary.mass, 4) + ' kg'), ...row(t('res.time'), sig(r.ms / 1000, 3) + ' s'));
      } else g.push(...row(t('res.mass'), sig(r.summary.mass, 4) + ' kg'));
      kids.push(el('div', { class: 'sfem-grid', data: { sfemResult: '1' } }, ...g));
      if (r.kind === 'modal') {
        kids.push(el('table', { data: { sfemFreq: '1' } }, el('tr', {}, el('th', { textContent: t('res.mode') }), el('th', { textContent: 'Hz' })), ...r.freqHz.map((f, i) => el('tr', {}, el('td', { textContent: String(i + 1) }), el('td', { textContent: String(sig(f)) })))));
      } else if (r.reactions) {
        kids.push(el('table', { data: { sfemReact: '1' } }, el('tr', {}, el('th', { textContent: t('res.reaction') }), ...['X', 'Y', 'Z'].map((a) => el('th', { textContent: a + ' (N)' }))),
          ...r.reactions.perSupport.map((x) => el('tr', {}, el('td', { textContent: x.id }), ...x.F.map((v) => el('td', { textContent: String(sig(v, 4)) })))),
          el('tr', {}, el('td', { textContent: t('res.applied') }), ...r.reactions.applied.map((v) => el('td', { textContent: String(sig(v, 4)) }))),
          el('tr', {}, el('td', { textContent: t('res.balance') }), el('td', { colSpan: 3, textContent: r.reactions.balance.toExponential(1) }))));
      }
      // plot
      const p = s.plot;
      kids.push(el('h4', { textContent: t('h.plot') }));
      const fields = r.kind === 'modal' ? [['mode', t('plot.field_mode')]] : [['vm', t('plot.field_vm')], ['disp', t('plot.field_disp')]];
      kids.push(el('div', { class: 'sfem-grid' },
        ...row(t('plot.field'), sel(fields, r.kind === 'modal' ? 'mode' : p.field, (v) => app.setPlot({ field: v }), { 'data-sfem-field': '' })),
        ...(r.kind === 'modal' ? row(t('plot.mode_no'), num(p.mode, (v) => v >= 1 && app.setPlot({ mode: Math.round(v) }), { min: 1, max: r.freqHz.length })) : []),
        ...row(t('plot.scale'), num(p.scale, (v) => app.setPlot({ scale: v }), { min: 0, placeholder: t('plot.auto') })),
        ...row(t('plot.place'), sel([['on', t('plot.on')], ['beside', t('plot.beside')]], p.beside ? 'beside' : 'on', (v) => app.setPlot({ beside: v === 'beside' }), { 'data-sfem-place': '' }))));
      kids.push(el('div', { class: 'sfem-row' }, btn(t('act.show'), 'show', () => app.show()), btn(t('act.clear'), 'clear', () => app.clear())));
      if (S.legend) {
        kids.push(el('div', { class: 'sfem-legend', data: { sfemLegend: '1' } }, ...S.legend.legend.map((b) => el('span', { class: 'sfem-swatch', title: sig(b.lo, 3) + ' to ' + sig(b.hi, 3) + ' ' + S.legend.unit, style: 'background:' + b.color }))));
        kids.push(el('p', { textContent: t('plot.range', { name: S.legend.name, lo: sig(S.legend.lo, 3), hi: sig(S.legend.hi, 3), unit: S.legend.unit, scale: sig(S.legend.scale, 3) }) }));
      }
    }
    if (S.stale) kids.push(el('p', { class: 'sfem-note', textContent: t('plot.stale') }));
    // warnings
    if (S.warnings.length) {
      kids.push(el('h4', { textContent: t('h.warnings') }));
      kids.push(el('ul', { class: 'sfem-warn', data: { sfemWarnings: '1' } }, ...S.warnings.map((w) => el('li', { class: 'is-' + w.severity, data: { code: w.code }, textContent: wording(w) }))));
    }
    kids.push(el('p', { class: 'sfem-note', data: { sfemNote: '1' }, textContent: t('note.liability') + ' ' + t('note.limits') }));
    pane.replaceChildren(...kids);
    pane.classList.add('sfem'); pane.setAttribute('data-sfem', '');

    function item(x, title, body) {
      const faces = x.faces ? x.faces.length : null, picking = S.picking === x.id;
      return el('div', { class: 'sfem-item' + (S.sel === x.id ? ' is-sel' : ''), data: { sfemItem: x.id } },
        el('div', { class: 'sfem-row' }, el('strong', { textContent: x.id }), title,
          faces !== null ? el('span', { textContent: t('item.faces', { n: faces }) }) : null,
          faces !== null ? btn(picking ? t('act.done') : t('act.pick'), 'pick', () => (picking ? app.stopPick() : app.startPick(x.id))) : null,
          btn(t('act.remove'), 'remove', () => app.remove(x.id))),
        body || null);
    }
  }
  return { app, S, mount, render };
}
