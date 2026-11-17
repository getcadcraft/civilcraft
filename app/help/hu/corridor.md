---
title: Útsáv végigvezetése egy nyomvonalon
summary: Kapcsoljon be egy sávot egy nyomvonalhoz, állítsa be a sáv, a váll és az oldallejtő értékeit, és olvassa le a keresztszelvényeket, a határvonalakat és a földmunkát, amelyeket létrehoz.
keywords: túlemelés, super, dőlés, átmeneti szakasz, lapítási szakasz, sebességtáblázat, keresztlejtés, elforgatás, sáv, összeállítás, részösszeállítás, tipikus keresztmetszet, út, sáv, váll, oldallejtő, határvonal, bevágás, feltöltés, szelvények, cél, célok, szélességi cél, magassági cél, eltolási cél, szélesítés, burkolat széle, másik sáv követése
from: 91303189
---

A sáv egy egyszerű tipikus keresztmetszetet (összeállítást) vezet végig a nyomvonalon és a tervezett hossz-szelvényen, a meglévő talajba illeszti, az eredményt pedig hozzáadja a tervezett felülethez. Egy nyomvonal több sávot hordozhat különböző állomástartományokon, és a sáv sablonokból, állomásonként is épülhet ([Sávsablonok](topic:corridor-templates)). Az alábbi egyszerű összeállítás mindkét oldalon azonos; ha oldalanként külön részeket szeretne, lásd: [Oldalak építése részekből](topic:corridor#build-each-side-from-parts).

## Az összeállítás

A tengelytől kifelé, mindkét oldalon:

1. egy **sáv** adott szélességgel, amely a **sávlejtés** szerint esik a tetőtől
2. egy **váll** adott szélességgel, a **vállejtés** szerint
3. egy **oldallejtő** a váll széléből addig, amíg a talajt nem éri: a **bevágási lejtés**, ahol a talaj magasabb, és a **feltöltési lejtés**, ahol alacsonyabb

A kezdőértékek helyőrzők, nem tervezési szabvány:

| Érték | US feet | Méter |
|---|---|---|
| Sávszélesség | 12 ft | 3.6 m |
| Sávlejtés | 2% | 2% |
| Vállszélesség | 4 ft | 1.2 m |
| Vállejtés | 4% | 4% |
| Bevágási lejtés | 2 : 1 | 2 : 1 |
| Feltöltési lejtés | 3 : 1 | 3 : 1 |
| Szelvény közönként | 10 ft | 5 m |

Az oldallejtők arányai vízszintes és függőleges (H:V) arányok: a 3 : 1 azt jelenti, hogy 3 egységet vízszintesen, 1-et függőlegesen.

## A sáv megépítése

Hibamentes nyomvonalra és legalább két PVI-t tartalmazó, hibamentes tervezett hossz-szelvényre van szükség.

1. Jelölje ki a nyomvonalat.
2. A jobb panelen, a **Sáv** alatt jelölje be a **Sáv végigvezetése a tervezett hossz-szelvény mentén** lehetőséget. A mezők megjelennek, a sáv pedig azonnal megépül. A terven a sáv és a váll szélei, valamint a határvonalak látszanak; ha a **Megjelenítés** alatt a {{ui:Tervezett (szintezett)}} van kiválasztva, a szintvonalak az új terepet mutatják.
3. Bármelyik értéket módosíthatja: **Sávszélesség**, **Sávlejtés**, **Vállszélesség**, **Vállejtés**, **Bevágási lejtés**, **Feltöltési lejtés**, **Szelvény közönként**. Minden mező után nyomja meg az Entert. A bevágásnak, a feltöltésnek és a szelvényközöknek nagyobbnak kell lennie 0-nál.
4. Olvassa el a mezők alatti sort, például: „39 szelvény a 0+00.00 és 3+86.36 között; bevágás 240.2 cu yd, feltöltés 556.0 cu yd.”

A szelvények minden **Szelvény közönként** lépésnél, a végeken, valamint minden vízszintes és függőleges ív kezdeténél és végénél készülnek. Minden szelvény, és az azokon átmenő vonalak (tengelyvonal, sáv- és vállszélek, határvonal) a tervezett felület töréselemeivé válnak.

A sáv kikapcsolásához vegye ki a jelölést a négyzetből. Az értékei a következő alkalomra megmaradnak.

## Ha nem épül meg

A mezők alatti piros doboz megmondja az okot:

| Üzenet | Teendő |
|---|---|
| „A sávhoz hibamentes tervezett hossz-szelvény kell.” | Adjon hozzá PVI-ket, vagy javítsa az átfedő függőleges íveket (lásd: [Függőleges szelvény tervezése](topic:profile)). |
| „A tervezett hossz-szelvény nem fedi át a nyomvonalat.” | Mozgassa a PVI-ket a nyomvonal állomástartományára. |
| „A sávhoz legalább két szelvény kell a felületen.” | A sáv nagy része a meglévő terepen kívül esik. |
| „4 oldallejtő kifut a felületről, mielőtt elérné a talajt.” | A felület szélénél a lejtő nem éri el a talajt. Tartsa az utat távol a széltől, vagy csökkentse ott a feltöltés vagy bevágás magasságát. |
| „A sáv határvonalai keresztezik egymást (a szelvények átfednek, például egy szoros ív belső oldalán). Használjon nagyobb sugarat vagy keskenyebb összeállítást.” | Egy éles ív belső oldalán a szelvények átfednek. Növelje a sugarat, vagy szűkítse az összeállítást. |

A problémás sáv nem kerül bele a terepbe, és nem számít bele a földmunkába.

## Sávok és tereplépcsők együtt

A tervezett felület sorrendben épül: előbb minden sáv, utána minden tereplépcső. Ahol egy tereplépcső szintezése átfed egy sávval, a tereplépcső nyer. A térfogatok az összes határvonal együttes határán belül számítódnak; lásd: [Földmunka-térfogatok](topic:volumes).

## Túlemelés

Egy ívben az út a belső oldal felé dőlhet, így a forgalom kevésbé tolódik kifelé. A nyomvonal **Tulajdonságai** között a **Túlemelés** alatt jelölje be a **Túlemelés az íveken** lehetőséget:

- Minden körív a sebességtáblázatból kap egy **e** dőlést: az első sort, amelynek sugarát az ív eléri (az üres dőlésű sor a normál keresztlejtést tartja meg). A táblázat és a **Maximális relatív lejtés** (kezdésként 0.5 %) helyőrzők, nem szabvány: állítsa be a saját tervezési kritériumai szerint. Szükség szerint adjon hozzá vagy távolítson el sorokat.
- A sávok a tengely körül fordulnak. Az ív előtt a külső sáv a **lapítási szakaszon** (normál keresztlejtés ÷ e × átmeneti szakasz) lapul, majd az **átmeneti szakaszon** (sávszélesség × e ÷ lejtés) tovább fordul, amíg az egész út e lejtéssel a belső oldal felé nem dől; az átmeneti szakasz kétharmada az ív előtt, egyharmada rajta van. Az ív után ugyanez fordítva történik.
- Az alacsony oldali váll soha nem lehet laposabb a sávjánál; a magas oldalon megtartja a saját lejtését (átgördül).
- Az alatta lévő táblázat minden ív sugarát, dőlését, átmeneti és lapítási szakaszát, valamint azt listázza, hol kezdődik és hol ér véget a teljes túlemelés. A **túlemelési ábra** mindkét sáv keresztlejtését rajzolja az állomások mentén (a bal sáv folytonos, a jobb szaggatott).
- Ha egy ív túl rövid a teljes túlemeléshez, vagy két átmenet átfed, azt egy doboz jelzi a táblázat felett.

A szelvények, a térfogatok, a 3D-nézet és a lapok mind a megdőlt utat mutatják. Minden változtatás egy lépés: a {{key:Mod+Z}} visszavonja.

## Célok

A cél az út egyik oldalának egy pontját egy vonalhoz mozgatja: a **Burkolat széle** vagy a **Váll széle** vonalához, a **Bal** vagy a **Jobb** oldalon. Minden szelvény a tengelyre merőlegesen találkozik a vonallal, csak az adott oldalon kifelé haladva, így a jobb oldali cél soha nem mozdítja el a bal oldalt.

| Beállítja | Mi történik ott, ahol a szelvény találkozik a vonallal |
|---|---|
| **Szélesség** | A pont a vonalra kerül: a sáv (vagy a váll) hozzá szélesedik vagy szűkül, megtartva a keresztlejtését. |
| **Magasság** | A pont felveszi a vonal magasságát ott, a saját eltolásánál: a sáv (vagy a váll) keresztlejtése ehhez igazodik. |

A vonal lehet jellemzővonal (bármilyen **Használattal**), vagy másik sáv vonala: annak tengelyvonala, burkolatszélei, vállszélei vagy határvonalai. Egy sáv vonala követi azt a sávot: ha a másik utat módosítja, ez is követi. A CivilCraft a másik sávot építi meg előbb; két sáv, amely egymást célozná körbe, az egyik oldalon elutasításra kerül, a táblázat pedig megmondja, melyik.

1. Jelölje ki a nyomvonalat, és kapcsolja be a sávját.
2. A **Célok** alatt kattintson az {{ui:Cél hozzáadása}} gombra.
3. Válassza ki az **Oldalt**, a **Pontot**, azt, amit **Állít be**, és a **Vonalhoz** tartozót. Minden változtatás egy visszavonási lépés.

Az **Eredmény** azt mutatja, hány szelvényen érte el a vonal a célt. A szelvények, amelyeket nem ér el (a vonal végein túl, vagy ahol a tengelyvonal mögött van), megtartják a részösszeállítás értékeit. Ha a vonal törlődik, a sáv visszaáll a cél előtti állapotába, és a táblázat ezt jelzi. Egy oldalon minden ponthoz egy szélesség- és egy magassági cél tartozhat.

## Oldalak építése részekből

Kapcsolja be az **Oldalak építése részekből** lehetőséget a sáv beállításai alatt. Ekkor minden oldalnak saját listája van, a tengelytől kifelé: sávok, váll, burkolati árok, szegély, ültetési sáv, járda, és végül a talajig tartó oldallejtő (saját bevágási és feltöltési arányokkal). Kezdje a {{ui:Külterületi út}} vagy a {{ui:Városi utca}} sablonnal, adjon hozzá és távolítson el részeket, mozgassa őket a nyilakkal, és a {{ui:Másolás}} gombbal másolja át az egyik oldalt a másikra. Minden változtatás egy visszavonási lépés.

A keresztlejtés az úttól távolodó lejtés, így az úttól lefelé lejtő járda negatív. A szegély a megadott magasságú homlokfelület, a megadott szélességű tető és hátul egy opcionális esés. A túlemelés minden sávot az első sorban fordít; a burkolati árok, a szegély, az ültetési sáv és a járda az épített sávok szélétől lóg. A célok még mindig a sávok végét és az utolsó részt mozgatják. A keresztszelvények megjelölik a burkolati árok fenékvonalát, a szegély tetejét és hátulját, valamint a többit. Spirálos íveken az átmeneti szakasz maga a spirál: szintes tető a TS-nél, teljes túlemelés az SC-nél.

## Burkolatrétegek

A sáv, a váll, a burkolati árok, az ültetési sáv vagy a járda hordozhatja a felépítményét: a rész alatt az {{ui:Réteg hozzáadása}} gombbal nevet, anyagot, vastagságot és típust (felület, kötőréteg, alap, altalaj, fedőréteg vagy egyéb) adhat meg, felülről lefelé. A rétegek nem mozdítják el az út felületét (annak tetején a tervezett felület van); mindegyik a rész alatt fekszik, mélysége egyenesen lefelé mérve. A keresztszelvények minden réteg alját szaggatott vonallal rajzolják, a {{ui:Burkolatrétegek: mennyiségek}} lista pedig minden réteg alaprajzi területét és térfogatát adja (a terület a sáv mentén a szelvényekből, a térfogat = terület × vastagság). Az IFC-exportban minden réteg saját elemként íródik ki a vastagságával és anyagával (lásd: [IFC export és import](topic:ifc)). A beírt vastagság az Ön adata: a CivilCraft nem méretezi a burkolatot.

## Ami még nincs kész

A határvonal lejtéséhez célok még nem érhetők el. Olyan sávhoz, amely az út mentén változik, bal és jobb oldalon külön, használja a [Sávsablonok](topic:corridor-templates) témakört. Lásd: [Még nincs elkészítve](topic:not-built-yet).
