---
title: Još nije izgrađeno
summary: Šta ova verzija CivilCraft-a još ne radi i šta uraditi umjesto toga danas.
keywords: nedostaje, ograničenja, plan razvoja, nije dostupno, spirale, proširenja, dwg, dxf, slivnici, retencija, poprečni presjeci, dolazi kasnije, granice
from: b91588d4
---

CivilCraft je u ranoj fazi. Ova stranica navodi šta trenutna verzija ne radi, da ne tražiš. Ništa ovdje nije obećano za neki datum.

## Tačke

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Dodavanje druge datoteke tačaka prvoj | Spoji datoteke u uređivaču teksta ili tabelarnom programu prvo |
| Izvoz tekstualne datoteke tačaka | Izvezi LandXML (tačke odlaze kao CgPoints), koristi GIS {{ui:Izvoz}} (tačke s poljima P, N, E, Z i D), ili {{ui:Kopiraj}} tačke u tabelarni program |
| Stilovi oznaka tačaka, simboli po ključu opisa, krivine (lukovi) iz kodova linija, datoteka ključeva opisa za dijeljenje između projekata | Oznake prikazuju broj, kotu i opis, ili manje ([Postavke CivilCraft-a](topic:settings)); ključevi se čuvaju u datoteci projekta |
| Pretvaranje jedinica | Pretvori datoteku prije uvoza; **Jedinice** samo mijenjaju oznaku |

