---
title: Co je nového ve verzi 0.7 (dřívější)
summary: CivilCraft 0.7 přidává pracovní prostor Elektrická vedení (nadzemní vedení a podzemní kabely s vlastními knihovnami, průvěs a napětí, kontroly světlosti a pevnosti, tabulky natahování, výkazy, listy a GIS), pracovní prostor Krajina (seznam rostlin, plány výsadby a rozpisy, úpravy terénu, dlažby, cesty, zdi a schody, pomůcku pro výpočet závlahy, listy krajiny a volné objekty), hmoty budov s limity územního plánu, které zadáte, a hodiny slunečního svitu, klotoidní přechodnice, koridory sestavené z dílů na každé straně, export USD a další nástroje pro AI asistenty.
keywords: co je nového 0.7, dřívější vydání, poznámky k vydání, changelog, změny, 0.7, verze, nové funkce, krajina, pracovní prostor krajina, seznam rostlin, rostliny, výsadba, rozpis rostlin, záhon, živý plot, úpravy terénu, plošina, násep, odvodňovací příkop, kóta bodu, analýza sklonu, zaplavování, zpevněné plochy, dlažba, cesta, zeď, obrubník, rampa, schody, závlaha, postřikovač, kapková závlaha, listy krajiny, volný objekt, hmota budovy, hrubá podlahová plocha, územní plán, ústup, obálka, rovina oblohy, koeficient podlažních ploch, zastavěnost, hodiny slunce, stín, ifc, rozpracovat v BimCraft, přechodnice, klotoida, přechod, sestava, obrubník, žlab, chodník, usd, asistenti, jednotky, portugalština
from: 797d2f2f
---

Tohle se změnilo v CivilCraft 0.7 oproti verzi 0.6. Největší nové části jsou pracovní prostory Elektrická vedení a Krajina a hmoty budov.

## Novinky

### Pracovní prostor Krajina

