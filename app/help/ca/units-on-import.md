---
title: Unitats en importar: un fitxer indica les seves unitats, o us ho pregunten abans
summary: Quan un dibuix o una malla que porteu a un projecte indica les seves unitats, CivilCraft les converteix i ho diu. Quan no ho indica, CivilCraft pregunta abans de llegir-lo i recorda la vostra resposta per a aquell fitxer.
keywords: unitats, importar, DWG, DXF, STL, OBJ, topografia, peus, peus d'agrimensura (US), metres, mil·límetres, escala, mida incorrecta, massa gran, massa petit, preguntar, recordat, INSUNITS, unitats del dibuix
from: 60921963
---

## Què farà

Porteu un fitxer a un projecte i assegureu-vos que entra a la mida correcta.

## Passos

1. Obriu el fitxer com de costum: {{ui:Obre}}, arrossegueu-lo al plànol, o useu l'ordre de dibuix CAD.
2. Si el fitxer indica les seves unitats, no es pregunta res: el diàleg d'importació les mostra com a **Tal com indica el dibuix**.
3. Si no, un diàleg pregunta les **Unitats de** el fitxer abans que s'obri el diàleg d'importació. Trieu quina és una unitat del fitxer i feu clic a {{ui:Fes servir aquestes unitats}}.
4. {{ui:Cancel·la}} (o {{key:Esc}}) omet el fitxer. No se n'hi llegeix res al projecte.

## Quins fitxers indiquen les unitats

- **DWG i DXF**: les unitats d'inserció del dibuix (`$INSUNITS`). Un fitxer sense elles es pregunta. La llista **Unitats del dibuix** del diàleg d'importació comença amb la vostra resposta i encara es pot canviar.
- **STL i OBJ** (formes lliures de paisatge): mai no indiquen unitats. Se us pregunta.
- **Llistes de punts** (CSV, TXT) i llistes de topografia de progrés: una llista que indica la seva unitat a les primeres línies es converteix, i la línia d'estat ho diu. Una que no n'indica cap es pregunta quan premeu {{ui:Importa}}, abans que entrin els punts. En canvi, les columnes de latitud i longitud passen pel sistema de coordenades.
- **El complement de núvols de punts**: pregunta quan construïu un núvol el fitxer del qual no indica cap unitat, i etiqueta els nombres del núvol amb la unitat que porta.
- **IFC i LandXML**: indiquen les seves unitats; es converteixen a les unitats del projecte.
- **LAS, LAZ i rasters d'elevació**: se situen pel seu sistema de coordenades; el diàleg del terreny demana la unitat d'elevació quan el fitxer no la indica.

## Bon de saber

- La resposta es recorda per a aquell fitxer en aquest ordinador, a totes les aplicacions de CadCraft. La propera vegada que entri, no se us pregunta.
- Per tornar a preguntar: la paleta d'ordres ({{key:Mod+K}}) › **Torna a preguntar les unitats dels fitxers importats**.
- Una llista indica una unitat que es llegeix de les seves primeres vuit línies: una línia com `units: ft`, o encapçalaments de columna que porten la mateixa unitat entre parèntesis, com `Elevation (m)`.
