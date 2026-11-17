---
title: Flytja grunnmyndina út sem DXF
summary: Skrifar línuverk grunnmyndarinnar sem R12 DXF á nefnd lög, með hæðarlínum í sínum kótum og brotalínum í þrívídd, fyrir hvaða CAD-forrit sem er.
keywords: dxf, dwg, cad, flytja út, línuverk, r12, 2000, 2004, 2007, 2010, 2013, 2018, lög, hæðarlínur, skipti á teikningum, grunnkort, bakgrunnur
from: f2d8ede9
---

{{ui:DXF}} skrifar það sem grunnmyndin sýnir sem DXF-skrá á R12-sniði, útgáfunni sem sérhvert CAD-forrit opnar. Ef þú hefur notað AutoCAD eða Civil 3D, opnaðu eða settu hana inn eins og þú myndir gera með hvaða DXF-skrá sem er.

## Útflutningur

1. Stilltu grunnmyndina eins og þú vilt hafa teikninguna: undir **Birting** velurðu yfirborðið (fyrirliggjandi eða tillögu), hæðarlínubilið og hvað er kveikt á (hæðarlínur, merkingar, punktar, punktamerkingar, þríhyrningar, brotalínur, jaðar yfirborðs, pípur, hallaörvar).
2. Smelltu á {{ui:DWG/DXF}} í **Flytja út**-hópnum og veldu {{ui:DXF (R12, texti) — venjuleg skiptiskrá}}, og síðan {{ui:Sækja}}.
3. Vafrinn sækir `<heiti>.dxf`. Stöðustikan segir til dæmis: „Flutt út R12 DXF: 2,140 hlutir; merkingar miðaðar við 1" = 40'. Hæðarbil eru ekki flutt út.“

Hnit eru skrifuð í einingum verkefnisins, í raungildum sínum (hnit í landshnitakerfi haldast eins). Ekkert er skalað eða fært til.

## Hvað er í skránni

| Atriði | DXF-eining | Lag |
|---|---|---|
| Aukahæðarlínur og meginhæðarlínur | 2D fjöllínur í sínum kóta | C-TOPO-MINR, C-TOPO-MAJR |
| Merkingar hæðarlína | Texti | C-TOPO-TEXT |
| Þríhyrningar | Fjöllínur | C-TOPO-TINN |
| Brotalínur og mörk | 3D fjöllínur | C-TOPO-BRKL |
| Jaðar yfirborðs | Fjöllínur | C-TOPO-BNDY |
| Hallaörvar | Fjöllínur | C-TOPO-SLOP |
| Mælipunktar og merkingar þeirra | Punktar (með kóta), texti | V-NODE, V-NODE-TEXT |
| Línur úr línukóðum | 3D fjöllínur | V-NODE-LINE |
| Miðlínur veglína | Línur og bogar | C-ROAD-CNTR |
| Stikumerki og merkingar | Fjöllínur, texti | C-ROAD-STAN |
| Jaðrar vegsvæðis | Fjöllínur | C-ROAD-CORR |
| Sýnislínur | Fjöllínur | C-ROAD-SCTN |
| Flatir, dagsbirtulínur, hallalínur | Fjöllínur | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Eiginlínur | 3D fjöllínur (bogar sem bútar innan 0.01; sjá [Eiginlínur](topic:feature-lines)) | C-GRAD-FEAT |
| Beygjuferlar | Fjöllínur, texti | C-ROAD-SWPT |
| Pípur, mannvirki, merkingar | Fjöllínur, texti | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Pípur og mannvirki með vandamálum | Fjöllínur | C-STRM-PROB |

Hvert lag hefur lit. Allan listann er að finna í [Lög grunnmyndar](topic:plan-layers).

## Stærð merkinga

Texti þarf að hafa stærð í teikningareiningum. CivilCraft miðar stærð merkinga við þann mælikvarða þar sem öll grunnmyndin passar á Tabloid-blað (fet) eða A3-blað (metrar), og segir í stöðuskilaboðunum hvaða mælikvarði það er. Ef þú teiknar út í öðrum mælikvarða í CAD-forritinu þínu, skalaðu textann þar.

## Það sem er ekki flutt út

- Hæðarbil (aðeins á skjánum).
- Langsniðsmyndin. Langsnið eru flutt út sem LandXML, ekki sem teikning.
- Yfirborðið sjálft sem þrívíddarhlutur. Notaðu LandXML fyrir TIN-netið, eða kveiktu á {{ui:Þríhyrningar}} til að fá jaðra þess sem línuverk.
- Allt sem þú slekkur á undir **Birting**.

## DWG

{{ui:DWG/DXF}} skrifar sömu línuverk sem DWG-teikningu líka. Gluggi þess spyr um skráarsnið: DXF, eða DWG frá 2000, 2004, 2007, 2010, 2013 eða 2018. Snið 2000 opnast í næstum öllum CAD-forritum, bæði gömlum og nýjum; veldu nýrra snið þegar sá sem fær teikninguna biður um það. Valið þitt er munað í þessum vafra.

1. Smelltu á {{ui:DWG}} í **Flytja út**-hópnum.
2. Veldu **Skráarsnið** og smelltu á **Sækja DWG**.
3. Vafrinn sækir `<heiti>.dwg`. Stöðustikan segir hvað fór inn, til dæmis: „Flutt út DWG (2018-útgáfa): 12 fjöllínur, 40 merkingar á 9 lögum“.

DWG-skráin hefur sömu lög, liti, hæðarlínur (sem fjöllínur í sínum kóta), 3D-brotalínur, merkingar og punkta og DXF-skráin, í sömu hnitum. Heiti laga sem DWG getur ekki geymt eru breytt, og stöðuskilaboðin segja frá því. CivilCraft skrifar DWG með sínum eigin kóða, þannig að ekkert fer úr tölvunni þinni.

### Kortlög í DWG

Teikning í DWG getur ekki geymt mynd inni í sér: CAD-forrit sýna mynd sem liggur við hlið teikningarinnar. Þegar kortlög eru sýnileg býður gluggi upp á **Kortlög sem mynd við hlið teikningarinnar**. Þegar það er hakað fyrir er niðurhalið `.zip`-skrá sem geymir `<heiti>.dwg`, `<heiti>-map.png` (kortlögin yfir allri teikningunni, allt að 4,096 pixlar á breidd) og `<heiti>-map.pgw` (heimsskráin, fyrir GIS-forrit). Teikningin sýnir myndina sem mynd á laginu G-MAP-IMAG, á sínum stað. Taktu skrárnar úr þjöppuðu skránni í eina möppu og geymdu þær saman.
