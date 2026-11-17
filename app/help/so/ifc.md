---
title: Dhoofinta iyo soo dhoofinta IFC
summary: Kaydi mashruuca oo dhan hal fayl IFC oo IFC 4.3, IFC4 ama IFC2x3 ah (xariiqyada, waddooyinka, shaqada dhulka, dusha, derbiyada, tuubooyinka), oo fur fayllada IFC si aad xariiqyada iyo dusha uga soo qaaddo.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, xariiq, ifcalignment, waddo, ifcroad, shaqada dhulka, tin, wax la gudbiyo, la-iibsiga, dhoofi ifc, soo dhoofi ifc
from: 6b998bcf
---

IFC waa qaabka isweydaarsiga furan ee macaamiil badan oo dadweyne ay weydiistaan inuu yahay wax la gudbiyo. CivilCraft wuxuu mashruuca oo dhan ku qoraa hal fayl IFC, wuxuuna xariiqyada iyo dusha dib uga akhriyaa fayllada IFC.

## Dhoofinta

1. Riix {{ui:IFC}} kooxda **Dhoofi** (qaababka ribbon-ka: {{ui:Wax soo saar}} › {{ui:Dhoofi}} › {{ui:IFC}}).
2. Dooro qaabka (schema). **IFC 4.3 ADD2** ayaa kowaad ah oo caadi ah: waa nooca leh xariiqyada, waddooyinka iyo shaqada dhulka. Dooro IFC4 ama IFC2x3 kaliya marka barnaamijka qaataha uusan akhrin karin 4.3.
3. Wada-hadalku wuxuu sheegayaa waxa faylku ku hayn doono iyo waxa qaabka la doortay ka reebayo. Riix {{ui:Dhoofi IFC}}.
   Faylku wuxuu soo degaa sida "*magaca mashruuca*-ifc4x3.ifc", "-ifc4.ifc" ama "-ifc2x3.ifc". CivilCraft wuxuu xasuustaa qaabkii aad ugu dambaysay doortay.

## Waxa qaab kasta ku hayo

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Xariiqyada | IfcAlignment oo leh qaabkeeda jiifka (xariiqyo, qalooca wareegsan, spiral-ka clothoid) iyo qaabkeeda toosan (janjeerro, qalooca parabolic), curves-keeda (IfcCompositeCurve, IfcGradientCurve), station-ka bilowga iyo dhacdooyinka superelevation | Polyline 3D oo ku saaran walxaha civil | Polyline 3D oo ku saaran proxy |
| Corridors | IfcRoad oo leh qaybaha waddada; dariiqyada, garabka waddada, marinka biyaha iyo jidadka socodka sida IfcPavement, dhagaxa xadka sida IfcKerb, xariiqyada beerta; lakab kasta oo dhulka adag sida IfcCourse oo leh dherer, agab iyo mug; janjeerrada dhinacyada sida IfcEarthworksCut iyo IfcEarthworksFill oo leh mugaha jarista iyo buuxinta; xawaaraha naqshadda iyo heerka | Walxaha civil oo loo magacaabay waxa ay yihiin, oo lagu kooxeeyay waddo kasta | Proxy-yo, lagu kooxeeyay waddo kasta |
| Dusha | IfcGeographicElement TERRAIN oo leh shabakad saddexagal ah oo isku xidhan | Shabakado wajiyo saddexagal ah | Moodeelo dusha oo wajiyo ku salaysan (faylal waaweyn) |
| Padyada iyo derbiyada | Dusha padka, janjeerkiisa sida shaqada dhulka, derbiyada taageeraya sida IfcWall RETAININGWALL | Isla, derbiga oo ah nooc derbi oo user-defined | Isla, nooca derbiga ObjectType |
| Shabakadaha tuubooyinka | IfcPipeSegment iyo IfcDistributionChamberElement gudaha IfcDistributionSystem | Isla | IfcFlowSegment iyo qolalka gudaha IfcSystem |
| Goobaynta khariidada | IfcProjectedCRS iyo IfcMapConversion | Isla | ePSet_ProjectedCRS iyo ePSet_MapConversion meesha site-ka |

