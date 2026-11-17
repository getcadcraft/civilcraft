---
title: Provjerite mase prema ograničenjima zoniranja koja unosite
summary: Upišite odmake parcele red po red, ograničenje visine, ravan izlaganja nebu, koeficijent iskorištenosti i zauzetost, pogledajte dozvoljeni omotač na planu i pročitajte koje mase krše koje ograničenje.
keywords: zoniranje, odmak, odmaci, prednji, bočni, zadnji, omotač, dozvoljena površina, ograničenje visine, ravan izlaganja nebu, FAR, koeficijent iskorištenosti, zauzetost, pokrivenost, parcela, pravilnik, provjera pravilnika
from: 3e267b31
---

**CivilCraft nema pravilnik o zoniranju u sebi.** Ne poznaje pravila nijednog grada i ne isporučuje njihovu biblioteku. Svaki broj na ovoj stranici unosite vi iz vlastitog pravilnika, a svaki rezultat kaže da je mjeren prema ograničenjima koja ste upisali. To je način da vidite kako ograničenja parcele oblikuju zgradu, a ne odluka o tome da li je projekat dozvoljen.

## Upišite ograničenja

U **Svojstvima**, pod **Mase zgrada**, izaberite **Parcelu** (ili izaberite masu: ispod nje se prikazuju ograničenja njene parcele). Zatim popunite što se odnosi; ostavite polje prazno za „nema ograničenja“:

- **Linija ulice**: linija parcele uz ulicu. **Prednji odmak** se primjenjuje na nju, **Zadnji odmak** na liniju najsuprotniju njoj, a **Bočni odmak** na ostale.
- **Ograničenje visine**.
- **Ravan neba**: počinje na visini kod linije parcele i diže se za iznos koji upišete za svaki 1 dužine prema unutra, mjereno od linije ulice ili od svake linije parcele (2 znači 2 prema 1). Dozvoljena visina iznad tačke je najniža od ravni i ograničenja visine.
- **Koeficijent iskorištenosti** (bruto površina poda masa na parceli podijeljena sa površinom parcele) i **Zauzetost** (njihovi otisci podijeljeni sa površinom parcele, upisani u procentima).

## Omotač

Označite **Prikaži omotač na planu** da ga nacrtate na sloju `A-MASS-ENVL`. Omotač je parcela uvučena sa svake linije parcele za odmak te linije, sa pomaknutim linijama koje se spajaju pod uglom. Linija parcele sastavljena od krivine uzima se kao kratke tetive unutar 0.01 od krivine. Konveksne i konkavne parcele rade obje. Ako se odmaci preklapaju (duboki odmak na uskoj ili vrlo konkavnoj parceli), nema omotača, a Svojstva to kažu; probajte manje udaljenosti.

## Rezultat

Ispod polja, svaka masa i svako ograničenje dobijaju red sa kvačicom ili križićem:

- **odmaci**: površina mase koja je izvan omotača;
- **visina**: visina mase u odnosu na najveću dozvoljenu iznad njenog otiska (prizma jedne visine ograničena je najnižom dozvoljenom visinom u bilo kojem od svojih uglova);
- **koeficijent iskorištenosti** i **zauzetost**: sve mase na parceli zbrojene.
