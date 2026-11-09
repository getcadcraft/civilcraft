---
title: Novosti u verzijama 0.8 i 0.8.1
summary: CivilCraft 0.8 donosi Pusti kišu (provjeru oticanja vode preko vaše nivelacije), balans zemljanih radova, traženje najbolje trase, retencione bazene, napredak iz snimanja, uvoznik adrese u lokaciju koji lokaciju zadržava u projektu, te prozore za tla i nagibe, raskrsnice i oznake, izravnanje mreže, otvorene kopove, radio veze i željezničke skretnice. 0.8.1 ispravlja čitanje DWG datoteka.
keywords: šta je novo, novosti, bilješke o izdanju, dnevnik promjena, promjene, 0.8, 0.8.1, verzija, nove funkcije, kiša, oluja, zadržavanje vode, preliv, zemljani radovi, balans, nasip i iskop, odvoz, najbolja trasa, najmanji trošak, trasa, retencioni bazen, ispust, pražnjenje, slobodna visina, napredak, snimanje, dron, deponija, adresa do lokacije, parcela, tlo, poplava, stabilnost nagiba, Bishop, slijeganje, raskrsnica, oznake, znakovi, preglednost, izravnanje, najmanji kvadrati, poligonski vlak, otvoreni kop, blok model, radio veza, Fresnel, skretnica, ukrsni kolosijek, jezici, problemi, uživo, DWG
from: b0932cf0
---

Ovo je ono što se promijenilo u CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02), u odnosu na 0.7. Najveći novi dijelovi su alati koji provjeravaju vašu nivelaciju i vašu lokaciju (kiša, zemljani radovi, trase, bazeni, napredak) i šest prozora za proračune za teren, puteve, snimanje, rudnike, veze i željeznicu.

## Novo

### Provjerite nivelaciju

- **Pusti kišu.** {{ui:Make it rain…}} (pod {{ui:Surface}}) spušta oluju na nivelisani teren. Vidite kako voda otječe s platoa, zadržava se u niskim uglovima i preliva preko bazena koji su premali. Proračun je animiran i daje zapremine, vršni odliv i CSV datoteku za svaki bazen. Zadana ćelija je gruba da bi prvi pregled bio brz; finija ćelija je sporija. Bazeni koji se prelivaju pojavljuju se i na panelu Problemi.
- **Balans zemljanih radova.** {{ui:Earthwork balancer…}} podiže ili spušta plato dok iskop ne bude jednak nasipu i prikazuje tabelu odvoza materijala između njih.
- **Najbolja trasa.** {{ui:Best route…}} odaberite početak i kraj, a CivilCraft nalazi najjeftiniji put kroz teren koji poštuje vaše granice nagiba i krivine, zatim pravi os trase od njega.
- **Retencioni bazeni.** {{ui:Detention ponds…}} računa kotu vode i zapreminu akumulacije iz vašeg terena, prima uređaje za ispust (otvor, pregrada, V-zarez, preliv), provodi oluju kroz bazen i provjerava zadržani vršni protok, vrijeme pražnjenja i slobodnu visinu.
- **Napredak iz snimanja.** {{ui:Progress from surveys…}} upoređuje površine snimljene dronom ili skenerom iz različitih datuma s terenom kakav je bio i s projektom: procenat završenosti po zapremini, područja s previše iskopanog i previše nasutog materijala, deponije i kada će radovi biti gotovi ovim tempom (označeno kao procjena).

### Upoznajte lokaciju

- **Adresa do lokacije.** {{ui:Address to site…}} objedinjuje podatke o otvorenoj parceli, zgradi, zoniranju, tlu, poplavama i terenu za jednu lokaciju. Lokaciju možete zadržati u datoteci projekta: upisanu adresu, svaki izvor s danom kada ste ga preuzeli i njegovom licencom, te šta je vraćeno. Ponovo otvorite ili podijelite projekat i lokacija je još tu, bez ponovnog preuzimanja ičega. Možete je sačuvati i kao datoteku lokacije ili poslati u BimCraft. Pogledajte [Adresa do lokacije](topic:address-to-site).

### Teren, putevi, snimanje, rudnici, veze i željeznica

