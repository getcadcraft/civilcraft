---
title: Diseñe un jardín, de principio a fin
summary: Los diez pasos del arquitecto paisajista, desde el levantamiento hasta el juego publicado, con lo que hace hoy el espacio de trabajo de paisajismo en cada uno y lo que todavía no hace.
keywords: tutorial, recorrido, cómo hacerlo, diseño de jardines, diseño paisajístico, primeros pasos, ejemplo, muestra, paso a paso, levantamiento, geometría, terreno, plantación, cuadro, hojas, publicar, un proyecto
from: 87900bf5
---

Un diseño de paisajismo da vueltas: levantamiento, boceto, geometría, terreno, áreas, cotas, plantación, cuadros, hojas, y de nuevo. Estos son los diez pasos, con lo que existe para cada uno. Cuando un paso tiene un faltante, se indica en **Todavía no construido**, al final, y no se oculta dentro del paso.

Puede seguir el ejemplo del sitio de muestra, o su propio dibujo de levantamiento. Con el suyo, comience en el paso 1.

## 1. Traiga el levantamiento

{{ui:Superficie}} › {{ui:Geometría de un dibujo…}}, elija el dibujo del levantamiento (DWG 2000–2018 o DXF). Revise las unidades, tome las curvas de nivel, las polilíneas 3D y el límite para la superficie, y los bloques de puntos como puntos de levantamiento. La sección **Cotas del levantamiento y revisión** lee las cotas escritas como texto o como atributo y enumera lo que parece incorrecto (unidades, sistema de coordenadas, distancia al cero, curvas planas, cotas extrañas, puntos duplicados) antes de que agregue nada. Vea [Revisar un dibujo de levantamiento al importar](topic:survey-check) y [Abrir un DWG o DXF como geometría](topic:open-dwg-dxf). Defina el sistema de coordenadas con {{ui:Sistema de coordenadas…}}.

## 2. Bocetos a mano

Una hoja en papel, como un levantamiento antiguo o una copia marcada, entra con {{ui:Escanear…}} (Empezar desde un escaneo): se coloca a escala o en coordenadas conocidas bajo el plano, y puede calcarse como geometría. ModelCraft lee una foto de un boceto a mano (Archivo › Importar una foto de boceto…). CivilCraft no tiene una herramienta para un boceto a mano: coloque la hoja bajo el plano y dibuje sobre ella.

## 3. Del boceto a la geometría

Dibuje líneas características y contornos sobre el levantamiento en CivilCraft, o dibújelos en el dibujo 2D. Paisajismo › Más › {{ui:Desde una línea}} convierte una línea en pavimento, un área plantada, un muro, escalones, una línea característica y más, vinculados: al mover la línea, el objeto la sigue. Vea [Objetos desde la geometría](topic:objects-from-lines). En SuperCad Studio, abra el sitio, el dibujo y el modelo del edificio en un solo proyecto: el espacio de trabajo **Paisajismo** tiene las herramientas de todos ellos, y una línea elegida en el dibujo 2D puede convertirse en un objeto de paisajismo que la sigue (Ctrl+K, {{ui:Objeto de paisajismo desde la línea elegida del dibujo}}).

## 4. El terreno propuesto

Abra {{ui:Superficie}} › {{ui:Más}} › {{ui:Espacio de trabajo de paisajismo}}. Construya el terreno propuesto con {{ui:Plataforma}}, {{ui:Berma}}, {{ui:Cuneta vegetada}} y áreas de nivelación con cotas puntuales y curvas de nivel; los pavimentos, senderos, muros, rampas y escalones que agregue se nivelan dentro de la misma superficie propuesta. El terreno existente nunca cambia. {{ui:Cotas}} › {{ui:Modificadores del terreno…}} enumera todo lo que da forma al terreno en un solo orden, con corte y relleno para cada uno. Vea [Nivelación](topic:landscape-grading) y [Modificadores del terreno y cotas en vivo](topic:ground-modifiers).

## 5. Pavimentos y áreas plantadas

{{ui:Elementos duros}} › {{ui:Pavimento}}, {{ui:Sendero}}, {{ui:Muro}}, {{ui:Guarnición}}, {{ui:Rampa}} y {{ui:Escalones}}. {{ui:Áreas}} dibuja un césped, un arriate, una pradera o un cubresuelo con su composición de capas; se recorta sola alrededor de pavimentos, muros y escalones. {{ui:Arriate}} llena un área con el espaciamiento de las plantas, a partir de una mezcla de plantas. Vea [Elementos duros](topic:hardscape), [Áreas plantadas](topic:planted-areas) y [Plantación](topic:planting).

## 6. Niveles, pendientes y uniones

