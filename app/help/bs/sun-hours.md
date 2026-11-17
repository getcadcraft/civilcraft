---
title: Izračunaj sate sunca na lokaciji
summary: Odaberi dan (ili sezonu) i vremensku zonu i vidi sate direktnog sunca na svakom zidu svake mase i na terenu oko njih, s terenom nacrtanim na planu i brojkama kao CSV.
keywords: sunce, sati sunca, sjena, zasjenjenje, solarni pristup, sati dnevne svjetlosti, fasada, zid, sezona, solsticij, ekvinocij, vremenska zona, ljetnje računanje vremena, geografska širina, geografska dužina, CSV, raster
from: 4e32a314
---

**Sati sunca** broji sate direktnog sunca koji dopiru do svakog zida svake mase zgrade i do terena oko njih, na dan koji odaberete ili usrednjeno za sezonu. Mase i sam teren bacaju sjenu; ništa drugo ne (nema drveća, nema susjeda koje niste nacrtali). Svjetlost neba koja nije direktno sunce se ne računa.

## Prije početka

Položaj sunca dolazi iz geografske širine i dužine lokacije, koje dolaze iz **koordinatnog sistema** projekta. Projekat bez njega se odbija porukom: prvo ga postavi (**Koordinate** u grupi GIS). Geografska širina i dužina upisane ručno bile bi pretpostavka, pa za njih nema polja.

## Izračunaj

U **Svojstvima**, pod **Mase zgrada**, **Sati sunca**:

1. Odaberi **Dan**. Počinje od dana kada je sunce najniže gdje se nalazite (21. decembar, ili 21. juni na južnoj hemisferi). Za sezonu označi **Tokom sezone**, odaberi **Posljednji dan** i koliko dana razmaka uzeti za uzorkovanje.
2. Upiši **Vremensku zonu**: ime kao što je `America/Mexico_City`, ili odstupanje od UTC-a kao što je `-6`. Ime prati pravila ljetnjeg računanja vremena te zone za taj dan; odstupanje koje upišete koristi se tačno kako ste ga upisali, pa koristite ono koje važi tog dana. Linija ispod polja kaže koje odstupanje je pronašla.
3. Odaberi koliko često postaviti sunce (svakih 5, 10, 15 ili 30 minuta), zatim **Izračunaj sate sunca**. Sezona se izvodi u pozadinskim procesima; **Zaustavi** je otkazuje.

## Šta dobijate

- Tabela po masi: **najgori zid**, **prosjek** i **najbolji zid**, u satima dnevno, i tabela svakog zida s njegovom orijentacijom i satima po spratovima.
- Teren oko masa, nacrtan na planu od tamne (bez sunca) do žute (najviše što ćelija dobija), s legendom. Ćelije ispod mase ostaju prazne. **Prikaži teren na planu** ga isključuje.
- **Zidovi kao CSV** i **Teren kao CSV** čuvaju brojke.

Za sezonu brojke su prosjek po danu preko uzorkovanih dana. Ništa se ne čuva u projektu: rezultat je za pregled, a ponovno pokretanje ga ponovo pravi.

## Korisno znati

- Zid trenutak računa kao sunčan samo kada je okrenut prema suncu i ništa mu ne smeta. Zid okrenut od sunca ne dobija ništa.
- Teren se uzorkuje na mreži koja zavisi od veličine lokacije, a položaj sunca se računa na sredini svakog vremenskog koraka, pa su sati tačni do otprilike koraka koji ste odabrali.
- Položaj sunca je objavljena astronomska formula, tačna do otprilike jedne lučne minute.
