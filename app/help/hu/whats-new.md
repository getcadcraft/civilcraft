---
title: Újdonságok a 0.8 és 0.8.1 verzióban
summary: A CivilCraft 0.8 új funkciói: Esőztetés (viharfutás a tereprendezett terepen), földmunka-kiegyenlítő, legjobb nyomvonal kereső, víztározó medencék, előrehaladás a felmérésekből, a területet a projektben megtartó címből helyszín importáló, valamint ablakok talajokhoz és rézsűkhöz, csomópontokhoz és festéshez, mérés kiegyenlítéséhez, külszíni bányákhoz, rádiós összeköttetésekhez és vasúti váltókhoz. A 0.8.1 a DWG-fájlok olvasását javítja.
keywords: újdonságok, kiadási megjegyzések, változásnapló, változások, 0.8, 0.8.1, verzió, új funkciók, eső, vihar, pocsolyásodás, túlcsordulás, földmunka, kiegyenlítés, töltés, bevágás, szállítás, legjobb útvonal, legkisebb költség, nyomvonal, víztározó medence, kifolyó, leürítés, szabadmagasság, előrehaladás, felmérés, drón, készlethalom, cím a területhez, telek, talaj, árvíz, lejtőstabilitás, Bishop, süllyedés, csomópont, festés, táblák, látótávolság, kiegyenlítés, legkisebb négyzetek, sokszögvonal, külszíni bánya, blokkmodell, rádiós összeköttetés, Fresnel, váltó, keresztezés, nyelvek, problémák, Live, DWG
from: b0932cf0
---

Ez változott a CivilCraft 0.8-ban (2026. november 1.) és a 0.8.1-ben (2026. november 2.), a 0.7-hez képest. A nagy új részek azok az eszközök, amelyek a tereprendezést és a területet tesztelik (eső, földmunka, útvonalak, víztározók, előrehaladás), valamint hat számítási ablak a talajhoz, az utakhoz, a felméréshez, a bányákhoz, az összeköttetésekhez és a vasúthoz.

## Új

### A tereprendezés tesztelése

- **Esőztetés.** {{ui:Esőztetés…}} (a(z) {{ui:Felület}} alatt) vihart enged a tereprendezett talajra. Figyelheti, ahogy a víz lefolyik a tereplépcsőkről, a mély sarkokban összegyűlik, és túlcsordul a túl kicsi medencéken. A futás animált, és megadja a térfogatokat, a csúcs-kifolyást és minden medencéről egy CSV-fájlt. Az alapértelmezett cella durva, hogy az első áttekintés gyors legyen; a finomabb cella lassabb. A túlcsorduló medencék a Problémák panelen is megjelennek.
- **Földmunka-kiegyenlítő.** {{ui:Földmunka-kiegyenlítő…}} emeli vagy süllyeszti a tereplépcsőt, amíg a bevágás egyenlő a töltéssel, és megmutatja közöttük a szállítási táblázatot.
- **Legjobb nyomvonal.** {{ui:Legjobb nyomvonal…}}: jelöljön ki kezdő- és végpontot, a CivilCraft pedig megkeresi a legolcsóbb utat a terepen, amely betartja a lejtési és ívhatárokat, majd ebből nyomvonalat készít.
- **Víztározó medencék.** {{ui:Víztározó medencék…}} a talajából számítja ki a vízszintet és a tárolást, kifolyó elemeket vehet figyelembe (nyílás, bukó, V-bukó, túlfolyó), átvezet egy vihart a medencén, és ellenőrzi a visszatartott csúcsot, a leürítési időt és a szabadmagasságot.
- **Előrehaladás a felmérésekből.** {{ui:Előrehaladás a felmérésekből…}} összehasonlítja a különböző dátumú drón- vagy szkennelt felületeket a korábbi talajjal és a tervvel: térfogat szerinti készültségi százalékot, túlásott és túltöltött területeket, készlethalmokat, valamint azt, hogy a munka ezen a tempón mikor fejeződik be (becslésként jelölve).

