---
title: Izračunajte sate sunca na lokaciji
summary: Odaberite dan (ili godišnje doba) i vremensku zonu te pogledajte sate izravnog sunca na svakom zidu svake mase zgrade i na tlu oko njih, s tlom nacrtanim na tlocrtu i brojkama kao CSV.
keywords: sunce, sati sunca, sjena, zasjena, pristup suncu, sati dnevnog svjetla, pročelje, zid, godišnje doba, solsticij, ekvinocij, vremenska zona, ljetno računanje vremena, geografska širina, geografska dužina, CSV, raster
from: 4e32a314
---

**Sati sunca** broje sate izravnog sunca koji dopiru do svakog zida svake mase zgrade i do tla oko njih, za dan koji odaberete ili kao prosjek po godišnjem dobu. Mase i samo tlo bacaju sjenu; ništa drugo ne baca (nema drveća, ni susjednih objekata koje niste nacrtali). Svjetlo neba koje nije izravno sunce se ne broji.

## Prije početka

Položaj sunca dolazi iz geografske širine i dužine lokacije, koje dolaze iz **koordinatnog sustava** projekta. Projekt bez njega odbija se porukom: prvo ga postavite (**Koordinate** u grupi GIS). Geografska širina i dužina upisane ručno bile bi procjena, zato za njih nema polja.

## Izračun

U **Svojstvima**, pod **Mase zgrada**, **Sati sunca**:

1. Odaberite **Dan**. Počinje s danom kada je sunce najniže na vašem mjestu (21. prosinca, odnosno 21. lipnja na južnoj polutci). Za godišnje doba označite **Tijekom godišnjeg doba**, odaberite **Zadnji dan** i koliko dana razmaka uzeti za uzorkovanje.
2. Upišite **Vremensku zonu**: naziv poput `America/Mexico_City` ili odmak od UTC-a poput `-6`. Naziv slijedi pravila ljetnog računanja vremena te zone za taj dan; odmak koji upišete koristi se točno kako ste upisali, zato upotrijebite onaj koji vrijedi tog dana. Redak ispod polja pokazuje koji je odmak pronađen.
3. Odaberite koliko često se postavlja sunce (svakih 5, 10, 15 ili 30 minuta), zatim **Izračunaj sate sunca**. Godišnje doba izvodi se u pozadinskim radnicima; **Zaustavi** ga poništava.

## Što dobivate

- Tablica po masi: **najgori zid**, **prosjek** i **najbolji zid**, u satima dnevno, te tablica svakog zida s njegovom orijentacijom i satima po etažama.
- Tlo oko masa, nacrtano na tlocrtu od tamne (bez sunca) do žute (najviše što koja ćelija dobije), s legendom. Ćelije ispod mase ostaju prazne. **Prikaži tlo na tlocrtu** ga isključuje.
- **Zidovi kao CSV** i **Tlo kao CSV** spremaju brojeve.

Za godišnje doba brojke su prosjek po danu za uzorkovane dane. Ništa se ne sprema u projekt: rezultat je za pregled, a ponovnim pokretanjem ponovno se stvara.

## Dobro je znati

- Zid trenutak računa kao sunčan samo kada je okrenut prema suncu i ništa mu ne smeta. Zid okrenut od sunca ne dobiva ništa.
- Tlo se uzorkuje na mreži koja ovisi o veličini lokacije, a položaj sunca na sredini svakog vremenskog koraka, pa su sati točni do otprilike koraka koji ste odabrali.
- Položaj sunca je objavljena astronomska formula, točna do otprilike jedne lučne minute.
