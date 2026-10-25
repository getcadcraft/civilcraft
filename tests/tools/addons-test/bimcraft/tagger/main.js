/* SPDX-License-Identifier: Apache-2.0 */
// Test fixture for BimCraft's add-on API 1.0 (bin/test-addons-model-apps.mjs).
export function activate(api) {
  globalThis.__testTagger = api;
  api.commands.add('tag', (a) => { for (const id of a.model.selection()) a.edit.setAttribute(id, 'Tag', 'T-' + id); }, { label: api.t('cmd') });
  api.props.section({ label: api.t('sec'), fields: async (ids) => (ids.length ? [{ label: 'Selected', value: ids.length }] : []) });
  api.files.importer({ id: 'wrap', label: 'Wrapped IFC', extensions: ['.ifcw'], read: async (f) => ({ ifc: new Uint8Array(await f.arrayBuffer()), name: 'wrapped.ifc' }) });
  api.files.exporter({ id: 'raw', label: 'IFC bytes', extension: 'ifc', mime: 'application/x-step', write: (inp) => inp.save() });
}
