---
title: Prelazak iz drugog građevinskog softvera
summary: Kako se poznati tokovi rada u građevinskom projektiranju preslikavaju u CivilCraft i razlike koje u prvom satu zbunjuju iskusne korisnike.
keywords: prelazak, migracija, poznato, razlike, tok rada, naredbe, preslikavanje, cogo, koridor, planiranje terena, mreža cijevi, stilovi, naredbeni redak
from: feae37d6
---

Ako ste koristili Civil 3D, već poznajete ideje u CivilCraftu: točke i skupine točaka, TIN terene s prijelomnicama i granicama, osi trase po PI-jevima, profile po PVI-jevima, sklopove provučene u koridore, planiranje do dnevnog svjetla, gravitacijske mreže cijevi, LandXML. Razlikuje se gotovo sve oko njih: nema datoteke crteža, nema naredbenog retka (osim ako ne odaberete stil izbornika {{ui:Klasično crtanje}}), nema stilova, nema Prospectora i nema dijaloga postavki. CivilCraft je mali, usredotočen alat u pregledniku i u ovoj verziji radi djelić onoga što cijeli građevinski paket. Ova stranica preslikava ono što znate na ono što ovdje postoji.

:::tip
Ako volite vrpcu programa Civil 3D, odaberite stil izbornika {{ui:Civilna vrpca}} u {{ui:Postavke}} › {{ui:CivilCraft}} › {{ui:Izbornici, tipke i miš}}: kartice Početna, Teren, Izmjena, Geolokacija, Prikaz i Izlaz; srednja tipka pomiče prikaz, a {{key:Shift}} sa srednjom tipkom kruži 3D prikazom. Ako tipkate naredbe, {{ui:Klasično crtanje}} dodaje naredbeni redak (ALIGNMENT, PAD, PROFILE, ZOOM …). Pogledajte [Izbornici, tipke i miš](topic:menus-keys-and-mouse).
:::

## Mapa tokova rada

| Što želite | Poznat način | U programu CivilCraft |
|---|---|---|
| Uvezite geodetske točke | Uvoz točaka datotekom formata točaka | {{ui:Otvori}}, zatim provjerite redoslijed stupaca u **Uvoz točaka** ([Uvoz geodetskih točaka](topic:import-points)) |
| Razvrstajte točke | Skupine točaka, ključevi opisa | Automatske skupine prema prvoj riječi opisa; nema ključeva opisa |
| Uredite točku | Uređivač točaka, ručke | Kliknite je i upišite u Svojstvima, ili je povucite ([Uredi geodetsku točku](topic:edit-points)) |
| Izradite postojeći teren | Stvaranje terena, dodavanje skupina točaka kao podataka | Automatski: teren se ponovno izrađuje kad god se promijene njegovi ulazi |
| Dodajte prijelomnice | Dodavanje prijelomnica iz polilinija ili značajnih linija | Postavite skupinu točaka na {{ui:Prijelomnica}}, ili kliknite točke alatom {{ui:Prijelomnica}} ({{key:B}}) |
| Skratite teren | Vanjska granica, unutarnja granica, najveća duljina trokuta | {{ui:Granica}} ({{key:O}}, samo vanjska) i **Najduži vanjski brid** |
| Prikažite izohipse | Stil površine | **Prikaz** u lijevoj ploči: razmak, svaka n-ta glavna, oznake, pojasevi, strelice nagiba |
| Iscrtajte središnju liniju | Alati za stvaranje osi, postavke krivina i spirala | {{ui:Os trase}} ({{key:A}}): kliknite PI-jeve, {{key:Enter}}; radijusi i duljine spirala u tablici PI-jeva |
| Stvorite prikaz profila | Čarobnjak za prikaz profila, pojasevi | {{ui:Profil}} ({{key:R}}): jedan prikaz profila ispod plana, uvijek prilagođen |
| Projektirajte nagib | Alati za raspored profila | {{ui:Započni od terena}}, {{ui:Dodaj PVI}} ({{key:I}}), povlačenje PVI-jeva, upisivanje **Krivina L** |
| Izradite cestu | Sklop, podsklopovi, koridor, ciljevi, regije | Označite **Provuci sklop duž projektnog profila** ispod osi trase; po jedna traka, bankina i bočni pokos sa svake strane, ili svaka strana izrađena od dijelova (žlijeb, rubnjak, pločnik …) |
| Uredite plato | Linije značajki, grupe planiranja, kriteriji planiranja | {{ui:Plato}} ({{key:G}}): ravni plato s iskopnim i nasipnim pokosima do dnevnog svjetla |
| Izračunajte zemljane radove | Površine volumena, nadzorna ploča volumena | **Zemljani radovi** u desnoj ploči, metoda mreže, ažurira se uživo |
| Složite oborinsku ili sanitarnu mrežu | Mreža cijevi s popisom dijelova, pravila | {{ui:Cijevi}} ({{key:P}}): kliknite građevine nizvodno; tri pravila koja postavljate; automatske kote dna |
| Razmjenjujte s drugima | Uvoz i izvoz LandXML-a | {{ui:Otvori}} LandXML datoteku; {{ui:LandXML}} za izvoz ([Razmjena LandXML-a](topic:landxml)) |
| Pošaljite linije u CAD | Izvoz u DWG | {{ui:DWG}} (format 2000 do 2018) ili {{ui:DXF}} (R12) |
| Ispišite | Layouti, viewporti, skupovi listova | {{ui:PDF}}: jedan vodoravni list plana u odabranom mjerilu; listovi plana i profila te presjeci kao PDF |
| Dijelite rad među datotekama | Prečaci podataka, reference | Nije dostupno: jedan projekt po datoteci |
| Poništite | Poništi | {{key:Mod+Z}} i {{key:Mod+Y}}, 200 koraka; postavke prikaza nisu koraci poništavanja |

