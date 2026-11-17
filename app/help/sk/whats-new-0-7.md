---
title: Novinky vo verzii 0.7 (staršie)
summary: CivilCraft 0.7 pridáva pracovný priestor Elektrické vedenia (nadzemné vedenia a podzemné káble s vlastnými knižnicami, previsnutie a napätie, kontroly vôle a pevnosti, tabuľky napínania, množstvá, listy a GIS), pracovný priestor Krajina (zoznam rastlín, plány výsadby a tabuľky, úpravy terénu, spevnené plochy, múry a schody, výpočtovú pomôcku pre zavlažovanie, listy krajiny a voľné objekty), hmoty budov s limitmi zónovania, ktoré zadáte, a hodinami slnka, klotoidné špirály, koridory zostavené z častí na každej strane, export USD a ďalšie nástroje pre asistentov AI.
keywords: novinky 0.7, staršie vydanie, poznámky k vydaniu, zoznam zmien, zmeny, 0.7, verzia, nové funkcie, krajina, pracovný priestor krajina, zoznam rastlín, rastliny, výsadba, tabuľka rastlín, záhon, živý plot, úpravy terénu, plošina, berma, odvodňovací žľab, bodová kóta, analýza sklonu, zaplavovanie, spevnená plocha, dláždenie, chodník, múr, obrubník, rampa, schody, zavlažovanie, postrekovač, kvapková závlaha, listy krajiny, voľný objekt, hmota budovy, hrubá podlažná plocha, zónovanie, odstup, obálka, rovina oblohy, koeficient podlažnej plochy, zastavanosť, hodiny slnka, tieň, ifc, rozpracovať v BimCraft, špirála, klotoida, prechod, zostava, obrubník, žľab, chodník, usd, asistenti, jednotky, portugalčina
from: 797d2f2f
---

Toto sa zmenilo v CivilCraft 0.7 oproti verzii 0.6. Najväčšie nové časti sú pracovné priestory Elektrické vedenia a Krajina a hmoty budov.

## Nové

### Pracovný priestor Krajina

