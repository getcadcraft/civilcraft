---
title: Što je novo u 0.7
summary: CivilCraft 0.7 dodaje radni prostor Dalekovodi (nadzemni vodovi i podzemni kabeli s vlastitim knjižnicama, provjes i naprezanje, provjere sigurnosnih visina i čvrstoće, tablice razvlačenja, količine, listovi i GIS), radni prostor Krajobraz (popis biljaka, planovi sadnje i popisi, planiranje terena za krajobraz, popločenje, zidovi i stube, pomagalo za proračun navodnjavanja, listovi krajobraza i objekti slobodnog oblika), mase zgrada s urbanističkim ograničenjima koja upisujete i satima sunca, klotoidne prijelaznice, koridore izgrađene iz dijelova sa svake strane, USD izvoz i više alata za AI pomoćnike.
keywords: što je novo, bilješke o izdanju, popis promjena, promjene, 0.7, verzija, nove značajke, krajobraz, radni prostor krajobraz, popis biljaka, biljke, sadnja, popis sadnje, gredica, živica, planiranje terena, plato, nasip, jarak, visinska kota, analiza nagiba, zadržavanje vode, popločenje, staza, zid, rubnjak, rampa, stube, navodnjavanje, prskalica, kapanje, listovi krajobraza, objekt slobodnog oblika, masa zgrade, mase, bruto razvijena površina, urbanistički uvjeti, odmak, omotnica, ravnina izloženosti nebu, koeficijent iskoristivosti, koeficijent izgrađenosti, sati sunca, sjena, ifc, razradi u bimcraftu, prijelaznica, klotoida, sklop, rigol, nogostup, usd, pomoćnici, jedinice, portugalski
from: 3c9d79db
---

Ovo se promijenilo u CivilCraftu 0.7 u odnosu na 0.6. Najveći novi dijelovi su radni prostori Dalekovodi i Krajobraz te mase zgrada.

## Novo

### Radni prostor Krajobraz

