---
title: Tervezett hossz-szelvény készítése
summary: Nyissa meg a hossz-szelvény-nézetet, kezdjen tervezett hossz-szelvényt a terepről, adjon hozzá és húzzon PVI-ket, állítson be magassági ív-hosszakat, és olvassa le a lejtéseket, K-értékeket, valamint a legmagasabb és legalacsonyabb pontokat.
keywords: hossz-szelvény, magassági nyomvonal, PVI, magassági ív, lejtés, K-érték, gerinc, völgy, BVC, EVC, hossz-szelvény-nézet, tervezett szint, FG, meglévő terep hossz-szelvénye, jellemzővonalak a hossz-szelvényben, keresztezések, vetítve, szegély, árok, feliratok
from: dbb1f32d
---

Minden nyomvonalnak egy tervezett hossz-szelvénye van: PVI-k (szelvényszám és magasság) listája, amelyeket egyenes lejtők kötnek össze, és minden olyan belső PVI-nél, amelynek van hossza, szimmetrikus parabolikus magassági ív van. A meglévő terep hossz-szelvényét a program a felületből veszi mintának.

## A hossz-szelvény-nézet megnyitása

1. Jelölje ki a nyomvonalat ({{ui:Kijelölés}} eszközzel kattintva).
2. Nyomja meg az {{key:R}} billentyűt, vagy kattintson a {{ui:Hossz-szelvény}} gombra az eszköztáron, vagy a jobb oldali panel alján lévő {{ui:Hossz-szelvény nézet}} gombra.
   A hossz-szelvény-nézet az alaprajz alatt nyílik meg, a meglévő terep a nyomvonal mentén. Két vagy több nyomvonal esetén a hossz-szelvénysáv bal oldali listájából válasszon egyet.

A nézet eleinte a teljes nyomvonalat mutatja, és a magasságokat kinyújtja, hogy kitöltsék a panelt; a függőleges nagyítás a bal alsó sarokban látható, például „Függőleges nagyítás 10×”.

## A hossz-szelvény nagyítása és mozgatása

- **Nagyítás:** forgassa az egérgörgőt (vagy csippentsen a touchpaden), és a nézet a mutató körül nagyít. A {{key:Shift}} tartásával csak a szelvényszámokat, a {{key:Alt}} tartásával csak a magasságokat nagyíthatja (ez a nagyítást is megváltoztatja). Ha a hossz-szelvény-nézet van fókuszban, a plusz- és mínuszbillentyűk a közepe körül nagyítanak.
- **Mozgatás:** húzzon a jobb vagy a középső egérgombbal, vagy húzzon két ujjal a touchpaden.
- **Illesztés:** kattintson duplán a hossz-szelvényre, vagy nyomja meg az {{key:F}} billentyűt, hogy újra a teljes nyomvonal látsszon.

A PVI szerkesztése megtartja az Ön által választott nagyítást; nem ugrik vissza az illesztett nézetre.

Mozgassa a mutatót a hossz-szelvény mentén: a sáv megmutatja a szelvényszámot, a terep- és tervezett magasságot, a lejtést, valamint az ott lévő bevágást vagy töltést, és egy pont követi a nyomvonalat az alaprajzon.

## A tervezett hossz-szelvény kezdése

1. A jobb oldali panelen, a **Tervezett hossz-szelvény** alatt kattintson a {{ui:Kezdés a terepről}} gombra.
   Két PVI kerül a terepre a nyomvonal két végén, amelyeket egy egyenes lejtő köt össze. Az állapotsor ezt írja: „A tervezett hossz-szelvény mindkét végén a terepről indult. Kapcsolja be a PVI-k hozzáadását, és kattintson a lejtés-törések hozzáadásához; a táblázatban adjon nekik ívhosszt.”

Ha a nyomvonal nem metszi a felületet, ezt kapja: „Ennek a nyomvonalnak nincs alatta terep, ahonnan indulhatna.” Ekkor a PVI-kat kattintással adja hozzá (a következő szakasz).

## PVI-k hozzáadása

1. Nyomja meg az {{key:I}} billentyűt, vagy kattintson a {{ui:PVI-k hozzáadása}} gombra a hossz-szelvénysávban. Az bennmarad lenyomva.
2. Kattintson a hossz-szelvényre ott, ahol lejtés-törést szeretne. Egy PVI kerül a szelvényszámra és magasságra, 0,01-re kerekítve, és kijelölődik.
3. Adjon hozzá annyit, amennyit szükséges, majd nyomja meg újra az {{key:I}} billentyűt a hozzáadás befejezéséhez.

Ha ott már van PVI, a kattintás nem fogadódik el („Már van PVI itt: …”). A PVI-k mindig szelvényszám szerinti sorrendben maradnak.

## Fogás hozzáadáskor vagy húzáskor

A hossz-szelvénysáv **Fogás** gombja kezdetben be van kapcsolva. Amíg be van kapcsolva, a hozzáadott vagy húzott PVI a legközelebbi PVI-re, terepponttára, PVI szelvényszámra vagy a terepvonalra kerül, és a jelölő melletti felirat megmondja, melyikre. A {{key:Alt}} tartásával bárhol szabad pontot kap.

