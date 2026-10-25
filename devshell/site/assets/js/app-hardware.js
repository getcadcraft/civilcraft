/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-hardware.js — the hardware specs from the apps that carry no compute engine (0.7 HW.2, owner 2026-10-24: "build HW.2 in
 * 0.7"): CadCraft, MarkupCraft, TakeoffCraft, CivilCraft, DetailCraft, PartCraft. BimCraft and ModelCraft send theirs from their
 * own compute/ (compute-bim.js / compute-mc.js), so their manifests never opt in here. Map: docs/apps/compute.md § report.js.
 *
 * Loaded by app-shell.inc only for a build whose manifest says "hardware": true (AppBuilds::hardware; dev builds — frozen releases
 * have no key, so they never change). Reads #cc-hardware {app, build}. A while after the page settles (20 s, then idle) it runs the
 * light probe (./compute/probe-light.js: the WebGPU adapter and its limits, never a device or a GPU job; no WebGL context) and hands
 * the facts to the same report.js the two compute apps use: same report shape, same switch (window.ccShellHardware — web on by
 * default, desktop off by default), same once-a-month cadence per app (localStorage cc-hw-sent:<slug>), no cookies, no account.
 * Inside SuperCad Studio's frame (?embed=1, body.app-embedded) it sends nothing: the frame cannot see the desktop bridge, so it
 * could not keep the desktop's opt-in.
 * Copies of probe.js / probe-light.js / report.js come only from `node tools/compute/sync.mjs shell` (never edit them here).
 */
import { lightProbe, lightTier } from './compute/probe-light.js';
import { shareHardware } from './compute/report.js';

function config() {
  try { return JSON.parse(document.getElementById('cc-hardware')?.textContent || 'null'); } catch (e) { return null; }
}

const cfg = config();
if (cfg && cfg.app && !document.body.classList.contains('app-embedded')) {
  const go = () => lightProbe(globalThis)
    .then((facts) => shareHardware({ facts, info: lightTier(facts), app: cfg.app, build: cfg.build || '' }))
    .then((r) => { document.documentElement.dataset.ccHw = r; })
    .catch(() => {});
  setTimeout(() => (globalThis.requestIdleCallback ? globalThis.requestIdleCallback(go, { timeout: 10000 }) : go()), 20000);
}
