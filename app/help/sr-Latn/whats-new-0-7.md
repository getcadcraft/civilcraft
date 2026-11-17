---
title: Šta je novo u 0.7 (ranije)
summary: CivilCraft 0.7 dodaje radni prostor za dalekovode (nadzemne vodove i podzemne kablove sa sopstvenim bibliotekama, provisom i zatezanjem, proverama razmaka i čvrstoće, tabelama zatezanja, količinama, listovima i GIS-om), radni prostor za pejzažno uređenje (spisak biljaka, planove sadnje i specifikacije, nivelaciju za pejzaž, popločavanje, zidove i stepenice, proračun navodnjavanja, listove za pejzaž i slobodne objekte), građevinske mase sa zonskim granicama koje unosite i sunčanim satima, klotoidne spirale, koridore izgrađene od delova sa svake strane, izvoz u USD i više alatki za AI asistente.
keywords: šta je novo 0.7, raniji izdanje, napomene uz izdanje, dnevnik promena, promene, 0.7, verzija, nove funkcije, pejzaž, radni prostor za pejzaž, spisak biljaka, biljke, sadnja, specifikacija biljaka, gredica, živica, nivelacija, plato, nasip, jarak, kota tačke, analiza nagiba, zadržavanje vode, tvrdo uređenje, popločavanje, staza, zid, ivičnjak, rampa, stepenice, navodnjavanje, prskalica, kap po kap, listovi za pejzaž, slobodan objekat, građevinska masa, masovno modelovanje, bruto površina, zoniranje, povlačenje, omotač, ravan neba, koeficijent iskorišćenosti, pokrivenost, sunčani sati, senka, ifc, razvij u bimcraft, spirala, klotoida, prelaz, sklop, ivičnjak, slivnik, trotoar, usd, asistenti, jedinice, portugalski
from: 797d2f2f
---

Ovo je šta se promenilo u CivilCraft 0.7 u odnosu na 0.6. Najveći novi delovi su radni prostori za dalekovode i pejzaž i građevinske mase.

## Novo

### Radni prostor za pejzažno uređenje

