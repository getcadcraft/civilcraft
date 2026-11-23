---
title: Linije uzorkovanja i poprečni presjeci
summary: Režite presjeke okomito na os trase, pogledajte teren, projekt te iskop i nasip na svakoj stacionaži i dobijte volumene metodom prosječnih površina.
keywords: masovna bilanca, dijagram masovne bilance, točka ravnoteže, skupljanje, nabreknuće, udaljenost prijevoza, pozajmište, odlagalište, listovi presjeka, listovi poprečnih presjeka, presjeci pdf, presjeci, poprečni presjeci, linije uzorkovanja, prikaz presjeka, iskop, nasip, površine, prosječna površina, volumeni prosječnih površina, zemljani radovi, stacionaža, odmak, csv
from: 09639ce2
---

Poprečni presjek prikazuje cestu onako kako će biti izgrađena: preko osi na jednoj stacionaži, postojeći teren, projekt (koridor ili plato planiran u teren) te iskop i nasip između njih.

## Dodajte linije uzorkovanja

1. Odaberite os trase. U **Svojstvima**, pod **Linije uzorkovanja**, kliknite {{ui:Dodaj linije uzorkovanja}}.
2. Postavite **Svakih** (razmak: 50 ft ili 20 m za početak), **Lijeva širina** i **Desna širina** (koliko svaki presjek seže od osi).
3. Za rez presjeka na određenoj stacionaži upišite je u **Dodaj stacionažu** (na primjer `2+35`) i pritisnite {{key:Enter}}.

Presjeci se režu na svakom cijelom višekratniku razmaka, na oba kraja trase, na početku i kraju svakog zavoja (PC i PT) te na stacionažama koje dodate. Linije uzorkovanja na tlocrtu prikazuju se kao sive linije preko osi; izlaze i u DXF, DWG i PDF na sloju C-ROAD-SCTN. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Prikaz presjeka

Otvorite ga s {{ui:Prikaz presjeka}} u **Svojstvima** osi, {{ui:Presjeci}} pod {{ui:Teren}} › {{ui:Više}}, ili s {{key:X}}. Zauzima mjesto prikaza profila ispod tlocrta.

- Prolazite kroz presjeke strelicama u njegovoj traci, popisom stacionaža ili s {{key:Left}} i {{key:Right}} kad je prikaz presjeka u fokusu ({{key:Home}} i {{key:End}} za prvi i zadnji).
- Siva linija je postojeći teren, crvena linija projekt. Iskop je osjenčan narančasto, nasip zeleno. Točke koridora označene su: CL (os), EOP (rub kolnika), SH (bankina) i DL (linija pokosa).
- Zaglavlje daje stacionažu, površine iskopa i nasipa ovog presjeka te vertikalno uvećanje. **{{ui:Prilagodi}}** ispunjava panel; odaberite 1× da vidite presjek u točnom mjerilu.
- Debela linija na tlocrtu pokazuje koji je presjek na ekranu.
- **Zumiranje i pomicanje:** kotačić zumira oko pokazivača, a povlačenje pomiče prikaz. {{ui:Prilagodi}} (ili {{key:F}}, ili dvostruki klik) ponovno prilagođava cijeli presjek.

## Mjerenje u presjeku

1. Kliknite {{ui:Mjeri}} u traci presjeka ili pritisnite {{key:M}}. Savjet kaže „Kliknite prvu točku, zatim drugu.“
2. Kliknite dvije točke. Svaka se hvata na kraj linije ili točku koridora (CL, EOP, SH, DL); držite {{key:Alt}} za slobodnu točku.
3. Očitanje daje vodoravnu udaljenost (ΔH), okomitu udaljenost (ΔV), nagib u postotcima s omjerom i ravnu duljinu, u jedinicama projekta.

Ponovno kliknite da započnete novo mjerenje. {{key:Esc}} ga briše, a {{key:M}} isključuje Mjeri.

## Listovi presjeka

