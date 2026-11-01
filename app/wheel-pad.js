/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — event field names; nothing here is read by a person. */
/**
 * wheel-pad.js — tell a trackpad's two-finger swipe from a mouse wheel (0.7 D7.56). DOM-free, import-free.
 *
 * Both arrive as `wheel` events. A mouse wheel turns in steps (pixel deltas of 100 or 120, whole numbers; or lines, deltaMode 1);
 * a trackpad sends many small pixel deltas, usually with a sideways part, often fractional. A pinch on a trackpad arrives with
 * ctrlKey set and is never a swipe. Small pixel deltas that are not a wheel step count as a swipe, even straight up and down.
 *
 *   const pad = new PadDetector();
 *   pad.isSwipe(e)     → true when this event is part of a trackpad swipe (not a pinch, not a mouse wheel)
 */
export class PadDetector {
  constructor() { this.until = 0; }
  isSwipe(e) {
    if (e.ctrlKey || e.deltaMode !== 0) return false;
    const dx = e.deltaX || 0, dy = e.deltaY || 0, t = e.timeStamp || 0;
    // a step of a mouse wheel: no sideways part and a whole, large pixel delta, or (the browsers that have the legacy field)
    // a multiple of 120
    const step = dx === 0 && ((Number.isFinite(e.wheelDeltaY) && e.wheelDeltaY !== 0 && e.wheelDeltaY % 120 === 0) || (Number.isInteger(dy) && Math.abs(dy) >= 50));
    if (step) return false;
    if (dx !== 0 || !Number.isInteger(dy) || Math.abs(dy) < 50) { this.until = t + 400; return true; }
    return false;
  }
}
