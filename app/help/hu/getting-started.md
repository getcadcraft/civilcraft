---
title: Első lépések a CivilCrafttal
summary: Mit tud a CivilCraft, hogyan nyissa meg, és az első tíz perc a mintaterülettel: a pontoktól a szintvonalakig, egy útig és egy mentett projektig.
keywords: indítás, első indítás, mintaterület, bevezetés, gyors útmutató, oktatóanyag, kezdés, új projekt
from: c9b6dd8e
---

A CivilCraft a CadCraft-család építőmérnöki és terepi tervező alkalmazása. Mérési pontokból felületet (TIN-t) készít szintvonalakkal, majd lehetővé teszi nyomvonalak kijelölését tervezett hossz-szelvényekkel, egyszerű útsáv végigvezetését, tereplépcsők szintezését a tereppel való metszésig, egy gravitációs csőhálózat ellenőrzését az Ön szabályai szerint, valamint a bevágás és feltöltés térfogatának megtekintését. Olvassa és írja a LandXML-t, az alaprajzot DXF-ként exportálja, és PDF-be plottolja.

Ha használta a Civil 3D-t, az elvek ismerősek lesznek: pontok, ponthalmazok, töréselek, nyomvonalak töréspontok (PI) szerint, hossz-szelvények PVI-k szerint, sávok, tereprendezés, csőhálózatok. A munkamódszer más, és sokkal kisebb: nincs parancssor, nincsenek stílusok és nincs rajzfájl. Az első valódi munka előtt egyszer olvassa el a [Más építőmérnöki szoftverekből érkezőknek](topic:coming-from) témakört.

## Mire van szüksége

