---
title: Punktu failu formāti
summary: Kolonnu secība, ko CivilCraft nolasa, kā tas atrod atdalītāju un galvenes rindu, kādus galvenes nosaukumus atpazīst un kā tiek pārbaudītas rindas.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, punktu failu formāts, kolonnas, galvene, atdalītājs
from: 84fab42e
---

Punktu fails ir vienkāršs teksts, viens punkts rindā. CivilCraft to nolasa pārlūkprogrammā; nekas netiek augšupielādēts.

## Kolonnu secība

Burti nosauc kolonnas no kreisās uz labo: **P** punkta numurs vai nosaukums, **N** ziemeļu koordināta, **E** austrumu koordināta, **Z** augstums, **D** apraksts.

| Secība | Kolonnas | Piemērs rindai |
|---|---|---|
| PNEZD | punkts, ziemeļi, austrumi, augstums, apraksts | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punkts, austrumi, ziemeļi, augstums, apraksts | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punkts, ziemeļi, austrumi, augstums | `101,2080000.00,6150000.00,250.00` |
| PENZ | punkts, austrumi, ziemeļi, augstums | `101,6150000.00,2080000.00,250.00` |
| NEZD | ziemeļi, austrumi, augstums, apraksts | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | austrumi, ziemeļi, augstums, apraksts | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | ziemeļi, austrumi, augstums | `2080000.00 6150000.00 250.00` |
| ENZ | austrumi, ziemeļi, augstums | `6150000.00 2080000.00 250.00` |

Secībās bez P punkti tiek numurēti 1, 2, 3 … failā esošajā secībā. X ir austrumi, bet Y ir ziemeļi.

## Atdalītāji

CivilCraft apskata pirmās 20 rindas un izvēlas pirmo no šiem, kas parādās vismaz 60% no tām: komats, tabulēšanas zīme, semikols. Pretējā gadījumā tas dala pēc atstarpju virknēm.

- Komata, tabulēšanas un semikola failos lauks pēdiņās var saturēt atdalītāju (`"FL, NORTH"`), un `""` pēdiņās ir viena pēdiņu zīme.
- Atstarpēm atdalītos failos apraksts rindas beigās var saturēt atstarpes: viss pēc pēdējās koordinātu kolonnas ir apraksts.
- Rindas, kas sākas ar `#`, `;` vai `//`, un tukšās rindas tiek izlaistas.
- Baitu kārtas zīme faila sākumā tiek ignorēta.

## Galvenes rinda

Pirmā rinda tiek uzskatīta par galveni, ja mazāk nekā divi tās lauki ir skaitļi. Ja katrs galvenes lauks ir nosaukums, ko CivilCraft atpazīst, kolonnu secība tiek ņemta no tās („no galvenes rindas”). Nosaukumi tiek saskaņoti neatkarīgi no reģistra, atstarpēm, punktiem, pasvītrojumiem, defisēm un iekavām:

| Kolonna | Atpazītie nosaukumi |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Ja kāds galvenes nosaukums nav atpazīts vai nosaukumi neveido vienu no astoņām secībām, galvene tiek izlaista un secība tiek minēta pēc kolonnu skaita.

:::warning
Galvene, kas nosauc gan platuma kolonnu (`lat`, `latitude`), gan garuma kolonnu (`lon`, `long`, `longitude`), tiek nolasīta kā grādi, nevis kā ziemeļi un austrumi. Sadaļā {{ui:Importēt}} punkti tiek pārveidoti caur projekta koordinātu sistēmu, un projekts bez tās vispirms prasa to izvēlēties. Rindas ārpus ±90° platuma vai ±180° garuma tiek noraidītas. Skatiet [Importēt GIS datus](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Minējums pēc kolonnu skaita

Bez izmantojamas galvenes un ja **Kolonnas** paliek uz {{ui:Noteikt}}:

- 5 vai vairāk kolonnu: PNEZD.
- 4 kolonnas: PNEZ, ja pirmā kolonna visās pārbaudītajās rindās ir vesels skaitlis un ceturtā ir skaitlis; citādi NEZD.
- 3 kolonnas: NEZ.

PNEZD un PENZD no skaitļiem nevar atšķirt. Minējums seko **Punktu rindām** sadaļā [CivilCraft iestatījumi](topic:settings): P, N, E, Z, D sākumā vai P, E, N, Z, D (tad četras kolonnas tiek nolasītas kā PENZ un trīs kā ENZ). Dialogs saka „minēts pēc kolonnu skaita — pārbaudiet, vai ziemeļi un austrumi nav samainīti”. Ja priekšskatījums izskatās nepareizi, izvēlieties pareizo secību laukā **Kolonnas**.

## Kā tiek pārbaudītas rindas

- Rindā var nebūt apraksta.
- Ziemeļu un austrumu koordinātām jābūt skaitļiem. Augstums var būt tukšs (punkts tiek saglabāts, bet virsmā netiek izmantots).
- Punkta numurs var būt jebkurš teksts (arī burti, piemēram, `CP1`), bet tas nedrīkst būt tukšs.
- Ja punkta numurs atkārtojas, tiek saglabāta pirmā rinda, bet pārējās tiek uzskaitītas kā nenolasītas.
- Aprakstus saglabā līdz 200 rakstzīmēm; vadības rakstzīmes kļūst par atstarpēm.
- Līdz 200 nenolasītām rindām tiek saglabātas dialogam (rāda 25), un visas tiek saskaitītas.

## Punktu grupas

Punkta grupa ir apraksta pirmais vārds lielajos burtos. „GRD”, „grd shot” un „Grd” ir visi grupa GRD. Punkts bez apraksta ir grupā „(nav apraksta)”. Skatiet [Importēt uzmērījuma punktus](topic:import-points).

## Punktu rakstīšana

CivilCraft vēl neeksportē punktu teksta failu. Punkti tiek izvadīti LandXML (kā CgPoints), projekta failā un caur GIS {{ui:Eksportēt}} kā shapefile, GeoPackage vai GeoJSON ar laukiem P, N, E, Z un D ([Eksportēt izpildījuma datus GIS](topic:gis-export)). Skatiet [Vēl nav izveidots](topic:not-built-yet).
