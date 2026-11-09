/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the review list (cc-clashfix, 0.9 EG.42): every clash, each discipline's proposals with their trade-offs, Accept / Reject /
 * Show per proposal, and one Apply for everything accepted. Shared by every host (rule 39); the host gives words, units and hooks.
 *
 *   const panel = mountClashPanel({ doc, words(k, v), fmt(mm) → text, nameOf(id), canApply(proposal) → bool, assistants() → n,
 *                                   onShow(proposal | clash), onApply(review) → Promise<{ applied, advice }>, status(text, bad) })
 *   panel.open(model, result)   panel.refresh()   panel.close()   panel.review (the ReviewList)   panel.dialog
 * Test hooks in the markup: [data-cf-panel] [data-cf-clash] [data-cf-prop=<id>] [data-cf-accept] [data-cf-reject] [data-cf-show]
 * [data-cf-apply] [data-cf-sum] [data-cf-who].
 */
import { ReviewList } from './coordinator.js';
import { LIMITS } from './disciplines.js';

const CSS = `
dialog.cf-panel { width: min(46rem, 96vw); max-height: 86vh; padding: 0; border: var(--pen-1, 1px) solid var(--ink, #222); background: var(--sheet, #fff); color: var(--ink, #222); }
dialog.cf-panel[open] { display: flex; flex-direction: column; position: fixed; inset: 4rem 1rem auto auto; margin: 0; z-index: 60; }
.cf-head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .5rem .75rem; border-bottom: var(--pen-1, 1px) solid var(--line, #ccc); }
.cf-head h2 { font-size: 1rem; margin: 0; }
.cf-body { overflow: auto; padding: .5rem .75rem; display: grid; gap: .6rem; }
.cf-body p { margin: 0; }
.cf-muted { color: var(--ink-2, #555); font-size: var(--fs-sm, .875rem); }
.cf-clash { border: var(--pen-1, 1px) solid var(--line, #ccc); border-radius: var(--radius, 4px); padding: .4rem .5rem; display: grid; gap: .35rem; }
.cf-clash h3 { font-size: .95rem; margin: 0; display: flex; justify-content: space-between; gap: .5rem; }
.cf-prop { display: grid; gap: .2rem; padding: .35rem .4rem; border-left: 4px solid var(--line, #ccc); background: var(--sheet-2, #f6f6f6); }
.cf-prop[data-state="accepted"] { border-left-color: var(--action, #1a6); }
.cf-prop[data-state="rejected"] { opacity: .6; }
.cf-prop.cf-bad { border-left-color: var(--layer-red, #c33); }
.cf-row { display: flex; flex-wrap: wrap; gap: .35rem; align-items: center; }
.cf-chip { font-size: var(--fs-sm, .8rem); border: var(--pen-1, 1px) solid var(--line, #ccc); border-radius: 999px; padding: 0 .45rem; }
.cf-trade { font-size: var(--fs-sm, .85rem); }
.cf-foot { border-top: var(--pen-1, 1px) solid var(--line, #ccc); padding: .5rem .75rem; display: grid; gap: .4rem; }
.cf-btn { font: inherit; font-size: var(--fs-sm, .85rem); padding: .1rem .55rem; border: var(--pen-1, 1px) solid var(--ink-2, #555); border-radius: var(--radius, 4px); background: transparent; color: inherit; cursor: pointer; }
.cf-btn[aria-pressed="true"] { background: var(--action, #1a6); color: var(--sheet, #fff); border-color: var(--action, #1a6); }
.cf-btn.cf-main { background: var(--action, #1a6); color: var(--sheet, #fff); border-color: var(--action, #1a6); }
.cf-btn:disabled { opacity: .5; cursor: default; }
`;

