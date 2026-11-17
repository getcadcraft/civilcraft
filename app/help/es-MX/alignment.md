---
title: Trazar una alineación horizontal
summary: Dibuje una alineación por sus PI, defina los radios de curva y la estación inicial, mueva PI, y lea los datos de curva, la estación y el desfase.
keywords: alineación, sin solución, la curva no cabe, radio mayor, radio menor, radio mínimo, velocidad de diseño, superposición, eje, PI, curva horizontal, radio, cadenamiento, tangente, crear alineación, trazado de alineación, PC, PT, desfase de estación
from: 8c5df4aa
---

Una alineación en CivilCraft es una cadena de tangentes unidas por puntos de intersección (PI), con una curva circular en cada PI interior que tenga radio. Se numera con cadenamiento desde una estación inicial que usted elige. Un proyecto puede contener muchas alineaciones.

## Dibujar la alineación

1. Pulse {{key:A}}, o haga clic en {{ui:Alineación}} en el grupo **Diseño**.
   La sugerencia dice "Alineación: haga clic en los PI en orden. Enter o doble clic termina, Backspace quita el último, Esc cancela."
2. Haga clic en el primer PI (el inicio de la alineación).
3. Haga clic en cada PI siguiente, en orden. Una línea roja sigue al puntero y muestra la longitud y el rumbo de la tangente que está dibujando, por ejemplo "212.40 ft  N 63°12'05" E".
4. Haga clic en el último PI (el final de la alineación).
5. Pulse {{key:Enter}}.
   La alineación se dibuja con cadenamiento y queda seleccionada. La barra de estado dice, por ejemplo, "Alineación 1: 386.36 ft, curvas de radio 100 ft donde quepan. Edite los radios en Propiedades; Perfil (R) para diseñar su pendiente."

Mientras dibuja: {{key:Backspace}} quita el último PI, {{key:Esc}} cancela, y arrastrar sobre un espacio vacío encuadra la vista sin agregar un PI.

:::warning
Termine con {{key:Enter}}. El doble clic también termina, pero en esta versión elimina el PI en el que hizo doble clic. Haga clic una vez en el último PI y luego pulse {{key:Enter}}.
:::

Cada PI interior recibe una curva de 100 ft (30 m en un proyecto en metros), o el radio entero mayor que quepa en la mitad de cada tangente si 100 ft no cabe. Los PI muy agudos o en línea recta no reciben curva.

## Definir radios y coordenadas

Con la alineación seleccionada, el panel derecho muestra **Alineación**:

1. **Nombre** y **Estación inicial**. Escriba una estación como `10+00` (pies) o `0+500` (metros), o como número simple. Vea [Unidades, estaciones y formatos numéricos](topic:units-and-stations).
2. **Longitud** y **Estación final** se calculan por usted.
3. La tabla **PI** lista el **Este** y el **Norte** de cada PI, y un **Radio** para cada PI interior. Escriba un valor nuevo y pulse {{key:Enter}}.
   - Un radio de 0 crea un punto angular sin curva.
   - El primer y el último PI nunca tienen radio.
   - La x pequeña al final de una fila quita ese PI (una alineación conserva al menos dos).
4. Lea la lista **Curvas**: para cada curva, sus estaciones PC y PT, el radio R, la deflexión Δ y el sentido (izquierda o derecha), la longitud L, la tangente T, la externa E y la cuerda.
5. La línea debajo de las curvas indica el rumbo de la primera tangente.

## Cuando una curva no cabe

Si las curvas necesitan más tangente de la que hay entre sus PI, la alineación no tiene solución: no se dibuja correctamente hasta que la corrija, y se omite de las exportaciones LandXML. Un cuadro rojo indica el motivo, en números, y ofrece lo que sí cabría:

- "Las curvas en el PI 2 y el PI 3 necesitan 240.00 ft de tangente entre ellas (130.00 + 110.00), pero los PI están a 180.00 ft de distancia." — o, cuando solo una tiene curva, "La curva en el PI 2 necesita 240.00 ft de tangente hacia el PI 1 …".
- Un botón por cada PI establece **el radio mayor que quepa** allí, manteniendo la otra curva como está (también debe caber en la otra tangente del PI). Cuando ambos PI tienen curvas, **Ambos** reduce los dos radios en proporción para que apenas se toquen.
- Cuando una sola curva ya es más larga que la tangente, el cuadro indica que ninguna curva en el otro PI puede caber mientras sea tan grande.
- Un PI que regresa en línea recta no puede recibir curva; el cuadro ofrece **Sin curva en el PI n**.

