---
title: Projektovanje vertikalnog profila
summary: Otvori prikaz profila, započni projektni profil od terena, dodaj i prevlači PVI, podesi dužine vertikalnih krivina, i čitaj nagibe, K vrednosti i visoke i niske tačke.
keywords: profil, vertikalno poravnanje, pvi, vertikalna krivina, nagib, k vrednost, greben, udubljenje, bvc, evc, prikaz profila, konačni nagib, fg, postojeći profil terena, linije obeležja u profilu, ukrštanja, projektovano, ivičnjak, jarak, oznake
from: e9182bfa
---

Svako poravnanje ima jedan projektni profil: spisak PVI (stacionaža i kota) spojenih pravim nagibima, sa simetričnom paraboličnom vertikalnom krivinom na svakom unutrašnjem PVI koji ima dužinu. Postojeći profil terena uzima se sa površi umesto tebe.

## Otvori prikaz profila

1. Izaberi poravnanje (klikni ga sa {{ui:Izaberi}}).
2. Pritisni {{key:R}}, ili klikni {{ui:Profil}} na traci sa alatkama, ili {{ui:Prikaz profila}} na dnu desnog panela. Prikaz profila se otvara ispod osnove sa postojećim terenom duž poravnanja. Sa dva ili više poravnanja, izaberi jedno na listi levo u traci profila.

Prikaz uvek pokazuje celo poravnanje i rasteže kote da popune panel; uvećanje se ispisuje u donjem levom uglu, na primer „Vertikalno uvećanje 10×“. Ne zumira i ne pomera se.

Pomeri pokazivač duž profila: traka pokazuje stacionažu, kote terena i projekta, nagib i iskop ili nasip na toj tački, a tačka prati poravnanje u osnovi.

## Započni projektni profil

1. U desnom panelu pod **Projektni profil** klikni {{ui:Počni od terena}}.
   Dva PVI se postavljaju na tlo na dva kraja poravnanja, spojena jednim pravim nagibom. Statusna traka kaže „Projektni profil počet od terena na oba kraja. Uključi Dodaj PVI i klikni da dodaš prelome nagiba; daj im dužinu krivine u tabeli.“

Ako poravnanje ne prelazi površ, dobijaš „Ovo poravnanje nema teren ispod sebe da se od njega počne.“ Tada dodaj PVI klikom (sledeći odeljak).

## Dodaj PVI

1. Pritisni {{key:I}}, ili klikni {{ui:Dodaj PVI}} u traci profila. Ostaje pritisnuto.
2. Klikni u profilu gde želiš prelom nagiba. PVI se dodaje na toj stacionaži i koti, zaokružen na 0.01, i izabran je.
3. Dodaj koliko god treba, zatim pritisni {{key:I}} ponovo da prestaneš s dodavanjem.

Klik tamo gde već postoji PVI se odbija („Već postoji PVI kod …“). PVI su uvek u redosledu stacionaža.

## Podesi PVI

- **Prevuci** PVI u profilu da ga pomeriš. Ne može da prođe pored svojih suseda. Pomeranje je jedan korak opozivanja.
- **Upiši** tačne vrednosti u tabeli PVI u desnom panelu: **Stacionaža**, **Kota** i **Krivina L** (dužina vertikalne krivine). Pritisni {{key:Enter}} posle svakog.
- **Ukloni** PVI sa x na kraju njegovog reda, ili ga izaberi (klikni) i pritisni {{key:Delete}}. Kad prikaz profila ima fokus, i {{key:Backspace}} ga uklanja.

Prvi i poslednji PVI nikad ne dobijaju krivinu.

## Vertikalne krivine

1. Upiši dužinu u **Krivina L** za unutrašnji PVI, na primer 200.
2. Krivina se crta centrirana na PVI. Profil i desni panel pokazuju njenu vrstu (greben ili udubljenje), L i K, BVC i EVC stacionaže i kote, i njenu visoku ili nisku tačku kad je unutar krivine.

K se računa iz L (K = L podeljeno algebarskom razlikom nagiba, u procentima). Ti upisuješ L; upisivanje K direktno još nije dostupno.

Ako vertikalna krivina ne staje, crveni okvir kaže zašto: ulazi nazad u PVI ili krivinu ispred, ili preko sledećeg PVI, i koliko ima prostora s te strane (krivina treba polovinu svoje dužine sa svake strane svog PVI). Njeno dugme postavlja **najdužu krivinu koja staje**, sa svojim K, kao jedan korak ({{key:Mod+Z}} opoziva). Ili razmakni PVI.

## Pročitaj činjenice

Ispod tabele PVI, spisak daje svaki nagib u procentima („Nagib 1: +1.25%“) i svaku krivinu, na primer „Greben kod 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, zatim „Visoka tačka 1+62.40, 254.12“.

Ako PVI ne dosežu oba kraja poravnanja, napomena to kaže. Koridor se pravi samo tamo gde se profil i poravnanje preklapaju.

## Linije obeležja u profilu

Linije obeležja se prikazuju i u prikazu profila, pa vidiš ivičnjak, jarak ili vrh zida naspram profila puta.

- Gde linija obeležja **prelazi** poravnanje, profil pokazuje mali romb na toj stacionaži i koti, označen imenom linije i njenom kotom tamo (sopstvena kota linije, izračunata duž segmenta koji prelazi).
- Upiši rastojanje u {{ui:Uz osovinu u okviru}} da se prikažu i linije obeležja koje **idu uz** poravnanje u tom rastojanju, kao isprekidane linije na sopstvenim kotama. Prazno ili 0 pokazuje samo ukrštanja.
- Oznake i natpisi prate svaku promenu: pomeri teme, upiši nagib ili podigni liniju, i profil odmah pokazuje nove kote.
- Klikni romb ukrštanja da izabereš tu liniju obeležja; izabrana linija se crta u boji isticanja.
- {{ui:Linije obeležja}} u traci profila sakriva ili prikazuje sve njih. Oba podešavanja se čuvaju uz projekat.

Vidi [Linije obeležja](topic:feature-lines).

## Dalje

- [Prevuci koridor puta](topic:corridor) duž poravnanja i ovog profila.
- Profil se upisuje u LandXML zajedno s poravnanjem; vidi [Razmena LandXML](topic:landxml).
