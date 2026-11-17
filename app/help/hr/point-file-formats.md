---
title: Format datoteke s točkama
summary: Redoslijed stupaca koje CivilCraft čita, kako pronalazi separator i redak zaglavlja, koje nazive zaglavlja prepoznaje i kako se provjeravaju retci.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, format datoteke s točkama, stupci, zaglavlje, separator
from: 84fab42e
---

Datoteka s točkama je običan tekst, jedna točka po retku. CivilCraft je čita u pregledniku; ništa se ne učitava.

## Redoslijed stupaca

Slova označavaju stupce slijeva nadesno: **P** broj ili naziv točke, **N** sjever, **E** istok, **Z** kota, **D** opis.

| Redoslijed | Stupci | Primjer retka |
|---|---|---|
| PNEZD | točka, sjever, istok, kota, opis | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | točka, istok, sjever, kota, opis | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | točka, sjever, istok, kota | `101,2080000.00,6150000.00,250.00` |
| PENZ | točka, istok, sjever, kota | `101,6150000.00,2080000.00,250.00` |
| NEZD | sjever, istok, kota, opis | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | istok, sjever, kota, opis | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | sjever, istok, kota | `2080000.00 6150000.00 250.00` |
| ENZ | istok, sjever, kota | `6150000.00 2080000.00 250.00` |

Redoslijedi bez P broje točke 1, 2, 3 … redom kojim su u datoteci. X je istok, a Y je sjever.

## Separatori

CivilCraft gleda prvih 20 redaka i bira prvi od ovih koji se pojavljuje u barem 60 % njih: zarez, tabulator, točka-zarez. Inače dijeli po nizovima razmaka.

- U datotekama sa zarezom, tabulatorom i točka-zarezom polje u dvostrukim navodnicima može sadržavati separator (`"FL, NORTH"`), a `""` unutar navodnika je jedan znak navodnika.
- U datotekama odvojenim razmacima opis na kraju retka može sadržavati razmake: sve nakon zadnjeg stupca koordinate je opis.
- Retci koji počinju s `#`, `;` ili `//` i prazni retci se preskaču.
- Oznaka redoslijeda bajtova (BOM) na početku datoteke se zanemaruje.

## Redak zaglavlja

Prvi redak smatra se zaglavljem kad je manje od dva njegova polja brojevi. Ako je svako polje zaglavlja naziv koji CivilCraft prepoznaje, redoslijed stupaca dolazi iz njega („iz retka zaglavlja“). Nazivi se uspoređuju bez obzira na velika i mala slova, razmake, točke, donje crte, crtice i zagrade:

| Stupac | Prepoznati nazivi |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Ako neki naziv zaglavlja nije prepoznat ili nazivi ne čine jedan od osam redoslijeda, zaglavlje se preskače, a redoslijed se pogađa iz broja stupaca.

:::warning
Zaglavlje koje navodi i stupac geografske širine (`lat`, `latitude`) i stupac geografske dužine (`lon`, `long`, `longitude`) čita se kao stupnjevi, a ne kao sjever i istok. Pri {{ui:Uvezi}} točke se pretvaraju kroz koordinatni sustav projekta, a projekt bez njega najprije traži da ga odaberete. Retci izvan ±90° geografske širine ili ±180° geografske dužine se odbijaju. Pogledajte [Uvoz GIS podataka](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Pogađanje iz broja stupaca

Bez upotrebljivog zaglavlja i uz **Stupci** ostavljeno na {{ui:Prepoznaj}}:

- 5 ili više stupaca: PNEZD.
- 4 stupca: PNEZ kad je prvi stupac cijeli broj u svakom uzorkovanom retku, a četvrti broj; inače NEZD.
- 3 stupca: NEZ.

PNEZD i PENZD se iz brojeva ne mogu razlikovati. Pogađanje slijedi **Retci točaka** u [postavkama CivilCraft-a](topic:settings): P, N, E, Z, D na početku ili P, E, N, Z, D (tada se četiri stupca čitaju kao PENZ, a tri kao ENZ). Dijalog kaže „pogođeno iz broja stupaca — provjerite nisu li sjever i istok zamijenjeni“. Odaberite ispravan redoslijed u **Stupci** ako pregled izgleda krivo.

## Kako se provjeravaju retci

- Redak može izostaviti opis.
- Sjever i istok moraju biti brojevi. Kota može biti prazna (točka se zadržava, ali se ne koristi u površini).
- Broj točke može biti bilo koji tekst (i slova, npr. `CP1`), ali ne smije biti prazan.
- Ako se broj točke ponovi, zadržava se prvi redak, a ostali se navode kao nepročitani.
- Opisi se zadržavaju do 200 znakova; upravljački znakovi postaju razmaci.
- Do 200 nepročitanih redaka zadržava se za dijalog (prikazuje se 25), a svi se broje.

## Skupine točaka

Skupina točke je prva riječ njezina opisa napisana velikim slovima. „GRD“, „grd shot“ i „Grd“ su sve skupina GRD. Točka bez opisa je u „(bez opisa)“. Pogledajte [Uvoz geodetskih točaka](topic:import-points).

## Zapisivanje točaka

CivilCraft još ne izvozi tekstualnu datoteku s točkama. Točke se izvoze u LandXML (kao CgPoints), u datoteku projekta i kroz GIS {{ui:Izvoz}} kao shapefile, GeoPackage ili GeoJSON s poljima P, N, E, Z i D ([Izvoz izvedenih podataka za GIS](topic:gis-export)). Pogledajte [Još nije izrađeno](topic:not-built-yet).
