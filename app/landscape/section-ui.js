/* SPDX-License-Identifier: Apache-2.0 */
/**
 * section-ui.js — landscape sections and the publish set on the page (0.8 LA.9, session `landscape-arch_PART_4`). Levels › Section line
 * (two clicks) makes section A, B, C…; its Properties (name, how far either side plants are drawn, vertical exaggeration); its marker on the
 * plan names the sheet it is drawn on. Sheets › Publish set: every landscape sheet in one PDF that opens with a sheet list (L-1, L-2…), and a
 * DWG per sheet (layers kept, L-* names), in one .zip. The maths is section-ls.js and lib/landscape/section.js; sheets go through plot.js.
 *
 *   createSectionUi(ctx, { edit, LS, U, index, makeSheets }) → { tools, closed, hints, command, click, finish, isMine, pick, props, grip,
 *     remove, sceneItems(unitPerMm), overlay, updateTools, sheets({ paper, scale }), drawings(), publish(opts), refs() }
 */
import { cleanSections, sectionInput, publishOrder, sectionSheets, markerItems, sheetIndex, dwgEntitiesOf } from './section-ls.js';
import { sectionDrawing } from './section.js';
import { SHEET_LAYERS } from './sheets.js';
import { edgeDist } from './planting.js';
import { toPdfPages } from '../plot.js';
import { toDxfEntities, LAYERS } from '../scene.js';
import { t } from '../i18n.js';

const TOOLS = ['ls-section'];
const SECT_LAYERS = [['L-SECT-EXST', 8], ['L-SECT-GRND', 7], ['L-SECT-WALL', 7], ['L-SECT-BLDP', 42], ['L-SECT-PLNT', 3], ['L-SECT-TEXT', 7]];