- **Radni prostor Krajobraz na istoj lokaciji.** {{ui:Teren}} › {{ui:Više}} › {{ui:Radni prostor Krajobraz}} dodaje alate za sadnju, planiranje terena, popločenje i navodnjavanje lokaciji koju već imate: iste geodetske točke, terene i projektnu datoteku. Odaberite **Infrastruktura** pod **Radni prostor** da se vratite. Vidi [Radni prostor Krajobraz](topic:landscape).
- **Popis biljaka.** Oko 420 uobičajenih stabala, grmova, živica, trava, trajnica, pokrivača tla i penjačica umjerenog i mediteranskog pojasa, s njihovim veličinama pri sadnji i u zrelosti, zonom otpornosti, svjetlom, vodom i razmakom. Pretražujte po bilo kojem nazivu na engleskom, španjolskom ili portugalskom. Uvezite vlastiti popis kao CSV; sprema se s projektom. Ugrađene veličine su tipične i zaokružene: provjerite ih u lokalnom rasadniku. Vidi [Popis biljaka](topic:plant-list).
- **Planovi sadnje.** {{ui:Biljka}} postavlja pojedinačne biljke koje leže na terenu i prate kasnije planiranje, {{ui:Gredica}} ispunjava obris biljkama u njihovu razmaku sa smjesom po postocima, a {{ui:Živica}} postavlja jedan ili dva reda duž linije. Biljke su označene na tlocrtu. Vidi [Planovi sadnje i popisi](topic:planting).
- **Popis biljaka za sadnju.** Više › {{ui:Popis biljaka…}} broji biljke po vrsti i veličini pri sadnji. Spremite ga kao CSV ili XLSX ili ga pošaljite u TakeoffCraft radi cijene. Vidi [Popis biljaka za sadnju](topic:planting#the-plant-schedule).
- **Planiranje terena za krajobraz.** {{ui:Planiranje}} ima platoe (vodoravne ili s padom), nasipe, jarkove te površine planiranja s visinskim kotama i izohipsama koje povlačite. Iskop i nasip prikazuju se dok radite. **Analiza nagiba** boji teren prema vašim dvama granicama, a **Strelice toka i zadržavanje vode** prikazuje kamo voda teče i gdje bi se zadržala. Sve ulazi u isti projektirani teren kao platoi i koridori. Vidi [Planiranje terena za krajobraz](topic:landscape-grading).
- **Popločenje, staze, zidovi, rubnjaci, rampe i stube.** {{ui:Popločenje i uređeni elementi}} crta popločenje s poprečnim nagibom ili padom prema slivniku, uzorkom i slojevima; staze koje prate teren; potporne i slobodnostojeće zidove sa stepenastim temeljima; rubnjake; te rampe i stube provjerene prema granicama koje postavite. Potporni zid viši od 1,2 m (4 ft) označava se za inženjera. Vidi [Popločenje, zidovi i stube](topic:hardscape).
- **Pomagalo za proračun navodnjavanja.** {{ui:Navodnjavanje}} postavlja glave, ogranke, glavni vod, ventile, linije za kapanje i priključnu točku. {{ui:Provjeri sustav…}} pronalazi zone iz cijevi i izračunava protok svake zone, potreban tlak na njezinu ventilu i na opskrbi (Hazen–Williams), količinu oborina, vrijeme rada, pokrivenost i sastavnicu. To je pomagalo za proračun, a ne potvrda projekta: projektant navodnjavanja provjerava svaki rezultat. Glave su generičkih vrsta ili vaše vlastite iz datoteke. Vidi [Projektiranje navodnjavanja](topic:irrigation).
- **Listovi krajobraza.** Više › {{ui:Listovi krajobraza…}} izrađuje planove sadnje, planiranja terena i navodnjavanja s njihovim legendama te list detalja presjeka zidova, slojeva popločenja i stuba, kao jedan PDF. Vidi [Listovi krajobraza](topic:landscape-sheets).
- **Objekti slobodnog oblika.** Više › {{ui:Objekt slobodnog oblika…}} postavlja STL, OBJ ili mrežu stavke knjižnice izrađenu u drugoj aplikaciji, poput posude za biljke ili skulpture. Leži na terenu ili ga presijeca, a njegov volumen, površina i otisak se broje. Vidi [Objekti slobodnog oblika](topic:freeform-objects).
- **IFC krajobraza.** Više › {{ui:Izvezi IFC krajobraza}} sprema biljke (kao vegetaciju s njihovim svojstvima), popločenje i objekte slobodnog oblika kao IFC 4.3 za BIM model. Vidi [IFC](topic:planting#ifc).
- **Od početka do kraja.** [Projektiranje vrta, od početka do kraja](topic:landscape-walkthrough) provodi vas kroz cijeli radni prostor na primjeru lokacije.

### Radni prostor Dalekovodi

- **Nadzemni vodovi i podzemni kabeli na vašoj lokaciji.** {{ui:Teren}} › {{ui:Više}} › {{ui:Radni prostor Dalekovodi}}: nacrtajte vod prema njegovim stupovima, kabele u rovovima, opremu i prepreke, na istom terenu i u istoj projektnoj datoteci. Vidi [Radni prostor Dalekovodi](topic:power-lines).
- **Vlastite knjižnice.** Vodiči, kabeli, stupovi, oprema (traverze, izolatori, spojni pribor, zatege, transformatori, ormari, spojnice) i vrste rovova, u kategorijama koje sami imenujete, dijeljeni kao datoteka ili proračunska tablica. Nijedan državni ni proizvođački katalog nije ugrađen; primjeri kažu da su primjeri. Vidi [Vaša knjižnica dalekovoda](topic:power-line-library).
- **Provjes i naprezanje pod vašim slučajevima opterećenja.** Temperatura, vjetar, led i led s jedne strane; granice naprezanja kao udio prekidne čvrstoće; točna lančanica na svakom polju, uključujući nagibe; tablice razvlačenja. Vidi [Provjes i naprezanje](topic:sag-and-tension).
- **Provjere, uvijek ažurne.** Sigurnosna visina nad terenom i preprekama, razmak faza, njihanje izolatora, uzgon, opterećenja stupova s dimenzioniranjem iz vaše knjižnice, zatege, spojni pribor, temelji, nedostajući podaci, nepovezani kabeli, preopterećenja i pad napona, označeni na tlocrtu i na profilu voda. Pomagalo za projektiranje: provjerava ga inženjer. Vidi [Provjere dalekovoda](topic:power-line-checks).
- **Tablice, listovi i GIS.** Tablice razvlačenja i stupova, količine (CSV, Excel, TakeoffCraft), listovi tlocrta i profila s izvješćem studije u jednom PDF-u, GIS slojevi s podacima svake imovine. Vidi [Tablice, količine, listovi i GIS dalekovoda](topic:power-line-outputs).
- **Nakon prvih pokušaja.** Profil voda prati vod koji odaberete, ima popis **Vod**, očitava teren, vodič i sigurnosnu visinu ispod pokazivača i mjeri između dvije točke. Biljke i zidovi krajobraza broje se kao prepreke ispod vodova; trase kabela i cijevi prikazuju se u profilu voda i križaju se s pravilom sigurnosnog razmaka koje odaberete; **Pravila…** pored svake sigurnosne visine otvara vaša vlastita pravila; a skupovi pravila s knjižnicom spremaju se kao paketi za dijeljenje po državama. Vidi [Provjere dalekovoda](topic:power-line-checks) i [Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Vlastiti formati datoteka.** Dalekovodi se spremaju u CivilCraftovu projektnu datoteku, knjižnice u `.cclines.json` ili CSV, skupovi pravila i paketi u vlastite JSON datoteke: otvoreni formati koje svatko može pročitati ili pretvoriti. Datoteka studije `.DON` dodatni je uvoz i izvoz pored njih.
- **Datoteke studije (.DON), neisprobano.** Spremite vod kao `.DON` datoteku studije za drugi program za vodove ili pročitajte stupove iz jedne; izrađeno prema nazivima polja formata, još nije isprobano s tim programom. Vidi [Datoteke studije](topic:power-line-study-file).

### Mjerenje

- **Alat Mjeri.** {{ui:Teren}} › {{ui:Više}} › {{ui:Mjeri}} (ili {{key:M}}) mjeri na tlocrtu: duljinu i smjerni kut svake stranice, tekući zbroj, duljinu uz teren i nagib te površinu i opseg kad zatvorite oblik. Ništa se ne crta u projekt. Vidi [Mjerenje](topic:measure).

### Mase zgrada

- **Crtanje masa zgrada.** U Svojstvima, pod **Mase zgrada**, {{ui:Nacrtaj masu}} (također {{ui:Teren}} › {{ui:Više}} › {{ui:Mase}}). Masi zadajte etaže i visinu etaže i očitajte njezinu bruto razvijenu površinu. Odaberite kako stoji na kosom terenu (stepenasto, podij ili ukopano) i pogledajte nasip i iskop. Mase se prikazuju na tlocrtu, u PDF-u te u DWG-u i DXF-u na vlastitim slojevima. Vidi [Crtanje masa zgrada na lokaciji](topic:building-masses).
- **Potisni i povuci u 3D-u.** U 3D prikazu povucite krov odabrane mase ili pritisnite {{key:PageUp}} i {{key:PageDown}} da je mijenjate po jednu etažu, u jednom koraku poništavanja. **Sunce** baca sjene masa. Vidi [U 3D prikazu](topic:building-masses#in-the-3d-view).
- **Urbanistička ograničenja koja upisujete.** Odmaci redak po redak od regulacijske linije ulice, ograničenje visine, ravnina izloženosti nebu, koeficijent iskoristivosti i koeficijent izgrađenosti. Građevinska omotnica crta se na tlocrtu, a svaka masa dobiva kvačicu ili križić za svako ograničenje. CivilCraft u sebi nema nikakav urbanistički propis: svaki broj je onaj koji upisujete iz vlastitog plana. Vidi [Provjera masa prema urbanističkim ograničenjima koja upisujete](topic:zoning-limits).
- **Sati sunca.** Odaberite dan ili godišnje doba te vremensku zonu po nazivu ili pomaku i očitajte sate izravnog sunca na svakom zidu svake mase, etažu po etažu, i na tlu oko njih, ucrtane na tlocrt. Spremite zidove i tlo kao CSV. Projekt treba koordinatni sustav. Vidi [Izračun sati sunca na lokaciji](topic:sun-hours).
- **Mase kao IFC i dalje u BimCraft.** {{ui:Mase kao IFC}} sprema mase kao IFC4, postavljene na kartu kada projekt ima koordinatni sustav. {{ui:Razradi u programu BimCraft}} otvara BimCraft u novoj kartici s masama, gdje **Razradi ovu masu** gradi zidove na svakoj razini i ploču iz otiska. Ništa se ne učitava. Vidi [Pošaljite dalje](topic:building-masses#send-it-on).

### Osi trase

- **Klotoidne prijelaznice.** Upišite duljinu u **Ulazna prijelaznica** i **Izlazna prijelaznica** u tablici PI za luk: pravac, prijelaznica, luk, prijelaznica, pravac, jednakih ili različitih duljina. Tlocrt označava TS, SC, CS i ST, popis lukova daje θs te tangentne i vanjske udaljenosti, a stacionaže i odmaci teku kroz prijelaznice. Vidi [Prijelaznice](topic:alignment#spirals).
- **Prijelaznice u LandXML-u.** LandXML zapisuje i čita klotoidne prijelaznice. Osi s prijelaznicama, koje je CivilCraft prije preskakao pri uvozu, sada se otvaraju. Vidi [Razmjena LandXML-a](topic:landxml).

### Koridori

- **Gradite svaku stranu iz dijelova.** Uključite **Gradi svaku stranu iz dijelova** da svaka strana dobije vlastiti popis od osi prema van: prometne trake, bankinu, rigol, rubnjak, zeleni pojas, nogostup i pokos s vlastitim iskopom i nasipom. Krenite od {{ui:Cesta izvan naselja}} ili {{ui:Gradska ulica}} i kopirajte jednu stranu na drugu. Poprečni profili označavaju dno rigola, rubnjak i nogostup, a planirani teren ima rubnjak. Vidi [Gradnja svake strane iz dijelova](topic:corridor#build-each-side-from-parts).
- **Nadvišenje preko prijelaznica.** Na luku s prijelaznicama nadvišenje se postupno uvodi preko prijelaznice: vodoravan kolnik u TS, puno nadvišenje u SC. Vidi [Nadvišenje](topic:corridor#superelevation).

### 3D datoteke

- **USD izvoz.** U 3D prikazu {{ui:USD}} zapisuje lokaciju kao `.usda`, `.usdc` ili `.usdz` u pravom mjerilu i u koordinatama projekta: terene, cijevi i objekte kao mreže, linije, svaku os trase i geodetske točke s njihovim brojevima. Vidi [Izvoz 3D lokacije kao USD](topic:usd).

### AI pomoćnici

- **Više za pomoćnike.** S uključenim pomoćnicima u {{ui:Postavke}} › {{ui:CivilCraft}}, pomoćnik sada može i čitati katastarske čestice, iskop i nasip te profile, dodavati geodetske točke, spremati projekt, izvoziti LandXML, DWG i USD te raditi u mapama koje odaberete u CadCraft Studiu. Radni prostor Krajobraz dodaje alate za pronalaženje biljaka, postavljanje biljaka, gredica i živica, planiranje terena i provjeru navodnjavanja. Datotečni poslužitelj i naredbeni redak `cadcraft` otvaraju spremljene projekte bez prozora. Vidi [Neka AI pomoćnik radi s vašom lokacijom](topic:assistants).

## U svakoj aplikaciji

- **Jedinice.** {{ui:Postavke}} › {{ui:Općenito}} › {{ui:Jedinice}} ima po jedan popis za duljinu, površinu, obujam, kut i nagib, s točnim veličinama koje daju definicije jedinica (američka geodetska stopa je zasebna jedinica). Isključite jedinice koje nikad ne koristite i one napuštaju popise jedinica; označite jednu zvjezdicom i novi rad počinje u njoj. Datoteka uvijek zadržava vlastitu jedinicu. U CivilCraftu popis **Jedinice** projekta prati prekidače; zvjezdica metričke duljine pokreće nove projekte u metrima (inače u stopama, a to su američke geodetske stope), zvjezdica površine ili obujma postavlja jedinicu u kojoj se izvješćuju površine i obujmi, a okvir za duljinu prihvaća oznaku bilo koje jedinice, primjerice `3 ch` ili `450 mm`. Vidi [Jedinice, upisane vrijednosti i popisi jedinica](common:unit-lists).
- **Gušći raspored i ploče koje se sklanjaju.** {{ui:Postavke}} › {{ui:Općenito}} › {{ui:Gustoća rasporeda}} › {{ui:Zbijeno}} smješta više na zaslon (zasloni osjetljivi na dodir i mobiteli zadržavaju velike gumbe). Svaka bočna ploča ima usku naslovnu traku: povucite je da usidrite ili odvojite ploču, ispustite je na traku druge ploče da dijele jedan okvir kao kartice, prikvačite je da se uvlači do ruba ili je sakrijte i vratite s ruba. Vidi [Raspored ploča](common:arrange-panels#make-the-layout-denser).
- **Dijaloški okviri se pomiču.** Povucite dijaloški okvir za naslovnu traku da ga maknete s puta crtežu; vraća se tamo gdje ste ga ostavili. Dvaput kliknite naslovnu traku da ga ponovno centrirate. Vidi [Pomicanje dijaloškog okvira](common:arrange-panels#move-a-dialog).
- **Recepti za AI pomoćnike.** Deset razrađenih zahtjeva za vašeg pomoćnika (urediti crtež, plotati komplet, provjeriti crteže, postavljati pitanja modelu, zbrojiti predmjer, isprobati varijantu dijela…), svaki s alatima koje poziva i dopuštenjima koja treba, a svaki ponovno izvodimo našim testovima. Aplikacije ne sadrže AI. Vidi [Recepti za AI pomoćnike](common:assistants-recipes).
- **Jezici.** **Português (Portugal)** je novi u {{ui:Postavke}} › {{ui:Općenito}} › {{ui:Jezik}}. On, **Português (Brasil)**, **Español (México)** i **Bahasa Indonesia** sada imaju svaku riječ aplikacija, kao radne verzije koje još nije pregledao izvorni govornik. Teme pomoći su na engleskom, uz nekoliko na španjolskom.
- **CadCraft Studio** kaže zašto provjera ažuriranja nije uspjela (još nema datoteke za vaš sustav, nema mreže, loš potpis) umjesto samo „Gotovo“ te prestaje vraćati karticu Što je novo koju ste zatvorili dok ne izađe novije izdanje.

## Još nije u ovoj verziji

- **0.7 nije potpisan kodom.** Potpisivanje i paket Microsoft Storea premješteni su u 0.8 jer provjera certifikata još nije stigla. Provjerite SHA-256 pored svake datoteke na getcadcraft.com/download. Na Windowsima, ako SmartScreen zaustavi instalacijski program, odaberite {{ui:Više informacija}}, a zatim {{ui:Svejedno pokreni}}. Na Macu, prvi put, desnom tipkom kliknite CadCraft Studio i odaberite {{ui:Otvori}}. CadCraft Studio još nije u trgovini aplikacija i još nema verzije za iPad ni iPhone.
- Popisi kuta i nagiba u {{ui:Jedinice}} su spremljeni, ali ih još nijedan okvir ne čita.
- Glave za navodnjavanje proizvođača: samo generičke glave i vaše vlastite iz datoteke. Podaci proizvođača ulaze samo uz njihovo dopuštenje, a nijedno još nije dano.
- BimCraft i ModelCraft nose popis biljaka, ali njihovo Postavljanje iz knjižnice još ne nudi biljke. Biljke dolaze u BimCraft preko IFC-a krajobraza.
- Alati krajobraza za pomoćnike rade s otvorenim CivilCraft prozorom; datotečni poslužitelj i naredbeni redak ih još nemaju.
- Mase zgrada: bez dnevnog svjetla ili vjetra na pročelju, bez sjene od drveća ili bilo čega što nije nacrtano kao masa, bez oblika krovova, a sati sunca prikazuju se na tlocrtu, ne u 3D prikazu. Razradi u programu BimCraft gradi obične zidove i ploču, bez otvora i krova.
- Dalekovodi: nijedna državna norma nije ugrađena (sami postavljate slučajeve opterećenja, granice i sigurnosne visine); bez puzanja vodiča, toplinske opteretivosti ukopanih kabela, kratkog spoja, zaštite ni uzemljenja; bez vodova u 3D prikazu ili IFC-u. Datoteka studije `.DON` nije isprobana s programom koji je čita.
- Prijelaznice koje nisu klotoida, prijelaznica između dva luka i prijelaznice u značajnim linijama. Prijelaznice su provjerene prema formulama i LandXML shemi, još ne prema LandXML datoteci s prijelaznicama iz drugog programa.
- Sklopovi koridora koji se mijenjaju duž ceste, regije i ciljevi za pokos.
- Vodovodne i tlačne mreže (sljedeći građevinski rad), protoci koji se mijenjaju kroz vrijeme i veze između vodovodne i oborinske mreže.
- Lukovi u nacrtanim prijelomnicama. Standardne tablice mjerodavnih vozila: pet vozila koja se isporučuju su označeni rezervirani nadomjesci. Značajne linije dijeljene među projektima čekaju timske projekte.

Sve ostalo je u [Još nije izrađeno](topic:not-built-yet).
