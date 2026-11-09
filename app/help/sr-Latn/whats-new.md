---
title: Novo u 0.8 i 0.8.1
summary: CivilCraft 0.8 donosi Neka pada kiša (oluja nad vašim terenom sa nagibima), bilans zemljanih radova, traženje najbolje trase, retenzione bazene, napredak iz snimaka, uvoz adrese do lokacije koji lokaciju čuva u projektu, i prozore za tla i nagibe, raskrsnice i oznake, izravnanje snimanja, otkope, radio veze i skretnice. 0.8.1 ispravlja čitanje DWG datoteka.
keywords: novo, šta je novo, napomene o izdanju, dnevnik promena, promene, 0.8, 0.8.1, verzija, nove funkcije, kiša, oluja, stajanje vode, preliv, zemljani radovi, bilans, iskop i nasip, prevoz, najbolja trasa, najmanji trošak, osovina trase, retenzioni bazen, ispust, spuštanje nivoa, slobodna visina, napredak, snimanje, dron, deponija, adresa do lokacije, parcela, tlo, poplava, stabilnost nagiba, Bišop, sleganje, raskrsnica, oznake, znakovi, preglednost, izravnanje, najmanji kvadrati, poligonski vlak, otkop, blok model, radio veza, Frenel, skretnica, ukrštanje, jezici, problemi, uživo, dwg
from: b0932cf0
---

Ovo je šta se promenilo u CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02), u odnosu na 0.7. Glavni novi delovi su alati koji proveravaju vaš teren i lokaciju (kiša, zemljani radovi, trase, bazeni, napredak) i šest prozora za proračune za teren, puteve, snimanje, rudnike, veze i železnicu.

## Novo

### Proverite nivelaciju

- **Neka pada kiša.** {{ui:Make it rain…}} (pod {{ui:Surface}}) pušta oluju na nivelisani teren. Gledate kako voda otiče sa platoa, stoji u niskim uglovima i preliva bazene koji su premali. Proces je animiran i daje zapremine, vršni protok i CSV sa svakim bazenom. Podrazumevana ćelija je gruba da prvi pogled bude brz; finija ćelija je sporija. Bazeni koji se preliju pojavljuju se i u panelu Problemi.
- **Bilans zemljanih radova.** {{ui:Earthwork balancer…}} podiže ili spušta plato dok iskop ne bude jednak nasipu i prikazuje tabelu prevoza zemlje između njih.
- **Najbolja trasa.** {{ui:Best route…}}: izaberite početak i kraj, a CivilCraft nađe najjeftiniji put preko terena koji ostaje u granicama vaših nagiba i krivina, pa od njega napravi osovinu trase.
- **Retenzioni bazeni.** {{ui:Detention ponds…}} računa nivo i zapreminu iz vašeg terena, prima ispusne uređaje (otvor, preliv, V-zarez, prelivnik), propušta oluju kroz bazen i proverava zadržani vršni protok, vreme spuštanja nivoa i slobodnu visinu.
- **Napredak iz snimaka.** {{ui:Progress from surveys…}} upoređuje površine sa drona ili skenera iz različitih datuma sa terenom kakav je bio i sa projektom: procenat završenosti po zapremini, područja prekopana i preterano nasuta, deponije i kada će radovi biti gotovi pri ovom tempu (označeno kao procena).

### Upoznajte lokaciju

- **Adresa do lokacije.** {{ui:Address to site…}} spaja otvorene podatke o parcelama, zgradama, nameni, tlu, poplavama i terenu na jednoj lokaciji. Lokaciju možete zadržati u projektnoj datoteci: uneta adresa, svaki izvor sa datumom preuzimanja i licencom, i šta je vraćeno. Ponovo otvorite ili podelite projekat i lokacija je i dalje tu, bez ponovnog preuzimanja. Možete je sačuvati i kao datoteku lokacije ili poslati u BimCraft. Pogledajte [Adresa do lokacije](topic:address-to-site).

### Teren, putevi, snimanje, rudnici, veze i železnica

