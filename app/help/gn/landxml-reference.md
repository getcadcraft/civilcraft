---
title: LandXML: qué se lee y qué se escribe
summary: Los elementos y atributos de LandXML 1.2 que CivilCraft lee y escribe, elemento por elemento, y todo lo que omite.
keywords: landxml, xml, cgpoints, superficie, tin, líneas de quiebre, límite, alineación, coordgeom, perfil, profalign, pvi, paracurve, pipenetworks, struct, caño, planfeatures, planfeature, línea de elemento, esquema
from: ca3cf359
---

CivilCraft escribe LandXML 1.2 con el espacio de nombres oficial y la ubicación del esquema. Lee cualquier archivo cuyo elemento raíz sea `LandXML` y toma los elementos de abajo por su nombre (los prefijos de espacio de nombres se ignoran; no se revisa la versión). Su lector XML acepta solo las cinco entidades estándar y las referencias numéricas de caracteres; nunca carga un DTD ni un archivo externo. Para los pasos, ver [Intercambiar LandXML](topic:landxml).

LandXML escribe las coordenadas primero el norte: un punto es "N E" o "N E Z".

## Escrito

| Elemento | Lo que CivilCraft escribe |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, áreas en pies cuadrados, volúmenes en yardas cúbicas, diámetros en pulgadas) o `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = el nombre del proyecto |
| `Application` | nombre CivilCraft, fabricante CadCraft |
| `CgPoints` / `CgPoint` | `name` = número de punto, `desc` = descripción, `code` = grupo; texto "N E Z" (o "N E" sin elevación) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw o ccw, `radius`, `length`, `staStart`, `chord`, `delta` (grados), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | el terreno existente a lo largo de la alineación, como pares de estación y elevación (`PntList2D`), dividido donde sale de la superficie |
| `Profile` / `ProfAlign` | el perfil de diseño (llamado "<alineación> design"): `PVI` para los extremos y puntos de ángulo, `ParaCurve` con `length` para las curvas verticales |
| `Surfaces` / `Surface` | `name` y `desc`; primero el terreno existente, luego "Proposed" cuando hay plataformas o corredores nivelados |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (solo terreno existente) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (solo terreno existente, cuando hay uno) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` con `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm o sanitary |
| `Struct` | `name`, `elevRim` (el borde usado, fijo o tomado de la superficie), `elevSump`; `Center`; `CircStruct` con `diameter`; `Invert` con `elev`, `flowDir` in o out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` con `diameter` |
| `PlanFeatures` / `PlanFeature` | uno por línea de elemento: `name`; `CoordGeom` con `Line` (`length`, `Start`, `End`) y `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` y `End` como "N E Z", `Center` como "N E"); `Feature` `code="CivilCraft"` con `Property` use y closed |

No se escribe: plataformas y corredores como objetos (su resultado es la superficie "Proposed"), alineaciones con errores, caños sin ambas cotas de fondo, reglas de red.

## Leído

| Elemento | Lo que CivilCraft toma |
|---|---|
| `Units` | `Imperial` o `Metric`, y su `linearUnit` deciden si son pies o metros. Una unidad desconocida se anota. |
| `Project` | `name` pasa a ser el nombre del proyecto. |
| `CgPoints` / `CgPoint` (también anidados) | name (o `oID`), "N E" o "N E Z", `desc` (o `code`) como descripción |
| `Surface` con `Definition surfType="TIN"` | `Pnts` y `Faces` como terreno existente (solo la primera superficie); las caras invisibles (`i="1"`) se dejan afuera |
| `SourceData` / `Breaklines` | líneas de quiebre 3D, guardadas con la superficie |
| `SourceData` / `Boundaries` | el límite exterior |
| `Alignment` / `CoordGeom` | elementos `Line` y `Curve`; los PI se reconstruyen desde el `PI` de cada curva, o desde su `Center` y tangentes; `staStart` |
| `Profile` / `ProfAlign` | `PVI` y `ParaCurve` (con `length`); el primer perfil de diseño con al menos dos PVI |
| `PlanFeatures` / `PlanFeature` | cada una como línea de elemento: `Line`, `Curve` (su `Start`, `Center`, `End` y `rot`) e `IrregularLine` (`PntList3D` o `PntList2D`) unidos de extremo a extremo (un hueco se une con un segmento recto y se anota); cerrada cuando termina donde empezó; uso y closed desde el `Feature` propio de CivilCraft, si no **Solo dibujado**. Los puntos sin elevación toman 0 (se anota). |
| `Spiral` | espirales clotoides junto a un `Curve` (de entrada y salida; se leen como un PI con radio y longitudes de espiral, y se escriben de nuevo con `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | la primera red que tiene caños: `Struct` (`Center`, `elevRim`, `elevSump`, diámetro de `CircStruct`, `Invert` por caño) y `Pipe` (`refStart`, `refEnd`, diámetro de `CircPipe`) |

## Omitido, y anotado en las notas

- Superficies después de la primera, superficies de grilla y otras superficies que no son TIN
- Alineaciones que contienen elementos `IrregularLine` o `Chain`, espirales que no son clotoides, una espiral entre dos curvas, o que no tienen geometría
- Perfiles de diseño después del primero; curvas verticales `CircCurve` y `UnsymParaCurve` (sus PVI se conservan sin curva)
- Puntos que solo se refieren a otros puntos (`pntRef`), y puntos sin coordenadas legibles
- Nombres de puntos repetidos (se conserva el primero)
- Límites de ocultar, mostrar y recortar datos; líneas de quiebre sin puntos 3D
- Redes de caños después de la primera; tipos de red distintos de storm y sanitary (se leen como storm)
- Estructuras rectangulares, de entrada y de salida (se leen como redondas); caños y canales ovalados, elípticos y en caja (se leen como caños redondos sin tamaño)
- Elementos `Spiral` en las líneas de elemento
- `Parcels`, `Roadways`, `GradeModel` y `Survey`

Los perfiles de terreno (`ProfSurf`) de un archivo no se usan: CivilCraft toma el terreno de la propia superficie.

## Mensajes cuando un archivo no abre

| Mensaje | Significado |
|---|---|
| "Esto es XML pero no LandXML (su elemento raíz es <…>)." | El archivo es otro tipo de XML. |
| "… no tiene puntos, superficies TIN ni alineaciones que CivilCraft pueda leer." | Todo lo del archivo está en la lista de omitidos. Las notas que siguen dicen qué había. |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" | El archivo está dañado o cortado. |
