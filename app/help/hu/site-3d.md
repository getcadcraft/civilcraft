---
title: A terület megtekintése 3D-ben
summary: A 3D-nézet megnyitása, körbeforgatás, pásztázás és nagyítás, a magasságnagyítás és a színezés beállítása, a megjelenítendő elemek kiválasztása, és nyomvonalak, tereplépcsők, jellemzővonalak, törésvonalak, csövek, építmények és pontok kijelölése kattintással.
keywords: feliratok, 3D-feliratok, táblafelirat, kamera felé néző feliratok, állomásfeliratok, szintvonal-feliratok, pontfeliratok, ráterítés, légifelvétel, térképrétegek a felületen, 3d, három dimenzió, 3D-nézet, nézetkocka, iránytű, körbeforgatás, perspektíva, párhuzamos, izometrikus, iso, magasságnagyítás, terep, modell, terepmodell, körüljárás, vizualizáció, renderelés, csövek 3D-ben, építmények, aknák, folyosó 3D-ben, út 3D-ben, útfelület, sávok, szegélyek, járdák, növények 3D-ben, fák 3D-ben, cserjék, sövények, tájépítés 3D, rámpák 3D-ben, lépcsők, falak, burkolás, kemény felület 3D
from: a16bafe1
---

A 3D-nézet a területet egyetlen modellként mutatja: a meglévő terepet és a kialakított felületet, rá terített szintvonalakkal, törésvonalakkal és a felület szélével; minden nyomvonalat a tervezett hossz-szelvényén, szelvényjelölésekkel; a folyosó jellemzővonalait és magát az utat (sávok, padkák, vízelvezető árkok, szegélyek, sávok és járdák a saját színükben); a tereplépcsőket a határvonalukkal; a csőhálózatot csövekkel és építményekkel a valós magasságukban; a Tájépítés munkaterületéről pedig a növényeket, burkolatokat, ösvényeket, falakat, szegélyeket, rámpákat és lépcsőket. Ugyanazt a projektet olvassa, mint az alaprajz, így minden változtatás mindkettőben megjelenik.

## A 3D-nézet megnyitása

1. Nyisson meg felmérési pontokat (vagy egy LandXML- vagy projektfájlt), hogy legyen felület. Növények, burkolat vagy rámpák önmagukban is elegendőek a megnyitáshoz.
2. Nyomja meg a {{key:D}} billentyűt, vagy kattintson a {{ui:Nézet}} eszköztárcsoport {{ui:3D}} gombjára.
   A 3D-nézet az alaprajz fölött nyílik meg, és a teljes területet délkeletről nézi. Először egy pillanatba telik a betöltés.
3. Nyomja meg ismét a {{key:D}} billentyűt, vagy kattintson újra a {{ui:3D}} gombra, hogy visszatérjen az alaprajzra. Ha egy rajzoló eszközt választ, például a {{ui:Nyomvonal}} vagy a {{ui:Tereplépcső}} gombot, az is visszavisz az alaprajzra, mivel a rajzolás ott történik.

## Mozgás

| Művelet | Teendő |
|---|---|
| Körbeforgatás | Húzás a bal vagy a középső gombbal |
| Pásztázás | Húzás a jobb gombbal, vagy {{key:Shift}} és húzás |
| Nagyítás | Görgetés; a mutató felé nagyít |
| Körbeforgatás érintőpadon | Két ujjal húzás ({{key:Shift}} és húzás pásztáz) |
| Nagyítás érintőpadon | Csippentés |
| Érintés | Egy ujj körbeforgat; két ujj csippentéssel nagyít, mozgatással pásztáz |
| Billentyűk (a nézet fókuszban van) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} körbeforgat, {{key:Shift}}-tel pásztáz; {{key:Plus}} és {{key:Minus}} nagyít |

A nézet fölötti sáv a többit tartalmazza:

