---
title: Snið punktaskráa
summary: Dálkaraðirnar sem CivilCraft les, hvernig það finnur skiljuna og hausröðina, hvaða heiti hausa það þekkir og hvernig línur eru yfirfarnar.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, snið punktaskráa, dálkar, haus, skilja
from: 84fab42e
---

Punktaskrá er venjulegur texti, einn punktur í línu. CivilCraft les hana í vafranum; ekkert er hlaðið upp.

## Dálkaraðir

Stafirnir nefna dálkana frá vinstri til hægri: **P** punktsnúmer eða heiti, **N** norðurhnit, **E** austurhnit, **Z** hæð, **D** lýsing.

| Röð | Dálkar | Dæmi um línu |
|---|---|---|
| PNEZD | punktur, norðurhnit, austurhnit, hæð, lýsing | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punktur, austurhnit, norðurhnit, hæð, lýsing | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punktur, norðurhnit, austurhnit, hæð | `101,2080000.00,6150000.00,250.00` |
| PENZ | punktur, austurhnit, norðurhnit, hæð | `101,6150000.00,2080000.00,250.00` |
| NEZD | norðurhnit, austurhnit, hæð, lýsing | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | austurhnit, norðurhnit, hæð, lýsing | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | norðurhnit, austurhnit, hæð | `2080000.00 6150000.00 250.00` |
| ENZ | austurhnit, norðurhnit, hæð | `6150000.00 2080000.00 250.00` |

Raðir án P númera punktana 1, 2, 3 … í skráarröð. X er austurhnit og Y er norðurhnit.

## Skiljur

CivilCraft skoðar fyrstu 20 línurnar og velur þá fyrstu af þessum sem kemur fyrir í að minnsta kosti 60% þeirra: komma, tabbstafur, semíkomma. Annars skiptir það á runum af bilum.

- Í skrám með kommu, tabbstaf og semíkommu getur reitur í tvöföldum gæsalöppum borið skiljuna (`"FL, NORTH"`), og `""` innan gæsalappa er eitt gæsalappamerki.
- Í skrám með bilum getur lýsing aftast í línunni innihaldið bil: allt sem kemur eftir síðasta hnitdálkinn er lýsingin.
- Línur sem byrja á `#`, `;` eða `//`, og auðar línur, eru sleppt.
- Bæti-raðarmerki (BOM) í upphafi skrárinnar er hunsað.

## Hausröð

Fyrsta línan er tekin sem haus þegar færri en tveir reitir hennar eru tölur. Ef hver reitur hauss er heiti sem CivilCraft þekkir kemur dálkaröðin úr honum („úr hausröðinni"). Heiti eru borin saman án tillits til há- og lágstafa, bila, punkta, undirstrika, bandstrika og hornklofa:

| Dálkur | Þekkt heiti |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Ef eitthvert heiti hauss er ekki þekkt, eða heitin mynda ekki eina af átta röðunum, er hausinn sleppt og röðin er giskuð út frá fjölda dálka.

:::warning
Haus sem nefnir bæði breiddardálk (`lat`, `latitude`) og lengdardálk (`lon`, `long`, `longitude`) er lesinn sem gráður, ekki sem norðurhnit og austurhnit. Við {{ui:Flytja inn}} eru punktarnir umreiknaðir í gegnum hnitakerfi verkefnisins, og verkefni án hnitakerfis biður þig um að velja það fyrst. Línur utan ±90° breiddar eða ±180° lengdar eru hafnaðar. Sjá [Flytja inn GIS-gögn](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Giskað út frá fjölda dálka

Án nothæfs hauss og með **Dálkar** stillt á {{ui:Greina}}:

- 5 eða fleiri dálkar: PNEZD.
- 4 dálkar: PNEZ þegar fyrsti dálkurinn er heil tala í öllum sýndu línunum og sá fjórði er tala; annars NEZD.
- 3 dálkar: NEZ.

PNEZD og PENZD er ekki hægt að greina í sundur út frá tölunum. Giskið fylgir **Punktaraðir** í [CivilCraft-stillingum](topic:settings): P, N, E, Z, D fremst, eða P, E, N, Z, D (þá eru fjórir dálkar lesnir sem PENZ og þrír sem ENZ). Glugginn segir „giskað út frá fjölda dálka — athugaðu hvort norðurhnit og austurhnit séu víxluð". Veldu rétta röð í **Dálkar** ef forskoðunin er röng.

## Hvernig línur eru yfirfarnar

- Línu má sleppa lýsingunni.
- Norðurhnit og austurhnit verða að vera tölur. Hæð má vera auð (punkturinn er varðveittur en er ekki notaður í yfirborðinu).
- Punktsnúmerið má vera hvaða texti sem er (líka bókstafir, eins og `CP1`), en má ekki vera autt.
- Ef punktsnúmer endurtekst er fyrsta línan geymd og hinar skráðar sem ólesnar.
- Lýsingar eru geymdar upp í 200 stafi; stjórnstafir verða að bilum.
- Allt að 200 ólesnar línur eru geymdar fyrir gluggann (25 sýndar), og þær eru allar taldar.

## Punktahópar

Hópur punkts er fyrsta orðið í lýsingu hans í hástöfum. „GRD", „grd shot" og „Grd" eru allt hópur GRD. Punktur án lýsingar er í „(engin lýsing)". Sjá [Flytja inn mælipunkta](topic:import-points).

## Skrifun punkta

CivilCraft flytur ekki út punktatextaskrá enn. Punktar fara út í LandXML (sem CgPoints), í verkefnisskrána og með GIS-{{ui:Flytja út}} sem shapefile, GeoPackage eða GeoJSON með P, N, E, Z og D reitum ([Flytja út gögn eins og byggt fyrir GIS](topic:gis-export)). Sjá [Ekki smíðað enn](topic:not-built-yet).
