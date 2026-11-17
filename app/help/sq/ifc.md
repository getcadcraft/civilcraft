---
title: Eksporti dhe importi IFC
summary: Ruaj të gjithë projektin si një skedar IFC të vetëm në IFC 4.3, IFC4 ose IFC2x3 (aks rrugor, rrugë, punë dheu, sipërfaqe, mure, tuba), dhe hap skedarë IFC për aksin rrugor dhe sipërfaqet e tyre.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, aks rrugor, ifcalignment, rrugë, ifcroad, punë dheu, tin, dorëzim, prokurim, eksporto ifc, importo ifc
from: 6b998bcf
---

IFC është formati i hapur i shkëmbimit që shumë klientë publikë kërkojnë si dorëzim. CivilCraft e shkruan të gjithë projektin në një skedar IFC të vetëm dhe lexon aksin rrugor dhe sipërfaqet nga skedarët IFC.

## Eksporti

1. Kliko {{ui:IFC}} në grupin **Eksporto** (në stilet e shiritit: {{ui:Dalja}} › {{ui:Eksporto}} › {{ui:IFC}}).
2. Zgjidh skemën. **IFC 4.3 ADD2** është e para dhe parazgjedhja: është versioni me aks rrugor, rrugë dhe punë dheu. Zgjidh IFC4 ose IFC2x3 vetëm kur programi i marrësit nuk lexon 4.3.
3. Dialogu thotë çfarë do të mbajë skedari dhe çfarë lë jashtë skema e zgjedhur. Kliko {{ui:Eksporto IFC}}.
   Skedari shkarkohet si "*emri i projektit*-ifc4x3.ifc", "-ifc4.ifc" ose "-ifc2x3.ifc". CivilCraft kujton skemën që zgjodhe më herët.

## Çfarë mban secila skemë

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Aksi rrugor | IfcAlignment me layout-et e tij horizontale (vija, harqe rrethore, spirale klotoide) dhe vertikale (pjerrësi, kurba parabolike), kurbat e tyre (IfcCompositeCurve, IfcGradientCurve), stacioni fillestar dhe ngjarjet e superelevacionit | Një polivijë 3D në një element civil | Një polivijë 3D në një proxy |
| Korridoret | IfcRoad me pjesë rrugore; korsitë, bankinat, kanalet dhe trotuaret si IfcPavement, bordurat si IfcKerb, shirita mbjelljeje; çdo shtresë shtrimi si IfcCourse me trashësinë, materialin dhe vëllimin e saj; pjerrësitë anësore si IfcEarthworksCut dhe IfcEarthworksFill me vëllimet e prerjes dhe mbushjes; shpejtësia e projektimit dhe klasa | Elemente civile të emërtuara për atë që janë, të grupuara për rrugë | Proxy, të grupuara për rrugë |
| Sipërfaqet | IfcGeographicElement TERRAIN me një rrjet të trekëndëzuar të parregullt | Grupe fytyrash të trekëndëzuara | Modele sipërfaqesh të bazuara në fytyra (skedarë më të mëdhenj) |
| Platformat dhe muret | Maja e platformës, pjerrësitë e saj si punë dheu, muret mbajtëse si IfcWall RETAININGWALL | Njëjtë, muri si lloj muri i përcaktuar nga përdoruesi | Njëjtë, lloji i murit në ObjectType |
| Rrjetet e tubave | IfcPipeSegment dhe IfcDistributionChamberElement në një IfcDistributionSystem | Njëjtë | IfcFlowSegment dhe pusetat në një IfcSystem |
| Gjeoreferencimi | IfcProjectedCRS dhe IfcMapConversion | Njëjtë | ePSet_ProjectedCRS dhe ePSet_MapConversion në vend |

Një **hekurudhë** (një aks me Railway të ndezur) hyn në IFC 4.3 si IfcRailway: kalimet e saj si tipe të veçanta (klotoide, parabolë kubike, Bloss, Helmert, gjysmëvalë sinusi si kurbë kosinusi, sinus), kalimi i saj si IfcAlignmentCant, dhe shinat e saj si shina, traversa dhe shtrati i ballastit, me nënballastin poshtë. IFC4 dhe IFC2x3 marrin të njëjtat pjesë si elemente civile ose proxy. Hapja e një hekurudhe IFC 4.3 i sjell kalimet dhe kalimin përsëri.

Çdo skedar mban gjithashtu parcelat (gjurmët), bimët dhe elementet e ngurta të hapësirës së Peizazhit, dhe masat e ndërtesave (secila një IfcBuilding me katet e saj), të gjitha në një vend. Grupet e vetive mbartin atë që projektove: stacionet, asamblimin, pjerrësitë e prerjes dhe mbushjes, gjerësinë dhe numrin e korsive, nivelet e fundit, buzët e pusetave, lartësitë e mureve; sasitë (gjatësi, sipërfaqe, vëllime) janë grupe IfcElementQuantity.

## Njësitë dhe koordinatat

Skedari është në njësinë e gjatësisë së projektit (metra, ose këmbë të anketës amerikane); sipërfaqet dhe vëllimet janë në metra katrorë dhe kubikë. Me një sistem koordinatash (GIS › Koordinatat) skedari vendoset në hartë: lindja dhe veriu i origjinës së tij, dhe rrotullimi dhe shkalla e një sistemi lokal (tokësor), janë në konvertimin e hartës. Pa një të tillë, skedari regjistron origjinën e tij lokale në një grup vetish dhe nuk vendoset në hartë.

## Importi

Hap një skedar .ifc me {{ui:Hap}} ose lësho-e mbi plan. Dialogu i importit thotë çfarë mban skedari:

- **Aksi rrugor** nga IFC 4.3 (layout-et horizontale dhe vertikale) dhe kurbat e aksit IFC 4x1 bëhen aksa CivilCraft me PI-të, rrezet, gjatësitë e spiraleve dhe PVI-të e tyre. Një aks që modeli PI i CivilCraft nuk mund ta mbajë (kurba të përbëra, spirale midis dy kurbave, një që fillon ose mbaron në kurbë) nuk importohet, dhe dialogu thotë pse.
- **Sipërfaqet**: zgjidh atë që bëhet terreni ekzistues, ose mbaje atë të projektit.
- **Çdo gjë tjetër** (dhe sipërfaqet e tjera) mund të shfaqet në pamjen 3D si referencë. Elementët e referencës qëndrojnë ndërsa projekti është i hapur; nuk ruhen në skedarin e projektit.

Një skedar që CivilCraft e ka shkruar në IFC4 ose IFC2x3 i sjell aksin rrugor saktësisht përsëri nga grupet e vetive.

## Nuk është bërë ende

- Superelevacioni i një rrugë shkruhet si ngjarje superelevacioni dhe në sipërfaqet e rrugës (kalimi është për hekurudhat).
- Ruajtja e elementeve të referencës në skedarin e projektit, dhe importimi i rrjeteve të tubave ose i platformave nga IFC si objekte të redaktueshme.
