---
title: Újdonságok a 0.9-ben (korábbi)
summary: Sáv- és terepsablonok, fogások és kiválasztó gombok rajzoláskor, GIS-elemzés attribútumtáblával, árnyék-, napenergia-, komfort- és szélvizsgálatok egy telekre, 3D-s renderelt nézet, valamint a Pontfelhők és a WaterCraft bővítmények.
keywords: újdonságok 0.9, korábbi kiadás, újdonságok, 0.9, kiadási megjegyzések, sávsablonok, terepsablonok, sablonszerkesztő, tipikus keresztmetszet, több sáv, fogás, fogások, kiválasztás, mozgatás, másolás, forgatás, érintő, renderelés, 3D renderelés, GIS-elemzés, puffer, átfedés, térbeli összekapcsolás, attribútumtábla, stílus attribútum szerint, árnyékvizsgálat, napenergia-hozam, UTCI, szabadtéri komfort, szélvizsgálat, OpenFOAM, pontfelhők, LAS, LAZ, WaterCraft, tűzivíz-hozam, tűzcsap, víz kora, klór, igények, súgóbuborékok, elrendezés, változásnapló, változások, 0.8, 0.8.1, verzió, új funkciók, eső, csapadékvíz, pangás, túlcsordulás, földmunka, kiegyenlítés, térfogat, bevágás és töltés, szállítás, legjobb nyomvonal, legolcsóbb út, nyomvonal, víztározó, kifolyó, leürülési idő, szabad magasság, előrehaladás, felmérés, drón, készlethalom, címre helyezés, telek, talaj, árvíz, lejtőstabilitás, Bishop, süllyedés, csomópont, festés, jelzések, látótávolság, kiegyenlítés, legkisebb négyzetek, poligonvonal, nyílt bánya, blokkmodell, rádiókapcsolat, Fresnel, váltó, átvezetés, nyelvek, problémák, élő, DWG
from: 4664522c
---

Ez a 0.8.1-hez képest a CivilCraft 0.9-ben megváltozott dolgokat tartalmazza. A CivilCraft 0.9 része a CadCraft Studio 0.9-nek és annak nyolc alkalmazásának. A nagy részek: sáv- és terepsablonok, fogások rajzoláskor, GIS-elemzés, a telek napjának, napenergia-hozamának, komfortjának és szelének vizsgálata, valamint két bővítmény: a Pontfelhők és a WaterCraft.

## Új

### Sáv- és terepsablonok

- **Sávsablonok.** Nyissa meg a {{ui:Felület}} › {{ui:Továbbiak}} › {{ui:Sávsablonok…}} menüpontot (vagy gépelje be: {{cmd:TEMPLATES}}). A sablon egy kis keresztmetszet elemekkel, eltolásokkal, lejtésekkel, anyagokkal és pontkódokkal. Tárolja őket a projektben, a {{ui:Saját könyvtár}} részben vagy `.cctemplates.json` fájlként. A sablonszerkesztő valós méretarányú rajzot mutat, és beírás közben listázza a problémákat.
- **Építés sablonokból állomásonként.** Jelöljön ki egy nyomvonalat, és kapcsolja be a {{ui:Build from templates by station}} opciót a Tulajdonságokban. Minden régió mindkét oldalának saját burkolatlistája és saját végfeltétele van. A {{ui:Sáv hozzáadása}} gomb a {{ui:Sávok ezen a tengelyen}} alatt több sávot helyez egy nyomvonalra.
- **Terepsablonok.** {{ui:Felület}} › {{ui:Továbbiak}} › {{ui:Terepsablonok…}} (vagy gépelje be: {{cmd:TERRAINTEMPLATES}}) rétegezett anyagokat, például termőföldet vagy burkolatot és alapot ráterít a terepre, rétegenként területtel és térfogattal. Lásd: [Sávsablonok és terepsablonok](topic:corridor-templates).

### Rajzolás

