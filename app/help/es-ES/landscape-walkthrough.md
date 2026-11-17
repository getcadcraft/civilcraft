---
title: Diseñar un jardín de principio a fin
summary: Los diez pasos del arquitecto paisajista, desde el levantamiento hasta el conjunto publicado, con lo que el espacio de trabajo de Paisajismo hace hoy en cada uno y lo que todavía no hace.
keywords: recorrido, tutorial, cómo hacerlo, diseño paisajístico, diseño de jardines, primeros pasos, ejemplo, muestra, paso a paso, levantamiento, geometría, terreno, plantación, listado, hojas, publicar, un solo proyecto
from: 87900bf5
---

Un diseño paisajístico avanza en círculo: levantamiento, boceto, geometría, terreno, zonas, cotas, plantación, listados, hojas, y de vuelta. Estos son los diez pasos, con lo que existe para cada uno. Cuando un paso tiene un hueco, se indica en **Todavía no implementado** al final, y no se oculta dentro del paso.

Puede seguir el ejemplo en la parcela de muestra, o en su propio plano de levantamiento. Con el suyo, empiece por el paso 1.

## 1. Incorpore el levantamiento

{{ui:Surface}} › {{ui:Linework from a drawing…}}, elija el plano del levantamiento (DWG 2000–2018 o DXF). Compruebe las unidades, tome las curvas de nivel, las polilíneas 3D y el límite para la superficie, y los bloques de puntos como puntos del levantamiento. La sección **Cotas del levantamiento y comprobación** lee las cotas escritas como texto o como atributo y enumera lo que parece incorrecto (unidades, sistema de coordenadas, distancia al origen, curvas planas, cotas extrañas, puntos duplicados) antes de añadir nada. Consulte [Comprobar un plano de levantamiento al importar](topic:survey-check) y [Abrir un DWG o DXF como geometría](topic:open-dwg-dxf). Establezca el sistema de coordenadas con {{ui:Coordinate system…}}.

## 2. Bocetos a mano

Una hoja en papel, como un levantamiento antiguo o una copia impresa con anotaciones, se incorpora con {{ui:Scan…}} (Empezar desde un escaneado): se coloca a escala o en coordenadas conocidas bajo la planta, y se puede calcar como geometría. ModelCraft lee una foto de un boceto a mano (Archivo › Importar una foto de boceto…). CivilCraft no tiene herramienta propia para un boceto a mano: coloque la hoja bajo la planta y dibuje encima.

## 3. Del boceto a la geometría

Dibuje líneas de elemento y contornos sobre el levantamiento en CivilCraft, o dibújelos en el dibujo 2D. Paisajismo › Más › {{ui:From a line}} convierte una línea en pavimento, una zona plantada, un muro, escalones, una línea de elemento y más, vinculados: si mueve la línea, el objeto la sigue. Consulte [Objetos desde la geometría](topic:objects-from-lines). En SuperCad Studio, abra el emplazamiento, el dibujo y el modelo del edificio en un solo proyecto: el espacio de trabajo **Paisajismo** tiene las herramientas de todos ellos, y una línea seleccionada en el dibujo 2D puede convertirse en un objeto de paisajismo que la sigue (Ctrl+K, {{ui:Landscape object from the picked drawing line}}).

## 4. El terreno proyectado

