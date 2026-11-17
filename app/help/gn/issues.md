---
title: Incidencias y BCF
summary: Fijá un problema en el plano, en una estación de trazado, en un punto de superficie o en un caño, asignale un estado y comentarios, e intercambiá las incidencias como archivos BCF 2.1 junto al archivo LandXML.
keywords: incidencia, incidencias, bcf, comentario, anotación, aviso, defecto, obra, sitio, fijar, estado, abierta, resuelta, cerrada, formato de colaboración BIM, landxml, problemas
from: e44153b1
---

Una incidencia ha'e nota fijada en un lugar de tu dibujo de CivilCraft, con un título, un estado y comentarios. Usala para decir al personal de obra o a otro programa qué revisar, y para leer sus respuestas.

## Agregar una incidencia

1. Abrí **Superficie, Más, Incidencias (BCF)...**
2. Escribí un título y qué está mal.
3. Elegí dónde fijarla: el centro de la vista del plano, el punto de superficie del centro, una estación del trazado seleccionado (escribí la estación y un desplazamiento; a la derecha es positivo), o el caño, la estructura o la línea de perfil seleccionada.
4. Presioná **Agregar incidencia**. La marca aparece en el plano como un pequeño rombo con su número.

Hacé clic en el título de una incidencia para hacer zoom hasta ella, cambiá su estado en la lista (Abierta, Activa, Resuelta, Cerrada) y agregá comentarios. Cada cambio es un paso de deshacer, y las incidencias se guardan en el archivo del proyecto.

## Intercambiarlas como BCF

- **Exportar BCF** escribe un archivo BCF 2.1 con un tema por incidencia: título, estado, comentarios y una vista con cámara ortogonal de planta y la marca.
- **Importar BCF** lee un archivo BCF (los de 2.0 y 3.0 se leen en lo que coinciden con 2.1). Un tema con un guid que ya tenés actualiza esa incidencia (estado, comentarios nuevos) en vez de agregar una segunda.
- **Desde Problemas** crea una incidencia por cada entrada abierta del panel Problemas que indique dónde está.

BCF lleva metros en las coordenadas propias de este proyecto, sin desplazamiento. El otro programa debe estar en el mismo sistema de coordenadas que tu archivo LandXML para que las marcas caigan en el lugar correcto. El elemento al que apunta una marca (trazado, estación, desplazamiento, caño) viaja como etiquetas que empiezan con "cc:", que CivilCraft lee de vuelta.

## Lo que no se verificó

Las marcas y las vistas se probaron solo escribiendo un archivo y leyéndolo de vuelta en CivilCraft. Ningún otro programa BIM las abrió todavía. Si "view to world scale" en BCF significa la altura completa o la media altura de la vista differe entre programas: CivilCraft escribe la altura completa.
