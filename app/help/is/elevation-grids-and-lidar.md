---
title: Hæðarnet og LiDAR
summary: Búðu til núverandi land úr DEM (GeoTIFF eða ASCII-neti) eða LiDAR-punktum (LAS, LAZ) — veldu svæði, grisjaðu gögnin, veldu flokka og athugaðu hæðareiningarnar — og skilaðu yfirborði aftur sem GeoTIFF-hæðarneti.
keywords: dem, dtm, hæðarnet, geotiff, tif, ascii grid, asc, lidar, las, laz, punktaþyrping, flokkar, land, grisjun, engin gögn, rastur, flytja út geotiff, gis
from: c8b2d18a
---

Opinber hæðargögn koma á tvo vegu: **hæðarnet** (DEM: ein hæð fyrir hvern ferhyrndan reit, venjulega GeoTIFF-skrá `.tif` eða ASCII-net `.asc`) og **LiDAR-punktar** (milljónir leysimælinga í `.las`-skrá, eða `.laz` þegar hún er þjöppuð). CivilCraft breytir hvoru tveggja í mælipunkta eða yfirborð, inni í vafranum: ekkert er hlaðið upp.

## Opna skrána

1. Smelltu á {{ui:Opna}} (eða {{ui:Flytja inn}} í GIS-hópnum) og veldu skrána, eða dragðu hana á grunnmyndina. Fyrir ASCII-net velurðu líka `.prj`-skrána, svo CivilCraft viti hnitakerfið.
2. Innflutningsglugginn sýnir það sem skráin segir um sjálfa sig: stærð hennar, reiti eða punkta, hnitakerfi, hvar hún er í breiddar- og lengdargráðum og hæðarbil hennar. Fyrir LiDAR les hann fyrst alla punktana einu sinni til að telja **flokkana** (framvindustika sýnir hversu langt er komið; {{ui:Hætta við}} stöðvar það).

GeoTIFF-skrá með þremur eða fjórum rásum (rauðu, grænu, bláu) er mynd, ekki hæðargögn: hún fer í kortlögin í staðinn.

## Veldu hvað á að sækja

- **Svæði**: {{ui:Umfang verkefnisins og jaðar}} (skrifaðu jaðarinn), {{ui:Það sem grunnmyndin sýnir núna}}, eða {{ui:Öll skráin}}. Aðeins sá hluti skráarinnar er lesinn.
- **Grisja í**: bilið milli punktanna sem þú færð, í einingum verkefnisins. Línan undir stillingunum sýnir hversu marga punkta það gefur þegar þú skrifar. Fyrir net heldur CivilCraft hverjum öðrum, þriðja … reit, þannig að hæðirnar haldast nákvæmlega eins og í skránni; það meðaltalar aldrei reiti saman. Fyrir LiDAR er svæðinu skipt í ferninga af þessari stærð og einn punktur er geymdur í hverjum ferningi: {{ui:Punkturinn næst miðju hvers reits}} (sjálfgefið), {{ui:Lægsti punktur í hverjum reit}} (gott þegar skráin hefur engan landflokk: landið er undir trjánum) eða {{ui:Meðaltal punkta í hverjum reit}}.
- **Flokkar** (LiDAR): land (flokkur 2) er hakað þegar skráin hefur það; byggingar, tré og truflanir eru skilin út undan. Þegar enginn landflokkur er til eru allir flokkar hakaðir og glugginn segir það.
- **Land** (LiDAR, 0.8): drónaþyrping hefur engan landflokk. Þegar skráin hefur engan byrjar glugginn á {{ui:Finna landið sjálfur (drónaþyrpingar, enginn landflokkur)}}: allir flokkar nema truflanir eru lesnir, lægsti punktur í hverjum reit er geymdur, og síðan tekur CivilCraft byggingar, tré og villta lágpunkta út með stigvaxandi formfræðisíu (Zhang o.fl., 2003) sem þú getur stýrt: **Stærsti hlutur sem tekinn er út** (breidd stærstu byggingar; gluggarnir stækka þar til þeir þekja hana; 0 þýðir 20 reitir) og **Brattasti hallinn á landinu**. Vinnan fer fram á neti lægstu punkta, þannig að þyrping með tugum milljóna punkta kostar ekki meira en reitafjöldi hennar (grisjunin er ein straumsending). Bilið er reiturinn: grófari reitur er hraðari og missir smáa hluti minna en þú gætir búist við, fínni reitur heldur meiri smáatriðum í landinu. Skýrslan segir hversu margir punktar voru geymdir sem land, hversu margir reitir voru teknir út sem hlutir og hversu margir villtir lágpunktar voru felldir niður. Í prófunardæmi með 300 m drónamælingu með fimm byggingum, 70 trjám og 200 lágum frávikspunktum voru geymdu punktarnir innan 3 cm frá réttu landslagi og ekkert þak eða krónuþak var geymt.
- **Hæðir í skránni**: metrar, fet eða bandarísk mælingafet. Þegar skráin segir til um það er einingin þegar valin. Þegar hún gerir það ekki verðurðu að velja: glugginn sýnir hæðarbilið á báða vegu svo þú getir séð hvað á við um staðinn.
- **Flytja inn sem** (aðeins net): {{ui:Mælipunktar (lýsing DEM)}} eða {{ui:Yfirborðið sjálft (net þríhyrninga)}}.

