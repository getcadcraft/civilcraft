---
title: Jedinice, stacionaža i formati brojeva
summary: Projekti u stopama i metrima, kako se pišu i unose stacionaže, nagibi, bočni nagibi, azimuti, površine, zapremine i prečnici cijevi, te šta promjena jedinica radi.
keywords: unos dužine, aritmetika, kalkulator, zbir, razlomak, stope i inči, 4+7/16, jedinice, stope, američke geodetske stope, metri, metrički, imperijalni, format stacionaže, stacioniranje, nagib, procenat, bočni nagib, h:v, smjerni ugao, kubni jardi, prečnik
from: 0b9b5b6b
---

## Jedinice projekta

Projekat je u **američkim stopama** ili **metrima** (**Jedinice** u lijevom panelu). Svaka koordinata, kota, dužina i stacionaža u projektu je u toj jedinici.

:::warning
Promjena **Jedinica** mijenja oznake, format stacionaže, standardne vrijednosti i način pisanja datoteka. Ona **ne** pretvara nijedan broj. Lokacija izmjerena u stopama i prebačena na metre zadržava iste brojeve, sada čitane kao metri. Statusna traka kaže „Jedinice su sada metri. Koordinate nisu pretvorene.“ Podesi jedinice da odgovaraju tvojim podacima prije projektovanja.
:::

Šta zavisi od jedinica:

| | Američke stope | Metri |
|---|---|---|
| Format stacionaže | `12+34.56` (stacionaže od 100 ft) | `1+234.567` (stacionaže od 1000 m) |
| Ponuđeni razmaci izohipsi | 0.25 do 20 ft | 0.1 do 10 m |
| Površina | kv. ft | kv. m |
| Zapremina | kub. yd | kub. m |
| Prečnik cijevi i konstrukcije | inči | milimetri |
| Standardni poluprečnik krivine | 100 ft | 30 m |
| Oznake stacionaže na planu | svakih 50 ft, natpisi svakih 100 ft | svakih 20 m, natpisi svakih 100 m |
| Razmjere štampanja | 1" = 5' do 1" = 1000' | 1:50 do 1:10000 |
| Linearna jedinica LandXML-a | USSurveyFoot | meter |

Novi projekat počinje u stopama, ili u metrima kad je dužinska jedinica označena zvjezdicom u {{ui:Postavke}} › {{ui:Opšte}} › {{ui:Jedinice}} metrička. Lista **Jedinice** prikazuje jedinice uključene tamo, i uvijek jedinicu samog projekta. Kad je tamo označena jedinica površine ili zapremine (jutra, hektari, kub. stope …), površine i zapremine se prijavljuju u njoj umjesto u kolonama iznad. Vidi [Jedinice, uneseni brojevi i liste jedinica](common:unit-lists).

Kad otvoriš LandXML, projekat preuzima jedinice datoteke. Datoteka u međunarodnim stopama otvara se kao projekat u stopama; brojevi se ne mijenjaju.

## Unos dužina i zbirova

Svako polje koje prima dužinu ili kotu čita više od običnog broja: pritisni {{key:Enter}} i polje prikazuje rezultat u jedinicama projekta.

| Upisuješ | U projektu u stopama | U projektu u metrima |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | iste dužine u metrima |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | u stopama | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, a ostale u američkim geodetskim stopama | iste dužine u metrima |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | zbir, u stopama | zbir, u metrima |

Svaka oznaka dužine iz zajedničke tabele jedinica radi, s tačnom veličinom: stope projekta su američke geodetske stope, pa je `10 US ft` 10, a `3 ch` (lanac međunarodne stope) je 197.9996. Koristi `+ - * /` i zagrade, te `abs`, `round`, `ceil` i `floor`. Crtica upisana u dužinu je dio nje (`24'-6"`, `6-1/2`); sa razmacima oko nje, oduzima se (`24' - 6"` = 23.5 ft). Običan broj množi ili dijeli dužinu, a kad se doda dužini, on je dužina u jedinicama projekta. Ako CivilCraft ne može pročitati ono što si upisao, polje se označi, a statusna traka kaže gdje je greška.

Stacionaže nisu zbirovi: `10+00` u polju za stacionažu je stacionaža 10+00. Nagibi u procentima, brojevi tačaka i opisi čitaju se onako kako su napisani.

## Stacionaža

Stacionaža je udaljenost duž ose trase, zapisana sa znakom plus:

- Stope: dio prije plusa su stotine stopa. `12+34.56` je 1,234.56 ft.
- Metri: dio prije plusa su hiljade metara. `1+234.567` je 1,234.567 m.
- Negativne stacionaže zadržavaju znak ispred: `-0+50.00`.

Gdje god upisuješ stacionažu (**Početna stacionaža**, **Stacionaža** PVI-ja), možeš je upisati s plusom (`12+34.56`) ili kao običan broj (`1234.56`). Razmaci se ignorišu.

## Nagibi

- **Nagibi** (profili, cijevi, nagibi traka i bankina) su u procentima: `+1.25%` raste u smjeru stacionaže, `-0.50%` opada.
- **Bočni nagibi** (iskop i nasip platoa, iskop i nasip koridora) su horizontalno prema vertikalnom: `3` znači 3 : 1, tri jedinice vodoravno za jednu nagore ili nadole.
- **K** za vertikalnu krivinu je njena dužina podijeljena promjenom nagiba u procentima.

## Smjerni uglovi i uglovi

Smjerni uglovi su kvadrantni smjerni uglovi u stepenima, minutama i sekundama: `N 63°12'05" E`. Skretanja krivina (Δ) koriste iste stepene, minute i sekunde, uz „lijevo“ ili „desno“.

## Odmaci

Odmaci od ose trase su udaljenosti normalne na nju, označene **L** (lijevo) ili **R** (desno) gledajući u smjeru stacionaže.

## Prikaz brojeva

- Koordinate i kote prikazuju 2 decimale u panelima i statusnoj traci (3 za odabranu geodetsku tačku).
- Površine i zapremine grupišu se po hiljadama: `128,250 sq ft`, `454.9 cu yd`.
- Koordinate se nikad ne grupišu, pa se mogu kopirati onakve kakve jesu.

## Koordinate

CivilCraft radi u ravnoj ravni: istok udesno, sjever gore. Projektantski rad uvijek se odvija u projektovanim koordinatama (državna ravnina, UTM ili lokalna mreža). Možeš reći CivilCraftu u kojem su koordinatnom sistemu, i da li su mrežne, terenske ili lokalne koordinate; tada prikazuje geografsku širinu i dužinu i postavlja GIS datoteke i slojeve karte, ali nikad sam ne mijenja jedinice niti pomjera tvoje koordinate. Vidi [Postavi koordinatni sistem projekta](topic:coordinate-systems) i [Terenske i lokalne koordinate](topic:ground-and-local-coordinates). Velike vrijednosti državne ravnine (milioni stopa) su u redu; CivilCraft interno radi relativno u odnosu na lokaciju da bi zadržao preciznost.
