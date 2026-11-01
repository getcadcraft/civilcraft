/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * contract-load.mjs — loads every tool definition of an app's agents.js in Node (no browser): the app's own host.js with a
 * stand-in for the page, installAgents run on it, every host.control.tool(def) recorded. Used by the contract checker and the
 * OpenAPI generator. CivilCraft: civilTools() + waterTools().
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ROOT = path.join(REPO, 'public_html/assets/apps');
const deep = () => { const f = function () {}; return new Proxy(f, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'then' ? undefined : deep()), apply: () => deep(), construct: () => deep(), has: () => true }); };
for (const k of ['window', 'document']) if (!globalThis[k]) globalThis[k] = deep();
globalThis.localStorage ??= deep();

export async function loadTools(app) {
  const dev = path.join(ROOT, app, 'dev');
  const manifest = JSON.parse(fs.readFileSync(path.join(dev, 'manifest.json'), 'utf8'));
  registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; return m ? { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true } : next(spec, ctx); } });
  const mod = (f) => import(pathToFileURL(path.join(dev, f)).href);
  const host = await mod('host.js');
  const control = host.getHost({ app }).control;
  const seen = [];
  const orig = control.tool.bind(control);
  control.tool = (def) => { seen.push(def); return orig(def); };
  const stub = deep();
  if (app === 'civilcraft') {
    const I18N = await mod('i18n.js'); try { I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(dev, 'lang/en.json'), 'utf8')) }); } catch { /* names only */ }
    for (const f of ['civil-agent.js', 'water-agent.js', 'eg-agent.js', 'geo-agent.js']) {   // eg- and geo-agent: round 2's tools (civilcraft.js registers them with egTools/geoTools)
      if (!fs.existsSync(path.join(dev, f))) continue;
      const m = await mod(f);
      const fn = m.civilTools || m.waterTools || m.egTools || m.geoTools;
      if (fn) seen.push(...fn(stub));
    }
  } else {
    const m = await mod('agents.js');
    const withControl = new Proxy(stub, { get: (t, k) => (k === 'control' ? control : t[k]) });
    await (app === 'bimcraft' ? m.installAgents(stub, withControl) : m.installAgents(withControl));
  }
  // The tools the shell's modules register on every app's host.control (calc sheets, design reasons, running totals, lessons, Problems, the Ask box,
  // Suggest, firm standards): the manifest says which this build mounts. They are in the hub's per-app lists beside the app's own.
  const JS = path.join(REPO, 'public_html/assets/js');
  const shell = (f) => import(pathToFileURL(path.join(JS, f)).href);
  const take = (defs) => { for (const d of defs || []) seen.push(d); };
  if (manifest.calc) take((await shell('calc.js')).calcTools({ calcs: stub }));
  if (manifest.reasons) take((await shell('reasons.js')).reasonTools({ reasons: stub }));
  if (manifest.totals) take((await shell('totals.js')).totalsTools({ totals: stub }));
  if (manifest.lessons) take((await shell('lessons.js')).lessonTools({ lessons: stub }));
  if (manifest.problems) take((await shell('problems.js')).problemTools({ store: stub, show: stub, report: stub, csv: stub }));
  const grab = { tool: (d) => { seen.push(d); return () => {}; } };
  if (manifest['ai-suggest']) (await shell('ai-suggest.js')).registerTools(grab, stub);
  if (manifest['ai-ask']) (await shell('ai-ask.js')).registerTools(grab, stub);
  if (manifest['ai-ask'] || manifest['ai-suggest']) (await shell('ai-standards.js')).registerTools(grab, { get: () => null, app });
  const names = new Set();
  return seen.filter((d) => d && d.name && !names.has(d.name) && names.add(d.name));
}

