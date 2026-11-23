---
title: Što je novo u 0.9 (ranije)
summary: Predlošci koridora i terena, hvatanja i gumbi Pick pri crtanju, GIS analiza s tablicom atributa, studije sjene, solarnog prinosa, udobnosti i vjetra za lokaciju, 3D prikaz Render te dodaci Oblaci točaka i WaterCraft.
keywords: što je novo 0.9, ranije izdanje, što je novo, 0.9, bilješke o izdanju, predlošci koridora, predlošci terena, urednik predložaka, tipični poprečni presjek, više koridora, hvatanje, hvatanja, pick, pomakni, kopiraj, zakreni, tangenta, render, 3d render, gis analiza, pufer, preklapanje, prostorno spajanje, tablica atributa, stiliziraj po atributu, studija sjene, solarni prinos, utci, toplinska udobnost, studija vjetra, openfoam, oblaci točaka, las, laz, watercraft, protupožarni protok, hidrant, starost vode, klor, potražnje, savjeti, raspored, oborina, bujica, ponderiranje, zemljani radovi, ravnoteža, prijevoz, najbolja trasa, najkraći put, trasa, retencija, ispust, pražnjenje, slobodna visina, napredak, izmjera, dron, odlagalište, adresa, parcela, tlo, poplava, nosivost pokosa, bishop, slijeganje, raskrižje, oznake, preglednost, izjednačenje, poligonski vlak, kop, radioveza, fresnel, skretnica, križna veza, izdanje, problemi, live, dwg
from: 4664522c
---

Ovo se promijenilo u CivilCraft 0.9 u odnosu na 0.8.1. CivilCraft 0.9 dio je CadCraft Studio 0.9 i njegovih osam aplikacija. Velike cjeline su predlošci koridora i terena, hvatanja pri crtanju, GIS analiza, studije sunca, solarnog prinosa, udobnosti i vjetra za lokaciju te dva dodatka: Oblaci točaka i WaterCraft.

## Novo

### Predlošci koridora i terena

- **Predlošci koridora.** Otvorite {{ui:Teren}} › {{ui:Više}} › {{ui:Predlošci koridora…}} (ili upišite {{cmd:TEMPLATES}}). Predložak je mali poprečni presjek sa sastavnim dijelovima, odmacima, nagibima, materijalima i kodovima točaka. Čuvajte ih u projektu, u {{ui:Moja knjižnica}} ili kao datoteku `.cctemplates.json`. Urednik predložaka prikazuje crtež u pravom mjerilu i navodi probleme dok tipkate.
- **Izrada iz predložaka po stacionaži.** Odaberite os trase i uključite {{ui:Izgradi iz predložaka po stacionaži}} u njezinim Svojstvima. Svaka strana svake regije ima vlastiti popis kolnika i vlastito završno stanje. {{ui:Dodaj koridor}} pod {{ui:Koridori na ovoj trasi}} stavlja više koridora na jednu os.
- **Predlošci terena.** {{ui:Teren}} › {{ui:Više}} › {{ui:Predlošci terena…}} (ili upišite {{cmd:TERRAINTEMPLATES}}) nanosi slojeve materijala, kao što su humus ili kolnik i podloga, na teren, s površinom i volumenom po sloju. Vidi [Predlošci koridora i predlošci terena](topic:corridor-templates).

### Crtanje

- **Hvatanja.** Alati Trasa, Plato, Parcela, Masa, Značajna linija, Mjeri, Granica i Slivno područje hvataju se na geodetske točke, PI-jeve, kutove, vrhove i građevine, s oznakom uz marker. Držite {{key:Alt}} za slobodnu točku.
- **Gumbi Pick, tangenta te pomakni, kopiraj, zakreni.** Kutovi platoa, parcele i značajne linije imaju upisna polja Istok i Sjever te gumb Pick s nišanom. Svojstva imaju i {{ui:Tangenta iz dviju točaka}} za trase te {{ui:Pomakni, kopiraj i zakreni}} za trase, platoe, parcele i značajne linije. Vidi [Crtanje s hvatanjima, odabranim kutovima te pomakni, kopiraj i zakreni](topic:draft-with-snaps).
- **Prikaz Render u 3D-u.** Gumb {{ui:Render}} na traci 3D-a crta zemljište prirodnim bojama, nebom, izmaglicom i mekim sjenama. Ne mijenja model. Izbornik {{ui:Sunce}} sada ima gumbe {{ui:Primijeni}} i {{ui:Zatvori}}. Vidi [Pregled lokacije u 3D-u](topic:site-3d).
- **Paneli se otvaraju jedan odjeljak po jedan.** Lijevi panel i panel Svojstva otvaraju jedan odjeljak i zatvaraju ostale, a kartice vrpce Krajobraz koje sadrže više alata su podijeljeni gumbi.

