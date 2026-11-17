---
title: Planos de plantación y cuadros de plantas
summary: Coloque plantas individuales, arriates de plantación llenos a la separación de las plantas con plantas mezcladas por porcentaje, y setos; etiquételos; cuéntelos en un cuadro de plantas para una hoja de cálculo o TakeoffCraft.
keywords: plano de plantación, cuadro de plantas, arriate de plantación, plantación masiva, seto, árbol, arbusto, cubresuelo, separación, separación triangular, conteo de plantas, cuantificaciones, etiquetas, copa, símbolos de plantas, ifc, cuantificación
from: ab49eab5
---

## Colocar plantas

1. Elija una planta en **Plantas** a la izquierda.
2. Haga clic en {{ui:Planta}} y luego en el plano: cada clic coloca una planta. Pulse {{key:Esc}} para terminar.

El símbolo de una planta se dibuja con su extensión en la madurez; Más › {{ui:Mostrar al tamaño de plantación}} dibuja cada planta con el tamaño en que se coloca. Los árboles se apoyan en el terreno bajo ellos: si después nivela el sitio, siguen el terreno. Para fijar una planta a una elevación, escríbala en **Elevación** en Propiedades.

## Arriates de plantación

1. Elija la planta principal, haga clic en {{ui:Arriate}} y haga clic en las esquinas del arriate. Pulse {{key:Enter}} (o haga clic de nuevo en la primera esquina) para cerrarlo.
2. El arriate se llena con esa planta a su separación, en un patrón **triangular** (el habitual: cada planta a la misma distancia de otras seis), a media separación del borde.
3. En Propiedades, **Agregar una planta** mezcla la planta elegida a la izquierda. Defina el **% de proporción** de cada planta: el arriate toma exactamente esa cantidad de cada una, repartida por todo el arriate. **Volver a mezclar** cambia la posición de cada una.

Si **Separación** está vacía, se usa la separación propia de las plantas (ponderada por sus proporciones); escriba una para usarla con todas las plantas. **Patrón** puede ser cuadrado, y **Filas a** gira las filas.

## Setos

Elija la planta del seto, haga clic en {{ui:Seto}}, haga clic a lo largo del seto y pulse {{key:Enter}}. Las plantas se colocan sobre la línea a su separación, centradas para que ambos extremos tengan el mismo margen. Un seto puede ser de **dos filas, escalonadas**, a una distancia fija.

## Etiquetas

Las plantas individuales se etiquetan con la configuración de etiquetas (`{name}` por defecto); escriba su propia etiqueta para una planta en Propiedades. Los arriates se etiquetan con el conteo de cada planta, y los setos con el suyo. Más › {{ui:Etiquetas de plantas}} activa y desactiva las etiquetas. Campos de etiqueta: `{name}`, `{botanical}`, `{size}` (el contenedor), `{qty}`, `{height}`, `{spread}`, `{container}`.

## El cuadro de plantas

Más › {{ui:Cuadro de plantas…}} cuenta cada planta por especie, de plantas individuales, arriates y setos juntos, con su tamaño de plantación. Guárdelo como **CSV** o **XLSX**, o **Enviar a TakeoffCraft**: un archivo de cuantificaciones que TakeoffCraft abre para valorar las plantas (con las cantidades de obra dura y de riego junto a ellas).

## IFC

Más › {{ui:Exportar IFC de paisajismo}} guarda el paisajismo como archivo IFC (IFC 4.3) que un modelo BIM puede contener: cada planta es un `IfcGeographicElement` de tipo VEGETATION, tipificado por su especie con las propiedades de la planta (nombre botánico, tamaños, rusticidad, agua, luz), y cada arriate y seto es un elemento con sus conteos, en el sitio. BimCraft lo abre junto al edificio.
