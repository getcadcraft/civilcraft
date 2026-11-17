---
title: Vízszintes nyomvonal kialakítása
summary: Nyomvonal rajzolása a metszéspontjai (PI) alapján, az ívsugarak és a kezdő szelvényszám beállítása, a PI-k mozgatása, valamint az ívadatok, a szelvényszám és az eltolás leolvasása.
keywords: nyomvonal, nincs megoldás, az ív nem fér el, legnagyobb sugár, legkisebb sugár, minimális sugár, tervezési sebesség, átfedés, tengelyvonal, pi, vízszintes ív, sugár, szelvényezés, érintő, nyomvonal létrehozása, nyomvonal-elrendezés, pc, pt, szelvényszám, eltolás
from: 8c5df4aa
---

A CivilCraftban a nyomvonal metszéspontok (PI) sorozatából álló érintőlánc, amelynek minden belső, sugárral rendelkező PI-jénél körív van. A szelvényezést a megadott kezdő szelvényről számoljuk. Egy projekt több nyomvonalat is tartalmazhat.

## A nyomvonal rajzolása

1. Nyomja meg az {{key:A}} billentyűt, vagy kattintson a {{ui:Nyomvonal}} gombra a **Tervezés** csoportban.
   A súgó ezt írja ki: „Nyomvonal: kattintson a PI-kre sorrendben. Az Enter vagy a dupla kattintás befejezi, a Backspace eltávolítja az utolsót, az Esc megszakítja.”
2. Kattintson az első PI-re (a nyomvonal kezdetére).
3. Kattintson minden következő PI-re sorrendben. Egy piros vonal követi a mutatót, és megmutatja a rajzolt érintő hosszát és irányszögét, például „212.40 ft  N 63°12'05" E”.
4. Kattintson az utolsó PI-re (a nyomvonal végére).
5. Nyomja meg az {{key:Enter}} billentyűt.
   A nyomvonal szelvényezéssel együtt megrajzolódik, és ki van jelölve. Az állapotsorban például ez olvasható: „Nyomvonal 1: 386.36 ft, ahol elférnek, 100 ft sugarú ívek. Sugarak szerkesztése a Tulajdonságok panelen; Hossz-szelvény (R) a lejtés megtervezéséhez.”

Rajzolás közben: a {{key:Backspace}} az utolsó PI-t törli, az {{key:Esc}} megszakítja, az üres területen húzva pedig csak eltolja a nézetet, PI-t nem ad hozzá.

:::warning
Az {{key:Enter}} billentyűvel fejezze be. A dupla kattintás is befejez, de ebben a verzióban a dupla kattintással megjelölt PI-t eldobja. Kattintson egyszer az utolsó PI-re, majd nyomja meg az {{key:Enter}} billentyűt.
:::

Minden belső PI 100 ft-es (30 m-es méterprojektben) ívet kap, vagy – ha a 100 ft nem fér el – azt a legnagyobb egész sugarat, amely mindkét érintő felének a felében elfér. A nagyon éles vagy egyenes átmenetű PI-k nem kapnak ívet.

## Sugarak és koordináták beállítása

A kijelölt nyomvonal mellett a jobb oldali panelen a **Nyomvonal** látszik:

1. **Név** és **Kezdő szelvény**. Szelvényt `10+00` alakban írhat be (láb), vagy `0+500` alakban (méter), illetve egyszerű számként. Lásd: [Mértékegységek, szelvények és számformátumok](topic:units-and-stations).
2. A **Hossz** és a **Záró szelvény** automatikusan számítódik.
3. A **PI-k** táblázat minden PI **Keleti** és **Északi** koordinátáját, valamint minden belső PI **Sugár** értékét tartalmazza. Írjon be új értéket, és nyomja meg az {{key:Enter}} billentyűt.
   - A 0 sugár ívet nem hozó töréspontot jelent.
   - Az első és az utolsó PI-nek soha nincs sugara.
   - A sor végén lévő kis x eltávolítja az adott PI-t (egy nyomvonalnak legalább két PI-je marad).
4. Olvassa le az **Ívek** listát: minden íven a PC és PT szelvény, az R sugár, a Δ törésszög és az irány (bal vagy jobb), az L hossz, a T érintőhossz, az E külső távolság és a húr.
5. Az ívek alatti sor adja meg az első érintő irányszögét.

## Ha egy ív nem fér el

Ha az ívekhez több érintőhossz kell, mint amennyi a PI-k között van, a nyomvonalnak nincs megoldása: addig nem rajzolódik helyesen, amíg ki nem javítják, és kimarad a LandXML-exportból. Egy piros doboz megmondja a számokkal, miért, és felajánlja, mi férne el:

