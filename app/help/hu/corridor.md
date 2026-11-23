---
title: Útsáv végigvezetése
summary: Sáv bekapcsolása egy nyomvonalon, a forgalmi sáv, a padka és az oldalrézsű értékeinek beállítása, valamint a keresztszelvények, rézsűvonalak és földmunkák megtekintése.
keywords: csomópont, kereszteződés, út találkozik úttal, mellékút, T-csomópont, átkelés, tereplépcső-szint, csatlakozás, bekötés, túlemelés, ívemelés, átmenet, kifutás, sebességtáblázat, keresztesés, forgatás, sáv, összeállítás, részösszeállítás, tipikus keresztmetszet, út, forgalmi sáv, padka, keresztesés, oldalrézsű, rézsűvonal, bevágás, töltés, keresztszelvények, cél, célok, szélességcél, magasságcél, eltolási cél, szélesítés, burkolatszél, másik sáv követése
from: 6dcb92b3
---

Egy sáv a nyomvonal és a tervezett hossz-szelvény mentén végigvezet egy egyszerű tipikus keresztmetszetet (összeállítást), a meglévő terephez illeszti, és az eredményt hozzáadja a tervezett felülethez. Egy nyomvonalon több sáv is lehet különböző szelvénytartományokon, és egy sáv állomásonként újrafelhasználható sablonokból is felépíthető ([Sávsablonok](topic:corridor-templates)). Az alábbi egyszerű összeállítás mindkét oldalon azonos; ha mindkét oldalnak saját elemeket szeretne adni, lásd: [Mindkét oldal építése elemekből](topic:corridor#build-each-side-from-parts).

## Az összeállítás

A tengelyvonaltól kifelé, mindkét oldalon:

1. egy **forgalmi sáv** adott szélességgel, amely a **forgalmi sáv esésének** megfelelően lejt az útkoronától lefelé
2. egy **padka** adott szélességgel, a **padka esésével**
3. egy **oldalrézsű** a padka széléből addig, ahol eléri a terepet: a **bevágási rézsű**, ha a terep magasabb, és a **töltési rézsű**, ha alacsonyabb

A kezdőértékek helyőrzők, nem tervezési szabvány:

| Érték | US láb | Méter |
|---|---|---|
| Forgalmi sáv szélessége | 12 ft | 3.6 m |
| Forgalmi sáv esése | 2% | 2% |
| Padka szélessége | 4 ft | 1.2 m |
| Padka esése | 4% | 4% |
| Bevágási rézsű | 2 : 1 | 2 : 1 |
| Töltési rézsű | 3 : 1 | 3 : 1 |
| Keresztszelvény-távolság | 10 ft | 5 m |

Az oldalrézsűk meredekségét vízszintes:függőleges (H:V) arányban adjuk meg: a 3 : 1 azt jelenti, hogy 3 egység vízszintesen 1 egység függőlegesen.

## A sáv felépítése

Hibamentes nyomvonalra és legalább két PVI-t tartalmazó, hibamentes tervezett hossz-szelvényre van szükség.

1. Jelölje ki a nyomvonalat.
2. A jobb oldali panelen, a **Sáv** alatt jelölje be a **Összeállítás végigvezetése a tervezett hossz-szelvény mentén** jelölőnégyzetet.
   A mezők megjelennek, és a sáv azonnal felépül. A térképen látszanak a forgalmi sáv és a padka szélei, valamint a rézsűvonalak; ha a **Megjelenítés** alatt a {{ui:Tervezett (szintezett)}} van kiválasztva, a szintvonalak az új terepet mutatják.
3. Módosítson bármely értéket: **Forgalmi sáv szélessége**, **Forgalmi sáv esése**, **Padka szélessége**, **Padka esése**, **Bevágási rézsű**, **Töltési rézsű**, **Keresztszelvény-távolság**. Minden módosítás után nyomja meg az {{key:Enter}} billentyűt. A bevágás, a töltés és a keresztszelvény-távolság értékének nagyobbnak kell lennie 0-nál.
4. Olvassa el a mezők alatti sort, például: „39 keresztszelvény a 0+00.00-tól a 3+86.36-ig; bevágás 240.2 cu yd, töltés 556.0 cu yd.”

A keresztszelvények a **Keresztszelvény-távolság** lépésenként, a végeknél, valamint minden vízszintes és magassági ív elejénél és végénél készülnek. Minden keresztszelvény és a rajtuk átmenő vonalak (tengelyvonal, forgalmi sáv és padkaszél, rézsűvonal) a tervezett felület töréselemeivé válnak.

A sáv kikapcsolásához vegye ki a jelölést a négyzetből. Az értékei megmaradnak a következő alkalomra.

## Amikor nem épül fel

A mezők alatti piros keret megmondja az okát:

| Üzenet | Teendő |
|---|---|
| „A sávhoz hibamentes tervezett hossz-szelvényre van szükség.” | Adjon hozzá PVI-ket, vagy javítsa az átfedő magassági íveket (lásd: [Tervezett hossz-szelvény készítése](topic:profile)). |
| „A tervezett hossz-szelvény nem fedi át a nyomvonalat.” | Helyezze a PVI-ket a nyomvonal szelvénytartományába. |
| „A sávhoz legalább két keresztszelvény szükséges a felületen.” | A sáv nagy része a meglévő terepen kívül esik. |
| „4 oldalrézsű a terep elérése előtt kifut a felületről.” | A felület szélénél a rézsű nem éri el a terepet. Tartsa az utat távol a széltől, vagy csökkentse ott a töltés vagy a bevágás magasságát. |
| „A sáv rézsűvonalai keresztezik egymást (a keresztszelvények átfedik egymást, például egy szűk ív belső oldalán). Használjon nagyobb sugarat vagy keskenyebb összeállítást.” | Az éles ív belső oldalán a keresztszelvények átfednek. Növelje a sugarat, vagy szűkítse az összeállítást. |

A hibás sáv nem kerül bele a terepbe, és nem számít bele a földmunkába.

## Sávok és tereplépcsők együtt

A tervezett felület sorrendben épül fel: először minden sáv, azután minden tereplépcső. Ahol egy tereplépcső szintezése átfedi a sávot, ott a tereplépcső érvényesül. Ahol egy későbbi elem átfed egy utat, csak az út azon része cserélődik ki, amely a későbbi elem rézsűvonalán belül van; az út többi része, valamint az út által keresztezett terep-töréselemek megőrzik alakjukat. A térfogatok az összes rézsűvonalon belül együtt számítódnak; lásd: [Földmunka-térfogatok](topic:volumes).

## Túlemelés

Egy íven át az út a belső oldal felé dőlhet, így a forgalom kevésbé szorul a külső szélre. A nyomvonal **Tulajdonságok** paneljén, a **Túlemelés** alatt jelölje be az **Ívek túlemelése** jelölőnégyzetet:

- Minden körív a táblázatból kap egy **e** értéket: abból a sorból, amelynek sugarát az ív eléri (az üres értékű sor a szokásos keresztesést tartja meg). A táblázat és a **Legnagyobb relatív lejtés** (kezdetben 0,5%) helyőrzők, nem szabvány: a saját tervezési előírásai szerint állítsa be őket. Szükség szerint adjon hozzá vagy távolítson el sorokat.
- A forgalmi sávok a tengelyvonal körül fordulnak el. Az ív előtt a külső sáv a **kifutási szakaszon** (szokásos keresztesés ÷ e × átmenet) ellaposodik, majd az **átmeneti szakaszon** (forgalmi sáv szélessége × e ÷ lejtés) a külső sáv addig fordul tovább, amíg az egész út e mértékben a belső oldal felé nem lejt; az átmeneti szakasz kétharmada az ív előtt, egyharmada az íven fekszik. Az ív után ugyanez fordított sorrendben történik.
- Az alacsonyabb oldali padka soha nem lehet laposabb a forgalmi sávnál; a magasabb oldalon megtartja saját esését (átfordul).
- Alatta a táblázat felsorolja minden ív sugarát, értékét, átmeneti és kifutási szakaszát, valamint azt, hol kezdődik és hol végződik a teljes túlemelés. A **túlemelési diagram** a szelvényszámok mentén mindkét forgalmi sáv keresztesését ábrázolja (a bal sáv folytonos, a jobb szaggatott vonallal).
- Az a görbe, amely túl rövid ahhoz, hogy elérje a teljes túlemelést, vagy két olyan ív, amelyek átmenetei átfedik egymást, a táblázat fölötti keretben jelenik meg.

A keresztszelvények, a térfogatok, a 3D-nézet és a lapok mind a megdöntött utat mutatják. Minden módosítás egy lépés: a {{key:Mod+Z}} visszavonja.

## Célok

A cél az út egyik oldalának egy pontját egy vonalhoz mozgatja: a **burkolatszélt** vagy a **padkaszélt**, a **bal** vagy a **jobb** oldalon. Minden keresztszelvény derékszögben metszi a vonalat a tengelyvonalhoz képest, és csak az adott oldal felé halad, így a jobb oldali cél soha nem mozdítja el a bal oldalt.

| Beállítja | Mi történik ott, ahol a keresztszelvény metszi a vonalat |
|---|---|
| **Szélesség** | A pont a vonalon van: a forgalmi sáv (vagy a padka) hozzá szélesedik vagy keskenyedik, megtartva keresztesését. |
| **Magasság** | A pont ott felveszi a vonal magasságát, a saját eltolásánál: a forgalmi sáv (vagy a padka) keresztesése ehhez igazodik. |

A vonal lehet jellemzővonal (bármilyen **Használatával**) vagy egy másik sáv vonala: annak tengelyvonala, burkolatszélei, padkaszélei vagy rézsűvonalai. Egy sáv vonala követi azt a sávot: ha a másik utat módosítja, ez is követi. A CivilCraft előbb a másik sávot építi meg; ha két sáv körkörösen célozná egymást, az egyik oldalon elutasítja, és a táblázat megmondja, melyiket.

1. Jelölje ki a nyomvonalat, és kapcsolja be a sávját.
2. A **Célok** alatt kattintson a {{ui:Cél hozzáadása}} gombra.
3. Válassza ki az **Oldalt**, a **Pontot**, a **Beállítja** értéket és a **Vonalat**. Minden módosítás egy visszavonható lépés.

Az **Eredmény** megmondja, hány keresztszelvénynél érte el a vonal. Azok a keresztszelvények, amelyek nem érik el (a vonal végén túl, vagy a tengelyvonal mögött), megtartják az összeállítás értékeit. Ha a vonalat törlik, a sáv a cél előtti állapotába kerül, és a táblázat ezt jelzi. Egy oldal pontonként egy szélesség- és egy magassági célt kaphat.

## Mindkét oldal építése elemekből

A sáv beállításai alatt kapcsolja be a **Mindkét oldal építése elemekből** opciót. Ezután minden oldalnak saját listája van, a tengelyvonaltól kifelé: forgalmi sávok, padka, szegélyárok, szegély, ültetési sáv, járda és végül az oldalrézsű a talajig (saját bevágási és töltési arányokkal). Indulhat a {{ui:Külterületi út}} vagy a {{ui:Városi utca}} sablonjából, elemeket adhat hozzá és távolíthat el, a nyilakkal mozgathatja őket, és az egyik oldalt a {{ui:Másolás}} gombbal a másikra másolhatja. Minden módosítás egy visszavonható lépés.

A keresztesés az úttól elfelé mutató esés, így az úttól lejtő járda negatív. A szegély a megadott magasságú homlokfelület, a megadott szélességű felső rész, és opcionálisan egy hátsó lefolyás. A túlemelés az első sorban lévő minden forgalmi sávot elfordítja; a szegélyárok, a szegély, az ültetési sáv és a járda az elkészült forgalmi sávok szélétől lóg le. A célok továbbra is a forgalmi sávok végét és az utolsó elemet mozgatják. A keresztszelvények jelölik a szegélyárok folyásvonalát, a szegély tetejét és hátulját, valamint a többit. Spirálokkal rendelkező íven az átmeneti szakasz a spirál: szintes keresztesés a TS-nél, teljes túlemelés az SC-nél.

## Pályaszerkezeti rétegek

Egy forgalmi sáv, padka, szegélyárok, ültetési sáv vagy járda hordozhatja a saját szerkezetét: az elem alatt a {{ui:Réteg hozzáadása}} gombbal név, anyag, vastagság és fajta (kopóréteg, kötőréteg, alapréteg, altalaj-réteg, fedőréteg vagy egyéb) adható meg, felülről lefelé. A rétegek nem mozdítják el az út felületét (a teteje a tervezett felület); mindegyik az elem alatt fekszik, mélységük egyenesen lefelé mérve. A keresztszelvények minden réteg alját szaggatott vonallal rajzolják, a {{ui:Pályaszerkezeti rétegek: mennyiségek}} pedig minden réteg alaprajzi területét és térfogatát felsorolja (a terület a keresztszelvényekből számolva a sáv mentén, térfogat = terület × vastagság). Az IFC-exportálás minden réteget külön elemként ír ki a vastagságával és anyagával (lásd: [IFC-exportálás és -importálás](topic:ifc)). A beírt vastagság az Ön döntése: a CivilCraft nem méretezi a burkolatokat.

## Ahol az utak találkoznak utakkal, tereplépcsőkkel és gyalogutakkal

Ha a {{ui:Csatlakozás a találkozó utakhoz és telkekhez}} be van kapcsolva (minden sávnál alapból be van), a CivilCraft a sávot ahhoz csatlakoztatja, amivel a térképen találkozik:

- **Egy másik úton végződő út** (nyomvonalának vége a másik úton fekszik, vagy a saját burkolatszélességének körülbelül felén belül van annak az út szélétől) egy csomópont mellékútja. A találkozó út megnyitja a szélét a mellékút burkolatának: a torkolat mentén a padka, a szegély, az ültetési sáv és a járda a forgalmi sáv keresztesésére kerül, és burkolatként rajzolódik. A mellékút ott, ahol a kettő átfedi egymást, a főút felületére kerül, és a megközelítésen át felfelé vagy lefelé simul hozzá.
- **Két keresztező út** mindkét oldalon ugyanúgy csatlakozik. A Nyomvonalak alatt elsőként felsorolt út a átmenő út; a másik követi annak felületét a kereszteződésen át.
- **Egy tereplépcsőben végződő út** (annak belsejében, vagy szélétől a burkolatszélességének körülbelül felén belül) a tereplépcső szintjére érkezik, és a megközelítésen át simul hozzá.
- **Egy gyalogút** (Tájépítészet › {{ui:Burkolt felületek}}) az út külső szélénél megáll, az ottani járda vagy padka szintjén, ahelyett hogy az út fölé fekudne. Az úton átvezető gyalogút két darabra válik. Ha a rajzolt vége kicsit rövidebb az úttól (a gyalogút szélességének kétszeresén belül), a vonal az út széléig folytatódik.

A **Tulajdonságok** megmondja, hogy az egyes sávok mihez csatlakoztak, mennyivel emelkedtek vagy süllyedtek ott, és milyen hosszon. Ez a hossz a 10 m (30 ft) és a változás húszszorosa közül a nagyobbik, és soha nem lehet a sáv több mint 45%-a. **A tervezett hossz-szelvény nem változik**: a hossz-szelvény-nézet továbbra is az Ön által rajzolt magassági vonalat mutatja, a keresztszelvények, a tervezett felület, a térfogatok és a 3D-nézet pedig a csatlakoztatott utat mutatják. Ha a csatlakozást tervezetten pontosan szeretné elérni, mozgassa az utolsó PVI-t arra a szintre, amelyet a Tulajdonságok jelent.

Kapcsolja ki a kapcsolót egy sávnál, hogy pontosan a hossz-szelvénye és összeállítása szerinti maradjon; ekkor nem vesz részt egyik csomópontban sem, sem mellékútként, sem átmenő útként. Az olyan utak, amelyek közel egy vonalban (kb. 20° alatt) találkoznak, nem változnak, ahogy a földutak sem.

Amit a csomópont még nem tud: nincsenek szegélykanyarok (a sarkok derékszögűek), nincsenek kanyarodósávok vagy szigetek, a mellékút vége a saját nyomvonalára merőlegesen van levágva, a sablonokból épített sáv pedig ugyanolyan egyszerűen nyitja meg a szélét (a végállapotában lévő árok vagy fal a torkolat mentén el van egyenlítve, átereszek nélkül). Alaprajzi szegélykanyarokért, látómezőháromszögekért és festésekért lásd: [Talajok, utak, felmérés, bányák és összeköttetések](topic:soils-roads-survey-mines-links).

## Még nincs elkészítve

A rézsűvonalra irányuló célok még nem érhetők el. Ha a sáv az út mentén változik, és a bal és jobb oldal külön van kezelve, használja a [Sávsablonokat](topic:corridor-templates). Lásd: [Még nincs elkészítve](topic:not-built-yet).
