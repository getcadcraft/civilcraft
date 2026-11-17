---
title: Novosti u verziji 0.9
summary: Predlošci koridora i terena, hvatanje i gumbi Odaberi pri crtanju, GIS analiza s tablicom atributa, sjena, solarni prinos, udobnost i studije vjetra za lokaciju, 3D prikaz Render te dodaci Oblaci točaka i WaterCraft.
keywords: novosti, 0.9, bilješke o izdanju, predlošci koridora, predlošci terena, urednik predložaka, tipični presjek, više koridora, hvatanje, odaberi, pomakni, kopiraj, zakreni, tangenta, render, 3D render, GIS analiza, puferiranje, prekrivanje, prostorno spajanje, tablica atributa, stiliziraj po atributu, studija sjene, solarni prinos, UTCI, udobnost na otvorenom, studija vjetra, OpenFOAM, oblaci točaka, las, laz, watercraft, protupožarni protok, hidrant, starost vode, klor, potrošnja, promjene, verzija, nove značajke, oluja, bilanca, iskop i nasip, transport, najbolja trasa, najmanji trošak, trasa, zadržavanje, ispust, pražnjenje, slobodna visina, napredak, izmjera, dron, deponija, adresa do lokacije, katastarska čestica, tlo, poplava, stabilnost pokosa, Bishop, slijeganje, raskrižje, oznake, znakovi, preglednost, izjednačenje, najmanji kvadrati, poligonski vlak, površinski kop, blok model, radio veza, Fresnel, skretnica, križna skretnica, jezici, problemi, live, dwg
from: d7ac5b14
---

Ovo je što se promijenilo u CivilCraftu 0.9 u odnosu na 0.8.1. CivilCraft 0.9 dio je CadCraft Studia 0.9 i njegovih osam aplikacija. Veliki dijelovi su predlošci koridora i terena, hvatanje pri crtanju, GIS analiza, studije sunca, solarnog prinosa, udobnosti i vjetra za lokaciju te dva dodatka: Oblaci točaka i WaterCraft.

## Novo

### Predlošci koridora i terena

- **Predlošci koridora.** Otvorite {{ui:Teren}} › {{ui:Više}} › {{ui:Predlošci koridora…}} (ili upišite {{cmd:TEMPLATES}}). Predložak je mali poprečni presjek s komponentama, odmacima, nagibima, materijalima i kodovima točaka. Držite ih u projektu, u {{ui:Moja knjižnica}} ili kao datoteku `.cctemplates.json`. Urednik predložaka prikazuje crtež u pravoj mjeri i popisuje probleme dok tipkate.
- **Izgradnja iz predložaka po stacionaži.** Odaberite trasu i uključite {{ui:Izgradi iz predložaka po stacionaži}} u njezinim Svojstvima. Svaka strana svake regije ima vlastiti popis kolnika i vlastito završno stanje. {{ui:Dodaj koridor}} pod {{ui:Koridori na ovoj trasi}} stavlja više koridora na jednu trasu.
- **Predlošci terena.** {{ui:Teren}} › {{ui:Više}} › {{ui:Predlošci terena…}} (ili upišite {{cmd:TERRAINTEMPLATES}}) nanosi slojevite materijale, kao što su humus ili kolnik i podloga, na teren, s površinom i volumenom po sloju. Vidi [Predlošci koridora i predlošci terena](topic:corridor-templates).

### Crtanje

- **Hvatanje.** Alati Trasa, Platforma, Katastarska čestica, Masa, Linija značajke, Mjeri, Granica i Slivno područje hvataju se na točke izmjere, točke PI, kutove, vrhove i građevine, uz oznaku kraj markera. Držite {{key:Alt}} za slobodnu točku.
- **Gumbi Odaberi, tangenta te pomakni, kopiraj, zakreni.** Kutovi platforme, katastarske čestice i linije značajke imaju upisana polja Istok i Sjever te gumb Odaberi s nišanom. Svojstva također imaju {{ui:Tangenta iz dviju točaka}} za trase i {{ui:Pomakni, kopiraj i zakreni}} za trase, platforme, katastarske čestice i linije značajki. Vidi [Crtanje s hvatanjem, odabranim kutovima te pomicanjem, kopiranjem i zakretanjem](topic:draft-with-snaps).
- **Prikaz Render u 3D-u.** Gumb {{ui:Render}} na 3D traci crta zemljište prirodnim bojama, nebo, maglu i meke sjene. Ne mijenja model. Izbornik {{ui:Sunce}} sada ima gumbe {{ui:Primijeni}} i {{ui:Zatvori}}. Vidi [Pregled lokacije u 3D-u](topic:site-3d).
- **Paneli se otvaraju po jedan odjeljak.** Lijevi panel i panel Svojstva otvaraju jedan odjeljak i zatvaraju ostale, a pločice vrpce Krajobraz koje sadrže više alata podijeljene su na gumbe s padajućim izbornikom.