### GIS analiza

- **Analiza.** {{ui:Teren}} › {{ui:Više}} › {{ui:Analiza}} nudi pufer, preklapanje, prostorno spajanje, odabir po atributu ili obliku te mjerenje. Svaki alat stvara novi sloj u jednom koraku poništavanja.
- **Tablica atributa.** Izbornik s tri točke na sloju ima {{ui:Tablica atributa…}} i {{ui:Stiliziraj po atributu…}}. Vidi [Analiza GIS slojeva](topic:gis-analysis) i [Rad s tablicom atributa sloja](topic:gis-table).

### Lokacija: sunce, solar, udobnost i vjetar

- **Odjeljak Okoliš.** Odaberite masu: odjeljak {{ui:Okoliš}} nalazi se ispod {{ui:Sati sunca}} u njezinim Svojstvima. Ima studiju sjene (karta, tablica, animacija, CSV), solarni prinos iz datoteke vremenskih prilika za tipičnu godinu (.epw) i vanjsku toplinsku udobnost (UTCI).
- **Vjetar, samo grubi pregled.** {{ui:Pokreni studiju vjetra}} oboji teren od sjedenja do neugodnog za svaki smjer vjetra iz datoteke vremenskih prilika. Nije provjereno i panel to kaže.
- **Dodatak za vjetar na pješačkim površinama (OpenFOAM).** Isključen je dok ga ne uključite u {{ui:Postavke}} › {{ui:Dodaci}}. OpenFOAM je softver koji sami instalirate. Vidi [Sjena, solarni prinos i vanjska udobnost](topic:environment).

### Oblaci točaka (dodatak)

- Uključite {{ui:Oblaci točaka}} u {{ui:Postavke}} › {{ui:Dodaci}}; pojavljuje se kartica Oblaci točaka u desnom panelu. Otvorite LAS ili LAZ datoteku, očistite je, razvrstajte u tlo, vegetaciju i zgrade, izradite tlo, izohipse i volumene te izvezite LAS ili LAZ. Vidi [Oblaci točaka iz drona ili skenera](topic:point-clouds).

### WaterCraft (dodatak)

- Uključite {{ui:WaterCraft (distribucija vode)}} u {{ui:Postavke}} › {{ui:Dodaci}}; pojavljuje se kartica WaterCraft. Ima potražnje od korisnika, protupožarni protok na svakom hidrantu, koji ispad magistrale najviše važi, te starost vode i klor, a svaki se sprema kao CSV. Vidi [WaterCraft: potražnje, protupožarni protok, ispadi i starost vode](topic:watercraft).

### Zajednički rad

- U sesiji Live vidite međusobne kursore i imena u tlocrtu. Biljke iz knjižnice: CivilCraft Krajobraz kreće od zadane zbirke knjižnice, {{ui:CivilCraft krajobraz}}.

## U svim aplikacijama

- Savjeti se prikazuju kao Bootstrap tooltipovi, a početni savjet može se zatvoriti.
- Traka kartica panela koja ne stane pomiče se umjesto da bude odrezana.
- Naslovi kartica preglednika glase `<document> - CivilCraft | CadCraft`.
- {{ui:Postavke}} ima odjeljak Raspored, gdje su rasporedi padajući izbornik s izborima od dva retka.
- Jedinice težine i temperature su u {{ui:Postavke}} › {{ui:Globalne}} › {{ui:Jedinice}}.
- Popis jezika prikazuje jezike za koje build ima datoteke. Jezici osim engleskog su strojne radne verzije.

## Ispravljeno

- Dodaci za pretraživanje adrese i provjeru EnergyPlus nisu se mogli uključiti; sada mogu.
- Pomoć sada kaže da dodatak Oblaci točaka zapisuje očišćeni oblak kao LAS 1.4 ili LAZ.
- Klik na vlastitu ručku odabranog objekta više ne pokreće povlačenje ručke koje je prekidalo čekajući Pick.

## Poznata ograničenja

- Primjeri predložaka koridora su orijentacijski i ne temelje se ni na jednoj normi; inženjer ih mora provjeriti. Predlošci terena ne dodaju površinu i ne crtaju se u 3D-u ni u prikazu presjeka. Drugi koridor na osi nije u IFC izvozu. Između dva predloška po stacionaži nema prijelaza.
- Oblaci točaka testirani su na izmišljenim datotekama, a ne na stvarnom snimku drona. Čitaju se samo LAS i LAZ.
- GIS analiza testirana je na izmišljenim slojevima.
- Sjena, solarni prinos i udobnost su procjene za planiranje; vjetar je nepotvrđen grubi pregled. Ništa od toga nije projektna vrijednost.
- WaterCraft je pomoćno sredstvo za proračun provjereno na izmišljenim mrežama. Inženjer za vodu odlučuje što brojevi vrijede.
- Jezici osim engleskog su strojne radne verzije dok ih izvorni govornik ne pročita.
- Instalateri za Windows nisu potpisani kodom, a disk slika za macOS nije notarizirana.

