---
title: Panelek elrendezése és második monitor használata
summary: Dokkolja az oldalsó paneleket balra, jobbra vagy alulra, halmozza őket, csoportosítsa lapokként, rögzítse vagy rejtse el őket, lebegtesse a rajz fölött, sűrítse az elrendezést, adja meg, hány sorban legyen az eszköztár, vagy helyezze őket saját ablakba egy másik képernyőn.
keywords: panelek, dokkolás, lebegtetés, panel áthelyezése, húzás, elrendezés, lapok, lapcsoport, halmozás, rögzítés, automatikus elrejtés, panel elrejtése, panel bezárása, kompakt, elrendezés sűrűsége, sűrű, eszköztársorok, tördelés, 1 sor, 2 sor, eszköztársak, második monitor, két képernyő, kettős monitor, több monitor, ablak, felugró ablak, elrendezés visszaállítása
from: 49530239
---

A rajz melletti panelek áthelyezhetők. Helyezze őket oda, ahol jól használhatók, vagy adjon nekik saját ablakot egy második monitoron, hogy a rajz az első monitor teljes területét megkapja.

:::note
Minden panelnek van címsora: vékony sáv a panel nevével, egy {{ui:⋯}} menüvel, rögzítő gombbal és bezáró gombbal a panel tetején. A 0.7 előtti verziókban csak a név és a {{ui:⋯}} menü található.
:::

## Panel mozgatása az ablakban

1. Húzza a panelt a nevénél fogva a tetején.
2. Húzás közben a rajz bal, jobb és alsó szélén körvonalú területek jelennek meg. Engedje el a panelt valamelyiken, hogy ott dokkolódjon. A terület, amely fölött van, sötétebb lesz.
3. Engedje el a rajz bármely más pontja fölött, hogy lebegjen.

A panelek osztozhatnak egy oldalon: egymásra halmozódnak, és a két panel közötti minden vonal húzásával elosztható a hely (ha a vonal fókuszban van, a nyílbillentyűk mozgatják, a dupla kattintás pedig egyenlően osztja el a helyet). A dokkolt oldal belső szélének húzásával szélesíthető vagy keskenyíthető; a szél dupla kattintásával visszaáll.

A lebegő panel a rajz fölött marad. Nevénél fogva mozgassa, méretét a jobb alsó sarkának húzásával változtassa (vagy lépjen a sarokhoz a {{key:Tab}} billentyűvel, és használja a nyílbillentyűket). A nevére duplán kattintva visszadokkolhatja oda, ahol volt.

:::touch
Egy ujjal húzza a panel nevénél fogva. Egy lebegő panel jobb alsó sarkát egy ujjal húzva méretezheti át, a dokkolt panelek közötti szegélyeket ugyanígy. Dokkoláshoz vagy lebegtetéshez húzás nélkül használja a {{ui:⋯}} menüt.
:::

## Panelek csoportosítása lapokként

Két panel is osztozhat egy kereten, és egyszerre csak az egyik látszik. Húzza a panelt a nevénél fogva egy másik panel címsorára (a sáv körvonalat kap, amíg fölötte van), majd engedje el: a keret címsorában minden panelhez lap tartozik. Kattintson egy lapra a panel megjelenítéséhez. Ha egy lap fókuszban van, a {{key:Left}} és {{key:Right}} billentyűk váltanak lapot, a {{key:Home}} és {{key:End}} pedig az első, illetve az utolsó lapra ugrik.

A panelt a csoportból a panel {{ui:⋯}} menüjében a {{ui:Kivétel a lapcsoportból}} parancsával veheti ki, vagy húzhatja máshová. A {{ui:Lapként csoportosítás}} parancs és egy panel nevének kiválasztásával húzás nélkül csoportosíthatja őket.

## Rögzítés, elrejtés és visszahozás

- A panel címsorában lévő rögzítő gomb **automatikus elrejtést** kapcsol be: a panel elhagyja a dokkolt helyét, és a szélen egy kis lapként marad. Vigye rá az egeret a laphoz, fókuszálja vagy kattintson rá, és a panel a rajz fölé csúszik; ha elmozdul tőle (vagy megnyomja az {{key:Esc}} billentyűt), visszacsúszik. A rögzítő gombot újra megnyomva vagy a {{ui:Rögzítés feloldása}} parancs kiválasztásával véglegesen dokkolhatja.
- A bezáró gomb, vagy a menüben a {{ui:A panel elrejtése}} parancs elrejti a panelt, és összecsukja a dokkja helyét. A szélen egy szaggatott lap hozza vissza: kattintson rá, vagy fókuszálja, és nyomja meg az {{key:Enter}} billentyűt.