### GIS analiza

- **Analiza.** {{ui:Teren}} › {{ui:Više}} › {{ui:Analiza}} nudi puferiranje, prekrivanje, prostorno spajanje, odabir po atributu ili obliku te mjerenje. Svaki alat pravi novi sloj u jednom koraku poništavanja.
- **Tablica atributa.** Izbornik s tri točke na sloju ima {{ui:Tablica atributa…}} i {{ui:Stiliziraj po atributu…}}. Vidi [Analiza GIS slojeva](topic:gis-analysis) i [Rad s tablicom atributa sloja](topic:gis-table).

### Lokacija: sunce, solarno, udobnost i vjetar

- **Odjeljak Okoliš.** Odaberite masu: odjeljak {{ui:Okoliš}} nalazi se ispod {{ui:Sati sunca}} u njezinim Svojstvima. Ima studiju sjene (karta, tablica, animacija, CSV), solarni prinos iz datoteke tipične godine vremenskih podataka (.epw) i vanjsku udobnost (UTCI).
- **Vjetar, samo za orijentacijski pregled.** {{ui:Pokreni studiju vjetra}} boji tlo od sjedenja do neugodnog za svaki smjer vjetra iz datoteke vremenskih podataka. Nije provjereno, a panel to i kaže.
- **Dodatak Pješački vjetar (OpenFOAM).** Isključen je dok ga ne uključite u {{ui:Postavke}} › {{ui:Dodaci}}. OpenFOAM je softver koji sami instalirate. Vidi [Sjena, solarni prinos i vanjska udobnost](topic:environment).

### Oblaci točaka (dodatak)

- Uključite {{ui:Oblaci točaka}} u {{ui:Postavke}} › {{ui:Dodaci}}; pojavit će se kartica Oblaci točaka u desnoj ploči. Otvorite datoteku LAS ili LAZ, očistite je, razvrstajte u tlo, vegetaciju i zgrade, izradite tlo, izohipse i volumene te izvezite LAS ili LAZ. Vidi [Oblaci točaka s drona ili skenera](topic:point-clouds).

### WaterCraft (dodatak)

- Uključite {{ui:WaterCraft (distribucija vode)}} u {{ui:Postavke}} › {{ui:Dodaci}}; pojavit će se kartica WaterCraft. Ima potrošnju korisnika, protupožarni protok na svakom hidrantu, koji prekid glavne cijevi je najvažniji te starost vode i klor, a svaki se sprema kao CSV. Vidi [WaterCraft: potrošnja, protupožarni protok, prekidi i starost vode](topic:watercraft).

### Zajednički rad

- U sesiji Live vidite međusobne kursore i imena u planu. Biljke iz knjižnice: CivilCraft krajobraz kreće iz svoje zadane zbirke knjižnice, {{ui:CivilCraft landscape}}.

## U svim aplikacijama

- Savjeti se prikazuju kao opisi alata, a početni savjet može se zatvoriti.
- Traka kartica panela koja ne staje pomiče se umjesto da se odsiječe.
- Naslovi kartica preglednika glase `<dokument> - CivilCraft | CadCraft`.
- {{ui:Postavke}} ima odjeljak Raspored, gdje su rasporedi padajući popis izbora u dva retka.
- Jedinice za težinu i temperaturu nalaze se u {{ui:Postavke}} › {{ui:Globalne}} › {{ui:Jedinice}}.
- Popis jezika prikazuje jezike za koje build ima datoteke. Jezici osim engleskog su strojne radne verzije.

## Ispravljeno

- Dodaci za provjeru adrese i EnergyPlus nisu se mogli uključiti; sada se mogu.
- Pomoć sada kaže da dodatak Oblaci točaka zapisuje očišćen oblak kao LAS 1.4 ili LAZ.
- Klik na vlastitu ručku odabranog objekta više ne pokreće povlačenje ručke koje je zaustavljalo čekajući Odaberi.

## Ograničenja

- Primjeri predložaka koridora su privremeni, bez standarda; inženjer ih mora provjeriti. Predlošci terena ne dodaju površinu i ne crtaju se u 3D-u niti u prikazu presjeka. Drugi koridor na trasi nije u IFC izvozu. Nema suženja između dvaju predložaka po stacionaži.
- Oblaci točaka ispitani su na izmišljenim datotekama, a ne na pravom snimanju dronom. Čitaju se samo LAS i LAZ.
- GIS analiza ispitana je na izmišljenim slojevima.
- Sjena, sunce i udobnost su procjene za planiranje; vjetar je neprovjereno orijentacijsko ispitivanje. Ništa od toga nije projektna vrijednost.
- WaterCraft je pomoćno sredstvo za izračun provjereno na izmišljenim mrežama. Vodoprivredni inženjer odlučuje koliko su brojke vrijedne.
- Jezici osim engleskog su strojne radne verzije dok ih izvorni govornik ne pročita.
- Windows instalacije nisu potpisane kodom, a slika diska za macOS nije notarizirana.

