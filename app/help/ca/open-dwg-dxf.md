---
title: Obriu un DWG o DXF com a geometria
summary: Obriu la geometria del dibuix al plànol, capa per capa, useu-ne els contorns, les polilínies 3D i els contorns tancats per a la superfície, i convertiu-ne els blocs de punt en punts topogràfics.
keywords: comprovació topogràfica, cotes de text, dwg, dxf, cad, dibuix, geometria, contorns, línies de ruptura, límit, polilínia, polilínia 3D, capes, mapa base, topo, dibuix topogràfic, blocs, referències de bloc, punts topogràfics des de blocs, atributs, blocs de punt, punt d'inserció
from: da0f4c58
---

Un aixecament topogràfic sovint arriba com a dibuix: els contorns com a polilínies a la seva cota, les línies de ruptura com a polilínies 3D, el contorn del lloc com a polilínia tancada. CivilCraft obre l'**espai model** del dibuix com a capes al plànol, i pot convertir aquestes línies directament en la superfície.

## Obriu el dibuix

1. Feu clic a {{ui:Línies}} al grup **Superfície** (o a {{ui:Obre}}, o deixeu el fitxer al plànol) i trieu un fitxer `.dwg` o `.dxf`. El dibuix es llegeix en aquest ordinador; no es puja res. Es llegeixen els DWG de 2000 a 2018 i els DXF ASCII.
2. El diàleg **Línies** enumera les capes del dibuix que tenen línies, formes tancades o punts, i si tenen **cotes**. Les capes desactivades al dibuix comencen sense marcar. El text, les trames, les cotes i altres objectes que no són geometria es comptabilitzen i s'ometen (el diàleg indica quins).
3. Comproveu les **Unitats del dibuix**. Quan el dibuix indica les seves unitats, CivilCraft les converteix a les del projecte (mil·límetres a metres, metres a peus, polzades a peus). Un dibuix en peus es llegeix com a peus topogràfics dels EUA sense escalar: els dos difereixen en 2 parts per milió, i escalar les coordenades de plànol estatal amb això les desplaçaria uns peus. Quan el dibuix no indica les seves unitats, els seus números es llegeixen en les unitats del projecte; trieu les unitats correctes a la llista si no ho són.
4. A **{{ui:Usa per al model del terreny}}**, trieu què dona cada capa a la superfície (o deixeu **Només mostra-la**). Les capes amb noms de contorns (TOPO, CONT, CNTR) que tenen cotes comencen com a línies de ruptura.
5. Feu clic a {{ui:Afegeix}}. Les capes apareixen sota **Capes GIS** al panell esquerre; cada ús s'incorpora a la superfície. Cada part és un pas propi: {{key:Mod+Z}} les desfà una a una.

## Què pot donar cada tipus de capa

| La capa conté | Usa per a la superfície |
|---|---|
| Contorns (polilínies a una cota) | Línies de ruptura a la cota pròpia de les línies, o a la del camp ELEV |
| Polilínies 3D | Línies de ruptura a les seves pròpies cotes |
| Un contorn tancat | El límit de la superfície (la forma tancada més gran, o la que hàgiu seleccionat) |
| Punts amb una cota | Punts topogràfics, descrits amb el nom de la capa |
| Línies a cota 0 (geometria del plànol) | Res: es queda al plànol com a dibuix base |

Un dibuix que CivilCraft ha escrit conté les seves línies característiques com a polilínies 3D que recorden els seus arcs. El diàleg mostra aleshores **Línies característiques**: deixeu-la marcada per tornar-les com a línies característiques amb els seus arcs i usos (un pas de desfer), o desmarqueu-la per llegir-les com a geometria com qualsevol altra capa.

Més tard, useu {{ui:Usa per al model del terreny}} al menú de la capa sota **Capes GIS** per fer el mateix amb una capa que només havíeu mostrat.

## Punts topogràfics a partir de blocs

Els dibuixos topogràfics sovint porten els seus punts com a blocs: un símbol petit a cada punt de mesura, amb atributs per al número del punt, la descripció i la cota. Quan el dibuix té referències de bloc, el diàleg té una secció **Punts topogràfics a partir de blocs**:

1. Marqueu els blocs que voleu prendre (la taula indica quantes referències té cadascun, en quines capes i quins atributs), o marqueu capes per prendre totes les referències de bloc que hi siguin.
2. Trieu d'on venen el **número**, la **descripció** i la **cota** de cada punt: un atribut, el nom del bloc o de la capa, els números lliures següents, o la Z del punt d'inserció. CivilCraft comença pels atributs probables (PT, DESC, ELEV i similars), i pren la cota d'un atribut només quan els blocs són a zero.
3. Desmarqueu les capes de geometria si només voleu els punts, i després feu clic a {{ui:Afegeix}}.

Cada referència es converteix en un punt topogràfic al seu punt d'inserció. Només compten les referències col·locades a l'espai model; els blocs niats dins d'altres blocs no. Els números que ja hi ha al projecte, o que s'usen dues vegades al dibuix, reben números nous després del més alt, i un atribut de cota que no és un número deixa aquell punt sense cota; la barra d'estat ho compta tot. El dibuix no es modifica mai, i cada punt recorda el seu bloc: les seves Propietats mostren **Des del bloc** amb el bloc, la capa i l'identificador. Afegir els punts és un sol pas, de manera que {{key:Mod+Z}} els treu tots.

## Cotes escrites com a text, i la comprovació

Les cotes escrites com a text (o en un atribut de bloc que no és un bloc de punt topogràfic) no són geometria. La secció **Cotes topogràfiques i comprovació** les pot prendre com a punts topogràfics, i enumera el que sembla malament al dibuix: unitats, sistema de coordenades, distància a zero, contorns plans, cotes estranyes, punts duplicats. Vegeu [Comprova un dibuix topogràfic en importar-lo](topic:survey-check).

## Com es llegeix el dibuix

- Els arcs, cercles, el·lipses, segments de polilínia amb bombament i splines es converteixen en trossos rectes curts (cada 5° com a màxim).
- Les referències de bloc es dibuixen on estan col·locades, també els blocs niats; el que conté un bloc a la capa 0 pren la capa de la referència.
- Els objectes dibuixats en un altre pla (una direcció d'extrusió diferent) es col·loquen en coordenades del món.
- Cada objecte rep tres camps: LAYER, TYPE (el tipus d'objecte) i ELEV (la seva cota quan tots els seus punts en comparteixen una).
- Les coordenades es prenen tal com són: el dibuix ha d'usar les mateixes coordenades que el projecte (per exemple, la mateixa zona de plànol estatal). Els dibuixos enllaçats (xrefs) no s'obren: obriu-los per separat.

:::tip
Un dibuix de contorns dona la millor superfície amb algunes cotes puntuals en cims i en depressions, on només els contorns deixen triangles plans. Afegiu-les com a punts topogràfics, o des d'una capa de punts del dibuix.
:::
