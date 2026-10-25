/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — a test fixture (bin/test-cadcraft-addons.mjs). */
/**
 * Test pipes: what bin/test-cadcraft-addons.mjs drives through CadCraft's add-on API 1.0.
 *   pipe (local frame, data version 2: {a, b, label}; version 1 called the label "name" — read() upgrades it)
 *   run  (world frame: {pts}) — the reference stays at the origin; a move is baked into the points
 *   PIPE, RUN commands; a Properties section (label); a .pts importer and exporter; an afterChange hook that puts a point
 *   at the centre of every circle a change adds (in the same undo step).
 */
const apply = (m, p) => ({ x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] });

export function activate(api) {
  api.objects.define('pipe', {
    version: 2,
    name: api.t('pipe.name'),
    draw(d) {
      const dx = d.b.x - d.a.x, dy = d.b.y - d.a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 0.5, ny = dx / L * 0.5;
      return [
        { type: 'line', x1: d.a.x + nx, y1: d.a.y + ny, x2: d.b.x + nx, y2: d.b.y + ny },
        { type: 'line', x1: d.a.x - nx, y1: d.a.y - ny, x2: d.b.x - nx, y2: d.b.y - ny },
        { type: 'text', x: (d.a.x + d.b.x) / 2, y: (d.a.y + d.b.y) / 2 + 1, h: 1, rot: 0, s: String(d.label || '') },
      ];
    },
    grips: (d) => [{ x: d.a.x, y: d.a.y, key: 'a' }, { x: d.b.x, y: d.b.y, key: 'b' }],
    gripMove(d, key, to) { d[key] = { x: to.x, y: to.y }; return d; },
    read(d, v) { if (v === 1) { d.label = d.name; delete d.name; } return d; },
  });
  api.objects.define('run', {
    frame: 'world',
    name: api.t('run.name'),
    draw: (d) => [{ type: 'poly', closed: false, pts: d.pts.map((p) => ({ x: p.x, y: p.y, b: 0 })) }],
    transform(d, m) { d.pts = d.pts.map((p) => apply(m, p)); return d; },
    grips: (d) => d.pts.map((p, i) => ({ x: p.x, y: p.y, key: 'v' + i })),
    gripMove(d, key, to) { d.pts[+key.slice(1)] = { x: to.x, y: to.y }; return d; },
  });
  api.commands.add('PIPE', ['PP'], async (c) => {
    const a = await c.point(api.t('pipe.from'));
    const b = await c.point(api.t('pipe.to'), { base: a });
    c.doc.change('PIPE', () => c.doc.add(api.objects.create('pipe', { a, b, label: 'P' + (c.doc.count() + 1) })));
  }, { help: () => api.t('pipe.help') });
  api.commands.add('RUN', [], async (c) => {
    const pts = [];
    for (;;) {
      const p = await c.point(api.t('run.next'), { none: true, base: pts[pts.length - 1] });
      if (!p) break;
      pts.push({ x: p.x, y: p.y });
    }
    if (pts.length >= 2) c.doc.change('RUN', () => c.doc.add(api.objects.create('run', { pts })));
  }, { help: () => api.t('run.help') });
  api.props.section({
    key: api.addon.id, label: api.t('pipe.section'), types: ['insert'],
    defs: (ents) => (ents.every((e) => api.objects.is(e, 'pipe')) ? [{
      key: 'label', kind: 'text', label: api.t('pipe.label'),
      get: (e) => api.objects.dataOf(e).label,
      set: (e, v) => api.objects.update(e, { ...api.objects.dataOf(e), label: v }),
    }] : []),
  });
  api.files.importer({ id: 'pts', label: api.t('pts.label'), extensions: ['.pts'],
    read: async (f) => ({ entities: (await f.text()).trim().split(/\r?\n/).map((l) => { const [x, y] = l.split(',').map(Number); return { type: 'point', x, y }; }) }) });
  api.files.exporter({ id: 'pts', label: api.t('pts.label'), extension: '.pts', mime: 'text/plain',
    write: (doc) => doc.all().filter((e) => e.type === 'point').map((e) => e.x + ',' + e.y).join('\n') });
  api.drawing.afterChange((doc, ops) => {
    for (const op of ops) if (!op.before && op.after && op.after.type === 'circle' && op.map) doc.add({ type: 'point', x: op.after.cx, y: op.after.cy, layer: op.after.layer }, op.map);
  });
  // page parts (null in Node)
  api.toolbar.group({ id: 'pipes', label: api.t('pipe.section'), tools: [{ id: 'pipe', label: api.t('pipe.name'), icon: 'bi-slash-lg', title: api.t('pipe.help'), command: 'PIPE' }] });
  api.toolbar.menuItem({ group: 'pipes', command: 'RUN', label: api.t('run.name'), key: 'RUN' });
  api.toolbar.menuItem({ group: 'Annotate', command: 'PIPE', label: api.t('pipe.name'), key: 'PP' });
  api.ui.panelSection({ id: 'pipes', title: api.t('pipe.section'), render(el) { el.textContent = 'Pipes in this drawing: ' + api.doc.all().filter((e) => api.objects.is(e)).length; } });
  api.ui.settingsSection({ id: 'pipes', title: api.t('pipe.section'), render(fs) { const l = document.createElement('label'); const c = document.createElement('input'); c.type = 'checkbox'; c.setAttribute('data-pipes-setting', ''); l.append(c, ' Label new pipes'); fs.append(l); }, reset() {} });
  globalThis.__testPipes = api;
}
