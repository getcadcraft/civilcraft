---
title: Projektiranje uzdužnog profila
summary: Otvorite prikaz profila, započnite projektirani profil od terena, dodajte i povlačite PVI-je, postavite duljine vertikalnih zaobljenja te čitajte nagibe, K vrijednosti i najviše i najniže točke.
keywords: profil, uzdužna os, PVI, vertikalno zaobljenje, nagib, K vrijednost, greben, udubljenje, BVC, EVC, prikaz profila, konačni nagib, FG, profil postojećeg terena, značajne linije u profilu, križanja, projicirano, rubnjak, jarak, oznake
from: dbb1f32d
---

Svaka trasa ima jedan projektirani profil: popis PVI-ja (stacionaža i visina) povezanih ravnim nagibima, s simetričnim paraboličnim vertikalnim zaobljenjem na svakom unutarnjem PVI-ju koji ima duljinu. Profil postojećeg terena uzorkuje se iz površine za vas.

## Otvorite prikaz profila

1. Odaberite os trase (kliknite je s {{ui:Odaberi}}).
2. Pritisnite {{key:R}}, ili kliknite {{ui:Profil}} na alatnoj traci, ili {{ui:Prikaz profila}} pri dnu desnog panela.
   Prikaz profila otvara se ispod tlocrta s postojećim terenom uz os. Uz dvije ili više trasa, odaberite jednu s popisa lijevo u traci profila.

Prikaz se u početku pokazuje cijelom osi i rasteže visine da ispuni panel; uvećanje se ispisuje u donjem lijevom kutu, na primjer „Vertikalno uvećanje 10×“.

## Zumiranje i pomicanje profila

- **Zumiranje:** okrećite kotačić miša (ili prstima na touchpadu) i prikaz se zumira oko pokazivača. Držite {{key:Shift}} za zumiranje samo stacionaža ili {{key:Alt}} za zumiranje samo visina (to mijenja uvećanje). Kad je prikaz profila u fokusu, tipke plus i minus zumiraju oko sredine.
- **Pomicanje:** povlačite desnom ili srednjom tipkom miša ili prevucite s dva prsta na touchpadu.
- **Prilagodba:** dvostruki klik na profil ili pritisak na {{key:F}} ponovno prikazuje cijelu os.

Uređivanje PVI-ja zadržava zumiranje koje ste odabrali; ne vraća se na prilagodbu.

Pomaknite pokazivač duž profila: traka prikazuje stacionažu, kote terena i projekta, nagib te iskop ili nasip na tom mjestu, a točka prati os u tlocrtu.

## Započnite projektirani profil

1. U desnom panelu pod **Projektirani profil** kliknite {{ui:Započni od terena}}.
   Dva PVI-ja postavljaju se na teren na dva kraja trase, povezana jednim ravnim nagibom. Statusna traka kaže „Projektirani profil započet od terena na oba kraja. Uključite {{ui:Dodaj PVI}} i kliknite za dodavanje lomova nagiba; u tablici zadajte duljinu zaobljenja.“

Ako os ne siječe površinu, dobijete „Ova trasa nema terena pod sobom od kojeg bi se počelo.“ Tada dodajte PVI-je klikom (sljedeći odjeljak).

## Dodavanje PVI-ja

1. Pritisnite {{key:I}} ili kliknite {{ui:Dodaj PVI}} u traci profila. Ostaje pritisnut.
2. Kliknite u profilu gdje želite lom nagiba. PVI se dodaje na toj stacionaži i visini, zaokružen na 0.01, i odabran.
3. Dodajte koliko god treba, zatim ponovno pritisnite {{key:I}} da zaustavite dodavanje.

Klik na mjesto gdje već postoji PVI se odbija („Već postoji PVI na …“). PVI-ji se uvijek drže redoslijeda stacionaža.

## Hvatanje dok dodajete ili povlačite

Gumb **Hvatanje** u traci profila uključen je na početku. Dok je uključen, PVI koji dodajete ili povlačite pada na najbliži PVI, točku terena, stacionažu PVI-ja ili liniju terena, a oznaka uz marker kaže koji. Držite {{key:Alt}} za slobodnu točku, bilo gdje.

## Podešavanje PVI-ja

