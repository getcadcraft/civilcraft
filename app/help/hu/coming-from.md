---
title: Átállás más polgári tervezőszoftverekről
summary: Hogyan feleltethetők meg a megszokott polgári tervezési munkafolyamatok a CivilCraftnak, és mely különbségek okoznak gondot a tapasztalt felhasználóknak az első órában.
keywords: átállás, migrálás, ismerős, különbségek, munkafolyamat, parancsok, leképezés, cogo, korridor, tereprendezés, csőhálózat, stílusok, parancssor
from: feae37d6
---

Ha már használta a Civil 3D-t, ismeri a CivilCraft gondolatait: pontok és pontcsoportok, TIN-felületek töréselemekkel és határvonalakkal, nyomvonalak PI-k szerint, hossz-szelvények PVI-k szerint, szelvények korridorokká söpörve, tereprendezés a felszínig, gravitációs csőhálózatok, LandXML. Ami más, az szinte minden más körülöttük: nincs rajzfájl, nincs parancssor (hacsak nem a {{ui:Klasszikus rajzolás}} menüstílust választja), nincsenek stílusok, nincs Prospector és nincsenek beállítási párbeszédpanelek. A CivilCraft egy kicsi, célzott eszköz a böngészőben, és ebben a verzióban egy teljes polgári csomag feladatainak töredékét végzi el. Ez az oldal megmutatja, mi felel meg annak, amit ismer.

:::tip
Ha szereti a Civil 3D szalagját, válassza a {{ui:Szalag (civil)}} menüstílust a {{ui:Beállítások}} › {{ui:CivilCraft}} › {{ui:Menük, billentyűk és egér}} alatt: Kezdőlap, Felületek, Módosítás, Geolokáció, Nézet és Kimenet lapok, a középső gomb nézetet tol, a {{key:Shift}} és a középső gomb pedig a 3D nézetet forgatja. Ha szeret parancsokat gépelni, a {{ui:Klasszikus rajzolás}} parancssort ad hozzá (ALIGNMENT, PAD, PROFILE, ZOOM …). Lásd: [Menük, billentyűk és egér](topic:menus-keys-and-mouse).
:::

## Munkafolyamat-térkép

| Amit szeretne elérni | A megszokott módja | A CivilCraftban |
|---|---|---|
| Felmérési pontok behozása | Pontfájlformátummal importálás | {{ui:Megnyitás}}, majd az oszlopsorrend ellenőrzése a **Pontok importálása** részben ([Felmérési pontok importálása](topic:import-points)) |
| Pontok rendezése | Pontcsoportok, leírási kulcsok | Automatikus csoportok a leírás első szava szerint; nincsenek leírási kulcsok |
| Pont szerkesztése | Pontszerkesztő, fogópontok | Kattintson rá, és írjon a Tulajdonságokban, vagy húzza ([Felmérési pont szerkesztése](topic:edit-points)) |
| A meglévő terep elkészítése | Felület létrehozása, pontcsoportok adatként | Automatikus: a felület újraépül, valahányszor a bemenetei változnak |
| Töréselemek hozzáadása | Töréselemek poligonvonalakból vagy jellemzővonalakból | Állítson egy pontcsoportot {{ui:Töréselő}} értékre, vagy kattintson pontokra a {{ui:Töréselő}} eszközzel ({{key:B}}) |
| A felület levágása | Külső határvonal, elrejtő határvonal, legnagyobb háromszöghossz | {{ui:Határvonal}} ({{key:O}}, csak külső) és a **Legnagyobb külső él** |
| Szintvonalak megjelenítése | Felületstílus | **Megjelenítés** a bal panelen: köz, főköz, feliratok, sávok, lejtőnyilak |
| Tengelyvonal kialakítása | Nyomvonal-létrehozó eszközök, ív- és spirálbeállítások | {{ui:Nyomvonal}} ({{key:A}}): kattintson a PI-kre, {{key:Enter}}; a sugarak és a spirálhosszak a PI-táblázatban vannak |
| Hossz-szelvény-nézet létrehozása | Hossz-szelvény varázsló, sávok | {{ui:Hossz-szelvény}} ({{key:R}}): egy hossz-szelvény-nézet a terv alatt, mindig illesztve |
| A lejtés megtervezése | Hossz-szelvény-elrendezési eszközök | {{ui:Kezdés a terepről}}, {{ui:PVI-k hozzáadása}} ({{key:I}}), PVI-k húzása, **Ív L** beírása |
| Út építése | Szerelvény, részszerelvények, korridor, célok, régiók | Jelölje be a **Szelvény söprése a tervezett hossz-szelvény mentén** lehetőséget a nyomvonal alatt; oldalanként egy sáv, váll és oldallejtő, vagy minden oldal alkotórészekből (szegélyvályú, szegély, járda …) |
| Tereplépcső kialakítása | Jellemzővonalak, tereprendezési csoportok, tereprendezési kritériumok | {{ui:Tereplépcső}} ({{key:G}}): sík tereplépcső bevágási és feltöltési lejtővel a felszínig |
| Földmunka kiszámítása | Térfogati felületek, térfogati műszerfal | **Földmunka** a jobb panelen, rácsmódszerrel, élőben frissül |
| Csapadékvíz- vagy szennyvízhálózat | Csőhálózat alkatrészlistával, szabályokkal | {{ui:Csövek}} ({{key:P}}): kattintson a műtárgyakra lefelé haladva; három szabály, amelyet Ön állít be; automatikus csatlakozási magasságok |
| Adatcsere másokkal | LandXML-import és -export | {{ui:Megnyitás}} egy LandXML-fájlt; {{ui:LandXML}} az exportáláshoz ([LandXML cseréje](topic:landxml)) |
| Vonalas rajz küldése CAD-be | Exportálás DWG-be | {{ui:DWG}} (2000–2018 formátum) vagy {{ui:DXF}} (R12) |
| Kinyomtatás | Elrendezések, nézetablakok, lapkészletek | {{ui:PDF}}: a terv egy fekvő lapja a választott méretarányban; terv- és hossz-szelvény-lapok, valamint keresztszelvény-lapok PDF-ben |
| Munka megosztása fájlok között | Adatparancsok, hivatkozások | Nem elérhető: egy fájlban egy projekt van |
| Visszavonás | Visszavonás | {{key:Mod+Z}} és {{key:Mod+Y}}, 200 lépés; a megjelenítési beállítások nem visszavonható lépések |

