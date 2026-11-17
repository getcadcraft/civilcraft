---
title: Algväärtused ja kohatäitjad
summary: Iga väärtus, millega CivilCraft alustab uutes projektides, kuvas, trassides, platsides, koridorides, torustikes, mahtudes ja väljatrükis, ning millised neist on kohatäitjad, mida tuleb asendada.
keywords: vaikeväärtused, seaded, algväärtused, kohatäitjad, projekteerimiskriteeriumid, standardid, reeglid, eeldused
from: fbfc7432
---

CivilCraftil ei ole seadete dialoogi ega malli. Need on väärtused, millega asjad alustavad. Väärtused, mis on märgitud **kohatäitjaks**, ei ole võetud ühestki standardist: asenda need oma projekti kriteeriumidega, enne kui tugineda kontrollile või kogusele.

## Uus projekt

| Seade | Väärtus |
|---|---|
| Nimi | Nimetu objekt (esimese punktifaili nimi asendab selle) |
| Ühikud | USA jalad |
| Pinna nimi | Olemasolev maapind |
| Punktigrupid | Iga grupp algab kasutusega {{ui:Punktid}} |
| Pikim väline serv | 0 (säilita iga kolmnurk) |
| Võtmistagasi samme alles | 200 |

## Kuva

| Seade | Väärtus |
|---|---|
| Pind | {{ui:Olemasolev maapind}} |
| Samakõrgusjooni iga | 1 (ft või m) |
| Põhijooni iga | 5. samakõrgusjoon |
| Vööndid | 8 |
| Sees | Samakõrgusjooned, samakõrgusjoonte sildid, punktid, murdejooned, pinna serv, torud |
| Väljas | Kolmnurgad, kõrgusvööndid, nõlvanooled, punktide sildid |

## Trassid ja profiilid

| Seade | Väärtus |
|---|---|
| Nimi | Trass 1, Trass 2 … |
| Algjaam | 0+00 |
| Kõvera raadius igal sisemisel PI-l | 100 ft või 30 m, väiksem, kui see ei mahu kummagi puutuja poolde |
| Projekteerimisprofiil | Puudub, kuni alustad ühe; {{ui:Alusta maapinnast}} paneb PVI maapinnale kummagi otsa |
| Vertikaalkõvera pikkus | 0 (kõverat ei ole), kuni sisestad ühe |

## Platsid

| Seade | Väärtus |
|---|---|
| Nimi | Plats 1, Plats 2 … |
| Kõrgus | Maapind platsi keskel, ümardatud 0.1-ni (0, kui keskpunkt on pinnast väljas) |
| Lõikekalle | 2 : 1 (kohatäitja) |
| Täitekalle | 3 : 1 (kohatäitja) |

## Koridori koost (kohatäitjad)

| Seade | USA jalgades | Meetrites |
|---|---|---|
| Sõiduraja laius | 12 ft | 3.6 m |
| Sõidurea kalle | 2% | 2% |
| Äärikulaius | 4 ft | 1.2 m |
| Äärikukalle | 4% | 4% |
| Lõikekalle | 2 : 1 | 2 : 1 |
| Täitekalle | 3 : 1 | 3 : 1 |
| Lõige iga | 10 ft | 5 m |

## Torustik

| Seade | USA jalgades | Meetrites |
|---|---|---|
| Nimi ja liik | Sadevesi, sadevesi | Sadevesi, sadevesi |
| Väikseim kalle (kohatäitja) | 0.50% | 0.50% |
| Väikseim katte paksus (kohatäitja) | 2 ft | 0.6 m |
| Langus rajatistes (kohatäitja) | 0.10 ft | 0.03 m |
| Uue rajatise läbimõõt | 48 in | 1200 mm |
| Uue toru läbimõõt | 12 in | 300 mm |
| Settekaevu sügavus | 0 | 0 |
| Pealmine serv | Pinnast | Pinnast |

LandXML-ist avatud torustik kasutab samuti neid reegleid, sest LandXML neid ei kanna.

## Mahud

| Seade | Väärtus |
|---|---|
| Meetod | Ruudustik, proovivõetud lahtrite keskpunktides piirijoonte sees |
| Lahtri suurus | Valitud nii, et täidetud ala piirav ristkülik mahutab umbes 250,000 lahtrit (1, 2 või 5 korda kümne aste) |
| Paisumine ja kokkutõmbumine | Puudub |

## Väljatrükk

| Seade | Väärtus |
|---|---|
| Ala | {{ui:Kõik}} |
| Paber | Tabloid 11 × 17 tolli (jalgade projektid), ISO A3 (meetrite projektid); alati rõhtpaigutus |
| Mõõtkava | Suurim loetletud mõõtkava, mis mahub |
| Värvid | {{ui:Kihtide värvid}} |

DXF-i sildid on mõõdetud mõõtkavale, mille juures kõik mahub Tabloidile (jalad) või A3-le (meetrid).
