---
title: Proračun sanitarnih proticaja i provjera kanalizacije
summary: Unesite stanovnike i površinu koji ulaze u svaki šaht sanitarne mreže; CivilCraft ih zbraja niz mrežu, računa vršni protok s faktorom vršnosti i infiltracijom, te provjerava kapacitet i brzinu svake cijevi.
keywords: sanitarna, kanalizacija, sanitarna kanalizacija, otpadne vode, proračunski protok, vršni protok, faktor vršnosti, harmon, babbitt, infiltracija, stanovništvo, po stanovniku, procenat punjenja, samočistivost, brzina, dimenzionisanje cijevi, projektni list
from: 73ba197a
---

Sanitarni proticaji projektovanja rade na [mreži cijevi](topic:pipe-network) kada je njen {{ui:Tip}} {{ui:Sanitarna}}. Kada ništa nije odabrano, desni panel tada prikazuje **Sanitarni proticaji projektovanja** tamo gdje olujna mreža prikazuje odvodnju oborinskih voda.

## Unesite šta ulazi

1. Odaberi šaht. Pod **Sanitarni proticaji projektovanja**, upiši {{ui:Stanovnici koji ulaze ovdje}} i {{ui:Površina koja ulazi ovdje}} (hektara u projektu u metrima, akara u projektu u stopama).
2. Za radnje, kancelarije ili industriju, upiši ekvivalentne stanovnike: površina puta broj stanovnika po hektaru (ili aker) koji koristi vaša agencija. Površina se u oba slučaja računa za infiltraciju.
3. Ponovi za svaki šaht na koji se priključuje ulica ili parcela. Šaht na koji se ništa ne priključuje zadržava oba na 0.

Svaka cijev nosi sve što ulazi u njen gornji šaht i iznad njega. Odaberi šaht da vidiš šta kroz njega prolazi.

## Postavke

| Postavka | Šta znači |
|---|---|
| {{ui:Protok po osobi}} | prosječni dnevni protok jedne osobe: litara (projekat u metrima) ili američkih galona (projekat u stopama) |
| {{ui:Infiltracija}} | podzemna voda koja curi unutra: litara u sekundi po hektaru, ili galona dnevno po akru |
| {{ui:Faktor vršnosti}} | Harmon, 1 + 14 / (4 + √P), ili Babbitt, 5 / P^0,2, gdje je P stanovništvo u hiljadama |
| {{ui:Faktor vršnosti najmanje}} / {{ui:Najveći faktor vrha}} | faktor se drži između ove dvije vrijednosti |
| {{ui:Manningov koeficijent n}} | za kapacitet i brzinu |
| {{ui:Najmanja brzina}} / {{ui:Najveća brzina}} | pri sopstvenoj dubini vršnog protoka u cijevi |
| {{ui:Najveći dio punog kapaciteta}} | koliko puna cijev smije raditi pri vrhu, kao procenat onoga što prenosi kada je potpuno puna |

Početne vrijednosti su privremene, a ne standard. Koristite vrijednosti koje vaša agencija objavljuje.

## Šta računa

Za svaku cijev, redom po toku:

- vršni protok = stanovnici × protok po osobi × faktor vršnosti + površina × infiltracija
- kapacitet pri punom tečenju (Manningova jednačina pri nagibu cijevi) i koliko je puna pri vrhu
- normalna dubina vršnog protoka i brzina tamo

Tabela **Sanitarni rezultati** navodi stanovnike svake cijevi, faktor vršnosti, vršni protok (L/s, ili gpm i kubne stope u sekundi), procenat punjenja i brzinu. Problemi su navedeni ispod nje: cijev punija od granice, sporija od najmanje brzine (možda se neće sama očistiti), brža od najveće ili bez pada. {{ui:Dimenzioniši cijevi za ove protoke}} bira za svaku cijev najmanju standardnu veličinu (200 mm ili 8 inča i više) koja prenosi njen vrh unutar granice; jedno {{key:Mod+Z}} to poništava.

:::note
Ovo je ustaljeni vršni protok koji računa projektni list, provjeren prema objavljenom projektnom listu do njegovog štampanog zaokruživanja. Nije model kanalizacije kroz vrijeme: nema hidrograma, skladištenja, pumpi ni prelivanja. Vidi [Još nije izgrađeno](topic:not-built-yet).
:::

Brzine koriste Manningovu jednačinu s istim n na svakoj dubini. Neke agencije u tabelama za djelimično punu cijev dozvoljavaju da se n mijenja s dubinom, što daje nešto nižu brzinu u cijevi koja radi 60 do 70 procenata punjenja (oko 3 procenta manje).
