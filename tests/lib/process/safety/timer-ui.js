/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: English fallback words of the timer panel; a host's own language file wins */
/**
 * timer-ui.js — the facilitation timer panel of a HAZOP / What-If session (0.8 CH.14, chem-mount_PART_5): one row per node of the drawing with its minutes, a big clock for the node on
 * the table, Start / Pause / Next node, the session total, and the times as CSV. The numbers are kept with the person's add-on storage and survive a closed page.
 *   mountTimer(el, { t, nodes() → [{ id, name }], coverage?(id) → { covered, total }, load(), save(snap), now?, download?, tickMs? }) → { refresh(), timer, plan(totalMinutes), stop() }
 * DOM text goes in through textContent. The panel redraws once a second only while the clock is running (the host calls stop() on deactivate).
 */
import { createTimer, plan as planMinutes, toCsv, clock, MIN_MINUTES } from './hazoptimer.js';

export const WORDS = {
  'timer.lede': 'Keep the HAZOP session on time. Set the minutes for each node, start the clock on the node the team is discussing, and move on when it is done. Over-time is shown, never forced.',
  'timer.none': 'No node yet. Draw a node boundary with PIDNODE first.', 'timer.total': 'Session total (minutes)', 'timer.share': 'Share the minutes out',
  'timer.start': 'Start', 'timer.pause': 'Pause', 'timer.resume': 'Resume', 'timer.next': 'Done, next node', 'timer.reset': 'Reset all', 'timer.csv': 'Times (CSV)', 'timer.plus5': '+5 min',
  'timer.now': 'On the table: {name}', 'timer.idle': 'No node on the table.', 'timer.over': 'over by {time}', 'timer.left': '{time} left', 'timer.done': 'done',
  'timer.session': 'Used {used} of {planned}', 'timer.note': 'A team study aid. It records the time; it does not decide that a node is finished.',
};
const wordsOf = (t) => (k, v) => { const r = t ? t(k, v) : k; if (r && r !== k) return r; return (WORDS[k] || k).replace(/\{(\w+)\}/g, (m, a) => (v && v[a] !== undefined ? v[a] : m)); };

export function mountTimer(el, { t: t0, nodes, coverage = null, load = () => null, save = () => {}, now = () => Date.now(), download = null, tickMs = 1000 } = {}) {
  const t = wordsOf(t0), d = el.ownerDocument, mk = (tag, cls, text) => { const n = d.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const timer = createTimer({ nodes: [], now });
  const snap = load(); let planned = new Map((snap && Array.isArray(snap.rows) ? snap.rows : []).map((r) => [r.id, Math.round(r.plannedS / 60)]));
  const sync = () => { timer.sync((nodes() || []).map((n) => ({ id: n.id, name: n.name })), 15); };
  sync(); if (snap) timer.restore(snap);
  const persist = () => save(timer.snapshot());
  const clockEl = mk('div'); clockEl.setAttribute('data-timer-clock', ''); clockEl.style.cssText = 'font-size:2rem;font-variant-numeric:tabular-nums;margin:0.25rem 0';
  const nowEl = mk('div'); nowEl.setAttribute('data-timer-now', '');
  const sessEl = mk('div', 'text-ink-2'); sessEl.setAttribute('data-timer-session', '');
  const list = mk('ul', 'meta-items'); list.setAttribute('data-timer-nodes', '');
  const bar = mk('div'); const tot = d.createElement('input'); tot.type = 'number'; tot.min = '5'; tot.value = '120'; tot.style.width = '5rem'; tot.setAttribute('data-timer-total', ''); tot.setAttribute('aria-label', t('timer.total'));
  const btn = (key, fn) => { const b = mk('button', 'btn-line btn-sm-cc', t(key)); b.type = 'button'; b.setAttribute('data-timer-act', key); b.style.margin = '0 0.25rem 0.25rem 0'; b.addEventListener('click', () => { fn(); persist(); draw(); }); return b; };
  const pauseB = btn('timer.pause', () => { const s = timer.state(); if (s.running) timer.pause(); else timer.resume(); });
  const planFn = (minutes) => { const rows = planMinutes(nodes() || [], minutes, { coverage: coverage ? Object.fromEntries((nodes() || []).map((n) => [n.id, coverage(n.id)])) : null });
    const snapShot = timer.snapshot(); snapShot.rows = snapShot.rows.map((r) => { const p = rows.find((x) => x.id === r.id); return p ? { ...r, plannedS: p.minutes * 60 } : r; }); timer.restore(snapShot); return rows; };
  bar.append(mk('label', '', t('timer.total') + ' '), tot, btn('timer.share', () => { planFn(Number(tot.value) || 120); }), pauseB, btn('timer.next', () => { timer.next(); }), btn('timer.reset', () => { timer.reset(); }),
    btn('timer.csv', () => { const text = toCsv(timer.state()); if (download) download('hazop-times.csv', text, 'text/csv'); else { const w = d.defaultView, a = d.createElement('a'); a.href = w.URL.createObjectURL(new w.Blob([text], { type: 'text/csv' })); a.download = 'hazop-times.csv'; a.click(); } }));
  function draw() {
    const s = timer.state();
    list.replaceChildren(...(s.nodes.length ? s.nodes.map((n) => {
      const li = mk('li'); li.setAttribute('data-timer-node', n.id);
      const state = n.done ? t('timer.done') : n.overS ? t('timer.over', { time: clock(n.overS) }) : t('timer.left', { time: clock(n.leftS) });
      li.append(mk('strong', '', n.id + ' ' + n.name), mk('span', '', ' ' + Math.round(n.plannedS / 60) + ' min, ' + clock(n.spentS) + ', ' + state + ' '));
      const go = mk('button', 'btn-line btn-sm-cc', t('timer.start')); go.type = 'button'; go.setAttribute('data-timer-start', n.id); go.addEventListener('click', () => { timer.start(n.id); persist(); draw(); });
      const more = mk('button', 'btn-line btn-sm-cc', t('timer.plus5')); more.type = 'button'; more.addEventListener('click', () => { timer.extend(n.id, 5); persist(); draw(); });
      li.append(go, ' ', more); return li;
    }) : [mk('li', 'text-ink-2', t('timer.none'))]));
    const cur = s.nodes.find((n) => n.id === s.current);
    nowEl.textContent = cur ? t('timer.now', { name: cur.id + ' ' + cur.name }) : t('timer.idle');
    clockEl.textContent = cur ? (cur.overS ? '+' + clock(cur.overS) : clock(cur.leftS)) : '--:--';
    clockEl.style.color = cur && cur.overS ? 'var(--bs-danger, #b00020)' : '';
    sessEl.textContent = t('timer.session', { used: clock(s.spentS), planned: clock(s.plannedS) });
    pauseB.textContent = t(s.running || !s.current ? 'timer.pause' : 'timer.resume'); pauseB.disabled = !s.current;
  }
  const refresh = () => { sync(); draw(); };
  let handle = null;
  const tick = () => { if (el.isConnected && timer.state().running) draw(); };
  handle = d.defaultView.setInterval(tick, tickMs);
  el.replaceChildren(mk('p', 'text-ink-2', t('timer.lede')), nowEl, clockEl, sessEl, bar, list, mk('p', 'text-ink-2', t('timer.note')));
  draw(); void planned; void MIN_MINUTES;
  return { refresh, timer, plan: planFn, stop: () => { if (handle) d.defaultView.clearInterval(handle); handle = null; } };
}
