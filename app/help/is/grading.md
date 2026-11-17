---
title: Móta byggingarpall
summary: Teiknaðu flatan pall, stilltu hæð hans og halla í skurði og fyllingu, og láttu CivilCraft móta dagsbirtulínuna við núverandi land og bæta honum við fyrirhugaða yfirborðið.
keywords: stoðveggur, stoðveggir, lóðrétt hlið, veggur í stað halla, halli hverrar hliðar, jarðvegsbarð, pallur, byggingarpallur, dagsbirta, mótunarlína, skurðarhalli, fyllingarhalli, lokamótun, fyrirhugað yfirborð, landmótun, mótunarhópur
from: 482319a6
---

Pallur er flatt svæði í einni hæð. Frá jaðri sínum mótar CivilCraft út á við í skurðarhalla þínum þar sem landið er hærra en pallurinn og í fyllingarhalla þínum þar sem það er lægra, þar til hallinn mætir núverandi landi. Sú mótunarlína er dagsbirtulínan. Pallurinn og hallar hans koma í stað núverandi lands innan dagsbirtulínunnar og mynda fyrirhugaða yfirborðið.

## Teikna pallinn

Þú þarft fyrst núverandi landyfirborð.

1. Ýttu á {{key:G}}, eða smelltu á {{ui:Pallur}} í **Hönnun**-hópnum.
   Vísbendingin segir „Pallur: smelltu á hornin hans. Enter eða tvísmellur lýkur, Backspace fjarlægir það síðasta, Esc hættir við.“
2. Smelltu á horn pallsins í röð, hvora leiðina sem er. Blá útlína fylgir bendlinum.
3. Ýttu á {{key:Enter}} eftir síðasta hornið (að minnsta kosti þrjú).
   Pallurinn er teiknaður og valinn. Hann byrjar í landhæðinni á miðju sinni, ávalin í 0.1, með skurðarhalla 2 : 1 og fyllingarhalla 3 : 1. Stöðustikan segir til dæmis „Pallur 1 í hæð 254.3 (landið á miðju hans), skurður 2:1, fylling 3:1. Breyttu þeim í Eiginleikum.“

:::warning
Ljúktu með {{key:Enter}}. Tvísmellur lýkur einnig, en í þessari útgáfu fellir hann hornið sem þú tvísmelltir á. Smelltu einu sinni á síðasta hornið, ýttu síðan á {{key:Enter}}.
:::

Útlínur pallsins má ekki skerast sjálf („Útlína pallsins sker sig sjálf.“).

## Stilla hæð og halla

Þegar pallurinn er valinn sýnir hægra spjaldið **Pallur**:

1. **Heiti**.
2. **Hæð**: flöt hæð pallsins.
3. **Skurðarhalli** og **Fyllingarhalli**, sem H:V (2 þýðir 2 : 1). Báðir verða að vera meira en 0.
4. **Flatarmál pallsins** og **Horn** eru sýnd til viðmiðunar.

Ýttu á {{key:Enter}} eftir hvert gildi. Dagsbirtulínan, fyrirhugað yfirborð og rúmmálin uppfærast strax.

Undir reitunum stendur til dæmis „Dagsbirtulína: 48 hallalínur (20 í skurði, 28 í fyllingu), lengst 31.20 ft út.“ Grunnmyndin sýnir dagsbirtulínuna og hallalínurnar í magenta.

## Hvernig dagsbirtan er fundin

- Hallalínur ganga út úr hverjum jaðri hornrétt á hann, um það bil á tuttugasta hluta stærðar pallsins.
- Við ytri horn breiðast þær út á 10° fresti, þannig að hallinn vefst um hornið.
- Við innri horn liggur ein lína eftir helmingslínunni, þar sem hallarnir frá báðum jöðrum mætast.
- Hver lína rís í skurðarhallanum eða fellur í fyllingarhallanum þar til hún nær landinu.

## Halli hverrar hliðar og stoðveggir

Undir **Hliðar og stoðveggir** í Eiginleikum pallsins, upphækkunarinnar eða jarðvegsbarðsins má móta hverja hlið á sinn hátt. Hlið 1 liggur frá fyrsta horninu sem þú smelltir á að því öðru, hlið 2 frá öðru til þriðja, og svo framvegis.

