/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pipe-profile-ui.js — 0.11 SU.1937: "Profile of this run…" on a structure or a pipe: a window with the profile of the pipe run from
 * there down to the outlet (pipe-profile.js, pipe-profile-sheet.js), the optional hydraulic grade line from the storm table, and Save SVG /
 * Save PDF. The drawing in the window IS the SVG that is saved.
 *
 *   createPipeProfile(ctx)   ctx = { root, el, project: () => Project, units, grade: () => hydraulicGrade result | null, download, fileStem, say, refocus }
 *   → { open(structId), button(structId) → <button> }
 */
import { t } from './i18n.js';
import { PAPERS, toPdfPages } from './plot.js';
import { pipeProfile } from './pipe-profile.js';
import { pipeProfileSheet, sheetSvg } from './pipe-profile-sheet.js';

export function createPipeProfile(ctx) {
  const { el } = ctx;
  let uid = 0;
  function open(start) {
    const p = ctx.project(), net = p.state.network;
    if (!net) return;
    const U = ctx.units(), id = 'cv-ppr-' + (++uid), g = ctx.grade?.() || null;
    const hglBox = el('input', { type: 'checkbox', id: id + '-hgl', 'data-ppr-hgl': '', disabled: !g });
    const paper = el('select', { className: 'cv-select', id: id + '-paper', 'data-ppr-paper': '' }, ...PAPERS.map((x) => el('option', { value: x.key }, x.name)));
    paper.value = U === 'm' ? 'a3' : 'tabloid';
    const view = el('div', { className: 'cv-ppr-view', 'data-ppr-view': '', style: 'overflow:auto;background:#fff;border:1px solid var(--line, #ccc)' });
    const note = el('p', { className: 'cv-note', 'data-ppr-note': '', 'aria-live': 'polite' });
    const svgBtn = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ppr-svg': '' }, el('i', { className: 'bi bi-filetype-svg', 'aria-hidden': 'true' }), ' ', t('pps.svg'));
    const pdfBtn = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ppr-pdf': '' }, el('i', { className: 'bi bi-file-earmark-pdf', 'aria-hidden': 'true' }), ' ', t('pps.pdf'));
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('pps.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const dlg = el('dialog', { className: 'cv-dialog', 'aria-labelledby': id + '-h', 'data-ppr-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('pps.dlg.head')), close),
        el('div', { className: 'cv-dlg-body' },
          el('div', { className: 'cv-props' }, el('label', { for: id + '-paper' }, t('pps.paper')), paper, el('label', { className: 'cv-check', for: id + '-hgl' }, hglBox, ' ', t('pps.hgl'))),
          g ? '' : el('p', { className: 'cv-note' }, t('pps.hgl.none')), note, view),
        el('div', { className: 'cv-dlg-foot' }, svgBtn, pdfBtn, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('pps.close')))));
    close.onclick = () => dlg.close();
    let cur = null;
    const build = () => {
      const prof = pipeProfile(p.state.network, p.pipeSurface(), U, { start, hgl: hglBox.checked ? g : null });
      if (!prof.ok) { cur = null; note.textContent = t('pps.why.' + prof.why); view.replaceChildren(); svgBtn.disabled = pdfBtn.disabled = true; return; }
      const out = pipeProfileSheet(prof, { paper: paper.value, units: U, name: p.state.network.name });
      cur = { prof, ...out, svg: sheetSvg(out.sheet) };
      view.innerHTML = cur.svg;   // our own SVG text (every string escaped by sheetSvg), nothing from outside
      const sv = view.querySelector('svg'); if (sv) { sv.removeAttribute('height'); sv.style.maxWidth = '100%'; sv.style.height = 'auto'; sv.setAttribute('width', '100%'); }
      note.textContent = out.notes.join(' ');
      svgBtn.disabled = pdfBtn.disabled = false;
    };
    const file = (ext) => t('pps.file', { stem: ctx.fileStem(), name: (p.state.network.name || 'network').replace(/[^\w.-]+/g, '_'), ext });
    svgBtn.onclick = () => { if (!cur) return; const f = file('svg'); ctx.download(cur.svg, f, 'image/svg+xml'); ctx.say(t('pps.saved', { name: f })); };
    pdfBtn.onclick = async () => { if (!cur) return; const { bytes } = await toPdfPages([cur.sheet], { title: cur.sheet.name }); const f = file('pdf'); ctx.download(bytes, f, 'application/pdf'); ctx.say(t('pps.saved', { name: f })); };
    for (const x of [paper, hglBox]) x.addEventListener('change', build);
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus?.(); });
    ctx.root.append(dlg);
    build();
    dlg.showModal();
    api.last = () => cur;
  }
  const api = { open, last: () => null, button: (startId) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ppr-open': '', title: t('pps.open.title'), onclick: () => open(startId) }, el('i', { className: 'bi bi-graph-down', 'aria-hidden': 'true' }), ' ', t('pps.open')) };
  return api;
}
