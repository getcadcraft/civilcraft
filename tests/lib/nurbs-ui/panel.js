/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: every word comes from the host's t() (keys nurbs.ui.*, nurbs.cmd.*, nurbs.panel.*, nurbs.err.*). */
/**
 * panel.js — cc-nurbs-ui (0.8 round 3, model_PART_3; SU.747b mount): the Surfaces panel, one for every host (ModelCraft first, then
 * PartCraft and SuperCad Studio). Commands, what each still needs, its options, the curves and surfaces (pick, hide, rename, delete),
 * the continuity table, the view mode and STEP / IGES / .ccnurbs in and out. The host hands over very little; the geometry is cc-nurbs'.
 *
 *   mountSurfacesPanel(box, host) → { refresh(), dispose() }
 *   host = {
 *     t(key, vars),                         the app's words
 *     session,                              a session.js Session (the patch set and its history)
 *     view: { mode, cvs }, setView(v),      how the display draws (shaded | zebra | curvature; control nets)
 *     collecting(on),                       a command is waiting for picks: the host turns 3D picking on (optional)
 *     pickPoints() → Promise<[[x,y,z] mm]>  points clicked in the view (optional; typed points always work)
 *     save(name, text, type),               a download / save dialog
 *     open(exts) → Promise<{ name, text }>  a file chosen by the person (optional)
 *     base() → the file's base name,  print(text) → the status line,  range() → the curvature range shown (optional)
 *   }
 * Every change goes through the session (one history step); the host listens to session.onChange to redraw and save.
 */
const GROUPS = [
  ['nurbs.ui.g.curves', ['curve.points', 'curve.cvs', 'curve.join', 'curve.split', 'curve.insertKnot', 'curve.removeKnot', 'curve.elevate', 'curve.reduce', 'curve.rebuild', 'curve.match', 'curve.blend']],
  ['nurbs.ui.g.surfaces', ['surface.loft', 'surface.ruled', 'surface.extrude', 'surface.revolve', 'surface.sweep1', 'surface.sweep2', 'surface.network', 'surface.coons', 'surface.offset', 'surface.extend', 'surface.rebuild', 'surface.insertKnot', 'surface.elevate']],
  ['nurbs.ui.g.match', ['surface.match', 'surface.blend']],
  ['nurbs.ui.g.trim', ['surface.trimRect', 'surface.trimCircle', 'surface.trimCurve', 'surface.untrim']],
];
const fmt = (v, d = 4) => (Number.isFinite(v) ? String(Math.round(v * 10 ** d) / 10 ** d) : '—');

function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'data') for (const [dk, dv] of Object.entries(v)) e.dataset[dk] = dv;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k in e && typeof v !== 'string') e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}

