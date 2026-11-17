---
title: Objetos de forma libre
summary: Traiga al sitio una forma hecha en otra aplicación (STL, OBJ o un elemento de biblioteca); se apoya sobre el terreno o se corta en él, y su volumen, área y huella se cuentan como el resto.
keywords: forma libre, objeto personalizado, escultura, jardinera, banca, malla, stl, obj, elemento de biblioteca, consciente del terreno, seguir el terreno, cortar el terreno, cantidades, volumen, ifc
from: ec835f33
---

Un elemento único (una jardinera, un muro de asiento, una escultura, un montículo de juego) puede hacerse en ModelCraft o PartCraft y colocarse aquí para que quede en el mismo modelo y en los mismos cómputos que todo lo demás.

1. Paisajismo › Más › {{ui:Objeto de forma libre…}} y elija un archivo **STL** u **OBJ** (en las unidades del proyecto: pies en un proyecto en pies, metros en un proyecto en metros) o un **elemento de biblioteca** de CadCraft (`.json`) con un cuerpo de malla.
2. Haga clic donde irá.

## Su base

- **Sigue al terreno**: su punto más bajo se apoya en el terreno más bajo bajo su huella, así que nada flota. Las propiedades estiman cuánto de él queda bajo el terreno.
- **Corta el terreno**: su base se fija a una elevación y el terreno dentro de su huella se nivela hasta ella con taludes de liga, y se cuenta en **Movimiento de tierras** como una plataforma.

Gírelo con **Girado** y arrástrelo en la planta para moverlo.

## Contado

Las **Propiedades** dan su **volumen** (para un sólido cerrado), **área de superficie**, **huella** y **altura**, medidos a partir de la malla. La exportación IFC lo escribe con la **clase IFC** que elija y esas cantidades.

:::note
La huella es la envolvente convexa del contorno: un objeto cóncavo (una jardinera en forma de L) se nivela como si estuviera lleno.
:::
