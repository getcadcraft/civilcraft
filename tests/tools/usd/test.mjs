#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test.mjs — cc-usd tests (lib/usd: OpenUSD text, binary, packages, composition; 0.7 XF.2, session `usd`).
 *
 *   node tools/usd/test.mjs [--verbose] [--no-fuzz] [--no-corpus]
 *
 * 1. Units: every half value both ways; LZ4 blocks and chunks (ours ↔ ours, refusals); the integer coding (32/64-bit,
 *    extremes, random); paths; list ops.
 * 2. Known answers: a hand-written layer read from text (every value kind, list ops, variants, time samples, connections),
 *    written as text and as binary and read back the same; a package (64-byte alignment, CRCs); composition (sublayers,
 *    references, payloads, inherits, variants with a stronger selection, targets mapped into the stage, a loop, a missing
 *    file); transforms (every op, pivot, inverse, reset) and shapes; the builder's scene.
 * 3. Refusals and fuzz: not USD, cut-off and flipped bytes of text, binary and package files, in a worker with a time
 *    limit — only a UsdError or a layer may come out.
 * 4. With the oracle (OpenUSD's own library, /var/www/CADCRAFT/oracles/usd-venv, test-only; a missing one is said and
 *    skipped): what the library writes we read; what we write the library reads the same (text compared after the
 *    library's own re-save); every layer of the public corpus round-trips through both of our writers; every mesh's world
 *    points agree; our builder's files pass the library's validators.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const U = await import(path.join(ROOT, 'lib/usd/index.js'));
const { lz4Compress, lz4Decompress, packChunks, unpackChunks } = await import(path.join(ROOT, 'lib/usd/lz4.js'));
const { encodeInts, decodeInts } = await import(path.join(ROOT, 'lib/usd/intcode.js'));

// ------------------------------------------------------------------ worker: many cuts / flips of one file
if (!isMainThread) {
  const { bytes, cuts, flips, seed } = workerData;
  const b = new Uint8Array(bytes);
  const res = [];
  const one = (x, tag) => {
    try { U.readLayer(x); res.push({ tag, ok: 'read' }); } catch (e) { res.push(e instanceof U.UsdError ? { tag, ok: 'UsdError ' + e.code } : { tag, bad: String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e) }); }
  };
  for (const c of cuts) one(b.subarray(0, c), '@' + c);
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let k = 0; k < flips; k++) {
    const x = b.slice();
    for (let j = 0; j < 1 + Math.floor(rnd() * 4); j++) x[Math.floor(rnd() * x.length)] = Math.floor(rnd() * 256);
    one(x, 'flip' + k);
  }
  parentPort.postMessage(res);
  process.exit(0);
}

