---
title: Munka a szalag és projektböngésző elrendezésben
summary: Kapcsolja át az alkalmazást a rajz fölötti lapos szalagra, a bal oldalon a Tulajdonságokkal és egy projektböngészővel, minden megnyitott nézethez egy lappal, és bármikor visszaválthat a klasszikus elrendezésre.
keywords: elrendezés, munkaterület, szalag, szalaglapok, projektböngésző, böngésző, paletták, tulajdonságpaletta, nézetlapok, állapotsor, gyorselérés, szalag összecsukása, szalag minimalizálása, szalagablak, klasszikus elrendezés, elrendezés módosítása, elrendezés váltása, dokkolt
from: c1a6eccc
---

A **Szalag és projektböngésző** az alkalmazás három munkaterület-elrendezésének egyike. Felül egy lapokból álló szalag fut végig, a Tulajdonságok és egy projektböngésző osztozik a bal oldali panelen, minden megnyitott nézet kap egy lapot a rajz fölött, alul pedig egy állapotsor áll. Az eszközök az alkalmazás saját eszközei: minden, amit a klasszikus elrendezésben megtehet, itt is működik, a rajza, a menüstílusa és a billentyűi pedig változatlanok maradnak.

## Kiválasztás

1. Nyissa meg a {{ui:Beállítások}} ablakot (a fogaskerék, vagy {{key:Mod+,}}).
2. Válassza a {{ui:Globális}} lapot, majd lépjen az {{ui:Elrendezés}} › {{ui:Munkaterület}} részhez.
3. Válassza a {{ui:Szalag és projektböngésző}} lehetőséget.

Az elrendezés azonnal változik. A választás minden alkalmazásra egy közös érték ebben a böngészőben: innentől minden alkalmazás ebben nyílik meg, és az oldal kirajzolása előtt már érvényben van, így soha nem látja előbb a klasszikus elrendezést.

## Mi hol van

- **Címsor:** az alkalmazás neve, a gyorselérési gombok (megnyitás, mentés, visszavonás, ismétlés), a megnyitott fájl neve, a {{ui:Mit tesz itt az egyes eszköz}} (az összes eszköz listája kereséssel, amely megmondja, melyek használhatók most, és miért nem a többi), a teljes képernyő, a {{ui:Súgó}} és a {{ui:Beállítások}}. Ebben az elrendezésben a címsor az alkalmazássáv helyét veszi át.
- **Szalag:** az alkalmazás eszközei lapokon, minden lap csoportokra osztva. A bal oldali {{ui:Fájl}} megnyitja, elmenti és így tovább. Egyes alkalmazások saját lapot adnak hozzá, amikor egy adott módban vagy munkaterületen dolgozik; amíg érvényes, ki van világítva, utána eltűnik.
- **Beállítássáv:** a szalag alatt, amit a futó eszköz kér Öntől, vagy ami ki van jelölve.
- **Bal oldali panel:** felül a {{ui:Tulajdonságok}}, alatta a paletták (a projektböngésző és a panel saját tartalma) lapokként. Húzza a közöttük lévő vonalat a hely elosztásához.
- **Nézetlapok:** egy lap minden megnyitott nézethez (rajzlap, alaprajz, jelenet…). Zárja be az egyiket a bezárógombjával; a fájl nyitva marad.
- **Nézetsáv és állapotsor:** a rajz alatt a nézet saját vezérlői (lépték, nagyítás); alul az alkalmazás üzenetei.

Az az eszköz, amely éppen nem futtatható, szürke, és az elemleírása megmondja, miért (például „Előbb nyisson meg egy fájlt”, vagy hogy az alkalmazásban még nincs meg az az eszköz). Kattintson rá, vagy nyomja meg rajta az {{key:Enter}} billentyűt, hogy az okot egy ablakban elolvashassa.

## A szalag használata billentyűzettel

Fókuszált szalaglapnál a {{key:Left}} és a {{key:Right}} lapok között lép, a {{key:Home}} és az {{key:End}} az elsőre, illetve az utolsóra ugrik. Az {{key:Esc}} előbb a futó eszközt fejezi be, mint a klasszikus elrendezésben, és minden billentyűparancs, valamint a {{key:Ctrl+Shift+F}} (képernyőmódok) a korábbiak szerint működik.

## A szalag összecsukása vagy saját ablakba tétele

- Kattintson duplán egy szalaglapra, hogy a szalag a lapjaira záruljon; a lapra kattintva ezután megjelennek az eszközei, amíg tovább nem lép. Dupla kattintással ismét nyitva tarthatja. A szalag jobb végén lévő {{ui:A szalag mozgatása}} gombon is megtalálható az {{ui:A szalag összecsukása}} és az {{ui:A szalag nyitva tartása}}. Minden alkalmazás megjegyzi.
- A {{ui:A szalag mozgatása}} › {{ui:Áthelyezés új ablakba}} saját ablakba teszi a szalagot, például egy második monitorra. Az ott lenyomott billentyűk az alkalmazáshoz jutnak. Az {{ui:A szalag visszahelyezése}} vagy az ablak bezárása hazahozza.

Az eszköztár beállításai a szalagra is érvényesek: {{ui:Beállítások}} › {{ui:Globális}} › {{ui:Eszköztár}} › {{ui:Ikonok és feliratok}}, {{ui:Csak ikonok}} (a szalag ilyenkor csoportonként két sor kis ikont mutat) vagy {{ui:Csak feliratok}}, valamint a {{ui:Csoportnevek megjelenítése (Fájl, Rajzolás, …)}}.

## A panelek az Öné maradnak

A bal és a jobb oldali panel megtartja mindazt, amit a [Panelek elrendezése](common:arrange-panels) leír: dokkolás, lebegtetés, rögzítés, elrejtés, lapok, {{ui:Áthelyezés új ablakba}} és {{ui:Elrendezés visszaállítása}}.

## Vissza a klasszikus elrendezéshez

Nyissa meg a {{ui:Beállítások}} › {{ui:Globális}} › {{ui:Elrendezés}} › {{ui:Munkaterület}} részt, és válassza a {{ui:CadCraft klasszikus}} lehetőséget. Minden eszköztár, lap és panel visszakerül oda, ahol volt.

:::note
Telefonon, vagy 760 képpont szélesnél nem szélesebb ablakban az alkalmazás a telefonos elrendezését használja, bármelyiket is választotta. Egy szélesebb ablak visszahozza az Ön elrendezését.
:::

Egy másik elrendezés kipróbálásához lásd [az eszközkészlet és infódoboz elrendezést](common:layout-toolbox).