- **Tla i nagibi.** {{ui:Soils and slopes…}} crta profil tla između bušotina koje unesete. Bishopova metoda zatim traži kritičnu kružnu površinu klizanja na vašem terenu, uz nivo podzemne vode, dodatno opterećenje i koeficijent potresa; slijeganje temelja uključuje konsolidaciju, trenutno slijeganje i vrijeme.
- **Raskrsnice i oznake.** {{ui:Junctions and striping…}} spaja krakove sa zaobljenjima ivičnjaka (jedan radijus po kraku ili zaobljenja sa tri centra), preglednost za projektnu brzinu, provjeru trouglova preglednosti, pješačke prelaze, zaustavne linije, oznake i znakove sa specifikacijom znakova. Crtaju se u osnovi i čuvaju kao .dxf s imenovanim slojevima.
- **Izravnanje mreže.** {{ui:Survey adjustment…}} izvodi izravnanje poligonskog vlaka ili mreže metodom najmanjih kvadrata: izravnate koordinate, elipse grešaka, test hi-kvadrat i oznaku na mjerenju koje se ne uklapa. Uključene su slobodne mreže, zatvaranje poligona pravilom kompasa i datoteke terenskih mjerenja RW5, GSI, JobXML ili CSV; izravnane tačke se čuvaju kao CSV.
- **Otvoreni kopovi.** {{ui:Open pits…}} pretvara uzorke bušenja u blok model i konačnu jamu unutar vašeg ugla nagiba, uz odnos otkrivke, tabelu po etažama i krivu sadržaja i tonaže. Tu su i ugnježđene jame prema faktoru prihoda i raspored proizvodnje s diskontovanim novčanim tokom.
- **Radio veze.** {{ui:Radio links…}} provjerava vidljivost preko vašeg terena uz zakrivljenost Zemlje, prvu Fresnelovu zonu, budžet veze, rezervu za slabljenje signala i ispad zbog višestrukih putanja, te daje visinu jarbola koja bi očistila put. Radi i budžete gubitaka u optičkim vlaknima, količine trase i vjetar na tornju.
- **Željezničke skretnice.** {{ui:Rail turnouts…}} pravi skretnicu prema broju srca, ukrsne skretnice između paralelnih kolosijeka i gabarit građevine nagnut nadvišenjem i proširen u krivini. Skretnica može biti na stanici osi trase.

Pogledajte [Tla, raskrsnice, izravnanje mreže, kopovi, radio veze i skretnice](topic:soils-roads-survey-mines-links).

## U svim aplikacijama

- **Jezici.** 54 jezika, deset od njih novih. Jezici osim engleskog su mašinski prevodi dok ih ne pročita izvorni govornik. Teme pomoći su još uglavnom na engleskom.
- **Redovi alatne trake.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Prelamanje (kao ranije), 2 reda ili 1 red. Ribbon u CivilCraftu prikazuje najkorišćeniji alat velik, sljedeće male, a ostale iza strelice u nazivu grupe.
- **Ulazni uređaji.** Touchpad, olovka, 3D miš, kontroler i MIDI mogu upravljati aplikacijama.
- **Problemi.** Panel Problemi upozorava u svim aplikacijama, uz provjere koje čitaju pakete propisa.
- **Uživo.** Prikaz ko je gdje u sesiji uživo.
- **Dodaci.** Lista dodataka, uključujući dodatke za osvjetljenje.
- **Povežite svoj AI.** Svaki asistent koji povežete može upravljati alatima programa CivilCraft. Dolazi uz napomenu da povezivanje jednim klikom unutar CadCraft Studija i hostovani konektor još nisu spremni. Pogledajte [Dopustite AI asistentu da radi s vašom lokacijom](topic:assistants).

## Ispravljeno u 0.8.1

- **Odjeljak klasa DWG.** Čitan je kao pogrešan tip (GitHub cadcraft#5). Ispravljeno u CivilCraftu zajedno s CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Promjena jezika tokom rada.** CadCraft Studio i spakovana izdanja mogu promijeniti jezik u toku rada. Prije su bila samo na engleskom. Još nije testirano na svim platformama: javite nam ako se jezik ne promijeni.

## Nije u ovoj verziji još

- **Ovo su pomoćna sredstva za proračun.** Svaki rezultat u novim prozorima treba provjeru inženjera. Čvrstoće tla polaze od tipičnih vrijednosti za grupu tla, a prozor to navodi.
- **Pusti kišu.** Pokretanje na uzorku lokacije može trajati preko dvije minute u pregledniku pri finoj ćeliji. Provjereno je na ručnim proračunima i slivu u obliku slova V, ali još ne na stvarnoj nivelisanoj lokaciji.
- **Adresa do lokacije.** Čita otvorene datoteke podataka koje donesete i testirano je samo na našim datotekama. Drveće nije izvor podataka. Preuzimanje izvora za vas čeka pravila o privatnosti.
- **Napredak iz snimanja.** Testirano samo na izmišljenim snimanjima. Napredak na listovima i označavanjima (MarkupCraft) i skeniranje naspram modela (BimCraft) nisu izgrađeni.
- **Tla i nagibi.** Samo kružne površine: nema pretrage klinom ili blokom i nema pukotine zatezanja.
- **Raskrsnice.** Jedan radijus po kraku, nema putanja zaokreta kamiona, i još ne ulaze u koridor.
- **Datoteke terenskih mjerenja.** Čitači su napisani prema javnim opisima formata i isprobani na datotekama koje smo sami napravili. Trebaju nam stvarne datoteke instrumenata.
- **Veze i željeznica.** Radio veze: samo slabljenje u slobodnom prostoru i višestruka putanja (bez slabljenja od kiše ili dijagrama antena), i nema željezničkog standarda: svako ograničenje za željeznicu je privremeno, s nacrtnim brojevima koje nijedan inženjer željeznice nije provjerio.
- **Windows i macOS.** 0.8 nije potpisan kodom. Windows može upozoriti, a macOS traži desni klik, pa Otvori.

Sve ostalo je u [Još nije izgrađeno](topic:not-built-yet). Za raniju verziju pogledajte [Novosti u 0.7](topic:whats-new-0-7).
