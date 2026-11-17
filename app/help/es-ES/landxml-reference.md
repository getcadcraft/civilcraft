---
title: LandXML: qué se lee y qué se escribe
summary: Los elementos y atributos de LandXML 1.2 que CivilCraft lee y escribe, elemento por elemento, y todo lo que omite.
keywords: landxml, xml, cgpoints, superficie, tin, líneas de rotura, límite, trazado, coordgeom, perfil, profalign, pvi, paracurve, pipenetworks, struct, tubería, planfeatures, planfeature, línea de elemento, esquema
from: ca3cf359
---

CivilCraft escribe LandXML 1.2 con el espacio de nombres oficial y la ubicación del esquema. Lee cualquier archivo cuyo elemento raíz sea `LandXML` y toma los elementos siguientes por nombre (los prefijos de espacio de nombres se ignoran; la versión no se comprueba). Su lector XML acepta solo las cinco entidades estándar y las referencias numéricas de carácter; nunca carga una DTD ni un archivo externo. Para los pasos, consulte [Intercambiar LandXML](topic:landxml).

LandXML escribe las coordenadas primero en norte: un punto es "N E" o "N E Z".

## Escrito

| Elemento | Lo que escribe CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, areas in square feet, volumes in cubic yards, diameters in inches) o `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = el nombre del proyecto |
| `Application` | nombre CivilCraft, fabricante CadCraft |
| `CgPoints` / `CgPoint` | `name` = número del punto, `desc` = descripción, `code` = grupo; texto "N E Z" (o "N E" sin cota) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw o ccw, `radius`, `length`, `staStart`, `chord`, `delta` (grados), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | el terreno existente a lo largo del trazado, como pares de estación y cota (`PntList2D`), dividido donde sale de la superficie |
| `Profile` / `ProfAlign` | el perfil de proyecto (llamado "<alignment> design"): `PVI` para los extremos y los puntos de ángulo, `ParaCurve` con `length` para las curvas verticales |
| `Surfaces` / `Surface` | `name` y `desc`; primero el terreno existente, después "Proposed" cuando las plataformas o los corredores explanan |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (solo terreno existente) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (solo terreno existente, cuando lo hay) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` con `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm o sanitary |
| `Struct` | `name`, `elevRim` (el brocal usado, fijado o tomado de la superficie), `elevSump`; `Center`; `CircStruct` con `diameter`; `Invert` con `elev`, `flowDir` in o out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` con `diameter` |
| `PlanFeatures` / `PlanFeature` | una por cada línea de elemento: `name`; `CoordGeom` con `Line` (`length`, `Start`, `End`) y `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` y `End` como "N E Z", `Center` como "N E"); `Feature` `code="CivilCraft"` con `Property` de uso y closed |

No se escriben: plataformas y corredores como objetos (su resultado es la superficie "Proposed"), trazados con errores, tuberías sin ambas soleras, ni reglas de la red.

## Leído

| Elemento | Lo que toma CivilCraft |
|---|---|
| `Units` | `Imperial` o `Metric` y su `linearUnit` deciden entre pies o metros. Una unidad desconocida se anota. |
| `Project` | `name` pasa a ser el nombre del proyecto. |
| `CgPoints` / `CgPoint` (también anidados) | nombre (o `oID`), "N E" o "N E Z", `desc` (o `code`) como descripción |
| `Surface` con `Definition surfType="TIN"` | `Pnts` y `Faces` como terreno existente (solo la primera superficie); las caras invisibles (`i="1"`) se omiten |
| `SourceData` / `Breaklines` | líneas de rotura 3D, conservadas con la superficie |
| `SourceData` / `Boundaries` | el límite exterior |
| `Alignment` / `CoordGeom` | elementos `Line` y `Curve`; los PI se reconstruyen a partir del `PI` de cada curva, o de su `Center` y tangentes; `staStart` |
| `Profile` / `ProfAlign` | `PVI` y `ParaCurve` (con `length`); el primer perfil de proyecto con al menos dos PVI |
| `PlanFeatures` / `PlanFeature` | cada una como línea de elemento: `Line`, `Curve` (sus `Start`, `Center`, `End` y `rot`) e `IrregularLine` (`PntList3D` o `PntList2D`) unidas de extremo a extremo (un hueco se une con un segmento recto y se anota); cerrada cuando termina donde empezó; uso y cerrada desde el `Feature` propio de CivilCraft; si no, **Solo dibujada**. Los puntos sin cota reciben 0 (se anota). |
| `Spiral` | espirales de clotoide junto a un `Curve` (de entrada y de salida; se leen como PI con radio y longitudes de espiral, y se escriben con `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | la primera red que tiene tuberías: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` por tubería) y `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Omitido, y anotado en las notas

- Superficies posteriores a la primera, superficies de malla y otras superficies que no son TIN
- Trazados que contienen elementos `IrregularLine` o `Chain`, espirales distintas de la clotoide, una espiral entre dos curvas, o trazados sin geometría
- Perfiles de proyecto posteriores al primero; curvas verticales `CircCurve` y `UnsymParaCurve` (sus PVI se conservan sin curva)
- Puntos que solo se refieren a otros puntos (`pntRef`), y puntos sin coordenadas legibles
- Nombres de punto repetidos (se conserva el primero)
- Límites de ocultar, mostrar y recortar datos; líneas de rotura sin puntos 3D
- Redes de tuberías posteriores a la primera; tipos de red distintos de storm y sanitary (se leen como storm)
- Estructuras rectangulares, de entrada y de salida (se leen como redondas); tuberías y canales ovoides, elípticos y en cajón (se leen como tuberías redondas sin tamaño)
- Elementos `Spiral` en los elementos de planta
- `Parcels`, `Roadways`, `GradeModel` y `Survey`

Los perfiles de terreno (`ProfSurf`) de un archivo no se usan: CivilCraft toma el terreno de la propia superficie.

## Mensajes cuando un archivo no se abre

| Mensaje | Significado |
|---|---|
| "Esto es XML, pero no LandXML (su elemento raíz es <…>)." | El archivo es otro tipo de XML. |
| "… no tiene puntos, superficies TIN ni trazados que CivilCraft pueda leer." | Todo lo del archivo está en la lista de omitidos. Las notas posteriores indican qué había. |
| "Etiqueta de cierre no coincidente …", "Etiqueta sin cerrar …", "El archivo termina dentro de …" | El archivo está dañado o cortado. |
