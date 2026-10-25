# F02 precision fixtures

Eight synthetic IFC4 files: millimetres, metres, conversion-based inches and feet, each
near the origin and translated. `cases.json` records units and local/project translations.
Each file has three 5 m chord walls (straight, bulge +0.25, bulge -0.25), a ventilated
25.4 mm cavity, an ordered zero-width membrane, explicit core and 18 named-reference
dimensions. Geometry and review GlobalIds are deterministic and committed independently
of F01; do not regenerate F01 fixtures.

`node tests/features/f02/fixtures.mjs --generate` intentionally regenerates these F02
seeds. Review identities derive from case/entity order, not random generation. STEP export
header time can differ; geometry and identity checks do not depend on header time.

Run `node --test tests/features/f02/contract.test.mjs` (also in `test:baseline` and CI).
It compares points to independently written analytic formulas through ten edits,
undo/redo, material-default edits and save/reopen per file. Outputs and numeric reports
go to `.cc-test/f02/`; the seed files are read-only during tests.

After the Node suite, run Python 3.12 with F01's pinned independent requirements:
`python -I tests/features/f02/independent.py`. It checks all eight seeds and eight final
exports with IfcOpenShell, including schema/EXPRESS, Body geometry, actual exported curves,
unit conversion, translations, layer semantics and identity continuity.

`node tests/features/f02/review-fixtures.mjs` makes `.cc-test/f02-review/unsupported.ifc`
and `missing-host.ifc` for UI review. These deliberately unsupported inputs are not schema
migration suggestions. See the feature contract and handoff for supported recovery.
