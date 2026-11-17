---
title: Novosti u verziji 0.7 (ranije)
summary: CivilCraft 0.7 donosi radni prostor Dalekovodi (nadzemne vodove i podzemne kabele s vlastitim knjižnicama, progib i napetost, provjere razmaka i čvrstoće, tablice zatezanja, količine, listove i GIS), radni prostor Krajobraz (popis biljaka, planove sadnje i popise, uređenje terena, popločenje, zidove i stube, alat za izračun navodnjavanja, listove krajobraza i slobodne objekte), mase zgrada s ograničenjima zoniranja koja upisujete i satima sunca, klotoidne prijelaznice, koridore izgrađene od dijelova sa svake strane, izvoz u USD te više alata za AI pomoćnike.
keywords: novosti 0.7, raniје izdanje, bilješke o izdanju, dnevnik promjena, promjene, 0.7, verzija, nove značajke, krajobraz, radni prostor krajobraza, popis biljaka, biljke, sadnja, popis sadnje, gredica, živica, uređenje terena, platforma, nasip, jarak, visinska kota, analiza nagiba, zadržavanje vode, popločenje, staza, zid, rubnjak, rampa, stube, navodnjavanje, prskalica, kap po kap, listovi krajobraza, slobodni objekt, masa zgrade, bruto površina poda, zoniranje, odmak, omotnica, ravnina neba, koeficijent iskorištenosti, pokrivenost, sati sunca, sjena, ifc, razradi u BimCraft, prijelaznica, klotoida, sklop, slivnik, pločnik, usd, pomoćnici, jedinice, portugalski
from: 797d2f2f
---

Ovo je što se promijenilo u CivilCraftu 0.7 u odnosu na 0.6. Najveći novi dijelovi su radni prostori Dalekovodi i Krajobraz te mase zgrada.

## Novo

### Radni prostor Krajobraz

