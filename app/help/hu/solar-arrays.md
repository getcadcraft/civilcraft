---
title: Napelemtömbök elhelyezése a talajon
summary: Földre telepített napelemtáblák elhelyezése telken vagy tereplépcsőn, a sorok távolsága a valóban álló talaj szerint, a meredek terület üresen hagyva, az éves energia kiszámítása, a táblák megjelenítése az alaprajzon és 3D-ben.
keywords: napelem, pv, fotovoltaikus, tömb, földi telepítés, táblák, sorok, sortávolság, árnyék, terep, lejtő, cölöpök, hozam, kWp, energia, horizont
from: 95593fd6
---

## Mit fog megtanulni

Hogyan helyezhet el napelemtáblákból álló mezőt nem sík területen, és mit jelentenek a számok. Megnyitás: Felület › Továbbiak › Napelemtömbök.

## A táblák elrendezése

1. Adja meg a **Hol** értéket: a projekt egy telkét vagy tereplépcsőjét, vagy írja be a terület sarkait. Jelölje be azokat a tereplépcsőket vagy telkeket, amelyeknek **üresen** kell maradniuk (épület, tó).
2. Írja be a terület **szélességi és hosszúsági fokát**. A nap helyzete ezektől függ, ezeket nem becsüli a program. Ha a projektnek van koordináta-rendszere, a **Elhelyezés a koordináta-rendszerből** gomb kitölti őket.
3. Állítsa be a dőlésszöget, a tájolást (üresen hagyva az Egyenlítő felé néz), azt, hogy hány modul alkot egy táblát, valamint a modul teljesítményét és méretét. A modulok számai általános értékekként indulnak, és ezt jelzik is; írja be a sajátjait.
4. Nyomja meg a **Táblák elrendezése** gombot. Az ablak megadja a táblák és a modulok számát, a teljesítményt kWp-ben és a sorok közötti távolságot.

A táblák oszlopokként kerülnek a területre: elölről indulva, hátrafelé haladva helyezi el őket a program. Egy tábla csak ott kerül elhelyezésre, ahol a talaj a lejtési határon belül van, a területen és az építési vonalon belül, valamint ahol a szükséges cölöpök nem magasabbak a beállított határnál. A sikertelen helyek üresen maradnak, az ablak megmondja, hány van belőlük és miért.

## A sorok távolsága a talajhoz igazodik

Sík terepen a sorok a szokásos árnyékmentességi szabály szerint állnak egymástól távol: egy sor árnyéka télen, napforduló napján délben nem érhet el a mögötte lévő sor alsó élét. Lejtőn a CivilCraft ugyanezt a szabályt alkalmazza arra a talajra, amelyen a következő sor valójában áll. Ahol a talaj emelkedik egy tábla mögött, a sorok közelebb állhatnak; ahol lejt, távolabb. Az ablak a legkisebb, a legnagyobb és az átlagos távolságot mutatja a sík terepi távolság mellett, így látható, mit tett a terep.

A tábla síkját cölöpökön emeli meg addig, amíg az alatta lévő minden mintavételi pont a beállított szabad magassággal a talaj fölé nem kerül. A legmagasabb cölöp az eredményben látható.

## Az éves energia

Az **Éves energia** kiszámítja a megdöntött síkra jutó fényt minden hónap egy jellemző napjára, a cella hőmérsékletét, a megadott veszteségeket, a táblák egymásra vetett árnyékát, valamint azt, hogy a horizonton lévő dombok mennyi napfényt vesznek el a rejtett napsugárzásból. Tiszta égbolttal számol, ezért a válasz felső határ; a valós időjárás kevesebbet ad. Ez korai tervezési becslés, nem termelési jelentés.

## Megtartás

A **Mentés a projektbe** megőrzi a bemeneteket és az eredményeket a projektfájlban; a táblák a fájl megnyitásakor újra kiszámítódnak a talajból, így a megváltozott felület elmozdítja őket. A táblák az alaprajzon és 3D-ben jelennek meg (Megjelenítés › Napelemtömbök). A táblázat CSV-ként tölthető le. Egy visszavonási lépés eltávolít vagy visszaállít egy tömböt.

## Még nincs elkészítve

Időjárási adatok az égbolt helyett, a kelet–nyugati irányban a terepet követő táblák, napkövetők, valamint a villamos tervezés (stringek, vezetékek, inverterek) a CivilCraftban. A BimCraft Napelem PV panelje a tetőkhöz készít stringeket és egyvonalas vázlatot.
