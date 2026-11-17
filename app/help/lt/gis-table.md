---
title: Darbas su sluoksnio atributų lentele
summary: Peržiūrėkite kiekvieną GIS sluoksnio objektą lentelėje, rikiuokite ir filtruokite, pasirinkite eilutes ir objektus kartu, taisykite reikšmes, pridėkite laukus, skaičiuokite naujas reikšmes ir išsaugokite lentelę kaip CSV.
keywords: atributų lentelė, lentelė, laukai, stulpeliai, eilutės, rikiavimas, filtras, išraiška, pasirinkimas, redagavimas, lauko skaičiuoklė, skaičiuoti, pridėti lauką, pervadinti lauką, pašalinti lauką, csv, eksportas, gis, shapefile, geopackage, simbolika
from: fd9d6c11
---

Lentelę atidarykite iš sluoksnio **trijų taškų** meniu GIS sluoksnių sąraše ({{ui:Atributų lentelė…}}), iš Paviršius › Daugiau › {{ui:Atributų lentelė}} arba įvedę `ATTRIBUTES`, `ATTTABLE` arba `TABLE`. Lentelė atsiveria šalia plano ir lieka atidaryta, kol dirbate. Piešiamos tik matomos eilutės, todėl sluoksnis su tūkstančiais objektų atsidaro ir slenka greitai.

## Rikiuoti, filtruoti ir pasirinkti

- **Rikiavimas:** spustelėkite stulpelio antraštę. Antras paspaudimas apverčia tvarką, trečias grąžina failo tvarką. Tuščios reikšmės visada lieka apačioje. Rikiavimas keičia tik tai, ką matote, niekada ne sluoksnį.
- **Filtravimas:** rašykite filtro lauke. Išraiška, pavyzdžiui, `AREA > 500 and USE = 'Res'`, palieka eilutes, kuriose ji teisinga (tie patys žodžiai kaip skirtuke Pasirinkimas, žr. [Analizuoti GIS sluoksnius](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Tekstas, kuris nėra išraiška, pavyzdžiui `oak maple`, ieškomas tų žodžių kiekviename stulpelyje.
- **Eilučių pasirinkimas:** spustelėkite eilutę. Ctrl+spustelėjimas prideda arba pašalina vieną eilutę, Shift+spustelėjimas pasirenka seką, o {{ui:Pasirinkti rodomas eilutes}} pažymi kiekvieną eilutę, kuri praeina filtrą. Pasirinkti objektai piešiami plane, o spustelėjimas ant objekto plane pasirenka jo eilutę čia.
- Su pažymėtomis eilutėmis galite {{ui:Keisti mastelį}} į jas, sukurti **sluoksnį iš pasirinkimo** ir perskaityti bendrą plotą ar ilgį būsenos eilutėje.

## Reikšmių taisymas

Dukart spustelėkite langelį (arba judėkite rodyklių klavišais ir paspauskite Enter), įveskite naują reikšmę ir paspauskite Enter. Esc palieka viską kaip buvo. Reikšmė turi tikti stulpeliui: skaičiai kaip skaičiai, datos kaip `YYYY-MM-DD`, taip/ne kaip yes, no, true arba false. Reikšmė, kuri netinka, atmetama su sakiniu ir nieko nepasikeičia. Tuščias langelis padaro reikšmę tuščią. Kiekvienas pakeitimas yra vienas anuliavimo žingsnis: {{ui:Anuliuoti}} ir {{ui:Perdaryti}} yra lentelės apačioje, o Ctrl+Z veikia plane.

## Laukai

Skiltyje **Laukai** galite pridėti lauką (tekstinį, skaitinį, datos arba taip/ne), pervadinti arba pašalinti. Naujas laukas prasideda tuščias. Pervadinimas seka visur: sluoksnio etikečių laukas ir [stilius pagal atributą](topic:gis-symbology) persikelia į naują pavadinimą, o pašalinus lauką, etiketė ir stilius, kurie jį naudojo, dingsta. Kiekvienas veiksmas yra vienas anuliavimo žingsnis, kuris viską atkuria.

## Lauko skaičiuoklė

Įrašo reikšmę į kiekvieną eilutę (arba tik į pažymėtas eilutes) pagal kitus eilutės laukus, jos geometriją ir kelias funkcijas. Pasirinkite esamą lauką arba **Naujas laukas…** ir suteikite jam pavadinimą bei tipą. Niekas nevykdoma kaip kodas: išraišką skaito mažas analizatorius su fiksuotu funkcijų sąrašu.

| Grupė | Žodžiai |
|---|---|
| Skaičiai | `+ - * /`, skliaustai, `abs round(x, digits) floor ceil sqrt pow min max` |
| Tekstas | `upper lower trim len substr(text, from, count) left right replace concat` (tekstas rašomas 'viengubose kabutėse'; lauko pavadinimas su tarpais rašomas "dvigubose kabutėse" arba [laužtiniuose skliaustuose]) |
| Pasirinkimas | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datos | `year month day` reikšmei `YYYY-MM-DD` |
| Geometrija | `$area $perimeter $length $x $y $vertices`, projekto vienetais |

Rezultatas, kurio negalima įrašyti lauko tipu (pavyzdžiui, tekstas skaitiniame lauke), paliekamas tuščias ir suskaičiuojamas pranešime. Dalyba iš nulio duoda tuščią reikšmę. Pavyzdžiui, `round($area / 43560, 2)` įrašo akrus iš kvadratinių pėdų.

## Eksportas

{{ui:Eksportuoti CSV}} išsaugo jūsų matomas eilutes (po filtro ir rikiavimo) kaip UTF-8 CSV failą su lauko pavadinimais pirmoje eilutėje. Tekstas, prasidedantis `=`, `+`, `-` arba `@`, gauna pirmaujantį apostrofą, kad skaičiuoklė jo nevykdytų kaip formulės. Norėdami išsaugoti patį sluoksnį, naudokite [Faktinių (as-built) duomenų eksportas į GIS](topic:gis-export).

## Apribojimai

Lentelė rodo sluoksnį vienos rikiavimo tvarkos ir vieno filtro vienu metu. Eilučių čia pridėti ar ištrinti negalima (vietoj to sukurkite naują sluoksnį iš pasirinkimo), geometrija nekeičiama, o lauko tipo pakeisti sukūrus jį negalima.
