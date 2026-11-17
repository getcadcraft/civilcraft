---
title: Exportació i importació IFC
summary: Deseu tot el projecte en un sol fitxer IFC en IFC 4.3, IFC4 o IFC2x3 (traçats, carreteres, moviments de terres, superfícies, murs, canonades), i obriu fitxers IFC per als seus traçats i superfícies.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, traçat, ifcalignment, carretera, ifcroad, moviments de terres, tin, lliurable, licitació, exporta ifc, importa ifc
from: 6b998bcf
---

IFC és el format obert d'intercanvi que molts clients públics demanen com a lliurable. CivilCraft escriu tot el projecte en un sol fitxer IFC i llegeix traçats i superfícies de fitxers IFC.

## Exportació

1. Feu clic a {{ui:IFC}} al grup {{ui:Exporta}} (en els estils de la cinta: {{ui:Sortida}} › {{ui:Exporta}} › {{ui:IFC}}).
2. Trieu l'esquema. **IFC 4.3 ADD2** és el primer i el predeterminat: és l'edició amb traçats, carreteres i moviments de terres. Trieu IFC4 o IFC2x3 només quan el programari del destinatari no pugui llegir la 4.3.
3. El diàleg explica què contindrà el fitxer i què deixa fora l'esquema triat. Feu clic a {{ui:Exporta IFC}}.
   El fitxer es baixa com a "*nom del projecte*-ifc4x3.ifc", "-ifc4.ifc" o "-ifc2x3.ifc". CivilCraft recorda l'últim esquema que heu triat.

## Què conté cada esquema

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Traçats | IfcAlignment amb els seus dissenys horitzontal (rectes, arcs circulars, clotoides espirals) i vertical (pendents, corbes parabòliques), les seves corbes (IfcCompositeCurve, IfcGradientCurve), l'abscissa inicial i els esdeveniments de peralt | Una polilínia 3D sobre un element civil | Una polilínia 3D sobre un proxy |
| Corredors | IfcRoad amb parts de carretera; carrils, arcens, cunetes i voreres com a IfcPavement, les vorades com a IfcKerb, franges de plantació; cada capa de paviment com a IfcCourse amb el seu gruix, material i volum; els talussos laterals com a IfcEarthworksCut i IfcEarthworksFill amb els volums de desmunt i terraplè; la velocitat de projecte i la classe | Elements civils amb el nom del que són, agrupats per carretera | Proxies, agrupats per carretera |
| Superfícies | IfcGeographicElement TERRAIN amb una xarxa triangular irregular | Conjunts de cares triangulades | Models de superfície basats en cares (fitxers més grans) |
| Plataformes i murs | El dalt de la plataforma, els seus talussos com a moviments de terres, els murs de contenció com a IfcWall RETAININGWALL | Igual, amb el mur com a tipus de mur definit per l'usuari | Igual, amb el tipus del mur a ObjectType |
| Xarxes de canonades | IfcPipeSegment i IfcDistributionChamberElement en un IfcDistributionSystem | Igual | IfcFlowSegment i cambres en un IfcSystem |
| Georeferenciació | IfcProjectedCRS i IfcMapConversion | Igual | ePSet_ProjectedCRS i ePSet_MapConversion a l'emplaçament |

Un **ferrocarril** (un traçat amb Ferrocarril activat) va a IFC 4.3 com a IfcRailway: les seves transicions com a tipus propis (clotoide, paràbola cúbica, Bloss, Helmert, semisinus com a corba cosinus, sinus), el seu peralt com a IfcAlignmentCant, i la seva via com a carrils, travesses i llit de balast, amb la subbalastra per sota. IFC4 i IFC2x3 reben les mateixes parts com a elements civils o proxies. Obrir un ferrocarril IFC 4.3 en recupera les transicions i el peralt.

Tots els fitxers porten també parcel·les (petjades), les plantes i els paviments de l'espai de treball Paisatgisme, i volums d'edifici (cadascun un IfcBuilding amb les seves plantes), tot en un sol emplaçament. Els conjunts de propietats porten el que heu projectat: els PK, la secció tipus, els talussos de desmunt i terraplè, l'amplada i el nombre de carrils, les cotes de solera, les cotes de tapa i les alçades dels murs; les quantitats (longituds, àrees, volums) són conjunts IfcElementQuantity.

## Unitats i coordenades

El fitxer està en la unitat de longitud del projecte (metres, o peus de topògraf dels EUA); les àrees i els volums són en metres quadrats i cúbics. Amb un sistema de coordenades (GIS › Coordenades) el fitxer se situa al mapa: la X (est) i la Y (nord) de la seva origen, i la rotació i l'escala d'un sistema local (de terreny), es guarden a la conversió del mapa. Sense sistema, el fitxer registra la seva origen local en un conjunt de propietats i no se situa a cap mapa.

## Importació

Obriu un fitxer .ifc amb {{ui:Obre}} o deixeu-lo caure al pla. El diàleg d'importació explica què conté el fitxer:

- **Traçats** de IFC 4.3 (els dissenys horitzontal i vertical) i de les corbes de traçat de IFC 4x1 esdevenen traçats de CivilCraft amb els seus PI, radis, longituds d'espirals i PVI. Un traçat que el model de PI de CivilCraft no pot contenir (corbes compostes, espirals entre dues corbes, un que comença o acaba en una corba) no s'importa, i el diàleg n'explica el motiu.
- **Superfícies**: trieu la que esdevé el terreny actual, o manteniu la del projecte.
- **La resta** (i les altres superfícies) es pot mostrar a la vista 3D com a referència. Els elements de referència es mantenen mentre el projecte és obert; no es desen al fitxer del projecte.

Un fitxer que CivilCraft ha escrit en IFC4 o IFC2x3 en recupera els traçats exactament a partir dels seus conjunts de propietats.

## Encara no implementat

- El peralt d'una carretera s'escriu com a esdeveniments de peralt i a les superfícies de la carretera (el peralt és per als ferrocarrils).
- Desar elements de referència al fitxer del projecte, i importar des d'IFC xarxes de canonades o plataformes com a objectes editables.
