/* SPDX-License-Identifier: Apache-2.0 */
// Test fixture for MarkupCraft's add-on API 1.0 (bin/test-addons-pdf-apps.mjs): an "RFI" markup type on a cloud, numbered.
export function activate(api) {
  globalThis.__testRfi = api;
  api.markups.defineType('rfi', { name: api.t('rfi.name'), base: 'cloudrect', style: { color: '#7b2cbf', width: 2 }, subject: 'RFI', version: 2 });
  const next = () => 1 + Math.max(0, ...api.markups.list().filter((m) => api.markups.is(m, 'rfi')).map((m) => api.markups.dataOf(m).no || 0));
  api.ui.toolbarGroup({ id: 'rfi', label: api.t('rfi.group'), tools: [{ id: 'rfi', label: api.t('rfi.name'), icon: 'bi-question-diamond', run: () => api.tools.start('rfi', { no: next() }) }] });
  api.columns.add({ id: 'rfi-no', label: api.t('rfi.col'), value: (m) => (api.markups.is(m, 'rfi') ? api.markups.dataOf(m).no : '') });
  api.ui.panelTab({ id: 'list', title: api.t('rfi.tab'), render(el) { el.textContent = api.t('rfi.none'); } });
}
