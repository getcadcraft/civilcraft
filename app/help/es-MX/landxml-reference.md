---
title: LandXML: qué se lee y qué se escribe
summary: Los elementos y atributos de LandXML 1.2 que CivilCraft lee y escribe, elemento por elemento, y todo lo que omite.
keywords: landxml, xml, cgpoints, superficie, tin, líneas de quiebre, límite, alineación, coordgeom, perfil, profalign, pvi, paracurve, pipenetworks, struct, tubería, planfeatures, planfeature, línea característica, esquema
from: ca3cf359
---

CivilCraft escribe LandXML 1.2 con el espacio de nombres oficial y la ubicación del esquema. Lee cualquier archivo cuyo elemento raíz sea `LandXML` y toma los elementos siguientes por nombre (los prefijos de espacio de nombres se ignoran; la versión no se verifica). Su lector XML acepta solo las cinco entidades estándar y las referencias numéricas de caracteres; nunca carga un DTD ni un archivo externo. Para los pasos, vea [Intercambiar LandXML](topic:landxml).

LandXML escribe las coordenadas con el norte primero: un punto es "N E" o "N E Z".

## Escrito

| Elemento | Qué escribe CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, áreas en pies cuadrados, volúmenes en yardas cúbicas, diámetros en pulgadas) o `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = el nombre del proyecto |
| `Application` | nombre CivilCraft, fabricante CadCraft |
| `CgPoints` / `CgPoint` | `name` = número de punto, `desc` = descripción, `code` = grupo; texto "N E Z" (o "N E" sin elevación) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw o ccw, `radius`, `length`, `staStart`, `chord`, `delta` (grados), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | el terreno existente a lo largo de la alineación, como pares de estación y elevación (`PntList2D`), dividido donde sale de la superficie |
| `Profile` / `ProfAlign` | el perfil de diseño (nombrado "<alignment> design"): `PVI` para los extremos y los puntos de quiebre, `ParaCurve` con `length` para las curvas verticales |
| `Surfaces` / `Surface` | `name` y `desc`; primero el terreno existente, luego "Proposed" cuando las plataformas o las obras lineales dan nivel |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (solo el terreno existente) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (solo el terreno existente, cuando lo hay) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` con `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm o sanitary |
| `Struct` | `name`, `elevRim` (el brocal usado, fijo o tomado de la superficie), `elevSump`; `Center`; `CircStruct` con `diameter`; `Invert` con `elev`, `flowDir` in o out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` con `diameter` |
| `PlanFeatures` / `PlanFeature` | una por cada línea característica: `name`; `CoordGeom` con `Line` (`length`, `Start`, `End`) y `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` y `End` como "N E Z", `Center` como "N E"); `Feature` `code="CivilCraft"` con `Property` use y closed |

No se escriben: plataformas y obras lineales como objetos (su resultado es la superficie "Proposed"), alineaciones con errores, tuberías sin sus dos plantillas (inverts), ni reglas de la red.

## Leído

| Elemento | Qué toma CivilCraft |
|---|---|
| `Units` | `Imperial` o `Metric` y su `linearUnit` deciden si son pies o metros. Una unidad desconocida se anota. |
| `Project` | `name` pasa a ser el nombre del proyecto. |
| `CgPoints` / `CgPoint` (también anidados) | name (o `oID`), "N E" o "N E Z", `desc` (o `code`) como descripción |
| `Surface` con `Definition surfType="TIN"` | `Pnts` y `Faces` como terreno existente (solo la primera superficie); las caras invisibles (`i="1"`) se omiten |
| `SourceData` / `Breaklines` | líneas de quiebre 3D, conservadas con la superficie |
| `SourceData` / `Boundaries` | el límite exterior |
| `Alignment` / `CoordGeom` | elementos `Line` y `Curve`; los PI se reconstruyen desde el `PI` de cada curva, o desde su `Center` y sus tangentes; `staStart` |
| `Profile` / `ProfAlign` | `PVI` y `ParaCurve` (con `length`); el primer perfil de diseño con al menos dos PVI |
| `PlanFeatures` / `PlanFeature` | cada una como línea característica: `Line`, `Curve` (su `Start`, `Center`, `End` y `rot`) e `IrregularLine` (`PntList3D` o `PntList2D`) unidos de extremo a extremo (un hueco se une con un segmento recto y se anota); cerrada cuando termina donde empezó; use y closed desde el `Feature` propio de CivilCraft, si no, **Solo dibujada**. Los puntos sin elevación reciben 0 (se anota). |
| `Spiral` | espirales clotoides junto a un `Curve` (de entrada y de salida; se leen como un PI con radio y longitudes de espiral, y se escriben de vuelta con `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | la primera red que tiene tuberías: `Struct` (`Center`, `elevRim`, `elevSump`, diámetro de `CircStruct`, `Invert` por tubería) y `Pipe` (`refStart`, `refEnd`, diámetro de `CircPipe`) |

## Omitido, y anotado en las notas

- Superficies después de la primera, superficies de cuadrícula y otras superficies que no son TIN
- Alineaciones que contienen elementos `IrregularLine` o `Chain`, espirales que no son clotoides, una espiral entre dos curvas, o alineaciones sin geometría
- Perfiles de diseño después del primero; curvas verticales `CircCurve` y `UnsymParaCurve` (sus PVI se conservan sin curva)
- Puntos que solo hacen referencia a otros puntos (`pntRef`), y puntos sin coordenadas legibles
- Nombres de puntos repetidos (se conserva el primero)
- Límites de ocultar, mostrar y recorte de datos; líneas de quiebre sin puntos 3D
- Redes de tuberías después de la primera; tipos de red distintos de storm y sanitary (se leen como storm)
- Estructuras rectangulares, de entrada y de salida (se leen como redondas); tuberías y canales de huevo, elípticos o de caja (se leen como tuberías redondas sin tamaño)
- Elementos `Spiral` en las líneas características
- `Parcels`, `Roadways`, `GradeModel` y `Survey`

Los perfiles de terreno (`ProfSurf`) de un archivo no se usan: CivilCraft toma el terreno de la propia superficie.

## Mensajes cuando un archivo no se abre

| Mensaje | Significado |
|---|---|
| "This is XML but not LandXML (its root element is <…>)." | Esto es XML, pero no LandXML (su elemento raíz es <…>). El archivo es otro tipo de XML. |
| "… has no points, TIN surfaces or alignments CivilCraft can read." | "… no tiene puntos, superficies TIN ni alineaciones que CivilCraft pueda leer." Todo lo del archivo está en la lista de omitidos. Las notas posteriores indican qué había. |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" | "Etiqueta de cierre no coincide …", "Etiqueta sin cerrar …", "El archivo termina dentro de …". El archivo está dañado o cortado. |
