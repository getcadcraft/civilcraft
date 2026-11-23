---
title: Još nije izrađeno
summary: Šta ova verzija CivilCraft-a još ne radi i šta umesto toga raditi danas.
keywords: nedostaje, ograničenja, plan razvoja, nije dostupno, spirale, proširenje, dwg, dxf, slivnici, retencija, poprečni preseci, dolazi kasnije, granice
from: b91588d4
---

CivilCraft je u ranoj fazi. Ova strana navodi šta trenutna verzija ne radi, da ne bi tražio. Ništa ovde nije obećano za neki datum.

## Tačke

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Dodavanje druge datoteke tačaka prvoj | Prvo spoji datoteke u uređivaču teksta ili tabelarnom programu |
| Izvoz tekstualne datoteke tačaka | Izvezi LandXML (tačke idu kao CgPoints), koristi GIS {{ui:Izvoz}} (tačke sa poljima P, N, E, Z i D) ili {{ui:Kopiraj}} tačke u tabelu |
| Stilovi oznaka tačaka, simboli po ključu opisa, krive (lukovi) iz kodova linija, datoteka ključeva opisa za deljenje među projektima | Oznake prikazuju broj, visinu i opis, ili manje ([Podešavanja CivilCraft-a](topic:settings)); ključevi se čuvaju u datoteci projekta |
| Pretvaranje jedinica | Pretvori datoteku pre uvoza; **Jedinice** samo menjaju oznaku |