- A nézetlista: **Iso**, **Felülnézet**, **Alulnézet**, **Elölnézet** (észak felé nézve), **Hátulnézet**, **Baloldali nézet**, **Jobboldali nézet**.
- A {{ui:Perspektíva}}: be van nyomva, ez a perspektivikus nézet; kattintson rá a párhuzamos vetítéshez (rövidülés nélkül).
- A {{ui:Kiterjedés}}: újra mindent mutat. Az {{key:F}} ugyanezt teszi, miközben a 3D-nézet nyitva van.

## A nézetkocka

A jobb felső sarokban lévő nézetkocka a nézettel együtt fordul. Kattintson egy oldalra, élre vagy sarokra, hogy onnan nézze a területet (a kamera simán fordul, hacsak a rendszere nem kér csökkentett mozgást). Húzza a kockát a körbeforgatáshoz. Alatta az iránytűgyűrű az északot mutatja (rácsészak, +Y): húzza a gyűrűt, hogy a területet a függőleges tengely körül elfordítsa, vagy kattintson az N, E, S vagy W betűre, hogy onnan nézzen. A {{ui:Kezdőlap}}, a bal felső sarokban lévő kis ház ikon, a teljes terület izometrikus nézetére állít vissza. Billentyűzettel: a {{key:Tab}} billentyűvel lép a kockára, a nyilakkal oldalt, élt vagy sarkot választ, az {{key:Enter}} onnan nézi.

Az alaprajzon ugyanez a kocka a felülnézetet mutatja. Kattintson bármely más oldalra, élre vagy sarokra (vagy húzza el), hogy a 3D-nézet az adott irányból nyíljon meg: ez a leggyorsabb út egy adott irányból a 3D-be. A kocka kis tengelyjelre cseréléséhez vagy elrejtéséhez lásd a **Sarokjelző** részt a [CivilCraft beállításai](topic:settings) között.

## Magasságnagyítás

A területek általában sokkal szélesebbek, mint magasak, ezért a magasságokat kezdetben **2×**-esre nyújtjuk. Válassza ki az **1×**, **2×**, **3×**, **5×** vagy **10×** értéket a sáv listájában, vagy a [CivilCraft beállításai](topic:settings) között a **3D magasságnagyítás** alatt (a kettő egy beállítás). Csak a nézet változik: a térfogatok, a hossz-szelvények és az exportok valós méretarányban maradnak.

## A felületek színezése

- **Magassági sávok**: ugyanazok a sávok és színek, mint az alaprajz magassági sávjai (a sávok számát a bal panel **Megjelenítés** része adja meg). Minden sáv széle pontosan a saját magasságában van vágva.
- **Egy szín**: a meglévő terep és a kialakított felület egyszínűen.
- **Térképrétegek**: az alaprajz alatt megjelenített térképrétegek (georeferált kép, térképcsempék vagy térképszolgáltatás; lásd [Térképrétegek](topic:map-layers)) lapként a felületekre kerülnek, így egy légifotó megjelenik a dombokon. A képek érkezésük szerint töltődnek be. Ha nincs látható térképréteg, a felületek megtartják magassági sávjaikat, és a nézet ezt jelzi. A kép a képernyőnek szól: a GLB- és OBJ-exportok nem tartalmazzák.

Ha mindkét felület látszik, a meglévő terep áttetsző a kialakított felületen, így látható a bevágás (a terv fölötti terep) és a töltés.

## Megjelenítendő elemek

Kattintson a sávon a {{ui:Megjelenítés}} gombra, és jelölje be vagy törölje:

