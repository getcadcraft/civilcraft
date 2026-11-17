---
title: Tegn en hage, fra start til slutt
summary: Landskapsarkitektens ti steg, fra oppmålingen til det publiserte settet, med hva arbeidsområdet Landskap gjør for hvert steg i dag, og hva det ikke gjør ennå.
keywords: veiledning, gjennomgang, hvordan, landskapsdesign, hagedesign, komme i gang, eksempel, steg for steg, oppmåling, linjetegning, terreng, planting, liste, ark, publisere, ett prosjekt
from: 87900bf5
---

En landskapstegning går i ring: oppmåling, skisse, linjer, terreng, områder, nivåer, planting, lister, ark, og tilbake igjen. Dette er de ti stegene, med det som finnes for hvert av dem. Der et steg har et hull, er det nevnt under **Ikke bygget ennå** til slutt, og ikke skjult i steget.

Du kan følge med på eksempeltomten, eller på din egen oppmålingstegning. Med din egen starter du på steg 1.

## 1. Hent inn oppmålingen

{{ui:Terrengmodell}} › {{ui:Tegningslinjer fra en tegning…}}, velg oppmålingstegningen (DWG 2000–2018 eller DXF). Kontroller enhetene, og ta med konturene, 3D-polylinjene og grensen for terrengmodellen, og punktblokkene som oppmålingspunkter. Seksjonen **Oppmålingsnivåer og kontroll** leser nivåer skrevet som tekst eller som attributt, og lister opp det som ser feil ut (enheter, koordinatsystem, avstand fra null, flate konturer, rare nivåer, doble punkter) før du legger til noe. Se [Kontroller en oppmålingstegning ved import](topic:survey-check) og [Åpne en DWG eller DXF som linjer](topic:open-dwg-dxf). Sett koordinatsystemet med {{ui:Koordinatsystem…}}.

## 2. Håndskisser

Et ark på papir, for eksempel en gammel oppmåling eller en markert kopi, kommer inn med {{ui:Skann…}} (Start fra en skanning): det plasseres i riktig målestokk eller på kjente koordinater under planen, og kan følges opp som linjer. ModelCraft leser et bilde av en håndskisse (Fil › Importer et skissebilde…). CivilCraft har i seg selv ingen verktøy for håndskisser: legg arket under planen og tegn over det.

## 3. Fra skisse til linjer

Tegn elementlinjer og konturer over oppmålingen i CivilCraft, eller tegn dem i 2D-tegningen. Landskap › Mer › {{ui:Fra en linje}} gjør en linje om til belegg, et plantet område, en mur, trapper, en elementlinje og mer, og holdes koblet: flytter du linjen, følger objektet med. Se [Objekter fra linjer](topic:objects-from-lines). I SuperCad Studio åpner du tomten, tegningen og bygningsmodellen i ett prosjekt: arbeidsområdet **Landskap** har verktøyene til alle, og en linje valgt i 2D-tegningen kan bli et landskapsobjekt som følger den (Ctrl+K, {{ui:Landskapsobjekt fra valgt tegningslinje}}).

## 4. Planlagt terreng

Åpne {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Landskapsarbeidsområde}}. Bygg det planlagte terrenget med {{ui:Plattform}}, {{ui:Voll}} og {{ui:Grasgrøft}}, og terrengformingsområder med kotehøyder og konturer. Belegg, stier, murer, rampe og trapper du legger til, graderes inn i samme planlagte overflate. Det eksisterende terrenget endres aldri. {{ui:Nivåer}} › {{ui:Terrengmodifikatorer…}} lister alt som former terrenget, i én rekkefølge, med avskjæring og fylling for hvert. Se [Terrengforming](topic:landscape-grading) og [Terrengmodifikatorer og levende nivåer](topic:ground-modifiers).

## 5. Belegg og plantede områder

{{ui:Harde flater}} › {{ui:Belegg}}, {{ui:Sti}}, {{ui:Mur}}, {{ui:Kantstein}}, {{ui:Rampe}} og {{ui:Trapp}}. {{ui:Områder}} tegner en plen, et bed, en eng eller et bakkedekke med sin oppbygging, og klipper seg selv rundt belegg, murer og trapper. {{ui:Bed}} fyller et område med planter i riktig avstand, fra en blanding av planter. Se [Harde flater](topic:hardscape), [Plantede områder](topic:planted-areas) og [Planting](topic:planting).

## 6. Nivåer, fall og koblinger

