/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: data pack; the names are the source's */
/**
 * fittingk-data.js — the cadcraft-fitting-k-pack (0.8 CH.10), made by tools/process/make-fittingk.py. DRAFT: the review state says so and nothing may present it as verified.
 * The constants come from the tables of the MIT-licensed `fluids` library (Caleb Bell); its licence notice is carried in provenance.notice, as the licence requires.
 */
export const FITTING_K_PACK = {
 "format": "cadcraft-fitting-k-pack",
 "version": 1,
 "name": "Fitting loss constants, 2-K (Hooper) and 3-K (Darby) - draft, from the tables of the fluids library",
 "review": {
  "state": "draft",
  "by": null,
  "date": null,
  "note": "Constants taken from the MIT-licensed `fluids` library's tables of the Hooper (1981) and Darby (1999) methods; not yet checked against the original papers by an engineer"
 },
 "source": "fluids (Chemical Engineering Design Library, Caleb Bell), fluids/fittings.py, dictionaries Hooper and Darby; https://github.com/CalebBell/fluids",
 "provenance": {
  "primary": [
   "Hooper, W. B., \"The 2-K Method Predicts Head Losses in Pipe Fittings\", Chem. Eng. 88(17), p. 97, Aug. 24, 1981",
   "Darby, R., \"Correlate Pressure Drops through Fittings\", Chem. Eng. 106(7), p. 101, July 1999"
  ],
  "taken_from": {
   "name": "fluids",
   "file": "fluids/fittings.py",
   "url": "https://raw.githubusercontent.com/CalebBell/fluids/master/fluids/fittings.py",
   "licence": "MIT",
   "licence_url": "https://raw.githubusercontent.com/CalebBell/fluids/master/LICENSE.txt",
   "copyright": "Copyright (C) 2016-2025, Caleb Bell <Caleb.Andrew.Bell@gmail.com>"
  },
  "notice": "Copyright (C) 2016-2025, Caleb Bell <Caleb.Andrew.Bell@gmail.com>\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.",
  "what_was_taken": "The published constants and the fitting names only. No code of that library is used; the loader and the formulas in lib/process/equip/fittingk.js are written here."
 },
 "methods": {
  "2K": {
   "form": "K = K1/Re + Kinf (1 + 1/D), D = actual inside diameter in inches",
   "fittings": [
    {
     "id": "elbow-90deg-standard-r-d-1-screwed",
     "source": "Elbow, 90°, Standard (R/D = 1), Screwed",
     "label": "90° elbow, Standard (R/D = 1), Screwed",
     "category": "elbow",
     "K1": 800.0,
     "Kinf": 0.4
    },
    {
     "id": "elbow-90deg-standard-r-d-1-flanged-welded",
     "source": "Elbow, 90°, Standard (R/D = 1), Flanged/welded",
     "label": "90° elbow, Standard (R/D = 1), Flanged/welded",
     "category": "elbow",
     "K1": 800.0,
     "Kinf": 0.25
    },
    {
     "id": "elbow-90deg-long-radius-r-d-1-5-all-types",
     "source": "Elbow, 90°, Long-radius (R/D = 1.5), All types",
     "label": "90° elbow, Long-radius (R/D = 1.5), All types",
     "category": "elbow",
     "K1": 800.0,
     "Kinf": 0.2
    },
    {
     "id": "elbow-90deg-mitered-r-d-1-5-1-weld-90deg-angle",
     "source": "Elbow, 90°, Mitered (R/D = 1.5), 1 weld (90° angle)",
     "label": "90° elbow, Mitered (R/D = 1.5), 1 weld (90° angle)",
     "category": "elbow",
     "K1": 1000.0,
     "Kinf": 1.15
    },
    {
     "id": "elbow-90deg-mitered-r-d-1-5-2-weld-45deg-angle",
     "source": "Elbow, 90°, Mitered (R/D = 1.5), 2 weld (45° angle)",
     "label": "90° elbow, Mitered (R/D = 1.5), 2 weld (45° angle)",
     "category": "elbow",
     "K1": 800.0,
     "Kinf": 0.35
    },
    {
     "id": "elbow-90deg-mitered-r-d-1-5-3-weld-30deg-angle",
     "source": "Elbow, 90°, Mitered (R/D = 1.5), 3 weld (30° angle)",
     "label": "90° elbow, Mitered (R/D = 1.5), 3 weld (30° angle)",
     "category": "elbow",
     "K1": 800.0,
     "Kinf": 0.3
    },
    {
     "id": "elbow-90deg-mitered-r-d-1-5-4-weld-22-5deg-angle",
     "source": "Elbow, 90°, Mitered (R/D = 1.5), 4 weld (22.5° angle)",
     "label": "90° elbow, Mitered (R/D = 1.5), 4 weld (22.5° angle)",
     "category": "elbow",
     "K1": 800.0,
     "Kinf": 0.27
    },
    {
     "id": "elbow-90deg-mitered-r-d-1-5-5-weld-18deg-angle",
     "source": "Elbow, 90°, Mitered (R/D = 1.5), 5 weld (18° angle)",
     "label": "90° elbow, Mitered (R/D = 1.5), 5 weld (18° angle)",
     "category": "elbow",
     "K1": 800.0,
     "Kinf": 0.25
    },
    {
     "id": "elbow-45deg-standard-r-d-1-all-types",
     "source": "Elbow, 45°, Standard (R/D = 1), All types",
     "label": "45° elbow, Standard (R/D = 1), All types",
     "category": "elbow",
     "K1": 500.0,
     "Kinf": 0.2
    },
    {
     "id": "elbow-45deg-long-radius-r-d-1-5-all-types",
     "source": "Elbow, 45°, Long-radius (R/D 1.5), All types",
     "label": "45° elbow, Long-radius (R/D 1.5), All types",
     "category": "elbow",
     "K1": 500.0,
     "Kinf": 0.15
    },
    {
     "id": "elbow-45deg-mitered-r-d-1-5-1-weld-45deg-angle",
     "source": "Elbow, 45°, Mitered (R/D=1.5), 1 weld (45° angle)",
     "label": "45° elbow, Mitered (R/D=1.5), 1 weld (45° angle)",
     "category": "elbow",
     "K1": 500.0,
     "Kinf": 0.25
    },
    {
     "id": "elbow-45deg-mitered-r-d-1-5-2-weld-22-5deg-angle",
     "source": "Elbow, 45°, Mitered (R/D=1.5), 2 weld (22.5° angle)",
     "label": "45° elbow, Mitered (R/D=1.5), 2 weld (22.5° angle)",
     "category": "elbow",
     "K1": 500.0,
     "Kinf": 0.15
    },
    {
     "id": "elbow-45deg-standard-r-d-1-screwed",
     "source": "Elbow, 45°, Standard (R/D = 1), Screwed",
     "label": "45° elbow, Standard (R/D = 1), Screwed",
     "category": "elbow",
     "K1": 1000.0,
     "Kinf": 0.7,
     "note": "Its constants (1000 and 0.7) are larger than the other 45° elbows (500); check the name against the paper."
    },
    {
     "id": "elbow-180deg-standard-r-d-1-flanged-welded",
     "source": "Elbow, 180°, Standard (R/D = 1), Flanged/welded",
     "label": "180° elbow, Standard (R/D = 1), Flanged/welded",
     "category": "elbow",
     "K1": 1000.0,
     "Kinf": 0.35
    },
    {
     "id": "elbow-180deg-long-radius-r-d-1-5-all-types",
     "source": "Elbow, 180°, Long-radius (R/D = 1.5), All types",
     "label": "180° elbow, Long-radius (R/D = 1.5), All types",
     "category": "elbow",
     "K1": 1000.0,
     "Kinf": 0.3
    },
    {
     "id": "elbow-used-as-standard-screwed",
     "source": "Elbow, Used as, Standard, Screwed",
     "label": "Tee used as an elbow, Standard, Screwed",
     "category": "tee",
     "K1": 500.0,
     "Kinf": 0.7,
     "note": "The source files this under \"Elbow\" with the words \"Used as\"; by its place in the table it is probably a tee used as an elbow. Check against the paper."
    },
    {
     "id": "elbow-elbow-long-radius-screwed",
     "source": "Elbow, Elbow, Long-radius, Screwed",
     "label": "Tee used as an elbow, Long-radius, Screwed",
     "category": "tee",
     "K1": 800.0,
     "Kinf": 0.4,
     "note": "The source files this under \"Elbow, Elbow\"; probably a tee used as an elbow. Check against the paper."
    },
    {
     "id": "elbow-elbow-standard-flanged-welded",
     "source": "Elbow, Elbow, Standard, Flanged/welded",
     "label": "Tee used as an elbow, Standard, Flanged/welded",
     "category": "tee",
     "K1": 800.0,
     "Kinf": 0.8,
     "note": "The source files this under \"Elbow, Elbow\"; probably a tee used as an elbow. Check against the paper."
    },
    {
     "id": "elbow-elbow-stub-in-type-branch",
     "source": "Elbow, Elbow, Stub-in type branch",
     "label": "Tee used as an elbow, Stub-in type branch",
     "category": "tee",
     "K1": 1000.0,
     "Kinf": 1.0,
     "note": "The source files this under \"Elbow, Elbow\"; probably a tee used as an elbow. Check against the paper."
    },
    {
     "id": "tee-run-screwed",
     "source": "Tee, Run, Screwed",
     "label": "Tee, Run, Screwed",
     "category": "tee",
     "K1": 200.0,
     "Kinf": 0.1
    },
    {
     "id": "tee-through-flanged-or-welded",
     "source": "Tee, Through, Flanged or welded",
     "label": "Tee, Through, Flanged or welded",
     "category": "tee",
     "K1": 150.0,
     "Kinf": 0.05
    },
    {
     "id": "tee-tee-stub-in-type-branch",
     "source": "Tee, Tee, Stub-in type branch",
     "label": "Tee, Stub-in type branch",
     "category": "tee",
     "K1": 100.0,
     "Kinf": 0.0,
     "note": "The source name repeats \"Tee\"; probably the run-through stub-in tee. Check against the paper."
    },
    {
     "id": "valve-gate-full-line-size-beta-1",
     "source": "Valve, Gate, Full line size, Beta = 1",
     "label": "Gate valve, Full line size, Beta = 1",
     "category": "valve",
     "K1": 300.0,
     "Kinf": 0.1
    },
    {
     "id": "valve-ball-reduced-trim-beta-0-9",
     "source": "Valve, Ball, Reduced trim, Beta = 0.9",
     "label": "Ball valve, Reduced trim, Beta = 0.9",
     "category": "valve",
     "K1": 500.0,
     "Kinf": 0.15
    },
    {
     "id": "valve-plug-reduced-trim-beta-0-8",
     "source": "Valve, Plug, Reduced trim, Beta = 0.8",
     "label": "Plug valve, Reduced trim, Beta = 0.8",
     "category": "valve",
     "K1": 1000.0,
     "Kinf": 0.25
    },
    {
     "id": "valve-globe-standard",
     "source": "Valve, Globe, Standard",
     "label": "Globe valve, Standard",
     "category": "valve",
     "K1": 1500.0,
     "Kinf": 4.0
    },
    {
     "id": "valve-globe-angle-or-y-type",
     "source": "Valve, Globe, Angle or Y-type",
     "label": "Globe valve, Angle or Y-type",
     "category": "valve",
     "K1": 1000.0,
     "Kinf": 2.0
    },
    {
     "id": "valve-diaphragm-dam-type",
     "source": "Valve, Diaphragm, Dam type",
     "label": "Diaphragm valve, Dam type",
     "category": "valve",
     "K1": 1000.0,
     "Kinf": 2.0
    },
    {
     "id": "valve-butterfly",
     "source": "Valve, Butterfly,",
     "label": "Butterfly valve",
     "category": "valve",
     "K1": 800.0,
     "Kinf": 0.25
    },
    {
     "id": "valve-check-lift",
     "source": "Valve, Check, Lift",
     "label": "Check valve, Lift",
     "category": "valve",
     "K1": 2000.0,
     "Kinf": 10.0
    },
    {
     "id": "valve-check-swing",
     "source": "Valve, Check, Swing",
     "label": "Check valve, Swing",
     "category": "valve",
     "K1": 1500.0,
     "Kinf": 1.5
    },
    {
     "id": "valve-check-tilting-disc",
     "source": "Valve, Check, Tilting-disc",
     "label": "Check valve, Tilting-disc",
     "category": "valve",
     "K1": 1000.0,
     "Kinf": 0.5
    }
   ]
  },
  "3K": {
   "form": "K = K1/Re + Ki (1 + Kd/D^0.3), D = nominal pipe size in inches",
   "fittings": [
    {
     "id": "elbow-90deg-threaded-standard-r-d-1",
     "source": "Elbow, 90°, threaded, standard, (r/D = 1)",
     "label": "90° elbow, threaded, standard, (r/D = 1)",
     "category": "elbow",
     "K1": 800.0,
     "Ki": 0.14,
     "Kd": 4.0
    },
    {
     "id": "elbow-90deg-threaded-long-radius-r-d-1-5",
     "source": "Elbow, 90°, threaded, long radius, (r/D = 1.5)",
     "label": "90° elbow, threaded, long radius, (r/D = 1.5)",
     "category": "elbow",
     "K1": 800.0,
     "Ki": 0.071,
     "Kd": 4.2
    },
    {
     "id": "elbow-90deg-flanged-welded-bends-r-d-1",
     "source": "Elbow, 90°, flanged, welded, bends, (r/D = 1)",
     "label": "90° elbow, flanged, welded, bends, (r/D = 1)",
     "category": "elbow",
     "K1": 800.0,
     "Ki": 0.091,
     "Kd": 4.0
    },
    {
     "id": "elbow-90deg-r-d-2",
     "source": "Elbow, 90°, (r/D = 2)",
     "label": "90° elbow, (r/D = 2)",
     "category": "elbow",
     "K1": 800.0,
     "Ki": 0.056,
     "Kd": 3.9
    },
    {
     "id": "elbow-90deg-r-d-4",
     "source": "Elbow, 90°, (r/D = 4)",
     "label": "90° elbow, (r/D = 4)",
     "category": "elbow",
     "K1": 800.0,
     "Ki": 0.066,
     "Kd": 3.9
    },
    {
     "id": "elbow-90deg-r-d-6",
     "source": "Elbow, 90°, (r/D = 6)",
     "label": "90° elbow, (r/D = 6)",
     "category": "elbow",
     "K1": 800.0,
     "Ki": 0.075,
     "Kd": 4.2
    },
    {
     "id": "elbow-90deg-mitered-1-weld-90deg",
     "source": "Elbow, 90°, mitered, 1 weld, (90°)",
     "label": "90° elbow, mitered, 1 weld, (90°)",
     "category": "elbow",
     "K1": 1000.0,
     "Ki": 0.27,
     "Kd": 4.0
    },
    {
     "id": "elbow-90deg-2-welds-45deg",
     "source": "Elbow, 90°, 2 welds, (45°)",
     "label": "90° elbow, 2 welds, (45°)",
     "category": "elbow",
     "K1": 800.0,
     "Ki": 0.068,
     "Kd": 4.1
    },
    {
     "id": "elbow-90deg-3-welds-30deg",
     "source": "Elbow, 90°, 3 welds, (30°)",
     "label": "90° elbow, 3 welds, (30°)",
     "category": "elbow",
     "K1": 800.0,
     "Ki": 0.035,
     "Kd": 4.2
    },
    {
     "id": "elbow-45deg-threaded-standard-r-d-1",
     "source": "Elbow, 45°, threaded standard, (r/D = 1)",
     "label": "45° elbow, threaded standard, (r/D = 1)",
     "category": "elbow",
     "K1": 500.0,
     "Ki": 0.071,
     "Kd": 4.2
    },
    {
     "id": "elbow-45deg-long-radius-r-d-1-5",
     "source": "Elbow, 45°, long radius, (r/D = 1.5)",
     "label": "45° elbow, long radius, (r/D = 1.5)",
     "category": "elbow",
     "K1": 500.0,
     "Ki": 0.052,
     "Kd": 4.0
    },
    {
     "id": "elbow-45deg-mitered-1-weld-45deg",
     "source": "Elbow, 45°, mitered, 1 weld, (45°)",
     "label": "45° elbow, mitered, 1 weld, (45°)",
     "category": "elbow",
     "K1": 500.0,
     "Ki": 0.086,
     "Kd": 4.0
    },
    {
     "id": "elbow-45deg-mitered-2-welds-22-5deg",
     "source": "Elbow, 45°, mitered, 2 welds, (22.5°)",
     "label": "45° elbow, mitered, 2 welds, (22.5°)",
     "category": "elbow",
     "K1": 500.0,
     "Ki": 0.052,
     "Kd": 4.0
    },
    {
     "id": "elbow-180deg-threaded-close-return-bend-r-d-1",
     "source": "Elbow, 180°, threaded, close-return bend, (r/D = 1)",
     "label": "180° elbow, threaded, close-return bend, (r/D = 1)",
     "category": "elbow",
     "K1": 1000.0,
     "Ki": 0.23,
     "Kd": 4.0
    },
    {
     "id": "elbow-180deg-flanged-r-d-1",
     "source": "Elbow, 180°, flanged, (r/D = 1)",
     "label": "180° elbow, flanged, (r/D = 1)",
     "category": "elbow",
     "K1": 1000.0,
     "Ki": 0.12,
     "Kd": 4.0
    },
    {
     "id": "elbow-180deg-all-r-d-1-5",
     "source": "Elbow, 180°, all, (r/D = 1.5)",
     "label": "180° elbow, all, (r/D = 1.5)",
     "category": "elbow",
     "K1": 1000.0,
     "Ki": 0.1,
     "Kd": 4.0
    },
    {
     "id": "tee-through-branch-as-elbow-threaded-r-d-1",
     "source": "Tee, Through-branch, (as elbow), threaded, (r/D = 1)",
     "label": "Tee, Through-branch, (as elbow), threaded, (r/D = 1)",
     "category": "tee",
     "K1": 500.0,
     "Ki": 0.274,
     "Kd": 4.0
    },
    {
     "id": "tee-through-branch-as-elbow-r-d-1-5",
     "source": "Tee, Through-branch,(as elbow), (r/D = 1.5)",
     "label": "Tee, Through-branch, (as elbow), (r/D = 1.5)",
     "category": "tee",
     "K1": 800.0,
     "Ki": 0.14,
     "Kd": 4.0
    },
    {
     "id": "tee-through-branch-as-elbow-flanged-r-d-1",
     "source": "Tee, Through-branch, (as elbow), flanged, (r/D = 1)",
     "label": "Tee, Through-branch, (as elbow), flanged, (r/D = 1)",
     "category": "tee",
     "K1": 800.0,
     "Ki": 0.28,
     "Kd": 4.0
    },
    {
     "id": "tee-through-branch-as-elbow-stub-in-branch",
     "source": "Tee, Through-branch, (as elbow), stub-in branch",
     "label": "Tee, Through-branch, (as elbow), stub-in branch",
     "category": "tee",
     "K1": 1000.0,
     "Ki": 0.34,
     "Kd": 4.0
    },
    {
     "id": "tee-run-through-threaded-r-d-1",
     "source": "Tee, Run-through, threaded, (r/D = 1)",
     "label": "Tee, Run-through, threaded, (r/D = 1)",
     "category": "tee",
     "K1": 200.0,
     "Ki": 0.091,
     "Kd": 4.0
    },
    {
     "id": "tee-run-through-flanged-r-d-1",
     "source": "Tee, Run-through, flanged, (r/D = 1)",
     "label": "Tee, Run-through, flanged, (r/D = 1)",
     "category": "tee",
     "K1": 150.0,
     "Ki": 0.05,
     "Kd": 4.0
    },
    {
     "id": "tee-run-through-stub-in-branch",
     "source": "Tee, Run-through, stub-in branch",
     "label": "Tee, Run-through, stub-in branch",
     "category": "tee",
     "K1": 100.0,
     "Ki": 0.0,
     "Kd": 0.0
    },
    {
     "id": "valve-angle-valve-45deg-full-line-size-beta-1",
     "source": "Valve, Angle valve, 45°, full line size, β = 1",
     "label": "Angle valve, 45°, full line size, β = 1",
     "category": "valve",
     "K1": 950.0,
     "Ki": 0.25,
     "Kd": 4.0
    },
    {
     "id": "valve-angle-valve-90deg-full-line-size-beta-1",
     "source": "Valve, Angle valve, 90°, full line size, β = 1",
     "label": "Angle valve, 90°, full line size, β = 1",
     "category": "valve",
     "K1": 1000.0,
     "Ki": 0.69,
     "Kd": 4.0
    },
    {
     "id": "valve-globe-valve-standard-beta-1",
     "source": "Valve, Globe valve, standard, β = 1",
     "label": "Globe valve, standard, β = 1",
     "category": "valve",
     "K1": 1500.0,
     "Ki": 1.7,
     "Kd": 3.6
    },
    {
     "id": "valve-plug-valve-branch-flow",
     "source": "Valve, Plug valve, branch flow",
     "label": "Plug valve, branch flow",
     "category": "valve",
     "K1": 500.0,
     "Ki": 0.41,
     "Kd": 4.0
    },
    {
     "id": "valve-plug-valve-straight-through",
     "source": "Valve, Plug valve, straight through",
     "label": "Plug valve, straight through",
     "category": "valve",
     "K1": 300.0,
     "Ki": 0.084,
     "Kd": 3.9
    },
    {
     "id": "valve-plug-valve-three-way-flow-through",
     "source": "Valve, Plug valve, three-way (flow through)",
     "label": "Plug valve, three-way (flow through)",
     "category": "valve",
     "K1": 300.0,
     "Ki": 0.14,
     "Kd": 4.0
    },
    {
     "id": "valve-gate-valve-standard-beta-1",
     "source": "Valve, Gate valve, standard, β = 1",
     "label": "Gate valve, standard, β = 1",
     "category": "valve",
     "K1": 300.0,
     "Ki": 0.037,
     "Kd": 3.9
    },
    {
     "id": "valve-ball-valve-standard-beta-1",
     "source": "Valve, Ball valve, standard, β = 1",
     "label": "Ball valve, standard, β = 1",
     "category": "valve",
     "K1": 300.0,
     "Ki": 0.017,
     "Kd": 3.5
    },
    {
     "id": "valve-diaphragm-dam-type",
     "source": "Valve, Diaphragm, dam type",
     "label": "Diaphragm valve, dam type",
     "category": "valve",
     "K1": 1000.0,
     "Ki": 0.69,
     "Kd": 4.9
    },
    {
     "id": "valve-swing-check",
     "source": "Valve, Swing check",
     "label": "Swing check valve",
     "category": "valve",
     "K1": 1500.0,
     "Ki": 0.46,
     "Kd": 4.0
    },
    {
     "id": "valve-lift-check",
     "source": "Valve, Lift check",
     "label": "Lift check valve",
     "category": "valve",
     "K1": 2000.0,
     "Ki": 2.85,
     "Kd": 3.8
    }
   ]
  }
 }
};
