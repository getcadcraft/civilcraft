---
title: Fájlok, amelyeket megnyithat, menthet és exportálhat
summary: Pontfájlok, LandXML és CivilCraft-projektek be; projektek, LandXML, DXF és PDF ki; mit őriz meg mindegyik, hová kerülnek a fájlok, és mi változik offline módban.
keywords: megnyitás, mentés, exportálás, importálás, fájlformátumok, csv, txt, landxml, xml, dxf, pdf, json, letöltés, projektfájl
from: a7debb61
---

A CivilCraft a számítógépéről nyitja meg a fájlokat, a mentés pedig a fájlok letöltésével történik vissza oda. Semmit nem tölt fel, és szerveren sem tárol semmit. Lásd még: [Saját fájlok](common:your-files).

## Mit nyit meg

Kattintson a {{ui:Open}} gombra (vagy nyomja meg a {{key:Mod+O}} billentyűkombinációt), és válasszon ki egy fájlt, vagy húzza a fájlt a {{pick:mac=Finder|windows=Fájlkezelő|linux=fájlkezelő}} ablakából az alaprajzra. Egyszerre egy fájl; a 200 MB-nál nagyobb fájlokat a program nem fogadja el.

| Típus | Fájlnevek | Mi történik |
|---|---|---|
| Pontfájl | `.csv`, `.txt`, `.pnt`, `.xyz` (bármely szövegfájl) | Megnyílik a **Pontok importálása** párbeszédpanel. A pontok lecserélik a projekt pontjait; a nyomvonalak, a tereplépcsők és a csövek megmaradnak. |
| LandXML | `.xml`, `.landxml` | A fájlból **új projekt** jön létre (ha az aktuális projektnek vannak nem mentett módosításai, a program előbb rákérdez). |
| CivilCraft-projekt | `.civilcraft.json` (bármely `.json`) | A projekt úgy nyílik meg, ahogy el lett mentve (ha az aktuális projektnek vannak nem mentett módosításai, a program előbb rákérdez). |

A CivilCraft a fájl kiterjesztése alapján dönt, majd az első karakterei alapján: a `{` karakterrel kezdődő szöveget projektként, a `<` karakterrel kezdődőt LandXML-ként, minden mást pontfájlként olvas be. A megnyitó ablakban szürkítve megjelenő fájl is ráhúzható az alaprajzra.

:::note
Ha olyan projektbe importál pontfájlt, amelyben már vannak pontok, a program rákérdezés nélkül lecseréli azokat, és törli a visszavonási előzményeket (bármely fájl megnyitása új kezdést jelent a visszavonás szempontjából). Ha a felület LandXML-ből származik, a pontok importálása visszaváltja a felületet a pontokból készített felületre. Ha szüksége lehet a régi pontokra, előbb mentsen.
:::

Részletek: [Pontfájl-formátumok](topic:point-file-formats), [LandXML: mit olvas be és mit ír ki](topic:landxml-reference).

## Mit ment

A {{ui:Save}} ({{key:Mod+S}}) két fájlt ment egymás mellé, a bal oldali panel **Név** mezője alapján elnevezve: `<name>.civilcraft.json`, a projekt, amelyet tovább szerkeszthet, és `<name>.ifc`, ugyanez a tervezés IFC 4.3 formátumban, mindenki más számára (lásd: [IFC exportálás és importálás](topic:ifc)). Mindkét fájl hivatkozik a másikra, az IFC-fájl pedig a projekt tömörített másolatát is tartalmazza, így az önmagában elküldött IFC-fájl is teljes egészében szerkeszthetően megnyitható.

- **Studio-ban** mindkét fájl egymás mellett, helyben íródik.
- **Chrome-ban és Edge-ben** az első mentéskor a program mappát kér, és mindkét fájlt oda írja; a későbbi mentések ugyanabba a mappába kerülnek. A mappakérdésnél a Mégse gombbal mindkét fájl letölthető.
- **Más böngészőkben** mindkét fájl letöltődik, előbb a projektfájl.