## PVI-k módosítása

- **Húzzon** egy PVI-t a hossz-szelvényen a mozgatáshoz. Nem haladhatja meg a szomszédait. A mozgatás egy visszavonható lépés.
- **Írja be** a pontos értékeket a jobb oldali panel PVI-táblázatába: **Szelvényszám**, **Magasság**, **Lejtés %** és **Ívhossz L** (magassági ív hossza). Minden érték után nyomja meg az {{key:Enter}} billentyűt.
- **Válasszon** értéket a hossz-szelvényről: a PVI szelvényszáma vagy magassága melletti kis gomb egy kattintásra vár a hossz-szelvény-nézetben, és beírja az értéket. A kattintás úgy fog, mint a PVI-k hozzáadásakor; a {{key:Alt}} tartásával szabad pontot kap; az {{key:Esc}} megszakít.
- A **Lejtés %** annak az érintőnek a lejtése, amely ettől a PVI-től indul és a következőig tart. Ennek beírása a **következő** PVI magasságát mozgatja (szelvényszáma soha nem mozdul). Ha a következő PVI zárolva van, helyette az előző PVI magassága mozdul.
- **Zárolja** a PVI-t a sora végén lévő lakatral. A zárolt PVI nem húzható, és a lejtés-szerkesztés sem mozdítja el. Ha egy érintő mindkét vége zárolva van, a lejtése nem változtatható: az állapotsor ezt jelzi, és előbb az egyik végét kell feloldani. A zárolás a fájlban mentődik.
- **Távolítsa el** a PVI-t a sora végén lévő x-szel, vagy jelölje ki (kattintson rá), és nyomja meg a {{key:Delete}} billentyűt. Ha a hossz-szelvény-nézet van fókuszban, a {{key:Backspace}} is eltávolítja.

Az első és az utolsó PVI soha nem kap ívet.

## Magassági ívek

1. Adjon meg hosszt az **Ívhossz L** mezőben egy belső PVI-nél, például 200.
2. Az ív a PVI-re középre rajzolódik. A hossz-szelvény és a jobb oldali panel megmutatja a típusát (gerinc vagy völgy), az L és K értékét, a BVC és EVC szelvényszámait és magasságait, valamint a legmagasabb vagy legalacsonyabb pontját, ha az ív belsejében van ilyen.

A K-t az L-ből számítjuk ki (K = L osztva a lejtések algebrai különbségével, százalékban). Ön az L-t írja be; a K közvetlen beírása még nem érhető el.

Ha egy magassági ív nem fér el, piros keret mondja meg az okát: visszanyúlik az előtte lévő PVI-be vagy ívbe, vagy túlnyúlik a következő PVI-n, és megmondja, mennyi hely van azon az oldalon (az ívnek a PVI mindkét oldalán a hosszának felére van szüksége). Gombja egy lépésben beállítja **a leghosszabb ívet, amely elfér**, a K-jával együtt ({{key:Mod+Z}} visszavonja). Vagy távolítsa egymástól a PVI-ket.

## Az adatok olvasása

A PVI-táblázat alatti listában minden lejtés százalékban szerepel („1. lejtés: +1.25%”), és minden ív, például „Gerinc a 2+00.00-nál: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)”, majd „Legmagasabb pont 1+62.40, 254.12”.

Ha a PVI-k nem érik el a nyomvonal mindkét végét, egy megjegyzés ezt jelzi. Sáv csak ott épül, ahol a hossz-szelvény és a nyomvonal átfedi egymást.

## Jellemzővonalak a hossz-szelvényen

A jellemzővonalak a hossz-szelvény-nézetben is megjelennek, így az úthoz tartozó hossz-szelvénnyel szemben láthatja a szegélyt, az árkot vagy a fal tetejét.

- Ahol egy jellemzővonal **keresztezi** a nyomvonalat, a hossz-szelvény kis rombuszt mutat ennél a szelvényszámnál és magasságnál, a vonal nevével és az ottani magasságával feliratozva (a vonal saját magassága, a keresztező szakasz mentén számítva).
- Adjon meg egy távolságot a {{ui:Mellette ezen belül}} mezőben, hogy a nyomvonal mellett **futó** jellemzővonalakat is megrajzolja ezen a távolságon belül, szaggatott vonallal, a saját magasságukon. Üresen vagy 0 esetén csak a keresztezések látszanak.
- A jelölések és feliratok minden módosítást követnek: mozgassa a csúcsot, írjon be lejtést vagy emelje meg a vonalat, és a hossz-szelvény azonnal az új magasságokat mutatja.
- Kattintson egy keresztezés rombuszára a jellemzővonal kijelöléséhez; a kijelölt vonal a kiemelő színnel rajzolódik.
- A hossz-szelvénysáv {{ui:Jellemzővonalak}} gombja mindet elrejti vagy megjeleníti. Mindkét beállítás a projekttel mentődik.

Lásd: [Jellemzővonalak](topic:feature-lines).

## Tovább

- [Útsáv végigvezetése](topic:corridor) a nyomvonal és ez a hossz-szelvény mentén.
- A hossz-szelvény a nyomvonallal együtt kerül a LandXML-be; lásd: [LandXML-csere](topic:landxml).
