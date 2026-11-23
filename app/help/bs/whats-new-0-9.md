---
title: Novosti u 0.9 (ranije)
summary: Šabloni koridora i terena, hvatanja i dugmad za izbor pri crtanju, GIS analiza s tabelom atributa, sjena, solarni prinos, udobnost i studije vjetra za lokaciju, 3D prikaz za renderovanje, te dodaci Oblaci tačaka i WaterCraft.
keywords: novosti 0.9, raniji izdanje, novosti, 0.9, bilješke o izdanju, šabloni koridora, šabloni terena, uređivač šablona, tipičan presjek, više koridora, hvatanje, hvatanja, izbor, pomjeri, kopiraj, rotiraj, tangenta, renderovanje, 3d renderovanje, gis analiza, bafer, preklapanje, prostorno spajanje, tabela atributa, oblikuj po atributu, studija sjene, solarni prinos, utci, udobnost na otvorenom, studija vjetra, openfoam, oblaci tačaka, las, laz, watercraft, protok za gašenje požara, hidrant, starost vode, hlor, potrošnja, savjeti, raspored, novosti, promjene, dodatak, 0.8, 0.8.1, verzija, nove funkcije, kiša, oborinska, plavljenje, prelijevanje, zemljani radovi, ravnoteža, iskop i nasip, transport, najbolja trasa, najjeftinija trasa, osa trase, retencioni bazen, ispust, pražnjenje, slobodna visina, napredak, snimanje, dron, deponija, adresa do lokacije, parcela, tlo, poplava, stabilnost nagiba, bishop, slijeganje, raskrsnica, oznake na kolovozu, znakovi, preglednost, izravnanje mreže, najmanji kvadrati, poligonski vlak, otvoreni kop, blok model, radio veza, fresnel, skretnica, prelazni kolosijek, jezici, problemi, uživo, dwg
from: 4664522c
---

Ovo je šta se promijenilo u CivilCraft 0.9, u odnosu na 0.8.1. CivilCraft 0.9 je dio CadCraft Studio 0.9 i njegovih osam aplikacija. Glavni dijelovi su šabloni koridora i terena, hvatanja pri crtanju, GIS analiza, studije sunca na lokaciji, solarni prinos, udobnost i vjetar, te dva dodatka: Oblaci tačaka i WaterCraft.

## Novo

### Šabloni koridora i terena

- **Šabloni koridora.** Otvori {{ui:Površina}} › {{ui:Više}} › {{ui:Šabloni koridora…}} (ili upiši {{cmd:TEMPLATES}}). Šablon je mali poprečni presjek s komponentama, ofsetima, nagibima, materijalima i kodovima tačaka. Čuvaj ih u projektu, u {{ui:Moja biblioteka}} ili kao datoteku `.cctemplates.json`. Uređivač šablona prikazuje crtež u pravoj razmjeri i navodi probleme dok upisuješ.
- **Izgradnja iz šablona po stacionaži.** Odaberi osu trase i uključi {{ui:Izgradi iz šablona po stacionaži}} u njenim Svojstvima. Svaka strana svakog područja ima svoj spisak kolovoza i svoje stanje na kraju. {{ui:Dodaj koridor}} pod {{ui:Koridori na ovoj osi trase}} stavlja nekoliko koridora na jednu osu trase.
- **Šabloni terena.** {{ui:Površina}} › {{ui:Više}} › {{ui:Šabloni terena…}} (ili upiši {{cmd:TERRAINTEMPLATES}}) prekriva teren slojevitim materijalima kao što su humus ili kolovoz i nosivi sloj, s površinom i zapreminom po sloju. Pogledaj [Šabloni koridora i šabloni terena](topic:corridor-templates).

### Crtanje

