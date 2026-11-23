---
title: Mintavételi vonalak és keresztszelvények
summary: Keresztszelvények vágása a nyomvonalra merőlegesen, a terep, a tervezett felület és a bevágás és töltés megtekintése minden szelvényszámnál, valamint térfogatok átlagos véglapok módszerével.
keywords: tömegdiagram, tömeggörbe, egyensúlyi pont, zsugorodás, duzzadás, szállítási távolság, kitermelés, lerakás, keresztszelvény-lapok, szelvény-PDF, szelvények, keresztszelvények, mintavételi vonalak, keresztszelvény-nézet, bevágás, töltés, területek, átlagos véglap, véglap-térfogatok, földmunka, szelvényszám, eltolás, CSV
from: 09639ce2
---

A keresztszelvény úgy mutatja az utat, ahogyan megépül: a nyomvonalra merőlegesen, egy szelvényszámnál, a meglévő terepet, a tervet (a beszintezett sávot vagy tereplépcsőt) és a közöttük lévő bevágást és töltést.

## Mintavételi vonalak hozzáadása

1. Jelöljön ki egy nyomvonalat. A **Tulajdonságok** panelen, a **Mintavételi vonalak** alatt kattintson a {{ui:Mintavételi vonalak hozzáadása}} gombra.
2. Állítsa be a **Távolság** értéket (a köz: kezdetben 50 ft vagy 20 m), a **Bal oldali szélesség** és a **Jobb oldali szélesség** értékeket (mennyire nyúlik ki minden keresztszelvény a tengelyvonaltól).
3. Ha egy adott szelvényszámnál szeretne keresztszelvényt vágni, írja be a {{ui:Szelvényszám hozzáadása}} mezőbe (például `2+35`), és nyomja meg az {{key:Enter}} billentyűt.

A keresztszelvények a köz minden egész többszörösénél, a nyomvonal mindkét végén, minden ív elején és végén (PC és PT), valamint a hozzáadott szelvényszámoknál készülnek. A mintavételi vonalak az alaprajzon szürke vonalként láthatók a nyomvonalon keresztül; DXF-, DWG- és PDF-formátumban is kikerülnek a C-ROAD-SCTN rétegre. Minden módosítás egy lépés: a {{key:Mod+Z}} visszavonja.

## A keresztszelvény-nézet

Nyissa meg a nyomvonal **Tulajdonságok** paneljén lévő {{ui:Keresztszelvény-nézet}} gombbal, a **Felület** › {{ui:Továbbiak}} alatti {{ui:Szelvények}} gombbal, vagy az {{key:X}} billentyűvel. Az alaprajz alatt a hossz-szelvény-nézet helyét veszi át.

- Lépkedjen a szelvények között a sávjában lévő nyilakkal, a szelvényszám-listával, vagy a {{key:Left}} és {{key:Right}} billentyűkkel, ha a keresztszelvény-nézet van fókuszban ({{key:Home}} és {{key:End}} az első és az utolsóhoz).
- A szürke vonal a meglévő terep, a piros vonal a terv. A bevágás narancssárgával, a töltés zölddel árnyékolt. A sávpontok jelöltek: CL (tengelyvonal), EOP (burkolatszél), SH (padka) és DL (rézsűvonal).
- A fejléc megadja a szelvényszámot, az adott szelvény bevágási és töltési területét, valamint a függőleges nagyítást. Az **Illesztés** kitölti a panelt; válassza az 1×-et, hogy a szelvényt valós méretarányban lássa.
- Az alaprajzon a vastag vonal mutatja, melyik szelvény látszik a képernyőn.
- **Nagyítás és mozgatás:** a görgő a mutató körül nagyít, a húzás mozgatja a nézetet. Az {{ui:Illesztés}} (vagy az {{key:F}}, vagy dupla kattintás) újra illeszti a teljes szelvényt.

## Mérés a szelvényben

1. Kattintson a {{ui:Mérés}} gombra a szelvénysávban, vagy nyomja meg az {{key:M}} billentyűt. A súgó ezt írja: „Kattintson az első pontra, majd a másodikra.”
2. Kattintson két pontra. Mindegyik a vonalvég vagy egy sávpont (CL, EOP, SH, DL) fogásához igazodik; az {{key:Alt}} tartásával szabad pontot kap.
3. A kijelző megadja a vízszintes távolságot (ΔH), a függőleges távolságot (ΔV), a lejtést százalékban az arányával, és az egyenes hosszt, a projekt mértékegységeiben.

Új méréshez kattintson újra. Az {{key:Esc}} törli, az {{key:M}} pedig kikapcsolja a mérést.

