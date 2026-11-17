---
title: Construir y refinar la superficie
summary: Cómo CivilCraft triangula el terreno existente y cómo darle forma con grupos de líneas de ruptura, líneas de ruptura dibujadas, un contorno exterior y la arista exterior más larga.
keywords: tin, superficie, triangulación, línea de ruptura, contorno, terreno existente, eg, crear superficie, delaunay, triángulos, arista máxima, contorno exterior
from: b9eea3f3
---

CivilCraft tiene una superficie de terreno existente por proyecto. Es una TIN (red irregular triangulada) construida a partir de sus puntos, y se reconstruye automáticamente cada vez que cambia una entrada. No hay comando de "reconstruir" ni superficie desactualizada.

## Qué entra en la superficie

- Cada punto con elevación en un grupo configurado como {{ui:Puntos}}.
- Cada grupo configurado como {{ui:Línea de ruptura}}, unido en orden de número de punto.
- Cada línea de ruptura que dibuje con la herramienta {{ui:Línea de ruptura}}.
- El contorno exterior, si dibuja uno.
- La configuración **Arista exterior más larga**.

Los triángulos nunca cruzan una línea de ruptura: la superficie se obliga a seguirla y luego se hace lo más uniforme posible a su alrededor (Delaunay en todo lo demás).

## Convertir líneas codificadas en líneas de ruptura

1. En el panel izquierdo, bajo **Puntos**, busque el grupo (por ejemplo, FL).
2. Establezca su opción **Superficie** en {{ui:Línea de ruptura}}.
   La superficie se reconstruye, la línea se dibuja en naranja (con {{ui:Líneas de ruptura}} activado bajo **Visualización**), y **Líneas de ruptura** en los datos de la superficie sube en uno.
3. Revise la línea en la planta. Debe pasar de punto a punto en el orden en que se levantó. Si zigzaguea, el grupo contiene más de una línea o los puntos no están numerados en orden: vuelva a poner el grupo en {{ui:Puntos}} y dibuje las líneas a mano (siguiente sección).

## Dibujar una línea de ruptura por puntos

1. Pulse {{key:B}}, o haga clic en {{ui:Línea de ruptura}} en el grupo **Superficie**.
   La sugerencia dice "Línea de ruptura: haga clic en los puntos de levantamiento en orden (toma sus elevaciones). Enter termina."
2. Mueva el puntero cerca de un punto. Un pequeño cuadrado naranja marca el punto que tomará.
3. Haga clic en los puntos de la línea uno tras otro. Cada clic nombra el punto y su elevación en la barra de estado.
4. Pulse {{key:Enter}} para terminar.
   La barra de estado dice "Línea de ruptura 1 agregada; la superficie se reconstruyó."

Los clics deben caer sobre un punto de levantamiento que tenga elevación; un clic en otro lugar se rechaza con "Haga clic en un punto de levantamiento con elevación: una línea de ruptura toma las elevaciones de los puntos." {{key:Backspace}} quita el último punto; {{key:Esc}} cancela toda la línea.

:::warning
Termine con {{key:Enter}}. El doble clic también termina, pero en esta versión elimina el punto en el que hizo doble clic. Haga clic una vez en el último punto y luego pulse {{key:Enter}}.
:::

Para quitar todas las líneas de ruptura dibujadas de una vez, haga clic en {{ui:Quitar líneas de ruptura dibujadas}} en la sección **Superficie**. Para quitar solo la última, use {{key:Mod+Z}}. Las líneas de ruptura dibujadas todavía no se pueden seleccionar ni editar una por una.

## Dibujar el contorno exterior

Un contorno recorta la superficie al área en la que confía, por ejemplo los límites del levantamiento, para que desaparezcan los triángulos largos que cruzan esquinas sin levantar.

1. Pulse {{key:O}}, o haga clic en {{ui:Contorno}}.
2. Haga clic en las esquinas en orden alrededor del área. Una línea punteada muestra la forma.
3. Pulse {{key:Enter}}.
   La barra de estado dice "Contorno establecido; los triángulos fuera de él se eliminaron." **Contorno** en los datos de la superficie dice "Sí" y el número de esquinas.

Puntos a tener en cuenta:

- Hay un solo contorno. Dibujar otro lo reemplaza. {{ui:Quitar el contorno}} lo elimina.
- Solo puede quitar: un contorno que llegue más allá de los puntos se recorta hasta su perímetro, con la nota "El contorno llega más allá de los puntos; se recortó hasta su perímetro."
- Sus esquinas toman sus elevaciones de la superficie, así que el borde sigue el terreno exactamente.
- Los contornos interiores (de ocultación) todavía no están disponibles.

## Recortar triángulos exteriores largos

Sin contorno, la superficie llena todo el perímetro de los puntos, incluidos los triángulos largos y delgados a través de bordes cóncavos.

1. En **Superficie**, escriba una longitud en **Arista exterior más larga** y pulse {{key:Enter}}. Empiece con unas dos o tres veces su separación típica entre puntos levantados.
2. Se eliminan los triángulos exteriores cuya arista exterior es más larga que eso, avanzando hacia dentro hasta que cada arista exterior sea lo bastante corta. Una arista que es línea de ruptura nunca se retira.
3. Escriba 0 para volver a conservar todos los triángulos.

## Leer el informe de la superficie

Bajo los datos de la superficie, un cuadro enumera lo que hizo el constructor. Con una barra ocre a la izquierda es información; con una barra roja contiene un error y no hay superficie.

| Mensaje | Significado |
|---|---|
| "3 puntos estaban en el mismo lugar que otro y se unieron a él." | Puntos más cercanos que 0.0001 en planta se convirtieron en un solo vértice (se conservó el primero). |
| "2 lugares tienen dos elevaciones distintas …" | Puntos encimados, o líneas de ruptura que se cruzan, no coinciden en altura. Gana la elevación de la línea de ruptura, luego la primera. |
| "1 tramo de línea de ruptura no pudo forzarse en la superficie." | Un tramo de línea de ruptura muy corto o casi encimado no cupo; revise ese punto. |
| "Una superficie necesita al menos tres puntos con elevación." | Muy pocos puntos: revise el orden de columnas y los grupos. |
| "Los puntos están todos en una misma línea: no hay triángulos." | Los puntos no tienen ancho, por ejemplo una sola línea de poligonal. |
| "El contorno no se superpone con los puntos." | El contorno está en otro lugar, a menudo por una mezcla de unidades o de sistema de coordenadas. |
| "No quedan triángulos dentro del contorno." | El contorno es muy pequeño o está mal ubicado. |

## Una superficie leída desde LandXML

Al abrir LandXML, se usa su primera superficie TIN tal como está: el encabezado **Superficie** dice "Superficie (desde LandXML)" y **Arista exterior más larga** aparece atenuado. Mientras esa superficie está en uso, los grupos de líneas de ruptura, las líneas de ruptura dibujadas y un nuevo contorno no la modifican. Para construir la superficie a partir de los puntos del archivo, haga clic en {{ui:Reconstruir la superficie a partir de los puntos}}. {{key:Mod+Z}} restaura la superficie de LandXML.

## Relacionado

- [Lea curvas de nivel, elevaciones y pendientes](topic:contours).
- [Importe puntos de levantamiento](topic:import-points).
