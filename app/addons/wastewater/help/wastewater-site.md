---
title: Water treatment: size a plant and put its basins on the site
summary: Run the activated sludge calculator (the published ASM1 model) or the design equations beside your site, then draw each basin's footprint on the plan from its volume and water depth.
section: tasks
order: 110
keywords: water treatment, wastewater, activated sludge, asm1, clarifier, secondary settler, sludge blanket, takacs, temperature, bsm1, benchmark, disinfection, basin, footprint, site plan, aeration tank, watertap
---

Add the add-on first.

:::warning
A study aid, not an engineering approval. The ASM1 equations and parameters were compared with the published BSM1 report and the benchmark's steady state is reproduced by our tests, but no engineer has checked them yet; every result says so. ASM3 and ASM2d, the anaerobic digester, membranes and chemical dosing have their own calculators in the same tab: see the topic on water treatment models.
:::

## Size the plant

1. Open the {{ui:Water treatment}} tab in the right panel.
2. Pick {{ui:Activated sludge plant, screens, clarifier and disinfection}} or {{ui:Activated sludge: tank size, return ratio, clarifier}}.
3. Edit the sample input (plain JSON): the tanks and their volumes in m3, the flows in m3/d, the influent, and under `site` the water depth in metres (one number, or one per tank such as `{"A1": 4, "O1": 6}`) and the gap between basins.
4. Press {{ui:Run}}. The results come as a table: the steady state, the COD and nitrogen balances (they must close), the effluent, the sludge age, and one line per basin with its area. Anything to check is listed under the table and in Problems.

## The clarifier, the sludge blanket and the water temperature

The sample input is the plant of the published benchmark BSM1 (Alex and others, IWA task group, Lund University, 2008): five tanks, the internal recycle, the sludge return and its secondary clarifier.

1. Under `settler` give the clarifier's `area` (m2), `height` (m), the number of `layers` and the `feedLayer` counted from the bottom. `"settler": {}` is the BSM1 clarifier: 1,500 m2, 4 m, ten layers, fed at layer 6. Solids settle by the double-exponential velocity of Takacs, Patry and Nolasco (1991) with the parameters printed in the BSM1 report (its Table 4); change them under `settler.params` if you have your own sludge's.
2. After a run the panel says the height of the sludge blanket, the effluent solids and the underflow solids, and draws the layers from the bottom up. The blanket is the layers, from the bottom, whose solids are at or above 3,000 g/m3 (the BSM1 threshold); set `settler.blanketAt` for another value. A blanket that reaches the feed layer is a warning: the clarifier is overloaded at those flows.
3. To keep the older, simpler clarifier, remove `settler` and give `capture`, the share of solids it keeps (0 to 1).
4. `T` is the water temperature in degrees C. The growth, decay, hydrolysis and ammonification rates are corrected from the BSM1 set (about 15 C) with the law the BSM2 benchmark uses, through its values at 10 C and 15 C; outside 10 to 15 C the result warns that the rates are extrapolated. Add `"soSatFromT": true` to correct the oxygen saturation too.

## Check it against the benchmark

Pick {{ui:BSM1 benchmark: steady state against the published table}} and press {{ui:Run}}. It builds the BSM1 plant and lists every value of the report's published steady state (reactors, clarifier, effluent, sludge age) beside this run, with how many lie within the tolerance: 0.1 % of the published value or 0.001 g/m3, whichever is larger.

## Put the basins on the site

1. After a run of the activated sludge calculator, press {{ui:Put the basins on the site}}.
2. Each tank becomes a closed feature line (use "off": linework, not part of the ground surface), named with its volume and depth, all in one undo step. The footprint is a square of the right area, in one row from west to east: the shape and the place are yours to change.
3. The basins go to the middle of the points and lines already in the project. To choose the place, add `"at": [x, y]` (project units, the south-west corner of the first basin) under `site` and run again.
4. {{ui:Site plan (GeoJSON)}} and {{ui:Site plan (DXF)}} save the same footprints in metres, for another program or for Import.

## Other engines

WaterTAP is listed as an engine it could use one day. Its licence (BSD-3-Clause with a grant-back clause for enhancements, read from its own licence file) waits on the owner's decision, and no script for it ships, so the panel says it is not offered. It would only ever run as a program installed on your own computer, through CadCraft Studio, never inside CadCraft.
