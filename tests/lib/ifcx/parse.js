/* SPDX-License-Identifier: Apache-2.0 */
/**
 * parse.js — a .ifcx file as text or an object (SU.882). Written from the schema source buildingSMART publishes (IfcxFile:
 * header, imports, schemas, data; IfcxNode: path, children, inherits, attributes). Nothing here is copied from a viewer.
 *
 *   parseIfcx(input, { maxBytes }) → { file, issues }     throws IfcxError (code ifcx.err.*) when the file is not an IFCX file at all
 *   serializeIfcx(file, { indent }) → string
 *
 * `file` keeps every key it was given (unknown top-level keys and unknown node keys included), so writing it back loses nothing.
 * Soft problems (a header field missing, a version other than ifcx_alpha, a node key we don't know) are `issues`, not errors:
 * { level: 'warning' | 'info', code, vars }.
 */
import { IfcxError, fail, isObj } from './util.js';

export const IFCX_VERSION = 'ifcx_alpha';
export const MAX_BYTES = 256 * 1024 * 1024;
export const MAX_NODES = 5_000_000;
const HEADER_KEYS = ['id', 'ifcxVersion', 'dataVersion', 'author', 'timestamp'];
const NODE_KEYS = ['path', 'children', 'inherits', 'attributes'];

export function parseIfcx(input, { maxBytes = MAX_BYTES } = {}) {
  let file = input;
  if (typeof input === 'string' || input instanceof Uint8Array || input instanceof ArrayBuffer) {
    let text = input;
    if (typeof text !== 'string') text = new TextDecoder('utf-8').decode(input instanceof ArrayBuffer ? new Uint8Array(input) : input);
    if (text.length > maxBytes) fail('ifcx.err.big', { mb: Math.round(maxBytes / 1048576) });
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    try { file = JSON.parse(text); } catch (e) { fail('ifcx.err.json', { why: String(e.message || e).slice(0, 120) }); }
  }
  if (!isObj(file)) fail('ifcx.err.shape');
  if (!isObj(file.header)) fail('ifcx.err.header');
  const issues = [];
  const warn = (code, vars = {}) => issues.push({ level: 'warning', code, vars });
  for (const k of HEADER_KEYS) {
    if (typeof file.header[k] !== 'string') warn('ifcx.warn.header-field', { field: k });
  }
  if (file.header.ifcxVersion !== undefined && file.header.ifcxVersion !== IFCX_VERSION) warn('ifcx.warn.version', { version: String(file.header.ifcxVersion) });
  if (file.imports === undefined) file.imports = [];
  if (!Array.isArray(file.imports)) fail('ifcx.err.imports');
  for (const [i, im] of file.imports.entries()) if (!isObj(im) || typeof im.uri !== 'string' || !im.uri) fail('ifcx.err.import', { n: i + 1 });
  if (file.schemas === undefined) file.schemas = {};
  if (!isObj(file.schemas)) fail('ifcx.err.schemas');
  for (const [name, s] of Object.entries(file.schemas)) if (!isObj(s) || !isObj(s.value) || typeof s.value.dataType !== 'string') fail('ifcx.err.schema', { name });
  if (file.data === undefined) file.data = [];
  if (!Array.isArray(file.data)) fail('ifcx.err.data');
  if (file.data.length > MAX_NODES) fail('ifcx.err.nodes', { n: MAX_NODES });
  for (const [i, n] of file.data.entries()) {
    if (!isObj(n)) fail('ifcx.err.node', { n: i + 1 });
    if (typeof n.path !== 'string' || !n.path) fail('ifcx.err.node-path', { n: i + 1 });
    for (const k of ['children', 'inherits']) {
      if (n[k] === undefined) continue;
      if (!isObj(n[k])) fail('ifcx.err.node-map', { n: i + 1, key: k });
      for (const [name, target] of Object.entries(n[k])) if (target !== null && typeof target !== 'string') fail('ifcx.err.node-map-value', { n: i + 1, key: k, name });
    }
    if (n.attributes !== undefined && !isObj(n.attributes)) fail('ifcx.err.node-attrs', { n: i + 1 });
    for (const k of Object.keys(n)) if (!NODE_KEYS.includes(k)) warn('ifcx.warn.node-key', { key: k, path: n.path });
  }
  return { file, issues };
}

export function serializeIfcx(file, { indent = 1 } = {}) {
  return JSON.stringify(file, null, indent);
}
export { IfcxError };
