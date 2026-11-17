---
title: GIS duomenų importavimas
summary: Įkelkite shapefile, GeoJSON ir GeoPackage failus į projektą kaip GIS sluoksnius, išdėstykite juos per tinkamą koordinačių sistemą, peržiūrėkite jų atributus ir naudokite paviršiui.
keywords: gis, etiketės, objektų ženklinimas, atributai plane, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importas, sluoksniai, atributai, koordinačių sistema, epsg, platuma, ilguma, horizontalės, sklypai, lūžio linijos, riba
from: f6b235cc
---

Miestų ir apskričių GIS skyriai pateikia vietovės kontekstą GIS failais: sklypus, servitutus, horizontales, komunalinius tinklus, geodezinio pagrindo taškus. CivilCraft atveria tris jų tipus kaip **GIS sluoksnius**, kurie plane guli po jūsų projektu.

| Failas | Ką atidaryti |
|---|---|
| Shapefile | `.shp` kartu su `.shx`, `.dbf`, `.prj` ir `.cpg` (pažymėkite visus), arba `.zip`, kuriame jie atėjo. Zip su keliais shapefile duoda kelis sluoksnius. |
| GeoJSON | `.geojson` failas (tinka ir `.json` failas, kurio pirmosiose eilutėse yra `FeatureCollection` arba `Feature`). |
| GeoPackage | `.gpkg` failas. Kiekviena objektų lentelė jame išvardijama. |
| KML arba KMZ | `.kml` failas (iš Google Earth ar žiniatinklio žemėlapio) arba suspaustas `.kmz`. Kiekvienas aplankas tampa sluoksniu (skaidomas į taškus, linijas ir poligonus, jei yra kelių tipų); žymės pavadinimas, aprašymas ir papildomi duomenys tampa jos atributais. Aukščiai pateikiami metrais, o koordinatės yra platuma ir ilguma, kaip GeoJSON. |

Skaitomi taškai, daugiataškiai, linijos, poligonai su skylėmis ir daugiadalės figūros, su jų aukščiais (z), kai failas juos turi. Matavimo (M) reikšmės praleidžiamos. Aukščių tinkleliai ir LiDAR atveriami tuo pačiu būdu: žr. [Aukščių tinkleliai ir LiDAR](topic:elevation-grids-and-lidar).

## Failų atidarymas

1. Spustelėkite {{ui:Importuoti}} **GIS** grupėje (arba {{ui:Atidaryti}}), pasirinkite failus arba numeskite juos ant plano. Failai nuskaitomi šiame kompiuteryje; nieko neįkeliama.
2. Dialogas **Importuoti GIS duomenis** išvardija kiekvieną rastą sluoksnį: jo tipą, kiek objektų (ir kiek be geometrijos), kiek atributų laukų ir failo nurodytą koordinačių sistemą. Nuimkite žymę nuo sluoksnių, kurių nenorite.
3. Perskaitykite skyrių **Koordinačių sistema** (žemiau) ir eilutę **Kas bus**, tada spustelėkite {{ui:Importuoti}}.
4. Sluoksniai atsiranda plane ir kairiajame skydelyje skiltyje **GIS sluoksniai**. Importavimas yra vienas žingsnis: {{key:Mod+Z}} jį atšaukia.

Didelis failas rodo eigos eilutę virš plano su mygtuku {{ui:Atšaukti}}.

## Koordinačių sistema

GIS failai nurodo, kur yra, per koordinačių sistemą (shapefile `.prj`, GeoPackage erdvinių nuorodų lentelė; GeoJSON visada yra platuma ir ilguma). CivilCraft kiekvieną sluoksnį konvertuoja iš jo sistemos į projekto sistemą. Ji niekada nespėlioja:

