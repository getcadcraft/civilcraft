---
title: Szintvonalak, magasságok és lejtések olvasása
summary: Állítsa be a szintközt és a főszintvonalakat, jelenítse meg a magassági sávokat, lejtésnyilakat és háromszögeket, és olvassa le a mutató alatti terepmagasságokat.
keywords: szintvonalak, szintköz, főszintvonalak, szintvonalfeliratok, magassági sávok, lejtésnyilak, háromszögek, pontmagasság, felületelemzés, magasságelemzés, lejtéselemzés
from: 585e500a
---

A felület szintvonalakkal jelenik meg, amint létrejön. Ebben a témakörben minden beállítás a bal panel **Megjelenítés** részében található. A megjelenítési beállítások csak azt változtatják meg, amit lát (és amit exportál), nem minősülnek visszavonható lépésnek.

## A szintköz beállítása

1. A **Megjelenítés** alatt válasszon értéket a **Szintvonalak közönként** mezőben.
   - Láb mértékegységben: 0.25, 0.5, 1, 2, 5, 10 vagy 20 ft.
   - Méterben: 0.1, 0.25, 0.5, 1, 2, 5 vagy 10 m.
2. Válassza ki a **Főszintvonalak közönként** értéket: a 2., 4., 5. vagy 10. szintvonalat.
   A főszintvonalak vastagabban rajzolódnak, és a magasságuk feliratot kap. Ezek a főszintvonalak távolságának egész többszörösére esnek (1 ft-os szintvonalaknál és minden 5. főszintvonalnál: 245, 250, 255 …).
3. Kapcsolja ki a {{ui:Szintvonalfeliratok}} beállítást, ha a feliratok túl sűrűn helyezkednek el egy kis rajzon.

Az új projekt 1 egységgel indul, és minden 5. szintvonal főszintvonal. A szintvonalak a töréselemeknél kanyarodnak; ha egyenesen keresztezik a vízfolyásvonalat vagy a gerincet, az a vonal még nem töréselem (lásd: [A felület elkészítése és finomítása](topic:build-surface)).

:::note
Szintvonalak csak akkor rajzolódnak ki, ha a legalacsonyabb és a legmagasabb pont között legfeljebb 2000 szint van. Nagy domborzatú területen, nagyon kicsi szintközzel a terven egyáltalán nem jelennek meg szintvonalak: válasszon nagyobb szintközt.
:::

## A szintvonalak simítása

A szintvonalak egyenes szakaszokból állnak, a felület minden háromszögéhez egy-egy szakasz tartozik, ezért minden háromszög élénél kis szögtörést kapnak. A **Megjelenítés** alatti **Szintvonal-simítás** lekerekíti ezeket a sarkokat:

- **Nincs (egyenes szakaszok)**: a bejárt vonalak változatlanul. Ez látszik új vagy régebbi rajzokon.
- **Enyhe**: kissé lekerekített sarkok. A vonal soha nem mozdul el a következő szintvonal felé mutató távolság 10%-ánál többel, és soha nem kerül távolabb az egyenes szakaszától, mint annak hosszának egyhatoda.
- **Erős**: folyamatos ívelt vonal. A vonal soha nem mozdul el a következő szintvonal felé mutató távolság 25%-ánál többel, és soha nem kerül távolabb az egyenes szakaszától, mint annak hosszának egyharmada.

Mindkét választás mellett a simított szintvonal ugyanazon a ponton metszi a háromszögek éleit, mint a bejárt vonal, az adott szakasz háromszögén belül marad, így soha nem metszhet vagy érinthet másik szintvonalat. Ahol a szintvonal töréselemet vagy határt metsz, megtartja éles szögtörését. A simított vonalak kerülnek kirajzolásra és exportálásra (DXF, DWG, PDF, GIS és 3D), és több csúcspontjuk van, mint a bejárt vonalaknak.

A simítás csak a rajzolt vonalakat változtatja meg. A magasságok, térfogatok, hossz-szelvények és keresztszelvények továbbra is magából a felületből származnak. Az a szintvonal, amely pontosan átmegy felmérési pontokon (például a 250.00-s pont a 250-es szintvonalon), minden ilyen pontnál kis szögtörést tart meg.

## A szintvonalak mögötti felület elkészítése

