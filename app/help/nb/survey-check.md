---
title: Kontroller en oppmålingstegning ved import
summary: Les høyder skrevet som tekst eller i blokkattributter som oppmålingspunkter, og kontroller en DWG eller DXF for feil enheter, manglende koordinatsystem, et fjernt origo, flate høydekurver, avvikende høyder og doble punkter før du bygger terreng fra den.
keywords: oppmålingskontroll, importkontroll, oppmålingshøyder, kotehøyder, høyder som tekst, attributter, enheter, koordinatsystem, langt fra origo, høydekurver på null, avvikere, dupliserte punkter, problemer, landskapsarkitekt, oppmålingstegning
from: d46acd24
---

En oppmålingstegning kan se riktig ut og likevel være feil for et terreng: enhetene kan være gjettet, høydekurvene kan ligge flate på høyde 0, eller høydene kan være skrevet som tekst som ikke er geometri i det hele tatt. Delen **Oppmålingshøyder og kontroll** i dialogboksen {{ui:Tegningslinjer}} (se [Åpne en DWG eller DXF som tegningslinjer](topic:open-dwg-dxf)) leser disse høydene og forteller deg hva som ser feil ut før noe legges til.

## Høyder skrevet som tekst eller i attributter

Mange oppmålingstegninger gir en kotehøyde som en liten tekst ved siden av et kryss, for eksempel `104.37` eller `EL 104.37`, eller som en attributt til et punktblokk. Dette er ikke linjer, så tegningslinjeleseren utelater dem. Delen lister hvor mange den fant, og lar deg ta dem med som **oppmålingspunkter**:

1. Kryss av for **Ta med … høyder som oppmålingspunkter**. Den starter avkrysset av, fordi ikke alle tall i en tegning er høyder.
2. Tekst leses når den er en høyde alene: et tall med desimaldel (`104.37`, `+104,37`, `-3.50`), eller et tall etter `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` eller `LEVEL`, med valgfri `m`, `ft` eller `'` etter. Et helt tall alene (`12`) leses som et tomte- eller bladnummer, ikke en høyde; tekst som `GATE 3` eller en dato leses aldri. Formateringskoder i teksten ignoreres.
3. For blokkattributter velger du **Blokkattributt som holder høyden**. CivilCraft finner selv en tagg som heter ELEV, Z, LEVEL, RL eller lignende; velg en annen fra listen hvis tegningen bruker sin egen. Valget huskes for det filnavnet på denne datamaskinen, så åpnes den igjen, starter den på samme tagg. En tagg du velger, tar også hele tall som høyder.
4. Klikk {{ui:Legg til}}. Punktene nummereres etter det høyeste nummeret i prosjektet, hvert punkt beskrives med sitt lag (eller sin blokk), og høydene konverteres til prosjektets enheter som resten av tegningen. Alt er ett steg: {{key:Mod+Z}} fjerner punktene.

Teksten ligger på sitt eget innsettingspunkt (eller justeringspunktet, når det finnes ett). Tekst inne i blokker leses ikke, og tegningen endres aldri.

## Kontrollen

Kontrollen kjøres på det du er i ferd med å hente inn, og lister det den finner, med én linje for hver type problem:

| Den sier | Hva det betyr |
|---|---|
| **Enheter ikke oppgitt** | Tegningen sier ikke hva enhetene er, så tallene leses som prosjektets enheter. Kontroller én avstand du kjenner. |
| **Enheter konvertert** | Tegningens enheter avviker fra prosjektets og skaleres (en merknad, ikke en feil). |
| **Dataene spenner over … km** eller **… m** | Utstrekningen er større enn 200 km eller mindre enn en halv meter, noe som vanligvis betyr feil enhet (millimeter lest som meter, eller omvendt). |
| **Ingen koordinatsystem** | Prosjektet har ingen. Det er en advarsel når dataene ligger langt fra null, slik som koordinater for statlig plan eller nasjonalt nett. Se [Koordinatsystemer](topic:coordinate-systems). |
| **Langt fra origo** | Dataene ligger mer enn 100 km fra null. Langt fra null mister 3D-visninger og eksport presisjon og rister. |
| **Høydekurvelaget … har ingen høyde** | Et lag med navn som høydekurver (TOPO, CONT, CNTR, CONTOUR) har linjer på høyde 0, så et terreng bygget av dem ville være flatt. |
| **Høyder nøyaktig 0** | Noen høyder er 0 mens den typiske høyden er langt fra det: sannsynligvis manglende høyder. |
| **Høyder langt fra resten** | Noen få høyder ligger langt utenfor de andre (målt mot midten av alle høydene, så en bratt tomt med stort spenn flagges ikke), eller over 9,000 m eller under -11,000 m. |
| **Punkter oppå et annet punkt** | To punkter på samme sted med samme høyde, eller med ulike høyder. |

Etter at du klikker {{ui:Legg til}}, går de samme linjene til **Problemer**, én for hver type, med filnavnet, så du kan komme tilbake til dem. Kontrollen dømmer tegningen; den endrer ingenting i den, og den hindrer deg ikke i å bruke tegningen.

:::tip
Når kontrollen sier at høydekurver er flate på 0 og det finnes høyder skrevet som tekst, ta høydene med som oppmålingspunkter: de bærer ofte de virkelige høydene som høydekurvelinjene mangler.
:::

## Det som ikke kontrolleres

Kontrollen sammenligner ikke tegningen med en annen oppmåling, og den kan ikke si hvilket koordinatsystem tegningen er i: den forteller bare at ingen er satt.
