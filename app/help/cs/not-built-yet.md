---
title: Ještě není hotovo
summary: Co tato verze CivilCraftu zatím nedělá a co místo toho dělat dnes.
keywords: chybějící, omezení, plán vývoje, není k dispozici, přechodnice, rozšíření, dwg, dxf, vtoky, retence, příčné řezy, připravujeme, limity
from: a2d970ef
---

CivilCraft je v rané fázi. Tato stránka uvádí, co současná verze nedělá, abyste to nehledali. Nic zde není slíbeno k nějakému termínu.

## Body

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Připojení druhého souboru bodů k prvnímu | Nejdříve soubory spojte v textovém editoru nebo tabulkovém procesoru |
| Export textového souboru bodů | Exportujte LandXML (body se vyvedou jako CgPoints), použijte GIS {{ui:Export}} (body s poli P, N, E, Z a D), nebo {{ui:Kopírovat}} body do tabulkového procesoru |
| Styly popisků bodů, symboly podle klíče popisu, oblouky z kódů čar, soubor klíčů popisů ke sdílení mezi projekty | Popisky ukazují číslo, výšku a popis, nebo méně ([Nastavení CivilCraftu](topic:settings)); klíče se ukládají do souboru projektu |
| Převod jednotek | Převeďte soubor před importem; **Jednotky** jen mění popisky |

