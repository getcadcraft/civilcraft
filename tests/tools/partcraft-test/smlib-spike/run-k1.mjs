#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// run-k1.mjs — runs the WebAssembly k1 (build.sh's <out>/k1.mjs): node run-k1.mjs <out>/k1.mjs [case …]  (0.7 D7.45 spike)
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const [file, ...cases] = process.argv.slice(2);
const { default: factory } = await import(pathToFileURL(path.resolve(file)).href);
await factory({ arguments: cases, print: (s) => console.log(s), printErr: (s) => process.stderr.write(s + '\n') });
