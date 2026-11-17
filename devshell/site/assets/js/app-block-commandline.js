/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-commandline.js: the command line anywhere (UI.9). There is ONE command line component, `dockedCommandLine` in app-cmdline.js
 * (BK.34: history above the field, suggestions, Enter and Space run a word, an unknown word opens the finder); this block is its place
 * in a layout, not a second one. Places: stage-bottom, bottom, float (over the drawing) and window (its own window, UI.2). Options:
 * `history` (the list above), `log` (the caret that opens the log of what ran), `width` (rem, 20 to 60). Dragged by its grip it floats
 * anywhere over the drawing, or goes to a window; the place is remembered (cc-ws-cmdline:<app>); Ctrl+9 shows and hides it; typed
 * input goes to it from anywhere in the drawing when the layout says so (the app's key gate does that already while the field is on screen).
 * Filled by the app's own command line when it has one (CadCraft's, with its keyword prompts: host.commandLine(opts) → a form) and
 * by the finder elsewhere (the shared field).
 *
 *   mount(host, region, opts) → { el, input, mode(), setMode(m), toggle(), refresh(), destroy() }
 *   modes: docked | float | window | hidden   position (float): { x, y } as fractions of the drawing box, kept inside it
 */
import { dockedCommandLine } from './app-cmdline.js';
import { el, store, words, clampInt, bool, oneOf, mark } from './app-block-core.js';

export const MODES = ['docked', 'float', 'window', 'hidden'];
export const WIDTH = { min: 20, max: 60, def: 34 };
/** Keep a float position inside the box (fractions 0..1 of the drawing area, the field never leaves it). */
export const clampPos = (p) => ({ x: Math.min(1, Math.max(0, Number.isFinite(p?.x) ? p.x : 0.5)), y: Math.min(1, Math.max(0, Number.isFinite(p?.y) ? p.y : 0.9)) });