### A terület megismerése

- **Cím a területhez.** {{ui:Cím a területhez…}} egy helyszínen egyesíti a nyílt telek-, épület-, övezeti, talaj-, árvíz- és terepadatokat. A területet a projektfájlban is megtarthatja: a beírt címet, minden forrást azzal a nappal, amikor lekérte, és a licencével, valamint azt, ami visszaérkezett. Ha újra megnyitja vagy megosztja a projektet, a terület továbbra is ott lesz, újabb lekérés nélkül. Területfájlként is mentheti, vagy a BimCraft programba küldheti. Lásd: [Cím a területhez](topic:address-to-site).

### Talaj, utak, felmérés, bányák, összeköttetések és vasút

- **Talajok és rézsűk.** {{ui:Talajok és rézsűk…}} a beírt fúrások között rajzolja meg a talajszelvényt. Ezután a Bishop-módszer a terepen keresi a kritikus kört, figyelembe véve a talajvízszintet, a pótterhelést és a földrengési tényezőt; egy alapozás süllyedésénél a konszolidációt, az azonnali süllyedést és az időt számolja.
- **Csomópontok és festés.** {{ui:Csomópontok és festés…}} összeilleszti az ágakat szegélyívekkel (ágankénti egy sugárral vagy háromközéppontú ívekkel), kiszámolja a tervezési sebességhez tartozó látótávolságot, ellenőrzi a látóháromszögeket, gyalogátkelőhelyeket, megállóvonalakat, jelöléseket és táblákat táblajegyzékkel. Ezek a térképen rajzolódnak meg, és elnevezett rétegekkel .dxf fájlként mentődnek.
- **Mérés kiegyenlítése.** {{ui:Mérés kiegyenlítése…}} sokszögvonal vagy hálózat legkisebb négyzetes kiegyenlítését végzi: kiegyenlített koordinátákat, hibaellipsziseket, khi-négyzet próbát, és jelölést azokon a méréseken, amelyek nem illeszkednek. Szabad hálózatok, a sokszögvonal zárása iránytű-szabállyal, valamint RW5, GSI, JobXML vagy CSV terepi fájlok is támogatottak, a kiegyenlített pontok pedig CSV-ként menthetők.
- **Külszíni bányák.** {{ui:Külszíni bányák…}} a fúrási mintákból blokkmodellt készít, valamint a végső gödröt a lejtésszögén belül, a meddőarányt, lépcsőnkénti táblázatot és tartalom- és tonnázisgörbét. Ugyanitt megtalálhatók a bevételi tényező szerinti egymásba ágyazott gödrök és a diszkontált pénzáramlással készült termelési ütemterv.
- **Rádiós összeköttetések.** {{ui:Rádiós összeköttetések…}} ellenőrzi a látóvonalat a terepen a Föld görbületének, az első Fresnel-zónának, az összeköttetési költségvetésnek, a fakulási tartaléknak és a többutas kimaradásnak a figyelembevételével, és megadja azt az árbócmagasságot, amely tiszta átjárást biztosít. Emellett készít optikai szálas csillapítási költségvetéseket, útvonal-mennyiségeket, és számolja a szélterhelést a tornyon.
- **Vasúti váltók.** {{ui:Vasúti váltók…}} váltót készít a kereszteződési szám (frog) alapján, átkötéseket párhuzamos vágányok között, valamint szabad szelvényt, amelyet a túlemelés megdönt, és ívben kiszélesít. A váltó a tengelyvonal egy állomásán is elhelyezhető.

Lásd: [Talajok, csomópontok, mérés kiegyenlítése, bányák, rádiós összeköttetések és váltók](topic:soils-roads-survey-mines-links).

## Minden alkalmazásban

