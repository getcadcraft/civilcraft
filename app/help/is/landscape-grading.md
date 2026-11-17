---
title: Landmótun fyrir landslag
summary: Pallar, jarðhryggir, grunnskurðir og frjáls landmótun með punktkótum og hæðarlínum sem þú dregur, gröftur og fylling í rauntíma, hallagreining, flæðisörvar og vatnspollar — allt í fyrirhuguðu yfirborði CivilCraft.
keywords: stoðveggur, stoðveggir, lóðrétt hlið, veggur í stað halla, hliðarhalli hverrar hliðar, uppfylling, landmótun, landslagsmótun, stallur, verönd, pallur, jarðhryggur, haugur, grunnskurður, punktkóti, punktakóti, hæðarlínur, breyta hæðarlínum, gröftur og fylling, jarðvinna, hallagreining, aðgengi, bratt land, flæðisörvar, frárennsli, vatnspollar, pollar
from: e1559eb9
---

Allt hér er mótað inn í **fyrirhugað yfirborð** með sömu landmótun og pallar og vegstokkar. **Núverandi land** breytist aldrei, og Jarðvinna telur það allt. Landmótunarvalmyndin er í hópnum Landslag.

## Pallar

{{ui:Landmótun}} › {{ui:Stallur}}, smelltu síðan á hornin og ýttu á {{key:Enter}}. Stallurinn byrjar í meðalhæð landsins undir honum; skrifaðu inn **Hæð** til að stilla hana, eða tæmdu reitinn til að fylgja landinu aftur. **Halli** í % og **Hallar til** í gráðum (0 = austur, 90 = norður) hallar honum. Hliðar hans eru mótaðar út í landið við **Gröftarhalla** og **Fyllingarhalla** (lárétt á móti 1).

## Hallar á hverri hlið og stoðveggir

Undir **Hliðar og stoðveggir** í Eiginleikum palls, stalls eða jarðhryggs má móta hverja hlið á sinn hátt. Hlið 1 liggur frá fyrsta horninu sem þú smelltir á til annars, hlið 2 frá öðru til þriðja, og svo framvegis.

- **Allar hliðar**: **Hallandi** notar gröfts- og fyllingarhallana hér fyrir ofan á hverri hlið; **Lóðrétt: stoðveggir** setur vegg á hverja hlið.
- Fyrir hverja hlið: **Hallar fyrir ofan**, **Eigin hallar** (skrifaðu inn gröfts- og fyllingarhalla fyrir þá hlið) eða {{ui:Lóðrétt (stoðveggur)}}.
- Skrifaðu halla sem `3` eða `3:1` (lárétt á móti 1 lóðrétt), `33%` eða `18.4°`; hann birtist sem H:1. Eigin **Gröftarhalli** og **Fyllingarhalli** palls taka það sama.
- Lóðrétt hlið hefur enga uppfyllingu: stoðveggur liggur meðfram kantinum, frá pallinum niður í núverandi land (í fyllingu) eða frá landinu niður í pallinn (í gröft). **Þykkt veggjar** (0.3 m eða 1 ft í upphafi) er hversu langt landið stígur frá palláknum niður í núverandi land. Gröfts- og fyllingarrúmmál sleppa uppfyllingunni sem sú hlið hefur ekki lengur.
- Þar sem veggur mætir hallandi hlið vefst hallinn um enda veggjarins; tveir veggir mætast í samskeyti.
- Undir reitunum: lengd veggjanna, útsett framhlið (hæð × lengd), hæsta og meðalhæð.

Teikningin dregur ytri framhlið hvers veggjar með stuttum strikum yfir hana og hæð hans við báða enda og á hæsta punkti (á laginu stoðveggir, sem fer einnig í DXF og DWG). 3D-sýnin sýnir veggina sem föst form (Sýna › Stoðveggir), og GLB-, OBJ- og USD-útflutningur tekur þá með. Þversnið yfir kantinn sýna þrepið.

**Viðvaranir** (í Eiginleikum og í Vandamálaglugganum): veggur hærri en **Vara við ef veggurinn er hærri en** (1.0 m eða 3.3 ft í upphafi) "gæti þurft verkfræðilega hannaðan vegg eða leyfi; athugaðu staðbundnar reglur", og, þegar þú skrifar inn **Brattasti halli sem jarðvegurinn stendur**, sérhver hlið þar sem gröfts- eða fyllingarhalli er brattari en það. Þetta eru viðvaranir: landmótunin byggist samt. Sérhver breyting er eitt skref fyrir {{key:Mod+Z}}.

## Jarðhryggir

{{ui:Landmótun}} › {{ui:Jarðhryggur}}: haugur þar sem toppurinn er **Hæð** hans yfir meðalhæð landsins undir honum, hliðar hans mótaðar út í landið.

## Grunnskurðir

{{ui:Landmótun}} › {{ui:Grunnskurður}}, smelltu síðan meðfram grunnskurðinum **í þá átt sem vatnið rennur** og ýttu á {{key:Enter}}. Stilltu **Dýpt**, **Botnbreidd** (0 fyrir V) og **Hliðarhalla**. Án **Halla** fylgir botn hans landinu, dýpi hans undir því, og rennur aldrei upp í móti; skrifaðu inn halla til að gefa honum stöðugan halla frá upphafi hans.

## Punktkótar og hæðarlínur

1. {{ui:Landmótun}} › {{ui:Landmótunarsvæði}}: smelltu á útlínur svæðisins sem þú vilt móta.
2. {{ui:Landmótun}} › {{ui:Punktkóti}}: smelltu inni í svæðinu. Skrifaðu hæðina inn í Eiginleikum, eða notaðu ▲ ▼ hnappana.
3. {{ui:Landmótun}} › {{ui:Breyta hæðarlínu}}: smelltu á hæðarlínu inni í svæðinu til að taka hana sem línu sem þú getur mótað.

Veldu punkt eða hæðarlínu og **dragðu** hana (eða punkta hennar) á teikningunni: yfirborðið fylgir þegar þú sleppir, eitt afturkallsskref. Inni í svæðinu er landið endurbyggt frá kantinum (þar sem það mætir núverandi landi), punktkótunum og breyttu hæðarlínunum.

## Gröftur og fylling í rauntíma

Eiginleikar sérhvers landmótunarhlutar sýna **Gröft** og **Fyllingu** hans og allrar lóðarinnar, með reitaaðferðinni sem Jarðvinna notar, um leið og þú breytir þeim. Vandamál (utan yfirborðs, útlína sem sker sig sjálf) eru skráð þar.

## Landmótunarathuganir

Í hlutanum **Landmótunarathuganir** vinstra megin:

- **Hallagreining** litar yfirborðið eftir halla: upp að vægu mörkunum, þar á milli, og brattara en bröttu mörkin (5 % og 33.3 % í upphafi: venjulega 1:20 fyrir aðgengilegar leiðir og 1:3 fyrir slátt). Skýringin segir hversu stór hluti svæðisins fellur í hvorn flokk. Bröttu svæðin prentast einnig á blöðum.
- **Flæðisörvar og vatnspollar** teikna í hvaða átt vatnið rennur og merkja hvern stað þar sem það myndi pollast, með dýpt sinni; hlutinn segir hversu marga staði, þann dýpsta og hversu mikið vatn þeir geyma.

Athuganirnar lesa fyrirhugað yfirborð þegar eitthvað er mótað, annars núverandi land.