- **Tla i nagibi.** {{ui:Soils and slopes…}} crta profil tla između bušotina koje unesete. Bišopova metoda zatim traži kritični krug na vašem terenu, uz nivo podzemne vode, dodatno opterećenje i koeficijent zemljotresa; sleganje temelja uključuje konsolidaciju, trenutno sleganje i vreme.
- **Raskrsnice i oznake.** {{ui:Junctions and striping…}} spaja krakove sa zaobljenjima ivičnjaka (jedan radijus po kraku ili trocentrična zaobljenja), preglednost za projektnu brzinu, proveru trouglova preglednosti, pešačke prelaze, zaustavne linije, oznake i znakove sa spiskom znakova. Crtaju se na planu i čuvaju kao .dxf sa imenovanim slojevima.
- **Izravnanje snimanja.** {{ui:Survey adjustment…}} vrši izravnanje poligonskog vlaka ili mreže metodom najmanjih kvadrata: izravnate koordinate, elipse grešaka, test hi-kvadrat i oznaku merenja koje se ne uklapa. Uključene su slobodne mreže, zatvaranje vlaka pravilom kompasa i datoteke sa terena RW5, GSI, JobXML ili CSV, a izravnane tačke se čuvaju kao CSV.
- **Otkopi.** {{ui:Open pits…}} pretvara uzorke bušenja u blok model i konačni otkop unutar vašeg ugla nagiba, uz odnos jalovine, tabelu po etažama i krivu sadržaja i tonaže. Tu su i ugnježdeni otkopi po faktoru prihoda i raspored proizvodnje sa diskontovanim novčanim tokom.
- **Radio veze.** {{ui:Radio links…}} proverava vidljivost preko vašeg terena uz zakrivljenost Zemlje, prvu Frenelovu zonu, budžet veze, rezervu slabljenja i gubitak zbog višestruke putanje, i daje visinu jarbola koja bi očistila put. Radi i budžete gubitaka optičkih vlakana, količine trasa i vetar na stubu.
- **Skretnice.** {{ui:Rail turnouts…}} pravi skretnicu prema broju srca, ukrštanja između paralelnih koloseka i gabarit konstrukcije nagnut nagibom i proširen u krivini. Skretnica može biti na stanici osovine trase.

Pogledajte [Tla, raskrsnice, izravnanje snimanja, otkopi, radio veze i skretnice](topic:soils-roads-survey-mines-links).

## U svakoj aplikaciji

- **Jezici.** 54 jezika, od kojih su deset novi. Jezici osim engleskog su mašinski nacrti dok ih ne pročita izvorni govornik. Tekstovi pomoći su još uglavnom na engleskom.
- **Redovi alatki.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Prelom (kao ranije), 2 reda ili 1 red. Ribon CivilCraft-a prikazuje najkorišćeniji alat veliki, sledeće male, a ostale iza strelice u nazivu grupe.
- **Ulazni uređaji.** Tačpad, olovka, 3D miš, kontroler i MIDI mogu upravljati aplikacijama.
- **Problemi.** Panel Problemi upozorava u svakoj aplikaciji, uz provere koje čitaju skupove propisa.
- **Uživo.** Prikaz ko je gde u sesiji Uživo.
- **Dodaci.** Spisak dodataka, uključujući dodatke za osvetljenje.
- **Povežite svog AI.** Svaki asistent koji povežete može upravljati alatima CivilCraft-a. Dolazi sa napomenom da povezivanje jednim klikom unutar CadCraft Studija i hostovani konektor još nisu spremni. Pogledajte [Neka AI asistent radi sa vašom lokacijom](topic:assistants).

## Ispravljeno u 0.8.1

- **Odeljak DWG klasa.** Čitao se kao pogrešan tip (GitHub cadcraft#5). Ispravljeno u CivilCraft-u zajedno sa CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Promena jezika tokom rada.** CadCraft Studio i pakovana izdanja mogu da promene jezik za vreme rada. Ranije su bili samo na engleskom. Još nije testirano na svim platformama: javite nam ako se jezik ne menja.

## Još nije u ovoj verziji

- **Ovo su pomoćna sredstva za proračun.** Svaki rezultat u novim prozorima traži proveru inženjera. Čvrstoće tla polaze od tipičnih vrednosti za grupu tla, a prozor to kaže.
- **Neka pada kiša.** Pokretanje na primernoj lokaciji može trajati preko dva minuta u pregledaču pri finoj ćeliji. Proveren je na ručnim slučajevima i slivu u obliku slova V, još ne na stvarnoj nivelisanoj lokaciji.
- **Adresa do lokacije.** Čita otvorene datoteke podataka koje donesete i testirana je samo na našim datotekama. Drveće nije izvor. Preuzimanje izvora za vas čeka tekst o privatnosti.
- **Napredak iz snimaka.** Testirano samo na izmišljenim snimcima. Napredak na listovima i označavanjima (MarkupCraft) i poređenje skena sa modelom (BimCraft) nisu izgrađeni.
- **Tla i nagibi.** Samo kružne površi: bez pretrage klinastog ili blok kliznog kruga i bez pukotine zatezanja.
- **Raskrsnice.** Jedan radijus po kraku, bez putanja zaokreta kamiona, i još ne ulaze u koridor.
- **Datoteke sa terena.** Čitači su pisani prema javnim opisima formata i isprobani na datotekama koje smo sami napravili. Potrebne su prave datoteke instrumenata.
- **Veze i železnica.** Radio veze: samo gubitak u slobodnom prostoru i višestruka putanja (bez slabljenja kišom i dijagrama antena), i nema železničkog standarda: svaka granica za šine je privremena, sa nacrtnim brojevima koje nijedan železnički inženjer nije proverio.
- **Windows i macOS.** 0.8 nije potpisan kodom. Windows može upozoriti, a macOS traži desni klik pa Otvori.

Sve ostalo je u [Još nije izgrađeno](topic:not-built-yet). Za raniju verziju pogledajte [Šta je novo u 0.7](topic:whats-new-0-7).
