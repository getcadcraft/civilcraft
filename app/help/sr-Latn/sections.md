---
title: Probne linije i poprečni preseci
summary: Presecite preseke normalno na osovinu trase, pogledajte teren, projekat i usek i nasip na svakoj stacionaži, i dobijte zapremine metodom prosečnih površina krajeva.
keywords: dijagram transporta mase, tačka ravnoteže, skupljanje, bubrenje, udaljenost transporta, pozajmište, otpad, listovi preseka, listovi poprečnih preseka, PDF preseka, preseci, poprečni preseci, probne linije, prikaz preseka, usek, nasip, površine, metoda prosečnih površina krajeva, zapremine, zemljani radovi, stacionaža, odmak, CSV
from: 5060173c
---

Poprečni presek prikazuje put onako kako će biti izgrađen: preko osovine trase na jednoj stacionaži, postojeći teren, projekat (koridor ili plato izravnat) i usek i nasip između njih.

## Dodajte probne linije

1. Izaberite osovinu trase. U **Svojstvima**, pod **Probne linije**, kliknite {{ui:Dodaj probne linije}}.
2. Podesite **Svakih** (razmak: 50 ft ili 20 m za početak), **Levu širinu** i **Desnu širinu** (koliko daleko svaki presek seže od osovine).
3. Da presečete presek na određenoj stacionaži, upišite je u **Dodaj stacionažu** (na primer `2+35`) i pritisnite {{key:Enter}}.

Preseci se seku na svakom celom umnošku razmaka, na oba kraja osovine trase, na početku i kraju svake krivine (PC i PT), i na stacionažama koje dodate. Probne linije se na planu prikazuju kao sive linije preko osovine; idu i u DXF, DWG i PDF na sloju C-ROAD-SCTN. Svaka promena je jedan korak: {{key:Mod+Z}} je opoziva.

## Prikaz preseka

Otvorite ga sa {{ui:Prikaz preseka}} u **Svojstvima** osovine trase, sa {{ui:Preseci}} pod **Površina** › {{ui:Više}}, ili pritiskom na {{key:X}}. Zauzima mesto prikaza profila ispod plana.

- Kretanje kroz preseke strelicama na njegovoj traci, listom stacionaža, ili {{key:Left}} i {{key:Right}} kad je prikaz preseka u fokusu ({{key:Home}} i {{key:End}} za prvi i poslednji).
- Siva linija je postojeći teren, crvena linija projekat. Usek je osenčen narandžasto, nasip zeleno. Tačke koridora su označene: CL (osa), EOP (ivica kolovoza), SH (rame) i DL (preseci sa terenom).
- Zaglavlje daje stacionažu, površine useka i nasipa ovog preseka i vertikalno uveličanje. **Uklopi** popunjava panel; izaberite 1× da vidite presek u pravoj razmeri.
- Deblja linija na planu pokazuje koji je presek na ekranu.

## Listovi preseka

{{ui:Listovi preseka (PDF)}} pod **Probne linije** stavlja svaki presek na PDF stranice, u redovima sleva udesno i odozgo nadole po redosledu stacionaža. Izaberite **Papir**, **Razmeru plana** (horizontalna razmera preseka) i **Uveličanje profila** (1×, 2×, 5× ili 10×); dijalog kaže koliko preseka staje na stranicu i koliko stranica to pravi.

Svaki presek prikazuje mrežu s odmerenim rastojanjima i kotama, teren (isprekidano), projekat, usek i nasip osenčene (narandžasto i zeleno), tačke koridora i ispod njega svoju stacionažu i površine useka i nasipa. Svaki presek na listovima nacrtan je iste veličine, dovoljno visok za najveći; kad ne staje na stranicu pri vašem uveličanju, CivilCraft uzima najveći koji staje i to kaže. Naslovna traka imenuje osovinu trase, stacionaže na toj stranici, razmere i „List 1 od 3”.

## Zapremine metodom prosečnih površina krajeva

Između dva susedna preseka zapremina je prosek njihove dve površine puta rastojanje između njihovih stacionaža. Traka prikazuje ukupne iznose za osovinu trase, a {{ui:CSV}} preuzima sve površine i zapremine svakog preseka sa tekućim zbirovima (kubni jardi za projekte u stopama, kubni metri za metričke).

**Svojstva** pokazuju iste zbirove pored zapremina metodom mreže iz [Zapremine zemljanih radova](topic:volumes). Ta dva su različite aproksimacije: bliži preseci ih približavaju, a na pravom putu po ravnom terenu su isti.

:::note
Usek i nasip se broje samo unutar uređenih površina (linija preseka sa terenom koridora ili platoa), kao i metodom mreže. Bez koridora ili platoa projekat je teren, pa presek ne prikazuje ni usek ni nasip.
:::

## Transport mase

**Transport mase** pod **Probne linije** crta dijagram transporta mase iz istih zapremina prema prosečnim površinama krajeva: duž stacionaža, tekući zbir useka minus nasip.

- **Skupljanje (−) ili bubrenje (+) useka** kaže šta kubni jard useka postane kad se ugradi kao nasip: −10 % (početna vrednost, privremena) znači da se skuplja na 0.9; stena koja bubri može biti +5 %. Koristite podatak iz vašeg geotehničkog izveštaja.
- Gde linija raste, put je u useku; gde pada, u nasipu. Iznad nule (osenčeno narandžasto) zemlja se pomera uzvodno po stacionaži; ispod nule (zeleno), nizvodno.
- **Tačke ravnoteže** su mesta gde linija seče nulu: između dve od njih usek i nasip se izjednačavaju. Tabela navodi svaku izjednačenu deonicu, pomerenu zapreminu (njenu najvišu ili najnižu tačku) i prosečnu daljinu transporta (osenčena površina podeljena tom zapreminom).
- Ako linija završava van nule, višak je **otpad** (iznad) ili **pozajmište** (ispod). Na poslednjoj deonici računa se kao pomerena samo zemlja preko nivoa na kojem linija završava.

**CSV** čuva ordinatu mase na svakom preseku, deonice i faktor.
