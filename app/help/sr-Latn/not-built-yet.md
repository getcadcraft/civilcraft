---
title: Još nije izgrađeno
summary: Šta ova verzija CivilCraft-a još ne radi i šta treba raditi umesto toga danas.
keywords: nedostaje, ograničenja, plan razvoja, nedostupno, spirale, proširenja, dwg, dxf, slivnici, zadržavanje, preseci, kasnije, granice
from: a2d970ef
---

CivilCraft je u ranoj fazi. Ova stranica navodi šta trenutna verzija ne radi, da ne tražiš to uzalud. Ništa ovde nije obećano za neki datum.

## Tačke

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Dodavanje druge datoteke tačaka prvoj | Spoji datoteke u tekst-editoru ili tabeli prvo |
| Izvoz tekstualne datoteke tačaka | Izvezi LandXML (tačke odlaze kao CgPoints), koristi GIS {{ui:Izvoz}} (tačke sa poljima P, N, E, Z i D), ili {{ui:Kopiraj}} tačke u tabelu |
| Stilovi oznaka tačaka, simboli po ključu opisa, krive (lukovi) iz kodova linija, datoteka ključeva opisa za deljenje među projektima | Oznake prikazuju broj, kotu i opis, ili manje ([CivilCraft podešavanja](topic:settings)); ključevi se čuvaju u datoteci projekta |
| Pretvaranje jedinica | Pretvori datoteku pre uvoza; **Jedinice** samo menjaju oznaku |

