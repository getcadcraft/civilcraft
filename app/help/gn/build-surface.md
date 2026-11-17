---
title: Construir y refinar la superficie
summary: Cómo CivilCraft triangula el terreno existente, y cómo darle forma con grupos de líneas de quiebre, líneas de quiebre dibujadas, un límite exterior y el borde exterior más largo.
keywords: tin, superficie, triangulación, línea de quiebre, límite, terreno existente, eg, crear superficie, delaunay, triángulos, borde máximo, límite exterior
from: b9eea3f3
---

CivilCraft tiene una superficie de terreno existente por proyecto. Es una TIN (red irregular triangulada) construida con tus puntos, y se reconstruye sola cada vez que cambia una entrada. No hay comando de "reconstruir" ni superficie desactualizada.

## Qué entra en la superficie

- Cada punto con elevación en un grupo puesto en {{ui:Puntos}}.
- Cada grupo puesto en {{ui:Línea de quiebre}}, unido en orden de número de punto.
- Cada línea de quiebre que dibujes con la herramienta {{ui:Línea de quiebre}}.
- El límite exterior, si dibujás uno.
- La configuración **Borde exterior más largo**.

Los triángulos nunca cruzan una línea de quiebre: la superficie se obliga a seguirla, y después se hace lo más pareja posible alrededor (Delaunay en todo lo demás).

## Convertir líneas codificadas en líneas de quiebre

1. En el panel izquierdo, bajo **Puntos**, buscá el grupo (por ejemplo FL).
2. Poné su opción **Superficie** en {{ui:Línea de quiebre}}.
   La superficie se reconstruye, la línea se dibuja en naranja (con {{ui:Líneas de quiebre}} activado bajo **Pantalla**), y **Líneas de quiebre** en los datos de la superficie sube en uno.
3. Revisá la línea en el plano. Tiene que ir de punto a punto en el orden en que se relevó la línea. Si zigzaguea, el grupo tiene más de una línea, o los puntos no están numerados en orden: volvé el grupo a {{ui:Puntos}} y dibujá las líneas a mano (próxima sección).

## Dibujar una línea de quiebre por puntos

1. Apretá {{key:B}}, o hacé clic en {{ui:Línea de quiebre}} del grupo **Superficie**.
   La ayuda dice "Línea de quiebre: hacé clic en los puntos de relevamiento en orden (toma sus elevaciones). Enter termina."
2. Mové el puntero cerca de un punto. Un pequeño cuadrado naranja marca el punto que va a tomar.
3. Hacé clic en los puntos de la línea, uno tras otro. Cada clic nombra el punto y su elevación en la barra de estado.
4. Apretá {{key:Enter}} para terminar.
   La barra de estado dice "Línea de quiebre 1 agregada; la superficie se reconstruyó."

Los clics tienen que caer sobre un punto de relevamiento que tenga elevación; un clic en otro lugar se rechaza con "Hacé clic en un punto de relevamiento con elevación: una línea de quiebre toma las elevaciones de los puntos." {{key:Backspace}} quita el último punto; {{key:Esc}} cancela la línea entera.

:::warning
Terminá con {{key:Enter}}. El doble clic también termina, pero en esta versión quita el punto sobre el que hiciste doble clic. Hacé clic una vez en el último punto y después apretá {{key:Enter}}.
:::

Para quitar todas las líneas de quiebre dibujadas de una vez, hacé clic en {{ui:Eliminar líneas de quiebre dibujadas}} en la sección **Superficie**. Para quitar solo la última, usá {{key:Mod+Z}}. Las líneas de quiebre dibujadas todavía no se pueden seleccionar ni editar una por una.

## Dibujar el límite exterior

Un límite recorta la superficie al área en la que confiás, por ejemplo los límites del relevamiento, para que desaparezcan los triángulos largos que cruzan esquinas sin relevar.

1. Apretá {{key:O}}, o hacé clic en {{ui:Límite}}.
2. Hacé clic en las esquinas en orden alrededor del área. Una línea de trazos muestra la forma.
3. Apretá {{key:Enter}}.
   La barra de estado dice "Límite fijado; los triángulos fuera de él desaparecieron." **Límite** en los datos de la superficie dice "Sí" y la cantidad de esquinas.

Cosas para saber:

- Hay un solo límite. Dibujar otro reemplaza al anterior. {{ui:Eliminar el límite}} lo quita.
- Solo puede quitar: un límite que pasa más allá de los puntos se recorta hasta su contorno, con la nota "El límite pasa más allá de los puntos; se recortó hasta su contorno."
- Sus esquinas toman sus elevaciones de la superficie, así que el borde sigue el terreno exactamente.
- Los límites interiores de ocultar todavía no están disponibles.

## Recortar triángulos exteriores largos

Sin límite, la superficie llena todo el contorno de los puntos, incluidos los triángulos largos y finos que cruzan bordes cóncavos.

1. En **Superficie**, escribí una longitud en **Borde exterior más largo** y apretá {{key:Enter}}. Empezá con unas dos o tres veces tu separación típica entre tomas.
2. Se quitan los triángulos exteriores cuyo borde externo sea más largo que eso, avanzando hacia adentro hasta que cada borde exterior sea lo bastante corto. Un borde que es línea de quiebre nunca se quita.
3. Escribí 0 para volver a conservar todos los triángulos.

## Leer el informe de la superficie

Bajo los datos de la superficie, un cuadro enumera lo que hizo el constructor. Con una barra ocre a la izquierda es información; con una barra roja tiene un error y no hay superficie.

| Mensaje | Significado |
|---|---|
| "3 puntos estaban en el mismo lugar que otro y se unieron a él." | Puntos más cercanos que 0.0001 en el plano se volvieron un solo vértice (se conserva el primero). |
| "2 lugares tienen dos elevaciones distintas …" | Puntos uno encima del otro, o líneas de quiebre que se cruzan, no coinciden en altura. Gana la elevación de la línea de quiebre, después la primera. |
| "1 tramo de línea de quiebre no pudo forzarse dentro de la superficie." | Un tramo de línea de quiebre muy corto o casi superpuesto no encajó; revisá ese lugar. |
| "Una superficie necesita al menos tres puntos con elevación." | Muy pocos puntos: revisá el orden de columnas y los grupos. |
| "Los puntos están todos sobre una sola línea: no hay triángulos." | Los puntos no tienen ancho, por ejemplo una sola línea de poligonal. |
| "El límite no se superpone con los puntos." | El límite está en otro lugar, a menudo por una mezcla de unidades o de coordenadas. |
| "No quedan triángulos dentro del límite." | El límite es demasiado chico o está mal ubicado. |

## Una superficie leída desde LandXML

Cuando abrís LandXML, su primera superficie TIN se usa tal cual: el encabezado **Superficie** dice "Superficie (desde LandXML)" y **Borde exterior más largo** queda en gris. Mientras esa superficie está en uso, los grupos de líneas de quiebre, las líneas dibujadas y un nuevo límite no la cambian. Para construir la superficie a partir de los puntos del archivo, hacé clic en {{ui:Reconstruir la superficie a partir de los puntos}}. {{key:Mod+Z}} devuelve la superficie de LandXML.

## Relacionado

- [Leer curvas de nivel, elevaciones y pendientes](topic:contours).
- [Importar puntos de relevamiento](topic:import-points).
