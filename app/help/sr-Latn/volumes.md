---
title: Zapremine zemljanih radova
summary: Pročitajte zapremine iskopa, nasipa i neto zapremine između postojećeg terena i predložene površi, po platou i koridoru i ukupno, i razumite metodu mreže iza njih.
keywords: zapremine, zemljani radovi, iskop, nasip, neto, iskop i nasip, količine, metoda mreže, poređenje površi, površ zapremine, kubni jardi, kubni metri
from: 299d7bc7
---

Čim plato ili koridor prođe nivelaciju bez problema, CivilCraft upoređuje predloženu površ sa postojećim terenom i izveštava iskop i nasip. Brojevi se ažuriraju sa svakom promenom.

## Gde ih čitate

- **Zemljani radovi** u desnom panelu kada ništa nije izabrano (prikaz **Projekat**), kada postoji bar jedan plato ili jedan koridor.
- **Zemljani radovi** u desnom panelu kada je plato izabran (isti ukupni zbirovi za ceo projekat).
- Red ispod podešavanja koridora, sa sopstvenim iskopom i nasipom tog koridora.

Blok **Zemljani radovi** prikazuje:

- **Iskop**, **Nasip** i **Neto** (sa „nasip“ ili „iskop“ iza, šta god je veće)
- red po stavci kada ih ima više od jedne, na primer „Plato 1: iskop 120.4 cu yd, nasip 310.2 cu yd“
- red o metodi: „Metoda mreže: postojeći teren i nivelisana površ uzorkovani na svakih 0.5 ft unutar linija preseka sa terenom (92,891 ćelija). Nije primenjeno nabubravanje ni skupljanje.“

Zapremine su u kubnim jardima u projektu u stopama, a u kubnim metrima u projektu u metrima.

## Pošaljite ih u TakeoffCraft

Da biste odredili cenu zemljanih radova, izaberite {{ui:Pošalji u TakeoffCraft}} na dnu bloka **Zemljani radovi**. CivilCraft čuva datoteku količina (`<site>.quantities.json`) sa dve količine: iskop i nasip, u kubnim jardima (projekat u stopama) ili kubnim metrima (projekat u metrima), iste brojeve kao u bloku, zaokružene na stotinke. Otvorite je u TakeoffCraft-u sa {{ui:Otvori predmer}} ili je prevucite tamo: postaju dve stavke koje možete da cenite ([Iskop i nasip iz CivilCraft-a](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Pošaljite ponovo posle promene i otvorite novu datoteku: iste stavke dobijaju nove brojeve.

Šalju se samo ukupni zbirovi, pa se ništa ne broji dvaput; napomena datoteke navodi iskop i nasip svakog platoa i koridora posebno.

## Kako se izračunavaju

CivilCraft koristi **metodu mreže**:

1. Mreža kvadratnih ćelija postavlja se preko područja unutar svake linije preseka sa terenom.
2. U središtu svake ćelije uzorkuju se obe površi.
3. Svaka ćelija se računa kao prizma: razlika kota puta površina ćelije. Gde je predložena površ niža, to je iskop; gde je viša, to je nasip.
4. Ćelije se sabiraju.

Veličinu ćelije bira CivilCraft umesto vas tako da pravougaonik oko nivelisanih područja sadrži oko 250,000 ćelija, zaokružen na urednu vrednost (1, 2 ili 5 puta stepen deset). Još ne možete sami da je podesite. Red metode kaže veličinu i broj ćelija. Manje ćelije su tačnije duž ivica; za cele ćelije između ravnih ravni rezultat je tačan.

## Stvari koje treba znati

- Računa se samo područje unutar linija preseka sa terenom. Teren van njih ostaje nepromenjen.
- Plato ili koridor koji ne prolazi nivelaciju bez problema ne ulazi u zbir i ne dodaje ništa. Ako blok kaže „Još nema zapremina: plato mora da prođe nivelaciju bez problema.“, potražite crveni okvir iznad njega.
- Gde se stavke preklapaju, kasnija je zamenila ranije unutar svoje linije preseka, a preklapanje se računa jednom.
- Nije primenjen faktor nabubravanja ni skupljanja. Pomnožite rezultate sami ako su vam potrebne zapremine u sraslom, rastresitom ili zbijenom stanju.
- Skidanje humusa, dubine kolovoza i posteljine, i zapremine prizmi TIN-na-TIN još nisu dostupne.

## Provera rezultata

- Uključite {{ui:Predloženo (sa nagibom)}} pod **Prikaz** i pogledajte izohipse unutar linija preseka sa terenom.
- Pređite pokazivačem preko nivelisanog područja: statusna traka prikazuje **Teren** i **Nivelisano**. Razlika je dubina iskopa ili nasipa na tom mestu.
- Za koridor, očitavanje u prikazu profila pokazuje iskop ili nasip na središnjoj osi na svakoj stacionaži.
