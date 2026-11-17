---
title: Flecha y tensión
summary: Sus casos de carga (temperatura, viento, hielo) y límites de tensión, cómo CivilCraft calcula la tensión de cada sección, y las tablas de tendido.
keywords: flecha, tensión, caso de carga, temperatura, viento, hielo, hielo asimétrico, vano regulador, vano equivalente, cambio de estado, catenaria, tabla de tendido, resistencia a la rotura, esfuerzo de uso diario
from: f8876c35
---

## Casos de carga y límites

{{ui:Más}} › {{ui:Load cases and limits…}} edita las reglas que sigue cada línea del proyecto.

- **Casos de carga**: una temperatura, una presión de viento sobre el conductor (Pa), y hielo radial (mm, con su densidad). El primer caso es la referencia.
- **Límites de tensión**: una proporción de la resistencia a la rotura del conductor, sobre la tensión horizontal o sobre la mayor tensión en un apoyo, en un caso de carga. O indique usted mismo la tensión horizontal.
- **Libramientos**: la distancia libre que deja el conductor sobre el terreno, un camino, un edificio, etc. Agregue, renombre y elimine: son suyos. Debajo de ellos, elija las reglas para **Plantas de paisajismo bajo una línea**, **Muros de paisajismo bajo una línea** y **Cruces subterráneos**.
- **Casos que usan las verificaciones**: cuál caso da la mayor flecha (caliente), la oscilación del aislador (viento), el hielo, y el hielo en un solo lado de un apoyo.
- **Factores**: factor k de separación de fases, mayor oscilación del aislador, un factor sobre las cargas de apoyos y herrajes, los ángulos de deflexión que definen los apoyos de ángulo y de remate, el recubrimiento mínimo sobre cables enterrados, y la mayor caída de tensión.

## Paquetes: reglas y una biblioteca para un país

Ninguna regla de ningún país viene integrada en CivilCraft. Un **paquete** guarda un conjunto de reglas y una biblioteca juntos en un archivo (`.cclinepack.json`), para un país, un operador de red o una empresa:

- **Guardar como paquete…** en {{ui:Load cases and limits…}} escribe el conjunto de reglas que se muestra y su biblioteca (o, si su biblioteca aún está vacía, los elementos que usa este proyecto). Escriba primero el **País o región**.
- **Abrir un conjunto de reglas o paquete…** lee un paquete, un archivo de reglas o un archivo de biblioteca. Las reglas de un paquete se muestran en el cuadro de diálogo (haga clic en **Aplicar** para usarlas), y sus elementos pasan a su biblioteca.
- Los paquetes que otros comparten aparecen en la página de complementos, bajo **Paquetes de líneas eléctricas**. Dos paquetes de ejemplo muestran el formato; no son las reglas de ningún país.

Cada paquete se verifica al abrirlo, como cualquier archivo. Verifique cada valor contra la norma que aplique antes de construir nada.

Hay dos conjuntos de reglas de ejemplo para empezar: **Ejemplo: clima frío** y **Ejemplo: clima templado**. Sus cifras no provienen de ninguna norma: indique los valores que dé su norma. {{ui:Save rules}} y {{ui:Open rules…}} comparten un conjunto de reglas como archivo.

## Cómo se calcula la tensión

Para cada sección entre remates:

1. El **vano regulador** es √(ΣL³ ÷ ΣL) de sus vanos.
2. Cada límite se convierte en una tensión horizontal en el caso de referencia mediante la **ecuación de cambio de estado** sobre el vano regulador: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. El más restrictivo fija la tensión.
3. La tensión de cada caso de carga se deriva de esa, y la forma de cada vano es la **catenaria** exacta entre sus dos puntos de apoyo (incluidos los vanos en pendiente): flecha desde la cuerda, longitud, y la tensión en cada extremo.

La carga por metro en cada caso: el peso más el hielo (área de hielo × densidad × g) en vertical; presión de viento × el diámetro con hielo en horizontal.

## Tablas de tendido

{{ui:More}} › {{ui:Stringing tables…}} enumera, para cada sección, la tensión horizontal y la flecha de cada vano a cada temperatura del conjunto de reglas (de −5 °C a 40 °C de 5 en 5 °C al inicio), en aire en calma. Guárdelas, y la tabla de apoyos, como CSV.

No se consideran: la fluencia del conductor con los años, ni el estiramiento de un conductor nuevo. Agréguelos mediante las temperaturas a las que realiza el tendido.
