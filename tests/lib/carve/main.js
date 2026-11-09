/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Router carving add-on (0.9 SU.886, session `carve-09`): V-carving, engraving and relief carving from a depth map, as G-code for a
 * router or a laser-class machine, through a post-processor you can edit, with a check of the program. One add-on for every host: the engine is
 * lib/ (DOM-free), the only things that touch an app are this panel and the host adapter (host.js, here hosts/cad.js for CadCraft).
 *
 *   activate(api) on add-on API 1.1+: api.t, api.storage, api.ui.panelTab, api.files.exporter, api.onDeactivate, api.log
 *   The host (detect(api, { t })) provides shapes() → { closed, open, layers, skipped }, draw(ops), erase(), count(), selectionSize(), units(), start(app).
 *   app (handed to host.start): run() → { ok, message, summary }, draw() → { n }, download().
 *
 * Panel: Shapes (selection or drawing, layers) → Operation (V-carve | Engrave | Relief) → Cutting (feeds, speeds, heights) → Post (a dialect and its
 * text, which you can change) → Make toolpaths → preview of the cut block, the numbers, what to watch for → Draw / Download / Check.
 */
import { vcarve, relief, engrave, gcode, cleanPost, cleanJob, POSTS, checkProgram, simulate, bounds } from './lib/index.js';
import * as hostMod from './host.js';

const DEFAULTS = {
  mode: 'vcarve', selection: false, layers: null,
  angle: 60, maxDepth: 3, clear: 'endmill', clearDia: 6, clearStep: 60, ridgeTol: 0.15,
  engDepth: 1, engPass: 0.5, engTool: 'v',
  relWidth: 100, relDepth: 3, relInvert: false, relTool: 'ball', relDia: 3, relAngle: 60, relStep: 12, relDir: 'x', relRough: true, relRoughDia: 6, relStepdown: 1.5, relLeave: 0.3, relX: 0, relY: 0,
  feed: 1000, plunge: 300, rpm: 12000, safeZ: 10, clearZ: 2, unit: 'mm', bedW: 0, bedH: 0,
  post: 'grbl', postEdit: null,
};

