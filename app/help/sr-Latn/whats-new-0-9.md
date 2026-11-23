---
title: Novosti u 0.9 (ranije)
summary: Šabloni koridora i terena, hvatanje i dugmad Izaberi pri crtanju, GIS analiza sa tabelom atributa, senka, solarni prinos, komfor i vetar za lokalitet, 3D prikaz Render, i dodaci Oblaci tačaka i WaterCraft.
keywords: novosti 0.9, raniji izdanje, novosti, 0.9, beleške o izdanju, šabloni koridora, šabloni terena, uređivač šablona, tipični poprečni presek, više koridora, hvatanje, hvataj, izaberi, pomeri, kopiraj, rotiraj, tangenta, render, 3d render, gis analiza, bafer, preklapanje, prostorno spajanje, tabela atributa, stilizuj po atributu, studija senke, solarni prinos, utci, spoljašnji komfor, studija vetra, openfoam, oblaci tačaka, las, laz, watercraft, protivpožarni protok, hidrant, starost vode, hlor, potražnje, opisi, novosti, beleške o izdanju, promene, 0.8, 0.8.1, verzija, nove funkcije, kiša, zemljani radovi, ravnoteža, usek i nasip, prevoz, najbolja trasa, retenzioni bazen, izliv, pražnjenje, slobodna visina, napredak, snimanje, dron, parcela, tlo, poplava, stabilnost nagiba, sleganje, raskrsnica, oznake, preglednost, izravnanje, najmanji kvadrati, poligonski vlak, otvoreni kop, radio veza, skretnica, ukrsna veza, jezici, problemi, uživo, dwg
from: 4664522c
---

Ovo je šta se promenilo u CivilCraft 0.9, u poređenju sa 0.8.1. CivilCraft 0.9 je deo CadCraft Studio 0.9 i njegovih osam aplikacija. Glavni delovi su šabloni koridora i terena, hvatanje tokom crtanja, GIS analiza, studije sunca, solarnog prinosa, komfora i vetra na lokalitetu, i dva dodatka: Oblaci tačaka i WaterCraft.

## Novo

### Šabloni koridora i terena

- **Šabloni koridora.** Otvori {{ui:Površ}} › {{ui:Više}} › {{ui:Šabloni koridora…}} (ili ukucaj {{cmd:TEMPLATES}}). Šablon je mali poprečni presek sa komponentama, ofsetima, nagibima, materijalima i kodovima tačaka. Čuvaj ih u projektu, u {{ui:Moja biblioteka}} ili kao datoteku `.cctemplates.json`. Uređivač šablona prikazuje crtež u pravoj razmeri i navodi probleme dok kucaš.
- **Izrada iz šablona po stacionaži.** Izaberi osovinu trase i uključi {{ui:Gradi iz šablona po stacionaži}} u njenim Svojstvima. Svaka strana svakog regiona ima sopstvenu listu kolovoza i sopstveno stanje na kraju. {{ui:Dodaj koridor}} pod {{ui:Koridori na ovoj osovini trase}} stavlja više koridora na jednu osovinu.
- **Šabloni terena.** {{ui:Površ}} › {{ui:Više}} › {{ui:Šabloni terena…}} (ili ukucaj {{cmd:TERRAINTEMPLATES}}) prekriva slojevite materijale kao što su humus ili kolovoz i podloga na terenu, sa površinom i zapreminom po sloju. Pogledaj [Šabloni koridora i šabloni terena](topic:corridor-templates).

### Crtanje

- **Hvatanje.** Alatke Osovina trase, Plato, Parcela, Masa, Linija obeležja, Izmeri, Granica i Slivno područje hvataju se za tačke snimanja, PI tačke, uglove, temena i objekte, sa oznakom pored markera. Drži {{key:Alt}} za slobodnu tačku.
- **Dugmad Izaberi, tangenta i pomeranje, kopiranje, rotacija.** Uglovi platoa, parcele i linije obeležja imaju polja za ukucavanje Istok i Sever i dugme Izaberi sa krstićem. Svojstva imaju i {{ui:Tangenta iz dve tačke}} za osovine i {{ui:Pomeri, kopiraj i rotiraj}} za osovine, platoe, parcele i linije obeležja. Pogledaj [Crtanje sa hvatanjem, izabranim uglovima i pomeranjem, kopiranjem, rotacijom](topic:draft-with-snaps).
- **Prikaz Render u 3D.** Dugme {{ui:Renderuj}} na 3D traci crta teren prirodnim bojama, nebo, izmaglicu i meke senke. Ne menja model. Meni {{ui:Sunce}} sada ima dugmad {{ui:Primeni}} i {{ui:Zatvori}}. Pogledaj [Pogled na lokalitet u 3D](topic:site-3d).
- **Paneli se otvaraju jedan odeljak u isto vreme.** Levi panel i panel Svojstva otvaraju jedan odeljak i zatvaraju ostale, a pločice trake Uređenje okoline koje drže više alata su razdvojena dugmad.

