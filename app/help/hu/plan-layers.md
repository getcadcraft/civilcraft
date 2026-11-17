---
title: Alaprajzi rétegek
summary: A CivilCraft által képernyőn, DXF-ben és PDF-ben használt rögzített rétegnevek, színek és vonalvastagságok, és az, hogy melyik megjelenítési beállítás vezérli őket.
keywords: rétegek, rétegnevek, ncs, színek, aci, vonalvastagságok, dxf-rétegek, pdf, megjelenítési beállítások, vonalrajz
from: c2aa8475
---

Minden az alaprajzon egy réteghez tartozik. A nevek a szokásos polgári mérnöki rétegnévi mintát követik (szakág, főcsoport, alcsoport). A rétegek ebben a verzióban rögzítettek: nem nevezheti át őket, nem módosíthatja a színüket, és nem adhat hozzá sajátot. DXF-ben minden rétegnél a feltüntetett színszám érvényes; PDF-ben a {{ui:Rétegszínek}} beállítással ugyanezek a színek használatosak, a {{ui:Fekete}} beállítással pedig minden fekete színnel nyomtatódik.

| Réteg | Tartalma | Szín (DXF-szám) | Megjelenik, ha |
|---|---|---|---|
| C-TOPO-MINR | Vékony szintvonalak | Szürke (8) | {{ui:Szintvonalak}} |
| C-TOPO-MAJR | Vastag szintvonalak | Fehér vagy fekete (7) | {{ui:Szintvonalak}} |
| C-TOPO-TEXT | Szintvonal-feliratok | Fehér vagy fekete (7) | {{ui:Szintvonalak}} és {{ui:Szintvonalfeliratok}} |
| C-TOPO-TINN | Háromszögélek | Szürke (8) | {{ui:Háromszögek}} |
| C-TOPO-BRKL | Töréselek és a határ | Narancssárga (30) | {{ui:Töréselek}} |
| C-TOPO-BNDY | Felület széle | Fehér vagy fekete (7) | {{ui:Felület széle}} |
| C-TOPO-SLOP | Lejtésnyilak | Cián (4) | {{ui:Lejtésnyilak}} |
| V-NODE | Felmérési pontok | Zöld (3) | {{ui:Pontok}} |
| V-NODE-TEXT | Pontfeliratok: szám, magasság, leírás | Zöld (3) | {{ui:Pontok}} és {{ui:Pontfeliratok}} |
| V-NODE-LINE | Vonalak a vonalkódokból (a nem töréselek csoportjai) | Zöld (3) | {{ui:Pontok}} |
| C-ROAD-CNTR | Nyomvonal tengelyvonalai | Piros (1) | Mindig |
| C-ROAD-STAN | Szelvényjelek és feliratok, PC és PT | Piros (1) | Mindig |
| C-ROAD-CORR | Sáv (korridor) szélei | Sárga (2) | Mindig |
| C-ROAD-SCTN | Mintavételi vonalak (ahol a keresztszelvények készülnek) | Szürke (8) | Ha a nyomvonalnak vannak mintavételi vonalai |
| C-GRAD-PADS | Tereplépcsők körvonalai | Kék (5) | Mindig |
| C-GRAD-DAYL | Daylight-vonalak | Bíbor (6) | Mindig |
| C-GRAD-SLOP | Tereprendezési lejtővonalak | Bíbor (6) | Mindig |
| C-GRAD-FEAT | Jellemzővonalak (3D) | Zöld (3) | Mindig |
| C-ROAD-SWPT | Kanyarodási pályák: körvonal, a legkülső kerékpályák, név | Narancssárga (30) | Mindig |
| C-STRM-PIPE | Csövek | Kék (5) | {{ui:Csövek}} |
| C-STRM-STRC | Műtárgyak | Kék (5) | {{ui:Csövek}} |
| C-STRM-TEXT | Cső- és műtárgyfeliratok | Kék (5) | {{ui:Csövek}} |
| C-STRM-PROB | Problémás csövek és műtárgyak | Piros (1) | {{ui:Csövek}} |

A töréselek csak akkor rajzolódnak ki, ha a **Felület** a **Megjelenítés** alatt a következő: {{ui:Meglévő terep}}; a határ mindkét felülettel kirajzolódik.

## Vonalvastagságok PDF-ben

| Vastagság | Rétegek |
|---|---|
| 0,50 mm | Nyomvonal tengelyvonalai, tereplépcsők, csövek, problémás csövek |
| 0,35 mm | Vastag szintvonalak, daylight-vonalak, műtárgyak |
| 0,25 mm | Töréselek |
| 0,13 mm | Vékony szintvonalak |
| 0,09 mm | Háromszögélek, tereprendezési lejtővonalak |
| 0,18 mm | Minden más |

A DXF-fájlok nem tartalmaznak vonalvastagságot; állítsa be őket rétegenként a CAD-programjában.

## Felirat-méretek

A feliratok papíron méretezettek: szintvonal-feliratok 2,0 mm, szelvényfeliratok 1,8 mm, PC- és PT-feliratok, valamint cső- és műtárgyfeliratok 1,6 mm, pontfeliratok 1,5 mm. A csőfeliratok a nevet, átmérőt és lejtést adják meg; a műtárgyfeliratok a nevet és a fedlapot. A képernyőn a nagyítással együtt nem változik a méretük. DXF-ben a feliratok az exportálási üzenetben megnevezett méretarányhoz igazodnak; lásd: [Az alaprajz exportálása DXF-be](topic:dxf-export).

## Egy rétegen sem jelenik meg

A magassági sávok csak a képernyőn, a vonalrajz alatt rajzolódnak ki. A hossz-szelvény-nézet nem része az alaprajznak.
