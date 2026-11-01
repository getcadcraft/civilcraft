/* SPDX-License-Identifier: Apache-2.0 */
/**
 * index.js — Engineer, the engine-neutral module (0.8 CE.12; docs/apps/engineer.md). The contract, the host seam, the words and the notice.
 * A host imports the pieces it mounts from their own files (generated.js for its file reader, gen-ui.js and ws-engineer.js for the page,
 * cs-lib-field.js and cs-lib-eng.js for CraftScript); this barrel is for tests and tools.
 */
export { CONTRACT, CHECK_KINDS, CHECK_BUILTIN, checkAdapter, describeChecks } from './contract.js';
export { setHost, host, hostName, t, has, hasCheck, SH, MESH, F } from './host.js';
export { MESSAGES } from './messages.js';
export { EXPORT_NOTICE, EXPORT_NOTICE_TITLE, exportNoticeFull, wantsNotice } from './notice.js';
