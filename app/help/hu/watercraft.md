---
title: WaterCraft: igények, tűzivíz-hozam, kiesések és víz kora
summary: A WaterCraft bővítménnyel a vevőkből igényeket készíthet a vízvezetékein, ellenőrizheti minden tűzcsapnál az elérhető vízhozamot, megtudhatja, melyik vezeték kiesése okozza a legnagyobb kárt, és követheti a víz korát és a klórt egy napon át.
keywords: watercraft, vízelosztás, igények, vevők, csúcstényező, igénymintázat, tűzivíz-hozam, tűzcsap, maradék nyomás, kritikusság, kiesés, elzárható szakasz, víz kora, klór, maradékklór, forrásnyomkövetés, zsákutca, CSV, bővítmény
from: 066fb17a
---

A WaterCraft egy bővítmény, amely a már megrajzolt vízhálózaton dolgozik, a Vízvezetékek eszközeivel. A jobb oldali panelhez egy lapot ad négy szakasszal.

:::warning
Csak számítási segédeszköz. Kézi eredményekkel ellenőriztük kitalált hálózatokon, nem valódi közműmodellen. Minden eredményt vízmérnöknek kell ellenőriznie. A forgatókönyvek, vezérlési szabályok, szelepek és terepi mérések külön témakörben szerepelnek, a „Forgatókönyvek” és a „Vizsgálatok” címen, a WaterCraft bővítmény súgójában.
:::

## Mit fog csinálni

- Vevőket helyezzen a hálózatra igényként.
- Keresse meg azokat a tűzcsapokat, amelyek nem érik el a szükséges vízhozamot.
- Keresse meg azokat a vezetékeket, amelyek kiesése a legfontosabb.
- Keresse meg a régi vizet és az alacsony klórszintet.

## Lépések

1. Nyissa meg a {{ui:Beállítások}} › {{ui:Bővítmények}} menüpontot, és kapcsolja be a {{ui:WaterCraft (vízelosztás)}} opciót. A jobb oldali panelen megjelenik a {{ui:WaterCraft}} lap.
2. Először rajzoljon tározót, csomópontokat és csöveket a Vízvezetékek eszközeivel (lásd: [Vízvezetékek](topic:water-mains)). Hálózat nélkül a lap erre figyelmeztet.
3. A {{ui:Igények}} alatt illesszen be egy vevőt soronként: azonosító, x, y, típus, mennyiség. Válassza ki a {{ui:Csúcstényező}} értéket és az {{ui:Órás mintázat}} értéket (lakóépületi nap, kereskedelmi nap, lapos vagy a mintázat megtartása). Nyomja meg az {{ui:Ellenőrzés}} gombot, hogy lássa, hová kerül minden vevő (a legközelebbi csomópont), majd a {{ui:Betöltés a hálózatba}} gombot. A visszavonás visszaveszi az igényeket.
4. A {{ui:Tűzivíz-hozam}} alatt állítsa be a szükséges vízhozamot és a maradék nyomást, válassza ki, hogy a maradék nyomás {{ui:Csak a tűzcsapnál}} vagy {{ui:Az egész rendszerben (szigorúbb)}} legyen-e tartva, majd nyomja meg a {{ui:Futás}} gombot. Minden tűzcsap a legrosszabbtól kezdve listázódik, mint „megfelel” vagy „kevés”.
5. A {{ui:Melyik vezeték a legfontosabb}} alatt válassza ki a {{ui:egyszerre egy cső}} vagy a {{ui:egyszerre egy elzárható szakasz}} lehetőséget, és nyomja meg a {{ui:Futás}} gombot. Minden kiesés megmutatja a lekapcsolt igényt, a lekapcsolt csomópontokat, a most a minimum nyomás alá került csomópontokat és a megmaradt legalacsonyabb nyomást.
6. A {{ui:A víz kora és a klór}} alatt válassza ki, mit kövessen (a víz kora, a klór vagy a forrásnyomkövetés), állítsa be a futtatási órákat és a kívánt határokat, majd nyomja meg a {{ui:Futás}} gombot. A határokon kívül eső csomópontok listázódnak.
7. Bármelyik táblázat alatt nyomja meg a {{ui:Mentés CSV-ként}} gombot, hogy megőrizze.

## Megjegyzések

- Az igényelt tűzivíz-hozam és az egy otthonra vagy egy akre eső használat kezdőértékek, nem szabványok. Használja a közműszolgáltatója saját adatait.
- A részben szelep által elvágott csövet teljes egészében zártnak tekintjük, így a megjelenített kiesés kissé rosszabb, mint a valóságos.
- Futtassa a vízminőségi szakaszt elég hosszan ahhoz, hogy a napi mintázat megismétlődjön, mielőtt az utolsó napot olvassa.
- A {{ui:Leállítás}} hamar véget vet egy hosszú futásnak; a lista ekkor csak a már elvégzett részt mutatja.
- A hálózata ebben a projektben és ezen a számítógépen marad. Semmi sem kerül sehová elküldésre.
