---
title: Plantillas de corredor y plantillas de terreno
summary: Hacé plantillas reutilizables pequeñas (cordón y cuneta, vereda, muro, zanja), armá un corredor con ellas por estación con izquierda y derecha separadas, dividí un trazado en varios corredores, y extendé materiales en capas sobre un terreno.
keywords: plantilla, plantillas, biblioteca de plantillas, creación de plantillas, sección típica, ensamble, subensamble, componentes, códigos de punto, condición de fin, línea de empate, zanja, muro de contención, cordón, cuneta, vereda, regiones, rango de estaciones, varios corredores, múltiples corredores, izquierda y derecha, plantilla de terreno, tierra vegetal, pavimento, base, extender, materiales, cantidades
from: ce70e58b
---

Una **plantilla** es un pequeño corte transversal que dibujás una vez y reutilizás: puntos con desplazamientos, pendientes y códigos de punto, y componentes con materiales. Un corredor se puede armar con plantillas por estación, con cada lado con sus propias plantillas de pavimento y su propia condición de fin, y las mismas plantillas se pueden extender sobre un terreno.

:::warning
Las plantillas de ejemplo son marcadores para empezar. Sus números no se toman de ninguna norma ni agencia. Un ingeniero debe revisar cada plantilla, y cada valor que le des, antes de usarla en un diseño.
:::

## Abrir las plantillas

Abrí {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas del corredor…}} (o escribí {{cmd:TEMPLATES}}). La ventana tiene tres listas:

- **En este proyecto**: las plantillas que usan los corredores y plantillas de terreno de este proyecto. Se guardan en el archivo del proyecto.
- **Mi biblioteca**: plantillas guardadas en este navegador y ofrecidas en cada proyecto. Usá {{ui:Mi biblioteca-pe ojesalva}} sobre una plantilla del proyecto para conservarla.
- **Ejemplos**: dos carriles con capas, cordón y cuneta, vereda, línea de empate, zanja, muro de contención, tierra vegetal bajo el terreno, y pavimento sobre el terreno. Cada una está marcada "Para revisión por un ingeniero".

{{ui:Ko proyecto-pe ojeporu}} copia una plantilla de biblioteca o de ejemplo al proyecto. {{ui:Ko proyecto plantillas eporta}} las guarda como archivo `.cctemplates.json`, y {{ui:Archivo importar}} lee uno en el proyecto y en Mi biblioteca. Usá el archivo para compartir plantillas o pasarlas a otra computadora.

## Hacer una plantilla

{{ui:Plantilla pyahu}} (o {{ui:Editar}} sobre una plantilla del proyecto) abre el editor de plantillas. Dibujá el lado derecho, hacia afuera desde el punto 0,0 de la plantilla; el lado izquierdo usa la misma plantilla hacia afuera, a la izquierda.

1. Ponele un nombre y un tipo: **Pavimento** (la siguiente plantilla se une en su extremo), **Condición de fin** (llega al terreno) o **Plantilla de terreno**.
2. Agregá **valores**: números con nombre, como un ancho `w` o una pendiente `s`. Una casilla de número en cualquier parte de la plantilla acepta un número o el nombre de un valor; `-t` es el valor `t` en negativo. Un corredor puede dar a cada uso de la plantilla sus propios valores, así una sola plantilla de cordón sirve para cada altura de cordón.
3. Agregá **puntos** en orden. Cada uno se ubica desde un punto anterior (o el punto 0,0) según su restricción:

| Restricción | Ubica el punto |
|---|---|
| Desplazamiento con pendiente | Un desplazamiento hacia afuera y una pendiente (subida por recorrido; −0.02 baja 2%) |
| Desplazamiento y subida | Un desplazamiento y una subida |
| Recto arriba o abajo | Solo una subida |
| Talud lateral hasta el terreno | Hacia afuera desde su punto hasta el terreno, con la relación de corte donde el terreno está arriba y la relación de relleno donde está abajo |
| Hasta el terreno | Un desplazamiento, y luego recto arriba o abajo hasta el terreno |
| Muro de contención | Un muro del espesor que des: en corte su parte superior llega al terreno en la cara de la calzada; en relleno la calzada pasa sobre él y su cara exterior baja hasta el terreno |

   Marcá **Superior** para los puntos por donde pasa la superficie terminada. El último punto superior es donde empieza la siguiente plantilla de ese lado. Un **Objetivo** permite que un corredor mueva el punto: su desplazamiento o su cota viene de una línea.