- **Allar hliðar**: **Hallandi** notar skurðar- og fyllingarhallana hér að ofan á hverri hlið; **Lóðrétt: stoðveggir** setur vegg á hverja hlið.
- Fyrir hverja hlið: **Hallar að ofan**, **Eigin hallar** (skrifaðu skurðar- og fyllingarhalla fyrir þá hlið) eða **Lóðrétt (stoðveggur)**.
- Skrifaðu halla sem `3` eða `3:1` (lárétt á móti 1 lóðrétt), `33%` eða `18.4°`; hann birtist sem H:1. Eigin **Skurðarhalli** og **Fyllingarhalli** pallsins taka sama snið.
- Lóðrétt hlið hefur engan jarðvegsbarð: stoðveggur liggur eftir jaðrinum, frá pallinum niður í núverandi land (í fyllingu) eða frá landinu niður í pallinn (í skurði). **Þykkt veggs** (0.3 m eða 1 ft í upphafi) er hversu langt landið stígur frá jaðri pallsins að núverandi landi. Skurðar- og fyllingarrúmmál sleppa jarðvegsbarðinu sem sú hlið hefur ekki lengur.
- Þar sem veggur mætir hallandi hlið vefst hallinn um enda veggsins; tveir veggir mætast í skáskurði.
- Undir reitunum: lengd veggjanna, útsett flötur (hæð × lengd), hæsta og meðalhæð.

Grunnmyndin teiknar ytri flöt hvers veggs með stuttum strikum yfir hann og hæð hans á báðum endum og á hæsta punkti sínum (á stoðveggjalaginu, sem fer einnig í DXF og DWG). Þrívíddarsýnin sýnir veggina sem fasta hluti (Sýn › Stoðveggir), og GLB-, OBJ- og USD-útflutningur tekur þá með. Þversnið yfir jaðarinn sýna þrepið.

**Viðvaranir** (í Eiginleikum, og í Vandamála-glugganum): veggur hærri en **Vara við ef veggur er hærri en** (1.0 m eða 3.3 ft í upphafi) „gæti þurft verkfræðilegan vegg eða leyfi; athugaðu staðbundnar reglur“, og, þegar þú skrifar **Brattasti halli sem jarðvegurinn stendur**, sérhver hlið þar sem skurðar- eða fyllingarhalli er brattari en það. Þetta eru viðvaranir: mótunin er samt byggð. Sérhver breyting er eitt skref fyrir {{key:Mod+Z}}.

## Færa horn

Veldu pallinn, dragðu síðan ferkantað grip í horni. Sérhver drag er eitt skref í afturköllun. Að bæta við eða fjarlægja horn er ekki í boði enn: eyddu pallinum og teiknaðu hann aftur.

## Þegar hann mótast ekki

Rauður reitur undir **Jarðvinna** nefnir pallinn og vandann:

| Skilaboð | Hvað á að gera |
|---|---|
| „3 hallalínur fara út af yfirborðinu áður en þær mæta því: pallurinn er of nálægt jaðri yfirborðsins eða of hár/lágur.“ | Færðu pallinn inn frá jaðri yfirborðsins, eða færðu hæð hans nær landinu. |
| „Dagsbirtulínan sker sig sjálf (hallar frá mismunandi hliðum pallsins renna saman). Breyttu lögun pallsins eða breyttu hallunum.“ | Dæmigert fyrir mjóa eða L-laga palla í djúpum skurði eða háum fyllingum. Breikkaðu pallinn, jafnaðu muninn eða gerðu hallana brattari. |
| „Útlína pallsins sker sig sjálf.“ | Teiknaðu hornin aftur í röð um pallinn. |

Pallur með vandamál er skilinn eftir úr fyrirhuguðu yfirborði og rúmmálum þar til hann er lagaður.

## Sjá niðurstöðuna

1. Undir **Birting** stillirðu **Yfirborð** á {{ui:Tillaga (mótuð)}}.
   Hæðarlínurnar liggja nú flatar yfir pallinn og fylgja hallunum út að dagsbirtulínunni.
2. Færðu bendilinn yfir pallinn: stöðustikan sýnir **Jörð**- og **Mótaðar** hæðir.
3. Lestu skurð og fyllingu undir **Jarðvinna**; sjá [Rúmmál jarðvinnu](topic:volumes).

Pallar eru mótaðir eftir göngum, í þeirri röð sem þeir voru teiknaðir. Síðari pallur kemur í stað alls sem er fyrr innan eigin dagsbirtulínu.

## Eyða palli

Veldu hann og ýttu á {{key:Delete}} (á Mac, Fn og delete), eða smelltu á {{ui:Eyða}}.

## Ekki smíðað enn

Pallar eru flatir: hallandi pallar, eiginleikalínur með breytilegum halla, þrep og mótun að fjarlægðar- eða hæðarmarki eru ekki í boði enn. Sjá [Ekki smíðað enn](topic:not-built-yet).
