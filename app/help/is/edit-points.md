---
title: Breyta mælipunkti
summary: Breyttu númeri, hnitum, kóta eða lýsingu eins punkts, eða dragðu hann á nýjan stað á grunnmyndinni.
keywords: breyta punkti, færa punkt, breyta kóta, endurnúmera, punktanúmer, lýsing, draga, norðurhnit, austurhnit, laga punkt, ónýtt skot
from: 375ae2e9
---

Ónýtt skot, röng stanghæð, lýsing sem var slegin inn vitlaust: lagaðu þann eina punkt og yfirborðið fylgir á eftir.

## Breyta gildum punkts

1. Með {{ui:Velja}} smellirðu á punktinn á grunnmyndinni. **Eiginleikar** sýnir númer hans, austurhnit, norðurhnit, kóta og lýsingu í reitum.
2. Skrifaðu nýja gildið og ýttu á {{key:Enter}} (eða smelltu annars staðar). Skildu **Kóti** eftir tóman fyrir punkt án kóta.
3. Yfirborðið, hæðarlínurnar og allt sem byggt er á þeim uppfærist í einu.

Hver breyting er eitt skref: {{key:Mod+Z}} afturkallar hana og {{key:Mod+Y}} endurgerir hana. Gildi sem CivilCraft getur ekki notað (númer sem annar punktur hefur þegar, bókstafir í hnitum) er hafnað: reiturinn er auðkenndur með útlínu og stöðustikan segir af hverju.

Nýr lýsingarkóði býr til nýjan punktahóp, eins og innflutningur gerir (sjá [Búa til yfirborð](topic:build-surface)).

## Færa punkt á grunnmyndinni

1. Veldu punktinn (hann fær hring).
2. Dragðu hringinn. Stöðustikan sýnir austur- og norðurhnit þess staðar sem hann fer á.
3. Slepptu til að færa hann; kóti hans helst. Ýttu á {{key:Esc}} áður en þú sleppir til að setja hann aftur á sinn stað.

## Brotalínur fylgja punktinum

Brotalína sem er teiknuð með verkfærinu {{ui:Brotalína}} afritar punktana sem hún fer um. Þegar þú færir punkt eða breytir kóta hans, færast hornpunktar brotalínunnar sem eru á honum með, í sama skrefi. Brotalínuhópar búnir til úr lýsingum eru alltaf byggðir upp aftur úr punktunum.

:::note
Yfirborð sem er lesið úr LandXML-skrá heldur sínum eigin þríhyrningum: breytingar á punktum breyta því ekki fyrr en eftir {{ui:Byggja yfirborðið upp aftur úr punktunum}}.
:::
