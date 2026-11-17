---
title: Ograde
summary: Ograda uz liniju, česticu ili podlogu: stupovi, rubni dijelovi, paneli ili letvice, vrata, postavljeni u nagibu ili stepenasto po terenu, popis, simboli u tlocrtu i IFC elementi. Dostupno i pomoćniku.
keywords: ograda, stupovi, rubni dijelovi, paneli, letvice, vrata, nagnuto, stepenasto, teren, popis, ifc, ograda, granica
from: c0e7b84a
---

Izradite ogradu uz značajnu liniju, trasu, česticu ili podlogu, a njezini stupovi i vrata bit će postavljeni umjesto vas.

## Izrada ograde

1. Odaberite liniju, česticu ili podlogu.
2. Otvorite **Teren, Više, Ograde...**
3. Odaberite stil (paneli, rubni dijelovi ili letvice), nagnuto ili stepenasto, visinu, razmak stupova i širinu vrata, zatim **Ograda uz odabir** ili **S vratima** za postavljanje vrata na sredini najduže ravne dionice.

Stupovi se postavljaju na krajevima, na svakom kutu (vrh koji skreće za 20 stupnjeva ili više), na obje strane svakih vrata i u jednakim poljima između njih, pri čemu nijedno polje nije duže od razmaka. **Nagnuti** paneli prate teren između svojih stupova. **Stepenasti** paneli ostaju vodoravni i stepenaju se na stupovima; razmak ispod panela najveći je uz njegov stup nizbrdo, a prozor upozorava kada je taj razmak veći od dopuštenog ili kada teren prolazi kroz panel. Vrata od 6 feet (1.8 m) i šira imaju dva krila; tlocrt prikazuje krila otvorena s njihovim smjerom otvaranja.

## Popis i izlazi

Svaka ograda prikazuje svoju duljinu, stupove po vrsti, panele, vrata i stepenice, uz **CSV** popis stupova, panela, rubnih dijelova, letvica i vrata. Tlocrt ima slojeve ograde (C-FENC, C-FENC-POST, C-FENC-GATE) za PDF, DXF i DWG. IFC izvoz sadrži stupove (IfcMember, post), panele (IfcRailing, user defined fence panel), rubne dijelove (IfcMember) i vrata (IfcDoor, gate), jedan sustav po ogradi.

## Od pomoćnika

`fence_build` izrađuje ogradu (točke ili imenovana linija, čestica ili podloga, vrata po stacionaži), a `fence_list` navodi ograde s njihovim popisom.

## Što nije izrađeno

Početne veličine su uobičajeni izbori, a ne propis. Tipovi iz knjižnice prenose se samo kao naziv. Vrata moraju ležati u jednoj ravnoj dionici. BimCraft još nema ovaj alat.
