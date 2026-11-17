---
title: Taškų failų formatai
summary: Stulpelių tvarka, kurią skaito CivilCraft, kaip ji randa skirtuką ir antraštės eilutę, kokius antraščių pavadinimus atpažįsta ir kaip tikrinamos eilutės.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, taškų failo formatas, stulpeliai, antraštė, skirtukas
from: 84fab42e
---

Taškų failas yra paprastas tekstas, po vieną tašką eilutėje. CivilCraft jį skaito naršyklėje; niekas neįkeliama.

## Stulpelių tvarka

Raidės nurodo stulpelius iš kairės į dešinę: **P** taško numeris ar pavadinimas, **N** šiaurinė koordinatė, **E** rytinė koordinatė, **Z** aukštis, **D** aprašymas.

| Tvarka | Stulpeliai | Pavyzdinė eilutė |
|---|---|---|
| PNEZD | taškas, šiaurė, rytai, aukštis, aprašymas | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | taškas, rytai, šiaurė, aukštis, aprašymas | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | taškas, šiaurė, rytai, aukštis | `101,2080000.00,6150000.00,250.00` |
| PENZ | taškas, rytai, šiaurė, aukštis | `101,6150000.00,2080000.00,250.00` |
| NEZD | šiaurė, rytai, aukštis, aprašymas | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | rytai, šiaurė, aukštis, aprašymas | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | šiaurė, rytai, aukštis | `2080000.00 6150000.00 250.00` |
| ENZ | rytai, šiaurė, aukštis | `6150000.00 2080000.00 250.00` |

Tvarkos be P taškus sunumeruoja 1, 2, 3 … failo eilės tvarka. X yra rytinė koordinatė, o Y – šiaurinė.

## Skirtukai

CivilCraft pažiūri į pirmas 20 eilučių ir parenka pirmąjį iš šių skirtukų, kuris pasirodo bent 60 % jų: kablelis, tabuliavimas, kabliataškis. Kitu atveju skaido pagal tarpų seką.

- Failuose, atskirtuose kableliais, tabuliavimais ar kabliataškiais, lauke dvigubose kabutėse gali būti skirtukas (`"FL, NORTH"`), o `""` kabutėse reiškia vieną kabutę.
- Failuose, atskirtuose tarpais, eilutės pabaigos aprašyme gali būti tarpų: viskas po paskutinio koordinačių stulpelio yra aprašymas.
- Eilutės, prasidedančios `#`, `;` ar `//`, ir tuščios eilutės praleidžiamos.
- Baitų tvarkos žymė failo pradžioje ignoruojama.

## Antraštės eilutė

Pirmoji eilutė laikoma antraštės eilute, kai mažiau nei dviejuose jos laukuose yra skaičiai. Jei visi antraštės laukai yra pavadinimai, kuriuos CivilCraft atpažįsta, stulpelių tvarka imama iš jos („iš antraštės eilutės“). Pavadinimai atitinkami nepaisant raidžių dydžio, tarpų, taškų, pabraukimų, brūkšnelių ir skliaustų:

| Stulpelis | Atpažįstami pavadinimai |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Jei kuris nors antraštės pavadinimas neatpažintas arba pavadinimai nesudaro vienos iš aštuonių tvarkų, antraštė praleidžiama, o tvarka spėjama pagal stulpelių skaičių.

:::warning
Antraštė, kurioje nurodytas ir platumos stulpelis (`lat`, `latitude`), ir ilgumos stulpelis (`lon`, `long`, `longitude`), skaitoma kaip laipsniai, o ne kaip šiaurinė ir rytinė koordinatės. Atliekant {{ui:Importuoti}}, taškai konvertuojami per projekto koordinačių sistemą, o projektas be jos pirmiausia paklausia, kurią pasirinkti. Eilutės, esančios už ±90° platumos ar ±180° ilgumos ribų, atmetamos. Žr. [GIS duomenų importas](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Spėjimas pagal stulpelių skaičių

Kai nėra tinkamos antraštės ir **Stulpeliai** paliktas ties {{ui:Aptikti}}:

- 5 ar daugiau stulpelių: PNEZD.
- 4 stulpeliai: PNEZ, kai pirmasis stulpelis kiekvienoje patikrintoje eilutėje yra sveikasis skaičius, o ketvirtasis – skaičius; kitu atveju NEZD.
- 3 stulpeliai: NEZ.

PNEZD ir PENZD iš skaičių atskirti negalima. Spėjimas seka **Taškų eilutes** iš [CivilCraft parametrų](topic:settings): P, N, E, Z, D pradžioje arba P, E, N, Z, D (tuomet keturi stulpeliai skaitomi kaip PENZ, o trys – kaip ENZ). Dialogas sako „spėta pagal stulpelių skaičių – patikrinkite, ar šiaurinė ir rytinė koordinatės nesukeistos“. Jei peržiūra atrodo neteisingai, pasirinkite tinkamą tvarką lauke **Stulpeliai**.

## Kaip tikrinamos eilutės

- Eilutėje aprašymas gali būti praleistas.
- Šiaurinė ir rytinė koordinatės turi būti skaičiai. Aukštis gali būti tuščias (taškas paliekamas, bet paviršiuje nenaudojamas).
- Taško numeris gali būti bet koks tekstas (taip pat raidės, pavyzdžiui, `CP1`), bet ne tuščias.
- Jei taško numeris kartojasi, paliekama pirmoji eilutė, o kitos įrašomos kaip neperskaitytos.
- Aprašymai išlaikomi iki 200 simbolių; valdymo simboliai pakeičiami tarpais.
- Dialogui išlaikoma iki 200 neperskaitytų eilučių (rodoma 25), ir visos jos suskaičiuojamos.

## Taškų grupės

Taško grupė yra pirmasis jo aprašymo žodis didžiosiomis raidėmis. „GRD“, „grd shot“ ir „Grd“ visi yra grupė GRD. Taškas be aprašymo patenka į „(be aprašymo)“. Žr. [Matavimo taškų importas](topic:import-points).

## Taškų rašymas

CivilCraft kol kas netaiko taškų tekstinio failo eksporto. Taškai eksportuojami LandXML (kaip CgPoints), projekto faile ir per GIS {{ui:Eksportuoti}} kaip shapefile, GeoPackage ar GeoJSON su laukais P, N, E, Z ir D ([Eksportuoti as-built duomenis į GIS](topic:gis-export)). Žr. [Dar neįgyvendinta](topic:not-built-yet).
