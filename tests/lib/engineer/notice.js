/* SPDX-License-Identifier: Apache-2.0 */
/**
 * notice.js — the export-control notice (0.8 CE.12, owner decision O3, 2026-10-28). The words are exactly docs/0.8-PART3.md § O3; do not
 * edit them here without the owner's word (a test reads the plan and compares). Shown: in the Engineer help, as the footer of every data
 * sheet (panel, PDF, JSON), and beside any generator whose index.json entry says "exportNotice": true (the nozzle).
 */
export const EXPORT_NOTICE_TITLE = 'Export controls.';
export const EXPORT_NOTICE = 'Engineer and its generators are general-purpose design tools built from published textbook engineering. We make no representation that any generator, design, data sheet or exported file is free of export-control or sanctions restrictions, or that it may lawfully be exported, re-exported, transferred or used in any country or by any person. You are responsible for classifying what you design and for following the export-control and sanctions laws that apply to you. This is a basic notice: we expect to change these controls to match the export-control rules of the country of origin.';
/** The title and the text as one paragraph. */
export const exportNoticeFull = () => EXPORT_NOTICE_TITLE + ' ' + EXPORT_NOTICE;
/** Does this generator-list entry carry the notice? */
export const wantsNotice = (entry) => !!(entry && entry.exportNotice === true);
