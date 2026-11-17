---
title: Volúmenes de movimiento de suelo
summary: Leer los volúmenes de corte, relleno y neto entre el terreno existente y la superficie propuesta, por plataforma y corredor y en total, y entender el método de grilla que hay detrás.
keywords: volúmenes, movimiento de suelo, corte, relleno, neto, corte y relleno, cantidades, método de grilla, comparación de superficies, superficie de volumen, yardas cúbicas, metros cúbicos
from: 299d7bc7
---

En cuanto una plataforma o un corredor hace movimiento de suelo sin problemas, CivilCraft compara la superficie propuesta con el terreno existente e informa corte y relleno. Los números se actualizan con cada cambio.

## Dónde leerlos

- **Movimiento de suelo** en el panel derecho sin nada seleccionado (la vista **Proyecto**), cuando hay al menos una plataforma o un corredor.
- **Movimiento de suelo** en el panel derecho cuando hay una plataforma seleccionada (los mismos totales para todo el proyecto).
- La línea debajo de la configuración de un corredor, con su propio corte y relleno.

El bloque **Movimiento de suelo** muestra:

- **Corte**, **Relleno** y **Neto** (con "relleno" o "corte" después, el que sea mayor)
- una línea por ítem cuando hay más de uno, por ejemplo "Plataforma 1: corte 120.4 cu yd, relleno 310.2 cu yd"
- la línea del método: "Método de grilla: terreno existente y superficie terminada muestreados cada 0.5 ft dentro de las líneas de intersección (92,891 celdas). No se aplicó hinchamiento ni contracción."

Los volúmenes están en yardas cúbicas en un proyecto en pies y en metros cúbicos en un proyecto en metros.

## Enviarlos a TakeoffCraft

Para valorar el movimiento de suelo, elegí {{ui:Send to TakeoffCraft}} al pie del bloque **Movimiento de suelo**. CivilCraft guarda un archivo de cantidades (`<sitio>.quantities.json`) con dos cantidades: corte y relleno, en yardas cúbicas (proyecto en pies) o metros cúbicos (proyecto en metros), los mismos números del bloque, con dos decimales. Ábrelo en TakeoffCraft con **Open takeoff**, o soltalo ahí: se convierten en dos ítems que podés valorar ([Corte y relleno desde CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Envialo otra vez después de un cambio y abrí el archivo nuevo: los mismos ítems toman los números nuevos.

Solo se envían los totales, así que nada se cuenta dos veces; la nota del archivo lista el corte y el relleno propios de cada plataforma y corredor.

## Cómo se calculan

CivilCraft usa el **método de grilla**:

1. Se superpone una grilla de celdas cuadradas sobre el área dentro de cada línea de intersección.
2. En el centro de cada celda se muestrean las dos superficies.
3. Cada celda cuenta como un prisma: la diferencia de cota por el área de la celda. Donde la superficie propuesta está más baja, hay corte; más alta, relleno.
4. Las celdas se suman.

El tamaño de celda se elige por vos para que el rectángulo alrededor de las zonas terminadas tenga unas 250,000 celdas, redondeado a un valor práctico (1, 2 o 5 veces una potencia de diez). Todavía no podés fijarlo vos mismo. La línea del método indica el tamaño y la cantidad de celdas. Las celdas más chicas son más precisas a lo largo de los bordes; en celdas completas entre planos lisos el resultado es exacto.

## Para tener en cuenta

- Solo se cuenta el área dentro de las líneas de intersección. El terreno fuera de ellas no cambia.
- Una plataforma o corredor con un problema no se incorpora al terreno y no suma nada. Si el bloque dice "Todavía no hay volúmenes: una plataforma necesita hacer movimiento de suelo sin problemas.", buscá un cuadro rojo encima.
- Donde los ítems se superponen, el posterior reemplazó al anterior dentro de su línea de intersección, y la superposición se cuenta una vez.
- No se aplica ningún factor de hinchamiento ni de contracción. Multiplicá los resultados vos mismo si necesitás volúmenes en banco, sueltos o compactados.
- El decapado de suelo vegetal, las profundidades de pavimento y de subrasante, y los volúmenes de prismas TIN a TIN todavía no están disponibles.

## Verificar un resultado

- Activá {{ui:Proposed (graded)}} en **Display** y mirá las curvas de nivel dentro de las líneas de intersección.
- Pasá el puntero sobre el área terminada: la barra de estado muestra **Ground** y **Graded**. La diferencia es la profundidad del corte o del relleno en ese lugar.
- Para un corredor, la lectura de la vista de perfil muestra el corte o el relleno sobre el eje en cada progresiva.
