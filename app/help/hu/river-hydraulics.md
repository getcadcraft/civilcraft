---
title: Folyók vízfelszín-profiljai
summary: Folyó modellezése a terepfelszínből, és állandósult vízfelszín-profilok számítása a lépésenkénti módszerrel: vízszintek, energia, sebességek, Froude-számok és az elöntési terület az alaprajzon. Laboratóriumi funkció; minden eredményt mérnöki felülvizsgálatnak kell követnie.
keywords: gát, hatástalan áramlási terület, szelvényszerkesztő, folyó, hidraulika, vízfelszín-profil, duzzasztás, lépésenkénti módszer, állandósult áramlás, 1d, keresztszelvények, manning, érdesség, szállítóképesség, kritikus mélység, normálmélység, froude, energiavonal, elöntési terület, árterület, elöntés, parti pontok, szakaszhosszak, szűkítés, tágulás, szubkritikus, szuperkritikus, vegyes állapot, vízugrás
from: fb8bf425
---

A CivilCraft egydimenziós, állandósult vízfelszín-profilokat számít a folyó mentén: minden megadott vízhozamhoz kiszámítja a vízszintet minden keresztszelvényben, a szomszédos szelvények közötti energiamérlegből (lépésenkénti módszer). Laboratóriumi állapotban van, amíg ellenőrzik.

**Csak tervezési segédlet.** A vízszintekre csak képzett mérnöki felülvizsgálat után szabad támaszkodni: egy 1D-s modell annyira jó, mint a szelvényei, érdességi értékei, szakaszhosszai és peremfeltételei, és nem tud a hidakról, átereszekről vagy a folyóból kilépő áramlásról.

## A folyó megrajzolása

1. Először építse meg a meglévő terepfelszínt (pontok, törésvonalak vagy egy megnyitott TIN).
2. A **Felület** › {{ui:Továbbiak}} alatt válassza a {{ui:Folyó}} lehetőséget.
3. Kattintson a folyó középvonala mentén **a felvízi szakasztól az alvízi felé**, majd nyomja meg az {{key:Enter}} billentyűt, vagy kattintson duplán.

A CivilCraft 50 m-enként (200 ft), minden oldalra 100 m-ig (300 ft) a középvonalra merőleges keresztszelvényt vág a terepből. A folyó szelvényszámait az alvízi végtől mérik, így felfelé nőnek. A partok kiindulási becslésként minden szelvény legalacsonyabb pontjától 10 m-re (30 ft) indulnak mindkét oldalon.

Ha a folyó szűkül, vagy építmény van, adjon hozzá szelvényt: jelölje ki a folyót, kattintson a {{ui:Keresztszelvény hozzáadása}} gombra, majd húzzon rá egy vágóvonalat (mindkét irányban jó: a program úgy fordítja, hogy az alvíz felé nézve balról jobbra fusson).

## A folyó beállítása

Jelölje ki a folyót, hogy a **Tulajdonságok** között lássa:

- **Áramlási állapot**: szubkritikus (a szokásos eset: az alvízi peremről számítva felfelé), szuperkritikus (a felvízi peremről számítva lefelé) vagy vegyes (mindkettő, majd minden szelvényben az, amelyiknek nagyobb a fajlagos erője; előnézet).
- **Áramlási profilok**: név és vízhozam mindegyikhez (például egy 10 éves és egy 100 éves vízhozam), és a peremfeltétel az alvízi végen (és a felvízi végen, ha az állapot nem szubkritikus): **Normálmélység** energialejtéssel (a mederlejtés csak első becslés), ismert **vízfelszín-magasság**, vagy **Kritikus mélység**.
- **Szelvények a terepből**: a távolság, a bal és jobb oldali kiterjedés, a parti becslés és a két Manning-féle n érték; a {{ui:Keresztszelvények újravágása}} lecseréli a szelvényeket (egy visszavonási lépés).
- **A keresztszelvények táblázata**: szelvényenként a bal és jobb parti eltolás, a meder n és az ártér n, a szakaszhosszak a következő alvízi szelvényig (bal ártér, meder, jobb ártér; az alaprajzról mérve), valamint a szűkítési és tágulási tényezők (kezdetben 0,1 és 0,3: fokozatos átmenetek). A {{ui:Szerkesztés}} megnyitja a szelvényszerkesztőt (lentebb); a gomb utáni pont azt jelzi, hogy a szelvényben gát vagy hatástalan terület van.

