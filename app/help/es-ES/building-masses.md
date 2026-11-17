---
title: Dibujar masas de edificación en un emplazamiento
summary: Dibuje una masa de edificación en una parcela, dele plantas y una altura de planta, vea su superficie construida bruta, elija cómo se asienta en terreno en pendiente, empuje y tire de su altura en 3D, y envíela a BimCraft o guárdela como archivo IFC.
keywords: masa, volumetría, masa de edificación, volumen, huella, plantas, altura de planta, superficie construida bruta, GFA, pendiente, podio, desmonte y terraplén, empujar y tirar, 3D, estudio de emplazamiento, diseño preliminar, IFC, desarrollar, BimCraft, A-MASS
from: e5a67c16
---

Una masa de edificación es una huella, un número de plantas y una altura de planta: la pregunta inicial «cuánto edificio cabe aquí y qué le hace al terreno». Las masas se sitúan en el plano con su nombre, su número de plantas y su superficie construida bruta, pasan a la impresión PDF y a las exportaciones DWG y DXF en las capas `A-MASS` y `A-MASS-TEXT`, y se guardan en el archivo del proyecto.

## Dibujar una masa

1. En **Propiedades**, bajo **Masas de edificación**, haga clic en **Dibujar una masa**. (También está en el menú **Más** de la barra de herramientas, junto a **Superficie**.)
2. Haga clic en las esquinas de la huella. Un clic cerca de una esquina de parcela o de un punto topográfico toma la posición exacta de ese punto.
3. Haga clic de nuevo en la primera esquina, o pulse {{key:Enter}}, para terminar. {{key:Backspace}} quita la última esquina; {{key:Esc}} se detiene.

Una masa nueva tiene tres plantas y una altura de planta de 12 ft (3.6 m), y pertenece a la parcela en cuyo centro cae.

## Plantas, altura y superficie

Haga clic en una masa para cambiar su **Nombre**, **Uso**, **Plantas**, **Altura de planta** y **Parcela**. La **Altura** es el número de plantas por la altura de planta: escriba una altura y el número de plantas pasa a ser el número entero más próximo (nunca menos de uno). **Huella** y **Superficie construida bruta** (huella por plantas) se calculan por usted.

## En terreno en pendiente

El terreno bajo una masa se lee de la superficie: el terreno existente, o el terreno explanado si eligió **Terreno proyectado (explanado)**. **En terreno en pendiente** indica dónde va la planta baja:

- **Escalonada**: a la cota media del terreno bajo la huella. El lado bajo se rellena hasta ella y el lado alto se desmonta, y ambos quedan casi compensados.
- **Podio**: a la cota más alta del terreno. Una base maciza rellena el lado bajo.
- **Desmonte**: a la cota más baja del terreno. El lado alto se excava hacia la ladera.

Propiedades muestra el rango de terreno bajo la masa, el **Nivel de planta baja** y el volumen de terraplén y de desmonte entre el terreno y ese nivel. Un punto de la huella que queda fuera de la superficie se excluye, y Propiedades indica cuántos son.

## En la vista 3D

Las masas se dibujan en la vista 3D del emplazamiento, con una línea alrededor de cada planta y sus nombres sobre la cubierta. **Mostrar** tiene una casilla para **Masas de edificación**. Haga clic en una para seleccionarla. Con una masa seleccionada:

- arrastre su cubierta hacia arriba o abajo para empujarla o tirar de ella una planta cada vez, o pulse {{key:PageUp}} y {{key:PageDown}};
- todo el movimiento es un solo paso de deshacer.

La vista de calle de **Conducir** también ve las masas, y **Sol** proyecta sus sombras sobre el terreno.

## Enviarla

- **Masas como IFC** guarda cada masa como un archivo IFC4: un emplazamiento, un edificio con sus plantas, y la masa como elemento de edificio con sus números en el conjunto de propiedades `CadCraft_SiteMass`. Si el proyecto tiene un sistema de coordenadas, el archivo se sitúa en el mapa y lleva la latitud y la longitud del emplazamiento; si no, no dice nada sobre dónde está.
- **Desarrollar en BimCraft** abre BimCraft en una pestaña nueva con las masas. Allí, al elegir una masa se muestran sus números y **Desarrollar esta masa**, que construye muros en cada nivel y un forjado bajo el edificio a partir de la huella, en un solo paso de deshacer. No se sube nada: el archivo pasa entre las dos pestañas de este navegador.

Vea también **Límites de zonificación** y **Horas de sol**.
