/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-ifcx — CadCraft's own reader and writer for the IFC5 alpha file format (IFCX), SU.882. DOM-free, no dependencies.
 *
 *   readIfcx(input, { resolve, extra, name }) → Promise<{ model, composed, issues }>     parse, compose, validate, map
 *   writeIfcx(model, options) → { text, file, issues }
 *
 * See README.md. The format is an alpha and changes; everything that depends on how the alpha is read is in compose.js,
 * model.js and build.js, with the rule written at the top of each.
 */
import { parseIfcx, serializeIfcx } from './parse.js';
import { loadLayers, composeLayers, buildTree, validateComposed } from './compose.js';
import { toModel } from './model.js';
import { fromModel } from './build.js';

export * from './util.js';
export { parseIfcx, serializeIfcx, IFCX_VERSION } from './parse.js';
export { validateValue, validateNode } from './validate.js';
export { loadLayers, composeLayers, resolveNode, buildTree, validateComposed } from './compose.js';
export { toModel } from './model.js';
export { fromModel } from './build.js';
export { A, KINDS, PROPS, IMPORT_URI } from './names.js';

export async function readIfcx(input, { resolve = null, extra = [], name = '', validate = true } = {}) {
  const { file, issues: i0 } = parseIfcx(input);
  const { layers, issues: i1 } = await loadLayers(file, { resolve, extra });
  const composed = composeLayers(layers);
  const tree = buildTree(composed);
  const model = toModel(composed, tree, { name });
  const issues = [...i0, ...i1, ...composed.issues, ...tree.issues, ...(validate ? validateComposed(composed) : []), ...model.issues];
  return { model, composed, issues };
}

export function writeIfcx(model, options = {}) {
  const { file, issues } = fromModel(model, options);
  return { text: serializeIfcx(file), file, issues };
}
