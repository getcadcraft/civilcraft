---
title: Regneark: tabeller knyttet til objektene
summary: Lagrede regneark med rader fra planter, beplantede områder, belegg, murer, trapper, terrengmodifikatorer eller alle mengder; egne kolonner og formler, grupper og summer; CSV, XLSX og en tabell i arkene, alltid oppdatert.
keywords: regneark, tabell, planteliste, liste over harde flater, mengder, kolonner, formel, sum, antall, gruppe, filter, csv, xlsx, regnearkprogram, tabell i ark
from: 11bc1bac
---

{{ui:Regneark}} (Landskap › Mer) åpner dette prosjektets regneark. Første gang lages **planteliste** og **liste over harde flater og arealer** automatisk. Et regneark beregnes fra objektene hver gang det vises, skrives ut eller legges på et ark: endres et bed, endres tellingene overalt.

- **Rader fra**: planter (én rad per art, sort og størrelse), beplantede områder, belegg, murer, trapper, terrengmodifikatorer (skjæring og fylling) eller alle mengder.
- **Kolonner**: et felt (`qty`, `area`, `botanical`, eller et navn i hakeparenteser som `[Net area]`) eller en formel: `+ - * / ^ %`, `&` for å sette sammen tekst, `= <> < <= > >=`, og `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. En formel som ikke kan beregnes, viser `#ERR` (eller `#DIV/0`) i cellen. Formler leses av CadCrafts egen tolker; ingenting i dem kjøres som kode.
- **Totalt** per kolonne (sum, antall, gjennomsnitt, minste, største), **Grupper etter** (delsummer per gruppe) og **Bare rader der**.
- {{ui:Lagre som CSV}}, {{ui:Lagre som XLSX}}, og **Legg dette regnearket på arkene** (Ark › Regneark tegner det som en tabell, over så mange ark som det trengs).

Etiketter på planter og områder bruker de samme feltnavnene (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