En **Comprobaciones de nivelación**, marque **Análisis de pendientes** y **Flechas de flujo y encharcamiento**. Si el agua se encharca contra una terraza, agregue una {{ui:Cuneta vegetada}} alrededor. Las propiedades le indican cuántas contrahuellas necesitan los escalones y si caben, y dónde un sendero es más empinado que su límite. El panel de Problemas enumera dónde los objetos se encuentran mal: un muro sobrepasado, un arriate por encima del pavimento, escalones que no llegan a su descanso. {{ui:Cota puntual}} y {{ui:Flecha de pendiente}} rotulan el terreno y se actualizan solos.

## 7. Plantación

En **Plantas**, busque en la lista de plantas (unas pocas centenas de especies, o su propia lista), elija una y {{ui:Planta}}, {{ui:Arriate}} o {{ui:Seto}}. Defina el tamaño y las etiquetas de la planta desde Más. Más › {{ui:Tabla de plantas}} edita sus propios registros: cultivares, tamaños suministrados, densidad y notas de especificación. Cada registro puede llevar su propio símbolo y modelo 3D (OBJ, STL o GLB), y Más › {{ui:Gráficos de plantas}} dibuja las plantas más simples a escalas más gruesas. Vea [La lista de plantas](topic:plant-list), [Registros de plantas](topic:plant-records) y [Gráficos de plantas](topic:plant-graphics).

## 8. Cantidades y cuadros

Más › {{ui:Hojas de cálculo}}: los cuadros de plantas y de elementos duros, y los suyos, siguen vinculados a los objetos; guárdelos como CSV o XLSX, o colóquelos en las hojas (vea [Hojas de cálculo](topic:worksheets)). Más › {{ui:Cuadro de plantas…}} envía los conteos a TakeoffCraft. Las cantidades de los elementos duros están en las propiedades de pavimento, muro y escalones. Riego tiene su propia lista de materiales: {{ui:Riego}} › **Revisar el sistema…**. Vea [Riego](topic:irrigation).

## 9. Dibujos y hojas

Más › {{ui:Hojas de paisaje…}}: planos de plantación, nivelación y riego, con detalles. {{ui:Cotas}} › {{ui:Línea de sección}} dibuja secciones a través del terreno, los muros, las composiciones de capas, los escalones y las plantas. Vea [Hojas de paisaje](topic:landscape-sheets) y [Secciones y el juego de publicación](topic:landscape-sections).

## 10. Publicar

{{ui:Publicar juego (.zip)}} en el cuadro de diálogo de hojas genera un PDF con una lista de hojas y un DWG por hoja. Más › {{ui:Exportar IFC de paisajismo}} entrega a BimCraft las plantas y los elementos duros. Guarde el proyecto: todo está en un solo archivo.

## Cambie una cosa: la escalera

La idea de mantener todo en un solo proyecto es que un cambio se propague. Pruébelo con un tramo de escalones entre dos terrazas:

1. Dibuje la línea del tramo como línea característica (o como línea en el dibujo) y luego Paisajismo › Más › {{ui:Desde una línea}} › {{ui:Escalones}}. En las propiedades de los escalones marque **Da forma al terreno** y defina los niveles inferior y superior en las dos terrazas.
2. Dibuje un arriate con plantas junto y debajo del tramo con {{ui:Áreas}}, y pavimento en las terrazas. El arriate se recorta solo alrededor de los escalones y del pavimento, y el cuadro de plantas cuenta solo lo que está plantado.
3. Suba el nivel superior del tramo en Propiedades. El terreno propuesto, las cotas puntuales, las flechas de pendiente y el corte y relleno cambian de inmediato. Si el tramo ya no llega a la terraza superior, el panel de Problemas indica por cuánto.
4. Mueva la línea del tramo. Los escalones siguen su línea en el mismo paso de deshacer; el arriate se recorta de nuevo y se recuenta, y las hojas de cálculo y los cuadros muestran los nuevos números.
5. Presione Ctrl+Z una vez: la línea, los escalones, el terreno y el arriate regresan juntos.

Vea [Modificadores del terreno y cotas en vivo](topic:ground-modifiers), [Áreas plantadas](topic:planted-areas) y [Hojas de cálculo](topic:worksheets).

## Todavía no construido

Estas funciones se han pedido y no están en esta versión:

- Muros que den forma al terreno (indican dónde lo tocan y su parte superior puede seguirlo).
- Editar su propia lista de plantas de la biblioteca en la app (edite la lista del proyecto y guárdela como archivo de plantas).
- Texturas y colores de sus propios modelos GLB de plantas (se usa la forma; se usa el color de la planta).

Vea [El espacio de trabajo de paisajismo](topic:landscape) para cada herramienta.
