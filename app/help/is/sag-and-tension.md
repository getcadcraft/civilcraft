---
title: Sig og spenna
summary: Álagstilvik þín (hitastig, vindur, ís) og spennumörk, hvernig CivilCraft reiknar spennu hvers þversniðs, og strengingartöflurnar.
keywords: sig, spenna, álagstilvik, hitastig, vindur, ís, ósamhverfur ís, ráðandi spann, jafngildisspann, ástandsbreyting, keðjulína, strengingartafla, brotstyrkur, daglegt álag
from: f8876c35
---

## Álagstilvik og mörk

{{ui:Meira}} › {{ui:Álagstilvik og mörk…}} breytir þeim reglum sem hver lína í verkefninu fylgir.

- **Álagstilvik**: hitastig, vindþrýstingur á leiðarann (Pa) og geislamsís (mm, með eðlismassa sínum). Fyrsta tilvikið er viðmiðið.
- **Spennumörk**: hlutfall af brotstyrk leiðarans, á láréttu spennuna eða á mestu spennu við stuðning, í einu álagstilviki. Eða gefðu láréttu spennuna sjálfur.
- **Bil**: bilið sem leiðarinn heldur yfir jörðu, vegi, byggingu og svo framvegis. Bættu við, endurnefndu og fjarlægðu þau: þau eru þín. Fyrir neðan þau velur þú reglurnar fyrir **Gróður undir línu**, **Veggi undir línu** og **Þverun neðanjarðar**.
- **Tilvik sem athuganirnar nota**: hvaða tilvik gefur mesta sigið (heitt), sveiflu einangrarans (vindur), ís og ís öðru megin við stuðning.
- **Stuðlar**: fasabilsstuðull k, mesta sveifla einangrarans, stuðull á álag stuðnings og tengja, beygjuhornin sem gera horn- og endastuðning, minnsta þekja yfir grafnum kaplum, og mesta spennufall.

## Pakkar: reglur og safn fyrir land

Engar reglur eins lands eru innbyggðar í CivilCraft. **Pakki** geymir reglusett og safn saman í einni skrá (`.cclinepack.json`), fyrir land, rekstraraðila netkerfis eða fyrirtæki:

- **Vista sem pakka…** í {{ui:Álagstilvik og mörk…}} skrifar reglusettið sem sést og safnið þitt (eða, ef safnið þitt er enn tómt, þá hluti sem þetta verkefni notar). Skrifaðu **Land eða svæði** fyrst.
- **Opna reglusett eða pakka…** les pakka, reglaskrá eða safnskrá. Reglur pakka birtast í glugganum (smelltu á **Beita** til að nota þær) og hlutir hans fara í safnið þitt.
- Pakkar sem aðrir deila eru skráðir á viðbótasíðunni undir **Pakkar fyrir raflínur**. Tveir dæmapakkar sýna sniðið; þeir eru ekki reglur neins lands.

Sérhver pakki er prófaður þegar hann er opnaður, eins og hver önnur skrá. Athugaðu hvert gildi gegn þeim staðli sem á við áður en nokkuð er byggt.

Tvö dæmi um reglusett eru til sem upphaf: **Dæmi: kalt loftslag** og **Dæmi: milt loftslag**. Tölur þeirra koma úr engum staðli: settu þau gildi sem þinn staðall gefur. {{ui:Vista reglur}} og {{ui:Opna reglur…}} deila reglusetti sem skrá.

## Hvernig spennan er reiknuð

Fyrir hvern kafla milli endapunkta:

1. **Ráðandi spann** er √(ΣL³ ÷ ΣL) af spönnum hans.
2. Hvert mark er gert að láréttri spennu í viðmiðstilvikinu með **jöfnu ástandsbreytingar** á ráðandi spanni: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Það sem takmarkar mest ræður spennunni.
3. Spenna hvers álagstilvik fylgir af þeirri, og lögun hverrar spannar er nákvæm **keðjulína** í gegnum þessa tvo festipunkta (einnig spönn í halla): sig úr strengnum, lengd, og spennan í hvorum enda.

Álagið á metra í tilviki: þyngd auk ís (flatarmál íss × eðlismassi × g) lóðrétt; vindþrýstingur × þvermál með ís lárétt.

## Strengingartöflur

{{ui:Meira}} › {{ui:Strengingartöflur…}} listar, fyrir hvern kafla, láréttu spennuna og sig hverrar spannar við hvert hitastig í reglusettinu (−5 °C til 40 °C með 5 °C skrefum til að byrja með), í kyrrulofti. Vistaðu þær, ásamt stuðningstöflunni, sem CSV.

Ekki talið með: skrið leiðarans yfir árin, og teygja nýs leiðara. Bættu þeim við í gegnum hitastigin sem þú strengir við.
