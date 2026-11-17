---
title: Výchozí hodnoty a zástupné hodnoty
summary: Všechny hodnoty, se kterými CivilCraft začíná, pro nové projekty, zobrazení, osy tras, plošiny, koridory, potrubní sítě, objemy a vykreslení, a které z nich jsou zástupné hodnoty k nahrazení.
keywords: výchozí hodnoty, nastavení, počáteční hodnoty, zástupné hodnoty, návrhová kritéria, normy, pravidla, předpoklady
from: fbfc7432
---

CivilCraft nemá dialog nastavení ani šablonu. Toto jsou hodnoty, se kterými věci začínají. Hodnoty označené **zástupná hodnota** nejsou převzaty z žádné normy: nahraďte je kritérii svého projektu, než se spolehnete na kontrolu nebo na množství.

## Nový projekt

| Nastavení | Hodnota |
|---|---|
| Název | Bez názvu (název prvního souboru bodů ho nahradí) |
| Jednotky | US feet |
| Název povrchu | Stávající terén |
| Skupiny bodů | Každá skupina začíná jako {{ui:Points}} |
| Nejdelší vnější hrana | 0 (zachovat každý trojúhelník) |
| Uložené kroky zpět | 200 |

## Zobrazení

| Nastavení | Hodnota |
|---|---|
| Povrch | {{ui:Existing ground}} |
| Vrstevnice po | 1 (ft nebo m) |
| Hlavní po | každá 5. vrstevnice |
| Pásma | 8 |
| Zapnuto | Vrstevnice, popisky vrstevnic, body, lomové hrany, hrana povrchu, potrubí |
| Vypnuto | Trojúhelníky, pásma výšek, šipky sklonu, popisky bodů |

## Osy tras a profily

| Nastavení | Hodnota |
|---|---|
| Název | Osa trasy 1, Osa trasy 2 … |
| Počáteční staničení | 0+00 |
| Poloměr oblouku v každém vnitřním PI | 100 ft nebo 30 m, menší, pokud se nevejde do poloviny každé tečny |
| Návrhový profil | Žádný, dokud ho nezačnete; {{ui:Start from the ground}} dá PVI na terén na každém konci |
| Délka vertikálního oblouku | 0 (bez oblouku), dokud ho nenapíšete |

## Plošiny

| Nastavení | Hodnota |
|---|---|
| Název | Plošina 1, Plošina 2 … |
| Výška | Terén uprostřed plošiny, zaokrouhlený na 0.1 (0, pokud je střed mimo povrch) |
| Sklon výkopu | 2 : 1 (zástupná hodnota) |
| Sklon násypu | 3 : 1 (zástupná hodnota) |

## Sestava koridoru (zástupné hodnoty)

| Nastavení | US feet | Metry |
|---|---|---|
| Šířka pruhu | 12 ft | 3.6 m |
| Sklon pruhu | 2 % | 2 % |
| Šířka krajnice | 4 ft | 1.2 m |
| Sklon krajnice | 4 % | 4 % |
| Sklon výkopu | 2 : 1 | 2 : 1 |
| Sklon násypu | 3 : 1 | 3 : 1 |
| Průřez každých | 10 ft | 5 m |

## Potrubní síť

| Nastavení | US feet | Metry |
|---|---|---|
| Název a druh | Dešťová, dešťová | Dešťová, dešťová |
| Nejmenší sklon (zástupná hodnota) | 0.50 % | 0.50 % |
| Nejmenší krytí (zástupná hodnota) | 2 ft | 0.6 m |
| Spád v šachtách (zástupná hodnota) | 0.10 ft | 0.03 m |
| Průměr nové šachty | 48 in | 1200 mm |
| Průměr nového potrubí | 12 in | 300 mm |
| Hloubka kalové jímky | 0 | 0 |
| Okraj poklopu | Z povrchu | Z povrchu |

Potrubní síť otevřená z LandXML používá tato pravidla také, protože LandXML je nenese.

## Objemy

| Nastavení | Hodnota |
|---|---|
| Metoda | Mřížka, vzorkovaná ve středech buněk uvnitř čar napojení |
| Velikost buňky | Zvolena tak, aby ohraničující obdélník upravené plochy obsahoval asi 250 000 buněk (1, 2 nebo 5násobek mocniny deseti) |
| Nabytí a smrštění | Žádné |

## Vykreslení

| Nastavení | Hodnota |
|---|---|
| Oblast | {{ui:Everything}} |
| Papír | Tabloid 11 × 17 in (projekty ve stopách), ISO A3 (projekty v metrech); vždy na šířku |
| Měřítko | Největší uvedené měřítko, které se vejde |
| Barva tisku | {{ui:Layer colors}} |

Popisky DXF mají velikost pro měřítko, při němž se vše vejde na Tabloid (stopy) nebo A3 (metry).
