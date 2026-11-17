---
title: Hibaelhárítás
summary: A CivilCraftban előforduló problémák tünetei, okai és megoldásai, az alkalmazás által megjelenített pontos üzenetekkel.
keywords: problémák, hibák, nem működik, javítás, súgó, üzenetek, hibaelhárítás, elutasítva, hiányzik, hibás, felcserélve, szintvonalak hiányoznak
from: a9f7dedc
---

Az üzenetek az állapotsorban jelennek meg, a jobb alsó sarokban, a bal és jobb panelek dobozaiban, valamint a párbeszédpanelekben. Itt úgy idézzük őket, ahogy az alkalmazás megjeleníti.

## Fájlok megnyitása

**„Ez a fájl nagyobb 200 MB-nál; a CivilCraft ilyen nagy fájlokat még nem nyit meg.”**
Ossza fel a pontfájlt, vagy ritkítsa az adatokat a megnyitás előtt.

**„Nem sikerült megnyitni a site.json fájlt: Ez nem CivilCraft-projektfájl.”**
A fájl `.json` végződésű, vagy `{`-vel kezdődik, de nem CivilCraft-projekt. A pontfájlok nem kezdődhetnek `{`-vel.

**„Nem sikerült megnyitni … Ez a projektfájl a CivilCraft újabb verziójával (2. verzió) készült.”**
A projektet újabb build mentette. Nyissa meg ott, vagy exportáljon belőle LandXML-t.

**„Nem sikerült megnyitni … Ez XML, de nem LandXML (a gyökéreleme <…>).”**
A fájl másfajta XML. Exportáljon LandXML-t abból a programból.

**„… nem tartalmaz olyan pontokat, TIN-felületeket vagy tengelyeket, amelyeket a CivilCraft be tud olvasni.”**
A fájlban minden olyasmi van, amit a CivilCraft kihagy (például csak rácsfelületek vagy csak spirális tengelyek). Az üzenet többi része megmondja, mi volt benne. Lásd: [LandXML: mit olvas és ír](topic:landxml-reference).

**„A mintát nem sikerült betölteni: …”**
A {{ui:Mintasite megnyitása}} gomb a CadCraft webhelyéről olvas be egy fájlt. Kapcsolat nélkül csak akkor működik, ha a CivilCraftot offline használatra mentette (az alkalmazássáv gombja mutatja: {{ui:Offline használatra kész}}). Kapcsolódjon az internetre, kattintson a {{ui:Mentés offline használatra}} gombra, és onnantól offline is működik. Lásd: [Offline](common:offline).

**A {{ui:Mentés offline használatra}} gomb: {{ui:Nem sikerült menteni}}.**
Néhány fájl nem töltődött le. Ellenőrizze a kapcsolatot, és kattintson újra a gombra.

**A {{ui:Mentés offline használatra}} gomb: {{ui:Az offline mód nem érhető el}}.**
Ez a böngészőablak nem tud offline másolatot tárolni, általában azért, mert privát ablak, vagy a számítógépet felügyelik. Nyissa meg a CivilCraftot egy normál ablakban.

**Offline az alkalmazás egyáltalán nem nyílik meg.**
Ebben a böngészőben nem mentették offline használatra, vagy a böngésző törölte az oldal adatait (a Safari ezt azokkal az oldalakkal teszi, amelyeket hetek óta nem látogattak). Kapcsolódjon az internetre, nyissa meg a CivilCraftot, és kattintson a {{ui:Mentés offline használatra}} gombra.

**Az offline másolat régebbi build.**
Kattintson a {{ui:Offline használatra kész}} gombra, majd internetkapcsolattal a {{ui:Mentés újra (a legújabb verzió beszerzése)}} gombra.

**A fájl szürkén jelenik meg a megnyitási ablakban.**
Az ablak a végződésük alapján csak a pontfájlokat, a LandXML-fájlokat és a projektfájlokat listázza. Húzza inkább a fájlt az alaprajzra, vagy nevezze át `.txt` végződésűre.

