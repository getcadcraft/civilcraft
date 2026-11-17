/* SPDX-License-Identifier: Apache-2.0 */
/**
 * os-panel.js — the Open solver cases panel and its logic, shared by every host (lib/opensolvers; suggestion 1309). The host is a thin adapter:
 *
 *   host = {
 *     t(key, vars) → string                               words (the add-on's lang file)
 *     name() → string                                      the document's name (the case is named after it)
 *     setup: { get() → setup | null, set(setup, label) }   the settings in the document (one undo step per set where the host has undo)
 *     faces: { pick(fn) → stop(), mark(refs), resolve(refs) → { indices, gone }, available() → bool }
 *     surface() → { positions, indices, triFace } | null   the model's triangles (mm) and the host face of each
 *     mesh({ h }) → Promise<{ mesh: { nodes, tets10, btri6, bface }, info: { h, volume } }>   the host's own tetrahedral mesher
 *     zip(files: [{ name, data }]) → Uint8Array            the host's zip writer
 *     download(name, bytes, mime)                          hand a file to the person
 *     pickFiles(accept) → Promise<[{ name, text }]>         the person chooses result files
 *     bodies: { show(bodies, name) → count, clear() → bool, shown() → bool }   the host's result display
 *     conductivity?(presetId) → W/(m·K) | null             the host's own material data
 *     otherStudy?() → { from, groups, material } | null    fixtures and loads of the host's own study, to copy
 *     onChange(fn), onRefresh?(fn), status?(text)
 *   }
 *   createOpenSolvers(host) → { app, S, mount(pane), render() }. `app` holds every action (Node tests drive it without a DOM).
 * The engine never starts a program: it writes a case folder as a .zip and reads result files the person brings back.
 */
import { newSetup, readSetup, PRESETS, FLUIDS, ROLES, STRUCTURE_ROLES, DIR_NAMES, DIRS } from './os-setup.js';
import { foamCase, flowInfo, VERSIONS as FOAM_VERSIONS } from './os-foam.js';
import { asterCase, parseAsterResult, asterFrames, ASTER_VERSION } from './os-aster.js';
import { radiossCase, RADIOSS_VERSION } from './os-radioss.js';
import { parseVtk, surfaceOf, fieldList, fieldValues, displacementOf, parseForces } from './os-vtk.js';
import { bands, maxMag } from './os-plot.js';
import { bounds, patchStats, faceTriangles, safeName } from './os-geom.js';
import { PROGRAMS } from './os-programs.js';

const clone = (v) => JSON.parse(JSON.stringify(v));
export const sig = (v, n = 4) => (Number.isFinite(v) ? +v.toPrecision(n) : v);
const sameRef = (a, b) => a.name === b.name && Math.hypot(a.at[0] - b.at[0], a.at[1] - b.at[1], a.at[2] - b.at[2]) < 1e-6;
const natural = (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true });
/** Problems that stop an export (the rest are warnings written beside the case). */
export const BLOCKING = ['no_inlet', 'no_outlet', 'no_location', 'no_fixed', 'no_load', 'no_density', 'no_conductivity', 'no_thermal', 'no_motion', 'bad_elements', 'no_elements'];
const CSS = '[data-osc].osc{padding:.5rem .75rem;font-size:.85em;box-sizing:border-box}.osc h4{margin:.9rem 0 .3rem;font-size:1em}.osc .osc-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:.25rem .6rem;align-items:center;margin:.3rem 0}'
  + '.osc .osc-grid .k{opacity:.75}.osc input,.osc select{max-width:100%;box-sizing:border-box}.osc .osc-row{display:flex;flex-wrap:wrap;gap:.3rem;margin:.3rem 0;align-items:center}.osc .osc-item{border:1px solid var(--pc-line,#8884);border-radius:3px;padding:.3rem .45rem;margin:.3rem 0}'
  + '.osc .osc-item.is-sel{border-color:#2a8bd0;box-shadow:0 0 0 1px #2a8bd0}.osc .osc-legend{display:flex;height:.8rem;margin:.4rem 0;border-radius:2px;overflow:hidden}.osc .osc-swatch{flex:1 1 0;min-width:.5rem}'
  + '.osc table{width:100%;border-collapse:collapse;font-size:.9em;margin:.3rem 0}.osc td,.osc th{text-align:right;padding:.1rem .3rem;border-bottom:1px solid var(--pc-line,#8884)}.osc td:first-child,.osc th:first-child{text-align:left}'
  + '.osc ul.osc-warn{margin:.3rem 0;padding-left:1.1rem}.osc li.is-error{color:var(--pc-danger,#c0392b)}.osc li.is-warn{border-left:3px solid #d9a21b;padding-left:.4rem;list-style:none;margin-left:-1rem}.osc .osc-note{opacity:.8;margin:.5rem 0}'
  + '.osc .osc-x{border:0;background:none;color:inherit;opacity:.6;cursor:pointer;padding:0 .25rem;font-size:1em;line-height:1;margin-left:auto}.osc .osc-x:hover{opacity:1}'
  + '.osc .osc-fold{display:flex;width:100%;align-items:center;justify-content:space-between;gap:.5rem;border:0;border-top:1px solid var(--pc-line,#8884);background:none;color:inherit;font:inherit;font-weight:600;padding:.5rem 0;margin-top:.8rem;cursor:pointer;text-align:left}'
  + '.osc .osc-need{margin:.4rem 0 .7rem}.osc .osc-need a{word-break:break-all}.osc .osc-files{max-height:9rem;overflow:auto;font-family:ui-monospace,monospace;font-size:.85em;margin:.3rem 0;padding:.3rem .4rem;border:1px solid var(--pc-line,#8884);border-radius:3px;white-space:pre}';

