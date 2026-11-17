---
title: Distribución de estacionamiento
summary: Distribuya cajones, pasillos, cajones para personas con discapacidad y para camionetas, y isletas dentro de un contorno; nivele el predio con pendientes hacia coladeras contra el terreno existente, luego pavimente y plante. También disponible para un asistente.
keywords: estacionamiento, cajón, pasillo, accesible, ada, camioneta, isleta, coladera, pendiente, nivelación, corte, relleno, pavimento, adoquines, plantación, árboles, terreno, nube de puntos, mcp, asistente
from: 06c14da9
---

Ajuste un estacionamiento dentro de una parcela, una plataforma o una línea característica cerrada, y obtenga en un solo paso los conteos, la nivelación y la pavimentación.

## Distribuirlo

1. Seleccione en el plano una parcela, una plataforma o una línea característica cerrada.
2. Abra **Superficie, Más, Estacionamiento...**
3. Elija las reglas, el ángulo de cajón (90, 75, 60, 45, 30 grados o paralelo) y pasillos de un sentido o de dos sentidos. Los tamaños de cajón, pasillo e isleta parten de la tabla, y cada uno se puede escribir encima.
4. Elija **Distribuir**.

Las filas corren a lo largo del borde del contorno que da más cajones (o al ángulo que escriba). Un cajón cuenta solo si queda completamente dentro del contorno. Cuando queda espacio para una fila y un pasillo, se agrega una franja de cajones de un solo lado. La ventana enumera los espacios, los espacios accesibles y para camionetas, las isletas, las coladeras y el área por espacio, y el plano muestra los cajones, los espacios accesibles con sus pasillos de acceso rayados, las isletas, los ejes de pasillos y las coladeras en sus propias capas (C-PARK-...), para que pasen a PDF, DXF y DWG.

## Espacios accesibles

Con las reglas de Estados Unidos, el conteo sigue la tabla 208.2 de los Estándares ADA 2010 para los espacios previstos (uno de cada seis, redondeado hacia arriba, es un espacio para camioneta), colocados lo más cerca posible de la primera esquina del contorno (la entrada), cada uno con un pasillo de acceso; dos comparten uno. Un cajón más angosto que el ancho accesible, o una pendiente más pronunciada que 1:48 en los espacios accesibles, se muestra como problema. **Estos números se escribieron de memoria a partir del estándar y no se han verificado contra el estándar impreso.** Los tamaños típicos de cajón y pasillo provienen de guías de diseño de estacionamientos y también están sin verificar. Revise ambos, y su código local, antes de confiar en ellos. Elija **Personalizado** para escribir su propio conteo de accesibles.

## Pendientes hacia coladeras, corte y relleno

Salvo que lo desactive, el estacionamiento se convierte en un área de nivelación en el espacio de trabajo Paisajismo. Las coladeras se colocan sobre los ejes de los pasillos cada 100 pies (30 m) aproximadamente; la superficie sube desde cada coladera con la pendiente que dé (1.5 por ciento al inicio), de modo que cada punto cae hacia su coladera más cercana. El nivel se elige para que el corte y el relleno del estacionamiento se equilibren con el terreno existente. El terreno existente es la superficie existente del proyecto, que puede venir de puntos de levantamiento, de LandXML, de una nube de puntos de lidar o de escaneo convertida en superficie, o de curvas de nivel. La ventana muestra la estimación de corte y relleno; los volúmenes del proyecto dan después la cifra exacta. El área de nivelación conserva su borde sobre el terreno existente, así que donde la nueva superficie difiere del terreno en el borde aparece un escalón, y la ventana indica qué tan grande es.

## Pavimentación y plantación

Todo el contorno recibe una pavimentación de adoquín (un patrón a soga que puede cambiar en Paisajismo, Elementos duros), y cada isleta recibe una cama de arbustos y, donde es lo bastante ancha, un árbol, tomados de la lista de plantas. Después, todo es un objeto normal de Paisajismo: edítelo, o elija **Distribuir de nuevo** para reemplazar lo que creó el estacionamiento. Quitar el estacionamiento quita lo que creó.

## Desde un asistente

El mismo estacionamiento se puede pedir por MCP: `parking_layout` muestra una vista previa, `parking_build` escribe, `parking_remove` quita un estacionamiento. Pida por nombre de parcela o envíe el contorno.

## Lo que no está hecho

No se verifica si los pasillos llegan a una calle. La pavimentación cubre todo el contorno, así que su área incluye las isletas. Las opciones de material de pavimento de la Biblioteca y un tipo de la Biblioteca para los cajones no están construidos; el patrón de pavimento es el de Elementos duros. No se han construido reglas de otros países.
