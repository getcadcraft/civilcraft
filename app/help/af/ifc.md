---
title: IFC-uitvoer en -invoer
summary: Stoor die hele projek as een IFC-lêer in IFC 4.3, IFC4 of IFC2x3 (belynings, paaie, grondwerk, oppervlaktes, mure, pype), en maak IFC-lêers oop vir hul belynings en oppervlaktes.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, belyning, ifcalignment, pad, ifcroad, grondwerk, tin, oplewering, aanskaffing, voer ifc uit, voer ifc in
from: 6b998bcf
---

IFC is die oop uitruilformaat wat baie openbare kliënte as 'n oplewering vra. CivilCraft skryf die hele projek in een IFC-lêer en lees belynings en oppervlaktes terug uit IFC-lêers.

## Uitvoer

1. Klik {{ui:IFC}} in die **Uitvoer**-groep (in die lintstyle: {{ui:Uitvoer}} › {{ui:Uitvoer}} › {{ui:IFC}}).
2. Kies die skema. **IFC 4.3 ADD2** is eerste en die verstek: dit is die uitgawe met belynings, paaie en grondwerk. Kies IFC4 of IFC2x3 slegs wanneer die ontvanger se sagteware nie 4.3 kan lees nie.
3. Die dialoog sê wat die lêer sal hou en wat die gekose skema weglaat. Klik {{ui:Voer IFC uit}}.
   Die lêer laai af as "*projeknaam*-ifc4x3.ifc", "-ifc4.ifc" of "-ifc2x3.ifc". CivilCraft onthou die skema wat jy laas gekies het.

## Wat elke skema hou

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Belynings | IfcAlignment met sy horisontale (lyne, sirkelboë, klotoïde-spirale) en vertikale (hellings, parabolise kurwes) uitlegte, hul kurwes (IfcCompositeCurve, IfcGradientCurve), die beginstasie en die superhoogte-gebeurtenisse | 'n 3D-polilyn op 'n siviele element | 'n 3D-polilyn op 'n proxy |
| Korridors | IfcRoad met padonderdele; bane, skouers, geute en sypaadjies as IfcPavement, randstene as IfcKerb, beplantingstroke; elke plaveiselkursus as 'n IfcCourse met sy dikte, materiaal en volume; die sykante as IfcEarthworksCut en IfcEarthworksFill met die sny- en vulvolumes; die ontwerpspoed en -klas | Siviele elemente wat genoem word na wat hulle is, gegroepeer per pad | Proxies, gegroepeer per pad |
| Oppervlaktes | IfcGeographicElement TERRAIN met 'n getrianguleerde onreëlmatige netwerk | Getrianguleerde vlakstelle | Vlakgebaseerde oppervlakmodelle (groter lêers) |
| Plataforms en mure | Die plataform se bokant, sy hellings as grondwerk, keermure as IfcWall RETAININGWALL | Dieselfde, die muur as 'n gebruikergedefinieerde muurtipe | Dieselfde, die muur se tipe in ObjectType |
| Pypnetwerke | IfcPipeSegment en IfcDistributionChamberElement in 'n IfcDistributionSystem | Dieselfde | IfcFlowSegment en kamers in 'n IfcSystem |
| Georeferering | IfcProjectedCRS en IfcMapConversion | Dieselfde | ePSet_ProjectedCRS en ePSet_MapConversion op die terrein |

'n **Spoorlyn** (belyning met Spoorlyn aan) gaan in IFC 4.3 as 'n IfcRailway: sy oorgange as hul eie tipes (klotoïde, kubiese parabool, Bloss, Helmert, sinus-halfgolf as kosinuskurwe, sinus), sy verhang as IfcAlignmentCant, en sy baan as rels, dwarsbalke en die ballastbed, met die subballast daaronder. IFC4 en IFC2x3 kry dieselfde dele as siviele elemente of proxies. Om 'n IFC 4.3-spoorlyn oop te maak, bring sy oorgange en verhang terug.

Elke lêer dra ook erwe (voetspore), die Landskap-werkruimte se plante en verhardings, en gebou-massas (elk 'n IfcBuilding met sy verdiepings), alles in een terrein. Eiendomstelle dra wat jy ontwerp het: stasies, die samestelling, sny- en vulhellings, baanwydte en -getal, invert, rande, muurhoogtes; hoeveelhede (lengtes, oppervlaktes, volumes) is IfcElementQuantity-stelle.

## Eenhede en koördinate

Die lêer is in die projek se lengte-eenheid (meter, of US-opmetingsvoet); oppervlaktes en volumes is in vierkante en kubieke meter. Met 'n koördinaatstelsel (GIS › Koördinate) word die lêer op die kaart geplaas: sy oorsprong se oos- en noordwaarde, en 'n grond- (plaaslike) stelsel se rotasie en skaal, is in die kaartomskakeling. Sonder een hou die lêer sy plaaslike oorsprong in 'n eiendomstel aan en word dit nie op 'n kaart geplaas nie.

## Invoer

Maak 'n .ifc-lêer oop met {{ui:Maak oop}} of laat dit op die plan val. Die invoerdialoog sê wat die lêer hou:

- **Belynings** uit IFC 4.3 (die horisontale en vertikale uitlegte) en IFC 4x1-belyningskurwes word CivilCraft-belynings met hul PI's, radiusse, spiraallengtes en PVI's. 'n Belyning wat CivilCraft se PI-model nie kan hou nie (saamgestelde kurwes, spirale tussen twee kurwes, een wat in 'n kurwe begin of eindig), word nie ingevoer nie, en die dialoog sê hoekom.
- **Oppervlaktes**: kies die een wat die bestaande grond word, of hou die projek s'n.
- **Alles anders** (en die ander oppervlaktes) kan in die 3D-aansig as verwysing gewys word. Verwysingselemente bly solank die projek oop is; hulle word nie in die projeklêer gestoor nie.

'n Lêer wat CivilCraft in IFC4 of IFC2x3 geskryf het, bring sy belynings presies terug uit hul eiendomstelle.

## Nog nie gebou nie

- 'n Pad se superhoogte word geskryf as superhoogte-gebeurtenisse en in die padoppervlaktes (verhang is vir spoorlyne).
- Verwysingselemente in die projeklêer stoor, en pypnetwerke of plataforms uit IFC as redigeerbare voorwerpe invoer.
