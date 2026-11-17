---
title: Uzorkovane linije i poprečni presjeci
summary: Presijecite presjeke normalno na os trase, pogledajte teren, projekat i iskop i nasip na svakoj stacionaži, te dobijte zapremine metodom prosječnih krajnjih površina.
keywords: masena bilanca, dijagram masene bilance, tačka ravnoteže, skupljanje, nabrekanje, dužina transporta, pozajmica, otpad, listovi presjeka, listovi poprečnih presjeka, pdf presjeci, presjeci, poprečni presjeci, uzorkovane linije, prikaz presjeka, iskop, nasip, površine, prosječna krajnja površina, zapremine krajnjih površina, zemljani radovi, stacionaža, odstojanje, csv
from: 5060173c
---

Poprečni presjek prikazuje put onako kako će biti izgrađen: normalno na os trase na jednoj stacionaži, postojeći teren, projekat (koridor ili plato uređen u teren) i iskop i nasip između njih.

## Dodajte uzorkovane linije

1. Odaberi os trase. U {{ui:Svojstva}}, pod **Uzorkovane linije**, klikni {{ui:Dodaj uzorkovane linije}}.
2. Postavi **Svakih** (razmak: 50 ft ili 20 m za početak), **Lijeva širina** i **Desna širina** (koliko svaki presjek seže od ose).
3. Da presječeš presjek na određenoj stacionaži, upiši je u **Dodaj stacionažu** (na primjer `2+35`) i pritisni {{key:Enter}}.

Presjeci se sijeku na svakom cijelom umnošku razmaka, na oba kraja osi trase, na početku i kraju svake krivine (PC i PT), i na stacionažama koje dodate. Uzorkovane linije se na planu vide kao sive linije preko osi trase; takođe idu u DXF, DWG i PDF na sloju C-ROAD-SCTN. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Prikaz presjeka

Otvori ga s {{ui:Prikaz presjeka}} u {{ui:Svojstva}} osi trase, {{ui:Presjeci}} pod **Površina** › {{ui:Više}}, ili {{key:X}}. Zauzima mjesto pogleda na profil ispod plana.

- Prolazi kroz presjeke strelicama u njegovoj traci, listom stacionaža, ili {{key:Left}} i {{key:Right}} kada je prikaz presjeka u fokusu ({{key:Home}} i {{key:End}} za prvi i posljednji).
- Siva linija je postojeći teren, crvena linija projekat. Iskop je osjenčen narandžasto, nasip zeleno. Tačke koridora su označene: CL (osa), EOP (ivica kolovoza), SH (bankina) i DL (linija presijecanja).
- Zaglavlje daje stacionažu, površine iskopa i nasipa ovog presjeka i vertikalno uvećanje. **Uklopi** ispunjava panel; izaberi 1× da vidiš presjek u pravoj razmjeri.
- Deblja linija na planu pokazuje koji je presjek na ekranu.

## Listovi presjeka

{{ui:Listovi presjeka (PDF)}} pod **Uzorkovane linije** stavlja svaki presjek na PDF stranice, u redovima sleva nadesno i odozgo nadolje, po redu stacionaža. Izaberi **Papir**, **Razmjeru plana** (horizontalnu razmjeru presjeka) i **Uvećanje profila** (1×, 2×, 5× ili 10×); dijalog kaže koliko presjeka stane na stranicu i koliko stranica to čini.

Svaki presjek prikazuje mrežu s pomacima i kotama, teren (isprekidano), projekat, iskop i nasip osjenčeni (narandžasto i zeleno), tačke koridora, a ispod njega svoju stacionažu i površine iskopa i nasipa. Svaki presjek na listovima se crta iste veličine, dovoljno visok za najveći; kada to ne stane na stranicu pri vašem uvećanju, CivilCraft koristi najveći koji stane i to kaže. Naslovna traka imenuje os trase, stacionaže na toj stranici, razmjere i „List 1 od 3".

## Zapremine metodom prosječnih krajnjih površina

Između dva susjedna presjeka, zapremina je prosjek njihove dvije površine puta razmak njihovih stacionaža. Traka prikazuje ukupne iznose za os trase, a {{ui:CSV}} preuzima površine i zapremine svakog presjeka sa tekućim zbirovima (kubni jardi za projekte u stopama, kubni metri za metričke).

{{ui:Svojstva}} prikazuje iste ukupne iznose uz zapremine metodom mreže iz [Zapremine zemljanih radova](topic:volumes). Ta dva su različite aproksimacije: bliži presjeci ih približavaju, a na pravom putu po ravnom terenu su ista.

:::note
Iskop i nasip se broje samo unutar uređenih površina (linija presijecanja koridora ili platoa), kao što to radi metoda mreže. Bez koridora ili platoa projekat je teren, pa presjek ne pokazuje ni iskop ni nasip.
:::

## Masena bilanca

{{ui:Masena bilanca}} pod **Uzorkovane linije** crta dijagram masene bilance iz istih zapremina po krajnjim površinama: duž stacionaža, tekući zbir iskopa minus nasip.

- **Skupljanje (−) ili nabrekanje (+) iskopa** kaže šta jedan kubni jard iskopa čini kada se ugradi kao nasip: −10 % (početna vrijednost, privremena) znači da se skupi na 0,9; stijena koja nabrekne može imati +5 %. Koristi brojku iz vašeg geotehničkog izvještaja.
- Tamo gdje linija raste, put je u iskopu; tamo gdje pada, u nasipu. Iznad nule (osjenčeno narandžasto) zemlja se pomjera uzvodno; ispod nule (zeleno), nizvodno.
- **Tačke ravnoteže** su mjesta gdje linija siječe nulu: između dvije od njih iskop i nasip se izjednačavaju. Tabela navodi svaku izjednačenu dionicu, pomjerenu zapreminu (njenu najvišu ili najnižu tačku) i prosječnu dužinu transporta (osjenčena površina podijeljena s tom zapreminom).
- Tamo gdje linija završava izvan nule, ostatak je **otpad** (iznad) ili **pozajmica** (ispod). U toj posljednjoj dionici računa se samo zemlja iznad nivoa na kojem završava.

**CSV** spašava masnu ordinatu na svakom presjeku, dionice i faktor.
