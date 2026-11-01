---
title: Preglednici i računala
summary: U kojim se preglednicima aplikacije pokreću, po čemu se razlikuju i što vaše računalo treba.
keywords: chrome, edge, firefox, safari, brave, preglednik, mac, windows, linux, ipad, tablet, webgl, zahtjevi, memorija
from: a11b09b1
---

Aplikacije se pokreću u web-pregledniku. Posao obavljaju na vašem računalu: vaše se datoteke ondje otvaraju i nikad se ne šalju nama (vidi [Kamo idu vaše datoteke](common:your-files)).

## Koji preglednik

Koristite ažurnu verziju nekog od ovih:

| Preglednik | Pogon | Napomene |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Najpotpuniji: odabir mape, spremanje za korištenje offline, rukovanje datotekama. |
| Firefox | Gecko | Radi. Otvaranje cijele mape koristi jednostavniji birač. Spremanje za offline možda ne radi u privatnim prozorima. |
| Safari | WebKit | Radi na Macu i iPadu. Otvaranje cijele mape koristi jednostavniji birač. Safari može izbrisati offline kopiju koju nekoliko tjedana niste koristili. |

Sva tri pogona dobro služe za svakodnevni rad. Gdje aplikacija nešto radi drukčije u jednom od njih, njezina pomoć prikazuje korake za vaš preglednik.

## Po čemu se preglednici razlikuju

- **Otvaranje mape.** Chromium preglednici prikazuju pravi birač mapa i mogu izravno čitati mapu. Firefox i Safari traže da odaberete mapu, a zatim čitaju svaku datoteku u njoj, što traje dulje za velike projektne mape; povlačenje mape na aplikaciju radi u sva tri.
- **Spremanje.** Aplikacije spremaju preuzimanjem datoteke. Vaš preglednik odlučuje kamo idu preuzimanja i pita li prethodno.

:::chromium
U Chromeu ili Edgeu uključite „Pitaj gdje spremiti svaku datoteku prije preuzimanja“ (u Postavkama, pod Preuzimanja) da svaki put odaberete mapu.
:::

:::firefox
U Firefoxu otvorite Postavke, zatim Općenito, zatim Preuzimanja i odaberite „Uvijek pitaj gdje spremiti datoteke“ da svaki put odaberete mapu.
:::

:::safari
U Safariju otvorite Postavke, zatim Općenito i postavite „Lokacija preuzetih datoteka“ na „Pitaj za svako preuzimanje“ da svaki put odaberete mapu.
:::

## Mac, Windows i Linux

Aplikacije su iste na svakom računalu. Mijenja se tipkovnica: prečaci se automatski pišu za vaše računalo. Vidi [Tipke, miševi i trackpadovi](common:keys).

## Tableti i zasloni osjetljivi na dodir

Neke aplikacije prihvaćaju dodir (jedan prst crta ili odabire, dva prsta štipanjem zumiraju i pomiču prikaz). Pomoć svake aplikacije kaže radi li to. Na iPadu koristite Safari ili Chrome. Tipkovnica pomaže kod aplikacija koje koriste upisane naredbe.

## Najstariji preglednik i sustav

Ovo smo pročitali iz koda aplikacija 0.7, ne pogodili: svaka je datoteka raščlanjena, a svaka jezična značajka koju koristi potražena je u objavljenim podacima o kompatibilnosti preglednika. Ispod ovih verzija aplikacije se ne mogu ni pokrenuti jer preglednik ne razumije kod.

| | Najstarija verzija koja može pokrenuti aplikacije |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS i iOS 16.4) |

CadCraft Studio na Windowsima nosi vlastiti web-pogon, pa treba Windows 10 ili 11; na Macu koristi sistemski, pa treba macOS 13.3 ili noviji. Postavke › Ažuriranja u Studiju pokazuju na čemu radi vaša kopija.

Ovo je najstarija verzija koja *se pokreće*, pročitana iz koda. Nije popis starih preglednika u kojima smo pokretali aplikacije, pa starijem koji se pokrene i dalje može nedostajati neka značajka.

## Što vaše računalo treba

Ovo su planirani minimumi za aplikacije, a ne izmjereni zahtjevi:

- 8 GB memorije (16 GB preporučuje se za velike federirane modele).
- Grafički čip s WebGL 2 za 3D aplikacije. Ako 3D prikaz ostane prazan, provjerite je li hardversko ubrzanje uključeno u postavkama preglednika.
- Zaslon širok najmanje 1280 piksela za pune alatne trake; manji zasloni prelamaju ih u više redaka.

Vrlo velike datoteke (veliki skupovi planova, veliki modeli) troše mnogo memorije u kartici preglednika. Zatvorite druge teške kartice ako se aplikacija uspori.