export const block = {
  kind: 'commandline', family: 'overlays', places: ['stage-bottom', 'bottom', 'float'], needs: [],
  opts: { history: bool, log: bool, width: (v) => (Number.isInteger(v) && v >= WIDTH.min && v <= WIDTH.max ? v : undefined), mode: oneOf(MODES) },
  mount(host, region, o = {}) {
    const T = words(host), app = host.app || '', st = store(app);
    // 0.10 UI.17: ONE command line. An app that has its own (CadCraft's bar with its history, size and float) keeps it; this block then adds no second field.
    if (typeof host.ownCommandLine === 'function' && host.ownCommandLine()) return { el: null, input: null, own: true, mode: () => 'own', setMode() {}, toggle() {}, position: () => ({ x: 0, y: 0 }), refresh() {}, destroy() {} };
    const saved = st.get('cmdline', {}) || {};
    let mode = MODES.includes(saved.mode) ? saved.mode : (o.mode || (region.getAttribute?.('data-ws-place') === 'float' ? 'float' : 'docked'));
    let pos = clampPos(saved.pos);
    const wrap = mark(el('div', { className: 'blk-cmd', 'data-mode': mode }), 'commandline');
    const grip = el('button', { type: 'button', className: 'blk-cmd-grip', 'aria-label': T('shell.cmd.grip'), title: T('shell.cmd.grip') }, '⋮⋮');
    const form = (typeof host.commandLine === 'function' && host.commandLine(o)) || dockedCommandLine({ t: T, app });
    const log = o.log ? el('button', { type: 'button', className: 'blk-cmd-log', 'aria-label': T('shell.cmd.log'), title: T('shell.cmd.log'), 'aria-expanded': 'false' }, '▴') : null;
    const input = form.querySelector('input') || null;
    wrap.style.setProperty('--blk-cmd-w', clampInt(o.width, WIDTH.min, WIDTH.max, WIDTH.def) + 'rem');
    wrap.append(grip, form, log);
    let win = null, popout = null;
    import('./app-windows.js').then((m) => { popout = m.popout; }).catch(() => { /* no window service: the window mode stays docked */ });   // loaded at mount, so a click can open the window at once; a DOM-free test never pulls the icon module in
    const parentFor = (m) => (m === 'float' ? (host.stage || region) : region);
    function save() { st.set('cmdline', { mode, pos }); }
    function place() {
      if (mode !== 'float') { wrap.style.left = wrap.style.top = ''; return; }
      const box = wrap.parentNode?.getBoundingClientRect?.() || { width: 0, height: 0 };
      wrap.style.left = Math.round(pos.x * Math.max(0, box.width - wrap.offsetWidth)) + 'px';
      wrap.style.top = Math.round(pos.y * Math.max(0, box.height - wrap.offsetHeight)) + 'px';
    }
    function setMode(m) {
      if (!MODES.includes(m)) return false;
      if (win && m !== 'window') { win.back(); win = null; }
      mode = m; wrap.setAttribute('data-mode', m); wrap.hidden = m === 'hidden';
      if (m === 'window' && !popout) m = mode = 'docked';
      if (m === 'window') {
        win = popout({ name: 'cmdline', title: () => T('shell.ws.cmd'), nodes: [wrap], size: () => ({ w: 560, h: 120 }), onChange: (open) => { if (!open && mode === 'window') { win = null; setMode('docked'); } } });
        if (!win.open()) { win = null; return setMode('docked'); }   // pop-ups refused: stay docked, never lose the line
      } else { const p = parentFor(m); if (wrap.parentNode !== p) p.append(wrap); }
      place(); save(); return true;
    }
    // drag the grip: floats the line over the drawing and keeps it inside the box
    grip.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || mode === 'window') return;
      const stage = host.stage || region, sr = stage.getBoundingClientRect();
      if (mode !== 'float') { mode = 'float'; wrap.setAttribute('data-mode', 'float'); stage.append(wrap); }
      const w = wrap.offsetWidth, h = wrap.offsetHeight, r0 = wrap.getBoundingClientRect(), dx = e.clientX - r0.left, dy = e.clientY - r0.top;
      grip.setPointerCapture?.(e.pointerId);
      const move = (ev) => {
        const x = Math.min(Math.max(0, ev.clientX - dx - sr.left), Math.max(0, sr.width - w)), y = Math.min(Math.max(0, ev.clientY - dy - sr.top), Math.max(0, sr.height - h));
        pos = clampPos({ x: sr.width > w ? x / (sr.width - w) : 0, y: sr.height > h ? y / (sr.height - h) : 0 }); place();
      };
      const up = () => { grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', up); save(); };
      grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', up);
    });
    grip.addEventListener('keydown', (e) => {   // the keyboard way: arrows move it, Enter cycles docked > float > window
      if (e.key === 'Enter') { e.preventDefault(); setMode(MODES[(MODES.indexOf(mode) + 1) % 3]); return; }
      const step = { ArrowLeft: [-0.05, 0], ArrowRight: [0.05, 0], ArrowUp: [0, -0.05], ArrowDown: [0, 0.05] }[e.key];
      if (step) { e.preventDefault(); if (mode !== 'float') setMode('float'); pos = clampPos({ x: pos.x + step[0], y: pos.y + step[1] }); place(); save(); }
    });
    log?.addEventListener('click', () => { const open = log.getAttribute('aria-expanded') !== 'true'; log.setAttribute('aria-expanded', String(open)); input?.focus(); input?.dispatchEvent(new Event('focus')); });
    // Ctrl+9 shows and hides the line, as people expect
    const key = (e) => { if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key === '9') { e.preventDefault(); toggle(); } };
    const doc = region.ownerDocument; doc.addEventListener('keydown', key);
    let last = mode === 'hidden' ? 'docked' : mode;
    function toggle() { if (mode === 'hidden') { setMode(last); input?.focus(); } else { last = mode; setMode('hidden'); } }
    (parentFor(mode) || region).append(wrap); if (mode === 'window') setMode('window'); else { wrap.hidden = mode === 'hidden'; place(); }
    return { el: wrap, input, mode: () => mode, setMode, toggle, position: () => ({ ...pos }), refresh: place, destroy() { doc.removeEventListener('keydown', key); win?.back(); wrap.remove(); } };
  },
};
