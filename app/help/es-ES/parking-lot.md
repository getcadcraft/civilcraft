---
title: Trazado de un aparcamiento
summary: Trace plazas, pasillos, plazas accesibles y para furgonetas, e isletas dentro de un contorno; nivele el aparcamiento con pendientes hacia desagües respecto al terreno existente; después pavimente y plante. También disponible para un asistente.
keywords: aparcamiento, plaza, pasillo, accesible, ada, furgoneta, isleta, desagüe, pendiente, rasante, desmonte, terraplén, pavimento, adoquines, plantación, árboles, terreno, nube de puntos, mcp, asistente
from: 06c14da9
---

Ajuste un aparcamiento a una parcela, una plataforma o una línea de elemento cerrada, y obtenga en un solo paso los recuentos, la nivelación y el pavimento.

## Trazarlo

1. Seleccione una parcela, una plataforma o una línea de elemento cerrada en el plano.
2. Abra **Superficie, Más, Aparcamiento...**
3. Elija las reglas, el ángulo de las plazas (90, 75, 60, 45, 30 grados o en línea) y pasillos de un sentido o de dos sentidos. Los tamaños de plaza, pasillo e isleta parten de la tabla y cada uno puede sobrescribirse.
4. Elija **Trazar**.

Las filas siguen el borde del contorno que da más plazas (o el ángulo que escriba). Una plaza cuenta solo si queda por completo dentro del contorno. Cuando queda espacio para una fila y un pasillo, se añade una franja de una sola fila. La ventana enumera los espacios, las plazas accesibles y para furgonetas, las isletas, los desagües y la superficie por plaza, y el plano muestra las plazas, las plazas accesibles con sus pasillos de acceso rayados, las isletas, los ejes de los pasillos y los desagües en sus propias capas (C-PARK-...), para que lleguen a PDF, DXF y DWG.

## Plazas accesibles

Con las normas de Estados Unidos, el recuento sigue la tabla 208.2 de las Normas ADA 2010 para las plazas previstas (una de cada seis, redondeando hacia arriba, es una plaza para furgonetas), colocadas lo más cerca posible de la primera esquina del contorno (la entrada), cada una con un pasillo de acceso; dos comparten uno. Una plaza más estrecha que el ancho accesible, o una pendiente superior a 1:48 en las plazas accesibles, se muestra como problema. **Estas cifras se escribieron a partir de la norma de memoria y no se han comprobado con la norma impresa.** Los tamaños típicos de plaza y pasillo proceden de guías de diseño de aparcamientos y tampoco están comprobados. Compruebe ambos, y su normativa local, antes de confiar en ellos. Elija **Personalizado** para introducir su propio recuento de plazas accesibles.

## Pendientes hacia desagües, desmonte y terraplén

Salvo que lo desactive, el aparcamiento se convierte en una zona de nivelación en el espacio de trabajo Paisajismo. Los desagües se colocan sobre los ejes de los pasillos cada 100 feet (30 m) aproximadamente; la superficie sube desde cada desagüe con la pendiente que indique (1,5 por ciento al inicio), de modo que cada punto desciende hacia su desagüe más cercano. La cota se elige para que el desmonte y el terraplén del aparcamiento se equilibren sobre el terreno existente. El terreno existente es la superficie existente del proyecto, que puede proceder de puntos topográficos, de un LandXML, de una nube de puntos de lidar o de escáner convertida en superficie, o de curvas de nivel. La ventana muestra la estimación de desmonte y terraplén; los volúmenes del proyecto dan después la cifra exacta. La zona de nivelación mantiene su borde sobre el terreno existente, así que donde la nueva superficie difiere del terreno en el borde aparece un escalón, y la ventana indica su tamaño.

## Pavimento y plantación

Todo el contorno recibe un pavimento de adoquines (un aparejo a soga que puede cambiar en Paisajismo, Elementos duros) y cada isleta recibe un parterre de arbustos y, si es lo bastante ancha, un árbol, tomados de la lista de plantas. Después, todo es un objeto normal de Paisajismo: edítelo, o elija **Volver a trazar** para sustituir lo que creó el aparcamiento. Al eliminar el aparcamiento se elimina lo que creó.

## Desde un asistente

El mismo aparcamiento puede pedirse por MCP: `parking_layout` hace una vista previa, `parking_build` escribe, `parking_remove` lo elimina. Pida por nombre de parcela o envíe el contorno.

## Lo que no está hecho

No se comprueba si los pasillos llegan a una calle. El pavimento cubre todo el contorno, así que su superficie incluye las isletas. Los materiales de pavimento de la Biblioteca y un tipo de Biblioteca para las plazas no están construidos; el patrón de pavimento es el de Elementos duros. No hay normas de otros países.