export function mountSurfacesPanel(box, host) {
  const { t, session: S } = host;
  const N = S.N;
  const errText = (e) => (e ? t(e.key, e.vars || {}) : '');
  let error = null, note = '', busy = false;
  const root = h('div', { class: 'nui', data: { nurbsPanel: '' } });
  box.replaceChildren(root);

  const say = (text) => { note = text; host.print?.(text); };
  const runIt = () => {
    const cmd = S.cmd;
    const r = S.run(t(N.tools.COMMANDS[cmd].label));
    if (!r.ok) { error = r.error; render(); return; }
    error = null;
    const dev = r.report && (r.report.deviation ?? r.report.maxDeviation ?? r.report.error);
    say(t('nurbs.ui.done', { what: t(N.tools.COMMANDS[cmd].label) }) + (Number.isFinite(dev) ? ' ' + t('nurbs.ui.deviation', { mm: fmt(dev) }) : ''));
  };
  const needText = (n) => t('nurbs.ui.need.' + n.kind, { n: n.n, have: n.have });

  function commandCard() {
    if (!S.cmd) return null;
    const cmd = N.tools.COMMANDS[S.cmd], n = S.need();
    const fields = S.fields().map((f) => {
      const id = 'nui-opt-' + f.name;
      let input;
      const set = (text) => { const e = S.setOption(f.name, text); error = e; if (e) render(); };
      if (f.kind === 'continuity' || f.kind === 'frame' || f.kind === 'dir') {
        const opts = f.kind === 'continuity' ? ['G0', 'G1', 'G2'] : f.kind === 'frame' ? ['rmf', 'fixed'] : ['u', 'v'];
        input = h('select', { id, class: 'select-cc', data: { nurbsOpt: f.name }, onchange: (e) => set(e.target.value) },
          ...opts.map((o) => h('option', { value: o, selected: o === f.value, text: f.kind === 'continuity' ? o : t('nurbs.ui.opt.' + f.kind + '.' + o) })));
      } else if (f.kind === 'bool') input = h('input', { id, type: 'checkbox', checked: !!f.value, data: { nurbsOpt: f.name }, onchange: (e) => set(e.target.checked ? 'true' : 'false') });
      else input = h('input', { id, class: 'nui-input', type: 'text', inputmode: f.kind === 'vec3' || f.kind === 'pair' ? 'text' : 'decimal', value: Array.isArray(f.value) ? f.value.join(', ') : String(f.value), data: { nurbsOpt: f.name }, onchange: (e) => set(e.target.value) });
      return h('div', { class: 'nui-field' }, h('label', { for: id, text: t('nurbs.ui.opt.' + f.name.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())) }), input);
    });
    const wantsPoints = cmd.needs.some((x) => x.kind === 'points');
    const pts = wantsPoints ? h('div', { class: 'nui-points' },
      h('label', { for: 'nui-pts', text: t('nurbs.ui.points.label') }),
      h('textarea', { id: 'nui-pts', class: 'nui-input', rows: 3, data: { nurbsPoints: '' }, value: (S.points || []).map((p) => p.join(', ')).join('\n'), placeholder: '0, 0, 0\n50, 0, 10\n100, 0, 0',
        onchange: (e) => {
          const rows = e.target.value.split(/\n|;/).map((l) => l.trim()).filter(Boolean).map((l) => l.split(/[\s,]+/).map(Number));
          if (rows.some((r) => r.length < 2 || r.length > 3 || r.some((v) => !Number.isFinite(v)))) { error = { key: 'nurbs.ui.err.points' }; render(); return; }
          S.setPoints(rows.map((r) => (r.length === 2 ? [r[0], r[1], 0] : r)));
        } }),
      host.pickPoints ? h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsPickPoints: '' }, disabled: busy,
        onclick: async () => { busy = true; render(); try { const p = await host.pickPoints(); if (p && p.length) S.setPoints(p); } finally { busy = false; render(); } } }, t('nurbs.ui.points.pick')) : null) : null;
    const picks = S.picks.length ? h('ol', { class: 'nui-picks', data: { nurbsPicks: '' } }, ...S.picks.map((p) => h('li', { text: (N.doc.item(S.doc, p.id)?.name || p.id) + (p.sub ? ' · ' + t('nurbs.ui.sub.' + p.sub) : '') }))) : null;
    return h('div', { class: 'nui-card', data: { nurbsCmd: S.cmd } },
      h('h3', { class: 'nui-h', text: t(cmd.label) }),
      h('p', { class: 'nui-need', data: { nurbsNeed: n ? n.kind : 'ready' }, text: n ? needText(n) : t('nurbs.ui.ready') }),
      picks, pts, fields.length ? h('div', { class: 'nui-fields' }, ...fields) : null,
      h('div', { class: 'nui-row' },
        h('button', { type: 'button', class: 'btn-plot btn-sm-cc', data: { nurbsRun: '' }, disabled: !!n, onclick: runIt }, t('nurbs.ui.run')),
        S.picks.length ? h('button', { type: 'button', class: 'btn-line btn-sm-cc', onclick: () => S.unpick() }, t('nurbs.ui.back')) : null,
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsCancel: '' }, onclick: () => { error = null; S.cancel(); } }, t('nurbs.ui.cancel'))));
  }

  function itemRows() {
    if (!S.doc.items.length) return h('p', { class: 'nui-note', data: { nurbsEmpty: '' }, text: t('nurbs.ui.empty') });
    const n = S.cmd ? S.need() : null;
    const want = n && n.kind !== 'points' ? n.kind : null;   // curve | surface | edge | end
    return h('ul', { class: 'nui-list nui-items', data: { nurbsItems: '' } }, ...S.doc.items.map((it) => {
      const row = N.tools.panel({ ...S.doc, items: [it], links: [] }).items[0];
      const deg = Array.isArray(row.degree) ? row.degree.join(' × ') : row.degree, cvs = Array.isArray(row.cvs) ? row.cvs.join(' × ') : row.cvs;
      const pickBtns = [];
      if (want === 'edge' && it.kind === 'surface') for (const e of N.surface.EDGES) pickBtns.push(h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsPick: it.id + '.' + e }, onclick: () => S.pick({ id: it.id, sub: e }) }, t('nurbs.ui.sub.' + e)));
      else if (want === 'end' && it.kind === 'curve') for (const e of ['start', 'end']) pickBtns.push(h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsPick: it.id + '.' + e }, onclick: () => S.pick({ id: it.id, sub: e }) }, t('nurbs.ui.sub.' + e)));
      else if (want && want === it.kind) pickBtns.push(h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsPick: it.id }, disabled: S.picks.some((p) => p.id === it.id), onclick: () => S.pick({ id: it.id }) }, t('nurbs.ui.pick')));
      return h('li', { class: 'nui-item', data: { nurbsItem: it.id, kind: it.kind } },
        h('span', { class: 'nui-name', text: it.name || it.id, title: it.id }),
        h('span', { class: 'nui-meta', text: t('nurbs.ui.kind.' + it.kind) + ' · ' + t('nurbs.panel.degree') + ' ' + deg + ' · ' + t('nurbs.panel.cvs') + ' ' + cvs + (row.rational ? ' · ' + t('nurbs.panel.rational') : '') + (it.trim ? ' · ' + t('nurbs.ui.trimmed', { holes: it.trim.holes.length }) : '') }),
        h('span', { class: 'nui-acts' }, ...pickBtns,
          h('button', { type: 'button', class: 'nui-icon', title: t(it.hidden ? 'nurbs.ui.show' : 'nurbs.ui.hide'), 'aria-label': t(it.hidden ? 'nurbs.ui.show' : 'nurbs.ui.hide'), data: { nurbsHide: it.id }, onclick: () => S.setHidden(it.id, !it.hidden, t('nurbs.ui.hide')) }, h('i', { class: 'bi ' + (it.hidden ? 'bi-eye-slash' : 'bi-eye'), 'aria-hidden': 'true' })),
          h('button', { type: 'button', class: 'nui-icon', title: t('nurbs.ui.rename'), 'aria-label': t('nurbs.ui.rename'), onclick: () => { const v = window.prompt(t('nurbs.ui.rename'), it.name || ''); if (v != null) S.rename(it.id, v, t('nurbs.ui.rename')); } }, h('i', { class: 'bi bi-pencil', 'aria-hidden': 'true' })),
          h('button', { type: 'button', class: 'nui-icon', title: t('nurbs.ui.delete'), 'aria-label': t('nurbs.ui.delete'), data: { nurbsDelete: it.id }, onclick: () => S.remove(it.id, t('nurbs.ui.delete')) }, h('i', { class: 'bi bi-trash', 'aria-hidden': 'true' }))));
    }));
  }

  function edgeTable() {
    const p = N.tools.panel(S.doc);
    if (!p.edges.length) return h('p', { class: 'nui-note', text: t('nurbs.panel.none') });
    const name = (id) => N.doc.item(S.doc, id)?.name || id;
    return h('table', { class: 'nui-edges', data: { nurbsEdges: '' } },
      h('thead', {}, h('tr', {}, ...['nurbs.ui.edge', 'nurbs.panel.want', 'nurbs.panel.got', 'nurbs.panel.gap', 'nurbs.panel.angle', 'nurbs.panel.dk'].map((k) => h('th', { scope: 'col', text: t(k) })))),
      h('tbody', {}, ...p.edges.map((e) => h('tr', { data: { nurbsEdge: e.a + '.' + e.edgeA + '|' + e.b + '.' + e.edgeB, ok: rank(e.got) >= rank(e.want) ? '1' : '0' } },
        h('td', { text: name(e.a) + ' ' + e.edgeA + ' · ' + name(e.b) + ' ' + e.edgeB }), h('td', { text: e.want }), h('td', { text: e.got === 'none' ? '—' : e.got }),
        h('td', { class: 'tabular', text: fmt(e.gap) }), h('td', { class: 'tabular', text: fmt(e.angle, 3) }), h('td', { class: 'tabular', text: fmt(e.dk, 5) })))));
  }
  const rank = (c) => ({ none: -1, G0: 0, G1: 1, G2: 2 }[c] ?? -1);

  async function importFile() {
    if (!host.open) return;
    const f = await host.open(['.step', '.stp', '.igs', '.iges', '.ccnurbs']);
    if (!f) return;
    try {
      const ext = (f.name.match(/\.([a-z]+)$/i)?.[1] || '').toLowerCase();
      const doc = ext === 'igs' || ext === 'iges' ? N.iges.readIges(f.text) : ext === 'ccnurbs' ? N.doc.fromJSON(f.text) : N.step.readStep(f.text);
      const r = S.importDoc(doc, t('nurbs.ui.import'));
      if (!r.ok) { error = r.error; render(); return; }
      error = null; say(t('nurbs.ui.imported', { n: r.n, file: f.name }));
    } catch (e) { error = e && e.code ? { key: e.code, vars: e.vars } : { key: 'nurbs.ui.err.failed', vars: { error: String(e?.message || e) } }; render(); }
  }
  function exportAs(kind) {
    if (!S.doc.items.length) { error = { key: 'nurbs.ui.err.export_empty' }; render(); return; }
    const name = host.base();
    const out = kind === 'step' ? [N.step.writeStep(S.doc, { name }), name + '.step', 'model/step']
      : kind === 'iges' ? [N.iges.writeIges(S.doc, { name }), name + '.igs', 'model/iges'] : [N.doc.toJSON(S.doc), name + '.ccnurbs', 'application/json'];
    host.save(out[1], out[0], out[2]);
    say(t('nurbs.ui.exported', { file: out[1] }) + (kind === 'iges' && S.doc.items.some((i) => i.trim) ? ' ' + t('nurbs.ui.iges_untrimmed') : ''));
  }

  // a render can remove the focused field, whose blur fires its change, which renders again: never nest, render once more after
  let rendering = false, again = false;
  function render() {
    if (rendering) { again = true; return; }
    rendering = true;
    try { draw(); } finally { rendering = false; }
    if (again) { again = false; queueMicrotask(render); }
  }
  function draw() {
    const v = host.view;
    const kr = v.mode === 'curvature' && host.range ? host.range() : null;
    root.replaceChildren(
      h('div', { class: 'nui-row nui-top' },
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsUndo: '' }, disabled: !S.canUndo, onclick: () => { const l = S.undo(); if (l) say(t('nurbs.ui.undid', { what: l })); } }, h('i', { class: 'bi bi-arrow-counterclockwise', 'aria-hidden': 'true' }), ' ', t('nurbs.ui.undo')),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsRedo: '' }, disabled: !S.canRedo, onclick: () => { const l = S.redo(); if (l) say(t('nurbs.ui.redid', { what: l })); } }, h('i', { class: 'bi bi-arrow-clockwise', 'aria-hidden': 'true' }), ' ', t('nurbs.ui.redo')),
        h('label', { class: 'nui-inline' }, t('nurbs.ui.view') + ' ',
          h('select', { class: 'select-cc', data: { nurbsMode: '' }, onchange: (e) => host.setView({ ...host.view, mode: e.target.value }) },
            ...['shaded', 'zebra', 'curvature'].map((m) => h('option', { value: m, selected: v.mode === m, text: t('nurbs.ui.mode.' + m) })))),
        h('label', { class: 'nui-inline' }, h('input', { type: 'checkbox', checked: !!v.cvs, data: { nurbsCvs: '' }, onchange: (e) => host.setView({ ...host.view, cvs: e.target.checked }) }), ' ', t('nurbs.ui.cvs'))),
      kr ? h('p', { class: 'nui-note', data: { nurbsRange: '' }, text: t('nurbs.ui.krange', { min: fmt(kr.min, 6), max: fmt(kr.max, 6) }) }) : null,
      ...GROUPS.map(([g, ids]) => h('div', { class: 'nui-group' }, h('h3', { class: 'nui-h', text: t(g) }),
        h('div', { class: 'nui-cmds' }, ...ids.map((id) => h('button', { type: 'button', class: 'btn-line btn-sm-cc' + (S.cmd === id ? ' is-on' : ''), 'aria-pressed': String(S.cmd === id), data: { nurbsStart: id },
          onclick: () => { error = null; if (S.cmd === id) S.cancel(); else S.start(id); } }, t(N.tools.COMMANDS[id].label)))))),
      commandCard(),
      error ? h('p', { class: 'nui-error', role: 'alert', data: { nurbsError: error.key }, text: errText(error) }) : null,
      note && !error ? h('p', { class: 'nui-note', 'aria-live': 'polite', text: note }) : null,
      h('h3', { class: 'nui-h', text: t('nurbs.ui.items') }), itemRows(),
      h('h3', { class: 'nui-h', text: t('nurbs.panel.edges') }), edgeTable(), h('p', { class: 'nui-note', text: t('nurbs.panel.note') }),
      h('div', { class: 'nui-row' },
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsExport: 'step' }, onclick: () => exportAs('step') }, t('nurbs.ui.export.step')),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsExport: 'iges' }, onclick: () => exportAs('iges') }, t('nurbs.ui.export.iges')),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsExport: 'ccnurbs' }, onclick: () => exportAs('ccnurbs') }, t('nurbs.ui.export.ccnurbs')),
        host.open ? h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsImport: '' }, onclick: importFile }, t('nurbs.ui.import')) : null));
    host.collecting?.(!!(S.cmd && S.need() && S.need().kind !== 'points'));
  }
  render();
  return { refresh: render, dispose: () => { host.collecting?.(false); root.remove(); } };
}
