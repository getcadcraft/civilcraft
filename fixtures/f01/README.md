# F01 synthetic residential review fixture

Provenance: generated on 2026-10-21 by `tests/features/f01/fixture.mjs` using this repository's public model operations. Apache-2.0, same as the repository; no client, manufacturer or external project content. Millimetre IFC4 model, one ground floor, four exterior walls and one partition, 2700 mm high, one 900 × 1200 mm fixed window with 900 mm sill. Recipes are illustrative, not construction specifications.

- `house.ifc`: committed seed, exterior assembly 209.55 mm, stud core 139.7 mm; interior type 114.3 mm with 88.9 mm core. Exterior layers: siding 19.05, ventilated cavity 25.4, membrane 0, OSB 12.7, framing core 139.7, gypsum 12.7 mm. Both types use explicit core flags. Exterior walls use core-center location lines.
- `edited-reopened.ifc`: same identities after siding becomes 50.8 mm, total 241.3 mm, and the wood-framing material default becomes 200 mm without resizing either existing assembly.
- `missing-host.ifc`: derivative after deleting the south exterior host; both reference dimensions remain stored as missing, without stale numeric geometry. Undo is tested in the generating lifecycle; it is not serialized as file history.

Two dimensions on the south wall measure finish-to-finish and core-to-core. At whole-house plan scale their short labels may be suppressed. **Annotate → Reference dimensions…** reports their values/status; the exported detail is the print evidence.

1. Start the documented 8016 preview and choose `house.ifc`; turn on **Draw**.
2. Choose **Wall**, set **Wall type** to **F01 exterior cavity wall**, then **Wall assemblies…**. The top-level button uses the current drawing type, not necessarily the selected model wall.
3. Change siding from `19.05 mm` to `50.8 mm`, save the existing type. Total changes from 8 1/4 to 9 1/2 inches; core stays 5 1/2 inches. Check both dimension values in the reference list. Undo and redo.
4. In **Material library…**, change Wood framing's default to `200 mm`. Existing wall/core dimensions must stay fixed. Cavity remains 25.4 mm and ventilated; house wrap remains zero.
5. Save a new IFC through File, reopen it in a separate test tab, and inspect types/materials/reference dimensions again. Do not overwrite the committed seed. The lifecycle script automates and asserts this same persistence path through `IfcEditor.save()` and `IfcAPI.OpenModel()`.
6. Open the supplied missing-host derivative separately; the reference list should say the host is missing. It must not show a plausible stale numeric dimension.

`node tests/features/f01/fixture.mjs --verify --export` replays the lifecycle without changing seed identities and emits PDF/IFC/JSON evidence in `.cc-test/f01-fixture`. `npm run fixture:f01` intentionally creates new seed GUIDs; copy derivatives only when intentionally replacing the fixture set. Material IDs, type keys, wall GlobalIds and dimension reference IDs are asserted within each lifecycle. `evidence/f01/verification.json` identifies the committed seed used for delivery evidence.

Independent validation follow-up: the original seed's five material-property Name values and missing owner-history modification timestamp were repaired without changing GUIDs or geometry. Derivatives were regenerated after fixing duplicate type memberships. All three now pass IfcOpenShell schema and EXPRESS checks, geometry/dimension/identity checks, and web-ifc counts/mesh readback; web-ifc material/color diagnostics for a null cavity material remain documented. See `evidence/f01/independent/`. `--output-dir .cc-test/f01-generated` generates a separate set for testing producers without replacing the committed identities.
