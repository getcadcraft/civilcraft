/* SPDX-License-Identifier: Apache-2.0 */
/**
 * probe-light.js — the light probe for the hardware report of the apps that carry no compute engine (0.7 HW.2: CadCraft,
 * MarkupCraft, TakeoffCraft, CivilCraft, DetailCraft, PartCraft; the shell's assets/js/app-hardware.js runs it). Same facts
 * shape as probe.js, so report.js and HardwareReports read it unchanged; what costs more than asking is left out:
 *   - the WebGPU adapter: requested (its info, limits and four feature flags), never a device, a buffer or a shader
 *   - WebGL 2: not created (a second GL context next to the app's own drawing is not cheap) → webgl2 null
 *   - cores, device memory, cross-origin isolation, WebAssembly SIMD / threads (two tiny modules validated, never run)
 *   - the tier only when a hardware adapter shows it (gpu-high / gpu-low): with no adapter, or only a software one, the machine may
 *     still draw with hardware WebGL, and without WebGL the probe cannot tell → ''
 * Canonical in lib/compute/; tools/compute/sync.mjs copies it (with probe.js and report.js) to public_html/assets/js/compute/.
 *
 *   await lightProbe(env?) → facts (probe.js shape; light: true)      never throws
 *   lightTier(facts) → { tier }                                         tier '' when the probe could not tell
 */
import { probe, tierOf } from './probe.js';

export async function lightProbe(env = globalThis) {
  const facts = await probe(env, { gpu: true, webgl: false });
  facts.light = true;
  return facts;
}

export function lightTier(facts) {
  const tier = facts?.gpu ? tierOf(facts).tier : '';
  return { tier: tier === 'cpu' ? '' : tier };
}
