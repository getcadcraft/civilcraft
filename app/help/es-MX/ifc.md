---
title: Exportar e importar IFC
summary: Guarde todo el proyecto como un solo archivo IFC en IFC 4.3, IFC4 o IFC2x3 (alineaciones, carreteras, movimientos de tierra, superficies, muros, tuberías), y abra archivos IFC para sus alineaciones y superficies.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, alineación, ifcalignment, carretera, ifcroad, movimientos de tierra, tin, entregable, adquisiciones, exportar ifc, importar ifc
from: 6b998bcf
---

IFC es el formato de intercambio abierto que muchos clientes públicos piden como entregable. CivilCraft escribe todo el proyecto en un solo archivo IFC y lee alineaciones y superficies de vuelta desde archivos IFC.

## Exportar

1. Haga clic en {{ui:IFC}} en el grupo **Exportar** (en los estilos de cinta: {{ui:Salida}} › {{ui:Exportar}} › {{ui:IFC}}).
2. Elija el esquema. **IFC 4.3 ADD2** aparece primero y es el predeterminado: es la edición con alineaciones, carreteras y movimientos de tierra. Elija IFC4 o IFC2x3 solo cuando el software del receptor no pueda leer 4.3.
3. El cuadro indica qué contendrá el archivo y qué omite el esquema elegido. Haga clic en {{ui:Exportar IFC}}.
   El archivo se descarga como "*nombre del proyecto*-ifc4x3.ifc", "-ifc4.ifc" o "-ifc2x3.ifc". CivilCraft recuerda el último esquema que eligió.

## Qué contiene cada esquema

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Alineaciones | IfcAlignment con sus disposiciones horizontal (líneas, arcos circulares, espirales de clotoide) y vertical (pendientes, curvas parabólicas), sus curvas (IfcCompositeCurve, IfcGradientCurve), la estación inicial y los eventos de sobreelevación | Una polilínea 3D sobre un elemento civil | Una polilínea 3D sobre un proxy |
| Obras lineales | IfcRoad con partes de carretera; carriles, acotamientos, cunetas y banquetas como IfcPavement, bordillos como IfcKerb, franjas de vegetación; cada capa de pavimento como IfcCourse con su espesor, material y volumen; los taludes como IfcEarthworksCut e IfcEarthworksFill con los volúmenes de corte y relleno; la velocidad de diseño y la clase | Elementos civiles con nombre según lo que son, agrupados por carretera | Proxies, agrupados por carretera |
| Superficies | IfcGeographicElement TERRAIN con una red irregular triangulada | Conjuntos de caras trianguladas | Modelos de superficie basados en caras (archivos más grandes) |
| Plataformas y muros | La cara superior de la plataforma, sus taludes como movimientos de tierra, los muros de contención como IfcWall RETAININGWALL | Igual, con el muro como tipo de muro definido por el usuario | Igual, con el tipo del muro en ObjectType |
| Redes de tuberías | IfcPipeSegment e IfcDistributionChamberElement en un IfcDistributionSystem | Igual | IfcFlowSegment y cámaras en un IfcSystem |
| Georreferenciación | IfcProjectedCRS e IfcMapConversion | Igual | ePSet_ProjectedCRS y ePSet_MapConversion en el sitio |

Un **ferrocarril** (una alineación con Ferrocarril activado) entra en IFC 4.3 como IfcRailway: sus transiciones como tipos propios (clotoide, parábola cúbica, Bloss, Helmert, medio periodo de seno como curva coseno, seno), su peralte como IfcAlignmentCant, y su vía como rieles, durmientes y lecho de balasto, con el subbalasto debajo. IFC4 e IFC2x3 reciben las mismas partes como elementos civiles o proxies. Al abrir un ferrocarril IFC 4.3, se recuperan sus transiciones y su peralte.

Todo archivo también incluye parcelas (huellas), las plantas y los elementos duros del espacio de paisajismo, y volúmenes de edificación (cada uno como IfcBuilding con sus niveles), todo en un solo sitio. Los conjuntos de propiedades llevan lo que diseñó: estaciones, el conjunto de elementos, taludes de corte y relleno, ancho y número de carriles, cotas de batea, cotas de brocal y alturas de muros; las cantidades (longitudes, áreas, volúmenes) son conjuntos IfcElementQuantity.

## Unidades y coordenadas

El archivo está en la unidad de longitud del proyecto (metros, o pies de agrimensura de EE. UU.); las áreas y volúmenes están en metros cuadrados y cúbicos. Con un sistema de coordenadas ({{ui:SIG}} › Coordenadas) el archivo se coloca en el mapa: las coordenadas este y norte de su origen, y la rotación y la escala de un sistema local (del terreno), van en la conversión de mapa. Sin un sistema de coordenadas, el archivo registra su origen local en un conjunto de propiedades y no se coloca en un mapa.

## Importar

Abra un archivo .ifc con {{ui:Abrir}} o suéltelo en el plano. El cuadro de importación indica lo que contiene el archivo:

- **Alineaciones** de IFC 4.3 (las disposiciones horizontal y vertical) y curvas de alineación de IFC 4x1 se convierten en alineaciones de CivilCraft con sus PI, radios, longitudes de espiral y PIV. Una alineación que el modelo de PI de CivilCraft no puede contener (curvas compuestas, espirales entre dos curvas, una que empieza o termina en una curva) no se importa, y el cuadro indica por qué.
- **Superficies**: elija la que pasará a ser el terreno existente, o conserve la del proyecto.
- **Todo lo demás** (y las demás superficies) puede mostrarse en la vista 3D como referencia. Los elementos de referencia permanecen mientras el proyecto está abierto; no se guardan en el archivo del proyecto.

Un archivo que CivilCraft escribió en IFC4 o IFC2x3 devuelve sus alineaciones exactamente desde sus conjuntos de propiedades.

## Pendiente de desarrollo

- La sobreelevación de una carretera se escribe como eventos de sobreelevación y en las superficies de carretera (el peralte es para ferrocarriles).
- Guardar elementos de referencia en el archivo del proyecto, e importar redes de tuberías o plataformas desde IFC como objetos editables.
