---
title: Listovi plana i profila
summary: Iscrtavanje trase kao skupa listova plana i profila u jednom PDF-u, sa linijama spajanja između njih.
keywords: plan i profil, listovi, iscrtavanje, pdf, linija spajanja, izrada planova, planovi puteva, iscrtavanje profila, vertikalno uvećanje, skup listova
from: 34b4ec78
---

Listovi plana i profila su način na koji se obično crtaju planovi puteva: svaki list prikazuje jednu deonicu puta dvaput, plan gore i profil dole, u istoj vodoravnoj razmeri, tako da se stacionaža nalazi na istom mestu u oba.

## Izrada listova

1. Izaberite osovinu trase. U **Svojstva** kliknite {{ui:Listovi plana i profila}}.
2. Izaberite **Papir**, **Razmeru plana** i **Uvećanje profila** (koliko puta je profil viši nego što je dugačak; za početak 10×). Dijalog kaže koliko listova to pravi i koliki deo trase prikazuje svaki.
3. Da iscrtate deo trase, promenite **Od stacionaže** i **Do stacionaže**.
4. Kliknite {{ui:Preuzmi PDF}}. PDF ima jednu stranu po listu.

## Šta je na listu

| Deo | Šta prikazuje |
|---|---|
| Plan | Sve na planu (izohipse, geodetske tačke, trasu i njenu stacionažu, koridore, platoe, karakteristične linije, cevi, linije uzoraka), okrenuto tako da ova deonica ide preko lista, sa strelicom severa okrenutom u skladu |
| Linije spajanja | Crta-tačka linija normalna na trasu na svakom kraju koji se nastavlja na drugom listu, sa oznakom "Linija spajanja sta 5+50.00, pogledajte list 2" |
| Profil | Postojeći teren (isprekidano), projektovani profil (crveno), nagib svake tangente i svake vertikalne krivine sa PVI, kotom, L i K; stacionaže duž dna, kote s obe strane |
| Naslovna traka | Naziv projekta, trasa i njen opseg stacionaže, "List 1 od 3", vodoravne i vertikalne razmere i uvećanje |

Deonica po listu je onoliko duga koliko prozor plana dopušta pri razmeri, zaokružena naniže na celih 50 ft (20 m) na dugim deonicama ili na celih 10 ft (5 m) na kratkim.

:::note
Kada se kote profila ne bi uklopile pri izabranom uvećanju, CivilCraft crta svaki list sa najvećim od 10×, 5×, 4×, 2× i 1× koje staje, a statusna traka to kaže. Krivudava trasa se okreće po pravcu od početka do kraja svake deonice, pa put na listu može blago da ide gore ili dole.
:::
