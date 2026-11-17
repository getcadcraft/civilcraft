---
title: Vasúti pálya tervezése
summary: Nyomvonal vasúttá alakítása: átmeneti ívek (klotoid, köbös parabola, Bloss, Helmert, szinuszos félhullám, szinusz), minden ívhez egyensúlyi túlemelés szerinti túlemelés, túlemelési hiány és többlet, a túlemelési és pályageometriai határértékek figyelmeztetésként, váltók és átkötő vágányok állomásonként, a vonal mentén végighúzott szabadhatár-burkoló, valamint sínekkel, talpfákkal és zúzottkő-ágyazattal épített pálya, mint folyosó: alaprajzon, metszeteken, hossz-szelvényben, 3D-ben és mennyiségekben.
keywords: vasút, sín, vasútvonal, pálya, vonat, metró, villamos, túlemelés, túlemelési hiány, túlemelési többlet, egyensúlyi túlemelés, átmenet, átmeneti ív, klotoid, köbös parabola, Bloss, Helmert, szinuszos félhullám, koszinusz, nyomtáv, normál nyomtáv, széles nyomtáv, méternyomtáv, keskeny nyomtáv, talpfa, aljfa, zúzottkő, alágyazás, pályatest, szegélysáv, vágánytengelytávolság, 60E1, 54E1, UIC60, 115RE, 136RE, túlemelés-meredekség, túlemelés-változási sebesség, váltó, váltónyelv, sínváltó, átkötő vágány, keresztezés, keresztezési szám, bevezetés, zárógörbe, kitérési sebesség, szabadhatár, szabadhatár-burkoló, szabadsági szelvény, terhelési szelvény, mozgási burkoló, peron, peronrés, vágányköz, lejtés, magassági ív, legkisebb sugár, LandXML túlemelés
from: 99de9745
---

Bármely nyomvonal lehet vasúti pálya. Ezután az ívei átmeneti íveket és túlemelést (a sínek keresztlejtését) kapnak, a folyosója pedig pályaként épül meg: sínek talpfákon, zúzottkő-ágyazaton, a terepbe a közúthoz hasonlóan illesztve. Váltók és átkötő vágányok állomásonként kerülnek rá, a szabadhatár-burkoló végighúzható a nyomvonal mentén, és ellenőrizhető vele a pálya mellett álló dolgokkal szemben.

Az alábbi értékek mind **helyőrzők**, nem szabványok. A vasutak a határértékeiket a vonali sebesség, a pályatípus és az ország szerint állapítják meg; ezeket a saját vasúti szabványukból adja meg. A CivilCraft nem tartalmaz nemzeti táblázatot.

## A nyomvonal vasúttá alakítása

1. Jelölje ki a nyomvonalat, és keresse meg a **Vasút** részt a Tulajdonságok között.
2. Jelölje be a **Ez a nyomvonal vasúti pálya** jelölőnégyzetet. Minden módosítás egy visszavonási lépés.
3. Állítsa be a **Tervezési sebesség** értékét a nyomvonal Tulajdonságai tetején: ez az a vonali sebesség, amelyhez a túlemelést ellenőrizzük. A **Leglassabb vonatok** (a Vasút blokkban) az a sebesség, amelyhez a túlemelési többletet ellenőrizzük.

## Átmeneti ívek

Adja meg minden ív mindkét végén az átmeneti ív hosszát a PI táblázatban (**Átmeneti ív be**, **Átmeneti ív ki**), majd válassza ki a típusát a Vasút blokk ívtáblázatában, vagy válassza az **Átmenet minden ívhez** lehetőséget:

| Típus | Görbület az átmeneten át |
|---|---|
| Klotoid | egyenletesen nő (a közúti spirál) |
| Köbös parabola | y = x³ / (6·R·L), L az érintő mentén mérve; maga az ív kissé hosszabb |
| Bloss | a teljes görbület 3u² − 2u³ része (u = a hossz hányada): finoman indul és fut ki |
| Helmert | két parabola: 2u², majd 1 − 2(1 − u)² |
| Szinuszos félhullám | (1 − cos πu) / 2 |
| Szinusz | u − sin(2πu) / 2π |