## Az elrendezés sűrítése

{{ui:Beállítások}} › {{ui:Általános}} › {{ui:Elrendezés sűrűsége}} két lehetőséget kínál. Az alapértelmezett a {{ui:Kényelmes}}. A {{ui:Kompakt}} szűkíti a sorok magasságát, a panelek belső margóit, az eszköztár gombjait és a panelszöveget az adott alkalmazásban, hogy több férjen a képernyőre. A beállítás alkalmazásonként marad meg. Érintőképernyőn mindkét esetben megmaradnak a nagy gombok, a telefon pedig a saját elrendezését tartja meg. Az {{ui:Elrendezés visszaállítása}} nem változtatja meg a beállított sűrűséget.

## Az eszköztár sorainak számának megadása

{{ui:Beállítások}} › {{ui:Általános}} › {{ui:Eszköztársorok}} három lehetőséget kínál. Az alapértelmezett a {{ui:Tördelés}}: minden eszközcsoport megjelenik, annyi sorban, amennyi szükséges. A {{ui:2 sor}} az eszköztárat két sorra korlátozza, az {{ui:1 sor}} egy sorra, így a rajznak több magasság jut; a nem férő csoportok az eszköztáron belül oldalra görgethetők (az egér görgőjével, kétujjas húzással vagy a {{key:Tab}} billentyűvel egy eszközig). Az az eszköztár, amely két sorban már elfér, a {{ui:2 sor}} beállítás mellett nem változik, mert a rács csak magasabbá tenné. A beállítás alkalmazásonként marad meg. Az érintőképernyő és a telefon a saját elrendezését tartja meg. A CadCraft az eszköztárához külön beállítással rendelkezik, a {{ui:Beállítások}} › {{ui:CadCraft}} alatt.

## Billentyűzet használata

Minden panel {{ui:⋯}} gombja menüt nyit: {{ui:Dokkolás balra}}, {{ui:Dokkolás jobbra}}, {{ui:Dokkolás alulra}}, {{ui:Lebegtetés a rajz fölött}}, {{ui:Rögzítés a szélhez}}, {{ui:A panel elrejtése}}, {{ui:Lapként csoportosítás}} egy másik panellel, {{ui:Áthelyezés új ablakba}} és {{ui:Visszahelyezés}}. Lépjen a gombra a {{key:Tab}} billentyűvel, nyomja meg az {{key:Enter}} billentyűt, mozogjon a nyílbillentyűkkel, majd nyomja meg újra az {{key:Enter}} billentyűt. Az {{key:Esc}} bezárja a menüt.

## A panelek második monitorra helyezése

1. Válassza egy panel {{ui:⋯}} gombját, majd a {{ui:Minden panel áthelyezése új ablakba}} parancsot. A {{ui:Beállítások}} menüben is választhatja a {{ui:Panelek áthelyezése új ablakba}} parancsot.
2. Kis ablak nyílik meg a panelekkel. Húzza a másik monitorra, és tegye akkorára, amekkorára szeretné.
3. Dolgozzon tovább: a panelek ugyanúgy hatnak a rajzra, a rajz pedig a főablakot tölti ki.

A gyorsbillentyűk a panelablak előterében is működnek: a panelablakban leütött billentyűk a rajzhoz jutnak, kivéve, ha szövegdobozba írnak. Az alkalmazás kérdései és párbeszédpanelei továbbra is a főablakban nyílnak meg, ezért nézzen oda, ha megjelenik egy. A téma és a panelek szövegmérete a főablakot követi.

:::chromium
A Chrome és az Edge maga is elhelyezheti az ablakot a másik képernyőn. Ha van csatlakoztatott második képernyő, a panelablakban válassza a {{ui:Áthelyezés a másik képernyőmre}} parancsot (vagy a panel {{ui:⋯}} menüjében a {{ui:A panelek a másik képernyőmre}} parancsot). A böngésző egyszer megkérdezi, hogy az oldal láthatja-e a képernyőit; ha engedélyezi, a panelablak minden alkalommal azon a képernyőn nyílik meg.
:::

