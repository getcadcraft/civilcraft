---
title: Dolazak iz drugog građevinskog softvera
summary: Kako poznati tokovi rada u građevinskom projektovanju odgovaraju CivilCraftu, i razlike koje iskusne korisnike spotaknu u prvom satu.
keywords: prebacivanje, migracija, poznato, razlike, tok rada, komande, mapiranje, cogo, koridor, nivelacija, mreža cijevi, stilovi, naredbena linija
from: feae37d6
---

Ako si koristio Civil 3D, već poznaješ ideje u CivilCraftu: tačke i grupe tačaka, TIN površine sa prelomnim linijama i granicama, trase preko PI tačaka, profile preko PVI tačaka, presjeke ugrađene u koridore, nivelaciju do dnevnog svjetla, gravitacione mreže cijevi, LandXML. Gotovo sve oko njih je drugačije: nema datoteke crteža, nema naredbene linije (osim ako ne izabereš stil menija {{ui:Klasični nacrt}}), nema stilova, nema Prospectora i nema dijaloga postavki. CivilCraft je mali, usredsređeni alat u pregledaču, i u ovoj verziji radi djelić onoga što cijeli građevinski paket radi. Ova stranica preslikava ono što znaš na ono što je ovdje.

:::tip
Ako voliš traku Civil 3D-a, izaberi stil menija {{ui:Građevinska traka}} u {{ui:Postavke}} › {{ui:CivilCraft}} › {{ui:Meniji, tipke i miš}}: kartice Početna, Površine, Izmjena, Geolokacija, Pogled i Izlaz; srednje dugme pomjera pogled, a {{key:Shift}} sa srednjim dugmetom rotira 3D prikaz. Ako kucaš komande, {{ui:Klasični nacrt}} dodaje naredbenu liniju (ALIGNMENT, PAD, PROFILE, ZOOM …). Vidi [Meniji, tipke i miš](topic:menus-keys-and-mouse).
:::

## Mapa toka rada

| Šta želiš da uradiš | Poznat način | U CivilCraftu |
|---|---|---|
| Uvesti tačke geodetskog snimanja | Uvoz tačaka preko formata datoteke tačaka | {{ui:Otvori}}, zatim provjeri redoslijed kolona u **Uvoz tačaka** ([Uvoz tačaka geodetskog snimanja](topic:import-points)) |
| Sortirati tačke | Grupe tačaka, ključevi opisa | Automatske grupe po prvoj riječi opisa; nema ključeva opisa |
| Urediti tačku | Uređivač tačaka, ručke | Klikni je i upiši u Svojstva, ili je prevuci ([Uredi tačku geodetskog snimanja](topic:edit-points)) |
| Izgraditi postojeći teren | Kreiraj površinu, dodaj grupe tačaka kao podatke | Automatski: površina se ponovo gradi kad god se njeni ulazi promijene |
| Dodati prelomne linije | Dodaj prelomne linije iz polilinija ili linija karakteristika | Postavi grupu tačaka na {{ui:Prelomna linija}}, ili klikni tačke alatom {{ui:Prelomna linija}} ({{key:B}}) |
| Odrezati površinu | Vanjska granica, skrivena granica, najveća dužina trougla | {{ui:Granica}} ({{key:O}}, samo vanjska) i **Najduža vanjska ivica** |
| Prikazati konture | Stil površine | **Prikaz** u lijevom panelu: interval, glavna svaka, oznake, pojasevi, strelice nagiba |
| Iscrtati osu | Alati za kreiranje osovine, postavke krivine i spirale | {{ui:Trasa}} ({{key:A}}): klikni PI tačke, {{key:Enter}}; poluprečnici i dužine spirala u tabeli PI |
| Kreirati prikaz profila | Čarobnjak prikaza profila, pojasevi | {{ui:Profil}} ({{key:R}}): jedan prikaz profila ispod plana, uvijek prilagođen |
| Projektovati nagib | Alati za raspored profila | {{ui:Počni od terena}}, {{ui:Dodaj PVI}} ({{key:I}}), prevuci PVI tačke, upiši **Krivina L** |
| Izgraditi put | Sklop, podsklopovi, koridor, ciljevi, regioni | Označi **Prevuci sklop duž projektnog profila** ispod trase; traka, rame i nagib strane sa svake strane, ili svaka strana izgrađena od dijelova (slivnik, ivičnjak, trotoar …) |
| Izravnati plato | Linije karakteristika, grupe izravnavanja, kriteriji izravnavanja | {{ui:Plato}} ({{key:G}}): ravan plato sa nagibima iskopa i nasipa do dnevnog svjetla |
| Izračunati zemljane radove | Površine zapremina, nadzorna tabla zapremina | **Zemljani radovi** u desnom panelu, metoda mreže, ažurira se uživo |
| Projektovati kišnu ili sanitarnu kanalizaciju | Mreža cijevi sa spiskom dijelova, pravila | {{ui:Cijevi}} ({{key:P}}): klikni objekte nizvodno; tri pravila koja postaviš; automatski nivoi dna |
| Razmjenjivati sa drugima | Uvoz i izvoz LandXML-a | {{ui:Otvori}} LandXML datoteku; {{ui:LandXML}} za izvoz ([Razmjena LandXML-a](topic:landxml)) |
| Poslati linije u CAD | Izvoz u DWG | {{ui:DWG}} (format 2000 do 2018) ili {{ui:DXF}} (R12) |
| Isplotati | Rasporedi, prikazi, skupovi listova | {{ui:PDF}}: jedan horizontalni list plana u izabranoj razmjeri; listovi plana i profila i listovi presjeka kao PDF |
| Dijeliti rad među datotekama | Skraćenice podataka, reference | Nije dostupno: jedan projekat po datoteci |
| Poništiti | Poništi | {{key:Mod+Z}} i {{key:Mod+Y}}, 200 koraka; postavke prikaza nisu koraci poništavanja |

