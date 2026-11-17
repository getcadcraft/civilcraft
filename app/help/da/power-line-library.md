---
title: Dit elledningsbibliotek
summary: Lav dine egne ledere, underjordiske kabler, understøtninger, udstyr og grøftetyper i kategorier, du selv navngiver, og del dem som filer.
keywords: bibliotek, leder, kabel, stolpe, understøtning, tværbjælke, isolator, beslag, stag, barduner, transformer, skab, samling, grøft, kategori, csv, importér, eksportér
from: 88733744
---

**Bibliotek**-afsnittet i arbejdsområdet Elledninger indeholder alle de emner, en linje eller et kabel kan bruge. Intet i det er knyttet til et land eller en producent: du laver de emner, du arbejder med.

## Tre slags emner

| Slags | Hvor det findes | Kan du ændre det? |
|---|---|---|
| **Eksempler** | Følger med CivilCraft, med generiske tal, vi har regnet ud fra materialeegenskaber | Nej: {{ui:Kopiér til mit bibliotek}} først |
| **I projektet** | Fulgte med projektfilen, du åbnede | Nej: {{ui:Kopiér til mit bibliotek}} først |
| **Mine** | Dine egne emner, gemt i denne browser | Ja, og ændringer gemmes med det samme |

Hvert projekt gemmer en kopi af hvert emne, det bruger, så et projekt kan åbnes på enhver computer med sine egne ledere og stolper.

:::warning
Eksempelemnerne er eksempler: kontrollér hvert tal mod din leverandørs data. De underjordiske kabler har bevidst ingen strømværdi, fordi den afhænger af, hvordan kablet lægges.
:::

## Lav et emne

1. Vælg under **Bibliotek** **Slags** (luftledere, underjordiske kabler, understøtninger, udstyr eller grøftetyper).
2. Klik på {{ui:Nyt emne}}, eller vælg et eksempel og klik på {{ui:Kopiér til mit bibliotek}} eller {{ui:Duplikér}}.
3. Udfyld dets felter. Felter markeret med `*` er dem, kontrollerne har brug for; et emne, der mangler et af dem, markeres med `!` og listes under **Kontroller**, når en linje bruger det.
4. Giv det en **Kategori**, med `/` mellem niveauerne: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. Træet følger dine kategorier.

Hvad hver slags kræver:

| Slags | Nødvendigt for kontrollerne |
|---|---|
| Luftleder | tværsnit, diameter, masse pr. meter, brudstyrke, elasticitetsmodul, termisk udvidelse |
| Underjordisk kabel | årer, tværsnit, spænding, diameter, modstand, strømværdi |
| Understøtning | samlet længde, nominel last (taget i et punkt under toppen), dybde i jorden |
| Udstyr | dets type; en mærkelast for tværbjælker, beslag og stag; fasetafstand og fald for tværbjælker; længde for isolatorer; vinklen for stag |
| Grøftetype | dybde, bredde, dæklag over kablerne |

## Del det

- {{ui:Gem mit bibliotek}} gemmer alle dine emner som én `.cclines.json`-fil; {{ui:Åbn et bibliotek…}} læser en tilbage (emner med samme nøgle erstattes).
- {{ui:Gem som CSV}} gemmer den slags, du kigger på, som et regneark; {{ui:Åbn et bibliotek…}} læser en CSV af den slags tilbage. Kolonnerne må komme i vilkårlig rækkefølge; en semikolonsepareret fil må bruge decimalkomma.
