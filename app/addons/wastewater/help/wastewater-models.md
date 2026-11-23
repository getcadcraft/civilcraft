---
title: Water treatment models: ASM3, ASM2d, digester, membranes and dosing
summary: Choose the activated sludge model (ASM1, ASM3 or ASM2d), run an anaerobic digester on the plant's waste sludge, size an MBR or a reverse osmosis stage, and work out chemical doses, with every source named.
section: tasks
order: 111
keywords: water treatment, wastewater, activated sludge, asm1, asm3, asm2d, phosphorus, bio-p, pao, anaerobic digestion, adm1, bsm2, biogas, methane, digester, membrane bioreactor, mbr, flux, reverse osmosis, ro, desalination, solution-diffusion, ferric chloride, alum, lime, caustic, alkalinity, chlorine, hypochlorite, dosing
---

Add the add-on first.

:::warning
A study aid, not an engineering approval. The ADM1 digester reproduces the published BSM2 steady state; ASM3 and ASM2d come from open programs that cite the IWA papers, not from the papers themselves; the membrane and dosing calculators use the coefficients you type. No engineer has checked any of them yet, and every result says so.
:::

## Choose the activated sludge model

1. Open the {{ui:Water treatment}} tab in the right panel and pick {{ui:Activated sludge with a model choice: ASM1, ASM3 or ASM2d}}.
2. In the list under it pick ASM1, ASM3 or ASM2d. The input box fills with a sample plant for that model and it runs.
3. Edit the tanks, flows, influent and clarifier capture (plain JSON) and press {{ui:Run}}. The table shows the steady state, the COD and nitrogen balances (and phosphorus for ASM2d), the effluent, the sludge age, and the worst row of the model's own continuity check. Each must be close to zero.

- **ASM3** stores substrate before growth. Its influent names are SI, SS, XI, XS, XH, XSTO, XA, SNH4, SN2, SNOX, SALK and XSS (left out, XSS is worked out from the particulate COD). Give `T` between 10 and 20 C: the rates move between the model's two temperature columns. The values come from WaterTAP's ASM3 and agree with the Modelica WasteWater library, except the anoxic decay of nitrifiers, which that library writes ten times larger (0.5 per day). 0.05 is used here.
- **ASM2d** adds biological phosphorus removal (phosphate-accumulating organisms, polyphosphate, PHA, denitrifying PAOs), fermentation and a metal hydroxide for chemical phosphorus. Put an unaerated tank first so the PAOs can take up acetate, and keep nitrate out of it: the internal recycle returns to the first tank, so the sample has none (with it, phosphate is no longer removed). The values come from QSDsan. ASM2d cannot use the layered settler: give a capture.
- The "?" coefficients of each matrix (oxygen, ammonium, phosphate, alkalinity) are not typed in. They are solved from the conservation of COD, nitrogen, phosphorus and charge, so every row balances.

## Run a digester

1. Pick {{ui:Anaerobic digester (ADM1 as published for BSM2): biogas and digested sludge}}.
2. In the list, pick {{ui:BSM2 test feed}} to run the published test case. The last line gives the largest difference from the published table, which is below one part in a hundred thousand. Pick {{ui:Waste sludge from the activated sludge plant}} to digest the BSM1 plant's waste sludge, thickened by `sludge.thicken`.
3. The results give the pH, the biogas flow at atmospheric pressure, its methane, carbon dioxide, hydrogen and water vapour, the methane flow and COD, and the COD, carbon and nitrogen balances.

The sludge-to-digester step is this program's own simple interface, not the BSM2 interface: composites take the degradable COD, inerts the inert COD, and any organic nitrogen the composites cannot carry goes to ammonium so nitrogen is kept. Cations and anions set the pH; if you leave them out, the BSM2 test values are used and the result says so.

## Size a membrane bioreactor

Pick {{ui:Membrane bioreactor: membrane area, permeate and retentate}}. Give the permeate flow (m3/d), the design flux (L/m2/h), the peak factor, the retentate recycle (as a multiple of the permeate) and the mixed liquor solids (g/L). The table gives the membrane area at the average and at the peak flow, the flows, and the solids in the retentate.

Ranges read: a sustainable long-term flux of 15 to 30 L/m2/h, MLSS of 8 to 15 g/L, TMP about 20 kPa, HRT 1 to 9 h and sludge age above 20 days for submerged MBRs (TU Delft lecture notes, 2012). Peaks above 1.5 to 2 times the average design flow need more membrane or equalization (US EPA fact sheet EPA 832-F-07-015). A value outside these ranges is a warning, never a refusal.

## Size a reverse osmosis stage

Pick {{ui:Reverse osmosis: solution-diffusion flux, recovery, permeate and concentrate}}. Give the feed flow and salt concentration, the recovery, the membrane's water and salt permeabilities `Lp` and `Bs`, the osmotic coefficient `fos` (bar per g/L) and either the area or a design flux. The table gives the permeate and concentrate flows and salt, the rejection, the osmotic pressure at the membrane and the pressure the feed needs. Set `maxPressure` to your pump's or pressure vessel's limit to be warned when it is exceeded.

The sample values are one seawater element's (Li and Li, 2025): Lp 1.06 L/m2/h/bar, Bs 0.044 L/m2/h, about 26 bar osmotic pressure at 35 g/L. Brackish-water membranes are different. Use your membrane's data sheet.

## Work out chemical doses

Pick {{ui:Chemical dosing: phosphorus precipitation, alkalinity, chlorine}}. Fill in any of the three parts:

- `phosphorus`: flow, soluble phosphate, the molar ratio (mol of iron or aluminium per mol of phosphate) and `fe` or `al`. 1.0 is the stoichiometric dose; 1.5 to 2.0 removes 80 to 98 % of soluble phosphorus, and about 6 to 7 is needed below 0.1 mg/L (US EPA Nutrient Control Design Manual, 2010). Give the product strength (ferric chloride is typically 37 to 47 %, alum 48 %) and your supplier's density to get the daily volume.
- `alkalinity`: nitrogen nitrified and denitrified, the feed alkalinity and the residual to keep (all in mg/L as CaCO3), and `lime` or `caustic`. Nitrification uses 7.14 and denitrification gives back 3.57 mg CaCO3 per mg N (same manual).
- `chlorine`: demand plus residual gives the dose. Give the hypochlorite strength and density from your supplier for the volume.

No density or hypochlorite strength is ever assumed: without them the dry mass is given and the result says what is missing. The list under the calculator switches between ferric chloride, alum and caustic soda.
