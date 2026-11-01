<!-- SPDX-License-Identifier: Apache-2.0 -->
# Plumbing plan symbols: sources

Set `plumbing` (lib/symbols/sets/plumbing-set.js), 0.8 GH.3-G. Clean room (KICKOFF rule 32): every drawing was made by CadCraft
for this set from the geometry of the fixtures and the conventions listed here. No other product's or maker's symbol file was
opened, traced or converted, and no GPL or unclear-licence art is used. The set is licensed Apache-2.0.

## What each group was drawn from

| Group | Drawn from |
|---|---|
| Fixtures (water closet, urinal, lavatory, bathtub, shower, sinks) | Their usual plan footprints: a tank and bowl outline, a rim with a basin and drain circle, a tub with an inner basin, a square tray with crossed diagonals. Sizes are typical (a 1700 x 700 mm tub, a 900 x 900 mm shower, a 1200 x 600 mm double sink), not any maker's product. |
| Drains (floor drain, cleanout) | Plan conventions: a square with a circle and cross for a floor drain; a circle with a cross for a floor cleanout; a half circle on the wall for a wall cleanout. |
| Supply outlets, water heater | A stub ending in a cross bar for the hose bib (HB) and, with a ring on the stub, the wall hydrant; a circle with WH inside for the water heater. |
| Valves | The common valve glyphs of piping drawings: two triangles meeting at the stem (gate), the same with a filled disc (globe), with a ring (ball), a triangle against a bar (check), a bar across (butterfly). |
| Line styles | Continuous (cold water), dashed (hot water), dash-dot (hot water return), long dash (waste), dotted (vent), with the abbreviation in the line: CW, HW, HWR, W, V, SD, G. |

## What we claim, exactly

**Common plumbing plan conventions, drawn by us; not certified to ISO 4067-1 or ASME Y32.4.** Nobody holding those standards has certified the set, and
ASME Y32.4 had no public readable copy. Below, each of the 26 symbols is compared with the public material we could read (checked 2026-10-29, gh3g2_PART_3).
"Matches" means the same convention as that source, drawn by our own geometry; it is not a clause-by-clause certification. Never write "per ISO 4067-1" or
"per ASME Y32.4" about this set. Drawing sets differ from each other (the sources below disagree in several places), so the legend of the project governs.

## The public sources that were readable

| Tag | Source | Where |
|---|---|---|
| ISO | ISO 4067-1:1984, Technical drawings, Installations, Part 1 (plumbing, heating, ventilation, ducting symbols). The publisher-hosted preview of the 1984 edition (iTeh), nine pages with clauses 4.1 to 4.5 readable. That edition is listed as withdrawn by the stores that sell it; the current text, if any, was not available. | https://cdn.standards.iteh.ai/samples/9778/a83dd62d0add4ca3b6d369ed44b95fdb/ISO-4067-1-1984.pdf |
| ARMY | US Army Engineer School, Plumbing I, "Prepare a plumbing takeoff list" (subcourse EN5110), Lesson 1: Fig. 1-5 water pipeline symbols, Fig. 1-11 valve symbols, Fig. 1-13 fixture symbols. A US government work. | https://archive.org/download/MManuals/UsArmyPlumbingIPreparePlumbingTakeoffList.pdf |
| DANE | Dane County (Wisconsin) Public Works bid set, Day Resource Center, sheet PD100 "Plumbing abbreviations" and "Plumbing symbols". A county government document. | https://publicworks.danecounty.gov/BidHistory/Document/4bd12d3b-ccea-433a-a238-a42eaa61cafd?bid=513 |
| OSU | Oregon State University bid set, Azalea House, sheet P-001 "Symbols, legends and abbreviations, plumbing" (plumbing specialties, misc. valves and cocks). A public university document. | https://bid.oregonstate.edu/opportunity/viewFile/48912/Plumbing-Azalea-House.pdf?1712705192 |
| COS | J. J. Cosgrove, Plumbing Plans and Specifications, "Symbols for plumbing plans", parts 2 and 4 (Figs. 6 to 17, 32 to 39). An old textbook; its date and licence are not stated on the page and only the words were read (no figures), so it is used for descriptions only. | https://www.chestofbooks.com/home-improvement/construction/plumbing/Plans-Specifications/Symbols-For-Plumbing-Plans-Part-4.html |

