---
title: Gravitációs csőhálózat kialakítása
summary: Csapadékvíz- vagy szennyvízvezetékek rajzolása műtárgyanként, a lejtés, takarás és esés szabályainak beállítása, a fenékmagasságok beállítása a CivilCraft által, valamint a listázott problémák javítása.
keywords: műtárgyszerkesztő, műtárgytípus, téglalap alakú műtárgy, víznyelő, keret, takarás, falvastagság, könyvtári elem, csőhálózat, csapadékvíz, szennyvíz, csatorna, műtárgyak, aknák, víznyelők, fenékmagasságok, takarás, lejtés, esés, peremszint, iszapzsák, gravitációs csövek
from: 10a3c14d
---

Egy projektben egy gravitációs csőhálózat van, csapadékvíz vagy szennyvíz. Műtárgyakból (aknákból, víznyelőkből) és a közöttük futó egyenes csövekből áll. Az áramlás abba az irányba halad, amerre rajzolja. A CivilCraft minden csövet és műtárgyat három szabályhoz hasonlít, amelyeket Ön állít be, és ezek alapján be tudja állítani az összes fenékmagasságot.

## Szakasz rajzolása

A csöveket felszín nélkül is rajzolhatja, de a peremszintekhez, a takarásokhoz és az automatikus fenékmagasságokhoz szükség van rá.

1. Nyomja meg a {{key:P}} billentyűt, vagy kattintson a **Tervezés** csoport {{ui:Pipes}} gombjára.
   A súgósor ezt írja: „Csövek: kattintson a műtárgyakra a szakasz tetejétől lefelé (egy meglévőre kattintva csatlakozik). Az Enter befejezi.”
2. Kattintson oda, ahová a felvízi műtárgy kerül. A műtárgy elhelyezésre kerül.
3. Kattintson minden következő műtárgyra lefelé. Egy már meglévő műtárgyhoz való csatlakozáshoz kattintson rá: az állapotsor ezt írja: „Csatlakoztatva az S3-hoz.”
4. Nyomja meg az {{key:Enter}} billentyűt.
   A csövek megrajzolódnak, fenékmagasságaik a szabályok szerint beállnak, és az állapotsor például ezt írja: „3 cső rajzolva, 12 fenékmagasság a szabályok szerint beállítva; minden ellenőrzés megfelel.”

Az új műtárgyak neve S1, S2 …, 48 hüvelyk (1200 mm) átmérővel. Az új csövek neve P1, P2 …, 12 hüvelyk (300 mm) átmérővel. Az átmérők lábas projektben hüvelykben, méteres projektben milliméterben jelennek meg.

A szakaszt az {{key:Enter}} billentyűvel fejezze be. Dupla kattintás is működik, de ha egy meglévő műtárgyon duplán kattintva fejezi be ott a szakaszt, a csatlakozás elvész: egyszer kattintson rá, majd nyomja meg az {{key:Enter}} billentyűt.

## A szabályok beállítása

Ha semmi sincs kijelölve, a jobb oldali panelen (**Projekt**) van egy **Csőhálózat** blokk:

| Beállítás | Kezdőérték | Jelentés |
|---|---|---|
| Típus | Csapadékvíz | {{ui:Storm}} vagy {{ui:Sanitary}}; a LandXML-be kerül |
| Legkisebb lejtés | 0.50% | Minden csőnek legalább ennyit kell esnie |
| Legkisebb takarás | 2 ft (0.6 m) | A talaj és a cső koronája között, a cső teljes hosszában |
| Esés a műtárgyakban | 0.10 ft (0.03 m) | A kifolyó fenékmagasságának legalább ennyivel kell lennie minden befolyó fenékmagasság alatt |

**Ezek a kezdőértékek helyőrzők, nem szabvány.** Állítsa be azokat az értékeket, amelyeket az illetékes hatóság vagy a projekt előír. A takarást a talajtól a koronáig (fenékmagasság plusz a belső átmérő) mérjük; a falvastagság nem számít bele. Ahol padok vagy folyosók vannak kialakítva, a kialakított felület a talaj.

