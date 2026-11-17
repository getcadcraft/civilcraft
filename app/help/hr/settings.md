---
title: Postavke CivilCrafta
summary: Izaberite redoslijed stupaca za kopirane i zalijepljene retke točaka te za pogađanje stupaca datoteke, kako se numeriraju zalijepljene točke, što prikazuju oznake točaka, indikator kuta, vertikalno pretjerivanje u 3D-u, kako se prikazuju geografska širina i dužina te dolaze li slojevi karte s interneta.
keywords: postavke, preference, pnezd, penzd, redoslijed stupaca, retci točaka, ponovno numeriranje, brojevi točaka, početni broj, oznake točaka, oznake, opis, kota, ViewCube, ikona osi, indikator kuta, kompas, vertikalno pretjerivanje, 3d, geografska širina, geografska dužina, dms, decimalni stupnjevi, slojevi karte, internet, privatnost
from: 64b9cb92
---

Otvorite {{ui:Postavke}} preko zupčanika na traci aplikacije ili {{key:Mod+,}}. Prva kartica, {{ui:CivilCraft}}, sadrži postavke koje pripadaju ovoj aplikaciji; {{ui:Općenito}} sadrži one koje dijele sve aplikacije CadCrafta (tema, alatna traka, ploče). Postavke CivilCrafta postoje samo u aplikaciji: mijenjate ih ovdje, a ovaj preglednik ih pamti. {{ui:Vrati postavke CivilCrafta na zadano}} vraća svaku postavku na početnu.

## Retci točaka

**P, N, E, Z, D** (na početku) ili **P, E, N, Z, D**: točka, sjever, istok, kota, opis, ili istok prije sjevera. Koristi se na tri mjesta:

- **Kopiraj**: retci koje CivilCraft stavlja u međuspremnik sustava za proračunsku tablicu.
- **Zalijepi**: reci zalijepljeni iz proračunske tablice ili tekstualne datoteke koji nemaju redak zaglavlja.
- **Uvoz**: pogađanje u dijaloškom okviru **Uvezi točke** kad datoteka nema redak zaglavlja (datoteka sa četiri stupca čita se kao PENZ, s tri kao ENZ). Vidi [Formati datoteka točaka](topic:point-file-formats).

Redak zaglavlja koji imenuje svoje stupce uvijek prevladava, kao i izbor na popisu **Stupci** u dijaloškom okviru uvoza.

## Brojevi zalijepljenih točaka

- **Zadrži slobodne brojeve** (na početku): zalijepljena točka zadržava svoj broj kad ga nijedna točka nema; samo sukobljene točke dobivaju nove brojeve.
- **Uvijek novi brojevi**: svaka zalijepljena točka dobiva novi broj, čak i ako je njezin vlastiti slobodan.

**Novi brojevi počinju od**: ostavite prazno da se broji od jedan više od najvećeg broja u uporabi. Upišite broj, na primjer 5000, da nove točke dobiju brojeve od 5000 naviše; brojevi koji su već u uporabi preskaču se. Dvije točke nikad ne dijele broj ni u jednom slučaju. Vidi [Odabir, kopiranje i lijepljenje točaka snimanja](topic:copy-paste-points#point-numbers-never-clash).

## Oznake točaka

Što oznaka točke prikazuje kad je {{ui:Oznake točaka}} uključeno pod **Prikaz**: **Broj**, **Broj i kota**, ili **Broj, kota i opis** (na početku). Izvozi u DXF, DWG i PDF prikazuju iste oznake kao zaslon.

## Indikator kuta

Što stoji u kutu tlocrta i 3D prikaza: **ViewCube** (na početku), **Ikona osi** ili **Nijedno**.

- **ViewCube** (gore desno). Na tlocrtu prikazuje gornju stranu, s prstenom kompasa: N je sjever mreže (prema vrhu tlocrta). Kliknite bilo koju drugu stranu, rub ili kut kocke, ili je povucite, i [3D prikaz](topic:site-3d) se otvara gledajući odatle. {{ui:Početak}} na kocki tlocrta prilagođava tlocrt.
- U 3D prikazu kocka se okreće s pogledom: kliknite stranu, rub ili kut da gledate odatle, povucite kocku za kruženje, povucite prsten kompasa za okretanje oko okomice, kliknite slovo da gledate s te strane, a za izometrijski prikaz cijelog lokaliteta koristite {{ui:Početak}}. Kad gledate ravno u stranu, male strelice prelaze na sljedeću stranu, a zakrivljene strelice okreću pogled za četvrtinu kruga.
- **Ikona osi** (dolje lijevo): mala oznaka X (istok) i Y (sjever) na tlocrtu, X, Y i Z (gore) u 3D-u.

## Vertikalno pretjerivanje u 3D-u

Koliko 3D prikaz rasteže kote: **1×**, **2×** (na početku), **3×**, **5×** ili **10×**. Popis na traci 3D prikaza je ista postavka, pa promjena jedne mijenja obje. Volumeni, profili i 3D izvozi ostaju u stvarnom mjerilu.

## Geografska širina i dužina

Kako statusna traka prikazuje geografsku širinu i dužinu pokazivača kad projekt ima koordinatni sustav: **stupnjevi, minute i sekunde** (na početku, na primjer `30°18′00.00″ N`) ili **decimalni stupnjevi** (`30.300000° N`). Vidi [Postavljanje koordinatnog sustava projekta](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Slojevi karte s interneta

**Isključeno** (na početku) ili **Uključeno**. Kad je uključeno, CivilCraft traži od poslužitelja karata koje dodate slike područja na zaslonu. Vaš crtež ostaje na ovom računalu; poslužitelj vidi područje i vašu internetsku adresu. Dok je isključeno, nijedan poslužitelj karata se ništa ne pita, čak i kad projekt koji otvorite navodi jedan; georeferencirana slika iz datoteke radi u oba slučaja. Vidi [Prikaži slojeve karte ispod tlocrta](topic:map-layers).

## Pomoćnici

**Dopusti AI pomoćnicima i skriptama da koriste CivilCrafta** (na početku isključeno) omogućuje pomoćniku na vašem računalu da dođe do otvorenog lokaliteta preko CadCraft Studija: **Čitaj** opisuje lokalitet i daje točke, kote površine, stacionaže, profile, volumene i parcele; **Uredi** mu omogućuje odabir i dodavanje točaka snimanja; **Spremi** i **Izvezi** mu omogućuju spremanje projekta i pisanje LandXML-a ili DWG-a. **Mape koje smije koristiti** (u Studiju) su mjesta gdje smije spremati i izvoziti. **Aktivnost** navodi njegove pozive. Vidi [Neka AI pomoćnik radi s vašim lokalitetom](topic:assistants).
