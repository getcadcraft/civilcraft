# partcraft — PartCraft from the command line

Node 24. Runs PartCraft's own DOM-free modules from `public_html/assets/apps/partcraft/dev` and builds with the same exact
kernel (OpenCascade, `public_html/assets/vendor/replicad-opencascadejs/current`). When OpenCascade cannot load, it builds
with manifold-3d (faceted; fillets, chamfers, shells and imports are not built) and says so. `--kernel mesh` forces that.

```
node tools/partcraft-cli/partcraft.mjs <command> <part> [options]
```

`<part>` is a `.partcraft.json` or a `.pcscript`. Commands that change a part write a `.json` back in place, or to
`-o/--out`. A `.pcscript` is never rewritten in place (its comments would be lost): give `-o`.
Every command takes `--json`. Exit codes: **0** ok · **1** problems (a check finding, a failing feature, an equation error,
an ambiguous `drive`, a script error) · **2** bad usage.

| Command | |
|---|---|
| `info <part> [--no-build]` | features (status, rollback bar), parameter/equation counts, the solid's volume, area, size |
| `params <part>` | variables (expression → value) and equations (target → value) |
| `set <part> name=value …` | forward. A parameter (`width=150`, `margin=bolt*1.5`; a new name adds it), a number by name (`Base.depth=12`, `Sketch1.D3=40`, `"Hole1 diameter=8"`, or the key `f2.depth`); `Base.depth==thick` (or any expression) links it. A plain number on a driven number is refused with the way out. |
| `drive <part> <target or var>=<number> [--prefer v]` | backward: solves the driving parameter through the equation chain; several → exit 1 listing them |
| `build <part> --out f.step\|.stl\|.3mf\|.json\|.pcscript\|.swb` | `--set k=v` (this build only), `--upto <feature>` (built up to and including it), `--format ap214` for an AP214 STEP |
| `build <part> --table t.csv --out-dir d [--format step]` | one file per design-table row, named by the row |
| `script <in.pcscript> -o part.json` | script → part (a `step-file` is read beside the script) |
| `to-script <part> -o x.pcscript [--exact]` | part → script (+ the STEP of each import beside it); `--exact` writes every digit |
| `rollback <part> [<feature> \| --steps n]` | bar up one feature (default), n, or above a feature |
| `forward <part> [--steps n \| --end]` | bar down |
| `check <part> [--strict] [--no-build]` | the operator-discipline lint (below) |

## check

Errors (exit 1): over-defined sketches (conflicting or redundant relations, named), features that fail to build (exact
kernel), parameter errors and cycles, equation errors. Warnings: under-defined sketches (degrees of freedom), numbers typed
into features/dimensions that no parameter drives (only fields that matter in the feature's mode; a 360° full turn is
not counted), parameters no equation uses, equations whose stored value is stale, suppressed features, the rollback bar
not at the end. `--strict` makes every warning an error.

## Example

```
$ node tools/partcraft-cli/partcraft.mjs script examples/bracket.pcscript -o bracket.partcraft.json
Wrote bracket.partcraft.json: 4 features, 5 parameters, 8 equations.
$ node tools/partcraft-cli/partcraft.mjs drive bracket.partcraft.json HoleCentres.D3=130
error: HoleCentres D3 (horizontal distance) depends on width, bolt. Pick which one to change.
Pick one with --prefer: width, bolt.
$ node tools/partcraft-cli/partcraft.mjs drive bracket.partcraft.json HoleCentres.D3=130 --prefer width
width: 120 → 142.75, so that HoleCentres D3 (horizontal distance) = 130.
  driven: Plate D1 (distance): 120 → 142.75
  driven: HoleCentres D3 (horizontal distance): 107.25 → 130
Wrote bracket.partcraft.json.
$ node tools/partcraft-cli/partcraft.mjs build bracket.partcraft.json --table sizes.csv --out-dir sizes
```

The script format is described at the top of `public_html/assets/apps/partcraft/dev/script.js` and in the help topic
"Scripts and the command line". `.swb` output needs builder B's `swmacro.js` (`partToSwb(part, {regen, name})`); the macro
is written as Windows-1252 with CRLF and has not been run in SolidWorks (it is not available here).

Tested by `node bin/test-partcraft-params.mjs` (section "command line tool", spawned).