**Tren** (xariiq leh Railway oo shidan) wuxuu galaa IFC 4.3 sida IfcRailway: isbeddelladiisa nooc u gaar ah (clothoid, cubic parabola, Bloss, Helmert, sine half-wave sida cosine curve, sine), janjeerka dhinacyada sida IfcAlignmentCant, iyo jidkiisa sida makhaadyada, khadadka hoose iyo sariirta dhagaxa, oo leh lakabka hoose ee ka hooseeya. IFC4 iyo IFC2x3 waxay helaan qaybaha isku mid ah sida walxaha civil ama proxy-yo. Markii la furo tren IFC 4.3 isbeddelladiisa iyo janjeerka ayuu dib u soo celiyaa.

Fayl kasta waxa kale oo ku jira parcel-yada (raadka), dhirta iyo dhulka adag ee goobta beerta, iyo jidhka dhismayaasha (mid kasta waa IfcBuilding oo leh dabaqyadiisa), dhammaantood hal goob. Qaybaha sifooyinku waxay qabtaan waxa aad naqshadeysay: istaysiyada, assembly-ga, janjeerrada jarista iyo buuxinta, ballaca iyo tirada dariiqa, invert-ka, rim-ka, dherarka derbiyada; tirooyinka (dherarka, aagagga, mugaha) waa qaybaha IfcElementQuantity.

## Cabbirrada iyo isku-xidhka

Faylku waxa uu ku jiraa cutubka dherarka mashruuca (mitir, ama feet-ka sahanka Mareykanka); aagagga iyo mugaha waa mitir laba-geesood iyo saddex-geesood. Haddii nidaam isku-xidhka (GIS › Isku-xidhka) ku jiro, faylku wuxuu khariidadda ku dhigmaa: bari iyo waqooyiga asalkiisa, iyo wareejinta iyo cabbirka nidaamka dhulka (local), waxay ku jiraan beddelka khariidadda. Haddii aanu jirin, faylku wuxuu duubayaa asalkiisa gudaha ee set-ka sifooyinka oo ma dhigmo khariidad.

## Soo dhoofinta

Fur fayl .ifc {{ui:Fur}} ama ku tuur qorshaha. Wada-hadalka soo dhoofinta wuxuu sheegayaa waxa faylku ku hayo:

- **Xariiqyada** IFC 4.3 (qaabka toosan iyo kan sare) iyo qalooca xariiqyada IFC 4x1 waxay noqdaan xariiqyo CivilCraft leh PI-yadooda, radiyaskooda, dherarka spiral-ka iyo PVI-yadooda. Xariiq aan qaabka PI ee CivilCraft ku hayn karin (qalooca isku dhegan, spiral-ka u dhexeeya laba qalooc, mid ku bilaabma ama ku dhammaada qalooc) lama soo dhoofin, wada-hadalkuna wuxuu sheegayaa sababta.
- **Dusha**: dooro midka noqonaya dhulka jira, ama ku hay kii mashruuca.
- **Wax kale oo dhan** (iyo dusha kale) waxaa lagu muuji karaa muuqaalka 3D sida tixraac. Walxaha tixraacu way jiraan intii mashruuca furan yahay; ma kaydsana faylka mashruuca.

Fayl uu CivilCraft ku qoray IFC4 ama IFC2x3 xariiqyadiisa wuxuu dib u soo celiyaa si sax ah set-yada sifooyinkooda.

## Weli lama dhisin

- Superelevation-ka waddada waxa loo qoraa sida dhacdooyinka superelevation iyo dusha waddada (janjeerka (cant) waa tren-ka).
- Kaydinta walxaha tixraacu fayl mashruuca gudihiisa, iyo soo dhoofinta shabakadaha tuubooyinka ama padyada IFC sida walxo la tafatiri karo.
