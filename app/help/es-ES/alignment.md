---
title: Trazar una alineación horizontal
summary: Dibuje una alineación por sus PI, defina los radios de las curvas y la estación inicial, mueva los PI y lea los datos de las curvas, la estación y el desplazamiento.
keywords: alineación, sin solución, la curva no cabe, radio máximo, radio mínimo, velocidad de proyecto, solapamiento, eje, PI, curva horizontal, radio, estaciones, tangente, crear alineación, trazado de alineación, PC, PT, estación desplazamiento
from: 8c5df4aa
---

Una alineación en CivilCraft es una cadena de tangentes que pasan por puntos de intersección (PI), con una curva circular en cualquier PI interior que tenga radio. Se numera por estaciones a partir de una estación inicial que usted elige. Un proyecto puede tener muchas alineaciones.

## Dibujar la alineación

1. Pulse {{key:A}}, o haga clic en {{ui:Alineación}} del grupo **Diseño**.
   La indicación dice «Alineación: haga clic en los PI en orden. Intro o doble clic termina, Backspace quita el último, Esc cancela».
2. Haga clic en el primer PI (el inicio de la alineación).
3. Haga clic en cada PI siguiente, en orden. Una línea roja sigue al puntero y muestra la longitud y el rumbo de la tangente que está dibujando, por ejemplo «212.40 ft  N 63°12'05" E».
4. Haga clic en el último PI (el final de la alineación).
5. Pulse {{key:Enter}}.
   La alineación se dibuja con sus estaciones y queda seleccionada. La barra de estado indica, por ejemplo, «Alineación 1: 386.36 ft, curvas de radio 100 ft donde caben. Edite los radios en Propiedades; Perfil (R) para diseñar su rasante».

Mientras dibuja: {{key:Backspace}} quita el último PI, {{key:Esc}} cancela, y arrastrar sobre un espacio vacío desplaza la vista sin añadir un PI.

:::warning
Termine con {{key:Enter}}. El doble clic también termina, pero en esta versión elimina el PI sobre el que hizo doble clic. Haga clic una vez en el último PI y después pulse {{key:Enter}}.
:::

Cada PI interior recibe una curva de 100 ft (30 m en un proyecto en metros), o el radio entero mayor que quepa en la mitad de cada tangente si 100 ft no cabe. Los PI muy agudos o en línea recta no reciben curva.

## Definir radios y coordenadas

Con la alineación seleccionada, el panel derecho muestra **Alineación**:

1. **Nombre** e **Estación inicial**. Escriba una estación como `10+00` (pies) o `0+500` (metros), o como un número simple. Consulte [Unidades, estaciones y formatos numéricos](topic:units-and-stations).
2. **Longitud** y **Estación final** se calculan por usted.
3. La tabla **PI** muestra el **Este** y el **Norte** de cada PI, y un **Radio** para cada PI interior. Escriba un valor nuevo y pulse {{key:Enter}}.
   - Un radio de 0 crea un punto de quiebro sin curva.
   - El primer y el último PI nunca tienen radio.
   - La pequeña x al final de una fila elimina ese PI (una alineación mantiene al menos dos).
4. Lea la lista **Curvas**: para cada curva, sus estaciones PC y PT, el radio R, la deflexión Δ y el sentido (izquierda o derecha), la longitud L, la tangente T, la distancia externa E y la cuerda.
5. La línea bajo las curvas da el rumbo de la primera tangente.

## Cuando una curva no cabe

Si las curvas necesitan más tangente de la que hay entre sus PI, la alineación no tiene solución: no se dibuja correctamente hasta que la corrija, y se omite de las exportaciones LandXML. Un recuadro rojo indica el motivo, en cifras, y ofrece lo que cabría:

- «Las curvas en el PI 2 y el PI 3 necesitan 240.00 ft de tangente entre ambas (130.00 + 110.00), pero los PI están a 180.00 ft de distancia.» — o, cuando solo una de ellas tiene curva, «La curva en el PI 2 necesita 240.00 ft de tangente hacia el PI 1 …».
- Un botón para cada PI fija **el radio mayor que cabe** allí, manteniendo la otra curva como está (también tiene que caber en la otra tangente del PI). Si ambos PI tienen curva, **Ambos** reduce los dos radios en proporción para que apenas se toquen.
- Cuando una sola curva es más larga que la tangente, el recuadro indica que ninguna curva en el otro PI puede caber mientras sea tan grande.
- Un PI que vuelve en línea recta sobre sí mismo no admite curva; el recuadro ofrece **Sin curva en el PI n**.

