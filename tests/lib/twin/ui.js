/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — the panel's words are WORDS (words.js) through host.t; this file holds no sentences. */
/**
 * ui.js — the Digital twin panel (0.9 TW.10). The host hands in everything the app owns, so the panel is one for every host:
 *   mountTwin(el, host) → { refresh(), load(setup), destroy(), …what the browser test drives }
 *   host = { t, flow: {Sim, simulate, buildGraph, cleanLayout, newLayout, addAfter, defaults, makePlayer}, layout(), setLayout(L), onLayout(fn), flowOn(),
 *            load(), save(setup), view: { make() → TwinView | null, hideFlow(bool), redraw(), canvas() }, model: { addBodies, removeBodies, paths(group) }, timeline: { anim(), load(anim), lib } | null,
 *            behaviours: { parts() → [{key, name}], faces(key) → faceTable(), matrix(key), pick(cb), stopPick() } | null (TW.13),
 *            video: { support(w, h, fps), sink(o) } | null, download(name, data, type), pickFile(accept) → {name, text} | null, confirm(q) }
 */
import { WORDS } from './words.js';
import { ioList, starterProgram, Rig, runTest, stockTests, reportCsv, stName } from './commission.js';
import { rideLine, screenLine } from './physics.js';
import { compare, parsePatch, bottlenecks, suggestPatch } from './experiment.js';
import { equipmentParts, floorPart, robotBase, toBodies, loadSize, loadColor, COLORS, seated } from './equipment.js';
import { sampleTracks, bakeAnim } from './bake.js';
import { usdaOf } from './usd.js';
import { CELLS, buildCell, billOfMaterials, bomCsv } from './templates.js';
import { parseMeasured, compareMeasured, compareCsv } from './measured.js';
import { cleanBehaviours, matchFace, runConveyor, runJoint, runScene, faceAxes, describeFace } from './behaviours.js';

export const CSS = `
.twin{font-size:.86rem;display:flex;flex-direction:column;gap:.5rem}
.twin p{margin:.2rem 0}
.twin .tw-note{opacity:.75;font-size:.8rem}
.twin details{border:1px solid var(--ws-line,#8884);border-radius:4px;padding:.3rem .5rem}
.twin summary{cursor:pointer;font-weight:600;padding:.15rem 0}
.twin .tw-row{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;margin:.3rem 0}
.twin label{display:inline-flex;gap:.3rem;align-items:center}
.twin input[type=number]{width:4.6rem}
.twin input[type=range]{flex:1;min-width:6rem}
.twin textarea{width:100%;min-height:8rem;font-family:ui-monospace,Consolas,monospace;font-size:.76rem;box-sizing:border-box}
.twin table{border-collapse:collapse;width:100%;font-size:.78rem}
.twin th,.twin td{padding:.1rem .3rem;border-bottom:1px solid var(--ws-line,#8883);text-align:left;vertical-align:top;overflow-wrap:anywhere}
.twin .tw-scroll{max-height:14rem;overflow:auto}
.twin .tw-ok{color:#2b8a3e;font-weight:600}.twin .tw-bad{color:#c92a2a;font-weight:600}
.twin button{cursor:pointer}
.twin code{font-size:.76rem}
`;

const FAULTS = ['belt-stop', 'station-down', 'gate-stuck', 'sensor-stuck', 'estop'];
const LOOKS = ['machine', 'robot', 'palletizer', 'operator'];
const num3 = (x) => (Number.isFinite(x) ? String(+x.toFixed(2)) : '-');

