---
title: Calcular las horas de sol en un emplazamiento
summary: Elija un día (o una temporada) y una zona horaria, y vea las horas de sol directo en cada muro de cada volumen y en el terreno que los rodea, con el terreno dibujado en el plano y los números en CSV.
keywords: sol, horas de sol, sombra, sombreado, acceso solar, horas de luz diurna, fachada, muro, temporada, solsticio, equinoccio, zona horaria, horario de verano, latitud, longitud, CSV, ráster
from: 4e32a314
---

**Horas de sol** cuenta las horas de sol directo que llegan a cada muro de cada volumen de edificación y al terreno que los rodea, en un día que elija o promediadas a lo largo de una temporada. Los volúmenes y el propio terreno proyectan sombra; nada más lo hace (ni árboles ni vecinos que no haya dibujado). La luz de cielo que no es sol directo no se cuenta.

## Antes de empezar

La posición del sol se obtiene de la latitud y la longitud del emplazamiento, que proceden del **sistema de coordenadas** del proyecto. Un proyecto sin sistema se rechaza con un mensaje: defínalo antes (**Coordenadas** en el grupo SIG). Una latitud y una longitud escritas a mano serían una estimación, por eso no hay casillas para ellas.

## Calcularlo

En **Propiedades**, bajo **Volúmenes de edificación**, **Horas de sol**:

1. Elija el **Día**. Empieza en el día en que el sol está más bajo en su ubicación (21 de diciembre, o 21 de junio en el hemisferio sur). Para una temporada, marque **Durante una temporada**, elija el **Último día** y cada cuántos días tomar muestras.
2. Escriba la **Zona horaria**: un nombre como `America/Mexico_City`, o un desfase respecto a UTC como `-6`. Un nombre sigue las reglas de horario de verano de esa zona para el día; un desfase escrito se usa tal cual, así que utilice el que esté vigente ese día. La línea bajo el cuadro indica qué desfase ha encontrado.
3. Elija cada cuántos minutos situar el sol (cada 5, 10, 15 o 30 minutos) y pulse **Calcular las horas de sol**. Una temporada se ejecuta en procesos en segundo plano; **Detener** la cancela.

## Resultados

- Una tabla por volumen: el **muro peor**, la **media** y el **muro mejor**, en horas al día, y una tabla de todos los muros con su orientación y sus horas planta a planta.
- El terreno alrededor de los volúmenes, dibujado en el plano desde oscuro (sin sol) hasta amarillo (lo máximo que recibe cualquier celda), con leyenda. Las celdas bajo un volumen quedan en blanco. **Mostrar el terreno en el plano** lo desactiva.
- **Muros en CSV** y **Terreno en CSV** guardan los números.

En una temporada, las cifras son la media diaria de los días muestreados. Nada se guarda en el proyecto: el resultado es para consulta, y volver a calcularlo lo vuelve a generar.

## Conviene saber

- Un muro cuenta un instante como soleado solo cuando mira al sol y nada se interpone. Un muro orientado en sentido contrario no recibe nada.
- El terreno se muestrea en una malla que depende del tamaño del emplazamiento, y la posición del sol se toma en el centro de cada paso temporal, así que las horas son exactas hasta el paso que haya elegido.
- La posición del sol se calcula con una fórmula astronómica publicada, con una precisión de aproximadamente un minuto de arco.
