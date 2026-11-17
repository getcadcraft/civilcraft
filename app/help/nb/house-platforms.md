---
title: Byggeplattformer i skrånende terreng
summary: Planer en byggeplate på en skråning: støttemurer som byggeplatekanter, skjærings- og fyllingskartet skravert etter dybde med kotehøyder (plan og 3D), et fritt snitt tegnet hvor som helst gjennom terrenget og prosjektet, og ramper eller skrå byggeplater for innkjørsler.
keywords: plattform, byggeplate, hustomt, skrånende tomt, skråning, støttemur, skjæring og fylling, skjærings- og fyllingskart, kotehøyder, fritt snitt, snittlinje, kommunetegninger, innkjørsel, rampe, skrå byggeplate, planering, svellfaktor, jordarbeider
from: daa08a3f
---

En byggeplattform er en **byggeplate** (**Design** › {{ui:Pad}}): en flat polygon i ett nivå, planert ned i terrenget. Fire ting hjelper i en skråning.

## Murer som byggeplatekanter

Velg byggeplaten og sett en side til {{ui:Vertikal (støttemur)}} i stedet for en skråning (**Egenskaper** › {{ui:Sider og støttemurer}}, eller {{ui:Vertikal: støttemurer}} for alle sider samtidig). Murens høyde leses fra terrenget langs den: topp ved terrenget, bunn ved byggeplaten, vist i begge ender og ved det høyeste punktet på planen, med en advarsel når den er høyere enn grensen som er satt. Murer og skråninger kan blandes side om side.

## Skjærings- og fyllingskartet

Kryss av {{ui:Skjærings- og fyllingskart}} under **Vis**. Planen skraveres etter hvor dypt skjæringen eller fyllingen er, i like steg (skjæring varm, fylling blå, nesten jevn blek) med en tegnforklaring, og **kotehøyder** skrives på byggeplaten: nivåendringen i punkter på et rutenett, og den dypeste skjæringen og den høyeste fyllingen markert ▲. Cellene er de samme som jordarbeidsvolumene bruker, så kartet og tallene stemmer alltid overens.

I 3D-visningen velger du **Skjæring og fylling** i fargelisten for å legge de samme fargene over terreng og prosjekt.

En svell- eller krympefaktor finnes i massetransportverktøyet (**Design** › {{ui:Massetransport}}); den brukes ikke på en byggeplates volumer.

## Et fritt snitt

Under **Terrengmodell** › {{ui:Mer}} velger du {{ui:Fritt snitt}}, klikker punktene på snittlinjen hvor som helst (den kan bøye seg) og trykker {{key:Enter}}. En dialog tegner snittet: eksisterende terreng, planlagt design (stiplet) og skjæring og fylling mellom dem, skravert, med arealene (design teller bare innenfor byggeplatene og veiene). {{ui:Vertikal overhøyde}} er som standard tilpasset tegningen; {{ui:Lagre som SVG}} og {{ui:Lagre som CSV}} gir en tegning til kommunen og tallene.

## Ramper og skrå byggeplater

Under **Terrengmodell** › {{ui:Mer}} velger du {{ui:Rampe eller skrå byggeplate}}, klikker den lave enden og deretter den høye enden, trykker {{key:Enter}}, og angir bredden, nivået i den lave enden og fallet. Byggeplaten er en stripe der hjørnene har disse nivåene (kanten mellom to hjørner går i et jevnt fall), og den planeres ned i terrenget som enhver byggeplate. Hjørnene på en hvilken som helst byggeplate kan også ha egne nivåer, så en innkjørsel, en rampe eller en skråstilt terrasse er en byggeplate med et nivå i hvert hjørne.
