---
title: Još nije izrađeno
summary: Šta ova verzija CivilCraft-a još ne radi i šta raditi umjesto toga danas.
keywords: nedostaje, ograničenja, plan razvoja, nije dostupno, spirale, proširenja kolovoza, dwg, dxf, slivnici, retencija, poprečni presjeci, kasnije, granice
from: a2d970ef
---

CivilCraft je u ranoj fazi. Ova stranica navodi šta trenutna verzija ne radi, da ne biste tražili. Ništa ovdje nije obećano za neki datum.

## Tačke

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Dodavanje druge datoteke tačaka prvoj | Spojite datoteke u uređivaču teksta ili tabelarnom programu prvo |
| Izvoz tekstualne datoteke tačaka | Izvezite LandXML (tačke odlaze kao CgPoints), koristite GIS {{ui:Izvoz}} (tačke s poljima P, N, E, Z i D), ili {{ui:Kopiraj}} tačke u tabelarni program |
| Stilovi oznaka tačaka, simboli po ključu opisa, krivine (lukovi) iz kodova linija, datoteka ključeva opisa za dijeljenje među projektima | Oznake prikazuju broj, kotu i opis, ili manje ([Postavke CivilCraft-a](topic:settings)); ključevi se čuvaju u datoteci projekta |
| Pretvaranje jedinica | Pretvorite datoteku prije uvoza; **Jedinice** samo mijenjaju oznake |

