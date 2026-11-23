---
title: Projektovanje vertikalnog profila
summary: Otvori prikaz profila, započni projektovani profil iz terena, dodaj i povuci PVI, postavi dužine vertikalnih krivina i čitaj nagibe, K vrijednosti i najviše i najniže tačke.
keywords: profil, vertikalna osa, pvi, vertikalna krivina, nagib, k vrijednost, greben, udubljenje, bvc, evc, prikaz profila, završna kota, fg, profil postojećeg terena, linije obilježja u profilu, ukrštanja, projekcija, ivičnjak, jarak, oznake
from: dbb1f32d
---

Svaka osa trase ima jedan projektovani profil: spisak PVI (stacionaža i kota) povezanih pravim nagibima, sa simetričnom paraboličnom vertikalnom krivinom na svakom unutrašnjem PVI koji ima dužinu. Profil postojećeg terena se uzorkuje s površine umjesto tebe.

## Otvori prikaz profila

1. Odaberi osu trase (klikni je s {{ui:Odaberi}}).
2. Pritisni {{key:R}}, ili klikni {{ui:Uzdužni profil}} na alatnoj traci, ili {{ui:Otvori prikaz profila}} na dnu desnog panela.
   Prikaz profila se otvara ispod plana s postojećim terenom duž osi trase. Sa dvije ili više osi, izaberi jednu s liste lijevo na traci profila.

Prikaz počinje prikazom cijele osi trase i rastezanjem kota da popuni panel; uvećanje je ispisano u donjem lijevom uglu, na primjer „Vertikalno uvećanje 10×“.

## Zumiranje i pomjeranje profila

- **Zumiranje:** okreni točkić miša (ili prstima na tačpedu) i prikaz se zumira oko pokazivača. Drži {{key:Shift}} za zumiranje samo stacionaža, ili {{key:Alt}} za zumiranje samo kota (to mijenja uvećanje). Kada je prikaz profila u fokusu, tipke plus i minus zumiraju oko sredine.
- **Pomjeranje:** povuci desnim ili srednjim dugmetom miša, ili prevuci s dva prsta na tačpedu.
- **Uklopi:** dvoklik na profil ili pritisni {{key:F}} da ponovo prikažeš cijelu osu trase.

Uređivanje PVI čuva zum koji si izabrao; ne vraća se na uklapanje.

Pomjeri pokazivač duž profila: traka pokazuje stacionažu, kote terena i projekta, nagib i iskop ili nasip na tom mjestu, a tačka prati na osi trase u planu.

## Pokreni projektovani profil

1. U desnom panelu pod **Projektovani profil** klikni {{ui:Počni od terena}}.
   Dva PVI se postavljaju na teren na dva kraja osi trase, povezana jednim pravim nagibom. Statusna traka kaže „Projektovani profil započet iz terena na oba kraja. Uključi Dodaj PVI i klikni da dodaš lomove nagiba; dodijeli im dužinu krivine u tabeli.“

Ako osa trase ne siječe površinu, dobijaš „Ova osa trase nema teren ispod sebe iz kojeg bi se počelo.“ Tada dodaj PVI klikom (sljedeći odjeljak).

## Dodaj PVI

1. Pritisni {{key:I}}, ili klikni {{ui:Dodaj PVI}} na traci profila. Ostaje pritisnuto.
2. Klikni u profilu gdje želiš lom nagiba. PVI se dodaje na toj stacionaži i koti, zaokružen na 0.01, i biva odabran.
3. Dodaj koliko god treba, zatim ponovo pritisni {{key:I}} da prestaneš s dodavanjem.

Klik tamo gdje već postoji PVI se odbija („Na ovom mjestu već postoji PVI na …“). PVI uvijek ostaju u redoslijedu stacionaža.

## Hvatanje dok dodaješ ili povlačiš

Dugme **Hvatanje** na traci profila je na početku uključeno. Dok je uključeno, PVI koji dodaješ ili povlačiš pada na najbliži PVI, tačku terena, stacionažu PVI ili liniju terena, a oznaka uz marker kaže koja. Drži {{key:Alt}} za slobodnu tačku, bilo gdje.

## Podešavanje PVI

