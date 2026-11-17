---
title: Volumeni zemljanih radova
summary: Pročitajte iskop, nasip i neto volumene između postojećeg terena i projektirane površine, po platou i koridoru te ukupno, i razumijte mrežnu metodu iza njih.
keywords: volumeni, zemljani radovi, iskop, nasip, neto, iskop i nasip, količine, mrežna metoda, usporedba površina, volumen površine, kubični jardi, kubični metri
from: 299d7bc7
---

Čim se plato ili koridor isplanira bez problema, CivilCraft uspoređuje predloženu površinu s postojećim terenom i prikazuje iskop i nasip. Brojevi se ažuriraju uz svaku promjenu.

## Gdje ih čitati

- **Zemljani radovi** na desnoj ploči kada ništa nije odabrano (prikaz **Projekt**), kada postoji barem jedan plato ili jedan koridor.
- **Zemljani radovi** na desnoj ploči kada je odabran plato (isti zbrojevi za cijeli projekt).
- Redak ispod postavki koridora, sa vlastitim iskopom i nasipom tog koridora.

Blok **Zemljani radovi** prikazuje:

- **Iskop**, **Nasip** i **Neto** (uz koje stoji „nasip“ ili „iskop“, što god je veće)
- redak za svaku stavku kada ih ima više, na primjer „Plato 1: iskop 120.4 cu yd, nasip 310.2 cu yd“
- redak metode: „Mrežna metoda: postojeći teren i isplanirana površina uzorkovani svakih 0.5 ft unutar linija nožice pokosa (92,891 ćelija). Nije primijenjeno nabreknuće ni sažimanje.“

Volumeni su u kubičnim jardima u projektu u stopama, a u kubičnim metrima u projektu u metrima.

## Pošaljite ih u TakeoffCraft

Da biste odredili cijenu zemljanih radova, odaberite {{ui:Pošalji u TakeoffCraft}} na dnu bloka **Zemljani radovi**. CivilCraft sprema datoteku količina (`<site>.quantities.json`) s dvije količine: iskop i nasip, u kubičnim jardima (projekt u stopama) ili kubičnim metrima (projekt u metrima), jednake brojevima u bloku, na dvije decimale. Otvorite je u TakeoffCraft pomoću **Otvori predmjer** ili je povucite tamo: postaju dvije stavke kojima možete odrediti cijenu ([Iskop i nasip iz CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Pošaljite ponovno nakon promjene i otvorite novu datoteku: iste stavke preuzimaju nove brojeve.

Šalju se samo ukupni iznosi, pa se ništa ne broji dvaput; bilješka datoteke navodi iskop i nasip svakog platoa i koridora.

## Kako se izračunavaju

CivilCraft koristi **mrežnu metodu**:

1. Mreža kvadratnih ćelija postavlja se preko područja unutar svake linije nožice pokosa.
2. U središtu svake ćelije uzorkuju se obje površine.
3. Svaka ćelija računa se kao prizma: razlika kota puta površina ćelije. Tamo gdje je predložena površina niža, to je iskop; gdje je viša, to je nasip.
4. Ćelije se zbrajaju.

Veličina ćelije odabire se umjesto vas tako da pravokutnik oko isplaniranih površina sadrži oko 250,000 ćelija, zaokružena na uredan iznos (1, 2 ili 5 puta potencija broja deset). Još je ne možete sami postaviti. Redak metode kaže veličinu i broj ćelija. Manje ćelije su točnije uz rubove; na cijelim ćelijama između ravnih ravnina rezultat je točan.

## Što treba znati

- Računa se samo područje unutar linija nožice pokosa. Teren izvan njih ostaje nepromijenjen.
- Plato ili koridor s problemom ne ulazi u planiranje i ne dodaje ništa. Ako blok kaže „Još nema volumena: plato se mora planirati bez problema.“, potražite crveni okvir iznad njega.
- Tamo gdje se stavke preklapaju, kasnija je zamijenila raniju unutar svoje linije nožice pokosa, a preklapanje se broji jednom.
- Nije primijenjen faktor nabreknuća ni sažimanja. Ako trebate volumene u sraslom, rastresitom ili zbijenom stanju, sami pomnožite rezultate.
- Skidanje humusa, dubine kolnika i posteljice te volumeni prizmi TIN-to-TIN još nisu dostupni.

## Provjera rezultata

- Uključite {{ui:Projektirano (planirano)}} pod **Prikaz** i pogledajte izohipse unutar linija nožice pokosa.
- Pomaknite pokazivač preko isplaniranog područja: statusna traka prikazuje **Teren** i **Isplanirano**. Razlika je dubina iskopa ili nasipa na tom mjestu.
- Za koridor, očitanje prikaza profila pokazuje iskop ili nasip na središnjoj liniji u svakoj stacionaži.
