---
title: Još nije izrađeno
summary: Što ova verzija CivilCraft-a još ne radi i što umjesto toga učiniti danas.
keywords: nedostaje, ograničenja, plan razvoja, nije dostupno, spirale, proširenje, dwg, dxf, slivnici, retencije, poprečni presjeci, dolazi kasnije, granice
from: b91588d4
---

CivilCraft je u ranoj fazi. Ova stranica navodi što trenutna verzija ne radi, da ne tražite to. Ništa ovdje nije obećano za neki datum.

## Točke

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Dodavanje druge datoteke točaka prvoj | Spojite datoteke u uređivaču teksta ili tablici prije uvoza |
| Izvoz tekstualne datoteke točaka | Izvezite LandXML (točke izlaze kao CgPoints), upotrijebite GIS {{ui:Izvoz}} (točke s poljima P, N, E, Z i D) ili {{ui:Kopiraj}} točke u tablicu |
| Stilovi oznaka točaka, simboli po ključu opisa, krivulje (lukovi) iz kodova linija, datoteka ključa opisa za dijeljenje među projektima | Oznake prikazuju broj, kotu i opis, ili manje ([Postavke CivilCraft-a](topic:settings)); ključevi se čuvaju u datoteci projekta |
| Pretvorba jedinica | Pretvorite datoteku prije uvoza; **Jedinice** samo mijenjaju oznaku |

