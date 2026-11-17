---
title: Calcular caudales pluviales, diámetros de tubería y la línea de gradiente hidráulico
summary: Dibujar las cuencas de aportación que vierten a cada estructura, sumar los caudales a lo largo de la red con el método racional, dimensionar las tuberías con la ecuación de Manning y ver dónde la línea de gradiente hidráulico llena la tubería o llega a la superficie.
keywords: drenaje pluvial, cuenca de aportación, método racional, coeficiente de escorrentía, tiempo de concentración, intensidad de lluvia, IDF, Manning, dimensionado de tuberías, línea de gradiente hidráulico, HGL, línea de energía, EGL, sobrecarga, inundación, nivel de aguas abajo
from: e44872ec
---

El drenaje pluvial trabaja sobre la [red de tuberías](topic:pipe-network): dibuje primero la red y después las áreas que vierten a ella. Todo aparece bajo **Drenaje pluvial** en el panel derecho cuando no hay nada seleccionado.

## Dibujar una cuenca de aportación

1. Pulse **Dibujar cuenca de aportación** bajo **Drenaje pluvial**.
2. Pulse las esquinas del área que vierte a una estructura. {{key:Enter}} o un doble clic finaliza; {{key:Backspace}} retira la última esquina; {{key:Esc}} detiene.
3. La cuenca vierte a una estructura situada dentro de ella o, si no hay ninguna, a la más cercana. Se abren sus **Propiedades**: defina su nombre, el **Coeficiente de escorrentía C** (la parte de la lluvia que escurre, de 0 a 1), el **Tiempo de concentración** en minutos y a qué estructura **Vierte a**.

**Dibujar otra cuenca** en sus Propiedades inicia la siguiente. Pulse dentro de una cuenca en el plano para seleccionarla; {{key:Delete}} la elimina. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## Definir la tormenta de diseño

La intensidad de lluvia es i = a ÷ (tc + b) elevado a c, en pulgadas por hora para un proyecto en pies y en milímetros por hora para un proyecto en metros. Ajuste **Intensidad a**, **b** y **c** a su propia curva intensidad-duración-frecuencia (IDF) para el periodo de retorno de diseño.

:::warning
La curva de intensidad inicial, el n de Manning (0.013) y la pérdida en la unión (0.5) son valores provisionales, no un estándar. Defínalos a partir de sus propios datos de lluvia y criterios de diseño.
:::

- **Tiempo de concentración mínimo**: ninguna tubería se calcula con un tiempo más corto (10 minutos al inicio).
- **n de Manning**: la rugosidad de las tuberías.
- **Pérdida en la unión**: la carga perdida en cada estructura, como fracción de la carga de velocidad V²/2g de la tubería de salida.
- **Nivel del agua en la salida**: el nivel de aguas abajo, donde desagua la última tubería. Déjelo vacío cuando la salida sea libre.

## Cómo se suman los caudales

Cada tubería transporta todas las cuencas situadas aguas arriba. Q = C × i × A, donde C × A se suma a lo largo de la red e i es la intensidad al mayor tiempo de concentración del agua que llega: el tiempo propio de una cuenca, o el tiempo de una cuenca aguas arriba más el tiempo de recorrido por las tuberías (longitud ÷ la velocidad a sección llena). Q está en pies cúbicos por segundo (A en acres) o en metros cúbicos por segundo (A en hectáreas).

## Dimensionar las tuberías

La tabla bajo **Caudales y líneas de gradiente** muestra, para cada tubería, el caudal, lo que transporta a sección llena con su pendiente, la velocidad, el gradiente hidráulico en su cabecera y en su pie, y la altura de agua.

**Dimensionar las tuberías para estos caudales** asigna a cada tubería el menor diámetro normalizado que transporta su caudal con su propia pendiente (de 12 a 72 in, o de 300 a 1800 mm). Es un solo paso. Las plantillas se mantienen donde están: si cambian los diámetros, use **Establecer todas las plantillas según las reglas** para mantener el recubrimiento, y después vuelva a comprobar la tabla.

## Leer las líneas de gradiente

La línea de gradiente hidráulico (HGL) se calcula desde la salida hacia aguas arriba:

- Una tubería que fluye parcialmente llena tiene su HGL en la superficie del agua: la plantilla más la altura normal.
- Cuando el agua de aguas abajo está más alta que su clave, o transporta más de lo que admite a sección llena, la tubería fluye llena (a presión) y su HGL sube según la pendiente de fricción a lo largo de su longitud.
- En cada estructura, el HGL es el HGL superior de la tubería de salida más la pérdida en la unión.
- La línea de energía (EGL) es el HGL más la carga de velocidad.

Se listan las tuberías que fluyen llenas y cualquier estructura donde el HGL está por encima del borde: el agua llega a la superficie allí, y la estructura se marca con un círculo rojo en el plano. Seleccione una tubería o una estructura para ver en sus Propiedades su caudal, altura, velocidad y ambas líneas de gradiente.

## Propagar una tormenta

El método racional da un único pico para cada tubería. {{ui:Propagar la tormenta}} (bajo los resultados, en las Propiedades de la red) calcula en cambio la tormenta completa: la escorrentía de cada cuenca a lo largo del tiempo, transportada por las tuberías con su tiempo de recorrido y almacenamiento, y sumada donde confluyen.

1. Deje vacíos {{ui:La lluvia dura}} e {{ui:Intensidad de lluvia}} para usar el mayor tiempo de concentración y la curva de lluvia anterior, o escriba los suyos.
2. Pulse {{ui:Propagar la tormenta}}. La tabla indica, para cada tubería, el caudal máximo de entrada y de salida, cuánto más bajo es el pico de salida, qué porcentaje de su capacidad a sección llena utiliza y el minuto en que alcanza el pico.
3. Cada salida tiene un pequeño gráfico de caudal en el tiempo y {{ui:Descargar el hidrograma (CSV)}}.

Una cuenca entrega la lluvia promediada a lo largo de su tiempo de concentración, así que una tormenta más corta que ese tiempo alcanza un pico más bajo que C × i × A. Cada tubería se propaga con el método de Muskingum–Cunge, usando la altura de flujo que ya obtuvo el método racional. Dos ramales con tiempos de concentración distintos no alcanzan el pico a la vez, así que su suma es menor que la suma de sus picos.

Esto no modela la sobrecarga, el remanso, el almacenamiento en las estructuras ni las inundaciones. Una tubería cuyo pico propagado supera su capacidad a sección llena aparece en la lista, y su agua se transmite como si cupiera. Úselo para ver el tiempo y la laminación, no para dimensionar la tubería. Es una ayuda de cálculo: debe revisarla un ingeniero.

## Guardado con el proyecto

Las cuencas y los ajustes de la tormenta se guardan en el archivo del proyecto. Todavía no están en el plano PDF, en el DWG o DXF, ni en LandXML: véase [Aún no disponible](topic:not-built-yet).