- „A 2. és a 3. PI ívei 240.00 ft érintőt igényelnek egymás között (130.00 + 110.00), de a PI-k 180.00 ft-re vannak egymástól.” – vagy ha csak az egyik PI-nél van ív: „A 2. PI íve 240.00 ft érintőt igényel az 1. PI felé …”.
- Minden PI-hez tartozik egy gomb, amely **a legnagyobb elférő sugarat** állítja be ott, a másik ívet pedig változatlanul hagyja (ennek a PI másik érintőjébe is be kell férnie). Ha mindkét PI-nél van ív, a **Mindkettő** gomb arányosan csökkenti a két sugarat, hogy éppen találkozzanak.
- Ha egyetlen ív önmagában hosszabb az érintőnél, a doboz közli, hogy a másik PI-nél egy ekkora ív mellett egyetlen ív sem fér el.
- Az a PI, amely visszafordul, nem kaphat ívet; a doboz a **Nincs ív a(z) n. PI-nél** gombot kínálja.

Minden gomb egy lépés: a {{key:Mod+Z}} visszaállítja a sugarakat. A felajánlott sugarak 0,01-re lefelé kerekítettek, így mindig elférnek.

### Tervezési minimális sugár

Írja be a **Tervezési minimális sugár** értékét (például a tervezési sebességéből), hogy minden ív ellenőrizve legyen vele; ha üresen hagyja, nincs ellenőrzés. A minimum alatti ívet a lista a **minimumot teljesítő legkisebb sugár** gombjával együtt mutatja, ha az a sugár elfér. Ha nem fér el, a doboz ezt közli, és megadja a érintők által megengedett legnagyobb sugarat, így látszik, hogy egy PI-t kell mozgatni, vagy csökkenteni a minimumot.

## PI-k mozgatása a terven

1. Ha a {{ui:Kijelölés}} aktív, kattintson a nyomvonalra a kijelöléséhez. A PI-knél négyzetes fogópontok jelennek meg.
2. Húzzon egy fogópontot. A nyomvonal, a szelvényezése, a hossz-szelvénye és a korridor követi a mozgást.
3. Engedje el. A mozgatás egy visszavonási lépés.

Két meglévő PI közé új PI-t még nem lehet beszúrni: törölje és rajzolja újra a nyomvonalat, vagy írja be az új PI-k koordinátáit a meglévők helyett.

## Szelvény és eltolás leolvasása

Mozgassa a mutatót a terv fölé. Az állapotsor a legközelebbi nyomvonalat (vagy a kijelöltet) mutatja a szelvénnyel és az eltolással, a szelvénynövekmény irányából nézve **B** (bal) vagy **J** (jobb) jelöléssel, például: „Nyomvonal 1: Sta 2+15.30, eltolás 18.42 J”. Bármelyik végén túl „(a végén túl)” kiegészítést kap.

## Mi jelenik meg

A terven, a DXF-ben és a PDF-ben: a tengelyvonal (az érintők egyenesként, az ívek valódi körívként), 50 ft-enként (20 m-enként) egy jelölés, hosszabb jelöléssel és szelvényfelirattal 100 egységenként, valamint a PC és PT jelölések a szelvényszámukkal.

## Nyomvonal törlése

Jelölje ki, és nyomja meg a {{key:Delete}} billentyűt, vagy kattintson a {{ui:Törlés}} gombra az eszköztárban vagy a jobb oldali panel alján. A hossz-szelvénye és a korridorja vele együtt törlődik. A {{key:Mod+Z}} visszahozza.

:::mac
Mac billentyűzeten a **delete** feliratú billentyű a böngészőben a {{key:Backspace}} billentyűként működik, és nem törli a kijelölést. Nyomja meg a {{key:Delete}} billentyűt (Fn és delete), vagy használja a {{ui:Törlés}} gombot.
:::

## Tovább

- [Hossz-szelvény tervezése](topic:profile).
## Tervezési sebesség és osztály

A nyomvonal Tulajdonságai alatt a **Tervezési sebesség** (km/h vagy mph) és a **Tervezési osztály** a nyomvonallal együtt marad meg, a projektben mentődik, és IFC-be is íródik (Pset_RoadDesignCriteriaCommon). A CivilCraftban nincs olyan táblázat, amely a sebességet minimális sugárhoz rendelné, ezért ezekből semmi nem ellenőrződik: a **Minimális sugár** értékét a saját tervezési szabványából adja meg.

## Spirálok

Egy ív mindkét végén lehet klotoid spirál: érintő, spirál, ív, spirál, érintő. A PI-táblázatban egy sugárral rendelkező PI-nél írjon hosszt a **Spirál be** és a **Spirál ki** mezőbe. A PI a helyén marad; az ív befelé mozdul, hogy helyet csináljon, így az érintőtávolság a spirál eltolásával nő. A két hossz eltérhet, és ha csak az egyik hosszt adja meg, a spirál csak azon a végen lesz.

Az ívlistában ekkor TS, SC, CS és ST jelölés áll (érintő–spirál, spirál–ív, ív–spirál, spirál–érintő), a spirálszöggel θs, az érintőtávolságokkal és a külső távolsággal. A szelvények a spirálok mentén is úgy futnak, mint máshol. Ha a spirálok együtt többet fordulnak, mint az ív, a rendszer megtagadja, és megnevezi a PI-t; a spirál, amely hosszabb az érintő által megengedettnél, átfedés, ahogy bármely ívnél is. A keresztlejtés a spirált használja kifutóként (lásd: [Korridor](topic:corridor)).