## Pontok importálása

**„Ebből a fájlból nem lehetett pontokat beolvasni.”**
Válassza ki kézzel az oszlopsorrendet az **Oszlopok** részben. Ha semmi sem működik, nyissa meg a fájlt szövegszerkesztőben, és ellenőrizze, hogy soronként egy pont van-e, számokkal.

**A terület tükrözöttnek, elforgatottnak vagy egyenes vonalba nyújtottnak látszik.**
Az északi és a keleti koordináta fel van cserélve. Az összegzés ezt írta: „az oszlopok száma alapján becsülve”. Az **Oszlopok** részben válassza a PENZD-t a PNEZD helyett (vagy fordítva), vagy importálja újra.

**A pontok messze vannak a többitől, és az alaprajz pöttyre kicsinyedett.**
Egy sorban elütés van egy koordinátában, vagy a fájl keveri a koordinátarendszereket. Keresse meg a pontot (kattintson rá a számának megtekintéséhez), és javítsa a fájlt.

**A „Nem olvasott sorok” alatt felsorolt sorok.**
Lásd a táblázatot a [felmérési pontok importálása](topic:import-points#rows-that-are-not-read) részben.

**Eltűntek a régi pontjaim.**
A pontfájl importálása minden pontot lecserél, és törli a visszavonás előzményeit. A visszaszerzéshez nyissa meg a mentett projektjét.

## A felület

**„Felület: Nincs elkészítve”, piros dobozzal.**
A doboz megmondja az okát: „A felülethez legalább három magassággal rendelkező pont kell.”, „A pontok mind egy vonalon vannak: nincsenek háromszögek.”, „Nincsenek magassággal rendelkező pontok.”, „A határ nem fedi át a pontokat.” vagy „A határon belül nem maradt háromszög.” Ellenőrizze az oszlopsorrendet, a ponthalmazokat (vannak-e {{ui:Kihagyva}} állapotban?) és a határt.

**A szintvonalak egyenesen átvágnak egy árkon vagy gerincen.**
Ez a vonal nem töréselő. Állítsa a csoportját {{ui:Töréselő}} értékre, vagy rajzolja meg a {{ui:Töréselő}} eszközzel. Lásd: [A felület felépítése és finomítása](topic:build-surface).

**Egy töréselő-csoport cikcakkot rajzol.**
A csoport egynél több vonalat tartalmaz, vagy a pontjai nincsenek a vonal mentén sorszámozva. Állítsa vissza a csoportot {{ui:Pontok}} értékre, és rajzolja meg az egyes vonalakat a {{ui:Töréselő}} eszközzel.

**Hosszú, vékony háromszögek a külső szélen.**
Rajzoljon határt ({{key:O}}), vagy állítsa be a **Leghosszabb külső él** értéket.

**Egyáltalán nincsenek szintvonalak, pedig a felület el van készítve.**
Vagy a **Megjelenítés** alatt a {{ui:Szintvonalak}} ki van kapcsolva, vagy a szintköz olyan kicsi, hogy 2 000-nél több szintvonalszint lenne. Válasszon nagyobb szintközt.

**A töréselők vagy a határ nem változtat semmit.**
A felület LandXML-ből származik („Felület (LandXML-ből)”). Ezt változtatás nélkül használják. Kattintson a {{ui:A felület újraépítése a pontokból}} gombra, hogy a pontokból építse fel.

**„Még nincs felület: először nyisson meg felmérési pontokat.”**
A töréselőhöz, határhoz és tereplépcsőhöz meglévő terepfelület kell. Először importáljon pontokat.

**„Kattintson egy magassággal rendelkező felmérési pontra: a töréselő a pontok magasságait veszi át.”**
A {{ui:Töréselő}} eszköz csak felmérési pontokat választ ki. Nagyítson rá, és kattintson egy pontra (egy narancssárga négyzet mutatja, melyiket fogja venni).

## Rajzolás

**Az utolsó pontom eltűnt, amikor a befejezéshez duplán kattintottam.**
Ebben a verzióban a dupla kattintás befejezi a tengelyt, a tereplépcsőt, a töréselőt vagy a határt, de az általa megjelölt pontot eldobja. Egyszer kattintson az utolsó pontra, és nyomja meg az {{key:Enter}} billentyűt. Ha már megtörtént, használja a {{key:Mod+Z}} billentyűt, és rajzolja meg újra.

**Táblagépen nem tudom befejezni a rajzot.**
A befejezéshez az {{key:Enter}} kell; még nincs képernyőn megjelenő gomb. Csatlakoztasson billentyűzetet. Lásd: [Egér, érintőpad és érintés](topic:keyboard#mouse-trackpad-and-touch).

**Ha pont elhelyezéséhez húzza, a rajz eltolódik.**
Az néhány képpontnál nagyobb húzás minden eszközben eltolja az alaprajzot. Kattintson úgy, hogy nem mozgatja az egeret.

**„Egy tengelyhez legalább két pont kell.” / „Egy tereplépcsőhöz legalább három sarok kell.” / „Egy csőszakaszhoz legalább két műtárgy kell.”**
Túl korán nyomta meg az {{key:Enter}} billentyűt. A rajz elvész; kezdje újra.

**Az A vagy a G billentyű nem csinál semmit.**
Egy szövegmező vagy lista a panelben még fókuszban van, ezért a betűk oda kerülnek. Kattintson egyszer az alaprajzra, majd nyomja meg a billentyűt. Macen a böngészőben a törlőgomb a Backspace: a kijelölés törléséhez használja az Fn és a Delete billentyűket.

## Tengelyek és hosszszelvények

**„A PI 2 és a PI 3 ívei átfedik egymást: … Használjon kisebb sugarakat.”**
Két ívhez több érintő kell, mint amennyi a PI-k között van. Csökkentse az egyik vagy mindkét sugarat a PI-táblázatban, vagy vigye távolabb egymástól a PI-ket.

**„A PI 3 egyenesen visszafordul; nem vehet fel ívet.”**
A tengely ezen a PI-n visszahajlik önmagára. Mozgassa vagy törölje a PI-t.

**„Ennek a tengelynek nincs talaja, ahonnan indulhatna.”**
A tengely a felületen kívül van. Mozgassa a felületre, vagy adjon hozzá PVI-ket a {{ui:PVI-k hozzáadása}} bekapcsolt állapotában kattintva.

**„A PVI 3-nál lévő függőleges ív (L = …) előbb kezdődik, mint ahogy az előtte lévő ív vagy PVI véget ér.” / „… túlnyúlik a következő PVI-n.”**
Rövidítse az ív hosszát, vagy vigye távolabb egymástól a PVI-ket.

**„Már van PVI itt: …”**
Ezen az állomáson már van PVI. Kattintson másik helyre, vagy húzza a meglévőt.

**A hosszszelvény-nézet üres: „Rajzoljon egy tengelyt a hosszszelvényének megtekintéséhez.”**
Nincs tengely, vagy a kiválasztott tengelynek hibái vannak.

## Sávok és tereplépcsők

**„A sávnak hibátlan tervezési szelvényre van szüksége.”**
Kezdjen tervezési szelvényt ({{ui:Kezdés a terepről}}), és javítsa ki az ívátfedéseket.

**„… az oldalsó lejtők a felületről lefutnak, mielőtt elérnék a talajt.” / „… a lejtővonalak a felületről lefutnak, mielőtt elérnék azt …”**
A szintezés eléri a felület szélét, mielőtt a talajt elérné. Húzza a tervet beljebb a széltől, vagy hozza közelebb a talajhoz. Egy részben a felületen kívül rajzolt új tereplépcső 0 magasságról indulhat: írjon be valódi magasságot.

**„A sáv földmunkahatárai keresztezik … / A földmunkahatár önmagát keresztezi …”**
Eltérő oldalakról érkező lejtők ütköznek egymásba: szoros ívek, keskeny tereplépcsők, mély bevágások vagy magas feltöltések miatt. Használjon nagyobb sugarat, keskenyebb összeállítást, szélesebb tereplépcsőt vagy meredekebb lejtőket.

**„Még nincs térfogat: a tereplépcsőnek hiba nélkül kell szintezhetőnek lennie.”**
Javítsa ki a fenti piros dobozban felsorolt problémákat.

**A {{ui:Tervezett (szintezett)}} szürkén jelenik meg.**
Még nincs szintezett tereplépcső vagy sáv.

## Csövek

**„A P2-nek még nincsenek fenékmagasságai.”**
Kattintson a {{ui:A fenékmagasságok beállítása a szabályok szerint}} gombra, vagy írja be a fenékmagasságokat.

**„P1: az S1-nél nincs talaj, ahonnan indulhatna.”**
A felvízi műtárgy a felületen kívül van, és nincs perem. Írjon be neki peremmagasságot.

**Minden csövet megjelöl, miután áthelyeztem egy műtárgyat.**
A műtárgy áthelyezése nem változtatja meg a fenékmagasságokat. Kattintson a {{ui:Minden csőfenékmagasság beállítása a szabályok szerint}} gombra.

Az összes hálózati üzenet magyarázata itt található: [Gravitációs csőhálózat kialakítása](topic:pipe-network#read-and-fix-problems).

## Mentés és exportálás

**„Még nincs mit exportálni.” / „Még nincs mit plottolni.”**
A projekt üres. Először importáljon pontokat.

**Nem találom a mentett fájlt.**
A böngésző letöltései között van (általában a Letöltések mappában). Lásd: [Fájlok megnyitása, mentése és exportálása](topic:files#where-the-files-go).

**A PDF méretaránya nem stimmel papíron.**
Nyomtasson 100%-os vagy valódi méretben, ne „oldalhoz igazítva” módban.

**Kérdőjelek vannak a PDF szövegében.**
A nevek vagy leírások a nyugat-európai karakterkészleten kívüli karaktereket tartalmaznak. Az állapotüzenet megszámolja őket. Nevezze át egyszerű karakterekkel.

**A plottolás a szélein le van vágva.**
A méretarány túl nagy a laphoz. Válassza a „(fits)” jelölésűt, egy nagyobb lapot, vagy az {{ui:Ami a képernyőn van}} lehetőséget.

**A {{key:Mod+P}} a böngésző nyomtatási párbeszédpanelét nyitotta meg.**
Az oldal nem volt fókuszban. Zárja be a párbeszédpanelt, kattintson az alaprajzra, és nyomja meg újra a {{key:Mod+P}} billentyűt, vagy kattintson a {{ui:PDF}} gombra.

## Maga az alkalmazás

**A képernyő üres, vagy az eszköztár nem csinál semmit.**
Használjon friss verziójú Chrome, Edge, Firefox vagy Safari böngészőt, és töltse be újra az oldalt. Lásd: [Böngészők](common:browsers).

**Az alkalmazás lassú egy nagy pontfájllal.**
Kapcsolja ki a {{ui:Háromszögek}}, a {{ui:Pontfeliratok}} és a {{ui:Magassági sávok}} opciót, és használjon nagyobb szintközt. A nagyon nagy felületek minden változás után egy kis időre újraépülnek.

**A böngésző megkérdezi: „Elhagyja a webhelyet?”**
A projektnek mentetlen módosításai vannak. Maradjon, mentse a {{key:Mod+S}} billentyűvel, majd lépjen ki.