- **Pracovní prostor Krajina na stejné lokalitě.** {{ui:Povrch}} › {{ui:Více}} › {{ui:Pracovní prostor Krajina}} přidá k lokalitě, kterou už máte, nástroje pro výsadbu, úpravy terénu, zpevněné plochy a závlahu: stejné body zaměření, povrchy a projektový soubor. Zpět se dostanete tak, že pod **Pracovní prostor** vyberete **Civil**. Viz [Pracovní prostor Krajina](topic:landscape).
- **Seznam rostlin.** Asi 420 běžných stromů, keřů, živých plotů, trav, trvalek, půdopokryvných rostlin a popínavek mírného pásma a středomořské oblasti, s velikostí při výsadbě i v dospělosti, pásmem mrazuvzdornosti, světlem, vodou a rozestupy. Hledejte podle libovolného názvu v angličtině, španělštině nebo portugalštině. Vlastní seznam můžete importovat jako CSV; uloží se spolu s projektem. Vestavěné velikosti jsou typické a zaokrouhlené: ověřte je v místní školce. Viz [Seznam rostlin](topic:plant-list).
- **Plány výsadby.** {{ui:Zasadit}} umístí jednotlivé rostliny, které stojí na zemi a řídí se pozdějšími úpravami terénu, {{ui:Záhon}} vyplní obrys rostlinami v jejich rozestupech se směsí podle procent a {{ui:Živý plot}} nastaví jednu nebo dvě řady podél čáry. Rostliny jsou na plánu popsány. Viz [Plány výsadby a rozpisy](topic:planting).
- **Rozpis rostlin.** {{ui:Více}} › {{ui:Rozpis rostlin…}} spočítá rostliny podle druhu a velikosti při výsadbě. Uložte jej jako CSV nebo XLSX, nebo jej pošlete do TakeoffCraft k ocenění. Viz [Rozpis rostlin](topic:planting#the-plant-schedule).
- **Úpravy terénu pro krajinu.** {{ui:Úpravy terénu}} nabízí plošiny (rovné nebo spadající), násypy, odvodňovací příkopy a plochy úprav s bodovými kótami a vrstevnicemi, které táhnete. Výkop a násyp se ukazují průběžně. **Analýza sklonu** obarví povrch podle vašich dvou limitů a **Šipky odtoku a zaplavování** ukážou, kudy voda teče a kde by se zadržela. Vše spadá do stejného navrženého povrchu jako plochy a koridory. Viz [Úpravy terénu pro krajinu](topic:landscape-grading).
- **Dlažby, cesty, zdi, obrubníky, rampy a schody.** {{ui:Zpevněné plochy}} kreslí dlažbu s příčným sklonem nebo spádem k odtoku, vzor a její vrstvy; cesty, které sledují terén; opěrné a volně stojící zdi se schodovitými základy; obrubníky; a rampy a schody kontrolované podle limitů, které nastavíte. Opěrná zeď vyšší než 1,2 m (4 ft) je označena pro inženýra. Viz [Dlažby, zdi a schody](topic:hardscape).
- **Pomůcka pro výpočet závlahy.** {{ui:Zavlažování}} umístí postřikovače, rozvody, hlavní potrubí, ventily, kapkové linky a místo připojení. {{ui:Zkontrolovat systém…}} najde zóny z potrubí a spočítá průtok každé zóny, tlak potřebný na jejím ventilu a na přívodu (Hazen–Williams), srážky, časy zavlažování, pokrytí a kusovník. Je to pomůcka pro výpočet, ne certifikace návrhu: každý výsledek kontroluje návrhář závlah. Postřikovače jsou obecné druhy, nebo vaše vlastní ze souboru. Viz [Návrh závlahy](topic:irrigation).
- **Listy krajiny.** {{ui:Více}} › {{ui:Listy krajiny…}} vytvoří výsadbové, terénní a závlahové plány s jejich legendami a list podrobností s řezy zdí, skladbami dlažeb a schody jako jedno PDF. Viz [Listy krajiny](topic:landscape-sheets).
- **Volné objekty.** {{ui:Více}} › {{ui:Volný objekt…}} umístí síť ze souboru STL, OBJ nebo položku knihovny vytvořenou v jiné aplikaci, například truhlík nebo sochu. Stojí na zemi nebo do ní zapadá a počítá se její objem, plocha a půdorys. Viz [Volné objekty](topic:freeform-objects).
- **IFC krajiny.** {{ui:Více}} › {{ui:Exportovat IFC krajiny}} uloží rostliny (jako vegetaci s jejich vlastnostmi), zpevněné plochy a volné objekty jako IFC 4.3 pro model BIM. Viz [IFC](topic:planting#ifc).
- **Od začátku do konce.** [Navrhněte zahradu od začátku do konce](topic:landscape-walkthrough) provede celým pracovním prostorem na ukázkové lokalitě.

### Pracovní prostor Elektrická vedení

- **Nadzemní vedení a podzemní kabely na vaší lokalitě.** {{ui:Povrch}} › {{ui:Více}} › {{ui:Pracovní prostor Elektrická vedení}}: nakreslete vedení podle jeho podpěr, kabely v rýhách, zařízení a překážky, na stejném terénu a ve stejném projektovém souboru. Viz [Pracovní prostor Elektrická vedení](topic:power-lines).
- **Vaše vlastní knihovny.** Vodiče, kabely, podpěry, zařízení (příčníky, izolátory, armatury, kotvení, transformátory, rozvaděče, spojky) a typy rýh v kategoriích, které pojmenujete, sdílené jako soubor nebo tabulka. Žádný katalog země ani výrobce není vestavěný; příklady jsou označeny jako příklady. Viz [Vaše knihovna elektrických vedení](topic:power-line-library).
- **Průvěs a napětí pro vaše zatěžovací stavy.** Teplota, vítr, led a led na jedné straně; limity napětí jako podíl na mezi pevnosti v tahu; přesná řetězovka na každém poli včetně svahů; tabulky natahování. Viz [Průvěs a napětí](topic:sag-and-tension).
- **Kontroly, vždy aktuální.** Světlost nad zemí a překážkami, rozteč fází, výkyv izolátorů, vztlak, zatížení podpěr s dimenzováním podle vaší knihovny, kotvení, armatury, základy, chybějící údaje, odpojené kabely, přetížení a úbytek napětí, označené na plánu i na podélném profilu vedení. Pomůcka pro návrh: kontroluje ji inženýr. Viz [Kontroly elektrických vedení](topic:power-line-checks).
- **Tabulky, listy a GIS.** Tabulky natahování a podpěr, výkazy množství (CSV, Excel, TakeoffCraft), listy plánu a profilu se studijní zprávou v jednom PDF, vrstvy GIS se všemi údaji o každém prvku. Viz [Tabulky, výkazy, listy a GIS elektrických vedení](topic:power-line-outputs).
- **Po prvních pokusech.** Podélný profil vedení sleduje vedení, které vyberete, má seznam **Vedení** a přečte terén, vodič a světlost pod ukazatelem a měří mezi dvěma body. Rostliny a zdi krajiny se počítají jako překážky pod vedeními; trasy kabelů a potrubí se ukazují v podélném profilu a křižují se s pravidlem světlosti, které zvolíte; tlačítko **Pravidla…** vedle každé světlosti otevře vaše vlastní pravidla; a sady pravidel s knihovnou se ukládají jako balíčky, které lze sdílet podle země. Viz [Kontroly elektrických vedení](topic:power-line-checks) a [Balíčky](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Vaše vlastní formáty souborů.** Elektrická vedení se ukládají do projektového souboru CivilCraft, knihovny do `.cclines.json` nebo CSV, sady pravidel a balíčky do vlastních JSON souborů: otevřené formáty, které může kdokoli číst nebo převést. Soubor `.DON` je navíc dodatečný import a export vedle nich.
- **Studijní soubory (.DON), neotestováno.** Uložte vedení jako studijní soubor `.DON` pro jiný program pro vedení, nebo načtěte podpěry z takového souboru. Vychází z názvů polí formátu, dosud se s tímto programem netestovalo. Viz [Studijní soubory](topic:power-line-study-file).

### Měření

- **Nástroj Měřit.** {{ui:Povrch}} › {{ui:Více}} › {{ui:Měřit}} (nebo {{key:M}}) měří na plánu: délku a azimut každé strany, průběžný součet, délku podél terénu a sklon, a plochu a obvod, jakmile uzavřete tvar. Do projektu se nic nekreslí. Viz [Měřit](topic:measure).

### Hmoty budov

- **Kreslení hmot budov.** V **Vlastnostech**, pod **Hmoty budov**, {{ui:Nakreslit hmotu}} (také {{ui:Povrch}} › {{ui:Více}} › {{ui:Hmoty}}). Dejte hmotě počet podlaží a výšku podlaží a přečtěte si její hrubou podlahovou plochu. Zvolte, jak sedí na svažitém terénu (odstupňovaně, na podezdívce, nebo výkop), a uvidíte násyp a výkop. Hmoty se ukazují na plánu, v PDF a v DWG a DXF na vlastních vrstvách. Viz [Kreslení hmot budov na lokalitě](topic:building-masses).
- **Tažení a tlačení ve 3D.** Ve 3D pohledu táhněte střechu vybrané hmoty, nebo stiskněte {{key:PageUp}} a {{key:PageDown}}, abyste ji měnili po podlažích, v jednom kroku zpět. **{{ui:Slunce}}** vrhá stíny hmot. Viz [Ve 3D pohledu](topic:building-masses#in-the-3d-view).
- **Limity územního plánu, které zadáte.** Ústupy řádek po řádku od uliční čáry, limit výšky, rovina volného výhledu na oblohu, koeficient podlažních ploch a zastavěnost. Stavební obálka se nakreslí na plán a každá hmota dostane fajfku nebo křížek pro každý limit. CivilCraft nemá v sobě žádný stavební předpis: každé číslo je to, co zadáte z vlastní vyhlášky. Viz [Ověřte hmoty proti limitům územního plánu, které zadáte](topic:zoning-limits).
- **Hodiny slunečního svitu.** Zvolte den nebo roční období a časové pásmo podle názvu nebo odchylky a přečtěte si hodiny přímého slunce na každé stěně každé hmoty, po podlažích, a na terénu kolem nich, nakreslené na plánu. Stěny a terén lze uložit jako CSV. Projekt potřebuje souřadnicový systém. Viz [Hodiny slunečního svitu na lokalitě](topic:sun-hours).
- **Hmoty jako IFC a dál do BimCraft.** {{ui:Hmoty jako IFC}} uloží hmoty jako IFC4, umístěné na mapě, pokud má projekt souřadnicový systém. {{ui:Rozpracovat v BimCraft}} otevře BimCraft v nové kartě s hmotami, kde **Rozpracovat tuto hmotu** vytvoří stěny na každé úrovni a podlahu z půdorysu. Nic se nenahrává. Viz [Odeslání dál](topic:building-masses#send-it-on).

### Osy tras

- **Klotoidní přechodnice.** Do tabulky PI pro oblouk zadejte délku do polí **Přechodnice na vstupu** a **Přechodnice na výstupu**: tečna, přechodnice, oblouk, přechodnice, tečna, se stejnými nebo různými délkami. Plán popisuje TS, SC, CS a ST, seznam oblouků udává θs a tečnové a vnější vzdálenosti a staničení a odsazení procházejí přechodnicemi. Viz [Přechodnice](topic:alignment#spirals).
- **Přechodnice v LandXML.** LandXML zapisuje a čte klotoidní přechodnice. Osy s přechodnicemi, které CivilCraft při importu dříve přeskakoval, se nyní otevřou. Viz [Výměna LandXML](topic:landxml).

### Koridory

- **Sestavení každé strany z dílů.** Zapněte **Sestavit každou stranu z dílů**, aby každá strana měla vlastní seznam od osy ven: jízdní pruhy, krajnici, žlab, obrubník, pás pro výsadbu, chodník a boční svah s vlastním výkopem a násypem. Začněte od {{ui:Venkovská silnice}} nebo {{ui:Městská ulice}} a zkopírujte jednu stranu na druhou. Příčné řezy označují osu žlabu, obrubník a chodník a upravený povrch obsahuje obrubník. Viz [Sestavení každé strany z dílů](topic:corridor#build-each-side-from-parts).
- **Převýšení přes přechodnice.** U oblouku s přechodnicemi se náběh převýšení vede přes přechodnici: rovný příčný sklon v TS, plné převýšení v SC. Viz [Převýšení](topic:corridor#superelevation).

### Soubory 3D

- **Export USD.** Ve 3D pohledu {{ui:USD}} zapíše lokalitu jako `.usda`, `.usdc` nebo `.usdz` v pravém měřítku a v souřadnicích projektu: povrchy, potrubí a konstrukce jako sítě, čáry, každou osu trasy a body zaměření s jejich čísly. Viz [Export lokality ve 3D jako USD](topic:usd).

### AI asistenti

- **Více pro asistenty.** S asistenty zapnutými v {{ui:Nastavení}} › {{ui:CivilCraft}} může asistent nyní také číst parcely, výkopy a násypy a profily, přidávat body zaměření, ukládat projekt, exportovat LandXML, DWG a USD a pracovat ve složkách, které zvolíte, v CadCraft Studio. Pracovní prostor Krajina přidává nástroje pro hledání rostlin, umisťování rostlin, záhonů a živých plotů, úpravy terénu a kontrolu závlahy. Server souborů a příkazový řádek `cadcraft` otevírají uložené projekty bez okna. Viz [Nechte AI asistenta pracovat s vaší lokalitou](topic:assistants).

## Ve všech aplikacích

- **Jednotky.** {{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Jednotky}} má po jednom seznamu pro délku, plochu, objem, úhel a sklon, s přesnými velikostmi podle definic jednotek (US survey stopa je samostatná jednotka). Vypnete-li jednotky, které nikdy nepoužíváte, zmizí ze seznamů jednotek; označíte-li jednu hvězdičkou, nová práce v ní začne. Soubor si vždy ponechává svou vlastní jednotku. V CivilCraft se seznam **Jednotky** projektu řídí přepínači; hvězdička u délky nastaví nové projekty na metry (jinak na stopy, což jsou US survey stopy), hvězdička u plochy nebo objemu určí jednotku, ve které se plochy a objemy hlásí, a pole délky přijme značku libovolné jednotky, například `3 ch` nebo `450 mm`. Viz [Jednotky, zadávané hodnoty a seznamy jednotek](common:unit-lists).
- **Hustší rozložení a panely, které se dají uklidit.** {{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Hustota rozložení}} › {{ui:Kompaktní}} se vejde na obrazovku více (dotykové obrazovky a telefony si ponechají velká tlačítka). Každý boční panel má štíhlé záhlaví: přetažením jej ukotvíte nebo odpojíte, pustíte jej na záhlaví jiného panelu, aby se sdílel jeden rám jako karty, připnete jej, aby zajel k okraji, nebo jej skryjete a vyvoláte zpět od okraje. Viz [Uspořádání panelů](common:arrange-panels#make-the-layout-denser).
- **Dialogy se dají přesouvat.** Dialog přetáhněte za záhlaví z cesty kresbě; vrátí se tam, kde jste ho nechali. Dvojklikem na záhlaví jej znovu vycentrujete. Viz [Přesun dialogu](common:arrange-panels#move-a-dialog).
- **Postupy pro AI asistenty.** Deset vypracovaných požadavků pro vašeho vlastního asistenta (uklidit výkres, vykreslit sadu, zkontrolovat výkresy, položit modelu otázky, sečíst výkaz výměr, zkusit variantu dílu…), každý s nástroji, které volá, a oprávněními, která potřebuje, a každý přehrán našimi testy. Aplikace žádnou AI neobsahují. Viz [Postupy pro AI asistenty](common:assistants-recipes).
- **Jazyky.** **Português (Portugal)** je nový v {{ui:Nastavení}} › {{ui:Obecné}} › {{ui:Jazyk}}. Ten, **Português (Brasil)**, **Español (México)** a **Bahasa Indonesia** nyní mají všechna slova aplikací, jako koncepty, které zatím neověřil rodilý mluvčí. Témata nápovědy jsou v angličtině, několik ve španělštině.
- **CadCraft Studio** uvede, proč kontrola aktualizací selhala (pro váš systém zatím není soubor, chybí síť, špatný podpis), místo jen „Hotovo“, a přestane vracet kartu Co je nového, kterou jste zavřeli, dokud nebude novější vydání.

## Zatím není v této verzi

- **0.7 není podepsaná certifikátem kódu.** Podepisování a balíček Microsoft Store se přesunuly do verze 0.8, protože ověření certifikátu ještě nedorazilo. Zkontrolujte SHA-256 u každého souboru na getcadcraft.com/download. Ve Windows, pokud SmartScreen zastaví instalátor, zvolte {{ui:Více informací}} a potom {{ui:Přesto spustit}}. Na Macu při prvním spuštění klikněte pravým tlačítkem na CadCraft Studio a zvolte {{ui:Otevřít}}. CadCraft Studio zatím není v žádném obchodě s aplikacemi a zatím neexistuje sestavení pro iPad ani iPhone.
- Úhlové a sklonové seznamy v {{ui:Jednotky}} se ukládají, ale zatím je žádné pole nečte.
- Výrobcovské postřikovače pro závlahu: jen obecné postřikovače a vaše vlastní ze souboru. Údaje výrobců se získají jen s jejich souhlasem a zatím žádný souhlas nebyl udělen.
- BimCraft a ModelCraft nesou seznam rostlin, ale jejich Umístit z knihovny zatím rostliny nenabízí. Rostliny se do BimCraft dostanou přes IFC krajiny.
- Nástroje krajiny pro asistenty fungují, když je otevřené okno CivilCraft; server souborů a příkazový řádek je zatím nemají.
- Hmoty budov: žádné denní světlo fasád ani vítr, žádný stín od stromů ani od čehokoli, co není nakresleno jako hmota, žádné tvary střech a hodiny slunečního svitu se ukazují na plánu, ne ve 3D pohledu. Rozpracovat v BimCraft vytvoří obyčejné stěny a podlahu, bez otvorů a střechy.
- Elektrická vedení: žádný standard žádné země není vestavěný (nastavujete zatěžovací stavy, limity a světlosti); žádné studie dotvarování vodičů, tepelného zatížení zakopaných kabelů, zkratu, ochran nebo uzemnění; žádná vedení ve 3D pohledu ani v IFC. Studijní soubor `.DON` nebyl otestován s programem, který jej čte.
- Přechodnice jiné než klotoidní, přechodnice mezi dvěma oblouky a přechodnice v čarách prvků. Přechodnice byly ověřeny podle vzorců a schématu LandXML, zatím ne proti souboru LandXML s přechodnicemi z jiného programu.
- Sestavy koridorů, které se podél silnice mění, oblasti a cíle pro boční svah.
- Vodovodní řady a tlakové sítě (příští civilní část), toky, které se mění v čase, a propojení vodních a dešťových sítí.
- Oblouky v nakreslených zlomových čarách. Standardní tabulky návrhových vozidel: pět vozidel, která se dodávají, jsou označena jako zástupné. Čáry prvků sdílené mezi projekty čekají na týmové projekty.

Vše ostatní najdete v [Ještě není hotovo](topic:not-built-yet).
