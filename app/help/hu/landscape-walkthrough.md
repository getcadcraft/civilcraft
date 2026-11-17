---
title: Kert tervezése az elejétől a végéig
summary: A tájépítész tíz lépése a felméréstől a közzétételi készletig, azzal, amit a Tájépítészeti munkaterület az egyes lépésekhez ma tesz, és amit még nem tesz.
keywords: oktatóanyag, bemutató, hogyan, kerttervezés, tájtervezés, első lépések, példa, minta, lépésről lépésre, felmérés, vonalrajz, terep, ültetés, kimutatás, lapok, közzététel, egy projekt
from: 87900bf5
---

A tájtervezés körbe jár: felmérés, vázlat, vonalrajz, terep, területek, szintek, ültetés, kimutatások, lapok, aztán vissza. Ez a tíz lépés, és az, ami az egyes lépésekhez létezik. Ahol egy lépésnél hiány van, az a végén a **Még nincs elkészítve** részben van megnevezve, nem elrejtve a lépésben.

Követheti a mintatelken, vagy a saját felmérési rajzán. A sajátjánál kezdje az 1. lépéssel.

## 1. A felmérés behozása

{{ui:Felület}} › {{ui:Vonalrajz egy rajzból…}}, válassza ki a felmérési rajzot (DWG 2000–2018 vagy DXF). Ellenőrizze a mértékegységeket, vegye át a szintvonalakat, a 3D polivonalakat és a határt a felülethez, a ponttömböket pedig felmérési pontként. A **Felmérési szintek és ellenőrzés** rész a szövegként vagy attribútumként írt szinteket olvassa be, és felsorolja, ami gyanúsnak tűnik (mértékegységek, koordináta-rendszer, távolság a nullponttól, lapos szintvonalak, furcsa szintek, duplázott pontok), mielőtt bármit hozzáadna. Lásd [Felmérési rajz ellenőrzése importáláskor](topic:survey-check) és [DWG vagy DXF megnyitása vonalrajzként](topic:open-dwg-dxf). A koordináta-rendszert a {{ui:Koordináta-rendszer…}} paranccsal állítsa be.

## 2. Kézi vázlatok

Papíron készült lap, például egy régi felmérés vagy egy bejelölt másolat, a {{ui:Beolvasás…}} paranccsal érkezik (Indítás beolvasásból): léptékhelyesen vagy ismert koordinátákon kerül az alaprajz alá, és vonalrajzzá lehet rajzolni rajta. A ModelCraft beolvassa a kézi vázlat fényképét (Fájl › Vázlatfotó importálása…). Magában a CivilCraftban nincs eszköz a kézi vázlatokhoz: helyezze a lapot az alaprajz alá, és rajzoljon rá.

## 3. A vázlatból vonalrajz

Rajzoljon tervezővonalakat és körvonalakat a felmérésre a CivilCraftban, vagy a 2D rajzban. Tájépítészet › {{ui:Továbbiak}} › {{ui:Vonalból}} a vonalat burkolattá, ültetett területté, falakká, lépcsőkké, tervezővonallá és egyéb elemekké alakítja, összekapcsolva: ha mozgatja a vonalat, az objektum követi. Lásd [Vonalból készült objektumok](topic:objects-from-lines). A SuperCad Studio-ban nyissa meg a telket, a rajzot és az épületmodellt egy projektben: a **Tájépítészeti munkaterület** tartalmazza mindegyik eszközét, és a 2D rajzban kijelölt vonal tájépítészeti objektummá válhat, amely követi azt (Ctrl+K, {{ui:Tájépítészeti objektum a kijelölt rajzvonalból}}).

## 4. A tervezett terep

Nyissa meg a {{ui:Felület}} › {{ui:Továbbiak}} › {{ui:Tájépítészeti munkaterület}} menüpontot. Építse meg a tervezett terepet a {{ui:Emelvény}}, a {{ui:Földtöltés (berm)}} és a {{ui:Vápa (swale)}} elemekkel, a tereprendezési területeket pedig pontszintekkel és szintvonalakkal; a hozzáadott burkolatok, sétányok, falak, rámpák és lépcsők ugyanabba a tervezett felületbe illeszkednek. A meglévő terep soha nem változik. A {{ui:Szintek}} › {{ui:Talajmódosítók…}} gomb egy sorrendben felsorolja mindazt, ami alakítja a terepet, mindegyiket a bevágással és feltöltéssel. Lásd [Tereprendezés](topic:landscape-grading) és [Talajmódosítók és élő szintek](topic:ground-modifiers).

## 5. Burkolatok és ültetett területek

{{ui:Burkolt felületek}} › {{ui:Burkolat}}, {{ui:Sétány}}, {{ui:Fal}}, {{ui:Szegély}}, {{ui:Rámpa}} és {{ui:Lépcsőfokok}}. A {{ui:Területek}} paranccsal gyepet, ágyást, rétet vagy talajtakaró növényzetet rajzolhat a rétegrendjével; a burkolatok, falak és lépcsők körül magától levágja magát. Az {{ui:Ágy}} a növények távolságában tölti ki a területet, a megadott növénykeverékből. Lásd [Burkolt felületek](topic:hardscape), [Ültetett területek](topic:planted-areas) és [Ültetés](topic:planting).

## 6. Szintek, lejtők és csatlakozások

