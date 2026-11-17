---
title: Újdonságok a 0.9 verzióban
summary: Sáv- és terepsablonok, fogások és Pick gombok a rajzolás közben, GIS-elemzés attribútumtáblával, árnyék-, napenergia-, komfort- és szélvizsgálat a telekhez, 3D-s renderelési nézet, valamint a Felhőpontok és a WaterCraft bővítmény.
keywords: újdonságok, 0.9, kiadási megjegyzések, sávsablonok, terepsablonok, sablonszerkesztő, tipikus keresztmetszet, több sáv, fogás, fogások, pick, mozgatás, másolás, forgatás, érintő, renderelés, 3d renderelés, gis-elemzés, puffer, átfedés, térbeli összekapcsolás, attribútumtábla, stílus attribútum szerint, árnyékvizsgálat, napenergia-hozam, utci, szabadtéri komfort, szélvizsgálat, openfoam, felhőpontok, las, laz, watercraft, tűzivíz-hozam, tűzcsap, víz kora, klór, igények, tooltipek, elrendezés, újdonságok, kiadási megjegyzések, változásnapló, változások, 0.8, 0.8.1, verzió, új funkciók, eső, csapadékvíz, túlcsordulás, földmunka, kiegyenlítés, bevágás és feltöltés, szállítás, legjobb útvonal, legkisebb költség, vonalvezetés, víztározó, leeresztés, szabadmagasság, haladás, felmérés, drón, készlethalom, cím a telephez, telek, talaj, árvíz, lejtőstabilitás, bishop, süllyedés, csomópont, felfestés, jelzések, látótávolság, kiegyenlítés, legkisebb négyzetek, poligon, nyílt bánya, blokkmodell, rádiós összeköttetés, fresnel, váltó, kitérő, nyelvek, problémák, live, dwg
from: d7ac5b14
---

Ez az, ami változott a CivilCraft 0.9 verziójában a 0.8.1-hez képest. A CivilCraft 0.9 része a CadCraft Studio 0.9 és nyolc alkalmazása. A nagy részei a sáv- és terepsablonok, a rajzolás közbeni fogások, a GIS-elemzés, a telek napsütésének, napenergia-hozamának, komfortjának és szelének vizsgálata, valamint két bővítmény: a Felhőpontok és a WaterCraft.

## Új

### Sáv- és terepsablonok

- **Sávsablonok.** Nyissa meg a {{ui:Felület}} › {{ui:További}} › {{ui:Sávsablonok…}} menüt (vagy írja be a {{cmd:TEMPLATES}} parancsot). A sablon egy kis keresztmetszet alkotóelemekkel, eltolásokkal, lejtésekkel, anyagokkal és pontkódokkal. Tárolja őket a projektben, a {{ui:Saját könyvtár}}ban vagy `.cctemplates.json` fájlként. A sablonszerkesztő valós méretarányú rajzot mutat, és gépelés közben listázza a problémákat.
- **Építés sablonokból állomásonként.** Jelöljön ki egy vonalvezetést, és a Tulajdonságaiban kapcsolja be a {{ui:Építés sablonokból állomásonként}} lehetőséget. A régió mindkét oldalának saját burkolatlistája és saját végfeltétele van. A {{ui:Sáv hozzáadása}} az {{ui:Ezen a tengelyen lévő sávok}} alatt több sávot helyez el egy vonalvezetésen.
- **Terepsablonok.** {{ui:Felület}} › {{ui:További}} › {{ui:Terepsablonok…}} (vagy írja be a {{cmd:TERRAINTEMPLATES}} parancsot) rétegelt anyagokat, például termőtalajt vagy burkolatot és alapot húz rá egy terepre, rétegenként területtel és térfogattal. Lásd: [Sávsablonok és terepsablonok](topic:corridor-templates).

### Rajzolás

