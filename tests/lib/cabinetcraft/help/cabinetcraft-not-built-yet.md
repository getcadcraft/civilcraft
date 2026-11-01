---
title: CabinetCraft: not built yet
summary: What CabinetCraft does not do yet, so you can plan a job around it.
section: reference
order: 90
keywords: limits, not built, missing, roadmap, cabinetcraft, machine run, maker
---

## Not built yet, and not done by software

- **A machine run.** Nobody has cut a sheet from these programs or drilled from these hole lists on a machine. {{ui:Dry run}} reads the files and finds what it can, and the first-run checklist is for the person who makes the first run. The run itself is yours.
- **A cabinet maker's review.** The corner cabinets' sizes, the closing panels, the mitres, how shelves rest at a corner and the curved-wall rules are common practice and geometry, not any maker's hardware. The maker's review sheet lists every one with a box for the maker to confirm or correct.
- **Your shop's rates.** Every rate is a placeholder until you type or import your own. The estimate is a draft until every category in use is yours, and only then is it called a final quote.
- **Machine files for a boring machine.** The holes are a CSV and a generic XML list described in the export topic. They are not any machine's own format.
- **Fixing and lazy susan sizes.** The size of a dowel or cam fixing and of a lazy susan's shaft and pivot depends on the hardware you chose, so the holes are in the list with the size left blank until you type it under {{ui:Export}} › {{ui:Drilling sizes you type}}.
- **Curved-front cabinets as a cut list.** A cabinet with a curved front is made to order: it has a body in the drawings and viewport and a placeholder line in the estimate, but no cut list and no drilling.
- **Corner cabinets on a curve.** Corner cabinets need two straight walls. Next to a curved wall use the straight cabinets stepped along the curve.
- **The cabinets as part of the solid.** In the PartCraft viewport they are display bodies: they add nothing to the part's mass, STL or STEP.
- **G-code outside PartCraft.** BimCraft, CadCraft and ModelCraft have no CAM export. There you get the cut list, the nested sheets as DXF, the drilling lists and the labels; open the DXF in PartCraft's Manufacture for G-code.
- **Cabinets that follow the model.** In BimCraft, CadCraft and ModelCraft the cabinets are made from the job when you press the button; editing them there does not change the job, and changing the job does not move them until you place or draw again.
- **Doors that swing out of a run's way.** A door in a wall is a clear span with a swing check, not a model of the door. On a curved wall it sits at a position along the chord.
- **QR labels.** The labels have a Code 128 bar code.
- **Other languages.** Spanish (Mexico) is a draft; the rest of the words are in English for now.