{{ui:Listovi presjeka (PDF)}} pod **Linije uzorkovanja** stavlja svaki presjek na stranice PDF-a, u redovima s lijeva nadesno i odozgo prema dolje, po redoslijedu stacionaža. Odaberite **Papir**, **Mjerilo tlocrta** (vodoravno mjerilo presjeka) i **Uvećanje profila** (1×, 2×, 5× ili 10×); dijalog kaže koliko presjeka stane na stranicu i koliko stranica to čini.

Svaki presjek prikazuje mrežu s odmacima i kotama, teren (crtkano), projekt, iskop i nasip osjenčane (narančasto i zeleno), točke koridora te ispod njega stacionažu i površine iskopa i nasipa. Svi presjeci na listovima crtaju se iste veličine, dovoljno visoki za najveći; kad to ne stane na stranicu pri vašem uvećanju, CivilCraft uzima najveći koji stane i to kaže. Naslovna traka navodi trasu, stacionaže na toj stranici, mjerila i „List 1 od 3“.

## Na što se mjere iskop i nasip

Koridor može imati slojeve ispod kolnika: slojeve kolnika, sastavne dijelove predložaka, neasfaltirani put. Odabir **Volumeni mjereni do** u traci presjeka određuje do čega iskop i nasip idu:

- **Donja površina** (početna): do dna tih sastavnih dijelova, pa iskop uključuje dubinu sloja kolnika.
- **Gornja površina**: samo do vrha projekta, kao prije kad su sastavni dijelovi bili uračunati.

Površine u zaglavlju, volumeni u nastavku, CSV i masovna bilanca slijede taj izbor, a sprema se s projektom.

## Volumeni prosječnih površina

Između dva susjedna presjeka volumen je prosjek njihovih dviju površina pomnožen s udaljenošću između njihovih stacionaža. Traka prikazuje zbrojeve za trasu, a {{ui:CSV}} preuzima površine i volumene svakog presjeka sa zbrojevima koji se nižu (kubični yardi za projekte u stopama, kubični metri za metričke).

**Svojstva** prikazuju iste zbrojeve uz volumene metodom mreže iz [Volumeni zemljanih radova](topic:volumes). To su dvije različite aproksimacije: gušći presjeci ih približavaju, a na ravnoj cesti na ravnom terenu su iste.

:::note
Iskop i nasip računaju se samo unutar planiranih područja (linija pokosa koridora ili platoa), kao i metodom mreže. Bez koridora ili platoa projekt je teren, pa presjek ne pokazuje iskop ni nasip.
:::

## Masovna bilanca

**Masovna bilanca** pod **Linije uzorkovanja** crta dijagram masovne bilance iz istih volumena prosječnih površina: uzduž stacionaža, tekući zbroj iskopa umanjen za nasip.

- **Skupljanje (−) ili nabreknuće (+) iskopa** kaže koliko kubični yard iskopa daje kad se ugradi kao nasip: −10 % (početna vrijednost, orijentacijska) znači da se smanjuje na 0.9; stijena koja nabreknuje može biti +5 %. Upotrijebite podatak iz vašeg geotehničkog izvješća.
- Gdje linija raste, cesta je u iskopu; gdje pada, u nasipu. Iznad nule (osjenčano narančasto) zemlja se pomiče prema rastućoj stacionaži; ispod nule (zeleno), prema padajućoj.
- **Točke ravnoteže** su mjesta gdje linija siječe nulu: između dviju od njih iskop i nasip se uravnotežuju. Tablica navodi svaki uravnoteženi dio, pomaknuti volumen (njegova najviša ili najniža točka) i prosječnu udaljenost prijevoza (osjenčana površina podijeljena s tim volumenom).
- Gdje linija završava izvan nule, ostatak je **odlagalište** (iznad) ili **pozajmište** (ispod). Na tom zadnjem dijelu računa se samo zemlja izvan razine na kojoj završava.

**CSV** sprema masovnu ordinatu na svakoj stacionaži, dijelove i faktor.
