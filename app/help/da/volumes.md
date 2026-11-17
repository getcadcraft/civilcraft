---
title: Jordarbejdsmængder
summary: Læs afgravnings-, opfyldnings- og nettovolumener mellem det eksisterende terræn og den planlagte overflade, pr. byggeplateau og korridor og i alt, og forstå gittermetoden bag dem.
keywords: volumener, jordarbejde, afgravning, opfyld, netto, afgravning og opfyld, mængder, gittermetode, overfladesammenligning, volumenoverflade, kubikyard, kubikmeter
from: 299d7bc7
---

Så snart et byggeplateau eller en korridor planeres uden problemer, sammenligner CivilCraft den projekterede overflade med det eksisterende terræn og rapporterer afgravning og opfyldning. Tallene opdateres ved hver ændring.

## Hvor du læser dem

- **Jordarbejde** i højre panel, når intet er valgt (visningen **Projekt**), når der er mindst ét byggeplateau eller én korridor.
- **Jordarbejde** i højre panel, når et byggeplateau er valgt (de samme totaler for hele projektet).
- Linjen under en korridors indstillinger, med den korridors egen afgravning og opfyldning.

**Jordarbejde**-blokken viser:

- **Afgravning**, **Opfyldning** og **Netto** (med »opfyldning« eller »afgravning« efter, alt efter hvad der er størst)
- en linje pr. post, når der er mere end én, for eksempel »Byggeplateau 1: afgravning 120.4 cu yd, opfyldning 310.2 cu yd«
- metodelinjen: »Gittermetode: eksisterende terræn og den planerede overflade prøvetaget hver 0.5 ft inden for skæringslinjerne (92,891 celler). Ingen svulmning eller krympning anvendt.«

Volumener angives i kubikyard i et fodprojekt og i kubikmeter i et meterprojekt.

## Send dem til TakeoffCraft

For at prissætte jordarbejdet vælger du {{ui:Send til TakeoffCraft}} nederst i blokken **Jordarbejde**. CivilCraft gemmer en mængdefil (`<site>.quantities.json`) med to mængder: afgravning og opfyldning i kubikyard (fodprojekt) eller kubikmeter (meterprojekt), de samme tal som blokken, afrundet til to decimaler. Åbn den i TakeoffCraft med **Åbn mængdeudtræk**, eller slip den dér: de bliver til to poster, du kan prissætte ([Afgravning og opfyldning fra CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Send igen efter en ændring og åbn den nye fil: de samme poster får de nye tal.

Kun totalerne sendes, så intet tælles to gange; filens note viser hvert byggeplateaus og hver korridors egen afgravning og opfyldning.

## Sådan beregnes de

CivilCraft bruger **gittermetoden**:

1. Et gitter af kvadratiske celler lægges over området inden for hver skæringslinje.
2. I centrum af hver celle prøvetages begge overflader.
3. Hver celle tæller som et prisme: forskellen i kote gange cellens areal. Hvor den projekterede overflade er lavere, er det afgravning; højere, er det opfyldning.
4. Cellerne lægges sammen.

Cellestørrelsen vælges for dig, så rektanglen omkring de planerede områder rummer ca. 250,000 celler, afrundet til en pæn værdi (1, 2 eller 5 gange en potens af ti). Du kan endnu ikke selv angive den. Metodelinjen fortæller dig størrelsen og antallet af celler. Mindre celler er mere nøjagtige langs kanterne; på hele celler mellem plane flader er resultatet nøjagtigt.

## Ting at vide

- Kun området inden for skæringslinjerne tælles. Terræn uden for dem er uændret.
- Et byggeplateau eller en korridor med et problem medregnes ikke og tilføjer intet. Hvis blokken siger »Ingen mængder endnu: et byggeplateau skal kunne planeres uden problemer.«, så kig efter en rød boks ovenfor.
- Hvor poster overlapper, har den senere erstattet den tidligere inden for dens skæringslinje, og overlapningen tælles én gang.
- Der anvendes ingen svulmnings- eller krympningsfaktor. Gang resultaterne selv med, hvis du har brug for volumener i fast, løst eller komprimeret jord.
- Afrømning af muldlag, befæstelses- og undergrundsdybder samt TIN-til-TIN-prismevolumener er endnu ikke tilgængelige.

## Kontrollér et resultat

- Slå {{ui:Projekteret (planeret)}} til under **Visning**, og kig på højdekurverne inden for skæringslinjerne.
- Flyt markøren hen over det planerede område: statuslinjen viser **Terræn** og **Planeret**. Forskellen er afgravnings- eller opfyldningsdybden det sted.
- For en korridor viser profilvisningens aflæsning afgravning eller opfyldning på midterlinjen ved hver station.
