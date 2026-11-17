---
title: Referencia de la barra de herramientas
summary: Cada botón de la barra de herramientas de CivilCraft, qué hace, su tecla y cuándo aparece atenuado o se niega a actuar.
keywords: barra de herramientas, botones, comandos, herramientas, archivo, exportar, superficie, diseño, editar, vista, menú
from: 4c4352bc
---

La barra de herramientas se extiende por la parte superior de la aplicación en siete grupos. Cada botón muestra su información emergente y su tecla al pasar el puntero sobre él.

## Archivo

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:New}} | ninguna | Inicia un proyecto vacío. Pregunta antes si hay cambios sin guardar. |
| {{ui:Open}} | {{key:Mod+O}} | Abre un archivo de puntos (CSV, TXT), LandXML o un proyecto de CivilCraft. |
| {{ui:Save}} | {{key:Mod+S}} | Descarga el proyecto como `<name>.civilcraft.json`. |

## Exportar

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:LandXML}} | ninguna | Descarga `<name>.xml`: puntos, superficies, alineaciones, perfiles y la red de tuberías en LandXML 1.2. «Nada que exportar todavía.» cuando el proyecto está vacío. |
| {{ui:DXF}} | ninguna | Descarga `<name>.dxf`: la geometría lineal del plano en DXF R12. |
| {{ui:PDF}} | {{key:Mod+P}} | Abre **Trazar el plano a PDF**. «Nada que trazar todavía.» cuando el proyecto está vacío. |

## Superficie

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | Pulse puntos de levantamiento en orden; {{key:Enter}} para terminar. La línea de ruptura toma las cotas de los puntos. |
| {{ui:Boundary}} | {{key:O}} | Pulse las esquinas del contorno exterior; {{key:Enter}} para terminar. Sustituye cualquier contorno anterior. |

Ambos muestran «Todavía no hay superficie: abra antes los puntos de levantamiento.» cuando no hay superficie.

## Diseño

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:Alignment}} | {{key:A}} | Pulse los PI en orden; {{key:Enter}} para terminar. |
| {{ui:Pad}} | {{key:G}} | Pulse las esquinas de la plataforma; {{key:Enter}} para terminar. Como las herramientas de superficie, avisa cuando no hay superficie; una plataforma solo se nivela sobre una. |
| {{ui:Pipes}} | {{key:P}} | Pulse estructuras de aguas arriba hacia aguas abajo (pulse una existente para unirse a ella); {{key:Enter}} para terminar. |
| {{ui:Profile}} | {{key:R}} | Muestra u oculta la vista de perfil bajo el plano. |

## Editar

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:Undo}} | {{key:Mod+Z}} | Deshace el último cambio (hasta 200). Aparece atenuado cuando no hay nada que deshacer. |
| {{ui:Redo}} | {{key:Mod+Y}} | Rehace lo deshecho. Aparece atenuado cuando no hay nada que rehacer. |
| {{ui:Copy}} | {{key:Mod+C}} | Copia los puntos de levantamiento seleccionados y los pone en el portapapeles como filas de puntos que admite una hoja de cálculo. Aparece atenuado hasta que se seleccionan puntos. |
| {{ui:Paste}} | {{key:Mod+V}} | Pega puntos: siguen al puntero, y un clic los coloca con números que no tiene ningún otro punto. También se pegan las filas de puntos copiadas en una hoja de cálculo. |
| {{ui:More}} | ninguna | Abre el menú siguiente. |

El menú {{ui:Más}}:

| Elemento | Tecla | Qué hace |
|---|---|---|
| {{ui:Cut}} | {{key:Mod+X}} | Copia los puntos seleccionados y los elimina (un paso de deshacer). |
| {{ui:Copy}} | {{key:Mod+C}} | Igual que el botón {{ui:Copiar}}. |
| {{ui:Paste}} | {{key:Mod+V}} | Igual que el botón {{ui:Pegar}}. |
| {{ui:Paste in place}} | {{key:Mod+Shift+V}} | Pega los puntos en sus propias coordenadas, con números que no tiene ningún otro punto. |
| {{ui:Duplicate}} | {{key:Mod+D}} | Una copia de los puntos seleccionados sigue al puntero; pulse donde debe ir. El portapapeles no se modifica. |
| {{ui:Delete}} | {{key:Delete}} | Elimina los puntos de levantamiento seleccionados, o la alineación, plataforma, estructura (con sus tuberías), tubería o PIV seleccionados. |
| {{ui:Select all points}} | {{key:Mod+A}} | Selecciona todos los puntos de levantamiento. |
| {{ui:Select none}} | {{key:Esc}} | Quita la selección. |

