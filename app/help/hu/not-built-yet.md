---
title: Még nincs elkészítve
summary: Mit nem tud a CivilCraft jelenlegi verziója, és mit tegyen helyette ma.
keywords: hiányzó, korlátok, ütemterv, nem elérhető, spirálok, kiszélesítés, dwg, dxf, víznyelők, visszatartás, keresztszelvények, később érkezik, határok
from: a2d970ef
---

A CivilCraft még fejlesztés alatt áll. Ez az oldal felsorolja, mit nem csinál a jelenlegi verzió, hogy ne keresse. Egyik sincs ígéretes határidőre.

## Pontok

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Második pontfájl hozzáadása az elsőhöz | Fűzze össze a fájlokat előbb szövegszerkesztőben vagy táblázatkezelőben |
| Szöveges pontfájl exportálása | LandXML exportálása (a pontok CgPoints-ként kerülnek ki), GIS {{ui:Export}} (P, N, E, Z és D mezős pontok), vagy a pontok {{ui:Copy}} táblázatba |
| Pontcímke-stílusok, leírókulcsonkénti jelek, ívek (körívek) vonalkódokból, egy leírókulcs-fájl projektek közötti megosztáshoz | A címkék a számot, a magasságot és a leírást mutatják, vagy ennél kevesebbet ([CivilCraft beállításai](topic:settings)); a kulcsok a projektfájlban maradnak |
| Mértékegység-átváltás | Importálás előtt alakítsa át a fájlt; a **Mértékegységek** csak átcímkézi |