const VERBOSE = process.argv.includes('--verbose');
const NO_FUZZ = process.argv.includes('--no-fuzz');
const NO_CORPUS = process.argv.includes('--no-corpus');
const PY = process.env.USD_ORACLE_PY || '/var/www/CADCRAFT/oracles/usd-venv/bin/python';
const CORPUS = '/var/www/CADCRAFT/testfiles/usd-corpus/public';
const OUT = path.join(ROOT, 'tmp/usd-lib-test');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const section = (s) => console.log('\n== ' + s);
const oracle = fs.existsSync(PY) ? (args) => execFileSync(PY, ['-I', path.join(HERE, 'oracle.py'), ...args], { maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'] }).toString() : null;
const enc = new TextEncoder();

// ------------------------------------------------------------------
section('units: halves, LZ4, integer coding, paths, list ops');
{
  let bad = 0;
  for (let h = 0; h < 65536; h++) { const f = U.halfToFloat(h); if (!Number.isNaN(f) && U.floatToHalf(f) !== h) bad++; }
  ok(bad === 0, 'every half value converts both ways (' + bad + ' differ)');
  ok(U.floatToHalf(65520) === 0x7c00 && U.floatToHalf(1e-8) === 0 && U.floatToHalf(-0) === 0x8000, 'overflow → inf, underflow → 0, −0 kept');
  let s = 7;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const samples = [new Uint8Array(0), new Uint8Array(5).fill(9), enc.encode('abcabcabcabcabcabcabcabcabcabc hello hello hello'), Uint8Array.from({ length: 100000 }, () => Math.floor(rnd() * 4)), Uint8Array.from({ length: 70000 }, () => Math.floor(rnd() * 256))];
  let lzOk = true;
  for (const x of samples) { const c = packChunks(x); const y = unpackChunks(c, x.length); if (y.length !== x.length || y.some((v, i) => v !== x[i])) lzOk = false; }
  ok(lzOk, 'LZ4 chunks: ' + samples.length + ' buffers (empty, runs, text, low entropy, random) unpack to themselves');
  const rep = enc.encode('point3f[] points = [(0, 0, 0), (1, 0, 0)] '.repeat(2000));
  ok(packChunks(rep).length < rep.length / 20, 'LZ4 compresses repetitive data (' + packChunks(rep).length + ' of ' + rep.length + ')');
  let threw = '';
  try { unpackChunks(Uint8Array.from([0, 0x40, 1, 2]), 100); } catch (e) { threw = e.code; }
  ok(threw === 'damaged', 'a block that claims more literals than it has is refused');
  threw = '';
  try { lz4Decompress(Uint8Array.from([0x11, 65, 9, 0]), new Uint8Array(100)); } catch (e) { threw = e.code; }
  ok(threw === 'damaged', 'a match before the start of the output is refused');
  const ints = [0, 1, -1, 127, -128, 128, 32767, -32768, 32768, 2147483647, -2147483648, 5, 5, 5, 5, 6, 7, 8, 1000000];
  const d32 = decodeInts(encodeInts(ints), ints.length);
  ok(d32.every((v, i) => v === ints[i]), 'integer coding, 32-bit: extremes and runs come back');
  const big = Array.from({ length: 50000 }, () => Math.floor((rnd() - 0.5) * 2 ** 31));
  const db = decodeInts(encodeInts(big), big.length);
  ok(db.every((v, i) => v === big[i]), 'integer coding, 32-bit: 50,000 random values come back');
  const w = [0n, 1n, -1n, 2n ** 62n, -(2n ** 63n), 2n ** 63n - 1n, 40000n, -40000n, 3n, 3n, 3n];
  const dw = decodeInts(encodeInts(w, { wide: true }), w.length, { wide: true });
  ok(w.every((v, i) => dw[i] === v), 'integer coding, 64-bit: extremes come back');
  const P = U.path;
  ok(P.parent('/A/B.x:y') === '/A/B' && P.parent('/A{v=s}B') === '/A{v=s}' && P.parent('/A{v=s}') === '/A' && P.parent('/A') === '/', 'path parents (property, prim in a variant, variant, top)');
  ok(P.name('/A/B.x:y') === 'x:y' && P.name('/A{v=s}') === '{v=s}' && P.child('/A{v=s}', 'B') === '/A{v=s}B', 'path names and children');
  ok(U.identifier('3rd floor / Wall') === '_3rd_floor___Wall' && U.identifier('') === '_', 'identifiers from any name');
  const op = { explicit: false, prependedItems: ['a'], appendedItems: ['z'], deletedItems: ['m'] };
  ok(JSON.stringify(U.applyListOp(op, ['m', 'b', 'a'])) === '["a","b","z"]', 'list ops: prepend, append, delete onto a weaker list');
}

// ------------------------------------------------------------------
const KNOWN = `#usda 1.0
(
    "a comment"
    defaultPrim = "World"
    metersPerUnit = 1
    upAxis = "Z"
    doc = """two
lines"""
    customLayerData = {
        string app = "test"
        dictionary nested = {
            int n = 3
            double[] list = [1, 2.5]
            string "odd key" = "x"
        }
    }
    startTimeCode = 0
    endTimeCode = 10
)

def Xform "World" (
    kind = "assembly"
    prepend apiSchemas = ["MaterialBindingAPI"]
    customData = {
        bool flag = true
    }
)
{
    double3 xformOp:translate = (1, 2.5, -3)
    quatf xformOp:orient = (0.70710677, 0, 0.70710677, 0)
    uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:orient"]
    custom uniform string ifc:globalId = "2O2Fr$t4X7Zf8NOew3FLOH" (
        customData = {
            string unit = "m"
        }
        doc = "a GlobalId"
    )
    rel material:binding = </World/Looks/M>
    prepend rel others = [
        </World/A>,
        </World/B>,
    ]
    delete rel others = </World/C>

    def Mesh "Body" (
        prepend references = @./other.usda@</Thing> (offset = 2; scale = 0.5)
        inherits = </_class>
    )
    {
        int[] faceVertexCounts = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
        int[] faceVertexIndices = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2]
        point3f[] points = [(0, 0, 0), (1, 0, 0), (0.1, 1, 1e-7)]
        float[] widths = [0.5, 0.25, 0.5, 0.25, 0.5, 0.25, 0.5, 0.25, 0.5, 0.25, 0.5, 0.25, 0.5, 0.25, 0.5, 0.25, 0.5]
        texCoord2f[] primvars:st = [(0, 0), (1, 0), (0.5, 1)] (
            interpolation = "faceVarying"
        )
        int[] primvars:st:indices = [0, 1, 2]
        double radius.timeSamples = {
            0: 1,
            5: None,
            10: 2.5,
        }
        matrix4d m = ( (2, 0, 0, 0), (0, 3, 0, 0), (0, -0, 4, 0), (0.5, 0, 0, 1) )
        string[] names = ["a", "b\\"c", "d\\ne"]
        asset tex = @./tex.png@
        asset[] texs = [@a.png@, @b.png@]
        bool flag = true
        int64 big = 123456789012
        half h = 0.333
        quath[] qs = [(1, 0, 0, 0), (0, 1, 0, 0)]
        float f = inf
        token outputs:surface.connect = </World/Looks/M/S.outputs:surface>
        token blocked = None
    }
}

class "_class"
{
    double size = 2
}

over "Over"
{
}

def Xform "Opt" (
    variants = {
        string shape = "box"
    }
    prepend variantSets = "shape"
)
{
    variantSet "shape" = {
        "box" {
            def Cube "C"
            {
                double size = 2
            }
        }
        "ball" (
            kind = "component"
        ) {
            def Sphere "S"
            {
            }
        }
    }
}
`;
section('known answers: text → layer → text and binary');
{
  const L = U.readUsda(KNOWN);
  ok(L.meta('defaultPrim') === 'World' && L.meta('comment') === 'a comment' && L.meta('documentation') === 'two\nlines', 'layer metadata (default prim, comment, multi-line doc)');
  const cd = L.meta('customLayerData');
  ok(cd.get('nested').v.get('list').v[1] === 2.5 && cd.get('nested').v.get('odd key').v === 'x', 'nested dictionaries with arrays and quoted keys');
  ok(L.get('/World', 'kind') === 'assembly' && L.get('/World', 'apiSchemas').prependedItems[0] === 'MaterialBindingAPI', 'prim metadata and a prepended list op');
  ok(JSON.stringify(L.get('/World.xformOp:translate', 'default')) === '[1,2.5,-3]', 'double3 value');
  ok(L.get('/World.ifc:globalId', 'custom') === true && L.get('/World.ifc:globalId', 'variability') === 'uniform' && L.get('/World.ifc:globalId', 'documentation') === 'a GlobalId', 'custom uniform attribute with its metadata');
  const others = L.get('/World.others', 'targetPaths');
  ok(others.prependedItems.length === 2 && others.deletedItems[0] === '/World/C', 'relationship list op across two statements');
  const ref = L.get('/World/Body', 'references').prependedItems[0];
  ok(ref.asset === './other.usda' && ref.prim === '/Thing' && ref.offset.offset === 2 && ref.offset.scale === 0.5, 'a reference with a layer offset');
  ok(L.get('/World/Body', 'inheritPaths').explicitItems[0] === '/_class', 'inherits is the inheritPaths field');
  const ts = L.get('/World/Body.radius', 'timeSamples');
  ok(ts.length === 3 && ts[1][1] === null && ts[2][1].v === 2.5, 'time samples with a blocked sample');
  ok(L.get('/World/Body.names', 'default')[1] === 'b"c' && L.get('/World/Body.names', 'default')[2] === 'd\ne', 'string escapes');
  ok(L.get('/World/Body.f', 'default') === Infinity && L.field('/World/Body.blocked', 'default').t === 'block', 'inf and None');
  ok(L.get('/World/Body.points', 'default') instanceof Float32Array && L.get('/World/Body.points', 'default')[8] === Math.fround(1e-7), 'point3f[] as floats');
  ok(L.specs.has('/Opt{shape=ball}S') && L.get('/Opt{shape=ball}', 'kind') === 'component' && L.get('/Opt', 'variantSetChildren')[0] === 'shape', 'variant sets, variant metadata, prims inside variants');
  ok(L.get('/World/Body.outputs:surface', 'connectionPaths').explicitItems[0] === '/World/Looks/M/S.outputs:surface', 'connections');
  const t1 = U.writeUsda(L);
  const L2 = U.readUsda(t1);
  ok(U.writeUsda(L2) === t1, 'text → layer → text → layer → the same text');
  const c = U.writeUsdc(L);
  const L3 = U.readUsdc(c);
  ok(U.writeUsda(L3) === t1, 'text → binary → layer: the same text (' + c.length + ' bytes)');
  ok(L3.get('/World.xformOp:orient', 'default').map((x) => +x.toFixed(6)).join() === '0.707107,0,0.707107,0', 'a quaternion keeps [w, x, y, z] through binary');
  const m = L3.get('/World/Body.m', 'default');
  ok(Object.is(m[9], -0) && m[12] === 0.5, 'a matrix keeps −0 and its translation through binary');
  fs.writeFileSync(path.join(OUT, 'known.usda'), t1);
  fs.writeFileSync(path.join(OUT, 'known.usdc'), c);
}

section('packages (.usdz)');
{
  const layer = U.writeUsdc(U.readUsda(KNOWN));
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]);
  const z = U.writeUsdz([{ name: 'scene.usdc', bytes: layer }, { name: 'textures/a b.png', bytes: png }]);
  const r = U.readUsdz(z);
  ok(r.root === 'scene.usdc' && r.names.length === 2, 'two entries, the layer first');
  const off = (name) => r.files.get(name).byteOffset - z.byteOffset;
  ok(off('scene.usdc') % 64 === 0 && off('textures/a b.png') % 64 === 0, 'every entry starts on a 64-byte boundary');
  ok(r.files.get('textures/a b.png').every((v, i) => v === png[i]), 'entries come back byte for byte');
  const dv = new DataView(z.buffer);
  ok(dv.getUint32(14, true) === U.crc32(layer), 'CRC-32 in the header');
  ok(U.sniffUsd(z) === 'usdz' && U.writeUsda(U.readLayer(z)).includes('def Mesh "Body"'), 'a package opens as its root layer');
  let threw = '';
  try { U.writeUsdz([{ name: 'a.png', bytes: png }]); } catch (e) { threw = e.code; }
  ok(threw === 'bad_scene', 'a package must start with a layer');
  fs.writeFileSync(path.join(OUT, 'known.usdz'), z);
}

