---
title: Jedinice, stacionaže i prikaz brojeva
summary: Projekti u US ft i metrima, kako se pišu i upisuju stacionaže, nagibi, bočni pokosi, smjerni kutovi, površine, volumeni i promjeri cijevi te što promjena jedinica radi.
keywords: upisivanje duljine, aritmetika, kalkulator, zbroj, razlomak, stope i palci, 4+7/16, jedinice, stope, američke stope, metri, metrički, imperijalni, format stacionaže, stacioniranje, nagib, postotak, bočni pokos, h:v, smjerni kut, kubični jardi, promjer
from: 0b9b5b6b
---

## Jedinice projekta

Projekt je u **US ft** ili **metrima** (**Jedinice** na lijevoj ploči). Svaka koordinata, kota, duljina i stacionaža u projektu je u toj jedinici.

:::warning
Promjena **Jedinica** mijenja oznake, format stacionaže, zadane vrijednosti i način zapisa datoteka. **Ne** pretvara nijedan broj. Lokacija izmjerena u US ft i prebačena na metre zadržava iste brojeve, sada pročitane kao metri. Statusna traka kaže: „Jedinice su sada metri. Koordinate nisu pretvorene.“ Prije projektiranja postavite jedinice prema svojim podacima.
:::

Što ovisi o jedinicama:

| | US ft | Metri |
|---|---|---|
| Format stacionaže | `12+34.56` (stacionaže od 100 ft) | `1+234.567` (stacionaže od 1000 m) |
| Ponuđeni razmaci izohipsi | 0.25 do 20 ft | 0.1 do 10 m |
| Površina | sq ft | sq m |
| Volumen | cu yd | cu m |
| Promjer cijevi i građevine | palci (in) | milimetri (mm) |
| Zadani radijus krivulje | 100 ft | 30 m |
| Oznake stacionaže na planu | svakih 50 ft, oznake svakih 100 ft | svakih 20 m, oznake svakih 100 m |
| Mjerila ispisa | 1" = 5' do 1" = 1000' | 1:50 do 1:10000 |
| Linearna jedinica LandXML-a | USSurveyFoot | meter |

Novi projekt počinje u stopama ili, kada je duljinska jedinica označena zvjezdicom u {{ui:Postavke}} › {{ui:Općenito}} › {{ui:Jedinice}} metrička, u metrima. Popis **Jedinice** prikazuje jedinice uključene ondje i uvijek jedinice samog projekta. Ako je tamo označena jedinica površine ili volumena (akri, hektari, akrostope …), površine i volumeni prikazuju se u njoj umjesto u stupcu iznad. Vidi [Jedinice, upisane vrijednosti i popisi jedinica](common:unit-lists).

Kada otvorite LandXML, projekt preuzima jedinice datoteke. Datoteka u međunarodnim stopama otvara se kao projekt u stopama; brojevi se ne mijenjaju.

## Upisivanje duljina i zbrojeva

Svaki okvir koji prima duljinu ili kotu čita više od običnog broja: pritisnite {{key:Enter}} i okvir prikazuje rezultat u jedinicama projekta.

| Upisujete | U projektu u stopama | U projektu u metrima |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | iste duljine u metrima |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | u stopama | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, a ostale u američkim geodetskim stopama | iste duljine u metrima |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | zbroj, u stopama | zbroj, u metrima |

Radi svaka oznaka duljine iz zajedničke tablice jedinica, s točnom veličinom: stope projekta su američke geodetske stope, pa je `10 US ft` jednako 10, a `3 ch` (lanac međunarodnih stopa) jednako je 197.9996. Upotrijebite `+ - * /` i zagrade te `abs`, `round`, `ceil` i `floor`. Crtica upisana u duljinu dio je nje (`24'-6"`, `6-1/2`); s razmacima oko nje oduzima se: `24' - 6"` = 23.5 ft. Običan broj množi ili dijeli duljinu, a kada se zbraja s duljinom, to je duljina u jedinicama projekta. Ako CivilCraft ne može pročitati što ste upisali, okvir se označi, a statusna traka kaže gdje.

Stacionaže nisu zbrojevi: `10+00` u okviru za stacionažu je stacionaža 10+00. Nagibi u postotku, brojevi točaka i opisi čitaju se onako kako su upisani.

## Stacionaže

Stacionaža je udaljenost duž osi, zapisana sa znakom plus:

- Stope: dio ispred plusa su stotine stopa. `12+34.56` je 1,234.56 ft.
- Metri: dio ispred plusa su tisuće metara. `1+234.567` je 1,234.567 m.
- Negativne stacionaže zadržavaju predznak ispred: `-0+50.00`.

Gdje god upisujete stacionažu (**Početna stacionaža**, **Stacionaža** PVI-ja), možete je upisati sa plusom (`12+34.56`) ili kao običan broj (`1234.56`). Razmaci se zanemaruju.

## Nagibi i bočni pokosi

- **Nagibi** (profili, cijevi, pokosi kolnika i bankine) izraženi su u postotku: `+1.25%` raste u smjeru stacionaže, `-0.50%` pada.
- **Bočni pokosi** (iskop i nasip platoa, iskop i nasip koridora) izraženi su kao horizontalno prema vertikalno: `3` znači 3 : 1, tri vodoravno za jedan okomito gore ili dolje.
- **K** za vertikalnu krivulju je njezina duljina podijeljena promjenom nagiba u postotku.

## Smjerni kutovi i kutovi

Smjerni kutovi su kvadrantni smjerni kutovi u stupnjevima, minutama i sekundama: `N 63°12'05" E`. Otkloni krivulje (Δ) koriste iste stupnjeve, minute i sekunde, s „lijevo“ ili „desno“.

## Odmaci

Odmaci od osi su okomite udaljenosti od nje, označeni s **L** (lijevo) ili **R** (desno) gledano u smjeru rasta stacionaže.

## Prikaz brojeva

- Koordinate i kote prikazuju 2 decimale na pločama i u statusnoj traci (3 za odabranu geodetsku točku).
- Površine i volumeni grupirani su po tisućama: `128,250 sq ft`, `454.9 cu yd`.
- Koordinate se nikada ne grupiraju, pa se mogu kopirati kakve jesu.

## Koordinate

CivilCraft radi u ravnoj ravnini: istok udesno, sjever gore. Projektiranje se uvijek radi u projiciranim koordinatama (državna ravnina, UTM ili lokalna mreža). Možete reći CivilCraftu u kojem su koordinatnom sustavu i jesu li to mrežne, terenske ili lokalne koordinate; tada prikazuje geografsku širinu i dužinu te postavlja GIS datoteke i karte, ali nikada sam ne mijenja jedinice niti ne pomiče vaše koordinate. Vidi [Postavljanje koordinatnog sustava projekta](topic:coordinate-systems) i [Terenske i lokalne koordinate](topic:ground-and-local-coordinates). Velike vrijednosti državne ravnine (milijuni stopa) su u redu; CivilCraft interno radi relativno prema lokaciji kako bi zadržao preciznost.
