---
title: Šta je novo u 0.7
summary: CivilCraft 0.7 donosi radni prostor za dalekovode (nadzemne vodove i podzemne kablove sa sopstvenim bibliotekama, provesom i zatezanjem, proverom razmaka i čvrstoće, tabelama razvlačenja, količinama, listovima i GIS-om), radni prostor za pejzažno uređenje (spisak biljaka, planove sadnje i spiskove, nivelaciju terena, popločavanje, zidove i stepenice, proračun navodnjavanja, listove za pejzaž i slobodne objekte), građevinske mase sa ograničenjima zoniranja koja upisujete i satima sunca, klotoidne spirale, koridore sastavljene od delova sa obe strane, izvoz USD-a i još alata za AI asistente.
keywords: šta je novo, what's new, napomene o izdanju, dnevnik promena, promene, 0.7, verzija, nove funkcije, pejzaž, radni prostor za pejzažno uređenje, spisak biljaka, biljke, sadnja, spisak biljaka, gredica, živica, nivelacija, platforma, nasip, udubljenje, kota tačke, analiza nagiba, zadržavanje vode, tvrdo uređenje, popločavanje, staza, zid, ivičnjak, rampa, stepenice, navodnjavanje, prskalica, kap po kap, listovi za pejzaž, slobodan objekat, građevinska masa, masiranje, bruto površina, zoniranje, povlačenje, omotač, ravan neba, koeficijent iskorišćenosti, koeficijent izgrađenosti, sati sunca, senka, ifc, razvij u bimcraft, spirala, klotoida, prelaz, sklop, ivičnjak, slivnik, trotoar, usd, asistenti, jedinice, portugalski
from: 3c9d79db
---

Ovo je šta se promenilo u CivilCraft-u 0.7, u poređenju sa 0.6. Najveći novi delovi su radni prostori za dalekovode i pejzažno uređenje i građevinske mase.

## Novo

### Radni prostor za pejzažno uređenje

