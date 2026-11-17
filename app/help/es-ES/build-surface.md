---
title: Construir y refinar la superficie
summary: Cómo CivilCraft triangula el terreno existente y cómo darle forma con grupos de líneas de ruptura, líneas de ruptura dibujadas, un contorno exterior y la arista exterior más larga.
keywords: tin, superficie, triangulación, línea de ruptura, contorno, terreno existente, eg, crear superficie, delaunay, triángulos, arista máxima, contorno exterior
from: b9eea3f3
---

CivilCraft tiene una sola superficie de terreno existente por proyecto. Es una TIN (red irregular triangulada) construida a partir de sus puntos, y se reconstruye automáticamente cada vez que cambia una entrada. No hay ningún comando de «reconstruir» ni superficie desactualizada.

## Qué entra en la superficie

- Cada punto con cota en un grupo definido como {{ui:Puntos}}.
- Cada grupo definido como {{ui:Línea de ruptura}}, unido en orden de número de punto.
- Cada línea de ruptura que dibuje con la herramienta {{ui:Línea de ruptura}}.
- El contorno exterior, si dibuja uno.
- El ajuste **Arista exterior más larga**.

Los triángulos nunca cruzan una línea de ruptura: la superficie se obliga a seguirla y luego se reparte lo más uniformemente posible a su alrededor (Delaunay en el resto).

## Convertir líneas codificadas en líneas de ruptura

1. En el panel izquierdo, bajo **Puntos**, localice el grupo (por ejemplo, FL).
2. Ponga su opción **Superficie** en {{ui:Línea de ruptura}}.
   La superficie se reconstruye, la línea se dibuja en naranja (con {{ui:Líneas de ruptura}} activado en **Visualización**) y **Líneas de ruptura** en los datos de la superficie sube en una unidad.
3. Compruebe la línea en el plano. Debe ir de punto a punto en el orden en que se tomó. Si zigzaguea, el grupo contiene más de una línea o los puntos no están numerados en orden: vuelva a poner el grupo en {{ui:Puntos}} y dibuje las líneas a mano (siguiente sección).

## Dibujar una línea de ruptura a través de puntos

1. Pulse {{key:B}}, o haga clic en {{ui:Línea de ruptura}} del grupo **Superficie**.
   La indicación dice «Línea de ruptura: haga clic en los puntos topográficos en orden (toma sus cotas). Intro termina».
2. Mueva el puntero cerca de un punto. Un pequeño cuadrado naranja marca el punto que tomará.
3. Haga clic en los puntos de la línea uno tras otro. Cada clic indica el punto y su cota en la barra de estado.
4. Pulse {{key:Enter}} para terminar. La barra de estado indica «Línea de ruptura 1 añadida; la superficie se ha reconstruido».

Los clics deben caer sobre un punto topográfico que tenga cota; un clic en otro lugar se rechaza con «Haga clic en un punto topográfico con cota: una línea de ruptura toma las cotas de los puntos». {{key:Backspace}} quita el último punto; {{key:Esc}} cancela la línea completa.

:::warning
Termine con {{key:Enter}}. El doble clic también termina, pero en esta versión elimina el punto sobre el que hizo doble clic. Haga clic una vez en el último punto y después pulse {{key:Enter}}.
:::

Para eliminar a la vez todas las líneas de ruptura dibujadas, haga clic en {{ui:Quitar líneas de ruptura dibujadas}} en la sección **Superficie**. Para quitar solo la última, use {{key:Mod+Z}}. Las líneas de ruptura dibujadas todavía no se pueden seleccionar ni editar una a una.

## Dibujar el contorno exterior

Un contorno recorta la superficie al área en la que confía, por ejemplo los límites del levantamiento, de modo que desaparezcan los triángulos largos que cruzan esquinas no levantadas.

1. Pulse {{key:O}}, o haga clic en {{ui:Contorno}}.
2. Haga clic en las esquinas en orden alrededor del área. Una línea discontinua muestra la forma.
3. Pulse {{key:Enter}}. La barra de estado indica «Contorno definido; los triángulos fuera de él se han eliminado». **Contorno** en los datos de la superficie dice «Sí» y el número de esquinas.

Conviene saber:

- Solo hay un contorno. Si dibuja otro, reemplaza al anterior. {{ui:Quitar el contorno}} lo elimina.
- Solo puede recortar: un contorno que llegue más allá de los puntos se corta hasta su perímetro, con la nota «El contorno llega más allá de los puntos; se ha recortado hasta su perímetro».
- Sus esquinas toman sus cotas de la superficie, de modo que el borde sigue exactamente el terreno.
- Los contornos interiores de ocultación todavía no están disponibles.

## Recortar triángulos exteriores largos

Sin contorno, la superficie llena todo el perímetro de los puntos, incluidos los triángulos largos y finos a través de bordes cóncavos.

1. En **Superficie**, escriba una longitud en **Arista exterior más larga** y pulse {{key:Enter}}. Empiece con unas dos o tres veces su separación típica entre tomas.
2. Se eliminan los triángulos exteriores cuya arista externa sea más larga que eso, avanzando hacia dentro hasta que cada arista exterior sea lo bastante corta. Una arista que sea línea de ruptura nunca se quita.
3. Escriba 0 para conservar de nuevo todos los triángulos.

## Leer el informe de la superficie

Bajo los datos de la superficie, un recuadro enumera lo que hizo el constructor. Con una barra ocre a la izquierda es información; con una barra roja contiene un error y no hay superficie.

| Mensaje | Significado |
|---|---|
| «3 puntos estaban en el mismo lugar que otro y se unieron a él.» | Los puntos separados menos de 0.0001 en planta se convierten en un solo vértice (se conserva el primero). |
| «2 lugares tienen dos cotas distintas …» | Puntos superpuestos, o líneas de ruptura que se cruzan, no coinciden en altura. Gana la cota de la línea de ruptura, y después la primera. |
| «1 tramo de línea de ruptura no pudo forzarse en la superficie.» | Un tramo de línea de ruptura muy corto o casi solapado no encajó; revise ese punto. |
| «Una superficie necesita al menos tres puntos con cota.» | Muy pocos puntos: revise el orden de las columnas y los grupos. |
| «Los puntos están todos en una misma línea: no hay triángulos.» | Los puntos no tienen anchura, por ejemplo una sola línea de poligonal. |
| «El contorno no se superpone con los puntos.» | El contorno está en otro lugar, a menudo por una confusión de unidades o de coordenadas. |
| «No quedan triángulos dentro del contorno.» | El contorno es demasiado pequeño o está mal colocado. |

## Una superficie leída de LandXML

Al abrir un LandXML, se usa tal cual su primera superficie TIN: el encabezado **Superficie** dice «Superficie (desde LandXML)» y **Arista exterior más larga** aparece atenuada. Mientras esa superficie esté en uso, los grupos de líneas de ruptura, las líneas dibujadas y un contorno nuevo no la cambian. Para construir la superficie a partir de los puntos del archivo, haga clic en {{ui:Reconstruir la superficie a partir de los puntos}}. {{key:Mod+Z}} devuelve la superficie de LandXML.

## Relacionado

- [Leer curvas de nivel, cotas y pendientes](topic:contours).
- [Importar puntos topográficos](topic:import-points).