- **Radni prostor za pejzažno uređenje na istoj lokaciji.** {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}} dodaje alatke za sadnju, nivelaciju, tvrdo uređenje i navodnjavanje na lokaciju koju već imate: iste tačke premera, površine i datoteku projekta. Izaberite **Civil** pod **Radni prostor** da se vratite. Pogledajte [Radni prostor za pejzažno uređenje](topic:landscape).
- **Spisak biljaka.** Oko 420 uobičajenih umerenih i mediteranskih drveća, žbunova, živica, trava, trajnica, pokrivača tla i penjačica, sa njihovim veličinama pri sadnji i pri zrelosti, zonom otpornosti na mraz, svetlom, vodom i razmakom. Pretražujte po bilo kom nazivu na engleskom, španskom ili portugalskom. Uvezite sopstveni spisak kao CSV; čuva se uz projekat. Ugrađene veličine su tipične i zaokružene: proverite ih u lokalnom rasadniku. Pogledajte [Spisak biljaka](topic:plant-list).
- **Planovi sadnje.** {{ui:Plant}} postavlja pojedinačne biljke koje stoje na tlu i prate kasniju nivelaciju, {{ui:Bed}} popunjava obris prema razmaku biljaka sa mešavinom po procentu, a {{ui:Hedge}} postavlja jedan ili dva reda duž linije. Biljke su označene na planu. Pogledajte [Planovi sadnje i specifikacije](topic:planting).
- **Specifikacija biljaka.** Više › {{ui:Plant schedule…}} broji biljke po vrsti i veličini sadnice. Sačuvajte je kao CSV ili XLSX, ili je pošaljite u TakeoffCraft da je ocenite. Pogledajte [Specifikacija biljaka](topic:planting#the-plant-schedule).
- **Nivelacija za pejzaž.** {{ui:Grade}} ima platoe (ravne ili padajuće), nasipe, plitke odvodne jarke i zone nivelacije sa kotama tačaka i izohipsama koje prevlačite. Iskop i nasip se prikazuju dok radite. **Analiza nagiba** boji površinu prema vaša dva sopstvena ograničenja, a **Strelice toka i zadržavanje vode** pokazuje gde voda teče i gde bi se zadržavala. Sve ulazi u istu predloženu površinu kao plato i koridori. Pogledajte [Nivelacija za pejzaž](topic:landscape-grading).
- **Popločavanje, staze, zidovi, ivičnjaci, rampe i stepenice.** {{ui:Hardscape}} crta popločavanje sa poprečnim padom ili padom ka slivniku, šemu i njene slojeve; staze koje prate teren; potporne i samostojeće zidove sa stepenastim temeljima; ivičnjake; i rampe i stepenice proverene prema ograničenjima koja zadajete. Potporni zid viši od 1.2 m (4 ft) označava se za inženjera. Pogledajte [Popločavanje, zidovi i stepenice](topic:hardscape).
- **Proračun navodnjavanja.** {{ui:Irrigation}} postavlja mlaznice, bočne vodove, glavni vod, ventile, linije za kap po kap i tačku priključka. {{ui:Check the system…}} pronalazi zone iz cevi i računa protok svake zone, pritisak potreban na njenom ventilu i na dovodu (Hazen–Williams), padavine, vremena rada, pokrivenost i spisak materijala. Ovo je pomoćno sredstvo za proračun, a ne overa projekta: projektant navodnjavanja proverava svaki rezultat. Mlaznice su opšte vrste ili vaše iz datoteke. Pogledajte [Projektovanje navodnjavanja](topic:irrigation).
- **Listovi za pejzaž.** Više › {{ui:Landscape sheets…}} pravi planove sadnje, nivelacije i navodnjavanja sa njihovim legendama, i list detalja sa zidnim presecima, slojevima popločavanja i stepenicama, kao jedan PDF. Pogledajte [Listovi za pejzaž](topic:landscape-sheets).
- **Slobodni objekti.** Više › {{ui:Freeform object…}} postavlja mrežu u STL, OBJ ili stavku iz biblioteke napravljenu u drugom programu, na primer saksiju ili skulpturu. Stoji na tlu ili se useca u njega, a njegova zapremina, površina i otisak se računaju. Pogledajte [Slobodni objekti](topic:freeform-objects).
- **IFC za pejzaž.** Više › {{ui:Export landscape IFC}} čuva biljke (kao vegetaciju sa svojstvima), tvrdo uređenje i slobodne objekte kao IFC 4.3 za BIM model. Pogledajte [IFC](topic:planting#ifc).
- **Od početka do kraja.** [Projektovanje bašte od početka do kraja](topic:landscape-walkthrough) prolazi kroz ceo radni prostor na uzorku lokacije.

### Radni prostor za dalekovode

- **Nadzemni vodovi i podzemni kablovi na vašoj lokaciji.** {{ui:Surface}} › {{ui:More}} › {{ui:Power lines workspace}}: nacrtajte vod po njegovim nosačima, kablove u rovovima, opremu i prepreke, na istom terenu i u istoj datoteci projekta. Pogledajte [Radni prostor za dalekovode](topic:power-lines).
- **Vaše sopstvene biblioteke.** Provodnici, kablovi, nosači, oprema (poprečni nosači, izolatori, okovi, zatege, transformatori, ormarići, spojevi) i tipovi rovova, u kategorijama koje imenujete, deljeni kao datoteka ili tabela. Nije ugrađen katalog nijedne zemlje ni proizvođača; primeri kažu da su primeri. Pogledajte [Vaša biblioteka dalekovoda](topic:power-line-library).
- **Provis i zatezanje pod vašim slučajevima opterećenja.** Temperatura, vetar, led i led sa jedne strane; granice zatezanja kao udeo prekidne čvrstoće; tačna lančanica na svakom rasponu, uključujući nagibe; tabele zatezanja. Pogledajte [Provis i zatezanje](topic:sag-and-tension).
- **Provere, uvek ažurne.** Razmak do tla i prepreka, razmak faza, ljuljanje izolatora, uzgon, opterećenja nosača sa dimenzionisanjem iz vaše biblioteke, zatege, okovi, temelji, nedostajući podaci, nepovezani kablovi, preopterećenja i pad napona, označeni na planu i na profilu voda. Pomoćno sredstvo za projektovanje: proverava inženjer. Pogledajte [Provere dalekovoda](topic:power-line-checks).
- **Tabele, listovi i GIS.** Tabele zatezanja i nosača, količine (CSV, Excel, TakeoffCraft), listovi plana i profila sa izveštajem o studiji u jednom PDF-u, GIS slojevi sa podacima svakog sredstva. Pogledajte [Tabele, količine, listovi i GIS za dalekovode](topic:power-line-outputs).
- **Posle prvih pokušaja.** Profil voda prati vod koji izaberete, ima listu **Vod**, čita teren, provodnik i razmak ispod kursora i meri između dve tačke. Biljke i zidovi u pejzažu računaju se kao prepreke ispod vodova; trase kablova i cevi prikazuju se u profilu voda i ukrštaju se sa pravilom razmaka koji izaberete; **Pravila…** pored svakog razmaka otvara vaša pravila, a skupovi pravila sa bibliotekom čuvaju se kao paketi za deljenje po zemlji. Pogledajte [Provere dalekovoda](topic:power-line-checks) i [Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Sopstveni formati datoteka.** Dalekovodi se čuvaju u datoteci projekta CivilCraft, biblioteke u `.cclines.json` ili CSV, a skupovi pravila i paketi u sopstvenim JSON datotekama: otvoreni formati koje svako može da čita ili pretvori. Datoteka studije `.DON` je dodatni uvoz i izvoz uz njih.
- **Datoteke studija (.DON), neisprobano.** Sačuvajte vod kao datoteku studije `.DON` za drugi program za vodove, ili pročitajte nosače iz nje; napravljeno prema nazivima polja formata, još nije isprobano sa tim programom. Pogledajte [Datoteke studija](topic:power-line-study-file).

### Merenje

- **Alatka za merenje.** {{ui:Surface}} › {{ui:More}} › {{ui:Measure}} (ili {{key:M}}) meri na planu: dužinu i pravac svake strane, tekući zbir, dužinu duž tla i nagib, a površinu i obim kad zatvorite oblik. Ništa se ne crta u projekat. Pogledajte [Merenje](topic:measure).

### Građevinske mase

- **Crtanje građevinskih masa.** U **Svojstva**, pod **Građevinske mase**, {{ui:Draw a mass}} (takođe {{ui:Surface}} › {{ui:More}} › {{ui:Masses}}). Zadajte masi spratove i visinu sprata i pročitajte njenu bruto površinu spratova. Izaberite kako stoji na kosom terenu (stepenasto, na podijumu ili iskop) i pogledajte nasip i iskop. Mase se prikazuju na planu, u PDF-u, a u DWG i DXF na sopstvenim slojevima. Pogledajte [Crtanje građevinskih masa na lokaciji](topic:building-masses).
- **Guranje i vučenje u 3D.** U 3D prikazu prevucite krov izabrane mase ili pritisnite {{key:PageUp}} i {{key:PageDown}} da je menjate sprat po sprat, u jednom koraku opozivanja. **Sunce** baca senke masa. Pogledajte [U 3D prikazu](topic:building-masses#in-the-3d-view).
- **Zonske granice koje unosite.** Povlačenja red po red od linije ulice, granica visine, ravan izloženosti nebu, koeficijent iskorišćenosti i zauzetost. Dozvoljeni građevinski prostor se crta na planu, a svaka masa dobija znak za ispunjeno ili neispunjeno za svaku granicu. CivilCraft nema zonski propis ugrađen: svaki broj je onaj koji unesete iz vašeg propisa. Pogledajte [Provera masa prema zonskim granicama koje unosite](topic:zoning-limits).
- **Sunčani sati.** Izaberite dan ili sezonu i vremensku zonu po nazivu ili pomaku, i pročitajte sate direktnog sunca na svakom zidu svake mase, sprat po sprat, i na tlu oko njih, prikazano na planu. Sačuvajte zidove i tlo kao CSV. Projekat treba koordinatni sistem. Pogledajte [Računanje sunčanih sati na lokaciji](topic:sun-hours).
- **Mase kao IFC, i dalje u BimCraft.** {{ui:Masses as IFC}} čuva mase kao IFC4, postavljene na mapu kad projekat ima koordinatni sistem. {{ui:Develop in BimCraft}} otvara BimCraft u novoj kartici sa masama, gde **Razvij ovu masu** gradi zidove na svakom nivou i pod iz otiska. Ništa se ne otprema. Pogledajte [Slanje dalje](topic:building-masses#send-it-on).

### Osovine trase

- **Klotoidne spirale.** Upišite dužinu u **Ulazna spirala** i **Izlazna spirala** u tabeli PI za krivinu: tangenta, spirala, kriva, spirala, tangenta, sa jednakim ili različitim dužinama. Plan označava TS, SC, CS i ST, lista krivina daje θs i tangentna i spoljašnja rastojanja, a stacionaže i odmaci teku kroz spirale. Pogledajte [Spirale](topic:alignment#spirals).
- **Spirale u LandXML-u.** LandXML piše i čita klotoidne spirale. Osovine sa spiralama, koje je CivilCraft ranije preskakao pri uvozu, sada se otvaraju. Pogledajte [Razmena LandXML](topic:landxml).

### Koridori

- **Svaka strana iz delova.** Uključite **Svaka strana iz delova** da svaka strana dobije sopstvenu listu, od osovine prema spolja: trake, bankinu, žleb, ivičnjak, traku za zelenilo, trotoar i bočni nagib sa sopstvenim iskopom i nasipom. Počnite od {{ui:Rural road}} ili {{ui:Urban street}} i kopirajte jednu stranu na drugu. Poprečni preseci obeležavaju liniju toka, ivičnjak i šetnu stazu, a obrađena površina ima ivičnjak. Pogledajte [Svaka strana iz delova](topic:corridor#build-each-side-from-parts).
- **Nadvišenje preko spirala.** Na krivini sa spiralama, nadvišenje se pruža preko spirale: ravan poprečni profil u TS, puno nadvišenje u SC. Pogledajte [Nadvišenje](topic:corridor#superelevation).

### 3D datoteke

- **USD izvoz.** U 3D prikazu, {{ui:USD}} piše lokaciju kao `.usda`, `.usdc` ili `.usdz` u pravoj razmeri i na koordinatama projekta: površine, cevi i objekti kao mreže, linije, svaka osovina i tačke premera sa svojim brojevima. Pogledajte [Izvoz 3D lokacije kao USD](topic:usd).

### AI asistenti

- **Više za asistente.** Kad su asistenti uključeni u {{ui:Settings}} › {{ui:CivilCraft}}, asistent sada može i da čita parcele, nasip i iskop i profile, dodaje tačke premera, čuva projekat, izvozi LandXML, DWG i USD, i radi u fasciklama koje izaberete u CadCraft Studio. Radni prostor za pejzažno uređenje dodaje alatke za pronalaženje i postavljanje biljaka, gredica i živica, nivelaciju i proveru navodnjavanja. Server datoteka i komandna linija `cadcraft` otvaraju sačuvane projekte bez prozora. Pogledajte [Neka AI asistent radi sa vašom lokacijom](topic:assistants).

## U svakoj aplikaciji

- **Jedinice.** {{ui:Settings}} › {{ui:General}} › {{ui:Units}} ima po jedan spisak za dužinu, površinu, zapreminu, ugao i nagib, sa tačnim veličinama koje daju definicije jedinica (US survey foot je posebna jedinica). Isključite jedinice koje nikad ne koristite i one izlaze iz spiskova; označite zvezdicom jednu i novi rad počinje u njoj. Datoteka uvek zadržava sopstvenu jedinicu. U CivilCraft-u spisak **Jedinice** projekta prati prekidače; zvezdica za metričku dužinu pokreće nove projekte u metrima (inače u stopama, koje su US survey feet), zvezdica za površinu ili zapreminu određuje jedinice u kojima se površine i zapremine prijavljuju, a polje za dužinu prihvata oznaku bilo koje jedinice, na primer `3 ch` ili `450 mm`. Pogledajte [Jedinice, unete vrednosti i spiskovi jedinica](common:unit-lists).
- **Gušći raspored i paneli koji se sklanjaju.** {{ui:Settings}} › {{ui:General}} › {{ui:Layout density}} › {{ui:Compact}} stane više na ekran (ekrani osetljivi na dodir i telefoni zadržavaju velika dugmad). Svaki bočni panel ima tanku naslovnu traku: prevucite je da prikačite ili otkačite panel, ispustite je na traku drugog panela da delite jedan okvir kao kartice, zakačite je da klizi do ivice, ili sakrijte panel i vratite ga sa ivice. Pogledajte [Raspored panela](common:arrange-panels#make-the-layout-denser).
- **Dijalozi se pomeraju.** Prevucite dijalog za naslovnu traku van puta crtežu; vraća se tamo gde ste ga ostavili. Dvostruki klik na naslovnu traku ga ponovo centrira. Pogledajte [Pomeranje dijaloga](common:arrange-panels#move-a-dialog).
- **Recepti za AI asistente.** Deset primera zahteva za vašeg asistenta (sredite crtež, iscrtajte set, proverite crteže, postavite pitanje o modelu, zbrojite predmer, isprobajte varijantu dela…), svaki sa alatkama koje poziva i dozvolama koje mu trebaju, i svaki ponovo proveren našim testovima. Aplikacije ne sadrže AI. Pogledajte [Recepti za AI asistente](common:assistants-recipes).
- **Jezici.** **Português (Portugal)** je nov u {{ui:Settings}} › {{ui:General}} › {{ui:Language}}. Taj, **Português (Brasil)**, **Español (México)** i **Bahasa Indonesia** sada imaju svaku reč aplikacija, kao nacrte koje izvorni govornik još nije pregledao. Teme pomoći su na engleskom, a nekoliko na španskom.
- **CadCraft Studio** kaže zašto provera ažuriranja nije uspela (još nema datoteke za vaš sistem, nema mreže, loš potpis) umesto samo „Gotovo“, i prestaje da vraća karticu „Šta je novo“ koju ste zatvorili, dok ne bude novije izdanje.

## Još nije u ovoj verziji

- **0.7 nije potpisan kodom.** Potpisivanje i paket za Microsoft Store prebačeni su u 0.8, jer validacija sertifikata još nije stigla. Proverite SHA-256 uz svaku datoteku na getcadcraft.com/download. Na Windows-u, ako SmartScreen zaustavi instalater, izaberite {{ui:More info}}, pa {{ui:Run anyway}}. Na Mac-u, prvi put, desni klik na CadCraft Studio i izaberite {{ui:Open}}. CadCraft Studio još nije u prodavnicama aplikacija, a još nema verziju za iPad ni iPhone.
- Uglovi i nagibi u {{ui:Units}} se čuvaju, ali ih još nijedno polje ne čita.
- Mlaznice za navodnjavanje proizvođača: samo opšte mlaznice i vaše iz datoteke. Podaci proizvođača dolaze samo uz njihovu dozvolu, a još nijedna nije data.
- BimCraft i ModelCraft nose spisak biljaka, ali njihovo Postavi iz biblioteke još ne nudi biljke. Biljke stižu u BimCraft preko IFC-a za pejzaž.
- Alatke za pejzaž za asistente rade dok je prozor CivilCraft otvoren; server datoteka i komandna linija ih još nemaju.
- Građevinske mase: nema dnevnog osvetljenja ili vetra na fasadi, nema senke od drveća ili od onoga što nije nacrtano kao masa, nema oblika krovova, a sunčani sati se prikazuju na planu, a ne u 3D prikazu. Razvij u BimCraft pravi obične zidove i pod, bez otvora i krova.
- Dalekovodi: nema ugrađenog standarda nijedne zemlje (sami zadajete slučajeve opterećenja, granice i razmake); nema studija puzanja provodnika, termičkog kapaciteta zakopanih kablova, kratkog spoja, zaštite ili uzemljenja; nema vodova u 3D prikazu ni u IFC-u. Datoteka studije `.DON` nije isprobana sa programom koji je čita.
- Spirale osim klotoidnih, spirala između dve krivine i spirale u linijama obeležja. Spirale su proverene prema formulama i LandXML šemi, još ne prema LandXML datoteci sa spiralama iz drugog programa.
- Sklopovi koridora koji se menjaju duž puta, regije i ciljevi za bočni nagib.
- Vodovodne magistrale i pritisne mreže (sledeći građevinski posao), tokovi koji se menjaju tokom vremena i veze između vodovodnih i kišnih mreža.
- Lukovi u nacrtanim prelomnim linijama. Standardne tabele projektnih vozila: pet vozila koja se isporučuju su obeleženi privremeni podaci. Linije obeležja deljene među projektima čekaju timske projekte.

Sve ostalo je u [Još nije izgrađeno](topic:not-built-yet).
