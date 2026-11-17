---
title: Šta je novo u 0.9
summary: Šabloni koridora i terena, hvatanje i dugmad Odaberi pri crtanju, GIS analiza sa tabelom atributa, sjena, solarni prinos, udobnost i studije vjetra za lokaciju, 3D prikaz Renderuj, te dodaci Oblaci tačaka i WaterCraft.
keywords: šta je novo, 0.9, bilješke o izdanju, šabloni koridora, šabloni terena, uređivač šablona, tipičan presjek, više koridora, hvatanje, hvataj, odaberi, pomjeri, kopiraj, rotiraj, tangenta, render, 3d render, gis analiza, bafer, preklapanje, prostorno spajanje, tabela atributa, oblikovanje po atributu, studija sjene, solarni prinos, utci, vanjska udobnost, studija vjetra, openfoam, oblaci tačaka, las, laz, watercraft, protok za gašenje požara, hidrant, starost vode, hlor, potrošnja, savjeti, raspored, šta je novo, šta je novo, bilješke o izdanju, dnevnik promjena, promjene, 0.8, 0.8.1, verzija, nove funkcije, kiša, oluja, ponding, prelivanje, zemljani radovi, balans, iskop i nasip, prevoz, najbolja trasa, najmanji trošak, trasa, retencioni bazen, ispust, pražnjenje, slobodna visina, napredak, snimanje, dron, deponija, adresa do lokacije, parcela, tlo, poplava, stabilnost nagiba, bishop, slijeganje, raskrsnica, oznake, znakovi, preglednost, izravnanje, poligon, otvoreni kop, blok model, radio veza, fresnel, skretnica, ukrštanje, jezici, problemi, live, dwg
from: d7ac5b14
---

Ovo je šta se promijenilo u CivilCraft 0.9 u odnosu na 0.8.1. CivilCraft 0.9 je dio CadCraft Studio 0.9 i njegovih osam aplikacija. Veliki dijelovi su šabloni koridora i terena, hvatanje dok crtate, GIS analiza, studije sunca, solarnog prinosa, udobnosti i vjetra za lokaciju, te dva dodatka: Oblaci tačaka i WaterCraft.

## Novo

### Šabloni koridora i terena

- **Šabloni koridora.** Otvorite {{ui:Površina}} › {{ui:Više}} › {{ui:Šabloni koridora…}} (ili upišite {{cmd:TEMPLATES}}). Šablon je mali poprečni presjek sa komponentama, odmacima, nagibima, materijalima i kodovima tačaka. Čuvajte ih u projektu, u {{ui:Moja biblioteka}} ili kao datoteku `.cctemplates.json`. Uređivač šablona prikazuje crtež u pravoj razmjeri i navodi probleme dok kucate.
- **Izgradnja iz šablona po stacionaži.** Izaberite trasu i uključite {{ui:Izgradi iz šablona po stacionaži}} u njenim Svojstvima. Svaka strana svake regije ima sopstvenu listu kolovoza i sopstveni završni uslov. {{ui:Dodaj koridor}} pod {{ui:Koridori na ovoj osi trase}} stavlja više koridora na jednu trasu.
- **Šabloni terena.** {{ui:Površina}} › {{ui:Više}} › {{ui:Šabloni terena…}} (ili upišite {{cmd:TERRAINTEMPLATES}}) nanosi slojevite materijale, poput humusa ili kolovoza i podloge, na teren, sa površinom i zapreminom po sloju. Vidi [Šabloni koridora i šabloni terena](topic:corridor-templates).

### Crtanje

- **Hvatanje.** Alati Trasa, Plato, Parcela, Masa, Linija obilježja, Mjerenje, Granica i Slivno područje hvataju se za tačke snimanja, PI tačke, uglove, vrhove i objekte, sa oznakom uz marker. Držite {{key:Alt}} za slobodnu tačku.
- **Dugmad Odaberi, tangenta, pomjeri, kopiraj, rotiraj.** Uglovi plata, parcele i linije obilježja imaju kućice za upis Istoka i Sjevera i dugme Odaberi sa nišanom. Svojstva imaju i {{ui:Tangenta iz dvije tačke}} za trase i {{ui:Pomjeri, kopiraj i rotiraj}} za trase, platoe, parcele i linije obilježja. Vidi [Crtanje sa hvatanjem, odabranim uglovima i pomjeranjem, kopiranjem i rotiranjem](topic:draft-with-snaps).
- **Prikaz Renderuj u 3D.** Dugme {{ui:Renderuj}} na 3D traci crta zemlju prirodnim bojama, nebo, maglu i meke sjene. Ne mijenja model. Meni {{ui:Sunce}} sada ima dugmad {{ui:Primijeni}} i {{ui:Zatvori}}. Vidi [Pogled na lokaciju u 3D](topic:site-3d).
- **Paneli se otvaraju po jedan odjeljak.** Lijevi panel i panel Svojstva otvaraju jedan odjeljak i zatvaraju ostale, a pojasevi Pejzaža sa više alata su podijeljena dugmad.

