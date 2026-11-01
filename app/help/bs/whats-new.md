---
title: Novosti u verziji 0.7
summary: CivilCraft 0.7 dodaje radni prostor za dalekovode (nadzemne vodove i podzemne kablove s vlastitim bibliotekama, provjesom i zatezanjem, provjerama razmaka i čvrstoće, tabelama zatezanja, količinama, listovima i GIS-om), radni prostor za pejzaž (popis biljaka, planove sadnje i spiskove, nivelaciju za pejzaž, popločavanje, zidove i stepenice, proračun navodnjavanja, listove za pejzaž i slobodne objekte), mase zgrada sa granicama zoniranja koje upisujete i satima sunca, klotoidne spirale, koridore građene od dijelova sa obje strane, izvoz USD-a i više alata za AI asistente.
keywords: novosti, šta je novo, napomene o izdanju, izmjene, promjene, 0.7, verzija, nove funkcije, pejzaž, radni prostor za pejzaž, popis biljaka, biljke, sadnja, gredica, živica, nivelacija, platforma, nasip, odvodni jarak, kota tačke, analiza nagiba, zadržavanje vode, tvrdo uređenje, popločavanje, staza, zid, ivičnjak, rampa, stepenice, navodnjavanje, prskalica, kap po kap, listovi za pejzaž, slobodan objekt, masa zgrade, masovanje, bruto površina, zoniranje, odmak, omotač, ravan neba, koeficijent iskorištenja, pokrivenost, sati sunca, sjenka, ifc, razvij u BimCraft-u, spirala, klotoida, prelaz, sklop, asistenti, jedinice, portugalski
from: 3c9d79db
---

Ovo su promjene u CivilCraft-u 0.7 u odnosu na 0.6. Najveći novi dijelovi su radni prostori za dalekovode i pejzaž, te mase zgrada.

## Novo

### Radni prostor za pejzaž