Bármelyik fájl megnyitásakor a program keresi a másikat. Nyissa meg mindkettőt együtt (vagy húzza rá mindkettőt), vagy csak az egyiket: a Studio-ban a másik fájlt ugyanabban a mappában találja meg; böngészőben a CivilCraft felkéri, hogy adja hozzá, vagy folytassa a meglévővel. Ha az IFC-fájlt másik program módosította azután, hogy a CivilCraft elmentette, vagy az egyik fájl régebbi a másiknál, a projekt az újabb tervezésből nyílik meg, a **Problémák** panel pedig leírja, mi történt, a **Mentés most** (mindkét fájlt újra írja) és az **Az IFC geometriájának megjelenítése referenciaként** lehetőséggel. Ha egy önmagában lévő IFC-fájlt másik program módosított, a projekt a saját másolatából nyílik meg azzal, ami még egyezik: a megváltoztatott nyomvonalak a fájl geometriáját veszik fel, a törölt objektumok kimaradnak, a többi módosítás pedig listázva van, nem kerül átvételre. A 0.7.1 előtti projektfájl a régi módon nyílik meg.

A projektfájl a következőket őrzi meg:

- minden pontot (szám, koordináták, magasság, leírás) és annak a pontfájlnak a nevét, amelyből származnak
- a felület beállításait: csoportválasztások, rajzolt törésvonalak, a határvonal, a leghosszabb külső él, valamint a LandXML-ből beolvasott TIN-t
- a megjelenítési beállításokat
- a nyomvonalakat PI-pontjaikkal, sugaraikkal és kezdő szelvényszámukkal, a tervezési hossz-szelvényeiket (PVI-k és ívhosszak), valamint a sáv (korridor) beállításait
- a tereplépcsőket és a csőhálózatot a szabályaival

A visszavonási előzményeket nem őrzi meg. A felületek, a szintvonalak, a kitöltési vonalak és a térfogatok nincsenek tárolva; a projekt megnyitásakor a mentett bemenetekből készülnek újra. Az újabb CivilCraft-verzióval készült projektfájlt a program elutasítja, és üzenetben megnevezi a verzióját.

## Mit exportál

| Gomb | Fájl | Tartalom |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: pontok, a meglévő terep (és a tereprendezett felület, ha van) TIN-felületként, nyomvonalak, terep- és tervezési hossz-szelvények, a csőhálózat |
| {{ui:DXF}} | `<name>.dxf` | Az alaprajzi vonalak R12 DXF-formátumban, a megjelenített állapotukban, elnevezett rétegeken |
| {{ui:DWG}} | `<name>.dwg` | Ugyanezek a vonalak DWG rajzként, a kiválasztott formátumban (2000-től 2018-ig) |
| {{ui:PDF}} | `<name>.pdf` | Az alaprajz vektoros kinyomtatása egy lapra, a kiválasztott méretarányban |
| {{ui:GLB}} vagy {{ui:OBJ}} (a 3D nézet eszköztárán) | `<name>-3d.glb`, `<name>-3d.obj` | A 3D nézet által mutatott 3D-s modell: méterben, Y tengely felfelé, valódi léptékben, egy rögzített helyi origó körül |

Hogy mit hagy ki mindegyik: [LandXML-csere](topic:landxml), [Az alaprajz exportálása DXF-be](topic:dxf-export) (a DWG is), [Az alaprajz plottolása PDF-be](topic:plot-pdf), [A terület exportálása 3D-ben](topic:export-3d).

## Hová kerülnek a fájlok

A mentett és exportált fájlok oda kerülnek, ahová a böngésző a letöltéseket teszi, általában a Letöltések mappába. Ha minden alkalommal mappát szeretne választani:

:::chromium
Nyissa meg a böngésző **Beállítások** menüjét, majd a **Letöltések** részt, és kapcsolja be a **Kérdezze meg, hová mentse az egyes fájlokat letöltés előtt** opciót.
:::

:::firefox
Nyissa meg a **Beállítások** részt, majd az **Általános** lapot, és a **Fájlok és alkalmazások** résznél válassza a **Mindig kérdezze meg, hová mentse a fájlokat** lehetőséget.
:::

:::safari
Nyissa meg a **Safari > Beállítások > Általános** menüpontot, és állítsa a **Fájl letöltési helye** beállítást **Kérdezze meg minden letöltésnél** értékre.
:::

Ha kétszer mentene azonos névvel, a böngésző a második fájl nevéhez számot adhat, például `Site (1).civilcraft.json`. A következő alkalommal a legújabbat nyissa meg.

## Online és offline

