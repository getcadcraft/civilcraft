/* SPDX-License-Identifier: Apache-2.0 */
/**
 * unit-settings.js — Settings › General › Units (0.7 UNITS; canonical in lib/units/, copied byte for byte into each app's
 * dev/ by `node tools/units/sync.mjs`). The shell's dialog (core/components/app-settings.inc) prints an empty
 * [data-units-set] fieldset with the URL of the build's copy; assets/js/app-settings.js imports it and calls
 * mountUnitSettings(fieldset, T) with the shell's words (window.ccShellT).
 *
 * One list per kind (length, area, volume, angle, slope), each a <details> with one row per unit: a switch (shown in the
 * unit dropdowns or not) and a star (the default for new drawings, measures and items; a second click takes it away).
 * Changes are saved at once (unit-prefs.js, localStorage "cc-units", the same for every app in this browser) and every
 * open app hears them (event "cc-units-change"). "Reset the unit lists" puts the table's own lists back, without stars.
 */
import { KINDS, unitsOf, unitName } from './unit-table.js';
import { unitsOn, starOf, setOn, setStar, resetUnits, onUnitsChange } from './unit-prefs.js';

let stop = null;

export function mountUnitSettings(box, T = (k) => k) {
  if (!box) return;
  const list = box.querySelector('[data-units-list]') || box;
  const doc = box.ownerDocument;
  const el = (tag, props = {}, ...kids) => { const n = doc.createElement(tag); for (const [k, v] of Object.entries(props)) { if (k === 'class') n.className = v; else if (k.startsWith('data-') || k.startsWith('aria-') || k === 'role' || k === 'type') n.setAttribute(k, v); else n[k] = v; } n.append(...kids.filter((x) => x !== null && x !== undefined)); return n; };
  const open = new Set(['length']);

  function render() {
    const focusKey = doc.activeElement?.closest?.('[data-unit-row]') ? doc.activeElement.getAttribute('data-unit-focus') : null;
    for (const d of list.querySelectorAll('details[data-units-kind]')) { if (d.open) open.add(d.dataset.unitsKind); else open.delete(d.dataset.unitsKind); }
    const parts = KINDS.map((kind) => {
      const rows = unitsOf(kind), on = new Set(unitsOn(kind)), star = starOf(kind);
      const sum = el('span', { class: 'shell-units-sum' }, T('shell.units.count', { on: on.size, n: rows.length }) + (star ? ' · ★ ' + unitName(star, T) : ''));
      const ul = el('ul', { class: 'shell-units', role: 'list' });
      for (const u of rows) {
        const name = unitName(u.id, T), isOn = on.has(u.id), isStar = star === u.id;
        const sw = el('input', { class: 'form-check-input', type: 'checkbox', role: 'switch', 'data-unit-focus': 'on:' + u.id, 'aria-label': T('shell.units.show', { unit: name }) });
        sw.checked = isOn;
        sw.addEventListener('change', () => setOn(u.id, sw.checked));
        const starBtn = el('button', { type: 'button', class: 'shell-unit-star' + (isStar ? ' is-star' : ''), 'aria-pressed': isStar ? 'true' : 'false', 'data-unit-focus': 'star:' + u.id,
          title: T(isStar ? 'shell.units.starred' : 'shell.units.star', { unit: name }), 'aria-label': T(isStar ? 'shell.units.starred' : 'shell.units.star', { unit: name }) },
        el('i', { class: 'bi ' + (isStar ? 'bi-star-fill' : 'bi-star'), 'aria-hidden': 'true' }));
        starBtn.addEventListener('click', () => setStar(kind, isStar ? null : u.id));
        ul.append(el('li', { class: 'shell-unit' + (isOn ? '' : ' is-off'), 'data-unit-row': u.id },
          el('label', { class: 'form-check form-switch shell-unit-on' }, sw, el('span', { class: 'shell-unit-name' }, name), name === u.mark ? null : el('span', { class: 'shell-unit-mark' }, u.mark)),
          starBtn));
      }
      const d = el('details', { class: 'shell-units-kind', 'data-units-kind': kind }, el('summary', {}, el('span', { class: 'shell-units-kname' }, T('shell.units.kind.' + kind)), sum),
        star ? null : el('p', { class: 'shell-hint-text' }, T('shell.units.nostar')), ul);
      d.open = open.has(kind);
      return d;
    });
    const reset = el('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-units-reset': '' }, el('i', { class: 'bi bi-arrow-counterclockwise', 'aria-hidden': 'true' }), ' ' + T('shell.units.reset'));
    reset.addEventListener('click', () => resetUnits());
    list.replaceChildren(...parts, el('div', { class: 'shell-btns' }, reset));
    if (focusKey) list.querySelector('[data-unit-focus="' + focusKey + '"]')?.focus();
  }
  render();
  stop?.();
  stop = onUnitsChange(render);
  box.hidden = false;
}
