---
title: Plantillas de obra lineal y plantillas de terreno
summary: Cree plantillas pequeñas y reutilizables (guarnición y arroyo, banqueta, muro, cuneta), construya una obra lineal con ellas por estación, con izquierda y derecha separadas, divida una alineación en varias obras lineales, y extienda capas de materiales sobre un terreno.
keywords: plantilla, plantillas, biblioteca de plantillas, creación de plantillas, sección tipo, conjunto, subconjunto, componentes, códigos de punto, condición final, empate, cuneta, muro de contención, guarnición, arroyo, banqueta, regiones, rango de estaciones, varias obras lineales, obras lineales múltiples, izquierda y derecha, plantilla de terreno, capa vegetal, pavimento, base, extender, materiales, cantidades
from: ce70e58b
---

Una **plantilla** es una pequeña sección transversal que dibuja una vez y reutiliza: puntos con desfases, pendientes y códigos de punto, y componentes con materiales. Una obra lineal se puede construir con plantillas por estación, con cada lado con sus propias plantillas de pavimento y su propia condición final, y las mismas plantillas se pueden extender sobre un terreno.

:::warning
Las plantillas de ejemplo son marcadores de posición para empezar. Sus números no se toman de ninguna norma ni de ninguna dependencia. Un ingeniero debe verificar cada plantilla y cada valor que le dé antes de usarlos en un diseño.
:::

## Abra las plantillas

Abra {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de obra lineal…}} (o escriba {{cmd:TEMPLATES}}). La ventana tiene tres listas:

- **En este proyecto**: las plantillas que usan las obras lineales y las plantillas de terreno de este proyecto. Se guardan en el archivo del proyecto.
- **Mi biblioteca**: plantillas guardadas en este navegador y ofrecidas en todos los proyectos. Use {{ui:Guardar en Mi biblioteca}} en una plantilla del proyecto para conservarla.
- **Ejemplos**: dos carriles con capas, guarnición y arroyo, banqueta, empate, cuneta, muro de contención, capa vegetal bajo el terreno, y pavimento sobre el terreno. Cada uno está marcado "Para revisión por un ingeniero".

{{ui:Usar en este proyecto}} copia una plantilla de la biblioteca o de los ejemplos al proyecto. {{ui:Exportar las plantillas de este proyecto}} las guarda como un archivo `.cctemplates.json`, y {{ui:Importar un archivo}} lee uno en el proyecto y en Mi biblioteca. Use el archivo para compartir plantillas o llevarlas a otra computadora.

## Haga una plantilla

{{ui:Nueva plantilla}} (o {{ui:Edición}} en una plantilla del proyecto) abre el editor de plantillas. Dibuje el lado derecho, hacia afuera desde el punto 0,0 de la plantilla; el lado izquierdo usa la misma plantilla hacia afuera, a la izquierda.

1. Dele un nombre y un tipo: **Pavimento** (la siguiente plantilla se une en su extremo), **Condición final** (toca el terreno) o **Plantilla de terreno**.
2. Agregue **valores**: números con nombre, como un ancho `w` o una pendiente `s`. Un cuadro numérico en cualquier parte de la plantilla acepta un número o el nombre de un valor; `-t` es el valor `t` con signo negativo. Una obra lineal puede dar a cada uso de la plantilla sus propios valores, así que una plantilla de guarnición sirve para cada altura de guarnición.
3. Agregue **puntos** en orden. Cada uno se coloca desde un punto anterior (o desde el punto 0,0) según su restricción:

| Restricción | Coloca el punto |
|---|---|
| Desfase con pendiente | Un desfase hacia afuera y una pendiente (elevación por distancia; −0.02 baja 2 %) |
| Desfase y elevación | Un desfase y una elevación |
| Recto arriba o abajo | Solo una elevación |
| Pendiente lateral hasta el terreno | Hacia afuera desde su punto hasta el terreno, con la relación de corte donde el terreno está arriba y la relación de terraplén donde está abajo |
| Hasta el terreno | Un desfase, y luego recto arriba o abajo hasta el terreno |
| Muro de contención | Un muro del espesor que dé: en corte, su parte superior toca el terreno en la cara del camino; en terraplén, el camino pasa sobre él y su cara exterior baja hasta el terreno |

   Marque **Superior** en los puntos por los que pasa la superficie terminada. El último punto superior es donde empieza la siguiente plantilla de ese lado. Un **Objetivo** permite que una obra lineal mueva el punto: su desfase o su elevación viene de una línea.
