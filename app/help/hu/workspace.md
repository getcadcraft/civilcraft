---
title: A képernyő részenként
summary: Körséta a CivilCraft minden sávján és paneljén a képernyőn látható nevükkel, az eszköztártól az állapotsorig.
keywords: felület, képernyő, eszköztár, panelek, tulajdonságok, állapotsor, hossz-szelvény nézet, elrendezés, körséta, ui
from: 76272010
---

A CivilCraftnak egyetlen képernyője van. Nincsenek lapok és nincsenek elrendezések. Az oldalpanelek mozgathatók, lebegtethetők vagy külön ablakba vihetők: lásd [A panelek elrendezése és második monitor használata](common:arrange-panels). Fentről lefelé és balról jobbra:

- az **alkalmazássáv** (CadCraft jele, az alkalmazás neve, verzió, Névjegy, képernyőmód, Súgó, Mentés offline használatra, Papír és Modell)
- az **eszköztár** hét gombcsoporttal
- a **bal oldali panel**: Terület, Pontok, Felület, Megjelenítés, és az első importálás után GIS-rétegek
- az **alaprajz** középen, alatta a **hossz-szelvény nézettel**, ha nyitva van
- a **jobb oldali panel**: a kijelölt dolog tulajdonságai
- az **állapotsor** alul

## Alkalmazássáv

A legfelső vékony sáv a CadCraft webhelyhez tartozik, nem magához a CivilCrafthoz.