section('composition');
{
  const files = new Map(Object.entries({
    'root.usda': `#usda 1.0
(
    defaultPrim = "World"
    subLayers = [@weak.usda@]
)
def Xform "World"
{
    def "Chair" (
        references = @chair.usda@
        variants = {
            string color = "red"
        }
    )
    {
        double3 xformOp:translate = (10, 0, 0)
        uniform token[] xformOpOrder = ["xformOp:translate"]
    }
    def "Lamp" (
        prepend payload = @lamp.usda@</Lamp>
    )
    {
    }
    def "Loop" (
        references = @loop.usda@
    )
    {
    }
    def "Gone" (
        references = @missing.usda@
    )
    {
    }
    def Xform "Kid" (
        inherits = </_Base>
    )
    {
    }
}
class "_Base"
{
    custom double weight = 7
}
`,
    'weak.usda': `#usda 1.0
over "World"
{
    custom string note = "from the sublayer"
    custom string onlyWeak = "w"
    over "Chair"
    {
        custom double legs = 4
    }
}
`,
    'chair.usda': `#usda 1.0
(
    defaultPrim = "Chair"
)
def Xform "Chair" (
    prepend variantSets = "color"
    variants = {
        string color = "blue"
    }
)
{
    custom double legs = 3
    rel material:binding = </Chair/Looks/M>
    variantSet "color" = {
        "blue" {
            custom string paint = "blue"
        }
        "red" {
            custom string paint = "red"
        }
    }
    def Mesh "Seat"
    {
        point3f[] points = [(0, 0, 0), (1, 0, 0), (0, 1, 0)]
        int[] faceVertexCounts = [3]
        int[] faceVertexIndices = [0, 1, 2]
    }
    def Scope "Looks"
    {
        def Material "M"
        {
        }
    }
}
`,
    'lamp.usda': '#usda 1.0\ndef SphereLight "Lamp"\n{\n    float inputs:intensity = 5\n}\n',
    'loop.usda': '#usda 1.0\n(\n    defaultPrim = "L"\n)\ndef Xform "L" (\n    references = @loop.usda@\n)\n{\n}\n',
  }).map(([k, v]) => [k, enc.encode(v)]));
  const st = U.openStage('root.usda', { read: (n) => files.get(n) || null });
  const chair = st.prim('/World/Chair');
  ok(!!chair && chair.typeName === 'Xform' && chair.defined, 'a reference brings its prim (type, defined)');
  ok(U.valueAt(chair.props.get('legs')).v === 4, 'a sublayer\'s opinion beats the reference');
  ok(U.valueAt(chair.props.get('paint')).v === 'red', 'the stronger variant selection (the referencing prim\'s) wins');
  ok(chair.props.get('material:binding').targets[0] === '/World/Chair/Looks/M', 'targets inside a reference map onto the stage');
  ok(!!st.prim('/World/Chair/Seat') && U.meshOf(st.prim('/World/Chair/Seat')).counts.length === 1, 'children of a referenced prim compose');
  ok(U.valueAt(st.prim('/World').props.get('note')).v === 'from the sublayer', 'sublayer opinions on a prim');
  ok(U.valueAt(st.prim('/World/Lamp').props.get('inputs:intensity')).v === 5, 'a payload loads');
  ok(U.valueAt(st.prim('/World/Kid').props.get('weight')).v === 7, 'inherits from a class');
  ok(st.notes.some((n) => /missing\.usda/.test(n)) && st.notes.some((n) => /leads back/.test(n)), 'a missing file and a loop are left out with notes: ' + st.notes.join(' / '));
  const st2 = U.openStage('root.usda', { read: (n) => files.get(n) || null, loadPayloads: false });
  ok(!st2.prim('/World/Lamp').props.has('inputs:intensity') && st2.notes.some((n) => /payloads/.test(n)), 'payloads can stay unloaded');
  const st3 = U.openStage('root.usda', { read: (n) => files.get(n) || null, variants: { '/World/Chair': { color: 'blue' } } });
  ok(U.valueAt(st3.prim('/World/Chair').props.get('paint')).v === 'blue', 'a caller can choose a variant');
  const W = U.worldMatrix(st.prim('/World/Chair/Seat'));
  ok(W[12] === 10, 'the referencing prim\'s transform places the referenced geometry');
}

