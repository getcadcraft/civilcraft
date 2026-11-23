---
title: Még nincs elkészítve
summary: Mit nem tud még ez a CivilCraft-változat, és mit tegyen helyette ma.
keywords: hiányzó, korlátok, ütemterv, nem elérhető, spirálok, szélesítés, dwg, dxf, víznyelők, víztározás, keresztszelvények, később érkezik, határok
from: b91588d4
---

A CivilCraft még korai fázisban van. Ez az oldal felsorolja, mit nem tud a jelenlegi verzió, hogy ne keresse. Itt semmire nincs dátumot ígérünk.

## Pontok

| Még nincs elkészítve | Helyette ma |
|---|---|
| Második pontfájl hozzáadása az elsőhöz | Először egyesítse a fájlokat szövegszerkesztőben vagy táblázatkezelőben |
| Pontszöveges fájl exportálása | Exportálja LandXML-be (a pontok CgPoints néven kerülnek ki), használja a GIS {{ui:Exportálás}} funkciót (P, N, E, Z és D mezőkkel rendelkező pontok), vagy {{ui:Másolás}} a pontokat táblázatkezelőbe |
| Pontfelirat-stílusok, szimbólumok kódkulcsonként, ívek (körívek) a vonalkódokból, megosztható kódkulcs-fájl a projektek között | A feliratok a számot, a magasságot és a leírást mutatják, vagy ennél kevesebbet ([CivilCraft-beállítások](topic:settings)); a kódkulcsok a projektfájlban maradnak |
| Mértékegység-átváltás | Az importálás előtt alakítsa át a fájlt; a **Mértékegységek** csak átcímkézi |

## Felületek