Abra {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. Construya el terreno proyectado con {{ui:Platform}}, {{ui:Berm}}, {{ui:Swale}} y las zonas de explanación con cotas puntuales y curvas de nivel; los pavimentos, senderos, muros, rampas y escalones que añada se ajustan a la misma superficie proyectada. El terreno existente nunca cambia. {{ui:Levels}} › {{ui:Ground modifiers…}} enumera todo lo que da forma al terreno en un solo orden, con el desmonte y el terraplén de cada uno. Consulte [Explanación](topic:landscape-grading) y [Modificadores del terreno y cotas en vivo](topic:ground-modifiers).

## 5. Pavimentos y zonas plantadas

{{ui:Hardscape}} › {{ui:Paving}}, {{ui:Path}}, {{ui:Wall}}, {{ui:Kerb}}, {{ui:Ramp}} y {{ui:Steps}}. {{ui:Areas}} dibuja un césped, un macizo, una pradera o un cubresuelo con su capa de base; se recorta sola alrededor de pavimentos, muros y escalones. {{ui:Bed}} rellena una zona según la separación de las plantas, a partir de una mezcla de plantas. Consulte [Pavimentos y obra dura](topic:hardscape), [Zonas plantadas](topic:planted-areas) y [Plantación](topic:planting).

## 6. Cotas, pendientes y encuentros

En **Comprobaciones de explanación**, marque **Análisis de pendientes** y **Flechas de flujo y encharcamiento**. Si el agua se encharca contra una terraza, añada una {{ui:Swale}} alrededor. Las propiedades le indican cuántas tabicas necesitan los escalones y si encajan, y dónde un sendero es más empinado que su límite. El panel Problemas enumera los puntos donde los objetos se encuentran mal: un muro sobrepasado, un macizo por encima del pavimento, escalones que no llegan a su descanso. {{ui:Spot level}} y {{ui:Gradient arrow}} rotulan el terreno y se actualizan solos.

## 7. Plantación

En **Plantas**, busque en la lista de plantas (unas pocas centenas de especies, o su propia lista), elija una, y {{ui:Plant}}, {{ui:Bed}} o {{ui:Hedge}}. Defina el tamaño y las etiquetas de la planta desde Más. Más › {{ui:Plant table}} edita sus propios registros: cultivares, tamaños suministrados, densidad, notas de especificación. Cada registro puede llevar su propio símbolo y modelo 3D (OBJ, STL o GLB), y Más › {{ui:Plant graphics}} dibuja las plantas más sencillas a escalas más pequeñas. Consulte [La lista de plantas](topic:plant-list), [Fichas de plantas](topic:plant-records) y [Representación de plantas](topic:plant-graphics).

## 8. Cantidades y listados

Más › {{ui:Worksheets}}: los listados de plantas y de pavimentos, y los suyos, siguen vinculados a los objetos; guárdelos como CSV o XLSX o colóquelos en las hojas (consulte [Cuadros de mediciones](topic:worksheets)). Más › {{ui:Plant schedule…}} envía las cantidades a TakeoffCraft. Las cantidades de pavimentos están en las propiedades de pavimentos, muros y escalones. El riego tiene su propia lista de materiales: {{ui:Irrigation}} › **Comprobar el sistema…**. Consulte [Riego](topic:irrigation).

## 9. Planos y hojas

Más › {{ui:Landscape sheets…}}: planos de plantación, explanación y riego, con detalles. {{ui:Levels}} › {{ui:Section line}} dibuja secciones a través del terreno, los muros, las capas de base, los escalones y las plantas. Consulte [Hojas de paisajismo](topic:landscape-sheets) y [Secciones y el conjunto de publicación](topic:landscape-sections).

## 10. Publicar

{{ui:Publish set (.zip)}} en el cuadro de diálogo de hojas crea un PDF con una lista de hojas y un DWG por hoja. Más › {{ui:Export landscape IFC}} entrega a BimCraft las plantas y los pavimentos. Guarde el proyecto: todo está en un solo archivo.

## Cambie una cosa: la escalera

Lo importante de mantener todo en un solo proyecto es que un cambio se propaga. Pruébelo con un tramo de escalones entre dos terrazas:

1. Dibuje la línea del tramo como una línea de elemento (o como una línea del dibujo) y, después, Paisajismo › Más › {{ui:From a line}} › {{ui:Steps}}. En las propiedades de los escalones, marque **Da forma al terreno** y establezca las cotas inferior y superior en las dos terrazas.
2. Dibuje una zona plantada junto al tramo y por debajo de él con {{ui:Areas}}, y pavimento en las terrazas. La zona se recorta sola alrededor de los escalones y del pavimento, y el listado de plantas solo cuenta lo que está plantado.
3. Suba la cota superior del tramo en las propiedades. El terreno proyectado, las cotas puntuales, las flechas de pendiente y el desmonte y terraplén cambian a la vez. Si el tramo ya no llega a la terraza superior, el panel Problemas indica en cuánto.
4. Mueva la línea del tramo. Los escalones siguen su línea en el mismo paso de deshacer; la zona vuelve a recortarse y se vuelve a contar, y los cuadros de mediciones y los listados muestran los nuevos números.
5. Pulse Ctrl+Z una vez: la línea, los escalones, el terreno y la zona vuelven atrás juntos.

Consulte [Modificadores del terreno y cotas en vivo](topic:ground-modifiers), [Zonas plantadas](topic:planted-areas) y [Cuadros de mediciones](topic:worksheets).

## Todavía no implementado

Estas funciones se han solicitado y no están en esta versión:

- Muros que dan forma al terreno (indican dónde se encuentran con él, y su coronación puede seguirlo).
- Edición de su propia lista de plantas de la biblioteca en la aplicación (edite la lista del proyecto y guárdela como archivo de plantas).
- Texturas y colores de sus propios modelos GLB de plantas (se usa la forma; el color que se usa es el de la planta).

Consulte [El espacio de trabajo de Paisajismo](topic:landscape) para todas las herramientas.
