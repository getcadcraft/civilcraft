---
title: Volúmenes de movimiento de tierras
summary: Lea los volúmenes de desmonte, terraplén y netos entre el terreno existente y la superficie proyectada, por plataforma y por corredor y en total, y entienda el método de cuadrícula que hay detrás.
keywords: volúmenes, movimiento de tierras, desmonte, terraplén, neto, desmonte y terraplén, mediciones, método de cuadrícula, comparación de superficies, superficie de volumen, yardas cúbicas, metros cúbicos
from: 299d7bc7
---

En cuanto una plataforma o un corredor se nivela sin problemas, CivilCraft compara la superficie proyectada con el terreno existente e informa del desmonte y del terraplén. Las cifras se actualizan con cada cambio.

## Dónde leerlos

- **Movimiento de tierras** en el panel derecho, sin nada seleccionado (la vista **Proyecto**), cuando hay al menos una plataforma o un corredor.
- **Movimiento de tierras** en el panel derecho, cuando hay una plataforma seleccionada (los mismos totales de todo el proyecto).
- La línea bajo la configuración de un corredor, con su propio desmonte y terraplén.

El bloque **Movimiento de tierras** muestra:

- **Desmonte**, **Terraplén** y **Neto** (con "terraplén" o "desmonte" detrás, según cuál sea mayor)
- una línea por elemento cuando hay más de uno, por ejemplo "Plataforma 1: desmonte 120.4 cu yd, terraplén 310.2 cu yd"
- la línea del método: "Método de cuadrícula: terreno existente y superficie nivelada muestreados cada 0.5 ft dentro de las líneas de talud (92,891 celdas). No se aplica ningún esponjamiento ni contracción."

Los volúmenes están en yardas cúbicas en un proyecto en pies, y en metros cúbicos en un proyecto en metros.

## Enviarlos a TakeoffCraft

Para valorar el movimiento de tierras, elija {{ui:Enviar a TakeoffCraft}} al pie del bloque **Movimiento de tierras**. CivilCraft guarda un archivo de mediciones (`<site>.quantities.json`) con dos mediciones: desmonte y terraplén, en yardas cúbicas (proyecto en pies) o en metros cúbicos (proyecto en metros), las mismas cifras del bloque, redondeadas a la centésima. Ábralo en TakeoffCraft con **Abrir mediciones**, o suéltelo allí: se convierten en dos partidas a las que puede asignar precio ([Desmonte y terraplén desde CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Vuelva a enviar tras un cambio y abra el archivo nuevo: las mismas partidas tomarán las cifras nuevas.

Solo se envían los totales, así que nada se cuenta dos veces; la nota del archivo enumera el desmonte y el terraplén de cada plataforma y de cada corredor.

## Cómo se calculan

CivilCraft usa el **método de cuadrícula**:

1. Se extiende una cuadrícula de celdas cuadradas sobre el área dentro de cada línea de talud.
2. En el centro de cada celda se muestrean ambas superficies.
3. Cada celda cuenta como un prisma: la diferencia de cota por el área de la celda. Donde la superficie proyectada es más baja, hay desmonte; donde es más alta, terraplén.
4. Las celdas se suman.

El tamaño de celda se elige por usted para que el rectángulo alrededor de las áreas niveladas tenga unas 250,000 celdas, redondeado a un valor práctico (1, 2 o 5 veces una potencia de diez). Todavía no puede fijarlo usted. La línea del método le indica el tamaño y el número de celdas. Las celdas más pequeñas son más precisas en los bordes; sobre celdas enteras entre planos, el resultado es exacto.

## Cosas que conviene saber

- Solo se cuenta el área dentro de las líneas de talud. El terreno fuera de ellas no cambia.
- Una plataforma o un corredor con un problema no se nivela y no suma nada. Si el bloque dice "Todavía no hay volúmenes: una plataforma debe nivelarse sin problemas.", busque un cuadro rojo encima.
- Donde los elementos se solapan, el posterior ha sustituido al anterior dentro de su línea de talud, y el solapamiento se cuenta una vez.
- No se aplica ningún factor de esponjamiento o de contracción. Multiplique los resultados usted mismo si necesita volúmenes en banco, sueltos o compactados.
- Todavía no están disponibles el decapado de tierra vegetal, las profundidades de pavimento y de subrasante, ni los volúmenes de prismas de TIN a TIN.

## Comprobar un resultado

- Active {{ui:Proyecto (rasante)}} en **Visualización** y mire las curvas de nivel dentro de las líneas de talud.
- Sitúe el puntero sobre el área nivelada: la barra de estado muestra **Terreno** y **Nivelado**. La diferencia es la profundidad de desmonte o de terraplén en ese punto.
- En un corredor, la lectura de la vista de perfil muestra el desmonte o el terraplén sobre el eje en cada P.K.
