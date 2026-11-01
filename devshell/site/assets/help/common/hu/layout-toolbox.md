---
title: Munka az eszközkészlet és infódoboz elrendezésben
summary: Kapcsolja át az alkalmazást a bal oldali eszközoszlopra a saját eszközök helyeivel, a felül végigfutó infódobozra, amely a futó eszközt vagy a kijelölést követi, a jobb oldali navigátorra, minden nézethez egy lapra, gyorsbeállításokra és szerkesztőpalettára, és bármikor visszaválthat a klasszikus elrendezésre.
keywords: elrendezés, munkaterület, eszközkészlet, eszközoszlop, infódoboz, infósáv, navigátor, projekttérkép, gyorssáv, gyorsbeállítások, szerkesztőpaletta, saját eszközök, kedvenc eszközök, nézetlapok, eszközkészlet ablak, klasszikus elrendezés, elrendezés módosítása, elrendezés váltása
from: 2f807c9c
---

Az **Eszközkészlet és infódoboz** az alkalmazás három munkaterület-elrendezésének egyike. A rajzeszközök egy oszlopban állnak balra, a felül végigfutó infódoboz azt mutatja, mit kér a futó eszköz, vagy mi van kijelölve, minden nézetnek van lapja, a rajz alatti gyorssáv pedig néhány mindennapi beállítást tartalmaz. Az eszközök az alkalmazás saját eszközei: minden, amit a klasszikus elrendezésben megtehet, itt is működik, a rajza, a menüstílusa és a billentyűi pedig változatlanok maradnak.

## Kiválasztás

1. Nyissa meg a {{ui:Beállítások}} ablakot (a fogaskerék, vagy {{key:Mod+,}}).
2. Válassza a {{ui:Globális}} lapot, majd lépjen az {{ui:Elrendezés}} › {{ui:Munkaterület}} részhez.
3. Válassza az {{ui:Eszközkészlet és infódoboz}} lehetőséget.

Az elrendezés azonnal változik. A választás minden alkalmazásra egy közös érték ebben a böngészőben: innentől minden alkalmazás ebben nyílik meg, és az oldal kirajzolása előtt már érvényben van, így soha nem látja előbb a klasszikus elrendezést.

## Mi hol van

- **Eszköztár:** az alkalmazás saját eszköztára a rajzterület tetején marad, a menüivel együtt.
- **Infódoboz:** az eszköztár alatt. Amíg egy eszköz fut, megmutatja az eszközt és azt, amit kér. Amikor kijelöl valamit, a fő beállításait mutatja (egy falnál: típusát, vastagságát, hosszát, helyvonalát és magasságát), és ott helyben módosíthatja őket: az ottani módosítás ugyanaz, mint a Tulajdonságokban, és a {{key:Mod+Z}} visszavonja. Ha semmi sincs kijelölve, azt írja: „Nincs kijelölve semmi”. Minden alkalmazás saját dobozokat ad hozzá, például az aktuális réteget vagy szintet, vagy a megnyitott dokumentumot.
- **Eszközkészlet:** a bal oldali oszlop, az alkalmazás eszközei csoportokban. Kattintson egy csoport nevére, hogy összecsukja vagy ismét megnyissa. A futó eszköz ki van világítva.
- **Saját eszközök:** az eszközkészlet első csoportja, nyolc üres hely a legtöbbet használt eszközeinek. Kattintson egy üres helyre, hogy kiválassza az alkalmazás bármelyik eszközét vagy parancsát; vagy kattintson jobb gombbal egy eszközre az eszközkészletben, és válassza a {{ui:Hozzáadás a Saját eszközökhöz}} parancsot; vagy húzzon egy eszközt egy helyre. Jobb gombbal kattintva egy helyen módosíthatja vagy kiürítheti. A helyei alkalmazásonként megmaradnak ebben a böngészőben.
- **Navigátor:** a jobb oldali panel. Felül az alkalmazás projektböngészője (alaprajzok, metszetek, homlokzatok, 3D nézetek, kimutatások, rajzlapok, amennyi az alkalmazásban van): kattintson egyre a megnyitásához. Alatta a {{ui:Tulajdonságok}} és egy lap a jobb oldali panel egyéb tartalmával.
- **Nézetlapok:** a megnyitott fájl minden nézetéhez egy lap (rajzlap, alaprajz, jelenet…) a rajz fölött.
- **Gyorssáv:** a rajz alatt, a nézetbeállítások és a mindennapi beállítások, amelyek az alkalmazásban vannak, például a lépték, a részletességi szint, a nézettartomány, az illesztés, az alaprajz, a felosztás vagy a 3D, a snapek és a mértékegységek.
- **Szerkesztőpaletta:** kattintson valamire a rajzban, és egy kis paletta jelenik meg a mutató mellett az alkalmazás szerkesztőparancsaival, például mozgatás, másolás, forgatás, tükrözés, kettőzés vagy törlés, és a {{ui:Tulajdonságok}}. Az {{key:Esc}}, az egérgörgő, egy másik kattintás vagy a bezárógombja eltünteti.

Az az eszköz, amely éppen nem futtatható, szürke, és az elemleírása megmondja, miért. Kattintson rá, vagy nyomja meg rajta az {{key:Enter}} billentyűt, hogy az okot egy ablakban elolvashassa.

Az {{key:Esc}} előbb a futó eszközt fejezi be, mint a klasszikus elrendezésben, és minden billentyűparancs, valamint a {{key:Ctrl+Shift+F}} (képernyőmódok) a korábbiak szerint működik.

## Saját ablak az eszközkészletnek

Az eszközkészlet tetején lévő {{ui:Az eszközkészlet mozgatása}} gombon megtalálható az {{ui:Áthelyezés új ablakba}}: az eszközkészlet egy keskeny, saját ablakban nyílik meg, amelyet az alkalmazás mellé vagy egy második monitorra tehet. Az ott lenyomott billentyűk az alkalmazáshoz jutnak. Az {{ui:Az eszközkészlet visszahelyezése}} vagy az ablak bezárása hazahozza.

Az eszköztár beállításai az eszközkészletre is érvényesek: {{ui:Beállítások}} › {{ui:Globális}} › {{ui:Eszköztár}} › {{ui:Ikonok és feliratok}}, {{ui:Csak ikonok}} vagy {{ui:Csak feliratok}}, valamint a {{ui:Csoportnevek megjelenítése (Fájl, Rajzolás, …)}}.

## A panelek az Öné maradnak

A bal és a jobb oldali panel megtartja mindazt, amit a [Panelek elrendezése](common:arrange-panels) leír: dokkolás, lebegtetés, rögzítés, elrejtés, lapok, {{ui:Áthelyezés új ablakba}} és {{ui:Elrendezés visszaállítása}}.

## Vissza a klasszikus elrendezéshez

Nyissa meg a {{ui:Beállítások}} › {{ui:Globális}} › {{ui:Elrendezés}} › {{ui:Munkaterület}} részt, és válassza a {{ui:CadCraft klasszikus}} lehetőséget. Minden eszköztár, lap és panel visszakerül oda, ahol volt.

:::note
Telefonon, vagy 760 képpont szélesnél nem szélesebb ablakban az alkalmazás a telefonos elrendezését használja, bármelyiket is választotta. Egy szélesebb ablak visszahozza az Ön elrendezését.
:::

Egy másik elrendezés kipróbálásához lásd [a szalag és projektböngésző elrendezést](common:layout-ribbon).
