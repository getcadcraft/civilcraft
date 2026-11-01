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
