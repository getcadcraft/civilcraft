/* SPDX-License-Identifier: Apache-2.0 */
/**
 * usd.mjs — ModelCraft ↔ USD (0.7 XF.9 + XF.2, session `usd`), run inside bin/test-modelcraft.mjs.
 *
 *   capture(M, APP, ROOT) installed at the top of bin/test-modelcraft.mjs: every Model the suite builds or loads, checked
 *                         section by section (section() calls globalThis.__usdFlush)
 *   run({ ok, section, APP, ROOT, models })   at the end: the checks below
 *
 * 1. **The XF.9 gate:** every model the suite built (in the state it ended in), saved as .usda, .usdc and .usdz and opened
 *    again, gives the same .modelcraft JSON; so does the round trip through the reference library (usdcat: our .usdc → its
 *    .usda, our .usda → its .usdc → we open it). Every file we wrote passes the reference's validators with no error.
 * 2. Edited elsewhere: a definition whose points another program moved opens from the native mesh (the rest exact); a
 *    placement moved elsewhere keeps its new place; one deleted elsewhere is gone.
 * 3. Someone else's USD: a Y-up centimetre cube opens in metres, Z up; a corpus of public scenes opens as models (meshes,
 *    components, lamps, cameras) and each model loads in the kernel; refusals for non-USD bytes.
 * Oracle (outside every repo, a missing one is said and its checks skipped): /var/www/CADCRAFT/oracles/usd-venv (usd-core).
 * Corpus (outside git): /var/www/CADCRAFT/testfiles/usd-corpus/public (each asset's licence in its own readme).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const hash = (s) => createHash('sha256').update(s).digest('hex');

const PY = process.env.USD_ORACLE_PY || '/var/www/CADCRAFT/oracles/usd-venv/bin/python';
const CORPUS = '/var/www/CADCRAFT/testfiles/usd-corpus/public';

/**
 * Remember every Model the suite builds or loads. `flush()` (called by the suite's section() as each section starts, and
 * by run()) saves each model remembered since the last flush as .usda/.usdc/.usdz, opens it again, compares, and lets the
 * model go — so models are checked in the state their section left them, and memory stays flat.
 */
export async function capture(M, APP, ROOT) {
  const U = await import(path.join(APP, 'usd-modelcraft.js'));
  const OUT = path.join(ROOT, 'tmp/usd-test');
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const st = { bigs: 0, own: new WeakSet(), pending: new Set(), models: 0, tried: 0, same: 0, bad: [], sizes: [0, 0, 0], written: [], want: new Map(), bytes: 0 };
  const P = M.Model.prototype;
  if (process.env.USD_CAPTURE === '0') { st.flush = () => {}; st.off = true; return st; }   // (to measure the suite without it)
  for (const k of ['change', 'load', 'commit']) {
    const f = P[k];
    if (typeof f !== 'function') continue;
    // a model edited after a check is remembered again, so its later state is checked too; more than four waiting are
    // checked at once (a section that builds a hundred models must not keep them all alive)
    P[k] = function (...a) {
      const r = f.apply(this, a);
      if (st.own.has(this)) return r;   // a copy this check reopened
      st.pending.add(this);
      if (st.pending.size > 4 && !st.busy) st.flush();
      return r;
    };
  }
  const bytesOf = (d) => (typeof d === 'string' ? new TextEncoder().encode(d) : d);
  st.flush = () => {
    st.busy = true;
    const now = [...st.pending];
    st.pending.clear();
    for (const m of now) {
      let want;
      let file, im;
      try { if (!m.defs.has('root')) continue; file = m.toJSON(); im = m.imagesJSON(); } catch { continue; }
      const k = st.models++;
      if (im.length) file.images = im;
      // the baseline is the model after a plain .modelcraft reload (what Save then Open gives): the kernel's load() cleans
      // modifier params to their defaults and re-normalizes lamp directions, so a model a test built raw is not a fixed point
      try { const m0 = new M.Model(); st.own.add(m0); m0.setImages(file.images || []); m0.load(JSON.parse(JSON.stringify(file))); want = JSON.stringify(m0.toJSON()); } catch { continue; }
      // the text form of a very large model would hold hundreds of MB at once: those are checked as binary and package
      let nv = 0;
      for (const d of m.defs.values()) nv += d.mesh ? d.mesh.nv : d.verts.size;
      const big = nv > 200000;
      if (big) st.bigs++;
      for (const [fi, fmt] of ['usda', 'usdc', 'usdz'].entries()) {
        if (big && fmt === 'usda') continue;
        st.tried++;
        let got;
        try {
          const b = bytesOf(U.saveUsd(file, m, { format: fmt, name: 'model-' + k + '.modelcraft' }).data);
          st.sizes[fi] += b.length;
          // files for the reference library's checks: small ones only (rule 13), at most 150 MB in all
          if (fmt !== 'usdz' && b.length < 5e6 && st.bytes + b.length < 150e6) {
            const f = path.join(OUT, 'm' + k + '.' + fmt);
            fs.writeFileSync(f, b);
            st.written.push(f);
            st.bytes += b.length;
            st.want.set(k, hash(want));
          }
          const r = U.openUsd(b, { name: 'm.' + fmt });
          const m2 = new M.Model();
          st.own.add(m2);
          m2.setImages(r.file.images);
          m2.load(r.file);
          got = JSON.stringify(m2.toJSON());
        } catch (e) { got = 'ERROR ' + e.message; }
        // one line per failing model (its first format), up to eight, so different failures show at once
        if (got === want) st.same++; else if (st.bad.length < 8 && !st.bad.some((x) => x.startsWith('model ' + k + ' '))) st.bad.push('model ' + k + ' (' + fmt + '): ' + (got.startsWith('ERROR') ? got : firstDiff(want, got)));
        got = null;
      }
    }
    st.busy = false;
  };
  globalThis.__usdFlush = st.flush;
  return st;
}