## Površi

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Više od jedne površi izrađene iz tačaka | Jedan projekat po površi |
| Sakrivanje (unutrašnjih) granica | Koristi **Najduža spoljna ivica** ili spoljašnju granicu |
| Biranje ili uređivanje jedne nacrtane linije loma | {{key:Mod+Z}}, ili {{ui:Ukloni nacrtane linije loma}} i nacrtaj ponovo |
| Uređivanje površi pročitane iz LandXML-a (linije loma, granica) | {{ui:Ponovo izgradi površinu iz tačaka}} |
| Uređivanje površi napravljene iz mreže kota | Uvezi mrežu ponovo sa drugim izborima |
| Pretvaranje površi pročitane iz LandXML-a kada se menja koordinatni sistem | Prvo {{ui:Ponovo izgradi površinu iz tačaka}} |
| Označene kote i vrednosti nagiba | Pročitaj ih u statusnoj traci, ili oboji površ po nagibu sa **Analiza nagiba** u radnom prostoru Uređenje okoline ([Nivelacija za uređenje okoline](topic:landscape-grading#grading-checks)) |

## Osovine trase i profili

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Spirale osim klotoide; spirala između dve krivine (složeni prelazi) | Klotoidne spirale na krajevima krivine su dostupne; ostale se imenuju i preskaču pri uvozu LandXML-a |
| Umetanje PI tačke između dve druge | Nacrtaj osovinu ponovo ili ponovo unesi koordinate PI tačaka |
| Osovine trase iz objekata, ofseta, proširenja | Crtaj preko PI tačaka |
| Unošenje K za vertikalnu krivinu | Unesi L (K se prikazuje) |
| Kružne i nesimetrične vertikalne krivine | Samo simetrične paraboličke krivine |
| Više od jednog projektovanog profila po osovini | Jedna osovina po varijanti |
| Zumiranje prikaza profila, pojasevi profila ispod profila | Prikaz profila uklapa celu osovinu; iscrtaj ga na [listovima osnove i profila](topic:plan-profile-sheets) |
| Preseci u DWG ili LandXML | Listovi preseka kao PDF; {{ui:CSV}} površina i zapremina |
| Probne linije pod uglom, ili različite širine duž puta | Jedna širina sa svake strane za celu osovinu |

## Koridori

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Razdelne trake, barijere i nadvišenje koje rotira šablone | Crtaj ih kao šablone ([Šabloni koridora](topic:corridor-templates)); šabloni po stacionaži još ne primaju nadvišenje |
| Postepena promena između šablona dve oblasti (prelazi, suženja) | Promeni šablon na stacionaži, ili dodeli tački cilj širine liniji nacrtanoj kao suženje |
| Rotacija oko ivice, nadvišenje u LandXML-u | Nadvišenje se rotira oko osovine na kružnim krivinama; proširi traku ciljem širine do linije obeležja |
| Ciljevi za bočne nagibe (linija preseka sa terenom do linije ili površi), sopstvene površi koridora | Ciljevi pomeraju ivice kolovoza i bankina ([Koridori](topic:corridor)); koridor se uklapa u projektovanu površ |
| Zaobljenja ivičnjaka, skretne trake i ostrva uklopljeni u raskrsnicu; kraj sporednog puta odsečen do ivice glavnog puta pod kosim uglom; staza spojena sa putem u osnovi, u dužini i površini | Putevi koji se sreću spajaju se pravo, sa otvorenom ivicom glavnog puta i sporednim putem koji se do nje postepeno dovodi ([Gde se putevi sreću](topic:corridor#where-roads-meet-roads-pads-and-paths)); staza staje na ivici puta u projektovanoj površi i u 3D |
| Koridori izvezeni kao LandXML putevi; drugi koridor na osovini u IFC izvozu | Izvozi se projektovana površ |
| Šabloni terena koji menjaju projektovanu površ, u 3D ili u presecima | Daju površine i zapremine svakog sloja ([Šabloni terena](topic:corridor-templates#terrain-templates)) |
| Putanje okretanja sa brzinom, klizanjem guma, vremenom upravljanja, upravljanim prikolicama ili prostorom karoserije; biblioteka standardnih projektnih vozila; putanja okretanja nacrtana vučenjem vozila | Putanje okretanja pri maloj brzini duž linije obeležja ili osovine, sa tvojim dimenzijama vozila ([Putanje okretanja vozila](topic:swept-paths)) |

## Uređenje terena i zapremine

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Berme, otvorene linije obeležja uklopljene u projekat, uklapanje do linije obeležja sa drugog mesta | Zatvori liniju obeležja ([Linije obeležja](topic:feature-lines)), ili je koristi kao liniju loma postojećeg terena |
| Umetanje ili uklanjanje temena linije obeležja | Nacrtaj liniju ponovo, ili napravi stepenasti ofset |
| Lukovi u nacrtanim linijama loma (kroz tačke snimanja), spirale u linijama obeležja | Nacrtaj liniju obeležja sa lukovima i koristi je kao liniju loma postojećeg terena |
| Uklapanje do rastojanja, visine ili druge površi | Samo do postojećeg terena (linija preseka sa terenom) |
| Dodavanje ili uklanjanje ugla platoa | Obriši plato i nacrtaj ga ponovo |
| Zapremine TIN-u prema TIN-u (prizme), izbor veličine ćelije mreže | Metod mreže, veličina ćelije je izabrana za tebe |
| Nabrekanje i sleganje, humusni sloj, dubine kolovoza | Primeni faktore na prijavljene brojeve sam |
| Troškovi slobodnog i prekomernog prevoza, prevoz između različitih osovina, pozajmišta i deponije postavljene u osnovi | Dijagram prevoza masa sa tačkama ravnoteže, prebačenim zapreminama i prosečnim rastojanjima prevoza |

## Mreže cevovoda

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Više od jedne mreže po projektu | Zasebni projekti za kišnu i sanitarnu kanalizaciju |
| Vodovodne magistrale: kvalitet i starost vode, kontrole zasnovane na pravilima, drugi tipovi ventila (regulacija protoka, prigušivanje, održavanje pritiska), pumpe zadate snagom, potražnja koja zavisi od pritiska, Darcy–Weisbach opcija, katalog cevi sa debljinama zidova i klasama pritiska. Ostatak mreža pod pritiskom je u laboratoriji: [Vodovodne magistrale](topic:water-mains) | Proveri to u softveru za distribuciju vode; projektovani protoci sanitarne kanalizacije su u [Projektovanje sanitarnih protoka](topic:sanitary-design) |
| Protoci kanalizacije kroz vreme (hidrogrami, dinamičko vođenje, akumulacija, pumpe, prelivi) | [Projektovanje sanitarnih protoka](topic:sanitary-design) daje ustaljeni vršni protok koji koristi list projekta |
| Kapacitet ulaza, širenje vode u oluku, vođenje kroz retenciju, hidrogrami, gubici energije osim jednog koeficijenta u raskrsnici | Proveri ih u drugom softveru; protoci, dimenzije i linije nagiba su u [Odvodnjavanje kišnice](topic:storm-drainage) |
| Slivovi u PDF crtežu, DWG, DXF ili LandXML; slivovi iz površi (razvodnice) | Crtaj slivove ručno; čuvaju se u datoteci projekta |
| Katalozi cevi, necilindrične cevi, objekti koji nisu uspravne kutije ni cilindri (konusi, stepenice, korita), kategorija odvodnjavanja u biblioteci | Tipovi objekata iz parametara ([Mreža cevovoda](topic:pipe-network)); cevi sa prečnikom |
| Cevi u prikazu profila, zakrivljene cevi | Pročitaj kote dna i dubinu zatrpavanja u desnom panelu |

## Parcele

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Raspoređivanje parcela po površini ili frontu, parcele iz linija oko njih, pravo prolaza | Crtaj svaku parcelu po uglovima ili unesi njene pravce |
| Tabele krivina i tabele linija u osnovi; oznake pomerane ručno | Svaka dionica je obeležena duž sebe |
| Parcele u LandXML-u | Parcele se čuvaju u datoteci projekta i idu u PDF, DWG i DXF |

## Poligonski vlakovi

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Izravnanje po najmanjim kvadratima, pravilo tranzita, ponderisanje uglova prema rastojanjima | Kompasovo pravilo |
| Uglovi skretanja, zenitni uglovi i kosa rastojanja, kote trigonometrijskim nivelmanom | Svedi na horizontalna rastojanja i prave uglove, ili na pravce |
| Bočna snimanja, sirove datoteke sa instrumenata | Uvezi tačke kao datoteku tačaka |

## Obeležavanje

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Kolčići sa ofsetom (referentne tačke pomaknute od kolčića), kolčići nagiba na tački preseka | Obeleži na ofsetima koje ti trebaju, uključujući i one van bankine |
| Slanje kolčića direktno u sopstveni format instrumenta | CSV se otvara u kancelarijskom softveru većine instrumenata |
| Obeležavanje cevi, platoa i parcela | Koristi tačke snimanja blizu osovine ili pravce parcele |

## Datoteke i izlaz

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Tekst, šrafure i kote iz DWG ili DXF; prostor papira; povezani crteži (xref); binarni DXF | Linije iz prostora modela se otvaraju ([Otvaranje DWG ili DXF kao linija](topic:open-dwg-dxf)); povezane crteže otvori zasebno |
| Pomeranje više tačaka odjednom prevlačenjem | Iseci i nalepi ih, ili uređuj jednu po jednu |
| Listovi u uspravnoj orijentaciji, sopstveni naslovni blokovi, prozori pogleda koje sam rasporediš, listovi osnove i profila u DWG | Jedan list osnove u pejzažnoj orijentaciji po PDF-u, ili listovi osnove i profila duž osovine (PDF) |
| Iscrtavanje pojaseva kota i profila | Pojasevi su samo na ekranu; napravi snimak ekrana ako ti trebaju |
| Menjanje naziva slojeva, boja ili stilova oznaka | Promeni ih u CAD programu nakon DXF izvoza |
| Čuvanje u oblaku i istorija verzija | Čuvaj datoteke `.civilcraft.json` i drži rezervne kopije; za zajednički rad na jednom projektu koristi sesiju uživo u CadCraft Studiju ([Projektovanje jednog lokaliteta zajedno, uživo](topic:work-live)) |
| CadCraft Studio za iPad i iPhone i iz Google Play | Koristi CivilCraft u pregledaču na uređaju; na Androidu se CadCraft Studio instalira iz APK datoteke na getcadcraft.com/download |
| Otvaranje više datoteka tačaka ili projekata odjednom | Jedna datoteka po otvaranju (GIS datoteke koje pripadaju zajedno, kao delovi shapefile-a, otvaraju se zajedno) |

## Uređenje okoline

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Glave i mlaznice proizvođača | Generičke glave, ili dodaj sopstvene glave iz datoteke; podaci proizvođača dolaze kada oni to dozvole |
| Najveće bočne dužine linija za kap, protoci kroz vreme, pumpe, prstenaste mreže cevi | Drži linije kap do objavljene dužine proizvođača; provera zahteva razgranatu mrežu |
| Tačan obris konkavnog slobodnog oblika; njegova zapremina ispod terena izmerena tačno | Konveksni omotač se uklapa, a zapremina ispod terena je procena (navedeno u **Svojstvima**) |
| Biljke iz funkcije Postavi iz biblioteke u BimCraft-u i ModelCraft-u | Izvezi IFC za uređenje i otvori ga u BimCraft-u pored zgrade |
| Detaljni modeli biljaka (listovi, grane, godišnja doba) u 3D prikazu; slobodni oblici i navodnjavanje u 3D prikazu | Biljke se u 3D prikazuju kao jednostavni oblici čija veličina dolazi iz spiska biljaka ([Pogled na lokalitet u 3D](topic:site-3d)); raspršivanje u ModelCraft-u pravi slike sadnje |
| Zidovi tvrdog uređenja koji zadržavaju uklopljen nivo iza sebe na površi | Daj platformi ili platou vertikalne strane: na površi su to potporni zidovi ([Uređenje terena](topic:grading)) |
| Transformacije SVG-a u sopstvenim simbolima; teksture i boje sopstvenih GLB modela biljaka; sažeta GLB geometrija | Prvo sredi transformacije u programu za crtanje; modeli se crtaju bojom biljke; izvezi GLB bez sažimanja ([Grafika biljaka](topic:plant-graphics)) |
| Tvoj spisak biljaka čuvan u tvom nalogu u biblioteci (uređivan u aplikaciji) | Uređuj spisak projekta u tabeli biljaka i sačuvaj ga kao datoteku biljaka |
| Alati za uređenje okoline za asistente bez prozora (server datoteka i komandna linija) | Rade kad je prozor CivilCraft-a otvoren ([Neka AI asistent radi na tvom lokalitetu](topic:assistants)) |

## Dalekovodi

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Standard jedne zemlje ugrađen (slučajevi opterećenja, razmaci, faktori) | Postavi vrednosti svog standarda u {{ui:Slučajevi opterećenja i ograničenja…}} i sačuvaj ih, sa svojom bibliotekom, kao paket za ponovnu upotrebu i deljenje ([Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Bočno rastojanje od provodnika do krune drveta ili zida pored voda | Vertikalni razmak iznad biljaka i zidova koje vod preseca ([Provere dalekovoda](topic:power-line-checks#clearances)) |
| Puzanje provodnika i istezanje novog provodnika | Uračunaj ih kroz temperature u tabeli zatezanja |
| Termička klasa zakopanih kablova (strujno opterećenje prema načinu polaganja) | Unesi strujno opterećenje koje daje tvoj dobavljač u stavku kabla |
| Studije kratkog spoja, zaštite i uzemljenja | Koristi namenski električni program; CivilCraft daje dužine mreže i kablove |
| Rešetkasti stubovi projektovani štap po štap, i sidra zatega u tlu | Nosači se proveravaju prema nominalnom opterećenju; zatege prema nazivnom opterećenju |
| Studijska datoteka `.DON` provera se u programu koji je čita | Proveri datoteku tamo; pošalji nam uzorak da bismo testirali na pravoj |
| Dalekovodi u 3D prikazu i u IFC-u | Osnova, profil voda, listovi i GIS slojevi |
| Alati za dalekovode za asistente bez prozora | Rade kad je prozor CivilCraft-a otvoren ([Neka AI asistent radi na tvom lokalitetu](topic:assistants)) |

## Građevinske mase

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Biblioteka urbanističkih propisa ili pravila bilo kog grada | Unesi granice iz sopstvenog propisa ([Urbanistička ograničenja](topic:zoning-limits)) |
| Svetlost neba na zidovima (dnevna svetlost fasade), vetar | [Sunčani sati](topic:sun-hours) broje samo direktno sunce |
| Senka od drveća, biljaka ili svega što nije nacrtano kao masa | Crtaj susedne zgrade kao mase |
| Oblici krovova na masama | Mase sa ravnim vrhom |
| Otvori, krovovi i tipovi zidova kad se masa razrađuje u BimCraft-u | BimCraft gradi obične spoljne zidove na svakom nivou i na podu; ostalo dodaj tamo |

## GIS i koordinatni sistemi

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| File Geodatabase; KML stilovi, ikone, prekrivke terena i mrežne veze | Prvo pretvori u GeoPackage, shapefile ili GeoJSON; KML oznake mesta se čitaju bez svojih stilova |
| Uređivanje GIS objekata ili njihovih atributa | Uredi ih u GIS programu i uvezi ponovo. Panel Analiza pravi nove slojeve (bafer, preklapanje, spajanje, izbor) i dodaje polja površine i dužine, ali ne menja objekat na mestu |
| Analiza mreže i rastera, baferi sa ravnim ili kvadratnim krajevima i jednostrani baferi, dodavanje ili brisanje redova i menjanje tipa polja u tabeli atributa, ručne boje klasa, legenda stilova u iscrtavanjima | Koristi Izaberi za biranje objekata i pravljenje sloja od njih; ravni krajevi se ne nude. Bojenje po atributu i tabela atributa su izrađeni: pogledaj [Stilizovanje sloja po atributu](topic:gis-symbology) i [Rad sa tabelom atributa sloja](topic:gis-table) |
| Stilovi oznaka (veličina, položaj) i oznake koje se izbegavaju | Oznake su jedne veličine i mogu se preklapati tamo gde su objekti gusti |
| Vertikalni datumi i modeli geoida | Kote se koriste kako ih datoteka daje; sam proveri vertikalni datum |
| Pomeranja mreže osim NAD27 u NAD83 predložena po području (OSTN15, NTv2 za druge datume rade kad dodaš datoteku), više mreža odjednom, vertikalne mreže | Dodaj datoteku mreže za svoj datum sam; jedna mreža po projektu |
| Slojevi karte u DXF ili 3D izvozima | Slojevi karte idu u PDF iscrtavanje, a uz DWG kao slika |
| Serveri karata koji traže prijavu, ključ ili token | Koristi javne servise ili georeferenciranu sliku |
| Pisanje LAS ili LAZ datoteka iz površi, modela terena ili alata za mrežu kota i LiDAR | Izvezi površi kao GeoTIFF mrežu kota. Dodatak [Oblaci tačaka](topic:point-clouds) piše očišćen oblak kao LAS 1.4 ili LAZ |
| Intenzitet, boja i povratci LiDAR-a; mreže kota sa više pojaseva; datoteke mreže ili LiDAR veće od 200 MB | LiDAR se filtrira samo po klasi, mreže koriste prvi pojas; prvo iseci velike datoteke na pločice |

## Unos

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Izbor okvirom dodirom (potreban je {{key:Shift}}) | Dugo pritisni svaku tačku snimanja da je dodaš |
| Ukucane koordinate ili rastojanja pri crtanju | Crtaj približno, pa ukucaj tačne koordinate PI tačaka u tabeli PI tačaka osovine |
| Unošenje koordinata za uglove platoa i objekte | Prevuci njihove hvataljke; uvećaj za preciznost i prati E i N u statusnoj traci |
| Hvatanje za objekte (osim tačaka snimanja za linije loma) | Uvećaj i prati statusnu traku |

## 3D prikaz

| Još nije izrađeno | Umesto toga, danas |
|---|---|
| Crtanje ili uređivanje u 3D prikazu | Crtaj i uređuj u osnovi; 3D prikaz prati svaku izmenu |
| Biranje linija obeležja koridora ili GIS objekata klikom u 3D | Klikni ih u osnovi |
| Izvoz uveličanog prikaza ili u stopama | Izvozi su u pravoj razmeri u metrima; pogledaj [Izvoz lokaliteta u 3D](topic:export-3d) |
| Oznake u GLB ili OBJ izvozima, veličine i stilovi oznaka u 3D | Oznake se prikazuju samo u 3D prikazu, jedne veličine; pogledaj [Pogled na lokalitet u 3D](topic:site-3d) |
| Teksture sa fotografija, snimanje vožnje kao video, senke sa mesta van lokaliteta, sunčani sati prikazani u 3D prikazu | Slojevi karte prebačeni na površi; vožnja i položaj sunca u jednom trenutku; [sunčani sati](topic:sun-hours) za dan ili godišnje doba u osnovi |
