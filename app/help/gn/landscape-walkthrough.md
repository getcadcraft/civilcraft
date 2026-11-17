---
title: Diseñar un jardín, de principio a fin
summary: Los diez pasos del arquitecto paisajista, desde el relevamiento hasta el juego publicado, con lo que hace hoy el espacio de trabajo de paisajismo en cada uno y lo que todavía no hace.
keywords: tutorial, paso a paso, cómo hacer, diseño de paisajismo, diseño de jardín, primeros pasos, ejemplo, muestra, paso a paso, relevamiento, trazos, terreno, plantación, planilla, hojas, publicar, un proyecto
from: 87900bf5
---

Un diseño de paisajismo da vueltas: relevamiento, boceto, trazos, terreno, áreas, niveles, plantación, planillas, hojas, y vuelve otra vez. Estos son los diez pasos, con lo que existe para cada uno. Cuando un paso tiene un vacío, se nombra en **Todavía no construido** al final, y no se esconde dentro del paso.

Podés seguirlo en el sitio de muestra, o en tu propio dibujo de relevamiento. Con el tuyo, empezá por el paso 1.

## 1. Traer el relevamiento

{{ui:Surface}} › {{ui:Linework from a drawing…}}, elegí el dibujo de relevamiento (DWG 2000–2018 o DXF). Revisá las unidades, tomá las curvas de nivel, las polilíneas 3D y el límite para la superficie, y los bloques de puntos como puntos de relevamiento. La sección **Niveles del relevamiento y control** lee los niveles escritos como texto o como atributo y lista lo que parece mal (unidades, sistema de coordenadas, distancia desde el cero, curvas planas, niveles raros, puntos duplicados) antes de agregar nada. Ver [Revisar un dibujo de relevamiento al importar](topic:survey-check) y [Abrir un DWG o DXF como trazos](topic:open-dwg-dxf). Elegí el sistema de coordenadas con {{ui:Coordinate system…}}.

## 2. Bocetos a mano

Una hoja en papel, como un relevamiento viejo o una copia marcada, entra con {{ui:Scan…}} (Empezar desde un escaneo): se ubica a escala o en coordenadas conocidas debajo del plano, y se puede calcar como trazos. ModelCraft lee una foto de un boceto a mano (Archivo › Importar una foto de boceto…). CivilCraft no tiene una herramienta propia para un boceto a mano: poné la hoja debajo del plano y dibujá encima.

## 3. Del boceto a los trazos

Dibujá líneas de elementos y contornos sobre el relevamiento en CivilCraft, o dibujalos en el plano 2D. Paisajismo › Más › {{ui:From a line}} convierte una línea en pavimento, un área plantada, un muro, escalones, una línea de elemento y más, quedando vinculados: si movés la línea, el objeto la sigue. Ver [Objetos desde trazos](topic:objects-from-lines). En SuperCad Studio, abrí el sitio, el plano y el modelo del edificio en un solo proyecto: el espacio de trabajo **Paisajismo** tiene las herramientas de todos, y una línea elegida en el plano 2D puede convertirse en un objeto de paisajismo que la sigue (Ctrl+K, {{ui:Landscape object from the picked drawing line}}).

## 4. El terreno proyectado