A köbös parabola kivételével mindegyik L / 2R szöggel fordul el, akárcsak a klotoid. Az állomások a valódi hossz mentén haladnak. A LandXML megőrzi a típust (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Túlemelés

Írja be minden ív **Túlemelés** értékét milliméterben. A táblázat ívenként a következőket mutatja:

- **Egyensúlyi** túlemelés = G·v² / (g·R), ahol G a sínközéptávolság (**Sínközéptávolság**: a nyomtáv plusz a sín fejszélessége, kivéve, ha kézzel adja meg). G = 1500 mm esetén ez a jól ismert 11.8·V² / R (V km/h-ban, R m-ben).
- **Túlemelési hiány** = egyensúlyi túlemelés a vonali sebességnél − alkalmazott túlemelés.
- **Túlemelési többlet** = alkalmazott túlemelés − egyensúlyi túlemelés a leglassabb vonatok sebességénél.
- **Rámpa**: a legmeredekebb túlemelés-meredekség a rámpái mentén, mm/m-ben.

A túlemelés minden átmeneten felfut, a görbületéhez igazodó alakban: egyenes a klotoidnál vagy a köbös parabolánál, Bloss-alakú a Bloss-nál, és így tovább. Az átmenet nélküli ívvég az előtte lévő egyenesen fut fel, a túlemelés-meredekség határértéke által megkívánt hosszon, és erről jelzést ad: ekkor a túlemelés ott változik, ahol a görbület nem.

A **Túlemelés forgástengelye** azt adja meg, melyik sín marad a tervezési szelvényen: **az alacsonyabb sín** (a szokásos), **a belső sín**, vagy **a vágánytengely** (mindkét sín a túlemelés felét mozdul el). A tervezési szelvény ott a sín felső pontja.

A **Túlemelési diagram** minden sín magasságát rajzolja az állomások mentén a szelvény fölé; a hossz-szelvény nézet, valamint az alaprajz- és hossz-szelvény lapok ugyanezt a szelvény alatti sávként kapják meg.

## Túlemelési határértékek és figyelmeztetések

Minden íven ellenőrzi a következőket: **Legnagyobb alkalmazott túlemelés**, **Legnagyobb túlemelési hiány**, **Legnagyobb túlemelési többlet**, **Legmeredekebb túlemelés-meredekség** és **Leggyorsabb túlemelés-változás** (a meredekség vonali sebességnél, mm/s-ban). A határérték fölötti érték figyelmeztetés a Vasút blokkban és a Problémák panelen, a határértékkel és a talált értékkel együtt. Tervezési sebesség nélkül a hiányt és a változási sebességet nem ellenőrzi (erről megjegyzés szól).

## A pálya

Állítsa be a **Nyomtáv** értékét (normál 1435 mm, vagy a széles, méter- vagy keskeny nyomtáv beállítása, illetve saját érték), a **Sínszelvény** értékét (60E1, 54E1, 49E1, 115RE, 136RE: csak a közzétett méreteik), a **Vágányok** számát és a **Vágánytengelytávolságot**, majd a **Talpfák és ágyazat** részt: a talpfa anyagát, hosszát, szélességét, magasságát és osztását; a talpfa alatti zúzottkő-vastagságot (az alacsonyabb sínnél), a vállat, a lejtést, és azt, hogy az ágyazat teteje mennyivel van a talpfák alatt; az alágyazás vastagságát, a zúzottkő lábától mért szegélysávot és a pályatest keresztlejtését.

Nyomja meg a **Pálya építése** gombot. Ez a nyomvonal folyosóját alakítja pályává a tervezési szelvény mentén: a sínek és a talpfák a túlemelésnek megfelelően dőlnek, a pályatest nem. A terepcsatlakozási lejtők a szegélysávtól indulnak a folyosó bevágási és töltési lejtőinél, a pálya pedig a közúthoz hasonlóan illeszkedik a tervezett felszínbe.

- **Alaprajz**: minden vágány mindkét sínje (C-RAIL-TRAK réteg) és, ha egynél több vágány van, minden vágány tengelye (C-RAIL-CNTR), a képernyőn, DXF, DWG, PDF formátumban és az alaprajz- és hossz-szelvény lapokon.
- **Metszetek**: a talpfák, a sínek, valamint a zúzottkő és az alágyazás alsó széle minden metszetben.
- **3D**: a sínek, minden talpfa és a zúzottkő-ágyazat (Megjelenítés › Pálya), GLB, OBJ és USD formátumban is.
- **Mennyiségek**: pályahossz, sín (minden vágány mindkét sínje, mindegyik vágány saját vonala mentén), talpfák, a zúzottkő-ágyazat és a zúzottkő a talpfák nélkül, valamint az alágyazás, a metszetek közötti átlagos véglapok módszerével.

## Pályageometriai ellenőrzések

A túlemelés mellett a Vasút blokk a vonalat magát is hat további határértékkel ellenőrzi (ezek mind helyőrzők, a saját értékeivel kell beállítani):

- **Legmeredekebb lejtés** a tervezési szelvényen, mm/m-ben.
- **Legkisebb magassági ívsugár** k tényezőként, R ≥ k·V² alakban (R m-ben, V km/h-ban). Két lejtés között L hosszúságú parabolikus magassági íven a sugár L osztva a lejtésváltozással.
- **Legrövidebb magassági ív**.
- **Legkisebb ívsugár** alaprajzon (0 esetén az ellenőrzés kikapcsol).
- **Legrövidebb ív vagy egyenes**, a vonali sebességgel megtett másodpercekben: ha a körív vagy két ív közötti egyenes ennél a távolságnál rövidebb, figyelmeztetés jár. Az 1.8 s a jól ismert érték: „a km/h-ban mért sebesség fele méterben”.
- **Túlemelési hiány változási sebessége** minden átmeneten, mm/s-ban a vonali sebességnél.

A **Pályageometria** a talált legmeredekebb lejtést és minden magassági ívet felsorolja a sugarával és a vonali sebesség által megkívánt sugárral. Az átmeneten vagy túlemelési rámpán fekvő magassági ív megjegyzést kap. Tervezési szelvény vagy tervezési sebesség nélkül a szükséges ellenőrzések kimaradnak, és erről megjegyzés szól.

## Váltók és átkötő vágányok

A **Váltók és átkötő vágányok** részben nyomja meg a **Váltó hozzáadása** gombot. A váltó a leghosszabb egyenesre kerül; a táblázatban állítsa be:

- **Váltóhegy szelvényszáma**: hol kezdődik a váltó ezen a nyomvonalon.
- **Keresztezés**: a keresztezési szám N (1:N). A keresztezési szög 2·atan(1 / 2N).
- **Oldal**: bal vagy jobb, a szelvényszám növekedése irányába nézve.
- **Átkötés távolsága** méterben: 0-nál nagyobb értéknél a váltó ennyi távolságra lévő párhuzamos vágányhoz vezető átkötő vágánnyá válik (két váltó és a közöttük lévő egyenes).

A táblázat megmutatja a **Bevezetés** hosszát (váltóhegytől a keresztezésig), a zárógörbe **Sugarát**, valamint a **Kitérési sebességet**, amelyet ez a sugár enged a túlemelési hiány határértékével és túlemelés nélkül. A **Pálya létrehozása** gomb a kitérő ágat saját nyomvonallá alakítja (a váltó, a zárógörbe, majd egyenesen tovább a keresztezési szögben) ugyanazokkal a vasúti beállításokkal, készen a meghosszabbításra.

Az alaprajzon minden váltó két kitérő sínje, tengelyvonala, jelölés a váltóhegynél és a keresztezésnél, valamint „1:N” (C-RAIL-TURN réteg) látszik, a képernyőn és DXF, DWG, PDF formátumban és a lapokon. A 3D nézet a kitérő síneket a fővágány szintjén rajzolja.

A forma **helyőrző**: egyenes váltónyelv és egy zárógörbe a keresztezési számtól függően. A megépített váltó a vasút szabványát és a gyártó rajzát követi. Figyelmeztetések: ha a váltó kilóg a nyomvonalból, íven, átmeneten, túlemelésen vagy magassági íven fekszik, vagy másik váltóval átfedésben van; továbbá megjegyzés, ha a vonali sebesség a kitérési sebesség fölött van.

## Szabadhatár-burkoló

Jelölje be a **Szabadhatár-burkoló végighúzása ezen a pályán** jelölőnégyzetet. Válassza ki a **Körvonalat** (két helyőrző alak, vagy a **Saját körvonal**, soronként egy pontként beírva: eltolás a pályatengelytől, majd magasság a sín teteje fölött, méterben), a **Járműhosszt** és a **Forgóváz-tengelytávolságot**, és ha van, a **Peronszélt** (oldal, távolság a pályatengelytől, magasság a sín fölött).

Minden állomásnál a körvonal az alacsonyabb sín körül a túlemelésnek megfelelően dől, és az ív miatt kiszélesedik: a jármű közepe b² / 8R értékkel befelé, a végei (L² − b²) / 8R értékkel kifelé mozdulnak (b a forgóváz-tengelytávolság, L a járműhossz, R az ott érvényes sugár, az átmenetet követve). A blokk a szelvényt az egyenesen és ott rajzolja, ahol a legszélesebb, és felsorolja:

- a **legszélesebb burkolót** és helyét,
- a **vágánytengelytávolságot** összevetve azzal, amit két szomszédos burkoló igényel,
- a **peronszélnél** megmaradó helyet, vagy azt, mennyivel nyúlik be,
- minden jellemzővonalat, csőműtárgyat és más vasúti nyomvonalat, amely a **burkolón belül** található.

A magassági adatokkal rendelkező jellemzővonalat a körvonalhoz képest a sín feletti magasságánál vizsgálja; tervezési szelvény nélkül, vagy magassági adat nélküli pontnál csak alaprajzon vizsgálja, és a lista ezt jelzi. Az alaprajz a burkoló két szélét mutatja (C-RAIL-CLRN réteg), és minden benne lévő elemnél keresztet.

A felajánlott körvonalak **helyőrzők, nem valamely vasút nyomtávja**. Az eredményre támaszkodás előtt adja meg a vasút szabadsági szelvényét.

## Más programokban

- **LandXML**: a vasúti nyomvonal az átmeneteivel (spiType) és egy `Cant` blokkal íródik: a nyomtáv, a forgatási pont, a vonali sebesség, valamint egy-egy szelvény, ahol minden túlemelési rámpa kezdődik és végződik, az alkalmazott túlemelés, az egyensúlyi túlemelés és a hiány megadásával. `Cant` blokkot tartalmazó LandXML fájl megnyitása ezt a nyomvonalat ezekkel a túlemelésekkel vasúttá teszi.
- **IFC**: a nyomvonal túlemelési szakaszaival, a sínek, talpfák, zúzottkő és alágyazás.

## Még nincs elkészítve

Váltók az IFC exportban, a váltócsaládok az egyetlen zárógörbén túl (ívelt váltónyelvek, mozgó szívű keresztezések, csúszóváltók, rombusz-keresztezések), a mozgási szelvény szabályai (a burkoló rögzített körvonal ívbeli kitéréssel), légvezetékek és jelzéstechnika.

**Melyik szabvány.** A Vasút blokkban a „Hivatkozott szabvány” értéke Nincs vagy Európai (UIC és EN). Az Európai választása azokat a dokumentumokat nevezi meg, amelyekre egy európai projekt hivatkozik (EN 13803 a nyomvonal-paraméterekhez, EN 13232 a váltókhoz és keresztezésekhez, EN 15273 a nyomtávokhoz, EN 13848 a pályageometria minőségéhez), és minden határértékhez mezőt ad a hivatkozott ponthoz. Egyetlen szabvány száma sincs beépítve: a túlemelési, hiány-, többlet-, lejtés- és változási határértékek, a váltógeometria és a szabadsági szelvény mind helyőrzők, és az ablak ezt jelzi. Vasútmérnök ellenőrizze minden értéket a szabvány saját szövegével szemben, és írja mellé a pontot, mielőtt bármit megépítene. Dél-Afrika és az AREMA-táblázatok nincsenek benne ebben a kiadásban.