### GIS analiza

- **Analiziraj.** {{ui:Površina}} › {{ui:Više}} › {{ui:Analiziraj}} nudi bafer, preklapanje, prostorno spajanje, izbor po atributu ili obliku i mjerenje. Svaki alat pravi novi sloj u jednom koraku poništavanja.
- **Tabela atributa.** Meni sa tri tačke na sloju ima {{ui:Tabela atributa…}} i {{ui:Oblikuj po atributu…}}. Vidi [Analiza GIS slojeva](topic:gis-analysis) i [Rad sa tabelom atributa sloja](topic:gis-table).

### Lokacija: sunce, solar, udobnost i vjetar

- **Odjeljak Okruženje.** Izaberite masu: odjeljak {{ui:Okruženje}} stoji ispod {{ui:Sunčani sati}} u njenim Svojstvima. Ima studiju sjene (karta, tabela, animacija, CSV), solarni prinos iz datoteke vremena za tipičnu godinu (.epw) i vanjsku udobnost (UTCI).
- **Vjetar, samo za pregled.** {{ui:Pokreni studiju vjetra}} boji tlo od sjedenja do neudobnog za svaki smjer vjetra u datoteci vremena. Nije provjereno, a panel to kaže.
- **Pješački vjetar (OpenFOAM) dodatak.** Isključen dok ga ne uključite u {{ui:Postavke}} › {{ui:Dodaci}}. OpenFOAM je softver koji sami instalirate. Vidi [Sjena, solarni prinos i vanjska udobnost](topic:environment).

### Oblaci tačaka (dodatak)

- Uključite {{ui:Oblaci tačaka}} u {{ui:Postavke}} › {{ui:Dodaci}}; pojavljuje se kartica Oblaci tačaka u desnom panelu. Otvorite LAS ili LAZ datoteku, očistite je, razvrstajte u tlo, rastinje i zgrade, izgradite tlo, izohipse i zapremine, i izvezite LAS ili LAZ. Vidi [Oblaci tačaka sa drona ili skenera](topic:point-clouds).

### WaterCraft (dodatak)

- Uključite {{ui:WaterCraft (distribucija vode)}} u {{ui:Postavke}} › {{ui:Dodaci}}; pojavljuje se kartica WaterCraft. Ima potrošnju korisnika, protok za gašenje požara na svakom hidrantu, koji prekid cijevi najviše važi, te starost vode i hlor, svako spašeno kao CSV. Vidi [WaterCraft: potrošnja, protok za gašenje požara, prekidi i starost vode](topic:watercraft).

### Zajednički rad

- U sesiji Live vidite međusobne kursore i imena na planu. Biljke iz biblioteke: CivilCraft pejzaž polazi od svoje podrazumijevane zbirke biblioteke, {{ui:CivilCraft pejzaž}}.

## U svakoj aplikaciji

- Savjeti se prikazuju kao Bootstrap oblačići, a početni savjet može se zatvoriti.
- Traka kartica panela koja ne staje se pomjera umjesto da se odsiječe.
- Naslovi kartica preglednika glase `<document> - CivilCraft | CadCraft`.
- {{ui:Postavke}} ima odjeljak Raspored, gdje su rasporedi padajući spisak izbora od dva reda.
- Jedinice za težinu i temperaturu su u {{ui:Postavke}} › {{ui:Globalno}} › {{ui:Jedinice}}.
- Spisak jezika prikazuje jezike za koje build ima datoteke. Jezici osim engleskog su mašinski nacrti.

## Ispravljeno

- Provjera adresa i EnergyPlus dodaci nisu mogli da se uključe; sada mogu.
- Pomoć sada kaže da dodatak Oblaci tačaka piše očišćen oblak kao LAS 1.4 ili LAZ.
- Klik na sopstvenu ručku izabranog objekta više ne pokreće povlačenje ručke koje je zaustavljalo čekanje Odaberi.

## Iskreno o ograničenjima

- Primjeri šablona koridora su privremeni podaci bez standarda; inženjer ih mora provjeriti. Šabloni terena ne dodaju površinu i ne crtaju se u 3D ni u prikazu presjeka. Drugi koridor na trasi nije u IFC izvozu. Nema sužavanja između dva šablona po stacionaži.
- Oblaci tačaka su provjereni na izmišljenim datotekama, a ne na stvarnom snimanju dronom. Čitaju se samo LAS i LAZ.
- GIS analiza je provjerena na izmišljenim slojevima.
- Sjena, solar i udobnost su procjene za planiranje; vjetar je nepotvrđen pregled. Ništa od toga nije projektna vrijednost.
- WaterCraft je pomoćno sredstvo za proračun provjereno na izmišljenim mrežama. Inženjer za vodu odlučuje koliko su brojevi vrijedni.
- Jezici osim engleskog su mašinski nacrti dok ih ne pročita izvorni govornik.
- Instalateri za Windows nisu potpisani kodom, a disk slika za macOS nije notarizovana.

