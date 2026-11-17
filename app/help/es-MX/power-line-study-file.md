---
title: Archivos de estudio para otro programa de líneas (.DON)
summary: Guarde una línea aérea como archivo de estudio .DON, o lea los apoyos de uno para crear una línea nueva. Sin probar con el programa que los lee.
keywords: don, .don, archivo de estudio, xml, exportar, importar, programa de líneas aéreas, tendido, canton
from: 1abc4d07
---

Algunos programas de líneas aéreas guardan un estudio en un archivo `.DON` (texto XML). CivilCraft puede escribir una línea como ese archivo y leer los apoyos de uno.

:::warning
**Sin probar.** Lo construimos a partir de una lista de nombres de campos del formato que compartió un usuario, no a partir de un archivo real, y todavía no hemos abierto nuestros archivos en el programa que los lee. Ábralo allí y verifique cada valor antes de confiar en él. Si puede compartir un archivo `.DON` (sin los datos del cliente), nos ayuda a corregir esto.
:::

## Guardar un archivo de estudio

1. Asigne a la línea un conductor y asegúrese de que tenga resultados (sin «no calculado» en sus Propiedades).
2. {{ui:Más}} › {{ui:Guardar un archivo de estudio (.DON)…}}, elija la línea, y agregue una descripción y un número de trabajo.
3. {{ui:Guardar el archivo de estudio}}.

El archivo contiene los apoyos de la línea (coordenadas, terreno, alturas, funciones, cruceta, el apoyo conservado o sugerido, cargas por caso de carga, cimentación), una sección por tramo entre anclajes terminales (conductor, tensión, vano regulador, vanos, tensión y parámetro de catenaria, la mayor tensión por caso de carga) y las tablas de tendido. Las longitudes están en metros y las fuerzas en daN; el texto se escribe en Latin-1, así que un carácter fuera de ese juego se convierte en `?`.

## Leer un archivo de estudio

{{ui:Más}} › {{ui:Abrir un archivo de estudio (.DON)…}} lee los apoyos en una línea nueva. El conductor, los apoyos y las crucetas se asocian a su biblioteca por nombre; lo que no se encuentre queda para que lo elija en Propiedades.
