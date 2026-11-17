---
title: Východiskové hodnoty a zástupné hodnoty
summary: Všetky hodnoty, s ktorými CivilCraft začína, pre nové projekty, zobrazenie, osi trasy a profily, plošiny, koridory, potrubné siete, zemné práce a vykreslenie, a ktoré z nich sú zástupné a treba ich nahradiť.
keywords: východiskové hodnoty, nastavenia, počiatočné hodnoty, zástupné hodnoty, návrhové kritériá, normy, pravidlá, predpoklady
from: fbfc7432
---

CivilCraft nemá dialógové okno nastavení ani šablónu. Toto sú hodnoty, s ktorými veci začínajú. Hodnoty označené **zástupná hodnota** nie sú prevzaté z nijakej normy: nahraďte ich kritériami svojho projektu, skôr než sa spoľahnete na kontrolu alebo množstvo.

## Nový projekt

| Nastavenie | Hodnota |
|---|---|
| Názov | Lokalita bez názvu (názov prvého súboru bodov ho nahradí) |
| Jednotky | US stopy |
| Názov povrchu | Jestvujúci terén |
| Skupiny bodov | Každá skupina začína ako {{ui:Body}} |
| Najdlhšia vonkajšia hrana | 0 (zachovať každý trojuholník) |
| Uchovaných krokov späť | 200 |

## Zobrazenie

| Nastavenie | Hodnota |
|---|---|
| Povrch | {{ui:Jestvujúci terén}} |
| Vrstevnice po | 1 (ft alebo m) |
| Hlavná po | Každá 5. vrstevnica |
| Pásma | 8 |
| Zapnuté | Vrstevnice, popisky vrstevníc, body, hrany zlomu, okraj povrchu, potrubia |
| Vypnuté | Trojuholníky, pásma výšok, šípky sklonu, popisky bodov |

## Osi trasy a profily

| Nastavenie | Hodnota |
|---|---|
| Názov | Os trasy 1, Os trasy 2 … |
| Začiatočné staničenie | 0+00 |
| Polomer oblúka pri každom vnútornom PI | 100 ft alebo 30 m, menší, ak sa do polovice každej dotyčnice nevmestí |
| Návrhový profil | Žiadny, kým ho nezačnete; {{ui:Začať z terénu}} umiestni PVI na terén na každom konci |
| Dĺžka vertikálneho oblúka | 0 (bez oblúka), kým ju nezadáte |

## Plošiny

| Nastavenie | Hodnota |
|---|---|
| Názov | Plošina 1, Plošina 2 … |
| Výška | Terén v strede plošiny, zaokrúhlený na 0.1 (0, ak je stred mimo povrchu) |
| Sklon zárezu | 2 : 1 (zástupná hodnota) |
| Sklon násypu | 3 : 1 (zástupná hodnota) |

## Zostava koridoru (zástupné hodnoty)

| Nastavenie | US stopy | Metre |
|---|---|---|
| Šírka jazdného pruhu | 12 ft | 3.6 m |
| Sklon jazdného pruhu | 2 % | 2 % |
| Šírka krajnice | 4 ft | 1.2 m |
| Sklon krajnice | 4 % | 4 % |
| Sklon zárezu | 2 : 1 | 2 : 1 |
| Sklon násypu | 3 : 1 | 3 : 1 |
| Rez po každých | 10 ft | 5 m |

## Potrubná sieť

| Nastavenie | US stopy | Metre |
|---|---|---|
| Názov a typ | Dažďová, dažďová | Dažďová, dažďová |
| Najmenší sklon (zástupná hodnota) | 0.50 % | 0.50 % |
| Najmenšie krytie (zástupná hodnota) | 2 ft | 0.6 m |
| Spád v objektoch (zástupná hodnota) | 0.10 ft | 0.03 m |
| Priemer nového objektu | 48 in | 1200 mm |
| Priemer nového potrubia | 12 in | 300 mm |
| Hĺbka kalovej jamy | 0 | 0 |
| Poklop | Od povrchu | Od povrchu |

Potrubná sieť otvorená z LandXML používa tieto pravidlá tiež, pretože LandXML ich neobsahuje.

## Objemy

| Nastavenie | Hodnota |
|---|---|
| Metóda | Mriežka, vzorkovaná v stredoch buniek vo vnútri čiar napojenia na terén |
| Veľkosť bunky | Zvolená tak, aby ohraničený obdĺžnik upravenej plochy obsahoval približne 250,000 buniek (1, 2 alebo 5-násobok mocniny desiatich) |
| Nabývanie a zmršťovanie | Žiadne |

## Vykreslenie

| Nastavenie | Hodnota |
|---|---|
| Oblasť | {{ui:Všetko}} |
| Papier | Tabloid 11 × 17 in (projekty v stopách), ISO A3 (projekty v metroch); vždy na šírku |
| Mierka | Najväčšia uvedená mierka, ktorá sa zmestí |
| Farby | {{ui:Farby hladín}} |

Popisky DXF sú dimenzované pre mierku, pri ktorej sa všetko zmestí na Tabloid (stopy) alebo A3 (metre).