- **Fogások (snap).** Az Tengely, Plató, Telek, Tömeg, Jellemzővonal, Mérés, Határ és Vízgyűjtő eszközök a felmérési pontokra, PI-kre, sarkokra, csúcspontokra és szerkezetekre fognak, a jelölő mellett felirattal. Egy szabad ponthoz tartsa lenyomva az {{key:Alt}} billentyűt.
- **Pick gombok, érintő, mozgatás, másolás, forgatás.** A plató, a telek és a jellemzővonal sarkainak van beírható Kelet- és Észak-mezője, valamint keresztjelű Pick gombja. A Tulajdonságokban van továbbá {{ui:Érintő két pontból}} a vonalvezetésekhez, valamint {{ui:Mozgatás, másolás és forgatás}} a vonalvezetésekhez, platókhoz, telkekhez és jellemzővonalakhoz. Lásd: [Rajzolás fogásokkal, kiválasztott sarkokkal, mozgatás, másolás, forgatás](topic:draft-with-snaps).
- **Renderelési nézet 3D-ben.** A 3D-s sáv {{ui:Renderelés}} gombja a területet természetes színekkel, éggel, párával és lágy árnyékokkal rajzolja meg. A modellt nem változtatja meg. A {{ui:Nap}} menüben most már {{ui:Alkalmaz}} és {{ui:Bezárás}} gombok vannak. Lásd: [A telep megtekintése 3D-ben](topic:site-3d).
- **Panelek egyszerre egy szakasszal.** A bal oldali panel és a Tulajdonságok panel egyszerre egy szakaszt nyit meg, és a több eszközt tartalmazó Tájépítészeti szalagcsempék osztott gombok.

### GIS-elemzés

- **Elemzés.** {{ui:Felület}} › {{ui:További}} › {{ui:Elemzés}} puffert, átfedést, térbeli összekapcsolást, kiválasztást attribútum vagy alak szerint, valamint mérést kínál. Minden eszköz egy új réteget hoz létre egyetlen visszavonási lépésben.
- **Attribútumtábla.** Egy réteg három pontos menüjében ott van a {{ui:Attribútumtábla…}} és a {{ui:Stílus attribútum szerint…}}. Lásd: [GIS-rétegek elemzése](topic:gis-analysis) és [Munka a réteg attribútumtáblájával](topic:gis-table).

### A telep: napsütés, napenergia, komfort és szél

- **Környezet szakasz.** Jelöljön ki egy tömeget: a {{ui:Környezet}} szakasz a Tulajdonságaiban a {{ui:Napsütéses órák}} alatt található. Van benne árnyékvizsgálat (térkép, táblázat, animáció, CSV), napenergia-hozam egy tipikus éves időjárási fájlból (.epw) és szabadtéri komfort (UTCI).
- **Szél, csak szűrésre.** A {{ui:Szélvizsgálat futtatása}} a talajt minden szélirányra, az időjárási fájlban szereplő módon a kellemes ülőhelytől a kellemetlenig színezi. Nincs validálva, és a panel ezt meg is mondja.
- **Gyalogos szél (OpenFOAM) bővítmény.** Kikapcsolva, amíg be nem kapcsolja a {{ui:Beállítások}} › {{ui:Bővítmények}} alatt. Az OpenFOAM olyan szoftver, amelyet Ön telepít. Lásd: [Árnyék, napenergia-hozam és szabadtéri komfort](topic:environment).

### Felhőpontok (bővítmény)

- Kapcsolja be a {{ui:Felhőpontok}} lehetőséget a {{ui:Beállítások}} › {{ui:Bővítmények}} alatt; megjelenik a Felhőpontok lap a jobb oldali panelen. Nyisson meg egy LAS vagy LAZ fájlt, tisztítsa meg, sorolja a talajba, növényzetbe és épületekbe, készítse el a talajt, a szintvonalakat és a térfogatokat, és exportálja LAS vagy LAZ formátumban. Lásd: [Felhőpontok drónból vagy szkennerből](topic:point-clouds).

### WaterCraft (bővítmény)

- Kapcsolja be a {{ui:WaterCraft (vízelosztás)}} lehetőséget a {{ui:Beállítások}} › {{ui:Bővítmények}} alatt; megjelenik a WaterCraft lap. Van benne igény a fogyasztóktól, tűzivíz-hozam minden tűzcsapnál, melyik vezeték kiesése a legfontosabb, valamint víz kora és klór, mindegyik CSV-ként mentve. Lásd: [WaterCraft: igények, tűzivíz-hozam, kiesések és víz kora](topic:watercraft).

### Együttes munka