Under **Terrengkontroller** huker du av **Fallanalyse** og **Strømningspiler og vannsamling**. Hvis vann samler seg mot en terrasse, legg til en {{ui:Grasgrøft}} rundt den. Egenskaper forteller hvor mange opptrinn trappen trenger og om de passer, og hvor en sti er brattere enn grensen sin. Problemer-panelet lister opp der objekter møtes dårlig: en mur som er for høy, et bed over belegget, trapper som bommer på repoet. {{ui:Kotehøyde}} og {{ui:Fallpil}} merker terrenget og oppdaterer seg selv.

## 7. Planting

Under **Planter** søker du i plantelisten (noen hundre arter, eller din egen liste), velger en, og {{ui:Plante}}, {{ui:Bed}} eller {{ui:Hekk}}. Sett plantens størrelse og merkelapper fra Mer. Mer › {{ui:Planteliste}} redigerer dine egne poster: sorter, leverte størrelser, tetthet og spesifikasjonsnotater. Hver post kan ha ditt eget symbol og 3D-modell (OBJ, STL eller GLB), og Mer › {{ui:Plantegrafikk}} tegner planter enklere ved grovere målestokker. Se [Plantelisten](topic:plant-list), [Plantepost](topic:plant-records) og [Plantegrafikk](topic:plant-graphics).

## 8. Mengder og lister

Mer › {{ui:Regneark}}: planteliste og beleggslister, og dine egne, holder seg koblet til objektene. Lagre dem som CSV eller XLSX, eller sett dem på arkene (se [Regneark](topic:worksheets)). Mer › {{ui:Planteliste…}} sender antallene til TakeoffCraft. Mengdene for belegg, mur og trapp finnes i egenskapene deres. Vanning har sin egen materialliste: {{ui:Vanning}} › **Sjekk systemet…**. Se [Vanning](topic:irrigation).

## 9. Tegninger og ark

Mer › {{ui:Landskapsark…}}: planteplaner, terrengformings- og vanningsplaner, med detaljer. {{ui:Nivåer}} › {{ui:Snittlinje}} tegner snitt gjennom terrenget, murer, oppbygginger, trapper og planter. Se [Landskapsark](topic:landscape-sheets) og [Landskapssnitt og utgivelsessettet](topic:landscape-sections).

## 10. Publiser

{{ui:Utgivelsessett (.zip)}} i dialogboksen Ark lager én PDF med arkliste og én DWG per ark. Mer › {{ui:Eksporter landskaps-IFC}} gir BimCraft planter og harde flater. Lagre prosjektet: alt ligger i den ene filen.

## Endre én ting: trappen

Poenget med å ha alt i ett prosjekt er at en endring slår gjennom. Prøv det med en trapp mellom to terrasser:

1. Tegn trappens linje som elementlinje (eller en linje i tegningen), og velg så Landskap › Mer › {{ui:Fra en linje}} › {{ui:Trapp}}. I trappens egenskaper huker du av **Former terrenget**, og setter nedre og øvre nivå til de to terrassene.
2. Tegn et plantet bed ved siden av og under trappen med {{ui:Områder}}, og belegg på terrassene. Bedet klipper seg selv rundt trappen og belegget, og planteliste-tellingen teller bare det som er plantet.
3. Hev øvre nivå på trappen i egenskapene. Det planlagte terrenget, kotehøydene, fallpilene og avskjæring og fylling endrer seg med en gang. Hvis trappen ikke lenger møter den øvre terrassen, sier Problemer-panelet hvor mye.
4. Flytt trappens linje. Trappen følger linjen i samme angre-steg. Bedet klipper seg på nytt og telles på nytt, og regnearkene og listene viser de nye tallene.
5. Trykk Ctrl+Z én gang: linjen, trappen, terrenget og bedet går tilbake sammen.

Se [Terrengmodifikatorer og levende nivåer](topic:ground-modifiers), [Plantede områder](topic:planted-areas) og [Regneark](topic:worksheets).

## Ikke bygget ennå

Dette er etterspurt, og finnes ikke i denne versjonen:

- Murer som former terrenget (de melder hvor de møter det, og toppen kan følge det).
- Redigering av din egen plantelist i Bibliotek i appen (rediger prosjektets liste, og lagre den som en plantefil).
- Teksturer og farger for dine egne GLB-plantemodeller (formen leses; plantens farge brukes).

Se [Landskapsarbeidsområdet](topic:landscape) for alle verktøyene.
