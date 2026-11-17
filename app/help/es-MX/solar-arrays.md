---
title: Colocar arreglos solares en el terreno
summary: Coloque mesas solares montadas en el suelo dentro de una parcela o plataforma, con las filas espaciadas según el terreno sobre el que se apoya cada una, deje vacío el terreno empinado, calcule la energía del año y muestre las mesas en el plano y en 3D.
keywords: solar, fotovoltaica, FV, arreglo, montaje en suelo, mesas, filas, separación de filas, sombra, terreno, pendiente, pilotes, rendimiento, kWp, energía, horizonte
from: 95593fd6
---

## Qué aprenderá

Cómo distribuir un campo de mesas solares en un sitio que no es plano, y qué significan los números. Ábralo desde Superficie › Más › Arreglos solares.

## Distribuya las mesas

1. Elija **Ubicación**: una parcela o una plataforma del proyecto, o escriba las esquinas de un área. Marque las plataformas o parcelas que deben quedar **vacías** (un edificio, un estanque).
2. Escriba la **latitud y longitud** del sitio. El sol depende de ellas; nada se supone. Si el proyecto tiene un sistema de coordenadas, **Tomar del sistema de coordenadas** las completa.
3. Defina la inclinación, la orientación (en blanco es hacia el ecuador), cuántos módulos forman una mesa y la potencia y el tamaño del módulo. Los valores de los módulos empiezan como valores genéricos y así están rotulados; escriba los suyos.
4. Pulse **Distribuir mesas**. La ventana indica el número de mesas y de módulos, el tamaño en kWp y la distancia de fila a fila.

Cada mesa es una columna en el área, colocada desde el frente y recorrida hacia atrás. Una mesa se coloca solo donde el terreno bajo ella está dentro del límite de pendiente, dentro del área y del retiro, y donde los pilotes que necesita no son más altos que el límite que usted fijó. Los lugares que no cumplen quedan vacíos, y la ventana indica cuántos son y por qué.

## Las filas se separan según el terreno

En terreno plano las filas se separan según la regla habitual de no sombrear: la sombra de una fila al mediodía del solsticio de invierno no debe llegar al borde inferior de la fila siguiente. En una pendiente, CivilCraft aplica la misma regla al terreno sobre el que realmente se apoya la siguiente fila. Donde el terreno sube detrás de una mesa, las filas pueden quedar más juntas; donde baja, quedan más separadas. La ventana muestra la separación mínima, la máxima y la media junto a la separación en terreno plano, para que vea lo que hizo el terreno.

El plano de una mesa se eleva sobre pilotes hasta que cada muestra bajo ella quede libre del terreno por la holgura que usted fijó. El pilote más alto aparece en el resultado.

## La energía del año

**Energía del año** calcula la luz sobre el plano inclinado para un día representativo de cada mes, la temperatura de las celdas, las pérdidas que usted escribió, el sombreado de las mesas entre sí y las colinas del horizonte que quitan el sol que ocultan. El cielo es despejado, así que el resultado es un límite superior; el clima real da menos. Es una estimación de diseño temprano, no un informe de rendimiento.

## Guárdelo

**Guardar en el proyecto** conserva los datos de entrada y los resultados en el archivo del proyecto; las mesas se recalculan a partir del terreno al abrir el archivo, así que una superficie modificada las mueve. Se muestran en el plano y en 3D (Mostrar › Arreglos solares). La lista de mesas se descarga como CSV. Un paso de deshacer elimina o restaura un arreglo.

## Aún no disponible

Datos meteorológicos en lugar del cielo despejado, mesas que siguen el terreno en la dirección este–oeste, seguidores solares, y el diseño eléctrico (cadenas, cableado, inversores) en CivilCraft. El panel Solar PV de BimCraft tiene cadenas y el unifilar para techos.