- **Radni prostor za pejzažno uređenje na istoj lokaciji.** {{ui:Površ}} › {{ui:Više}} › {{ui:Radni prostor za pejzažno uređenje}} dodaje alate za sadnju, nivelaciju, tvrdo uređenje i navodnjavanje lokaciji koju već imate: iste geodetske tačke, površi i datoteku projekta. Izaberite **Građevinski** pod **Radni prostor** da se vratite. Pogledajte [Radni prostor za pejzažno uređenje](topic:landscape).
- **Spisak biljaka.** Oko 420 uobičajenih drveća, žbunova, živica, trava, trajnica, pokrivača tla i penjačica umerenog i mediteranskog pojasa, sa njihovim veličinama pri sadnji i u zrelosti, zonom otpornosti, svetlom, vodom i razmakom. Pretražujte po bilo kom nazivu na engleskom, španskom ili portugalskom. Uvezite sopstveni spisak kao CSV; čuva se uz projekat. Ugrađene veličine su tipične i zaokružene: proverite ih u lokalnom rasadniku. Pogledajte [Spisak biljaka](topic:plant-list).
- **Planovi sadnje.** {{ui:Biljka}} postavlja pojedinačne biljke koje leže na terenu i prate kasniju nivelaciju, {{ui:Gredica}} popunjava obris prema razmaku biljaka sa mešavinom po procentima, a {{ui:Živica}} postavlja jedan ili dva reda duž linije. Biljke su označene na planu. Pogledajte [Planovi sadnje i spiskovi](topic:planting).
- **Spisak biljaka.** Više › {{ui:Spisak biljaka…}} broji biljke po vrsti i veličini pri sadnji. Sačuvajte ga kao CSV ili XLSX, ili ga pošaljite u TakeoffCraft da se oceni. Pogledajte [Spisak biljaka u planu](topic:planting#the-plant-schedule).
- **Nivelacija za pejzaž.** {{ui:Nivelacija}} ima platforme (ravne ili padajuće), nasipe, udubljenja i površine za nivelaciju sa kotama tačaka i izohipsama koje vučete. Iskop i nasip se prikazuju dok radite. **Analiza nagiba** boji površ prema vašim sopstvenim dvema granicama, a **Strelice toka i zadržavanje vode** pokazuju kuda voda teče i gde bi se zadržala. Sve ide u istu projektovanu površ kao platoi i koridori. Pogledajte [Nivelacija za pejzaž](topic:landscape-grading).
- **Popločavanje, staze, zidovi, ivičnjaci, rampe i stepenice.** {{ui:Tvrdo uređenje}} crta popločavanje sa poprečnim padom ili padom ka slivniku, uzorak i njegove slojeve; staze koje prate teren; potporne i samostojeće zidove sa stepenastim temeljima; ivičnjake; i rampe i stepenice proverene prema granicama koje postavite. Potporni zid viši od 1.2 m (4 ft) označava se za inženjera. Pogledajte [Popločavanje, zidovi i stepenice](topic:hardscape).
- **Pomoćni alat za proračun navodnjavanja.** {{ui:Navodnjavanje}} postavlja prskalice, lateralne cevi, glavni vod, ventile, linije kap po kap i tačku priključka. {{ui:Proveri sistem…}} pronalazi zone iz cevi i računa protok svake zone, pritisak potreban na njenom ventilu i na dovodu (Hazen–Williams), padavine, vremena rada, pokrivenost i spisak materijala. To je pomoćni alat za proračun, a ne sertifikacija projekta: projektant navodnjavanja proverava svaki rezultat. Prskalice su opšte vrste ili vaše sopstvene iz datoteke. Pogledajte [Projektovanje navodnjavanja](topic:irrigation).
- **Listovi za pejzaž.** Više › {{ui:Listovi za pejzaž…}} pravi planove sadnje, nivelacije i navodnjavanja sa njihovim legendama, i list detalja sa presecima zidova, slojevima popločavanja i stepenicama, kao jedan PDF. Pogledajte [Listovi za pejzaž](topic:landscape-sheets).
- **Slobodni objekti.** Više › {{ui:Slobodan objekat…}} postavlja mrežu iz STL, OBJ ili stavke iz biblioteke napravljenu u drugoj aplikaciji, na primer saksiju ili skulpturu. Stoji na terenu ili se useca u njega, a njena zapremina, površina i otisak se broje. Pogledajte [Slobodni objekti](topic:freeform-objects).
- **IFC za pejzaž.** Više › {{ui:Izvezi IFC za uređenje}} čuva biljke (kao vegetaciju sa njihovim svojstvima), tvrdo uređenje i slobodne objekte kao IFC 4.3 za BIM model. Pogledajte [IFC](topic:planting#ifc).
- **Od početka do kraja.** [Projektujte baštu od početka do kraja](topic:landscape-walkthrough) prolazi kroz ceo radni prostor na primeru lokacije.

### Radni prostor za dalekovode

- **Nadzemni vodovi i podzemni kablovi na vašoj lokaciji.** {{ui:Površ}} › {{ui:Više}} › {{ui:Radni prostor za dalekovode}}: nacrtajte vod preko njegovih stubova, kablove u rovovima, opremu i prepreke, na istom terenu i u istoj datoteci projekta. Pogledajte [Radni prostor za dalekovode](topic:power-lines).
- **Sopstvene biblioteke.** Provodnici, kablovi, stubovi, oprema (poprečnjače, izolatori, pribor, zatege, transformatori, ormarići, spojnice) i tipovi rovova, u kategorijama koje sami imenujete, dele se kao datoteka ili tabela. Nijedan katalog neke države ili proizvođača nije ugrađen; primeri kažu da su primeri. Pogledajte [Vaša biblioteka za dalekovode](topic:power-line-library).
- **Provesa i zatezanje pod vašim opterećenjima.** Temperatura, vetar, led i led na jednoj strani; granice zatezanja kao deo prekidne čvrstoće; tačna lančanica na svakom rasponu, uključujući nagibe; tabele razvlačenja. Pogledajte [Provesa i zatezanje](topic:sag-and-tension).
- **Provere, uvek ažurne.** Razmak od terena i prepreka, razmak faza, njihanje izolatora, podizna sila, opterećenja stubova sa dimenzionisanjem iz vaše biblioteke, zatege, pribor, temelji, nedostajući podaci, nepovezani kablovi, preopterećenja i pad napona, označeni na planu i na profilu voda. Pomoćni alat za projektovanje: proverava inženjer. Pogledajte [Provere dalekovoda](topic:power-line-checks).
- **Tabele, listovi i GIS.** Tabele razvlačenja i stubova, količine (CSV, Excel, TakeoffCraft), listovi plana i profila sa izveštajem o studiji u jednom PDF-u, GIS slojevi sa podacima svakog sredstva. Pogledajte [Tabele, količine, listovi i GIS za dalekovode](topic:power-line-outputs).
- **Posle prvih pokušaja.** Profil voda prati vod koji izaberete, ima listu **Vod**, čita teren, provodnik i razmak ispod pokazivača i meri između dve tačke. Biljke i zidovi pejzaža se računaju kao prepreke ispod vodova; trase kablova i cevi se prikazuju na profilu voda i ukrštaju se sa pravilom razmaka koje izaberete; **Pravila…** pored svakog razmaka otvara vaša pravila, a skupovi pravila sa bibliotekom čuvaju se kao paketi za deljenje po državi. Pogledajte [Provere dalekovoda](topic:power-line-checks) i [Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Vaši formati datoteka.** Dalekovodi se čuvaju u datoteci projekta CivilCraft-a, biblioteke u `.cclines.json` ili CSV, skupovi pravila i paketi u sopstvenim JSON datotekama: otvoreni formati koje svako može da pročita ili pretvori. Datoteka `.DON` je dodatni uvoz i izvoz uz njih.
- **Studijske datoteke (.DON), neispitano.** Sačuvajte vod kao studijsku datoteku `.DON` za drugi program za vodove, ili pročitajte njene stubove; napravljeno je prema nazivima polja formata, još nije ispitano sa tim programom. Pogledajte [Studijske datoteke](topic:power-line-study-file).

### Merenje

- **Alat za merenje.** {{ui:Površ}} › {{ui:Više}} › {{ui:Izmeri}} (ili {{key:M}}) meri na planu: dužinu i pravac svake strane, tekući zbir, dužinu duž terena i nagib, a površinu i obim kada zatvorite oblik. Ništa se ne crta u projekat. Pogledajte [Merenje](topic:measure).

### Građevinske mase

- **Crtanje građevinskih masa.** U Svojstvima, pod **Građevinske mase**, {{ui:Nacrtaj masu}} (takođe {{ui:Površ}} › {{ui:Više}} › {{ui:Mase}}). Dajte masi spratove i visinu sprata i pročitajte njenu bruto površinu. Izaberite kako sedi na nagnutom terenu (stepenasto, podijum ili iskop) i vidite nasip i iskop. Mase se prikazuju na planu, u PDF-u, a u DWG i DXF na sopstvenim slojevima. Pogledajte [Crtanje građevinskih masa na lokaciji](topic:building-masses).
- **Guranje i vučenje u 3D.** U 3D prikazu prevucite krov izabrane mase, ili pritisnite {{key:PageUp}} i {{key:PageDown}}, da ga menjate sprat po sprat, u jednom koraku opozivanja. **Sunce** baca senke masa. Pogledajte [U 3D prikazu](topic:building-masses#in-the-3d-view).
- **Ograničenja zoniranja koja upisujete.** Povlačenja red po red od linije ulice, ograničenje visine, ravan izloženosti nebu, koeficijent iskorišćenosti i koeficijent izgrađenosti. Gradivi omotač se crta na planu, a svaka masa dobija štiklu ili krst za svako ograničenje. CivilCraft nema nikakav pravilnik o zoniranju u sebi: svaki broj je onaj koji upišete iz sopstvene odluke. Pogledajte [Provera masa prema ograničenjima zoniranja koja upisujete](topic:zoning-limits).
- **Sati sunca.** Izaberite dan ili godišnje doba, i zonu po nazivu ili pomeraju, i pročitajte sate direktnog sunca na svakom zidu svake mase, sprat po sprat, i na terenu oko njih, nacrtano na planu. Sačuvajte zidove i teren kao CSV. Projekat treba da ima koordinatni sistem. Pogledajte [Računanje sati sunca na lokaciji](topic:sun-hours).
- **Mase kao IFC, i dalje u BimCraft.** {{ui:Mase kao IFC}} čuva mase kao IFC4, postavljene na mapu kada projekat ima koordinatni sistem. {{ui:Razvij u BimCraft-u}} otvara BimCraft u novoj kartici sa masama, gde **Razvij ovu masu** pravi zidove na svakom nivou i pod od otiska. Ništa se ne otprema. Pogledajte [Dalje slanje](topic:building-masses#send-it-on).

### Trase

- **Klotoidne spirale.** Upišite dužinu u **Spirala ulaz** i **Spirala izlaz** u tabeli PI-jeva za krivinu: tangenta, spirala, krivina, spirala, tangenta, sa jednakim ili različitim dužinama. Plan označava TS, SC, CS i ST, lista krivina daje θs i spoljašnje i tangentne dužine, a stacionaže i odstupanja prolaze kroz spirale. Pogledajte [Spirale](topic:alignment#spirals).
- **Spirale u LandXML-u.** LandXML piše i čita klotoidne spirale. Trase sa spiralama, koje je CivilCraft ranije preskakao pri uvozu, sada se otvaraju. Pogledajte [Razmena LandXML](topic:landxml).

### Koridori

- **Gradnja svake strane od delova.** Uključite **Gradi svaku stranu od delova** da svaka strana dobije sopstvenu listu od centralne linije navzad: trake, bankinu, slivnik, ivičnjak, zelenu traku, trotoar i kosinu sa sopstvenim iskopom i nasipom. Počnite od {{ui:Seoski put}} ili {{ui:Gradska ulica}} i kopirajte jednu stranu na drugu. Poprečni preseci označavaju liniju toka, ivičnjak i trotoar, a projektovana površ ima ivičnjak. Pogledajte [Gradnja svake strane od delova](topic:corridor#build-each-side-from-parts).
- **Nadvišenje preko spirala.** Na krivini sa spiralama, nagib nadvišenja se prostire preko spirale: ravan poprečni nagib na TS, puno nadvišenje na SC. Pogledajte [Nadvišenje](topic:corridor#superelevation).

### Datoteke za 3D

- **Izvoz USD-a.** U 3D prikazu, {{ui:USD}} piše lokaciju kao `.usda`, `.usdc` ili `.usdz` u pravoj razmeri i na koordinatama projekta: površi, cevi i objekti kao mreže, linije, svaka trasa, i geodetske tačke sa svojim brojevima. Pogledajte [Izvoz 3D lokacije kao USD](topic:usd).

### AI asistenti

- **Više za asistente.** Kada su asistenti uključeni u {{ui:Podešavanja}} › {{ui:CivilCraft}}, asistent sada može i da čita parcele, iskop i nasip i profile, dodaje geodetske tačke, čuva projekat, izvozi LandXML, DWG i USD, i radi u fasciklama koje izaberete u CadCraft Studiu. Radni prostor za pejzažno uređenje dodaje alate za pronalaženje biljaka, postavljanje biljaka, gredica i živica, nivelaciju i proveru navodnjavanja. Server datoteka i komandna linija `cadcraft` otvaraju sačuvane projekte bez prozora. Pogledajte [Neka AI asistent radi sa vašom lokacijom](topic:assistants).

## U svim aplikacijama

- **Jedinice.** {{ui:Podešavanja}} › {{ui:Opšte}} › {{ui:Jedinice}} ima po jednu listu za dužinu, površinu, zapreminu, ugao i nagib, sa tačnim veličinama koje daju definicije jedinica (američka geodetska stopa je sopstvena jedinica). Isključite jedinice koje nikad ne koristite i one nestaju iz lista; označite jednu zvezdicom i novi rad počinje u njoj. Datoteka uvek zadržava sopstvenu jedinicu. U CivilCraft-u lista **Jedinice** projekta prati prekidače; zvezdica za metarsku dužinu pokreće nove projekte u metrima (inače u stopama, koje su američke geodetske stope), zvezdica za površinu ili zapreminu postavlja jedinicu u kojoj se površine i zapremine prijavljuju, a polje za dužinu prihvata oznaku bilo koje jedinice, na primer `3 ch` ili `450 mm`. Pogledajte [Jedinice, unete vrednosti i liste jedinica](common:unit-lists).
- **Gušći raspored i paneli koji se uredno sklanjaju.** {{ui:Podešavanja}} › {{ui:Opšte}} › {{ui:Gustina rasporeda}} › {{ui:Zbijeno}} stane više na ekran (ekrani osetljivi na dodir i telefoni zadržavaju velika dugmad). Svaki bočni panel ima tanku naslovnu traku: prevucite je da ga usidrite ili otkačite, spustite je na traku drugog panela da delite jedan okvir kao kartice, zakačite je da bi kliznula do ivice, ili je sakrijte i vratite je sa ivice. Pogledajte [Raspored panela](common:arrange-panels#make-the-layout-denser).
- **Dijalozi se pomeraju.** Prevucite dijalog za njegovu naslovnu traku van puta crtežu; vraća se tamo gde ste ga ostavili. Dvostruki klik na naslovnu traku ga ponovo centrira. Pogledajte [Pomeranje dijaloga](common:arrange-panels#move-a-dialog).
- **Recepti za AI asistente.** Deset primera zahteva za sopstvenog asistenta (srediti crtež, ispisati set, proveriti crteže, postaviti pitanje modelu, sabrati predmer, isprobati varijantu dela…), svaki sa alatima koje poziva i dozvolama koje su mu potrebne, i svaki ponovljen našim testovima. Aplikacije ne sadrže veštačku inteligenciju. Pogledajte [Recepti za AI asistente](common:assistants-recipes).
- **Jezici.** **Português (Portugal)** je nov u {{ui:Podešavanja}} › {{ui:Opšte}} › {{ui:Jezik}}. Taj, **Português (Brasil)**, **Español (México)** i **Bahasa Indonesia** sada imaju svaku reč aplikacija, kao nacrte koje izvorni govornik još nije pregledao. Teme pomoći su na engleskom, a neke na španskom.
- **CadCraft Studio** kaže zašto provera ažuriranja nije uspela (još nema datoteke za vaš sistem, nema mreže, loš potpis), umesto samo „Gotovo”, i prestaje da vraća karticu Šta je novo koju ste zatvorili dok ne stigne novije izdanje.

## Još nije u ovoj verziji

- **0.7 nije potpisan kodom.** Potpisivanje i paket za Microsoft Store prebačeni su na 0.8 jer validacija sertifikata još nije stigla. Proverite SHA-256 uz svaku datoteku na getcadcraft.com/download. Na Windows-u, ako SmartScreen zaustavi instalater, izaberite {{ui:Više informacija}}, pa {{ui:Ipak pokreni}}. Na Mac-u, prvi put, desnim klikom na CadCraft Studio izaberite {{ui:Otvori}}. CadCraft Studio još nije u prodavnici aplikacija, i još nema verzije za iPad ili iPhone.
- Liste uglova i nagiba u {{ui:Jedinice}} se čuvaju, ali ih još nijedno polje ne čita.
- Prskalice proizvođača: samo opšte prskalice i vaše sopstvene iz datoteke. Podaci proizvođača dolaze samo uz njihovu dozvolu, a nijedna dozvola još nije data.
- BimCraft i ModelCraft nose spisak biljaka, ali njihovo {{ui:Postavi iz biblioteke}} još ne nudi biljke. Biljke stižu u BimCraft preko IFC-a za pejzaž.
- Alati za pejzaž za asistente rade dok je prozor CivilCraft-a otvoren; server datoteka i komandna linija ih još nemaju.
- Građevinske mase: nema dnevne svetlosti na fasadi ni vetra, nema senke od drveća ni od bilo čega što nije nacrtano kao masa, nema oblika krova, a sati sunca se prikazuju na planu, ne u 3D prikazu. Razvij u BimCraft pravi obične zidove i pod, bez otvora i krova.
- Dalekovodi: nijedan državni standard nije ugrađen (vi postavljate opterećenja, granice i razmake); nema studija puzanja provodnika, termičke ocene zakopanih kablova, kratkog spoja, zaštite ili uzemljenja. Nema vodova u 3D prikazu ni u IFC-u. Datoteka `.DON` nije ispitana sa programom koji je čita.
- Spirale osim klotoide, spirala između dve krivine, i spirale u linijama oblika. Spirale su proverene prema formulama i LandXML šemi, još ne prema LandXML datoteci sa spiralama iz drugog programa.
- Šabloni koridora koji se menjaju duž puta, regioni i ciljevi za kosinu.
- Vodovodne mreže i mreže pod pritiskom (sledeći građevinski posao), tokovi koji se menjaju tokom vremena, i veze između vodovodne i kišne mreže.
- Lukovi u nacrtanim linijama loma. Standardne tabele projektnih vozila: pet vozila koja se isporučuju su označeni privremeni podaci. Linije oblika deljene između projekata čekaju timske projekte.

Sve ostalo je u [Još nije izgrađeno](topic:not-built-yet).