## Površi

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Više od jedne površi izgrađene iz tačaka | Jedan projekat po površi |
| Sakrivanje (unutrašnjih) granica | Koristi **Najduža spoljna ivica** ili spoljnu granicu |
| Biranje ili uređivanje jedne nacrtane linije loma | {{key:Mod+Z}}, ili {{ui:Ukloni nacrtane linije loma}} i ponovo nacrtaj |
| Uređivanje površi učitane iz LandXML-a (linije loma, granica) | {{ui:Ponovo izgradi površinu iz tačaka}} |
| Uređivanje površi napravljene iz mreže kota | Ponovo uvezi mrežu sa drugim izborima |
| Pretvaranje površi učitane iz LandXML-a kada se promeni koordinatni sistem | Prvo {{ui:Ponovo izgradi površinu iz tačaka}} |
| Označene kote tačaka i vrednosti nagiba | Očitaj ih u statusnoj traci, ili oboji površ po nagibu sa **Analiza nagiba** u radnom prostoru Pejzaž ([Nivelacija za pejzaž](topic:landscape-grading#grading-checks)) |

## Trase i profili

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Spirale osim klotoide; spirala između dve krive (složeni prelazi) | Klotoidne spirale na krajevima krive su dostupne; ostale se imenuju i preskaču pri uvozu LandXML-a |
| Umetanje PI između dva druga | Ponovo nacrtaj trasu, ili ponovo unesi koordinate PI |
| Trase iz objekata, pomeranja, proširenja | Crtaj preko PI |
| Kucanje K za vertikalnu krivu | Ukucaj L (K se prikazuje) |
| Kružne i nesimetrične vertikalne krive | Samo simetrične parabolične krive |
| Više od jednog projektnog profila po trasi | Jedna trasa po varijanti |
| Zumiranje prikaza profila, pojasevi profila ispod profila | Prikaz profila prilagođava celu trasu; iscrtaj ga na [listovima plana i profila](topic:plan-profile-sheets) |
| Preseci u DWG ili LandXML | Listovi preseka kao PDF; {{ui:CSV}} površina i zapremina |
| Uzorkovne linije pod uglom, ili različitih širina duž puta | Jedna širina sa svake strane za celu trasu |

## Koridori

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Srednje linije, barijere i nadvišenje koje rotira šablone | Crtaj ih kao šablone ([Šabloni koridora](topic:corridor-templates)); šabloni po stacionaži još ne preuzimaju nadvišenje |
| Postepena promena između šablona dva regiona (prelazi, suženja) | Promeni šablon na stacionaži, ili daj tački ciljnu širinu za liniju nacrtanu kao suženje |
| Rotacija oko ivice, nadvišenje u LandXML-u | Nadvišenje rotira oko osovine na kružnim krivama; proširi traku ciljnom širinom na karakterističnu liniju |
| Ciljevi za bočne nagibe (izlaz do linije ili površi), sopstvene površi koridora | Ciljevi pomeraju ivice kolovoza i bankina ([Koridori](topic:corridor)); koridor se nivelise u predloženu površ |
| Koridori izvezeni kao LandXML putevi; drugi koridor na trasi u IFC izvozu | Izvozi se predložena površ |
| Šabloni terena koji menjaju predloženu površ, u 3D ili u presecima | Daju površine i zapremine svakog sloja ([Šabloni terena](topic:corridor-templates#terrain-templates)) |
| Putanje vozila sa brzinom, klizanjem guma, vremenom upravljanja, prikolicama ili gabaritom karoserije; biblioteka standardnih projektnih vozila; putanja crtana prevlačenjem vozila | Putanje pri maloj brzini duž karakteristične linije ili trase, sa sopstvenim dimenzijama vozila ([Putanje vozila](topic:swept-paths)) |

## Nivelacija i zapremine

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Klupe, otvorene karakteristične linije nivelisane u projekat, nivelacija do karakteristične linije sa drugog mesta | Zatvori karakterističnu liniju ([Karakteristične linije](topic:feature-lines)), ili je koristi kao liniju loma postojećeg terena |
| Umetanje ili uklanjanje temena karakteristične linije | Ponovo nacrtaj liniju, ili napravi stepenasti pomak |
| Lukovi u nacrtanim linijama loma (kroz geodetske tačke), spirale u karakterističnim linijama | Nacrtaj karakterističnu liniju sa lukovima i koristi je kao liniju loma postojećeg terena |
| Nivelacija do rastojanja, kote ili druge površi | Odsecanje do postojećeg terena samo |
| Dodavanje ili uklanjanje ugla platoa | Obriši plato i nacrtaj ga ponovo |
| Zapremine TIN-u-TIN (prizme), izbor veličine ćelije mreže | Metoda mreže, veličina ćelije je izabrana za tebe |
| Nabreklost i skupljanje, humus, debljine kolovoza | Primeni faktore na prijavljene brojeve ručno |
| Troškovi besplatnog i dodatnog prevoza, prevoz između različitih trasa, pozajmišta i deponije postavljene na planu | Dijagram masa sa tačkama ravnoteže, premeštene zapremine i prosečna rastojanja prevoza |

## Mreže cevi

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Više od jedne mreže po projektu | Odvojeni projekti za kišnu i fekalnu |
| Vodovodne magistrale: kvalitet i starost vode, upravljanje po pravilima, drugi tipovi ventila (regulacija protoka, prigušni, održavajući), pumpe date snagom, potražnja koja zavisi od pritiska, Darsi–Vajsbahova opcija, katalog cevi sa debljinama zidova i klasama pritiska. Ostatak mreža pod pritiskom je u laboratoriji: [Vodovodne magistrale](topic:water-mains) | Proveri to u softveru za vodosnabdevanje; protoci fekalne kanalizacije su u [Projektni protoci fekalne kanalizacije](topic:sanitary-design) |
| Protoci kanalizacije tokom vremena (hidrogrami, dinamičko vođenje, skladištenje, pumpe, preliv) | [Projektni protoci fekalne kanalizacije](topic:sanitary-design) daje ustaljeni vršni protok koji koristi list proračuna |
| Kapacitet slivnika, raspon kroz žleb, vođenje zadržavanja, hidrogrami, gubici energije osim jednog koeficijenta na spoju | Proveri ih u drugom softveru; protoci, veličine i linije pritiska su u [Odvodnjavanje kišnice](topic:storm-drainage) |
| Slivovi u PDF crtežu, DWG, DXF ili LandXML; slivovi iz površi (razvodnice) | Crtaj slivove ručno; čuvaju se u datoteci projekta |
| Katalozi cevi, necilindrične cevi, objekti koji nisu uspravne kutije ili cilindri (konusi, stepenice, banke), kategorija odvodnjavanja u biblioteci | Tipovi objekata iz parametara ([Mreža cevi](topic:pipe-network)); cevi sa prečnikom |
| Cevi u prikazu profila, krive cevi | Očitaj dna i nadsloj u desnom panelu |

## Parcele

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Razmeštanje parcela po površini ili frontu, parcele iz linija oko njih, pravo prolaza | Nacrtaj svaku parcelu po njenim uglovima, ili unesi njene deonice |
| Tabele krivih i tabele linija na planu; oznake pomerane ručno | Svaka deonica je označena duž sebe |
| Parcele u LandXML | Parcele se čuvaju u datoteci projekta i idu u PDF, DWG i DXF |

## Poligonski vlakovi

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Izravnanje po metodi najmanjih kvadrata, pravilo transita, ponderisanje uglova prema rastojanjima | Pravilo kompasa |
| Uglovi skretanja, zenitni uglovi i kosa rastojanja, kote trigonometrijskim nivelmanom | Svedi na horizontalna rastojanja i uglove ispravno, ili na azimute |
| Bočna merenja, sirove datoteke podataka sa mernih uređaja | Uvezi tačke kao datoteku tačaka |

## Iskolčenje

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Pomoćni kolčevi (referentne tačke odmaknute od kolca), kosi kolčevi na tački preseka | Iskolči na ofsetima koji ti trebaju, uključujući i dalje od ivice bankine |
| Slanje kolčeva direktno u format mernog uređaja | CSV se otvara u kancelarijskom softveru većine mernih uređaja |
| Iskolčavanje cevi, platoa i parcela | Koristi geodetske tačke blizu trase, ili deonice parcele |

## Datoteke i izlaz

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Tekst, šrafure i kote iz DWG ili DXF; papirni prostor; povezani crteži (xref); binarni DXF | Linije iz modelnog prostora se otvaraju ([Otvori DWG ili DXF kao linije](topic:open-dwg-dxf)); otvori povezane crteže zasebno |
| Pomeranje više tačaka odjednom prevlačenjem | Iseci i nalepi ih, ili uređuj jednu po jednu |
| Portretni listovi, sopstveni natpisni blokovi, prozori pogleda koje sam raspoređuješ, listovi plana i profila u DWG | Jedan list plana u pejzažu po PDF-u, ili listovi plana i profila duž trase (PDF) |
| Iscrtavanje pojaseva kota i profila | Pojasevi su samo na ekranu; uzmi snimak ekrana ako ih treba |
| Promena imena slojeva, boja ili stilova oznaka | Promeni ih u CAD programu nakon DXF izvoza |
| Čuvanje u oblaku i istorija verzija | Čuvaj `.civilcraft.json` datoteke i pravi im rezervne kopije; za zajednički rad na jednom projektu koristi sesiju uživo u CadCraft Studio ([Projektuj jedno gradilište zajedno, uživo](topic:work-live)) |
| CadCraft Studio za iPad i iPhone, i iz Google Play-a | Koristi CivilCraft u pregledaču na uređaju; na Androidu se CadCraft Studio instalira iz APK-a na getcadcraft.com/download |
| Otvaranje više datoteka tačaka ili projekata odjednom | Jedna datoteka po otvaranju (GIS datoteke koje pripadaju zajedno, kao delovi shapefile-a, otvaraju se zajedno) |

## Pejzaž

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Proizvođačke glave i mlaznice | Opšte glave, ili dodaj sopstvene glave iz datoteke; podaci proizvođača dolaze kako daju dozvolu |
| Maksimalne bočne dužine za linije kapanja, protoci tokom vremena, pumpe, zatvorene (prstenaste) mreže cevi | Drži trase kapanja na objavljenoj dužini proizvođača; provera zahteva razgranatu mrežu |
| Tačan obris konkavnog slobodnog oblika; njegova zapremina ispod zemlje izmerena tačno | Konveksni omotač se nivelise, a zapremina ispod zemlje je procena (navedeno u Svojstvima) |
| Biljke u sopstvenoj funkciji Postavi iz biblioteke u BimCraft-u i ModelCraft-u | Izvezi IFC pejzaža i otvori ga u BimCraft-u pored zgrade |
| Detaljni modeli biljaka (lišće, grane, godišnja doba) u 3D prikazu; slobodni oblici i navodnjavanje u 3D prikazu | Biljke se u 3D prikazuju kao jednostavni oblici veličine iz spiska biljaka ([Prikaz lokacije u 3D](topic:site-3d)); raspršivanje u ModelCraft-u pravi slike sadnje |
| Zidovi od kamena koji drže nivelisan nivo iza sebe na površi | Daj platformi ili platou vertikalne strane: one su potporni zidovi na površi ([Nivelacija](topic:grading)) |
| SVG transformacije u sopstvenim simbolima; teksture i boje sopstvenih GLB modela biljaka; komprimovana GLB geometrija | Prvo razloži transformacije u programu za crtanje; modeli se crtaju u boji biljke; izvezi GLB bez kompresije ([Grafika biljaka](topic:plant-graphics)) |
| Sopstveni spisak biljaka u tvom nalogu u Biblioteci (uređuje se u aplikaciji) | Uredi spisak projekta u tabeli Biljke i sačuvaj ga kao datoteku biljaka |
| Alati za pejzaž za asistente bez prozora (server datoteka i komandna linija) | Rade kada je prozor CivilCraft-a otvoren ([Neka AI asistent radi sa tvojim gradilištem](topic:assistants)) |

## Dalekovodi

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Standard države ugrađen (slučajevi opterećenja, razmaci, faktori) | Podesi vrednosti svog standarda u {{ui:Slučajevi opterećenja i ograničenja…}} i sačuvaj ih, sa svojom bibliotekom, kao paket za ponovnu upotrebu i deljenje ([Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Bočno rastojanje od provodnika do krošnje drveta ili zida pored voda | Vertikalni razmak iznad biljaka i zidova koje linija preseca ([Provere dalekovoda](topic:power-line-checks#clearances)) |
| Puzanje provodnika i izduženje novog provodnika | Uračunaj ih kroz temperature u tabeli zatezanja |
| Termička nosivost ukopanih kablova (strujno opterećenje prema načinu polaganja) | Unesi strujno opterećenje od dobavljača na stavku kabla |
| Studije kratkog spoja, zaštite i uzemljenja | Koristi namenski električni program; CivilCraft daje dužine mreže i kablova |
| Rešetkasti stubovi projektovani član po član, i sidra zatega u tlu | Stubovi se proveravaju po nominalnom opterećenju; zatege po nazivnom opterećenju |
| Datoteka studije `.DON` proverena u programu koji je čita | Proveri datoteku tamo; pošalji nam uzorak da testiramo na pravom |
| Dalekovodi u 3D prikazu i u IFC | Plan, profil linije, listovi i GIS slojevi |
| Alati za dalekovode za asistente bez prozora | Rade kada je prozor CivilCraft-a otvoren ([Neka AI asistent radi sa tvojim gradilištem](topic:assistants)) |

## Mase zgrada

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Biblioteka zonskih propisa ili pravila bilo kog grada | Upiši ograničenja iz svoje odluke ([Zonska ograničenja](topic:zoning-limits)) |
| Dnevna svetlost na zidovima (dnevno svetlo fasade), vetar | [Sunčani sati](topic:sun-hours) broje samo direktno sunce |
| Senka od drveća, biljaka ili svega što nije nacrtano kao masa | Crtaj susedne zgrade kao mase |
| Krovni oblici na masama | Mase sa ravnim vrhom |
| Otvori, krovovi i tipovi zidova kada se masa razvija u BimCraft-u | BimCraft pravi obične spoljašnje zidove na svakom nivou i podu; dodaj ostalo tamo |

## GIS i koordinatni sistemi

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| File Geodatabase; KML stilovi, ikone, prekrivke terena i mrežne veze | Pretvori u GeoPackage, shapefile ili GeoJSON prvo; KML oznake mesta se čitaju bez stilova |
| Uređivanje GIS objekata ili njihovih atributa | Uredi ih u GIS programu i ponovo uvezi. Panel Analiza pravi nove slojeve (bafer, preklapanje, spajanje, izbor) i dodaje polja površine i dužine, ali ne menja objekat na mestu |
| Mrežna i rasterska analiza, baferi sa ravnim ili kvadratnim krajevima i jednostrani baferi, dodavanje ili brisanje redova i promena tipa polja u tabeli atributa, ručne boje klasa, legenda stilova u crtežima | Koristi {{ui:Izaberi}} da odabereš objekte i napraviš sloj od njih; ravni krajevi se ne nude. Bojenje po atributu i tabela atributa su izgrađeni: vidi [Stilizuj sloj po atributu](topic:gis-symbology) i [Radi sa tabelom atributa sloja](topic:gis-table) |
| Stilovi oznaka (veličina, raspored) i oznake koje se ne preklapaju | Oznake su jedne veličine i mogu se preklapati gde su objekti gusti |
| Vertikalni datumi i modeli geoida | Kote se koriste kako ih datoteka daje; sam proveri vertikalni datum |
| Pomaci mreže osim na NAD83 iz NAD27 predloženi po oblasti (OSTN15, NTv2 za druge datume rade kada dodaš datoteku), više mreža odjednom, vertikalne mreže | Dodaj datoteku mreže za svoj datum sam; jedna mreža po projektu |
| Slojevi karte u DXF ili 3D izvozima | Slojevi karte idu u PDF crtež, a uz DWG kao slika |
| Serveri karata koji traže prijavu, ključ ili token | Koristi javne servise, ili datoteku slike sa georeferencom |
| Pisanje LAS ili LAZ datoteka iz površi, modela terena ili alata za mrežu kota i LiDAR | Izvezi površi kao GeoTIFF mrežu kota. Dodatak [Oblaci tačaka](topic:point-clouds) piše očišćen oblak kao LAS 1.4 ili LAZ |
| LiDAR intenzitet, boja i povratci; mreže kota sa više opsega; datoteke mreža ili LiDAR preko 200 MB | LiDAR se filtrira samo po klasi, mreže koriste prvi opseg; prvoseci velike datoteke na delove |

## Unos

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Izbor okvirom dodirom (zahteva {{key:Shift}}) | Dugo pritisni svaku geodetsku tačku da je dodaš |
| Ukucane koordinate ili rastojanja pri crtanju | Nacrtaj približno, pa ukucaj tačne koordinate PI u tabeli PI trase |
| Ukucavanje koordinata za uglove platoa i objekata | Prevuci njihove hvataljke; uvećaj za preciznost i prati E i N u statusnoj traci |
| Privlačenje ka objektima (osim geodetskih tačaka za linije loma) | Uvećaj i prati statusnu traku |

## Prikaz u 3D

| Još nije izgrađeno | Umesto toga, danas |
|---|---|
| Crtanje ili uređivanje u 3D prikazu | Crtaj i uređuj u planu; 3D prikaz prati svaku izmenu |
| Biranje karakterističnih linija koridora ili GIS objekata klikom u 3D | Klikni ih u planu |
| Izvoz prikaza sa uvećanom visinom, ili u stopama | Izvozi su u tačnoj razmeri u metrima; vidi [Izvoz lokacije u 3D](topic:export-3d) |
| Oznake u GLB ili OBJ izvozima, veličine i stilovi oznaka u 3D | Oznake se prikazuju samo u 3D prikazu, jedne veličine; vidi [Prikaz lokacije u 3D](topic:site-3d) |
| Teksture sa fotografija, snimanje vožnje kao video, senke sa van lokacije, sunčani sati u 3D prikazu | Slojevi karte prebačeni na površi; vožnja i položaj sunca u jednom trenutku; [sunčani sati](topic:sun-hours) za dan ili godišnje doba na planu |