- **Hvatanja.** Alati Os trase, Plato, Parcela, Masa, Linija obilježja, Mjerenje, Granica i Slivno područje hvataju se za tačke snimanja, PI, uglove, vrhove i konstrukcije, uz oznaku pored markera. Drži {{key:Alt}} za slobodnu tačku.
- **Dugmad za izbor, tangenta i pomjeranje, kopiranje, rotiranje.** Uglovi platoa, parcele i linije obilježja imaju upisana polja Istok i Sjever i dugme za izbor (nišan). Svojstva imaju i {{ui:Tangenta iz dvije tačke}} za osi trase i {{ui:Pomjeri, kopiraj i rotiraj}} za osi trase, plato, parcele i linije obilježja. Pogledaj [Crtanje s hvatanjima, izabranim uglovima i pomjeranjem, kopiranjem, rotiranjem](topic:draft-with-snaps).
- **Prikaz renderovanja u 3D.** Dugme {{ui:Renderuj}} na 3D traci crta zemljište prirodnim bojama, nebom, maglom i mekim sjenama. Ne mijenja model. Meni {{ui:Sunce}} sada ima dugmad {{ui:Primijeni}} i {{ui:Zatvori}}. Pogledaj [Pogledaj lokaciju u 3D](topic:site-3d).
- **Paneli se otvaraju jedan odjeljak u isto vrijeme.** Lijevi panel i panel Svojstva otvaraju jedan odjeljak i zatvaraju ostale, a pločice trake Pejzaž koje drže više alata su podijeljena dugmad.

### GIS analiza

- **Analiziraj.** {{ui:Površina}} › {{ui:Više}} › {{ui:Analiziraj}} nudi bafer, preklapanje, prostorno spajanje, odabir po atributu ili obliku, i mjerenje. Svaki alat pravi novi sloj u jednom koraku poništavanja.
- **Tabela atributa.** Meni sa tri tačke sloja ima {{ui:Tabela atributa…}} i {{ui:Oblikuj po atributu…}}. Pogledaj [Analiziraj GIS slojeve](topic:gis-analysis) i [Radi s tabelom atributa sloja](topic:gis-table).

### Lokacija: sunce, solarni prinos, udobnost i vjetar

- **Odjeljak Okruženje.** Odaberi masu: odjeljak {{ui:Okruženje}} stoji pod {{ui:Sunčani sati}} u njenim Svojstvima. Ima studiju sjene (karta, tabela, animacija, CSV), solarni prinos iz datoteke vremenskih prilika tipične godine (.epw) i udobnost na otvorenom (UTCI).
- **Vjetar, samo preliminarna procjena.** {{ui:Pokreni studiju vjetra}} boji teren od sjedenja do neudobnog za svaki smjer vjetra iz datoteke vremenskih prilika. Nije provjereno, a panel to kaže.
- **Dodatak za vjetar na pješačkim površinama (OpenFOAM).** Isključen dok ga ne uključiš u {{ui:Postavke}} › {{ui:Dodaci}}. OpenFOAM je softver koji sam instaliraš. Pogledaj [Sjena, solarni prinos i udobnost na otvorenom](topic:environment).

### Oblaci tačaka (dodatak)

- Uključi {{ui:Oblaci tačaka}} u {{ui:Postavke}} › {{ui:Dodaci}}; kartica Oblaci tačaka se pojavljuje u desnom panelu. Otvori LAS ili LAZ datoteku, očisti je, razvrstaj na teren, vegetaciju i zgrade, izradi teren, izohipse i zapremine, i izvezi LAS ili LAZ. Pogledaj [Oblaci tačaka iz drona ili skenera](topic:point-clouds).

### WaterCraft (dodatak)

- Uključi {{ui:WaterCraft (distribucija vode)}} u {{ui:Postavke}} › {{ui:Dodaci}}; pojavljuje se kartica WaterCraft. Ima potrošnju kupaca, protok za gašenje požara na svakom hidrantu, koji prekid magistrale najviše znači, te starost vode i hlor, svako sačuvano kao CSV. Pogledaj [WaterCraft: potrošnja, protok za gašenje požara, prekidi i starost vode](topic:watercraft).

