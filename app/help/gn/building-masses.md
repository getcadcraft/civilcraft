---
title: Dibujar volúmenes de edificios en un sitio
summary: Dibujá un volumen de edificio sobre un lote, dale plantas y altura de planta, mirá su superficie bruta de piso, elegí cómo se asienta en terreno en pendiente, empujá y tirá de su altura en 3D, y envialo a BimCraft o guardalo como archivo IFC.
keywords: volumen, masa, volumen de edificio, volumen, huella, plantas, altura de planta, superficie bruta de piso, GFA, pendiente, podio, corte y relleno, empujar tirar, 3D, estudio de sitio, diseño temprano, IFC, desarrollar, BimCraft, A-MASS
from: e5a67c16
---

Un volumen de edificio es una huella, una cantidad de plantas y una altura de planta: la pregunta temprana de "cuánto edificio entra aquí, y qué le hace al terreno". Los volúmenes se ven en el plano con su nombre, cantidad de plantas y superficie bruta de piso, pasan a la salida PDF y a las exportaciones DWG y DXF en las capas `A-MASS` y `A-MASS-TEXT`, y se guardan en el archivo del proyecto.

## Dibujar un volumen

1. En **Propiedades**, bajo **Volúmenes de edificios**, hacé clic en **Dibujar un volumen**. (También está en el menú **Más** de la barra de herramientas, junto a **Superficie**.)
2. Hacé clic en las esquinas de la huella. Un clic cerca de una esquina de lote o de un punto de relevamiento toma el lugar exacto de ese punto.
3. Hacé clic de nuevo en la primera esquina, o apretá {{key:Enter}}, para terminar. {{key:Backspace}} quita la última esquina; {{key:Esc}} detiene.

Un volumen nuevo tiene tres plantas y una altura de planta de 12 ft (3.6 m), y pertenece al lote donde cae su punto medio.

## Plantas, altura y superficie

Hacé clic en un volumen para cambiar su **Nombre**, **Uso**, **Plantas**, **Altura de planta** y **Lote**. La **Altura** es plantas por altura de planta: escribí una altura y la cantidad de plantas pasa al número entero de plantas más cercano (nunca menos de una). **Huella** y **Superficie bruta de piso** (huella por plantas) se calculan solas.

## En terreno en pendiente

El terreno bajo un volumen se lee de la superficie: terreno existente, o el terreno nivelado si elegiste **Terreno propuesto (nivelado)**. **En terreno en pendiente** indica dónde va la planta baja:

- **Escalonado**: al terreno promedio bajo la huella. El lado bajo se rellena hasta ahí y el lado alto se corta, y las dos cosas quedan casi equilibradas.
- **Podio**: al terreno más alto. Una base sólida rellena el lado bajo.
- **Corte**: al terreno más bajo. El lado alto se corta y se quita hacia dentro de la colina.

Propiedades muestra el rango de terreno bajo el volumen, el **Nivel de planta baja**, y el volumen de relleno y corte entre el terreno y ese nivel. Un punto de la huella que queda fuera de la superficie se deja de lado, y Propiedades dice cuántos son.

## En la vista 3D

Los volúmenes se dibujan en la vista 3D del sitio, con una línea alrededor de cada planta y sus nombres sobre el techo. **Mostrar** tiene una casilla para **Volúmenes de edificios**. Hacé clic en uno para seleccionarlo. Con un volumen seleccionado:

- arrastrá su techo hacia arriba o hacia abajo para empujarlo o tirarlo una planta a la vez, o apretá {{key:PageUp}} y {{key:PageDown}};
- todo el movimiento es un solo paso de deshacer.

La vista de calle de **Recorrer** también ve los volúmenes, y **Sol** proyecta sus sombras sobre el terreno.

## Enviarlo

- **Volúmenes como IFC** guarda cada volumen como un archivo IFC4: un sitio, un edificio con sus pisos, y el volumen como elemento de edificio con sus números en el conjunto de propiedades `CadCraft_SiteMass`. Con un sistema de coordenadas fijado en el proyecto, el archivo se ubica en el mapa y lleva la latitud y longitud del sitio; sin uno, no dice nada sobre dónde está.
- **Desarrollar en BimCraft** abre BimCraft en una pestaña nueva con los volúmenes. Ahí, al elegir un volumen se muestran sus números y **Desarrollar este volumen**, que construye muros en cada nivel y un piso bajo el edificio a partir de la huella, en un solo paso de deshacer. No se sube nada: el archivo pasa entre las dos pestañas de este navegador.

Ver también **Límites de zonificación** y **Horas de sol**.
