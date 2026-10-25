/* SPDX-License-Identifier: Apache-2.0 */
/**
 * machine-card.js — the "Your machine" card in Settings › Rendering (0.7 CU.1): what the probe found, in plain words, and the
 * tier it gives. Imports only probe.js; the app hands in its DOM helper and words, so the copy in each app is byte-identical
 * (tools/compute/sync.mjs).
 *
 *   machineCard(host, facts, info) → [nodes]          info = tierOf(facts, override)
 *   host = { el(tag, props, …children), t(key, fills) }   the app's ui-util el() and i18n t()
 * Styles: compute.css (copied beside it; each app's manifest lists it). Words: compute.card.*, compute.tier.*, compute.why.* (tools/compute/lang.mjs).
 */
import { machineRows } from './probe.js';

export function machineCard(host, facts, info) {
  const { el, t } = host;
  const rows = machineRows(facts, info);
  const body = rows.map((r) => {
    const value = r.valueKey ? t(r.valueKey, r.fills || {}) : String(r.value ?? '');
    const cells = [el('th', { scope: 'row' }, t(r.key)), el('td', {}, el('span', { className: 'cc-machine-v' }, value), r.note ? el('span', { className: 'cc-machine-note' }, t(r.note)) : null)];
    return el('tr', {}, ...cells);
  });
  const out = [el('table', { className: 'cc-machine', 'data-compute-tier': info.tier }, el('tbody', {}, ...body))];
  if (info.override) out.push(el('p', { className: 'shell-hint-text' }, t('compute.card.override', { tier: t('compute.tier.' + info.measured) })));
  // 2026-10-24: whether these specs are shared (report.js; the shell's global switch)
  const hw = globalThis.window?.ccShellHardware;
  if (hw) out.push(el('p', { className: 'shell-hint-text', 'data-compute-share': hw.allowed() ? 'on' : 'off' }, t(hw.allowed() ? 'compute.card.share.on' : 'compute.card.share.off')));
  return out;
}
