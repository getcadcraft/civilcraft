---
title: Feature-linjer
summary: Tegn 3D-linjer, som du planerer hjørnepunkt for hjørnepunkt, lav trinvise forskydninger af dem, og brug dem som brudlinjer i terrænet eller som skrånende plateauer i projektet.
keywords: bue, kurve, radius, 3D-bue, skruelinje, buet kantsten, faldoverlay, kote-overlay, faldpile, feature-linje, fald, skråning, kote, trinvis forskydning, forskydning, brudlinje, kantsten, grøft, banket, skrånende plateau, skæring i terræn, planering, 3D-polylinje
from: d55b25fb
---

En feature-linje er en linje med en kote i hvert hjørnepunkt: en kantsten, en grøftes flowlinje, toppen af et banket, kanten af et skrånende plateau. Du angiver dens koter med tal eller med fald, kopierer den til siden med et trin op eller ned, og vælger, hvad overfladerne gør med den.

## Tegn en

1. Vælg **Terræn** › {{ui:Mere}} › {{ui:Feature-linje}}, eller tryk på {{key:L}}.
2. Klik på dets hjørnepunkter på planen. Et klik på et opmålingspunkt overtager punktets plads og kote; ellers får hjørnepunktet det eksisterende terræns kote dér.
3. Tryk på {{key:Enter}} for at afslutte en åben linje, eller klik på det første hjørnepunkt igen for at lukke den.

Den nye linje er valgt og starter som en brudlinje i det eksisterende terræn, liggende på terrænet.

## Buer

Et segment kan være en bue i plan, hvis ender ligger i forskellige koter: en kantstensvending, en buet grøft, en rampe der drejer. Dets fald løber jævnt langs buen, og dets længde måles langs kurven.

- **Mens du tegner:** tryk på {{key:C}} (på en touchskærm, {{ui:Bue}} i linjen over planen) for at slå buer til. Efter et hjørnepunkt klikker du på et punkt på kurven og derefter der, hvor buen slutter. Tryk på {{key:C}} igen for lige segmenter. {{key:Backspace}} fjerner først punktet på kurven.
- **Bagefter:** i **Egenskaber** skriver du en radius og drejeretningen i hjørnepunktets felt **Bue**, fx `50 L` eller `50 R` (venstre eller højre, når du går langs linjen), og trykker på {{key:Enter}}. Tøm feltet for at gøre segmentet lige igen. En radius mindre end halvdelen af segmentet afvises.

Den valgte linje viser hver buens radius ved siden af dens fald. **Længde** er langs buerne i plan; **3D-længde** tæller også stigning og fald med. Trinvise forskydninger bevarer buerne: en bue på ydersiden af et sving vokser, en på indersiden skrumper, og en forskydning forbi en bues centrum afvises.

Overfladerne, 3D-visningen og DXF og DWG tager hver bue som korte lige stykker, der holder sig inden for 0.01 af kurven. LandXML beholder dem som buer (se **Buer i andre filer** nedenfor).

## Angiv koter og fald

**Egenskaber** viser hjørnepunkterne med deres afstand langs linjen, deres **Kote** og **Fald til næste** (i procent). Skriv en af dem og tryk på {{key:Enter}}:

- En kote flytter kun det hjørnepunkt.
- Et fald angiver koten i segmentets anden ende; hjørnepunkterne efter den bliver, hvor de er, så det næste segments fald ændres.

Også under **Egenskaber**:

| Handling | Hvad den gør |
|---|---|
| **Hæv eller sænk alle med** | Lægger den højde, du skriver, til hvert hjørnepunkt. |
| {{ui:Koter fra terrænet}} | Sætter hvert hjørnepunkt tilbage på det eksisterende terræn (hjørnepunkter uden for overfladen beholder deres og listes). |
| {{ui:Ét fald, første til sidste}} | Beholder første og sidste kote og sætter hjørnepunkterne imellem på ét jævnt fald. |

Den valgte linje viser sine koter i hjørnepunkterne og sine fald langs segmenterne på planen. Træk et hjørnepunkt med {{ui:Vælg}} for at flytte det; dets kote bevares.

## Trinvise forskydninger

Under **Trinvis forskydning** skriver du en **Afstand** (positiv til højre for linjens retning, negativ til venstre), derefter en højde (op eller ned med) eller en hældning i procent, og klikker på {{ui:Lav forskydningslinjen}}. Kopien er en ny feature-linje: fx bagsiden af en kantsten 0.5 ft til siden og 0.5 ft højere, eller en grøftekant 6 ft ud ved 2 %. En afstand, der ville folde kopien over sig selv i et skarpt sving, afvises.

## Fald og koter på skærmen

Tryk på {{key:E}}, eller markér **Fald og koter på feature-linjer** under Visning, for at se hver feature-linjes fald langs hvert segment (med en lille pil, der peger nedad) og dens kote i hjørnepunkterne. De vises kun på skærmen: intet tilføjes tegningen, og PDF, DXF og DWG forbliver uændrede. Korte segmenter og tætte hjørnepunkter får ingen etiket, før du zoomer ind. Den valgte linje viser altid sine egne fald og koter.

## I længdeprofilvisningen

En feature-linje, der krydser et tracé, vises i det tracés længdeprofilvisning, med sit navn og kote ved krydsningen; linjer, der løber ved siden af, kan også vises. Se [Design en længdeprofil](topic:profile).

## Hvad overfladerne gør med den

Vælg **Anvendelse**:

| Anvendelse | Hvad der sker |
|---|---|
| Brudlinje i det eksisterende terræn | Det eksisterende terræn går gennem linjen i dens koter, ligesom en tegnet brudlinje. |
| Planeret ind i projektet | En **lukket** linje bliver et skrånende plateau: den planlagte overflade inden i den planeres til kanten. Slå **Skæring i terræn** til for at køre afgravnings- og opfyldningsskråninger (vandret til 1 lodret) fra kanten ud til terrænet, som et plateau gør; hver skråning starter i kantens egen kote dér. |
| Kun tegnet | Den bliver på planen og føres med ud i DXF, DWG og PDF (lag C-GRAD-FEAT, 3D-polylinjer), men overfladerne ignorerer den. |

Volumener, snit og 3D-visningen medtager feature-linjer planeret ind i projektet, ligesom plateauer. Hver ændring er ét trin: {{key:Mod+Z}} fortryder den.

## Del linjer med dit team

I en tegning åbnet fra dine skyfiler i CadCraft Studio, på et teamabonnement, har projektets **Egenskaber** (intet valgt) et afsnit **Team** med {{ui:Teamets linjer…}}: de linjer dit team har delt, hver med sin revision, uden at du først skal vælge en feature-linje. Vælg en linje for at dele den, upload en ny revision, hente teamets, eller stoppe deling. Uden for den indstilling siger afsnittet, hvad det kræver.

## Buer i andre filer

| Fil | Hvad der sker med en feature-linje med buer |
|---|---|
| CivilCraft-projekt | Bevares præcist. |
| LandXML | Skrevet som en planfeature af linjer og buer med deres koter og læst tilbage med sine buer. En feature-linje fra et andet program kommer ind som **Kun tegnet**: vælg dens **Anvendelse** for at lægge den i en overflade. |
| DWG og DXF | En 3D-polylinje kan ikke rumme en bue, så linjen skrives som korte stykker inden for 0.01 af hver bue. CivilCraft noterer også i tegningen, hvilke stykker der var buer: når du åbner tegningen som linjetegning, henter {{ui:Feature-linjer}} linjerne tilbage som feature-linjer med deres buer. Andre programmer ser en almindelig 3D-polylinje. |
