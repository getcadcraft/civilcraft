---
title: Dolazak iz drugog građevinskog softvera
summary: Kako poznati tokovi građevinskog projektovanja odgovaraju CivilCraft-u, i razlike koje zbunjuju iskusne korisnike u prvom satu.
keywords: prelazak, migracija, poznato, razlike, tok rada, komande, mapiranje, cogo, koridor, nivelacija, mreža cevi, stilovi, komandna linija
from: feae37d6
---

Ako ste koristili Civil 3D, već znate ideje u CivilCraft-u: tačke i grupe tačaka, TIN površine sa linijama loma i granicama, trase preko PI, profile preko PVI, sklopove provučene u koridore, nivelisanje do preseka sa terenom, gravitacione mreže cevi, LandXML. Različito je skoro sve oko njih: nema datoteke crteža, nema komandne linije (osim ako ne izaberete stil menija {{ui:Klasičan crtački}}), nema stilova, nema Prospector-a i nema dijaloga podešavanja. CivilCraft je mali, usredsređen alat u pregledaču, i u ovoj verziji radi deo onoga što radi kompletan građevinski paket. Ova stranica povezuje ono što znate sa onim što je ovde.

:::tip
Ako volite traku Civil 3D-a, izaberite stil menija {{ui:Civilna traka}} u {{ui:Podešavanja}} › {{ui:CivilCraft}} › {{ui:Meniji, tasteri i miš}}: kartice Početna, Površine, Izmena, Geolokacija, Prikaz i Izlaz, srednje dugme pomera pogled, a {{key:Shift}} sa srednjim dugmetom orbitira 3D prikaz. Ako kucate komande, {{ui:Klasičan crtački}} dodaje komandnu liniju (ALIGNMENT, PAD, PROFILE, ZOOM …). Videti [Meniji, tasteri i miš](topic:menus-keys-and-mouse).
:::

## Mapa toka rada

| Šta želite da uradite | Poznat način | U CivilCraft-u |
|---|---|---|
| Uvezti geodetske tačke | Uvoz tačaka u formatu datoteke tačaka | {{ui:Otvori}}, pa proverite redosled kolona u **Uvoz tačaka** ([Uvoz geodetskih tačaka](topic:import-points)) |
| Sortirati tačke | Grupe tačaka, ključevi opisa | Automatske grupe po prvoj reči opisa; nema ključeva opisa |
| Urediti tačku | Uređivač tačaka, hvataljke | Kliknite je i upišite u Svojstva, ili je prevucite ([Uredite geodetsku tačku](topic:edit-points)) |
| Izgraditi postojeći teren | Kreiraj površinu, dodaj grupe tačaka kao podatke | Automatski: površina se ponovo gradi kad god se njeni ulazi promene |
| Dodati linije loma | Dodaj linije loma iz polilinija ili linija oblika | Postavite grupu tačaka na {{ui:Linija loma}}, ili kliknite tačke alatom {{ui:Linija loma}} ({{key:B}}) |
| Skratiti površinu | Spoljna granica, granica skrivanja, najveća dužina trougla | {{ui:Granica}} ({{key:O}}, samo spoljna) i **Najduža spoljna ivica** |
| Prikazati konture | Stil površine | **Prikaz** u levom panelu: interval, glavna svaka, oznake, pojasevi, strelice nagiba |
| Postaviti osovinu | Alati za kreiranje trase, podešavanja krivina i spirala | {{ui:Trasa}} ({{key:A}}): kliknite PI, {{key:Enter}}; radijusi i dužine spirala u tabeli PI |
| Napraviti prikaz profila | Čarobnjak za prikaz profila, pojasevi | {{ui:Profil}} ({{key:R}}): jedan prikaz profila ispod plana, uvek prilagođen |
| Projektovati niveletu | Alati za raspored profila | {{ui:Počni od terena}}, {{ui:Dodaj PVI}} ({{key:I}}), prevucite PVI, upišite **Krivina L** |
| Izgraditi put | Sklop, podsklopovi, koridor, ciljevi, regioni | Štiklirajte **Provuci sklop duž projektnog profila** ispod trase; traka, rame i nagib strane sa svake strane, ili svaka strana izgrađena od delova (oluk, ivičnjak, trotoar …) |
| Nivelisati plato | Linije oblika, grupe nivelisanja, kriterijumi nivelisanja | {{ui:Plato}} ({{key:G}}): ravan plato sa kosinama iskopa i nasipa do preseka sa terenom |
| Izračunati zemljane radove | Površine zapremina, kontrolna tabla zapremina | **Zemljani radovi** u desnom panelu, metoda mreže, ažurira se uživo |
| Postaviti kišnu ili fekalnu kanalizaciju | Mreža cevi sa spiskom delova, pravilima | {{ui:Cevi}} ({{key:P}}): kliknite objekte nizvodno; tri pravila koja postavljate; automatski nivoi dna |
| Razmeniti podatke sa drugima | Uvoz i izvoz LandXML-a | {{ui:Otvori}} LandXML datoteku; {{ui:LandXML}} za izvoz ([Razmena LandXML-a](topic:landxml)) |
| Poslati linije u CAD | Izvoz u DWG | {{ui:DWG}} (format 2000 do 2018) ili {{ui:DXF}} (R12) |
| Štampati | Rasporedi, prozori pogleda, setovi listova | {{ui:PDF}}: jedan list plana u pejzažnoj orijentaciji u izabranoj razmeri; listovi plana i profila i listovi preseka kao PDF |
| Deliti između datoteka | Skraćenice podataka, reference | Nije dostupno: jedan projekat po datoteci |
| Poništiti | Opozovi | {{key:Mod+Z}} i {{key:Mod+Y}}, 200 koraka; podešavanja prikaza nisu koraci za poništavanje |

