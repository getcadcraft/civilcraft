---
title: Ešte nie je hotové
summary: Čo táto zostava CivilCraft zatiaľ nerobí a čo robiť namiesto toho dnes.
keywords: chýbajúce, obmedzenia, plán vývoja, nie je k dispozícii, špirály, rozširovanie, dwg, dxf, vtoky, zdrž, priečne rezy, neskôr, limity
from: a2d970ef
---

CivilCraft je v rannom štádiu. Táto stránka uvádza, čo aktuálna zostava nerobí, aby ste to nehľadali. Pre nič tu nie je sľúbený termín.

## Body

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Pridanie druhého súboru bodov k prvému | Súbory najskôr spojte v textovom editore alebo tabuľkovom procesore |
| Export textového súboru bodov | Exportujte LandXML (body sa exportujú ako CgPoints), použite GIS {{ui:Export}} (body s poľami P, N, E, Z a D) alebo {{ui:Copy}} body do tabuľkového procesora |
| Štýly popiskov bodov, symboly podľa kľúča popisu, krivky (oblúky) z kódov čiar, súbor kľúčov popisov na zdieľanie medzi projektmi | Popisky zobrazujú číslo, výšku a popis, alebo menej ([Nastavenia CivilCraft](topic:settings)); kľúče sa uchovávajú v súbore projektu |
| Prevod jednotiek | Pred importom prepočítajte súbor; **Jednotky** iba prepisujú označenie |

