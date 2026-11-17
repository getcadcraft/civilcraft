---
title: Földmunka-térfogatok
summary: A bevágás, a feltöltés és a nettó térfogatok olvasása a meglévő terep és a tervezett felület között, tereplépcsőnként, sávonként és összesen, valamint a mögöttük álló rácsmódszer megértése.
keywords: térfogatok, földmunka, bevágás, feltöltés, nettó, bevágás és feltöltés, mennyiségek, rácsmódszer, felületösszehasonlítás, térfogati felület, köbyard, köbméter
from: 299d7bc7
---

Amint egy tereplépcső vagy sáv hibátlanul szintezhető, a CivilCraft összeveti a tervezett felületet a meglévő talajjal, és jelenti a bevágást és a feltöltést. A számok minden változtatásnál frissülnek.

## Hol olvashatók

- A **Földmunka** a jobb panelen, ha semmi nincs kijelölve (a **Projekt** nézet), és van legalább egy tereplépcső vagy sáv.
- A **Földmunka** a jobb panelen, ha tereplépcső van kijelölve (ugyanazok az összegek az egész projektre).
- A sáv beállításai alatti sor, a sáv saját bevágásával és feltöltésével.

A **Földmunka** blokk megmutatja:

- a **Bevágást**, a **Feltöltést** és a **Nettót** (utána „feltöltés” vagy „bevágás”, amelyik nagyobb)
- soronként egy tételt, ha több van, például „Tereplépcső 1: bevágás 120,4 cu yd, feltöltés 310,2 cu yd”
- a módszer sorát: „Rácsmódszer: a meglévő terep és a szintezett felület 0,5 ft-enként mintavételezve a földmunkahatárokon belül (92 891 cella). Nincs alkalmazva duzzadási vagy zsugorodási tényező.”

A térfogatok lábprojektben köbyardban, méterprojektben köbméterben vannak.

## Küldés a TakeoffCraftnak

A földmunka árazásához válassza a **Földmunka** blokk alján lévő {{ui:Küldés a TakeoffCraftnak}} gombot. A CivilCraft egy mennyiségi fájlt ment (`<site>.quantities.json`) két mennyiséggel: bevágás és feltöltés, köbyardban (lábprojekt) vagy köbméterben (méteres projekt), ugyanazokkal a számokkal, mint a blokkban, a századig pontosan. Nyissa meg a TakeoffCraftban a **Mennyiségkimutatás megnyitása** gombbal, vagy húzza oda: két tételként jelennek meg, amelyeket árazhat ([Bevágás és feltöltés a CivilCraftból](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Változtatás után küldje újra, és nyissa meg az új fájlt: ugyanazok a tételek az új számokat veszik fel.

Csak az összegek kerülnek elküldésre, így semmi sem számolódik kétszer; a fájl megjegyzése felsorolja minden tereplépcső és sáv saját bevágását és feltöltését.

## Hogyan számítják ki

A CivilCraft a **rácsmódszert** használja:

1. Négyzet alakú cellák rácsát fekteti a területre minden földmunkahatáron belül.
2. Minden cella közepén mindkét felületet mintavételezi.
3. Minden cella prizmaként számít: a magasságkülönbség szorozva a cella területével. Ahol a tervezett felület alacsonyabb, az bevágás; ahol magasabb, feltöltés.
4. A cellákat összeadják.

A cellaméretet Ön helyett választják meg úgy, hogy a szintezett területek körüli téglalap körülbelül 250 000 cellát tartalmazzon, szép értékre kerekítve (egy tízhatvány 1-, 2- vagy 5-szöröse). Ezt még nem állíthatja be. A módszer sora megmutatja a cellaméretet és a cellák számát. A kisebb cellák pontosabbak a széleken; sík síkok között, egész cellákon az eredmény pontos.

## Tudnivalók

- Csak a földmunkahatárokon belüli terület számít. A határokon kívüli terep változatlan.
- A problémás tereplépcső vagy sáv nem kerül be, és nem ad hozzá semmit. Ha a blokk azt mondja: „Még nincs térfogat: a tereplépcsőnek hiba nélkül kell szintezhetőnek lennie.”, nézze meg a fölötte lévő piros dobozt.
- Ahol tételek átfedik egymást, a későbbi a földmunkahatárán belül felülírja a korábbit, és az átfedés egyszer számít.
- Nincs alkalmazva duzzadási vagy zsugorodási tényező. Ha bontott (tömör), laza vagy tömörített térfogatra van szüksége, szorozza meg maga az eredményeket.
- A humuszlehordás, a burkolat- és altalajmélységek, valamint a TIN–TIN prizmatérfogatok még nem érhetők el.

## Az eredmény ellenőrzése

- Kapcsolja be a **Megjelenítés** alatt a {{ui:Tervezett (szintezett)}} opciót, és nézze meg a szintvonalakat a földmunkahatárokon belül.
- Vigye az egérmutatót a szintezett terület fölé: az állapotsor a **Terep** és a **Szintezett** értéket mutatja. A különbség a bevágás vagy feltöltés mélysége azon a ponton.
- Sáv esetén a hosszszelvény-nézet kijelzője minden szelvényben megmutatja a bevágást vagy a feltöltést a tengelyvonalon.