4. Agregue **componentes**: formas cerradas mediante códigos de punto (`0` es el punto 0,0), cada una con un nombre, un material y un tipo. Sus áreas dan los volúmenes.

El dibujo sigue cada cambio a escala real, y la lista debajo indica qué está mal (un punto que toca el terreno antes del final, un valor que la plantilla no tiene, un componente sin área). {{ui:Agregar a este proyecto}} o {{ui:Guardar}} la conserva, como un solo paso de deshacer.

## Construya una obra lineal con plantillas

Seleccione una alineación con una obra lineal y, en sus Propiedades, active {{ui:Construir con plantillas por estación}}. La obra lineal empieza con los ejemplos de dos carriles y empate en ambos lados.

- **Regiones.** Cada región empieza en una estación y llega hasta la de la siguiente región. {{ui:Agregar una región}} agrega una; cambie su estación inicial en su cuadro.
- **Izquierda y derecha separadas.** Cada lado de cada región tiene su propia lista de **Pavimento**, desde el eje hacia afuera, y su propia **Condición final**: empate, una cuneta, un muro, o cualquier plantilla que toque el terreno. Sin condición final, el lado hace empate en los taludes de corte y terraplén de la obra lineal. {{ui:Copiar de izquierda a derecha}} copia un lado.
- **Valores y objetivos.** Bajo cada plantilla de un lado, un cuadro por valor (vacío = el valor propio de la plantilla) y, para un punto que toma un objetivo, la línea característica u otra línea de obra lineal que lo mueve.
- **Desde y Hasta** limitan la obra lineal a parte de la alineación.

Las secciones, las líneas en planta de cada código de punto, la superficie proyectada, el replanteo y el movimiento de tierras siguen todo esto. Propiedades enumera el volumen de cada componente por lado y región (áreas medias de extremos a lo largo del eje). El peralte y los objetivos de borde de la obra lineal no se usan mientras la obra se construye con plantillas.

## Varias obras lineales en una alineación

Bajo **Obras lineales en esta alineación**, {{ui:Agregar una obra lineal}} agrega una obra lineal en el resto de la alineación: la primera obra recibe una estación final en el centro (o conserva la suya), y la nueva empieza ahí con la última región de plantillas de la primera. Cada obra lineal tiene su propio nombre, rango de estaciones, plantillas y movimiento de tierras. Desactívela con su casilla {{ui:Activadas}}. Donde dos rangos se traslapan, la obra posterior se rasante sobre la anterior.

## Plantillas de terreno

Una plantilla de terreno extiende las capas de una plantilla sobre un terreno desde su punto 0,0: una capa bajo el punto 0,0 entra en el terreno (capa vegetal a retirar), y una capa encima de él se asienta sobre el terreno (base y pavimento en un estacionamiento). Los anchos y las pendientes no importan, solo la profundidad de cada componente arriba o abajo del punto 0,0.

Abra {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de terreno…}} (o escriba {{cmd:TERRAINTEMPLATES}}); el bloque también está en las Propiedades del proyecto. {{ui:Agregar una plantilla de terreno}} agrega una con el ejemplo de capa vegetal. Para cada una elija:

- la **plantilla** (sus valores se pueden cambiar para esta),
- el **terreno**: el terreno natural o la superficie proyectada,
- la **forma** que la recorta: todo el terreno, una parcela, una plataforma o una línea característica cerrada. Varias plantillas de terreno pueden usar formas distintas sobre el mismo terreno.

Cada capa enumera su espesor, área en planta y volumen. El volumen es el área en planta por el espesor, medido en vertical; el área se mide sobre una rejilla, y también se da el área extendida (inclinada). Las formas se dibujan en el plano, en la capa C-TOPO-TMPL. Las plantillas de terreno no cambian la superficie proyectada.

## Materiales y cantidades

El bloque de Movimiento de tierras del proyecto enumera los **Materiales de plantillas**: cada componente de obra lineal y cada capa de plantilla de terreno, con su volumen. {{ui:Enviar a TakeoffCraft}} los escribe en el archivo de cantidades después del corte y el terraplén, un elemento cada uno, en yardas cúbicas (proyectos en pies) o metros cúbicos.

## Archivos

Las plantillas, las regiones, las obras lineales adicionales y las plantillas de terreno se guardan en el archivo del proyecto. Un proyecto que no usa ninguna se guarda exactamente como antes, y las versiones anteriores de CivilCraft abren un proyecto que sí las usa (ignoran las plantillas y construyen el conjunto propio de la obra lineal).
