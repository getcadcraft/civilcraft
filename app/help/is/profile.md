---
title: Hanna lóðrétt langsnið
summary: Opnaðu langsniðssýnina, byrjaðu hönnunarlangsnið frá landinu, bættu við og dragðu PVI-punkta, stilltu lengdir lóðréttra bogalína og lestu halla, K-gildi og hæsta og lægsta punkt.
keywords: langsnið, lóðrétt lína, pvi, lóðrétt bogalína, halli, k-gildi, hryggur, dæld, bvc, evc, langsniðssýn, endanlegur halli, fg, núverandi landsnið, eiginlínur í langsniði, þverun, vörpuð, kantsteinn, skurður, merkingar
from: e9182bfa
---

Hver lína hefur eitt hönnunarlangsnið: lista yfir PVI-punkta (stöð og hæð) tengda beinum hallalínum, með samhverfri parabólu sem lóðréttri bogalínu við hvern innri PVI-punkt sem hefur lengd. Núverandi landsnið er tekið úr yfirborðinu fyrir þig.

## Opna langsniðssýnina

1. Veldu línuna (smelltu á hana með {{ui:Velja}}).
2. Ýttu á {{key:R}}, eða smelltu á {{ui:Langsnið}} á tækjastikunni, eða {{ui:Sýn langsniðs}} neðst í hægra spjaldinu.
   Langsniðssýnin opnast undir grunnmyndinni með núverandi landi meðfram línunni. Ef línurnar eru tvær eða fleiri velurðu eina í listanum vinstra megin á langsniðsstikunni.

Sýnin sýnir alltaf alla línuna og teygir hæðirnar til að fylla spjaldið; stækkunin er prentuð neðst í vinstra horninu, til dæmis „Lóðrétt stækkun 10×". Hún aðdráttar ekki og færir ekki til.

Færðu bendilinn eftir langsniðinu: stikan sýnir stöð, hæð lands og hönnunarhæðir, hallann og skurð eða fyllingu þar, og punktur fylgir línunni á grunnmyndinni.

## Byrja hönnunarlangsniðið

1. Í hægra spjaldinu undir **Hönnunarlangsnið** smelltu á {{ui:Byrja á landinu}}. Tveir PVI-punktar eru settir á landið við báða enda línunnar, tengdir með einni beinni hallalínu. Stöðustikan segir: „Hönnunarlangsnið byrjað á landinu við báða enda. Kveiktu á {{ui:Bæta við PVI}} og smelltu til að bæta við hallaskilum; gefðu þeim bogalengd í töflunni."

Ef línan sker ekki yfirborðið færðu „Þessi lína hefur ekkert land undir sér til að byrja á." Þá skaltu bæta við PVI-punktum með smellum í staðinn (næsti kafli).

## Bæta við PVI

1. Ýttu á {{key:I}}, eða smelltu á {{ui:Bæta við PVI}} á langsniðsstikunni. Hnappurinn helst niðri.
2. Smelltu í langsniðið þar sem þú vilt hallaskil. PVI-punktur er bættur við á þeirri stöð og hæð, afrúnaður í 0.01, og valinn.
3. Bættu við eins mörgum og þú þarft, ýttu síðan á {{key:I}} aftur til að hætta.

Smellur þar sem þegar er PVI-punktur er hafnaður („Það er þegar PVI við …"). PVI-punktar haldast alltaf í stöðuröð.

## Stilla PVI

- **Dragðu** PVI í langsniðinu til að færa hann. Hann getur ekki farið framhjá nágrönnum sínum. Færslan er eitt afturköllunarskref.
- **Skrifaðu** nákvæm gildi í PVI-töfluna í hægra spjaldinu: **Stöð**, **Hæð** og **Bogalengd L** (lengd lóðréttrar bogalínu). Ýttu á {{key:Enter}} eftir hvert.
- **Fjarlægðu** PVI með x-inu í enda raðarinnar sinnar, eða veldu hann (smelltu á hann) og ýttu á {{key:Delete}}. Þegar langsniðssýnin er með fókus fjarlægir {{key:Backspace}} hann líka.

Fyrsti og síðasti PVI fá aldrei bogalínu.

## Lóðréttar bogalínur

1. Skrifaðu lengd í **Bogalengd L** fyrir innri PVI, til dæmis 200.
2. Bogalínan er teiknuð miðjuð á PVI-punktinum. Langsniðið og hægra spjaldið sýna gerð hennar (hryggur eða dæld), L og K, BVC- og EVC-stöðvar og hæðir þeirra, og hæsta eða lægsta punkt hennar ef hann er innan bogalínunnar.

K er reiknað út frá L (K = L deilt með algebrulegum mun hallanna, í prósentum). Þú slærð inn L; að slá inn K beint er ekki í boði enn.

Ef lóðrétt bogalína passar ekki sýnir rauður kassi hvers vegna: hún gengur aftur inn í PVI-punktinn eða bogalínuna á undan honum, eða framhjá næsta PVI, og hversu mikið rými er hinum megin (bogalína þarf helming lengdar sinnar hvorum megin við PVI sinn). Hnappurinn hennar setur **lengstu bogalínu sem passar**, með K sínu, sem eitt skref ({{key:Mod+Z}} afturkallar því). Eða færðu PVI-punktana í sundur.

## Lesa staðreyndirnar

Undir PVI-töflunni sýnir listi hvern halla í prósentum („Halli 1: +1.25%") og hverja bogalínu, til dæmis „Hryggur við 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", og síðan „Hæsti punktur 1+62.40, 254.12".

Ef PVI-punktarnir ná ekki út á báða enda línunnar birtist athugasemd um það. Vegstokkur er aðeins byggður þar sem langsniðið og línan skarast.

## Eiginlínur í langsniðinu

Eiginlínur birtast einnig í langsniðssýninni, svo þú getur séð kantstein, skurð eða efstu brún veggjar miðað við langsnið vegarins.

- Þar sem eiginlína **þverar** línuna sýnir langsniðið lítinn tígul á þeirri stöð og hæð, merktan með heiti eiginlínunnar og hæð hennar þar (eigin hæð eiginlínunnar, reiknuð eftir hlutanum sem þverar).
- Settu fjarlægð í {{ui:Meðfram innan}} til að teikna einnig eiginlínur sem **liggja við hlið** línunnar innan þeirrar fjarlægðar, sem strikaðar línur í eigin hæðum. Tómt eða 0 sýnir aðeins þverlínurnar.
- Merki og tákn fylgja hverri breytingu: færðu hornpunkt, skrifaðu inn halla eða hækkaðu eiginlínuna, og langsniðið sýnir nýju hæðirnar strax.
- Smelltu á tígul þverunar til að velja eiginlínuna; valda línan er teiknuð í áherslulitnum.
- {{ui:Eiginlínur}} á langsniðsstikunni felur eða sýnir þær allar. Báðar stillingar eru vistaðar með verkefninu.

Sjá [Eiginlínur](topic:feature-lines).

## Næst

- [Sveipa vegstokk](topic:corridor) eftir línunni og þessu langsniði.
- Langsniðið er skrifað í LandXML ásamt línunni; sjá [Skiptast á LandXML-skrám](topic:landxml).