Einn innflutningur tekur mest 500,000 punkta. Þegar val myndi gefa fleiri segir glugginn hversu marga og hvaða bil myndi passa, og {{ui:Flytja inn}} er óvirkt.

Smelltu á {{ui:Flytja inn}}. Framvindustika sýnir lesturinn; {{ui:Hætta við}} stöðvar hann og engu breytist.

:::warning
Lóðréttar einingar eru algeng gildra. Mörg DEM í landshnitakerfi eru með austur- og norðurhnit í fetum en hæðir í metrum. Berðu hæðarbilið sem glugginn sýnir saman við það sem þú veist um staðinn.
:::

## Það sem þú færð

- **Mælipunktar**: númeraðir á eftir hæsta punktanúmerinu þínu, með lýsingunni `DEM` (net) eða `LIDAR`, þannig að þeir mynda einn punktahóp undir **Punktar** og byggja yfirborðið eins og aðrir punktar. Innflutningur þeirra er eitt skref: {{key:Mod+Z}} tekur þá út aftur.
- **Yfirborðið sjálft**: TIN-net úr netinu, tveir þríhyrningar í hverjum reit, klofið eftir ská frá suðvestri til norðausturs. Þríhyrningur sem hefur horn án gagna er skilinn út undan, þannig að göt í gögnunum haldast göt. Yfirborðið er jafnt netinu í hverjum netpunkti og er slétt plan innan hvers þríhyrnings á milli þeirra. Það kemur í stað yfirborðs verkefnisins (glugginn spyr fyrst); {{key:Mod+Z}} skilar fyrra yfirborðinu. Fyrirsögn vinstra spjaldsins segir **Yfirborð (úr hæðarneti)**.

## Hnitakerfi

- Ef verkefnið hefur hnitakerfi og skráin nefnir annað, er hver punktur umbreyttur í kerfi verkefnisins (og í landhnit eða staðbundin hnit þegar þau eru til).
- Ef verkefnið hefur ekkert og hnitakerfi skráarinnar er í einingum verkefnisins (fetum eða metrum), býður glugginn upp á að gera það að hnitakerfi verkefnisins, í sama afturköllunarskrefi og punktarnir.
- Ef skráin er í breiddar- og lengdargráðum, eða í metrum fyrir fetaverkefni, spyr glugginn fyrst hvaða hnitakerfi verkefnisins eigi að velja.
- Ef skráin segir ekki til um það, eru tölurnar teknar sem hnit verkefnisins. Þú getur valið hnitakerfi skráarinnar í staðinn.

## Flytja yfirborð út sem GeoTIFF

1. Smelltu á {{ui:Flytja út}} í GIS-hópnum.
2. Í GeoTIFF-hlutanum velurðu yfirborðið (fyrirliggjandi land eða sléttaða yfirborðið) og stærð reitsins. Sjálfgefið kemur frá meðaljaðri þríhyrninga yfirborðsins. Glugginn sýnir stærð netsins sem verður skrifað.
3. Smelltu á {{ui:Sækja GeoTIFF}}.

Skráin er ein rás með 32 bita fleytitölum í einingum verkefnisins, yfir útbreiðslu yfirborðsins; reitir utan yfirborðsins eru „engin gögn“ (−3.4028235e38). Gildi hvers reits er hæð yfirborðsins í miðju reitsins. Hnitin eru **net**-hnit: verkefni í landhnitum eða staðbundnum hnitum er umbreytt aftur yfir í netið. Skráin nefnir hnitakerfi verkefnisins með EPSG-kóða sínum; kerfi án EPSG-kóða er ekki skrifað og glugginn varar þig við að segja GIS-deildinni hvaða kerfi það er.

## Það sem var prófað

- Lesendur GeoTIFF- og ASCII-neta voru prófaðir gegn GDAL (í gegnum rasterio), bókasafninu sem flest GIS-forrit nota til að lesa þessar skrár: 32 bita fleytitölu- og 16 bita heiltölunet, flísað og í ræmum, DEFLATE og LZW, engin gögn, kvarði og frávik, pixel-is-point, UTM-net, landshnitanet í bandarískum mælingafetum og net í breiddar- og lengdargráðum — öll gildi jöfn.
- Lesendur LAS og LAZ voru prófaðir gegn laspy: LAS 1.2 og 1.4, punktasnið 0, 1, 3, 6, 7 og 8, með og án hnitakerfis, og LAZ skrifað af bakenda sem er samhæfur LASzip — allir punktar jafnir.
- Umbreytt hnit voru prófuð gegn PROJ að 1 mm.
- Útfluttar GeoTIFF-skrár voru lesnar aftur af GDAL: hnitakerfi, staða reita, engin gögn, einingar og gildi jöfn yfirborðinu að 0.0001.
- Ekkert hér hefur verið opnað í öðrum GIS- eða CAD-forritum.

## Ekki smíðað enn

- Breytingar á lóðréttu viðmiðunarfleti (geoid-líkön): hæðir eru notaðar eins og skráin hefur þær.
- Bylgjugögn, LiDAR-endurkast annað en eftir flokkum, litir og styrkleikar.
- Margar rásir, yfirlitsmyndir eða skrár yfir 200 MB.
- Skrif á LAS eða LAZ úr yfirborði eða úr þessu tóli (viðbótin [Punktaþyrpingar](topic:point-clouds) skrifar hreinsaða þyrpingu sem LAS 1.4 eða LAZ).