- **Fogások.** A Nyomvonal, Tereplépcső, Telek, Tömeg, Jellemzővonal, Mérés, Határvonal és Vízgyűjtő eszközök a felmérési pontokra, PI-kra, sarkokra, csúcsokra és műtárgyakra fognak, a jelölő mellett felirattal. Az {{key:Alt}} tartásával szabad pontot kap.
- **Kiválasztó gombok, érintő, mozgatás, másolás, forgatás.** A tereplépcsők, telkek és jellemzővonalak sarkainál beírható Kelet és Észak mezők, valamint egy célkeresztes {{ui:Kiválasztás}} gomb van. A Tulajdonságokban emellett van {{ui:Érintő két pontból}} nyomvonalakhoz, és {{ui:Mozgatás, másolás és forgatás}} nyomvonalakhoz, tereplépcsőkhöz, telkekhez és jellemzővonalakhoz. Lásd: [Rajzolás fogásokkal, kiválasztott sarkokkal, mozgatással, másolással, forgatással](topic:draft-with-snaps).
- **Renderelt nézet 3D-ben.** A 3D-sávon lévő {{ui:Renderelés}} gomb a területet természetes színekkel, égbolttal, párával és lágy árnyékokkal rajzolja. A modellt nem változtatja meg. A {{ui:Nap}} menü most {{ui:Alkalmaz}} és {{ui:Bezárás}} gombokkal rendelkezik. Lásd: [A telek megtekintése 3D-ben](topic:site-3d).
- **A panelek egyszerre egy szakaszt nyitnak meg.** A bal oldali panel és a Tulajdonságok panel egy szakaszt nyit meg, és bezárja a többit; a tájépítészeti szalag több eszközt tartalmazó csempéi osztott gombok.

### GIS-elemzés

- **Elemzés.** A {{ui:Felület}} › {{ui:Továbbiak}} › {{ui:Elemzés}} puffert, átfedést, térbeli összekapcsolást, kijelölést attribútum vagy alak szerint, valamint mérést kínál. Minden eszköz egy visszavonható lépésben új réteget készít.
- **Attribútumtábla.** A réteg három pontos menüjében van a {{ui:Attribútumtábla…}} és a {{ui:Stílus attribútum szerint…}}. Lásd: [GIS-rétegek elemzése](topic:gis-analysis) és [Dolgozás a réteg attribútumtáblájával](topic:gis-table).

### A telek: nap, napenergia, komfort és szél

- **Környezet szakasz.** Jelöljön ki egy tömeget: a {{ui:Környezet}} szakasz a Tulajdonságokban a {{ui:Napsütéses órák}} alatt található. Árnyékvizsgálatot tartalmaz (térkép, táblázat, animáció, CSV), napenergia-hozamot egy tipikus éves időjárási fájlból (.epw) és szabadtéri komfortot (UTCI).
- **Szél, csak szűrés.** A {{ui:Szélvizsgálat futtatása}} gomb a terepet színezi az ülhetőtől a kellemetlenig minden szélirányra, az időjárási fájl szerint. Nincs validálva, és a panel ezt meg is mondja.
- **Gyalogosszél (OpenFOAM) bővítmény.** Ki van kapcsolva, amíg be nem kapcsolja a {{ui:Beállítások}} › {{ui:Bővítmények}} menüben. Az OpenFOAM egy szoftver, amelyet saját maga telepít. Lásd: [Árnyék, napenergia-hozam és szabadtéri komfort](topic:environment).

### Pontfelhők (bővítmény)

- Kapcsolja be a {{ui:Pontfelhők}} opciót a {{ui:Beállítások}} › {{ui:Bővítmények}} menüben; a jobb oldali panelen megjelenik a Pontfelhők lap. Nyisson meg egy LAS- vagy LAZ-fájlt, tisztítsa meg, válogassa szét talajra, növényzetre és épületekre, készítse el a terepet, a szintvonalakat és a térfogatokat, és exportálja LAS vagy LAZ formátumban. Lásd: [Pontfelhők drónról vagy szkennerről](topic:point-clouds).

### WaterCraft (bővítmény)

- Kapcsolja be a {{ui:WaterCraft (vízelosztás)}} opciót a {{ui:Beállítások}} › {{ui:Bővítmények}} menüben; megjelenik a WaterCraft lap. Van benne vevői igény, tűzivíz-hozam minden tűzcsapnál, az, hogy melyik vezeték kiesése a legfontosabb, valamint a víz kora és a klór, mindegyik CSV-ként mentve. Lásd: [WaterCraft: igények, tűzivíz-hozam, kiesések és víz kora](topic:watercraft).

