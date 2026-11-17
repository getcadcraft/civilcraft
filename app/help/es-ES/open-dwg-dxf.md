---
title: Abrir un DWG o DXF como geometría lineal
summary: Abra la geometría lineal de un dibujo en el plano, capa por capa; use sus curvas de nivel, polilíneas 3D y contornos cerrados para la superficie, y convierta sus bloques de punto en puntos topográficos.
keywords: comprobación topográfica, cotas de texto, dwg, dxf, cad, dibujo, geometría lineal, curvas de nivel, líneas de ruptura, límite, polilínea, polilínea 3D, capas, mapa base, topo, dibujo topográfico, bloques, referencias de bloque, puntos topográficos desde bloques, atributos, bloques de punto, punto de inserción
from: da0f4c58
---

Un levantamiento topográfico suele llegar como dibujo: curvas de nivel como polilíneas a su cota, líneas de ruptura como polilíneas 3D, el perímetro del emplazamiento como polilínea cerrada. CivilCraft abre el **espacio modelo** del dibujo como capas en el plano, y puede convertir esas líneas directamente en la superficie.

## Abrir el dibujo

1. Haga clic en {{ui:Linework}} en el grupo **Superficie** (o en {{ui:Open}}, o suelte el archivo en el plano) y elija un archivo `.dwg` o `.dxf`. El dibujo se lee en este equipo; no se sube nada. Se leen los DWG de 2000 a 2018 y los DXF ASCII.
2. El cuadro **Geometría lineal** enumera las capas del dibujo que contienen líneas, formas cerradas o puntos, y si tienen **cotas**. Las capas desactivadas en el dibujo empiezan sin marcar. El texto, las tramas, las cotas y otros objetos que no son geometría lineal se cuentan y se omiten (el cuadro indica cuáles).
3. Compruebe **Unidades del dibujo**. Cuando el dibujo indica sus unidades, CivilCraft las convierte a las del proyecto (milímetros a metros, metros a pies, pulgadas a pies). Un dibujo en pies se lee como pies US de topografía, sin escalar: los dos difieren en 2 partes por millón, y escalar las coordenadas de plano estatal en esa proporción las desplazaría varios pies. Cuando el dibujo no indica sus unidades, sus números se leen en las unidades del proyecto; elija las unidades correctas en la lista si no lo son.
4. En **Usar para la superficie**, elija lo que aporta cada capa a la superficie (o deje **Solo mostrar**). Las capas con nombre de curvas de nivel (TOPO, CONT, CNTR) que tienen cotas empiezan como líneas de ruptura.
5. Haga clic en {{ui:Add}}. Las capas aparecen bajo **Capas SIG** en el panel izquierdo; cada uso se incorpora a la superficie. Cada parte es un paso propio: {{key:Mod+Z}} las deshace una a una.

## Qué puede aportar cada tipo de capa

| La capa contiene | Uso para la superficie |
|---|---|
| Curvas de nivel (polilíneas a una cota) | Líneas de ruptura a la cota propia de las líneas, o a la del campo ELEV |
| Polilíneas 3D | Líneas de ruptura a sus propias cotas |
| Un contorno cerrado | El límite de la superficie (la forma cerrada más grande, o la que haya seleccionado) |
| Puntos con cota | Puntos topográficos, descritos con el nombre de la capa |
| Líneas a cota 0 (geometría lineal de plano) | Nada: se queda en el plano como dibujo base |

Un dibujo escrito por CivilCraft contiene sus líneas de elementos como polilíneas 3D que recuerdan sus arcos. El cuadro muestra entonces **Líneas de elementos**: déjela marcada para recuperarlas como líneas de elementos con sus arcos y usos (un paso de deshacer), o desmárquela para leerlas como geometría lineal, como cualquier otra capa.

Más adelante, use {{ui:Use for the surface}} en el menú de la capa, bajo **Capas SIG**, para hacer lo mismo con una capa que solo mostró.

## Puntos topográficos desde bloques

Los dibujos topográficos suelen llevar sus puntos como bloques: un pequeño símbolo en cada punto medido, con atributos para el número de punto, la descripción y la cota. Cuando el dibujo tiene referencias de bloque, el cuadro tiene una sección **Puntos topográficos desde bloques**:

1. Marque los bloques que quiere tomar (la tabla indica cuántas referencias tiene cada uno, en qué capas y qué atributos), o marque capas para tomar cada referencia de bloque que contengan.
2. Elija de dónde vienen el **número**, la **descripción** y la **cota** de cada punto: un atributo, el nombre del bloque o de la capa, los siguientes números libres, o la Z del punto de inserción. CivilCraft empieza con los atributos probables (PT, DESC, ELEV y similares), y toma la cota de un atributo solo cuando los bloques están en cero.
3. Desmarque las capas de geometría lineal si solo quiere los puntos, y haga clic en {{ui:Add}}.

Cada referencia se convierte en un punto topográfico en su punto de inserción. Solo cuentan las referencias colocadas en el espacio modelo; los bloques anidados dentro de otros bloques no. Los números que ya existen en el proyecto, o que se usan dos veces en el dibujo, reciben números nuevos después del más alto, y un atributo de cota que no es un número deja ese punto sin cota; la línea de estado cuenta ambos casos. El dibujo nunca se modifica, y cada punto recuerda su bloque: sus Propiedades muestran **Desde bloque** con el bloque, la capa y el identificador (handle). Añadir los puntos es un solo paso, así que {{key:Mod+Z}} los quita todos.

## Cotas escritas como texto, y la comprobación

Las cotas puntuales escritas como texto (o en un atributo de bloque que no es un bloque de punto topográfico) no son geometría lineal. La sección **Cotas topográficas y comprobación** puede tomarlas como puntos topográficos, y enumera lo que parece incorrecto en el dibujo: unidades, sistema de coordenadas, distancia respecto al origen, curvas de nivel planas, cotas anómalas, puntos duplicados. Vea [Comprobar un dibujo topográfico al importar](topic:survey-check).

## Cómo se lee el dibujo

- Arcos, círculos, elipses, segmentos de polilínea con abultamiento y splines se convierten en tramos rectos cortos (cada 5° como máximo).
- Las referencias de bloque se dibujan donde se colocan, también los bloques anidados; lo que un bloque tiene en la capa 0 toma la capa de la referencia.
- Los objetos dibujados en otro plano (otra dirección de extrusión) se colocan en coordenadas universales.
- Cada objeto recibe tres campos: LAYER, TYPE (el tipo de objeto) y ELEV (su cota, cuando todos sus puntos comparten una).
- Las coordenadas se toman tal cual: el dibujo debe usar las mismas coordenadas que el proyecto (por ejemplo, la misma zona de plano estatal). Los dibujos vinculados (xrefs) no se abren: ábralos por separado.

:::tip
Un dibujo de curvas de nivel da la mejor superficie con algunas cotas puntuales en cimas y depresiones, donde las curvas por sí solas dejan triángulos planos. Añádalas como puntos topográficos, o desde una capa de puntos del dibujo.
:::
