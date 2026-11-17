---
title: Šta je novo u 0.9
summary: Šabloni koridora i terena, hvatanje i dugmad za izbor pri crtanju, GIS analiza sa tabelom atributa, senka, solarni prinos, udobnost i studije vetra za lokaciju, 3D prikaz sa renderovanjem, i dodaci Oblaci tačaka i WaterCraft.
keywords: šta je novo, 0.9, napomene uz izdanje, šabloni koridora, šabloni terena, urednik šablona, tipičan presek, više koridora, hvatanje, hvataj, izbor, pomeri, kopiraj, rotiraj, tangenta, renderuj, 3d render, gis analiza, bafer, preklapanje, prostorno spajanje, tabela atributa, stilizuj po atributu, studija senke, solarni prinos, utci, spoljašnja udobnost, studija vetra, openfoam, oblaci tačaka, las, laz, watercraft, protok za gašenje požara, hidrant, starost vode, hlor, potrošnja, opisi, raspored, šta je novo, napomene uz izdanje, promene, 0.8, 0.8.1, verzija, nove funkcije, kiša, kanalizacija, ponding, preliv, zemljani radovi, bilans, iskop i nasip, odvoz, najbolja trasa, najmanji trošak, osovina, retenciono jezero, ispust, pražnjenje, slobodna visina, napredak, premer, dron, deponija, adresa do lokacije, parcela, tlo, poplava, stabilnost kosine, bishop, slijeganje, čvorište, obeležavanje, znaci, preglednost, izravnanje, najmanji kvadrati, poligon, otvoreni kop, blok model, radio veza, fresnel, skretnica, ukrštanje, jezici, problemi, uživo, dwg
from: d7ac5b14
---

Ovo je šta se promenilo u CivilCraft 0.9 u odnosu na 0.8.1. CivilCraft 0.9 je deo CadCraft Studio 0.9 i njegovih osam aplikacija. Veliki delovi su šabloni koridora i terena, hvatanje pri crtanju, GIS analiza, studije sunca, solarnog prinosa, udobnosti i vetra za lokaciju, i dva dodatka: Oblaci tačaka i WaterCraft.

## Novo

### Šabloni koridora i terena