section('transforms and shapes');
{
  const L = U.readUsda(`#usda 1.0
(
    metersPerUnit = 0.01
    upAxis = "Y"
)
def Xform "A"
{
    double3 xformOp:translate = (1, 2, 3)
    float3 xformOp:rotateXYZ = (90, 0, 0)
    double3 xformOp:translate:pivot = (0, 1, 0)
    float3 xformOp:scale = (2, 2, 2)
    uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:translate:pivot", "xformOp:rotateXYZ", "xformOp:scale", "!invert!xformOp:translate:pivot"]
    def Xform "B"
    {
        uniform token[] xformOpOrder = ["!resetXformStack!", "xformOp:translate"]
        double3 xformOp:translate = (5, 0, 0)
    }
    def Cube "C" { double size = 4 }
    def Cylinder "Y" { token axis = "X" double height = 2 double radius = 0.5 }
}
`);
  const st = U.stageFromLayer(L);
  const A = U.worldMatrix(st.prim('/A'));
  const p = U.transformPoint(A, [0, 1, 0]);
  ok(p.every((v, i) => Math.abs(v - [1, 3, 3][i]) < 1e-9), 'translate, pivot, rotate, scale, inverse pivot: the pivot stays put (' + p.map((x) => x.toFixed(3)) + ')');
  const q = U.transformPoint(A, [0, 2, 0]);
  ok(Math.abs(q[2] - 5) < 1e-9 && Math.abs(q[1] - 3) < 1e-9, 'a 90° turn about X moves +Y to +Z about the pivot, scaled by 2');
  const B = U.worldMatrix(st.prim('/A/B'));
  ok(B[12] === 5 && B[13] === 0, '!resetXformStack! ignores the parent');
  const F = U.stageFrame(st);
  const r = U.transformPoint(F, [0, 100, 0]);
  ok(Math.abs(r[2] - 1) < 1e-12 && Math.abs(r[1]) < 1e-12, 'a Y-up centimetre stage: 100 units up → 1 m along Z');
  const cube = U.meshOf(st.prim('/A/C'));
  ok(cube.counts.length === 6 && Math.max(...cube.points) === 2, 'a Cube of size 4 is six faces ±2');
  const cyl = U.meshOf(st.prim('/A/Y'));
  let mx = 0; for (let i = 0; i < cyl.points.length; i += 3) mx = Math.max(mx, Math.abs(cyl.points[i]));
  ok(Math.abs(mx - 1) < 1e-12, 'a Cylinder along X reaches ±height/2 on X');
}