- **Povucite** PVI u profilu da ga pomaknete. Ne može preći svoje susjede. Pomak je jedan korak poništavanja.
- **Upišite** točne vrijednosti u tablicu PVI-ja u desnom panelu: **Stacionaža**, **Kota**, **Nagib %** i **Duljina zaobljenja** (vertikalno zaobljenje). Nakon svake pritisnite {{key:Enter}}.
- **Odaberite** vrijednost iz profila: mali gumb uz stacionažu ili kotu PVI-ja čeka jedan klik u prikazu profila i upisuje tu vrijednost. Klik se hvata kao kod Dodaj PVI; držite {{key:Alt}} za slobodnu točku; {{key:Esc}} otkazuje.
- **Nagib %** je nagib tangente koja polazi od tog PVI-ja i ide do sljedećeg. Upisivanjem se pomiče kota **sljedećeg** PVI-ja (njegova stacionaža se nikad ne mijenja). Ako je sljedeći PVI zaključan, pomiče se kota prethodnog.
- **Zaključajte** PVI katancem na kraju njegova retka. Zaključani PVI se ne povlači, a uređivanje nagiba ga ne pomiče. Ako su oba kraja tangente zaključana, njezin nagib ne može se promijeniti: statusna traka to kaže i prvo morate otključati jedan kraj. Zaključavanje se sprema u datoteku.
- **Uklonite** PVI križićem na kraju njegova retka ili ga odaberite (kliknite) i pritisnite {{key:Delete}}. Kad prikaz profila ima fokus, i {{key:Backspace}} ga uklanja.

Prvi i zadnji PVI nikad ne dobivaju zaobljenje.

## Vertikalna zaobljenja

1. Upišite duljinu u **Duljina zaobljenja** za unutarnji PVI, na primjer 200.
2. Zaobljenje se crta centrirano na PVI-ju. Profil i desni panel pokazuju njegovu vrstu (greben ili udubljenje), L i K, stacionaže i visine BVC i EVC te njegovu najvišu ili najnižu točku kad je ima unutar zaobljenja.

K se izračunava iz L (K = L podijeljeno s algebarskom razlikom nagiba, u postotcima). Vi upisujete L; izravni upis K još nije dostupan.

Ako vertikalno zaobljenje ne stane, crveni okvir kaže zašto: zadire natrag u prethodni PVI ili zaobljenje ili preko sljedećeg PVI-ja, i koliko prostora ima s te strane (zaobljenje treba polovicu svoje duljine s obje strane svog PVI-ja). Njegov gumb postavlja **najdulje zaobljenje koje stane**, s njegovim K, kao jedan korak ({{key:Mod+Z}} poništava). Ili razmaknite PVI-je.

## Pročitajte podatke

Ispod tablice PVI-ja popis navodi svaki nagib u postotcima („Nagib 1: +1.25%“) i svako zaobljenje, na primjer „Greben na 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, zatim „Najviša točka 1+62.40, 254.12“.

Ako PVI-ji ne dosežu oba kraja trase, bilješka to kaže. Koridor se izrađuje samo tamo gdje se profil i os preklapaju.

## Značajne linije u profilu

Značajne linije vide se i u prikazu profila, pa vidite rubnjak, jarak ili vrh zida naspram profila ceste.

- Gdje značajna linija **siječe** os, profil pokazuje mali romb na toj stacionaži i visini, s oznakom naziva linije i njezine kote tamo (vlastita kota linije, izračunata duž segmenta koji siječe).
- Upišite udaljenost u {{ui:Uz os u krugu}} da se nacrtaju i značajne linije koje **idu uz** os unutar te udaljenosti, kao crtkane linije na vlastitim kotama. Prazno ili 0 prikazuje samo presjecišta.
- Oznake i natpisi prate svaku promjenu: pomaknite vrh, upišite nagib ili podignite liniju, a profil odmah prikazuje nove kote.
- Kliknite romb presjecišta da odaberete značajnu liniju; odabrana linija crta se bojom isticanja.
- {{ui:Značajne linije}} u traci profila sakriva ili prikazuje sve njih. Obje postavke spremaju se s projektom.

Vidi [Značajne linije](topic:feature-lines).

## Dalje

- [Provlačenje koridora ceste](topic:corridor) duž ove osi i ovog profila.
- Profil se zapisuje u LandXML s osi; vidi [Razmjena LandXML-a](topic:landxml).
