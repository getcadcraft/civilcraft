---
title: Qaababka faylalka barta
summary: Habka tiirarka ee CivilCraft akhristo, sida uu u helo kala-soocaha iyo safka madaxa, magacyada madaxa ee uu aqoonsado, iyo sida safafka loo hubiyo.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, qaabka faylka barta, tiirarka, madaxa, kala-soocaha
from: 84fab42e
---

Fayl barta waa qoraal fudud, hal bar safka kasta. CivilCraft wuu akhrisaa browser-ka; waxba lama soo rarin.

## Habka tiirarka

Xarfaha waxay magacabinayaan tiirarka laga bilaabo bidix ilaa midig: **P** lambarka ama magaca barta, **N** woqooyi-koorsi (northing), **E** bari-galbeed (easting), **Z** sare-joogga (elevation), **D** sharraxaadda.

| Habka | Tiirarka | Tusaale safka |
|---|---|---|
| PNEZD | barta, woqooyi-koorsi, bari-galbeed, sare-joog, sharraxaad | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | barta, bari-galbeed, woqooyi-koorsi, sare-joog, sharraxaad | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | barta, woqooyi-koorsi, bari-galbeed, sare-joog | `101,2080000.00,6150000.00,250.00` |
| PENZ | barta, bari-galbeed, woqooyi-koorsi, sare-joog | `101,6150000.00,2080000.00,250.00` |
| NEZD | woqooyi-koorsi, bari-galbeed, sare-joog, sharraxaad | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | bari-galbeed, woqooyi-koorsi, sare-joog, sharraxaad | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | woqooyi-koorsi, bari-galbeed, sare-joog | `2080000.00 6150000.00 250.00` |
| ENZ | bari-galbeed, woqooyi-koorsi, sare-joog | `6150000.00 2080000.00 250.00` |

Hababka aan P lahayn waxay dhibcaha lambarkeenayaan 1, 2, 3 … sida ay fayl ku jiraan. X waa bari-galbeed, Y waa woqooyi-koorsi.

## Kala-soocayaasha

CivilCraft wuxuu eegaa 20 safka ugu horreeya, wuxuuna doortaa kii ugu horreeya ee ku dhaca ugu yaraan 60% dhammaantood: comma, tab, semicolon. Haddii kale wuxuu kala-jajabiyaa meelaha bannaan oo isku xiga.

- Faylalka comma, tab iyo semicolon, goobta ku dhex jirta xigashooyin laba-geesood ah ayaa ku jiri kara kala-soocaha (`"FL, NORTH"`), `""` gudaha xigashooyinka waa hal calaamad xigasho.
- Faylalka meel-bannaanka lagu kala-soocayo, sharraxaadda ku dhammaanta safka waxay ku jiri kartaa meelo bannaan: wax kasta oo ka dambeeya tiirka ugu dambeeya ee isku-xidhka waa sharraxaad.
- Safafka ku bilaabma `#`, `;` ama `//`, iyo safafka banaan waa la dhaafaa.
- Calaamadda bilowga faylka (byte-order mark) waa la iska dhaafaa.

## Safka madaxa

Safka koowaad waxaa loo tixgeliyaa madax marka ka yar laba goob oo ka mid ah ay yihiin tirooyin. Haddii goob kasta oo madaxa ah uu yahay magac uu CivilCraft aqoonsado, habka tiirarka wuxuu ka imanayaa ("safka madaxa ka soo baxa"). Magacyada waxaa la isku dhigaa iyadoo aan loo eegin xarfaha weyn-yar, meelaha bannaan, dhibcaha, hoosta-hoosta, iyo xidhka:

| Tiir | Magacyada la aqoonsado |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Haddii magac madax aan la aqoonsan, ama magacyadu aanay mid ka mid ah siddeedda habab sameyn, madaxa waa la dhaafaa, habka tiirarkana waxaa loo qiyaasaa tirada tiirarka.

:::warning
Madax leh magac latitude (`lat`, `latitude`) iyo magac longitude (`lon`, `long`, `longitude`) labaduba waxaa loo akhriyaa darajo, ma aha woqooyi-koorsi iyo bari-galbeed. {{ui:Soo dhoofi}} dhibcaha waxaa loo beddelaa nidaamka kala-sarrayn ee mashruuca, mashruuc aan lahayn wuxuu marka hore kuu weydiin doonaa inaad doorato. Safafka ka baxsan ±90° latitude ama ±180° longitude waa la diidaa. Eeg [Soo dhoofi xogta GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Qiyaasta tirada tiirarka

Haddii madax lagu isticmaali karo ma jiro oo **Tiirarka** uu weli ku joogo {{ui:Ogaag}}:

- 5 ama ka badan tiirar: PNEZD.
- 4 tiirar: PNEZ marka tiirka koowaad yahay lambar oo dhan safka kasta la qaaday, tiirka afaraadna yahay tiro; haddii kale NEZD.
- 3 tiirar: NEZ.

PNEZD iyo PENZD lama kala saari karo tirooyinka. Qiyaasta waxay raacdaa **Safafka barta** ee [Dejinta CivilCraft](topic:settings): P, N, E, Z, D bilowga, ama P, E, N, Z, D (markaas afar tiir waxaa loo akhriyaa PENZ, saddex tiirna ENZ). Wada-hadalku wuxuu leeyahay "qiyaasta tirada tiirarka — hubi in woqooyi-koorsi iyo bari-galbeed aanay is-beddelin". Haddii muuqaalku khaldan yahay, dooro habka saxda ah **Tiirarka** hoose.

## Sida safafka loo hubiyo

- Safku wuu ka saari karaa sharraxaadda.
- Woqooyi-koorsi iyo bari-galbeed waa inay noqdaan tirooyin. Sare-joogga wuu madhan karaa (barta way ka soo kaydsan tahay laakiin uma adeegsanto dusha sare).
- Lambarka barta wuxuu noqon karaa qoraal kasta (xarfo ayaa ku jiri kara, sida `CP1`), laakiin waa inuu ku jirtaa.
- Haddii lambarka barta uu soo noqnoqdo, safka hore ayaa la hayaa, kuwa kalena waxaa lagu liis gareeyaa sida aan la akhrin.
- Sharraxaadaha waxa la hayaa ilaa 200 xaraf; xarfaha xakamaynta waxay noqdaan meelo bannaan.
- Ilaa 200 safaf aan la akhrin ayaa la hayaa wada-hadalka (25 ayaa la muujiyaa), dhammaantoodna waa la tiriyaa.

## Kooxaha barta

Kooxda barta waa ereyga koowaad ee sharraxaaddeeda oo weyn. "GRD", "grd shot" iyo "Grd" dhammaantood waa kooxda GRD. Barta aan sharraxaad lahayn waxay ku jirtaa "(no description)". Eeg [Soo dhoofi dhibcaha sahanka](topic:import-points).

## Qorista dhibcaha

CivilCraft weli ma dhoofiyo fayl qoraal oo barta ah. Dhibcaha waxaa loo dhoofiyaa LandXML (sida CgPoints), faylka mashruuca, iyo {{ui:Dhoofi}} GIS sida shapefile, GeoPackage ama GeoJSON oo leh goobaha P, N, E, Z iyo D ([Dhoofi xogta as-built ee GIS](topic:gis-export)). Eeg [Weli lama dhisin](topic:not-built-yet).