## Razlike koje zbunjuju ljude

**Nema komandne linije** osim ako ne izaberete stil menija {{ui:Klasičan crtački}}. Alati su dugmad na traci i pojedinačna slova: {{key:A}} trasa, {{key:G}} plato, {{key:P}} cevi, {{key:B}} linija loma, {{key:O}} granica, {{key:R}} profil, {{key:I}} dodaj PVI, {{key:V}} izbor, {{key:F}} prilagodi. U ostalim stilovima menija, kucanje imena komande ne radi ništa. Videti [Tasteri i miš](topic:keyboard).

**Enter završava; dvoklik je riskantan.** Kliknite poslednju tačku jednom, pa pritisnite {{key:Enter}}. U ovoj verziji i dvoklik završava, ali briše tačku na koju ste kliknuli dvaput. Desni klik ne završava niti ponavlja; pomera pogled samo kada njime prevlačite.

**Sve je dinamično, uvek.** Promenite grupu tačaka, radijus, PVI ili nagib platoa, i površina, konture, koridor, linije preseka sa terenom i zapremine se odmah ažuriraju. Nema šta da se ponovo gradi i ništa ne zastareva.

**Ništa nije objekat crteža.** Plan je prikaz projekta, a ne crtež koji možete menjati CAD komandama. Ne možete dodati sopstvene linije ili tekst, promeniti boju sloja ili razbiti bilo šta. Izvezite u DXF i završite crtež u CAD programu.

**Nema stilova.** Boje, debljine linija, veličine oznaka i nazivi slojeva su fiksirani (videti [Slojevi plana](topic:plan-layers)). Papir i Model na traci aplikacije prebacuju između svetlog i tamnog ekrana.

**Jedan od svakog.** Jedna postojeća površina terena, jedna nivelisana, jedna mreža cevi po projektu. Mnogo trasa i platoa je u redu.

**Jedinice su oznake.** Izbor {{ui:američke geodetske stope}} ili {{ui:Metri}} ništa ne pretvara. Nema razmere crteža. Koordinatni sistem je opcion: postavite ga pod {{ui:Koordinate}} i ništa se ne pomera; samo kaže šta brojevi znače (videti [Postavljanje koordinatnog sistema projekta](topic:coordinate-systems)). Stope se u LandXML-u tretiraju kao američke geodetske stope.

**Grupe linija loma se spajaju po rednom broju tačke.** Grupa postavljena na {{ui:Linija loma}} postaje jedna linija kroz sve svoje tačke, po rednom broju. Zajednički kodovi (dva toka oba kodirana „FL“) prave jednu cik-cak liniju; nacrtajte ih ručno.

**Stacionaže izgledaju isto, metri se razlikuju.** Stope koriste stacionaže od 100 ft (12+34.56); metri koriste stacionaže od 1000 m (1+234.567).

**Brisanje na Mac-u.** Mac taster označen sa delete je u pregledaču {{key:Backspace}}. Koristite Fn i delete, ili dugme {{ui:Izbriši}}, da obrišete izbor.

**Datoteke su preuzimanja.** {{ui:Sačuvaj}} preuzima datoteku `.civilcraft.json` svaki put; nema „sačuvaj preko otvorene datoteke“. Kopija za oporavak nesačuvanog rada čuva se u ovom pregledaču ([Oporavak nesačuvanog rada](common:recover)). Otvaranje datoteke tačaka zamenjuje tačke bez pitanja. Videti [Datoteke koje možete otvoriti, sačuvati i izvesti](topic:files).

**Pravila su vaša.** Pravila mreže cevi i sklop koridora počinju sa vrednostima koje su samo mesto za držanje i nisu standard. Postavite sopstvena pre nego što verujete bilo kojoj proveri.

**Zapremine su zasnovane na mreži.** Iskop i nasip dolaze iz fine mreže između dve površine, unutar linija preseka sa terenom, bez bubrenja i skupljanja. Blizu su, ali nisu isti kao TIN-na-TIN zapremina.

## Šta nedostaje

Spirale osim klotoidne, sklopovi koji se menjaju duž puta, nagnuti platoi, kapacitet slivnika i zadržavanje, katalozi delova, cevi u profilu, raspored parcela i određivanje veličine parcela, izravnanje metodom najmanjih kvadrata i baze podataka geodetskih snimanja, otvaranje DWG-a i još. Potpuni spisak, sa onim što se danas radi umesto toga, nalazi se u [Još nije izgrađeno](topic:not-built-yet).