## Keresztszelvény-lapok

A **Mintavételi vonalak** alatti {{ui:Keresztszelvény lapok (PDF)}} gomb minden szelvényt PDF-oldalakra tesz, szelvényszám-sorrendben, balról jobbra és felülről lefelé sorokban. Válassza ki a **Papírméretet**, az **Alaprajzi léptéket** (a szelvények vízszintes léptékét) és a **Hossz-szelvény-nagyítást** (1×, 2×, 5× vagy 10×); a párbeszédpanel megmondja, hány szelvény fér egy oldalra, és hány oldal lesz ebből.

Minden szelvényen rács látszik az eltolásokkal és magasságokkal, a terep (szaggatott), a terv, a bevágás és töltés árnyékolva (narancssárga és zöld), a sávpontok, alatta pedig a szelvényszám és a bevágási és töltési területek. A lapokon minden szelvény azonos méretű, akkora, mint a legnagyobb; ha ez a nagyítással nem fér el az oldalra, a CivilCraft a legnagyobbat használja, amely elfér, és ezt jelzi. A címsáv megnevezi a nyomvonalat, az oldalon lévő szelvényszámokat, a léptékeket és a „1. lap / 3” jelzést.

## Mihez mérjük a bevágást és a töltést

Egy sávnak lehetnek rétegei a burkolat alatt: pályaszerkezeti rétegek, sablonelemek, pálya. A szelvénysávban lévő **Térfogatok mérése eddig** választó határozza meg, meddig fut a bevágás és a töltés:

- **Alsó felület** (kezdeti beállítás): ezen elemek aljáig, így a bevágás tartalmazza a burkolatszerkezet mélységét.
- **Felső felület**: csak a terv tetejéig, ahogy az elemek számítása előtt volt.

A fejléc területei, az alul lévő térfogatok, a CSV és a tömegdiagram mind ehhez a választáshoz igazodnak, és a projekttel együtt mentődik.

## Térfogatok átlagos véglapok szerint

Két szomszédos szelvény között a térfogat a két terület átlaga szorozva a szelvényszámaik távolságával. A sáv a nyomvonal összegeit mutatja, a {{ui:CSV}} pedig letölti minden szelvény területeit és térfogatait futó összegekkel (köbyard láb-projekteknél, köbméter metrikus projekteknél).

A **Tulajdonságok** ugyanezeket az összegeket mutatja a [Földmunka-térfogatok](topic:volumes) rácsmódszerű térfogatai mellett. A kettő különböző közelítés: a sűrűbb szelvények közelebb hozzák őket, és egyenes úton, sík terepen megegyeznek.

:::note
A bevágás és a töltés csak a szintezett területeken belül számít (a sáv vagy tereplépcső rézsűvonalain belül), a rácsmódszernek megfelelően. Sáv vagy tereplépcső nélkül a terv maga a terep, így a szelvény nem mutat bevágást vagy töltést.
:::

## Tömegdiagram

A **Mintavételi vonalak** alatti **Tömegdiagram** ugyanazokból a véglap-térfogatokból rajzolja a tömegdiagramot: a szelvényszámok mentén a bevágás és töltés különbségének futó összegét.

- **A bevágás zsugorodása (−) vagy duzzadása (+)** megmutatja, mennyi töltés lesz egy köbyard bevágásból, miután beépítették: −10% (a kezdőérték, helyőrző) azt jelenti, hogy 0,9-re zsugorodik; a duzzadó kőzet akár +5% is lehet. Használja a geotechnikai jelentésének értékét.
- Ahol a vonal emelkedik, ott az út bevágásban van; ahol süllyed, ott töltésben. A nulla fölött (narancssárga árnyékolással) a föld a szelvényszám növekedése felé mozog; a nulla alatt (zöld) a szelvényszám csökkenése felé.
- Az **egyensúlyi pontok** ott vannak, ahol a vonal átmetszi a nullát: kettő között a bevágás és a töltés kiegyenlíti egymást. A táblázat felsorolja minden kiegyenlített szakaszt, a mozgatott térfogatot (a legmagasabb vagy legalacsonyabb pontját) és az átlagos szállítási távolságot (az árnyékolt terület osztva ezzel a térfogattal).
- Ahol a vonal nem nullán végződik, a fennmaradó rész **lerakás** (fent) vagy **kitermelés** (lent). Ebben az utolsó szakaszban csak az a föld számít mozgatottnak, amely azon a szinten túl van, ahol a vonal véget ér.

A **CSV** menti minden szelvény tömegordinátáját, a szakaszokat és a tényezőt.
