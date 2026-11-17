---
title: Ühikud, pikketid ja arvuvormingud
summary: Jalgade ja meetrite projektid, kuidas pikkusi, pikette, kaldeid, nõlvu, suunanurki, pindalasid, mahte ja torude mõõtmeid kirjutatakse ja sisestatakse ning mida ühikute muutmine teeb.
keywords: pikkuse sisestamine, aritmeetika, kalkulaator, summa, murd, jalad ja tollid, 4+7/16, ühikud, jalad, USA mõõdistusjalad, meetrid, meetermõõdustik, pikkus, pikketi vorming, pikettimine, kalle, protsent, nõlv, h:v, suunanurk, kuupjardid, läbimõõt
from: 0b9b5b6b
---

## Projekti ühikud

Projekt on **US feet**'ides või meetrites (**{{ui:Ühikud}}** vasakul paneelil). Kõik koordinaadid, kõrgusmärgid, pikkused ja pikketid projektis on selles ühikus.

:::warning
**Ühikute** muutmine muudab silte, pikettide vormingut, vaikeväärtusi ja seda, kuidas faile kirjutatakse. See **ei** teisenda ühtegi arvu. Ala, mis on mõõdistatud jalgades ja mis on vahetatud meetriteks, jääb samade arvudega, kuid loetakse nüüd meetritena. Olekuriba ütleb: „Ühikud on nüüd meetrid. Koordinaate ei teisendatud.“ Enne projekteerimist sea ühikud vastavaks oma andmetele.
:::

Mis sõltub ühikutest:

| | US feet | Meetrid |
|---|---|---|
| Pikettide vorming | `12+34.56` (100 ft pikketid) | `1+234.567` (1000 m pikketid) |
| Pakutavad samakõrgusjoonte intervallid | 0.25 kuni 20 ft | 0.1 kuni 10 m |
| Pindala | sq ft | sq m |
| Maht | cu yd | cu m |
| Toru ja rajatise läbimõõt | inches | millimeetrid |
| Vaikimisi kõvera raadius | 100 ft | 30 m |
| Pikettimärgid plaanil | iga 50 ft, sildid iga 100 ft | iga 20 m, sildid iga 100 m |
| Väljatrüki mõõtkavad | 1" = 5' kuni 1" = 1000' | 1:50 kuni 1:10000 |
| LandXML pikkuseühik | USSurveyFoot | meter |

Uus projekt algab jalgades või, kui {{ui:Sätted}} › {{ui:Üldine}} › {{ui:Ühikud}} märgitud pikkuseühik on meetermõõdustiku ühik, meetrites. **Ühikud**-nimekiri näitab seal sisselülitatud ühikuid ja alati projekti enda ühikut. Kui seal on märgitud pindala- või mahuühik (aakrid, hektarid, aakri-jalad …), esitatakse pindalad ja mahud selles ühikus, mitte ülaltoodud veeru järgi. Vt [Ühikud, sisestatud väärtused ja ühikunimekirjad](common:unit-lists).

Kui avad LandXML-faili, võtab projekt faili ühikud. Rahvusvahelistes jalgades fail avaneb jalgade projektina; arve ei muudeta.

## Pikkuste ja summade sisestamine

Iga kast, mis võtab pikkuse või kõrgusmärgi, loeb rohkemat kui lihtsa arvu: vajuta {{key:Enter}} ja kast näitab tulemust projekti ühikutes.

| Sisestad | Jalgade projektis | Meetrite projektis |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | samad pikkused meetrites |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | jalgades | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, ülejäänud USA mõõdistusjalgades | samad pikkused meetrites |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | summa jalgades | summa meetrites |

Töötab iga pikkusmärk ühikute ühisest tabelist täpse suurusega: projekti jalad on USA mõõdistusjalad, seega `10 US ft` on 10 ja `3 ch` (rahvusvahelise jala ahel) on 197.9996. Kasuta `+ - * /` ja sulge ning funktsioone `abs`, `round`, `ceil` ja `floor`. Kriips, mis on kirjutatud pikkuse sisse, kuulub sellesse (`24'-6"`, `6-1/2`); tühikuga eraldatuna lahutab see (`24' - 6"` = 23.5 ft). Lihtne arv korrutab või jagab pikkust ning on projekti ühikutes pikkus, kui see liidetakse pikkusega. Kui CivilCraft ei oska sisestatut lugeda, märgitakse kast ja olekuriba ütleb, kus viga on.

Pikketid ei ole summad: `10+00` pikketi kastis on pikett 10+00. Kalded protsentides, punktinumbrid ja kirjeldused loetakse nii, nagu need on.

## Pikketid

Pikett on kaugus mööda trassi, kirjutatud pluss-märgiga:

- Jalad: pluss-märgi ees olev osa on sadades jalgades. `12+34.56` on 1,234.56 ft.
- Meetrid: pluss-märgi ees olev osa on tuhandetes meetrites. `1+234.567` on 1,234.567 m.
- Negatiivsed pikketid säilitavad märgi ees: `-0+50.00`.

Kuhu iganes pikketi sisestad (**Alguspikett**, PVI **Pikett**), võid selle sisestada pluss-märgiga (`12+34.56`) või lihtsa arvuna (`1234.56`). Tühikuid ignoreeritakse.

## Kallded ja nõlvad

- **Kalded** (profiilid, torud, sõidurea ja õlakalded) on protsentides: `+1.25%` tõuseb pikettide suunas, `-0.50%` langeb.
- **Külgnõlvad** (platvormi kaevis ja täide, koridori kaevis ja täide) on horisontaalne ja vertikaalne suhe: `3` tähendab 3 : 1, kolm horisontaalselt ühe vertikaalse ühiku kohta üles või alla.
- **K** vertikaalkõvera puhul on selle pikkus jagatud kalde muutusega protsentides.

## Suunanurgad ja nurgad

Suunanurgad on kvadrantsuunanurgad kraadides, minutites ja sekundites: `N 63°12'05" E`. Kõverate pöörded (Δ) kasutavad samu kraade, minuteid ja sekundeid koos sõnadega „vasak“ või „parem“.

## Nihked

Nihked trassist on sellega risti olevad kaugused, märgitud **L** (vasak) või **R** (parem), vaadates pikettide suunas.

## Arvude kuvamine

- Koordinaadid ja kõrgusmärgid kuvatakse paneelides ja olekuribal 2 komakohaga (valitud mõõdistuspunkti puhul 3).
- Pindalad ja mahud on rühmitatud tuhandete kaupa: `128,250 sq ft`, `454.9 cu yd`.
- Koordinaate ei rühmitata kunagi, nii et neid saab kopeerida just nagu need on.

## Koordinaadid

CivilCraft töötab lamedal tasapinnal: idasuund paremale, põhjasuund üles. Projekteerimistöö toimub alati projitseeritud koordinaatides (riigi tasandikoordinaadid, UTM või kohalik ruudustik). Saad öelda CivilCraftile, mis koordinaatsüsteemis need on, ning kas need on ruudustiku, maapinna või kohalikud koordinaadid; siis näitab see laiuskraadi ja pikkuskraadi ning paigutab GIS-failid ja kaardikihid, kuid ei muuda kunagi ühikuid ega liiguta koordinaate ise. Vt [Projekti koordinaatsüsteemi määramine](topic:coordinate-systems) ja [Maapinna ja kohalikud koordinaadid](topic:ground-and-local-coordinates). Suured riigi tasandikoordinaatide väärtused (miljonid jalad) on korras; CivilCraft töötab sisemiselt ala suhtes, et säilitada täpsus.
