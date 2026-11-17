---
title: Podešavanja CivilCraft-a
summary: Izaberite redosled kolona za kopirane i nalepljene redove tačaka i za pogađanje kolona datoteke, kako se nalepljene tačke numerišu, šta oznake tačaka prikazuju, indikator ugla, vertikalno uveličanje u 3D, prikaz geografske širine i dužine, i da li slojevi mape dolaze s interneta.
keywords: podešavanja, postavke, pnezd, penzd, redosled kolona, redovi tačaka, prenumerisanje, brojevi tačaka, početni broj, oznake tačaka, oznake, opis, kota, kocka prikaza, indikator ose, indikator ugla, kompas, vertikalno uveličanje, 3d, geografska širina, geografska dužina, dms, decimalni stepeni, slojevi mape, internet, privatnost
from: 64b9cb92
---

Otvorite {{ui:Podešavanja}} sa zupčanikom u traci aplikacije ili pritiskom na {{key:Mod+,}}. Prva kartica, {{ui:CivilCraft}}, sadrži podešavanja koja pripadaju ovoj aplikaciji; {{ui:Opšte}} sadrži ona koja dele sve CadCraft aplikacije (tema, traka alata, paneli). Podešavanja CivilCraft-a postoje samo u aplikaciji: menjate ih ovde, a ovaj pregledač ih pamti. {{ui:Vrati podešavanja programa CivilCraft}} vraća svako podešavanje na početno stanje.

## Redovi tačaka

**P, N, E, Z, D** (početno) ili **P, E, N, Z, D**: tačka, sever, istok, kota, opis, ili istok pre severa. Koristi se na tri mesta:

- **Kopiraj**: redovi koje CivilCraft stavlja u sistemsku memoriju za tabelarni program.
- **Nalepi**: redovi nalepljeni iz tabelarnog programa ili tekstualne datoteke koji nemaju red zaglavlja.
- **Uvoz**: pogađanje u dijalogu **Uvoz tačaka** kad datoteka nema red zaglavlja (datoteka sa četiri kolone čita se kao PENZ, a sa tri kao ENZ). Pogledajte [Formati datoteka tačaka](topic:point-file-formats).

Red zaglavlja koji imenuje svoje kolone uvek pobeđuje, kao i izbor u listi **Kolone** u dijalogu uvoza.

## Brojevi za nalepljene tačke

- **Zadrži slobodne brojeve** (početno): nalepljena tačka zadržava svoj broj kad ga nijedna tačka nema; samo tačke koje se sukobljavaju dobijaju nove brojeve.
- **Uvek novi brojevi**: svaka nalepljena tačka dobija novi broj, čak i ako je njen sopstveni slobodan.

**Novi brojevi počinju od**: ostavite prazno da se broji od jedan više od najvećeg broja u upotrebi. Upišite broj, na primer 5000, da novim tačkama dodelite brojeve od 5000 naviše; brojevi koji su već u upotrebi se preskaču. Ni u jednom slučaju dve tačke ne dele isti broj. Pogledajte [Izaberi, kopiraj i nalepi geodetske tačke](topic:copy-paste-points#point-numbers-never-clash).

## Oznake tačaka

Šta oznaka tačke prikazuje kad je {{ui:Oznake tačaka}} uključeno pod **Prikaz**: **Broj**, **Broj i kota** ili **Broj, kota i opis** (početno). Izvozi DXF, DWG i PDF prikazuju iste oznake kao na ekranu.

## Indikator ugla

Šta stoji u uglu plana i 3D prikaza: **Kocka prikaza** (početno), **Ikona ose** ili **Ništa**.

- **Kocka prikaza** (gore desno). Na planu prikazuje vrh, sa prstenom kompasa: N je pravi sever mreže (gore na planu). Kliknite bilo koju drugu stranu, ivicu ili ugao kocke, ili je prevucite, i [3D prikaz](topic:site-3d) se otvara gledajući odatle. {{ui:Početna}} na kocki plana uklapa plan.
- U 3D prikazu kocka se okreće s prikazom: kliknite stranu, ivicu ili ugao da gledate odatle, prevucite kocku da orbitirate, prevucite prsten kompasa da okrenete oko vertikale, kliknite slovo da gledate sa te strane, a {{ui:Početna}} daje izometrijski prikaz cele lokacije. Kad gledate pravo u stranu, male strelice prelaze na sledeću stranu, a zakrivljene strelice okreću prikaz za četvrt kruga.
- **Ikona ose** (dole levo): mala oznaka X (istok) i Y (sever) na planu, X, Y i Z (gore) u 3D.

## 3D vertikalno uveličanje

Koliko 3D prikaz rasteže kote: **1×**, **2×** (početno), **3×**, **5×** ili **10×**. Lista na traci 3D prikaza je ista postavka, pa promena jedne menja obe. Zapremine, profili i 3D izvozi ostaju u pravoj razmeri.

## Geografska širina i dužina

Kako statusna traka prikazuje pokazivačevu geografsku širinu i dužinu kad projekat ima koordinatni sistem: **stepeni, minuti i sekunde** (početno, na primer `30°18′00.00″ N`) ili **decimalni stepeni** (`30.300000° N`). Pogledajte [Postavite koordinatni sistem projekta](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Slojevi mape s interneta

**Isključeno** (početno) ili **Uključeno**. Kad je uključeno, CivilCraft traži od servera mapa koje dodate slike područja na ekranu. Vaš crtež ostaje na ovom računaru; server vidi područje i vašu internet adresu. Dok je isključeno, nijedan server mape se ništa ne pita, čak ni kad projekat koji otvorite ga navodi; georeferencirana slika iz datoteke radi u oba slučaja. Pogledajte [Prikaz slojeva mape ispod plana](topic:map-layers).

## Asistenti

**Dozvoli AI asistentima i skriptama da koriste CivilCraft** (na početku isključeno) dozvoljava asistentu na vašem računaru da dođe do otvorene lokacije preko CadCraft Studio: **Čitaj** opisuje lokaciju i daje tačke, kote površine, stacionaže, profile, zapremine i parcele; **Uredi** dozvoljava da bira i dodaje geodetske tačke; **Sačuvaj** i **Izvezi** dozvoljavaju da sačuva projekat i upiše LandXML ili DWG. **Fascikle koje sme da koristi** (u Studiju) su mesta gde sme da čuva i izvozi. **Aktivnost** navodi njegove pozive. Pogledajte [Dozvolite AI asistentu da radi s vašom lokacijom](topic:assistants).