export async function run({ ok, section, APP, ROOT, models }) {
  const M = await import(path.join(APP, 'model.js'));
  const U = await import(path.join(APP, 'usd-modelcraft.js'));
  const L = await import(path.join(APP, 'usd/index.js'));
  const OUT = path.join(ROOT, 'tmp/usd-test');
  fs.mkdirSync(OUT, { recursive: true });
  const oracle = fs.existsSync(PY) ? (args) => execFileSync(PY, ['-I', path.join(ROOT, 'tools/usd/oracle.py'), ...args], { maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'] }).toString() : null;
  const bytesOf = (d) => (typeof d === 'string' ? new TextEncoder().encode(d) : d);
  const fileOf = (m) => { const j = m.toJSON(); const im = m.imagesJSON(); if (im.length) j.images = im; return j; };
  const reopen = (bytes, name) => { const r = U.openUsd(bytes, { name }); const m2 = new M.Model(); m2.setImages(r.file.images); m2.load(r.file); return { m2, r }; };

  section('USD: every model of this suite saved as USD and opened again (0.7 XF.9)');
  const st = models;
  st.flush();
  globalThis.__usdFlush = null;
  ok(st.models >= 50, 'the suite built ' + st.models + ' models');
  ok(st.same === st.tried, `${st.same} / ${st.tried} saves (${st.models} models × .usda, .usdc, .usdz${st.bigs ? '; ' + st.bigs + ' models over 200,000 vertices as .usdc and .usdz only' : ''}) reopen equal to the model` + (st.bad.length ? ': ' + st.bad.join(' | ') : ''));
  console.log(`  (sizes: usda ${(st.sizes[0] / 1e6).toFixed(1)} MB, usdc ${(st.sizes[1] / 1e6).toFixed(1)} MB, usdz ${(st.sizes[2] / 1e6).toFixed(1)} MB)`);
  const written = st.written;

  if (!oracle) console.log('  (no USD oracle at ' + PY + ': usdcat round trip and validators skipped)');
  else {
    // usdcat both ways, then we open what the library wrote
    const pairs = [];
    for (const f of written) {
      if (f.endsWith('.usdc')) pairs.push([f, f.replace(/\.usdc$/, '.cat.usda')]);
      if (f.endsWith('.usda')) pairs.push([f, f.replace(/\.usda$/, '.cat.usdc')]);
    }
    fs.writeFileSync(path.join(OUT, 'pairs.json'), JSON.stringify(pairs));
    const res = JSON.parse(oracle(['resave', path.join(OUT, 'pairs.json')]));
    let catSame = 0, catTried = 0;
    const bad = [];
    for (const [src, dst] of pairs) {
      catTried++;
      const k = +/m(\d+)\./.exec(src)[1];
      if (!res[src]) { if (bad.length < 3) bad.push('library could not re-save ' + path.basename(src)); continue; }
      const want = st.want.get(k);
      let got;
      try { got = hash(JSON.stringify(reopen(fs.readFileSync(dst), path.basename(dst)).m2.toJSON())); } catch (e) { got = 'ERROR ' + e.message; }
      if (got === want) catSame++; else if (bad.length < 3) bad.push(path.basename(dst) + ': ' + (got.startsWith('ERROR') ? got : 'reopens different from the model'));
    }
    ok(catSame === catTried, `${catSame} / ${catTried} round trips through the reference library (usdcat .usdc → .usda, .usda → .usdc) reopen equal` + (bad.length ? ': ' + bad.join(' | ') : ''));
    // validators on everything we wrote (errors only; one process)
    fs.writeFileSync(path.join(OUT, 'files.json'), JSON.stringify(written));
    const checks = JSON.parse(oracle(['many', 'check', path.join(OUT, 'files.json')]));
    const errors = [];
    for (const [f, list2] of Object.entries(checks)) {
      if (list2 === null) { errors.push(path.basename(f) + ': the library could not open it'); continue; }
      for (const e of list2) if (/Error/.test(e.type)) errors.push(path.basename(f) + ': ' + e.validator + ' ' + e.message.slice(0, 160));
    }
    ok(!errors.length, `the reference validators find no error in the ${written.length} files we wrote` + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') + (errors.length > 3 ? ' (+' + (errors.length - 3) + ')' : '') : ''));
  }

  section('USD: changed in another program');
  {
    // a box in a group, and the same box placed twice as a component
    const m = new M.Model();
    m.change('box', () => {
      const root = m.defs.get('root');
      M.addPolygon(root, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 2, 1), [0, 0, 1]);
      M.pushPull(root, [...root.faces.keys()][0], 1);
      const sel = [...root.faces.keys()].map((id) => ({ t: 'f', id }));
      m.makeGroup(root, sel, 'group', 'Box');
    });
    const file = fileOf(m);
    const r = U.saveUsd(file, m, { format: 'usda', name: 'box.modelcraft' });
    const layer = L.readUsda(r.data);
    // move a vertex of the box's native mesh, and the placement
    const geo = [...layer.specs.keys()].find((p) => p.endsWith('/Geometry.points'));
    const pts = layer.specs.get(geo).fields.get('default').v;
    pts[0] += 0.25;
    const inst = [...layer.specs.keys()].find((p) => /\/World\/Box\.xformOp:transform$/.test(p));
    const xf = [...layer.specs.keys()].find((p) => /\/World\/Box$/.test(p));
    if (!inst) {
      layer.addAttr(xf, 'xformOp:translate', 'double3', L.V('double3', [5, 0, 0]));
      layer.addAttr(xf, 'xformOpOrder', 'token[]', L.V('token[]', ['xformOp:translate']), { uniform: true });
    }
    const back = U.openUsd(new TextEncoder().encode(L.writeUsda(layer)), { name: 'box.usda' });
    ok(back.report.edited === 1, 'a definition whose points moved elsewhere is read from its native mesh (' + back.report.edited + ')');
    const m2 = new M.Model();
    m2.load(back.file);
    const meshDef = [...m2.defs.values()].find((d) => d.mesh);
    const moved = meshDef ? Array.from(meshDef.mesh.toArrays().p) : [];
    ok(!!meshDef && moved.some((x) => Math.abs(x - Math.fround(pts[0])) < 1e-6) && moved.length === pts.length, 'it opens as a mesh definition with the moved point');
    ok(back.report.moved === 1 && JSON.stringify(m2.defs.get('root').insts.values().next().value.m.slice(12, 15)) === '[5,0,0]', 'a placement moved elsewhere keeps its new place');
    // delete the placement's prim
    const layer2 = L.readUsda(r.data);
    const P = layer2.get('/World', 'primChildren');
    layer2.specs.get('/World').fields.get('primChildren').v = P.filter((n) => n !== 'Box');
    const back2 = U.openUsd(new TextEncoder().encode(L.writeUsda(layer2)), { name: 'box.usda' });
    ok(back2.report.removed === 1 && back2.file.defs.find((d) => d.id === 'root').insts.length === 0, 'a placement deleted elsewhere is gone');
  }

  section('USD: someone else\'s scene');
  {
    const yup = `#usda 1.0
(
    metersPerUnit = 0.01
    upAxis = "Y"
)
def Xform "Root"
{
    double3 xformOp:translate = (0, 100, 0)
    uniform token[] xformOpOrder = ["xformOp:translate"]
    def Cube "Box"
    {
        double size = 200
        color3f[] primvars:displayColor = [(1, 0, 0)]
    }
    def SphereLight "Lamp"
    {
        float inputs:intensity = 10
        float inputs:radius = 5
    }
}
`;
    const r = U.openUsd(new TextEncoder().encode(yup), { name: 'yup.usda' });
    const m = new M.Model();
    m.load(r.file);
    const bb = m.bbox(m.defs.get('root'));
    ok(r.report.foreign && bb && Math.abs(bb.min[2] - 0) < 1e-9 && Math.abs(bb.max[2] - 2) < 1e-9 && Math.abs(bb.max[0] - 1) < 1e-9, 'a Y-up centimetre cube (200 cm, lifted 100 cm) opens 2 m tall from the ground, Z up: ' + (bb ? JSON.stringify([bb.min, bb.max]) : 'no box'));
    const mesh = [...m.defs.values()].find((d) => d.mesh);
    ok(!!mesh && mesh.mesh.paints.includes('#ff0000'), 'its display colour paints the faces');
    ok(m.lights.size === 1, 'its lamp becomes a lamp');
    let threw = '';
    try { U.openUsd(new TextEncoder().encode('hello'), { name: 'x.usda' }); } catch (e) { threw = e.code; }
    ok(threw === 'not_usd', 'bytes that are not USD are refused: ' + threw);

    if (!fs.existsSync(CORPUS)) console.log('  (no corpus at ' + CORPUS + ': public scenes skipped)');
    else {
      const files = walkFiles(CORPUS).filter((f) => /\.(usda|usdc|usdz|usd)$/i.test(f)).sort();
      let opened = 0, models2 = 0, meshes = 0, comps = 0, lights = 0, cams = 0;
      const bad = [];
      for (const f of files) {
        try {
          const dir = path.dirname(f);
          const res = U.openUsd(fs.readFileSync(f), { name: f, read: (n) => { try { return fs.readFileSync(path.resolve(dir, n)); } catch { return null; } } });
          opened++;
          const mm = new M.Model();
          mm.setImages(res.file.images);
          mm.load(res.file);
          models2++;
          meshes += res.report.meshes || 0; comps += res.report.components || 0; lights += res.report.lights || 0; cams += res.report.cameras || 0;
        } catch (e) { if (bad.length < 4) bad.push(path.relative(CORPUS, f) + ': ' + e.message.slice(0, 120)); }
      }
      ok(models2 === files.length, `${models2} / ${files.length} public USD scenes open as models (${meshes} meshes, ${comps} components, ${lights} lamps, ${cams} cameras)` + (bad.length ? ': ' + bad.join(' | ') : ''));
    }
  }
  fs.rmSync(OUT, { recursive: true, force: true });
}

function walkFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkFiles(p)); else out.push(p);
  }
  return out;
}
function firstDiff(a, b) {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return 'differs at ' + i + ': …' + a.slice(Math.max(0, i - 50), i + 70) + ' ≠ …' + b.slice(Math.max(0, i - 50), i + 70);
}
