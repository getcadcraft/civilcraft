---
title: Upraviť zameraný bod
summary: Zmeňte číslo, súradnice, výšku alebo popis jedného bodu, alebo ho potiahnite na nové miesto v pôdoryse.
keywords: upraviť bod, presunúť bod, zmeniť výšku, prečíslovať, číslo bodu, popis, potiahnutie, Y, X, opraviť bod, chybný záber
from: 375ae2e9
---

Chybný záber, zlá výška latty, popis napísaný nesprávne: opravte jeden bod a povrch sa prispôsobí.

## Zmena hodnôt bodu

1. Nástrojom {{ui:Výber}} kliknite na bod v pôdoryse. **Vlastnosti** zobrazia jeho číslo, X, Y, **Výšku** a popis v poliach.
2. Zadajte novú hodnotu a stlačte {{key:Enter}} (alebo kliknite mimo). Pre bod bez výšky nechajte pole **Výška** prázdne.
3. Povrch, vrstevnice a všetko, čo na nich stojí, sa aktualizujú naraz.

Každá zmena je jeden krok: {{key:Mod+Z}} ju vráti späť a {{key:Mod+Y}} ju znova vykoná. Hodnota, ktorú CivilCraft nevie použiť (číslo, ktoré už má iný bod, písmená v súradnici), sa odmietne: pole sa ohraničí a stavový riadok uvedie dôvod.

Nový kód popisu vytvorí novú skupinu bodov, ako to robí import (pozri [Vytvoriť povrch](topic:build-surface)).

## Presun bodu v pôdoryse

1. Vyberte bod (dostane kruh).
2. Potiahnite kruh. Stavový riadok ukazuje X a Y, kam sa bod presunie.
3. Pustením sa bod presunie a jeho výška ostane. Pred pustením stlačte {{key:Esc}}, aby sa vrátil späť.

## Hrany zlomu nasledujú bod

Hrana zlomu nakreslená nástrojom {{ui:Hrana zlomu}} kopíruje body, ktorými prechádza. Keď sa bod presunie alebo sa zmení jeho výška, rohy hrany zlomu na ňom sa pohnú spolu s ním, v tom istom kroku. Skupiny hrán zlomu vytvorené z popisov sa vždy znova vytvoria z bodov.

:::note
Povrch načítaný zo súboru LandXML si ponechá svoje trojuholníky: úpravy bodov ho zmenia až po {{ui:Znova vytvoriť povrch z bodov}}.
:::