Abrí {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. Armá el terreno proyectado con {{ui:Platform}}, {{ui:Berm}}, {{ui:Swale}} y áreas de nivelación con niveles puntuales y curvas de nivel; los pavimentos, caminos, muros, rampas y escalones que agregues se nivelan dentro de la misma superficie proyectada. El terreno existente nunca cambia. {{ui:Levels}} › {{ui:Ground modifiers…}} lista todo lo que da forma al terreno en un solo orden, con corte y relleno para cada uno. Ver [Nivelación](topic:landscape-grading) y [Modificadores de terreno y niveles en vivo](topic:ground-modifiers).

## 5. Pavimentos y áreas plantadas

{{ui:Hardscape}} › {{ui:Paving}}, {{ui:Path}}, {{ui:Wall}}, {{ui:Kerb}}, {{ui:Ramp}} y {{ui:Steps}}. {{ui:Areas}} dibuja un césped, cantero, pradera o cubresuelo con su capa; se recorta sola alrededor de pavimentos, muros y escalones. {{ui:Bed}} llena un área con la separación de las plantas, a partir de una mezcla de plantas. Ver [Obras duras](topic:hardscape), [Áreas plantadas](topic:planted-areas) y [Plantación](topic:planting).

## 6. Niveles, pendientes y uniones

Dentro de **Controles de nivelación**, marcá **Análisis de pendiente** y **Flechas de flujo y encharcamiento**. Si el agua se encharca contra una terraza, agregá una {{ui:Swale}} alrededor. Las Propiedades te dicen cuántas contrahuellas necesitan los escalones y si entran, y dónde un camino es más empinado que su límite. El panel Problemas lista dónde los objetos se encuentran mal: un muro demasiado alto, un cantero arriba del pavimento, escalones que no llegan a su descanso. {{ui:Spot level}} y {{ui:Gradient arrow}} rotulan el terreno y se actualizan solos.

## 7. Plantación

En **Plantas**, buscá en la lista de plantas (unas cientos de especies, o tu propia lista), elegí una y {{ui:Plant}}, {{ui:Bed}} o {{ui:Hedge}}. Fijá el tamaño y los rótulos de la planta desde Más. Más › {{ui:Plant table}} edita tus propios registros: cultivares, tamaños suministrados, densidad, notas de especificación. Cada registro puede llevar tu propio símbolo y modelo 3D (OBJ, STL o GLB), y Más › {{ui:Plant graphics}} dibuja las plantas más simples a escalas más chicas. Ver [La lista de plantas](topic:plant-list), [Registros de plantas](topic:plant-records) y [Gráficos de plantas](topic:plant-graphics).

## 8. Cantidades y planillas

Más › {{ui:Worksheets}}: las planillas de plantas y de obras duras, y las tuyas, quedan vinculadas a los objetos; guardalas como CSV o XLSX o ponelas en las hojas (ver [Planillas](topic:worksheets)). Más › {{ui:Plant schedule…}} envía las cantidades a TakeoffCraft. Las cantidades de obras duras están en las Propiedades de pavimentos, muros y escalones. Riego tiene su propia lista de materiales: {{ui:Irrigation}} › **Revisar el sistema…**. Ver [Riego](topic:irrigation).

## 9. Planos y hojas

Más › {{ui:Landscape sheets…}}: planos de plantación, nivelación y riego, con detalles. {{ui:Levels}} › {{ui:Section line}} dibuja cortes a través del terreno, muros, capas, escalones y plantas. Ver [Hojas de paisajismo](topic:landscape-sheets) y [Cortes y el juego de publicación](topic:landscape-sections).

## 10. Publicar

{{ui:Publish set (.zip)}} en el diálogo de hojas hace un PDF con una lista de hojas y un DWG por hoja. Más › {{ui:Export landscape IFC}} entrega a BimCraft las plantas y las obras duras. Guardá el proyecto: todo queda en un solo archivo.

## Cambiar una cosa: la escalera

El sentido de tener todo en un proyecto es que un cambio se propaga. Probalo con un tramo de escalones entre dos terrazas:

1. Dibujá la línea del tramo como línea de elemento (o una línea del plano), y después Paisajismo › Más › {{ui:From a line}} › {{ui:Steps}}. En las Propiedades de los escalones marcá **Da forma al terreno**, y poné los niveles inferior y superior en las dos terrazas.
2. Dibujá un cantero plantado al lado y debajo del tramo con {{ui:Areas}}, y pavimento en las terrazas. El cantero se recorta solo alrededor de los escalones y del pavimento, y la planilla de plantas cuenta solo lo plantado.
3. Subí el nivel superior del tramo en las Propiedades. El terreno proyectado, los niveles puntuales, las flechas de pendiente y el corte y relleno cambian de una vez. Si el tramo ya no llega a la terraza superior, el panel Problemas dice por cuánto.
4. Mové la línea del tramo. Los escalones siguen su línea en el mismo paso de deshacer; el cantero se recorta de nuevo y se vuelve a contar, y las planillas y cronogramas muestran los nuevos números.
5. Presioná Ctrl+Z una vez: la línea, los escalones, el terreno y el cantero vuelven juntos.

Ver [Modificadores de terreno y niveles en vivo](topic:ground-modifiers), [Áreas plantadas](topic:planted-areas) y [Planillas](topic:worksheets).

## Todavía no construido

Esto se pidió y no está en esta versión:

- Muros que den forma al terreno (informan dónde lo encuentran, y su coronamiento puede seguirlo).
- Editar tu propia lista de plantas de la Biblioteca dentro de la app (editá la lista del proyecto y guardala como archivo de plantas).
- Texturas y colores de tus propios modelos GLB de plantas (se lee la forma; se usa el color de la planta).

Ver [El espacio de trabajo de paisajismo](topic:landscape) para todas las herramientas.
