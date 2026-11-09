---
title: Što je novo u verzijama 0.8 i 0.8.1
summary: CivilCraft 0.8 donosi Pusti kišu (oluju preko vašeg uređenog terena), uravnoteživač zemljanih radova, traženje najbolje trase, retencije, napredak iz izmjera, uvoz adrese do lokacije koji lokaciju zadržava u projektu te prozore za tla i pokose, raskrižja i oznake, izjednačenje izmjere, površinske kopove, radioveze i željezničke skretnice. Verzija 0.8.1 ispravlja čitanje DWG datoteka.
keywords: što je novo, bilješke o izdanju, popis promjena, promjene, 0.8, 0.8.1, verzija, nove značajke, kiša, oluja, zadržavanje vode, preljev, zemljani radovi, ravnoteža, iskop i nasip, dijagram masa, najbolja trasa, najmanji trošak, os trase, retencija, ispust, snižavanje razine, slobodna visina, napredak, izmjera, dron, hrpa materijala, adresa do lokacije, katastarska čestica, tlo, poplava, stabilnost pokosa, Bishop, slijeganje, raskrižje, oznake na kolniku, znakovi, preglednost, izjednačenje, najmanji kvadrati, poligonski vlak, površinski kop, blok model, radioveza, Fresnel, skretnica, spojni kolosijek, jezici, problemi, uživo, dwg
from: b0932cf0
---

Ovo je što se promijenilo u CivilCraftu 0.8 (2026-11-01) i 0.8.1 (2026-11-02), u usporedbi s verzijom 0.7. Glavni novi dijelovi su alati koji ispituju vaše uređenje terena i lokaciju (kiša, zemljani radovi, trase, retencije, napredak) te šest prozora za proračune za teren, ceste, izmjeru, rudnike, veze i željeznicu.

## Novo

### Ispitajte uređenje terena

- **Pusti kišu.** {{ui:Make it rain…}} (pod {{ui:Surface}}) spušta oluju na uređeni teren. Gledate kako voda otječe s platoa, zadržava se u nižim kutovima i preljeva retencije koje su premale. Prikaz je animiran i daje volumene, vršni protok i CSV datoteku svake retencije. Zadana ćelija je gruba pa je prvi pregled brz; finija ćelija je sporija. Retencije koje preljevaju pojavljuju se i na ploči Problemi.
- **Uravnoteživač zemljanih radova.** {{ui:Earthwork balancer…}} podiže ili spušta plato dok iskop ne bude jednak nasipu i prikazuje tablicu prijevoza između njih.
- **Najbolja trasa.** {{ui:Best route…}}: odaberete početak i kraj, a CivilCraft pronalazi najjeftiniju putanju preko terena koja ostaje unutar vaših ograničenja nagiba i zakrivljenja, pa iz nje izrađuje os trase.
- **Retencije.** {{ui:Detention ponds…}} izračunava stupanj i akumulaciju iz vašeg terena, prima uređaje za ispust (otvor, pregradu, trokutasti preljev, preljevnu građevinu), provodi oluju kroz retenciju i provjerava zadržani vršni protok, vrijeme snižavanja i slobodnu visinu.
- **Napredak iz izmjera.** {{ui:Progress from surveys…}} uspoređuje površine s dronova ili skeniranja s različitih datuma s terenom kakav je bio i s projektom: postotak dovršenosti po volumenu, područja prekopana i prenasuta, hrpe materijala te kada će radovi završiti pri ovom tempu (označeno kao procjena).

### Upoznajte lokaciju

- **Adresa do lokacije.** {{ui:Address to site…}} slaže otvorene podatke o katastarskoj čestici, zgradi, namjeni, tlu, poplavama i terenu na jednu lokaciju. Lokaciju možete zadržati u datoteci projekta: upisanu adresu, svaki izvor s danom preuzimanja i njegovom licencom te što je vraćeno. Ponovno otvorite ili podijelite projekt i lokacija je i dalje tu, bez ponovnog preuzimanja. Možete je spremiti i kao datoteku lokacije ili poslati u BimCraft. Pogledajte [Adresa do lokacije](topic:address-to-site).

### Teren, ceste, izmjera, rudnici, veze i željeznica

