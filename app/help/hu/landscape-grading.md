---
title: Tereprendezés tájépítészethez
summary: Emelvények, földtöltések, vápák és szabad tereprendezés pontszintekkel és szintvonalakkal, amelyeket húzhat, élőben számolt bevágással és feltöltéssel, lejtőelemzéssel, lefolyónyilakkal és pangóvíz-jelzéssel — mindez a CivilCraft tervezett felületén.
keywords: támfal, támfalak, függőleges oldal, fal lejtő helyett, oldalankénti lejtő, töltés, tereprendezés, tájépítészeti tereprendezés, emelvény, terasz, tereplépcső, földtöltés, halom, vápa, pontszint, pontmagasság, szintvonalak, szintvonal szerkesztése, bevágás és feltöltés, földmunka, lejtőelemzés, akadálymentesség, meredek lejtők, lefolyónyilak, lefolyás, pangóvíz, pocsolyák
from: e1559eb9
---

Minden itt a **tervezett felületre** van tereprendezve, ugyanazzal a tereprendezéssel, mint a tereplépcsők és a folyosók. A **meglévő terep** soha nem változik, és a földmunka mindent számol. A tereprendezés menü a Tájépítészet csoportban van.

## Emelvények

{{ui:Szintezés}} › {{ui:Emelvény}}, majd kattintson a sarkokra, és nyomja meg az {{key:Enter}} billentyűt. Az emelvény az alatta lévő átlagos meglévő terep magasságán indul; adjon meg egy **Magasság** értéket a beállításhoz, vagy hagyja üresen, hogy újra követhesse a talajt. A **Lejtés** %-ban, a **Lejtés iránya** fokban (0 = kelet, 90 = észak) dönti meg. Oldalai a **Bevágási lejtő** és a **Feltöltési lejtő** értékig (vízszintesen 1-hez) simulnak ki a talajba.

## Oldalankénti lejtők és támfalak

A tereplépcső, emelvény vagy földtöltés Tulajdonságaiban, az **Oldalak és támfalak** alatt minden oldal a saját módján tereprendezhető. Az 1. oldal az első kattintott sarktól a másodikig tart, a 2. oldal a másodiktól a harmadikig, és így tovább.

- **Minden oldal**: a **Lejtős** a fenti bevágási és feltöltési lejtőket használja minden oldalra; a **Függőleges: támfalak** falat tesz minden oldalra.
- Oldalanként: **Általános lejtők**, **Saját lejtők** (adjon meg egy bevágási és egy feltöltési lejtőt az adott oldalra) vagy **Függőleges (támfal)**.
- Lejtőt így írjon be: `3` vagy `3:1` (vízszintesen 1 függőlegeshez), `33%` vagy `18.4°`; a H:1 formában jelenik meg. A tereplépcső saját **Bevágási lejtő** és **Feltöltési lejtő** mezői ugyanezt fogadják.
- Egy függőleges oldalnak nincs töltése: egy támfal fut az él mentén, a tereplépcsőtől lefelé a meglévő talajig (feltöltésben), vagy a talajtól lefelé a tereplépcsőig (bevágásban). A **Falvastagság** (kezdetben 0,3 m vagy 1 ft) az a távolság, ameddig a talaj a tereplépcső széléből a meglévő talajig lépcsőzik. A bevágási és feltöltési térfogatokból kimarad az a töltés, amely az adott oldalról már nincs meg.
- Ahol egy fal találkozik egy lejtős oldallal, a lejtő a fal végét körbeöleli; két fal gérvágással találkozik.
- A mezők alatt látható: a falak hossza, a kitett felület (magasság × hossz), valamint a legmagasabb és az átlagos magasság.

A terv minden fal külső homlokzatát rövid vonalkákkal rajzolja meg, a két végén és a legmagasabb pontján pedig feltünteti a magasságot (a támfalak rétegén, amely DXF-be és DWG-be is kimegy). A 3D nézet a falakat testként mutatja (Megjelenítés › Támfalak), a GLB, OBJ és USD exportok pedig tartalmazzák őket. Az élen átmenő metszetek a lépcsőt mutatják.