## Razlike koje spotiču ljude

**Nema naredbene linije** osim ako ne izabereš stil menija {{ui:Klasični nacrt}}. Alati su dugmad na traci i pojedinačna slova: {{key:A}} trasa, {{key:G}} plato, {{key:P}} cijevi, {{key:B}} prelomna linija, {{key:O}} granica, {{key:R}} profil, {{key:I}} dodaj PVI, {{key:V}} odaberi, {{key:F}} prilagodi. U drugim stilovima menija, kucanje imena komande ne radi ništa. Vidi [Tipke i miš](topic:keyboard).

**Enter završava; dvostruki klik je rizičan.** Klikni posljednju tačku jednom, pa pritisni {{key:Enter}}. U ovoj verziji i dvostruki klik završava, ali odbacuje tačku na koju si dvaput kliknuo. Desni klik ne završava niti ponavlja; samo pomjera pogled kad ga prevučeš.

**Sve je dinamično, uvijek.** Promijeni grupu tačaka, poluprečnik, PVI ili nagib platoa, i površina, konture, koridor, linije dnevnog svjetla i zapremine se odmah ažuriraju. Nema šta da se ponovo gradi i ništa ne zastari.

**Ništa nije objekat crteža.** Plan je prikaz projekta, a ne crtež koji možeš uređivati CAD komandama. Ne možeš dodati svoje linije ili tekst, promijeniti boju sloja ili rastaviti bilo šta. Izvezi u DXF i završi crtež u CAD programu.

**Nema stilova.** Boje, debljine linija, veličine oznaka i nazivi slojeva su fiksirani (vidi [Slojevi plana](topic:plan-layers)). Paper i Model na traci aplikacije prebacuju između svijetlog i tamnog ekrana.

**Po jedno od svega.** Jedna postojeća površina terena, jedna izravnata površina, jedna mreža cijevi po projektu. Mnogo trasa i platoa je u redu.

**Jedinice su oznake.** Izbor {{ui:US stope}} ili {{ui:Metri}} ništa ne pretvara. Nema razmjere crteža. Koordinatni sistem je opcionalan: postavi ga pod {{ui:Koordinate}} i ništa se ne pomjera, samo kaže šta brojevi znače (vidi [Postavi koordinatni sistem projekta](topic:coordinate-systems)). Stope se pri zapisu u LandXML tretiraju kao američke geodetske stope.

**Grupe prelomnih linija se spajaju po redoslijedu brojeva tačaka.** Grupa postavljena na {{ui:Prelomna linija}} postaje jedna linija kroz sve svoje tačke, po redu brojeva. Zajednički kodovi (dvije linije toka kodirane „FL”) čine jednu cik-cak liniju; te nacrtaj ručno.

**Stacionaže izgledaju isto, metri se razlikuju.** Stope koriste stacionaže od 100 ft (12+34.56); metri koriste stacionaže od 1000 m (1+234.567).

**Brisanje na Mac-u.** Taster na Mac-u označen sa delete je Backspace za pregledač. Koristi Fn i delete, ili dugme {{ui:Izbriši}}, da obrišeš izbor.

**Datoteke su preuzimanja.** {{ui:Spasi}} preuzima datoteku `.civilcraft.json` svaki put; nema „spasi preko otvorene datoteke”. Kopija oporavka nespašenog rada čuva se u ovom pregledaču ([Oporavi nespašeni rad](common:recover)). Otvaranje datoteke tačaka zamjenjuje tačke bez pitanja. Vidi [Datoteke koje možeš otvoriti, spasiti i izvesti](topic:files).

**Pravila su tvoja.** Pravila mreže cijevi i sklop koridora počinju sa zamjenskim vrijednostima koje nisu standard. Postavi svoja prije nego što vjeruješ bilo kojoj provjeri.

**Zapremine su zasnovane na mreži.** Iskop i nasip dolaze iz fine mreže između dvije površine, unutar linija dnevnog svjetla, bez bubrenja ili skupljanja. Blizu su, ali nisu isto što i TIN-na-TIN zapremina.

## Šta nedostaje

Spirale osim klotoidnih, sklopovi koji se mijenjaju duž puta, nagnuti platoi, kapacitet slivnika i zadržavanje, katalozi dijelova, cijevi u profilu, raspored parcela i određivanje veličine parcela, izravnanje po najmanjim kvadratima i baze podataka geodetskog snimanja, otvaranje DWG-a, i više. Pun spisak, sa onim što raditi umjesto toga danas, nalazi se u [Još nije izgrađeno](topic:not-built-yet).
