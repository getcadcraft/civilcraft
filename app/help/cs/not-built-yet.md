---
title: Ještě není hotovo
summary: Co tato verze CivilCraft zatím nedělá a co dělat místo toho.
keywords: chybějící, omezení, plán vývoje, není k dispozici, spirály, rozšíření, dwg, dxf, vpusti, zadržování, příčné řezy, přijde později, limity
from: b91588d4
---

CivilCraft je v rané fázi. Tato stránka uvádí, co aktuální sestava nedělá, abyste to nehledali. Žádná z těchto věcí nemá slíbený termín.

## Body

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Přidání druhého souboru bodů k prvnímu | Nejdřív spojte soubory v textovém editoru nebo tabulkovém procesoru |
| Export textového souboru bodů | Exportujte LandXML (body se vyvezou jako CgPoints), použijte GIS {{ui:Export}} (body s poli P, N, E, Z a D), nebo {{ui:Kopírovat}} body do tabulkového procesoru |
| Styly popisků bodů, symboly podle klíče popisu, křivky (oblouky) z kódů čar, soubor klíčů popisu sdílený mezi projekty | Popisky ukazují číslo, výšku a popis, nebo méně ([Nastavení CivilCraft](topic:settings)); klíče se uchovávají v souboru projektu |
| Převod jednotek | Převeďte soubor před importem; **Jednotky** pouze mění popisek |

