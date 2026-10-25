#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * light-probe.mjs — 0.7 HW.2: the light probe of the six apps without the compute engine (lib/compute/probe-light.js, run by the
 * shell's assets/js/app-hardware.js) against the server's validator. Builds reports with stand-in browsers (a hardware adapter, a
 * software fallback, none), checks the probe never asks for a device or a WebGL context, sends each through
 * HardwareReports::clean (PHP, no database) and checks every column comes back as sent; then the switch rules of report.js
 * without the shell (desktop default off), the sync copies (tools/compute/sync.mjs --check shell) and which builds opt in
 * (AppBuilds::hardware: the six dev builds, not BimCraft/ModelCraft, no frozen release). No database, no network.
 *   node tools/compute-test/light-probe.mjs
 */
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { lightProbe, lightTier } from '../../lib/compute/probe-light.js';
import { hardwarePayload, shareHardware } from '../../lib/compute/report.js';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SIX = ['cadcraft', 'markupcraft', 'takeoffcraft', 'civilcraft', 'detailcraft', 'partcraft'];
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + d + ')' : '')); } };

const asked = { device: 0, webgl: 0 };
function adapter({ fallback = false, description = 'NVIDIA GeForce RTX 3060' } = {}) {
  return {
    info: { vendor: 'nvidia', architecture: 'ampere', device: '', description }, isFallbackAdapter: fallback,
    limits: { maxBufferSize: 4294967296, maxStorageBufferBindingSize: 2147483648, maxComputeWorkgroupStorageSize: 32768, maxComputeInvocationsPerWorkgroup: 1024,
      maxComputeWorkgroupSizeX: 1024, maxComputeWorkgroupsPerDimension: 65535, maxTextureDimension2D: 16384, maxStorageBuffersPerShaderStage: 10 },
    features: new Set(['shader-f16', 'timestamp-query']),
    requestDevice: async () => { asked.device++; throw new Error('the light probe must not ask for a device'); },
  };
}
function env(a, extra = {}) {
  return {
    navigator: { gpu: a === undefined ? undefined : { requestAdapter: async () => a }, hardwareConcurrency: 12, deviceMemory: 8,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' },
    screen: { width: 2560, height: 1440 }, devicePixelRatio: 1.5, crossOriginIsolated: false, WebAssembly,
    makeWebGL2: () => { asked.webgl++; return null; },
    OffscreenCanvas: function () { asked.webgl++; return { getContext: () => null }; },
    document: { createElement: () => { asked.webgl++; return { getContext: () => null }; } },
    ...extra,
  };
}
function clean(body) {
  const code = "require '" + path.join(REPO, 'public_html/core/classes/HardwareReports.php') + "'; echo json_encode(HardwareReports::clean(json_decode(stream_get_contents(STDIN), true)));";
  return JSON.parse(execFileSync('php', ['-r', code], { input: JSON.stringify(body), encoding: 'utf8' }));
}

console.log('== the light probe');
const cases = [['a hardware adapter', adapter()], ['a software fallback', adapter({ fallback: true, description: 'SwiftShader' })], ['no WebGPU', undefined]];
for (const [label, a] of cases) {
  const e = env(a);
  const facts = await lightProbe(e);
  const info = lightTier(facts);
  ok(facts.light === true && facts.webgl2 === null && facts.cores === 12 && facts.memoryGB === 8 && typeof facts.wasm.simd === 'boolean', label + ': probe.js shape, light, no WebGL', JSON.stringify(facts).slice(0, 120));
  ok(a && !a.isFallbackAdapter ? info.tier === 'gpu-high' : info.tier === '', label + ': tier ' + JSON.stringify(info.tier));
  for (const app of SIX) {
    const body = hardwarePayload({ facts, info, app, build: 'dev', env: e });
    const row = clean(body);
    if (!row) { ok(false, label + ' / ' + app + ': the server takes it'); continue; }
    const same = row.app === app && row.build === 'dev' && row.surface === 'web' && row.os === 'windows' && row.browser === 'chrome' && row.browser_major === 141
      && row.tier === info.tier && row.webgpu === (a ? 1 : 0) && row.cores === 12 && row.memory_gb === 8 && row.screen_w === 2560 && row.screen_h === 1440 && row.dpr === 1.5
      && row.gpu_vendor === (a ? 'nvidia' : '') && row.gpu_renderer === (a ? a.info.description : '') && row.gpu_software === (a?.isFallbackAdapter ? 1 : 0)
      && row.report_version === 1 && (a ? JSON.parse(row.limits_json).maxBufferSize === 4294967296 : row.limits_json === null);
    if (app === 'cadcraft' || !same) ok(same, label + ' / ' + app + ': the server keeps every field as sent', JSON.stringify(row).slice(0, 200));
  }
}
ok(asked.device === 0 && asked.webgl === 0, 'never a device, never a WebGL context', JSON.stringify(asked));
ok(SIX.every((app) => clean({ v: 1, app, facts: {} }) !== null) && clean({ v: 1, app: 'nocraft', facts: {} }) === null, 'the server accepts the six slugs (and refuses others)');

console.log('== the switch without the shell');
const sentTo = [];
const fetchStub = async (u) => { sentTo.push(u); return { ok: true, status: 204 }; };
const store = new Map(); const localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
const facts = await lightProbe(env(adapter()));
const base = { facts, info: lightTier(facts), app: 'detailcraft', build: 'dev' };
ok(await shareHardware({ ...base, env: env(adapter(), { window: { cadcraftDesktop: {} }, fetch: fetchStub, localStorage }) }) === 'off' && !sentTo.length, 'desktop: off by default');
ok(await shareHardware({ ...base, env: env(adapter(), { window: { ccShellHardware: { allowed: () => false } }, fetch: fetchStub, localStorage }) }) === 'off' && !sentTo.length, 'switch off: nothing sent');
ok(await shareHardware({ ...base, env: env(adapter(), { window: {}, fetch: fetchStub, localStorage }) }) === 'sent' && sentTo.length === 1, 'web: sent once');
ok(await shareHardware({ ...base, env: env(adapter(), { window: {}, fetch: fetchStub, localStorage }) }) === 'recent' && sentTo.length === 1, 'and not again within the month');

console.log('== copies and who opts in');
let syncOk = true; try { execFileSync('node', [path.join(REPO, 'tools/compute/sync.mjs'), '--check', 'shell'], { stdio: 'pipe' }); } catch { syncOk = false; }
ok(syncOk, 'assets/js/compute/ = lib/compute (sync.mjs --check shell)');
const php = "require '" + path.join(REPO, 'public_html/core/bootstrap.php') + "'; $o = []; foreach (['cadcraft','bimcraft','modelcraft','markupcraft','takeoffcraft','civilcraft','detailcraft','partcraft'] as $s) {"
  + " $d = AppBuilds::resolve($s, 'lab'); $o[$s]['dev'] = $d && $d['is_dev'] ? AppBuilds::hardware($d) : null; $r = [];"
  + " foreach (AppBuilds::versions($s) as $v) if (AppBuilds::hardware(AppBuilds::resolve($s, 'lab', $v))) $r[] = $v; $o[$s]['releases'] = $r; } echo json_encode($o);";
const who = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', '-r', php], { encoding: 'utf8' }));
ok(SIX.every((s) => who[s].dev === true), 'the six dev builds opt in', JSON.stringify(SIX.map((s) => who[s].dev)));
ok(who.bimcraft.dev === false && who.modelcraft.dev === false, 'BimCraft and ModelCraft do not (they report from their own compute/)');
ok(Object.values(who).every((x) => !x.releases.length), 'no frozen release opts in', JSON.stringify(Object.fromEntries(Object.entries(who).map(([k, v]) => [k, v.releases]))));
ok(fs.readFileSync(path.join(REPO, 'public_html/assets/js/app-hardware.js'), 'utf8').includes("from './compute/report.js'"), 'app-hardware.js uses the shared report.js');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