| Elem | Mi ez |
|---|---|
| Meglévő terep | a felmérési pontokból épített felület (vagy LandXML-ből olvasva) |
| Kialakított felület | a meglévő terep a folyosókkal és tereplépcsőkkel kialakítva (csak ha vannak ilyenek) |
| Háromszöghálózat élei | minden TIN-él, vonalként |
| Szintvonalak | minden felület kis és nagy szintvonalai, az alaprajzi közönek megfelelően |
| Felületszél | minden felület külső széle, a saját magasságán |
| Törésvonalak | minden törésvonal, a saját magasságán |
| Nyomvonalak és szelvényjelölések | minden nyomvonal a tervezett hossz-szelvényén (a terepen, ha nincs szelvény), 50 ft-onként vagy 20 m-enként jelölésekkel |
| Folyosó jellemzővonalai | burkolatszél, padka és határvonal mindkét oldalon |
| Útfelületek | minden folyosó által épített út a keresztmetszeteiből: sávok, padkák, vízelvezető árkok, szegélyek, csíkok és járdák, mindegyik a saját színében, a kialakított felületen |
| Növények | minden növény, valamint az ágyásokban és sövényekben lévő növények, egyszerű formákként, a növénylistából méretezve: a fa törzs és kerek korona (kúp a fenyőknek, pálmánál csomó magas törzsön), a cserjék, sövénynövények, évelők és talajtakarók kupolák, a fűfélék csomók, a futónövények vékony oszlopok. A megjelenített méretben állnak a kialakított felületen (vagy a meglévő terepen): érettként vagy ültetéskor |
| Keményburkolat | burkolatok és ösvények lejtéssel, falak, szegélyek, lépcsők, és rámpák, amelyek szintes pihenők között futó szakaszokban emelkednek |
| Tereplépcsők és határvonalaik | minden tereplépcső körvonala a magasságán, és a határvonala |
| Csövek és építmények | a csövek kerek csövekként, a fenékszintjeik között; az építmények a peremtől az iszapzsákig |
| Felmérési pontok | pont minden ponthoz magassággal (kezdetben ki) |
| GIS-rétegek | az alaprajzon látható GIS-rétegek a saját színükben: a vonalak és körvonalak a saját magasságukon, a többiek a meglévő terepre helyezve (pontosan követik azt); a pontok kis kereszt alakúak. A felületen kívül eső, magasság nélküli alakzatok kimaradnak, és a nézet jelzi, hányat |
| Feliratok | mindig szemben álló nevek és értékek: minden nyomvonal neve az elején, és állomásai 100 ft-onként (vagy 100 m-enként); minden nagy szintvonal magassága; tereplépcsők, jellemzővonalak és építmények név szerint; és ha a **Felmérési pontok** be van jelölve, minden pont száma és magassága |

A feliratok bármilyen forgatásnál vagy nagyításnál azonos méretűek és függőlegesek maradnak, és a feliratuk előtt álló domb eltakarja. Ahol zsúfolttá válnának, a legfontosabbak látszanak, a többiek a nagyításra várnak: előbb a nyomvonalak, azután az építmények, tereplépcsők, jellemzővonalak, állomások, szintvonalak és pontok, a közelebbiek először. Csak a képernyőn vannak; az exportok és ábrák nem tartalmazzák őket.

A választásai, a magasságnagyítás és a színezés ebben a böngészőben megmarad.

Ha nyomvonal és folyosó van, de még nincs felmérési pont vagy felület, az utat egyelőre ideiglenes, lapos alapterepen rajzolja meg: a tervezett hossz-szelvényének átlagos magasságán, vagy nulla magasságon szintesen, ha az sincs. Figyelmeztetés jelenik meg a 3D-nézet alján és a folyosó tulajdonságai között. Ez csak kép: ebből nem származnak térfogatok vagy szelvények. Nyisson meg felmérési pontokat vagy felületet, és az út magától a valódi terepre kerül.

A függőleges nagyítás a terepet nyújtja, nem a növényeket: azok a nagyított terepen állnak, valódi magasságukban és terjedelmükben, így a fa bármilyen beállításnál fának látszik. A növények egyszerű alakzatok, nem részletes modellek: ezer is gyorsan fordul és nagyítható marad.

## Csövek és építmények

