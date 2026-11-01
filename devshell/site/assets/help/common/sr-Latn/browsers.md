---
title: Pregledači i računari
summary: U kojim pregledačima aplikacije rade, šta se razlikuje među njima i šta je potrebno vašem računaru.
keywords: chrome, edge, firefox, safari, brave, pregledač, mac, windows, linux, ipad, tablet, webgl, zahtevi, memorija
from: a11b09b1
---

Aplikacije rade u veb pregledaču. Posao obavljaju na vašem računaru: vaše datoteke se tamo otvaraju i nikad se ne šalju nama (vidi [Gde idu vaše datoteke](common:your-files)).

## Koji pregledač

Koristite ažurnu verziju jednog od ovih:

| Pregledač | Mašina | Napomene |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Najpotpuniji: biranje fascikli, čuvanje za rad van mreže, rukovanje datotekama. |
| Firefox | Gecko | Radi. Za otvaranje cele fascikle koristi se jednostavniji birač. Čuvanje za rad van mreže možda neće raditi u privatnim prozorima. |
| Safari | WebKit | Radi na Mac-u i iPad-u. Za otvaranje cele fascikle koristi se jednostavniji birač. Safari može da obriše kopiju za rad van mreže koju nekoliko nedelja niste koristili. |

Sva tri motora su dobra za svakodnevni rad. Kad aplikacija nešto radi drugačije u jednom od njih, njena pomoć prikazuje korake za vaš pregledač.

## Šta se razlikuje među pregledačima

- **Otvaranje fascikle.** Chromium pregledači prikazuju pravi izbor fascikle i mogu da čitaju fasciklu direktno. Firefox i Safari traže da izaberete fasciklu, pa čitaju svaku datoteku u njoj, što traje duže za velike fascikle projekta; prevlačenje fascikle na aplikaciju radi u sva tri.
- **Čuvanje.** Aplikacije čuvaju preuzimanjem datoteke. Vaš pregledač odlučuje gde idu preuzimanja i da li prvo pita.

:::chromium
U pregledaču Chrome ili Edge uključite „Pitaj gde da sačuvam svaku datoteku pre preuzimanja“ (u Podešavanjima, pod Preuzimanja), da biste birali fasciklu svaki put.
:::

:::firefox
U pregledaču Firefox otvorite Podešavanja, pa Opšte, pa Preuzimanja, i izaberite „Uvek pitaj gde da sačuvam datoteke“ da biste birali fasciklu svaki put.
:::

:::safari
U pregledaču Safari otvorite Podešavanja, pa Opšte, i postavite „Lokacija za preuzimanje datoteka“ na „Pitaj za svako preuzimanje“ da biste birali fasciklu svaki put.
:::

## Mac, Windows i Linux

Aplikacije su iste na svakom računaru. Menja se tastatura: prečice su automatski napisane za vaš računar. Vidi [Tastatura, miševi i trekpadovi](common:keys).

## Tableti i ekrani osetljivi na dodir

Neke aplikacije prihvataju dodir (jedan prst crta ili bira, a dva prsta sklapaju ili šire za zumiranje i pomeraju prikaz). Pomoć svake aplikacije kaže da li to radi. Na iPad-u koristite Safari ili Chrome. Tastatura pomaže kod aplikacija koje koriste ukucane komande.

## Najstariji pregledač i sistem

Ove verzije čitamo iz koda aplikacija verzije 0.7, a ne iz pretpostavke: svaka datoteka je raščlanjena, a svaka jezička funkcija koju koristi proverena je u objavljenim podacima o kompatibilnosti pregledača. Ispod ovih verzija aplikacije ne mogu ni da se pokrenu, jer pregledač ne razume kod.

| | Najstarija verzija koja može da pokrene aplikacije |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS i iOS 16.4) |

CadCraft Studio ima sopstveni veb motor na Windows-u, pa mu treba Windows 10 ili 11; na Mac-u koristi sistemski, pa mu treba macOS 13.3 ili noviji. U CadCraft Studio, Podešavanja › Ažuriranja pokazuju na čemu vaša kopija radi.

Ovo je najstarija verzija koja *počinje* da radi, pročitana iz koda. Nije spisak starih pregledača u kojima smo pokretali aplikacije, pa stariji koji se pokrene može i dalje da nema neku funkciju.

## Šta je potrebno vašem računaru

Ovo su planirani minimumi za aplikacije, a ne izmereni zahtevi:

- 8 GB memorije (preporučeno je 16 GB za velike spojene modele).
- Grafički čip sa WebGL 2 za 3D aplikacije. Ako 3D prikaz ostane prazan, proverite da li je hardversko ubrzanje uključeno u podešavanjima pregledača.
- Ekran širok bar 1280 piksela za pune trake sa alatima; manji ekrani ih prelamaju.

Vrlo velike datoteke (veliki setovi planova, veliki modeli) troše mnogo memorije u kartici pregledača. Zatvorite druge teške kartice ako se aplikacija uspori.
