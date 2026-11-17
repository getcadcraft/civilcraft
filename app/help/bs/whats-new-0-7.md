---
title: Šta je novo u 0.7 (ranije)
summary: CivilCraft 0.7 dodaje radni prostor za dalekovode (nadzemne vodove i podzemne kablove sa vašim bibliotekama, provjesom i napetošću, provjerama slobodnog prostora i čvrstoće, tabelama razvlačenja, količinama, listovima i GIS-om), radni prostor za pejzaž (spisak biljaka, planove sadnje i specifikacije, nivelaciju pejzaža, popločavanje, zidove i stepenice, pomoćni proračun navodnjavanja, listove za pejzaž i slobodne objekte), mase zgrada sa ograničenjima zoniranja koja unosite i sunčanim satima, klotoidne spirale, koridore građene od dijelova sa svake strane, izvoz u USD i još alata za AI asistente.
keywords: šta je novo 0.7, ranije izdanje, bilješke o izdanju, dnevnik promjena, promjene, 0.7, verzija, nove funkcije, pejzaž, radni prostor za pejzaž, spisak biljaka, biljke, sadnja, specifikacija biljaka, gredica, živica, nivelacija, platforma, nasip, plitki jarak, kota tačke, analiza nagiba, zadržavanje vode, tvrdo uređenje, popločavanje, staza, zid, ivičnjak, rampa, stepenice, navodnjavanje, prskalica, kap po kap, listovi za pejzaž, slobodan objekt, masa zgrade, masiranje, bruto površina poda, zoniranje, odmak, omotač, ravan neba, koeficijent iskorištenosti, zauzetost, sunčani sati, sjena, ifc, razvij u bimcraft, spirala, klotoida, prijelaz, sklop, ivičnjak, slivnik, trotoar, usd, asistenti, jedinice, portugalski
from: 797d2f2f
---

Ovo je šta se promijenilo u CivilCraft 0.7 u odnosu na 0.6. Najveći novi dijelovi su radni prostori za dalekovode i pejzaž, te mase zgrada.

## Novo

### Radni prostor za pejzaž