## Ranije: 0.8 i 0.8.1

Ovo je što se promijenilo u CivilCraftu 0.8 (2026-11-01) i 0.8.1 (2026-11-02) u odnosu na 0.7. Veliki novi dijelovi su alati koji ispituju vaše uređenje terena i lokaciju (kiša, zemljani radovi, trase, zadržavanja, napredak) te šest prozora za izračune za tlo, ceste, izmjere, rudnike, veze i željeznicu.

### Novo

**Ispitajte uređenje terena**

- **Pusti kišu.** {{ui:Pusti kišu…}} (pod {{ui:Teren}}) baca oluju na uređeni teren. Vidite kako voda otječe s platformi, zadržava se u niskim kutovima i prelijeva preko premalih zadržavanja. Izvođenje je animirano i daje volumene, najveći odljev i CSV svakog zadržavanja. Zadana ćelija je gruba pa je prvi pogled brz; finija ćelija je sporija. Zadržavanja koja se prelijevaju pojavljuju se i na ploči Problemi.
- **Uravnoteživač zemljanih radova.** {{ui:Uravnoteživač zemljanih radova…}} podiže ili spušta platformu dok iskop ne bude jednak nasipu i prikazuje tablicu transporta materijala između njih.
- **Najbolja trasa.** {{ui:Najbolja trasa…}}: odaberite početak i kraj, a CivilCraft nađe najjeftiniji put preko terena koji poštuje vaše granice nagiba i zakrivljenja, pa iz njega izradi trasu.
- **Retencije.** {{ui:Retencije…}} računa razinu i volumen zadržavanja iz vašeg terena, prima uređaje za ispust (otvor, preljev, V-usjek, preljevni kanal), provodi oluju kroz zadržavanje i provjerava zadržani najveći protok, vrijeme pražnjenja i slobodnu visinu.
- **Napredak iz izmjera.** {{ui:Napredak iz izmjera…}} uspoređuje površine dronova ili skeniranja iz različitih datuma s terenom kakav je bio i s projektom: postotak dovršenosti po volumenu, područja s prekomjernim iskopom i nasipom, deponije te kad će radovi završiti tempom koji je sada (označeno kao procjena).

**Upoznajte lokaciju**

- **Adresa do lokacije.** {{ui:Adresa do lokacije…}} slaže otvorene podatke o katastarskoj čestici, zgradi, zoniranju, tlu, poplavama i terenu na jednoj lokaciji. Lokaciju možete zadržati u datoteci projekta: upisanu adresu, svaki izvor s danom kad ste ga preuzeli i njegovom licencom te što je vraćeno. Ponovno otvorite ili podijelite projekt i lokacija je još tu, bez ponovnog preuzimanja. Možete je spremiti i kao datoteku lokacije ili poslati u BimCraft. Vidi [Adresa do lokacije](topic:address-to-site).

**Tlo, ceste, izmjera, rudnici, veze i željeznica**

- **Tla i pokosi.** {{ui:Tla i pokosi…}} crta profil tla između bušotina koje upišete. Bishopova metoda zatim traži kritičnu kružnicu na vašem terenu, s razinom podzemne vode, dodatnim opterećenjem i koeficijentom potresa; slijeganje temelja uključuje konsolidaciju, trenutačno slijeganje i vrijeme.
- **Raskrižja i oznake.** {{ui:Raskrižja i oznake…}} spaja krakove sa zaobljenjima rubnjaka (jedan radijus po kraku ili trocentrična zaobljenja), preglednost za projektnu brzinu, provjeru trokuta preglednosti, pješačke prijelaze, crte zaustavljanja, oznake i znakove s popisom znakova. Crtaju se na planu i spremaju kao .dxf s imenovanim slojevima.
- **Izjednačenje izmjere.** {{ui:Izjednačenje izmjere…}} izvodi izjednačenje poligonskog vlaka ili mreže metodom najmanjih kvadrata: izjednačene koordinate, elipse pogrešaka, test hi-kvadrat i oznaku na mjerenju koje se ne uklapa. Slobodne mreže, zatvaranje poligonskog vlaka Bowditchovim pravilom i RW5, datoteke terenskih mjerenja GSI, JobXML ili CSV uključene su, a izjednačene točke se spremaju kao CSV.
- **Površinski kopovi.** {{ui:Površinski kopovi…}} pretvara uzorke bušenja u blok model i konačni kop unutar vašeg kuta pokosa, s omjerom jalovine, tablicom po etaži i krivuljom sadržaja i tonaže. Ugniježđeni kopovi prema faktoru prihoda i raspored proizvodnje s diskontiranim novčanim tokom također su tu.
- **Radioveze.** {{ui:Radioveze…}} provjerava vidljivost preko vašeg terena uz zakrivljenje Zemlje, prvu Fresnelovu zonu, proračun veze, rezervu zamiranja i prekid zbog višestruke putanje te daje visinu jarbola koja bi očistila put. Radi i proračune gubitaka za optička vlakna, količine za trasu te vjetar na tornju.
- **Željezničke skretnice.** {{ui:Željezničke skretnice…}} izrađuje skretnicu iz broja srca, križne skretnice između paralelnih tračnica i profil slobodnog prostora nagnut nagibom i proširen u krivini. Skretnica može biti na stacionaži trase.

