---
title: Recorreguts de gir de vehicles
summary: Feu conduir un vehicle amb fins a tres remolcs per una línia característica o un traçat, endavant o enrere, i vegeu l'àrea que escombra, les trajectòries de les rodes, la direcció i on es doblega.
keywords: recorregut de gir, trajectòria de gir, seguiment de vehicles, plantilla de gir, vehicle de disseny, camió, autobús, remolc, semiremolc, marxa enrere, retrocés, doblegament, articulació, límit de direcció, desviament, trajectòria de les rodes, moll de càrrega, radi de gir
from: 8caafb8a
---

Un recorregut de gir fa avançar un vehicle per una línia i mostra el terreny que el cos del vehicle sobrevola. Useu-lo per comprovar que un camió pot fer una cantonada, arribar a un moll de càrrega o fer marxa enrere amb un remolc sense sortir del paviment.

## Fes conduir un vehicle per una línia

1. Dibuixeu la línia que segueix el vehicle, en el sentit de la marxa: una línia característica (els arcs van bé: premeu {{key:C}} mentre la dibuixeu, vegeu [Línies característiques](topic:feature-lines)) o un traçat.
2. Seleccioneu-la i premeu {{ui:Recorregut de gir…}} a les seves **Propietats**.
3. Sota **Comença des de**, trieu un vehicle, i després establiu-ne les mides a partir del vostre vehicle de disseny: amplada, voladís davanter, distància entre eixos, voladís posterior, ample de via i **Límit de direcció**. Afegiu fins a tres remolcs, cadascun amb el punt on s'enganxa, la seva longitud des de l'enganxall fins al seu eix, els seus voladissos i la seva **Articulació màxima**.
4. Trieu **Conducció**: endavant o marxa enrere. Premeu {{ui:Condueix-lo}}.

:::warning
Els vehicles des dels quals començar són valors provisionals, no una norma. Establiu les mides a partir del vehicle de disseny que usa el projecte.
:::

## Endavant i marxa enrere

| Conducció | Què segueix la línia | Què calcula CivilCraft |
|---|---|---|
| **Endavant** | El centre de l'eix davanter | On van l'eix posterior i cada remolc, l'angle de direcció i l'articulació |
| **Marxa enrere** | El centre de l'últim eix (la part posterior del remolc) | On va cada unitat davant, i la direcció que necessita la cabina per posar el remolc allà |

Marxa enrere és com es comprova una maniobra de retrocés: digueu on ha d'anar el remolc, i CivilCraft diu si la cabina ho pot fer.

## Llegiu el resultat

El recorregut de gir es dibuixa al plànol en taronja: el seu contorn i, a traços, les trajectòries de les rodes més exteriors. Seleccioneu-lo (feu clic a dins) per veure a **Propietats**:

- **Longitud recorreguda**, el màxim angle de **Direcció** i l'**Articulació** respecte dels seus límits, i l'**Àrea escombrada**.
- Qualsevol problema al llarg de la línia, amb la seva distància: la direcció més enllà del límit, o un remolc que gira més enllà del seu límit d'articulació (es doblega).
- **El vehicle al llarg de la línia**: moveu el control lliscant per veure el vehicle en qualsevol punt, amb la seva direcció i articulació allà.

Si canvieu la línia, el recorregut de gir la segueix. {{ui:Edita el vehicle…}} canvia les mides; **Conducció** commuta entre endavant i marxa enrere. Cada canvi és un pas: {{key:Mod+Z}} el desfà. {{key:Delete}} suprimeix el recorregut de gir seleccionat (la línia es manté).

El contorn i les trajectòries de les rodes van al PDF, DXF i DWG a la capa C-ROAD-SWPT.

## Com es calcula

Cada unitat gira al voltant de la línia del seu eix posterior i és arrossegada pel punt que hi ha davant (l'eix davanter, o l'enganxall), el model de baixa velocitat sense lliscament que usen les comprovacions de recorregut de gir. L'àrea escombrada és el conjunt de tots els contorns del cos a cada posició. No modela la velocitat, el lliscament dels pneumàtics, el temps que triga la direcció a girar, els remolcs directius ni la distància lliure sota la carrosseria.
