/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-clashfix (0.9 EG.42, session `clash-assistants-09`) — one assistant per discipline to settle clashes, and the engine that works
 * without any: discipline tools and limits (disciplines.js), the sandbox check (geom.js, sandbox.js), the built-in rule proposers
 * (proposers.js), the coordinator and review list (coordinator.js), the connector tools for a connected assistant (assistant.js) and
 * the shared review panel (panel.js, words.js). Canonical here; hosts carry byte-identical copies (tools/clashfix/sync.mjs).
 * Spike write-up: docs/spikes/clash-assistants.md.
 */
export * from './geom.js';
export * from './disciplines.js';
export * from './sandbox.js';
export * from './proposers.js';
export * from './coordinator.js';
export * from './assistant.js';
export { WORDS, wordsOf } from './words.js';
