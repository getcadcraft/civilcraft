---
title: Čo je nové vo verzii 0.7
summary: CivilCraft 0.7 pridáva pracovný priestor Elektrické vedenia (nadzemné vedenia a podzemné káble s vlastnými knižnicami, prevísanie a ťah, kontroly odstupov a pevnosti, tabuľky napínania, výmery, listy a GIS), pracovný priestor Krajina (zoznam rastlín, výsadbové plány a zoznamy, úpravy terénu pre krajinu, spevnené plochy, múry a schody, pomôcka na výpočet zavlažovania, listy krajiny a voľné objekty), hmoty budov s limitmi regulácie, ktoré zadáte, a hodinami slnka, klotoidné prechodnice, koridory zostavené z častí na každej strane, export USD a ďalšie nástroje pre asistentov s AI.
keywords: čo je nové, novinky, poznámky k vydaniu, zoznam zmien, zmeny, 0.7, verzia, nové funkcie, krajina, pracovný priestor krajina, zoznam rastlín, rastliny, výsadba, zoznam výsadby, záhon, živý plot, úpravy terénu, plošina, val, priekopa, kóta bodu, analýza sklonu, zatopenie, spevnené plochy, dláždenie, chodník, múr, obrubník, rampa, schody, zavlažovanie, postrekovač, kvapkovanie, listy krajiny, voľný objekt, hmota budovy, hmoty, hrubá podlažná plocha, regulácia, odstup, obálka, rovina oslnenia, index podlažnej plochy, zastavanosť, hodiny slnka, tieň, ifc, rozpracovať v bimcraft, prechodnica, klotoida, zostava, žľab, chodník, usd, asistenti, jednotky, portugalčina
from: 3c9d79db
---

Toto sa zmenilo v CivilCraft 0.7 v porovnaní s 0.6. Najväčšie novinky sú pracovné priestory Elektrické vedenia a Krajina a hmoty budov.

## Nové

### Pracovný priestor Krajina

