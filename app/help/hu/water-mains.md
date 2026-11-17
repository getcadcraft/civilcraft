---
title: Vízvezetékek: nyomások, hozamok és tűzivíz-hozam
summary: Nyomáshálózat rajzolása az alaprajzra csomópontokból, tározókból, tartályokból, csövekből, szivattyúkból és nyomáscsökkentő szelepekből; a CivilCraft kiszámítja a nyomómagasságokat, a nyomásokat és a hozamokat (Hazen–Williams, hurkolt hálózatok), a tűz számára rendelkezésre álló hozamot és egy napi fogyasztást. Laboratóriumi funkció; minden eredményt mérnöki ellenőrzéssel kell igazolni.
keywords: víz, vízvezeték, vízelosztó hálózat, nyomáshálózat, nyomócső, hurkolt hálózat, hazen-williams, C-tényező, fejveszteség, maradék nyomás, tűzivíz-hozam, tűzcsap, fogyasztás, csomópont, tározó, tartály, szivattyú, szivattyúgörbe, nyomáscsökkentő szelep, prv, visszacsapó szelep, kiterjesztett idő, epanet, inp, sebesség
from: df46bf6d
---

A vízvezetékek a terület nyomásoldalát alkotják: mindig tele csövek, amelyekben a vizet tározó, tartály vagy szivattyú hajtja. A CivilCraft minden csomópontban kiszámítja a nyomómagasságot és a nyomást, minden csőben pedig a hozamot, a hurkolt hálózatokat is beleértve, ahol a víz több úton juthat el. Amíg ellenőrzés alatt áll, a laboratóriumban van.

**Csak számítási segédeszköz.** Minden számot képzett mérnöknek kell ellenőriznie: az eredmény csak annyira jó, mint a megadott fogyasztások, magasságok, csőméretek és érdességi értékek, és egy állandósult állapotú modell nem tud a vízkalapácsról, a víz minőségéről vagy egy tűzoltószivattyú valódi viselkedéséről.

## A hálózat rajzolása

1. A **Felület** › {{ui:Továbbiak}} alatt válassza a {{ui:Vízvezetékek…}} lehetőséget. Az ablak nyitva marad, amíg az alaprajzon dolgozik.
2. Válassza a {{ui:Tározó}} lehetőséget, és kattintson az alaprajzra, ahol a táplálás van. A nyomómagassága 100 ft (30 m) a talaj felett indul; a Tulajdonságokban módosíthatja.
3. Válassza a {{ui:Csomópont}} lehetőséget, és kattintson minden olyan helyre, ahol vizet vesznek ki, vagy csövek találkoznak. A csomópont magasságát a talajról veszi; a Tulajdonságokban másikat írhat be, hogy felülírja.
4. Válassza a {{ui:Cső}} lehetőséget, kattintson egy csomópontra, majd arra a csomópontra, amelyhez csatlakozik. Az eszköz a következő csőhöz is aktív marad. Egy {{ui:Szivattyú}} és egy {{ui:Nyomáscsökkentő szelep}} ugyanígy rajzolható, a szívó (vagy felvízi) csomóponttól a nyomó- (vagy vízi) csomópontig. Egy {{ui:Tartály}} úgy helyezkedik el, mint egy csomópont.
5. Jelöljön ki egy csomópontot, és írja be a {{ui:Fogyasztás}} értékét (gpm, méteres projektben L/s). Jelöljön ki egy csövet, és állítsa be az {{ui:Átmérő}} értékét (in, vagy mm), valamint ha ismeri, a Hazen–Williams C-értékét.

Minden változtatás egy visszavonási lépés. A Delete törli a csomópontot és a hozzá csatlakozó csöveket.

## A részek jelentése

- **Cső.** A hossza az alaprajz mentén mérődik, hacsak nem ír be egyet. A C a Hazen–Williams-érdesség (indulásként 130; az alapértelmezést az ablakban módosíthatja). A helyi veszteségtényező (K) a kanyarok és az idomok veszteségeit adja hozzá. Jelölje be a {{ui:Visszacsapó szelep}} opciót olyan csőhöz, amelyen nem folyhat vissza a víz; egy **Zárt** cső nem szállít semmit.
- **Tározó.** Állandó nyomómagasságú forrás: a szint, amelyet a referenciasík fölött tart. Annyit ad vagy vesz el, amennyire a hálózatnak szüksége van.
- **Tartály.** Egy nap alatt változó szint. Az állandósult eredményekben a jelenlegi szintjén forrásként szerepel.
- **Szivattyú.** Egy tervezési pont (hozam és nyomómagasság) adja a szokásos görbét: nulla hozamnál a nyomómagasság a tervezési nyomómagasság 133%-a, és a nyomómagasság nulla a tervezési hozam kétszeresénél. Egy szivattyú soha nem tol vizet visszafelé.
- **Nyomáscsökkentő szelep.** A beállított nyomást tartja a lefolyó oldalon, amíg a betáplálás magasabb. Ha a betáplálás alacsonyabb, a szelep nyitva van, és nem tart semmit; ha a víz visszafelé folyna, bezár.

## Az eredmények olvasása

Az ablak minden csomópont nyomómagasságát és nyomását, valamint minden csővezeték hozamát, sebességét és fejveszteségét mutatja 1 000 ft-onként (vagy km-enként). A csomópontok az alaprajzon színezve vannak: a zöld a legalacsonyabb és a legmagasabb beállított nyomás közötti, a piros az alatta, a borostyánsárga a felette. A hozamnyilak mutatják az irányt. Jelöljön ki egy csomópontot vagy csövet, hogy a számait a Tulajdonságokban olvassa.