**Figyelmeztetések** (a Tulajdonságokban és a Problémák panelen): egy fal, amely magasabb, mint a **Figyelmeztetés, ha a falmagasság meghaladja** érték (kezdetben 1,0 m vagy 3,3 ft), „lehet, hogy mérnöki falra vagy engedélyre van szükség; ellenőrizze a helyi szabályokat”; és – ha beír egy **Legmeredekebb lejtő, amelyet a talaj megáll** értéket – minden olyan oldal, amelynek bevágási vagy feltöltési lejtője ennél meredekebb. Ezek figyelmeztetések: a tereprendezés attól még elkészül. Minden változtatás egy lépés a {{key:Mod+Z}} visszavonásnál.

## Földtöltések

{{ui:Szintezés}} › {{ui:Földtöltés (berm)}}: olyan halom, amelynek teteje az alatta lévő átlagos talaj fölött a **Magasság** értékén áll, oldalai lejtősen simulnak ki.

## Vápák

{{ui:Szintezés}} › {{ui:Vápa (swale)}}, majd kattintson a vápa mentén **a víz folyásának irányában**, és nyomja meg az {{key:Enter}} billentyűt. Állítsa be a **Mélységét**, a **Fenékszélességét** (0 a V-alakhoz) és az **Oldallejtőjét**. Lejtés nélkül a feneke a talajt követi, attól a **Mélység** értékkel mélyebben, és sosem fut felfelé; ha lejtést ad meg, a kezdettől fogva egyenletes lejtést kap.

## Pontszintek és szintvonalak

1. {{ui:Szintezés}} › {{ui:Tereprendezési terület}}: kattintson annak a területnek a körvonalára, amelyet alakítani szeretne.
2. {{ui:Szintezés}} › {{ui:Pontmagasság}}: kattintson a területen belülre. Adja meg a magasságát a Tulajdonságokban, vagy használja a ▲ ▼ gombokat.
3. {{ui:Szintezés}} › {{ui:Szintvonal szerkesztése}}: kattintson a területen belüli szintvonalra, hogy átvegye, mint átformálható vonalat.

Jelöljön ki egy pontmagasságot vagy szintvonalat, és **húzza** a tervre (vagy a pontjait): a felület elengedéskor követi, egy visszavonási lépésként. A területen belül a terep a saját szélétől épül újra (ahol a meglévő talajjal találkozik), a pontmagasságokból és a szerkesztett szintvonalakból.

## Bevágás és feltöltés, élőben

Minden tereprendezési objektum Tulajdonságai mutatják a **Bevágást** és a **Feltöltést**, valamint az egész telek értékeit a Földmunkában használt rácsmódszerrel, ahogy módosítja őket. A problémák (a felületen kívül eső, vagy önmagát metsző körvonal) ott vannak felsorolva.

## Tereprendezés-ellenőrzések

A bal oldali **Tereprendezés-ellenőrzések** szakaszban:

- A **Lejtőelemzés** a felületet lejtés szerint színezi: a kedvező határig, a kettő között, és a meredek határnál meredekebb részekre (kezdetben 5% és 33,3%: a szokásos 1:20 az akadálymentes útvonalaknál és 1:3 a fűnyírásnál). A jelmagyarázat megmutatja, a terület mekkora része esik az egyes kategóriákba. A meredek területek a rajzlapokon is kinyomtatódnak.
- A **Lefolyónyilak és pangóvíz** megrajzolja, merre folyik a víz, és bejelöl minden helyet, ahol pangna, a mélységével együtt; a szakasz megmondja, hány ilyen hely van, a legmélyebbet és mennyi vizet tartanak.

Az ellenőrzések a tervezett felületet olvassák, ha bármi tereprendezés történt, különben a meglévő terepet.