## Ranije: 0.8 i 0.8.1

Ovo se promijenilo u CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02) u odnosu na 0.7. Velike nove cjeline su alati koji ispituju vaše planiranje i lokaciju (oborine, zemljani radovi, trase, retencije, napredak) te šest prozora za proračune za teren, ceste, izmjeru, rudnike, veze i željeznicu.

### Novo

**Ispitajte planiranje**

- **Pusti kišu.** {{ui:Pusti kišu…}} (pod {{ui:Teren}}) spušta oborinu na planirani teren. Gledate kako voda otječe s platoa, zadržava se u niskim kutovima i prelijeva retencije koje su premale. Pokretanje je animirano i daje volumene, najveći odljev i CSV svake retencije. Zadana ćelija je gruba da prvi pogled bude brz; finija ćelija je sporija. Retencije koje se prelijevaju pojavljuju se i u panelu Problemi.
- **Uravnoteživač zemljanih radova.** {{ui:Uravnoteživač zemljanih radova…}} podiže ili spušta plato dok iskop ne bude jednak nasipu i prikazuje tablicu prijevoza između njih.
- **Najbolja trasa.** {{ui:Najbolja trasa…}}: odaberete početak i kraj, a CivilCraft nalazi najjeftiniji put preko terena koji se drži vaših granica nagiba i zaobljenja, zatim iz toga stvara os.
- **Retencije.** {{ui:Retencije…}} računa stupanj i zapreminu iz vašeg terena, prima uređaje za ispust (otvor, preljev, V-usjek, prelivnik), provodi oborinu kroz retenciju i provjerava zadržani najveći protok, vrijeme pražnjenja i slobodnu visinu.
- **Napredak iz izmjera.** {{ui:Napredak iz izmjera…}} uspoređuje površine snimljene dronom ili skeniranjem s različitih datuma s terenom kakav je bio i s projektom: postotak dovršenosti po volumenu, područja prekopana i preniska, odlagališta te kada će radovi završiti pri ovom tempu (označeno kao procjena).

**Poznajte lokaciju**

- **Adresa do lokacije.** {{ui:Adresa do lokacije…}} slaže otvorene podatke o parceli, zgradi, zoniranju, tlu, poplavi i terenu na jednu lokaciju. Lokaciju možete zadržati u datoteci projekta: upisanu adresu, svaki izvor s danom preuzimanja i licencom te što je vraćeno. Ponovno otvorite ili podijelite projekt i lokacija je još tu, bez ponovnog preuzimanja. Također je možete spremiti kao datoteku lokacije ili poslati u BimCraft. Vidi [Adresa do lokacije](topic:address-to-site).

**Teren, ceste, izmjera, rudnici, veze i željeznica**

- **Tla i pokosi.** {{ui:Tla i pokosi…}} crta profil tla između bušotina koje upišete. Bishopova metoda zatim traži kritičnu kružnicu na vašem terenu, s razinom podzemne vode, dodatnim opterećenjem i koeficijentom potresa; slijeganje temelja uključuje konsolidaciju, trenutačno slijeganje i vrijeme.
- **Raskrižja i oznake.** {{ui:Raskrižja i oznake…}} spaja krakove sa zaobljenjima rubnjaka (jedan radijus po kraku ili trocentrična zaobljenja), preglednost za projektnu brzinu, provjeru trokuta preglednosti, pješačke prijelaze, stop crte, oznake i znakove s popisom znakova. Crtaju se u tlocrtu i spremaju kao .dxf s imenovanim slojevima.
- **Izjednačenje izmjere.** {{ui:Izjednačenje izmjere…}} provodi izjednačenje poligonskog vlaka ili mreže metodom najmanjih kvadrata: izjednačene koordinate, elipse pogrešaka, χ²-test i oznaku mjerenja koje se ne uklapa. Uključene su slobodne mreže, zatvaranje poligonskog vlaka pravilom kompasa i RW5, GSI, JobXML ili CSV terenske datoteke, a izjednačene točke spremaju se kao CSV.
- **Površinski kopovi.** {{ui:Površinski kopovi…}} pretvara uzorke bušotina u blok model i konačni kop unutar vašeg kuta pokosa, sa stupnjem jalovine, tablicom po etaži te krivuljom sadržaja i tonaže. Ugniježđeni kopovi po faktoru prihoda i raspored proizvodnje s diskontiranim novčanim tokom također su tu.
- **Radioveze.** {{ui:Radioveze…}} provjerava vidljivost linije preko vašeg terena uz zakrivljenost Zemlje, prvu Fresnelovu zonu, proračun veze, rezervu slabljenja i gubitak zbog višestrukih putanja te daje visinu jarbola koja bi očistila put. Također radi proračune gubitaka za optička vlakna, količine trase i vjetar na stupu.
- **Željezničke skretnice.** {{ui:Željezničke skretnice…}} pravi skretnicu iz broja srca, križne veze između paralelnih kolosijeka i gabarit građevine nagnut nadvišenjem i proširen na zavoju. Skretnica može stajati na stacionaži osi.

