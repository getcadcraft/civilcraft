---
title: Az alaprajz exportálása DXF-be
summary: Az alaprajz vonalait R12-es DXF-fájlba írja, elnevezett rétegeken, a szintvonalakat magasságukon, a töréseléket 3D-ben, bármely CAD-programhoz.
keywords: dxf, dwg, cad, exportálás, vonalrajz, r12, 2000, 2004, 2007, 2010, 2013, 2018, rétegek, szintvonalak, rajzcsere, alaptérkép, háttér
from: f2d8ede9
---

A {{ui:DXF}} az alaprajzon látható elemeket DXF-fájlba írja, R12 formátumban, amelyet minden CAD-program megnyit. Ha használta már az AutoCAD-et vagy a Civil 3D-t, úgy nyissa meg vagy szúrja be, mint bármely más DXF-fájlt.

## Exportálás

1. Állítsa be az alaprajzot a kívánt rajz szerint: a **Megjelenítés** alatt válassza ki a felületet (meglévő vagy tervezett), a szintközt, és hogy mely elemek legyenek bekapcsolva (szintvonalak, feliratok, pontok, pontfeliratok, háromszögek, töréselők, felületszél, csövek, lejtőnyilak).
2. Kattintson az **Exportálás** csoportban a {{ui:DWG/DXF}} gombra, válassza ki a {{ui:DXF (R12, szöveg) — az egyszerű csereformátum}} lehetőséget, majd kattintson a {{ui:Letöltés}} gombra.
3. A böngésző letölti a `<name>.dxf` fájlt. Az állapotsorban például ez jelenik meg: "Exportált R12 DXF: 2,140 objektum; a feliratok 1" = 40'-es léptékhez méretezve. A sávok nem exportálódnak."

A koordináták a projekt mértékegységeiben, valódi értékükön íródnak ki (a síkkoordináták megmaradnak). Semmit nem skálázunk és nem mozgatunk.

## Mi van a fájlban

| Elem | DXF-objektum | Réteg |
|---|---|---|
| Kis és főszintvonalak | 2D polivonalak a magasságukon | C-TOPO-MINR, C-TOPO-MAJR |
| Szintvonal-feliratok | Szöveg | C-TOPO-TEXT |
| Háromszögek | Polivonalak | C-TOPO-TINN |
| Töréselők és határ | 3D polivonalak | C-TOPO-BRKL |
| Felületszél | Polivonalak | C-TOPO-BNDY |
| Lejtőnyilak | Polivonalak | C-TOPO-SLOP |
| Mérési pontok és feliratuk | Pontok (magassággal), szöveg | V-NODE, V-NODE-TEXT |
| Vonalak vonalkódok szerint | 3D polivonalak | V-NODE-LINE |
| Nyomvonal tengelyvonalai | Vonalak és ívek | C-ROAD-CNTR |
| Szelvényszám-jelölések és feliratok | Polivonalak, szöveg | C-ROAD-STAN |
| Sáv szélei | Polivonalak | C-ROAD-CORR |
| Mintavételi vonalak | Polivonalak | C-ROAD-SCTN |
| Tereplépcsők, kitermelési vonalak, lejtővonalak | Polivonalak | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Jellemzővonalak | 3D polivonalak (az ívek 0,01-en belüli darabokként; lásd: [Jellemzővonalak](topic:feature-lines)) | C-GRAD-FEAT |
| Mozgási útvonalak | Polivonalak, szöveg | C-ROAD-SWPT |
| Csövek, műtárgyak, feliratok | Polivonalak, szöveg | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Hibás csövek és műtárgyak | Polivonalak | C-STRM-PROB |

Minden rétegnek van színe. A teljes lista itt található: [Alaprajz rétegei](topic:plan-layers).

## Felirat mérete

A szövegnek rajzegységben meghatározott méretűnek kell lennie. A CivilCraft úgy méretezi a feliratokat, hogy a teljes alaprajz egy Tabloid lapra (ft) vagy egy A3-as lapra (m) férjen, és az állapotüzenetben megadja a léptéket. Ha a CAD-programban más léptékben nyomtat, ott méretezze át a szöveget.

## Mi nem exportálódik

- Magassági sávok (csak a képernyőn látszanak).
- A hossz-szelvény nézet. A hossz-szelvények LandXML-ként exportálódnak, nem rajzként.
- Maga a felület 3D-s objektumként. A TIN-hez használja a LandXML-t, vagy kapcsolja be a {{ui:Háromszögek}} opciót, hogy a széleit vonalrajzként kapja meg.
- Minden, amit a **Megjelenítés** alatt kikapcsolt.

## DWG

A {{ui:DWG/DXF}} ugyanezt a vonalrajzot DWG-rajzként is kiírja. A párbeszédpanelen meg kell adnia a formátumot: DXF, vagy DWG 2000, 2004, 2007, 2010, 2013 vagy 2018 verzióban. A 2000-es szinte minden CAD-program megnyitja, a régiek és az újak egyaránt; az újabbat akkor válassza, ha a rajzot kapó fél ezt kéri. A választás ebben a böngészőben megmarad.

1. Kattintson az **Exportálás** csoportban a {{ui:DWG}} gombra.
2. Válassza ki a **Formátumot**, majd kattintson a **DWG letöltése** gombra.
3. A böngésző letölti a `<name>.dwg` fájlt. Az állapotsor megmondja, mi került bele, például: "Exportált DWG (2018-as formátum): 12 polivonal, 40 felirat 9 rétegen".

A DWG ugyanazokat a rétegeket, színeket, szintvonalakat (magasságukon polivonalként), 3D töréselőket, feliratokat és pontokat tartalmazza, mint a DXF, ugyanazokban a koordinátákban. Ami a DWG-ben nem tárolható rétegnév, az megváltozik, és az állapotüzenet ezt jelzi. A CivilCraft a DWG-t saját kódjával írja, így semmi nem hagyja el a számítógépet.

### Térképrétegek a DWG-ben

A DWG-rajz nem tartalmazhat képet önmagán belül: a CAD-programok a rajz mellett lévő képet mutatnak. Ha térképrétegek láthatók, a párbeszédpanelen megjelenik a **Térképrétegek képként a rajz mellett** lehetőség. Ha ez be van jelölve, a letöltés egy `.zip` fájl lesz, amely tartalmazza a `<name>.dwg` fájlt, a `<name>-map.png` fájlt (a térképrétegek a teljes rajzon, legfeljebb 4 096 képpont szélesen) és a `<name>-map.pgw` fájlt (a világfájlt, GIS-programokhoz). A rajzon a kép a G-MAP-IMAG rétegen, a helyén jelenik meg. Csomagolja ki a fájlokat egy mappába, és tartsa őket együtt.
