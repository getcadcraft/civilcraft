/* SPDX-License-Identifier: Apache-2.0 */
/** three-hook.mjs — lets Node resolve the bare 'three' import of the vendored three-mesh-bvh to the vendored three (tests and
 * the pick bench only): node --import ./tools/compute-test/three-hook.mjs … */
import { register } from 'node:module';
register('data:text/javascript,' + encodeURIComponent(`
const THREE = ${JSON.stringify(new URL('../../public_html/assets/vendor/three/current/three.module.js', import.meta.url).href)};
export async function resolve(spec, ctx, next) { if (spec === 'three') return { url: THREE, shortCircuit: true }; return next(spec, ctx); }
`));