export function createOpenSolvers(host) {
  const t = (k, v) => host.t(k, v);
  const S = { busy: false, msg: '', mesh: null, meshInfo: null, picking: null, sel: null, problems: [], exported: null, frames: [], frame: 0, forces: null, unit: null, legend: null, needOpen: false, stale: false };
  let pane = null, stopPick = null;
  const tell = (m) => { S.msg = m; try { host.status?.(m); } catch { /* no status line */ } render(); };
  const get = () => host.setup.get() || newSetup();
  const put = (fn, label) => { const s = clone(get()); fn(s); host.setup.set(readSetup(s), label); };
  const guard = (fn) => { try { return fn(); } catch (e) { tell(String((e && e.message) || e)); return null; } };
  const tick = () => new Promise((r) => setTimeout(r, 20));
  const wording = (p) => t('p.' + p.code, p);
  const caseName = () => safeName(String(host.name() || 'part').replace(/\.partcraft(\.json)?$|\.json$/i, ''), 'part', 24);
  /** Roles the current target (and study kind) reads. */
  const rolesNow = (s = get()) => (s.target === 'structure' ? STRUCTURE_ROLES[s.structure.kind] : s.target === 'flow' && s.flow.kind === 'external' ? ['wall'] : ROLES[s.target]);
  const resolved = (s, gone = []) => s.groups.map((g) => { const r = host.faces.resolve(g.faces); if (r.gone) gone.push(g.id); return { ...g, faces: r.indices }; });

  const app = {
    t, S, get, sig, rolesNow,
    /** Change one setting by its path ('flow.speed', 'target', 'h', 'impact.jc.a', 'impact.v0.1'). */
    set(path, value) {
      return guard(() => {
        put((s) => { const keys = path.split('.'); let o = s; for (const k of keys.slice(0, -1)) o = o[k]; o[keys[keys.length - 1]] = value;
          if (path === 'flow.fluid' && FLUIDS[value]) Object.assign(s.flow, FLUIDS[value]);
          if (path === 'flow.nu' || path === 'flow.rho') s.flow.fluid = 'custom';
        }, t('undo.settings'));
        if (path === 'h') { S.mesh = null; S.meshInfo = null; }
        if (path === 'target') { app.stopPick(); S.sel = null; marks(); }
        render();
      });
    },
    setMaterial(id, patch = {}) {
      return guard(() => { put((s) => {
        const k = id !== 'custom' ? (host.conductivity?.(id) ?? null) : s.material.k;
        s.material = id === 'custom' ? { ...s.material, id: 'custom', ...patch } : { id, ...PRESETS[id], k, ...patch };
      }, t('undo.material')); render(); });
    },
    addGroup(role) {
      let id;
      guard(() => put((s) => { let n = 1; while (s.groups.some((x) => x.id === 'g' + n)) n++; id = 'g' + n; s.groups.push({ id, role, faces: [] }); }, t('undo.group_add')));
      if (id) app.startPick(id);
      return id;
    },
    editGroup(id, patch) { return guard(() => { put((s) => { Object.assign(s.groups.find((g) => g.id === id), patch); }, t('undo.group_edit')); render(); }); },
    remove(id) { guard(() => { put((s) => { s.groups = s.groups.filter((g) => g.id !== id); }, t('undo.remove')); if (S.sel === id) { app.stopPick(); S.sel = null; } marks(); render(); }); },
    startPick(id) {
      app.stopPick();
      if (!host.faces.available()) { tell(t('msg.no_faces')); return; }
      S.sel = id; S.picking = id;
      stopPick = host.faces.pick((ref) => app.toggleFace(id, ref));
      marks(); tell(t('msg.pick', { id }));
    },
    stopPick() { if (stopPick) { try { stopPick(); } catch { /* gone */ } } stopPick = null; if (S.picking) { S.picking = null; render(); } },
    toggleFace(id, ref) {
      return guard(() => {
        put((s) => {
          const g = s.groups.find((x) => x.id === id); if (!g) return;
          const k = g.faces.findIndex((f) => sameRef(f, ref));
          if (k >= 0) g.faces.splice(k, 1); else { if (g.faces.length >= 64) throw new Error(t('msg.max_faces')); g.faces.push({ name: ref.name, at: ref.at.slice() }); }
        }, t('undo.pick', { id }));
        marks(); render();
      });
    },
    /** Copy the fixtures, loads and material of the host's own study into this case. */
    copyStudy() {
      return guard(() => {
        const o = host.otherStudy?.();
        if (!o || !o.groups.length) { tell(t('msg.copy_none')); return 0; }
        const surface = host.surface();
        let n = 0;
        put((s) => {
          for (const g of o.groups) {
            let role = g.role, extra = {};
            if (role === 'force-normal') {   // a force along the faces' normal: made a vector here (into the part when positive, as the host's study has it)
              const idx = host.faces.resolve(g.faces).indices, st = surface && idx.length ? patchStats(surface, faceTriangles(surface, idx)) : null;
              if (!st) continue;
              role = 'force'; extra = { F: st.normal.map((v) => +(-v * g.total).toPrecision(9)) };
            } else if (role === 'force') extra = { F: g.F.slice() }; else if (role === 'pressure') extra = { p: g.p };
            if (!ROLES[s.target].includes(role)) continue;
            let k = 1; while (s.groups.some((x) => x.id === 'g' + k)) k++;
            s.groups.push({ id: 'g' + k, role, faces: g.faces.map((f) => ({ name: f.name, at: f.at.slice() })), ...extra }); n++;
          }
          if (o.material) s.material = { ...s.material, ...o.material };
        }, t('undo.copy'));
        tell(t('msg.copied', { n, from: t('from.' + o.from) }));
        return n;
      });
    },
    async mesh() {
      if (S.busy) return null;
      S.busy = true; S.msg = t('msg.meshing'); render();
      try {
        await tick();
        const r = await host.mesh({ h: get().h });
        S.mesh = r.mesh; S.meshInfo = r.info;
        S.msg = t('msg.meshed', { n: r.mesh.tets10.length / 10, nodes: r.mesh.nodes.length / 3 });
        return r;
      } catch (e) { S.msg = t('msg.failed', { msg: String((e && e.message) || e) }); return null; } finally { S.busy = false; render(); }
    },
    /** The numbers the panel shows before writing (flow cases), or null. */
    info() {
      const s = get(), surface = host.surface();
      if (s.target !== 'flow' || !surface) return null;
      try { return flowInfo({ flow: s.flow, groups: resolved(s), surface }); } catch { return null; }
    },
    /** The case as files (no zip, no download): { name, files, info, problems } or null with a message. */
    async build() {
      const s = get(), surface = host.surface(), gone = [];
      if (!surface) { tell(t('msg.no_part')); return null; }
      const groups = resolved(s, gone), name = caseName();
      let r;
      if (s.target === 'flow') r = foamCase({ name, flow: s.flow, groups, surface });
      else {
        if (!S.mesh) { const m = await app.mesh(); if (!m) return null; }
        r = s.target === 'structure' ? asterCase({ name, structure: s.structure, material: s.material, groups, mesh: S.mesh }) : radiossCase({ name, impact: s.impact, material: s.material, groups, mesh: S.mesh });
      }
      const problems = [...r.problems, ...gone.map((id) => ({ code: 'faces_gone', id }))];
      return { ...r, name: r.name || name, problems };
    },
    async exportCase() {
      if (S.busy) return null;
      const r = await app.build();
      if (!r) return null;
      S.problems = r.problems.map((p) => ({ ...p, severity: BLOCKING.includes(p.code) ? 'error' : 'warn' }));
      if (S.problems.some((p) => p.severity === 'error')) { S.exported = null; tell(t('msg.not_written', { why: wording(S.problems.find((p) => p.severity === 'error')) })); return null; }
      const s = get(), suffix = { flow: 'openfoam', structure: 'code-aster', impact: 'openradioss' }[s.target], folder = r.name + '-' + suffix;
      const files = r.files.map((f) => ({ name: folder + '/' + f.name, data: f.data }));
      try {
        const zip = host.zip(files);
        host.download(folder + '.zip', zip, 'application/zip');
        S.exported = { target: s.target, zip: folder + '.zip', files: files.map((f) => f.name), bytes: zip.length };
        tell(t('msg.written', { name: folder + '.zip', n: files.length }));
        return S.exported;
      } catch (e) { tell(t('msg.failed', { msg: String((e && e.message) || e) })); return null; }
    },
    /** Read result files the person brings back: legacy ASCII VTK (any number: frames), a structure result listing, a force file. */
    async importResults(given = null) {
      if (S.busy) return null;
      const files = given || await host.pickFiles('.vtk,.resu,.dat,.txt');
      if (!files || !files.length) return null;
      S.busy = true; S.msg = t('msg.reading'); render();
      await tick();
      const frames = [], bad = []; let forces = null;
      try {
        for (const f of files) {
          try {
            if (/^\s*#\s*vtk/i.test(f.text.slice(0, 200))) { const vtk = parseVtk(f.text); frames.push({ name: f.name, vtk, surface: surfaceOf(vtk), kind: 'vtk', deformed: /^vtk output/i.test(vtk.title) && !!vtk.pointData.NODE_ID }); }   // the explicit solver's converter writes the points already moved
            else if (/ASTER|CHAMP AUX NOEUDS|CHAMP PAR ELEMENT|NUMERO D'ORDRE/i.test(f.text.slice(0, 20000))) {
              if (!S.mesh) { const m = await host.mesh({ h: get().h }); S.mesh = m.mesh; S.meshInfo = m.info; }
              for (const fr of asterFrames(parseAsterResult(f.text), S.mesh)) frames.push({ name: f.name + ' ' + fr.label, vtk: fr.vtk, surface: surfaceOf(fr.vtk), kind: 'aster', freq: fr.freq });
            } else forces = { name: f.name, ...parseForces(f.text) };
          } catch (e) { bad.push(f.name + ': ' + String((e && e.message) || e)); }
        }
        if (frames.length) {
          frames.sort(natural);
          S.frames = frames; S.frame = frames.length - 1; S.legend = null; S.unit = null;
          const keys = fieldList(frames[S.frame].vtk).map((x) => x.key), cur = get().plot.field;
          if (!keys.includes(cur)) { const want = app.preferred(keys); put((s) => { s.plot.field = want; }, t('undo.plot')); }
        }
        if (forces) S.forces = forces;
        S.msg = bad.length ? t('msg.read_bad', { list: bad.join('; ') }) : frames.length || forces ? t('msg.read', { n: frames.length, forces: forces ? 1 : 0 }) : t('msg.read_none');
        return { frames: frames.length, forces: !!forces, bad };
      } finally { S.busy = false; render(); }
    },
    /** The field a new result opens on: pressure for flow, von Mises else, then displacement. */
    preferred(keys) {
      const tgt = get().target, pick = (re) => keys.find((k) => re.test(k));
      return (tgt === 'flow' ? pick(/:p$/) || pick(/:p[:_]/) || pick(/:U:mag$/) : pick(/von_?mises|vonm|VMIS/i) || pick(/:vm$/) || pick(/disp.*:mag$/i) || pick(/DEPL:mag$/)) || keys[0] || null;
    },
    fields() { const f = S.frames[S.frame]; return f ? fieldList(f.vtk) : []; },
    fieldLabel(f) { return f.name + (f.derived === 'mag' ? ' ' + t('field.mag') : f.derived === 'vm' ? ' ' + t('field.vm') : f.derived ? ' ' + f.derived : '') + ' (' + t('field.' + f.where) + ')'; },
    setFrame(i) { S.frame = Math.max(0, Math.min(S.frames.length - 1, i)); render(); },
    setUnit(u) { S.unit = u; render(); },
    setPlot(patch) { return guard(() => { put((s) => { Object.assign(s.plot, patch); }, t('undo.plot')); render(); }); },
    /** mm per length unit of the result file: flow results are in metres, the solid decks in mm; the person can say otherwise. */
    toMm() { const f = S.frames[S.frame]; const u = S.unit || (f && f.kind === 'vtk' && get().target === 'flow' ? 'm' : 'mm'); return u === 'm' ? 1000 : 1; },
    show() {
      return guard(() => {
        const f = S.frames[S.frame], p = get().plot;
        if (!f) { tell(t('plot.none')); return 0; }
        const values = p.field ? fieldValues(f.vtk, p.field) : null;
        if (!values) { tell(t('plot.no_field')); return 0; }
        const toMm = app.toMm(), disp = get().target === 'flow' ? null : displacementOf(f.vtk), b0 = bounds(f.surface.positions), size = b0.diag * toMm || 1;
        const um = maxMag(disp) * toMm, scale = !disp ? 1 : p.scale !== null ? p.scale : f.deformed ? 1 : um > 0 && um < 0.02 * size ? Math.max(1, +(0.05 * size / um).toPrecision(2)) : 1;
        const part = host.surface(), pb = part ? bounds(part.positions) : null;
        const offset = p.beside ? [((pb ? pb.size[0] : b0.size[0] * toMm) * 1.25 + 0.1 * size), 0, 0] : [0, 0, 0];
        const b = bands(f.surface, values, { n: 8, disp, scale: f.deformed ? scale - 1 : scale, toMm, offset });   // points already moved: only the extra part of the scale is added
        if (!b || !b.bodies.length) { tell(t('plot.none')); return 0; }
        const fl = app.fields().find((x) => x.key === p.field), name = (fl ? app.fieldLabel(fl) : p.field) + ' — ' + f.name;
        const n = host.bodies.show(b.bodies, name.slice(0, 60));
        S.legend = { ...b, scale, name }; S.stale = false;
        tell(t(b.thinned ? 'plot.shown_thinned' : 'plot.shown', { n, scale: sig(scale, 3), tris: b.triangles }));
        return n;
      });
    },
    clear() { return guard(() => { const ok = host.bodies.clear(); S.legend = null; tell(ok ? t('plot.removed') : t('plot.none_shown')); return ok; }); },
    toggleNeed() { S.needOpen = !S.needOpen; render(); },
    wording,
  };
  const marks = () => { try { const g = get().groups.find((x) => x.id === S.sel); host.faces.mark(g ? g.faces : []); } catch { /* no marks */ } };
  host.onRefresh?.(() => render());
  host.onChange?.(() => { if (S.mesh) { S.mesh = null; S.meshInfo = null; S.msg = t('msg.stale'); } S.exported = null; render(); });

  // ------------------------------------------------------------------------------------------ DOM
  function render() { if (!pane) return; try { draw(); } catch (e) { pane.textContent = String((e && e.message) || e); } }
  function mount(el) { pane = el; if (pane.ownerDocument && !pane.ownerDocument.querySelector('style[data-osc-style]')) { const st = pane.ownerDocument.createElement('style'); st.setAttribute('data-osc-style', ''); st.textContent = CSS; pane.ownerDocument.head.append(st); } render(); }
  function draw() {
    const d = pane.ownerDocument, s = get();
    const el = (tag, props = {}, ...kids) => { const n = d.createElement(tag); for (const [k, v] of Object.entries(props)) { if (k === 'data') for (const [a, b] of Object.entries(v)) n.dataset[a] = b; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else if (k.startsWith('data-') || k.startsWith('aria-')) n.setAttribute(k, v); else if (k === 'class') n.className = v; else if (v !== undefined && v !== false) n[k] = v; } for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : d.createTextNode(String(c))); return n; };
    const btn = (label, act, fn, extra = {}) => el('button', { type: 'button', class: 'pc-btn', textContent: label, data: { oscAct: act }, disabled: S.busy || extra.disabled, onclick: fn });
    const num = (value, on, attrs = {}) => { const i = el('input', { type: 'number', value: value === null || value === undefined ? '' : String(value), step: 'any', ...attrs }); i.addEventListener('change', () => { const v = i.value === '' ? null : Number(i.value); on(Number.isFinite(v) ? v : null); }); return i; };
    const row = (k, ...v) => [el('span', { class: 'k', textContent: k }), el('span', {}, ...v)];
    const sel = (opts, value, on, attrs = {}) => { const x = el('select', attrs); for (const [v, label] of opts) x.append(el('option', { value: v, textContent: label, selected: String(v) === String(value) })); x.addEventListener('change', () => on(x.value)); return x; };
    const field = (path, value, attrs = {}, nullable = false) => num(value, (v) => (v !== null || nullable) && app.set(path, v), { 'data-osc-set': path, ...attrs });
    const check = (path, value) => { const i = el('input', { type: 'checkbox', checked: !!value, 'data-osc-set': path }); i.addEventListener('change', () => app.set(path, i.checked)); return i; };
    const dirSel = (path, value) => sel(DIR_NAMES.map((n, i) => [i, n]), value, (v) => app.set(path, Number(v)), { 'data-osc-set': path });
    const kids = [];
    kids.push(el('p', { class: 'osc-note', data: { oscHonest: '1' }, textContent: t('panel.honest') }));

    // what kind of case
    kids.push(el('h4', { textContent: t('h.case') }));
    kids.push(el('div', { class: 'osc-grid' }, ...row(t('target.label'), sel(['flow', 'structure', 'impact'].map((k) => [k, t('target.' + k)]), s.target, (v) => app.set('target', v), { 'data-osc-target': '' }))));

    if (s.target === 'flow') {
      const f = s.flow, steady = f.model === 'kOmegaSST';
      kids.push(el('div', { class: 'osc-grid' },
        ...row(t('flow.flavour'), sel([['esi', FOAM_VERSIONS.esi], ['foundation', FOAM_VERSIONS.foundation]], f.flavour, (v) => app.set('flow.flavour', v), { 'data-osc-set': 'flow.flavour' })),
        ...row(t('flow.kind'), sel([['external', t('flow.external')], ['internal', t('flow.internal')]], f.kind, (v) => app.set('flow.kind', v), { 'data-osc-set': 'flow.kind' })),
        ...row(t('flow.model'), sel([['kOmegaSST', t('flow.sst')], ['laminar', t('flow.laminar')]], f.model, (v) => app.set('flow.model', v), { 'data-osc-set': 'flow.model' })),
        ...row(t('flow.fluid'), sel([['air', t('fluid.air')], ['water', t('fluid.water')], ['custom', t('fluid.custom')]], f.fluid, (v) => app.set('flow.fluid', v), { 'data-osc-set': 'flow.fluid' })),
        ...row(t('flow.nu'), field('flow.nu', f.nu, { min: 0 })),
        ...row(t('flow.rho'), field('flow.rho', f.rho, { min: 0 })),
        ...(f.kind === 'external' ? [
          ...row(t('flow.speed'), field('flow.speed', f.speed, { min: 0 })),
          ...row(t('flow.dir'), dirSel('flow.dir', f.dir)),
          ...row(t('flow.up'), field('flow.up', f.up, { min: 0.1 })),
          ...row(t('flow.down'), field('flow.down', f.down, { min: 0.1 })),
          ...row(t('flow.side'), field('flow.side', f.side, { min: 0.1 }))] : []),
        ...row(t('flow.cell'), field('flow.cell', f.cell, { min: 0, placeholder: t('auto') }, true)),
        ...row(t('flow.levels'), field('flow.levelMin', f.levelMin, { min: 0, max: 8, step: 1 }), ' ', field('flow.levelMax', f.levelMax, { min: 0, max: 8, step: 1 })),
        ...row(t('flow.layers'), field('flow.layers', f.layers, { min: 0, max: 10, step: 1 })),
        ...(steady ? [
          ...row(t('flow.intensity'), field('flow.intensity', f.intensity, { min: 0.01, max: 100 })),
          ...row(t('flow.mixing'), field('flow.mixing', f.mixing, { min: 0, placeholder: t('auto') }, true)),
          ...row(t('flow.steps'), field('flow.steps', f.steps, { min: 1, step: 1 }))] : [
          ...row(t('flow.dt'), field('flow.dt', f.dt, { min: 0, placeholder: t('auto') }, true)),
          ...row(t('flow.end'), field('flow.endTime', f.endTime, { min: 0 }))]),
        ...row(t('flow.procs'), field('flow.procs', f.procs, { min: 1, max: 512, step: 1 }))));
      kids.push(el('p', { class: 'osc-note', textContent: t(f.kind === 'external' ? 'flow.external_note' : 'flow.internal_note') }));
    } else if (s.target === 'structure') {
      const a = s.structure;
      kids.push(el('div', { class: 'osc-grid' },
        ...row(t('structure.kind'), sel(['static', 'modal', 'thermal'].map((k) => [k, t('structure.' + k)]), a.kind, (v) => app.set('structure.kind', v), { 'data-osc-set': 'structure.kind' })),
        ...(a.kind === 'modal' ? row(t('structure.modes'), field('structure.modes', a.modes, { min: 1, max: 50, step: 1 })) : []),
        ...(a.kind === 'static' ? [...row(t('structure.gravity'), check('structure.gravity', a.gravity)), ...(a.gravity ? row(t('structure.gdir'), dirSel('structure.gdir', a.gdir)) : [])] : [])));
      kids.push(el('p', { class: 'osc-note', textContent: t('structure.note', { v: ASTER_VERSION }) }));
    } else {
      const i = s.impact;
      kids.push(el('div', { class: 'osc-grid' },
        ...row(t('impact.elem'), sel([['tetra4', t('impact.tetra4')], ['tetra10', t('impact.tetra10')]], i.elem, (v) => app.set('impact.elem', v), { 'data-osc-set': 'impact.elem' })),
        ...row(t('impact.law'), sel([['elastic', t('impact.elastic')], ['jc', t('impact.jc')]], i.law, (v) => app.set('impact.law', v), { 'data-osc-set': 'impact.law' })),
        ...(i.law === 'jc' ? [
          ...row(t('impact.jc_a'), field('impact.jc.a', i.jc.a, { min: 0 })), ...row(t('impact.jc_b'), field('impact.jc.b', i.jc.b, { min: 0 })), ...row(t('impact.jc_n'), field('impact.jc.n', i.jc.n, { min: 0 })),
          ...row(t('impact.jc_c'), field('impact.jc.c', i.jc.c, { min: 0 })), ...row(t('impact.jc_eps0'), field('impact.jc.eps0', i.jc.eps0, { min: 0 }))] : []),
        ...['X', 'Y', 'Z'].map((ax, k) => row(t('impact.v0', { axis: ax }), field('impact.v0.' + k, i.v0[k]))).flat(),
        ...row(t('impact.floor'), check('impact.floor', i.floor)),
        ...(i.floor ? [...row(t('impact.floor_dir'), dirSel('impact.floorDir', i.floorDir)), ...row(t('impact.gap'), field('impact.gap', i.gap, { min: 0 }))] : []),
        ...row(t('impact.gravity'), check('impact.gravity', i.gravity)),
        ...row(t('impact.contact'), check('impact.contact', i.contact)),
        ...row(t('impact.tend'), field('impact.tEnd', i.tEnd, { min: 0 })),
        ...row(t('impact.frames'), field('impact.frames', i.frames, { min: 1, max: 1000, step: 1 }))));
      kids.push(el('p', { class: 'osc-note', textContent: t('impact.note', { v: RADIOSS_VERSION }) }));
    }

    // faces by role
    const roles = rolesNow(s);
    kids.push(el('h4', { textContent: t('h.faces') }));
    for (const g of s.groups) {
      if (!roles.includes(g.role)) continue;
      let body = null;
      if (g.role === 'inlet') body = el('div', { class: 'osc-grid' }, ...row(t('g.inlet_u'), num(g.U, (v) => v !== null && app.editGroup(g.id, { U: v }), { min: 0 })));
      else if (g.role === 'outlet') body = el('div', { class: 'osc-grid' }, ...row(t('g.outlet_p'), num(g.p, (v) => v !== null && app.editGroup(g.id, { p: v }))));
      else if (g.role === 'force') body = el('div', { class: 'osc-grid' }, ...['X', 'Y', 'Z'].map((a, i) => row('F' + a + ' (N)', num(g.F[i], (v) => v !== null && app.editGroup(g.id, { F: g.F.map((q, j) => (j === i ? v : q)) })))).flat());
      else if (g.role === 'pressure') body = el('div', { class: 'osc-grid' }, ...row(t('g.pressure'), num(g.p, (v) => v !== null && app.editGroup(g.id, { p: v }))));
      else if (g.role === 'temp') body = el('div', { class: 'osc-grid' }, ...row(t('g.temp'), num(g.T, (v) => v !== null && app.editGroup(g.id, { T: v }))));
      else if (g.role === 'flux') body = el('div', { class: 'osc-grid' }, ...row(t('g.flux'), num(g.q, (v) => v !== null && app.editGroup(g.id, { q: v }))));
      else if (g.role === 'conv') body = el('div', { class: 'osc-grid' }, ...row(t('g.conv_h'), num(g.hc, (v) => v !== null && app.editGroup(g.id, { hc: v }), { min: 0 })), ...row(t('g.conv_t'), num(g.Tinf, (v) => v !== null && app.editGroup(g.id, { Tinf: v }))));
      else if (g.role === 'velocity') body = el('div', { class: 'osc-grid' }, ...['X', 'Y', 'Z'].map((a, i) => row('v' + a + ' (m/s)', num(g.v[i], (v) => v !== null && app.editGroup(g.id, { v: g.v.map((q, j) => (j === i ? v : q)) })))).flat());
      kids.push(item(g, body));
    }
    kids.push(el('div', { class: 'osc-row' }, ...roles.map((r) => btn(t('add.' + r), 'add-' + r, () => app.addGroup(r))),
      s.target !== 'flow' && host.otherStudy ? btn(t('act.copy'), 'copy', () => app.copyStudy()) : null));
    if (s.target === 'flow' && s.flow.kind === 'external') kids.push(el('p', { class: 'osc-note', textContent: t('faces.external_note') }));

    if (s.target !== 'flow') {
      const m = s.material, thermal = s.target === 'structure' && s.structure.kind === 'thermal';
      kids.push(el('h4', { textContent: t('h.material') }));
      kids.push(el('div', { class: 'osc-grid' },
        ...row(t('mat.label'), sel(['steel', 'stainless', 'aluminium', 'titanium', 'abs', 'custom'].map((i) => [i, t('mat.' + i)]), m.id, (v) => app.setMaterial(v), { 'data-osc-material': '' })),
        ...(thermal ? row(t('mat.k'), num(m.k, (v) => v > 0 && app.setMaterial('custom', { k: v }), { min: 0, 'data-osc-k': '' })) : [
          ...row('E (MPa)', num(m.E, (v) => v > 0 && app.setMaterial('custom', { E: v }), { min: 0 })),
          ...row(t('mat.nu'), num(m.nu, (v) => v !== null && app.setMaterial('custom', { nu: v }), { min: 0, max: 0.49 })),
          ...row(t('mat.rho'), num(m.rho, (v) => v !== null && app.setMaterial('custom', { rho: v }), { min: 0 })),
          ...(s.target === 'impact' ? [] : row(t('mat.yield'), num(m.yield, (v) => app.setMaterial('custom', { yield: v }), { min: 0 })))])));
      kids.push(el('h4', { textContent: t('h.mesh') }));
      kids.push(el('div', { class: 'osc-grid' }, ...row(t('mesh.h'), field('h', s.h, { min: 0, placeholder: t('auto') }, true))));
      kids.push(el('div', { class: 'osc-row' }, btn(t('act.mesh'), 'mesh', () => app.mesh())));
      if (S.meshInfo) kids.push(el('p', { data: { oscMesh: '1' }, textContent: t('mesh.info', { n: S.mesh.tets10.length / 10, nodes: S.mesh.nodes.length / 3, h: sig(S.meshInfo.h, 3) }) }));
    } else {
      // the numbers that will be written, shown before the export
      const info = app.info();
      kids.push(el('h4', { textContent: t('h.check') }));
      if (!info) kids.push(el('p', { class: 'osc-note', textContent: t('msg.no_part') }));
      else {
        const g = [...row(t('info.re'), String(sig(info.Re, 3))), ...row(t('info.box'), info.box.max.map((v, a) => sig(v - info.box.min[a], 3)).join(' × ') + ' m'),
          ...row(t('info.cells'), info.n.join(' × ') + ' = ' + info.cells.toLocaleString('en-US')), ...row(t('info.fine'), sig(info.fine * 1000, 3) + ' mm')];
        if (s.flow.model === 'kOmegaSST') g.push(...row(t('info.length'), sig(info.L * 1000, 4) + ' mm'), ...row('k = 1.5 (U I)²', sig(info.k) + ' m²/s²'), ...row('ω = √k / (0.09^¼ L)', sig(info.omega) + ' 1/s'));
        else g.push(...row(t('info.dt'), sig(info.dt) + ' s'));
        g.push(...row(t('info.location'), info.location ? info.location.point.map((v) => sig(v, 4)).join(', ') + ' m' : t('info.location_none')));
        kids.push(el('div', { class: 'osc-grid', data: { oscInfo: '1' } }, ...g));
      }
    }

    // export
    kids.push(el('h4', { textContent: t('h.export') }));
    kids.push(el('p', { class: 'osc-note', textContent: t('export.units_' + s.target) }));
    kids.push(el('div', { class: 'osc-row' }, btn(t('act.export'), 'export', () => app.exportCase())));
    if (S.msg) kids.push(el('p', { data: { oscMsg: '1' }, role: 'status', textContent: S.msg }));
    if (S.problems.length) kids.push(el('ul', { class: 'osc-warn', data: { oscProblems: '1' } }, ...S.problems.map((p) => el('li', { class: 'is-' + p.severity, data: { code: p.code }, textContent: wording(p) }))));
    if (S.exported) kids.push(el('p', { textContent: t('export.files', { name: S.exported.zip, n: S.exported.files.length }) }), el('div', { class: 'osc-files', data: { oscFiles: '1' }, textContent: S.exported.files.join('\n') }));

    // results back
    kids.push(el('h4', { textContent: t('h.results') }));
    kids.push(el('p', { class: 'osc-note', textContent: t('results.how_' + s.target) }));
    kids.push(el('div', { class: 'osc-row' }, btn(t('act.import'), 'import', () => app.importResults())));
    if (S.frames.length) {
      const fl = app.fields(), p = s.plot, fr = S.frames[S.frame];
      kids.push(el('div', { class: 'osc-grid', data: { oscResult: '1' } },
        ...(S.frames.length > 1 ? row(t('res.frame'), sel(S.frames.map((f, i) => [i, f.name]), S.frame, (v) => app.setFrame(Number(v)), { 'data-osc-frame': '' })) : row(t('res.file'), fr.name)),
        ...row(t('res.size'), t('res.size_v', { points: fr.vtk.points.length / 3, cells: fr.vtk.cells.length, tris: fr.surface.tris.length / 3 })),
        ...(fr.freq ? row(t('res.freq'), sig(fr.freq) + ' Hz') : []),
        ...row(t('res.field'), sel(fl.map((f) => [f.key, app.fieldLabel(f)]), p.field, (v) => app.setPlot({ field: v }), { 'data-osc-field': '' })),
        ...row(t('res.unit'), sel([['m', t('res.unit_m')], ['mm', t('res.unit_mm')]], app.toMm() === 1000 ? 'm' : 'mm', (v) => app.setUnit(v), { 'data-osc-unit': '' })),
        ...(s.target === 'flow' ? [] : row(t('plot.scale'), num(p.scale, (v) => app.setPlot({ scale: v }), { min: 0, placeholder: t('auto') }))),
        ...row(t('plot.place'), sel([['beside', t('plot.beside')], ['on', t('plot.on')]], p.beside ? 'beside' : 'on', (v) => app.setPlot({ beside: v === 'beside' }), { 'data-osc-place': '' }))));
      kids.push(el('div', { class: 'osc-row' }, btn(t('act.show'), 'show', () => app.show()), btn(t('act.clear'), 'clear', () => app.clear())));
      if (S.legend) {
        kids.push(el('div', { class: 'osc-legend', data: { oscLegend: '1' } }, ...S.legend.legend.map((b) => el('span', { class: 'osc-swatch', style: 'background:' + b.color }))));
        kids.push(el('p', { textContent: t('plot.range', { name: S.legend.name, lo: sig(S.legend.lo, 4), hi: sig(S.legend.hi, 4) }) }));
      }
    }
    if (S.forces) {
      const F = S.forces.last;
      kids.push(el('table', { data: { oscForces: '1' } }, el('tr', {}, el('th', { textContent: t('forces.title', { t: sig(F.time) }) }), ...['X', 'Y', 'Z'].map((a) => el('th', { textContent: a + ' (N)' }))),
        ...[['total', F.total], ['pressure', F.pressure], ['viscous', F.viscous]].filter(([, v]) => v).map(([k, v]) => el('tr', {}, el('td', { textContent: t('forces.' + k) }), ...v.map((x) => el('td', { textContent: String(sig(x, 5)) }))))));
      kids.push(el('p', { class: 'osc-note', textContent: t('forces.note', { n: S.forces.rows.length }) }));
    }

    // what you need on your computer (collapsible; caret on the right, down = open)
    kids.push(el('button', { type: 'button', class: 'osc-fold', 'aria-expanded': String(S.needOpen), data: { oscAct: 'need' }, onclick: () => app.toggleNeed() }, el('span', { textContent: t('h.need') }), el('i', { class: 'bi bi-chevron-' + (S.needOpen ? 'down' : 'up'), 'aria-hidden': 'true' })));
    if (S.needOpen) {
      const box = el('div', { data: { oscNeed: '1' } }, el('p', { textContent: t('need.separate') }));
      for (const pr of PROGRAMS) box.append(el('div', { class: 'osc-need' }, el('strong', { textContent: pr.name }), el('div', { textContent: t('need.for_' + pr.target) }),
        el('div', {}, t('need.licence') + ' ', el('span', { textContent: pr.licence })), el('div', {}, t('need.get') + ' ', el('a', { href: pr.url, target: '_blank', rel: 'noopener noreferrer', textContent: pr.url }))));
      box.append(el('p', { class: 'osc-note', textContent: t('need.never') }));
      kids.push(box);
    }
    kids.push(el('p', { class: 'osc-note', data: { oscNote: '1' }, textContent: t('note.unrun') + ' ' + t('note.liability') }));
    pane.replaceChildren(...kids);
    pane.classList.add('osc'); pane.setAttribute('data-osc', '');

    function item(g, body) {
      const picking = S.picking === g.id;
      return el('div', { class: 'osc-item' + (S.sel === g.id ? ' is-sel' : ''), data: { oscItem: g.id, role: g.role } },
        el('div', { class: 'osc-row' }, el('strong', { textContent: g.id }), el('span', { textContent: t('role.' + g.role) }), el('span', { textContent: t('item.faces', { n: g.faces.length }) }),
          btn(picking ? t('act.done') : t('act.pick'), 'pick', () => (picking ? app.stopPick() : app.startPick(g.id))),
          el('button', { type: 'button', class: 'osc-x', 'aria-label': t('act.remove'), data: { oscAct: 'remove' }, disabled: S.busy, onclick: () => app.remove(g.id) }, '×')),
        body);
    }
  }
  return { app, S, mount, render };
}
void DIRS;
