---
title: Pracovný priestor Krajina
summary: Plány výsadby, úpravy terénu, dlažby, múry, schodiská, zavlažovanie a listy krajiny na tej istej lokalite, tých istých povrchoch a v tom istom súbore ako civilné práce.
keywords: krajina, architektúra krajiny, záhrada, výsadba, rastliny, stromy, úpravy terénu, spevnené plochy, dlažba, zavlažovanie, postrekovače, pracovný priestor, návrh lokality, plán krajiny
from: eea929d1
---

Pracovný priestor Krajina pridáva nástroje na návrh krajiny k lokalite CivilCraft, ktorú už máte: tie isté body prieskumu, ten istý existujúci terén, ten istý navrhovaný povrch a ten istý súbor projektu.

## Otvorenie

Vyberte {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. Panel nástrojov potom zobrazí voľbu **Pracovný priestor** a skupinu **Krajina** a skupiny Povrch, Návrh a GIS ustúpia, aby uvoľnili miesto. Vyberte **Civil** v časti Pracovný priestor a vrátite sa späť. CivilCraft si na tomto počítači pamätá pracovný priestor, ktorý ste použili naposledy.

Ľavý panel získa na vrchu tri časti:

- **Rastliny**: zoznam rastlín na vyhľadávanie a výber toho, čo umiestňujete. Pozri [Zoznam rastlín](topic:plant-list).
- **Kontroly sklonu**: analýza sklonu, šípky odtoku a zátopy. Pozri [Úpravy terénu](topic:landscape-grading).
- **Zavlažovanie**: postrekovače a potrubia, ktoré umiestnite ďalej, a nastavenia vodného prívodu. Pozri [Zavlažovanie](topic:irrigation).

## Čo je v skupine Krajina

| Nástroj | Čo robí | Téma |
|---|---|---|
| **Rastlina**, **Záhon**, **Živý plot** | Jednotlivé rastliny, záhony vyplnené v rozstupe rastlín, živé ploty pozdĺž čiary | [Výsadba](topic:planting) |
| **Terén** | Podesty, valy, vsakovacie priekopy, plochy úprav s bodovými výškami a vrstevnicami, kontroly sklonu a odtoku | [Úpravy terénu](topic:landscape-grading) |
| **Spevnené plochy** | Dlažby, chodníky, múry, obrubníky, rampy a schodiská, ktoré nasledujú terén | [Spevnené plochy](topic:hardscape) |
| **Plochy** | Osádzané plochy: trávniky, záhony, lúky a pôdopokryvné plochy so skladbou, orezané okolo spevnených plôch | [Osádzané plochy](topic:planted-areas) |
| **Úrovne** | Úpravy terénu v poradí s výkopom a násypom, bodové úrovne, šípky sklonu, rezové čiary | [Úpravy terénu](topic:ground-modifiers), [Rezy](topic:landscape-sections) |
| **Zavlažovanie** | Postrekovače, potrubia, ventily, kvapkové vedenia, prívod, záber a hydraulická kontrola | [Zavlažovanie](topic:irrigation) |
| **Viac** | Z čiary (objekty prepojené s čiarami), zoznam rastlín, tabuľka rastlín, pracovné tabuľky, grafika rastlín, voľné objekty, listy krajiny a sada na publikovanie, export IFC, veľkosť a popisky rastlín | [Objekty z čiar](topic:objects-from-lines), [Záznamy rastlín](topic:plant-records), [Pracovné tabuľky](topic:worksheets), [Listy krajiny](topic:landscape-sheets), [Voľné objekty](topic:freeform-objects) |

Všetko, čo pridáte, je jeden krok späť, uloží sa v súbore projektu a kreslí sa na pôdoryse na vrstvách s názvami `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` a `L-IRRG-…`, takže ho obsahujú aj exporty DXF, DWG a PDF.

## Jeden povrch pre všetko

Podesty, valy, vsakovacie priekopy, plochy úprav, dlažby a chodníky sa upravia do **navrhovaného povrchu**, rovnakého, aký používajú koridory a plochy. **Existujúci terén** sa nikdy nemení. Rastliny stoja na teréne, ktorý je pod nimi, takže sa pohnú, keď sa úpravy zmenia. Výkop a násyp počíta úpravy krajiny spolu so všetkým ostatným.

:::tip
Ste tu noví? [Navrhnite záhradu od začiatku do konca](topic:landscape-walkthrough) prejde celý pracovný priestor na ukážkovej lokalite.
:::
