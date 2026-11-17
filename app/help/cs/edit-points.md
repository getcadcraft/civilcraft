---
title: Úprava zaměřovacího bodu
summary: Změňte číslo, souřadnice, výšku nebo popis jednoho bodu, nebo jej přetáhněte na nové místo v půdorysu.
keywords: úprava bodu, přesun bodu, změna výšky, přečíslování, číslo bodu, popis, přetažení, Y, X, oprava bodu, chybné měření
from: 375ae2e9
---

Špatně změřený záběr, chybná výška lati, popis napsaný špatně: opravte jeden bod a povrch se podle něj aktualizuje.

## Změna hodnot bodu

1. Pomocí {{ui:Výběr}} klikněte na bod v půdorysu. **Vlastnosti** zobrazí jeho číslo, X, Y, výšku a popis v polích.
2. Napište novou hodnotu a stiskněte {{key:Enter}} (nebo klikněte mimo pole). Pro bod bez výšky nechte pole **Výška** prázdné.
3. Povrch, vrstevnice a vše na nich založené se aktualizují najednou.

Každá změna je jeden krok: {{key:Mod+Z}} ji vrátí zpět a {{key:Mod+Y}} ji provede znovu. Hodnota, kterou CivilCraft nemůže použít (číslo, které již jiný bod má, písmena v souřadnici), se odmítne: pole se označí obrysem a stavový řádek uvede důvod.

Nový kód popisu vytvoří novou skupinu bodů, stejně jako import (viz [Vytvoření povrchu](topic:build-surface)).

## Přesun bodu v půdorysu

1. Vyberte bod (dostane kroužek).
2. Přetáhněte kroužek. Stavový řádek ukazuje souřadnice X a Y, kam bod přijde.
3. Pusťte kroužek pro přesun; výška bodu zůstane. Před pustěním stiskněte {{key:Esc}}, bod se vrátí na původní místo.

## Lomová hrana sleduje bod

Lomová hrana nakreslená nástrojem {{ui:Lomová hrana}} kopíruje body, kterými prochází. Když přesunete bod nebo změníte jeho výšku, rohy lomové hrany na něm se pohnou spolu s ním, ve stejném kroku. Skupiny lomových hran vytvořené z popisů se vždy obnovují z bodů.

:::note
Povrch načtený ze souboru LandXML si zachovává vlastní trojúhelníky: úpravy bodů jej změní až po {{ui:Obnovit povrch z bodů}}.
:::