- **Radni prostor Krajobraz na istoj lokaciji.** {{ui:Teren}} › {{ui:Više}} › {{ui:Radni prostor Krajobraz}} dodaje alate za sadnju, uređenje terena, popločenje i navodnjavanje na lokaciju koju već imate: iste točke izmjere, površine i datoteku projekta. Za povratak odaberite **Civil** pod **Radni prostor**. Vidi [Radni prostor Krajobraz](topic:landscape).
- **Popis biljaka.** Oko 420 uobičajenih umjerenih i mediteranskih stabala, grmova, živica, trava, trajnica, pokrivača tla i penjačica, s veličinama pri sadnji i pri punoj zrelosti, zonom otpornosti, svjetlom, vodom i razmakom. Pretražujte po bilo kojem nazivu na engleskom, španjolskom ili portugalskom. Vlastiti popis uvezite kao CSV; sprema se uz projekt. Ugrađene veličine su tipične i zaokružene: provjerite ih s lokalnim rasadnikom. Vidi [Popis biljaka](topic:plant-list).
- **Planovi sadnje.** {{ui:Biljka}} postavlja pojedinačne biljke koje stoje na tlu i prate kasnije uređenje terena, {{ui:Gredica}} ispunjava obris prema razmaku biljaka s mješavinom po postotku, a {{ui:Živica}} postavlja jedan ili dva reda uz liniju. Biljke su označene na planu. Vidi [Planovi sadnje i popisi](topic:planting).
- **Popis biljaka za plan.** Više › {{ui:Popis biljaka…}} broji biljke po vrsti i veličini sadnje. Spremite ga kao CSV ili XLSX ili ga pošaljite u TakeoffCraft radi određivanja cijene. Vidi [Popis biljaka](topic:planting#the-plant-schedule).
- **Uređenje terena za krajobraz.** {{ui:Planiranje}} ima platforme (ravne ili padajuće), nasipe, jarke i područja uređenja s visinskim kotama i izohipsama koje povlačite. Iskop i nasip prikazuju se dok radite. **Analiza nagiba** boji površinu prema vašim dvjema granicama, a **Strelice toka i zadržavanje vode** pokazuju kuda voda teče i gdje bi se zadržala. Sve ulazi u istu predloženu površinu kao platforme i koridori. Vidi [Uređenje terena za krajobraz](topic:landscape-grading).
- **Popločenje, staze, zidovi, rubnjaci, rampe i stube.** {{ui:Popločenje i građevinski uređeni elementi}} crta popločenje s poprečnim padom ili padom prema odvodu, uzorkom i njegovim slojevima; staze koje prate teren; potporne i slobodno stojeće zidove sa stepenastim temeljima; rubnjake; te rampe i stube provjerene prema granicama koje postavite. Potporni zid viši od 1,2 m (4 ft) označava se za inženjera. Vidi [Popločenje, zidovi i stube](topic:hardscape).
- **Alat za izračun navodnjavanja.** {{ui:Navodnjavanje}} postavlja prskalice, bočne cijevi, glavni vod, ventile, kapaljke i točku priključka. {{ui:Provjeri sustav…}} pronalazi zone iz cijevi i računa protok svake zone, tlak potreban na njezinom ventilu i na dovodu (Hazen–Williams), oborine, vremena rada, pokrivenost i sastavnicu. To je pomoćno sredstvo za izračun, a ne potvrda projekta: projektant navodnjavanja provjerava svaki rezultat. Prskalice su opći tipovi ili vlastiti iz datoteke. Vidi [Projektiranje navodnjavanja](topic:irrigation).
- **Listovi krajobraza.** Više › {{ui:Listovi krajobraza…}} izrađuje planove sadnje, uređenja terena i navodnjavanja s legendama te list s detaljima presjeka zidova, slojeva popločenja i stuba, kao jedan PDF. Vidi [Listovi krajobraza](topic:landscape-sheets).
- **Slobodni objekti.** Više › {{ui:Objekt slobodnog oblika…}} postavlja mrežu STL, OBJ ili stavku iz knjižnice napravljenu u drugoj aplikaciji, npr. sadilicu ili skulpturu. Stoji na tlu ili se u njega ukopava, a njegov volumen, površina i tlocrtna površina se izračunavaju. Vidi [Slobodni objekti](topic:freeform-objects).
- **Krajobraz u IFC-u.** Više › {{ui:Izvezi IFC krajobraza}} sprema biljke (kao vegetaciju sa svojim svojstvima), popločenje i slobodne objekte kao IFC 4.3 za BIM model. Vidi [IFC](topic:planting#ifc).
- **Od početka do kraja.** [Projektirajte vrt, od početka do kraja](topic:landscape-walkthrough) prolazi kroz cijeli radni prostor na primjernoj lokaciji.

### Radni prostor Dalekovodi

- **Nadzemni vodovi i podzemni kabeli na vašoj lokaciji.** {{ui:Teren}} › {{ui:Više}} › {{ui:Radni prostor Dalekovodi}}: nacrtajte vod preko njegovih stupova, kabele u rovovima, opremu i prepreke, na istom terenu i u istoj datoteci projekta. Vidi [Radni prostor Dalekovodi](topic:power-lines).
- **Vlastite knjižnice.** Vodiči, kabeli, stupovi, oprema (poprečni nosači, izolatori, pribor, zatege, transformatori, ormari, spojnice) i tipovi rovova, u kategorijama koje sami imenujete, dijele se kao datoteka ili tablica. Nijedan katalog neke države ili proizvođača nije ugrađen; primjeri to i kažu. Vidi [Vaša knjižnica dalekovoda](topic:power-line-library).
- **Progib i napetost prema vašim slučajevima opterećenja.** Temperatura, vjetar, led i led na jednoj strani; granice napetosti kao udio prekidne čvrstoće; točna lančanica na svakom rasponu, uključujući nagibe; tablice zatezanja. Vidi [Progib i napetost](topic:sag-and-tension).
- **Provjere, uvijek ažurne.** Razmak od tla i prepreka, razmak faza, zanos izolatora, uzgon, opterećenja stupova s dimenzioniranjem iz vaše knjižnice, zatege, pribor, temelji, nedostajući podaci, nespojeni kabeli, preopterećenja i pad napona, označeni na planu i na profilu voda. Pomoćno sredstvo za projektiranje: inženjer ih provjerava. Vidi [Provjere dalekovoda](topic:power-line-checks).
- **Tablice, listovi i GIS.** Tablice zatezanja i stupova, količine (CSV, Excel, TakeoffCraft), listovi plana i profila sa studijskim izvještajem u jednom PDF-u, GIS slojevi sa svim podacima o svakom elementu. Vidi [Tablice, količine, listovi i GIS dalekovoda](topic:power-line-outputs).
- **Nakon prvih pokušaja.** Profil voda prati vod koji odaberete, ima popis **Vod**, čita teren, vodič i razmak ispod pokazivača te mjeri između dviju točaka. Biljke i zidovi krajobraza broje se kao prepreke ispod vodova; trase kabela i cijevi prikazuju se u profilu voda i presijecaju se uz pravilo razmaka koje odaberete; **Pravila…** pokraj svakog razmaka otvara vaša pravila, a skupovi pravila s knjižnicom spremaju se kao paketi za dijeljenje po državi. Vidi [Provjere dalekovoda](topic:power-line-checks) i [Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Vlastiti formati datoteka.** Dalekovodi se spremaju u datoteku projekta CivilCraft, knjižnice u `.cclines.json` ili CSV, a skupovi pravila i paketi u vlastitim JSON datotekama: otvoreni formati koje svatko može čitati ili pretvoriti. Datoteka za studiju `.DON` dodatni je uvoz i izvoz uz njih.
- **Datoteke za studiju (.DON), neispitano.** Spremite vod kao datoteku za studiju `.DON` za drugi program za vodove ili čitajte stupove iz nje; izrađeno prema nazivima polja formata, još nije ispitano s tim programom. Vidi [Datoteke za studiju](topic:power-line-study-file).

### Mjerenje

- **Alat Mjeri.** {{ui:Teren}} › {{ui:Više}} › {{ui:Mjeri}} (ili {{key:M}}) mjeri na planu: duljinu i smjer svake strane, zbroj, duljinu uz tlo i nagib, a površinu i opseg kad zatvorite oblik. Ništa se ne crta u projekt. Vidi [Mjeri](topic:measure).

### Mase zgrada

- **Crtanje masa zgrada.** U Svojstvima, pod **Mase zgrada**, {{ui:Nacrtaj masu}} (također {{ui:Teren}} › {{ui:Više}} › {{ui:Mase}}). Dajte masi etaže i visinu etaže te pročitajte njezinu bruto površinu poda. Odaberite kako stoji na kosom terenu (stepenasto, podij ili iskop) i pogledajte nasip i iskop. Mase se prikazuju na planu, u PDF-u te u DWG i DXF na vlastitim slojevima. Vidi [Crtanje masa zgrada na lokaciji](topic:building-masses).
- **Guranje i povlačenje u 3D-u.** U 3D prikazu povucite krov odabrane mase ili pritisnite {{key:PageUp}} i {{key:PageDown}} da je mijenjate etažu po etažu, u jednom koraku poništavanja. {{ui:Sunce}} baca sjene masa. Vidi [U 3D prikazu](topic:building-masses#in-the-3d-view).
- **Ograničenja zoniranja koja upisujete.** Odmaci liniju po liniju od linije ulice, ograničenje visine, ravnina izloženosti nebu, koeficijent iskorištenosti i pokrivenost. Građevinska omotnica crta se na planu, a svaka masa dobiva kvačicu ili križić za svako ograničenje. CivilCraft nema nikakav pravilnik o zoniranju: svaki broj upisujete sami iz vlastitog gradskog pravilnika. Vidi [Provjera masa prema ograničenjima zoniranja koja upisujete](topic:zoning-limits).
- **Sati sunca.** Odaberite dan ili godišnje doba te vremensku zonu po nazivu ili pomaku, pa pročitajte sate izravnog sunca na svakom zidu svake mase, etažu po etažu, i na terenu oko njih, ucrtano na planu. Spremite zidove i teren kao CSV. Projekt treba koordinatni sustav. Vidi [Izračun sati sunca na lokaciji](topic:sun-hours).
- **Mase kao IFC, i dalje u BimCraft.** {{ui:Mase kao IFC}} sprema mase kao IFC4, smještene na karti kad projekt ima koordinatni sustav. {{ui:Razradi u programu BimCraft}} otvara BimCraft u novoj kartici s masama, gdje **Razradi ovu masu** gradi zidove na svim razinama i pod iz tlocrta. Ništa se ne učitava. Vidi [Pošaljite dalje](topic:building-masses#send-it-on).

### Trase

- **Klotoidne prijelaznice.** U tablici PI za krivulju upišite duljinu u **Prijelaznica ulaz** i **Prijelaznica izlaz**: tangenta, prijelaznica, krivulja, prijelaznica, tangenta, s jednakim ili različitim duljinama. Plan označuje TS, SC, CS i ST, popis krivulja daje θs te tangentnu i vanjsku udaljenost, a stacionaže i odmaci teku kroz prijelaznice. Vidi [Prijelaznice](topic:alignment#spirals).
- **Prijelaznice u LandXML-u.** LandXML zapisuje i čita klotoidne prijelaznice. Trase s prijelaznicama, koje je CivilCraft nekad preskakao pri uvozu, sada se otvaraju. Vidi [Razmjena LandXML](topic:landxml).

### Koridori

- **Gradnja svake strane od dijelova.** Uključite **Gradi svaku stranu od dijelova** da svaka strana dobije vlastiti popis od osi prema van: trake, bankinu, kanal uz rub, rubnjak, zelenu traku, pločnik i bočni pokos s vlastitim iskopom i nasipom. Počnite od {{ui:Cesta izvan naselja}} ili {{ui:Gradska ulica}} i kopirajte jednu stranu na drugu. Poprečni presjeci označavaju liniju toka, rubnjak i pješačku stazu, a uređena površina ima rubnjak. Vidi [Gradnja svake strane od dijelova](topic:corridor#build-each-side-from-parts).
- **Nadvišenje preko prijelaznica.** Na krivulji s prijelaznicama, prijelaz nadvišenja ide preko prijelaznice: ravan vrh na TS, puno nadvišenje na SC. Vidi [Nadvišenje](topic:corridor#superelevation).

### 3D datoteke

- **Izvoz u USD.** U 3D prikazu {{ui:USD}} zapisuje lokaciju kao `.usda`, `.usdc` ili `.usdz` u pravoj mjeri i na koordinatama projekta: površine, cijevi i građevine kao mreže, linije, svaku trasu te točke izmjere s njihovim brojevima. Vidi [Izvoz 3D lokacije u USD](topic:usd).

### Pomoćnici za AI

- **Više za pomoćnike.** Uz pomoćnike uključene u {{ui:Postavke}} › {{ui:CivilCraft}}, pomoćnik sada može čitati katastarske čestice, iskop i nasip te profile, dodavati točke izmjere, spremati projekt, izvoziti LandXML, DWG i USD te raditi u mapama koje odaberete u CadCraft Studiju. Radni prostor Krajobraz dodaje alate za traženje biljaka, postavljanje biljaka, gredica i živica, uređenje terena i provjeru navodnjavanja. Poslužitelj datoteka i naredbeni redak `cadcraft` otvaraju spremljene projekte bez prozora. Vidi [Neka pomoćnik za AI radi s vašom lokacijom](topic:assistants).

## U svim aplikacijama

- **Jedinice.** {{ui:Postavke}} › {{ui:Općenito}} › {{ui:Jedinice}} ima po jedan popis za duljinu, površinu, volumen, kut i nagib, s točnim veličinama koje daju definicije jedinica (američka anketna stopa je zasebna jedinica). Isključite jedinice koje ne koristite i one nestaju s popisa jedinica; jednu označite zvjezdicom i novi rad počinje u njoj. Datoteka uvijek čuva svoju jedinicu. U CivilCraftu popis **Jedinice** projekta slijedi prekidače; zvjezdica za metričku duljinu pokreće nove projekte u metrima (inače u stopama, odnosno američkim anketnim stopama), zvjezdica za površinu ili volumen postavlja jedinice u kojima se prijavljuju površine i volumeni, a polje za duljinu prihvaća oznaku bilo koje jedinice, kao `3 ch` ili `450 mm`. Vidi [Jedinice, upisane vrijednosti i popisi jedinica](common:unit-lists).
- **Gušći raspored i paneli koji se sklanjaju.** {{ui:Postavke}} › {{ui:Općenito}} › {{ui:Gustoća rasporeda}} › {{ui:Zbijeno}} stane više na zaslon (zasloni osjetljivi na dodir i telefoni zadržavaju velike gumbe). Svaki bočni panel ima tanku naslovnu traku: povucite je da usidrite ili odvojite panel, ispustite je na naslovnu traku drugog panela da dijelite jedan okvir kao kartice, prikvačite je da se panel sklanja do ruba ili ga sakrijte pa vratite s ruba. Vidi [Razmještaj panela](common:arrange-panels#make-the-layout-denser).
- **Dijaloški okviri se pomiču.** Povucite dijaloški okvir za naslovnu traku izvan puta crtežu; vraća se tamo gdje ste ga ostavili. Dvostruki klik na naslovnu traku ponovno ga centrira. Vidi [Pomicanje dijaloškog okvira](common:arrange-panels#move-a-dialog).
- **Recepti za AI pomoćnike.** Deset primjera zahtjeva za vašeg pomoćnika (urediti crtež, ispisati skup listova, provjeriti crteže, postaviti pitanje modelu, zbrojiti predmjer, isprobati varijantu dijela…), svaki s alatima koje poziva i dopuštenjima koja treba, a svaki provjeravaju naši testovi. Aplikacije ne sadrže nikakvu umjetnu inteligenciju. Vidi [Recepti za AI pomoćnike](common:assistants-recipes).
- **Jezici.** **Português (Portugal)** je novi u {{ui:Postavke}} › {{ui:Općenito}} › {{ui:Jezik}}. Taj, **Português (Brasil)**, **Español (México)** i **Bahasa Indonesia** sada imaju svaku riječ aplikacija, kao radne verzije koje izvorni govornik još nije pregledao. Teme pomoći su na engleskom, a neke na španjolskom.
- **CadCraft Studio** kaže zašto provjera ažuriranja nije uspjela (nema još datoteke za vaš sustav, nema mreže, neispravan potpis) umjesto samo „Gotovo“, i prestaje ponovno prikazivati karticu Što je novo koju ste zatvorili dok ne stigne novije izdanje.

## Još nije u ovoj verziji

- **0.7 nije potpisan kodom.** Potpisivanje i paket za Microsoft Store prebačeni su na 0.8 jer provjera certifikata još nije stigla. Provjerite SHA-256 uz svaku datoteku na getcadcraft.com/download. Na Windowsu, ako SmartScreen zaustavi instalaciju, odaberite {{ui:Dodatne informacije}}, zatim {{ui:Ipak pokreni}}. Na Macu, prvi put, desnom tipkom kliknite CadCraft Studio i odaberite {{ui:Otvori}}. CadCraft Studio još nije u trgovini aplikacija, a još nema ni verziju za iPad ili iPhone.
- Popisi kuta i nagiba u {{ui:Jedinice}} se spremaju, ali ih još nijedno polje ne čita.
- Proizvođačke prskalice za navodnjavanje: samo opće prskalice i vlastite iz datoteke. Podaci proizvođača dolaze samo uz njihovo dopuštenje, a nijedno još nije dano.
- BimCraft i ModelCraft nose popis biljaka, ali njihovo Postavi iz knjižnice još ne nudi biljke. Biljke stižu u BimCraft preko IFC-a krajobraza.
- Alati krajobraza za pomoćnike rade dok je prozor CivilCraft otvoren; poslužitelj datoteka i naredbeni redak ih još nemaju.
- Mase zgrada: nema dnevnog svjetla ni vjetra na pročeljima, nema sjene od drveća ni od ičega što nije nacrtano kao masa, nema oblika krova, a sati sunca prikazuju se na planu, ne u 3D prikazu. Razradi u programu BimCraft gradi jednostavne zidove i pod, bez otvora i krova.
- Dalekovodi: nema ugrađenog državnog standarda (vi postavljate slučajeve opterećenja, granice i razmake); nema puzanja vodiča, toplinskog opterećenja zakopanih kabela, studija kratkog spoja, zaštite ili uzemljenja; nema vodova u 3D prikazu ni u IFC-u. Datoteka za studiju `.DON` nije ispitana s programom koji je čita.
- Prijelaznice osim klotoide, prijelaznica između dviju krivulja i prijelaznica u linijama značajki. Prijelaznice su provjerene prema formulama i LandXML shemi, a još ne prema LandXML datoteci s prijelaznicama iz drugog programa.
- Sastavi koridora koji se mijenjaju uz cestu, regije i ciljevi za bočni pokos.
- Cijevi vodoopskrbe i tlačne mreže (sljedeći građevinski dio), protoci koji se mijenjaju s vremenom i veze između vodovodnih i oborinskih mreža.
- Lukovi u nacrtanim prijelomnicama. Standardne tablice projektnih vozila: pet isporučenih vozila su označeni zamjenici. Linije značajki dijeljene među projektima čekaju timske projekte.

Sve ostalo je u [Još nije izrađeno](topic:not-built-yet).
