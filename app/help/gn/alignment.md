---
title: Diseñar un trazado horizontal
summary: Dibujá un trazado por sus PI, fijá los radios de curva y la estación inicial, moviá los PI y leé los datos de curva y la estación y el desfase.
keywords: trazado, sin solución, curva no entra, radio mayor, radio menor, radio mínimo, velocidad de diseño, superposición, eje, pi, curva horizontal, radio, estacionado, tangente, crear trazado, diseño de trazado, pc, pt, estación desfase
from: 8c5df4aa
---

Un trazado en CivilCraft es una cadena de tangentes unidas por puntos de intersección (PI), con una curva circular en cada PI interior que tenga radio. Va estacionado desde una estación inicial que elegís. Un proyecto puede tener muchos trazados.

## Dibujar el trazado

1. Apretá {{key:A}}, o hacé clic en {{ui:Trazado}} del grupo **Diseño**.
   La ayuda dice "Trazado: hacé clic en los PI en orden. Enter o doble clic termina, Backspace quita el último, Esc cancela."
2. Hacé clic en el primer PI (el inicio del trazado).
3. Hacé clic en cada PI siguiente, en orden. Una línea roja sigue al puntero y muestra la longitud y el rumbo de la tangente que estás dibujando, por ejemplo "212.40 ft  N 63°12'05" E".
4. Hacé clic en el último PI (el final del trazado).
5. Apretá {{key:Enter}}.
   El trazado queda dibujado con estacionado y seleccionado. La barra de estado dice, por ejemplo, "Trazado 1: 386.36 ft, curvas de radio 100 ft donde entran. Editá los radios en Propiedades; Perfil (R) para diseñar su pendiente."

Mientras dibujás: {{key:Backspace}} quita el último PI, {{key:Esc}} cancela, y arrastrar sobre un espacio vacío desplaza la vista sin agregar un PI.

:::warning
Terminá con {{key:Enter}}. El doble clic también termina, pero en esta versión quita el PI sobre el que hiciste doble clic. Hacé clic una vez en el último PI y después apretá {{key:Enter}}.
:::

Cada PI interior recibe una curva de 100 ft (30 m en un proyecto en metros), o el radio entero más grande que entre en la mitad de cada tangente si 100 ft no entra. Los PI muy agudos o de paso recto no reciben curva.

## Fijar radios y coordenadas

Con el trazado seleccionado, el panel derecho muestra **Trazado**:

1. **Nombre** y **Estación inicial**. Escribí una estación como `10+00` (ft) o `0+500` (metros), o como un número simple. Ver [Unidades, estaciones y formatos de número](topic:units-and-stations).
2. **Longitud** y **Estación final** se calculan solos.
3. La tabla de **PI** muestra el **Este** y el **Norte** de cada PI, y un **Radio** para cada PI interior. Escribí un valor nuevo y apretá {{key:Enter}}.
   - Un radio de 0 hace un punto de ángulo sin curva.
   - El primer y el último PI nunca tienen radio.
   - La x pequeña al final de una fila quita ese PI (un trazado mantiene al menos dos).
4. Leé la lista de **Curvas**: para cada curva, sus estaciones PC y PT, radio R, deflexión Δ y dirección (izquierda o derecha), longitud L, tangente T, externa E y cuerda.
5. La línea debajo de las curvas da el rumbo de la primera tangente.

## Cuando una curva no entra

Si las curvas necesitan más tangente de la que hay entre sus PI, el trazado no tiene solución: no se dibuja bien hasta que lo corrijas, y queda fuera de las exportaciones de LandXML. Un cuadro rojo dice por qué, con números, y ofrece lo que entraría:

- "Las curvas en el PI 2 y el PI 3 necesitan 240.00 ft de tangente entre ellas (130.00 + 110.00), pero los PI están a 180.00 ft." — o, cuando solo una tiene curva, "La curva en el PI 2 necesita 240.00 ft de tangente hacia el PI 1 …".
- Un botón por cada PI fija **el radio mayor que entra** ahí con la otra curva como está (también tiene que entrar en la otra tangente del PI). Cuando ambos PI tienen curva, **Ambos** reduce los dos radios en proporción para que justo se toquen.
- Cuando una sola curva es más larga que la tangente, el cuadro dice que ninguna curva en el otro PI puede entrar mientras sea tan grande.
- Un PI que vuelve en línea recta no puede tener curva; el cuadro ofrece **Sin curva en el PI n**.