A CivilCraft mindkét esetben csak a számítógépén működik: a megnyitás a böngészőben olvassa be a fájlt, a mentés pedig letölti azt. Ahhoz, hogy a CivilCraftot teljesen kapcsolat nélkül nyissa meg, előbb mentse el offline használatra:

1. Online állapotban kattintson a {{ui:Save for offline}} gombra a felső alkalmazássávban.
2. A gomb számlálja a folyamatot („Mentés: 12 / 30”), majd megjeleníti a {{ui:Offline ready}} feliratot. A CivilCraft kicsi (körülbelül 0,6 MB), ezért ez eltart egy ideig. A mentett másolat tartalmazza ezt a súgót és a mintaterületet.
3. Kapcsolat nélkül nyissa meg ugyanazt a címet (vagy a hozzá tartozó könyvjelzőt). Minden működik, beleértve a {{ui:Open the sample site}} gombot.

A gomb egyéb állapotai:

- {{ui:Could not save}}: egyes fájlok nem töltődtek le. Ellenőrizze a kapcsolatot, és újrapróbálkozáshoz kattintson rá.
- {{ui:Offline not available}}: ez a böngészőablak nem tud offline másolatot tárolni (a privát ablakok és egyes felügyelt számítógépek ezt letiltják). Használjon normál ablakot.

Kattintson az {{ui:Offline ready}} gombra, hogy lássa, mikor lett a másolat mentve; két lehetőség közül választhat: {{ui:Save again (get the newest version)}} és {{ui:Remove the offline copy}}. A helyszíni látogatás előtt mentse újra, hogy a másolat a legújabb verzióval egyezzen. További információ: [Offline](common:offline).

:::offline
Most offline állapotban van. Ha a CivilCraftot offline használatra mentette, minden működik, beleértve a mintaterületet. Ha nem, ebben a lapban tovább dolgozhat, de ne frissítse az oldalt, amíg újra online nem lesz; mentett másolat nélkül a {{ui:Open the sample site}} gomb hibával meghiúsul: „A mintát nem sikerült betölteni.”
:::

:::tip
Terepi használatra mentse offline használatra a CivilCraftot, és a pontfájlokat magán a laptopon vigye magával. Kapcsolat nélkül a projektek és az exportok letöltésként mentődnek, így a nap mérési adatait importálhatja, ellenőrizheti a felületet, és a projektet a helyszínen mentheti.
:::

A felhőtárhelyes mentés még nincs elkészítve, az asztali változatok pedig még nem jelentek meg. Jelenleg a mentett fájlok az egyetlen példányok: tárolja őket olyan helyen, ahol biztonsági mentés készül róluk.

## A fájl által használt bővítmények

Ha olyan projektet ment, amely bővítményből származó adatot tartalmaz (az Épületszabályozás jelölőnégyzeteit vagy a Cím a helyszínhez forrást), a fájl rögzíti, hogy mely bővítményeket és melyik verziót használta. Ha olyan számítógépen nyitja meg, amelyen nincs meg az egyik, az alaprajz fölötti sáv ezt jelzi, és felajánlja a bővítmény hozzáadását a fiókja listájából. A bejegyzés csak megjegyzés: a fájl így is megnyílik.

## Visszavonás a Studio-ból

A CadCraft Studio-n belül minden befejezett lépést, amelyet a CivilCraftban végez, jelzi a Studio felé, így annak projektszintű visszavonása az alkalmazások között is visszavonhatja a legutolsó lépést. A Studio csak akkor vonja vissza a lépést, ha a CivilCraft saját visszavonási veremének állapota pontosan az a lépés utáni állapot; ha egy másik fájlt nyit meg, ezt az ablakot kihagyja.

## Bezárás nem mentett módosításokkal

Ha a projektnek vannak nem mentett módosításai, és bezárja a lapot, újratölti az oldalt vagy elhagyja azt, a böngésző megkérdezi, hogy el akar-e menni. A szöveget és a megjelenést a böngésző határozza meg, azt a CivilCraft nem változtathatja meg. Az {{ui:New}} gomb, valamint projekt- vagy LandXML-fájl megnyitása a CivilCraft saját **Nem mentett módosítások** ablakában kérdez rá; ezen a {{ui:Cancel}}, a {{ui:Don’t save}} és a {{ui:Save a copy}} gomb érhető el.
