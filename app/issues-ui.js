/* SPDX-License-Identifier: Apache-2.0 */
/**
 * issues-ui.js — the Issues window (0.10 CV.1): pin a problem to the plan, to a station of the selected alignment, to a surface point or to the selected
 * pipe or structure; a title, a status, comments; zoom to it; BCF 2.1 out and in (next to the LandXML file); issues from the open Problems; pins on the
 * plan (layer C-ISSU-OPEN / C-ISSU-DONE, so they reach PDF, DXF and DWG). Every change is one undo step (state.issues). The words are issues.js's
 * (bin/test-civilcraft-issues.mjs); the BCF zip is lib/navis (./navis/).
 *
 *   createIssues(ctx) → { command(c) → handled, sceneItems(mm), open() }
 *   ctx = { root, el, project, units, say, refocus, download(name, blob), fileStem(), view, selected() → { kind, id, name, pts, al } | null, groundAt(x, y),
 *           problems() → [Problems entries], select(sel), refresh() }
 */
import { t } from './i18n.js';
import { LAYERS } from './scene.js';
import * as I from './issues.js';
import { fixed, formatStation } from './units.js';

for (const [name, key, aci] of I.LAYER_DEFS) if (!LAYERS.some((l) => l.name === name)) LAYERS.push({ name, token: name.endsWith('OPEN') ? 'red' : 'ink2', aci, get label() { return t(key); } });

