---
title: Configuración de CivilCraft
summary: Elija el orden de las columnas para las filas de puntos copiadas y pegadas y para suponer las columnas de un archivo, cómo se numeran los puntos pegados, qué muestran las etiquetas de puntos, el indicador de esquina, la exageración vertical en 3D, cómo se muestran la latitud y la longitud, y si las capas de mapa provienen de internet.
keywords: configuración, preferencias, pnezd, penzd, orden de columnas, filas de puntos, renumerar, números de punto, número inicial, etiquetas de puntos, etiquetas, descripción, elevación, cubo de vistas, icono de ejes, indicador de esquina, brújula, exageración vertical, 3d, latitud, longitud, gms, grados decimales, capas de mapa, internet, privacidad
from: 64b9cb92
---

Abra {{ui:Configuración}} con el engranaje de la barra de la aplicación o con {{key:Mod+,}}. La primera pestaña, {{ui:CivilCraft}}, contiene las configuraciones propias de esta aplicación; {{ui:General}} contiene las que comparten todas las aplicaciones de CadCraft (tema, barra de herramientas, paneles). Las configuraciones de CivilCraft existen solo en la aplicación: las cambia aquí, y este navegador las recuerda. {{ui:Restablecer configuración de CivilCraft}} devuelve cada configuración a su valor inicial.

## Filas de puntos

**P, N, E, Z, D** (la inicial) o **P, E, N, Z, D**: punto, norte, este, elevación, descripción, o este antes que norte. Se usa en tres lugares:

- **Copiar**: las filas que CivilCraft coloca en el portapapeles del sistema para una hoja de cálculo.
- **Pegar**: filas pegadas desde una hoja de cálculo o un archivo de texto que no tienen fila de encabezado.
- **Importar**: la suposición del cuadro **Importar puntos** cuando un archivo no tiene fila de encabezado (un archivo con cuatro columnas se lee como PENZ, con tres como ENZ). Consulte [Formatos de archivo de puntos](topic:point-file-formats).

Una fila de encabezado que nombre sus columnas siempre prevalece, y también una elección en la lista **Columnas** del cuadro de importación.

## Números para los puntos pegados

- **Conservar números libres** (la inicial): un punto pegado conserva su número cuando ningún otro punto lo usa; solo los puntos en conflicto reciben números nuevos.
- **Siempre números nuevos**: a cada punto pegado se le asigna un número nuevo, aunque el suyo esté libre.

**Los números nuevos empiezan en**: déjelo vacío para contar a partir del número más alto en uso más uno. Escriba un número, por ejemplo 5000, para asignar números a partir de 5000; los números ya en uso se omiten. De cualquier forma, dos puntos nunca comparten número. Consulte [Seleccionar, copiar y pegar puntos topográficos](topic:copy-paste-points#point-numbers-never-clash).

## Etiquetas de puntos

Lo que muestra una etiqueta de punto cuando {{ui:Etiquetas de puntos}} está activada en **Pantalla**: **Número**, **Número y elevación**, o **Número, elevación y descripción** (la inicial). Las exportaciones DXF, DWG y PDF muestran las mismas etiquetas que la pantalla.

## Indicador de esquina

Lo que aparece en la esquina de la planta y de la vista 3D: **Cubo de vistas** (la inicial), **Icono de ejes** o **Ninguno**.

- **Cubo de vistas** (arriba a la derecha). En la planta muestra la vista superior, con el anillo de brújula: N es el norte de la cuadrícula (hacia arriba en la planta). Haga clic en cualquier otro lado, arista o esquina del cubo, o arrástrelo, y se abre la [vista 3D](topic:site-3d) mirando desde ahí. {{ui:Inicio}} en el cubo de la planta ajusta la planta.
- En la vista 3D el cubo gira con la vista: haga clic en un lado, arista o esquina para mirar desde ahí, arrastre el cubo para orbitar, arrastre el anillo de brújula para girar alrededor de la vertical, haga clic en una letra para mirar desde ese lado, y use {{ui:Inicio}} para la vista isométrica de todo el sitio. Al mirar de frente un lado, las flechas pequeñas pasan al lado siguiente y las flechas curvas giran la vista un cuarto de vuelta.
- **Icono de ejes** (abajo a la izquierda): un pequeño marcador X (este) y Y (norte) en la planta, X, Y y Z (arriba) en 3D.

## Exageración vertical en 3D

Cuánto estira la vista 3D las elevaciones: **1×**, **2×** (la inicial), **3×**, **5×** o **10×**. La lista de la barra de la vista 3D es la misma configuración, así que cambiar una cambia ambas. Los volúmenes, los perfiles y las exportaciones 3D se mantienen a escala real.

## Latitud y longitud

Cómo muestra la barra de estado la latitud y la longitud del puntero cuando el proyecto tiene un sistema de coordenadas: **grados, minutos y segundos** (la inicial, por ejemplo `30°18′00.00″ N`) o **grados decimales** (`30.300000° N`). Consulte [Definir el sistema de coordenadas del proyecto](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Capas de mapa desde internet

**Desactivado** (la inicial) o **Activado**. Cuando está activado, CivilCraft pide a los servidores de mapas que usted agregue imágenes del área en pantalla. Su dibujo permanece en esta computadora; el servidor ve el área y su dirección de internet. Mientras está desactivado, no se pide nada a ningún servidor de mapas, aunque un proyecto que abra mencione uno; una imagen georreferenciada de un archivo funciona en cualquiera de los dos casos. Consulte [Mostrar capas de mapa bajo la planta](topic:map-layers).


## Asistentes

**Permitir que los asistentes de IA y los scripts usen CivilCraft** (desactivado al inicio) permite que un asistente de su computadora acceda al sitio abierto a través de CadCraft Studio: **Leer** describe el sitio y entrega puntos, elevaciones de superficie, estaciones, perfiles, volúmenes y parcelas; **Editar** le permite seleccionar y agregar puntos topográficos; **Guardar** y **Exportar** le permiten guardar el proyecto y escribir LandXML o DWG. **Carpetas que puede usar** (en Studio) son donde puede guardar y exportar. **Actividad** enumera sus llamadas. Consulte [Permitir que un asistente de IA trabaje con su sitio](topic:assistants).