Minden változtatás egy visszavonási lépés ({{key:Mod+Z}}).

## Szelvény szerkesztése: partok, gátak és hatástalan területek

A szelvényen a {{ui:Szerkesztés}} megrajzolja a terepet, és húzással állíthatja azt, amit a számító olvas: a **bal és jobb parti pontot** (ezek a szelvényt bal ártérre, mederre és jobb ártérre bontják), **gátat** bármelyik oldalon és **hatástalan áramlási területeket**. Minden fogantyú a nyilakkal is mozgatható, és minden szám beírható a diagram mellé. Az {{ui:Alkalmaz}} egy visszavonási lépés.

- A **gátnak** helye (eltolása) és koronamagassága van. A töltésen túli, a folyótól távolabbi terület el van vágva a folyótól, amíg a vízfelszín a korona alatt van: területe, nedvesített kerülete és szállítóképessége kimarad. A korona felett a teljes szelvény újra beszámít. A gát a védett part előtt áll; ha a parton belül van, jelzés kerül rá.
- Egy **hatástalan áramlási terület** vizet tart, de nem szállít áramlást (töltés mögötti zsák, híd bevezetőjének holtvize). Adja meg a két eltolását, és ha akarja, azt a vízszintet, amely alatt hatástalan (ha üresen hagyja, **mindig**): e szint felett úgy áramlik, mint a többi. A mederrész egy részét lefedő terület jelzést kap.
- Két szelvény között az elöntési terület szárazon hagyja azt a terepet, amely mögött gát van, ha mindkét szelvénynek van ott gátja, és a vízfelszín ott a korona alatt van (a két korona közötti vonal egyenes).

## Számítás és az eredmények olvasása

Kattintson a {{ui:Vízfelszín-profilok}} gombra. A kiválasztott profilhoz ezeket kapja:

- egy **ábra** a folyó mentén (áramlás balról jobbra): mederfenék, partok, vízfelszín, energiavonal és kritikus vízfelszín; a kritikus mélységen tartott szelvények be vannak karikázva;
- egy **táblázat** szelvényenként: folyószelvényszám, vízhozam, mederfenék, vízfelszín, kritikus vízfelszín, energiavonal, mélység, sebesség a mederben és összesen, a meder Froude-száma, áramlási keresztmetszet, felső szélesség, a vízhozam az egyes ártereken és a medrében, energialejtés és figyelmeztetések;
- **figyelmeztetések** közérthető szavakkal, például egy kritikus mélységre állított szelvény, víz a szelvény végei felett, vagy nagy szállítóképesség-változás két szelvény között (ilyenkor szúrjon be köztes szelvényeket).

A {{ui:Táblázat (CSV)}}, a {{ui:Jelentés}} (egyszerű szöveg a módszerrel, a peremfeltételekkel és minden táblázattal) és az {{ui:Ábra (SVG)}} a letöltések mappájába mentődik. Mindegyik tartalmazza a felülvizsgálati sort.

Jelölje be a **Tulajdonságok** között az {{ui:Az elöntési terület megjelenítése}} jelölőnégyzetet, hogy a kiválasztott profilhoz az alaprajzon árnyalja a nedves területet, a vízvonalat pedig ott rajzolja meg, ahol a mélység nulla. Szelvények között a vízfelszín a folyó keresztmetszetében vízszintes, és a szelvényszámmal lineárisan változik. A gát mögötti terület szárazon marad, amíg a víz a korona alatt van. A folyó folyosóján belül más alacsony terület, amelyet a víz nem ér el (például egy úti töltés mögött), szintén árnyalva marad: ezt ellenőrizze.

