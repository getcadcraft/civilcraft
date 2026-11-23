---
title: Belægning, mure og trapper
summary: Belægning med fald mod et afløb eller et tværfald, et mønster og dets opbygning; stier, der følger terrænet; støttemure og frit stående mure med trinvise fundamenter; kantsten; rampe og trapper kontrolleret mod deres grænser; IFC ud.
keywords: befæstelse, belægning, brosten, terrasse, fald, afløb, tværfald, sildebensmønster, løberforbandt, sti, gangsti, støttemur, havemur, fundament, murkrone, kantsten, kantbånd, rampe, tilgængelighed, trapper, stigtrin, trinflader, repos
from: d34b4466
---

Befæstelse beregnes igen ud fra terrænet hver gang, så den følger terrænet og genberegnes, når terrænet eller dets linje flytter sig. Træk dens hjørner i planen som enhver linje. Åbn den fra {{ui:Befæstelse}} i gruppen Landskab.

## Belægning

Klik på hjørnerne og tryk {{key:Enter}}. I Egenskaber:

- **Kote**: tom = terrænets middelkote under den.
- **Fald**: vandret, et **tværfald** (en % mod en retning) eller **mod et afløb**: CivilCraft beder dig klikke, hvor afløbet ligger, og derefter hæver hvert hjørne sig fra afløbet med faldet. Pile i planen viser faldene.
- **Mønster** (gitter, løberforbandt, sildebensmønster) med enhedsstørrelse, fuge og vinkel; **Kantbånd**-bredde. På et ark udelades fuger, der er tættere end 1 mm.
- Belægningen er en del af den projekterede overflade. Dens lag (fliser, leje, bærelag) går ind i IFC og mængderne.

## Stier

Klik langs stien og tryk {{key:Enter}}. Den følger terrænet, med sit **Tværfald** mod højre side. En sti, der er stejlere end **Stejleste tilladt**, markeres med `!` i planen dér, og Egenskaber angiver, hvor stejl den bliver.

Hvor en sti møder en vej bygget af en korridor, stopper den ved vejens yderkant, i højde med fortovet eller skulderen dér, i den projekterede overflade og i 3D-visningen. En sti, der krydser en vej, planeres og vises som to stykker, og en ende, der er tegnet op til det dobbelte af stiens bredde kort for vejen, føres videre til dens kant. Planen viser stadig stien, som du tegnede den, og dens længde og areal tæller hele linjen. Se [Tegn en vejkorridor](topic:corridor).

## Mure

Klik langs muren og tryk {{key:Enter}}. En mur er **støttende** eller **frit stående**. Uden **Top** står den sin **Højde** over terrænet hele vejen; angiv en top for at holde den vandret. Dens **fundament** sidder en fastlagt dybde under terrænet og træder ned i hele trin, så det forbliver vandret mellem dem. Egenskaber angiver murens længde, højder, facearealet og fundamentstrinene; planen mærker mur-top og mur-fod (TW / BW) i hver ende.

:::warning
En støttemur højere end 1.2 m (4 ft) markeres: en ingeniør projekterer den.
:::

## Kantsten

Klik langs kantstenen og tryk {{key:Enter}}; angiv dens bredde og fremspring.

## Rampe

Klik fra bunden til toppen og tryk {{key:Enter}}. Kotene hentes fra terrænet i hver ende, medmindre du indtaster dem. En rampe får et repos for hver højdeforskel på 750 mm (2.5 ft) og kontrolleres mod **Stejleste tilladt** (1:12 til start) og en mindste bredde; Egenskaber angiver, hvor lang den skulle være.

## Trapper

Klik på det nederste trins forkant, derefter dér hvor trinene når toppen, og tryk {{key:Enter}}. Antallet af stigtrin kommer fra højden og **Største stigtrin**; trinbredden (G) fra komfortreglen 2R + G ≈ 630 mm, aldrig under **Mindste trinbredde**; et repos for hver **Stigtrin pr. løb højst**. Egenskaber angiver, om de passer mellem de to punkter, eller hvor meget længere de skal være.

:::note
Grænserne for rampe og trapper er mærkede standardværdier. Angiv dem, din byggeforskrift kræver.
:::

## Ud af CivilCraft

- Mere › {{ui:Eksportér landskabs-IFC}}: belægning og stier som `IfcPavement`, mure som `IfcWall` (støttemure som RETAININGWALL) med deres lag, kantsten som `IfcKerb`, rampe som `IfcRamp`, trapper som `IfcStair` med deres stigtrin og trin.
- **Send til TakeoffCraft** i beplantningslisten medfører belægningsarealer og lagvolumener, murflader og -længder, kantstenslængder og antal trin.
- Detaljearket tegner hver murs snit, hver belægnings opbygning og hvert trappeløb. Se [Landskabsark](topic:landscape-sheets).
