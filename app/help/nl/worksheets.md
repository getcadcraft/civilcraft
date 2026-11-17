---
title: Werkbladen: staten die aan de objecten gekoppeld zijn
summary: Opgeslagen werkbladen met rijen van planten, beplante vlakken, bestrating, muren, trappen, grondaanpassingen of alle hoeveelheden; uw eigen kolommen en formules, groepen en totalen; CSV, XLSX en een tabel op de bladen, altijd actueel.
keywords: werkblad, staat, plantenstaat, verhardingsstaat, hoeveelheden, kolommen, formule, totaal, som, aantal, groep, filter, csv, xlsx, spreadsheet, tabel op blad
from: 11bc1bac
---

{{ui:Werkbladen}} (Landschap › Meer) opent de werkbladen van dit project. De eerste keer worden de **plantenstaat** en de **staat van verharding en oppervlakten** voor u gemaakt. Een werkblad wordt elke keer uit de objecten berekend wanneer het wordt getoond, uitgeschreven of op een blad geplaatst: wijzig een vak en de aantallen veranderen overal.

- **Rijen van**: planten (één rij per soort, cultivar en maat), beplante vlakken, bestrating, muren, trappen, grondaanpassingen (ontgraving en ophoging) of alle hoeveelheden.
- **Kolommen**: een veld (`qty`, `area`, `botanical`, of een naam tussen haakjes zoals `[Net area]`) of een formule: `+ - * / ^ %`, `&` om tekst samen te voegen, `= <> < <= > >=`, en `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Een formule die niet kan worden berekend, toont `#ERR` (of `#DIV/0`) in de cel. Formules worden gelezen door de eigen parser van CadCraft; niets erin wordt als code uitgevoerd.
- **Totaal** per kolom (som, aantal, gemiddelde, kleinste, grootste), **Groeperen op** (subtotalen per groep) en **Alleen rijen waar**.
- {{ui:Opslaan als CSV}}, {{ui:Opslaan als XLSX}} en **Zet dit werkblad op de bladen** (Bladen › Werkbladen tekent het als een tabel, over zoveel bladen als nodig is).

Labels op planten en vlakken gebruiken dezelfde veldnamen (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
