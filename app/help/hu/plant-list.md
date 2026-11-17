---
title: A növénylista
summary: Körülbelül 420 gyakori mérsékelt övi és mediterrán növény mérete, télállósága, fény- és vízigénye, bármilyen nyelven kereshető, valamint a projekttel együtt mentett saját lista.
keywords: növénylista, növényadatbázis, faj, latin név, köznév, növénypaletta, faiskolai lista, télállósági zóna, csv, növények importálása, növények exportálása, saját növények, fák listája, cserjék listája, plantas, növénykönyvtár
from: 7ed09e7e
---

A bal oldali panel **Növények** szakasza minden növényt felsorol, amelyet elhelyezhet. Kattintson egyre, hogy lássa a méreteit, és hogy az legyen az a növény, amelyet a **Növény**, az **Ágy** és a **Sövény** használ.

## Keresés és szűrés

Írjon a **Keresés** mezőbe: bármely szót a növény nevéből, bármilyen nyelven (angol, spanyol, portugál), a latin nevét, a típusát vagy a megjegyzéseiben szereplő szót. Az Ön által beírt minden szónak egyeznie kell, így a `quercus evergreen` a örökzöld tölgyeket találja meg. Az ékezetek nem számítanak.

A listát a **Típus**, a **Fényigény**, a **Vízigény** és a **Télállósági zóna** szerint szűkítheti (az a USDA-zóna, amelybe a telephely esik: a növény akkor szerepel a listában, ha a zóna a tartományán belül van).

## Mit tartalmaz egy növény

| Mező | Jelentés |
|---|---|
| Típus | Fa, cserje, sövény, fű (a gyep is), évelő, talajtakaró vagy kúszónövény |
| Érett állapotban | A növény magassága és terjedelme kertben vagy utcán nevelve, méterben |
| Ültetéskor | Az ültetési méret és a konténere |
| Távolság | Középponttól középpontig egy ágyban vagy sövény mentén |
| Télállósági zóna | Az USDA-zónák, amelyekben általában megél |
| Fényigény, vízigény, talaj | Mire van szüksége |
| Megjegyzések | Felhasználás és óvintézkedések, például mérgező részek vagy terjedő növény |

:::note
A beépített lista a CadCraft számára készült, általános kertészeti ismeretek alapján: tipikus, kerekített méretekkel. Nem valamely faiskola katalógusa. A méreteket és a télállóságot egyeztesse helyi faiskolával. Az Ibérián és a mérsékelt övi világ nagy részén legismertebb invazív növényeket szándékosan kihagytuk, néhány olyan növénynél, amely máshol invazív, megjegyzés szerepel.
:::

## Saját növények

- **Hozzáadás a projekt listájához** átmásolja a növényt a projekt saját listájába, ahol a projekttel együtt mentődik. A listában szereplő növény felülírja a beépítettet ugyanazzal a kulccsal, így a méreteit módosíthatja a régiójához.
- **Növénylista importálása…** egy CSV-t (vagy növényfájlt) olvas be. A CSV-ben kell lennie egy oszlopnak a latin névvel, és ha lehet, a típussal, magassággal és terjedelemmel; a saját szavaival írt oszlopnevek is működnek (például: Latin, Common name, Height, Spread, Width, Zone). Az elválasztó lehet vessző, pontosvessző vagy tabulátor, és a tizedesvessző is beolvasásra kerül. Az üresen maradt ültetési méretek, távolságok és konténerek a típus szerint ésszerű alapértelmezést kapnak.
- **CSV-ként exportálás** elmenti a listáját (vagy ha az üres, a keresés által megjelenített növényeket), hogy táblázatkezelőben meg lehessen nyitni.

A növénylista úgy olvasódik be, mint bármely külső fájl: amit nem tud felhasználni, kimarad, és meg lesz számolva.

## Növények más alkalmazásokban

A növénylista minden CadCraft-alkalmazás közös könyvtára: a BimCraft és a ModelCraft ugyanazt a listát hordozza, de saját **Elhelyezés könyvtárból** funkciójuk még nem kínál növényeket. Jelenleg a növények a CivilCraft tájépítészeti IFC-jén keresztül jutnak el egy BIM-modellbe (minden növény egy `IfcGeographicElement`). Lásd: [Ültetés](topic:planting#ifc).
