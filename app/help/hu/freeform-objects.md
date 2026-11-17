---
title: Szabad formájú objektumok
summary: Vigyen a helyszínre egy másik alkalmazásban készült alakzatot (STL, OBJ vagy könyvtári elem); a talajra kerül, vagy belevágják a talajba, térfogatát, felületi területét és alapterületét pedig úgy számolják, mint a többi elemet.
keywords: szabad forma, egyedi objektum, szobor, virágláda, ülőke, háló, stl, obj, könyvtári elem, terepkövető, követi a terepet, belevágás a talajba, mennyiségek, térfogat, ifc
from: ec835f33
---

Egyszeri elemet (virágládát, ülőfalat, szobrot, játékdombot) a ModelCraft vagy a PartCraft programban lehet készíteni, és itt elhelyezni, hogy ugyanabban a modellben és kimutatásokban szerepeljen, mint minden más.

1. Tájrendezés › {{ui:Továbbiak}} › {{ui:Szabad formájú objektum…}}, és válasszon egy **STL** vagy **OBJ** fájlt (a projekt mértékegységeiben: láb alapú projektben lábban, méter alapú projektben méterben), vagy egy CadCraft **könyvtári elemet** (`.json`) háló testtel.
2. Kattintson arra a helyre, ahová kerüljön.

## Az alapja

- **Követi a terepet**: legalacsonyabb pontja a lenyomata alatti legalacsonyabb talajra kerül, így semmi nem lebeg. A tulajdonságok megbecslik, mennyi van belőle a talaj alatt.
- **Belevágja a talajt**: alapját egy adott magasságra állítjuk, és a lenyomatán belüli talaj kitermelési lejtőkkel erre a magasságra van igazítva; a Földmunkában platformként számít.

Forgassa a **Forgatás** gombbal, a mozgatáshoz húzza a terven.

## Számítva

A tulajdonságok megadják a **térfogatát** (zárt testnél), a **felületi területét**, az **alapterületét** és a **magasságát**, amelyeket a hálóból mérnek. Az IFC-exportálás a kiválasztott **IFC-osztállyal** és ezekkel a mennyiségekkel írja ki.

:::note
A lenyomat a körvonal konvex burka: egy homorú alak (egy L alakú virágláda) úgy számít, mintha ki lenne töltve.
:::
