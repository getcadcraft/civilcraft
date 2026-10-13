# tools/dwg-test — cc-dwg test harness (builder H)

Spec: `docs/DWG-LIB-SPEC.md`. Oracles are black boxes (clean-room rule): we run them and compare outputs.

## Corpus — public sources only (rebuilt 2026-10-12, 0.4)

`/var/www/CADCRAFT/testfiles/dwg-corpus/` (outside the repo: 150 MB, made by the ODA File Converter). Sources: Autodesk's
public samples in `testfiles/dwg-samples` and the repo's `fixtures/dwg` + `fixtures/folder` (fixtures/README.md). No
client drawings: a check that needs one (AEC objects) reads `testfiles/PRIVATE-DWG.txt` (`lib/util.mjs privateDrawings`)
and skips it when that list is absent, as in a clone.

```
manifest.json             sources (path, sha256, size, version, duplicateOf) + files (dir, name, version, size, sha256, ODA notes, truth summary)
orig/<name>.dwg           each source as it came (its own version: AC1015…AC1032)
AC1015/ AC1018/ AC1021/ AC1024/ AC1027/ AC1032/<name>.dwg   the same drawing saved by the ODA File Converter (audit on)
_truth/<dir>/<name>.dxf        ODA → DXF 2018 of that corpus file (audit on; <name>.dxf.err when ODA repaired something)
_truth/<dir>/<name>.json       ezdxf dump of that DXF in the common entity form (see "Entity form")
_truth/<dir>/<name>.meta.json  corpus sha256 it was made from, ODA ms / peak MB, entity counts
```

13 distinct drawings (14 source files; `fixtures/folder/.../ELECTRICAL.dwg` = `fixtures/dwg/base-plan.dwg`) × 7 = 85 usable
files, 20 MB. `curb-details` is the fixture folder's 10-byte stub ("AC1027fake"): only `orig/` exists and ODA cannot read
it — a reader must report it, never crash. Biggest: `kitchen-equipment` (6,337 entities incl. block contents; item tags,
three sheets, an image, an xref, a multileader).
Quick set (`--quick`): `example-2000 … example-2018` (213 entities each, every common type + REGION,
3DSOLID, TABLE, MULTILEADER, MLINE, WIPEOUT, LIGHT, TOLERANCE, ARC_DIMENSION).

Rebuild / refresh (cached by sha256; only changed sources are redone):
`node tools/dwg-test/corpus.mjs [--force] [--no-truth] [--quick] [--files a,b] [--versions AC1015,orig]`

## Entity form (truth, oracles and ours compare in it)

`{ h, t, layer, owner, space, g }` — `h` handle upper-case hex (no leading zeros), `t` DXF type (all
POLYLINE kinds are `POLYLINE` with `g.kind` 2d|3d|pface|mesh; ATTRIBs are their own entities with
`g.insert` = the INSERT's handle; VERTEX/SEQEND folded), `owner` block name (`*Model_Space`,
`*Paper_Space…`, or the block), `space` model|paper|block. Geometry `g`, angles in **radians**, points `[x,y,z]`:
LINE a b · POINT p · CIRCLE c r · ARC c r a0 a1 · ELLIPSE c maj ratio p0 p1 · LWPOLYLINE closed elev pts[[x,y,bulge]]
· POLYLINE kind closed pts · TEXT/ATTRIB/ATTDEF ins h rot text (+ ha va align, tag, prompt) · MTEXT ins h w attach text
· INSERT/MINSERT name ins sx sy sz rot (+cols rows) · DIMENSION dimtype(&7) defp mid block text · HATCH pattern solid loops
· SPLINE degree ctrl knots fit · SOLID/TRACE/3DFACE v[4] · VIEWPORT c w h · LEADER pts · RAY/XLINE p dir.
Builders: `lib/dump.py` (any DXF via ezdxf), `lib/normalize.mjs` (our `readDwg` model, libredwg-web's database).

## Harness

```
node tools/dwg-test/compare.mjs            # everything → dwg-comparison-report.html + .json at the repo root (partial runs: tmp/dwg-compare/)
  --quick                                  # only example-2000 … example-2018 (all 7 containers each)
  --files kitchen-equipment,example-2004   # name filter (substring)
  --versions orig,AC1018                   # corpus dirs to read (orig = the source files as they came)
  --readers ours,libredwg                  # limit the readers (ODA truth is always shown)
  --targets AC1015,AC1032                  # writer target versions (default all six)
  --writer-from orig                       # writer inputs: only orig/ files (default: every selected corpus file)
  --no-reader | --no-writer | --fresh (ignore cache) | --keep (keep DXFs) | --jobs 8
node tools/dwg-test/test.mjs [--verbose] [--only bits,crc,lz,r2007,rs,header,read]
node tools/dwg-test/corpus.mjs             # (re)build the corpus + truth; cached by sha256
```

- **Our reader/writer plug in by themselves**: compare.mjs probes `lib/dwg/index.js` (`readDwg`, `writeDwg`,
  and `lib/dwg/civil.js fromCivilList` for CivilCraft's drawings) in a child process (`ours-run.mjs`); until they
  exist every "Ours" cell says "not built yet". Cache keys include a hash of every file in `lib/dwg`, so any
  change there re-runs ours (and only ours).
- Readers (`oracles.mjs`): ours, LibreDWG 0.14 CLI (`dwgread -v2` → ERROR/Warning lines; `dwg2dxf` → DXF),
  libredwg-web 0.7.17 (`lwweb-run.mjs`, public API only), libdxfrw (`dwg2dxf -v2000`, matched by content: it
  renumbers handles), ODA File Converter (DWG → DXF 2018, audit on; ≤ 6 instances, one Xvfb display each).
  DXFs are read by `lib/dump.py` (ezdxf, `tools/civilcraft-test/venv`). Time = the reader's own; memory = peak
  RSS of its process (`/usr/bin/time -v`).
- Matching (`lib/match.mjs`): by handle for readers, by content (type, layer, owner, geometry) for writer round
  trips; numbers 1e-9 relative, angles mod 2π, text exact after decoding. A fit-point SPLINE compares fit points
  only (the DWG stores no control points; ODA's DXF adds computed ones). Anonymous block names are compared by
  kind (`*D`, `*U`, `*T`, `*Paper_Space`) because every writer renumbers them.
- Writer inputs: `civil-cases.mjs` rebuilds CivilCraft's three test drawings (fixture via CivilCraft's own
  modules; every-kind and big are literal copies of `bin/test-civilcraft.mjs`'s lists — keep in step). Baseline
  rows: CivilCraft's own R2000 `dwg-write.js` (the seed) on the same three drawings.
- Work files: `tmp/dwg-compare/{cache,work,written,civil}`; delete `cache/` to start over.
- Run times (8 cores): reader section ~2.5 min cold, ~20 s cached; the full writer section is 123 inputs × 6
  versions × 4 readers ≈ 28 min cold — iterate with `--writer-from orig` (21 inputs) or `--quick`, and run the
  full set before handing back. A cell's mismatch list marks "= LibreDWG, libredwg-web" where another DWG reader
  read exactly the same value as ours (then the difference is most likely ODA's DXF, not our reader).
