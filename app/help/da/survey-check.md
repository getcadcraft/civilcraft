---
title: Kontrollér en opmålingstegning ved import
summary: Læs koter skrevet som tekst eller i blokattributter som opmålingspunkter, og kontrollér en DWG eller DXF for forkerte enheder, manglende koordinatsystem, et fjerntliggende origo, flade højdekurver, mærkelige koter og dobbelte punkter, før du bygger terræn ud fra den.
keywords: opmålingskontrol, importkontrol, opmålingskoter, punktkoter, tekstkoter, koter som tekst, attributter, enheder, koordinatsystem, langt fra origo, højdekurver ved nul, udliggere, dublerede punkter, problemer, landskabsarkitekt, opmålingstegning
from: d46acd24
---

En opmålingstegning kan se rigtig ud og stadig være forkert for et terræn: dens enheder kan være gættet, dens højdekurver kan ligge flade i højde 0, eller dens koter kan være skrevet som tekst, der slet ikke er geometri. Afsnittet **Opmålingskoter og kontrol** i dialogen {{ui:Stregtegning}} (se [Åbn en DWG eller DXF som stregtegning](topic:open-dwg-dxf)) læser disse koter og fortæller dig, hvad der ser forkert ud, før noget tilføjes.

## Koter skrevet som tekst eller i attributter

Mange opmålingstegninger angiver en punktkote som en lille tekst ved siden af et kryds, som `104.37` eller `EL 104.37`, eller som en attribut på en punktblok. Disse er ikke linjer, så læseren af stregtegningen udelader dem. Afsnittet viser, hvor mange det fandt, og lader dig tage dem med som **opmålingspunkter**:

1. Sæt flueben i **Tag … koter med som opmålingspunkter**. De starter uden flueben, fordi ikke alle tal i en tegning er en højde.
2. Tekst læses, når den er en kote alene: et tal med en decimaldel (`104.37`, `+104,37`, `-3.50`), eller et tal efter `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` eller `LEVEL`, med en valgfri `m`, `ft` eller `'` efter. Et heltal alene (`12`) læses som et matrikel- eller bladnummer, ikke som en kote; tekst som `GATE 3` eller en dato læses aldrig. Tekstformateringskoder ignoreres.
3. For blokattributter vælger du **Blokattribut der indeholder koten**. CivilCraft finder selv et attributmærke kaldet ELEV, Z, LEVEL, RL eller lignende; vælg et andet fra listen, hvis tegningen bruger sit eget. Valget huskes for det filnavn på denne computer, så åbnes den igen, starter den på samme mærke. Et mærke, du vælger, tager også hele tal med som koter.
4. Klik på {{ui:Tilføj}}. Punkterne nummereres efter det højeste nummer i projektet, hvert punkt beskrives med sit lag (eller sin blok), og højderne omregnes til projektets enheder ligesom resten af tegningen. Det hele er ét trin: {{key:Mod+Z}} fjerner punkterne igen.

Teksten sidder på sit eget indsætningspunkt (eller sit justeringspunkt, når det har et). Tekst inde i blokke læses ikke, og tegningen ændres aldrig.

## Kontrollen

Kontrollen kører på det, du er ved at hente ind, og lister det den finder, med én linje for hver type problem:

| Den siger | Hvad det betyder |
|---|---|
| **Enheder ikke angivet** | Tegningen siger ikke, hvad dens enheder er, så dens tal læses som projektets enheder. Kontrollér én afstand, du kender. |
| **Enheder omregnet** | Tegningens enheder afviger fra projektets og skaleres (en note, ikke en fejl). |
| **Data spænder over … km** eller **… m** | Udstrækningen er større end 200 km eller mindre end en halv meter, hvilket normalt betyder en forkert enhed (millimeter læst som meter, eller omvendt). |
| **Intet koordinatsystem** | Projektet har ingen. Det er en advarsel, når data ligger langt fra nul, som statsplan- eller nationale gitterkoordinater gør. Se [Koordinatsystemer](topic:coordinate-systems). |
| **Langt fra origo** | Data ligger mere end 100 km fra nul. Langt fra nul mister 3D-visninger og eksporter præcision og ryster. |
| **Højdekurvelag … har ingen højde** | Et lag med et navn som højdekurver (TOPO, CONT, CNTR, CONTOUR) indeholder linjer i højde 0, så et terræn bygget af dem ville være fladt. |
| **Koter præcis 0** | Nogle koter er 0, mens den typiske kote ligger langt fra det: sandsynligvis manglende højder. |
| **Koter langt fra resten** | Nogle få koter ligger langt uden for de andre (fundet i forhold til midten af alle koterne, så en stejl grund med et stort spænd ikke markeres), eller over 9,000 m eller under -11,000 m. |
| **Punkter oven på et andet punkt** | To punkter på samme sted med samme kote, eller med forskellige koter. |

Efter du klikker på {{ui:Tilføj}}, går de samme linjer til **Problemer**, én for hver type, med filnavnet, så du kan vende tilbage til dem. Kontrollen vurderer tegningen; den ændrer intet i den, og den forhindrer dig ikke i at bruge tegningen.

:::tip
Når kontrollen siger, at højdekurver er flade i 0, og der er koter skrevet som tekst, så tag koterne med som opmålingspunkter: de bærer ofte de rigtige højder, som højdekurverne mangler.
:::

## Hvad der ikke kontrolleres

Kontrollen sammenligner ikke tegningen med en anden opmåling, og den kan ikke sige, hvilket koordinatsystem tegningen er i: den fortæller dig kun, at der ikke er angivet noget.
