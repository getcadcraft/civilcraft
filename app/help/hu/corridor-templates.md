---
title: Sávsablonok és terepsablonok
summary: Készítsen kis, újrafelhasználható sablonokat (szegély és burkolati árok, járda, fal, árok), építsen belőlük sávot állomásonként, a bal és jobb oldalt külön kezelve, bontsa a nyomvonalat több sávra, és rétegelt anyagokat terítsen egy terepre.
keywords: sablon, sablonok, sablonkönyvtár, sablonkészítés, tipikus keresztmetszet, összeállítás, részösszeállítás, elemek, pontkódok, végfeltétel, határvonal, árok, támfal, szegély, burkolati árok, járda, szakaszok, több sáv, több sáv egy nyomvonalon, bal és jobb, terepsablon, termőréteg, burkolat, ráterítés, anyagok, mennyiségek
from: ce70e58b
---

A **sablon** egy kis keresztmetszet, amelyet egyszer rajzol meg, és újra felhasznál: pontok eltolással, lejtésekkel és pontkódokkal, valamint anyagokkal rendelkező elemek. Sáv építhető sablonokból állomásonként, mindkét oldalon saját burkolati sablonokkal és saját végfeltétellel, és ugyanezek a sablonok ráteríthetők egy terepre.

:::warning
A példasablonok kiindulási helyőrzők. Számaik nem származnak szabványból vagy hatóságtól. Egy mérnöknek minden sablont és minden megadott értéket ellenőriznie kell, mielőtt tervezéshez használnák.
:::

## A sablonok megnyitása

Nyissa meg a {{ui:Felület}} › {{ui:Továbbiak}} › {{ui:Sávsablonok…}} menüpontot (vagy írja be: {{cmd:TEMPLATES}}). Az ablakban három lista van:

- **Ebben a projektben**: a projekt sávjai és terepsablonjai által használt sablonok. Ezek a projektfájlban mentődnek.
- **Saját könyvtár**: ebben a böngészőben tárolt sablonok, amelyek minden projektben elérhetők. Egy projektsablon megtartásához használja a {{ui:Mentés a Saját könyvtárba}} lehetőséget.
- **Példák**: két sáv szintváltásokkal, szegély és burkolati árok, járda, határvonal, árok, támfal, termőréteg a terep alatt, és burkolat a terepen. Mindegyik jelölése: „Mérnöki ellenőrzésre”.

A {{ui:Használat ebben a projektben}} könyvtári vagy példasablont másol a projektbe. Az {{ui:A projekt sablonjainak exportálása}} egy `.cctemplates.json` fájlba menti őket, a {{ui:Fájl importálása}} pedig egy ilyen fájlt olvas be a projektbe és a Saját könyvtárba. A fájllal sablonokat oszthat meg, vagy egy másik számítógépre viheti át.

## Sablon készítése

A {{ui:Új sablon}} (vagy a projektsablonon a {{ui:Szerkesztés}}) megnyitja a sablonszerkesztőt. A jobb oldalt rajzolja meg a sablon 0,0 pontjától kifelé; a bal oldal ugyanezt a sablont használja balra kifelé.

1. Adjon nevet és típust: **Burkolat** (a következő sablon annak végéhez csatlakozik), **Végfeltétel** (ez találkozik a talajjal) vagy **Terepsablon**.
2. Adjon hozzá **értékeket**: nevesített számokat, például `w` szélesség vagy `s` lejtés. A sablon bármely számmezője számot vagy egy érték nevét fogadja el; a `-t` a `t` érték negatív alakja. Egy sablonhasználathoz saját értékeket adhat, így egy szegélysablon minden szegélymagassághoz használható.
3. Adjon hozzá **pontokat** sorrendben. Mindegyik egy korábbi pontból (vagy a 0,0 pontból) kerül elhelyezésre a kényszere szerint:

| Kényszer | Elhelyezi a pontot |
|---|---|
| Eltolás lejtéssel | Kifelé eltolás és lejtés (emelkedés per vízszintes szakasz; −0.02 2%-os esést jelent) |
| Eltolás és emelkedés | Egy eltolás és egy emelkedés |
| Egyenesen fel vagy le | Csak emelkedés |
| Oldallejtő a talajig | Az adott pontból kifelé a talajig, a bevágási arányon, ahol a talaj magasabb, és a feltöltési arányon, ahol alacsonyabb |
| A talajig | Eltolás, majd egyenesen fel vagy le a talajig |
| Támfal | Az Ön által megadott vastagságú fal: bevágásban a teteje a talajjal találkozik az útfelületnél, feltöltésben az út átfut rajta, és külső lapja a talajig ereszkedik |

Jelölje be a **Felső** lehetőséget azokon a pontokon, amelyeken a kész felület átmegy. Az utolsó felső pont az, ahol az adott oldal következő sablonja kezdődik. A **Cél** lehetővé teszi, hogy a sáv mozgassa a pontot: eltolása vagy magassága egy vonalból származik.

4. Adjon hozzá **elemeket**: zárt alakzatokat pontkódokon keresztül (a `0` a 0,0 pont), mindegyiknek névvel, anyaggal és típussal. Területük adja a térfogatokat.

