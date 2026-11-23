#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools/detailcraft-test/scene-11/browser-scene-11.mjs (0.11 PERF.36): DetailCraft's scene after an edit changes only the parts the edit changed
 * (view3d.js updateParts), and draws the same as a whole rebuild. In /lab, one generated model:
 *   1. a run of edits (a beam's material, a beam's section, a connection's bolt rows, a hole, a member removed, a beam added), each drawn by the
 *      per-part update: the time from Model.change to the next frame, and the scene's fingerprint after it;
 *   2. the same edits again from the start (undo all, redo one at a time), each followed by a whole rebuild: its time and fingerprint.
 *   The two fingerprints must be equal at every step: every batch instance (its material, matrix, geometry vertices, pick ref), every edge segment,
 *   every hole and bolt matrix, compared as order-free sums of their float bits (a part that went leaves an empty slot, which is left out).
 *   Then the same edit is timed per-part and whole, alternating, 5 times each (medians), and a picture of each is compared pixel by pixel.
 *   node tools/detailcraft-test/scene-11/browser-scene-11.mjs --file <model.json> [--json out.json]
 * Here it runs SwiftShader (small models only); on workstation11a through tools/gpu-remote/run.sh --lab, the real GPU.
 */
import fs from 'node:fs';
import { launch, labCookie, machine, BASE } from '../../gpu-remote/browser.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const FILE = arg('--file', '/var/www/CADCRAFT/testfiles/generated/detail/grid10x6x4.detailcraft.json');
const R = { file: FILE.split(/[\\/]/).pop() };
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };

const browser = await launch({ webgl: true });
try {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies(labCookie());
  await ctx.addInitScript(() => {
    try { localStorage.setItem('cc-autofocus', 'off'); if (!localStorage.getItem('cc-newhere')) localStorage.setItem('cc-newhere', 'skipped'); } catch { /* none */ }
    window.showOpenFilePicker = undefined;
    const ce = console.error.bind(console);   // a console error carries where it came from (the app's frames), for the log
    let told = 0;
    const nanObjs = () => { const out = []; try { window.detailcraft.view.scene.traverse((o) => { const p = o.geometry?.attributes?.position?.array; if (p) for (let i = 0; i <= p.length; i++) if (p.length === 0 || p[i] !== p[i]) { out.push(o.type + ':' + (o.userData?.mat || '') + ':' + (o.parent === window.detailcraft.view.overlay ? 'overlay' : o.parent?.type) + ':' + p.length); break; } }); } catch { /* not up */ } return out.slice(0, 4).join(','); };
    console.error = (...a) => ce(...a, (String(a[0]).includes('NaN') && told++ < 2 ? '| NaN in ' + nanObjs() + ' ' : '') + '| at ' + (new Error().stack || '').split('\n').slice(2, 7).map((l) => l.trim().replace(/^at /, '').replace(/https?:\/\/[^ )]*\//g, '')).join(' < '));
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 600) + (m.location()?.url ? ' @ ' + m.location().url.split('/').pop() + ':' + m.location().lineNumber : '')); });
  await page.goto(BASE + '/lab/detailcraft', { waitUntil: 'networkidle', timeout: 180000 });
  try { await page.waitForFunction(() => window.detailcraft?.view?.renderer, null, { timeout: 120000 }); }
  catch (e) { console.log('the app did not start: at ' + page.url() + ' (a sign-in page means the lab session ended: another run signed the shared test admin in again); page errors: ' + JSON.stringify(errors.slice(0, 4))); throw e; }
  R.machine = await machine(page);
  console.log(R.machine);
  const t0 = Date.now();
  await page.setInputFiles('[data-file]', { name: R.file, mimeType: 'application/json', buffer: fs.readFileSync(FILE) });
  await page.waitForFunction((n) => (window.detailcraft.model.state.members.length > 10 && window.detailcraft.view.inc) ? true : false, null, { timeout: 600000, polling: 500 });
  R.open_ms = Date.now() - t0;
  if (process.env.SC_DEBUG) console.log('errors after open', errors.length);
  await page.waitForTimeout(1500);

  // the helpers live in the page
  await page.evaluate(() => {
    const H = window.__sc = {};
    const u32 = new Uint32Array(1), f32 = new Float32Array(u32.buffer);
    const mix = (h, x) => { h = Math.imul(h ^ x, 0x9e3779b1); return (h ^ (h >>> 15)) >>> 0; };
    const bits = (v) => { f32[0] = v; return u32[0]; };
    const str = (h, s) => { for (let i = 0; i < s.length; i++) h = mix(h, s.charCodeAt(i)); return h; };
    // an order-free sum: count, sum and xor of each item's 32-bit hash (exact integer arithmetic)
    const acc = () => ({ n: 0, sum: 0, x: 0, add(h) { this.n++; this.sum = (this.sum + h) >>> 0; this.x = (this.x ^ Math.imul(h, 2654435761)) >>> 0; } });
    H.fingerprint = () => {
      const v = window.detailcraft.view, THREE_M = v.batches[0]?.matrixWorld.constructor;
      const out = {};
      const geoHash = new Map();
      for (const bm of v.batches) {
        const a = acc(), pos = bm.geometry.attributes.position.array, idx = bm.geometry.index?.array;
        const m = new THREE_M();
        const info = bm._instanceInfo;
        for (let i = 0; i < info.length; i++) {
          if (!info[i].active) continue;
          const gid = bm.getGeometryIdAt(i);
          let gh = geoHash.get(bm.id + ':' + gid);
          if (gh === undefined) {
            const r = bm.getGeometryRangeAt(gid);
            gh = 7;
            // the geometry's triangles as drawn (index → vertex position): the same vertices in the same order whatever slot they sit in
            if (idx) for (let k = r.start; k < r.start + r.count; k++) { const vi = idx[k] * 3; gh = mix(mix(mix(gh, bits(pos[vi])), bits(pos[vi + 1])), bits(pos[vi + 2])); }
            else for (let k = r.start * 3; k < (r.start + r.count) * 3; k++) gh = mix(gh, bits(pos[k]));
            geoHash.set(bm.id + ':' + gid, gh);
          }
          bm.getMatrixAt(i, m);
          let h = gh;
          for (const e of m.elements) h = mix(h, bits(e));
          const ref = bm.userData.refs[i];
          h = str(h, ref ? ref.kind + ':' + ref.id : '-');
          h = mix(h, info[i].visible ? 1 : 2);
          a.add(h);
        }
        out['batch:' + bm.userData.mat] = [a.n, a.sum, a.x];
      }
      const lines = v.inc.edgeLines.geometry, e = lines.attributes.position.array, n = lines.drawRange.count * 3;
      const ea = acc();
      for (let i = 0; i < n; i += 6) {
        if (e[i] === e[i + 3] && e[i + 1] === e[i + 4] && e[i + 2] === e[i + 5]) continue;   // a folded segment (a part that went)
        let h = 3; for (let k = 0; k < 6; k++) h = mix(h, bits(e[i + k])); ea.add(h);
      }
      out.edges = [ea.n, ea.sum, ea.x];
      const hm = v.inc.holeMesh, ha = acc(), hmat = hm.instanceMatrix.array;
      for (let i = 0; i < hm.count; i++) {
        let zero = true; for (let k = 0; k < 12; k++) if (hmat[i * 16 + k] !== 0) { zero = false; break; }
        if (zero) continue;
        let h = 5; for (let k = 0; k < 16; k++) h = mix(h, bits(hmat[i * 16 + k])); ha.add(h);
      }
      out.holes = [ha.n, ha.sum, ha.x];
      const bm = v.inc.boltMesh;
      if (bm) { const ba = acc(), b = bm.instanceMatrix.array; for (let i = 0; i < bm.count; i++) { let h = 9; for (let k = 0; k < 16; k++) h = mix(h, bits(b[i * 16 + k])); ba.add(h); } out.bolts = [ba.n, ba.sum, ba.x]; }
      out.box = [...v.box.min.toArray(), ...v.box.max.toArray()].map((x) => Math.round(x * 1000) / 1000);
      out.pickables = v.pickables.length;
      return JSON.stringify(out);
    };
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    // the edits: each returns a function that makes it (ids picked from the model once, so both runs make the same edits)
    H.plan = () => {
      const s = window.detailcraft.model.state;
      const beams = s.members.filter((m) => m.type === 'beam');
      const b1 = beams[Math.floor(beams.length / 3)], b2 = beams[Math.floor(beams.length / 2)], b3 = beams[Math.floor(beams.length * 0.7)];
      const ep = s.connections.find((c) => c.type === 'endplate') || s.connections[0];
      const b4 = beams[Math.floor(beams.length * 0.9)];
      return [
        ['material', `tx.updateMember('${b1.id}', { material: '${b1.material === 'A36' ? 'A992' : 'A36'}' })`],
        ['section', `tx.updateMember('${b2.id}', { profile: '${b2.profile === 'W16X31' ? 'W18X35' : 'W16X31'}' })`],
        ['bolt rows', `tx.updateConnection('${ep.id}', { ...${JSON.stringify(ep.params)}, rows: ${(Number(ep.params.rows) || 2) + 1} })`],
        ['hole', `tx.addHole('${b3.id}', { face: 'web', x: 500, y: 0, d: 22 })`],
        ['remove', `tx.removeMembers(['${b4.id}'])`],
        ['add beam', `tx.addMember({ type: 'beam', profile: 'W12X26', material: 'A992', start: [${b1.start[0] + 300}, ${b1.start[1] + 300}, ${b1.start[2] - 600}], end: [${b1.end[0] + 300}, ${b1.end[1] + 300}, ${b1.end[2] - 600}], rotation: 0, position: 'top', name: '', cuts: [], holes: [], phase: 1 })`],
      ];
    };
    // the page is quiet: the work an edit starts later (the constructability pass 400 ms after it) has run, so the next edit is timed alone
    H.quiet = async () => {
      const t0 = performance.now();
      await new Promise((r) => setTimeout(r, 600));
      for (let k = 0; k < 600; k++) { const t = performance.now(); await new Promise((r) => setTimeout(r, 50)); if (performance.now() - t < 80) break; }
      return Math.round(performance.now() - t0);
    };
    H.edit = async (code, whole) => {
      const dc = window.detailcraft, v = dc.view;
      await H.quiet();
      if (whole) v.inc = null;   // the next draw is a whole rebuild
      v.lastUpdate = null;
      const t = performance.now();
      dc.model.change('perf', new Function('tx', code));
      const t1 = performance.now();
      await frame();
      const ms = Math.round(performance.now() - t);
      const tq = performance.now(); await H.quiet();
      return { ms, change_and_draw_ms: Math.round(t1 - t), inc: v.lastUpdate, quiet_ms: Math.round(performance.now() - tq) };
    };
    H.rebuild = async () => { await H.quiet(); const v = window.detailcraft.view; v.inc = null; const t = performance.now(); v.setModel(v.state, v.built, v.marks); v.setSelection(window.detailcraft.selected); await frame(); return Math.round(performance.now() - t); };
    H.undo = async () => { window.detailcraft.model.undo(); await frame(); return window.detailcraft.view.lastUpdate; };
    H.redo = async () => { window.detailcraft.model.redo(); await frame(); return window.detailcraft.view.lastUpdate; };
  });

  R.scene = await page.evaluate(() => ({ members: window.detailcraft.model.state.members.length, parts: window.detailcraft.built.parts.length, bolts: window.detailcraft.built.bolts.length }));
  console.log(`${R.file}: ${R.scene.members} members, ${R.scene.parts} parts, ${R.scene.bolts} bolts; open ${R.open_ms} ms`);
  const plan = await page.evaluate(() => window.__sc.plan());
  const f0 = await page.evaluate(() => window.__sc.fingerprint());
  // 1. per-part
  R.steps = [];
  const fInc = [];
  for (const [what, code] of plan) {
    const r = await page.evaluate(([c]) => window.__sc.edit(c, false), [code]);
    fInc.push(await page.evaluate(() => window.__sc.fingerprint()));
    R.steps.push({ what, inc_ms: r.ms, inc: r.inc, after_ms: r.quiet_ms });
    if (process.env.SC_DEBUG) console.log('errors after', what, errors.length);
    ok(r.inc && r.inc.added + r.inc.removed > 0, what + ': drawn by the per-part update (' + JSON.stringify(r.inc) + ')');
  }
  // back to the start, per part too
  for (let i = 0; i < plan.length; i++) await page.evaluate(() => window.__sc.undo());
  ok(await page.evaluate(() => window.__sc.fingerprint()) === f0, 'after undoing every edit (per-part) the scene is the one it opened with');
  // 2. whole rebuilds at each step (redo = the same model as the edit made)
  for (let i = 0; i < plan.length; i++) {
    await page.evaluate(() => window.__sc.redo());
    const ms = await page.evaluate(() => window.__sc.rebuild());
    R.steps[i].whole_ms = ms;
    const f = await page.evaluate(() => window.__sc.fingerprint());
    ok(f === fInc[i], plan[i][0] + ': the per-part scene equals the whole rebuild' + (f === fInc[i] ? '' : '\n    per-part ' + fInc[i] + '\n    whole    ' + f));
  }
  for (const s of R.steps) console.log(`  ${s.what}: per-part ${s.inc_ms} ms to the frame, the page quiet ${s.after_ms} ms later (${s.inc ? `${s.inc.removed} out, ${s.inc.added} in` : 'whole'}), whole rebuild of the scene ${s.whole_ms} ms`);
  if (process.env.SC_PROF) {   // a CPU profile of one per-part edit (debugging)
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Profiler.enable'); await cdp.send('Profiler.start');
    await page.evaluate(([c]) => window.__sc.edit(c, false), [plan[0][1].replace(/material: '(A36|A992)'/, "material: 'A572'")]);
    const { profile: p } = await cdp.send('Profiler.stop');
    const cnt = {}; p.samples.forEach((x, i) => { cnt[x] = (cnt[x] || 0) + p.timeDeltas[i]; });
    const self = {}; for (const n of p.nodes) { const k = n.callFrame.functionName + ' ' + n.callFrame.url.split('/').pop().split('?')[0] + ':' + n.callFrame.lineNumber; self[k] = (self[k] || 0) + (cnt[n.id] || 0); }
    console.log(Object.entries(self).sort((x, y) => y[1] - x[1]).slice(0, 25).map(([k, v]) => (v / 1000).toFixed(0) + ' ' + k).join('\n'));
  }
  // 3. one edit, per-part against whole (change + build + marks + scene + frame), alternating, 5 each
  const t = { inc: [], whole: [] };
  for (let i = 0; i < 10; i++) {
    const whole = i % 2 === 1;
    const r = await page.evaluate(([c, w]) => window.__sc.edit(c, w), [plan[0][1].replace(/material: '(A36|A992)'/, `material: '${i % 2 ? 'A572' : 'A36'}'`), whole]);
    (whole ? t.whole : t.inc).push(r.ms);
    (t.after || (t.after = [])).push(r.quiet_ms);
  }
  const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  R.edit = { inc_ms: med(t.inc), whole_ms: med(t.whole), inc_all: t.inc, whole_all: t.whole, after_ms: med(t.after) };
  console.log(`one edit to the next frame (change, build, marks, scene, frame), median of 5: per-part ${R.edit.inc_ms} ms, whole ${R.edit.whole_ms} ms; then the page is busy ${R.edit.after_ms} ms more (the constructability pass and other listeners)`);
  // 4. pictures: per-part against whole after the same edit
  await page.evaluate(([c]) => window.__sc.edit(c, false), [plan[1][1]]);
  const shotA = await page.locator('canvas').first().screenshot();
  await page.evaluate(() => window.__sc.rebuild());
  const shotB = await page.locator('canvas').first().screenshot();
  R.picture_same_bytes = Buffer.compare(shotA, shotB) === 0;
  const diff = await page.evaluate(async ([a, b]) => {
    const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
    const [A, B] = await Promise.all([load(a), load(b)]);
    const c = document.createElement('canvas'); c.width = A.width; c.height = A.height; const g = c.getContext('2d');
    g.drawImage(A, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data; g.clearRect(0, 0, c.width, c.height); g.drawImage(B, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 24) n++;
    return { pixels: da.length / 4, differ: n };
  }, [shotA.toString('base64'), shotB.toString('base64')]);
  R.picture = diff;
  console.log(`picture after the section edit: ${diff.differ} of ${diff.pixels} pixels differ between per-part and whole (${R.picture_same_bytes ? 'same bytes' : 'not byte-equal'})`);
  ok(diff.differ <= diff.pixels * 0.001, 'the picture is the same (at most 0.1 % of pixels differ: ' + diff.differ + ')');
  // no position in the scene is NaN, and every buffer holds whole vertices (three works a bounding sphere over each; a part-vertex tail reads as NaN)
  R.nan = await page.evaluate(() => {
    const out = [];
    window.detailcraft.view.scene.traverse((o) => {
      const at = o.geometry?.attributes?.position;
      if (!at) return;
      const a = at.array;
      let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== a[i]) n++;
      if (n || (!at.isInterleavedBufferAttribute && a.length % at.itemSize)) out.push({ type: o.type, mat: o.userData?.mat || null, nan: n, floats: a.length });
    });
    return out;
  });
  ok(!R.nan.length, 'no NaN positions in the scene: ' + JSON.stringify(R.nan.slice(0, 4)));
  R.errors = errors.filter((e) => !/429/.test(e));
  ok(!R.errors.length, 'no page errors: ' + JSON.stringify(R.errors.slice(0, 3)));
  const out = arg('--json', null);
  if (out) fs.writeFileSync(out, JSON.stringify(R, null, 2));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