export function mountTwin(el, host) {
  const t = (k, v) => { const s = host.t(k, v); if (s !== k) return s; let w = WORDS[k] || k; for (const [a, b] of Object.entries(v || {})) w = w.split('{' + a + '}').join(String(b)); return w; };
  const h = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'text') n.textContent = v; else if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k === 'value') n.value = v; else if (k === 'checked' || k === 'disabled' || k === 'open' || k === 'selected') n[k] = !!v; else n.setAttribute(k, v);
    }
    for (const c of kids.flat(Infinity)) if (c !== null && c !== undefined && c !== false) n.append(c);
    return n;
  };
  const flow = host.flow;
  let S = { looks: {}, show: false, minutes: 10, seed: 1, program: '', variants: '', load: { l: 0.5, w: 0.4, h: 0.25, mass: 12, mu: 0.5 }, guards: false, count: 1, runs: 5, hours: 8, warmup: 30, video: { from: 0, seconds: 20 }, ...(host.load() || {}) };
  S.behaviours = cleanBehaviours(S.behaviours).list;
  const save = () => host.save({ behaviours: S.behaviours, looks: S.looks, show: S.show, minutes: S.minutes, seed: S.seed, program: S.program, variants: S.variants, load: S.load, guards: S.guards, count: S.count, runs: S.runs, hours: S.hours, warmup: S.warmup, video: S.video, measUnit: S.measUnit, measSkip: S.measSkip });
  const open = { show: true };
  const R = { player: null, result: null, playT: 0, playing: false, speed: 8, raf: 0, rig: null, rigPlayer: null, rigFaults: [], rigMsg: '', tests: null, ride: null, cmp: null, cmpBusy: null, meas: null, measRes: null, measErr: null, msg: {}, bh: { kind: 'conveyor', picked: null, picking: false, dirName: 'long', speed: 0.5, type: 'turn', min: -90, max: 90, home: 0, rate: 30, range: 2, status: {}, results: {}, msg: '' }, forces: {}, faultKind: 'belt-stop', faultEl: '', baked: false, cell: CELLS[0].id, phySource: '', tv: null };

  const L = () => host.layout();
  const built = () => { const l = L(); return l && l.items && l.items.length ? flow.buildGraph(l) : null; };
  const stations = () => (L()?.items || []).filter((i) => i.kind === 'station');

  // ---------------------------------------------------------------------------------------------- drawing
  function tv() { if (!R.tv) R.tv = host.view.make(); return R.tv; }
  function drawEquipment() {
    const b = built();
    if (!S.show || !b) { if (R.tv) { R.tv.dispose(); R.tv = null; } host.view.hideFlow(false); return; }
    const v = tv(); if (!v) return;
    const parts = equipmentParts(L(), b, { looks: S.looks });
    const robots = stations().filter((s) => ['robot', 'palletizer'].includes(S.looks[s.id])).map((s) => { const r = robotBase(b.geom[s.id]); return { item: s.id, base: r.base, yaw: r.yaw }; });
    v.setEquipment(parts, { floor: floorPart(parts), robots });
    host.view.hideFlow(true);
    v.drawFrame(R.player ? R.player.frame(R.playT) : null, R.playT, busyOf(R.player ? R.player.frame(R.playT) : null));
  }
  function busyOf(frame) {
    const b = built(), out = new Set(); if (!frame || !b) return out;
    for (const s of stations()) { const g = b.geom[s.id]; if (frame.loads.some((l) => Math.hypot(l.p[0] - g.x, l.p[1] - g.y) < 0.3)) out.add(s.id); }
    return out;
  }
  function showAt(p, time) {
    if (!S.show) { S.show = true; save(); drawEquipment(); }
    const v = tv(); if (!v) return null;
    const f = p.frame(time);
    return { frame: f, ...v.drawFrame(f, time, busyOf(f)) };
  }
  function tick(prev) {
    R.raf = requestAnimationFrame((now) => {
      if (!R.playing) return;
      const dt = Math.min(0.1, (now - (prev || now)) / 1000);
      R.playT = Math.min(R.playT + dt * R.speed, R.player ? R.player.until : 0);
      if (R.player) showAt(R.player, R.playT);
      if (slider) { slider.value = R.playT; if (timeLbl) timeLbl.textContent = R.playT.toFixed(1) + ' s'; }
      if (R.player && R.playT >= R.player.until) { R.playing = false; render(); return; }
      tick(now);
    });
  }
  let slider = null, timeLbl = null;

  function runShow() {
    const b = built(); if (!b) return;
    if (b.problems.length) { R.msg.show = t('twin.problems', { list: b.problems.map((p) => p.code).join(', ') }); render(); return; }
    const until = S.minutes * 60;
    const r = flow.simulate(b.graph, { seed: S.seed, until, traceUntil: until });
    if (r.problems) { R.msg.show = t('twin.problems', { list: r.problems.map((p) => p.code).join(', ') }); render(); return; }
    R.result = r; R.player = seated(flow.makePlayer(r.trace, b), b); R.playT = 0; R.playing = false;
    R.msg.show = r.ok ? t('twin.show.ran', { done: r.done, perHour: num3(r.perHour) }) : t('twin.show.failed', { why: r.failed.code });
    if (r.ok && !r.done && ioList(b.graph).outputs.length) R.msg.show += ' ' + t('twin.show.plcGate');
    if (!S.show) { S.show = true; save(); }
    drawEquipment(); render();
  }

  // ---------------------------------------------------------------------------------------------- pictures and video
  async function saveVideo() {
    if (!R.player || !host.video) { R.msg.out = t(host.video ? 'twin.show.needRun' : 'twin.out.videoNo'); render(); return; }
    const c = host.view.canvas(), fps = 30, w = c.width, ht = c.height, n = Math.max(1, Math.round(S.video.seconds * fps));
    const sup = await host.video.support(w, ht, fps);
    const sink = await host.video.sink({ kind: sup.mp4 ? 'mp4' : sup.webm ? 'webm' : 'png', w, h: ht, fps });
    for (let i = 0; i < n; i++) {
      const time = S.video.from + (i / fps);
      showAt(R.player, Math.min(time, R.player.until));
      host.view.redraw();
      await sink.add(c, i);
      if (i % 15 === 0) { R.msg.out = t('twin.out.videoBusy', { n: i, m: n }); paintMsg('out'); await new Promise((res) => setTimeout(res, 0)); }
    }
    const f = await sink.finish();
    host.download('digital-twin.' + f.ext, f.blob, f.mime);
    R.msg.out = t('twin.out.videoDone', { kind: f.ext }); render();
    return f;
  }
  function tracks() { const p = R.player, from = Math.min(S.video.from, p.until), to = Math.min(from + S.video.seconds, p.until); return sampleTracks(p, { from, to, fps: 15, maxLoads: 150 }); }
  async function bake() {
    const b = built(); if (!b) return;
    if (!R.player) { R.msg.out = t('twin.show.needRun'); render(); return; }
    if (!host.model || !host.model.addBodies) { R.msg.out = t('twin.out.bakeNo'); render(); return; }
    const parts = equipmentParts(L(), b, { looks: S.looks, detail: 'light' }), fl = floorPart(parts);
    await host.model.addBodies('twin-equipment', toBodies(fl ? [fl, ...parts] : parts), { name: t('twin.show.title'), label: t('twin.out.bake') });
    const tr = tracks(), bodies = [];
    for (const l of tr.loads) { const s = loadSize(l.L); bodies.push(...toBodies([{ c: [0, 0, 0], s: [s.l, s.w, s.h], yaw: 0, pitch: 0, shape: 'box', col: loadColor(l.type), item: 'load' }], { in: 'load-' + l.id })); }
    for (const v of tr.vehicles) bodies.push(...toBodies([{ c: [0, 0, 0.125], s: [1, 0.7, 0.25], yaw: 0, pitch: 0, shape: 'box', col: COLORS.vehicle, item: 'vehicle' }], { in: 'vehicle-' + v.n }));
    if (bodies.length) await host.model.addBodies('twin-loads', bodies, { name: t('twin.p.count'), label: t('twin.out.bake') });
    const paths = host.model.paths('twin-loads');
    const A = host.timeline.lib;
    let anim = { ...A.emptyAnim(Math.max(0.5, tr.length), 30), camera: host.timeline.anim()?.camera || [] };
    anim = bakeAnim(tr, (x) => paths.get(x.n ? 'vehicle-' + x.n : 'load-' + x.id) || null, anim, A);
    host.timeline.load(anim);
    R.baked = true;
    R.msg.out = t('twin.out.baked', { parts: parts.length, loads: tr.loads.length, dropped: tr.dropped });
    render();
    return { parts: parts.length, loads: tr.loads.length, tracks: anim.objects.length };
  }
  async function unbake() {
    await host.model.removeBodies('twin-equipment', { label: t('twin.out.unbake') });
    await host.model.removeBodies('twin-loads', { label: t('twin.out.unbake') });
    if (host.timeline) host.timeline.load(null);
    R.baked = false; R.msg.out = t('twin.out.unbaked'); render();
  }
  function saveUsd() {
    const b = built();
    if (!R.player || !b) { R.msg.out = t('twin.show.needRun'); render(); return null; }
    const tr = tracks(), parts = equipmentParts(L(), b, { looks: S.looks, detail: 'light' }), fl = floorPart(parts);
    const text = usdaOf({ parts: fl ? [fl, ...parts] : parts, tracks: tr, name: 'CadCraft run', fps: 30 });
    host.download('digital-twin-run.usda', text, 'model/vnd.usda');
    R.msg.out = t('twin.out.usdDone', { name: 'digital-twin-run.usda', loads: tr.loads.length, s: num3(tr.length) }); render();
    return text;
  }

  // ---------------------------------------------------------------------------------------------- controls
  const graph = () => { const b = built(); return b && !b.problems.length ? b.graph : null; };
  const program = () => S.program || (graph() ? starterProgram(graph()) : '');
  function makeRig(trace = 0) { return new Rig({ Sim: flow.Sim, graph: graph(), program: program(), seed: S.seed, until: 3600 * 24, traceUntil: trace, cycleMs: 50 }); }
  function startRig() {
    stopRig(true);
    const g = graph(); if (!g) return;
    const rig = makeRig(3600);
    R.rig = rig; R.rigFaults = []; R.rigMsg = '';
    if (rig.problems.length) { R.rigMsg = t('twin.c.problems', { list: rig.problems.map((p) => p.text || p.id).join('; ') }); R.rig = null; render(); return; }
    for (const [name, v] of Object.entries(R.forces)) rig.force(name, v);
    R.rigPlayer = seated(flow.makePlayer(rig.sim.trace, built(), { live: true }), built());
    render();
    let prev = 0;
    const loop = (now) => {
      if (R.rig !== rig) return;
      const dt = prev ? Math.min(0.1, (now - prev) / 1000) : 0; prev = now;
      rig.run(dt * R.speed);
      showAt(R.rigPlayer, rig.t);
      paintRig();
      R.raf = requestAnimationFrame(loop);
    };
    R.raf = requestAnimationFrame(loop);
    return rig;
  }
  function stopRig(quiet) { if (R.rig) { R.rig = null; R.rigPlayer = null; R.rigFaults = []; cancelAnimationFrame(R.raf); if (!quiet) render(); } }
  let ioCells = new Map(), rigLine = null;
  function paintRig() {
    if (!R.rig) return;
    for (const [name, td] of ioCells) { const v = R.rig.value(name); td.textContent = v === undefined ? '' : String(v); }
    if (rigLine) {
      const s = R.rig.summary(), st = R.rig.findings.filter((f) => f.code === 'stalled').pop();
      rigLine.textContent = t('twin.c.status', { t: s.t.toFixed(0), done: s.done, inside: s.inside, scans: s.scans }) + (R.rig.stalled && st ? ' ' + t('twin.c.stalled', { t: st.t.toFixed(0), since: st.since.toFixed(0), inside: st.inside }) : '');
    }
  }
  async function runAllTests() {
    const g = graph(); if (!g) return null;
    stopRig(true);
    const list = stockTests(g), results = [];
    for (let i = 0; i < list.length; i++) {
      R.msg.tests = t('twin.c.testsBusy', { n: i + 1, m: list.length }); paintMsg('tests');
      await new Promise((res) => setTimeout(res, 0));
      results.push({ ...runTest(() => makeRig(0), list[i]), id: list[i].id });
    }
    R.tests = results;
    R.msg.tests = t('twin.c.testsDone', { p: results.filter((r) => r.passed).length, n: results.length });
    render();
    return results;
  }

  // ---------------------------------------------------------------------------------------------- physics
  function ride() {
    const l = L(), b = built(); if (!b) return null;
    const src = R.phySource && l.items.some((i) => i.id === R.phySource) ? R.phySource : (l.items.find((i) => i.kind === 'source') || {}).id;
    if (!src) return null;
    stopRig(true); R.playing = false;
    const out = rideLine(l, b, src, S.load, { guards: S.guards, count: Math.max(1, Math.min(8, S.count)), maxS: 240 });
    R.ride = { ...out, screen: screenLine(l, b, src, S.load) };
    render(); replay();
    return R.ride;
  }
  function replay() {
    const r = R.ride; if (!r || !r.frames.length) return;
    if (!S.show) { S.show = true; save(); drawEquipment(); }
    const v = tv(); if (!v) return;
    cancelAnimationFrame(R.raf);
    let i = 0;
    const loop = () => {
      if (!R.ride || i >= r.frames.length) return;
      v.drawBodies(r.frames[i].bodies.map((b) => ({ ...b, half: r.half })));
      i += 2;
      R.raf = requestAnimationFrame(loop);
    };
    R.raf = requestAnimationFrame(loop);
    v.drawBodies(r.frames[0].bodies.map((b) => ({ ...b, half: r.half })));
  }

  // ---------------------------------------------------------------------------------------------- compare
  function readVariants() {
    const variants = [], bad = [];
    for (const line of String(S.variants).split('\n')) {
      const s = line.trim(); if (!s) continue;
      const m = /^([^:]+):(.*)$/.exec(s);
      if (!m) { bad.push(s); continue; }
      const p = parsePatch(m[2]);
      bad.push(...p.bad);
      if (p.patch.length) variants.push({ name: m[1].trim(), patch: p.patch });
    }
    return { variants, bad };
  }
  async function runCompare() {
    const l = L(); if (!l) return null;
    const { variants, bad } = readVariants();
    const job = { cancelled: false, p: 0 }; R.cmpBusy = job; R.cmp = null; R.msg.cmp = bad.length ? t('twin.e.bad', { list: bad.join('; ') }) : ''; render();
    const r = await compare({ layout: l, variants, flow: { buildGraph: flow.buildGraph, simulate: flow.simulate, cleanLayout: flow.cleanLayout }, runs: S.runs, hours: S.hours, warmup: S.warmup, seed: S.seed,
      onProgress: (p) => { job.p = p; R.msg.cmpBusy = t('twin.e.busy', { p: Math.round(p * 100) }); paintMsg('cmpBusy'); }, isCancelled: () => job.cancelled });
    R.cmpBusy = null; R.msg.cmpBusy = '';
    if (!r.cancelled) R.cmp = r;
    render();
    return r;
  }
  const verdict = (d) => (!d ? '' : d.verdict === 'better' ? t('twin.e.better') : d.verdict === 'worse' ? t('twin.e.worse') : t('twin.e.same'));

  // ---------------------------------------------------------------------------------------------- the panel
  const msgEls = {};
  const msgP = (k, cls = 'tw-note') => { const p = h('p', { class: cls, 'data-tw-msg': k, text: R.msg[k] || '' }); msgEls[k] = p; return p; };
  const paintMsg = (k) => { if (msgEls[k]) msgEls[k].textContent = R.msg[k] || ''; };
  const number = (label, get, set, o = {}) => h('label', {}, label, h('input', { type: 'number', value: get(), min: o.min, max: o.max, step: o.step || 'any', 'data-tw': o.id, onchange: (e) => { const v = Number(e.target.value); if (Number.isFinite(v)) { set(v); save(); } } }));
  const section = (id, title, ...kids) => h('details', { open: !!open[id], 'data-tw-section': id, ontoggle: (e) => { open[id] = e.target.open; } }, h('summary', { text: title }), ...kids);
  const btn = (text, onclick, o = {}) => h('button', { type: 'button', text, onclick, disabled: o.disabled, title: o.title, 'data-tw': o.id });

  function viewCell() {
    const pick = h('select', { 'data-tw': 'cell', onchange: (e) => { R.cell = e.target.value; } }, CELLS.map((c) => h('option', { value: c.id, selected: c.id === R.cell, text: t('twin.cell.' + c.id) })));
    const use = () => {
      if (L() && L().items.length && !host.confirm(t('twin.cell.ask'))) return;
      const r = buildCell(R.cell, flow);
      S.looks = r.looks; S.program = ''; R.player = null; R.result = null; R.tests = null; R.ride = null; R.cmp = null; R.msg = {}; stopRig(true);
      host.setLayout(r.layout);
      R.msg.cell = t('twin.cell.done', { name: t('twin.cell.' + R.cell) }); S.show = true; save(); drawEquipment(); render();
    };
    return h('div', {}, h('div', { class: 'tw-row' }, h('strong', { text: t('twin.cell.title') }), pick, btn(t('twin.cell.use'), use, { id: 'cell-use' })), msgP('cell'));
  }
  function viewShow() {
    const b = built();
    const looks = stations().length ? h('table', {}, h('tr', {}, h('th', { text: t('twin.show.looks'), colspan: 2 })), stations().map((s) => h('tr', {}, h('td', { text: s.id }), h('td', {},
      h('select', { 'data-tw-look': s.id, onchange: (e) => { S.looks[s.id] = e.target.value; save(); drawEquipment(); } }, LOOKS.map((k) => h('option', { value: k, selected: (S.looks[s.id] || 'machine') === k, text: t('twin.look.' + k) }))))))) : null;
    slider = R.player ? h('input', { type: 'range', min: 0, max: R.player.until, step: 0.1, value: R.playT, 'data-tw': 'time', oninput: (e) => { R.playing = false; R.playT = Number(e.target.value); showAt(R.player, R.playT); if (timeLbl) timeLbl.textContent = R.playT.toFixed(1) + ' s'; } }) : null;
    timeLbl = R.player ? h('span', { text: R.playT.toFixed(1) + ' s', 'data-tw': 'time-label' }) : null;
    return section('show', t('twin.show.title'),
      h('div', { class: 'tw-row' }, h('label', { title: t('twin.show.onHint') }, h('input', { type: 'checkbox', checked: S.show, 'data-tw': 'show', onchange: (e) => { S.show = e.target.checked; save(); drawEquipment(); } }), t('twin.show.on'))),
      looks,
      h('div', { class: 'tw-row' }, number(t('twin.show.minutes'), () => S.minutes, (v) => { S.minutes = Math.max(0.5, Math.min(240, v)); }, { min: 0.5, max: 240, id: 'minutes' }), number(t('twin.show.seed'), () => S.seed, (v) => { S.seed = Math.round(v); }, { step: 1, id: 'seed' }), btn(t('twin.show.run'), runShow, { disabled: !b, id: 'run' })),
      msgP('show'),
      R.player ? h('div', { class: 'tw-row' }, btn(R.playing ? t('twin.show.pause') : t('twin.show.play'), () => { R.playing = !R.playing; if (R.playing) { if (R.playT >= R.player.until) R.playT = 0; tick(); } render(); }, { id: 'play' }), slider, timeLbl,
        h('label', {}, t('twin.show.speed'), h('select', { 'data-tw': 'speed', onchange: (e) => { R.speed = Number(e.target.value); } }, [1, 2, 4, 8, 16, 32, 64].map((n) => h('option', { value: n, selected: n === R.speed, text: n + '×' }))))) : null,
      h('p', { class: 'tw-note', text: t('twin.out.note') }),
      h('div', { class: 'tw-row' }, number(t('twin.out.from'), () => S.video.from, (v) => { S.video.from = Math.max(0, v); }, { min: 0, id: 'from' }), number(t('twin.out.seconds'), () => S.video.seconds, (v) => { S.video.seconds = Math.max(1, Math.min(300, v)); }, { min: 1, max: 300, id: 'seconds' })),
      h('div', { class: 'tw-row' }, btn(t('twin.out.video'), saveVideo, { id: 'video', disabled: !R.player }), btn(t('twin.out.bake'), bake, { id: 'bake', title: t('twin.out.bakeHint'), disabled: !R.player }), R.baked ? btn(t('twin.out.unbake'), unbake, { id: 'unbake' }) : null, btn(t('twin.out.usd'), saveUsd, { id: 'usd', disabled: !R.player })),
      msgP('out'));
  }
  function viewControls() {
    const g = graph();
    if (!g) return section('controls', t('twin.c.title'), h('p', { class: 'tw-note', text: t('twin.noLayout') }));
    const io = ioList(g);
    ioCells = new Map();
    const row = (p) => {
      const td = h('td', { text: R.rig ? String(R.rig.value(p.name) ?? '') : '' }); ioCells.set(p.name, td);
      const canForce = p.type === 'BOOL';
      return h('tr', {}, h('td', {}, h('code', { text: p.name })), h('td', {}, h('code', { text: p.addr })), td, h('td', {}, canForce ? h('select', { 'data-tw-force': p.name, onchange: (e) => {
        const v = e.target.value; if (v === '') { delete R.forces[p.name]; if (R.rig) R.rig.unforce(p.name); } else { R.forces[p.name] = v === '1'; if (R.rig) R.rig.force(p.name, v === '1'); }
      } }, h('option', { value: '', text: t('twin.c.forceNone') }), h('option', { value: '1', selected: R.forces[p.name] === true, text: t('twin.c.forceOn') }), h('option', { value: '0', selected: R.forces[p.name] === false, text: t('twin.c.forceOff') })) : null));
    };
    const area = h('textarea', { 'data-tw': 'program', value: program(), spellcheck: 'false', onchange: (e) => { S.program = e.target.value; save(); } });
    const targets = (k) => { const type = { 'belt-stop': 'conveyor', 'station-down': 'station', 'gate-stuck': 'gate', 'sensor-stuck': 'sensor' }[k]; return type ? g.elements.filter((e) => e.type === type && (type !== 'gate' || e.mode === 'plc')).map((e) => e.id) : []; };
    const list = targets(R.faultKind);
    const faultEl = list.length ? h('select', { 'data-tw': 'fault-el', onchange: (e) => { R.faultEl = e.target.value; } }, list.map((id) => h('option', { value: id, selected: id === R.faultEl, text: id }))) : null;
    const apply = () => {
      if (!R.rig) return;
      const element = list.includes(R.faultEl) ? R.faultEl : list[0];
      const spec = { kind: R.faultKind, ...(element ? { element } : {}), ...(R.faultKind === 'sensor-stuck' ? { key: 'standing', value: true } : {}) };
      R.rigFaults.push({ id: R.rig.fault(spec), spec }); render();
    };
    return section('controls', t('twin.c.title'),
      h('p', { class: 'tw-note', text: t('twin.c.intro') }),
      io.outputs.length ? null : h('p', { class: 'tw-bad', text: t('twin.c.needGate') }),
      h('label', { style: 'display:block', text: t('twin.c.program') }), area,
      h('div', { class: 'tw-row' }, btn(t('twin.c.starter'), () => { S.program = starterProgram(g); save(); render(); }, { id: 'starter' }),
        btn(t('twin.c.open'), async () => { const f = await host.pickFile('.st,.xml,.txt'); if (f) { S.program = f.text; save(); render(); } }, { id: 'open-program', title: t('twin.c.openHint') }),
        btn(t('twin.c.save'), () => host.download('program.st', program(), 'text/plain'), { id: 'save-program' })),
      h('div', { class: 'tw-row' }, R.rig ? btn(t('twin.c.stop'), () => stopRig(false), { id: 'rig-stop' }) : btn(t('twin.c.start'), startRig, { id: 'rig-start' }),
        h('label', {}, t('twin.show.speed'), h('select', { onchange: (e) => { R.speed = Number(e.target.value); } }, [1, 2, 4, 8, 16, 32, 64].map((n) => h('option', { value: n, selected: n === R.speed, text: n + '×' }))))),
      R.rigMsg ? h('p', { class: 'tw-bad', 'data-tw-msg': 'rig', text: R.rigMsg }) : null,
      (rigLine = h('p', { class: 'tw-note', 'data-tw-msg': 'rig-status' })),
      R.rig && R.rig.unbound.length ? h('p', { class: 'tw-note', text: t('twin.c.unbound', { list: R.rig.unbound.join(', ') }) }) : null,
      h('details', {}, h('summary', { text: t('twin.c.io', { n: io.inputs.length + io.outputs.length }) }), h('div', { class: 'tw-scroll' }, h('table', {}, h('tr', {}, ['twin.c.signal', 'twin.c.addr', 'twin.c.value', 'twin.c.force'].map((k) => h('th', { text: t(k) }))), [...io.inputs, ...io.outputs].map(row)))),
      h('div', { class: 'tw-row' }, h('strong', { text: t('twin.c.faults') }), h('select', { 'data-tw': 'fault-kind', onchange: (e) => { R.faultKind = e.target.value; R.faultEl = ''; render(); } }, FAULTS.map((k) => h('option', { value: k, selected: k === R.faultKind, text: t('twin.fault.' + k) }))), faultEl, btn(t('twin.c.apply'), apply, { id: 'fault-apply', disabled: !R.rig })),
      R.rigFaults.map((f) => h('div', { class: 'tw-row' }, h('span', { text: t('twin.c.active', { what: t('twin.fault.' + f.spec.kind) + (f.spec.element ? ' ' + f.spec.element : '') }) }), btn(t('twin.c.clear'), () => { if (R.rig) R.rig.clear(f.id); R.rigFaults = R.rigFaults.filter((x) => x !== f); render(); }, { id: 'fault-clear' }))),
      h('div', { class: 'tw-row' }, h('strong', { text: t('twin.c.tests') }), btn(t('twin.c.runTests'), runAllTests, { id: 'tests' }), R.tests ? btn(t('twin.c.csv'), () => host.download('digital-twin-tests.csv', reportCsv(R.tests), 'text/csv'), { id: 'tests-csv' }) : null),
      msgP('tests'),
      R.tests ? h('div', { class: 'tw-scroll' }, h('table', { 'data-tw': 'tests-table' }, R.tests.map((r) => [
        h('tr', {}, h('td', { text: t('twin.test.' + r.id) }), h('td', { class: r.passed ? 'tw-ok' : 'tw-bad', text: t(r.passed ? 'twin.c.pass' : 'twin.c.fail') })),
        ...r.checks.filter((c) => !c.ok).map((c) => h('tr', {}, h('td', { colspan: 2, class: 'tw-note', text: `${c.what}: ${t('twin.c.found')} ${c.found}` }))),
        ...(r.problems || []).map((p) => h('tr', {}, h('td', { colspan: 2, class: 'tw-note', text: p.text || p.id }))),
      ]))) : null,
      h('p', { class: 'tw-note', text: t('twin.c.real') }));
  }
  function viewPhysics() {
    const l = L(), sources = (l?.items || []).filter((i) => i.kind === 'source');
    const r = R.ride;
    return section('physics', t('twin.p.title'),
      h('p', { class: 'tw-note', text: t('twin.p.intro') }),
      h('div', { class: 'tw-row' }, h('label', {}, t('twin.p.from'), h('select', { 'data-tw': 'phy-from', onchange: (e) => { R.phySource = e.target.value; } }, sources.map((s) => h('option', { value: s.id, selected: s.id === R.phySource, text: s.id })))),
        number(t('twin.p.l'), () => S.load.l, (v) => { S.load.l = Math.max(0.05, v); }, { id: 'p-l' }), number(t('twin.p.w'), () => S.load.w, (v) => { S.load.w = Math.max(0.05, v); }, { id: 'p-w' }), number(t('twin.p.h'), () => S.load.h, (v) => { S.load.h = Math.max(0.02, v); }, { id: 'p-h' }),
        number(t('twin.p.mass'), () => S.load.mass, (v) => { S.load.mass = Math.max(0.1, v); }, { id: 'p-m' }), number(t('twin.p.mu'), () => S.load.mu, (v) => { S.load.mu = Math.max(0.02, Math.min(2, v)); }, { id: 'p-mu', step: 0.05 }), number(t('twin.p.count'), () => S.count, (v) => { S.count = Math.max(1, Math.min(8, Math.round(v))); }, { min: 1, max: 8, step: 1, id: 'p-n' }),
        h('label', {}, h('input', { type: 'checkbox', checked: S.guards, 'data-tw': 'p-guards', onchange: (e) => { S.guards = e.target.checked; save(); } }), t('twin.p.guards'))),
      h('div', { class: 'tw-row' }, btn(t('twin.p.run'), ride, { id: 'ride', disabled: !sources.length }), r && r.frames.length ? btn(t('twin.p.replay'), replay, { id: 'replay' }) : null),
      r ? h('p', { class: r.outcome === 'ok' ? 'tw-ok' : 'tw-bad', 'data-tw-msg': 'ride', text: t('twin.p.' + r.outcome, { at: r.at }) }) : null,
      r ? h('table', { 'data-tw': 'screen' }, h('tr', {}, ['twin.p.belt', 'twin.p.slope', 'twin.p.slipAt', 'twin.p.tipAt', 'twin.p.formula'].map((k) => h('th', { text: t(k) }))), r.screen.map((x) => h('tr', {}, h('td', { text: x.id }), h('td', { text: num3(x.pitchDeg) + '°' }), h('td', { text: num3(x.slipAtDeg) + '°' }), h('td', { text: num3(x.tipAtDeg) + '°' }), h('td', { class: x.issues.length ? 'tw-bad' : 'tw-ok', text: x.issues.length ? x.issues.map((i) => t('twin.issue.' + i)).join(', ') : t('twin.p.fine') })))) : null);
  }
  function viewCompare() {
    const r = R.cmp, b = built(), st = stations()[0];
    const area = h('textarea', { 'data-tw': 'variants', style: 'min-height:4rem', value: S.variants, spellcheck: 'false', onchange: (e) => { S.variants = e.target.value; save(); } });
    const fmtMH = (m) => (m && Number.isFinite(m.mean) ? num3(m.mean) + (Number.isFinite(m.half) ? ' ± ' + num3(m.half) : '') : '-');
    const rank = r && r.rows[0] && r.rows[0].last ? bottlenecks(r.rows[0].last).slice(0, 3) : [];
    const pushVariant = (b0) => { const p = suggestPatch(b0, L()); if (p) { S.variants = (S.variants ? S.variants.trimEnd() + '\n' : '') + `+1 at ${b0.id}: ${p}`; save(); render(); } };
    return section('compare', t('twin.e.title'),
      h('p', { class: 'tw-note', text: t('twin.e.intro') }),
      h('label', { style: 'display:block', text: t('twin.e.variants') }), area,
      st ? h('p', { class: 'tw-note', text: t('twin.e.example', { name: 'Faster', patch: `${st.id}.servers=2` }) }) : null,
      h('div', { class: 'tw-row' }, number(t('twin.e.runs'), () => S.runs, (v) => { S.runs = Math.max(1, Math.min(50, Math.round(v))); }, { min: 1, max: 50, step: 1, id: 'runs' }), number(t('twin.e.hours'), () => S.hours, (v) => { S.hours = Math.max(0.1, Math.min(200, v)); }, { id: 'hours' }), number(t('twin.e.warmup'), () => S.warmup, (v) => { S.warmup = Math.max(0, v); }, { id: 'warmup' }),
        R.cmpBusy ? btn(t('twin.e.cancel'), () => { R.cmpBusy.cancelled = true; }, { id: 'cmp-cancel' }) : btn(t('twin.e.run'), runCompare, { id: 'compare', disabled: !b })),
      msgP('cmpBusy'), msgP('cmp'),
      r ? (r.problems || []).map((p) => h('p', { class: 'tw-bad', text: t(p.code === 'missing' ? 'twin.e.missing' : p.code === 'layout' ? 'twin.e.layout' : 'twin.e.badRun', { name: p.variant, list: (p.items || [p.code]).join(', ') }) })) : null,
      r ? h('div', { class: 'tw-scroll' }, h('table', { 'data-tw': 'compare-table' }, h('tr', {}, ['twin.e.version', 'twin.e.perHour', 'twin.e.lead', 'twin.e.wip', 'twin.e.vs'].map((k) => h('th', { text: t(k) }))), r.rows.filter((x) => !x.skipped).map((x, i) => h('tr', {}, h('td', { text: i ? x.name : t('twin.e.base') }), h('td', { text: fmtMH(x.perHour) }), h('td', { text: fmtMH(x.leadMean) }), h('td', { text: fmtMH(x.wip) }), h('td', { text: i && x.diff ? `${t('twin.e.perHour')}: ${verdict(x.diff.perHour)}; ${t('twin.e.lead')}: ${verdict(x.diff.leadMean)}` : '' }))))) : null,
      r ? h('div', {}, h('strong', { text: t('twin.e.bottle') }), h('p', { class: 'tw-note', text: t('twin.e.bottleNote') }), rank.length ? h('table', { 'data-tw': 'bottle' }, h('tr', {}, ['twin.p.belt', 'twin.e.busyShare', 'twin.e.blocked', 'twin.e.queue', ''].map((k) => h('th', { text: k ? t(k) : '' }))), rank.map((x) => h('tr', {}, h('td', { text: x.id }), h('td', { text: Math.round(x.utilisation * 100) + ' %' }), h('td', { text: Math.round((x.blocked || 0) * 100) + ' %' }), h('td', { text: num3(x.queueMean) }), h('td', {}, suggestPatch(x, L()) ? btn(t('twin.e.try'), () => pushVariant(x), { id: 'try-' + x.id }) : null)))) : h('p', { class: 'tw-note', text: t('twin.e.none') })) : null);
  }
  // ---------------------------------------------------------------------------------------------- compare with a measured line (TW.12)
  const measWords = (e) => t('twin.m.err.' + e.code, { line: e.line, column: e.column, value: e.value });
  async function openMeasured() {
    const f = await host.pickFile('.csv,.txt'); if (!f) return;
    const p = parseMeasured(f.text, { timeUnit: S.measUnit || 's' });
    R.measRes = null;
    if (!p.ok) { R.meas = null; R.measErr = { file: f.name, error: p.error }; render(); return; }
    R.measErr = null; R.meas = { file: f.name, parsed: p };
    S.measFrom = p.points.includes(S.measFrom) ? S.measFrom : p.points[0]; S.measTo = p.points.includes(S.measTo) ? S.measTo : p.points[p.points.length - 1]; save(); render();
  }
  function runMeasured() {
    const l = L(); if (!l || !R.meas) return null;
    const r = compareMeasured({ parsed: R.meas.parsed, layout: l, flow: { buildGraph: flow.buildGraph, simulate: flow.simulate, cleanLayout: flow.cleanLayout }, from: S.measFrom, to: S.measTo, skip: S.measSkip || 0, seed: S.seed });
    R.measRes = r; render(); return r;
  }

  // ---------------------------------------------------------------------------------------------- behaviours on imported CAD (TW.13)
  const BH = () => host.behaviours || null;
  const bhFaces = (b) => { const A = BH(), part = A && A.parts().find((q) => q.key === b.part); if (!part) return { status: 'lost', why: 'no-part', face: null }; const faces = A.faces(b.part), m = matchFace(b.face, faces); return { ...m, M: A.matrix(b.part), part }; };
  function bhRecheck() {
    const st = {};
    for (const b of S.behaviours) {
      const m = bhFaces(b); st[b.id] = m;
      if (m.status === 'moved' && m.face) b.face = describeFace(m.face);
    }
    R.bh.status = st; R.bh.results = {};
    save();
  }
  function bhWhy(m) { return t('twin.bh.why.' + m.why, { count: m.count }); }
  function bhStatusText(m) {
    if (!m) return '';
    if (m.status === 'lost') return t('twin.bh.status.lost', { why: bhWhy(m) });
    if (m.status === 'changed') return t('twin.bh.status.changed', { pct: Math.round((m.ratio - 1) * 100) });
    return t('twin.bh.status.' + m.status);
  }
  function bhPick() {
    const A = BH(); if (!A) return;
    R.bh.picking = true; R.bh.msg = t('twin.bh.picking'); render();
    A.pick((hit) => {
      R.bh.picking = false;
      if (!hit) { R.bh.msg = ''; render(); return; }
      const f = A.faces(hit.part).find((q) => q.id === hit.face), part = A.parts().find((q) => q.key === hit.part);
      R.bh.picked = f ? { part: hit.part, partName: part ? part.name : '', face: describeFace(f) } : null;
      R.bh.msg = f ? t('twin.bh.picked', { face: f.id, part: part ? part.name : hit.part, kind: f.kind }) : '';
      render();
    });
  }
  function bhAdd() {
    const k = R.bh, pk = k.picked;
    if (!pk) { k.msg = t('twin.bh.err.pick'); render(); return null; }
    let n = 1; const ids = new Set(S.behaviours.map((b) => b.id)); while (ids.has(k.kind[0] + n)) n++;
    const b = { id: k.kind[0] + n, kind: k.kind, part: pk.part, partName: pk.partName, face: pk.face, on: true };
    if (k.kind === 'conveyor') {
      if (pk.face.kind !== 'plane') { k.msg = t('twin.bh.err.needs-plane'); render(); return null; }
      const ax = faceAxes(pk.face), neg = k.dirName.startsWith('-'), nm = k.dirName.replace('-', '');
      b.dir = (neg ? [-1, -1, -1] : [1, 1, 1]).map((s2, i) => s2 * ax[nm][i]); b.speed = k.speed; b.dirName = k.dirName;
    } else if (k.kind === 'joint') { Object.assign(b, { type: k.type, min: k.min, max: k.max, home: k.home, rate: k.rate }); }
    else { if (pk.face.kind !== 'plane') { k.msg = t('twin.bh.err.needs-plane'); render(); return null; } b.range = k.range; b.offset = 0.002; }
    const c = cleanBehaviours([b]);
    if (!c.list.length) { const why = c.dropped[0] && c.dropped[0].why; k.msg = t(why === 'needs-plane' || why === 'needs-axis' ? 'twin.bh.err.' + why : 'twin.bh.err.limits'); render(); return null; }
    S.behaviours.push(c.list[0]); k.msg = ''; k.picked = null; bhRecheck(); render();
    return c.list[0];
  }
  function bhRemove(id) { S.behaviours = S.behaviours.filter((b) => b.id !== id); delete R.bh.results[id]; bhRecheck(); render(); }
  const f2 = (x) => (Number.isFinite(x) ? String(+x.toFixed(3)) : '-');
  function bhTest(id) {
    const b = S.behaviours.find((q) => q.id === id); if (!b) return null;
    const m = bhFaces(b); R.bh.status[id] = m;
    let out;
    if (!m.face) out = { ok: false, text: bhStatusText(m) };
    else if (b.kind === 'conveyor') {
      const r = runConveyor(b, m.face, m.M, S.load), r2 = runConveyor(b, m.face, m.M, S.load, { v0: true });
      out = r.ok ? { ok: r.outcome === 'arrived', r, r2, text: t('twin.bh.res.conveyor', { t: f2(r.t), theory: f2(r.theory), outcome: t('twin.bh.outcome.' + r.outcome) }) + ' ' + t('twin.bh.res.conveyorV', { t: f2(r2.t), d: f2(r2.distance) }) } : { ok: false, text: t('twin.bh.err.' + r.code) };
    } else if (b.kind === 'joint') {
      const r = runJoint(b, b.max);
      out = { ok: true, r, text: t('twin.bh.res.joint', { target: b.max, rate: b.rate, t: f2(r.t), limit: r.limited ? t('twin.bh.res.jointLimit', { which: r.limited, value: r.value }) : '' }) };
    } else {
      const cs = S.behaviours.filter((q) => q.kind === 'conveyor' && q.on !== false).map((q) => ({ b: q, ...bhFaces(q) })).filter((q) => q.face).map((q) => ({ b: q.b, face: q.face, M: q.M }));
      if (!cs.length) out = { ok: false, text: t('twin.bh.err.no-conveyor') };
      else {
        const r = runScene({ conveyors: cs, sensors: [{ b, face: m.face, M: m.M }], load: S.load, v0: true });
        const ev = r.sensors[0].events, on = ev.find((e) => e.on), off = ev.find((e) => !e.on);
        out = { ok: !!on, r, text: on ? t('twin.bh.res.sensor', { on: f2(on.t), off: off ? f2(off.t) : '-' }) : t('twin.bh.res.sensorNone') };
      }
    }
    R.bh.results[id] = out; render();
    return out;
  }
  function viewBehaviours() {
    const A = BH(), k = R.bh;
    if (!A) return null;
    const parts = A.parts();
    if (!parts.length) return section('behaviours', t('twin.bh.title'), h('p', { class: 'tw-note', text: t('twin.bh.noParts') }));
    const sel = (key, opts, label, get, set) => h('label', {}, label, h('select', { 'data-tw': key, onchange: (e) => { set(e.target.value); render(); } }, opts.map(([v, tx]) => h('option', { value: v, selected: v === get(), text: tx }))));
    const num = (label, key, id) => number(label, () => k[key], (v) => { k[key] = v; }, { id, step: 'any' });
    const rows = S.behaviours.map((b) => {
      const m = R.bh.status[b.id] || (R.bh.status[b.id] = bhFaces(b)), res = k.results[b.id];
      return h('tr', { 'data-tw-bh': b.id }, h('td', {}, h('strong', { text: b.id }), ' ', t('twin.bh.kind.' + b.kind), h('br'), h('span', { class: 'tw-note', text: b.partName || b.part })),
        h('td', {}, h('span', { class: m.status === 'lost' ? 'tw-bad' : '', 'data-tw-bh-status': b.id, text: bhStatusText(m) }), res ? h('p', { class: res.ok ? 'tw-ok' : 'tw-bad', 'data-tw-bh-result': b.id, text: res.text }) : null),
        h('td', {}, btn(t('twin.bh.test'), () => bhTest(b.id), { id: 'bh-test-' + b.id }), ' ', btn(t('twin.bh.remove'), () => bhRemove(b.id), { id: 'bh-remove-' + b.id })));
    });
    return section('behaviours', t('twin.bh.title'),
      h('p', { class: 'tw-note', text: t('twin.bh.intro') }),
      h('div', { class: 'tw-row' }, sel('bh-kind', ['conveyor', 'joint', 'sensor'].map((x) => [x, t('twin.bh.kind.' + x)]), t('twin.bh.kind'), () => k.kind, (v) => { k.kind = v; }),
        k.picking ? btn(t('twin.bh.cancel'), () => { A.stopPick(); k.picking = false; k.msg = ''; render(); }, { id: 'bh-cancel' }) : btn(t('twin.bh.pick'), bhPick, { id: 'bh-pick' })),
      h('p', { class: 'tw-note', 'data-tw-msg': 'bh', text: k.msg || (k.picked ? '' : t('twin.bh.nothing')) }),
      k.kind === 'conveyor' ? h('div', { class: 'tw-row' }, sel('bh-dir', ['long', '-long', 'cross', '-cross'].map((x) => [x, t('twin.bh.dir.' + x)]), t('twin.bh.dir'), () => k.dirName, (v) => { k.dirName = v; }), num(t('twin.bh.speed'), 'speed', 'bh-speed')) : null,
      k.kind === 'joint' ? h('div', { class: 'tw-row' }, sel('bh-type', ['turn', 'slide'].map((x) => [x, t('twin.bh.type.' + x)]), t('twin.bh.type'), () => k.type, (v) => { k.type = v; }), num(t('twin.bh.min'), 'min', 'bh-min'), num(t('twin.bh.max'), 'max', 'bh-max'), num(t('twin.bh.home'), 'home', 'bh-home'), num(t('twin.bh.rate'), 'rate', 'bh-rate')) : null,
      k.kind === 'sensor' ? h('div', { class: 'tw-row' }, num(t('twin.bh.range'), 'range', 'bh-range')) : null,
      h('div', { class: 'tw-row' }, btn(t('twin.bh.add'), bhAdd, { id: 'bh-add' }), S.behaviours.length ? btn(t('twin.bh.recheck'), () => { bhRecheck(); render(); }, { id: 'bh-recheck' }) : null),
      S.behaviours.length ? h('div', {}, h('strong', { text: t('twin.bh.list') }), h('table', { 'data-tw': 'bh-list' }, rows), h('p', { class: 'tw-note', text: t('twin.bh.lostNote') })) : null,
      h('p', { class: 'tw-note', text: t('twin.bh.note') }));
  }
  function viewMeasured() {
    const m = R.meas, r = R.measRes, e = R.measErr;
    const pts = m ? m.parsed.points : [];
    const sel = (label, key) => h('label', {}, label, h('select', { 'data-tw': 'meas-' + key, onchange: (ev) => { S[key === 'from' ? 'measFrom' : 'measTo'] = ev.target.value; R.measRes = null; save(); render(); } }, pts.map((p) => h('option', { value: p, selected: p === (key === 'from' ? S.measFrom : S.measTo), text: p }))));
    const f = (x) => (x === null || x === undefined ? '-' : String(+x.toFixed(2)));
    const sgn = (x) => (x === null || x === undefined ? '-' : (x > 0 ? '+' : '') + f(x));
    return section('measured', t('twin.m.title'),
      h('p', { class: 'tw-note', text: t('twin.m.intro') }),
      h('label', {}, t('twin.m.unit'), h('select', { 'data-tw': 'meas-unit', onchange: (ev) => { S.measUnit = ev.target.value; save(); } }, ['s', 'min', 'h'].map((u) => h('option', { value: u, selected: u === (S.measUnit || 's'), text: t('twin.m.unit.' + u) })))),
      h('div', { class: 'tw-row' }, btn(t('twin.m.open'), openMeasured, { id: 'meas-open', title: t('twin.m.openHint') })),
      e ? h('p', { class: 'tw-bad', role: 'alert', 'data-tw-msg': 'meas-err', text: t('twin.m.first', { file: e.file }) + ' ' + measWords(e.error) }) : null,
      m ? h('p', { class: 'tw-note', text: t('twin.m.loaded', { file: m.file, parts: m.parsed.parts, events: m.parsed.events.length, points: pts.length }) }) : null,
      m ? h('div', { class: 'tw-row' }, sel(t('twin.m.from'), 'from'), sel(t('twin.m.to'), 'to'), number(t('twin.m.skip'), () => S.measSkip || 0, (v) => { S.measSkip = Math.max(0, v); R.measRes = null; }, { min: 0, id: 'meas-skip' }), btn(t('twin.m.run'), runMeasured, { id: 'meas-run', disabled: !built() })) : null,
      m && !built() ? h('p', { class: 'tw-note', text: t('twin.m.noLayout') }) : null,
      r && !r.ok ? h('p', { class: 'tw-bad', role: 'alert', 'data-tw-msg': 'meas-fail', text: measWords(r.error) }) : null,
      r && r.ok ? h('div', {},
        h('p', { class: 'tw-note', text: t('twin.m.window', { s: num3(r.window.t1 - r.window.t0), from: r.window.from, to: r.window.to }) + ' ' + (r.usedArrivals ? t('twin.m.fed', { from: r.window.from }) : '') }),
        h('div', { class: 'tw-scroll' }, h('table', { 'data-tw': 'meas-table' }, h('tr', {}, ['measure', 'unit', 'measured', 'simulated', 'diff', 'pct'].map((k) => h('th', { text: t('twin.m.col.' + k) }))),
          r.rows.map((x) => h('tr', {}, h('td', { text: t('twin.m.measure.' + x.measure, { point: x.point || '' }) }), h('td', { text: x.unit }), h('td', { text: f(x.measured) }), h('td', { text: f(x.simulated) }), h('td', { text: sgn(x.diff) }), h('td', { text: x.pct === null ? '-' : sgn(x.pct) + ' %' }))))),
        r.notes.map((n) => { const [k, v] = n.split(':'); return h('p', { class: 'tw-note', text: t('twin.m.note.' + k, { point: v || '' }) }); }),
        h('div', { class: 'tw-row' }, btn(t('twin.m.csv'), () => host.download('measured-comparison.csv', compareCsv(r.rows), 'text/csv'), { id: 'meas-csv' }))) : null,
      h('p', { class: 'tw-note', text: t('twin.m.caveat') }));
  }
  function viewBom() {
    const l = L();
    if (!l || !l.items.length) return section('bom', t('twin.b.title'), h('p', { class: 'tw-note', text: t('twin.noLayout') }));
    const rows = billOfMaterials(l), label = (r) => t('twin.bom.' + r.what.nm, r.what);
    return section('bom', t('twin.b.title'), h('p', { class: 'tw-note', text: t('twin.b.intro') }),
      h('table', { 'data-tw': 'bom' }, h('tr', {}, h('th', { text: t('twin.b.item') }), h('th', { text: t('twin.b.qty') })), rows.map((r) => h('tr', {}, h('td', { text: label(r) }), h('td', { text: `${r.qty} ${r.unit === 'm' ? 'm' : ''}`.trim() })))),
      h('div', { class: 'tw-row' }, btn(t('twin.b.csv'), () => host.download('bill-of-materials.csv', bomCsv(rows, label), 'text/csv'), { id: 'bom-csv' })));
  }
  function render() {
    const scroll = el.scrollTop;
    el.replaceChildren(h('div', { class: 'twin', 'data-twin': '1' },
      h('p', { text: t('twin.lede') }), h('p', { class: 'tw-note', 'data-tw-safety': '1', text: t('twin.safety') }),
      host.flowOn() ? null : h('p', { class: 'tw-note', text: t('twin.noFlow') }),
      L() && L().items.length ? null : h('p', { class: 'tw-note', text: t('twin.noLayout') }),
      viewCell(), viewShow(), viewControls(), viewPhysics(), viewCompare(), viewMeasured(), viewBehaviours(), viewBom()));
    el.scrollTop = scroll;
    paintRig();
  }
  const onLayout = () => { R.measRes = null; R.player = null; R.result = null; R.ride = null; R.msg.show = ''; R.msg.out = ''; stopRig(true); if (S.show) drawEquipment(); render(); };
  host.onLayout(onLayout);
  render();
  if (S.show && built()) drawEquipment();

  return {
    refresh: render, load(next) { S = { ...S, ...(next || {}) }; S.behaviours = cleanBehaviours(S.behaviours).list; R.bh.status = {}; R.bh.results = {}; onLayout(); },
    destroy() { stopRig(true); R.playing = false; cancelAnimationFrame(R.raf); if (R.tv) { R.tv.dispose(); R.tv = null; } host.view.hideFlow(false); el.replaceChildren(); },
    state: () => S, runtime: () => R, bhPick, bhAdd, bhTest, bhRemove, bhRecheck, runShow, startRig, stopRig, runAllTests, ride, runCompare, openMeasured, runMeasured, bake, unbake, saveUsd, saveVideo, stName, built,
  };
}
