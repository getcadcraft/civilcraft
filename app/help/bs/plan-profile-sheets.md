---
title: Listovi plana i profila
summary: Iscrtajte trasu kao set listova plana i profila u jednom PDF-u, s linijama spoja među njima.
keywords: plan i profil, listovi, iscrtavanje, pdf, linija spoja, izrada planova, planovi puteva, iscrtavanje profila, vertikalno uvećanje, set listova
from: 34b4ec78
---

Listovi plana i profila su način na koji se obično crtaju planovi puteva: svaki list prikazuje jednu dionicu puta dvaput, plan gore i profil dolje, u istoj horizontalnoj razmjeri, tako da se stacionaža nalazi na istom mjestu u oba.

## Izrada listova

1. Odaberite osovinu trase. U **Svojstva** kliknite {{ui:Plan and profile sheets}}.
2. Odaberite **Papir**, **Razmjeru plana** i **Vertikalno uvećanje profila** (koliko puta je profil iscrtan viši nego što je dug; za početak 10×). Dijalog kaže koliko listova to pravi i koliki dio trase svaki prikazuje.
3. Za iscrtavanje dijela trase promijenite **Od stacionaže** i **Do stacionaže**.
4. Kliknite {{ui:Download PDF}}. PDF ima jednu stranicu po listu.

## Šta je na listu

| Dio | Šta prikazuje |
|---|---|
| Plan | Sve na planu (izohipse, geodetske tačke, osovina trase i njeno stacioniranje, koridori, platoi, karakteristične linije, cijevi, linije uzoraka) okrenuto tako da ova dionica ide preko lista, sa strelicom sjevera okrenutom u skladu |
| Linije spoja | Linija crta-tačka okomita na trasu na svakom kraju koji se nastavlja na drugom listu, označena "Linija spoja st 5+50.00, vidi list 2" |
| Profil | Postojeći teren (isprekidano), projektovani profil (crveno), nagib svake tangente i PVI, kota, L i K svake vertikalne krivine; stacionaže uz dno, kote s obje strane |
| Naslovna traka | Naziv projekta, trasa i njen raspon stacionaža, "List 1 od 3", horizontalna i vertikalna razmjera te uvećanje |

Dionica po listu duga je koliko prozor plana dozvoljava pri razmjeri, zaokružena naniže na cijelih 50 ft (20 m) kod dugih dionica ili na cijelih 10 ft (5 m) kod kratkih.

:::note
Kad se kote profila ne bi uklopile pri odabranom uvećanju, CivilCraft iscrta svaki list pri najvećem od 10×, 5×, 4×, 2× i 1× koje stane, a statusna traka to kaže. Zakrivljena trasa se okreće prema pravcu od početka do kraja svake dionice, pa put na listu može blago ići gore ili dolje.
:::