A szintvonalak a felületet követik, a felület pedig a **Felület** alatti **Szintvonal-számítási módszer** beállítást. Az alapbeállítás, a **Háromszögelés lineáris interpolációval**, összeköti a pontokat háromszögekké, és minden pontot és töréselemet pontosan megtart. A többi módszer először szabályos rácsra illeszti a pontokat (kriging, minimális görbület, természetes szomszéd, inverz távolság és mások), ami gömbölyűbb szintvonalakat ad a pontok között, de nem halad át minden ponton pontosan. A **Felület** alatti felületjelentés megmondja, mennyire tér el az eredmény a pontoknál.

Az **ABOS (simításon alapuló közelítés)** az egyik rácsos módszer. Két saját beállítása van: a **Simaság** (kezdésként 0.5; minél kisebb, annál simább) és a **Pontosság** (kezdésként 1: a felület a pontoknál a telek magasságtartományának 1%-án belülre kerül; a szorosabb illeszkedéshez adjon meg kisebb számot). Ha a rácson nem éri el a pontosságot, a felületjelentés ezt jelzi: adjon meg kisebb **Rácstávolság** értéket.

## Magasság bárhol leolvasása

Mozgassa a mutatót a terv fölé. Az állapotsor megmutatja:

- az **E** és **N** értéket a mutató alatt,
- a **Terep** sort és a meglévő terep magasságát ott, a mutató alatti háromszögön interpolálva,
- a **Szintezett** sort és a tervezett magasságot, ahol egy tereplépcső vagy sáv megváltoztatta a terepet,
- a „A felületen kívül” üzenetet, ha a mutató a felületen kívül van.

A felmérési pont pontos leolvasásához válassza a {{ui:Kijelölés}} eszközt, és kattintson a pontra: a jobb panel megmutatja a számát, a keleti és északi koordinátáit, a magasságát, a leírását és a csoportját.

## Magassági sávok megjelenítése

1. Jelölje be a {{ui:Magassági sávok}} négyzetet.
   A felületet szín tölti ki az alacsony (kékeszöld) és a magas (okkersárga-barna) tartomány között. A jelölőnégyzetek alatti jelmagyarázat minden sáv magassági tartományát megadja.
2. Válassza ki a sávok számát a **Sávok** mezőben: 5, 8, 10 vagy 12. A sávok a legalacsonyabb és a legmagasabb magasság közötti tartományt egyenlő lépésekre osztják.

A sávok csak megtekintésre valók. Nem exportálódnak DXF-be, és nem rajzolódnak ki PDF-re.

## Lejtésnyilak megjelenítése

Jelölje be a {{ui:Lejtésnyilak}} négyzetet. Minden elég nagy háromszögön egy rövid nyíl mutat lefelé. A sík háromszögekre nem kerül nyíl. A nyilak gyors ellenőrzést adnak a vízelvezetés irányáról; maga a lejtésérték egyelőre nincs feliratozva.

## Háromszögek, pontok és élek megjelenítése

- A {{ui:Háromszögek}} rajzolja ki a TIN éleit. Kapcsolja be, hogy ellenőrizze, hogyan köti össze a felület a pontokat, különösen a töréselemek mentén és a szélen.
- A {{ui:Pontok}} minden felmérési pontot kirajzol; a {{ui:Pontfeliratok}} hozzáadja a számát, magasságát és leírását (vagy kevesebbet: lásd a **Pontfeliratok** beállítást a [CivilCraft beállításai](topic:settings) témakörben).
- A {{ui:Töréselek}} a töréselemeket (és a határt) narancssárgával rajzolja.
- A {{ui:Felület széle}} a felület körvonalát rajzolja ki.

## Meglévő vagy tervezett

Ha egy tereplépcső vagy sáv problémamentesen szintez, a **Megjelenítés** alatti **Felület** kínálja a {{ui:Tervezett (szintezett)}} lehetőséget. A szintvonalak, sávok és nyilak ekkor a szintezett felületet mutatják, így látja az új terepet és a körülötte lévő bevágás–feltöltés határvonalat. A meglévő felmérés újra megtekintéséhez válassza a {{ui:Meglévő terep}} lehetőséget.

## Mi kerül exportálásra

A DXF- és PDF-kimenet követi ezeket a beállításokat: ami ki van kapcsolva, nem íródik ki, a szintvonalak pedig a megjelenített felület szintvonalai. A magassági sávokat soha nem exportálják.
