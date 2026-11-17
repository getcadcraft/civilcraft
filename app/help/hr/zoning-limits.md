---
title: Provjera masa prema ograničenjima zoniranja koja upisujete
summary: Upišite odmake katastarske čestice liniju po liniju, ograničenje visine, ravninu izloženosti nebu, koeficijent iskorištenosti i pokrivenost, pogledajte građevinsku omotnicu na planu te pročitajte koja masa krši koje ograničenje.
keywords: zoniranje, odmak, odmaci, prednji, bočni, stražnji, omotnica, građevna površina, ograničenje visine, ravnina izloženosti nebu, koeficijent iskorištenosti, FAR, pokrivenost, katastarska čestica, pravilnik, provjera propisa
from: 3e267b31
---

**CivilCraft nema nikakav pravilnik o zoniranju ugrađen.** Ne poznaje pravila nijednog grada i ne isporučuje njihovu knjižnicu. Svaki broj na ovoj stranici upisujete vi, iz vlastitog gradskog pravilnika, a svaki rezultat kaže da je mjeren prema ograničenjima koja ste upisali. To je način da vidite kako ograničenja katastarske čestice oblikuju zgradu, a ne presuda o tome je li projekt dopušten.

## Upišite ograničenja

U **Svojstvima**, pod **Mase zgrada**, odaberite **Katastarska čestica** (ili odaberite masu: ograničenja njezine katastarske čestice prikazuju se ispod nje). Zatim upišite što vrijedi; ostavite polje prazno za „bez ograničenja“:

- **Linija ulice**: linija katastarske čestice uz ulicu. **Prednji odmak** vrijedi za nju, **Stražnji odmak** za liniju koja joj je najsuprotnija, a **Bočni odmak** za ostale.
- **Ograničenje visine**.
- **Ravnina neba**: počinje na zadanoj visini na liniji katastarske čestice i diže se za iznos koji upišete za svaku 1 jedinicu pomaka prema unutra, mjereno od linije ulice ili od svake linije katastarske čestice (2 znači 2 prema 1). Dopuštena visina iznad neke točke je najniža od ravnine i ograničenja visine.
- **Koeficijent iskorištenosti** (bruto površina poda masa na katastarskoj čestici podijeljena s površinom katastarske čestice) i **Pokrivenost** (njihovi tlocrti podijeljeni s površinom katastarske čestice, upisani u postocima).

## Građevinska omotnica

Označite **Prikaži omotnicu na planu** da je nacrtate na sloju `A-MASS-ENVL`. Omotnica je katastarska čestica uvučena s svake linije katastarske čestice za njezin vlastiti odmak, a pomaknute linije se susreću u kutovima izrezanim pod kosim kutom. Linija katastarske čestice koja se sastoji od krivulje uzima se kao kratke tetive unutar 0,01 od krivulje. Konveksne i konkavne katastarske čestice podjednako rade. Ako se odmaci preklope (dubok odmak na uskoj ili vrlo konkavnoj čestici), omotnice nema i Svojstva to kažu; probajte manje udaljenosti.

## Rezultat

Ispod polja svaka masa i svako ograničenje dobivaju redak, s kvačicom ili križićem:

- **odmaci**: površina mase koja leži izvan omotnice;
- **visina**: visina mase naspram najveće dopuštene iznad njezina tlocrta (prizma jedne visine ograničena je najnižom dopuštenom visinom u bilo kojem od svojih kutova);
- **koeficijent iskorištenosti** i **pokrivenost**: sve mase na katastarskoj čestici zbrojene.
