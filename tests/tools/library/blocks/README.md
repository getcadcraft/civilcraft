# LibraryCraft block staging

One CSV per category block, 50 rows each, in the same columns as `tools/library/seed.csv`.
These are staged only. Nothing here is published until `bin/library-seed.php` reads it.

| File | Category | Rows |
|---|---|---|
| foodservice.csv | foodservice/* | 50 |
| furniture.csv | furniture/* | 50 |
| casework.csv | casework/* | 50 |
| plumbing.csv | plumbing/* | 50 |
| electrical.csv | electrical/* | 50 |
| appliances.csv | appliances/residential | 50 |
| site.csv | site/landscape, site/vehicles | 50 |
| people.csv | people/entourage | 50 |

Every name starts with "Generic", every row is CC0 with no maker or model, and the
remarks say the size is generic and to check the chosen unit's spec sheet.

Round 3 (2026-11-03): `<block>-3.csv` files, 30 commercial objects for each of the ten blocks, plus `other-4.csv` (vertical transport) and `site-4.csv`
(municipal fixtures). See docs/LIBRARY-BLOCKS-REPORT-2026-11-03.md.