section('the builder (docs/USD-CONVENTIONS.md)');
{
  const b = new U.UsdBuilder({ app: 'Test', source: '/home/someone/Project.ifc' });
  const g = b.group(b.root, '3rd floor', { kind: 'group' });
  const g2 = b.group(b.root, '3rd floor');
  ok(g === '/World/_3rd_floor' && g2 === '/World/_3rd_floor_2' && b.layer.get(g, 'displayName') === '3rd floor', 'names: identifiers, clashes numbered, the real name in displayName');
  const m1 = b.material('Brick', { base_color: [0.5, 0.1, 0.05] }), m2 = b.material('Brick', {});
  ok(m1 === m2 && b.layer.get(m1 + '/OpenPBR.info:id', 'default') === 'ND_open_pbr_surface_surfaceshader', 'one material per name, OpenPBR through MaterialX');
  ok(!b.layer.specs.has(m1 + '/OpenPBR.inputs:specular_ior'), 'OpenPBR defaults are not written');
  ok(b.layer.get('/', 'customLayerData').get('cadcraft').v.get('source').v === 'Project.ifc', 'the source file name, never its folder');
  const mesh = b.mesh(g, 'Body', { points: [0, 0, 0, 1, 0, 0, 0, 1, 0], counts: [3], indices: [0, 1, 2] }, { material: m1 });
  ok(b.layer.get(mesh + '.material:binding', 'targetPaths').explicitItems[0] === m1 && b.layer.get(mesh, 'apiSchemas').prependedItems.includes('MaterialBindingAPI'), 'a mesh bound to its material');
  const ext = b.layer.get(mesh + '.extent', 'default');
  ok(Array.from(ext).join() === '0,0,0,1,1,0', 'extent written');
  fs.writeFileSync(path.join(OUT, 'built.usda'), b.write('usda'));
  fs.writeFileSync(path.join(OUT, 'built.usdc'), b.write('usdc'));
  fs.writeFileSync(path.join(OUT, 'built.usdz'), b.usdz());
}

