---
title: Dibujar volúmenes de edificios en un terreno
summary: Dibuje un volumen de edificio sobre un predio, dele pisos y una altura de piso, vea su área bruta construida, elija cómo se asienta en terreno inclinado, empuje y tire de su altura en 3D, y envíelo a BimCraft o guárdelo como archivo IFC.
keywords: volumen, volumetría, huella, pisos, altura de piso, área bruta construida, pendiente, basamento, corte y relleno, empujar y tirar, 3D, estudio de sitio, anteproyecto, IFC, desarrollar, BimCraft, A-MASS
from: e5a67c16
---

Un volumen de edificio es una huella, un número de pisos y una altura de piso: la pregunta temprana «¿cuánto edificio cabe aquí y qué le hace al terreno?». Los volúmenes se ven en el plano con su nombre, número de pisos y área bruta construida, pasan al trazado en PDF y a las exportaciones DWG y DXF en las capas `A-MASS` y `A-MASS-TEXT`, y se guardan en el archivo del proyecto.

## Dibujar un volumen

1. En **Propiedades**, bajo **Volúmenes de edificios**, haga clic en **Dibujar un volumen**. (También está en el menú **Más** de la barra, junto a **Superficie**.)
2. Haga clic en las esquinas de la huella. Un clic cerca de una esquina del predio o de un punto topográfico toma el lugar exacto de ese punto.
3. Haga clic de nuevo en la primera esquina, o pulse {{key:Enter}}, para terminar. {{key:Backspace}} quita la última esquina; {{key:Esc}} cancela.

Un volumen nuevo tiene tres pisos y una altura de piso de 12 ft (3.6 m), y pertenece al predio en el que cae su centro.

## Pisos, altura y área

Haga clic en un volumen para cambiar su **Nombre**, **Uso**, **Pisos**, **Altura de piso** y **Predio**. La **Altura** es pisos por altura de piso: escriba una altura y el número de pisos pasa a ser el número entero más cercano (nunca menos de uno). La **Huella** y el **Área bruta construida** (huella por pisos) se calculan solas.

## En terreno inclinado

El terreno bajo un volumen se lee de la superficie: el terreno existente, o el nivelado si eligió **Terreno propuesto (nivelado)**. **En terreno inclinado** dice dónde queda la planta baja:

- **Escalonado**: al nivel medio del terreno bajo la huella. El lado bajo se rellena hasta él y el alto se corta, y ambos volúmenes casi se compensan.
- **Basamento**: en el terreno más alto. Una base sólida rellena el lado bajo.
- **Corte**: en el terreno más bajo. El lado alto se corta hacia la ladera.

Propiedades muestra el rango del terreno bajo el volumen, el **Nivel de planta baja** y el volumen de relleno y corte entre el terreno y ese nivel. Un punto de la huella que queda fuera de la superficie no se cuenta, y Propiedades dice cuántos son.

## En la vista 3D

Los volúmenes se dibujan en la vista 3D del sitio, con una línea en cada piso y su nombre sobre la azotea. **Mostrar** tiene una casilla para **Volúmenes de edificios**. Haga clic en uno para seleccionarlo. Con un volumen seleccionado:

- arrastre su azotea hacia arriba o abajo para empujarlo o tirar de él un piso a la vez, o pulse {{key:PageUp}} y {{key:PageDown}};
- todo el movimiento es un solo paso de deshacer.

La vista de calle de **Conducir** también ve los volúmenes, y **Sol** proyecta sus sombras sobre el terreno.

## Enviarlo a otra parte

- **Volúmenes como IFC** guarda todos los volúmenes como un archivo IFC4: un sitio, un edificio con sus niveles, y el volumen como elemento de construcción con sus datos en el conjunto de propiedades `CadCraft_SiteMass`. Si el proyecto tiene sistema de coordenadas, el archivo queda ubicado en el mapa y lleva la latitud y longitud del sitio; si no, no dice nada de dónde está.
- **Desarrollar en BimCraft** abre BimCraft en una pestaña nueva con los volúmenes. Allí, al elegir un volumen aparecen sus datos y **Desarrollar este volumen**, que construye muros en cada nivel y un piso bajo el edificio a partir de la huella, en un solo paso de deshacer. No se sube nada: el archivo pasa entre las dos pestañas de este navegador.

Vea también **Límites de zonificación** y **Horas de sol**.
