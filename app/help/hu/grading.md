---
title: Épülettelek szintezése
summary: Sík telek rajzolása, magasságának és bevágási, valamint töltési lejtőinek megadása, majd a lejtők CivilCraft általi illesztése a meglévő terephez (daylight), és hozzáadása a tervezett felülethez.
keywords: támfal, támfalak, függőleges oldal, fal lejtő helyett, oldalankénti lejtő, töltés, épülettelek, daylight, jellemzővonal, tereprendezési csoport, bevágási lejtő, töltési lejtő, készre szintezett terep, tervezett felület, telekszintezés
from: 482319a6
---

A tereplépcső egy sík terület egyetlen magasságon. A szélétől a CivilCraft kifelé lejt: a bevágási lejtőjével ott, ahol a terep magasabb a tereplépcsőnél, a töltési lejtőjével pedig ott, ahol alacsonyabb, amíg a lejtő el nem éri a meglévő terepet. Ez a találkozási vonal a daylight-vonal. A tereplépcső és a lejtői a daylight-vonalon belül helyettesítik a meglévő terepet, így jön létre a tervezett felület.

## Tereplépcső megrajzolása

Szükség van először egy meglévő terepfelületre.

1. Nyomja meg a {{key:G}} billentyűt, vagy kattintson a **Tervezés** csoport {{ui:Tereplépcső}} gombjára.
   A súgó ezt írja: „Tereplépcső: kattintson a sarkaira. Az Enter vagy a dupla kattintás befejezi, a Backspace az utolsót eldobja, az Esc megszakít.”
2. Kattintson a tereplépcső sarkaira sorrendben, bármelyik irányban. Kék körvonal követi a mutatót.
3. Az utolsó sarok után nyomja meg az {{key:Enter}} billentyűt (legalább három sarok kell).
   A tereplépcső megrajzolódik és kijelölődik. Magassága a közepénél mért terepszint 0,1-re kerekítve, bevágási lejtője 2 : 1, töltési lejtője 3 : 1. Az állapotsor például ezt írja: „Tereplépcső 1 magassága: 254.3 (a közepén a terep), bevágás 2:1, töltés 3:1. A Tulajdonságok között módosíthatja őket.”

:::warning
Az {{key:Enter}} billentyűvel fejezze be. A dupla kattintás is befejezi, de ebben a verzióban a duplán kattintott sarkot eldobja. Kattintson egyszer az utolsó sarokra, majd nyomja meg az {{key:Enter}} billentyűt.
:::

A tereplépcső körvonala nem metszheti önmagát („A tereplépcső körvonala önmagát metszi.”).

## Magasság és lejtők beállítása

A kijelölt tereplépcsőnél a jobb oldali panel a **Tereplépcső** részt mutatja:

1. **Név**.
2. **Magasság**: a tereplépcső sík magassága.
3. **Bevágási lejtő** és **Töltési lejtő**, H:V formában (a 2 azt jelenti, hogy 2 : 1). Mindkettőnek 0-nál nagyobbnak kell lennie.
4. **Tereplépcső területe** és **Sarkok**: csak tájékoztatásul jelennek meg.

Minden érték után nyomja meg az Entert. A daylight-vonal, a tervezett felület és a térfogatok azonnal frissülnek.

A mezők alatt például ez a sor olvasható: „Daylight-vonal: 48 lejtővonal (20 bevágásban, 28 töltésben), a legtávolabbi 31.20 ft-re kifelé.” A terven a daylight-vonal és a lejtővonalak bíborszínnel látszanak.

## A daylight megtalálása

- A lejtővonalak minden élre merőlegesen indulnak, körülbelül a tereplépcső méretének minden huszadánál.
- A külső sarkoknál 10°-onként legyezőszerűen szétterülnek, így a lejtő körbeér a sarkon.
- A belső sarkoknál egy vonal fut a szögfelezőn, ahol a két él lejtői találkoznak.
- Mindegyik vonal a bevágási lejtővel emelkedik, vagy a töltési lejtővel süllyed, amíg el nem éri a terepet.

## Oldalankénti lejtők és támfalak

A tereplépcső, platform vagy töltés Tulajdonságainak **Oldalak és támfalak** részében minden oldal saját módon szintezhető. Az 1. oldal az első megadott sarokból a másodikig tart, a 2. oldal a másodikból a harmadikig, és így tovább.

