---
title: Werkblaaie: skedules gekoppel aan die voorwerpe
summary: Gestoorde werkblaaie met rye uit plante, beplante oppervlaktes, plaveisel, mure, trappe, grondwysigers of alle hoeveelhede; jou eie kolomme en formules, groepe en totale; CSV, XLSX en 'n tabel op die blaaie, altyd op datum.
keywords: werkblad, skedule, plantskedule, verhardingskedule, hoeveelhede, kolomme, formule, totaal, som, telling, groep, filter, csv, xlsx, sigblad, tabel op blad
from: 11bc1bac
---

{{ui:Werkblaaie}} (Landskap › Meer) maak hierdie projek se werkblaaie oop. Die eerste keer word die **plantskedule** en die **verhardings- en oppervlakteskedule** vir jou gemaak. 'n Werkblad word elke keer uit die voorwerpe bereken wanneer dit gewys, uitgeskryf of op 'n blad geplaas word: verander 'n plantbed en die tellings verander oral.

- **Rye uit**: plante (een ry per spesie, kultivar en grootte), beplante oppervlaktes, plaveisel, mure, trappe, grondwysigers (afgrawing en opvulling) of alle hoeveelhede.
- **Kolomme**: 'n veld (`qty`, `area`, `botanical`, of 'n naam in hakies soos `[Net area]`) of 'n formule: `+ - * / ^ %`, `&` om teks te verbind, `= <> < <= > >=`, en `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. 'n Formule wat nie bereken kan word nie, wys `#ERR` (of `#DIV/0`) in sy sel. Formules word deur CadCraft se eie ontleder gelees; niks daarin word as kode uitgevoer nie.
- **Totaal** per kolom (som, telling, gemiddelde, kleinste, grootste), **Groepeer volgens** (subtotale per groep) en **Slegs rye waar**.
- {{ui:Stoor as CSV}}, {{ui:Stoor as XLSX}}, en **Plaas hierdie werkblad op die blaaie** (Blaaie › Werkblaaie teken dit as 'n tabel, oor soveel blaaie as nodig).

Etikette op plante en oppervlaktes lees dieselfde veldname (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