## Površine

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Više od jedne površine izgrađene iz tačaka | Jedan projekat po površini |
| Sakrivanje (unutrašnjih) granica | Koristi **Najduži vanjski rub** ili vanjsku granicu |
| Odabir ili uređivanje jedne nacrtane linije loma | {{key:Mod+Z}}, ili {{ui:Ukloni nacrtane linije loma}} i nacrtaj ponovo |
| Uređivanje površine očitane iz LandXML (linije loma, granica) | {{ui:Ponovo izgradi površinu iz tačaka}} |
| Uređivanje površine napravljene iz mreže kota | Ponovo uvezi mrežu s drugim izborima |
| Pretvaranje površine očitane iz LandXML kada se koordinatni sistem mijenja | Prvo {{ui:Ponovo izgradi površinu iz tačaka}} |
| Označene tačkaste kote i vrijednosti nagiba | Očitaj ih u statusnoj traci, ili oboji površinu po nagibu s **Analiza nagiba** u radnom prostoru Pejzaž ([Nivelacija za pejzaž](topic:landscape-grading#grading-checks)) |

## Osi trase i profili

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Spirale osim klotoide; spirala između dvije krivine (složeni prelazi) | Klotoidne spirale na krajevima krivine su dostupne; ostale su imenovane i preskočene pri uvozu LandXML |
| Umetanje PI između dvije druge | Ponovo nacrtaj osu trase, ili ponovo upiši koordinate PI |
| Osi trase iz objekata, ofseta, proširenja | Crtaj preko PI |
| Upisivanje K za vertikalnu krivinu | Upiši L (K se prikazuje) |
| Kružne i nesimetrične vertikalne krivine | Samo simetrične paraboličke krivine |
| Više od jednog projektovanog profila po osi trase | Jedna osa trase po varijanti |
| Zumiranje prikaza profila, trake profila ispod profila | Prikaz profila uklapa cijelu osu trase; iscrtaj ga na [listovima plana i profila](topic:plan-profile-sheets) |
| Presjeci u DWG ili LandXML | Listovi presjeka kao PDF; {{ui:CSV}} površina i zapremina |
| Uzorkovane linije pod uglom, ili različitih širina duž puta | Jedna širina sa svake strane za cijelu osu trase |

## Koridori

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Središnje razdjelne trake, ograde i nadvišenje koje rotira šablone | Nacrtaj ih kao šablone ([Šabloni koridora](topic:corridor-templates)); šabloni po stacionaži još ne uzimaju nadvišenje |
| Postepena promjena između šablona dvaju područja (prelazi, sužavanja) | Promijeni šablon na stacionaži, ili daj tački cilj širine do linije nacrtane kao sužavanje |
| Rotacija oko ivice, nadvišenje u LandXML | Nadvišenje rotira oko osovine na kružnim krivinama; proširi traku ciljem širine do linije obilježja |
| Ciljevi za nagibe strana (dnevno svjetlo do linije ili površine), sopstvene površine koridora | Ciljevi pomjeraju ivice kolovoza i bankina ([Koridori](topic:corridor)); koridor se uklapa u projektovanu površinu |
| Zaobilazni ivičnjaci, skretne trake i ostrva uklopljeni u raskrsnicu; kraj sporednog puta odsječen do ivice glavnog puta pod kosim uglom; staza spojena s putem u planu, u njenoj dužini i površini | Putevi koji se susreću spajaju se pravo, s otvorenom ivicom glavnog puta i sporednim putem koji se ublažava do nje ([Gdje se putevi susreću](topic:corridor#where-roads-meet-roads-pads-and-paths)); staza staje na ivici puta u projektovanoj površini i u 3D |
| Koridori izvezeni kao LandXML putevi; drugi koridor na osi trase u IFC izvozu | Izvozi se projektovana površina |
| Šabloni terena koji mijenjaju projektovanu površinu, u 3D ili u presjecima | Daju površine i zapremine svakog sloja ([Šabloni terena](topic:corridor-templates#terrain-templates)) |
| Putanje kretanja s brzinom, klizanjem guma, vremenom upravljanja, upravljanim prikolicama ili gabaritom vozila; biblioteka standardnih projektnih vozila; putanja kretanja nacrtana povlačenjem vozila | Putanje kretanja pri maloj brzini duž linije obilježja ili osi trase, s tvojim vlastitim dimenzijama vozila ([Putanje kretanja vozila](topic:swept-paths)) |

## Nivelacija i zapremine

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Etaže, otvorene linije obilježja uklopljene u projekat, nivelacija do linije obilježja s drugog mjesta | Zatvori liniju obilježja ([Linije obilježja](topic:feature-lines)), ili je koristi kao liniju loma postojećeg terena |
| Umetanje ili uklanjanje vrha linije obilježja | Nacrtaj liniju ponovo, ili napravi stepenasti ofset od nje |
| Lukovi u nacrtanim linijama loma (kroz tačke snimanja), spirale u linijama obilježja | Nacrtaj liniju obilježja s lukovima i koristi je kao liniju loma postojećeg terena |
| Nivelacija do daljine, kote ili druge površine | Dnevno svjetlo samo do postojećeg terena |
| Dodavanje ili uklanjanje ugla platoa | Obriši plato i nacrtaj ga ponovo |
| Zapremine TIN-u-TIN (prizme), izbor veličine ćelije mreže | Metoda mreže, veličina ćelije izabrana za tebe |
| Nabreknuće i skupljanje, humus, dubine kolovoza | Primijeni faktore na prijavljene brojeve sam |
| Troškovi slobodnog i prekomjernog transporta, transport preko različitih osi trase, pozajmišta i deponije postavljene na planu | Dijagram raspodjele mase s tačkama ravnoteže, pomjerene zapremine i prosječne daljine transporta |

## Cjevovodne mreže

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Više od jedne mreže po projektu | Zasebni projekti za oborinsku i sanitarnu |
| Vodovodne magistrale: kvalitet i starost vode, upravljanje prema pravilima, drugi tipovi ventila (regulacija protoka, prigušivanje, održavanje), pumpe zadane snagom, potrošnja koja zavisi od pritiska, opcija Darcy–Weisbach, katalog cijevi s debljinama zida i klasama pritiska. Ostatak mreža pod pritiskom je u laboratoriji: [Vodovodne magistrale](topic:water-mains) | Provjeri to u softveru za distribuciju vode; projektni protoci za sanitarnu su u [Sanitarni projektni protoci](topic:sanitary-design) |
| Protoci kanalizacije kroz vrijeme (hidrogrami, dinamičko vođenje, akumulacija, pumpe, prelivi) | [Sanitarni projektni protoci](topic:sanitary-design) daje stalni vršni protok koji koristi projektni list |
| Kapacitet ulaza, širenje kanala uz ivicu, vođenje retencije, hidrogrami, gubici energije osim jednog koeficijenta čvora | Provjeri ih u drugom softveru; protoci, dimenzije i linije nivelete su u [Oborinska odvodnja](topic:storm-drainage) |
| Slivovi u PDF crtežu, DWG, DXF ili LandXML; slivovi iz površine (razvodnice) | Crtaj slivove ručno; čuvaju se u datoteci projekta |
| Katalozi cijevi, necjevaste cijevi, konstrukcije koje nisu uspravne kutije ili cilindri (konusi, stepenice, banketi), kategorija odvodnje u biblioteci | Tipovi konstrukcija iz parametara ([Cjevovodna mreža](topic:pipe-network)); cijevi s prečnikom |
| Cijevi u prikazu profila, zakrivljene cijevi | Očitaj kote dna i nadslojenje u desnom panelu |

## Parcele

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Iscrtavanje parcela po površini ili frontu, parcele iz linija oko njih, pravo prolaza | Nacrtaj svaku parcelu po njenim uglovima, ili unesi njene pravce i dužine |
| Tabele krivina i tabele linija na planu; oznake pomjerane ručno | Svaki pravac je označen duž sebe |
| Parcele u LandXML | Parcele se čuvaju u datoteci projekta i idu u PDF, DWG i DXF |

## Poligonski vlakovi

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Izravnanje po metodi najmanjih kvadrata, pravilo tranzita, ponderisanje uglova prema daljinama | Pravilo kompasa |
| Uglovi skretanja, zenitni uglovi i kose daljine, kote trigonometrijskim nivelmanom | Svedi na horizontalne daljine i uglove ispravno, ili azimute |
| Bočna snimanja, sirove datoteke podataka s uređaja za prikupljanje | Uvezi tačke kao datoteku tačaka |

## Obilježavanje na terenu

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Ofset kočići (referentne tačke postavljene unazad od kočića), kočići nagiba na tački presjeka | Obilježi na ofsetima koje trebaš, uključujući i one iza bankine |
| Slanje kočića direktno u sopstveni format uređaja za prikupljanje | CSV se otvara u softveru za kancelariju većine uređaja za prikupljanje |
| Obilježavanje cijevi, platoa i parcela | Koristi tačke snimanja blizu osi trase, ili pravce parcele |

## Datoteke i izlaz

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Tekst, šrafure i kote iz DWG ili DXF; prostor za papir; povezani crteži (xref); binarni DXF | Linije iz prostora modela se otvaraju ([Otvori DWG ili DXF kao linije](topic:open-dwg-dxf)); otvori povezane crteže zasebno |
| Pomjeranje više tačaka odjednom povlačenjem | Iseci i zalijepi ih, ili uređuj jednu po jednu |
| Listovi u uspravnoj orijentaciji, sopstveni naslovni blokovi, prozori koje sam raspoređuješ, listovi plana i profila u DWG | Jedan list plana u pejzažnoj orijentaciji po PDF-u, ili listovi plana i profila duž osi trase (PDF) |
| Iscrtavanje traka kota i profila | Trake su samo na ekranu; napravi snimak ekrana ako ti trebaju |
| Promjena naziva slojeva, boja ili stilova oznaka | Promijeni ih u CAD programu nakon DXF izvoza |
| Čuvanje u oblaku i historija verzija | Čuvaj `.civilcraft.json` datoteke i pravi im rezervu; za zajednički rad na jednom projektu koristi živu sesiju u CadCraft Studio ([Projektuj jedno gradilište zajedno, uživo](topic:work-live)) |
| CadCraft Studio za iPad i iPhone, i iz Google Play prodavnice | Koristi CivilCraft u pregledaču na uređaju; na Androidu, CadCraft Studio se instalira iz svog APK-a na getcadcraft.com/download |
| Otvaranje više datoteka tačaka ili projekata odjednom | Jedna datoteka po otvaranju (GIS datoteke koje pripadaju zajedno, kao dijelovi shapefile-a, otvaraju se zajedno) |

## Pejzaž

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Proizvođačke glave i mlaznice | Generičke glave, ili dodaj sopstvene glave iz datoteke; podaci proizvođača dolaze kako daju dozvolu |
| Najveće bočne dužine za linije kapanja, protoci kroz vrijeme, pumpe, prstenaste cjevovodne mreže | Drži dionice kapanja unutar objavljene dužine proizvođača; provjera zahtijeva razgranatu mrežu |
| Tačan obris konkavnog slobodnog oblika; njegova zapremina ispod zemlje izmjerena tačno | Konveksni omotač se nivelira, a zapremina ispod zemlje je procjena (napisano u Svojstvima) |
| Biljke u sopstvenom „Postavi iz biblioteke“ u BimCraft i ModelCraft | Izvezi pejzaž IFC i otvori ga u BimCraft uz zgradu |
| Detaljni modeli biljaka (listovi, grane, godišnja doba) u 3D prikazu; objekti slobodnog oblika i navodnjavanje u 3D prikazu | Biljke se u 3D prikazuju kao jednostavni oblici veličine iz spiska biljaka ([Pogledaj lokaciju u 3D](topic:site-3d)); scatter funkcija u ModelCraft pravi slike sadnje |
| Zidovi tvrdog uređenja koji zadržavaju nivelisanu kotu iza sebe na površini | Daj platou ili podlozi vertikalne strane: na površini su potporni zidovi ([Nivelacija](topic:grading)) |
| SVG transformacije u sopstvenim simbolima; teksture i boje sopstvenih GLB modela biljaka; komprimirana GLB geometrija | Izravnaj transformacije u svom programu za crtanje prvo; modeli se crtaju u boji biljke; izvezi GLB bez kompresije ([Grafika biljaka](topic:plant-graphics)) |
| Tvoj sopstveni spisak biljaka čuvan u tvom nalogu u biblioteci (uređuje se u aplikaciji) | Uredi spisak projekta u tabeli biljaka i sačuvaj ga kao datoteku biljaka |
| Alati za pejzaž za asistente bez prozora (server datoteka i komandna linija) | Rade kada je prozor CivilCraft-a otvoren ([Neka AI asistent radi s tvojim gradilištem](topic:assistants)) |

## Dalekovodi

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Standard neke zemlje ugrađen (slučajevi opterećenja, razmaci, faktori) | Postavi vrijednosti svog standarda u {{ui:Slučajevi opterećenja i ograničenja…}} i sačuvaj ih, s bibliotekom, kao paket za ponovnu upotrebu i dijeljenje ([Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Bočna daljina od provodnika do krošnje drveta ili zida uz liniju | Razmak naravno iznad biljaka i zidova koje linija presijeca ([Provjere dalekovoda](topic:power-line-checks#clearances)) |
| Puzanje provodnika i istezanje novog provodnika | Uračunaj ih kroz temperature u tabeli zatezanja |
| Termička klasifikacija zakopanih kablova (strujna nosivost iz načina polaganja) | Unesi strujnu nosivost svog dobavljača na stavku kabla |
| Studije kratkog spoja, zaštite i uzemljenja | Koristi namjenski električni program; CivilCraft daje dužine mreže i kablove |
| Rešetkasti stubovi projektovani član po član, i sidra zatega u tlu | Nosači se provjeravaju prema nominalnom opterećenju; zatege prema nazivnom opterećenju |
| Datoteka studije `.DON` provjerena u programu koji je čita | Provjeri datoteku tamo; pošalji nam uzorak da možemo testirati na stvarnom |
| Dalekovodi u 3D prikazu i u IFC | Plan, profil linije, listovi i GIS slojevi |
| Alati za dalekovode za asistente bez prozora | Rade kada je prozor CivilCraft-a otvoren ([Neka AI asistent radi s tvojim gradilištem](topic:assistants)) |

## Mase zgrada

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Biblioteka urbanističkih propisa ili pravila bilo kojeg grada | Upiši granice iz svoje odluke ([Granice zoniranja](topic:zoning-limits)) |
| Svjetlo neba na zidovima (dnevno svjetlo fasade), vjetar | [Sati sunca](topic:sun-hours) broji samo direktno sunce |
| Sjena od drveća, biljaka ili bilo čega što nije nacrtano kao masa | Nacrtaj susjedne zgrade kao mase |
| Oblici krovova na masama | Mase s ravnim vrhom |
| Otvori, krovovi i tipovi zidova kada se masa razrađuje u BimCraft | BimCraft gradi obične vanjske zidove na svakom nivou i na podu; dodaj ostalo tamo |

## GIS i koordinatni sistemi

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| File Geodatabase; KML stilovi, ikone, prekrivači terena i mrežne veze | Pretvori u GeoPackage, shapefile ili GeoJSON prvo; KML oznake mjesta se čitaju bez stilova |
| Uređivanje GIS objekata ili njihovih atributa | Uredi ih u GIS programu i ponovo uvezi. Panel Analiziraj pravi nove slojeve (bafer, preklapanje, spajanje, odabir) i dodaje polja površine i dužine, ali ne uređuje objekat na mjestu |
| Analiza mreže i rastera, baferi s ravnim ili kvadratnim krajevima i jednostrani baferi, dodavanje ili brisanje redova i promjena tipa polja u tabeli atributa, ručne boje klasa, legenda stilova u crtežima | Koristi Odaberi za izbor objekata i pravljenje sloja od njih; ravni krajevi se ne nude. Bojenje po atributu i tabela atributa su izrađeni: pogledaj [Oblikuj sloj po atributu](topic:gis-symbology) i [Radi s tabelom atributa sloja](topic:gis-table) |
| Stilovi oznaka (veličina, položaj) i oznake koje izbjegavaju jedna drugu | Oznake su jedne veličine i mogu se preklapati tamo gdje su objekti gusti |
| Vertikalni datumi i modeli geoida | Kote se koriste kako ih datoteka daje; sam provjeri vertikalni datum |
| Pomaci mreže osim u NAD83 iz NAD27 koji se predlažu po području (OSTN15, NTv2 za druge datume rade kada dodaš datoteku), više mreža odjednom, vertikalne mreže | Dodaj datoteku mreže za svoj datum sam; jedna mreža po projektu |
| Slojevi karte u DXF ili u 3D izvozima | Slojevi karte idu u PDF crtež, a uz DWG kao slika |
| Serveri karata koji traže prijavu, ključ ili token | Koristi javne usluge, ili datoteku slike s georeferencom |
| Pisanje LAS ili LAZ datoteka iz površine, modela terena ili alata za mrežu kota i LiDAR | Izvezi površine kao GeoTIFF mrežu kota. Dodatak [Oblaci tačaka](topic:point-clouds) piše očišćen oblak kao LAS 1.4 ili LAZ |
| LiDAR intenzitet, boja i povratci; mreže kota s više pojaseva; datoteke mreže ili LiDAR veće od 200 MB | LiDAR se filtrira samo po klasi, mreže koriste svoj prvi pojas; prvo podijeli velike datoteke na pločice |

## Unos

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Izbor okvirom dodirom (treba {{key:Shift}}) | Dugo pritisni svaku tačku snimanja da je dodaš |
| Upisane koordinate ili daljine pri crtanju | Nacrtaj okvirno, zatim upiši tačne koordinate PI u tabeli PI osi trase |
| Upisivanje koordinata uglova platoa i konstrukcija | Povuci njihove hvataljke; uvećaj za preciznost i prati E i N u statusnoj traci |
| Hvatanje za objekte (osim tačaka snimanja za linije loma) | Uvećaj i prati statusnu traku |

## 3D prikaz

| Još nije izgrađeno | Umjesto toga, danas |
|---|---|
| Crtanje ili uređivanje u 3D prikazu | Crtaj i uređuj u planu; 3D prikaz prati svaku izmjenu |
| Odabir linija obilježja koridora ili GIS objekata klikom u 3D | Klikni ih u planu |
| Izvoz uvećanog prikaza ili u stopama | Izvozi su u pravoj razmjeri u metrima; pogledaj [Izvezi lokaciju u 3D](topic:export-3d) |
| Oznake u GLB ili OBJ izvozima, veličine i stilovi oznaka u 3D | Oznake se prikazuju samo u 3D prikazu, jedne veličine; pogledaj [Pogledaj lokaciju u 3D](topic:site-3d) |
| Teksture s fotografija, snimanje vožnje kao video, sjene s dijela izvan lokacije, sati sunca prikazani u 3D prikazu | Slojevi karte prebačeni preko površina; vožnja i položaj sunca u jednom trenutku; [sati sunca](topic:sun-hours) za dan ili godišnje doba na planu |
