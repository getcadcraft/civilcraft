---
title: Uzorkovane linije i poprečni presjeci
summary: Seci presjeke pod pravim uglom na os trase, pogledaj teren, projekat i iskop i nasip na svakoj stacionaži, te dobij zapremine metodom prosječnih površina krajeva.
keywords: raspodjela mase, dijagram mase, tačka ravnoteže, skupljanje, nabreknuće, daljina transporta, pozajmište, deponija, listovi presjeka, listovi poprečnih presjeka, pdf presjeka, presjeci, poprečni presjeci, uzorkovane linije, prikaz presjeka, iskop, nasip, površine, površine krajeva, zapremine zemljanih radova, stacionaža, ofset, csv
from: 09639ce2
---

Poprečni presjek prikazuje put onako kako će biti izgrađen: preko osi trase na jednoj stacionaži, postojeći teren, projekat (koridor ili plato uklopljen u teren) i iskop i nasip između njih.

## Dodaj uzorkovane linije

1. Odaberi osu trase. U **Svojstvima**, pod **Uzorkovane linije**, klikni {{ui:Dodaj uzorkovane linije}}.
2. Postavi **Svakih** (razmak: 50 ft ili 20 m na početku), **Širinu lijevo** i **Širinu desno** (dokle svaki presjek seže od osovine).
3. Da presiječeš presjek na određenoj stacionaži, upiši je u **Dodaj stacionažu** (na primjer `2+35`) i pritisni {{key:Enter}}.

Presjeci se seku na svakom cjelobrojnom umnošku razmaka, na oba kraja osi trase, na početku i kraju svake krivine (PC i PT), te na stacionažama koje dodaš. Uzorkovane linije se na planu prikazuju kao sive linije preko osi trase; izlaze i u DXF, DWG i PDF na sloju C-ROAD-SCTN. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Prikaz presjeka

Otvori ga s {{ui:Prikaz presjeka}} u **Svojstvima** osi trase, {{ui:Presjeci}} pod **Površina** › {{ui:Više}}, ili {{key:X}}. Zauzima mjesto prikaza profila ispod plana.

- Kreći se kroz presjeke strelicama na njegovoj traci, spiskom stacionaža, ili {{key:Left}} i {{key:Right}} kada je prikaz presjeka u fokusu ({{key:Home}} i {{key:End}} za prvi i posljednji).
- Siva linija je postojeći teren, crvena linija projekat. Iskop je zasjenčen narandžasto, nasip zeleno. Tačke koridora su obilježene: CL (osovina), EOP (ivica kolovoza), SH (bankina) i DL (dnevno svjetlo).
- Zaglavlje daje stacionažu, površine iskopa i nasipa ovog presjeka i vertikalno uvećanje. **Uklopi** popunjava panel; izaberi 1× da vidiš presjek u pravoj razmjeri.
- Deblja linija na planu pokazuje koji je presjek na ekranu.
- **Zumiranje i pomjeranje:** točkić zumira oko pokazivača, a povlačenje pomjera prikaz. {{ui:Uklopi}} (ili {{key:F}}, ili dvoklik) ponovo uklapa cijeli presjek.

## Mjerenje u presjeku

1. Klikni {{ui:Izmjeri}} na traci presjeka, ili pritisni {{key:M}}. Savjet kaže „Klikni prvu tačku, zatim drugu.“
2. Klikni dvije tačke. Svaka se hvata za kraj linije ili tačku koridora (CL, EOP, SH, DL); drži {{key:Alt}} za slobodnu tačku.
3. Očitavanje daje horizontalnu daljinu (ΔH), vertikalnu daljinu (ΔV), nagib u procentima sa svojim odnosom i pravu dužinu, u jedinicama projekta.

Klikni ponovo da počneš novo mjerenje. {{key:Esc}} ga briše, a {{key:M}} isključuje režim mjerenja.

## Listovi presjeka

