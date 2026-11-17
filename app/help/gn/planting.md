---
title: Planos de plantación y planillas
summary: Colocar plantas sueltas, canteros de plantación llenados según el espaciamiento de las plantas con mezclas por porcentaje, y setos; rotularlos; contarlos en una planilla de plantas para una planilla de cálculo o TakeoffCraft.
keywords: plano de plantación, planilla de plantas, cantero de plantación, plantación masiva, seto, árbol, arbusto, cubresuelos, espaciamiento, espaciamiento triangular, conteo de plantas, cómputos, rótulos, copa, símbolos de planta, ifc, takeoff
from: ab49eab5
---

## Colocar plantas

1. Elija una planta en **Plantas**, a la izquierda.
2. Haga clic en {{ui:Plant}}, y luego clic en el plano: cada clic coloca una planta. Presione {{key:Esc}} para parar.

El símbolo de una planta se dibuja con el diámetro de copa a la madurez; Más › {{ui:Show at planting size}} dibuja cada planta con el tamaño con que se coloca. Los árboles se apoyan en el suelo bajo su copa: si después nivela el sitio, siguen al terreno. Para fijar una planta a una elevación, escríbala en **Elevación** en Propiedades.

## Canteros de plantación

1. Elija la planta principal, haga clic en {{ui:Bed}} y haga clic en las esquinas del cantero. Presione {{key:Enter}} (o haga clic de nuevo en la primera esquina) para cerrarlo.
2. El cantero se llena con esa planta según su espaciamiento, en un patrón **triangular** (el habitual: cada planta a la misma distancia de otras seis), a media separación del borde.
3. En Propiedades, **Agregar una planta** mezcla la planta elegida a la izquierda. Defina el **% de participación** de cada planta: el cantero toma exactamente esa proporción de cada una, repartida por todo el cantero. **Volver a mezclar** cambia dónde van.

Si **Espaciamiento** está vacío se usa el espaciamiento propio de las plantas (ponderado por sus proporciones); escriba uno para usarlo con todas las plantas. El **Patrón** puede ser cuadrado, y **Filas a** gira las filas.

## Setos

Elija la planta del seto, haga clic en {{ui:Hedge}}, haga clic a lo largo del seto y presione {{key:Enter}}. Las plantas van a lo largo de la línea según su espaciamiento, centradas para que ambos extremos tengan el mismo margen. Un seto puede ser de **dos filas, alternadas**, a una distancia fija.

## Rótulos

Las plantas sueltas se rotulan con la configuración de rótulo (`{name}` por defecto); escriba su propio rótulo para una planta en Propiedades. Los canteros se rotulan con el conteo de cada planta, los setos con el suyo. Más › {{ui:Plant labels}} activa o desactiva los rótulos. Campos de rótulo: `{name}`, `{botanical}`, `{size}` (el contenedor), `{qty}`, `{height}`, `{spread}`, `{container}`.

## La planilla de plantas

Más › {{ui:Plant schedule…}} cuenta cada planta por especie, sumando plantas sueltas, canteros y setos, con su tamaño de plantación. Guárdela como **CSV** o **XLSX**, o **Enviar a TakeoffCraft**: un archivo de cómputos que TakeoffCraft abre para valorar las plantas (con los cómputos de duros e riego al lado).

## IFC

Más › {{ui:Export landscape IFC}} guarda el paisajismo como un archivo IFC (IFC 4.3) que un modelo BIM puede contener: cada planta como un `IfcGeographicElement` de tipo VEGETATION, tipificada por su especie con las propiedades de la planta (nombre botánico, tamaños, rusticidad, agua, luz), y cada cantero y seto como un elemento con sus conteos, en el sitio. BimCraft lo abre junto al edificio.
