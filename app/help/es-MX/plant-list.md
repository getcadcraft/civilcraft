---
title: La lista de plantas
summary: Unas 420 plantas comunes de clima templado y mediterráneo con sus tamaños, rusticidad, luz y agua, con búsqueda en cualquier idioma, más su propia lista guardada con el proyecto.
keywords: lista de plantas, base de datos de plantas, especies, nombre botánico, nombre común, paleta de plantas, lista de vivero, zona de rusticidad, csv, importar plantas, exportar plantas, mis plantas, lista de árboles, lista de arbustos, biblioteca de plantas
from: 7ed09e7e
---

La sección **Plantas** del panel izquierdo muestra cada planta que puede colocar. Haga clic en una para ver sus tamaños y hacer que sea la planta que usan **Planta**, **Arriate** y **Seto**.

## Buscar y filtrar

Escriba en **Buscar**: cualquier palabra del nombre de una planta en cualquier idioma (inglés, español, portugués), su nombre botánico, su tipo o una palabra de sus notas. Cada palabra que escriba debe coincidir, así que `quercus evergreen` encuentra los robles de hoja perenne. Los acentos no importan.

Reduzca la lista con **Tipo**, **Luz**, **Agua** y **Zona de rusticidad** (la zona USDA donde está su sitio: una planta aparece si la zona está dentro de su rango).

## Lo que contiene una planta

| Campo | Significado |
|---|---|
| Tipo | Árbol, arbusto, seto, pasto (incluidos los céspedes), perenne, cubresuelo o trepadora |
| En la madurez | Altura y extensión de la planta crecida en un jardín o una calle, en metros |
| En la plantación | El tamaño con que se coloca y su contenedor |
| Separación | De centro a centro en un arriate o a lo largo de un seto |
| Zona de rusticidad | Las zonas USDA donde suele resistir |
| Luz, agua, suelo | Lo que necesita |
| Notas | Usos y precauciones, como partes tóxicas o una planta que se propaga |

:::note
La lista integrada se escribió para CadCraft a partir de conocimiento hortícola general: tamaños típicos, redondeados. No es el catálogo de ningún vivero. Verifique tamaños y rusticidad con un vivero local. Las plantas invasoras más conocidas de la península ibérica y de buena parte del mundo templado se omiten a propósito, y algunas que son invasoras en alguna región llevan una nota.
:::

## Sus propias plantas

- **Agregar a la lista de este proyecto** copia una planta a la lista propia del proyecto, donde se guarda con él. Una planta en su lista reemplaza a la integrada con la misma clave, así que puede cambiar sus tamaños para su región.
- **Importar una lista de plantas…** lee un CSV (o un archivo de plantas). El CSV necesita una columna con el nombre botánico y, idealmente, tipo, altura y extensión; también funcionan nombres de columna con sus propias palabras (Latín, Nombre común, Altura, Extensión, Ancho, Zona). Se leen comas, punto y coma o tabuladores, y comas decimales. Los tamaños de plantación, separaciones y contenedores vacíos toman valores razonables según el tipo.
- **Exportar como CSV** guarda su lista (o, si no tiene ninguna, las plantas que muestra la búsqueda) para abrirla en una hoja de cálculo.

Una lista de plantas se lee como cualquier archivo externo: lo que no pueda usarse se omite y se cuenta.

## Plantas en otras aplicaciones

La lista de plantas es una biblioteca única para todas las aplicaciones de CadCraft: BimCraft y ModelCraft tienen la misma lista, pero su propio Colocar desde la biblioteca todavía no ofrece plantas. Hoy las plantas llegan a un modelo BIM mediante el IFC de paisajismo de CivilCraft (cada planta como un `IfcGeographicElement`). Consulte [Plantación](topic:planting#ifc).
