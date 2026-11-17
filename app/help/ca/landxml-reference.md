---
title: LandXML: què es llegeix i què s'escriu
summary: Els elements i atributs de LandXML 1.2 que CivilCraft llegeix i escriu, element per element, i tot el que omet.
keywords: landxml, xml, cgpoints, superfície, tin, línies de ruptura, contorn, traçat, coordgeom, perfil, profalign, pvi, paracurve, pipenetworks, struct, tub, planfeatures, planfeature, línia característica, esquema
from: ca3cf359
---

CivilCraft escriu LandXML 1.2 amb l'espai de noms oficial i la ubicació de l'esquema. Llegeix qualsevol fitxer l'element arrel del qual és `LandXML` i pren els elements de sota pel nom (els prefixos d'espai de noms s'ignoren; la versió no es comprova). El seu lector XML accepta només les cinc entitats estàndard i les referències numèriques de caràcters; mai no carrega cap DTD ni fitxer extern. Per als passos, vegeu [Intercanviar LandXML](topic:landxml).

LandXML escriu les coordenades primer el nord (Y): un punt és "N E" o "N E Z".

## S'escriu

| Element | Què escriu CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot; àrees en square feet, volums en cubic yards, diàmetres en inches) o `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = el nom del projecte |
| `Application` | nom CivilCraft, fabricant CadCraft |
| `CgPoints` / `CgPoint` | `name` = número del punt, `desc` = descripció, `code` = grup; text "N E Z" (o "N E" sense cota) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw o ccw, `radius`, `length`, `staStart`, `chord`, `delta` (graus), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | el terreny existent al llarg del traçat, com a parells d'abscissa i cota (`PntList2D`), dividit on deixa la superfície |
| `Profile` / `ProfAlign` | el perfil de projecte (anomenat "<alignment> design"): `PVI` per als extrems i els angles, `ParaCurve` amb `length` per als acords verticals |
| `Surfaces` / `Surface` | `name` i `desc`; primer el terreny existent, i després "Proposed" quan les plataformes o els corredors s'exploren |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (només terreny existent) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (només terreny existent, quan n'hi ha) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` amb `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm o sanitary |
| `Struct` | `name`, `elevRim` (la vora usada, fixada o de la superfície), `elevSump`; `Center`; `CircStruct` amb `diameter`; `Invert` amb `elev`, `flowDir` in o out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` amb `diameter` |
| `PlanFeatures` / `PlanFeature` | una per línia característica: `name`; `CoordGeom` amb `Line` (`length`, `Start`, `End`) i `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` i `End` com "N E Z", `Center` com "N E"); `Feature` `code="CivilCraft"` amb `Property` use i closed |

No s'escriuen: plataformes i corredors com a objectes (el seu resultat és la superfície "Proposed"), traçats amb errors, tubs sense les dues cotes de solera, ni regles de la xarxa.

## Es llegeix

| Element | Què pren CivilCraft |
|---|---|
| `Units` | `Imperial` o `Metric`, i el seu `linearUnit`, decideixen si són peus o metres. Una unitat desconeguda es fa constar. |
| `Project` | `name` esdevé el nom del projecte. |
| `CgPoints` / `CgPoint` (també niats) | name (o `oID`), "N E" o "N E Z", i `desc` (o `code`) com a descripció |
| `Surface` amb `Definition surfType="TIN"` | `Pnts` i `Faces` com a terreny existent (només la primera superfície); les cares invisibles (`i="1"`) s'exclouen |
| `SourceData` / `Breaklines` | línies de ruptura 3D, mantingudes amb la superfície |
| `SourceData` / `Boundaries` | el contorn exterior |
| `Alignment` / `CoordGeom` | elements `Line` i `Curve`; els PI es reconstrueixen de l'element `PI` de cada corba, o del seu `Center` i de les tangents; `staStart` |
| `Profile` / `ProfAlign` | `PVI` i `ParaCurve` (amb `length`); el primer perfil de projecte amb almenys dos PVI |
| `PlanFeatures` / `PlanFeature` | cadascun com a línia característica: `Line`, `Curve` (els seus `Start`, `Center`, `End` i `rot`) i `IrregularLine` (`PntList3D` o `PntList2D`) units d'extrem a extrem (un buit s'uneix amb un segment recte i es fa constar); tancada quan acaba on va començar; ús i tancada des del `Feature` propi de CivilCraft, si no **Només dibuixada**. Els punts sense cota reben 0 (es fa constar). |
| `Spiral` | clotoides al costat d'una `Curve` (d'entrada i de sortida; es llegeixen com un PI amb un radi i longituds d'espiral, i es tornen a escriure amb `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | la primera xarxa que té tubs: `Struct` (`Center`, `elevRim`, `elevSump`, diàmetre de `CircStruct`, `Invert` per tub) i `Pipe` (`refStart`, `refEnd`, diàmetre de `CircPipe`) |

## S'omet, i es nomena a les notes

- Superfícies després de la primera, superfícies de graella i altres superfícies que no són TIN
- Traçats que contenen elements `IrregularLine` o `Chain`, espirals que no són clotoides, una espiral entre dues corbes, o traçats sense geometria
- Perfils de projecte després del primer; acords verticals `CircCurve` i `UnsymParaCurve` (els seus PVI es conserven sense corba)
- Punts que només es refereixen a altres punts (`pntRef`), i punts sense coordenades llegibles
- Noms de punts repetits (es conserva el primer)
- Contorns d'ocultació, de mostra i de retall de dades; línies de ruptura sense punts 3D
- Xarxes de tubs després de la primera; tipus de xarxa que no siguin storm ni sanitary (es llegeixen com a storm)
- Estructures rectangulars, d'entrada i de sortida (es llegeixen com a rodones); tubs i canals ovals, el·líptics i en caixa (es llegeixen com a tubs rodons sense mida)
- Elements `Spiral` en línies característiques
- `Parcels`, `Roadways`, `GradeModel` i `Survey`

Els perfils del terreny (`ProfSurf`) d'un fitxer no s'usen: CivilCraft agafa el terreny de la mateixa superfície.

## Missatges quan un fitxer no s'obre

| Missatge | Significat |
|---|---|
| "Això és XML però no LandXML (el seu element arrel és <…>)." | El fitxer és un altre tipus de XML. |
| "… no té punts, superfícies TIN ni traçats que CivilCraft pugui llegir." | Tot el del fitxer és a la llista d'omissions. Les notes següents diuen què hi havia. |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" | El fitxer està malmès o truncat. |