export function activate(api) {
  const t = (k, v) => api.t(k, v);
  const host = typeof hostMod.detect === 'function' ? hostMod.detect(api, { t }) : null;
  const S = { ...DEFAULTS, ...(safe(() => api.storage.get('settings')) || {}) };
  const R = { plan: null, program: null, check: null, ext: null, shapes: null, image: null, imageName: '', busy: false, message: '', error: '' };
  let pane = null, styleEl = null;
  const save = () => { const { ...keep } = S; safe(() => api.storage.set('settings', keep)); };
  function safe(fn) { try { return fn(); } catch { return null; } }

  // ------------------------------------------------------------------------------------------------ the work
  const postOf = () => cleanPost({ ...(POSTS[S.post] || POSTS.grbl), ...(S.postEdit && S.postEdit.base === S.post ? S.postEdit.fields : {}), id: S.post });
  const jobOf = () => cleanJob({ unit: S.unit, safeZ: S.safeZ, clearZ: S.clearZ, feed: S.feed, plunge: S.plunge, rpm: S.rpm, name: t('job.name') });
  const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const say = (m) => { try { api.print(m); } catch { /* no history */ } };

  function readShapes() {
    if (!host) return { closed: [], open: [], layers: [], skipped: {} };
    R.shapes = host.shapes({ selection: S.selection, layers: S.layers ? new Set(S.layers) : null });
    return R.shapes;
  }
  const NAMES = { vcarve: () => t('tool.v', { a: S.angle }), clear: () => t('tool.flat', { d: S.clearDia }), engrave: () => (S.engTool === 'v' ? t('tool.v', { a: S.angle }) : t('tool.ball', { d: S.relDia })), rough: () => t('tool.flat', { d: S.relRoughDia }), finish: () => (S.relTool === 'v' ? t('tool.v', { a: S.relAngle }) : t(S.relTool === 'flat' ? 'tool.flat' : 'tool.ball', { d: S.relDia })) };

  function make() {
    R.error = ''; R.message = ''; R.plan = null; R.program = null; R.check = null;
    const sh = readShapes();
    let plan;
    try {
      if (S.mode === 'vcarve') {
        if (!sh.closed.length) throw Object.assign(new Error('carve.err.noshape'), { key: 'carve.err.noshape' });
        const loops = sh.closed.map((c) => c.pts);
        const r = vcarve(loops, { angle: num(S.angle, 60), maxDepth: num(S.maxDepth, 3), clear: { mode: S.clear, dia: num(S.clearDia, 6), stepover: num(S.clearStep, 60) / 100 }, ridgeTol: num(S.ridgeTol, 0.15) });
        plan = { mode: 'vcarve', ops: r.ops, stats: r.stats, bounds: r.stats.bounds, warnings: r.stats.warnings, depth: num(S.maxDepth, 3) };
      } else if (S.mode === 'engrave') {
        const paths = [...sh.open.map((p) => ({ pts: p.pts, closed: false })), ...sh.closed.map((p) => ({ pts: p.pts, closed: true }))];
        const r = engrave(paths, { depth: num(S.engDepth, 1), passDepth: num(S.engPass, 0.5), tool: S.engTool === 'v' ? { type: 'v', angle: num(S.angle, 60) } : { type: 'ball', dia: num(S.relDia, 3) } });
        plan = { mode: 'engrave', ops: r.ops, stats: r.stats, bounds: bounds(paths.map((p) => p.pts)), warnings: [], depth: num(S.engDepth, 1) };
      } else {
        if (!R.image) throw Object.assign(new Error('carve.err.noimage'), { key: 'carve.err.noimage' });
        const tool = S.relTool === 'v' ? { type: 'v', angle: num(S.relAngle, 60) } : { type: S.relTool, dia: num(S.relDia, 3) };
        const r = relief(R.image, { width: num(S.relWidth, 100), depth: num(S.relDepth, 3), invert: !!S.relInvert, tool, stepover: tool.type === 'v' ? 0 : num(S.relStep, 12) / 100, direction: S.relDir, rough: S.relRough ? { tool: { type: 'flat', dia: num(S.relRoughDia, 6) }, stepdown: num(S.relStepdown, 1.5), stepover: 0.5, leave: num(S.relLeave, 0.3) } : null });
        const dx = num(S.relX, 0), dy = num(S.relY, 0);
        for (const op of r.ops) op.paths = op.paths.map((p) => p.map((q) => [q[0] + dx, q[1] + dy, q[2]]));
        plan = { mode: 'relief', ops: r.ops, stats: r.stats, bounds: { x0: dx, y0: dy, x1: dx + r.stats.width, y1: dy + r.stats.height }, warnings: [], depth: num(S.relDepth, 3) };
      }
    } catch (e) { R.error = e && e.key ? t(e.key, { count: e.count }) : String((e && e.message) || e); render(); return { ok: false, message: R.error }; }
    for (const op of plan.ops) op.name = (NAMES[op.id] ? NAMES[op.id]() : op.id);
    const job = jobOf();
    const g = gcode(plan.ops, job, postOf());
    const bed = num(S.bedW, 0) > 0 && num(S.bedH, 0) > 0 ? { x0: 0, y0: 0, x1: num(S.bedW, 0), y1: num(S.bedH, 0) } : null;
    R.plan = plan; R.program = g;
    R.check = checkProgram(g.text, { bed, maxDepth: plan.depth + 0.01 });
    const summary = { ops: plan.ops.length, lines: g.lines, minutes: Math.max(1, Math.round(g.stats.minutes)), length: Math.round(g.stats.length / 10) / 100 };
    render();
    return { ok: true, summary, message: '' };
  }
  function download() {
    if (!R.program) return;
    const blob = new Blob([R.program.text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = fileName() + '.' + (S.post === 'fanuc' ? 'nc' : 'gcode'); a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  const fileName = () => String(t('job.name')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'carving';
  const app = { run: () => make(), draw: () => (host && R.plan ? host.draw(R.plan.ops) : { n: 0 }), download };

  // ------------------------------------------------------------------------------------------------ the panel
  const CSS = `.cv { font-size: .85rem; padding: .25rem .1rem; } .cv h4 { font-size: .8rem; margin: .8rem 0 .3rem; text-transform: none; font-weight: 600; }
.cv .cv-row { display: flex; flex-wrap: wrap; gap: .4rem .8rem; align-items: center; margin: .25rem 0; } .cv label { display: inline-flex; flex-wrap: wrap; gap: .3rem; align-items: center; max-width: 100%; }
.cv input[type=number] { width: 5.2rem; } .cv input[type=text], .cv select { max-width: 100%; min-width: 0; text-overflow: ellipsis; } .cv textarea { width: 100%; font-family: monospace; font-size: .75rem; min-height: 3.6rem; }
.cv .cv-tabs button[aria-pressed="true"] { background: var(--action, #2563eb); color: var(--sheet, #fff); } .cv .cv-note { opacity: .75; } .cv .cv-err { color: #b91c1c; font-weight: 600; }
.cv .cv-warn { color: #92400e; } .cv canvas { width: 100%; max-width: 28rem; border: 1px solid var(--line, #888); image-rendering: pixelated; background: #fff; } .cv table { border-collapse: collapse; } .cv td { padding: 0 .6rem 0 0; }
.cv .cv-issues li { margin: .1rem 0; }`;
  const h = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v === null || v === undefined) continue;
      if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else if (k === 'value') n.value = v; else if (k === 'checked' || k === 'selected' || k === 'disabled') n[k] = !!v; else n.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
    return n;
  };
  const field = (key, label, o = {}) => h('label', {}, label, h('input', { type: 'number', value: S[key], step: o.step ?? 'any', min: o.min, 'data-cv': key, onchange: (e) => { S[key] = Number(e.target.value); save(); } }), o.unit ? h('span', { class: 'cv-note' }, o.unit) : null);
  const choice = (key, label, opts) => h('label', {}, label, h('select', { 'data-cv': key, onchange: (e) => { S[key] = e.target.value; save(); render(); } }, opts.map(([v, text]) => h('option', { value: v, selected: S[key] === v }, text))));
  const check = (key, label) => h('label', {}, h('input', { type: 'checkbox', checked: !!S[key], 'data-cv': key, onchange: (e) => { S[key] = e.target.checked; save(); render(); } }), label);

  function preview() {
    if (!R.plan || !R.plan.bounds || !Number.isFinite(R.plan.bounds.x0)) return null;
    const b = R.plan.bounds, pad = 3, W = b.x1 - b.x0 + 2 * pad, Hh = b.y1 - b.y0 + 2 * pad;
    const res = Math.max(W, Hh) / 360;
    let S2;
    try { S2 = simulate(R.plan.ops, { x0: b.x0 - pad, y0: b.y0 - pad, x1: b.x0 - pad + W, y1: b.y0 - pad + Hh, res }); } catch { return null; }
    const cv = h('canvas', { width: S2.w, height: S2.h, 'data-cv-preview': '', role: 'img', 'aria-label': t('preview.alt') });
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(S2.w, S2.h);
    const depth = R.plan.depth || 1;
    for (let j = 0; j < S2.h; j++) for (let i = 0; i < S2.w; i++) {
      const z = S2.z[j * S2.w + i], v = Math.round(255 - 215 * Math.min(1, -z / depth)), o = ((S2.h - 1 - j) * S2.w + i) * 4;   // deeper = darker
      img.data[o] = v; img.data[o + 1] = v; img.data[o + 2] = Math.min(255, v + (z < 0 ? 12 : 0)); img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  }

  function render() {
    if (!pane) return;
    const sh = R.shapes || readShapes();
    const kids = [];
    kids.push(h('p', { class: 'cv-note' }, t('intro')));
    // shapes
    kids.push(h('h4', {}, t('sec.shapes')));
    if (!host) kids.push(h('p', { class: 'cv-err' }, t('host.none')));
    else {
      kids.push(h('div', { class: 'cv-row' },
        h('label', {}, h('input', { type: 'radio', name: 'cv-src', checked: !S.selection, 'data-cv': 'src-all', onchange: () => { S.selection = false; save(); R.shapes = null; render(); } }), t('src.all')),
        h('label', {}, h('input', { type: 'radio', name: 'cv-src', checked: !!S.selection, 'data-cv': 'src-sel', onchange: () => { S.selection = true; save(); R.shapes = null; render(); } }), t('src.sel', { n: host.selectionSize() })),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-cv': 'reread', onclick: () => { R.shapes = null; render(); } }, t('shapes.reread'))));
      kids.push(h('p', { 'data-cv-shapes': '' }, t('shapes.count', { closed: sh.closed.length, open: sh.open.length }), Object.keys(sh.skipped || {}).length ? ' ' + t('shapes.skipped', { what: Object.entries(sh.skipped).map(([k, n]) => k + ' ' + n).join(', ') }) : ''));
      if (sh.layers.length > 1) kids.push(h('div', { class: 'cv-row', 'data-cv': 'layers' }, t('layers.use'), sh.layers.map((l) => h('label', {}, h('input', { type: 'checkbox', checked: !S.layers || S.layers.includes(l.name), onchange: (e) => { const all = sh.layers.map((x) => x.name); const cur = new Set(S.layers || all); if (e.target.checked) cur.add(l.name); else cur.delete(l.name); S.layers = cur.size === all.length ? null : [...cur]; save(); R.shapes = null; render(); } }), l.name + ' (' + (l.closed + l.open) + ')'))));
    }
    // operation
    kids.push(h('h4', {}, t('sec.op')));
    kids.push(h('div', { class: 'cv-row cv-tabs' }, ['vcarve', 'engrave', 'relief'].map((m) => h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'aria-pressed': S.mode === m ? 'true' : 'false', 'data-cv-mode': m, onclick: () => { S.mode = m; R.plan = R.program = R.check = null; R.error = R.message = ''; save(); render(); } }, t('mode.' + m)))));
    kids.push(h('p', { class: 'cv-note' }, t('mode.' + S.mode + '.note')));
    if (S.mode === 'vcarve') {
      kids.push(h('div', { class: 'cv-row' }, field('angle', t('f.angle'), { unit: '°', min: 10 }), field('maxDepth', t('f.maxdepth'), { unit: 'mm', min: 0.1 })));
      kids.push(h('div', { class: 'cv-row' }, choice('clear', t('f.clear'), [['endmill', t('clear.endmill')], ['vbit', t('clear.vbit')], ['none', t('clear.none')]]),
        S.clear === 'endmill' ? [field('clearDia', t('f.cleardia'), { unit: 'mm', min: 0.5 }), field('clearStep', t('f.clearstep'), { unit: '%', min: 10 })] : null, S.clear !== 'none' ? field('ridgeTol', t('f.ridge'), { unit: 'mm', min: 0.02 }) : null));
    } else if (S.mode === 'engrave') {
      kids.push(h('div', { class: 'cv-row' }, choice('engTool', t('f.tool'), [['v', t('tool.vname')], ['ball', t('tool.ballname')]]), S.engTool === 'v' ? field('angle', t('f.angle'), { unit: '°', min: 10 }) : field('relDia', t('f.dia'), { unit: 'mm', min: 0.1 }), field('engDepth', t('f.depth'), { unit: 'mm', min: 0.05 }), field('engPass', t('f.pass'), { unit: 'mm', min: 0.05 })));
    } else {
      kids.push(h('div', { class: 'cv-row' }, h('label', {}, t('f.image'), h('input', { type: 'file', accept: 'image/*', 'data-cv': 'image', onchange: (e) => loadImage(e.target.files && e.target.files[0]) })), h('span', { class: 'cv-note', 'data-cv-image': '' }, R.image ? t('image.loaded', { name: R.imageName, w: R.image.w, h: R.image.h }) : t('image.none'))));
      kids.push(h('div', { class: 'cv-row' }, field('relWidth', t('f.width'), { unit: 'mm', min: 1 }), field('relDepth', t('f.depth'), { unit: 'mm', min: 0.1 }), check('relInvert', t('f.invert')), field('relX', t('f.x'), { unit: 'mm' }), field('relY', t('f.y'), { unit: 'mm' })));
      kids.push(h('div', { class: 'cv-row' }, choice('relTool', t('f.tool'), [['ball', t('tool.ballname')], ['flat', t('tool.flatname')], ['v', t('tool.vname')]]), S.relTool === 'v' ? field('relAngle', t('f.angle'), { unit: '°', min: 10 }) : field('relDia', t('f.dia'), { unit: 'mm', min: 0.1 }), S.relTool !== 'v' ? field('relStep', t('f.stepover'), { unit: '%', min: 1 }) : null, choice('relDir', t('f.dir'), [['x', t('dir.x')], ['y', t('dir.y')]])));
      kids.push(h('div', { class: 'cv-row' }, check('relRough', t('f.rough')), S.relRough ? [field('relRoughDia', t('f.roughdia'), { unit: 'mm', min: 0.5 }), field('relStepdown', t('f.stepdown'), { unit: 'mm', min: 0.1 }), field('relLeave', t('f.leave'), { unit: 'mm', min: 0 })] : null));
    }
    // cutting
    kids.push(h('h4', {}, t('sec.cut')));
    kids.push(h('div', { class: 'cv-row' }, field('feed', t('f.feed'), { unit: 'mm/min', min: 1 }), field('plunge', t('f.plunge'), { unit: 'mm/min', min: 1 }), field('rpm', t('f.rpm'), { min: 100 }), field('safeZ', t('f.safez'), { unit: 'mm', min: 1 }), field('clearZ', t('f.clearz'), { unit: 'mm', min: 0 })));
    kids.push(h('div', { class: 'cv-row' }, choice('unit', t('f.unit'), [['mm', t('unit.mm')], ['in', t('unit.in')]]), field('bedW', t('f.bedw'), { unit: 'mm', min: 0 }), field('bedH', t('f.bedh'), { unit: 'mm', min: 0 })));
    // post
    const post = postOf();
    kids.push(h('h4', {}, t('sec.post')));
    kids.push(h('div', { class: 'cv-row' }, choice('post', t('f.post'), Object.values(POSTS).map((p) => [p.id, p.name])), h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-cv': 'post-reset', onclick: () => { S.postEdit = null; save(); render(); } }, t('post.reset'))));
    const lines = (key, label) => h('label', { style: 'display:block' }, label, h('textarea', { 'data-cv-post': key, onchange: (e) => { const f = { ...((S.postEdit && S.postEdit.base === S.post && S.postEdit.fields) || {}) }; f[key] = key === 'spindleOn' || key === 'spindleOff' ? e.target.value : e.target.value.split('\n'); S.postEdit = { base: S.post, fields: f }; save(); } }, Array.isArray(post[key]) ? post[key].join('\n') : post[key]));
    kids.push(h('details', {}, h('summary', {}, t('post.edit')), h('p', { class: 'cv-note' }, t('post.note')), lines('header', t('post.header')), lines('toolChange', t('post.toolchange')), lines('spindleOn', t('post.spindleon')), lines('spindleOff', t('post.spindleoff')), lines('footer', t('post.footer')),
      h('div', { class: 'cv-row' }, h('label', {}, h('input', { type: 'checkbox', checked: post.lineNumbers, 'data-cv-post': 'lineNumbers', onchange: (e) => { const f = { ...((S.postEdit && S.postEdit.base === S.post && S.postEdit.fields) || {}) }; f.lineNumbers = e.target.checked; S.postEdit = { base: S.post, fields: f }; save(); } }), t('post.numbers')))));
    // actions
    kids.push(h('div', { class: 'cv-row', style: 'margin-top:.8rem' }, h('button', { type: 'button', class: 'btn-plot btn-sm-cc', 'data-cv': 'make', onclick: () => { make(); } }, t('act.make')),
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-cv': 'draw', disabled: !R.plan || !host, onclick: () => { const r = app.draw(); R.message = t('cad.draw.done', { n: r.n }); say(R.message); render(); } }, t('act.draw')),
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-cv': 'erase', disabled: !host || !host.count(), onclick: () => { const n = host.erase(); R.message = t('cad.erase.done', { n }); render(); } }, t('act.erase')),
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-cv': 'download', disabled: !R.program, onclick: () => download() }, t('act.download'))));
    kids.push(h('div', { class: 'cv-row' }, h('label', {}, t('check.file'), h('input', { type: 'file', accept: '.gcode,.nc,.ngc,.tap,.txt,.cnc,text/plain', 'data-cv': 'checkfile', onchange: (e) => checkFile(e.target.files && e.target.files[0]) }))));
    if (R.ext) kids.push(R.ext.result.ok ? h('p', { 'data-cv-ext': 'ok' }, t('check.file.ok', { name: R.ext.name, cuts: R.ext.result.stats.cuts })) : h('div', { 'data-cv-ext': 'issues' }, h('p', { class: 'cv-warn' }, t('check.file.found', { name: R.ext.name, n: R.ext.result.issues.length })), h('ul', { class: 'cv-issues cv-warn' }, R.ext.result.issues.slice(0, 12).map((i) => h('li', {}, t('check.' + i.key) + (i.line ? ' (' + t('check.line', { n: i.line }) + ')' : ''))))));
    if (R.error) kids.push(h('p', { class: 'cv-err', role: 'alert', 'data-cv-error': '' }, R.error));
    if (R.message) kids.push(h('p', { 'data-cv-message': '' }, R.message));
    // result
    if (R.plan) {
      const st = R.plan.stats, g = R.program.stats;
      kids.push(h('h4', {}, t('sec.result')));
      const rows = [[t('r.ops'), R.plan.ops.map((o) => o.name + ' (' + o.paths.length + ')').join(', ')], [t('r.length'), t('r.lengthv', { cut: Math.round(g.cut), rapid: Math.round(g.rapid) })], [t('r.time'), t('r.timev', { m: Math.max(1, Math.round(g.minutes)) })], [t('r.lines'), g.lines]];
      if (R.plan.mode === 'vcarve') rows.push([t('r.flat'), st.wide ? t('r.flatyes', { d: (2 * st.dflat).toFixed(2), z: st.maxDepth }) : t('r.flatno')]);
      if (R.plan.mode === 'engrave') rows.push([t('r.width'), t('r.widthv', { w: st.width.toFixed(2) })]);
      if (R.plan.mode === 'relief') rows.push([t('r.cell'), t('r.cellv', { p: st.cell.toFixed(2), step: st.stepover.toFixed(2) }) + (st.scallop !== null ? ' ' + t('r.scallop', { s: st.scallop.toFixed(3) }) : '')]);
      kids.push(h('table', { 'data-cv-result': '' }, rows.map(([a, b]) => h('tr', {}, h('td', { class: 'cv-note' }, a), h('td', {}, b)))));
      const warns = (R.plan.warnings || []).map((k) => t(k));
      if (warns.length) kids.push(h('ul', { class: 'cv-warn' }, warns.map((w) => h('li', {}, w))));
      const pv = preview();
      if (pv) kids.push(h('div', {}, h('p', { class: 'cv-note' }, t('preview.note')), pv));
      // the check
      kids.push(h('h4', {}, t('sec.check')));
      kids.push(R.check.ok ? h('p', { 'data-cv-check': 'ok' }, t('check.ok', { cuts: R.check.stats.cuts })) : h('ul', { class: 'cv-issues cv-warn', 'data-cv-check': 'issues' }, R.check.issues.map((i) => h('li', {}, t('check.' + i.key) + (i.line ? ' (' + t('check.line', { n: i.line }) + ')' : '')))));
      kids.push(h('p', { class: 'cv-note' }, t('check.note')));
    }
    pane.replaceChildren(h('div', { class: 'cv', 'data-cv-root': '' }, kids));
    if (!pane.dataset.cvWatch) { pane.dataset.cvWatch = '1'; pane.addEventListener('pointerenter', refreshShapes); }
  }
  /** The drawing may have changed since the panel was drawn: read the shapes again (not while a field has focus) and redraw if they differ. */
  function refreshShapes() {
    if (!host || !pane || pane.contains(document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    const key = (s) => JSON.stringify([s.closed.length, s.open.length, s.layers.map((l) => [l.name, l.closed, l.open])]);
    const was = R.shapes ? key(R.shapes) : '';
    R.shapes = null;
    const now = readShapes();
    if (key(now) !== was) render();
  }

  async function checkFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const bed = num(S.bedW, 0) > 0 && num(S.bedH, 0) > 0 ? { x0: 0, y0: 0, x1: num(S.bedW, 0), y1: num(S.bedH, 0) } : null;
      R.ext = { name: String(file.name || '').slice(0, 60), result: checkProgram(text.slice(0, 20e6), { bed, maxDepth: R.plan ? R.plan.depth + 0.01 : null }) };
    } catch (e) { R.ext = null; R.error = t('carve.err.file'); }
    render();
  }
  async function loadImage(file) {
    if (!file) return;
    try {
      const bm = await createImageBitmap(file);
      const k = Math.min(1, 1200 / Math.max(bm.width, bm.height)), w = Math.max(2, Math.round(bm.width * k)), hgt = Math.max(2, Math.round(bm.height * k));
      const cv = document.createElement('canvas'); cv.width = w; cv.height = hgt;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, hgt); ctx.drawImage(bm, 0, 0, w, hgt);
      const px = ctx.getImageData(0, 0, w, hgt).data, data = new Float32Array(w * hgt);
      for (let i = 0; i < data.length; i++) data[i] = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;
      R.image = { w, h: hgt, data }; R.imageName = String(file.name || '').slice(0, 60);
      R.error = '';
    } catch (e) { R.image = null; R.error = t('carve.err.image'); }
    render();
  }

  // ------------------------------------------------------------------------------------------------ mounting
  styleEl = document.createElement('style'); styleEl.textContent = CSS; document.head.append(styleEl);
  api.ui.panelTab({ id: 'carving', title: t('tab'), render: (el) => { pane = el; render(); } });
  api.files.exporter({ id: 'gcode', label: t('export.gcode'), extension: 'gcode', mime: 'text/plain', write: async () => { const r = make(); if (!r.ok) throw new Error(r.message); return R.program.text; } });
  if (host && typeof host.start === 'function') { try { host.start(app); } catch (e) { api.log('host start failed', e); /* i18n-ignore */ } }
  api.onDeactivate(() => { pane = null; try { styleEl.remove(); } catch { /* no page */ } });
  window.ccCarving = { state: S, result: R, make, download, render, host };   // for the tests and the console
  api.log('Router carving ready');   // i18n-ignore (developer log)
}
