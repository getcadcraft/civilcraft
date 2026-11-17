---
title: WaterCraft: igények, tűzivíz-hozam, kiesések és víz kora
summary: A WaterCraft bővítménnyel a fogyasztókat igényekké alakíthatja a vízvezetékein, ellenőrizheti az egyes tűzcsapoknál rendelkezésre álló hozamot, megtudhatja, melyik vezeték kiesése okozza a legnagyobb kárt, és egy napon át nyomon követheti a víz korát és a klórt.
keywords: watercraft, vízelosztás, igények, fogyasztók, csúcstényező, igénymintázat, tűzivíz-hozam, tűzcsap, maradék nyomás, kritikusság, kiesés, elzárható szakasz, víz kora, klór, maradék, forrásnyomkövetés, zsákutca, csv, bővítmény
from: 76809f01
---

A WaterCraft egy bővítmény, amely az már megrajzolt vízhálózaton dolgozik, a **Vízvezeték-hálózat** eszközeivel. A jobb oldali panelen egy lapot ad hozzá négy szakasszal.

:::warning
Csak számítási segédeszköz. Kitalált hálózatokon, kézi számításokkal ellenőrizték, nem valós közüzemi modellen. Minden eredményt vízmérnöknek kell ellenőriznie. Nincsenek nyomásfokozó állomások, nincs másodrendű bomlás, és még nincsenek forgatókönyvek.
:::

## Amit elvégez

- Fogyasztókat helyez el a hálózaton igényekként.
- Megkeresi azokat a tűzcsapokat, amelyek a szükséges hozamnál kevesebbet adnak.
- Megkeresi azokat a vezetékeket, amelyek kiesése a legsúlyosabb.
- Megkeresi az öreg vizet és az alacsony klórszintet.

## Lépések

1. Nyissa meg a {{ui:Beállítások}} › {{ui:Bővítmények}} menüt, és kapcsolja be a {{ui:WaterCraft (vízelosztás)}} bővítményt. A jobb oldali panelen megjelenik a {{ui:WaterCraft}} lap.
2. Először a vízvezeték-hálózat eszközeivel rajzoljon tározót, csomópontokat és csöveket (lásd: [Vízvezeték-hálózat](topic:water-mains)). Hálózat nélkül a lap erre figyelmeztet.
3. Az {{ui:Igények}} alatt soronként egy fogyasztót illesszen be: azonosító, x, y, típus, mennyiség. Adja meg a {{ui:Csúcstényező}} értékét, és válassza ki az {{ui:Óránkénti minta}} beállítást (lakossági nap, kereskedelmi nap, egyenletes, vagy a minta megtartása). Nyomja meg az {{ui:Ellenőrzés}} gombot, hogy lássa, melyik csomóponthoz tartozik az egyes fogyasztó (a legközelebbi csomópont), majd a {{ui:Betöltés a hálózatba}} gombot. A visszavonással az igények visszakerülnek.
4. A {{ui:Tűzivíz-hozam}} alatt állítsa be a szükséges hozamot és a maradék nyomást, válassza ki, hogy a maradék nyomás {{ui:Csak a tűzcsapnál}} vagy {{ui:A teljes rendszerben (szigorúbb)}} legyen-e érvényes, és nyomja meg a {{ui:Futás}} gombot. Minden tűzcsap a legrosszabbtól kezdve, „megfelel” vagy „nem felel meg” jelöléssel listázódik.
5. A {{ui:Melyik fővezeték a legfontosabb}} alatt válassza ki, hogy {{ui:egyszerre egy csövet}} vagy {{ui:egyszerre egy elzárható szakaszt}} vizsgáljon, és nyomja meg a {{ui:Futás}} gombot. Minden kiesés megmutatja a leválasztott igényt, a leválasztott csomópontokat, azokat a csomópontokat, amelyek most a minimális nyomás alá kerültek, és a legalacsonyabb megmaradt nyomást.
6. A {{ui:Víz kora és klór}} alatt válassza ki, mit kövessen nyomon (víz kora, klór vagy forrásnyomkövetés), állítsa be a futtatandó órákat és a kívánt határértékeket, majd nyomja meg a {{ui:Futás}} gombot. A határértékeken kívül eső csomópontok listázva lesznek.
7. Bármelyik táblázat alatt nyomja meg a {{ui:Mentés CSV-ként}} gombot, hogy megtartsa.

## Megjegyzések

- A szükséges tűzivíz-hozam és a lakásonkénti vagy területegységenkénti vízhasználat kiindulási értékek, nem szabványok. Használja a közüzeme saját adatait.
- Az elzárószeleppel részben lefedett csövet egészben lezártnak tekintjük, ezért a megjelenített kiesés kissé rosszabb a valóságosnál.
- A vízminőségi szakaszt elég hosszan futtassa ahhoz, hogy a napi minta megismétlődjön, mielőtt az utolsó napot elolvassa.
- A {{ui:Leállítás}} korán megszakítja a hosszú futtatást; a lista ekkor csak az addig elvégzett részt mutatja.
- A hálózata ebben a projektben és ezen a számítógépen marad. Semmit nem küld sehová.
