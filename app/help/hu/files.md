---
title: Megnyitható, menthető és exportálható fájlok
summary: Pontfájlok, LandXML és CivilCraft-projektek betöltése; projektek, LandXML, DXF és PDF kimenetek; mit őriznek a fájlok, hová kerülnek, és mi változik offline módban.
keywords: megnyitás, mentés, export, import, fájlformátumok, csv, txt, landxml, xml, dxf, pdf, json, letöltés, projektfájl
from: 82bff559
---

A CivilCraft a számítógépéről nyit meg fájlokat, mentéskor pedig letöltéssel visszaírja őket a gépre. Semmi sem töltődik fel, és semmi sem marad meg szerveren. Lásd még: [Saját fájlok](common:your-files).

## Mit nyit meg

Kattintson a {{ui:Megnyitás}} gombra (vagy nyomja meg a {{key:Mod+O}} billentyűt), és válasszon egy fájlt, vagy húzza a fájlt a {{pick:mac=Finder|windows=Fájlkezelő|linux=a fájlkezelő}} alkalmazásból az alaprajzra. Egyszerre egy fájl nyitható meg; a 200 MB-nál nagyobb fájlokat a program visszautasítja. A 32 MB-nál nagyobb LandXML- vagy projektfájlt kb. 4 MB-os darabokban olvassa be, sosem egyetlen szövegblokként. LandXML megnyitása közben számoljon azzal, hogy a memóriahasználat nagyjából a fájlméret 13-szorosa (egy 69 MB-os fájl tesztünkben kb. 0,9 GB-ot használt).

| Típus | Fájlnevek | Mi történik |
|---|---|---|
| Pontfájl | `.csv`, `.txt`, `.pnt`, `.xyz` (bármely szöveges fájl) | Megnyílik a **Pontok importálása** párbeszédpanel. A pontok lecserélik a projekt pontjait; a nyomvonalak, a telkek és a csővezetékek megmaradnak. |
| LandXML | `.xml`, `.landxml` | A fájlból új projekt készül (ha a jelenlegi projektben vannak nem mentett módosítások, előbb rákérdez). |
| CivilCraft-projekt | `.civilcraft.json` (bármely `.json`) | A projekt úgy nyílik meg, ahogy mentették (ha a jelenlegi projektben vannak nem mentett módosítások, előbb rákérdez). |

A CivilCraft a fájl kiterjesztése alapján dönt, majd a fájl első karakterei alapján: a `{` karakterrel kezdődő szöveget projektként, a `<` karakterrel kezdődőt LandXML-ként, minden mást pontfájlként olvassa be. Az a fájl, amelyet a megnyitási párbeszédpanel szürkén jelez, még ráhúzható az alaprajzra.

:::note
Ha olyan projektbe importál pontfájlt, amelyben már vannak pontok, a program rákérdezés nélkül lecseréli őket, és törli a visszavonási előzményeket (bármely fájl megnyitása új kezdést jelent a visszavonás számára). Ha a felület LandXML-ből származott, a pontok importálása a felületet ismét a pontokból épített felületre váltja. Mentse előbb, ha később szüksége lehet a régi pontokra.
:::

Részletek: [Pontfájl-formátumok](topic:point-file-formats), [LandXML: mit olvas és ír](topic:landxml-reference).

## Mit ment

A {{ui:Mentés}} ({{key:Mod+S}}) két fájlt ír egymás mellé, a bal panelen lévő **Név** alapján elnevezve: `<name>.civilcraft.json`, a projekt, amelyen tovább szerkeszt, és `<name>.ifc`, ugyanez a terv IFC 4.3 formátumban, más programoknak (lásd [IFC-export és -import](topic:ifc)). Mindkét fájl hivatkozik a másikra, az IFC pedig a projekt tömörített másolatát is tartalmazza, így a külön elküldött IFC is teljesen szerkeszthetően megnyitható.

- **CadCraft Studio**: mindkét fájl egymás mellé, ugyanarra a helyre íródik.
- **Chrome-ban és Edge-ben** az első mentésnél a program egy mappát kér, és mindkét fájlt abba írja; a későbbi mentések ugyanabba a mappába mennek. Ha a mappa kérdésénél a **Mégse** gombot nyomja meg, mindkét fájl letöltésként jön.
- **Más böngészőkben** mindkét fájl letöltődik, a projektfájl először.