- Egy Live munkamenetben látja egymás kurzorát és nevét a terven. Könyvtári növények: a CivilCraft Tájépítészet az alapértelmezett Könyvtár-gyűjteménnyel indul, {{ui:CivilCraft tájépítészet}}.

## Minden alkalmazásban

- A súgók Bootstrap tooltipként jelennek meg, és a kezdő tipp bezárható.
- Ha egy panel lapsora nem fér ki, görgethető marad, és nem vágódik le.
- A böngészőlapok címe így néz ki: `<dokumentum> - CivilCraft | CadCraft`.
- A {{ui:Beállítások}} tartalmaz egy Elrendezés szakaszt, ahol az elrendezések legördülő listából, két soros választásokból állíthatók.
- A súly- és hőmérséklet-mértékegységek a {{ui:Beállítások}} › {{ui:Globális}} › {{ui:Mértékegységek}} alatt vannak.
- A nyelvlista azokat a nyelveket mutatja, amelyekhez a build fájlokat tartalmaz. Az angoltól eltérő nyelvek gépi piszkozatok.

## Javítva

- A cím- és az EnergyPlus-ellenőrző bővítményeket nem lehetett bekapcsolni; most már lehet.
- A súgó most megmondja, hogy a Felhőpontok bővítmény a tisztított felhőt LAS 1.4 vagy LAZ formátumban írja.
- A kijelölt objektum saját fogópontjára kattintás már nem indít fogópont-húzást, amely megállította a várakozó Pick műveletet.

## Ismert korlátok

- A példaként szolgáló sávsablonok semmilyen szabványból nem származó helykitöltők; mérnöknek kell ellenőriznie őket. A terepsablonok nem adnak felületet, és nincsenek megrajzolva a 3D nézetben vagy a keresztmetszeti nézetben. Egy vonalvezetés második sávja nincs az IFC exportban. Két sablon között nincs állomásonkénti elvékonyodás.
- A felhőpontokat kitalált fájlokon teszteltük, nem valódi drónfelmérésen. Csak a LAS és LAZ formátum olvasható.
- A GIS-elemzést kitalált rétegeken teszteltük.
- Az árnyék, a napenergia és a komfort tervezési becslések; a szél nem validált szűrés. Egyik sem tervezési érték.
- A WaterCraft számítási segédeszköz, kitalált hálózatokon ellenőrizve. Egy vízmérnök dönti el, mit érnek a számok.
- Az angolon kívüli nyelvek gépi piszkozatok, amíg egy anyanyelvi beszélő át nem nézi őket.
- A Windows-telepítők nincsenek kódaláírással ellátva, a macOS lemezkép pedig nincs notarizálva.

## Korábbi: 0.8 és 0.8.1

Ez az, ami változott a CivilCraft 0.8 (2026-11-01) és 0.8.1 (2026-11-02) verzióban a 0.7-hez képest. A nagy új részek olyan eszközök, amelyek a terepét és a telepét tesztelik (eső, földmunka, útvonalak, tavak, haladás), valamint hat számítási ablak a talajhoz, úthoz, felméréshez, bányákhoz, összeköttetésekhez és vasúthoz.

### Új

**A terep tesztelése**

- **Essen az eső.** {{ui:Essen az eső…}} (a {{ui:Felület}} alatt) vihart enged a kiszintezett talajra. Megfigyelheti, ahogy a víz lefolyik a platókról, a mélyedésekben összegyűlik, és a túl kicsi tavakon átcsordul. A futtatás animált, és megadja a térfogatokat, a csúcs-kifolyást és minden tóról egy CSV-t. Az alapértelmezett cella durva, hogy az első nézet gyors legyen; a finomabb cella lassabb. A túlcsordult tavak a Problémák panelen is megjelennek.
- **Földmunka-kiegyenlítő.** {{ui:Földmunka-kiegyenlítő…}} emel vagy süllyeszt egy platót, amíg a bevágás egyenlő a feltöltéssel, és megmutatja a közöttük lévő szállítási táblázatot.
- **Legjobb útvonal.** {{ui:Legjobb útvonal…}}: válasszon kezdő- és végpontot, és a CivilCraft megkeresi a legolcsóbb utat a terepen, amely tartja a lejtési és ívhatárait, majd ebből vonalvezetést készít.
- **Víztározó medencék.** {{ui:Víztározó medencék…}} a talajából számítja ki a szintet és a tárolást, fogadja a leeresztő elemeket (nyílás, gát, V-vágás, átfolyó), a vihart átvezeti a tavon, és ellenőrzi a visszatartott csúcsot, a leeresztési időt és a szabadmagasságot.
- **Haladás felmérésekből.** {{ui:Haladás felmérésekből…}} összehasonlítja a drón- vagy szkenfelületeket különböző dátumokról a korábbi talajjal és a tervvel: százalékos készültség térfogat szerint, túlásott és túltöltött területek, készlethalmok, és hogy mikor fejeződik be a munka ezen a tempón (becsléssel jelölve).

