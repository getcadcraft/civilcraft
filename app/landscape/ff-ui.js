/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ff-ui.js — freeform objects on the page (0.7 LD.7, session `landscape`): More › Freeform object… reads an STL, OBJ or a
 * CadCraft library item (.json with a mesh body), the next click places it; Properties: its base (follows the ground / cuts
 * the ground at an elevation), turn, IFC class and its quantities measured from the mesh. landscape-ui.js composes it.
 *
 *   createFfUi(ctx, { edit, LS, U }) → { file, tools, closed, hints, command, click, finish, isMine, pick, props, grip, remove,
 *     sceneItems(unitPerMm), overlay(c2d, toScreen, C, sel), elements(), updateTools() }
 */
import { readStl, readObj, meshFromItem, cleanFreeform, meshQuantities, footprint, placed, freeformSceneItems, freeformElements, CLASSES } from './freeform.js';
import { inside } from './planting.js';
import { t } from '../i18n.js';
import { fixed } from '../units.js';

export function createFfUi(ctx, { edit, LS, U }) {
  const { el } = ctx;
  const P = () => ctx.project();
  const list = () => LS().freeform || [];
  const find = (id) => list().find((f) => f.id === id) || null;
  let pending = null;   // { name, mesh } waiting for its click
  const file = el('input', { type: 'file', accept: '.stl,.obj,.json', className: 'visually-hidden', tabIndex: -1, 'aria-hidden': 'true', 'data-ls-ff-file': '' });
  ctx.root.append(file);
  file.addEventListener('change', async () => {
    const f = file.files?.[0]; file.value = '';
    if (!f) return;
    if (f.size > 64 * 1024 * 1024) { ctx.say(t('ls.ff.big')); return; }
    try {
      const scale = /\.json$/i.test(f.name) ? 1 : U() === 'm' ? 1000 : 304.8;   // a mesh file in the project's units (m or ft) → mm
      const mesh = /\.stl$/i.test(f.name) ? readStl(new Uint8Array(await f.arrayBuffer()), { scale }) : /\.obj$/i.test(f.name) ? readObj(await f.text(), { scale }) : meshFromItem(JSON.parse(await f.text()));
      if (!mesh) throw new Error('not-mesh');
      pending = { name: f.name.replace(/\.[^.]+$/, '').slice(0, 120), mesh };
      ctx.setTool('ls-freeform');
      ctx.say(t('ls.ff.place', { name: pending.name, n: mesh.indices.length / 3 }));
    } catch (e) { ctx.say(t(e.message === 'too-big' ? 'ls.ff.toobig' : 'ls.ff.bad', { max: 50000 })); }
  });
  function command(c) { if (c !== 'ls-freeform-open') return false; file.click(); return true; }
  function click(tool, w) {
    if (tool !== 'ls-freeform') return false;
    if (!pending) { ctx.setTool('select'); return true; }
    const id = P().nextId('l'), rec = cleanFreeform([{ id, name: pending.name, mesh: pending.mesh, at: { x: w.x, y: w.y, rot: 0 }, base: 'follow' }])[0];
    edit(t('ls.ff.undo.place'), (l) => { l.freeform = [...(l.freeform || []), rec]; });
    pending = null;
    ctx.setTool('select'); ctx.select({ kind: 'ls-ff', id });
    return true;
  }
  const isMine = (sel) => sel?.kind === 'ls-ff';
  function pick(w, tol) { for (const f of [...list()].reverse()) if (inside(w.x, w.y, footprint(f, U())) || Math.hypot(w.x - f.at.x, w.y - f.at.y) <= tol) return { kind: 'ls-ff', id: f.id }; return null; }
  function grip(sel) { const f = isMine(sel) && find(sel.id); return f ? { list: [f.at], only: 0, label: t('ls.ff.undo.move'), get: () => { const g = find(sel.id); return g ? [g.at] : null; } } : null; }
  function remove(sel) { const f = isMine(sel) && find(sel.id); if (!f) return false; edit(t('ls.undo.delete'), (l) => { l.freeform = l.freeform.filter((x) => x.id !== f.id); }); return true; }
  function props(sel, box, head) {
    const f = isMine(sel) && find(sel.id);
    if (!f) return false;
    const set = (fn) => edit(t('ls.ff.undo.edit', { name: f.name }), () => fn(find(f.id)));
    const fields = [];
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-ff-name', value: f.name, maxLength: 120 });
    nm.addEventListener('change', () => set((x) => { x.name = nm.value.trim().slice(0, 120) || f.name; }));
    const base = el('select', { className: 'cv-select', id: 'cv-ff-base', 'data-ls-ff-base': '' }, el('option', { value: 'follow' }, t('ls.ff.follow')), el('option', { value: 'cut' }, t('ls.ff.cut')));
    base.value = f.base; base.addEventListener('change', () => set((x) => { x.base = base.value; }));
    const cls = el('select', { className: 'cv-select', id: 'cv-ff-class' }, ...CLASSES.map((c) => el('option', { value: c }, c)));   // IFC class names, shown as they are
    cls.value = f.ifc.class; cls.addEventListener('change', () => set((x) => { x.ifc = { ...x.ifc, class: cls.value }; }));
    const num = (label, id, value, fn) => fields.push(el('label', { for: id }, label), ctx.numInput(value ?? '', (v) => { const n = v.trim() === '' ? null : Number(v); if (n !== null && !Number.isFinite(n)) return false; if (fn(n) === false) return false; return true; }, { label, id, calc: false }));
    fields.push(el('label', { for: 'cv-ff-name' }, t('ls.b.name')), nm, el('label', { for: 'cv-ff-base' }, t('ls.ff.base')), base);
    if (f.base === 'cut') {
      num(t('ls.gr.f.z', { u: U() === 'm' ? 'm' : 'ft' }), 'cv-ff-z', f.baseZ, (n) => set((x) => { x.baseZ = n; }));
      num(t('ls.gr.f.cut'), 'cv-ff-cs', f.cut, (n) => { if (!(n > 0)) return false; set((x) => { x.cut = n; }); });
      num(t('ls.gr.f.fill'), 'cv-ff-fs', f.fill, (n) => { if (!(n > 0)) return false; set((x) => { x.fill = n; }); });
    }
    num(t('ls.ff.rot'), 'cv-ff-rot', f.at.rot, (n) => { if (n === null) return false; set((x) => { x.at = { ...x.at, rot: ((n % 360) + 360) % 360 }; }); });
    fields.push(el('label', { for: 'cv-ff-class' }, t('ls.ff.class')), cls);
    const q = meshQuantities(f.mesh), pl = placed(f, ctx.surface(), U());
    const v = f.base === 'cut' ? P().volumes()?.items?.find((x) => x.id === f.id) : null;
    const facts = [[t('ls.ff.q.base'), fixed(pl.base, 2)], [t('ls.ff.q.volume'), q.volume === null ? t('ls.ff.q.open') : fixed(q.volume, 3) + ' m³'], [t('ls.ff.q.area'), fixed(q.area, 2) + ' m²'], [t('ls.ff.q.foot'), fixed(q.footprint, 2) + ' m²'], [t('ls.ff.q.height'), fixed(q.height, 3) + ' m']];   // i18n-ignore: units
    if (f.base === 'follow') facts.push([t('ls.ff.q.below'), t('ls.ff.q.est', { v: fixed(pl.belowGround, 3) })]);
    if (v) facts.push([t('ls.gr.cut'), fixed(v.cut, 1)], [t('ls.gr.fill'), fixed(v.fill, 1)]);
    head.textContent = t('ls.ff.head');
    box.replaceChildren(el('div', { className: 'cv-props' }, ...fields), el('div', { className: 'cv-props', 'data-ls-ff-facts': '' }, ...facts.flatMap(([a, b]) => [el('span', { className: 'k' }, a), el('span', { className: 'v' }, b)])),
      el('p', { className: 'cv-note' }, t('ls.ff.note')),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => ctx.command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    return true;
  }
  function overlay(c2d, toScreen, C, sel) {
    const f = isMine(sel) && find(sel.id);
    if (!f) return;
    c2d.save(); c2d.strokeStyle = C.action; c2d.lineWidth = 2.5; c2d.beginPath();
    footprint(f, U()).forEach((p, i) => { const q = toScreen(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
    c2d.closePath(); c2d.stroke(); c2d.restore();
  }
  return { tools: ['ls-freeform'], closed: new Set(), hints: { 'ls-freeform': 'ls.ff.hint' }, command, click, finish: () => false, isMine, pick, props, grip, remove, overlay, updateTools: () => {},
    sceneItems: (unitPerMm) => freeformSceneItems(LS(), U(), { unitPerMm }), elements: () => freeformElements(LS(), ctx.surface(), U()) };
}
