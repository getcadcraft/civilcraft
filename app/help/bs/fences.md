---
title: Ograde
summary: Ograda duž linije, parcele ili platoa: stubovi, prečke, paneli ili letvice, kapije, nagnute ili stepenaste po terenu, specifikacija, simboli na planu i IFC elementi. Dostupno i asistentu.
keywords: ograda, stubovi, prečke, paneli, letvice, kapija, nagnuta, stepenasta, teren, specifikacija, ifc, ograda za zaštitu, granica
from: c0e7b84a
---

Napravi ogradu duž linije elementa, osi trase, parcele ili platoa, sa stubovima i kapijama postavljenim za tebe.

## Napravi ogradu

1. Odaberi liniju, parcelu ili plato.
2. Otvori **Površ, Više, Ograde...**
3. Odaberi stil (paneli, prečke ili letvice), nagnute ili stepenaste, visinu, razmak stubova i širinu kapije, zatim **Ograda duž odabira** ili **Sa kapijom** da stavi kapiju u sredinu najduže prave dionice.

Stubovi idu na krajeve, na svaki ugao (vrh koji skreće za 20 stepeni ili više), na obje ivice svake kapije i na jednake razmake između, nijedan duži od razmaka. **Nagnuti** paneli prate teren između svojih stubova. **Stepenasti** paneli ostaju vodoravni i stepenuju se na stubovima; razmak ispod panela je najširi kod stuba nizbrdo, a prozor upozorava kad je taj razmak veći od ograničenja ili kad teren ide kroz panel. Kapije od 6 feet (1.8 m) i šire imaju dva krila; plan prikazuje krila otvorena sa njihovim smjerom zamaha.

## Specifikacija i izlazi

Svaka ograda pokazuje svoju dužinu, stubove po vrsti, panele, kapije i stepenice, uz **CSV** specifikaciju stubova, panela, prečki, letvica i kapija. Plan ima slojeve ograde (C-FENC, C-FENC-POST, C-FENC-GATE) za PDF, DXF i DWG. IFC izvoz sadrži stubove (IfcMember, post), panele (IfcRailing, user defined fence panel), prečke (IfcMember) i kapije (IfcDoor, gate), jedan sistem po ogradi.

## Od asistenta

`fence_build` pravi ogradu (tačke ili imenovanu liniju, parcelu ili plato, kapije po stacionaži), a `fence_list` navodi ograde sa njihovom specifikacijom.

## Šta nije urađeno

Početne veličine su uobičajeni izbori, a ne propis. Tipovi iz Biblioteke se čuvaju samo kao naziv. Kapije moraju ležati u jednoj pravoj dionici. BimCraft još nema ovaj alat.