- **Radni prostor za pejzaž na istoj lokaciji.** {{ui:Površina}} › {{ui:Više}} › {{ui:Radni prostor za pejzaž}} dodaje alate za sadnju, nivelaciju, tvrdo uređenje i navodnjavanje na lokaciju koju već imate: iste tačke snimanja, površine i datoteku projekta. Izaberite **Civil** pod **Radni prostor** da se vratite. Vidi [Radni prostor za pejzaž](topic:landscape).
- **Spisak biljaka.** Oko 420 uobičajenih umjerenih i mediteranskih drveća, grmova, živica, trava, trajnica, pokrivača tla i penjačica, sa njihovim veličinama pri sadnji i pri zrelosti, zonom otpornosti, svjetlom, vodom i razmakom. Pretražujte po bilo kojem nazivu na engleskom, španskom ili portugalskom. Uvezite vlastitu listu kao CSV; sprema se uz projekat. Ugrađene veličine su tipične i zaokružene: provjerite ih sa lokalnim rasadnikom. Vidi [Spisak biljaka](topic:plant-list).
- **Planovi sadnje.** {{ui:Biljka}} postavlja pojedinačne biljke koje stoje na tlu i prate kasniju nivelaciju, {{ui:Gredica}} popunjava obris po razmaku biljaka sa mješavinom po procentu, a {{ui:Živica}} postavlja jedan ili dva reda duž linije. Biljke su označene na planu. Vidi [Planovi sadnje i specifikacije](topic:planting).
- **Specifikacija biljaka.** Više › {{ui:Spisak biljaka…}} broji biljke po vrsti i veličini sadnje. Spasite je kao CSV ili XLSX, ili pošaljite u TakeoffCraft radi cijene. Vidi [Specifikacija biljaka](topic:planting#the-plant-schedule).
- **Nivelacija za pejzaž.** {{ui:Nivelacija}} ima platforme (ravne ili padajuće), nasipe, plitke jarke i površine za nivelaciju sa kotama tačaka i izohipsama koje povlačite. Iskop i nasip se prikazuju dok radite. **Analiza nagiba** boji površinu prema vašim dvjema granicama, a **Strelice toka i zadržavanje vode** pokazuju kuda voda teče i gdje bi se zadržala. Sve ulazi u istu predloženu površinu kao plohe i koridori. Vidi [Nivelacija za pejzaž](topic:landscape-grading).
- **Popločavanje, staze, zidovi, ivičnjaci, rampe i stepenice.** {{ui:Tvrdo uređenje}} crta popločavanje sa poprečnim nagibom ili padom prema slivniku, uzorak i njegove slojeve; staze koje prate teren; potporne i samostojeće zidove sa stepenastim temeljima; ivičnjake; te rampe i stepenice provjerene prema granicama koje postavite. Potporni zid viši od 1.2 m (4 ft) označava se za inženjera. Vidi [Popločavanje, zidovi i stepenice](topic:hardscape).
- **Pomoćni proračun navodnjavanja.** {{ui:Navodnjavanje}} postavlja prskalice, bočne vodove, glavni vod, ventile, linije kap po kap i tačku priključka. {{ui:Provjeri sistem…}} pronalazi zone iz cijevi i računa protok svake zone, pritisak potreban na njenom ventilu i na dovodu (Hazen–Williams), padavine, vremena rada, pokrivenost i spisak materijala. To je pomoćno sredstvo za proračun, a ne certifikat projekta: projektant navodnjavanja provjerava svaki rezultat. Prskalice su opšte vrste ili vaše iz datoteke. Vidi [Projektovanje navodnjavanja](topic:irrigation).
- **Listovi za pejzaž.** Više › {{ui:Listovi za pejzaž…}} pravi planove sadnje, nivelacije i navodnjavanja sa njihovim legendama, te list sa detaljima zidnih presjeka, slojeva popločavanja i stepenica, kao jedan PDF. Vidi [Listovi za pejzaž](topic:landscape-sheets).
- **Slobodni objekti.** Više › {{ui:Slobodan objekt…}} postavlja mrežu STL, OBJ ili stavku iz biblioteke napravljenu u drugoj aplikaciji, na primjer saksiju ili skulpturu. Stoji na tlu ili se ukopava u njega, a njegova zapremina, površina i otisak se računaju. Vidi [Slobodni objekti](topic:freeform-objects).
- **IFC za pejzaž.** Više › {{ui:Izvezi pejzaž IFC}} sprema biljke (kao vegetaciju sa njihovim svojstvima), tvrdo uređenje i slobodne objekte kao IFC 4.3 za BIM model. Vidi [IFC](topic:planting#ifc).
- **Od početka do kraja.** [Projektujte baštu, od početka do kraja](topic:landscape-walkthrough) prolazi kroz cijeli radni prostor na primjeru lokacije.

### Radni prostor za dalekovode

- **Nadzemni vodovi i podzemni kablovi na vašoj lokaciji.** {{ui:Površina}} › {{ui:Više}} › {{ui:Radni prostor za dalekovode}}: nacrtajte vod po njegovim stubovima, kablove u rovovima, opremu i prepreke, na istom terenu i u istoj datoteci projekta. Vidi [Radni prostor za dalekovode](topic:power-lines).
- **Vaše vlastite biblioteke.** Provodnici, kablovi, stubovi, oprema (poprečne grede, izolatori, pribor, zatege, transformatori, ormari, spojnice) i tipovi rovova, u kategorijama koje sami nazovete, dijele se kao datoteka ili tabela. Nijedan katalog neke zemlje ili proizvođača nije ugrađen; primjeri kažu da su primjeri. Vidi [Vaša biblioteka dalekovoda](topic:power-line-library).
- **Provjes i napetost pod vašim slučajevima opterećenja.** Temperatura, vjetar, led i led na jednoj strani; granice napetosti kao dio prekidne čvrstoće; tačna lančanica na svakom rasponu, uključujući nagibe; tabele razvlačenja. Vidi [Provjes i napetost](topic:sag-and-tension).
- **Provjere, uvijek ažurne.** Slobodan prostor iznad tla i prepreka, razmak faza, zamah izolatora, uzgon, opterećenja stubova sa dimenzioniranjem iz vaše biblioteke, zatege, pribor, temelji, nedostajući podaci, nepovezani kablovi, preopterećenja i pad napona, označeni na planu i na profilu voda. Pomoćno sredstvo za projektovanje: inženjer ih provjerava. Vidi [Provjere dalekovoda](topic:power-line-checks).
- **Tabele, listovi i GIS.** Tabele razvlačenja i stubova, količine (CSV, Excel, TakeoffCraft), listovi plana i profila sa izvještajem o studiji u jednom PDF-u, GIS slojevi sa podacima svakog objekta. Vidi [Tabele, količine, listovi i GIS za dalekovode](topic:power-line-outputs).
- **Nakon prvih pokušaja.** Profil voda prati vod koji izaberete, ima listu **Vod**, čita teren, provodnik i razmak ispod pokazivača i mjeri između dvije tačke. Biljke i zidovi pejzaža broje se kao prepreke ispod vodova; trase kablova i cijevi prikazuju se u profilu voda i ukrštaju se sa pravilom razmaka koje izaberete; **Pravila…** pored svakog razmaka otvara vaša pravila, a skupovi pravila sa bibliotekom spremaju se kao paketi za dijeljenje po zemlji. Vidi [Provjere dalekovoda](topic:power-line-checks) i [Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Vaši formati datoteka.** Dalekovodi se spremaju u datoteku projekta CivilCraft, biblioteke u `.cclines.json` ili CSV, a skupovi pravila i paketi u vlastitim JSON datotekama: otvoreni formati koje svako može čitati ili pretvoriti. Datoteka studije `.DON` je dodatni uvoz i izvoz uz njih.
- **Datoteke studije (.DON), neispitano.** Spasite vod kao datoteku studije `.DON` za drugi program za dalekovode ili pročitajte njegove stubove; izrađeno prema nazivima polja formata, još nije ispitano sa tim programom. Vidi [Datoteke studije](topic:power-line-study-file).

### Mjerenje

- **Alat za mjerenje.** {{ui:Površina}} › {{ui:Više}} › {{ui:Izmjeri}} (ili {{key:M}}) mjeri na planu: dužinu i pravac svake strane, tekući zbir, dužinu duž tla i nagib, te površinu i obim kad zatvorite oblik. Ništa se ne crta u projekat. Vidi [Mjerenje](topic:measure).

### Mase zgrada

- **Crtanje masa zgrada.** U Svojstvima, pod **Mase zgrada**, {{ui:Nacrtaj masu}} (također {{ui:Površina}} › {{ui:Više}} › {{ui:Mase}}). Dajte masi spratove i visinu sprata, i pročitajte njenu bruto površinu poda. Izaberite kako stoji na nagnutom terenu (stepenasto, na podijumu ili u iskopu) i pogledajte nasip i iskop. Mase se prikazuju na planu, u PDF-u i u DWG i DXF na sopstvenim slojevima. Vidi [Crtanje masa zgrada na lokaciji](topic:building-masses).
- **Guranje i vučenje u 3D.** U 3D prikazu povucite krov izabrane mase ili pritisnite {{key:PageUp}} i {{key:PageDown}} da je mijenjate sprat po sprat, u jednom koraku poništavanja. {{ui:Sunce}} baca sjene masa. Vidi [U 3D prikazu](topic:building-masses#in-the-3d-view).
- **Ograničenja zoniranja koja unosite.** Odmaci red po red od linije ulice, ograničenje visine, ravan izlaganja nebu, koeficijent iskorištenosti i zauzetost. Dozvoljeni omotač se crta na planu, a svaka masa dobija kvačicu ili križić za svako ograničenje. CivilCraft nema pravilnik o zoniranju u sebi: svaki broj unosite vi iz vlastitog pravilnika. Vidi [Provjera masa prema ograničenjima zoniranja koja unosite](topic:zoning-limits).
- **Sunčani sati.** Izaberite dan ili godišnje doba i vremensku zonu po nazivu ili pomaku, te pročitajte sate direktnog sunca na svakom zidu svake mase, sprat po sprat, i na tlu oko njih, nacrtano na planu. Spasite zidove i tlo kao CSV. Projekat treba koordinatni sistem. Vidi [Računanje sunčanih sati na lokaciji](topic:sun-hours).
- **Mase kao IFC, i dalje u BimCraft.** {{ui:Mase kao IFC}} sprema mase kao IFC4, postavljene na kartu kad projekat ima koordinatni sistem. {{ui:Razvij u BimCraft-u}} otvara BimCraft u novoj kartici sa masama, gdje **Razvij ovu masu** gradi zidove na svakom nivou i pod iz otiska. Ništa se ne šalje. Vidi [Slanje dalje](topic:building-masses#send-it-on).

### Trase

- **Klotoidne spirale.** Upišite dužinu u **Ulazna spirala** i **Izlazna spirala** u tabeli PI za krivinu: tangenta, spirala, krivina, spirala, tangenta, sa jednakim ili različitim dužinama. Plan označava TS, SC, CS i ST, lista krivina daje θs te tangentnu i vanjsku udaljenost, a stacionaže i odmaci prolaze kroz spirale. Vidi [Spirale](topic:alignment#spirals).
- **Spirale u LandXML-u.** LandXML piše i čita klotoidne spirale. Trase sa spiralama, koje je CivilCraft ranije preskakao pri uvozu, sada se otvaraju. Vidi [Izvoz LandXML](topic:landxml).

### Koridori

- **Svaka strana iz dijelova.** Uključite **Gradi svaku stranu iz dijelova** da svaka strana dobije sopstvenu listu od središnje linije prema van: trake, bankina, slivnik, ivičnjak, pojas za sadnju, pješačku stazu i bočni nagib sa vlastitim iskopom i nasipom. Počnite od {{ui:Seoski put}} ili {{ui:Gradska ulica}} i kopirajte jednu stranu na drugu. Poprečni presjeci označavaju liniju toka, ivičnjak i pješačku stazu, a obrađena površina ima ivičnjak. Vidi [Gradnja svake strane iz dijelova](topic:corridor#build-each-side-from-parts).
- **Nadvišenje preko spirala.** Na krivini sa spiralama, prelaz nadvišenja ide preko spirale: ravan krov na TS, puno nadvišenje na SC. Vidi [Nadvišenje](topic:corridor#superelevation).

### Datoteke 3D

- **Izvoz USD.** U 3D prikazu, {{ui:USD}} sprema lokaciju kao `.usda`, `.usdc` ili `.usdz` u pravoj razmjeri i na koordinatama projekta: površine, cijevi i objekti kao mreže, linije, svaka trasa i tačke snimanja sa svojim brojevima. Vidi [Izvoz 3D lokacije kao USD](topic:usd).

### AI asistenti

- **Više za asistente.** Kad su asistenti uključeni u {{ui:Postavke}} › {{ui:CivilCraft}}, asistent sada može čitati parcele, iskop i nasip te profile, dodavati tačke snimanja, spašavati projekat, izvoziti LandXML, DWG i USD i raditi u mapama koje izaberete u CadCraft Studio. Radni prostor za pejzaž dodaje alate za pronalaženje biljaka, postavljanje biljaka, gredica i živica, nivelaciju i provjeru navodnjavanja. Server datoteka i komandna linija `cadcraft` otvaraju spremljene projekte bez prozora. Vidi [Neka AI asistent radi sa vašom lokacijom](topic:assistants).

## U svakoj aplikaciji

- **Jedinice.** {{ui:Postavke}} › {{ui:Opšte}} › {{ui:Jedinice}} ima po jednu listu za dužinu, površinu, zapreminu, ugao i nagib, sa tačnim veličinama koje daju definicije jedinica (američka geodetska stopa je zasebna jedinica). Isključite jedinice koje nikad ne koristite i one napuštaju liste; označite jednu zvjezdicom i novi rad počinje u njoj. Datoteka uvijek zadržava svoju jedinicu. U CivilCraft lista **Jedinice** projekta prati prekidače; zvjezdica za metričku dužinu pokreće nove projekte u metrima (inače u stopama, koje su američke geodetske stope), zvjezdica za površinu ili zapreminu postavlja jedinice u kojima se površine i zapremine prijavljuju, a polje za dužinu prihvata oznaku bilo koje jedinice, na primjer `3 ch` ili `450 mm`. Vidi [Jedinice, unesene vrijednosti i liste jedinica](common:unit-lists).
- **Gušći raspored i paneli koji se sklapaju.** {{ui:Postavke}} › {{ui:Opšte}} › {{ui:Gustina rasporeda}} › {{ui:Zbijeno}} stavlja više na ekran (ekrani osjetljivi na dodir i telefoni zadržavaju velika dugmad). Svaki bočni panel ima tanku naslovnu traku: povucite je da pričvrstite ili otkačite panel, pustite je na traku drugog panela da dijelite jedan okvir kao kartice, zakačite je da kliže do ivice, ili sakrijte panel i vratite ga sa ivice. Vidi [Raspored panela](common:arrange-panels#make-the-layout-denser).
- **Dijalozi se pomjeraju.** Povucite dijalog za naslovnu traku izvan puta crtežu; vraća se tamo gdje ste ga ostavili. Dvostruki klik na naslovnu traku ga ponovo centrira. Vidi [Pomjeranje dijaloga](common:arrange-panels#move-a-dialog).
- **Recepti za AI asistente.** Deset primjera zahtjeva za vašeg asistenta (uredite crtež, iscrtajte set, provjerite crteže, postavite pitanje modelu, zbrojite predmjer, isprobajte varijantu dijela…), svaki sa alatima koje poziva i dozvolama koje treba, i svaki ponovo pokrenut našim testovima. Aplikacije ne sadrže AI. Vidi [Recepti za AI asistente](common:assistants-recipes).
- **Jezici.** **Português (Portugal)** je novi u {{ui:Postavke}} › {{ui:Opšte}} › {{ui:Jezik}}. Taj, **Português (Brasil)**, **Español (México)** i **Bahasa Indonesia** sada imaju svaku riječ aplikacija, kao nacrte koje izvorni govornik još nije pregledao. Teme pomoći su na engleskom, a neke na španskom.
- **CadCraft Studio** kaže zašto provjera ažuriranja nije uspjela (još nema datoteke za vaš sistem, nema mreže, loš potpis) umjesto samo „Gotovo“, i prestaje ponovo prikazivati karticu Šta je novo koju ste zatvorili dok ne bude novijeg izdanja.

## Još nije u ovoj verziji

- **0.7 nije potpisan kodom.** Potpisivanje i paket Microsoft Store prebačeni su na 0.8 jer provjera certifikata još nije stigla. Provjerite SHA-256 uz svaku datoteku na getcadcraft.com/download. Na Windowsu, ako SmartScreen zaustavi instalater, izaberite {{ui:Više informacija}}, pa {{ui:Ipak pokreni}}. Na Macu, prvi put, desnim klikom kliknite CadCraft Studio i izaberite {{ui:Otvori}}. CadCraft Studio još nije u prodavnici aplikacija, i još nema verzije za iPad ili iPhone.
- Liste uglova i nagiba u {{ui:Jedinice}} se spremaju, ali im još nijedno polje ne čita vrijednosti.
- Irigacione glave proizvođača: samo opšte glave i vaše iz datoteke. Podaci proizvođača dolaze samo uz njihovu dozvolu, a još nijedna nije data.
- BimCraft i ModelCraft nose spisak biljaka, ali njihov Postavi iz biblioteke još ne nudi biljke. Biljke stižu u BimCraft preko IFC-a za pejzaž.
- Alati pejzaža za asistente rade dok je prozor CivilCraft otvoren; server datoteka i komandna linija ih još nemaju.
- Mase zgrada: nema dnevne svjetlosti ni vjetra na fasadi, nema sjene od drveća ni od bilo čega što nije nacrtano kao masa, nema oblika krova, a sunčani sati se prikazuju na planu, ne u 3D prikazu. Razvij u BimCraft pravi obične zidove i pod, bez otvora ili krova.
- Dalekovodi: nema ugrađenog standarda nijedne zemlje (vi postavljate slučajeve opterećenja, granice i razmake); nema studija puzanja provodnika, toplotnog ocjenjivanja zakopanih kablova, kratkog spoja, zaštite ili uzemljenja; nema vodova u 3D prikazu ili IFC-u. Datoteka studije `.DON` nije ispitana sa programom koji je čita.
- Spirale osim klotoidne, spirala između dvije krivine i spirale u linijama obilježja. Spirale su provjerene prema formulama i LandXML šemi, još ne prema LandXML datoteci sa spiralama iz drugog programa.
- Sklopovi koridora koji se mijenjaju uz put, regije i mete za bočni nagib.
- Cijevi vodovoda i tlačne mreže (sljedeći građevinski radovi), protoci koji se mijenjaju tokom vremena i veze između vodovodnih i oborinskih mreža.
- Lukovi u nacrtanim linijama loma. Tabele standardnih projektnih vozila: pet vozila koja se isporučuju su označeni kao privremeni podaci. Linije obilježja dijeljene među projektima čekaju timske projekte.

Sve ostalo je u [Još nije izgrađeno](topic:not-built-yet).
