---
title: Provera masa prema zonskim granicama koje unosite
summary: Unesite povlačenja parcele red po red, ograničenje visine, ravan izloženosti nebu, koeficijent iskorišćenosti i zauzetost, pogledajte dozvoljeni građevinski prostor na planu i pročitajte koje mase krše koje granice.
keywords: zoniranje, povlačenje, povlačenja, prednje, bočno, zadnje, dozvoljeni prostor, građevinski prostor, ograničenje visine, ravan izloženosti nebu, koeficijent iskorišćenosti, zauzetost, parcela, propis, provera propisa
from: 3e267b31
---

**CivilCraft nema zonski propis ugrađen.** Ne poznaje pravila nijednog grada i ne isporučuje njihovu biblioteku. Svaki broj na ovoj stranici unosite vi, iz sopstvenog propisa, i svaki rezultat kaže da je meren prema granicama koje ste uneli. Ovo je način da vidite kako granice parcele oblikuju zgradu, a ne odluka o tome da li je projekat dozvoljen.

## Unesite granice

U **Svojstva**, pod **Građevinske mase**, izaberite **parcelu** (ili izaberite masu: granice njene parcele prikazuju se ispod nje). Zatim popunite ono što važi; ostavite polje prazno za „bez ograničenja“:

- **Linija ulice**: granična linija parcele uz ulicu. **Prednje povlačenje** se odnosi na nju, **zadnje povlačenje** na liniju koja joj je najsuprotnija, a **bočno povlačenje** na ostale.
- **Ograničenje visine**.
- **Ravan izloženosti nebu**: počinje na nekoj visini na granici parcele i raste za iznos koji unesete za svaki 1 horizontalnog hoda unutra, meren od linije ulice ili od svake granice parcele (2 znači 2 prema 1). Dozvoljena visina iznad neke tačke je najniža od ravni i ograničenja visine.
- **Koeficijent iskorišćenosti** (bruto površina masa na parceli podeljena površinom parcele) i **Zauzetost** (njihovi otisci podeljeni površinom parcele, unose se u procentima).

## Dozvoljeni građevinski prostor

Označite **Prikaži dozvoljeni građevinski prostor na planu** da ga nacrtate na sloju `A-MASS-ENVL`. Građevinski prostor je parcela uvučena od svake granice za povlačenje te linije, a pomerene linije se sastaju u koso secenim uglovima. Granična linija parcele koja je krivina računa se kao kratke tetive, unutar 0.01 od krivine. Konveksne i konkavne parcele rade podjednako. Ako se povlačenja preklope preko sebe (duboko povlačenje na uskoj ili veoma konkavnoj parceli), nema građevinskog prostora, a Svojstva to kažu; probajte manje razdaljine.

## Rezultat

Ispod polja, svaka masa i svako ograničenje dobijaju red, sa znakom za ispunjeno ili neispunjeno:

- **povlačenja**: površina mase koja je van građevinskog prostora;
- **visina**: visina mase u odnosu na najveću dozvoljenu iznad njenog otiska (prizma jedne visine ograničena je najnižom dozvoljenom visinom u bilo kom svom uglu);
- **koeficijent iskorišćenosti** i **zauzetost**: sve mase na parceli zbrojene.