- **Projektas turi koordinačių sistemą** (nustatyta lange {{ui:Koordinatės}}): kiekvienas sluoksnis su savo sistema konvertuojamas į ją, įskaitant žemės ar vietinį koregavimą. Failas be `.prj` turi du pasirinkimus: **Kaip projekte** (jo skaičiai įkeliami tokie, kokie yra) arba **Pasirinkti failo sistemą**.
- **Projektas neturi sistemos, o failas yra projekcijos sistemoje projekto vienetais** (pavyzdžiui, valstybinės plokštumos zona JAV apžvalgos pėdomis pėdų projektui): dialogas siūlo **Naudoti tą sistemą kaip projekto koordinačių sistemą**. Ji nustatoma tame pačiame anuliavimo žingsnyje kaip importas. Projekte nieko nejuda; sistema tik nurodo, ką reiškia skaičiai. Vietoj jos galite pasirinkti kitą projekto sistemą, tada sluoksniai konvertuojami į ją.
- **Projektas neturi sistemos, o failas yra platumos ir ilgumos sistemoje** (kiekvienas GeoJSON) **arba kituose vienetuose**: {{ui:Importuoti}} lieka neaktyvus, kol pasirinksite projekto koordinačių sistemą. Pasirinkiklis pradeda netoli duomenų.
- **Nei projektas, nei failai nenurodo sistemos**: skaičiai įkeliami tokie, kokie yra, o dialogas tai nurodo.

Aukščiai taip pat konvertuojami: GeoJSON aukščiai yra metrais (taip nurodo GeoJSON standartas); kitų failų aukščiai imami jų sistemos vienetais.

:::warning
GeoJSON failo pozicijos, esančios už ±180° ilgumos ar ±90° platumos ribų, nėra platuma ir ilguma. Tie objektai praleidžiami, o dialogas nurodo, kiek jų. Toks failas dažniausiai yra projekcijos failas, išsaugotas be savo sistemos; prašykite jo dar kartą arba shapefile su `.prj`.
:::

NAD83 laikoma tuo pačiu kaip WGS 84 (sistema, kurią naudoja GeoJSON); jų skirtumas Šiaurės Amerikoje siekia kelis metrus, todėl GeoJSON duomenys gali nukrypti tiek. Kai geriausiam poslinkiui reikia tinklelio failo (pavyzdžiui, NADCON NAD27 atveju), CivilCraft naudoja šiurkštesnį paskelbtą poslinkį, o koordinačių sistemos dialogas parodo, koks jis šiurkštus (NAD27 atveju apie 20 m), kol nepridėsite tinklelio failo: žr. [Tinklelio poslinkio failai](topic:coordinate-systems).

## GIS sluoksniai

Kiekviena eilutė skiltyje **GIS sluoksniai** turi:

- žymės langelį sluoksniui rodyti ar slėpti (paslėpti sluoksniai taip pat nepasirenkami);
- jo spalvą, pasirinktą iš sąrašo;
- meniu (trys taškai) su {{ui:Priartinti prie}}, {{ui:Naudoti paviršiui…}}, {{ui:Pervadinti…}} ir {{ui:Pašalinti}}.

Rodymas, slėpimas, perspalvinimas, pervadinimas ir šalinimas yra anuliavimo žingsniai. GIS sluoksniai išsaugomi projekto faile ir grįžta atidarius jį. Jie taip pat išeina su plano PDF spausdinimu ir jo DXF bei DWG eksportais, kiekvienas savo sluoksnyje, pavadintame `GIS-` ir jo numeriu.

## Objektų ženklinimas pagal atributą

Sluoksnio meniu {{ui:Daugiau}} (trys taškai skiltyje **GIS sluoksniai**) pasirinkite lauką po **Ženklinti su**: kiekvienas objektas rodo savo reikšmę plane, sluoksnio spalva. Taškai ženklinami šalia taško, linijos – išilgai ilgiausios dalies vidurio (pasuktos taip, kad skaitytųsi iš kairės į dešinę), poligonai – centre. Skaičiai rodomi iki trijų skaitmenų po kablelio. Etiketės popieriuje yra 1.8 mm aukščio bet kokiu mastelio, ir jos patenka į PDF spausdinimą, DXF ir DWG. Pasirinkite **Be etikečių**, kad jas pašalintumėte; kiekvienas pakeitimas yra vienas žingsnis ({{key:Mod+Z}} jį atšaukia). Sluoksnis ženklina ne daugiau kaip 5,000 objektų.

