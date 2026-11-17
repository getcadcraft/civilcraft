---
title: GIS-rétegek elemzése
summary: Puffer, átfedés (metszet, unió, törlés, összevonás), térbeli összekapcsolás, kijelölés attribútum szerint és a projekt GIS-rétegeinek mérése; mindegyik új rétegként, visszavonható módon.
keywords: gis, elemzés, puffer, átfedés, metszet, unió, törlés, vágás, összevonás, térbeli összekapcsolás, összekapcsolás, kijelölés attribútum szerint, lekérdezés, where, kifejezés, statisztika, terület, hossz, kerület, mérés, telkek, szolgalmi jog, beépítési távolság, shapefile, geopackage, attribútumtábla
from: a6b2d3f9
---

Ha a projektben már vannak GIS-rétegek (lásd [GIS-adatok importálása](topic:gis-import)), a **GIS** csoport **Elemzés** gombja (beírva: `GISANALYSIS`, `ANALYZE` vagy `BUFFER`) öt lapot tartalmazó panelt nyit meg. A panel a terv mellett marad nyitva, így a kijelölt elemek a munka közben is megjelennek a terven.

Minden eszköz, amely új elemet hoz létre, új réteget ad hozzá, és a beolvasott rétegeket változatlanul hagyja. Mindegyik egy visszavonási lépés: a panelen lévő {{ui:Visszavonás}} gomb (vagy a Ctrl+Z) eltávolítja az új réteget. Az eredményt a többi réteghez hasonlóan exportálhatja a [Kivitelezés utáni (as-built) adatok exportálása GIS-hez](topic:gis-export) témakör szerint, shapefile, GeoJSON vagy GeoPackage formátumban.

Egy réteg teljes táblázata rendezéssel, szerkesztéssel és mezőszámológéppel a [Munka a réteg attribútumtáblájával](topic:gis-table) témakörben található; a mező szerinti színezés a [Réteg stílusa attribútum alapján](topic:gis-symbology) témakörben.

Minden a terven dolgozik, a projekt mértékegységében (láb vagy méter). A projekt mindig vetített vagy helyi koordináta-rendszerben van, így az 50-es távolság 50 lábat vagy 50 métert jelent, soha nem fokot. A magasságok (z) nem maradnak meg az eredményekben.

## Puffer

Minden elem köré adott távolságú zónát rajzol, új poligonrétegként. A pontokból körök lesznek, a vonalakból lekerekített végű sávok, a poligonok pedig nagyobbodnak. A negatív távolság a poligonokat zsugorítja (egy 100 × 100-as négyzet 5-tel zsugorítva 90 × 90 lesz; 60-nal zsugorítva nem marad semmi, és a panel ezt jelzi). A távolságot számmezőből véve minden elem saját távolságot kaphat; a **Minden puffer egyesítése egyetlen alakzattá** jelölőnégyzet bejelölésével az összes puffer egy alakzattá olvad össze.

A lekerekített részek egyenes szakaszokból állnak, amelyek a valódi görbén belül húzódnak, ezért a puffer valamivel kisebb a pontos körnél: normál beállításnál a területében körülbelül 0,6%, a Finom beállításnál 0,16%. Amit mérni fog, ahhoz használja a Finom beállítást.

## Átfedés

| Eszköz | Mit kap |
|---|---|
| Metszet | A bemeneti réteg és az átfedő poligonok találkozásánál keletkező részek, mindkét réteg mezőivel. A vonalak és pontok a poligonokhoz vágódnak. |
| Unió | Mindkét poligonréteg egymás széleinél vágva: a közös részek mindkét réteg mezőit hordozzák, a többi csak az egyik réteg mezőit (a másik réteg mezői üresek). |
| Törlés | A bemeneti poligonok, az átfedő poligonok kivonásával. A mezők a bemeneti rétegnél maradnak. A teljesen törölt elem kimarad (a panel megszámolja őket). |
| Összevonás | Összevonja az érintkező vagy átfedő poligonokat, vagy mindet egy alakzattá, vagy mezőértékenként egy-egy alakzattá. Hozzáadja a `COUNT` és `AREA` mezőket. |

Ha mindkét rétegben szerepel egy mezőnév, az első rétegnél marad meg, a második réteg mezője pedig `_2` utótaggal kerül ki. Egy rétegen belüli elemek ne fedjék egymást: ha mégis átfedik, az Unió mindkét oldalon megszámolja az átfedést.

## Összekapcsolás

A térbeli összekapcsolás egy **forrás** réteg attribútumait másolja minden olyan **cél** elemre, amely vele találkozik, és a cél alakzataival új réteget hoz létre. Válassza ki, mikor találkoznak: érintkezés vagy átfedés, a cél egy forráspoligonon belül van, a cél tartalmazza a forráselemet, a legközelebbi forráselem (opcionális korláttal), vagy bármely forráselem egy adott távolságon belül.

Ha több forráselem találkozik, az első attribútumait veszi át (a legközelebbit a legközelebbi- és távolság-összekapcsolásnál; ekkor a `DISTANCE` is hozzáadódik), vagy megszámolja őket, és összeadja a számmezőiket: `COUNT`, valamint minden számmezőhöz `SUM_`, `MEAN_`, `MIN_`, `MAX_`. Ha ki akarja hagyni azokat, amelyekhez nem talált párt, vegye ki a jelölést a **Találat nélküli cél elemek megtartása** jelölőnégyzetből. Az összekapcsolt mezők üresek, ahol nincs találat, a panel pedig megszámolja a találat nélkülieket.

## Kijelölés

Írjon kérdést az attribútumokra vagy az alakzatra, nyomja meg a **Kijelölés** gombot, és az elemek a darabszámukkal, egy táblázattal, valamint a teljes területtel, hosszal vagy darabszámmal együtt megjelennek a terven. Ezután saját réteggé alakíthatja őket, rájuk nagyíthat, vagy megszüntetheti a kijelölést.

| Írhatja | Példa |
|---|---|
| Mező neve; ha a névben szóköz van, használjon „idézőjeleket” vagy [szögletes zárójelet] | `VALUE`, `"Lot Number"` |
| Számok, „szöveg”, true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (a szöveg nem tesz különbséget kis- és nagybetű között; a `like`-ban a `%` tetszőleges karaktersorozatot, az `_` egy karaktert jelent) | `Notes contains 'corner'` |
| `is null`, `is not null` (az üres érték nullának számít) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` és zárójelek | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Alakzatértékek `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Hiányos kérdést, vagy olyan mezőt megnevező kérdést, amely a rétegben nincs, egy mondattal elutasít, amely megmondja, hol a hiba.

## Mérés

Megmutatja a réteg teljes területét és kerületét, hosszát vagy darabszámát, és **mezőket ad hozzá**: poligonoknál `AREA` és `PERIMETER`, vonalaknál `LENGTH` (a terv szerinti hossz), pontoknál `X` és `Y`. A már létező mezőt soha nem írja felül: az új neve `AREA_2` lesz. Ez egy visszavonási lépés. A **Statisztika** egy számmező darabszámát, összegét, átlagát, minimumát és maximumát adja meg, opcionálisan egy másik mező minden értékére külön.

:::note
Ezeknek az eszközöknek a mögöttes ellenőrzéseit kézzel végzik el a tesztben (`node bin/test-civilcraft-gisanalysis.mjs`): például a 100 × 100-as telkek a 100 × 80-as zóna alatt 3 000 + 3 000 területű metszetet adnak, a 10-zel pufferelt, 100 hosszú vonal pedig 2 000 + egy kör.
:::
