---
title: Abrir un DWG o DXF como geometría lineal
summary: Abra la geometría lineal de un dibujo en el plano, capa por capa, use sus curvas de nivel, polilíneas 3D y contornos cerrados para la superficie, y convierta sus bloques de puntos en puntos topográficos.
keywords: verificación topográfica, cotas de texto, dwg, dxf, cad, dibujo, geometría lineal, curvas de nivel, líneas de ruptura, límite, polilínea, polilínea 3D, capas, mapa base, topo, dibujo topográfico, bloques, referencias a bloque, puntos topográficos desde bloques, atributos, bloques de punto, punto de inserción
from: da0f4c58
---

Un levantamiento topográfico suele llegar como dibujo: curvas de nivel como polilíneas a su elevación, líneas de ruptura como polilíneas 3D, y el contorno del sitio como polilínea cerrada. CivilCraft abre el **espacio modelo** del dibujo como capas en el plano, y puede convertir esas líneas directamente en la superficie.

## Abra el dibujo

1. Haga clic en {{ui:Geometría lineal}} en el grupo **Superficie** (o en {{ui:Abrir}}, o suelte el archivo en el plano) y elija un archivo `.dwg` o `.dxf`. El dibujo se lee en esta computadora; no se sube nada. Se leen DWG de 2000 a 2018 y DXF en ASCII.
2. El cuadro **Geometría lineal** enumera las capas del dibujo que tienen líneas, figuras cerradas o puntos, y si tienen **elevaciones**. Las capas apagadas en el dibujo empiezan sin marcar. El texto, los sombreados, las cotas y otros objetos que no son geometría lineal se cuentan y se omiten (el cuadro indica cuáles).
3. Revise **Unidades del dibujo**. Cuando el dibujo indica sus unidades, CivilCraft las convierte a las del proyecto (milímetros a metros, metros a pies, pulgadas a pies). Un dibujo en pies se lee como pies de topografía de EE. UU., sin escalar: las dos unidades difieren en 2 partes por millón, y escalar coordenadas de plano estatal por esa diferencia las movería varios pies. Cuando el dibujo no indica sus unidades, sus números se leen en las unidades del proyecto; elija las unidades correctas en la lista si no lo son.
4. En **Usar para la superficie**, elija lo que da cada capa a la superficie (o deje **Solo mostrar**). Las capas con nombres de curvas de nivel (TOPO, CONT, CNTR) que tienen elevaciones empiezan como líneas de ruptura.
5. Haga clic en {{ui:Agregar}}. Las capas aparecen bajo **Capas GIS** en el panel izquierdo; cada uso se incorpora a la superficie. Cada parte es un paso propio: {{key:Mod+Z}} las retira una a una.

## Qué puede dar cada tipo de capa

| La capa contiene | Usar para la superficie |
|---|---|
| Curvas de nivel (polilíneas a una elevación) | Líneas de ruptura a la elevación propia de las líneas, o al campo ELEV |
| Polilíneas 3D | Líneas de ruptura a sus propias elevaciones |
| Un contorno cerrado | El límite de la superficie (la figura cerrada más grande, o la que seleccionó) |
| Puntos con elevación | Puntos topográficos, descritos con el nombre de la capa |
| Líneas a elevación 0 (geometría lineal en planta) | Nada: se queda en el plano como dibujo base |

Un dibujo que CivilCraft escribió contiene sus líneas de elemento como polilíneas 3D que recuerdan sus arcos. El cuadro entonces muestra **Líneas de elemento**: déjelo marcado para devolverlas como líneas de elemento con sus arcos y usos (un paso de deshacer), o desmárquelo para leerlas como geometría lineal como cualquier otra capa.

Más adelante, use {{ui:Usar para la superficie}} en el menú de la capa, bajo **Capas GIS**, para hacer lo mismo con una capa que solo mostró.

## Puntos topográficos desde bloques

Los dibujos topográficos suelen traer sus puntos como bloques: un pequeño símbolo en cada toma, con atributos para el número de punto, la descripción y la elevación. Cuando el dibujo tiene referencias a bloques, el cuadro tiene una sección **Puntos topográficos desde bloques**:

1. Marque los bloques a tomar (la tabla indica cuántas referencias tiene cada uno, en qué capas y con qué atributos), o marque capas para tomar todas las referencias a bloque en ellas.
2. Elija de dónde vienen el **número**, la **descripción** y la **elevación** de cada punto: un atributo, el nombre del bloque o de la capa, los siguientes números libres, o la Z del punto de inserción. CivilCraft empieza con los atributos probables (PT, DESC, ELEV y similares), y toma la elevación de un atributo solo cuando los bloques están en cero.
3. Desmarque las capas de geometría lineal si solo quiere los puntos, y luego haga clic en {{ui:Agregar}}.

Cada referencia se convierte en un punto topográfico en su punto de inserción. Solo cuentan las referencias colocadas en el espacio modelo; los bloques anidados dentro de otros bloques no. Los números que ya existen en el proyecto, o que se usan dos veces en el dibujo, reciben números nuevos después del más alto, y un atributo de elevación que no sea un número deja ese punto sin elevación; la barra de estado cuenta ambos casos. El dibujo nunca se modifica, y cada punto recuerda su bloque: sus Propiedades muestran **Desde bloque** con el bloque, la capa y el identificador (handle). Agregar los puntos es un solo paso, así que {{key:Mod+Z}} los quita todos.

## Niveles escritos como texto, y la verificación

Los niveles de punto escritos como texto (o en un atributo de bloque que no es un bloque de punto topográfico) no son geometría lineal. La sección **Niveles topográficos y verificación** puede tomarlos como puntos topográficos, y enumera lo que parece mal en el dibujo: unidades, sistema de coordenadas, distancia desde el origen, curvas planas, niveles extraños, puntos duplicados. Vea [Verificar un dibujo topográfico al importar](topic:survey-check).

## Cómo se lee el dibujo

- Arcos, círculos, elipses, segmentos de polilínea con abultamiento y splines se convierten en piezas rectas cortas (cada 5° como máximo).
- Las referencias a bloque se dibujan donde están colocadas, también los bloques anidados; lo que un bloque contiene en la capa 0 toma la capa de la referencia.
- Los objetos dibujados en otro plano (con una dirección de extrusión distinta) se colocan en coordenadas universales.
- Cada objeto recibe tres campos: LAYER, TYPE (el tipo de objeto) y ELEV (su elevación, cuando todos sus puntos tienen la misma).
- Las coordenadas se toman tal cual: el dibujo debe usar las mismas coordenadas que el proyecto (por ejemplo, la misma zona de plano estatal). Los dibujos vinculados (xref) no se abren: ábralos por separado.

:::tip
Un dibujo de curvas de nivel da la mejor superficie con algunas elevaciones puntuales en cimas y depresiones, donde las curvas por sí solas dejan triángulos planos. Agréguelas como puntos topográficos, o desde una capa de puntos del dibujo.
:::