## Povrchy

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Viac ako jeden povrch vytvorený z bodov | Jeden projekt na jeden povrch |
| Skrytie (vnútorných) hraníc | Použite **Najdlhšia vonkajšia hrana** alebo vonkajšiu hranicu |
| Výber alebo úprava jednej nakreslenej hrany zlomu | {{key:Mod+Z}}, alebo {{ui:Remove drawn breaklines}} a nakreslite znova |
| Úprava povrchu načítaného z LandXML (hrany zlomu, hranica) | {{ui:Rebuild the surface from the points}} |
| Úprava povrchu vytvoreného z mriežky výšok | Importujte mriežku znova s inými voľbami |
| Prevod povrchu načítaného z LandXML, keď sa zmení súradnicový systém | Najskôr {{ui:Rebuild the surface from the points}} |
| Označené bodové výšky a hodnoty sklonu | Prečítajte ich v stavovom riadku, alebo sfarbite povrch podľa sklonu pomocou **Analýza sklonu** v pracovnom priestore Krajina ([Úprava terénu pre krajinu](topic:landscape-grading#grading-checks)) |

## Trasy a profily

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Špirály iné než klotoidy; špirála medzi dvoma oblúkmi (zložené prechody) | Klotoidné špirály na koncoch oblúka sú k dispozícii; ostatné sa pri importe z LandXML pomenujú a preskočia |
| Vloženie PI medzi dva iné | Trasu nakreslite znova, alebo znova zadajte súradnice PI |
| Trasy z objektov, odsadení, rozšírení | Kreslite podľa PI |
| Zadanie K pre zvislú krivku | Zadajte L (zobrazí sa K) |
| Kruhové a nesymetrické zvislé krivky | Iba symetrické parabolické krivky |
| Viac ako jeden návrhový profil na trasu | Jedna trasa na variant |
| Zväčšenie pohľadu na profil, pásy profilu pod profilom | Pohľad na profil sa prispôsobí celej trase; vykreslite ho na [listoch pôdorysu a profilu](topic:plan-profile-sheets) |
| Rezy v DWG alebo LandXML | Listy rezov ako PDF; {{ui:CSV}} plôch a objemov |
| Vzorkovacie čiary pod uhlom alebo rôznych šírok pozdĺž cesty | Jedna šírka na každú stranu pre celú trasu |

## Koridory

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Deliace pásy, zvodidlá a prevýšenie, ktoré otáča šablóny | Kreslite ich ako šablóny ([Šablóny koridorov](topic:corridor-templates)); šablóny podľa staničenia zatiaľ nepoužívajú prevýšenie |
| Postupná zmena medzi šablónami dvoch oblastí (prechody, zúženia) | Zmeňte šablónu v staničení, alebo nastavte bodu cieľovú šírku pre čiaru nakreslenú ako zúženie |
| Otáčanie okolo hrany, prevýšenie v LandXML | Prevýšenie sa na kruhových oblúkoch otáča okolo osi; jazdný pruh rozšírte cieľovou šírkou na charakteristickú čiaru |
| Cieľové hodnoty pre sklony svahov (napojenie na čiaru alebo povrch), vlastné povrchy koridoru | Cieľové hodnoty posúvajú hrany vozovky a krajníc ([Koridory](topic:corridor)); koridor sa upraví do navrhovaného povrchu |
| Koridory exportované ako vozovky LandXML; druhý koridor na jednej trase v exporte IFC | Exportuje sa navrhovaný povrch |
| Šablóny terénu, ktoré menia navrhovaný povrch, v 3D alebo v rezoch | Dávajú plochy a objemy každej vrstvy ([Šablóny terénu](topic:corridor-templates#terrain-templates)) |
| Dráhy vozidla s rýchlosťou, šmyk pneumatík, čas natáčania riadenia, prívesy s riadením alebo voľný priestor karosérie; knižnica štandardných návrhových vozidiel; dráha vozidla kreslená ťahaním vozidla | Dráhy vozidla pri nízkej rýchlosti pozdĺž charakteristickej čiary alebo trasy s vlastnými rozmermi vozidla ([Dráhy vozidla](topic:swept-paths)) |

## Úprava terénu a objemy

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Terasy, otvorené charakteristické čiary upravené do návrhu, úprava k charakteristickej čiare z iného miesta | Uzavrite charakteristickú čiaru ([Charakteristické čiary](topic:feature-lines)), alebo ju použite ako hranu zlomu jestvujúceho terénu |
| Vloženie alebo odstránenie vrcholu charakteristickej čiary | Nakreslite čiaru znova, alebo z nej vytvorte stupňovité odsadenie |
| Oblúky v nakreslených hranách zlomu (cez body zamerania), špirály v charakteristických čiarach | Nakreslite charakteristickú čiaru s oblúkmi a použite ju ako hranu zlomu jestvujúceho terénu |
| Úprava na vzdialenosť, výšku alebo iný povrch | Napojenie iba na jestvujúci terén |
| Pridanie alebo odstránenie rohu plošiny | Zmažte plošinu a nakreslite ju znova |
| Objemy TIN-TIN (hranolové), voľba veľkosti buniek mriežky | Metóda mriežky, veľkosť buniek vybraná za vás |
| Nabobtnanie a zmrštenie, ornica, hrúbky vozovky | Faktory aplikujte na uvedené čísla sami |
| Náklady na voľný odvoz a nadmerný odvoz, odvoz medzi rôznymi trasami, výpožičkové jamy a skládky umiestnené v pôdoryse | Diagram bilancie zemín s bodmi vyrovnania, presunutými objemami a priemernými vzdialenosťami odvozu |

## Potrubné siete

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Viac ako jedna sieť v projekte | Samostatné projekty pre dažďovú a splaškovú kanalizáciu |
| Vodovodné potrubia: kvalita a vek vody, riadenie podľa pravidiel, iné typy ventilov (regulačný, škrtiaci, udržiavací), čerpadlá dané výkonom, odber závislý od tlaku, možnosť Darcy–Weisbach, katalóg potrubí s hrúbkami stien a tlakovými triedami. Zvyšok tlakových sietí je v laboratóriu: [Vodovodné potrubia](topic:water-mains) | Tieto skontrolujte v softvéri pre rozvod vody; splaškové návrhové prietoky sú v [Splaškové návrhové prietoky](topic:sanitary-design) |
| Prietoky kanalizácie v čase (hydrogramy, dynamické smerovanie, akumulácia, čerpadlá, prepady) | [Splaškové návrhové prietoky](topic:sanitary-design) dáva ustálený špičkový prietok, ktorý používa návrhový list |
| Kapacita vtoku, rozliatie vody v žľabe, smerovanie so zdržaním, hydrogramy, straty energie okrem jedného koeficientu na spoji | Skontrolujte ich v inom softvéri; prietoky, rozmery a čiary hydraulického sklonu sú v [Dažďová kanalizácia](topic:storm-drainage) |
| Zachytávacie plochy vo výstupe PDF, DWG, DXF alebo LandXML; zachytávacie plochy z povrchu (povodia) | Zachytávacie plochy kreslite ručne; ukladajú sa do súboru projektu |
| Katalógy potrubí, nekruhové potrubia, objekty, ktoré nie sú zvislé boxy alebo valce (kužele, stupne, lavice), kategória odvodnenia v knižnici | Typy objektov z parametrov ([Potrubná sieť](topic:pipe-network)); potrubia s priemerom |
| Potrubia v pohľade na profil, zakrivené potrubia | Dná a krytie odčítajte v pravom paneli |

## Parcely

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Rozmiestnenie pozemkov podľa plochy alebo čelnej strany, parcely z čiar okolo nich, právo prechodu | Nakreslite každú parcelu podľa jej rohov, alebo zadajte jej údaje z listiny |
| Tabuľky krivok a tabuľky čiar v pôdoryse; popisky presúvané ručne | Každý úsek je popísaný pozdĺž seba |
| Parcely v LandXML | Parcely sa ukladajú do súboru projektu a idú do PDF, DWG a DXF |

## Polygónové ťahy

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Vyrovnanie metódou najmenších štvorcov, transitné pravidlo, váženie uhlov voči vzdialenostiam | Kompasové pravidlo |
| Uhly odklonu, zenitové uhly a šikmé vzdialenosti, výšky trigonometrickým nivelovaním | Správne zredukujte na vodorovné vzdialenosti a uhly, alebo použite smery |
| Bočné zábery, surové dátové súbory zo zberačov dát | Importujte body ako súbor bodov |

## Vytyčovanie

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Odsadené vytyčovacie body (referenčné body odsadené od kolíka), kolíky sklonu pri bode dotyku | Vytyčte v odsadeniach, ktoré potrebujete, aj za krajnicou |
| Priame posielanie kolíkov vo formáte zberača dát | CSV sa otvorí v kancelárskom softvéri väčšiny zberačov dát |
| Vytyčovanie potrubí, plošín a parciel | Použite body zamerania blízko trasy, alebo úseky parcely |

## Súbory a výstup

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Text, šrafovania a kóty z DWG alebo DXF; papierový priestor; prepojené výkresy (xref); binárny DXF | Čiarová grafika z priestoru modelu sa otvorí ([Otvorenie DWG alebo DXF ako čiarovej grafiky](topic:open-dwg-dxf)); prepojené výkresy otvorte samostatne |
| Presun viacerých bodov naraz ťahaním | Vystrihnite a prilepte ich, alebo ich upravte jeden po druhom |
| Zvislé formáty listov, vlastné popisové polia, výrezy, ktoré usporiadate, pôdorysné a profilové listy v DWG | Jeden list pôdorysu na šírku v PDF, alebo listy pôdorysu a profilu pozdĺž trasy (PDF) |
| Vykresľovanie pásov výšok a profilov | Pásy sú len na obrazovke; ak ich potrebujete, urobte snímku obrazovky |
| Zmena názvov vrstiev, farieb alebo štýlov popiskov | Zmeňte ich v CAD programe po exporte DXF |
| Ukladanie do cloudu a história verzií | Ukladajte súbory `.civilcraft.json` a zálohujte ich; na spoločnú prácu na jednom projekte použite živú reláciu v CadCraft Studio ([Navrhnite jednu lokalitu spoločne naživo](topic:work-live)) |
| CadCraft Studio pre iPad a iPhone a z Google Play | Používajte CivilCraft v prehliadači na zariadení; na Androide sa CadCraft Studio nainštaluje z APK na getcadcraft.com/download |
| Otváranie viacerých súborov bodov alebo projektov naraz | Jeden súbor pri každom otvorení (GIS súbory, ktoré k sebe patria, napríklad časti shapefile, sa otvoria spolu) |

## Krajina

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Výrobcovia hláv a dýz | Všeobecné hlavy, alebo pridajte vlastné hlavy zo súboru; údaje výrobcov sa pridajú, keď na to dajú povolenie |
| Maximálne dĺžky bočných vetiev pre kvapkové vedenia, prietoky v čase, čerpadlá, slučkové potrubné siete | Kvapkové vetvy držte v dĺžke, ktorú zverejnil výrobca; kontrola vyžaduje rozvetvenú sieť |
| Presný obrys konkávneho voľného objektu; jeho objem pod zemou meraný presne | Konvexný obal sa upraví a objem pod zemou je odhad (uvedený vo Vlastnostiach) |
| Rastliny vo vlastnej funkcii Umiestniť z knižnice v BimCraft a ModelCraft | Exportujte krajinu IFC a otvorte ju v BimCraft vedľa budovy |
| Podrobné modely rastlín (listy, vetvy, ročné obdobia) v 3D zobrazení; voľné objekty a závlahy v 3D zobrazení | Rastliny sa v 3D zobrazia ako jednoduché tvary podľa veľkosti zo zoznamu rastlín ([Zobraziť lokalitu v 3D](topic:site-3d)); rozptýlenie v ModelCraft vytvára obrázky výsadby |
| Pevné múry, ktoré na povrchu zadržujú upravenú úroveň za sebou | Dajte plošine alebo ploche zvislé strany: sú to oporné múry na povrchu ([Úprava terénu](topic:grading)) |
| Vlastné symboly SVG s transformáciami; vlastné textúry a farby modelov rastlín GLB; komprimovaná geometria GLB | Transformácie najskôr zploštite v kresliacom programe; modely sa kreslia farbou rastliny; GLB exportujte bez kompresie ([Grafika rastlín](topic:plant-graphics)) |
| Vlastný zoznam rastlín uložený vo vašom účte v Library (upravovaný v aplikácii) | Upravte zoznam projektu v tabuľke rastlín a uložte ho ako súbor rastlín |
| Nástroje krajiny pre asistentov bez okna (file server a príkazový riadok) | Fungujú pri otvorenom okne CivilCraft ([Nechajte AI asistenta pracovať s vašou lokalitou](topic:assistants)) |

## Elektrické vedenia

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Štandard krajiny zabudovaný v programe (zaťažovacie stavy, odstupy, súčinitele) | Nastavte hodnoty svojho štandardu v {{ui:Load cases and limits…}} a uložte ich aj s knižnicou ako balík na opätovné použitie a zdieľanie ([Balíky](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Vodorovná vzdialenosť od vodiča ku korune stromu alebo k múru vedľa vedenia | Zvislý odstup nad rastlinami a múrmi, ktoré vedenie križuje ([Kontroly vedenia](topic:power-line-checks#clearances)) |
| Dotvarovanie vodičov a predĺženie nového vodiča | Zohľadnite ich cez teploty v tabuľke napínania |
| Tepelná zaťažiteľnosť zakopaných káblov (prúdová zaťažiteľnosť z ich uloženia) | Zadajte prúdovú zaťažiteľnosť od dodávateľa do položky kábla |
| Štúdie skratu, ochrany a uzemnenia | Použite špecializovaný elektrotechnický program; CivilCraft poskytuje dĺžky a káble siete |
| Mriežkové stožiare navrhované prvok po prvku a kotvy lán v zemine | Podpery sa kontrolujú podľa menovitého zaťaženia; laná podľa svojho menovitého zaťaženia |
| Súbor štúdie `.DON` kontrolovaný v programe, ktorý ho číta | Skontrolujte súbor tam; pošlite nám vzorku, aby sme mohli testovať na skutočnom súbore |
| Elektrické vedenia v 3D zobrazení a v IFC | Pôdorys, pozdĺžny profil vedenia, listy a vrstvy GIS |
| Nástroje vedenia pre asistentov bez okna | Fungujú pri otvorenom okne CivilCraft ([Nechajte AI asistenta pracovať s vašou lokalitou](topic:assistants)) |

## Zastavané hmoty

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Knižnica zónových kódov alebo pravidiel akéhokoľvek mesta | Zadajte limity z vlastného nariadenia ([Limity zástavby](topic:zoning-limits)) |
| Denné svetlo na stenách (fasádne denné svetlo), vietor | [Doba slnečného svitu](topic:sun-hours) počíta iba priamy slnečný svit |
| Tieň od stromov, rastlín alebo čohokoľvek, čo nie je nakreslené ako hmota | Nakreslite susedné budovy ako hmoty |
| Tvary striech na hmotách | Hmoty s plochou strechou |
| Otvory, strechy a typy stien, keď sa hmota rozvíja v BimCraft | BimCraft postaví jednoduché vonkajšie steny na každom podlaží a strop; doplňte ostatné tam |

## GIS a súradnicové systémy

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| File Geodatabase; štýly KML, ikony, pozemné prekrytia a odkazy na siete | Najskôr prevedte na GeoPackage, shapefile alebo GeoJSON; značky KML sa čítajú bez svojich štýlov |
| Úprava prvkov GIS alebo ich atribútov | Upravte ich v programe GIS a importujte znova. Panel Analýza vytvára nové vrstvy (nárazník, prekrytie, spojenie, výber) a pridáva polia plochy a dĺžky, ale prvok neupravuje na mieste |
| Sieťová a rastrová analýza, nárazníky s plochými alebo štvorcovými koncami a jednostranné nárazníky, pridávanie alebo mazanie riadkov a zmena typu poľa v tabuľke atribútov, ručné farby tried, legenda štýlu vo výstupoch | Použite nástroj Výber na výber prvkov a vytvorte z nich vrstvu; ploché konce sa nepodporujú. Sfarbenie podľa atribútu a tabuľka atribútov sú hotové: pozri [Štýl vrstvy podľa atribútu](topic:gis-symbology) a [Práca s tabuľkou atribútov vrstvy](topic:gis-table) |
| Štítky (veľkosť, umiestnenie) a štítky, ktoré sa navzájom vyhýbajú | Štítky majú jednu veľkosť a môžu sa prekrývať tam, kde sú prvky husto |
| Vertikálne dátumy a geoidové modely | Výšky sa používajú tak, ako ich dáva súbor; dátum výšok skontrolujte sami |
| Posuny mriežok iné než na NAD83 z NAD27 navrhnuté podľa oblasti (OSTN15, NTv2 pre iné dátumy fungujú po pridaní súboru), viacero mriežok naraz, vertikálne mriežky | Pridajte súbor mriežky pre váš dátum sami; jedna mriežka na projekt |
| Mapové vrstvy v DXF alebo v 3D exportoch | Mapové vrstvy idú do PDF výstupu a vedľa DWG ako obrázok |
| Mapové servery, ktoré vyžadujú prihlásenie, kľúč alebo token | Použite verejné služby alebo súbor georeferencovaného obrázka |
| Zápis súborov LAS alebo LAZ z povrchu, z modelu terénu alebo z nástrojov mriežky výšok a LiDAR | Exportujte povrchy ako GeoTIFF mriežku výšok. Doplnok [Oblaky bodov](topic:point-clouds) zapíše vyčistený oblak ako LAS 1.4 alebo LAZ |
| Intenzita, farba a odrazy LiDAR; mriežky výšok s viacerými pásmami; súbory mriežky alebo LiDAR väčšie ako 200 MB | LiDAR sa filtruje iba podľa triedy, mriežky používajú prvé pásmo; veľké súbory najskôr rozdeľte na dlaždice |

## Vstup

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Výber potiahnutím dotykom (vyžaduje {{key:Shift}}) | Dlho stlačte každý bod zamerania, aby ste ho pridali |
| Zadávanie súradníc alebo vzdialeností pri kreslení | Nakreslite zhruba, potom zadajte presné súradnice PI v tabuľke PI trasy |
| Zadávanie súradníc pre rohy plošín a objektov | Potiahnite ich úchyty; pre presnosť priblížte a sledujte E a N v stavovom riadku |
| Prichytenie k objektom (okrem bodov zamerania pre hrany zlomu) | Priblížte a sledujte stavový riadok |

## 3D zobrazenie

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Kreslenie alebo úprava v 3D zobrazení | Kreslite a upravujte v pôdoryse; 3D zobrazenie sleduje každú úpravu |
| Výber charakteristických čiar koridoru alebo prvkov GIS kliknutím v 3D | Kliknite na ne v pôdoryse |
| Export zveličeného zobrazenia alebo v stopách | Exporty sú v skutočnej mierke v metroch; pozri [Export lokality v 3D](topic:export-3d) |
| Popisky v exportoch GLB alebo OBJ, veľkosti a štýly popiskov v 3D | Popisky sa zobrazujú iba v 3D zobrazení, jednej veľkosti; pozri [Zobraziť lokalitu v 3D](topic:site-3d) |
| Textúry z fotografií, nahrávanie jazdy ako video, tiene zo zóny mimo lokality, doba slnečného svitu zobrazená v 3D zobrazení | Vrstvy mapy položené na povrchy; jazda a poloha slnka v jednom čase; [doba slnečného svitu](topic:sun-hours) pre deň alebo sezónu v pôdoryse |
