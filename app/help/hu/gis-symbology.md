---
title: Réteg stílusa attribútum alapján
summary: A GIS-réteg elemeinek színezése egy mező értékei szerint (értékenként egy szín, vagy számtartományonként), pontok méretezése egy számmal, poligonok árnyalása és jelmagyarázat a terven.
keywords: szimbólum, stílus, szín, színezés, kategorizált, fokozatos, egyedi értékek, egyenlő intervallum, kvantilis, természetes törések, jenks, színskála, színvakság, jelmagyarázat, méret, pontok, choropleth, osztályok, gis
from: a3a69add
---

Nyissa meg a réteg **három pont** menüjét a GIS-rétegek listájában, és válassza a {{ui:Stílus attribútum szerint…}} lehetőséget.

## Három stílus

- **Egyszeres szimbólum:** a réteg színe, mint korábban.
- **Kategorizált:** egy szín minden különböző értékhez bármely mezőből. Legfeljebb nyolc értékhez az Okabe-Ito nyolc szín jut (úgy választva, hogy a színvakság gyakori típusainál is jól elkülönüljenek); több érték esetén a leggyakoribb hét kap egy-egy színt, a többi pedig egy közös szürke **Egyéb** osztályt. Az érték nélküli elemek szürkék.
- **Fokozatos:** egy számmező 2–9 tartományra van vágva, mindegyik egy színt kap a színskálából. A töréspontra eső érték az alsó tartományba kerül.

## Hogyan vágják a tartományokat

| Módszer | Töréspontok |
|---|---|
| Egyenlő intervallum | A legkisebbtől a legnagyobb értékig terjedő tartomány egyenlő szélességű részekre osztva. A 0-tól 30-ig terjedő értékek három tartományban: 0, 10, 20, 30. |
| Kvantilis | Körülbelül azonos számú elem minden tartományban. A töréspontokat a rendezett értékekből olvassuk ki, a szokásos egyenes interpolációval: az 1-től 10-ig terjedő értékek két tartományban 5,5-nél törnek. |
| Természetes törések (Jenks) | Azok a vágások, amelyek tartományonként a legkisebb szórást hagyják, így a hasonló értékek csoportjai együtt maradnak. 1 500-nál több értéknél 1 500 egyenletesen elosztott értéken dolgozik, és ezt jelzi. |

## Színek

A Viridis és a Cividis sötéttől a világosig halad, egyenletes fényességváltással, így a tartományok sorrendje szürkeárnyalatban vagy színvakság mellett is leolvasható. A Kékek világostól a sötétig tartanak. A piros–kék egy kétirányú skála, egy középérték körüli értékekhez. A **Színek megfordítása** bármelyiket megfordítja. A párbeszédpanel az alkalmazás előtt felsorolja a tartományokat és az egyes tartományokban lévő elemek számát.

## Méret, kitöltés és jelmagyarázat

- A **Pontméret mező szerint** egy számmezővel minden pont négyzete annál nagyobb lesz, minél nagyobb az értéke, a két megadott méret között (az oldal fele, milliméterben papíron).
- A **Poligonok belsejének árnyalása** minden poligont az osztályszínével tölt ki (a lyukak üresek maradnak). Az árnyalat a képernyőn látszik; a plottok és a DXF/DWG csak a színezett körvonalakat mutatják.
- A **Jelmagyarázat megjelenítése a terven** az osztályokat, darabszámukat és a méret tartományát a terv bal alsó sarkában rajzolja ki. A jelmagyarázat a képernyőn látszik; plottba nem kerül.
- Az elemek mező szerinti címkézéséhez használja a **Címkézés ezzel** lehetőséget ugyanabban a menüben.

A stílus a projektfájlba mentődik. Olyan változat, amely nem ismeri a stílusokat, a réteg színével nyitja meg a fájlt. A plottok, a DXF és a DWG az osztályokat külön rétegekként tartalmazzák, amelyek a réteg és az osztály nevét viselik, a kilenc alapvető CAD-szín közül a legközelebbi színnel. A 200 000-nél több elemű réteg egyetlen színnel rajzolódik ki.
