---
title: Inžineriniai tinklai ir OpenStreetMap
summary: Vandens, nuotekų, lietaus, dujų, elektros ir telekomunikacijų linijos su medžiaga, dydžiu, gaubimu ir savininku; OpenStreetMap duomenys iš Overpass JSON failo; kirtimai, tranšėjų pjūviai ir tūriai; paslaugų sluoksniai DWG, DXF ir PDF formatais; IFC vamzdžių ir kabelių segmentai.
keywords: inžinerinis tinklas, tinklai, tinklas, osm, openstreetmap, overpass, vamzdis, kabelis, dujos, nuotekos, lietaus, telekomunikacijos, elektra, vanduo, hidrantas, šulinys, tranšėja, kirtimas, atstumas, gaubimas, gylis, dwg, ifc, georeferencinis, sluoksniai
from: 8a85dace
---

Nubrėžkite vietovės požeminius paslaugų tinklus – po vieną tinklą kiekvienai paslaugai, patikrinkite, kur jie kertasi, ir eksportuokite juos kaip brėžinio sluoksnius bei IFC formatu.

## Kurti linijas

Atidarykite **Paviršius, Daugiau, Inžineriniai tinklai...**

- **Sukurti liniją iš pasirinkimo** pasirinktą trasą, elementų liniją ar vamzdį paverčia pasirinktos paslaugos linija. Tada lentelėje įveskite medžiagą, dydį (mm), gaubimą (gylį iki vamzdžio ar kabelio viršaus) ir savininką.
- **Nuskaityti OpenStreetMap duomenis** nuskaito jūsų išsaugotą Overpass JSON failą (užklausą su `out geom;`). Pirmiausia projektui reikia koordinačių sistemos, nes OpenStreetMap padėtys yra platuma ir ilguma. Nuskaitomi vamzdynai (pagal medžiagą), požeminiai elektros ir telekomunikacijų kabeliai, hidrantai, šuliniai ir lietaus nuotekų linijos; viskas kita skaičiuojama kaip praleista ir nurodoma pranešime. Oro linijos praleidžiamos.
- **Pridėti OpenStreetMap žemėlapį** prideda OpenStreetMap žemėlapį po planu. Jis rodomas tik tada, kai parametruose įjungti interneto žemėlapių sluoksniai.

## Patikros ir rezultatai

- **Kirtimai**: skirtingų paslaugų linijos, kertančios planą, išvardijamos su laisvu aukščiu tarp jų, kai yra žemės paviršius; minimumas yra jūsų nustatoma vieta, o ne standarto skaičius.
- **Tranšėja**: kiekviena linija gauna tranšėją (vamzdžio dydis ir laisvas tarpas abiejose pusėse, šlaito nuolydis, pagrindas) su tūriu. Bendra suma rodoma lange ir CSV faile.
- **Brėžinys**: linijos ir taškai yra paslaugų sluoksniuose (pavyzdžiui, U-WATR-RUN, U-POWR-RUN), todėl patenka į PDF, DXF ir DWG.
- **IFC**: linijos eksportuojamos į IFC kaip vamzdžių ir kabelių segmentai kartu su hidrantais, vožtuvais ir kameromis, po vieną sistemą kiekvienai paslaugai, projekto koordinačių sistemoje.

## OpenStreetMap duomenys

OpenStreetMap duomenų autorių teisės priklauso OpenStreetMap bendruomenei, jie licencijuojami pagal ODbL. Priskyrimas pridedamas prie brėžinio, CSV ir IFC. Jei bendrinate failą, kuriame yra OpenStreetMap duomenų, išsaugokite priskyrimą ir perskaitykite licencijos sąlygas dėl bendrinimo tokiomis pačiomis sąlygomis (share-alike).

## Kas dar neatlikta

Linijos plane dar nebraižomos taškas po taško su įrankiu, o kirtimai dar nerodomi profilio rodinyje (skaičiavimas jau sukurtas). Gyliai, dydžiai ir atstumai iš pradžių yra vietos reikšmės: naudokite savo standarto skaičius.
