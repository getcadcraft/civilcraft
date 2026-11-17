---
title: Planos de plantación y listados
summary: Colocar plantas sueltas, macizos plantados rellenos a la separación de las plantas con mezclas por porcentaje, y setos; etiquetarlos y contarlos en un listado de plantas para una hoja de cálculo o para TakeoffCraft.
keywords: plano de plantación, listado de plantas, macizo plantado, plantación en masa, seto, árbol, arbusto, cubresuelos, separación, separación triangular, recuento de plantas, mediciones, etiquetas, copa, símbolos de planta, ifc, takeoff
from: ab49eab5
---

## Colocar plantas

1. Elija una planta en **Plantas**, a la izquierda.
2. Pulse {{ui:Planta}} y luego pulse en el plano: cada clic coloca una planta. Pulse {{key:Esc}} para terminar.

El símbolo de una planta se dibuja con su extensión a madurez; Más › {{ui:Mostrar al tamaño de plantación}} dibuja cada planta con el tamaño con el que se planta. Los árboles se apoyan en el suelo bajo ellos: si después modela el terreno, lo siguen. Para fijar una planta a una cota, escríbala en **Cota**, en Propiedades.

## Macizos plantados

1. Elija la planta principal, pulse {{ui:Zona}} y pulse en las esquinas del macizo. Pulse {{key:Enter}} (o vuelva a pulsar la primera esquina) para cerrarlo.
2. El macizo se rellena con esa planta a su separación, en un patrón **triangular** (el habitual: cada planta a la misma distancia de otras seis), a media separación del borde.
3. En Propiedades, **Añadir una planta** mezcla la planta elegida a la izquierda. Ajuste el **% de proporción** de cada planta: el macizo ocupa exactamente esa cantidad de cada una, repartida por él. **Volver a mezclar** cambia su disposición.

Si la **Separación** está vacía se usa la propia de las plantas (ponderada por sus proporciones); escriba una para usarla con todas. El **Patrón** puede ser cuadrado, y **Ángulo de filas** gira las filas.

## Setos

Elija la planta del seto, pulse {{ui:Seto}}, pulse a lo largo del seto y pulse {{key:Enter}}. Las plantas van a lo largo de la línea a su separación, centradas de modo que ambos extremos tengan el mismo margen. Un seto puede ser de **dos filas, al tresbolillo**, a una distancia fijada.

## Etiquetas

Las plantas sueltas se etiquetan con el ajuste de etiqueta (`{name}` por defecto); escriba su propia etiqueta para una planta en Propiedades. Los macizos se etiquetan con el recuento de cada planta, y los setos con el suyo. Más › {{ui:Etiquetas de plantas}} activa y desactiva las etiquetas. Campos de etiqueta: `{name}`, `{botanical}`, `{size}` (el contenedor), `{qty}`, `{height}`, `{spread}`, `{container}`.

## El listado de plantas

Más › {{ui:Listado de plantas…}} cuenta cada planta por especie, sumando plantas sueltas, macizos y setos, con su tamaño de plantación. Guárdelo como **CSV** o **XLSX**, o pulse **Enviar a TakeoffCraft**: un archivo de mediciones que TakeoffCraft abre para valorar las plantas (junto con las cantidades de pavimento y riego).

## IFC

Más › {{ui:Exportar IFC de paisajismo}} guarda el paisajismo como archivo IFC (IFC 4.3) que un modelo BIM puede contener: cada planta es un `IfcGeographicElement` de tipo VEGETATION, tipificado por su especie con las propiedades de la planta (nombre botánico, tamaños, rusticidad, agua, luz), y cada macizo y cada seto es un elemento con sus recuentos, sobre el terreno. BimCraft lo abre junto al edificio.