**A telep ismerete**

- **Cím a telephez.** {{ui:Cím a telephez…}} egy vonalba állítja a nyitott telek-, épület-, övezeti, talaj-, árvíz- és terepadatokat. A telephelyet megtarthatja a projektfájlban: a beírt címet, minden forrást azzal a napsal, amikor lekérte, és a licencével, valamint azt, ami visszajött. Ha újra megnyitja vagy megosztja a projektet, a telep még ott van, anélkül hogy bármit újra lekérne. Mentheti telephely-fájlként is, vagy elküldheti a BimCraftnak. Lásd: [Cím a telephez](topic:address-to-site).

**Talaj, utak, felmérés, bányák, összeköttetések és vasút**

- **Talajok és lejtők.** {{ui:Talajok és lejtők…}} a talajszelvényt rajzolja a Ön által megadott fúrások között. A Bishop-módszer ezután megkeresi a kritikus kört az Ön talaján, víztükörrel, pótterhelés­sel és földrengési tényezővel; egy talpalap süllyedése konszolidációt, azonnali süllyedést és időt kap.
- **Csomópontok és felfestés.** {{ui:Csomópontok és felfestés…}} ágakat köt össze szegélyívekkel (ágankénti egy sugár, vagy háromközéppontú ívek), a tervezési sebességhez tartozó látótávolságot, a látóháromszögek ellenőrzését, gyalogátkelőket, megállósávokat, jelöléseket és táblákat táblázattal. Ezek a terven láthatók, és elmenthetők elnevezett rétegekkel rendelkező .dxf fájlként.
- **Felmérés kiegyenlítése.** {{ui:Felmérés kiegyenlítése…}} poligon- vagy hálózati mérés legkisebb négyzetes kiegyenlítését végzi: kiegyenlített koordinátákat, hibaellipszisokat, khi-négyzet próbát, és jelzést arról a mérésről, amely nem illeszkedik. A szabad hálózatok, a poligon zárása iránytű-szabállyal és RW5 szerint, valamint GSI, JobXML vagy CSV terepi fájlok benne vannak, a kiegyenlített pontok CSV-ként mentődnek.
- **Nyílt bányák.** {{ui:Nyílt bányák…}} a fúrási mintákat blokkmodellé alakítja, és a végső bányagödröt az Ön lejtőszöge szerint: a sztrippelési arányt, a padonkénti táblázatot, valamint a tartalom–tonnatartalom görbét. Bevételi tényezőnként beágyazott bányagödrök és a diszkontált cash flow-val készülő termelési terv is rendelkezésre áll.
- **Rádiós összeköttetések.** {{ui:Rádiós összeköttetések…}} a látóvonalat ellenőrzi a talaja felett a Föld görbülete, az első Fresnel-zóna, a kapcsolat-költségvetés, a fakulási tartalék és a többutas kiesés szerint, és megadja azt az árboc-magasságot, amely szabaddá teszi az utat. Szálas veszteségi költségvetést, útvonal-mennyiségeket és a torony szélterhelését is számol.
- **Vasúti kitérők.** {{ui:Vasúti kitérők…}} kitérőt készít a keresztezési szám alapján, párhuzamos vágányok közötti átkötéseket, valamint a szintezéssel megdöntött és ívben kiszélesített szabadságot. A kitérő egy vonalvezetés egy állomásán is állhat.

