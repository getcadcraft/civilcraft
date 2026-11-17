---
title: Obxectos de forma libre
summary: Traia unha forma feita noutra aplicación (STL, OBJ ou un elemento da biblioteca) ao lugar; queda sobre o chan ou cortada nel, e o seu volume, superficie e pegada contanse como o resto.
keywords: forma libre, obxecto personalizado, escultura, xardinera, asento, malla, stl, obj, elemento de biblioteca, consciente do terreo, seguir o terreo, cortar o terreo, cantidades, volume, ifc
from: ec835f33
---

Un elemento único (unha xardinera, un muro de asento, unha escultura, un outeiro de xogo) pódese facer en ModelCraft ou PartCraft e colocar aquí para que estea no mesmo modelo e nos mesmos cuadros que o resto.

1. Paisaxe › {{ui:Máis}} › {{ui:Obxecto de forma libre…}} e escolla un ficheiro **STL** ou **OBJ** (nas unidades do proxecto: pés nun proxecto en pés, metros nun proxecto en metros) ou un **elemento da biblioteca** de CadCraft (`.json`) con corpo de malla.
2. Prema onde vai.

## A súa base

- **Segue o terreo**: a súa cota máis baixa queda sobre o terreo máis baixo baixo a súa pegada, así que nada flota. As propiedades estiman canto queda baixo o terreo.
- **Corta o terreo**: a súa base fíxase a unha cota e o terreo dentro da súa pegada nivélase ata ela con taludes de encontro, contado en Movemento de terras como unha plataforma.

Xírea co control **Xirado**, e arrástreo no plano para movelo.

## Contado

As propiedades dan o seu **volume** (para un sólido pechado), a **superficie**, a **pegada** e a **altura**, medidos desde a malla. A exportación IFC escríbeo coa **clase IFC** que escolla e esas cantidades.

:::note
A pegada é a envolvente convexa do contorno: unha forma cóncava (unha xardinera en forma de L) nivélase como se estivese recheada.
:::