- **Radni prostor za pejzaž na istoj lokaciji.** {{ui:Površina}} › {{ui:Više}} › {{ui:Radni prostor za pejzaž}} dodaje alate za sadnju, nivelaciju, tvrdo uređenje i navodnjavanje na lokaciju koju već imate: iste tačke snimanja, površine i datoteku projekta. Odaberite **Civil** pod **Radni prostor** da se vratite. Pogledajte [Radni prostor za pejzaž](topic:landscape).
- **Popis biljaka.** Oko 420 uobičajenih umjerenih i mediteranskih stabala, grmova, živica, trava, trajnica, pokrivača tla i penjačica, sa njihovim veličinama pri sadnji i pri punoj zrelosti, zonom otpornosti, svjetlom, vodom i razmakom. Pretražujte po bilo kojem nazivu na engleskom, španskom ili portugalskom. Uvezite vlastiti popis kao CSV; čuva se uz projekat. Ugrađene veličine su tipične i zaokružene: provjerite ih u lokalnom rasadniku. Pogledajte [Popis biljaka](topic:plant-list).
- **Planovi sadnje.** {{ui:Biljka}} postavlja pojedinačne biljke koje stoje na terenu i prate kasniju nivelaciju, {{ui:Gredica}} popunjava obris na razmaku biljaka mješavinom po procentu, a {{ui:Živica}} postavlja jedan ili dva reda duž linije. Biljke su označene na planu. Pogledajte [Planovi sadnje i spiskovi](topic:planting).
- **Spisak biljaka.** Više › {{ui:Spisak biljaka…}} broji biljke po vrsti i veličini pri sadnji. Spasite ga kao CSV ili XLSX, ili ga pošaljite u TakeoffCraft radi određivanja cijena. Pogledajte [Spisak biljaka](topic:planting#the-plant-schedule).
- **Nivelacija za pejzaž.** {{ui:Nivelacija}} ima platforme (ravne ili opadajuće), nasipe, odvodne jarke i područja nivelacije s kotama tačaka i izohipsama koje prevlačite. Iskop i nasip se prikazuju dok radite. **Analiza nagiba** boji površinu prema vašim vlastitim dvjema granicama, a **Strelice toka i zadržavanje vode** pokazuju gdje voda teče i gdje bi se zadržala. Sve ide u istu projektovanu površinu kao platoi i koridori. Pogledajte [Nivelacija za pejzaž](topic:landscape-grading).
- **Popločavanje, staze, zidovi, ivičnjaci, rampe i stepenice.** {{ui:Tvrdo uređenje}} crta popločavanje s poprečnim padom ili padom prema slivniku, uzorak i njegove slojeve; staze koje prate teren; potporne i samostojeće zidove s stepenastim temeljima; ivičnjake; te rampe i stepenice provjerene prema granicama koje postavite. Potporni zid viši od 1.2 m (4 ft) označava se za inženjera. Pogledajte [Popločavanje, zidovi i stepenice](topic:hardscape).
- **Pomoćno sredstvo za proračun navodnjavanja.** {{ui:Navodnjavanje}} postavlja prskalice, bočne vodove, glavni vod, ventile, linije kap po kap i tačku priključka. {{ui:Provjeri sistem…}} pronalazi zone iz cijevi i računa protok svake zone, pritisak potreban na njenom ventilu i na dovodu (Hazen–Williams), padavine, vremena rada, pokrivenost i specifikaciju materijala. To je pomoćno sredstvo za proračun, a ne certifikacija projekta: projektant navodnjavanja provjerava svaki rezultat. Prskalice su generičke vrste ili vlastite iz datoteke. Pogledajte [Projektovanje navodnjavanja](topic:irrigation).
- **Listovi za pejzaž.** Više › {{ui:Listovi za pejzaž…}} pravi planove sadnje, nivelacije i navodnjavanja s njihovim legendama, te list detalja sa presjecima zidova, slojevima popločavanja i stepenicama, kao jedan PDF. Pogledajte [Listovi za pejzaž](topic:landscape-sheets).
- **Slobodni objekti.** Više › {{ui:Slobodan objekt…}} postavlja mrežu STL, OBJ ili stavke iz biblioteke napravljenu u drugoj aplikaciji, kao što je žardinjera ili skulptura. Stoji na terenu ili se useca u njega, a računaju se njegova zapremina, površina i tlocrtna površina. Pogledajte [Slobodni objekti](topic:freeform-objects).
- **IFC za pejzaž.** Više › {{ui:Izvezi pejzaž IFC}} sprema biljke (kao vegetaciju sa njihovim svojstvima), tvrdo uređenje i slobodne objekte kao IFC 4.3 za BIM model. Pogledajte [IFC](topic:planting#ifc).
- **Od početka do kraja.** [Projektovanje bašte, od početka do kraja](topic:landscape-walkthrough) prolazi kroz cijeli radni prostor na primjeru lokacije.

### Radni prostor za dalekovode

- **Nadzemni vodovi i podzemni kablovi na vašoj lokaciji.** {{ui:Površina}} › {{ui:Više}} › {{ui:Radni prostor za dalekovode}}: crtajte vod po njegovim stubovima, kablove u rovovima, opremu i prepreke, na istom terenu i u istoj datoteci projekta. Pogledajte [Radni prostor za dalekovode](topic:power-lines).
- **Vlastite biblioteke.** Provodnici, kablovi, nosači, oprema (poprečni nosači, izolatori, armature, zatege, transformatori, ormarići, spojnice) i tipovi rovova, u kategorijama koje imenujete, dijele se kao datoteka ili tabela. Nijedan katalog neke zemlje ili proizvođača nije ugrađen; primjeri su navedeni kao primjeri. Pogledajte [Vaša biblioteka dalekovoda](topic:power-line-library).
- **Provjes i zatezanje pod vašim slučajevima opterećenja.** Temperatura, vjetar, led i led na jednoj strani; granice zatezanja na dijelu prekidne čvrstoće; tačna lančanica na svakom rasponu, uključujući nagibe; tabele zatezanja. Pogledajte [Provjes i zatezanje](topic:sag-and-tension).
- **Provjere, uvijek ažurne.** Razmak iznad terena i prepreka, razmak faza, ljuljanje izolatora, podizanje, opterećenja nosača s dimenzionisanjem iz vaše biblioteke, zatege, armature, temelji, nedostajući podaci, nepovezani kablovi, preopterećenja i pad napona, označeni na planu i na profilu voda. Pomoćno sredstvo za projektovanje: inženjer ih provjerava. Pogledajte [Provjere dalekovoda](topic:power-line-checks).
- **Tabele, listovi i GIS.** Tabele zatezanja i nosača, količine (CSV, Excel, TakeoffCraft), listovi plana i profila sa izvještajem studije u jednom PDF-u, GIS slojevi sa podacima svakog sredstva. Pogledajte [Tabele, količine, listovi i GIS dalekovoda](topic:power-line-outputs).
- **Nakon prvih pokušaja.** Profil voda prati vod koji odaberete, ima listu **Vod**, čita teren, provodnik i razmak ispod pokazivača i mjeri između dvije tačke. Biljke i zidovi pejzaža se računaju kao prepreke ispod vodova; trase kablova i cijevi se prikazuju u profilu voda i ukrštaju se s pravilom razmaka koji odaberete; **Pravila…** pored svakog razmaka otvara vaša pravila; a skupovi pravila s bibliotekom spašavaju se kao paketi za dijeljenje po zemlji. Pogledajte [Provjere dalekovoda](topic:power-line-checks) i [Paketi](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Vaši formati datoteka.** Dalekovodi se spašavaju u datoteku projekta CivilCraft, biblioteke u `.cclines.json` ili CSV, skupovi pravila i paketi u vlastitim JSON datotekama: otvoreni formati koje svako može pročitati ili pretvoriti. Datoteka studije `.DON` je dodatni uvoz i izvoz pored njih.
- **Datoteke studije (.DON), neprovjerene.** Spasite vod kao datoteku studije `.DON` za drugi program za vodove, ili pročitajte njegove nosače; napravljeno iz naziva polja formata, još nije provjereno s tim programom. Pogledajte [Datoteke studije](topic:power-line-study-file).

### Mjerenje

- **Alat za mjerenje.** {{ui:Površina}} › {{ui:Više}} › {{ui:Izmjeri}} (ili {{key:M}}) mjeri na planu: dužinu i azimut svake strane, ukupan zbir, dužinu duž terena i nagib, te površinu i obim kada zatvorite oblik. Ništa se ne crta u projekat. Pogledajte [Mjerenje](topic:measure).

### Mase zgrada

- **Crtajte mase zgrada.** U Svojstvima, pod **Mase zgrada**, {{ui:Nacrtaj masu}} (takođe {{ui:Površina}} › {{ui:Više}} › {{ui:Mase}}). Zadajte masi broj etaža i visinu etaže i pročitajte njenu bruto površinu. Odaberite kako stoji na nagnutom terenu (stepenasto, na podiju ili usječeno) i pogledajte nasip i iskop. Mase se prikazuju na planu, u PDF-u, te u DWG i DXF na vlastitim slojevima. Pogledajte [Crtanje masa zgrada na lokaciji](topic:building-masses).
- **Guranje i vučenje u 3D.** U 3D prikazu prevucite krov odabrane mase ili pritisnite {{key:PageUp}} i {{key:PageDown}} da je mijenjate po jednu etažu, u jednom koraku poništavanja. **Sunce** baca sjenke masa. Pogledajte [U 3D prikazu](topic:building-masses#in-the-3d-view).
- **Granice zoniranja koje upisujete.** Odmaci liniju po liniju od ulične linije, ograničenje visine, ravan izloženosti neba, koeficijent iskorištenja i pokrivenost. Dozvoljeni omotač se crta na planu, a svaka masa dobija kvačicu ili križić za svaku granicu. CivilCraft nema u sebi zakon o zoniranju: svaki broj je onaj koji upišete iz vašeg vlastitog propisa. Pogledajte [Provjera masa prema granicama zoniranja koje upisujete](topic:zoning-limits).
- **Sati sunca.** Odaberite dan ili godišnje doba i vremensku zonu po nazivu ili pomaku, pa pročitajte sate direktnog sunca na svakom zidu svake mase, etažu po etažu, i na terenu oko njih, što se crta na planu. Spasite zidove i teren kao CSV. Projekat treba koordinatni sistem. Pogledajte [Proračun sati sunca na lokaciji](topic:sun-hours).
- **Mase kao IFC i dalje u BimCraft-u.** {{ui:Mase kao IFC}} sprema mase kao IFC4, postavljene na kartu kada projekat ima koordinatni sistem. {{ui:Razvij u BimCraft-u}} otvara BimCraft u novoj kartici s masama, gdje **Razvij ovu masu** pravi zidove na svakom nivou i pod iz tlocrta. Ništa se ne otprema. Pogledajte [Pošaljite dalje](topic:building-masses#send-it-on).

### Trase

- **Klotoidne spirale.** Upišite dužinu u **Spirala ulaz** i **Spirala izlaz** u tabeli PI za krivinu: tangenta, spirala, krivina, spirala, tangenta, s jednakim ili različitim dužinama. Plan označava TS, SC, CS i ST, lista krivina daje θs i tangentne i vanjske udaljenosti, a stacionaže i odmaci prolaze kroz spirale. Pogledajte [Spirale](topic:alignment#spirals).
- **Spirale u LandXML-u.** LandXML piše i čita klotoidne spirale. Trase sa spiralama, koje je CivilCraft ranije preskakao pri uvozu, sada se otvaraju. Pogledajte [Razmjena LandXML-a](topic:landxml).

### Koridori

- **Gradite svaku stranu od dijelova.** Uključite **Gradi svaku stranu od dijelova** da svaka strana dobije vlastitu listu od osovine prema van: trake, bankinu, slivnik, ivičnjak, pojas za sadnju, trotoar i bočni nagib sa vlastitim iskopom i nasipom. Počnite od {{ui:Seoski put}} ili {{ui:Gradska ulica}} i kopirajte jednu stranu na drugu. Poprečni presjeci obilježavaju liniju toka, ivičnjak i pješačku stazu, a nivelisana površina ima ivičnjak. Pogledajte [Gradnja svake strane od dijelova](topic:corridor#build-each-side-from-parts).
- **Nadvišenje preko spirala.** Na krivini sa spiralama, izlazak nadvišenja ide preko spirale: ravan poprečni nagib na TS, puno nadvišenje na SC. Pogledajte [Nadvišenje](topic:corridor#superelevation).

### 3D datoteke

- **Izvoz USD.** U 3D prikazu, {{ui:USD}} upisuje lokaciju kao `.usda`, `.usdc` ili `.usdz` u pravoj razmjeri i na koordinatama projekta: površine, cijevi i konstrukcije kao mreže, linije, svaka trasa, te tačke snimanja s njihovim brojevima. Pogledajte [Izvoz 3D lokacije kao USD](topic:usd).

### AI asistenti

- **Više za asistente.** Uz uključene asistente u {{ui:Postavke}} › {{ui:CivilCraft}}, asistent sada može i da čita parcele, iskop i nasip i profile, dodaje tačke snimanja, spašava projekat, izvozi LandXML, DWG i USD, te radi u folderima koje birete u CadCraft Studio. Radni prostor za pejzaž dodaje alate za pronalaženje biljaka, postavljanje biljaka, gredica i živica, nivelaciju i provjeru navodnjavanja. Server datoteka i komandna linija `cadcraft` otvaraju spašene projekte bez prozora. Pogledajte [Neka AI asistent radi s vašom lokacijom](topic:assistants).

## U svakoj aplikaciji

- **Jedinice.** {{ui:Postavke}} › {{ui:Opšte}} › {{ui:Jedinice}} ima po jednu listu za dužinu, površinu, zapreminu, ugao i nagib, s tačnim veličinama koje daju definicije jedinica (US stopa za premjer je zasebna jedinica). Isključite jedinice koje nikada ne koristite i one nestaju iz listi jedinica; označite jednu zvjezdicom i novi rad počinje u njoj. Datoteka uvijek zadržava svoju jedinicu. U CivilCraft-u lista **Jedinice** projekta prati prekidače; zvjezdica za metričku dužinu pokreće nove projekte u metrima (inače u stopama, to jest US stopama za premjer), zvjezdica za površinu ili zapreminu postavlja jedinice u kojima se površine i zapremine prijavljuju, a polje za dužinu prihvata oznaku bilo koje jedinice, kao što je `3 ch` ili `450 mm`. Pogledajte [Jedinice, uneseni brojevi i liste jedinica](common:unit-lists).
- **Gušći raspored i paneli koji se sklanjaju.** {{ui:Postavke}} › {{ui:Opšte}} › {{ui:Gustina rasporeda}} › {{ui:Zbijeno}} stane više na ekran (ekrani osjetljivi na dodir i telefoni zadržavaju velika dugmad). Svaki bočni panel ima tanku naslovnu traku: prevucite je da zakačite panel ili pustite da lebdi, spustite je na traku drugog panela da dijelite jedan okvir kao kartice, zakačite je da se sklanja do ivice, ili je sakrijte i vratite s ivice. Pogledajte [Raspored panela](common:arrange-panels#make-the-layout-denser).
- **Dijalozi se pomjeraju.** Prevucite dijalog za naslovnu traku izvan puta crteža; vraća se tamo gdje ste ga ostavili. Dvaput kliknite naslovnu traku da ga ponovo centrirate. Pogledajte [Pomjeranje dijaloga](common:arrange-panels#move-a-dialog).
- **Recepti za AI asistente.** Deset primjera zahtjeva za vašeg vlastitog asistenta (urediti crtež, iscrtati skup listova, provjeriti crteže, postaviti pitanje modelu, zbrojiti predmjer, isprobati varijantu dijela…), svaki sa alatima koje poziva i dozvolama koje treba, i svaki ponovljen našim testovima. Aplikacije ne sadrže AI. Pogledajte [Recepti za AI asistente](common:assistants-recipes).
- **Jezici.** **Português (Portugal)** je nov u {{ui:Postavke}} › {{ui:Opšte}} › {{ui:Jezik}}. Taj jezik, **Português (Brasil)**, **Español (México)** i **Bahasa Indonesia** sada imaju svaku riječ aplikacija, kao nacrte koje izvorni govornik još nije pregledao. Teme pomoći su na engleskom, uz nekoliko na španskom.
- **CadCraft Studio** kaže zašto provjera ažuriranja nije uspjela (još nema datoteke za vaš sistem, nema mreže, loš potpis) umjesto samo "Gotovo", i prestaje ponovo prikazivati karticu Novosti koju ste zatvorili dok ne bude novijeg izdanja.

## Još nije u ovoj verziji

- **0.7 nije potpisan kodom.** Potpisivanje i paket za Microsoft Store prebačeni su na 0.8 jer provjera certifikata još nije stigla. Provjerite SHA-256 pored svake datoteke na getcadcraft.com/download. Na Windows-u, ako SmartScreen zaustavi instalater, odaberite {{ui:Više informacija}}, pa {{ui:Ipak pokreni}}. Na Mac-u, prvi put, desni klik na CadCraft Studio i odaberite {{ui:Otvori}}. CadCraft Studio još nije u prodavnici aplikacija, i još nema verzije za iPad ili iPhone.
- Liste ugla i nagiba u {{ui:Jedinice}} se spašavaju, ali ih još nijedno polje ne čita.
- Prskalice proizvođača: samo generičke prskalice i vlastite iz datoteke. Podaci proizvođača dolaze samo uz njihovu dozvolu, a nijedna dozvola još nije data.
- BimCraft i ModelCraft nose popis biljaka, ali njihovo Postavi iz biblioteke još ne nudi biljke. Biljke stižu u BimCraft preko IFC-a za pejzaž.
- Alati za pejzaž za asistente rade dok je prozor CivilCraft-a otvoren; server datoteka i komandna linija ih još nemaju.
- Mase zgrada: nema dnevnog svjetla ili vjetra na fasadi, nema sjene od drveća ili bilo čega što nije nacrtano kao masa, nema oblika krova, a sati sunca se prikazuju na planu, ne u 3D prikazu. Razvij u BimCraft-u pravi obične zidove i pod, bez otvora ili krova.
- Dalekovodi: nije ugrađen standard nijedne zemlje (vi postavljate slučajeve opterećenja, granice i razmake); nema puzanja provodnika, termičkog kapaciteta ukopanih kablova, studija kratkog spoja, zaštite ili uzemljenja; nema vodova u 3D prikazu ili IFC-u. Datoteka studije `.DON` nije provjerena s programom koji je čita.
- Spirale osim klotoidnih, spirala između dvije krivine i spirale u linijama elemenata. Spirale su provjerene prema formulama i LandXML šemi, ali ne još prema LandXML datoteci sa spiralama iz drugog programa.
- Sklopovi koridora koji se mijenjaju duž puta, regije i ciljevi za bočni nagib.
- Vodovodne magistrale i mreže pod pritiskom (sljedeći građevinski posao), protoci koji se mijenjaju tokom vremena i veze između vodovodnih i kišnih mreža.
- Lukovi u nacrtanim prelomnim linijama. Standardne tabele projektnih vozila: pet vozila koja se isporučuju označena su kao privremena mjesta. Linije elemenata dijeljene između projekata čekaju timske projekte.

Sve ostalo je u [Još nije izrađeno](topic:not-built-yet).