section('refusals and fuzz');
{
  const refuse = (bytes, code, what) => { let c = ''; try { U.readLayer(bytes); } catch (e) { c = e.code; } ok(c === code, what + ' → ' + (c || 'no error')); };
  refuse(enc.encode('hello'), 'not_usd', 'plain text');
  refuse(enc.encode('#usda 1.0\ndef "A" {'), 'damaged', 'an unclosed prim');
  refuse(enc.encode('#usda 1.0\ndef "A" { float x = "no" }'), 'damaged', 'a value of the wrong type');
  refuse(enc.encode('#usda 1.0\n' + 'def "A" {'.repeat(100) + '}'.repeat(100)), 'damaged', 'nesting deeper than the cap');
  const c = fs.readFileSync(path.join(OUT, 'known.usdc'));
  refuse(c.subarray(0, 60), 'damaged', 'a binary file cut inside its header');
  const v = Uint8Array.from(c); v[8] = 9; refuse(v, 'unsupported', 'a binary version from the future');
  if (!NO_FUZZ) {
    const files = ['known.usda', 'known.usdc', 'known.usdz', 'built.usdc'].map((f) => fs.readFileSync(path.join(OUT, f)));
    const results = await Promise.all(files.map((b, k) => new Promise((resolve) => {
      const cuts = [];
      for (let i = 1; i <= 24; i++) cuts.push(Math.floor((b.length * i) / 25));
      const wk = new Worker(fileURLToPath(import.meta.url), { workerData: { bytes: b, cuts, flips: 40, seed: 99 + k } });
      const timer = setTimeout(() => { wk.terminate(); resolve([{ tag: 'timeout', bad: 'took over 60 s' }]); }, 60000);
      wk.on('message', (m) => { clearTimeout(timer); resolve(m); });
      wk.on('error', (e) => { clearTimeout(timer); resolve([{ tag: 'crash', bad: String(e) }]); });
    })));
    const all = results.flat();
    const bad = all.filter((r) => r.bad);
    ok(!bad.length, `${all.length} cut and flipped files: only a UsdError or a layer` + (bad.length ? ': ' + bad.slice(0, 2).map((r) => r.tag + ' ' + r.bad).join(' | ') : ''));
  }
}

