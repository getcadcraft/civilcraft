---
title: Belægning, mure og trapper
summary: Belægning med fald til et dræn eller et tværfald, et mønster og dets opbygning; stier, der følger terrænet; støttemure og frit stående mure med trinvis fundament; kantsten; rampe og trin kontrolleret mod deres grænser; IFC ud.
keywords: befæstelse, belægning, fliser, terrasse, fald, dræn, tværfald, fiskebensmønster, løberforbandt, sti, gangsti, støttemur, havemur, fundament, murkrone, kantsten, rampe, tilgængelighed, trin, trapper, stigtrin, trinflader, repos
from: 51475877
---

Befæstelse beregnes igen ud fra terrænet hver gang, så den følger terrænet og genskabes, når terrænet eller dets linje flytter sig. Træk dens hjørner på planen som enhver anden linje. Åbn den fra {{ui:Befæstelse}} i gruppen Landskab.

## Belægning

Klik på hjørnerne, og tryk {{key:Enter}}. I Egenskaber:

- **Kote**: tomt = terrænets middelkote under den.
- **Fald**: kote, et **tværfald** (en % i en retning) eller **til et dræn**: CivilCraft beder dig klikke, hvor drænet skal ligge, derefter stiger hvert hjørne fra drænet med faldet. Pile på planen viser faldene.
- **Mønster** (gitter, løberforbandt, fiskebensmønster) med enhedsstørrelse, fuge og vinkel; **Kantbånd** med bredde. På et ark udelades fuger, der er mindre end en millimeter.
- Belægningen er en del af den projekterede overflade. Dens lag (fliser, leje, underlag) indgår i IFC og mængderne.

## Stier

Klik langs stien, og tryk {{key:Enter}}. Den følger terrænet, med sit **Tværfald** til højre side. En sti, der er stejlere end **Stejleste tilladte**, markeres med `!` på planen dér, og Egenskaber viser, hvor stejl den bliver.

## Mure

Klik langs muren, og tryk {{key:Enter}}. En mur er enten **støttende** eller **frit stående**. Uden **Top** står den sin **Højde** over terrænet hele vejen; skriv en top for at holde den vandret. Dens **fundament** ligger en fast dybde under terrænet og trapper ned i hele trin, så det er vandret mellem trinene. Egenskaber viser murens længde, højder, facadeareal og fundamentstrin; planen angiver muren top og bund (TW / BW) i hver ende.

:::warning
En støttemur højere end 1.2 m (4 ft) markeres: en ingeniør skal projektere den.
:::

## Kantsten

Klik langs kantstenen, og tryk {{key:Enter}}; angiv dens bredde og over-terrænhøjde.

## Ramper

Klik fra bunden til toppen, og tryk {{key:Enter}}. Kotene hentes fra terrænet i hver ende, medmindre du skriver dem. En rampe får et repos for hver stigning på 750 mm (2.5 ft) og kontrolleres mod **Stejleste tilladte** (1:12 som start) og en mindste bredde; Egenskaber fortæller, hvor lang den skulle være.

## Trapper

Klik på forkanten af det nederste trin, derefter dér, hvor trinene når toppen, og tryk {{key:Enter}}. Antallet af stigtrin kommer fra højden og **Største stigtrin**; trinddybden fra komfortreglen 2R + G ≈ 630 mm, aldrig under **Mindste trinddybde**; et repos for hver **Stigtrin pr. løb højst**. Egenskaber fortæller, om de passer mellem de to punkter, eller hvor meget længere de skal være.

:::note
Grænserne for ramper og trapper er mærkede standardværdier. Angiv dem, din byggeforskrift kræver.
:::

## Ud af CivilCraft

- Mere › {{ui:Eksportér landskabs-IFC}}: belægning og stier som `IfcPavement`, mure som `IfcWall` (støttemure som RETAININGWALL) med deres lag, kantsten som `IfcKerb`, ramper som `IfcRamp`, trapper som `IfcStair` med deres stigtrin og trin.
- Planteskemaets **Send til TakeoffCraft** medtager belægningsarealer og lagvolumener, murenes facadeareal og længder, kantstensængder og antal trin.
- Detaljearket tegner hver murs snit, hver belægnings opbygning og hvert trapeløb. Se [Landskabstegninger](topic:landscape-sheets).