Un elemento que no puede actuar en ese momento aparece atenuado, y su información emergente indica el motivo. Detalles: [Seleccionar, copiar y pegar puntos de levantamiento](topic:copy-paste-points).

Deshacer cubre las ediciones del diseño, los ajustes de la superficie y los puntos de levantamiento (pegar, cortar, duplicar, eliminar). No cubre los ajustes de visualización, y abrir o importar cualquier archivo lo borra.

## SIG

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:Coordinates}} | ninguna | Abre el cuadro **Sistema de coordenadas**: indique en qué sistema está el proyecto, o use coordenadas del terreno o locales. Véase [Definir el sistema de coordenadas del proyecto](topic:coordinate-systems) y [Coordenadas del terreno y locales](topic:ground-and-local-coordinates). |
| {{ui:Import}} | ninguna | Importa datos SIG: shapefiles, GeoJSON, GeoPackage, mallas de elevación y LiDAR. Véase [Importar datos SIG](topic:gis-import). |
| {{ui:Export}} | ninguna | Exporta los datos conformes a obra para un departamento SIG. Véase [Exportar datos conformes a obra para SIG](topic:gis-export). |
| {{ui:Analyze}} | ninguna | Abre el panel de análisis SIG: zona de influencia, superposición, unión espacial, selección por atributo, medición. Véase [Analizar capas SIG](topic:gis-analysis). |
| {{ui:Attribute table}} | ninguna | En Superficie › Más. Abre la tabla de atributos de una capa SIG: ordenar, filtrar, seleccionar, editar, añadir campos, calcular, guardar como CSV. Véase [Trabajar con la tabla de atributos de una capa](topic:gis-table). |
| {{ui:Map}} | ninguna | Abre el cuadro **Capas de mapa**: una imagen georreferenciada, o servidores de mapas que añada, dibujados bajo el plano. Véase [Mostrar capas de mapa bajo el plano](topic:map-layers). |

Las herramientas SIG se cargan la primera vez que usa uno de estos botones, abre un archivo SIG o abre un proyecto que tiene sistema de coordenadas o capas SIG.

## Vista

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:Select}} | {{key:V}} o {{key:Esc}} | Pulse para seleccionar alineaciones, plataformas, estructuras, tuberías y puntos ({{key:Shift}} y un clic o un arrastre añaden puntos); arrastre los pinzamientos para mover PI, esquinas de plataforma y estructuras. |
| {{ui:Fit}} | {{key:F}} | Ajusta el zoom del plano para mostrar la superficie, los puntos, las alineaciones y las plataformas (en la vista 3D: muestra todo). |
| {{ui:3D}} | {{key:D}} | Muestra el emplazamiento en 3D sobre el plano, o vuelve al plano. La barra sobre la vista 3D define la vista, la exageración, el coloreado y lo que se muestra, y exporta GLB u OBJ. Véase [Ver el emplazamiento en 3D](topic:site-3d). |

## Botones de los paneles

| Botón | Dónde | Qué hace |
|---|---|---|
| {{ui:Open the sample site}} | El cuadro de un plano vacío | Carga el levantamiento de muestra (necesita conexión, salvo que CivilCraft se haya guardado para uso sin conexión) |
| {{ui:Remove the boundary}} | Panel izquierdo, Superficie | Quita el contorno exterior |
| {{ui:Remove drawn breaklines}} | Panel izquierdo, Superficie | Elimina cada línea de ruptura dibujada con la herramienta (no los grupos de líneas de ruptura) |
| {{ui:Rebuild the surface from the points}} | Panel izquierdo, Superficie (solo superficie LandXML) | Descarta la TIN de LandXML y construye a partir de los puntos; no se puede deshacer |
| {{ui:Start from the ground}} | Panel derecho, Alineación | Inicia un perfil de proyecto con un PIV sobre el terreno en cada extremo |
| {{ui:Profile view}} | Panel derecho, Alineación | Abre la vista de perfil de esta alineación |
| {{ui:Add PVIs}} | Barra de perfil | Mientras está pulsado, un clic en el perfil añade un PIV |
| {{ui:Set every invert from the rules}} | Panel derecho, Red de tuberías | Establece las plantillas de todas las tuberías según las reglas |
| {{ui:Set its inverts from the rules}} | Panel derecho, Tubería | Establece las plantillas de esta tubería según las reglas |
