---
title: Claves de descripción y códigos de línea
summary: Convierta códigos de campo en grupos de puntos con descripciones, y una los puntos codificados en líneas (inicio, fin, cierre) que se convierten en líneas de ruptura.
keywords: claves de descripción, códigos de campo, códigos de línea, figuras, trazado lineal, inicio, fin, cierre, grupos de puntos, códigos, códigos topográficos, colector de datos, líneas de ruptura, bordillo, borde de calzada
from: b3d1af8d
---

Los equipos de campo codifican cada disparo en el terreno: `EP` para borde de calzada, `TC` para coronación de bordillo, `BLDG` para una esquina de edificio. El código es la primera palabra de la descripción del punto. CivilCraft agrupa los puntos por él, y convierte en líneas los códigos de línea que van después.

## Códigos de línea

Un código de línea es la palabra que va justo después del código de campo:

| Descripción | Significado |
|---|---|
| `EP B` | Empieza una nueva línea de borde de calzada en este punto |
| `EP` | Continúa la línea EP actual |
| `EP E` | Termina la línea EP actual en este punto |
| `BLDG C` | Cierra el edificio: une este punto con el primer punto de la línea |

Los puntos con el mismo código se unen en orden de número de punto. Códigos distintos son líneas distintas aunque compartan grupo, así que `EP1` y `EP2` dan dos bordes a la vez. Un código que nunca usa código de línea se une a través de todos sus puntos, como en versiones anteriores.

Las líneas de un grupo usado como **Línea de ruptura** se convierten en líneas de ruptura, una por línea, de modo que un bordillo con un hueco no se estira a través del hueco. Las líneas de otros grupos se dibujan en el plano (capa V-NODE-LINE) y salen en DXF, DWG y PDF.

Las palabras para inicio, fin y cierre son `B`, `BEG`, `START`; `E`, `END`; y `C`, `CLO`, `CLOSE`. Cámbielas, o desactive los códigos de línea, en el cuadro de diálogo de abajo.

## Claves de descripción

Una clave de descripción convierte un código en un grupo de puntos, un uso y una descripción larga.

1. En **Puntos**, pulse {{ui:Claves de descripción y códigos de línea}}.
2. Pulse {{ui:Añadir una clave}} y rellene la fila:
   - **Código**: el código de campo que debe coincidir. `*` representa cualquier conjunto de caracteres y `?` uno solo, así que `EP*` capta EP, EP1 y EP12.
   - **Grupo**: el grupo de puntos al que se unen estos puntos (vacío = el propio código). `EP*` con grupo `EP` pone EP1 y EP2 en un mismo grupo, mientras siguen siendo líneas separadas.
   - **Uso**: Puntos, Línea de ruptura o Excluir, para cuando aparece el grupo por primera vez (o déjelo a la tabla de **Puntos**).
   - **Descripción**: el nombre largo, que se muestra en las **Propiedades** de un punto.
3. La columna **Puntos** cuenta los puntos que capta cada clave a medida que escribe. Gana la primera clave que coincide con un código.
4. Pulse {{ui:Aplicar}}. Los grupos, la superficie y el plano se actualizan en un solo paso: {{key:Mod+Z}} lo deshace.

Un grupo conserva el uso que le dio en la tabla **Puntos**; el uso de una clave solo lo fija para un grupo nuevo. Las claves y los códigos de línea se guardan en el archivo del proyecto.
