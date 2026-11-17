---
title: A felület elkészítése és finomítása
summary: Hogyan háromszögeli a CivilCraft a meglévő terepet, és hogyan alakíthatja a töréselemcsoportokkal, a megrajzolt töréselekkel, a külső határvonallal és a legnagyobb külső éllel.
keywords: tin, felület, háromszögelés, töréselem, határvonal, meglévő terep, eg, felület létrehozása, delaunay, háromszögek, legnagyobb él, külső határvonal
from: b9eea3f3
---

A CivilCraftban projektenként egy meglévő terepfelület van. Ez a felmérési pontokból épített TIN (háromszögelt szabálytalan hálózat), és minden bemenet változásakor automatikusan újraépül. Nincs „újraépítés” parancs, és nincs elavult felület.

## Mi kerül a felületbe

- Minden magasságú pont, amely a {{ui:Pontok}} beállítású csoportban van.
- Minden olyan csoport, amely {{ui:Töréselő}} beállítású, pontszám szerinti sorrendben összekötve.
- Minden töréselő, amelyet a {{ui:Töréselő}} eszközzel rajzol.
- A külső határvonal, ha rajzol egyet.
- A **Legnagyobb külső él** beállítás.

A háromszögek soha nem metszik a töréselemet: a felületet kényszeríti, hogy kövesse, majd a lehető legegyenletesebbre készíti körülötte (mindenhol máshol Delaunay).

## Kódolt vonalak töréselemmé alakítása

1. A bal oldali panelen a **Pontok** alatt keresse meg a csoportot (például FL).
2. Állítsa a **Felület** beállítását {{ui:Töréselő}} értékre.
   A felület újraépül, a vonal narancssárgával rajzolódik ki (ha a **Megjelenítés** alatt be van kapcsolva a {{ui:Töréselek}}), és a felület adatainál a **Töréselek** eggyel nő.
3. Ellenőrizze a vonalat a terven. Pontról pontra kell futnia abban a sorrendben, ahogy a vonalat felvették. Ha cikk-cakkos, a csoport több vonalat tartalmaz, vagy a pontok nincsenek sorrendben számozva: állítsa vissza a csoportot {{ui:Pontok}} értékre, és rajzolja meg a vonalakat kézzel (a következő szakasz).

## Töréselem rajzolása pontokon át

1. Nyomja meg a {{key:B}} billentyűt, vagy kattintson a {{ui:Töréselő}} gombra a **Felület** csoportban.
   A súgó ezt írja ki: „Töréselő: kattintson a felmérési pontokra sorrendben (átveszi a magasságukat). Az Enter befejezi.”
2. Mozgassa a mutatót egy pont közelébe. Egy kis narancssárga négyzet jelöli azt a pontot, amelyet felvesz.
3. Kattintson a vonal pontjaira egymás után. Minden kattintásnál az állapotsor megnevezi a pontot és a magasságát.
4. Az {{key:Enter}} billentyűvel fejezze be.
   Az állapotsor ezt írja: „1. töréselem hozzáadva; a felület újraépült.”

A kattintásnak felmérési pontra kell esnie, amelynek van magassága; máshova kattintva a rendszer elutasítja: „Kattintson egy magassággal rendelkező felmérési pontra: a töréselem a pontok magasságát veszi át.” A {{key:Backspace}} az utolsó pontot törli; az {{key:Esc}} az egész vonalat megszakítja.

:::warning
Az {{key:Enter}} billentyűvel fejezze be. A dupla kattintás is befejez, de ebben a verzióban a dupla kattintással megjelölt pontot eldobja. Kattintson egyszer az utolsó pontra, majd nyomja meg az {{key:Enter}} billentyűt.
:::

Minden megrajzolt töréselem egyszerre törléséhez kattintson a {{ui:Rajzolt töréselek eltávolítása}} gombra a **Felület** szakaszban. Csak az utolsó törléséhez használja a {{key:Mod+Z}} billentyűkombinációt. A megrajzolt töréseleket egyenként még nem lehet kijelölni vagy szerkeszteni.

## A külső határvonal megrajzolása

