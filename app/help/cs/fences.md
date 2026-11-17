---
title: Ploty
summary: Plot podél čáry, parcely nebo stavební plochy: sloupky, podélníky, panely nebo latě, brány, šikmé nebo schodovité podle terénu, tabulka, symboly na půdorysu a prvky IFC. Také dostupné asistentovi.
keywords: plot, sloupky, podélníky, panely, latě, brána, šikmý, schodovitý, terén, tabulka, ifc, zábradlí, hranice
from: c0e7b84a
---

Vytvořte plot podél hranové čáry, osy trasy, parcely nebo stavební plochy, s jeho sloupky a branami umístěnými za vás.

## Vytvoření plotu

1. Vyberte čáru, parcelu nebo stavební plochu.
2. Otevřete **Povrch, Více, Ploty...**
3. Zvolte styl (panely, podélníky nebo latě), šikmé nebo schodovité, výšku, rozestup sloupků a šířku brány, pak **Plot podél výběru**, nebo **S branou** pro umístění brány doprostřed nejdelšího přímého úseku.

Sloupky jsou na koncích, v každém rohu (vrchol, který se stočí o 20 stupňů nebo více), na obou okrajích každé brány a v rovnoměrných polích mezi nimi, žádné delší než rozestup. **Šikmé** panely sledují terén mezi svými sloupky. **Schodovité** panely zůstávají vodorovné a schodují se u sloupků; mezera pod panelem je nejširší u jeho sloupku ve spádu, a okno upozorní, když je ta mezera nad limitem, nebo když terén prochází panelem. Brány o šířce 6 stop (1.8 m) a větší mají dvě křídla; půdorys zobrazuje křídla otevřená se směrem jejich otáčení.

## Tabulka a výstupy

Každý plot ukazuje svou délku, sloupky podle druhu, panely, brány a schody, s **CSV** tabulkou sloupků, panelů, podélníků, latí a bran. Půdorys má vrstvy plotu (C-FENC, C-FENC-POST, C-FENC-GATE) pro PDF, DXF a DWG. Export IFC obsahuje sloupky (IfcMember, post), panely (IfcRailing, user defined fence panel), podélníky (IfcMember) a brány (IfcDoor, gate), jeden systém na plot.

## Z asistenta

`fence_build` vytvoří plot (body, nebo pojmenovanou čáru, parcelu či plochu, brány podle staničení) a `fence_list` vypíše ploty s jejich tabulkou.

## Co ještě není hotové

Výchozí velikosti jsou obvyklé volby, ne norma. Typy z knihovny se přenášejí jen jako název. Brány musí ležet v jednom přímém úseku. BimCraft zatím tento nástroj nemá.
