/* SPDX-License-Identifier: Apache-2.0 */
/**
 * split-menu.js — a ribbon tile that holds several tools is a SPLIT button (owner 2026-11-05: "if you click the icon it activates the
 * tool and if you click the icon edge it activates the menu"). The icon and its label run the menu's current tool (the one used last,
 * else the first); the narrow edge with the arrow opens the whole menu. A keyboard press on the tile (Enter, Space) opens the menu, so
 * nothing is reachable only by the pointer. The last tool used is remembered per menu in this browser (localStorage civilcraft.split).
 *   splitMenus(root) — idempotent; a tile is a menu `details.cv-menu[data-group-menu]` whose name is not its group's ("More" menus stay plain).
 */
import { t } from './i18n.js';

const KEY = 'civilcraft.split';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; } };
const memory = {};

export function splitMenus(root) {
  for (const d of root.querySelectorAll('details.cv-menu[data-group-menu]')) {
    const sum = d.querySelector(':scope > summary.cv-tool');
    const group = d.closest('[aria-label]')?.getAttribute('aria-label') || '';
    if (!sum || d.dataset.split !== undefined || d.dataset.groupMenu === group || !d.querySelector('[data-cmd]')) continue;
    d.dataset.split = '';
    d.classList.add('cv-split');
    const edge = document.createElement('span');
    edge.className = 'cv-split-edge'; edge.setAttribute('aria-hidden', 'true');
    edge.innerHTML = '<i class="bi bi-chevron-down"></i>';
    sum.append(edge);
    const key = d.dataset.groupMenu;
    const items = () => [...d.querySelectorAll('[data-cmd]')];
    const current = () => { const want = memory[key] ?? read()[key]; return items().find((b) => b.dataset.cmd === want && !b.disabled) || items().find((b) => !b.disabled) || null; };
    const label = (b) => (b?.textContent || '').trim();
    const retitle = () => { const b = current(); if (b) sum.title = t('ui.split.title', { tool: label(b) }); };
    retitle();
    d.addEventListener('click', (e) => { const b = e.target instanceof Element ? e.target.closest('[data-cmd]') : null; if (b && d.contains(b) && !sum.contains(b)) { memory[key] = b.dataset.cmd; const st = read(); st[key] = b.dataset.cmd; try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* this visit only */ } retitle(); } });
    sum.addEventListener('click', (e) => {
      if (e.detail === 0) return;                                       // the keyboard: the tile opens its menu as it always did
      if (d.open) return;                                               // the menu is open: a click closes it, as before
      const r = edge.getBoundingClientRect();
      if (e.clientX >= r.left) return;                                  // the edge: the menu
      const b = current();
      if (!b) return;
      e.preventDefault();                                               // not the menu: the tool
      b.click();
    });
  }
}
