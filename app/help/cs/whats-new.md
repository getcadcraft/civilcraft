---
title: Novinky v 0.7
summary: CivilCraft 0.7 přidává pracovní prostor Elektrická vedení (venkovní vedení a podzemní kabely s vlastními knihovnami, průvěs a tah, kontroly vzdáleností a pevnosti, montážní tabulky, množství, listy a GIS), pracovní prostor Krajina (seznam rostlin, výsadbové plány a rozpisy, úpravy terénu pro krajinu, dlažby, zdi a schody, výpočetní pomůcka zavlažování, listy krajiny a volné objekty), hmoty budov s regulativy, které zadáte, a hodinami slunce, klotoidní přechodnice, koridory sestavené z částí na každé straně, export USD a další nástroje pro asistenty s umělou inteligencí.
keywords: novinky, co je nového, poznámky k vydání, seznam změn, změny, 0.7, verze, nové funkce, krajina, pracovní prostor krajina, seznam rostlin, rostliny, výsadba, rozpis rostlin, záhon, živý plot, úpravy terénu, plošina, val, průleh, výšková kóta, analýza sklonu, zatopení, zpevněné plochy, dlažba, cesta, zeď, obrubník, rampa, schody, zavlažování, postřikovač, kapková, listy krajiny, volný objekt, hmota budovy, hmoty, hrubá podlažní plocha, regulativy, odstup, obálka, rovina oblohy, index podlažních ploch, zastavěnost, hodiny slunce, stín, ifc, rozpracovat v bimcraft, přechodnice, klotoida, přechod, sestava, obrubník, žlab, chodník, usd, asistenti, jednotky, portugalština
from: 3c9d79db
---

Zde je přehled změn v CivilCraftu 0.7 oproti 0.6. Největší novinky jsou pracovní prostory Elektrická vedení a Krajina a hmoty budov.

## Nové

### Pracovní prostor Krajina

