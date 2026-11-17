---
title: Početne vrijednosti i zamjenske vrijednosti
summary: Svaka vrijednost sa kojom CivilCraft počinje, za nove projekte, prikaz, trase, platoe, koridore, mreže cijevi, zapremine i štampu, i koje su zamjenske i treba ih zamijeniti.
keywords: podrazumijevane vrijednosti, postavke, početne vrijednosti, zamjenske vrijednosti, projektni kriteriji, standardi, pravila, pretpostavke
from: fbfc7432
---

CivilCraft nema dijalog postavki ni šablon. Ovo su vrijednosti s kojima stvari počinju. Vrijednosti označene kao **zamjenske** nisu preuzete iz nikakvog standarda: zamijenite ih kriterijumima vašeg projekta prije nego što se oslonite na provjeru ili količinu.

## Novi projekat

| Postavka | Vrijednost |
|---|---|
| Naziv | Neimenovana lokacija (naziv prve datoteke tačaka ga zamjenjuje) |
| Jedinice | US stope |
| Naziv površine | {{ui:Postojeći teren}} |
| Grupe tačaka | Svaka grupa počinje kao {{ui:Tačke}} |
| Najduža vanjska ivica | 0 (zadrži svaki trougao) |
| Koraci poništavanja koji se čuvaju | 200 |

## Prikaz

| Postavka | Vrijednost |
|---|---|
| Površina | {{ui:Postojeći teren}} |
| Izohipse svakih | 1 (ft ili m) |
| Glavne svakih | 5. izohipsa |
| Pojasi | 8 |
| {{ui:Uključeno}} | Izohipse, {{ui:Oznake izohipsi}}, tačke, linije prijeloma, rub površine, cijevi |
| {{ui:Isključeno}} | Trouglovi, pojasi kota, strelice nagiba, oznake tačaka |

## Trase i profili

| Postavka | Vrijednost |
|---|---|
| Naziv | Trasa 1, Trasa 2 … |
| Početna stacionaža | 0+00 |
| Radijus krivine na svakom unutrašnjem PI | 100 ft ili 30 m, manji ako ne stane u polovinu svake tangente |
| Projektovani profil | Nema dok ne počnete; {{ui:Počni od terena}} stavlja PVI na teren na svakom kraju |
| Dužina vertikalne krivine | 0 (bez krivine) dok je ne upišete |

## Platoi

| Postavka | Vrijednost |
|---|---|
| Naziv | Plato 1, Plato 2 … |
| Kota | Teren u sredini platoa, zaokružen na 0.1 (0 ako je sredina van površine) |
| Nagib usjeka | 2 : 1 (zamjenski) |
| Nagib nasipa | 3 : 1 (zamjenski) |

## Sklop koridora (zamjenske vrijednosti)

| Postavka | US stope | Metri |
|---|---|---|
| Širina trake | 12 ft | 3.6 m |
| Nagib trake | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Nagib bankine | 4% | 4% |
| Nagib usjeka | 2 : 1 | 2 : 1 |
| Nagib nasipa | 3 : 1 | 3 : 1 |
| Presjek svakih | 10 ft | 5 m |

## Mreža cijevi

| Postavka | US stope | Metri |
|---|---|---|
| Naziv i vrsta | Kišna, kišna | Kišna, kišna |
| Najmanji nagib (zamjenski) | 0.50% | 0.50% |
| Najmanji nadsloj (zamjenski) | 2 ft | 0.6 m |
| Pad u oknima (zamjenski) | 0.10 ft | 0.03 m |
| Prečnik novog okna | 48 in | 1200 mm |
| Prečnik nove cijevi | 12 in | 300 mm |
| Dubina sabirnog okna | 0 | 0 |
| Obod | Od površine | Od površine |

Mreža cijevi otvorena iz LandXML-a koristi ova pravila takođe, jer ih LandXML ne nosi.

## Zapremine

| Postavka | Vrijednost |
|---|---|
| Metoda | Mreža, uzorkovana u centrima ćelija unutar linija presjeka s terenom |
| Veličina ćelije | Odabrana tako da pravougaonik koji obuhvata izgrađenu površinu sadrži oko 250,000 ćelija (1, 2 ili 5 puta stepen deset) |
| Bubrenje i skupljanje | Nema |

## Štampa

| Postavka | Vrijednost |
|---|---|
| Površina | {{ui:Sve}} |
| Papir | Tabloid 11 × 17 in (projekti u stopama), ISO A3 (projekti u metrima); uvijek pejzažno |
| Razmjera | Najveća navedena razmjera koja stane |
| Tinta | {{ui:Boje slojeva}} |

Oznake DXF-a dimenzionisane su za razmjeru pri kojoj sve stane na Tabloid (stope) ili A3 (metri).
