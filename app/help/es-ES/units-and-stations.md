---
title: Unidades, P.K. y formatos numéricos
summary: Proyectos en pies y en metros, cómo se escriben e introducen los P.K., pendientes, taludes, rumbos, áreas, volúmenes y diámetros de tubería, y qué hace cambiar las unidades.
keywords: introducir una longitud, aritmética, calculadora, suma, fracción, pies y pulgadas, 4+7/16, unidades, pies, pies US de agrimensura, metros, métrico, imperial, formato de P.K., P.K., pendiente, porcentaje, talud, h:v, rumbo, yardas cúbicas, diámetro
from: 0b9b5b6b
---

## Unidades del proyecto

Un proyecto está en **pies US** o en **metros** (**Unidades** en el panel izquierdo). Cada coordenada, cota, longitud y P.K. del proyecto está en esa unidad.

:::warning
Cambiar **Unidades** cambia las etiquetas, el formato de P.K., los valores por defecto y el modo de escribir los archivos. **No** convierte ningún número. Un emplazamiento medido en pies y cambiado a metros conserva los mismos números, ahora leídos como metros. La barra de estado indica "Las unidades son ahora metros. No se convirtieron las coordenadas." Ajuste las unidades a sus datos antes de diseñar.
:::

Lo que depende de las unidades:

| | Pies US | Metros |
|---|---|---|
| Formato de P.K. | `12+34.56` (estaciones de 100 ft) | `1+234.567` (estaciones de 1000 m) |
| Intervalos de curvas de nivel ofrecidos | 0.25 a 20 ft | 0.1 a 10 m |
| Área | sq ft | sq m |
| Volumen | cu yd | cu m |
| Diámetro de tubería y de estructura | pulgadas | milímetros |
| Radio de curva por defecto | 100 ft | 30 m |
| Marcas de P.K. en el plano | cada 50 ft, rótulos cada 100 ft | cada 20 m, rótulos cada 100 m |
| Escalas de impresión | 1" = 5' a 1" = 1000' | 1:50 a 1:10000 |
| Unidad lineal de LandXML | USSurveyFoot | meter |

Un proyecto nuevo empieza en pies, o en metros si la unidad de longitud marcada con una estrella en {{ui:Configuración}} › {{ui:General}} › {{ui:Unidades}} es métrica. La lista **Unidades** muestra las unidades activadas allí, y siempre la del propio proyecto. Con una unidad de área o de volumen marcada allí (acres, hectáreas, acre-pie …), áreas y volúmenes se indican en ella en lugar de en la columna anterior. Consulte [Unidades, valores escritos y listas de unidades](common:unit-lists).

Al abrir un LandXML, el proyecto toma las unidades del archivo. Un archivo en pies internacionales se abre como proyecto en pies; los números no cambian.

## Escribir longitudes y sumas

Cualquier cuadro que admita una longitud o una cota lee algo más que un número simple: pulse {{key:Enter}} y el cuadro muestra el resultado en las unidades del proyecto.

| Usted escribe | En un proyecto en pies | En un proyecto en metros |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | las mismas longitudes en metros |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | en pies | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, y los demás en pies US de agrimensura | las mismas longitudes en metros |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | la suma, en pies | la suma, en metros |

Funciona cualquier marca de longitud de la tabla de unidades común, con su tamaño exacto: los pies de un proyecto son pies US de agrimensura, así que `10 US ft` vale 10 y `3 ch` (la cadena de pie internacional) vale 197.9996. Utilice `+ - * /` y paréntesis, y `abs`, `round`, `ceil` y `floor`. Un guion escrito dentro de una longitud forma parte de ella (`24'-6"`, `6-1/2`); con espacios alrededor, resta (`24' - 6"` = 23.5 ft). Un número simple multiplica o divide una longitud, y es una longitud en las unidades del proyecto cuando se suma a una. Si CivilCraft no puede leer lo que escribió, el cuadro se marca y la barra de estado indica dónde está el problema.

Los P.K. no son sumas: `10+00` en un cuadro de P.K. es el P.K. 10+00. Las pendientes en porcentaje, los números de punto y las descripciones se leen tal como se escriben.

## P.K.

Un P.K. es una distancia a lo largo de una alineación, escrita con signo más:

- En pies: la parte anterior al más son cientos de pies. `12+34.56` son 1,234.56 ft.
- En metros: la parte anterior al más son miles de metros. `1+234.567` son 1,234.567 m.
- Los P.K. negativos conservan el signo delante: `-0+50.00`.

Donde escriba un P.K. (**P.K. inicial**, o el **P.K.** de un PIV), puede escribirlo con el signo más (`12+34.56`) o como número simple (`1234.56`). Los espacios se ignoran.

## Pendientes y taludes

- **Pendientes** (de perfiles, tuberías, y de carril y arcén) en porcentaje: `+1.25%` sube en el sentido del P.K., `-0.50%` baja.
- **Taludes** (desmonte y terraplén de plataformas y corredores) son horizontal a vertical: `3` significa 3 : 1, tres en horizontal por cada uno en vertical.
- **K** de una curva vertical es su longitud dividida por la variación de pendiente en porcentaje.

## Rumbos y ángulos

Los rumbos son rumbos de cuadrante en grados, minutos y segundos: `N 63°12'05" E`. Las deflexiones de curva (Δ) usan los mismos grados, minutos y segundos, con "izquierda" o "derecha".

## Desplazamientos

Los desplazamientos respecto a una alineación son distancias perpendiculares a ella, marcadas **L** (izquierda) o **R** (derecha) mirando en el sentido del P.K.

## Visualización de números

- Las coordenadas y las cotas muestran 2 decimales en los paneles y en la barra de estado (3 para un punto de levantamiento seleccionado).
- Las áreas y los volúmenes se agrupan por miles: `128,250 sq ft`, `454.9 cu yd`.
- Las coordenadas nunca se agrupan, para que puedan copiarse tal cual.

## Coordenadas

CivilCraft trabaja en un plano: el este hacia la derecha y el norte hacia arriba. El trabajo de diseño se hace siempre en coordenadas proyectadas (plano estatal, UTM o una cuadrícula local). Puede indicar a CivilCraft en qué sistema de coordenadas están, y si son coordenadas de cuadrícula, de terreno o locales; entonces muestra la latitud y la longitud, y sitúa archivos GIS y capas de mapa, pero nunca cambia las unidades ni mueve sus coordenadas por sí solo. Consulte [Establecer el sistema de coordenadas del proyecto](topic:coordinate-systems) y [Coordenadas de terreno y locales](topic:ground-and-local-coordinates). Los valores grandes de coordenadas planas estatales (millones de pies) son válidos; CivilCraft trabaja internamente respecto al emplazamiento para conservar la precisión.
