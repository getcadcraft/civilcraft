---
title: DWG vagy DXF megnyitása vonalrajzként
summary: Egy rajz vonalrajzának megnyitása az alaprajzon, rétegenként; a szintvonalait, 3D-s polivonalait és zárt körvonalait a felülethez használhatja, a pontblokkjait pedig felmérési pontokká alakíthatja.
keywords: felmérési ellenőrzés, szöveges magasságok, dwg, dxf, cad, rajz, vonalrajz, szintvonalak, töréselek, határvonal, polivonal, 3D polivonal, rétegek, alaptérkép, topo, felmérési rajz, blokkok, blokkhivatkozások, felmérési pontok blokkokból, attribútumok, pontblokkok, beillesztési pont
from: da0f4c58
---

Egy topográfiai felmérés gyakran rajz formájában érkezik: a szintvonalak magasságukon polivonalként, a töréselek 3D-s polivonalként, a telek körvonala zárt polivonalként. A CivilCraft a rajz **modelltérét** rétegekként nyitja meg az alaprajzon, és ezeket a vonalakat közvetlenül felületté alakíthatja.

## A rajz megnyitása

1. Kattintson a **Felület** csoport {{ui:Linework}} gombjára (vagy az {{ui:Open}} gombra, vagy húzza a fájlt az alaprajzra), és válasszon egy `.dwg` vagy `.dxf` fájlt. A rajz ezen a számítógépen olvasódik be; semmi sem töltődik fel. A 2000-es és 2018-as közötti DWG, valamint az ASCII DXF olvasható.
2. A **Vonalrajz** párbeszédpanel felsorolja a rajz azon rétegeit, amelyek vonalakat, zárt alakzatokat vagy pontokat tartalmaznak, és azt, van-e **magasságuk**. A rajzban kikapcsolt rétegek kijelöletlenül indulnak. A szöveg, a sraffozás, a méretek és egyéb nem vonalrajz objektumok számolódnak, és kimaradnak (a párbeszédpanel megmondja, melyek).
3. Ellenőrizze a **Rajz mértékegységei** beállítást. Ha a rajz megadja a mértékegységeit, a CivilCraft átváltja a projekt mértékegységeire (milliméterből méterbe, méterből lábba, hüvelykből lábba). A lábban készült rajz amerikai felmérési lábként olvasódik, átskálázás nélkül: a kettő 2 milliomod résszel tér el, és a state plane koordináták ilyen skálázása lábnyit mozdítana el. Ha a rajz nem mondja meg a mértékegységeit, a számai a projekt mértékegységeiben olvasódnak; ha ez nem stimmel, a listában válassza ki a helyes mértékegységet.
4. A **Felhasználás a felülethez** alatt válassza ki, mit adjon a felületnek az egyes rétegek (vagy hagyja a **Csak megjelenítés** lehetőséget). A szintvonalakra utaló nevű rétegek (TOPO, CONT, CNTR), amelyeknek vannak magasságaik, töréselekként indulnak.
5. Kattintson a {{ui:Add}} gombra. A rétegek a **GIS-rétegek** alatt jelennek meg a bal panelen; minden használat bekerül a felületbe. Minden rész külön lépés: a {{key:Mod+Z}} egyenként visszavonja őket.

## Mit adhat egy réteg

| A réteg tartalma | Felhasználás a felülethez |
|---|---|
| Szintvonalak (magasságon lévő polivonalak) | Töréselek a vonalak saját magasságán, vagy az ELEV mezőnél |
| 3D-s polivonalak | Töréselek a saját magasságukon |
| Zárt körvonal | A felület határvonala (a legnagyobb zárt alakzat, vagy a kijelölt) |
| Magassággal rendelkező pontok | Felmérési pontok, a réteg nevével leírva |
| Nulla magasságú vonalak (alaprajzi vonalrajz) | Semmi: az alaprajzon marad alaprajzként |

A CivilCraft által írt rajz jellemzővonalait 3D-s polivonalakként tartalmazza, amelyek megjegyzik az íveiket. A párbeszédpanel ekkor a **Jellemzővonalak** részt mutatja: hagyja bejelölve, hogy íveikkel és használatukkal jellemzővonalként kerüljenek vissza (egy visszavonási lépés), vagy vegye ki a jelölést, és vonalrajzként olvassa be őket, mint bármely más réteget.

