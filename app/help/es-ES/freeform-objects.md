---
title: Objetos de forma libre
summary: Traiga al emplazamiento una forma hecha en otra aplicación (STL, OBJ o un elemento de biblioteca); se apoya en el terreno o se corta en él, y su volumen, área y huella se cuentan como el resto.
keywords: forma libre, objeto personalizado, escultura, jardinera, asiento, malla, stl, obj, elemento de biblioteca, consciente del terreno, seguir el terreno, cortar el terreno, mediciones, volumen, ifc
from: ec835f33
---

Un elemento único (una jardinera, un muro-asiento, una escultura, un montículo de juego) puede hacerse en ModelCraft o PartCraft y colocarse aquí, para que esté en el mismo modelo y en las mismas tablas de cantidades que todo lo demás.

1. Paisajismo › Más › {{ui:Objeto de forma libre…}} y elija un archivo **STL** u **OBJ** (en las unidades del proyecto: pies en un proyecto en pies, metros en un proyecto en metros) o un **elemento de biblioteca** de CadCraft (`.json`) con un cuerpo de malla.
2. Haga clic donde irá.

## Su base

- **Sigue el terreno**: su punto más bajo se apoya en el terreno más bajo bajo su huella, de modo que nada flota. Las propiedades estiman qué parte queda bajo el terreno.
- **Corta el terreno**: su base se fija a una cota, y el terreno dentro de su huella se nivela hasta ella con taludes de corte y relleno, y se cuenta en el **Movimiento de tierras** como una plataforma.

Gírelo con **Girar**, y arrástrelo en la planta para moverlo.

## Cómputo

Las propiedades dan su **volumen** (para un sólido cerrado), su **área de superficie**, su **huella** y su **altura**, medidos a partir de la malla. La exportación IFC lo escribe con la **clase IFC** que elija y con esas mediciones.

:::note
La huella es el contorno convexo: una forma cóncava (una jardinera en L) se nivela como si estuviera rellena.
:::
