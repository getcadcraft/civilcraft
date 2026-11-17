---
title: Jordarbeidsvolumer
summary: Les skjæring, fylling og netto volumer mellom eksisterende terreng og den prosjekterte terrengmodellen, per byggeplate og korridor og totalt, og forstå rutenettmetoden bak dem.
keywords: volumer, jordarbeid, skjæring, fylling, netto, skjæring og fylling, mengder, rutenettmetode, flatesammenligning, volumflate, kubikkyard, kubikkmeter
from: 299d7bc7
---

Så snart en byggeplate eller korridor formes uten problemer, sammenligner CivilCraft den prosjekterte terrengmodellen med eksisterende terreng og rapporterer skjæring og fylling. Tallene oppdateres med hver endring.

## Hvor du leser dem

- **Jordarbeid** i høyre panel når ingenting er valgt (visningen **Prosjekt**), når det finnes minst én byggeplate eller korridor.
- **Jordarbeid** i høyre panel når en byggeplate er valgt (de samme totalene for hele prosjektet).
- Linjen under innstillingene for en korridor, med den korridorens egen skjæring og fylling.

**Jordarbeid**-blokken viser:

- **Skjæring**, **Fylling** og **Netto** (med "fylling" eller "skjæring" etter, avhengig av hva som er størst)
- en linje per element når det er mer enn ett, for eksempel "Byggeplate 1: skjæring 120.4 cu yd, fylling 310.2 cu yd"
- metodelinjen: "Rutenettmetode: eksisterende terreng og den formede flaten målt hver 0.5 ft innenfor dagslinjene (92,891 celler). Ingen svell- eller krympefaktor brukt."

Volumer er i kubikkyard i et fotprosjekt og kubikkmeter i et meterprosjekt.

## Send dem til TakeoffCraft

For å prise jordarbeidet velger du {{ui:Send til TakeoffCraft}} nederst i **Jordarbeid**-blokken. CivilCraft lagrer en mengdefil (`<site>.quantities.json`) med to mengder: skjæring og fylling, i kubikkyard (fotprosjekt) eller kubikkmeter (meterprosjekt), de samme tallene som i blokken, avrundet til hundredeler. Åpne den i TakeoffCraft med **Åpne mengdeuttak**, eller dra den dit: de blir to elementer du kan prise ([Skjæring og fylling fra CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Send på nytt etter en endring, og åpne den nye filen: de samme elementene får de nye tallene.

Bare totalene sendes, så ingenting telles to ganger; notatet i filen lister hver byggeplates og korridors egen skjæring og fylling.

## Slik beregnes de

CivilCraft bruker **rutenettmetoden**:

1. Et rutenett av kvadratiske celler legges over området innenfor hver dagslinje.
2. I midten av hver celle måles begge flatene.
3. Hver celle regnes som et prisme: forskjellen i kote ganger cellens areal. Der den prosjekterte flaten er lavere, er det skjæring; høyere, er det fylling.
4. Cellene summeres.

Cellestørrelsen velges for deg slik at rektangelet rundt de formede områdene får omtrent 250,000 celler, avrundet til en ryddig verdi (1, 2 eller 5 ganger en potens av ti). Du kan ikke sette den selv ennå. Metodelinjen viser størrelsen og antall celler. Mindre celler er mer nøyaktige langs kantene; på hele celler mellom flate plan er resultatet eksakt.

## Greit å vite

- Bare området innenfor dagslinjene telles. Terreng utenfor dem er uendret.
- En byggeplate eller korridor med et problem formes ikke inn og bidrar med ingenting. Hvis blokken sier "Ingen volumer ennå: en byggeplate må formes uten problemer.", se etter en rød boks over den.
- Der elementer overlapper, har den senere erstattet den tidligere innenfor dagslinjen, og overlappet telles én gang.
- Ingen svell- eller krympefaktor brukes. Multipliser resultatene selv hvis du trenger volumer i fast mål, løs eller komprimert masse.
- Avtak av matjord, dybder for veidekke og understell, og TIN-til-TIN-prismevolumer er ikke tilgjengelig ennå.

## Kontroller et resultat

- Slå på {{ui:Prosjektert (formet)}} under **Visning** og se på høydekurvene innenfor dagslinjene.
- Før pekeren over det formede området: statuslinjen viser **Terreng** og **Formet**. Forskjellen er skjærings- eller fyllingsdybden på det stedet.
- For en korridor viser avlesningen i profilvisningen skjæring eller fylling på senterlinjen ved hvert profilnummer.
