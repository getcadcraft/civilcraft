---
title: Planering til landskab
summary: Platforme, jordvolde, grøfter og fri planering med koteangivelser og koter, du trækker, og som afgraves og opfyldes løbende; skråningsanalyse, flowpile og opstuvning — alt sammen i CivilCraft's projekterede overflade.
keywords: støttemur, støttemure, lodret side, mur i stedet for skråning, skråning pr. side, dæmning, planering, landskabsplanering, platform, terrasse, byggeplateau, jordvold, vold, grøft, koteangivelse, koteangivelser, rediger koter, afgravning og opfyldning, jordarbejde, skråningsanalyse, tilgængelighed, stejle skråninger, flowpile, afvanding, opstuvning, vandpytter
from: e1559eb9
---

Alt her planeres ind i den **projekterede overflade** med samme planering som byggeplateauer og korridorer. Det **eksisterende terræn** ændres aldrig, og Jordarbejde tæller det hele. Planeringsmenuen findes i gruppen Landskab.

## Platforme

{{ui:Planér}} › {{ui:Platform}}, klik derefter på hjørnerne, og tryk {{key:Enter}}. Platformen starter i terrænets middelkote under den; skriv en **Kote** for at angive den, eller tøm feltet for at følge terrænet igen. Et **Fald** i % og **Falder mod** i grader (0 = øst, 90 = nord) vipper den. Dens sider planeres ud til terrænet ved **Skråning ved afgravning** og **Skråning ved opfyldning** (vandret til 1).

## Skråninger pr. side og støttemure

Under **Sider og støttemure** i Egenskaber for et byggeplateau, en platform eller en jordvold kan hver side planeres på sin egen måde. Side 1 går fra det første hjørne, du klikkede, til det andet, side 2 fra det andet til det tredje, og så videre.

- **Alle sider**: **Skrånende** bruger afgravnings- og opfyldningsskråningerne ovenfor på hver side; **Lodret: støttemure** sætter en mur på hver side.
- Pr. side: **Skråninger ovenfor**, **Egne skråninger** (skriv en afgravnings- og en opfyldningsskråning for den side) eller **Lodret (støttemur)**.
- Skriv en skråning som `3` eller `3:1` (vandret til 1 lodret), `33%` eller `18.4°`; den vises som H:1. Byggeplateauets egen **Skråning ved afgravning** og **Skråning ved opfyldning** tager det samme.
- En lodret side har ingen dæmning: en støttemur løber langs kanten, fra plateauet ned til det eksisterende terræn (i opfyldning) eller fra terrænet ned til plateauet (i afgravning). **Murtykkelse** (0.3 m eller 1 ft som start) er, hvor langt terrænet træder fra plateaukanten ned til det eksisterende terræn. Afgravnings- og opfyldningsvolumener udelader den dæmning, den side ikke længere har.
- Hvor en mur møder en skrå side, drejer skråningen rundt om murens ende; to mure mødes i en gering.
- Under felterne: murenes længde, synligt facadeareal (højde × længde), højeste og gennemsnitlige højde.

Planen tegner hver murs ydre flade med korte streger tværs over den og dens højde i begge ender og på det højeste sted (på laget for støttemure, som også går ud i DXF og DWG). 3D-visningen viser murene som massive legemer (Vis › Støttemure), og GLB-, OBJ- og USD-eksport medtager dem. Snit på tværs af kanten viser trinnet.

**Advarsler** (i Egenskaber og i panelet Problemer): en mur højere end **Advar over en murhøjde på** (1.0 m eller 3.3 ft som start) "kan kræve en projekteret mur eller en tilladelse; kontrollér lokale regler", og, når du skriver **Stejleste skråning jorden holder**, enhver side, hvis afgravnings- eller opfyldningsskråning er stejlere end den. De er advarsler: planeringen bygges stadig. Hver ændring er ét trin for {{key:Mod+Z}}.

## Jordvolde

{{ui:Planér}} › {{ui:Jordvold}}: en vold, hvis top ligger sin **Højde** over middelterrænet under den, med dens sider planeret ud.

## Grøfter

{{ui:Planér}} › {{ui:Grøft}}, klik derefter langs grøften **i den retning vandet løber**, og tryk {{key:Enter}}. Angiv dens **Dybde**, **Bundbredde** (0 for en V) og **Sideskråning**. Uden et **Fald** følger dens bund terrænet, dybden under det, og løber aldrig opad; skriv et fald for at give den et jævnt fald fra dens start.

## Koteangivelser og koter

1. {{ui:Planér}} › {{ui:Planeringsområde}}: klik på konturen af det område, du vil forme.
2. {{ui:Planér}} › {{ui:Koteangivelse}}: klik inde i området. Skriv dens kote i Egenskaber, eller brug knapperne ▲ ▼.
3. {{ui:Planér}} › {{ui:Rediger en højdekurve}}: klik på en kote inde i området for at tage den som en linje, du kan omforme.

Vælg et punkt eller en kote og **træk** det (eller dets punkter) på planen: overfladen følger, når du slipper, som ét fortrydelsestrin. Inde i området genopbygges terrænet fra dets kant (hvor det møder det eksisterende terræn), koteangivelserne og de redigerede koter.

## Afgravning og opfyldning, løbende

Hvert planeringsobjekts Egenskaber viser sin **Afgravning** og **Opfyldning** og hele områdets, efter den gittermetode Jordarbejde bruger, mens du ændrer det. Problemer (uden for overfladen, en kontur der krydser sig selv) listes der.

## Planeringskontroller

I sektionen **Planeringskontroller** til venstre:

- **Skråningsanalyse** farver overfladen efter hældning: op til grænsen for flad, derimellem, og stejlere end grænsen for stejl (5 % og 33.3 % som start: det sædvanlige 1:20 for tilgængelige ruter og 1:3 for græsslåning). Signaturforklaringen viser, hvor meget af arealet der falder i hver. De stejle områder udskrives også på ark.
- **Flowpile og opstuvning** tegner, hvilken vej vandet løber, og markerer hvert sted, det ville samle sig, med dets dybde; sektionen siger, hvor mange steder, det dybeste og hvor meget vand de rummer.

Kontrollerne læser den projekterede overflade, når noget er planeret, ellers det eksisterende terræn.
