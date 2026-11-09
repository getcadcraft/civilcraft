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
 *     manifold() → Promise<the mesh engine (manifold-3d)>   for the solid Booleans (0.9 DC.54); loaded on the first Boolean (optional:
 *                                           without it the Boolean buttons say the engine is missing)
 *     scan: { get() → { positions (mm), indices } | null }    the scan mesh to fit surfaces to (0.9 SU.1082): optional; the Scan group shows with it
 *     bake: { label, run(solidId) }         a host's own step for a solid (PartCraft: Bake into the part) — optional
 *   }
 * Every change goes through the session (one history step); the host listens to session.onChange to redraw and save.
 */
const GROUPS = [
  ['nurbs.ui.g.curves', ['curve.points', 'curve.cvs', 'curve.join', 'curve.split', 'curve.insertKnot', 'curve.removeKnot', 'curve.elevate', 'curve.reduce', 'curve.rebuild', 'curve.match', 'curve.blend']],
  ['nurbs.ui.g.surfaces', ['surface.loft', 'surface.ruled', 'surface.extrude', 'surface.revolve', 'surface.sweep1', 'surface.sweep2', 'surface.network', 'surface.coons', 'surface.offset', 'surface.extend', 'surface.rebuild', 'surface.insertKnot', 'surface.elevate']],
  ['nurbs.ui.g.match', ['surface.match', 'surface.blend']],
  ['nurbs.ui.g.trim', ['surface.trimRect', 'surface.trimCircle', 'surface.trimCurve', 'surface.untrim']],
  ['nurbs.ui.g.solids', ['solid.box', 'solid.cylinder', 'solid.sphere', 'solid.make', 'solid.union', 'solid.subtract', 'solid.intersect', 'solid.fillet', 'solid.fillet_edges', 'solid.thicken']],
];
const SCAN_GROUP = ['nurbs.ui.g.scan', ['scan.fit', 'scan.solid']];
const CAGE_GROUP = ['nurbs.ui.g.cage', ['cage.surfaces']];   // 0.9 D9.8: a host with polygon meshes offers it
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
  let error = null, note = '', busy = false, lastScan = null, devOn = true;
  const root = h('div', { class: 'nui', data: { nurbsPanel: '' } });
  box.replaceChildren(root);

  const say = (text) => { note = text; host.print?.(text); render(); };   // shown at once (a run has already redrawn before its line is known)
  const runIt = async () => {
    const cmd = S.cmd, def = N.tools.COMMANDS[cmd];
    if (def.engine === 'manifold' && !S.env.manifold) {   // the mesh engine is loaded on the first Boolean only
      if (!host.manifold) { error = { key: 'nurbs.err.bool_engine' }; render(); return; }
      busy = true; say(t('nurbs.ui.solid.loading')); render();
      try { S.env.manifold = await host.manifold(); } catch { error = { key: 'nurbs.err.bool_engine' }; busy = false; render(); return; } finally { busy = false; }
      if (S.cmd !== cmd) { render(); return; }
    }
    if (def.cage) { const m = host.cage && host.cage.get(); if (!m) { error = { key: 'nurbs.ui.cage.none' }; render(); return; } S.env.cage = m; }
    if (def.scan) { const m = host.scan && host.scan.get(); if (!m) { error = { key: 'nurbs.ui.scan.none' }; render(); return; } S.env.scan = m; }
    const r = S.run(t(def.label));
    delete S.env.scan; delete S.env.cage;
    if (!r.ok) { error = r.error; render(); return; }
    error = null;
    const rep = r.report || {};
    if (rep.scan) {   // a scan fit: what was measured, in words (mesh-to-surface only)
      lastScan = rep.scan;
      const sc = rep.scan;
      if (host.cloud) host.cloud(devOn && sc.map ? sc.map : null, sc.tol);   // the deviation map, drawn in the view
      say(t('nurbs.ui.scan.done', { n: sc.patches, tris: sc.triangles, covered: fmt(sc.covered * 100, 1), rms: fmt(sc.rms, 4), max: fmt(sc.max, 4), tol: sc.tol, within: fmt(sc.within * 100, 1) })
        + (sc.fillets && sc.fillets.length ? ' ' + t('nurbs.ui.scan.fillets', { n: sc.fillets.length }) : '')
        + (sc.pieces && sc.pieces.length ? ' ' + t('nurbs.ui.scan.unfitted', { n: sc.pieces.length }) : ''));
      return;
    }
    if (rep.cage) {   // a SubD cage: how many quads became exact surfaces and why the others did not
      const c = rep.cage;
      say(t('nurbs.ui.cage.done', { n: c.patches, quads: c.quads }) + (c.boundary ? ' ' + t('nurbs.ui.cage.boundary', { n: c.boundary }) : '') + (c.valence ? ' ' + t('nurbs.ui.cage.valence', { n: c.valence }) : '') + (c.open ? ' ' + t('nurbs.ui.cage.open', { n: c.open }) : ''));
      return;
    }
    if (rep.op) {   // a Boolean: what was measured, in words
      say(t('nurbs.ui.solid.bool_done', { what: t(def.label), faces: rep.faces, volume: fmt(rep.volume, 2), dev: fmt(rep.deviation, 4), res: fmt(Math.max(1e-6, Math.ceil(rep.residual * 1e6) / 1e6), 6), tol: rep.tol })
        + ' ' + t(rep.closedAgain ? 'nurbs.ui.solid.closes' : 'nurbs.ui.solid.open_again', { n: rep.openAgain ?? 0, volume: fmt(rep.volumeAgain, 2) })
        + (rep.fillet ? ' ' + t(rep.fillet.radius2 !== rep.fillet.radius ? 'nurbs.ui.solid.fillet_var' : 'nurbs.ui.solid.fillet_done', { r: fmt(rep.fillet.radius, 3), r2: fmt(rep.fillet.radius2, 3), dev: fmt(Math.max(...(rep.fillets || [rep.fillet]).map((x) => x.deviation), 1e-6), 6), angle: fmt(Math.max(...(rep.fillets || [rep.fillet]).map((x) => x.tangent)), 4), n: rep.fillet.stations }) : '')
        + (rep.fillets && rep.fillets.length > 1 ? ' ' + t('nurbs.ui.solid.fillet_edges', { n: rep.fillets.length, corners: rep.corners && rep.corners.length ? t('nurbs.ui.solid.fillet_corners', { sphere: rep.corners.filter((c) => c.kind === 'sphere').length, mitre: rep.corners.filter((c) => c.kind === 'mitre').length }) : '' }) : ''));
      return;
    }
    if (rep.thickness !== undefined) { say(t('nurbs.ui.solid.thicken_done', { what: t(def.label), t: fmt(rep.thickness, 3), volume: fmt(rep.volume, 2), off: fmt(Math.max(rep.offset, 1e-6), 6), tol: rep.tol })); return; }
    if (rep.closed !== undefined && rep.volume !== undefined) { say(t('nurbs.ui.solid.made', { what: t(def.label), volume: fmt(rep.volume, 2), area: fmt(rep.area, 2), tol: rep.tol })); return; }
    const dev = rep.deviation ?? rep.maxDeviation ?? rep.error;
    say(t('nurbs.ui.done', { what: t(def.label) }) + (Number.isFinite(dev) ? ' ' + t('nurbs.ui.deviation', { mm: fmt(dev) }) : ''));
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
      h('p', { class: 'nui-need', data: { nurbsNeed: n ? n.kind : 'ready' }, text: n ? needText(n) : S.extra() ? t('nurbs.ui.need.more_' + S.extra(), { have: S.picks.length }) : t('nurbs.ui.ready') }),
      picks, pts, fields.length ? h('div', { class: 'nui-fields' }, ...fields) : null,
      h('div', { class: 'nui-row' },
        h('button', { type: 'button', class: 'btn-plot btn-sm-cc', data: { nurbsRun: '' }, disabled: !!n || busy, onclick: runIt }, t('nurbs.ui.run')),
        S.picks.length ? h('button', { type: 'button', class: 'btn-line btn-sm-cc', onclick: () => S.unpick() }, t('nurbs.ui.back')) : null,
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsCancel: '' }, onclick: () => { error = null; S.cancel(); } }, t('nurbs.ui.cancel'))));
  }

  function itemRows() {
    if (!S.doc.items.length) return h('p', { class: 'nui-note', data: { nurbsEmpty: '' }, text: t('nurbs.ui.empty') });
    const n = S.cmd ? S.need() : null;
    const want = n && n.kind !== 'points' ? n.kind : (S.cmd && !n ? S.extra() : null);   // curve | surface | edge | end (solid: the Solids list)
    return h('ul', { class: 'nui-list nui-items', data: { nurbsItems: '' } }, ...S.doc.items.map((it) => {
      const row = N.tools.panel({ ...S.doc, items: [it], links: [] }).items[0];
      const deg = Array.isArray(row.degree) ? row.degree.join(' × ') : row.degree, cvs = Array.isArray(row.cvs) ? row.cvs.join(' × ') : row.cvs;
      const pickBtns = [];
      if (want === 'edge' && it.kind === 'surface') for (const e of N.surface.EDGES) pickBtns.push(h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsPick: it.id + '.' + e }, onclick: () => S.pick({ id: it.id, sub: e }) }, t('nurbs.ui.sub.' + e)));
      else if (want === 'end' && it.kind === 'curve') for (const e of ['start', 'end']) pickBtns.push(h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsPick: it.id + '.' + e }, onclick: () => S.pick({ id: it.id, sub: e }) }, t('nurbs.ui.sub.' + e)));
      else if (want && want === it.kind) pickBtns.push(h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsPick: it.id }, disabled: S.picks.some((p) => p.id === it.id) && !(S.cmd === 'solid.fillet_edges' && !(S.picks.length % 2 === 1 && S.picks.at(-1).id === it.id)), onclick: () => S.pick({ id: it.id }) }, t('nurbs.ui.pick')));   // Fillet several edges: a face may be in several pairs
      return h('li', { class: 'nui-item', data: { nurbsItem: it.id, kind: it.kind } },
        h('span', { class: 'nui-name', text: it.name || it.id, title: it.id }),
        h('span', { class: 'nui-meta', text: t('nurbs.ui.kind.' + it.kind) + ' · ' + t('nurbs.panel.degree') + ' ' + deg + ' · ' + t('nurbs.panel.cvs') + ' ' + cvs + (row.rational ? ' · ' + t('nurbs.panel.rational') : '') + (it.trim ? ' · ' + t('nurbs.ui.trimmed', { holes: it.trim.holes.length }) : '') + (N.solid.solidOf(S.doc, it.id) ? ' · ' + t('nurbs.ui.solid.face_of', { name: N.solid.solidOf(S.doc, it.id).name || N.solid.solidOf(S.doc, it.id).id }) : '') }),
        h('span', { class: 'nui-acts' }, ...pickBtns,
          h('button', { type: 'button', class: 'nui-icon', title: t(it.hidden ? 'nurbs.ui.show' : 'nurbs.ui.hide'), 'aria-label': t(it.hidden ? 'nurbs.ui.show' : 'nurbs.ui.hide'), data: { nurbsHide: it.id }, onclick: () => S.setHidden(it.id, !it.hidden, t('nurbs.ui.hide')) }, h('i', { class: 'bi ' + (it.hidden ? 'bi-eye-slash' : 'bi-eye'), 'aria-hidden': 'true' })),
          h('button', { type: 'button', class: 'nui-icon', title: t('nurbs.ui.rename'), 'aria-label': t('nurbs.ui.rename'), onclick: () => { const v = window.prompt(t('nurbs.ui.rename'), it.name || ''); if (v != null) S.rename(it.id, v, t('nurbs.ui.rename')); } }, h('i', { class: 'bi bi-pencil', 'aria-hidden': 'true' })),
          h('button', { type: 'button', class: 'nui-icon', title: t('nurbs.ui.delete'), 'aria-label': t('nurbs.ui.delete'), data: { nurbsDelete: it.id }, onclick: () => S.remove(it.id, t('nurbs.ui.delete')) }, h('i', { class: 'bi bi-trash', 'aria-hidden': 'true' }))));
    }));
  }

  /** The solids: each a group of faces that closes. Pick one for a Boolean; Ungroup keeps the faces; Delete removes them too. */
  function solidRows() {
    const list = N.solid.solids(S.doc);
    if (!list.length) return h('p', { class: 'nui-note', data: { nurbsNoSolids: '' }, text: t('nurbs.ui.solid.none') });
    const n = S.cmd ? S.need() : null, want = n && n.kind === 'solid';
    return h('ul', { class: 'nui-list nui-items', data: { nurbsSolids: '' } }, ...list.map((b) => h('li', { class: 'nui-item', data: { nurbsSolid: b.id } },
      h('span', { class: 'nui-name', text: b.name || b.id, title: b.id }),
      h('span', { class: 'nui-meta', text: t('nurbs.ui.solid.faces', { n: b.faces.length }) }),
      h('span', { class: 'nui-acts' },
        want ? h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsPick: b.id }, disabled: S.picks.some((p) => p.id === b.id), onclick: () => S.pick({ id: b.id }) }, t('nurbs.ui.pick')) : null,
        host.bake ? h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsBake: b.id }, disabled: busy, onclick: () => host.bake.run(b.id) }, host.bake.label) : null,
        h('button', { type: 'button', class: 'nui-icon', title: t('nurbs.ui.solid.ungroup'), 'aria-label': t('nurbs.ui.solid.ungroup'), data: { nurbsUngroup: b.id }, onclick: () => S.removeSolid(b.id, {}, t('nurbs.ui.solid.ungroup')) }, h('i', { class: 'bi bi-box-arrow-up', 'aria-hidden': 'true' })),
        h('button', { type: 'button', class: 'nui-icon', title: t('nurbs.ui.solid.delete'), 'aria-label': t('nurbs.ui.solid.delete'), data: { nurbsSolidDelete: b.id }, onclick: () => S.removeSolid(b.id, { faces: true }, t('nurbs.ui.solid.delete')) }, h('i', { class: 'bi bi-trash', 'aria-hidden': 'true' }))))));
  }

  /** The last scan fit: one row per face, the fit error measured against the scan (mesh to surface). */
  function scanTable() {
    if (!lastScan || !lastScan.list || !lastScan.list.length) return null;
    return h('div', { class: 'nui-scan', data: { nurbsScan: '' } },
      h('h3', { class: 'nui-h', text: t('nurbs.ui.scan.title') }),
      h('table', { class: 'nui-edges', data: { nurbsScanTable: '' } },
        h('thead', {}, h('tr', {}, ...['nurbs.ui.scan.face', 'nurbs.ui.scan.kind', 'nurbs.ui.scan.tris', 'nurbs.ui.scan.rms', 'nurbs.ui.scan.max', 'nurbs.ui.scan.within'].map((k) => h('th', { scope: 'col', text: t(k) })))),
        h('tbody', {}, ...lastScan.list.map((p) => h('tr', { data: { nurbsScanRow: p.id, ok: p.max <= lastScan.tol ? '1' : '0' } },
          h('td', { text: p.name }), h('td', { text: t('nurbs.ui.scan.k.' + p.kind)
            + (p.blend ? ' · ' + (p.blend.from != null ? t('nurbs.ui.scan.blendvar', { a: fmt(p.blend.from, 3), b: fmt(p.blend.to, 3) }) : t('nurbs.ui.scan.blend', { r: fmt(p.blend.radius, 3) })) + ' (' + p.blend.between.join(', ') + ')' : p.radius != null && p.kind !== 'freeform' ? ' · ' + t('nurbs.ui.scan.radius', { r: fmt(p.radius, 3) }) : '')
            + (p.blend && p.blend.major != null ? ' · ' + t('nurbs.ui.scan.ring', { R: fmt(p.blend.major, 3) }) : '')
            + (p.halfAngle != null ? ' · ' + t('nurbs.ui.scan.halfangle', { a: fmt(p.halfAngle, 2) }) : '')
            + (p.trimmed ? ' · ' + t('nurbs.ui.scan.trimmed') : '') }), h('td', { class: 'tabular', text: String(p.tris) }),
          h('td', { class: 'tabular', text: fmt(p.rms, 4) }), h('td', { class: 'tabular', text: fmt(p.max, 4) }), h('td', { class: 'tabular', text: fmt(p.within * 100, 1) + ' %' }))))),
      host.cloud && lastScan.map && lastScan.map.length ? h('label', { class: 'nui-inline' }, h('input', { type: 'checkbox', checked: devOn, data: { nurbsDevmap: '' }, onchange: (e) => { devOn = e.target.checked; host.cloud(devOn ? lastScan.map : null, lastScan.tol); render(); } }), ' ', t('nurbs.ui.scan.devmap')) : null,
      host.cloud && devOn && lastScan.map && lastScan.map.length ? h('p', { class: 'nui-note', data: { nurbsDevlegend: '' }, text: t('nurbs.ui.scan.devlegend', { tol: lastScan.tol }) }) : null,
      lastScan.pieces && lastScan.pieces.length ? h('p', { class: 'nui-note', text: t('nurbs.ui.scan.unfitted_list', { list: lastScan.pieces.map((u) => t('nurbs.ui.scan.u.' + u.reason, { tris: u.tris })).join('; ') }) }) : null,
      h('p', { class: 'nui-note', text: t('nurbs.ui.scan.note', { ign: fmt((lastScan.ignored || 0) * 100, 1) }) }));
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
    const sr = kind === 'step' ? N.step.writeStepReport(S.doc, { name }) : kind === 'iges' ? N.iges.writeIgesReport(S.doc, { name }) : null;   // solids as closed shells (STEP 0.9 SU.747c; IGES entity 186 the same day)
    const out = kind === 'step' ? [sr.text, name + '.step', 'model/step']
      : kind === 'iges' ? [sr.text, name + '.igs', 'model/iges'] : [N.doc.toJSON(S.doc), name + '.ccnurbs', 'application/json'];
    host.save(out[1], out[0], out[2]);
    const shells = sr ? sr.solids.filter((x) => x.closed).length : 0, open = sr ? sr.solids.length - shells : 0;
    say(t('nurbs.ui.exported', { file: out[1] }) + (sr && sr.solids.length ? ' ' + t('nurbs.ui.exported_shells', { n: shells, open }) : ''));   // IGES carries trimmed faces as entity 144 since 0.9 (DC.54)
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
    root.replaceChildren(...[   // null entries are left out: replaceChildren(null) would write the word "null"
      h('div', { class: 'nui-row nui-top' },
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsUndo: '' }, disabled: !S.canUndo, onclick: () => { const l = S.undo(); if (l) say(t('nurbs.ui.undid', { what: l })); } }, h('i', { class: 'bi bi-arrow-counterclockwise', 'aria-hidden': 'true' }), ' ', t('nurbs.ui.undo')),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsRedo: '' }, disabled: !S.canRedo, onclick: () => { const l = S.redo(); if (l) say(t('nurbs.ui.redid', { what: l })); } }, h('i', { class: 'bi bi-arrow-clockwise', 'aria-hidden': 'true' }), ' ', t('nurbs.ui.redo')),
        h('label', { class: 'nui-inline' }, t('nurbs.ui.view') + ' ',
          h('select', { class: 'select-cc', data: { nurbsMode: '' }, onchange: (e) => host.setView({ ...host.view, mode: e.target.value }) },
            ...['shaded', 'zebra', 'curvature'].map((m) => h('option', { value: m, selected: v.mode === m, text: t('nurbs.ui.mode.' + m) })))),
        h('label', { class: 'nui-inline' }, h('input', { type: 'checkbox', checked: !!v.cvs, data: { nurbsCvs: '' }, onchange: (e) => host.setView({ ...host.view, cvs: e.target.checked }) }), ' ', t('nurbs.ui.cvs'))),
      kr ? h('p', { class: 'nui-note', data: { nurbsRange: '' }, text: t('nurbs.ui.krange', { min: fmt(kr.min, 6), max: fmt(kr.max, 6) }) }) : null,
      ...[...GROUPS, ...(host.scan ? [SCAN_GROUP] : []), ...(host.cage ? [CAGE_GROUP] : [])].map(([g, ids]) => h('div', { class: 'nui-group' }, h('h3', { class: 'nui-h', text: t(g) }),
        h('div', { class: 'nui-cmds' }, ...ids.map((id) => h('button', { type: 'button', class: 'btn-line btn-sm-cc' + (S.cmd === id ? ' is-on' : ''), 'aria-pressed': String(S.cmd === id), data: { nurbsStart: id },
          onclick: () => { error = null; if (S.cmd === id) S.cancel(); else S.start(id); } }, t(N.tools.COMMANDS[id].label)))))),
      commandCard(),
      error ? h('p', { class: 'nui-error', role: 'alert', data: { nurbsError: error.key }, text: errText(error) }) : null,
      note && !error ? h('p', { class: 'nui-note', 'aria-live': 'polite', text: note }) : null,
      scanTable(),
      h('h3', { class: 'nui-h', text: t('nurbs.ui.items') }), itemRows(),
      h('h3', { class: 'nui-h', text: t('nurbs.ui.solids') }), solidRows(),
      h('h3', { class: 'nui-h', text: t('nurbs.panel.edges') }), edgeTable(), h('p', { class: 'nui-note', text: t('nurbs.panel.note') }),
      h('div', { class: 'nui-row' },
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsExport: 'step' }, onclick: () => exportAs('step') }, t('nurbs.ui.export.step')),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsExport: 'iges' }, onclick: () => exportAs('iges') }, t('nurbs.ui.export.iges')),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsExport: 'ccnurbs' }, onclick: () => exportAs('ccnurbs') }, t('nurbs.ui.export.ccnurbs')),
        host.open ? h('button', { type: 'button', class: 'btn-line btn-sm-cc', data: { nurbsImport: '' }, onclick: importFile }, t('nurbs.ui.import')) : null)].filter((x) => x != null));
    const need = S.cmd ? S.need() : null;
    host.collecting?.(!!(S.cmd && ((need && need.kind !== 'points') || (!need && S.extra()))));
  }
  render();
  return { refresh: render, dispose: () => { host.collecting?.(false); host.cloud?.(null); root.remove(); } };
}
