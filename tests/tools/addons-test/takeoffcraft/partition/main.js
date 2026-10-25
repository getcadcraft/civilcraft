/* SPDX-License-Identifier: Apache-2.0 */
// Test fixture for TakeoffCraft's add-on API 1.0 (bin/test-addons-pdf-apps.mjs): a partition item type with an assembly.
export function activate(api) {
  globalThis.__testPartition = api;
  api.items.defineType('partition', {
    name: api.t('p.name'), type: 'linear', version: 3, data: { fire: '1 hr' },
    defaults: { unit: 'LF', heightFt: 9, waste: 500, components: [
      { name: 'Studs', unit: 'EA', formula: 'ceil(L / 1.333) + N' },
      { name: 'Board', unit: 'SF', formula: 'A * 2' },
    ] },
  });
  api.export.column({ id: 'fire', label: api.t('p.fire'), value: (row, item) => (row.kind === 'item' && item && api.items.is(item, 'partition') ? api.items.dataOf(item).fire : '') });
  api.ui.panelTab({ id: 'list', title: api.t('p.tab'), render(el) { el.textContent = api.t('p.count', { n: api.takeoff.state().items.filter((i) => api.items.is(i)).length }); } });
}
