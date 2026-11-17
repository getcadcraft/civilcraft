---
title: Anlæg en have, fra start til slut
summary: Landskabsarkitektens ti trin fra opmålingen til det udgivne sæt, med hvad Landskabsarbejdsområdet gør for hvert trin i dag, og hvad det ikke gør endnu.
keywords: vejledning, gennemgang, trin-for-trin-guide, sådan gør du, havedesign, landskabsdesign, kom i gang, eksempel, prøveeksempel, trin for trin, opmåling, stregtegning, terræn, beplantning, liste, ark, udgivelse, ét projekt
from: 87900bf5
---

Et landskabsprojekt går i ring: opmåling, skitse, stregtegning, terræn, områder, koter, beplantning, lister, ark og tilbage igen. Her er de ti trin med det, der findes for hvert af dem. Hvor et trin har et hul, er det nævnt under **Ikke lavet endnu** til sidst og ikke skjult i trinnet.

Du kan følge med på prøvegrunden eller på din egen opmålingstegning. Med din egen starter du ved trin 1.

## 1. Hent opmålingen

{{ui:Overflade}} › {{ui:Stregtegning fra en tegning…}}: vælg opmålingstegningen (DWG 2000–2018 eller DXF). Kontrollér enhederne, og tag højdekurverne, 3D-polylinjerne og grænsen med til overfladen samt punktblokkene som opmålingspunkter. Afsnittet **Opmålingskoter og kontrol** læser koter skrevet som tekst eller som attribut og lister det, der ser forkert ud (enheder, koordinatsystem, afstand fra nul, flade højdekurver, mærkelige koter, dobbelte punkter), før du tilføjer noget. Se [Kontrollér en opmålingstegning ved import](topic:survey-check) og [Åbn en DWG- eller DXF-fil som stregtegning](topic:open-dwg-dxf). Angiv koordinatsystemet med {{ui:Koordinatsystem…}}.

## 2. Håndskitser

Et ark på papir, fx et gammelt opmålingsark eller en markeret udskrift, kommer ind med {{ui:Scan…}} (Start fra en scanning): det placeres i målestok eller på kendte koordinater under planen og kan tegnes over som stregtegning. ModelCraft læser et foto af en håndskitse (Fil › Importér et skitsefoto…). CivilCraft selv har intet værktøj til en håndskitse: placér arket under planen og tegn over det.

## 3. Fra skitse til stregtegning

Tegn fladelinjer og konturer over opmålingen i CivilCraft, eller tegn dem i 2D-tegningen. Landskab › Mere › {{ui:Fra en linje}} gør en linje til belægning, et beplantet område, en mur, trin, en fladelinje og mere, og de forbliver knyttet: flytter du linjen, følger objektet med. Se [Objekter fra stregtegning](topic:objects-from-lines). I SuperCad Studio åbner du området, tegningen og bygningsmodellen i ét projekt: arbejdsområdet **Landskabsarbejdsområdet** har værktøjerne fra dem alle, og en linje, der er valgt i 2D-tegningen, kan blive til et landskabsobjekt, der følger den (Ctrl+K, {{ui:Landskabsobjekt fra den valgte tegningslinje}}).

## 4. Det projekterede terræn

Åbn {{ui:Overflade}} › {{ui:Mere}} › {{ui:Landskabsarbejdsområde}}. Byg det projekterede terræn med {{ui:Platform}}, {{ui:Jordvold}} og {{ui:Grøft}} samt planeringsområder med koteangivelser og højdekurver; belægningen, stierne, murene, rampene og trinene, du tilføjer, planeres ind i den samme projekterede overflade. Det eksisterende terræn ændres aldrig. {{ui:Koter}} › {{ui:Terrænmodifikatorer…}} lister alt, der former terrænet, i én rækkefølge, med afgravning og opfyldning for hvert. Se [Planering](topic:landscape-grading) og [Terrænmodifikatorer og dynamiske koter](topic:ground-modifiers).

## 5. Belægning og beplantede områder

{{ui:Befæstelse}} › {{ui:Belægning}}, {{ui:Sti}}, {{ui:Mur}}, {{ui:Kantsten}}, {{ui:Rampe}} og {{ui:Trin}}. {{ui:Områder}} tegner en græsplæne, et bed, en eng eller jorddække med dens opbygning; det tilpasser sig selv om belægning, mure og trin. {{ui:Bed}} udfylder et område i planternes afstand ud fra en blanding af planter. Se [Befæstelse](topic:hardscape), [Beplantede områder](topic:planted-areas) og [Beplantning](topic:planting).

## 6. Koter, hældninger og overgange

