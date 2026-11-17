---
title: Formati datoteka s tačkama
summary: Redoslijed kolona koje CivilCraft čita, kako pronalazi separator i red zaglavlja, koje nazive zaglavlja prepoznaje i kako se provjeravaju redovi.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, format datoteke s tačkama, kolone, zaglavlje, separator
from: 84fab42e
---

Datoteka s tačkama je običan tekst, jedna tačka po redu. CivilCraft je čita u pregledaču; ništa se ne otprema.

## Redoslijed kolona

Slova označavaju kolone s lijeva na desno: **P** broj ili naziv tačke, **N** sjeverna koordinata, **E** istočna koordinata, **Z** kota, **D** opis.

| Redoslijed | Kolone | Primjer reda |
|---|---|---|
| PNEZD | tačka, sjever, istok, kota, opis | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | tačka, istok, sjever, kota, opis | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | tačka, sjever, istok, kota | `101,2080000.00,6150000.00,250.00` |
| PENZ | tačka, istok, sjever, kota | `101,6150000.00,2080000.00,250.00` |
| NEZD | sjever, istok, kota, opis | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | istok, sjever, kota, opis | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | sjever, istok, kota | `2080000.00 6150000.00 250.00` |
| ENZ | istok, sjever, kota | `6150000.00 2080000.00 250.00` |

Redoslijedi bez P numerišu tačke 1, 2, 3 … redoslijedom u datoteci. X je istok, a Y je sjever.

## Separatori

CivilCraft gleda prvih 20 redova i bira prvi od ovih koji se pojavljuje u najmanje 60% njih: zarez, tabulator, tačka-zarez. Inače dijeli na nizove razmaka.

- U datotekama sa zarezom, tabulatorom i tačka-zarezom, polje u dvostrukim navodnicima može sadržavati separator (`"FL, NORTH"`), a `""` unutar navodnika je jedan znak navodnika.
- U datotekama s razmacima, opis na kraju reda može sadržavati razmake: sve poslije posljednje kolone koordinate je opis.
- Redovi koji počinju s `#`, `;` ili `//`, te prazni redovi, preskaču se.
- Oznaka redoslijeda bajtova (BOM) na početku datoteke se ignoriše.

## Red zaglavlja

Prvi red se tretira kao zaglavlje kad je manje od dva njegova polja brojevi. Ako su svi nazivi u zaglavlju nazivi koje CivilCraft prepoznaje, redoslijed kolona se uzima iz njega („iz reda zaglavlja”). Nazivi se upoređuju bez obzira na velika i mala slova, razmake, tačke, donje crte, crtice i zagrade:

| Kolona | Prepoznati nazivi |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Ako neki naziv u zaglavlju nije prepoznat, ili nazivi ne čine jedan od osam redoslijeda, zaglavlje se preskače i redoslijed se pogađa iz broja kolona.

:::warning
Zaglavlje koje navodi kolonu geografske širine (`lat`, `latitude`) i kolonu dužine (`lon`, `long`, `longitude`) čita se kao stepeni, a ne kao sjever i istok. Pri {{ui:Uvezi}} tačke se pretvaraju kroz koordinatni sistem projekta, a projekat bez njega najprije traži da ga odaberete. Redovi izvan ±90° geografske širine ili ±180° dužine se odbijaju. Pogledajte [Uvoz GIS podataka](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Pogađanje iz broja kolona

Bez upotrebljivog zaglavlja i s {{ui:Prepoznaj}} ostavljenim na **Kolone**:

- 5 ili više kolona: PNEZD.
- 4 kolone: PNEZ kad je prva kolona cijeli broj u svakom uzorkovanom redu, a četvrta je broj; inače NEZD.
- 3 kolone: NEZ.

PNEZD i PENZD se ne mogu razlikovati po brojevima. Pogađanje slijedi **Redovi tačaka** u [CivilCraft postavkama](topic:settings): P, N, E, Z, D na početku, ili P, E, N, Z, D (tada se četiri kolone čitaju kao PENZ, a tri kao ENZ). Dijalog kaže "pogođeno iz broja kolona – provjerite da sjever i istok nisu zamijenjeni". Odaberite ispravan redoslijed u **Kolone** ako pregled izgleda pogrešno.

## Kako se provjeravaju redovi

- Red može izostaviti opis.
- Sjeverna i istočna koordinata moraju biti brojevi. Kota može biti prazna (tačka se zadržava, ali se ne koristi u površini).
- Broj tačke može biti bilo koji tekst (i slova, kao `CP1`), ali ne smije biti prazan.
- Ako se broj tačke ponavlja, zadržava se prvi red, a ostali se navode kao nepročitani.
- Opisi se čuvaju do 200 znakova; kontrolni znakovi postaju razmaci.
- Do 200 nepročitanih redova se čuva za dijalog (prikazuje se 25), a svi se broje.

## Grupe tačaka

Grupa tačke je prva riječ njenog opisa napisana velikim slovima. "GRD", "grd shot" i "Grd" su sve grupa GRD. Tačka bez opisa je u "(bez opisa)". Pogledajte [Uvoz tačaka geodetskog snimanja](topic:import-points).

## Pisanje tačaka

CivilCraft još ne izvozi tekstualnu datoteku tačaka. Tačke se izvoze u LandXML (kao CgPoints), u datoteci projekta i kroz GIS {{ui:Izvoz}} kao shapefile, GeoPackage ili GeoJSON s poljima P, N, E, Z i D ([Izvoz podataka izvedenog stanja za GIS](topic:gis-export)). Pogledajte [Još nije izgrađeno](topic:not-built-yet).