### Zajednički rad

- U sesiji Live vidiš tuđe kursore i imena u planu. Biljke iz biblioteke: CivilCraft Pejzaž počinje od svoje podrazumijevane zbirke biblioteke, {{ui:CivilCraft pejzaž}}.

## U svakoj aplikaciji

- Savjeti se prikazuju kao Bootstrap tooltip-ovi, a početni savjet se može zatvoriti.
- Traka kartica panela koja ne stane se pomjera umjesto da se odsiječe.
- Naslovi kartica pregledača glase `<document> - CivilCraft | CadCraft`.
- {{ui:Postavke}} ima odjeljak Raspored, gdje su rasporedi padajuća lista izbora u dva reda.
- Jedinice težine i temperature su u {{ui:Postavke}} › {{ui:Globalno}} › {{ui:Jedinice}}.
- Spisak jezika pokazuje jezike za koje verzija ima datoteke. Jezici osim engleskog su nacrti mašinskog prevoda.

## Ispravljeno

- Dodaci za pretragu adrese i provjeru EnergyPlus nisu se mogli uključiti; sada mogu.
- Pomoć sada kaže da dodatak Oblaci tačaka piše očišćen oblak kao LAS 1.4 ili LAZ.
- Klik na sopstvenu hvataljku odabranog objekta više ne pokreće povlačenje hvataljke koje je zaustavljalo čekajući izbor.

## Iskreno o ograničenjima

- Primjeri šablona koridora su privremeni, bez standarda; inženjer ih mora provjeriti. Šabloni terena ne dodaju površinu i ne crtaju se u 3D ni u prikazu presjeka. Drugi koridor na osi trase nije u IFC izvozu. Između dva šablona po stacionaži nema sužavanja.
- Oblaci tačaka su provjereni na izmišljenim datotekama, a ne na stvarnom snimanju dronom. Čitaju se samo LAS i LAZ.
- GIS analiza je provjerena na izmišljenim slojevima.
- Sjena, solar i udobnost su procjene za planiranje; vjetar je neprovjerena preliminarna procjena. Ništa od toga nije projektna vrijednost.
- WaterCraft je pomoć pri proračunu provjerena na izmišljenim mrežama. Inženjer za vodu odlučuje koliko brojevi vrijede.
- Jezici osim engleskog su nacrti mašinskog prevoda.
- Instalateri za Windows nisu potpisani kodom, a disk slika za macOS nije notarizovana.

## Ranije: 0.8 i 0.8.1

Ovo je šta se promijenilo u CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02), u odnosu na 0.7. Veliki novi dijelovi su alati koji testiraju tvoju nivelaciju i lokaciju (kiša, zemljani radovi, trase, bazeni, napredak) i šest prozora za proračune za teren, puteve, snimanje, rudnike, veze i željeznicu.

### Novo

**Testiraj nivelaciju**

- **Neka pada kiša.** {{ui:Pusti kišu…}} (pod {{ui:Površina}}) pušta oluju na nivelisani teren. Gledaš kako voda otječe s platoa, zadržava se u niskim uglovima i prelijeva preko premalih bazena. Pokret je animiran i daje zapremine, vršni odliv i CSV svakog bazena. Podrazumijevana ćelija je gruba da prvi pogled bude brz; finija ćelija je sporija. Bazeni koji se prelivaju pojavljuju se i u panelu Problemi.
- **Balans zemljanih radova.** {{ui:Balans zemljanih radova…}} podiže ili spušta plato dok iskop ne bude jednak nasipu, i prikazuje tabelu transporta između njih.
- **Najbolja trasa.** {{ui:Najbolja trasa…}}: izaberi početak i kraj, a CivilCraft nalazi najjeftiniju putanju preko terena koja se drži tvojih granica nagiba i krivina, zatim od nje pravi osu trase.
- **Retencioni bazeni.** {{ui:Retencioni bazeni…}} računa nivo i akumulaciju iz tvog terena, uzima uređaje za ispust (otvor, preliv, V-zarez, brana), vodi oluju kroz bazen i provjerava zadržani vrh, vrijeme pražnjenja i slobodnu visinu.
- **Napredak iz snimanja.** {{ui:Napredak iz snimanja…}} upoređuje površine snimljene dronom ili skenerom s različitih datuma s terenom kakav je bio i s projektom: procenat završenosti po zapremini, prekopana i prenasuta područja, deponije i kada se radovi završavaju ovim tempom (označeno kao procjena).

