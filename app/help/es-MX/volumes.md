---
title: Volúmenes de movimiento de tierras
summary: Lea los volúmenes de corte, relleno y neto entre el terreno existente y la superficie de proyecto, por plataforma y obra lineal y en total, y entienda el método de cuadrícula que hay detrás.
keywords: volúmenes, movimiento de tierras, corte, relleno, neto, corte y relleno, cantidades, método de cuadrícula, comparación de superficies, superficie de volumen, yardas cúbicas, metros cúbicos
from: 299d7bc7
---

En cuanto una plataforma o una obra lineal se rasantea sin problemas, CivilCraft compara la superficie propuesta con el terreno existente e informa el corte y el relleno. Los números se actualizan con cada cambio.

## Dónde leerlos

- **Movimiento de tierras** en el panel derecho sin nada seleccionado (la vista **Proyecto**), cuando hay al menos una plataforma o una obra lineal.
- **Movimiento de tierras** en el panel derecho cuando hay una plataforma seleccionada (los mismos totales de todo el proyecto).
- La línea bajo la configuración de una obra lineal, con su propio corte y relleno.

El bloque **Movimiento de tierras** muestra:

- **Corte**, **Relleno** y **Neto** (con "relleno" o "corte" después, el que sea mayor)
- una línea por elemento cuando hay más de uno, por ejemplo "Plataforma 1: corte 120.4 cu yd, relleno 310.2 cu yd"
- la línea de método: "Método de cuadrícula: terreno existente y superficie rasanteada muestreados cada 0.5 ft dentro de las líneas de cierre de talud (92,891 celdas). No se aplicó esponjamiento ni contracción."

Los volúmenes están en yardas cúbicas en un proyecto en pies y en metros cúbicos en un proyecto en metros.

## Enviarlos a TakeoffCraft

Para presupuestar el movimiento de tierras, elija {{ui:Enviar a TakeoffCraft}} al pie del bloque **Movimiento de tierras**. CivilCraft guarda un archivo de cantidades (`<site>.quantities.json`) con dos cantidades: corte y relleno, en yardas cúbicas (proyecto en pies) o metros cúbicos (proyecto en metros), los mismos números del bloque, hasta la centésima. Ábralo en TakeoffCraft con **Abrir cuantificación**, o suéltelo allí: se convierten en dos partidas que puede presupuestar ([Corte y relleno desde CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Envíe otra vez después de un cambio y abra el archivo nuevo: las mismas partidas toman los nuevos números.

Solo se envían los totales, así que nada se cuenta dos veces; la nota del archivo enumera el corte y el relleno propios de cada plataforma y obra lineal.

## Cómo se calculan

CivilCraft usa el **método de cuadrícula**:

1. Se superpone una cuadrícula de celdas cuadradas sobre el área dentro de cada línea de cierre de talud.
2. En el centro de cada celda se muestrean ambas superficies.
3. Cada celda cuenta como un prisma: la diferencia de elevación por el área de la celda. Donde la superficie propuesta es más baja, hay corte; donde es más alta, hay relleno.
4. Las celdas se suman.

El tamaño de celda se elige automáticamente para que el rectángulo alrededor de las áreas rasanteadas contenga unas 250,000 celdas, redondeado a un valor práctico (1, 2 o 5 veces una potencia de diez). Todavía no puede definirlo usted. La línea de método le indica el tamaño y el número de celdas. Las celdas más pequeñas son más precisas a lo largo de los bordes; con celdas completas entre planos sin pendiente, el resultado es exacto.

## Cosas que conviene saber

- Solo se cuenta el área dentro de las líneas de cierre de talud. El terreno fuera de ellas no cambia.
- Una plataforma u obra lineal con problemas no se rasantea y no suma nada. Si el bloque dice "Todavía no hay volúmenes: una plataforma necesita rasantearse sin problemas.", busque un recuadro rojo encima.
- Donde los elementos se superponen, el posterior reemplaza al anterior dentro de su línea de cierre, y la superposición se cuenta una sola vez.
- No se aplica ningún factor de esponjamiento ni de contracción. Multiplique los resultados usted mismo si necesita volúmenes en banco, sueltos o compactados.
- El desbroce de capa vegetal, las profundidades de pavimento y de subrasante, y los volúmenes de prismas de TIN a TIN todavía no están disponibles.

## Cómo verificar un resultado

- Active {{ui:Proyecto (rasante)}} en **Visualización** y observe las curvas de nivel dentro de las líneas de cierre de talud.
- Mueva el puntero sobre el área rasanteada: la barra de estado muestra **Terreno** y **Rasante**. La diferencia es la profundidad del corte o del relleno en ese punto.
- En una obra lineal, la lectura de la vista de perfil muestra el corte o el relleno sobre el eje en cada estación.