Vidi [Tla, raskrižja, izjednačenje izmjere, kopovi, radioveze i skretnice](topic:soils-roads-survey-mines-links).

### U svim aplikacijama

- **Jezici.** 54 jezika, deset od njih novih. Jezici osim engleskog su strojne radne verzije dok ih izvorni govornik ne pročita. Pomoć je uglavnom još na engleskom.
- **Redci alatne trake.** {{ui:Postavke}} › {{ui:Općenito}} › {{ui:Redci alatne trake}}: Prelamaj (kao prije), 2 retka ili 1 redak. Vrpca CivilCraft-a prikazuje najkorišteniji alat velik, sljedeće male, a ostale iza strelice naziva grupe.
- **Ulazni uređaji.** Touchpad, olovka, 3D miš, kontroler i MIDI mogu upravljati aplikacijama.
- **Problemi.** Panel Problemi upozorava u svakoj aplikaciji, s provjerama koje čitaju pakete propisa.
- **Live.** Prikaz tko je gdje u sesiji Live.
- **Dodaci.** Popis dodataka, s dodacima za rasvjetu.
- **Povežite svoj AI.** Svaki asistent koji povežete može upravljati alatima CivilCraft-a. Dolazi s napomenom da povezivanje jednim klikom unutar CadCraft Studio i hostirani konektor još nisu spremni. Vidi [Pustite AI asistenta da radi s vašom lokacijom](topic:assistants).

### Ispravljeno u 0.8.1

- **Odjeljak klasa DWG-a.** Čitao se kao pogrešan tip (GitHub cadcraft#5). Ispravljeno u CivilCraftu zajedno s CadCraftom, BimCraftom, ModelCraftom i TakeoffCraftom.
- **Promjena jezika tijekom rada.** CadCraft Studio i paketirana izdanja mogu promijeniti jezik za vrijeme rada. Prije su bila samo na engleskom. Nije još testirano na svakoj platformi: javite nam ako se jezik ne promijeni.

### Još nije u ovoj verziji

- **Ovo su pomoćna sredstva za proračun.** Svaki rezultat u novim prozorima treba provjeru inženjera. Čvrstoće tla polaze od tipičnih vrijednosti za skupinu tla, a prozor to kaže.
- **Pusti kišu.** Pokretanje na uzorku lokacije može trajati više od dvije minute u pregledniku pri finoj ćeliji. Provjereno je na ručnim slučajevima i V-oblikovanom slivu, a još nije na stvarnoj uređenoj lokaciji.
- **Adresa do lokacije.** Čita otvorene datoteke podataka koje donesete i testirano je samo na našim vlastitim datotekama. Drveće nije izvor. Dohvaćanje izvora za vas čeka pravne odredbe o privatnosti.
- **Napredak iz izmjera.** Testirano samo na izmišljenim izmjerama. Napredak na listovima i oznakama (MarkupCraft) te usporedba skeniranja s modelom (BimCraft) nisu izrađeni.
- **Tla i pokosi.** Samo kružne plohe: bez klinastog ili blok traženja i bez pukotine od napetosti.
- **Raskrižja.** Jedan radijus po kraku, bez putanja kamiona, i još ne ulaze u koridor.
- **Terenske datoteke.** Čitači su napisani prema javnim opisima formata i isprobani na datotekama koje smo sami napravili. Trebaju nam stvarne datoteke instrumenata.
- **Veze i željeznica.** Radioveze: samo slabljenje u slobodnom prostoru i višestruke putanje (bez slabljenja kišom ni uzoraka antena), i nema željezničkog standarda: svako željezničko ograničenje je zadana vrijednost, s nacrtnim brojkama koje nijedan željeznički inženjer nije provjerio.
- **Windows i macOS.** 0.8 nije potpisan kodom. Windows može upozoriti, a macOS traži desni klik, pa Otvori.

Sve ostalo je u [Još nije izrađeno](topic:not-built-yet). Za raniju verziju vidi [Što je novo u 0.7](topic:whats-new-0-7).