**Upoznaj lokaciju**

- **Adresa do lokacije.** {{ui:Adresa do lokacije…}} slaže otvorene podatke o parcelama, zgradama, zoniranju, tlu, poplavama i terenu za jednu lokaciju. Lokaciju možeš čuvati u datoteci projekta: upisanu adresu, svaki izvor s datumom preuzimanja i licencom, te šta je vraćeno. Ponovo otvori ili podijeli projekat i lokacija je i dalje tu, bez ponovnog preuzimanja. Možeš je sačuvati i kao datoteku lokacije ili poslati u BimCraft. Pogledaj [Adresa do lokacije](topic:address-to-site).

**Teren, putevi, snimanje, rudnici, veze i željeznica**

- **Tla i nagibi.** {{ui:Tla i nagibi…}} crta profil tla između bušotina koje upišeš. Bishopova metoda zatim traži kritični krug na tvom terenu, s nivoom podzemne vode, dodatnim opterećenjem i koeficijentom zemljotresa; slijeganje temelja uključuje konsolidaciju, trenutno slijeganje i vrijeme.
- **Raskrsnice i oznake.** {{ui:Raskrsnice i oznake…}} spaja krakove sa zaobilaznim ivičnjacima (jedan poluprečnik po kraku, ili povratci s tri centra), preglednu daljinu za projektovanu brzinu, provjeru trouglova preglednosti, pješačke prelaze, linije zaustavljanja, oznake i znakove sa spiskom znakova. Crtaju se na planu i čuvaju kao .dxf sa imenovanim slojevima.
- **Izravnanje mreže.** {{ui:Izravnanje mreže…}} izvodi izravnanje poligonskog vlaka ili mreže po metodi najmanjih kvadrata: izravnate koordinate, elipse grešaka, hi-kvadrat test i oznaka na mjerenju koje se ne uklapa. Uključeni su slobodne mreže, zatvaranje poligonskog vlaka pravilom kompasa i terenske datoteke RW5, GSI, JobXML ili CSV, a izravnate tačke se čuvaju kao CSV.
- **Otvoreni kopovi.** {{ui:Otvoreni kopovi…}} pretvara uzorke bušenja u blok model i konačni kop unutar tvog ugla nagiba, sa odnosom skidanja, tabelom po etažama i krivom sadržaja i tonaže. Tu su i ugnježđeni kopovi po faktoru prihoda i plan proizvodnje sa diskontovanim novčanim tokom.
- **Radio veze.** {{ui:Radio veze…}} provjerava vidljivost preko tvog terena uz ispupčenje Zemlje, prvu Frenelovu zonu, budžet veze, marginu slabljenja i prekid od višestazne propagacije, i daje visinu jarbola koja bi očistila put. Radi i budžete gubitaka optičkih vlakana, količine trase i vjetar na stubu.
- **Željeznički skretnici.** {{ui:Željeznički skretnici…}} pravi skretnicu iz broja srca, prelazne kolosijeke između paralelnih koloseka i profil građevine nagnut nadvišenjem i proširen na krivini. Skretnica može biti na stacionaži osi trase.

