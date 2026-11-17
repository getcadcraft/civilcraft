---
title: Líneas características
summary: Dibuje líneas 3D cuyas pendientes defina vértice a vértice, cree desfases escalonados de ellas y úselas como líneas de ruptura del terreno o como plataformas con pendiente en el diseño.
keywords: arco, curva, radio, arco 3D, hélice, bordillo curvo, superposición de pendientes, superposición de cotas, flechas de pendiente, línea característica, pendiente, cota, desfase escalonado, desfase, línea de ruptura, bordillo, cuneta, caballón, plataforma con pendiente, talud, nivelación, polilínea 3D
from: d55b25fb
---

Una línea característica es una línea con una cota en cada vértice: un bordillo, una línea de flujo de una cuneta, la coronación de un caballón, el borde de una plataforma con pendiente. Usted fija sus cotas por número o por pendiente, la copia lateralmente con un escalón hacia arriba o hacia abajo, y elige qué hacen las superficies con ella.

## Dibujar una

1. Elija **Superficie** › {{ui:Más}} › {{ui:Línea característica}}, o pulse {{key:L}}.
2. Haga clic en sus vértices en la planta. Un clic sobre un punto topográfico toma la posición y la cota de ese punto; en cualquier otro lugar, el vértice toma la cota del terreno existente en ese lugar.
3. Pulse {{key:Enter}} para terminar una línea abierta, o haga clic de nuevo en el primer vértice para cerrarla.

La nueva línea queda seleccionada y empieza como línea de ruptura del terreno existente, apoyada en el terreno.

## Arcos

Un tramo puede ser un arco en planta cuyos extremos están a cotas distintas: un remate de bordillo, una cuneta curva, una rampa que gira. Su pendiente varía uniformemente a lo largo del arco, y su longitud se mide a lo largo de la curva.

- **Mientras dibuja:** pulse {{key:C}} (en una pantalla táctil, {{ui:Arco}} en la barra sobre la planta) para activar los arcos. Tras un vértice, haga clic en un punto de la curva y después en el lugar donde termina el arco. Pulse {{key:C}} de nuevo para los tramos rectos. {{key:Backspace}} elimina antes el punto de la curva.
- **Después:** en **Propiedades**, escriba un radio y el sentido de giro en la casilla **Arco** del vértice, por ejemplo `50 L` o `50 R` (izquierda o derecha según avance por la línea), y pulse {{key:Enter}}. Vacíe la casilla para que el tramo vuelva a ser recto. Un radio menor que la mitad del tramo se rechaza.

La línea seleccionada muestra el radio de cada arco junto a su pendiente. **Longitud** es a lo largo de los arcos en planta; **Longitud 3D** cuenta también el desnivel. Los desfases escalonados conservan los arcos: un arco por el lado exterior de una curva crece, uno por el interior se reduce, y un desfase que pase del centro de un arco se rechaza.

Las superficies, la vista 3D, el DXF y el DWG representan cada arco como pequeños tramos rectos que quedan dentro de 0.01 de la curva. LandXML los conserva como arcos (véase **Arcos en otros archivos** más abajo).

## Fijar cotas y pendientes

**Propiedades** lista los vértices con su distancia a lo largo de la línea, su **Cota** y la **Pendiente al siguiente** (en por ciento). Escriba cualquiera de las dos y pulse {{key:Enter}}:

- Una cota mueve solo ese vértice.
- Una pendiente fija la cota en el extremo lejano de su tramo; los vértices posteriores no se mueven, de modo que cambia la pendiente del tramo siguiente.

También en **Propiedades**:

| Acción | Qué hace |
|---|---|
| **Subir o bajar todo en** | Suma la altura que escriba a cada vértice. |
| {{ui:Cotas del terreno}} | Vuelve a poner cada vértice sobre el terreno existente (los vértices fuera de la superficie conservan la suya, y se listan). |
| {{ui:Una sola pendiente, del primero al último}} | Conserva la primera y la última cota y pone los vértices intermedios en una pendiente uniforme. |

