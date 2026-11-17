---
title: Tu biblioteca de líneas eléctricas
summary: Crea tus propios conductores, cables subterráneos, soportes, equipos y tipos de zanja, en categorías que nombras, y compártelos como archivos.
keywords: biblioteca, conductor, cable, poste, soporte, cruceta, aislador, accesorio, tensor, vientos, transformador, gabinete, empalme, zanja, categoría, csv, importar, exportar
from: 88733744
---

La sección **Biblioteca** del espacio de trabajo Líneas eléctricas contiene cada elemento que una línea o un cable puede usar. Nada en ella está atado a un país o a un fabricante: tú creas los elementos con los que trabajas.

## Tres tipos de elementos

| Tipo | Dónde está | ¿Se puede cambiar? |
|---|---|---|
| **Ejemplos** | Vienen con CivilCraft, con números genéricos que calculamos a partir de propiedades de materiales | No: primero {{ui:Copiar a mi biblioteca}} |
| **En el proyecto** | Vino con el archivo de proyecto que abriste | No: primero {{ui:Copiar a mi biblioteca}} |
| **Míos** | Tus propios elementos, guardados en este navegador | Sí, y los cambios se guardan al instante |

Cada proyecto guarda una copia de cada elemento que usa, así un proyecto se abre en cualquier computadora con sus propios conductores y postes.

:::warning
Los elementos de ejemplo son solo ejemplos: verifica cada número con los datos de tu proveedor. Los cables subterráneos no tienen corriente nominal a propósito, porque depende de cómo se tiende el cable.
:::

## Crear un elemento

1. En **Biblioteca**, elige el **Tipo** (conductores aéreos, cables subterráneos, soportes, equipos o tipos de zanja).
2. Haz click en {{ui:Elemento nuevo}}, o elige un ejemplo y haz click en {{ui:Copiar a mi biblioteca}} o {{ui:Duplicar}}.
3. Completa sus campos. Los campos marcados con `*` son los que necesitan las verificaciones; un elemento al que le falta uno se marca con `!` y aparece en **Verificaciones** cuando una línea lo usa.
4. Dale una **Categoría**, con `/` entre niveles: `Aéreo/BT/Trenzado`, `Soportes/Hormigón/12 m`. El árbol sigue tus categorías.

Lo que necesita cada tipo:

| Tipo | Necesario para las verificaciones |
|---|---|
| Conductor aéreo | sección transversal, diámetro, masa por metro, carga de rotura, módulo de elasticidad, dilatación térmica |
| Cable subterráneo | conductores, sección transversal, tensión, diámetro, resistencia, corriente nominal |
| Soporte | longitud total, carga nominal (tomada en un punto debajo de la cima), profundidad en el terreno |
| Equipo | su tipo; una carga nominal para crucetas, accesorios y vientos; separación de fases y caída para crucetas; longitud para aisladores; el ángulo para vientos |
| Tipo de zanja | profundidad, ancho, recubrimiento sobre los cables |

## Compartir

- {{ui:Guardar mi biblioteca}} guarda todos tus elementos en un solo archivo `.cclines.json`; {{ui:Abrir una biblioteca…}} lo vuelve a leer (los elementos con la misma clave se reemplazan).
- {{ui:Guardar como CSV}} guarda el tipo que estás viendo como planilla; {{ui:Abrir una biblioteca…}} lee de nuevo un CSV de ese tipo. Las columnas pueden venir en cualquier orden; un archivo separado por punto y coma puede usar coma decimal.