export function createSectionUi(ctx, { edit, LS, U, index, makeSheets }) {
  const { el } = ctx;
  const P = () => ctx.project();
  const list = () => LS().sections || [];
  const find = (id) => list().find((s) => s.id === id) || null;
  const nextName = () => { const used = new Set(list().map((s) => s.name)); for (let i = 0; i < 26 * 27; i++) { const n = i < 26 ? String.fromCharCode(65 + i) : String.fromCharCode(64 + Math.floor(i / 26)) + String.fromCharCode(65 + (i % 26)); if (!used.has(n)) return n; } return 'S'; };
  function command(c) { if (!TOOLS.includes(c)) return false; ctx.setTool(ctx.tool() === c ? 'select' : c); if (ctx.tool() === c) ctx.say(t('ls.sec.hint')); return true; }
  function finish(tool, pts) {
    if (pts.length < 2) { ctx.say(t('ls.hedge.need2')); return false; }
    const id = P().nextId('l'), name = nextName();
    const rec = cleanSections([{ id, name, pts: [pts[0], pts[pts.length - 1]] }], U())[0];
    if (!rec) return false;
    edit(t('ls.sec.undo.add', { name }), (l) => { l.sections = [...(l.sections || []), rec]; });
    ctx.select({ kind: 'ls-sec', id });
    ctx.say(t('ls.sec.done', { name }));
    return true;
  }
  const isMine = (sel) => sel?.kind === 'ls-sec';
  const pick = (w, tol) => { for (const s of [...list()].reverse()) if (edgeDist(w.x, w.y, s.pts, false) <= tol) return { kind: 'ls-sec', id: s.id }; return null; };
  const grip = (sel) => { const s = isMine(sel) && find(sel.id); return s ? { list: s.pts, label: t('ls.undo.corner'), get: () => find(sel.id)?.pts } : null; };
  function remove(sel) { const s = isMine(sel) && find(sel.id); if (!s) return false; edit(t('ls.undo.delete'), (l) => { l.sections = l.sections.filter((x) => x.id !== s.id); }); return true; }
  const surfaces = () => ({ existing: ctx.existing?.() || null, proposed: P().graded().surface || null });
  const drawingOf = (s) => sectionDrawing(sectionInput(s, LS(), index(), U(), surfaces()), { vex: s.vex });
  const drawings = () => list().map((sec) => ({ sec, drawing: drawingOf(sec) }));
  /** Each section's sheet number, from the publish order (renumbers itself when sheets or sections change). */
  function refs(kinds) { const out = {}; for (const e of publishOrder(LS(), kinds)) for (const id of e.sections || []) out[id] = e.number; return out; }
  function props(sel, box, head) {
    const s = isMine(sel) && find(sel.id);
    if (!s) return false;
    head.textContent = t('ls.sec.title', { name: s.name });
    const put = (fn) => edit(t('ls.h.undo.edit', { name: s.name }), () => fn(find(s.id)));
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-sec-name', value: s.name, maxLength: 12 });
    nm.addEventListener('change', () => put((x) => { x.name = nm.value.trim().slice(0, 12) || x.name; }));
    const vex = el('select', { className: 'cv-select', id: 'cv-sec-vex' }, ...[1, 2, 5, 10].map((v) => el('option', { value: String(v) }, '×' + v)));
    vex.value = String(s.vex);
    vex.addEventListener('change', () => put((x) => { x.vex = Number(vex.value); }));
    const d = drawingOf(s);
    box.replaceChildren(el('div', { className: 'cv-props' }, el('label', { for: 'cv-sec-name' }, t('ls.b.name')), nm,
      el('label', { for: 'cv-sec-band' }, t('ls.sec.band', { u: U() === 'm' ? 'm' : 'ft' })), ctx.numInput(s.band, (v) => { const n = Number(v); if (!(n >= 0 && n <= 1000)) return false; put((x) => { x.band = n; }); return true; }, { label: t('ls.sec.band', { u: U() }), id: 'cv-sec-band', calc: false }),
      el('label', { for: 'cv-sec-vex' }, t('ls.sec.vex')), vex),
      el('p', { className: 'cv-note', 'data-sec-sheet': '' }, t('ls.sec.on', { sheet: refs()[s.id] || '—' })),
      el('p', { className: 'cv-note', 'data-sec-count': '' }, t('ls.sec.cuts', { n: d.paths.length })),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => ctx.command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    return true;
  }
  const sceneItems = (unitPerMm) => (list().length ? markerItems(LS(), U(), { unitPerMm, refs: refs() }) : []);
  function overlay(c2d, toScreen, C, sel) {
    const s = isMine(sel) && find(sel.id);
    if (!s) return;
    const a = toScreen(s.pts[0].x, s.pts[0].y), b = toScreen(s.pts[1].x, s.pts[1].y);
    c2d.save(); c2d.strokeStyle = C.action; c2d.lineWidth = 2.5; c2d.beginPath(); c2d.moveTo(a.x, a.y); c2d.lineTo(b.x, b.y); c2d.stroke(); c2d.restore();
  }
  const sheets = ({ paper, scale }) => sectionSheets(drawings(), { paper, landscape: true, scale, units: U(), title: P().state.name || ctx.fileStem() });

  /** The publish set: one PDF (a sheet list first, then every sheet numbered L-n) and a DWG per sheet, in one .zip. */
  async function publish({ paper, scale, mono = false, level = null, extents }) {
    const order = publishOrder(LS());
    const scene = (() => { try { return ctx.buildScene(scale.mmPerUnit); } catch { return null; } })();
    const title = P().state.name || ctx.fileStem(), pages = [], files = [], entries = [];
    const { writeDwg } = await import('../dwg-write.js');
    for (const e of order) {
      if (e.kind === 'sections' && !e.sections.length) continue;
      let shs;
      if (e.kind === 'sections') shs = sectionSheets(drawings().filter((d) => e.sections.includes(d.sec.id)), { paper, landscape: true, scale, units: U(), title });
      else shs = makeSheets([e.kind], { paper, scale, level, extents, scene: level ? null : scene });
      if (!shs.length) continue;
      shs.forEach((sh, i) => {
        const num = shs.length > 1 ? `${e.number}.${i + 1}` : e.number;
        sh.chromeTexts[0] = { ...sh.chromeTexts[0], text: `${num}  ${sh.chromeTexts[0].text}` };
        pages.push(sh); entries.push({ number: num, title: sh.name || t('ls.sh.kind.' + e.kind) });
      });
      // a DWG per sheet: the plan sheets with their layers (as the sheet hides the rest), each section drawing in section units
      const stem = `${ctx.fileStem()}-${e.number}`;
      if (SHEET_LAYERS[e.kind] && scene) {
        const keep = SHEET_LAYERS[e.kind], items = scene.items.filter((it) => keep.some((p) => String(it.layer).startsWith(p)));
        const { bytes } = writeDwg({ units: U(), layers: LAYERS.map((l) => ({ name: l.name, color: l.aci })), entities: toDxfEntities({ ...scene, items }, scale.mmPerUnit) });
        files.push({ name: `${stem}-${e.kind}.dwg`, data: bytes });   // i18n-ignore: a file name
      } else if (e.kind === 'sections') {
        for (const d of drawings().filter((x) => e.sections.includes(x.sec.id))) {
          const { bytes } = writeDwg({ units: U(), layers: SECT_LAYERS.map(([name, color]) => ({ name, color })), entities: dwgEntitiesOf(d.drawing) });
          files.push({ name: `${stem}-section-${d.sec.name.replace(/[^\w-]+/g, '_')}.dwg`, data: bytes });   // i18n-ignore: a file name
        }
      }
    }
    if (!pages.length) { ctx.say(t('ls.pub.none')); return false; }
    const index0 = sheetIndex(entries, { paper, landscape: true, scale, units: U(), title });
    const { bytes, report } = await toPdfPages([index0, ...pages], { mono, title });
    const { zip } = await import('../zipfile.js');
    ctx.download(await zip([{ name: `${ctx.fileStem()}-landscape-set.pdf`, data: bytes }, ...files]), `${ctx.fileStem()}-landscape-set.zip`, 'application/zip');   // i18n-ignore: file name endings
    ctx.say(t('ls.pub.done', { n: pages.length, d: files.length, missing: report.missing }));
    return { pages: pages.length + 1, dwgs: files.length, entries };
  }

  return { tools: TOOLS, closed: new Set(), hints: { 'ls-section': 'ls.sec.hint' }, command, click: () => false, finish, isMine, pick, props, grip, remove, sceneItems, overlay,
    updateTools: () => {}, sheets, drawings, publish, refs };
}
