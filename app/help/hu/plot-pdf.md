---
title: Az alaprajz plottolása PDF-be
summary: Az összes vagy az aktuális nézet plottolása vektoros PDF-be szabványos lapon, mérnöki vagy metrikus méretarányban, rétegszínekkel vagy feketében.
keywords: plottolás, nyomtatás, pdf, lap, méretarány, papírméret, alaprajzi lap, közzététel, rajzfej, északi nyíl, méretarány-sáv
from: 9af396ca
---

{{ui:PDF}} az alaprajzot egy lapon vektoros PDF-be plottolja, rajzfejjel, északi nyíllal és méretarány-sávval. A PDF a böngészőben készül és töltődik le; nem használja a böngésző nyomtatási párbeszédpanelét.

## Plottolás

1. Állítsa be az alaprajzot a **Megjelenítés** alatt: a megjelenített felületet, a szintvonal-közt és azt, hogy mi legyen bekapcsolva. A plottolás ezeket a beállításokat követi.
2. Ha a telephelynek csak egy részét szeretné, nagyítsa és tolja az alaprajzot oda.
3. Kattintson a {{ui:PDF}} gombra az **Exportálás** csoportban, vagy nyomja meg a {{key:Mod+P}} billentyűkombinációt. Megnyílik az **Alaprajz plottolása PDF-be** párbeszédpanel.
4. Válassza ki a **Terület** értékét: {{ui:Minden}} vagy {{ui:Ami a képernyőn van}}.
5. Válassza ki a **Papírt**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 vagy A1. A láb alapú projekt Tabloid-dal indul, a méteres projekt A3-mal. A lapok mindig fekvő tájolásúak.
6. Válassza ki a **Méretarányt**. A lista a legnagyobb ráférő méretarányt „(ráfér)” jelöléssel jelzi, és azt választja ki.
   - Láb: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Méter: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Válassza ki a **Tintát**: {{ui:Rétegszínek}} vagy {{ui:Fekete}}.
8. Olvassa el a választások alatti sort. Ez megadja a terület méretét a lapon és a lap méretét, például: „A terület 297 × 222 mm méretű 1" = 40' méretarányban, 432 × 279 mm-es lapon (fekvő)."
9. Kattintson a {{ui:PDF letöltése}} gombra.
   A böngésző letölti a `<name>.pdf` fájlt. Az állapotsor ezt írja: „A(z) <name>.pdf plottolva, méretarány: 1" = 40'.”

Ha a terület nagyobb a lapnál a választott méretarányban, a plottolás középre igazodik, és a szélek levágódnak. Válassza a „(ráfér)” jelölésű méretarányt vagy egy nagyobb lapot.

## Mi kerül a lapra

- Az alaprajz, középre igazítva a rajzterületen, valódi vektorokként: szintvonalak, feliratok, nyomvonalak szelvényezéssel, sávok, tereplépcsők és daylight-vonalak, csövek, pontok.
- Vonalvastagságok rétegenként: a nyomvonalak, tereplépcsők és csövek vastagabbak; a háromszögek és a vékony szintvonalak finomak.
- Rajzfej az alján: a projekt **Neve**, a méretarány, megjegyzés a szintvonal-közről és arról, hogy melyik felület látszik (meglévő vagy tervezett), jobbra a dátum és a build száma.
- Északi nyíl a jobb felső sarokban (az alaprajz északja felfelé mutat), és méretarány-sáv a rajzfejben.
- A térképrétegek, amelyek az alaprajz alatt jelennek meg (kép, térképcsempék vagy térképszolgáltatás), ha az **Alaprajz alatti térképrétegek** be van pipálva: a teljes rajzterület egyetlen képeként, 150 pont/hüvelyk (dpi) felbontásban, a vonalrajz alatt rajzolódnak ki, a térkép forrásmegjelölése pedig a rajzfejbe kerül. A CivilCraft legfeljebb 8 másodpercet vár az még érkező térképképekre; ha egyesek hiányoznak, az állapotsor ezt jelzi.

A szöveg a PDF beépített Helvetica betűtípusát használja. A Nyugat-európai készleten (Windows-1252) kívüli karakterek „?” jellel nyomtatódnak, és az állapotüzenet megszámolja őket.

## Ami nem kerül plottolásra

- Magassági sávok.
- A hossz-szelvény-nézet. A hossz-szelvények plottolása még nem érhető el.
- Több lap (nyomvonal esetén használja a [alaprajz- és hossz-szelvény lapokat](topic:plan-profile-sheets)), nézetablakok, egyedi rajzfej vagy álló tájolású lapok.

:::note
A párbeszédpanel szerint a lejtésnyilak csak a képernyőn láthatók. Ebben a verzióban a **Megjelenítés** alatt bekapcsolt lejtésnyilak plottolásra kerülnek (és DXF-be is exportálódnak). Kapcsolja ki őket plottolás előtt, ha nem szeretné.
:::

## Nyomtatás papírra

Nyissa meg a letöltött PDF-et bármely PDF-megjelenítővel, és 100%-os (valódi méretben) nyomtassa ki, hogy a méretarány pontos maradjon. Az „Oldalhoz igazítás” a méretarányt megváltoztatja.
