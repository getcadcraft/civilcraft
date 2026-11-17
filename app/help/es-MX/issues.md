---
title: Incidencias y BCF
summary: Fije un problema al plano, a una estación de alineación, a un punto de superficie o a una tubería, asígnele un estado y comentarios, e intercambie las incidencias como archivos BCF 2.1 junto con el archivo LandXML.
keywords: incidencia, incidencias, bcf, comentario, marca, defecto, obra, marcador, estado, abierta, resuelta, cerrada, formato de colaboración BIM, landxml, problemas
from: e44153b1
---

Una incidencia es una nota fijada a un lugar de su dibujo de CivilCraft, con un título, un estado y comentarios. Úsela para indicar al personal de obra u a otro programa qué debe revisar, y para leer después sus respuestas.

## Agregar una incidencia

1. Abra **Superficie, Más, Incidencias (BCF)...**
2. Escriba un título y qué es lo que está mal.
3. Elija dónde fijarla: el centro de la vista en planta, el punto de superficie del centro, una estación de la alineación seleccionada (escriba la estación y un desfase; a la derecha es positivo), o la tubería, estructura o línea característica seleccionada.
4. Pulse **Agregar incidencia**. El marcador aparece en la planta como un pequeño rombo con su número.

Haga clic en el título de una incidencia para hacer zoom hasta ella, cambie su estado en la lista (Abierta, Activa, Resuelta, Cerrada) y agregue comentarios. Cada cambio es un paso de deshacer, y las incidencias se guardan en el archivo del proyecto.

## Intercambiarlas como BCF

- **Exportar BCF** escribe un archivo BCF 2.1 con un tema por incidencia: título, estado, comentarios y una vista con una cámara ortogonal en planta y el marcador.
- **Importar BCF** lee un archivo BCF (los archivos 2.0 y 3.0 se leen en la medida en que coinciden con la 2.1). Un tema con un guid que ya tiene actualiza esa incidencia (estado, nuevos comentarios) en lugar de agregar una segunda.
- **Desde Problemas** crea una incidencia por cada entrada abierta del panel Problemas que indique dónde está.

BCF almacena metros en las coordenadas propias de este proyecto, sin desplazamiento. El otro programa debe estar en el mismo sistema de coordenadas que su archivo LandXML para que los marcadores caigan en el lugar correcto. El elemento al que apunta un marcador (alineación, estación, desfase, tubería) viaja como etiquetas que empiezan con "cc:", que CivilCraft lee de nuevo.

## Lo que no se verificó

Los marcadores y las vistas solo se probaron escribiendo un archivo y leyéndolo de nuevo en CivilCraft. Ningún otro programa BIM los ha abierto todavía, y si el valor "view to world scale" de BCF representa la altura completa o la mitad de la altura de la vista varía entre programas: CivilCraft escribe la altura completa.
