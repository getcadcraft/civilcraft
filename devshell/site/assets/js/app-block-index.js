/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-index.js: every block file of ui-blocks-10 in one list, with the additions format v2 must learn (UI.6, `ui-layouts-10`).
 * The engine calls `mountBlock(kind, host, region, opts)` for a kind it does not mount itself and reads BLOCK_SPECS for places, needs and
 * option readers (the same shape as BLOCKS in app-workspace-format.js). Nothing here edits the engine; registering is one line there:
 *   import { MODULES, BLOCK_SPECS, NEW_PLACES, V2_LOOK, mountBlock } from './app-block-index.js';
 * Every block belongs to one family of docs/INTERFACE-PATTERN.md section 2 and every kind appears once (the tests hold both).
 */
import { block as titlebar } from './app-block-titlebar.js';
import { block as commandline } from './app-block-commandline.js';
import { block as statustoggles } from './app-block-statusx.js';
import { block as modeltabs } from './app-block-modeltabs.js';
import { blocks as overlays, CORNERS } from './app-block-viewoverlays.js';
import { oneOf } from './app-block-core.js';
import { TONES } from './app-block-tone.js';

export const MODULES = Object.freeze({ titlebar, commandline, statustoggles, modeltabs, ...overlays });
export const BLOCK_SPECS = Object.freeze(Object.fromEntries(Object.entries(MODULES).map(([k, m]) => [k, { places: m.places, needs: m.needs, opts: m.opts, family: m.family }])));
/** Places the format must accept from v2 (the four drawing corners, UI.10). */
export const NEW_PLACES = Object.freeze([...CORNERS]);
/** Look keys v2 must accept: the chrome tone (UI.16) and the density start (UI.29). */
export const V2_LOOK = Object.freeze({ tone: TONES, density: ['compact', 'regular', 'comfortable'] });
/** Options v2 adds to blocks the engine already mounts: the ribbon's (UI.11, app-block-ribbonx.js), the status bar's toggles come from `statustoggles`. */
export const RIBBON_V2 = Object.freeze({ more: (v) => (v === true ? true : undefined), slots: (v) => (v === true ? true : undefined), contextual: (v) => (v === true ? true : undefined) });
export const TONE_READER = oneOf(TONES);

export function mountBlock(kind, host, region, opts) {
  const m = MODULES[kind];
  if (!m) return null;
  return m.mount(host, region, opts || {});
}
