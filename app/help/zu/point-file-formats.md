---
title: Amafomethi amafayela wamaphoyinti
summary: Ukuhleleka kwezikholomu ethi CivilCraft iyazifunda, indlela ithola ngayo isihlukanisi nomugqa wesihloko, amagama esihloko awaziwayo, nendlela imigqa ehlolwa ngayo.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, ifomethi yefayela lephoyinti, izikholomu, isihloko, isihlukanisi
from: 84fab42e
---

Ifayela lephoyinti ngumbhalo ovamile, iphoyinti elilodwa emugqeni ngamunye. I-CivilCraft iyilifunda esiphequluludweni; akukho lutho olulayishwayo.

## Ukuhleleka kwezikholomu

Izinhlamvu zibiza izikholomu zisuka kwesobunxele kuya kwesokudla: **P** inombolo noma igama lephoyinti, **N** i-northing, **E** i-easting, **Z** ukuphakama, **D** incazelo.

| Ukuhleleka | Izikholomu | Umugqa wesibonelo |
|---|---|---|
| PNEZD | iphoyinti, i-northing, i-easting, ukuphakama, incazelo | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | iphoyinti, i-easting, i-northing, ukuphakama, incazelo | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | iphoyinti, i-northing, i-easting, ukuphakama | `101,2080000.00,6150000.00,250.00` |
| PENZ | iphoyinti, i-easting, i-northing, ukuphakama | `101,6150000.00,2080000.00,250.00` |
| NEZD | i-northing, i-easting, ukuphakama, incazelo | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | i-easting, i-northing, ukuphakama, incazelo | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | i-northing, i-easting, ukuphakama | `2080000.00 6150000.00 250.00` |
| ENZ | i-easting, i-northing, ukuphakama | `6150000.00 2080000.00 250.00` |

Ukuhleleka okungenaye P kubala amaphoyinti 1, 2, 3 … ngokuhleleka kwefayela. I-X ingu-easting kanti i-Y ingu-northing.

## Izihlukanisi

I-CivilCraft ibheka imigqa engu-20 yokuqala bese ikhetha okokuqala kwalezi okuvela kwengxenye engu-60% yayo: ikhoma, ithebhu, isemikholoni. Uma kungenjalo, ihlukanisa ngamaqoqo wezikhala.

- Kumafayela ngekhoma, ithebhu nesemikholoni, inkambu enamagatsha amabili ingabamba isihlukanisi (`"FL, NORTH"`), futhi `""` ngaphakathi kwamagatsha amabili ibhekisela kophawu lwamagatsha olulodwa.
- Kumafayela ahlukaniswe izikhala, incazelo esekugcineni komugqa ingaqukatha izikhala: konke okuseqenjini lwezikholomu zokugcina ezixhunyiwe kungumbhalo wencazelo.
- Imigqa eqala nge-`#`, `;` noma `//`, nemigqa engenalutho, iyakhishwa.
- I-byte-order mark ekuqaleni kwefayela iyashaywa indiva.

## Umugqa wesihloko

Umugqa wokuqala uthathwa njengesihloko uma ngaphansi kwamasimu amabili kuwo anamanani. Uma yonke inkambu yesihloko iyigama elaziwa yi-CivilCraft, ukuhleleka kwezikholomu kuvela kukho ("kusuka emugqeni wesihloko"). Amagama ahlolwa ngaphandle kokunaka izinhlamvu ezinkulu nezincane, izikhala, amadothi, amashwa aphansi, amashwa, nezibambo.

| Ikholomu | Amagama amukelekile |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Uma kukhona igama lesihloko elingaziwa, noma amagama angenza enye yalezi zinhlelo eziyisishiyagalombili, isihloko siyashaywa futhi ukuhleleka kuqagelwa kusuka enanini lezikholomu.

:::warning
Isihloko esibiza umugqa wobubanzi (`lat`, `latitude`) nomugqa wobude (`lon`, `long`, `longitude`) sifundwa njengamadigri, hhayi njenge-northing ne-easting. Ku-{{ui:Ngenisa}} amaphoyinti aguqulwa ngohlelo lwamakhoordinethi lwephrojekthi, nephrojekthi engenalo icela ukuthi uliKhethe kuqala. Imigqa engaphandle kwe-±90° yobubanzi noma ±180° yobude iyenqatshwa. Bona [Ngenisa idatha ye-GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Ukuqagela ngenani lezikholomu

Uma kungekho sihloko esisebenzayo futhi **Izikholomu** zishiywe ku-{{ui:Thola}}:

- Izikholomu ezi-5 noma ngaphezulu: PNEZD.
- Izikholomu ezi-4: PNEZ uma inombolo yokuqala kuwo wonke imigqa esampuliwe iyinombolo ephelele futhi eyesine iyinombolo; kungenjalo NEZD.
- Izikholomu ezi-3: NEZ.

I-PNEZD ne-PENZD azihlukaniswa ngamanani. Ukuqagela kulandela **Imigqa yamaphoyinti** ku-[Izilungiselelo ze-CivilCraft](topic:settings): P, N, E, Z, D ekuqaleni, noma P, E, N, Z, D (bese izikholomu ezine zifundwa njenge-PENZ nezintathu njenge-ENZ). Ibhokisi lengxoxo lithi "iqagelwe ngenani lezikholomu — hlola ukuthi i-northing ne-easting aziguquki". Khetha ukuhleleka okufanele ku-**Izikholomu** uma uhlolo lukhombisa okungalungile.

## Ukuhlola imigqa

- Umugqa ungashiya incazelo.
- I-northing ne-easting kumele kube izinombolo. Ukuphakama kungaba yize (iphoyinti liyagcinwa kodwa alisetshenziswa ophaweni).
- Inombolo yephoyinti ingaba yimbhalo onalo nawuphi umbhalo (namanye amagama, njengo `CP1`), kodwa ingabi yize.
- Uma inombolo yephoyinti iphindeka, umugqa wokuqala uyagcinwa futhi eminye ibhalwa njengengafundwanga.
- Izincazelo zigcinwa kuze kube izinhlamvu ezingu-200; izinhlamvu zokulawula ziba izikhala.
- Kuze kube imigqa engu-200 engafundwanga iyagcinwa engxoxweni (ebonakala engu-25), futhi yonke ibalwa.

## Amaqembu wamaphoyinti

Iqembu lephoyinti liwigama lokuqala lencazelo yalo ngezinhlamvu ezinkulu. "GRD", "grd shot" ne-"Grd" zonke ziyiqembu GRD. Iphoyinti elingenayo incazelo lisemqulwini "(akukho ncazelo)". Bona [Ngenisa amaphoyinti okuhlola](topic:import-points).

## Ukubhala amaphoyinti

I-CivilCraft ayikaphumi ifayela lombhalo lamaphoyinti okwamanje. Amaphoyinti aphuma ngefomethi ye-LandXML (njenge-CgPoints), kufayela lephrojekthi, nangokuthi GIS {{ui:Thumela}} njenge-shapefile, i-GeoPackage noma i-GeoJSON namasimu P, N, E, Z kanye ne-D ([Thumela idatha ye-as-built ye-GIS](topic:gis-export)). Bona [Akikakwakhiwa](topic:not-built-yet).