A határvonal a felületet arra a területre vágja vissza, amelyben megbízik, például a felmérés határaira, így az ismeretlen sarkok felett átívelő hosszú háromszögek eltűnnek.

1. Nyomja meg az {{key:O}} billentyűt, vagy kattintson a {{ui:Határvonal}} gombra.
2. Kattintson a terület sarkaira sorrendben, körbe. Egy szaggatott vonal mutatja az alakzatot.
3. Nyomja meg az {{key:Enter}} billentyűt.
   Az állapotsor ezt írja: „Határvonal beállítva; a határán kívüli háromszögek eltűntek.” A felület adatainál a **Határvonal** értéke „Igen”, és megjelenik a sarkok száma.

Tudnivalók:

- Egy határvonal lehet. Ha újat rajzol, az a régit váltja fel. A {{ui:A határvonal eltávolítása}} gombbal elveheti.
- Csak csökkenthet: a pontokon túlnyúló határvonalat a pontok körvonalára vágja vissza, ezzel az üzenettel: „A határvonal túlnyúlik a pontokon; a pontok körvonalára lett visszavágva.”
- A sarkok magasságukat a felületből veszik, így a határ pontosan a terepet követi.
- A belső (elrejtett) határvonalak még nem érhetők el.

## Hosszú külső háromszögek levágása

Határvonal nélkül a felület a pontok teljes körvonalát kitölti, beleértve a homorú éleken átívelő hosszú, vékony háromszögeket is.

1. A **Felület** alatt írjon be egy hosszt a **Legnagyobb külső él** mezőbe, és nyomja meg az {{key:Enter}} billentyűt. Kezdje nagyjából a tipikus pontköz kétszeresével vagy háromszorosával.
2. A külső élénél hosszabb külső háromszögek eltűnnek, befelé haladva, amíg minden külső él elég rövid nem lesz. A töréselemként használt élt soha nem távolítja el.
3. A 0 beírásával minden háromszög újra megmarad.

## A felületi jelentés olvasása

A felület adatai alatt egy doboz sorolja fel, mit csinált az építő. A bal oldalán okker sávval az információ; piros sávval hibát tartalmaz, és nincs felület.

| Üzenet | Jelentés |
|---|---|
| „3 pont ugyanazon a helyen volt, mint egy másik, és csatlakozott hozzá.” | A síkban 0,0001-nél közelebbi pontok egy csúcsot alkotnak (az első megmarad). |
| „2 helyen két különböző magasság van …” | Egymásra eső pontok, vagy metsződő töréselemek magassága eltér. A töréselem magassága érvényesül, különben az első. |
| „1 töréselem-darabot nem lehetett kényszeríteni a felületbe.” | Egy nagyon rövid vagy szinte átfedő töréselem-darab nem fért el; ellenőrizze azt a helyet. |
| „A felülethez legalább három magassággal rendelkező pont kell.” | Túl kevés pont: ellenőrizze az oszlopok sorrendjét és a csoportokat. |
| „A pontok mind egy egyenesen vannak: nincs háromszög.” | A pontoknak nincs szélességük, például egyetlen poligonvonal. |
| „A határvonal nem fedi át a pontokat.” | A határvonal máshol van, gyakran mértékegység- vagy koordinátakeveredés miatt. |
| „A határvonalon belül nem maradt háromszög.” | A határvonal túl kicsi vagy rossz helyre került. |

## LandXML-ből olvasott felület

LandXML megnyitásakor a fájl első TIN-felülete változatlanul használódik: a **Felület** címsor „Felület (LandXML-ből)” szöveget mutat, a **Legnagyobb külső él** pedig szürke. Amíg ez a felület van használatban, a töréselemcsoportok, a megrajzolt töréselemek és az új határvonal nem változtatják meg. Ha a fájl pontjaiból akar felületet építeni, kattintson a {{ui:A felület újraépítése a pontokból}} gombra. A {{key:Mod+Z}} visszahozza a LandXML-felületet.

## Kapcsolódó

- [Szintvonalak, magasságok és lejtések olvasása](topic:contours).
- [Felmérési pontok importálása](topic:import-points).