### GIS analiza

- **Analiza.** {{ui:Površ}} › {{ui:Više}} › {{ui:Analiza}} nudi bafer, preklapanje, prostorno spajanje, izbor po atributu ili obliku, i merenje. Svaki alat pravi novi sloj u jednom koraku opoziva.
- **Tabela atributa.** Meni sa tri tačke sloja ima {{ui:Tabela atributa…}} i {{ui:Stilizuj po atributu…}}. Pogledaj [Analiza GIS slojeva](topic:gis-analysis) i [Rad sa tabelom atributa sloja](topic:gis-table).

### Lokalitet: sunce, solarni prinos, komfor i vetar

- **Odeljak okruženja.** Izaberi masu: odeljak {{ui:Okruženje}} nalazi se pod {{ui:Sunčani sati}} u njenim Svojstvima. Ima studiju senke (mapa, tabela, animacija, CSV), solarni prinos iz datoteke vremena za tipičnu godinu (.epw) i spoljašnji komfor (UTCI).
- **Vetar, samo orijentaciono.** {{ui:Pokreni studiju vetra}} boji teren od sedenja do neprijatnog za svaki smer vetra u datoteci vremena. Nije potvrđeno, a panel to kaže.
- **Dodatak Vetar za pešake (OpenFOAM).** Isključen je dok ga ne uključiš u {{ui:Podešavanja}} › {{ui:Dodaci}}. OpenFOAM je softver koji sam instaliraš. Pogledaj [Senka, solarni prinos i spoljašnji komfor](topic:environment).

### Oblaci tačaka (dodatak)

- Uključi {{ui:Oblaci tačaka}} u {{ui:Podešavanja}} › {{ui:Dodaci}}; kartica Oblaci tačaka se pojavljuje u desnom panelu. Otvori LAS ili LAZ datoteku, očisti je, razvrstaj na teren, vegetaciju i zgrade, izradi teren, izohipse i zapremine, i izvezi LAS ili LAZ. Pogledaj [Oblaci tačaka sa drona ili skenera](topic:point-clouds).

### WaterCraft (dodatak)

- Uključi {{ui:WaterCraft (distribucija vode)}} u {{ui:Podešavanja}} › {{ui:Dodaci}}; pojavljuje se kartica WaterCraft. Ima potražnje od korisnika, protivpožarni protok na svakom hidrantu, koji prekid magistrale najviše znači, i starost vode i hlor, a svaki se čuva kao CSV. Pogledaj [WaterCraft: potražnje, protivpožarni protok, prekidi i starost vode](topic:watercraft).

### Zajednički rad

- U sesiji uživo vidiš kursore i imena jedni drugih u osnovi. Biljke iz biblioteke: CivilCraft Uređenje okoline počinje od svoje podrazumevane zbirke biblioteke, {{ui:CivilCraft uređenje okoline}}.

## U svakoj aplikaciji

- Saveti se prikazuju kao Bootstrap oblačići sa savetima, a početni savet može da se zatvori.
- Traka kartica panela koja ne staje se pomera umesto da se odseca.
- Naslovi kartica pregledača glase `<dokument> - CivilCraft | CadCraft`.
- {{ui:Podešavanja}} imaju odeljak Raspored, gde su rasporedi padajuća lista izbora u dva reda.
- Jedinice težine i temperature su u {{ui:Podešavanja}} › {{ui:Globalno}} › {{ui:Jedinice}}.
- Lista jezika prikazuje jezike za koje izdanje ima datoteke. Jezici osim engleskog su mašinski nacrti.

## Ispravljeno

- Dodaci pretrage adrese i EnergyPlus provere nisu mogli da se uključe; sada mogu.
- Pomoć sada kaže da dodatak Oblaci tačaka piše očišćen oblak kao LAS 1.4 ili LAZ.
- Klik na sopstveno hvatište izabranog objekta više ne pokreće prevlačenje hvatišta koje je zaustavljalo čekajući Izaberi.

## Iskrena ograničenja

- Primeri šablona koridora su privremeni, bez standarda; inženjer ih mora proveriti. Šabloni terena ne dodaju površ i ne crtaju se u 3D ili u prikazu preseka. Drugi koridor na osovini nije u IFC izvozu. Nema suženja između dva šablona po stacionaži.
- Oblaci tačaka su testirani na izmišljenim datotekama, a ne na pravom snimanju dronom. Čitaju se samo LAS i LAZ.
- GIS analiza je testirana na izmišljenim slojevima.
- Senka, solarni prinos i komfor su procene za planiranje; vetar je nepotvrđeno orijentaciono. Ništa od toga nije projektna vrednost.
- WaterCraft je pomoć u proračunu, proverena na izmišljenim mrežama. Inženjer za vodu odlučuje koliko brojke vrede.
- Jezici osim engleskog su mašinski nacrti.
- Instalateri za Windows nisu potpisani kodom, a disk slika za macOS nije notarizovana.

