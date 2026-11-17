---
title: Mértékegységek, szelvényszámok és számformátumok
summary: Láb- és méteres projektek, hogyan íródnak és hogyan írhatók be a szelvényszámok, a lejtések, az oldalsó lejtések, az irányszögek, a területek, a térfogatok és a csőméretek, valamint mit tesz a mértékegységek módosítása.
keywords: hosszúság beírása, számtan, számológép, összeg, tört, láb és hüvelyk, 4+7/16, mértékegységek, láb, US survey láb, méter, metrikus, angolszász, szelvényformátum, szelvényezés, lejtés, százalék, oldalsó lejtés, h:v, irányszög, köbyard, átmérő
from: 0b9b5b6b
---

## Projektmértékegységek

Egy projekt **US láb** vagy **méter** egységben készül (a **Mértékegységek** a bal panelen). A projekt minden koordinátája, magassága, hossza és szelvényszáma ebben az egységben van.

:::warning
A **Mértékegységek** módosítása megváltoztatja a feliratokat, a szelvényformátumot, az alapértékeket és a fájlok írásának módját. **Nem** alakít át egyetlen számot sem. Ha a lábban felmért területet méterre kapcsolja, ugyanazok a számok maradnak, most már méterként értelmezve. Az állapotsor ezt írja: „A mértékegységek most méterek. A koordináták nem lettek átszámítva.” Állítsa a mértékegységeket az adataihoz, mielőtt tervezni kezd.
:::

Mi függ a mértékegységtől:

| | US láb | Méter |
|---|---|---|
| Szelvényformátum | `12+34.56` (100 láb szelvények) | `1+234.567` (1000 m-es szelvények) |
| Felkínált szintközök | 0,25 és 20 ft között | 0,1 és 10 m között |
| Terület | sq ft | sq m |
| Térfogat | cu yd | cu m |
| Cső- és műtárgyátmérő | hüvelyk | milliméter |
| Alapértelmezett ívsugár | 100 ft | 30 m |
| Szelvényjelölések az alaprajzon | 50 ft-enként, a feliratok 100 ft-enként | 20 m-enként, a feliratok 100 m-enként |
| Kiíratási léptékek | 1" = 5' – 1" = 1000' | 1:50 – 1:10000 |
| LandXML hosszegység | USSurveyFoot | meter |

Új projekt lábban indul, vagy méterben, ha a **Beállítások** › **Általános** › **Mértékegységek** menüpontban csillaggal megjelölt hosszúság-egység metrikus. A **Mértékegységek** lista az ott bekapcsolt egységeket mutatja, és mindig a projekt saját egységét. Ha ott terület- vagy térfogat-egység van csillaggal megjelölve (acre, hektár, acre-feet …), a területek és térfogatok a fenti táblázat helyett abban lesznek jelentve. Lásd: [Mértékegységek, beírt értékek és mértékegység-listák](common:unit-lists).

LandXML megnyitásakor a projekt átveszi a fájl mértékegységeit. A nemzetközi lábban lévő fájl lábprojektként nyílik meg; a számok nem változnak.

## Hossz és összegek beírása

Bármely mező, amely hosszúságot vagy magasságot vár, a sima számnál többet olvas: nyomjon Entert, és a mező a projekt egységeiben mutatja az eredményt.

| Beírja | Lábprojektben | Méterprojektben |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12,5 ft, 12,54 ft, 0,5 ft, 3,5 ft | ugyanezek a hosszak méterben |
| `4 7/16`, `4-7/16` | 4,4375 ft | 4,4375 m |
| `450 mm`, `1.2 m`, `90 cm` | lábban | 0,45 m, 1,2 m, 0,9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, a többi US survey lábban | ugyanezek a hosszak méterben |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | az összeg lábban | az összeg méterben |

