---
title: IFC útflutningur og innflutningur
summary: Vistaðu allt verkefnið sem eina IFC-skrá í IFC 4.3, IFC4 eða IFC2x3 (veglínur, vegir, jarðvinna, yfirborð, veggir, lagnir), og opnaðu IFC-skrár fyrir veglínur þeirra og yfirborð.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, veglína, ifcalignment, vegur, ifcroad, jarðvinna, tin, skil, innkaup, flytja út ifc, flytja inn ifc
from: 6b998bcf
---

IFC er opið skiptasnið sem margir opinberir verkkaupar biðja um sem skil. CivilCraft skrifar allt verkefnið í eina IFC-skrá og les veglínur og yfirborð til baka úr IFC-skrám.

## Útflutningur

1. Smelltu á {{ui:IFC}} í hópnum **Flytja út** (í borðastílunum: {{ui:Úttak}} › {{ui:Flytja út}} › {{ui:IFC}}).
2. Veldu skemað. **IFC 4.3 ADD2** er fyrst og sjálfgefið: það er útgáfan með veglínum, vegum og jarðvinnu. Veldu IFC4 eða IFC2x3 aðeins þegar hugbúnaður móttakanda getur ekki lesið 4.3.
3. Gluggi segir hvað skráin mun innihalda og hvað valið skema sleppir. Smelltu á {{ui:Flytja út IFC}}.
   Skráin er sótt sem "*heiti verkefnis*-ifc4x3.ifc", "-ifc4.ifc" eða "-ifc2x3.ifc". CivilCraft man síðasta skemað sem þú valdir.

## Hvað hvert skema geymir

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Veglínur | IfcAlignment með láréttri (línur, hringbogar, klóþoíðu-spíralar) og lóðréttri (hallar, parabólubogar) uppsetningu, bogum þeirra (IfcCompositeCurve, IfcGradientCurve), upphafsstöð og yfirhækkunaratburðum | Þrívíð fjöllína á jarðverkshluta | Þrívíð fjöllína á staðgengli |
| Vegastrengir | IfcRoad með vegarhlutum; akreinar, axlir, rennur og gangstéttir sem IfcPavement, kantsteinar sem IfcKerb, gróðurrenningar; hvert yfirborðslag sem IfcCourse með þykkt, efni og rúmmáli; hliðarhallarnir sem IfcEarthworksCut og IfcEarthworksFill með gröfts- og fyllingarrúmmálum; hönnunarhraði og flokkur | Jarðverkshlutir nefndir eftir því sem þeir eru, flokkaðir eftir vegi | Staðgenglar, flokkaðir eftir vegi |
| Yfirborð | IfcGeographicElement TERRAIN með óreglulegu þríhyrningsneti | Þríhyrnd flatarsöfn | Flatarlíkön byggð á flötum (stærri skrár) |
| Pallar og veggir | Efri hlið palls, hallar hans sem jarðvinna, stoðveggir sem IfcWall RETAININGWALL | Eins, veggurinn sem notandaskilgreind veggtegund | Eins, tegund veggjarins í ObjectType |
| Lagnanet | IfcPipeSegment og IfcDistributionChamberElement í IfcDistributionSystem | Eins | IfcFlowSegment og brunnar í IfcSystem |
| Staðsetning á korti | IfcProjectedCRS og IfcMapConversion | Eins | ePSet_ProjectedCRS og ePSet_MapConversion á svæðinu |

**Járnbraut** (veglína með járnbraut kveikta) fer í IFC 4.3 sem IfcRailway: umskipti hennar sem eigin gerðir (klóþoíða, þriðjugráðu parabóla, Bloss, Helmert, sínus hálf-bylgja sem kósínusbogi, sínus), halli hennar sem IfcAlignmentCant, og brautin hennar sem teinar, svellur og undirlag, með undirundirlagi undir. IFC4 og IFC2x3 fá sömu hluta sem jarðverkshluta eða staðgengla. Þegar IFC 4.3 járnbraut er opnuð koma umskipti hennar og halli til baka.

Sérhver skrá ber einnig lóðir (fótspor), plöntur og harðyfirborð landslagsvinnusvæðisins og byggingarmassa (hver IfcBuilding með hæðum sínum), allt á einu svæði. Eiginleikasöfn geyma það sem þú hannaðir: stöðvar, samsetninguna, gröfts- og fyllingarhallana, akreinabreidd og fjölda, botnhæðir, brúnahæðir, veggjahæðir; magntölur (lengdir, flatarmál, rúmmál) eru IfcElementQuantity söfn.

## Einingar og hnit

Skráin er í lengdareiningu verkefnisins (metrar, eða bandarískir mælifætur (US survey feet)); flatarmál og rúmmál eru í fermetrum og rúmmetrum. Með hnitakerfi (GIS › Hnit) er skráin sett á kortið: austur- og norðurhnit upphafspunkts hennar, og snúningur og kvarði staðbundins kerfis, eru í kortbreytingunni. Án þess skráir skráin staðbundna upphafspunktinn sinn í eiginleikasafn og er ekki sett á kort.

## Innflutningur

Opnaðu .ifc-skrá með {{ui:Opna}} eða slepptu henni á teikninguna. Innflutningsglugginn segir hvað skráin geymir:

- **Veglínur** úr IFC 4.3 (lárétt og lóðrétt uppsetning) og IFC 4x1 veglínubogar verða CivilCraft-veglínur með PI-punktum sínum, radíusum, spíralalengdum og PVI. Veglína sem PI-líkan CivilCraft getur ekki haldið (samsettir bogar, spíralar á milli tveggja boga, veglína sem byrjar eða endar í boga) er ekki flutt inn, og glugginn segir af hverju.
- **Yfirborð**: veldu það sem verður núverandi land, eða haltu því sem verkefnið hefur.
- **Allt annað** (og hin yfirborðin) er hægt að sýna í 3D-sýninni til viðmiðunar. Viðmiðunarhlutir haldast meðan verkefnið er opið; þeir eru ekki vistaðir í verkefnaskránni.

Skrá sem CivilCraft skrifaði í IFC4 eða IFC2x3 skilar veglínum sínum nákvæmlega til baka úr eiginleikasöfnum þeirra.

## Ekki smíðað enn

- Yfirhækkun vegar er skrifuð sem yfirhækkunaratburðir og í vegyfirborðunum (halli er fyrir járnbrautir).
- Að vista viðmiðunarhluti í verkefnaskrána, og flytja inn lagnanet eða palla úr IFC sem breytanlega hluti.