## Povrchy

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Více než jeden povrch postavený z bodů | Jeden projekt na jeden povrch |
| Skrytí (vnitřních) hranic | Použijte **Nejdelší vnější hranu**, nebo vnější hranici |
| Výběr nebo úprava jedné nakreslené lomové hrany | {{key:Mod+Z}}, nebo {{ui:Odebrat nakreslené lomové hrany}} a nakreslete znovu |
| Úprava povrchu načteného z LandXML (lomové hrany, hranice) | {{ui:Obnovit povrch z bodů}} |
| Úprava povrchu vytvořeného z výškové sítě | Importujte síť znovu s jinými volbami |
| Převod povrchu načteného z LandXML při změně souřadnicového systému | Nejdřív {{ui:Obnovit povrch z bodů}} |
| Popsané kóty výšek a hodnoty sklonu | Přečtěte je ve stavovém řádku, nebo obarvěte povrch podle sklonu pomocí **Analýza sklonu** v pracovním prostoru Krajina ([Úpravy terénu pro krajinu](topic:landscape-grading#grading-checks)) |

## Osy trasy a profily

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Přechodnice jiné než klotoida; přechodnice mezi dvěma oblouky (složené přechody) | Klotoidní přechodnice na koncích oblouku jsou k dispozici; ostatní jsou pojmenovány a při importu LandXML se přeskočí |
| Vložení PI mezi dva další | Nakreslete osu trasy znovu, nebo přepište souřadnice PI |
| Osy trasy z objektů, odsazení, rozšíření | Kreslete pomocí PI |
| Zadání K pro vertikální oblouk | Zadejte L (K se zobrazí) |
| Kruhové a nesymetrické vertikální oblouky | Pouze symetrické parabolické oblouky |
| Více než jeden návrhový profil na jednu osu trasy | Jedna osa trasy na jednu variantu |
| Zoom pohledu na profil, pásy pod profilem | Pohled na profil zobrazí celou osu trasy; vytiskněte ho na [listech půdorysu a profilu](topic:plan-profile-sheets) |
| Řezy v DWG nebo LandXML | Listy řezů jako PDF; {{ui:CSV}} ploch a objemů |
| Vzorkovací čáry pod úhlem nebo různých šířek podél silnice | Jedna šířka na každou stranu pro celou osu trasy |

## Koridory

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Středové dělicí pásy, svodidla a převýšení, které otáčí šablonami | Nakreslete je jako šablony ([Šablony koridorů](topic:corridor-templates)); šablony podle staničení zatím nepřebírají převýšení |
| Postupná změna mezi šablonami dvou úseků (přechody, zúžení) | Změňte šablonu na staničení, nebo dejte bodu cíl šířky k čáře nakreslené jako zúžení |
| Otáčení kolem hrany, převýšení v LandXML | Převýšení na obloucích se otáčí kolem osy; rozšiřte jízdní pruh cílem šířky ke konstrukční čáře |
| Cíle pro svahy (průsečnice se terénem k čáře nebo povrchu), vlastní povrchy koridorů | Cíle posouvají okraje vozovek a krajnic ([Koridory](topic:corridor)); koridor se zapracuje do navrhovaného povrchu |
| Obrubníkové oblouky, odbočovací pruhy a ostrůvky zapracované do křižovatky; konec vedlejší silnice seříznutý k okraji hlavní silnice v šikmém úhlu; stezka připojená k silnici v půdorysu, v její délce a ploše | Silnice, které se stýkají, se připojí kolmo, okraj hlavní silnice se otevře a vedlejší silnice se k němu zmírní ([Kde se silnice setkávají](topic:corridor#where-roads-meet-roads-pads-and-paths)); stezka končí na okraji silnice v navrhovaném povrchu a ve 3D |
| Koridory exportované jako silnice v LandXML; druhý koridor na ose trasy v exportu IFC | Exportuje se navrhovaný povrch |
| Šablony terénu, které mění navrhovaný povrch, ve 3D nebo v řezech | Dávají plochy a objemy každé vrstvy ([Šablony terénu](topic:corridor-templates#terrain-templates)) |
| Zametací křivky s rychlostí, prokluzem pneumatik, dobou řízení, přívěsy nebo odstupem od karoserie; knihovna standardních návrhových vozidel; zametací křivka kreslená tažením vozidla | Zametací křivky nízkou rychlostí podél konstrukční čáry nebo osy trasy s vašimi vlastními rozměry vozidel ([Zametací křivky vozidel](topic:swept-paths)) |

## Úpravy terénu a objemy

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Bermy, otevřené konstrukční čáry zapracované do návrhu, úprava k konstrukční čáře odjinud | Uzavřete konstrukční čáru ([Konstrukční čáry](topic:feature-lines)), nebo ji použijte jako lomovou hranu stávajícího terénu |
| Vložení nebo odebrání vrcholu konstrukční čáry | Nakreslete čáru znovu, nebo z ní vytvořte odsazení po schodech |
| Oblouky v nakreslených lomových hranách (procházejících body zaměření), přechodnice v konstrukčních čarách | Nakreslete konstrukční čáru s oblouky a použijte ji jako lomovou hranu stávajícího terénu |
| Úprava na vzdálenost, výšku nebo jiný povrch | Pouze průsečnice se stávajícím terénem |
| Přidání nebo odebrání rohu plošiny | Plošinu smažte a nakreslete znovu |
| Objemy TIN-na-TIN (hranoly), volba velikosti buňky sítě | Metoda sítě, velikost buňky je zvolena za vás |
| Nárůst a úbytek, ornice, hloubky vozovky | Použijte koeficienty na vykázaná čísla sami |
| Náklady na volný a dlouhý odvoz, přeprava mezi různými osami, výměnné prostory a odvozová místa umístěná v půdorysu | Diagram zemní bilance s bilančními body, přemístěné objemy a průměrné vzdálenosti přepravy |

## Potrubní sítě

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Více než jedna síť na projekt | Oddělené projekty pro dešťovou a splaškovou kanalizaci |
| Vodovodní řady: jakost a stáří vody, řízení podle pravidel, jiné typy armatur (regulace průtoku, škrticí, udržovací), čerpadla zadaná výkonem, odběr závislý na tlaku, volba Darcy–Weisbach, katalog potrubí s tloušťkami stěn a tlakovými třídami. Zbytek tlakových sítí je ve fázi laboratorního ověřování: [Vodovodní řady](topic:water-mains) | Zkontrolujte je v programu pro rozvod vody; splaškové návrhové průtoky jsou v [Splaškové návrhové průtoky](topic:sanitary-design) |
| Průtoky kanalizací v čase (hydrogramy, dynamické řízení, akumulace, čerpadla, přepady) | [Splaškové návrhové průtoky](topic:sanitary-design) dává ustálený špičkový průtok, se kterým pracuje návrhový list |
| Kapacita vpusti, rozliv žlabem, průtokové řízení retence, hydrogramy, ztráty energie jiné než jeden koeficient na křižovatce | Zkontrolujte je v jiném softwaru; průtoky, profily a výškové čáry jsou v [Dešťová kanalizace](topic:storm-drainage) |
| Povodí v PDF výstupu, DWG, DXF nebo LandXML; povodí z povrchu (rozvodí) | Povodí kreslete ručně; ukládají se do souboru projektu |
| Katalogy potrubí, nekruhové trouby, objekty, které nejsou svislé krabice nebo válce (kužely, stupně, odsazené hrany), kategorie odvodnění v knihovně | Typy objektů z parametrů ([Potrubní síť](topic:pipe-network)); trouby s průměrem |
| Potrubí v pohledu na profil, zakřivené potrubí | Odečtěte kóty dna a krytí v pravém panelu |

## Parcely

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Rozdělení parcel podle plochy nebo šířky průčelí, parcely z čar kolem nich, ochranné pásmo | Nakreslete každou parcelu podle jejích rohů, nebo zadejte její hraniční údaje |
| Tabulky oblouků a přímek v půdorysu; popisky přesouvané ručně | Každý úsek je popsán podél sebe |
| Parcely v LandXML | Parcely se ukládají do souboru projektu a jdou do PDF, DWG a DXF |

## Polygonové pořady

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Vyrovnání metodou nejmenších čtverců, transit pravidlo, vážení úhlů proti délkám | Kompasové pravidlo |
| Úhly odklonu, zenitové úhly a šikmé vzdálenosti, výšky trigonometrickým nivelováním | Převeďte na vodorovné vzdálenosti a úhly správně, nebo na směrníky |
| Vedlejší zaměřování, surové datové soubory z měřicích přístrojů | Importujte body jako soubor bodů |

## Vytyčování

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Odsazené kolíky (referenční body odsazené od kolíku), svahové kolíky v místě napojení | Vytyčte v odsazeních, která potřebujete, včetně míst za krajnicí |
| Odeslání kolíků přímo ve formátu měřicího přístroje | CSV se otevře v kancelářském softwaru většiny měřicích přístrojů |
| Vytyčení potrubí, plošin a parcel | Použijte body zaměření u osy trasy, nebo úseky parcely |

## Soubory a výstup

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Text, šrafy a kóty z DWG nebo DXF; prostor papíru; propojené výkresy (xref); binární DXF | Kresba z prostoru modelu se otevře ([Otevřít DWG nebo DXF jako kresbu](topic:open-dwg-dxf)); propojené výkresy otevřete samostatně |
| Přesun více bodů najednou tažením | Vyjměte a vložte je, nebo je upravujte po jednom |
| Listy na výšku, vlastní razítka, výřezy, které si uspořádáte, listy půdorysu a profilu v DWG | Jeden list půdorysu na šířku na PDF, nebo listy půdorysu a profilu podél osy trasy (PDF) |
| Vykreslení pásů výšek a profilů | Pásy jsou jen na obrazovce; pokud je potřebujete, pořiďte snímek obrazovky |
| Změna názvů vrstev, barev nebo stylů popisků | Změňte je v CAD programu po exportu DXF |
| Ukládání do cloudu a historie verzí | Ukládejte soubory `.civilcraft.json` a zálohujte je; pro společnou práci na jednom projektu použijte živou relaci v CadCraft Studio ([Navrhujte jednu lokalitu společně, živě](topic:work-live)) |
| CadCraft Studio pro iPad a iPhone a z Google Play | Používejte CivilCraft v prohlížeči na zařízení; na Androidu se CadCraft Studio instaluje z APK na getcadcraft.com/download |
| Otevření více souborů bodů nebo projektů najednou | Jeden soubor na jedno otevření (soubory GIS, které patří k sobě, například části shapefile, se otevřou společně) |

## Krajina

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Hlavice a trysky výrobců | Obecné hlavice, nebo přidejte vlastní hlavice ze souboru; údaje výrobců přijdou, až to výrobci dovolí |
| Maximální délky bočních větví pro kapkovací vedení, průtoky v čase, čerpadla, prstencové sítě potrubí | Držte délky kapkovacích vedení podle zveřejněné délky výrobce; kontrola potřebuje větvenou síť |
| Přesný obrys konkávního volného objektu; jeho podzemní objem změřený přesně | Konvexní obal se upraví a podzemní objem je odhad (uvedeno ve Vlastnostech) |
| Rostliny v nativním Vložení z knihovny v BimCraft a ModelCraft | Exportujte IFC krajiny a otevřete je v BimCraft vedle budovy |
| Podrobné modely rostlin (listy, větve, roční období) ve 3D pohledu; volné objekty a zavlažování ve 3D pohledu | Rostliny se ve 3D zobrazí jako jednoduché tvary podle seznamu rostlin ([Zobrazit lokalitu ve 3D](topic:site-3d)); rozptyl v ModelCraft vytváří vizualizace výsadby |
| Zpevněné zdi, které na povrchu zadrží upravenou úroveň za sebou | Dejte plošině nebo platformě svislé strany: na povrchu jsou opěrnými zdmi ([Úpravy terénu](topic:grading)) |
| Transformace SVG ve vlastních symbolech; textury a barvy vlastních modelů rostlin GLB; komprimovaná geometrie GLB | Nejdřív transformace v kresebním programu zploštěte; modely se kreslí barvou rostliny; exportujte GLB bez komprese ([Grafika rostlin](topic:plant-graphics)) |
| Váš vlastní seznam rostlin uložený ve vašem účtu Knihovna (upravovaný v aplikaci) | Upravte seznam projektu v tabulce rostlin a uložte jej jako soubor rostlin |
| Nástroje krajiny pro asistenty bez okna (souborový server a příkazový řádek) | Fungují, když je okno CivilCraft otevřené ([Nechte AI asistenta pracovat s vaší lokalitou](topic:assistants)) |

## Vedení vysokého napětí

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Vestavěná norma země (zatěžovací stavy, odstupy, součinitele) | Nastavte hodnoty své normy v {{ui:Zatěžovací stavy a limity…}} a uložte je spolu se svou knihovnou jako balíček k opakovanému použití a sdílení ([Balíčky](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Vodorovná vzdálenost od vodiče ke koruně stromu nebo ke zdi vedle vedení | Svislý odstup nad rostlinami a zdmi, které vedení přechází ([Kontroly vedení](topic:power-line-checks#clearances)) |
| Dotvarování vodiče a prodloužení nového vodiče | Počítejte s nimi přes teploty v tabulce napínání |
| Tepelná zatížitelnost zemních kabelů (proudová zatížitelnost podle způsobu uložení) | Zadejte proudovou zatížitelnost od dodavatele k položce kabelu |
| Studie zkratů, ochran a uzemnění | Použijte specializovaný elektrotechnický program; CivilCraft dává délky a kabely sítě |
| Příhradové stožáry navrhované prut po prutu a kotvy lan v zemině | Podpory se kontrolují podle jmenovitého zatížení; lana podle jmenovité zatížitelnosti |
| Soubor studie `.DON` kontrolovaný v programu, který jej čte | Zkontrolujte soubor tam; pošlete nám vzorek, abychom mohli testovat na skutečném souboru |
| Vedení ve 3D pohledu a v IFC | Půdorys, profil vedení, listy a vrstvy GIS |
| Nástroje vedení pro asistenty bez okna | Fungují, když je okno CivilCraft otevřené ([Nechte AI asistenta pracovat s vaší lokalitou](topic:assistants)) |

## Zastavěné hmoty

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Knihovna územních plánů nebo pravidel jakéhokoli města | Zadejte limity z vlastní vyhlášky ([Limity zástavby](topic:zoning-limits)) |
| Denní světlo na stěnách (osvětlení fasády), vítr | [Hodiny oslunění](topic:sun-hours) počítají jen přímé slunce |
| Stín od stromů, rostlin nebo čehokoli, co není nakresleno jako hmota | Okolní budovy kreslete jako hmoty |
| Tvary střech u hmot | Hmoty s plochými vrchy |
| Otvory, střechy a typy stěn, když je hmota rozpracována v BimCraft | BimCraft staví na každém podlaží a stropu jednoduché vnější stěny; přidejte zbytek tam |

## GIS a souřadnicové systémy

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| File Geodatabase; styly KML, ikony, překryvy terénu a síťové odkazy | Převeďte na GeoPackage, shapefile nebo GeoJSON; značky KML se načtou bez svých stylů |
| Úprava prvků GIS nebo jejich atributů | Upravte je v GIS programu a importujte znovu. Panel Analýza vytváří nové vrstvy (buffer, překryv, spojení, výběr) a přidává pole plochy a délky, ale prvek na místě neupravuje |
| Síťová a rastrová analýza, buffery s rovnými nebo hranatými konci a jednostranné buffery, přidávání nebo mazání řádků a změna typu pole v tabulce atributů, ruční barvy tříd, legenda stylů v tiscích | Použijte Výběr k výběru prvků a vytvořte z nich vrstvu; rovné konce se nenabízejí. Obarvení podle atributu a tabulka atributů jsou hotové: viz [Stylování vrstvy podle atributu](topic:gis-symbology) a [Práce s tabulkou atributů vrstvy](topic:gis-table) |
| Styly popisků (velikost, umístění) a popisky, které se vyhýbají jeden druhému | Popisky jsou jedné velikosti a mohou se překrývat tam, kde jsou prvky husté |
| Výškové systémy a modely geoidu | Výšky se použijí tak, jak je soubor udává; výškový systém zkontrolujte sami |
| Posuny sítí jiné než na NAD83 z NAD27 navržené podle oblasti (OSTN15, NTv2 pro jiná data fungují po přidání souboru), více sítí najednou, výškové sítě | Přidejte soubor sítě pro svůj systém sami; jedna síť na projekt |
| Mapové vrstvy v DXF nebo ve 3D exportech | Mapové vrstvy jdou do PDF tisku a vedle DWG jako obrázek |
| Mapové servery vyžadující přihlášení, klíč nebo token | Použijte veřejné služby, nebo soubor obrazu s georeferencí |
| Zápis souborů LAS nebo LAZ z povrchu, z modelu terénu nebo z nástrojů výškové sítě a LiDAR | Exportujte povrchy jako výškovou síť GeoTIFF. Doplněk [Mračna bodů](topic:point-clouds) zapisuje vyčištěný mrak jako LAS 1.4 nebo LAZ |
| Intenzita, barva a odrazy LiDAR; výškové sítě s více pásmy; soubory sítí nebo LiDAR větší než 200 MB | LiDAR se filtruje jen podle třídy, sítě používají první pásmo; velké soubory nejdřív rozdělte na dlaždice |

## Vstup

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Výběr obdélníkem dotykem (potřebuje {{key:Shift}}) | Dlouhým stiskem každého zaměřeného bodu jej přidáte |
| Zadané souřadnice nebo vzdálenosti při kreslení | Nakreslete zhruba, potom zadejte přesné souřadnice PI v tabulce PI osy trasy |
| Zadávání souřadnic rohů plošin a objektů | Táhněte jejich úchyty; přibližte pro přesnost a sledujte E a N ve stavovém řádku |
| Přichycení k objektům (jiným než body zaměření pro lomové hrany) | Přibližte a sledujte stavový řádek |

## Pohled 3D

| Ještě není hotovo | Místo toho, dnes |
|---|---|
| Kreslení nebo úprava ve 3D pohledu | Kreslete a upravujte v půdorysu; 3D pohled sleduje každou úpravu |
| Výběr konstrukčních čar koridoru nebo prvků GIS kliknutím ve 3D | Klikněte na ně v půdorysu |
| Export zvětšeného pohledu nebo ve stopách | Exporty jsou ve skutečném měřítku v metrech; viz [Exportovat lokalitu ve 3D](topic:export-3d) |
| Popisky v exportech GLB nebo OBJ, velikosti a styly popisků ve 3D | Popisky se zobrazují jen ve 3D pohledu, jedné velikosti; viz [Zobrazit lokalitu ve 3D](topic:site-3d) |
| Textury z fotografií, záznam jízdy jako video, stíny z mimo lokalitu, hodiny oslunění zobrazené ve 3D pohledu | Mapové vrstvy přetažené na povrchy; jízda a poloha slunce v jednom čase; [hodiny oslunění](topic:sun-hours) pro den nebo roční období v půdorysu |
