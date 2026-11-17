---
title: Problémy a BCF
summary: Pripnite problém k pôdorysu, staničeniu osi trasy, bodu povrchu alebo potrubiu, priraďte mu stav a komentáre a vymieňajte problémy ako súbory BCF 2.1 spolu so súborom LandXML.
keywords: problém, problémy, bcf, komentár, poznámka, nedostatok, chyba, lokalita, pripnúť, stav, otvorené, vyriešené, uzavreté, bim collaboration format, landxml, problémy
from: e44153b1
---

Problém je poznámka pripnutá na miesto vo vašom výkrese CivilCraft, s názvom, stavom a komentármi. Použite ju na to, aby ste pracovníkom na stavbe alebo inému programu povedali, na čo sa majú pozrieť, a aby ste si mohli prečítať ich odpovede.

## Pridať problém

1. Otvorte **Povrch, Viac, Problémy (BCF)...**
2. Zadajte názov a opíšte, čo je zle.
3. Vyberte, kam ho pripnúť: stred pôdorysného pohľadu, bod povrchu v strede, staničenie vybranej osi trasy (zadajte staničenie a odsadenie, vpravo je kladné), alebo vybrané potrubie, objekt či charakteristickú čiaru.
4. Stlačte **Pridať problém**. Špendlík sa zobrazí na pôdoryse ako malý kosoštvorec s číslom.

Kliknutím na názov problému ho priblížite, v zozname zmeníte jeho stav (Otvorené, Aktívne, Vyriešené, Uzavreté) a pridáte komentáre. Každá zmena je jeden krok späť a problémy sa ukladajú do súboru projektu.

## Výmena vo formáte BCF

- **Exportovať BCF** zapíše súbor BCF 2.1 s jednou témou pre každý problém: názov, stav, komentáre a jeden pohľad s ortogonálnou kamerou pôdorysu a špendlíkom.
- **Importovať BCF** načíta súbor BCF (súbory 2.0 a 3.0 sa načítajú, pokiaľ zodpovedajú verzii 2.1). Téma s guid, ktorý už máte, aktualizuje daný problém (stav, nové komentáre) namiesto pridania druhého.
- **Z problémov** vytvorí problém z každej otvorenej položky v paneli Problémy, ktorá uvádza, kde sa nachádza.

BCF prenáša údaje v metroch v súradniciach tohto projektu bez posunu. Druhý program musí byť v rovnakom súradnicovom systéme ako váš súbor LandXML, aby špendlíky skončili na správnom mieste. Prvok, na ktorý špendlík ukazuje (os trasy, staničenie, odsadenie, potrubie), sa prenáša ako štítky začínajúce na „cc:“, ktoré CivilCraft spätne načíta.

## Čo nie je overené

Špendlíky a pohľady boli otestované iba zápisom súboru a jeho spätným načítaním v CivilCraft. Zatiaľ ho neotvoril žiadny iný BIM program a to, či BCF „view to world scale“ znamená plnú alebo polovičnú výšku pohľadu, sa medzi programami líši: CivilCraft zapisuje plnú výšku.