## Površine

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Više od jedne površine izrađene iz točaka | Jedan projekt po površini |
| Skrivanje (unutarnjih) granica | Upotrijebite **Najdulji vanjski rub** ili vanjsku granicu |
| Odabir ili uređivanje jedne nacrtane prijelomnice | {{key:Mod+Z}}, ili {{ui:Ukloni nacrtane prijelomnice}} i ponovno nacrtajte |
| Uređivanje površine očitane iz LandXML-a (prijelomnice, granica) | {{ui:Ponovno izradi teren iz točaka}} |
| Uređivanje površine izrađene iz mreže kota | Ponovno uvezite mrežu s drugim izborima |
| Pretvorba površine očitane iz LandXML-a kad se koordinatni sustav mijenja | {{ui:Ponovno izradi teren iz točaka}} prvo |
| Označene točke visine i vrijednosti nagiba | Očitajte ih u statusnoj traci ili obojite površinu prema nagibu s **Analiza nagiba** u radnom prostoru Krajobraz ([Planiranje za krajobraz](topic:landscape-grading#grading-checks)) |

## Trase i profili

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Spirale osim klotoide; spirala između dviju krivulja (složeni prijelazi) | Klotoidne spirale na krajevima zavoja su dostupne; ostale se imenuju i preskaču pri uvozu LandXML-a |
| Umetanje PI-ja između dva druga | Ponovno nacrtajte os ili ponovno upišite koordinate PI-ja |
| Trase iz objekata, odmaci, proširenja | Crtajte preko PI-ja |
| Upisivanje K za vertikalno zaobljenje | Upišite L (K se prikazuje) |
| Kružna i nesimetrična vertikalna zaobljenja | Samo simetrična parabolična zaobljenja |
| Više od jednog projektiranog profila po trasi | Jedna os po varijanti |
| Zumiranje prikaza profila, pojasevi profila ispod profila | Prikaz profila prilagođava se cijeloj osi; ispišite ga na [listovima tlocrta i profila](topic:plan-profile-sheets) |
| Presjeci u DWG-u ili LandXML-u | Listovi presjeka kao PDF; {{ui:CSV}} površina i volumena |
| Linije uzorkovanja pod kutom ili različitih širina uzduž ceste | Jedna širina sa svake strane za cijelu os |

## Koridori

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Središnji pojasevi, barijere i nadvišenje koje zakreće predloške | Nacrtajte ih kao predloške ([Predlošci koridora](topic:corridor-templates)); predlošci po stacionaži još ne prihvaćaju nadvišenje |
| Postupna promjena između predložaka dviju regija (prijelazi, suženja) | Promijenite predložak na stacionaži ili dajte točki cilj širine prema liniji nacrtanoj kao suženje |
| Rotacija oko ruba, nadvišenje u LandXML-u | Nadvišenje zakreće oko osi na kružnim zavojima; proširite traku ciljem širine prema značajnoj liniji |
| Ciljevi za bočne pokose (linija pokosa prema liniji ili površini), vlastite površine koridora | Ciljevi pomiču rubove kolnika i bankina ([Koridori](topic:corridor)); koridor se planira u projektiranu površinu |
| Rubne zaobljenosti na uglovima, skretne trake i otočići planirani u raskrižje; kraj sporedne ceste rezan do ruba glavne ceste pod kosim kutom; staza spojena s cestom u tlocrtu, u njezinoj duljini i površini | Ceste koje se spajaju spajaju se okomito, s otvorenim rubom glavne ceste i sporednom cestom postupno prilagođenom ([Gdje se ceste spajaju](topic:corridor#where-roads-meet-roads-pads-and-paths)); staza staje na rubu ceste u projektiranoj površini i u 3D-u |
| Koridori izvezeni kao LandXML kolnici; drugi koridor na osi u IFC izvozu | Izvozi se projektirana površina |
| Predlošci terena koji mijenjaju projektiranu površinu, u 3D-u ili u presjecima | Daju površine i volumene svakog sloja ([Predlošci terena](topic:corridor-templates#terrain-templates)) |
| Putanje vozila s brzinom, klizanjem guma, vremenom upravljanja, upravljanim prikolicama ili zazorom karoserije; biblioteka standardnih projektnih vozila; putanja vozila povučena s vozilom | Putanje vozila pri maloj brzini duž značajne linije ili osi, s vlastitim dimenzijama vozila ([Putanje vozila](topic:swept-paths)) |

## Planiranje i volumeni

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Etaže, otvorene značajne linije planirane u projekt, planiranje do značajne linije iz nekog drugog mjesta | Zatvorite značajnu liniju ([Značajne linije](topic:feature-lines)) ili je upotrijebite kao prijelomnicu postojećeg terena |
| Umetanje ili uklanjanje vrha značajne linije | Ponovno nacrtajte liniju ili napravite stepenasti odmak od nje |
| Lukovi u nacrtanim prijelomnicama (kroz točke izmjere), spirale u značajnim linijama | Nacrtajte značajnu liniju s lukovima i upotrijebite je kao prijelomnicu postojećeg terena |
| Planiranje do udaljenosti, kote ili druge površine | Samo odsijecanje prema postojećem terenu |
| Dodavanje ili uklanjanje kuta platoa | Obrišite plato i ponovno ga nacrtajte |
| Volumeni TIN-na-TIN (prizme), izbor veličine ćelije mreže | Metoda mreže, veličina ćelije odabrana za vas |
| Nabreknuće i skupljanje, humus, debljine kolnika | Primijenite faktore na prijavljene brojke sami |
| Troškovi slobodnog i prekomjernog prijevoza, prijevoz između različitih osi, posudišta i odlagališta postavljeni u tlocrt | Dijagram masovne bilance s točkama ravnoteže, pomaknuti volumeni i prosječne udaljenosti prijevoza |

## Cjevovodne mreže

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Više od jedne mreže po projektu | Zasebni projekti za oborinsku i sanitarnu odvodnju |
| Vodovodne magistrale: kakvoća i starost vode, upravljanje po pravilima, drugi tipovi ventila (regulacija protoka, prigušnica, održavanje tlaka), crpke zadane snagom, potražnja koja ovisi o tlaku, Darcy–Weisbachova opcija, katalog cijevi s debljinama stijenki i tlačnim razredima. Ostatak tlačnih mreža je u laboratoriju: [Vodovodne magistrale](topic:water-mains) | Provjerite to u softveru za distribuciju vode; sanitarni protoci za projektiranje nalaze se u [Sanitarni projektni protoci](topic:sanitary-design) |
| Protoci u kanalizaciji tijekom vremena (hidrogrami, dinamičko usmjeravanje, akumulacija, crpke, prelijevanja) | [Sanitarni projektni protoci](topic:sanitary-design) daje stacionarni vršni protok koji koristi projektni list |
| Kapacitet slivnika, raspon kanala, usmjeravanje retencije, hidrogrami, gubici energije osim jednog koeficijenta spoja | Provjerite u drugom softveru; protoci, dimenzije i linije nagiba su u [Oborinska odvodnja](topic:storm-drainage) |
| Slivna područja u PDF ispisu, DWG-u, DXF-u ili LandXML-u; slivna područja iz površine (razvodnice) | Nacrtajte slivna područja ručno; spremaju se u datoteci projekta |
| Katalozi cijevi, nekružne cijevi, građevine koje nisu uspravne kutije ili cilindri (stošci, stepenice, proširenja) | Tipovi građevina iz parametara ([Cjevovodna mreža](topic:pipe-network)); cijevi s promjerom |
| Cijevi u prikazu profila, zakrivljene cijevi | Očitajte dna i nadslojeve u desnom panelu |

## Parcele

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Parcelacija po površini ili pročelju, parcele iz linija oko njih, pravo prolaza | Nacrtajte svaku parcelu po njezinim kutovima ili upišite njezine pravce |
| Tablice krivulja i tablice linija na tlocrtu; oznake pomicane rukom | Svaki pravac je označen uz sebe |
| Parcele u LandXML-u | Parcele se spremaju u datoteci projekta i idu u PDF, DWG i DXF |

## Poligonski vlakovi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Izjednačenje metodom najmanjih kvadrata, pravilo transita, ponderiranje kutova prema udaljenostima | Pravilo kompasa |
| Kutovi skretanja, zenitni kutovi i kose udaljenosti, kote trigonometrijskim nivelmanom | Svedite na vodoravne udaljenosti i kutove ispravno ili na smjerne kutove |
| Bočna mjerenja, sirove datoteke podataka s registratora | Uvezite točke kao datoteku točaka |

## Iskolčenje

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Pomaknuti kolčići (referentne točke odmaknute od kolčića), kolčići pokosa na točki presjeka | Iskolčite na odmacima koje trebate, uključujući one iza bankine |
| Slanje kolčića izravno u vlastiti format registratora | CSV se otvara u uredskom softveru većine registratora |
| Iskolčavanje cijevi, platoa i parcela | Upotrijebite točke izmjere blizu osi ili pravce parcele |

## Datoteke i ispis

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Tekst, šrafure i kote iz DWG-a ili DXF-a; papirni prostor; vanjske reference (xref); binarni DXF | Crte iz prostora modela se otvaraju ([Otvorite DWG ili DXF kao crte](topic:open-dwg-dxf)); vanjske crteže otvorite zasebno |
| Pomicanje više točaka odjednom povlačenjem | Izrežite i zalijepite ih ili uređujte jednu po jednu |
| Okomiti listovi, vlastiti okviri naslova, prikazi koje sami slažete, listovi tlocrta i profila u DWG-u | Jedan vodoravni list tlocrta po PDF-u ili listovi tlocrta i profila duž osi (PDF) |
| Ispis pojasa kota i profila | Pojasevi su samo na zaslonu; napravite snimku zaslona ako ih trebate |
| Promjena imena slojeva, boja ili stilova oznaka | Promijenite ih u CAD programu nakon izvoza DXF-a |
| Spremanje u oblak i povijest verzija | Spremajte datoteke `.civilcraft.json` i čuvajte ih u sigurnosnoj kopiji; za zajednički rad na jednom projektu upotrijebite sesiju uživo u CadCraft Studio ([Zajednički rad na lokaciji uživo](topic:work-live)) |
| CadCraft Studio za iPad i iPhone te s Google Playa | Koristite CivilCraft u pregledniku na uređaju; na Androidu se CadCraft Studio instalira iz svoje APK datoteke na getcadcraft.com/download |
| Otvaranje više datoteka točaka ili projekata odjednom | Jedna datoteka po otvaranju (GIS datoteke koje pripadaju skupu, poput dijelova shapefilea, otvaraju se zajedno) |

## Krajobraz

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Glave i mlaznice proizvođača | Generičke glave ili dodajte vlastite glave iz datoteke; podaci proizvođača dolaze čim dadu dopuštenje |
| Najveće bočne duljine za linije kapanja, protoci tijekom vremena, crpke, zatvorene petljaste mreže cijevi | Držite linije kapanja unutar objavljene duljine proizvođača; provjera treba razgranatu mrežu |
| Točan obris konkavnog slobodnog oblika; njegov volumen ispod zemlje mjeren točno | Konveksna ljuska se planira, a volumen ispod zemlje je procjena (navodi se u Svojstvima) |
| Biljke iz vlastitog „Postavi iz knjižnice“ u BimCraftu i ModelCraftu | Izvezite IFC krajobraza i otvorite ga u BimCraftu uz zgradu |
| Detaljni modeli biljaka (lišće, grane, godišnja doba) u 3D prikazu; slobodni oblici i navodnjavanje u 3D prikazu | Biljke se u 3D-u prikazuju kao jednostavni oblici prema veličini iz popisa biljaka ([Pregled lokacije u 3D-u](topic:site-3d)); raspršivanje u ModelCraftu stvara slike sadnje |
| Zidovi hardscapea koji zadržavaju planiranu razinu iza sebe na površini | Dajte platou ili platformi okomite stranice: na površini su to potporni zidovi ([Planiranje](topic:grading)) |
| SVG transformacije u vlastitim simbolima; teksture i boje vlastitih GLB modela biljaka; komprimirana GLB geometrija | Najprije razbijte transformacije u programu za crtanje; modeli se crtaju bojom biljke; izvezite GLB bez kompresije ([Grafika biljaka](topic:plant-graphics)) |
| Vlastiti popis biljaka u vašem računu Knjižnice (uređuje se u aplikaciji) | Uredite vlastiti popis projekta u tablici biljaka i spremite ga kao datoteku biljaka |
| Alati za krajobraz za asistente bez prozora (poslužitelj datoteka i naredbeni redak) | Rade kad je prozor CivilCraft-a otvoren ([Pustite AI asistenta da radi s vašom lokacijom](topic:assistants)) |

## Dalekovodi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Nacionalni standard ugrađen (slučajevi opterećenja, zazori, faktori) | Postavite vrijednosti svog standarda u {{ui:Slučajevi opterećenja i granice…}} i spremite ih, zajedno s knjižnicom, kao paket za ponovnu upotrebu i dijeljenje ([Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Bočna udaljenost od vodiča do krošnje stabla ili zida pored voda | Okomiti zazor iznad biljaka i zidova koje vod presijeca ([Provjere dalekovoda](topic:power-line-checks#clearances)) |
| Puzanje vodiča i istezanje novog vodiča | Uračunajte ih kroz temperature u tablici zatezanja |
| Termička snaga ukopanih kabela (strujno opterećenje prema načinu polaganja) | Unesite strujno opterećenje koje navodi dobavljač na stavku kabela |
| Studije kratkog spoja, zaštite i uzemljenja | Upotrijebite namjenski elektrotehnički program; CivilCraft daje duljine mreže i kabele |
| Rešetkasti stupovi projektirani član po član i sidra zatega u tlu | Nosači se provjeravaju prema nazivnom opterećenju; zatege prema nazivnom opterećenju |
| Datoteka studije `.DON` provjerena u programu koji je čita | Provjerite je u tom programu; pošaljite nam uzorak da možemo testirati na stvarnoj datoteci |
| Dalekovodi u 3D prikazu i u IFC-u | Tlocrt, profil voda, listovi i GIS slojevi |
| Alati za dalekovode za asistente bez prozora | Rade kad je prozor CivilCraft-a otvoren ([Pustite AI asistenta da radi s vašom lokacijom](topic:assistants)) |

## Volumeni zgrada

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Biblioteka zoniranja ili pravila bilo kojeg grada | Upišite granice iz vlastite odluke ([Ograničenja zoniranja](topic:zoning-limits)) |
| Svjetlo neba na zidovima (dnevno svjetlo fasade), vjetar | [Sati sunca](topic:sun-hours) broje samo izravno sunce |
| Sjena od drveća, biljaka ili svega što nije nacrtano kao volumen | Nacrtajte susjedne zgrade kao volumene |
| Oblici krovova na volumenima | Volumeni s ravnim vrhom |
| Otvori, krovovi i vrste zidova kad se volumen razrađuje u BimCraftu | BimCraft gradi obične vanjske zidove na svakoj etaži i na podu; ostalo dodajte tamo |

## GIS i koordinatni sustavi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Datoteka File Geodatabase; stilovi, ikone, prekrivanja terena i mrežne veze KML-a | Prvo pretvorite u GeoPackage, shapefile ili GeoJSON; KML oznake čitaju se bez stilova |
| Uređivanje GIS značajki ili njihovih atributa | Uredite ih u GIS programu i ponovno uvezite. Ploča Analiza stvara nove slojeve (pufer, preklapanje, spajanje, odabir) i dodaje polja površine i duljine, ali ne uređuje značajku na mjestu |
| Mrežna i rasterska analiza, puferi s ravnim ili kvadratnim krajevima i jednostrani puferi, dodavanje ili brisanje redaka i promjena tipa polja u tablici atributa, ručne boje klasa, legenda stilova u ispisima | Upotrijebite Odaberi za odabir značajki i stvaranje sloja od njih; ravni krajevi nisu ponuđeni. Bojanje prema atributu i tablica atributa su izrađeni: vidi [Stiliziranje sloja prema atributu](topic:gis-symbology) i [Rad s tablicom atributa sloja](topic:gis-table) |
| Stilovi oznaka (veličina, položaj) i oznake koje izbjegavaju jedna drugu | Oznake su jedne veličine i mogu se preklapati gdje su značajke guste |
| Vertikalni datumi i modeli geoida | Kote se koriste onako kako ih datoteka daje; sami provjerite vertikalni datum |
| Pomaci mreže osim prema NAD83 iz NAD27 predloženi prema području (OSTN15, NTv2 za druge datume rade kad dodate datoteku), više mreža odjednom, vertikalne mreže | Sami dodajte datoteku mreže za svoj datum; jedna mreža po projektu |
| Slojevi karte u DXF-u ili 3D izvozima | Slojevi karte idu u PDF ispis, a uz DWG kao slika |
| Poslužitelji karata koji traže prijavu, ključ ili token | Upotrijebite javne usluge ili datoteku georeferencirane slike |
| Pisanje LAS ili LAZ datoteka iz površine, modela terena ili alata za mrežu kota i LiDAR | Izvezite površine kao GeoTIFF mrežu kota. Dodatak [Oblaci točaka](topic:point-clouds) zapisuje očišćeni oblak kao LAS 1.4 ili LAZ |
| Intenzitet, boja i povratci LiDAR-a; mreže kota s više pojaseva; datoteke mreže ili LiDAR-a veće od 200 MB | LiDAR se filtrira samo po klasi, mreže koriste prvi pojas; prvo razdvojite velike datoteke na pločice |

## Unos

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Odabir okvirom dodirom (treba {{key:Shift}}) | Dugo pritisnite svaku točku izmjere da je dodate |
| Upisane koordinate ili udaljenosti dok crtate | Nacrtajte grubo, zatim upišite točne koordinate PI-ja u tablicu PI-ja trase |
| Upisivanje koordinata za kutove platoa i građevina | Povucite njihove ručke; uvećajte radi preciznosti i pratite E i N u statusnoj traci |
| Hvatanje za objekte (osim točaka izmjere za prijelomnice) | Uvećajte i pratite statusnu traku |

## 3D prikaz

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Crtanje ili uređivanje u 3D prikazu | Crtajte i uređujte u tlocrtu; 3D prikaz prati svaku promjenu |
| Odabir značajnih linija koridora ili GIS značajki klikom u 3D-u | Kliknite ih u tlocrtu |
| Izvoz pojačanog prikaza ili u stopama | Izvozi su u pravom mjerilu u metrima; vidi [Izvoz lokacije u 3D](topic:export-3d) |
| Oznake u GLB ili OBJ izvozima, veličine i stilovi oznaka u 3D-u | Oznake se prikazuju samo u 3D prikazu, jedne veličine; vidi [Pregled lokacije u 3D](topic:site-3d) |
| Teksture iz fotografija, snimanje vožnje kao videa, sjene izvan lokacije, sati sunca u 3D prikazu | Slojevi karte preko površina; vožnja i položaj sunca u jednom trenutku; [sati sunca](topic:sun-hours) za dan ili godišnje doba u tlocrtu |
