---
title: A terület exportálása 3D-ben
summary: A 3D-nézet tartalmát GLB vagy OBJ fájlként mentheti más 3D-programok számára, méterben, Y tengellyel felfelé, egy helyi kezdőpont körül, amelyet a fájl rögzít.
keywords: glb, gltf, obj, 3D exportálás, modellexportálás, játékmotor, vizualizáció, 3D-nézegető, méter, y felfelé, kezdőpont, helyi kezdőpont, síkkoordináta
from: 07d23992
---

A 3D-nézet azt exportálja, amit mutat, egy olyan 3D-s modellként, amelyet más program meg tud nyitni: egy 3D-nézegető, egy modellező, egy játékmotor vagy egy vizualizációs eszköz.

## Exportálás

1. Nyissa meg a 3D-nézetet ({{key:D}}), és a {{ui:Megjelenítés}} gombbal válassza ki, mi látszódjon. Ami el van rejtve, nem exportálódik.
2. Kattintson a sávon a {{ui:GLB}} vagy az {{ui:OBJ}} gombra.
   A fájl „*projekt neve*-3d.glb” vagy „-3d.obj” néven töltődik le, az állapotsor pedig megmondja a kezdőpontot.

## Mit tartalmaznak a fájlok

| | GLB | OBJ |
|---|---|---|
| Felületek | Hálók normálvektorokkal, a sáv- vagy felületszínekkel | Hálók normálvektorokkal (szín nélkül) |
| Csövek és műtárgyak | Kerek hálók, a hibásak pirosan | Kerek hálók |
| Szintvonalak, töréselők, nyomvonalak, jelölések, sáv- és tereplépcső-vonalak | Vonalak, mindegyik készlet a saját színével | Vonalrekordok (`l`) |
| Mérési pontok | Pontok | Pontrekordok (`p`) |

Minden készlet megtartja a nevét („Meglévő terep”, „Csövek”, „Főszintvonalak” és így tovább), így a másik programban elrejtheti vagy stílusozhatja.

## Mértékegységek, tengelyek és kezdőpont

- **Méter.** A láb alapú projekt US survey lábból van átváltva (1 ft = 1200/3937 m).
- **Y felfelé**, ezek a formátumok szokásos konvenciója: a keleti koordináta lesz +X, a magasság +Y, az északi koordináta pedig −Z.
- **Valódi méretarány.** A nézet függőleges túlzását nem alkalmazzuk.
- **Helyi kezdőpont.** A síkkoordináták több millió láb nagyságúak, ezért túl nagyok ezeknek a formátumoknak tárolt egyszeres pontosságú számaihoz. Ezért a fájl egy közeli kezdőponthoz viszonyítva íródik: a meglévő terep saját kezdőpontja adja a keleti és északi koordinátát, a legalacsonyabb magasság pedig lefelé kerekítve. A kezdőpont a projekt mértékegységében a fájlban van rögzítve: GLB-ben a jelenet és a felső csomópont `extras` mezőjében, OBJ-ban pedig a fájl elején lévő megjegyzéssorban (`# origin easting … northing … elevation …`). A modell visszahelyezéséhez a projekt koordinátáihoz adja hozzá a kezdőpontot (láb alapú projektnél a métereket előbb vissza kell váltani lábra).

## Még nincs kész

- A függőleges arányt túlzó nézet exportálása, vagy exportálás a projekt mértékegységeiben a méter helyett.
- Textúrák, OBJ-hoz tartozó anyagfájl (.mtl) és objektumonkénti tulajdonságok (a csövek és műtárgyak nevei csak a CivilCraftban érhetők el).
- A sáv külön testekként való exportálása, vagy a hossz-szelvény nézet 3D-ben.