| Még nincs elkészítve | Helyette ma |
|---|---|
| Több felület építése pontokból | Projektenként egy felület |
| (Belső) határvonalak elrejtése | Használja a **Leghosszabb külső szélt** vagy egy külső határvonalat |
| Egy rajzolt töréselem kijelölése vagy szerkesztése | {{key:Mod+Z}}, vagy {{ui:Rajzolt töréselek eltávolítása}} és újrarajzolás |
| LandXML-ből beolvasott felület szerkesztése (töréselemek, határvonal) | {{ui:A felület újraépítése a pontokból}} |
| Magassági rácsból készült felület szerkesztése | Importálja újra a rácsot más beállításokkal |
| LandXML-ből beolvasott felület átalakítása a koordinátarendszer változásakor | Előbb {{ui:A felület újraépítése a pontokból}} |
| Feliratozott pontmagasságok és lejtésértékek | Olvassa le őket az állapotsorban, vagy színezze a felületet lejtés szerint a **Lejtéselemzés** funkcióval a Tájépítészet munkaterületen ([Szintezés tájépítészethez](topic:landscape-grading#grading-checks)) |

## Nyomvonalak és hossz-szelvények

| Még nincs elkészítve | Helyette ma |
|---|---|
| A klotoidtól eltérő spirálok; spirál két ív között (összetett átmenetek) | Az ív végein lévő klotoid spirálok elérhetők; a többit a LandXML-importálás megnevezi és kihagyja |
| PI beszúrása két másik közé | Rajzolja újra a nyomvonalat, vagy írja be újra a PI-koordinátákat |
| Nyomvonalak objektumokból, eltolásokból, szélesítésekből | Rajzolja PI-kkel |
| K beírása magassági ívhez | Írjon be L-t (a K megjelenik) |
| Körív és nem szimmetrikus magassági ívek | Csak szimmetrikus parabolikus ívek |
| Több tervezett hossz-szelvény nyomvonalanként | Változatonként egy nyomvonal |
| A hossz-szelvény-nézet nagyítása, a hossz-szelvény alatti sávok | A hossz-szelvény-nézet az egész nyomvonalhoz illeszkedik; nyomtassa ki az [alaprajzi és hossz-szelvény lapokon](topic:plan-profile-sheets) |
| Keresztszelvények DWG vagy LandXML formátumban | Keresztszelvény-lapok PDF-ben; a területek és térfogatok {{ui:CSV}} formátumban |
| Mintavételi vonalak ferdén, vagy az út mentén eltérő szélességgel | Oldalanként egy szélesség az egész nyomvonalon |

## Sávok

| Még nincs elkészítve | Helyette ma |
|---|---|
| Középsávok, korlátok és sablonokat elforgató túlemelés | Sablonokként rajzolja meg ([Sávsablonok](topic:corridor-templates)); az állomásonkénti sablonok még nem kezelik a túlemelést |
| Fokozatos váltás két terület sablonjai között (átmenetek, szűkítések) | Módosítsa a sablont egy állomásnál, vagy adjon egy pontnak szélességcélt a szűkítésként rajzolt vonalra |
| Forgatás egy szél körül, túlemelés LandXML-ben | A túlemelés körívek esetén a tengelyvonal körül forgat; forgalmi sáv szélesítése szélességcéllal egy jellemzővonalhoz |
| Célok az oldalrézsűkhöz (rézsűvonal vonalra vagy felületre), saját sávfelületek | A célok a burkolatszéleket és padkákat mozgatják ([Sávok](topic:corridor)); a sáv a tervezett felületbe van szintezve |
| Szegélykanyarok, kanyarodósávok és szigetek szintezése egy csomópontban; a mellékút végének levágása a főút szélére ferde helyzetben; gyalogút csatlakoztatása úthoz a térképen, hosszában és területében | Az egymásba futó utak derékszögben csatlakoznak: a főút széle megnyílik, a mellékút oda simul ([Ahol az utak találkoznak](topic:corridor#where-roads-meet-roads-pads-and-paths)); a gyalogút a tervezett felületen és 3D-ben az út szélénél áll meg |
| Sávok exportálása LandXML útpályaként; egy második sáv egy nyomvonalon az IFC-exportban | A tervezett felület kerül exportálásra |
| Terepsablonok, amelyek módosítják a tervezett felületet, 3D-ben vagy a keresztszelvényekben | Rétegenként adnak területeket és térfogatokat ([Terepsablonok](topic:corridor-templates#terrain-templates)) |
| Végigvezetett pályák sebességgel, kerékcsúszással, kormányzási idővel, kormányzott pótkocsikkal vagy karosszéria-szabad körzettel; szabványos tervezési járművek könyvtára; a jármű húzásával rajzolt pálya | Kis sebességű végigvezetett pályák egy jellemzővonal vagy nyomvonal mentén, saját járműméretekkel ([Járműpályák](topic:swept-paths)) |

## Szintezés és térfogatok

| Még nincs elkészítve | Helyette ma |
|---|---|
| Padkák, nyitott jellemzővonalak a tervbe szintezve, szintezés más helyről érkező jellemzővonalhoz | Zárja le a jellemzővonalat ([Jellemzővonalak](topic:feature-lines)), vagy használja a meglévő terep töréselemeként |
| Jellemzővonal-csúcs beszúrása vagy eltávolítása | Rajzolja újra a vonalat, vagy készítsen belőle lépcsőzetes eltolást |
| Ívek rajzolt töréselemekben (felmérési pontokon át), spirálok jellemzővonalakban | Rajzoljon jellemzővonalat ívekkel, és használja a meglévő terep töréselemeként |
| Szintezés távolságra, magasságra vagy másik felületre | Csak a meglévő terepig tartó rézsűcsatlakozás |
| Tereplépcső sarkának hozzáadása vagy eltávolítása | Törölje a tereplépcsőt, és rajzolja újra |
| TIN-ből TIN-be (prizma) térfogatok, a rácscella méretének kiválasztása | Rácsmódszer, a cellaméretet a program választja ki |
| Duzzadás és zsugorodás, termőréteg, burkolatvastagságok | A jelentett számokra maga alkalmazzon szorzótényezőket |
| Szabad szállítási és túlszállítási költségek, szállítás különböző nyomvonalakon át, kitermelőhelyek és lerakók elhelyezve a térképen | A tömegdiagram egyensúlyi pontokkal, mozgatott térfogatokkal és átlagos szállítási távolságokkal |

## Csőhálózatok

| Még nincs elkészítve | Helyette ma |
|---|---|
| Több hálózat projektenként | Külön projektek a csapadékvíz- és szennyvízhálózathoz |
| Vízvezetékek: vízminőség és kor, szabályalapú vezérlések, egyéb szelepfajták (áramlásszabályozó, fojtó, fenntartó), teljesítménnyel megadott szivattyúk, nyomástól függő igény, Darcy–Weisbach-választás, falvastagságokkal és nyomásosztályokkal rendelkező csőkatalógus. A nyomásos hálózatok többi része a laborban van: [Vízvezetékek](topic:water-mains) | Ellenőrizze ezeket vízelosztó szoftverben; a szennyvíz-tervezési vízhozamok itt találhatók: [Szennyvíz-tervezési vízhozamok](topic:sanitary-design) |
| Időben változó szennyvízhozamok (hidrográfok, dinamikus vezetés, tározás, szivattyúk, túlfolyók) | A [Szennyvíz-tervezési vízhozamok](topic:sanitary-design) a tervlap által használt állandó csúcshozamot adja meg |
| Víznyelő-kapacitás, szegélyárok-szóródás, víztározó-vezetés, hidrográfok, egy csomóponti tényezőnél egyéb energiaveszteségek | Ellenőrizze más szoftverben; a hozamok, méretek és a folyásvonalak itt: [Csapadékvíz-elvezetés](topic:storm-drainage) |
| Vízgyűjtők a PDF-ábrán, DWG-ben, DXF-ben vagy LandXML-ben; vízgyűjtők a felületből (vízválasztók) | Rajzolja kézzel a vízgyűjtőket; a projektfájlban mentődnek |
| Csőkatalógusok, nem kör keresztmetszetű csövek, nem álló doboz vagy henger alakú műtárgyak (kúpok, lépcsők, padkázás), vízelvezetési kategória a könyvtárban | Műtárgytípusok paraméterekből ([Csőhálózat](topic:pipe-network)); átmérővel rendelkező csövek |
| Csövek a hossz-szelvény-nézetben, íves csövek | Az oldalpanelen olvassa le a fenékszinteket és a takarási mélységet |

## Telkek

| Még nincs elkészítve | Helyette ma |
|---|---|
| Telkek kijelölése terület vagy homlokvonal alapján, telkek a körülöttük lévő vonalakból, közlekedési terület | Rajzolja meg minden telket a sarkai szerint, vagy adja meg a határleírását |
| Ívtáblázatok és vonaltáblázatok a térképen; kézzel áthelyezett feliratok | Minden szakasz a saját vonala mentén kap feliratot |
| Telkek LandXML-ben | A telkek a projektfájlban mentődnek, és a PDF-be, DWG-be és DXF-be kerülnek |

## Sokszögvonalak

| Még nincs elkészítve | Helyette ma |
|---|---|
| Legkisebb négyzetek szerinti kiegyenlítés, a tranzit-szabály, szögek súlyozása távolságokkal szemben | Az iránytű-szabály |
| Eltérési szögek, zenitszögek és ferde távolságok, magasságok trigonometriai szintezéssel | Vízszintes távolságokra és szögekre vagy irányszögekre redukálja helyesen |
| Oldalmérések, nyers adatfájlok adatgyűjtőktől | Importálja a pontokat pontfájlként |

## Kitűzés

| Még nincs elkészítve | Helyette ma |
|---|---|
| Eltolt cövekek (a cövektől hátrébb állított vonatkozási pontok), rézsűcövekek a rézsűláb pontjánál | Cövekelje ki a szükséges eltolásokban, a padkán túl is |
| Cövekek küldése közvetlenül az adatgyűjtő saját formátumába | A CSV megnyílik a legtöbb adatgyűjtő irodai szoftverében |
| Csövek, tereplépcsők és telkek kitűzése | Használjon nyomvonal közeli felmérési pontokat, vagy a telek szakaszait |

## Fájlok és kimenet

| Még nincs elkészítve | Helyette ma |
|---|---|
| Szöveg, sraffozás és méretek DWG-ből vagy DXF-ből; papírtér; külső hivatkozású rajzok (xref); bináris DXF | A modelltér vonalas rajza megnyílik ([DWG vagy DXF megnyitása vonalas rajzként](topic:open-dwg-dxf)); a külső hivatkozású rajzokat külön nyissa meg |
| Több pont egyidejű mozgatása húzással | Vágja ki és illessze be őket, vagy egyenként szerkessze |
| Álló lapok, saját rajzfejek, saját elrendezésű nézetablakok, alaprajzi és hossz-szelvény lapok DWG-ben | PDF-enként egy fekvő alaprajzi lap, vagy alaprajzi és hossz-szelvény lapok a nyomvonal mentén (PDF) |
| Magassági sávok és hossz-szelvények plottolása | A sávok csak a képernyőn láthatók; ha szükséges, készítsen képernyőképet |
| Rétegnevek, színek vagy feliratstílusok módosítása | Módosítsa őket CAD-programban a DXF-exportálás után |
| Felhőbe mentés és verziótörténet | Mentse a `.civilcraft.json` fájlokat, és tartson róluk biztonsági másolatot; egy projekten közösen dolgozáshoz használjon élő munkamenetet a CadCraft Studióban ([Egy telek közös tervezése élőben](topic:work-live)) |
| CadCraft Studio iPaden és iPhone-on, valamint a Google Play-ből | Használja a CivilCraftot a böngészőben az eszközön; Androidon a CadCraft Studio az APK-fájlból telepíthető a getcadcraft.com/download oldalról |
| Több pont- vagy projektfájl egyidejű megnyitása | Egyszerre egy fájl nyitható meg (az egymáshoz tartozó GIS-fájlok, például egy shapefile részei együtt nyílnak meg) |

## Tájépítészet

| Még nincs elkészítve | Helyette ma |
|---|---|
| Gyártók fejei és fúvókái | Általános fejek, vagy saját fejek hozzáadása fájlból; a gyártói adatok annak engedélyével érkeznek, ahogy azt a gyártók megadják |
| Csepegtető vezetékek legnagyobb oldalirányú hossza, időbeli hozamok, szivattyúk, hurkolt csőhálózatok | A csepegtető vezetékeket tartsa a gyártó által közölt hosszon belül; az ellenőrzéshez elágazó hálózat szükséges |
| Homorú szabadformájú objektum pontos körvonala; földfelszín alatti térfogatának pontos mérése | A konvex burok kerül szintezésre, a föld alatti térfogat becslés (a Tulajdonságokban olvasható) |
| Növények a BimCraft és a ModelCraft saját könyvtárból elhelyezés funkciójában | Exportálja a tájépítészeti IFC-t, és nyissa meg a BimCraftban az épület mellett |
| Részletes növénymodellek (levelek, ágak, évszakok) a 3D-nézetben; szabadformájú objektumok és öntözés a 3D-nézetben | A növények 3D-ben egyszerű formákként jelennek meg, a növénylista alapján méretezve ([A telek megtekintése 3D-ben](topic:site-3d)); a ModelCraft szórása készít ültetési képeket |
| Burkolt falak, amelyek a felületen szintezett szintet tartanak vissza mögöttük | Adjon egy platformnak vagy tereplépcsőnek függőleges oldalakat: ezek a felületen támfalak ([Szintezés](topic:grading)) |
| SVG-transzformációk a saját szimbólumokban; saját GLB-növénymodellek textúrái és színei; tömörített GLB-geometria | A transzformációkat először lapítsa a rajzprogramban; a modellek a növény színével rajzolódnak; GLB-t tömörítés nélkül exportáljon ([Növényábrázolás](topic:plant-graphics)) |
| A saját növénylista a könyvtári fiókjában (az alkalmazásban szerkesztve) | Szerkessze a projekt saját listáját a Növénytáblázatban, és mentse növényfájlként |
| A tájépítészeti eszközök asszisztensek számára ablak nélkül (a fájlkiszolgáló és a parancssor) | A CivilCraft ablakának megnyitásával működnek ([Hagyja, hogy egy MI-asszisztens dolgozzon a telkén](topic:assistants)) |

## Távvezetékek

| Még nincs elkészítve | Helyette ma |
|---|---|
| Egy ország szabványának beépítése (terhelési esetek, távolságok, tényezők) | Állítsa be a szabványának értékeit a {{ui:Terhelési esetek és határértékek…}} ablakban, és mentse el csomagként a könyvtárával együtt, amelyet újra felhasználhat és megoszthat ([Csomagok](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Vízszintes távolság a vezetéktől egy fa koronájáig vagy a vezeték mellett lévő falig | A függőleges távolság a vezeték által keresztezett növények és falak felett ([Távvezeték-ellenőrzések](topic:power-line-checks#clearances)) |
| Vezető kúszása és új vezető megnyúlása | Vegye ezeket figyelembe a feszítési táblázat hőmérsékletein keresztül |
| Földbe fektetett kábelek hőmérsékleti besorolása (áramterhelhetőség a fektetési módtól) | Írja be a szállító áramterhelhetőségét a kábeltételnél |
| Zárlati, védelmi és földelési számítások | Használjon erre szolgáló villamos programot; a CivilCraft a hálózat hosszait és kábeleit adja meg |
| Rácsos oszlopok tagonkénti tervezése, és talajba ágyazott kihorgonyzók | A tartókat névleges terhelésükkel, a kihorgonyzókat névleges teherbírásukkal ellenőrizzük |
| A `.DON` számítási fájl ellenőrzése abban a programban, amely beolvassa | Ellenőrizze a fájlt ott; küldjön nekünk mintát, hogy valós fájlon tesztelhessünk |
| Távvezetékek a 3D-nézetben és IFC-ben | Az alaprajz, a vezeték hossz-szelvénye, a lapok és a GIS-rétegek |
| A távvezeték-eszközök asszisztensek számára ablak nélkül | A CivilCraft ablakának megnyitásával működnek ([Hagyja, hogy egy MI-asszisztens dolgozzon a telkén](topic:assistants)) |

## Épülettömegek

| Még nincs elkészítve | Helyette ma |
|---|---|
| Övezési előírások vagy bármely város szabályainak könyvtára | Írja be a határértékeket a saját helyi rendeletéből ([Övezeti határértékek](topic:zoning-limits)) |
| Égbolt-fény a falakon (homlokzati nappali fény), szél | A [Napsütéses órák](topic:sun-hours) csak a közvetlen napfényt számolja |
| Árnyék fáktól, növényektől vagy bármitől, ami nincs tömegként megrajzolva | Rajzolja meg a szomszédos épületeket tömegként |
| Tetőformák a tömegeken | Lapos tetejű tömegek |
| Nyílások, tetők és falfajták, amikor a tömeget a BimCraftban fejlesztik ki | A BimCraft minden szinten és padlón egyszerű külső falakat épít; a többit ott adja hozzá |

## GIS és koordinátarendszerek

| Még nincs elkészítve | Helyette ma |
|---|---|
| File Geodatabase; KML-stílusok, ikonok, földi átfedések és hálózati hivatkozások | Először alakítsa át GeoPackage, shapefile vagy GeoJSON formátumba; a KML-jelölők stílusok nélkül kerülnek beolvasásra |
| GIS-elemek vagy attribútumaik szerkesztése | Szerkessze őket GIS-programban, és importálja újra. Az {{ui:Elemzés}} panel új rétegeket készít (puffer, átfedés, összekapcsolás, kijelölés), és terület- és hosszmezőket ad hozzá, de nem szerkeszt egy elemet helyben |
| Hálózati és raszterelemzés, lapos vagy négyzet végű és egyoldalú pufferek, sorok hozzáadása vagy törlése és mező típusának módosítása az attribútumtáblában, kézi osztályszínek, stíluslegenda a nyomtatásokban | A {{ui:Kijelölés}} eszközzel jelöljön ki elemeket, és készítsen belőlük réteget; lapos végek nem érhetők el. Az attribútum szerinti színezés és az attribútumtábla készen áll: lásd [Réteg stílusozása attribútum szerint](topic:gis-symbology) és [Dolgozás a réteg attribútumtáblájával](topic:gis-table) |
| Feliratstílusok (méret, elhelyezés) és egymást elkerülő feliratok | A feliratok egy méretűek, és sűrű elemeknél átfedhetik egymást |
| Magassági alapfelületek és geoid-modellek | A magasságok a fájl szerinti értékeken szerepelnek; a magassági alapfelületet maga ellenőrizze |
| Rácseltolások, a NAD83-on kívül NAD27-ből, területileg javasolt módon (OSTN15, NTv2 más alapfelületekhez, a fájl hozzáadásával), egyszerre több rács, magassági rácsok | Adja hozzá maga az alapfelületének megfelelő rácsfájlt; projektenként egy rács |
| Térképrétegek a DXF-ben vagy 3D-exportokban | A térképrétegek a PDF-ábrába kerülnek, és a DWG mellé képként |
| Térképszerverek, amelyek bejelentkezést, kulcsot vagy tokent igényelnek | Használjon nyilvános szolgáltatásokat, vagy georeferált képfájlt |
| LAS- vagy LAZ-fájlok írása felületből, a terepmodellből vagy a magassági rács és LiDAR eszközökből | Exportálja a felületeket GeoTIFF magassági rácsként. A [Pontfelhők](topic:point-clouds) bővítmény a tisztított felhőt LAS 1.4 vagy LAZ formátumban írja |
| LiDAR intenzitás, szín és visszaverődések; több sávú magassági rácsok; 200 MB-nál nagyobb rács- vagy LiDAR-fájlok | A LiDAR csak osztály szerint szűrhető, a rácsok az első sávjukat használják; nagy fájlokat előbb darabolja csempékre |

## Bevitel

| Még nincs elkészítve | Helyette ma |
|---|---|
| Dobozos kijelölés érintéssel (ehhez {{key:Shift}} kell) | Tartsa lenyomva az egyes felmérési pontokat a hozzáadásukhoz |
| Begépelt koordináták vagy távolságok rajzolás közben | Nagyjából rajzoljon, majd a nyomvonal PI-táblázatában írja be a pontos PI-koordinátákat |
| Koordináták beírása tereplépcső-sarkokhoz és műtárgyakhoz | Húzza a fogópontjaikat; a pontossághoz nagyítson, és figyelje az E és N értékeket az állapotsorban |
| Fogás objektumokhoz (a töréselemek felmérési pontjain kívül) | Nagyítson, és figyelje az állapotsort |

## 3D-nézet

| Még nincs elkészítve | Helyette ma |
|---|---|
| Rajzolás vagy szerkesztés a 3D-nézetben | Rajzoljon és szerkesszen az alaprajzon; a 3D-nézet minden módosítást követ |
| Sávjellemző vonalak vagy GIS-elemek kijelölése kattintással 3D-ben | Kattintson rájuk az alaprajzon |
| A felnagyított nézet vagy láb mértékegységben történő exportálás | Az exportok valós méretarányban, méterben készülnek; lásd: [A telek exportálása 3D-ben](topic:export-3d) |
| Feliratok a GLB- vagy OBJ-exportokban, feliratméretek és -stílusok 3D-ben | A feliratok csak a 3D-nézetben jelennek meg, egy méretben; lásd: [A telek megtekintése 3D-ben](topic:site-3d) |
| Fényképekből készült textúrák, egy bejárás videóra rögzítése, a telken kívülről érkező árnyékok, napsütéses órák a 3D-nézetben | Térképrétegek ráterítve a felületekre; bejárás és a nap állása egy időpontban; [napsütéses órák](topic:sun-hours) egy napra vagy évszakra az alaprajzon |
