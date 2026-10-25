/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace-arrange.js — "Arrange your own layout" (0.7 WS.25; Discord 2026-10-24: "define a few basic panels … so everyone can
 * customize the UI to suit their own needs"; map docs/apps/app-workspace.md). A dialog that composes a `cadcraft-workspace` v1 layout
 * from the engine's building blocks, offering only what THIS app can fill (its ribbon, toolbox, palettes, slots, views): which panel
 * holds which editors (the project browser, Properties, the panel's own content; one on top, the others as tabs), the toolbox left,
 * right or not at all (with My tools), a ribbon or the app's toolbar, the info box and the quick bar with the controls a person ticks,
 * view tabs, the view bar, the status bar, the edit palette, and the look. "Use this layout" saves it like an imported file
 * (file:<id>, the same untrusted path: importText → validateLayout → resolveLayout) and switches to it, so it works in every app that
 * has layouts, exports from Settings like any other, and the panel manager still docks, floats and pops out every panel it fills.
 *
 *   arrangeDialog(E) → open(): E = { A, F, T, el, btn, caps(), current() → the layout in use | null, builtin(id) → a layout,
 *                                    slotLabel(name), paletteLabel(name), importText(text) → {ok, key, message}, use(key) }
 */
const SLOT_ORDER = ['tool', 'level', 'document', 'scale', 'detail', 'range', 'fit', 'layout', 'units'];

export function arrangeDialog(E) {
  const { F, T, el, btn } = E;
  const opt = (value, text, on) => el('option', { value, selected: !!on }, text);
  const check = (name, text, on, attrs = {}) => el('label', { className: 'ws-arr-check' }, el('input', { type: 'checkbox', name, checked: !!on, ...attrs }), ' ', text);
  const field = (label, control) => el('label', { className: 'ws-arr-field' }, el('span', {}, label), control);
  const group = (title, ...kids) => el('fieldset', { className: 'ws-arr-group' }, el('legend', {}, title), ...kids);
  const slotList = (caps, withTool) => [...new Set([...(withTool ? ['tool'] : []), ...SLOT_ORDER.filter((s) => caps.slots.includes(s)), ...caps.slots])];

  /** What the form starts from: the layout in use, else the toolbox built-in. */
  function start() {
    const lay = E.current() || E.builtin('toolbox') || { name: '', blocks: [], look: {} };
    const b = Object.fromEntries(lay.blocks.map((x) => [x.block, x]));
    return {
      name: E.current() && /^my-/.test(E.current().id) ? lay.name : T('shell.ws.arr.myname'),
      top: b.ribbon ? 'ribbon' : b.toolbar && b.toolbar.place !== 'none' ? 'toolbar' : b.toolbar ? 'none' : 'toolbar',
      titlebar: !!b.titlebar, options: !!b.options,
      infobox: !!b.infobox, infoSlots: b.infobox?.slots || ['tool', 'level', 'document'],
      toolbox: b.toolbox ? (b.toolbox.place === 'stage-right' ? 'right' : 'left') : 'none', mine: !!b.toolbox?.mine,
      palettes: b.palettes ? (b.palettes.place === 'right-panel' ? 'right' : 'left') : 'none', upper: b.palettes?.upper || 'browser', lower: b.palettes?.lower || ['properties', 'panel'],
      viewtabs: b.viewtabs ? b.viewtabs.mode || 'all' : 'none',
      viewbar: !!b.viewbar, viewSlots: b.viewbar?.slots || ['scale', 'detail', 'range', 'fit'],
      quickbar: !!b.quickbar, quickSlots: b.quickbar?.slots || ['scale', 'detail', 'range', 'fit', 'layout', 'units'],
      statusbar: !!b.statusbar, petpalette: !!b.petpalette,
      look: { density: 'regular', outline: 'box', tabs: 'underline', ...(lay.look || {}) },
    };
  }

  /** The form's values → a layout object (validated by the caller through the format). */
  function build(form, caps) {
    const v = (n) => form.elements[n]?.value;
    const on = (n) => !!form.elements[n]?.checked;
    const ticked = (n) => [...form.querySelectorAll('input[name="' + n + '"]:checked')].map((i) => i.value);
    const name = (v('name') || '').replace(/\s+/g, ' ').trim().slice(0, F.LIMITS.name) || T('shell.ws.arr.myname');
    const id = ('my-' + name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')).slice(0, 40).replace(/-+$/, '') || 'my-layout';
    const blocks = [];
    if (on('titlebar')) blocks.push({ block: 'titlebar', place: 'top', order: 0, quick: ['open', 'save', 'undo', 'redo'].filter((a) => caps.actions.includes(a)), inventory: v('top') === 'ribbon' });
    if (v('top') === 'ribbon') {
      blocks.push({ block: 'ribbon', place: 'top', order: 1, file: ['open', 'save'].filter((a) => caps.actions.includes(a)), collapse: true, tearOff: true });
      if (on('options')) blocks.push({ block: 'options', place: 'top', order: 2, commands: caps.actions.includes('clear') ? ['clear'] : [] });
      blocks.push({ block: 'toolbar', place: 'none' });
    } else if (caps.toolbar) blocks.push({ block: 'toolbar', place: v('top') === 'toolbar' ? 'stage-top' : 'none', order: 0 });
    if (on('infobox') && ticked('infoSlots').length) blocks.push({ block: 'infobox', place: 'stage-top', order: 1, slots: ticked('infoSlots').slice(0, F.LIMITS.slots) });
    if (v('toolbox') !== 'none' && caps.toolbox) blocks.push({ block: 'toolbox', place: v('toolbox') === 'right' ? 'stage-right' : 'stage-left', order: 0, collapse: true, tearOff: true, mine: on('mine') });
    if (v('palettes') !== 'none') {
      const upper = v('upper'), lower = ticked('lower').filter((x) => x !== upper).slice(0, 4);
      if (upper || lower.length) blocks.push({ block: 'palettes', place: v('palettes') === 'right' ? 'right-panel' : 'left-panel', ...(upper ? { upper } : {}), lower });
    }
    if (v('viewtabs') !== 'none' && caps.views) blocks.push({ block: 'viewtabs', place: 'view-top', order: 0, mode: v('viewtabs') });
    if (on('viewbar') && ticked('viewSlots').length) blocks.push({ block: 'viewbar', place: 'view-bottom', order: 0, slots: ticked('viewSlots').slice(0, F.LIMITS.slots) });
    if (on('quickbar') && ticked('quickSlots').length) blocks.push({ block: 'quickbar', place: 'stage-bottom', order: 0, slots: ticked('quickSlots').slice(0, F.LIMITS.slots) });
    if (on('statusbar')) blocks.push({ block: 'statusbar', place: 'bottom', order: 0 });
    if (on('petpalette')) blocks.push({ block: 'petpalette', place: 'float' });
    return { format: F.FORMAT, version: F.VERSION, id, name, description: T('shell.ws.arr.desc'), license: 'Apache-2.0',
      look: { density: v('density'), outline: v('outline'), tabs: v('tabs') }, blocks };
  }

  function open() {
    const caps = E.caps(), s = start();
    const palettes = caps.palettes.filter((p) => p !== 'panel');
    const slotBoxes = (name, chosen, withTool) => el('div', { className: 'ws-arr-slots' },
      slotList(caps, withTool).map((x) => check(name, E.slotLabel(x), chosen.includes(x), { value: x })));
    const sel = (name, choices, now) => el('select', { name, className: 'select-cc' }, choices.filter(Boolean).map(([value, text]) => opt(value, text, value === now)));
    const form = el('form', { method: 'dialog', className: 'ws-arr-form' },
      field(T('shell.ws.arr.name'), el('input', { type: 'text', name: 'name', value: s.name, maxlength: String(F.LIMITS.name), required: true })),
      group(T('shell.ws.arr.g.top'),
        field(T('shell.ws.arr.top'), sel('top', [['toolbar', T('shell.ws.arr.top.toolbar')], caps.ribbon && ['ribbon', T('shell.ws.arr.top.ribbon')], ['none', T('shell.ws.arr.top.none')]], s.top)),
        check('options', T('shell.ws.arr.options'), s.options), check('titlebar', T('shell.ws.arr.titlebar'), s.titlebar),
        check('infobox', T('shell.ws.arr.infobox'), s.infobox), slotBoxes('infoSlots', s.infoSlots, true)),
      group(T('shell.ws.arr.g.sides'),
        caps.toolbox ? field(T('shell.ws.arr.toolbox'), sel('toolbox', [['left', T('shell.ws.arr.left')], ['right', T('shell.ws.arr.right')], ['none', T('shell.ws.arr.nowhere')]], s.toolbox)) : null,
        caps.toolbox ? check('mine', T('shell.ws.arr.mine'), s.mine) : null,
        field(T('shell.ws.arr.palettes'), sel('palettes', [['left', T('shell.ws.arr.panel.left')], ['right', T('shell.ws.arr.panel.right')], ['none', T('shell.ws.arr.panel.none')]], s.palettes)),
        palettes.length ? field(T('shell.ws.arr.upper'), sel('upper', [['', T('shell.ws.arr.upper.none')], ...palettes.map((p) => [p, E.paletteLabel(p)])], palettes.includes(s.upper) ? s.upper : '')) : null,
        el('p', { className: 'ws-arr-hint' }, T('shell.ws.arr.lower')),
        el('div', { className: 'ws-arr-slots' }, [...palettes, 'panel'].map((p) => check('lower', p === 'panel' ? T('shell.ws.arr.own') : E.paletteLabel(p), s.lower.includes(p), { value: p })))),
      group(T('shell.ws.arr.g.drawing'),
        caps.views ? field(T('shell.ws.arr.viewtabs'), sel('viewtabs', [['all', T('shell.ws.arr.tabs.all')], ['open', T('shell.ws.arr.tabs.open')], ['none', T('shell.ws.arr.tabs.none')]], s.viewtabs)) : null,
        check('quickbar', T('shell.ws.arr.quickbar'), s.quickbar), slotBoxes('quickSlots', s.quickSlots, false),
        check('viewbar', T('shell.ws.arr.viewbar'), s.viewbar), slotBoxes('viewSlots', s.viewSlots, false),
        check('petpalette', T('shell.ws.arr.pet'), s.petpalette), check('statusbar', T('shell.ws.arr.statusbar'), s.statusbar)),
      group(T('shell.ws.arr.g.look'),
        field(T('shell.ws.arr.density'), sel('density', F.LOOK.density.map((x) => [x, T('shell.ws.arr.density.' + x)]), s.look.density)),
        field(T('shell.ws.arr.outline'), sel('outline', F.LOOK.outline.map((x) => [x, T('shell.ws.arr.outline.' + x)]), s.look.outline)),
        field(T('shell.ws.arr.tabsstyle'), sel('tabs', F.LOOK.tabs.map((x) => [x, T('shell.ws.arr.tabsstyle.' + x)]), s.look.tabs))),
      el('p', { className: 'ws-arr-msg', role: 'status', 'aria-live': 'polite', 'data-arr-msg': '' }),
      el('div', { className: 'ws-dialog-actions' }, btn(T('shell.ws.arr.use'), { 'data-arr-use': '', className: 'ws-arr-primary' }), btn(T('shell.ws.close'), { 'data-ws-dismiss': '' })));
    const dlg = el('dialog', { className: 'ws-dialog ws-arrange', 'aria-labelledby': 'ws-arr-h' }, el('h2', { id: 'ws-arr-h' }, T('shell.ws.arrange')), el('p', { className: 'ws-arr-hint' }, T('shell.ws.arr.intro')), form);
    const say = (text) => { form.querySelector('[data-arr-msg]').textContent = text; };
    // the options bar only goes with a ribbon; the slot lists only with their bar
    const sync = () => {
      const top = form.elements.top.value;
      form.elements.options.closest('label').hidden = top !== 'ribbon';
      for (const [box, list] of [['infobox', 'infoSlots'], ['quickbar', 'quickSlots'], ['viewbar', 'viewSlots']]) form.querySelector('input[name="' + list + '"]')?.closest('.ws-arr-slots')?.toggleAttribute('hidden', !form.elements[box].checked);
      if (form.elements.mine) form.elements.mine.closest('label').hidden = form.elements.toolbox.value === 'none';
    };
    form.addEventListener('change', sync); sync();
    dlg.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-ws-dismiss')) { e.preventDefault(); dlg.close(); return; }
      if (!b.hasAttribute('data-arr-use')) return;
      e.preventDefault();
      if (!form.reportValidity()) return;
      const obj = build(form, caps), r = F.validateLayout(obj);
      if (!r.ok) { say(T('shell.ws.bad', { why: T('shell.ws.why.' + r.error) })); return; }
      const fit = F.resolveLayout(r.layout, caps);
      if (!fit.ok) { say(T('shell.ws.arr.empty')); return; }
      const done = E.importText(F.exportLayout(r.layout));
      if (!done?.ok) { say(done?.message || T('shell.ws.bad', { why: T('shell.ws.why.unknown') })); return; }
      E.use(done.key);
      dlg.close();
    });
    document.body.append(dlg); dlg.addEventListener('close', () => dlg.remove()); dlg.showModal();
    return { dlg, form, build: () => build(form, caps) };
  }
  return { open };
}