Cada botón es un solo paso: {{key:Mod+Z}} devuelve los radios. Los radios ofrecidos se redondean hacia abajo a 0.01 para que siempre quepan.

### Un radio mínimo de diseño

Escriba un **Radio mínimo de diseño** (por ejemplo, según su velocidad de diseño) para que cada curva se compare con él; déjelo vacío si no quiere ninguno. Una curva menor que él aparece en la lista con un botón para **el radio menor que cumple el mínimo**, cuando ese radio cabe. Cuando no cabe, el cuadro lo indica y da el radio mayor que permiten las tangentes, para que mueva un PI o baje el mínimo.

## Mover PI en la planta

1. Con {{ui:Seleccionar}} activo, haga clic en la alineación para seleccionarla. Aparecen pinzamientos cuadrados en sus PI.
2. Arrastre un pinzamiento. La alineación, su cadenamiento, su perfil y su obra lineal lo siguen.
3. Suelte. El movimiento es un solo paso de deshacer.

Agregar un PI entre dos existentes todavía no está disponible: elimine la alineación y dibújela de nuevo, o escriba nuevas coordenadas para los PI que tiene.

## Leer estación y desfase

Mueva el puntero sobre la planta. La barra de estado muestra la alineación más cercana (o la seleccionada) con la estación y el desfase, **L** o **R** mirando hacia adelante en estación, por ejemplo "Alineación 1: Est 2+15.30, desfase 18.42 R". Más allá de cualquiera de los extremos agrega "(más allá del final)".

## Qué se dibuja

En la planta, en DXF y en PDF: el eje (tangentes como líneas, curvas como arcos verdaderos), una marca cada 50 ft (20 m) con una marca más larga y una etiqueta de estación cada 100 unidades, y marcas PC y PT con sus estaciones.

## Eliminar una alineación

Selecciónela y pulse {{key:Delete}}, o haga clic en {{ui:Eliminar}} en la barra de herramientas o al pie del panel derecho. Su perfil y su obra lineal se eliminan con ella. {{key:Mod+Z}} la restaura.

:::mac
En un teclado de Mac, la tecla marcada **delete** equivale a {{key:Backspace}} en el navegador y no elimina una selección. Pulse {{key:Delete}} (Fn y delete), o use el botón {{ui:Eliminar}}.
:::

## Siguiente

- [Diseñe un perfil vertical](topic:profile).

## Velocidad y clase de diseño

En las Propiedades de la alineación, **Velocidad de diseño** (km/h o mph) y **Clase de diseño** se guardan con la alineación, se conservan en el proyecto y se escriben en IFC (Pset_RoadDesignCriteriaCommon). CivilCraft no tiene una tabla que relacione una velocidad con un radio mínimo, así que nada se verifica a partir de ellas: establezca el **Radio mínimo** según su propia norma de diseño.

## Espirales

Una curva puede tener una espiral clotoide en cualquiera de sus extremos: tangente, espiral, curva, espiral, tangente. En la tabla de PI, escriba una longitud en **Espiral de entrada** y **Espiral de salida** para un PI que tenga radio. El PI se queda donde está; la curva se acerca para dar espacio, de modo que la distancia de tangente crece en el desfase de la espiral. Las dos longitudes pueden ser distintas, y un PI con solo una longitud recibe espiral únicamente en ese extremo.

La lista de curvas muestra entonces TS, SC, CS y ST (tangente a espiral, espiral a curva, curva a espiral, espiral a tangente) con el ángulo de la espiral θs, las distancias de tangente y la distancia externa. Las estaciones avanzan por las espirales como en todo lo demás. Las espirales que juntas giran más que la curva se rechazan, indicando el PI; una espiral más larga que la tangente permite es una superposición, como en cualquier curva. El peralte usa la espiral como su transición (vea [Obra lineal](topic:corridor)).
