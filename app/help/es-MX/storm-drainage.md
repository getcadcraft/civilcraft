---
title: Calcular gastos pluviales, tamaños de tubería y la línea de gradiente hidráulico
summary: Dibuje las cuencas que drenan a cada estructura, sume los gastos a lo largo de la red con el método racional, dimensione las tuberías con la ecuación de Manning y vea dónde la línea de gradiente hidráulico queda a tubo lleno o llega a la superficie.
keywords: drenaje pluvial, cuenca, área de drenaje, método racional, coeficiente de escorrentía, tiempo de concentración, intensidad de lluvia, idf, manning, dimensionamiento de tuberías, línea de gradiente hidráulico, hgl, línea de gradiente de energía, egl, sobrecarga, inundación, nivel aguas abajo
from: e44872ec
---

El drenaje pluvial funciona sobre la [red de tuberías](topic:pipe-network): dibuje primero la red y luego las áreas que drenan a ella. Todo aparece en **Drenaje pluvial** en el panel derecho cuando no hay nada seleccionado.

## Dibuje una cuenca

1. Pulse **Dibujar una cuenca** en **Drenaje pluvial**.
2. Pulse las esquinas del área que drena a una estructura. {{key:Enter}} o un doble clic termina; {{key:Backspace}} retira la última esquina; {{key:Esc}} se detiene.
3. La cuenca drena a una estructura dentro de ella, o si no, a la más cercana. Se abren sus **Propiedades**: defina su nombre, el **Coeficiente de escorrentía C** (la parte de la lluvia que escurre, de 0 a 1), el **Tiempo de concentración** en minutos, y a qué estructura **Drena a**.

**Dibujar otra cuenca** en sus Propiedades inicia la siguiente. Pulse dentro de una cuenca en el plano para seleccionarla; {{key:Delete}} la elimina. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## Defina la tormenta de diseño

La intensidad de lluvia es i = a ÷ (tc + b) elevado a c, en pulgadas por hora para un proyecto en pies y en milímetros por hora para un proyecto en metros. Ajuste **Intensidad a**, **b** y **c** a su propia curva intensidad-duración-frecuencia para el periodo de retorno de diseño.

:::warning
La curva de intensidad inicial, el n de Manning (0.013) y la pérdida en la unión (0.5) son valores provisionales, no una norma. Defínalos con sus propios datos de lluvia y criterios de diseño.
:::

- **Tiempo de concentración más corto**: ninguna tubería se calcula con un tiempo menor (10 minutos al inicio).
- **n de Manning**: la rugosidad de las tuberías.
- **Pérdida en la unión**: la carga perdida en cada estructura, como porción de la carga de velocidad V²/2g de la tubería que sale de ella.
- **Nivel de agua en la salida**: el nivel aguas abajo, donde se vacía la última tubería. Déjelo vacío cuando la salida descargue libremente.

## Cómo se suman los gastos

Cada tubería lleva todas las cuencas aguas arriba de ella. Q = C × i × A, donde C × A se suma a lo largo de la red e i es la intensidad al tiempo de concentración más largo del agua que llega: el tiempo propio de una cuenca, o el tiempo desde una cuenca aguas arriba más el tiempo de recorrido por las tuberías (longitud ÷ la velocidad a tubo lleno). Q está en pies cúbicos por segundo (A en acres) o en metros cúbicos por segundo (A en hectáreas).

## Dimensione las tuberías

La tabla en **Gastos y líneas de gradiente** muestra, para cada tubería, el gasto, lo que conduce a tubo lleno con su pendiente, la velocidad, la línea de gradiente hidráulico en su parte superior y en su extremo inferior, y a qué profundidad fluye.

**Dimensionar las tuberías para estos gastos** asigna a cada tubería el tamaño estándar más pequeño que conduce su gasto con su propia pendiente (de 12 a 72 in, o de 300 a 1800 mm). Es un solo paso. Las plantillas se quedan donde están: si cambian los tamaños, use **Establecer todas las plantillas según las reglas** para conservar el recubrimiento, y luego revise de nuevo la tabla.

## Lea las líneas de gradiente

La línea de gradiente hidráulico (HGL) se calcula desde la salida hacia aguas arriba:

- Una tubería que fluye parcialmente llena tiene su HGL en la superficie del agua: la plantilla más la profundidad normal.
- Cuando el agua de abajo está más alta que su clave, o lleva más de lo que puede a tubo lleno, fluye a tubo lleno (con sobrecarga) y su HGL sube según la pendiente de fricción a lo largo de su longitud.
- En cada estructura, el HGL es el HGL superior de la tubería que sale, más la pérdida en la unión.
- La línea de gradiente de energía (EGL) es el HGL más la carga de velocidad.

Una tubería que fluye a tubo lleno aparece en la lista, al igual que cualquier estructura donde el HGL está por encima del borde: el agua llega a la superficie allí, y la estructura se marca con un círculo rojo en el plano. Seleccione una tubería o una estructura para ver su gasto, profundidad, velocidad y ambas líneas de gradiente en sus Propiedades.

## Calcule una tormenta

El método racional da un pico para cada tubería. **Calcular el tránsito** (bajo los resultados, en las Propiedades de la red) calcula la tormenta completa: el escurrimiento de cada cuenca a lo largo del tiempo, conducido por las tuberías con su tiempo de recorrido y su almacenamiento, y sumado donde se encuentran.

1. Deje vacíos {{ui:La lluvia dura}} e {{ui:Intensidad de lluvia}} para usar el tiempo de concentración más largo y la curva de lluvia de arriba, o escriba los suyos.
2. Pulse {{ui:Calcular el tránsito}}. La tabla enumera, para cada tubería, el gasto máximo de entrada y de salida, cuánto menor es el pico de salida, qué parte de su capacidad a tubo lleno usa y el minuto en que alcanza el pico.
3. Cada salida tiene un pequeño gráfico de gasto contra tiempo y {{ui:Descargar el hidrograma (CSV)}}.

Una cuenca envía la lluvia promediada sobre su tiempo de concentración, así que una tormenta más corta que ese tiempo alcanza un pico menor que C × i × A. Cada tubería se propaga con el método Muskingum–Cunge, usando el tirante que ya encontró el método racional. Dos ramales con tiempos de concentración distintos no alcanzan su pico juntos, así que su suma es menor que la suma de sus picos.

No modela la sobrecarga, el remanso, el almacenamiento en estructuras ni las inundaciones. Una tubería cuyo pico propagado supera su capacidad a tubo lleno aparece en la lista, y su agua se pasa como si cupiera. Úselo para ver el tiempo y la atenuación, no para dimensionar la tubería. Es una herramienta de cálculo: un ingeniero debe verificarla.

## Guardado con el proyecto

Las cuencas y la configuración de la tormenta se guardan en el archivo del proyecto. Todavía no están en el trazado a PDF, en el DWG o DXF, ni en LandXML: vea [Aún no disponible](topic:not-built-yet).
