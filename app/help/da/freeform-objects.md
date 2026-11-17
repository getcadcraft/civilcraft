---
title: Frit formede objekter
summary: Før en form lavet i et andet program (STL, OBJ eller et biblioteksemne) ind på projektet; den står på terrænet eller skæres ned i det, og dens volumen, areal og fodaftryk tælles ligesom resten.
keywords: frit formet, brugerdefineret objekt, skulptur, plantekasse, bænk, net, stl, obj, biblioteksemne, terrænbevidst, følg terrænet, skær ned i terrænet, mængder, volumen, ifc
from: ec835f33
---

Et engangsfeature (en plantekasse, en siddemur, en skulptur, en legebakke) kan laves i ModelCraft eller PartCraft og placeres her, så det står i samme model og lister som alt andet.

1. Landskab › Mere › {{ui:Frit objekt…}} og vælg en **STL**- eller **OBJ**-fil (i projektets enheder: fod i et fodprojekt, meter i et meterprojekt) eller et CadCraft-**biblioteksemne** (`.json`) med et netlegeme.
2. Klik, hvor det skal stå.

## Dets underlag

- **Følger terrænet**: dets laveste punkt står på det laveste terræn under dets fodaftryk, så intet svæver. Egenskaber anslår, hvor meget af det der er under terrænet.
- **Skærer ned i terrænet**: dets underlag sættes til en kote, og terrænet inden for dets fodaftryk planeres til den med skæringsskråninger og tælles i Jordarbejde ligesom et plateau.

Drej det med **Drejning**, og træk det på planen for at flytte det.

## Optælles

Egenskaber giver dets **volumen** (for et lukket legeme), **overfladeareal**, **fodaftryk** og **højde**, målt ud fra netten. IFC-eksporten skriver det med den **IFC-klasse**, du vælger, og disse mængder.

:::note
Fodaftrykket er omridsets konvekse hylster: en konkav form (en L-formet plantekasse) planeres, som om den var udfyldt.
:::
