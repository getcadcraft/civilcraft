---
title: Objectes lliures
summary: Porteu al lloc una forma feta en una altra aplicació (STL, OBJ o un element de biblioteca); se situa sobre el terreny o s'hi talla, i el seu volum, la seva àrea i la seva petjada es compten com la resta.
keywords: lliure, objecte personalitzat, escultura, jardinera, seient, malla, stl, obj, element de biblioteca, conscient del terreny, segueix el terreny, talla el terreny, quantitats, volum, ifc
from: ec835f33
---

Un element d'una sola vegada (una jardinera, un mur de seient, una escultura, un túmul de jocs) es pot fer a ModelCraft o PartCraft i col·locar aquí perquè quedi al mateix model i als mateixos quadres que la resta.

1. Paisatge › Més › {{ui:Objecte lliure…}} i trieu un fitxer **STL** o **OBJ** (en les unitats del projecte: peus en un projecte en peus, metres en un projecte en metres) o un **element de biblioteca** de CadCraft (`.json`) amb un cos de malla.
2. Feu clic on ha d'anar.

## La seva base

- **Segueix el terreny**: el seu punt més baix es col·loca sobre el terreny més baix sota la seva petjada, de manera que res no queda surant. Les propietats estimen quina part queda per sota del terreny.
- **Talla el terreny**: la seva base es fixa a una elevació, i el terreny dins de la seva petjada s'explana fins a aquesta elevació amb talussos fins al terreny, i es compta a Moviments de terres com una plataforma.

Gireu-lo amb **Gira**, i arrossegueu-lo al plànol per moure'l.

## Quantitats

Les propietats donen el seu **volum** (per a un sòlid tancat), la seva **àrea superficial**, la seva **petjada** i la seva **alçada**, mesurats a partir de la malla. L'exportació IFC l'escriu amb la **classe IFC** que trieu i aquestes quantitats.

:::note
La petjada és l'envolupant convexa del contorn: una forma còncava (una jardinera en forma de L) s'explana com si estigués omplerta.
:::
