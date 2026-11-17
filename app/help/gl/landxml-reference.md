---
title: LandXML: o que se lee e se escribe
summary: Os elementos e atributos de LandXML 1.2 que CivilCraft lee e escribe, elemento a elemento, e todo o que omite.
keywords: landxml, xml, cgpoints, superficie, tin, liñas de rotura, límite, trazado, coordgeom, perfil, profalign, pvi, paracurve, pipenetworks, struct, tubaxe, planfeatures, planfeature, liña de elemento, esquema
from: ca3cf359
---

CivilCraft escribe LandXML 1.2 co espazo de nomes oficial e a localización do esquema. Le calquera ficheiro cuxo elemento raíz sexa `LandXML` e toma os elementos seguintes polo nome (os prefixos de espazo de nomes ignóranse; a versión non se comproba). O seu lector XML acepta só as cinco entidades estándar e as referencias numéricas de carácter; nunca carga un DTD nin un ficheiro externo. Para os pasos, vexa [Intercambiar LandXML](topic:landxml).

LandXML escribe as coordenadas primeiro o norte: un punto é "N E" ou "N E Z".

## Escrito

| Elemento | Que escribe CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, áreas en pés cadrados, volumes en iardas cúbicas, diámetros en polgadas) ou `Metric` (metro, metro cadrado, metro cúbico, milímetro) |
| `Project` | `name` = o nome do proxecto |
| `Application` | nome CivilCraft, fabricante CadCraft |
| `CgPoints` / `CgPoint` | `name` = número do punto, `desc` = descrición, `code` = grupo; texto "N E Z" (ou "N E" sen elevación) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ou ccw, `radius`, `length`, `staStart`, `chord`, `delta` (graos), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | o terreo existente ao longo do trazado, como pares de estación e elevación (`PntList2D`), dividido onde sae da superficie |
| `Profile` / `ProfAlign` | o perfil de deseño (chamado "<trazado> design"): `PVI` para os extremos e os puntos de ángulo, `ParaCurve` con `length` para as curvas verticais |
| `Surfaces` / `Surface` | `name` e `desc`; primeiro o terreo existente, e despois "Proposed" cando as plataformas ou os corredores nivelan |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (só terreo existente) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (só terreo existente, cando o hai) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` con `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ou sanitary |
| `Struct` | `name`, `elevRim` (o bordo usado, fixado ou tomado da superficie), `elevSump`; `Center`; `CircStruct` con `diameter`; `Invert` con `elev`, `flowDir` in ou out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` con `diameter` |
| `PlanFeatures` / `PlanFeature` | unha por liña de elemento: `name`; `CoordGeom` con `Line` (`length`, `Start`, `End`) e `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` e `End` como "N E Z", `Center` como "N E"); `Feature` `code="CivilCraft"` con `Property` use e closed |

Non se escribe: plataformas e corredores como obxectos (o seu resultado é a superficie "Proposed"), trazados con erros, tubaxes sen as dúas cotas de fondo, nin regras de rede.

## Lido

| Elemento | Que toma CivilCraft |
|---|---|
| `Units` | `Imperial` ou `Metric` e o seu `linearUnit` deciden se son pés ou metros. Anótase unha unidade descoñecida. |
| `Project` | `name` convértese no nome do proxecto. |
| `CgPoints` / `CgPoint` (tamén aniñados) | nome (ou `oID`), "N E" ou "N E Z", `desc` (ou `code`) como descrición |
| `Surface` con `Definition surfType="TIN"` | `Pnts` e `Faces` como terreo existente (só a primeira superficie); as caras invisibles (`i="1"`) déixanse fóra |
| `SourceData` / `Breaklines` | liñas de rotura 3D, conservadas coa superficie |
| `SourceData` / `Boundaries` | o límite exterior |
| `Alignment` / `CoordGeom` | elementos `Line` e `Curve`; os PI reconstrúense desde o `PI` de cada curva, ou desde o seu `Center` e tanxentes; `staStart` |
| `Profile` / `ProfAlign` | `PVI` e `ParaCurve` (con `length`); o primeiro perfil de deseño con polo menos dous PVI |
| `PlanFeatures` / `PlanFeature` | cada un como liña de elemento: `Line`, `Curve` (o seu `Start`, `Center`, `End` e `rot`) e `IrregularLine` (`PntList3D` ou `PntList2D`) unidos extremo con extremo (un oco únese cun segmento recto e anótase); pechado cando remata onde comezou; uso e pechado desde o `Feature` propio de CivilCraft, se non, **Só debuxada**. Os puntos sen elevación toman 0 (anotado). |
| `Spiral` | espirais clotoides xunto a unha `Curve` (de entrada e de saída; léense como un PI cun radio e lonxitudes de espiral, e escríbense de novo con `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | a primeira rede que ten tubaxes: `Struct` (`Center`, `elevRim`, `elevSump`, diámetro en `CircStruct`, `Invert` por tubaxe) e `Pipe` (`refStart`, `refEnd`, diámetro en `CircPipe`) |

## Omitido, e indicado nas notas

- Superficies despois da primeira, superficies de cuadrícula e outras superficies non TIN
- Trazados que conteñen elementos `IrregularLine` ou `Chain`, espirais distintas de clotoide, unha espiral entre dúas curvas, ou trazados sen xeometría
- Perfís de deseño despois do primeiro; curvas verticais `CircCurve` e `UnsymParaCurve` (os seus PVI consérvanse sen curva)
- Puntos que só remiten a outros puntos (`pntRef`), e puntos sen coordenadas lexibles
- Nomes de punto repetidos (consérvase o primeiro)
- Límites ocultos, mostrados e recortados por datos; liñas de rotura sen puntos 3D
- Redes de tubaxes despois da primeira; tipos de rede distintos de storm e sanitary (léense como storm)
- Estruturas rectangulares, de entrada e de saída (léense como redondas); tubaxes e canles en ovo, elípticas e en caixa (léense como tubaxes redondas sen tamaño)
- Elementos `Spiral` en liñas de planta
- `Parcels`, `Roadways`, `GradeModel` e `Survey`

Os perfís do terreo (`ProfSurf`) dun ficheiro non se usan: CivilCraft toma a mostra do terreo desde a propia superficie.

## Mensaxes cando un ficheiro non se abre

| Mensaxe | Significado |
|---|---|
| "Isto é XML pero non LandXML (o seu elemento raíz é <…>)." | O ficheiro é outro tipo de XML. |
| "… non ten puntos, superficies TIN nin trazados que CivilCraft poida ler." | Todo o do ficheiro está na lista de omitidos. As notas que seguen indican o que había. |
| "Etiqueta de peche non coincidente …", "Etiqueta sen pechar …", "O ficheiro remata dentro de …" | O ficheiro está danado ou cortado. |