- **Pracovní prostor Krajina na stejném staveništi.** {{ui:Povrch}} › {{ui:Více}} › {{ui:Pracovní prostor Krajina}} přidá k staveništi, které již máte, nástroje pro výsadbu, úpravy terénu, zpevněné plochy a zavlažování: tytéž zaměřené body, povrchy a soubor projektu. Zvolte **Civil** pod **Pracovní prostor** pro návrat. Viz [Pracovní prostor Krajina](topic:landscape).
- **Seznam rostlin.** Asi 420 běžných stromů, keřů, živých plotů, trav, trvalek, půdopokryvných rostlin a popínavek mírného pásu a Středomoří s jejich velikostmi při výsadbě a v dospělosti, zónou mrazuvzdornosti, světlem, vodou a roztečí. Hledejte podle libovolného názvu v angličtině, španělštině nebo portugalštině. Importujte vlastní seznam jako CSV; ukládá se s projektem. Vestavěné velikosti jsou typické a zaokrouhlené: ověřte je v místní školce. Viz [Seznam rostlin](topic:plant-list).
- **Výsadbové plány.** {{ui:Rostlina}} umisťuje jednotlivé rostliny, které sedí na terénu a sledují pozdější úpravy, {{ui:Záhon}} vyplní obrys v rozteči rostlin se směsí podle procent a {{ui:Živý plot}} nastaví jednu nebo dvě řady podél čáry. Rostliny se v půdorysu popisují. Viz [Výsadbové plány a rozpisy](topic:planting).
- **Rozpis rostlin.** Více › {{ui:Rozpis rostlin…}} spočítá rostliny podle druhu a velikosti při výsadbě. Uložte jej jako CSV nebo XLSX, nebo jej odešlete do TakeoffCraftu k ocenění. Viz [Rozpis rostlin](topic:planting#the-plant-schedule).
- **Úpravy terénu pro krajinu.** {{ui:Úpravy terénu}} mají plošiny (vodorovné nebo se spádem), valy, průlehy a plochy úprav s výškovými kótami a vrstevnicemi, které přetahujete. Výkop a násyp se zobrazují průběžně. **Analýza sklonu** obarví povrch podle Vašich dvou limitů a **Šipky toku a zatopení** ukazují, kudy voda teče a kde by se zastavila. Vše jde do téhož navrženého povrchu jako plošiny a koridory. Viz [Úpravy terénu pro krajinu](topic:landscape-grading).
- **Dlažby, cesty, zdi, obrubníky, rampy a schody.** {{ui:Zpevněné plochy}} kreslí dlažbu s příčným spádem nebo spády k odtoku, vzorem a jeho vrstvami; cesty, které sledují terén; opěrné a samostatně stojící zdi se stupňovitými základy; obrubníky; a rampy a schody kontrolované podle limitů, které nastavíte. Opěrná zeď nad 1,2 m (4 ft) se označí k posouzení projektantem. Viz [Dlažby, zdi a schody](topic:hardscape).
- **Výpočetní pomůcka zavlažování.** {{ui:Zavlažování}} umisťuje hlavice, rozvodná potrubí, hlavní řad, ventily, kapkové linky a místo napojení. {{ui:Zkontrolovat systém…}} najde zóny podle potrubí a vypočítá průtok každé zóny, tlak potřebný u jejího ventilu a u zdroje (Hazen–Williams), srážkovou výšku, doby chodu, pokrytí a kusovník. Je to výpočetní pomůcka, ne certifikace návrhu: každý výsledek zkontroluje projektant zavlažování. Hlavice jsou obecné druhy nebo Vaše vlastní ze souboru. Viz [Návrh zavlažování](topic:irrigation).
- **Listy krajiny.** Více › {{ui:Listy krajiny…}} vytvoří plány výsadby, úprav terénu a zavlažování s jejich legendami a list detailů řezů zdí, skladeb dlažeb a schodů, jako jedno PDF. Viz [Listy krajiny](topic:landscape-sheets).
- **Volné objekty.** Více › {{ui:Volný objekt…}} umístí síť STL, OBJ nebo položky knihovny vytvořenou v jiné aplikaci, například truhlík nebo sochu. Sedí na terénu nebo se do něj zařezává a počítá se její objem, plocha a půdorysná stopa. Viz [Volné objekty](topic:freeform-objects).
- **IFC krajiny.** Více › {{ui:Exportovat IFC krajiny}} uloží rostliny (jako vegetaci s jejich vlastnostmi), zpevněné plochy a volné objekty jako IFC 4.3 pro model BIM. Viz [IFC](topic:planting#ifc).
- **Od začátku do konce.** [Návrh zahrady od začátku do konce](topic:landscape-walkthrough) provede celým pracovním prostorem na ukázkovém staveništi.

### Pracovní prostor Elektrická vedení

- **Venkovní vedení a podzemní kabely na Vašem staveništi.** {{ui:Povrch}} › {{ui:Více}} › {{ui:Pracovní prostor Elektrická vedení}}: nakreslete vedení podle jeho podpěr, kabely v rýhách, zařízení a překážky na stejném terénu a ve stejném souboru projektu. Viz [Pracovní prostor Elektrická vedení](topic:power-lines).
- **Vaše vlastní knihovny.** Vodiče, kabely, podpěry, zařízení (příčníky, izolátory, armatury, kotevní lana, transformátory, rozvodné skříně, spojky) a typy rýh, v kategoriích, které pojmenujete, sdílené jako soubor nebo tabulka. Žádný katalog země ani výrobce není zabudován; příklady říkají, že jsou příklady. Viz [Vaše knihovna elektrických vedení](topic:power-line-library).
- **Průvěs a tah při Vašich zatěžovacích stavech.** Teplota, vítr, námraza a námraza na jedné straně; limity tahu jako podíl meze pevnosti; přesná řetězovka na každém rozpětí, včetně sklonů; montážní tabulky. Viz [Průvěs a tah](topic:sag-and-tension).
- **Kontroly, vždy aktuální.** Vzdálenost nad terénem a překážkami, rozteč fází, rozkmit izolátorů, vzdouvání, zatížení podpěr s dimenzováním z Vaší knihovny, kotevní lana, armatury, základy, chybějící údaje, odpojené kabely, přetížení a pokles napětí, označené v půdorysu a v podélném profilu vedení. Návrhová pomůcka: zkontroluje ji projektant. Viz [Kontroly elektrických vedení](topic:power-line-checks).
- **Tabulky, listy a GIS.** Montážní tabulky a tabulky podpěr, množství (CSV, Excel, TakeoffCraft), listy půdorysu a podélného profilu se zprávou o studii v jednom PDF, vrstvy GIS s údaji každého prvku. Viz [Tabulky, množství, listy a GIS elektrických vedení](topic:power-line-outputs).
- **Po prvních zkouškách.** Podélný profil vedení sleduje vybrané vedení, má seznam **Vedení**, čte terén, vodič a vzdálenost pod ukazatelem a měří mezi dvěma body. Rostliny a zdi krajiny se počítají jako překážky pod vedením; trasy kabelů a potrubí se zobrazují v podélném profilu vedení a kříží se podle pravidla vzdálenosti, které zvolíte; **Pravidla…** vedle každé vzdálenosti otevře Vaše vlastní pravidla; a sady pravidel s knihovnou se ukládají jako balíčky ke sdílení podle země. Viz [Kontroly elektrických vedení](topic:power-line-checks) a [Balíčky](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Vaše vlastní formáty souborů.** Elektrická vedení se ukládají do souboru projektu CivilCraftu, knihovny do `.cclines.json` nebo CSV, sady pravidel a balíčky do vlastních souborů JSON: otevřené formáty, které může číst nebo převádět kdokoli. Soubor studie `.DON` je doplňkový import a export vedle nich.
- **Soubory studií (.DON), nevyzkoušené.** Uložte vedení jako soubor studie `.DON` pro jiný program pro vedení nebo načtěte jeho podpěry; vytvořeno podle názvů polí formátu, zatím nevyzkoušeno s tím programem. Viz [Soubory studií](topic:power-line-study-file).

### Měření

- **Nástroj Měřit.** {{ui:Povrch}} › {{ui:Více}} › {{ui:Měřit}} (nebo {{key:M}}) měří v půdorysu: délku a směrník každé strany, průběžný součet, délku po terénu a sklon a po uzavření tvaru plochu a obvod. Do projektu se nic nekreslí. Viz [Měřit](topic:measure).

### Hmoty budov

- **Kreslení hmot budov.** Ve Vlastnostech pod **Hmoty budov** {{ui:Nakreslit hmotu}} (také {{ui:Povrch}} › {{ui:Více}} › {{ui:Hmoty}}). Zadejte hmotě podlaží a výšku podlaží a přečtěte si její hrubou podlažní plochu. Zvolte, jak sedí na svažitém terénu (stupňovitě, podium nebo zářez), a uvidíte násyp a výkop. Hmoty se zobrazují v půdorysu, v PDF a v DWG i DXF na vlastních vrstvách. Viz [Kreslení hmot budov na staveništi](topic:building-masses).
- **Tlač a tahej ve 3D.** Ve 3D pohledu přetáhněte střechu vybrané hmoty, nebo stiskněte {{key:PageUp}} a {{key:PageDown}}, a měňte ji po podlažích, v jednom kroku zpět. **Slunce** vrhá stíny hmot. Viz [Ve 3D pohledu](topic:building-masses#in-the-3d-view).
- **Regulativy, které zadáte.** Odstupy řádek po řádku od uliční čáry, limit výšky, rovina expozice oblohy, index podlažních ploch a zastavěnost. Zastavitelná obálka se nakreslí v půdorysu a každá hmota dostane u každého limitu zaškrtnutí nebo křížek. CivilCraft v sobě nemá žádný územní předpis: každé číslo zadáte z vlastní vyhlášky. Viz [Kontrola hmot podle regulativů, které zadáte](topic:zoning-limits).
- **Hodiny slunce.** Zvolte den nebo roční období a časové pásmo názvem nebo posunem a přečtěte si hodiny přímého slunce na každé stěně každé hmoty, podlaží po podlaží, a na terénu kolem nich, zakreslené do půdorysu. Uložte stěny a terén jako CSV. Projekt potřebuje souřadnicový systém. Viz [Výpočet hodin slunce na staveništi](topic:sun-hours).
- **Hmoty jako IFC a dál do BimCraftu.** {{ui:Hmoty jako IFC}} uloží hmoty jako IFC4, umístěné na mapě, má-li projekt souřadnicový systém. {{ui:Rozpracovat v BimCraft}} otevře BimCraft v nové kartě s hmotami, kde **Rozpracovat tuto hmotu** vytvoří stěny na každém podlaží a podlahu z půdorysné stopy. Nic se nenahrává. Viz [Odeslání dál](topic:building-masses#send-it-on).

### Osy tras

- **Klotoidní přechodnice.** Napište délku do **Přechodnice na vstupu** a **Přechodnice na výstupu** v tabulce PI pro oblouk: tečna, přechodnice, oblouk, přechodnice, tečna, se stejnými nebo různými délkami. Půdorys popisuje TS, SC, CS a ST, seznam oblouků uvádí θs a tečnové a vnější vzdálenosti a staničení a odsazení probíhají přes přechodnice. Viz [Přechodnice](topic:alignment#spirals).
- **Přechodnice v LandXML.** LandXML zapisuje a čte klotoidní přechodnice. Osy tras s přechodnicemi, které CivilCraft dříve při importu přeskakoval, se nyní otevírají. Viz [Výměna LandXML](topic:landxml).

### Koridory

- **Sestavení každé strany z částí.** Zapněte **Sestavit každou stranu z částí**, aby každá strana měla vlastní seznam od osy ven: jízdní pruhy, krajnice, žlab, obrubník, zelený pás, chodník a boční svah s vlastním výkopem a násypem. Začněte od {{ui:Venkovská silnice}} nebo {{ui:Městská ulice}} a zkopírujte jednu stranu na druhou. Příčné řezy označují tok, obrubník a chodník a upravený povrch obrubník má. Viz [Sestavení každé strany z částí](topic:corridor#build-each-side-from-parts).
- **Převýšení v oblouku přes přechodnice.** Na oblouku s přechodnicemi probíhá náběh převýšení přes přechodnici: vodorovná korunka v TS, plné převýšení v SC. Viz [Převýšení v oblouku](topic:corridor#superelevation).

### Soubory 3D

- **Export USD.** Ve 3D pohledu {{ui:USD}} zapíše staveniště jako `.usda`, `.usdc` nebo `.usdz` ve skutečném měřítku a v souřadnicích projektu: povrchy, potrubí a objekty jako sítě, čáry, každou osu trasy a body zaměření s jejich čísly. Viz [Export 3D staveniště jako USD](topic:usd).

### Asistenti s umělou inteligencí

- **Více pro asistenty.** Se zapnutými asistenty v {{ui:Nastavení}} › {{ui:CivilCraft}} může asistent nově také číst parcely, výkop a násyp a profily, přidávat body zaměření, ukládat projekt, exportovat LandXML, DWG a USD a pracovat ve složkách, které zvolíte v CadCraft Studiu. Pracovní prostor Krajina přidává nástroje pro hledání rostlin, umisťování rostlin, záhonů a živých plotů, úpravy terénu a kontrolu zavlažování. Souborový server a příkazový řádek `cadcraft` otevírají uložené projekty bez okna. Viz [Nechte AI asistenta pracovat s Vaším staveništěm](topic:assistants).

## V každé aplikaci

- **Jednotky.** {{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Jednotky}} má po jednom seznamu pro délku, plochu, objem, úhel a sklon s přesnými velikostmi podle definic jednotek (americká zeměměřičská stopa je samostatná jednotka). Vypněte jednotky, které nikdy nepoužíváte, a z seznamů jednotek zmizí; označte jednu hvězdičkou a nová práce v ní začne. Soubor si vždy ponechává vlastní jednotku. V CivilCraftu seznam **Jednotky** projektu sleduje přepínače; hvězdička u metrické délky zahajuje nové projekty v metrech (jinak ve stopách, což jsou americké zeměměřičské stopy), hvězdička u plochy nebo objemu nastavuje jednotku, ve které se plochy a objemy uvádějí, a pole délky přijímá značku libovolné jednotky, například `3 ch` nebo `450 mm`. Viz [Jednotky, zadávané hodnoty a seznamy jednotek](common:unit-lists).
- **Hustší rozvržení a panely, které se uklidí.** {{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Hustota rozložení}} › {{ui:Kompaktní}} vměstná na obrazovku víc (dotykové obrazovky a telefony si ponechávají velká tlačítka). Každý boční panel má štíhlou záhlavní lištu: přetažením panel ukotvíte nebo necháte plovoucí, puštěním na lištu jiného panelu je sloučíte do jednoho rámu jako karty, připnutím jej necháte zasunout k okraji, nebo jej skryjete a vrátíte z okraje. Viz [Uspořádání panelů](common:arrange-panels#make-the-layout-denser).
- **Dialogy se přesouvají.** Přetáhněte dialog za záhlaví z cesty kresbě; vrátí se tam, kde jste jej nechali. Dvojitým kliknutím na záhlaví jej znovu vycentrujete. Viz [Přesunutí dialogu](common:arrange-panels#move-a-dialog).
- **Návody pro asistenty s umělou inteligencí.** Deset ukázkových požadavků pro Vašeho vlastního asistenta (uklidit výkres, vykreslit sadu, zkontrolovat výkresy, ptát se modelu, sečíst výkaz výměr, vyzkoušet variantu dílu…), každý s nástroji, které volá, a oprávněními, která potřebuje, a každý přehraný našimi testy. Aplikace neobsahují žádnou AI. Viz [Návody pro asistenty s umělou inteligencí](common:assistants-recipes).
- **Jazyky.** **Português (Portugal)** je nově v {{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Jazyk}}. Ten, **Português (Brasil)**, **Español (México)** a **Bahasa Indonesia** mají nyní každé slovo aplikací, jako koncepty dosud nezkontrolované rodilým mluvčím. Témata nápovědy jsou v angličtině, několik ve španělštině.
- **CadCraft Studio** říká, proč kontrola aktualizací selhala (pro Váš systém zatím není soubor, chybí síť, chybný podpis), místo pouhého „Hotovo“, a přestane vracet kartu Novinky, kterou jste zavřeli, dokud nevyjde novější vydání.

## V této verzi ještě není

- **0.7 není podepsáno kódem.** Podepisování a balíček Microsoft Store se přesunuly do 0.8, protože ověření certifikátu zatím neprošlo. Zkontrolujte SHA-256 vedle každého souboru na getcadcraft.com/download. Pokud ve Windows instalátor zastaví SmartScreen, zvolte {{ui:Další informace}} a potom {{ui:Přesto spustit}}. Na Macu poprvé klikněte pravým tlačítkem na CadCraft Studio a zvolte {{ui:Otevřít}}. CadCraft Studio zatím není v žádném obchodě s aplikacemi a verze pro iPad ani iPhone zatím neexistuje.
- Seznamy úhlu a sklonu v {{ui:Jednotky}} se ukládají, ale zatím je nečte žádné pole.
- Hlavice zavlažování od výrobců: jen obecné hlavice a Vaše vlastní ze souboru. Údaje výrobců přicházejí jen s jejich svolením a žádné zatím nebylo uděleno.
- BimCraft a ModelCraft nesou seznam rostlin, ale jejich Umístění z knihovny zatím rostliny nenabízí. Rostliny se do BimCraftu dostanou přes IFC krajiny.
- Nástroje krajiny pro asistenty fungují s otevřeným oknem CivilCraftu; souborový server a příkazový řádek je zatím nemají.
- Hmoty budov: žádné denní světlo ani vítr na fasádách, žádný stín od stromů ani ničeho, co není nakresleno jako hmota, žádné tvary střech a hodiny slunce se zobrazují v půdorysu, ne ve 3D pohledu. Rozpracování v BimCraftu vytvoří prosté stěny a podlahu, bez otvorů a střechy.
- Elektrická vedení: žádná norma země není zabudována (zatěžovací stavy, limity a vzdálenosti nastavujete Vy); žádné dotvarování vodičů, tepelné zatížení zakopaných kabelů, zkratové studie, ochrany ani uzemnění; žádná vedení ve 3D pohledu ani v IFC. Soubor studie `.DON` nebyl vyzkoušen s programem, který jej čte.
- Přechodnice jiné než klotoida, přechodnice mezi dvěma oblouky a přechodnice v konstrukčních čarách. Přechodnice byly ověřeny podle vzorců a schématu LandXML, zatím ne podle souboru LandXML s přechodnicemi z jiného programu.
- Sestavy koridoru, které se podél silnice mění, oblasti a cíle pro boční svah.
- Vodovody a tlakové sítě (další inženýrská práce), průtoky měnící se v čase a vazby mezi vodovodní a dešťovou sítí.
- Oblouky v nakreslených lomových hranách. Standardní tabulky návrhových vozidel: pět dodávaných vozidel jsou označené zástupné hodnoty. Konstrukční čáry sdílené mezi projekty čekají na týmové projekty.

Vše ostatní je v tématu [Ještě není hotovo](topic:not-built-yet).
