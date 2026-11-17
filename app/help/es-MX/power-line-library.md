---
title: Su biblioteca de líneas eléctricas
summary: Cree sus propios conductores, cables subterráneos, apoyos, equipos y tipos de zanja, en categorías con nombre propio, y compártalos como archivos.
keywords: biblioteca, conductor, cable, poste, apoyo, cruceta, aislador, accesorio, retenida, tirante, transformador, gabinete, junta, zanja, categoría, csv, importar, exportar
from: 88733744
---

La sección **Biblioteca** del espacio de trabajo de líneas eléctricas contiene cada elemento que puede usar una línea o un cable. Nada en ella está ligado a un país ni a un fabricante: usted crea los elementos con los que trabaja.

## Tres tipos de elementos

| Tipo | Dónde está | ¿Se puede cambiar? |
|---|---|---|
| **Ejemplos** | Se incluyen con CivilCraft, con números genéricos que calculamos a partir de las propiedades de los materiales | No: primero {{ui:Copiar a mi biblioteca}} |
| **En el proyecto** | Vienen con el archivo de proyecto que abrió | No: primero {{ui:Copiar a mi biblioteca}} |
| **Míos** | Sus propios elementos, guardados en este navegador | Sí, y los cambios se guardan de inmediato |

Cada proyecto guarda una copia de cada elemento que usa, así que un proyecto se abre en cualquier computadora con sus propios conductores y postes.

:::warning
Los elementos de ejemplo son solo ejemplos: verifique cada número con los datos de su proveedor. Los cables subterráneos no tienen capacidad de corriente a propósito, porque depende de cómo se tienda el cable.
:::

## Crear un elemento

1. En **Biblioteca**, elija el **Tipo** (conductores aéreos, cables subterráneos, apoyos, equipos o tipos de zanja).
2. Haga clic en {{ui:Elemento nuevo}}, o elija un ejemplo y haga clic en {{ui:Copiar a mi biblioteca}} o en {{ui:Duplicar}}.
3. Complete sus campos. Los campos marcados con `*` son los que necesitan las verificaciones; un elemento al que le falte uno se marca con `!` y aparece en **Verificaciones** cuando una línea lo usa.
4. Asígnele una **Categoría**, con `/` entre niveles: `Aéreo/BT/Trenzado`, `Apoyos/Concreto/12 m`. El árbol sigue sus categorías.

Lo que necesita cada tipo:

| Tipo | Necesario para las verificaciones |
|---|---|
| Conductor aéreo | sección transversal, diámetro, masa por metro, resistencia a la rotura, módulo de elasticidad, dilatación térmica |
| Cable subterráneo | conductores, sección transversal, tensión, diámetro, resistencia, capacidad de corriente |
| Apoyo | longitud total, carga nominal (tomada en un punto debajo de la parte superior), profundidad en el terreno |
| Equipo | su tipo; una carga nominal para cruceta, accesorios y retenidas; separación entre fases y caída para crucetas; longitud para aisladores; el ángulo para retenidas |
| Tipo de zanja | profundidad, ancho, recubrimiento sobre los cables |

## Compartir

- {{ui:Guardar mi biblioteca}} guarda todos sus elementos en un solo archivo `.cclines.json`; {{ui:Abrir una biblioteca…}} lo vuelve a leer (los elementos con la misma clave se reemplazan).
- {{ui:Guardar como CSV}} guarda como hoja de cálculo el tipo que está viendo; {{ui:Abrir una biblioteca…}} lee de nuevo un CSV de ese tipo. Las columnas pueden venir en cualquier orden; un archivo separado por punto y coma puede usar coma decimal.