4. Agregá **componentes**: formas cerradas a través de códigos de punto (`0` es el punto 0,0), cada una con un nombre, un material y un tipo. Sus superficies dan los volúmenes.

El dibujo sigue cada cambio a escala real, y la lista debajo indica qué está mal (un punto que llega al terreno antes del final, un valor que la plantilla no tiene, un componente sin superficie). {{ui:Agregar a este proyecto}} o {{ui:Guardar}} la conserva, como un solo paso de deshacer.

## Armar un corredor con plantillas

Seleccioná un trazado con corredor y, en sus **Propiedades**, activá {{ui:Construir desde plantillas por estación}}. El corredor empieza con los ejemplos de dos carriles y línea de empate en ambos lados.

- **Regiones.** Cada región empieza en una estación y llega hasta la de la siguiente región. {{ui:Agregar una región}} agrega una; cambiá su estación de inicio en su casilla.
- **Izquierda y derecha separadas.** Cada lado de cada región tiene su propia lista de **Pavimento**, desde el eje hacia afuera, y su propia **Condición de fin**: línea de empate, una zanja, un muro, o cualquier plantilla que llegue al terreno. Sin condición de fin, el lado empata con las pendientes de corte y relleno del corredor. {{ui:Copiar de izquierda a derecha}} copia un lado.
- **Valores y objetivos.** Debajo de cada plantilla de un lado, una casilla por valor (vacía = el valor propio de la plantilla) y, para un punto que lleva un objetivo, la línea de rasgo o la línea de otro corredor que lo mueve.
- **Desde** y **Hasta** limitan el corredor a una parte del trazado.

Los cortes, las líneas del plano para cada código de punto, la superficie propuesta, el replanteo y el movimiento de suelo siguen todos. **Propiedades** lista el volumen de cada componente por lado y región (superficies de extremo promedio a lo largo del eje). El peralte y los objetivos de borde del corredor no se usan mientras el corredor se arma desde plantillas.

## Varios corredores en un trazado

Bajo **Corredores en este trazado**, {{ui:Agregar un corredor}} agrega un corredor en el resto del trazado: al primer corredor se le da una estación final en el medio (o conserva la suya), y el nuevo empieza allí con la última región de plantillas del primero. Cada corredor tiene su propio nombre, rango de estaciones, plantillas y movimiento de suelo. Desactivá uno con su casilla {{ui:Encendido}}. Donde dos rangos se superponen, el corredor posterior se nivela sobre el anterior.

## Plantillas de terreno

Una plantilla de terreno extiende las capas de una plantilla sobre un terreno desde su punto 0,0: una capa debajo del punto 0,0 va dentro del terreno (tierra vegetal a retirar), una capa encima se apoya sobre el terreno (base y pavimento en un estacionamiento). Los anchos y pendientes no importan, solo la profundidad de cada componente arriba o abajo del punto 0,0.

Abrí {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de terreno…}} (o escribí {{cmd:TERRAINTEMPLATES}}); el bloque también está en las **Propiedades** del proyecto. {{ui:Agregar una plantilla de terreno}} agrega una con el ejemplo de tierra vegetal. Para cada una elegí:

- la **plantilla** (sus valores se pueden cambiar solo para esta),
- el **terreno**: el terreno existente o la superficie propuesta,
- la **forma** que la recorta: todo el terreno, una parcela, una plataforma o una línea de rasgo cerrada. Varias plantillas de terreno pueden usar formas distintas sobre el mismo terreno.

Cada capa lista su espesor, superficie en planta y volumen. El volumen es la superficie en planta por el espesor, medido recto hacia abajo; la superficie se mide sobre una grilla, y también se indica la superficie extendida (inclinada). Las formas se dibujan en el plano en la capa C-TOPO-TMPL. Las plantillas de terreno no cambian la superficie propuesta.

## Materiales y cantidades

El bloque de Movimiento de suelo del proyecto lista **Materiales de plantillas**: cada componente de corredor y cada capa de plantilla de terreno con su volumen. {{ui:Enviar a TakeoffCraft}} los escribe en el archivo de cantidades después del corte y relleno, un ítem cada uno, en yardas cúbicas (proyectos en pies) o metros cúbicos.

## Archivos

Las plantillas, regiones, los corredores adicionales y las plantillas de terreno se guardan en el archivo del proyecto. Un proyecto que no usa ninguno se guarda exactamente como antes, y las versiones anteriores de CivilCraft abren un proyecto que sí los usa (ignoran las plantillas y arman el ensamble propio del corredor).
