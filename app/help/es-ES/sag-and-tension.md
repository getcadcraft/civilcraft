---
title: Flecha y tensión
summary: Sus hipótesis de carga (temperatura, viento, hielo) y los límites de tensión, cómo CivilCraft calcula la tensión de cada vano y las tablas de tendido.
keywords: flecha, tensión, hipótesis de carga, temperatura, viento, hielo, hielo asimétrico, vano de regulación, vano equivalente, cambio de estado, catenaria, tabla de tendido, carga de rotura, tensión de régimen habitual
from: f8876c35
---

## Hipótesis de carga y límites

{{ui:More}} › {{ui:Load cases and limits…}} edita las reglas que sigue cada línea del proyecto.

- **Hipótesis de carga**: una temperatura, una presión de viento sobre el conductor (Pa) y hielo radial (mm, con su densidad). La primera hipótesis es la de referencia.
- **Límites de tensión**: una proporción de la carga de rotura del conductor, sobre la tensión horizontal o sobre la mayor tensión en un apoyo, en una hipótesis de carga. O indique usted mismo la tensión horizontal.
- **Distancias libres**: la distancia que el conductor mantiene sobre el terreno, una carretera, un edificio, etc. Añádalas, renómbrelas y elimínelas: son suyas. Debajo de ellas, elija las reglas para **Plantas de paisajismo bajo una línea**, **Muros de paisajismo bajo una línea** y **Cruces subterráneos**.
- **Hipótesis que usan las comprobaciones**: cuál da la mayor flecha (caliente), la oscilación del aislador (viento), el hielo y el hielo en un solo lado de un apoyo.
- **Factores**: factor de separación de fases k, mayor oscilación del aislador, un factor sobre las cargas de apoyo y de herrajes, los ángulos de giro que definen los apoyos de ángulo y de fin de línea, la menor cobertura sobre cables enterrados y la mayor caída de tensión.

## Paquetes: reglas y biblioteca de un país

Ningún reglamento de ningún país viene integrado en CivilCraft. Un **paquete** guarda juntos un conjunto de reglas y una biblioteca en un solo archivo (`.cclinepack.json`), para un país, un operador de red o una empresa:

- **Guardar como paquete…** en {{ui:Load cases and limits…}} escribe el conjunto de reglas mostrado y su biblioteca (o, si su biblioteca aún está vacía, los elementos que usa este proyecto). Escriba antes el **País o región**.
- **Abrir un conjunto de reglas o un paquete…** lee un paquete, un archivo de reglas o un archivo de biblioteca. Las reglas de un paquete se muestran en el cuadro de diálogo (pulse **Aplicar** para usarlas) y sus elementos pasan a su biblioteca.
- Los paquetes que otros comparten aparecen en la página de complementos, bajo **Paquetes de líneas eléctricas**. Dos paquetes de ejemplo muestran el formato; no son el reglamento de ningún país.

Cada paquete se comprueba al abrirlo, como cualquier archivo. Compruebe cada valor con la norma que corresponda antes de construir nada.

Hay dos conjuntos de reglas de ejemplo para empezar: **Ejemplo: clima frío** y **Ejemplo: clima templado**. Sus números no proceden de ninguna norma: establezca los valores que indique su norma. {{ui:Save rules}} y {{ui:Open rules…}} comparten un conjunto de reglas como archivo.

## Cómo se calcula la tensión

Para cada sección entre amarres:

1. El **vano de regulación** es √(ΣL³ ÷ ΣL) de sus vanos.
2. Cada límite se convierte en una tensión horizontal en la hipótesis de referencia mediante la **ecuación de cambio de estado** sobre el vano de regulación: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. El más restrictivo fija la tensión.
3. La tensión de cada hipótesis de carga se deduce de esa, y la forma de cada vano es la **catenaria** exacta que pasa por sus dos puntos de anclaje (incluidos los vanos en pendiente): flecha desde la cuerda, longitud y tensión en cada extremo.

La carga por metro en una hipótesis: peso más hielo (área de hielo × densidad × g) en vertical; presión de viento × el diámetro con hielo en horizontal.

## Tablas de tendido

{{ui:More}} › {{ui:Stringing tables…}} enumera, para cada sección, la tensión horizontal y la flecha de cada vano a cada temperatura del conjunto de reglas (de −5 °C a 40 °C de 5 °C en 5 °C para empezar), en aire en calma. Guárdelas, y también la tabla de apoyos, como CSV.

No se cuentan la fluencia del conductor con los años ni el estiramiento de un conductor nuevo. Inclúyalos en las temperaturas a las que tensa el conductor.
