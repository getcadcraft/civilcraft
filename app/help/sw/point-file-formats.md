---
title: Miundo ya faili za nukta
summary: Mpangilio wa safu ambao CivilCraft inausoma, jinsi inavyotambua kitenganishi na safu ya kichwa, majina ya kichwa inayoyatambua, na jinsi safu zinavyokaguliwa.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, muundo wa faili ya nukta, safu, kichwa, kitenganishi
from: 84fab42e
---

Faili ya nukta ni maandishi tupu, nukta moja kwa kila mstari. CivilCraft inaisoma kwenye kivinjari; hakuna chochote kinachopakiwa.

## Mpangilio wa safu

Herufi zinataja safu kutoka kushoto kwenda kulia: **P** namba au jina la nukta, **N** kaskazini, **E** mashariki, **Z** mwinuko, **D** maelezo.

| Mpangilio | Safu | Mfano wa mstari |
|---|---|---|
| PNEZD | nukta, kaskazini, mashariki, mwinuko, maelezo | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | nukta, mashariki, kaskazini, mwinuko, maelezo | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | nukta, kaskazini, mashariki, mwinuko | `101,2080000.00,6150000.00,250.00` |
| PENZ | nukta, mashariki, kaskazini, mwinuko | `101,6150000.00,2080000.00,250.00` |
| NEZD | kaskazini, mashariki, mwinuko, maelezo | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | mashariki, kaskazini, mwinuko, maelezo | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | kaskazini, mashariki, mwinuko | `2080000.00 6150000.00 250.00` |
| ENZ | mashariki, kaskazini, mwinuko | `6150000.00 2080000.00 250.00` |

Mpangilio usio na P hupa nukta namba 1, 2, 3 … kwa mpangilio wa faili. X ni mashariki na Y ni kaskazini.

## Vitenganishi

CivilCraft inaangalia mistari 20 ya kwanza na kuchagua cha kwanza kati ya hivi kinachoonekana angalau kwenye 60% yake: koma, tabo, nusukoloni. Vinginevyo inagawanya kwenye mfululizo wa nafasi.

- Kwenye faili za koma, tabo na nusukoloni, sehemu iliyo ndani ya alama za nukuu mbili inaweza kubeba kitenganishi (`"FL, NORTH"`), na `""` ndani ya nukuu ni alama moja ya nukuu.
- Kwenye faili zenye nafasi, maelezo yaliyo mwishoni mwa mstari yanaweza kuwa na nafasi: kila kitu baada ya safu ya mwisho ya kuratibu ni maelezo.
- Mistari inayoanza na `#`, `;` au `//`, na mistari tupu, inaruka.
- Alama ya mpangilio wa baiti mwanzoni mwa faili inapuuzwa.

## Safu ya kichwa

Mstari wa kwanza unachukuliwa kama kichwa wakati chini ya sehemu mbili kati ya sehemu zake ni namba. Kama kila sehemu ya kichwa ni jina ambalo CivilCraft inalitambua, mpangilio wa safu unatokana nalo ("from the header row"). Majina yanalinganishwa bila kujali herufi kubwa au ndogo, nafasi, nukta, mistari ya chini, mistari ya kati na mabano:

| Safu | Majina yanayotambuliwa |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Kama jina lolote la kichwa halitambuliki, au majina hayaundi mojawapo ya mipangilio minane, kichwa kinaruka na mpangilio unakisiwa kutoka idadi ya safu.

:::warning
Kichwa kinachotaja safu ya latitudo (`lat`, `latitude`) na safu ya longitudo (`lon`, `long`, `longitude`) kinasomwa kama digrii, si kaskazini na mashariki. Kwenye {{ui:Import}} nukta zinabadilishwa kupitia mfumo wa kuratibu wa mradi, na mradi usio nao unauliza uuchague kwanza. Safu zilizo nje ya ±90° latitudo au ±180° longitudo zinakataliwa. Ona [Ingiza data ya GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Kukisia kutoka idadi ya safu

Bila kichwa kinachoweza kutumika, na **Safu** zikiwa bado kwenye {{ui:Detect}}:

- Safu 5 au zaidi: PNEZD.
- Safu 4: PNEZ wakati safu ya kwanza ni namba nzima kwenye kila mstari wa sampuli na ya nne ni namba; vinginevyo NEZD.
- Safu 3: NEZ.

PNEZD na PENZD haziwezi kutofautishwa kutoka kwa namba. Ukisiaji unafuata **Safu za nukta** katika [Mipangilio ya CivilCraft](topic:settings): P, N, E, Z, D mwanzoni, au P, E, N, Z, D (kisha safu nne zinasomwa kama PENZ na tatu kama ENZ). Mazungumzo yanasema "imekisiwa kutoka idadi ya safu — angalia kwamba kaskazini na mashariki hazijabadilishwa". Chagua mpangilio sahihi kwenye **Safu** ikiwa onyesho la kukagua linaonekana vibaya.

## Jinsi safu zinavyokaguliwa

- Safu inaweza kuacha maelezo.
- Kaskazini na mashariki lazima ziwe namba. Mwinuko unaweza kuwa tupu (nukta inahifadhiwa lakini haitumiki kwenye uso).
- Namba ya nukta inaweza kuwa maandishi yoyote (herufi pia, kama `CP1`), lakini isiwe tupu.
- Namba ya nukta ikijirudia, safu ya kwanza inahifadhiwa na nyingine zinaorodheshwa kama hazikusomwa.
- Maelezo yanahifadhiwa hadi herufi 200; herufi za udhibiti zinageuka kuwa nafasi.
- Hadi safu 200 ambazo hazikusomwa zinahifadhiwa kwa mazungumzo (25 zinaonyeshwa), na zote zinahesabiwa.

## Vikundi vya nukta

Kikundi cha nukta ni neno la kwanza la maelezo yake, likiwa kwa herufi kubwa. "GRD", "grd shot" na "Grd" vyote ni kikundi GRD. Nukta isiyo na maelezo iko kwenye "(hakuna maelezo)". Ona [Ingiza nukta za upimaji](topic:import-points).

## Kuandika nukta

CivilCraft bado haihamishi faili ya maandishi ya nukta. Nukta zinatoka kwenye LandXML (kama CgPoints), kwenye faili ya mradi, na kupitia GIS {{ui:Export}} kama shapefile, GeoPackage au GeoJSON zenye sehemu P, N, E, Z na D ([Hamisha data ya as-built kwa GIS](topic:gis-export)). Ona [Bado haijajengwa](topic:not-built-yet).
