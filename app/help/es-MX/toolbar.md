---
title: Referencia de la barra de herramientas
summary: Cada botón de la barra de herramientas de CivilCraft, qué hace, su tecla, y cuándo aparece atenuado o no se ejecuta.
keywords: barra de herramientas, botones, comandos, herramientas, archivo, exportar, superficie, diseño, editar, vista, menú
from: 4c4352bc
---

La barra de herramientas recorre la parte superior de la aplicación en siete grupos. Cada botón muestra su descripción emergente y su tecla al pasar el puntero sobre él.

## Archivo

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:Nuevo}} | ninguna | Inicia un proyecto vacío. Pregunta primero si hay cambios sin guardar. |
| {{ui:Abrir}} | {{key:Mod+O}} | Abre un archivo de puntos (CSV, TXT), LandXML o un proyecto de CivilCraft. |
| {{ui:Guardar}} | {{key:Mod+S}} | Descarga el proyecto como `<name>.civilcraft.json`. |

## Exportar

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:LandXML}} | ninguna | Descarga `<name>.xml`: puntos, superficies, alineaciones, perfiles y la red de tuberías como LandXML 1.2. "Todavía no hay nada que exportar." cuando el proyecto está vacío. |
| {{ui:DXF}} | ninguna | Descarga `<name>.dxf`: la geometría lineal del plano como R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Abre **Trazar el plano a PDF**. "Todavía no hay nada que trazar." cuando el proyecto está vacío. |

## Superficie

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:Línea de ruptura}} | {{key:B}} | Pulse los puntos topográficos en orden, {{key:Enter}} para terminar. La línea de ruptura toma las elevaciones de los puntos. |
| {{ui:Contorno}} | {{key:O}} | Pulse las esquinas del contorno exterior, {{key:Enter}} para terminar. Reemplaza cualquier contorno. |

Ambas muestran "Todavía no hay superficie: abra primero los puntos topográficos." cuando no hay superficie.

## Diseño

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:Alineación}} | {{key:A}} | Pulse los PI en orden, {{key:Enter}} para terminar. |
| {{ui:Plataforma}} | {{key:G}} | Pulse las esquinas de la plataforma, {{key:Enter}} para terminar. Igual que las herramientas de superficie, advierte cuando no hay superficie; una plataforma solo se nivela sobre una. |
| {{ui:Tuberías}} | {{key:P}} | Pulse las estructuras de aguas arriba hacia abajo (pulse una existente para unirse a ella), {{key:Enter}} para terminar. |
| {{ui:Perfil}} | {{key:R}} | Muestra u oculta la vista de perfil debajo del plano. |

## Editar

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:Deshacer}} | {{key:Mod+Z}} | Deshace el último cambio (hasta 200). Atenuado cuando no hay nada que deshacer. |
| {{ui:Rehacer}} | {{key:Mod+Y}} | Rehace lo que se deshizo. Atenuado cuando no hay nada que rehacer. |
| {{ui:Copiar}} | {{key:Mod+C}} | Copia los puntos topográficos seleccionados y los pone en el portapapeles como filas de puntos que una hoja de cálculo puede leer. Atenuado hasta que se seleccionen puntos. |
| {{ui:Pegar}} | {{key:Mod+V}} | Pega puntos: siguen al puntero, y un clic los coloca con números que ningún otro punto tiene. Las filas de puntos copiadas en una hoja de cálculo también se pegan. |
| {{ui:Más}} | ninguna | Abre el menú siguiente. |

El menú {{ui:Más}}:

| Elemento | Tecla | Qué hace |
|---|---|---|
| {{ui:Cortar}} | {{key:Mod+X}} | Copia los puntos seleccionados y los elimina (un paso de deshacer). |
| {{ui:Copiar}} | {{key:Mod+C}} | Igual que el botón {{ui:Copiar}}. |
| {{ui:Pegar}} | {{key:Mod+V}} | Igual que el botón {{ui:Pegar}}. |
| {{ui:Pegar en el mismo lugar}} | {{key:Mod+Shift+V}} | Pega los puntos en sus propias coordenadas, con números que ningún otro punto tiene. |
| {{ui:Duplicar}} | {{key:Mod+D}} | Una copia de los puntos seleccionados sigue al puntero; pulse donde debe ir. El portapapeles no se altera. |
| {{ui:Eliminar}} | {{key:Delete}} | Elimina los puntos topográficos seleccionados, o la alineación, plataforma, estructura (con sus tuberías), tubería o PIV seleccionados. |
| {{ui:Seleccionar todos los puntos}} | {{key:Mod+A}} | Selecciona todos los puntos topográficos. |
| {{ui:No seleccionar nada}} | {{key:Esc}} | Borra la selección. |

