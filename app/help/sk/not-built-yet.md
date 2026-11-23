---
title: Ešte nie je hotové
summary: Čo táto verzia CivilCraft ešte nerobí a čo namiesto toho urobiť dnes.
keywords: chýbajúce, obmedzenia, plán vývoja, nie je k dispozícii, prechodnice, rozširovanie, dwg, dxf, vpuste, retenčné nádrže, priečne rezy, príde neskôr, limity
from: b91588d4
---

CivilCraft je v ranom štádiu. Táto stránka uvádza, čo aktuálna verzia nerobí, aby ste to nehľadali. Žiadna z týchto vecí nemá sľúbený termín.

## Body

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Pridanie druhého súboru bodov k prvému | Najprv spojte súbory v textovom editore alebo tabuľkovom procesore |
| Export textového súboru bodov | Exportujte LandXML (body idú ako CgPoints), použite GIS {{ui:Export}} (body s poľami P, N, E, Z a D) alebo {{ui:Kopírovať}} body do tabuľkového procesora |
| Štýly popiskov bodov, symboly podľa kľúča popisu, oblúky z kódov čiar, súbor kľúča popisov na zdieľanie medzi projektmi | Popisky zobrazujú číslo, výšku a popis, alebo menej ([Nastavenia CivilCraft](topic:settings)); kľúče sa uchovávajú v projektovom súbore |
| Prevod jednotiek | Pred importom súbor prevediete; **Jednotky** iba prepisujú označenie |