## Fenékmagasságok beállítása a CivilCraft által

- A {{ui:Set every invert from the rules}} (a **Csőhálózat** blokkban) minden csövet beállít.
- A {{ui:Set its inverts from the rules}} (egy kijelölt csővel) csak azt a csövet állítja be.

Felvízről lefelé haladva minden szakasz a felső műtárgyánál legalább a takarásnyi mélységben indul, legalább a legkisebb lejtéssel esik, minden műtárgyban legalább az esést veszi fel, és mélyebbre megy mindenhol, ahol a cső mentén a talaj a legkisebb takarásnál kevesebbet hagyna. A fenékmagasságok 0,01-re lefelé kerekítve, sosem felfelé. Az állapotsor ezt írja: „Fenékmagasságok beállítva: legkisebb takarás a szakasz tetején, legalább a legkisebb lejtés, legalább az esés minden műtárgyban.” vagy megnevezi, mit nem tudott megtenni.

## Műtárgyak és csövek szerkesztése

Kattintson egy műtárgyra vagy csőre a {{ui:Select}} eszközzel, hogy a jobb oldali panelen lássa.

**Műtárgy**: **Név**, **Peremszint**, **Iszapzsák mélysége**, **Átmérő**, majd **Használt peremszint**, **Iszapzsák**, **Keleti** és **Északi** koordináta, valamint a be- és kimenő csövek a fenékmagasságukkal.

- Hagyja üresen a **Peremszint** mezőt, hogy a felületről vegye; a doboz ekkor szürkével mutatja a felületi értéket. Írjon be egy értéket a peremszint rögzítéséhez.
- Húzza a műtárgy fogópontját az alaprajzon az áthelyezéséhez. A csövei követik; fenékmagasságaik megmaradnak, ezért utána ellenőrizze a problémákat.

**Típus**: válasszon a hálózat műtárgytípusai közül (lent), vagy a „nincs” lehetőséget a saját átmérőjű kör keresztmetszetű műtárgyhoz.

**Cső**: **Név**, a műtárgyak, amelyek között fut, **Átmérő**, **Felső fenékmagasság**, **Alsó fenékmagasság**, majd **Hossz**, **Lejtés** és **Legkisebb takarás**.

Minden érték után nyomja meg az {{key:Enter}} billentyűt.

## Problémák olvasása és javítása

A **Csőhálózat** blokk minden problémát felsorol (legfeljebb 40); kattintson egyre a cső vagy műtárgy kijelöléséhez. A kijelölt cső vagy műtárgy a sajátját listázza. Ha semmi sincs kijelölve, ezt írja: „Minden cső és műtárgy megfelel a szabályoknak.”

| Üzenet (példák) | Mit tegyen |
|---|---|
| „A P2 felfelé fut (-0.40%).” vagy „… vízszintes …” | Cserélje fel a fenékmagasságokat, vagy állítsa be a szabályok szerint. |
| „A P2 0.30%-os lejtése laposabb a legkisebb 0.50%-nál.” | Csökkentse a kifolyó fenékmagasságát, vagy emelje a felvízit. |
| „A P3 takarása mentén 1.40 a 35-nél, ez kevesebb a legkisebb 2-nél.” | Süllyessze a csövet; állítsa be a fenékmagasságait a szabályok szerint. |
| „Az S3-ban a P4 245.20-nál távozik, a P3 245.25-ös beérkezésétől kevesebb mint 0.1-del lejjebb.” | Csökkentse a kimenő cső felső fenékmagasságát. |
| „A P1 koronája az S1 peremszintje fölött van.” | A cső túl magasan van a műtárgyhoz képest. |
| „Az S2-ből 2 cső távozik; egy gravitációs hálózatban minden műtárgyból egy kifolyás legyen.” | Távolítsa el az egyik kimenő csövet, vagy rajzolja át a helyes irányba. |
| „A csövek hurkot alkotnak; az áramlásnak kifolyóban kell végződnie.” | Egy szakaszt visszafelé rajzoltak; törölje az egyik csövet. |
| „Az S5 a felületen kívül van, és nincs peremmagassága.” | Írjon be egy peremszintet, vagy helyezze a műtárgyat a felületre. |
| „A P6 részben a felületen kívül fut; a takarás ott ismeretlen.” | Bővítse a felületet, vagy fogadja el, hogy ott a takarás nincs ellenőrizve. |
| „A P7-nek még nincs fenékmagassága.” | Írja be őket, vagy állítsa be a szabályok szerint. |