:::firefox safari
Húzza a panelablakot a másik monitorra magától. Legközelebb ugyanazon a helyen és ugyanekkora méretben nyílik meg.
:::

## Több panelablak

Minden panelnek lehet saját ablaka: legfeljebb négy panelablak van, például monitoronként egy.

- A panel {{ui:⋯}} menüjében a {{ui:Áthelyezés új ablakba}} parancs új ablakot nyit az adott panelnek, az {{ui:Áthelyezés a 2. panelablakba}} (és így tovább) pedig egy már nyitott ablakba helyezi át. A második ablak neve „panels 2”.
- Húzza a panelt a nevénél fogva egyik ablakból a másikba: ha a főablak fölött engedi el, ott dokkolódik (a körvonalas területek látszanak, amíg fölötte van), vagy lebeg; ha egy másik panelablak fölött engedi el, oda kerül át. Bárhol máshol elengedve a panel marad, ahol volt.
- Az a panelablak, amelyben már nincs panel, magától bezárul.

Újratöltés után az alkalmazás újra felajánlja a panelablakait. A böngészők kattintásonként egy ablakot nyitnak meg, ezért minden ablakhoz egyszer válassza az {{ui:A következő megnyitása}} parancsot.

## Az elrendezés minden részére ugyanígy

A szalag, az eszközkészlet, az eszköztársorok és az állapotsor ugyanúgy kap saját ablakot, mint egy panel: nyissa meg a részen lévő {{ui:⋯}} menüt, és válassza az {{ui:Áthelyezés új ablakba}} parancsot. A {{ui:Visszahelyezés}} (vagy az ablak bezárása) visszahozza a helyére. A rész ablakában leütött billentyűk az alkalmazáshoz jutnak, ahogy a panelablakból is. Minden résznek egy ilyen menüje van.

## Párbeszédpanel mozgatása

Minden párbeszédpanel kimozdítható a rajz elől: nyomja meg és húzza a címsorát. A párbeszédpanel megjegyzi, hol hagyta, mindegyik külön, és a következő megnyitáskor oda tér vissza. A címsorára duplán kattintva újra középre kerül.

A billentyűzetről, ha a fókusz a párbeszédpanelen van, nyomja meg az {{key:Alt}}+{{key:Shift}} és egy nyílbillentyű kombinációját: így 16 pixelenként mozog. Az {{key:Ctrl}} hozzáadásával 64 pixelenként. A képernyőn kívülre került párbeszédpanel (kisebb ablak vagy képernyő után) visszakerül.

Telefonon a párbeszédpanelek teljes szélességű lapok maradnak, és nem mozgathatók.

A CadCraft Studio-ban a CadCraft {{ui:Plottolás PDF-be}} párbeszédpanelének, amelyet munka közben nyitva tarthat, van egy gombja a címsorában: {{ui:Megnyitás saját ablakban}}. A párbeszédpanel saját ablakba kerül, amelyet egy másik monitorra tehet. A párbeszédpanel bezárása bezárja az ablakot, az ablak bezárása pedig a párbeszédpanelt.

## A panelek visszahelyezése

- Válassza a {{ui:A panelek visszahelyezése}} parancsot a panelablakban, vagy egyszerűen zárja be. A panelek visszakerülnek a helyükre.
- A főablak bezárása vagy újratöltése a panelablakot is bezárja. Amikor az alkalmazás újra megnyílik, jelzi, hogy a panelek saját ablakban voltak; válassza a {{ui:Megnyitás}} parancsot az ablak visszahozásához, vagy a {{ui:Maradjanak itt}} parancsot.
- A {{ui:Beállítások}} › {{ui:Általános}} › {{ui:Elrendezés visszaállítása}} minden panelt oda helyez vissza, ahol kezdetben volt.

:::tip
Ha a panelek új ablakba helyezésekor nem nyílik meg semmi, a böngésző blokkolta a felugró ablakot. Az alkalmazás jelzi ezt, és a panelek a helyükön maradnak. Engedélyezze a felugró ablakokat a getcadcraft.com oldalon, majd próbálja újra.
:::

Az elrendezés alkalmazásonként, ebben a böngészőben marad meg a többi beállítással együtt.
