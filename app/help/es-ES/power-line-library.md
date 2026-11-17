---
title: Biblioteca de líneas eléctricas
summary: Cree sus propios conductores, cables subterráneos, apoyos, equipos y tipos de zanja, en categorías con nombre, y compártalos como archivos.
keywords: biblioteca, conductor, cable, poste, apoyo, cruceta, aislador, herraje, tirante, retenida, transformador, armario, empalme, zanja, categoría, csv, importar, exportar
from: 88733744
---

La sección **Biblioteca** del espacio de trabajo de líneas eléctricas contiene todos los elementos que puede usar una línea o un cable. Nada en ella está ligado a un país ni a un fabricante: usted crea los elementos con los que trabaja.

## Tres tipos de elementos

| Tipo | Dónde está | ¿Se puede modificar? |
|---|---|---|
| **Ejemplos** | Incluidos con CivilCraft, con valores genéricos que calculamos a partir de las propiedades de los materiales | No: primero {{ui:Copiar a mi biblioteca}} |
| **En el proyecto** | Vienen con el archivo del proyecto que abrió | No: primero {{ui:Copiar a mi biblioteca}} |
| **Propios** | Sus propios elementos, guardados en este navegador | Sí, y los cambios se guardan de inmediato |

Cada proyecto guarda una copia de cada elemento que usa, de modo que un proyecto se abre en cualquier equipo con sus propios conductores y postes.

:::warning
Los elementos de ejemplo son solo ejemplos: compruebe cada valor con los datos de su proveedor. Los cables subterráneos no tienen intensidad admisible a propósito, porque depende de cómo se tiendan.
:::

## Crear un elemento

1. En **Biblioteca**, elija el **Tipo** (conductores aéreos, cables subterráneos, apoyos, equipos o tipos de zanja).
2. Pulse {{ui:Elemento nuevo}}, o elija un ejemplo y pulse {{ui:Copiar a mi biblioteca}} o {{ui:Duplicar}}.
3. Rellene sus campos. Los campos marcados con `*` son los que necesitan las comprobaciones; un elemento que no tenga alguno se marca con `!` y aparece en **Comprobaciones** cuando una línea lo usa.
4. Asígnele una **Categoría**, con `/` entre niveles: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. El árbol sigue sus categorías.

Lo que necesita cada tipo:

| Tipo | Necesario para las comprobaciones |
|---|---|
| Conductor aéreo | sección, diámetro, masa por metro, carga de rotura, módulo de elasticidad, dilatación térmica |
| Cable subterráneo | número de conductores, sección, tensión, diámetro, resistencia, intensidad admisible |
| Apoyo | longitud total, carga nominal (tomada en un punto por debajo de la cabeza), profundidad en el terreno |
| Equipo | su tipo; una carga nominal para crucetas, herrajes y tirantes; separación entre fases y caída para crucetas; longitud para aisladores; ángulo para tirantes |
| Tipo de zanja | profundidad, anchura, recubrimiento sobre los cables |

## Compartirla

- {{ui:Guardar mi biblioteca}} guarda todos sus elementos en un único archivo `.cclines.json`; {{ui:Abrir una biblioteca…}} lo vuelve a leer (los elementos con la misma clave se reemplazan).
- {{ui:Guardar como CSV}} guarda el tipo que está viendo como hoja de cálculo; {{ui:Abrir una biblioteca…}} lee de nuevo un CSV de ese tipo. Las columnas pueden venir en cualquier orden; un archivo separado por punto y coma puede usar coma decimal.
