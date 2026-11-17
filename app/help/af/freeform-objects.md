---
title: Vrye voorwerpe
summary: Bring 'n vorm wat in 'n ander app gemaak is (STL, OBJ of 'n biblioteekitem) na die terrein; dit staan op die grond of word daarin gesny, en sy volume, oppervlakte en voetspoor word soos die res getel.
keywords: vrye vorm, pasgemaakte voorwerp, beeldhouwerk, plantbak, sitplek, maas, stl, obj, biblioteekitem, terrein-bewus, volg die grond, sny in die grond, hoeveelhede, volume, ifc
from: ec835f33
---

'n Eenmalige kenmerk ('n plantbak, 'n sitmuur, 'n beeldhouwerk, 'n speelheuwel) kan in ModelCraft of PartCraft gemaak word en hier geplaas word, sodat dit in dieselfde model en skedules staan as alles anders.

1. Landskap › {{ui:Meer}} › {{ui:Vrye voorwerp…}} en kies 'n **STL**- of **OBJ**-lêer (in die projek se eenhede: voet in 'n voet-projek, meter in 'n meter-projek) of 'n CadCraft **biblioteekitem** (`.json`) met 'n maas-liggaam.
2. Klik waar dit heen moet.

## Die basis

- **Volg die grond**: sy laagste punt sit op die laagste grond onder sy voetspoor, so niks sweef nie. Eienskappe skat hoeveel daarvan onder die grond is.
- **Sny die grond**: sy basis word op 'n hoogte gestel en die grond binne sy voetspoor word met dagligte hellings tot daarby gegradeer, en as 'n platform in Grondwerk getel.

Draai dit met **Gedraai**, sleep dit op die plan om dit te skuif.

## Getel

Eienskappe gee sy **volume** (vir 'n geslote soliede liggaam), **oppervlakte**, **voetspoor** en **hoogte**, gemeet uit die maas. Die IFC-uitvoer skryf dit met die **IFC-klas** wat jy kies en daardie hoeveelhede.

:::note
Die voetspoor is die omtrek se konvekse omhulsel: 'n konkawe vorm (’n L-vormige plantbak) word gegradeer asof dit opgevul is.
:::
