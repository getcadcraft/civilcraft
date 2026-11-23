---
title: Projektovanje podužnog profila
summary: Otvori prikaz profila, započni projektovani profil od terena, dodaj i prevlači PVI tačke, podesi dužine vertikalnih krivina i pročitaj nagibe, K vrednosti i najviše i najniže tačke.
keywords: profil, vertikalna osovina, pvi, vertikalna krivina, nagib, K vrednost, greben, udubljenje, BVC, EVC, prikaz profila, projektovana kota, FG, profil postojećeg terena, linije obeležja u profilu, ukrštanja, projektovano, ivičnjak, jarak, oznake
from: dbb1f32d
---

Svaka osovina trase ima jedan projektovani podužni profil: spisak PVI tačaka (stacionaža i kota) povezanih pravim nagibima, sa simetričnom paraboličkom vertikalnom krivinom na svakoj unutrašnjoj PVI tački koja ima dužinu. Profil postojećeg terena se uzorkuje iz površi umesto tebe.

## Otvaranje prikaza profila

1. Izaberi osovinu trase (klikni je sa {{ui:Izaberi}}).
2. Pritisni {{key:R}}, ili klikni {{ui:Profil}} na alatnoj traci, ili {{ui:Prikaz profila}} pri dnu desnog panela.
   Prikaz profila se otvara ispod osnove sa postojećim terenom duž osovine. Sa dve ili više osovina izaberi jednu na listi levo u traci profila.

Prikaz na početku prikazuje celu osovinu i rasteže kote da popune panel; uveličanje je ispisano u donjem levom uglu, na primer „Vertikalno uveličanje 10×“.

## Uvećavanje i pomeranje profila

- **Uvećavanje:** okreni točkić miša (ili stisni prstima na touchpadu) i prikaz se uvećava oko kursora. Drži {{key:Shift}} da uvećaš samo stacionaže, ili {{key:Alt}} da uvećaš samo kote (to menja uveličanje). Kad je prikaz profila aktivan, tasteri plus i minus uvećavaju oko sredine.
- **Pomeranje:** prevuci desnim ili srednjim tasterom miša, ili prevuci dvema prstima po touchpadu.
- **Uklopi:** dvostruki klik na profil ili {{key:F}} da ponovo prikažeš celu osovinu.

Uređivanje PVI tačke zadržava izabrano uvećanje; ne vraća se na uklapanje.

Pomeraj kursor duž profila: traka pokazuje stacionažu, kote terena i projekta, nagib i usek ili nasip tu, a tačka prati na osovini u osnovi.

## Započinjanje projektovanog profila

1. U desnom panelu pod **Projektovani profil** klikni {{ui:Počni od terena}}.
   Dve PVI tačke se postavljaju na teren na dva kraja osovine, povezane jednim pravim nagibom. Statusna traka kaže: „Projektovani profil započet od terena na oba kraja. Uključi Dodaj PVI i klikni da dodaš prelome nagiba; zadaj im dužinu krivine u tabeli.“

Ako osovina ne seče površ, dobijaš poruku „Ova osovina nema teren ispod sebe od kog bi se počelo.“ Tada dodaj PVI tačke klikom (sledeći odeljak).

## Dodavanje PVI tačaka

1. Pritisni {{key:I}}, ili klikni {{ui:Dodaj PVI}} u traci profila. Ostaje pritisnuto.
2. Klikni u profilu tamo gde želiš prelom nagiba. PVI se dodaje na toj stacionaži i koti, zaokružena na 0.01, i biva izabrana.
3. Dodaj koliko god treba, pa ponovo pritisni {{key:I}} da prestaneš da dodaješ.

Klik gde već postoji PVI se odbija („Već postoji PVI na …“). PVI tačke uvek ostaju u redosledu stacionaža.

## Hvatanje pri dodavanju ili prevlačenju

Dugme **Hvataj** u traci profila je na početku uključeno. Dok je uključeno, PVI koju dodaješ ili prevlačiš pada na najbližu PVI tačku, tačku terena, stacionažu PVI ili liniju terena, a oznaka pored markera kaže koju. Drži {{key:Alt}} za slobodnu tačku, bilo gde.

## Podešavanje PVI tačaka