Under **Planeringskontrol** sætter du flueben i **Skråningsanalyse** og **Flowpile og vandsamlinger**. Hvis vand samler sig op mod en terrasse, tilføj en {{ui:Grøft}} rundt om den. Egenskaberne fortæller dig, hvor mange stigtrin trappen skal have, og om de passer, og hvor en sti er stejlere end sin grænse. Panelet **Problemer** lister, hvor objekter støder dårligt sammen: en mur, der er for høj, et bed over belægningen, trin, der ikke rammer deres repos. {{ui:Koteangivelse}} og {{ui:Fald-pil}} mærker terrænet og opdaterer sig selv.

## 7. Beplantning

Under **Planter** søger du i plantekataloget (et par hundrede arter, eller din egen liste), vælger en, og placerer {{ui:Plante}}, {{ui:Bed}} eller {{ui:Hæk}}. Sæt plantens størrelse og mærkater under Mere. Mere › {{ui:Planteliste}} redigerer dine egne plantedata: sorter, leverede størrelser, tæthed og specifikationsnoter. Hver post kan have dit eget symbol og din egen 3D-model (OBJ, STL eller GLB), og Mere › {{ui:Plantegrafik}} tegner planter enklere ved mindre skalaer. Se [Plantekatalog](topic:plant-list), [Plantedata](topic:plant-records) og [Plantegrafik](topic:plant-graphics).

## 8. Mængder og lister

Mere › {{ui:Arbejdsark}}: beplantnings- og befæstelseslisterne samt dine egne bliver knyttet til objekterne; gem dem som CSV eller XLSX, eller sæt dem på arkene (se [Arbejdsark](topic:worksheets)). Mere › {{ui:Planteliste…}} sender antallene til TakeoffCraft. Befæstelsens mængder findes i egenskaberne for belægning, mur og trin. Vanding har sin egen stykliste: {{ui:Vanding}} › **Kontrollér systemet…**. Se [Vanding](topic:irrigation).

## 9. Tegninger og ark

Mere › {{ui:Landskabsark…}}: beplantnings-, planerings- og vandingsplaner med detaljer. {{ui:Koter}} › {{ui:Snitlinje}} tegner snit gennem terrænet, murene, opbygningerne, trinene og planterne. Se [Landskabsark](topic:landscape-sheets) og [Snit og udgivelsessæt](topic:landscape-sections).

## 10. Udgiv

{{ui:Udgivelsessæt (.zip)}} i dialogboksen **Ark** laver én PDF med en arkliste og en DWG pr. ark. Mere › {{ui:Eksportér landskabs-IFC}} giver BimCraft beplantningen og befæstelsen. Gem projektet: alt ligger i den ene fil.

## Ændr én ting: trappen

Pointen med at have alt i ét projekt er, at en ændring slår igennem. Prøv det med en trappe mellem to terrasser:

1. Tegn trappens linje som en fladelinje (eller som en linje i tegningen), og vælg derefter Landskab › Mere › {{ui:Fra en linje}} › {{ui:Trin}}. Sæt flueben ved **Former terrænet** i trappens egenskaber, og angiv underkoten og overkoten til de to terrasser.
2. Tegn et beplantet bed ved siden af og under trappen med {{ui:Områder}}, og belægning på terrasserne. Bedet tilpasser sig selv om trinene og belægningen, og plantelisten tæller kun det, der er plantet.
3. Hæv trappens øverste kote i egenskaberne. Det projekterede terræn, koteangivelserne, fald-pilene og afgravningen og opfyldningen ændres med det samme. Hvis trappen ikke længere møder den øverste terrasse, fortæller panelet **Problemer**, hvor meget.
4. Flyt trappens linje. Trinene følger deres linje i samme fortrydelsestrin; bedet tilpasser sig igen og tælles om, og arbejdsarkene og listerne viser de nye tal.
5. Tryk Ctrl+Z én gang: linjen, trinene, terrænet og bedet går tilbage sammen.

Se [Terrænmodifikatorer og dynamiske koter](topic:ground-modifiers), [Beplantede områder](topic:planted-areas) og [Arbejdsark](topic:worksheets).

## Ikke lavet endnu

Det er efterspurgt, og det findes ikke i denne build:

- Mure, der former terrænet (de melder, hvor de møder det, og deres top kan følge det).
- Redigering af din egen plantekatalog fra biblioteket i appen (rediger projektets liste og gem den som en plantefil).
- Teksturer og farver på dine egne GLB-plantemodeller (formen læses; plantens farve bruges).

Se [Landskabsarbejdsområdet](topic:landscape) for alle værktøjer.
