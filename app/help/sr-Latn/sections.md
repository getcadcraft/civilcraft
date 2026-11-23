---
title: Probne linije i poprečni preseci
summary: Seci preseke normalno na osovinu trase, vidi teren, projekat i usek i nasip na svakoj stacionaži, i dobij zapremine metodom prosečnih površina preseka.
keywords: dijagram prevoza masa, tačka ravnoteže, skupljanje, nabrekavanje, rastojanje prevoza, pozajmište, deponija, listovi preseka, listovi poprečnih preseka, preseci pdf, preseci, poprečni preseci, probne linije, prikaz preseka, usek, nasip, površine, metod prosečnih površina, zemljani radovi, stacionaža, ofset, csv
from: 09639ce2
---

Poprečni presek prikazuje put onako kako će biti izgrađen: normalno na osovinu na jednoj stacionaži, postojeći teren, projekat (koridor ili plato uklopljen u teren) i usek i nasip između njih.

## Dodavanje probnih linija

1. Izaberi osovinu trase. U **Svojstvima**, pod **Probne linije**, klikni {{ui:Dodaj probne linije}}.
2. Postavi **Na svakih** (razmak: 50 ft ili 20 m na početku), **Širinu levo** i **Širinu desno** (koliko daleko svaki presek ide od osovine).
3. Da odsecaš presek na određenoj stacionaži, ukucaj je u **Dodaj stacionažu** (na primer `2+35`) i pritisni {{key:Enter}}.

Preseci se seku na svakom celom umnošku razmaka, na oba kraja osovine, na početku i kraju svake krivine (PC i PT) i na stacionažama koje dodaš. Probne linije se na osnovi prikazuju kao sive linije preko osovine; idu i u DXF, DWG i PDF na sloju C-ROAD-SCTN. Svaka promena je jedan korak: {{key:Mod+Z}} je opoziva.

## Prikaz preseka

Otvori ga sa {{ui:Prikaz preseka}} u **Svojstvima** osovine, {{ui:Preseci}} pod **Površ** › {{ui:Više}}, ili {{key:X}}. Zauzima mesto prikaza profila ispod osnove.

- Kreći se kroz preseke strelicama u njegovoj traci, listom stacionaža, ili {{key:Left}} i {{key:Right}} kad je prikaz preseka aktivan ({{key:Home}} i {{key:End}} za prvi i poslednji).
- Siva linija je postojeći teren, crvena linija projekat. Usek je osenčen narandžasto, nasip zeleno. Tačke koridora su obeležene: CL (osovina), EOP (ivica kolovoza), SH (bankina) i DL (linija preseka sa terenom).
- Zaglavlje daje stacionažu, površine useka i nasipa ovog preseka i vertikalno uveličanje. **Uklopi** popunjava panel; izaberi 1× da vidiš presek u pravoj razmeri.
- Debela linija na osnovi pokazuje koji je presek na ekranu.
- **Uvećavanje i pomeranje:** točkić uvećava oko kursora, a prevlačenje pomera prikaz. {{ui:Uklopi}} (ili {{key:F}}, ili dvostruki klik) ponovo uklapa ceo presek.

## Merenje u preseku

1. Klikni {{ui:Izmeri}} u traci preseka, ili pritisni {{key:M}}. Savet kaže „Klikni prvu tačku, pa drugu.“
2. Klikni dve tačke. Svaka se hvata za kraj linije ili tačku koridora (CL, EOP, SH, DL); drži {{key:Alt}} za slobodnu tačku.
3. Očitavanje daje horizontalno rastojanje (ΔH), vertikalno rastojanje (ΔV), nagib u procentima sa svojim odnosom i pravu dužinu, u jedinicama projekta.

Ponovnim klikom počinješ novo merenje. {{key:Esc}} ga briše, a {{key:M}} isključuje Izmeri.

## Listovi preseka

{{ui:Listovi preseka (PDF)}} pod **Probne linije** stavlja svaki presek na PDF stranice, u redovima sleva nadesno i odozgo nadole po redosledu stacionaža. Izaberi **Papir**, **Razmera osnove** (horizontalna razmera preseka) i **Uveličanje profila** (1×, 2×, 5× ili 10×); dijalog kaže koliko preseka staje na stranicu i koliko stranica to pravi.

Svaki presek prikazuje mrežu sa ofsetima i kotama, teren (isprekidano), projekat, usek i nasip osenčene (narandžasto i zeleno), tačke koridora, a ispod njega svoju stacionažu i površine useka i nasipa. Svaki presek na listovima crta se iste veličine, dovoljno visok za najveći; kad to ne staje na stranicu pri tvom uveličanju, CivilCraft koristi najveću koja staje i to kaže. Naslovna traka imenuje osovinu, stacionaže na toj stranici, razmere i „List 1 od 3“.

## Do čega se mere usek i nasip

Koridor može imati slojeve ispod kolovoza: slojeve kolovoza, komponente šablona, trase. Izbor **Zapremine merene do** u traci preseka određuje do čega usek i nasip idu:

- **Donja površ** (početna vrednost): do donje ivice tih komponenti, pa usek uključuje dubinu sastava kolovoza.
- **Gornja površ**: samo do vrha projekta, kao pre nego što su se komponente brojale.

Površine u zaglavlju, zapremine ispod, CSV i prevoz masa svi prate ovaj izbor, i čuva se uz projekat.

## Zapremine metodom prosečnih površina

Između dva susedna preseka zapremina je prosek njihove dve površine puta rastojanje između stacionaža. Traka prikazuje zbirove za osovinu, a {{ui:CSV}} preuzima površine i zapremine svakog preseka sa zbirovima u toku (kubni jardi za projekte u stopama, kubni metri za metričke).

**Svojstva** prikazuju iste zbirove pored zapremina metodom mreže iz [Zapremine zemljanih radova](topic:volumes). To su dve različite aproksimacije: bliži preseci ih približavaju, a na pravom putu po ravnom terenu one su iste.

:::note
Usek i nasip se broje samo unutar uklopljenih površina (linija preseka sa terenom koridora ili platoa), kao i metod mreže. Bez koridora ili platoa projekat je teren, pa presek ne prikazuje usek ni nasip.
:::

## Prevoz masa

**Prevoz masa** pod **Probne linije** crta dijagram prevoza masa iz istih zapremina metodom prosečnih površina: duž stacionaža, tekući zbir useka umanjen za nasip.

- **Skupljanje (−) ili nabrekavanje (+) useka** kaže šta jedan kubni jard useka daje kad se ugradi kao nasip: −10 % (početna vrednost, privremena) znači da se smanjuje na 0.9; stena koja nabreka može imati +5 %. Koristi vrednost iz svog geotehničkog izveštaja.
- Gde linija raste, put je u usek; gde pada, u nasip. Iznad nule (osenčeno narandžasto) zemlja se pomera naviše po stacionaži; ispod nule (zeleno), naniže po stacionaži.
- **Tačke ravnoteže** su mesta gde linija seče nulu: između dve od njih usek i nasip se izjednačavaju. Tabela navodi svaku uravnoteženu deonicu, prebačenu zapreminu (njena najviša ili najniža tačka) i prosečno rastojanje prevoza (osenčena površina podeljena tom zapreminom).
- Gde linija završava van nule, ono što ostane je **deponija** (iznad) ili **pozajmište** (ispod). Na toj poslednjoj deonici kao prebačena računa se samo zemlja preko nivoa na kom se završava.

**CSV** čuva ordinatu mase na svakom preseku, deonice i faktor.