### Közös munka

- Egy Live munkamenetben látja egymás kurzorát és nevét az alaprajzon. Könyvtári növények: a CivilCraft Tájépítészet az alapértelmezett könyvtári gyűjteményéből indul, a {{ui:CivilCraft tájépítészet}}.

## Minden alkalmazásban

- A súgók Bootstrap-eszköztippekként jelennek meg, a kezdő tipp bezárható.
- A panel lapsora, ha nem fér ki, görgethető, nem vágódik le.
- A böngészőlapok címe így szerepel: `<dokumentum> - CivilCraft | CadCraft`.
- A {{ui:Beállítások}} menüben van egy Elrendezés szakasz, ahol az elrendezések kétsoros választásokból álló legördülő listában vannak.
- A tömeg- és hőmérséklet-mértékegységek a {{ui:Beállítások}} › {{ui:Globális}} › {{ui:Mértékegységek}} alatt vannak.
- A nyelvlista azokat a nyelveket mutatja, amelyekhez a verzió tartalmaz fájlt. Az angolon kívüli nyelvek gépi piszkozatok.

## Javítva

- A címkereső és az EnergyPlus-ellenőrző bővítmények nem voltak bekapcsolhatók; most már igen.
- A súgó most már megmondja, hogy a Pontfelhők bővítmény a tisztított felhőt LAS 1.4 vagy LAZ formátumban írja.
- A kijelölt objektum saját fogópontjára kattintás már nem indít fogópont-húzást, amely megállította a várakozó Kiválasztást.

## Őszinte korlátok

- A példa sávsablonok nem szabványból származó helyőrzők; mérnöknek kell ellenőriznie őket. A terepsablonok nem adnak felületet, és nincsenek megrajzolva 3D-ben vagy a keresztszelvény-nézetben. Egy nyomvonalon lévő második sáv nincs az IFC-exportban. Két állomásonkénti sablon között nincs szűkítés.
- A pontfelhőket kitalált fájlokon teszteltük, nem valódi drónfelmérésen. Csak a LAS és LAZ formátum olvasható.
- A GIS-elemzést kitalált rétegeken teszteltük.
- Az árnyék-, napenergia- és komfortadatok tervezési becslések; a szél validálatlan szűrés. Egyik sem tervezési érték.
- A WaterCraft kitalált hálózatokon ellenőrzött számítási segédeszköz. A vízmérnök dönti el, mit érnek a számok.
- Az angolon túli nyelvek gépi piszkozatok.
- A Windows-telepítők nincsenek kódaláírva, a macOS lemezkép pedig nincs notarizálva.

## Korábbi: 0.8 és 0.8.1

Ez a 0.7-hez képest a CivilCraft 0.8 (2026. november 1.) és 0.8.1 (2026. november 2.) verzióiban megváltozott dolgokat tartalmazza. A nagy újdonságok olyan eszközök, amelyek a szintezését és a telkét teszik próbára (eső, földmunka, útvonalak, tavak, előrehaladás), valamint hat számítási ablak a talajhoz, utakhoz, felméréshez, bányákhoz, összeköttetésekhez és vasúthoz.

### Új

**Teszteli a szintezését**

- **Essen eső.** A {{ui:Esőztetés…}} ({{ui:Felület}} alatt) vihart küld a szintezett terepre. Láthatja, ahogy a víz lefolyik a tereplépcsőkről, az alacsony sarkokban áll, és túlcsordul a túl kicsi tavakon. A futás animált, és megadja a térfogatokat, a csúcs kifolyást és minden tóról egy CSV-t. Az alapértelmezett cella durva, hogy az első nézet gyors legyen; a finomabb cella lassabb. A túlcsorduló tavak a Problémák panelen is megjelennek.
- **Földmunka-kiegyenlítő.** A {{ui:Földmunka-kiegyenlítő…}} egy tereplépcsőt emel vagy süllyeszt, amíg a bevágás meg nem egyezik a töltéssel, és megmutatja a közöttük lévő szállítási táblázatot.
- **Legjobb nyomvonal.** A {{ui:Legjobb nyomvonal…}}: válasszon kezdő- és végpontot, és a CivilCraft megtalálja a legolcsóbb utat a terepen, amely betartja a lejtési és ívhatárait, majd nyomvonalat készít belőle.
- **Víztározó medencék.** A {{ui:Víztározó medencék…}} a terepéből kiszámítja a vízszintet és a tárolást, kifolyó-szerkezeteket vesz figyelembe (fojtónyílás, bukó, V-bevágás, átfolyó), átvezeti rajta a vihart, és ellenőrzi a visszatartott csúcsot, a leürülési időt és a szabad magasságot.
- **Előrehaladás felmérésekből.** Az {{ui:Előrehaladás a felmérésekből…}} összehasonlítja a különböző dátumú drón- vagy szkennelt felületeket a terep akkori állapotával és a tervvel: térfogat szerinti készültségi százalék, a túlásott és túltöltött területek, készlethalmok, valamint hogy mikor fejeződik be a munka ezen a tempón (becslésként jelölve).