A megosztott egységtáblázat bármely hosszúság-jele működik, a pontos méretével: a projekt lábai US survey lábak, így a `10 US ft` értéke 10, a `3 ch` (a nemzetközi láb láncja) pedig 197,9996. Használható a `+ - * /` és a zárójel, valamint az `abs`, `round`, `ceil` és `floor`. A hosszúságba írt kötőjel része a hossznak (`24'-6"`, `6-1/2`); szóközökkel körülvéve kivonásként értelmeződik (`24' - 6"` = 23,5 ft). Egy sima szám szorozza vagy osztja a hosszúságot, és hosszúságként értelmeződik a projekt egységeiben, ha hosszúsághoz adják. Ha a CivilCraft nem tudja beolvasni, amit beírt, a mező meg lesz jelölve, és az állapotsor megmondja, hol.

A szelvényszámok nem összegek: a `10+00` egy szelvényszám-mezőben a 10+00-s szelvényt jelenti. A százalékos lejtések, a pontszámok és a leírások úgy kerülnek beolvasásra, ahogy vannak.

## Szelvények

A szelvény a tengely mentén mért távolság, pluszjellel írva:

- Láb: a plusz előtti rész száz lábat jelent. A `12+34.56` 1 234,56 ft.
- Méter: a plusz előtti rész ezer métert jelent. Az `1+234.567` 1 234,567 m.
- A negatív szelvények előjele elöl marad: `-0+50.00`.

Bárhol ad meg szelvényt (**Kezdőszelvény**, egy PVI **Szelvénye**), beírhatja pluszjellel (`12+34.56`) vagy egyszerű számként (`1234.56`). A szóközöket figyelmen kívül hagyja.

## Lejtések és oldalak

- **A lejtések** (hosszszelvények, csövek, sáv- és váll-lejtések) százalékban: a `+1.25%` a szelvény irányában emelkedik, a `-0.50%` esik.
- **Az oldalsó lejtések** (tereplépcső bevágása és feltöltése, sáv bevágása és feltöltése) vízszintes és függőleges arányban: a `3` 3 : 1 arányt jelent, azaz három egység vízszintesen egy egység függőlegesen.
- Egy függőleges ív **K** értéke a hossza osztva a lejtésváltozással százalékban.

## Irányszögek és szögek

Az irányszögek negyedes irányszögek fokban, percben és másodpercben: `N 63°12'05" E`. Az ívek elfordulási szögei (Δ) ugyanúgy fok, perc és másodperc, „bal” vagy „jobb” jelöléssel.

## Eltolások

A tengelytől mért eltolások a tengelyre merőleges távolságok, és a szelvény irányába nézve **L** (bal) vagy **R** (jobb) jelöléssel.

## Számok megjelenítése

- A koordináták és magasságok 2 tizedesjegyet mutatnak a paneleken és az állapotsorban (a kijelölt felmérési pontnál 3-at).
- A területek és térfogatok ezres csoportokban jelennek meg: `128,250 sq ft`, `454.9 cu yd`.
- A koordinátákat soha nem csoportosítják, így úgy másolhatók, ahogy vannak.

## Koordináták

A CivilCraft síkban dolgozik: a keleti koordináta jobbra, az északi felfelé nő. A tervezés mindig vetített koordinátákkal történik (állami vetület, UTM vagy helyi rács). Megadhatja a CivilCraftnak, hogy a koordináták melyik koordinátarendszerben vannak, és hogy rács-, terep- vagy helyi koordináták-e; ekkor megmutatja a földrajzi szélességet és hosszúságot, és elhelyezi a GIS-fájlokat és a térképrétegeket, de soha nem változtatja meg magától a mértékegységeket, és nem mozgatja a koordinátáit. Lásd: [A projekt koordinátarendszerének beállítása](topic:coordinate-systems) és [Terep- és helyi koordináták](topic:ground-and-local-coordinates). Az állami vetület nagy értékei (millió láb) rendben vannak; a CivilCraft belsőleg a telekhez képest dolgozik, hogy megőrizze a pontosságot.