Cada botón es un solo paso: {{key:Mod+Z}} devuelve los radios a su valor anterior. Los radios que se ofrecen se redondean a la baja a 0.01 para que siempre quepan.

### Un radio mínimo de diseño

Escriba un **Radio mínimo de diseño** (por ejemplo, según su velocidad de proyecto) para comprobar cada curva frente a él; déjelo vacío si no quiere ninguno. Una curva por debajo de él aparece en la lista con un botón para **el radio más pequeño que cumple el mínimo**, cuando ese radio cabe. Cuando no cabe, el recuadro lo indica y da el radio mayor que permiten las tangentes, para que sepa que debe mover un PI o reducir el mínimo.

## Mover PI en el plano

1. Con {{ui:Seleccionar}} activo, haga clic en la alineación para seleccionarla. Aparecen agarres cuadrados en sus PI.
2. Arrastre un agarre. La alineación, sus estaciones, el perfil y el corredor la siguen.
3. Suelte. El movimiento es un solo paso de deshacer.

Añadir un PI entre dos existentes todavía no está disponible: elimine la alineación y vuelva a dibujarla, o escriba nuevas coordenadas para los PI que tenga.

## Leer la estación y el desplazamiento

Mueva el puntero sobre el plano. La barra de estado muestra la alineación más cercana (o la seleccionada) con la estación y el desplazamiento, **L** o **R** mirando hacia estaciones crecientes, por ejemplo «Alineación 1: Est. 2+15.30, desplazamiento 18.42 R». Más allá de cualquiera de los extremos añade «(más allá del extremo)».

## Lo que se dibuja

En el plano, en DXF y en PDF: el eje (tangentes como líneas, curvas como arcos verdaderos), una marca cada 50 ft (20 m) con una marca más larga y una etiqueta de estación cada 100 unidades, y marcas PC y PT con sus estaciones.

## Eliminar una alineación

Selecciónela y pulse {{key:Delete}}, o haga clic en {{ui:Eliminar}} en la barra de herramientas o al pie del panel derecho. Su perfil y su corredor se eliminan con ella. {{key:Mod+Z}} la devuelve.

:::mac
En un teclado de Mac, la tecla marcada como **delete** equivale a {{key:Backspace}} para el navegador y no elimina una selección. Pulse {{key:Delete}} (Fn y delete), o use el botón {{ui:Eliminar}}.
:::

## Siguiente

- [Diseñar un perfil vertical](topic:profile).

## Velocidad y clase de proyecto

En las Propiedades de la alineación, **Velocidad de proyecto** (km/h o mph) y **Clase de proyecto** se conservan con la alineación, se guardan en el proyecto y se escriben en IFC (Pset_RoadDesignCriteriaCommon). CivilCraft no tiene una tabla que relacione una velocidad con un radio mínimo, así que nada se comprueba a partir de ellas: defina **Radio mínimo** según su propia norma de diseño.

## Espirales

Una curva puede tener una espiral de clotoide en cualquiera de sus extremos: tangente, espiral, curva, espiral, tangente. En la tabla de PI, escriba una longitud en **Espiral de entrada** y **Espiral de salida** para un PI que tenga radio. El PI se queda donde está; la curva se desplaza hacia dentro para dejar sitio, de modo que la distancia de tangente crece en el desfase de la espiral. Las dos longitudes pueden ser distintas, y un PI con una sola longitud recibe espiral solo en ese extremo.

La lista de curvas muestra entonces TS, SC, CS y ST (tangente a espiral, espiral a curva, curva a espiral, espiral a tangente) con el ángulo de la espiral θs, las distancias de tangente y la distancia externa. Las estaciones avanzan a lo largo de las espirales como en todo lo demás. Las espirales que juntas giran más que la curva se rechazan, indicando el PI; una espiral más larga de lo que permite la tangente es un solapamiento, como en cualquier curva. El peralte usa la espiral como tramo de transición (consulte [Corredor](topic:corridor)).
