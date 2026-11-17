---
title: Arbejdsark: lister knyttet til objekterne
summary: Gemte arbejdsark med rækker fra planter, beplantede arealer, belægning, mure, trin, terrænændringer eller alle mængder; dine egne kolonner og formler, grupper og summer; CSV, XLSX og en tabel på arkene, altid opdateret.
keywords: arbejdsark, liste, planteliste, befæstelsesliste, mængder, kolonner, formel, i alt, sum, tæl, gruppe, filter, csv, xlsx, regneark, tabel på ark
from: 11bc1bac
---

{{ui:Arbejdsark}} (Landskab › Mere) åbner dette projekts arbejdsark. Første gang laves **planteliste** og **befæstelses- og arealliste** for dig. Et arbejdsark udregnes ud fra objekterne, hver gang det vises, skrives ud eller lægges på et ark: ændrer du et bed, ændrer dets antal sig overalt.

- **Rækker fra**: planter (én række pr. art, sort og størrelse), beplantede arealer, belægning, mure, trin, terrænændringer (afgravning og opfyld) eller alle mængder.
- **Kolonner**: et felt (`qty`, `area`, `botanical` eller et navn i parentes som `[Net area]`) eller en formel: `+ - * / ^ %`, `&` til at sammenføje tekst, `= <> < <= > >=`, og `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. En formel, der ikke kan beregnes, viser `#ERR` (eller `#DIV/0`) i sin celle. Formler læses af CadCrafts egen fortolker; intet i dem køres som kode.
- **I alt** pr. kolonne (sum, antal, gennemsnit, mindste, største), **Gruppér efter** (delsummer pr. gruppe) og **Kun rækker hvor**.
- {{ui:Gem som CSV}}, {{ui:Gem som XLSX}} og **Læg dette arbejdsark på arkene** (Ark › Arbejdsark tegner det som en tabel, over så mange ark som der er brug for).

Etiketter på planter og arealer bruger de samme feltnavne (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
