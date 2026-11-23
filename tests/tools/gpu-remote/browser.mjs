// SPDX-License-Identifier: Apache-2.0
/**
 * browser.mjs — one browser launcher for the GPU tests, here or on the GPU workstation (0.8 KICKOFF rule 25).
 *
 * Here (the VPS): Playwright's Chromium with SwiftShader, as every browser test did before, through 127.0.0.1.
 * On the workstation (run by tools/gpu-remote/run.sh, which sets CC_GPU_REMOTE=1): Windows Node drives the Windows
 * Chrome (channel chrome) with the real GPU (WebGPU + WebGL on the NVIDIA card, D3D), reaching https://getcadcraft.com
 * over the internet. The WSL side has no GPU for a browser (SwiftShader only), so the browser must be the Windows one.
 *
 *   import { launch, remote, machine, labCookie, BASE } from '../gpu-remote/browser.mjs';
 *   const browser = await launch({ webgpu: true });            // or { webgl: true }
 *   const ctx = await browser.newContext(); await ctx.addCookies(labCookie());   // only for /lab pages
 *   console.log(await machine(page));                           // "workstation11a, NVIDIA GeForce RTX 5070 (D3D11)" for § Results
 *
 * labCookie(): here, a fresh signed-in session of the shell test admin (tools/shell-test/admin.php session); there, the
 * one run.sh minted here and passed in CC_LAB_COOKIE (never written to a file on the workstation).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const remote = process.env.CC_GPU_REMOTE === '1';
export const BASE = 'https://getcadcraft.com';

function playwright() {
  // there: the shared node_modules run.sh keeps in the run folder; here: the copy the app tests already use
  const root = remote ? process.env.CC_PW_ROOT : path.join(REPO, 'tools/modelcraft-test');
  return createRequire(path.join(root, 'package.json'))('playwright-core');
}

function localChromium() {
  const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
  const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
  return ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
}

export async function launch({ webgpu = false, webgl = false, headless = true, args = [] } = {}) {
  const { chromium } = playwright();
  if (remote) {
    return chromium.launch({ channel: 'chrome', headless, args: [...(webgpu ? ['--enable-unsafe-webgpu'] : []), ...args] });
  }
  const sw = [
    ...(webgpu ? ['--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader'] : []),
    ...(webgl ? ['--use-gl=angle', '--use-angle=swiftshader'] : []),
    ...(webgpu || webgl ? ['--enable-unsafe-swiftshader'] : []),
  ];
  return chromium.launch({ executablePath: localChromium(), headless, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', ...sw, ...args] });
}

export function labCookie() {
  let raw = process.env.CC_LAB_COOKIE || '';
  if (!raw && !remote) raw = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie;
  if (!raw) throw new Error('no lab cookie: run through tools/gpu-remote/run.sh --lab');
  const [name, value] = raw.split('=');
  return [{ name, value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }];
}

// The machine line for § Results: where it ran and what drew it.
export async function machine(page) {
  const g = await page.evaluate(async () => {
    const a = navigator.gpu ? await navigator.gpu.requestAdapter() : null;
    const c = document.createElement('canvas').getContext('webgl2');
    const d = c && c.getExtension('WEBGL_debug_renderer_info');
    return { webgpu: a && a.info ? [a.info.vendor, a.info.architecture].filter(Boolean).join(' ') : (a ? 'yes' : 'none'), webgl: d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'none' };
  }).catch(() => ({ webgpu: '?', webgl: '?' }));
  const host = remote ? (process.env.CC_GPU_HOST || 'workstation11a') : 'VPS, capped';
  return host + ' — WebGPU ' + g.webgpu + '; WebGL ' + g.webgl;
}
