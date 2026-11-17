---
title: Još nije izrađeno
summary: Što ova verzija CivilCrafta još ne radi i što raditi umjesto toga danas.
keywords: nedostaje, ograničenja, plan razvoja, nije dostupno, spirale, proširenja, dwg, dxf, slivnici, retencija, poprečni profili, dolazi kasnije, granice
from: a2d970ef
---

CivilCraft je u ranoj fazi. Ova stranica popisuje što trenutna verzija ne radi, da ga ne tražite. Ništa ovdje nije obećano za određeni datum.

## Točke

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Dodavanje druge datoteke točaka prvoj | Najprije spojite datoteke u uređivaču teksta ili proračunskoj tablici |
| Izvoz tekstualne datoteke točaka | Izvezite LandXML (točke idu kao CgPoints), koristite GIS {{ui:Izvoz}} (točke s poljima P, N, E, Z i D) ili {{ui:Kopiraj}} točke u proračunsku tablicu |
| Stilovi oznaka točaka, simboli po ključu opisa, krivulje (lukovi) iz kodova linija, datoteka ključeva opisa za dijeljenje među projektima | Oznake prikazuju broj, kotu i opis, ili manje ([Postavke CivilCrafta](topic:settings)); ključevi se čuvaju u datoteci projekta |
| Pretvorba jedinica | Pretvorite datoteku prije uvoza; **Jedinice** samo mijenjaju oznake |