- **Prevuci** PVI u profilu da je pomeriš. Ne može da prođe pored svojih suseda. Pomeranje je jedan korak opoziva.
- **Ukucaj** tačne vrednosti u tabeli PVI tačaka u desnom panelu: **Stacionaža**, **Kota**, **Nagib %** i **Krivina L** (dužina vertikalne krivine). Pritisni {{key:Enter}} posle svake.
- **Izaberi** vrednost iz profila: mali dugme pored stacionaže ili kote PVI tačke čeka jedan klik u prikazu profila i unosi tu vrednost. Klik se hvata kao kod Dodavanja PVI tačaka; drži {{key:Alt}} za slobodnu tačku; {{key:Esc}} otkazuje.
- **Nagib %** je nagib tangente koja počinje na toj PVI tački i ide do sledeće. Unošenje menja kotu **sledeće** PVI tačke (njena stacionaža se nikad ne menja). Ako je sledeća PVI zaključana, umesto toga se pomera kota prethodne PVI.
- **Zaključaj** PVI katancem na kraju njenog reda. Zaključana PVI se ne prevlači, a izmena nagiba je ne pomera. Ako su oba kraja tangente zaključana, njen nagib se ne može promeniti: statusna traka to kaže, pa prvo otključaj jedan kraj. Zaključavanje se čuva u datoteci.
- **Ukloni** PVI tačku sa x na kraju njenog reda, ili je izaberi (klikni je) i pritisni {{key:Delete}}. Kad je prikaz profila aktivan, {{key:Backspace}} je takođe uklanja.

Prva i poslednja PVI tačka nikad ne dobijaju krivinu.

## Vertikalne krivine

1. Ukucaj dužinu u **Krivina L** za unutrašnju PVI tačku, na primer 200.
2. Krivina se crta centrirana na PVI tački. Profil i desni panel pokazuju njenu vrstu (greben ili udubljenje), L i K, stacionaže i kote BVC i EVC, i njenu najvišu ili najnižu tačku kada je ima unutar krivine.

K se računa iz L (K = L podeljeno algebarskom razlikom nagiba, u procentima). Ukucavaš L; direktno unošenje K još nije dostupno.

Ako vertikalna krivina ne staje, crveni okvir kaže zašto: zalazi nazad u PVI tačku ili krivinu ispred nje, ili preko sledeće PVI tačke, i koliko prostora ima sa te strane (krivina treba polovinu svoje dužine sa svake strane svoje PVI tačke). Njeno dugme postavlja **najdužu krivinu koja staje**, sa svojim K, kao jedan korak ({{key:Mod+Z}} to opoziva). Ili razmakni PVI tačke.

## Čitanje podataka

Ispod tabele PVI tačaka, spisak daje svaki nagib u procentima („Nagib 1: +1.25%“) i svaku krivinu, na primer „Greben na 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, zatim „Najviša tačka 1+62.40, 254.12“.

Ako PVI tačke ne dosežu oba kraja osovine, napomena to kaže. Koridor se izrađuje samo tamo gde se profil i osovina preklapaju.

## Linije obeležja u profilu

Linije obeležja se takođe prikazuju u prikazu profila, pa možeš videti ivičnjak, jarak ili vrh zida u odnosu na profil puta.

- Gde linija obeležja **preseca** osovinu, profil prikazuje mali romb na toj stacionaži i koti, obeležen nazivom linije i njenom kotom tu (sopstvena kota linije, izračunata duž segmenta koji preseca).
- Unesi rastojanje u {{ui:Uz osovinu u okviru}} da bi se nacrtale i linije obeležja koje **idu uz** osovinu u tom rastojanju, kao isprekidane linije na sopstvenim kotama. Prazno ili 0 prikazuje samo preseke.
- Oznake i obeležja prate svaku izmenu: pomeri teme, unesi nagib ili podigni liniju, i profil odmah prikazuje nove kote.
- Klikni romb preseka da izabereš tu liniju obeležja; izabrana linija se crta bojom isticanja.
- {{ui:Linije obeležja}} u traci profila sakriva ili prikazuje sve. Oba podešavanja se čuvaju uz projekat.

Pogledaj [Linije obeležja](topic:feature-lines).

## Dalje

- [Protezanje koridora puta](topic:corridor) duž osovine i ovog profila.
- Profil se upisuje u LandXML zajedno sa osovinom; pogledaj [Razmena LandXML-a](topic:landxml).
