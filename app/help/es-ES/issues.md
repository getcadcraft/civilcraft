---
title: Incidencias y BCF
summary: Fije un problema al plano, a una estación de un trazado, a un punto de superficie o a una tubería, asígnele un estado y comentarios, e intercambie las incidencias como archivos BCF 2.1 junto al archivo LandXML.
keywords: incidencia, incidencias, bcf, comentario, anotación, pendiente de obra, defecto, obra, chincheta, estado, abierta, resuelta, cerrada, formato de colaboración BIM, landxml, problemas
from: e44153b1
---

Una incidencia es una nota fijada a un lugar de su dibujo de CivilCraft, con un título, un estado y comentarios. Úsela para indicar al personal de obra u a otro programa qué deben revisar, y para leer después sus respuestas.

## Añadir una incidencia

1. Abra **Superficie, Más, Incidencias (BCF)...**
2. Escriba un título y qué es lo que está mal.
3. Elija dónde fijarla: el centro de la vista en planta, el punto de superficie del centro, una estación del trazado seleccionado (escriba la estación y un desfase; a la derecha es positivo) o la tubería, estructura o línea característica seleccionada.
4. Pulse **Añadir incidencia**. La chincheta aparece en el plano como un pequeño rombo con su número.

Haga clic en el título de una incidencia para acercar la vista a ella, cambie su estado en la lista (Abierta, Activa, Resuelta, Cerrada) y añada comentarios. Cada cambio es un paso de deshacer, y las incidencias se guardan en el archivo del proyecto.

## Intercambiarlas como BCF

- **Exportar BCF** escribe un archivo BCF 2.1 con un tema por incidencia: título, estado, comentarios y una vista con una cámara ortogonal en planta y la chincheta.
- **Importar BCF** lee un archivo BCF (los archivos 2.0 y 3.0 se leen en la medida en que coinciden con la 2.1). Un tema con un guid que ya existe actualiza esa incidencia (estado, nuevos comentarios) en lugar de añadir una segunda.
- **Desde Problemas** crea una incidencia por cada entrada abierta del panel Problemas que indique dónde se encuentra.

BCF guarda las coordenadas en metros, en las coordenadas propias de este proyecto, sin desplazamiento. El otro programa debe estar en el mismo sistema de coordenadas que su archivo LandXML para que las chinchetas caigan en el lugar correcto. El elemento al que apunta una chincheta (trazado, estación, desfase, tubería) viaja como etiquetas que empiezan por "cc:", que CivilCraft lee al volver a importarlas.

## Lo que no se ha comprobado

Las chinchetas y las vistas se probaron solo escribiendo un archivo y leyéndolo de nuevo en CivilCraft. Ningún otro programa BIM lo ha abierto todavía. Además, si la escala de vista a mundo de BCF (view to world scale) indica la altura completa o la mitad de la vista, varía según el programa: CivilCraft escribe la altura completa.