## Objekto peržiūra

Įjungus {{ui:Pasirinkti}}, spustelėkite objektą. **Savybės** rodo jo sluoksnį, kuris tai objektas, jo figūrą (dalys, skylės, viršūnės), aukščius, failą, iš kurio jis kilęs, to failo koordinačių sistemą, tada visus atributus lentelėje. Atributai tik skaitomi: CivilCraft rodo GIS duomenis tokius, kokie jie yra, jų nekeičia.

Kai po žymekliu yra ir taškas, ir linija, pirmenybė teikiama taškui; poligono viduje pasirenkamas mažiausias poligonas.

## Naudoti paviršiui

Atidarykite sluoksnio meniu ir pasirinkite {{ui:Naudoti paviršiui…}} (arba mygtuką **Savybės**). Pasiūlymas priklauso nuo sluoksnio:

| Sluoksnis | Gali tapti |
|---|---|
| Linijos su aukščiais (3D linijos) | Lūžio linijos jų pačių aukščiais |
| Linijos be aukščių, bet su skaitiniu lauku (horizontalės) | Lūžio linijos aukštyje pagal jūsų pasirinktą lauką |
| Poligonai | Paviršiaus riba (pasirinktas poligonas, kitu atveju didžiausias) arba lūžio linijos išilgai jų kraštų |
| Taškai su aukščiais arba su aukščio lauku | Topografiniai taškai, aprašyti sluoksnio pavadinimu, kad sudarytų taškų grupę |

Kiekvienas panaudojimas yra vienas anuliavimo žingsnis, kuris nukopijuoja geometriją į projektą; pats sluoksnis lieka toks, koks buvo. Aukščiai imami projekto vienetais.

## Taškų failai su platuma ir ilguma

Taškų failas, kurio antraštėje nurodyti stulpeliai **latitude** ir **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`), skaitomas kaip laipsniai, o ne kaip šiaurės ir rytų koordinatės. Importavimo dialogas tai nurodo. Spustelėjus {{ui:Importuoti}}, taškai konvertuojami į projekto koordinačių sistemą; projektas be jos pirmiausia paprašo ją pasirinkti. Laipsniai niekada neįkeliami kaip pėdos. Eilutės, esančios už ±90° platumos ar ±180° ilgumos ribų, atmetamos su priežastimi. Aukščių stulpelis imamas tokį, koks yra, projekto vienetais.

## LandXML failai, nurodantys koordinačių sistemą

Kai atidarytame LandXML faile yra elementas `CoordinateSystem` (EPSG kodas, WKT aprašymas arba sistemos pavadinimas), CivilCraft jį siūlo kaip projekto koordinačių sistemą. Priėmus, nieko nejuda; sistema tik nurodo, ką reiškia skaičiai.

## Ką patikrinome

- Kiekvienas skaitytuvas palygintas su GDAL, biblioteka, kurią naudoja dauguma GIS programų, su failais, kuriuos GDAL įrašė: shapefile visų tipų su aukščiais ir be jų, daugiadalės linijos, poligonai su skylėmis, tušti geometriniai objektai, tekstiniai, skaitiniai, datos ir taip/ne (true/false) atributai, UTF-8 ir Windows-1252 tekstas su `.cpg` ir be jo, zip su keliais shapefile, GeoJSON su visais geometrijos tipais ir GeoPackage su keturiomis lentelėmis. Kiekviena geometrija, aukštis ir atributas sutapo.
- Pozicijos, konvertuotos iš platumos ir ilgumos bei iš UTM, sutapo su PROJ (projekcijų biblioteka, esančia GDAL pagrinde) iki 3 mm.
- Pažeisti failai (nukirpti, melagingai nurodantys savo dydį, sugadinti zip, sugadinti GeoPackage) duoda vieną paprastą pranešimą; nieko nestringa.
- Nieko čia nebuvo atidaryta kitose GIS programose, o failų geodatabase, KML ir KMZ dar nenuskaitomi (žr. [Dar neįgyvendinta](topic:not-built-yet)).