Mindkét fájl megnyitásakor a másik fájlt is keresi. Nyissa meg mindkettőt együtt (vagy húzza rá mindkettőt), vagy csak az egyiket: a CadCraft Studio-ban a másikat ugyanabban a mappában találja meg; böngészőben a CivilCraft megkérdezi, hogy hozzáadja-e, vagy az egyikkel folytatja. Ha az IFC-t a CivilCraft mentése után egy másik program módosította, vagy az egyik fájl régebbi a másiknál, a projekt a frissebb tervből nyílik meg, a Problémák panel pedig leírja, mi történt, a **Mentés most** (mindkét fájlt újraírja) és az **Az IFC geometriájának megjelenítése referenciaként** lehetőségekkel. Egy másik program által módosított, önmagában megnyitott IFC a projekt saját másolatából nyílik meg azzal, ami még egyezik: a megváltoztatott nyomvonalak az ő geometriáját veszik fel, a törölt objektumok kimaradnak, a többi változtatás fel van sorolva, de nem kerül átvételre. A 0.7.1 előtti projektfájl a régi módon nyílik meg.

A projektfájl megőrzi:

- minden pontot (számot, koordinátákat, magasságot, leírást), és annak a pontfájlnak a nevét, amelyből származnak
- a felület beállításait: csoportválasztásokat, megrajzolt törésvonalakat, a határvonalat, a leghosszabb külső élet és a LandXML-ből olvasott TIN-t
- a megjelenítési beállításokat
- a nyomvonalakat a PI-jaikkal, sugaraikkal és kezdőszelvényükkel, a tervezett hossz-szelvényeiket (PVI-kkel és ívhosszakkal) és a sáv beállításait
- a pótlólagos felületeket (pad) és a csővezeték-hálózatot a szabályaival

Nem őrzi meg a visszavonási előzményeket. A felületek, szintvonalak, napfényvonalak és térfogatok nincsenek tárolva; a projekt megnyitásakor újraépülnek a mentett adatokból. Egy újabb CivilCraft által készített projektfájlt a program a verziót megnevező üzenettel visszautasít.

## Mit exportál

| Gomb | Fájl | Tartalom |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: pontok, a meglévő terep (és a tereprendezett felület, ha van) TIN-felületekként, nyomvonalak, terep- és tervezett hossz-szelvények, a csővezeték-hálózat |
| {{ui:DXF}} | `<name>.dxf` | Az alaprajzi vonalak R12 DXF-ben, a megjelenítés szerint, elnevezett rétegeken |
| {{ui:DWG}} | `<name>.dwg` | Ugyanezek a vonalak DWG-rajzként, az Ön által választott formátumban (2000-től 2018-ig) |
| {{ui:PDF}} | `<name>.pdf` | Az alaprajz vektoros ábrázolása egy lapon, az Ön által választott léptékben |
| {{ui:GLB}} vagy {{ui:OBJ}} (a 3D-nézet sávján) | `<name>-3d.glb`, `<name>-3d.obj` | Amit a 3D-nézet 3D-modellként mutat: méterben, Y felfelé, valódi léptékben, egy rögzített helyi origó körül |

Mit hagy ki mindegyik: [LandXML-csere](topic:landxml), [Az alaprajz exportálása DXF-be](topic:dxf-export) (a DWG is), [Az alaprajz ábrázolása PDF-be](topic:plot-pdf), [A terep exportálása 3D-ben](topic:export-3d).

## Hová kerülnek a fájlok

A mentett és exportált fájlok oda kerülnek, ahová a böngésző a letöltéseket teszi, általában a Letöltések mappába. Ha minden alkalommal mappát szeretne választani:

:::chromium
Nyissa meg a böngésző **Beállítások** menüjét, majd a **Letöltések** részt, és kapcsolja be a **Kérdezze meg letöltés előtt, hová mentse az egyes fájlokat** beállítást.
:::

:::firefox
Nyissa meg a **Beállítások** menüt, majd az **Általános** részt, és a **Fájlok és alkalmazások** alatt válassza a **Mindig kérdezze meg, hová mentse a fájlokat** lehetőséget.
:::

:::safari
Nyissa meg a **Safari > Beállítások > Általános** menüpontot, és a **Fájlletöltési hely** beállítást állítsa **Kérdezze meg minden letöltésnél** értékre.
:::

Ha kétszer mentene ugyanazzal a névvel, a böngésző a második fájlhoz számot fűzhet, például `Site (1).civilcraft.json`. Legközelebb a legújabbat nyissa meg.

