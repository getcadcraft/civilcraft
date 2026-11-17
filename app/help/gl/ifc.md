---
title: Exportación e importación de IFC
summary: Garde todo o proxecto nun só ficheiro IFC en IFC 4.3, IFC4 ou IFC2x3 (trazados, estradas, movementos de terras, superficies, muros, tubaxes) e abra ficheiros IFC para os seus trazados e superficies.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, trazado, ifcalignment, estrada, ifcroad, movemento de terras, tin, entregable, contratación, exportar ifc, importar ifc
from: 6b998bcf
---

IFC é o formato aberto de intercambio que moitos clientes públicos piden como entregable. CivilCraft escribe todo o proxecto nun ficheiro IFC e le de novo trazados e superficies dos ficheiros IFC.

## Exportar

1. Faga clic en {{ui:IFC}} no grupo **{{ui:Export}}** (nos estilos da cinta: {{ui:Output}} › {{ui:Export}} › {{ui:IFC}}).
2. Escolla o esquema. **IFC 4.3 ADD2** é o primeiro e o predeterminado: é a edición con trazados, estradas e movementos de terras. Escolla IFC4 ou IFC2x3 só cando o software do destinatario non poida ler a 4.3.
3. O diálogo indica o que conterá o ficheiro e o que deixa fóra o esquema escollido. Faga clic en {{ui:Export IFC}}.
   O ficheiro descárgase como "*nome do proxecto*-ifc4x3.ifc", "-ifc4.ifc" ou "-ifc2x3.ifc". CivilCraft lembra o último esquema que escolleu.

## Que contén cada esquema

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Trazados | IfcAlignment coas súas disposicións horizontal (liñas, arcos circulares, espirais de clotoide) e vertical (pendentes, curvas parabólicas), as súas curvas (IfcCompositeCurve, IfcGradientCurve), a estación inicial e os eventos de peralte | Unha polilínea 3D nun elemento civil | Unha polilínea 3D nun proxy |
| Corredores | IfcRoad con partes de estrada; carrís, arcenes, cunetas e beirarrúas como IfcPavement, bordillos como IfcKerb, franxas de plantación; cada capa do firme como IfcCourse coa súa espesura, material e volume; os taludes como IfcEarthworksCut e IfcEarthworksFill cos volumes de desmonte e terraplén; a velocidade e a clase de deseño | Elementos civís co nome do que son, agrupados por estrada | Proxies, agrupados por estrada |
| Superficies | IfcGeographicElement TERRAIN cunha rede triangulada irregular | Conxuntos de caras triangulados | Modelos de superficie baseados en caras (ficheiros máis grandes) |
| Plataformas e muros | A cima da plataforma, os seus taludes como movementos de terras, muros de contención como IfcWall RETAININGWALL | Igual, o muro como tipo de muro definido polo usuario | Igual, o tipo do muro en ObjectType |
| Redes de tubaxes | IfcPipeSegment e IfcDistributionChamberElement nun IfcDistributionSystem | Igual | IfcFlowSegment e cámaras nun IfcSystem |
| Xeorreferenciación | IfcProjectedCRS e IfcMapConversion | Igual | ePSet_ProjectedCRS e ePSet_MapConversion no emprazamento |

Un **ferrocarril** (un trazado con Ferrocarril activado) vai ao IFC 4.3 como IfcRailway: as súas transicións como tipos propios (clotoide, parábola cúbica, Bloss, Helmert, media onda sinusoidal como curva coseno, seno), o seu peralte como IfcAlignmentCant, e a súa vía como carrís, traviesas e capa de balasto, coa sub-balastra debaixo. IFC4 e IFC2x3 reciben as mesmas partes como elementos civís ou proxies. Ao abrir un ferrocarril IFC 4.3 recuperanse as súas transicións e o seu peralte.

Todo ficheiro leva ademais parcelas (pegadas), as plantacións e a obra dura do espazo de traballo Paisaxismo, e masas de edificios (cada un un IfcBuilding cos seus pisos), todo nun mesmo emprazamento. Os conxuntos de propiedades levan o que deseñou: estacións, a sección tipo, as pendentes de desmonte e terraplén, o ancho e o número de carrís, as cotas de solera e de tapa, as alturas dos muros; as cantidades (lonxitudes, áreas, volumes) son conxuntos IfcElementQuantity.

## Unidades e coordenadas

O ficheiro está na unidade de lonxitude do proxecto (metros, ou pés US de topografía); as áreas e os volumes están en metros cadrados e cúbicos. Con un sistema de coordenadas (SIG › Coordenadas) o ficheiro sitúase no mapa: as coordenadas este e norte da súa orixe, e a rotación e a escala dun sistema de terreo (local), van na conversión ao mapa. Sen sistema, o ficheiro rexistra a súa orixe local nun conxunto de propiedades e non se sitúa nun mapa.

## Importar

Abra un ficheiro .ifc con {{ui:Open}} ou solteo no plano. O diálogo de importación indica o que contén o ficheiro:

- **Trazados** do IFC 4.3 (as disposicións horizontal e vertical) e das curvas de trazado IFC 4x1 convértense en trazados de CivilCraft cos seus PI, radios, lonxitudes de espiral e PVI. Un trazado que o modelo de PI de CivilCraft non pode conter (curvas compostas, espirais entre dúas curvas, un que comeza ou acaba nunha curva) non se importa, e o diálogo indica por que.
- **Superficies**: escolla a que pasa a ser o terreo existente, ou manteña a do proxecto.
- **Todo o demais** (e as outras superficies) pode amosarse na vista 3D como referencia. Os elementos de referencia manteñense mentres o proxecto está aberto; non se gardan no ficheiro do proxecto.

Un ficheiro que CivilCraft escribiu en IFC4 ou IFC2x3 recupera os seus trazados exactamente desde os seus conxuntos de propiedades.

## Aínda sen construír

- O peralte dunha estrada escríbese como eventos de peralte e nas superficies da estrada (o peralte é para ferrocarrís).
- Gardar elementos de referencia no ficheiro do proxecto, e importar redes de tubaxes ou plataformas desde IFC como obxectos editables.
