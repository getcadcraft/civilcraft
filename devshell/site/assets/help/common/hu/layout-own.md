---
title: Saját elrendezés kialakítása és beállításkészletek mentése
summary: Válassza ki, melyik panel mutassa a projektböngészőt, a Tulajdonságokat vagy a panel saját tartalmát, hová kerüljön az eszközkészlet és mi legyen a sávokon, mentse saját elrendezésként, és tartson egész beállításkészleteket néven, hogy váltogathasson közöttük.
keywords: elrendezés, munkaterület, kialakítás, testreszabás, saját elrendezés, panelek, szerkesztők, projektböngésző, tulajdonságok, eszközkészlet, gyorssáv, infódoboz, munkakörnyezet, beállításkészlet, profil, beállításkészlet mentése, beállításkészlet váltása, beállításkészlet exportálása, beállításkészlet importálása, ccenv
from: 2a71af43
---

A három beépített elrendezés mellett kialakíthat egy sajátot is, és az egész beállítását néven mentheti, hogy egyetlen lépéssel visszaválthasson rá.

## Saját elrendezés kialakítása

1. Nyissa meg a {{ui:Beállítások}} ablakot (a fogaskerék, vagy {{key:Mod+,}}), válassza a {{ui:Globális}} lapot, majd az {{ui:Elrendezés}} részt.
2. Válassza a {{ui:Saját elrendezés kialakítása…}} parancsot. A párbeszédpanel az éppen használt elrendezésből indul ki.
3. Adjon neki nevet, majd válasszon:
   - **A rajz fölött:** az alkalmazás eszköztára, szalag vagy egyik sem; címsor; infódoboz, és hogy milyen vezérlőket tartalmazzon.
   - **A rajz mellett:** az eszközkészlet balra, jobbra vagy egyáltalán nem, a {{ui:Saját eszközök}} megjelenítésével vagy anélkül; melyik panel tartalmazza a palettákat, melyik van legfelül (például a projektböngésző vagy a Tulajdonságok), és melyek a lapok alatta.
   - **A rajzterület:** nézetlapok, gyorssáv és nézetsáv a kipipált vezérlőkkel, a szerkesztőpaletta, állapotsor.
   - **Megjelenés:** méret, gombkeretek és lapstílus.
4. Válassza az {{ui:Ennek az elrendezésnek a használata}} parancsot. Az alkalmazás azonnal átvált rá, és minden elrendezéseket támogató alkalmazás is ezt használja.

Csak az szerepel a kínálatban, ami az adott alkalmazásban megvan. Az elrendezése a {{ui:Bővítményekből és fájlokból}} alatt szerepel; az {{ui:Az elrendezés exportálása}} fájlként menti, amelyet továbbadhat egy kollégának, az eltávolítás gomb pedig elveszi. A kitöltött panelek továbbra is dokkolhatók, lebeghetnek és saját ablakba költözhetnek, ahogy a [Panelek elrendezése](common:arrange-panels) leírja.

## Beállításkészlet mentése munkakörnyezetként

A munkakörnyezet az egész beállításkészlete minden alkalmazásra ebben a böngészőben: az elrendezés, a menüstílus és a billentyűi, az eszköztár stílusa, a panelek és méretük, valamint a {{ui:Saját eszközök}}. A téma és a nyelv nem része.

- **Mentés:** írjon be egy nevet a {{ui:Munkakörnyezetek}} alatt, és válassza a {{ui:A beállításom mentése}} parancsot. A már létező néven mentés lecseréli az adott beállításkészletet.
- **Váltás:** válasszon egy beállításkészletet a listából, és válassza a {{ui:Váltás rá}} parancsot. Az alkalmazás újratöltődik abban a beállításkészletben; ha nem mentett munkája van, az alkalmazás előbb rákérdez, mint minden újratöltésnél.
- **Megosztás:** az {{ui:Exportálás}} a kiválasztott beállításkészletet `.ccenv.json` fájlként menti; a {{ui:Beállításkészlet importálása…}} egyet ad hozzá fájlból. A fájl csak ezeket a választásokat állítja be, mást semmit.
- **Eltávolítás:** válasszon egy beállításkészletet, és válassza az {{ui:Eltávolítás}} parancsot.

Legfeljebb tizenkét beállításkészletet tarthat.

A beépített elrendezések előzetes kipróbálásához lásd [az eszközkészlet és infódoboz elrendezést](common:layout-toolbox) és [a szalag és projektböngésző elrendezést](common:layout-ribbon).
