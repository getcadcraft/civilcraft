---
title: Athugaðu IFC-útflutninginn gegn IDS viðskiptavinar
summary: Hlaðið inn .ids-skránni sem viðskiptavinur eða vegayfirvöld gáfu þér og sjáðu hvern útfluttan hlut sem uppfyllir hana ekki í Vandamálum.
keywords: ids, information delivery specification, buildingsmart, kröfur, afhending, athugun, staðfesting, gæðaeftirlit, ifc útflutningur, ifc 4.3, veglína, vegur, innkaup
from: 183d9a0e
---

## Það sem þú gerir

IDS (Information Delivery Specification, staðall buildingSMART) er listi yfir það sem IFC-skrá verður að innihalda. Opinber innkaup senda oft slíkan með verkinu. CivilCraft athugar IFC-skrána sem þetta verkefni flytur út, í IFC-útgáfunni sem þú valdir fyrir útflutninginn, gegn honum og telur upp hvern hlut sem fellur undir.

## Skref

1. Opnaðu verkefnið þitt.
2. Smelltu á {{ui:IFC}} í hópnum Útflutningur á tækjastikunni. Í glugganum velurðu IFC-útgáfuna sem þú skilar.
3. Smelltu á {{ui:Athuga gegn IDS…}}.
4. Smelltu á {{ui:Hlaða inn .ids-skrá…}} og veldu skrána. Ekkert er hlaðið upp.
5. Lestu niðurstöðuna: hverja forskrift með {{ui:Stenst}} eða {{ui:Fellur}} og hversu marga hluti hún nær yfir.
6. Opnaðu Vandamál ({{key:Ctrl+Shift+M}}) og smelltu á bilun til að velja veglínuna, pallinn, pípuna, mannvirkið eða byggingarmassann sem hún kemur frá.

## Það sem þú átt að sjá

- Ein viðvörun fyrir hvern útfluttan hlut og kröfu sem hann uppfyllir ekki, með heiti forskriftarinnar, því sem IDS biður um og því sem útflutningurinn hefur.
- Athugunarskýrslan (í Vandamálum) byrjar á IDS: titli hennar, útgáfu, höfundi og fjölda hverrar forskriftar.

## Gott að vita

- IDS er vistuð í verkefnaskránni, svo hún er athuguð aftur þegar þú opnar verkefnið. Að hlaða henni inn eða gleyma henni er eitt skref sem þú getur afturkallað.
- Hver breyting er athuguð aftur stuttu síðar. Stór yfirborð taka lengri tíma að skrifa, svo athugunin bíður þá aðeins lengur á milli keyrsla.
- Athugunin notar sömu skrá og {{ui:IFC}}-útflutningurinn skrifar, í þeirri útgáfu sem síðast var valin þar (IFC 4.3 þegar þú hefur ekki valið neina).
- Tölur eru bornar saman í SI-einingum: verkefni í fetum er fyrst umreiknað í metra.

- Mynstur í IDS eru lesin sem heilt gildi. `^` í upphafi og `$` í enda eru einnig tekin sem „heilt gildi“, eins og flestar IDS-skrár meina þau.

## Næst

- [Flytja út IFC](topic:ifc)