- A verziómenü megmutatja, melyik buildet futtatja.
- A {{ui:A CivilCraft névjegye}} megnyitja az alkalmazás oldalát a webhelyen.
- A {{ui:Teljes képernyő}} a képernyőmódok között lépked: teljes képernyő, majd teljes képernyő elrejtett sávokkal, majd vissza a normálhoz. A {{key:Ctrl+Shift+F}} minden platformon ugyanezt teszi, Macen is (ott a Control billentyű, nem a Command). Elrejtett sávoknál a visszahozásukhoz vigye az egérmutatót a felső szélhez.
- A {{ui:Súgó}} (vagy az {{key:F1}}) oldalpanelen nyitja meg ezt a súgót; az {{key:F1}} vagy az {{key:Esc}} bezárja.
- A {{ui:Mentés offline használatra}} ebben a böngészőben tartja a CivilCraftot, hogy kapcsolat nélkül is megnyíljon; ekkor az {{ui:Offline használatra kész}} látszik. Lásd: [Megnyitható, menthető és exportálható fájlok](topic:files#online-and-offline).
- A {{ui:Papír}} és a {{ui:Modell}} a világos és a sötét téma között vált. Az alaprajz és a hossz-szelvény követi a témát; a PDF-ek mindig fehéren nyomtatódnak.

## Eszköztár

Minden csoport felett egy kis felirat van a gombjai fölött. Vigye az egérmutatót egy gombra az elemleíráshoz és a billentyűhöz.

| Csoport | Gombok | Mit csinálnak |
|---|---|---|
| Fájl | {{ui:Új}}, {{ui:Megnyitás}}, {{ui:Mentés}} | Újrakezdés, pontfájl, LandXML vagy projekt megnyitása, a projekt mentése letöltésként |
| Exportálás | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | LandXML 1.2, az alaprajz R12 DXF-je vagy DWG-je írása, vagy az alaprajz plottolása PDF-be |
| Felület | {{ui:Töréselő}}, {{ui:Határvonal}} | Töréselő rajzolása mérési pontokon át; a külső határvonal rajzolása |
| Tervezés | {{ui:Nyomvonal}}, {{ui:Tereplépcső}}, {{ui:Csövek}}, {{ui:Hossz-szelvény}} | Nyomvonal, tereplépcső, csőszakasz rajzolása; a hossz-szelvény nézet megjelenítése vagy elrejtése |
| Szerkesztés | {{ui:Visszavonás}}, {{ui:Ismétlés}}, {{ui:Másolás}}, {{ui:Beillesztés}}, {{ui:Továbbiak}} | Mérési pontok visszavonása, ismétlése, másolása és beillesztése; a {{ui:Továbbiak}} tartalmazza a Kivágás, Beillesztés helyben, Kettőzés, Törlés, Összes pont kijelölése és Kijelölés megszüntetése parancsot |
| GIS | {{ui:Koordináták}}, {{ui:Importálás}}, {{ui:Exportálás}}, {{ui:Térkép}} | A koordináta-rendszer beállítása, GIS-fájlok importálása és exportálása, térképrétegek megjelenítése az alaprajz alatt |
| Nézet | {{ui:Kijelölés}}, {{ui:Illesztés}}, {{ui:3D}} | Dolgok kijelölése és mozgatása; nagyítás mindennek megjelenítéséhez; a terület megjelenítése 3D-ben ([A terület megtekintése 3D-ben](topic:site-3d)) |

A rajzeszköz addig marad lenyomva, amíg aktív. Újbóli kattintás rá, az {{key:Esc}} vagy a {{key:V}} megnyomása visszatér a {{ui:Kijelölés}} eszközhöz. A {{ui:Visszavonás}}, az {{ui:Ismétlés}}, a {{ui:Másolás}} és a {{ui:Továbbiak}} elemei szürkék, ha nem tudnak működni; az elemleírás megmondja, miért (például „Előbb jelöljön ki mérési pontokat”). Minden gomb fel van sorolva az [Eszköztár referenciában](topic:toolbar).

Keskeny ablakban az eszköztár oldalra görgethető.

## Bal oldali panel

### Terület

- **Név**: a projekt neve. Ez nevezi el minden mentett vagy exportált fájlt, és a PDF címsávjában is megjelenik.
- **Mértékegységek**: {{ui:Amerikai láb}} vagy {{ui:Méter}}. Ez mondja meg, mit jelentenek a számok. Módosítása **nem** konvertálja a koordinátákat; lásd [Mértékegységek, szelvényszámok és számformátumok](topic:units-and-stations).

### Pontok

Üresen megmondja, hogyan nyisson meg pontfájlt. Pontokkal megmutatja a fájl nevét, a pontok számát és hogy hánynak van magassága, majd a **ponthalmazok** táblázatát: a leírás első szavánként egy sor (GRD, FL, TBS …), darabszámmal és egy **Felület** választással:

- {{ui:Pont}}: a pontok bekerülnek a felületbe (minden csoport alapértelmezése).
- {{ui:Töréselő}}: a csoport pontjait a pontszám sorrendjében egy töréselővé köti.
- {{ui:Kihagyva}}: a csoport nem érinti a felületet.

### Felület

A meglévő terep adatai: pontok, háromszögek, legalacsonyabb és legmagasabb magasság, átlagmagasság, 2D és 3D terület, töréselek, és hogy van-e határvonal. Az adatok alatt egy mező felsorol mindent, amit a felületépítőnek javítania kellett, vagy nem tudott elvégezni. Majd:

- **Leghosszabb külső él**: a 0 minden külső háromszöget megtart; egy szám a hosszú, vékony háromszögeket levágja a külsőről.
- Hivatkozások, amelyek akkor jelennek meg, ha érvényesek: {{ui:A határvonal eltávolítása}}, {{ui:Rajzolt töréselek eltávolítása}}, és a LandXML-ből beolvasott felületnél {{ui:A felület újraépítése a pontokból}}.

### Megjelenítés

- **Felület**: {{ui:Meglévő terep}} vagy {{ui:Tervezett (szintezett)}}. A második akkor érhető el, ha egy tereplépcső vagy sáv probléma nélkül szintez.
- **Szintvonalak minden**, **Főszintvonal minden** és **Sávok** (a színsávok száma).
- Jelölőnégyzetek: {{ui:Szintvonalak}}, {{ui:Szintvonalfeliratok}}, {{ui:Háromszögek}}, {{ui:Magassági sávok}}, {{ui:Lejtésnyilak}}, {{ui:Pont}}, {{ui:Pontfeliratok}}, {{ui:Töréselek}}, {{ui:Felület széle}}, {{ui:Csövek}}.
- A sávmagasságok jelmagyarázata megjelenik, ha a sávok be vannak kapcsolva.

A megjelenítési beállítások a projekttel mentődnek, de nem visszavonási lépések: a {{key:Mod+Z}} sosem kapcsol vissza jelölőnégyzetet.

## Alaprajz

Az alaprajz a pontokat, a felületet és mindent, amit tervez, felülnézetben mutatja, északkal felfelé. A görgő az egérmutatónál nagyít, az üres területen húzás eltol. A teljes lista a [Billentyűk és egér](topic:keyboard) témakörben van.

- Üres projektnél egy **Kezdje mérési pontokkal** című mező felsorolja az első lépéseket, és felkínálja az {{ui:A mintaterület megnyitása}} lehetőséget.
- Amíg egy rajzeszköz aktív, az alaprajz tetején egy tipp megmondja, mire kattintson és hogyan fejezze be.
- Ha egy fájlt az alaprajz fölé húz, ez látszik: „Ejtsen ide pontfájlt, LandXML-t vagy projektet”.
- A kijelölt dolgok ki vannak emelve. A kijelölt nyomvonalnak vagy tereplépcsőnek négyzetes fogópontjai vannak a PI-in vagy a sarkain; a kijelölt műtárgynak egy fogópontja van. Húzza a fogópontot a mozgatáshoz.
- A kijelölt mérési pontok körül gyűrű van. A {{key:Shift}} és egy kattintás hozzáad vagy eltávolít egy pontot; a {{key:Shift}} és egy húzás dobozt rajzol (vagy, ha körbehúzza őket, lasszót), amely hozzáadja a benne lévő pontokat. Lásd: [Mérési pontok kijelölése, másolása és beillesztése](topic:copy-paste-points).

## Hossz-szelvény nézet

Az {{key:R}} megnyomásával vagy a {{ui:Hossz-szelvény}} gombra kattintva megnyithatja az alaprajz alatt. A sávján van:

- egy nyomvonallista (akkor engedélyezett, ha két vagy több nyomvonal van)
- {{ui:PVI-k hozzáadása}}: amíg le van nyomva, a hossz-szelvényben kattintva PVI-t ad hozzá (az {{key:I}} kapcsolja)
- egy kijelzés az egérmutató alatti szelvényszámról, terepről, tervezett magasságról, esésről és bevágásról vagy feltöltésről
- egy bezáró gomb

A hossz-szelvény mutatja a meglévő terepet, a tervezett hossz-szelvényt, az egyes egyenes szakaszok esését, az egyes PVI-k szelvényszámát és magasságát, az egyes függőleges ívek L és K értékét a BVC és EVC ponttal, a magas és mély pontokat, és a függőleges túlmagasítást. Mindig az egész nyomvonalhoz illeszkedik: nem nagyítható és nem tolható el. Az egérmutató mozgatása rajta egy pontot tesz a nyomvonalra az alaprajzon.

## Jobb oldali panel: Tulajdonságok

A címsora megmondja, mit mutat.

- **Projekt** (nincs kijelölve semmi): a nyomvonalak és tereplépcsők hivatkozásként, a **Földmunka** blokk, valamint a **Csőhálózat** blokk a szabályaival és problémáival.
- **Nyomvonal**: név, kezdő szelvényszám, hossz, a PI-táblázat, az ívek, a tervezett hossz-szelvény PVI-táblázata és adatai, valamint a **Sáv** beállításai.
- **Tereplépcső**: név, magasság, bevágási és feltöltési rézsű, terület, a terepmetszés adatai és a földmunka.
- **Műtárgy** vagy **Cső**: méretek, fedlapmagasságok, fenékszintek, esés, takarás és az esetleges problémák.
- **Pont** és a száma: a pont koordinátái, magassága, leírása és csoportja (csak olvasható).

A mezők az {{key:Enter}} megnyomásakor vagy a mező elhagyásakor lépnek érvénybe. Az el nem fogadott érték érvénytelenként van jelölve, és semmi nem változik.

## Állapotsor

- **E** és **N**: az egérmutató alatti keleti és északi érték.
- Az ottani **Terep** magasság (és a **Szintezett**, ahol egy tereplépcső vagy sáv módosította), vagy „A felületen kívül”.
- A legközelebbi (vagy a kijelölt) nyomvonal az egérmutató alatti **Szelvényszám** és eltolás (**L** vagy **R**) értékkel.
- Jobbra üzenetek: mi történt éppen, vagy miért utasítottak vissza valamit. Az üzenet néhány másodperc múlva elmúlik.

## Párbeszédpanelek

- **Pontok importálása**: minden pontfájlnál megnyílik. Lásd: [Mérési pontok importálása](topic:import-points).
- **Az alaprajz plottolása PDF-be**: lásd [Az alaprajz plottolása PDF-be](topic:plot-pdf).
- **Nem mentett módosítások**: rákérdez, mielőtt az {{ui:Új}} vagy egy projekt- vagy LandXML-fájl megnyitása eldobná a mentetlen munkát. A {{ui:Másolat mentése}} előbb letölti a projektet.

## Kis képernyők

Legfeljebb 760 képpont szélességig, például telefonon, az alaprajz tartja a képernyőt: az eszköztár egyetlen, oldalra görgethető sor, a panelek pedig lapokként nyílnak az alul lévő sávról. Az {{ui:Eszközök}} elrejti az eszköztárat, a {{ui:Mozgatás}} pedig lehelyezi alulra.
