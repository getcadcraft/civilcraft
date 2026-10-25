/* SPDX-License-Identifier: Apache-2.0 */
/**
 * report.js — share this machine's hardware specs with getcadcraft.com so we can build more efficient engines (owner
 * 2026-10-24; server: HardwareReports + POST /api/v1/hardware). Anonymous: no account, no cookie (credentials omitted), no
 * files; the server keeps no address and only the day. The probe's facts (probe.js) plus the tier, the screen, the browser
 * and system family, the app and its build. Asked once a month per app, and again sooner only when the facts change.
 *
 * Who decides: the shell's global switch (Settings › Global › Hardware specs, app-settings.js window.ccShellHardware):
 * on by default in the browser, off by default in the desktop app. Without the shell (tests), `allowed` decides.
 *
 *   shareHardware({ facts, info, app, build, env?, allowed?, now? }) → Promise<'sent'|'off'|'recent'|'failed'>
 *   hardwarePayload({ facts, info, app, build, env? }) → the object sent (pure; Node tests use it)
 */
export const REPORT_VERSION = 1;
export const EVERY_MS = 30 * 24 * 3600 * 1000;   // a month
const HOME = 'https://getcadcraft.com';

const LIMITS = ['maxBufferSize', 'maxStorageBufferBindingSize', 'maxComputeWorkgroupStorageSize', 'maxComputeInvocationsPerWorkgroup',
  'maxComputeWorkgroupSizeX', 'maxComputeWorkgroupsPerDimension', 'maxTextureDimension2D', 'maxStorageBuffersPerShaderStage'];

/** Browser and system family from the user agent (names only, never the full string). */
export function familyOf(ua = '', uad = null) {
  const s = String(ua);
  const os = /Windows/.test(s) ? 'windows' : /Android/.test(s) ? 'android' : /iPhone|iPad|iPod/.test(s) ? 'ios' : /Mac OS X|Macintosh/.test(s) ? 'macos' : /CrOS/.test(s) ? 'chromeos' : /Linux/.test(s) ? 'linux' : '';
  let browser = '', major = null, m;
  if ((m = /Edg\/(\d+)/.exec(s))) { browser = 'edge'; major = +m[1]; }
  else if ((m = /OPR\/(\d+)/.exec(s))) { browser = 'opera'; major = +m[1]; }
  else if ((m = /Firefox\/(\d+)/.exec(s))) { browser = 'firefox'; major = +m[1]; }
  else if ((m = /Chrome\/(\d+)/.exec(s))) { browser = 'chrome'; major = +m[1]; }
  else if ((m = /Version\/(\d+).*Safari/.exec(s))) { browser = 'safari'; major = +m[1]; }
  if (uad && Array.isArray(uad.brands)) {   // Chromium's client hints name the browser more reliably than the string
    const b = uad.brands.map((x) => String(x.brand)).find((x) => /Edge|Opera|Chrome|Chromium/.test(x));
    if (/Edge/.test(b || '')) browser = 'edge'; else if (/Opera/.test(b || '')) browser = 'opera';
  }
  return { os, browser, major };
}

export function hardwarePayload({ facts, info, app, build = '', env = globalThis }) {
  const nav = env.navigator || {}, scr = env.screen || {};
  const g = facts?.gpu || null;
  const fam = familyOf(nav.userAgent, nav.userAgentData);
  const limits = {};
  for (const k of LIMITS) if (g?.limits && Number.isFinite(g.limits[k])) limits[k] = g.limits[k];
  return {
    v: REPORT_VERSION, app: String(app || ''), build: String(build || ''),
    surface: env.window?.cadcraftDesktop ? 'desktop' : 'web',
    os: fam.os, browser: fam.browser, browser_major: fam.major,
    tier: info?.tier || '',
    facts: {
      gpu: g ? { vendor: g.vendor || '', architecture: g.architecture || '', description: g.description || '', fallback: !!g.fallback, limits, features: Array.isArray(g.features) ? g.features : [] } : null,
      webgl2: facts?.webgl2 ? { renderer: facts.webgl2.renderer || '', software: !!facts.webgl2.software } : null,
      cores: facts?.cores ?? null, memoryGB: facts?.memoryGB ?? null, isolated: !!facts?.isolated,
      wasm: { simd: !!facts?.wasm?.simd, threads: !!facts?.wasm?.threads },
    },
    screen: { w: scr.width || null, h: scr.height || null, dpr: env.devicePixelRatio || null },
  };
}

export async function shareHardware({ facts, info, app, build = '', env = globalThis, allowed = null, now = Date.now() }) {
  const shell = env.window?.ccShellHardware;
  const ok = shell ? shell.allowed() : allowed ?? !env.window?.cadcraftDesktop;
  if (!ok) return 'off';
  const body = hardwarePayload({ facts, info, app, build, env });
  const sig = JSON.stringify([body.build, body.tier, body.facts, body.browser_major]);
  const key = 'cc-hw-sent:' + body.app;
  let last = null;
  try { last = JSON.parse(env.localStorage?.getItem(key) || 'null'); } catch (e) { /* none */ }
  if (last && last.sig === sig && now - last.at < EVERY_MS) return 'recent';
  const url = env.location?.origin === HOME ? '/api/v1/hardware' : HOME + '/api/v1/hardware';
  try {
    const r = await env.fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'omit', keepalive: true, mode: 'cors' });
    if (!r.ok && r.status !== 429) return 'failed';
    try { env.localStorage?.setItem(key, JSON.stringify({ at: now, sig })); } catch (e) { /* this page only */ }
    return 'sent';
  } catch (e) { return 'failed'; }
}