- **Povuci** PVI u profilu da ga pomjeriš. Ne može proći svoje susjede. Pomjeranje je jedan korak poništavanja.
- **Upiši** tačne vrijednosti u tabelu PVI u desnom panelu: **Stacionaža**, **Kota**, **Nagib %** i **Krivina L** (dužina vertikalne krivine). Nakon svake pritisni {{key:Enter}}.
- **Izaberi** vrijednost iz profila: mali dugme pored stacionaže ili kote PVI čeka jedan klik u prikazu profila i upisuje tu vrijednost. Klik se hvata kao kod Dodaj PVI; drži {{key:Alt}} za slobodnu tačku; {{key:Esc}} poništava.
- **Nagib %** je nagib tangente koja počinje na tom PVI i ide do sljedećeg. Upisivanje pomjera kotu **sljedećeg** PVI (njegova stacionaža se nikada ne pomjera). Ako je sljedeći PVI zaključan, umjesto toga se pomjera kota prethodnog PVI.
- **Zaključaj** PVI katancem na kraju njegovog reda. Zaključani PVI se ne povlači, a izmjena nagiba ga ne pomjera. Ako su oba kraja tangente zaključana, njen nagib se ne može promijeniti: statusna traka to kaže, a ti prvo otključaj jedan kraj. Zaključavanje se čuva u datoteci.
- **Ukloni** PVI s x na kraju njegovog reda, ili ga odaberi (klikni na njega) i pritisni {{key:Delete}}. Kada je prikaz profila u fokusu, i {{key:Backspace}} ga uklanja.

Prvi i posljednji PVI nikada ne dobijaju krivinu.

## Vertikalne krivine

1. Upiši dužinu u **Krivina L** za unutrašnji PVI, na primjer 200.
2. Krivina se crta centrirana na PVI. Profil i desni panel pokazuju njenu vrstu (greben ili udubljenje), L i K, stacionaže i kote BVC i EVC, te njenu najvišu ili najniže tačku kada je ima unutar krivine.

K se računa iz L (K = L podijeljeno algebarskom razlikom nagiba, u procentima). Upisuješ L; direktno upisivanje K još nije dostupno.

Ako se vertikalna krivina ne uklapa, crveni okvir kaže zašto: zalazi nazad u PVI ili krivinu prije nje, ili preko sljedećeg PVI, i koliko prostora ima s te strane (krivina treba polovinu svoje dužine s svake strane svog PVI). Njeno dugme postavlja **najdužu krivinu koja staje**, sa svojom K, kao jedan korak ({{key:Mod+Z}} je poništava). Ili razmakni PVI.

## Pročitaj podatke

Ispod tabele PVI, spisak daje svaki nagib u procentima („Nagib 1: +1.25%“) i svaku krivinu, na primjer „Greben na 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, zatim „Najviša tačka 1+62.40, 254.12“.

Ako PVI ne dosežu oba kraja osi trase, napomena to kaže. Koridor se gradi samo tamo gdje se profil i osa trase preklapaju.

## Linije obilježja u profilu

Linije obilježja se prikazuju i u prikazu profila, pa možeš vidjeti ivičnjak, jarak ili vrh zida u odnosu na profil puta.

- Tamo gdje linija obilježja **siječe** osu trase, profil prikazuje mali romb na toj stacionaži i koti, označen nazivom linije i njenom kotom tamo (vlastita kota linije, izračunata duž segmenta koji siječe).
- Upiši daljinu u {{ui:Uz trasu, unutar}} da nacrtaš i linije obilježja koje **idu uz** osu trase unutar te udaljenosti, kao isprekidane linije na njihovim kotama. Prazno ili 0 prikazuje samo presjeke.
- Oznake i natpisi prate svaku promjenu: pomjeri vrh, upiši nagib ili podigni liniju, i profil odmah pokazuje nove kote.
- Klikni romb presjeka da odabereš tu liniju obilježja; odabrana linija se crta bojom isticanja.
- {{ui:Linije obilježja}} na traci profila sakriva ili prikazuje sve njih. Obje postavke se čuvaju s projektom.

Pogledaj [Linije obilježja](topic:feature-lines).

## Dalje

- [Koridor puta duž trase](topic:corridor) duž ove osi trase i ovog profila.
- Profil se upisuje u LandXML zajedno s osom trase; pogledaj [Razmjena LandXML](topic:landxml).
