---
title: Claves de descripción y códigos de línea
summary: Convertí códigos de campo en grupos de puntos con descripciones, y uní puntos codificados en líneas (inicio, fin, cierre) que pasan a ser líneas de quiebre.
keywords: claves de descripción, códigos de campo, códigos de línea, figuras, trazos, inicio, fin, cierre, grupos de puntos, códigos, códigos de relevamiento, colector de datos, líneas de quiebre, cordón, borde de calzada
from: b3d1af8d
---

Los equipos de relevamiento codifican cada toma en campo: `EP` para borde de calzada, `TC` para tope de cordón, `BLDG` para esquina de edificio. El código es la primera palabra de la descripción del punto. CivilCraft agrupa los puntos por él, y convierte en líneas los códigos de línea que van después.

## Códigos de línea

Un código de línea es la palabra justo después del código de campo:

| Descripción | Significado |
|---|---|
| `EP B` | Comenzar una nueva línea de borde de calzada en este punto |
| `EP` | Continuar la línea EP actual |
| `EP E` | Terminar la línea EP actual en este punto |
| `BLDG C` | Cerrar el edificio: unir este punto de vuelta al primer punto de la línea |

Los puntos con el mismo código se unen en orden de número de punto. Códigos distintos son líneas distintas aunque compartan grupo, así que `EP1` y `EP2` dan dos bordes a la vez. Un código que nunca usa código de línea se une por todos sus puntos, como en versiones anteriores.

Las líneas de un grupo usado como **Línea de quiebre** pasan a ser líneas de quiebre, una por línea, así un cordón con un hueco no se estira a través del hueco. Las líneas de otros grupos se dibujan en el plano (capa V-NODE-LINE) y salen en DXF, DWG y PDF.

Las palabras para inicio, fin y cierre son `B`, `BEG`, `START`; `E`, `END`; y `C`, `CLO`, `CLOSE`. Cambialas, o apagá los códigos de línea, en el diálogo de abajo.

## Claves de descripción

Una clave de descripción convierte un código en un grupo de puntos, un uso y una descripción larga.

1. Bajo **Puntos**, hacé clic en {{ui:Claves de descripción ha códigos de línea}}.
2. Hacé clic en {{ui:Emoĩ clave}} y completá la fila:
   - **Código**: el código de campo a coincidir. `*` representa cualquier cantidad de caracteres y `?` uno, así `EP*` captura EP, EP1 y EP12.
   - **Grupo**: el grupo de puntos al que se unen estos puntos (vacío = el propio código). `EP*` con grupo `EP` pone EP1 y EP2 en un mismo grupo mientras siguen siendo líneas separadas.
   - **Uso**: Puntos, Línea de quiebre o Excluir, para cuando el grupo aparece por primera vez (o dejalo a la tabla de **Puntos**).
   - **Descripción**: el nombre largo, que se muestra en las **Propiedades** de un punto.
3. La columna **Puntos** cuenta los puntos que captura cada clave mientras escribís. Gana la primera clave que coincide con un código.
4. Hacé clic en {{ui:Aplicar}}. Los grupos, la superficie y el plano se actualizan en un solo paso: {{key:Mod+Z}} lo deshace.

Un grupo conserva el uso que le diste en la tabla de **Puntos**; el uso de una clave solo lo fija para un grupo nuevo. Las claves y códigos de línea se guardan en el archivo del proyecto.
