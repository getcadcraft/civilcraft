/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-page.js — the render bench page (0.7 CU.8): /lab/modelcraft?bench=render opens a dialog over the app that anyone can
 * run on their own machine. It shows "Your machine", runs bench.js (Quick: tiny sizes, about a minute on a laptop; Full: the
 * sizes RENDER-BENCH.md quotes) and lists every result; "Copy results" puts the JSON on the clipboard and "Copy as a table" the
 * RENDER-BENCH.md row block. Nothing is uploaded. The app hands in its DOM helper, words, pool and renderers (`host`), so the copy
 * in each app is byte-identical (tools/compute/sync.mjs).
 *
 *   mountBench(host) → dialog
 *   host = { el, t, machine() → Promise<{facts, info}>, pool() → Promise<pool>, kernels() → Promise<[kernel]> (bench.js shape),
 *            download(name, text, type) }
 * Words: compute.bench.* (tools/compute/lang.mjs). Styles: compute.css (.cc-bench*).
 */
import { runBench, resultsMarkdown } from './bench.js';
import { machineCard } from './machine-card.js';

export function mountBench(host) {
  const { el, t } = host;
  const status = el('p', { className: 'shell-hint-text cc-bench-status', role: 'status', 'aria-live': 'polite' }, t('compute.bench.ready'));
  const machineBox = el('div', { className: 'cc-bench-machine' }, el('p', { className: 'shell-hint-text' }, t('compute.card.wait')));
  const table = el('div', { className: 'cc-bench-results', 'data-bench-results': '' });
  const quick = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-bench-run': 'tiny' }, t('compute.bench.quick'));
  const full = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-bench-run': 'full' }, t('compute.bench.full'));
  const stop = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-bench-stop': '', hidden: true }, t('compute.bench.stop'));
  const copyJson = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-bench-copy': 'json', disabled: true }, t('compute.bench.copy'));
  const copyMd = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-bench-copy': 'md', disabled: true }, t('compute.bench.copy-table'));
  const save = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-bench-save': '', disabled: true }, t('compute.bench.save'));
  const close = el('button', { type: 'submit', className: 'shell-x', 'aria-label': t('compute.bench.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
  const form = el('form', { method: 'dialog', className: 'shell-dlg' },
    el('div', { className: 'shell-dlg-head' }, el('h2', { id: 'cc-bench-h' }, t('compute.bench.title')), close),
    el('div', { className: 'shell-dlg-body' },
      el('p', {}, t('compute.bench.lede')),
      machineBox,
      el('div', { className: 'cc-bench-run' }, quick, full, stop),
      status, table,
      el('p', { className: 'shell-hint-text' }, t('compute.bench.private'))),
    el('div', { className: 'shell-dlg-foot' }, el('div', { className: 'cc-bench-run' }, copyJson, copyMd, save), el('button', { type: 'submit', className: 'btn-plot btn-sm-cc' }, t('compute.bench.done'))));
  const dlg = el('dialog', { className: 'shell-settings cc-bench-dlg', 'data-bench-render': '', 'aria-labelledby': 'cc-bench-h' }, form);
  document.body.append(dlg);

  let last = null, ac = null;
  host.machine().then(({ facts, info }) => machineBox.replaceChildren(...machineCard({ el, t }, facts, info)));

  const show = (res) => {
    const head = el('tr', {}, ...['test', 'scene', 'device', 'workers', 'value', 'note'].map((k) => el('th', { scope: 'col' }, t('compute.bench.col.' + k))));
    const body = res.rows.map((r) => el('tr', {}, el('td', {}, r.test), el('td', {}, r.scene || ''), el('td', {}, r.device), el('td', {}, r.workers == null ? '' : String(r.workers)),
      el('td', { className: 'cc-bench-num' }, r.value == null ? '—' : r.value.toLocaleString('en-US') + ' ' + r.unit), el('td', {}, r.note || '')));
    table.replaceChildren(el('table', { className: 'cc-machine cc-bench-table' }, el('thead', {}, head), el('tbody', {}, ...body)));
  };

  async function run(size) {
    if (ac) return;
    ac = new AbortController();
    quick.disabled = full.disabled = true; stop.hidden = false;
    status.textContent = t('compute.bench.running', { what: '…', pct: 0 });
    try {
      const [{ facts, info }, pool, kernels] = await Promise.all([host.machine(), host.pool(), host.kernels()]);
      last = await runBench({ pool, facts, info, size, signal: ac.signal, kernels,
        onProgress: (what, f) => { status.textContent = t('compute.bench.running', { what, pct: Math.round(f * 100) }); } });
      show(last);
      status.textContent = t('compute.bench.done-n', { n: last.rows.length });
      copyJson.disabled = copyMd.disabled = save.disabled = false;
    } catch (e) {
      status.textContent = e?.code === 'cancelled' ? t('compute.bench.stopped') : t('compute.bench.failed', { why: String(e?.message || e).slice(0, 160) });
    } finally {
      ac = null; quick.disabled = full.disabled = false; stop.hidden = true;
    }
  }
  quick.addEventListener('click', () => run('tiny'));
  full.addEventListener('click', () => run('full'));
  stop.addEventListener('click', () => ac?.abort());
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); status.textContent = t('compute.bench.copied'); }
    catch { status.textContent = t('compute.bench.copy-failed'); }
  };
  copyJson.addEventListener('click', () => last && copy(JSON.stringify(last, null, 1)));
  copyMd.addEventListener('click', () => last && copy(resultsMarkdown(last)));
  save.addEventListener('click', () => last && host.download('cadcraft-render-bench-' + last.when.slice(0, 10) + '.json', JSON.stringify(last, null, 1), 'application/json'));
  dlg.addEventListener('close', () => ac?.abort());
  dlg.showModal();
  return dlg;
}
