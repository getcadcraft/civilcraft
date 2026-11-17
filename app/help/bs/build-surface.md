---
title: Izgradnja i dorada površine
summary: Kako CivilCraft trijangulira postojeći teren i kako ga oblikovati grupama prelomnih linija, nacrtanim prelomnim linijama, vanjskom granicom i najdužom vanjskom ivicom.
keywords: tin, površina, trijangulacija, prelomna linija, granica, postojeći teren, eg, kreiraj površinu, delaunay, trouglovi, maks ivica, vanjska granica
from: b9eea3f3
---

CivilCraft ima jednu postojeću površinu terena po projektu. To je TIN (trijangulisana nepravilna mreža) izgrađena od tvojih tačaka, i ponovo se gradi automatski svaki put kad se neki ulaz promijeni. Nema komande „ponovo izgradi” i nema zastarjele površine.

## Šta ulazi u površinu

- Svaka tačka sa kotom u grupi postavljenoj na {{ui:Tačke}}.
- Svaka grupa postavljena na {{ui:Prelomna linija}}, spojena po redu brojeva tačaka.
- Svaka prelomna linija koju nacrtaš alatom {{ui:Prelomna linija}}.
- Vanjska granica, ako je nacrtaš.
- Postavka **Najduža vanjska ivica**.

Trouglovi nikad ne sijeku prelomnu liniju: površina je prisiljena da je slijedi, pa se napravi što ravnomjernije oko nje (Delaunay svuda drugdje).

## Pretvori kodirane linije u prelomne linije

1. U lijevom panelu pod **Tačke** nađi grupu (na primjer FL).
2. Postavi njen izbor **Površina** na {{ui:Prelomna linija}}.
   Površina se ponovo gradi, linija se crta narandžasto (sa uključenim {{ui:Linije prijeloma}} pod **Prikaz**), i **Linije prijeloma** u činjenicama o površini poraste za jedan.
3. Provjeri liniju na planu. Mora ići tačku po tačku, redom kojim je snimljena. Ako ide cik-cak, grupa sadrži više od jedne linije, ili tačke nisu numerisane po redu: vrati grupu na {{ui:Tačke}} i nacrtaj linije ručno (sljedeći odjeljak).

## Nacrtaj prelomnu liniju kroz tačke

1. Pritisni {{key:B}} ili klikni {{ui:Prelomna linija}} u grupi **Površina**.
   Savjet kaže „Prelomna linija: klikni tačke geodetskog snimanja redom (uzima njihove kote). Enter završava.”
2. Pomjeri pokazivač blizu tačke. Mali narandžasti kvadrat označava tačku koju će uzeti.
3. Klikni tačke linije jednu za drugom. Svaki klik imenuje tačku i njenu kotu u statusnoj traci.
4. Pritisni {{key:Enter}} za završetak.
   Statusna traka kaže „Prelomna linija 1 dodana; površina je ponovo izgrađena.”

Klikovi moraju pasti na tačku geodetskog snimanja koja ima kotu; klik negdje drugdje se odbija uz poruku „Klikni tačku geodetskog snimanja sa kotom: prelomna linija uzima kote tačaka.” {{key:Backspace}} briše posljednju tačku; {{key:Esc}} otkazuje cijelu liniju.

:::warning
Završi sa {{key:Enter}}. Dvostruki klik takođe završava, ali u ovoj verziji odbacuje tačku na koju si dvaput kliknuo. Klikni posljednju tačku jednom, pa pritisni {{key:Enter}}.
:::

Da ukloniš odjednom sve nacrtane prelomne linije, klikni {{ui:Ukloni nacrtane linije loma}} u odjeljku **Površina**. Da ukloniš samo posljednju, koristi {{key:Mod+Z}}. Nacrtane prelomne linije još se ne mogu birati ni uređivati pojedinačno.

## Nacrtaj vanjsku granicu

Granica sijeće površinu na područje kojem vjeruješ, na primjer granice snimanja, tako da dugi trouglovi preko nesnimljenih uglova nestanu.

1. Pritisni {{key:O}} ili klikni {{ui:Granica}}.
2. Klikni uglove redom oko područja. Isprekidana linija prikazuje oblik.
3. Pritisni {{key:Enter}}.
   Statusna traka kaže „Granica postavljena; trouglovi izvan nje su nestali.” **Granica** u činjenicama o površini kaže „Da” i broj uglova.

Stvari koje treba znati:

- Postoji jedna granica. Crtanje nove zamjenjuje staru. {{ui:Ukloni granicu}} je uklanja.
- Granica može samo oduzimati: granica koja ide preko tačaka sijeće se nazad na njihov obris, uz napomenu „Granica ide preko tačaka; vraćena je na njihov obris.”
- Njeni uglovi preuzimaju kote iz površine, pa ivica tačno prati teren.
- Skrivene (unutrašnje) granice još nisu dostupne.

## Odsijeci duge vanjske trouglove

Bez granice, površina popunjava cijeli obris tačaka, uključujući duge tanke trouglove preko konkavnih ivica.

1. U **Površina**, upiši dužinu u **Najduža vanjska ivica** i pritisni {{key:Enter}}. Počni sa oko dva do tri puta tvojim tipičnim razmakom snimanja.
2. Vanjski trouglovi čija je vanjska ivica duža od toga se uklanjaju, idući unutra dok svaka vanjska ivica ne bude dovoljno kratka. Ivica koja je prelomna linija se nikad ne skida.
3. Upiši 0 da ponovo zadržiš sve trouglove.

## Pročitaj izvještaj o površini

Ispod činjenica o površini, okvir navodi šta je graditelj uradio. Sa ohra trakom s lijeve strane to je informacija; sa crvenom trakom sadrži grešku i nema površine.

| Poruka | Značenje |
|---|---|
| „3 tačke bile su na istom mjestu kao neka druga i spojile su se s njom.” | Tačke bliže od 0.0001 u planu postale su jedan vrh (prvi ostao). |
| „2 mjesta imaju dvije različite kote …” | Tačke jedna na drugoj, ili prelomne linije koje se sijeku, ne slažu se u visini. Kota prelomne linije pobjeđuje, pa prva. |
| „1 dio prelomne linije nije mogao biti prisiljen u površinu.” | Vrlo kratak ili gotovo preklapajući dio prelomne linije nije stao; provjeri to mjesto. |
| „Površina treba najmanje tri tačke sa kotama.” | Premalo tačaka: provjeri redoslijed kolona i grupe. |
| „Sve tačke su na jednoj liniji: nema trouglova.” | Tačke nemaju širinu, na primjer jedna linija poligonskog vlaka. |
| „Granica se ne preklapa sa tačkama.” | Granica je negdje drugdje, često zbog miješanja jedinica ili koordinata. |
| „Unutar granice nema preostalih trouglova.” | Granica je premala ili pogrešno postavljena. |

## Površina pročitana iz LandXML-a

Kad otvoriš LandXML, njegova prva TIN površina koristi se takva kakva jeste: naslov **Površina** kaže „Površina (iz LandXML-a)” a **Najduža vanjska ivica** je zasivljena. Dok je ta površina u upotrebi, grupe prelomnih linija, nacrtane prelomne linije i nova granica je ne mijenjaju. Da površinu izgradiš iz tačaka datoteke, klikni {{ui:Ponovo izgradi površinu iz tačaka}}. {{key:Mod+Z}} vraća površinu iz LandXML-a.

## Povezano

- [Čitanje kontura, kota i nagiba](topic:contours).
- [Uvoz tačaka geodetskog snimanja](topic:import-points).