## Ranije: 0.8 i 0.8.1

Ovo je šta se promenilo u CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02), u poređenju sa 0.7. Glavni novi delovi su alati koji proveravaju tvoje uklapanje i lokalitet (kiša, zemljani radovi, trase, bazeni, napredak) i šest prozora za proračune za teren, puteve, snimanje, rudnike, veze i železnicu.

### Novo

**Proveri svoje uklapanje**

- **Neka pada kiša.** {{ui:Neka pada kiša…}} (pod {{ui:Površ}}) pušta oluju na uklopljen teren. Gledaš kako voda otiče sa platoa, stoji u udubljenjima i preliva se preko bazena koji su premali. Izvođenje je animirano i daje zapremine, vršni odliv i CSV svakog bazena. Podrazumevana ćelija je gruba da prvi pogled bude brz; finija ćelija je sporija. Bazeni koji se preliva pojavljuju se i u panelu Problemi.
- **Bilans zemljanih radova.** {{ui:Bilans zemljanih radova…}} podiže ili spušta plato dok usek ne bude jednak nasipu, i prikazuje tabelu prevoza između njih.
- **Najbolja trasa.** {{ui:Najbolja trasa…}}: izaberi početak i kraj, pa CivilCraft nalazi najjeftiniji put kroz teren koji ostaje u tvojim granicama nagiba i krivine, i zatim od njega pravi osovinu trase.
- **Retenzioni bazeni.** {{ui:Retenzioni bazeni…}} računa nivo i akumulaciju iz terena, uzima uređaje izliva (otvor, preliv, V-zarez, preliv-kanal), vodi oluku kroz bazen i proverava zadržani vršni protok, vreme pražnjenja i slobodnu visinu.
- **Napredak iz snimanja.** {{ui:Napredak iz snimaka…}} upoređuje površi sa drona ili skenera sa različitih datuma sa terenom kakav je bio i sa projektom: procenat završenosti po zapremini, područja iskopana i nasuta preko mere, deponije materijala i kada će se radovi završiti pri ovom tempu (označeno kao procena).

**Upoznaj lokalitet**

- **Adresa do lokaliteta.** {{ui:Adresa do lokaliteta…}} slaže podatke o otvorenim parcelama, zgradama, urbanističkoj nameni, tlu, poplavama i terenu na jednom lokalitetu. Lokalitet možeš čuvati u datoteci projekta: unesenu adresu, svaki izvor sa danom kada si ga preuzeo i njegovom licencom, i šta se vratilo. Ponovo otvoriš ili podeliš projekat i lokalitet je i dalje tu, bez ponovnog preuzimanja. Možeš ga i sačuvati kao datoteku lokaliteta ili poslati u BimCraft. Pogledaj [Adresa do lokaliteta](topic:address-to-site).

**Teren, putevi, snimanje, rudnici, veze i železnica**

- **Tla i nagibi.** {{ui:Tla i nagibi…}} crta profil tla između bušotina koje ukucaš. Bišopova metoda zatim traži kritični krug na tvom terenu, sa nivoom podzemne vode, dodatnim opterećenjem i koeficijentom zemljotresa; sleganje temelja dobija konsolidaciju, trenutno sleganje i vreme.
- **Raskrsnice i oznake.** {{ui:Raskrsnice i oznake…}} spaja krakove sa zaobljenjima ivičnjaka (jedan poluprečnik po kraku, ili povratci sa tri centra), preglednost za projektnu brzinu, proveru trouglova preglednosti, pešačke prelaze, stop linije, oznake i znakove sa spiskom znakova. Crtaju se u osnovi i čuvaju kao .dxf sa imenovanim slojevima.
- **Izravnanje snimanja.** {{ui:Izravnanje snimanja…}} vrši izravnanje poligonskog vlaka ili mreže po najmanjim kvadratima: izravnate koordinate, elipse grešaka, hi-kvadrat test i oznaka na merenju koje se ne uklapa. Slobodne mreže, zatvaranje poligonskog vlaka kompasovim pravilom i RW5, GSI, JobXML ili CSV datoteke sa terena su uključene, a izravnate tačke se čuvaju kao CSV.
- **Otkopi.** {{ui:Otkopi…}} pretvara uzorke iz bušenja u blok model i krajnji kop unutar tvog ugla nagiba, sa koeficijentom otkrivke, tabelom po etaži i krivom sadržaja i tonaže. Ugnježdeni kopovi po faktoru prihoda i raspored proizvodnje sa diskontovanim novčanim tokom su tu takođe.
- **Radio veze.** {{ui:Radio veze…}} proverava vidljivost preko tvog terena uz ispupčenje Zemlje, prvu Frenelovu zonu, budžet veze, rezervu slabljenja i prekid usled višestrukih putanja, i daje visinu jarbola koja bi očistila put. Radi i budžete slabljenja optičkih vlakana, količine trasa i vetar na tornju.
- **Skretnice.** {{ui:Skretnice…}} pravi skretnicu iz broja srca, ukrsne veze između paralelnih koloseka i profil gabarita nagnut nadvišenjem i proširen na krivini. Skretnica može stajati na stacionaži osovine trase.

