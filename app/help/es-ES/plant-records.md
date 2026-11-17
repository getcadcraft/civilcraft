---
title: Registros de plantas, cultivares y tamaños suministrados
summary: La lista de plantas propia del proyecto como tabla: cultivares, tamaños suministrados (contenedor, cepellón, perímetro, tronco libre), densidad, notas de especificación, CSV de entrada y salida; cada planta colocada indica un tamaño; símbolos de planta por escala y sus propios símbolos y modelos 3D.
keywords: tabla de plantas, base de datos de plantas, cultivar, variedad, tamaño suministrado, contenedor, cepellón, raíz desnuda, perímetro, tronco libre, densidad, plantas por metro cuadrado, especificación, notas de especificación, símbolo de planta, bloque, símbolo propio, planta 3D, nivel de detalle, escala
from: 12251beb
---

Abra {{ui:Tabla de plantas}} desde el menú {{ui:Más}} del grupo Paisajismo, o desde la sección Plantas. Cada fila es un registro de planta en la lista propia de este proyecto (un registro de la lista de plantas se copia al añadirlo). Cada edición se comprueba como si fuera un archivo importado, y es un solo paso de deshacer.

## Las columnas

- **Nombre botánico**, **Nombre común**, **Tipo**, **Altura** y **Extensión** a madurez (metros).
- **Separación** (entre centros) o **Densidad** (plantas por m²). Un macizo de un registro con densidad y sin separación se rellena a esa densidad, con su propio patrón (triangular o cuadrado).
- **Tamaños suministrados**: una entrada por tamaño, separadas por `;`. Cada entrada es un identificador, un tipo (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) y después cualquiera de estos: un volumen `10L`, una altura `h0.6`, una extensión `s0.4`, un perímetro `g14-16` (cm), un tronco libre `st1.8`. Ejemplo: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivares**: nombres separados por `;`. Un cultivar conserva sus propios tamaños y notas cuando el archivo importado los tenía.
- **Notas de especificación**.

{{ui:Duplicar}} copia una fila con una clave nueva; {{ui:Guardar como CSV}} y {{ui:Guardar como archivo de plantas}} escriben la lista (las filas CSV de los cultivares van bajo su especie, con `cultivar_of`). Al importar un CSV o un archivo de plantas, se fusiona con la lista.

## Su propia lista de la Biblioteca

Inicie sesión en su cuenta de CadCraft (Configuración, Tus complementos, Iniciar sesión) y la tabla de plantas puede usar la lista que guarda en la Biblioteca:

- {{ui:Desde mi lista de la biblioteca}} trae sus propios elementos de planta (también los que aún esperan revisión). Una planta que ya tiene aquí se actualiza desde la Biblioteca; se conservan los cultivares, los tamaños suministrados, la densidad y la especificación que añadió aquí.
- {{ui:Guardar como lista de plantas}} guarda cada fila como un elemento de planta propio en la Biblioteca, un elemento por especie: una planta nueva es un elemento nuevo, una planta modificada es una versión nueva, y una sin cambios se deja como está. Marque primero la casilla: al guardar, las plantas pasan a ser públicas bajo CC0. La primera subida pública de una persona que aún no es de confianza la revisa una persona antes de que aparezca, como cualquier subida.

La Biblioteca guarda el registro básico de la planta. Los cultivares, los tamaños suministrados, la densidad y las notas de especificación permanecen en el proyecto y en el archivo de plantas ({{ui:Guardar como archivo de plantas}}); el diálogo indica cuántas filas afecta cada vez que guarda.

## Una planta colocada indica un tamaño

Seleccione una planta, un seto o una fila de mezcla de un macizo o de un área plantada: cuando el registro tiene cultivares o tamaños suministrados, {{ui:Cultivar y tamaño}} elige uno. El listado de plantas cuenta entonces por especie, cultivar y tamaño, y una etiqueta puede mostrarlos: `{botanical} '{cultivar}' {size}` o `{full}`.

## Símbolos de planta por escala

{{ui:Representación de plantas}} (Paisajismo › Más) define cómo se dibujan las plantas en planta: **automático** (más grosero que 1:500, un círculo con la extensión; entre 1:200 y 1:500, un contorno con su centro; más fino, el símbolo detallado; se pueden cambiar ambas escalas) o un nivel para todas las escalas. El diálogo de Hojas tiene su propio **Detalle de plantas en planta** para ese juego.

En un registro de la sección Plantas, {{ui:Símbolo propio…}} lee un SVG, o un bloque de un dibujo DXF/DWG, y lo dibuja con la extensión de la planta en el nivel detallado. {{ui:Modelo 3D propio…}} lee un OBJ, STL o GLB; en Representación de plantas, elija **El modelo propio de cada registro** para verlo en 3D. Los archivos tienen límites (512 KB de SVG, 2000 formas, 50 000 triángulos) y se guardan en el proyecto. No se aplican las transformaciones de SVG (se le avisa cuando un archivo las tiene). Véase [Representación de plantas, símbolos propios y plantas en 3D](topic:plant-graphics) para los niveles, los límites y lo que puede contener un GLB.
