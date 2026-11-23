<!-- SPDX-License-Identifier: Apache-2.0 -->
# lib/acoustics — the shared sound engine (XE.3)

DOM-free, Apache-2.0, our own code. Canonical here; hosts carry byte-identical copies from `node tools/acoustics/sync.mjs [--check] bimcraft` (never edit a copy).
Plan: `docs/0.8-SOUND-SPEC.md`. Every coefficient is cited in its file; nothing is typed from memory (KICKOFF rule 66).

| File | What | Phase |
|---|---|---|
| `acoustics.js` | bands, absorption defaults (`MATERIALS`), ISO 9613-1 air absorption, Sabine/Eyring `reverb()`, Problems | S1 |
| `acoustics-ir.js` | FFT, computed impulse response, dry sounds, convolution, WAV | S1 |
| `metrics.js` | ISO 3382-1 measures from an impulse response, WAV reader, measured vs predicted | S1 |
| `stat.js` | box room with uneven absorption (Fitzroy, Arau-Puchades) | S2 |
| `geo.js` | image sources of a box, ray tracing of any room of convex planar polygons, echogram measures, seat maps | S2 |
| `simplify.js` | **the BIM → acoustic model**: plan outline + height + per-wall finishes + openings → a closed model of convex surfaces for `traceRoom`, with a simplification tolerance, closure and volume checks and the same room as a `reverb()` spec | S2 |
| `outdoor.js` + `cnossos.js` | **outdoor propagation by CNOSSOS-EU** (Directive (EU) 2015/996 Annex II § 2.5 as amended by 2021/1226): mean ground plane, Gpath/G′path, Adiv, Aatm, Aground in homogeneous and favourable conditions, diffraction over one or more edges with the 2021 rules (rubber band, curved rays, Rayleigh criterion, Δground on both sides), image-source power, LH/LF/long-term level, dB(A); `cnossos.js` = the values the directive fixes, each cited | S4 (propagation) |
| `pathfind.js` | **the paths besides the direct one** (path finding is the software's, § 2.5.3): image sources in plan off barriers and building façades, order 1–2, with the 0.5 m reflector rules and retrodiffraction (eq. 2.5.35–2.5.38, 2021 point (9)(j)); lateral paths round vertical edges in the lateral plane (2021 point (9)(i)), levelled by `outdoor.js lateralLevels` (eq. 2.5.33–2.5.34); the railway next to a reflecting barrier as one equivalent source (eq. 2.5.39–2.5.48) | S4 |
| `road.js` + `cnossos-road.js` | CNOSSOS-EU road emission (§ 2.2, Appendix F as replaced in 2021): rolling and propulsion noise per category, surfaces, temperature, gradient, studded tyres, junctions → LW′ per metre | S4 |
| `rail.js` + `cnossos-rail.js` | CNOSSOS-EU railway emission (§ 2.3, Appendix G as amended in 2021): rolling, impact, squeal, traction, aerodynamic, bridge → LW′ per metre at 0.5 m and 4 m, directivity | S4 |
| `indicators.js` | Lden and Lnight of Directive 2002/49/EC Annex I (refs/acoustics/eu-2002-49-en.pdf): the formula with the period hours (12/4/8, or a 2–3 h evening), the 4 m mapping height | S4 |
| `modes.js` | box modes, Schroeder frequency, small FDTD | S6 |
| `insul.js` | ISO 717 single numbers, mass law | S3 (part) |

Tests: `node tools/acoustics-test/test.mjs`, `geo-test.mjs`, `simplify-test.mjs`, `outdoor-test.mjs`, `pathfind-test.mjs`, `road-test.mjs`, `rail-test.mjs`, `noise-addon-test.mjs`, `indicators-test.mjs`; BimCraft adapter `node bin/test-bimcraft.mjs --acoustics`; real page
`node tools/bimcraft-test/browser-acoustics.mjs` (root); SuperCad mount `node tools/super-test/acoustics-mount.mjs`; CivilCraft Outdoor noise add-on `node tools/acoustics-test/browser-noise.mjs` (root). The add-on (`civilcraft/dev/addons/outdoor-noise/`) carries copies from `node tools/acoustics/sync.mjs civilcraft-noise`. It puts road and rail sources on their design profile and takes the ground from CivilCraft's graded surface when the project has one (switch in the panel).

Not built, each waiting on a document in
`/var/www/CADCRAFT/refs/acoustics/` (see `docs/0.11-sessions/sound-11.md`): Lden (Annex I of Directive 2002/49/EC), ISO 9613-2 and the official CNOSSOS software test cases (ISO/TR 17534-4), STI (IEC 60268-16), flanking (ISO 12354-1/-2), the HVAC duct path (a published duct-noise method with a worked example), and BRAS benchmark rooms.
