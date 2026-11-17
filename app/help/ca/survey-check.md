---
title: Comprova un plànol topogràfic en importar-lo
summary: Llegiu les cotes escrites com a text o en atributs de blocs com a punts topogràfics, i comproveu un DWG o DXF per trobar unitats errònies, cap sistema de coordenades, un origen llunyà, corbes planes, cotes estranyes i punts duplicats abans de construir el terreny a partir d'ell.
keywords: comprovació topogràfica, comprovació en importar, cotes topogràfiques, cotes com a text, atributs, unitats, sistema de coordenades, lluny de l'origen, corbes a zero, valors atípics, punts duplicats, problemes, arquitecte paisatgista, plànol topogràfic
from: d46acd24
---

Un plànol topogràfic pot semblar correcte i no servir per a un terreny: les seves unitats poden ser suposades, les seves corbes poden estar planes a l'alçada 0, o les seves cotes poden estar escrites com a text que no és geometria. La secció **Cotes topogràfiques i revisió** del diàleg {{ui:Línies}} (vegeu [Obre un DWG o DXF com a línies](topic:open-dwg-dxf)) llegeix aquestes cotes i us indica què sembla malament abans d'afegir res.

## Cotes escrites com a text o en atributs

Molts plànols topogràfics donen una cota puntual com un petit text al costat d'una creu, com `104.37` o `EL 104.37`, o com un atribut d'un punt de bloc. Aquests no són línies, de manera que el lector de línies els deixa fora. La secció en llista quantes n'ha trobat i us deixa prendre-les com a **punts topogràfics**:

1. Marqueu **Pren … cotes com a punts topogràfics**. Comencen sense marcar, perquè no tot número d'un plànol és una alçada.
2. El text es llegeix quan és una cota per si sol: un número amb part decimal (`104.37`, `+104,37`, `-3.50`), o un número després de `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` o `LEVEL`, amb una `m`, `ft` o `'` opcional després. Un número enter sol (`12`) es llegeix com un número de parcel·la o de full, no com una cota; el text com `GATE 3` o una data mai no es llegeix. Els codis de format del text s'ignoren.
3. Per als atributs de blocs, trieu **Atribut de bloc que conté la cota**. CivilCraft troba per si mateix una etiqueta anomenada ELEV, Z, LEVEL, RL o similar; trieu-ne una altra de la llista si el plànol usa la seva pròpia. L'elecció es recorda per a aquest nom de fitxer en aquest ordinador, de manera que en tornar-lo a obrir comença amb la mateixa etiqueta. Una etiqueta que trieu també accepta números enters com a cotes.
4. Feu clic a {{ui:Afegeix}}. Els punts es numeren a partir del número més alt del projecte, cada punt es descriu amb la seva capa (o el seu bloc), i les alçades es converteixen a les unitats del projecte com la resta del plànol. Tot és un sol pas: {{key:Mod+Z}} els treu.

El text es troba al seu propi punt d'inserció (o al seu punt d'alineació quan en té un). El text dins dels blocs no es llegeix, i el plànol mai no es modifica.

## La comprovació

La comprovació s'executa sobre el que esteu a punt d'importar i enumera el que troba, una línia per cada tipus de problema:

| Diu | Què vol dir |
|---|---|
| **Unitats no indicades** | El plànol no diu quines són les seves unitats, de manera que els seus números es llegeixen com a unitats del projecte. Comproveu una distància que conegueu. |
| **Unitats convertides** | Les unitats del plànol són diferents de les del projecte i s'escalen (una nota, no un error). |
| **Les dades abasten … km** o **… m** | L'extensió és més gran que 200 km o més petita que mig metre, cosa que normalment indica una unitat equivocada (mil·límetres llegits com a metres, o al revés). |
| **Sense sistema de coordenades** | El projecte no en té cap. És un avís quan les dades són lluny de zero, com passa amb coordenades de plana d'estat o de quadrícula nacional. Vegeu [Sistemes de coordenades](topic:coordinate-systems). |
| **Lluny de l'origen** | Les dades són a més de 100 km de zero. Lluny de zero, les vistes 3D i les exportacions perden precisió i tremolen. |
| **La capa de corbes … no té alçada** | Una capa amb nom de corbes (TOPO, CONT, CNTR, CONTOUR) té línies a alçada 0, de manera que un terreny construït a partir d'elles seria pla. |
| **Cotes exactament 0** | Algunes cotes són 0 quan la cota típica n'és lluny: probablement falten alçades. |
| **Cotes lluny de la resta** | Algunes cotes són molt fora de les altres (es comparen amb el centre de totes les cotes, de manera que un pendent pronunciat amb un rang ampli no es marca), o per sobre de 9,000 m o per sota de -11,000 m. |
| **Punts sobre un altre punt** | Dos punts al mateix lloc amb la mateixa cota, o amb cotes diferents. |

Després de fer clic a {{ui:Afegeix}}, les mateixes línies passen a **Problemes**, una per tipus, amb el nom del fitxer, perquè hi pugueu tornar. La comprovació jutja el plànol; no hi canvia res, i no us impedeix usar-lo.

:::tip
Quan la comprovació diu que les corbes són planes a 0 i hi ha cotes escrites com a text, preneu les cotes com a punts topogràfics: sovint porten les alçades reals que les línies de corba no tenen.
:::

## Què no es comprova

La comprovació no compara el plànol amb un segon mesurament, i no pot saber en quin sistema de coordenades és el plànol: només indica que no n'hi ha cap d'establert.
