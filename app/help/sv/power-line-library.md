---
title: Ditt bibliotek för kraftledningar
summary: Skapa egna linor, underjordiska kablar, stöd, utrustning och kabelgravtyper, i kategorier du namnger, och dela dem som filer.
keywords: bibliotek, lina, kabel, stolpe, stöd, tvärarm, isolator, beslag, stag, barduner, transformator, skåp, skarv, kabelgrav, kategori, csv, import, export
from: 88733744
---

Avsnittet **Bibliotek** i arbetsytan Kraftledningar innehåller alla objekt som en linje eller kabel kan använda. Inget i det är kopplat till ett land eller en tillverkare: du skapar de objekt du arbetar med.

## Tre typer av objekt

| Typ | Var det finns | Kan du ändra det? |
|---|---|---|
| **Exempel** | Levereras med CivilCraft, med generiska värden som vi räknat fram från materialegenskaper | Nej: använd först {{ui:Kopiera till mitt bibliotek}} |
| **I projektet** | Följde med projektfilen du öppnade | Nej: använd först {{ui:Kopiera till mitt bibliotek}} |
| **Mina** | Dina egna objekt, sparade i den här webbläsaren | Ja, och ändringar sparas direkt |

Varje projekt sparar en kopia av varje objekt det använder, så att ett projekt öppnas på vilken dator som helst med sina egna linor och stolpar.

:::warning
Exempelobjekten är just exempel: kontrollera varje värde mot din leverantörs data. De underjordiska kablarna saknar avsiktligt strömvärde, eftersom det beror på hur kabeln läggs.
:::

## Skapa ett objekt

1. I **Bibliotek** väljer du **Typ** (luftledningslinor, underjordiska kablar, stöd, utrustning eller kabelgravtyper).
2. Klicka på {{ui:Nytt objekt}}, eller välj ett exempel och klicka på {{ui:Kopiera till mitt bibliotek}} eller {{ui:Duplicera}}.
3. Fyll i dess fält. Fält markerade med `*` är de som kontrollerna behöver; ett objekt som saknar ett sådant markeras med `!` och listas under **Kontroller** när en linje använder det.
4. Ge det en **Kategori**, med `/` mellan nivåerna: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. Trädet följer dina kategorier.

Vad varje typ behöver:

| Typ | Behövs för kontrollerna |
|---|---|
| Luftledningslina | tvärsnitt, diameter, massa per meter, brottstyrka, elasticitetsmodul, termisk längdutvidgning |
| Underjordisk kabel | ådror, tvärsnitt, spänning, diameter, resistans, strömvärde |
| Stöd | total längd, nominell last (tagen vid en punkt under toppen), djup i marken |
| Utrustning | dess typ; en märklast för tvärarmar, beslag och stag; fasavstånd och fall för tvärarmar; längd för isolatorer; vinkeln för stag |
| Kabelgravtyp | djup, bredd, täckning över kablarna |

## Dela det

- {{ui:Spara mitt bibliotek}} sparar alla dina objekt i en enda `.cclines.json`-fil; {{ui:Öppna ett bibliotek…}} läser in en sådan igen (objekt med samma nyckel ersätts).
- {{ui:Spara som CSV}} sparar den typ du tittar på som ett kalkylblad; {{ui:Öppna ett bibliotek…}} läser tillbaka en CSV av den typen. Kolumnerna får komma i valfri ordning; en fil med semikolon som avskiljare får använda decimalkomma.