Pogledaj [Tla, raskrsnice, izravnanje mreže, kopovi, radio veze i skretnice](topic:soils-roads-survey-mines-links).

### U svakoj aplikaciji

- **Jezici.** 54 jezika, od toga deset novih. Jezici osim engleskog su nacrti mašinskog prevoda dok ih ne pročita izvorni govornik. Teme pomoći su još uglavnom na engleskom.
- **Redovi alatne trake.** {{ui:Postavke}} › {{ui:Opšte}} › {{ui:Redovi alatne trake}}: Prelamanje (kao prije), 2 reda ili 1 red. Traka CivilCraft-a prikazuje najkorišćeniji alat velik, sljedeće male, a ostale iza strelice naziva grupe.
- **Ulazni uređaji.** Tačped, olovka, 3D miš, kontroler i MIDI mogu upravljati aplikacijama.
- **Problemi.** Panel Problemi upozorava u svakoj aplikaciji, s provjerama koje čitaju pakete propisa.
- **Uživo.** Prikaz ko je gdje u sesiji Live.
- **Dodaci.** Spisak dodataka, uključujući dodatke za osvjetljenje.
- **Poveži svoj AI.** Svaki asistent koji poveziš može upravljati alatima CivilCraft-a. Uz to ide napomena da povezivanje jednim klikom unutar CadCraft Studio i hostovani konektor još nisu spremni. Pogledaj [Neka AI asistent radi s tvojim gradilištem](topic:assistants).

### Ispravljeno u 0.8.1

- **Odjeljak DWG klase.** Bio je pročitan kao pogrešan tip (GitHub cadcraft#5). Ispravljeno u CivilCraft-u zajedno s CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Promjena jezika tokom rada.** CadCraft Studio i spakovana izdanja mogu mijenjati jezik za vrijeme rada. Prije su bila samo na engleskom. Još nije provjereno na svim platformama: javi nam ako se jezik ne promijeni.

### Još nije u ovoj verziji

- **Ovo su pomoći pri proračunu.** Svaki rezultat u novim prozorima treba provjeru inženjera. Čvrstoće tla počinju od tipičnih vrijednosti za grupu tla, a prozor to kaže.
- **Neka pada kiša.** Pokretanje na uzorku lokacije može trajati više od dvije minute u pregledaču pri finoj ćeliji. Provjereno je na ručnim slučajevima i V-slivu, ali još ne na stvarnoj nivelisanoj lokaciji.
- **Adresa do lokacije.** Čita otvorene datoteke podataka koje donosiš, i provjereno je samo na našim datotekama. Drveće nije izvor. Preuzimanje izvora za tebe čeka tekst o privatnosti.
- **Napredak iz snimanja.** Provjereno samo na izmišljenim snimanjima. Napredak na listovima i oznakama (MarkupCraft) i poređenje skena s modelom (BimCraft) nisu izrađeni.
- **Tla i nagibi.** Samo kružne površine: nema pretrage klina ili bloka i nema pukotine od zatezanja.
- **Raskrsnice.** Jedan poluprečnik po kraku, nema putanja kretanja kamiona, i još ne ulaze u koridor.
- **Terenske datoteke.** Čitači su napisani prema javnim opisima formata i isprobani na datotekama koje smo napravili. Potrebne su stvarne datoteke instrumenata.
- **Veze i željeznica.** Radio veze: samo slabljenje u slobodnom prostoru i višestazna propagacija (bez slabljenja od kiše i dijagrama antene), i nema standarda za željeznicu: svaka granica za željeznicu je privremena, s nacrtima brojeva koje nijedan inženjer za željeznicu nije provjerio.
- **Windows i macOS.** 0.8 nije potpisan kodom. Windows može upozoriti, a macOS traži desni klik pa Otvori.

Sve ostalo je u [Još nije izgrađeno](topic:not-built-yet). Za ranije izdanje pogledaj [Novosti u 0.7](topic:whats-new-0-7).