Később a **GIS-rétegek** alatti réteg menüjében a {{ui:Use for the surface}} paranccsal ugyanezt megteheti egy olyan réteggel, amelyet csak megjelenítettek.

## Felmérési pontok blokkokból

A felmérési rajzok gyakran pontjaikat blokkokként hordozzák: egy kis jel minden mérési pontnál, attribútumokkal a pontszámhoz, a leíráshoz és a magassághoz. Ha a rajzon vannak blokkhivatkozások, a párbeszédpanelen megjelenik a **Felmérési pontok blokkokból** rész:

1. Jelölje be azokat a blokkokat, amelyeket át szeretne venni (a táblázat megmondja, hány hivatkozása van mindegyiknek, melyik rétegeken, és milyen attribútumokkal), vagy jelöljön be rétegeket, hogy átvegye az ott lévő összes blokkhivatkozást.
2. Válassza ki, honnan jöjjenek az egyes pontok **száma**, **leírása** és **magassága**: egy attribútumból, a blokk vagy a réteg nevéből, a következő szabad számokból, vagy a beillesztési pont Z-koordinátájából. A CivilCraft a valószínű attribútumokon indul (PT, DESC, ELEV és hasonlók), és a magasságot csak akkor veszi egy attribútumból, ha a blokkok nulla magasságon ülnek.
3. Ha csak a pontokat akarja, vegye ki a vonalréteg-jelölést, majd kattintson a {{ui:Add}} gombra.

Minden hivatkozás egy felmérési pontot ad, a beillesztési pontjában. Csak a modelltérben elhelyezett hivatkozások számítanak; más blokkokon belül lévő blokkok nem. A projektben már szereplő számok, vagy a rajzon kétszer előforduló számok a legnagyobb után új számot kapnak, és a nem számot tartalmazó magasság-attribútum az adott pontot magasság nélkül hagyja; az állapotsor mindkettőt megszámolja. A rajzot soha nem módosítja, és minden pont megjegyzi a blokkját: a Tulajdonságaiban a **Blokkból** mező látszik a blokkal, a réteggel és a fogóval. A pontok hozzáadása egy lépés, így a {{key:Mod+Z}} mindet egyszerre visszavonja.

## Szövegként írt magasságok és ellenőrzés

A szövegként írt pontmagasságok (vagy egy nem felmérési pont blokk attribútumában lévő magasságok) nem vonalrajzok. A **Felmérési magasságok és ellenőrzés** rész felmérési pontként veheti át őket, és felsorolja, mi tűnik hibásnak a rajzon: mértékegységek, koordináta-rendszer, távolság a nullától, lapos szintvonalak, furcsa magasságok, dupla pontok. Lásd: [Felmérési rajz ellenőrzése importáláskor](topic:survey-check).

## Hogyan olvasódik be a rajz

- Az ívek, körök, ellipszisek, a polivonal domborodó szakaszai és a spline-ok legfeljebb 5°-onként törtvonalakká válnak.
- A blokkhivatkozások oda kerülnek, ahová elhelyezték, a beágyazott blokkok is; ami a 0-s rétegen van egy blokkban, a hivatkozás rétegét veszi fel.
- Más síkban (eltérő kiterjesztési irányú) rajzolt objektumok világkoordinátákba kerülnek.
- Minden objektum három mezőt kap: LAYER, TYPE (az objektum típusa) és ELEV (a magassága, ha minden pontja egy magasságon van).
- A koordináták változatlanul kerülnek át: a rajznak ugyanazokat a koordinátákat kell használnia, mint a projekt (például ugyanazt a state plane zónát). A külső hivatkozásokat (xref-eket) nem nyitja meg a program: ezeket külön nyissa meg.

:::tip
Egy szintvonalas rajz akkor adja a legjobb felületet, ha néhány pontmagasság is van a dombtetőkön és a mélyedésekben, ahol a szintvonalak egyedül sík háromszögeket hagynának. Adja őket felmérési pontként, vagy egy rajzon lévő pontréteg segítségével.
:::