- **Pracovný priestor Krajina na tom istom stavenisku.** {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}} pridá nástroje na výsadbu, úpravy terénu, spevnené plochy a zavlažovanie k staveniskú, ktoré už máte: tie isté body zamerania, povrchy a projektový súbor. Ak sa chcete vrátiť, v časti **Pracovný priestor** vyberte **Civil**. Pozri [Pracovný priestor Krajina](topic:landscape).
- **Zoznam rastlín.** Asi 420 bežných stromov, kríkov, živých plotov, tráv, trvaliek, pôdopokryvných rastlín a popínavých rastlín z mierneho a stredomorského pásma, s ich veľkosťami pri výsadbe a v dospelosti, pásmom odolnosti, svetlom, vodou a rozstupmi. Hľadajte podľa ľubovoľného názvu v angličtine, španielčine alebo portugalčine. Vlastný zoznam môžete importovať ako CSV; uloží sa s projektom. Vstavané veľkosti sú typické a zaokrúhlené: overte ich v miestnej škôlke. Pozri [Zoznam rastlín](topic:plant-list).
- **Plány výsadby.** {{ui:Plant}} umiestni jednotlivé rastliny, ktoré ležia na zemi a nasledujú neskoršie úpravy terénu, {{ui:Bed}} vyplní obrys v rozstupoch rastlín so zmesou podľa percent a {{ui:Hedge}} nastaví jeden alebo dva rady pozdĺž čiary. Rastliny sú na pláne označené. Pozri [Plány výsadby a tabuľky](topic:planting).
- **Tabuľka rastlín.** Viac › {{ui:Plant schedule…}} spočíta rastliny podľa druhu a veľkosti pri výsadbe. Uložte ju ako CSV alebo XLSX, alebo ju pošlite do TakeoffCraft na ocenenie. Pozri [Tabuľka rastlín](topic:planting#the-plant-schedule).
- **Úpravy terénu pre krajinu.** {{ui:Grade}} obsahuje plošiny (vodorovné alebo klesajúce), bermy, odvodňovacie žľaby a plochy úprav s bodovými kótami a vrstevnicami, ktoré ťaháte. Výkop a násyp sa zobrazujú počas práce. **Analýza sklonu** vyfarbí povrch podľa vašich dvoch limitov a **Šípky toku a zaplavovanie** ukáže, kde voda steká a kde by sa zadržala. Všetko sa dostane do rovnakého navrhovaného povrchu ako podložky a koridory. Pozri [Úpravy terénu pre krajinu](topic:landscape-grading).
- **Dláždenie, chodníky, múry, obrubníky, rampy a schody.** {{ui:Hardscape}} kreslí dláždenie s priečnym spádom alebo spádom k odvodnení, vzor a jeho vrstvy; chodníky, ktoré sledujú terén; oporné a samostatne stojace múry s odstupňovanými základmi; obrubníky; a rampy a schody kontrolované voči limitom, ktoré nastavíte. Oporný múr vyšší ako 1,2 m (4 ft) sa označí na kontrolu inžinierom. Pozri [Dláždenie, múry a schody](topic:hardscape).
- **Výpočtová pomôcka pre zavlažovanie.** {{ui:Irrigation}} umiestni postrekovače, bočné vetvy, hlavné potrubie, ventily, kvapkové vedenia a bod pripojenia. {{ui:Check the system…}} nájde zóny z potrubí a vypočíta prietok každej zóny, tlak potrebný pri jej ventile a pri prívode (Hazen–Williams), zrážky, časy behu, pokrytie a kusovník. Je to výpočtová pomôcka, nie certifikácia návrhu: každý výsledok musí skontrolovať projektant zavlažovania. Postrekovače sú všeobecné druhy alebo vaše vlastné zo súboru. Pozri [Návrh zavlažovania](topic:irrigation).
- **Listy krajiny.** Viac › {{ui:Landscape sheets…}} vytvorí plány výsadby, úprav terénu a zavlažovania s ich legendami a list podrobností s rezmi múrov, skladbami dláždenia a schodmi, ako jeden PDF súbor. Pozri [Listy krajiny](topic:landscape-sheets).
- **Voľné objekty.** Viac › {{ui:Freeform object…}} umiestni sieť STL, OBJ alebo položku knižnice vytvorenú v inej aplikácii, napríklad kvetináč alebo sochu. Stojí na zemi alebo do nej zapustí a jeho objem, plocha a pôdorys sa počítajú. Pozri [Voľné objekty](topic:freeform-objects).
- **Krajina v IFC.** Viac › {{ui:Export landscape IFC}} uloží rastliny (ako vegetáciu s ich vlastnosťami), spevnené plochy a voľné objekty ako IFC 4.3 pre model BIM. Pozri [IFC](topic:planting#ifc).
- **Od začiatku do konca.** [Navrhnite záhradu od začiatku do konca](topic:landscape-walkthrough) prejde celý pracovný priestor na vzorovom stavenisku.

### Pracovný priestor Elektrické vedenia

- **Nadzemné vedenia a podzemné káble na vašom stavenisku.** {{ui:Surface}} › {{ui:More}} › {{ui:Power lines workspace}}: nakreslite vedenie podľa jeho podpier, káble v výkopoch, zariadenia a prekážky, na tom istom teréne a v tom istom projektovom súbore. Pozri [Pracovný priestor Elektrické vedenia](topic:power-lines).
- **Vaše vlastné knižnice.** Vodiče, káble, podpery, zariadenia (priečniky, izolátory, armatúry, kotvy, transformátory, skrine, spoje) a typy výkopov, v kategóriách, ktoré pomenujete, zdieľané ako súbor alebo tabuľka. Žiadny katalóg krajiny ani výrobcu nie je vstavaný; príklady sú označené ako príklady. Pozri [Vaša knižnica vedení](topic:power-line-library).
- **Previsnutie a napätie pri vašich zaťažovacích prípadoch.** Teplota, vietor, námraza a námraza na jednej strane; limity napätia ako podiel pevnosti v pretrhnutí; presná reťazovka na každom poli vrátane svahov; tabuľky napínania. Pozri [Previsnutie a napätie](topic:sag-and-tension).
- **Kontroly, vždy aktuálne.** Vôľa nad terénom a prekážkami, rozstup fáz, výkyv izolátorov, vztlak, zaťaženia podpier s dimenzovaním podľa vašej knižnice, kotvy, armatúry, základy, chýbajúce údaje, odpojené káble, preťaženia a úbytok napätia, označené na pláne aj na profile vedenia. Pomôcka pre návrh: kontroluje ju inžinier. Pozri [Kontroly vedení](topic:power-line-checks).
- **Tabuľky, listy a GIS.** Tabuľky napínania a podpier, množstvá (CSV, Excel, TakeoffCraft), listy pôdorysu a profilu so štúdiou v jednom PDF, vrstvy GIS so všetkými údajmi o každom prvku. Pozri [Tabuľky, množstvá, listy a GIS vedení](topic:power-line-outputs).
- **Po prvých pokusoch.** Profil vedenia sleduje vedenie, ktoré vyberiete, má zoznam **Vedenie** a odčíta terén, vodič a vôľu pod kurzorom a meria medzi dvoma bodmi. Rastliny a múry krajiny sa pri vedeniach počítajú ako prekážky; trasy káblov a potrubia sa zobrazujú v profile vedenia a križujú sa s pravidlom vôle, ktoré si zvolíte; **Pravidlá…** vedľa každej vôle otvorí vaše vlastné pravidlá; a sady pravidiel s knižnicou sa ukladajú ako balíky, ktoré možno zdieľať podľa krajiny. Pozri [Kontroly vedení](topic:power-line-checks) a [Balíky](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Vaše vlastné formáty súborov.** Vedenia sa ukladajú do projektového súboru CivilCraft, knižnice v `.cclines.json` alebo CSV, sady pravidiel a balíky vo vlastných JSON súboroch: otvorené formáty, ktoré môže čítať alebo previesť ktokoľvek. Súbor štúdie `.DON` je doplnkový import a export k nim.
- **Súbory štúdií (.DON), netestované.** Uložte vedenie ako súbor štúdie `.DON` pre iný program na vedenia alebo načítajte podpery z neho; vytvorené z názvov polí formátu, zatiaľ netestované s týmto programom. Pozri [Súbory štúdií](topic:power-line-study-file).

### Meranie

- **Nástroj Meranie.** {{ui:Surface}} › {{ui:More}} › {{ui:Measure}} (alebo {{key:M}}) meria na pláne: dĺžku a smer každej strany, bežiaci súčet, dĺžku po zemi a sklon, a plochu a obvod, keď uzavriete tvar. Do projektu sa nič nekreslí. Pozri [Meranie](topic:measure).

### Hmoty budov

- **Kreslenie hmôt budov.** V Vlastnostiach, v časti **Hmoty budov**, {{ui:Draw a mass}} (tiež {{ui:Surface}} › {{ui:More}} › {{ui:Masses}}). Dajte hmote podlažia a výšku podlažia a odčítajte jej hrubú podlažnú plochu. Vyberte, ako sedí na svahovitom teréne (odstupňovaná, podstavec alebo výkop) a pozrite násyp a výkop. Hmoty sa zobrazujú na pláne, v PDF a v DWG a DXF na vlastných vrstvách. Pozri [Kreslenie hmôt budov na stavenisku](topic:building-masses).
- **Tlačenie a ťahanie v 3D.** V 3D pohľade ťahajte strechu vybranej hmoty alebo stlačte {{key:PageUp}} a {{key:PageDown}}, aby ste ju menili po jednom podlaží, v jednom kroku späť. **Slnko** vrhá tiene hmôt. Pozri [V 3D pohľade](topic:building-masses#in-the-3d-view).
- **Limity zónovania, ktoré zadáte.** Odstupy riadok po riadku od uličnej čiary, výškový limit, rovina expozície oblohy, koeficient podlažnej plochy a zastavanosť. Zastavateľná obálka sa kreslí na pláne a každá hmota dostane značku alebo krížik pre každý limit. CivilCraft nemá v sebe žiadny stavebný poriadok: každé číslo zadáte vy zo svojho nariadenia. Pozri [Kontrola hmôt voči limitom zónovania, ktoré zadáte](topic:zoning-limits).
- **Hodiny slnka.** Vyberte deň alebo ročné obdobie a časové pásmo podľa názvu alebo posunu a odčítajte hodiny priameho slnka na každej stene každej hmoty, podlažie po podlaží, a na okolitom teréne, zobrazené na pláne. Steny a terén uložte ako CSV. Projekt potrebuje súradnicový systém. Pozri [Určenie hodín slnka na stavenisku](topic:sun-hours).
- **Hmoty ako IFC a ďalej do BimCraft.** {{ui:Masses as IFC}} uloží hmoty ako IFC4, umiestnené na mape, keď má projekt súradnicový systém. {{ui:Develop in BimCraft}} otvorí BimCraft na novej karte s hmotami, kde **Rozpracovať túto hmotu** vytvorí steny na každom podlaží a podlahu z pôdorysu. Nič sa nenahráva. Pozri [Odoslanie ďalej](topic:building-masses#send-it-on).

### Trasovanie

- **Klotoidné špirály.** Zadajte dĺžku do **Špirála vstup** a **Špirála výstup** v tabuľke PI pre oblúk: dotyčnica, špirála, oblúk, špirála, dotyčnica, s rovnakými alebo rôznymi dĺžkami. Na pláne sa označujú TS, SC, CS a ST, zoznam oblúkov udáva θs a dotyčnicové a vonkajšie vzdialenosti a staničenia a odsadenia prechádzajú špirálami. Pozri [Špirály](topic:alignment#spirals).
- **Špirály v LandXML.** LandXML zapisuje a číta klotoidné špirály. Trasy so špirálami, ktoré CivilCraft pri importe dovtedy preskakoval, sa teraz otvoria. Pozri [Výmena LandXML](topic:landxml).

### Koridory

- **Zostavenie každej strany z častí.** Zapnite **Zostaviť každú stranu z častí**, aby každá strana mala vlastný zoznam od osi smerom von: jazdné pruhy, krajnicu, žľab, obrubník, pás výsadby, chodník a bočný svah s vlastným výkopom a násypom. Začnite z {{ui:Rural road}} alebo {{ui:Urban street}} a skopírujte jednu stranu na druhú. Priečne rezy označujú čiaru toku, obrubník a chodník a upravený povrch má obrubník. Pozri [Zostavenie každej strany z častí](topic:corridor#build-each-side-from-parts).
- **Prevýšenie cez špirály.** Na oblúku so špirálami sa rozbeh prevýšenia odohráva cez špirálu: vodorovný hrebeň v TS, plné prevýšenie v SC. Pozri [Prevýšenie](topic:corridor#superelevation).

### Súbory 3D

- **Export USD.** V 3D pohľade {{ui:USD}} zapíše stavenisko ako `.usda`, `.usdc` alebo `.usdz` v skutočnej mierke a v súradniciach projektu: povrchy, potrubia a stavby ako siete, čiary, každá trasa a body zamerania s ich číslami. Pozri [Export 3D stavenisko ako USD](topic:usd).

### Asistenti AI

- **Viac pre asistentov.** Ak sú asistenti zapnutí v {{ui:Settings}} › {{ui:CivilCraft}}, asistent teraz môže čítať aj parcely, výkop a násyp a profily, pridávať body zamerania, ukladať projekt, exportovať LandXML, DWG a USD a pracovať v priečinkoch, ktoré zvolíte v CadCraft Studio. Pracovný priestor Krajina pridáva nástroje na hľadanie rastlín, umiestňovanie rastlín, záhonov a živých plotov, úpravy terénu a kontrolu zavlažovania. Server súborov a príkazový riadok `cadcraft` otvárajú uložené projekty bez okna. Pozri [Nechajte AI asistenta pracovať s vaším staveniskom](topic:assistants).

## Vo všetkých aplikáciách

- **Jednotky.** {{ui:Settings}} › {{ui:General}} › {{ui:Units}} má po jednom zozname pre dĺžku, plochu, objem, uhol a sklon, s presnými veľkosťami podľa definícií jednotiek (americká prieskumná stopa je vlastná jednotka). Vypnite jednotky, ktoré nikdy nepoužívate, a zmiznú zo zoznamov; označte jednu hviezdičkou a nová práca sa začne v nej. Súbor si vždy ponechá svoju jednotku. V CivilCraft sa zoznam **Jednotky** projektu riadi prepínačmi; hviezdička dĺžky spustí nové projekty v metroch (inak v stopách, ktoré sú americké prieskumné stopy), hviezdička plochy alebo objemu nastaví jednotku, v ktorej sa plochy a objemy udávajú, a pole dĺžky prijme značku ľubovoľnej jednotky, napríklad `3 ch` alebo `450 mm`. Pozri [Jednotky, zadané hodnoty a zoznamy jednotiek](common:unit-lists).
- **Hustejšie rozloženie a panely, ktoré sa dajú schovať.** {{ui:Settings}} › {{ui:General}} › {{ui:Layout density}} › {{ui:Compact}} zmestí na obrazovku viac (dotykové obrazovky a telefóny si zachovajú veľké tlačidlá). Každý bočný panel má štíhlu lištu s názvom: potiahnite ju, aby sa panel ukotvil alebo plával, pustite ju na lištu iného panela, aby sa jeden rám zdieľal ako karty, pripnite ho, aby sa zasunul k okraju, alebo ho skryte a vráťte z okraja. Pozri [Usporiadanie panelov](common:arrange-panels#make-the-layout-denser).
- **Dialógy sa dajú presúvať.** Potiahnite dialóg za lištu s názvom mimo cesty kresby; vráti sa tam, kde ste ho nechali. Dvojitým kliknutím na lištu s názvom ho znova vycentrujete. Pozri [Presun dialógu](common:arrange-panels#move-a-dialog).
- **Recepty pre asistentov AI.** Desať prepracovaných požiadaviek pre vášho asistenta (upraviť výkres, vykresliť sadu, skontrolovať výkresy, položiť otázky modelu, sčítať výkaz výmer, vyskúšať variant súčiastky…), každá s nástrojmi, ktoré volá, a oprávneniami, ktoré potrebuje, a každá prehraná našimi testami. Aplikácie neobsahujú žiadnu AI. Pozri [Recepty pre asistentov AI](common:assistants-recipes).
- **Jazyky.** **Português (Portugal)** je nový v {{ui:Settings}} › {{ui:General}} › {{ui:Language}}. Ten, **Português (Brasil)**, **Español (México)** a **Bahasa Indonesia** teraz majú každé slovo aplikácií, ako koncepty, ktoré ešte neprečítal rodený hovorca. Témy pomocníka sú v angličtine, niekoľko v španielčine.
- **CadCraft Studio** povie, prečo kontrola aktualizácie zlyhala (zatiaľ žiadny súbor pre váš systém, žiadna sieť, zlý podpis), namiesto len „Hotovo“, a prestane znova zobrazovať kartu Novinky, ktorú ste zavreli, kým nebude novšie vydanie.

## Ešte nie je v tejto verzii

- **0.7 nie je podpísaná kódom.** Podpisovanie a balík Microsoft Store sa presunuli do verzie 0.8, lebo overenie certifikátu zatiaľ neprišlo. Skontrolujte SHA-256 pri každom súbore na getcadcraft.com/download. Vo Windows, ak SmartScreen zastaví inštalátor, zvoľte {{ui:More info}}, potom {{ui:Run anyway}}. Na Macu pri prvom spustení kliknite pravým tlačidlom na CadCraft Studio a zvoľte {{ui:Open}}. CadCraft Studio zatiaľ nie je v obchode s aplikáciami a zatiaľ neexistuje zostava pre iPad ani iPhone.
- Zoznamy uhlov a sklonov v {{ui:Units}} sa ukladajú, ale zatiaľ ich žiadne pole nečíta.
- Postrekovače od výrobcov: iba všeobecné postrekovače a vaše vlastné zo súboru. Údaje výrobcov sa dostanú dovnútra len s ich súhlasom a zatiaľ žiadny nebol udelený.
- BimCraft a ModelCraft obsahujú zoznam rastlín, ale ich Umiestniť z knižnice zatiaľ rastliny neponúka. Rastliny sa do BimCraft dostanú cez IFC krajiny.
- Nástroje krajiny pre asistentov fungujú s otvoreným oknom CivilCraft; server súborov a príkazový riadok ich zatiaľ nemajú.
- Hmoty budov: žiadne denné svetlo ani vietor na fasáde, žiadny tieň od stromov ani od čohokoľvek, čo nie je nakreslené ako hmota, žiadne tvary striech a hodiny slnka sa zobrazujú na pláne, nie v 3D pohľade. Rozpracovať v BimCraft vytvorí len obyčajné steny a podlahu, bez otvorov a strechy.
- Vedenia: žiadna štandardná norma krajiny nie je vstavaná (zaťažovacie prípady, limity a vôle nastavujete vy); žiadne štúdie tečenia vodičov, tepelného zaťaženia zakopaných káblov, skratu, ochrany ani uzemnenia; žiadne vedenia v 3D pohľade ani v IFC. Súbor štúdie `.DON` nebol testovaný s programom, ktorý ho číta.
- Špirály iné ako klotoidné, špirála medzi dvoma oblúkmi a špirály v čiarach prvkov. Špirály boli overené voči vzorcom a schéme LandXML, zatiaľ nie voči súboru LandXML so špirálami z iného programu.
- Zostavy koridorov, ktoré sa menia pozdĺž cesty, regióny a ciele pre bočný svah.
- Vodovodné potrubia a tlakové siete (ďalšie stavebné dielo), prietoky meniace sa v čase a prepojenia medzi vodovodnými a dažďovými sieťami.
- Oblúky v nakreslených zlomových čiarach. Štandardné tabuľky návrhových vozidiel: päť dodaných vozidiel je označených ako zástupné. Čiary prvkov zdieľané medzi projektmi čakajú na tímové projekty.

Všetko ostatné je v [Ešte nie je hotové](topic:not-built-yet).