export function createIssues(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const list = () => P().state.issues || [];
  const edit = (label, fn) => P().change(label, (s) => { s.issues ||= []; fn(s.issues, s); if (!s.issues.length) delete s.issues; });
  let dlg = null, pickedId = null;

  function viewNow() { const v = ctx.view; return { cx: v.cx, cy: v.cy, h: v.h / v.zoom }; }
  function pinFrom(mode, stationText, offText) {
    const v = viewNow(), g = ctx.selected();
    if (mode === 'station') {
      if (!g?.al) return { error: t('iss.err.noal') };
      const sta = Number(stationText), off = Number(offText || 0);
      if (!Number.isFinite(sta) || !Number.isFinite(off)) return { error: t('iss.err.sta') };
      const p = I.stationPin(g.al, sta, off, { name: g.name, id: String(g.id), z: ctx.groundAt(v.cx, v.cy) });
      return p ? { pin: p } : { error: t('iss.err.sta') };
    }
    if (mode === 'object') {
      if (!g?.pts?.length) return { error: t('iss.err.noobj') };
      const m = g.pts[Math.floor(g.pts.length / 2)];
      return { pin: I.pinAt(m.x, m.y, { kind: g.kind === 'pipe' ? 'pipe' : g.kind === 'structure' ? 'structure' : 'plan', z: ctx.groundAt(m.x, m.y), ref: { id: String(g.id), name: g.name } }) };
    }
    if (mode === 'surface') { const z = ctx.groundAt(v.cx, v.cy); return z === null || z === undefined ? { error: t('iss.err.nosurf') } : { pin: I.pinAt(v.cx, v.cy, { kind: 'surface', z }) }; }
    return { pin: I.pinAt(v.cx, v.cy, { kind: 'plan' }) };
  }

  function add(form) {
    const title = form.title.value.trim();
    if (!title) { form.err.textContent = t('iss.err.title'); return; }
    const r = pinFrom(form.mode.value, form.sta.value, form.off.value);
    if (r.error) { form.err.textContent = r.error; return; }
    edit(t('iss.undo.add'), (L, s) => { L.push(I.makeIssue({ id: P().nextId('i'), title, description: form.desc.value, pin: r.pin, view: viewNow(), author: '' })); void s; });
    form.title.value = ''; form.desc.value = ''; form.err.textContent = '';
    ctx.say(t('iss.added')); render(); ctx.refresh();
  }

  function render() {
    if (!dlg) return;
    const L = list(), st = I.stats(L), body = dlg.querySelector('[data-iss-body]');
    dlg.querySelector('[data-iss-count]').textContent = t('iss.count', { n: st.total, open: st.open + st.active, unplaced: st.unplaced });
    const rows = L.map((r, i) => {
      const sel = el('select', { className: 'cv-select', 'aria-label': t('iss.status'), onchange: () => { edit(t('iss.undo.status'), (A) => { I.setStatus(A.find((x) => x.id === r.id), sel.value); }); render(); ctx.refresh(); } },
        ...I.STATES.map((s) => el('option', { value: s, selected: s === r.status }, t('iss.s.' + s))));
      const where = r.pin ? t('iss.pin.' + r.pin.kind) + (r.pin.kind === 'station' && r.pin.ref ? ' ' + formatStation(r.pin.ref.sta, U()) : '') : '—';
      return el('tr', { 'data-iss-row': r.id, className: r.id === pickedId ? 'is-sel' : '' },
        el('td', {}, String(i + 1)), el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { pickedId = r.id; zoom(r); render(); } }, r.title)),
        el('td', {}, sel), el('td', {}, where), el('td', { className: 'num' }, String(r.comments.length)),
        el('td', {}, el('button', { type: 'button', className: 'cv-x', 'aria-label': t('iss.remove'), 'data-iss-remove': r.id, onclick: () => { edit(t('iss.undo.remove'), (A) => { A.splice(A.findIndex((x) => x.id === r.id), 1); }); render(); ctx.refresh(); } }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' }))));
    });
    const picked = L.find((r) => r.id === pickedId);
    const cm = el('textarea', { className: 'cv-input', rows: 2, 'aria-label': t('iss.comment'), 'data-iss-comment': '' });
    body.replaceChildren(
      L.length ? el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-iss-table': '' }, el('thead', {}, el('tr', {}, ...['#', t('iss.c.title'), t('iss.status'), t('iss.c.where'), t('iss.c.comments'), ''].map((h) => el('th', { scope: 'col' }, h)))), el('tbody', {}, ...rows))) : el('p', { className: 'cv-note' }, t('iss.none')),
      picked ? el('div', { className: 'cv-block', 'data-iss-detail': '' }, el('p', {}, el('strong', {}, picked.title)), picked.description ? el('p', {}, picked.description) : '',
        el('ul', {}, ...picked.comments.map((c) => el('li', {}, c.text, el('span', { className: 'cv-muted' }, ' ' + new Date(c.date).toLocaleDateString())))),
        cm, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-iss-addcomment': '', onclick: () => { if (!cm.value.trim()) return; edit(t('iss.undo.comment'), (A) => { I.addComment(A.find((x) => x.id === picked.id), cm.value, ''); }); render(); } }, t('iss.comment.add'))) : '');
  }

  function zoom(r) {
    if (!r.pin) return;
    const h = r.view?.h || (U() === 'm' ? 60 : 200), w = h * 1.5;
    ctx.view.fit({ minX: r.pin.x - w / 2, maxX: r.pin.x + w / 2, minY: r.pin.y - h / 2, maxY: r.pin.y + h / 2 });
  }

  async function exportBcf() {
    if (!list().length) { ctx.say(t('iss.export.none')); return; }
    const { writeBcf } = await import('./navis/bcf.js');
    const bytes = writeBcf({ topics: I.toTopics(list(), { units: U() }), file: ctx.fileStem() + '.landxml' });
    ctx.download(ctx.fileStem() + '-issues.bcfzip', new Blob([bytes], { type: 'application/octet-stream' }));
    ctx.say(t('iss.export.done', { n: list().length }));
  }
  async function importBcf(file) {
    try {
      const { readBcf } = await import('./navis/bcf.js');
      const { topics, notes } = await readBcf(new Uint8Array(await file.arrayBuffer()));
      const r = I.fromTopics(topics, { units: U(), existing: list(), nextId: (p) => P().nextId(p) });
      edit(t('iss.undo.import'), (A) => { A.splice(0, A.length, ...r.issues); });
      ctx.say(t('iss.import.done', { added: r.added, updated: r.updated }) + (notes.length ? ' ' + t('iss.import.notes', { n: notes.length }) : ''));
      render(); ctx.refresh();
    } catch (e) { ctx.say(t('iss.import.failed', { file: file.name, why: e.code === 'notbcf' ? t('iss.import.notbcf') : e.message })); }
  }
  function fromProblems() {
    const found = I.issuesFromProblems(ctx.problems(), { nextId: (p) => P().nextId(p), existing: list() });
    if (!found.length) { ctx.say(t('iss.problems.none')); return; }
    edit(t('iss.undo.problems'), (A) => { A.push(...found); });
    ctx.say(t('iss.problems.done', { n: found.length })); render(); ctx.refresh();
  }

  function open() {
    if (dlg) { dlg.remove(); dlg = null; }
    const id = 'cv-iss';
    const f = { title: el('input', { type: 'text', className: 'cv-input', id: id + '-t', maxLength: 200, 'data-iss-title': '' }), desc: el('textarea', { className: 'cv-input', rows: 2, id: id + '-d' }),
      mode: el('select', { className: 'cv-select', id: id + '-m', 'data-iss-mode': '' }, ...['plan', 'surface', 'station', 'object'].map((m) => el('option', { value: m }, t('iss.mode.' + m)))),
      sta: el('input', { type: 'text', className: 'cv-input', id: id + '-s', style: 'width:7rem', 'aria-label': t('iss.station') }), off: el('input', { type: 'text', className: 'cv-input', id: id + '-o', style: 'width:5rem', value: '0', 'aria-label': t('iss.offset') }),
      err: el('p', { className: 'cv-note is-error', 'aria-live': 'polite' }) };
    const file = el('input', { type: 'file', accept: '.bcfzip,.bcf,.zip', hidden: true, 'data-iss-file': '' });
    file.addEventListener('change', () => { if (file.files[0]) importBcf(file.files[0]); file.value = ''; });
    const lab = (c, text) => el('label', { for: c.id }, text);
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('tv.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    dlg = el('dialog', { className: 'cv-dialog cv-pcdlg', 'aria-labelledby': id + '-h', 'data-iss-dialog': '' }, el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('iss.title')), close),
      el('div', { className: 'cv-dlg-body' }, el('p', { className: 'cv-note' }, t('iss.lede')), el('p', { className: 'cv-note', 'data-iss-count': '' }),
        el('div', { className: 'cv-row' }, lab(f.title, t('iss.f.title')), f.title), el('div', { className: 'cv-row' }, lab(f.desc, t('iss.f.desc')), f.desc),
        el('div', { className: 'cv-row' }, lab(f.mode, t('iss.f.pin')), f.mode, f.sta, f.off, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-iss-add': '', onclick: () => add(f) }, t('iss.add'))),
        f.err, el('div', { 'data-iss-body': '' })),
      el('div', { className: 'cv-dlg-foot' }, file,
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-iss-problems': '', onclick: fromProblems }, t('iss.problems')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-iss-import': '', onclick: () => file.click() }, t('iss.import')),
        el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-iss-export': '', onclick: exportBcf }, t('iss.export')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('iss.close')))));
    const sync = () => { f.sta.hidden = f.off.hidden = f.mode.value !== 'station'; };
    f.mode.addEventListener('change', sync); sync();
    close.onclick = () => dlg.close();
    dlg.addEventListener('close', () => { dlg.remove(); dlg = null; ctx.refocus(); });
    ctx.root.append(dlg); render(); dlg.showModal(); f.title.focus();
  }
  return {
    command(c) { if (c === 'issues') { open(); return true; } return false; },
    sceneItems: (mm) => I.sceneItems(list(), { mmPerUnit: mm }),
    open, refreshWindow: () => render(),
  };
}
void fixed;
