---
title: Projektiranje uzdužnog profila
summary: Otvorite prikaz profila, započnite projektirani profil od terena, dodajte i povlačite PVI-je, postavite duljine vertikalnih zaobljenja te čitajte nagibe, K vrijednosti i najviše i najniže točke.
keywords: profil, vertikalna trasa, pvi, vertikalno zaobljenje, nagib, k vrijednost, vrh, udol, bvc, evc, prikaz profila, projektirani teren, postojeći profil terena, značajne linije u profilu, križanja, projicirano, rub kolnika, jarak, oznake
from: e9182bfa
---

Svaka os ima jedan projektirani profil: popis PVI-ja (stacionaža i kota) spojenih ravnim nagibima, s simetričnim paraboličnim vertikalnim zaobljenjem na svakom unutarnjem PVI-ju koji ima duljinu. Postojeći profil terena uzorkuje se iz površine za vas.

## Otvaranje prikaza profila

1. Odaberite os (kliknite je s {{ui:Odaberi}}).
2. Pritisnite {{key:R}}, ili kliknite {{ui:Profil}} na traci alata, ili {{ui:Prikaz profila}} pri dnu desnog panela.
   Prikaz profila otvara se ispod tlocrta s postojećim terenom duž osi. S dvije ili više osi, odaberite jednu na popisu s lijeve strane trake profila.

Prikaz uvijek pokazuje cijelu os i rasteže kote da popune panel; pretjerivanje se ispisuje u donjem lijevom kutu, npr. „Vertikalno pretjerivanje 10×“. Ne zumira se niti pomiče.

Pomaknite pokazivač duž profila: traka prikazuje stacionažu, kote terena i projektirane kote, nagib te iskop ili nasip u toj točki, a točka prati os u tlocrtu.

## Započinjanje projektiranog profila

1. U desnom panelu pod **Projektirani profil** kliknite {{ui:Započni od terena}}. Dva PVI-ja postavljaju se na terenu na dva kraja osi, spojena jednim ravnim nagibom. Statusna traka kaže „Projektirani profil započet na terenu na oba kraja. Uključite Dodaj PVI i kliknite za dodavanje lomova nagiba; u tablici zadajte im duljinu zaobljenja.“

Ako os ne siječe površinu, dobijete „Ta os nema terena ispod sebe od kojeg bi se moglo započeti.“ Tada dodajte PVI-je klikanjem (sljedeći odjeljak).

## Dodavanje PVI-ja

1. Pritisnite {{key:I}}, ili kliknite {{ui:Dodaj PVI}} na traci profila. Ostaje pritisnuto.
2. Kliknite u profilu gdje želite lom nagiba. PVI se dodaje na toj stacionaži i koti, zaokružen na 0.01, i odabran.
3. Dodajte koliko god treba, zatim ponovno pritisnite {{key:I}} za prestanak dodavanja.

Klik gdje već postoji PVI se odbija („Već postoji PVI na …“). PVI-ji uvijek ostaju u redoslijedu stacionaže.

## Podešavanje PVI-jeva

- **Povucite** PVI u profilu da ga pomaknete. Ne može prijeći susjede. Pomak je jedan korak poništavanja.
- **Upišite** točne vrijednosti u tablicu PVI-jeva u desnom panelu: **Stacionaža**, **Kota** i **Duljina zaobljenja L** (duljina vertikalnog zaobljenja). Nakon svake pritisnite {{key:Enter}}.
- **Uklonite** PVI pomoću x na kraju njegova retka, ili ga odaberite (kliknite) i pritisnite {{key:Delete}}. Kad prikaz profila ima fokus, {{key:Backspace}} također ga uklanja.

Prvi i zadnji PVI nikad ne dobivaju zaobljenje.

## Vertikalna zaobljenja

1. Upišite duljinu u **Duljina zaobljenja L** za unutarnji PVI, npr. 200.
2. Zaobljenje se crta centrirano na PVI-ju. Profil i desni panel prikazuju njegovu vrstu (vrh ili udol), L i K, stacionaže i kote BVC-a i EVC-a te njegovu najvišu ili najnižu točku kad je ima unutar zaobljenja.

K se izračunava iz L (K = L podijeljeno algebarskom razlikom nagiba, u postocima). Vi upisujete L; upisivanje K izravno još nije dostupno.

Ako vertikalno zaobljenje ne stane, crveni okvir kaže zašto: zalazi natrag u PVI ili zaobljenje prije njega ili preko sljedećeg PVI-ja, i koliko prostora ima s te strane (zaobljenje treba polovicu svoje duljine s obje strane svog PVI-ja). Njegov gumb postavlja **najdulje zaobljenje koje stane**, s njegovim K, kao jedan korak ({{key:Mod+Z}} poništava). Ili razmaknite PVI-je.

## Čitanje činjenica

Ispod tablice PVI-jeva popis navodi svaki nagib u postocima („Nagib 1: +1.25%“) i svako zaobljenje, npr. „Vrh na 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, zatim „Najviša točka 1+62.40, 254.12“.

Ako PVI-ji ne dosežu oba kraja osi, napomena to kaže. Koridor se izrađuje samo tamo gdje se profil i os preklapaju.

## Značajne linije u profilu

Značajne linije također se prikazuju u prikazu profila, pa vidite rub kolnika, jarak ili vrh zida naspram profila ceste.

- Gdje značajna linija **siječe** os, profil pokazuje mali romb na toj stacionaži i koti, s oznakom naziva linije i njezine kote tamo (vlastita kota linije, izračunata duž segmenta koji siječe).
- Upišite udaljenost u {{ui:Uz os u krugu}} da se nacrtaju i značajne linije koje **idu uz** os unutar te udaljenosti, kao isprekidane linije na vlastitim kotama. Prazno ili 0 prikazuje samo križanja.
- Oznake i natpisi prate svaku promjenu: pomaknete li vrh, upišete nagib ili podignete liniju, profil odmah pokazuje nove kote.
- Kliknite romb križanja da odaberete tu značajnu liniju; odabrana linija crta se bojom isticanja.
- {{ui:Značajne linije}} u traci profila sakriva ili prikazuje sve njih. Obje postavke spremaju se s projektom.

Pogledajte [Značajne linije](topic:feature-lines).

## Dalje

- [Provucite koridor ceste](topic:corridor) duž osi i ovog profila.
- Profil se zapisuje u LandXML zajedno s osi; pogledajte [Razmjena LandXML-a](topic:landxml).
