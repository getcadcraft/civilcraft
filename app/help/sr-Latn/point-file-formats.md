---
title: Formati datoteka sa tačkama
summary: Redosledi kolona koje CivilCraft čita, kako nalazi separator i red zaglavlja, koja imena zaglavlja prepoznaje i kako se redovi proveravaju.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, format datoteke sa tačkama, kolone, zaglavlje, separator
from: 84fab42e
---

Datoteka sa tačkama je običan tekst, jedna tačka po redu. CivilCraft je čita u pregledaču; ništa se ne otprema.

## Redosledi kolona

Slova imenuju kolone sleva udesno: **P** broj ili ime tačke, **N** sever, **E** istok, **Z** kota, **D** opis.

| Redosled | Kolone | Primer reda |
|---|---|---|
| PNEZD | tačka, sever, istok, kota, opis | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | tačka, istok, sever, kota, opis | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | tačka, sever, istok, kota | `101,2080000.00,6150000.00,250.00` |
| PENZ | tačka, istok, sever, kota | `101,6150000.00,2080000.00,250.00` |
| NEZD | sever, istok, kota, opis | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | istok, sever, kota, opis | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | sever, istok, kota | `2080000.00 6150000.00 250.00` |
| ENZ | istok, sever, kota | `6150000.00 2080000.00 250.00` |

Redovi bez P broje tačke 1, 2, 3 … redom u datoteci. X je istok, a Y je sever.

## Separatori

CivilCraft gleda prvih 20 redova i bira prvi od ovih koji se pojavljuje u bar 60% njih: zarez, tabulator, tačka-zarez. Inače deli po nizovima razmaka.

- U datotekama sa zarezom, tabulatorom i tačkom-zarezom polje pod navodnicima može da sadrži separator (`"FL, NORTH"`), a `""` unutar navodnika je jedan znak navoda.
- U datotekama sa razmacima opis na kraju reda može da sadrži razmake: sve posle poslednje kolone koordinate je opis.
- Redovi koji počinju sa `#`, `;` ili `//`, i prazni redovi, se preskaču.
- Oznaka redosleda bajtova na početku datoteke se ignoriše.

## Red zaglavlja

Prvi red se tretira kao zaglavlje kad je manje od dva njegova polja broj. Ako je svako polje zaglavlja ime koje CivilCraft prepoznaje, redosled kolona se uzima iz njega („iz reda zaglavlja“). Imena se upoređuju bez obzira na velika i mala slova, razmake, tačke, donje crte, crtice i zagrade:

| Kolona | Prepoznata imena |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Ako neko ime u zaglavlju nije prepoznato, ili imena ne čine jedan od osam redosleda, zaglavlje se preskače i redosled se pogađa iz broja kolona.

:::warning
Zaglavlje koje imenuje i kolonu geografske širine (`lat`, `latitude`) i kolonu dužine (`lon`, `long`, `longitude`) čita se kao stepeni, a ne kao sever i istok. Pri {{ui:Uvezi}} tačke se pretvaraju kroz koordinatni sistem projekta, a projekat bez njega traži da ga prvo izabereš. Redovi van ±90° geografske širine ili ±180° dužine se odbijaju. Vidi [Uvezi GIS podatke](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Pogađanje iz broja kolona

Bez upotrebljivog zaglavlja i sa **Kolone** ostavljenim na {{ui:Otkrij}}:

- 5 ili više kolona: PNEZD.
- 4 kolone: PNEZ kad je prva kolona ceo broj u svakom uzorkovanom redu, a četvrta broj; inače NEZD.
- 3 kolone: NEZ.

PNEZD i PENZD se ne mogu razlikovati iz brojeva. Pogađanje prati **Redovi tačaka** u [Podešavanjima CivilCraft-a](topic:settings): P, N, E, Z, D na početku, ili P, E, N, Z, D (tada se četiri kolone čitaju kao PENZ, a tri kao ENZ). Dijalog kaže „pogođeno iz broja kolona – proveri da sever i istok nisu zamenjeni“. Izaberi tačan redosled u **Kolone** ako pregled izgleda pogrešno.

## Kako se redovi proveravaju

- Red može da izostavi opis.
- Sever i istok moraju biti brojevi. Kota može biti prazna (tačka se zadržava, ali se ne koristi u površi).
- Broj tačke može biti bilo koji tekst (i slova, kao `CP1`), ali ne sme biti prazan.
- Ako se broj tačke ponavlja, zadržava se prvi red, a ostali se navode kao nepročitani.
- Opisi se čuvaju do 200 znakova; kontrolni znakovi postaju razmaci.
- Do 200 nepročitanih redova se čuva za dijalog (prikazano je 25), a svi se broje.

## Grupe tačaka

Grupa tačke je prva reč njenog opisa velikim slovima. „GRD“, „grd shot“ i „Grd“ su sve grupa GRD. Tačka bez opisa je u grupi „(bez opisa)“. Vidi [Uvezi geodetske tačke](topic:import-points).

## Pisanje tačaka

CivilCraft još ne izvozi tekstualnu datoteku sa tačkama. Tačke se šalju u LandXML (kao CgPoints), u datoteci projekta i kroz GIS {{ui:Izvoz}} kao shapefile, GeoPackage ili GeoJSON sa poljima P, N, E, Z i D ([Izvezi podatke o izvedenom stanju za GIS](topic:gis-export)). Vidi [Još nije napravljeno](topic:not-built-yet).