## Tereni

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Više od jedne površine izrađene iz točaka | Jedan projekt po površini |
| Skrivanje unutarnjih granica | Upotrijebite **Najdulji vanjski rub** ili vanjsku granicu |
| Odabir ili uređivanje jedne nacrtane prijelomnice | {{key:Mod+Z}}, ili {{ui:Ukloni nacrtane prijelomnice}} i ponovno nacrtajte |
| Uređivanje površine pročitane iz LandXML-a (prijelomnice, granica) | {{ui:Ponovno izradi teren iz točaka}} |
| Uređivanje terena izrađenog iz mreže visina | Ponovno uvezite mrežu s drugim izborima |
| Pretvorba terena pročitanog iz LandXML-a kad se promijeni koordinatni sustav | Najprije {{ui:Ponovno izradi teren iz točaka}} |
| Označene točkaste kote i vrijednosti nagiba | Očitajte ih u statusnoj traci ili obojite teren prema nagibu s **Analiza nagiba** u radnom prostoru Krajobraz ([Uređivanje terena za krajobraz](topic:landscape-grading#grading-checks)) |

## Osi trasa i profili

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Spirale osim klotoide; spirala između dviju krivulja (složeni prijelazi) | Klotoidne spirale na krajevima krivulje su dostupne; ostale su imenovane i preskočene pri uvozu LandXML-a |
| Umetanje PI između dvije druge točke | Ponovno nacrtajte os trase ili ponovno upišite koordinate PI |
| Osi trasa iz objekata, odmaci, proširenja | Crtajte pomoću PI |
| Upisivanje K za vertikalnu krivulju | Upišite L (prikazuje se K) |
| Kružne i nesimetrične vertikalne krivulje | Samo simetrične paraboličke krivulje |
| Više od jednog projektiranog profila po osi trase | Jedna os trase po varijanti |
| Zumiranje prikaza profila, pojasevi profila ispod profila | Prikaz profila uklapa cijelu os trase; ispišite je na [listovima tlocrta i profila](topic:plan-profile-sheets) |
| Presjeci u DWG-u ili LandXML-u | Listovi presjeka kao PDF; {{ui:CSV}} površina i volumena |
| Linije uzorkovanja pod kutom ili različitih širina duž ceste | Jedna širina sa svake strane za cijelu os trase |

## Koridori

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Središnji pojasevi, barijere i nadvišenje koje rotira predloške | Crtajte ih kao predloške ([Predlošci koridora](topic:corridor-templates)); predlošci po stacionaži još ne uzimaju nadvišenje |
| Postupna promjena između predložaka dviju regija (prijelazi, suženja) | Promijenite predložak na stacionaži ili dajte točki ciljnu širinu za liniju nacrtanu kao suženje |
| Rotacija oko ruba, nadvišenje u LandXML-u | Nadvišenje rotira oko osi na kružnim krivuljama; proširite traku ciljnom širinom za značajnu liniju |
| Ciljevi za bočne nagibe (nožica pokosa do linije ili površine), vlastite površine koridora | Ciljevi pomiču rubove kolnika i bankina ([Koridori](topic:corridor)); koridor se uređuje u projektiranu površinu |
| Koridori izvezeni kao LandXML prometnice; drugi koridor na osi u IFC izvozu | Izvozi se projektirana površina |
| Predlošci terena koji mijenjaju projektiranu površinu, u 3D-u ili u presjecima | Daju površine i volumene svakog sloja ([Predlošci terena](topic:corridor-templates#terrain-templates)) |
| Putanje zakretanja s brzinom, klizanjem guma, vremenom upravljanja, upravljanim prikolicama ili zazorom karoserije; biblioteka standardnih projektnih vozila; putanja zakretanja nacrtana povlačenjem vozila | Putanje zakretanja pri maloj brzini duž značajne linije ili osi trase, s vlastitim dimenzijama vozila ([Putanje zakretanja vozila](topic:swept-paths)) |

## Uređivanje terena i volumeni

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Berme, otvorene značajne linije uređene u projekt, uređivanje do značajne linije iz drugog izvora | Zatvorite značajnu liniju ([Značajne linije](topic:feature-lines)) ili je upotrijebite kao prijelomnicu postojećeg terena |
| Umetanje ili uklanjanje vrha značajne linije | Ponovno nacrtajte liniju ili napravite stepenasti odmak od nje |
| Lukovi u nacrtanim prijelomnicama (kroz geodetske točke), spirale u značajnim linijama | Nacrtajte značajnu liniju s lukovima i upotrijebite je kao prijelomnicu postojećeg terena |
| Uređivanje do udaljenosti, kote ili druge površine | Nožica pokosa samo do postojećeg terena |
| Dodavanje ili uklanjanje kuta platoa | Obrišite plato i ponovno ga nacrtajte |
| Volumeni TIN-na-TIN (prizme), izbor veličine ćelije mreže | Metoda mreže, veličina ćelije odabrana za vas |
| Nabreknuće i skupljanje, humus, debljine kolnika | Primijenite faktore na prijavljene brojeve sami |
| Troškovi slobodnog i prekomjernog prijevoza, prijevoz između različitih osi trasa, pozajmišta i odlagališta postavljena na tlocrt | Dijagram masa s točkama ravnoteže, pomaknuti volumeni i prosječne udaljenosti prijevoza |

## Mreže cijevi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Više od jedne mreže po projektu | Zasebni projekti za oborinsku i fekalnu |
| Vodovodne cijevi: kvaliteta i starost vode, kontrole temeljene na pravilima, drugi tipovi ventila (regulacijski, prigušni, održavajući), crpke zadane snagom, potražnja ovisna o tlaku, Darcy–Weisbachova opcija, katalog cijevi s debljinama stijenki i klasama tlaka. Ostatak tlačnih mreža je u laboratoriju: [Vodovodne cijevi](topic:water-mains) | Provjerite to u softveru za distribuciju vode; projektni protoci fekalne kanalizacije su u [Projektnim protocima fekalne kanalizacije](topic:sanitary-design) |
| Protoci kanalizacije kroz vrijeme (hidrogrami, dinamičko usmjeravanje, akumulacija, crpke, prelijevi) | [Projektni protoci fekalne kanalizacije](topic:sanitary-design) daje stalni vršni protok koji koristi projektni list |
| Kapacitet slivnika, raspon kanala, usmjeravanje retencije, hidrogrami, gubici energije osim jednog koeficijenta čvora | Provjerite u drugom softveru; protoci, veličine i linije hidrauličkog nagiba su u [Oborinskoj odvodnji](topic:storm-drainage) |
| Slivna područja u PDF ispisu, DWG-u, DXF-u ili LandXML-u; slivna područja iz terena (razvodnice) | Crtajte slivna područja ručno; spremaju se u datoteku projekta |
| Katalozi cijevi, necirkularne cijevi, objekti koji nisu uspravne kutije ili cilindri (stošci, stepenice, bermi), kategorija odvodnje u knjižnici | Tipovi objekata iz parametara ([Mreža cijevi](topic:pipe-network)); cijevi s promjerom |
| Cijevi u prikazu profila, zakrivljene cijevi | Očitajte dna cijevi i nadsloj u desnoj ploči |

## Čestice

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Raspoređivanje parcela po površini ili pročelju, čestice iz linija oko njih, služnost prolaza | Nacrtajte svaku česticu po njezinim kutovima ili unesite njezine dionice |
| Tablice krivulja i tablice linija na tlocrtu; oznake pomicane ručno | Svaka dionica je označena uz samu sebe |
| Čestice u LandXML-u | Čestice se spremaju u datoteku projekta i idu u PDF, DWG i DXF |

## Poligonski vlakovi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Izjednačenje metodom najmanjih kvadrata, pravilo transita, ponderiranje kutova prema udaljenostima | Bowditchovo pravilo |
| Kutovi skretanja, zenitni kutovi i kose udaljenosti, kote trigonometrijskim nivelmanom | Svedite na vodoravne udaljenosti i kutove ispravno, ili na smjerne kutove |
| Bočna mjerenja, sirove datoteke podataka s mjernih uređaja | Uvezite točke kao datoteku točaka |

## Iskolčavanje

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Odmačni kolci (referentne točke postavljene iza kolca), kolci nagiba na mjestu hvatanja | Iskolčite na odmacima koji su vam potrebni, uključujući one izvan bankine |
| Slanje kolaca izravno u vlastiti format uređaja za prikupljanje podataka | CSV se otvara u uredskom softveru većine uređaja za prikupljanje podataka |
| Iskolčavanje cijevi, platoa i čestica | Koristite geodetske točke uz os trase ili dionice čestice |

## Datoteke i ispis

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Tekst, šrafure i kote iz DWG-a ili DXF-a; papirni prostor; vanjske reference (xref); binarni DXF | Linije iz prostora modela se otvaraju ([Otvorite DWG ili DXF kao linije](topic:open-dwg-dxf)); vanjske reference otvorite zasebno |
| Pomicanje više točaka odjednom povlačenjem | Izrežite i zalijepite ih ili uređujte jednu po jednu |
| Ispis u uspravnom formatu, vlastita zaglavlja (crteža), viewporti koje sami raspoređujete, listovi tlocrta i profila u DWG-u | Jedan vodoravni list tlocrta po PDF-u, ili listovi tlocrta i profila duž osi trase (PDF) |
| Ispis visinskih pojaseva i profila | Pojasevi su samo na ekranu; uzmite snimku zaslona ako ih trebate |
| Promjena naziva slojeva, boja ili stilova oznaka | Promijenite ih u CAD programu nakon izvoza DXF-a |
| Spremanje u oblak i povijest verzija | Spremite datoteke `.civilcraft.json` i održavajte sigurnosne kopije; za zajednički rad na jednom projektu koristite živu sesiju u CadCraft Studiju ([Projektirajte jednu lokaciju zajedno, uživo](topic:work-live)) |
| CadCraft Studio za iPad i iPhone te iz Google Playa | Koristite CivilCraft u pregledniku na uređaju; na Androidu se CadCraft Studio instalira iz svoje APK datoteke na getcadcraft.com/download |
| Otvaranje više datoteka točaka ili projekata odjednom | Jedna datoteka po otvaranju (GIS datoteke koje pripadaju skupu, poput dijelova shapefilea, otvaraju se zajedno) |

## Krajobraz

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Proizvođačeve glave i mlaznice | Generičke glave ili dodajte vlastite iz datoteke; podaci proizvođača dolaze kad to dopuste |
| Maksimalne bočne duljine za kapajuće vodove, protoci kroz vrijeme, crpke, petljasti cjevovodi | Držite kapajuće vodove na duljini koju objavi proizvođač; provjera zahtijeva razgranatu mrežu |
| Točan obris konkavnog slobodnog oblika; njegov volumen ispod zemlje izmjeren točno | Konveksni omotač se uređuje, a volumen ispod zemlje je procjena (navedeno u Svojstvima) |
| Biljke u vlastitoj naredbi Postavi iz knjižnice u BimCraftu i ModelCraftu | Izvezite krajobrazni IFC i otvorite ga u BimCraftu uz zgradu |
| Detaljni modeli biljaka (listovi, grane, godišnja doba) u 3D prikazu; slobodni oblici i navodnjavanje u 3D prikazu | Biljke se u 3D prikazu pojavljuju kao jednostavni oblici prema veličini iz popisa biljaka ([Pogledajte lokaciju u 3D-u](topic:site-3d)); raspršivanje u ModelCraftu stvara slike sadnje |
| Zidovi od tvrdih materijala koji zadržavaju uređenu razinu iza sebe na površini | Dajte platformi ili platou okomite stranice: tada su potporni zidovi na površini ([Uređivanje terena](topic:grading)) |
| SVG transformacije u vlastitim simbolima; teksture i boje vlastitih GLB modela biljaka; komprimirana GLB geometrija | Najprije primijenite transformacije u programu za crtanje; modeli se crtaju bojom biljke; izvezite GLB bez kompresije ([Grafika biljaka](topic:plant-graphics)) |
| Vlastiti popis biljaka u vašem računu u knjižnici (uređuje se u aplikaciji) | Uredite popis projekta u tablici biljaka i spremite ga kao datoteku biljaka |
| Alati za krajobraz za asistente bez prozora (poslužitelj datoteka i naredbeni redak) | Rade s otvorenim prozorom CivilCrafta ([Neka AI asistent radi s vašom lokacijom](topic:assistants)) |

## Dalekovodi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Standard neke zemlje ugrađen (slučajevi opterećenja, razmaci, faktori) | Postavite vrijednosti svog standarda u {{ui:Slučajevi opterećenja i granice…}} i spremite ih, zajedno s knjižnicom, kao paket za ponovnu uporabu i dijeljenje ([Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Vodoravna udaljenost od vodiča do krošnje drveta ili zida pored voda | Okomiti slobodni razmak iznad biljaka i zidova koje vod prelazi ([Provjere dalekovoda](topic:power-line-checks#clearances)) |
| Puzanje vodiča i rastezanje novog vodiča | Uračunajte ih kroz temperature u tablici napinjanja |
| Toplinska nazivna struja podzemnih kabela (strujno opterećenje iz načina polaganja) | Upišite nazivnu struju dobavljača na stavku kabela |
| Studije kratkog spoja, zaštite i uzemljenja | Koristite namjenski elektrotehnički program; CivilCraft daje duljine mreže i kabele |
| Rešetkasti stupovi projektirani član po član, i sidra zatega u tlu | Stupovi se provjeravaju prema nazivnom opterećenju; zatege prema nazivnom opterećenju |
| Datoteka studije `.DON` provjerena u programu koji je čita | Provjerite datoteku tamo; pošaljite nam uzorak da možemo testirati na stvarnoj |
| Dalekovodi u 3D prikazu i u IFC-u | Tlocrt, profil dalekovoda, listovi i GIS slojevi |
| Alati za dalekovode za asistente bez prozora | Rade s otvorenim prozorom CivilCrafta ([Neka AI asistent radi s vašom lokacijom](topic:assistants)) |

## Mase zgrada

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Biblioteka zoniranja ili pravila bilo kojeg grada | Upišite granice iz vlastite odluke ([Granice zoniranja](topic:zoning-limits)) |
| Dnevno svjetlo na zidovima (fasadno), vjetar | [Sunčani sati](topic:sun-hours) broje samo izravno sunce |
| Sjena od drveća, biljaka ili svega što nije nacrtano kao masa | Nacrtajte susjedne zgrade kao mase |
| Oblici krovova na masama | Mase s ravnim vrhom |
| Otvori, krovovi i vrste zidova kad se masa razvija u BimCraftu | BimCraft gradi jednostavne vanjske zidove na svakoj etaži i podu; ostalo dodajte tamo |

## GIS i koordinatni sustavi

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| File Geodatabase; KML stilovi, ikone, prekrivanja terena i mrežne veze | Prije toga pretvorite u GeoPackage, shapefile ili GeoJSON; KML oznake čitaju se bez stilova |
| Uređivanje GIS značajki ili njihovih atributa | Uredite ih u GIS programu i ponovno uvezite. Ploča Analiza stvara nove slojeve (zona utjecaja, preklapanje, spajanje, odabir) i dodaje polja površine i duljine, ali ne uređuje značajku na mjestu |
| Mrežna i rasterska analiza, zone utjecaja s ravnim ili kvadratnim krajevima i jednostrane zone utjecaja, dodavanje ili brisanje redaka te promjena tipa polja u tablici atributa, ručne boje klasa, legenda stila u ispisima | Odaberi za odabir značajki i stvaranje sloja iz njih; ravni krajevi se ne nude. Bojanje po atributu i tablica atributa su izrađeni: vidi [Stiliziranje sloja po atributu](topic:gis-symbology) i [Rad s tablicom atributa sloja](topic:gis-table) |
| Stilovi oznaka (veličina, položaj) i oznake koje se ne preklapaju | Oznake su jedne veličine i mogu se preklapati gdje su značajke guste |
| Vertikalni datumi i modeli geoida | Kote se koriste kako ih datoteka daje; sami provjerite vertikalni datum |
| Pomaci mreže osim NAD83 iz NAD27 predloženi po području (OSTN15, NTv2 za druge datume rade kad dodate datoteku), više mreža odjednom, vertikalne mreže | Sami dodajte datoteku mreže za svoj datum; jedna mreža po projektu |
| Slojevi karte u DXF-u ili u 3D izvozima | Slojevi karte idu u PDF ispis, a uz DWG kao slika |
| Poslužitelji karata koji traže prijavu, ključ ili token | Koristite javne usluge ili datoteku slike s georeferencom |
| Pisanje LAS ili LAZ datoteka iz površine, modela terena ili alata za mrežu visina i LiDAR | Izvezite površine kao GeoTIFF mrežu visina. Dodatak [Oblaci točaka](topic:point-clouds) piše očišćeni oblak kao LAS 1.4 ili LAZ |
| LiDAR intenzitet, boja i povrati; mreže visina s više pojaseva; datoteke mreža ili LiDAR veće od 200 MB | LiDAR se filtrira samo po klasi, mreže koriste svoj prvi pojas; najprije razrežite velike datoteke na pločice |

## Unos

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Odabir okvirom dodirom (treba {{key:Shift}}) | Dugo pritisnite svaku geodetsku točku da je dodate |
| Upisane koordinate ili udaljenosti dok crtate | Nacrtajte približno, zatim upišite točne koordinate PI u tablici PI osi trase |
| Upisivanje koordinata za kutove platoa i objekata | Povucite njihove ručke; zumirajte za preciznost i pratite E i N u statusnoj traci |
| Hvatanje za objekte (osim geodetskih točaka za prijelomnice) | Zumirajte i pratite statusnu traku |

## 3D prikaz

| Još nije izrađeno | Umjesto toga, danas |
|---|---|
| Crtanje ili uređivanje u 3D prikazu | Crtajte i uređujte u tlocrtu; 3D prikaz prati svaku promjenu |
| Odabir značajnih linija koridora ili GIS značajki klikom u 3D-u | Kliknite ih u tlocrtu |
| Izvoz uvećanog prikaza ili u stopama | Izvozi su u stvarnom mjerilu u metrima; vidi [Izvoz lokacije u 3D-u](topic:export-3d) |
| Oznake u GLB ili OBJ izvozima, veličine i stilovi oznaka u 3D-u | Oznake se prikazuju samo u 3D prikazu, jedne veličine; vidi [Pogledajte lokaciju u 3D-u](topic:site-3d) |
| Teksture iz fotografija, snimanje vožnje kao video, sjene od onoga izvan lokacije, sunčani sati prikazani u 3D prikazu | Slojevi karte prekriveni na površinama; vožnja i položaj sunca u jednom trenutku; [sunčani sati](topic:sun-hours) za dan ili sezonu na tlocrtu |