## Ranije: 0.8 i 0.8.1

Ovo je šta se promijenilo u CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02) u odnosu na 0.7. Veliki novi dijelovi su alati koji testiraju vaše nivelacije i lokaciju (kiša, zemljani radovi, trase, bazeni, napredak) i šest prozora za proračun za tlo, puteve, snimanje, rudnike, veze i željeznicu.

### Novo

**Testirajte nivelaciju**

- **Pusti kišu.** {{ui:Pusti kišu…}} (pod {{ui:Površina}}) pušta oluju na nivelisano tlo. Gledate kako voda otječe sa plata, zadržava se u niskim uglovima i preliva preko bazena koji su premali. Pokretanje je animirano i daje zapremine, najveći odliv i CSV svakog bazena. Zadana ćelija je gruba pa je prvi pogled brz; finija ćelija je sporija. Bazeni koji se prelijevaju pojavljuju se i u panelu Problemi.
- **Balans zemljanih radova.** {{ui:Balans zemljanih radova…}} podiže ili spušta plato dok iskop ne bude jednak nasipu, i prikazuje tabelu prenosa između njih.
- **Najbolja trasa.** {{ui:Najbolja trasa…}}: izaberite početak i kraj, a CivilCraft nalazi najjeftiniji put preko terena koji poštuje vaše granice nagiba i krivine, pa iz njega pravi trasu.
- **Retencioni bazeni.** {{ui:Retencioni bazeni…}} računa nivo i akumulaciju iz vašeg terena, prima uređaje za ispust (otvor, preliv, V-zarez, prelivnik), vodi oluju kroz bazen i provjerava zadržani najveći protok, vrijeme pražnjenja i slobodnu visinu.
- **Napredak iz snimanja.** {{ui:Napredak iz snimanja…}} upoređuje površine snimljene dronom ili skenerom iz različitih datuma sa tlom kakvo je bilo i sa projektom: procenat završenosti po zapremini, područja iskopana preko mjere i nasuta preko mjere, deponije i kada će radovi završiti ovim tempom (označeno kao procjena).

**Upoznajte lokaciju**

- **Adresa do lokacije.** {{ui:Adresa do lokacije…}} spaja otvorene podatke o parceli, zgradi, zoniranju, tlu, poplavama i terenu na jednoj lokaciji. Lokaciju možete čuvati u datoteci projekta: upisanu adresu, svaki izvor sa danom kad ste ga preuzeli i njegovom licencom, i šta je vraćeno. Ponovo otvorite ili podijelite projekat i lokacija je još tu, bez ponovnog preuzimanja. Možete je spasiti i kao datoteku lokacije ili poslati u BimCraft. Vidi [Adresa do lokacije](topic:address-to-site).

**Tlo, putevi, snimanje, rudnici, veze i željeznica**

- **Tla i nagibi.** {{ui:Tla i nagibi…}} crta profil tla između bušotina koje upišete. Bishopova metoda zatim traži kritični krug na vašem terenu, sa nivoom podzemne vode, dodatnim opterećenjem i koeficijentom zemljotresa; slijeganje temelja uključuje konsolidaciju, trenutno slijeganje i vrijeme.
- **Raskrsnice i oznake.** {{ui:Raskrsnice i oznake…}} spaja krakove sa zaobljenjima ivičnjaka (jedan radijus po kraku ili tročlana zaobljenja), preglednost za projektnu brzinu, provjeru trouglova preglednosti, pješačke prelaze, linije zaustavljanja, oznake i znakove sa spiskom znakova. Crtaju se na planu i spašavaju kao .dxf sa imenovanim slojevima.
- **Izravnanje mreže.** {{ui:Izravnanje mreže…}} izvodi izravnanje poligonskog vlaka ili mreže metodom najmanjih kvadrata: izravnane koordinate, elipse grešaka, hi-kvadrat test i oznaku na mjerenju koje se ne uklapa. Slobodne mreže, zatvaranje poligona kompasnim pravilom i RW5, GSI, JobXML ili CSV terenske datoteke su uključeni, a izravnane tačke se spašavaju kao CSV.
- **Otvoreni kopovi.** {{ui:Otvoreni kopovi…}} pretvara uzorke bušenja u blok model i konačnu jamu unutar vašeg ugla nagiba, sa odnosom jalovine, tabelom po etaži i krivom razreda i tonaže. Ugniježđene jame po faktoru prihoda i plan proizvodnje sa diskontovanim novčanim tokom su također uključeni.
- **Radio veze.** {{ui:Radio veze…}} provjerava vidljivost preko vašeg terena uz izbočenje Zemlje, prvu Fresnelovu zonu, budžet veze, rezervu zamiranja i izlaz zbog višestruke putanje, i daje visinu jarbola koja bi očistila putanju. Radi i budžete gubitaka optičkih vlakana, količine trase i vjetar na tornju.
- **Skretnice željeznice.** {{ui:Skretnice željeznice…}} pravi skretnicu prema broju srca, ukrštanja između paralelnih kolosijeka i konstrukcijski gabarit nagnut nagibom i proširen u krivini. Skretnica može stajati na stacionaži trase.

