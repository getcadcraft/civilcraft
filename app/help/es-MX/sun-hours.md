---
title: Calcular las horas de sol de un sitio
summary: Elija un día (o una temporada) y una zona horaria, y vea las horas de sol directo en cada muro de cada volumen y en el terreno que los rodea, con el terreno dibujado en el plano y las cifras en CSV.
keywords: sol, horas de sol, sombra, asoleamiento, fachada, muro, temporada, solsticio, equinoccio, zona horaria, horario de verano, latitud, longitud, CSV
from: 4e32a314
---

**Horas de sol** cuenta las horas de sol directo que llegan a cada muro de cada volumen de edificio y al terreno que los rodea, en un día que usted elige o promediadas en una temporada. Dan sombra los volúmenes y el propio terreno; nada más (ni árboles, ni vecinos que no haya dibujado). La luz del cielo que no es sol directo no se cuenta.

## Antes de empezar

La posición del sol sale de la latitud y la longitud del sitio, que salen del **sistema de coordenadas** del proyecto. Un proyecto sin él se rechaza con un mensaje: defínalo primero (**Coordenadas**, en el grupo GIS). Una latitud y longitud escritas a mano serían una suposición, por eso no hay casillas para ellas.

## Calcular

En **Propiedades**, bajo **Volúmenes de edificios**, **Horas de sol**:

1. Elija el **Día**. Empieza en el día en que el sol está más bajo donde usted está (21 de diciembre, o 21 de junio en el hemisferio sur). Para una temporada, marque **A lo largo de una temporada**, elija el **Último día** y cada cuántos días muestrear.
2. Escriba la **Zona horaria**: un nombre como `America/Mexico_City`, o un desfase respecto a UTC como `-6`. Un nombre sigue las reglas de horario de verano de esa zona para el día; un desfase que usted escriba se usa exactamente como lo escribió, así que use el vigente ese día. La línea bajo la casilla dice qué desfase encontró.
3. Elija cada cuánto colocar el sol (cada 5, 10, 15 o 30 minutos) y pulse **Calcular las horas de sol**. Una temporada corre en procesos de fondo; **Detener** la cancela.

## Lo que obtiene

- Una tabla por volumen: el **peor muro**, el **promedio** y el **mejor muro**, en horas al día, y una tabla de cada muro con hacia dónde mira y sus horas piso por piso.
- El terreno alrededor de los volúmenes, dibujado en el plano de oscuro (sin sol) a amarillo (lo máximo que recibe alguna celda), con una clave. Las celdas bajo un volumen quedan en blanco. **Mostrar el terreno en el plano** lo apaga.
- **Muros en CSV** y **Terreno en CSV** guardan las cifras.

En una temporada las cifras son el promedio por día de los días muestreados. No se guarda nada en el proyecto: el resultado es para mirarlo, y volver a calcular lo rehace.

## Conviene saber

- Un muro cuenta un instante como soleado solo cuando mira al sol y nada estorba. Un muro que mira al lado contrario no recibe nada.
- El terreno se muestrea en una cuadrícula que depende del tamaño del sitio, y el sol se coloca a la mitad de cada paso de tiempo, así que las horas son correctas con la precisión del paso elegido.
- La posición del sol sale de una fórmula astronómica publicada, buena a casi un minuto de arco.