La línea seleccionada muestra sus cotas en los vértices y sus pendientes a lo largo de los tramos en la planta. Arrastre un vértice con {{ui:Seleccionar}} para moverlo; su cota no cambia.

## Desfases escalonados

En **Desfase escalonado**, escriba una **Distancia** (positiva a la derecha del sentido de la línea, negativa a la izquierda), después una altura (subida o bajada en) o una pendiente en por ciento, y haga clic en {{ui:Crear la línea desfasada}}. La copia es una nueva línea característica: por ejemplo, el dorso de un bordillo a 0.5 ft al costado y 0.5 ft más alto, o el borde de una cuneta a 6 ft hacia fuera con un 2 %. Una distancia que hiciera que la copia se pliegue sobre sí misma en una curva cerrada se rechaza.

## Pendientes y cotas en pantalla

Pulse {{key:E}}, o marque **Pendientes y cotas en líneas características** en **Visualización**, para ver la pendiente de cada línea característica a lo largo de cada tramo (con una pequeña flecha que apunta cuesta abajo) y su cota en los vértices. Solo se muestran en pantalla: no se añade nada al dibujo, y el PDF, el DXF y el DWG quedan como estaban. Los tramos cortos y los vértices juntos no llevan etiqueta hasta que amplíe la vista. La línea seleccionada siempre muestra sus propias pendientes y cotas.

## En la vista de perfil

Una línea característica que cruza un eje de trazado aparece en la vista de perfil de ese eje, con su nombre y su cota en el cruce; las líneas que corren junto a ella también pueden mostrarse. Véase [Diseñar un perfil longitudinal](topic:profile).

## Lo que hacen las superficies con ella

Elija **Uso**:

| Uso | Qué ocurre |
|---|---|
| Línea de ruptura del terreno existente | El terreno existente pasa por la línea a sus cotas, como una línea de ruptura dibujada. |
| Nivelada en el diseño | Una línea **cerrada** se convierte en una plataforma con pendiente: la superficie propuesta dentro de ella se nivela hasta su borde. Active **Líneas de talud hasta el terreno** para trazar taludes de desmonte y terraplén (horizontal a 1 vertical) desde su borde hasta el terreno, como lo hace una plataforma; cada talud empieza en la cota propia del borde en ese punto. |
| Solo dibujada | Queda en la planta y sale en DXF, DWG y PDF (capa C-GRAD-FEAT, polilíneas 3D), pero las superficies la ignoran. |

Los volúmenes, las secciones y la vista 3D incluyen las líneas características niveladas en el diseño, como las plataformas. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## Compartir líneas con vuestro equipo

En un dibujo abierto desde sus archivos en la nube de CadCraft Studio, con un plan de equipo, las Propiedades del proyecto (sin nada seleccionado) tienen una sección **Equipo** con {{ui:Líneas del equipo…}}: las líneas que vuestro equipo ha compartido, cada una con su revisión, sin tener que seleccionar antes una línea característica. Seleccione una línea para compartirla, enviar una revisión nueva, traer la del equipo o dejar de compartirla. Fuera de ese ajuste, la sección indica qué necesita.

## Arcos en otros archivos

| Archivo | Qué ocurre con una línea característica con arcos |
|---|---|
| Proyecto de CivilCraft | Se conserva exactamente. |
| LandXML | Se escribe como una característica de planta de líneas y arcos con sus cotas, y se vuelve a leer con sus arcos. Una línea característica de otro programa entra como **Solo dibujada**: elija su **Uso** para ponerla en una superficie. |
| DWG y DXF | Una polilínea 3D no puede contener un arco, así que la línea se escribe como pequeños tramos dentro de 0.01 de cada arco. CivilCraft también anota en el dibujo qué tramos eran arcos: al abrir el dibujo como trazado, {{ui:Líneas características}} devuelve las líneas como líneas características con sus arcos. Otros programas ven una polilínea 3D corriente. |
