---
title: Ograde
summary: Ograda duž linije, parcele ili plata: stubovi, prečke, paneli ili letvice, kapije, kosa ili stepenasta na terenu, specifikacija, simboli na planu i IFC elementi. Takođe dostupno asistentu.
keywords: ograda, stubovi, prečke, paneli, letvice, kapija, kosa, stepenasta, teren, specifikacija, ifc, ogradna ograda, međa
from: c0e7b84a
---

Napravite ogradu duž linije objekta, osovine trase, parcele ili plata, sa stubovima i kapijama koji se postavljaju za vas.

## Napravi ogradu

1. Izaberite liniju, parcelu ili plato.
2. Otvorite **Površ, Više, Ograde...**
3. Izaberite stil (paneli, prečke ili letvice), kosu ili stepenastu izvedbu, visinu, razmak stubova i širinu kapije, zatim **Ograda duž izbora**, ili **Sa kapijom** da stavite kapiju u sredinu najdužeg pravog dela.

Stubovi se postavljaju na krajevima, na svakom uglu (teme koje skreće za 20 stepeni ili više), na obe ivice svake kapije i na jednakim poljima između, nijedno duže od razmaka. **Kosi** paneli prate teren između svojih stubova. **Stepenasti** paneli ostaju vodoravni i stepenuju se kod stubova; procep ispod panela je najširi kod njegovog stuba niz padinu, a prozor upozorava kada je taj procep preko granice ili kada teren uspinje kroz panel. Kapije širine 6 stopa (1.8 m) i šire imaju dva krila; plan prikazuje krila otvorena sa njihovim zamahom.

## Specifikacija i izlazi

Svaka ograda pokazuje svoju dužinu, stubove po vrsti, panele, kapije i stepenaste delove, uz **CSV** specifikaciju stubova, panela, prečki, letvica i kapija. Plan ima slojeve ograda (C-FENC, C-FENC-POST, C-FENC-GATE) za PDF, DXF i DWG. IFC izvoz sadrži stubove (IfcMember, post), panele (IfcRailing, user defined fence panel), prečke (IfcMember) i kapije (IfcDoor, gate), jedan sistem po ogradi.

## Od asistenta

`fence_build` pravi ogradu (tačke ili imenovanu liniju, parcelu ili plato, kapije po stacionaži), a `fence_list` navodi ograde sa njihovom specifikacijom.

## Šta nije urađeno

Početne dimenzije su uobičajeni izbori, a ne propis. Tipovi iz Biblioteke se čuvaju samo kao naziv. Kapije moraju da leže u jednom pravom delu. BimCraft još nema ovaj alat.