## Povrchy

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Více než jeden povrch vytvořený z bodů | Jeden projekt na jeden povrch |
| Skrytí vnitřních hranic | Použijte **Nejdelší vnější hrana**, nebo vnější hranici |
| Výběr nebo úprava jedné nakreslené lomové hrany | {{key:Mod+Z}}, nebo {{ui:Odebrat nakreslené lomové hrany}} a nakreslete znovu |
| Úprava povrchu načteného z LandXML (lomové hrany, hranice) | {{ui:Obnovit povrch z bodů}} |
| Úprava povrchu vytvořeného z výškové mřížky | Importujte mřížku znovu s jinými volbami |
| Převod povrchu načteného z LandXML, když se změní souřadnicový systém | Nejdříve {{ui:Obnovit povrch z bodů}} |
| Popsané kóty výšek a hodnoty sklonu | Přečtěte je ve stavovém řádku, nebo obarvěte povrch podle sklonu pomocí **Analýza sklonů** v pracovním prostoru Krajina ([Úpravy terénu pro krajinu](topic:landscape-grading#grading-checks)) |

## Osy tras a profily

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Přechodnice jiné než klotoidy; přechodnice mezi dvěma oblouky (složené přechody) | Klotoidní přechodnice na koncích oblouku jsou k dispozici; ostatní jsou pojmenovány a při importu LandXML přeskočeny |
| Vložení PI mezi dva jiné | Nakreslete osu znovu, nebo přepište souřadnice PI |
| Osy z objektů, odsazení, rozšíření | Kreslete podle PI |
| Zadání K pro svislý oblouk | Napište L (K se zobrazí) |
| Kruhové a nesymetrické svislé oblouky | Pouze symetrické parabolické oblouky |
| Více než jeden návrhový profil na osu | Jedna osa na variantu |
| Přibližování zobrazení profilu, pásy profilu pod profilem | Zobrazení profilu se přizpůsobí celé ose; vytiskněte jej na [listech plánu a profilu](topic:plan-profile-sheets) |
| Řezy v DWG nebo LandXML | Listy řezů jako PDF; {{ui:CSV}} ploch a objemů |
| Vzorkovací čáry pod úhlem, nebo různých šířek podél silnice | Jedna šířka na každé straně pro celou osu |

## Koridory

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Střední dělicí pásy, svodidla a převýšení, které otáčí šablonami | Nakreslete je jako šablony ([Šablony koridorů](topic:corridor-templates)); šablony podle staničení zatím nepřebírají převýšení |
| Plynulá změna mezi šablonami dvou úseků (přechody, zúžení) | Změňte šablonu na staničení, nebo dejte bodu cílovou šířku k čáře nakreslené jako zúžení |
| Otáčení kolem hrany, převýšení v LandXML | Převýšení se na kruhových obloucích otáčí kolem osy; rozšiřte jízdní pruh cílovou šířkou k hranové čáře |
| Cíle pro svahy (napojení na čáru nebo povrch), vlastní povrchy koridorů | Cíle mění hrany vozovky a krajnic ([Koridory](topic:corridor)); koridor se upraví do navrhovaného povrchu |
| Koridory vyvážené jako LandXML vozovky; druhý koridor na ose v exportu IFC | Vyváží se navrhovaný povrch |
| Šablony terénu, které mění navrhovaný povrch, ve 3D nebo v řezech | Dávají plochy a objemy každé vrstvy ([Šablony terénu](topic:corridor-templates#terrain-templates)) |
| Průjezdové trajektorie s rychlostí, skluzem pneumatik, časem řízení, návěsy nebo prostorem karoserie; knihovna standardních návrhových vozidel; průjezdová trajektorie kreslená tažením vozidla | Průjezdové trajektorie při nízké rychlosti podél hranové čáry nebo osy, s vašimi vlastními rozměry vozidel ([Průjezdové trajektorie vozidel](topic:swept-paths)) |

## Úpravy terénu a objemy

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Bermy, otevřené hranové čáry upravené do návrhu, úprava k hranové čáře z jiného místa | Uzavřete hranovou čáru ([Hranové čáry](topic:feature-lines)), nebo ji použijte jako lomovou hranu stávajícího terénu |
| Vložení nebo odebrání vrcholu hranové čáry | Nakreslete čáru znovu, nebo udělejte její odsazení po schodech |
| Oblouky v nakreslených lomových hranách (přes zaměřené body), přechodnice v hranových čarách | Nakreslete hranovou čáru s oblouky a použijte ji jako lomovou hranu stávajícího terénu |
| Úprava do vzdálenosti, výšky nebo jiného povrchu | Napojení pouze na stávající terén |
| Přidání nebo odebrání rohu plošiny | Smažte plošinu a nakreslete ji znovu |
| Objemy TIN-na-TIN (hranoly), volba velikosti buňky mřížky | Metoda mřížky, velikost buňky zvolena za vás |
| Nárůst a úbytek, ornice, hloubky konstrukce vozovky | Faktory na vykázaná čísla použijte sami |
| Náklady na volný a nadměrný převoz, převoz napříč různými osami, výpůjční jámy a odvalové místo umístěné na plánu | Diagram hmot s body vyrovnání, přemístěnými objemy a průměrnými dopravními vzdálenostmi |

## Sítě potrubí

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Více než jedna síť na projekt | Samostatné projekty pro dešťovou a splaškovou kanalizaci |
| Vodovodní řady: jakost a stáří vody, řízení podle pravidel, jiné typy armatur (regulace průtoku, škrticí, udržovací), čerpadla zadaná výkonem, odběr závislý na tlaku, volba Darcy–Weisbach, katalog potrubí s tloušťkami stěn a třídami tlaku. Zbytek tlakových sítí je v laboratoři: [Vodovodní řady](topic:water-mains) | Zkontrolujte je v softwaru pro rozvod vody; splaškové návrhové průtoky jsou v [Splaškové návrhové průtoky](topic:sanitary-design) |
| Průtoky stokou v čase (hydrogramy, dynamické vedení, akumulace, čerpadla, přepady) | [Splaškové návrhové průtoky](topic:sanitary-design) uvádí ustálený špičkový průtok, který návrhový list používá |
| Kapacita vtoku, rozliv v žlabu, retenční vedení, hydrogramy, ztráty energie jiné než jeden koeficient na spoji | Zkontrolujte je v jiném softwaru; průtoky, dimenze a čáry hydraulického spádu jsou v [Dešťová kanalizace](topic:storm-drainage) |
| Povodí v tiskovém PDF, DWG, DXF nebo LandXML; povodí z povrchu (rozvodí) | Kreslete povodí ručně; ukládají se do souboru projektu |
| Katalogy potrubí, nekruhová potrubí, objekty, které nejsou svislé kvádry nebo válce (kužely, stupně, odsazení), kategorie odvodnění v knihovně | Typy objektů podle parametrů ([Síť potrubí](topic:pipe-network)); potrubí s průměrem |
| Potrubí v zobrazení profilu, zakřivená potrubí | Čtěte dna a krytí v pravém panelu |

## Parcely

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Rozdělení pozemků podle plochy nebo čela, parcely z čar kolem nich, dopravní pás | Nakreslete každou parcelu podle jejích rohů, nebo zadejte její úseky |
| Tabulky oblouků a tabulky čar na plánu; popisky přesouvané ručně | Každý úsek je popsán podél své délky |
| Parcely v LandXML | Parcely se ukládají do souboru projektu a jdou do PDF, DWG a DXF |

## Polygonové pořady

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Vyrovnání metodou nejmenších čtverců, tranzitní pravidlo, vážení úhlů podle délek | Kompasové pravidlo |
| Úhly směrových odchylek, zenitové úhly a šikmé vzdálenosti, nadmořské výšky trigonometrickou nivelací | Správně přepočtěte na vodorovné vzdálenosti a úhly, nebo na směrníky |
| Vedlejší záměry, surová data z měřicích přístrojů | Importujte body jako soubor bodů |

## Vytyčování

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Odsazené kolíky (referenční body za kolíkem), svahové kolíky v bodě napojení | Vytyčte v odsazeních, která potřebujete, včetně míst za krajnicí |
| Odesílání kolíků přímo do vlastního formátu měřicího přístroje | CSV se otevře v kancelářském softwaru většiny měřicích přístrojů |
| Vytyčování potrubí, plošin a parcel | Použijte zaměřené body blízko osy, nebo lomy parcely |

## Soubory a výstup

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Text, šrafy a kóty z DWG nebo DXF; prostor listu; propojené výkresy (xref); binární DXF | Čáry z prostoru modelu se otevřou ([Otevřít DWG nebo DXF jako čáry](topic:open-dwg-dxf)); propojené výkresy otevřete samostatně |
| Přesun několika bodů najednou tažením | Vyjměte a vložte je, nebo je upravujte jeden po druhém |
| Listy na výšku, vlastní razítka, výřezy, které uspořádáte, listy plánu a profilu v DWG | Jeden list plánu na šířku na PDF, nebo listy plánu a profilu podél osy (PDF) |
| Vykreslování pásů výšek a profilů | Pásy jsou jen na obrazovce; pořiďte snímek obrazovky, pokud je potřebujete |
| Změna názvů vrstev, barev nebo stylů popisků | Změňte je v CAD programu po exportu DXF |
| Ukládání do cloudu a historie verzí | Ukládejte soubory `.civilcraft.json` a zálohujte je; pro společnou práci na jednom projektu použijte živou relaci v CadCraft Studio ([Navrhněte jednu lokalitu společně živě](topic:work-live)) |
| CadCraft Studio pro iPad a iPhone a z Google Play | Použijte CivilCraft v prohlížeči na zařízení; na Androidu se CadCraft Studio instaluje z APK na getcadcraft.com/download |
| Otevření několika souborů bodů nebo projektů najednou | Jeden soubor na jedno otevření (soubory GIS, které patří k sobě, například části shapefile, se otevřou společně) |

## Krajina

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Hlavice a trysky výrobců | Obecné hlavice, nebo přidejte vlastní hlavice ze souboru; údaje výrobců přicházejí podle toho, jak udělí souhlas |
| Maximální délky vedlejších větví kapkových vedení, průtoky v čase, čerpadla, smyčkové sítě potrubí | Držte kapková vedení v délce, kterou výrobce uvádí; kontrola vyžaduje větvenou síť |
| Přesný obrys konkávního volného objektu; jeho objem pod terénem změřený přesně | Konvexní obal je upraven a objem pod terénem je odhad (uvedeno ve Vlastnostech) |
| Rostliny v knihovnách BimCraft a ModelCraft (Umístit z knihovny) | Exportujte IFC krajiny a otevřete jej v BimCraft vedle budovy |
| Podrobné modely rostlin (listy, větve, roční období) v 3D zobrazení; volné objekty a zavlažování v 3D zobrazení | Rostliny se v 3D zobrazují jako jednoduché tvary podle velikosti z seznamu rostlin ([Zobrazení lokality v 3D](topic:site-3d)); rozptyl v ModelCraft vytváří vizualizace výsadby |
| Tvrdé zdi, které na povrchu zadržují upravenou úroveň za sebou | Dejte plošině nebo podložce svislé strany: jsou to opěrné zdi na povrchu ([Úpravy terénu](topic:grading)) |
| Transformace v SVG ve vlastních symbolech; textury a barvy vlastních modelů rostlin GLB; komprimovaná geometrie GLB | Transformace nejdříve zploštěte ve svém kreslicím programu; modely se kreslí v barvě rostliny; exportujte GLB bez komprese ([Grafika rostlin](topic:plant-graphics)) |
| Vlastní seznam rostlin uložený v účtu v knihovně (upravuje se v aplikaci) | Upravte vlastní seznam projektu v tabulce rostlin a uložte jej jako soubor rostlin |
| Nástroje krajiny pro asistenty bez okna (souborový server a příkazový řádek) | Fungují, když je okno CivilCraftu otevřeno ([Nechte AI asistenta pracovat s vaší lokalitou](topic:assistants)) |

## Venkovní vedení

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Standard země zabudovaný v programu (zatěžovací stavy, odstupy, součinitele) | Nastavte hodnoty svého standardu v {{ui:Zatěžovací stavy a limity…}} a uložte je spolu s knihovnou jako balíček k opětovnému použití a sdílení ([Balíčky](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Vodorovná vzdálenost od vodiče ke koruně stromu nebo ke zdi vedle vedení | Svislý odstup nad rostlinami a zdmi, které vedení překračuje ([Kontroly venkovního vedení](topic:power-line-checks#clearances)) |
| Dotahování vodiče (creep) a protažení nového vodiče | Počítejte s nimi přes teploty v tabulce napínání |
| Tepelné zatížení zakopaných kabelů (proudové zatížení podle způsobu uložení) | Zadejte proudové zatížení od dodavatele u položky kabelu |
| Studie zkratů, ochran a uzemnění | Použijte specializovaný elektrotechnický program; CivilCraft dává délky sítě a kabely |
| Příhradové stožáry navrhované prvek po prvku a kotvy v půdě | Podpěry se kontrolují jmenovitým zatížením; kotvení jejich jmenovitým zatížením |
| Soubor studie `.DON` kontrolovaný v programu, který jej čte | Zkontrolujte soubor tam; pošlete nám vzorek, abychom mohli testovat na skutečném souboru |
| Venkovní vedení ve 3D zobrazení a v IFC | Plán, profil vedení, listy a vrstvy GIS |
| Nástroje pro venkovní vedení pro asistenty bez okna | Fungují, když je okno CivilCraftu otevřeno ([Nechte AI asistenta pracovat s vaší lokalitou](topic:assistants)) |

## Hmoty budov

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Knihovna územních plánů nebo pravidel libovolného města | Zadejte limity z vlastní vyhlášky ([Limity zástavby](topic:zoning-limits)) |
| Denní světlo na stěnách (světlo z oblohy na fasádě), vítr | [Hodiny slunce](topic:sun-hours) počítají jen přímé slunce |
| Stín od stromů, rostlin nebo čehokoli, co není nakresleno jako hmota | Nakreslete okolní budovy jako hmoty |
| Tvary střech u hmot | Hmoty s plochými střechami |
| Otvory, střechy a typy stěn, když se hmota vyvíjí v BimCraft | BimCraft staví jednoduché vnější stěny na každém podlaží a podlahu; ostatní přidejte tam |

## GIS a souřadnicové systémy

| Ještě není hotovo | Místo toho dnes |
|---|---|
| File Geodatabase; styly KML, ikony, překryvy terénu a síťové odkazy | Nejdříve převeďte na GeoPackage, shapefile nebo GeoJSON; značky KML se čtou bez stylů |
| Úprava prvků GIS nebo jejich atributů | Upravte je v GIS programu a importujte znovu. Panel Analýza vytváří nové vrstvy (vyrovnávací pásmo, překrytí, spojení, výběr) a přidává pole plochy a délky, ale prvek na místě neupravuje |
| Síťová a rastrová analýza, vyrovnávací pásma s plochými nebo čtvercovými konci a jednostranná vyrovnávací pásma, přidávání nebo mazání řádků a změna typu pole v tabulce atributů, ruční barvy tříd, legenda stylu v tiscích | Použijte {{ui:Výběr}} k výběru prvků a vytvořte z nich vrstvu; ploché konce se nenabízejí. Barvení podle atributu a tabulka atributů jsou hotové: viz [Stylizace vrstvy podle atributu](topic:gis-symbology) a [Práce s tabulkou atributů vrstvy](topic:gis-table) |
| Styly popisků (velikost, umístění) a popisky, které se vyhýbají sobě | Popisky mají jednu velikost a mohou se překrývat tam, kde jsou prvky husté |
| Výškové datum a modely geoidu | Výšky se používají tak, jak je soubor dává; výškové datum zkontrolujte sami |
| Posuny sítě jiné než NAD27 na NAD83 navržené podle oblasti (OSTN15, NTv2 pro jiná datum fungují, když přidáte soubor), více sítí najednou, výškové sítě | Pro své datum přidejte soubor sítě sami; jedna síť na projekt |
| Mapové vrstvy v DXF nebo ve 3D exportech | Mapové vrstvy jdou do tiskového PDF a vedle DWG jako obrázek |
| Mapové servery, které vyžadují přihlášení, klíč nebo token | Použijte veřejné služby, nebo soubor obrázku s georeferencí |
| Zápis souborů LAS nebo LAZ z povrchu, z modelu terénu nebo z nástrojů výškové mřížky a LiDAR | Exportujte povrchy jako výškovou mřížku GeoTIFF. Doplněk [Mračna bodů](topic:point-clouds) zapisuje vyčištěný mrak jako LAS 1.4 nebo LAZ |
| Intenzita, barva a odrazy LiDAR; výškové mřížky s několika pásy; mřížkové nebo LiDAR soubory nad 200 MB | LiDAR se filtruje jen podle třídy, mřížky používají svůj první pás; velké soubory nejdříve rozdělte na dlaždice |

## Vstup

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Výběr obdélníkem dotykem (vyžaduje {{key:Shift}}) | Dlouhým stiskem přidejte každý zaměřený bod |
| Zadání souřadnic nebo vzdáleností při kreslení | Kreslete přibližně, pak zadejte přesné souřadnice PI do tabulky PI osy |
| Zadání souřadnic rohů plošin a objektů | Táhněte jejich úchyty; pro přesnost přibližte a sledujte E a N ve stavovém řádku |
| Přichytávání k objektům (kromě zaměřených bodů pro lomové hrany) | Přibližte a sledujte stavový řádek |

## Zobrazení 3D

| Ještě není hotovo | Místo toho dnes |
|---|---|
| Kreslení nebo úprava ve 3D zobrazení | Kreslete a upravujte v plánu; 3D zobrazení sleduje každou úpravu |
| Výběr hranových čar koridoru nebo prvků GIS kliknutím ve 3D | Klikněte na ně v plánu |
| Export zveličeného zobrazení nebo ve stopách | Exporty jsou ve skutečném měřítku v metrech; viz [Export lokality do 3D](topic:export-3d) |
| Popisky v exportech GLB nebo OBJ, velikosti a styly popisků ve 3D | Popisky se zobrazují jen v 3D zobrazení, jednou velikostí; viz [Zobrazení lokality v 3D](topic:site-3d) |
| Textury z fotografií, nahrávání jízdy jako videa, stíny od objektů mimo lokalitu, hodiny slunce zobrazené ve 3D | Mapové vrstvy přichycené na povrchy; jízda a poloha slunce v jeden čas; [hodiny slunce](topic:sun-hours) pro den nebo sezónu na plánu |