Pogledaj [Tlo, raskrsnice, izravnanje snimanja, kopovi, radio veze i skretnice](topic:soils-roads-survey-mines-links).

### U svakoj aplikaciji

- **Jezici.** 54 jezika, od toga deset novih. Jezici osim engleskog su mašinski nacrti dok ih izvorni govornik ne pročita. Teme pomoći su još uglavnom na engleskom.
- **Redovi alatki.** {{ui:Podešavanja}} › {{ui:Opšte}} › {{ui:Redovi alatki}}: Prelom (kao ranije), 2 reda ili 1 red. Traka u CivilCraft-u prikazuje najkorišćeniji alat krupno, sledeće sitno, a ostale iza strelice pored imena grupe.
- **Uređaji za unos.** Touchpad, olovka, 3D miš, kontroler i MIDI mogu da upravljaju aplikacijama.
- **Problemi.** Panel Problemi upozorava u svakoj aplikaciji, sa proverama koje čitaju pakete propisa.
- **Uživo.** Prikaz ko je gde u sesiji uživo.
- **Dodaci.** Spisak dodataka, sa dodacima za osvetljenje.
- **Poveži svog AI.** Svaki asistent koji povežeš može da upravlja alatima CivilCraft-a. Uz to ide napomena da povezivanje jednim klikom unutar CadCraft Studija i hostovani konektor još nisu spremni. Pogledaj [Neka AI asistent radi na tvom lokalitetu](topic:assistants).

### Ispravljeno u 0.8.1

- **Odeljak klasa DWG.** Čitao se kao pogrešan tip (GitHub cadcraft#5). Ispravljeno u CivilCraft-u zajedno sa CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Promena jezika tokom rada.** CadCraft Studio i spakovana izdanja mogu da menjaju jezik tokom rada. Pre toga bila su samo na engleskom. Još nije testirano na svakoj platformi: javi nam ako se jezik ne menja.

### Još nije u ovoj verziji

- **Ovo su pomoći za proračun.** Svaki rezultat u novim prozorima treba proveru inženjera. Čvrstoće tla počinju od tipičnih vrednosti za grupu tla, a prozor to kaže.
- **Neka pada kiša.** Izvođenje na probnom lokalitetu može trajati više od dva minuta u pregledaču pri finoj ćeliji. Proveravano je na ručnim slučajevima i V-slivu, ali još ne na pravom uklopljenom lokalitetu.
- **Adresa do lokaliteta.** Čita otvorene datoteke sa podacima koje donosiš, i testirano je samo na našim datotekama. Drveće nije izvor. Preuzimanje izvora za tebe čeka formulaciju o privatnosti.
- **Napredak iz snimanja.** Testirano samo na izmišljenim snimcima. Napredak na listovima i označavanjima (MarkupCraft) i poređenje skena sa modelom (BimCraft) nisu izrađeni.
- **Tla i nagibi.** Samo kružne površi: nema pretrage klina ili bloka i nema pukotine od zatezanja.
- **Raskrsnice.** Jedan poluprečnik po kraku, nema putanja okretanja kamiona, i još ne ulaze u koridor.
- **Datoteke sa terena.** Čitači su napisani prema javnim opisima formata i isprobani na datotekama koje smo napravili. Potrebne su datoteke pravih instrumenata.
- **Veze i železnica.** Radio veze: samo slabljenje u slobodnom prostoru i višestruke putanje (bez slabljenja zbog kiše i dijagrama antene), i nema železničkog standarda: svaka granica za železnicu je privremena, sa nacrtom brojki koje nijedan železnički inženjer nije proverio.
- **Windows i macOS.** 0.8 nije potpisan kodom. Windows može upozoriti, a macOS traži desni klik pa Otvori.

Sve ostalo je u [Još nije izrađeno](topic:not-built-yet). Za raniju verziju pogledaj [Novosti u 0.7](topic:whats-new-0-7).
