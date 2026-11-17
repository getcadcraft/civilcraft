---
title: Početne i okvirne vrijednosti
summary: Svaka vrijednost s kojom CivilCraft počinje, za nove projekte, prikaz, osi i profile, platoe, koridore, mreže cijevi, volumene i ispis, te koje su okvirne i treba ih zamijeniti.
keywords: zadane vrijednosti, postavke, početne vrijednosti, okvirne vrijednosti, projektni kriteriji, standardi, pravila, pretpostavke
from: fbfc7432
---

CivilCraft nema dijaloški okvir postavki ni predložak. Ovo su vrijednosti s kojima stvari počinju. Vrijednosti označene kao **okvirne** nisu preuzete iz nijednog standarda: zamijenite ih kriterijima svog projekta prije nego se oslonite na provjeru ili količinu.

## Novi projekt

| Postavka | Vrijednost |
|---|---|
| Naziv | Neimenovana lokacija (naziv prve datoteke točaka ga zamjenjuje) |
| Jedinice | US feet |
| Naziv terena | Postojeći teren |
| Skupine točaka | Svaka skupina počinje kao {{ui:Points}} |
| Najdulji vanjski brid | 0 (zadrži svaki trokut) |
| Zadržanih koraka poništavanja | 200 |

## Prikaz

| Postavka | Vrijednost |
|---|---|
| Teren | {{ui:Existing ground}} |
| Izohipse svakih | 1 (ft ili m) |
| Glavne svakih | 5. izohipsa |
| Pojasevi | 8 |
| Uključeno | Izohipse, oznake izohipsa, točke, prijelomnice, rub terena, cijevi |
| Isključeno | Trokuti, visinski pojasevi, strelice nagiba, oznake točaka |

## Osi i profili

| Postavka | Vrijednost |
|---|---|
| Naziv | Os 1, Os 2 … |
| Početna stacionaža | 0+00 |
| Radijus krivine na svakoj unutarnjoj PI-točki | 100 ft ili 30 m, manji ako ne stane u polovinu svake tangente |
| Projektirani profil | Nema dok ga ne započnete; {{ui:Start from the ground}} stavlja PVI na teren na svakom kraju |
| Duljina vertikalne krivine | 0 (bez krivine) dok je ne upišete |

## Platoi

| Postavka | Vrijednost |
|---|---|
| Naziv | Plato 1, Plato 2 … |
| Kota | Teren na sredini platoa, zaokružen na 0.1 (0 ako je sredina izvan terena) |
| Nagib iskopa | 2 : 1 (okvirno) |
| Nagib nasipa | 3 : 1 (okvirno) |

## Sklop koridora (okvirno)

| Postavka | US feet | Metri |
|---|---|---|
| Širina trake | 12 ft | 3.6 m |
| Nagib trake | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Nagib bankine | 4% | 4% |
| Nagib iskopa | 2 : 1 | 2 : 1 |
| Nagib nasipa | 3 : 1 | 3 : 1 |
| Presjek svakih | 10 ft | 5 m |

## Mreža cijevi

| Postavka | US feet | Metri |
|---|---|---|
| Naziv i vrsta | Oborinska, oborinska | Oborinska, oborinska |
| Najmanji nagib (okvirno) | 0.50% | 0.50% |
| Najmanji nadsloj (okvirno) | 2 ft | 0.6 m |
| Pad u građevinama (okvirno) | 0.10 ft | 0.03 m |
| Promjer nove građevine | 48 in | 1200 mm |
| Promjer nove cijevi | 12 in | 300 mm |
| Dubina taložnice | 0 | 0 |
| Rub poklopca | Od terena | Od terena |

Mreža cijevi otvorena iz LandXML-a koristi ta ista pravila, jer LandXML ih ne nosi.

## Volumeni

| Postavka | Vrijednost |
|---|---|
| Metoda | Mreža, uzorkovana u središtima ćelija unutar linija nožice pokosa |
| Veličina ćelije | Odabrana tako da pravokutnik oko izrađene površine sadrži oko 250.000 ćelija (1, 2 ili 5 puta potencija deset) |
| Bubrenje i skupljanje | Nema |

## Ispis

| Postavka | Vrijednost |
|---|---|
| Područje | {{ui:Everything}} |
| Papir | Tabloid 11 × 17 in (projekti u stopama), ISO A3 (projekti u metrima); uvijek vodoravno |
| Mjerilo | Najveće navedeno mjerilo koje stane |
| Tinta | {{ui:Layer colors}} |

Oznake u DXF-u su veličine prema mjerilu pri kojem sve stane na Tabloid (stope) ili A3 (metri).
