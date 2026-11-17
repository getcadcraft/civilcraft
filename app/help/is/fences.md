---
title: Girðingar
summary: Girðing meðfram línu, lóð eða undirstöðu: staurar, rimlar, spjöld eða grindur, hlið, hallandi eða þrepuð á landinu, listi, táknmyndir á grunnmynd og IFC-þættir. Einnig aðgengileg aðstoðarmanni.
keywords: girðing, staurar, rimlar, spjöld, grindur, hlið, hallandi, þrepuð, landslag, listi, ifc, handrið, mörk
from: c0e7b84a
---

Gerðu girðingu meðfram landlínu, veglínu, lóð eða undirstöðu, með staurum og hliðum sem eru sett fyrir þig.

## Gerðu girðingu

1. Veldu línu, lóð eða undirstöðu.
2. Opnaðu **Yfirborð, Meira, Girðingar...**
3. Veldu gerð (spjöld, rimla eða grindur), hallandi eða þrepaða, hæð, bil milli staura og breidd hliðs, og síðan **Girðing meðfram vali**, eða **Með hliði** til að setja hlið á miðja lengstu beinu röðina.

Staurar eru settir á endana, á hverju horni (hornpunkt sem beygir um 20 gráður eða meira), við báðar brúnir hvers hliðs og með jöfnu millibili þar á milli, og ekkert bil er lengra en uppgefið bil. **Hallandi** spjöld fylgja landinu milli staura sinna. **Þrepuð** spjöld haldast lárétt og þrepast við staurana; bilið undir spjaldi er breiðast við staurinn sem liggur neðar, og glugginn varar við þegar bilið er yfir mörkunum eða þegar landið rís í gegnum spjald. Hlið 6 feet (1.8 m) og breiðari fá tvö hlið; grunnmyndin sýnir hliðin opin með opnunarboganum.

## Listi og úttak

Hver girðing sýnir lengd sína, staura eftir gerð, spjöld, hlið og þrep, með **CSV**-lista yfir staura, spjöld, rimla, grindur og hlið. Grunnmyndin hefur girðingarlög (C-FENC, C-FENC-POST, C-FENC-GATE) fyrir PDF, DXF og DWG. IFC-útflutningurinn geymir staurana (IfcMember, post), spjöldin (IfcRailing, user defined fence panel), rimlana (IfcMember) og hliðin (IfcDoor, gate), eitt kerfi fyrir hverja girðingu.

## Frá aðstoðarmanni

`fence_build` býr til girðingu (punkta eða nefnda línu, lóð eða undirstöðu, hlið eftir stöðu) og `fence_list` listar girðingarnar með listanum sínum.

## Það sem er ekki gert

Upphafsstærðirnar eru algengt val, ekki reglugerð. Gerðir úr Safninu eru aðeins fluttar með nafni. Hlið verða að liggja í einni beinni röð. BimCraft hefur ekki þetta verkfæri enn.
