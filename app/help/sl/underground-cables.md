---
title: Podzemni kabli
summary: Kabelske trase v jarkih med podporami in opremo, kritje in križanja, spoji po dolžini bobna ter količine jarkov in kablov.
keywords: podzemni kabel, kabelska trasa, jarek, cev za kable, kritje, križanje, križanje cevi, spoj, boben, omarica, transformator, vir, padec napetosti
from: adfd2717
---

## Narišite kabelsko trasu

1. Najprej postavite opremo, če se kabel konča pri omarici, transformatorju ali spoju: {{ui:Oprema}}, nato kliknite.
2. Kliknite {{ui:Kabel}} in kliknite trasu; začetek in konec na podpori ali na opremi ju povežeta z njo. {{key:Enter}} konča.

V Lastnostih izberite **Kabel**, **Vrsto jarka**, koliko **kablov drug ob drugem** in **rezervo** (%). Trasa prikaže svojo dolžino, kje se začne in konča ter tok, ki ga prenaša.

## Kaj se preverja

- **Kritje**: vrh kabla mora biti pod terenom vzdolž trase, glede na kritje vrste jarka (ali glede na najmanjše kritje iz nabora pravil).
- **Križanja**: kjer trasa seka cev CivilCraft ali drug kabel, se razmik med njima primerja z odmikom: lastni **Odmik pri križanju** trase (v njenih Lastnostih), če ga izberete, sicer pravilo **Podzemna križanja** iz nabora pravil (primeri nabora uporabljajo *Podzemno križanje*, 0.3 m), sicer razmik vrste jarka do drugih komunalnih vodov. Pri križanju dveh kablov se ohrani večji od obeh. Nadzemni vod, ki ga trasa seka, je naveden za informacijo, kabel pa se prikaže v profilu tega voda.
- **Spoji**: en na vsako dolžino bobna kabla (z rezervo), kadar postavka kabla daje dolžino bobna.

## Oprema

Oprema ima element knjižnice, **obremenitev** (kW) s svojim **faktorjem moči**, in je lahko **vir**: omrežje se napaja od tod. Napetost vira pride iz njegovega elementa knjižnice ali pa iz voda ali kabla, ki ga napaja.

## Količine

{{ui:Več}} › {{ui:Količine …}} šteje kabel (dolžina trase × (1 + rezerva) × kablov drug ob drugem + dvig na vsakem koncu), jarke po vrsti, količine izkopa, posteljice in zasipa, cevi za kable in spoje, pri nadzemnih vodovih pa prevodnik, podpore in opremo.
