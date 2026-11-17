---
title: Exportación e importación IFC
summary: Guardar todo el proyecto como un solo archivo IFC en IFC 4.3, IFC4 o IFC2x3 (trazados, caminos, movimientos de tierra, superficies, muros, caños), y abrir archivos IFC para sus trazados y superficies.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, trazado, ifcalignment, camino, ifcroad, movimiento de tierra, tin, entregable, adquisiciones, exportar ifc, importar ifc
from: 6b998bcf
---

IFC es el formato abierto de intercambio que muchos clientes públicos piden como entregable. CivilCraft escribe todo el proyecto en un solo archivo IFC y lee de vuelta trazados y superficies desde archivos IFC.

## Exportar

1. Haz clic en {{ui:IFC}} en el grupo **Exportar** (en los estilos de la cinta: {{ui:Output}} › {{ui:Export}} › {{ui:IFC}}).
2. Elige el esquema. **IFC 4.3 ADD2** es el primero y el predeterminado: es la edición con trazados, caminos y movimientos de tierra. Elige IFC4 o IFC2x3 solo cuando el programa del receptor no pueda leer 4.3.
3. El diálogo dice qué contendrá el archivo y qué deja fuera el esquema elegido. Haz clic en {{ui:Export IFC}}.
   El archivo se descarga como "*nombre del proyecto*-ifc4x3.ifc", "-ifc4.ifc" o "-ifc2x3.ifc". CivilCraft recuerda el esquema que elegiste por última vez.

## Qué contiene cada esquema

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Trazados | IfcAlignment con sus diseños horizontal (líneas, arcos circulares, espirales clotoides) y vertical (pendientes, curvas parabólicas), sus curvas (IfcCompositeCurve, IfcGradientCurve), la estación inicial y los eventos de peralte | Una polilínea 3D sobre un elemento civil | Una polilínea 3D sobre un proxy |
| Corredores | IfcRoad con partes de camino; carriles, banquinas, cunetas y veredas como IfcPavement, cordones como IfcKerb, franjas de plantación; cada capa de pavimento como IfcCourse con su espesor, material y volumen; los taludes como IfcEarthworksCut e IfcEarthworksFill con los volúmenes de corte y relleno; la velocidad de diseño y la clase | Elementos civiles con nombre según lo que son, agrupados por camino | Proxies, agrupados por camino |
| Superficies | IfcGeographicElement TERRAIN con una red irregular triangulada | Conjuntos de caras triangulados | Modelos de superficie basados en caras (archivos más grandes) |
| Plataformas y muros | La cima de la plataforma, sus taludes como movimientos de tierra, muros de contención como IfcWall RETAININGWALL | Igual, el muro como tipo de muro definido por el usuario | Igual, el tipo del muro en ObjectType |
| Redes de caños | IfcPipeSegment e IfcDistributionChamberElement en un IfcDistributionSystem | Igual | IfcFlowSegment y cámaras en un IfcSystem |
| Georreferenciación | IfcProjectedCRS e IfcMapConversion | Igual | ePSet_ProjectedCRS y ePSet_MapConversion en el sitio |

Un **ferrocarril** (un trazado con Ferrocarril activado) pasa a IFC 4.3 como IfcRailway: sus transiciones como tipos propios (clotoide, parábola cúbica, Bloss, Helmert, semionda senoidal como curva coseno, seno), su peralte como IfcAlignmentCant, y su vía como rieles, durmientes y el lecho de balasto, con la subbase debajo. IFC4 e IFC2x3 reciben las mismas partes como elementos civiles o proxies. Al abrir un ferrocarril IFC 4.3, se recuperan sus transiciones y su peralte.

Todo archivo también incluye parcelas (huellas), las plantas y las obras duras del espacio de trabajo paisajismo, y masas de edificios (cada una como IfcBuilding con sus pisos), todo en un solo sitio. Los conjuntos de propiedades guardan lo que diseñaste: estaciones, el ensamble, las pendientes de corte y relleno, el ancho y la cantidad de carriles, las cotas de fondo, los bordes, las alturas de muros; las cantidades (longitudes, áreas, volúmenes) son conjuntos IfcElementQuantity.

## Unidades y coordenadas

El archivo está en la unidad de longitud del proyecto (metros, o pies de agrimensura de EE. UU.); las áreas y los volúmenes están en metros cuadrados y cúbicos. Con un sistema de coordenadas (GIS › Coordenadas) el archivo se ubica en el mapa: el este y el norte de su origen, y la rotación y escala de un sistema terreno (local), van en la conversión de mapa. Sin uno, el archivo registra su origen local en un conjunto de propiedades y no se ubica en un mapa.

## Importar

Abre un archivo .ifc con {{ui:Open}} o suéltalo sobre el plano. El diálogo de importación dice qué contiene el archivo:

- Los **trazados** de IFC 4.3 (los diseños horizontal y vertical) y las curvas de trazado IFC 4x1 pasan a ser trazados de CivilCraft con sus PI, radios, longitudes de espiral y PVI. Un trazado que el modelo de PI de CivilCraft no puede sostener (curvas compuestas, espirales entre dos curvas, uno que empieza o termina en una curva) no se importa, y el diálogo dice por qué.
- **Superficies**: elige la que pasa a ser el terreno existente, o conserva la del proyecto.
- **Todo lo demás** (y las otras superficies) puede mostrarse en la vista 3D como referencia. Los elementos de referencia se mantienen mientras el proyecto está abierto; no se guardan en el archivo del proyecto.

Un archivo que CivilCraft escribió en IFC4 o IFC2x3 devuelve sus trazados exactamente desde sus conjuntos de propiedades.

## Todavía no implementado

- El peralte de un camino se escribe como eventos de peralte y en las superficies del camino (el peralte es para ferrocarriles).
- Guardar elementos de referencia en el archivo del proyecto, e importar redes de caños o plataformas desde IFC como objetos editables.