## Površi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Više od jedne površi izrađene iz tačaka | Jedan projekat po površi |
| Skrivanje (unutrašnjih) granica | Koristite **Najduža vanjska ivica** ili vanjsku granicu |
| Odabir ili uređivanje jedne nacrtane linije loma | {{key:Mod+Z}}, ili {{ui:Ukloni nacrtane linije loma}} i ponovo nacrtajte |
| Uređivanje površi učitane iz LandXML (linije loma, granica) | {{ui:Ponovo izgradi površinu iz tačaka}} |
| Uređivanje površi napravljene od mreže kota | Ponovo uvezite mrežu s drugim izborima |
| Pretvaranje površi učitane iz LandXML kad se koordinatni sistem promijeni | Prvo {{ui:Ponovo izgradi površinu iz tačaka}} |
| Označene kote tačaka i vrijednosti nagiba | Očitajte ih u statusnoj traci, ili obojite površ po nagibu pomoću **Analiza nagiba** u radnom prostoru Pejzaž ([Nivelacija za pejzaž](topic:landscape-grading#grading-checks)) |

## Osi trasa i profili

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Spirale osim klotoide; spirala između dvije krivine (složeni prelazi) | Klotoidne spirale na krajevima krivine su dostupne; ostale se imenuju i preskaču pri uvozu LandXML |
| Umetanje PI tačke između dvije druge | Ponovo nacrtajte os trase, ili ponovo upišite koordinate PI |
| Osi trasa iz objekata, pomaka, proširenja | Crtajte po PI tačkama |
| Unos K za vertikalnu krivinu | Unesite L (K se prikazuje) |
| Kružne i nesimetrične vertikalne krivine | Samo simetrične paraboličke krivine |
| Više od jednog projektnog profila po osi trase | Jedna os trase po varijanti |
| Zumiranje prikaza profila, pojasevi ispod profila | Prikaz profila staje cijela os trase; iscrtajte ga na [listovima plana i profila](topic:plan-profile-sheets) |
| Presjeci u DWG ili LandXML | Listovi presjeka kao PDF; {{ui:CSV}} površina i zapremina |
| Linije uzorkovanja pod uglom, ili različite širine duž puta | Jedna širina sa svake strane za cijelu os trase |

## Koridori

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Razdjelne trake, barijere i nadvišenje koje rotira šablone | Nacrtajte ih kao šablone ([Šabloni koridora](topic:corridor-templates)); šabloni po stacionaži još ne uzimaju nadvišenje |
| Postepena promjena između šablona dvije oblasti (prelazi, suženja) | Promijenite šablon na stacionaži, ili dodijelite tački ciljanu širinu liniji nacrtanoj kao suženje |
| Rotacija oko ivice, nadvišenje u LandXML | Nadvišenje rotira oko osovine na kružnim krivinama; proširite traku ciljanom širinom na karakterističnu liniju |
| Ciljevi za bočne nagibe (izlaz na liniju ili površ), vlastite površi koridora | Ciljevi pomjeraju ivice kolovoza i bankina ([Koridori](topic:corridor)); koridor se nivelira u predloženu površ |
| Koridori izvezeni kao LandXML putevi; drugi koridor na osi trase u IFC izvozu | Izvozi se predložena površ |
| Šabloni terena koji mijenjaju predloženu površ, u 3D ili u presjecima | Daju površine i zapremine svakog sloja ([Šabloni terena](topic:corridor-templates#terrain-templates)) |
| Putanje kretanja sa brzinom, klizanjem guma, vremenom upravljanja, prikolicama ili bočnim razmakom; biblioteka standardnih projektnih vozila; putanja kretanja nacrtana povlačenjem vozila | Putanje kretanja malom brzinom duž karakteristične linije ili osi trase, sa vašim veličinama vozila ([Putanje kretanja vozila](topic:swept-paths)) |

## Nivelacija i zapremine

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Berme, otvorene karakteristične linije nivelirane u projekat, nivelacija do karakteristične linije sa drugog mjesta | Zatvorite karakterističnu liniju ([Karakteristične linije](topic:feature-lines)), ili je koristite kao liniju loma postojećeg terena |
| Umetanje ili uklanjanje tjemena karakteristične linije | Ponovo nacrtajte liniju, ili napravite stepenasti pomak |
| Lukovi u nacrtanim linijama loma (kroz geodetske tačke), spirale u karakterističnim linijama | Nacrtajte karakterističnu liniju s lukovima i koristite je kao liniju loma postojećeg terena |
| Nivelacija do udaljenosti, kote ili druge površi | Izlaz samo na postojeći teren |
| Dodavanje ili uklanjanje ugla plata | Obrišite plato i ponovo ga nacrtajte |
| TIN-na-TIN (prizmatične) zapremine, izbor veličine ćelije mreže | Metoda mreže, veličina ćelije se bira automatski |
| Nabreknuće i skupljanje, humus, dubine kolovoza | Sami primijenite faktore na prijavljene brojeve |
| Troškovi slobodnog i prekomjernog prevoza, prevoz preko različitih osa trase, pozajmišta i deponije označene na planu | Dijagram masa s tačkama ravnoteže, pomjerenim zapreminama i prosječnim dužinama prevoza |

## Mreže cijevi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Više od jedne mreže po projektu | Odvojeni projekti za oborinsku i sanitarnu |
| Vodovodne mreže: kvalitet i starost vode, upravljanje po pravilima, ostali tipovi ventila (regulacija protoka, prigušni, održavajući), pumpe zadane snagom, potražnja koja zavisi od pritiska, opcija Darcy–Weisbach, katalog cijevi s debljinama zidova i klasama pritiska. Ostatak mreža pod pritiskom je u laboratoriji: [Vodovodne mreže](topic:water-mains) | Provjerite to u softveru za distribuciju vode; sanitarni projektni protoci su u [Sanitarni projektni protoci](topic:sanitary-design) |
| Protoci kanalizacije kroz vrijeme (hidrogrami, dinamičko vođenje, akumulacija, pumpe, preljevi) | [Sanitarni projektni protoci](topic:sanitary-design) daje ustaljeni vršni protok koji koristi projektni list |
| Kapacitet slivnika, širenje žlijeba, vođenje retencije, hidrogrami, gubici energije osim jednog koeficijenta spoja | Provjerite u drugom softveru; protoci, dimenzije i linije nagiba su u [Oborinska odvodnja](topic:storm-drainage) |
| Slivovi u PDF iscrtavanju, DWG, DXF ili LandXML; slivovi iz površi (razvodnice) | Nacrtajte slivove ručno; čuvaju se u datoteci projekta |
| Katalozi cijevi, necilindrične cijevi, objekti koji nisu uspravne kutije ili cilindri (konusi, stepenice, bermovi), kategorija odvodnje u biblioteci | Tipovi objekata iz parametara ([Mreža cijevi](topic:pipe-network)); cijevi s prečnikom |
| Cijevi u prikazu profila, zakrivljene cijevi | Očitajte dna i pokrov u desnom panelu |

## Parcele

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Raspored parcela po površini ili frontu, parcele iz linija oko njih, pravo prolaza | Nacrtajte svaku parcelu po njenim uglovima, ili unesite njene dionice |
| Tabele krivina i tabele linija na planu; oznake pomjerene ručno | Svaka dionica je označena duž sebe |
| Parcele u LandXML | Parcele se čuvaju u datoteci projekta i idu u PDF, DWG i DXF |

## Poligonski vlakovi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Izravnanje po metodi najmanjih kvadrata, pravilo tranzita, ponderisanje uglova prema udaljenostima | Pravilo kompasa |
| Uglovi skretanja, zenitni uglovi i kose udaljenosti, kote trigonometrijskim nivelmanom | Svedite na horizontalne udaljenosti i ispravne uglove, ili smjerne uglove |
| Bočna snimanja, datoteke sirovih podataka iz kolektora | Uvezite tačke kao datoteku tačaka |

## Obilježavanje

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Pomjereni kočići (referentne tačke postavljene iza kočića), kočići nagiba na tački presijecanja | Obilježite na pomacima koji su vam potrebni, uključujući i iza bankine |
| Slanje kočića direktno u vlastiti format kolektora podataka | CSV se otvara u kancelarijskom softveru većine kolektora podataka |
| Obilježavanje cijevi, plato i parcela | Koristite geodetske tačke blizu osi trase, ili dionice parcele |

## Datoteke i izlaz

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Tekst, šrafure i kote iz DWG ili DXF; prostor papira; povezani crteži (xref); binarni DXF | Linije iz prostora modela se otvaraju ([Otvorite DWG ili DXF kao linije](topic:open-dwg-dxf)); povezane crteže otvorite zasebno |
| Pomjeranje više tačaka odjednom povlačenjem | Izrežite i zalijepite ih, ili uređujte jednu po jednu |
| Uspravni listovi, vlastiti natpisni blokovi, prozori prikaza koje sami raspoređujete, listovi plana i profila u DWG | Jedan položeni list plana po PDF-u, ili listovi plana i profila duž osi trase (PDF) |
| Iscrtavanje pojaseva kota i profila | Pojasevi su samo na ekranu; napravite snimak ekrana ako su vam potrebni |
| Promjena naziva slojeva, boja ili stilova oznaka | Promijenite ih u CAD programu nakon DXF izvoza |
| Čuvanje u oblaku i historija verzija | Čuvajte datoteke `.civilcraft.json` i držite ih u rezervnoj kopiji; za zajednički rad na jednom projektu koristite sesiju uživo u CadCraft Studio ([Projektujte jedno gradilište zajedno, uživo](topic:work-live)) |
| CadCraft Studio za iPad i iPhone, i iz Google Play | Koristite CivilCraft u pregledniku na uređaju; na Androidu se CadCraft Studio instalira iz svoje APK datoteke na getcadcraft.com/download |
| Otvaranje više datoteka tačaka ili projekata odjednom | Jedna datoteka po otvaranju (GIS datoteke koje pripadaju zajedno, kao dijelovi shapefile-a, otvaraju se zajedno) |

## Pejzaž

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Glave i mlaznice proizvođača | Generičke glave, ili dodajte vlastite glave iz datoteke; podaci proizvođača dolaze kako dozvole budu date |
| Maksimalne bočne dužine za kapaljke, protoci kroz vrijeme, pumpe, zatvorene mreže cijevi | Držite dionice kapaljki na objavljenoj dužini proizvođača; provjera zahtijeva razgranatu mrežu |
| Tačan obris konkavnog slobodnog objekta; njegova zapremina ispod zemlje izmjerena tačno | Konveksni omotač se nivelira, a zapremina ispod zemlje je procjena (navedeno u Svojstvima) |
| Biljke iz funkcije Postavi iz biblioteke, vlastite u BimCraft-u i ModelCraft-u | Izvezite IFC pejzaža i otvorite ga u BimCraft-u pored zgrade |
| Detaljni modeli biljaka (listovi, grane, godišnja doba) u 3D prikazu; slobodni objekti i navodnjavanje u 3D prikazu | Biljke se u 3D prikazuju kao jednostavni oblici dimenzionisani prema spisku biljaka ([Pogledajte gradilište u 3D](topic:site-3d)); raspršivanje ModelCraft-a pravi slike sadnje |
| Tvrdi zidovi koji zadržavaju nivelisanu kotu iza sebe na površi | Dajte platformi ili platou vertikalne strane: one su potporni zidovi na površi ([Nivelacija](topic:grading)) |
| SVG transformacije u vlastitim simbolima; teksture i boje vlastitih GLB modela biljaka; komprimovana GLB geometrija | Prvo izravnajte transformacije u svom programu za crtanje; modeli se crtaju bojom biljke; izvezite GLB bez kompresije ([Grafika biljaka](topic:plant-graphics)) |
| Vaš spisak biljaka sačuvan na vašem računu u biblioteci (uređuje se u aplikaciji) | Uredite spisak projekta u tabeli Biljke i sačuvajte ga kao datoteku biljaka |
| Alati za pejzaž za asistente bez prozora (server datoteka i komandna linija) | Rade dok je prozor CivilCraft-a otvoren ([Neka AI asistent radi s vašim gradilištem](topic:assistants)) |

## Dalekovodi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Standard države ugrađen (slučajevi opterećenja, razmaci, faktori) | Postavite vrijednosti svog standarda u {{ui:Slučajevi opterećenja i ograničenja…}} i sačuvajte ih, s bibliotekom, kao paket za ponovnu upotrebu i dijeljenje ([Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Bočna udaljenost od provodnika do krune drveta ili zida pored voda | Razmak pravo gore iznad biljaka i zidova koje vod presijeca ([Provjere dalekovoda](topic:power-line-checks#clearances)) |
| Puzanje provodnika i istezanje novog provodnika | Uzmite ih u obzir kroz temperature u tabeli zatezanja |
| Termička nosivost podzemnih kablova (nazivna struja prema načinu polaganja) | Unesite nazivnu struju svog dobavljača na stavku kabla |
| Studije kratkog spoja, zaštite i uzemljenja | Koristite namjenski električni program; CivilCraft daje dužine mreže i kablove |
| Rešetkasti stubovi projektovani član po član, i sidra zatega u tlu | Stubovi se provjeravaju prema nazivnom opterećenju; zatege prema nazivnom opterećenju |
| Datoteka studije `.DON` provjerena u programu koji je čita | Provjerite datoteku tamo; pošaljite nam uzorak da možemo testirati na stvarnoj |
| Dalekovodi u 3D prikazu i u IFC | Plan, profil voda, listovi i GIS slojevi |
| Alati za dalekovode za asistente bez prozora | Rade dok je prozor CivilCraft-a otvoren ([Neka AI asistent radi s vašim gradilištem](topic:assistants)) |

## Mase zgrada

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Biblioteka zoning kodova ili pravila bilo kog grada | Unesite ograničenja iz svog pravilnika ([Ograničenja zoniranja](topic:zoning-limits)) |
| Nebesko svjetlo na zidovima (dnevno svjetlo fasade), vjetar | [Sunčani sati](topic:sun-hours) broje samo direktno sunce |
| Hlad od drveća, biljaka ili svega što nije nacrtano kao masa | Nacrtajte susjedne zgrade kao mase |
| Oblici krovova na masama | Mase s ravnim vrhom |
| Otvori, krovovi i tipovi zidova kad se masa razrađuje u BimCraft-u | BimCraft gradi obične vanjske zidove na svakom nivou i podu; dodajte ostalo tamo |

## GIS i koordinatni sistemi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| File Geodatabase; KML stilovi, ikone, prekrivači terena i mrežne veze | Prvo pretvorite u GeoPackage, shapefile ili GeoJSON; KML oznake mjesta se čitaju bez svojih stilova |
| Uređivanje GIS objekata ili njihovih atributa | Uredite ih u GIS programu i ponovo uvezite. Panel Analiza pravi nove slojeve (bafer, preklapanje, spajanje, odabir) i dodaje polja površine i dužine, ali ne uređuje objekat na mjestu |
| Analiza mreže i rastera, baferi s ravnim ili kvadratnim krajevima i jednostrani baferi, dodavanje ili brisanje redova i promjena tipa polja u tabeli atributa, ručne boje klasa, legenda stilova u iscrtavanjima | Koristite Odaberi za izbor objekata i pravljenje sloja od njih; ravni krajevi nisu ponuđeni. Bojenje po atributu i tabela atributa su izrađeni: vidi [Stilizovanje sloja po atributu](topic:gis-symbology) i [Rad s tabelom atributa sloja](topic:gis-table) |
| Stilovi oznaka (veličina, položaj) i oznake koje se izbjegavaju međusobno | Oznake su jedne veličine i mogu se preklapati tamo gdje su objekti gusti |
| Vertikalni datumi i modeli geoida | Kote se koriste kako ih datoteka daje; sami provjerite vertikalni datum |
| Pomaci mreže osim na NAD83 iz NAD27 predloženi po području (OSTN15, NTv2 za druge datume rade kad dodate datoteku), više mreža odjednom, vertikalne mreže | Sami dodajte datoteku mreže za svoj datum; jedna mreža po projektu |
| Slojevi karte u DXF ili 3D izvozima | Slojevi karte idu u PDF iscrtavanje, a uz DWG kao slika |
| Serveri karti koji traže prijavu, ključ ili token | Koristite javne servise, ili georeferenciranu datoteku slike |
| Pisanje LAS ili LAZ datoteka iz površi, modela terena ili alata mreže kota i LiDAR-a | Izvezite površi kao GeoTIFF mrežu kota. Dodatak [Oblaci tačaka](topic:point-clouds) piše očišćen oblak kao LAS 1.4 ili LAZ |
| LiDAR intenzitet, boja i povrati; mreže kota s više pojasa; datoteke mreže ili LiDAR veće od 200 MB | LiDAR se filtrira samo po klasi, mreže koriste prvi pojas; prvo velike datoteke izrežite na pločice |

## Unos

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Izbor okvirom dodirom (potreban je {{key:Shift}}) | Dugo pritisnite svaku geodetsku tačku da je dodate |
| Upisane koordinate ili udaljenosti pri crtanju | Nacrtajte okvirno, zatim upišite tačne koordinate PI u tabelu PI osi trase |
| Unos koordinata za uglove plata i objekte | Povucite njihove ručke; zumirajte za preciznost i pratite E i N u statusnoj traci |
| Privlačenje na objekte (osim geodetskih tačaka za linije loma) | Zumirajte i pratite statusnu traku |

## 3D prikaz

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Crtanje ili uređivanje u 3D prikazu | Crtajte i uređujte u planu; 3D prikaz prati svaku izmjenu |
| Odabir karakterističnih linija koridora ili GIS objekata klikom u 3D | Kliknite ih u planu |
| Izvoz uvećanog prikaza ili u stopama | Izvozi su u pravoj razmjeri u metrima; vidi [Izvoz gradilišta u 3D](topic:export-3d) |
| Oznake u GLB ili OBJ izvozima, veličine i stilovi oznaka u 3D | Oznake se prikazuju samo u 3D prikazu, jedne veličine; vidi [Pogledajte gradilište u 3D](topic:site-3d) |
| Teksture iz fotografija, snimanje vožnje kao video, sjene izvan gradilišta, sunčani sati prikazani u 3D prikazu | Slojevi karte prekriveni na površima; vožnja i položaj sunca u jednom trenutku; [sunčani sati](topic:sun-hours) za dan ili godišnje doba na planu |
