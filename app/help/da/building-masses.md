---
title: "Tegn bygningsmasser på en byggegrund"
summary: "Tegn en bygningsmasse på en matrikel, giv den etager og en etagehøjde, se dens bruttoetageareal, vælg hvordan den sidder i skrånende terræn, skub og træk dens højde i 3D, og send den til BimCraft eller gem den som IFC-fil."
keywords: masse, massing, bygningsmasse, volumen, fodaftryk, etager, etagehøjde, bruttoetageareal, BTA, hældning, sokkel, udgravning og opfyld, skub træk, 3D, byggegrundsstudie, tidlig design, IFC, udvikl, BimCraft, A-MASS
from: e5a67c16
---

En bygningsmasse er et fodaftryk, et antal etager og en etagehøjde: det tidlige spørgsmål »hvor meget bygning passer her, og hvad gør den ved terrænet«. Masser står på planen med deres navn, antal etager og bruttoetageareal, kommer med i PDF-udskriften og i DWG- og DXF-eksporterne på lagene `A-MASS` og `A-MASS-TEXT`, og gemmes i projektfilen.

## Tegn en masse

1. Under **Egenskaber**, under **Bygningsmasser**, klik på **Tegn en masse**. (Den findes også i værktøjslinjens **Mere**-menu ved siden af **Overflade**.)
2. Klik på hjørnerne af fodaftrykket. Et klik nær et matrikelhjørne eller et opmålingspunkt tager det punkts præcise placering.
3. Klik på det første hjørne igen, eller tryk på {{key:Enter}}, for at afslutte. {{key:Backspace}} tager det sidste hjørne tilbage; {{key:Esc}} stopper.

En ny masse har tre etager og en etagehøjde på 12 ft (3.6 m), og hører til den matrikel dens midte ligger i.

## Etager, højde og areal

Klik på en masse for at ændre dens **Navn**, **Anvendelse**, **Etager**, **Etagehøjde** og **Matrikel**. **Højde** er etager gange etagehøjde: skriv en højde, og antallet af etager bliver det nærmeste hele antal etager (aldrig mindre end én). **Fodaftryk** og **Bruttoetageareal** (fodaftryk gange etager) beregnes for dig.

## I skrånende terræn

Terrænet under en masse læses fra overfladen: eksisterende terræn, eller det planerede terræn hvis du valgte **Planlagt terræn (planeret)**. **I skrånende terræn** siger hvor stueetagen går:

- **Trappet**: ved gennemsnitsterrænet under fodaftrykket. Den lave side fyldes op til det, og den høje side afgraves, og de to kommer tæt på at balancere.
- **Sokkel**: ved det højeste terræn. En massiv base fylder den lave side.
- **Afgravning**: ved det laveste terræn. Den høje side skæres væk ind i bakken.

Egenskaber viser spændet af terræn under massen, **Stueetagens kote**, og mængden af opfyld og afgravning mellem terrænet og det niveau. Et punkt i fodaftrykket der ligger uden for overfladen udelades, og Egenskaber siger hvor mange.

## I 3D-visningen

Masser tegnes i 3D-byggegrundsvisningen, med en linje rundt om hver etage og deres navne over taget. **Vis** har et afkrydsningsfelt til **Bygningsmasser**. Klik på en for at vælge den. Med en masse valgt:

- træk dens tag op eller ned for at skubbe eller trække den en etage ad gangen, eller tryk på {{key:PageUp}} og {{key:PageDown}};
- hele flytningen er ét fortrydelsestrin.

Gadevisningen i **Kør** ser også masserne, og **Sol** kaster deres skygger på terrænet.

## Send den videre

- **Masser som IFC** gemmer hver masse som en IFC4-fil: en byggegrund, en bygning med sine etager, og massen som et bygningselement med dets tal i egenskabssættet `CadCraft_SiteMass`. Med et koordinatsystem sat på projektet placeres filen på kortet og bærer byggegrundens breddegrad og længdegrad; uden et siger den intet om, hvor den ligger.
- **Udvikl i BimCraft** åbner BimCraft i en ny fane med masserne. Der viser valg af en masse dens tal og **Udvikl denne masse**, som bygger vægge på hver etage og en dæk under bygningen ud fra fodaftrykket, i ét fortrydelsestrin. Intet uploades: filen går mellem de to faner i denne browser.

Se også **Zonegrænser** og **Solskinstimer**.