export function mountClashPanel(o) {
  const doc = o.doc || document, W = o.words, fmt = o.fmt || ((x) => Math.round(x) + ' mm');
  if (!doc.getElementById('cf-style')) { const st = doc.createElement('style'); st.id = 'cf-style'; st.textContent = CSS; doc.head.append(st); }
  const h = (tag, attrs = {}, ...kids) => {
    const n = doc.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'className') n.className = v; else if (k === 'text') n.textContent = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2).toLowerCase(), v); else n.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(typeof c === 'string' ? doc.createTextNode(c) : c);
    return n;
  };
  const dialog = h('dialog', { className: 'cf-panel', 'data-cf-panel': true, 'aria-labelledby': 'cf-title' });
  doc.body.append(dialog);
  const S = { model: null, result: null, review: null, msg: '', busy: false, open: new Set() };

  const titleOf = (p) => {
    const v = { ...(p.title?.vars || {}) };
    for (const k of ['dz', 'd', 'w', 'h']) if (typeof v[k] === 'number') v[k] = fmt(v[k]);
    return W(p.title?.key || 'p.assistant', v);
  };
  const byLabel = (p) => (p.by === 'assistant' ? W('clashfix.by.assistant', { name: p.client || '?' }) : W('clashfix.by.rules'));
  const trade = (p) => {
    const bits = [p.resolved ? W('clashfix.t.resolves') : W('clashfix.t.not'), p.newClashes.length ? W('clashfix.t.new', { n: p.newClashes.length }) : W('clashfix.t.nonew'), p.breaks.length ? W('clashfix.t.breaks', { n: p.breaks.length }) : W('clashfix.t.nobreaks')];
    if (p.added > 0.5) bits.push(W('clashfix.t.added', { len: fmt(p.added) }));
    if (p.moved > 0.5) bits.push(W('clashfix.t.moved', { len: fmt(p.moved) }));
    if (p.fittings) bits.push(W('clashfix.t.fittings', { n: p.fittings }));
    bits.push(W('clashfix.t.cost', { n: p.cost }));
    if (p.alsoResolved?.length) bits.push(W('clashfix.t.also', { n: p.alsoResolved.length }));
    return bits.join(' · ');   // i18n-ignore: a separator
  };

  function propNode(p) {
    const st = S.review.stateOf(p.id), advice = !o.canApply || !o.canApply(p) ? true : false;
    const kids = [
      h('div', { className: 'cf-row' }, h('span', { className: 'cf-chip' }, W('clashfix.disc.' + p.discipline)), h('strong', {}, titleOf(p)), h('span', { className: 'cf-muted' }, byLabel(p))),
      h('div', { className: 'cf-trade', 'data-cf-trade': true }, trade(p)),
      ...p.breaks.map((b) => h('div', { className: 'cf-muted', 'data-cf-break': b.rule }, '⚠ ' + W('clashfix.r.' + b.rule, b.vars))),
      ...p.notes.map((n) => h('div', { className: 'cf-muted' }, W(n.key, n.vars))),
      p.why ? h('div', { className: 'cf-muted' }, W('clashfix.why', { why: p.why })) : null,
      advice ? h('div', { className: 'cf-muted', 'data-cf-advice': true }, W('clashfix.advice')) : null,
      h('div', { className: 'cf-row' },
        h('button', { type: 'button', className: 'cf-btn', 'data-cf-accept': p.id, 'aria-pressed': st === 'accepted' ? 'true' : 'false', onClick: () => choose(p, st === 'accepted' ? 'clear' : 'accept') }, st === 'accepted' ? W('clashfix.accepted') : W('clashfix.accept')),
        h('button', { type: 'button', className: 'cf-btn', 'data-cf-reject': p.id, 'aria-pressed': st === 'rejected' ? 'true' : 'false', onClick: () => choose(p, st === 'rejected' ? 'clear' : 'reject') }, st === 'rejected' ? W('clashfix.rejected') : W('clashfix.reject')),
        o.onShow ? h('button', { type: 'button', className: 'cf-btn', 'data-cf-show': p.id, onClick: () => o.onShow(p) }, W('clashfix.show')) : null),
    ];
    return h('div', { className: 'cf-prop' + (p.resolved && !p.newClashes.length && !p.breaks.length ? '' : ' cf-bad'), 'data-cf-prop': p.id, 'data-state': st || 'open', 'data-discipline': p.discipline, 'data-by': p.by }, ...kids);
  }
  function choose(p, what) {
    const r = what === 'accept' ? S.review.accept(p.id) : what === 'reject' ? S.review.reject(p.id) : S.review.clear(p.id);
    S.msg = r.ok ? '' : r.code === 'conflict' ? W('clashfix.conflict') : '';
    render();
  }
  async function apply() {
    if (S.busy || !S.review.accepted().length) return;
    S.busy = true; render();
    try {
      const r = await o.onApply(S.review);
      S.msg = W('clashfix.applied', { n: r?.applied || 0 }) + (r?.advice ? ' ' + W('clashfix.applied.advice', { n: r.advice }) : '');
      o.status?.(S.msg);
    } catch (e) { S.msg = W('clashfix.failed', { why: e.message || String(e) }); o.status?.(S.msg, true); }
    S.busy = false; render();
  }
  function render() {
    if (!S.result) return;
    const R = S.result, L = R.limits || LIMITS, n = o.assistants ? o.assistants() : 0;
    const items = R.items.map((it) => {
      const shown = S.open.has(it.clash.id) ? it.proposals : it.proposals.slice(0, 4);
      return h('section', { className: 'cf-clash', 'data-cf-clash': it.clash.id },
        h('h3', {}, h('span', {}, (o.nameOf ? o.nameOf(it.clash.a) : it.clash.a) + ' × ' + (o.nameOf ? o.nameOf(it.clash.b) : it.clash.b)), o.onShow ? h('button', { type: 'button', className: 'cf-btn', 'data-cf-show-clash': it.clash.id, onClick: () => o.onShow(it.clash) }, W('clashfix.show')) : null),
        it.proposals.length ? shown.map(propNode) : h('p', { className: 'cf-muted', 'data-cf-none': true }, W('clashfix.none')),
        it.proposals.length > shown.length ? h('button', { type: 'button', className: 'cf-btn', 'data-cf-more': it.clash.id, onClick: () => { S.open.add(it.clash.id); render(); } }, W('clashfix.more', { n: it.proposals.length - shown.length })) : null,
        ...it.refused.slice(-3).map((p) => h('p', { className: 'cf-muted', 'data-cf-refused': true }, byLabel(p) + ': ' + W('clashfix.refused', { why: p.refused.map((x) => W('clashfix.c.' + x.code, Object.fromEntries(Object.entries(x.vars || {}).map(([k, v]) => [k, typeof v === 'number' && k !== 'max' ? fmt(v) : v])))).join(', ') }))));
    });
    const c = S.review.combined();
    const sum = c.count ? W('clashfix.sum', { n: c.count, resolved: c.resolved, total: R.baseline.length, left: c.remaining, new: c.newClashes.length, breaks: c.breaks.length }) : W('clashfix.sum.none');
    dialog.replaceChildren(
      h('div', { className: 'cf-head' }, h('h2', { id: 'cf-title' }, W('clashfix.title')), h('button', { type: 'button', className: 'cf-btn', 'data-cf-close': true, onClick: () => close() }, W('clashfix.close'))),
      h('div', { className: 'cf-body' },
        h('p', { className: 'cf-muted' }, W('clashfix.lede')),
        h('p', { className: 'cf-muted', 'data-cf-who': String(n) }, n ? W('clashfix.who.some', { n }) : W('clashfix.who.none')),
        h('p', { className: 'cf-muted' }, W('clashfix.limits', { shift: fmt(L.shift.dz), rise: fmt(L.crossover.rise), col: fmt(L.move_column.dxy), gap: fmt(L.gap) })),
        R.items.length ? items : h('p', { 'data-cf-empty': true }, W('clashfix.empty'))),
      h('div', { className: 'cf-foot' },
        h('p', { 'data-cf-sum': true }, sum),
        S.msg ? h('p', { className: 'cf-muted', 'data-cf-msg': true, role: 'status' }, S.msg) : null,
        h('div', { className: 'cf-row' }, h('button', { type: 'button', className: 'cf-btn cf-main', 'data-cf-apply': true, disabled: S.busy || !c.count, onClick: () => apply() }, W('clashfix.apply')))));
  }
  function open(model, result) {
    S.model = model; S.result = result; S.review = new ReviewList(model, result); S.msg = ''; S.open = new Set();
    render();
    if (!dialog.open) { try { dialog.show(); } catch (e) { dialog.setAttribute('open', ''); } }
  }
  function close() { if (dialog.open) { try { dialog.close(); } catch (e) { dialog.removeAttribute('open'); } } }
  return { open, close, refresh: () => render(), get review() { return S.review; }, get result() { return S.result; }, get model() { return S.model; }, dialog, set message(m) { S.msg = m; } };
}