- A cső alja a megadott fenékszinteknél, a teteje (a korona) egy belső átmérővel feljebb van. Az átmérő lábmértékű projektben hüvelykben, métermértékűben milliméterben értendő, a jobb panelen látható módon.
- Egy építmény a peremétől (begépelve, vagy a felülettől) az iszapzsákjáig (a legalacsonyabb fenékszint mínusz az iszapzsák mélysége) fut. Fenékszint nélkül 5 ft (1,5 m) mélyre rajzolódik.
- A problémás csövek és építmények (lásd a hálózat-ellenőrzést a jobb panelen) pirossal vannak rajzolva.
- A fenékszint nélküli csövet nem rajzolja meg; a nézet alján egy megjegyzés mondja meg, hányat.

## Kijelölés a 3D-nézetből

Kattintson egy nyomvonalra (vagy annak útjára), tereplépcsőre, jellemzővonalra, csőre, építményre, felmérési pontra, növényre, rámpára vagy más keményburkolatra. Ugyanúgy kerül kijelölésre, mintha az alaprajzon kattintott volna: tulajdonságai a jobb panelen nyílnak meg, ahol szerkesztheti, és a kijelölés színével, mindenen felül rajzolódik a 3D-ben. Ami az alaprajzon ki van jelölve, a 3D-ben is kiemelve van. A mutató mellett lévő tipp megnevezi, amire kattintott, a keleti, északi koordinátájával és magasságával. A csöveket és építményeket akkor is ki lehet jelölni, ha a föld alatt vannak; a dombok mögött rejtett vonalon nem lehet átkattintani.

Kattintson egy törésvonalra, hogy lássa, melyik az: kiemelődik, és az állapotsor megnevezi (a törésvonalaknak nincs saját tulajdonságuk).

Kattintson a terepre, hogy a tippben megkapja az ott lévő keleti, északi koordinátát és magasságot.

## Haladás a nyomvonal mentén

Kattintson a 3D-sávon a **Vezetés** gombra, és válasszon nyomvonalat. A nézet a sofőr ülésébe kerül: 3,5 ft (1,07 m) az út fölött, a tervezett hossz-szelvényén (ha az még nincs, a középvonal mentén a meglévő terepen), előre nézve.

- A **Lejátszás** vagy a {{key:Space}} a kiválasztott sebességgel halad (10–65 mph, vagy 15–100 km/h); a {{key:Space}} még egyszer megállítja. A végénél megáll; a **Lejátszás** ekkor újra az elejéről indul.
- A csúszka bármely szelvényszámra ugrik; a {{key:Left}} és {{key:Right}} 10 ft-et (5 m-t) lép vissza és előre.
- A nézetben húzás megállítja, és körbenézhet.
- A **Leállítás** vagy az {{key:Esc}} visszaállítja a nézetet oda, ahol volt.

A függőleges nagyítás vezetés közben is érvényes: 1×-esre állítva látja az utat úgy, ahogy majd lesz.

## Napfény

Nyissa meg a 3D-sávon a **Nap** menüt, és jelölje be a **Napfény** lehetőséget. Adja meg a dátumot, az órát és az időzónát (az UTC-tól való eltérést: nyáron a nyári időszámításét), valamint a terület szélességét és hosszúságát. Ha a projektnek van koordináta-rendszere, ezeket onnan tölti ki.

A terület ekkor ott kap fényt, ahol a nap van, a terepen, a folyosón és a tereplépcsőkön végighúzódó **Árnyékokkal**; a menü megmondja a nap azimutját és magasságát, vagy hogy a horizont alatt van. A helyzeteket a NOAA napegyenletei adják. Az árnyékok bármilyen nagyításnál a helyes irányba esnek, de a terület szélén megállnak: a határon túli dombok és épületek nem vetnek árnyékot.

## A 3D-nézet exportja

Kattintson a sávon a {{ui:GLB}} vagy {{ui:OBJ}} gombra. Amit a nézet mutat, valós méretarányban (nagyítás nélkül), méterben, Y tengellyel felfelé mentődik. Részletek: [A terület exportálása 3D-ben](topic:export-3d).
