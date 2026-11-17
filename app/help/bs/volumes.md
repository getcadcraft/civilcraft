---
title: Zemljani radovi: zapremine
summary: Čitaj zapremine iskopa, nasipa i neto između postojećeg terena i projektovane površine, po platou i koridoru te ukupno, i razumij metodu mreže iza njih.
keywords: zapremine, zemljani radovi, iskop, nasip, neto, iskop i nasip, količine, metoda mreže, poređenje površina, površina zapremina, kubni jardi, kubni metri
from: 299d7bc7
---

Čim plato ili koridor bez problema nivelišu, CivilCraft upoređuje projektovanu površinu s postojećim terenom i prijavljuje iskop i nasip. Brojevi se ažuriraju sa svakom promjenom.

## Gdje ih čitati

- **Zemljani radovi** u desnom panelu bez odabira (prikaz **Projekat**), kad postoji najmanje jedan plato ili jedan koridor.
- **Zemljani radovi** u desnom panelu kad je plato odabran (isti zbirovi za cijeli projekat).
- Red ispod postavki koridora, sa sopstvenim iskopom i nasipom tog koridora.

Blok **Zemljani radovi** prikazuje:

- **Iskop**, **Nasip** i **Neto** (sa „nasip“ ili „iskop“ iza, šta god je veće)
- red po stavci kad ih ima više, na primjer „Plato 1: iskop 120.4 kub. yd, nasip 310.2 kub. yd“
- red metode: „Metoda mreže: postojeći teren i nivelisana površina uzorkovani svakih 0.5 ft unutar linija dnevnog svjetla (92,891 ćelija). Nije primijenjen faktor nabreknuća ni skupljanja.“

Zapremine su u kubnim jardima u projektu u stopama, a u kubnim metrima u projektu u metrima.

## Pošalji ih u TakeoffCraft

Da bi se zemljani radovi ocijenili, izaberi {{ui:Pošalji u TakeoffCraft}} na dnu bloka **Zemljani radovi**. CivilCraft spašava datoteku količina (`<lokacija>.quantities.json`) sa dvije količine: iskop i nasip, u kubnim jardima (projekat u stopama) ili kubnim metrima (projekat u metrima), iste brojeve kao u bloku, zaokružene na stotinke. Otvori je u TakeoffCraftu s **Otvori predmjer**, ili je prevuci tamo: postaju dvije stavke koje možeš ocijeniti ([Iskop i nasip iz CivilCrafta](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Pošalji ponovo nakon promjene i otvori novu datoteku: iste stavke dobiju nove brojeve.

Šalju se samo zbirovi, pa se ništa ne broji dvaput; napomena datoteke navodi iskop i nasip svakog platoa i koridora pojedinačno.

## Kako se računaju

CivilCraft koristi **metodu mreže**:

1. Mreža kvadratnih ćelija postavlja se preko područja unutar svake linije dnevnog svjetla.
2. U središtu svake ćelije uzorkuju se obje površine.
3. Svaka ćelija računa se kao prizma: razlika kota puta površina ćelije. Tamo gdje je projektovana površina niža, to je iskop; više, to je nasip.
4. Ćelije se zbrajaju.

Veličina ćelije bira se umjesto tebe tako da pravougaonik oko nivelisanih područja sadrži oko 250,000 ćelija, zaokruženo na uredan broj (1, 2 ili 5 puta stepen deset). Još ne možeš sam da je postaviš. Red metode kaže veličinu i broj ćelija. Manje ćelije su tačnije uz ivice; na cijelim ćelijama između ravnih ravni rezultat je tačan.

## Šta treba znati

- Računa se samo područje unutar linija dnevnog svjetla. Teren izvan njih se ne mijenja.
- Plato ili koridor s problemom se ne nivelišu i ne dodaju ništa. Ako blok kaže „Još nema zapremina: plato treba nivelisati bez problema.“, potraži crveni okvir iznad.
- Gdje se stavke preklapaju, kasnija zamjenjuje raniju unutar svoje linije dnevnog svjetla, a preklapanje se računa jednom.
- Nije primijenjen faktor nabreknuća ni skupljanja. Pomnoži rezultate sam ako trebaš zapremine u sraslom, rastresitom ili zbijenom stanju.
- Skidanje humusa, dubine kolovoza i posteljice, te zapremine prizmi TIN-na-TIN još nisu dostupne.

## Provjera rezultata

- Uključi {{ui:Projektovano (nivelisano)}} pod **Prikaz** i pogledaj izohipse unutar linija dnevnog svjetla.
- Pređi pokazivačem preko nivelisanog područja: statusna traka prikazuje **Teren** i **Nivelisano**. Razlika je dubina iskopa ili nasipa na tom mjestu.
- Za koridor, očitavanje u prikazu profila pokazuje iskop ili nasip na središnjoj liniji na svakoj stacionaži.
