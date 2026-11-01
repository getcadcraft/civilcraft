---
title: Pregledači i računari
summary: U kojim pregledačima aplikacije rade, šta se razlikuje među njima i šta tvoj računar treba.
keywords: chrome, edge, firefox, safari, brave, pregledač, mac, windows, linux, ipad, tablet, webgl, zahtjevi, memorija
from: a11b09b1
---

Aplikacije rade unutar web pregledača. Posao obavljaju na tvom vlastitom računaru: tvoje datoteke se tamo otvaraju i nikad se ne šalju nama (vidi [Gdje idu tvoje datoteke](common:your-files)).

## Koji pregledač

Koristi ažurnu verziju jednog od ovih:

| Pregledač | Motor | Napomene |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Najpotpuniji: biranje foldera, spašavanje za rad van mreže, rukovanje datotekama. |
| Firefox | Gecko | Radi. Otvaranje cijelog foldera koristi jednostavniji birač. Spašavanje za rad van mreže možda neće raditi u privatnim prozorima. |
| Safari | WebKit | Radi na Macu i iPadu. Otvaranje cijelog foldera koristi jednostavniji birač. Safari može obrisati kopiju za rad van mreže koju nisi koristio nekoliko sedmica. |

Sva tri motora su dobra za svakodnevni rad. Gdje aplikacija nešto radi drugačije u nekom od njih, njena pomoć pokazuje korake za tvoj pregledač.

## Šta se razlikuje među pregledačima

- **Otvaranje foldera.** Pregledači na Chromiumu prikazuju pravi birač foldera i mogu direktno čitati folder. Firefox i Safari traže da izabereš folder, pa čitaju svaku datoteku u njemu, što traje duže za velike projektne foldere; prevlačenje foldera u aplikaciju radi u sva tri.
- **Spašavanje.** Aplikacije spašavaju preuzimanjem datoteke. Tvoj pregledač odlučuje gdje idu preuzimanja i da li prvo pita.

:::chromium
U Chromeu ili Edgeu uključi „Pitaj gdje da spasim svaku datoteku prije preuzimanja“ (u Postavkama, pod Preuzimanja) da svaki put izabereš folder.
:::

:::firefox
U Firefoxu otvori Postavke, pa Opšte, pa Preuzimanja, i izaberi „Uvijek pitaj gdje da spasim datoteke“ da svaki put izabereš folder.
:::

:::safari
U Safariju otvori Postavke, pa Opšte, i postavi „Lokacija za preuzimanje datoteka“ na „Pitaj za svako preuzimanje“ da svaki put izabereš folder.
:::

## Mac, Windows i Linux

Aplikacije su iste na svakom računaru. Mijenja se tastatura: prečice su automatski napisane za tvoj računar. Vidi [Tipke, miševi i trackpadovi](common:keys).

## Tableti i ekrani osjetljivi na dodir

Neke aplikacije prihvataju dodir (jedan prst crta ili bira, dva prsta razmiču ili približavaju za zumiranje, a pomjeraju za pomjeranje pogleda). Pomoć svake aplikacije kaže da li to radi. Na iPadu koristi Safari ili Chrome. Tastatura pomaže kod aplikacija koje koriste ukucane komande.

## Najstariji pregledač i sistem

Ove verzije čitamo iz koda aplikacija verzije 0.7, a ne iz pretpostavke: svaka datoteka je raščlanjena, a svaka jezička mogućnost koju koristi provjerena je u objavljenim podacima o kompatibilnosti pregledača. Ispod ovih verzija aplikacije ne mogu ni da se pokrenu, jer pregledač ne razumije njihov kod.

| | Najstarija verzija koja može pokrenuti aplikacije |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS i iOS 16.4) |

CadCraft Studio na Windowsu ima svoj web motor, pa mu treba Windows 10 ili 11; na Macu koristi sistemski, pa mu treba macOS 13.3 ili noviji. Postavke › Ažuriranja u Studiju pokazuju na čemu tvoja kopija radi.

Ovo je najstarija verzija koja *počinje* raditi, pročitana iz koda. Nije spisak starih pregledača u kojima smo pokretali aplikacije, pa stariji koji se pokrene može i dalje propustiti neku mogućnost.

## Šta treba tvom računaru

Ovo su planirani minimumi za aplikacije, a ne izmjereni zahtjevi:

- 8 GB memorije (preporučeno je 16 GB za velike federirane modele).
- Grafički čip sa WebGL 2 za 3D aplikacije. Ako 3D prikaz ostane prazan, provjeri da je hardversko ubrzanje uključeno u postavkama pregledača.
- Ekran širine najmanje 1280 piksela za pune alatne trake; manji ekrani ih prelamaju.

Vrlo velike datoteke (veliki setovi planova, veliki modeli) troše puno memorije u kartici pregledača. Zatvori ostale teške kartice ako se aplikacija uspori.