A rajz minden változtatást valós méretarányban követ, alatta lévő lista pedig megmondja, mi a hiba (például egy pont, amely a végfeltétel előtt éri el a talajt, egy érték, amelyet a sablon nem tartalmaz, vagy egy elem, amelynek nincs területe). Az {{ui:Hozzáadás ehhez a projekthez}} vagy a {{ui:Mentés}} megtartja a sablont, egy visszavonási lépésként.

## Sáv építése sablonokból

Jelöljön ki egy nyomvonalat sávval, és a tulajdonságai között kapcsolja be az {{ui:Építés sablonokból állomásonként}} lehetőséget. A sáv mindkét oldalon a két sávos és a határvonalas példákkal indul.

- **Szakaszok.** Minden szakasz egy állomástól indul, és a következő szakasz kezdetéig tart. Az {{ui:Szakasz hozzáadása}} egyet hozzáad; kezdő állomását a mezőjében változtathatja meg.
- **Bal és jobb külön.** Minden szakasz minden oldalának saját **Burkolat** listája van, a tengelytől kifelé, és saját **Végfeltétele**: határvonal, árok, fal, vagy bármely talajt érintő sablon. Végfeltétel nélkül az oldal a sáv bevágási és feltöltési lejtésein találkozik a határvonallal. A {{ui:Másolás balról jobbra}} átmásol egy oldalt.
- **Értékek és célok.** Minden sablon alatt oldalanként egy mező értékenként (üres = a sablon saját értéke), és egy olyan pontnál, amely célt vesz fel, az a jellemzővonal vagy másik sáv vonala, amely mozgatja.
- **Ettől és eddig** a sávot a nyomvonal egy részére korlátozza.

A keresztszelvények, a tervvonalak minden pontkódhoz, a tervezett felület, a kitűzés és a földmunka mind ehhez igazodik. A Tulajdonságok minden elem térfogatát listázza oldalanként és szakaszonként (átlagos végterületek a tengely mentén). A túlemelés és a sáv szélcéljai nem használatosak, amíg a sáv sablonokból épül.

## Több sáv egy nyomvonalon

A **Sávok ezen a nyomvonalon** alatt a {{ui:Sáv hozzáadása}} a nyomvonal többi részén ad egy sávot: az első sáv végállomást kap a középpontban (vagy megtartja a sajátját), az új pedig ott kezdődik, az első sáv utolsó szakaszának sablonjaival. Minden sávnak saját neve, állomástartománya, sablonjai és földmunkái vannak. A {{ui:Be}} jelölőnégyzetével kapcsolható ki és be. Ahol két tartomány átfed, a későbbi sáv az előzőre ráépül.

## Terepsablonok

A terepsablon egy sablon rétegeit a terepre teríti a 0,0 pontjától: a 0,0 pont alatti réteg a talajba kerül (a lehúzandó termőréteg), a fölötte lévő a talajon ül (például az alap és a burkolat egy parkolón). A szélességek és lejtések nem számítanak, csak az, hogy minden elem mennyire van a 0,0 pont felett vagy alatt.

Nyissa meg a {{ui:Felület}} › {{ui:Továbbiak}} › {{ui:Terepsablonok…}} menüpontot (vagy írja be: {{cmd:TERRAINTEMPLATES}}); a blokk a projekt Tulajdonságai között is megvan. A {{ui:Terepsablon hozzáadása}} egyet ad hozzá a termőréteg példával. Mindegyiknél válassza ki:

- a **sablont** (értékei ehhez az egyhez módosíthatók),
- a **terepet**: a meglévő talajt vagy a tervezett felületet,
- az **alakzatot**, amely levágja: az egész terepet, egy telket, egy alapozást vagy egy zárt jellemzővonalat. Több terepsablon használhat különböző alakzatokat ugyanazon a terepen.

Minden réteg felsorolja a vastagságát, alaprajzi területét és térfogatát. A térfogat az alaprajzi terület szorozva a vastagsággal, a vastagságot egyenesen lefelé mérve; a területet rácson mérik, és a ráterített (lejtős) terület is megadódik. Az alakzatok a tervre kerülnek, a C-TOPO-TMPL rétegen. A terepsablonok nem változtatják meg a tervezett felületet.

## Anyagok és mennyiségek

A projekt Földmunka blokkja listázza az **Anyagok sablonokból** részt: minden sáveleme és terepsablon-rétege a térfogatával. A {{ui:Küldés a TakeoffCraftnak}} a bevágás és feltöltés után egy mennyiségi fájlba írja őket, tételenként egyet, köbyardban (láb mértékegységű projekteknél) vagy köbméterben.

## Fájlok

A sablonok, a szakaszok, a további sávok és a terepsablonok a projektfájlba mentődnek. Az olyan projekt, amely ezek egyikét sem használja, a korábbival azonosan mentődik, a régebbi CivilCraft-verziók pedig megnyitják azokat a projekteket, amelyek használják (figyelmen kívül hagyják a sablonokat, és a sáv saját összeállítását építik fel).