Not found in a readable public form: ASME Y32.4; the current ISO 4067-1; US Navy NAVEDTRA 14040 and Army FM 3-34.471 symbol pages (searched, not readable); the
International Plumbing Code (it has no plan symbol diagrams). No source's artwork was copied: each source was only looked at for the convention.

## Verdict per symbol

Verdict: **matches** (same convention as at least one readable source, none contradicting it), **differs** (says how), **no source** (no public source found).

| # | Symbol (set key) | Convention we follow | Public source (clause / figure) | Verdict |
|---|---|---|---|---|
| 1 | Water closet `wc` | A tank rectangle against the wall with the bowl in front, round or oval | ARMY Fig. 1-13 (WC wall hung with tank, low tank: round bowl, rectangular tank at the wall); COS Fig. 36 (plan symbol, any type of closet) | matches |
| 2 | Urinal `urinal` | Wall-hung bowl: flat back on the wall, rounded front, with a drain | ARMY Fig. 1-13 (urinal wall hung: curved bowl; stall and trough types are boxes, not in our set) | matches (wall-hung type only) |
| 3 | Lavatory `lav` | Rectangle with an oval basin, tap and drain | COS Fig. 34 (rectangle with an oval opening and two cocks); ARMY Fig. 1-13 (wall-hung lavatory: plain rectangle, simpler) | matches |
| 4 | Bathtub `bath` | A tub outline with an inner basin | COS Fig. 32 says only "the familiar outline of a bath tub"; no readable figure | no source (words only) |
| 5 | Shower `shower` | Square receptor with crossed diagonals and a drain | ISO 4.5.12 draws a shower as a head symbol (a triangle on a stem); ARMY Fig. 1-13 draws each head as a circle (ganged: a row of circles); COS Fig. 39 allows the receptor outline | differs: sources draw the shower head, we draw the receptor footprint |
| 6 | Kitchen sink, double `sink.kitchen` | Rectangle with two basins, drains and a tap | no readable source draws a double-bowl kitchen sink (ARMY's service sink is the same outer-rectangle family) | no source |
| 7 | Sink, single `sink.single` | Rectangle with one inner basin | ARMY Fig. 1-13 (service sink SS: a rectangle with an inner outline) | matches (in kind) |
| 8 | Floor drain `floordrain` | A small square with a circle (our cross is an addition) | OSU P-001 (floor drain: small square with a circle). DANE draws it as a filled circle; ISO 4.4.0 / 4.4.1 (gully) as a rectangle | matches OSU; the sources do not agree with each other |
| 9 | Floor cleanout `cleanout` | A circle with a cross | OSU P-001 floor cleanout is a square with a diagonal; DANE draws a circle on a heavy line (labelled CO / FCO); ISO 4.4.4 a T-bar on the pipe | differs: no common form; ours is a circle with a cross |
| 10 | Wall cleanout `cleanout.wall` | A half circle on the wall face with "CO" | OSU P-001 (a bar and a tick on the line); DANE (a circle on the line, CO / WCO); abbreviations CO match | differs: no common form |
| 11 | Hose bib `hosebib` | A stub from the wall ending in a cross bar, labelled HB. Redrawn in this session; it was a circle | ARMY Fig. 1-11 (faucet, hose bibb: a T marked HB); DANE (wall hydrant or hose bibb: a line with a cross tick); ISO 4.3.8 (draw-off point: a stub on the pipe) | matches |
| 12 | Wall hydrant `hydrant.wall` | The hose bib stub and bar, with a ring on the stub and "WHY". Redrawn | DANE (wall hydrant or hose bibb: the same mark); OSU P-001 (a stub ending in a chevron); ISO 4.3.9 (hydrant: line with a dot and cross stub). The ring and WHY are ours | matches (family) |
| 13 | Water heater `waterheater` | A circle with WH inside | ARMY Fig. 1-13 (water heater: a circle marked WH). DANE's abbreviation list uses WHR | matches |
| 14 | Gate valve `valve.gate` | Two triangles meeting at their points on the pipe | ISO 4.3.0 / 4.3.1 (valve, general and shut-off: bow-tie); ARMY Fig. 1-11 (gate valve: bow-tie); OSU (shutoff valve: bow-tie) | matches |
| 15 | Globe valve `valve.globe` | The bow-tie with a solid dot at the middle | ARMY Fig. 1-11 (globe valve: bow-tie with a solid dot). OSU draws globe like shutoff | matches |
| 16 | Ball valve `valve.ball` | The bow-tie with a ring at the middle | OSU (ball valve: bow-tie with a box on the stem); no source for a ring | differs: OSU puts a stem box on the bow-tie |
| 17 | Check valve `valve.check` | One triangle against a bar at its point | ISO 4.3.4 (non-return valve: bow-tie with a bar); OSU (a line with an angled flap); DANE (a slashed box) | differs: three public forms, none like another; ours is nearest ISO's triangle and bar |
| 18 | Butterfly valve `valve.butterfly` | The bow-tie with a bar across the middle | OSU (butterfly valve: a bar with a stem and a flange mark) | differs: OSU's mark is not a bow-tie |
| 19 | Pressure reducing valve `valve.prv` | Bow-tie with one small triangle (supply, high-pressure side) and a large one, labelled PRV. Redrawn: it was two equal triangles | ISO 4.3.6 (small triangle on the high-pressure side); OSU (bow-tie with a small triangle) | matches |
| 20 | Cold water `line.cw` | Continuous line with CW | DANE (CW lettered in a line); ARMY Fig. 1-5 (cold water: long and short dashes alternating); ISO 4.1.2 (line pattern by state of fluid, no fluid named) | differs: ARMY uses alternating dashes; we follow the lettered line |
| 21 | Hot water `line.hw` | Dashed line with HW | DANE (HW lettered in a line); ARMY Fig. 1-5 (hot water: a long dash and two short ones) | differs: ARMY pattern differs; the HW lettering matches DANE |
| 22 | Hot water return `line.hwr` | Dash-dot line with HWR | DANE (HWR lettered; its return line is dashed) | differs: pattern (abbreviation HWR matches) |
| 23 | Waste `line.waste` | Long dash with W | DANE (sanitary waste: a heavy solid line; **W means domestic water service** there) | differs: pattern and the letter W (clash with DANE) |
| 24 | Vent `line.vent` | Dotted line with V | DANE (sanitary vent: a thin solid line; V = vent) | differs: pattern (abbreviation V matches) |
| 25 | Storm drain `line.storm` | Long dash with SD | OSU abbreviation list: **SD = shower drain**; no readable source gives a storm-drain line or abbreviation | no source (and an abbreviation clash) |
| 26 | Gas `line.gas` | Dashes with G | DANE abbreviation list (G = natural gas); no readable source draws the gas line pattern | matches (abbreviation only) |

**Counts: 12 matches, 11 differs, 3 no source** (26 symbols).

What was changed after the check: hose bib, wall hydrant and pressure reducing valve were redrawn because two or three sources agreed on a form that ours did not have.
The "differs" rows were left alone because the sources do not agree with one another (check valve, cleanouts, line patterns) or because ours draws a different
thing on purpose (the shower receptor). Line patterns also differ between the sources; our line styles pair a pattern with the abbreviation in the line, so a
reader never depends on the pattern alone. Owner: the W (ours: waste) and SD (ours: storm drain) letters clash with the readable legends of two public sets; rename them
(or add DW / SHD) if those legends are your readers' norm.

## Still to check (owner, optional)

A certified match to ISO 4067-1 (current edition) or ASME Y32.4 needs someone who holds them. Until then the set is described exactly as above.
