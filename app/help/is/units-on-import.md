---
title: Einingar við innflutning, skrá segir til um einingar sínar eða spurt er fyrst
summary: Þegar teikning eða möskvi sem þú flytur inn í verkefni segir til um einingar sínar umreiknar CivilCraft þær og segir frá því. Þegar hún gerir það ekki spyr CivilCraft áður en hún les hana inn og man svarið þitt fyrir þá skrá.
keywords: einingar, innflutningur, DWG, DXF, STL, OBJ, mæling, fet, US survey feet, metrar, millimetrar, kvarði, rangt stærð, of stórt, of lítið, spyrja, munað, INSUNITS, einingar teikningar
from: 60921963
---

## Það sem þú gerir

Flyttu skrá inn í verkefni og gakktu úr skugga um að hún komi inn í réttri stærð.

## Skref

1. Opnaðu skrána eins og venjulega: {{ui:Opna}}, dragðu hana á teikninguna, eða CAD-teikniskipunina.
2. Ef skráin segir til um einingar sínar er ekkert spurt: innflutningsglugginn sýnir þær sem **Eins og teikningin segir**.
3. Ef hún gerir það ekki, spyr gluggi um **Einingar** skrárinnar áður en innflutningsglugginn opnast. Veldu hvað ein eining í skránni er og smelltu á {{ui:Nota þessar einingar}}.
4. {{ui:Hætta við}} (eða {{key:Esc}}) sleppir skránni. Ekkert úr henni er lesið inn í verkefnið.

## Hvaða skrár segja til um einingar sínar

- **DWG og DXF**: innsetningareiningar teikningarinnar (`$INSUNITS`). Um skrá án þeirra er spurt. Listinn **Einingar teikningar** í innflutningsglugganum byrjar á svarinu þínu og getur samt breyst.
- **STL og OBJ** (frjáls form landslags): segja aldrei til um einingar. Þér er spurt.
- **Punktalistar** (CSV, TXT) og framvindulistar mælinga: listi sem segir til um einingu sína í fyrstu línunum er umreiknaður og stöðulínan segir frá því. Listi sem gerir það ekki er spurður þegar þú ýtir á {{ui:Flytja inn}}, áður en punktarnir fara inn. Dálkar fyrir breidd og lengd fara í staðinn í gegnum hnitakerfið.
- **Viðbótin Punktaský**: spyr þegar þú býrð til ský sem skráin segir engar einingar til um, og merkir tölur skýsins í þeirri einingu sem það ber.
- **IFC og LandXML**: segja til um sínar; þær eru umreiknaðar í einingar verkefnisins.
- **LAS, LAZ og hæðarrasterar**: settir eftir hnitakerfi sínu; landslagsglugginn spyr um hæðareininguna þegar skráin segir hana ekki.

## Gott að vita

- Svarið er munað fyrir þá skrá á þessari tölvu, í öllum CadCraft-forritum. Næst þegar hún kemur inn er ekki spurt.
- Til að vera spurð aftur: skipanaspjaldið ({{key:Mod+K}}) › **Spyrja aftur um einingar innfluttra skráa**.
- Eining sem listi gefur upp er lesin úr fyrstu átta línunum: lína eins og `units: ft`, eða dálkafyrirsagnir sem bera allar sömu einingu í sviga, eins og `Elevation (m)`.