Lásd: [Talajok, csomópontok, felmérés-kiegyenlítés, bányák, rádiós összeköttetések és kitérők](topic:soils-roads-survey-mines-links).

### Minden alkalmazásban

- **Nyelvek.** 54 nyelv, ebből tíz új. Az angolon kívüli nyelvek gépi piszkozatok, amíg egy anyanyelvi beszélő át nem nézi őket. A súgó témakörei többnyire még angolul készültek.
- **Eszköztársor.** {{ui:Beállítások}} › {{ui:Általános}} › {{ui:Eszköztársorok}}: Törés (mint eddig), 2 sor vagy 1 sor. A CivilCraft szalagja a leggyakrabban használt eszközt nagyban mutatja, a következőket kicsiben, a többit pedig a csoport nevének nyila mögött.
- **Beviteli eszközök.** Érintőpad, toll, 3D-s egér, kontroller és MIDI vezérelhetik az alkalmazásokat.
- **Problémák.** Egy Problémák panel, amely minden alkalmazásban figyelmeztet, a szabályzati csomagok szerint ellenőrizve.
- **Live.** Nézet arról, ki hol van egy Live munkamenetben.
- **Bővítmények.** Bővítménylista, világítási bővítményekkel.
- **Csatlakoztassa az AI-t.** Bármely csatlakoztatott asszisztens vezérelheti a CivilCraft eszközeit. Egy megjegyzés kíséri, hogy az egykattintásos csatlakozás a CadCraft Studióban és a hosztolt összekötő még nem készült el. Lásd: [Hagyja, hogy egy AI-asszisztens dolgozzon a telkén](topic:assistants).

### Javítva a 0.8.1 verzióban

- **DWG osztályszakasz.** Rossz típusként olvasódott be (GitHub cadcraft#5). A CivilCraftban a CadCrafttal, BimCrafttal, ModelCrafttel és TakeoffCrafttel együtt javítva.
- **Nyelvváltás futás közben.** A CadCraft Studio és a csomagolt kiadások futás közben tudnak nyelvet váltani. Korábban csak angolul működtek. Még nem tesztelték minden platformon: szóljon, ha a nyelv nem változik.

### Még nincs benne ebben a verzióban

- **Ezek számítási segédeszközök.** Az új ablakok minden eredményét mérnöknek kell ellenőriznie. A talajszilárdságok a talajcsoport tipikus értékeiből indulnak, és az ablak ezt jelzi.
- **Essen az eső.** Egy futtatás a mintatelken böngészőben két percnél tovább is tarthat finom cellával. Kézi esetekkel és egy V alakú vízgyűjtővel ellenőriztük, valódi, gradált telken még nem.
- **Cím a telephez.** Az Ön által hozott nyílt adatfájlokat olvassa, és csak a saját fájlainkon teszteltük. A fák nem forrás. A források Ön helyett történő lekérése az adatvédelmi szöveg elkészítésére vár.
- **Haladás felmérésekből.** Csak kitalált felméréseken tesztelték. A lapokon és jelöléseken (MarkupCraft) a haladás, valamint a szkenelés modellel szemben (BimCraft) nincs kész.
- **Talajok és lejtők.** Csak körfelületek: nincs ék- vagy blokkkeresés, és nincs húzási repedés.
- **Csomópontok.** Ágankénti egy sugár, nincsenek teherautó-forgási útvonalak, és még nem kerülnek be a sávba.
- **Terepi fájlok.** Az olvasókat nyilvános formátumleírásokból írtuk, és az általunk készített fájlokon próbáltuk ki. Valódi műszerfájlokra van szükség.
- **Összeköttetések és vasút.** Rádiós összeköttetések: csak szabad térbeli veszteség és többutas terjedés (nincs esőcsillapítás vagy antennadiagram), és nincs vasúti szabvány: minden vasúti határ helykitöltő, vasútmérnök által nem ellenőrzött piszkozatos számokkal.
- **Windows és macOS.** A 0.8 nincs kódaláírással ellátva. Windows figyelmeztethet, macOS pedig jobb kattintást kér, majd a megnyitást.

Minden más a [Még nem készült el](topic:not-built-yet) oldalon található. A korábbi kiadásról lásd: [Újdonságok a 0.7 verzióban](topic:whats-new-0-7).
