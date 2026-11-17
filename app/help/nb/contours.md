---
title: Les høydekurver, kotehøyder og fall
summary: Angi kurveavstand og hovedkurver, vis høydebånd, fallpiler og trekanter, og les terrenghøyder under pekeren.
keywords: høydekurver, kurveavstand, hovedkurver, etiketter, høydebånd, fallpiler, trekanter, kotehøyde, overflateanalyse, høydeanalyse, fallanalyse
from: 585e500a
---

Terrengmodellen vises med høydekurver så snart den finnes. Alt i dette emnet angis under **Visning** i venstre panel. Visningsinnstillinger endrer bare det du ser (og det du eksporterer); de er ikke angrehandlinger.

## Angi kurveavstanden

1. Under **Visning**, velg en verdi i **Kurver hver**.
   - I fot: 0.25, 0.5, 1, 2, 5, 10 eller 20 ft.
   - I meter: 0.1, 0.25, 0.5, 1, 2, 5 eller 10 m.
2. Velg **Hovedkurve hver**: den 2., 4., 5. eller 10. kurven.
   Hovedkurver tegnes tykkere og merkes med høyden sin. De ligger på hele multipler av hovedavstanden (med 1 ft kurver og hver 5. hovedkurve: 245, 250, 255 …).
3. Slå av {{ui:Kurveetiketter}} hvis etikettene er for tette på en liten plott.

Et nytt prosjekt starter med 1 enhet, og hver 5. kurve er hovedkurve. Kurver brytes ved bruddlinjer; hvis de går rett over en renne eller en rygg, er ikke linjen en bruddlinje ennå (se [Bygg og finjuster terrengmodellen](topic:build-surface)).

:::note
Kurver tegnes bare når det er høyst 2 000 nivåer mellom laveste og høyeste punkt. På en tomt med stor høydeforskjell og et svært lite intervall vises ingen kurver i planen: velg et større intervall.
:::

## Glatt kurvene

Kurver tegnes som rette stykker, ett over hver trekant i terrengmodellen, så de tar en liten vinkel ved hver trekantkant. **Kurveutjevning** under **Visning** runder av disse hjørnene:

- **Ingen (rette stykker)**: linjene slik de er tegnet. Dette er det en ny eller eldre tegning viser.
- **Lett**: hjørnene rundes litt av. En linje flytter seg aldri mer enn 10 % av veien mot neste kurve, og aldri lenger fra det rette stykket enn en sjettedel av lengden på stykket.
- **Sterk**: en flytende kurve. En linje flytter seg aldri mer enn 25 % av veien mot neste kurve, og aldri lenger fra det rette stykket enn en tredjedel av lengden på stykket.

Med begge valg krysser en utjevnet kurve fortsatt hver trekantkant i samme punkt som den opprinnelige, holder seg innenfor trekanten hvert stykke krysser, og kan derfor aldri krysse eller berøre en annen kurve. Der en kurve krysser en bruddlinje eller grensen, beholder den sin skarpe vinkel. De utjevnede linjene er de som plottes og eksporteres (DXF, DWG, PDF, GIS og 3D), og de har flere hjørnepunkter enn de opprinnelige linjene.

Utjevning endrer bare de tegnede linjene. Høyder, volumer, profiler og snitt leses fortsatt fra selve terrengmodellen. En kurve som går nøyaktig gjennom målepunkter (et punkt på 250.00 på 250-kurven) beholder en liten vinkel i hvert slikt punkt.

## Slik lages overflaten bak kurvene

Kurvene følger terrengmodellen, og terrengmodellen følger **Kurvemetode** under **Terrengmodell** i venstre panel. Standarden, **Triangulering med lineær interpolasjon**, forbinder punktene dine til trekanter og beholder hvert punkt og hver bruddlinje nøyaktig. De andre metodene tilpasser først et rutenett til punktene (kriging, minimumskrumning, naturlig nabo, invers avstand og flere). Det gir rundere kurver mellom punktene, men ingen av dem går nøyaktig gjennom hvert punkt. Overflaterapporten under **Terrengmodell** sier hvor langt unna resultatet er i punktene dine.

**ABOS (tilnærming basert på utjevning)** er en av de rutenettbaserte metodene. Den har to egne innstillinger: **Glatthet** (0.5 til å begynne med; lavere er glattere) og **Nøyaktighet** (1 til å begynne med: terrengmodellen bringes innenfor 1 % av områdets høydeforskjell i punktene dine; skriv et mindre tall for en tettere tilpasning). Hvis den ikke kan nå nøyaktigheten på rutenettet den har, sier overflaterapporten fra det: skriv en mindre **Rutenettavstand**.

## Les en høyde hvor som helst

Flytt pekeren over planen. Statuslinjen viser:

- **Ø** og **N** under pekeren
- **Terreng** og den eksisterende terrenghøyden der, interpolert i trekanten under pekeren
- **Formet** og den prosjekterte høyden, der en byggeplate eller korridor har endret terrenget
- «Utenfor terrengmodellen» utenfor terrengmodellen

For å lese et målepunkt nøyaktig, velg {{ui:Velg}} og klikk på punktet. Høyre panel viser nummeret, østkoordinaten, nordkoordinaten, høyden, beskrivelsen og gruppen.

## Vis høydebånd

1. Kryss av {{ui:Høydebånd}}.
   Terrengmodellen fylles med farge fra lav (blågrønn) til høy (okerbrun). En forklaring under avmerkingsboksene viser høydeintervallet for hvert bånd.
2. Velg hvor mange bånd under **Antall bånd**: 5, 8, 10 eller 12. Båndene deler intervallet fra laveste til høyeste høyde i like steg.

Høydebånd er bare til visning. De eksporteres ikke til DXF og plottes ikke til PDF.

## Vis fallpiler

Kryss av {{ui:Fallpiler}}. En kort pil på hver trekant som er stor nok til å romme en, peker nedover i fallet. Flate trekanter får ingen pil. Pilene er en rask sjekk av avløpsretningen; fallverdien selv er ikke merket ennå.

## Vis trekanter, punkter og kanter

- {{ui:Trekanter}} tegner kantene i TIN-en. Slå den på for å sjekke hvordan terrengmodellen forbinder punktene, særlig langs bruddlinjer og ved ytterkanten.
- {{ui:Punkter}} tegner hvert målepunkt. {{ui:Punktetiketter}} legger til nummeret, høyden og beskrivelsen (eller mindre: se **Punktetiketter** i [innstillinger for CivilCraft](topic:settings)).
- {{ui:Bruddlinjer}} tegner bruddlinjer (og grensen) i oransje.
- {{ui:Terrengmodellens kant}} tegner omrisset av terrengmodellen.

## Eksisterende eller prosjektert

Når en byggeplate eller korridor formes uten problemer, tilbyr **Terrengmodell** under **Visning** {{ui:Prosjektert (formet)}}. Kurvene, båndene og pilene viser da den formede terrengmodellen, slik at du ser det nye terrenget og dagslinjen rundt det. Bytt tilbake til {{ui:Eksisterende terreng}} for å se målingen.

## Hva som eksporteres

DXF- og PDF-utdata følger disse innstillingene: det du har slått av, skrives ikke, og kurvene er de til terrengmodellen som vises. Høydebånd eksporteres aldri.
