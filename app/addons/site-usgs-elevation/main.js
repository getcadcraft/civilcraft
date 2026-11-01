/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the source's name and licence line are registry data shown by the Address to site window. */
/** Ground elevation (USGS) — one open-data source for "Address to site" (0.8 EG.63). Off until switched on in Settings › Add-ons; registers itself with site-fetch.js. */
import { registerSource } from '../../site-fetch.js';
import { SOURCE } from './lib/source.js';
export function activate() { return registerSource(SOURCE); }
