---
title: Flecha y tensión
summary: Tus hipótesis de carga (temperatura, viento, hielo) y los límites de tensión, cómo CivilCraft calcula la tensión de cada sección, y las tablas de tendido.
keywords: flecha, tensión, hipótesis de carga, temperatura, viento, hielo, hielo asimétrico, vano de cálculo, vano equivalente, cambio de estado, catenaria, tabla de tendido, resistencia a la rotura, esfuerzo cotidiano
from: f8876c35
---

## Hipótesis de carga y límites

{{ui:Más}} › {{ui:Hipótesis de carga y límites…}} edita las reglas que sigue cada línea del proyecto.

- **Hipótesis de carga**: una temperatura, una presión de viento sobre el conductor (Pa), y hielo radial (mm, con su densidad). La primera hipótesis es la de referencia.
- **Límites de tensión**: una parte de la resistencia a la rotura del conductor, sobre la tensión horizontal o sobre la mayor tensión en un apoyo, en una hipótesis de carga. O escribí vos la tensión horizontal.
- **Distancias libres**: la distancia que el conductor mantiene sobre el terreno, un camino, un edificio y demás. Agregalas, renombralas y quitalas: son tuyas. Debajo de ellas, elegí las reglas para **Plantas del paisaje bajo una línea**, **Muros del paisaje bajo una línea** y **Cruces subterráneos**.
- **Hipótesis que usan las verificaciones**: cuál hipótesis da la mayor flecha (caliente), el balanceo del aislador (viento), el hielo, y el hielo de un solo lado de un apoyo.
- **Factores**: factor de separación de fases k, mayor balanceo del aislador, un factor sobre las cargas de apoyo y de herrajes, los ángulos de giro que hacen apoyos de ángulo y de fin de línea, la cobertura mínima sobre cables enterrados, y la mayor caída de tensión.

## Paquetes: reglas y una biblioteca para un país

En CivilCraft no vienen incorporadas las reglas de ningún país. Un **paquete** guarda juntos un conjunto de reglas y una biblioteca en un solo archivo (`.cclinepack.json`), para un país, un operador de red o una empresa:

- **Guardar como paquete…** en {{ui:Hipótesis de carga y límites…}} escribe el conjunto de reglas que se ve y tu biblioteca (o, si tu biblioteca todavía está vacía, los elementos que usa este proyecto). Escribí primero el **País o región**.
- **Abrir un conjunto de reglas o paquete…** lee un paquete, un archivo de reglas o un archivo de biblioteca. Las reglas de un paquete se muestran en el diálogo (hacé clic en **Aplicar** para usarlas), y sus elementos pasan a tu biblioteca.
- Los paquetes que otros comparten aparecen en la página de complementos bajo **Paquetes de líneas eléctricas**. Dos paquetes de ejemplo muestran el formato; no son reglas de ningún país.

Cada paquete se verifica al abrirlo, como cualquier archivo. Verificá cada valor contra la norma que corresponda antes de construir nada.

Hay dos conjuntos de reglas de ejemplo para empezar: **Ejemplo: clima frío** y **Ejemplo: clima templado**. Sus números no vienen de ninguna norma: poné los valores que dice tu norma. {{ui:Guardar reglas}} y {{ui:Abrir reglas…}} comparten un conjunto de reglas como archivo.

## Cómo se calcula la tensión

Para cada sección entre fines de línea:

1. El **vano de cálculo** es √(ΣL³ ÷ ΣL) de sus vanos.
2. Cada límite se convierte en una tensión horizontal en la hipótesis de referencia mediante la **ecuación de cambio de estado** sobre el vano de cálculo: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Manda el más restrictivo.
3. La tensión de cada hipótesis de carga sale de esa, y la forma de cada vano es la **catenaria** exacta que pasa por sus dos puntos de fijación (incluidos los vanos en pendiente): la flecha desde la cuerda, la longitud y la tensión en cada extremo.

La carga por metro en una hipótesis: el peso más el hielo (área de hielo × densidad × g) en vertical; la presión del viento × el diámetro con hielo en horizontal.

## Tablas de tendido

{{ui:Más}} › {{ui:Tablas de tendido…}} lista, para cada sección, la tensión horizontal y la flecha de cada vano a cada temperatura del conjunto de reglas (de −5 °C a 40 °C de a 5 °C para empezar), en aire en calma. Guardalas, y la tabla de apoyos, como CSV.

No se cuentan: la fluencia del conductor con los años, ni el estiramiento de un conductor nuevo. Agregalos a través de las temperaturas a las que tendés.