**Ismerje meg a telket**

- **Cím a területhez.** A {{ui:Cím a területhez…}} egy telken egy sorba rendezi a nyílt telek-, épület-, övezeti, talaj-, árvíz- és terepadatokat. A telket a projektfájlban is megtarthatja: a beírt címet, minden forrást azzal a nappal, amikor lehívta, és a licencével, valamint azt, ami visszajött. Ha újra megnyitja vagy megosztja a projektet, a telek még mindig ott van, és semmit nem kell újra lehívni. Telekfájlként is mentheti, vagy elküldheti a BimCraftnak. Lásd: [Cím a területhez](topic:address-to-site).

**Talaj, utak, felmérés, bányák, összeköttetések és vasút**

- **Talajok és rézsűk.** A {{ui:Talajok és rézsűk…}} a beírt fúrások közötti talajszelvényt rajzolja. A Bishop-módszer ezután megkeresi a kritikus kört a terepén, talajvízszinttel, többletterheléssel és földrengési együtthatóval; az alapozás süllyedésénél konszolidáció, azonnali süllyedés és idő számolódik.
- **Csomópontok és festés.** A {{ui:Csomópontok és festés…}} a csomópontok ágait szegélykanyarokkal kapcsolja össze (ágankénti egy sugár, vagy háromközéppontú kanyar), kiszámolja a tervezési sebességhez tartozó látótávolságot, ellenőrzi a látómezőháromszögeket, és gyalogátkelőket, megállóvonalakat, festéseket és táblákat rak ki táblajegyzékkel együtt. Az alaprajzon rajzolódnak, és .dxf-ként, elnevezett rétegekkel mentődnek.
- **Felmérés kiegyenlítése.** A {{ui:Mérés kiegyenlítése…}} egy sokszögvonal vagy hálózat legkisebb négyzetes kiegyenlítését végzi: kiegyenlített koordinátákat, hibaellipszisokat, khi-négyzet próbát és jelzést a nem illeszkedő mérésen. Szabad hálózatok, sokszögvonal-zárás az iránytű-szabállyal, valamint RW5, GSI, JobXML vagy CSV terepi fájlok is benne vannak, a kiegyenlített pontok pedig CSV-ként mentődnek.
- **Nyílt bányák.** A {{ui:Külszíni bányák…}} a fúrásmintákból blokkmodellt és a lejtőszögén belüli végső gödröt készít, a fedőkőarányt, pad szerinti táblázatot, valamint a minőség- és tonnázsgörbét. Ott van a bevételi tényező szerinti egymásba ágyazott gödör és a diszkontált cash flow-val rendelkező termelési ütemterv is.
- **Rádiós összeköttetések.** A {{ui:Rádiós összeköttetések…}} ellenőrzi a látóvonalat a terepén a Föld görbületével, az első Fresnel-zónával, a kapcsolati költségvetéssel, a fakulási tartalékkal és a többutas kiesésekkel, és megadja azt az árbocmagasságot, amely tisztán hagyja az utat. Emellett száloptikai veszteség-költségvetést, mennyiségeket és a tornyon ható szelet is számol.
- **Vasúti váltók.** A {{ui:Vasúti váltók…}} a váltót a keresztezési számából készíti el, párhuzamos vágányok közötti átvezetéseket és a kanyarban keresztlejtéssel megdöntött, ívben kiszélesített szabad szelvényt. A váltó a nyomvonal egy szelvényszámán is állhat.