Vidi [Tla, raskrsnice, snimanje, rudnici, veze i željeznica](topic:soils-roads-survey-mines-links).

### U svakoj aplikaciji

- **Jezici.** 54 jezika, deset novih. Jezici osim engleskog su mašinski nacrti dok ih ne pročita izvorni govornik. Teme pomoći su još uglavnom na engleskom.
- **Redovi alatne trake.** {{ui:Postavke}} › {{ui:Opšte}} › {{ui:Redovi alatne trake}}: Prelamanje (kao ranije), 2 reda ili 1 red. Traka CivilCraft prikazuje najkorišćeniji alat velikim, sljedeće malim, a ostale iza strelice naziva grupe.
- **Ulazni uređaji.** Touchpad, olovka, 3D miš, kontroler i MIDI mogu upravljati aplikacijama.
- **Problemi.** Panel Problemi koji upozorava u svakoj aplikaciji, sa provjerama koje čitaju pravila propisa.
- **Live.** Prikaz ko je gdje u sesiji Live.
- **Dodaci.** Spisak dodataka, sa dodacima za osvjetljenje.
- **Povežite svog AI.** Svaki asistent koji povežete može upravljati alatima CivilCraft. Dolazi sa napomenom da povezivanje jednim klikom unutar CadCraft Studio i hostovani konektor još nisu spremni. Vidi [Neka AI asistent radi sa vašom lokacijom](topic:assistants).

### Ispravljeno u 0.8.1

- **Odjeljak klasa DWG.** Čitao se kao pogrešan tip (GitHub cadcraft#5). Ispravljeno u CivilCraft zajedno sa CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Promjena jezika dok radi.** CadCraft Studio i spakovana izdanja mogu da promijene jezik tokom rada. Prije su bila samo na engleskom. Još nije provjereno na svakoj platformi: javite nam ako se jezik ne promijeni.

### Nije još u ovoj verziji

- **Ovo su pomoćna sredstva za proračun.** Svaki rezultat u novim prozorima treba provjeru inženjera. Čvrstoće tla počinju od tipičnih vrijednosti za grupu tla, i prozor to kaže.
- **Pusti kišu.** Pokretanje na primjeru lokacije može trajati više od dvije minute u pregledaču pri finoj ćeliji. Provjereno je na ručnim slučajevima i V-oblik slivnom području, ali još ne na stvarnoj nivelisanoj lokaciji.
- **Adresa do lokacije.** Čita otvorene datoteke podataka koje donesete, i testirano je samo na našim datotekama. Drveće nije izvor. Preuzimanje izvora za vas čeka pravila o privatnosti.
- **Napredak iz snimanja.** Testirano samo na izmišljenim snimanjima. Napredak na listovima i oznakama (MarkupCraft) i poređenje skena sa modelom (BimCraft) nisu izgrađeni.
- **Tla i nagibi.** Samo kružne površine: nema klinastog ili blok pretraživanja i nema pukotine od zatezanja.
- **Raskrsnice.** Jedan radijus po kraku, nema putanja zamaha kamiona, i još ne ulaze u koridor.
- **Terenske datoteke.** Čitači su pisani prema javnim opisima formata i isprobani na datotekama koje smo napravili. Potrebne su stvarne datoteke instrumenata.
- **Veze i željeznica.** Radio veze: samo gubitak u slobodnom prostoru i višestruka putanja (bez gubitka usljed kiše ili dijagrama antena). Nema standarda za željeznicu: svaka granica za šine je privremeni podatak, sa nacrtima brojeva koje nijedan inženjer za željeznicu nije provjerio.
- **Windows i macOS.** 0.8 nije potpisan kodom. Windows može upozoriti, a macOS traži desni klik pa Otvori.

Sve ostalo je u [Još nije izgrađeno](topic:not-built-yet). Za raniju verziju vidi [Šta je novo u 0.7](topic:whats-new-0-7).
