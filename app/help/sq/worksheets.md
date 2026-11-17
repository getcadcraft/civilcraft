---
title: Tabelat e punës: tabela të lidhura me objektet
summary: Tabela të punës të ruajtura me rreshta nga bimët, sipërfaqet e mbjella, shtrimi, muret, shkallët, modifikuesit e tokës ose të gjitha sasitë; kolona dhe formula të tua, grupe dhe totale; CSV, XLSX dhe një tabelë në fletë, gjithmonë të përditësuar.
keywords: tabelë pune, tabelë, tabela e bimëve, tabela e elementeve të ngurta, sasi, kolona, formulë, total, shumë, numërim, grup, filtër, csv, xlsx, fletëllogaritëse, tabelë në fletë
from: 11bc1bac
---

{{ui:Tabelat e punës}} (Peizazh › Më shumë) hap tabelat e punës të këtij projekti. Herën e parë, **tabela e bimëve** dhe **tabela e elementeve të ngurta dhe sipërfaqeve** krijohen për ty. Një tabelë pune llogaritet nga objektet sa herë shfaqet, shkruhet ose vendoset në një fletë: ndrysho një shtrat dhe numërimet e tij ndryshojnë kudo.

- **Rreshtat nga**: bimët (një rresht për specie, kultivar dhe madhësi), sipërfaqet e mbjella, shtrimi, muret, shkallët, modifikuesit e tokës (prerje dhe mbushje) ose të gjitha sasitë.
- **Kolonat**: një fushë (`qty`, `area`, `botanical`, ose një emër në kllapa si `[Net area]`) ose një formulë: `+ - * / ^ %`, `&` për të bashkuar tekst, `= <> < <= > >=`, dhe `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Një formulë që nuk mund të llogaritet shfaq `#ERR` (ose `#DIV/0`) në qelizën e vet. Formulat lexohen nga analizuesi i vetë CadCraft; asgjë në to nuk ekzekutohet si kod.
- **Totali** për çdo kolonë (shumë, numërim, mesatare, më i vogli, më i madhi), **Grupo sipas** (nëntotale për grup) dhe **Vetëm rreshtat ku**.
- {{ui:Ruaj si CSV}}, {{ui:Ruaj si XLSX}}, dhe **Vendos këtë tabelë pune në fletët** (Fletë › Tabelat e punës e vizaton si tabelë, mbi aq fletë sa i duhen).

Etiketat mbi bimët dhe sipërfaqet lexojnë të njëjtat emra fushash (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
