---
title: Unidades al importar: un archivo declara sus unidades, o se te pregunta antes
summary: Cuando un dibujo o una malla que traés a un proyecto declara sus unidades, CivilCraft las convierte y lo informa. Cuando no lo hace, CivilCraft pregunta antes de leerlo y recuerda tu respuesta para ese archivo.
keywords: unidades, importar, DWG, DXF, STL, OBJ, relevamiento, pies, pies de agrimensura de EE. UU., metros, milímetros, escala, tamaño incorrecto, muy grande, muy chico, preguntar, recordado, INSUNITS, unidades del dibujo
from: 60921963
---

## Qué vas a hacer

Traer un archivo a un proyecto y asegurarte de que entre con el tamaño correcto.

## Pasos

1. Abrí el archivo como de costumbre: {{ui:Open}}, soltalo sobre el plano, o usá el comando de dibujo CAD.
2. Si el archivo declara sus unidades, no se pregunta nada: el diálogo de importación las muestra como **Según indica el dibujo**.
3. Si no lo hace, un diálogo pregunta **Unidades de** el archivo antes de abrir el diálogo de importación. Elegí cuánto vale una unidad en el archivo y hacé clic en {{ui:Use these units}}.
4. {{ui:Cancel}} (o {{key:Esc}}) omite el archivo. Nada de él se lee en el proyecto.

## Qué archivos declaran sus unidades

- **DWG y DXF**: las unidades de inserción del dibujo (`$INSUNITS`). A un archivo sin ellas se le pregunta. La lista **Unidades del dibujo** del diálogo de importación empieza con tu respuesta y todavía puede cambiarse.
- **STL y OBJ** (formas libres de terreno): nunca declaran unidades. Se te pregunta.
- **Listas de puntos** (CSV, TXT) y listas de relevamiento de obra: una lista que declara su unidad en sus primeras líneas se convierte, y la línea de estado lo informa. Una que no declara ninguna se consulta al presionar {{ui:Import}}, antes de que entren los puntos. Las columnas de latitud y longitud pasan en cambio por el sistema de coordenadas.
- **El complemento de nubes de puntos**: pregunta cuando armás una nube cuyo archivo no declara unidad, y rotula los números de la nube en la unidad que lleva.
- **IFC y LandXML**: declaran las suyas; se convierten a las unidades del proyecto.
- **LAS, LAZ y rásteres de elevación**: se ubican según su sistema de coordenadas; el diálogo de terreno pregunta la unidad de elevación cuando el archivo no la dice.

## Para tener en cuenta

- La respuesta se recuerda para ese archivo en esta computadora, en todas las aplicaciones de CadCraft. La próxima vez que entre, no se te pregunta.
- Para que se te pregunte de nuevo: la paleta de comandos ({{key:Mod+K}}) › **Preguntar otra vez por las unidades de los archivos importados**.
- Una unidad que declara una lista se lee de sus primeras ocho líneas: por ejemplo una línea como `units: ft`, o encabezados de columna que llevan la misma unidad entre paréntesis, como `Elevation (m)`.
