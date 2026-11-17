---
title: Listy pôdorysu a pozdĺžneho profilu
summary: Vykreslite os trasy ako sadu listov pôdorysu a pozdĺžneho profilu v jednom PDF so spojovacími čiarami medzi nimi.
keywords: pôdorys a profil, listy, vykreslenie, pdf, spojovacia čiara, výroba plánov, cestné plány, vykreslenie profilu, zvislé zväčšenie, súbor listov
from: 34b4ec78
---

Listy pôdorysu a pozdĺžneho profilu sú bežný spôsob kreslenia cestných plánov: každý list zobrazuje jeden úsek cesty dvakrát, pôdorys hore a profil dole, v rovnakej vodorovnej mierke, takže staničenie je v oboch na rovnakom mieste.

## Vytvorenie listov

1. Vyberte os trasy. Vo **Vlastnostiach** kliknite na {{ui:Plan and profile sheets}}.
2. Zvoľte **Papier**, **Mierku pôdorysu** a **Zvislé zväčšenie profilu** (koľkokrát je profil vyššie vykreslený, než je dlhý; na začiatok 10×). Dialóg uvedie, koľko listov to vytvorí a akú časť osi každý z nich zobrazí.
3. Ak chcete vykresliť len časť osi, zmeňte **Od staničenia** a **Do staničenia**.
4. Kliknite na {{ui:Download PDF}}. PDF má jednu stranu na každý list.

## Čo je na liste

| Časť | Čo zobrazuje |
|---|---|
| Pôdorys | Všetko z pôdorysu (vrstevnice, body zamerania, os trasy a jej staničenie, koridory, plošiny, charakteristické čiary, potrubia, vzorkovacie čiary) otočené tak, aby tento úsek prechádzal cez list, so severkou otočenou podľa toho |
| Spojovacie čiary | Čerchovaná čiara kolmá na os na každom konci, ktorý pokračuje na inom liste, s popiskom "Spojovacia čiara sta 5+50.00, pozri list 2" |
| Profil | Jestvujúci terén (prerušovane), návrhový profil (červený), sklon každej priamky a PVI, výška, L a K každého zvislého oblúka; staničenia pozdĺž spodku, výšky na oboch stranách |
| Popisové pole | Názov projektu, os trasy a jej rozsah staničenia, "List 1 z 3", vodorovná a zvislá mierka a zväčšenie |

Úsek na list je taký dlhý, aký okno pôdorysu pri danej mierke dovolí, zaokrúhlený nadol na celých 50 ft (20 m) pri dlhých úsekoch alebo na celých 10 ft (5 m) pri krátkych.

:::note
Ak by výšky profilu nevošli pri zvolenom zväčšení, CivilCraft vykreslí každý list s najväčším z 10×, 5×, 4×, 2× a 1×, ktoré sa zmestí, a o tom informuje stavový riadok. Zakrivená os sa otáča podľa smeru od začiatku ku koncu každého úseku, takže cesta môže na liste mierne stúpať alebo klesať.
:::
