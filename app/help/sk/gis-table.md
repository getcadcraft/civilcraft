---
title: Práca s tabuľkou atribútov hladiny
summary: Zobrazte každý prvok hladiny GIS ako tabuľku, zoraďte a filtrujte ju, vyberajte riadky a prvky spolu, opravujte hodnoty, pridávajte polia, počítajte nové hodnoty a uložte tabuľku ako CSV.
keywords: tabuľka atribútov, tabuľka, polia, stĺpce, riadky, zoradiť, filtrovať, výraz, výber, úprava, kalkulátor polí, vypočítať, pridať pole, premenovať pole, odstrániť pole, csv, export, gis, shapefile, geopackage, symbolika
from: fd9d6c11
---

Otvorte tabuľku hladiny z jej ponuky **troch bodiek** v zozname hladín GIS ({{ui:Attribute table…}}), z Povrch › Viac › {{ui:Attribute table}}, alebo napísaním `ATTRIBUTES`, `ATTTABLE` alebo `TABLE`. Tabuľka sa otvorí vedľa pôdorysu a zostáva otvorená počas vašej práce. Kreslia sa iba riadky, ktoré vidíte, takže hladina s tisíckami prvkov sa otvára a posúva rýchlo.

## Zoraďovanie, filtrovanie a výber

- **Zoradenie:** kliknite na nadpis stĺpca. Druhé kliknutie ho obráti, tretie vráti poradie zo súboru. Prázdne hodnoty vždy ostanú dole. Zoraďovanie mení len to, čo vidíte, nikdy nie hladinu.
- **Filter:** píšte do filtračného poľa. Výraz ako `AREA > 500 and USE = 'Res'` nechá riadky, kde je pravdivý (rovnaké slová ako na karte Výber v [Analýza hladín GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Čokoľvek, čo nie je výraz, napríklad `oak maple`, hľadá tieto slová v každom stĺpci.
- **Výber riadkov:** kliknite na riadok. Ctrl+klik pridá alebo odoberie jeden, Shift+klik vyberie úsek a {{ui:Select shown rows}} vezme každý riadok, ktorý prejde filtrom. Vybrané prvky sa kreslia v pôdoryse a klik na prvok v pôdoryse vyberie jeho riadok tu.
- S vybranými riadkami môžete {{ui:Zoom}} na ne, vytvoriť **hladinu z výberu** a prečítať celkovú plochu alebo dĺžku v stavovom riadku.

## Oprava hodnôt

Dvojitým kliknutím na bunku (alebo presunom šípkami a stlačením {{key:Enter}}) napíšte novú hodnotu a stlačte {{key:Enter}}. {{key:Esc}} ju nechá tak, ako bola. Hodnota musí zodpovedať stĺpcu: čísla ako čísla, dátumy ako `YYYY-MM-DD`, áno/nie ako yes, no, true alebo false. Hodnota, ktorá nezodpovedá, sa odmietne vetou a nič sa nezmení. Prázdne políčko spraví hodnotu prázdnou. Každá úprava je jeden krok späť: {{ui:Undo}} a {{ui:Redo}} sú na spodku tabuľky a Ctrl+Z funguje v pôdoryse.

## Polia

V časti **Polia** môžete pridať pole (text, číslo, dátum alebo áno/nie), premenovať ho alebo odstrániť. Nové pole začína prázdne. Premenovanie sa prenesie: popisky a [štýl podľa atribútu](topic:gis-symbology) hladiny sa presunú na nový názov a odstránenie poľa zruší popisky a štýl, ktoré ho používali. Každé je jeden krok späť, ktorý všetko vráti.

## Kalkulátor polí

Zapíše hodnotu do každého riadka (alebo len do vybraných riadkov) z ostatných polí riadka, jeho geometrie a niekoľkých funkcií. Vyberte existujúce pole alebo **Nové pole…** a zadajte jeho názov a typ. Nič sa nespúšťa ako kód: výraz číta malý analyzátor s pevným zoznamom funkcií.

| Skupina | Slová |
|---|---|
| Čísla | `+ - * /`, zátvorky, `abs round(x, digits) floor ceil sqrt pow min max` |
| Text | `upper lower trim len substr(text, from, count) left right replace concat` (text sa píše do 'jednoduchých úvodzoviek'; názov poľa s medzerami do "dvojitých úvodzoviek" alebo [hranatých zátvoriek]) |
| Výber | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Dátumy | `year month day` hodnoty `YYYY-MM-DD` |
| Geometria | `$area $perimeter $length $x $y $vertices`, v jednotkách projektu |

Výsledok, ktorý sa nedá uložiť v type poľa (text v číselnom poli), sa nechá prázdny a spočíta sa v hlásení. Delenie nulou dá prázdnu hodnotu. Napríklad `round($area / 43560, 2)` zapíše akre zo štvorcových stôp.

## Export

{{ui:Export CSV}} uloží riadky, ktoré vidíte (po filtri a zoradení), ako súbor CSV v kódovaní UTF-8 s názvami polí na prvom riadku. Text, ktorý začína `=`, `+`, `-` alebo `@`, dostane úvodný apostrof, aby ho tabuľkový procesor nespustil ako vzorec. Ak chcete uložiť samotnú hladinu, použite [Export údajov o skutočnom vyhotovení pre GIS](topic:gis-export).

## Obmedzenia

Tabuľka zobrazuje hladinu v jednom poradí triedenia a v jednom filtri naraz. Riadky sa tu nedajú pridávať ani mazať (vytvorte novú hladinu z výberu), geometria sa neupravuje a typ poľa sa po vytvorení nedá zmeniť.