## Online és offline

A CivilCraft mindkét esetben csak a számítógépén működik: a megnyitás a böngészőben olvassa be a fájlt, a mentés letölti azt. Ha teljes kapcsolat nélkül szeretné megnyitni a CivilCraftot, először mentse offline használatra:

1. Online állapotban kattintson az alkalmazássáv felső részén lévő {{ui:Mentés offline használatra}} gombra.
2. A gomb számol („Mentés: 12 / 30”), majd az {{ui:Offline használatra kész}} feliratot mutatja. A CivilCraft kicsi (kb. 0,6 MB), ezért ez egy pillanatig tart. A mentett másolat tartalmazza ezt a súgót és a mintaterületet.
3. Kapcsolat nélkül nyissa meg ugyanazt a címet (vagy a könyvjelzőt). Minden működik, beleértve a {{ui:Mintaterület megnyitása}} műveletet.

A gomb további állapotai:

- {{ui:Nem sikerült menteni}}: néhány fájl nem töltődött le. Ellenőrizze a kapcsolatot, és kattintson rá az újrapróbálkozáshoz.
- {{ui:Az offline mód nem érhető el}}: ez a böngészőablak nem tud offline másolatot tartani (a privát ablakok és néhány felügyelt számítógép ezt letiltja). Használjon normál ablakot.

Kattintson az {{ui:Offline használatra kész}} gombra, hogy lássa, mikor készült a másolat; két lehetőség van: {{ui:Mentés újra (a legújabb verzió beszerzése)}} és {{ui:Az offline másolat eltávolítása}}. Terepi látogatás előtt mentse újra, hogy a másolat a legújabb verzióval egyezzen. További információ: [Offline](common:offline).

:::offline
Most offline állapotban van. Ha a CivilCraft offline használatra volt mentve, minden működik, beleértve a mintaterületet is. Ha nem, dolgozzon tovább ebben a lapban, de ne töltse újra, amíg újra online nem lesz; mentett másolat nélkül a {{ui:Mintaterület megnyitása}} művelet kudarcot vall: „A minta nem tölthető be”.
:::

:::tip
Terepi használatra mentse a CivilCraftot offline használatra, a pontfájlokat pedig vigye magán a laptopon. A projektek és az exportok kapcsolat nélkül is letöltésként mentődnek, így egy nap felvételeit importálhatja, ellenőrizheti a felületet, és a projektet helyszínen mentheti.
:::

A felhős mentés még nem érhető el, és az asztali verziók sem jelentek meg. Jelenleg a mentett fájlok az egyetlen példányok: tárolja őket olyan helyen, amelyről biztonsági mentés készül.

## Fájl által használt bővítmények

Ha olyan projektet ment, amely bővítmény adatait tartalmazza (az Épületszabályozási jelölések vagy egy Cím a telekhez forrás), a fájl rögzíti, mely bővítmények és melyik verziók kellenek. Ha olyan számítógépen nyitja meg, ahol ez hiányzik, az alaprajz fölötti sáv jelzi ezt, és felajánlja, hogy a fiókja listájáról hozzáadja. A rögzítés csak megjegyzés: a fájl így is megnyílik.

## Visszavonás a CadCraft Studio-ban

A CadCraft Studio-ban minden befejezett lépést, amelyet a CivilCraftban végez, közöl a Studióval, így annak projektszintű visszavonása a legutóbbi lépést is visszavonhatja az alkalmazások között. A Studio csak akkor vonja vissza a lépést, ha a CivilCraft saját visszavonási vermének állapota pontosan megegyezik a lépés utáni állapottal; ha másik fájlt nyit meg, ez az ablak kimarad.

## Bezárás nem mentett módosításokkal

Ha a projektben nem mentett módosítások vannak, és bezárja a lapot, újratölti az oldalt vagy elhagyja azt, a böngésző megkérdezi, hogy el szeretné-e hagyni. Ennek szövege és megjelenése a böngészőhöz tartozik, a CivilCraft nem változtathatja meg. Az {{ui:Új}} gomb, valamint egy projekt- vagy LandXML-fájl megnyitása helyett a CivilCraft saját **Nem mentett módosítások** párbeszédpanelje kérdez, a {{ui:Mégse}}, {{ui:Ne mentsen}} és {{ui:Másolat mentése}} lehetőségekkel.
