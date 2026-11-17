---
title: CivilCraft-indstillinger
summary: Vælg kolonnerækkefølgen for kopierede og indsatte punktrækker og for gæt af en fils kolonner, hvordan indsatte punkter nummereres, hvad punktetiketter viser, hjørneindikatoren, den lodrette overdrivelse i 3D, hvordan breddegrad og længdegrad vises, og om kortlag hentes fra internettet.
keywords: indstillinger, præferencer, pnezd, penzd, kolonnerækkefølge, punktrækker, nummerér om, punktnumre, startnummer, punktetiketter, etiketter, beskrivelse, kote, ViewCube, aksesymbol, hjørneindikator, kompas, lodret overdrivelse, 3D, breddegrad, længdegrad, grader og decimalgrader, kortlag, internet, privatliv
from: 64b9cb92
---

Åbn {{ui:Indstillinger}} med tandhjulet i appbjælken eller med {{key:Mod+,}}. Den første fane, {{ui:CivilCraft}}, rummer de indstillinger, der hører til denne app; {{ui:Generelt}} rummer dem, alle CadCraft-apps deler (tema, værktøjslinje, paneler). CivilCraft-indstillingerne findes kun i appen: du ændrer dem her, og denne browser husker dem. {{ui:Nulstil CivilCraft-indstillinger}} sætter alle indstillinger tilbage til deres start.

## Punktrækker

**P, N, E, Z, D** (start) eller **P, E, N, Z, D**: punkt, nord, øst, kote, beskrivelse, eller øst før nord. Den bruges de tre steder:

- **Kopiér**: rækkerne CivilCraft lægger på systemets udklipsholder til et regneark.
- **Sæt ind**: rækker, der er indsat fra et regneark eller en tekstfil uden en overskriftsrække.
- **Importér**: gættet i dialogboksen **Importér punkter**, når en fil ikke har en overskriftsrække (en fil med fire kolonner læses som PENZ, en med tre som ENZ). Se [Punktfilformater](topic:point-file-formats).

En overskriftsrække, der navngiver sine kolonner, vinder altid, og det gør et valg i importdialogens **Kolonner**-liste også.

## Numre til indsatte punkter

- **Behold ledige numre** (start): et indsat punkt beholder sit nummer, når intet punkt har det; kun punkter, der kolliderer, får nye numre.
- **Altid nye numre**: hvert indsat punkt får et nyt nummer, selv om dets eget er ledigt.

**Nye numre starter ved**: lad feltet stå tomt for at tælle op fra et over det højeste nummer i brug. Skriv et tal, f.eks. 5000, for at give nye punkter numre fra 5000 og op; numre i brug springes over. To punkter får aldrig samme nummer, uanset valget. Se [Vælg, kopiér og sæt opmålingspunkter ind](topic:copy-paste-points#point-numbers-never-clash).

## Punktetiketter

Hvad en punktetiket viser, når {{ui:Punktetiketter}} er tændt under **Vis**: **Nummer**, **Nummer og kote** eller **Nummer, kote og beskrivelse** (start). DXF-, DWG- og PDF-eksporterne viser de samme etiketter som skærmen.

## Hjørneindikator

Hvad der står i hjørnet af planen og 3D-visningen: **ViewCube** (start), **Aksesymbol** eller **Ingen**.

- **ViewCube** (øverst til højre). I planen viser den toppen med kompasringen: N er gitternord (op i planen). Klik på en anden side, kant eller hjørne af terningen, eller træk i den, og [3D-visningen](topic:site-3d) åbnes og kigger fra der. {{ui:Start}} på planens terning tilpasser planen.
- I 3D-visningen drejer terningen med visningen: klik på en side, kant eller et hjørne for at kigge fra der, træk i terningen for at dreje rundt, træk i kompasringen for at dreje om den lodrette, klik på et bogstav for at kigge fra den side, og brug {{ui:Start}} for isovisningen af hele byggepladsen. Når du kigger direkte på en side, fører små pile til den næste side, og buede pile drejer visningen en kvart omgang.
- **Aksesymbol** (nederst til venstre): en lille markør med X (øst) og Y (nord) på planen, X, Y og Z (op) i 3D.

## Lodret overdrivelse i 3D

Hvor meget 3D-visningen strækker koterne: **1×**, **2×** (start), **3×**, **5×** eller **10×**. Listen på 3D-visningens linje er den samme indstilling, så en ændring af den ene ændrer begge. Volumener, profiler og 3D-eksporter bliver i sand skala.

## Breddegrad og længdegrad

Hvordan statuslinjen viser pegerens breddegrad og længdegrad, når projektet har et koordinatsystem: **grader, minutter og sekunder** (start, f.eks. `30°18′00.00″ N`) eller **decimalgrader** (`30.300000° N`). Se [Angiv projektets koordinatsystem](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Kortlag fra internettet

**Fra** (start) eller **Til**. Når det er til, beder CivilCraft de kortservere, du tilføjer, om billeder af området på skærmen. Din tegning bliver på denne computer; serveren ser området og din internetadresse. Når det er fra, bedes ingen kortserver om noget, selv når et projekt, du åbner, navngiver en; et georefereret billede fra en fil virker under alle omstændigheder. Se [Vis kortlag under planen](topic:map-layers).

## Assistenter

**Lad AI-assistenter og scripts bruge CivilCraft** (fra start) lader en assistent på din computer nå det åbne byggeplads gennem CadCraft Studio: **Læs** beskriver byggepladsen og giver punkter, overfladekoter, stationer, profiler, volumener og matrikler; **Rediger** lader den vælge og tilføje opmålingspunkter; **Gem** og **Eksportér** lader den gemme projektet og skrive LandXML eller DWG. **Mapper den må bruge** (i Studio) er de steder, den må gemme og eksportere til. **Aktivitet** lister dens kald. Se [Lad en AI-assistent arbejde med din byggeplads](topic:assistants).
