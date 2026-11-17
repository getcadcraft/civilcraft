---
title: Jedinice, stacionaže i formati brojeva
summary: Projekti u stopama i metrima, kako se pišu i unose stacionaže, nagibi, bočni nagibi, pravci, površine, zapremine i prečnici cevi, i šta menjanje jedinica radi.
keywords: unos dužine, aritmetika, kalkulator, zbir, razlomak, stope i inči, 4+7/16, jedinice, stope, US survey stope, metri, metrički, imperijalni, format stacionaže, stacionaža, nagib, procenat, bočni nagib, h:v, pravac, kubni jardi, prečnik
from: 0b9b5b6b
---

## Jedinice projekta

Projekat je u **US stopama** ili **metrima** (**Jedinice** u levom panelu). Svaka koordinata, kota, dužina i stacionaža u projektu je u toj jedinici.

:::warning
Promena **Jedinica** menja natpise, format stacionaže, podrazumevane vrednosti i način upisa datoteka. **Ne** pretvara nijedan broj. Lokacija izmerena u stopama, koja se prebaci na metre, zadržava iste brojeve, sada čitane kao metri. Statusna traka kaže „Jedinice su sada metri. Koordinate nisu pretvorene.“ Podesite jedinice da odgovaraju vašim podacima pre projektovanja.
:::

Šta zavisi od jedinica:

| | US stope | Metri |
|---|---|---|
| Format stacionaže | `12+34.56` (stacionaže od 100 ft) | `1+234.567` (stacionaže od 1000 m) |
| Ponuđeni intervali izohipsi | 0.25 do 20 ft | 0.1 do 10 m |
| Površina | sq ft | sq m |
| Zapremina | cu yd | cu m |
| Prečnik cevi i objekta | inči | milimetri |
| Podrazumevani poluprečnik krivine | 100 ft | 30 m |
| Oznake stacionaže na planu | na svakih 50 ft, natpisi na svakih 100 ft | na svakih 20 m, natpisi na svakih 100 m |
| Razmere štampe | 1" = 5' do 1" = 1000' | 1:50 do 1:10000 |
| Jedinica dužine u LandXML-u | USSurveyFoot | meter |

Novi projekat počinje u stopama, ili u metrima kada je metrička dužinska jedinica označena zvezdicom u {{ui:Podešavanja}} › {{ui:Opšte}} › {{ui:Jedinice}}. Lista **Jedinice** prikazuje jedinice uključene tamo, i uvek jedinicu samog projekta. Sa jedinicom površine ili zapremine označenom zvezdicom tamo (akri, hektari, akro-stope …), površine i zapremine se izveštavaju u njoj umesto u kolonama iznad. Pogledajte [Jedinice, unete vrednosti i liste jedinica](common:unit-lists).

Kada otvorite LandXML, projekat preuzima jedinice datoteke. Datoteka u međunarodnim stopama otvara se kao projekat u stopama; brojevi se ne menjaju.

## Unos dužina i zbirova

Svako polje koje prima dužinu ili kotu čita više od običnog broja: pritisnite {{key:Enter}} i polje prikazuje rezultat u jedinicama projekta.

| Unosite | U projektu u stopama | U projektu u metrima |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | iste dužine u metrima |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | u stopama | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, a ostali u US survey stopama | iste dužine u metrima |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | zbir, u stopama | zbir, u metrima |

Radi bilo koja oznaka dužine iz zajedničke tabele jedinica, sa tačnom veličinom. Stope projekta su US survey stope, pa je `10 US ft` jednako 10, a `3 ch` (lanac sa međunarodnom stopom) je 197.9996. Koristite `+ - * /` i zagrade, kao i `abs`, `round`, `ceil` i `floor`. Crtica upisana u dužinu je njen deo (`24'-6"`, `6-1/2`); sa razmacima oko nje, ona oduzima (`24' - 6"` = 23.5 ft). Običan broj množi ili deli dužinu, a kada se doda dužini, on je dužina u jedinicama projekta. Ako CivilCraft ne može da pročita ono što ste uneli, polje se označava, a statusna traka kaže gde je greška.

Stacionaže nisu zbirovi: `10+00` u polju stacionaže je stacionaža 10+00. Nagibi u procentima, brojevi tačaka i opisi čitaju se onako kako su napisani.

## Stacionaže

Stacionaža je rastojanje duž osovine trase, napisano sa znakom plus:

- Stope: deo pre plusa su stotine stopa. `12+34.56` je 1,234.56 ft.
- Metri: deo pre plusa su hiljade metara. `1+234.567` je 1,234.567 m.
- Negativne stacionaže zadržavaju znak ispred: `-0+50.00`.

Gde god unosite stacionažu (**Početna stacionaža**, **Stacionaža** PVI-a), možete je uneti sa plusom (`12+34.56`) ili kao običan broj (`1234.56`). Razmaci se ignorišu.

## Nagibi i bočni nagibi

- **Nagibi** (profili, cevi, nagibi trake i bankine) su u procentima: `+1.25%` raste uz stacionažu, `-0.50%` pada.
- **Bočni nagibi** (iskop i nasip platoa, iskop i nasip koridora) su horizontalno prema vertikalnom: `3` znači 3 : 1, tri jedinice vodoravno za jednu nagore ili nadole.
- **K** za vertikalnu krivinu je njena dužina podeljena promenom nagiba u procentima.

## Pravci i uglovi

Pravci su kvadrantni pravci u stepenima, minutama i sekundama: `N 63°12'05" E`. Skretanja krivina (Δ) koriste iste stepene, minute i sekunde, sa „levo“ ili „desno“.

## Odstupanja

Odstupanja od osovine trase su normalna rastojanja na nju, označena **L** (levo) ili **R** (desno) gledajući uz stacionažu.

## Prikaz brojeva

- Koordinate i kote prikazuju 2 decimale u panelima i statusnoj traci (3 za izabranu geodetsku tačku).
- Površine i zapremine su grupisane po hiljadama: `128,250 sq ft`, `454.9 cu yd`.
- Koordinate se nikada ne grupišu, pa se mogu kopirati onakve kakve jesu.

## Koordinate

CivilCraft radi u ravnoj ravni: istok udesno, sever nagore. Projektantski rad se uvek odvija u projektovanim koordinatama (državna ravan, UTM ili lokalna mreža). Možete reći CivilCraft-u u kom su koordinatnom sistemu i da li su mrežne, terenske ili lokalne koordinate; tada prikazuje geografsku širinu i dužinu i postavlja GIS datoteke i slojeve karte, ali nikada ne menja jedinice niti pomera vaše koordinate sam od sebe. Pogledajte [Podešavanje koordinatnog sistema projekta](topic:coordinate-systems) i [Terenske i lokalne koordinate](topic:ground-and-local-coordinates). Velike vrednosti državne ravni (milioni stopa) su u redu; CivilCraft interno radi relativno u odnosu na lokaciju da bi očuvao tačnost.