## A rajzon és a Problémák panelen

A folyó vonalai saját rétegükön kerülnek az alaprajzra, a PDF-be és a DWG-be: **C-WATR-CNTR** (a középvonal), **C-WATR-SCTN** (minden vágóvonal a folyó szelvényszámával) és **C-WATR-FLOD** (az elöntési terület vízvonala, ha egy profilnál be van jelölve az {{ui:Az elöntési terület megjelenítése}}). A folyó figyelmeztetései (kritikus mélységre állított szelvény, víz a szelvényvégek felett, további szelvényeket kérő szállítóképesség-változás, nem záródó energiamérleg, a partokon belüli gát) szintén a **Problémák** panelre kerülnek, a folyóhoz, a forrásszelvényüknél elhelyezve.

## A számítás módja

- Energia két szelvény között: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Szállítóképesség részekre bontva: minden ártér ott szakad, ahol az n változik, K = Σ (1/n)·A·R^(2/3) (US egységekben 1,486/n); a meder egy darab, összetett n-nel, ha az n változik. Az α a szállítóképesség megosztásából adódik.
- Súrlódási lejtés átlagos szállítóképességgel: Sf = ((Q₁ + Q₂)/(K₁ + K₂))², a vízhozammal súlyozott szakaszhossz felett.
- Szűkítési tényező, ha az áramlás lefelé gyorsul; tágulási, ha lassul.
- Kritikus mélység = legkisebb fajlagos energia. Minden vízszint zárt intervallumon van megoldva, így soha nem ugrik a kritikus érték rossz oldalára; ha nincs megoldás, kritikus mélységre állítja és megjelöli.

A program ellenőrzése: Manning normálmélységére, téglalap keresztmetszetű meder kritikus mélységére és Chow visszaduzzasztási példájára (*Open-Channel Hydraulics*, 1959, 10. fejezet), amelyet függetlenül integráltak. Ugyanezt a módszert használják a szokásos 1D-s folyóprogramok, így egy kézi számítás vagy egy hallgató jegyzetei átvihetők.

## Áteresztők és hidak

A folyó **Tulajdonságok** részében, az **Áteresztők és hidak** alatt a {{ui:Áteresz hozzáadása}} vagy a {{ui:Híd hozzáadása}} gomb két szelvény közé helyez egyet (minden szakasz legalább két szelvényt tart meg). Az alatta lévő profil nem változik; az építmény felett közvetlenül a vízfelszín az építményből adódik, és a profil onnan folytatódik felfelé. Az **Eredmények** minden építményről táblázatot ad: alvízi vízszint, felvízi vízszint, melyik szabályozás az irányadó, a nyíláson átfolyó vízhozam és az úton vagy pályalemezen átfolyó vízhozam. Csak szubkritikus áramlásra.

- **Áteresz** (doboz vagy kör, egy vagy több egyenlő csőnyílással). A bemeneti szabályozás bukóáramlás, amíg a bemenet szabad, és nyílásáramlás, amint elöntötté válik, a felvízi szint között, amely az emelkedés egy- és másfélszerese között keveredik. A kimeneti szabályozás energiamérleg: bemeneti veszteség, súrlódás és kilépési sebességmagasság, a magasabb értékhez képest, akár az alvízi szint, akár a kritikus mélység közepe és a korona között, mínusz az esés a csőhossz mentén. A felvízi szint a két érték nagyobbika. Jelölje be a **Víz átfolyhat az úton** lehetőséget, és az út bukóárama megosztja a vízhozamot a nyílásokkal.
- **Híd.** A nyílás a híd alatti szelvény, a támaszoknál vágva, minden pillér olyan terület, amely nem szállít áramlást. A nyílásban a vízfelszín az alatta lévő szelvényből adódik (tágulási tényező), a felette lévő szelvény pedig a nyílásból (szűkítési tényező). Ha a nyílás nem tudja átvezetni a vízhozamot az adott alvízi szinten, kritikus mélységen fut, és a híd eldugulónak van jelölve. Ha a víz eléri az alsó övet, nyomásos áramlás lesz (zsilip jellegű, amíg az alvíz az alsó öv alatt van, elöntött, ha fölötte), és a pályalemez fölötti víz bukóáramlást ad hozzá; a felvízi szint az, amelynél ezek összege adja a vízhozamot.