Un elemento que no puede actuar en ese momento aparece atenuado, y su descripción emergente indica por qué. Detalles: [Seleccionar, copiar y pegar puntos topográficos](topic:copy-paste-points).

Deshacer abarca las ediciones del diseño, la configuración de la superficie y los puntos topográficos (pegar, cortar, duplicar, eliminar). No abarca la configuración de visualización, y abrir o importar cualquier archivo lo borra.

## GIS

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:Coordenadas}} | ninguna | Abre el cuadro de diálogo **Sistema de coordenadas**: indique en qué sistema está el proyecto, o use coordenadas de terreno o locales. Vea [Definir el sistema de coordenadas del proyecto](topic:coordinate-systems) y [Coordenadas de terreno y locales](topic:ground-and-local-coordinates). |
| {{ui:Importar}} | ninguna | Importa datos GIS: shapefiles, GeoJSON, GeoPackage, cuadrículas de elevación y LiDAR. Vea [Importar datos GIS](topic:gis-import). |
| {{ui:Exportar}} | ninguna | Exporta datos como construidos para un departamento de GIS. Vea [Exportar datos como construidos para GIS](topic:gis-export). |
| {{ui:Analizar}} | ninguna | Abre el panel de análisis GIS: zona de influencia, superposición, unión espacial, selección por atributo y medición. Vea [Analizar capas GIS](topic:gis-analysis). |
| {{ui:Tabla de atributos}} | ninguna | En Superficie › Más. Abre la tabla de atributos de una capa GIS: ordenar, filtrar, seleccionar, editar, agregar campos, calcular, guardar como CSV. Vea [Trabajar con la tabla de atributos de una capa](topic:gis-table). |
| {{ui:Mapa}} | ninguna | Abre el cuadro de diálogo **Capas de mapa**: una imagen georreferenciada, o servidores de mapas que agregue, dibujados debajo del plano. Vea [Mostrar capas de mapa debajo del plano](topic:map-layers). |

Las herramientas GIS se cargan la primera vez que usa uno de estos botones, abre un archivo GIS, o abre un proyecto que tiene sistema de coordenadas o capas GIS.

## Vista

| Botón | Tecla | Qué hace |
|---|---|---|
| {{ui:Seleccionar}} | {{key:V}} o {{key:Esc}} | Pulse para seleccionar alineaciones, plataformas, estructuras, tuberías y puntos ({{key:Shift}} y un clic o un arrastre agregan puntos); arrastre los pinzamientos para mover los PI, las esquinas de las plataformas y las estructuras. |
| {{ui:Ajustar}} | {{key:F}} | Hace zoom del plano para mostrar la superficie, los puntos, las alineaciones y las plataformas (en la vista 3D: muestra todo). |
| {{ui:3D}} | {{key:D}} | Muestra el sitio en 3D sobre el plano, o regresa al plano. La barra sobre la vista 3D define la vista, la exageración vertical, el color y lo que se muestra, y exporta GLB u OBJ. Vea [Ver el sitio en 3D](topic:site-3d). |

## Botones en los paneles

| Botón | Dónde | Qué hace |
|---|---|---|
| {{ui:Abrir el sitio de ejemplo}} | El cuadro en un plano vacío | Carga el levantamiento de ejemplo (requiere conexión, salvo que CivilCraft esté guardado para usarse sin conexión) |
| {{ui:Quitar el contorno}} | Panel izquierdo, Superficie | Quita el contorno exterior |
| {{ui:Quitar líneas de ruptura dibujadas}} | Panel izquierdo, Superficie | Elimina cada línea de ruptura dibujada con la herramienta (no los grupos de líneas de ruptura) |
| {{ui:Reconstruir la superficie a partir de los puntos}} | Panel izquierdo, Superficie (solo superficie LandXML) | Descarta la TIN de LandXML y construye a partir de los puntos; no se puede deshacer |
| {{ui:Iniciar desde el terreno}} | Panel derecho, Alineación | Inicia un perfil de diseño con un PIV sobre el terreno en cada extremo |
| {{ui:Vista de perfil}} | Panel derecho, Alineación | Abre la vista de perfil de esta alineación |
| {{ui:Agregar PIV}} | Barra de perfil | Mientras está presionado, un clic en el perfil agrega un PIV |
| {{ui:Establecer todas las plantillas según las reglas}} | Panel derecho, Red de tuberías | Establece las plantillas de todas las tuberías según las reglas |
| {{ui:Establecer sus plantillas según las reglas}} | Panel derecho, Tubería | Establece las plantillas de esta tubería según las reglas |