Cada botón es un paso: {{key:Mod+Z}} devuelve los radios. Los radios ofrecidos se redondean hacia abajo a 0.01 para que siempre entren.

### Un radio mínimo de diseño

Escribí un **Radio mínimo de diseño** (por ejemplo según tu velocidad de diseño) para que cada curva se verifique contra él; dejalo vacío si no querés ninguno. Una curva por debajo aparece en la lista con un botón para **el radio más chico que cumple el mínimo**, cuando ese radio entra. Cuando no entra, el cuadro lo dice y da el radio mayor que permiten las tangentes, para que sepas que tenés que mover un PI o bajar el mínimo.

## Mover PI en el plano

1. Con {{ui:Seleccionar}} activo, hacé clic en el trazado para seleccionarlo. Aparecen agarraderas cuadradas en sus PI.
2. Arrastrá una agarradera. El trazado, su estacionado, perfil y corredor lo siguen.
3. Soltá. El movimiento es un paso de deshacer.

Agregar un PI entre dos existentes todavía no está disponible: eliminá el trazado y dibujalo de nuevo, o escribí coordenadas nuevas para los PI que tenés.

## Leer estación y desfase

Mové el puntero sobre el plano. La barra de estado muestra el trazado más cercano (o el seleccionado) con la estación y el desfase, **L** o **R** mirando hacia adelante en la estación, por ejemplo "Trazado 1: Est 2+15.30, desfase 18.42 R". Más allá de cualquiera de los extremos agrega "(más allá del final)".

## Qué se dibuja

En el plano, en DXF y en PDF: el eje (tangentes como líneas, curvas como arcos verdaderos), una marca cada 50 ft (20 m) con una marca más larga y una etiqueta de estación cada 100 unidades, y marcas PC y PT con sus estaciones.

## Eliminar un trazado

Seleccionalo y apretá {{key:Delete}}, o hacé clic en {{ui:Eliminar}} de la barra de herramientas o al pie del panel derecho. Su perfil y corredor se van con él. {{key:Mod+Z}} lo devuelve.

:::mac
En un teclado de Mac, la tecla rotulada **delete** es {{key:Backspace}} para el navegador y no elimina una selección. Apretá {{key:Delete}} (Fn y delete), o usá el botón {{ui:Eliminar}}.
:::

## Siguiente

- [Diseñar un perfil vertical](topic:profile).
## Velocidad y clase de diseño

En las Propiedades del trazado, **Velocidad de diseño** (km/h o mph) y **Clase de diseño** se guardan con el trazado, se guardan en el proyecto y se escriben en IFC (Pset_RoadDesignCriteriaCommon). CivilCraft no tiene una tabla que relacione una velocidad con un radio mínimo, así que no se verifica nada a partir de ellas: fijá el **Radio mínimo** según tu propia norma de diseño.

## Espirales

Una curva puede tener una espiral clotoide en cualquiera de sus extremos: tangente, espiral, curva, espiral, tangente. En la tabla de PI, escribí una longitud en **Espiral de entrada** y **Espiral de salida** para un PI que tenga radio. El PI queda donde está; la curva se corre hacia adentro para hacer lugar, así que la distancia de tangente crece en el desfase de la espiral. Las dos longitudes pueden ser distintas, y un PI con una sola longitud recibe espiral solo en ese extremo.

La lista de curvas entonces muestra TS, SC, CS y ST (tangente a espiral, espiral a curva, curva a espiral, espiral a tangente) con el ángulo de espiral θs, las distancias de tangente y la distancia externa. Las estaciones corren a lo largo de las espirales como en todo lo demás. Las espirales que juntas giran más que la curva se rechazan con el PI nombrado; una espiral más larga que lo que permite la tangente es una superposición, como en cualquier curva. El peralte usa la espiral como su transición (ver [Corredor](topic:corridor)).