- **Minden oldal**: a **Lejtős** minden oldalon a fenti bevágási és töltési lejtőt használja; a **Függőleges: támfalak** minden oldalra falat tesz.
- Oldalanként: **Fenti lejtők**, **Saját lejtők** (adjon meg bevágási és töltési lejtőt az adott oldalhoz), vagy **Függőleges (támfal)**.
- Lejtőt `3` vagy `3:1` alakban (vízszintes 1 függőlegeshez), `33%` vagy `18.4°` formában adhat meg; H:1 alakban jelenik meg. A tereplépcső saját **Bevágási lejtő** és **Töltési lejtő** mezői ugyanezt fogadják el.
- A függőleges oldalnak nincs töltése: a támfal a szél mentén fut, a tereplépcsőtől lefelé a meglévő terepig (töltésnél), vagy a terepről lefelé a tereplépcsőig (bevágásnál). A **Falvastagság** (kezdetben 0,3 m vagy 1 ft) azt mutatja, mennyire lép a terep a tereplépcső széléről a meglévő terepre. A bevágási és töltési térfogatok nem számolják azt a töltést, amely az oldalnál már nincs meg.
- Ahol a fal lejtős oldalhoz ér, a lejtő a fal végén körbefordul; két fal gérvágással találkozik.
- A mezők alatt: a falak hossza, a szabad felület (magasság × hosszúság), valamint a legmagasabb és az átlagos magasság.

A terven minden fal külső lapját rövid jelölések keresztezik, és a magasságát mindkét végén, valamint a legmagasabb pontján kiírja (a támfal-rétegen, amely a DXF- és DWG-fájlokba is bekerül). A 3D-nézet a falakat testként mutatja (**Megjelenítés › Támfalak**), a GLB-, OBJ- és USD-exportok pedig tartalmazzák őket. A széleken átmenő metszetek mutatják a lépcsőt.

**Figyelmeztetések** (a Tulajdonságokban és a Problémák panelen): ha a fal magasabb a **Figyelmeztetés ekkora falmagasság felett** értéknél (kezdetben 1,0 m vagy 3,3 ft), a „lehet, hogy mérnöki falra vagy engedélyre van szükség; ellenőrizze a helyi előírásokat” üzenet jelenik meg. Ha pedig beírja az **A talaj által elviselt legmeredekebb lejtő** értéket, minden olyan oldalra figyelmeztetés kerül, amelynek bevágási vagy töltési lejtője ennél meredekebb. Ezek figyelmeztetések: a tereprendezés attól még elkészül. Minden változtatás egy lépés, amelyet a {{key:Mod+Z}} visszavon.

## Sarkok mozgatása

Jelölje ki a tereplépcsőt, majd húzzon egy négyzet alakú fogópontot egy sarkon. Minden húzás egy visszavonási lépés. Sarok hozzáadása vagy eltávolítása még nem elérhető: törölje a tereplépcsőt, és rajzolja meg újra.

## Ha nem szintez

A **Földmunka** alatt egy piros doboz nevezi meg a tereplépcsőt és a problémát:

| Üzenet | Teendő |
|---|---|
| „3 lejtővonal a felületről lefut, mielőtt elérné: a tereplépcső túl közel van a felület széléhez, vagy túl magas/mély.” | Húzza a tereplépcsőt beljebb a felület széléről, vagy hozza közelebb a magasságát a terephez. |
| „A daylight-vonal önmagát metszi (a tereplépcső különböző oldalainak lejtői összefutnak). Alakítsa át a tereplépcsőt, vagy módosítsa a lejtőket.” | Jellemző keskeny vagy L alakú tereplépcsőknél mély bevágásban vagy magas töltésben. Szélesítse a tereplépcsőt, csökkentse a szintkülönbséget, vagy tegye meredekebbé a lejtőket. |
| „A tereplépcső körvonala önmagát metszi.” | Rajzolja újra a sarkokat a tereplépcső körül, sorrendben. |

A hibás tereplépcső addig kimarad a tervezett felületből és a térfogatokból, amíg meg nem javítják.

## Az eredmény megtekintése

1. A **Megjelenítés** alatt állítsa a **Felület** értékét erre: {{ui:Tervezett (szintezett)}}.
   A szintvonalak most a tereplépcsőn át vízszintesen futnak, és a lejtőket követve a daylight-vonalig húzódnak.
2. Vigye a mutatót a tereplépcső fölé: az állapotsor megmutatja a **Terep** és a **Szintezett** magasságot.
3. Olvassa le a bevágást és a töltést a **Földmunka** alatt; lásd [Földmunkai térfogatok](topic:volumes).

A tereplépcsők a sávok után kerülnek szintezésre, a rajzolás sorrendjében. Egy későbbi tereplépcső a saját daylight-vonalán belül mindent helyettesít, ami korábban ott volt.

## Tereplépcső törlése

Jelölje ki, és nyomja meg a {{key:Delete}} billentyűt (Mac-en: Fn + Delete), vagy kattintson a {{ui:Törlés}} gombra.

## Még nincs elkészítve

A tereplépcsők síkok: a lejtős tereplépcsők, a változó esésű jellemzővonalak, a padkák, valamint a távolságra vagy magassági célra történő szintezés még nem érhetők el. Lásd: [Még nincs elkészítve](topic:not-built-yet).