## Felületek

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Egynél több felület pontokból | Projektenként egy felület |
| Belső határvonalak elrejtése | Használja a **Leghosszabb külső él** lehetőséget vagy egy külső határvonalat |
| Egy rajzolt töréselek kijelölése vagy szerkesztése | {{key:Mod+Z}}, vagy {{ui:Remove drawn breaklines}} és újrarajzolás |
| LandXML-ből beolvasott felület szerkesztése (töréselek, határvonal) | {{ui:Rebuild the surface from the points}} |
| Rácsból készült felület szerkesztése | Importálja újra a rácsot más beállításokkal |
| LandXML-ből beolvasott felület átalakítása, ha a koordináta-rendszer változik | Először {{ui:Rebuild the surface from the points}} |
| Feliratozott pontmagasságok és lejtésértékek | Olvassa le az állapotsorban, vagy színezze a felületet lejtés szerint a Tájrendezés munkaterület **Lejtéselemzés** parancsával ([Tájrendezési terepszabályozás](topic:landscape-grading#grading-checks)) |

## Nyomvonalak és hossz-szelvények

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Spirálok a klotoidon kívül; spirál két ív között (összetett átmenetek) | A görbék végein elérhetők a klotoid spirálok; a többit a LandXML-import megnevezi, de kihagyja |
| PI beszúrása két másik közé | Rajzolja újra a nyomvonalat, vagy írja be újra a PI-koordinátákat |
| Nyomvonal objektumokból, eltolásokból, kiszélesítésekből | Rajzolás PI-kkel |
| K gépelése függőleges ívhez | Írjon L-t (a K jelenik meg) |
| Körív és nem szimmetrikus függőleges ívek | Csak szimmetrikus parabolaívek |
| Nyomvonalonként egynél több tervezett hossz-szelvény | Változatonként egy nyomvonal |
| A hossz-szelvény nézet nagyítása, sávok a hossz-szelvény alatt | A hossz-szelvény nézet az egész nyomvonalhoz illeszkedik; ábrázolja a [hossz-szelvény-lapokon](topic:plan-profile-sheets) |
| Keresztszelvények DWG-ben vagy LandXML-ben | Keresztszelvény-lapok PDF-ben; {{ui:CSV}} a területekről és térfogatokról |
| Ferdén álló mintavételi vonalak, vagy az út mentén különböző szélességűek | Oldalanként egy szélesség az egész nyomvonalra |

## Folyosók

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Középsávok, korlátok és túlemelés, amely forgatja a sablonokat | Rajzolja meg sablonként ([Folyosósablonok](topic:corridor-templates)); a szelvényenkénti sablonok még nem veszik figyelembe a túlemelést |
| Fokozatos változás két régió sablonjai között (átmenetek, elkeskenyedések) | Változtassa a sablont egy szelvénynél, vagy adjon egy pontnak szélességi célt egy elkeskenyedésnek rajzolt jellemzővonalhoz |
| Forgatás egy él körül, túlemelés LandXML-ben | A túlemelés körívek esetén a tengely körül forog; egy sávot szélességi céllal szélesítsen egy jellemzővonalig |
| Célok az oldalsó lejtésekhez (kilátás egy vonalig vagy felületig), saját folyosófelületek | A célok a burkolat és a vállak széleit mozgatják ([Folyosók](topic:corridor)); a folyosó a tervezett felületbe van kialakítva |
| Folyosók exportja LandXML útként; második folyosó egy nyomvonalon az IFC-exportban | A tervezett felület exportálódik |
| Terepsablonok, amelyek módosítják a tervezett felületet, 3D-ben vagy a szelvényekben | Ezek az egyes rétegek területeit és térfogatait adják ([Terepsablonok](topic:corridor-templates#terrain-templates)) |
| Sebességgel, kerékcsúszással, kormányzási idővel, kormányzott utánfutóval vagy karosszéria-hellyel számolt járműkövetési pályák; szabványos tervezőjárművek könyvtára; járműkövetés húzással rajzolva | Kis sebességű járműkövetési pályák egy jellemzővonal vagy nyomvonal mentén, saját járműméretekkel ([Járműkövetési pályák](topic:swept-paths)) |

## Tereprendezés és térfogatok

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Padkák, nyitott jellemzővonalak a tervbe lefaragva, lefaragás másik helyről származó jellemzővonalra | Zárja le a jellemzővonalat ([Jellemzővonalak](topic:feature-lines)), vagy használja a meglévő terep töréseleként |
| Jellemzővonal csúcsának beszúrása vagy eltávolítása | Rajzolja újra a vonalat, vagy készítsen belőle lépcsős eltolást |
| Ívek rajzolt töréseleken (felmérési pontokon át), spirálok jellemzővonalakon | Rajzoljon ívekkel rendelkező jellemzővonalat, és használja a meglévő terep töréseleként |
| Lefaragás távolságra, magasságra vagy másik felületre | Csak a meglévő terepre való illesztés |
| Pad sarok hozzáadása vagy eltávolítása | Törölje a padot, és rajzolja újra |
| TIN–TIN (prizma) térfogatok, rácscella-méret választása | Rácsos módszer, a cellaméretet a program választja |
| Duzzadás és zsugorodás, humuszréteg, burkolatvastagságok | Alkalmazza a tényezőket a jelentett számokra maga |
| Szabad szállítási és túlszállítási költségek, szállítás eltérő nyomvonalak között, kölcsönvételi és hulladéklerakó helyek az alaprajzon | A tömegdiagram egyensúlyi pontokkal, mozgatott térfogatokkal és átlagos szállítási távolságokkal |

## Csőhálózatok

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Projektenként egynél több hálózat | Külön projektek csapadékvízhez és szennyvízhez |
| Vízvezetékek: víz minősége és kora, szabályalapú vezérlés, más szelepfajták (áramlásszabályozó, fojtó, tartó), szivattyúk teljesítménnyel megadva, nyomástól függő igény, Darcy–Weisbach-választás, csőkatalógus falvastagságokkal és nyomásosztályokkal. A nyomásos hálózatok többi része a laborban van: [Vízvezetékek](topic:water-mains) | Ezeket vízelosztó szoftverben ellenőrizze; a szennyvíz tervezési vízhozamai a [Szennyvíz tervezési vízhozamai](topic:sanitary-design) oldalon vannak |
| Szennyvízhozamok időben (hidrográfok, dinamikus vezetés, tározás, szivattyúk, túlfolyók) | A [Szennyvíz tervezési vízhozamai](topic:sanitary-design) adja a tervlap által használt állandó csúcshozamot |
| Befolyónyílás-kapacitás, árokfelszín-terület, tározási vezetés, hidrográfok, a csomóponti tényezőn kívüli energiaveszteségek | Ellenőrizze más szoftverben; a hozamok, méretek és vízszintek a [Csapadékvíz-elvezetés](topic:storm-drainage) oldalon vannak |
| Vízgyűjtők a PDF-ábrában, DWG-ben, DXF-ben vagy LandXML-ben; felületből származó vízgyűjtők (vízválasztók) | Rajzolja kézzel a vízgyűjtőket; a projektfájlban mentődnek |
| Csőkatalógusok, nem kör keresztmetszetű csövek, nem függőleges dobozok vagy hengerek alakú műtárgyak (kúpok, lépcsők, padkázás), csapadékelvezetési kategória a könyvtárban | Paraméterekből készült műtárgytípusok ([Csőhálózat](topic:pipe-network)); átmérős csövek |
| Csövek a hossz-szelvény nézetben, ívelt csövek | Fenékmagasságok és takarás olvasása a jobb oldali panelen |

## Telkek

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Telkek kiosztása terület vagy homlokzat szerint, telkek a körülöttük lévő vonalakból, közterület | Rajzolja meg minden telket a sarkaival, vagy írja be az irányszögeit |
| Ívtáblázatok és egyenestáblázatok az alaprajzon; kézzel mozgatott címkék | Minden szakasz a saját mentén van feliratozva |
| Telkek LandXML-ben | A telkek a projektfájlban mentődnek, és a PDF, DWG és DXF kimenetbe kerülnek |

## Sokszögvonalak

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Legkisebb négyzetes kiegyenlítés, a tranzitszabály, a szögek súlyozása a távolságokhoz képest | Az iránytű-szabály |
| Elhajlási szögek, zenitszögek és ferde távolságok, magasságok trigonometriai szintezéssel | Redukálja vízszintes távolságokra és szögekre, vagy irányszögekre |
| Oldalsó mérési pontok, nyers adatfájlok az adatgyűjtőkből | Importálja a pontokat pontfájlként |

## Kitűzés

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Kitűzési pontok eltolása (a kitűzés mögé állított vonatkoztatási pontok), lejtéskitűzés a befogási pontnál | Tűzze ki a szükséges eltolásoknál, a váll mögött is |
| Kitűzési adatok közvetlen küldése egy adatgyűjtő saját formátumában | A CSV megnyílik a legtöbb adatgyűjtő irodai szoftverében |
| Csövek, padok és telkek kitűzése | Használjon felmérési pontokat egy nyomvonal közelében, vagy a telek szakaszait |

## Fájlok és kimenet

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Szöveg, sraffozás és méretek DWG-ből vagy DXF-ből; papírtér; külső hivatkozások (xref-ek); bináris DXF | A modelltérből származó rajzvonalak megnyílnak ([Rajzvonal megnyitása DWG vagy DXF fájlból](topic:open-dwg-dxf)); a külső hivatkozásokat külön nyissa meg |
| Több pont egyidejű mozgatása húzással | Vágja ki és illessze be, vagy egyenként szerkessze |
| Álló lapok, saját rajzfejek, elrendezett nézetablakok, alaprajz- és hossz-szelvény-lapok DWG-ben | Egy fekvő alaprajzlap PDF-enként, vagy hossz-szelvény-lapok egy nyomvonal mentén (PDF) |
| Magasságsávok és szelvények ábrázolása | A sávok csak a képernyőn láthatók; készítsen képernyőképet, ha kell |
| Rétegnevek, színek vagy címkestílusok módosítása | Módosítsa őket egy CAD-programban a DXF-exportálás után |
| Felhőbe mentés és verziótörténet | Mentse a `.civilcraft.json` fájlokat, és készítsen róluk biztonsági mentést; egy projekten közös munkához használjon élő munkamenetet a CadCraft Studio-ban ([Egy telek közös tervezése élőben](topic:work-live)) |
| CadCraft Studio iPadre és iPhone-ra, valamint Google Playből | Használja a CivilCraftot a böngészőben az eszközön; Androidon a CadCraft Studio APK-ból települ a getcadcraft.com/download oldalról |
| Több pont- vagy projektfájl egyidejű megnyitása | Egy fájl megnyitásonként (az egymáshoz tartozó GIS-fájlok, például egy shapefile részei, együtt nyílnak) |

## Tájrendezés

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Gyártók fejei és szórófejei | Általános fejek, vagy saját fejeket adhat fájlból; a gyártói adatok a jogosultság megadásával érkeznek |
| Csepegtető-vezetékek maximális oldalhossza, időbeli áramlások, szivattyúk, hurkolt csőhálózatok | Tartsa a csepegtető-szakaszokat a gyártó közzétett hosszán belül; az ellenőrzéshez elágazó hálózat kell |
| Egy homorú szabad formájú objektum pontos körvonala; földalatti térfogata pontosan mérve | A konvex burok lefaragott, a földalatti térfogat becslés (a Tulajdonságokban olvasható) |
| Növények a BimCraft és a ModelCraft saját Elhelyezés könyvtárából | Exportálja a tájrendezési IFC-t, és nyissa meg a BimCraftban az épület mellett |
| Részletes növénymodellek (levelek, ágak, évszakok) a 3D-nézetben; szabad formájú objektumok és öntözés a 3D-nézetben | A növények egyszerű formákként jelennek meg 3D-ben, a növénylista alapján méretezve ([A telek megtekintése 3D-ben](topic:site-3d)); a ModelCraft szórása ültetési képeket készít |
| A felületen egy szintet visszatartó támfalak, amelyek a mögöttük lévő terepszintet tartják | Adjon egy platformnak vagy padnak függőleges oldalakat: ezek támfalak a felületen ([Tereprendezés](topic:grading)) |
| SVG-transzformációk a saját szimbólumokban; saját GLB-növénymodellek textúrái és színei; tömörített GLB-geometria | Először alakítsa át a transzformációkat a rajzprogramban; a modellek a növény színében jelennek meg; a GLB-t tömörítés nélkül exportálja ([Növényábrázolás](topic:plant-graphics)) |
| A saját növénylista a könyvtári fiókjában (az alkalmazásban szerkesztve) | Szerkessze a projekt saját listáját a Növénytáblázatban, és mentse növényfájlként |
| Tájrendezési eszközök az ablak nélküli AI-asszisztenseknek (fájlkiszolgáló és parancssor) | Az eszközök a nyitott CivilCraft-ablakkal működnek ([Asszisztens bevonása a telek munkájába](topic:assistants)) |

## Erővezetékek

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Egy ország szabványa beépítve (terhelési esetek, biztonsági távolságok, tényezők) | Állítsa be a szabvány értékeit a {{ui:Load cases and limits…}} alatt, és mentse el a könyvtárral együtt csomagként az újrafelhasználáshoz és megosztáshoz ([Csomagok](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| A vezető oldalirányú távolsága egy fakoronától vagy a vonal melletti faltól | A függőleges biztonsági távolság a növények és falak felett, amelyeket a vonal keresztez ([Erővezeték-ellenőrzések](topic:power-line-checks#clearances)) |
| Vezetőkúszás és új vezető nyúlása | Vegye figyelembe a hőmérsékleteket a feszítési táblázatban |
| Földbe fektetett kábelek hőterhelhetősége (a fektetési módtól függő áramterhelhetőség) | Írja be a szállítója áramterhelhetőségét a kábeltételre |
| Rövidzárlati, védelmi és földelési vizsgálatok | Használjon külön villamos programot; a CivilCraft a hálózat hosszait és kábeleit adja |
| Rácsos tornyok elemenkénti tervezése, és kihúzó horgonyok a talajban | A tartók névleges terhelésük szerint ellenőrizve; a feszítőhuzalok névleges terhelésük szerint |
| A `.DON` vizsgálati fájl ellenőrzése abban a programban, amely olvassa | Ellenőrizze ott a fájlt; küldjön egy mintát, hogy valódi mintán tesztelhessünk |
| Erővezetékek a 3D-nézetben és IFC-ben | Az alaprajz, a vezeték hossz-szelvénye, a lapok és a GIS-rétegek |
| Erővezeték-eszközök az ablak nélküli AI-asszisztenseknek | Az eszközök a nyitott CivilCraft-ablakkal működnek ([Asszisztens bevonása a telek munkájába](topic:assistants)) |

## Épülettömegek

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Zónakódok könyvtára vagy bármely város szabályai | Írja be a saját rendeletének korlátait ([Zónahatárok](topic:zoning-limits)) |
| Égboltfény a falakon (homlokzati nappali fény), szél | A [Napórák](topic:sun-hours) csak a közvetlen napfényt számolják |
| Fák, növények vagy bármi, ami nem tömegként van rajzolva, árnyéka | Rajzolja meg a szomszédos épületeket tömegekként |
| Tetőformák tömegeken | Lapos tetejű tömegek |
| Nyílások, tetők és falfajták, ha a tömeget a BimCraftban dolgozzák ki | A BimCraft minden szinten és padlón egyszerű külső falakat épít; a többit ott adja hozzá |

## GIS és koordináta-rendszerek

| Még nincs elkészítve | Ehelyett most |
|---|---|
| File Geodatabase; KML-stílusok, ikonok, talajátfedések és hálózati linkek | Előbb alakítsa GeoPackage-, shapefile- vagy GeoJSON-formátumra; a KML-jelölők stílusok nélkül olvasódnak |
| GIS-elemek vagy attribútumaik szerkesztése | Szerkessze GIS-programban, majd importálja újra. Az Elemzés panel új rétegeket készít (puffer, átfedés, összekapcsolás, kijelölés), és területet és hosszt ad hozzá, de az elemet nem szerkeszti helyben |
| Hálózati és raszteres elemzés; lapos vagy négyzetes végű és egyoldalú pufferek; mezők hozzáadása, törlése vagy típusuk módosítása az attribútumtáblában; kézi osztályszínek; stílusjelmagyarázat a nyomtatványokban | Használja a Kijelölés eszközt elemek kijelölésére, és készítsen belőlük réteget; a lapos végek nem elérhetők. Az attribútum szerinti színezés és az attribútumtábla készen áll: lásd [Réteg stílusozása attribútum alapján](topic:gis-symbology) és [Réteg attribútumtáblájával való munka](topic:gis-table) |
| Címkestílusok (méret, elhelyezés) és egymást nem fedő címkék | A címkék egy méretűek, és sűrű elemeknél átfedhetik egymást |
| Függőleges adatsíkok és geoidmodellek | A magasságok úgy használatosak, ahogy a fájl adja; a függőleges adatsíkot maga ellenőrizze |
| Rácseltolások a NAD27-ből a NAD83-ba a területre javasoltakon kívül (az OSTN15 és az NTv2 más adatsíkokhoz a fájl hozzáadásakor működik), több rács egyszerre, függőleges rácsok | Adja hozzá maga a datumához tartozó rácsfájlt; projektenként egy rács |
| Térképrétegek a DXF-ben vagy 3D-exportokban | A térképrétegek a PDF-ábrába kerülnek, a DWG mellé képként |
| Bejelentkezést, kulcsot vagy tokent igénylő térképszerverek | Nyilvános szolgáltatásokat, vagy georeferált képfájlt használjon |
| LAS vagy LAZ fájlok írása felületből, a terepmodellből vagy a magasságrács- és LiDAR-eszközökből | Exportálja a felületeket GeoTIFF magasságrácsként. A [Pontfelhők](topic:point-clouds) bővítmény tisztított felhőt ír LAS 1.4 vagy LAZ formátumban |
| LiDAR-intenzitás, szín és visszaverődések; több sávos magasságrácsok; 200 MB-nál nagyobb rács- vagy LiDAR-fájlok | A LiDAR csak osztály szerint szűrt, a rácsok az első sávjukat használják; a nagy fájlokat előbb darabolja csempékre |

## Bevitel

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Dobozos kijelölés érintéssel (Shift kell hozzá) | Hosszan nyomja meg minden felmérési pontot a hozzáadáshoz |
| Gépelt koordináták vagy távolságok rajzolás közben | Durván rajzoljon, majd a nyomvonal PI-táblázatában írja be a pontos PI-koordinátákat |
| Koordináták gépelése padsarkokhoz és műtárgyakhoz | Húzza a fogópontjaikat; nagyítson a pontossághoz, és figyelje az E és N értékeket az állapotsorban |
| Illesztés objektumokhoz (a felmérési pontokon kívül, töréselekhez) | Nagyítson, és figyelje az állapotsort |

## 3D-nézet

| Még nincs elkészítve | Ehelyett most |
|---|---|
| Rajzolás vagy szerkesztés a 3D-nézetben | Rajzoljon és szerkesszen az alaprajzon; a 3D-nézet minden szerkesztést követ |
| Jellemzővonalak vagy GIS-elemek kijelölése kattintással 3D-ben | Kattintson rájuk az alaprajzon |
| Túlzott magasságú nézet vagy láb-mértékegységű exportálás | Az exportok valódi méretarányban, méterben készülnek; lásd [A telek exportálása 3D-ben](topic:export-3d) |
| Címkék GLB- vagy OBJ-exportokban, címkeméretek és -stílusok 3D-ben | A címkék csak a 3D-nézetben jelennek meg, egy méretben; lásd [A telek megtekintése 3D-ben](topic:site-3d) |
| Fényképekből származó textúrák, meghajtás videóra rögzítése, a telken kívülről vetődő árnyékok, napórák 3D-ben | A térképrétegek a felületekre vannak ráfeszítve; a meghajtás és a nap állása egy időpontban; [napórák](topic:sun-hours) egy napra vagy évszakra az alaprajzon |
