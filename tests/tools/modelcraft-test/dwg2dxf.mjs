/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dwg2dxf.mjs — LibreDWG's own DWG → DXF converter (dwg_write_dxf in the vendored libredwg-web), run
 * in a child process by formats.mjs: the DXF it writes is read by ModelCraft's DXF path and compared
 * with the DWG path. A separate process because the WebAssembly build aborts on some files.
 *   node tools/modelcraft-test/dwg2dxf.mjs <in.dwg> <out.dxf>    exit 0 = written, 2 = not converted
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dir = path.join(ROOT, 'public_html/assets/vendor/libredwg-web/current');
const log = console.log, warn = console.warn;
console.log = console.warn = () => {};
const mod = await import(pathToFileURL(path.join(dir, 'dist/libredwg-web.js')).href);
const lib = await mod.LibreDwg.create(path.join(dir, 'wasm') + '/');
const dxf = lib.dwg_write_dxf(new Uint8Array(fs.readFileSync(process.argv[2])));
console.log = log; console.warn = warn;
if (!dxf) process.exit(2);
fs.writeFileSync(process.argv[3], dxf);
