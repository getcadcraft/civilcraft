---
title: Projektovanje uzdužnog profila
summary: Otvorite prikaz profila, započnite projektni profil od terena, dodajte i prevucite PVI, postavite dužine vertikalnih krivina te pročitajte nagibe, K vrijednosti i najviše i najniže tačke.
keywords: profil, osa trase, pvi, vertikalna krivina, nagib, k vrijednost, izbočina, udubljenje, bvc, evc, prikaz profila, završni nagib, fg, postojeći profil terena, linije obilježja u profilu, ukrštanja, projicirano, ivičnjak, jarak, oznake
from: e9182bfa
---

Svaka osa trase ima jedan projektni profil: niz PVI (stacionaža i kota) spojenih pravim nagibima, s simetričnom paraboličnom vertikalnom krivinom na svakoj unutrašnjoj PVI koja ima dužinu. Postojeći profil terena uzorkuje se iz površine za vas.

## Otvorite prikaz profila

1. Odaberite osu trase (kliknite je s {{ui:Odaberi}}).
2. Pritisnite {{key:R}}, ili kliknite {{ui:Uzdužni profil}} u traci sa alatima, ili {{ui:Otvori prikaz profila}} na dnu desnog panela.
   Prikaz profila otvara se ispod plana s postojećim terenom duž trase. S dvije ili više osa, odaberite jednu na listi lijevo u traci profila.

Prikaz uvijek prikazuje cijelu trasu i rasteže kote da popune panel; uvećanje se ispisuje u donjem lijevom uglu, na primjer "Vertikalno uvećanje 10×". Ne zumira se niti pomjera.

Pomjerite pokazivač duž profila: traka prikazuje stacionažu, kote terena i projekta, nagib te iskop ili nasip na toj tački, a tačka prati osu trase u planu.

## Započnite projektni profil

1. U desnom panelu, pod **Projektni profil**, kliknite {{ui:Počni od terena}}.
   Dvije PVI se postavljaju na teren na dva kraja trase, spojene jednim pravim nagibom. Statusna traka kaže "Projektni profil započet na terenu na oba kraja. Uključite Dodaj PVI i kliknite da dodate lomove nagiba; dajte im dužinu krivine u tabeli."

Ako trasa ne prolazi kroz površinu, dobijate: "Ova osa trase nema terena ispod sebe da bi se započela." Tada dodajte PVI klikom (sljedeći odjeljak).

## Dodajte PVI

1. Pritisnite {{key:I}}, ili kliknite {{ui:Dodaj PVI}} u traci profila. Ostaje pritisnut.
2. Kliknite u profilu gdje želite lom nagiba. PVI se dodaje na toj stacionaži i koti, zaokružen na 0.01, i odabran.
3. Dodajte koliko god treba, zatim pritisnite {{key:I}} ponovo da prestanete dodavati.

Klik na mjestu gdje već postoji PVI se odbija ("Već postoji PVI na …"). PVI uvijek ostaju u redoslijedu stacionaže.

## Podešavanje PVI

- **Prevucite** PVI u profilu da ga pomjerite. Ne može preći svoje susjede. Pomjeranje je jedan korak poništavanja.
- **Upišite** tačne vrijednosti u tabelu PVI u desnom panelu: **Stacionaža**, **Kota** i **Dužina krivine L** (dužina vertikalne krivine). Pritisnite {{key:Enter}} nakon svake.
- **Uklonite** PVI s x na kraju njegovog reda, ili ga odaberite (kliknite) i pritisnite {{key:Delete}}. Kad prikaz profila ima fokus, {{key:Backspace}} ga također uklanja.

Prvi i posljednji PVI nikad ne dobijaju krivinu.

## Vertikalne krivine

1. Upišite dužinu u **Dužina krivine L** za unutrašnju PVI, na primjer 200.
2. Krivina se crta centrirana na PVI. Profil i desni panel prikazuju njenu vrstu (izbočina ili udubljenje), L i K, stacionaže i kote BVC i EVC, te njenu najvišu ili najnižu tačku kad je ima unutar krivine.

K se računa iz L (K = L podijeljeno algebarskom razlikom nagiba, u procentima). Vi upisujete L; upisivanje K direktno još nije dostupno.

Ako vertikalna krivina ne staje, crveni okvir kaže zašto: zalazi u PVI ili krivinu ispred nje, ili preko sljedeće PVI, i koliko ima prostora s te strane (krivina treba polovinu svoje dužine sa svake strane svoje PVI). Njeno dugme postavlja **najdužu krivinu koja staje**, s njenim K, kao jedan korak ({{key:Mod+Z}} poništava). Ili razmaknite PVI.

## Pročitajte činjenice

Ispod tabele PVI, lista daje svaki nagib u procentima ("Nagib 1: +1.25%") i svaku krivinu, na primjer "Izbočina na 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", zatim "Najviša tačka 1+62.40, 254.12".

Ako PVI ne dosežu oba kraja trase, napomena to kaže. Koridor se pravi samo tamo gdje se profil i osa trase preklapaju.

## Linije obilježja u profilu

Linije obilježja prikazuju se i u prikazu profila, tako da vidite ivičnjak, jarak ili vrh zida naspram profila puta.

- Gdje linija obilježja **prelazi** osu trase, profil pokazuje mali romb na toj stacionaži i koti, s oznakom naziva linije i njene kote tamo (vlastita kota linije, izračunata duž segmenta koji prelazi).
- Upišite udaljenost u {{ui:Uz trasu, unutar}} da nacrtate i linije obilježja koje **teku uz** osu trase unutar te udaljenosti, kao isprekidane linije na njihovim kotama. Prazno ili 0 prikazuje samo ukrštanja.
- Oznake i natpisi prate svaku promjenu: pomjerite vrh, upišite nagib ili podignite liniju, a profil odmah prikazuje nove kote.
- Kliknite romb ukrštanja da odaberete tu liniju obilježja; odabrana linija crta se bojom isticanja.
- {{ui:Linije obilježja}} u traci profila sakriva ili prikazuje sve njih. Obje postavke se čuvaju s projektom.

Pogledajte [Linije obilježja](topic:feature-lines).

## Dalje

- [Provucite koridor puta](topic:corridor) duž ove trase i ovog profila.
- Profil se zapisuje u LandXML zajedno s trasom; pogledajte [Razmjena LandXML](topic:landxml).
