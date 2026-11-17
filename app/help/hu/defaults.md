---
title: Kezdőértékek és helyőrzők
summary: Minden érték, amellyel a CivilCraft indul: új projektekhez, megjelenítéshez, nyomvonalakhoz, tereplépcsőkhöz, sávokhoz, csőhálózatokhoz, térfogatokhoz és ábrákhoz, valamint az, hogy melyek a cserélendő helyőrzők.
keywords: alapértelmezések, beállítások, kezdőértékek, helyőrzők, tervezési kritériumok, szabványok, szabályok, feltételezések
from: fbfc7432
---

A CivilCraftnak nincs beállítási párbeszédpanele és sablonja. Ezek azok az értékek, amelyekkel a dolgok indulnak. A **helyőrző** jelöléssel ellátott értékek nem szabványból származnak: cserélje őket a projekt kritériumaira, mielőtt egy ellenőrzésre vagy mennyiségre támaszkodna.

## Új projekt

| Beállítás | Érték |
|---|---|
| Név | Névtelen telek (az első pontfájl nevére cserélődik) |
| Mértékegységek | US feet |
| Felület neve | {{ui:Meglévő terep}} |
| Pontcsoportok | Minden csoport {{ui:Pontok}} értékkel indul |
| Leghosszabb külső él | 0 (minden háromszög megtartva) |
| Megtartott visszavonási lépések | 200 |

## Megjelenítés

| Beállítás | Érték |
|---|---|
| Felület | {{ui:Meglévő terep}} |
| Szintvonalak közönként | 1 (ft vagy m) |
| Főszintvonalak közönként | 5. szintvonal |
| Sávok | 8 |
| Be | Szintvonalak, szintvonalfeliratok, pontok, töréselemek, felület széle, csövek |
| Ki | Háromszögek, magassági sávok, lejtésnyilak, pontfeliratok |

## Nyomvonalak és hossz-szelvények

| Beállítás | Érték |
|---|---|
| Név | Nyomvonal 1, Nyomvonal 2 … |
| Kezdőállomás | 0+00 |
| Ívsugár minden belső PI-nél | 100 ft vagy 30 m; kisebb, ha nem fér el az érintőszakaszok felében |
| Tervezett hossz-szelvény | Nincs, amíg nem kezd egyet; a {{ui:Kezdés a terepről}} PVI-t tesz a terepre mindkét végén |
| Függőleges ív hossza | 0 (nincs ív), amíg nem ad meg egyet |

## Tereplépcsők

| Beállítás | Érték |
|---|---|
| Név | Tereplépcső 1, Tereplépcső 2 … |
| Magasság | A terep a tereplépcső közepén, 0.1-re kerekítve (0, ha a közép a felületen kívül esik) |
| Bevágási lejtés | 2 : 1 (helyőrző) |
| Feltöltési lejtés | 3 : 1 (helyőrző) |

## Sáv összeállítása (helyőrzők)

| Beállítás | US feet | Méter |
|---|---|---|
| Sávszélesség | 12 ft | 3.6 m |
| Sávlejtés | 2% | 2% |
| Vállszélesség | 4 ft | 1.2 m |
| Vállejtés | 4% | 4% |
| Bevágási lejtés | 2 : 1 | 2 : 1 |
| Feltöltési lejtés | 3 : 1 | 3 : 1 |
| Szelvény közönként | 10 ft | 5 m |

## Csőhálózat

| Beállítás | US feet | Méter |
|---|---|---|
| Név és típus | Storm, storm | Storm, storm |
| Legkisebb lejtés (helyőrző) | 0.50% | 0.50% |
| Legkisebb takarás (helyőrző) | 2 ft | 0.6 m |
| Esés a műtárgyakban (helyőrző) | 0.10 ft | 0.03 m |
| Új műtárgy átmérője | 48 in | 1200 mm |
| Új cső átmérője | 12 in | 300 mm |
| Gyűjtőakna mélysége | 0 | 0 |
| Fedlap | A felületről | A felületről |

A LandXML-ből megnyitott csőhálózat is ezeket a szabályokat használja, mert a LandXML nem hordozza őket.

## Térfogatok

| Beállítás | Érték |
|---|---|
| Módszer | Rács, a cellák közepén mintavételezve a bevágás–feltöltés határvonalakon belül |
| Cellaméret | Úgy választva, hogy a szintezett terület befoglaló téglalapja körülbelül 250 000 cellát tartalmazzon (10 valamely hatványának 1-, 2- vagy 5-szöröse) |
| Duzzadás és zsugorodás | Nincs |

## Plottolás

| Beállítás | Érték |
|---|---|
| Terület | {{ui:Minden}} |
| Papír | Tabloid 11 × 17 in (láb mértékegységű projektek), ISO A3 (méteres projektek); mindig fekvő |
| Méretarány | A legnagyobb felsorolt méretarány, amely még belefér |
| Tinta | {{ui:Rétegszínek}} |

A DXF-feliratok azon méretarányhoz igazodnak, amelynél minden belefér a Tabloid (láb) vagy az A3 (méter) papírra.