A táblázatok alatt egy lista van arról, mire érdemes figyelni: alacsony vagy magas nyomás, egy túl gyors cső a határértékénél, egy csomópont, amely minden forrásától el van vágva, vagy egy megoldó, amely nem konvergált. Ugyanezek a megállapítások a Problémák panelben is megjelennek. A határértékeket az ablakban állítsa be (kezdésként 20 psi, 100 psi és 10 ft/s; méteres projektben 140 kPa, 700 kPa és 3 m/s).

## Tűzivíz-hozam

A {{ui:Tűzivíz-hozam…}} egy hozamot rajzol egy csomóponton, és megmutatja a nyomást ott, valamint a hálózat bármely pontján mért legalacsonyabb nyomást. Azt is megkeresi, mekkora hozam áll rendelkezésre azon a csomóponton, miközben a hálózat leggyengébb csomópontja megtartja az Ön által megadott maradék nyomást. A többi fogyasztás marad, ahogy van.

## Egy napi fogyasztás

Az {{ui:Egy napi fogyasztás…}} óránként futtatja a hálózatot. Adja meg a fogyasztási mintát a fájl beállításaiban (ismétlődő szorzók listája); a tartályok a be- és kifolyó hozamtól töltődnek és ürülnek, a szivattyú pedig követhet egy be-ki mintát. A lista megnevezi azt a tartályt, amely eléri a legmagasabb vagy legalacsonyabb szintjét: a CivilCraft nem zárja el helyette a be- vagy kifolyót, ezt úgy értelmezze, hogy „ez a tartály túl kicsi, vagy a szivattyú túl nagy”.

## EPANET-szöveg

A {{ui:Mentés EPANET szövegként (.inp)}} a hálózatot abban a sima szöveges formátumban írja ki, amelyet sok vízügyi program olvas, a {{ui:EPANET szöveg megnyitása (.inp)…}} pedig beolvas egyet. Csak az jut át, amit a CivilCraft modellez: csomópontok, tározók, tartályok, csövek, nyomógörbés szivattyúk, nyomáscsökkentő szelepek, fogyasztási minták és az időpontok. A többi szeleptípust, a teljesítménnyel megadott szivattyúkat és a többi fejveszteség-képletet megnevezi, de kihagyja. A fájlnak ugyanazokat az egységeket kell használnia, mint a projektnek.

## Tűzcsapok, szelepek és idomok

Jelöljön ki egy csomópontot, és pipálja be a **Tűzcsap** opciót, hogy oda kerüljön egy; jelöljön ki egy főcsövet, és nyomja meg a **Hozzáadás középen** gombot, hogy szelepet, légszelepet, ürítőszelepet vagy mérőt helyezzen rá. Ezek a hálózat objektumai: vele együtt mozognak, és egyetlen visszavonási lépés eltávolítja őket.

Az elrendezés idomokat is magában foglal, amelyeket a CivilCraft kérés nélkül felsorol: **T-idom**, ahol három főcső találkozik, **kereszt**, ahol négy, **könyök** (a szögével), ahol két főcső legalább 5°-kal fordul, **szűkítő**, ahol két méret találkozik, és **vakdugó** a zsákutcában. A {{ui:Szerelvénykimutatás (CSV)}} megszámolja őket, és a főcsöveket mérettől függően. Ez az elrendezés által igényelt, a saját részleteivel összevetendő mennyiségkimutatás, nem rendelési lista.

A főcsöveket a terep szintje alatt, a takarás (4 ft vagy 1,2 m) levonásával fektetik le, hogy 3D-ben rajzolhatók és modellezhetők legyenek; a fenti nyomások ettől soha nem függnek.

## Az alaprajzon és a fájlokban

Az alaprajz, a PDF és a DWG vagy DXF a főcsöveket a **C-WATR-MAIN** rétegen, méreteiket a **C-WATR-TEXT** rétegen, a tűzcsapokat a **C-WATR-HYDR** rétegen, a szelepeket a **C-WATR-VALV** rétegen, az idomokat a **C-WATR-FITT** rétegen viszi. A LandXML-kimenet vízcsőhálózatot ír (minden csomóponthoz egy szerkezet, minden főcsőhöz egy cső, a tűzcsapok elnevezve); a LandXML-bemenet ebből vízvezetékként olvassa vissza, fogyasztások, szivattyúk és szelepek nélkül, mert a LandXML ezeket nem hordozza. Az IFC-export a főcsöveket csőszakaszként, tűzcsapként, szelepként és idomként írja egy vízrendszerben. Ezeket a fájlokat a saját olvasónk és íróink ellenőrizték; próbálja ki őket más programjaiban, és jelezze nekünk, mit tapasztal.

## Ami még nincs kész

Vízminőség és -kor, a szivattyú be-ki mintáján túli vezérlések és szabályok, egyéb szeleptípusok, nyomástól függő fogyasztás, változó átmérőjű csövek, és időben változó szennyvízhozamok. Lásd: [Még nincs elkészítve](topic:not-built-yet). A szanitér tervezési hozamok, amelyek másik számítás, itt találhatók: [Szanitér tervezési hozamok](topic:sanitary-design).