- **Tla i pokosi.** {{ui:Soils and slopes…}} crta profil tla između bušotina koje upišete. Bishopova metoda zatim traži kritičnu kružnicu na vašem terenu, uz razinu podzemne vode, dodatno opterećenje i koeficijent potresa; slijeganje temelja dobiva konsolidaciju, trenutno slijeganje i vrijeme.
- **Raskrižja i oznake.** {{ui:Junctions and striping…}} spaja krakove s rubnim lukovima (jedan polumjer po kraku ili rubni lukovi s tri središta), preglednost za projektnu brzinu, provjeru trokuta preglednosti, pješačke prijelaze, zaustavne crte, oznake i znakove s popisom znakova. Crtaju se na nacrtu i spremaju kao .dxf s imenovanim slojevima.
- **Izjednačenje izmjere.** {{ui:Survey adjustment…}} izvodi izjednačenje poligonskog vlaka ili mreže metodom najmanjih kvadrata: izjednačene koordinate, elipse pogrešaka, test hi-kvadrat i oznaku na mjerenju koje ne odgovara. Uključene su slobodne mreže, zatvaranje poligonskog vlaka pravilom kompasa te terenske datoteke RW5, GSI, JobXML ili CSV, a izjednačene točke se spremaju kao CSV.
- **Površinski kopovi.** {{ui:Open pits…}} pretvara uzorke bušenja u blok model i konačni kop unutar vašeg kuta nagiba, s omjerom jalovine, tablicom po etažama i krivuljom sadržaja i tonaže. Tu su i ugniježđeni kopovi prema faktoru prihoda te raspored proizvodnje s diskontiranim novčanim tokom.
- **Radioveze.** {{ui:Radio links…}} provjerava vidljivost duž linije preko vašeg terena uz zakrivljenost Zemlje, prvu Fresnelovu zonu, proračun veze, rezervu slabljenja i gubitak zbog višestazne propagacije te daje visinu jarbola koja bi očistila put. Radi i proračune gubitaka u optičkim vlaknima, količine za trasu i vjetar na stupu.
- **Željezničke skretnice.** {{ui:Rail turnouts…}} izrađuje skretnicu iz njezinog broja srca, spojne kolosijeke između paralelnih kolosijeka te profil građevinskog gabarita nagnut prema nadvišenju i proširen u luku. Skretnica može stajati na stacionaži osi trase.

Pogledajte [Tla, raskrižja, izjednačenje izmjere, kopovi, radioveze i skretnice](topic:soils-roads-survey-mines-links).

## U svim aplikacijama

- **Jezici.** 54 jezika, od toga deset novih. Jezici osim engleskoga su strojni prijevodi u radnoj verziji dok ih ne pročita izvorni govornik. Teme pomoći su još uglavnom na engleskom.
- **Redci alatne trake.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Prelomi (kao prije), 2 retka ili 1 redak. Vrpca u CivilCraftu prikazuje najčešće korišten alat velik, sljedeće male, a ostale iza strelice uz naziv grupe.
- **Ulazni uređaji.** Dodirna podloga, olovka, 3D miš, kontroler i MIDI mogu upravljati aplikacijama.
- **Problemi.** Ploča Problemi koja upozorava u svim aplikacijama, s provjerama koje čitaju pakete propisa.
- **Uživo.** Prikaz tko je gdje u sesiji uživo.
- **Dodaci.** Popis dodataka, uključujući dodatke za rasvjetu.
- **Povežite svoju AI.** Svaki pomoćnik koji povežete može upravljati alatima CivilCrafta. Uz to ide napomena da povezivanje jednim klikom unutar CadCraft Studija i hostirani konektor još nisu spremni. Pogledajte [Neka AI pomoćnik radi s vašom lokacijom](topic:assistants).

## Ispravljeno u 0.8.1

- **Odjeljak klasa DWG-a.** Čitao se kao pogrešan tip (GitHub cadcraft#5). Ispravljeno u CivilCraftu uz CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Promjena jezika tijekom rada.** CadCraft Studio i spakirana izdanja mogu promijeniti jezik za vrijeme rada. Prije su bila samo na engleskom. Još nije provjeren na svim platformama: javite nam ako se jezik ne mijenja.

## Još nije u ovoj verziji

- **Ovo su pomoćna sredstva za proračun.** Svaki rezultat u novim prozorima treba provjeru inženjera. Čvrstoće tla polaze od tipičnih vrijednosti za skupinu tla, a prozor to i kaže.
- **Pusti kišu.** Izvođenje na uzorku lokacije može trajati više od dvije minute u pregledniku pri finoj ćeliji. Provjereno je na ručno izračunatim slučajevima i V-slivu, ali još ne na stvarnoj uređenoj lokaciji.
- **Adresa do lokacije.** Čita otvorene podatkovne datoteke koje donesete i testirana je samo na našim vlastitim datotekama. Stabla nisu izvor. Preuzimanje izvora za vas čeka tekst o privatnosti.
- **Napredak iz izmjera.** Testirano samo na izmišljenim izmjerama. Napredak na listovima i oznakama (MarkupCraft) te skeniranje naspram modela (BimCraft) nisu izrađeni.
- **Tla i pokosi.** Samo kružne plohe: nema pretraživanja klinova ni blokova i nema pukotine od vlaka.
- **Raskrižja.** Jedan polumjer po kraku, nema putanja zakretanja kamiona i još ne ulaze u koridor.
- **Terenske datoteke.** Čitači su pisani prema javnim opisima formata i isprobani na datotekama koje smo sami napravili. Potrebne su stvarne datoteke instrumenata.
- **Veze i željeznica.** Radioveze: samo slobodnoprostorno slabljenje i višestazna propagacija (bez slabljenja zbog kiše i uzoraka antene) te nema željezničkog standarda: svaka granica za željeznicu je privremena, s radnim brojevima koje nijedan inženjer za željeznicu nije provjerio.
- **Windows i macOS.** 0.8 nije potpisana kodom. Windows može upozoriti, a macOS traži desni klik pa Otvori.

Sve ostalo je u [Još nije izrađeno](topic:not-built-yet). Za raniju verziju pogledajte [Što je novo u verziji 0.7](topic:whats-new-0-7).
