---
title: Formatet e skedarëve të pikave
summary: Renditjet e kolonave që lexon CivilCraft, si gjen ndarësin dhe rreshtin e kokës, cilët emra kolonash njeh, dhe si kontrollohen rreshtat.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, format skedari pikash, kolona, kokë, ndarës
from: 84fab42e
---

Një skedar pikash është tekst i thjeshtë, një pikë për rresht. CivilCraft e lexon në shfletues; asgjë nuk ngarkohet.

## Renditjet e kolonave

Shkronjat emërtojnë kolonat nga e majta në të djathtë: **P** numri ose emri i pikës, **N** veriu (northing), **E** lindja (easting), **Z** kota, **D** përshkrimi.

| Renditja | Kolonat | Rresht shembull |
|---|---|---|
| PNEZD | pikë, veri, lindje, kotë, përshkrim | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | pikë, lindje, veri, kotë, përshkrim | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | pikë, veri, lindje, kotë | `101,2080000.00,6150000.00,250.00` |
| PENZ | pikë, lindje, veri, kotë | `101,6150000.00,2080000.00,250.00` |
| NEZD | veri, lindje, kotë, përshkrim | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | lindje, veri, kotë, përshkrim | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | veri, lindje, kotë | `2080000.00 6150000.00 250.00` |
| ENZ | lindje, veri, kotë | `6150000.00 2080000.00 250.00` |

Renditjet pa P i numërojnë pikat 1, 2, 3 … sipas radhës në skedar. X është lindja dhe Y është veriu.

## Ndarësit

CivilCraft shikon 20 rreshtat e parë dhe zgjedh të parin nga këta që shfaqet në të paktën 60% të tyre: presje, tab, pikëpresje. Përndryshe ndan sipas grupeve të hapësirave.

- Në skedarët me presje, tab dhe pikëpresje, një fushë në thonjëza mund të përmbajë ndarësin (`"FL, NORTH"`), dhe `""` brenda thonjëzave është një thonjëz.
- Në skedarët e ndarë me hapësira, një përshkrim në fund të rreshtit mund të përmbajë hapësira: gjithçka pas kolonës së fundit koordinative është përshkrimi.
- Rreshtat që fillojnë me `#`, `;` ose `//`, dhe rreshtat bosh, kapërcehen.
- Një shenjë byte-order (BOM) në fillim të skedarit injorohet.

## Rreshti i kokës

Rreshti i parë trajtohet si kokë kur më pak se dy nga fushat e tij janë numra. Nëse çdo fushë e kokës është një emër që CivilCraft njeh, renditja e kolonave vjen prej tij ("nga rreshti i kokës"). Emrat krahasohen pa u kujdesur për shkronjat e mëdha/të vogla, hapësirat, pikat, nënvizimet, vizat e lidhjes dhe kllapat:

| Kolona | Emrat e njohur |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Nëse ndonjë emër kokë nuk njihet, ose emrat nuk formojnë një nga tetë renditjet, koka kapërcehet dhe renditja merret nga numri i kolonave.

:::warning
Një kokë që emëron si kolonën e gjerësisë (`lat`, `latitude`) ashtu edhe kolonën e gjatësisë (`lon`, `long`, `longitude`) lexohet si gradë, jo si veri dhe lindje. Te {{ui:Importo}} pikat konvertohen përmes sistemit të koordinatave të projektit, dhe një projekt pa të pyet fillimisht ta zgjedhësh. Rreshtat jashtë ±90° gjerësi ose ±180° gjatësi refuzohen. Shih [Importo të dhënat GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Marrja nga numri i kolonave

Pa kokë të përdorshme dhe me **Kolonat** lënë te {{ui:Zbulo}}:

- 5 ose më shumë kolona: PNEZD.
- 4 kolona: PNEZ kur kolona e parë është numër i plotë në çdo rresht të marrë, dhe e katërta është numër; përndryshe NEZD.
- 3 kolona: NEZ.

PNEZD dhe PENZD nuk dallohen nga numrat. Marrja e renditjes ndjek **Rreshtat e pikave** te [Cilësimet e CivilCraft](topic:settings): P, N, E, Z, D në fillim, ose P, E, N, Z, D (atëherë katër kolona lexohen si PENZ dhe tri si ENZ). Dialogu thotë "marrë nga numri i kolonave — kontrollo që veriu dhe lindja të mos jenë ndërruar". Zgjidh renditjen e saktë te **Kolonat** nëse pamja paraprake duket e gabuar.

## Si kontrollohen rreshtat

- Një rresht mund ta lërë përshkrimin jashtë.
- Veriu dhe lindja duhet të jenë numra. Kota mund të jetë bosh (pika mbahet, por nuk përdoret në sipërfaqe).
- Numri i pikës mund të jetë çdo tekst (edhe shkronja, si `CP1`), por jo bosh.
- Nëse një numër pike përsëritet, rreshti i parë mbahet dhe të tjerët listohen si të palexuar.
- Përshkrimet mbahen deri në 200 karaktere; karakteret e kontrollit bëhen hapësira.
- Deri në 200 rreshta të palexuar mbahen për dialogun (25 shfaqen), dhe të gjithë numërohen.

## Grupet e pikave

Grupi i një pike është fjala e parë e përshkrimit të saj, me shkronja të mëdha. "GRD", "grd shot" dhe "Grd" janë të gjitha grupi GRD. Një pikë pa përshkrim është te "(pa përshkrim)". Shih [Importo pikat e rilevimit](topic:import-points).

## Shkrimi i pikave

CivilCraft ende nuk eksporton skedar tekst pikash. Pikat dalin në LandXML (si CgPoints), në skedarin e projektit, dhe përmes {{ui:Eksporto}} GIS si shapefile, GeoPackage ose GeoJSON me fushat P, N, E, Z dhe D ([Eksporto të dhënat as-built për GIS](topic:gis-export)). Shih [Ende nuk është ndërtuar](topic:not-built-yet).
