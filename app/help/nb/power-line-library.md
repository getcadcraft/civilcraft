---
title: Ditt kraftlinjebibliotek
summary: Lag egne ledere, jordkabler, master, utstyr og grøftetyper, i kategorier du gir navn, og del dem som filer.
keywords: bibliotek, leder, kabel, stolpe, mast, tverrarm, isolator, beslag, stag, avspenning, transformator, skap, skjøt, grøft, kategori, csv, importer, eksporter
from: 88733744
---

**Bibliotek**-delen i Kraftlinjer-arbeidsområdet holder alle elementene en linje eller kabel kan bruke. Ingenting der er knyttet til et land eller en produsent: du lager elementene du arbeider med.

## Tre slags elementer

| Slag | Hvor det ligger | Kan du endre det? |
|---|---|---|
| **Eksempler** | Følger med CivilCraft, med generelle tall vi regnet ut fra materialegenskaper | Nei: {{ui:Kopier til mitt bibliotek}} først |
| **I prosjektet** | Fulgte med prosjektfilen du åpnet | Nei: {{ui:Kopier til mitt bibliotek}} først |
| **Mine** | Dine egne elementer, lagret i denne nettleseren | Ja, og endringer lagres med én gang |

Hvert prosjekt beholder en kopi av hvert element det bruker, slik at et prosjekt åpnes på hvilken som helst datamaskin med sine egne ledere og stolper.

:::warning
Eksempelelementene er eksempler: kontroller hvert tall mot leverandørens data. De underjordiske kablene har med vilje ingen strømgrense, fordi den avhenger av hvordan kabelen legges.
:::

## Lag et element

1. I **Bibliotek** velger du **Slag** (luftledere, jordkabler, master, utstyr eller grøftetyper).
2. Klikk {{ui:Nytt element}}, eller velg et eksempel og klikk {{ui:Kopier til mitt bibliotek}} eller {{ui:Dupliser}}.
3. Fyll inn feltene. Felt merket `*` er dem kontrollene trenger; et element som mangler ett, merkes med `!` og listes under **Kontroller** når en linje bruker det.
4. Gi det en **Kategori**, med `/` mellom nivåene: `Luftlinje/Lavspent/Bunt`, `Master/Betong/12 m`. Treet følger kategoriene dine.

Hva hver slag trenger:

| Slag | Trengs for kontrollene |
|---|---|
| Luftleder | tverrsnitt, diameter, masse per meter, bruddstyrke, elastisitetsmodul, termisk utvidelse |
| Jordkabel | antall ledere, tverrsnitt, spenning, diameter, motstand, strømgrense |
| Mast | total lengde, nominell last (tatt i et punkt under toppen), dybde i bakken |
| Utstyr | type; en merkelast for tverrarmer, beslag og stag; fasavstand og fall for tverrarmer; lengde for isolatorer; vinkelen for stag |
| Grøftetype | dybde, bredde, overdekning over kablene |

## Del det

- {{ui:Lagre mitt bibliotek}} lagrer alle elementene dine som én `.cclines.json`-fil; {{ui:Åpne et bibliotek…}} leser en tilbake (elementer med samme nøkkel erstattes).
- {{ui:Lagre som CSV}} lagrer slaget du ser på som et regneark; {{ui:Åpne et bibliotek…}} leser en CSV av det slaget tilbake. Kolonnene kan komme i hvilken som helst rekkefølge; en semikolonseparert fil kan bruke desimalkomma.