A problémás csöveket és műtárgyakat az alaprajzon is pirossal jelöli a program.

## Műtárgytípusok

A műtárgytípus a paramétereiből felépített műtárgy: akna, víznyelő, csomópont-doboz vagy kifolyó, **kör** (belső átmérővel) vagy **téglalap** (belső szélességgel és hosszal), a **falvastagságával**, **padlólemezzel**, a legalacsonyabb cső alatti **iszapzsákkal**, valamint **kerettel és fedéllel** (kör vagy téglalap alakú nyílással, a keret magasságával). A típusok a hálózathoz tartoznak, a projekt Tulajdonságaiban a **Műtárgytípusok** alatt.

1. Kattintson az {{ui:New structure type}} gombra. A párbeszédpanel a műtárgyat alaprajzban és metszetben rajzolja, ahogy gépel.
2. Kattintson az {{ui:Add the type}} gombra.
3. Válasszon ki egy műtárgyat, és válassza ki a típust a **Típus** alatt. Átveszi a típus méretét és iszapzsákját; a saját iszapzsákja továbbra is módosítható.

Ha módosít egy típust, az összes ilyen típusú műtárgy követi a méreteit. Ha eltávolít egy típust, a műtárgyai ugyanolyan szélességű kör keresztmetszetű műtárgyakként maradnak. Minden módosítás egy lépés: a {{key:Mod+Z}} visszavonja.

A téglalap alakú műtárgy az alaprajzon, DXF-ben, DWG-ben és PDF-ben, 3D-ben pedig téglalapként jelenik meg, hosszával a kifolyó csöve irányában; a csövek a falánál kezdődnek. A LandXML téglalap alakú műtárgyként (`RectStruct`) írja, a falvastagsággal együtt, és az ilyen műtárgyakat típusként olvassa vissza.

### Típus megosztása a könyvtáron keresztül

A {{ui:Save as library item}} a típust CadCraft könyvtári elemként írja (egy `.json` fájl): az alaprajzi jelét, egy jellemző mélységig 3D-s testét és minden méretét. Töltse fel a könyvtárba a megosztáshoz. Az {{ui:Open a library item}} visszaolvas egy így mentett műtárgyat a hálózatba, a projekt mértékegységeire átváltva. A nem CivilCraftban készült műtárgy könyvtári elemeket az ok megnevezésével elutasítja.

## Törlés

Jelöljön ki egy csövet, és nyomja meg a {{key:Delete}} billentyűt az eltávolításhoz. Egy műtárgy törlése a hozzá kapcsolódó csöveket is eltávolítja. Macen nyomja meg az Fn és a Delete billentyűket, vagy kattintson a {{ui:Delete}} gombra.

## Még nincs elkészítve

Az áramlásokat, a csőméreteket és a hidraulikus energiavonalat a [Csapadékvíz-elvezetés](topic:storm-drainage) tartalmazza. A csőkatalógusok, nem kör keresztmetszetű csövek, a csövek a hossz-szelvény nézetben, az ívelt csövek és a projektenként egynél több hálózat még nem elérhetők. Lásd: [Még nincs elkészítve](topic:not-built-yet).