{{ui:Listovi presjeka (PDF)}} pod **Uzorkovane linije** stavlja svaki presjek na PDF stranice, u redovima s lijeva na desno i odozgo prema dolje, po redoslijedu stacionaža. Izaberi **Papir**, **Razmjeru plana** (horizontalnu razmjeru presjeka) i **Uvećanje profila** (1×, 2×, 5× ili 10×); dijalog kaže koliko presjeka staje na stranicu i koliko stranica to čini.

Svaki presjek prikazuje mrežu s ofsetima i kotama, teren (isprekidano), projekat, iskop i nasip zasjenčeni (narandžasto i zeleno), tačke koridora, a ispod njega svoju stacionažu i površine iskopa i nasipa. Svaki presjek na listovima crta se iste veličine, dovoljno visok za najveći; kada to ne stane na stranicu pri tvojem uvećanju, CivilCraft koristi najveći koji stane i to kaže. Naslovna traka imenuje os trase, stacionaže na toj stranici, razmjere i „List 1 od 3“.

## Do čega se mjere iskop i nasip

Koridor može imati slojeve ispod kolovoza: slojeve kolovozne konstrukcije, komponente šablona, kolosijek. Izbor **Zapremine se mjere do** na traci presjeka određuje do čega idu iskop i nasip:

- **Donja površina** (početna vrijednost): do donje strane tih komponenti, pa iskop uključuje dubinu sastava kolovoza.
- **Gornja površina**: samo do gornje strane projekta, kao prije, kada se komponente nisu računale.

Površine u zaglavlju, zapremine ispod, CSV i raspodjela mase svi slijede ovaj izbor, i čuvaju se s projektom.

## Zapremine metodom prosječnih površina krajeva

Između dva susjedna presjeka, zapremina je prosjek njihove dvije površine pomnožen s daljinom između njihovih stacionaža. Traka pokazuje ukupne iznose za os trase, a {{ui:CSV}} preuzima površine i zapremine svakog presjeka s tekućim zbirovima (kubnih jardi za projekte u stopama, kubnih metara za metričke).

**Svojstva** pokazuju iste ukupne iznose uz zapremine metodom mreže iz [Zapremine zemljanih radova](topic:volumes). To su dvije različite aproksimacije: bliži presjeci ih približavaju, a na pravom putu na ravnom terenu one su iste.

:::note
Iskop i nasip se broje samo unutar uklopljenih površina (linija dnevnog svjetla koridora ili platoa), kao i metodom mreže. Bez koridora ili platoa projekat je teren, pa presjek ne pokazuje iskop ni nasip.
:::

## Raspodjela mase

**Raspodjela mase** pod **Uzorkovane linije** crta dijagram raspodjele mase iz istih zapremina površina krajeva: duž stacionaža, tekući zbir iskopa umanjen za nasip.

- **Skupljanje (−) ili nabreknuće (+) iskopa** kaže šta jedan kubni jard iskopa čini kada se ugradi kao nasip: −10 % (početna vrijednost, privremena) znači da se skuplja na 0.9; stijena koja nabrekne može biti +5 %. Koristi podatak iz svog geotehničkog izvještaja.
- Tamo gdje linija raste, put je u iskopu; tamo gdje pada, u nasipu. Iznad nule (zasjenčeno narandžasto) zemlja se pomjera prema većim stacionažama; ispod nule (zeleno), prema manjim.
- **Tačke ravnoteže** su mjesta gdje linija siječe nulu: između dvije od njih iskop i nasip se izjednačavaju. Tabela navodi svaku uravnoteženu dionicu, pomjerenu zapreminu (njena najviša ili najniža tačka) i prosječnu daljinu transporta (zasjenčena površina podijeljena tom zapreminom).
- Tamo gdje linija završava van nule, ono što preostane je **deponija** (iznad) ili **pozajmište** (ispod). Na toj posljednjoj dionici kao pomjereno se računa samo zemlja preko nivoa na kojem linija završava.

**CSV** čuva ordinatu mase na svakom presjeku, dionice i faktor.