Vidi [Tla, raskrižja, izjednačenje izmjere, površinski kopovi, radioveze i skretnice](topic:soils-roads-survey-mines-links).

### U svim aplikacijama

- **Jezici.** 54 jezika, od kojih su deset novi. Jezici osim engleskog su strojne radne verzije dok ih izvorni govornik ne pročita. Teme pomoći su još uglavnom na engleskom.
- **Redci alatne trake.** {{ui:Postavke}} › {{ui:Općenito}} › {{ui:Redci alatne trake}}: Prelomi (kao prije), 2 retka ili 1 redak. Vrpca CivilCraftu prikazuje najkorišteniji alat velik, sljedeće male, a ostale iza strelice pored naziva grupe.
- **Ulazni uređaji.** Dodirna ploča, olovka, 3D miš, upravljač i MIDI mogu upravljati aplikacijama.
- **Problemi.** Ploča Problemi upozorava u svakoj aplikaciji, uz provjere koje čitaju pakete propisa.
- **Live.** Prikaz tko je gdje u sesiji Live.
- **Dodaci.** Popis dodataka, uz dodatke za rasvjetu.
- **Povežite svoj AI.** Svaki pomoćnik koji povežete može upravljati alatima CivilCraft. Uz to ide napomena da jednoklikovno povezivanje unutar CadCraft Studia i hostirani konektor još nisu spremni. Vidi [Neka AI pomoćnik radi s vašom lokacijom](topic:assistants).

### Ispravljeno u 0.8.1

- **Odjeljak klasa DWG.** Čitao se kao pogrešan tip (GitHub cadcraft#5). Ispravljeno u CivilCraftu zajedno s CadCraftom, BimCraftom, ModelCraftom i TakeoffCraftom.
- **Promjena jezika dok aplikacija radi.** CadCraft Studio i spakirana izdanja mogu promijeniti jezik za vrijeme rada. Prije su bila samo na engleskom. Još nije ispitano na svakoj platformi: javite nam ako se jezik ne mijenja.

### Još nije u ovoj verziji

- **Ovo su pomoćna sredstva za izračun.** Svaki rezultat u novim prozorima treba provjeru inženjera. Čvrstoće tla polaze od tipičnih vrijednosti za skupinu tla, a prozor to kaže.
- **Pusti kišu.** Pokretanje na primjeru lokacije može u pregledniku pri finoj ćeliji trajati više od dvije minute. Provjereno je na ručnim slučajevima i V-slivnom području, a još ne na stvarnoj uređenoj lokaciji.
- **Adresa do lokacije.** Čita otvorene datoteke podataka koje donesete i testirano je samo na našim datotekama. Drveće nije izvor. Preuzimanje izvora za vas čeka pravilo o privatnosti.
- **Napredak iz izmjera.** Testirano samo na izmišljenim izmjerama. Napredak na listovima i oznakama (MarkupCraft) te usporedba skeniranja s modelom (BimCraft) nisu izrađeni.
- **Tla i pokosi.** Samo kružne plohe: bez klinastog ili blokovskog traženja i bez pukotine od zatezanja.
- **Raskrižja.** Jedan radijus po kraku, nema putanja kamiona i još nisu u koridoru.
- **Terenske datoteke.** Čitači su napisani prema javnim opisima formata i isprobani na našim datotekama. Trebaju nam stvarne datoteke mjernih instrumenata.
- **Veze i željeznica.** Radioveze: samo slabljenje u slobodnom prostoru i višestruke putanje (bez gubitka od kiše i bez dijagrama antena), a nema željezničkog standarda: svako ograničenje željeznice je zamjenik, s radnim brojevima koje nijedan inženjer za željeznicu nije provjerio.
- **Windows i macOS.** 0.8 nije potpisan kodom. Windows može upozoriti, a macOS traži desni klik pa Otvori.

Sve ostalo je u [Još nije izrađeno](topic:not-built-yet). Za raniju verziju vidi [Novosti u verziji 0.7](topic:whats-new-0-7).
