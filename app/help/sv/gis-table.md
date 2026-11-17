---
title: Arbeta med ett lagers attributtabell
summary: Se varje objekt i ett GIS-lager som en tabell, sortera och filtrera den, markera rader och objekt tillsammans, rätta värden, lägg till fält, beräkna nya värden och spara tabellen som CSV.
keywords: attributtabell, tabell, fält, kolumner, rader, sortera, filtrera, uttryck, markera, redigera, fältkalkylator, beräkna, lägg till fält, byt namn på fält, ta bort fält, csv, exportera, gis, shapefile, geopackage, symbologi
from: fd9d6c11
---

Öppna ett lagers tabell från dess **tre prickar**-meny i listan GIS-lager ({{ui:Attribute table…}}), från Terrängmodell › Mer › {{ui:Attribute table}}, eller genom att skriva `ATTRIBUTES`, `ATTTABLE` eller `TABLE`. Tabellen öppnas bredvid planen och förblir öppen medan du arbetar. Bara de rader du kan se ritas, så ett lager med tusentals objekt öppnas och rullar snabbt.

## Sortera, filtrera och markera

- **Sortera:** klicka på en kolumnrubrik. Ett andra klick vänder ordningen, ett tredje återställer filens ordning. Tomma värden hamnar alltid längst ner. Sortering ändrar bara vad du ser, aldrig lagret.
- **Filtrera:** skriv i filterrutan. Ett uttryck som `AREA > 500 and USE = 'Res'` behåller raderna där det är sant (samma ord som fliken Markera i [Analysera GIS-lager](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Allt som inte är ett uttryck, som `oak maple`, letar efter de orden i varje kolumn.
- **Markera rader:** klicka på en rad. Ctrl+klick lägger till eller tar bort en, Shift+klick markerar ett intervall, och {{ui:Select shown rows}} tar varje rad som passerar filtret. De markerade objekten ritas på planen, och ett klick på ett objekt på planen markerar dess rad här.
- Med rader markerade kan du {{ui:Zoom}} till dem, göra ett **lager av markeringen**, och läsa den totala arean eller längden på statusraden.

## Rätta värden

Dubbelklicka på en cell (eller flytta dit med piltangenterna och tryck på Enter), skriv det nya värdet och tryck på Enter. Esc lämnar det som det var. Ett värde måste passa kolumnen: tal som tal, datum som `YYYY-MM-DD`, ja/nej som ja, nej, true eller false. Ett värde som inte passar avvisas med en mening och ingenting ändras. En tom ruta gör värdet tomt. Varje redigering är ett steg i ångra: {{ui:Undo}} och {{ui:Redo}} finns längst ner i tabellen, och Ctrl+Z fungerar på planen.

## Fält

Under **Fält** kan du lägga till ett fält (text, tal, datum eller ja/nej), byta namn på ett eller ta bort ett. Ett nytt fält börjar tomt. Ett namnbyte följer med: etikettfältet och lagrets [formatering efter attribut](topic:gis-symbology) flyttas till det nya namnet, och att ta bort ett fält tar bort etiketten och formateringen som använde det. Varje är ett steg i ångra som återställer allt.

## Fältkalkylator

Skriver ett värde i varje rad (eller bara i de markerade raderna) från radens andra fält, dess geometri och några funktioner. Välj ett befintligt fält eller **Ett nytt fält…** och ge det ett namn och en typ. Ingenting körs som kod: uttrycket läses av en liten tolkare med en fast lista över funktioner.

| Grupp | Ord |
|---|---|
| Tal | `+ - * /`, parenteser, `abs round(x, digits) floor ceil sqrt pow min max` |
| Text | `upper lower trim len substr(text, from, count) left right replace concat` (text skrivs inom 'enkla citattecken'; ett fältnamn med mellanslag skrivs inom "dubbla citattecken" eller [hakparenteser]) |
| Val | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datum | `year month day` av ett `YYYY-MM-DD`-värde |
| Geometri | `$area $perimeter $length $x $y $vertices`, i projektets enheter |

Ett resultat som inte kan lagras i fältets typ (text i ett talfält) lämnas tomt och räknas i meddelandet. Division med noll ger ett tomt värde. Till exempel skriver `round($area / 43560, 2)` acres från kvadratfot.

## Exportera

{{ui:Export CSV}} sparar de rader du ser (efter filtret och sorteringen) som en UTF-8-CSV-fil med fältnamnen på första raden. En text som börjar med `=`, `+`, `-` eller `@` får ett inledande apostrof, så att ett kalkylblad inte kör den som en formel. För att spara själva lagret, använd [Exportera as-built-data för GIS](topic:gis-export).

## Begränsningar

Tabellen visar lagret i en enda sorteringsordning och ett filter åt gången. Rader kan inte läggas till eller tas bort här (gör i stället ett nytt lager av en markering), geometrin redigeras inte, och ett fälts typ kan inte ändras när det väl har skapats.
