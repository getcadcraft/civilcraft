---
title: Abrir un DWG o DXF como líneas
summary: Abra las líneas de un dibujo en el plano, capa por capa, use sus curvas de nivel, polilíneas 3D y contornos cerrados para la superficie, y convierta sus bloques de puntos en puntos de relevamiento.
keywords: control de relevamiento, cotas de texto, dwg, dxf, cad, dibujo, líneas, curvas de nivel, líneas de quiebre, límite, polilínea, polilínea 3D, capas, mapa base, topo, dibujo de relevamiento, bloques, referencias de bloque, puntos desde bloques, atributos, bloques de puntos, punto de inserción
from: da0f4c58
---

Un relevamiento topográfico suele llegar como un dibujo: curvas de nivel como polilíneas a su cota, líneas de quiebre como polilíneas 3D, y el contorno del sitio como polilínea cerrada. CivilCraft abre el **espacio modelo** del dibujo como capas en el plano, y puede convertir esas líneas directamente en la superficie.

## Abra el dibujo

1. Haga clic en {{ui:Líneas}} en el grupo **Superficie** (o en {{ui:Abrir}}, o suelte el archivo en el plano) y elija un archivo `.dwg` o `.dxf`. El dibujo se lee en esta computadora; nada se sube. Se leen los DWG de 2000 a 2018 y los DXF en ASCII.
2. El cuadro **Líneas** enumera las capas del dibujo que tienen líneas, figuras cerradas o puntos, y si tienen **cotas**. Las capas que están apagadas en el dibujo empiezan sin marcar. El texto, los sombreados, las cotas y otros objetos que no son líneas se cuentan y se omiten (el cuadro indica cuáles).
3. Revise **Unidades del dibujo**. Cuando el dibujo indica sus unidades, CivilCraft las convierte a las del proyecto (milímetros a metros, metros a pies, pulgadas a pies). Un dibujo en pies se lee como pies de EE. UU. de relevamiento, sin escalar: las dos difieren en 2 partes por millón, y escalar las coordenadas de plano estatal por esa diferencia las movería pies. Cuando el dibujo no indica sus unidades, sus números se leen en las unidades del proyecto; elija las unidades correctas en la lista si no lo son.
4. En **Usar para la superficie**, elija qué da cada capa a la superficie (o deje **Solo mostrarla**). Las capas con nombres de curvas de nivel (TOPO, CONT, CNTR) que tienen cotas empiezan como líneas de quiebre.
5. Haga clic en {{ui:Agregar}}. Las capas aparecen bajo **Capas GIS** en el panel izquierdo; cada uso se incorpora a la superficie. Cada parte es un paso propio: {{key:Mod+Z}} las quita de a una.

## Lo que puede dar cada tipo de capa

| La capa contiene | Usar para la superficie |
|---|---|
| Curvas de nivel (polilíneas a una cota) | Líneas de quiebre a la cota propia de las líneas, o al campo ELEV |
| Polilíneas 3D | Líneas de quiebre a sus propias cotas |
| Un contorno cerrado | El límite de la superficie (la figura cerrada más grande, o la que usted eligió) |
| Puntos con cota | Puntos de relevamiento, descritos con el nombre de la capa |
| Líneas a cota 0 (líneas de planta) | Nada: quedan en el plano como dibujo base |

Un dibujo que CivilCraft escribió contiene sus líneas características como polilíneas 3D que recuerdan sus arcos. El cuadro entonces muestra **Líneas características**: déjelo marcado para traerlas de vuelta como líneas características con sus arcos y usos (un paso de deshacer), o desmárquelo para leerlas como líneas de dibujo, como cualquier otra capa.

Más tarde, use {{ui:Usar para la superficie}} en el menú de la capa, bajo **Capas GIS**, para hacer lo mismo con una capa que solo mostró.

## Puntos de relevamiento desde bloques

Los dibujos de relevamiento suelen traer sus puntos como bloques: un pequeño símbolo en cada toma, con atributos para el número de punto, la descripción y la cota. Cuando el dibujo tiene referencias de bloque, el cuadro tiene una sección **Puntos de relevamiento desde bloques**:

1. Marque los bloques a tomar (la tabla indica cuántas referencias tiene cada uno, en qué capas y qué atributos), o marque capas para tomar todas las referencias de bloque que contengan.
2. Elija de dónde vienen el **número**, la **descripción** y la **cota** de cada punto: un atributo, el nombre del bloque o de la capa, los próximos números libres, o la Z del punto de inserción. CivilCraft empieza con los atributos probables (PT, DESC, ELEV y similares), y toma la cota de un atributo solo cuando los bloques están en cero.
3. Desmarque las capas de líneas si solo quiere los puntos, y luego haga clic en {{ui:Agregar}}.

Cada referencia se convierte en un punto de relevamiento en su punto de inserción. Solo cuentan las referencias colocadas en el espacio modelo; no cuentan los bloques anidados dentro de otros bloques. Los números que ya existen en el proyecto, o que aparecen dos veces en el dibujo, reciben números nuevos a continuación del mayor; y un atributo de cota que no es un número deja ese punto sin cota. La línea de estado cuenta ambos casos. El dibujo nunca se cambia, y cada punto recuerda su bloque: sus Propiedades muestran **Desde bloque** con el bloque, la capa y el identificador. Agregar los puntos es un solo paso, así que {{key:Mod+Z}} los quita todos.

## Cotas escritas como texto, y el control

Las cotas puntuales escritas como texto (o en un atributo de bloque que no es un bloque de punto de relevamiento) no son líneas de dibujo. La sección **Cotas de relevamiento y control** puede tomarlas como puntos de relevamiento, y lista lo que parece mal en el dibujo: unidades, sistema de coordenadas, distancia al origen, curvas de nivel planas, cotas raras y puntos duplicados. Vea [Controlar un dibujo de relevamiento al importar](topic:survey-check).

## Cómo se lee el dibujo

- Arcos, círculos, elipses, segmentos abultados de polilínea y splines se convierten en tramos rectos cortos (cada 5° como máximo).
- Las referencias de bloque se dibujan donde están colocadas, y también los bloques anidados; lo que un bloque tiene en la capa 0 toma la capa de la referencia.
- Los objetos dibujados en otro plano (otra dirección de extrusión) se ubican en coordenadas mundiales.
- Cada objeto recibe tres campos: LAYER, TYPE (el tipo de objeto) y ELEV (su cota cuando todos sus puntos comparten una).
- Las coordenadas se toman tal como son: el dibujo debe usar las mismas coordenadas que el proyecto (por ejemplo, la misma zona de plano estatal). Los dibujos vinculados (xref) no se abren: ábralos por separado.

:::tip
Un dibujo de curvas de nivel da la mejor superficie con algunas cotas puntuales en cimas y hondonadas, donde las curvas solas dejan triángulos planos. Agréguelas como puntos de relevamiento, o desde una capa de puntos del dibujo.
:::