- **Šabloni koridora.** Otvorite {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (ili ukucajte {{cmd:TEMPLATES}}). Šablon je mali poprečni presek sa komponentama, odmacima, nagibima, materijalima i kodovima tačaka. Čuvajte ih u projektu, u {{ui:My library}} ili kao datoteku `.cctemplates.json`. Urednik šablona prikazuje crtež u pravoj razmeri i navodi probleme dok kucate.
- **Gradnja iz šablona po stacionaži.** Izaberite osovinu trase i uključite {{ui:Build from templates by station}} u njenim Svojstvima. Svaka strana svake regije ima sopstvenu listu kolovoza i sopstveni završni uslov. {{ui:Add a corridor}} pod {{ui:Corridors on this alignment}} stavlja više koridora na jednu osovinu trase.
- **Šabloni terena.** {{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (ili ukucajte {{cmd:TERRAINTEMPLATES}}) prevlači slojevite materijale, kao što su humus ili kolovoz i podloga, preko terena, sa površinom i zapreminom po sloju. Pogledajte [Šabloni koridora i šabloni terena](topic:corridor-templates).

### Crtanje

- **Hvatanje.** Alatke Alignment, Pad, Parcel, Mass, Feature line, Measure, Boundary i Catchment hvataju se za tačke premera, PI, uglove, temena i objekte, sa oznakom pored markera. Držite {{key:Alt}} za slobodnu tačku.
- **Dugmad za izbor, tangenta i pomeranje, kopiranje, rotiranje.** Uglovi plata, parcela i linija obeležja imaju polja za upis Easting i Northing i dugme za izbor sa ukrštenim kursorom. Svojstva imaju i {{ui:Tangent from two points}} za osovine trase i {{ui:Move, copy and rotate}} za osovine trase, platoe, parcele i linije obeležja. Pogledajte [Crtanje sa hvatanjem, izabranim uglovima i pomeranjem, kopiranjem i rotiranjem](topic:draft-with-snaps).
- **Prikaz renderovanja u 3D.** Dugme {{ui:Render}} na 3D traci crta zemljište prirodnim bojama, nebo, izmaglicu i meke senke. Ne menja model. Meni {{ui:Sun}} sada ima dugmad {{ui:Apply}} i {{ui:Close}}. Pogledajte [Prikaz lokacije u 3D](topic:site-3d).
- **Paneli se otvaraju po jedan odeljak.** Levi panel i panel Svojstva otvaraju jedan odeljak i zatvaraju ostale, a pločice Pejzaž trake koje sadrže više alatki su podeljena dugmad.

### GIS analiza

- **Analiza.** {{ui:Surface}} › {{ui:More}} › {{ui:Analyze}} nudi bafer, preklapanje, prostorno spajanje, izbor po atributu ili obliku, i merenje. Svaka alatka pravi nov sloj u jednom koraku opozivanja.
- **Tabela atributa.** Meni sa tri tačke na sloju ima {{ui:Attribute table…}} i {{ui:Style by attribute…}}. Pogledajte [Analiza GIS slojeva](topic:gis-analysis) i [Rad sa tabelom atributa sloja](topic:gis-table).

### Lokacija: sunce, solarna energija, udobnost i vetar

- **Odeljak za okolinu.** Izaberite masu: odeljak {{ui:Environment}} nalazi se ispod {{ui:Sun hours}} u njenim Svojstvima. Ima studiju senke (mapa, tabela, animacija, CSV), solarni prinos iz datoteke vremenskih prilika tipične godine (.epw) i spoljašnju udobnost (UTCI).
- **Vetar, samo za orijentaciju.** {{ui:Run wind study}} boji tlo od sedenja do neprijatnosti za svaki smer vetra iz datoteke vremenskih prilika. Nije proveren, a panel to kaže.
- **Dodatak Pešački vetar (OpenFOAM).** Isključen je dok ga ne uključite u {{ui:Settings}} › {{ui:Add-ons}}. OpenFOAM je softver koji sami instalirate. Pogledajte [Senka, solarni prinos i spoljašnja udobnost](topic:environment).

### Oblaci tačaka (dodatak)

- Uključite {{ui:Point clouds}} u {{ui:Settings}} › {{ui:Add-ons}}; pojaviće se kartica Oblaci tačaka u desnom panelu. Otvorite LAS ili LAZ datoteku, očistite je, razvrstajte na tlo, rastinje i zgrade, napravite tlo, izohipse i zapremine, i izvezite LAS ili LAZ. Pogledajte [Oblaci tačaka sa drona ili skenera](topic:point-clouds).

### WaterCraft (dodatak)

- Uključite {{ui:WaterCraft (water distribution)}} u {{ui:Settings}} › {{ui:Add-ons}}; pojaviće se kartica WaterCraft. Ima potrošnju od potrošača, protok za gašenje požara na svakom hidrantu, koji prekid magistrale najviše važi, i starost vode i hlor, a svaki se čuva kao CSV. Pogledajte [WaterCraft: potrošnja, protok za gašenje požara, prekidi i starost vode](topic:watercraft).

### Zajednički rad

- U sesiji Live vidite kursore i imena jedni drugih u planu. Biblioteka biljaka: CivilCraft Landscape počinje od svoje podrazumevane zbirke biblioteke, {{ui:CivilCraft landscape}}.

## U svakoj aplikaciji

- Savete prikazuje kao Bootstrap opise, a početni savet može da se zatvori.
- Traka kartica panela koja ne staje se pomera umesto što se seče.
- Naslovi kartica u pregledaču glase `<dokument> - CivilCraft | CadCraft`.
- {{ui:Settings}} ima odeljak Raspored, gde su rasporedi padajuća lista izbora u dva reda.
- Jedinice za težinu i temperaturu su u {{ui:Settings}} › {{ui:Global}} › {{ui:Units}}.
- Spisak jezika prikazuje jezike za koje build ima datoteke. Jezici osim engleskog su mašinski nacrti.

## Ispravljeno

- Dodaci za pretragu adrese i proveru EnergyPlus nisu mogli da se uključe; sada mogu.
- Pomoć sada kaže da dodatak Oblaci tačaka piše očišćen oblak kao LAS 1.4 ili LAZ.
- Klik na sopstveni hvatač izabranog objekta više ne pokreće prevlačenje hvatača koje je zaustavljalo čekajući Izbor.

## Iskrena ograničenja

- Primeri šablona koridora su privremeni podaci bez standarda; inženjer mora da ih proveri. Šabloni terena ne dodaju površinu i ne crtaju se u 3D-u ni u prikazu preseka. Drugi koridor na osovini nije u IFC izvozu. Nema prelaza između dva šablona po stacionaži.
- Oblaci tačaka su isprobani na izmišljenim datotekama, ne na pravom snimanju dronom. Čitaju se samo LAS i LAZ.
- GIS analiza je isprobana na izmišljenim slojevima.
- Senka, sunce i udobnost su procene za planiranje; vetar je neproveren orijentacioni proračun. Ništa od toga nije projektna vrednost.
- WaterCraft je pomoćno sredstvo za proračun, proveren na izmišljenim mrežama. Inženjer za vodu odlučuje koliko su brojevi vredni.
- Jezici osim engleskog su mašinski nacrti.
- Instalateri za Windows nisu potpisani kodom, a disk slika za macOS nije notarizovana.

## Ranije: 0.8 i 0.8.1

Ovo je šta se promenilo u CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02) u odnosu na 0.7. Veliki novi delovi su alatke koje proveravaju nivelaciju i lokaciju (kiša, zemljani radovi, trase, jezera, napredak) i šest prozora za proračune za teren, puteve, premer, rudnike, veze i pruge.

### Novo

**Proverite nivelaciju**

- **Neka pada kiša.** {{ui:Make it rain…}} (pod {{ui:Surface}}) pušta oluju na nivelisano tlo. Gledate kako voda otiče sa platoa, zadržava se u nižim uglovima i preliva preko jezera koja su premala. Pokretanje je animirano i daje zapremine, najveći odliv i CSV svakog jezera. Podrazumevana ćelija je gruba, pa je prvi pogled brz; finija ćelija je sporija. Jezera koja se prelivaju pojavljuju se i u panelu Problemi.
- **Balanser zemljanih radova.** {{ui:Earthwork balancer…}} podiže ili spušta plato dok iskop ne bude jednak nasipu, i prikazuje tabelu odvoza između njih.
- **Najbolja trasa.** {{ui:Best route…}}: izaberite početak i kraj, a CivilCraft nađe najjeftiniji put preko terena koji se drži vaših granica nagiba i krivine, pa od njega napravi osovinu trase.
- **Retenciona jezera.** {{ui:Detention ponds…}} računa stepen i zapreminu iz vašeg tla, prima uređaje za ispust (otvor, preliv, V-zarez, prelivnik), provodi oluju kroz jezero i proverava zadržani vrh, vreme pražnjenja i slobodnu visinu.
- **Napredak iz premera.** {{ui:Progress from surveys…}} upoređuje površine sa drona ili skenera sa različitih datuma sa tlom kakvo je bilo i sa projektom: procenat završenosti po zapremini, područja prekopana i preterano nasuta, deponije, i kada se radovi završavaju ovim tempom (označeno kao procena).

**Upoznajte lokaciju**

- **Adresa do lokacije.** {{ui:Address to site…}} spaja otvorene podatke o parceli, zgradi, zonskom propisu, tlu, poplavi i terenu na jednoj lokaciji. Lokaciju možete da čuvate u datoteci projekta: upisanu adresu, svaki izvor sa danom kada ste ga preuzeli i njegovom licencom, i šta je vraćeno. Ponovo otvorite ili podelite projekat i lokacija je i dalje tu, bez ponovnog preuzimanja. Možete je sačuvati i kao datoteku lokacije ili poslati u BimCraft. Pogledajte [Adresa do lokacije](topic:address-to-site).

**Teren, putevi, premer, rudnici, veze i pruge**

- **Tla i nagibi.** {{ui:Soils and slopes…}} crta profil tla između bušotina koje unesete. Bishopova metoda zatim traži kritični krug na vašem terenu, uz nivo podzemne vode, dodatno opterećenje i koeficijent zemljotresa; slijeganje temelja dobija konsolidaciju, trenutno slijeganje i vreme.
- **Čvorišta i obeležavanje.** {{ui:Junctions and striping…}} spaja krakove sa zaobljenjima ivičnjaka (jedan poluprečnik po kraku, ili zaobljenja sa tri centra), preglednost za projektnu brzinu, proveru trouglova preglednosti, pešačke prelaze, linije zaustavljanja, oznake i znake sa spiskom znakova. Crtaju se na planu i čuvaju kao .dxf sa imenovanim slojevima.
- **Izravnanje premera.** {{ui:Survey adjustment…}} vrši izravnanje poligona ili mreže metodom najmanjih kvadrata: izravnate koordinate, elipse grešaka, hi-kvadrat test i oznaku merenja koje se ne uklapa. Slobodne mreže, zatvaranje poligona kompasnim pravilom i RW5, GSI, JobXML ili CSV datoteke sa terena su uključeni, a izravnate tačke se čuvaju kao CSV.
- **Otvoreni kopovi.** {{ui:Open pits…}} pretvara uzorke bušenja u blok model i konačni kop unutar vašeg ugla kosine, sa odnosom jalovine, tabelom po etažama i krivom sadržaja i tonaže. Ugnježdeni kopovi po faktoru prihoda i raspored proizvodnje sa diskontovanim novčanim tokom su takođe tu.
- **Radio veze.** {{ui:Radio links…}} proverava vidljivost preko vašeg terena uz zakrivljenost Zemlje, prvu Fresnelovu zonu, budžet veze, rezervu slabljenja i gubitak zbog višestruke putanje, i daje visinu jarbola koja bi očistila put. Radi i budžete slabljenja optičkih vlakana, količine trase i vetar na stubu.
- **Skretnice.** {{ui:Rail turnouts…}} pravi skretnicu iz broja srca, ukrštanja između paralelnih koloseka i konstrukcioni gabarit nagnut nagibom i proširen u krivini. Skretnica može da stoji na stacionaži osovine trase.

Pogledajte [Tla, čvorišta, izravnanje premera, kopovi, radio veze i skretnice](topic:soils-roads-survey-mines-links).

### U svakoj aplikaciji

- **Jezici.** 54 jezika, od kojih je deset novih. Jezici osim engleskog su mašinski nacrti dok ih izvorni govornik ne pročita. Teme pomoći su još uglavnom na engleskom.
- **Redovi alatki.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Prelom (kao ranije), 2 reda ili 1 red. Traka CivilCraft-a prikazuje najčešće korišćenu alatku velikim, sledeće male, a ostale iza strelice u nazivu grupe.
- **Ulazni uređaji.** Pult osetljiv na dodir, olovka, 3D miš, kontroler i MIDI mogu da upravljaju aplikacijama.
- **Problemi.** Panel Problemi koji upozorava u svakoj aplikaciji, sa proverama koje čitaju pravilnike propisa.
- **Uživo.** Prikaz ko je gde u sesiji Live.
- **Dodaci.** Spisak dodataka, sa dodacima za osvetljenje.
- **Povežite svoj AI.** Svaki asistent koji povežete može da upravlja alatkama CivilCraft-a. Dolazi uz napomenu da jedan klik za povezivanje unutar CadCraft Studio i hostovani konektor još nisu spremni. Pogledajte [Neka AI asistent radi sa vašom lokacijom](topic:assistants).

### Ispravljeno u 0.8.1

- **Odeljak klasa DWG-a.** Čitao se kao pogrešan tip (GitHub cadcraft#5). Ispravljeno u CivilCraft-u zajedno sa CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Promena jezika tokom rada.** CadCraft Studio i spakovana izdanja mogu da promene jezik za vreme rada. Ranije su bila samo na engleskom. Još nije isprobano na svim platformama: javite nam ako se jezik ne menja.

### Još nije u ovoj verziji

- **Ovo su pomoćna sredstva za proračun.** Svaki rezultat u novim prozorima treba proveru inženjera. Čvrstoće tla počinju od tipičnih vrednosti za grupu tla, i prozor to kaže.
- **Neka pada kiša.** Pokretanje na uzorku lokacije može da traje više od dva minuta u pregledaču pri finoj ćeliji. Proveren je na ručnim slučajevima i V-oblikovanom slivu, još ne na pravoj uređenoj lokaciji.
- **Adresa do lokacije.** Čita otvorene datoteke sa podacima koje sami donosite, i isprobana je samo na našim datotekama. Drveće nije izvor. Preuzimanje izvora za vas čeka tekst o privatnosti.
- **Napredak iz premera.** Isprobano samo na izmišljenim premerima. Napredak na listovima i oznakama (MarkupCraft) i poređenje sa modelom (BimCraft) nisu napravljeni.
- **Tla i nagibi.** Samo kružne površine: nema klinastog ili blok pretraživanja i nema pukotine od zatezanja.
- **Čvorišta.** Jedan poluprečnik po kraku, bez putanja okretanja kamiona, i još ne ulaze u koridor.
- **Datoteke sa terena.** Čitači su napisani prema javnim opisima formata i isprobani na datotekama koje smo napravili. Potrebne su stvarne datoteke sa instrumenata.
- **Veze i pruge.** Radio veze: samo slabljenje u slobodnom prostoru i višestruka putanja (bez slabljenja od kiše i bez dijagrama antena), i nema standarda za železnicu: svaka granica pruge je privremeni podatak, sa nacrtima brojeva koje nijedan inženjer za železnicu nije proverio.
- **Windows i macOS.** 0.8 nije potpisan kodom. Windows može da upozori, a macOS traži desni klik pa Otvori.

Ostalo je u [Još nije izgrađeno](topic:not-built-yet). Za raniji izdanje pogledajte [Šta je novo u 0.7](topic:whats-new-0-7).
