---
title: Registros de plantas, cultivares y tamaños suministrados
summary: La lista de plantas de su proyecto como tabla: cultivares, tamaños suministrados (contenedor, cepellón, perímetro del tronco, tallo libre), densidad, notas de especificación, CSV de entrada y salida; cada planta colocada indica un tamaño; símbolos de plantas por escala y sus propios símbolos y modelos 3D.
keywords: tabla de plantas, base de datos de plantas, cultivar, variedad, tamaño suministrado, contenedor, cepellón, raíz desnuda, perímetro del tronco, tallo libre, densidad, plantas por metro cuadrado, especificación, notas de especificación, símbolo de planta, bloque, símbolo propio, planta en 3D, nivel de detalle, escala
from: 12251beb
---

Abra {{ui:Tabla de plantas}} desde el menú {{ui:Más}} del grupo Paisajismo, o desde la sección Plantas. Cada fila es un registro de planta de la lista propia de este proyecto (un registro de la lista de plantas se copia al agregarlo). Cada edición se revisa como un archivo importado y es un paso de deshacer.

## Las columnas

- **Nombre botánico**, **Nombre común**, **Tipo**, **Altura** y **Extensión** en la madurez (metros).
- **Separación** (de centro a centro) o **Densidad** (plantas por m²). Un arriate de un registro con densidad y sin separación se llena a esa densidad, con su propio patrón (triangular o cuadrado).
- **Tamaños suministrados**: una entrada por tamaño, separadas por `;`. Cada entrada es un id, un tipo (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) y luego cualquiera de: un volumen `10L`, una altura `h0.6`, una extensión `s0.4`, un perímetro del tronco `g14-16` (cm), un tallo libre `st1.8`. Ejemplo: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivares**: nombres separados por `;`. Un cultivar conserva sus propios tamaños y notas cuando el archivo importado los tenía.
- **Notas de especificación**.

{{ui:Duplicar}} copia una fila con una nueva clave; {{ui:Guardar como CSV}} y {{ui:Guardar como archivo de plantas}} escriben la lista (las filas CSV de los cultivares van debajo de su especie, con `cultivar_of`). Al importar un CSV o un archivo de plantas, se combina con la lista.

## Su propia lista de plantas de la Biblioteca

Inicie sesión en su cuenta de CadCraft (Configuración, Sus complementos, Iniciar sesión) y la tabla de plantas puede usar la lista que guarda en la Biblioteca:

- {{ui:De mi lista de la Biblioteca}} trae sus propios elementos de planta (incluidos los que aún esperan revisión). Una planta que ya tiene aquí se actualiza desde la Biblioteca; los cultivares, tamaños suministrados, densidad y especificación que agregó aquí se conservan.
- {{ui:Guardar como lista de plantas}} guarda cada fila como un elemento de planta propio en la Biblioteca, uno por especie: una planta nueva es un elemento nuevo, una planta modificada es una versión nueva, y una sin cambios no se toca. Marque primero la casilla: al guardar, las plantas pasan al público bajo CC0. La primera carga pública de una persona que aún no es de confianza la revisa una persona antes de que aparezca, como sucede con toda carga.

La Biblioteca guarda el registro básico de la planta. Los cultivares, tamaños suministrados, densidad y notas de especificación se quedan en el proyecto y en el archivo de plantas ({{ui:Guardar como archivo de plantas}}); el cuadro de diálogo indica cuántas filas se ven afectadas cada vez que guarda.

## Una planta colocada indica un tamaño

Seleccione una planta, un seto o una fila de mezcla de un arriate o de un área plantada: cuando el registro tiene cultivares o tamaños suministrados, {{ui:Cultivar y tamaño}} elige uno. El cuadro de plantas entonces cuenta por especie, cultivar y tamaño, y una etiqueta puede mostrarlos: `{botanical} '{cultivar}' {size}` o `{full}`.

## Símbolos de plantas por escala

{{ui:Gráficos de plantas}} (Paisajismo › Más) define cómo se dibujan las plantas en planta: **automático** (más grueso que 1:500, un círculo con la extensión; entre 1:200 y 1:500, un contorno con su centro; más fino, el símbolo detallado; ambas escalas pueden cambiarse) o un solo nivel para todas las escalas. El cuadro de Hojas tiene su propio **Detalle de plantas en planta** para ese juego.

En un registro de la sección Plantas, {{ui:Símbolo propio…}} lee un SVG, o un bloque de un dibujo DXF/DWG, y lo dibuja con la extensión de la planta en el nivel detallado. {{ui:Modelo 3D propio…}} lee un OBJ, STL o GLB; en Gráficos de plantas, elija **Modelo propio de cada registro** para verlo en 3D. Los archivos tienen límites (512 KB de SVG, 2000 formas, 50 000 triángulos) y se guardan en el proyecto. Las transformaciones de SVG no se aplican (se le avisa cuando un archivo las tiene). Consulte [Gráficos de plantas, símbolos propios y plantas en 3D](topic:plant-graphics) para los niveles, los límites y lo que puede contener un GLB.