- **Nyelvek.** 54 nyelv, ebből tíz új. Az angoltól eltérő nyelvek gépi piszkozatok, amíg anyanyelvi beszélő el nem olvassa őket. A súgótémakörök még többnyire angol nyelvűek.
- **Eszköztársorok.** {{ui:Beállítások}} › {{ui:Általános}} › {{ui:Eszköztársorok}}: Tördelés (mint korábban), 2 sor vagy 1 sor. A CivilCraft Ribbon nézete a leggyakrabban használt eszközt nagyban, a következőket kicsiben mutatja, a többit pedig a csoportnév nyila mögött.
- **Beviteli eszközök.** Az alkalmazások vezérelhetők érintőpaddal, tollal, 3D-egérrel, kontrollerrel és MIDI-eszközzel.
- **Problémák.** A Problémák panel, amely minden alkalmazásban figyelmeztet, szabálycsomagokat olvasó ellenőrzésekkel.
- **Live.** Nézet arról, ki hol tartózkodik egy Live-munkamenetben.
- **Bővítmények.** Bővítménylista, benne világítási bővítményekkel.
- **Az MI csatlakoztatása.** Bármely csatlakoztatott asszisztens vezérelheti a CivilCraft eszközeit. A kiadás jelzi, hogy a CadCraft Studio-n belüli egykattintásos csatlakozás és az üzemeltetett összekötő még nem készek. Lásd: [Engedje meg, hogy egy MI-asszisztens dolgozzon a területén](topic:assistants).

## A 0.8.1 verzióban javítva

- **DWG osztályok szakasza.** Rossz típusként olvasódott (GitHub cadcraft#5). A CivilCraft javítva, a CadCraft, a BimCraft, a ModelCraft és a TakeoffCraft mellett.
- **Nyelvváltás futás közben.** A CadCraft Studio és a csomagolt kiadások futás közben is válthatnak nyelvet. Korábban csak angol volt. Még nem minden platformon tesztelték: jelezze, ha a nyelv nem változik.

## Ebben a verzióban még nincs

- **Ezek számítási segédeszközök.** Az új ablakok minden eredményéhez mérnöki ellenőrzés szükséges. A talajszilárdságok a talajcsoport tipikus értékeiből indulnak, és az ablak ezt jelzi.
- **Esőztetés.** A mintaterületen végzett futás finom cellánál a böngészőben két percnél tovább is tarthat. Kézi esetekkel és V-alakú vízgyűjtővel ellenőrizték, valós tereprendezett területen még nem.
- **Cím a területhez.** A hozott nyílt adatfájlokat olvassa, és csak saját fájlainkon tesztelték. A fák nem számítanak forrásnak. A források lekérése az adatvédelmi szöveg elkészítésére vár.
- **Előrehaladás a felmérésekből.** Csak kitalált felméréseken tesztelték. A rajzlapok és jelölések (MarkupCraft) előrehaladása, valamint a szkennelés a modellel szemben (BimCraft) még nincs elkészítve.
- **Talajok és rézsűk.** Csak körfelületek: nincs ék- vagy blokkkeresés, és nincs húzórepedés.
- **Csomópontok.** Ágankénti egy sugár, nincs teherautó-leseprési útvonal, és még nem kerülnek bele a sávba (korridor).
- **Terepi fájlok.** Az olvasók nyilvános formátumleírások alapján készültek, és saját fájlainkon próbálták ki. Valódi műszerfájlokat várunk.
- **Összeköttetések és vasút.** Rádiós összeköttetések: csak szabadtéri csillapítás és többutas terjedés (esőcsillapítás vagy antennadiagram nincs), és nincs vasúti szabvány: minden vasúti határérték helyőrző, piszkozatos számokkal, amelyeket vasúti mérnök még nem ellenőrzött.
- **Windows és macOS.** A 0.8 nincs kódaláírva. A Windows figyelmeztethet, a macOS pedig jobb gombbal kattintást, majd Megnyitást kér.

Minden más a [Még nincs elkészítve](topic:not-built-yet) részben található. A korábbi kiadásról lásd: [Újdonságok a 0.7 verzióban](topic:whats-new-0-7).
