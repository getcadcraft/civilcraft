---
title: Unidades, estaciones y formatos numéricos
summary: Proyectos en pies y en metros, cómo se escriben y se tipean las progresivas, pendientes, taludes, rumbos, superficies, volúmenes y diámetros de caños, y qué pasa al cambiar las unidades.
keywords: escribir una longitud, aritmética, calculadora, suma, fracción, pies y pulgadas, 4+7/16, unidades, pies, pies de agrimensura de EE. UU., metros, sistema métrico, formato de progresiva, progresiva, pendiente, porcentaje, talud, h:v, rumbo, yardas cúbicas, diámetro
from: 0b9b5b6b
---

## Unidades del proyecto

Un proyecto está en **US feet** o en **metros** (**Unidades** en el panel izquierdo). Cada coordenada, cota, longitud y progresiva del proyecto está en esa unidad.

:::warning
Cambiar **Unidades** cambia las etiquetas, el formato de progresivas, los valores por defecto y cómo se escriben los archivos. **No** convierte ningún número. Un sitio relevado en pies y cambiado a metros conserva los mismos números, ahora leídos como metros. La barra de estado dice "Las unidades ahora son metros. Las coordenadas no se convirtieron." Ajustá las unidades a tus datos antes de diseñar.
:::

Lo que depende de las unidades:

| | US feet | Metros |
|---|---|---|
| Formato de progresiva | `12+34.56` (progresivas de 100 ft) | `1+234.567` (progresivas de 1000 m) |
| Intervalos de curvas de nivel ofrecidos | 0.25 a 20 ft | 0.1 a 10 m |
| Superficie | sq ft | sq m |
| Volumen | cu yd | cu m |
| Diámetro de caño y de estructura | pulgadas | milímetros |
| Radio de curva por defecto | 100 ft | 30 m |
| Marcas de progresiva en el plano | cada 50 ft, rótulos cada 100 ft | cada 20 m, rótulos cada 100 m |
| Escalas de impresión | 1" = 5' a 1" = 1000' | 1:50 a 1:10000 |
| Unidad lineal de LandXML | USSurveyFoot | meter |

Un proyecto nuevo empieza en pies, o en metros cuando la unidad de longitud marcada con estrella en {{ui:Settings}} › {{ui:General}} › {{ui:Units}} es una métrica. La lista **Unidades** muestra las unidades activadas allí, y siempre las propias del proyecto. Con una unidad de superficie o de volumen marcada con estrella allí (acres, hectáreas, acre-pie …), las superficies y los volúmenes se informan en ella en lugar de la columna de arriba. Ver [Unidades, valores tipeados y listas de unidades](common:unit-lists).

Al abrir LandXML, el proyecto toma las unidades del archivo. Un archivo en pies internacionales se abre como proyecto en pies; los números no se cambian.

## Tipear longitudes y sumas

Cualquier cuadro que pida una longitud o una cota lee más que un número simple: presioná {{key:Enter}} y el cuadro muestra el resultado en las unidades del proyecto.

| Tipeás | En un proyecto en pies | En un proyecto en metros |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | las mismas longitudes en metros |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | en pies | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, y los demás en US survey feet | las mismas longitudes en metros |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | la suma, en pies | la suma, en metros |

Sirve cualquier marca de longitud de la tabla de unidades compartida, con su tamaño exacto: los pies de un proyecto son US survey feet, así que `10 US ft` es 10 y `3 ch` (la cadena en pies internacionales) es 197.9996. Usá `+ - * /` y paréntesis, y `abs`, `round`, `ceil` y `floor`. Un guion escrito dentro de una longitud es parte de ella (`24'-6"`, `6-1/2`); con espacios alrededor, resta (`24' - 6"` = 23.5 ft). Un número simple multiplica o divide una longitud, y es una longitud en las unidades del proyecto cuando se suma a una. Si CivilCraft no puede leer lo que tipeaste, el cuadro se marca y la barra de estado indica dónde.

Las progresivas no son sumas: `10+00` en un cuadro de progresiva es la progresiva 10+00. Las pendientes en porcentaje, los números de punto y las descripciones se leen tal como están.

## Progresivas

Una progresiva es una distancia a lo largo de un trazado, escrita con signo más:

- Pies: la parte antes del más son cientos de pies. `12+34.56` es 1,234.56 ft.
- Metros: la parte antes del más son miles de metros. `1+234.567` es 1,234.567 m.
- Las progresivas negativas conservan el signo delante: `-0+50.00`.

Donde tipees una progresiva (**Progresiva inicial**, **Progresiva** de un PVI), podés escribirla con el más (`12+34.56`) o como número simple (`1234.56`). Los espacios se ignoran.

## Pendientes y taludes

- **Pendientes** (perfiles, caños, taludes de carril y de banquina) están en porcentaje: `+1.25%` sube en el sentido de la progresiva, `-0.50%` baja.
- **Taludes laterales** (corte y relleno de plataforma, corte y relleno de corredor) son horizontal a vertical: `3` significa 3 : 1, tres en horizontal por uno en vertical.
- **K** de una curva vertical es su longitud dividida por el cambio de pendiente en porcentaje.

## Rumbos y ángulos

Los rumbos son rumbos por cuadrante en grados, minutos y segundos: `N 63°12'05" E`. Las deflexiones de curva (Δ) usan los mismos grados, minutos y segundos, con "izquierda" o "derecha".

## Offsets

Los offsets desde un trazado son distancias perpendiculares a él, marcadas **L** (izquierda) o **R** (derecha) mirando en sentido de la progresiva.

## Visualización de números

- Las coordenadas y cotas muestran 2 decimales en los paneles y en la barra de estado (3 para un punto de relevamiento seleccionado).
- Las superficies y volúmenes se agrupan por miles: `128,250 sq ft`, `454.9 cu yd`.
- Las coordenadas nunca se agrupan, para que puedan copiarse tal como son.

## Coordenadas

CivilCraft trabaja en un plano plano: este hacia la derecha, norte hacia arriba. El trabajo de diseño siempre se hace en coordenadas proyectadas (plano de coordenadas estatal, UTM o una grilla local). Podés indicarle a CivilCraft qué sistema de coordenadas usa, y si son coordenadas de grilla, de terreno o locales; entonces muestra latitud y longitud y ubica archivos GIS y capas de mapa, pero nunca cambia unidades ni mueve tus coordenadas por sí mismo. Ver [Fijar el sistema de coordenadas del proyecto](topic:coordinate-systems) y [Coordenadas de terreno y locales](topic:ground-and-local-coordinates). Los valores grandes de plano de coordenadas estatal (millones de pies) están bien; CivilCraft trabaja internamente en relación con el sitio para mantener la precisión.