## Különbségek, amelyek megtévesztenek

**Nincs parancssor**, hacsak nem a {{ui:Klasszikus rajzolás}} menüstílust választja. Az eszközök eszköztárgombok és egybetűs billentyűk: {{key:A}} nyomvonal, {{key:G}} tereplépcső, {{key:P}} csövek, {{key:B}} töréselem, {{key:O}} határvonal, {{key:R}} hossz-szelvény, {{key:I}} PVI-k hozzáadása, {{key:V}} kijelölés, {{key:F}} illesztés. A többi menüstílusban a parancsnév begépelése nem tesz semmit. Lásd: [Billentyűk és egér](topic:keyboard).

**Az Enter befejez; a dupla kattintás kockázatos.** Kattintson egyszer az utolsó pontra, majd nyomja meg az {{key:Enter}} billentyűt. Ebben a verzióban a dupla kattintás is befejez, de a dupla kattintással megjelölt pontot eldobja. A jobb gombbal kattintás nem fejez be és nem ismétel; csak akkor tol, ha vele húz.

**Minden dinamikus, mindig.** Ha módosít egy pontcsoportot, egy sugarat, egy PVI-t vagy egy tereplépcső lejtését, a felület, a szintvonalak, a korridor, a bevágási vonalak és a térfogatok azonnal frissülnek. Nincs újraépítés, és semmi nem válik elavulttá.

**Semmi nem rajzobjektum.** A terv a tervezés nézete, nem olyan rajz, amelyet CAD-parancsokkal szerkeszthet. Nem adhat hozzá saját vonalakat vagy szöveget, nem változtathat réteg színét, és nem bonthat fel semmit. Exportálja DXF-be, és a rajzot egy CAD-programban fejezze be.

**Nincsenek stílusok.** A színek, vonalvastagságok, feliratméretek és rétegnevek rögzítettek (lásd: [Terv rétegei](topic:plan-layers)). Az alkalmazássávban a Papír és a Modell váltja a világos és a sötét képernyőt.

**Egy-egy belőle.** Egy meglévő terepfelület, egy kialakított eredmény, egy csőhálózat projektenként. Sok nyomvonal és tereplépcső rendben van.

**Az egységek csak címkék.** A {{ui:Amerikai láb}} vagy a {{ui:Méter}} kiválasztása nem vált át semmit. Nincs rajzi méretarány. A koordináta-rendszer nem kötelező: a {{ui:Koordináták}} alatt állítsa be; semmi nem mozdul el, csak azt mondja meg, mit jelentenek a számok (lásd: [A projekt koordináta-rendszerének beállítása](topic:coordinate-systems)). A lábat LandXML-be íráskor amerikai mérnöki lábként (US survey feet) kezeljük.

**A töréselemcsoportok pontszám szerinti sorrendben kapcsolódnak.** A {{ui:Töréselő}} értékre állított csoport egyetlen vonallá válik minden pontján át, a számok sorrendjében. A közös kódok (két folyásvonal, mindkettő „FL” kóddal) egy cikk-cakkos vonalat hoznak létre; ezeket kézzel rajzolja meg.

**A szelvények ugyanúgy néznek ki, a méter más.** A láb 100 ft-es szelvényeket használ (12+34.56); a méter 1000 m-es szelvényeket (1+234.567).

**Törlés Mac-en.** A delete feliratú Mac-billentyű a böngészőben Backspace-ként működik. A kijelölés törléséhez használja az Fn és a delete billentyűket, vagy a {{ui:Törlés}} gombot.

**A fájlok letöltések.** A {{ui:Mentés}} minden alkalommal `.civilcraft.json` fájlt tölt le; nincs „mentés a megnyitott fájl fölé”. A nem mentett munka másolata ebben a böngészőben marad meg ([Nem mentett munka helyreállítása](common:recover)). Pontfájl megnyitásakor a pontok kérdés nélkül lecserélődnek. Lásd: [Megnyitható, menthető és exportálható fájlok](topic:files).

**A szabályok a felhasználóé.** A csőhálózat szabályai és a korridor-szerelvény helykitöltő értékekkel indul, amelyek nem szabványosak. Állítsa be a saját értékeit, mielőtt bármelyik ellenőrzésben megbízna.

**A térfogatok rácsalapúak.** A bevágás és a feltöltés a két felület közötti finom rácsból adódik, a bevágási vonalakon belül, duzzadás vagy zsugorodás nélkül. Közel vannak a TIN–TIN térfogathoz, de nem azonosak vele.

## Ami hiányzik

Klotoidtól eltérő spirálok, úton mentén változó szerelvények, lejtős tereplépcsők, befolyónyílás-kapacitás és tározás, alkatrészkatalógusok, csövek a hossz-szelvényben, telekelrendezések és telekméretezés, legkisebb négyzetes kiegyenlítés és felmérési adatbázisok, DWG megnyitása, és még sok más. A teljes lista azzal, mit tegyen addig, a [Még nincs elkészítve](topic:not-built-yet) oldalon található.