## Razlike koje zbunjuju ljude

**Nema naredbenog retka** osim ako ne odaberete stil izbornika {{ui:Klasično crtanje}}. Alati su gumbi na alatnoj traci i pojedinačna slova: {{key:A}} os trase, {{key:G}} plato, {{key:P}} cijevi, {{key:B}} prijelomnica, {{key:O}} granica, {{key:R}} profil, {{key:I}} dodaj PVI, {{key:V}} odabir, {{key:F}} prilagodi. U drugim stilovima izbornika upisivanje naziva naredbe ne čini ništa. Pogledajte [Tipke i miš](topic:keyboard).

**Enter završava; dvostruki klik je rizičan.** Kliknite zadnju točku jednom, zatim pritisnite {{key:Enter}}. U ovoj verziji dvostruki klik također završava, ali odbacuje točku na koju ste dvaput kliknuli. Desni klik ne završava niti ponavlja; pomiče prikaz samo kad njime povučete.

**Sve je dinamično, uvijek.** Promijenite skupinu točaka, radijus, PVI ili nagib platoa, i teren, izohipse, koridor, linije dnevnog svjetla i volumeni odmah se ažuriraju. Ništa se ne izrađuje ponovno i ništa ne zastarijeva.

**Ništa nije objekt crteža.** Plan je prikaz projekta, a ne crtež koji možete uređivati CAD naredbama. Ne možete dodati vlastite linije ili tekst, promijeniti boju sloja ili rastaviti išta. Izvezite u DXF i dovršite crtež u CAD programu.

**Nema stilova.** Boje, debljine linija, veličine oznaka i nazivi slojeva su fiksni (vidi [Slojevi plana](topic:plan-layers)). Papir i Model na traci aplikacije prebacuju između svijetlog i tamnog zaslona.

**Po jedno.** Jedan postojeći teren, jedan rezultat planiranja, jedna mreža cijevi po projektu. Mnogo osi trase i platoa je u redu.

**Jedinice su oznake.** Odabir {{ui:Američke stope}} ili {{ui:Metri}} ništa ne pretvara. Nema mjerila crteža. Koordinatni sustav je izborni: postavite ga pod {{ui:Koordinate}} i ništa se ne pomiče, samo kaže što brojevi znače (vidi [Postavljanje koordinatnog sustava projekta](topic:coordinate-systems)). Stope se pri zapisu u LandXML tretiraju kao američke geodetske stope.

**Skupine prijelomnica spajaju se po redoslijedu brojeva točaka.** Skupina postavljena na {{ui:Prijelomnica}} postaje jedna linija kroz sve svoje točke, redom brojeva. Zajednički kodovi (dvije linije toka obje s oznakom „FL“) čine jednu cik-cak liniju; takve nacrtajte ručno.

**Stacionaže izgledaju isto, metri se razlikuju.** Stope koriste stacionaže od 100 ft (12+34.56); metri koriste stacionaže od 1000 m (1+234.567).

**Brisanje na Macu.** Tipka označena delete na Mac tipkovnici je {{key:Backspace}} za preglednik. Upotrijebite Fn i delete, ili gumb {{ui:Izbriši}}, da izbrišete odabir.

**Datoteke se preuzimaju.** {{ui:Spremi}} preuzima datoteku `.civilcraft.json` svaki put; nema „spremi preko otvorene datoteke“. Kopija oporavka nespremljenog rada čuva se u ovom pregledniku ([Oporavak nespremljenog rada](common:recover)). Otvaranje datoteke točaka zamjenjuje točke bez pitanja. Pogledajte [Datoteke koje možete otvoriti, spremiti i izvesti](topic:files).

**Pravila su vaša.** Pravila mreže cijevi i sklop koridora započinju s privremenim vrijednostima koje nisu standard. Postavite vlastita prije nego što vjerujete bilo kojoj provjeri.

**Volumeni se računaju po mreži.** Iskop i nasip dolaze iz fine mreže između dviju ploha, unutar linija dnevnog svjetla, bez rastresitosti i zbijanja. Blizu su, ali nisu isto što i TIN-na-TIN volumen.

## Što nedostaje

Spirale osim klotoide, sklopovi koji se mijenjaju duž ceste, nagnuti platoi, kapacitet slivnika i zadržavanje, katalozi dijelova, cijevi u profilu, raspored parcela i određivanje veličine parcela, izjednačenje najmanjim kvadratima i baze geodetskih podataka, otvaranje DWG datoteka i još. Potpuni popis, s onim što umjesto toga radite danas, nalazi se u [Još nije izrađeno](topic:not-built-yet).