- **Pracovný priestor Krajina na tom istom stavenisku.** {{ui:Povrch}} › {{ui:Viac}} › {{ui:Pracovný priestor Krajina}} pridá nástroje výsadby, úprav terénu, spevnených plôch a zavlažovania k stavenisku, ktoré už máte: tie isté zamerané body, povrchy a súbor projektu. Voľbou **Civil** pod **Pracovný priestor** sa vrátite. Pozrite [Pracovný priestor Krajina](topic:landscape).
- **Zoznam rastlín.** Asi 420 bežných stromov, kríkov, živých plotov, tráv, trvaliek, pôdopokryvných rastlín a popínavých rastlín mierneho a stredomorského pásma s ich veľkosťami pri výsadbe a v dospelosti, zónou mrazuvzdornosti, svetlom, vodou a rozstupmi. Hľadajte podľa ľubovoľného názvu po anglicky, španielsky alebo portugalsky. Importujte vlastný zoznam ako CSV; uloží sa s projektom. Zabudované veľkosti sú typické a zaokrúhlené: overte ich v miestnej škôlke. Pozrite [Zoznam rastlín](topic:plant-list).
- **Výsadbové plány.** {{ui:Rastlina}} umiestni jednotlivé rastliny, ktoré sedia na teréne a sledujú neskoršie úpravy, {{ui:Záhon}} vyplní obrys v rozstupoch rastlín so zmesou podľa percent a {{ui:Živý plot}} nastaví jeden alebo dva rady pozdĺž čiary. Rastliny sú v pôdoryse popísané. Pozrite [Výsadbové plány a zoznamy](topic:planting).
- **Zoznam rastlín na výsadbu.** Viac › {{ui:Zoznam rastlín…}} spočíta rastliny podľa druhu a veľkosti pri výsadbe. Uložte ho ako CSV alebo XLSX alebo ho pošlite do TakeoffCraft na ocenenie. Pozrite [Zoznam výsadby](topic:planting#the-plant-schedule).
- **Úpravy terénu pre krajinu.** {{ui:Úpravy terénu}} má plošiny (vodorovné alebo spádové), valy, priekopy a plochy úprav s kótami bodov a vrstevnicami, ktoré ťaháte. Výkop a násyp sa zobrazujú priebežne. **Analýza sklonu** vyfarbí povrch podľa vašich dvoch limitov a **Šípky toku a zatopenie** ukazuje, kam voda steká a kde by sa zdržala. Všetko ide do toho istého navrhovaného povrchu ako plošiny a koridory. Pozrite [Úpravy terénu pre krajinu](topic:landscape-grading).
- **Dláždenie, chodníky, múry, obrubníky, rampy a schody.** {{ui:Spevnené plochy}} kreslia dláždenie s priečnym sklonom alebo spádom k odtoku, vzorom a vrstvami; chodníky, ktoré sledujú terén; oporné a voľne stojace múry so stupňovitými základmi; obrubníky; a rampy a schody kontrolované podľa limitov, ktoré nastavíte. Oporný múr nad 1,2 m (4 ft) je označený pre statika. Pozrite [Dláždenie, múry a schody](topic:hardscape).
- **Pomôcka na výpočet zavlažovania.** {{ui:Zavlažovanie}} umiestni hlavice, rozvody, hlavné potrubie, ventily, kvapkacie vedenia a miesto napojenia. {{ui:Skontrolovať systém…}} nájde zóny z potrubí a vypočíta prietok každej zóny, tlak potrebný na jej ventile a na prívode (Hazen–Williams), zrážkový úhrn, časy chodu, pokrytie a kusovník. Je to pomôcka na výpočet, nie certifikácia návrhu: každý výsledok overí projektant zavlažovania. Hlavice sú všeobecné druhy alebo vaše vlastné zo súboru. Pozrite [Návrh zavlažovania](topic:irrigation).
- **Listy krajiny.** Viac › {{ui:Listy krajiny…}} vytvorí plány výsadby, úprav terénu a zavlažovania s ich legendami a list detailov rezov múrov, skladieb dláždenia a schodov, ako jedno PDF. Pozrite [Listy krajiny](topic:landscape-sheets).
- **Voľné objekty.** Viac › {{ui:Voľný objekt…}} umiestni sieť STL, OBJ alebo položku knižnice vytvorenú v inej aplikácii, napríklad kvetináč alebo sochu. Sedí na teréne alebo sa doň zarezáva a jej objem, plocha a pôdorys sa započítajú. Pozrite [Voľné objekty](topic:freeform-objects).
- **IFC krajiny.** Viac › {{ui:Exportovať IFC krajiny}} uloží rastliny (ako vegetáciu s ich vlastnosťami), spevnené plochy a voľné objekty ako IFC 4.3 pre model BIM. Pozrite [IFC](topic:planting#ifc).
- **Od začiatku do konca.** [Návrh záhrady od začiatku do konca](topic:landscape-walkthrough) prevedie celým pracovným priestorom na ukážkovom stavenisku.

### Pracovný priestor Elektrické vedenia

- **Nadzemné vedenia a podzemné káble na vašom stavenisku.** {{ui:Povrch}} › {{ui:Viac}} › {{ui:Pracovný priestor Elektrické vedenia}}: nakreslite vedenie podľa jeho stožiarov, káble v ryhách, zariadenia a prekážky, na tom istom teréne a v tom istom súbore projektu. Pozrite [Pracovný priestor Elektrické vedenia](topic:power-lines).
- **Vlastné knižnice.** Vodiče, káble, stožiare, zariadenia (traverzy, izolátory, armatúry, vzpery, transformátory, skrine, spojky) a typy rýh, v kategóriách, ktoré pomenujete, zdieľané ako súbor alebo tabuľka. Nie je zabudovaný katalóg žiadnej krajiny ani výrobcu; príklady uvádzajú, že sú príklady. Pozrite [Vaša knižnica elektrických vedení](topic:power-line-library).
- **Prevísanie a ťah podľa vašich zaťažovacích prípadov.** Teplota, vietor, námraza a námraza na jednej strane; limity ťahu ako podiel na medzi pevnosti; presná reťazovka v každom poli, vrátane sklonov; tabuľky napínania. Pozrite [Prevísanie a ťah](topic:sag-and-tension).
- **Kontroly vždy aktuálne.** Odstup nad terénom a prekážkami, rozstup fáz, rozkmit izolátorov, zdvih, zaťaženia stožiarov s dimenzovaním z vašej knižnice, vzpery, armatúry, základy, chýbajúce údaje, odpojené káble, preťaženia a pokles napätia, označené v pôdoryse aj v profile vedenia. Návrhová pomôcka: skontroluje ju inžinier. Pozrite [Kontroly elektrických vedení](topic:power-line-checks).
- **Tabuľky, listy a GIS.** Tabuľky napínania a stožiarov, výmery (CSV, Excel, TakeoffCraft), listy pôdorysu a profilu so správou o štúdii v jednom PDF, vrstvy GIS s údajmi každého prvku. Pozrite [Tabuľky, výmery, listy a GIS elektrických vedení](topic:power-line-outputs).
- **Po prvých pokusoch.** Profil vedenia sleduje vedenie, ktoré vyberiete, má zoznam **Vedenie**, číta terén, vodič a odstup pod ukazovateľom a meria medzi dvoma bodmi. Rastliny a múry krajiny sa počítajú ako prekážky pod vedeniami; trasy káblov a potrubia sa zobrazujú v profile vedenia a križujú sa s pravidlom odstupu, ktoré zvolíte; **Pravidlá…** pri každom odstupe otvoria vaše vlastné pravidlá; a sady pravidiel s knižnicou sa ukladajú ako balíky na zdieľanie podľa krajiny. Pozrite [Kontroly elektrických vedení](topic:power-line-checks) a [Balíky](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Vlastné formáty súborov.** Elektrické vedenia sa ukladajú do súboru projektu CivilCraft, knižnice do `.cclines.json` alebo CSV, sady pravidiel a balíky do vlastných súborov JSON: otvorené formáty, ktoré môže čítať alebo konvertovať ktokoľvek. Súbor štúdie `.DON` je doplnkový import a export popri nich.
- **Súbory štúdií (.DON), netestované.** Uložte vedenie ako súbor štúdie `.DON` pre iný program na vedenia alebo načítajte stožiare z neho; vytvorené z názvov polí formátu, zatiaľ netestované s tým programom. Pozrite [Súbory štúdií](topic:power-line-study-file).

### Meranie

- **Nástroj Meranie.** {{ui:Povrch}} › {{ui:Viac}} › {{ui:Meranie}} (alebo {{key:M}}) meria v pôdoryse: dĺžku a smerník každej strany, súčet, dĺžku po teréne a sklon, a plochu a obvod po uzavretí tvaru. Do projektu sa nič nekreslí. Pozrite [Meranie](topic:measure).

### Hmoty budov

- **Kreslenie hmôt budov.** Vo Vlastnostiach pod **Hmoty budov**, {{ui:Nakresliť hmotu}} (aj {{ui:Povrch}} › {{ui:Viac}} › {{ui:Hmoty}}). Zadajte hmote podlažia a výšku podlažia a prečítajte jej hrubú podlažnú plochu. Zvoľte, ako sedí na svahovitom teréne (stupňovito, podium alebo zárez), a pozrite si násyp a výkop. Hmoty sa zobrazujú v pôdoryse, v PDF a v DWG a DXF na vlastných hladinách. Pozrite [Kreslenie hmôt budov na stavenisku](topic:building-masses).
- **Tlač a ťah v 3D.** V 3D pohľade potiahnite strechu vybranej hmoty alebo stlačte {{key:PageUp}} a {{key:PageDown}}, čím ju meníte po podlažiach, v jednom kroku späť. **Slnko** vrhá tiene hmôt. Pozrite [V 3D pohľade](topic:building-masses#in-the-3d-view).
- **Limity regulácie, ktoré zadáte.** Odstupy riadok po riadku od uličnej čiary, limit výšky, rovina oslnenia, index podlažnej plochy a zastavanosť. Zastavateľná obálka sa nakreslí v pôdoryse a každá hmota dostane zelenú značku alebo krížik pri každom limite. CivilCraft neobsahuje žiadny regulačný predpis: každé číslo zadáte zo svojej vlastnej vyhlášky. Pozrite [Kontrola hmôt voči limitom regulácie, ktoré zadáte](topic:zoning-limits).
- **Hodiny slnka.** Vyberte deň alebo ročné obdobie a časové pásmo názvom alebo posunom a prečítajte hodiny priameho slnka na každej stene každej hmoty, podlažie po podlaží, a na teréne okolo nich, nakreslené v pôdoryse. Uložte steny a terén ako CSV. Projekt potrebuje súradnicový systém. Pozrite [Výpočet hodín slnka na stavenisku](topic:sun-hours).
- **Hmoty ako IFC a ďalej do BimCraft.** {{ui:Hmoty ako IFC}} uloží hmoty ako IFC4, umiestnené na mape, ak má projekt súradnicový systém. {{ui:Rozpracovať v BimCraft}} otvorí BimCraft na novej karte s hmotami, kde **Rozpracovať túto hmotu** vytvorí steny na každej úrovni a podlahu z pôdorysu. Nič sa nenahráva. Pozrite [Poslať ďalej](topic:building-masses#send-it-on).

### Osi trás

- **Klotoidné prechodnice.** Napíšte dĺžku do **Prechodnica vstup** a **Prechodnica výstup** v tabuľke PI pre oblúk: tangenta, prechodnica, oblúk, prechodnica, tangenta, s rovnakými alebo rôznymi dĺžkami. Pôdorys popisuje TS, SC, CS a ST, zoznam oblúkov uvádza θs a vzdialenosti tangenty a vonkajšiu, a staničenie a odsadenia prebiehajú cez prechodnice. Pozrite [Prechodnice](topic:alignment#spirals).
- **Prechodnice v LandXML.** LandXML zapisuje a číta klotoidné prechodnice. Osi trás s prechodnicami, ktoré CivilCraft pri importe vynechával, sa teraz otvoria. Pozrite [Výmena LandXML](topic:landxml).

### Koridory

- **Zostavenie každej strany z častí.** Zapnite **Zostaviť každú stranu z častí**, aby mala každá strana vlastný zoznam od osi smerom von: jazdné pruhy, krajnicu, žľab, obrubník, pás zelene, chodník a svah s vlastným výkopom a násypom. Začnite od {{ui:Vidiecka cesta}} alebo {{ui:Mestská ulica}} a skopírujte jednu stranu na druhú. Priečne rezy označujú rigol, obrubník a chodník a upravený povrch má obrubník. Pozrite [Zostavenie každej strany z častí](topic:corridor#build-each-side-from-parts).
- **Prevýšenie v oblúku cez prechodnice.** Na oblúku s prechodnicami prebieha nábeh prevýšenia cez prechodnicu: rovná korunka v TS, plné prevýšenie v SC. Pozrite [Prevýšenie v oblúku](topic:corridor#superelevation).

### Súbory 3D

- **Export USD.** V 3D pohľade {{ui:USD}} zapíše stavenisko ako `.usda`, `.usdc` alebo `.usdz` v skutočnej mierke a v súradniciach projektu: povrchy, potrubia a objekty ako siete, čiary, každú os trasy a zamerané body s ich číslami. Pozrite [Export 3D staveniska ako USD](topic:usd).

### Asistenti s AI

- **Viac pre asistentov.** S asistentmi zapnutými v {{ui:Nastavenia}} › {{ui:CivilCraft}} môže asistent teraz aj čítať parcely, výkop a násyp a profily, pridávať zamerané body, ukladať projekt, exportovať LandXML, DWG a USD a pracovať v priečinkoch, ktoré vyberiete v CadCraft Studio. Pracovný priestor Krajina pridáva nástroje na hľadanie rastlín, umiestňovanie rastlín, záhonov a živých plotov, úpravy terénu a kontrolu zavlažovania. Súborový server a príkazový riadok `cadcraft` otvárajú uložené projekty bez okna. Pozrite [Práca asistenta s AI s vaším staveniskom](topic:assistants).

## V každej aplikácii

- **Jednotky.** {{ui:Nastavenia}} › {{ui:Všeobecné}} › {{ui:Jednotky}} má po jednom zozname pre dĺžku, plochu, objem, uhol a sklon, s presnými veľkosťami podľa definícií jednotiek (americká geodetická stopa je samostatná jednotka). Vypnite jednotky, ktoré nikdy nepoužívate, a zo zoznamov jednotiek zmiznú; jednu označte hviezdičkou a nová práca sa začne v nej. Súbor si vždy ponechá vlastnú jednotku. V CivilCraft zoznam **Jednotky** projektu sleduje prepínače; hviezdička pri metrickej dĺžke začne nové projekty v metroch (inak v stopách, čo sú americké geodetické stopy), hviezdička pri ploche alebo objeme nastaví jednotku, v ktorej sa plochy a objemy uvádzajú, a pole dĺžky berie značku ľubovoľnej jednotky, napríklad `3 ch` alebo `450 mm`. Pozrite [Jednotky, zadané hodnoty a zoznamy jednotiek](common:unit-lists).
- **Hustejšie rozloženie a panely, ktoré sa dajú odložiť.** {{ui:Nastavenia}} › {{ui:Všeobecné}} › {{ui:Hustota rozloženia}} › {{ui:Kompaktná}} sa zmestí viac na obrazovku (dotykové obrazovky a telefóny si ponechajú veľké tlačidlá). Každý bočný panel má úzku lištu záhlavia: potiahnutím ho ukotvíte alebo necháte plávať, pustením na lištu iného panela zdieľate jeden rám ako karty, pripnutím ho necháte zasúvať sa k okraju alebo ho skryjete a vrátite z okraja. Pozrite [Usporiadanie panelov](common:arrange-panels#make-the-layout-denser).
- **Dialógové okná sa presúvajú.** Potiahnite dialógové okno za záhlavie mimo výkresu; vráti sa tam, kde ste ho nechali. Dvojitým kliknutím na záhlavie ho znova vycentrujete. Pozrite [Presunutie dialógového okna](common:arrange-panels#move-a-dialog).
- **Recepty pre asistentov s AI.** Desať prepracovaných požiadaviek pre vášho vlastného asistenta (upratať výkres, vykresliť sadu, skontrolovať výkresy, klásť modelu otázky, spočítať výkaz výmer, vyskúšať variant súčiastky…), každá s nástrojmi, ktoré volá, a oprávneniami, ktoré potrebuje, a každá prehraná našimi testami. Aplikácie neobsahujú žiadnu AI. Pozrite [Recepty pre asistentov s AI](common:assistants-recipes).
- **Jazyky.** **Português (Portugal)** je nový v {{ui:Nastavenia}} › {{ui:Všeobecné}} › {{ui:Jazyk}}. Ten, **Português (Brasil)**, **Español (México)** a **Bahasa Indonesia** majú teraz každé slovo aplikácií, ako koncepty, ktoré ešte neskontroloval rodený hovoriaci. Témy pomocníka sú po anglicky, niektoré po španielsky.
- **CadCraft Studio** uvádza, prečo zlyhala kontrola aktualizácie (zatiaľ nie je súbor pre váš systém, nie je sieť, zlý podpis), namiesto len „Hotovo“, a prestane vracať kartu Čo je nové, ktorú ste zatvorili, kým nevyjde novšie vydanie.

## Zatiaľ nie je vo verzii

- **0.7 nie je podpísaná kódovým podpisom.** Podpisovanie a balík pre Microsoft Store sa presunuli do 0.8, pretože overenie certifikátu zatiaľ neprebehlo. Skontrolujte SHA-256 vedľa každého súboru na getcadcraft.com/download. Ak vo Windows inštalátor zastaví SmartScreen, zvoľte {{ui:Ďalšie informácie}} a potom {{ui:Aj tak spustiť}}. Na Macu pri prvom spustení kliknite pravým tlačidlom na CadCraft Studio a zvoľte {{ui:Otvoriť}}. CadCraft Studio zatiaľ nie je v obchode s aplikáciami a zatiaľ neexistuje zostavenie pre iPad ani iPhone.
- Zoznamy uhlov a sklonov v {{ui:Jednotky}} sa ukladajú, ale zatiaľ ich nečíta žiadne pole.
- Zavlažovacie hlavice výrobcov: iba všeobecné hlavice a vaše vlastné zo súboru. Údaje výrobcov sa preberajú iba s ich povolením a zatiaľ žiadne nebolo udelené.
- BimCraft a ModelCraft nesú zoznam rastlín, ale ich Umiestnenie z knižnice zatiaľ rastliny neponúka. Rastliny sa do BimCraft dostanú cez IFC krajiny.
- Nástroje krajiny pre asistentov fungujú s otvoreným oknom CivilCraft; súborový server a príkazový riadok ich zatiaľ nemajú.
- Hmoty budov: žiadne denné svetlo ani vietor na fasádach, žiadny tieň od stromov ani od ničoho, čo nie je nakreslené ako hmota, žiadne tvary striech a hodiny slnka sa zobrazujú v pôdoryse, nie v 3D pohľade. Rozpracovanie v BimCraft vytvorí obyčajné steny a podlahu, bez otvorov a strechy.
- Elektrické vedenia: nie je zabudovaná norma žiadnej krajiny (zaťažovacie prípady, limity a odstupy nastavujete vy); žiadne dotvarovanie vodiča, tepelné zaťaženie uložených káblov, štúdie skratu, ochrán ani uzemnenia; žiadne vedenia v 3D pohľade ani v IFC. Súbor štúdie `.DON` sa netestoval s programom, ktorý ho číta.
- Prechodnice iné než klotoidné, prechodnica medzi dvoma oblúkmi a prechodnice v charakteristických čiarach. Prechodnice boli overené podľa vzorcov a schémy LandXML, zatiaľ nie podľa súboru LandXML s prechodnicami z iného programu.
- Zostavy koridoru, ktoré sa menia pozdĺž cesty, oblasti a ciele pre svah.
- Vodovody a tlakové siete (ďalšia inžinierska práca), prietoky, ktoré sa menia v čase, a prepojenia medzi vodovodnými a dažďovými sieťami.
- Oblúky v nakreslených hranách zlomu. Štandardné tabuľky návrhových vozidiel: päť dodávaných vozidiel sú označené zástupné hodnoty. Charakteristické čiary zdieľané medzi projektmi čakajú na tímové projekty.

Všetko ostatné je v [Ešte nie je hotové](topic:not-built-yet).
