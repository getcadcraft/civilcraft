---
title: Disponer campos solares sobre el terreno
summary: Colocar mesas solares montadas en el suelo dentro de una parcela o plataforma, con las filas separadas según el terreno que realmente ocupa cada una, dejando vacío el terreno empinado, calculando la energía del año y mostrando las mesas en el plano y en 3D.
keywords: solar, PV, fotovoltaica, campo, montaje en suelo, mesas, filas, separación entre filas, sombra, terreno, pendiente, pilotes, producción, kWp, energía, horizonte
from: 95593fd6
---

## Qué aprenderá

Cómo disponer un campo de mesas solares en un emplazamiento que no es llano, y qué significan los números. Ábrala desde Superficie › Más › Campos solares.

## Disponer las mesas

1. Elija **Ubicación**: una parcela o una plataforma del proyecto, o escriba las esquinas de una zona. Marque las plataformas o parcelas que deben quedar **vacías** (un edificio, un estanque).
2. Escriba la **latitud y la longitud** del emplazamiento. El sol depende de ellas; no se estima nada. Si el proyecto tiene un sistema de coordenadas, **Situar desde el sistema de coordenadas** las rellena.
3. Defina la inclinación, la orientación (en blanco equivale a hacia el ecuador), cuántos módulos forman una mesa y la potencia y el tamaño del módulo. Los datos del módulo empiezan como valores genéricos y así están indicados; introduzca los suyos.
4. Pulse **Disponer mesas**. La ventana muestra el número de mesas y de módulos, el tamaño en kWp y la distancia entre filas.

Cada mesa es una columna en la zona, colocada desde el frente y desplazada hacia atrás. Una mesa solo se coloca donde el terreno bajo ella está dentro del límite de pendiente, dentro de la zona y del retranqueo, y donde los pilotes que necesita no superan el límite que haya definido. Los puntos que no cumplen quedan vacíos, y la ventana indica cuántos son y por qué.

## Las filas se separan según el terreno

En terreno llano, las filas se separan según la regla habitual de no sombreado: la sombra de una fila al mediodía del solsticio de invierno no debe alcanzar el borde inferior de la fila siguiente. En una pendiente, CivilCraft aplica la misma regla al terreno donde se apoya realmente la fila siguiente. Donde el terreno sube detrás de una mesa, las filas pueden estar más juntas; donde baja, quedan más separadas. La ventana muestra la separación mínima, la máxima y la media junto a la separación en terreno llano, para que vea el efecto del relieve.

El plano de cada mesa se eleva sobre pilotes hasta que todos los puntos de muestra bajo ella quedan libres del terreno con la altura libre que defina. El pilote más alto aparece en el resultado.

## Energía anual

**Energía anual** calcula la radiación sobre el plano inclinado para un día representativo de cada mes, la temperatura de las células, las pérdidas introducidas, el sombreado mutuo de las mesas y las colinas del horizonte que tapan el sol. El cielo es despejado, así que el resultado es un límite superior; el tiempo real da menos. Es una estimación preliminar de diseño, no un informe de producción.

## Conservarlo

**Guardar en el proyecto** conserva los datos de entrada y los resultados en el archivo del proyecto; las mesas se recalculan a partir del terreno al abrir el archivo, así que una superficie modificada las desplaza. Se muestran en el plano y en 3D (Mostrar › Campos solares). La lista de mesas se descarga en CSV. Un paso de deshacer elimina o restaura un campo.

## Aún no disponible

Datos meteorológicos en lugar del cielo despejado, mesas que siguen el terreno en dirección este-oeste, seguidores solares y el diseño eléctrico (cadenas de módulos, cableado, inversores) en CivilCraft. El panel Solar PV de BimCraft incluye las cadenas de módulos y el esquema unifilar para cubiertas.