A **Tereprendezési ellenőrzések** alatt jelölje be a **Lejtésanalízis** és a **Lefolyásnyilak és vízállás** lehetőséget. Ha víz áll egy teraszfal mellett, adjon hozzá egy {{ui:Vápa (swale)}} elemet köré. A Tulajdonságok megmutatják, hány lépcsőfok kell a lépcsőhöz, és beleférnek-e, valamint hol túl meredek egy sétány a határértékéhez képest. A Problémák panel felsorolja, hol találkoznak rosszul az objektumok: túl magas fal, ágyás a burkolat fölött, lépcsők, amelyek nem érik el a pihenőt. A {{ui:Pontszint}} és a {{ui:Lejtésnyíl}} megjelöli a terepet, és magától frissül.

## 7. Ültetés

A **Növények** részben keresse meg a növénylistát (néhány száz faj, vagy a saját listája), válasszon egyet, majd a {{ui:Növény}}, {{ui:Ágy}} vagy {{ui:Sövény}} paranccsal helyezze el. A növény méretét és feliratait a {{ui:Továbbiak}} alatt állítsa be. A {{ui:Továbbiak}} › {{ui:Növénytábla}} a saját rekordjait szerkeszti: fajták, szállított méretek, sűrűség, specifikációs megjegyzések. Minden rekordhoz tartozhat saját jel és 3D-modell (OBJ, STL vagy GLB), a {{ui:Továbbiak}} › {{ui:Növénygrafika}} pedig egyszerűbben rajzolja a növényeket a nagyobb léptékeknél. Lásd [A növénylista](topic:plant-list), [Növényrekordok](topic:plant-records) és [Növénygrafika](topic:plant-graphics).

## 8. Mennyiségek és kimutatások

{{ui:Továbbiak}} › {{ui:Munkalapok}}: az ültetési és a burkolati kimutatások, valamint a sajátjai, az objektumokhoz kapcsolva maradnak; mentse őket CSV vagy XLSX formátumban, vagy tegye őket a lapokra (lásd [Munkalapok](topic:worksheets)). A {{ui:Továbbiak}} › {{ui:Növénykimutatás…}} a darabszámokat a TakeoffCraftnak küldi. A burkolati mennyiségek a burkolat, a fal és a lépcső Tulajdonságaiban vannak. Az öntözésnek saját anyagjegyzéke van: {{ui:Öntözés}} › **A rendszer ellenőrzése…**. Lásd [Öntözés](topic:irrigation).

## 9. Rajzok és lapok

{{ui:Továbbiak}} › {{ui:Tájépítészeti lapok…}}: ültetési, tereprendezési és öntözési tervek, részletekkel. {{ui:Szintek}} › {{ui:Metszetvonal}} metszeteket rajzol a terepen, falakon, rétegrendeken, lépcsőkön és növényeken át. Lásd [Tájépítészeti lapok](topic:landscape-sheets) és [Metszetek és a közzétételi készlet](topic:landscape-sections).

## 10. Közzététel

A lapok párbeszédpanelen a {{ui:Közzétételi készlet (.zip)}} egy PDF-et készít lapjegyzékkel, és laponként egy DWG-t. A {{ui:Továbbiak}} › {{ui:Tájépítészeti IFC exportálása}} a növényeket és a burkolatokat adja át a BimCraftnak. Mentse el a projektet: minden egyetlen fájlban van.

## Egy módosítás: a lépcsősor

A lényeg az, hogy minden egy projektben van, így a változtatás végigvonul. Próbálja ki egy lépcsősoron két terasz között:

1. Rajzolja meg a lépcsősor vonalát tervezővonalként (vagy vonalként a rajzban), majd Tájépítészet › {{ui:Továbbiak}} › {{ui:Vonalból}} › {{ui:Lépcsőfokok}}. A lépcsők Tulajdonságainál jelölje be a **Megváltoztatja a terepet** lehetőséget, és állítsa be az alsó és a felső szintet a két teraszra.
2. Rajzoljon ültetett ágyást a lépcsősor mellé és alá a {{ui:Területek}} paranccsal, a teraszokra pedig burkolatot. Az ágyás a lépcsők és a burkolat köré igazítja magát, a növénykimutatás pedig csak az ültetett darabokat számolja.
3. Emelje a lépcsősor felső szintjét a Tulajdonságokban. A tervezett terep, a pontszintek, a lejtésnyilak és a bevágás–feltöltés azonnal változik. Ha a lépcsősor már nem éri el a felső teraszt, a Problémák panel megmondja, mennyivel.
4. Mozgassa a lépcsősor vonalát. A lépcsők ugyanabban a visszavonási lépésben követik a vonalukat; az ágyás újra levágja magát és újraszámolódik, a munkalapok és a kimutatások pedig az új számokat mutatják.
5. Nyomja meg egyszer a Ctrl+Z billentyűkombinációt: a vonal, a lépcsők, a terep és az ágyás együtt tér vissza.

Lásd [Talajmódosítók és élő szintek](topic:ground-modifiers), [Ültetett területek](topic:planted-areas) és [Munkalapok](topic:worksheets).

## Még nincs elkészítve

Ezeket kérték, de ebben a kiadásban nincsenek benne:

- Falak, amelyek alakítják a terepet (jelzik, hol találkoznak vele, a tetejük pedig követheti).
- A saját Könyvtár-növénylista szerkesztése az appban (szerkessze a projekt listáját, és mentse növényfájlként).
- A saját GLB növénymodelljeinek textúrái és színei (az alakjukat beolvassa, a növény színét pedig a program használja).

Lásd [A Tájépítészeti munkaterület](topic:landscape) az összes eszközért.
