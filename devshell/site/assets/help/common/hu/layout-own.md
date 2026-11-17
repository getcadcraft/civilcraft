---
title: Saját elrendezés kialakítása és a beállítások mentése
summary: Válassza ki, melyik panel mutatja a projektböngészőt, a Tulajdonságokat vagy a panel saját tartalmát, hová kerül az eszközkészlet, és mit tartalmaznak a sávok; mentse el saját elrendezésként, és nevesítve tárolja a teljes beállításkészleteket, amelyek között váltani lehet.
keywords: elrendezés, munkaterület, kialakítás, testreszabás, saját elrendezés, elrendezés, panelek, szerkesztők, projektböngésző, tulajdonságok, eszközkészlet, gyorssáv, infódoboz, munkakörnyezet, beállítás, profil, beállítás mentése, beállítás váltása, beállítás exportálása, beállítás importálása, ccenv
from: 6af528e0
---

A három beépített elrendezés mellett kialakíthat egy sajátot is, és a teljes beállítását egy néven mentheti, hogy egy lépésben vissza lehessen váltani rá.

## Saját elrendezés kialakítása

1. Nyissa meg a {{ui:Beállítások}} menüt (a fogaskerék, vagy a {{key:Mod+,}}), válassza a {{ui:Globális}} lapot, majd az {{ui:Elrendezés}} menüpontot.
2. Válassza a {{ui:Saját elrendezés kialakítása…}} parancsot. A párbeszédpanel a jelenleg használt elrendezéssel indul.
3. Adjon nevet, majd válassza ki:
   - **A rajz fölött:** az alkalmazás eszköztárát, szalagot vagy egyiket sem; egy címsort; egy infódobozt és azt, hogy milyen vezérlőket tartalmaz.
   - **A rajz mellett:** az eszközkészletet balra, jobbra vagy egyáltalán nem, a {{ui:Saját eszközök}} résszel vagy anélkül; melyik panel tartalmazza a palettákat, melyik legyen felül (például a projektböngésző vagy a Tulajdonságok), és melyek legyenek alatta lapok.
   - **A rajzterület:** nézetlapok, gyorssáv és nézetsáv a bejelölt vezérlőkkel, a szerkesztőpaletta, állapotsor.
   - **Megjelenés:** méret, gombkeretek és lapstílus.
4. Válassza az {{ui:Ennek az elrendezésnek a használata}} parancsot. Az alkalmazás azonnal átvált rá, és minden alkalmazás, amelynek vannak elrendezései, ezt is használja.

Csak azok jelennek meg, amelyek ebben az alkalmazásban megvannak. Az elrendezése a {{ui:Bővítményekből és fájlokból}} alatt jelenik meg; az {{ui:Az elrendezés exportálása}} parancs fájlba menti, amelyet egy kollégának is átadhat, az eltávolítás gombbal pedig törölhető. A panelek, amelyeket kitölt, továbbra is dokkolhatók, lebeghetnek, és saját ablakba vihetők, ahogy a [Panelek elrendezése](common:arrange-panels) részben szerepel.

## A beállítás mentése munkakörnyezetként

A munkakörnyezet a teljes beállítása az összes alkalmazáshoz ebben a böngészőben: az elrendezés, a menüstílus és a billentyűk, az eszköztár stílusa, a panelek és méreteik, valamint a {{ui:Saját eszközök}}. A téma és a nyelv nem tartozik hozzá.

- **Mentés:** írjon nevet a {{ui:Munkakörnyezetek}} alá, és válassza a {{ui:A beállításom mentése}} parancsot. Már létező név alatt mentve a beállítás felülíródik.
- **Váltás:** válasszon egy beállítást a listából, és válassza a {{ui:Váltás rá}} parancsot. Az alkalmazás újratöltődik az adott beállítással; ha van nem mentett munkája, az alkalmazás előbb rákérdez, ahogy bármilyen újratöltésnél.
- **Megosztás:** az {{ui:Exportálás}} a kiválasztott beállítást `.ccenv.json` fájlba menti; a {{ui:Beállításkészlet importálása…}} parancs fájlból ad hozzá egyet. A fájl csak ezeket a beállításokat állítja be, mást nem.
- **Eltávolítás:** válasszon egy beállítást, és válassza az {{ui:Eltávolítás}} parancsot.

Legfeljebb tizenkét beállítást tarthat meg.

Az elrendezés megváltoztatásához a párbeszédpanel megnyitása nélkül (blokk húzása, eszköz jobb gombos kattintása), lásd [Elrendezés módosítása a képernyőn](common:layout-edit). A beépített elrendezések előzetes kipróbálásához lásd [az eszközkészlet és infódoboz elrendezését](common:layout-toolbox), [a szalag és projektböngésző elrendezését](common:layout-ribbon) és [a Rajzolás elrendezést](common:layout-drafting).
