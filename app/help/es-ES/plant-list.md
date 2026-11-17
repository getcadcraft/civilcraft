---
title: La lista de plantas
summary: Unas 420 plantas comunes de clima templado y mediterráneo con sus tamaños, rusticidad, luz y agua, buscables en cualquier idioma, más su propia lista guardada con el proyecto.
keywords: lista de plantas, base de datos de plantas, especies, nombre botánico, nombre común, paleta de plantas, lista de vivero, zona de rusticidad, csv, importar plantas, exportar plantas, mis plantas, lista de árboles, lista de arbustos, plantas, biblioteca de plantas
from: 7ed09e7e
---

La sección **Plantas** del panel izquierdo muestra todas las plantas que puede colocar. Pulse una para ver sus tamaños y convertirla en la planta que usan **Planta**, **Zona** y **Seto**.

## Búsqueda y filtros

Escriba en **Buscar**: cualquier palabra del nombre de una planta en cualquier idioma (inglés, español, portugués), su nombre botánico, su tipo o una palabra de sus notas. Cada palabra que escriba debe coincidir, así que `quercus evergreen` encuentra los robles de hoja perenne. Los acentos no importan.

Reduzca la lista con **Tipo**, **Luz**, **Agua** y **Zona de rusticidad** (la zona USDA en la que está su sitio: una planta aparece cuando la zona está dentro de su rango).

## Lo que contiene una planta

| Campo | Significado |
|---|---|
| Tipo | Árbol, arbusto, seto, hierba (incluido el césped), vivaz, cubresuelos o trepadora |
| A madurez | Altura y extensión de la planta crecida en un jardín o en una calle, en metros |
| En plantación | El tamaño con el que se planta y su contenedor |
| Separación | Entre centros en un macizo o a lo largo de un seto |
| Zona de rusticidad | Las zonas USDA en las que suele sobrevivir al frío |
| Luz, agua, suelo | Lo que necesita |
| Notas | Usos y precauciones, como partes tóxicas o una planta que se extiende |

:::note
La lista integrada se escribió para CadCraft a partir de conocimientos hortícolas generales: tamaños típicos, redondeados. No es el catálogo de ningún vivero. Compruebe tamaños y rusticidad con un vivero local. Las plantas invasoras más conocidas de la península ibérica y de gran parte del mundo templado se omiten a propósito, y algunas que son invasoras en otros lugares llevan una nota.
:::

## Sus propias plantas

- **Añadir a la lista de este proyecto** copia una planta en la lista propia del proyecto, donde se guarda con el proyecto. Una planta de su lista sustituye a la integrada con la misma clave, así que puede cambiar sus tamaños para su región.
- **Importar una lista de plantas…** lee un CSV (o un archivo de plantas). El CSV necesita una columna con el nombre botánico y, idealmente, el tipo, la altura y la extensión; se admiten nombres de columna con sus propias palabras (Latin, Common name, Height, Spread, Width, Zone). Se leen comas, puntos y comas o tabuladores, y comas decimales. Los tamaños de plantación, las separaciones y los contenedores vacíos toman valores razonables según el tipo.
- **Exportar como CSV** guarda su lista (o, si no hay ninguna, las plantas que muestra la búsqueda) para abrirla en una hoja de cálculo.

Una lista de plantas se lee como cualquier archivo externo: lo que no se pueda usar se omite y se cuenta.

## Plantas en otras aplicaciones

La lista de plantas es una biblioteca única para todas las aplicaciones de CadCraft: BimCraft y ModelCraft tienen la misma lista, pero su propio Colocar desde biblioteca todavía no ofrece plantas. Hoy las plantas llegan a un modelo BIM a través del IFC de paisajismo de CivilCraft (cada planta es un `IfcGeographicElement`). Véase [Plantación](topic:planting#ifc).
