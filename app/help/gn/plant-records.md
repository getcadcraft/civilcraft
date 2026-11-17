---
title: Registros de plantas, cultivares y tamaños suministrados
summary: La lista propia de plantas del proyecto como tabla: cultivares, tamaños suministrados (contenedor, cepellón, perímetro, tronco libre), densidad, notas de especificación, CSV de entrada y salida; cada planta colocada indica un tamaño; símbolos de planta según escala y tus propios símbolos y modelos 3D.
keywords: tabla de plantas, base de datos de plantas, cultivar, variedad, tamaño suministrado, contenedor, cepellón, raíz desnuda, perímetro, tronco libre, densidad, plantas por metro cuadrado, especificación, notas de especificación, símbolo de planta, bloque, símbolo propio, planta 3d, nivel de detalle, escala
from: 12251beb
---

Abra {{ui:Plant table}} desde el menú {{ui:More}} del grupo Paisajismo, o desde la sección Plantas. Cada fila es un registro de planta en la lista propia de este proyecto (un registro de la lista de plantas se copia al agregarlo). Cada edición se verifica como un archivo importado y es un paso de deshacer.

## Las columnas

- **Nombre botánico**, **Nombre común**, **Tipo**, **Altura** y **Diámetro** a la madurez (metros).
- **Espaciamiento** (de centro a centro) o **Densidad** (plantas por m²). Un cantero de un registro con densidad y sin espaciamiento se llena a esa densidad, con su propio patrón (triangular o cuadrado).
- **Tamaños suministrados**: una entrada por tamaño, separadas por `;`. Cada entrada es un identificador, un tipo (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) y luego cualquiera de: un volumen `10L`, una altura `h0.6`, un diámetro `s0.4`, un perímetro `g14-16` (cm), un tronco libre `st1.8`. Ejemplo: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivares**: nombres separados por `;`. Un cultivar conserva sus propios tamaños y notas cuando el archivo importado los tenía.
- **Notas de especificación**.

{{ui:Duplicate}} copia una fila con una clave nueva; {{ui:Save as CSV}} y {{ui:Save as a plants file}} escriben la lista (las filas CSV de los cultivares van debajo de su especie, con `cultivar_of`). Importar un CSV o un archivo de plantas lo combina con la lista.

## Su propia lista de plantas de la Biblioteca

Ingrese a su cuenta de CadCraft (Configuración, Sus complementos, Ingresar) y la tabla de plantas puede usar la lista que guarda en la Biblioteca:

- {{ui:From my Library list}} trae sus propios elementos de planta (también los que todavía esperan revisión). Una planta que ya tiene aquí se actualiza desde la Biblioteca; los cultivares, tamaños suministrados, densidad y especificación que agregó aquí se conservan.
- {{ui:Save as a plant list}} guarda cada fila como un elemento de planta propio en la Biblioteca, un elemento por especie: una planta nueva es un elemento nuevo, una planta modificada es una versión nueva, y una sin cambios se deja tal cual. Marque la casilla antes: al guardar, las plantas pasan al público bajo CC0. Una primera subida pública de una persona que todavía no es de confianza la revisa una persona antes de que aparezca, como toda subida.

La Biblioteca guarda el registro básico de la planta. Los cultivares, tamaños suministrados, densidad y notas de especificación quedan en el proyecto y en el archivo de plantas ({{ui:Save as a plants file}}); el diálogo indica cuántas filas afecta cada vez que guarda.

## Una planta colocada indica un tamaño

Seleccione una planta, un seto, o una fila de mezcla de un cantero o área plantada: cuando el registro tiene cultivares o tamaños suministrados, {{ui:Cultivar and size}} elige uno. La planilla de plantas entonces cuenta por especie, cultivar y tamaño, y un rótulo puede mostrarlos: `{botanical} '{cultivar}' {size}` o `{full}`.

## Símbolos de planta según escala

{{ui:Plant graphics}} (Paisajismo › Más) define cómo se dibujan las plantas en planta: **automático** (más grueso que 1:500, un círculo del diámetro de copa; entre 1:200 y 1:500, un contorno con su centro; más fino, el símbolo detallado; se pueden cambiar ambas escalas) o un solo nivel para todas las escalas. El diálogo Hojas tiene su propio **Detalle de planta en plano** para ese juego.

En un registro de la sección Plantas, {{ui:Own symbol…}} lee un SVG, o un bloque de un dibujo DXF/DWG, y lo dibuja con el diámetro de copa de la planta en el nivel detallado. {{ui:Own 3D model…}} lee un OBJ, STL o GLB; en Gráficos de plantas elija **Modelo propio de cada registro** para verlo en 3D. Los archivos tienen límites (512 KB de SVG, 2000 formas, 50 000 triángulos) y se guardan en el proyecto. Las transformaciones del SVG no se aplican (se le avisa cuando un archivo las tiene). Ver [Gráficos de plantas, sus propios símbolos y plantas en 3D](topic:plant-graphics) para los niveles, los límites y lo que puede tener un GLB.
