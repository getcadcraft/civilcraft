---
title: Izračunaj sunčane sate na lokaciji
summary: Izaberi dan (ili godišnje doba) i vremensku zonu i vidi sate direktnog sunca na svakom zidu svake mase i na terenu oko njih, sa terenom nacrtanim na planu i brojevima kao CSV.
keywords: sunce, sunčani sati, senka, osunčanost, solarni pristup, dnevni sati, fasada, zid, godišnje doba, solsticij, ekvinocij, vremenska zona, letnje računanje vremena, geografska širina, geografska dužina, CSV, raster
from: 4e32a314
---

**Sunčani sati** broje sate direktnog sunca koji dopiru do svakog zida svake zgrade i do terena oko njih, za dan koji izaberete ili usrednjeno za godišnje doba. Mase i sam teren bacaju senku; ništa drugo ne baca (nema drveća, ni suseda koje niste nacrtali). Svetlost neba koja nije direktno sunce se ne računa.

## Pre početka

Položaj Sunca dolazi iz geografske širine i dužine lokacije, a one dolaze iz **koordinatnog sistema** projekta. Projekat bez njega se odbija uz poruku: prvo ga podesite (**Koordinate** u grupi GIS). Geografska širina i dužina upisane ručno bile bi pretpostavka, zato za njih nema polja.

## Izračunaj

U **Svojstvima**, pod **Mase zgrada**, **Sunčani sati**:

1. Izaberite **Dan**. Počinje od dana kada je Sunce najniže na vašoj lokaciji (21. decembar, ili 21. jun na južnoj hemisferi). Za godišnje doba štiklirajte **Tokom godišnjeg doba**, izaberite **Poslednji dan** i koliko dana razmaka uzorkovati.
2. Upišite **Vremensku zonu**: naziv kao `America/Mexico_City`, ili pomak od UTC kao `-6`. Naziv prati pravila letnjeg računanja vremena te zone za dan; pomak koji upišete koristi se tačno kako je upisan, pa upotrebite onaj koji važi tog dana. Red ispod polja kaže koji pomak je pronađen.
3. Izaberite koliko često se postavlja Sunce (na svakih 5, 10, 15 ili 30 minuta), pa **Izračunaj sunčane sate**. Godišnje doba se izvodi u pozadinskim procesima; **Zaustavi** ga poništava.

## Šta dobijate

- Tabelu po masi: **najmanje osunčan zid**, **prosek** i **najviše osunčan zid**, u satima dnevno, i tabelu svakog zida sa njegovom orijentacijom i satima sprat po sprat.
- Teren oko masa, nacrtan na planu od tamnog (bez sunca) do žutog (najviše koliko koja ćelija dobija), sa legendom. Ćelije ispod mase ostaju prazne. **Prikaži teren na planu** ga isključuje.
- **Zidovi kao CSV** i **Teren kao CSV** čuvaju brojeve.

Za godišnje doba brojke su prosek po danu preko uzorkovanih dana. Ništa se ne čuva u projektu: rezultat je za gledanje, a ponovno pokretanje ga ponovo pravi.

## Dobro je znati

- Zid računa trenutak kao sunčan samo kada gleda ka suncu i kada mu ništa ne smeta. Zid okrenut od sunca ne dobija ništa.
- Teren se uzorkuje na mreži koja zavisi od veličine lokacije, a položaj Sunca se računa u sredini svakog koraka vremena, pa su sati tačni do koraka koji ste izabrali.
- Položaj Sunca je objavljena astronomska formula, tačna do oko jednog lučnog minuta.
