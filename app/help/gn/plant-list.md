---
title: La lista de plantas
summary: Unas 420 plantas comunes de clima templado y mediterráneo, con sus tamaños, rusticidad, luz y agua, buscables en cualquier idioma, más tu propia lista guardada con el proyecto.
keywords: lista de plantas, base de datos de plantas, especie, nombre botánico, nombre común, paleta de plantas, lista de vivero, zona de rusticidad, csv, importar plantas, exportar plantas, mis plantas, lista de árboles, lista de arbustos, plantas, biblioteca de plantas
from: 7ed09e7e
---

La sección **Plantas** del panel izquierdo lista cada planta que usted puede colocar. Haga clic en una para ver sus tamaños y hacer que sea la planta que usan **Planta**, **Cantero** y **Seto**.

## Buscar y filtrar

Escriba en **Búsqueda**: cualquier palabra del nombre de una planta en cualquier idioma (inglés, español, portugués), su nombre botánico, su tipo o una palabra de sus notas. Cada palabra que escriba tiene que coincidir, así que `quercus evergreen` encuentra los robles perennes. Los acentos no importan.

Reduzca la lista con **Tipo**, **Luz**, **Agua** y **Zona de rusticidad** (la zona USDA donde está su sitio: una planta aparece si la zona está dentro de su rango).

## Qué datos tiene una planta

| Campo | Significado |
|---|---|
| Tipo | Árbol, arbusto, seto, pasto (incluye céspedes), perenne, cubresuelos o trepadora |
| A la madurez | Altura y diámetro de copa de la planta crecida en un jardín o una calle, en metros |
| En la plantación | El tamaño con que se coloca y su contenedor |
| Espaciamiento | De centro a centro en un cantero o a lo largo de un seto |
| Zona de rusticidad | Las zonas USDA en las que suele ser resistente |
| Luz, agua, suelo | Lo que necesita |
| Notas | Usos y precauciones, como partes tóxicas o una planta que se propaga mucho |

:::note
La lista incorporada se escribió para CadCraft con conocimiento hortícola general: tamaños típicos, redondeados. No es el catálogo de ningún vivero. Verifique tamaños y rusticidad con un vivero local. Las plantas invasoras más conocidas de Iberia y de buena parte del mundo templado se omiten a propósito, y unas pocas que son invasoras en algún lugar llevan una nota.
:::

## Sus propias plantas

- **Agregar a la lista de este proyecto** copia una planta a la lista propia del proyecto, donde se guarda con él. Una planta en su lista reemplaza a la incorporada con la misma clave, así que puede cambiar sus tamaños para su región.
- **Importar una lista de plantas…** lee un CSV (o un archivo de plantas). El CSV necesita una columna con el nombre botánico y, idealmente, tipo, altura y diámetro de copa; sirven nombres de columna en sus propias palabras (Latín, Nombre común, Altura, Diámetro, Ancho, Zona). Se leen comas, punto y coma o tabulaciones, y comas decimales. Los tamaños de plantación, espaciamientos y contenedores vacíos toman valores razonables según el tipo.
- **Exportar como CSV** guarda su lista (o, si no tiene, las plantas que muestra la búsqueda) para abrirla en una planilla de cálculo.

Una lista de plantas se lee como cualquier archivo externo: lo que no se puede usar se deja de lado y se cuenta.

## Plantas en otras aplicaciones

La lista de plantas es una sola biblioteca para todas las aplicaciones de CadCraft: BimCraft y ModelCraft tienen la misma lista, pero su propio Colocar desde biblioteca todavía no ofrece plantas. Hoy las plantas llegan a un modelo BIM por el IFC de paisajismo de CivilCraft (cada planta como un `IfcGeographicElement`). Ver [Plantación](topic:planting#ifc).
