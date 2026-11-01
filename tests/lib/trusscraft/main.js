/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the TrussCraft add-on's entry (DC.116). The same file in BimCraft, PartCraft, ModelCraft and CadCraft; the app's own part is host.js.
 */
import { start } from './panel.js';
import { makeHost } from './host.js';

export function activate(api) { return start(api, makeHost); }
