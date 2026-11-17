---
title: Formate de fișiere cu puncte
summary: Ordinea coloanelor pe care le citește CivilCraft, cum găsește separatorul și rândul de antet, ce nume de antet recunoaște și cum sunt verificate rândurile.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, format fișier cu puncte, coloane, antet, separator
from: 84fab42e
---

Un fișier cu puncte este text simplu, un punct pe rând. CivilCraft îl citește în browser; nimic nu este încărcat.

## Ordinea coloanelor

Literele denumesc coloanele de la stânga la dreapta: **P** numărul sau numele punctului, **N** nordul, **E** estul, **Z** cota, **D** descrierea.

| Ordine | Coloane | Exemplu de rând |
|---|---|---|
| PNEZD | punct, nord, est, cotă, descriere | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punct, est, nord, cotă, descriere | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punct, nord, est, cotă | `101,2080000.00,6150000.00,250.00` |
| PENZ | punct, est, nord, cotă | `101,6150000.00,2080000.00,250.00` |
| NEZD | nord, est, cotă, descriere | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | est, nord, cotă, descriere | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | nord, est, cotă | `2080000.00 6150000.00 250.00` |
| ENZ | est, nord, cotă | `6150000.00 2080000.00 250.00` |

Ordinile fără P numerotează punctele 1, 2, 3 … în ordinea din fișier. X este estul și Y este nordul.

## Separatorii

CivilCraft se uită la primele 20 de rânduri și alege primul dintre acești separatori care apare în cel puțin 60% din ele: virgulă, tabulator, punct și virgulă. Altfel împarte rândurile pe serii de spații.

- În fișierele cu virgulă, tabulator și punct și virgulă, un câmp între ghilimele poate conține separatorul (`"FL, NORTH"`), iar `""` în interiorul ghilimelelor este un singur semn de ghilimea.
- În fișierele separate prin spații, o descriere de la sfârșitul rândului poate conține spații: tot ce urmează după ultima coloană de coordonate este descrierea.
- Rândurile care încep cu `#`, `;` sau `//`, precum și rândurile goale, sunt sărite.
- Un marcaj de ordine a octeților la începutul fișierului este ignorat.

## Rândul de antet

Prima linie este tratată ca antet când mai puțin de două dintre câmpurile sale sunt numere. Dacă fiecare câmp al antetului este un nume pe care CivilCraft îl recunoaște, ordinea coloanelor vine din el („din rândul de antet”). Numele sunt potrivite fără a ține cont de majuscule, spații, puncte, liniuțe de subliniere, cratime și paranteze:

| Coloană | Nume recunoscute |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Dacă un nume din antet nu este recunoscut, sau numele nu alcătuiesc una dintre cele opt ordini, antetul este sărit, iar ordinea este ghicită din numărul de coloane.

:::warning
Un antet care denumește atât o coloană de latitudine (`lat`, `latitude`), cât și una de longitudine (`lon`, `long`, `longitude`) este citit în grade, nu ca nord și est. La {{ui:Import}} punctele sunt convertite prin sistemul de coordonate al proiectului, iar un proiect fără unul cere mai întâi să îl alegeți. Rândurile în afara intervalului ±90° latitudine sau ±180° longitudine sunt refuzate. Vezi [Importul datelor GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Ghicirea după numărul de coloane

Fără un antet utilizabil și cu **Coloane** lăsat pe {{ui:Detectare}}:

- 5 sau mai multe coloane: PNEZD.
- 4 coloane: PNEZ când prima coloană este un număr întreg pe fiecare rând eșantionat și a patra este un număr; altfel NEZD.
- 3 coloane: NEZ.

PNEZD și PENZD nu pot fi deosebite după numere. Ghicirea urmează **Rânduri cu puncte** din [Setările CivilCraft](topic:settings): P, N, E, Z, D la început sau P, E, N, Z, D (atunci patru coloane sunt citite ca PENZ, iar trei ca ENZ). Dialogul spune „ghicit din numărul de coloane — verificați dacă nordul și estul nu sunt inversate”. Alegeți ordinea corectă în **Coloane** dacă previzualizarea arată greșit.

## Cum sunt verificate rândurile

- Un rând poate lipsi descrierea.
- Nordul și estul trebuie să fie numere. Cota poate fi goală (punctul este păstrat, dar nu este folosit în suprafață).
- Numărul punctului poate fi orice text (și litere, precum `CP1`), dar nu poate fi gol.
- Dacă un număr de punct se repetă, primul rând este păstrat, iar celelalte sunt listate ca necitite.
- Descrierile sunt păstrate până la 200 de caractere; caracterele de control devin spații.
- Până la 200 de rânduri necitite sunt păstrate pentru dialog (25 afișate), iar toate sunt numărate.

## Grupuri de puncte

Grupul unui punct este primul cuvânt al descrierii sale, scris cu majuscule. „GRD”, „grd shot” și „Grd” sunt toate în grupul GRD. Un punct fără descriere este în „(fără descriere)”. Vezi [Importul punctelor topografice](topic:import-points).

## Scrierea punctelor

CivilCraft nu exportă încă un fișier text cu puncte. Punctele ies în LandXML (ca CgPoints), în fișierul de proiect și prin {{ui:Export}} GIS ca shapefile, GeoPackage sau GeoJSON, cu câmpurile P, N, E, Z și D ([Exportul datelor as-built pentru GIS](topic:gis-export)). Vezi [Încă nerealizat](topic:not-built-yet).
