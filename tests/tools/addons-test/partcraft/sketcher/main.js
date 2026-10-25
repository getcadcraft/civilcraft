/* SPDX-License-Identifier: Apache-2.0 */
// Test fixture for PartCraft's add-on API 1.0 (bin/test-addons-model-apps.mjs).
export function activate(api) {
  globalThis.__testSketcher = api;
  api.commands.add('add-sketch', (a) => a.part.addFeature('sketch', { name: 'From add-on' }), { label: api.t('cmd') });
  api.props.section({ label: api.t('sec'), fields: (sel, part) => (sel?.kind === 'feature' ? [{ label: 'Features', value: part.features.length }] : []) });
  api.ui.panelTab({ id: 'main', title: api.t('tab'), render(el) { el.textContent = api.t('feats', { n: api.part.get().features.length }); } });
  api.files.importer({ id: 'feat', label: 'Feature list', extensions: ['.feat'], read: async (f) => ({ features: JSON.parse(await f.text()) }) });
  api.files.exporter({ id: 'names', label: 'Feature names', extension: 'txt', mime: 'text/plain', write: (inp) => inp.part.features.map((x) => x.name).join('\n') });
}