## Povrchy

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Viac ako jeden povrch z bodov | Jeden projekt na jeden povrch |
| Skrytie (vnútorných) hraníc | Použite **Najdlhšiu vonkajšiu hranu** alebo vonkajšiu hranicu |
| Výber alebo úprava jednej nakreslenej hrany zlomu | {{key:Mod+Z}}, alebo {{ui:Odstrániť nakreslené hrany zlomu}} a nakreslite znova |
| Úprava povrchu načítaného z LandXML (hrany zlomu, hranica) | {{ui:Znova vytvoriť povrch z bodov}} |
| Úprava povrchu vytvoreného z mriežky výšok | Mriežku znova importujte s inými voľbami |
| Prevod povrchu načítaného z LandXML, keď sa zmení súradnicový systém | Najprv {{ui:Znova vytvoriť povrch z bodov}} |
| Označené bodové výšky a hodnoty sklonov | Čítajte ich v stavovom riadku, alebo sfarbite povrch podľa sklonu cez **Analýzu sklonu** v pracovnom priestore Krajina ([Úprava terénu pre krajinu](topic:landscape-grading#grading-checks)) |

## Osi trás a profily

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Špirály iné ako klotoida; špirála medzi dvoma oblúkmi (zložené prechody) | Klotoidné špirály na koncoch oblúka sú k dispozícii; ostatné sa pri importe z LandXML pomenujú a preskočia |
| Vloženie PI medzi dva iné | Nakreslite os trasy znova alebo znova zadajte súradnice PI |
| Osi trás z objektov, odsadení, rozšírení | Kreslite podľa PI |
| Písanie K pre zvislý oblúk | Zadajte L (K sa zobrazí) |
| Kruhové a nesymetrické zvislé oblúky | Iba symetrické parabolické zvislé oblúky |
| Viac ako jeden projektový profil na os trasy | Jedna os trasy na jeden variant |
| Priblíženie pohľadu na profil, pásy profilu pod profilom | Pohľad na profil zobrazí celú os trasy; vykreslite ho na [pôdorysných a profilových listoch](topic:plan-profile-sheets) |
| Rezy v DWG alebo LandXML | Listy rezov ako PDF; {{ui:CSV}} plôch a objemov |
| Vzorkovacie čiary pod uhlom alebo rôznych šírok pozdĺž cesty | Jedna šírka na každú stranu pre celú os trasy |

## Koridory

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Stredové deliace pásy, zvodidlá a prevýšenie, ktoré otáča šablóny | Nakreslite ich ako šablóny ([Šablóny koridorov](topic:corridor-templates)); šablóny podľa staničenia zatiaľ neberú prevýšenie |
| Postupná zmena medzi šablónami dvoch regiónov (prechody, zúženia) | Zmeňte šablónu na staničení, alebo dajte bodu cieľ šírky k čiare nakreslenej ako zúženie |
| Otáčanie okolo hrany, prevýšenie v LandXML | Prevýšenie sa otáča okolo osi trasy na kruhových oblúkoch; jazdný pruh rozšírte cieľom šírky k charakteristickej čiare |
| Ciele pre bočné svahy (napojenie na čiaru alebo povrch), vlastné povrchy koridorov | Ciele posúvajú hrany vozovky a krajníc ([Koridory](topic:corridor)); koridor sa zapracuje do navrhovaného povrchu |
| Zaoblenia obrubníkov, odbočovacie pruhy a ostrovčeky zapracované do križovatky; koniec vedľajšej cesty zarezaný na hranu hlavnej cesty pri šikmom uhle; chodník spojený s cestou v pôdoryse, v jeho dĺžke a ploche | Cesty, ktoré sa stretajú, sa spoja kolmo, s otvorenou hranou hlavnej cesty a vedľajšou cestou pozvoľne k nej upravenou ([Kde cesty stretávajú cesty](topic:corridor#where-roads-meet-roads-pads-and-paths)); chodník sa zastaví na hrane cesty v navrhovanom povrchu a v 3D |
| Koridory exportované ako LandXML cestné komunikácie; druhý koridor na osi trasy v exporte IFC | Exportuje sa navrhovaný povrch |
| Šablóny terénu, ktoré menia navrhovaný povrch, v 3D alebo v rezoch | Dávajú plochy a objemy každej vrstvy ([Šablóny terénu](topic:corridor-templates#terrain-templates)) |
| Zametacie trajektórie s rýchlosťou, šmykom pneumatík, časom riadenia, riadenými prívesmi alebo prejazdom karosérie; knižnica štandardných navrhovaných vozidiel; zametacia trajektória kreslená ťahaním vozidla | Nízkorýchlostné zametacie trajektórie pozdĺž charakteristickej čiary alebo osi trasy s vlastnými rozmermi vozidiel ([Zametacie trajektórie vozidiel](topic:swept-paths)) |

## Úprava terénu a objemy

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Terasy, otvorené charakteristické čiary zapracované do návrhu, úprava k charakteristickej čiare z iného miesta | Uzavrite charakteristickú čiaru ([Charakteristické čiary](topic:feature-lines)), alebo ju použite ako hranu zlomu existujúceho terénu |
| Vloženie alebo odstránenie vrcholu charakteristickej čiary | Nakreslite čiaru znova, alebo vytvorte jej schodovité odsadenie |
| Oblúky v nakreslených hranách zlomu (cez body zamerania), špirály v charakteristických čiarach | Nakreslite charakteristickú čiaru s oblúkmi a použite ju ako hranu zlomu existujúceho terénu |
| Úprava do vzdialenosti, výšky alebo k inému povrchu | Iba napojenie na existujúci terén |
| Pridanie alebo odstránenie rohu plošiny | Plošinu zmažte a nakreslite znova |
| Objemy TIN-na-TIN (hranolové), voľba veľkosti mriežkovej bunky | Metóda mriežky, veľkosť bunky vybraná za vás |
| Nabobtnanie a zmrštenie, ornica, hrúbky vozoviek | Faktory uplatnite sami na uvedené čísla |
| Náklady na voľný a nadmerný prevoz, prevoz medzi rôznymi osami trás, výpožičkové jamy a skládky umiestnené v pôdoryse | Diagram bilancie zemín s bodmi vyrovnania, presunuté objemy a priemerné vzdialenosti prevozu |

## Potrubné siete

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Viac ako jedna sieť na projekt | Samostatné projekty pre dažďovú a splaškovú kanalizáciu |
| Vodovodné potrubia: kvalita a vek vody, riadenie podľa pravidiel, iné typy armatúr (regulačné, škrtiace, udržiavacie), čerpadlá zadané výkonom, odber závislý od tlaku, voľba Darcy–Weisbach, katalóg potrubí s hrúbkami stien a tlakovými triedami. Zvyšok tlakových sietí je vo vývoji: [Vodovodné potrubia](topic:water-mains) | Overte ich v softvéri pre rozvod vody; splaškové návrhové prietoky sú v [Splaškové návrhové prietoky](topic:sanitary-design) |
| Prietoky kanalizácie v čase (hydrogramy, dynamické smerovanie, akumulácia, čerpadlá, prepady) | [Splaškové návrhové prietoky](topic:sanitary-design) dáva ustálený špičkový prietok, ktorý použije návrhový list |
| Kapacita vpustí, rozliatie v žľabe, smerovanie retencie, hydrogramy, straty energie iné ako jeden koeficient na križovatke | Overte ich v inom softvéri; prietoky, rozmery a čiary spádu sú v [Odvodnení dažďovej vody](topic:storm-drainage) |
| Povodia vo výstupe PDF, DWG, DXF alebo LandXML; povodia z povrchu (rozvodnice) | Povodia kreslite ručne; ukladajú sa do projektového súboru |
| Katalógy potrubí, nekruhové potrubia, konštrukcie, ktoré nie sú kolmé boxy alebo valce (kužele, schody, obkladanie), kategória odvodnenia v knižnici | Typy konštrukcií z parametrov ([Potrubná sieť](topic:pipe-network)); potrubia s priemerom |
| Potrubia v pohľade na profil, zakrivené potrubia | Čítajte spodné hrany a krytie v pravom paneli |

## Parcely

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Rozdeľovanie parciel podľa plochy alebo čelnej čiary, parcely z čiar okolo nich, priestor pre cestu (right-of-way) | Nakreslite každú parcelu podľa jej rohov, alebo zadajte jej dĺžky a uhly |
| Tabuľky oblúkov a tabuľky čiar v pôdoryse; popisy presúvané ručne | Každý úsek je popísaný pozdĺž seba |
| Parcely v LandXML | Parcely sa ukladajú do projektového súboru a idú do PDF, DWG a DXF |

## Polygónové ťahy

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Vyrovnanie metódou najmenších štvorcov, tranzitné pravidlo, váženie uhlov voči vzdialenostiam | Kompasové pravidlo |
| Uhly odklonu, zenitové uhly a šikmé vzdialenosti, výšky trigonometrickým niveláním | Redukujte na vodorovné vzdialenosti a uhly správne, alebo na smery |
| Bočné záznamy, surové dátové súbory z terénnych zberných zariadení | Importujte body ako súbor bodov |

## Vytyčovanie

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Odsadené kolíky (referenčné body odsadené od kolíka), kolíky svahov v bode napojenia | Vytýčte v odsadeniach, ktoré potrebujete, vrátane miest za krajnicou |
| Odosielanie kolíkov priamo vo formáte zberného zariadenia | CSV sa otvorí v kancelárskom softvéri väčšiny zberných zariadení |
| Vytyčovanie potrubí, plošín a parciel | Použite body zamerania pri osi trasy alebo úseky parcely |

## Súbory a výstup

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Text, šrafy a kóty z DWG alebo DXF; papierový priestor; prepojené výkresy (xrefs); binárny DXF | Čiarová kresba z priestoru modelu sa otvorí ([Otvorenie DWG alebo DXF ako čiarovej kresby](topic:open-dwg-dxf)); prepojené výkresy otvorte samostatne |
| Presúvanie viacerých bodov naraz ťahaním | Vystrihnite a prilepte ich, alebo ich upravte jeden po druhom |
| Formáty na výšku, vlastné popisové polia, výrezy, ktoré si usporiadate, pôdorysné a profilové listy v DWG | Jeden pôdorysný list na šírku na PDF, alebo pôdorysné a profilové listy pozdĺž osi trasy (PDF) |
| Vykreslenie pásov výšok a profilov | Pásy sú iba na obrazovke; ak ich potrebujete, urobte snímku obrazovky |
| Zmena názvov hladín, farieb alebo štýlov popiskov | Zmeňte ich v CAD programe po exporte DXF |
| Cloudové ukladanie a história verzií | Súbory `.civilcraft.json` ukladajte a zálohujte; ak chcete na jednom projekte pracovať spoločne, použite živú reláciu v CadCraft Studio ([Navrhnite jednu lokalitu spoločne, naživo](topic:work-live)) |
| CadCraft Studio pre iPad a iPhone a z Google Play | Použite CivilCraft v prehliadači na zariadení; na Androide sa CadCraft Studio nainštaluje zo svojho APK na getcadcraft.com/download |
| Otvorenie viacerých súborov bodov alebo projektov naraz | Jeden súbor naraz (GIS súbory, ktoré k sebe patria, napríklad časti shapefile, sa otvoria spolu) |

## Krajina

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Hlavice a trysky výrobcov | Generické hlavice, alebo pridajte vlastné zo súboru; údaje výrobcov sa pridajú, keď ich poskytnú so súhlasom |
| Maximálne bočné dĺžky pre kvapkové hadice, prietoky v čase, čerpadlá, uzavreté slučkové potrubné siete | Dodržte dĺžku kvapkových vedení podľa zverejnenej dĺžky výrobcu; kontrola potrebuje rozvetvenú sieť |
| Presný obrys konkávneho voľného tvaru; jeho objem pod zemou meraný presne | Konvexný obal sa upraví a objem pod zemou je odhad (uvedený vo Vlastnostiach) |
| Rastliny z vlastnej funkcie Place from library v BimCraft a ModelCraft | Exportujte IFC krajiny a otvorte ho v BimCraft vedľa budovy |
| Podrobné modely rastlín (listy, konáre, ročné obdobia) v 3D pohľade; voľné tvary a závlahy v 3D pohľade | Rastliny sa v 3D zobrazujú ako jednoduché tvary podľa veľkosti zo zoznamu rastlín ([Zobraziť lokalitu v 3D](topic:site-3d)); rozptyl v ModelCraft robí obrázky výsadby |
| Podporné múry hardscape, ktoré zadržujú upravenú úroveň za sebou na povrchu | Dajte plošine alebo plošinke zvislé strany: sú to oporné múry na povrchu ([Úprava terénu](topic:grading)) |
| Transformácie SVG vo vlastných symboloch; textúry a farby vlastných modelov rastlín GLB; komprimovaná geometria GLB | Najprv zploštite transformácie vo svojom kresliacom programe; modely sa kreslia farbou rastliny; exportujte GLB bez kompresie ([Grafika rastlín](topic:plant-graphics)) |
| Vlastný zoznam rastlín uložený vo vašom účte knižnice (upravovaný v aplikácii) | Upravte vlastný zoznam projektu v tabuľke rastlín a uložte ho ako súbor rastlín |
| Nástroje krajiny pre asistentov bez okna (file server a príkazový riadok) | Fungujú, keď je okno CivilCraft otvorené ([Nechajte AI asistenta pracovať s vašou lokalitou](topic:assistants)) |

## Elektrické vedenia

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Štandard krajiny zabudovaný v programe (zaťažovacie stavy, vôle, súčinitele) | Nastavte hodnoty svojho štandardu v {{ui:Zaťažovacie stavy a limity…}} a uložte ich s knižnicou ako balík na opätovné použitie a zdieľanie ([Balíky](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Vodorovná vzdialenosť od vodiča k korune stromu alebo k múru vedľa vedenia | Vôľa zvisle nahor nad rastlinami a múrmi, ktoré vedenie križuje ([Kontroly vedení](topic:power-line-checks#clearances)) |
| Dotvarovanie vodiča a predĺženie nového vodiča | Počítajte s nimi cez teploty v tabuľke napínania |
| Tepelné hodnotenie zakopaných káblov (dovolený prúd podľa spôsobu uloženia) | Zadajte dovolený prúd svojho dodávateľa na položke kábla |
| Štúdie skratu, ochrán a uzemnenia | Použite špecializovaný elektrický program; CivilCraft dá dĺžky siete a káble |
| Mriežkové stožiare navrhnuté prút po prúte a kotvy ťahadiel v zemine | Podpery sa kontrolujú menovitým zaťažením; ťahadlá (stays) menovitou nosnosťou |
| Súbor štúdie `.DON`, kontrolovaný v programe, ktorý ho číta | Skontrolujte súbor tam; pošlite nám vzorku, aby sme mohli testovať na skutočnom súbore |
| Elektrické vedenia v 3D pohľade a v IFC | Pôdorys, profil vedenia, listy a vrstvy GIS |
| Nástroje pre elektrické vedenia pre asistentov bez okna | Fungujú, keď je okno CivilCraft otvorené ([Nechajte AI asistenta pracovať s vašou lokalitou](topic:assistants)) |

## Hmoty budov

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Knižnica zónových kódov alebo pravidiel akéhokoľvek mesta | Zadajte limity z vlastného nariadenia ([Limity zóny](topic:zoning-limits)) |
| Denné svetlo na stenách (fasádne osvetlenie), vietor | [Hodiny slnka](topic:sun-hours) počítajú iba priame slnko |
| Tieň od stromov, rastlín alebo čohokoľvek, čo nie je nakreslené ako hmota | Nakreslite susedné budovy ako hmoty |
| Strešné tvary na hmotách | Hmoty s plochou strechou |
| Otvory, strechy a typy stien pri vypracovaní hmoty v BimCraft | BimCraft vytvorí obyčajné vonkajšie steny na každom podlaží a podlahu; ostatné doplňte tam |

## GIS a súradnicové systémy

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| File Geodatabase; štýly KML, ikony, pozemné prekrytia a sieťové odkazy | Najprv prevedte na GeoPackage, shapefile alebo GeoJSON; značky KML sa čítajú bez štýlov |
| Úprava prvkov GIS alebo ich atribútov | Upravte ich v GIS programe a znova importujte. Panel Analyzovať vytvára nové vrstvy (nárazník, prekrytie, spojenie, výber) a pridáva polia plochy a dĺžky, ale prvok neupravuje na mieste |
| Sieťová a rastrová analýza, nárazníky s plochými alebo štvorcovými koncami a jednostranné nárazníky, pridávanie alebo mazanie riadkov a zmena typu poľa v tabuľke atribútov, ručné farby tried, legenda štýlu v grafoch | Použite {{ui:Výber}} na vybratie prvkov a vytvorenie vrstvy z nich; ploché konce sa nedajú. Sfarbenie podľa atribútu a tabuľka atribútov sú hotové: pozri [Štýlovanie vrstvy podľa atribútu](topic:gis-symbology) a [Práca s tabuľkou atribútov vrstvy](topic:gis-table) |
| Štýly popiskov (veľkosť, umiestnenie) a popisky, ktoré sa navzájom vyhýbajú | Popisky majú jednu veľkosť a môžu sa prekrývať tam, kde sú prvky husté |
| Vertikálne dátumy a geoidové modely | Výšky sa používajú tak, ako ich súbor udáva; vertikálny dátum overte sami |
| Posuny sieťky iné ako na NAD83 z NAD27 navrhované podľa oblasti (OSTN15, NTv2 pre iné dátumy fungujú, keď pridáte súbor), viac sieťok naraz, vertikálne sieťky | Pridajte súbor sieťky pre svoj dátum sami; jedna sieťka na projekt |
| Mapové vrstvy v DXF alebo v 3D exportoch | Mapové vrstvy idú do výstupu PDF a pri DWG ako obrázok vedľa |
| Mapové servery, ktoré vyžadujú prihlásenie, kľúč alebo token | Použite verejné služby alebo súbor georeferencovaného obrázka |
| Zápis súborov LAS alebo LAZ z povrchu, modelu terénu alebo nástrojov mriežky výšok a LiDAR | Exportujte povrchy ako mriežku výšok GeoTIFF. Doplnok [Oblaky bodov](topic:point-clouds) zapíše vyčistený oblak ako LAS 1.4 alebo LAZ |
| Intenzita, farba a návraty LiDAR; mriežky výšok s viacerými pásmami; súbory mriežky alebo LiDAR väčšie ako 200 MB | LiDAR sa filtruje iba podľa triedy, mriežky používajú prvé pásmo; veľké súbory najprv rozrežte na dlaždice |

## Vstup

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Výber obdĺžnikom dotykom (vyžaduje {{key:Shift}}) | Dlho podržte každý zameraný bod, aby ste ho pridali |
| Zadané súradnice alebo vzdialenosti pri kreslení | Nakreslite zhruba, potom zadajte presné súradnice PI v tabuľke PI osi trasy |
| Zadávanie súradníc rohov plošín a konštrukcií | Ťahajte ich úchyty; priblížte pre presnosť a sledujte E a N v stavovom riadku |
| Prichytávanie k objektom (okrem zameraných bodov pre hrany zlomu) | Priblížte a sledujte stavový riadok |

## 3D pohľad

| Ešte nie je hotové | Namiesto toho dnes |
|---|---|
| Kreslenie alebo úprava v 3D pohľade | Kreslite a upravujte v pôdoryse; 3D pohľad sleduje každú úpravu |
| Výber čiar koridoru alebo prvkov GIS kliknutím v 3D | Kliknite na ne v pôdoryse |
| Export zveličeného pohľadu alebo v stopách | Exporty sú v skutočnej mierke v metroch; pozri [Exportovať lokalitu v 3D](topic:export-3d) |
| Popisky v exportoch GLB alebo OBJ, veľkosti a štýly popiskov v 3D | Popisky sa zobrazujú iba v 3D pohľade, v jednej veľkosti; pozri [Zobraziť lokalitu v 3D](topic:site-3d) |
| Textúry z fotografií, nahrávanie jazdy ako video, tiene zo vzdialenosti za lokalitou, hodiny slnka v 3D pohľade | Mapové vrstvy premietnuté na povrchy; jazda a poloha slnka v jednom čase; [hodiny slnka](topic:sun-hours) pre deň alebo sezónu v pôdoryse |