// ------------------------------------------------------------------ the oracle
if (!oracle) console.log('\n(no USD oracle at ' + PY + ': library checks skipped)');
else {
  section('the reference library as oracle');
  const text = (f) => oracle(['text', f]);
  const known = path.join(OUT, 'known.usda');
  const ref = text(known);
  ok(text(path.join(OUT, 'known.usdc')) === ref, 'the library reads our binary as it reads our text');
  oracle(['export', known, path.join(OUT, 'lib.usdc')]);
  fs.writeFileSync(path.join(OUT, 'lib-back.usda'), U.writeUsda(U.readUsdc(fs.readFileSync(path.join(OUT, 'lib.usdc')))));
  ok(text(path.join(OUT, 'lib-back.usda')) === ref, 'we read the library\'s binary as the library reads the text');
  fs.writeFileSync(path.join(OUT, 'files.json'), JSON.stringify(['built.usda', 'built.usdc', 'built.usdz', 'known.usdz'].map((f) => path.join(OUT, f))));
  const checks = JSON.parse(oracle(['many', 'check', path.join(OUT, 'files.json')]));
  const errs = Object.entries(checks).flatMap(([f, l]) => (l === null ? [f + ': unreadable'] : l.filter((e) => /Error/.test(e.type) && !/MissingReference|CompositionError|unresolvable/.test(e.validator + e.message)).map((e) => path.basename(f) + ' ' + e.validator)));
  ok(!errs.length, 'the library\'s validators find no error in the builder\'s .usda / .usdc / .usdz and our package' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));

  if (NO_CORPUS || !fs.existsSync(CORPUS)) console.log('  (corpus skipped)');
  else {
    const files = walk(CORPUS).filter((f) => /\.(usda|usdc|usd)$/i.test(f)).sort();
    fs.writeFileSync(path.join(OUT, 'corpus.json'), JSON.stringify(files));
    const refs = JSON.parse(oracle(['many', 'text', path.join(OUT, 'corpus.json')]));
    const ours = [];
    const back = new Map();
    let readOk = 0;
    const readBad = [];
    files.forEach((f, k) => {
      if (refs[f] === null) return;
      try {
        const L = U.readLayer(fs.readFileSync(f));
        readOk++;
        const a = path.join(OUT, 'c' + k + '.usda'), c = path.join(OUT, 'c' + k + '.usdc');
        fs.writeFileSync(a, U.writeUsda(L));
        fs.writeFileSync(c, U.writeUsdc(L));
        ours.push(a, c);
        back.set(a, f); back.set(c, f);
      } catch (e) { if (readBad.length < 3) readBad.push(path.relative(CORPUS, f) + ': ' + e.message); }
    });
    const readable = files.filter((f) => refs[f] !== null).length;
    ok(readOk === readable, `we read ${readOk} / ${readable} corpus layers the library reads` + (readBad.length ? ': ' + readBad.join(' | ') : ''));
    fs.writeFileSync(path.join(OUT, 'ours.json'), JSON.stringify(ours));
    const got = JSON.parse(oracle(['many', 'text', path.join(OUT, 'ours.json')]));
    const diffs = ours.filter((o) => got[o] !== refs[back.get(o)]);
    ok(!diffs.length, `${ours.length - diffs.length} / ${ours.length} of our re-writes (.usda and .usdc of every layer) read the same in the library` + (diffs.length ? ': ' + diffs.slice(0, 3).map((d) => path.relative(CORPUS, back.get(d)) + ' as ' + path.extname(d)).join(', ') : ''));
    // world points of every mesh
    const pts = JSON.parse(oracle(['many', 'points', path.join(OUT, 'corpus.json')]));
    let scenes = 0, meshes = 0, worst = 0;
    const missing = [];
    for (const f of files) {
      const r = pts[f];
      if (!r) continue;
      scenes++;
      const st = U.openStage(f, { read: (n) => { try { return fs.readFileSync(n); } catch { return null; } } });
      const F = U.stageFrame(st);
      for (const [p, want] of Object.entries(r)) {
        const prim = st.prim(p);
        const m = prim && U.meshOf(prim);
        if (!m) { if (want.points.length && missing.length < 3) missing.push(path.relative(CORPUS, f) + ' ' + p); continue; }
        meshes++;
        const W = U.mul(F, U.worldMatrix(prim));
        let scale = 1;
        for (const q of want.points) for (const c of q) scale = Math.max(scale, Math.abs(c));
        for (let i = 0; i < want.points.length; i++) {
          const q = U.transformPoint(W, [m.points[i * 3], m.points[i * 3 + 1], m.points[i * 3 + 2]]);
          for (let c = 0; c < 3; c++) worst = Math.max(worst, Math.abs(q[c] - want.points[i][c]) / scale);
        }
      }
    }
    ok(!missing.length && worst < 1e-5, `${meshes} meshes in ${scenes} composed scenes: world points agree with the library (worst ${worst.toExponential(1)} of the scene size)` + (missing.length ? '; missing ' + missing.join(', ') : ''));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
fs.rmSync(OUT, { recursive: true, force: true });
process.exit(fail ? 1 : 0);

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}