Lásd: [Talajok, csomópontok, felmérés-kiegyenlítés, bányák, rádiós összeköttetések és váltók](topic:soils-roads-survey-mines-links).

### Minden alkalmazásban

- **Nyelvek.** 54 nyelv, ebből tíz új. Az angolon kívüli nyelvek gépi piszkozatok, amíg anyanyelvi beszélő át nem nézi őket. A súgótémakörök még többnyire angol nyelvűek.
- **Eszköztársorok.** {{ui:Beállítások}} › {{ui:Általános}} › {{ui:Eszköztársorok}}: Tördelés (mint korábban), 2 sor vagy 1 sor. A CivilCraft szalagja a leggyakrabban használt eszközt nagyban, a következőket kicsiben, a többit a csoportnév nyilán belül mutatja.
- **Beviteli eszközök.** Touchpad, toll, 3D egér, vezérlő és MIDI is működtetheti az alkalmazásokat.
- **Problémák.** A Problémák panel minden alkalmazásban figyelmeztet, ellenőrzései szabálycsomagokat olvasnak.
- **Élő.** Nézet arról, ki hol van egy Live munkamenetben.
- **Bővítmények.** Bővítménylista, világítási bővítményekkel.
- **MI-asszisztens csatlakoztatása.** Bármely csatlakoztatott asszisztens működtetheti a CivilCraft eszközeit. A kiadás jelzi, hogy a CadCraft Studióban az egykattintásos csatlakoztatás és a hosztolt összekötő még nincs kész. Lásd: [Hagyja, hogy egy MI-asszisztens dolgozzon a telkén](topic:assistants).

### Javítva a 0.8.1-ben

- **DWG osztályszakasz.** Hibás típusként olvasták be (GitHub cadcraft#5). Javítva a CivilCraftban, a CadCrafttal, BimCrafttal, ModelCrafttal és TakeoffCrafttal együtt.
- **Nyelvváltás futás közben.** A CadCraft Studio és a csomagolt kiadások futás közben is válthatnak nyelvet. Korábban csak angol volt. Még nem tesztelték minden platformon: jelezze, ha a nyelv nem változik.

### Ebben a verzióban még nincs

- **Ezek számítási segédeszközök.** Az új ablakok minden eredményét mérnöknek kell ellenőriznie. A talajszilárdságok a talajcsoport tipikus értékeiből indulnak, és az ablak ezt mondja is.
- **Essen eső.** Egy futás a mintatelken finom cellánál a böngészőben két percnél tovább is tarthat. Kézi esetekkel és V alakú vízgyűjtővel ellenőriztük, még nem valódi szintezett telken.
- **Cím a területhez.** Az Ön által hozott nyílt adatfájlokat olvassa, és csak saját fájljainkon teszteltük. A fák nem forrás. A források Ön helyett történő lehívása az adatvédelmi szöveg véglegesítésére vár.
- **Előrehaladás felmérésekből.** Csak kitalált felméréseken tesztelték. A lapok és jelölések (MarkupCraft) előrehaladása, valamint a szkennelés modellel való összevetése (BimCraft) nincs elkészítve.
- **Talajok és rézsűk.** Csak körfelületek: nincs ék- vagy blokkkeresés és nincs húzórepedés.
- **Csomópontok.** Ágankénti egy sugár, nincsenek teherautó-végigvezetett pályák, és még nem kerülnek be a sávba.
- **Terepi fájlok.** Az olvasókat nyilvános formátumleírásokból írtuk, és saját készítésű fájlokon próbáltuk ki. Valódi műszerfájlokra van szükség.
- **Összeköttetések és vasút.** Rádiós összeköttetések: csak szabad térbeli veszteség és többutas terjedés (nincs esőfakulás vagy antennadiagram), és nincs vasúti szabvány: minden vasúti határérték helyőrző, piszkozatszámokkal, amelyeket vasútmérnök még nem ellenőrzött.
- **Windows és macOS.** A 0.8 nincs kódaláírva. A Windows figyelmeztethet, a macOS pedig jobb gombos kattintást, majd Megnyitás választását kéri.

Minden más a [Még nincs elkészítve](topic:not-built-yet) oldalon található. A korábbi kiadásról lásd: [Újdonságok a 0.7-ben](topic:whats-new-0-7).
