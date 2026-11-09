# Round 7 brief: 150 MORE objects in each of the 26 round-6 groups (2026-11-03)

The owner wants 250 per group in the round-6 groups; round 6 gave 100, so you add **150 more** to ONE group. Everything in `R6-BRIEF.md` applies (read it, and `R4-BRIEF.md`/`R5-BRIEF.md` it points to): same API, same quality bar ("high quality": real proportions, real parts, real size variants, look at the sheets and fix defects), same group/category lists (your group's categories are in R6-BRIEF.md), same naming and privacy rules, military without weapons.

Differences:
- You own ONE group and write `tools/library/detail/r7-<group>.mjs`: **exactly 150 variants**, at least 20 families. Read your group's round-6 file `r6-<group>.mjs` first (and grep `tools/library/blocks/<group>-7.csv`): **do NOT repeat its families, titles or variant names**; add new kinds of object in the same categories (about 37 per sub-category), covering what round 6 left out. Do not import from it; copy helpers you need.
- Commands use `--round 7`: `node tools/library/detail/make-round4.mjs --round 7 --check --files r7-<g>.mjs`; then `--round 7 --files r7-<g>.mjs --expect <g> --write --groups <g>` (writes `tools/library/blocks/<g>-8.csv`). Preview: `node tools/library/detail/r4-preview.mjs tools/library/detail/r7-<g>.mjs <your-own-scratch-subdir>/ --all` and view the sheets. `node tools/library/detail/detail.mjs --check` must pass (other agents' files may be mid-edit: if it fails on a file that is not yours, wait a minute and retry).
- Use YOUR OWN scratch subfolder (`/tmp/claude-0/-var-www-CADCRAFT/da20432e-5871-4936-8efa-1bc2450f25c9/scratchpad/r7/<group>/`); the scratchpad root is shared and files there get overwritten.
- Names must be unique across ALL block CSVs (about 9,100 names now, including `*-7.csv`), including other agents' new names: put a distinguishing setting or type word in every title.
- Fix the known weak spots of round 6 in your group where you can (flat objects stand on a base or lean so the front view reads; avoid plain slabs).
- Do not publish or seed, and do not edit any other file.
