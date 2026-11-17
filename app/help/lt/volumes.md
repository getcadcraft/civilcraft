---
title: "Žemės darbų tūriai"
summary: "Skaitykite iškasimo, įpylimo ir grynuosius tūrius tarp esamos žemės ir projektuojamo paviršiaus, pagal aikštelę ir koridorių bei iš viso, ir suprask tūrių skaičiavimo tinklelio metodą."
keywords: "tūriai, žemės darbai, iškasimas, įpylimas, grynasis, iškasimas ir įpylimas, kiekiai, tinklelio metodas, paviršių palyginimas, tūrių paviršius, kubiniai jardai, kubiniai metrai"
from: 299d7bc7
---

Kai aikštelė ar koridorius vertikaliai suplanuojami be problemų, CivilCraft palygina projektuojamą paviršių su esama žeme ir pateikia iškasimą bei įpylimą. Skaičiai atnaujinami su kiekvienu pakeitimu.

## Kur juos skaityti

- **Žemės darbai** dešiniajame skydelyje, kai nieko nepasirinkta (rodinys **Projektas**) ir yra bent viena aikštelė ar vienas koridorius.
- **Žemės darbai** dešiniajame skydelyje, kai pasirinkta aikštelė (tie patys bendri rezultatai visam projektui).
- Eilutė po koridoriaus parametrais, su to koridoriaus iškasimu ir įpylimu.

**Žemės darbų** blokas rodo:

- **Iškasimas**, **Įpylimas** ir **Grynasis** (su „įpylimas“ arba „iškasimas“ po jo, kuris didesnis)
- eilutę kiekvienam elementui, kai jų daugiau nei vienas, pavyzdžiui „Aikštelė 1: iškasimas 120.4 cu yd, įpylimas 310.2 cu yd“
- metodo eilutę: „Tinklelio metodas: esama žemė ir suplanuotas paviršius imami kas 0.5 ft ribinėse linijose (92,891 langeliai). Brinkimas ar traukimasis netaikomas.“

Tūriai pateikiami kubiniais jardais pėdų projekte ir kubiniais metrais metrų projekte.

## Siųsti į TakeoffCraft

Norėdami įvertinti žemės darbus, **Žemės darbų** bloko apačioje pasirinkite {{ui:Siųsti į TakeoffCraft}}. CivilCraft įrašo kiekių failą (`<site>.quantities.json`) su dviem kiekiais: iškasimu ir įpylimu kubiniais jardais (pėdų projektas) arba kubiniais metrais (metrų projektas), tais pačiais skaičiais kaip blokas, iki šimtųjų dalių. Atidarykite jį TakeoffCraft su **Atidaryti kiekių skaičiavimą** arba įvilkite jį ten: jie tampa dviem elementais, kuriuos galite įkainoti ([Iškasimas ir įpylimas iš CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Pakeitus duomenis, siųskite dar kartą ir atidarykite naują failą: tie patys elementai gauna naujus skaičius.

Siunčiami tik bendrieji rezultatai, todėl nieko nesiskaičiuoja dukart; failo pastaboje išvardijami kiekvienos aikštelės ir koridoriaus iškasimas ir įpylimas.

## Kaip jie skaičiuojami

CivilCraft naudoja **tinklelio metodą**:

1. Plotas ribinėse linijose uždengiamas kvadratinių langelių tinkleliu.
2. Kiekvieno langelio centre imami abiejų paviršių mėginiai.
3. Kiekvienas langelis skaičiuojamas kaip prizmė: aukščių skirtumas padaugintas iš langelio ploto. Kur projektuojamas paviršius žemesnis, tai iškasimas; aukštesnis – įpylimas.
4. Langeliai sudedami.

Langelio dydis parenkamas automatiškai, kad stačiakampis aplink vertikaliai suplanuotas dalis turėtų apie 250,000 langelių, suapvalintas iki tvarkingos reikšmės (1, 2 arba 5 kartus dešimties laipsnis). Patys jo dar negalite nustatyti. Metodo eilutėje nurodomas dydis ir langelių skaičius. Mažesni langeliai tiksliau atvaizduoja kraštus; pilnuose langeliuose tarp plokščių plokštumų rezultatas tikslus.

## Verta žinoti

- Skaičiuojamas tik plotas ribinėse linijose. Žemė už jų nekeičiama.
- Aikštelė ar koridorius su problema neįtraukiami į vertikalų planavimą ir nieko nepridedama. Jei blokas rodo „Tūrių dar nėra: aikštelė turi būti planuojama be problemų.“, ieškokite raudono langelio virš jo.
- Kur elementai persidengia, vėlesnis pakeičia ankstesnį savo ribinėje linijoje, o persidengimo dalis skaičiuojama vieną kartą.
- Brinkimo ar traukimosi koeficientas netaikomas. Jei reikia tūrių natūralioje, pabirioje ar suspaustoje būsenoje, rezultatus padauginkite patys.
- Humuso nuėmimas, dangos ir pagrindo gylis bei TIN–TIN prizmių tūriai dar nepasiekiami.

## Rezultato tikrinimas

- Įjunkite {{ui:Projektuojamas (su nuolydžiais)}} skiltyje **Rodymas** ir pažiūrėkite horizontales ribinėse linijose.
- Pelės žymeklį perkelkite per suplanuotą plotą: būsenos juostoje rodoma **Žemė** ir **Suplanuota**. Skirtumas yra iškasimo ar įpylimo gylis toje vietoje.
- Koridoriui profilio rodinio rodmenys rodo iškasimą arba įpylimą ašyje kiekvienoje stotyje.
