---
title: What's new in 0.8 and 0.8.1
summary: CivilCraft 0.8 adds Make it rain (a storm run over your grading), an earthwork balancer, a best-route finder, detention ponds, progress from surveys, an address-to-site importer that keeps the site in the project, and windows for soils and slopes, junctions and striping, survey adjustment, open pits, radio links and rail turnouts. 0.8.1 fixes how DWG files are read.
section: start
order: 5
keywords: whats new, what's new, release notes, changelog, changes, 0.8, 0.8.1, version, new features, rain, storm, ponding, overtopping, earthwork, balance, cut and fill, haul, best route, least cost, alignment, detention pond, outlet, drawdown, freeboard, progress, survey, drone, stockpile, address to site, parcel, soil, flood, slope stability, bishop, settlement, junction, striping, signs, sight distance, adjustment, least squares, traverse, open pit, block model, radio link, fresnel, turnout, crossover, languages, problems, live, dwg
---

This is what changed in CivilCraft 0.8 (2026-11-01) and 0.8.1 (2026-11-02), compared with 0.7. The big new parts are tools that test your grading and your site (rain, earthwork, routes, ponds, progress) and six calculation windows for ground, roads, survey, mines, links and rail.

## New

### Test your grading

- **Make it rain.** {{ui:Make it rain…}} (under {{ui:Surface}}) drops a storm on the graded ground. You watch the water run off the pads, pond in the low corners and overtop the ponds that are too small. The run is animated and gives the volumes, the peak outflow and a CSV of every pond. The default cell is coarse so a first look is quick; a finer cell is slower. Ponds that overtop also show up in the Problems panel.
- **Earthwork balancer.** {{ui:Earthwork balancer…}} raises or lowers a pad until cut equals fill, and shows the haul table between them.
- **Best route.** {{ui:Best route…}}: pick a start and an end, and CivilCraft finds the cheapest path across the terrain that keeps to your grade and curve limits, then makes an alignment from it.
- **Detention ponds.** {{ui:Detention ponds…}} works out stage and storage from your ground, takes outlet devices (orifice, weir, V-notch, spillway), routes a storm through the pond and checks the peak held back, the drawdown time and the freeboard.
- **Progress from surveys.** {{ui:Progress from surveys…}} compares drone or scan surfaces from different dates with the ground as it was and with the design: percent complete by volume, over-dug and over-filled areas, stockpiles, and when the work finishes at this pace (marked as an estimate).

### Know the site

- **Address to site.** {{ui:Address to site…}} lines up open parcel, building, zoning, soil, flood and terrain data on one site. You can keep the site in the project file: the typed address, each source with the day you fetched it and its licence, and what came back. Reopen or share the project and the site is still there, with nothing fetched again. You can also save it as a site file or send it to BimCraft. See [Address to site](topic:address-to-site).

### Ground, roads, survey, mines, links and rail

- **Soils and slopes.** {{ui:Soils and slopes…}} draws the soil profile between borings you type. Bishop's method then searches the critical circle on your ground, with a water table, a surcharge and an earthquake coefficient; settlement of a footing gets consolidation, immediate settlement and time.
- **Junctions and striping.** {{ui:Junctions and striping…}} puts legs together with curb returns (one radius per leg, or three-centre returns), the sight distance for the design speed, a check of the sight triangles, crosswalks, stop bars, markings and signs with a sign schedule. They are drawn on the plan and saved as a .dxf with named layers.
- **Survey adjustment.** {{ui:Survey adjustment…}} runs a least-squares adjustment of a traverse or network: adjusted coordinates, error ellipses, the chi-squared test and a flag on the measurement that does not fit. Free networks, closing a traverse by the compass rule and RW5, GSI, JobXML or CSV field files are included, and the adjusted points save as CSV.
- **Open pits.** {{ui:Open pits…}} turns drill samples into a block model and the ultimate pit within your slope angle, with the strip ratio, a table by bench and a grade and tonnage curve. Nested pits by revenue factor and a production schedule with a discounted cash flow are there too.
- **Radio links.** {{ui:Radio links…}} checks line of sight over your ground with the earth's bulge, the first Fresnel zone, link budget, fade margin and multipath outage, and gives the mast height that would clear the path. It also does fibre loss budgets, route quantities and the wind on a tower.
- **Rail turnouts.** {{ui:Rail turnouts…}} makes a turnout from its frog number, crossovers between parallel tracks and a structure gauge tilted by cant and widened on a curve. A turnout can sit at a station of an alignment.

See [Soils, junctions, survey adjustment, pits, radio links and turnouts](topic:soils-roads-survey-mines-links).

## In every app

- **Languages.** 54 languages, ten of them new. Languages other than English are machine drafts until a native speaker reads them. Help topics are still mostly English.
- **Toolbar rows.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Wrap (as before), 2 rows or 1 row. CivilCraft's Ribbon shows the most used tool large, the next ones small, and the rest behind the group name's arrow.
- **Input devices.** Trackpad, pen, 3D mouse, controller and MIDI can drive the apps.
- **Problems.** A Problems panel that warns in every app, with checks that read regulation packs.
- **Live.** A view of who is where in a Live session.
- **Add-ons.** An add-on listing, with lighting add-ons.
- **Connect your AI.** Any assistant you connect can drive CivilCraft's tools. It ships with a note that one-click connecting inside CadCraft Studio and the hosted connector are not ready yet. See [Let an AI assistant work with your site](topic:assistants).

## Fixed in 0.8.1

- **DWG classes section.** It was read as the wrong type (GitHub cadcraft#5). Fixed in CivilCraft along with CadCraft, BimCraft, ModelCraft and TakeoffCraft.
- **Switching language while running.** CadCraft Studio and the packed editions can change language at run time. They were English only before. Not yet tested on every platform: tell us if the language does not change.

## Not in this version yet

- **These are calculation aids.** Every result in the new windows needs an engineer's check. Soil strengths start from typical values for the soil group, and the window says so.
- **Make it rain.** A run on the sample site can take over two minutes in the browser at a fine cell. It was checked against hand cases and a V-shaped catchment, not yet on a real graded site.
- **Address to site.** It reads open data files you bring, and was tested on our own files only. Trees are not a source. Fetching sources for you waits on the privacy wording.
- **Progress from surveys.** Tested on made-up surveys only. Progress on sheets and markups (MarkupCraft) and scan against model (BimCraft) are not built.
- **Soils and slopes.** Circular surfaces only: no wedge or block search and no tension crack.
- **Junctions.** One radius per leg, no truck swept paths, and they do not yet go into the corridor.
- **Field files.** The readers were written from public format descriptions and tried on files we made. Real instrument files are wanted.
- **Links and rail.** Radio links: free-space loss and multipath only (no rain fade or antenna patterns), and no railway standard: every rail limit is a placeholder, with draft numbers no railway engineer has checked.
- **Windows and macOS.** 0.8 is not code-signed. Windows may warn, and macOS asks for right-click then Open.

Everything else is in [Not built yet](topic:not-built-yet). For the earlier release, see [What's new in 0.7](topic:whats-new-0-7).
