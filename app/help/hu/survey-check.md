---
title: Felmérési rajz ellenőrzése importáláskor
summary: Olvassa a szintek szövegként vagy blokkattribútumokban írt értékeit felmérési pontként, és ellenőrizze a DWG- vagy DXF-fájlt hibás mértékegységek, hiányzó koordináta-rendszer, távoli origó, lapos szintvonalak, furcsa szintek és dupla pontok szempontjából, mielőtt terepet építene belőle.
keywords: felmérési ellenőrzés, importellenőrzés, felmérési szintek, magassági pontok, szöveges szintek, szintek szövegként, attribútumok, mértékegységek, koordináta-rendszer, távol az origótól, szintvonalak nullán, kiugró értékek, duplikált pontok, problémák, tájépítész, felmérési rajz
from: d46acd24
---

Egy felmérési rajz jónak tűnhet, és mégis hibás lehet egy terephez: mértékegységei lehetnek találgatásból adódók, szintvonalai 0 magasságon laposan állhatnak, vagy szintjei szövegként vannak írva, ami egyáltalán nem geometria. A {{ui:Vonalrajz}} párbeszédpanel Felmérési szintek és ellenőrzés része (lásd [DWG vagy DXF megnyitása vonalrajzként](topic:open-dwg-dxf)) beolvassa ezeket a szinteket, és megmondja, mi tűnik hibásnak, mielőtt bármi hozzáadódik.

## Szövegként vagy attribútumokban írt szintek

Sok felmérési rajz a magassági pontot egy kis szöveggel adja meg a kereszt mellett, például `104.37` vagy `EL 104.37` formában, vagy pontblokk attribútumaként. Ezek nem vonalak, ezért a vonalbeolvasó kihagyja őket. A rész megmondja, hány darabot talált, és lehetővé teszi, hogy **felmérési pontként** vegye át őket:

1. Jelölje be a **Vegye át a … szintet felmérési pontként** négyzetet. Alapesetben üresen indulnak, mert nem minden szám a rajzon magasság.
2. A szöveg akkor olvasódik szintként, ha önmagában szint: tizedesrésszel rendelkező szám (`104.37`, `+104,37`, `-3.50`), vagy szám az `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` vagy `LEVEL` után, utána opcionálisan `m`, `ft` vagy `'`. Az egész szám önmagában (`12`) telek- vagy lapszámként olvasódik, nem szintként; az olyan szöveg, mint a `GATE 3` vagy egy dátum, soha nem olvasódik be. A szövegformázó kódok figyelmen kívül maradnak.
3. Blokkattribútumok esetén válassza ki a **Szintet tartalmazó blokkattribútum** mezőt. A CivilCraft magától megtalálja az ELEV, Z, LEVEL, RL vagy hasonló nevű címkét; ha a rajz saját nevet használ, válasszon egyet a listából. A választás emlékeződik az adott fájlnévhez ezen a számítógépen, így a fájl újranyitásakor ugyanazzal a címkével indul. Az Ön által választott címke az egész számokat is szintként veszi át.
4. Kattintson az {{ui:Hozzáadás}} gombra. A pontok a projektben lévő legmagasabb szám után kapnak számot, minden pont leírást kap a rétegével (vagy a blokkjával), a magasságok pedig a projekt mértékegységére váltódnak, mint a rajz többi része. Mindez egy lépés: a {{key:Mod+Z}} eltávolítja a pontokat.

A szöveg a saját beszúrási pontján ül (vagy az igazítási pontján, ha van). A blokkokon belüli szöveg nem olvasódik be, és a rajz soha nem változik meg.

## Az ellenőrzés

Az ellenőrzés azon fut, amit éppen be készül hozni, és minden talált problémát sorol: problématípusonként egy sorban.

| Az üzenet | Jelentése |
|---|---|
| **Mértékegység nincs megadva** | A rajz nem mondja meg a mértékegységét, ezért számait a projekt mértékegységének veszi. Ellenőrizzen egy ismert távolságot. |
| **Mértékegység átváltva** | A rajz és a projekt mértékegysége eltér, ezért skálázva lesz (megjegyzés, nem hiba). |
| **Az adatok … km-t** vagy **… m-t** terjednek | A kiterjedés nagyobb 200 km-nél vagy kisebb fél méternél, ami általában rossz mértékegységre utal (milliméterek méterként olvasva, vagy fordítva). |
| **Nincs koordináta-rendszer** | A projektnek nincs. Figyelmeztetés, ha az adatok messze vannak a nullától, mint az állami síkkoordináták vagy az országos rácsok. Lásd [Koordináta-rendszerek](topic:coordinate-systems). |
| **Távol az origótól** | Az adatok 100 km-nél messzebb vannak a nullától. Nullától távol a 3D nézetek és az exportok pontosságot veszítenek, és remegnek. |
| **A(z) … szintvonal-réteg nem rendelkezik magassággal** | A szintvonalakra utaló nevű réteg (TOPO, CONT, CNTR, CONTOUR) 0 magasságú vonalakat tartalmaz, így az ebből épített terep lapos lenne. |
| **Szintek pontosan 0** | Néhány szint 0, miközben a tipikus szint messze van tőle: valószínűleg hiányzó magasságok. |
| **A többitől távoli szintek** | Néhány szint messze esik a többitől (az összes szint középértékéhez mérve, így a széles tartományú meredek terület nem kerül megjelölésre), vagy 9 000 m fölött, illetve -11 000 m alatt van. |
| **Pontok egy másik pont tetején** | Két pont ugyanazon a helyen, azonos vagy eltérő szinttel. |

Miután az {{ui:Hozzáadás}} gombra kattint, ugyanezek a sorok a **Problémák** alá kerülnek, problématípusonként egy, a fájlnévvel, hogy később visszatérhessen hozzájuk. Az ellenőrzés a rajzot minősíti, nem változtat rajta, és nem akadályozza meg a használatát.

:::tip
Ha az ellenőrzés azt mondja, hogy a szintvonalak 0-n laposak, és vannak szöveggel írt szintek, vegye át a szinteket felmérési pontként: gyakran a valódi magasságokat tartalmazzák, amelyek a szintvonalakból hiányoznak.
:::

## Mi nincs ellenőrizve

Az ellenőrzés nem hasonlítja össze a rajzot egy másik felméréssel, és nem tudja megmondani, melyik koordináta-rendszerben van a rajz: csak azt jelzi, hogy nincs beállítva semmi.
