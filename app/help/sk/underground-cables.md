---
title: Podzemné káble
summary: Trasy káblov vo výkopoch medzi podperami a zariadeniami, krytie a križovania, spoje podľa dĺžky bubna a množstvá výkopov a káblov.
keywords: podzemný kábel, trasa kábla, výkop, chránička, krytie, križovanie, križovanie s potrubím, spoj, bubon, rozvádzač, transformátor, zdroj, úbytok napätia
from: adfd2717
---

## Nakreslite trasu kábla

1. Najskôr umiestnite zariadenie, ak kábel končí na rozvádzači, transformátore alebo spoji: {{ui:Zariadenie}}, potom kliknite.
2. Kliknite na {{ui:Kábel}} a kliknite na trasu; začiatok a koniec na podpere alebo na zariadení ju k nej pripoja. Enter dokončí.

V **Vlastnostiach** zvoľte **Kábel**, **Typ výkopu**, koľko **káblov vedľa seba** a **rezervu** (%). Trasa zobrazuje svoju dĺžku, kde začína a kde končí a aký prúd nesie.

## Čo sa kontroluje

- **Krytie**: vrchná hrana kábla pod terénom pozdĺž trasy voči krytiu typu výkopu (alebo najmenšiemu krytiu v súbore pravidiel).
- **Križovania**: kde trasa križuje potrubie CivilCraft alebo iný kábel, medzera medzi nimi voči pravidlu vôle: vlastná **Vôľa pri križovaní** trasy (vo vlastnostiach), keď ju vyberiete; inak pravidlo **Podzemné križovania** v súbore pravidiel (vzorové sady používajú *Podzemné križovanie*, 0.3 m); inak medzera k iným inžinierskym sieťam podľa typu výkopu. Pri križovaní dvoch káblov platí väčšia z ich dvoch hodnôt. Križovaná nadzemná linka sa uvádza len informatívne a kábel sa zobrazí v jej profile.
- **Spoje**: jeden na každú dĺžku bubna kábla (s rezervou), keď položka kábla udáva dĺžku bubna.

## Zariadenia

Zariadenie má položku knižnice, **záťaž** (kW) s jej **účinníkom** a môže byť **zdrojom**: sieť sa z neho napája. Napätie zdroja pochádza z jeho položky knižnice, alebo z vedenia či kábla, ktoré napája.

## Množstvá

{{ui:Viac}} › {{ui:Množstvá…}} spočíta kábel (dĺžka trasy × (1 + rezerva) × káble vedľa seba + prevýšenie na každom konci), výkop podľa typu, objemy výkopových prác, lôžka a zásypu, chráničky a spoje, s vodičmi, podperami a zariadeniami nadzemných vedení.