- Naprakész asztali böngésző: Chrome, Edge, Firefox vagy Safari. Lásd: [Böngészők](common:browsers).
- Egér vagy trackpad és billentyűzet, vagy érintőképernyő: a rajzoláshoz ott képernyőn megjelenő {{ui:Kész}}, {{ui:Pont visszavonása}} és {{ui:Mégse}} gombok állnak rendelkezésre (lásd [Egér, trackpad és érintés](topic:keyboard#mouse-trackpad-and-touch)).
- Az alaprajz 2D-ben rajzolódik a böngésző vásznán. A [3D nézet](topic:site-3d) a böngésző WebGL grafikáját használja; ha nem tud elindulni, az állapotsor megmondja, miért, és az alaprajz továbbra is működik.
- Nincs fiók és nincs feltöltés. A fájlok az Ön számítógépén nyílnak meg, és letöltésként mentődnek. Lásd: [Az Ön fájljai](common:your-files).

:::note
A CivilCraft ma még készülő, korai böngészős változatként fut. Asztali változat még nincs, felhőbe mentés sincs. Minden, amit készít, az Ön számítógépén marad, amíg nem menti vagy exportálja.
:::

## A CivilCraft megnyitása

1. Nyissa meg a CivilCraftot a böngészőben.
2. Várja meg, amíg a képernyő megtelik: felül egy eszköztár, balra egy panel, középen az alaprajz, jobbra pedig egy **Tulajdonságok** panel.
3. Az üres alaprajzon egy **Kezdje mérési pontokkal** című mező látszik. Felsorolja az első lépéseket, és van benne egy hivatkozás: {{ui:A mintaterület megnyitása}}.

Ha később kapcsolat nélkül szeretné használni a CivilCraftot, kattintson az alkalmazássávon a {{ui:Mentés offline használatra}} gombra, és várja meg az {{ui:Offline használatra kész}} feliratot. Ez tartalmazza ezt a súgót, a mintaterületet, valamint a 3D- és GIS-könyvtárakat. Lásd: [Offline](common:offline). Az {{key:F1}} megnyomásával vagy a {{ui:Súgó}} gombra kattintva bármikor megnyithatja ezt a súgót az alkalmazás mellett.

## Az első tíz perc: a mintaterület

A mintaterület egy kis felmérés amerikai lábban: 276 pont állami síkkoordinátákban, egy gerinc, egy mélyedés vízfolyásvonallal és két rézsűfelső él. Az alkalmazással érkezik, így saját fájl nélkül is követheti.

1. Kattintson az alaprajzon lévő mezőben az {{ui:A mintaterület megnyitása}} hivatkozásra.
   Megnyílik a **Pontok importálása** párbeszédpanel. Ezt írja: 276 pont beolvasva PNEZD formában (a fejlécsorból), vesszővel elválasztva, és mutatja az első sorokat.
2. Kattintson az {{ui:Importálás}} gombra.
   Az alaprajzot megtöltik a pontok, a szintvonalak és a felület széle. Az alul lévő állapotsor megmondja, hogy a pontok importálva lettek, és hány háromszöge van a felületnek (546).
3. Nézze meg a bal oldali panelen a **Pontok** alatti részt. A pontok a leírásuk első szava szerint vannak csoportosítva: CP, FL, GRD, RIDGE, TBN, TBS és TREE.
4. A táblázat **Felület** oszlopában állítsa az **FL**, **RIDGE**, **TBN** és **TBS** csoportot {{ui:Töréselő}}re.
   A felület azonnal újraépül. A **Felület** adatai most ezt mutatják: „Töréselek: 4”, a szintvonalak pedig élesen megtörnek a vízfolyásvonal és a gerinc mentén, ahelyett hogy átvágnának rajtuk.
5. Mozgassa az egérmutatót az alaprajz fölött. Az állapotsor megmutatja az egérmutató alatti keleti és északi értéket, valamint az ottani terepmagasságot.
6. A **Megjelenítés** alatt állítsa a {{ui:Szintvonalak minden}} értékét 0,5 ft-ra, és kapcsolja be a {{ui:Magassági sávok}} jelölőnégyzetet. A jelölőnégyzetek alatt színskála jelenik meg jelmagyarázattal. Ha végzett, kapcsolja ki újra a sávokat.

Most van egy meglévő terepfelülete. Következik egy út.

## Rövid út kijelölése

1. Nyomja meg az {{key:A}} billentyűt (vagy kattintson a **Tervezés** csoportban a {{ui:Nyomvonal}} gombra).
2. Kattintson a területen három pontra egymás után. Egy piros vonal követi az egérmutatót, és mutatja a következő egyenes szakasz hosszát és irányszögét.
3. A befejezéshez nyomja meg az {{key:Enter}} billentyűt.
   A nyomvonal szelvényezéssel jelenik meg. A jobb oldali panel a **Nyomvonal** adatait mutatja: hosszát, a PI-táblázatot és a középső PI ívét (100 ft sugár, vagy kisebb, ha a 100 ft nem fér el).
4. A jobb oldali panelen a **Tervezett hossz-szelvény** alatt kattintson a {{ui:Kezdés a terepről}} gombra.
   A hossz-szelvény nézet megnyílik az alaprajz alatt a meglévő terepvonallal és egy végigmenő egyenes tervezett eséssel.
5. Nyomja meg az {{key:I}} billentyűt a {{ui:PVI-k hozzáadása}} bekapcsolásához, majd kattintson egyszer a hossz-szelvény nézetben a közepe táján. Megjelenik egy PVI.
6. A jobb oldali PVI-táblázatban írjon be egy ívhosszt (például 100) a középső PVI **Ív L** mezőjébe, és nyomja meg az {{key:Enter}} billentyűt. A hossz-szelvénynek most függőleges íve van, a K értékével felirattal.
7. A **Sáv** alatt jelölje be a **Szerkezet végigvezetése a tervezett hossz-szelvény mentén** lehetőséget.
   Az út belesimul a terepbe: sávok, padkák és rézsűk a terepmetszésig. A **Földmunka** blokk mutatja a bevágást és a feltöltést.

Ne aggódjon a pontos értékek miatt. Minden szám módosítható a jobb oldali panelen, a {{key:Mod+Z}} pedig visszavonja az utolsó módosítást.

## A munka mentése

1. Írjon be egy nevet a bal oldali panel tetején a **Név** mezőbe.
2. Nyomja meg a {{key:Mod+S}} billentyűkombinációt (vagy kattintson a {{ui:Mentés}} gombra).
   A böngésző letölt egy fájlt, amely a területről kapta a nevét, és `.civilcraft.json` végződésű. Tartalmazza a pontokat, a felület beállításait, a nyomvonalakat, hossz-szelvényeket, sávokat, tereplépcsőket és csöveket.
3. A folytatáshoz később kattintson a {{ui:Megnyitás}} gombra (vagy nyomja meg a {{key:Mod+O}} billentyűkombinációt), és válassza ki azt a fájlt, vagy ejtse az alaprajzra.

:::warning
Nincs automatikus mentés. Ha mentetlen módosításokkal bezárja a lapot, a böngésző rákérdez, hogy elhagyja-e; ha elhagyja, a módosítások elvesznek. Mentsen gyakran.
:::

## Merre tovább

- [Mérési pontok importálása](topic:import-points) a saját fájljaival.
- [A felület felépítése és finomítása](topic:build-surface) töréselekkel és határvonallal.
- [A képernyő részenként](topic:workspace).
- [Billentyűk és egér](topic:keyboard).
