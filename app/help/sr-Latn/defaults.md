---
title: Početne vrednosti i privremene vrednosti
summary: Svaka vrednost sa kojom CivilCraft počinje, za nove projekte, prikaz, trase i profile, platoe, koridore, mreže cevi, zapremine i štampu, i koje su privremene pa ih treba zameniti.
keywords: podrazumevano, podešavanja, početne vrednosti, privremene vrednosti, projektni kriterijumi, standardi, pravila, pretpostavke
from: fbfc7432
---

CivilCraft nema dijalog podešavanja ni šablon. Ovo su vrednosti sa kojima stvari počinju. Vrednosti obeležene kao **privremeno** nisu preuzete ni iz jednog standarda: zameni ih kriterijumima svog projekta pre nego što se osloniš na proveru ili količinu.

## Novi projekat

| Podešavanje | Vrednost |
|---|---|
| Naziv | Neimenovana lokacija (naziv prve datoteke tačaka ga zamenjuje) |
| Jedinice | Američke stope |
| Naziv površi | Postojeći teren |
| Grupe tačaka | Svaka grupa počinje kao {{ui:Tačke}} |
| Najduža spoljna ivica | 0 (zadrži svaki trougao) |
| Zadržanih koraka opozivanja | 200 |

## Prikaz

| Podešavanje | Vrednost |
|---|---|
| Površ | {{ui:Postojeći teren}} |
| Izohipse na svakih | 1 (ft ili m) |
| Glavne na svakih | 5. izohipsa |
| Pojasevi | 8 |
| Uključeno | Izohipse, oznake izohipsi, tačke, linije loma, ivica površine, cevi |
| Isključeno | Trouglovi, pojasevi kota, strelice nagiba, oznake tačaka |

## Trase i profili

| Podešavanje | Vrednost |
|---|---|
| Naziv | Trasa 1, Trasa 2 … |
| Početna stacionaža | 0+00 |
| Poluprečnik krivine na svakoj unutrašnjoj PI tački | 100 ft ili 30 m, manji ako ne staje u polovinu svake tangente |
| Projektni profil | Nema dok ne počneš; {{ui:Počni od terena}} postavlja PVI tačku na teren na svakom kraju |
| Dužina vertikalne krivine | 0 (bez krivine) dok je ne ukucaš |

## Platoi

| Podešavanje | Vrednost |
|---|---|
| Naziv | Plato 1, Plato 2 … |
| Kota | Teren na sredini plata, zaokružen na 0.1 (0 ako je sredina van površi) |
| Nagib iskopa | 2 : 1 (privremeno) |
| Nagib nasipa | 3 : 1 (privremeno) |

## Sklop koridora (privremeno)

| Podešavanje | Američke stope | Metri |
|---|---|---|
| Širina trake | 12 ft | 3.6 m |
| Nagib trake | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Nagib bankine | 4% | 4% |
| Nagib iskopa | 2 : 1 | 2 : 1 |
| Nagib nasipa | 3 : 1 | 3 : 1 |
| Presek na svakih | 10 ft | 5 m |

## Mreža cevi

| Podešavanje | Američke stope | Metri |
|---|---|---|
| Naziv i vrsta | Kišna, kišna | Kišna, kišna |
| Najmanji pad (privremeno) | 0.50% | 0.50% |
| Najmanja dubina nadsloja (privremeno) | 2 ft | 0.6 m |
| Pad u objektima (privremeno) | 0.10 ft | 0.03 m |
| Prečnik novog objekta | 48 in | 1200 mm |
| Prečnik nove cevi | 12 in | 300 mm |
| Dubina taložnika | 0 | 0 |
| Poklopac | Od površi | Od površi |

Mreža cevi otvorena iz LandXML-a koristi ta pravila takođe, jer LandXML ih ne nosi.

## Zapremine

| Podešavanje | Vrednost |
|---|---|
| Metod | Mreža, uzorkovana u centrima ćelija unutar linija preseka sa terenom |
| Veličina ćelije | Bira se tako da pravougaonik koji obuhvata nivelisanu površinu sadrži oko 250,000 ćelija (1, 2 ili 5 puta stepen deset) |
| Nabrekavanje i skupljanje | Nema |

## Štampa

| Podešavanje | Vrednost |
|---|---|
| Oblast | {{ui:Sve}} |
| Papir | Tabloid 11 × 17 in (projekti u stopama), ISO A3 (projekti u metrima); uvek položen (pejzažno) |
| Razmera | Najveća navedena razmera koja staje |
| Boja | {{ui:Boje slojeva}} |

Oznake u DXF-u su dimenzionisane za razmeru pri kojoj sve staje na Tabloidu (stope) ili A3 (metri).
