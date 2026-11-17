---
title: Configuración de CivilCraft
summary: Elija el orden de columnas de las filas de puntos copiadas y pegadas y para adivinar las columnas de un archivo, cómo se numeran los puntos pegados, qué muestran las etiquetas de puntos, el indicador de esquina, la exageración vertical 3D, cómo se muestran la latitud y la longitud, y si las capas de mapa vienen de internet.
keywords: configuración, preferencias, pnezd, penzd, orden de columnas, filas de puntos, renumerar, números de puntos, número inicial, etiquetas de puntos, etiquetas, descripción, cota, cubo de vista, icono de ejes, indicador de esquina, brújula, exageración vertical, 3d, latitud, longitud, GMS, grados decimales, capas de mapa, internet, privacidad
from: 64b9cb92
---

Abra {{ui:Settings}} con el engranaje de la barra de la aplicación o con {{key:Mod+,}}. La primera pestaña, {{ui:CivilCraft}}, contiene los ajustes que pertenecen a esta aplicación; {{ui:General}} contiene los que comparten todas las aplicaciones de CadCraft (tema, barra de herramientas, paneles). Los ajustes de CivilCraft existen solo en la aplicación: los cambia aquí, y este navegador los recuerda. {{ui:Reset CivilCraft settings}} devuelve cada ajuste a su valor inicial.

## Filas de puntos

**P, N, E, Z, D** (el inicial) o **P, E, N, Z, D**: punto, norte, este, cota, descripción, o este antes que norte. Se usa en tres lugares:

- **Copiar**: las filas que CivilCraft pone en el portapapeles del sistema para una hoja de cálculo.
- **Pegar**: filas pegadas desde una hoja de cálculo o un archivo de texto que no tienen fila de encabezado.
- **Importar**: la suposición del cuadro **Importar puntos** cuando un archivo no tiene fila de encabezado (un archivo de cuatro columnas se lee como PENZ, uno de tres como ENZ). Consulte [Formatos de archivos de puntos](topic:point-file-formats).

Una fila de encabezado que nombre sus columnas siempre prevalece, y también una elección en la lista **Columnas** del cuadro de importación.

## Números para los puntos pegados

- **Mantener números libres** (el inicial): un punto pegado conserva su número cuando ningún punto lo tiene; solo los puntos en conflicto reciben números nuevos.
- **Siempre números nuevos**: cada punto pegado recibe un número nuevo, aunque el suyo esté libre.

**Los nuevos números empiezan en**: déjelo vacío para contar a partir de uno más que el número más alto en uso. Escriba un número, por ejemplo 5000, para dar a los nuevos puntos números a partir de 5000; los números ya en uso se omiten. Dos puntos nunca comparten número en ninguno de los dos casos. Consulte [Seleccionar, copiar y pegar puntos topográficos](topic:copy-paste-points#point-numbers-never-clash).

## Etiquetas de puntos

Lo que muestra una etiqueta de punto cuando {{ui:Point labels}} está activado en **Visualización**: **Número**, **Número y cota**, o **Número, cota y descripción** (el inicial). Las exportaciones DXF, DWG y PDF muestran las mismas etiquetas que la pantalla.

## Indicador de esquina

Lo que se sitúa en la esquina de la planta y de la vista 3D: **Cubo de vista** (el inicial), **Icono de ejes** o **Ninguno**.

- **Cubo de vista** (arriba a la derecha). En la planta muestra la parte superior, con el anillo de brújula: N es el norte de cuadrícula (hacia arriba en la planta). Haga clic en cualquier otra cara, arista o esquina del cubo, o arrástrelo, y la [vista 3D](topic:site-3d) se abre mirando desde allí. {{ui:Home}} en el cubo de la planta encaja la planta.
- En la vista 3D el cubo gira con la vista: haga clic en una cara, arista o esquina para mirar desde allí; arrastre el cubo para orbitar; arrastre el anillo de la brújula para girar alrededor de la vertical; haga clic en una letra para mirar desde ese lado; y use {{ui:Home}} para la vista isométrica de todo el emplazamiento. Mirando de frente a una cara, las pequeñas flechas pasan a la cara siguiente y las flechas curvas giran la vista un cuarto de vuelta.
- **Icono de ejes** (abajo a la izquierda): un pequeño marcador X (este) e Y (norte) en la planta, y X, Y y Z (arriba) en 3D.

## Exageración vertical 3D

Cuánto estira la vista 3D las cotas: **1×**, **2×** (el inicial), **3×**, **5×** o **10×**. La lista de la barra de la vista 3D es el mismo ajuste, así que cambiar una cambia ambas. Los volúmenes, los perfiles y las exportaciones 3D se mantienen a escala real.

## Latitud y longitud

Cómo muestra la barra de estado la latitud y la longitud del puntero cuando el proyecto tiene un sistema de coordenadas: **grados, minutos y segundos** (el inicial, por ejemplo `30°18′00.00″ N`) o **grados decimales** (`30.300000° N`). Consulte [Establecer el sistema de coordenadas del proyecto](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Capas de mapa desde internet

**Desactivado** (el inicial) o **Activado**. Cuando está activado, CivilCraft pide a los servidores de mapas que añada imágenes de la zona en pantalla. Su dibujo permanece en este equipo; el servidor ve la zona y su dirección de internet. Mientras está desactivado, ningún servidor de mapas recibe peticiones, aunque un proyecto que abra nombre uno; una imagen georreferenciada de un archivo funciona en cualquiera de los dos casos. Consulte [Mostrar capas de mapa bajo la planta](topic:map-layers).

## Asistentes

**Permitir que los asistentes de IA y los scripts usen CivilCraft** (desactivado al inicio) permite que un asistente de su equipo acceda al emplazamiento abierto a través de CadCraft Studio: **Leer** describe el emplazamiento y da puntos, cotas de superficie, estaciones, perfiles, volúmenes y parcelas; **Editar** le permite seleccionar y añadir puntos topográficos; **Guardar** y **Exportar** le permiten guardar el proyecto y escribir LandXML o DWG. **Carpetas que puede usar** (en Studio) son donde puede guardar y exportar. **Actividad** enumera sus llamadas. Consulte [Permitir que un asistente de IA trabaje con su emplazamiento](topic:assistants).
