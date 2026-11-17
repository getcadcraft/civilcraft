---
title: LandXML-csere
summary: LandXML megnyitása más polgári mérnöki szoftverekből új projektként, pontok, felületek, nyomvonalak, hossz-szelvények és a csőhálózat exportálása LandXML 1.2-ben, és tudni, mi nem utazik át.
keywords: landxml, xml, importálás, exportálás, csere, tin, felület, nyomvonal, hossz-szelvény, csőhálózat, együttműködés, adatcsere
from: 870d5ece
---

A LandXML az a nyílt cserefomátum, amelyet a legtöbb polgári mérnöki program olvas és ír. A CivilCraft LandXML 1.2-t olvas és ír. Ha használta a Civil 3D-t, annak LandXML importáló és exportáló párbeszédpanelei a legközelebbi megfelelők; itt nincs mit választania, a megjegyzések pedig megmondják, mi maradt ki.

## LandXML-fájl megnyitása

1. Kattintson a {{ui:Megnyitás}} gombra (vagy nyomja meg a {{key:Mod+O}} billentyűt), válassza ki a `.xml` vagy `.landxml` fájlt, vagy húzza a rajzra.
2. Ha az aktuális projektben nem mentett módosítások vannak, a CivilCraft először kérdez. Válassza a {{ui:Másolat mentése}}, a {{ui:Ne mentsen}} vagy a {{ui:Mégse}} lehetőséget.
3. Egy **új projekt** készül. Az állapotsor megmondja, mi lett beolvasva, például: „Megnyitva: site.xml: 412 pont, 2 felület, 3 nyomvonal.”
4. Nézze meg a **Felület** adatai alatti dobozt. Ez felsorolja mindazt, ami kimaradt vagy megváltozott, például:
   - „Csak az első felület („EG”) lett megnyitva; a fájlban még 1 van.”
   - „A „Ramp A” nyomvonalnak olyan elemei vannak, amelyeket a CivilCraft még nem tud rajzolni (nem egyenes, ív vagy klotoid spirál); kihagyva.”
   - „A csőhálózat szabályai nem voltak a fájlban; helyettesítők vannak használatban – állítsa be a sajátjait a Projekt alatt.”

Mi lesz miből:

| A fájlban | A CivilCraftban |
|---|---|
| Mértékegységek (Imperial vagy Metric) | A projekt **Mértékegységei** (láb vagy méter) |
| Projektnév | A projekt **Neve** |
| CgPoints | A projekt pontjai; a leírás (vagy a kód) adja a csoportot |
| Az első TIN-felület | A meglévő terep, változtatás nélkül („Felület (LandXML-ből)”) |
| Minden egyenes, ív és klotoid spirálokból álló nyomvonal | Nyomvonal a PI-kkel, sugarakkal és spirálhosszakkal, a görbékből újraépítve |
| Minden nyomvonal első tervezett hossz-szelvénye | Annak tervezett hossz-szelvénye, parabolikus függőleges ívekkel |
| Az első csőhálózat | A csőhálózat, a peremekkel, fenékszintekkel és csövekkel |
| Egyenes és ív tervezővonalak | Tervezővonalak, az ívek megmaradnak; más programból **Csak rajzolva** állapotban indulnak |

A fájl elemeinek és attribútumainak teljes listája a [LandXML: mit olvas és mit ír](topic:landxml-reference) alatt található.

:::note
A LandXML-ből olvasott felületet a program nem építi újra, ha módosítja a pontcsoportokat vagy töréspontokat rajzol. A **Felület** részben kattintson a {{ui:A felület újraépítése a pontokból}} gombra, hogy a pontokból építse fel ({{key:Mod+Z}} visszahozza a LandXML-felületet).
:::

## LandXML exportálása

1. Kattintson a {{ui:LandXML}} gombra az **Exportálás** csoportban.
2. A böngésző letölti a `<name>.xml` fájlt. Az állapotsor megmondja, mi került bele, például: „LandXML 1.2 exportálva: 276 pont, 2 felület, 1 nyomvonal, a csőhálózat. A tereplépcsők itt nem részei a LandXML-nek; a tereprendezett felület igen.”

A fájl tartalma:

- **Units**: US survey feet vagy méter.
- **CgPoints**: minden pont a pontszámával mint névvel, a leírásával és a csoportjával mint kóddal.
- **Surfaces**: a meglévő terep TIN-ként, a töréspontjaival és külső határával mint forrásadat; és ha tereplépcsők vagy sávok tereprendeznek, egy második TIN-felület „Proposed” néven.
- **Alignments**: egyenesek, ívek és klotoid spirálok az állomásokkal, mindegyikhez egy hossz-szelvénnyel, benne a mintavételezett meglévő terep és a tervezett hossz-szelvény (PVI-k és parabolikus ívek), ha legalább két PVI van.
- **PipeNetworks**: szerkezetek a peremükkel, csövenként a fenékszintjükkel, és a csövek átmérőjükkel, hosszukkal és lejtésükkel.
- **PlanFeatures**: minden tervezővonal egyenesként és ívként, mindkét végén a magassággal, és azzal, mire használják.

## Mi nem utazik át

- Tereplépcsők és sávok mint objektumok. Az eredményük a „Proposed” felületben van.
- Hibás nyomvonalak (például átfedő ívek): kimaradnak, és az állapotüzenetben szerepelnek.
- Mindkét fenékszint nélküli csövek, és kettőnél kevesebb szerkezetet tartalmazó hálózatok.
- Egy felületről vett perem rögzített peremként íródik. Újra megnyitva a szerkezet megtartja ezt a számot, akkor is, ha a felület megváltozik.
- Hálózati szabályok (legkisebb lejtés, takarás, esés): a LandXML-ben nincs rájuk hely.
- A megjelenítési beállítások és a pontcsoportok felületválasztásai: ezekhez mentsen CivilCraft-projektet.

Megnyitáskor a CivilCraft nem olvassa a klotoidtól eltérő spirálokat, a rácsfelületeket, a más pontokra hivatkozó pontokat, a telkeket, a tervezővonalakon belüli spirálokat, az útpályákat vagy a felmérési adatokat. Mindegyiket megnevezi a megjegyzésekben, soha nem találgatva.

## Oda-vissza

Ha munkát szeretne átadni valakinek, aki más polgári mérnöki szoftvert használ, és visszakapni, exportálja a LandXML-t, hagyja, hogy szerkesszék, majd nyissa meg a kapott LandXML-t új projektként. Tartsa meg a saját `.civilcraft.json` fájlját is: ez az egyetlen fájl, amely mindent megőriz, amit a CivilCraft tud.
