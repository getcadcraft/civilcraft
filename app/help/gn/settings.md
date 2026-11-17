---
title: Configuración de CivilCraft
summary: Elegir el orden de columnas para las filas de puntos copiadas y pegadas y para adivinar las columnas de un archivo, cómo se numeran los puntos pegados, qué muestran las etiquetas de puntos, el indicador de esquina, la exageración vertical 3D, cómo se muestran la latitud y la longitud, y si las capas de mapa vienen de internet.
keywords: configuración, preferencias, pnezd, penzd, orden de columnas, filas de puntos, renumerar, números de punto, número inicial, etiquetas de puntos, rótulos, descripción, cota, cubo de vista, icono de ejes, indicador de esquina, brújula, exageración vertical, 3d, latitud, longitud, gms, grados decimales, capas de mapa, internet, privacidad
from: 64b9cb92
---

Abrí {{ui:Configuración}} con el engranaje de la barra de aplicación o con {{key:Mod+,}}. La primera pestaña, {{ui:CivilCraft}}, contiene las configuraciones propias de esta aplicación; {{ui:General}} contiene las que comparten todas las aplicaciones de CadCraft (tema, barra de herramientas, paneles). Las configuraciones de CivilCraft existen solo en la aplicación: las cambiás acá, y este navegador las recuerda. {{ui:Restablecer configuración de CivilCraft}} devuelve cada configuración a su valor inicial.

## Filas de puntos

**P, N, E, Z, D** (el inicio) o **P, E, N, Z, D**: punto, norte, este, cota, descripción, o este antes que norte. Se usa en tres lugares:

- **Copiar**: las filas que CivilCraft pone en el portapapeles del sistema para una planilla.
- **Pegar**: filas pegadas desde una planilla o un archivo de texto que no tienen fila de encabezado.
- **Importar**: la suposición del diálogo **Importar puntos** cuando un archivo no tiene fila de encabezado (un archivo con cuatro columnas se lee como PENZ, uno con tres como ENZ). Ver [Formatos de archivos de puntos](topic:point-file-formats).

Una fila de encabezado que nombra sus columnas siempre gana, y también gana una elección de la lista **Columnas** del diálogo de importación.

## Números para los puntos pegados

- **Conservar números libres** (el inicio): un punto pegado conserva su número cuando ningún punto lo tiene; solo los puntos en conflicto reciben números nuevos.
- **Siempre números nuevos**: a cada punto pegado se le da un número nuevo, aunque el suyo esté libre.

**Los números nuevos empiezan en**: dejalo vacío para contar desde uno más que el número más alto en uso. Escribí un número, por ejemplo 5000, para dar a los puntos nuevos números desde 5000 en adelante; los números ya en uso se saltan. Dos puntos nunca comparten un número en ningún caso. Ver [Seleccionar, copiar y pegar puntos de levantamiento](topic:copy-paste-points#point-numbers-never-clash).

## Etiquetas de puntos

Lo que muestra una etiqueta de punto cuando {{ui:Etiquetas de puntos}} está activado en **Visualización**: **Número**, **Número y cota**, o **Número, cota y descripción** (el inicio). Las exportaciones DXF, DWG y PDF muestran las mismas etiquetas que la pantalla.

## Indicador de esquina

Qué aparece en la esquina del plano y de la vista 3D: **Cubo de vista** (el inicio), **Icono de ejes** o **Ninguno**.

- **Cubo de vista** (arriba a la derecha). En el plano muestra la parte superior, con el anillo de brújula: N es el norte de la cuadrícula (hacia arriba en el plano). Hacé clic en cualquier otro lado, borde o esquina del cubo, o arrastralo, y la [vista 3D](topic:site-3d) se abre mirando desde allí. {{ui:Inicio}} en el cubo del plano ajusta el plano.
- En la vista 3D el cubo gira con la vista: hacé clic en un lado, borde o esquina para mirar desde allí, arrastrá el cubo para orbitar, arrastrá el anillo de brújula para girar alrededor de la vertical, hacé clic en una letra para mirar desde ese lado, y usá {{ui:Inicio}} para la vista isométrica de todo el sitio. Cuando mirás de frente a un lado, las pequeñas flechas pasan al siguiente lado y las flechas curvas giran la vista un cuarto de vuelta.
- **Icono de ejes** (abajo a la izquierda): un pequeño marcador X (este) e Y (norte) en el plano, X, Y y Z (arriba) en 3D.

## Exageración vertical 3D

Cuánto estira la vista 3D las cotas: **1×**, **2×** (el inicio), **3×**, **5×** o **10×**. La lista de la barra de la vista 3D es la misma configuración, así que cambiar una cambia ambas. Los volúmenes, perfiles y exportaciones 3D quedan a escala real.

## Latitud y longitud

Cómo muestra la barra de estado la latitud y la longitud del puntero cuando el proyecto tiene un sistema de coordenadas: **grados, minutos y segundos** (el inicio, por ejemplo `30°18′00.00″ N`) o **grados decimales** (`30.300000° N`). Ver [Fijar el sistema de coordenadas del proyecto](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Capas de mapa desde internet

**Desactivado** (el inicio) o **Activado**. Cuando está activado, CivilCraft pide a los servidores de mapas que agregaste imágenes de la zona en pantalla. Tu dibujo queda en esta computadora; el servidor ve la zona y tu dirección de internet. Mientras está desactivado, no se le pide nada a ningún servidor de mapas, aunque un proyecto que abras nombre uno; una imagen georreferenciada de un archivo funciona de todos modos. Ver [Mostrar capas de mapa debajo del plano](topic:map-layers).

## Asistentes

**Permitir que asistentes de IA y scripts usen CivilCraft** (desactivado al inicio) permite que un asistente de tu computadora llegue al sitio abierto a través de CadCraft Studio: **Leer** describe el sitio y da puntos, cotas de superficie, estaciones, perfiles, volúmenes y parcelas; **Editar** le permite seleccionar y agregar puntos de levantamiento; **Guardar** y **Exportar** le permiten guardar el proyecto y escribir LandXML o DWG. **Carpetas que puede usar** (en Studio) son donde puede guardar y exportar. **Actividad** lista sus llamadas. Ver [Dejar que un asistente de IA trabaje con tu sitio](topic:assistants).
