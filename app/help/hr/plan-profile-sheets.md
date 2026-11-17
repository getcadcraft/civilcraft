---
title: Listovi tlocrta i uzdužnog profila
summary: Ispis osi trase kao skupa listova tlocrta i uzdužnog profila u jednom PDF-u, s linijama spoja među njima.
keywords: tlocrt i uzdužni profil, listovi, ispis, pdf, linija spoja, izrada tlocrta, cestovni tlocrti, ispis profila, vertikalno uvećanje, skup listova
from: 34b4ec78
---

Listovi tlocrta i uzdužnog profila način je na koji se obično crtaju cestovni projekti: svaki list prikazuje jednu dionicu ceste dvaput, tlocrt gore i profil dolje, pri istom horizontalnom mjerilu, pa se stacionaža nalazi na istom mjestu u oba prikaza.

## Izrada listova

1. Odaberite os trase. U **Svojstvima** kliknite {{ui:Listovi tlocrta i uzdužnog profila}}.
2. Odaberite **Papir**, **Mjerilo tlocrta** i **Uvećanje profila** (koliko je puta profil crtan viši nego dulji; početno 10×). Dijaloški okvir navodi koliko listova to čini i koliki dio osi trase prikazuje svaki od njih.
3. Za ispis dijela osi trase promijenite **Od stacionaže** i **Do stacionaže**.
4. Kliknite {{ui:Preuzmi PDF}}. PDF ima jednu stranicu po listu.

## Što je na listu

| Dio | Što prikazuje |
|---|---|
| Tlocrt | Sve na tlocrtu (izohipse, geodetske točke, os trase i njezina stacionaža, koridori, platoi, značajne linije, cijevi, linije uzorkovanja) zakrenuto tako da ova dionica ide preko lista, sa strelicom sjevera zakrenutom u skladu s tim |
| Linije spoja | Crtkasto-točkasta linija okomita na os trase na svakom kraju koji se nastavlja na drugom listu, s oznakom „Linija spoja sta 5+50.00, vidi list 2“ |
| Profil | Postojeći teren (crtkano), projektirani profil (crveno), nagib svakog pravca i PVI, kota, L i K svake vertikalne krivulje; stacionaže uz donji rub, kote s obje strane |
| Zaglavlje | Naziv projekta, os trase i njezin raspon stacionaža, „List 1 od 3“, horizontalno i vertikalno mjerilo te uvećanje |

Dionica po listu duga je koliko prozor tlocrta dopušta pri mjerilu, zaokružena naniže na cijelih 50 ft (20 m) kod dugih dionica ili na cijelih 10 ft (5 m) kod kratkih.

:::note
Ako se kote profila ne bi uklopile pri odabranom uvećanju, CivilCraft crta svaki list pri najvećem od 10×, 5×, 4×, 2× i 1× koje stane, a statusna traka to navodi. Zakrivljena os trase okreće se prema smjeru od početka do kraja svake dionice, pa cesta na listu može blago rasti ili padati.
:::
