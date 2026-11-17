---
title: Pradinės reikšmės ir vietos rezervuotojai
summary: Kiekviena reikšmė, su kuria CivilCraft pradeda: naujiems projektams, rodymui, trasoms, aikštelėms, koridoriams, vamzdynų tinklams, tūriams ir brėžiniams, ir kurios iš jų yra vietos rezervuotojai, kuriuos reikia pakeisti.
keywords: numatytosios reikšmės, nustatymai, pradinės reikšmės, vietos rezervuotojai, projektavimo kriterijai, standartai, taisyklės, prielaidos
from: fbfc7432
---

CivilCraft neturi nustatymų dialogo ar šablono. Tai reikšmės, su kuriomis daiktai pradeda. Reikšmės, pažymėtos **vietos rezervuotojas**, nepaimtos iš jokio standarto: pakeiskite jas savo projekto kriterijais, prieš pasikliaudami patikrinimu ar kiekiu.

## Naujas projektas

| Nustatymas | Reikšmė |
|---|---|
| Pavadinimas | Be pavadinimo vietovė (pirmojo taškų failo pavadinimas pakeičia jį) |
| Vienetai | US feet |
| Paviršiaus pavadinimas | {{ui:Esamas gruntas}} |
| Taškų grupės | Kiekviena grupė pradžioje yra {{ui:Taškai}} |
| Ilgiausias išorinis kraštas | 0 (palikti kiekvieną trikampį) |
| Išsaugomi anuliavimo žingsniai | 200 |

## Rodymas

| Nustatymas | Reikšmė |
|---|---|
| Paviršius | {{ui:Esamas gruntas}} |
| Horizontalės kas | 1 (ft arba m) |
| Pagrindinės kas | 5-oji horizontalė |
| Juostos | 8 |
| Įjungta | Horizontalės, horizontalių žymos, taškai, lūžio linijos, paviršiaus kraštas, vamzdžiai |
| Išjungta | Trikampiai, aukščių juostos, nuolydžio rodyklės, taškų žymos |

## Trasos ir profiliai

| Nustatymas | Reikšmė |
|---|---|
| Pavadinimas | Trasa 1, Trasa 2 … |
| Pradžios pikketas | 0+00 |
| Kreivės spindulys kiekviename vidiniame PI | 100 ft arba 30 m, mažesnis, jei jis netelpa į pusę kiekvienos liestinės |
| Projektinis profilis | Nėra, kol jo nepradėsite; {{ui:Pradėti nuo grunto}} padeda PVI ant grunto kiekviename gale |
| Vertikaliosios kreivės ilgis | 0 (be kreivės), kol neįvesite jos |

## Aikštelės

| Nustatymas | Reikšmė |
|---|---|
| Pavadinimas | Aikštelė 1, Aikštelė 2 … |
| Aukštis | Grunto aukštis aikštelės viduryje, suapvalintas iki 0.1 (0, jei vidurys yra už paviršiaus ribų) |
| Iškasos nuolydis | 2 : 1 (vietos rezervuotojas) |
| Pylimo nuolydis | 3 : 1 (vietos rezervuotojas) |

## Koridoriaus surinkimas (vietos rezervuotojai)

| Nustatymas | US feet | Metrai |
|---|---|---|
| Juostos plotis | 12 ft | 3.6 m |
| Juostos nuolydis | 2% | 2% |
| Pakelės plotis | 4 ft | 1.2 m |
| Pakelės nuolydis | 4% | 4% |
| Iškasos nuolydis | 2 : 1 | 2 : 1 |
| Pylimo nuolydis | 3 : 1 | 3 : 1 |
| Pjūvis kas | 10 ft | 5 m |

## Vamzdynų tinklas

| Nustatymas | US feet | Metrai |
|---|---|---|
| Pavadinimas ir tipas | Lietaus nuotekos, lietaus nuotekos | Lietaus nuotekos, lietaus nuotekos |
| Mažiausias nuolydis (vietos rezervuotojas) | 0.50% | 0.50% |
| Mažiausias gruntas virš vamzdžio (vietos rezervuotojas) | 2 ft | 0.6 m |
| Kritimas šachtose (vietos rezervuotojas) | 0.10 ft | 0.03 m |
| Naujos šachtos skersmuo | 48 in | 1200 mm |
| Naujo vamzdžio skersmuo | 12 in | 300 mm |
| Nusėdimo duobės gylis | 0 | 0 |
| Šachtos dangtis | Nuo paviršiaus | Nuo paviršiaus |

Vamzdynų tinklas, atidarytas iš LandXML, taip pat naudoja šias taisykles, nes LandXML jų neperduoda.

## Tūriai

| Nustatymas | Reikšmė |
|---|---|
| Būdas | Tinklelis, bandoma ląstelių centruose išėjimo linijų viduje |
| Ląstelės dydis | Parenkamas taip, kad apribojantis stačiakampis apie suformuotą plotą laikytų apie 250,000 ląstelių (1, 2 arba 5 kartus dešimties laipsnis) |
| Išsipūtimas ir susitraukimas | Nėra |

## Spausdinimas

| Nustatymas | Reikšmė |
|---|---|
| Sritis | {{ui:Viskas}} |
| Popierius | Tabloid 11 × 17 in (pėdų projektai), ISO A3 (metrų projektai); visada gulsčias |
| Mastelis | Didžiausias pateiktas mastelis, kuris telpa |
| Spalvos | {{ui:Sluoksnių spalvos}} |

DXF žymos dydžiuojamos mastelyje, kuriame viskas telpa Tabloid (pėdos) arba A3 (metrai) formate.
