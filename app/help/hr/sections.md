---
title: Linije uzorkovanja i poprečni presjeci
summary: Izrežite presjeke okomito na os trase, pogledajte teren, projekt te iskop i nasip na svakoj stacionaži i dobijte volumene metodom srednjih površina.
keywords: raspodjela mase, dijagram mase, točka ravnoteže, skupljanje, nabreknuće, udaljenost prijevoza, pozajmište, odlagalište, listovi presjeka, listovi poprečnih presjeka, pdf presjeka, presjeci, poprečni presjeci, linije uzorkovanja, prikaz presjeka, iskop, nasip, površine, metoda srednjih površina, volumeni srednjih površina, stacionaža, odmak, csv, zemljani radovi
from: 5060173c
---

Poprečni presjek prikazuje cestu onako kako će biti izgrađena: preko osi trase na jednoj stacionaži, postojeći teren, projekt (koridor ili plato planiran u teren) te iskop i nasip između njih.

## Dodajte linije uzorkovanja

1. Odaberite os trase. U **Svojstvima**, pod **Linijama uzorkovanja**, kliknite {{ui:Dodaj linije uzorkovanja}}.
2. Postavite **Svaki** (razmak: 50 ft ili 20 m na početku), **Lijevu širinu** i **Desnu širinu** (koliko daleko svaki presjek seže od središnje linije).
3. Za presijecanje presjeka na određenoj stacionaži upišite je u **Dodaj stacionažu** (na primjer `2+35`) i pritisnite {{key:Enter}}.

Presjeci se režu na svakom cijelom višekratniku razmaka, na oba kraja osi trase, na početku i kraju svake krivine (PC i PT) te na stacionažama koje dodate. Linije uzorkovanja prikazuju se na tlocrtu kao sive linije preko osi trase; izlaze i u DXF, DWG i PDF na sloju C-ROAD-SCTN. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Prikaz presjeka

Otvorite ga s {{ui:Prikaz presjeka}} u **Svojstvima** osi trase, {{ui:Presjeci}} pod **Teren** › {{ui:Više}}, ili {{key:X}}. Zauzima mjesto prikaza profila ispod tlocrta.

- Krećite se kroz presjeke strelicama na njegovoj traci, popisom stacionaža ili tipkama {{key:Left}} i {{key:Right}} kad je prikaz presjeka u fokusu ({{key:Home}} i {{key:End}} za prvi i zadnji).
- Siva linija je postojeći teren, crvena linija projekt. Iskop je zasjenčen narančasto, nasip zeleno. Točke koridora označene su: CL (središnja linija), EOP (rub kolnika), SH (bankina) i DL (nožica pokosa).
- Zaglavlje daje stacionažu, površine iskopa i nasipa ovog presjeka te vertikalno pretjerivanje. **Prilagodi** ispunjava ploču; odaberite 1× da vidite presjek u stvarnom mjerilu.
- Debela linija na tlocrtu pokazuje koji je presjek na zaslonu.

## Listovi presjeka

{{ui:Listovi presjeka (PDF)}} pod **Linijama uzorkovanja** stavlja svaki presjek na stranice PDF-a, u redovima slijeva nadesno i odozgo prema dolje po redoslijedu stacionaža. Odaberite **Papir**, **Mjerilo tlocrta** (vodoravno mjerilo presjeka) i **Pretjerivanje profila** (1×, 2×, 5× ili 10×); dijaloški okvir navodi koliko presjeka stane na stranicu i koliko stranica to čini.

Svaki presjek prikazuje mrežu s odmacima i kotama, teren (crtkano), projekt, iskop i nasip zasjenčene (narančasto i zeleno), točke koridora te ispod njega svoju stacionažu i površine iskopa i nasipa. Svaki presjek na listovima crta se jednake veličine, dovoljno visok za najveći; kad to ne stane na stranicu pri vašem pretjerivanju, CivilCraft koristi najveći koji stane i to navodi. Naslovna traka imenuje os trase, stacionaže na toj stranici, mjerila i „List 1 od 3“.

## Volumeni metodom srednjih površina

Između dva susjedna presjeka volumen je prosjek njihovih dviju površina pomnožen s udaljenošću između njihovih stacionaža. Traka prikazuje zbrojeve za os trase, a {{ui:CSV}} preuzima površine i volumene svakog presjeka s tekućim zbrojevima (kubnih jardi za projekte u stopama, kubnih metara za metričke).

**Svojstva** prikazuju iste zbrojeve uz volumene metodom mreže iz [Volumeni zemljanih radova](topic:volumes). Njih dvoje su različite aproksimacije: bliži presjeci ih približavaju, a na ravnoj cesti na ravnom terenu su isti.

:::note
Iskop i nasip broje se samo unutar planiranih površina (nožičnih linija koridora ili platoa), kao i kod metode mreže. Bez koridora ili platoa projekt je teren, pa presjek ne prikazuje iskop ni nasip.
:::

## Raspodjela mase

**Raspodjela mase** pod **Linijama uzorkovanja** crta dijagram raspodjele mase iz istih volumena srednjih površina: duž stacionaža, tekući zbroj iskopa umanjen za nasip.

- **Skupljanje (−) ili nabreknuće (+) iskopa** kaže što kubni jard iskopa postaje kad se ugradi kao nasip: −10 % (početna vrijednost, privremena) znači da se smanjuje na 0.9; stijena koja nabreknuje može imati +5 %. Upotrijebite vrijednost iz vašeg geotehničkog izvješća.
- Gdje linija raste, cesta je u iskopu; gdje pada, u nasipu. Iznad nule (zasjenčeno narančasto) zemlja se pomiče prema većim stacionažama; ispod nule (zeleno), prema manjim stacionažama.
- **Točke ravnoteže** su mjesta gdje linija siječe nulu: između dviju od njih iskop i nasip su u ravnoteži. Tablica navodi svaku uravnoteženu dionicu, pomaknuti volumen (njezina najviša ili najniža točka) i prosječnu udaljenost prijevoza (zasjenčena površina podijeljena s tim volumenom).
- Gdje linija završava izvan nule, ostatak je **odlagalište** (iznad) ili **pozajmište** (ispod). Na toj zadnjoj dionici kao pomaknuta zemlja računa se samo zemlja preko razine na kojoj završava.

**CSV** sprema ordinatu mase na svakom presjeku, dionice i faktor.
