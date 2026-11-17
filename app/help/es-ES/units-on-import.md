---
title: Unidades al importar: un archivo indica sus unidades, o se le pregunta antes
summary: Cuando un dibujo o una malla que trae a un proyecto indica sus unidades, CivilCraft las convierte y lo dice. Cuando no lo hace, CivilCraft pregunta antes de leerlo y recuerda su respuesta para ese archivo.
keywords: unidades, importar, DWG, DXF, STL, OBJ, levantamiento, pies, pies US de agrimensura, metros, milímetros, escala, tamaño incorrecto, demasiado grande, demasiado pequeño, preguntar, recordado, INSUNITS, unidades de dibujo
from: 60921963
---

## Lo que hará

Traer un archivo a un proyecto y asegurarse de que entra con el tamaño correcto.

## Pasos

1. Abra el archivo como de costumbre: {{ui:Abrir}}, suéltelo sobre el plano, o use el comando de dibujo CAD.
2. Si el archivo indica sus unidades, no se pregunta nada: el cuadro de importación las muestra como **Según indica el dibujo**.
3. Si no las indica, un cuadro pregunta por las **Unidades de** el archivo antes de abrir el cuadro de importación. Elija qué representa una unidad del archivo y haga clic en {{ui:Usar estas unidades}}.
4. {{ui:Cancelar}} (o {{key:Esc}}) omite el archivo. Nada de él se lee en el proyecto.

## Qué archivos indican sus unidades

- **DWG y DXF**: las unidades de inserción del dibujo (`$INSUNITS`). A un archivo sin ellas se le pregunta. La lista **Unidades del dibujo** del cuadro de importación empieza con su respuesta y todavía puede cambiarla.
- **STL y OBJ** (formas libres del terreno): nunca indican unidades. Se le pregunta.
- **Listas de puntos** (CSV, TXT) y listados de avance de levantamiento: una lista que indica su unidad en sus primeras líneas se convierte, y la línea de estado lo dice. Una que no indica ninguna se le pregunta al pulsar {{ui:Importar}}, antes de que entren los puntos. Las columnas de latitud y longitud pasan en su lugar por el sistema de coordenadas.
- **El complemento Nubes de puntos**: pregunta al crear una nube cuyo archivo no indica unidad, y rotula los números de la nube con la unidad que lleva.
- **IFC y LandXML**: indican sus unidades, y se convierten a las unidades del proyecto.
- **LAS, LAZ y rásters de elevación**: se colocan según su sistema de coordenadas; el cuadro del terreno pregunta por la unidad de elevación cuando el archivo no la indica.

## Conviene saber

- La respuesta se recuerda para ese archivo en este equipo, en todas las aplicaciones de CadCraft. La próxima vez que entre, no se le preguntará.
- Para que vuelva a preguntar: la paleta de comandos ({{key:Mod+K}}) › **Volver a preguntar las unidades de los archivos importados**.
- Una unidad que indica una lista se lee de sus ocho primeras líneas: por ejemplo, una línea como `units: ft`, o encabezados de columna que llevan todos la misma unidad entre paréntesis, como `Elevation (m)`.
