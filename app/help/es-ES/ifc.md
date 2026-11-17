---
title: Exportación e importación de IFC
summary: Guarde el proyecto completo como un único archivo IFC en IFC 4.3, IFC4 o IFC2x3 (alineaciones, viales, movimientos de tierras, superficies, muros, tuberías), y abra archivos IFC para sus alineaciones y superficies.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, alineación, ifcalignment, vial, ifcroad, movimiento de tierras, tin, entregable, licitación, exportar ifc, importar ifc
from: 6b998bcf
---

IFC es el formato abierto de intercambio que muchos clientes públicos piden como entregable. CivilCraft escribe el proyecto completo en un único archivo IFC y lee de vuelta alineaciones y superficies desde archivos IFC.

## Exportar

1. Haga clic en {{ui:IFC}} en el grupo **Exportar** (en los estilos de la cinta: {{ui:Output}} › {{ui:Export}} › {{ui:IFC}}).
2. Elija el esquema. **IFC 4.3 ADD2** aparece primero y es el predeterminado: es la edición con alineaciones, viales y movimientos de tierras. Elija IFC4 o IFC2x3 solo cuando el software del destinatario no pueda leer la 4.3.
3. El diálogo indica qué contendrá el archivo y qué omite el esquema elegido. Haga clic en {{ui:Export IFC}}.
   El archivo se descarga como "*nombre del proyecto*-ifc4x3.ifc", "-ifc4.ifc" o "-ifc2x3.ifc". CivilCraft recuerda el último esquema que eligió.

## Qué contiene cada esquema

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Alineaciones | IfcAlignment con sus trazados horizontal (rectas, arcos circulares, clotoides en espiral) y vertical (pendientes, curvas parabólicas), sus curvas (IfcCompositeCurve, IfcGradientCurve), la estación inicial y los eventos de peralte | Una polilínea 3D sobre un elemento civil | Una polilínea 3D sobre un proxy |
| Corredores | IfcRoad con partes de vial; carriles, arcenes, cunetas y aceras como IfcPavement, bordillos como IfcKerb, franjas ajardinadas; cada capa del firme como IfcCourse con su espesor, material y volumen; los taludes laterales como IfcEarthworksCut e IfcEarthworksFill con los volúmenes de desmonte y terraplén; la velocidad de proyecto y la clase | Elementos civiles con nombres según lo que son, agrupados por vial | Proxies, agrupados por vial |
| Superficies | IfcGeographicElement TERRAIN con una red irregular de triángulos | Conjuntos de caras triangulados | Modelos de superficie basados en caras (archivos más grandes) |
| Plataformas y muros | La cota superior de la plataforma, sus taludes como movimientos de tierras, los muros de contención como IfcWall RETAININGWALL | Igual, el muro como tipo de muro definido por el usuario | Igual, el tipo del muro en ObjectType |
| Redes de tuberías | IfcPipeSegment y IfcDistributionChamberElement en un IfcDistributionSystem | Igual | IfcFlowSegment y arquetas en un IfcSystem |
| Georreferenciación | IfcProjectedCRS e IfcMapConversion | Igual | ePSet_ProjectedCRS y ePSet_MapConversion en el emplazamiento |

Un **ferrocarril** (una alineación con Ferrocarril activado) pasa a IFC 4.3 como IfcRailway: sus transiciones como tipos propios (clotoide, parábola cúbica, Bloss, Helmert, semionda seno como curva coseno, seno), su peralte como IfcAlignmentCant, y su vía como carriles, traviesas y lecho de balasto, con la subbalasta debajo. IFC4 e IFC2x3 reciben las mismas partes como elementos civiles o proxies. Al abrir un ferrocarril en IFC 4.3, se recuperan sus transiciones y su peralte.

Cada archivo incluye también las parcelas (huellas), las plantas y el firme del espacio de trabajo de Paisajismo, y las masas de edificación (cada una como IfcBuilding con sus plantas), todo en un mismo emplazamiento. Los conjuntos de propiedades recogen lo que diseñó: estaciones, la sección tipo, los taludes de desmonte y terraplén, el ancho y el número de carriles, las cotas de fondo, las cotas de brocal y las alturas de muro; las cantidades (longitudes, áreas, volúmenes) son conjuntos IfcElementQuantity.

## Unidades y coordenadas

El archivo se expresa en la unidad de longitud del proyecto (metros o pies de topografía de EE. UU.); las áreas y los volúmenes van en metros cuadrados y cúbicos. Con un sistema de coordenadas (SIG › Coordenadas), el archivo se sitúa en el mapa: la coordenada este y norte de su origen, y la rotación y escala de un sistema local (terreno), quedan en la conversión de mapa. Sin sistema, el archivo registra su origen local en un conjunto de propiedades y no se sitúa en ningún mapa.

## Importar

Abra un archivo .ifc con {{ui:Open}} o suéltelo sobre el plano. El diálogo de importación indica qué contiene el archivo:

- Las **alineaciones** de IFC 4.3 (los trazados horizontal y vertical) y las curvas de alineación de IFC 4x1 pasan a ser alineaciones de CivilCraft con sus PI, radios, longitudes de espiral y PIV. Una alineación que el modelo de PI de CivilCraft no puede contener (curvas compuestas, espirales entre dos curvas, una que empieza o acaba en una curva) no se importa, y el diálogo indica por qué.
- **Superficies**: elija la que pasa a ser el terreno existente, o conserve la del proyecto.
- **Todo lo demás** (y las demás superficies) puede mostrarse en la vista 3D como referencia. Los elementos de referencia se mantienen mientras el proyecto está abierto; no se guardan en el archivo del proyecto.

Un archivo que CivilCraft escribió en IFC4 o IFC2x3 recupera sus alineaciones exactamente a partir de sus conjuntos de propiedades.

## Aún no implementado

- El peralte de un vial se escribe como eventos de peralte y en las superficies del vial (el peralte es para ferrocarriles).
- Guardar elementos de referencia en el archivo del proyecto, e importar redes de tuberías o plataformas desde IFC como objetos editables.
