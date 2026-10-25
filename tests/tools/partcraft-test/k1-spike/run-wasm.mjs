// SPDX-License-Identifier: Apache-2.0
/**
 * K.1 spike: runs a spike kernel's wasm32 build (truck or monstertruck, plain exports run_case/out_ptr)
 * in Node, case by case, with times. Usage: node run-wasm.mjs <file.wasm> [case index…]
 */
import fs from 'node:fs';

const file = process.argv[2];
const bytes = fs.readFileSync(file);
const t0 = performance.now();
// wasm32-unknown-unknown with std: no imports are expected; stub any that appear so instantiation never fails
const mod = await WebAssembly.compile(bytes);
const imports = {};
for (const imp of WebAssembly.Module.imports(mod)) (imports[imp.module] ||= {})[imp.name] = () => { throw new Error('import ' + imp.module + '.' + imp.name); };
const { exports } = await WebAssembly.instantiate(mod, imports);
console.log(JSON.stringify({ file, bytes: bytes.length, imports: WebAssembly.Module.imports(mod).map((i) => i.module + '.' + i.name), compileMs: Math.round(performance.now() - t0) }));
const which = process.argv.slice(3).map(Number);
for (let i = 0; i < 40; i++) {
  if (which.length && !which.includes(i)) continue;
  const t = performance.now();
  let line;
  try {
    const n = exports.run_case(i);
    line = new TextDecoder().decode(new Uint8Array(exports.memory.buffer, exports.out_ptr(), n));
  } catch (e) { line = JSON.stringify({ case: i, ok: false, message: 'trap: ' + e.message }); }
  if (line.includes('"name":"?"')) break;
  console.log(line + ` ms=${(performance.now() - t).toFixed(1)}`);
  if (line.includes('trap:')) break;   // the instance is unusable after a trap
}
