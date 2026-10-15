/* SPDX-License-Identifier: Apache-2.0 */
/**
 * input-mouse.js — the mouse half of the input profile in use (0.5 part 4, track IP.1). DOM-free, import-free.
 * The shell's input engine sets it (input-bimcraft.js hooks().mouse); the views read it at each event (model-planview.js, dwg-view.js, dwg-view3d.js) or follow it
 * (viewer3d.js: OrbitControls' buttons and zoom speed). Before any profile is set it is BimCraft's own behaviour.
 *   mouse()           { wheel 1|-1, zoomSpeed 0.25–4, pan2d ['middle','right'], orbit3d { left, middle, right } | null }
 *                     orbit3d null = each 3D view keeps its own buttons (the CadCraft style)
 *   wheelFactor()     multiply a wheel delta's zoom exponent by this (direction × speed)
 *   panButton(b)      does this pointer button (0 left, 1 middle, 2 right) pan the 2D views?
 *   action3d(b)       'orbit' | 'pan' | 'zoom' | 'none' for this button in the 3D views, or null = the view's own
 */

let cur = { wheel: 1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: null };
const subs = new Set();
const NAME = ['left', 'middle', 'right'];

export function mouse() { return cur; }
export function setMouse(m) { cur = m; for (const f of subs) f(cur); }
/** Call fn now and whenever the settings change; returns the unsubscribe function. */
export function onMouse(fn) { subs.add(fn); fn(cur); return () => subs.delete(fn); }
export function wheelFactor() { return cur.wheel * cur.zoomSpeed; }
export function panButton(b) { return cur.pan2d.includes(NAME[b]); }
export function action3d(b) { return cur.orbit3d ? (cur.orbit3d[NAME[b]] || 'none') : null; }
