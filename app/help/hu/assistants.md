---
title: MI-asszisztens használata a helyszínnel
summary: Asszisztensek bekapcsolása a Beállításokban, hogy a számítógépen futó asszisztens olvashassa a megnyitott helyszínt (pontok, felületek, térfogatok, hossz-szelvények, telkek), felmérési pontokat vehessen fel, és mentést vagy LandXML/DWG exportot végezhessen a CadCraft Studion keresztül. Addig ki van kapcsolva, amíg be nem kapcsolják.
keywords: mi, asszisztens, mcp, szkript, automatizálás, studio, pontok, magasság, szelvény, eltolás, nyomvonal, térfogat, bevágás, feltöltés, hossz-szelvény, telek, landxml, dwg, usd, mappák, jogosultságok, leválasztás, tevékenység
from: d0356582
---

## Mit fog megtanulni

Hogyan engedélyezhető, hogy egy MI-asszisztens (bármely MCP-t beszélő asszisztens) dolgozzon a megnyitott helyszínnel, mit tehet és mit nem, és hogyan lehet leállítani.

## Mit tehet az asszisztens a CivilCraftban

| Mit kér | Mit kap | Szükséges |
|---|---|---|
| A helyszín | Név, mértékegységek, koordináta-rendszer, pontcsoportok, nyomvonalak, felületek, tereplépcsők, telkek és csövek | Olvasás |
| Felmérési pontok | Szám, keleti és északi koordináta, magasság és leírás, csoport szerint, leírás szerint vagy egy téglalapon belül | Olvasás |
| Felületi magasságok | A meglévő terep (vagy a rendezett felület) a megnevezett pontokon | Olvasás |
| Szelvények és eltolások | Egy nyomvonal mentén a pontok szelvénye és eltolása, vagy a szelvények koordinátái és terepmagassága | Olvasás |
| Hossz-szelvény | A terep, a tervezett szintvonal és a rendezett felület magassága egy nyomvonal mentén, annyi láb vagy méter közönként, amennyit megad | Olvasás |
| Bevágás és feltöltés | A meglévő terep és a rendezett felület közötti térfogatok (minden tereplépcső és korridor is), vagy a terep és egy szint közötti térfogatok | Olvasás |
| Telkek | Sarkok, terület (akre vagy hektár), kerület és a jogi leírás | Olvasás |
| Kijelölés | A megnevezett pontok ki lesznek jelölve a terven, mintha kézzel választották volna ki őket | Szerkesztés |
| Új felmérési pontok | Pontok a megadott vagy a következő szabad számokkal. Minden hívás egy visszavonható lépés | Szerkesztés |
| Mentés | A CivilCraft saját {{ui:Mentés}} gombja | Mentés |
| LandXML vagy DWG | Ugyanazok a fájlok, mint a {{ui:LandXML}} és {{ui:DWG}} gombok | Exportálás |
| A helyszín 3D-ben | A terep, a rendezett felület, a tereplépcsők és a csövek OpenUSD (.usdz, .usda vagy .usdc) formátumban, ahogy a 3D nézet exportálja | Exportálás |
| Növények és a növénylista | A növénylistában bármilyen néven megtalált növények és a növénylista darabszámai | Olvasás |
| Ültetés és terepalakítás | Növények, ágyás vagy sövény elhelyezése, vagy platform, földgát, árok vagy terepalakító terület hozzáadása; mindegyik egy visszavonható lépés, a bevágásával és feltöltésével együtt | Szerkesztés |
| Öntözési ellenőrzés | Minden zóna vízhozama, a szelepénél és a betáplálásnál szükséges nyomás, a legrosszabb eset szerinti nyomásveszteség, az üzemidők, a problémák és az anyagjegyzék; számítási segédletként, amelyet egy öntözési tervező ellenőriz | Olvasás |

Az asszisztens a megnyitott helyszínnel dolgozik. A Studióban a mappákba, amelyeket a lent leírtak szerint lehet megadni, az asszisztens mentést és exportálást is tud végezni; mappa nélkül a fájljai a gombok szerint töltődnek le.

## Bekapcsolás

Az asszisztensek a számítógépen futó CadCraft Studion keresztül érik el a CivilCraftot; a sima böngésző nem enged be.

1. Nyissa meg a {{ui:Beállítások}} menüt, és válassza a **CivilCraft** lapot.
2. Az **Asszisztensek** alatt pipálja be: **MI-asszisztensek és szkriptek használhatják a CivilCraftot**.
3. Az **Olvasás** már be van pipálva. A **Szerkesztés**, a **Mentés** vagy az **Exportálás** csak akkor pipálandó be, ha az asszisztensnek szüksége van rá.
4. Ha mappába akarja engedni a mentést és az exportálást, a **Használható mappák** alatt válassza a {{ui:Mappa hozzáadása…}} lehetőséget, és a Studio párbeszédpanelén jelölje ki a mappát. A {{ui:Eltávolítás}} azonnal visszavonja; minden más útvonalat elutasítunk.
5. Kapcsolja az asszisztenst a Studióban (a Studio megmutatja a címet és a beillesztendő beállításokat).

## Amíg az asszisztens csatlakozva van

A jobb oldali panel tetején egy megjegyzés mondja meg, melyik asszisztens csatlakozott, és mit tehet. A {{ui:Kapcsolat bontása}} gombbal azonnal véget vethet a munkamenetnek; újra kell csatlakozni, hogy folytatódjon.

A **Tevékenység** a **Beállítások** menüben az **Asszisztensek** alatt listázza az asszisztens minden hívását, a legújabbal kezdve, és azt, hogy sikeres volt-e.

:::tip
Egyszerű szavakkal kérdezzen, például: „mekkora a terep magassága 50 láb-enként a Main Street mentén?”, „mennyi bevágás és feltöltés kell a tereplépcsőknek?” vagy „vegyen fel egy vezérpontot ezekkel a koordinátákkal”. Az asszisztens megnézi a helyszínt és válaszol, vagy visszavonható lépésként elvégzi a módosítást.
:::

## A CivilCraft megnyitása nélkül

A CadCraft fájlszerver asszisztenseknek (`npx @getcadcraft/mcp`) és a `cadcraft` parancssor a mentett CivilCraft-projekteket (`.civilcraft.json`) és a pontfájlokat a CivilCraft saját kódjával nyitja meg, ablak nélkül: ugyanazok az olvasóeszközök, a pontok hozzáadása, a projekt mentése, a LandXML és a helyszín 3D-ben OpenUSD formátumban. A `cadcraft convert site.civilcraft.json site.xml` parancs parancssorból ír LandXML-t. A LandXML megnyitásához, a DWG exporthoz és a Landscape munkaterület eszközeihez továbbra is szükség van a CivilCraft ablakára.

## Kikapcsolás

Vegye ki a pipát ezen: **MI-asszisztensek és szkriptek használhatják a CivilCraftot**. Minden asszisztens azonnal leválasztódik, a beállítás pedig megmarad a következő alkalomra.

## Lásd még

- [Receptek MI-asszisztensekhez](common:assistants-recipes): kidolgozott példák, mindegyikhez a meghívott eszközökkel.
- [Vízszintes nyomvonal kialakítása](topic:alignment)
- [A felület elkészítése és finomítása](topic:build-surface)
- [Felmérési pontok kijelölése, másolása és beillesztése](topic:copy-paste-points)
- [CivilCraft beállításai](topic:settings)
