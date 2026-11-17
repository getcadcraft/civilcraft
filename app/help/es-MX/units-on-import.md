---
title: "Unidades al importar: un archivo indica sus unidades, o se le pregunta primero"
summary: Cuando un dibujo o una malla que trae a un proyecto indica sus unidades, CivilCraft las convierte y lo informa. Cuando no lo hace, CivilCraft pregunta antes de leerlo y recuerda su respuesta para ese archivo.
keywords: unidades, importar, DWG, DXF, STL, OBJ, levantamiento, pies, pies topográficos de EE. UU., metros, milímetros, escala, tamaño incorrecto, demasiado grande, demasiado pequeño, preguntar, recordado, INSUNITS, unidades del dibujo
from: 60921963
---

## Qué hará

Traer un archivo a un proyecto y asegurarse de que entre con el tamaño correcto.

## Pasos

1. Abra el archivo como de costumbre: {{ui:Abrir}}, suéltelo sobre el plano, o use el comando de dibujo CAD.
2. Si el archivo indica sus unidades, no se pregunta nada: el cuadro de importación las muestra como **Según indica el dibujo**.
3. Si no lo hace, un cuadro pregunta **Unidades de** el archivo antes de abrir el cuadro de importación. Elija qué representa una unidad en el archivo y haga clic en {{ui:Usar estas unidades}}.
4. {{ui:Cancelar}} (o {{key:Esc}}) omite el archivo. No se lee nada de él en el proyecto.

## Qué archivos indican sus unidades

- **DWG y DXF**: las unidades de inserción del dibujo (`$INSUNITS`). A un archivo sin ellas se le pregunta. La lista **Unidades del dibujo** del cuadro de importación empieza con su respuesta y aún puede cambiarse.
- **STL y OBJ** (formas libres de terreno): nunca indican unidades. Se le pregunta.
- **Listas de puntos** (CSV, TXT) y listas de levantamiento: una lista que indica su unidad en las primeras líneas se convierte, y la línea de estado lo informa. Si no indica ninguna, se pregunta al pulsar {{ui:Importar}}, antes de que entren los puntos. Las columnas de latitud y longitud pasan en su lugar por el sistema de coordenadas.
- **El complemento Nubes de puntos**: pregunta al crear una nube cuyo archivo no indica unidad, y rotula los números de la nube en la unidad que lleva.
- **IFC y LandXML**: indican sus propias unidades; se convierten a las unidades del proyecto.
- **LAS, LAZ y rásteres de elevación**: se colocan según su sistema de coordenadas; el cuadro de terreno pregunta la unidad de elevación cuando el archivo no la indica.

## Conviene saber

- La respuesta se recuerda para ese archivo en este equipo, en todas las aplicaciones de CadCraft. La próxima vez que entre, no se le preguntará.
- Para que se le vuelva a preguntar: la paleta de comandos ({{key:Mod+K}}) › **Volver a preguntar las unidades de los archivos importados**.
- La unidad que indica una lista se lee de sus primeras ocho líneas: una línea como `units: ft`, o encabezados de columna que llevan la misma unidad entre paréntesis, como `Elevation (m)`.
