#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * no-ai-scan.mjs — "no AI engine in the apps: it belongs to the Studios and is passed down" as a check that can fail (0.10 BK.83,
 * corrected by the owner 2026-11-20; KICKOFF rules 34 to 38, docs/AI-TRUST-SPEC.md: the person brings the model, the apps only offer tools).
 *
 *   node tools/ai-scan/no-ai-scan.mjs [--json] [--root <repo>]      exit 0 = nothing found, 1 = something found
 *   import { scan, scanAddons, addonChecks, CHECKS, ADDON, selfTest } from './no-ai-scan.mjs'
 *   scan({ root }) → { roots, files, bytes, hits: [{ check, file, line, match }] }      the apps, the shell and lib/: no allow list
 *   scanAddons({ root }) → { files, hits (not allowed), allowed (the engine file's own matches) }
 *
 * WHAT IS SCANNED: every file under
 *   public_html/assets/apps/<app>/dev/   for each app folder there (the eight apps and SuperCad Studio's host): what /lab serves
 *   public_html/assets/js/               the shell every app loads
 *   lib/                                 the shared libraries the apps' copies are made from
 * Not scanned: node_modules, .git, released builds (frozen copies of dev), the website's own PHP (the site has staff-side AI,
 * which is not an app), tests and tools.
 * Text checks read every file that is not on the binary list and is under 40 MB; the file-name check looks at every file.
 *
 * WHAT IS CHECKED (CHECKS below; each is a list of exact patterns, nothing fuzzy):
 *   vendor-host      the address of a hosted model service, or of a local model server's port
 *   model-endpoint   the request path of a model call (chat, completions, embeddings, generate)
 *   sdk-import       importing or requiring a model vendor's client library or an in-page model runtime
 *   model-runtime    starting a model inside the page (inference sessions, built-in browser model APIs)
 *   model-request    a request body or header shaped for a model service (a model id, a vendor's version header, token limits)
 *   secret-key       a model service's secret key, in any file
 *   site-ai          the website's own staff-side AI gateway, which no app may call
 *   model-file       a model weights or tokenizer file shipped in an app folder
 *
 * THE RULE (owner 2026-11-20, which corrects how "no AI in the apps" was read on 2026-11-11): AI BELONGS TO THE STUDIOS AND IS PASSED
 * DOWN TO THE APPS. What was meant was never "no AI anywhere": it was "not the same engine repeated in each of the eight apps". So:
 *   the apps, the shared shell and lib/ hold NO engine: the three scanned scopes above must be clean with no allow list at all, and a
 *     match in ANY file there fails the scan. The shell keeps only a seam (assets/js/app-ai-ownkey.js) that reads what the host put on the page;
 *   the engine is the Studio's (CadCraft Studio, SuperCad Studio): one copy, tools/mcp/byok.mjs, packed as the hub's byok.mjs and handed
 *     to every app window by Studio's own window script (studio/hub/ask-engine.js, window.js). Nothing is added by the person;
 *   the SAME engine is also the "Your own AI key" add-on, for ONE app in a browser without Studio. Inside a Studio the add-on registers nothing.
 *
 * THE ADD-ON RULE (ADDON below; a rule of its own, not an exception to the one above). addons/ in the repo holds the first-party
 * add-ons that are never part of an app build and reach a person only as a signed Library package they added. Every file there is
 * scanned with the same checks, and:
 *   only addons/own-ai-key/byok.js may match, and only vendor-host, model-endpoint and model-request; any other match in addons/ fails;
 *   that file is byte-identical to tools/mcp/byok.mjs (the tested source, the engine Studio runs), holds no key (secret-key is never
 *     allowed anywhere) and no address of ours;
 *   the add-on is in no app build: no folder of that id under any assets/apps/<app>/dev/addons/, in no addons/index.json, and no
 *     scanned file imports from addons/ or names the add-on's files in an import;
 *   the old shell files (assets/js/ai-byok.js, app-ai-byok.js) are gone;
 *   added but not set up it makes no engine (browser.js browserEngine → null: run here with an empty store), and inside a Studio it
 *     registers nothing (main.js: the Studio's own engine is the one in use).
 *
 * THE STUDIO RULE (HOST below; checked only where the Studio tree is on this machine, CADCRAFT_STUDIO or ../studio): the file that passes
 * the engine down exists, imports the engine from the hub's own byok.mjs, the pack copies that from tools/mcp/byok.mjs and ships the
 * file, and Studio's window script calls it.
 *
 * WHAT IT DOES NOT PROVE: it reads text, it does not run the apps. Code that built an address from pieces at run time, or
 * fetched and ran other code, would not be seen. A vendor's NAME in a sentence is allowed (Settings › Assistants tells the
 * person how to connect their own assistant) and is not a finding; only the patterns below are.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const any = (list, flags = 'i') => new RegExp('(?:' + list.map((x) => (x instanceof RegExp ? x.source : esc(x))).join('|') + ')', flags);

export const CHECKS = [
  { id: 'vendor-host', what: 'no address of a hosted model service or a local model server',
    re: any(['api.openai.com', 'openai.azure.com', 'inference.ai.azure.com', 'api.anthropic.com', 'generativelanguage.googleapis.com', 'aiplatform.googleapis.com', 'api.mistral.ai', 'api.cohere.ai', 'api.cohere.com',
      'api.groq.com', 'api.x.ai', 'api.deepseek.com', 'api.perplexity.ai', 'openrouter.ai', 'api.together.xyz', 'api.together.ai', 'api.fireworks.ai', 'api.replicate.com', 'api-inference.huggingface.co', 'router.huggingface.co',
      'bedrock-runtime', 'api.ai21.com', 'api.stability.ai', 'api.elevenlabs.io', 'dashscope.aliyuncs.com', 'api.moonshot.cn', 'api.cerebras.ai', 'api.sambanova.ai', /(?:localhost|127\.0\.0\.1|0\.0\.0\.0):11434/, /(?:localhost|127\.0\.0\.1):1234\/v1/]),
    sample: 'fetch("https://api.openai.com/x")' },
  { id: 'model-endpoint', what: 'no request path of a model call',
    re: any(['/v1/chat/completions', '/chat/completions', '/v1/completions', '/v1/embeddings', '/v1/images/generations', '/v1/audio/transcriptions', '/v1/audio/speech', ':generateContent', ':streamGenerateContent', ':predict?', '/api/generate"', "/api/generate'", '/v1/messages/batches', /['"`][^'"`\s]*\/v1\/messages['"`?]/, /['"`][^'"`\s]*\/v1\/responses['"`?]/]),
    sample: 'const u = base + "/v1/chat/completions"' },
  { id: 'sdk-import', what: 'no model vendor client library and no in-page model runtime is imported',
    re: (() => { const pk = ['openai', '@anthropic-ai/[^\'"`]+', '@google/generative-ai', '@google/genai', '@google-cloud/vertexai', 'langchain', '@langchain/[^\'"`]+', 'llamaindex', 'cohere-ai', '@mistralai/[^\'"`]+', 'groq-sdk', 'ollama', 'replicate', '@huggingface/[^\'"`]+', '@xenova/transformers', '@mlc-ai/[^\'"`]+', 'onnxruntime-web', 'onnxruntime-node', 'onnxruntime-common', '@tensorflow/[^\'"`]+', '@mediapipe/tasks-genai', 'ai', '@ai-sdk/[^\'"`]+', '@aws-sdk/client-bedrock[^\'"`]*', 'together-ai'].join('|');
      return new RegExp('(?:\\bfrom\\s*|\\bimport\\s*\\(\\s*|\\brequire\\s*\\(\\s*|\\bimport\\s+)[\'"`](?:https?://[^\'"`]*/)?(?:npm:)?(?:' + pk + ')(?:@[\\d.]+)?(?:/[^\'"`]*)?[\'"`]'); })(),
    sample: 'import OpenAI from "openai"' },
  { id: 'model-runtime', what: 'no model is started inside the page',
    re: any([/\bInferenceSession\s*\.\s*create\b/, /\bort\s*\.\s*InferenceSession\b/, /\btf\s*\.\s*load(?:Graph|Layers)Model\b/, /\bCreate(?:WebWorker)?MLCEngine\b/, /\bnavigator\s*\.\s*ml\b/, /\b(?:window|self|globalThis)\s*\.\s*ai\s*\.\s*(?:languageModel|createTextSession|summarizer|writer|rewriter)\b/, /\bLanguageModel\s*\.\s*(?:create|availability)\s*\(/,
      /\bpipeline\s*\(\s*['"`](?:text-generation|text2text-generation|feature-extraction|summarization|question-answering|fill-mask|zero-shot-classification|automatic-speech-recognition)['"`]/], ''),
    sample: 'const s = await ort.InferenceSession.create(bytes)' },
  { id: 'model-request', what: 'no request shaped for a model service (model id, vendor header, token limits)',
    re: any([/['"`]?\bmodel['"`]?\s*:\s*['"`](?:gpt-|o[134](?:-|['"`])|chatgpt-|text-embedding-|claude-|gemini-|mistral-|codestral|llama-?\d|command-r|deepseek-|grok-|qwen|sonar)/, /['"`]anthropic-version['"`]/, /['"`]anthropic-beta['"`]/, /['"`]anthropic-dangerous-direct-browser-access['"`]/, /['"`]OpenAI-(?:Organization|Beta|Project)['"`]/, /['"`]x-goog-api-key['"`]/,
      /\bmax_tokens['"`]?\s*:\s*\d/, /\bmax_completion_tokens\b/, /\bsystem_instruction\b/], ''),
    sample: 'body: JSON.stringify({ model: "gpt-4o", messages })' },
  { id: 'secret-key', what: 'no model service key is in any file (never allowed, the own-key add-on included)',
    re: any([/\bsk-(?:ant|proj|or)-[A-Za-z0-9_-]{16,}/, /\bsk-[A-Za-z0-9]{32,}\b/, /\bAIza[0-9A-Za-z_-]{35}\b/, /\bhf_[A-Za-z0-9]{30,}\b/, /\bgsk_[A-Za-z0-9]{30,}\b/, /\bxai-[A-Za-z0-9]{30,}\b/], ''),
    sample: 'const k = "sk-ant-' + 'a1B2c3D4e5F6g7H8i9J0k1L2"' },
  { id: 'site-ai', what: 'no call to the website\'s own staff-side AI',
    re: any([/\bhailey\b/, '/api/ai/', '/api/admin/message-draft', 'submission-review', 'reply-draft']),
    sample: 'fetch("/api/ai/ask")' },
  { id: 'model-file', what: 'no model weights or tokenizer file is shipped', file: true,
    re: /(?:\.(?:onnx|ort|gguf|ggml|safetensors|tflite|pt|pth|ckpt|mlmodel|mlpackage|pb|h5|keras|task|litertlm)$|(?:^|\/)(?:tokenizer(?:_config)?\.json|vocab\.txt|merges\.txt|special_tokens_map\.json|generation_config\.json)$)/i,
    sample: 'addons/x/model.onnx' },
];

/**
 * The add-on rule: the folder of Library-only add-ons, and the one file in it that may hold a model provider's address and request shape
 * (the engine of the person's own-key add-on; see the header). Nothing here loosens the scan of the apps, the shell or lib/.
 */
export const ADDON = { home: 'addons', id: 'own-ai-key', engine: 'addons/own-ai-key/byok.js', browser: 'addons/own-ai-key/browser.js', main: 'addons/own-ai-key/main.js', source: 'tools/mcp/byok.mjs',
  may: ['vendor-host', 'model-endpoint', 'model-request'], gone: ['public_html/assets/js/ai-byok.js', 'public_html/assets/js/app-ai-byok.js'] };

/** The Studio rule: where the engine lives and how it reaches the apps (the Studio tree is a repo of its own). */
export const HOST = { engine: 'hub/ask-engine.js', window: 'hub/window.js', pack: 'pack/suite.mjs' };
export const studioHome = (root = here()) => { const d = process.env.CADCRAFT_STUDIO || path.resolve(root, '../studio'); return fs.existsSync(path.join(d, HOST.engine)) || fs.existsSync(path.join(d, HOST.window)) ? d : null; };

/** Extensions never read as text (the file-name check still sees them). */
const BINARY = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'ico', 'bmp', 'tif', 'tiff', 'woff', 'woff2', 'ttf', 'otf', 'eot', 'wasm', 'zip', 'gz', 'br', 'zst', '7z', 'pdf', 'dwg', 'ifc', 'ifczip', 'rvt', 'rfa', 'skp', '3dm', 'glb', 'gltf-bin', 'bin', 'dat', 'exr', 'hdr', 'ktx2', 'basis',
  'mp3', 'mp4', 'webm', 'ogg', 'wav', 'mov', 'las', 'laz', 'e57', 'stl', 'step', 'stp', 'obj', 'fbx', 'usdz', 'usdc', 'mmdb', 'sqlite', 'db', 'pyc', 'so', 'dll', 'exe', 'node', 'onnx', 'gguf', 'safetensors', 'tflite', 'pt', 'pth']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.rust-target', 'target']);
const MAX_TEXT = 40 * 1024 * 1024;

/** The folders the scan covers, from the repo root. */
export function scanRoots(root) {
  const out = [];
  const apps = path.join(root, 'public_html/assets/apps');
  for (const a of fs.existsSync(apps) ? fs.readdirSync(apps).sort() : []) { const d = path.join(apps, a, 'dev'); if (fs.existsSync(d) && fs.statSync(d).isDirectory()) out.push(d); }
  for (const d of ['public_html/assets/js', 'lib']) if (fs.existsSync(path.join(root, d))) out.push(path.join(root, d));
  return out;
}

/** One text against the text checks → [{ check, line, match }]. */
export function scanText(text) {
  const hits = [];
  for (const c of CHECKS) {
    if (c.file) continue;
    const re = new RegExp(c.re.source, c.re.flags.includes('i') ? 'gi' : 'g');
    let m;
    while ((m = re.exec(text))) {
      hits.push({ check: c.id, line: text.slice(0, m.index).split('\n').length, match: m[0].slice(0, 80) });
      if (hits.length > 200) return hits;
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  return hits;
}
export const scanName = (rel) => CHECKS.filter((c) => c.file && c.re.test(rel)).map((c) => ({ check: c.id, line: 0, match: path.basename(rel) }));

/** Every file under the given folders against every check → { files, read, bytes, hits }. */
function walkAll(root, dirs) {
  const hits = [];
  let files = 0, bytes = 0, read = 0;
  const walk = (dir) => {
    let list = [];
    try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of list) {
      const p = path.join(dir, e.name);
      if (e.isSymbolicLink()) continue;   // a link points at a folder scanned under its own name, or outside the scope
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p); continue; }
      if (!e.isFile()) continue;
      files++;
      const rel = path.relative(root, p);
      for (const h of scanName(rel)) hits.push({ ...h, file: rel });
      const ext = e.name.includes('.') ? e.name.split('.').pop().toLowerCase() : '';
      if (BINARY.has(ext)) continue;
      let st; try { st = fs.statSync(p); } catch (x) { continue; }
      if (st.size > MAX_TEXT || !st.size) continue;
      let text; try { text = fs.readFileSync(p, 'latin1'); } catch (x) { continue; }
      bytes += st.size; read++;
      for (const h of scanText(text)) hits.push({ ...h, file: rel });
    }
  };
  for (const d of dirs) walk(d);
  return { files, read, bytes, hits };
}
const here = () => path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** The apps, the shared shell and lib/: every match is a finding. There is no allow list. */
export function scan({ root = here() } = {}) {
  const roots = scanRoots(root);
  return { roots, ...walkAll(root, roots) };
}

/** The add-on folder under its own rule: `allowed` = the engine file's matches of the three kinds it may have; `hits` = everything else. */
export function scanAddons({ root = here() } = {}) {
  const home = path.join(root, ADDON.home);
  const r = fs.existsSync(home) ? walkAll(root, [home]) : { files: 0, read: 0, bytes: 0, hits: [] };
  const ok = (h) => h.file === ADDON.engine && ADDON.may.includes(h.check);
  return { home: ADDON.home, files: r.files, read: r.read, bytes: r.bytes, hits: r.hits.filter((h) => !ok(h)), allowed: r.hits.filter(ok) };
}

/** The conditions of the add-on rule → [{ id, ok, what, detail }]. */
export async function addonChecks({ root = here(), result = null, addons = null } = {}) {
  const out = [], add = (id, ok, what, detail = '') => out.push({ id, ok: !!ok, what, detail });
  const r = result || scan({ root }), a = addons || scanAddons({ root });
  const f = path.join(root, ADDON.engine), src = path.join(root, ADDON.source);
  const there = fs.existsSync(f);
  add('apps-clean', r.hits.length === 0, 'no file in an app folder, the shared shell or lib/ matches any check (no allow list)', [...new Set(r.hits.map((h) => h.file))].slice(0, 5).join(', '));
  add('only-the-engine', a.hits.length === 0 && a.allowed.length > 0, 'in ' + ADDON.home + '/ only ' + ADDON.engine + ' matches, and only ' + ADDON.may.join(', '), [...new Set(a.hits.map((h) => h.file + ' (' + h.check + ')'))].slice(0, 5).join(', '));
  add('same-as-source', there && fs.existsSync(src) && fs.readFileSync(f).equals(fs.readFileSync(src)), 'it is byte-identical to ' + ADDON.source);
  add('no-key', there && !scanText(fs.readFileSync(f, 'latin1')).some((h) => h.check === 'secret-key'), 'it holds no key');
  add('no-address-of-ours', there && !/getcadcraft\.com|projectz\.xyz|mecentral/i.test(fs.readFileSync(f, 'latin1')), 'it holds no address of ours (the call goes from the person\'s computer to the provider they chose)');
  add('shell-files-gone', ADDON.gone.every((g) => !fs.existsSync(path.join(root, g))), 'the old shell client is gone (' + ADDON.gone.map((g) => path.basename(g)).join(', ') + ')', ADDON.gone.filter((g) => fs.existsSync(path.join(root, g))).join(', '));
  // in no app build: no folder of that id among any app's add-ons, in no index.json; and nothing scanned imports from the add-on folder
  const built = [], importers = [];
  const imp = /(?:from\s*|import\s*\(\s*|import\s+|src\s*=\s*)['"`][^'"`]*(?:own-ai-key|\bai-byok\.js|\/byok\.m?js)[^'"`]*['"`]/;
  for (const d of scanRoots(root)) {
    if (/assets\/apps\//.test(d)) {
      if (fs.existsSync(path.join(d, 'addons', ADDON.id))) built.push(path.relative(root, path.join(d, 'addons', ADDON.id)));
      try { const ix = JSON.parse(fs.readFileSync(path.join(d, 'addons/index.json'), 'utf8')); if ((ix.addons || []).includes(ADDON.id)) built.push(path.relative(root, path.join(d, 'addons/index.json'))); } catch (e) { /* no add-ons in this app */ }
    }
    const walk = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isSymbolicLink()) continue; if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p); continue; } if (!/\.(m?js|inc|html)$/.test(e.name)) continue; let t = ''; try { if (fs.statSync(p).size < MAX_TEXT) t = fs.readFileSync(p, 'latin1'); } catch (x) { continue; } if (imp.test(t)) importers.push(path.relative(root, p)); } };
    walk(d);
  }
  add('in-no-build', built.length === 0, 'the add-on is in no app build (no ' + ADDON.id + ' folder among any app\'s add-ons, in no addons/index.json)', built.join(', '));
  add('nothing-loads-it', importers.length === 0, 'no file of an app, the shell or lib/ imports the add-on\'s files', importers.slice(0, 5).join(', '));
  // added but not set up: no engine at all; inside a Studio: nothing registered (the Studio's engine is the one in use)
  try {
    const B = await import(path.join(root, ADDON.browser)), M = await import(path.join(root, ADDON.main));
    const mem = (init = {}) => { const m = new Map(Object.entries(init)); return { get: (k) => (m.has(k) ? m.get(k) : null), set: (k, v) => { m.set(k, v); return true; }, remove: (k) => m.delete(k) }; };
    const noFetch = async () => { throw new Error('the scan calls no one'); };
    const set = mem({ settings: { provider: 'anthropic', model: 'a-model' }, 'key.default': 'not-a-real-key' });
    add('inert', B.browserEngine({ storage: mem(), fetch: noFetch }) === null && B.browserEngine({ storage: mem({ settings: { provider: 'anthropic', model: 'a-model' } }), fetch: noFetch }) === null && B.browserEngine({ storage: set, fetch: noFetch }) !== null,
      'added but with nothing set up by the person it makes no engine (browserEngine is null); one exists only once they named a model and stored a key');
    add('yields-to-studio', M.inStudio({ cadcraftDesktop: {} }) === true && M.inStudio({ cadcraftStudio: {} }) === true && M.inStudio({}) === false && /if \(inStudio\(g\)\) return;/.test(fs.readFileSync(path.join(root, ADDON.main), 'utf8')),
      'inside a Studio the add-on registers nothing: the Studio passes its own engine down');
  } catch (e) { add('inert', false, 'the add-on\'s modules could be loaded to check it is inert', String(e.message || e)); }
  // the Studio rule: the engine is the Studio's and its window script passes it down (only where the Studio tree is here)
  const home = studioHome(root);
  if (home) {
    const rd = (f) => { try { return fs.readFileSync(path.join(home, f), 'utf8'); } catch (e) { return ''; } };
    const eng = rd(HOST.engine), win = rd(HOST.window), pack = rd(HOST.pack);
    add('studio-passes-it-down', /from '\.\/byok\.mjs'/.test(eng) && /export function passDown\b/.test(eng) && /from '\.\/ask-engine\.js'/.test(win) && /\bpassDown\(/.test(win),
      'Studio holds the engine and its window script hands it to every app window (' + HOST.engine + ', ' + HOST.window + ')');
    add('studio-packs-the-source', /tools\/mcp\/byok\.mjs'\), path\.join\(DEST, 'hub\/byok\.mjs'\)/.test(pack) && /'ask-engine\.js'/.test(pack), 'the Studio pack ships ' + HOST.engine + ' and copies its engine from ' + ADDON.source);
  }
  return out;
}
/** Each check against a planted sample: the scan must catch what it is for. */
export function selfTest() {
  return CHECKS.map((c) => ({ id: c.id, caught: c.file ? scanName(c.sample).some((h) => h.check === c.id) : scanText(c.sample).some((h) => h.check === c.id) }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ri = process.argv.indexOf('--root');
  const r = scan(ri > 0 ? { root: path.resolve(process.argv[ri + 1]) } : {});
  if (process.argv.includes('--json')) { const a = scanAddons(ri > 0 ? { root: path.resolve(process.argv[ri + 1]) } : {}); console.log(JSON.stringify({ ...r, addons: a }, null, 1)); process.exitCode = r.hits.length || a.hits.length ? 1 : 0; }
  else {
    console.log('no-ai-scan: ' + r.files + ' files (' + r.read + ' read as text, ' + (r.bytes / 1048576).toFixed(0) + ' MB) in ' + r.roots.length + ' folders');
    for (const c of CHECKS) { const h = r.hits.filter((x) => x.check === c.id); console.log((h.length ? '  FAIL ' : '  ok   ') + c.id + ': ' + c.what + (h.length ? ' (' + h.length + ')' : '')); for (const x of h.slice(0, 40)) console.log('         ' + x.file + (x.line ? ':' + x.line : '') + '  ' + x.match); }
    const bad = selfTest().filter((x) => !x.caught);
    if (bad.length) console.log('  FAIL the scan misses its own samples: ' + bad.map((x) => x.id).join(', '));
    const a = scanAddons(ri > 0 ? { root: path.resolve(process.argv[ri + 1]) } : {});
    console.log('no engine in the apps, the shell or lib/ (no allow list): the engine is the Studio\'s, passed down. The add-on rule, ' + ADDON.home + '/ (' + a.files + ' files; ' + a.allowed.length + ' provider matches, all in ' + ADDON.engine + '):');
    for (const x of a.hits.slice(0, 40)) console.log('  FAIL ' + x.check + '  ' + x.file + (x.line ? ':' + x.line : '') + '  ' + x.match);
    const ex = await addonChecks({ result: r, addons: a, ...(ri > 0 ? { root: path.resolve(process.argv[ri + 1]) } : {}) });
    for (const x of ex) console.log((x.ok ? '  ok   ' : '  FAIL ') + x.id + ': ' + x.what + (!x.ok && x.detail ? ' (' + x.detail + ')' : ''));
    process.exitCode = r.hits.length || a.hits.length || bad.length || ex.some((x) => !x.ok) ? 1 : 0;
  }
}
