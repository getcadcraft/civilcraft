---
title: Archivos de estudio para otro programa de líneas (.DON)
summary: Guarda una línea aérea como archivo de estudio .DON, o lee los soportes de uno para crear una línea nueva. Sin probar con el programa que los lee.
keywords: don, .don, archivo de estudio, xml, exportar, importar, programa de líneas aéreas, tendido, cantón
from: 1abc4d07
---

Algunos programas de líneas aéreas guardan un estudio en un archivo `.DON` (texto XML). CivilCraft puede escribir una línea como ese archivo y leer los soportes de uno.

:::warning
**Sin probar.** Lo armamos a partir de una lista de nombres de campos del formato que compartió un usuario, no a partir de un archivo real, y no hemos abierto nuestros archivos en el programa que los lee. Ábrelo allí y verifica cada valor antes de confiar en él. Si puedes compartir un archivo `.DON` (sin los datos del cliente), nos ayuda a corregirlo.
:::

## Guardar un archivo de estudio

1. Asigna a la línea un conductor y asegúrate de que tenga resultados (sin "no calculado" en sus Propiedades).
2. {{ui:Más}} › {{ui:Guardar un archivo de estudio (.DON)…}}, elige la línea, agrega una descripción y un número de trabajo.
3. {{ui:Guardar el archivo de estudio}}.

El archivo contiene los soportes de la línea (coordenadas, terreno, alturas, roles, cruceta, el soporte conservado o sugerido, cargas por hipótesis de carga, cimiento), una sección por tramo entre fines de línea (conductor, tensión, vano de regulación, tramos, tensión y parámetro de catenaria, la tensión máxima por hipótesis de carga) y las tablas de tendido. Las longitudes van en metros y las fuerzas en daN; el texto se escribe en Latin-1, así que un carácter fuera de él se convierte en `?`.

## Leer un archivo de estudio

{{ui:Más}} › {{ui:Abrir un archivo de estudio (.DON)…}} lee los soportes en una línea nueva. El conductor, los soportes y las crucetas se asocian con tu biblioteca por nombre; lo que no se encuentre queda para que lo elijas en Propiedades.
