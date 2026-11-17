---
title: Postavke CivilCraft-a
summary: Izaberite redoslijed kolona za kopirane i zalijepljene redove tačaka i za pogađanje kolona datoteke, kako se numerišu zalijepljene tačke, šta prikazuju oznake tačaka, indikator ugla, vertikalno uvećanje u 3D-u, kako se prikazuju geografska širina i dužina, te da li slojevi karte dolaze s interneta.
keywords: postavke, preference, pnezd, penzd, redoslijed kolona, redovi tačaka, preimenovanje brojeva, brojevi tačaka, početni broj, oznake tačaka, oznake, opis, kota, kocka pogleda, ikona osa, indikator ugla, kompas, vertikalno uvećanje, 3d, geografska širina, geografska dužina, dms, decimalni stepeni, slojevi karte, internet, privatnost
from: 64b9cb92
---

Otvori {{ui:Postavke}} zupčanikom u traci aplikacije ili {{key:Mod+,}}. Prva kartica, {{ui:CivilCraft}}, sadrži postavke koje pripadaju ovoj aplikaciji; {{ui:Opšte}} sadrži one koje dijele sve CadCraft aplikacije (tema, traka s alatima, paneli). Postavke CivilCraft-a postoje samo u aplikaciji: mijenjaš ih ovdje, a ovaj pretraživač ih pamti. {{ui:Reset CivilCraft settings}} vraća svaku postavku na početnu.

## Redovi tačaka

**P, N, E, Z, D** (početni) ili **P, E, N, Z, D**: tačka (P), sjever (N), istok (E), kota (Z), opis (D), ili istok prije sjevera. Koristi se na tri mjesta:

- **Kopiraj**: redovi koje CivilCraft stavlja u sistemski međuspremnik za tabelarni program.
- **Zalijepi**: redovi zalijepljeni iz tabelarnog programa ili tekstualne datoteke koji nemaju red zaglavlja.
- **Uvezi**: pogađanje u dijalogu **Uvoz tačaka** kada datoteka nema red zaglavlja (datoteka sa četiri kolone se čita kao PENZ, tri kao ENZ). Vidi [Formati datoteka tačaka](topic:point-file-formats).

Red zaglavlja koji imenuje svoje kolone uvijek pobjeđuje, kao i izbor u listi **Kolone** u dijalogu za uvoz.

## Brojevi za zalijepljene tačke

- **Zadrži slobodne brojeve** (početni): zalijepljena tačka zadržava svoj broj kada ga nijedna tačka nema; samo sukobljene tačke dobijaju nove brojeve.
- **Uvijek novi brojevi**: svaka zalijepljena tačka dobija novi broj, čak i ako je njen vlastiti slobodan.

**Novi brojevi počinju od**: ostavi prazno da se broji od jedan više od najvećeg broja u upotrebi. Upiši broj, na primjer 5000, da nove tačke dobiju brojeve od 5000 naviše; brojevi koji su već u upotrebi se preskaču. Nijedne dvije tačke nikad ne dijele broj ni u jednom slučaju. Vidi [Odaberi, kopiraj i zalijepi tačke snimanja](topic:copy-paste-points#point-numbers-never-clash).

## Oznake tačaka

Šta oznaka tačke prikazuje kada je {{ui:Oznake tačaka}} uključeno pod **Prikaz**: **Broj**, **Broj i kota** ili **Broj, kota i opis** (početni). Izvozi DXF, DWG i PDF prikazuju iste oznake kao ekran.

## Indikator ugla

Šta stoji u uglu plana i 3D pogleda: **Kocka pogleda** (početna), **Ikona osa** ili **Nijedna**.

- **Kocka pogleda** (gore desno). Na planu prikazuje vrh, s prstenom kompasa: N je mrežni sjever (gore na planu). Klikni bilo koju drugu stranu, ivicu ili ugao kocke, ili je prevuci, i [3D pogled](topic:site-3d) se otvara gledajući odatle. {{ui:Početna}} na kocki plana uklapa plan.
- U 3D pogledu kocka se okreće s pogledom: klikni stranu, ivicu ili ugao da gledaš odatle, prevuci kocku da orbitiraš, prevuci prsten kompasa da okreneš oko vertikale, klikni slovo da gledaš s te strane, i koristi {{ui:Početna}} za izometrijski pogled na cijelu lokaciju. Kada gledaš ravno u stranu, male strelice prelaze na sljedeću stranu, a zakrivljene strelice okreću pogled za četvrtinu.
- **Ikona osa** (dolje lijevo): mali oznake X (istok) i Y (sjever) na planu, X, Y i Z (gore) u 3D.

## Vertikalno uvećanje u 3D-u

Koliko 3D pogled rasteže kote: **1×**, **2×** (početni), **3×**, **5×** ili **10×**. Lista na traci 3D pogleda je ista postavka, pa promjena jedne mijenja obje. Zapremine, profili i 3D izvozi ostaju u pravoj razmjeri.

## Geografska širina i dužina

Kako statusna traka prikazuje geografsku širinu i dužinu pokazivača kada projekat ima koordinatni sistem: **stepeni, minute i sekunde** (početni, na primjer `30°18′00.00″ N`) ili **decimalni stepeni** (`30.300000° N`). Vidi [Postavi koordinatni sistem projekta](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Slojevi karte s interneta

**Isključeno** (početni) ili **Uključeno**. Kada je uključeno, CivilCraft traži od servera karata koje dodaš slike područja na ekranu. Vaš crtež ostaje na ovom računaru; server vidi područje i vašu internet adresu. Dok je isključeno, nijedan server karata se ništa ne pita, čak i kada projekat koji otvorite ga imenuje; georeferencirana slika iz datoteke radi u oba slučaja. Vidi [Prikaži slojeve karte ispod plana](topic:map-layers).

## Pomoćnici

**Dozvoli AI pomoćnicima i skriptama da koriste CivilCraft** (isključeno na početku) dopušta pomoćniku na vašem računaru da dođe do otvorene lokacije kroz CadCraft Studio: **Čitaj** opisuje lokaciju i daje tačke, kote površina, stacionaže, profile, zapremine i parcele; **Uredi** mu dopušta da bira i dodaje tačke snimanja; **Spasi** i **Izvezi** mu dopuštaju da spasi projekat i upiše LandXML ili DWG. **Fascikle koje može koristiti** (u Studiju) su mjesta gdje smije spašavati i izvoziti. **Aktivnost** navodi njegove pozive. Vidi [Dozvoli AI pomoćniku da radi s vašom lokacijom](topic:assistants).