Az együtthatók (kiáramlás, bemeneti veszteség, bukó) kerek értékű alapértékek, amelyeket be lehet gépelni. Módosítsa őket a tervéhez. Nem a tervezési kézikönyvek illesztett diagramjai, ezért a határához közeli áteresz felvízi szintjét becslésnek tekintse. Az út vagy pályalemez feletti víz, az elöntött bemenet, az eldugult nyílás és a gyors áramlás a csőben a **Problémák** panelen jelenik meg.

## Nem permanens áramlás

A folyó **Tulajdonságok** részében az {{ui:Nem permanens áramlás…}} egy árvízi hidrogramot vezet végig a szelvényeken. Adja meg a bemenetet órákként és vízhozamként, soronként egy párt, az alvízi lejtést (normálmélység) és a futtatás hosszát. Az első vízhozam állandósult vízfelszínéről indul, és a teljes egydimenziós egyenleteket oldja meg (implicit négypontos séma, az időben 0,6 súllyal). Minden szelvényben megkapja a legmagasabb vízszintet és vízhozamot az egyes események óráival, a két végen mért vízhozam-ábrát és a térfogat-ellenőrzést (be, ki és a tárolt változás). Ellenőrzi, hogy az állandó áramlás állandó marad, hogy a bemenet lépése az új vízhozam állandósult profiljában zárul, hogy a térfogat záródik, és hogy az árhullám sebessége a kinematikus hullámhoz képest mennyi. Csak szubkritikus áramlás, egy szakasz, oldalbemenet nélkül, és a futtatáson belül nincsenek átereszek vagy hidak.

## Összefolyások

Szakaszok, amelyek egy kimenetbe vezetnek: a vízhozamok összeadódnak, és az alvízi szakasz fejénél lévő vízfelszín felfelé viszi azoknak a szakaszoknak a végeihez, amelyek hozzá csatlakoznak (ugyanaz a vízfelszín az összefolyásnál, az egyszerű módszer: nincs szög, nincs lendület, ezért kis Froude-számokhoz illik). A modell és a tesztek megvannak (`river-structures.js`); az alaprajzon két folyó összekötésére szolgáló panel még nincs elkészítve.

## Még nincs elkészítve

Bukók és zsilipek önálló szerkezetként, az összefolyások panele, szerkezetek nem permanens futtatáson belül, és szuperkritikus nem permanens áramlás. A vegyes állapotú futtatás két szelvény között vízugrást jelöl, de nem helyezi el.

**Ahol a folyók találkoznak.** A folyó Tulajdonságai között az „Ebbe ömlik” megnevezi azt a folyót, amelybe betorkollik. Az egymásba ömlő folyókat együtt oldják meg: a folyó, amelybe ömlenek, az összes vízhozamukat viszi, és mindegyikük annak a folyónak az első szelvényénél lévő vízfelszínnél végződik (az egyenlő vízfelszín módszer; ez elhagyja az áramlások szögét és lendületét). Egy főfolyó és egy patak összekötéséhez rajzoljon egy rövid folyót az összefolyás alá, és hagyja, hogy mindkettő bele ömöljön. Az eredmények egy összefolyási táblázatot mutatnak. Az eredmények alapértelmezései (szűkítés 0,1, tágulás 0,3, egydarabos meder összetett érdességgel, a vegyes állapot fajlagos erő szerint) addig maradnak, amíg mérnök át nem nézi őket, és az Eredmények ezt megmondják.
