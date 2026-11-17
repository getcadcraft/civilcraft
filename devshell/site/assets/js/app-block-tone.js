/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-tone.js: the layout's chrome tone (UI.16). The reference drafting interface is dark chrome around the drawing whatever the OS
 * theme; ours took its chrome from the site theme, so a layout could not ask for a dark frame on a light theme or a paper-white frame on
 * dark. `look.tone` (format v2, UI.6) is "theme" (the default, as today), "dark" or "light". This file puts `data-ws-tone` on the layout's
 * regions; app-block.css defines the six chrome tokens (--sheet, --sheet-2, --line, --ink, --ink-2, --action) per tone ONCE, so every
 * block in every layout reads the same six and no block carries a literal colour (lintTokens() is the check). The drawing surface keeps
 * the app's own background setting (the tone never reaches `canvas` or the stage's drawing box). Settings > Layout shows the tone under
 * the layout name and lets the person override it per layout (cc-ws-tone:<app>:<layout>); icons follow through UI.15's theme colours.
 *
 *   TONES · readTone(v) → 'theme' | 'dark' | 'light'      toneFor(layoutTone, overrides, layoutKey) → the tone that applies
 *   applyTone(regions, tone) → undo()                       lintTokens(css) → [offences] hex / rgb() literals outside a token block or var() fallback
 */
import { store } from './app-block-core.js';

export const TONES = ['theme', 'dark', 'light'];
export const readTone = (v) => (TONES.includes(v) ? v : 'theme');
/** The person's choice for this layout wins over the layout file's; 'theme' means the site theme decides. */
export function toneFor(layoutTone, app, layoutKey) {
  const own = store(app).get('tone:' + layoutKey, null);
  return readTone(TONES.includes(own) ? own : layoutTone);
}
export function setOverride(app, layoutKey, tone) { const s = store(app); if (tone === null) s.drop('tone:' + layoutKey); else if (TONES.includes(tone)) s.set('tone:' + layoutKey, tone); }
export function applyTone(regions, tone) {
  const t = readTone(tone), nodes = [...regions].filter(Boolean), before = nodes.map((n) => n.getAttribute('data-ws-tone'));
  nodes.forEach((n) => { if (t === 'theme') n.removeAttribute('data-ws-tone'); else n.setAttribute('data-ws-tone', t); });
  return () => nodes.forEach((n, i) => { if (before[i] === null) n.removeAttribute('data-ws-tone'); else n.setAttribute('data-ws-tone', before[i]); });
}
/**
 * The lint behind "no block carries a literal colour": offences are a hex colour or an rgb()/hsl() outside (a) a custom-property
 * declaration (a token definition) and (b) the fallback inside var(--token, #xxx). Returns [{ line, text }].
 */
export function lintTokens(css) {
  const out = [];
  String(css).split('\n').forEach((raw, i) => {
    const line = raw.replace(/\/\*.*?\*\//g, '').replace(/var\(--[a-z0-9-]+\s*,\s*[^)]*\)/gi, 'var(--x)');
    for (const part of line.split(';')) {
      if (/^\s*(?:[^{}]*\{)?\s*--[a-z0-9-]+\s*:/i.test(part)) continue;   // a token definition
      if (/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i.test(part)) out.push({ line: i + 1, text: raw.trim().slice(0, 80) });
    }
  });
  return out;
}
